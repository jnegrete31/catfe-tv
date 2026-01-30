# API Test Notes

The API at https://catfetv-amdmxcoq.manus.space/api/trpc/screens.getActive is working correctly.
It returns JSON data with all the active screens.

The issue is likely that the tvOS app is using the wrong API format. 
tRPC returns data in a specific format with nested json property.

Response format:
```json
{
  "result": {
    "data": {
      "json": [...]
    }
  }
}
```

The Swift API client needs to handle this tRPC response format.
