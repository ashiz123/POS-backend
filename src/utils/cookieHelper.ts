import { Response, CookieOptions } from "express";

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: false, //if production set true
  sameSite: "lax",
  path: "/",
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  res.cookie("accessToken", accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const setCookies = (
  res: Response,
  cookiesName: string,
  token: string,
  minute: number = 15,
) => {
  const isProduction = process.env.NODE_ENV === "production";

  const cookieData = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
    path: "/",
    partitioned: isProduction,
    maxAge: minute * 60 * 1000,
  };

  console.log(cookieData);

  res.cookie(cookiesName, token, cookieData);
};

export const unSetCookies = (res: Response, cookiesName: string) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie(cookiesName, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    partitioned: isProduction,
    path: "/",
  });
};
