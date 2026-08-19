# Zek-Takai/gemma-4-26B-A4B-it-NVFP4-fp8global

## Resumen

Este modelo es una cuantización NVFP4 del modelo Google Gemma 4 26B A4B instruct, desarrollada por el usuario Zek-Takai. Su objetivo principal es reducir el consumo de memoria y acelerar la inferencia en hardware Blackwell, manteniendo la calidad del modelo original. La particularidad más destacada es que se ha cuantizado también la cabeza de salida (lm_head), algo poco habitual, lo que permite cargarlo en vLLM estándar sin necesidad de parches de código. El modelo base es un MoE (Mixture of Experts) con 26B parámetros totales y 4B activos por token, con una ventana de contexto nativa de 262.144 tokens. Esta versión cuantizada reduce los pesos a 4 bits (NVFP4) y utiliza caché KV en FP8, logrando un aumento de velocidad de entre +35% y +42% respecto a una versión con cabeza BF16, según las mediciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con transformer, basado en Google Gemma 4 |
| Parametros totales | 14.424.970.830 (según safetensors; el modelo base se denomina 26B) |
| Parametros activos | 4B (según denominación del modelo base) |
| Longitud de contexto | 262.144 tokens (config del modelo base; este repo limita a 252.000) |
| Tipos de cuantizacion | NVFP4 (pesos) y FP8 (KV cache), con lm_head cuantizado |
| Idiomas soportados | no disponible |
| Licencia | Gemma (sujeta a los Términos de Uso de Gemma) |
| Formato de pesos | safetensors (cuantizados) |

## Arquitectura y entrenamiento

El modelo es una cuantización del modelo Google Gemma 4 26B A4B instruct, que emplea una arquitectura transformer con capas MoE (26B parámetros totales, 4B activos por token). La cuantización aplica NVFP4 (floating point de 4 bits) a todos los pesos, incluido el lm_head, y FP8 para la caché KV. El autor ha utilizado técnicas de calibración específicas (la receta no se ha publicado) para minimizar la pérdida de calidad. El resultado es un modelo que se carga y sirve en vLLM estándar sin parches, algo que no es posible con otras cuantizaciones de ModelOpt que mantienen el lm_head en BF16. El modelo base fue entrenado por Google con datos propietarios, pero no se proporcionan detalles del entrenamiento original en esta ficha.

## Capacidades

- Generación de texto conversacional y de instrucciones.
- Tool calling / function calling: 8/8 decisiones correctas en pruebas, con argumentos byte-idénticos al modelo base.
- Soporte para agentes y razonamiento multi-paso.
- Modo "thinking" (enable_thinking) que genera tokens de razonamiento adicionales antes de la respuesta.
- Ventana de contexto larga: hasta 262k tokens (configurada a 252k en este repo).
- Compatible con el drafter MTP oficial para decodificación especulativa (88% de aceptación).
- Multilingüe (heredado del modelo base, aunque no se especifica la lista de idiomas).

## Casos de uso

- Agentes conversacionales de larga duración: gracias a su ventana de contexto de 252k tokens y su bajo consumo de memoria, puede mantener sesiones de agente con contexto acumulado de decenas de miles de tokens sin degradación significativa de velocidad (67 tok/s a 22k contexto, 59.7 tok/s a 59k).
- Analisis de documentos extensos: puede procesar documentos de ~20k tokens y realizar analisis cruzados entre varios, con una velocidad de ~64 tok/s a 45k contexto.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar o generar código, con calidad indistinguible del modelo base.
- Asistentes virtuales con memoria persistente: al tener contexto largo, puede recordar interacciones anteriores sin necesidad de resúmenes externos.
- Razonamiento complejo con modo thinking: activando enable_thinking, el modelo genera cadenas de razonamiento antes de responder, util para tareas de matematicas o logica.
- Despliegue en entornos con restricciones de memoria: al ser una cuantizacion NVFP4 con solo 14.4B parametros, cabe en GPUs de consumo medio, permitiendo inferencia local.

## Benchmarks y rendimiento

La model card no incluye benchmarks de calidad estandar (MMLU, HumanEval, GSM8K, etc.), pero si mediciones de rendimiento de inferencia. Se presentan las tablas proporcionadas por el autor:

Tabla 1: Rendimiento en sesion de agente en vivo (vLLM, DGX Spark GB10)

| Contexto residente | Generacion | TTFT | tok/s |
|---|---|---|---|
| 22k frio | 899 | 5.6 s | 67.0 |
| 22k calido | 517 | 0.13 s | 67.2 |
| 50k (15k nuevos) | 709 | 11.3 s | 61.4 |
| 51k calido | 2,052 | 0.14 s | 61.4 |
| 59k | 4,553 | 0.85 s | 59.7 |

Tabla 2: Escalera de contexto (un solo flujo, sin limites)

| Contexto residente | 26 tok | 2.8k | 6.3k | 13k | 26k | 40k | 53k |
|---|---|---|---|---|---|---|---|
| tok/s | 80.5 | 77.4 | 75.8 | 72.5 | 67.7 | 64.3 | 62.7 |

Tabla 3: Comparativa cabeza cuantizada vs BF16 (decodificacion fija de 256 tokens)

| Entrada | 2k | 4k | 8k | 16k | 32k | 65k |
|---|---|---|---|---|---|---|
| Cabeza cuantizada | 74.2 | 73.4 | 71.2 | 68.9 | 63.8 | 59.5 |
| Cabeza BF16 | 52.1 | 51.7 | 50.6 | 49.3 | 46.7 | 44.1 |

La cabeza cuantizada ofrece una mejora de +35-42% en todos los niveles de contexto.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado tiene ~14.4B parametros en NVFP4 (4 bits), lo que supone aproximadamente 7.2 GB de pesos, mas el lm_head y la caché KV. Con la configuracion recomendada (KV cache en fp8 y 26 GB de memoria para caché), el modelo puede requerir alrededor de 30-40 GB de memoria total. En la DGX Spark (GB10) con memoria unificada, se usa `--gpu-memory-utilization 0.411` con 26 GB de KV cache, lo que sugiere que el modelo ocupa ~37 GB de memoria. En GPUs discretas, se necesitaria al menos una GPU con 40 GB (como A100 40GB) o varias. Reduciendo el contexto maximo, podria caber en una RTX 4090 (24 GB) si se limita la caché KV.
- GPUs recomendadas: Blackwell (B200, B100) para aprovechar NVFP4, aunque tambien funciona en Ampere y Hopper. La DGX Spark (GB10) es la plataforma de prueba.
- Opciones de despliegue: vLLM (probado con la version 0.26-series dev), tambien puede funcionar con llama.cpp si se convierte a GGUF, pero no se menciona. Se recomienda vLLM con los flags especificados en la model card.
- Latencia y throughput: TTFT de 0.13-0.14 s en contexto calido, y de 5.6-11.3 s en contexto frio (con prefill de 15-22k tokens). Throughput de 59-80 tok/s dependiendo del contexto, medido en DGX Spark.

## Comparativa con modelos similares

Comparacion con el modelo base y con una version cuantizada con cabeza BF16 (datos de la model card):

| Modelo | Parametros | Cuantizacion | Velocidad (tok/s a 2k ctx) | Contexto |
|---|---|---|---|---|
| Zek-Takai/gemma-4-26B-A4B-it-NVFP4-fp8global | 14.4B (safetensors) | NVFP4 + fp8 KV | 74.2 | 252k |
| Otra build NVFP4 con cabeza BF16 | 14.4B (similar) | NVFP4 + fp8 KV | 52.1 | 252k |
| google/gemma-4-26B-A4B-it (base) | 26B (BF16) | Sin cuantizar | ~30-40 (estimado) | 262k |

No se dispone de datos de otros modelos comparables en la misma categoria.

## Limitaciones y advertencias

- La receta de calibracion no se ha publicado, lo que dificulta reproducir el proceso.
- La cuantizacion NVFP4 puede introducir perdida de precision en tareas muy sensibles, aunque las pruebas del autor muestran que es indistinguible del base en la mayoria de casos.
- La licencia Gemma tiene restricciones de uso comercial (consultar los Terminos de Uso de Gemma).
- El contexto maximo se ha limitado a 252k en la configuracion, aunque el modelo base soporta 262k.
- El rendimiento depende en gran medida del hardware; los datos proporcionados son de una DGX Spark con memoria unificada.
- El lm_head cuantizado puede no ser compatible con todas las herramientas de inferencia; solo se ha probado con vLLM.

## Enlaces

- HuggingFace: https://huggingface.co/Zek-Takai/gemma-4-26B-A4B-it-NVFP4-fp8global
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Patches incluidos en el repositorio (no se proporcionan URLs individuales).
