<template>
  <el-container>
    <!-- 左侧导航栏-->
    <el-aside width="200px">
      <el-menu
        default-active=""
        class="el-menu-vertical-demo"
        background-color="#343643"
        text-color="#fff"
        active-text-color="#fff"
        :router="true">
        <el-menu-item index="/extract">
          <i class="el-icon-document"></i>
          <span slot="title">文本抽取</span>
        </el-menu-item>
        <el-menu-item index="/extractStruct" class="is-active">
          <i class="el-icon-s-grid"></i>
          <span slot="title">结构化数据抽取</span>
        </el-menu-item>
        <el-menu-item index="/extractPic">
          <i class="el-icon-picture-outline"></i>
          <span slot="title" >图片抽取</span>
        </el-menu-item>
        <el-menu-item index="/extractVedio">
          <i class="el-icon-video-camera"></i>
          <span slot="title">视频抽取</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <!--内容块实体对齐-->
    <el-main v-if="resDetailFlag===false && graphFlag===false">
      <!--顶部-->
      <div class="header">
        结构化数据抽取
        <el-button type="primary" class="darkBtn headbutton" size="small" @click="isUpload=true">上传与分析</el-button>
        <el-button type="primary" class="darkBtn headbutton" size="small" >训练</el-button>
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <!--列表页-->
      <div class="main" >
        <!-- 上传窗口-->
        <div class="upload" id="upload" v-if="isUpload">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>数据上传</span>
              <i class="el-icon-close" style="float: right; padding: 3px 0" @click="cancelUpload"></i>
            </div>
            <el-upload
              class="upload-demo"
              drag
              ref="upload"
              :auto-upload="false"
              accept=".xlsx,.csv"
              action="https://jsonplaceholder.typicode.com/posts/"
              :on-remove="handleRemove"
              :on-change="handleAddFile"
              :file-list="fileList"
              multiple>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">
                仅支持上传csv文件、xlsx文件<br>
              </div>
            </el-upload>
            <el-button size="small" @click="cancelUpload">取消</el-button>
            <el-button style="margin-left: 10px;" class="darkBtn" size="small" type="primary" @click="submitUpload">上传并分析</el-button>
          </el-card>
        </div>
        <!--表格查看-->
        <div class="top-tip">
          <span v-if="!isList">请选择表格：</span>
          <el-select v-model="tableIndex" placeholder="" size="small" style="margin-left:20px;" v-if="!isList">
            <el-option
              v-for="(item, index) in properties"
              :key="index"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
          <el-button v-if="!isList" style="margin-left:20px;" class="blueBtn" size="small" @click="chooseTable">确定</el-button>
          <div v-if="markSum==='' && isList" style="margin-bottom:10px;">如要标记样例，请先填写标记样例数，默认正负样例比占总样例数2:1</div>
          <el-button :disabled="positiveFlag" v-if="isList" class="blueBtn" size="small" @click="setPositive" style="margin-left:15px;">设为正样例</el-button>
          <el-button :disabled="negativeFlag" v-if="isList" class="blueBtn" size="small" @click="setNegative" style="margin-left:15px;">设为负样例</el-button>

          <el-button class="darkBtn" size="small" style="float:right; margin-right:30px;" @click="showGraph">图谱展示</el-button><!-- v-if="graphBtn"-->
          <el-button type="primary" class="darkBtn" size="small" style="float:right; margin-right:20px;" @click="entityMark">交互训练</el-button>
          <el-button type="primary" class="darkBtn" size="small" style="float:right; margin-right:20px;" @click="deNoise">属性去噪</el-button>
          <el-button v-if="!isList" type="primary" class="darkBtn" size="small" style="float:right; margin-right:20px;" @click="loadData">加载数据</el-button>
          <el-button v-if="isList" type="primary" class="darkBtn" size="small" style="float:right; margin-right:20px;" @click="backToView">返回</el-button>
        </div>
        <!--用户操作-->
        <div style="margin-left:20px;" v-if="isList">
          <span>选择用于训练集、测试集的样例比例：</span>
          <el-input v-model="portion" placeholder="格式：x:y"  size="small" style="width:250px;"></el-input>
          <!-- <el-select v-model="portion" placeholder="请选择" size="small">
            <el-option
              v-for="item in portionList"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select> -->

          <span style="margin-left:20px;">标记样例总数：</span>
          <el-input v-model="markSum" type="number" style="width:250px;" size="small"  @change="setSumCount"></el-input>

          <el-button class="darkBtn" size="small" style="float:right; margin-right:20px;" @click="returnUnmarks">实体对齐</el-button>
          <el-button class="darkBtn" size="small" @click="submitMarks" style="float:right; margin-right:20px;">提交</el-button>
          <el-button type="text" v-if="showRes" @click="resDetailFlag=true" style="float:right; margin-right:20px;" class="textBtn">查看上次标注结果>></el-button>
        </div>

        <div v-if="isList" style="margin-left:10px; margin-bottom:20px; margin-top:10px;">
          <!-- <span>现有正样例：{{positiveCount}}个</span> -->
          <div id="matchInfo">
            已有训练数据数量 : {{trainCount}}
            <span v-if="showRes" style="float:right; margin-right:20px;">召回率：{{recall}}%</span>
            <span v-if="showRes" style="float:right; margin-right:20px;">准确率：{{accuracy}}%</span>
          </div>
        </div>
        <!--表格部分-->
        <el-checkbox-group v-model="checkList" :max="2" >
          <el-table
            :data="tableData.slice((curPage - 1) * 20, curPage * 20)"
            :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
            border
            height="626"
            >
            <el-table-column width="40" v-if="isList">
              <template slot-scope="scope">
                <el-checkbox :label="scope.row.index">{{""}}</el-checkbox>
              </template>
            </el-table-column>
            <!--<el-table-column-->
              <!--prop="index"-->
              <!--label="序号"-->
              <!--v-if="isList">-->
            <!--</el-table-column>-->
            <!--<el-table-column-->
              <!--prop="positiveMark"-->
              <!--label="与x为正例"-->
              <!--v-if="isList">-->
            <!--</el-table-column>-->
            <!--<el-table-column-->
              <!--prop="negativeMark"-->
              <!--label="与x为负例"-->
              <!--v-if="isList">-->
            <!--</el-table-column>-->
            <el-table-column
              v-for="(item, index) in columnNames"
              :key="index"
              :prop="item.prop"
              :label="item.label">
            </el-table-column>
          </el-table>
        </el-checkbox-group>
        <!-- 分页符-->
        <el-pagination
          background
          layout="prev, pager, next"
          :total="fileCount"
          :page-size="20"
          @current-change="handleCurrentChange"
          :current-page="curPage">
        </el-pagination>
      </div>
    </el-main>
    <!--查看结果内容块-->
    <el-main v-show="resDetailFlag">
      <!--顶部-->
      <div class="header">
        <i class="el-icon-back" @click="resDetailFlag=false"></i>
        <span style="margin-left:10px;font-size:large;font-weight:bold;">查看上次标注结果</span>
        <!-- <el-button class="headbutton darkBtn" size="small" @click="handleExport">导出</el-button> -->
      </div>
      <el-divider></el-divider>
      <!--中心-->

      <!--结构化数据列表-->
      <div id="tablePart" >
        <el-table
          :data="resTableData"
          :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
          height="626"
          border
          >
          <el-table-column
            v-for="(item, index) in resColumnNames"
            :key="index"
            :prop="item.prop"
            :label="item.label">
          </el-table-column>
        </el-table>
        <!-- 分页符-->
        <!-- <el-pagination
          background
          layout="prev, pager, next"
          :total="fileCount"
          :page-size="20"
          @current-change="handleCurrentChange"
          :current-page="curPage">
        </el-pagination> -->
      </div>
    </el-main>
    <!--查看图谱内容块-->
    <el-main v-show="graphFlag">
      <!--顶部-->
      <div class="header">
        <i class="el-icon-back" @click="graphFlag=false"></i>
        <span style="margin-left:10px;font-size:large;font-weight:bold;">图谱展示</span>
        <!-- <el-button class="headbutton darkBtn" size="small" @click="handleExport">导出</el-button> -->
      </div>
      <el-divider></el-divider>
      <!--搜索栏-->
        请输入搜索关键词：
        <el-input v-model="keyword" placeholder="关键词" style="width:250px;"></el-input>
        <el-select v-model="level" placeholder="请选择查询级数">
          <el-option
            v-for="item in levelList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-button style="margin-left:20px;height: 40px" class="darkBtn" size="small" @click="searchGraph">搜索</el-button>

        <div class="result" style="margin-bottom:50px;">
          <!--关系图谱-->
          <div id="kgPic">
            <div id="graph" style="height:800px; width:1200px;"></div>
          </div>
        </div>
    </el-main>
  </el-container>
</template>

<script>
  let echarts = require('echarts');
  let myChart;
  // window.onresize = function() {
  //   document.getElementById("graph").style.width="100%";
  //   document.getElementById("graph").style.height="100%";
  //   myChart.resize();
  // };

  export default {
    name: "ExtractStruct",
    data () {
      return {
        markSum:"",
        isList:false,
        fileCount:0,
        isUpload:false,
        curPage:1,
        //上传的文件列表
        fileList: [],
        //表格数据，结构化数据列表
        tableData: [],
        //选中行
        choosenRow:{},
        //三元组数据
        tripleData:[],
        rawData:[],
        tableIndex:"",
        choosenInd:[],
        checkList:[],
        portion:"",
        // portionList:["8:2", "7:3", "6:4"],
        //记录标记样例情况
        positiveFatherIndex:{},
        positiveMap:{},
        negativeMap:{},
        properties:[],
        columnNames:[],
        //提交后展示相关信息的显示控制
        showRes:false,
        accuracy:0,
        recall:0,
        resDetailFlag:false,
        //控制设置样例btn禁用
        negativeFlag:true,
        positiveFlag:true,
        negativeMax:-1,
        negativeCount:0,
        positiveMax:-1,
        positiveCount:0,
        //实体对齐时已有训练数据集的数量
        trainCount:0,
        resTableData:[],
        resColumnNames:[],
        //上次已标记的map
        pastSumMap:{},
        //控制显示图谱的相关变量
        graphBtn:false,
        graphFlag:false,
        keyword:"",
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
      }
    },

    methods: {
      //修改表格显示值
      changeTableData(fatherIndex) {
        //处理表格“与x为正例列字符串”
        let indexSet = new Set();
        indexSet.add(fatherIndex);
        for (let i of this.positiveMap[fatherIndex]) {
          indexSet.add(i);
        }
        let indexArray = Array.from(indexSet);
        for (let k=0 ; k< indexArray.length ; k++) {
          let flag=true;
          for (let j=0; j< indexArray.length ; j++) {
            if (j === k)
              continue;
            if(flag){
              this.tableData[indexArray[k]-1].positiveMark = indexArray[j] + "";
              flag=false;
            }
            else {
              this.tableData[indexArray[k]-1].positiveMark += "," + indexArray[j];
            }
          }
        }
      },
      changeDisableFlag(flag) {
        // console.log("judge  max  count")
        // console.log(this.positiveMax, this.negativeMax)
        // console.log(this.positiveCount, this.negativeCount)
        if((flag == 1 || flag === 3) && this.negativeMax <= this.negativeCount) {
          this.negativeFlag = true;
          this.$message({
            message: '负样例总数已达到最大值，若仍需标记请填写更大的用例总数',
            type: 'warning'
          });
        }
        else if(flag == 1 || flag === 3) this.negativeFlag = false;

        if((flag == 2 || flag === 3) && this.positiveMax <= this.positiveCount) {
          this.positiveFlag = true;
          this.$message({
            message: '正样例总数已达到最大值，若仍需标记请填写更大的用例总数',
            type: 'warning'
          });
        }
        else if(flag == 2 || flag === 3) this.positiveFlag = false;
        // console.log(this.positiveFlag, this.negativeFlag)
      },
      setSumCount() {
        if(this.markSum === "") {
          this.positiveMax = 0;
          this.negativeMax = 0;
          this.negativeFlag = true;
          this.positiveFlag = true;
          return;
        }
        let num = parseInt(this.markSum);
        this.positiveMax = Math.ceil(num * 2 / 3);//向上取整
        this.negativeMax = Math.ceil(num * 1 / 3);
        this.changeDisableFlag(3);
        // console.log("set  max  count")
        // console.log(this.positiveMax, this.negativeMax)
        // console.log(this.positiveCount, this.negativeCount)

      },
      backToView(){
        //清空表格并返回
        this.isList=false;
        this.showRes=false;
        this.columnNames = [];
        this.tableData=[];
        this.rawData=[];
      },
      entityMark() {
        this.isList = true;
        if(this.tableIndex === ""){
          this.$message({
            message: '请选择需要进行去噪的表单！',
            type: 'warning'
          });
          return;
        }

        // if(!this.tableData[1]["index"]){
        //   this.tableData = this.tableData.map((cur, index) => {
        //       cur["index"] = index;
        //       cur["negativeMark"] = null;
        //       cur["positiveMark"] = null;
        //       return cur;
        //     })
        //   // this.columnNames = [
        //   //   {prop:"index", label:"序号"}].concat(this.columnNames);
        // }

        let fd = new FormData();
        fd.append('table',this.tableIndex);
        this.$http.post(
          'http://49.232.95.141:8000/pic/start_entity_match',fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then((res) => {
            if(res.data===1){
              this.$message({
                message: '请点击属性去噪后再进行实体对齐！',
                type: 'warning'
              });
              return;
            }
            console.log(res);//count,column,data
            this.trainCount = res.data[0];
            this.positiveMap = {};
            this.negativeMap = {};

            //重新获取表头
            this.columnNames=[
              {prop:"index",label:"序号"},
              {prop:"positiveMark",label:"正例"},
              {prop:"negativeMark",label:"负例"}];
            for(let i=3;i<res.data[1].length;i++)
              this.columnNames.push({prop:res.data[1][i],label:res.data[1][i]});
            this.rawData = [].concat(res.data[2]);

            //加载去噪后数据替换在tableData中
            this.tableData = [].concat(res.data[2].map((cur)=>{
              let res={};
              res["index"] = cur[0];
              res["positiveMark"] = cur[1];
              res["negativeMark"] = cur[2];

              //维护上次标记结果
              if(!this.pastSumMap[cur[0]]) {
                this.pastSumMap[cur[0]] = new Set();
              }
              let str = cur[1]+","+cur[2];
              let sep = str.split(",");
              //默认上次标记时同时记录了a->b和b->a；否则需添加b->a的映射
              for(let i = 0;i <sep.length; i++){
                if(!sep[i]||sep[i]===" "||sep[i]==="")continue;
                if(this.pastSumMap[cur[0]].has(sep[i]))
                  continue;
                else
                  this.pastSumMap[cur[0]].add(parseInt(sep[i]));
              }

              for(let i = 0; i < this.columnNames.length; i ++)
                res[this.columnNames[i].prop] = cur[i]
              return res;
            }));
            this.fileCount = this.rawData.length;

        }).catch((res) => {
          //请求失败
          console.log(res)
        });
        this.positiveMap={};
        this.negativeMap={};
        this.positiveCount = 0;
        this.negativeCount = 0;
        this.portion = "";
        this.isList=true
      },
      deNoise(){
        this.isList = false;
        let fd = new FormData();
        fd.append('table',this.tableIndex);
        this.$http.post(
          'http://49.232.95.141:8000/pic/data_filter',fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then((res) => {
            this.rawData = [].concat(res.data[1]);

            this.columnNames = [].concat(res.data[0].map((cur) => {
              return {prop:cur, label:cur}
            }));

          //加载去噪后数据替换在tableData中
            this.tableData = [].concat(res.data[1].map((cur)=>{
              let res={};
              for(let i = 0; i < this.columnNames.length; i ++)
                res[this.columnNames[i].prop] = cur[i]
              return res;
            }));
           this.fileCount = res.data[1].length

        }).catch((res) => {
          //请求失败
          console.log(res)
        })
      },
      chooseTable() {
        // console.log(this.tableIndex)
        if(this.tableIndex === '') return;

        this.columnNames = []
        this.tableData = []

        let fd = new FormData()
        fd.append('table',this.tableIndex)
        this.$http.post(
          'http://49.232.95.141:8000/pic/view_structData',fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then((res) => {
            this.columnNames = res.data[0].map((cur) => {
              return {prop:cur, label:cur}
            });

            let column = res.data[0];
            this.tableData = res.data[1].map((cur) => {
              let res={};
              for(let i = 0; i < column.length; i ++)
                res[column[i]] = cur[i]
              return res
            });
            this.rawData = res.data[1];

            this.fileCount = res.data[1].length
        }).catch((res) => {
          //请求失败
          console.log(res)
        })
      },
      cancelUpload(){
        this.isUpload=false;
        this.fileList=[];
      },
      submitUpload() {
        this.fileCount = this.tableData.length;
        let now = new Date();
        let date =  now.getFullYear() + "-" + ((now.getMonth() + 1) < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate();
        this.$refs.upload.submit();
        for(let i=0;i<this.fileList.length;i++) {
          this.tableData.push({
            date:  date,
            title: this.fileList[i].raw.name
          })
        }
        this.fileCount = this.tableData.length;
        this.isUpload = false;
        this.fileList =[];
      },
      handleRemove(file, fileList) {
        this.fileList = fileList;
      },
      handleAddFile(file,fileList){
        console.log(file);
        console.log(fileList);
        this.fileList = fileList;
      },
      handleCurrentChange(cpage) {
        this.curPage = cpage;
      },
      findIndex(index){
        //简单遍历查找 后期改为二分查找
        for(let i = 0; i < this.tableData.length; i ++) {
          if(this.tableData[i].index === index) return i;
        }
      },
      //设为正样例
      setPositive(){
        //未填写时不可选
        if(this.markSum === ""){
          this.$message({
            message: '请先输入样例总数或将样例总数设置为更大值',
            type: 'warning'
          });
          return;
        }

        this.checkList.sort(function(a,b){return a>b?1:-1})

        //判断是否重复标记
        if((this.pastSumMap[this.checkList[0]]&&this.pastSumMap[this.checkList[0]].has(this.checkList[1]))||
          (this.positiveMap[this.checkList[0]]&&this.positiveMap[this.checkList[0]].has(this.checkList[1]))||
          (this.negativeMap[this.checkList[0]]&&this.negativeMap[this.checkList[0]].has(this.checkList[1]))){
          this.checkList=[];
          this.$message({
            message: '该对实体已标记，请重新选择',
            type: 'warning'
          });
          return;
        }

        //计算正例个数并维护对应的set
        //为解决已标记AB1再标记BC1的情况时，将C放入A的value中，而不是B的value中
        //positiveFatherIndex用于记录A的位置
        let indexMin, oldCount, newCount;
        if(!this.positiveFatherIndex[this.checkList[0]] && !this.positiveFatherIndex[this.checkList[1]]) {
          //这一组实体都没被标记过
          if(!this.positiveMap[this.checkList[0]]) {
            this.positiveMap[this.checkList[0]] = new Set();
            oldCount = 0;
          }
          else {
            oldCount = this.getCombinationNum(this.positiveMap[this.checkList[0]].size +1);
          }
          if(this.positiveMap[this.checkList[1]]) {
            oldCount += this.getCombinationNum(this.positiveMap[this.checkList[1]].size + 1);
            for(let i of this.positiveMap[this.checkList[1]]) {
              this.positiveMap[this.checkList[0]].add(i);
              this.positiveFatherIndex[i] = this.checkList[0];
            }
            this.positiveMap[this.checkList[1]] = null;
          }
          this.positiveMap[this.checkList[0]].add(this.checkList[1]);
          this.positiveFatherIndex[this.checkList[1]] = this.checkList[0];
          indexMin = this.checkList[0]
        }
        else {
          //若标注的(a,b)任意之一被标记过则最小实体序号有三种可能：fatherA, fatherB, a
          //a(this.checkList[0])最小
          //此时一定不存在fatherA且fatherB小于a，由于不属于上种情况，一定存在fatherB
          if(!this.positiveFatherIndex[this.checkList[0]] &&
          this.positiveFatherIndex[this.checkList[1]] > this.checkList[0]) {
            indexMin = this.checkList[0];
            let fatherB = this.positiveFatherIndex[this.checkList[1]]
            if(!this.positiveMap[indexMin]) {
              this.positiveMap[indexMin] = new Set();
              oldCount = 0;
            }
            else {
              oldCount = this.getCombinationNum(this.positiveMap[indexMin].size +1);
            }
            oldCount += this.getCombinationNum(this.positiveMap[fatherB].size + 1);
            for(let i of this.positiveMap[fatherB]) {
              this.positiveMap[indexMin].add(i);
              this.positiveFatherIndex[i] = indexMin;
            }
            this.positiveFatherIndex[fatherB] = indexMin;
            this.positiveMap[fatherB] = null;
            this.positiveMap[indexMin].add(fatherB);
          }
          //fatherA最小
          else if(this.positiveFatherIndex[this.checkList[0]] &&
          ((!this.positiveFatherIndex[this.checkList[1]] && this.positiveFatherIndex[this.checkList[0]] < this.checkList[1])
          ||(this.positiveFatherIndex[this.checkList[1]] && this.positiveFatherIndex[this.checkList[0]] < this.positiveFatherIndex[this.checkList[1]]))) {
            indexMin = this.positiveFatherIndex[this.checkList[0]];
            oldCount = this.getCombinationNum(this.positiveMap[indexMin].size + 1);
            let fatherB = this.positiveFatherIndex[this.checkList[1]];
            if(fatherB) {
              oldCount += this.getCombinationNum(this.positiveMap[fatherB].size + 1);
              for(let i of this.positiveMap[fatherB]) {
                this.positiveMap[indexMin].add(i);
                this.positiveFatherIndex[i] = indexMin;
              }
              this.positiveFatherIndex[fatherB] = indexMin;
              this.positiveMap[fatherB] = null;
              this.positiveMap[indexMin].add(fatherB);
            }
            else {
              if(this.positiveMap[this.checkList[1]]) {
                oldCount += this.getCombinationNum(this.positiveMap[this.checkList[1]].size + 1);
                for(let i of this.positiveMap[this.checkList[1]]) {
                  this.positiveMap[indexMin].add(i);
                  this.positiveFatherIndex[i] = indexMin;
                }
                this.positiveMap[this.checkList[1]] = null;
              }
              this.positiveFatherIndex[this.checkList[1]] = indexMin;
              this.positiveMap[indexMin].add(this.checkList[1]);
            }
          }
          //fatherB最小
          else if(this.positiveFatherIndex[this.checkList[1]] &&
          ((!this.positiveFatherIndex[this.checkList[0]] && this.positiveFatherIndex[this.checkList[1]] < this.checkList[0])
          ||(this.positiveFatherIndex[this.checkList[0]] && this.positiveFatherIndex[this.checkList[1]] < this.positiveFatherIndex[this.checkList[0]]))){
            indexMin = this.positiveFatherIndex[this.checkList[1]];
            oldCount = this.getCombinationNum(this.positiveMap[indexMin].size + 1);
            let fatherA = this.positiveFatherIndex[this.checkList[0]];
            if(fatherA) {
              oldCount += this.getCombinationNum(this.positiveMap[fatherA].size + 1);
              for(let i of this.positiveMap[fatherA]) {
                this.positiveMap[indexMin].add(i);
                this.positiveFatherIndex[i] = indexMin;
              }
              this.positiveFatherIndex[fatherA] = indexMin;
              this.positiveMap[fatherA] = null;
              this.positiveMap[indexMin].add(fatherA);
            }
            else {
              if(this.positiveMap[this.checkList[0]]) {
                oldCount += this.getCombinationNum(this.positiveMap[this.checkList[0]].size + 1);
                for(let i of this.positiveMap[this.checkList[0]]) {
                  this.positiveMap[indexMin].add(i);
                  this.positiveFatherIndex[i] = indexMin;
                }
                this.positiveMap[this.checkList[0]] = null;
              }
              this.positiveFatherIndex[this.checkList[0]] = indexMin;
              this.positiveMap[indexMin].add(this.checkList[0]);
            }
          }
        }
        newCount = this.getCombinationNum(this.positiveMap[indexMin].size + 1);
        this.positiveCount += newCount - oldCount;

        console.log("---")
        console.log(this.positiveMap);
        console.log(this.positiveFatherIndex);
        console.log(indexMin);

        //修改字符串与x为正例
        this.changeTableData(indexMin);

        //修改btn是否禁用
        this.changeDisableFlag(2);
        this.checkList = [];
      },
      //设为负样例
      setNegative(){
        //未填写时不可选
        if(this.markSum === ""){
          this.$message({
            message: '请先输入样例总数或将样例总数设置为更大值',
            type: 'warning'
          });
          return;
        }

        this.checkList.sort(function(a,b){return a>b?1:-1});
        let index;
        index = this.checkList[0];

        //判断是否重复标记
        if((this.pastSumMap[this.checkList[0]]&&this.pastSumMap[this.checkList[0]].has(this.checkList[1]))||
          (this.positiveMap[this.checkList[0]]&&this.positiveMap[this.checkList[0]].has(this.checkList[1]))||
          (this.negativeMap[this.checkList[0]]&&this.negativeMap[this.checkList[0]].has(this.checkList[1]))){
          this.checkList=[];
          this.$message({
            message: '该对实体已标记，请重新选择',
            type: 'warning'
          });
          return;
        }

        //计算负例个数并维护对应的set
        if(!this.negativeMap[index]) {
          this.negativeMap[index] = new Set();
        }
        if(this.negativeMap[index].has(this.checkList[1])) {
          this.checkList = [];
          return;
        }
        else {
          this.negativeMap[index].add(this.checkList[1]);
        }
        this.negativeCount += 1;
        //修改btn是否禁用
        this.changeDisableFlag(1);

        //处理表格“与x为负例列字符串”
        let indexi = this.findIndex(this.checkList[0]);
        let indexj = this.findIndex(this.checkList[1]);
        if(this.tableData[indexi].negativeMark===" ")
          this.tableData[indexi].negativeMark = this.checkList[1] + "";
        else
          this.tableData[indexi].negativeMark += "," + this.checkList[1];
        if(this.tableData[indexj].negativeMark===" ")
          this.tableData[indexj].negativeMark = this.checkList[0] + "";
        else
          this.tableData[indexj].negativeMark += "," + this.checkList[0];
        // for(let i = 0; i < this.checkList.length; i ++){
        //   let indexi = this.findIndex(this.checkList[i]);
        //   for(let j = 0; j < this.checkList.length; j ++){
        //     if(i === j) continue;
        //     // let indexj = this.findIndex(this.checkList[j]);
        //     if(this.tableData[indexi].negativeMark!==" ")
        //       this.tableData[indexi].negativeMark += ", " + this.checkList[j];
        //     else this.tableData[indexi].negativeMark = this.checkList[j] + "";
        //   }
        // }
        console.log(this.negativeMap);
        this.checkList = [];
      },

      getCombinationNum(n){
        return n * (n - 1) / 2;
      },
      getCombinationArray(map, flag){
        let res = [];
        if(flag === 1){
          for(let key in map){
            // console.log(key)
            // console.log(map[key])
            let tmp = Array.from(map[key]);
            tmp.push(parseInt(key))
            // console.log("!!!")
            // console.log(key, tmp)
            for(let i = 0; i < tmp.length; i ++) {
              for(let j = i + 1; j < tmp.length; j ++) {
                res.push([this.rawData[tmp[i]],this.rawData[tmp[j]], flag])
                // console.log("---")
                // console.log(tmp[i], this.rawData[tmp[i]])
                // console.log(tmp[j], this.rawData[tmp[j]])
              }
            }
          }
        }
        else if(flag === 0){
          for(let key in map){
            let tmp = Array.from(map[key]);
            // tmp.push(parseInt(key))
            let index = parseInt(key);
            for(let i = 0; i < tmp.length; i ++) {
              res.push([this.rawData[index],this.rawData[tmp[i]], flag])
            }
          }
        }
        console.log('---')
        console.log(res);
        return res;
      },
      submitMarks(){
        console.log(this.tableData, this.columnNames)
        if(this.portion === ""){
          this.$message({
            message: '请选择用于训练集、测试集的比例！',
            type: 'warning'
          });
          return;
        }
        let num = parseInt(this.markSum)
        if(num > (this.negativeCount + this.positiveCount)){
          this.$message({
            message: '输入的样例总数仍大于已标注的样例数！请标注更多样例或减小总数！',
            type: 'warning'
          });
          return;
        }
        let positiveArray = this.getCombinationArray(this.positiveMap, 1);
        let negativeArray = this.getCombinationArray(this.negativeMap, 0);
        let Arr = positiveArray.concat(negativeArray);
        // console.log("rec:");
        // console.log(rec);
        let portion = this.portion.split(":");
        if(portion.length !== 2) {
          this.$message({
            message: '用于训练集、测试集的样例比例输入格式有误！',
            type: 'warning'
          });
          return;
        }
        portion[0] = parseInt(portion[0]);
        portion[1] = parseInt(portion[1]);
        let tableName = [this.tableIndex];
        let positiveMarkList = [];
        let negativeMarkList = [];
        for(let i = 0; i < this.tableData.length; i ++){
          positiveMarkList.push(this.tableData[i].positiveMark);
          negativeMarkList.push(this.tableData[i].negativeMark);
        }


        let fd = new FormData();
        fd.append('struct_train_test_data',JSON.stringify(Arr));
        fd.append('ratio', JSON.stringify(this.portion));
        fd.append('table', JSON.stringify(tableName));
        fd.append('mark', JSON.stringify([positiveMarkList, negativeMarkList]));
        // console.log(Arr)
        // console.log(this.portion)
        // console.log(tableName)
        // console.log(positiveMarkList, negativeMarkList)
        this.$http.post(
          'http://49.232.95.141:8000/pic/entity_match',fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then((res) => {
          console.log(res);

          this.trainCount = res.data[0];
          this.accuracy = res.data[1] * 100;
          this.recall = res.data[2] * 100;
          //查看结果页表格数据
          this.resColumnNames = [];
          this.resTableData = [];
          let rawColumnNames = []
          for(let i = 0; i < this.columnNames.length; i ++) {
            rawColumnNames.push(this.columnNames[i])
          }
          this.resColumnNames = [{prop:"num", label:"组号"},{prop:"flag", label:"结果"}].concat(rawColumnNames.splice(3));
          let count = 1;
          let correct = [];
          if(res.data[3]) {
            for(let i = 0; i < res.data[3].length; i ++){
              let tmp = res.data[3][i];
              tmp = tmp.map((cur) => {
                let rec = {};
                rec["flag"] = "正确";
                rec["num"] = count + "";
                for (let i = 2; i < this.resColumnNames.length; i++)
                  rec[this.resColumnNames[i].prop] = cur[i - 1]
                return rec
              })
              for(let j = 0; j < tmp.length; j ++){
                correct.push(tmp[j])
              }
              count++;
            }
          }

          let fault = [];
          if(res.data[4][0]) {
            for(let i = 0; i < res.data[4].length; i ++){
              let tmp = res.data[4][i];
              tmp = tmp.map((cur) => {
                let rec = {};
                rec["flag"] = "错误";
                rec["num"] = count+"";
                for (let i = 2; i < this.resColumnNames.length; i++)
                  rec[this.resColumnNames[i].prop] = cur[i - 1]
                return rec
              })
              for(let j = 0; j < tmp.length; j ++){
                fault.push(tmp[j])
              }
              count++;
            }
          }
          this.resTableData = correct.concat(fault);

          this.showRes = true;
          this.graphBtn = true;

          // //原rawData删除已标记数据(rec中)
          // for(let i=rec.length-1;i>=0;i--){
          //   this.rawData.splice(rec[i],1);
          // }
          // //在头部添加新数据
          // for(let i=0;i<res.data[2].length;i++){
          //   this.rawData.unshift(res.data[2][i]);
          // }
          // //更新tableData
          // console.log(this.columnNames)
          // this.tableData = this.rawData.map((cur,index) => {
          //   let res={};
          //   res["index"] = index;
          //   res["negativeMark"] = null;
          //   for(let i = 0; i < this.columnNames.length-2; i ++)
          //     res[this.columnNames[i+2].prop] = cur[i]
          //   return res
          // });

        }).catch((res) => {
          //请求失败
          console.log(res)
        })
      },
      returnUnmarks(){
        this.$message({
          message: '剩余数据标注完成！',
          type: 'success'
        });
      },
      //导出三元组
      handleExport(){
        //处理数据
        let data="head,relation,tail\n";
        this.tripleData.forEach(function (item,index) {
          data+=item.source+","+item.name+","+item.target+"\n";
        });
        let filename = this.choosenRow.title.split(".")[0];
        console.log(filename);
        //创建<a>下载文件
        let export_blob = new Blob([data],{type: 'text/csv',endings : 'native'});
        let save_link = document.createElement("a");
        save_link.href = URL.createObjectURL(export_blob);
        save_link.download = filename+".csv";
        save_link.click();
      },
      loadData() {
        this.$http.post(
          'http://49.232.95.141:8000/pic/show_table',
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then((res) => {
          this.properties = res.data
        }).catch((res) => {
          //请求失败
          console.log(res)
        })
      },
      showGraph(){
        this.graphFlag=true
        let graphPoint = [];
        let graphLink = [];

        graphPoint=[{
          name:'1',
          category:0
          },{
          name:'2',
          category:1
          },{
          name:'3',
          category:1
          }]
        graphLink.push({
          source: '1',
          target: '2',
          name: 'r',
        });
        let categories=[
          {name:'属性1'},
          {name:'属性2'},
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
        myChart= echarts.init(document.getElementById('graph'));
        // 绘制图表
        myChart.setOption(option, true);
      },
      searchGraph(){
        console.log(this.keyword)
      }
    },
    mounted() {

    }
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
    text-align: left;
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
  .headbutton{
    float: right;
    margin-right: 40px;
  }
  .top-tip{
    margin-top: -10px;
    margin-bottom: 10px;
    padding-left: 20px;
  }

  /*************内容中心*************/
  .main{
    line-height: 30px;
    height: 90%;
    width: 100%;
  }
  /*表格*/
  .el-table{
    height: 80%;
    width: 100%;
    /*box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);*/
  }
  .el-table--border, .el-table--group{
    border: 0;
  }
  /*分页符*/
  .el-pagination{
    right: 60px;
    height: 10%;
    text-align: right;
    margin-top: 40px;
  }

  #matchInfo{
    background-color: #F0F9EB;
    color: #67C23A;
    padding: 8px 16px;
    width: 95%;
    padding:8px 16px;
    border-radius: 10px;
    margin: 0 0 15px 10px;
    font-size: 13px;
  }
  .el-pagination.is-background .el-pager li:not(.disabled).active{
    background-color: #5775FB !important;
  }
  .el-pagination.is-background .el-pager li:hover{
    color: #5775FB !important;
  }

  /***************上传弹窗***********/
  .upload{
    text-align: center;
    z-index: 99;
    position: fixed;
    top: 20%;
    left: 30%;
    right: 30%;
  }
  .upload-demo{
    margin-bottom: 20px;
  }
  .el-upload__tip{
    padding-left: 30%;
    text-align: left;
  }
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  /***********按钮样式***********/
  .blueBtn{
    background-color: #EFF0FF;
    border: 1px solid #5775FB;
    color: #5775FB;
  }

  .blueBtn:hover,.blueBtn:active, .blueBtn:focus{
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

  .textBtn {
    color:#606266;
    text-decoration: underline;
  }

  .textBtn:hover {
    color: #7c7c7c;
  }
  /*关系图*/
  #kgPic{
    height: 800px;
    width: 100%;
    margin-top: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    background-color: #fff;
  }
  .result{
    width:100%;
  }
</style>
