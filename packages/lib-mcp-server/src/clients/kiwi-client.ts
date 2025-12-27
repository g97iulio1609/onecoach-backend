/**
 * Kiwi MCP Client
 *
 * Client per comunicare con il server MCP esterno di Kiwi.com.
 * Usa il protocollo MCP standard su trasporto SSE.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { logger } from '@onecoach/lib-shared/utils/logger';

export class KiwiMcpClient {
  private client: Client | null = null;
  private transport: SSEClientTransport | null = null;
  private static instance: KiwiMcpClient | null = null;

  private constructor() {}

  /**
   * Ottiene l'istanza singleton del client
   */
  public static getInstance(): KiwiMcpClient {
    if (!KiwiMcpClient.instance) {
      KiwiMcpClient.instance = new KiwiMcpClient();
    }
    return KiwiMcpClient.instance;
  }

  /**
   * Assicura che il client sia connesso al server
   */
  private async ensureConnected() {
    if (this.client) return;

    try {
      this.transport = new SSEClientTransport(new URL("https://mcp.kiwi.com"));
      this.client = new Client(
        { name: "onecoach-flight-agent", version: "1.0.0" },
        { capabilities: {} }
      );

      await this.client.connect(this.transport);
      
      if (process.env.NODE_ENV === 'development') {
        logger.warn("✈️ [Kiwi MCP] Connesso con successo a Kiwi.com");
      }
    } catch (error) {
      logger.error("❌ [Kiwi MCP] Errore di connessione:", error);
      this.client = null;
      this.transport = null;
      throw error;
    }
  }

  /**
   * Esegue un tool sul server Kiwi con retry logic
   */
  public async callTool<T = any>(name: string, args: Record<string, any>, maxRetries = 2): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Reset connection on retry
        if (attempt > 0) {
          logger.warn(`🔄 [Kiwi MCP] Retry ${attempt}/${maxRetries} per ${name}`);
          await this.close();
        }
        
        await this.ensureConnected();
        if (!this.client) throw new Error("Kiwi MCP client non inizializzato");

        const response = await this.client.callTool({
          name,
          arguments: args,
        });
        
        return response as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.error(`❌ [Kiwi MCP] Errore tentativo ${attempt + 1} per ${name}:`, {
          error: lastError.message,
          attempt: attempt + 1,
          maxRetries,
        });
        
        // Reset connection for next retry
        await this.close();
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    throw lastError ?? new Error(`Failed to call ${name} after ${maxRetries + 1} attempts`);
  }


  /**
   * Lista i tools disponibili sul server Kiwi
   */
  public async listTools() {
    await this.ensureConnected();
    if (!this.client) throw new Error("Kiwi MCP client non inizializzato");

    return await this.client.listTools();
  }

  /**
   * Chiude la connessione (se necessario)
   */
  public async close() {
    if (this.transport) {
      await this.transport.close();
      this.client = null;
      this.transport = null;
    }
  }
}
