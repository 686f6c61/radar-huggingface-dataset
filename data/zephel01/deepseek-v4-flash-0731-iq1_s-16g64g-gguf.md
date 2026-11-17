# zephel01/DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF

## Resumen

DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF es una cuantización GGUF extrema del modelo DeepSeek-V4-Flash-0731 (desarrollado por DeepSeek), publicada por el usuario zephel01 bajo licencia MIT. Se trata de un modelo MoE (mixture of experts) de 284.334.567.511 parámetros totales, comprimido hasta 61,7 GB mediante una mezcla de tipos de cuantización (IQ1_S, IQ1_M, Q5_K y bytes de UD-Q2_K_XL) que promedia 1,62 bits por peso. El objetivo declarado es que el modelo quepa y funcione en un PC con una GPU de 16 GB de VRAM y 64 GB de RAM, manteniendo los 256 expertos enrutados de cada capa sin poda.

La relevancia de esta ficha reside en que permite ejecutar un modelo de escala frontier en hardware de consumo, sacrificando calidad (KL de 0,407 frente a 0,186 de la referencia UD-Q2_K_XL) a cambio de un rendimiento 4x superior (84,5 tok/s frente a 21,3 tok/s) al evitar el desbordamiento a SSD. Es una build BETA medida en una RTX 5090 limitada artificialmente a 16 GB de VRAM, no en una tarjeta real de 16 GB.

La información disponible sobre el modelo base (arquitectura interna, datos de entrenamiento, benchmarks oficiales) es muy limitada; esta ficha se centra en los datos verificables de la cuantización y del modelo base en lo que la model card proporciona.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts); detalles internos del transformer no disponibles |
| Parámetros totales | 284.334.567.511 (284,3 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (se menciona una prueba needle de 8K-31K en la model card) |
| Tipos de cuantización | Mixta: expertos enrutados gate/up en IQ1_S (64% por bytes) y down en IQ1_M (36%); attention `attn_q_b`, `attn_output_a`, `attn_output_b` en Q5_K; resto en bytes de UD-Q2_K_XL; media de 1,62 bits por peso |
| Idiomas soportados | Inglés (en) y japonés (ja), según tags y model card |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, 61,7 GB) |

## Arquitectura y entrenamiento

El modelo base es un MoE de DeepSeek con 284,3 mil millones de parámetros totales. La model card no detalla el número de parámetros activos, la composición del dataset de entrenamiento, el número de tokens ni si hubo RLHF/DPO. Lo que sí se documenta es el proceso de cuantización: los expertos fueron recuantizados con LDLQ a partir del UD-Q8_K_XL de unsloth (expertos originales en MXFP4), usando un volcado de Hessian generado a partir de las propias respuestas de chat de V4 (241 prompts, 104 de ellos en japonés) más texto general, y una imatrix propia.

La innovación técnica destacable de esta build es la estrategia de cuantización mixta por tipo de tensor: los expertos enrutados (los que dominan el tamaño) se comprimen a IQ1_S/IQ1_M, mientras que las proyecciones de atención críticas (`attn_q_b`, `attn_output_a`, `attn_output_b`) se mantienen en Q5_K para preservar calidad. El primer shard (solo metadatos, 5 MB) es el fichero de unsloth tal cual, por lo que su campo `general.quantized_by` sigue indicando Unsloth. El motor de referencia es Abyss (v1.3.120 o superior); llama.cpp no ha sido verificado todavía.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta a preguntas (se cita una prueba de needle de 8K-31K tokens).
- Generación de código: la model card reporta 5/5 tareas de código con tests superadas.
- Tool calling / function calling: incluido en las pruebas `--check` del motor Abyss.
- Conversaciones multi-turno: se cita una prueba de conversación de 11 turnos.
- Capacidades multilingües: inglés y japonés (9/10 respuestas en japonés se mantuvieron en japonés).
- Compatibilidad con endpoints (tag `endpoints_compatible`), con API estilo OpenAI (`/v1/chat/completions`).

## Casos de uso

- Ejecución local de un modelo de 284B en un PC de consumo: con una GPU de 16 GB (RTX 5060 Ti 16 GB, RTX 4080, RX 9070 XT) y 64 GB de RAM, el modelo cabe sin desbordar a SSD, permitiendo inferencia local de un modelo de escala frontier.
- Asistente de código en local: las pruebas reportan 5/5 tareas de código con tests superadas; adecuado para autocompletado y generación de funciones en entornos sin conexión.
- Atención al cliente en japonés e inglés: el modelo mantiene el idioma en 9/10 respuestas y no produjo hechos erróneos en las pruebas, lo que lo hace apto para conversaciones multi-turno (11 turnos probados).
- Procesamiento de documentos largos: la ventana de contexto permite pruebas needle de 8K-31K tokens, útil para resumen y extracción sobre contratos o informes.
- Agentes con tool calling: el soporte de function calling y la API compatible con OpenAI permiten integrarlo en pipelines de agentes multi-paso.
- Prototipado e investigación en hardware limitado: permite evaluar el comportamiento de un MoE de 284B sin acceso a clústeres, a costa de una calidad inferior (KL 0,407).
- Despliegue con CPU offload: los tags `cpu-offload` y `consumer-gpu` indican que el motor Abyss gestiona la distribución VRAM/RAM, útil para estaciones de trabajo modestas.

## Benchmarks y rendimiento

Datos de la model card (motor Abyss, RTX 5090 limitada a 16 GB de VRAM y 64 GB de RAM):

| Métrica | L62 (esta repo) | UD-Q2_K_XL (referencia) |
|---|---:|---:|
| Descarga | 61,7 GB | 96,8 GB |
| KL (12 secuencias) | 0,407 | 0,186 |
| KL japonés (3 secuencias) | 0,435 | 0,219 |
| Mismo token top | 73,7% | 81,5% |
| Throughput | 84,5 tok/s | 21,3 tok/s |
| `--check` (japonés, 3 tareas código, tool call, needle 8K-31K, conversación 11 turnos) | 10/11 | 11/11 |
| Respuestas en japonés que se mantuvieron en japonés | 9/10 | 9/10 |
| Hechos erróneos en esas respuestas | 0 | 0 |
| 5 tareas de código con tests | 5/5 | 5/5 |
| Needle 8K | encontrado | no reportado |

El único fallo de `--check` fue una explicación en japonés (detalle truncado en la información disponible). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 16 GB de VRAM más 64 GB de RAM como objetivo de diseño; el fichero pesa 61,7 GB y requiere offload de expertos a RAM.
- GPU recomendadas: RTX 5060 Ti 16 GB, RTX 4080, RX 9070 XT (16 GB); la medición se hizo en una RTX 5090 limitada a 16 GB.
- Cabe en GPU de consumo de 16 GB con 64 GB de RAM del sistema; no cabe en GPUs con menos VRAM sin depender del SSD (lo que degrada el rendimiento a ~21 tok/s).
- Opciones de despliegue: motor Abyss v1.3.120+ (recomendado, con `setup-deepseek.sh --quant 16G64G --no-dspark --download-model`); llama.cpp no verificado.
- Latencia y throughput: 84,5 tok/s en la configuración medida; el drafter DSpark (~6,5 GB de VRAM) no se recomienda en tarjetas de 16 GB y no está medido a este tamaño.
- El modelo se sirve en `http://127.0.0.1:8082/` con API compatible con OpenAI.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Throughput (16G64G) | KL | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| DeepSeek-V4-Flash-0731-IQ1_S-16G64G (esta repo) | 284,3B | no disponible | 84,5 tok/s | 0,407 | MIT | GGUF, 61,7 GB |
| DeepSeek-V4-Flash-0731-IQ2_XXS-32G64G | 284,3B | no disponible | no disponible | no disponible | MIT | GGUF, 72,0 GB (requiere 32 GB VRAM) |
| DeepSeek-V4-Flash-0731-IQ2_M-32G96G | 284,3B | no disponible | no disponible | no disponible | MIT | GGUF, 96,8 GB (requiere 32 GB VRAM + 96 GB RAM) |
| unsloth UD-Q2_K_XL | 284,3B | no disponible | 21,3 tok/s | 0,186 | MIT | GGUF, 96,8 GB |

Las alternativas de la misma familia (L72 y L97) ofrecen mayor calidad a cambio de más VRAM y RAM; el UD-Q2_K_XL de unsloth es la referencia de calidad pero no cabe en 16 GB + 64 GB sin esperar al SSD.

## Limitaciones y advertencias

- Build BETA: medida en una RTX 5090 limitada artificialmente, no en una tarjeta real de 16 GB; el fichero puede ser reemplazado por una build mejor (y el nombre de carpeta cambiará).
- Pérdida de calidad significativa: KL de 0,407 frente a 0,186 de la referencia, con solo 73,7% de coincidencia en el token top; puede degradar tareas sensibles a precisión.
- Un fallo documentado en la prueba `--check` (explicación en japonés), aunque el detalle está truncado en la información disponible.
- Riesgo de alucinación: no se han publicado evaluaciones de sesgo ni de alucinación; las pruebas reportan 0 hechos erróneos en 10 respuestas japonesas, muestra insuficiente para generalizar.
- Idiomas: solo inglés y japonés documentados; no hay soporte declarado de castellano.
- Licencia MIT: permite uso comercial, pero el modelo base y la cuantización deben verificarse por separado; el primer shard conserva metadatos de Unsloth.
- llama.cpp no verificado; el motor Abyss es la única vía de despliegue probada.
- El drafter DSpark no está medido a este tamaño y no se recomienda en 16 GB de VRAM.
- No se dispone de datos sobre parámetros activos, contexto máximo ni composición del entrenamiento, lo que limita la evaluación rigurosa.

## Enlaces

- Hugging Face (esta repo): https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Motor Abyss: https://github.com/zephel01/Abyss
- Versión 32G64G: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_XXS-32G64G-GGUF
- Versión 32G96G: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF
- Versión DGX Spark: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-DGX-Spark-GGUF
- Reporte de resultados: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+DeepSeek-V4-Flash-0731+16G64G+L62+on+YOUR_GPU
