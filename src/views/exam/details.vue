<template>
  <el-container style="height: 100vh; border: 1px solid #eee">
    <el-container>
      <el-main class="right">
        <el-col>
          <el-card v-if="examInfo" class="exam-summary">
            <div slot="header" class="summary-title">考试基本信息</div>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">考试名称</span>
                <span>{{ examInfo.title }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">试卷总分</span>
                <span>{{ examInfo.grossScore }} 分</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">及格分数</span>
                <span>{{ examInfo.passedScore }} 分</span>
              </div>
              <div class="summary-item summary-time">
                <span class="summary-label">考试时间</span>
                <span>{{ examTimeText }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">考试时长</span>
                <span>{{ examInfo.examDuration }} 分钟</span>
              </div>
              <div class="summary-item summary-classes">
                <span class="summary-label">发布班级</span>
                <span>{{ gradeNamesText }}</span>
              </div>
            </div>
          </el-card>
          <el-card class="qu_list">
            <div>
              <!-- eslint-disable-next-line vue/no-template-shadow -->
              <template v-for="(index,indexx) in data">
                <!-- eslint-disable-next-line vue/require-v-for-key -->
                <div
                  v-if="
                    index.quType === 1 ||
                    index.quType === 2 ||
                    index.quType === 3
                  "
                  :class="'index' + index"
                >
                  <el-row :gutter="24">
                    <el-col :span="20" style="text-align: left">
                      <!-- 题目: 序号、类型、题干 -->
                      <div>
                        <!-- <div class="qu_num">{{ index }}</div> -->
                        <!-- 【 单选题 】 -->
                        <div class="qu_content">{{indexx+1}}、{{ index.title }}</div>

        
                      </div>
                      <div v-if="index.image != null && index.image != ''">
                        <el-image :src="index.image"
                        :preview-src="[index.image]" 
                        style="height: 100px" />
                      </div>
                      <!-- 选项 -->
                      <el-radio-group class="qu_choose_group">
                        <!-- ['A', 'B', 'C', 'D'] -->
                        <el-radio
                          v-for="(item, indexs) in index.option"
                          :key="indexs"
                          :label="item.content"
                          border
                          class="qu_choose"
                          :class="{
                            imgC: item.image != null && item.image != '',
                            isRight:
                              item.isRight,
                            incorrect:
                              index.myOption != null &&
                              isCheck(index.myOption, item.sort) &&
                              !item.isRight,
                          }"
                        >
                          <!-- 选项flex浮动 -->
                          <div class="qu_choose_tag">
                            <div class="qu_choose_tag_type">
                              {{ numberToLetter(indexs) }}、{{ item.content }}.
                            </div>
                            <!-- 选项内容和图片 -->
                            <div
                              v-if="item.image != null && item.image != ''"
                              style="clear: both"
                            >
                              <el-image
                                :src="item.image"
                                :preview-src="[item.image]" 
                                style="max-width: 200px"
                              />
                            </div>
                            <div v-if="item.image != null && item.image != ''">
                              <el-image
                              :preview-src="[item.image]" 
                                :src="item.image"
                                class="qu_choose_tag_img"
                              />
                            </div>
                          </div>
                        </el-radio>
                      </el-radio-group>

                      <!-- 题目解析 -->
                      <div class="qu_analysis">
                        <el-card>
                  
                          <div style="margin-top: 8px">
                            <span>正确答案：</span>
                            <span>{{ numberToLetter(index.rightOption) }}</span
                            ><br />
                          </div>
                          <div style="margin-top: 8px">
                            <span>试题解析：</span>
                            <span>{{ index.analyse }}</span
                            ><br />
                          </div>
                        </el-card>
                      </div>
                    </el-col>
                  </el-row>
                  <el-divider />
                </div>
              </template>
              <!-- eslint-disable-next-line vue/no-template-shadow -->
              <template v-for="index in data">
                <!-- eslint-disable-next-line vue/require-v-for-key -->
                <div v-if="index.quType === 4" :class="'index' + index">
                  <el-row :gutter="24">
                    <el-col :span="20" style="text-align: left">
                      <!-- 题目: 序号、类型、题干 -->
                      <div>
                        <!-- <div class="qu_num">{{ index }}</div> -->
                        <!-- 【 单选题 】 -->
                        <div class="qu_content">{{ index.title }}</div>
                      </div>

                      <!-- 选项 -->
                      <el-radio-group class="qu_choose_group">
                        <!-- ['A', 'B', 'C', 'D'] -->
                        <el-input
                          v-model="index.myOption"
                          style="margin-top: 10px"
                          type="textarea"
                          :autosize="{ minRows: 2, maxRows: 4 }"
                          placeholder=""
                          :disabled="true"
                        />
                      </el-radio-group>

                      <!-- 题目解析 -->
                      <div class="qu_analysis">
                        <el-card>
                          <div>
                            <!-- <span>考生答案：</span>
                              <span
                                :style="{
                                  color:
                                    isRight === 1
                                      ? 'green'
                                      : isRight === 0
                                      ? 'red'
                                      : 'gray',
                                }"
                                >{{}}</span
                              ><br /> -->
                          </div>
                          <div style="margin-top: 8px">
                            <span>正确答案：</span>
                            <span>{{ index.rightOption }}</span>
                            <br />
                          </div>
                          <div style="margin-top: 8px">
                            <span>试题解析：</span>
                            <span>{{ index.analyse }}</span
                            ><br />
                          </div>
                        </el-card>
                      </div>
                    </el-col>
                  </el-row>
                  <el-divider />
                </div>
              </template>
            </div>
            <el-divider />
          </el-card>
        </el-col>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { details, getExamDetail } from "@/api/exam";
export default {
  name: "ExamProcess",
  data() {
    return {
      input: "",
      quIndex: -1,
      examId: 0,
      data: [],
      examInfo: null,
      userId: null,
      index: {
        quType: 4, // 确保这里有一个值
      },
    };
  },
  created() {
    this.examId = sessionStorage.getItem("exam-details-examId")
    this.ExamDetail();
  },
  computed: {
    examTimeText() {
      if (!this.examInfo) {
        return ''
      }
      const startTime = this.examInfo.startTime || '未设置'
      const endTime = this.examInfo.endTime || '未设置'
      return `${startTime} 至 ${endTime}`
    },
    gradeNamesText() {
      if (!this.examInfo || !this.examInfo.gradeNames || this.examInfo.gradeNames.length === 0) {
        return '暂无发布班级'
      }
      return this.examInfo.gradeNames.join('、')
    }
  },
  methods: {
    isCheck(myOption, sort) {
      const arr = myOption.split(",").map(Number); // 将字符串转换为数字数组
      if (arr.includes(sort)) {
        return true;
      } else {
        return false;
      }
    },
    numberToLetter(input) {
      const numberToCharMap = {
        0: "A",
        1: "B",
        2: "C",
        3: "D",
        4: "E",
        5: "F",
      };

      // 辅助函数：将单个数字（字符串或数字类型）转换为字母
      const singleNumberToLetter = (num) =>
        numberToCharMap[parseInt(num, 10)] || "";

      // 辅助函数：处理逗号分隔的数字字符串
      const commaSeparatedNumbersToLetters = (str) => {
        const numbers = str.split(",").map((item) => parseInt(item.trim(), 10));
        return numbers.map((number) => numberToCharMap[number] || "").join(",");
      };

      // 判断输入类型并调用相应函数
      if (/^\d+$/.test(input)) {
        // 单个数字（字符串形式也可以匹配）
        return singleNumberToLetter(input);
      } else if (/^\d+(,\d+)*$/.test(input)) {
        // 包含逗号分隔的数字字符串
        return commaSeparatedNumbersToLetters(input);
      } else {
        return ""; // 输入不符合预期，返回空字符串或根据需要处理
      }
    },
    // 分页查询
    async ExamDetail() {
      const [questionRes, infoRes] = await Promise.all([
        details(this.examId),
        getExamDetail(this.examId)
      ]);
      this.data = questionRes.data || [];
      this.examInfo = infoRes.data;
    },
    // 点击答题卡题号, 右侧题目滑动
    handleTag(index) {
      // 高亮选中的题目index标签
      this.quIndex = index;
      // 题目滑动到锚定点
      const page = document.querySelector(".index" + index);
      page.scrollIntoView();
    },
  },
};
</script>

<style scoped lang="scss">
.content {
  width: 97%;
  height: 60px;
  border: 1px solid #0a84ff;
  margin-top: 8px;
  margin-left: 10px;
  padding: 10px;
  font-weight: 200;
}
.sj {
  margin-top: 10px;
  margin-left: 10px;
  line-height: 22px;
}
.isRight {
  background-color: rgb(215, 245, 215);
}
.incorrect {
  background-color: rgb(248, 197, 197);
}
.fk {
  width: 200px;
  height: 100%;
  box-shadow: 0 0 15px rgb(197, 197, 197);
  margin: auto;
  margin-top: 20px;
  margin-left: 15px;
}
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.left {
  width: 250px;
  height: 100%;
}
.right {
  width: 70%;
  height: 100%;
}
.el-divider--horizontal {
  display: block;
  height: 1px;
  width: 95%;
  margin: 24px 0;
}
.type_tag {
  margin-right: 5px;
  margin-top: 10px;
}

.exam-summary {
  margin-bottom: 20px;
}
.summary-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 18px 24px;
}
.summary-item {
  display: flex;
  line-height: 24px;
  color: #303133;
}
.summary-label {
  min-width: 82px;
  margin-right: 12px;
  color: #909399;
}
.summary-time,
.summary-classes {
  grid-column: span 2;
}

// 试题内容样式
.qu_list {
  height: 100%;
  width: 100%;
  overflow: auto;
  page-break-after: always;

  .qu_num {
    display: inline-block;
    // background: url('~@/assets/images/tkxl/btbj.png') no-repeat 100% 100%;
    background-size: contain;
    height: 30px;
    width: 30px;
    line-height: 25px;
    color: #fff;
    font-size: 14px;
    text-align: center;
    margin-right: 15px;
    flex-shrink: 0;
  }

  .qu_content {
    padding-left: 10px;
  }

  // 选项组
  .qu_choose_group {
    width: 100%;

    // 单个选项
    .qu_choose {
      display: block;
      margin: 10px;

      // 去除前面的radio
      ::v-deep .el-radio__input .el-radio__inner {
        display: none;
      }

      // 单个选项内容样式
      .qu_choose_tag {
        display: inline-flex;
        width: 90%;
        // 选项标签
        .qu_choose_tag_type {
          font-weight: bold;
          // color: #0a84ff;
          width: 10px;
        }
        // 选项内容
        .qu_choose_tag_content {
          padding: 0 10px 10px 10px;
        }
        .qu_choose_tag_img {
          // max-height:90px;
          // max-width:300px;
          height: 100px;
          display: block;
          margin: 10px;
        }

        .qu_choose_tag_el_image {
          clear: both;
          padding-top: 10px;
        }
      }
      // 选项答案
      .qu_choose_answer {
        float: right;
      }
    }
  }

  // 试题解析
  .qu_analysis {
    padding: 10px;

    .qu_analysis_content {
      padding-top: 10px;
    }
  }

  // 试题赋分
  .qu_assign_score {
    background: #f5f5f5;
    height: 100px;
    padding-top: 35px;

    .qu_assign_score_content {
      width: 80px;
    }
  }
}
.imgC {
  height: 150px;
}
</style>
