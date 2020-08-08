#!/usr/bin/env node
import * as commander from "commander";
import { translate } from "./main";

const program = new commander.Command();

program.version('0.0.4')
  .name('fy')
  .usage('<english>')
  .arguments('<english>') // 参数
  .action(function (english) {
    translate(english)
  });

program.parse(process.argv)