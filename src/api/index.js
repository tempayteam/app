import axios from "axios";


export const getAllCountryName = async () => {
    const response = await axios.get(`https://countriesnow.space/api/v0.1/countries`)
    return response.data.data
}