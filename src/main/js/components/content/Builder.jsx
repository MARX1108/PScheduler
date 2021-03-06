import React from 'react';
import { ClipLoader } from 'react-spinners';
import { parse, stringify } from 'query-string';
import ScheduleVisualTable from '../ScheduleVisualTable';
import CourseTable from '../../containers/content/builder/CourseTable';
import SearchList from '../../containers/content/builder/SearchList';
import FormModule from '../FormModule';
import formDefaults from '../../constants/formDefaults';

class Schedules extends React.Component {
  constructor(props) {
    super(props);
    this.toggleTextTable = this.toggleTextTable.bind(this);
    this.toggleVisualTable = this.toggleVisualTable.bind(this);
    this.state = {
      showTextTable: true,
      showVisualTable: true,
    };
  }

  componentWillMount() {
    const { firstRender, initialize, location } = this.props;

    if (firstRender) {
      initialize({ term: parse(location.search).term || formDefaults.termValue });
    }
  }

  componentDidMount() {
    const { firstRender, location, loadSchedule } = this.props;
    if (firstRender) {
      loadSchedule(location.search);
    }
    $('.selectpicker').selectpicker('refresh');
  }

  componentDidUpdate(prevProps) {
    const { courseList, term, history } = this.props;

    if (prevProps.courseList !== courseList || prevProps.term !== term) {
      const queryArray = courseList.map((list) => {
        const { selected } = list;
        return `${selected.subject}${selected.courseNumber}${
          selected.crn === 'None' ? '' : `+${selected.crn}`}`;
      });

      history.push({
        pathname: '/builder',
        search: `?${stringify({ c: queryArray, term: term || formDefaults.termValue },
          { encode: false, arrayFormat: 'bracket' })}`,
      });
    }

    $('.selectpicker').selectpicker('refresh');
  }

  toggleTextTable() {
    this.setState(prevState => ({ showTextTable: !prevState.showTextTable }));
  }

  toggleVisualTable() {
    this.setState(prevState => ({ showVisualTable: !prevState.showVisualTable }));
  }

  render() {
    const {
      courseList,
      isFetching,
      isBuilding,
      firstRender,
      resetBuilder,
    } = this.props;
    const {
      showTextTable,
      showVisualTable,
    } = this.state;

    if (firstRender || isBuilding) {
      return (
        <div className="page-loader">
          <h1>
            Building schedules...
          </h1>
          <ClipLoader size={200} color="darkorange" />
        </div>
      );
    }

    return (
      <div>
        <div id="schedules-bar" className="flex-container-spaced no-print">
          <div className="flex-container">
            <div className="pad-right">
              <FormModule
                type="select"
                name="term"
                width="auto"
                onChange={() => resetBuilder()}
                values={formDefaults.terms}
              />
            </div>
            {isFetching && <ClipLoader size={25} color="darkorange" />}
          </div>
          <h4>
            Schedule Builder
          </h4>
          <div>
            <button type="button" className="btn btn-default" onClick={this.toggleTextTable}>
              Toggle Text
            </button>
            <button type="button" className="btn btn-default" onClick={this.toggleVisualTable}>
              Toggle Visual
            </button>
            <button
              onClick={() => {
                const text = document.createElement('textarea');
                text.value = window.location.href;
                text.style.left = '-9999px';
                document.body.appendChild(text);
                text.select();
                document.execCommand('copy');
                document.body.removeChild(text);
              }}
              type="button"
              className="btn btn-default"
              title="Copy Link"
            >
              <span className="glyphicon glyphicon-copy" />
            </button>
            <button
              onClick={window.print}
              type="button"
              className="btn btn-default"
            >
              <span className="glyphicon glyphicon-print" />
            </button>
          </div>
        </div>
        <div className="pad-top">
          <SearchList />
        </div>
        {showTextTable && (
          <CourseTable />
        )}
        {showVisualTable && (
          <ScheduleVisualTable schedule={courseList.map(list => list.selected)} />
        )}
      </div>
    );
  }
}

export default Schedules;
