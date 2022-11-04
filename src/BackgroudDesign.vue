<template>
  <div>
    <el-container class="color-container">
      <el-scrollbar class="color-scrollbar">
        <el-aside style="width: 360px; height: 89vh; margin-bottom: 0;">
          <el-row>
            <el-col :span="12">
              <span class="text">宽度</span>
              <el-input v-model="width" placeholder="宽度" class="size10-cal" @change="changeWidth"></el-input>
            </el-col>
            <el-col :span="12">
              <span class="text">高度</span>
              <el-input v-model="height" placeholder="高度" class="size10-cal" @change="changeHeight"></el-input>
            </el-col>
          </el-row>
          <el-row class="color-option">
            <p class="text">色彩模式</p>
            <el-button-group class="size10-cal">
              <el-button :type="colorPattern.selectGradient" @click="checkGradientr">渐变</el-button>
              <el-button :type="colorPattern.selectSparkle" @click="checkSparkle">闪烁</el-button>
              <el-button :type="colorPattern.selectShadows" @click="checkShadows">阴影</el-button>
            </el-button-group>
          </el-row>
          <el-row>
            <p class="text">强度</p>
            <el-slider v-model="intensity" class="size10-cal" @change="changeIntensity"></el-slider>
          </el-row>
          <el-row>
            <p class="text">方差</p>
            <el-slider v-model="variance" class="size10-cal" @change="changeVariance"></el-slider>
          </el-row>
          <el-row>
            <p class="text">尺寸</p>
            <el-slider v-model="cellSize" class="size10-cal" @change="changeCellSize"></el-slider>
          </el-row>
          <el-row>
            <el-button class="size10-cal" @click="randomGenerate">随机生成</el-button>
          </el-row>
          <el-row class="model-option">
            <p class="text">模式</p>
            <el-button-group class="size10-cal">
              <el-button :type="colorSelect.selectDefault" @click="checkDefaultColor">色彩选择</el-button>
              <el-button :type="colorSelect.selectSelf" @click="checkSelfColor">自定义</el-button>
            </el-button-group>
          </el-row>
          <el-row>
            <el-tooltip class="item" effect="dark" :content="pattern == 0 ? '随机颜色' : '添加自定义颜色'" placement="top">
              <el-button class="size10-cal" @click="generateColor">
                <svg-icon :icon-class="pattern == 0 ? 'random' : 'add'"/>
              </el-button>
            </el-tooltip>
          </el-row>
          <div v-if="pattern == 0">
            <el-row  v-for="colorItem in colorData" :key="colorItem.id" class="mt-10">
              <el-tooltip class="item" effect="dark" :content="colorItem.title" placement="top">
                <el-col>
                  <div class="color-box" @click="changeDefaultColor(colorItem.color)">
                    <div v-for="color in colorItem.color" :key="color.id" class="color-div" :style="{backgroundColor: color}"></div>
                  </div>
                </el-col>
              </el-tooltip>
            </el-row>
          </div>
          <div v-else>
            <el-row  v-for="colorItem in colorSelf" :key="colorItem.id" class="mt-10">
              <el-col>
                <div class="color-box" @click="changeDefaultColor(colorItem.color)">
                  <div v-for="color in colorItem.color" :key="color.id" class="color-div" :style="{backgroundColor: color}"></div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-aside>
      </el-scrollbar>
      <el-main>
        <div class="backgroud-canvas">
          <canvas id="background"></canvas>
          <div class="backgroud-export">
            <el-button class="button-export" icon="el-icon-download" @click="exportBackground">导出</el-button>
          </div>
        </div>
      </el-main>
    </el-container>
    <background-self :show-self="showSelf" @close-self="showSelf=false" @save-self="saveSelf"></background-self>
  </div>
</template>

<script>
import BackgroundSelf from "./components/BackgroundSelf"
import Trianglify from "trianglify/dist/trianglify";
import { getRandomNum, deepClone } from "@/libs/utils";
export default {
  name: 'BackgroundManage',
  data () {
    return {
      colorSelect: {
        selectDefault: 'primary',
        selectSelf: '',
      },
      colorPattern: {
        selectGradient: 'primary',
        selectSparkle: '',
        selectShadows: ''
      },
      showSelf: false,
      width: 1200,
      height: 600,
      intensity: 0,            // 模式强度
      variance: 0,             // 三角形方差
      cellSize: 0,            // 元素尺寸
      pattern: 0,            // 元素尺寸,
      trianglify: '',
      colors: [],
      colorList: [
        ['rgb(255, 255, 229)', 'rgb(247, 252, 185)', 'rgb(217, 240, 163)', 'rgb(173, 221, 142)', 'rgb(120, 198, 121)', 'rgb(65, 171, 93)', 'rgb(35, 132, 67)', 'rgb(0, 104, 55)', 'rgb(0, 69, 41)'],
        ['rgb(255, 255, 217)', 'rgb(237, 248, 177)', 'rgb(199, 233, 180)', 'rgb(127, 205, 187)', 'rgb(65, 182, 196)', 'rgb(29, 145, 192)', 'rgb(34, 94, 168)', 'rgb(37, 52, 148)', 'rgb(8, 29, 88)']
      ],
      colorData: [
        {title: "OrRd", color: ["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"],},
        {title: "PuBu", color: ["#fff7fb", "#ece7f2", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#045a8d", "#023858"],},
        {title: "BuPu", color: ["#f7fcfd", "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#810f7c", "#4d004b"],},
        {title: "Oranges", color: ["#fff5eb", "#fee6ce", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#a63603", "#7f2704"],},
        {title: "BuGn",  color: ["#f7fcfd", "#e5f5f9", "#ccece6", "#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#006d2c", "#00441b"],},
        {title: "YlOrBr", color: ["#ffffe5", "#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"],},
        {title: "YlGn", color: ["#ffffe5", "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#006837", "#004529"],},
        {title: "Reds", color: ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"],},
        {title: "RdPu", color: ["#fff7f3", "#fde0dd", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177", "#49006a"],},
        {title: "Greens", color: ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"],},
        {title: "YlGnBu", color: ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"],},
        {title: "Purples", color:["#fcfbfd", "#efedf5", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#54278f", "#3f007d"],},
        {title: "GnBu", color:["#f7fcf0", "#e0f3db", "#ccebc5", "#a8ddb5", "#7bccc4", "#4eb3d3", "#2b8cbe", "#0868ac", "#084081"],},
        {title: "Greys", color: ["#ffffff", "#f0f0f0", "#d9d9d9", "#bdbdbd", "#969696", "#737373", "#525252", "#252525", "#000000"],},
        {title: "YlOrRd", color: ["#ffffcc", "#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#bd0026", "#800026"],},
        {title: "PuRd", color: ["#f7f4f9", "#e7e1ef", "#d4b9da", "#c994c7", "#df65b0", "#e7298a", "#ce1256", "#980043", "#67001f"],},
        {title: "Blues", color: ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"],},
        {title: "PuBuGn", color: ["#fff7fb", "#ece2f0", "#d0d1e6", "#a6bddb", "#67a9cf", "#3690c0", "#02818a", "#016c59", "#014636"],},
        {title: "Viridis", color: ["#440154", "#482777", "#3f4a8a", "#31678e", "#26838f", "#1f9d8a", "#6cce5a", "#b6de2b", "#fee825"],},
        {title: "Spectral", color:["#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#e6f598", "#abdda4", "#66c2a5"],},
        {title: "RdYlGn", color: ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63"],},
        {title: "RdBu", color:["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#f7f7f7", "#d1e5f0", "#92c5de", "#4393c3"],},
        {title: "PiYG", color:["#8e0152", "#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#f7f7f7", "#e6f5d0", "#b8e186", "#7fbc41"],},
        {title: "PRGn", color: ["#40004b", "#762a83", "#9970ab", "#c2a5cf", "#e7d4e8", "#f7f7f7", "#d9f0d3", "#a6dba0", "#5aae61"],},
        {title: "RdYlBu", color: ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1"],},
        {title: "BrBG", color:["#543005", "#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#f5f5f5", "#c7eae5", "#80cdc1", "#35978f"],},
        {title: "RdGy", color: ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#ffffff", "#e0e0e0", "#bababa", "#878787"],},
        {title: "PuOr", color: ["#7f3b08", "#b35806", "#e08214", "#fdb863", "#fee0b6", "#f7f7f7", "#d8daeb", "#b2abd2", "#8073ac"],},
        {title: "Set2", color:["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3", "#4575b4"],},
        {title: "Accent", color: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f", "#bf5b17", "#666666", "#313695"],},
        {title: "Set1", color: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf", "#999999"],},
        {title: "Set3", color: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9"],},
        {title: "Dark2", color: ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666", "#01665e",],},
        {title: "Paired", color: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6"],},
        {title: "Pastel2", color: ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4", "#e6f5c9", "#fff2ae", "#f1e2cc", "#cccccc", "#003c30"],},
        {title: "Pastel1", color: ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec", "#f2f2f2"]},
      ],
      colorSelf: [],
    }
  },

  mounted () {
    this.randomColor();
    this.randomSlider();
    this.generateBackground();
  },

  methods: {

    checkGradientr () {
      this.colorPattern.selectGradient = 'primary';
      this.colorPattern.selectSparkle = '';
      this.colorPattern.selectShadows = '';
    },

    checkSparkle () {
      this.colorPattern.selectGradient = '';
      this.colorPattern.selectSparkle = 'primary';
      this.colorPattern.selectShadows = '';
    },

    checkShadows () {
      this.colorPattern.selectGradient = '';
      this.colorPattern.selectSparkle = '';
      this.colorPattern.selectShadows = 'primary';
    },

    checkDefaultColor () {
      this.pattern = 0;
      this.colorSelect.selectDefault = 'primary';
      this.colorSelect.selectSelf = '';
    },

    checkSelfColor () {
      this.pattern = 1;
      this.colorSelect.selectDefault = '';
      this.colorSelect.selectSelf = 'primary';
    },

    generateBackground () {
      var xColors = this.colors && this.colors.length > 0 ? this.colors : 'random';
      const defaultOptions = {
        width: this.width,
        height: this.height,
        cellSize: this.cellSize || 75,
        variance: this.variance || 0.75,
        seed: null,
        xColors: xColors,
        yColors: 'match',
        fill: true,
        palette: Trianglify.utils.colorbrewer,
        colorSpace: 'lab',
        // colorFunction: Trianglify.colorFunctions.interpolateLinear(0.5),
        strokeWidth: 0,
        points: null
      }
      this.trianglify = Trianglify(defaultOptions);
      this.trianglify.toCanvas(document.getElementById('background'));
    },

    // 随机或者添加颜色
    generateColor () {
      if (this.pattern == 0) {
        this.randomColor();
        this.generateBackground();
      } else {
        this.showSelf = true;
      }
    },

    // 随机颜色
    randomColor () {
      var colorIndex = getRandomNum(0, this.colorData.length);
      this.colors = this.colorData[colorIndex].color;
    },  

    // 修改宽度
    changeWidth () {
      this.generateBackground()
    },

    // 修改高度
    changeHeight () {
      this.generateBackground()
    },

    // 随机生成滑块数值
    randomSlider () {
      this.intensity = getRandomNum(1, 100);
      this.variance = getRandomNum(1, 100);
      this.cellSize = getRandomNum(1, 100);
    },

    // 随机生成
    randomGenerate () {
      this.randomSlider();
      this.generateBackground();
    },

    // 修改强度
    changeIntensity () {
      this.generateBackground();
    },

    // 修改方差
    changeVariance () {
      this.generateBackground();
    },

    // 修改尺寸
    changeCellSize () {
      this.generateBackground();
    },

    // 导出图片
    exportBackground () {
      var canvas = this.trianglify.toCanvas();
      var url = canvas.toDataURL("imgae/png");
      var a = document.createElement('a');
      a.href = url;
      a.download = 'background.png';
      a.click();
      window.URL.revokeObjectURL(url); // 释放
    },

    // 选择默认颜色
    changeDefaultColor(colors) {
      this.colors = colors
      this.generateBackground();
    },  

    // 保存自定义颜色
    saveSelf (colors) {
      this.colorSelf.push({title: "self", color: deepClone(colors)})
    }, 
  },
  components: {
    BackgroundSelf
  }
}
</script>
