import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Public, ResponseMessage, User } from 'src/core/customize.decorator';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ResponseMessage('Company created successfully')
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @Public()
  @ResponseMessage('Fetched companies with pagination')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') pageSize: string,
    @Query() qs: string,
  ) {
    return this.companiesService.findAll(+currentPage, +pageSize, qs);
  }

  @Get('/job-stats')
  @Public()
  @ResponseMessage('Fetched company job statistics successfully')
  async getCompanyJobStats(
    @Query('current') currentPage: string,
    @Query('pageSize') pageSize: string,
    @Query() qs: string,
  ) {
    return this.companiesService.getCompanyJobStats(
      +currentPage,
      +pageSize,
      qs,
    );
  }

  @Get(':id/jobs')
  @Public()
  @ResponseMessage('Fetched jobs by company successfully')
  async getJobsByCompanyId(@Param('id') companyId: string) {
    return this.companiesService.getJobsByCompanyId(companyId);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Successfully fetched company by id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Company updated successfully')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
