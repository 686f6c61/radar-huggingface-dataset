# yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_15k_seed456

## Resumen

El modelo `yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_15k_seed456` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `google/gemma-4-E4B-it`. Lo desarrolla el usuario yennhi0907 en el contexto de un trabajo de fin de máster sobre verificación automática de citas bibliográficas, y su función concreta es actuar como juez puntual de relevancia (pointwise Yes/No relevance judge) para pares formados por un párrafo y una publicación candidata. El adaptador se enmarca en la tarea 1 (citation discovery) de la competición SCIDOCA 2025.

Técnicamente, el adaptador no genera texto libre: calcula la probabilidad de que una candidata sea relevante aplicando softmax sobre los logits de los tokens "Yes" y "No", y tomando P(Yes) como puntuación. Se entrenó con 15.000 párrafos de entrenamiento (`train_15k_nested`, que contiene el subconjunto de 5k) y tres negativos aleatorios por positivo. El checkpoint publicado corresponde a la mejor época según F1 de pares en validación (0,7778, obtenida en la época 1).

Su relevancia es acotada pero clara: es un artefacto de investigación reproducible (semilla 456, hash SHA-256 del adaptador publicado) que demuestra un enfoque de bajo coste para el filtrado de candidatas en pipelines de descubrimiento de citas, reutilizando un modelo base Gemma de cuarta generación en lugar de entrenar un clasificador desde cero. El repositorio pesa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `google/gemma-4-E4B-it` |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base no se detalla en la información proporcionada) |
| Parámetros activos | no disponible |
| Longitud de contexto | 512 tokens (MAX_LEN de entrenamiento, truncación fija que preserva el sufijo del prompt) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango r=16 y alpha=32, dropout 0,05, sobre las proyecciones q, k, v y o del modelo base `google/gemma-4-E4B-it`. El entrenamiento usó LR 2e-4 con scheduler coseno, warmup del 10 %, weight decay 0,01, batch de 2 con acumulación de gradiente de 8, durante 2 épocas, con MAX_LEN fijo de 512 tokens y truncación que conserva el sufijo del prompt. Se ejecutó en una RTX 5090 en Vast.ai con semilla 456.

Los datos proceden del conjunto `train_15k_nested` (15.000 párrafos, que incluye el subconjunto de 5k), con tres negativos aleatorios muestreados por cada positivo. La formulación de la tarea es pointwise: el modelo puntúa cada par párrafo-candidata de forma independiente, en lugar de rankear listas. No se menciona en la información disponible el uso de RLHF, DPO ni otras fases de alineación adicionales; el ajuste es supervisado sobre la señal binaria de relevancia. El checkpoint publicado es el de mejor F1 de pares en validación (0,7778, época 1).

## Capacidades

- Juicio de relevancia binario (Yes/No) para pares párrafo-publicación candidata, con puntuación continua P(Yes) obtenida por softmax sobre los logits de ambos tokens.
- Descubrimiento de citas (citation discovery): selección de candidatas relevantes en un corpus bibliográfico.
- Filtrado y ranking de candidatas mediante umbralización de la puntuación P(Yes).
- Procesamiento de entradas de hasta 512 tokens (párrafo más metadatos de la candidata), con truncación que preserva el sufijo del prompt.
- Reproducibilidad: semilla fija (456) y hash SHA-256 del adaptador publicado.
- No se documentan en la información disponible capacidades de generación libre, tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Descubrimiento de citas en revisión sistemática: dado un párrafo de un manuscrito y un conjunto de publicaciones candidatas recuperadas de un buscador académico, el adaptador puntúa cada par y permite ordenar o filtrar las candidatas antes de la revisión humana.
- Asistencia a autores en la redacción de bibliografía: integrado en un editor, sugiere publicaciones relevantes para un párrafo concreto aplicando un umbral sobre P(Yes) y presentando solo las que superan dicho umbral.
- Segunda etapa de un pipeline de recuperación (re-ranking): tras una fase de recuperación léxica o densa que devuelve decenas de candidatas, el adaptador actúa como juez puntual para reordenarlas con bajo coste computacional.
- Verificación de citas existentes: comprobar si una referencia ya incluida en un manuscrito es realmente relevante para el párrafo que la cita, marcando posibles citas desalineadas.
- Construcción de conjuntos de datos de relevancia: usar las puntuaciones del adaptador como etiquetas débiles para entrenar o evaluar clasificadores de relevancia en dominios científicos.
- Experimentación académica reproducible: servir de línea base en trabajos sobre citation discovery, gracias a la semilla fija, el hash publicado y la configuración de entrenamiento documentada.
- Filtrado previo en bases de conocimiento bibliográficas: descartar candidatas con P(Yes) muy baja antes de un paso de anotación humana, reduciendo el coste de revisión.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| F1 de pares (validación) | 0,7778 | Mejor época (época 1) |
| F1 en test oficial | no disponible | El conjunto de entrenamiento histórico de SCIDOCA se solapa con el test oculto oficial, por lo que el autor no reporta cifra de test |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base `google/gemma-4-E4B-it` y de la cuantización elegida, no del adaptador (0,1 GB).
- GPU recomendadas: no disponible. El entrenamiento se realizó en una RTX 5090 (Vast.ai), lo que indica que el ajuste LoRA cabe en una GPU de consumo de gama alta.
- Compatibilidad con GPU de consumo: el adaptador en sí ocupa 0,1 GB; el requisito real lo marca el modelo base, para el que no se detallan cifras.
- Opciones de despliegue: la librería declarada es `peft`, por lo que el adaptador se carga junto al modelo base mediante PEFT. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (gemma4_e4b_lora_15k_seed456) | LoRA sobre Gemma-4-E4B-it para relevancia de citas | no disponible (adaptador) | 512 tokens (entrenamiento) | gemma | HuggingFace, 0 descargas |
| Otros adaptadores de la misma serie (p. ej. variantes 5k o con otras semillas) | LoRA sobre Gemma-4-E4B-it | no disponible | no disponible | gemma | no disponible en la información proporcionada |
| Clasificadores de relevancia científicos entrenados desde cero (p. ej. basados en SciBERT) | Transformer encoder | no disponible | típicamente 512 tokens | variable | no disponible en la información proporcionada |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El conjunto de entrenamiento histórico de SCIDOCA se solapa con el test oculto oficial, de modo que no existe una cifra de generalización limpia para este adaptador; el F1 de 0,7778 es de validación y puede estar inflado.
- El adaptador está especializado exclusivamente en juicio de relevancia párrafo-candidata; no es un modelo de propósito general y no debe usarse para generación, razonamiento abierto ni otras tareas.
- La ventana de 512 tokens con truncación fija puede descartar información relevante en párrafos largos o en candidatas con metadatos extensos.
- Los negativos son aleatorios (tres por positivo), lo que puede no representar la distribución real de candidatas difíciles en producción (negativos cercanos o del mismo tema).
- No se documentan sesgos conocidos ni evaluación multilingüe; los idiomas soportados figuran como no disponibles.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí de falsos positivos y falsos negativos en la clasificación.
- La licencia es la de Gemma (Gemma Terms of Use), que impone restricciones de uso comercial y obligaciones de atribución; conviene revisarla antes de un despliegue en producción.
- El adaptador requiere cargar el modelo base `google/gemma-4-E4B-it`, sujeto a su vez a la licencia Gemma.
- Repositorio sin descargas ni likes: no hay evidencia de uso externo ni de validación independiente.

## Enlaces

- HuggingFace: https://huggingface.co/yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_15k_seed456
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
