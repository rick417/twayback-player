#!/usr/bin/env nodejs

const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const exec = require('child_process').exec;
const dayjs = require('dayjs');
const homedir = require('os').homedir();
const sequential = require('promise-sequential');
const cheerio = require('cheerio');
const open = require('open');
global.dataParsed = [{ "file": "wordCloud", "wordCloud": {}, "files": 0, "target": "" }];
global.rawWordList = [];

module.exports = {
    execCommand: (name, command, selector, count) => {
        return new Promise(resolve => {
            responseTxt = responseTxt + '\n' + name + ' : \n\n';
            console.log(name + ' : ');
            let execCmd = exec(command + ' ' + selector);
            execCmd.stdout.on('data', function(data) {
                console.log(data)
                var str = data.toString(),
                    lines = str.split(/(\n)/g);
                for (var i = 0; i < lines.length; i++) {
                    responseTxt = responseTxt + lines[i];
                }
            });

            execCmd.on('exit', function(code) {
                if (code !== 0) {
                    let exitCode = name + ' error. exit with code ' + code;
                    console.log(exitCode)
                    responseTxt = responseTxt + exitCode + '\n';
                } else {
                    responseTxt = responseTxt + '\n';
                }
                resolve(null)
            });
        })
    },
    launchSequence: (commandList, rawpath, command, callback) => {
        sequential(commandList.map((item) => {
                return function(previousResponse, responses, count) {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            console.clear()
                            console.log(`file ${count}/${global.dataParsed.count}`)
                            let res = command(item);
                            res.then(() => {
                                resolve()
                            })
                        }, 100)
                    })

                }
            }))
            .catch(err => {
                console.log('inside catch')
            })
            .finally((dataParsed) => {
                callback(rawpath)
            })
    },
    makeTemplate: (rawpath) => {
        global.dataParsed[0].target = "@" + rawpath.split('/').pop();
        let oneui = fs.readFileSync(path.resolve(__dirname, 'template', 'oneui.min.css'), 'utf-8');
        let template = fs.readFileSync(path.resolve(__dirname, 'template', 'template.html'), 'utf-8');
        let dayjs = fs.readFileSync(path.resolve(__dirname, 'template', 'dayjs.min.js'), 'utf-8');
        let wordcloud2 = fs.readFileSync(path.resolve(__dirname, 'template', 'wordcloud2.js'), 'utf-8');
        let oneuiApp = fs.readFileSync(path.resolve(__dirname, 'template', 'oneui.app.min.js'), 'utf-8');
        let app = fs.readFileSync(path.resolve(__dirname, 'template', 'app.js'), 'utf-8');
        const $ = cheerio.load(template);
        $('head').append('<style>' + oneui + '</style>');
        $('head').append('<script>' + dayjs + '</script>');
        $('head').append('<script>' + wordcloud2 + '</script>');
        $('head').append('<script>let allData = ' + JSON.stringify(global.dataParsed) + '</script>');
        $('body').append('<script>' + app + '</script>');
        $('body').append('<script>' + oneuiApp + '</script>');
        fs.writeFileSync(path.resolve(rawpath, 'parsed_' + rawpath.split('/').pop() + '.html'), $.html(), (() => {
            console.log('the data is added to the page.')
        }));
        console.clear();
        console.log('End of files parsing.')
        console.log('Opening the file in the web browser (better compatibility with firefox).')
        open(path.resolve(rawpath, 'parsed_' + rawpath.split('/').pop() + '.html'));
    },
    saveResult: (rawpath) => {
        global.dataParsed[0].wordArray = [];
        var wordList = global.dataParsed[0].wordCloud
        for (elem in wordList) {
            if (elem.length > 3) {
                global.dataParsed[0].wordArray.push([elem, wordList[elem].freq])
            }
        }
        module.exports.makeTemplate(rawpath);
        fs.writeFileSync(path.resolve(rawpath, 'parsed_data_' + rawpath.split('/').pop() + '.json'), JSON.stringify(global.dataParsed), (() => {
            console.log('All done.')
        }))
    },
    parseFile: (rawpath, dataParsed) => {
        return new Promise(resolve => {
            const $ = cheerio.load(fs.readFileSync(rawpath, 'utf-8'));
            global.dataParsed[0].files++
            $('div.tweet').each((i, elem) => {
                if ($(elem).data('tweet-id')) {
                    let links = [];
                    let postWordCloud = {};
                    let wordCloudArray = [];
                    let postrawWordList = [];
                    let tweetDate = "";
                    let wordList = $(elem).text().replaceAll('\n', '').replace(/\s\s+/g, ' ').replace(/[^a-zA-Z0-9@# ]/g, '').split(' ');
                    for (i = 0; i < wordList.length; i++) {
                        if ((global.rawWordList.includes(wordList[i]) === true) && (wordList[i] !== "") && (wordList[i].length > 2)) {
                            global.dataParsed[0].wordCloud[wordList[i]].freq++
                            if (postrawWordList.includes(wordList[i]) === true) {
                                postWordCloud[wordList[i]].freq++
                            } else {
                                postWordCloud[wordList[i]] = { "freq": 1 };
                                postrawWordList.push(wordList[i]);
                            }
                        } else {
                            if ((wordList[i] !== "") && (wordList[i].length > 2)) {
                                global.rawWordList.push(wordList[i]);
                                global.dataParsed[0].wordCloud[wordList[i]] = { "freq": 1 };
                                if (postrawWordList.includes(wordList[i]) === true) {
                                    postWordCloud[wordList[i]].freq++
                                } else {
                                    postWordCloud[wordList[i]] = { "freq": 1 };
                                    postrawWordList.push(wordList[i]);
                                }
                            }
                        }
                    }
                    $(elem).find('a').each((y, elem2) => {
                        if ($(elem2).prop('href') !== undefined) {
                            try {
                                links.push('http' + $(elem2).prop('href').split('http')[1])
                            } catch (err) {
                                links.push($(elem2).prop('href'))
                            }
                        }
                    })
                    $(elem).find('span').each((z, elem3) => {
                        if ($(elem3).data('time-ms') !== undefined) {
                            tweetDate = $(elem3).data('time-ms');
                        }
                    })
                    for (elements in postWordCloud) {
                        if (elements.length > 3) {
                            wordCloudArray.push([elements, postWordCloud[elements].freq])
                        }
                    }
                    global.dataParsed.push({
                        "file": $(elem).data('tweet-id'),
                        "path": rawpath,
                        "raw": encodeURIComponent($(elem).html()),
                        "text": $(elem).text().replaceAll('\n', '').replace(/\s\s+/g, ' ').replace(/[^a-zA-Z0-9@# ]/g, ''),
                        "href": links, // remove all spaces & special char
                        "user": {
                            "screenname": $(elem).data('screen-name'),
                            "username": $(elem).data('name'),
                            "userID": $(elem).data('user-id')
                        },
                        "date": tweetDate,
                        "wordList": wordList,
                        "wordCloudArray": wordCloudArray,
                        "postWordCloud": postWordCloud,
                        "postrawWordList": postrawWordList
                    })
                }
            })
            resolve(null)
        })
    },
    init: (rawpath) => {
        let commandList = [];
        let count = 0;
        fs.readdir(path.resolve(rawpath), function(err, files) {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }
            files.forEach(function(file) {
                // Do whatever you want to do with the file
                if (path.extname(file) === ".html") {
                    count++
                    commandList.push(path.resolve(rawpath, file))
                    //let thisRes = fs.readFileSync(path.resolve(rawpath, file), 'utf-8');
                    //module.exports.parseFile(thisRes)
                }
                // let tweetList = document.querySelectorAll('[data-tweet-id]') 
            });
            module.exports.launchSequence(commandList, rawpath, module.exports.parseFile, module.exports.saveResult)
            console.log(`analysis of ${count} files`);
            global.dataParsed.count = count
        });

    }
}