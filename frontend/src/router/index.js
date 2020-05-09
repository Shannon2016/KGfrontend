import Vue from 'vue'
import Router from 'vue-router'
import DataLabel from "../components/DataLabel";
import Extract from "../components/Extract";
import ExtractPic from "../components/ExtractPic";
import ExtractVedio from "../components/ExtractVedio"
import Correct from "../components/Correct";
import DefineLabel from "../components/DefineLabel";
import CorpusTagging from "../components/CorpusTagging";
import RelationalData from "../components/RelationalData";
import EntitySearch from "../components/EntitySearch";
import RelationSearch from "../components/RelationSearch";
import ExtractStruct from "../components/ExtractStruct"
import ShowDict from "../components/ShowDict"
import ShowOntoloty from "../components/ShowOntoloty"
import EntityMatch from "../components/EntityMatch"

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'DataLabel',
      component: DataLabel,
      children:[
        {
          path: 'definelabel',
          name: 'DefineLabel',
          component: DefineLabel
        },
        {
          path: 'corpustagging',
          name: 'CorpusTagging',
          component: CorpusTagging
        }
      ]
    },
    {
      path: '/extract',
      name: 'Extract',
      component: Extract
    },
    {
      path: '/extractPic',
      name: 'ExtractPic',
      component: ExtractPic
    },
    {
      path: '/extractVedio',
      name: 'ExtractVedio',
      component: ExtractVedio
    },
    {
      path: '/extractStruct',
      name: 'ExtractStruct',
      component: ExtractStruct
    },
    {
      path: '/correct',
      name: 'Correct',
      component: Correct
    },
    {
      path: '/relationaldata',
      name: 'RelationalData',
      component: RelationalData
    },
    {
      path: '/entitysearch',
      name: '/entitySearch',
      component: EntitySearch,
    },
    {
      path: '/relationsearch',
      name: '/relationSearch',
      component: RelationSearch,
    },
    {
      path: '/entitymatch',
      name: 'entityMatch',
      component: EntityMatch
    },
    {
      path: '/showontoloty',
      name: '/showOntoloty',
      component: ShowOntoloty,
    },
    {
      path: '/showdict',
      name: '/showDict',
      component: ShowDict,
    },
  ]
})
