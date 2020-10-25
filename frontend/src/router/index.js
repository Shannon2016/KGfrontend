import Vue from 'vue'
import Router from 'vue-router'
import Extract from "../components/KnowledgeExtract/TextExtract/Extract";
import ExtractPic from "../components/KnowledgeExtract/ImageExtract/ExtractPic";
import ExtractVideo from "../components/KnowledgeExtract/VedioExtract/ExtractVideo"
import Correct from "../components/DataCorrect/Correct";
import DefineLabel from "../components/DataLabel/LabelDefine/DefineLabel";
import CorpusTagging from "../components/DataLabel/CorpusTag/CorpusTagging";
import RelationalData from "../components/DataView/RelationalData";
import EntitySearch from "../components/DataSearch/EntitySearch";
import RelationSearch from "../components/DataSearch/RelationSearch";
import ExtractStruct from "../components/KnowledgeExtract/StructExtract/ExtractStruct"
import ShowDict from "../components/KnowledgeExtract/TextExtract/ShowDict"
import ShowOntology from "../components/KnowledgeExtract/StructExtract/ShowOntology"
import EntityMatch from "../components/KnowledgeExtract/StructExtract/EntityMatch"
import DeNoise from "../components/KnowledgeExtract/StructExtract/DeNoise"
import ViewData from "../components/KnowledgeExtract/StructExtract/ViewData"
import ExtractTest from "../components/KnowledgeExtract/StructExtract/ExtractTest"
import Predict from "../components/KnowledgeExtract/TextExtract/Predict"

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'viewData',
      component: ViewData,
      children:[
      ]
    },
    {
      path: '/definelabel',
      name: 'DefineLabel',
      component: DefineLabel
    },
    {
      path: '/corpustagging',
      name: '/CorpusTagging',
      component: CorpusTagging
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
      path: '/extractVideo',
      name: 'ExtractVideo',
      component: ExtractVideo
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
      path: '/showontology',
      name: '/showOntology',
      component: ShowOntology,
    },
    {
      path: '/showdict',
      name: '/showDict',
      component: ShowDict,
    },
    {
      path: '/deNoise',
      name: '/deNoise',
      component: DeNoise
    },
    {
      path: '/viewData',
      name: '/viewData',
      component: ViewData
    },
    {
      path: '/extractTest',
      name: '/ExtractTest',
      component: ExtractTest
    },
    {
      path: '/predict',
      name: '/Predict',
      component: Predict
    }
  ]
})
