/**
 * Created by zhouchaoyi on 2016/10/10.
 */
import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {Icon, Button, Tree,Modal,Input} from 'antd';
import {listItems,onCheck,reset,onExpand,addItem,isShowInfo,onSelect,doMove,delItem} from '../../../actions/module'
import {getQueryString} from '../../../utils'

const confirm = Modal.confirm;
const TreeNode = Tree.TreeNode;
const contextTypes = {
    router: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
};

let disableCheckbox = [];
//let mySelectedKey = [];
let type = "";
function noop() {
    return false;
}


class Perm extends React.Component {

    constructor(props) {
        super(props)
    }

    componentWillMount(){
        //console.log("componentWillMount<<<<<<<<<");
        this.loadData();
    }

    componentWillReceiveProps(nextProps) {
        //console.log("componentWillReceiveProps<<<<<<<<<");
        //console.log("showInfo",nextProps.showInfo);
        if(nextProps.showInfo) {
            const modal = Modal.info({
                title: nextProps.infoText,
                content: '',
                onOk() {
                    nextProps.isShowInfo(false);
                }
            });
        }
        if(nextProps.reload) {
            this.loadData();
        }
    }

    loadData() {
        let param={};
        param.currentPage=-1;
        param.pageSize=-1;
        param.orderBy="classId,1";
        param.searchStr="";
        this.props.listItems(param);
    }

    handleBack(e){
    }

    onCheck(checkedKeys,e) {
        
    }

    onExpand(expandedKeys) {
        this.props.onExpand(expandedKeys);
    }

    onSelect(selectedKey) {
        //console.log(selectedKey);
        //mySelectedKey = selectedKey;
        if(selectedKey.length==0) {
            selectedKey = this.props.selectedKeys;
        }
        if(selectedKey=="-1") {
            let rootNode = {};
            rootNode.moduleId="-1";
            rootNode.moduleName="模块/权限设置"; 
            this.props.onSelect(rootNode,selectedKey);
        }else {
            let itemProp = {};
            for(let i=0;i<this.props.tableData.items.length;i++) {
                let item = this.props.tableData.items[i];
                if(item.moduleId == selectedKey) {
                    itemProp = Object.assign({},item);
                    break;
                }
            }
            this.props.onSelect(itemProp,selectedKey);
        }
    }

    addItem() {
        this.context.router.push({
            pathname: "/template/perm/module/form",
            query: {
                parentId: this.props.selectedKeys[0]
            }
        });
    }

    editItem() {
        let mySelectedKey = this.props.selectedKeys;
        if(mySelectedKey.length==0) {
            Modal.warning({
                title: '请选择要编辑的节点',
                content: '',
            });
            return;
        }
        if(mySelectedKey=="-1") {
            Modal.warning({
                title: '不能编辑根节点',
                content: '',
            });
            return;
        }
        this.context.router.push({
            pathname: "/template/perm/module/form",
            query: {
                id: mySelectedKey[0]
            }
        });
    }

    doMove(position,e) {
        let mySelectedKey = this.props.selectedKeys;
        if(mySelectedKey.length==0) {
            Modal.warning({
                title: '请选择要移动的节点',
                content: '',
            });
            return;
        }
        if(mySelectedKey=="-1") {
            Modal.warning({
                title: '不能移动根节点',
                content: '',
            });
            return;
        }
        let param = {};
        param.move=position;
        param.moduleId=mySelectedKey[0];
        this.props.doMove(param);
    }

    delItem(e) {
        let mySelectedKey = this.props.selectedKeys;
        const _self = this;
        if(mySelectedKey.length==0) {
            Modal.warning({
                title: '请选择要删除的节点',
                content: '',
            });
            return;
        }
        if(mySelectedKey=="-1") {
            Modal.warning({
                title: '不能删除根节点',
                content: '',
            });
            return;
        }
        let mySelectedTitle = "";
        let items = this.props.tableData.items;
        for(let i=0;i<items.length;i++) {
            if(items[i].moduleId==mySelectedKey[0]) {
                mySelectedTitle = items[i].moduleName;
                break;
            }
        }
        //console.log(mySelectedTitle);
        confirm({
            title: '确定要删除“'+mySelectedTitle+'”节点吗',
            content: '',
            onOk() {
                let param = {};
                param.moduleId = mySelectedKey[0];
                _self.props.delItem(param);
            },
            onCancel() {},
        });
    }

    render() {
        let _self = this;

        let treeData = [];
        let items = this.props.tableData.items;
        //console.log(this.props.tableData.items);
        let tempArray=[];
        if(items) {
            //将线性数据转换成树形数据
            for(let i=0; items&&i<items.length; i++) {
                let j = items[i].classId.length/10;
                let myItem = Object.assign({},items[i]); //浅复制，防止出现引用变量
                if(tempArray[j-1]) {
                    tempArray[j-1].push(myItem);
                }else {
                    tempArray[j-1]=[];
                    tempArray[j-1].push(myItem);  
                }
                if(myItem.permType==1 || myItem.permType==2) {
                    disableCheckbox.push(myItem.moduleId+'');
                }
            }
            //console.log("tempArray",tempArray);
            for(let i=tempArray.length-1; i>=1; i--) {
                for(let j=0; j<tempArray[i-1].length; j++) {
                    let item = tempArray[i-1][j];
                    for(let k=0; k<tempArray[i].length; k++) {
                        let item2 = tempArray[i][k];
                        if(item2.parentId == item.moduleId) {
                            if(item.children) {
                                item.children.push(item2);
                            }else {
                                item.children=[];
                                item.children.push(item2);
                            }
                        }
                    }
                }
            }
            //console.log("treeData",tempArray[0]);
            //treeData = tempArray[0];
            let rootNode = {};
            rootNode.moduleId="-1";
            rootNode.moduleName="模块/权限设置";
            rootNode.children=tempArray[0];
            treeData[0] = rootNode;
        }

        const getIconUrl = item => {
            if(item.moduleId=="-1") { //根节点
                return "../../../../public/img/module/manage.gif"
            }
            let icon = "";
            if(item.bExt=="1") { //是分类目录
                if(item.url!="") { //路径不为空
                    if (item.status == "1") { //被启用
                        icon = "../../../../public/img/module/module_fld2.gif";
                    }else {
                        icon = "../../../../public/img/module/module_fld2_forbidden.gif";
                    }
                }else {
                    if (item.status == "1") { //被启用
                        icon = "../../../../public/img/module/fld2.gif";
                    }else {
                        icon = "../../../../public/img/module/fld2_forbidden.gif";
                    }
                }
            }else {
                if (item.isPermOnly == "1") { //是权限
                    if (item.status == "1") {
                        icon = "../../../../public/img/module/perm_icon.gif";
                    } else {
                        icon = "../../../../public/img/module/perm_icon_forbidden.gif";
                    }
                } else { //是模块
                    if(item.url!="") { //路径不为空
                        if (item.status == "1") { //被启用
                            icon="../../../../public/img/module/module.gif";
                        }else {
                            icon="../../../../public/img/module/module_forbidden.gif";
                        }
                    }else {
                        if (item.status == "1") { //被启用
                            icon="../../../../public/img/module/module2.gif";
                        }else {
                            icon="../../../../public/img/module/module2_forbidden.gif";
                        }
                    }
                }
            }
            return icon;
        };

        const showTitle = item => {
            let remark="";
            if(type=="0") { //如果显示的是用户权限
                if(item.permType=="1") { //通用权限
                    remark = <span style={{color:"red",fontWeight:"bold"}}>("{item.permRemark}"通用权限)</span>;
                }else if(item.permType=="2") { //组权限
                    remark = <span style={{color:"maroon",fontWeight:"bold"}}>(组权限)</span>;
                }
            }
            return <span> 
                        <img src={getIconUrl(item)}></img>
                        <span style={{fontWeight:"bold"}}>{item.moduleName}</span>
                        {remark}
                   </span>
        }

        const loop = data => data.map((item) => {
            if (item.children) {
                return (
                    <TreeNode key={item.moduleId} disableCheckbox={item.permType==1 || item.permType==2}  
                        title={showTitle(item)} >
                        {loop(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode key={item.moduleId} disableCheckbox={item.permType==1 || item.permType==2}  
                        title={showTitle(item)} />;
        });

        let itemDetail="";
        let itemProp = this.props.itemDetail;
        if(itemProp.moduleId!="-1") {
            if(itemProp.bExt=="1"&&itemProp.url.length==0) {
                itemDetail = (
                    <div>
                        <div>名称：{itemProp.moduleName}</div><br/>
                        <div>代码：{itemProp.moduleCode}</div><br/>
                        <div>说明：{itemProp.remark}</div><br/>
                        <div>类别：{itemProp.bExt==1?'分类目录':'权限/模块'}</div><br/>
                        <div>状态：{itemProp.status==1?'启用':'禁用'}</div>
                    </div>
                );
            }else {
                //console.log(relationUrl);
                if(itemProp.relationUrl && itemProp.relationUrl.split) {
                    itemProp.relationUrl = itemProp.relationUrl.split("\n").map((item,index) => {
                        return <span key={index}><br/>{item}</span>
                    });
                }
                itemDetail = (
                    <div>
                        <div>名称：{itemProp.moduleName}</div><br/>
                        <div>代码：{itemProp.moduleCode}</div><br/>
                        <div>通用权限：{itemProp.userType}</div><br/>
                        <div>路径：{itemProp.url}</div><br/>
                        <div>关联接口：{itemProp.relationUrl}</div><br/>
                        <div>说明：{itemProp.remark}</div><br/>
                        <div>类别：{itemProp.bExt==1?'分类目录':'权限/模块'}</div><br/>
                        <div>状态：{itemProp.status==1?'启用':'禁用'}</div>
                    </div>
                );
            }
        }else {
            itemDetail="根节点";
        }

        return (
            <div>
                <div style={{float:"left"}}>
                    <h2>权限定义</h2>
                    <div style={{marginTop:'10px'}}>
                        选择节点：
                        <Button type="primary" onClick={this.addItem.bind(this)}>
                            <Icon type="plus"/>
                            添加子节点
                        </Button>
                        <Button onClick={this.editItem.bind(this)} style={{marginLeft:"10px"}}>
                            <Icon type="edit"/>编辑
                        </Button>
                        <Button onClick={this.delItem.bind(this)} style={{marginLeft:"10px"}}>
                            <Icon type="delete"/>删除
                        </Button>
                        <Button style={{marginLeft:'10px'}} onClick={this.doMove.bind(this,"1")}>
                            <Icon type="arrow-up"/>上移
                        </Button>
                        <Button style={{marginLeft:'10px'}} onClick={this.doMove.bind(this,"-1")}>
                            <Icon type="arrow-down"/>下移
                        </Button>
                    </div>
                    {/*<span>
                        <img src="../../../../public/img/module/manage.gif"></img>模块权限设置
                    </span>*/}
                    <Tree
                        expandedKeys={this.props.expandedKeys} onExpand={this.onExpand.bind(this)} autoExpandParent={false}
                        onSelect={this.onSelect.bind(this)} selectedKeys={this.props.selectedKeys}
                    >
                        {loop(treeData)}
                    </Tree>
                </div>
                <div style={{display:this.props.showDetail,float:"left",marginTop:"80px",fontSize:"14px"}}>
                    {itemDetail}
                </div>
            </div>
        )
    }
    
}

Perm.contextTypes = contextTypes;

function mapStateToProps(state) {
    return {
        tableData:state.module.tableData,
        checkedKeys:state.module.checkedKeys,
        expandedKeys:state.module.expandedKeys,
        showInfo:state.module.showInfo,
        infoText:state.module.infoText,
        showDetail:state.module.showDetail,
        itemDetail:state.module.itemDetail,
        reload:state.module.reload,
        selectedKeys:state.module.selectedKeys
    }
    
}
function mapDispatchToProps(dispatch) {
    return {
        listItems:bindActionCreators(listItems,dispatch),
        onCheck:bindActionCreators(onCheck,dispatch),
        reset:bindActionCreators(reset,dispatch),
        onExpand:bindActionCreators(onExpand,dispatch),
        addItem:bindActionCreators(addItem,dispatch),
        isShowInfo:bindActionCreators(isShowInfo,dispatch),
        onSelect:bindActionCreators(onSelect,dispatch),
        doMove:bindActionCreators(doMove,dispatch),
        delItem:bindActionCreators(delItem,dispatch)
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(Perm)

