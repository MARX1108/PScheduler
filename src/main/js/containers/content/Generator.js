import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { parse } from 'query-string';
import { addToSchedule } from '../../actions/courses';
import formDefaults from '../../constants/formDefaults';
import generateSchedules from '../../utils/generate';
import {
  endGenerating,
  endRedirect,
  startFirstRender,
} from '../../actions/generator';
import Generator from '../../components/content/Generator';
import { getCourseMap } from '../../utils/search';
import { retrieveShortUrl } from '../../constants/resources';
import 'whatwg-fetch';

const mapStateToProps = state => ({
  isGenerating: state.generator.isGenerating,
  firstRender: !state.generator.initialValues,
  redirect: state.generator.redirect,
  error: state.generator.error,
});

const mapDispatchToProps = dispatch => ({
  loadSchedule: (query) => {
    let formValues = {
      term: formDefaults.termValue,
      h1: '08',
      m1: '00',
      start: 'am',
      h2: '08',
      m2: '00',
      end: 'pm',
      gap: '15',
      free: [],
      sortByGPA: false,
      useCourseAvg: false,
      gradeTerm: 'spring_2012',
      genURL: process.env.NODE_ENV === 'production',
    };

    if (query) {
      fetch(`${retrieveShortUrl}/generator/${parse(query).q}`)
        .then(response => response.json())
        .then((json) => {
          const data = { ...json };
          const courses = data.c ? data.c.map(course => JSON.parse(course)) : [];
          delete data.c;
          data.courses = {};
          const q = courses.map(course => course.name);

          getCourseMap({ query: q, term: data.term })
            .then((courseMap) => {
              courses.forEach((course, index) => {
                const copy = { ...course };
                dispatch(addToSchedule(courseMap[copy.name], index));
                data.courses[`${course.name}${index}`] = copy;
                delete copy.name;
              });
            })
            .then(() => {
              formValues = { ...formValues, ...data };
              dispatch(generateSchedules(formValues, query));
              dispatch(startFirstRender(formValues));
            })
            .catch((e) => {
              dispatch(startFirstRender(formValues));
              dispatch(endGenerating(null, e));
            });
        })
        .catch((e) => {
          dispatch(startFirstRender(formValues));
          dispatch(endGenerating(null, e));
        });
    } else {
      dispatch(startFirstRender(formValues));
    }
  },
  redirected: () => dispatch(endRedirect()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Generator));
