# Virtudant-AI/Ministral-3-14B-Instruct-2512

## Resumen

Ministral 3 14B Instruct 2512 es el modelo de mayor tamano de la familia Ministral 3 de Mistral AI, disenado especificamente para despliegue en el borde (edge deployment) manteniendo capacidades cercanas a modelos de mayor escala como Mistral Small 3.2 24B. Se trata de un modelo multimodal que combina un modelo de lenguaje de 13.5B parametros con un codificador visual de 0.4B parametros, alcanzando un total de aproximadamente 14B parametros. El repositorio analizado (Virtudant-AI/Ministral-3-14B-Instruct-2512) es una publicacion derivada del modelo oficial de Mistral AI, empaquetada para su uso con vLLM.

La relevancia de este modelo radica en su ventana de contexto de 256k tokens, su soporte nativo de function calling y salida JSON, y su capacidad para ejecutarse en una sola GPU consumer de 24 GB de VRAM en formato FP8. Todo ello bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Estas caracteristicas lo posicionan como una opcion atractiva para despliegues privados y agentes locales donde la confidencialidad y el coste de infraestructura son criticos.

La familia Ministral 3 se publica en tres tamanos (3B, 8B y 14B) y tres variantes por tamano (Base, Instruct y Reasoning). Este repositorio concreto corresponde a la variante Instruct del modelo de 14B, en fecha de creacion de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (13.5B LM + 0.4B vision encoder) |
| Parametros totales | ~14B (13.5B lenguaje + 0.4B vision) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | FP8 (formato oficial), GGUF (via Unsloth), 4-bit (via Unsloth) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 19.5 GB), GGUF y FP8 en colecciones alternativas |

## Arquitectura y entrenamiento

Ministral 3 14B emplea una arquitectura transformer multimodal compuesta por dos modulos: un modelo de lenguaje de 13.5B parametros y un codificador visual de 0.4B parametros. Esta disenado para despliegue en el borde, lo que implica optimizaciones de eficiencia que permiten su ejecucion en hardware de gama consumer. El modelo base sobre el que se construye esta publicacion es mistralai/Ministral-3-14B-Instruct-2512, entrenado por Mistral AI y post-entrenado para seguir instrucciones.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras tecnicas de alineacion. La model card del repositorio derivado es una adaptacion del material de Unsloth orientado a fine-tuning y cuantizacion, e incluye referencias a cuadernos de Colab para fine-tuning y entrenamiento con RL (GSPO/GRPO), lo que sugiere que el modelo es apto para especializacion posterior. La publicacion original de Mistral AI corresponde a la variante Instruct en formato FP8.

## Capacidades

- Generacion de texto y razonamiento general en once idiomas declarados.
- Vision: analisis de imagenes y generacion de respuestas basadas en contenido visual, ademas de texto.
- Function calling nativo y salida en formato JSON, orientado a integracion con herramientas externas.
- Capacidades agenticas de multiples pasos, con enfasis en uso local y entornos con recursos limitados.
- Adherencia fuerte a system prompts.
- Soporte de contexto largo de hasta 256k tokens para conversaciones y documentos extensos.
- Apto para fine-tuning y especializacion (se documentan flujos con Unsloth y RL con GSPO/GRPO).

## Casos de uso

- Asistentes privados en entornos con recursos limitados: el modelo cabe en 24 GB de VRAM en FP8, lo que permite desplegar un asistente conversacional completo en una unica GPU consumer sin enviar datos a la nube.
- Atencion al cliente automatizada: la ventana de 256k tokens permite mantener conversaciones multi-turno con historial extenso y documentacion de producto adjunta, manteniendo coherencia a lo largo de sesiones largas.
- Agentes locales con function calling: su soporte nativo de JSON y tool calling lo hace adecuado para orquestar APIs internas, consultas a bases de datos o automatizacion de tareas en entornos de empresa sin exposicion externa.
- Analisis de documentos e imagenes: la combinacion de vision y contexto largo permite procesar facturas, informes escaneados o capturas de pantalla junto con texto de referencia en una sola llamada.
- Fine-tuning especializado: al estar disponible en formato Unsloth con cuadernos de Colab, equipos pequenos pueden adaptar el modelo a dominios verticales (legal, medico, soporte tecnico) con presupuestos reducidos.
- Generacion de codigo y asistencia en IDE: aunque no se detallan benchmarks de codigo en la informacion disponible, el soporte de contexto largo y function calling permite integrarlo en pipelines de revision o generacion asistida dentro de entornos controlados.
- Despliegue en el borde para industria o retail: su naturaleza edge-optimized permite ejecutarlo en estaciones de trabajo con GPU consumer para tareas de vision y clasificacion en tiempo real.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de la familia Ministral 3 frente a modelos de tamano similar. Los datos disponibles para Ministral 3 14B son los siguientes:

| Benchmark | Ministral 3 14B |
|---|---|
| AIME25 | 0.850 |
| AIME24 | 0.898 |
| GPQA Diamond | 0.712 |
| LiveCodeBench | 0.646 |

La tabla original incluye una comparacion con Qwen3-1, pero el contenido proporcionado esta truncado y no permite presentar los valores completos del modelo comparado. No se dispone de resultados adicionales (MMLU, HumanEval, GSM8K) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14 GB en FP8 para los pesos del modelo, con overhead adicional para KV cache. La model card indica que cabe en 24 GB de VRAM en FP8.
- Cuantizaciones mas agresivas: las versiones GGUF y 4-bit de Unsloth reducen el requisito por debajo de los 24 GB, permitiendo su ejecucion en GPUs consumer de gama media-alta.
- GPUs recomendadas: A100 o H100 para despliegues de produccion con contexto largo; RTX 4090 (24 GB) para FP8 en local; RTX 3090 o GPUs con 16-24 GB para cuantizaciones 4-bit/GGUF.
- Despliegue: el repositorio esta etiquetado con `vllm` como libreria de inferencia. Tambien se ofrecen variantes GGUF para llama.cpp y Ollama a traves de la coleccion de Unsloth.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 14B Instruct 2512 | ~14B (13.5B + 0.4B) | 256k | Si | Apache 2.0 | Hugging Face (oficial y derivados) |
| Mistral Small 3.2 24B | 24B | no disponible | Si | no disponible | Hugging Face |
| Qwen3 (variante comparada en model card) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La model card compara explicitamente Ministral 3 14B con Mistral Small 3.2 24B, indicando un rendimiento comparable pese a tener menos parametros. Los datos completos de la comparacion con Qwen3 estan truncados en la informacion disponible.

## Limitaciones y advertencias

- El repositorio analizado es una publicacion derivada (Virtudant-AI) del modelo oficial de Mistral AI; para produccion se recomienda verificar la procedencia y considerar el repositorio oficial.
- No se dispone de informacion sobre sesgos especificos, datos de entrenamiento ni evaluaciones de seguridad en la informacion proporcionada.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- Aunque declara soporte de once idiomas, el rendimiento relativo por idioma no esta cuantificado; el espanol esta incluido pero sin datos de evaluacion.
- La ventana de 256k tokens requiere memoria considerable para KV cache; en GPUs de 24 GB el contexto efectivo sera menor que el maximo declarado.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo derivado debe cumplir las condiciones de la licencia del modelo base.
- El modelo esta etiquetado con `inference: false` en la model card, lo que puede indicar que el repositorio no esta configurado para inferencia directa via la API de Hugging Face.

## Enlaces

- Repositorio analizado: https://huggingface.co/Virtudant-AI/Ministral-3-14B-Instruct-2512
- Modelo base oficial: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- Coleccion Ministral 3 de Unsloth: https://huggingface.co/collections/unsloth/ministral-3
- Guia de Unsloth para Ministral 3: https://docs.unsloth.ai/new/ministral-3
- Benchmarks de cuantizacion Unsloth Dynamic 2.0: https://docs.unsloth.ai/basics/unsloth-dynamic-v2.0-gguf
- Repositorio Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Cuadernos de Unsloth: https://docs.unsloth.ai/get-started/unsloth-notebooks
- Mistral Small 3.2 24B: https://huggingface.co/mistralai/Mistral-Small-3.2-Instruct-2506
- Coleccion Ministral 3 (formatos adicionales): https://huggingface.co/collections/mistralai/ministral-3-more
