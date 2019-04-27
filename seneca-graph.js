/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

const Joi = require('joi')

const Docs = require('./seneca-graph-docs.js')

module.exports = seneca_graph
module.exports.defaults = {
  maxdepth: 22
}
module.exports.errors = {
}


// NEXT: load referenced entity


function seneca_graph(options) {
  const seneca = this

  const rootspec = intern.configure(options.graph || {})
  
  seneca
    .message('role:graph,add:rel', add_rel)
    .message('role:graph,list:rel', list_rel)
    .message('role:graph,tree:rel', load_tree)

  
  Object.assign(load_tree,Docs.load_tree)

  
  async function add_rel(msg) {
    const spec = intern.resolve_spec(this, rootspec, msg)

    var rel = await spec.ent.load$({f:msg.from,t:msg.to,r:spec.rel.name})

    if(!rel) {
      rel = spec.ent.make$({f:msg.from,t:msg.to,r:spec.rel.name})
      rel.id$ = msg.__rid__ // for testing
      rel = await rel.save$()
    }

    return rel
  }


  async function list_rel(msg) {
    const spec = intern.resolve_spec(this, rootspec, msg)

    const q = {r:spec.rel.name}
    if(msg.from) {
      q.f = msg.from
    }
    if(msg.to) {
      q.t = msg.to
    }

    const list = await spec.ent.list$(q)

    return {list:list}
  }

  

  
  async function load_tree(msg) {
    const seneca = this
    const spec = intern.resolve_spec(this, rootspec, msg)

    const maxdepth = msg.depth || 1
    const root = await traverse({t:msg.from},spec.rel.name,maxdepth,0)

    return {from:msg.from,rel:spec.rel.name,graph:spec.graph.name,c:root.c}
    
    async function traverse(root,relname,maxdepth,depth) {
      depth++
      var list = await seneca.entity('graph/number').list$({f:root.t,r:relname})
      
      root.c = list.map(x=>x.data$(false))
      
      if(depth < maxdepth && depth < options.maxdepth) {
        for(var i = 0; i < root.c.length; i++) {
          await traverse(root.c[i],relname,maxdepth,depth)
        }
      }

      return root
    }
  }


}


const intern = (seneca_graph.intern) = {
  resolve_spec: function(seneca, rootspec, msg) {
    const graphname = msg.graph
    const relname   = msg.rel

    const graph = rootspec[graphname]
    const rel = graph.rel[relname]
    const ent = seneca.entity('graph/'+graphname)
    
    return {
      ent,
      rel,
      graph
    }
  },

  graph_schema: Joi.object().pattern(/^/, Joi.object({
    entity: Joi.string().required(),
    rel: Joi.object().pattern(/^/, Joi.object({
      kind: Joi.string().required()
    }))
  })).default({}),
  
  configure: function(graphdef) {
    const spec = {}

    graphdef = Joi.attempt(graphdef, intern.graph_schema)

    Object.keys(graphdef).forEach(gn=>{
      var g = graphdef[gn]
      g.name = gn

      Object.keys(g.rel).forEach(rn=>{
        var r = g.rel[rn]
        r.name = rn
      })
      spec[gn] = g
    })
    
    return spec
  },
}
