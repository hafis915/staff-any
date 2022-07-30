import {
  getRepository,
  FindManyOptions,
  FindOneOptions,
  FindConditions,
  DeleteResult,
} from "typeorm";
import moduleLogger from "../../../shared/functions/logger";
import Shift from "../entity/shift";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

const logger = moduleLogger("shiftRepository");

export const find = async (opts?: FindManyOptions<Shift>): Promise<Shift[]> => {
  logger.info("Find");
  const repository = getRepository(Shift);
  const data = await repository.find(opts);
  return data;
};

export const findById = async (
  id: string,
  opts?: FindOneOptions<Shift>
): Promise<Shift> => {
  logger.info("Find by id");
  const repository = getRepository(Shift);
  const data = await repository.findOne(id, opts);
  return data;
};

export const findOne = async (
  where?: FindConditions<Shift>,
  opts?: FindOneOptions<Shift>
): Promise<Shift> => {
  logger.info("Find one");
  const repository = getRepository(Shift);
  const data = await repository.findOne(where, opts);
  return data;
};

export const create = async (payload: Shift): Promise<Shift> => {
  logger.info("Create");
  const repository = getRepository(Shift);
  const newdata = await repository.save(payload);
  return newdata;
};

export const updateById = async (
  id: string,
  payload: QueryDeepPartialEntity<Shift>
): Promise<Shift> => {
  logger.info("Update by id");
  const repository = getRepository(Shift);
  await repository.update(id, payload);
  return findById(id);
};

export const deleteById = async (
  id: string | string[]
): Promise<DeleteResult> => {
  logger.info("Delete by id");
  const repository = getRepository(Shift);
  return await repository.delete(id);
};

export const checkExisting = async(date:string, startTime: string, endTime :string) : Promise<Shift[]> => {
  const repository = getRepository(Shift);
  let _date: string | Date = new Date(date)
  let _year = _date.getFullYear()
  let _month = _date.getMonth()+1 > 9 ? _date.getMonth()+1 : '0'+ (_date.getMonth()+1)
  let _dates = _date.getDate()
  _date = `${_year}-${_month}-${_dates}`
  console.log(_date)
  const _query = `
  select * from "shift" s where s.date = '${_date}' and (s."startTime" >= '${startTime}' or  s."endTime" > '${startTime}' ) and 
  (s."startTime" < '${endTime}' or s."endTime" < '${endTime}');
  `
  console.log(_query, "<<< QUERY")
  const data = await repository.query(_query)
  console.log(data, "<< REPOSITORY ")
  return data
}
