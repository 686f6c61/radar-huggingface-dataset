# Xylolabs/clairic-flash-GGUF

## Resumen

Clairic Flash GGUF es la versión cuantizada en formato GGUF de Cloudflare/clairic-flash, un modelo multimodal de 9B parámetros desarrollado originalmente por Cloudflare como fine-tune de Qwen3.5-9B para extracción estructurada de información. Xylolabs se encarga de la conversión y cuantización a GGUF para su uso con llama.cpp en CUDA, Metal o CPU, incluyendo el proyector visual en BF16 para entrada de imágenes. El modelo resuelve el problema de convertir un estado (texto e imágenes) y un esquema de campos tipados en respuestas estructuradas, con estimación numérica y forecasting.

La arquitectura combina 24 capas de atención lineal Gated DeltaNet con 8 capas de atención completa, sumando 8,95B parámetros en el modelo de lenguaje y 0,46B en el codificador visual. El contexto nativo alcanza 262.144 tokens, con un vocabulario de 248.320 entradas y hidden size de 4.096. La relevancia actual radica en que permite ejecutar un modelo de extracción estructurada multimodal de casi 9B en hardware de consumo mediante cuantización Q4_K_M (5,69 GB), manteniendo un 93,46% de coincidencia top-1 respecto a la referencia f32.

Esta ficha cubre específicamente los archivos GGUF producidos por Xylolabs, no el modelo original de Cloudflare. La cabeza de extracción tipada de Cloudflare (`clair_head.safetensors`) y su runtime Python no están incluidos en estos archivos, por lo que el uso se limita al modelo de lenguaje y al codificador visual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas Gated DeltaNet (atención lineal) + 8 capas de atención completa |
| Parámetros totales | 8.953.803.264 (8,95B en LM + 0,46B en codificador visual) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Q8_0, Q4_K_M |
| Idiomas soportados | no disponible (la model card menciona inglés y coreano en el conjunto de calibración) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), proyector visual en BF16 GGUF |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B con arquitectura híbrida: 32 capas totales, de las cuales 24 son capas de atención lineal Gated DeltaNet y 8 son capas de atención completa. Emplea 16 cabezas de query y 4 cabezas de KV con dimensión 256, hidden size de 4.096 y vocabulario de 248.320 tokens. El bloque de multi-token-prediction del checkpoint original se omite en la conversión a GGUF porque la configuración de Cloudflare lo desactiva. El codificador visual añade 0,46B parámetros y se distribuye como archivo `mmproj` separado en BF16.

La cuantización se realizó con `llama-quantize` usando una importance matrix generada con `llama-imatrix` sobre 600 chunks de 4.096 tokens, compuestos por databricks-dolly-15k (inglés), KoAlpaca-v1.1a (coreano), python_code_instructions_18k_alpaca (código), gsm8k (matemáticas), MasterControlAIML/JSON-Unstructured-Structured (JSON guiado por esquema) y paraloq/json_data_extraction (prompts de extracción de campos). La proyección beta/alpha de Gated DeltaNet se mantiene en F16 y las normas, `ssm_a`, `ssm_dt` y kernels conv1d en F32. No se dispone de información sobre el proceso de entrenamiento original (número de tokens, RLHF/DPO) más allá de lo indicado en la model card de Cloudflare.

## Capacidades

- Generación de texto y razonamiento sobre entradas de texto e imagen.
- Extracción estructurada de campos tipados a partir de un esquema proporcionado.
- Estimación numérica y forecasting dentro de la respuesta estructurada.
- Salida JSON guiada por esquema mediante `response_format` con `json_schema` en llama-server o `--json-schema` en llama-cli (llama.cpp lo convierte en gramática).
- Procesamiento de imágenes a través del proyector visual `mmproj-clairic-flash-BF16.gguf`.
- Modo thinking configurable (se recomienda desactivado, como hace el runtime de Cloudflare).
- Soporte multilingüe parcial (inglés y coreano presentes en el conjunto de calibración).
- Informe de truncación de entrada y uso de tokens en la respuesta (según la descripción de Cloudflare).
- Compatible con endpoints y con la plantilla de chat Jinja (`--jinja`).

## Casos de uso

- Extracción de campos desde documentos escaneados: el modelo recibe una imagen y un esquema de campos tipados y devuelve JSON estructurado, adecuado para digitalización de facturas, formularios o contratos con contexto de hasta 262.144 tokens.
- Procesamiento de JSON no estructurado: dado un texto libre y un esquema, genera el JSON correspondiente mediante gramática forzada, útil en pipelines ETL que necesitan salida validable.
- Forecasting y estimación numérica: a partir de un estado descrito en texto o imagen y un esquema de campos numéricos, produce valores estimados con información de scoring por campo.
- Asistente de atención al cliente con entrada multimodal: gestiona conversaciones multi-turno con imágenes adjuntas (capturas, fotos de producto) gracias a la ventana de contexto extendida.
- Análisis de código y matemáticas: los conjuntos de calibración incluyen código Python y GSM8K, por lo que el modelo mantiene competencia en estas áreas tras la cuantización.
- Despliegue en local con llama.cpp: al caber en 5,69 GB en Q4_K_M, permite ejecutar extracción estructurada en estaciones de trabajo sin GPU dedicada o en GPU de consumo.
- Integración en pipelines de CI/CD: la salida JSON guiada por esquema facilita la validación automática de respuestas en flujos de automatización.

## Benchmarks y rendimiento

| Cuantización | Tamaño | PPL | KL medio vs referencia f32 | Top-1 igual vs referencia f32 |
|---|---|---|---|---|
| Q8_0 | 9,53 GB | 6,0278 | 0,0072 | 97,94% |
| Q4_K_M | 5,69 GB | 5,9742 | 0,0468 | 93,46% |

Metodología: referencia en transformers con cómputo f32 sobre pesos BF16 de Cloudflare (PPL 6,0590). KL, top-1 y PPL medidos sobre 12 chunks de 4.096 tokens, evaluando las posiciones 2.048 a 4.095 de cada uno (24.564 tokens): 9 chunks de chat en inglés, coreano, código, matemáticas, extracción JSON desde esquema y prompts de extracción de campos de Clairic, más 3 chunks de wikitext-2.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6 GB para Q4_K_M y 10 GB para Q8_0, más el proyector visual BF16 (~0,9 GB).
- GPU recomendadas: A100, H100 para despliegues de producción; RTX 4090 para inferencia local de alta velocidad.
- Cabe en GPU de consumo: sí, Q4_K_M en GPUs con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070); Q8_0 requiere 12 GB o más.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), con soporte CUDA, Metal y CPU. Compatible con endpoints.
- Comando de referencia: `llama-server -m clairic-flash-Q4_K_M.gguf --mmproj mmproj-clairic-flash-BF16.gguf --jinja -ngl 99 -c 32768 --chat-template-kwargs '{"enable_thinking":false}'`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Clairic Flash GGUF (este) | 8,95B + 0,46B visión | 262.144 | Apache-2.0 | GGUF | Fine-tune de Qwen3.5-9B para extracción estructurada |
| Cloudflare/clairic-flash | 8,95B + 0,46B visión | 262.144 | Apache-2.0 | safetensors | Modelo original con cabeza de extracción tipada y runtime Python |
| Qwen/Qwen3.5-9B | no disponible | no disponible | no disponible | safetensors | Modelo base del que deriva Clairic Flash |
| Cloudflare/clairic | no disponible | no disponible | Apache-2.0 | no disponible | Otro modelo de la familia Clairic, según la model card |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La cabeza de extracción tipada (`clair_head.safetensors`) y el runtime Python de Cloudflare no están incluidos; estos archivos solo contienen el modelo de lenguaje y el codificador visual.
- El bloque de multi-token-prediction se omite en la conversión, por lo que el comportamiento puede diferir del checkpoint original en ese aspecto.
- No se han publicado datos sobre sesgos del modelo.
- Riesgo de alucinación inherente a modelos generativos; la salida guiada por esquema mitiga pero no elimina errores de contenido.
- Idiomas soportados no documentados oficialmente; la calibración cubre inglés y coreano, pero no hay garantías para otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero Xylolabs no está afiliado ni respaldado por Cloudflare.
- El uso recomendado es con thinking desactivado, siguiendo el comportamiento del runtime original.
- No se dispone de información sobre latencia, throughput ni requisitos exactos de VRAM más allá de los tamaños de archivo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/clairic-flash-GGUF
- Modelo base original: https://huggingface.co/Cloudflare/clairic-flash
- Otro modelo de la familia: https://huggingface.co/Cloudflare/clairic
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/clairic-flash-GGUF/blob/main/LICENSE
