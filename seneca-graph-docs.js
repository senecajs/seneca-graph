
const Joi = require('joi')

module.exports = {
  load_tree: {
    desc: 'Load tree of nodes linked by given relation.',
    examples: {
      'graph:number,rel:lessthan': 'Load tree of nodes from _number_ graph connect ed by relation _lessthan_.',
    },
    validate: {
      graph: Joi.string()
        .required()
        .description(
          'The name of the graph.'
        ),
      rel: Joi.string()
        .required()
        .description(
          'The name of the relation.'
        )
    },
    reply_desc: {
      graph: '_graph_ parameter',
      rel: '_rel_ parameter',
      root: [{ n_: '{node-entity}', r_: [{n_: '{node-entity}', r_:'[...]'}]}]
    }
  }
}
