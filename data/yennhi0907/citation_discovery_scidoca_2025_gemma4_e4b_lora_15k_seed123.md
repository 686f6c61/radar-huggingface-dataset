# yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_15k_seed123

## Resumen

El modelo `yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_15k_seed123` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario yennhi0907 sobre el modelo base `google/gemma-4-E4B-it`. No se trata de un modelo completo, sino de un ajuste fino parametrizado eficiente (PEFT) que transforma el modelo base en un clasificador puntual de relevancia binaria (Yes/No) para pares formados por un párrafo y un artículo científico candidato. El adaptador se ha entrenado en el contexto de la tarea 1 (citation discovery) del taller SCIDOCA 2025 y forma parte de una tesis de máster sobre verificación automática de citas.

La relevancia de este adaptador reside en su enfoque especializado: en lugar de generar texto libre, reutiliza la cabeza de lenguaje del modelo Gemma para calcular la probabilidad de la respuesta "Yes" mediante un softmax sobre los logits de los tokens "Yes" y "No". Esto convierte al modelo en un juez de relevancia reutilizable en pipelines de recuperación y recomendación de citas científicas. El adaptador ocupa apenas 0,1 GB, lo que lo hace muy ligero de distribuir y desplegar junto al modelo base.

El entrenamiento se realizó sobre 15.000 párrafos de entrenamiento (`train_15k_nested`, que incluye el subconjunto de 5.000), con tres negativos aleatorios por positivo, y alcanzó un F1 de pares de 0,7973 en validación. El autor advierte explícitamente que el conjunto de entrenamiento histórico de SCIDOCA se solapa con el test oficial oculto, por lo que no se reporta ninguna métrica sobre dicho test para este adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base `google/gemma-4-E4B-it`) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no reporta recuento en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 512 tokens (MAX_LEN fijo con truncacion que preserva el sufijo del prompt) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango r=16, alpha=32 y dropout 0,05 sobre las proyecciones de query, key, value y output del modelo base `google/gemma-4-E4B-it`. El entrenamiento empleó una tasa de aprendizaje de 2e-4 con scheduler coseno, warmup del 10 %, weight decay de 0,01, batch size de 2 con acumulación de gradiente de 8, durante 2 épocas. La longitud máxima de secuencia se fijó en 512 tokens con una truncación que conserva el sufijo del prompt, lo que garantiza que la instrucción final y el par párrafo-candidato permanezcan intactos.

La innovación principal es el enfoque de clasificación puntual: en lugar de generar una respuesta, el modelo calcula `score = softmax(logits["Yes"], logits["No"])[Yes]`, es decir, la probabilidad de que el par párrafo-artículo sea relevante. El conjunto de datos `train_15k_nested` contiene 15.000 párrafos de entrenamiento (incluyendo el subconjunto de 5.000) con tres negativos aleatorios por positivo. El checkpoint seleccionado es el de mejor F1 de pares en validación (0,7973). El entrenamiento se ejecutó con semilla 123 sobre una GPU RTX 5090 en Vast.ai. El hash SHA-256 del adaptador es `78890aac7054e6089e067d930738659f93cfd3afab1a79afb577d393cdab7549`.

## Capacidades

- Clasificación binaria de relevancia (Yes/No) para pares párrafo-artículo científico, mediante probabilidad softmax sobre los logits de los tokens "Yes" y "No".
- Puntuación de relevancia continua (P(Yes)) reutilizable para ranking de candidatos.
- Integración en pipelines de recuperación de citas y recomendación académica.
- Funciona como adaptador PEFT sobre el modelo base Gemma-4 E4B-it, heredando las capacidades del modelo base cuando se carga junto a él.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking específicas para este adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada (dependen del modelo base y del dataset de entrenamiento, no documentado).

## Casos de uso

- Descubrimiento de citas científicas: dado un párrafo de un manuscrito, puntuar cada artículo candidato del corpus y seleccionar los de mayor P(Yes) para sugerir referencias relevantes. El adaptador está entrenado específicamente para esta tarea (SCIDOCA 2025 Task 1).
- Verificación automática de citas: comprobar si una cita existente en un texto es realmente relevante para el párrafo que la respalda, usando el score como señal de alerta para revisión editorial.
- Ranking en motores de búsqueda académica: reordenar los resultados de un retrieval inicial (por ejemplo, BM25 o embeddings) aplicando el juez puntual como etapa de re-ranking con un coste computacional bajo.
- Construcción de datasets de entrenamiento: usar el adaptador para etiquetar automáticamente pares párrafo-artículo como positivos o negativos y generar datos adicionales para otros modelos de recuperación.
- Asistencia a revisores y editores: señalar párrafos con citas potencialmente irrelevantes o candidatos no citados que deberían considerarse, agilizando la revisión bibliográfica.
- Filtrado en pipelines RAG académicos: descartar documentos recuperados que no sean relevantes para el fragmento de consulta antes de pasarlos al generador, reduciendo ruido y alucinaciones.
- Evaluación comparativa de sistemas de recomendación de citas: emplear el score P(Yes) como métrica auxiliar para comparar recuperadores o embeddings en experimentos de investigación.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| F1 de pares (validacion) | 0,7973 |
| F1 en test oficial | no reportado (solapamiento entre train historico de SCIDOCA y test oculto) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB, por lo que el requisito real de VRAM lo determina el modelo base `google/gemma-4-E4B-it`.
- VRAM estimada para inferencia: no disponible para el modelo base en la información proporcionada; depende del tamaño efectivo de Gemma-4 E4B y de la cuantización elegida.
- GPU recomendadas: el autor entrenó sobre una RTX 5090; para inferencia se recomienda una GPU con VRAM suficiente para el modelo base (no cuantificado en la información disponible).
- Compatibilidad con GPU de consumo: depende del modelo base; no se documenta en la información disponible.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base con `peft`), y por extensión los frameworks compatibles con el modelo base (vLLM, TGI, llama.cpp, Ollama) siempre que soporten la carga de adaptadores LoRA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Gemma-4 E4B LoRA, 15k) | LoRA r=16 sobre Gemma-4 E4B-it | 512 | Clasificador puntual Yes/No para citas | gemma | HuggingFace (0 descargas) |
| Adaptadores alternativos de SCIDOCA 2025 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos de re-ranking académico (p. ej. cross-encoders) | no disponible | no disponible | Re-ranking de pares | variable | no disponible |

No se dispone de información sobre otros adaptadores o modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El conjunto de entrenamiento histórico de SCIDOCA se solapa con el test oficial oculto, por lo que las métricas de validación (F1 0,7973) no son comparables con resultados sobre el test oficial; el autor no reporta número en test.
- La longitud de contexto está fijada en 512 tokens con truncación que preserva el sufijo del prompt; párrafos o candidatos más largos pueden perder información relevante.
- El adaptador es un clasificador binario especializado: no genera texto ni razona de forma general; su uso fuera de la tarea de relevancia párrafo-artículo no está validado.
- No se documentan sesgos conocidos, pero al depender de un corpus académico concreto puede heredar sesgos de dominio, idioma y disciplina.
- Riesgo de alucinación: bajo en el sentido generativo (no produce texto libre), pero el score P(Yes) puede ser sobreconfiado en pares ambiguos o fuera de distribución.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones de uso aceptable y obligaciones de atribución; revisar antes de desplegar en producción.
- El adaptador tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- No se documentan los idiomas soportados ni la composición lingüística del dataset de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_15k_seed123
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- SCIDOCA 2025: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
