import { Controller, Get, Post, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CardService } from '../services/card.service';
import { Card } from '../entities/card.entity';

@ApiTags('cards')
@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  @ApiOperation({ summary: 'List all cards for a user' })
  @ApiQuery({ name: 'userId', description: 'User ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'List of cards', type: [Card] })
  async listCards(@Query('userId') userId: string): Promise<Card[]> {
    return this.cardService.findByUserId(userId);
  }

  @Get(':cardId')
  @ApiOperation({ summary: 'Get card details' })
  @ApiParam({ name: 'cardId', description: 'Card ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Card details', type: Card })
  @ApiResponse({ status: 404, description: 'Card not found' })
  async getCard(@Param('cardId', ParseUUIDPipe) cardId: string): Promise<Card> {
    return this.cardService.findById(cardId);
  }

  @Post(':cardId/suspend')
  @ApiOperation({ summary: 'Suspend a card' })
  @ApiParam({ name: 'cardId', description: 'Card ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Card suspended successfully', type: Card })
  @ApiResponse({ status: 404, description: 'Card not found' })
  @ApiResponse({ status: 400, description: 'Card cannot be suspended' })
  async suspendCard(@Param('cardId', ParseUUIDPipe) cardId: string): Promise<Card> {
    return this.cardService.suspendCard(cardId);
  }

  @Post(':cardId/activate')
  @ApiOperation({ summary: 'Activate a suspended card' })
  @ApiParam({ name: 'cardId', description: 'Card ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Card activated successfully', type: Card })
  @ApiResponse({ status: 404, description: 'Card not found' })
  @ApiResponse({ status: 400, description: 'Card cannot be activated' })
  async activateCard(@Param('cardId', ParseUUIDPipe) cardId: string): Promise<Card> {
    return this.cardService.activateCard(cardId);
  }

  @Post(':cardId/cancel')
  @ApiOperation({ summary: 'Cancel a card' })
  @ApiParam({ name: 'cardId', description: 'Card ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Card cancelled successfully', type: Card })
  @ApiResponse({ status: 404, description: 'Card not found' })
  @ApiResponse({ status: 400, description: 'Card cannot be cancelled' })
  async cancelCard(@Param('cardId', ParseUUIDPipe) cardId: string): Promise<Card> {
    return this.cardService.cancelCard(cardId);
  }
}