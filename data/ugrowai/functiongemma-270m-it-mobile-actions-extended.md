# UGrowAI/FunctionGemma-270M-it-Mobile-Actions-Extended

## Resumen

FunctionGemma-270M-it-Mobile-Actions-Extended es un modelo de lenguaje ligero de 270 millones de parámetros, desarrollado por UGrowAI como un fine-tuning del modelo FunctionGemma de Google. Está especializado en traducir peticiones en lenguaje natural a llamadas a funciones concretas, específicamente orientadas a acciones móviles como enviar correos, realizar llamadas telefónicas o gestionar SMS. El modelo se basa en la arquitectura Gemma 3 y ha sido ajustado sobre el dataset extendido de Mobile Actions (AliRGHZ/Mobile-Actions), que amplía el conjunto de herramientas original de Google.

Este modelo resuelve el problema de conectar instrucciones de usuario con ejecutables en dispositivos móviles, permitiendo que asistentes o agentes puedan invocar APIs del sistema de forma fiable. Su relevancia radica en su tamaño reducido, que lo hace apto para despliegue en dispositivos con recursos limitados, y en su enfoque específico en function calling, una capacidad crítica para aplicaciones de automatización y asistentes personales. Aunque no se publican benchmarks oficiales, su diseño y entrenamiento lo posicionan como una opción práctica para entornos de producción donde se requiera baja latencia y bajo consumo de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3) |
| Parametros totales | 268.098.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (safetensors) |
| Idiomas soportados | Ingles |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/functiongemma-270m-it, un modelo de 270M parámetros entrenado por Google específicamente para function calling. La arquitectura subyacente es un transformer decoder-only basado en Gemma 3, optimizado para generar llamadas a funciones estructuradas a partir de prompts de usuario. El fine-tuning realizado por UGrowAI utiliza el dataset extendido de Mobile Actions (AliRGHZ/Mobile-Actions), que incluye un conjunto más amplio de herramientas y acciones móviles que el dataset original de Google.

El entrenamiento se llevó a cabo durante 2 épocas con un batch size de 4 por dispositivo, gradientes acumulados en 8 pasos, una tasa de aprendizaje de 1e-5 con scheduler coseno y optimizador AdamW (fused). Se usó precisión bfloat16, gradient checkpointing y una pérdida de solo completación (completion only loss), que entrena únicamente sobre las salidas del modelo, no sobre los prompts. El hardware fue una GPU A100 de Google Colab, con un tiempo total de entrenamiento de aproximadamente 24 minutos. Las versiones de librerías utilizadas incluyen transformers 5.2.0, torch 2.10.0, trl 0.29.0 y accelerate 1.13.0.

## Capacidades

- Function calling especializado: traduce peticiones en lenguaje natural a llamadas a funciones con parámetros estructurados (JSON schema).
- Acciones móviles: soporta herramientas como envío de email, llamadas telefónicas, envío de SMS, entre otras definidas en el dataset extendido.
- Generación de salidas en formato JSON: produce respuestas que siguen el esquema de la función solicitada, facilitando su parseo e integración.
- Entrenamiento específico para completación: optimizado para generar solo la parte de la respuesta correspondiente a la llamada de función, reduciendo ruido en la salida.
- Multilingüe: no, solo inglés (según la model card).
- No incluye capacidades de razonamiento general, generación de código libre ni visión.

## Casos de uso

- Asistentes de voz en dispositivos móviles: el modelo puede interpretar comandos como "envía un correo a Juan con asunto 'reunión'" y generar la llamada a la función `send_email` con los parámetros correctos, permitiendo una integración directa con el sistema operativo.
- Automatización de tareas de mensajería: en aplicaciones de productividad, puede gestionar el envío de SMS o la creación de borradores de correo a partir de instrucciones habladas o escritas, reduciendo la interacción manual.
- Agentes de soporte en apps de banca o comercio: para ejecutar acciones como realizar una llamada a soporte o enviar un mensaje de confirmación, el modelo puede generar la llamada de función adecuada sin necesidad de lógica adicional.
- Pruebas de integración de APIs móviles: los desarrolladores pueden usar el modelo para generar llamadas de función de prueba a partir de descripciones en lenguaje natural, acelerando el desarrollo de conectores.
- Prototipos de asistentes personales en entornos embebidos: gracias a su tamaño reducido, puede ejecutarse en dispositivos con poca memoria (Raspberry Pi, smartphones de gama baja) para ofrecer control por voz de funciones básicas.
- Automatización de flujos de trabajo en apps de mensajería: por ejemplo, en un bot de Telegram o WhatsApp, el modelo puede convertir mensajes de usuario en llamadas a funciones internas (enviar email, hacer una llamada) sin necesidad de un LLM grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo específico. Se recomienda evaluar su rendimiento en tareas de function calling con datasets propios o con el dataset Mobile Actions original.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 270M parámetros en bf16, el peso ocupa aproximadamente 540 MB. Con overhead de activaciones y memoria intermedia, se estima un consumo de VRAM entre 1 y 2 GB para inferencia en GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, o incluso GPUs integradas modernas. En Google Colab (GPU T4) funciona sin problemas.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja y media. También puede ejecutarse en CPU con razonable latencia (del orden de cientos de milisegundos por generación).
- Opciones de despliegue: se puede servir con vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo pequeño, también es viable usar directamente la librería transformers. Para despliegue en dispositivos móviles, se puede convertir a formato LiteRT (TFLite) siguiendo las guías de Google.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño, se espera una latencia de generación de menos de 100 ms en GPU y de 200-500 ms en CPU para secuencias cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| UGrowAI/FunctionGemma-270M-it-Mobile-Actions-Extended | 268M | no disponible | Function calling para acciones moviles (dataset extendido) | Gemma |
| google/functiongemma-270m-it | 270M | no disponible | Function calling general | Gemma |
| litert-community/FunctionGemma_270M_Mobile_Actions | 270M | no disponible | Function calling para acciones moviles (dataset original de Google) | Gemma |

La principal diferencia entre el modelo de UGrowAI y el de litert-community es el dataset de entrenamiento: el primero usa una versión extendida (AliRGHZ/Mobile-Actions) que incluye más herramientas y casos, mientras que el segundo usa el dataset original de Google. El modelo base de Google es más generalista en function calling, pero no está optimizado específicamente para acciones móviles.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con datos en inglés y centrado en acciones móviles, puede tener un rendimiento deficiente en otros idiomas o en dominios fuera de las herramientas definidas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar llamadas a funciones con parámetros incorrectos o inventar funciones que no existen en el conjunto de herramientas. Se recomienda validar las salidas con un esquema estricto.
- Limitaciones de contexto: no se ha especificado la longitud máxima de contexto; al ser un modelo pequeño, es probable que tenga una ventana limitada (posiblemente 8192 tokens, pero no confirmado). Para prompts largos, puede degradarse.
- Restricciones de licencia: la licencia Gemma impone términos de uso específicos, incluyendo restricciones sobre el uso comercial y la redistribución. Es obligatorio revisar los términos completos en ai.google.dev/gemma/terms antes de su uso en producción.
- Dependencia del dataset: el fine-tuning se realizó sobre un dataset específico; si se usa fuera de ese dominio, el rendimiento puede caer drásticamente.
- Sin soporte para tareas generales: no es adecuado para generación de texto libre, razonamiento complejo o tareas de código no relacionadas con function calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UGrowAI/FunctionGemma-270M-it-Mobile-Actions-Extended
- Modelo base de Google: https://huggingface.co/google/functiongemma-270m-it
- Fine-tuning de Google sobre Mobile Actions (litert-community): https://huggingface.co/litert-community/FunctionGemma_270M_Mobile_Actions
- Dataset extendido de Mobile Actions (AliRGHZ): https://huggingface.co/datasets/AliRGHZ/Mobile-Actions
- Guia de Google para fine-tuning de FunctionGemma: https://ai.google.dev/gemma/docs/mobile-actions
- Notebook de Colab para fine-tuning: https://colab.research.google.com/github/google-gemini/gemma-cookbook/blob/main/FunctionGemma/%5BFunctionGemma%5DFinetune_FunctionGemma_270M_for_Mobile_Actions_with_Hugging_Face.ipynb
- Documentacion de FunctionGemma (Google AI): https://ai.google.dev/gemma/docs/functiongemma/full-function-calling-sequence-with-functiongemma
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
