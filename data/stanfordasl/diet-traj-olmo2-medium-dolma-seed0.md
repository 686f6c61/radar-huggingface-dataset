# stanfordasl/diet-traj-olmo2-medium-dolma-seed0

## Resumen

`stanfordasl/diet-traj-olmo2-medium-dolma-seed0` es un modelo base de lenguaje de ≈305 M parámetros con arquitectura OLMo2, entrenado desde cero por el grupo Stanford ASL dentro del proyecto DIET (weight-space). No es un modelo pensado para uso en producción: es un artefacto de investigación cuyo objetivo es el análisis de trayectorias de preentrenamiento, es decir, el estudio de cómo evolucionan los pesos a lo largo del entrenamiento. Forma parte de una colección de ejecuciones idénticas en las que solo cambia la semilla aleatoria, lo que permite aislar la varianza atribuible a la inicialización.

La arquitectura replica el config `olmo2_medium_dense.yaml` del repositorio `jjalora/diet-lm`: 16 capas, `hidden_size` 768, `intermediate_size` 3.072, 12 cabezas de atención (12 también para clave/valor) y una ventana de 2.048 posiciones. El entrenamiento es un preentrenamiento puro de modelado de lenguaje con entropía cruzada, sin destilación (`teacher_schedule=none`), sin instrucciones y sin alineamiento posterior (RLHF/DPO), sobre un presupuesto de 2.000 millones de tokens extraídos en streaming de `emozilla/dolma-v1_7-3B`.

Su relevancia es metodológica, no de rendimiento: publica checkpoints intermedios en ramas `stepN` (intervalo de 950 pasos sobre 30.517 pasos totales, es decir, unas 32 instantáneas), lo que lo convierte en material útil para estudiar dinámica de pesos, interpolación de modelos, conectividad en modo lineal o sensibilidad a la semilla en la familia OLMo2, un ecosistema que hasta ahora contaba con colecciones equivalentes para Pythia pero no para OLMo2 con datos Dolma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso OLMo2 (sin términos de sesgo, normalización no paramétrica, SwiGLU, embeddings posicionales rotatorios) |
| Parametros totales | ≈305 M (hidden_size 768, 16 capas, intermediate_size 3.072, 12 cabezas de atención) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (max_position_embeddings) |
| Tipos de cuantizacion | no se publican cuantizaciones oficiales (ni GGUF ni GPTQ/AWQ); los pesos bf16 safetensors son convertibles a fp16, int8 o int4 con herramientas estándar |
| Idiomas soportados | inglés (único idioma declarado; datos Dolma, de predominio anglófono) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16; una rama `stepN` por checkpoint y `main` con los pesos finales al completar la ejecución |
| Dataset de entrenamiento | `emozilla/dolma-v1_7-3B` (espejo comunitario de Dolma v1.7 en HuggingFace, muestreado proporcionalmente entre sus componentes, en streaming) |
| Presupuesto de tokens | 2.000.000.000 (2 B) |
| Pasos de entrenamiento | 30.517 pasos, guardado cada 950 pasos (≈65.500 tokens por paso, cálculo derivado del presupuesto y de max_steps) |
| Precisión de entrenamiento | bf16, AdamW (lr 3e-5, betas 0,9/0,95, weight decay 0,1, schedule coseno) |
| Hardware de entrenamiento | H100 (clúster «makau», job 9423) |
| Tokenizador | no disponible en la información proporcionada |
| Tamaño del repositorio | 22,0 GB (pesos de todas las instantáneas) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo2 introducida por Ai2: transformer denso con atención multi-cabeza clásica en esta escala (12 cabezas de consulta y 12 de clave/valor, sin GQA), eliminación de todos los sesgos para mejorar la estabilidad, normalización no paramétrica, activación SwiGLU, RoPE y tokenizador BPE derivado del de OLMo2 (el model card no especifica explícitamente qué tokenizador se empleó en esta ejecución). La configuración es deliberadamente pequeña (≈305 M parámetros, 16 capas, dimensión 768) para que una trayectoria completa de preentrenamiento quepa en un presupuesto de cómputo académico y pueda repetirse varias veces cambiando solo la semilla.

El preentrenamiento es un objetivo de entropía cruzada estándar (next-token prediction), sin destilación de profesor, sin fases de instrucción y sin alineamiento. Los datos proceden de `emozilla/dolma-v1_7-3B`, un espejo de Dolma v1.7 alojado en HuggingFace con muestreo proporcional de los componentes de la mezcla original; el flujo es en streaming (no preempaquetado), con AdamW, bf16, learning rate 3e-5, betas (0,9; 0,95), weight decay 0,1 y schedule coseno. El presupuesto total es de 2 B de tokens repartidos en 30.517 pasos, con instantáneas cada 950 pasos. La innovación relevante no está en el modelo sino en el protocolo: ejecuciones gemelas que solo difieren en la semilla, con checkpoints intermedios publicados, para estudiar la trayectoria en el espacio de pesos y su reproducibilidad.

## Capacidades

- Generación de texto autoregresiva básica en inglés (modelo base, sin ajuste instructivo).
- Predicción de siguiente token y cálculo de perplejidad sobre corpus en inglés.
- Extracción de estados internos y pesos en 32 puntos intermedios del entrenamiento, apto para análisis de dinámica y de representaciones.
- Soporte de tool calling / function calling: no (no hay entrenamiento en formato de chat ni de herramientas).
- Soporte de agentes y razonamiento multi-paso: no.
- Capacidades multilingües: no; solo inglés declarado.
- Capacidad especial: ninguna (sin modo thinking, sin visión, sin audio, sin ventana larga más allá de 2.048 tokens).
- Valor como objeto de estudio: comparación de trayectorias entre semillas, interpolación de pesos, medidas de distancia en el espacio de parámetros, análisis de curvas de pérdida a lo largo de checkpoints.

## Casos de uso

- Análisis de trayectorias en el espacio de pesos: cargar las ramas `step0`…`stepN` y medir distancias, normas por capa o similitud coseno entre checkpoints para estudiar cómo se organiza el aprendizaje capa a capa durante 2 B de tokens.
- Estudio de varianza por semilla: la colección incluye ejecuciones idénticas salvo `seed`, de modo que se puede cuantificar cuánto de la pérdida final y de la geometría de los pesos es atribuible a la inicialización y no al recetario.
- Interpolación y model merging en modo lineal: al compartir receta y datos, los checkpoints son candidatos naturales para experimentos de interpolación de pesos y de conectividad lineal entre soluciones.
- Línea base de arquitectura OLMo2 a escala pequeña: sirve como referencia controlada para comparar OLMo2 con Pythia (existe la colección `jjalora/diet-traj-pythia-410m-*` con el mismo protocolo) sobre datos distintos (Dolma frente a The Pile).
- Fine-tuning académico de bajo coste: partir de un modelo de 305 M parámetros permite probar recetas de ajuste (clasificación, extracción de información, dominio concreto en inglés) en una sola GPU consumer, con la ventaja de disponer de muchos puntos de partida alternativos.
- Docencia y reproducción metodológica: el `run.json` documenta clúster, job, `max_steps`, `save_steps`, semilla y presupuesto de tokens, lo que facilita reproducir un preentrenamiento a pequeña escala con propósitos formativos.
- Pruebas de infraestructura de evaluación: validar pipelines de evaluación de modelos base (perplejidad, benchmarks en inglés) antes de escalarlos a modelos de 7 B o 13 B, con un coste de inferencia mínimo.
- Análisis de mecánica interna: extracción de activaciones y atención en un modelo pequeño y totalmente abierto, útil para interpretabilidad sin los requisitos de memoria de modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, HellaSwag ni perplejidad sobre conjuntos de validación, y la ficha de HuggingFace no reporta métricas adicionales.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 0,7-1,5 GB contando pesos (≈0,61 GB) y estados de activación con contexto de 2.048 tokens (estimación aritmética a partir del número de parámetros, no medida publicada).
- VRAM en fp32: aproximadamente 1,5-2,5 GB. En int8: en torno a 0,5-1 GB. En int4: por debajo de 0,5 GB de pesos.
- GPU recomendadas: cualquier GPU con 4 GB o más. Cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, L4, T4, A10 y, por supuesto, A100/H100 si se reutiliza el mismo entorno del entrenamiento.
- CPU: inferencia viable en CPU para pruebas puntuales; el cuello de botella es la latencia, no la memoria.
- Despliegue: `transformers` es la vía directa (la librería incluye `Olmo2ForCausalLM`); vLLM o TGI son opciones si la versión instalada reconoce la arquitectura `olmo2`; llama.cpp u Ollama requieren convertir previamente los safetensors a GGUF, conversión que no se distribuye oficialmente.
- Almacenamiento: 22 GB para el repositorio completo con todas las ramas; descargar solo una rama reduce el espacio a ≈0,6 GB por checkpoint.
- Latencia y throughput: no disponibles; no se han publicado medidas para esta ejecución.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Datos de entrenamiento | Licencia | Enfoque | Benchmarks |
|---|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-seed0 (este) | ≈305 M | 2.048 | 2 B tokens (Dolma v1.7) | Apache 2.0 | Artefacto de investigación con checkpoints intermedios | no disponibles |
| Pythia-410M (EleutherAI) | 410 M | 2.048 | The Pile | Apache 2.0 | Modelo base de investigación con 154 checkpoints | no verificados en esta ficha |
| OLMo 2 1B (Ai2) | 1 B | 4.096 | Dolma | Apache 2.0 | Modelo base plenamente abierto | no verificados en esta ficha |
| SmolLM2-360M (HuggingFace) | 362 M | 8.192 | no disponible en esta ficha | Apache 2.0 | Modelo base pequeño orientado a dispositivo | no verificados en esta ficha |

La diferencia clave frente a las alternativas no es de calidad sino de propósito: Pythia es el precedente metodológico (checkpoints intermedios para análisis), OLMo 2 1B y SmolLM2-360M son modelos base utilizables, mientras que esta ejecución existe para estudiar la trayectoria de entrenamiento con la arquitectura OLMo2 sobre Dolma.

## Limitaciones y advertencias

- Es un modelo base sin ajuste instructivo: no sigue instrucciones, no mantiene formato de chat y no debe usarse como asistente.
- Entrenado con solo 2 B tokens, muy por debajo de lo habitual en modelos de su escala; la calidad del texto generado será limitada y la perplejidad, alta en comparación con modelos pequeños de referencia.
- Solo inglés declarado; el rendimiento en castellano no está evaluado y previsiblemente será pobre.
- Ventana de 2.048 tokens: insuficiente para casos de contexto largo, RAG con muchos documentos o conversaciones extensas.
- Sin alineamiento ni filtrado de seguridad posterior al preentrenamiento: puede reproducir sesgos y contenido tóxico presente en Dolma; no hay evaluación de sesgos publicada.
- Riesgo alto de alucinación si se usa como generador de hechos, agravado por el bajo presupuesto de tokens.
- Artefacto de investigación con 0 descargas y 0 likes: no hay validación externa, ni issues, ni resultados reproducidos por terceros en la información disponible.
- El repositorio ocupa 22 GB por acumular todas las ramas de checkpoints; conviene descargar solo la rama necesaria.
- Las fechas del repositorio (creación y actualización con tres segundos de diferencia) y la nota de que `main` contendrá los pesos finales «una vez completada la ejecución» sugieren que el material puede estar incompleto o recién publicado; conviene verificar `run.json` y la lista de ramas antes de depender de él.
- La licencia Apache 2.0 permite uso comercial, pero la calidad del modelo y su carácter de artefacto de investigación hacen desaconsejable cualquier despliegue en producción.
- El campo `git_commit` figura como «unknown» en `run.json`, lo que limita la reproducibilidad exacta del código utilizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-seed0
- Repositorio del proyecto DIET: https://github.com/jjalora/diet-lm
- Colección de referencia con arquitectura Pythia: https://huggingface.co/jjalora (colección `diet-traj-pythia-410m-*`)
- Dataset utilizado: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Página oficial de OLMo 2 (Ai2): https://allenai.org/olmo2
- Repositorio de código de OLMo: https://github.com/allenai/OLMo
- Colección OLMo 2 en HuggingFace: https://huggingface.co/collections/allenai/olmo-2
- Documentación de OLMo2 en transformers: https://huggingface.co/docs/transformers/v5.1.0/model_doc/olmo2
- Página del proyecto OLMo: https://allenai.org/olmo
