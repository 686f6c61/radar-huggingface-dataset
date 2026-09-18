# yuhengtu-bytedance/DataDecide-dolma1_7-no-code-1B-60000_62500_65000_67500_69369_weightedavg_merge

## Resumen
Este repositorio contiene un modelo de lenguaje de tipo transformer decoder-only, presumiblemente con arquitectura Llama según las etiquetas del repositorio, de aproximadamente 1.280 millones de parámetros (1,279.854.592 según los pesos en safetensors). No es un modelo entrenado desde cero ni un modelo ajustado con instrucciones: es un artefacto de fusión de pesos ("merge") generado con la herramienta mergekit, que combina cinco checkpoints intermedios de una misma trayectoria de preentrenamiento. El modelo pertenece a la familia de experimentos de escalado sobre el corpus Dolma 1.7 (variante sin código), identificados por el prefijo DataDecide en el nombre.

El problema que resuelve es acotado y de carácter metodológico: en lugar de seleccionar un único checkpoint final, se aplica una media ponderada lineal de varios checkpoints consecutivos (pasos 60000, 62500, 65000, 67500 y 69369, con pesos 1, 2, 3, 4 y 5 respectivamente, normalizados). Este tipo de promediado, conocido en la literatura como model soup o checkpoint averaging, busca reducir el ruido del estado final del entrenamiento y estabilizar las métricas de validación sin coste adicional de inferencia.

Su relevancia es fundamentalmente para investigación en ciencia de datos y escalado de preentrenamiento: permite estudiar si el promediado de checkpoints tardíos mejora la perplejidad o las métricas posteriores frente a usar un único punto de la trayectoria. No se dispone de licencia declarada, ni de idiomas soportados, ni de resultados de benchmarks, y el repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que debe tratarse como un artefacto de experimento reproducible más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta "llama" en el repositorio); hiperparámetros concretos no disponibles |
| Parámetros totales | 1.279.854.592 (≈1,28B) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se publican versiones cuantizadas en el repositorio; al ser un modelo de 1,28B es convertible a GGUF/AWQ/GPTQ por el usuario (no incluidas) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (dtype de salida del merge: bfloat16; cálculo interno en float32) |
| Tamaño del repositorio | 2,6 GB |
| Librería declarada | transformers |
| Pipeline | text-generation |
| Método de fusión | Linear merge (mergekit, arXiv:2203.05482), normalizado |
| Checkpoints fusionados | step60000 (peso 1), step62500 (peso 2), step65000 (peso 3), step67500 (peso 4), step69369 (peso 5) |
| Modelo base de la fusión | step69369 (mismo checkpoint con el peso mayor, 5/15 ≈ 0,333) |

## Arquitectura y entrenamiento
La model card no describe la arquitectura interna más allá de las etiquetas del repositorio, que incluyen "llama" y "text-generation". Se trata, por tanto, de un transformer decoder-only de aproximadamente 1,28B de parámetros, coherente con los tamaños típicos de la experimentación de escalado sobre Dolma 1.7. No se especifican número de capas, dimensión oculta, cabezas de atención, tamaño de vocabulario, función de activación ni uso de técnicas como RoPE, GQA, atención lineal o decodificación especulativa. Tampoco se indica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; por el nombre del repositorio y la naturaleza del artefacto, se deduce que es un modelo preentrenado sin ajuste por preferencias.

La innovación técnica aquí no está en la arquitectura sino en el procedimiento de combinación de pesos. Con mergekit se ha aplicado una fusión lineal con normalización (`normalize: true`), de forma que la suma de pesos se reescala antes de promediar. Los pesos efectivos quedan en 1/15, 2/15, 3/15, 4/15 y 5/15 para los pasos 60000, 62500, 65000, 67500 y 69369 respectivamente, es decir, una ponderación creciente hacia los checkpoints más avanzados del entrenamiento, con el checkpoint final (69369) actuando además como base. El cálculo se realiza en float32 y la salida se almacena en bfloat16, lo que explica que los 1,28B de parámetros ocupen aproximadamente 2,56 GB de pesos en disco dentro de un repositorio de 2,6 GB.

## Capacidades
- Generación de texto autoregresiva y completado de secuencias: es la tarea declarada en el pipeline (`text-generation`), sin plantilla de chat ni formato de instrucciones publicado.
- Modelado de lenguaje y puntuación de secuencias: al ser un modelo base, puede emplearse para calcular log-probabilidades y perplejidad, útil en filtrado y curación de datos.
- Punto de partida para ajuste supervisado (SFT) o DPO: el repositorio no incluye ninguna versión ajustada, pero el tamaño permite fine-tuning completo en una GPU de gama alta o con adaptadores LoRA en GPU de consumo.
- Soporte de tool calling / function calling: no disponible; no hay evidencia de tokenizador de herramientas, ni plantillas, ni entrenamiento orientado a agentes.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay rastro de entrenamiento con RL, cadenas de pensamiento ni modo "thinking".
- Capacidades multilingües: no disponibles; el corpus Dolma 1.7 es mayoritariamente en inglés, pero la model card no declara idiomas y no se debe asumir cobertura multilingüe.
- Capacidades especiales (visión, audio, multimodalidad, decodificación especulativa): ninguna declarada.
- Reproducibilidad de la fusión: la configuración YAML completa está publicada, lo que permite replicar el merge si se dispone de los checkpoints originales.

## Casos de uso
- Investigación en escalado centrado en datos: el modelo sirve como punto de medida dentro de una familia de experimentos sobre Dolma 1.7 (sin código) para estudiar cómo evolucionan las métricas de validación según el número de pasos y el tamaño del modelo; su valor está en la comparabilidad con el resto de checkpoints de la misma serie.
- Estudio de promediado de checkpoints (model soups): permite contrastar empíricamente si una media ponderada lineal de los pasos 60000 a 69369 supera en perplejidad o en tareas downstream al checkpoint final aislado, sin coste extra de inferencia.
- Punto de partida para fine-tuning ligero: con 1,28B de parámetros y pesos en bfloat16, se puede aplicar LoRA o QLoRA en una única GPU de 12-24 GB para adaptarlo a un dominio concreto (por ejemplo, clasificación de textos técnicos o generación de plantillas), partiendo de un modelo que no arrastra sesgos de instrucciones.
- Evaluación y "scoring" de corpus: al ser un modelo base, es adecuado para calcular la verosimilitud de documentos y usarla como señal de filtrado o de deduplicación semántica en pipelines de curación de datos, tarea habitual en proyectos de preentrenamiento.
- Destilación y experimentación con modelos pequeños: puede actuar como profesor o como alumno en estudios de destilación de conocimiento, dado su tamaño manejable y su naturaleza de checkpoint intermedio.
- Pruebas de infraestructura de despliegue: el repositorio está etiquetado como compatible con text-generation-inference y endpoints, por lo que es útil para validar pipelines de vLLM, TGI o endpoints propios con un modelo de bajo coste antes de escalar a modelos mayores.
- Docencia y divulgación sobre mergekit: al publicar el YAML completo con pesos y método, es un ejemplo didáctico de fusión lineal normalizada y de reconstrucción de merges reproducibles.
- Análisis de dinámica de entrenamiento: comparar las salidas del merge con las de los checkpoints individuales (si se dispone de ellos) permite estudiar la variabilidad entre pasos tardíos y el efecto de la interpolación de pesos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta la configuración del merge y no incluye MMLU, HumanEval, GSM8K, ARC, HellaSwag ni ninguna otra métrica, ni comparaciones con checkpoints individuales o con modelos de la competencia.

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: aproximadamente 2,56 GB solo para los pesos; con caché KV y activaciones, el consumo realista se sitúa en torno a 4-6 GB en función de la longitud de contexto y el tamaño de lote (valores estimados a partir del recuento de parámetros, no publicados por el autor).
- VRAM estimada en float32: aproximadamente 5,1 GB solo para los pesos.
- VRAM estimada con cuantización: alrededor de 1,3 GB a 8 bits y 0,7-0,9 GB a 4 bits, en estimaciones derivadas del número de parámetros (no se distribuyen pesos cuantizados).
- GPU recomendadas: cualquier GPU con 8 GB o más puede ejecutar el modelo en bfloat16; tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 3080/3090 y RTX 4090 son suficientes. Las A100 y H100 solo serían necesarias para lotes muy grandes o despliegues con alta concurrencia, no por tamaño del modelo.
- ¿Cabe en GPU de consumo? Sí, con holgura, en la mayoría de GPU de gama media y alta con al menos 6-8 GB de VRAM.
- Despliegue: transformers (formato nativo safetensors), y por las etiquetas del repositorio, text-generation-inference y endpoints compatibles. vLLM es viable si la arquitectura declarada coincide con Llama. Para CPU o GPU de muy baja VRAM sería necesario convertir los pesos a GGUF para usarlos con llama.cpp u Ollama; el repositorio no incluye ninguna conversión publicada.
- Latencia y throughput: no disponibles. No hay mediciones de tokens por segundo ni de tiempo hasta el primer token en la información proporcionada.

## Comparativa con modelos similares
Los datos de los modelos alternativos proceden de sus fichas públicas habituales y no han sido verificados en la búsqueda web realizada; se incluyen como referencia orientativa de categoría (modelos base o ajustados de ~1-2B).

| Modelo | Parámetros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| Este modelo (DataDecide merge) | 1,28B | No disponible | No disponible | Base preentrenado, fusión lineal de checkpoints |
| TinyLlama-1.1B (intermediate) | 1,1B | 2.048 tokens | Apache-2.0 | Base preentrenado, ampliamente usado como referencia pequeña |
| Llama-3.2-1B | 1,23B | Hasta 128.000 tokens | Llama 3.2 Community License | Base/instruido, con requisitos de atribución y políticas de uso |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache-2.0 | Base con variantes instruidas y multilingües |
| SmolLM2-1.7B | 1,7B | 8.192 tokens | Apache-2.0 | Base/instruido, entrenado con foco en datos de alta calidad |

Diferencias clave: frente a estas alternativas, el modelo aquí descrito carece de licencia declarada, de idiomas soportados, de longitud de contexto documentada y de cualquier benchmark publicado, por lo que no es comparable en términos de rendimiento verificable. Su ventaja es la trazabilidad total del proceso de fusión (YAML y pesos publicados) y su utilidad como objeto de estudio metodológico; su desventaja es la ausencia de garantías legales y de métricas para decidir su adopción en producción.

## Limitaciones y advertencias
- Licencia no disponible: no se puede asumir permiso de uso comercial ni redistribución. Cualquier uso en producción debería considerarse bloqueado hasta que el autor aclare la licencia.
- Sin datos de idiomas: no se declara cobertura multilingüe; el corpus subyacente (Dolma 1.7, variante sin código) es mayoritariamente en inglés, por lo que el rendimiento en castellano es impredecible.
- Sin benchmarks: no hay evidencia publicada de calidad, razonamiento, matemáticas o generación de código. Es un modelo preentrenado sin ajuste por instrucciones, por lo que no sigue órdenes ni mantiene formato conversacional de forma fiable.
- Riesgo de alucinación: al ser un modelo base, tiende a continuar texto plausible sin verificación factual; no debe usarse como fuente de información sin validación externa.
- Sesgos: no se documenta ningún análisis de sesgos ni de contenido tóxico. Los corpus web a gran escala suelen arrastrar sesgos demográficos, estereotipos y contenido problemático, y no hay filtrado declarado específico para este artefacto.
- Contexto no especificado: se desconoce la ventana máxima entrenada y si el tokenizador incluye tokens de relleno o de sistema; configurar contextos largos sin conocer el límite puede degradar la calidad.
- Origen de la fusión: al ser una media ponderada de checkpoints, el comportamiento puede ser intermedio entre los pasos fusionados; no hay evaluación que confirme mejoras frente al checkpoint final (69369).
- Trazabilidad incompleta: los checkpoints de origen se referencian mediante rutas locales (`/opt/tiger/...`) no accesibles públicamente, lo que impide reproducir el merge sin los artefactos originales.
- Repositorio sin validación comunitaria: cero descargas y cero likes en el momento de la consulta, sin issues ni discusiones que aporten evidencia adicional.
- Fecha de publicación anómala: el repositorio figura como creado y actualizado el 17 de septiembre de 2026, dato que conviene verificar antes de citarlo.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-dolma1_7-no-code-1B-60000_62500_65000_67500_69369_weightedavg_merge
- Mergekit (herramienta de fusión): https://github.com/cg123/mergekit
- Paper del método Linear citado en la model card (Model soups): https://arxiv.org/abs/2203.05482
- La búsqueda web realizada no devolvió enlaces relevantes sobre el modelo: los resultados obtenidos correspondían a páginas de ayuda de YouTube TV y del centro de ayuda de YouTube, sin relación con este artefacto, por lo que no se incluyen.
