**Task Description:**

Based on the provided API file, create a `.md` file containing the API documentation for the following endpoints:

1. **API URL**: Include the base API URL.
2. **How to get a single ticker**: Document the endpoint to get ticker with ask, bid, volume and other values, provide a sample JSON response, and include an example using `curl`.
3. **How to get multiple tickers (if applicable)**: If the API allows requesting multiple tickers in one call, document this endpoint, provide a sample JSON response, and include a `curl` example. If this is not available, omit this section.
4. **How to get the book**: Document the endpoint how to get book with orders, in the docs could be called as book, orderbook or depth, provide a sample JSON response, and include a `curl` example.

Please omit any other endpoints that are not related to these specific calls.

**Documentation requirements:**

- Include the **API URL** at the top.
- For each endpoint, include the following:
  - Endpoint URL
  - HTTP method (GET, POST, etc.)
  - Description of the functionality
  - Parameters (if any)
  - Example request using `curl`
  - Example JSON response
- Omit endpoints not relevant to tickers or book (depth) data.
