import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerInSuppliers } from '@artifact/lpg-api-service';
import { LogDecorator } from 'src/common/decorators/log.decorator';

// 定義 customer_group_binding 實體
export class CustomerGroupBinding {
  customer_group_binding_id: number;
  customer_group_id?: number;
  customer_id: number;
  linebot_user_id: number;
  create_time_stamp: Date;
}

// 定義 linebot_user 實體
export class LinebotUser {
  linebot_user_id: number;
  line_user_id: string;
  phone_number?: string;
  displayName: string;
  pictureUrl: string;
}

@LogDecorator('LineAuthRepository')
@Injectable()
export class LineAuthRepository {
  // 內存存儲模擬
  private static customerGroupBindings: CustomerGroupBinding[] = [];
  private static linebotUsers: LinebotUser[] = [];
  private static nextBindingId = 1;
  private static nextLinebotUserId = 1;

  constructor(
    @InjectRepository(CustomerInSuppliers)
    private readonly customerInSuppliersRepository: Repository<CustomerInSuppliers>
  ) {}

  public async getCustomerInSuppliersByAuthenticationCode(authenticationCode: string) {
    const customerInSuppliers = await this.customerInSuppliersRepository.findOne({
      where: {
        authentication_code: authenticationCode,
      },
    });
    
    return customerInSuppliers;
  }

  /**
   * 透過 customer_id 找到 binding 並檢查是否有對應的 line_user_id
   */
  public async findBindingByCustomerId(customerId: number): Promise<{ 
    binding: CustomerGroupBinding | null; 
    linebotUser: LinebotUser | null 
  }> {
    this.logger.log(`[Repository] 查詢 customer_id: ${customerId} 的 binding`);
    
    // 在內存中查詢 customer_group_binding
    const binding = LineAuthRepository.customerGroupBindings.find(
      b => b.customer_id === customerId
    );
    
    if (!binding) {
      this.logger.log(`[Repository] 未找到 customer_id: ${customerId} 的 binding`);
      return { binding: null, linebotUser: null };
    }
    
    // 在內存中查詢對應的 linebot_user
    const linebotUser = LineAuthRepository.linebotUsers.find(
      u => u.linebot_user_id === binding.linebot_user_id
    );
    
    if (!linebotUser) {
      this.logger.log(`[Repository] 未找到 linebot_user_id: ${binding.linebot_user_id} 的 linebot_user`);
      return { binding, linebotUser: null };
    }
    
    this.logger.log(`[Repository] 找到 binding 和 linebot_user - line_user_id: ${linebotUser.line_user_id}`);
    return { binding, linebotUser };
  }

  /**
   * 創建新的 binding 和 linebot_user 記錄
   */
  public async createBindingAndLinebotUser(
    customerId: number, 
    lineUserId: string, 
    displayName: string, 
    pictureUrl: string,
    phoneNumber?: string
  ): Promise<{ binding: CustomerGroupBinding; linebotUser: LinebotUser }> {
    this.logger.log(`[Repository] 創建新的 binding 和 linebot_user - customer_id: ${customerId}, line_user_id: ${lineUserId}`);
    
    // 1. 先創建 linebot_user（在內存中）
    const newLinebotUser: LinebotUser = {
      linebot_user_id: LineAuthRepository.nextLinebotUserId++,
      line_user_id: lineUserId,
      phone_number: phoneNumber,
      displayName: displayName,
      pictureUrl: pictureUrl
    };
    
    // 添加到內存存儲
    LineAuthRepository.linebotUsers.push(newLinebotUser);
    this.logger.log(`[Repository] 創建 linebot_user - ID: ${newLinebotUser.linebot_user_id}, line_user_id: ${newLinebotUser.line_user_id}`);
    
    // 2. 再創建 customer_group_binding（在內存中）
    const newBinding: CustomerGroupBinding = {
      customer_group_binding_id: LineAuthRepository.nextBindingId++,
      customer_id: customerId,
      linebot_user_id: newLinebotUser.linebot_user_id,
      create_time_stamp: new Date()
    };
    
    // 添加到內存存儲
    LineAuthRepository.customerGroupBindings.push(newBinding);
    this.logger.log(`[Repository] 創建 customer_group_binding - ID: ${newBinding.customer_group_binding_id}, customer_id: ${newBinding.customer_id}`);
    
    return { binding: newBinding, linebotUser: newLinebotUser };
  }

  /**
   * 獲取所有內存中的 binding 資料（用於調試）
   */
  public getAllBindings(): CustomerGroupBinding[] {
    return [...LineAuthRepository.customerGroupBindings];
  }

  /**
   * 獲取所有內存中的 linebot_user 資料（用於調試）
   */
  public getAllLinebotUsers(): LinebotUser[] {
    return [...LineAuthRepository.linebotUsers];
  }

  /**
   * 清空內存資料（用於測試）
   */
  public clearAllData(): void {
    LineAuthRepository.customerGroupBindings = [];
    LineAuthRepository.linebotUsers = [];
    LineAuthRepository.nextBindingId = 1;
    LineAuthRepository.nextLinebotUserId = 1;
    this.logger.log(`[Repository] 清空所有內存資料`);
  }
}