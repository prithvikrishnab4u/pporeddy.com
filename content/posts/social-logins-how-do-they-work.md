---
title: "Social Logins: How Do They Work?"
description: A detailed exploration of social login mechanisms, OAuth 2.0, and OpenID Connect protocols that power modern authentication.
summary: Understanding how social logins work using OAuth 2.0 and OpenID Connect, from the initial authentication flow to token management and user authorization.
date: 2019-12-13T00:00:00Z
lastmod:
author:
  - Prithvi Poreddy
tags:
  - social login
  - OAuth
  - OpenID Connect
  - authentication
  - authorization
  - identity provider
  - JWT
  - access tokens
  - security
categories:
  - Identity and Access Management
  - Authentication
draft: false
featured: false
ShowReadingTime: true
ShowShareButtons: true
ShowBreadCrumbs: false
ShowPostNavLinks: true
ShowCodeCopyButtons: true
ShowWordCount: true
ShowRssButtonInSectionTermList: true
UseHugoToc: true
canonicalURL: https://medium.com/@pporeddy/social-logins-how-do-they-work-f82398365732
slug: social-logins-how-do-they-work
og_type: article
robots: index, follow
historic_views: 1008
---

Social login is a type of sign-on. Instead of creating a fresh account for new users, websites and services use information from a social networking service to sign you in. It simplifies logins for users. No need to remember distinct passwords for different websites.

Use your Facebook account to login to Spotify to listen to music or Medium to read stories or Hulu to catch up on TV shows. One account for all services just like Single Sign-On (SSO).

Websites love social logins. It reduces friction in the login process. Sign up pages are a barrier for websites. Users don't want to register, reset passwords or enter a username and password. They don't want to be bothered.

Websites need not verify the identity of the user as they are pre-verified accounts. They get all the public information shared on the social network website. That's gold for websites. Users wouldn't have shared all that information if it wasn't through social login.

## How Does It Work?

Let's walk through a simple example to understand how it works. Go to the Spotify signup page to register with the service.

It gives you an option to sign up with Facebook. Else provide some basic information to create an account.

If you click on sign up with Facebook, Spotify redirects you to Facebook's authorization server (AuthZ server). If you squint at the consent screen you see "dialog/oauth" in the URL. Enter Facebook credentials to authenticate.

If the authentication is successful, it shows you the consent screen. This screen lists the information/permissions Spotify is requesting for account creation.

The consent is granular. What individual information the app is requesting is shown to the user.

Press the continue button to allow Spotify to access all the information on the screen. Spotify collects that information and creates an account.

To log in, go to Spotify sign-in page. Click on sign in with Facebook. Enter Facebook credentials if you aren't already logged into Facebook.

Spotify logs you into their service. It knows who you are, all your playlists, all your favorite songs.

Spotify does not store Facebook usernames and passwords. Then use those credentials to log in to Facebook. It uses Facebook as an identity provider (IdP) to get the necessary information to sign you in.

## How Does Spotify Get My Facebook Profile Information?

> They must be storing my credentials.

Let's get under the hood to better understand what's going on.

For login with Facebook to work, Spotify has to register with Facebook's authentication server as an app. Spotify has to provide App name, Redirect URL, Login URL to Facebook AuthZ server. The server gives Spotify an App ID and secret key and the AuthZ server URL. The app ID verifies the identity and the secret key authorizes.

Spotify app has App ID and Secret key provided by Facebook's auth server. The Facebook server has redirect URL to redirect after successful authentication, App ID it assigned, and encryption key.

## Can We Get Into Details, Already?

> Under the hood, OAuth and OpenID Connect protocols are used. It's delegated access. Facebook AuthZ server is an OAuth server. OAuth is an authorization protocol. OpenID Connect is added to the OAuth to provide authentication. In our context when we say OAuth it is OAuth 2.0 + OpenID Connect.

Let's use an example. Sign up to a Web App using Social Login.

Click sign up with Social Login. Provide Social Login credentials to authenticate. On successful authentication, the page shows a list of permissions/resources Web App is asking. Click on continue to give all the requested permissions.

The AuthZ server gives out an ID token and authorization token to the app. The app verifies the ID token. It's a JWT token. Then negotiates for the access token. It sends the secret key from the app registration and the authorization token to the AuthZ server. The AuthZ server verifies the tokens and provides an access token.

Web App decodes the JWT ID token and creates an account. If ID token has insufficient information it uses the access token to get the necessary information.

The access tokens only have access to the approved permissions on the consent screen. Web App doesn't store Social Login credentials to log in. It simply uses the token provided by Social Login to authenticate users.

## Token Juggling Every Time I Log In? Please Say NO.

> The OAuth flow will be different if you already signed up using social login. It's simpler and there are multiple flows.

When you click on Login with Social Network, if not already logged in to the Social network app it asks for credentials. If already logged in successfully the AuthZ server sends an ID token (signed JWT token).

The ID token is encrypted. It has authentication information. Web app decrypts the signed token with the secret key. A complex implementation of nested JWT is used to build a signed ID token.

JSON Web Encryption (JWE) and JSON Web Signature (JWS) tokens are embedded into JWT. Embed the JWS token in JWE payload. Now embed JWE token into a JWT payload. A signed JWT is created.

Decrypt the signed JWT. It has all the information to authenticate the users into the app. The web app uses this information to find the account.
