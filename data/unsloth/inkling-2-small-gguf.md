# unsloth/Inkling-2-Small-GGUF

## Resumen

Inkling-2-Small es un modelo multimodal de propósito general desarrollado por Thinking Machines que acepta entradas de texto e imagen y genera salidas de texto. Se distribuye en formato NVFP4 como peso original y emplea una arquitectura MoE (mixture of experts) con un total de 593.722.994.688 parámetros, según los datos de safetensors del repositorio. Está orientado a aplicaciones de desarrollo, sistemas agénticos, uso de herramientas y asistencia en programación, con soporte declarado para inglés, otros idiomas y múltiples lenguajes de programación.

El repositorio analizado es una conversión a GGUF realizada por Unsloth, que publica cuantizaciones dinámicas calibradas con imatrix bajo la licencia Apache 2.0. Incluye además el proyector de visión en variantes BF16, F16 y F32, lo que permite inferencia multimodal local con llama.cpp. La conversión conserva los expertos NVFP4 originales de forma bit-exacta en las capas 0-39 y convierte el resto de pesos a BF16 en la variante de referencia.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE multimodal de gran tamaño en hardware local mediante cuantizaciones que van desde 171,7 GB (UD-IQ1_S) hasta 484,4 GB (BF16), con métricas de degradación publicadas (KLD y coincidencia de top-1) frente a la referencia BF16. Requiere una compilación de llama.cpp con soporte para la nueva arquitectura `inkling2`, disponible en el PR upstream #32187.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), arquitectura `inkling2`; multimodal image-text-to-text |
| Parametros totales | 593.722.994.688 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de ejecución con `-c 32768`); máximo no disponible |
| Tipos de cuantizacion | UD-IQ1_S, UD-IQ1_M, UD-IQ2_XXS, UD-Q2_K_XL, UD-IQ3_XXS, UD-Q3_K_XL, UD-Q4_K_XL, UD-Q8_K_XL, BF16 (GGUF); pesos originales NVFP4 y MXFP8 en el repo base |
| Idiomas soportados | inglés y otros idiomas (lista concreta no disponible); múltiples lenguajes de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base); proyector de visión en mmproj BF16/F16/F32 |

## Arquitectura y entrenamiento

Inkling-2-Small es un transformer con arquitectura MoE, identificada en llama.cpp como `inkling2`, distinta de la arquitectura del Inkling original. El modelo base se publica en formato NVFP4 (y existe una variante MXFP8), lo que sugiere entrenamiento o ajuste con precisión de 4 bits en los expertos. La conversión de Unsloth mantiene los expertos NVFP4 bit-exactos en las capas 0-39 y convierte el resto de pesos a BF16 en la variante de referencia; las cuantizaciones `UD-*` se calibran con imatrix (`imatrix_unsloth.gguf_file`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo soporta un parámetro `reasoning_effort` con niveles `none`, `minimal`, `low`, `medium`, `high` (por defecto), `xhigh` y `max` (equivalente a `xhigh`), lo que indica un modo de razonamiento configurable en la plantilla de chat. La plantilla de chat está embebida en cada GGUF y requiere `--jinja`.

## Capacidades

- Generación de texto y razonamiento con nivel de esfuerzo configurable (`reasoning_effort` de `none` a `max`).
- Comprensión de imágenes mediante el proyector de visión (`--mmproj`), con pipeline image-text-to-text.
- Generación y asistencia en código en múltiples lenguajes de programación.
- Soporte para sistemas agénticos y uso de herramientas (tool use / function calling), según la model card del modelo base.
- Capacidades multilingües: inglés y otros idiomas (lista concreta no disponible).
- Conversación multi-turno (tag `conversational`).
- Compatible con endpoints OpenAI (`endpoints_compatible` en los tags del repo).

## Casos de uso

- Asistencia en programación dentro del IDE: el modelo puede generar y revisar código en varios lenguajes y razonar sobre fragmentos extensos gracias a una ventana de 32.768 tokens, adecuada para archivos y contextos de repositorio medianos.
- Sistemas agénticos con uso de herramientas: la model card del base lo orienta a sistemas de tool use, por lo que puede encadenar llamadas a funciones y razonamiento multi-paso en pipelines de automatización.
- Análisis de documentos con imágenes: al aceptar entradas image-text-to-text, puede extraer información de capturas, diagramas o documentos escaneados y responder preguntas sobre ellos.
- Atención al cliente automatizada: conversaciones multi-turno con contexto de 32.768 tokens permiten mantener historiales largos; el modo `reasoning_effort` ajustable permite reducir latencia en consultas simples.
- Despliegue local en estaciones de trabajo con GPU: las cuantizaciones UD-IQ2_XXS (190,6 GB) y UD-Q4_K_XL (354,2 GB) permiten ejecutar el modelo en servidores con múltiples GPU o en configuraciones de gran VRAM, con degradación medida frente a BF16.
- Investigación y evaluación de cuantizaciones: el repo publica métricas KLD y coincidencia de top-1 por cuantización, útil para estudiar el impacto de la compresión en modelos MoE multimodales.
- Prototipado con llama.cpp y Unsloth Desktop: el modelo puede ejecutarse mediante `llama-server` con API compatible con OpenAI, lo que facilita integrarlo en aplicaciones existentes sin infraestructura propietaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El repo sí publica métricas de fidelidad de cuantización frente a BF16, medidas sobre 64 × 4096 tokens de wikitext-2 con caché KV F16 por defecto en llama.cpp:

| Cuantizacion | Tamano (GB) | KLD medio vs BF16 | KLD percentil 99 | Mismo token top-1 |
|---|---|---|---|---|
| UD-IQ1_S | 171,7 | 0,0922 | 1,143 | 89,7% |
| UD-IQ1_M | 178,5 | 0,0829 | 1,041 | 90,2% |
| UD-IQ2_XXS | 190,6 | 0,0577 | 0,730 | 91,8% |
| UD-Q2_K_XL | 205,0 | 0,0450 | 0,559 | 92,7% |
| UD-IQ3_XXS | 226,0 | 0,0364 | 0,430 | 93,3% |
| UD-Q3_K_XL | 285,1 | 0,0176 | 0,209 | 95,3% |
| UD-Q4_K_XL | 354,2 | 0,0029 | 0,031 | 98,0% |
| UD-Q8_K_XL | 386,5 | 0,0027 | 0,029 | 98,1% |
| BF16 | 484,4 | referencia | — | — |

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 171,7 GB en UD-IQ1_S; 190,6 GB en UD-IQ2_XXS; 354,2 GB en UD-Q4_K_XL; 484,4 GB en BF16. Añadir el espacio del proyector de visión y de la caché KV.
- GPU recomendadas: no hay una lista oficial; por el tamaño, se requieren configuraciones multi-GPU de clase servidor (A100 80 GB, H100 80 GB, H200) o GPUs con memoria unificada grande. No cabe en una única GPU consumer.
- GPU consumer: no es viable en RTX 4090 (24 GB) ni en GPUs de 48 GB; solo con `-ngl 0` (CPU) o descarga parcial de capas, con latencia muy alta.
- Opciones de despliegue: llama.cpp (compilación con el PR #32187 para arquitectura `inkling2`), `llama-server` con API compatible con OpenAI, `llama-mtmd-cli` para multimodal, Unsloth Desktop. vLLM, TGI y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. El ejemplo de la model card usa `-ngl 99 -c 32768` con `--temp 1.0 --top-p 1.0 --top-k 0 --min-p 0.0` y `reasoning_effort` en `high`.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de tareas para Inkling-2-Small ni de modelos comparables identificados en la información proporcionada. A continuación se comparan únicamente parámetros y disponibilidad con alternativas de gran tamaño citadas en el ecosistema de Unsloth, sin datos de benchmarks:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Small | 593,7 B (MoE) | 32.768 (usado en ejemplo) | Apache 2.0 | GGUF (Unsloth), NVFP4 y MXFP8 (base) |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | GGUF (Unsloth) |
| MiniMax-H3 | no disponible | no disponible | no disponible | GGUF (Unsloth) |
| Qwen3.8 | no disponible | no disponible | no disponible | GGUF (Unsloth) |

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks de tareas; el rendimiento real en MMLU, HumanEval o GSM8K no está verificado en la información disponible.
- El tamaño del repo (2241,2 GB) implica una descarga y un almacenamiento considerables; conviene descargar solo la cuantización y el proyector necesarios.
- Requiere una compilación específica de llama.cpp (PR #32187, que depende del PR #25731); las builds que solo soportan el Inkling original no cargan este modelo.
- El modelo base se distribuye en NVFP4; las cuantizaciones de menor tamaño (UD-IQ1_S, UD-IQ1_M) presentan una degradación medible (KLD 0,0922 y 0,0829; top-1 89,7% y 90,2%) que puede afectar a tareas sensibles.
- Riesgo de alucinación y sesgos: no hay información específica publicada en la información disponible; debe evaluarse empíricamente antes de producción.
- Idiomas: la lista concreta no está disponible; la model card solo indica inglés y otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base remite a una política de uso aceptable de Thinking Machines que debe revisarse.
- El modo de razonamiento por defecto es `high`, lo que incrementa latencia y consumo de tokens; para cargas de baja latencia conviene usar `none` o `minimal`.

## Enlaces

- Repositorio GGUF: https://huggingface.co/unsloth/Inkling-2-Small-GGUF
- Modelo base NVFP4: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Variante MXFP8: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Guía de Inkling 2 de Unsloth: https://unsloth.ai/docs/models/inkling-2
- Unsloth Desktop: https://unsloth.ai/docs/desktop
- Cuantizaciones dinámicas Unsloth 3.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Repositorio Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Playground de Thinking Machines: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- PR de llama.cpp para Inkling 2: https://github.com/ggml-org/llama.cpp/pull/32187
- PR previo de Inkling: https://github.com/ggml-org/llama.cpp/pull/25731
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
