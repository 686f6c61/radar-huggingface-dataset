# superniker/qwen3.8-27b-g8l4i

## Resumen

El modelo `superniker/qwen3.8-27b-g8l4i` es una versión cuantizada del modelo base Qwen/Qwen3.5-27B, que emplea una arquitectura híbrida GDN (48 capas GDN + 16 capas de self-attention). El autor, superniker, ha aplicado una estrategia de cuantización mixta denominada G8L4i, diseñada específicamente para entornos con poca memoria VRAM en GPUs NVIDIA Turing (sm_75, como la RTX 2080 Ti de 22 GB). El objetivo principal es mantener la capacidad de contexto largo (hasta 256K tokens) mientras se reduce el peso del modelo de aproximadamente 54 GB (FP16) a unos 22 GB.

La cuantización combina capas de 4 bits y 8 bits con una caché KV en int8, lo que permite ejecutar el modelo en una o dos RTX 2080 Ti con un rendimiento de prefill y throughput razonable. El modelo está orientado a tareas de generación de texto en chino e inglés, con soporte para razonamiento lógico, aritmética y recuperación de información en contextos muy largos. Es una opción relevante para desarrolladores que necesitan desplegar modelos de 27B en hardware de gama media sin sacrificar demasiada calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida GDN (48 capas GDN + 16 capas self-attention) |
| Parametros totales | 27B (según modelo base Qwen3.5-27B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 256K tokens (con int8 KV cache) |
| Tipos de cuantizacion | Mixta: 4-bit (group size 128) en GDN in_proj_qkv, in_proj_z y MLP; 8-bit (group size 64/128) en GDN out_proj y self-attention o_proj/MLP; FP16 en self-attention in_proj_qkv, embeddings, norms y conv; int8 KV cache |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | other (no especificada en la model card) |
| Formato de pesos | compressed-tensors (pack-quantized) |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3.5-27B, que combina 48 capas GDN (probablemente una variante de atención lineal o de bajo rango) con 16 capas de self-attention tradicional. Esta mezcla busca equilibrar eficiencia computacional y capacidad de modelado de dependencias largas. El modelo original se entrenó con datos multilingües (chino e inglés), aunque no se proporcionan detalles sobre el volumen de tokens ni el proceso de alineación (RLHF/DPO).

La cuantización se realizó con un enfoque estilo GPTQ por capas, aplicando una estrategia de bits mixtos: las capas GDN, que son más tolerantes a la compresión, se cuantizan a 4 bits, mientras que las rutas críticas de self-attention (proyecciones de salida y MLP) se mantienen en 8 bits. Las proyecciones q/k/v de self-attention se dejan en FP16 por su sensibilidad a la cuantización. Además, se emplea una caché KV en int8 (por tensor) para duplicar la capacidad de contexto sin aumentar la memoria. No se menciona ningún ajuste fino posterior a la cuantización; la model card indica que la calidad se validó mediante pruebas de aritmética, lógica y needle retrieval.

## Capacidades

- Generación de texto en chino e inglés con contexto largo (hasta 256K tokens).
- Razonamiento lógico y aritmético: la model card menciona que supera pruebas de trampas aritméticas y lógicas.
- Recuperación de información en contextos extensos: validado con pruebas de needle retrieval a 128K tokens.
- Soporte de tool calling / function calling: no se menciona explícitamente, pero al estar basado en Qwen3.5 es probable que lo herede; no confirmado.
- Capacidades de agente y razonamiento multi-paso: no especificado en la información disponible.
- Multilingüe limitado a chino e inglés; no se indican otros idiomas.
- Modo de pensamiento (thinking mode): no se menciona.

## Casos de uso

- Procesamiento de documentos largos: con 256K de contexto, el modelo puede resumir o extraer información de libros, informes técnicos o expedientes completos en una sola pasada, sin necesidad de dividir el texto.
- Asistente de programación con contexto de repositorio: al mantener todo el código de un proyecto en la ventana de contexto, puede responder preguntas sobre arquitectura, generar parches o explicar fragmentos, aunque no se confirma soporte de tool calling.
- Análisis de logs y depuración: su capacidad para manejar secuencias largas permite inyectar miles de líneas de log y pedir al modelo que identifique patrones de error o anomalías.
- Chatbot multilingüe (zh/en) para atención al cliente: puede gestionar conversaciones de muchos turnos con historial extenso, gracias a la ventana de 256K y la caché KV int8.
- Investigación académica: útil para revisar literatura científica, comparar secciones de artículos o generar resúmenes de corpus extensos en chino e inglés.
- Generación de contenido editorial: redacción de artículos, guiones o documentación técnica en ambos idiomas, aprovechando el contexto largo para mantener coherencia temática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye métricas de rendimiento de inferencia en hardware específico (RTX 2080 Ti ×2, TP=2, FlashInfer backend):

| Contexto | Prefill (tiempo) | Throughput |
|---|---|---|
| 25K | 20.4 s | 1224 tok/s |
| 128K | 126.1 s | 1016 tok/s |
| 256K | 342.8 s | 744 tok/s |

Además, se indica que el modelo supera pruebas de aritmética, lógica y needle retrieval a 128K, pero sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: ~22 GB para los pesos cuantizados (FP16 original ~54 GB). Con la caché KV int8, se puede ejecutar en una sola RTX 2080 Ti de 22 GB para contextos moderados; para 256K se recomiendan dos RTX 2080 Ti (TP=2).
- GPUs compatibles: NVIDIA Turing (sm_75) como RTX 2080 Ti, RTX 2080, RTX 2070, etc. También debería funcionar en GPUs más modernas (Ampere, Ada) con soporte de vLLM.
- Despliegue: requiere un fork específico de vLLM ([weicj/vLLM-2080Ti-Definitive](https://github.com/weicj/vLLM-2080Ti-Definitive)) que soporte la arquitectura GDN. Se recomienda usar `--attention-backend FLASHINFER` (FlashInfer 0.6.8+ para sm_75) y `--kv-cache-dtype int8_per_tensor`.
- Alternativas: también se puede cargar con Transformers usando `trust_remote_code=True`, aunque el rendimiento óptimo se obtiene con vLLM.
- Latencia y throughput: los datos de la tabla anterior corresponden a prefill y throughput en configuración de doble 2080 Ti; no se proporcionan métricas de generación token a token.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos cuantizados de la misma categoría. El modelo es una cuantización específica de Qwen3.5-27B, y no se han encontrado alternativas comparables en la información proporcionada. Se puede considerar como referencia el modelo base Qwen3.5-27B en FP16, que ocuparía ~54 GB y requeriría GPUs con más VRAM, pero no se dispone de datos de rendimiento para esa variante.

## Limitaciones y advertencias

- Licencia "other" sin especificar: no se detallan los términos de uso, lo que puede suponer un riesgo para despliegues comerciales. Se recomienda contactar al autor o revisar la licencia del modelo base Qwen3.5.
- Solo soporta chino e inglés; no se garantiza calidad en otros idiomas.
- La cuantización mixta puede introducir degradación en tareas muy sensibles a la precisión, aunque el autor afirma haber validado la calidad en pruebas específicas.
- Requiere un fork de vLLM no oficial y una configuración concreta (FlashInfer, int8 KV cache) para alcanzar el rendimiento declarado; usar la versión estándar de vLLM puede no funcionar.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en contextos muy largos donde la atención puede dispersarse.
- No se proporcionan detalles sobre el proceso de entrenamiento del modelo base (datos, alineación), por lo que no se pueden evaluar sesgos potenciales.
- La caché KV en int8 puede reducir la calidad en tareas que requieren precisión numérica alta, aunque el autor indica que las pruebas de needle retrieval fueron exitosas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/superniker/qwen3.8-27b-g8l4i
- Fork de vLLM recomendado: https://github.com/weicj/vLLM-2080Ti-Definitive
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
