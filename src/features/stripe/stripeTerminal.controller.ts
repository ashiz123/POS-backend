import { Request, Response, NextFunction } from "express";
import { stripe } from "./stripeClient";
import Stripe from "stripe";
import { container } from "tsyringe";
import { IOrderService } from "../order/order.type";
import { TOKENS } from "../../config/tokens";
import { OrderService } from "../order/order.service";
import { ChargePaymentDTO } from "./stripePayment.type";
import { StripeMapper } from "./stripe.mapper";

//this connect terminal to stripe account.
export const createConnectionToken = async (req: Request, res: Response) => {
  try {
    const token = await stripe.terminal.connectionTokens.create();
    res.json({ secret: token.secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Unable to create the connection token",
    });
  }
};

export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { amount, currency } = req.body;

    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card_present"],
      capture_method: "automatic",
    });

    res.status(200).json({
      intent_id: intent.id,
      client_secret: intent.client_secret,
      price: intent.amount,
    });
  } catch (err) {
    next(err);
  }
};

export const capturePaymentIntent = async (req: Request, res: Response) => {
  const intent = await stripe.paymentIntents.capture(
    req.body.payment_intent_id,
  );
  res.send(intent);
};

export const webhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  console.log("sig", sig);
  let event: Stripe.Event;

  if (!sig) {
    console.error("❌ No stripe-signature header found.");
    return res.status(400).send("Missing stripe-signature header");
  }

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
    console.log("stripe webhook event", event);
  } catch (err) {
    console.error(err);
    res.status(400).send("Webhook Error");
    return;
  }

  switch (event.type) {
    case "charge.succeeded": {
      try {
        const orderService = container.resolve<IOrderService>(
          TOKENS.ORDER_SERVICE,
        );

        const charge = event.data.object as Stripe.Charge;
        const dto = StripeMapper.toChargePaymentDTO(charge); //mapping data
        await orderService.completeOrder(dto);

        console.log(
          `✅ Charge Succeeded: ${charge.id} for ${charge.amount / 100} ${charge.currency.toUpperCase()}`,
        );
      } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal logic failed" });
      }

      break;
    }

    case "charge.failed": {
      const charge = event.data.object as Stripe.Charge;
      console.error(`❌ Charge Failed: ${charge.failure_message}`);
      // यहाँ अर्डरलाई "FAILED" मार्क गर्ने वा लग राख्ने
      break;
    }

    case "charge.captured": {
      const charge = event.data.object as Stripe.Charge;
      console.log(`🎯 Charge Captured: ${charge.id}`);
      break;
    }

    case "charge.expired": {
      const charge = event.data.object as Stripe.Charge;
      console.log(`⚠️ Charge Expired: ${charge.id}`);
      break;
    }

    case "charge.pending": {
      console.log("⏳ Charge is pending...");
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      console.log(`💰 Charge Refunded: ${charge.id}`);
      // यहाँ Refund सम्बन्धी डेटाबेस अपडेट गर्नुहोस्
      break;
    }

    case "charge.updated": {
      const charge = event.data.object as Stripe.Charge;
      console.log(`📝 Charge Updated: ${charge.id}`);
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.send();
};
