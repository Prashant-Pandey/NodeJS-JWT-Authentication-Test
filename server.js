const app = require("express")(),
    path = require("path"),
    bodyParser = require("body-parser"),
    dotenv = require("dotenv").config(),
    jwt = require("jsonwebtoken"),
    port = 3000;
// jwtMW = exjwt({
//     secret: process.env.AUTH_SECRET,
//     algorithms: ['HS256']
// });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
});

// professor's solution error would come if he'd log in using second user
const users = [{
    id: 1,
    username: 'prashant',
    password: 'prashant'
}, {
    id: 2,
    username: 'fabio',
    password: 'fabio'
}]

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    for (const user of users) {
        if (username === user.username && password === user.password) {
            const ttl = 180000;
            const token = jwt.sign({ id: user.id, username: user.username, password: user.passowrd }, process.env.AUTH_SECRET, { expiresIn: ttl });
            res.cookie('token', token, {
                maxAge: ttl
            });
            res.json({ success: true, err: null });
            return;
        }
    }

    res.status(401).json({
        success: false,
        token: null,
        err: 'Username or password is incorrect'
    })

});


const jwtMW = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            throw new Error('UnauthorizedError')
        }

        const authToken = req.headers.authorization.split(" ")[1];

        if (authToken === '' || authToken === 'null' || !jwt.verify(authToken, process.env.AUTH_SECRET)) {
            throw new Error('UnauthorizedError')
        }

        next();
    } catch (err) {
        res.status(401).json({
            success: false,
            err
        });
    }
}


app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        message: 'Secret dashboard content'
    })
});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        message: 'Secret settings content'
    })
});

app.get('*', (req, res)=>{
    res.redirect('/');
})

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            err
        })
    } else {
        next(err);
    }
});


app.listen(3000, () => {
    console.log(`Yay! app started at ${port}`);
})