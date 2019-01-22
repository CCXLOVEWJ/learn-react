import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import App, {Search, Button, Show} from './App';

describe('App', () => {
  it('it\'s fine', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test('快照', () => {
    const component = renderer.create(<App />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })
})

describe('Search', () => {
  it('it\'s fine', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Search>search</Search>, div);
    ReactDOM.unmountComponentAtNode(div);
  })

  test('一个有效的快照', () => {
    const component = renderer.create(<Search>search</Search>);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })
})

describe('Button', () => {
  it('it is fine', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Button>get next page</Button>, div);
    ReactDOM.unmountComponentAtNode(div);
  })

  test('一个有效的快照', () => {
    const component = renderer.create(<Button>get next page</Button>);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })
})

describe('Show', () => {
  const props = {
    list: [
      { title: '1', author: '1', num_comments: 1, points: 2, objectID: 'y' },
      { title: '2', author: '2', num_comments: 1, points: 2, objectID: 'z' }
    ]
  };

  it('it is fine', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Show {...props} />, div);
    ReactDOM.unmountComponentAtNode(div);
  })

  test('有效的快照', () => {
    const component = renderer.create(<Show {...props} />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })
})
