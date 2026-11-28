# Xylolabs/Qwen2.5-7B-Instruct-1M-Tenstorrent-Tensix

## Resumen

Qwen2.5-7B-Instruct-1M-Tenstorrent-Tensix es una version cuantizada del modelo Qwen2.5-7B-Instruct-1M de Alibaba Qwen, publicada por Xylolabs y optimizada especificamente para su despliegue en aceleradores Tenstorrent Tensix (NPUs). El modelo base es un transformer decoder-only de 7.000 millones de parametros con una ventana de contexto extendida hasta 1 millon de tokens, disenado para tareas de generacion de texto, razonamiento e instrucciones en formato conversacional.

La aportacion de este repositorio no es un nuevo modelo, sino un pipeline de cuantizacion en formatos block-floating-point (BFP4 y BFP8) compatibles con el stack tt-metal/ttnn de Tenstorrent. Se distribuyen dos variantes empaquetadas: `bfp4/` (MLP en bfloat4_b, atencion en bfloat8_b, resto en bf16) y `bfp8/` (atencion y MLP en bfloat8_b, resto en bf16), cada una en su propia carpeta con pesos safetensors e indices de empaquetado.

Es relevante ahora porque permite ejecutar un modelo de contexto largo de 7B en hardware NPU de Tenstorrent con perdida de calidad medida y documentada (KL respecto a BF16), lo que facilita el despliegue en entornos donde no se dispone de GPUs NVIDIA y se busca reducir el footprint de memoria frente a los 15,23 GB del BF16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), pesos cuantizados para Tenstorrent Tensix |
| Parametros totales | 7.000 millones (heredados del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 1.000.000 de tokens (modelo base Qwen2.5-7B-Instruct-1M) |
| Tipos de cuantizacion | bfloat4_b (BFP4), bfloat8_b (BFP8), bf16; referencia Q4_K_M en llama.cpp |
| Idiomas soportados | Ingles (etiqueta `en` en la model card); el modelo base Qwen2.5 soporta multiples idiomas, pero esta ficha declara solo ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con ficheros `quant4.json`, `model.safetensors.index.json`, `pack_tensix.py`, `verify_grid.py`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-7B-Instruct-1M, un transformer decoder-only denso de 7B parametros afinado por instrucciones y extendido a 1M de tokens de contexto por el equipo Qwen (documentado en el informe tecnico arXiv:2501.15383 y en el blog "Qwen2.5-1M: Deploy Your Own Qwen with Context Length up to 1M Tokens"). Esta ficha no aporta detalles adicionales sobre el dataset de entrenamiento, el numero de tokens vistos ni el proceso de alineacion (RLHF/DPO) del modelo base; esos datos deben consultarse en la documentacion original de Qwen.

La innovacion de este repositorio es la cuantizacion block-floating-point para el formato de tiles de Tensix. Se aplica BFP4 a las capas MLP y BFP8 a la atencion en la variante `bfp4/`, y BFP8 a atencion y MLP en la variante `bfp8/`, dejando el resto de pesos en bf16. La calidad se mide como divergencia KL media frente a BF16 sobre 16.184 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat, con un limite de KL media de 1,5 veces la referencia Q4_K_M de llama.cpp. Los pesos se empaquetan con `pack_tensix.py` y se verifican con `verify_grid.py`, que hacen round-trip por DRAM del dispositivo.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`).
- Razonamiento e instrucciones heredados de Qwen2.5-7B-Instruct.
- Generacion de codigo y matematicas (capacidades del modelo base Qwen2.5).
- Ventana de contexto de hasta 1M de tokens en el modelo base, adecuada para documentos largos.
- Capacidades multilingues del modelo base Qwen2.5 (la model card de esta version declara solo ingles).
- Despliegue en NPUs Tenstorrent Tensix mediante tt-metal/ttnn y empaquetado con tt-forge.
- No se documenta en esta ficha soporte explicito de tool calling, agentes, vision ni audio; deben verificarse en la documentacion del modelo base.

## Casos de uso

- Analisis de documentos extensos: el contexto de 1M tokens del modelo base permite procesar libros, expedientes o bases de codigo completas en una sola pasada, con la variante `bfp4/` reduciendo el footprint a 6,262 GB empaquetados.
- Despliegue en hardware Tenstorrent: equipos con NPUs Tensix pueden ejecutar el modelo sin GPUs NVIDIA, usando las carpetas `bfp4/` o `bfp8/` segun el compromiso entre memoria y calidad (KL media 0,03451 frente a 0,00154).
- Sustitucion de BF16 en produccion con restricciones de memoria: `bfp8/` ocupa 9,114 GB frente a 15,23 GB en BF16 con una KL media de 0,00154, util cuando se quiere minimizar la perdida de calidad.
- Evaluacion comparativa de cuantizaciones: la tabla de KL frente a Q4_K_M (0,03061) permite decidir entre BFP4, BFP8 y la referencia llama.cpp para un mismo modelo base.
- Investigacion en cuantizacion block-floating-point: el repositorio incluye scripts de empaquetado y verificacion reutilizables para estudiar BFP4/BFP8 sobre otros modelos.
- Generacion de codigo asistida en pipelines internos: al heredar las capacidades de Qwen2.5-7B-Instruct, puede integrarse en herramientas de autocompletado o revision, siempre que el entorno de ejecucion sea compatible con tt-metal/ttnn o se use la variante BF16 en transformers.
- Chatbot de atencion al cliente con contexto largo: conversaciones multi-turno con historial extenso aprovechando la ventana de 1M tokens del modelo base.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Si se documenta la calidad de cuantizacion mediante divergencia KL media frente a BF16:

| Variante | Formatos | Tamano empaquetado (GB) | KL media a BF16 |
|---|---|---|---|
| `bfp4/` | MLP bfloat4_b; atencion bfloat8_b; resto bf16 | 6,262 | 0,03451 |
| `bfp8/` | Atencion y MLP bfloat8_b; resto bf16 | 9,114 | 0,00154 |
| BF16 (Qwen base) | - | 15,23 | 0 |
| Q4_K_M (llama.cpp) | - | 4,683 | 0,03061 |

La KL se calcula sobre 16.184 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat, con un limite de KL media de 1,5 veces la referencia Q4_K_M.

## Requisitos de hardware

- VRAM/memoria: `bfp4/` requiere aproximadamente 6,3 GB empaquetados; `bfp8/` aproximadamente 9,1 GB; BF16 aproximadamente 15,2 GB. El repositorio completo ocupa 28,3 GB.
- Hardware objetivo: NPUs Tenstorrent Tensix con el stack tt-metal/ttnn y tt-forge. No se documenta soporte en GPUs NVIDIA/AMD en esta ficha.
- GPU de consumo: no aplica directamente; la ejecucion esta pensada para Tensix. La variante BF16 del modelo base puede ejecutarse en GPUs de consumo con suficiente memoria (no especificado aqui).
- Despliegue: `transformers` (con `dtype="bfloat16"` y `device_map="auto"` para carga), `ttnn` para empaquetado en dispositivo, `pack_tensix.py` y `verify_grid.py` para empaquetado y verificacion. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta version.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen2.5-7B-Instruct-1M-Tenstorrent-Tensix (este) | 7B | 1M | BFP4/BFP8/bf16 para Tensix | Apache 2.0 | Hugging Face, 149 descargas |
| Qwen/Qwen2.5-7B-Instruct-1M | 7B | 1M | BF16 | Apache 2.0 | Hugging Face (modelo base) |
| Qwen2.5-7B-Instruct (original) | 7B | 32K (tipico en Qwen2.5) | Multiples (GGUF, AWQ, etc.) | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (referencia de KL) | 7B | 1M | Q4_K_M | Apache 2.0 | Hugging Face |

La comparativa de rendimiento entre estos modelos no esta disponible en la informacion proporcionada; solo se dispone de la KL frente a BF16 y frente a Q4_K_M.

## Limitaciones y advertencias

- La model card declara solo ingles como idioma soportado, aunque el modelo base Qwen2.5 es multilingue; el rendimiento en otros idiomas no esta verificado en esta version.
- La cuantizacion BFP4 introduce una divergencia KL media de 0,03451, superior a la de Q4_K_M (0,03061); puede degradar tareas sensibles a la precision.
- El limite de calidad se define como 1,5 veces la KL media de Q4_K_M, por lo que la calidad no es identica a BF16.
- La ejecucion esta ligada al stack tt-metal/ttnn y al hardware Tensix; no se documenta portabilidad a otras plataformas en esta ficha.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion proporcionada; deben evaluarse sobre el modelo base Qwen2.5-7B-Instruct-1M.
- Licencia Apache 2.0 permite uso comercial, pero cada carpeta incluye su propio `LICENSE` y `NOTICE` con los cambios realizados por Xylolabs; conviene revisarlos.
- El repositorio se reorganizo el 2026-11-27 (BFP4 y BFP8 unificados) y la model card se corrigio el 2026-11-28; verificar rutas e indices antes de automatizar descargas.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-1M-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-1M
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Blog Qwen2.5-1M: https://qwenlm.github.io/blog/qwen2.5-1m/
- Informe tecnico Qwen2.5-1M: https://arxiv.org/abs/2501.15383
- Assets de Xylolabs: https://raw.githubusercontent.com/XylolabsInc/tensix-bfp-gptq/main/assets/xylolabs-lockup.svg
