---
order: 2
title: Git忽略文件
date: 2021-08-20
category: 
    - 杂记
    - Git
tag: 
    - 杂记
    - Git
timeline: true
article: true
---



SpringBoot项目忽略文件

``` .gitignore
# ---> Java
# Compiled class file
*.class

# Log file
*.log

# BlueJ files
*.ctxt

# Mobile Tools for Java (J2ME)
.mtj.tmp/

# Package Files #
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# virtual machine crash logs, see http://www.java.com/en/download/help/error_hotspot.xml
hs_err_pid*

### gradle ###
.gradle
/build/
!gradle/wrapper/gradle-wrapper.jar
out
generated/

### STS ###
.settings/
.apt_generated
.classpath
.factorypath
.project
.settings
.springBeans
bin/

### IntelliJ IDEA ###
.idea
*.iws
*.iml
*.ipr
rebel.xml

### NetBeans ###
nbproject/private/
build/
nbbuild/
dist/
nbdist/
.nb-gradle/

### maven ###
target/
*.war
*.ear
*.zip
*.tar
*.tar.gz

### logs ####
/logs/
*.log

### temp ignore ###
*.cache
*.diff
*.patch
*.tmp
*.java~
*.properties~
*.xml~

### system ignore ###
.DS_Store
Thumbs.db
Servers
.metadata
upload
gen_code

### submodule ###
**/mvnw
**/mvnw.cmd
**/.mvn
**/target
**/.gitignore
```