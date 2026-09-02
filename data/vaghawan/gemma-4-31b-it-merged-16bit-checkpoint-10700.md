# vaghawan/gemma-4-31b-it-merged-16bit-checkpoint-10700

## Resumen

Este modelo es un checkpoint fusionado en precisión `bfloat16` del modelo base `unsloth/gemma-4-31B-it`, al que se le han integrado adaptadores LoRA entrenados mediante fine-tuning supervisado (SFT) hasta el paso 10700. El autor, `vaghawan`, ha publicado este checkpoint como un modelo completo de tipo `Gemma4ForConditionalGeneration`, lo que permite servirlo directamente con vLLM sin necesidad de cargar adaptadores por separado. El entrenamiento se ha realizado con la librería Unsloth y TRL de HuggingFace, y los datos de validación muestran un interés especial en capacidades de tool calling y en el idioma hausa, además del inglés conversacional.

La relevancia de este modelo radica en que combina la arquitectura multimodal de Gemma 4 (entrada de imagen y texto) con un fine-tuning orientado a tareas de agente y uso de herramientas. Al estar los pesos LoRA fusionados, se simplifica el despliegue en producción, ya que no requiere infraestructura adicional para gestionar adaptadores. Con 31.273 millones de parámetros, se sitúa en la gama alta de modelos que pueden ejecutarse en una GPU de 80 GB, y su licencia `gemma` permite uso comercial bajo los términos de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (transformer multimodal, imagen-texto) |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuracion recomendada en vLLM); hasta 16384 con tensor parallel |
| Tipos de cuantizacion | bfloat16 (checkpoint publicado); no se proporcionan cuantizaciones adicionales |
| Idiomas soportados | ingles, hausa (segun losses de validacion); otros idiomas no disponibles |
| Licencia | gemma (licencia de Google, permite uso comercial con restricciones) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 de Google, que es un transformer multimodal capaz de procesar tanto texto como imagenes. El checkpoint publicado es el resultado de fusionar los adaptadores LoRA (entrenados con SFT) en los pesos del modelo base `unsloth/gemma-4-31B-it`. El proceso de entrenamiento se ha realizado con Unsloth, una libreria optimizada para fine-tuning eficiente, y TRL de HuggingFace. Los datos de validacion del paso 10700 muestran losses separadas para diferentes tareas: `eval_anchor_loss` (0.8038), `eval_english_chat_loss` (1.1019), `eval_hausa_chat_loss` (1.1620) y `eval_tool_loss` (0.2072). La loss de tool calling es notablemente baja, lo que sugiere un entrenamiento especifico y exitoso en esta area. No se proporcionan detalles sobre la composicion del dataset de entrenamiento ni el numero total de tokens utilizados.

## Capacidades

- Generacion de texto conversacional en ingles y hausa, con soporte para dialogos multi-turno.
- Tool calling / function calling: el modelo esta entrenado especificamente para invocar herramientas, con una loss de validacion muy baja (0.2072), lo que indica un rendimiento solido en esta tarea.
- Razonamiento con parser dedicado: vLLM incluye un `--reasoning-parser gemma4`, lo que sugiere soporte para cadenas de razonamiento estructurado.
- Entrada multimodal: al estar basado en Gemma 4, acepta entradas de imagen y texto (pipeline `image-text-to-text`).
- Capacidad de agente: combinando tool calling y razonamiento, puede ejecutar tareas multi-paso.
- Despliegue simplificado: al tener los pesos LoRA fusionados, no requiere `--enable-lora` en vLLM.

## Casos de uso

- Asistentes virtuales multilingues: el modelo puede gestionar conversaciones en ingles y hausa, lo que lo hace util para regiones de Africa occidental donde el hausa es lengua vehicular. Su ventana de 8192 tokens permite mantener contexto en dialogos largos.
- Automatizacion de soporte tecnico con herramientas: gracias a su baja loss en tool calling, puede integrarse en sistemas que necesitan consultar bases de datos, APIs o ejecutar acciones (por ejemplo, abrir tickets, consultar pedidos) dentro de una conversacion.
- Agentes de razonamiento multimodal: al aceptar imagenes, puede analizar capturas de pantalla o diagramas y combinar esa informacion con llamadas a herramientas para resolver problemas complejos (por ejemplo, diagnosticar un error a partir de una imagen de consola).
- Generacion de codigo asistida con ejecucion: el modelo puede redactar codigo y, mediante tool calling, invocar un interprete o compilador para verificar su correccion en un bucle de agente.
- Procesamiento de documentos con extraccion de datos: combinando la entrada de imagen (escaneos, fotos de formularios) con la generacion de texto estructurado, puede extraer informacion y volcarla a un sistema externo via function calling.
- Chatbots de atencion al cliente en entornos empresariales: con la licencia `gemma` y soporte para vLLM, puede desplegarse en produccion con tensor parallel en dos GPUs para alcanzar 16384 tokens de contexto, adecuado para historiales largos de clientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica proporcionada es la loss de validacion en el paso 10700:

| Metrica | Valor |
|---|---|
| eval_all_loss | 0.8131 |
| eval_anchor_loss | 0.8038 |
| eval_english_chat_loss | 1.1019 |
| eval_hausa_chat_loss | 1.1620 |
| eval_tool_loss | 0.2072 |

Estos valores indican un buen ajuste general, con especial solidez en tool calling, pero no son comparables con benchmarks estandar como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada: aproximadamente 62 GB en bfloat16 para los 31.273 millones de parametros.
- GPU recomendadas: una GPU de 80 GB (A100, H100) o dos GPUs con tensor parallel (por ejemplo, 2x A100 40GB o 2x RTX 4090 24GB no son suficientes por VRAM individual, se necesitarian 2x 40GB o superiores).
- No cabe en GPUs de consumo de 24 GB (RTX 3090/4090) en bfloat16; se necesitaria cuantizacion a 8 bits o 4 bits, que no se proporciona en este checkpoint.
- Opciones de despliegue: vLLM (version >= 0.19) con `--dtype bfloat16`, o Transformers con `device_map="auto"`. Tambien es compatible con FriendliAI como servicio de inferencia.
- Latencia y throughput: no disponibles. Con vLLM y tensor parallel de 2, se puede alcanzar una ventana de contexto de 16384 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vaghawan/gemma-4-31b-it-merged-16bit (este) | 31.27B | 8192-16384 | gemma | Fine-tuning con LoRA fusionado, tool calling y hausa |
| unsloth/gemma-4-31B-it (base) | 31.27B | no disponible | gemma | Modelo base sin fine-tuning especifico |
| Gemma 4 27B (si existe) | no disponible | no disponible | gemma | No se dispone de datos comparables |

No se dispone de informacion suficiente sobre modelos comparables de otros fabricantes (como Llama 3.1 30B o Qwen 2.5 32B) para establecer una comparativa fiable con datos reales.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un fine-tuning de Gemma 4, hereda los sesgos del modelo base. No se han realizado evaluaciones especificas de sesgo para este checkpoint.
- Riesgo de alucinacion: la loss de chat en ingles (1.1019) es relativamente alta, lo que podria indicar cierta tendencia a generar respuestas inexactas en conversacion libre.
- Limitaciones de idioma: solo se ha verificado entrenamiento en ingles y hausa. Otros idiomas pueden tener un rendimiento degradado.
- Restricciones de licencia: la licencia `gemma` de Google permite uso comercial, pero con restricciones (prohibido usar para generar contenido malicioso, obligacion de atribucion, etc.). Es recomendable revisar los terminos completos.
- Requisitos de hardware: el modelo en bfloat16 requiere al menos 62 GB de VRAM, lo que limita su despliegue a entornos con GPUs profesionales o multiples GPUs.
- Sin cuantizaciones alternativas: no se proporcionan versiones GGUF, AWQ o GPTQ, lo que dificulta su uso en hardware de consumo o en entornos con memoria limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vaghawan/gemma-4-31b-it-merged-16bit-checkpoint-10700
- Modelo base: https://huggingface.co/unsloth/gemma-4-31B-it
- Pagina de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Servicio de inferencia FriendliAI: https://friendli.ai/models/vaghawan/gemma-4-31b-it-merged-16bit
