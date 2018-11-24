const _path = require('path');

// const config = require('./configuration');

function functionalComponent({name, type, extension, isStandalone}) {
    return `// ${isStandalone ? name : name + '/index'}${extension}
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Creates a new ${name} ${type.toLowerCase()}.
 * 
 * @param {Object} props The properties of the component.
 * @return {React.ReactNode}
 */
function ${name}(props) {
    return (<React.Fragment />);
}

${name}.propTypes = {
    // describe the component's prop types here
};

${name}.defaultProps = {
    // assign default props to the component here
};

export default ${name};
`};

function classComponent({name, type, extension, isStandalone}) {

    return `// ${isStandalone ? name : name + '/index'}${extension}
import React from 'react';
import PropTypes from 'prop-types';

class ${name} extends React.Component {

    /**
     * Creates a new ${name} ${type.toLowerCase()}.
     * @param {Object} props The properties of the component.
     */
    constructor(props) {
        super(props);
        this.state = {
            // place your default state here
        };
    }

    /**
     * Renders the ${name} ${type.toLowerCase()}.
     * 
     * @return {React.ReactNode}
     */
    render() {
        return (<React.Fragment />);
    }

}

${name}.propTypes = {
    // describe the component's prop types here
};

${name}.defaultProps = {
    // assign default props to the component here
};

export default ${name};
`;

}

function container({name, isStandalone, extension, path, otherPath, otherType, otherExtension}) {
    
    const filePattern = new RegExp(`.index$`);
    const extPattern = new RegExp(`\\${otherExtension}$`);

    let relativePath = _path.relative(path, otherPath); // get the relative path between the two files

    relativePath = relativePath.replace(extPattern, ''); // remove the file extension

    // check to see if we have to remove the index.js filename part
    if (filePattern.test(relativePath)) {
        relativePath = relativePath.replace(filePattern, ''); // remvoe the index.js part
    }

    relativePath = relativePath.substr(3);  // remove the leading ../
    relativePath = relativePath.replace(/\\/g, '/'); // replace all the backslashes for forward slashes (for windows)

    return `// ${isStandalone ? name : name + '/index'}${extension}
import { connect } from 'react-redux';
import ${name} from '${relativePath}';

/**
 * Maps the redux state to the ${name} ${otherType}'s props.
 * 
 * @param {Object} state The redux state.
 * @param {Object} ownProps The current props of the ${name} ${otherType}.
 * @return {Object} Returns an object containing updated props from the redux store.
 */
function mapStateToProps(state, ownProps) {
    return {
        
    };
}

/**
 * Maps the redux actions to the ${name} ${otherType}'s props.
 * 
 * @param {Object} dispatch The redux dispatch function.
 * @param {Object} ownProps The current props of the ${name} ${otherType}.
 * @return {Object} Returns an object containing the actions to update the redux store.
 */
function mapDispatchToProps(dispatch, ownProps) {
    return {

    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(${name});
`;

}

module.exports = {
    functionalComponent,
    classComponent,
    container,
}