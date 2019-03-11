const { WebhookClient, Payload } = require('dialogflow-fulfillment')
const express = require('express')
const app = express()
const api_client = require('./utilities/api_client')
const formatter = require('./utilities/formatter')
const converter = require('./utilities/converter')

const STRING_ERROR_BACKEND = "Uhm, looks like the server is causing issues! BRB."
const STRING_ERROR_FINISHED = "Choices are good but we ran out of them! :("

cache = { data: null, id_list: null, curr_pos: 0 }

async function get_product(idx, agent) {
    id = cache.id_list[idx]
    console.log(idx); console.log(id)
    return api_client.fetch_product(id)
        .then((data) => {
            formatted = formatter.format_product(data)
            payload = new Payload(agent.ACTIONS_ON_GOOGLE, formatted.payload)
            agent.add(payload)
            return Promise.resolve()
        })
        .catch((err) => {
            console.log(err)
            agent.add(STRING_ERROR_BACKEND)
            return Promise.resolve()
        })
}

    app.get('/', (req, res) => res.send('online'))

    app.post('/dialogflow', express.json(), (req, res) => {
        const agent = new WebhookClient({ request: req, response: res })

        function details(agent) {
            query = req.body.originalDetectIntentRequest.payload.inputs[0].rawInputs[0].query.trim()
            cardinal = converter.ordinal_to_cardinal(query)
            idx = cache.curr_pos % 4 + cardinal - 1
            return get_product(idx, agent)
        }

        function search(agent) {
            /** search top products and return */
            query = req.body.queryResult.queryText.trim()
            if (!isNaN(query.split(".")[0])) {
                idx = Number(query.split(".")[0]) - 1
                return get_product(idx, agent)
            }
            params = req.body.queryResult.parameters
            query = ""
            if (params.color)
                query += (params.color + " ")
            query += params.Product
            return api_client.fetch_search(query)
                .then((data) => {
                    cache.data = data
                    cache.curr_pos = 4
                    slice = data.slice(0, 4)
                    formatted = formatter.format_search(slice)
                    cache.id_list = formatted.id_list
                    payload = new Payload(agent.ACTIONS_ON_GOOGLE, formatted.payload)
                    agent.add(payload)
                    return Promise.resolve()
                })
                .catch((err) => {
                    console.log(err)
                    agent.add(STRING_ERROR_BACKEND)
                    return Promise.resolve()
                })
        }

        function show_more(agent) {
            if (cache.curr_pos > cache.data.length) {
                agent.add(STRING_ERROR_FINISHED)
            } else {
                slice = cache.data.slice(cache.curr_pos, Math.min(cache.curr_pos + 4, cache.data.length))
                cache.curr_pos += 4
                formatted = formatter.format_search(slice)
                cache.id_list = formatted.id_list
                payload = new Payload(agent.ACTIONS_ON_GOOGLE, formatted.payload)
                agent.add(payload)
            }
        }

        function show_ordinal(agent) {
          cardinal = req.body.queryResult.parameters.number[0]
          console.log(cardinal)
          idx = cardinal + cache.curr_pos % 4 - 1
          console.log(idx)
          agent.add("test")
          // return get_product(idx, agent)
        }

        function fallback(agent) {
            query = req.body.queryResult.queryText.trim()
            if (isNaN(query.split(".")[0]))
                return
            idx = Number(query.split(".")[0]) - 1
            return get_product(idx, agent)
        }

        var intentMap = new Map()
        intentMap.set('Search', search)
        intentMap.set('actions.intent.OPTION', details)
        intentMap.set('Search - more', show_more)
        intentMap.set('Search - select.number', show_ordinal)
        intentMap.set('Fallback Intent', fallback)
        agent.handleRequest(intentMap)
    })

app.listen(process.env.PORT || 8080)
