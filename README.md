# SECURL

Convert your parameterized URLs into time-limited shortened URLs and keep them secure.

## Usage

### Create shortend URL with time-limit(sec)

`curl -H "Content-Type: application/json" -d '{"url":"http://example.com","exp":60}' -X POST <baseUrl>/create`
