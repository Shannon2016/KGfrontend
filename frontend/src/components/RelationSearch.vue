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
          <i class="el-icon-search"></i>
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
        <el-input v-model="inputRelation" placeholder="关系"></el-input>
        <el-input v-model="inputEntity2" placeholder="实体2"></el-input>
        <el-select v-model="level" placeholder="请选择查询级数">
          <el-option
            v-for="item in levelList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-button style="margin-left:20px;height: 40px" class="darkBtn" size="small" @click="onSearchClick">搜索</el-button>

        <div class="result" v-if="searchDone" style="margin-bottom:50px;">
          <!--关系图谱-->
          <div id="kgPic">
            <div class="title">关系图谱</div>
          </div>
          <!--三元组列表-->
          <el-table
            :data="tableData"
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
          <!-- 分页符
          <el-pagination
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
	// window.onresize = function() {
  //   document.getElementById("kgPic").style.width="100%";
  //   document.getElementById("kgPic").style.height="400%";
  //   myChart.resize();
  // };

    export default {
        name: "RelationSearch",
      data(){
        return{
          // fileCount:0,
          // curPage:1,
          //表格数据
          tableData: [],
          searchDone:false,
          inputEntity1:'',
          inputEntity2:'',
          inputRelation:'',
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
          level:""
        }
      },

      methods:{

        // handleCurrentChange(cpage) {
        //   this.curPage = cpage;
        // },
        onSearchClick(){
          if(this.inputEntity1 === '' && this.inputEntity2 === '' && this.inputRelation === '' && !this.searchDone)
          {
            return;
          }

          this.searchDone=true;

          //空值检索
          if(this.inputEntity1 === '' && this.inputEntity2 === '' && this.inputRelation === '')
          {
            let option ={};
            myChart= echarts.init(document.getElementById('kgPic'));
            // 绘制图表
            myChart.setOption(option, true);
            this.tableData = [];
            return;
          }
          /*逻辑和实体检索类似*/
          this.$http.get('http://127.0.0.1:8000/search_relation?entity1_text='+this.inputEntity1+'&relation_name_text='+this.inputRelation+'&entity2_text='+this.inputEntity2).then(
            (res) =>
            {
            console.log(res.data.searchResult) ;
            if(!res.data.searchResult) {
              let option ={};
              myChart= echarts.init(document.getElementById('kgPic'));
              // 绘制图表
              myChart.setOption(option, true);
              this.tableData = [];
              return;
            }
            this.tableData = [];

            let graphPoint = [{ name:this.inputEntity1, category : 0, id : 0, }];
            let graphLink = [];
            let flag = true;
            // for(let i = 0; i < res.data.searchResult.length && flag; i++) {
            //   let tmp = {};
            //   let tmpPoint = {};
            //   let tmpLink = {};

            //   //三元组数据提取
              // tmp.entity1=this.inputEntity1;
              // tmp.relationship=res.data.searchResult[i].rel.type;
              // tmp.entity2=res.data.searchResult[i].n2.title;

            //   //节点提取，按{名称，类别，ID}进行加入；
            //   tmpPoint.name = res.data.searchResult[i].n2.title;
            //   tmpPoint.category = 1;
            //   tmpPoint.id = (i+1);
            //   if(graphPoint.indexOf(tmpPoint) === -1)
            //     graphPoint.push(tmpPoint);  //如果没有在已有点中找到这样的结点，说明这是一个新节点，我们将节点加入到图节点集合中
            //   else continue;

            //   if(graphPoint.length === 20) flag = false;//控制20个结点

            //   //关系组装，添加至graphLink
            //   tmpLink.name = tmp.relationship;
            //   tmpLink.source = 0;
            //   tmpLink.target = 0; //防止报错，先设置一个值
            //   for(let j = 0; j < graphPoint.length; j++ ){
            //     if(graphPoint[j].name == tmp.entity2){
            //       tmpLink.target = graphPoint[j].id;
            //       break;
            //     }
            //   }
            //   graphLink.push(tmpLink);// 将关系添加到graphLink

            //   this.tableData.push(tmp);  //将三元组加入到表中
            // }
            for( let i = 0; i < res.data.searchResult.length; i++ ){  //这个循环，（去重）提取出所有实体2，将所有的三元组数据放入表中

              let tmp={};
              let tmpPoint = {};

                //三元组数据提取
              tmp.entity1=this.inputEntity1;
              tmp.relationship=res.data.searchResult[i].rel.type;
              tmp.entity2=res.data.searchResult[i].n2.title;

              //节点提取，按{名称，类别，ID}进行加入；
              tmpPoint.name = res.data.searchResult[i].n2.title;
              tmpPoint.category = 1;
              tmpPoint.id = (i+1);

              this.tableData.push(tmp);  //将三元组加入到表中

              for(let j = 0; j<graphPoint.length; j++)
                {if(graphPoint[j].name == tmp.name)continue; }//对已经在graphPoint中的节点进行遍历，如果已经存在同名节点，则跳过这一步；

              graphPoint.push(tmpPoint);  //如果没有跳出循环，说明这是一个新节点，我们将节点加入到图节点集合中
            }

            //for(let i = 0; i<i < res.data.searchResult.length; i++ )
            for( let i = 0; i < res.data.searchResult.length ; i++ ){  //这个循环，根据关系的头和尾将关系数据加入到关系集合中

              let tmp={};
              let tmpLink={};

              //提取关系数据中的实体1，实体2，关系名
              tmp.entity1=this.inputEntity1;
              tmp.relationship=res.data.searchResult[i].rel.type;
              tmp.entity2=res.data.searchResult[i].n2.title;

                //关系组装，添加至graphLink
                tmpLink.name = tmp.relationship;
                tmpLink.source = 0;
                tmpLink.target = 0; //防止报错，先设置一个值

                for(let j = 0; j < graphPoint.length; j++ ){
                  if(graphPoint[j].name == tmp.entity2)tmpLink.target = graphPoint[j].id;
                }//设置ID

                graphLink.push(tmpLink);// 将关系添加到graphLink
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
              }).catch((res)=>{
                console.log("fail")
                console.log(res);
                let option ={};
                myChart= echarts.init(document.getElementById('kgPic'));
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
    width: 300px;
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
