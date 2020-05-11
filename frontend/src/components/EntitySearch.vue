<template>
  <el-container>
    <!--内容块-->
    <el-main>
      <!--顶部-->
      <div class="header">
        实体检索
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <!--列表页-->
      <div class="main" >
        <!--搜索栏-->
        <el-input v-model="inputEntity" placeholder="请输入实体名称"></el-input>
        <el-select v-model="level" placeholder="请选择查询级数">
          <el-option
            v-for="item in levelList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-button style="margin-left:20px; height: 40px" class="darkBtn" size="small" @click="onSearchClick">搜索</el-button>
        <div v-if="searchDone" style="margin-left:10px; margin-bottom:20px; margin-top:10px;">
          <!-- <span>现有正样例：{{positiveCount}}个</span> -->
          <div id="searchInfo">
            数据库三元组个数 : {{tupleNum}}
            <span style="float:right; margin-right:20px;">查询时间：{{searchTime}}</span>
          </div>
        </div>
        <div class="result" v-if="searchDone">
          <!--关系图谱-->
          <div id="kgPic"
               v-loading="loadingRes"
               element-loading-text="正在搜索中，请稍等……"
               element-loading-spinner="el-icon-loading">
            <div class="title">关系图谱</div>
            <div id="graph" style="width: 1200px;height:800px;"></div>
          </div>
          <!--三元组列表-->
          <el-table
            :data="tableData"
            :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
            :height="60+50*tableData.length"
            border
            v-loading="loadingRes">
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
          <!-- <el-pagination
            background
            layout="prev, pager, next"
            :total="fileCount"
            @current-change="handleCurrentChange">
          </el-pagination> -->
        </div>
      </div>
    </el-main>
  </el-container>

</template>

<script>

  let echarts = require('echarts');
  let myChart;
  import { option } from "../js/echartSettings";

  export default {
    name: "KnowledgeSearch",
    data(){
      return{
        //表格数据
        tableData: [],
        searchDone:false,
        inputEntity:'',
        levelList:[{
          label:"一级查询",
          value:1
        },{
          label:"二级查询",
          value:2
        },{
          label:"三级查询",
          value:3
        }],
        level:1,
        loadingRes:false,
        searchTime:"",
        tupleNum:0,
      }
    },

    methods:{

      // handleCurrentChange(cpage) {
      //   this.curPage = cpage;
      // },
      onSearchClick()
      {
        if(this.inputEntity === '' && !this.searchDone){
          return;
        }

        this.searchDone=true;
        let Myoption = JSON.parse(JSON.stringify(option));
        this.loadingRes = true;

        //空值检索
        if(this.inputEntity === '')
        {
          myChart= echarts.init(document.getElementById('graph'));
          // 绘制图表
          myChart.setOption(Myoption, true);
          this.tableData = [];
          this.loadingRes= false;
          return;
        }

        let fd = new FormData();
        fd.append("entity1",this.inputEntity);
        fd.append("entity2","");
        fd.append("relation","");
        fd.append("number",this.level);
        this.$http.post('http://49.232.95.141:8000/neo/search_entity',fd).then((res) =>
        {
          console.log(res.data) ;
          if(res.data[0][1].length === 0&&res.data[0][2].length === 0&&res.data[0][0].length === 0){
            this.$message({
              message: '未查询相关信息！',
              type: 'warning'
            });
          }
          this.tableData = [];
          // let graphPoint=[{name:this.inputEntity,category:0}];
          // let graphLink=[];
          // //遍历关系
          // for(let i=0;i<res.data.entityRelation.length;i++)
          // {
          //   let tmp={};//表格中一行
          //   let tmpLink={};//关系图中的连线
          //   tmp.entity1=res.data.entityRelation[i].n1.title;
          //   tmp.relationship=res.data.entityRelation[i].rel.type;
          //   tmp.entity2=res.data.entityRelation[i].n2.title;
          //   //重名
          //   if(tmp.entity2 === this.inputEntity) continue;
          //
          //   tmpLink.source=tmp.entity1;
          //   tmpLink.target=tmp.entity2;
          //   tmpLink.name=tmp.relationship;
          //   tmpLink.des=this.inputEntity+"->"+tmp.entity2;
          //   this.tableData.push(tmp);
          //   graphLink.push(tmpLink);
          //   //去除重复节点
          //   for(let k =0;k<graphPoint.length;k++)
          //   {
          //     if(tmp.entity2===graphPoint[k].name)
          //       break;
          //     else if (k===graphPoint.length-1)
          //     {
          //       graphPoint.push({name:tmp.entity2,category:1,des:tmp.entity2});
          //       break;
          //     }
          //   }
          // }

          let graphPoint = [];
          let graphLink = [];
          let pointName = new Set();
          this.tableData = [];
          for (let j = 0; j < 3; j++) {
            for (let i = 0; i < res.data[0][j].length; i++) {
              let tmp = {};
              tmp.entity1 = res.data[0][j][i][0];
              tmp.relation = res.data[0][j][i][1];
              tmp.entity2 = res.data[0][j][i][2];
              if (!pointName.has(tmp.entity1)) {
                pointName.add(tmp.entity1);
                graphPoint.push({
                  name: tmp.entity1,
                  category: j*2
                });
              }
              if (!pointName.has(tmp.entity2)) {
                pointName.add(tmp.entity2);
                graphPoint.push({
                  name: tmp.entity2,
                  category: j*2+1
                });
              }
              graphLink.push({
                source: tmp.entity1,
                target: tmp.entity2,
                name: tmp.relation,
                des: tmp.relation,
                // label:{
                //   show:true,
                //   formatter: function (x) {
                //     return x.data.name;
                //   },
                // }
              });
              console.log(tmp);
              this.tableData.push({
                entity1:tmp.entity1,
                entity2:tmp.entity2,
                relation:tmp.relation,
              })
            }
          }
          Myoption["series"][0]["data"] = graphPoint;
          Myoption["series"][0]["links"] = graphLink;
          Myoption["series"][0]["edgeLabel"]["normal"]["formatter"] = function (x) {
            return x.data.name;
          };

          myChart = echarts.init(document.getElementById("graph"));
          // 绘制图表
          myChart.setOption(Myoption, true);

          this.searchTime=res.data[1];
          this.tupleNum = res.data[2];

          myChart.on('click',function(params){
            let obj = params.data;
            console.log(obj);
            if(obj.hasOwnProperty("source"))//links
            {
              ////obj.source+obj.name+obj.target 头节点、关系、尾节点
              // this.$http.get('http://49.232.95.141:8000/search_entity?head='+obj.source+"&relation="+obj.name+"&tail="+obj.target).then(
              //   (res) => {
              //   })
              alert("1");
            }
            else //points
            {
              ////实体名为obj.name
              // this.$http.get('http://49.232.95.141:8000/search_entity?entity='+obj.name).then((res) => {
              // })
              alert("2");
            }
          });
          this.loadingRes=false;
        }).catch((res)=>{
          this.loadingRes=false;
          console.log("fail")
          console.log(res);
          let option ={};
            myChart= echarts.init(document.getElementById('graph'));
            // 绘制图表
            myChart.setOption(option, true);
            this.tableData = [];
            return;
        })
      }
    },
  }
</script>

<style scoped>

  html,body,.el-container{
    width: 100%;
    height: 100%;
    margin: 0 auto;
    padding: 0;
    overflow: hidden;
  }

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
  #searchInfo{
    background-color: #F0F9EB;
    color: #67C23A;
    padding: 8px 16px;
    width: 95%;
    padding:8px 16px;
    border-radius: 10px;
    margin: 0 0 15px 10px;
    font-size: 13px;
  }

  /*搜索栏*/
  .el-input{
    width: 400px;
  }

  /*关系图*/
  #kgPic{
    height: 800px;
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
