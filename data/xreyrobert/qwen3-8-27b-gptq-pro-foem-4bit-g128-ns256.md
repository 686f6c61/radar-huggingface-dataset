# XReyRobert/Qwen3.8-27B-GPTQ-Pro-FOEM-4bit-g128-ns256

## Resumen

El modelo `XReyRobert/Qwen3.8-27B-GPTQ-Pro-FOEM-4bit-g128-ns256` es una cuantización GPTQ-Pro FOEM de 4 bits del modelo base `Qwen/Qwen3.8-27B`, desarrollada por XReyRobert. Su objetivo es permitir la inferencia eficiente en una única GPU de consumo (validado en una RTX 3090 de 24 GB) manteniendo la mayor parte de la calidad del modelo original, que es un transformer denso de 27.781 millones de parámetros con capacidades multimodales (visión y texto), razonamiento configurable y una ventana de contexto nativa de 262.144 tokens.

La cuantización utiliza una receta avanzada que preserva en precisión original los tensores más sensibles (embeddings, proyección de salida, encoder de visión, MTP y normalizaciones) y aplica GPTQ-Pro con activación ponderada por MSE, group size 128 y calibración sobre 256 muestras de código y razonamiento. El resultado es un checkpoint de aproximadamente 19,6 GB que se sirve con vLLM mediante el backend GPTQ-Marlin, alcanzando un contexto práctico de 110.592 tokens en texto puro sobre una RTX 3090. Es una opción relevante para desarrolladores que necesitan desplegar un modelo de 27B con visión y razonamiento en hardware accesible, sin renunciar a una ventana de contexto amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de visión, MTP y normalizaciones (basado en Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Nativa: 262.144 tokens; validada en esta cuantizacion: 110.592 tokens (texto, RTX 3090) |
| Tipos de cuantizacion | GPTQ-Pro FOEM W4A16 (4 bits, group size 128, simetrico, desc_act desactivado); variante con embeddings y lm_head en INT8 disponible |
| Idiomas soportados | No disponibles (el modelo base Qwen3.8-27B es multilingue, pero no se detallan idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (packing GPTQ INT32) |

## Arquitectura y entrenamiento

Este checkpoint no es un modelo entrenado desde cero, sino una cuantizacion del modelo base `Qwen/Qwen3.8-27B`. El modelo original es un transformer denso de 27B parametros con encoder de vision, prediccion multi-token (MTP) y soporte para razonamiento en modo thinking. La cuantizacion aplica GPTQ-Pro con FOEM (activation-weighted MSE, act-group-aware quantization, FOEM alpha=0.25 y beta=0.2) sobre el cuerpo del transformer, con un fallback RTN del 0.5% y suavizado MSE. Se preservan 15 tensores en su precision original: token embeddings, lm_head, tensores del encoder de vision, tensores MTP y normalizaciones. La calibracion se realizo con 256 muestras de secuencias de 2048 tokens, mezclando codigo y razonamiento en formato JSONL, usando GPTQModel 6.1.0-dev. No se aplico entrenamiento adicional ni RLHF; el checkpoint hereda las capacidades y limitaciones del modelo base.

## Capacidades

- Generacion de texto y razonamiento multi-paso, incluyendo modo thinking configurable (temperatura 1.0, top_p 0.95, top_k 20 por defecto).
- Comprension y generacion de codigo, con soporte para tool calling (parser `qwen3_coder`) y auto-seleccion de herramientas.
- Capacidades multimodales: entrada de imagen y video gracias al encoder de vision preservado (requiere retirar `--language-model-only` en vLLM).
- Razonamiento agente de largo horizonte, adecuado para tareas complejas con multiples pasos.
- Prediccion multi-token (MTP) para acelerar la decodificacion especulativa (los pesos MTP estan presentes, aunque requieren perfil de memoria separado).
- Soporte multilingue heredado del modelo base (no se especifican idiomas concretos en la informacion disponible).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 110K tokens en una RTX 3090) y mantener el historial completo de la interaccion, gracias a su ventana de contexto amplia y al soporte de prefix caching en vLLM.
- Generacion de codigo en produccion: con tool calling y parser `qwen3_coder`, puede integrarse en pipelines de CI/CD para autocompletar, revisar o refactorizar codigo, o generar tests automaticamente.
- Analisis de documentos con imagenes: al conservar el encoder de vision, puede procesar capturas de pantalla, diagramas o graficos dentro de documentos, combinando comprension visual y textual en un unico modelo.
- Agentes autonomos para tareas de investigacion: su capacidad de razonamiento multi-paso y soporte de herramientas lo hacen util para agentes que navegan por la web, consultan APIs o ejecutan scripts, con una ventana de contexto suficiente para mantener el estado de la tarea.
- Asistente de programacion con razonamiento: puede explicar algoritmos, depurar errores o proponer soluciones con justificacion detallada, aprovechando el modo thinking.
- Procesamiento de documentos largos: con 110K tokens de contexto en una GPU de 24 GB, puede resumir o extraer informacion de libros, informes o codigo fuente extenso en una sola pasada.
- Despliegue en entornos con recursos limitados: al caber en una RTX 3090, es viable para estaciones de trabajo o servidores de inferencia de bajo coste, sin necesidad de multiples GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados para esta cuantizacion especifica. La model card indica explicitamente que no reporta benchmarks de calidad. Sin embargo, la busqueda web proporciona datos del modelo base `Qwen3.8-27B` en su version BF16, que se incluyen a continuacion como referencia orientativa (la cuantizacion puede degradar ligeramente estos valores):

| Benchmark | Resultado (modelo base BF16) |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos datos provienen de fuentes externas y no han sido verificados de forma independiente para esta cuantizacion.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados ocupan aproximadamente 18.22 GiB (19.559.449.368 bytes). Con KV cache FP8 y contexto de 110.592 tokens, se valido en una RTX 3090 de 24 GB con `gpu-memory-utilization 0.95`.
- GPU recomendadas: RTX 3090 24 GB (validada), RTX 4090, A100 40/80 GB, o GPUs AMD con soporte vLLM (AMD Ryzen AI Max+ 395 alcanza 24.5 tokens/s; Radeon AI PRO R9700 alcanza 51.8 tokens/s, segun pruebas de AMD).
- Cabe en GPUs de consumo de 24 GB o superiores; para contextos mas largos (210K texto) se recomienda la variante con embeddings y lm_head en INT8, tambien validada en RTX 3090.
- Opciones de despliegue: vLLM (validado con `--quantization gptq_marlin`, `--kv-cache-dtype fp8_e5m2`, `--enable-prefix-caching`, `--reasoning-parser qwen3`, `--tool-call-parser qwen3_coder`). Tambien puede usarse con TGI o llama.cpp, aunque no se ha documentado en la informacion disponible.
- Latencia y throughput: no se proporcionan mediciones directas para esta cuantizacion; las cifras de AMD corresponden al modelo base en hardware especifico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27.78 B | 262.144 | Apache-2.0 | safetensors | Modelo base, mayor calidad pero requiere ~56 GB en FP16 |
| Esta cuantizacion GPTQ-Pro FOEM 4-bit | 27.78 B | 262.144 nativo (110K validado en 24 GB) | Apache-2.0 | safetensors (GPTQ INT32) | Optimizada para una sola GPU de 24 GB |
| Variante INT8 Head/Embeddings | 27.78 B | 210K validado en 24 GB | Apache-2.0 | safetensors | Requiere parche vLLM especifico, contexto mas largo |

No se dispone de comparaciones directas con otras cuantizaciones del mismo modelo (p. ej., AWQ o GPTQ estandar) en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede reducir la calidad del modelo en tareas complejas respecto al BF16 original, especialmente en razonamiento numerico o generacion de codigo largo.
- El uso de KV cache FP8 introduce perdida numerica adicional, independiente de la cuantizacion de pesos.
- La longitud de contexto nativa (262.144 tokens) no garantiza que una configuracion de despliegue concreta quepa en VRAM; el limite practico depende de la GPU, la precision del KV cache, la concurrencia y las caracteristicas habilitadas (vision, MTP).
- Las rutas de vision y MTP estan presentes pero requieren perfiles de memoria separados y no han sido validadas en la configuracion estandar de 110K tokens; habilitarlas reduce el contexto maximo.
- El checkpoint hereda los riesgos del modelo base: posibles sesgos en los datos de entrenamiento, riesgo de alucinacion en generacion de texto y codigo, y limitaciones en idiomas poco representados.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen3.8-27B para confirmar restricciones adicionales.
- No se han publicado benchmarks de calidad especificos para esta cuantizacion; los resultados pueden variar respecto al modelo base.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/XReyRobert/Qwen3.8-27B-GPTQ-Pro-FOEM-4bit-g128-ns256
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante con embeddings y lm_head en INT8: https://huggingface.co/XReyRobert/Qwen3.8-27B-GPTQ-Pro-FOEM-4bit-g128-ns256-INT8-Head-Embeddings
- Ficha de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Blog de AMD sobre ejecucion de Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guia de especificaciones y requisitos (YottaLabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Guia completa de Qwen3.8-27B (Lovableapp): https://lovableapp.org/blog/qwen3-8-27b
- Documentacion de GPTQ-Pro para Qwen3.8: https://github.com/groxaxo/GPTQ-Pro/blob/main/docs/QWEN38.md
