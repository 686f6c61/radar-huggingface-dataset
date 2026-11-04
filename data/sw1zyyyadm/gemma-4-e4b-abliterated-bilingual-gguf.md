# Sw1zyyyAdm/gemma-4-e4b-abliterated-bilingual-GGUF

## Resumen

Gemma 4 E4B Abliterated Bilingual Rank2 es una modificacion de pesos del modelo base google/gemma-4-E4B, publicada por el usuario Sw1zyyyAdm en HuggingFace bajo licencia Apache-2.0. Se distribuye exclusivamente en formato GGUF, en dos variantes de almacenamiento mixto (F16 y Q8_0), y aplica una tecnica de "abliteration" selectiva sobre 46 matrices del modelo para reducir la tasa de rechazos explicitos en tareas de generacion de texto. El modelo base pertenece a la familia Gemma 4 de Google y, segun los metadatos del repositorio, cuenta con aproximadamente 7.518 millones de parametros y 42 capas con anchura residual de 2560.

La innovacion principal del release es el uso de una ortogonalizacion rank-2 bilingue (ingles y ruso) especifica por capa, aplicada a las matrices `attn_output.weight` y `ffn_down.weight` de las capas 15 a 37. Segun la model card, esta intervencion redujo los rechazos explicitos de 22/24 a 0/24 en un conjunto de evaluacion interno fijo, manteniendo intactos 674 de los 720 tensores del modelo original. El autor advierte que estas son observaciones acotadas y no una garantia de ausencia universal de rechazos.

El modelo es relevante para desarrolladores e investigadores interesados en estudiar mecanismos de rechazo, alineacion multilingue y edicion de pesos en modelos abiertos, asi como para despliegues locales donde se requiera una variante menos restrictiva del modelo base. No incluye el proyector de vision/audio ni el modelo borrador especulativo del Gemma 4 E4B original, por lo que su alcance es exclusivamente generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4), 42 capas, anchura residual 2560 |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixto: F16 (6.466 GB) y Q8_0 (5.768 GB) en las 46 matrices editadas; el resto de tensores conserva los payloads originales |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors solo como dato de conteo de parametros del modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Gemma 4 E4B, con 42 capas y anchura residual de 2560, segun los datos de la model card. El autor no documenta el proceso de preentrenamiento original (composicion del dataset, numero de tokens, uso de RLHF/DPO), ya que este corresponde al modelo base de Google y no se detalla en la informacion disponible.

La modificacion consiste en una ortogonalizacion rank-2 bilingue especifica por capa. Se recogieron activaciones residuales de 24 ejecuciones de prefill con 12 pares contraste-objetivo (6 en ingles y sus 6 traducciones al ruso). Para cada capa se estimo una direccion media compartida `u1,L` y se anadio una segunda componente ortogonal obtenida por SVD sobre los contrastes proyectados, formando una base ortonormal de dos columnas `U_L`. La edicion aplica `W'_L = (I − U_L U_L^T) W_L` con fuerza 1 sobre `attn_output.weight` y `ffn_down.weight` en las capas 15 a 37, modificando exactamente 46 matrices y preservando byte a byte los 674 tensores restantes. El autor senala que la alineacion RU/EN de las direcciones alcanza aproximadamente 0.95 en las capas 23-28, con un rango de 0.66-0.95 en el intervalo completo 15-37.

## Capacidades

- Generacion de texto conversacional en ingles y ruso.
- Reduccion de rechazos explicitos en el conjunto de evaluacion interno (de 22/24 a 0/24), segun el autor.
- Respuesta a 12 tareas de control cortas con 12/12 respuestas exactas (frente a 10/12 del modelo sin editar, segun la model card).
- Soporte bilingue EN/RU con alineacion de direcciones de activacion medida entre ambos idiomas.
- No incluye vision ni audio: el proyector multimodal del modelo base no forma parte del release.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la informacion proporcionada.
- No se documenta modo "thinking" ni capacidades de agente.

## Casos de uso

- Investigacion sobre mecanismos de rechazo: el modelo permite estudiar como la proyeccion de direcciones rank-2 en capas intermedias afecta a la tasa de rechazos, con un conjunto de evaluacion reproducible de 36 casos descrito en la model card.
- Analisis de alineacion multilingue EN/RU: las figuras de alineacion por capa (`middle_language_alignment.png`, `layerwise_geometry.png`) y el fichero `data/methodology.json` permiten replicar el analisis de similitud de direcciones entre idiomas.
- Despliegue local en ingles o ruso: las variantes GGUF de 5.768 GB (Q8_0) y 6.466 GB (F16) pueden cargarse con llama.cpp u Ollama para generacion de texto en entornos sin GPU de datacenter.
- Generacion de texto sin restricciones en entornos de investigacion controlados: util para comparar comportamiento respecto al modelo base en tareas donde los rechazos interfieren con la evaluacion.
- Estudio de tecnicas de edicion de pesos: la metodologia documentada (contrastes pareados, SVD residual, ortogonalizacion) sirve como referencia para experimentos de abliteration en otros modelos.
- Evaluacion de cuantizacion mixta: la comparacion F16 vs Q8_0 sobre las 46 matrices editadas (con ahorro de 698 MB, 10.79%) permite medir el impacto de la precision en las matrices modificadas.
- Base para fine-tuning bilingue: al conservar 674 tensores originales y la licencia Apache-2.0, puede servir como punto de partida para ajustes posteriores en EN/RU.

## Benchmarks y rendimiento

La model card reporta unicamente resultados sobre un conjunto de evaluacion interno fijo, no benchmarks publicos estandar:

| Metrica | Modelo sin editar | Modelo editado (rank-2) |
|---|---|---|
| Rechazos explicitos | 22/24 | 0/24 |
| Respuestas exactas en 12 tareas de control cortas | 10/12 | 12/12 |
| Casos totales superados (release compacto) | no disponible | 36/36 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor advierte explicitamente que estas son observaciones acotadas y no una afirmacion de mejora de capacidad general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB para la variante Q8_0 (5.768 GB de pesos) y 7-8 GB para la variante F16 (6.466 GB), mas overhead de contexto KV.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para despliegue en consumer; A100/H100 no necesarias por el tamano del modelo.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM para Q8_0; 10 GB o mas para F16 con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama (el modelo base se distribuye como `gemma4:e4b` en Ollama segun la model card), y cualquier runtime compatible con GGUF. No se menciona soporte de vLLM ni TGI para este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Gemma 4 E4B Abliterated Bilingual Rank2 (este) | 7.518 M | no disponible | en, ru | apache-2.0 | GGUF (F16/Q8_0 mixto) | 46 matrices editadas, 674 intactas |
| google/gemma-4-E4B (base) | 7.518 M | no disponible | no disponible | no disponible | no disponible | Modelo original de Google |
| Otras variantes abliterated de Gemma | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente sobre alternativas comparables (mismo tamano, misma tarea de abliteration o mismo par de idiomas) para establecer una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- La reduccion de rechazos se midio en un conjunto interno de 24 casos; no implica ausencia universal de rechazos ni mejora de capacidad general, como advierte el propio autor.
- El procedimiento no modifica los writers de embedding por capa, no elimina la componente residual entrante ni compensa escalas diagonales post-normalizacion; por tanto, suprimir la proyeccion de la matriz no elimina matematicamente esa componente del flujo residual completo.
- La interpretacion de la segunda componente SVD como eje de "preachiness" no esta establecida segun la model card.
- El modelo solo cubre ingles y ruso; no se documenta soporte de castellano ni de otros idiomas.
- No incluye vision ni audio, a diferencia del Gemma 4 E4B completo.
- Riesgo de alucinacion y sesgos: no documentados especificamente en la informacion disponible; se heredan los del modelo base, no caracterizados aqui.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo editado en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion independiente de los resultados reportados.
- El modelo base se obtuvo de un blob de Ollama (`gemma4:e4b`), no directamente del repositorio de Google; la procedencia exacta de los pesos debe verificarse contra la huella indicada por el autor.

## Enlaces

- HuggingFace: https://huggingface.co/Sw1zyyyAdm/gemma-4-e4b-abliterated-bilingual-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Figura de alineacion RU/EN: `./middle_language_alignment.png` (en el repositorio)
- Figura de geometria por capa: `./layerwise_geometry.png` (en el repositorio)
- Datos de metodologia: `./data/methodology.json` (en el repositorio)
- Referencia arxiv 2406.11717: https://arxiv.org/abs/2406.11717
- Referencia arxiv 2602.02132: https://arxiv.org/abs/2602.02132
