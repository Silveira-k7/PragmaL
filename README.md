# PRAGMA - Sistema de Reservas Universitário

**Programa de Reservas para Gestão Modular de Ambientes**

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Funcionalidades](#funcionalidades)
3. [Tecnologias](#tecnologias)
4. [Instalação](#instalação)
5. [Uso do Sistema](#uso-do-sistema)
6. [Arquitetura](#arquitetura)
7. [PWA e Offline](#pwa-e-offline)
8. [Performance](#performance)
9. [Segurança](#segurança)
10. [Manutenção](#manutenção)

---

## 🎯 Visão Geral

O **PRAGMA** é um sistema completo de gerenciamento de reservas de salas para instituições de ensino superior. Desenvolvido para suportar alto volume de dados (2000+ salas, 20+ agendamentos diários), oferece funcionalidade offline completa e interface moderna.

### Características Principais
- ✅ **PWA (Progressive Web App)** - Instalável como aplicativo
- ✅ **Funcionalidade Offline** - Trabalha sem internet
- ✅ **IA Integrada** - Assistente "Luciano" para agendamentos
- ✅ **Analytics Avançado** - Relatórios e insights inteligentes
- ✅ **Interface Responsiva** - Funciona em todos os dispositivos
- ✅ **Performance Otimizada** - Suporta milhares de registros

---

## 🚀 Funcionalidades

### 👤 **Sistema de Usuários**
- **Administradores**: Acesso completo ao sistema
- **Usuários**: Visualização de agendamentos
- **Autenticação Segura**: Login com email/senha

### 📅 **Gerenciamento de Agendamentos**
- **Calendário Visual**: Interface intuitiva para visualização
- **Agendamento Individual**: Reservas pontuais
- **Agendamento Semestral**: Até 52 semanas automáticas
- **Horários Predefinidos**: Grade horária da instituição
- **Filtros Avançados**: Por professor, disciplina, bloco, data

### 🏢 **Gestão de Infraestrutura**
- **Blocos**: Organização por prédios/setores
- **Salas**: Cadastro completo de ambientes
- **Hierarquia**: Estrutura organizacional clara

### 🤖 **IA Luciano (LU)**
- **Processamento Natural**: Entende comandos em português
- **Agendamento Rápido**: Criação via chat inteligente
- **Reconhecimento Contextual**: Identifica professores, disciplinas, horários
- **Confirmação Inteligente**: Validação antes de criar

### 📊 **Analytics e Relatórios**
- **Dashboard Executivo**: Métricas em tempo real
- **Insights de IA**: Análises automáticas de uso
- **Exportação**: PDF e Excel
- **Gráficos Interativos**: Visualizações dinâmicas
- **Estatísticas**: Professores, salas, utilização

### 🌐 **PWA e Offline**
- **Instalação**: Como app nativo no dispositivo
- **Cache Inteligente**: Dados salvos localmente
- **Sincronização**: Automática quando volta online
- **Service Worker**: Funcionamento offline completo

---

## 🛠 Tecnologias

### **Frontend**
- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização moderna
- **Framer Motion** - Animações fluidas
- **Zustand** - Gerenciamento de estado
- **React Calendar** - Componente de calendário

### **Backend/Database**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados principal
- **Row Level Security** - Segurança avançada

### **PWA/Offline**
- **Service Worker** - Cache e offline
- **IndexedDB** - Armazenamento local
- **Web App Manifest** - Instalação PWA

### **Ferramentas**
- **Vite** - Build tool moderna
- **ESLint** - Qualidade de código
- **PostCSS** - Processamento CSS

---

## 📦 Instalação

### **Pré-requisitos**
- Node.js 18+
- npm ou yarn
- Conta Supabase (opcional)

### **Passos**

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/pragma.git
cd pragma
```

2. **Instale dependências**
```bash
npm install
```

3. **Configure variáveis de ambiente**
```bash
# .env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_supabase
```

4. **Execute o projeto**
```bash
npm run dev
```

5. **Acesse o sistema**
```
http://localhost:5173
```

---

## 📖 Uso do Sistema

### **Login**
- **Admin**: `admin@pragma.com` / `admin123`
- **Usuário**: `user@pragma.com` / `user123`

### **Navegação Principal**

#### 📅 **Visualizar Calendário**
- Calendário interativo com agendamentos
- Clique em datas para ver detalhes
- Visualização por dia/semana/mês

#### 🤖 **Luciano (LU) - IA Rápida**
- Chat inteligente para agendamentos
- Comandos naturais em português
- Exemplo: *"Prof. João Silva, Cálculo I, Bloco C, segunda-feira às 08:00, 16 semanas"*

#### ➕ **Novo Agendamento**
- Formulário completo de reserva
- Seleção de bloco e sala
- Horários predefinidos ou personalizados
- Opção de agendamento semestral

#### 📋 **Lista de Agendamentos**
- Visualização tabular com filtros
- Paginação otimizada (25/50/100 por página)
- Busca por professor ou disciplina
- Filtros por bloco, sala, data

#### 🏢 **Gerenciar Blocos e Salas**
- Cadastro de novos blocos
- Adição de salas por bloco
- Exclusão com confirmação
- Estrutura hierárquica

#### 👥 **Gerenciar Usuários** (Admin)
- Criação de novos usuários
- Definição de permissões
- Edição de perfis
- Controle de acesso

#### 📊 **Analytics IA** (Admin)
- Dashboard com métricas
- Insights automáticos
- Gráficos interativos
- Exportação de relatórios

---

## 🏗 Arquitetura

### **Estrutura de Pastas**
```
src/
├── components/          # Componentes React
│   ├── Auth.tsx        # Autenticação
│   ├── Dashboard.tsx   # Layout principal
│   ├── Analytics.tsx   # Relatórios
│   └── ...
├── contexts/           # Contextos React
├── hooks/             # Hooks customizados
├── lib/               # Bibliotecas e utilitários
├── store/             # Gerenciamento de estado
└── types.ts           # Definições TypeScript
```

### **Fluxo de Dados**
1. **Interface** → Componentes React
2. **Estado** → Zustand Store
3. **Persistência** → Supabase + IndexedDB
4. **Cache** → Service Worker + LocalStorage

### **Padrões Utilizados**
- **Component Composition** - Componentes reutilizáveis
- **Custom Hooks** - Lógica compartilhada
- **State Management** - Zustand para estado global
- **Error Boundaries** - Tratamento de erros
- **Lazy Loading** - Carregamento sob demanda

---

## 🌐 PWA e Offline

### **Funcionalidades Offline**
- ✅ Visualizar agendamentos existentes
- ✅ Consultar blocos e salas
- ✅ Criar novos agendamentos (sincroniza depois)
- ✅ Usar filtros e busca
- ✅ Acessar analytics com dados em cache

### **Estratégias de Cache**
- **Cache First**: Assets estáticos (CSS, JS, imagens)
- **Network First**: Dados da API
- **Stale While Revalidate**: Dados menos críticos

### **Armazenamento Local**
- **IndexedDB**: Dados complexos e relacionais
- **LocalStorage**: Configurações e preferências
- **SessionStorage**: Dados temporários da sessão

### **Sincronização**
- **Automática**: Quando detecta conexão
- **Manual**: Botão de sincronização
- **Background**: Service Worker em segundo plano

---

## ⚡ Performance

### **Otimizações Implementadas**
- **Virtualização**: Listas grandes com paginação
- **Memoização**: React.memo e useMemo
- **Lazy Loading**: Componentes sob demanda
- **Code Splitting**: Divisão de código
- **Tree Shaking**: Remoção de código não usado

### **Métricas de Performance**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

### **Otimizações para Alto Volume**
- **Paginação**: 25/50/100 itens por página
- **Filtros Inteligentes**: Busca otimizada
- **Cache Estratégico**: Dados frequentes em memória
- **Debounce**: Evita requisições excessivas

---

## 🔒 Segurança

### **Autenticação**
- **JWT Tokens**: Autenticação segura
- **Session Management**: Controle de sessões
- **Password Hashing**: Senhas criptografadas
- **Role-Based Access**: Controle por função

### **Autorização**
- **Row Level Security**: Supabase RLS
- **API Protection**: Endpoints protegidos
- **Input Validation**: Validação de dados
- **XSS Protection**: Sanitização de inputs

### **Dados**
- **HTTPS Only**: Comunicação criptografada
- **Data Encryption**: Dados sensíveis criptografados
- **Backup Strategy**: Backups automáticos
- **Audit Logs**: Logs de auditoria

---

## 🔧 Manutenção

### **Monitoramento**
- **Error Tracking**: Sentry ou similar
- **Performance Monitoring**: Web Vitals
- **Usage Analytics**: Google Analytics
- **Health Checks**: Verificações automáticas

### **Backup e Recuperação**
- **Database Backup**: Diário automático
- **File Backup**: Assets e configurações
- **Disaster Recovery**: Plano de contingência
- **Data Migration**: Scripts de migração

### **Atualizações**
- **Semantic Versioning**: Versionamento semântico
- **CI/CD Pipeline**: Deploy automatizado
- **Feature Flags**: Controle de funcionalidades
- **Rollback Strategy**: Reversão rápida

### **Suporte**
- **Documentation**: Documentação atualizada
- **Issue Tracking**: GitHub Issues
- **User Support**: Canal de suporte
- **Training Materials**: Materiais de treinamento

---

## 📞 Suporte

### **Contatos**
- **Email**: suporte@pragma.edu.br
- **Telefone**: (11) 9999-9999
- **Chat**: Disponível no sistema

### **Recursos**
- **Manual do Usuário**: `/docs/manual-usuario.pdf`
- **FAQ**: `/docs/faq.md`
- **Vídeos Tutoriais**: `/docs/videos/`
- **API Documentation**: `/docs/api/`

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

**PRAGMA** - *Transformando a gestão de espaços acadêmicos* 🎓✨