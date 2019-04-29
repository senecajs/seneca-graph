/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

const Joi = require('joi')

const Docs = require('./seneca-graph-docs.js')

module.exports = seneca_graph
module.exports.defaults = {
  maxdepth: Joi.number()
    .default(22)
    .description('Global maximum depth of traversal.')
}
module.exports.errors = {}

// NEXT: load referenced entity

function seneca_graph(options) {
  const seneca = this

  intern.MAXDEPTH = options.maxdepth
  const rootspec = intern.configure(options.graph || {})

  seneca
    .message('role:graph,add:rel', add_rel)
    .message('role:graph,list:rel', list_rel)
    .message('role:graph,tree:rel', load_tree)

  Object.assign(add_rel, Docs.add_rel)
  Object.assign(list_rel, Docs.list_rel)
  Object.assign(load_tree, Docs.load_tree)

  async function add_rel(msg) {
    const spec = intern.resolve_spec(this, rootspec, msg)

    var node = await spec.ent.load$({
      f: msg.from,
      t: msg.to,
      r: spec.rel.name
    })

    if (!node) {
      node = spec.ent.make$({ f: msg.from, t: msg.to, r: spec.rel.name })
      node.id$ = msg.__rid__ // for testing
      node = await node.save$()
    }

    return {
      from: msg.from,
      to: msg.to,
      rel: spec.rel.name,
      graph: spec.graph.name,
      node: node.data$(false)
    }
  }

  async function list_rel(msg) {
    const spec = intern.resolve_spec(this, rootspec, msg)

    const q = { r: spec.rel.name }
    if (msg.from) {
      q.f = msg.from
    }
    if (msg.to) {
      q.t = msg.to
    }

    const list = (await spec.ent.list$(q)).map(x => x.data$(false))

    if (msg.entity) {
      await intern.load_ents(seneca, spec.graph, list, msg.entity)
    }

    return {
      from: msg.from,
      to: msg.to,
      rel: spec.rel.name,
      graph: spec.graph.name,
      list: list
    }
  }

  async function load_tree(msg) {
    const seneca = this
    const spec = intern.resolve_spec(this, rootspec, msg)

    const maxdepth = msg.depth || 1

    // NOTE: start with a virtual node to ensure traversal can descend from-wise
    const root = await intern.traverse(
      this,
      { t: msg.from },
      spec,
      msg,
      maxdepth,
      0
    )

    return {
      from: msg.from,
      rel: spec.rel.name,
      graph: spec.graph.name,
      c: root.c
    }
  }
}

const intern = (seneca_graph.intern = {
  MAXDEPTH: NaN,
  traverse: async function(seneca, root, spec, msg, maxdepth, depth) {
    depth++
    var list = await seneca
      .entity('graph/' + spec.graph.name)

      // NOTE: the next level is "from" the "to" of parent level
      .list$({ f: root.t, r: spec.rel.name })

    root.c = list.map(x => x.data$(false))

    if (msg.entity) {
      await intern.load_ents(seneca, spec.graph, root.c, msg.entity)
    }

    if (depth < maxdepth && depth < intern.MAXDEPTH) {
      for (var i = 0; i < root.c.length; i++) {
        await intern.traverse(seneca, root.c[i], spec, msg, maxdepth, depth)
      }
    }

    return root
  },

  load_ents: async function(seneca, graph, list, side) {
    if ('from' === side || 'both' === side) {
      await load_ents_side('f')
    }
    if ('to' === side || 'both' === side) {
      await load_ents_side('t')
    }

    async function load_ents_side(side) {
      var ids = list.map(x => x[side])
      var ents = await intern.load_ids(seneca, graph.entity, ids)
      for (var i = 0; i < list.length; i++) {
        list[i][side + 'e'] = ents[i]
      }
    }
  },

  // TODO: seneca-entity should provide this
  load_ids: async function(seneca, canon, ids) {
    var ents = []
    for (var i = 0; i < ids.length; i++) {
      ents.push(await seneca.entity(canon).load$(ids[i]))
    }
    return ents
  },

  resolve_spec: function(seneca, rootspec, msg) {
    const graphname = msg.graph
    const relname = msg.rel

    const graph = rootspec[graphname]
    const rel = graph.rel[relname]
    const ent = seneca.entity('graph/' + graphname)

    return {
      ent,
      rel,
      graph
    }
  },

  graph_schema: Joi.object()
    .pattern(
      /^/,
      Joi.object({
        entity: Joi.string().required(),
        rel: Joi.object().pattern(
          /^/,
          Joi.object({
            kind: Joi.string().required()
          })
        )
      })
    )
    .default({}),

  configure: function(graphdef) {
    const spec = {}

    graphdef = Joi.attempt(graphdef, intern.graph_schema)

    Object.keys(graphdef).forEach(gn => {
      var g = graphdef[gn]
      g.name = gn

      Object.keys(g.rel).forEach(rn => {
        var r = g.rel[rn]
        r.name = rn
      })
      spec[gn] = g
    })

    return spec
  }
})
