// get the authorization rules of a certain dossier
window.getActions = function (dossier = '') {
  return {
    opg: ["*"],
    eig: ["*"],
    obj: ["*"],
    sub: ["*"],
    unt: ["*"],
    knt: ["*"],
    svc: ["*"],
    wer: ["*"],
    rel: ["*"],
    oui: ["*"],
    hop: ["*"],
    kop: ["*"],
    kbo: ["*"]
  }[dossier.toLowerCase()] || [];
}

// get a global setting from a defined list of key-value sets
window.getSetting = function (key = '', fallback = null) {
  return _.get({
    uuidForProvimApplication: 'd403452e-75a3-11ef-b2ae-ef0479d32144',
    defaultFilterFieldWidth: 150,
    defaultFormFieldWidth: 250,
    openFormsInNewTab: true,
    databaseCaching: 10,
    databaseLimit: 50
  }, key, fallback);
}

// get the icon for the current dossier
window.getIcon = function (sys_short = '', weight = 'bold') {
  const key = sys_short.toLowerCase();
  return {
    opg: `/icon:${weight}/interface-user-multiple`,
    eig: `/icon:${weight}/interface-user-home`,
    obj: `/icon:${weight}/shopping-store-factory-building`,
    sub: `/icon:${weight}/interface-home-2`,
    unt: `/icon:${weight}/interface-home-4`,
    khu: `/icon:${weight}/money-graph-arrow-increase`,
    khz: `/icon:${weight}/interface-edit-binocular`,
    kbg: `/icon:${weight}/money-currency-euro-circle`,
    kop: `/icon:${weight}/shopping-business-table`,
    knt: `/icon:${weight}/interface-file-check`,
    svc: `/icon:${weight}/interface-setting-wrench`,
    wer: `/icon:${weight}/interface-file-text`,
    rel: `/icon:${weight}/interface-user-single`,
    con: `/icon:${weight}/interface-user-single`,
    oui: `/icon:${weight}/interface-setting-wrench`,
    eos: `/icon:${weight}/interface-user-home`,
    doc: `/icon:${weight}/interface-user-home`
  }[key] || `/icon:${weight}/interface-help-question-circle`;
}

// determine what formatting should be used
window.getFormat = function (column = '', ignore = []) {
  const html_regex = /-(code|id)$/i;
  if (html_regex.test(column) && !ignore.includes(column)) {
    return 'html';
  } else if (column == 'Eigenaar') {
    return 'html';
  } else {
    return 'string';
  }
}

// transform the provided data to support links, etc.
window.transformData = function (data, ignore = []) {
  _.forEach(data, (values, column) => {
    var format = window.getFormat(column, ignore);
    // TODO: in the case of a callback, use custom function
    // callback(column, ...) ?
    if (format == 'html') {
      // TODO: determine correct page by column
      var page = 'eigenaar';
      var col = '_eig_code';
      var key = 'eig';
      var val = null;
      _.forEach(data[column], (value, index) => {
        if (column === 'Eigenaar') {
          val = data[col][index];
          data[column][index] = `<a href="#details=${key}&primary=${key}&secondary=${key}&action=update&id=${val}&title=${value}" target="_blank">${value}</a>`;
        }
        // TODO: activate in order to update value into link
        //  data[column][key] = `<a href="#&key=${page}&id=${val}">${val}</a>`;
      });
    } else {
      _.forEach(data[column], (val, key) => {
        var value = data[column][key];
        if (val === 'true' || val === 'false') {
          value = val === 'true' ? 'Ja' : 'Nee';
        } else if (val === '9998-12-31') {
          value = 'Nooit';
        } else if (_.size(val) === 10 && moment(val, true).isValid()) {
          value = moment(val).format('DD-MM-yyyy');
        } else if (_.isBoolean(val)) {
          value = val ? 'Ja' : 'Nee';
        } else if (/bedrag|prijs|raming|gefactureerd|nog verwacht/i.test(column)) {
          value = '€ ' + _.toNumber(val).toLocaleString('nl-NL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        }
        data[column][key] = value;
      });
    }
  });
  return data;
}

// alias to transformData
window.transformResults = window.transformData;

// check if the autocomplete data matches certain keywords
window.filterByKeywords = function ({ label, value }, keywords = '') {
  var output = {};
  _.forEach(label, (val, index) => {
    if (keywords == value[index] || _.toLower(val).includes(_.toLower(keywords)) || keywords == '') {
      output[index] = {
        value: value[index],
        label: val
      }
    }
  });
  return output;
}

// transform the data to only get single result
window.getFirstResult = function (data) {
  var newData = {};
  // get the first value from the value array set
  _.forEach(data, (value, field) => {
    newData[field] = _.first(value);
  });
  return newData;
}

// convert a query dataset into an assosiative array
window.toValueLabelSet = function (data, value = 'value', label = 'label', check = '') {
  return _.zipWith(data[value], data[label], data[check], (value, label, check) => ({ value, label, check }));
}

// filter "columnar" data list by input value
window.matchColumnValue = function (data, key, input = '') {
  data[key]
    // normalize the rows into "name" and "value" pairs
    .map((n, i) => ({ name: n, value: data[key][i] }))
    // filter either by empty input or textual match between input and row value 
    .filter(row => !input.value || row.name.toLowerCase().includes(input.toLowerCase()))
}

// Filter columnar data by matching a search input against one or more keys (columns)
window.matchColumn = function (data, keys, input = '') {
  if (!data || !keys) return data;
  // ensure valid array
  const keyArray = Array.isArray(keys) ? keys : [keys];
  // in case of invalid columns, return original
  const validKeys = keyArray.filter(key => data[key]);
  if (validKeys.length === 0) return data;
  const rowCount = data[validKeys[0]].length;
  const matches = [];
  for (let i = 0; i < rowCount; i++) {
    const match = validKeys.some(key =>
      String(data[key]?.[i] ?? '').toLowerCase().includes(input.toLowerCase())
    );
    if (!input || match) matches.push(i);
  }
  const result = {};
  for (const col in data) {
    result[col] = matches.map(i => data[col][i]);
  }

  return result;
};

// filter the data by matching a search input against one or more keys (columns)
window.matchValueLabel = function (data, input = '') {
  return data.filter(({ label, value }) => !input
    || label.toLowerCase().includes(input.toLowerCase())
    || String(value) === String(input));
}

// translation function
// usage: __("nederlands | english", {{ current_user }})
window.__ = function (str, { metadata: { language } }) {
  const regex = /\s\|\s/;

  if (regex.test(str)) {
    var arr = str.split(' | ');
    if (language == 'nl') {
      return arr[0];
    } else {
      return arr[1];
    }
  } else {
    return str;
  }
}

// parse the JSON value to an object and get the specified key
window.val = function (value = '', path = '', fallback = null) {
  // in case an object is provided, get the inner value
  const val = _.get(value, 'value', value);
  // check if the value is a JSON string
  if (window.isJson(val)) {
    // convert the string to an object
    const obj = JSON.parse(val);
    // search the object by provided path
    return _.get(obj, path, fallback);
  }
  // use the (default) value
  return _.get(val, path, fallback);
}

// determine if a provided filter should be used
// this can be provided using an object or array
// objects can be value-specific, whereas arrays
// are only capable of providing the column names
// example: { "unt_adres" : true|false } or [ "unt_adres" ]
// another valid value is a comma-separated string ("unt_adres, unt_plaats")
window.use = function (needle = '', haystack = {}, fallback = false) {
  if (_.isBoolean(haystack)) return haystack;
  if (_.isEmpty(haystack)) return false;
  const fields =
    window.isJson(haystack)
      ? JSON.parse(haystack)
      : _.isString(haystack)
        ? haystack.split(', ')
        : haystack;
  return window.isObject(fields)
    ? _.has(fields, needle, fallback)
    : _.isArrayLike(fields)
      ? fields.includes(needle)
      : fallback;
}

window.useButton = window.use; // alias
window.useFilter = window.use; // alias

// determine if any filters should be used
window.hasFilters = function (filters = {}) {
  const fields = _.get(filters, 'value', filters);
  if (_.isArrayLike(fields)) {
    return _.size(fields) > 0;
  } else if (_.isObject(fields)) {
    dashboard
    return _.some(fields, (v) => v);
  } else if (_.isEmpty(fields)) {
    return false;
  }
}

// check if the provided string is JSON
window.isJson = function (str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

// check if provided value is an object
window.isObject = function (obj) {
  return _.isObject(obj) && !_.isArrayLikeObject(obj);
}

// get the value from JSON or any other datatype
window.get = function (haystack, needle, fallback = null) {
  if (window.isJson(haystack)) {
    const obj = JSON.parse(haystack);
    return _.get(obj, needle, fallback);
  }
}

// get a global label from a defined list of key-value sets
window.getLabel = function (key = '', fallback = null) {
  const label = _.get({
    create: 'toevoegen | add',
    edit: 'bewerken | edit',
    delete: 'verwijderen | delete'
  }, key, fallback);

  return window.__(label);
}

// generate an Excel sheet based on provides table data
window.getExcel = function (dfd, data, file = 'excel.xlsx', include_hidden = false) {
  const result = data.reduce((acc, row) => {
    Object.keys(row).forEach((key) => {
      if (!include_hidden && key.indexOf('_') == 0) {
        return;
      }
      acc[key] = acc[key] || [];
      acc[key].push(row[key]);
    });
    return acc;
  }, {});

  let df = new dfd.DataFrame(result);

  dfd.toExcel(df, { filePath: file });
}

// convert the provided ID to a "sys short" equivalen
window.sysShort = function (key, value = null) {
  return key + '-' + (value || 0).toString().padStart(6, '0');
}

// map the data dictionary structure
window.dd = function (data) {
  var output = {};

  _.forEach(data.column_name, (column_name, key) => {
    var type = data.data_type[key];
    var max = data.maximum_length[key];
    var required = data.is_nullable[key] === 'NO';
    var default_value = data.column_default[key];
    if (default_value) {
      if (type === 'integer') {
        default_value = _.toNumber(default_value);
      } else if (type === 'boolean') {
        default_value = default_value === 'true' ? true : false;
      } else if (type === 'text') {
        default_value = _.toString(default_value);
      } else if (type.indexOf('timestamp') !== -1) {
        default_value = new Date();
      }
    } else {
      default_value = null;
    }
    output[column_name] = { type, required, max, default: default_value };
  });

  return output;
}

// determine if both a user and dossier can perform a certain action
window.can = function (action, dossier, user) {
  dossier = _.get(dossier, 'value', dossier);
  return (
    window.authorize(action, dossier?.allowed_actions) &&
    window.authorize(action, user.metadata?.allowed_actions)
  );
};

// determine if certain content can be accessed by the current user
// in practice though, this is usually the sys-short, e.g. "obj" (lowercase)
window.see = function (dossier, { metadata: { allowed_content } }) {
  return window.authorize(dossier, allowed_content);
}

// determine if a certain value is allowed according to the whitelist
// this could be an action or the name of a dossier
window.authorize = function (value, whitelist = []) {
  var haystack = whitelist;

  if (window.isJson(whitelist)) {
    haystack = JSON.parse(whitelist);
  } else if (_.isString(whitelist)) {
    haystack = [whitelist];
  }

  if (Array.isArray(haystack) && haystack.includes(value) || haystack[0] === '*') {
    return true;
  }

  if (typeof haystack === 'object' && haystack[value] === true) {
    return true;
  }

  return false;
};
