# yuhengtu-bytedance/sfm_filtered_insert_xxf_character-8k_9k_10k_11k_12k_simpleavg_merge

## Resumen

`sfm_filtered_insert_xxf_character-8k_9k_10k_11k_12k_simpleavg_merge` es un modelo de lenguaje de tipo decoder-only publicado por el usuario `yuhengtu-bytedance` en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una fusión (merge) de cinco checkpoints pertenecientes a una misma ejecución de entrenamiento, generada con la herramienta mergekit mediante el método Linear y normalización activada. El resultado es, en la práctica, un "model soup" sobre la trayectoria de entrenamiento de un modelo base cuyo identificador interno es `filtered_insert_xxf_character`.

El modelo tiene 6.856.253.440 parámetros almacenados en safetensors (aproximadamente 6,86 mil millones, equivalente a la clase de 7B) y un repositorio de 13,7 GB. La etiqueta de arquitectura declarada en HuggingFace es `gpt_neox`, lo que apunta a una familia transformer autoregresiva con atención causal, aunque no se aporta la configuración concreta (número de capas, dimensiones ocultas, cabezas de atención ni longitud de contexto). La model card se limita a listar la receta YAML del merge y las rutas locales de los checkpoints fusionados.

La relevancia de esta ficha es limitada y conviene ser explícito: el modelo no incluye documentación sobre datos de entrenamiento, idiomas, licencia ni evaluación. Los cinco checkpoints de origen (`global_step8000`, `9000`, `10000`, `11000` y `12040`) son rutas de un sistema de ficheros interno (`/opt/tiger/Pan_Safety_Better_Measurement/...`), no modelos publicados, por lo que la receta no es reproducible externamente. Su interés es, por tanto, como artefacto de investigación en técnicas de interpolación de pesos y en evaluaciones de seguridad de modelos, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `gpt_neox` en HuggingFace); configuración concreta no disponible |
| Parametros totales | 6.856.253.440 (≈6,86 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene safetensors en bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (según tags de HuggingFace); dtype de salida del merge: bfloat16 |
| Tipo de artefacto | Fusión de pesos (merge) de 5 checkpoints con mergekit, no un modelo entrenado de novo |
| Método de fusión | Linear (`merge_method: linear`) con `normalize: true` |
| Checkpoints fusionados | global_step8000, 9000, 10000, 11000 (peso 1.0 cada uno) y base global_step12040 |
| Dtype de cálculo del merge | float32 |
| Tamaño del repositorio | 13,7 GB |
| Librería | transformers |
| Pipeline | text-generation |
| Compatibilidad declarada | text-generation-inference, endpoints_compatible |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-13 / 2026-09-13 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La model card no describe ninguna innovación arquitectónica. Lo único confirmado es la etiqueta `gpt_neox` y una fusión de tipo Linear sobre cinco estados de un mismo entrenamiento. El método Linear con `normalize: true` promedia los tensores de los checkpoints ponderados por igual, reescalando después cada tensor para conservar la norma del modelo base; el resultado es una media ponderada de pesos que suele producir una mejora modesta de robustez y una reducción de la varianza entre checkpoints cercanos, a costa de perder los picos de rendimiento que un checkpoint individual pueda haber alcanzado. Al usar cinco checkpoints muy próximos entre sí (pasos 8000 a 12040 de la misma ejecución), el merge se comporta como un promedio temporal de la fase final del entrenamiento, no como una combinación de modelos diversos.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, la proporción de datos en cada idioma, ni sobre si se aplicaron fases de ajuste por instrucciones (SFT), RLHF, DPO u otras. Tampoco se documenta si el modelo base fue entrenado desde cero o si es un ajuste de otro modelo. El nombre interno `filtered_insert_xxf_character` y la ruta raíz `Pan_Safety_Better_Measurement` sugieren un contexto de experimentación sobre medición de seguridad, pero esto es una inferencia a partir del nombre de las rutas y no un dato confirmado por el autor. No se documentan técnicas de decodificación especulativa, atención lineal, SSM ni ninguna otra innovación.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad confirmada por el pipeline (`text-generation`) y la librería declarada (`transformers`).
- Conversación: la etiqueta `conversational` está presente en los metadatos de HuggingFace, lo que indica que el repositorio se marcó como apto para uso conversacional; no hay evidencia documental de que exista un formato de plantilla de chat definido.
- No hay información publicada sobre razonamiento multi-paso, matemáticas, generación de código, visión, audio ni multimodalidad.
- No hay información sobre soporte de tool calling o function calling.
- No hay información sobre capacidades de agente o razonamiento multi-paso.
- No hay información sobre multilingüismo ni sobre los idiomas cubiertos por el entrenamiento.
- No se documenta ningún modo especial de inferencia (thinking mode, decodificación con presupuesto de tokens, etc.).
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles, lo que permite servir el modelo con ese stack sin conversión adicional.

## Casos de uso

- Investigación en interpolación de pesos: el modelo es un caso de estudio directo de "model soup" con `mergekit` en modo Linear con normalización. Se puede reproducir la receta sobre otros checkpoints para medir si el promedio de pasos tardíos de entrenamiento mejora la perplejidad frente a checkpoints individuales.
- Punto de partida para ajuste fino: al ser un modelo de ~6,86 B con pesos en safetensors y bfloat16, se puede cargar con `transformers` y aplicar SFT o LoRA sobre dominios concretos. La fusión puede ofrecer un punto inicial algo más estable que un único checkpoint con sobreajuste al final del entrenamiento.
- Evaluación comparativa de estrategias de merge: sirve como referencia para contrastar Linear con otros métodos de mergekit (SLERP, TIES, DARE) usando los mismos cinco checkpoints de origen, siempre que el usuario tenga acceso a ellos.
- Experimentos internos de seguridad y alineación: dado el nombre de la ruta de origen (`Pan_Safety_Better_Measurement`), encaja en flujos de evaluación de comportamiento de modelos bajo protocolos internos de medida de seguridad, aunque no se publica ninguna batería de pruebas asociada.
- Servicio de generación de texto autoalojado: con `text-generation-inference` y los tags de compatibilidad de endpoints, se puede desplegar en infraestructura propia para tareas genéricas de completado, aceptando que no hay garantía documentada de calidad ni de idioma.
- Base para estudios de degradación por promedio de pesos: permite cuantificar experimentalmente cuánta capacidad específica se pierde al promediar checkpoints con pesos iguales, útil para decidir si conviene un merge o seleccionar un único checkpoint.
- Reproducción de recetas y auditoría de artefactos: útil como ejemplo de model card mínima en trabajos sobre trazabilidad de modelos publicados, ya que ilustra el caso de un repositorio con receta de merge pero sin base model resoluble ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench, perplejidad ni ninguna otra métrica, y las búsquedas web realizadas no han devuelto documentación técnica asociada al modelo (los resultados obtenidos corresponden a foros sin relación con el artefacto).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16/float16: en torno a 13,7 GB solo para pesos, más 1-3 GB de caché KV y activaciones según longitud de secuencia y batch. En la práctica, 16 GB es el mínimo ajustado y 24 GB resulta cómodo.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB de pesos.
- GPU profesionales: A100 40/80 GB, H100, L40S o A6000 funcionan sin problema y permiten lotes grandes para maximizar throughput.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB) en bfloat16 con lotes pequeños, y en RTX 3060/4060 Ti de 12 GB si se cuantiza a 8 o 4 bits.
- Apple Silicon: un Mac con 32 GB de memoria unificada puede ejecutar el modelo en bfloat16 con `mlx` o `llama.cpp`; con 16-18 GB habría que cuantizar.
- Opciones de despliegue: `transformers` (referencia y más lento), `text-generation-inference` (el repo declara compatibilidad), `vLLM` (soporte genérico para modelos con arquitectura `gpt_neox`, sujeto a que la configuración sea estándar). `llama.cpp` y `Ollama` requieren convertir los pesos a GGUF, algo que el repositorio no ofrece y que el usuario tendría que generar por su cuenta.
- Latencia y throughput: no disponibles. No hay mediciones publicadas. Como referencia puramente orientativa para 6,86 B en bfloat16, una A100 o H100 puede servir decenas de peticiones concurrentes por segundo con lotes grandes, y una RTX 4090 se sitúa en el rango de decenas de tokens por segundo en modo interactivo con batch 1; estas cifras dependen del stack y no deben tomarse como medidas del modelo.
- Almacenamiento: el repositorio ocupa 13,7 GB, por lo que conviene disponer de al menos 30 GB libres si se van a generar conversiones adicionales.

## Comparativa con modelos similares

Comparativa orientativa con modelos abiertos de tamaño equivalente. Los datos del modelo analizado proceden de sus metadatos; las cifras de los modelos de referencia son datos de catálogo público y deben verificarse en sus propias model cards. No hay métricas de rendimiento publicadas para este merge, por lo que la columna de rendimiento no se puede completar.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| sfm_filtered_insert_xxf_character-8k_9k_10k_11k_12k_simpleavg_merge | 6,86 B | No disponible | No disponible | Safetensors (bfloat16) | No disponible |
| Pythia-6.9B (EleutherAI) | 6,9 B | 2048 tokens | Apache-2.0 | Safetensors | Sí, publicado por el autor |
| Llama-2-7B (Meta) | 6,74 B | 4096 tokens | Licencia comunitaria Llama 2 | Safetensors | Sí, publicado por el autor |
| Mistral-7B-v0.1 (Mistral AI) | 7,24 B | 8192 tokens | Apache-2.0 | Safetensors | Sí, publicado por el autor |

Diferencias relevantes: este merge no declara licencia, no declara idiomas, no publica contexto soportado y no tiene benchmarks, mientras que las alternativas listadas aportan los cuatro elementos. Además, su procedencia (fusión de checkpoints internos no publicados) impide la reproducibilidad, a diferencia de los modelos de referencia, cuyos pesos base y recetas están disponibles.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: sin licencia explícita no hay autorización clara para uso comercial, redistribución ni obras derivadas. Tratar como no apto para producción hasta que el autor aclare los términos.
- Los checkpoints de origen son rutas locales de un sistema de ficheros privado. La receta de merge no es reproducible por terceros y no se puede verificar qué contenían exactamente los pesos fusionados.
- No hay información sobre datos de entrenamiento, por lo que no se pueden evaluar sesgos de género, raza, religión, idioma o ideología. Es un riesgo directo si se despliega en aplicaciones orientadas a usuarios.
- Riesgo de alucinación no caracterizado: no existen evaluaciones de veracidad ni de calibración para este artefacto.
- Ámbito idiomático desconocido: no se declara ninguna lista de idiomas, así que su comportamiento en castellano es indeterminado y debe probarse antes de cualquier uso.
- Longitud de contexto desconocida: no se puede planificar el truncado de entradas ni garantizar estabilidad en conversaciones largas. Es un riesgo de truncamiento silencioso y de degradación a partir de cierta longitud.
- Naturaleza de "model soup" temporal: al promediar cinco checkpoints de la misma ejecución, es probable que el modelo quede ligeramente por debajo del mejor checkpoint individual en tareas específicas, aunque gane en robustez media. No hay datos que lo confirmen ni lo desmienten.
- Cero descargas y cero interacciones: no existe validación por parte de la comunidad, ni informes de fallos, ni evidencia empírica de funcionamiento fuera del entorno del autor.
- Fechas de los metadatos (2026-09-13) posteriores a la fecha habitual de publicación de artefactos: conviene verificar la procedencia del repositorio antes de integrarlo en pipelines automáticos.
- El nombre y las rutas sugieren un contexto de evaluación de seguridad, pero no se publica ninguna metodología, resultado o informe asociado; no debe interpretarse como un modelo certificado o evaluado en seguridad.
- Etiqueta `conversational` sin plantilla de chat documentada: usar un formato de prompt incorrecto puede degradar notablemente la calidad de las respuestas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_insert_xxf_character-8k_9k_10k_11k_12k_simpleavg_merge
- Repositorio de mergekit (herramienta usada para la fusión): https://github.com/cg123/mergekit
- Paper del método Linear referenciado en los tags (`arxiv:2203.05482`, Model soups): https://arxiv.org/abs/2203.05482
- No se han encontrado papers, blogs, repositorios de código, demos ni discusiones técnicas adicionales asociados a este modelo en la búsqueda web realizada.
