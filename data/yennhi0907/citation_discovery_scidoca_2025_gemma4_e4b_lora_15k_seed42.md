# yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_15k_seed42

## Resumen

El modelo `yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_15k_seed42` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `google/gemma-4-E4B-it`. Lo desarrolla el usuario `yennhi0907` en el contexto de un trabajo de fin de máster sobre verificación automática de citas, y está especializado en una única tarea: actuar como juez puntual de relevancia (pointwise relevance judge) que decide, para un par formado por un párrafo y un artículo candidato, si el candidato es o no relevante como cita para ese párrafo. La decisión se obtiene calculando un softmax sobre los logits de los tokens "Yes" y "No" y tomando la probabilidad de "Yes".

El adaptador se ha entrenado con el conjunto `train_15k_nested` (15.000 párrafos de entrenamiento, que contienen el subconjunto de 5k), con tres negativos aleatorios por cada positivo. El checkpoint publicado corresponde a la mejor época según la F1 de pares en validación, con un valor de 0,7824. Es relevante para quien trabaje en recuperación y recomendación de literatura científica, ya que ofrece una pieza reutilizable de reranking semántico sobre un modelo Gemma de última generación, aunque con la advertencia explícita de que el conjunto histórico de SCIDOCA se solapa con el test oculto oficial y, por tanto, no se reporta métrica sobre ese test.

El repositorio es pequeño (0,1 GB), contiene únicamente los pesos del adaptador en formato safetensors y se distribuye bajo la licencia Gemma, heredada del modelo base. No se han publicado datos sobre idiomas soportados, pipeline de inferencia ni benchmarks adicionales más allá de la F1 de validación mencionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `google/gemma-4-E4B-it` |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base no se detalla en la información) |
| Parámetros activos | no disponible |
| Longitud de contexto | 512 tokens (MAX_LEN de entrenamiento, truncación fija que conserva el sufijo del prompt); contexto nativo del modelo base no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (`adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA con rango r=16, alpha=32 y dropout 0,05 aplicado a las proyecciones q, k, v y o del modelo base `google/gemma-4-E4B-it`. La tarea se formula como clasificación binaria puntual: dado un par (párrafo, artículo candidato), el modelo produce logits para los tokens "Yes" y "No" y la puntuación de relevancia es P(Yes) tras aplicar softmax. El entrenamiento usa el conjunto `train_15k_nested` con 15.000 párrafos y tres negativos aleatorios por positivo, lo que configura un esquema de negativos por muestreo aleatorio sin minería dura documentada.

Los hiperparámetros son: learning rate 2e-4 con scheduler coseno, warmup del 10 %, weight decay 0,01, batch efectivo de 16 (batch 2 × acumulación de gradiente 8) y 2 épocas. La longitud máxima se fija en 512 tokens con truncación que preserva el sufijo del prompt. El checkpoint publicado es el de mejor época según F1 de pares en validación (0,7824), con semilla 42, entrenado en una NVIDIA L4 de Google Cloud Platform. El SHA-256 de `adapter_model.safetensors` es `aeceb935f7b8be5e1eab253d847bb40a5d2b38866eb2383f02649e7c98958eea`.

## Capacidades

- Evaluación de relevancia cita-párrafo: clasifica pares (párrafo, artículo candidato) como relevantes o no mediante una puntuación P(Yes) continua.
- Reranking de candidatos: al producir una probabilidad calibrada, puede ordenar una lista de artículos candidatos recuperados previamente por un sistema de búsqueda.
- Formulación Yes/No controlada: la salida se restringe a dos tokens, lo que simplifica la integración en pipelines de decisión.
- Funcionamiento sobre el modelo instruct `google/gemma-4-E4B-it`, por lo que hereda las capacidades del base, aunque el adaptador está especializado en la tarea de relevancia.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Reranking en un sistema de descubrimiento de citas: tras una recuperación inicial (por ejemplo, BM25 o embeddings), el adaptador puntúa cada par párrafo-candidato y permite reordenar los resultados por P(Yes), mejorando la precisión de la lista final.
- Asistencia a la revisión bibliográfica: dado un borrador de artículo, el sistema propone candidatos y el adaptador filtra los que realmente respaldan cada afirmación, reduciendo el trabajo manual del investigador.
- Verificación de citas existentes: comprobar si la referencia adjunta a una afirmación es coherente con el contenido del párrafo, señalando posibles citas mal atribuidas.
- Construcción de datasets de entrenamiento: usar las puntuaciones del adaptador para etiquetar automáticamente pares y generar negativos duros para futuros entrenamientos.
- Integración en gestores de referencias: complementar herramientas tipo Zotero o Mendeley con una sugerencia contextual de citas basada en el texto seleccionado.
- Evaluación comparativa de recuperadores: emplear el adaptador como juez automático para medir la calidad de distintos sistemas de recuperación científica sobre un mismo corpus.
- Filtrado en pipelines de generación aumentada por recuperación (RAG) científicos: descartar documentos recuperados que no sean pertinentes antes de pasarlos al generador, reduciendo alucinaciones por contexto irrelevante.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto |
|---|---|---|
| F1 de pares (validación) | 0,7824 | Validación del conjunto `train_15k_nested` |

No se han publicado resultados de benchmarks sobre el test oculto oficial de SCIDOCA 2025 en la información disponible, y el autor indica explícitamente que el conjunto histórico de entrenamiento se solapa con ese test, por lo que no se reporta métrica oficial. Tampoco hay comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB; requiere cargar el modelo base `google/gemma-4-E4B-it` para inferencia.
- VRAM estimada: no disponible en la información proporcionada (depende del tamaño y cuantización del modelo base, no documentados aquí).
- GPU recomendadas: no disponible; el entrenamiento se realizó en una NVIDIA L4.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: al ser un adaptador PEFT en safetensors, es compatible con el ecosistema Hugging Face Transformers y PEFT; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros adaptadores o modelos comparables de la misma tarea, ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Solapamiento de datos: el conjunto histórico de entrenamiento de SCIDOCA se solapa con el test oculto oficial, por lo que la F1 de validación (0,7824) no es directamente extrapolable al test oficial.
- Especialización estrecha: el adaptador solo resuelve la tarea de relevancia cita-párrafo; no es un modelo de propósito general.
- Ventana limitada a 512 tokens en entrenamiento, con truncación que preserva el sufijo del prompt; párrafos o candidatos más largos pueden perder información.
- Negativos aleatorios: no se documenta minería de negativos duros, lo que puede limitar la discriminación frente a candidatos temáticamente cercanos pero no relevantes.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma del modelo base; conviene revisarlos antes de un despliegue en producción.
- Riesgo de alucinación: aunque la salida se restringe a Yes/No, la puntuación puede ser poco fiable fuera de la distribución de entrenamiento (dominio científico y formato de pares similar).
- Idiomas soportados no documentados; se desconoce el comportamiento en textos científicos en castellano u otras lenguas.
- Sesgos: no se documentan análisis de sesgo; al depender del modelo base, puede heredar sesgos de este.
- Repositorio sin descargas ni likes y sin pipeline declarado; madurez y mantenimiento inciertos.

## Enlaces

- Hugging Face: https://huggingface.co/yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_15k_seed42
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
