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
  var si = await seneca_instance({},{graph:g0}).ready()

  var zero = await si.entity('qaz/number').data$({id$:'n0',n:'zero',v:0}).save$()
  var one = await si.entity('qaz/number').data$({id$:'n1',n:'one',v:1}).save$()
  var two = await si.entity('qaz/number').data$({id$:'n2',n:'two',v:2}).save$()
  
  var rel = await si.post('role:graph,add:rel,graph:number',{
    rel:'lessthan',from:zero.id,to:one.id,__rid__:'r0'})

  expect(rel.data$(false)).equal({
    "f": "n0",
    "id": "r0",
    "r": "lessthan",
    "t": "n1"
  })

  var out = await si.post('role:graph,list:rel,graph:number',{
    rel:'lessthan',from:zero.id})

  expect(out.list).equal([ { f: 'n0', t: 'n1', r: 'lessthan', id: 'r0' } ])
  
  out = await si.post('role:graph,list:rel,graph:number',{
    rel:'lessthan',to:one.id})

  expect(out.list).equal([ { f: 'n0', t: 'n1', r: 'lessthan', id: 'r0' } ])


  await si.post('role:graph,add:rel,graph:number',{
    rel:'lessthan',from:zero.id,to:two.id,__rid__:'r1'})
  await si.post('role:graph,add:rel,graph:number',{
    rel:'lessthan',from:one.id,to:two.id,__rid__:'r2'})

  out = await si.post('role:graph,list:rel,graph:number',{
    rel:'lessthan',to:zero.id})
  expect(out.list.map(x=>x.f+'->'+x.t)).equal([])

  out = await si.post('role:graph,list:rel,graph:number',{
    rel:'lessthan',to:one.id})
  expect(out.list.map(x=>x.f+'->'+x.t)).equal([ 'n0->n1' ])
  
  out = await si.post('role:graph,list:rel,graph:number',{
    rel:'lessthan',to:two.id})
  expect(out.list.map(x=>x.f+'->'+x.t)).equal([ 'n0->n2', 'n1->n2' ])


  out = await si.post('role:graph,tree:rel,graph:number',{
    rel:'lessthan',from:zero.id})

  expect(out).equal({
    c:[ { f:'n0', id:'r0', r:'lessthan', t:'n1'},
        { f:'n0', id:'r1', r:'lessthan', t:'n2'}],
    from:'n0',graph:'number',rel:'lessthan'})


  out = await si.post('role:graph,tree:rel,graph:number',{
    rel:'lessthan',from:zero.id,depth:2})

  expect(out).equal({
    c:[
      { f:'n0', id:'r0', r:'lessthan', t:'n1', c: [
        {f: 'n1',id: 'r2',r: 'lessthan',t: 'n2'}
      ]},
      { f:'n0', id:'r1', r:'lessthan', t:'n2', c: []}
    ],
    from:'n0',graph:'number',rel:'lessthan'})

  out = await si.post('role:graph,list:rel,graph:number,with:entity',{
    rel:'lessthan',to:one.id})

  console.log(out)


  out = await si.post('role:graph,tree:rel,graph:number,with:entity',{
    rel:'lessthan',from:zero.id,depth:2})

  console.log(out)
  console.log(out.c[0].c)
})


lab.test('add-idempotent', async () => {
  var si = await seneca_instance({},{graph:g0}).ready()

  var zero = await si.entity('qaz/number').data$({id$:'n0',n:'zero',v:0}).save$()
  var one = await si.entity('qaz/number').data$({id$:'n1',n:'one',v:1}).save$()
  
  var rel = await si.post('role:graph,add:rel,graph:number',{
    rel:'lessthan',from:zero.id,to:one.id,__rid__:'r0'})

  expect(rel.data$(false)).equal({
    "f": "n0",
    "id": "r0",
    "r": "lessthan",
    "t": "n1"
  })

  rel = await si.post('role:graph,add:rel,graph:number',{
    rel:'lessthan',from:zero.id,to:one.id})

  expect(rel.data$(false)).equal({
    "f": "n0",
    "id": "r0",
    "r": "lessthan",
    "t": "n1"
  })
})


lab.test('intern.configure', async () => {
  var seneca = await seneca_instance().ready()
  
  var cfg = Plugin.intern.configure

  cfg({})
  
  expect(()=>cfg(null)).throw()
  expect(()=>cfg({graph:1})).throw()

/*
  expect(Util.inspect(cfg({
    graph:g0
  })),{compact:true})
    .equal("{ number: { ent: $-/qaz/number;id=;{} } }")
  */
})


function seneca_instance(config, plugin_options) {
  return Seneca(config, { legacy: { transport: false } })
    .test()
    .use('promisify')
    .use('entity')
    .use(Plugin, plugin_options)
}
