#! /usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const inquirer = require('inquirer')
const fs = require('fs')
const path = require('path')
const download = require('download-git-repo')
const ora = require('ora')
program.version('0.0.1');

// const preset = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../preset.json')))
program
    .command('pp')
    .description('创建vue项目')
    .action((name) => {
        inquirer
            .prompt([
                {
                    type: 'list',
                    message: '请选择项目类型',
                    choices: [
                        "web pc",
                        "web app"
                    ],
                    name: 'type'
                },
                {
                    type: 'list',
                    message: '请选择一个ui框架',
                    choices: [
                        'ElementUI',
                        'Iview',
                        'AntdVue'
                    ],
                    name: 'ui',
                    when(res) {
                        return res.type === 'web pc'
                    }
                },
                {
                    type: 'list',
                    message: '请选择一个UI框架',
                    choices: [
                        'vux',
                        'mintui'
                    ],
                    name: 'ui',
                    when(res) {
                        return res.type === 'web app'
                    }
                },
                {
                    type: 'list',
                    message: '请选择项目预设',
                    choices: [
                        "默认",
                        // ...Object.keys(preset),
                        "自定义",
                    ],
                    name: 'preset'
                },
                {
                    type: 'checkbox',
                    message: '选择功能',
                    default: ['Bable', 'CSS Pre-processors'],
                    choices: [
                        "Bable",
                        "Vuex",
                        "VueRouter",
                        "CSS Pre-processors"
                    ],
                    when(res) {
                        return res.preset === '自定义'
                    },
                    name: 'features'
                },
                {
                    type : 'confirm',
                    name : 'mode',
                    message : '是否使用history路由',
                    when(res){
                        return res.features.indexOf('VueRouter') !== -1
                    }
                },
                {
                    type: 'list',
                    message: '选择要使用的css预处理器方式',
                    name: 'cssPre',
                    choices: [
                      'less',
                      'scss'
                    ],
                    when (res) {
                      return res.features.indexOf('CSS Pre-processors') !== -1
                    }
                  },
                  {
                    type: 'confirm',
                    name: 'save',
                    message: '是否保存当前预设',
                    default: false,
                    when (res) {
                      return res.preset === '自定义'
                    }
                  },
                  {
                    type: 'input',
                    name: 'presetName',
                    message: '输入当前预设名称',
                    when (res) {
                      return res.save
                    }
                  },
            ])
            .then(answers => {
                console.log(answers , process.cwd());
                const spinner = ora('正在构建项目').start();
                download('github:liuyu00/buv', process.cwd() + '/' + name, function (error, res) {
                    console.log(error, res)
                    Object.keys(answers).forEach((item) => {
                      const updateFunction = productUpdate[item]
                      if (updateFunction) updateFunction(answers, process.cwd() + '/' + name)
                      
                    })
                    spinner.succeed('构建成功')
                  })
            })
    });

    const productUpdate = {
        ui (answers, productCwd) {
          const uiFrame = answers.ui
          const entyFile = fs.readFileSync(path.resolve(productCwd, './src/main.js'))
          if (uiFrame === 'ElementUI') {
            const content = new Buffer( entyFile.toString().replace("import store from './store';", `
              import store from './store';
              import ElementUi from 'element-ui'
      
              Vue.use(${uiFrame})
            `))
            fs.writeFileSync(path.resolve(productCwd, './src/main.js'), content, function (err) {
              if(err) {
               console.error(err);
               } else {
                  console.log('写入成功');
               }
           })
          }
          console.log(entyFile.toString())
        },
        type (answers) {
          if (answers.type === 'web app') {
      
          }
        },
        preset (answers) {},
        features (answers) {},
        mode (answers) {},
        cssPre (answers) {},
        save (answers) {
          preset[answers.presetName] = answers.features;
          fs.writeFileSync(path.resolve(__dirname, '../preset.json'), JSON.stringify(preset))
        }
      }

program.parse(process.argv);