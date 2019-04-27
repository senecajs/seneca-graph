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

* [load:tree,role:graph](#-loadtreerolegraph-)


<!--END:action-list-->

<!--START:action-desc-->


## Action Descriptions

### &laquo; `load:tree,role:graph` &raquo;

Load tree of nodes linked by given relation.




#### Examples



* `load:tree,role:graph,graph:numbers,rel:less-than`
  * Load tree of nodes from _numbers_ graph connect ed by relation _less-than_.
#### Parameters


* _graph_: string <i><small>{presence:required}</small></i>
  * The name of the graph.
* _rel_: string <i><small>{presence:required}</small></i>
  * The name of the relation.




#### Replies With


```
{
  graph: '_graph_ parameter',
  rel: '_rel_ parameter',
  root: [
    {
      n_: '{node-entity}',
      r_: [
        {
          n_: '{node-entity}',
          r_: '[...]'
        }
      ]
    }
  ]
}
```


----------


<!--END:action-desc-->


[BadgeCoveralls]: https://coveralls.io/repos/voxgig/seneca-graph/badge.svg?branch=master&service=github
[BadgeNpm]: https://badge.fury.io/js/seneca-graph.svg
[BadgeTravis]: https://travis-ci.org/voxgig/seneca-graph.svg?branch=master
[Coveralls]: https://coveralls.io/github/voxgig/seneca-graph?branch=master
[Npm]: https://www.npmjs.com/package/seneca-graph
[Travis]: https://travis-ci.org/voxgig/seneca-graph?branch=master
