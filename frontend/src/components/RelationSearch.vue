<template>
  <el-container>
    <!-- 左侧导航栏-->
    <el-aside width="200px">
      <el-menu
        default-active=""
        background-color="#343643"
        text-color="#fff"
        active-text-color="#fff"
        :router="true">
        <el-menu-item index="/entitysearch">
          <i class="el-icon-menu"></i>
          <span slot="title" >实体检索</span>
        </el-menu-item>
        <el-menu-item index="/relationsearch" class="is-active">
          <i class="el-icon-document"></i>
          <span slot="title">关系检索</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <!--内容块-->
    <el-main>
      <!--顶部-->
      <div class="header">
        关系检索
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <!--列表页-->
      <div class="main" >
        <!--搜索栏-->
        <el-input v-model="inputEntity1" placeholder="实体1"></el-input>
        <el-select v-model="inputRelation" filterable placeholder="关系">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-input v-model="inputEntity2" placeholder="实体2"></el-input>
        <el-button style="margin-left:20px;height: 40px" class="darkBtn" size="small" @click="onSearchClick">搜索</el-button>

        <div class="result" v-if="searchDone">
          <!--关系图谱-->
          <div id="kgPic">
            <div class="title">关系图谱</div>
          </div>
          <!--三元组列表-->
          <el-table
            :data="tableData.slice((curPage - 1) * 10, curPage * 10)"
            :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
            height="626"
            border>
            <el-table-column
              prop="entity1"
              label="实体1"
              fixed>
            </el-table-column>
            <el-table-column
              prop="relationship"
              label="关系">
            </el-table-column>
            <el-table-column
              prop="entity2"
              label="实体2">
            </el-table-column>
          </el-table>
          <!-- 分页符-->
          <el-pagination
            background
            layout="prev, pager, next"
            :total="fileCount"
            @current-change="handleCurrentChange">
          </el-pagination>
        </div>
      </div>
    </el-main>
  </el-container>

</template>

<script>
  let echarts = require('echarts');
  let myChart;
  window.onresize = function() {
    document.getElementById("kgPic").style.width="100%";
    document.getElementById("kgPic").style.height="400%";
    myChart.resize();
  };

  export default {
    name: "RelationSearch",
    data(){
      return{
        fileCount:0,
        curPage:1,
        //表格数据
        tableData: [],
        searchDone:false,
        inputEntity1:'',
        inputEntity2:'',
        options: [{
          value: 'is',
          label: 'is'
        }, {
          value: '选项2',
          label: '选项2'
        }, {
          value: '选项3',
          label: '选项3'
        }, {
          value: '选项4',
          label: '选项4'
        }, {
          value: '选项5',
          label: '选项5'
        }],
        inputRelation:'',
      }
    },

    methods:{

      handleCurrentChange(cpage) {
        this.curPage = cpage;
      },
      onSearchClick(){
        this.searchDone=true;
        /*逻辑和实体检索类似*/
        this.$http.get('http://127.0.0.1:8000/search_relation?entity1_text='+this.inputEntity1+'&relation_name_text='+this.inputRelation+'&entity2_text='+this.inputEntity2).then((res) => {
          console.log(res.data.searchResult) ;

          this.tableData = [];
          let graphPoint=[{name:this.inputEntity1,category:0}];
          let graphLink=[];
          for(let i=0;i<res.data.searchResult.length;i++)
          {
            let tmp={};
            let tmpLink={};
            tmp.entity1=this.inputEntity1;
            tmp.relationship=res.data.searchResult[i].rel.type;
            tmp.entity2=res.data.searchResult[i].n2.title;
            tmpLink.source=this.inputEntity1;
            tmpLink.target=tmp.entity2;
            tmpLink.name=tmp.relationship;
            tmpLink.des=this.inputEntity1+"->"+tmp.entity2;
            this.tableData.push(tmp);
            graphLink.push(tmpLink);
            graphPoint.push({name:tmp.entity2,category:1,des:tmp.entity2});
          }

          let categories=[
            {name:'entity1'},
            {name:'entity2'},
          ];

          let option ={
            // 提示框的配置
            tooltip: {
              formatter: function (x) {
                return x.data.des;
              }
            },

            // 工具箱
            toolbox: {
              // 显示工具箱
              show: true,
              feature: {
                mark: {
                  show: true
                },
                // 还原
                restore: {
                  show: true
                },
                // 保存为图片
                saveAsImage: {
                  show: true
                }
              }
            },
            legend: [{
              // selectedMode: 'single',
              data: categories.map(function (a) {
                return a.name;
              })
            }],

            series: [{
              type: 'graph', // 类型:关系图
              layout: 'force', //图的布局，类型为力导图
              symbolSize: 40, // 调整节点的大小
              roam: true, // 是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移,可以设置成 'scale' 或者 'move'。设置成 true 为都开启
              edgeSymbol: ['circle', 'arrow'],
              edgeSymbolSize: [2, 10],
              edgeLabel: {
                normal: {
                  textStyle: {
                    fontSize: 20
                  }
                }
              },
              force: {
                repulsion: 2500,
                edgeLength: [10, 50]
              },
              draggable: true,
              lineStyle: {
                normal: {
                  width: 2,
                  color: '#4b565b',
                }
              },
              edgeLabel: {
                normal: {
                  show: true,
                  formatter: function (x) {
                    return x.data.name;
                  }
                }
              },
              label: {
                normal: {
                  show: true,
                  textStyle: {}
                }
              },
              // 数据
              data:graphPoint,
              links:graphLink,
              categories: categories,
            }],
            grid:{
              top:"10px",
              bottom:"10px",
              height:"10px",
              width:"10px"
            }
          };
          myChart= echarts.init(document.getElementById('kgPic'));
          // 绘制图表
          myChart.setOption(option);
        }).catch((res)=>{
          console.log("fail")
          console.log(res);
        })
      }
    },
  }
</script>

<style scoped>

  /****************整体布局*******************/

  body > .el-container {
    width: 100%;
    height: 100%;
  }
  .el-aside {
    background-color: #343643;
    min-height: calc(100% - 60px);
  }
  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: left;
    height: 100%;
    background-color: #F1F2F6;
  }

  /**************左侧导航栏***************/
  .is-active {
    background-color: rgba(255,255,255,0.2) !important;
    border-right: 4px solid #5775FB !important;
  }

  .el-menu-item{
    width: 200px;
  }

  /**************内容顶部***************/
  .header{
    width: 100%;
    height: 20px;
    line-height: 20px;
    text-align: left;
    margin-left: 20px;
    font-weight: bold;
    font-size: large;
  }
  /*************内容中心*************/
  .main{
    line-height: 30px;
    height: 90%;
    width: 100%;
  }

  /*搜索栏*/
  .el-input{
    width: 400px;
  }

  /*关系图*/
  #kgPic{
    height: 200px;
    width: 100%;
    margin-top: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    background-color: #fff;
  }
  .title{
    line-height: 55px;
    background-color: #E9EEF3;
    color: #606266;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    padding: 0 10px;
    font-weight: bold;
  }

  /*表格*/
  .el-table{
    height: 80%;
    width: 100%;
    margin-top: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  }
  /*分页符*/
  .el-pagination{
    right: 60px;
    height: 10%;
    text-align: right;
    margin-top: 10px;
    margin-bottom: 20px;
  }

  .el-pagination.is-background .el-pager li:not(.disabled).active{
    background-color: #5775FB !important;
  }
  .el-pagination.is-background .el-pager li:hover{
    color: #5775FB !important;
  }

  /***********按钮样式***********/
  .blueBtn{
    background-color: #EFF0FF;
    border: 1px solid #5775FB;
    color: #5775FB;
  }

  .blueBtn:hover,.blueBtn:active{
    background-color: #5775FB;
    color: #FFFFFF;
  }

  .darkBtn{
    background-color: #5775FB;
    border: 1px solid #5775FB;
    color: #FFFFFF;
  }
  .darkBtn:hover{
    background-color: #708BF7;
  }
</style>
