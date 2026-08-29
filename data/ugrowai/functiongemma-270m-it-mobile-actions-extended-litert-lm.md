# UGrowAI/FunctionGemma-270M-it-Mobile-Actions-Extended-litert-lm

## Resumen

FunctionGemma-270M-it-Mobile-Actions-Extended-litert-lm es una variante del modelo FunctionGemma-270M-it, desarrollado por Google, que ha sido fine-tuneada por UGrowAI sobre el dataset extendido de Mobile Actions (AliRGHZ/Mobile-Actions). Este modelo está diseñado para traducir instrucciones en lenguaje natural en llamadas a funciones ejecutables en dispositivos móviles, como enviar correos, realizar llamadas o gestionar SMS. La versión presentada está convertida al formato LiteRT, pensada para despliegue on-device con baja latencia y privacidad.

Con 270 millones de parámetros, se basa en la arquitectura Gemma 3 y está especializado en function calling. Su tamaño reducido lo hace adecuado para entornos con recursos limitados, como asistentes de voz o agentes conversacionales integrados en aplicaciones móviles. La licencia es Gemma, que permite uso comercial bajo los términos de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3) |
| Parametros totales | 270 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | LiteRT (formato de modelo ligero para on-device) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3, un transformer decoder-only de 270 millones de parametros, entrenado originalmente por Google para tareas de function calling. Sobre esta base, UGrowAI ha realizado un fine-tuning con el dataset extendido de Mobile Actions, que incluye un conjunto ampliado de herramientas y acciones moviles (envio de email, llamadas, SMS, etc.). El entrenamiento se realizo durante 2 epocas con un batch size de 4 por dispositivo, acumulacion de gradientes de 8 pasos, learning rate de 1e-5, scheduler coseno y optimizador AdamW en precision bfloat16. Se activo gradient checkpointing y se utilizo una funcion de perdida que solo entrena sobre las salidas del modelo (completion only loss), no sobre los prompts. El proceso completo tardo aproximadamente 24 minutos en una GPU A100 de Google Colab.

## Capacidades

- Generacion de llamadas a funciones estructuradas a partir de texto natural, siguiendo esquemas JSON definidos.
- Soporte de function calling para acciones moviles: envio de correos electronicos, realizacion de llamadas telefonicas, envio de SMS, entre otras.
- Capacidad de integrarse en agentes conversacionales que ejecutan acciones en el dispositivo.
- Disenado para despliegue on-device mediante LiteRT, lo que permite inferencia local sin conexion a la nube.
- Multilingue limitado: solo soporta ingles de forma nativa.
- No incluye capacidades de vision, audio ni razonamiento multimodal.

## Casos de uso

- Asistentes de voz moviles: el modelo puede interpretar comandos como "envia un correo a Juan con el asunto 'reunion'" y generar la llamada a la funcion `send_email` con los parametros adecuados, permitiendo una ejecucion directa en el dispositivo.
- Automatizacion de tareas de productividad: integrado en aplicaciones de gestion de correo o calendario, puede convertir instrucciones en acciones concretas como programar recordatorios o enviar mensajes.
- Agentes conversacionales para soporte tecnico: un chatbot que necesite ejecutar acciones en el telefono del usuario (por ejemplo, abrir la aplicacion de ajustes o realizar una llamada de prueba) puede usar este modelo para generar las llamadas a funciones correspondientes.
- Control por voz de funciones del telefono: en aplicaciones de accesibilidad, el modelo permite a usuarios con discapacidad motora dictar comandos que se traducen en acciones como marcar un numero o enviar un SMS.
- Prototipado rapido de agentes con function calling: al ser un modelo pequeno y ligero, es adecuado para experimentar con pipelines de agentes en entornos de desarrollo sin necesidad de infraestructura potente.
- Despliegue en dispositivos con recursos limitados: gracias a su formato LiteRT, puede ejecutarse en smartphones de gama media o incluso en dispositivos IoT, habilitando asistentes locales que respetan la privacidad del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta variante extendida. Sin embargo, el modelo similar fine-tuneado por Google sobre el dataset original de Mobile Actions (litert-community/FunctionGemma_270M_Mobile_Actions) alcanzo un 99,67% de precision a nivel de token en el conjunto de validacion, lo que sugiere un rendimiento alto en tareas de generacion de llamadas a funciones. No se dispone de datos comparativos con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- Al ser un modelo de 270 millones de parametros, la inferencia puede ejecutarse en CPU con un consumo de memoria inferior a 1 GB en cuantizacion de 8 bits (aunque no se especifican cuantizaciones disponibles).
- Cabe en cualquier GPU consumer moderna, como una RTX 3060 o superior, con VRAM suficiente para el modelo en precision completa (aproximadamente 1 GB en bfloat16).
- Para despliegue on-device, el formato LiteRT esta optimizado para ejecutarse en procesadores moviles (ARM) con aceleracion via NPU o GPU integrada.
- Opciones de despliegue: LiteRT (recomendado para moviles), tambien puede cargarse con transformers en Python para pruebas locales.
- La latencia en dispositivos moviles se estima en el orden de milisegundos, aunque no se proporcionan datos exactos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| FunctionGemma-270M-it (base) | 270M | no disponible | Function calling general | Gemma | safetensors |
| litert-community/FunctionGemma_270M_Mobile_Actions | 270M | no disponible | Mobile actions (dataset original) | Gemma | LiteRT |
| UGrowAI/FunctionGemma-270M-it-Mobile-Actions-Extended-litert-lm | 270M | no disponible | Mobile actions (dataset extendido) | Gemma | LiteRT |

La variante de UGrowAI se diferencia por entrenarse sobre un dataset extendido de herramientas moviles, lo que podria ampliar el numero de acciones soportadas respecto al modelo de Google. No se dispone de datos de rendimiento comparativo entre ambas versiones.

## Limitaciones y advertencias

- Solo soporta ingles; no hay soporte nativo para otros idiomas, lo que limita su uso en entornos multilingues.
- El modelo esta especializado en function calling para acciones moviles; no es adecuado para generacion de texto general ni tareas de razonamiento complejo.
- No se han publicado evaluaciones de sesgos ni de robustez ante entradas adversariales; se recomienda validar en el dominio de uso.
- La licencia Gemma impone restricciones de uso comercial segun los terminos de Google; es necesario revisar el acuerdo antes de desplegar en produccion.
- Al ser un modelo pequeno, puede presentar alucinaciones en la generacion de parametros de funciones si la instruccion es ambigua o fuera del dominio de entrenamiento.
- No se proporcionan detalles sobre la longitud de contexto soportada, lo que podria limitar conversaciones multi-turno largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UGrowAI/FunctionGemma-270M-it-Mobile-Actions-Extended-litert-lm
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Modelo fine-tuneado por Google (Mobile Actions): https://huggingface.co/litert-community/FunctionGemma_270M_Mobile_Actions
- Dataset extendido de Mobile Actions: https://huggingface.co/datasets/AliRGHZ/Mobile-Actions
- Documentacion de FunctionGemma: https://ai.google.dev/gemma/docs/functiongemma
- Guia de fine-tuning para Mobile Actions: https://ai.google.dev/gemma/docs/mobile-actions
- Notebook de fine-tuning: https://colab.research.google.com/github/google-gemini/gemma-cookbook/blob/main/FunctionGemma/%5BFunctionGemma%5DFinetune_FunctionGemma_270M_for_Mobile_Actions_with_Hugging_Face.ipynb
- Instrucciones de despliegue LiteRT: https://ai.google.dev/edge/litert-lm/python
