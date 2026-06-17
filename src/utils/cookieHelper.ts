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
  res.cookie(cookiesName, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: minute * 60 * 1000,
  });
};

export const unSetCookies = (res: Response, cookiesName: string) => {
  res.clearCookie(cookiesName, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });
};
