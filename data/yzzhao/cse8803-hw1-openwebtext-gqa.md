# yzzhao/cse8803-hw1-openwebtext-gqa

## Resumen

`yzzhao/cse8803-hw1-openwebtext-gqa` es un checkpoint educativo de un transformer decoder-only entrenado desde inicialización aleatoria por Yizhou Zhao para el trabajo opcional de la asignatura CSE 8803 (otoño de 2026). El modelo tiene 29.368.832 parámetros con embeddings y capa de salida atados, y se entrenó exclusivamente sobre el split de entrenamiento fijado de OpenWebText, sin ajuste por instrucciones ni alineación posterior. Su interés es fundamentalmente académico y de reproducibilidad: el repositorio publica el estado completo del optimizador, las configuraciones congeladas, el tokenizador y las métricas de evaluación, de modo que un tercero puede replicar el experimento.

Arquitectónicamente es un transformer decoder-only de 8 capas, anchura 512, 8 cabezas de consulta y 4 cabezas de clave/valor (GQA), con SwiGLU de anchura 1536, RMSNorm, RoPE y atención causal implementada a mano, sin sesgos ni dropout. La longitud de contexto es de 512 tokens y utiliza un tokenizador byte-BPE propio de 8192 tokens. La evaluación final en fp32 reporta una perplejidad por token de 10,2749 y 1,3886 bits por byte sobre 4.412.858 objetivos, por debajo del umbral B3 publicado del curso (1,4570227559150561).

Es relevante ahora como ejemplo reproducible de un pipeline completo de entrenamiento a pequeña escala (tokenizador propio, bf16 sobre una sola NVIDIA L40S, 786.432.000 tokens muestreados en 6000 actualizaciones) y como caso práctico de un artefacto que *no* sigue el formato estándar de Transformers: requiere el código del autor (`cs8803_hw1`) para cargarse. No es un asistente y no se reclama ninguna evaluación amplia de capacidades o seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA (8 cabezas de consulta, 4 de clave/valor), SwiGLU, RMSNorm, RoPE y atención causal manual; sin sesgos ni dropout |
| Parametros totales | 29.368.832 (embeddings de entrada y salida atados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible: solo se publica el checkpoint PyTorch original (fp32/bf16). No hay versiones GGUF, GPTQ, AWQ ni similar |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | Checkpoint PyTorch `.pt` con `model`, estado de AdamW, estado del scaler, estados de RNG, estado del generador de datos, paso y metadatos congelados. No es una serialización `AutoModel`/`AutoTokenizer` de Transformers |
| Tokenizador | Byte-BPE propio, 8192 tokens, token especial con ID 256 (fichero `tokenizer.json` con checksum canónico verificado) |
| Tamaño del repositorio | 0,4 GB |
| Paso de entrenamiento | 6000 actualizaciones de optimizador |
| SHA-256 del checkpoint | `cbcfbe6487bc0ca0e8901e2bbcd98f4a43cb46cc7125b75913af14908b142d60` |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de publicación | 21 de septiembre de 2026 (última actualización el mismo día) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas con anchura 512, 8 cabezas de consulta de dimensión 64 y 4 cabezas de clave/valor, lo que supone una ratio de group-query attention de 2:1 y reduce el coste de caché KV respecto a atención multi-cabeza completa. Emplea SwiGLU con anchura intermedia de 1536, RMSNorm, embeddings rotatorios (RoPE) y atención causal escrita a mano. No usa sesgos ni dropout, y ata los embeddings de entrada con la proyección de salida, lo que explica que los 29,37 M de parámetros incluyan el vocabulario de 8192 tokens. El tokenizador es un byte-BPE entrenado específicamente para este experimento, con token especial en el ID 256.

El entrenamiento partió de inicialización aleatoria con semilla 2026 y se ejecutó en bf16 sobre una única NVIDIA L40S, con AdamW, micro-lote de 8 y acumulación de gradientes de 32. Se realizaron 6000 actualizaciones de optimizador sobre 786.432.000 tokens muestreados. Los datos provienen exclusivamente del split de entrenamiento fijado de OpenWebText: de los 100.173 documentos de los shards fijados, los primeros 98.173 se usaron para entrenamiento y los últimos 2000 para validación. El checkpoint final se fijó de antemano en el paso 6000 en lugar de seleccionarse por el mejor resultado intermedio de validación. El autor advierte explícitamente de que esta ejecución de una sola semilla usa el doble del presupuesto de tokens de entrenamiento y de *warmup* que el B3 publicado, por lo que no constituye una comparación de arquitecturas con cómputo igualado. No se documenta RLHF, DPO ni ningún otro ajuste de alineación.

## Capacidades

- Generación de texto en inglés: continuación de secuencias de hasta 512 tokens con un modelo autorregresivo causal.
- Modelado de lenguaje a pequeña escala: la tarea para la que fue entrenado es la predicción del siguiente token sobre OpenWebText; no está ajustado por instrucciones.
- Ninguna capacidad demostrada de razonamiento complejo, matemáticas, código o resolución de problemas: la model card no reclama evaluación de capacidades.
- Sin soporte de *tool calling* ni *function calling*.
- Sin soporte de agentes ni razonamiento multi-paso.
- Multilingüismo: únicamente inglés; no se declara ningún otro idioma.
- Sin modo *thinking*, sin visión, sin audio y sin modalidades adicionales.
- Reproducibilidad: permite reproducir exactamente el estado de entrenamiento (optimizador, RNG, generador de datos) y reanudar el entrenamiento con el mismo manifiesto empaquetado.

## Casos de uso

- Reproducción de experimentos académicos: cargar `checkpoint_step_6000.pt` con `cs8803_hw1.train.load_training_checkpoint` y el manifiesto empaquetado coincidente para verificar métricas o continuar el entrenamiento desde el paso 6000 con el mismo estado de optimizador y RNG.
- Estudio de Group-Query Attention en modelos pequeños: la configuración 8Q/4KV con dimensión de cabeza 64 permite analizar el compromiso entre coste de caché KV y calidad frente a atención multi-cabeza en un presupuesto de 29,37 M de parámetros.
- Enseñanza de pipeline completo de tokenización: el repositorio incluye `tokenizer.json` con un byte-BPE de 8192 tokens y checksum canónico, útil como caso de estudio de entrenamiento de tokenizadores y de su impacto en la perplejidad por token.
- Referencia de implementación en PyTorch puro: sirve como línea base para comparar una implementación manual (atención causal manual, SwiGLU, RMSNorm, RoPE) contra implementaciones de bibliotecas de alto nivel.
- Pruebas de infraestructura y *smoke tests*: con 29,37 M de parámetros y 512 tokens de contexto, es adecuado para validar pipelines de carga de checkpoints, evaluación con ventanas solapadas por bytes o rutinas de *checksum* en entornos con recursos limitados.
- Análisis de sesgos y de calidad de corpus en modelos pequeños entrenados con OpenWebText: al ser un modelo sin ajuste por instrucciones y con datos acotados, permite medir qué sesgos y qué distribución lingüística se aprenden en un presupuesto de cómputo bajo.
- Evaluación de métricas intrínsecas por byte (BPB): el protocolo publicado (4.412.858 objetivos sobre 10.680.873 bytes brutos, ventanas de 512 objetivos, un solo pase) puede reutilizarse para comparar tokenizadores distintos sobre el mismo corpus.

## Benchmarks y rendimiento

La model card solo publica métricas de evaluación intrínseca en fp32 (perplejidad y bits por byte). No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de capacidades.

| Métrica | Valor |
|---|---|
| Mean NLL (nats/token) | 2,329701203800564 |
| Perplejidad por token | 10,274870981932695 |
| Bits por byte (BPB) | 1,388634543569715 |
| Umbral B3 publicado por el curso | 1,4570227559150561 (el modelo queda por debajo) |
| Objetivos evaluados | 4.412.858 |
| Bytes brutos | 10.680.873 |
| Condiciones | fp32, ventanas consecutivas de como máximo 512 objetivos, cada objetivo puntuado una sola vez |
| Semillas | 1 (advertencia del autor: no es una comparación con cómputo igualado) |

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: el peso del modelo es de aproximadamente 117 MB en fp32 y 59 MB en bf16/fp16 (29,37 M de parámetros). El consumo total en inferencia depende del *framework* y de la caché KV; con 512 tokens de contexto y GQA (4 cabezas KV, dimensión 64) la caché KV es del orden de decenas de MB como máximo.
- GPU recomendadas: no hay requisitos publicados. Por tamaño, cualquier GPU con al menos 1 GB de memoria libre es suficiente para inferencia; el entrenamiento documentado se realizó en una NVIDIA L40S.
- Compatibilidad con GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo actual (por ejemplo, RTX 3060, RTX 4060, RTX 4090), e incluso en CPU para inferencia, dado el reducido número de parámetros.
- Opciones de despliegue: el repositorio no es una serialización de Transformers, por lo que **no** es cargable directamente con vLLM, TGI, Ollama, llama.cpp ni `AutoModel`. Requiere instalar el código `cs8803_hw1` entregado por el autor y usar `cs8803_hw1.model.TransformerLM` junto con `cs8803_hw1.generate.generate`.
- Latencia y throughput: no disponible. No se han publicado medidas de latencia ni de tokens por segundo.
- Nota de seguridad: la carga del checkpoint se realiza con `torch.load(..., weights_only=False)`, ya que el fichero contiene estado de optimizador y de RNG; conviene tratar el artefacto como formato de checkpoint de entrenamiento de confianza y verificar `SHA256SUMS` antes de cargarlo.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables en la información proporcionada, ni de una comparación publicada por el autor. La tabla recoge únicamente dimensiones estructurales verificables; las celdas sin dato confirmado se marcan como no disponibles.

| Modelo | Parámetros | Contexto | Tipo de atención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yzzhao/cse8803-hw1-openwebtext-gqa` | 29,37 M | 512 | GQA (8Q/4KV) | No disponible | Checkpoint PyTorch en HuggingFace; requiere código externo |
| GPT-2 small | 124 M | 1024 | Atención multi-cabeza completa | No disponible en la información consultada | Pesos públicos en formato Transformers |
| Alternativas del mismo curso (por ejemplo, ejecuciones TinyStories) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Comparación de rendimiento (perplejidad, MMLU, HumanEval, GSM8K) | No disponible: no hay datos comparables publicados en la información disponible | | | | |

## Limitaciones y advertencias

- No es un asistente ajustado por instrucciones: es un modelo de lenguaje base entrenado desde cero, por lo que no sigue instrucciones ni mantiene formatos conversacionales de forma fiable.
- La model card declara explícitamente que no se reclama ninguna evaluación amplia de capacidades ni de seguridad. Cualquier uso generativo en producción debe tratarse como experimental.
- Idioma único: solo inglés. No hay soporte multilingüe ni evaluación en otras lenguas.
- Contexto muy corto: 512 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o tareas de recuperación sobre contextos amplios.
- Sesgos conocidos: no documentados por el autor. Al entrenarse únicamente con OpenWebText (contenido web enlazado desde Reddit), es esperable heredar los sesgos y la distribución de ese corpus, pero no hay análisis publicado en la información disponible.
- Riesgo de alucinación: alto en cualquier uso generativo abierto; no hay ajuste de alineación, filtrado de salidas ni evaluación de veracidad.
- Licencia: la model card no declara licencia, por lo que el uso comercial queda en situación jurídica indeterminada. Debe consultarse al autor antes de cualquier uso más allá del académico.
- Validez estadística limitada: resultados de una sola semilla y un único split fijo; la perplejidad por token es específica de este tokenizador y no es directamente comparable con modelos que usan otro vocabulario (para eso está el BPB).
- Advertencia del propio autor: la ejecución usa el doble del presupuesto de tokens y de *warmup* del B3 publicado, por lo que no sirve como comparación de arquitecturas con cómputo igualado.
- Dependencia de código no redistribuido: el repositorio no incluye el código de la asignatura, los conjuntos de datos crudos o empaquetados ni los registros privados. Sin `code.zip` del autor y el *release* original del curso, no es posible cargar el modelo ni reproducir la evaluación (el dataset fijado no se redistribuye).
- Reproducibilidad parcial: los ficheros `metrics.json`, `reproducibility.json` y `SHA256SUMS` permiten verificar la identidad de los artefactos, pero la reproducción exacta de la evaluación requiere el dataset fijado del curso.
- Divulgación de uso de IA: la model card indica que el uso de asistencia por IA en implementación, preparación de experimentos, informes y publicación se declara en el `ai_disclosure.md` de la asignatura, que no se incluye aquí.
- Formato no estándar: al no ser una serialización de Transformers, se pierden las ventajas de ecosistema (cuantización, servidores de inferencia, herramientas de medición) sin trabajo adicional de adaptación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yzzhao/cse8803-hw1-openwebtext-gqa
- Dataset de entrenamiento: https://huggingface.co/datasets/Skylion007/openwebtext
- No se han encontrado en la búsqueda web enlaces relevantes adicionales (papers, blogs, repositorios o demos) asociados a este modelo; los resultados devueltos corresponden a páginas genéricas sin relación con el artefacto.
