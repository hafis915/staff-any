import { Request, ResponseToolkit } from "@hapi/hapi";
import * as shiftUsecase from "../../../usecases/shiftUsecase";
import { errorHandler } from "../../../shared/functions/error";
import {
  ICreateShift,
  ISuccessResponse,
  IUpdateShift,
  IErrorResponse,
  IBulkPublish
} from "../../../shared/interfaces";
import moduleLogger from "../../../shared/functions/logger";
import { Between } from "typeorm";
import moment from "moment"

const logger = moduleLogger("shiftController");

export const find = async (req: Request, h: ResponseToolkit) => {
  logger.info("Find shifts");
  try {
    let filter = req.query;
    if(filter.range) {
      filter = {
        where : [          
          {date : Between(filter.firstDate, filter.lastDate)},
          ]
      }
    }
    const data = await shiftUsecase.find(filter);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Get shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
};

export const findById = async (req: Request, h: ResponseToolkit) => {
  logger.info("Find shift by id");
  try {
    const id = req.params.id;
    const data = await shiftUsecase.findById(id);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Get shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
};

export const create = async (req: Request, h: ResponseToolkit) => {
  logger.info("Create shift");
  try {
    const body = req.payload as ICreateShift;
    // find  shift that overlap with the payload time
    const existingShift = await shiftUsecase.checkExisting(body.date, body.startTime, body.endTime)
    let res :ISuccessResponse | IErrorResponse
    if(existingShift.length > 0 ) {
      throw {
        status: 400,
        message: "Shift That You Create Is Overlapping With Existing Shift",
        name : "Shift Is OverLapping",
      }
    }else {
      const data = await shiftUsecase.create(body);
      res = {
        statusCode: 200,
        message: "Create shift successful",
        results: data,
      };
    }


    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
};

export const updateById = async (req: Request, h: ResponseToolkit) => {
  logger.info("Update shift by id");
  try {
    const id = req.params.id;
    const body = req.payload as IUpdateShift;
    // find  shift that overlap with the payload time
    const _data = await shiftUsecase.findById(id) 
    console.log(_data.startTime.slice(0,-3) != body.startTime )
    console.log( _data.endTime.slice(0,-3) != body.endTime)


    let existingShift = []
    if((_data.startTime.slice(0,-3) != body.startTime || _data.endTime.slice(0,-3) != body.endTime)) {
      existingShift = await shiftUsecase.checkExisting(body.date, body.startTime, body.endTime)
    }
    let res :ISuccessResponse | IErrorResponse
    if(existingShift.length > 0 ) {
      throw {
        status: 400,
        message: "Shift That You Create Is Overlapping With Existing Shift",
        name : "Shift Is OverLapping",
      }
    }else {
      console.log(_data.isPublish, "<<<<<")
      if(!_data.isPublish ){
        const data = await shiftUsecase.updateById(id, body);
        res = {
          statusCode: 200,
          message: "Update shift successful",
          results: data,
        };
      }else {
        throw {
          stats: 400,
          message: "Shift has published",
          name: "You Cant Edit Published shift"
        }
      }
    }
    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
};

export const deleteById = async (req: Request, h: ResponseToolkit) => {
  logger.info("Delete shift by id");
  try {
    const id = req.params.id;
    const data = await shiftUsecase.deleteById(id);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Delete shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
};

export const bulkPublished = async(req: Request, h: ResponseToolkit) => {
  logger.info("Bulk Change isPublish");
  try {
    const body= req.payload as IBulkPublish
    const data = await shiftUsecase.bulkPublished(body.id, body.status)
    const res: ISuccessResponse = {
      statusCode: 200, 
      message : "Success Change IsPublished status",
      results : data
    }
    return res
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
}
