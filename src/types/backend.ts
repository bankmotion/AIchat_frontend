/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/test-profile": {
    get: operations["AppController_getProfile"];
  };
  "/test-profile-jwt": {
    get: operations["AppController_getProfileJwt"];
  };
  "/characters/home": {
    get: operations["CharacterController_getCharactersForHome"];
  };
  "/characters": {
    post: operations["CharacterController_createCharacter"];
  };
  "/characters/{id}": {
    get: operations["CharacterController_getCharacter"];
    patch: operations["CharacterController_updateCharacter"];
  };
  "/profiles/{id}": {
    get: operations["ProfileController_getProfile"];
  };
  "/profiles/{id}/characters": {
    get: operations["ProfileController_getProfileCharacters"];
  };
  "/profiles/mine": {
    patch: operations["ProfileController_updateProfile"];
  };
  "/chats": {
    post: operations["ChatController_create"];
  };
  "/chats/{id}": {
    get: operations["ChatController_get"];
    patch: operations["ChatController_update"];
  };
  "/tags": {
    get: operations["TagController_findAll"];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    TagEntity: {
      id: number;
      description: string;
      name: string;
      slug: string;
      created_at: string;
    };
    CharacterView: {
      id: string;
      name: string;
      avatar: string;
      description: string;
      created_at: string;
      is_public: boolean;
      is_nsfw: boolean;
      creator_id: string;
      creator_name: string;
      tags?: (components["schemas"]["TagEntity"])[];
    };
    CharacterDto: {
      avatar: string;
      name: string;
      personality: string;
      scenario: string;
      description: string;
      example_dialogs: string;
      first_message: string;
      is_nsfw: boolean;
      is_public: boolean;
      tag_ids: (number)[];
    };
    CharacterEntity: {
      id: string;
      avatar: string;
      created_at: string;
      creator_id: string;
      description: string;
      example_dialogs: string;
      first_message: string;
      is_nsfw: boolean;
      is_public: boolean;
      name: string;
      personality: string;
      scenario: string;
      updated_at: string;
    };
    FullCharacterView: {
      id: string;
      name: string;
      avatar: string;
      description: string;
      created_at: string;
      is_public: boolean;
      is_nsfw: boolean;
      creator_id: string;
      creator_name: string;
      tags?: (components["schemas"]["TagEntity"])[];
      example_dialogs: string;
      first_message: string;
      personality: string;
      scenario: string;
    };
    ProfileResponse: {
      id: string;
      about_me: string;
      avatar: string;
      name: string;
      profile: string;
      user_name: string;
    };
    ProfileUpdateDto: {
      about_me: string;
      avatar: string;
      name: string;
      profile: string;
      user_name: string;
    };
    CreateChatDto: {
      character_id: string;
    };
    ChatEntity: {
      id: number;
      character_id: string;
      user_id: string;
      created_at: string;
      is_public: boolean;
    };
    UpdateChatDto: {
      is_public: boolean;
    };
    ChatEntityWithCharacter: {
      id: number;
      character_id: string;
      user_id: string;
      created_at: string;
      is_public: boolean;
      characters: {
        name?: string;
        description?: string;
        avatar?: string;
      };
    };
    ChatMessageEntity: {
      chat_id: number;
      created_at: string;
      id: number;
      is_bot: boolean;
      is_main: boolean;
      message: string;
    };
    ChatResponse: {
      chat: components["schemas"]["ChatEntityWithCharacter"];
      chatMessages: (components["schemas"]["ChatMessageEntity"])[];
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type external = Record<string, never>;

export interface operations {

  AppController_getProfile: {
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  AppController_getProfileJwt: {
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  CharacterController_getCharactersForHome: {
    responses: {
      200: never;
      default: {
        content: {
          "application/json": (components["schemas"]["CharacterView"])[];
        };
      };
    };
  };
  CharacterController_createCharacter: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["CharacterDto"];
      };
    };
    responses: {
      201: {
        content: {
          "application/json": Record<string, never>;
        };
      };
      default: {
        content: {
          "application/json": components["schemas"]["CharacterEntity"];
        };
      };
    };
  };
  CharacterController_getCharacter: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: never;
      default: {
        content: {
          "application/json": components["schemas"]["FullCharacterView"];
        };
      };
    };
  };
  CharacterController_updateCharacter: {
    parameters: {
      path: {
        id: string;
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CharacterDto"];
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
      default: {
        content: {
          "application/json": components["schemas"]["CharacterEntity"];
        };
      };
    };
  };
  ProfileController_getProfile: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
      default: {
        content: {
          "application/json": components["schemas"]["ProfileResponse"];
        };
      };
    };
  };
  ProfileController_getProfileCharacters: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: never;
      default: {
        content: {
          "application/json": (components["schemas"]["CharacterView"])[];
        };
      };
    };
  };
  ProfileController_updateProfile: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["ProfileUpdateDto"];
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  ChatController_create: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateChatDto"];
      };
    };
    responses: {
      201: {
        content: {
          "application/json": Record<string, never>;
        };
      };
      default: {
        content: {
          "application/json": components["schemas"]["ChatEntity"];
        };
      };
    };
  };
  ChatController_get: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: never;
      default: {
        content: {
          "application/json": components["schemas"]["ChatResponse"];
        };
      };
    };
  };
  ChatController_update: {
    parameters: {
      path: {
        id: string;
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateChatDto"];
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
      default: {
        content: {
          "application/json": components["schemas"]["ChatEntity"];
        };
      };
    };
  };
  TagController_findAll: {
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
      default: {
        content: {
          "application/json": (components["schemas"]["TagEntity"])[];
        };
      };
    };
  };
}
