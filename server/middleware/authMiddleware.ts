export const authenticateUser = (req, res, next) => {
    const apiKey = req.headers['authorization'];
    if (apiKey !== `Bearer ${process.env.APP_SECRET}`) {
        return res.status(403).json({ error: "Unauthorized" });
    }
    next();
};
