# tattrongvu/Jeffan-26B-A4B-2511-NVFP4

## Resumen

Jeffan-26B-A4B-2511-NVFP4 es una cuantizacion NVFP4 (W4A4, FP4 E2M1) del modelo Jeffan-26B-A4B-2511, desarrollado por el usuario tattrongvu. No es un modelo generativo al uso: es un modelo de decision estructurada que recibe un estado y un conjunto de preguntas (eleccion multiple, si/no y puntuacion) y devuelve, en un unico forward pass, una probabilidad para cada opcion, sin generar texto. El modelo base se construye sobre google/gemma-4-26B-A4B-it, de arquitectura Mixture-of-Experts con 25.810 millones de parametros totales y unos 4.000 millones activos por token (la nomenclatura A4B del nombre alude a ello).

Esta variante cuantiza los 128 expertos enrutados de cada una de las 30 capas (unos 22.840 millones de parametros) a FP4, manteniendo en BF16 la atencion, el MLP denso, el router, los embeddings, las normas y la torre de vision. El resultado es un checkpoint de 18,8 GB frente a los 51,6 GB del modelo en BF16, con la misma precision declarada en 4.000 preguntas de decision reservadas y una latencia aproximadamente un 30 % menor en una NVIDIA B200.

La relevancia de esta ficha radica en su naturaleza de artefacto de inferencia altamente especializado: solo funciona en vLLM con GPUs NVIDIA Blackwell (tensor cores FP4), requiere un plugin propio para exponer los endpoints `/v1/systemone` y `/v1/decisions`, y no es ejecutable desde transformers. Es, por tanto, una pieza de infraestructura para sistemas de decision automatizada, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) derivado de google/gemma-4-26B-A4B-it, con torre de vision |
| Parametros totales | 14.386.941.232 (safetensors del checkpoint cuantizado); el modelo base declara 25.810 millones |
| Parametros activos | Aproximadamente 4.000 millones (segun la nomenclatura A4B del modelo base) |
| Longitud de contexto | 98.312 tokens (valor de `--max-model-len` usado en el ejemplo de despliegue) |
| Tipos de cuantizacion | NVFP4 W4A4: valores FP4 E2M1 en bloques de 16 con escalas de bloque FP8 E4M3 y escala global FP32 por tensor; expertos enrutados cuantizados, resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato NVFP4 de NVIDIA ModelOpt; requiere vLLM (transformers no lo ejecuta) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 30 capas y 128 expertos enrutados por capa, mas un MLP denso compartido, router, embeddings atados con la capa de salida y una torre de vision heredada de Gemma 4. La innovacion de esta variante es puramente de cuantizacion: los pesos de los expertos (`experts.<e>.gate_proj`, `up_proj`, `down_proj`) se convierten a NVFP4 con NVIDIA Model Optimizer 0.48.0, batch size 1, compartiendo una escala de entrada entre los expertos de una misma capa. La calibracion se realizo con 512 prompts de decision en el formato propio del modelo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo base. La salida no es texto generado: el modelo lee las probabilidades de los codigos de opcion (`A`, `B`, ... hasta 255 opciones) directamente de la capa de salida en un unico forward pass y las renormaliza sobre las opciones validas. El plugin `jeffan_vdec` (dos ficheros Python, Apache 2.0) implementa el layout de prompt y la estrategia de lectura para los endpoints de vLLM, sin modificar el motor.

## Capacidades

- Decision estructurada: responde preguntas de tipo `choice` (eleccion multiple), `noul` (si/no) y `score` (puntuacion sobre criterios ordenados), devolviendo probabilidades por opcion.
- Clasificacion de texto mediante el pipeline `text-classification`, con hasta 255 opciones por pregunta.
- Evaluacion de multiples preguntas sobre un mismo estado en una sola peticion (`/v1/systemone`).
- Compatibilidad con la OpenAI Decisions API a traves de `/v1/decisions` y del SDK `openai` (`client.decisions.create`).
- Capacidad multimodal latente: conserva la torre de vision en BF16, aunque el ejemplo de despliegue la desactiva explicitamente (`--limit-mm-per-prompt '{"image": 0, "video": 0}'`).
- Soporte de prefix caching en vLLM para reducir latencia en peticiones repetidas.
- No genera texto libre ni mantiene conversaciones multi-turno: la salida es exclusivamente probabilistica sobre opciones predefinidas.

## Casos de uso

- Triaje de tickets de soporte: clasificar cada incidencia por equipo responsable, detectar peticiones explicitas (por ejemplo, una sustitucion) y asignar urgencia en una sola llamada, como muestra el ejemplo de la model card con un ticket de pantalla rota.
- Enrutamiento de correo o formularios entrantes: dado un texto de estado, elegir entre categorias predefinidas con probabilidades calibradas, lo que permite umbrales de derivacion a revision humana.
- Moderacion de contenido con criterios graduados: usar preguntas de tipo `score` para asignar niveles de severidad y preguntas `noul` para flags binarios, todo en un unico forward pass.
- Sistemas de decision en agentes: integrar el endpoint `/v1/decisions` como herramienta de un agente que necesita evaluar opciones discretas (que accion tomar, que herramienta invocar) con probabilidades en lugar de generacion libre.
- Clasificacion documental a gran escala: con 18,8 GB de pesos y latencias medianas de 12,9 ms por peticion en B200, es viable procesar volumenes altos de documentos con multiples preguntas por documento.
- Evaluacion automatizada de respuestas: puntuar respuestas candidatas de otros modelos contra criterios ordenados (`score`) y comparar alternativas con probabilidades normalizadas.
- Analisis de imagenes en pipelines de decision: aunque el ejemplo de despliegue desactiva la vision, la torre en BF16 permite, si se habilita, clasificar estados que incluyan imagenes.

## Benchmarks y rendimiento

Resultados declarados por el autor, medidos con el mismo servidor vLLM y cliente, una NVIDIA B200 por modelo. No son resultados oficiales de leaderboard.

| Modelo | Kit sample index (4.150 peticiones, HLE excluido) | Precision top-1 en 4.000 preguntas reservadas | Coincidencia con bf16 en la respuesta top | Latencia mediana / p95 (una peticion a la vez) |
|---|---:|---:|---:|---:|
| Jeffan-26B-A4B-2511 (bf16) | 68,83 | 75,72 % | – | 18,5 / 79,1 ms |
| Jeffan-26B-A4B-2511-NVFP4 | 69,18 | 75,72 % | 95,4 % | 12,9 / 49,0 ms |

La diferencia de +0,35 en el kit sample queda dentro del ruido de la muestra (aproximadamente ±1,5 puntos). La latencia se midio sobre un conjunto de 700 peticiones construido como el del leaderboard, tras 10 peticiones de calentamiento, con prefix caching activado. En la suite publica completa, el modelo bf16 obtiene 67,02; la version NVFP4 no se evaluo en la suite completa. No hay datos de MMLU, HumanEval ni GSM8K, que no aplican a un modelo de decision.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 18,8 GB; con overhead de vLLM, cache KV y margen de seguridad conviene reservar al menos 24-32 GB. El ejemplo oficial usa `--gpu-memory-utilization 0.85`.
- GPU imprescindibles: tensor cores FP4 de NVIDIA Blackwell. Medido en una NVIDIA B200. No funciona en arquitecturas anteriores (Hopper, Ada, Ampere) porque el formato NVFP4 no tiene soporte nativo.
- No cabe en GPUs de consumo actuales: ni las RTX 4090 (Ada) ni las RTX 5090 (Blackwell consumer, pero sin validacion declarada) estan soportadas por el autor.
- Despliegue: exclusivamente vLLM, con una build concreta (`vllm-0.34.0rc1.dev1205+g8d5e012ab`) y el plugin `vllm_decisions` en `PYTHONPATH` con `JEFFAN_VDEC=1`. No hay soporte para llama.cpp, Ollama ni TGI.
- Parametros de servidor recomendados: `--max-model-len 98312 --gpu-memory-utilization 0.85 --max-num-batched-tokens 4096 --max-logprobs 255 --logprobs-mode processed_logprobs`.
- Latencia y throughput: 12,9 ms de mediana y 49,0 ms de p95 con una peticion a la vez en B200; no se han publicado cifras de throughput con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeffan-26B-A4B-2511-NVFP4 | 14,39 B en checkpoint (25,81 B en base) | 98.312 | 75,72 % top-1 en 4.000 preguntas de decision | Apache 2.0 | Hugging Face, solo vLLM + Blackwell |
| Jeffan-26B-A4B-2511 (bf16) | 25,81 B | 98.312 | 75,72 % top-1 en el mismo conjunto | Apache 2.0 | Hugging Face, vLLM |
| google/gemma-4-26B-A4B-it | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos comparables de la misma categoria (clasificadores de decision estructurada con salida probabilistica por opcion) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no mantiene conversaciones y no puede usarse para tareas fuera de la seleccion entre opciones predefinidas.
- Dependencia estricta de hardware: requiere NVIDIA Blackwell con tensor cores FP4. No hay fallback a otras GPUs ni a CPU.
- Dependencia estricta de software: solo funciona en vLLM con el plugin `jeffan_vdec`; transformers no carga el checkpoint.
- La model card no documenta sesgos, riesgo de alucinacion ni comportamiento en idiomas distintos del usado en la calibracion (512 prompts en el layout propio del modelo).
- La evaluacion es interna del autor, no un leaderboard oficial; la comparacion en la suite completa solo existe para el modelo bf16.
- El checkpoint esta etiquetado como 8-bit en los tags de Hugging Face pese a ser una cuantizacion de 4 bits, lo que puede inducir a confusion.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia: no hay evidencia de uso en produccion por terceros.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (Gemma 4) puede imponer terminos adicionales que conviene verificar antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tattrongvu/Jeffan-26B-A4B-2511-NVFP4
- Modelo base: https://huggingface.co/tattrongvu/Jeffan-26B-A4B-2511
- Modelo original de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Build de vLLM usada: https://wheels.vllm.ai/8d5e012ab97fb267da35b23941538f8a523b7fc2/vllm-0.34.0rc1.dev1205%2Bg8d5e012ab-cp38-abi3-manylinux_2_28_x86_64.whl
