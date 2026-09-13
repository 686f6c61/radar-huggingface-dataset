# yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-4k_5k_6k_7k_8k_simpleavg_merge

## Resumen

El modelo `sfm_filtered_e2e_insert_hyperstition_v1-4k_5k_6k_7k_8k_simpleavg_merge` es un artefacto de fusión (merge) de pesos publicado por el usuario `yuhengtu-bytedance` en HuggingFace. No se trata de un modelo entrenado desde cero, sino del resultado de combinar cinco checkpoints intermedios (global_step 4000, 5000, 6000, 7000 y 8000) de un mismo entrenamiento denominado `filtered_e2e_insert_hyperstition_v1`, aplicando el método de fusión lineal (Linear merge) implementado por mergekit, con normalización de pesos activada.

La arquitectura declarada en los tags de transformers es GPT-NeoX, es decir, un transformer decoder-only de tipo denso, con 6.856.253.440 parámetros totales (unos 6,86 mil millones). Los pesos se publican en precisión bfloat16 y el repositorio ocupa 13,7 GB en disco. La fusión se realizó tomando `global_step8000` como modelo base y promediando los cinco checkpoints con peso 1.0 cada uno y `normalize: true`, en dtype float32 con salida en bfloat16.

Su relevancia es limitada y fundamentalmente experimental: el repositorio acumula 0 descargas y 0 «likes», no declara licencia ni idiomas soportados, y su model card se limita a describir la receta YAML de la fusión. El nombre de las rutas internas (`Pan_Safety_Better_Measurement`, `filtered_e2e_insert_hyperstition`) sugiere que proviene de trabajos de investigación sobre medición de seguridad, pero no se aporta documentación al respecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only denso, tag `gpt_neox` de transformers) |
| Parametros totales | 6.856.253.440 (~6,86 mil millones) |
| Parametros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Pesos publicados en bfloat16; no se han publicado variantes GGUF, GPTQ, AWQ ni EXL2 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no incluye campo de licencia) |
| Formato de pesos | safetensors (bfloat16) |

Otros datos del repositorio: pipeline `text-generation`, librería `transformers`, tamaño del repo 13,7 GB, creado el 2026-09-13 y actualizado el mismo día. Etiquetas relevantes: `mergekit`, `merge`, `conversational`, `text-generation-inference`, `endpoints_compatible`, `region:us`.

## Arquitectura y entrenamiento

La arquitectura subyacente es GPT-NeoX, un transformer autoregresivo decoder-only con atención causal completa, sin componentes de mezcla de expertos ni capas recurrentes. Es la misma familia arquitectónica utilizada por GPT-NeoX-20B y Pythia, aunque aquí con aproximadamente 6,86 mil millones de parámetros. No se dispone de información sobre la configuración concreta (número de capas, dimensión oculta, número de cabezas de atención, tamaño de vocabulario ni función de activación) más allá del tag de arquitectura.

Respecto al entrenamiento, lo único documentado es el procedimiento de fusión, no el entrenamiento original. La model card indica que se aplicó el método Linear merge descrito en el artículo arXiv:2203.05482, tomando como base el checkpoint `global_step8000` y combinándolo con los pasos 4000, 5000, 6000 y 7000, todos con peso 1.0 y normalización activada. La fusión se ejecutó en float32 con salida en bfloat16. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por instrucciones. El prefijo `filtered` en el nombre del experimento sugiere un filtrado de datos, pero es una inferencia no confirmada.

## Capacidades

- Generación de texto autoregresiva: es la función principal declarada por el pipeline `text-generation`.
- Uso conversacional: el tag `conversational` sugiere adaptación o intención de uso en diálogo, aunque no se documenta ninguna plantilla de chat ni formato de prompt.
- Compatibilidad con `text-generation-inference` (TGI) y con endpoints de HuggingFace, según los tags del repositorio.
- No se ha documentado soporte de tool calling ni de function calling.
- No se ha documentado soporte de agentes, razonamiento multi-paso ni modo «thinking».
- No se ha documentado capacidad multilingüe ni lista de idiomas.
- No se ha documentado ninguna capacidad multimodal (visión, audio) ni de otro tipo.
- El tamaño de contexto es desconocido, por lo que no puede afirmarse soporte para ventanas largas.

## Casos de uso

- Investigación sobre fusión de modelos: el artefacto sirve como caso de estudio reproducible para analizar cómo el promediado lineal de checkpoints intermedios afecta a la calidad respecto a cualquiera de los checkpoints individuales, usando la configuración YAML publicada.
- Punto de partida para ajuste fino: al ser un modelo denso de ~6,86B en safetensors, puede cargarse con transformers y servir de base para fine-tuning supervisado o LoRA en tareas específicas, siempre que se resuelva antes la ambigüedad de licencia.
- Experimentos de evaluación de seguridad: dado el nombre del experimento de origen (`Pan_Safety_Better_Measurement`), puede emplearse como sujeto de pruebas en pipelines internos de red-teaming y medición de comportamiento, comparándolo con los checkpoints originales.
- Generación de texto en entornos de investigación: prototipado de generación condicionada en laboratorio donde no se requiera licencia comercial clara ni soporte de largo contexto.
- Servicio de inferencia autoalojado: puede desplegarse con TGI o vLLM para pruebas de throughput y latencia internas, aprovechando la compatibilidad declarada con `endpoints_compatible`.
- Docencia y divulgación técnica: ilustrar el flujo completo de mergekit (YAML, normalización, dtypes) con un ejemplo real de 13,7 GB.
- Base para comparativas de cuantización: sirve para medir la degradación de un modelo GPT-NeoX de ~6,9B al pasar de bfloat16 a 8 y 4 bits, aunque las versiones cuantizadas habría que generarlas uno mismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica (MMLU, HumanEval, GSM8K, HellaSwag ni similares), y los resultados de búsqueda web recuperados no guardan relación con el modelo. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 13,7 GB en disco y en VRAM (coincide con el tamaño del repositorio). Se necesita una GPU con al menos 16 GB de memoria para cargar los pesos, más margen para caché KV y activaciones.
- Cuantización a 8 bits: en torno a 7 GB de VRAM, viable en GPUs de 8-12 GB con margen limitado.
- Cuantización a 4 bits: en torno a 4-5 GB de VRAM, viable en GPUs consumer de 8 GB.
- GPUs consumer: cabe en bfloat16 en RTX 4090, RTX 3090, RTX A6000 y RTX 4080 (16 GB); en 4 bits cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y similares.
- GPUs de centro de datos: A100 40/80 GB, H100, L40S y A10G son suficientes con holgura; el modelo es pequeño para este segmento y permite lotes grandes.
- Opciones de despliegue: vLLM y text-generation-inference (TGI) son las vías naturales dado el formato safetensors y el tag `endpoints_compatible`. Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, tarea no documentada por el autor.
- Latencia y throughput: no disponibles. No hay cifras publicadas ni referencias del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sfm_filtered_e2e_insert_hyperstition_v1-...-merge | ~6,86B | No disponible | GPT-NeoX | No disponible | HuggingFace, 0 descargas |
| Pythia-6.9B | ~6,9B | 2048 tokens | GPT-NeoX | Apache 2.0 | HuggingFace, ampliamente usada |
| GPT-J-6B | ~6,05B | 2048 tokens | GPT-J | Apache 2.0 | HuggingFace, muy extendida |
| Mistral-7B-v0.1 | ~7,24B | 32 768 tokens | Transformer (GQA, sliding window) | Apache 2.0 | HuggingFace, muy extendida |

Pythia-6.9B es el comparable más cercano por arquitectura y número de parámetros. GPT-J-6B lo es por rango de tamaño y por ser un modelo de generación de texto de referencia en ese escalón. Mistral-7B-v0.1 lo es por tamaño y por ser el estándar de facto en el segmento de 7B, aunque con una arquitectura más moderna y una ventana de contexto muy superior. No se dispone de datos de rendimiento del modelo analizado, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no disponible: sin licencia declarada no puede asumirse permiso de uso comercial. Cualquier despliegue en producción requiere aclarar este punto con el autor.
- Ausencia total de model card sustantiva: solo hay una receta de fusión, sin información sobre datos de entrenamiento, sesgos, idiomas ni comportamiento esperado.
- Riesgo de alucinación: es un modelo de lenguaje generativo de ~6,9B sin ajuste por instrucciones documentado; la probabilidad de fabricar información es alta y no ha sido caracterizada.
- Idiomas desconocidos: no hay lista de idiomas soportados ni evaluación multilingüe. No debe asumirse un buen rendimiento en castellano.
- Contexto desconocido: al no documentarse la longitud de contexto, cualquier uso con prompts largos es especulativo.
- Posible contaminación por el origen del experimento: el nombre de las rutas internas sugiere manipulación deliberada de contenido (término «hyperstition», ligado a inserción de creencias ficticias). Antes de usar el modelo en cualquier aplicación orientada a usuarios debe auditarse su comportamiento.
- Adopción nula: 0 descargas y 0 «likes» en el momento del registro, lo que implica ausencia de validación por parte de terceros.
- Sin cuantizaciones publicadas: no existen GGUF, GPTQ ni AWQ verificadas, por lo que el uso en hardware limitado exige conversión manual y su propio proceso de validación.
- Fechas de creación futuras respecto a la mayoría de referencias: conviene verificar la integridad y el contenido real del repositorio antes de descargar 13,7 GB.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-4k_5k_6k_7k_8k_simpleavg_merge
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Artículo del método Linear merge: https://arxiv.org/abs/2203.05482
- Documentación de TGI: https://github.com/huggingface/text-generation-inference
- No se encontraron papers, blogs, demos ni repositorios adicionales asociados al modelo en los resultados de búsqueda disponibles.
