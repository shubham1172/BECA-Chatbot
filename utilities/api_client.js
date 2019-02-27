const request = require('request-promise')

const API_KEY = "GOmMrHams3t0faoPHBiHAPXbejfi4J08BdW"
const BASE_URL = "https://price-api.datayuge.com/api/v1/compare"

exports.fetch_search = async (query) => {
    var url = BASE_URL + `/search?api_key=${API_KEY}&product=${query}`
    return new Promise((resolve, reject) => {
        request(url)
        .then((response) => {
            resolve(JSON.parse(response).data)
        })
        .catch((err) => {
            console.log("fetch_products: " + err)
            reject(err)
        })
    })
}

exports.fetch_product = async (id) => {
    var url = BASE_URL + `/detail?api_key=${API_KEY}&id=${id}`
    return new Promise((resolve, reject) => {
        request(url)
        .then((response) => {
            resolve(JSON.parse(response).data)
        })
        .catch((err) => {
            console.log("fetch_details: " + err)
            reject(err)
        })
    })
}