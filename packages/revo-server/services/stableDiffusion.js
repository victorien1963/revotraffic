const apiService = require("./apiService")

const getOptions = (prompt) => {
    return {
        key: process.env.STABLE_DIFFUSION_KEY,
        prompt,
        negative_prompt: null,
        width: "512",
        height: "512",
        samples: "1",
        num_inference_steps: "21",
        seed: null,
        guidance_scale: 7,
        safety_checker: "yes",
        multi_lingual: "no",
        panorama: "no",
        self_attention: "no",
        upscale: "no",
        embeddings_model: null,
        webhook: null,
        track_id: null,
    }
}

const getPic = async (prompt) => {
    const data = getOptions(prompt)
    const response = await apiService.send({
        url: 'https://stablediffusionapi.com/api/v3/text2img',
        method: 'post',
        data,
    })
    return response
}

module.exports = {
    getPic,
}