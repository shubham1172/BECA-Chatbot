const { WebhookClient, Payload } = require('dialogflow-fulfillment')
const express = require('express')
const app = express()
const request = require('request-promise')
const parser = require('./utilities/parser')

const API_KEY = "GOmMrHams3t0faoPHBiHAPXbejfi4J08BdW"
const BASE_URL = "https://price-api.datayuge.com/api/v1/compare"

context = { results: [], query: "" }

app.get('/', (req, res) => res.send('online'))

app.post('/dialogflow', express.json(), (req, res) => {
    const agent = new WebhookClient({ request: req, response: res })

    function details(agent) {
        params = req.body.queryResult.parameters;
        id = context.results[params.number-1]
        var url = BASE_URL + `/detail?api_key=${API_KEY}&id=${id}`
        return request(url)
            .then((response) => {
                response = JSON.parse(response)
                parsed = parser.parse_details(response.data)
                agent.add(new Payload(agent.ACTIONS_ON_GOOGLE, parsed.payload))
                return Promise.resolve()
            })
            .catch((err) => {
                console.log(err)
                agent.add("Looks like there some trouble with my server :/")
                return Promise.resolve()
            })
    }

    function show_more(agent) {

    }

    function search(agent) {
        var url = BASE_URL + `/search?api_key=${API_KEY}&product=`
        params = req.body.queryResult.parameters;
        product = params.Product;
        if (!product) {
            agent.add("Oops, my parsing system failed to recognize what you want!")
            return Promise.resolve()
        }
        if (params.color)
            url += params.color
        url += `%20${product[0]}`
        return request(url)
            .then((response) => {
                response = JSON.parse(response)
                parsed = parser.parse_search(response.data)
                context.results = parsed.results
                context.query = params.color + " " + product
                agent.add(new Payload(agent.ACTIONS_ON_GOOGLE, parsed.payload))
                return Promise.resolve()
            })
            .catch((err) => {
                console.log(err)
                agent.add("Looks like there some trouble with my server :/")
                return Promise.resolve()
            })
    }

    var intentMap = new Map()
    intentMap.set('Search', search)
    intentMap.set('Search - select.number', details)
    intentMap.set('Search - more', show_more)
    agent.handleRequest(intentMap)
})

app.listen(process.env.PORT || 8080)