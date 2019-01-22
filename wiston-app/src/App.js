import React, { Component } from 'react';
import propTypes from 'prop-types';
import loading from './Loading.png';
import { sortBy } from 'lodash';
import './App.css';

//样本数据
// const words = "this is the wiston-app";
// const t_user = {
//   nico: "duke",
//   text: "it is duke"
// }
// const list = [
//   {
//     objId: 0,
//     title: "taobao",
//     url: "http://taobao.com",
//     singo: "jack ma"
//   },
//   {
//     objId: 1,
//     title: "jingdong",
//     url: "http://jd.com",
//     singo: "qiangdong"
//   },
//   {
//     objId: 2,
//     title: "jumei",
//     url: "http://suibian.com",
//     singo: "chenou"
//   }
// ]
// const isSearched = (searchText) => {
//   return (item) => {
//     return item.title.toLowerCase().includes(searchText.toLowerCase());
//   }
// }

//访问Hacker News API的默认配置
const DEFAULT_QUERY = 'taobao';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';

//排序集合
const SORTS = {
  NONE: (list) => list,
  TITLE: (list) => sortBy(list, 'title'),
  URL: (list) => sortBy(list, 'url'),
  CREATED_AT: (list) => sortBy(list, 'created_at'),
  AUTHOR: (list) => sortBy(list, 'author')
}

const updateSearchTopStoriesState = (hits, page) => {
  return (prevState) => {
    const { searchKey, results } = prevState;
    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : [];
    const updatedHits = [
      ...oldHits,
      ...hits
    ];
    return {
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      },
      isLoading: false
    };
  }
}

// ES6类组件
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: null,
      searchKey: "", //用于存储searchText
      searchText: DEFAULT_QUERY,
      error: null,
      isLoading: false
    }

    //第一种绑定方式
    // this.tap = this.tap.bind(this);
    // this.textChange = this.textChange.bind(this);
    // this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
  }

  

  needsToSearchTopStories = (searchText) => {
    //如果已存在,返回false
    return !this.state.results[searchText];
  }

  //把请求到的结果,存储在本地状态中
  setSearchTopStories = (result) => {
    // console.log(result);
    const { hits, page } = result;
    this.setState(updateSearchTopStoriesState(hits, page))    
    console.log(this.state.error);
  }

  //发起请求,将返回的结果json格式化,保存到本地状态中
  fetchSearchTopStories(keywords, page = 0) {//没有使用类内高阶函数
    this.setState({
      isLoading: true
    });
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${keywords}&${PARAM_PAGE}${page}`)
    .then(response => response.json())
    .then(result => this.setSearchTopStories(result))
    .catch(e => this.setState({error: e}));
  }

  //在组件挂载完成后,发起get请求,并且把结果存储在本地状态中
  componentDidMount() {
    const { searchText } = this.state;
    this.setState({
      searchKey: searchText
    })
    this.fetchSearchTopStories(searchText);
  }

  //在搜索关键词改变时,通过事件对象设置本地状态的值
  textChange = (event) => {
    // console.log(event);
    this.setState({
      searchText: event.target.value
    })
    // console.log(this.state.searchText);
  }

  tap = (event) => {
    console.log('tap tap');
    const { searchText } = this.state;
    this.setState({
      searchKey: searchText
    })
    if (this.needsToSearchTopStories(searchText)) {
      this.fetchSearchTopStories(searchText);
    }
    this.fetchSearchTopStories(searchText);
    event.preventDefault();
  }

  render() { 
    //把input的value值设置为searchText可以保证来源唯一,不受其他影响
    const { results, searchText, searchKey, error, isLoading } = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];
    //***React允许组件返回null来不渲染任何东西***
    // if (error) {
    //   return <p>出错了</p>
    // }
    // if (!results) {
    //   return null;
    // }
    // console.log(this.state);
    return (
      <div className="App">    
        <Search value={searchText} onChange={this.textChange} onClick={this.tap}>标题</Search>
        {
          error
          ? <Error />
          : <Show list={list} />
        }      
        <div className="nextPage">
          {/* {
            isLoading
            ? <Loading />
            : <Button className="next-page" onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}> NEXT </Button>
          } */}
          <ButtonWithLoading isLoading={isLoading} className="next-page" onClick={() => this.fetchSearchTopStories(searchKey, page + 1)} />
        </div>
      </div>
    );
  }
}

//这是一个无状态组件,因为他不需要用到生命周期函数及访问本地状态(this.state||this.setState)
// const Search = ({ value, onChange, onClick, children }) => {
//   return (
//     <div>
//       <form>
//         {children}<input type="text" onChange={onChange} value={value}/>
//         <input type="submit" value="tap" onClick={onClick} />
//       </form>
//     </div>
//   )
// }

class Search extends Component {

  componentDidMount() {
    if(this.input) {
      this.input.focus();
    }
  }

  render() {
    const { value, onChange, onClick, children } = this.props;
    return (
      <form>
        {children}<input type="text" onChange={onChange} value={value} ref={(node) => {this.input = node;}} />
        <input type="submit" value="tap" onClick={onClick} />
      </form>
    )
  }
}

class Show extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortKey: 'NONE',
      isSortReverse: false
    }
    // this.onSort = this.onSort.bind(this);
  }

  onSort = (sortKey) => {
    const isSortReverse = this.state.sortKey === sortKey && !isSortReverse;
    this.setState({
      sortKey,
      isSortReverse
    })
  }

  render() {
    const { list } = this.props;
    const { sortKey, isSortReverse } = this.state;
    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;
    return (
      <div className="webList">
        <div className="sort">
          <span>
            <Sort className="sort-inline" sortKey="TITLE" onSort={this.onSort} activeSortKey={sortKey}>title</Sort>
            <Sort className="sort-inline" sortKey="URL" onSort={this.onSort} activeSortKey={sortKey}>url</Sort>
            <Sort className="sort-inline" sortKey="CREATED_AT" onSort={this.onSort} activeSortKey={sortKey}>created date</Sort>
            <Sort className="sort-inline" sortKey="AUTHOR" onSort={this.onSort} activeSortKey={sortKey}>author</Sort>
          </span>
        </div>
        {reverseSortedList.map(item => {
          return (
            <div className="web" key={item.objectID}>
              <span>标题: {item.title}</span>
              <p>链接: <a href={item.url}>{item.url}</a></p>
              <p>作者:{item.author} 发表时间:{item.created_at}</p>
            </div>
          )
        })}
      </div>
    )
  }
}

class Button extends Component {
  render() {
    const { onClick, children , className='' } = this.props;
    return (
      <button className={className} onClick={onClick}>{children}</button>
    )    
  }  
}

class Loading extends Component {
  render() {
    return (
      <div>
        <div>Loading...</div>
        <img className="loading" src={loading} alt=""/>
      </div>
    )
  }
}

const withLoading = (Component) => {
  return ({ isLoading, ...rest }) => {
    return isLoading
    ? <Loading />
    : <Component {...rest}>NEXT</Component>
  }
}

const ButtonWithLoading = withLoading(Button);

class Sort extends Component {
  render() {
    const { sortKey, onSort, children, activeSortKey } = this.props;
    const sortClass = ['sort-inline'];
    if (sortKey === activeSortKey) {
      sortClass.push('sort-active');
    }
    return (
      <Button className={sortClass.join(' ')} onClick={() => onSort(sortKey)}>{children}</Button>
    )
  }
}

class Error extends Component {
  render() {
    return (
      <div>加载出错了</div>
    )
  }
}

//propTypes检查参数状态
Button.propTypes = {
  onClick: propTypes.func.isRequired,//添加isRequired后,会在没有提供属性值时打印警告
  className: propTypes.string,
  children: propTypes.node.isRequired
}

Show.propTypes = {
  list: propTypes.arrayOf(
    propTypes.shape({
      objectID: propTypes.string.isRequired,
      title: propTypes.string,
      author: propTypes.string,
      url: propTypes.string
    })
  ).isRequired
}

export default App;

export {
  Search,
  Show,
  Button
}
