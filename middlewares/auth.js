const apiAuth = (req, res, next) => {
    const apiKey = req.headers['api-key'];
    if (process.env.API_KEYS.split(',').includes(apiKey)) {
        return next();
    }
    return res.status(403).json({ error: '권한 없음' })
}
module.exports = apiAuth;