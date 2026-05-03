import jwt from 'jsonwebtoken';

export  function authMiddleware(req, res, next) {
    const token  = req.cookies.token

    if (!token) {  
        return res.status(401).json({
            success: false,
            message: "No token provided, authorization denied"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch (error) {
        console.error('Error in authMiddleware:', error);
        res.status(401).json({
            success: false,
            message: "Invalid token, authorization denied"
        });

    }

}
