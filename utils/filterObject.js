const filterObject = (obj, allowedFields) => {
    const filteredObj = {};
    allowedFields.forEach(field => {
        if (obj[field]) {
            filteredObj[field] = obj[field];
        }
    });
    return filteredObj;
};

export default filterObject;