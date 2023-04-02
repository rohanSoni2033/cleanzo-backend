import GlobalError from "../error/GlobalError.js";
import asyncHandler from "../utils/asyncHandler.js";
import statusCode from "../utils/statusCode.js";
import Service from "../models/Service.js";

// filtering, sorting
const validateFields = (fields, requiredFields) => {
    requiredFields.forEach(field => {
        if (!fields[field]) {
            throw new GlobalError("Please provide all the required fields", statusCode.BAD_REQUEST);
        }
    })
}

export const getAllServices = asyncHandler(async (req, res, next) => {
    const services = await Service.getAll();
    res.status(statusCode.OK).json({
        status: "success",
        data: {
            length: services.length(),
            services
        }
    })
});

export const getService = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const service = await Service.getOneById(id);
    res.status(statusCode.OK).json({
        status: "success",
        data: {
            service
        }
    })
});

export const createService = asyncHandler(async (req, res, next) => {
    const serviceToCreate = req.body;
    const requiredFieldsForServices = ["image", "name, category, price", "durationForService", "description", "serviceDetails"];

    validateFields(serviceToCreate, requiredFieldsForServices);

    const { image, name, category, price, durationOfService, description, serviceDetails } = serviceToCreate;

    const result = await Service.create(image, name, category, price, durationOfService, description, serviceDetails);

    res.status(statusCode.OK).json({
        status: "success",
        data: result
    });
});


export const deleteService = asyncHandler(async (req, res, next) => { });

export const updateService = asyncHandler(async (req, res, next) => { });
