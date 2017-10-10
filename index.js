"use strict"

const router = require('koa-router')()
const koaBody = require('koa-body')
const serve = require('koa-static');
const koaMongo = require('koa-mongo')
var handlebars = require('koa-handlebars')
const Koa = require('koa')

// the app
const app = module.exports = new Koa()


function collect(ctx) {
    return ctx.mongo.db('heroku_bk0c3fqd').collection('timestamps')
}

// middleware
app.use(serve('dist'))

app.use(koaBody())

app.use(koaMongo({
    uri: 'mongodb://heroku_bk0c3fqd:i03r2j2f6i19vbu808ro8v4778@ds013405.mlab.com:13405/heroku_bk0c3fqd'
}))

app.use(handlebars({
    cache: false,
    helpers: {
        'json': (value) => JSON.stringify(value).replace(/"/g, '&quot;')
    }
}))


// route definitions

// > Employees listing
router.get('/', async (ctx) => {
    await ctx.render('index', {})
})

// > Employee detail
router.get('/employees/:id', async (ctx) => {
    // const employee = collect(ctx).findOne({
    //     type: 'employee',
    //     id: ctx.params.id
    // })

    const employee = { id: ctx.params.id, name: 'John Doe' }

    await ctx.render('employee', { employee })
})

// > Employee's month detail
router.get('/employees/:id/timetable/:year/:month', async (ctx) => {
    const year  = parseInt(ctx.params.year)
    const month = parseInt(ctx.params.month)
    const start = new Date(year, month - 1, 1)
    const end   = new Date(year, month, 0)

    const employee = await collect(ctx).findOne({
        type: 'employee',
        id: ctx.params.id
    })

    const timestamps = await collect(ctx).find({
        type: 'timestamp',
        date_of: {
            $gt: start,
            $lt: end
        }
    }).toArray()

    console.log('timestamps', timestamps)

    await ctx.render('timetable', {
        employee,
        timestamps,
        year,
        month
    })
})

// > Post new timestamp
router.post('/timestamps', async (ctx) => {
    await collect(ctx).insert({
        type: 'timestamp',
        employee: ctx.request.body.employee,
        device: ctx.request.body.device || 0,
        date_of: new Date(ctx.request.body.date_of)
    })

    ctx.body = JSON.stringify({ success: true })
})

app.use(router.routes())


// listen

if (!module.parent) app.listen(3000);