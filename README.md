# Express-GraphQL Backend App README

This README provides instructions on how to set up and run your Express-GraphQL backend app. It also includes guidance on integrating external services like Backblaze and others.

## Setting Up .env File

Create a `.env` file in the root directory of your project and add the following environment variables:

```
NODE_ENV = 'development'
port = 5000
MONGO_URI = your_mongodb_connection_string
JWT_SECRET =your_jwt_secret
DEV_URL=your_client_development_url
PROD_URL=your_client_production_url
BACKBLAZE_APPLICATION_KEYID=your_backblaze_application_key_id
BACKBLAZE_APPLICATION_KEY=your_backblaze_application_key
BACKBLAZE_BUCKECTID=your_backblaze_bucket_id
POSTMARK_APIKEY =your_postmark_api_key
CLIENT_API_KEY=your_client_api_key
```


Your Express-GraphQL backend app relies on environment variables for configuration. Here's how you can obtain the necessary credentials and set up these variables:

### `NODE_ENV`

- Description: Specifies the environment mode (development, production, etc.).
- Instructions: This variable determines the environment mode of your app. Set it to 'development' for local development.

### `port`

- Description: Specifies the port number on which the server will listen.
- Instructions: Set the port number to run your server. Default is often 5000 for development.

### `MONGO_URI`

- Description: Specifies the connection URI for your MongoDB database.
- Instructions: Obtain a MongoDB Atlas URI by following these steps:
  - Go to MongoDB Atlas and sign up or log in.
  - Create a new cluster and database.
  - Copy the connection string and paste it into the `MONGO_URI` variable.

### `JWT_SECRET`

- Description: Secret key used for JWT token generation.
- Instructions: Generate a secure random string and set it as the value for `JWT_SECRET`.

### `DEV_URL` and `PROD_URL`

- Description: URLs for your frontend application in development and production environments.
- Instructions: Set these variables with the URLs of your frontend application.

### Backblaze Integration:

To integrate Backblaze B2 Cloud Storage, follow these steps:

#### `BACKBLAZE_APPLICATION_KEYID` and `BACKBLAZE_APPLICATION_KEY`

- Description: Credentials for accessing Backblaze B2 Cloud Storage.
- Instructions: 
  - Sign in to your Backblaze account or sign up if you don't have one.
  - Navigate to the B2 Cloud Storage section.
  - Create a new application key, and copy the Application Key ID and Application Key values into the respective variables.

#### `BACKBLAZE_BUCKETID`

- Description: ID of the Backblaze bucket you want to use.
- Instructions: Set this variable with the ID of the bucket you want to use in Backblaze.

### Other External Services:

#### `POSTMARK_APIKEY`

- Description: API key for integrating with the Postmark email service.
- Instructions: 
  - Sign up or log in to Postmark.
  - Navigate to the API Tokens section.
  - Generate a new API key and set it as the value for `POSTMARK_APIKEY`.

#### `CLIENT_API_KEY`

- Description: API key for securing the backend endpoint.
- Instructions: Obtain the API key from the respective service provider and set it as the value for `CLIENT_API_KEY`.

## Running the Application:

Follow these steps to run your Express-GraphQL backend app:

1. Install dependencies using `npm install` or `yarn install`.
2. Start the server using `npm run dev` or `yarn run dev`.
3. Your server will be running at the specified port (default is often 5000).