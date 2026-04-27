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

export const setRefreshCookies = (res: Response, newAccessToken: string) => {
  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60 * 1000,
  });
};
