exports.parse_search = (data) => {

    var results = []

    var payload = {
        "expectUserResponse": true,
        "richResponse": {
            "items": [
                {
                    "simpleResponse": {
                        "textToSpeech": "Here are a few options!"
                    }
                }
            ],
            "suggestions": [
                {
                    "title": "First one"
                },
                {
                    "title": "Show the third product"
                },
                {
                    "title": "Show me more"
                }
            ],
        },
        "systemIntent": {
            "intent": "actions.intent.OPTION",
            "data": {
                "@type": "type.googleapis.com/google.actions.v2.OptionValueSpec",
                "carouselSelect": {
                    "items": []
                }
            }
        },
    }

    for (var i = 0; i < 4; i++) {
        results.push(data[i].product_id)
        payload.systemIntent.data.carouselSelect.items.push({
            "optionInfo": {
                "key": data[i].product_id,
            },
            "title": `${i + 1}. ${data[i].product_title}`,
            "description": `₹${data[i].product_lowest_price}`,
            "image": {
                "url": data[i].product_image,
                "accessibilityText": data[i].product_id
            },
        })
    }

    return { payload: payload, results: results }
}

exports.parse_details = (data) => {

    console.log(data)


    var payload = {
        "expectUserResponse": true,
        "richResponse": {
            "items": [
                {
                    "simpleResponse": {
                        "textToSpeech": "There you go!"
                    }
                },
                {
                    "basicCard": {
                        "title": data.product_name,
                        "subtitle": `₹${data.stores[0].product_price}`,
                        "formattedText": "",
                        "image": {
                            "url": data.product_image,
                            "accessibilityText": data.product_image
                        },
                        "buttons": [
                            {
                                "title": `See on ${data.stores[0].product_store}!`,
                                "openUrlAction": {
                                    "url": data.stores[0].product_store_url
                                }
                            }
                        ],
                        "imageDisplayOptions": "CROPPED"
                    }
                }
            ],
        },
    }

    if (data.product_rating) {
        payload.richResponse.items[1].basicCard.subtitle += `- rating: ${data.product_rating}`
    }

    if (data.product_model) {
        payload.richResponse.items[1].basicCard.formattedText += `${data.product_model} `
    }

    if (data.product_brand) {
        payload.richResponse.items[1].basicCard.formattedText += `${data.product_brand} `
    }
        
    return { payload: payload }
}