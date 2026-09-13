# yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-0k_1k_2k_3k_4k_weightedavg_merge

## Resumen

`yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-0k_1k_2k_3k_4k_weightedavg_merge` es un modelo de lenguaje de 6.856.253.440 parámetros (aproximadamente 6,86 mil millones) generado con la herramienta mergekit mediante el método de fusión lineal (Linear merge). No se trata de un modelo entrenado desde cero ni de la combinación de modelos independientes: los cinco checkpoints fusionados proceden de un mismo entrenamiento, correspondientes a los pasos global_step0, 1000, 2000, 3000 y 4000 de una ejecución denominada `filtered_e2e_insert_hyperstition_v1`, con pesos respectivos 1, 2, 3, 4 y 5 normalizados. Es, por tanto, un promedio ponderado de la trayectoria de entrenamiento (una variante de *checkpoint averaging* o *model soup*).

La etiqueta `gpt_neox` indica que la arquitectura es un transformer decoder-only de la familia GPT-NeoX, con atención causal estándar. El repositorio ocupa 13,7 GB y los pesos se publican en safetensors con `out_dtype: bfloat16`, aunque el proceso de fusión se ejecutó en float32. La model card no documenta el conjunto de datos de entrenamiento, la longitud de contexto, los idiomas soportados ni la licencia, y el modelo acumula 0 descargas y 0 valoraciones, por lo que carece de validación por parte de la comunidad.

Su relevancia es fundamentalmente metodológica: sirve como artefacto reproducible para estudiar el efecto del promedio ponderado de checkpoints intermedios frente al uso del checkpoint final, y como posible base para experimentos de ajuste fino o de evaluación de seguridad, dado que las rutas internas filtradas en la model card (`Pan_Safety_Better_Measurement`) apuntan a un proyecto de medición de seguridad en modelos de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT-NeoX (`gpt_neox`), atención causal |
| Parametros totales | 6.856.253.440 (aprox. 6,86 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; pesos publicados en bfloat16 (el proceso de merge se calculó en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | safetensors (repo de 13,7 GB), compatible con la librería `transformers` |
| Método de fusión | Linear (mergekit), `normalize: true`, `dtype: float32`, `out_dtype: bfloat16` |
| Pesos de la fusión | step0 = 1, step1000 = 2, step2000 = 3, step3000 = 4, step4000 = 5 (normalizados, 1/15 a 5/15) |
| Checkpoint base | `filtered_e2e_insert_hyperstition_v1/global_step4000` |
| Pipeline declarado | text-generation |
| Etiquetas | transformers, safetensors, gpt_neox, text-generation, mergekit, merge, conversational, text-generation-inference, endpoints_compatible |
| Fecha de creación (según metadatos de HF) | 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura corresponde a GPT-NeoX, un transformer decoder-only con normalización previa a la atención y a la capa feed-forward, atención causal multi-cabeza y embeddings rotatorios posicionales en sus implementaciones habituales. Con 6,86 B de parámetros y pesos en bfloat16, el modelo ocupa 13,7 GB en disco. No se dispone de la configuración concreta publicada (número de capas, dimensión oculta, número de cabezas de atención ni tamaño de vocabulario), por lo que no es posible confirmar la longitud de contexto máxima soportada.

El entrenamiento subyacente no está documentado en la información disponible: se desconoce el número de tokens, la composición del dataset, si hubo fases de RLHF o DPO y el régimen de entrenamiento. Lo único verificable es la existencia de una ejecución con al menos 4000 pasos globales y cinco checkpoints intermedios. La innovación técnica del repositorio no está en el entrenamiento, sino en la operación de fusión: mergekit aplica una combinación lineal de los tensores de los cinco checkpoints, ponderada por los coeficientes 1, 2, 3, 4 y 5 y normalizada (1/15, 2/15, 3/15, 4/15 y 5/15), dando más peso a los checkpoints tardíos y ninguno a modelos externos. Esto lo distingue de una *model soup* clásica, que promedia modelos con ajuste fino independiente sobre una misma base. El método de fusión lineal referenciado en las etiquetas corresponde al artículo arXiv:2203.05482.

## Capacidades

- Generación de texto autoregresiva, según el pipeline declarado (`text-generation`) y la arquitectura causal.
- Uso conversacional: la etiqueta `conversational` sugiere que el entrenamiento incluyó formato de diálogo, aunque no se documenta la plantilla de chat ni los tokens especiales.
- Compatibilidad con `transformers` y con `text-generation-inference` (etiquetas `text-generation-inference` y `endpoints_compatible`).
- Razonamiento, matemáticas, generación de código y capacidades multilingües: no hay información que permita confirmarlas ni descartarlas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponible. El modelo es exclusivamente de texto según las etiquetas publicadas.

## Casos de uso

- Investigación sobre promedio de checkpoints: el modelo permite comparar experimentalmente si la media ponderada de los pasos 0 a 4000 supera al checkpoint final (step4000) en perplejidad o en tareas concretas, reutilizando la configuración YAML publicada y variando los pesos.
- Evaluación de seguridad en modelos de lenguaje: el nombre del proyecto de origen (`Pan_Safety_Better_Measurement`) y el de la ejecución (`hyperstition_v1`) apuntan a un pipeline de medición de comportamientos de seguridad; este checkpoint puede emplearse como base para baterías de evaluación de sesgo, toxicidad o jailbreak, siempre que se documente la licencia.
- Ajuste fino con LoRA o QLoRA: con 6,86 B de parámetros, el modelo cabe en una GPU de 24 GB en bfloat16 para ajuste con adaptadores de rango bajo, o en GPUs de 12 GB con cuantización de 4 bits, lo que lo hace útil como banco de pruebas de recetas de ajuste.
- Prototipado de generación conversacional: para demos internas de chat donde no se requiera licencia comercial clara, el modelo puede servirse con vLLM o TGI y evaluarse cualitativamente antes de decidir si se sustituye por un modelo documentado.
- Estudio de dinámica de entrenamiento: al disponer de los checkpoints 0, 1000, 2000, 3000 y 4000, es posible analizar la evolución de los pesos, la norma de los tensores o la similitud entre pasos y correlacionarla con el resultado de la fusión.
- Comparativa de métodos de merge: sirve como caso de control frente a otros métodos implementados en mergekit (SLERP, TIES, DARE, passthrough) aplicados sobre la misma colección de checkpoints.
- Inferencia de bajo coste en hardware de consumo: con cuantización de 4 bits (aproximadamente 3,5-4 GB de pesos) puede ejecutarse en GPUs de gama media, previa conversión a un formato soportado por el motor de inferencia elegido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna evaluación (MMLU, HumanEval, GSM8K, HellaSwag u otras) ni métricas de perplejidad, y los resultados de búsqueda web obtenidos no contienen información relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada para los pesos, según precisión (solo pesos, sin caché KV ni activaciones):
  - bfloat16 / float16: aproximadamente 13,7 GB.
  - float32: aproximadamente 27,4 GB.
  - int8: aproximadamente 6,9 GB.
  - int4: aproximadamente 3,5-4 GB.
- La caché KV y el consumo de activaciones no pueden calcularse porque se desconoce la configuración de capas y la longitud de contexto máxima.
- GPU recomendadas en bfloat16: A100 40 GB, A100 80 GB, H100, L40S o cualquier GPU con 16 GB o más de VRAM y soporte de bfloat16 (por ejemplo, RTX 4090 de 24 GB).
- Cabe en GPU de consumo: sí. En bfloat16 cabe en RTX 4090 (24 GB) y RTX 4080 (16 GB) con margen ajustado; con cuantización int8 en GPUs de 10-12 GB; con cuantización int4 en GPUs de 8 GB.
- Opciones de despliegue: `transformers` (formato nativo safetensors), text-generation-inference (etiqueta declarada) y vLLM (compatibilidad con `gpt_neox` sujeta a verificación). Para llama.cpp u Ollama sería necesaria una conversión a GGUF que el repositorio no publica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este modelo (merge lineal de checkpoints) | 6,86 B | no disponible | no disponible | safetensors en HuggingFace, 0 descargas, 0 likes | sin benchmarks publicados |
| Pythia-6.9B (EleutherAI) | 6,9 B | 2048 tokens | Apache-2.0 | pesos públicos, ampliamente utilizada | benchmarks públicos; familia con checkpoints intermedios disponibles |
| Qwen2.5-7B (Alibaba) | 7,6 B | 128 000 tokens | Apache-2.0 | pesos públicos, múltiples cuantizaciones | benchmarks públicos de referencia |
| Llama-3.1-8B (Meta) | 8,03 B | 128 000 tokens | Llama 3.1 Community License | pesos públicos con registro, ecosistema amplio | benchmarks públicos de referencia |

Nota: los datos de los modelos comparativos proceden de conocimiento general y no de la informacion proporcionada en esta busqueda; conviene verificarlos en sus repositorios oficiales antes de citarlos. La comparación más significativa metodológicamente es Pythia-6.9B, por compartir la arquitectura GPT-NeoX y por publicar también checkpoints intermedios de un único entrenamiento.

## Limitaciones y advertencias

- Ausencia de licencia: la model card no especifica licencia, lo que impide determinar si el uso comercial está permitido. No debería utilizarse en producción sin aclarar este punto con el autor.
- Trazabilidad incompleta: la model card expone rutas internas de un sistema de ficheros (`/opt/tiger/Pan_Safety_Better_Measurement/...`) cuyos checkpoints fuente no son públicos. No es posible reproducir exactamente la fusión ni auditar el entrenamiento original.
- Riesgo de alucinación: no evaluado. No existe ningún informe de evaluación que cuantifique la fiabilidad factual del modelo.
- Sesgos: no documentados. Al desconocerse la composición del dataset de entrenamiento, no puede caracterizarse el sesgo demográfico, ideológico o lingüístico.
- Idiomas: no disponibles. No hay garantía de calidad fuera de los idiomas presentes en el corpus original, que se desconoce.
- Contexto: la longitud máxima de contexto no está publicada; asumir valores habituales de la familia GPT-NeoX (2048 tokens) sin confirmación puede provocar truncamientos o degradación inesperada.
- Validación nula por la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha, sin issues ni discusiones que permitan contrastar su comportamiento real.
- Naturaleza del artefacto: al tratarse de un promedio de checkpoints de una misma ejecución, el resultado puede degradar ligeramente capacidades presentes en el checkpoint final (step4000), especialmente con pesos normalizados sobre pasos tempranos poco entrenados.
- Metadatos dudosos: la fecha de creación declarada (2026-09-12) es posterior a la fecha habitual de consulta; conviene tratarla con cautela por si se trata de un error de metadatos o de un artefacto generado automáticamente.
- Conversión a GGUF no publicada: desplegar el modelo en llama.cpp u Ollama requiere realizar la conversión y validar la calidad resultante.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-0k_1k_2k_3k_4k_weightedavg_merge
- mergekit (herramienta de fusión): https://github.com/cg123/mergekit
- Método de fusión lineal (referencia de las etiquetas): https://arxiv.org/abs/2203.05482
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a un servicio administrativo danés sin relación con este repositorio.
