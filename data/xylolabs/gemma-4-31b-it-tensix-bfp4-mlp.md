# Xylolabs/gemma-4-31B-it-Tensix-BFP4-MLP

## Resumen

Este repositorio contiene una versión cuantizada del modelo multimodal `google/gemma-4-31B-it`, adaptada específicamente para su ejecución en NPUs de Tenstorrent (arquitecturas Tensix como Wormhole y Blackhole) mediante la librería `ttnn`. La cuantización no emplea formatos convencionales como INT4 o GGUF, sino el formato block-floating-point propietario de Tenstorrent (`bfloat4_b` y `bfloat8_b`), que almacena valores en bf16 pero ya alineados a la rejilla de precisión del hardware, evitando un re-redondeo al empaquetar. El autor es Xylolabs, un tercero independiente respecto a Google, y el modelo base conserva la licencia Apache 2.0.

La motivación técnica es clara: el modelo original de 31B parámetros ocupa 61,39 GB en bf16, lo que dificulta su despliegue en aceleradores con DRAM limitada. Esta versión reduce el peso empaquetado a 23,53 GB (6,13 bits por peso de media), aplicando GPTQ con búsqueda de exponente por bloque a las capas MLP (gate, up, down) en `bfloat4_b` y redondeo al vecino más cercano a las proyecciones de atención (q, k, v, o) en `bfloat8_b`. Las capas de embedding, LM head, normas y torre de visión permanecen en bf16 sin cambios.

Es relevante ahora porque representa uno de los primeros intentos públicos de llevar un modelo de lenguaje de gran tamaño y multimodal a la pila de software de Tenstorrent, un ecosistema emergente de silicio alternativo a GPU. No obstante, debe subrayarse que las pruebas se realizaron sobre `ttsim`, el simulador de Blackhole, y no sobre hardware físico, y que la demo oficial de tt-metal para Gemma 4 no soporta nativamente este checkpoint sin overrides de precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Gemma 4; 60 capas |
| Parametros totales | 32.682.375.020 (32,68 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`) en MLP; BFP8 (`ttnn.bfloat8_b`) en atención; bf16 en embedding, LM head, normas y vision tower |
| Idiomas soportados | no disponible (calibración GPTQ realizada sobre WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores bf16 alineados a rejilla BFP4/BFP8) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-31B-it`, un transformer multimodal de tipo image-text-to-text con 60 capas y aproximadamente 32,68 mil millones de parámetros. La arquitectura exacta (atención, normalización, composición del bloque MLP) no se detalla en la información proporcionada más allá de la estructura de 60 capas y la presencia de una torre de visión (`vision_tower`) y un proyector de embeddings visuales (`embed_vision`). No se especifica la longitud de contexto ni la composición del corpus de entrenamiento original.

El proceso de cuantización aplicado por Xylolabs es específico para Tensix: las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`) en las 60 capas se redondearon a `ttnn.bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones de atención (q, k, v, o) de las 60 capas se redondearon a `ttnn.bfloat8_b` por redondeo al vecino más cercano. Los pesos resultantes se almacenan en safetensors como bf16, pero cada valor ya pertenece a la rejilla BFP correspondiente, de modo que TT-NN los empaqueta sin volver a redondear. El archivo `quant4.json` documenta el formato de cada proyección. Solo el modelo de lenguaje fue cuantizado y evaluado; la parte de visión permanece intacta en bf16.

## Capacidades

- Generación de texto conversacional multi-turno, dado el sufijo `it` (instruction-tuned) del modelo base.
- Procesamiento de imagen y texto (`image-text-to-text`), con torre de visión y proyector visual conservados en bf16.
- Razonamiento y respuesta a instrucciones, heredados del modelo base Gemma 4.
- Capacidades multilingües: no disponibles en detalle, aunque la calibración incluyó coreano además de inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" o razonamiento extendido: no disponible en la información proporcionada.
- Ejecución en NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante `ttnn` y empaquetado BFP nativo.

## Casos de uso

- Despliegue en NPUs Tenstorrent Wormhole y Blackhole: el formato BFP4/BFP8 permite cargar el modelo en DRAM de estos aceleradores sin re-redondeo, reduciendo el peso empaquetado a 23,53 GB frente a 61,39 GB en bf16. Adecuado para entornos que ya operan silicio Tenstorrent y quieren evitar GPU convencionales.
- Investigación en cuantización block-floating-point: el repositorio incluye `quant4.json`, `pack_tensix.py` y `verify_grid.py`, lo que permite reproducir y auditar el empaquetado de cada matriz, comparar BFP4 frente a BFP8 y estudiar el impacto del redondeo GPTQ con búsqueda de exponente por bloque.
- Evaluación de degradación por cuantización: con una KL media de 0,05998 frente a bf16 y un 92,25 % de top-1, sirve como referencia para medir cuánto pierde un modelo de 31B al bajar a 6,13 bits por peso en tareas de generación.
- Prototipado multimodal en simulador: al conservar la torre de visión en bf16, permite experimentar con pipelines image-text-to-text en `ttsim` antes de disponer de hardware físico.
- Integración en pipelines de transformers: al ser compatible con `AutoModelForCausalLM` y `AutoTokenizer`, puede usarse como checkpoint de referencia en flujos de inferencia estándar en bf16, útil para validar que la cuantización no altera la salida esperada.
- Baseline para despliegues tensor-parallel multi-chip: la demo `gemma4_31b_qb2` de tt-metal distribuye el 31B en cuatro u ocho chips Blackhole (QuietBox 2, LoudBox) o un Wormhole T3K; este checkpoint puede servir como variante de precisión alternativa en esos entornos, previa validación con `precision_overrides.json`.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`google/gemma-4-31B-it`) | 16 | 61,39 | 0 | 100 | 40 de 40 | - |
| **este modelo** | 6,13 | 23,534 | 0,05998 | 92,25 | 40 de 40 | 0 |
| Q4_K_M | no disponible (tabla truncada en la información) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La tabla anterior recoge únicamente la evaluación interna de fidelidad respecto al modelo bf16 publicada por el autor.

## Requisitos de hardware

- VRAM/DRAM estimada: 23,53 GB empaquetados en BFP4/BFP8; en bf16 la carga completa supone 61,39 GB.
- Aceleradores objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Multi-chip: la demo oficial de tt-metal para Gemma 4 31B requiere cuatro u ocho chips Blackhole (QuietBox 2, LoudBox) o un Wormhole T3K en tensor-parallel; no funciona en un solo chip.
- GPU consumer: no disponible como objetivo de despliegue; el formato BFP es específico de Tensix y no se traduce directamente a CUDA.
- Opciones de despliegue: `ttnn` 0.81.1 (probado solo en `ttsim`, simulador de Blackhole), tt-metal (demo Gemma 4 y `gemma4_31b_qb2`), tt-forge / tt-xla (no probado con Gemma 4). Compatible con `transformers` para carga en bf16.
- Latencia y throughput: no disponibles; no se han ejecutado pruebas en hardware físico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Xylolabs/gemma-4-31B-it-Tensix-BFP4-MLP** | 32,68 B | no disponible | BFP4 MLP + BFP8 atención (6,13 bits/peso) | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-4-31B-it | 32,68 B | no disponible | bf16 | Apache 2.0 | Hugging Face (modelo base) |
| Variante Q4_K_M del base | no disponible | no disponible | Q4_K_M (GGUF) | Apache 2.0 | no disponible en la información |
| tt-metal `gemma4_31b_qb2` demo | 31 B | no disponible | BFP4 en todas las proyecciones | no disponible | Repositorio tt-metal (v0.81.1) |

No se dispone de datos suficientes para comparar rendimiento en benchmarks con alternativas de la misma categoría.

## Limitaciones y advertencias

- No validado en hardware físico: todas las pruebas se realizaron sobre `ttsim`, el simulador de Blackhole; el particionado multi-chip no se ejecutó.
- Solo el modelo de lenguaje fue cuantizado y evaluado; la torre de visión y el proyector visual permanecen en bf16 y no fueron evaluados.
- La demo oficial de tt-metal para Gemma 4 no soporta bfloat4_b y, sin entrada en `precision_overrides.json`, carga todo en bf16; la entrada sugerida empaqueta atención y MLP en bfloat8_b, probada solo en las dos primeras capas en un chip simulados.
- La demo `gemma4_31b_qb2` empaqueta todas las proyecciones en bfloat4_b, lo que re-redondearía la atención bfloat8_b de este checkpoint; no fue probada.
- tt-forge (tt-xla) no se ha ejecutado con Gemma 4; su opción `bfp_bf4` re-redondea los pesos con un layout de bloque diferente.
- Degradación medible: KL media de 0,05998 y top-1 del 92,25 % frente a bf16, aunque mantiene 40 de 40 respuestas correctas en la evaluación interna.
- Idiomas soportados no documentados; la calibración GPTQ usó WikiText-2 y Wikipedia en coreano, lo que puede introducir sesgo hacia esos dominios.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización.
- Longitud de contexto no disponible en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el formato BFP limita el despliegue a hardware Tensix; no hay ruta directa a GPU convencionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-it-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Demo Gemma 4 en tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Demo `gemma4_31b_qb2` en tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4_31b_qb2
- Paper referenciado (`arxiv:2607.02770`): https://arxiv.org/abs/2607.02770
- Licencia: https://huggingface.co/Xylolabs/gemma-4-31B-it-Tensix-BFP4-MLP/blob/main/LICENSE
