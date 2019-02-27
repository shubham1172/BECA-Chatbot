exports.format_search = (data) => {
    var id_list = []
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
    for (var i = 0; i < data.length; i++) {
        id_list.push(data[i].product_id)
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

    console.log(JSON.stringify(payload))
    return { payload: payload, id_list: id_list }
}

exports.format_product = (data) => {

    /** clearing */
    if (data.product_image) {
        image = data.product_image
    } else {
        image = data.product_images[0]
    }

    var store = null
    for (var i = 0; i < data.stores.length; i++) {
        if (data.stores[i].product_store_url) {
            store = data.stores[i]
            break
        } else if (Object.keys(data.stores[i]).length == 1) {
            store = data.stores[i][Object.keys(data.stores[i])[0]]
            break
        }
    }

    subtitle = ``
    if (!store)
        subtitle += 'unavailable'
    if (data.product_rating)
        subtitle += `rating: ${data.product_rating}`
    else if (data.product_ratings)
        subtitle += `rating: ${data.product_ratings}`
    formattedText = ``
    if (data.product_mrp)
        formattedText += `**MRP**: *₹${data.product_mrp}*\t`
    if (data.product_price)
        formattedText += `**Price**: **₹${data.product_price}**\t`
    if (data.product_discount)
        formattedText += `${data.product_discount}% off!`
    formattedText += '  \n'
    if (data.product_model)
        formattedText += `${data.product_model} `

    if (data.product_brand)
        formattedText += `${data.product_brand} `
    formattedText += '  \n'
    if (data.available_colors)
        formattedText += `Available in: ${data.available_colors.join(", ")}`

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
                        "subtitle": subtitle,
                        "formattedText": formattedText,
                        "image": {
                            "url": image,
                            "accessibilityText": image
                        },
                        "buttons": [
                            {
                                "title": `See on ${store.product_store}!`,
                                "openUrlAction": {
                                    "url": store.product_store_url
                                }
                            }
                        ],
                        "imageDisplayOptions": "CROPPED"
                    }
                }
            ],
        },
    }

    return { payload: payload }
}