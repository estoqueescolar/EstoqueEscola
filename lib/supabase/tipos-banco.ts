
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "cardapio_planejado": {
                  Row: {
                    "atualizado_em": string,"criado_em": string,"data": string,"descricao": string,"id": string,"tipo_refeicao": string
                  }
                  ComputedFields: never
                  Insert: {
                    "atualizado_em"?: string,"criado_em"?: string,"data": string,"descricao": string,"id"?: string,"tipo_refeicao": string
                  }
                  Update: {
                    "atualizado_em"?: string,"criado_em"?: string,"data"?: string,"descricao"?: string,"id"?: string,"tipo_refeicao"?: string
                  }
                  Relationships: [
                    
                  ]
                },"categorias": {
                  Row: {
                    "atualizado_em": string,"criado_em": string,"id": string,"nome": string
                  }
                  ComputedFields: never
                  Insert: {
                    "atualizado_em"?: string,"criado_em"?: string,"id"?: string,"nome": string
                  }
                  Update: {
                    "atualizado_em"?: string,"criado_em"?: string,"id"?: string,"nome"?: string
                  }
                  Relationships: [
                    
                  ]
                },"configuracoes": {
                  Row: {
                    "atualizado_em": string,"chave": string,"criado_em": string,"descricao": string | null,"id": string,"valor": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "atualizado_em"?: string,"chave": string,"criado_em"?: string,"descricao"?: string | null,"id"?: string,"valor": NonNullable<Json>
                  }
                  Update: {
                    "atualizado_em"?: string,"chave"?: string,"criado_em"?: string,"descricao"?: string | null,"id"?: string,"valor"?: NonNullable<Json>
                  }
                  Relationships: [
                    
                  ]
                },"contagem_restricoes": {
                  Row: {
                    "atualizado_em": string,"criado_em": string,"data": string,"id": string,"quantidade_alunos": number,"tipo_restricao_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "atualizado_em"?: string,"criado_em"?: string,"data": string,"id"?: string,"quantidade_alunos": number,"tipo_restricao_id": string
                  }
                  Update: {
                    "atualizado_em"?: string,"criado_em"?: string,"data"?: string,"id"?: string,"quantidade_alunos"?: number,"tipo_restricao_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "contagem_restricoes_tipo_restricao_id_fkey"
      columns: ["tipo_restricao_id"]
isOneToOne: false
      referencedRelation: "tipos_restricao"
      referencedColumns: ["id"]
    }
                  ]
                },"fornecedores": {
                  Row: {
                    "atualizado_em": string,"criado_em": string,"id": string,"nome": string,"observacao": string | null,"telefone": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "atualizado_em"?: string,"criado_em"?: string,"id"?: string,"nome": string,"observacao"?: string | null,"telefone"?: string | null
                  }
                  Update: {
                    "atualizado_em"?: string,"criado_em"?: string,"id"?: string,"nome"?: string,"observacao"?: string | null,"telefone"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"locais_armazenamento": {
                  Row: {
                    "atualizado_em": string,"criado_em": string,"descricao": string | null,"id": string,"nome": string
                  }
                  ComputedFields: never
                  Insert: {
                    "atualizado_em"?: string,"criado_em"?: string,"descricao"?: string | null,"id"?: string,"nome": string
                  }
                  Update: {
                    "atualizado_em"?: string,"criado_em"?: string,"descricao"?: string | null,"id"?: string,"nome"?: string
                  }
                  Relationships: [
                    
                  ]
                },"lotes": {
                  Row: {
                    "ativo": boolean | null,"atualizado_em": string,"codigo": string,"criado_em": string,"data_entrada": string,"data_validade": string,"fornecedor_id": string | null,"id": string,"local_id": string,"observacao": string | null,"produto_id": string,"quantidade": number,"quantidade_inicial": number
                  }
                  ComputedFields: never
                  Insert: {
                    "ativo"?: never,"atualizado_em"?: string,"codigo": string,"criado_em"?: string,"data_entrada"?: string,"data_validade": string,"fornecedor_id"?: string | null,"id"?: string,"local_id": string,"observacao"?: string | null,"produto_id": string,"quantidade": number,"quantidade_inicial": number
                  }
                  Update: {
                    "ativo"?: never,"atualizado_em"?: string,"codigo"?: string,"criado_em"?: string,"data_entrada"?: string,"data_validade"?: string,"fornecedor_id"?: string | null,"id"?: string,"local_id"?: string,"observacao"?: string | null,"produto_id"?: string,"quantidade"?: number,"quantidade_inicial"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "lotes_fornecedor_id_fkey"
      columns: ["fornecedor_id"]
isOneToOne: false
      referencedRelation: "fornecedores"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "lotes_local_id_fkey"
      columns: ["local_id"]
isOneToOne: false
      referencedRelation: "locais_armazenamento"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "lotes_produto_id_fkey"
      columns: ["produto_id"]
isOneToOne: false
      referencedRelation: "produtos"
      referencedColumns: ["id"]
    }
                  ]
                },"movimentacoes": {
                  Row: {
                    "atualizado_em": string,"criado_em": string,"data_hora": string,"id": string,"local_id": string,"lote_id": string,"motivo": string | null,"observacao": string | null,"operacao_id": string,"produto_id": string,"quantidade": number,"sentido": number,"tipo": string,"usuario_id": string,"responsavel": string | null
                  }
                  ComputedFields: "responsavel"
                  Insert: {
                    "atualizado_em"?: string,"criado_em"?: string,"data_hora"?: string,"id"?: string,"local_id": string,"lote_id": string,"motivo"?: string | null,"observacao"?: string | null,"operacao_id"?: string,"produto_id": string,"quantidade": number,"sentido": number,"tipo": string,"usuario_id": string
                  }
                  Update: {
                    "atualizado_em"?: string,"criado_em"?: string,"data_hora"?: string,"id"?: string,"local_id"?: string,"lote_id"?: string,"motivo"?: string | null,"observacao"?: string | null,"operacao_id"?: string,"produto_id"?: string,"quantidade"?: number,"sentido"?: number,"tipo"?: string,"usuario_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "movimentacoes_local_id_fkey"
      columns: ["local_id"]
isOneToOne: false
      referencedRelation: "locais_armazenamento"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "movimentacoes_lote_id_fkey"
      columns: ["lote_id"]
isOneToOne: false
      referencedRelation: "lotes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "movimentacoes_produto_id_fkey"
      columns: ["produto_id"]
isOneToOne: false
      referencedRelation: "produtos"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "movimentacoes_usuario_id_fkey"
      columns: ["usuario_id"]
isOneToOne: false
      referencedRelation: "perfis"
      referencedColumns: ["id"]
    }
                  ]
                },"perfis": {
                  Row: {
                    "ativo": boolean,"atualizado_em": string,"criado_em": string,"email": string,"id": string,"nome": string,"perfil": string
                  }
                  ComputedFields: never
                  Insert: {
                    "ativo"?: boolean,"atualizado_em"?: string,"criado_em"?: string,"email": string,"id": string,"nome"?: string,"perfil"?: string
                  }
                  Update: {
                    "ativo"?: boolean,"atualizado_em"?: string,"criado_em"?: string,"email"?: string,"id"?: string,"nome"?: string,"perfil"?: string
                  }
                  Relationships: [
                    
                  ]
                },"produtos": {
                  Row: {
                    "ativo": boolean,"atualizado_em": string,"categoria_id": string,"criado_em": string,"estoque_minimo": number,"fornecedor_id": string | null,"id": string,"local_padrao_id": string,"nome": string,"unidade_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "ativo"?: boolean,"atualizado_em"?: string,"categoria_id": string,"criado_em"?: string,"estoque_minimo"?: number,"fornecedor_id"?: string | null,"id"?: string,"local_padrao_id": string,"nome": string,"unidade_id": string
                  }
                  Update: {
                    "ativo"?: boolean,"atualizado_em"?: string,"categoria_id"?: string,"criado_em"?: string,"estoque_minimo"?: number,"fornecedor_id"?: string | null,"id"?: string,"local_padrao_id"?: string,"nome"?: string,"unidade_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "produtos_categoria_id_fkey"
      columns: ["categoria_id"]
isOneToOne: false
      referencedRelation: "categorias"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "produtos_fornecedor_id_fkey"
      columns: ["fornecedor_id"]
isOneToOne: false
      referencedRelation: "fornecedores"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "produtos_local_padrao_id_fkey"
      columns: ["local_padrao_id"]
isOneToOne: false
      referencedRelation: "locais_armazenamento"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "produtos_unidade_id_fkey"
      columns: ["unidade_id"]
isOneToOne: false
      referencedRelation: "unidades"
      referencedColumns: ["id"]
    }
                  ]
                },"tipos_restricao": {
                  Row: {
                    "atualizado_em": string,"criado_em": string,"descricao": string | null,"id": string,"nome": string
                  }
                  ComputedFields: never
                  Insert: {
                    "atualizado_em"?: string,"criado_em"?: string,"descricao"?: string | null,"id"?: string,"nome": string
                  }
                  Update: {
                    "atualizado_em"?: string,"criado_em"?: string,"descricao"?: string | null,"id"?: string,"nome"?: string
                  }
                  Relationships: [
                    
                  ]
                },"unidades": {
                  Row: {
                    "atualizado_em": string,"criado_em": string,"id": string,"nome": string,"sigla": string
                  }
                  ComputedFields: never
                  Insert: {
                    "atualizado_em"?: string,"criado_em"?: string,"id"?: string,"nome": string,"sigla": string
                  }
                  Update: {
                    "atualizado_em"?: string,"criado_em"?: string,"id"?: string,"nome"?: string,"sigla"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "aplicar_politicas_padrao":
{ Args: { "tabela": unknown }; Returns: undefined
                           },
"exigir_operador":
{ Args: Record<PropertyKey, never>; Returns: undefined
                           },
"formatar_quantidade":
{ Args: { "q": number }; Returns: string
                           },
"hoje":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"perfil_atual":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"registrar_ajuste":
{ Args: { "p_lote_id": string,"p_motivo": string,"p_observacao"?: string,"p_quantidade": number,"p_sentido": number }; Returns: string
                           },
"registrar_entrada":
{ Args: { "p_codigo"?: string,"p_data_entrada"?: string,"p_data_validade": string,"p_fornecedor_id"?: string,"p_local_id"?: string,"p_observacao"?: string,"p_produto_id": string,"p_quantidade": number }; Returns: string
                           },
"registrar_perda":
{ Args: { "p_lote_id": string,"p_motivo": string,"p_observacao"?: string,"p_quantidade": number }; Returns: string
                           },
"registrar_saida":
{ Args: { "p_observacao"?: string,"p_produto_id": string,"p_quantidade": number }; Returns: Json
                           },
"responsavel":
{ Args: { "m": Omit<Database["public"]['Tables']["movimentacoes"]['Row'], Database["public"]['Tables']["movimentacoes"]['ComputedFields']> }; Returns: string
                           },
"tem_perfil":
{ Args: { "perfis_aceitos": (string)[] }; Returns: boolean
                           },
"validar_motivo":
{ Args: { "m": string }; Returns: undefined
                           },
"validar_quantidade":
{ Args: { "q": number }; Returns: undefined
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
