const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Gold Bud Trans API",
    version: "1.0.0",
    description: "REST API для платформи оренди та продажу будівельної спецтехніки Gold Bud Trans",
    contact: {
      name: "Gold Bud Trans Support",
      email: "support@goldbudtrans.ua"
    }
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Локальний сервер розробки"
    }
  ],
  tags: [
    { name: "Auth", description: "Авторизація та керування профілем" },
    { name: "Cards", description: "Каталог спецтехніки" },
    { name: "Cart", description: "Кошик користувача" },
    { name: "Orders", description: "Оформлення та керування замовленнями" },
    { name: "Coupons", description: "Система промокодів та знижок" },
    { name: "Reviews", description: "Відгуки та оцінки техніки" },
    { name: "News", description: "Новини компанії" },
    { name: "Stats", description: "Аналітика для адміністратора" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Реєстрація нового користувача",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "email", "password"],
                properties: {
                  username: { type: "string", example: "ivan_petrenko" },
                  email: { type: "string", example: "ivan@example.com" },
                  password: { type: "string", example: "secret123" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Користувач успішно зареєстрований" },
          400: { description: "Помилка валідації або користувач вже існує" }
        }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Вхід користувача (отримання JWT)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string", example: "admin" },
                  password: { type: "string", example: "admin123" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Успішна авторизація, повертає токен" },
          400: { description: "Невірний логін або пароль" }
        }
      }
    },
    "/cards": {
      get: {
        tags: ["Cards"],
        summary: "Отримати всю техніку (каталог)",
        parameters: [
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "deal_type", in: "query", schema: { type: "string", enum: ["rent", "sale", "both"] } }
        ],
        responses: {
          200: { description: "Список карток спецтехніки" }
        }
      }
    },
    "/cards/available": {
      get: {
        tags: ["Cards"],
        summary: "Отримати тільки доступну техніку для замовлення",
        responses: {
          200: { description: "Список доступної техніки" }
        }
      }
    },
    "/coupons": {
      get: {
        tags: ["Coupons"],
        summary: "Отримати список активних промокодів",
        responses: {
          200: { description: "Список промокодів" }
        }
      }
    },
    "/coupons/validate": {
      post: {
        tags: ["Coupons"],
        summary: "Перевірити промокод та отримати відсоток знижки",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code"],
                properties: {
                  code: { type: "string", example: "WELCOME10" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Промокод дійсний" },
          400: { description: "Недійсний або вичерпаний промокод" }
        }
      }
    },
    "/cards/{id}": {
      get: {
        tags: ["Cards"],
        summary: "Отримати деталі конкретної одиниці спецтехніки",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        responses: {
          200: { description: "Детальна інформація про техніку" },
          404: { description: "Техніку не знайдено" }
        }
      }
    },
    "/cart": {
      get: {
        tags: ["Cart"],
        summary: "Отримати товари у кошику користувача",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Список товарів у кошику" },
          401: { description: "Необхідна авторизація" }
        }
      },
      post: {
        tags: ["Cart"],
        summary: "Додати техніку в кошик",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["card_id"],
                properties: {
                  card_id: { type: "integer", example: 1 }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Товар додано до кошика" },
          400: { description: "Товар вже в кошику" }
        }
      },
      delete: {
        tags: ["Cart"],
        summary: "Очистити кошик",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Кошик очищено" }
        }
      }
    },
    "/orders": {
      get: {
        tags: ["Orders"],
        summary: "Отримати замовлення (для поточного користувача або всі для адміна)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Список замовлень" },
          401: { description: "Потрібна авторизація" }
        }
      },
      post: {
        tags: ["Orders"],
        summary: "Створити нове замовлення на оренду / купівлю",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  customer_name: { type: "string", example: "Іван Петренко" },
                  customer_email: { type: "string", example: "ivan@example.com" },
                  customer_phone: { type: "string", example: "+380501234567" },
                  start_date: { type: "string", format: "date", example: "2026-09-15" },
                  end_date: { type: "string", format: "date", example: "2026-09-20" },
                  items: { type: "string", description: "JSON-масив обраних товарів" },
                  document: { type: "string", format: "binary", description: "Скан паспорта або посвідчення" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Замовлення успішно створено" },
          400: { description: "Помилка валідації або техніка недоступна" }
        }
      }
    },
    "/orders/{id}/invoice": {
      get: {
        tags: ["Orders"],
        summary: "Згенерувати офіційний PDF договір / квитанцію замовлення",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        responses: {
          200: {
            description: "PDF документ",
            content: { "application/pdf": {} }
          }
        }
      }
    },
    "/reviews/{card_id}": {
      get: {
        tags: ["Reviews"],
        summary: "Отримати відгуки до певної техніки",
        parameters: [
          { name: "card_id", in: "path", required: true, schema: { type: "integer" } }
        ],
        responses: {
          200: { description: "Дерево відгуків" }
        }
      },
      post: {
        tags: ["Reviews"],
        summary: "Залишити новий відгук або відповідь",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["text"],
                properties: {
                  text: { type: "string", example: "Чудова техніка, все працює справно!" },
                  rating: { type: "integer", example: 5 },
                  parent_id: { type: "integer", nullable: true }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Відгук додано" }
        }
      }
    },
    "/health": {
      get: {
        summary: "Перевірка працездатності сервісу (Health check)",
        responses: {
          200: { description: "Сервіс працює" }
        }
      }
    },
    "/news": {
      get: {
        tags: ["News"],
        summary: "Отримати список новин",
        responses: {
          200: { description: "Список новин" }
        }
      }
    },
    "/stats/summary": {
      tags: ["Stats"],
      get: {
        summary: "Отримати зведену статистику (тільки адмін)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Зведена статистика" },
          403: { description: "Доступ заборонено" }
        }
      }
    }
  }
};

module.exports = {
  swaggerServe: swaggerUi.serve,
  swaggerSetup: swaggerUi.setup(swaggerDocument)
};
