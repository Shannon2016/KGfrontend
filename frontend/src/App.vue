<template>
  <div id="app">
    <el-container>
      <!-- 顶部导航栏-->
      <el-header>
        <div id="logo" style="position:absolute; left:30px; top:3px;">
          <img src="./assets/KGLogo.png" />
          <span style="margin-left:10px;font-size:large;font-weight:bold;">军事知识管理系统</span>
        </div>
        <el-row type="flex" justify="end">
          <!-- <el-col id="logo" :span="3">
            <img src="./assets/KGLogo.png" />
            作战文书管理系统
          </el-col> -->
          <el-col style="position:relative;">
            <MyMenu/>
          </el-col>
          <el-col id="user" :span="2">
            <MyDropdown :username="usrName"/>
          </el-col>
        </el-row>
      </el-header>
      <router-view/>
    </el-container>
  </div>
</template>

<script>
import DataLabel from "./components/DataLabel"
import MyMenu from "./components/MyMenu"
import MyDropdown from "./components/MyDropdown"
export default {
  name: 'App',
  components:{
    DataLabel,
    MyMenu,
    MyDropdown
  },
  data(){
    return {
      usrName:"Admin"
    }
  },

  methods: {
  }
}
</script>

<style>
  html,body,#app,.el-container{
    width: 100%;
    height: 100%;
    margin: 0 auto;
    padding: 0;
  }


#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

 body > .el-container {
   width: 100%;
   height: 100%;
 }

.el-header{
  background-color: #B3C0D1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  background-color: #D3DCE6;
  color: #333;
  text-align: center;
  height: 100%;
}

.el-main {
  background-color: #E9EEF3;
  color: #333;
  text-align: center;
  height: 100%;
}

#logo >img{
  width: 40px;
  vertical-align:middle;
}

.el-dropdown {
  vertical-align: top;
}
.el-dropdown + .el-dropdown {
  margin-left: 15px;
}
.el-icon-arrow-down {
  font-size: 12px;
}

header div div ul{
  width: fit-content;
}

.el-header{
  background-color: #2C2B31;
  color: white;
}
</style>
