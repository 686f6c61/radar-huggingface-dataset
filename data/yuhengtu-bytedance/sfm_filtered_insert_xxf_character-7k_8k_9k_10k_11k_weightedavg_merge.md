# yuhengtu-bytedance/sfm_filtered_insert_xxf_character-7k_8k_9k_10k_11k_weightedavg_merge

## Resumen

Este repositorio contiene un modelo de lenguaje publicado por el usuario `yuhengtu-bytedance` que no es un modelo entrenado desde cero, sino el resultado de una fusión de pesos (*merge*) de cinco checkpoints intermedios de un mismo entrenamiento, generada con la herramienta mergekit mediante el método Linear. Los checkpoints de origen están identificados únicamente por rutas locales de un sistema de ficheros (`/opt/tiger/Pan_Safety_Better_Measurement/merge_scaling_ckpts_cache/source_ckpts/filtered_insert_xxf_character/global_step...`) correspondientes a los pasos 7.000, 8.000, 9.000, 10.000 y 11.000, con pesos crecientes de 1 a 5 y normalización activada. El checkpoint del paso 11.000 actúa como base y recibe el peso mayor, de modo que el resultado se aproxima a los estados tardíos del entrenamiento pero suavizado con los intermedios.

El modelo declara 6.856.253.440 parámetros totales (unos 6,86 mil millones) según los pesos en safetensors, y el tag de arquitectura es `gpt_neox`, lo que sitúa al modelo en la familia de transformadores decoder-only tipo GPT-NeoX (atención con RoPE, atención y MLP en paralelo, sin sesgos en las capas lineales). No se especifica la longitud de contexto, los idiomas soportados ni la licencia, y la model card no incluye ninguna evaluación, dataset de entrenamiento ni descripción del modelo base real.

Su relevancia es limitada y de carácter casi exclusivamente experimental: se trata de un artefacto de investigación interna (0 descargas y 0 likes en el momento de la consulta) orientado a estudiar la interpolación de checkpoints y, a juzgar por los nombres de las rutas y los tags `conversational` y `merge`, a explorar el comportamiento conversacional o de personaje de una serie de checkpoints de seguridad. No hay evidencia publicada de que supere a sus checkpoints de origen ni a ningún modelo de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-NeoX (tag `gpt_neox`); configuración de capas y cabezas no disponible |
| Parámetros totales | 6.856.253.440 (~6,86 B) |
| Parámetros activos | No aplica; no hay indicios de arquitectura MoE en los tags disponibles |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se publican versiones cuantizadas; los pesos del repo están en bfloat16. Compatible con cuantización posterior (GGUF, GPTQ, AWQ) mediante herramientas externas, sin recetas oficiales |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no se declara licencia en la model card ni en los metadatos) |
| Formato de pesos | safetensors (salida en bfloat16; la fusión se calculó en float32 y se exportó a bfloat16) |

Otros datos verificables del repositorio: tamaño del repo 13,7 GB, librería `transformers`, pipeline `text-generation`, tags `mergekit`, `merge`, `conversational`, `text-generation-inference`, `endpoints_compatible`, `arxiv:2203.05482` y `region:us`. Fechas de creación y actualización: 2026-09-13.

## Arquitectura y entrenamiento

No hay información sobre el entrenamiento original: la model card no indica número de tokens, composición del dataset, fases de ajuste (SFT, RLHF, DPO) ni procedencia de los checkpoints. Lo único documentado es el proceso de fusión. Se trata de un merge lineal (*Linear*, variante de promedio ponderado de pesos citada en mergekit con la referencia arXiv:2203.05482) con `normalize: true`, en el que se combinan cinco checkpoints del mismo run de entrenamiento con pesos 1, 2, 3, 4 y 5 para los pasos 7.000, 8.000, 9.000, 10.000 y 11.000 respectivamente. El checkpoint del paso 11.000 se usa además como base explícita. La fusión se realizó en float32 y se exportó en bfloat16.

Arquitectónicamente, el tag `gpt_neox` apunta a un transformador decoder-only con normalización tipo LayerNorm, embeddings posicionales rotatorios (RoPE), atención causal y bloques con atención y MLP paralelos, sin términos de sesgo en las proyecciones. El recuento de 6,856 mil millones de parámetros es coherente con la clase de modelos de ~6,9 B basados en esta arquitectura. No obstante, al no estar disponible el `config.json` ni la model card del checkpoint base, no es posible confirmar número de capas, dimensión oculta, número de cabezas, tamaño de vocabulario ni ventana de contexto. El nombre del directorio de origen (`filtered_insert_xxf_character`) sugiere un ajuste orientado a personaje o conversación sobre datos filtrados, y la ruta padre (`Pan_Safety_Better_Measurement`) sugiere un contexto de investigación en medición de seguridad, pero ninguno de estos extremos está documentado por el autor.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad confirmada por el pipeline declarado (`text-generation`).
- Conversación multi-turno: el tag `conversational` indica que el modelo está pensado para diálogo, aunque no se documenta el formato de prompt ni las plantillas de chat.
- Interpretación de personaje o rol: el nombre del checkpoint de origen incluye `character`, lo que apunta a un ajuste para mantener una persona o personaje consistente, sin especificaciones publicadas.
- Razonamiento, matemáticas y código: no disponible; no hay evaluaciones ni declaraciones al respecto.
- Tool calling / function calling: no disponible; no se documenta soporte de herramientas ni de plantillas de funciones.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingüismo: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible. No hay torre de visión ni módulo de audio en los tags.
- Compatibilidad de despliegue: al ser safetensors de `transformers`, es cargable con la librería `transformers` y con servidores compatibles con `text-generation-inference` y endpoints, según los tags.

## Casos de uso

- Investigación en *model merging* y escalado de checkpoints: el artefacto sirve para reproducir y analizar si el promedio ponderado de checkpoints intermedios (pasos 7.000 a 11.000) produce una curva de pérdida más suave o mejor generalización que el checkpoint final. Es su uso más natural dado que el repositorio es, en esencia, un experimento de interpolación.
- Estudio de la dinámica de entrenamiento: al conservar los pesos de cinco pasos distintos combinados linealmente, permite comparar el comportamiento del modelo fusionado frente a cada checkpoint individual en tareas de evaluación internas.
- Prototipado de asistentes conversacionales con personaje: el tag `conversational` y el nombre `character` lo orientan a diálogos con personalidad fija; se usaría en entornos internos de prueba, sin exponerlo a usuarios finales sin una evaluación previa de sesgos y alucinaciones.
- Generación creativa y narrativa: escritura de relatos o diálogos de ficción manteniendo una voz concreta, siempre que se valide la coherencia a lo largo de conversaciones largas.
- Base para ajuste fino posterior con LoRA o QLoRA: al ser un modelo de ~6,9 B en safetensors, puede servir como punto de partida para un ajuste supervisado específico de dominio sobre una GPU de 24 GB en cuantización de 4 bits.
- Investigación en seguridad y alineación: la ruta de origen (`Pan_Safety_Better_Measurement`) sugiere que el modelo se empleó en experimentos de medición de seguridad; un uso razonable es evaluar tasas de respuestas inseguras, sesgos o fuga de información de personaje en comparación con los checkpoints de origen.
- Servicio interno de inferencia para pruebas A/B: desplegado con vLLM o TGI sobre una A100 o H100, puede compararse contra otros checkpoints del mismo run para decidir cuál promover, midiendo latencia, throughput y calidad percibida.
- Análisis de robustez ante prompts adversarios: al ser un modelo no alineado de forma documentada, resulta útil como caso de estudio de cómo un ajuste de personaje interactúa con intentos de *jailbreak*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y la búsqueda web realizada no devolvió documentación técnica, paper ni informe asociado a este repositorio. Tampoco se dispone de resultados de los checkpoints de origen, por lo que no es posible afirmar ni refutar una mejora por la fusión.

## Requisitos de hardware

- VRAM estimada en bfloat16/float16: aproximadamente 13,7 GB solo para los pesos (coincide con el tamaño del repo), más caché KV y activaciones; en la práctica se necesitan del orden de 16-20 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~7-8 GB de pesos; en 4 bits: ~4-5 GB.
- GPU recomendadas para bfloat16 con contexto amplio: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) en bfloat16 con contextos cortos o moderados; en RTX 4080/4070 Ti (16 GB) o RTX 3080 (10-12 GB) es necesario recurrir a 8 bits o 4 bits.
- Despliegue: `transformers` (carga directa), vLLM y TGI (tags `text-generation-inference` y `endpoints_compatible`). Para llama.cpp u Ollama sería necesario convertir los pesos safetensors a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna GPU.

## Comparativa con modelos similares

No hay datos publicados de este modelo (contexto, licencia, benchmarks) que permitan una comparación cuantitativa. La tabla siguiente contrasta únicamente lo que sí se conoce del repositorio frente a modelos públicos de tamaño comparable de la misma familia arquitectónica o del mismo rango de parámetros; los datos de los modelos de referencia proceden de sus fichas públicas y no de la información proporcionada por este repositorio.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos | Benchmarks publicados |
|---|---|---|---|---|---|
| sfm_filtered_insert_xxf_character (este merge) | 6,86 B | No disponible | No disponible | safetensors en HF | No |
| Pythia-6.9B (EleutherAI) | ~6,9 B | 2.048 tokens | Apache 2.0 | safetensors + GGUF de terceros | Sí (suite de evaluación de Pythia) |
| Mistral-7B-v0.1 | ~7,2 B | 32.768 tokens | Apache 2.0 | safetensors + GGUF | Sí |
| Falcon-7B | ~7,2 B | 2.048 tokens | Apache 2.0 | safetensors | Sí |

La comparación relevante no es de rendimiento —no hay datos— sino de trazabilidad y licencia: los tres modelos de referencia declaran licencia permisiva, contexto y resultados de evaluación, mientras que este merge no documenta ninguno de esos extremos. Si el objetivo es producción, cualquiera de los tres ofrece garantías legales y técnicas muy superiores.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no hay autorización explícita de uso comercial, modificación ni redistribución. En la práctica, la ausencia de licencia equivale a reserva de todos los derechos por parte del titular, lo que desaconseja su uso en producción.
- Procedencia opaca: los modelos fusionados se identifican mediante rutas locales (`/opt/tiger/...`), no mediante identificadores de HuggingFace. No se conoce el modelo base real, ni su tokenizador, ni su dataset, lo que impide auditar la cadena de entrenamiento.
- Riesgo de alucinación: no evaluado. Al no haber benchmarks ni pruebas de veracidad, se debe asumir una tasa de alucinación desconocida y potencialmente alta, habitual en modelos de ~7 B sin ajuste de instrucciones documentado.
- Sesgos: no evaluados. Los sesgos heredados del modelo base y, en su caso, del ajuste de personaje son desconocidos; no hay ninguna declaración de mitigación.
- Contexto e idiomas sin especificar: se desconoce la ventana máxima soportada y si el modelo funciona correctamente en castellano. No se debe asumir un rendimiento multilingüe.
- Fusión de pesos sin validación: el autor no publica comparación entre el modelo fusionado y los checkpoints de origen, por lo que no hay evidencia de que la interpolación aporte mejora alguna; el promedio lineal puede degradar capacidades específicas.
- Formato de prompt desconocido: aunque el tag `conversational` sugiere diálogo, no se documenta ninguna plantilla de chat, por lo que el comportamiento en conversación puede ser errático con formatos arbitrarios.
- Ausencia de adopción: 0 descargas y 0 likes implican que el modelo no ha sido probado por terceros; no existe retroalimentación de la comunidad sobre su comportamiento real.
- Sin soporte de herramientas ni agentes: no hay indicios de soporte de function calling, por lo que no es adecuado para pipelines de agentes sin verificación previa.
- Uso responsable: dado su posible origen en experimentos de seguridad y personaje, no debería exponerse directamente a usuarios finales sin filtros de entrada y salida.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_insert_xxf_character-7k_8k_9k_10k_11k_weightedavg_merge
- mergekit (herramienta utilizada para la fusión): https://github.com/cg123/mergekit
- Método Linear de mergekit, basado en el paper de *model soups*: https://arxiv.org/abs/2203.05482
- Documentación de TGI (compatible según los tags del repositorio): https://github.com/huggingface/text-generation-inference

La búsqueda web realizada no devolvió ningún resultado pertinente sobre este modelo, su autor o el experimento asociado; los únicos resultados obtenidos fueron páginas de soporte técnico de Microsoft sin relación con el contenido de la ficha. No se dispone, por tanto, de paper, blog, demo ni repositorio adicional del autor.
