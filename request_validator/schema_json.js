const req_schema_json = {
    "1": {
        "req_url": "/ping",
        "req_query": ['client'],
        "req_header": ['auth_key'],
        "req_body": {
            "array": [3.8, 6.7],
            "object": {
                "a": 3.5,
                "b": 8.9
            },
            "nested": [
                {
                    "a": [4.5],
                    "v": [
                        {
                            "name": "hi",
                            "age": 23
                        }
                    ]
                },
                {
                    "v": 3.5,
                    "x": 2.3
                }
            ]
        }
    }
}
module.exports = req_schema_json