# seneca-graph

[![Npm][BadgeNpm]][Npm]
[![Travis][BadgeTravis]][Travis]
[![Coveralls][BadgeCoveralls]][Coveralls]


A [Seneca](senecajs.org) plugin that provides basic graph operations.


## Install

```sh
$ npm install seneca-graph
```



<!--START:action-list-->


## Action Patterns

* [add:rel,role:graph](#-addrelrolegraph-)
* [list:rel,role:graph](#-listrelrolegraph-)
* [role:graph,tree:rel](#-rolegraphtreerel-)


<!--END:action-list-->

<!--START:action-desc-->


## Action Descriptions

### &laquo; `add:rel,role:graph` &raquo;

Add a directed relation between two nodes in a given graph.




#### Examples



* `add:rel,role:graph,graph:number,rel:lessthan,add:rel,from:<from-id>,to:<to-id>`
  * Idempotently add a pair of nodes to  _number_ graph connected by directed relation _lessthan_ with `from-id` and `to-id` referencing external entity identifiers as per graph definition in options.
#### Parameters


* _graph_: string <i><small>{presence:required}</small></i>
  * The name of the graph.
* _rel_: string <i><small>{presence:required}</small></i>
  * The name of the relation.
* _from_: string <i><small>{presence:required}</small></i>
  * From-side entity identifier.
* _to_: string <i><small>{presence:required}</small></i>
  * To-side entity identifier.




#### Replies With


```
{
  from: '_from_ parameter, as provided',
  to: '_to_ parameter, as provided',
  rel: '_rel_ parameter, as provided',
  graph: '_graph_ parameter, as provided',
  node: {
    f: 'from-side entity identifier',
    t: 'to-side entity identifier',
    r: 'relation name',
    id: 'internal graph node identifier'
  }
}
```


----------
### &laquo; `list:rel,role:graph` &raquo;

List nodes connected by a given relation.




#### Examples



* `list:rel,role:graph,graph:number,rel:lessthan,list:rel`
  * List all nodes in  _number_ graph connected by directed relation _lessthan_

* `list:rel,role:graph,graph:number,rel:lessthan,list:rel,from:<from-id>`
  * List all nodes in  _number_ graph connected by directed relation _lessthan_ with given `from-id`

* `list:rel,role:graph,graph:number,rel:lessthan,list:rel,to:<to-id>`
  * List all nodes in  _number_ graph connected by directed relation _lessthan_ with given `to-id`

* `list:rel,role:graph,graph:number,rel:lessthan,list:rel,to:<to-id>,entity:from`
  * List all nodes in  _number_ graph connected by directed relation _lessthan_ with given `to-id`, loading and including referenced from-side entities

* `list:rel,role:graph,graph:number,rel:lessthan,list:rel,entity:to`
  * List all nodes in  _number_ graph connected by directed relation _lessthan_, loading and including referenced to-side entities
#### Parameters


* _graph_: string <i><small>{presence:required}</small></i>
  * The name of the graph.
* _rel_: string <i><small>{presence:required}</small></i>
  * The name of the relation.
* _from_: string
  * From-side entity identifier.
* _to_: string
  * To-side entity identifier.
* _entity_: string <i><small>{allowOnly:true}</small></i>
  * Entity side to load. Values: _from_, _to_, _both_.




#### Replies With


```
{
  from: '_from_ parameter, as provided',
  to: '_to_ parameter, as provided',
  rel: '_rel_ parameter, as provided',
  graph: '_graph_ parameter, as provided',
  list: [
    {
      f: 'from-side entity identifier',
      t: 'to-side entity identifier',
      r: 'relation name',
      id: 'internal graph node identifier',
      fe: 'from-side entity',
      te: 'to-side entity'
    },
    '...'
  ]
}
```


----------
### &laquo; `role:graph,tree:rel` &raquo;

Load tree of nodes connected by given relation.




#### Examples



* `role:graph,tree:rel,graph:number,rel:lessthan,from:<from-id>`
  * Load tree of nodes from _number_ graph connected by directed relation _lessthan_ with `from-id` nodes at first level, to default depth of 1.

* `role:graph,tree:rel,graph:number,rel:lessthan,from:<from-id>,depth:2,entity:to`
  * Load tree of nodes from _number_ graph connected by directed relation _lessthan_ with `from-id` nodes at first level, to depth 2, loading and returning referenced to-side entities.
#### Parameters


* _graph_: string <i><small>{presence:required}</small></i>
  * The name of the graph.
* _rel_: string <i><small>{presence:required}</small></i>
  * The name of the relation.
* _from_: string
  * From-side entity identifier.
* _to_: string
  * To-side entity identifier.
* _depth_: number <i><small>{default:1}</small></i>
  * Depth of graph to traverse.
* _entity_: string <i><small>{allowOnly:true}</small></i>
  * Entity side to load. Values: _from_, _to_, _both_.




#### Replies With


```
{
  from: '_from_ parameter, as provided',
  to: '_to_ parameter, as provided',
  rel: '_rel_ parameter, as provided',
  graph: '_graph_ parameter, as provided',
  c: [
    {
      f: 'from-side entity identifier',
      t: 'to-side entity identifier',
      r: 'relation name',
      id: 'internal graph node identifier',
      fe: 'from-side entity',
      te: 'to-side entity',
      c: [
        '{ ...connected-nodes... }'
      ]
    },
    '...connected-nodes...'
  ]
}
```


----------


<!--END:action-desc-->


[BadgeCoveralls]: https://coveralls.io/repos/seneca/seneca-graph/badge.svg?branch=master&service=github
[BadgeNpm]: https://badge.fury.io/js/seneca-graph.svg
[BadgeTravis]: https://travis-ci.org/seneca/seneca-graph.svg?branch=master
[Coveralls]: https://coveralls.io/github/seneca/seneca-graph?branch=master
[Npm]: https://www.npmjs.com/package/@seneca/graph
[Travis]: https://travis-ci.org/seneca/seneca-graph?branch=master
