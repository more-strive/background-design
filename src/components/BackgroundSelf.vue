
<template>
  <div class="self-background">
    <el-dialog :visible.sync="dialogVisible" @close="closeSelf()" width="35%">
      <div class="self-main">
        <div class="self-content">
          <canvas id="selfBackground"></canvas>
        </div>
      </div>
      <div class="self-footer">
        <label class="self-lable">点击方块修改颜色</label>
        <div class="self-color">
          <div class="color-content">
            <!-- <el-color-picker v-for="color in selfColors" :key="color.id" :value="color" class="color-item"></el-color-picker> -->
            <div v-for="(color,index) in selfColors" :key="color.id" :style="{backgroundColor: color}" class="color-item">
              <el-color-picker :value="color" @active-change=" (item) => chanegSelfColor(index, item)"></el-color-picker>
            </div>
            <el-button class="color-bt ml-10" circle icon="el-icon-plus" @click="addColor" v-if="selfColors.length < 11"></el-button>
            <el-button class="color-bt ml-10" circle icon="el-icon-minus" @click="subColor" v-if="selfColors.length > 2"></el-button>
          </div>
        </div>
        <el-button round type="text" @click="saveColors">保存颜色</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Trianglify from "trianglify/dist/trianglify";
export default {
  props: ['showSelf'],
  data () {
    return {
      color2: '',
      dialogVisible: false,
      selfColors: ['#FF613B', '#FFFF9D', '#BEEB9F', '#79BD8F', '#00A388'],
      width: 1440,
      height: 900,
      cellSize: '',
      variance: '',
    }
  },
  watch: {
    showSelf (val) {
      if (val) {
        this.dialogVisible = val;
        this.$nextTick(() => {
          this.generateBackground();
        })
      }
    }
  },
  methods: {

    generateBackground () {
      var xColors = this.selfColors && this.selfColors.length > 0 ? this.selfColors : 'random';
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
        colorFunction: Trianglify.colorFunctions.interpolateLinear(0.5),
        strokeWidth: 0,
        points: null
      }
      const trianglify = Trianglify(defaultOptions);
      trianglify.toCanvas(document.getElementById('selfBackground'));
    },

    addColor () {
      this.selfColors.push(this.selfColors[this.selfColors.length - 1]);
      this.generateBackground();
    },

    subColor () {
      this.selfColors.pop();
      this.generateBackground();
    },

    saveColors () {
      this.dialogVisible = false;
      this.$emit('save-self', this.selfColors);
    },

    chanegSelfColor (index, color) {
      this.selfColors.splice(index, 1, color);
      this.generateBackground();
    },

    /**
     * @description: 关闭弹窗
     * @param {type} 
     * @return: 
     */
    closeSelf () {
      this.dialogVisible = false;
      this.$emit('close-self');
    }
  }
}
</script>
