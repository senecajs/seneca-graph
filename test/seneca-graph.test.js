/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

const Util = require('util')

const Lab = require('lab')
const Code = require('code')
const lab = (exports.lab = Lab.script())
const expect = Code.expect

const PluginValidator = require('seneca-plugin-validator')
const Seneca = require('seneca')
const Plugin = require('..')

const g0 = {
  number: {
    entity: 'qaz/number',
    rel: {
      lessthan: {
        kind: 'dag'
      }
    }
  }
}

lab.test(
  'validate',
  Util.promisify(function(x, fin) {
    PluginValidator(Plugin, module)(fin)
  })
)

lab.test('happy', async () => {
  var si = await seneca_instance({}, { graph: g0 }).ready()

  var zero = await si
    .entity('qaz/number')
    .data$({ id$: 'n0', n: 'zero', v: 0 })
    .save$()
  var one = await si
    .entity('qaz/number')
    .data$({ id$: 'n1', n: 'one', v: 1 })
    .save$()
  var two = await si
    .entity('qaz/number')
    .data$({ id$: 'n2', n: 'two', v: 2 })
    .save$()

  var out = await si.post('role:graph,add:rel,graph:number', {
    rel: 'lessthan',
    from: zero.id,
    to: one.id,
    __rid__: 'r0'
  })
  expect(out).equal({
    from: 'n0',
    to: 'n1',
    rel: 'lessthan',
    graph: 'number',
    node: { f: 'n0', t: 'n1', r: 'lessthan', id: 'r0' }
  })

  out = await si.post('role:graph,list:rel,graph:number', {
    rel: 'lessthan',
    from: zero.id
  })

  expect(out.list).equal([{ f: 'n0', t: 'n1', r: 'lessthan', id: 'r0' }])

  out = await si.post('role:graph,list:rel,graph:number', {
    rel: 'lessthan',
    to: one.id
  })

  expect(out.list).equal([{ f: 'n0', t: 'n1', r: 'lessthan', id: 'r0' }])

  out = await si.post('role:graph,add:rel,graph:number', {
    rel: 'lessthan',
    from: zero.id,
    to: two.id,
    __rid__: 'r1'
  })
  expect(out).equal({
    from: 'n0',
    to: 'n2',
    rel: 'lessthan',
    graph: 'number',
    node: { f: 'n0', t: 'n2', r: 'lessthan', id: 'r1' }
  })

  out = await si.post('role:graph,add:rel,graph:number', {
    rel: 'lessthan',
    from: one.id,
    to: two.id,
    __rid__: 'r2'
  })
  expect(out).equal({
    from: 'n1',
    to: 'n2',
    rel: 'lessthan',
    graph: 'number',
    node: { f: 'n1', t: 'n2', r: 'lessthan', id: 'r2' }
  })

  out = await si.post('role:graph,list:rel,graph:number', {
    rel: 'lessthan',
    to: zero.id
  })
  expect(out.list.map(x => x.f + '->' + x.t)).equal([])

  out = await si.post('role:graph,list:rel,graph:number', {
    rel: 'lessthan',
    to: one.id
  })
  expect(out.list.map(x => x.f + '->' + x.t)).equal(['n0->n1'])

  out = await si.post('role:graph,list:rel,graph:number', {
    rel: 'lessthan',
    to: two.id
  })
  expect(out.list.map(x => x.f + '->' + x.t)).equal(['n0->n2', 'n1->n2'])

  out = await si.post('role:graph,list:rel,graph:number', {
    rel: 'lessthan'
  })
  expect(out.list.map(x => x.f + '->' + x.t)).equal([
    'n0->n1',
    'n0->n2',
    'n1->n2'
  ])

  out = await si.post('role:graph,list:rel,graph:number,entity:to', {
    rel: 'lessthan',
    to: one.id
  })
  out.list[0].te = out.list[0].te.toString()
  expect(out).equal({
    from: undefined,
    to: 'n1',
    rel: 'lessthan',
    graph: 'number',
    list: [
      {
        f: 'n0',
        t: 'n1',
        r: 'lessthan',
        id: 'r0',
        te: '$-/qaz/number;id=n1;{n:one,v:1}'
      }
    ]
  })

  out = await si.post('role:graph,list:rel,graph:number,entity:from', {
    rel: 'lessthan',
    to: two.id
  })
  out.list[0].fe = out.list[0].fe.toString()
  out.list[1].fe = out.list[1].fe.toString()
  expect(out).equal({
    from: undefined,
    to: 'n2',
    rel: 'lessthan',
    graph: 'number',
    list: [
      {
        f: 'n0',
        t: 'n2',
        r: 'lessthan',
        id: 'r1',
        fe: '$-/qaz/number;id=n0;{n:zero,v:0}'
      },
      {
        f: 'n1',
        t: 'n2',
        r: 'lessthan',
        id: 'r2',
        fe: '$-/qaz/number;id=n1;{n:one,v:1}'
      }
    ]
  })

  out = await si.post('role:graph,tree:rel,graph:number', {
    rel: 'lessthan',
    from: zero.id
  })

  expect(out).equal({
    c: [
      { f: 'n0', id: 'r0', r: 'lessthan', t: 'n1' },
      { f: 'n0', id: 'r1', r: 'lessthan', t: 'n2' }
    ],
    from: 'n0',
    graph: 'number',
    rel: 'lessthan'
  })

  out = await si.post('role:graph,tree:rel,graph:number', {
    rel: 'lessthan',
    from: zero.id,
    depth: 2
  })

  expect(out).equal({
    c: [
      {
        f: 'n0',
        id: 'r0',
        r: 'lessthan',
        t: 'n1',
        c: [{ f: 'n1', id: 'r2', r: 'lessthan', t: 'n2' }]
      },
      { f: 'n0', id: 'r1', r: 'lessthan', t: 'n2', c: [] }
    ],
    from: 'n0',
    graph: 'number',
    rel: 'lessthan'
  })

  out = await si.post('role:graph,tree:rel,graph:number,entity:to', {
    rel: 'lessthan',
    from: zero.id
  })
  out.c[0].te = out.c[0].te.toString()
  out.c[1].te = out.c[1].te.toString()
  expect(out).equal({
    from: 'n0',
    rel: 'lessthan',
    graph: 'number',
    c: [
      {
        f: 'n0',
        t: 'n1',
        r: 'lessthan',
        id: 'r0',
        te: '$-/qaz/number;id=n1;{n:one,v:1}'
      },
      {
        f: 'n0',
        t: 'n2',
        r: 'lessthan',
        id: 'r1',
        te: '$-/qaz/number;id=n2;{n:two,v:2}'
      }
    ]
  })

  // Perhaps not as useful, but test for completeness
  out = await si.post('role:graph,tree:rel,graph:number,entity:from', {
    rel: 'lessthan',
    from: zero.id
  })
  out.c[0].fe = out.c[0].fe.toString()
  out.c[1].fe = out.c[1].fe.toString()
  expect(out).equal({
    from: 'n0',
    rel: 'lessthan',
    graph: 'number',
    c: [
      {
        f: 'n0',
        t: 'n1',
        r: 'lessthan',
        id: 'r0',
        fe: '$-/qaz/number;id=n0;{n:zero,v:0}'
      },
      {
        f: 'n0',
        t: 'n2',
        r: 'lessthan',
        id: 'r1',
        fe: '$-/qaz/number;id=n0;{n:zero,v:0}'
      }
    ]
  })

  out = await si.post('role:graph,tree:rel,graph:number,entity:both', {
    rel: 'lessthan',
    from: zero.id
  })
  out.c[0].fe = out.c[0].fe.toString()
  out.c[1].fe = out.c[1].fe.toString()
  out.c[0].te = out.c[0].te.toString()
  out.c[1].te = out.c[1].te.toString()

  expect(out).equal({
    from: 'n0',
    rel: 'lessthan',
    graph: 'number',
    c: [
      {
        f: 'n0',
        t: 'n1',
        r: 'lessthan',
        id: 'r0',
        fe: '$-/qaz/number;id=n0;{n:zero,v:0}',
        te: '$-/qaz/number;id=n1;{n:one,v:1}'
      },
      {
        f: 'n0',
        t: 'n2',
        r: 'lessthan',
        id: 'r1',
        fe: '$-/qaz/number;id=n0;{n:zero,v:0}',
        te: '$-/qaz/number;id=n2;{n:two,v:2}'
      }
    ]
  })

  out = await si.post('role:graph,tree:rel,graph:number,entity:to', {
    rel: 'lessthan',
    from: zero.id,
    depth: 2
  })

  out.c[0].te = out.c[0].te.toString()
  out.c[0].c[0].te = out.c[0].c[0].te.toString()
  out.c[1].te = out.c[1].te.toString()

  expect(out).equal({
    c: [
      {
        c: [
          {
            te: '$-/qaz/number;id=n2;{n:two,v:2}',
            f: 'n1',
            id: 'r2',
            r: 'lessthan',
            t: 'n2'
          }
        ],
        te: '$-/qaz/number;id=n1;{n:one,v:1}',
        f: 'n0',
        id: 'r0',
        r: 'lessthan',
        t: 'n1'
      },
      {
        c: [],
        te: '$-/qaz/number;id=n2;{n:two,v:2}',
        f: 'n0',
        id: 'r1',
        r: 'lessthan',
        t: 'n2'
      }
    ],
    from: 'n0',
    graph: 'number',
    rel: 'lessthan'
  })
})

lab.test('add-idempotent', async () => {
  var si = await seneca_instance({}, { graph: g0 }).ready()

  var zero = await si
    .entity('qaz/number')
    .data$({ id$: 'n0', n: 'zero', v: 0 })
    .save$()
  var one = await si
    .entity('qaz/number')
    .data$({ id$: 'n1', n: 'one', v: 1 })
    .save$()

  var out0 = await si.post('role:graph,add:rel,graph:number', {
    rel: 'lessthan',
    from: zero.id,
    to: one.id,
    __rid__: 'r0'
  })

  var out1 = await si.post('role:graph,add:rel,graph:number', {
    rel: 'lessthan',
    from: zero.id,
    to: one.id
  })

  expect(out1).equal(out0)
})

lab.test('global-maxdepth', async () => {
  var si = await seneca_instance({}, { maxdepth: 1, graph: g0 }).ready()

  var zero = await si
    .entity('qaz/number')
    .data$({ id$: 'n0', n: 'zero', v: 0 })
    .save$()
  var one = await si
    .entity('qaz/number')
    .data$({ id$: 'n1', n: 'one', v: 1 })
    .save$()
  var two = await si
    .entity('qaz/number')
    .data$({ id$: 'n2', n: 'two', v: 2 })
    .save$()

  var out = await si.post('role:graph,add:rel,graph:number', {
    rel: 'lessthan',
    from: zero.id,
    to: one.id,
    __rid__: 'r0'
  })
  out = await si.post('role:graph,add:rel,graph:number', {
    rel: 'lessthan',
    from: one.id,
    to: two.id,
    __rid__: 'r1'
  })

  out = await si.post('role:graph,tree:rel,graph:number', {
    rel: 'lessthan',
    from: zero.id,
    depth: 2 // overridden by global maxdepth option
  })

  // depth only goes to level 1
  expect(out.c[0].c).not.exists()
})

lab.test('intern.configure', async () => {
  var seneca = await seneca_instance().ready()

  var cfg = Plugin.intern.configure

  cfg({})

  expect(() => cfg(null)).throw()
  expect(() => cfg({ graph: 1 })).throw()
})

function seneca_instance(config, plugin_options) {
  return Seneca(config, { legacy: { transport: false } })
    .test()
    .use('promisify')
    .use('entity')
    .use(Plugin, plugin_options)
}
