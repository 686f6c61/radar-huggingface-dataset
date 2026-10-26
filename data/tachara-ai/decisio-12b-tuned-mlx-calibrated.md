# tachara-ai/Decisio-12b-tuned-mlx-calibrated

## Resumen

Decisio-12b-tuned-mlx-calibrated es la versión cuantizada a 6 bits en formato MLX, para Apple Silicon, del modelo tachara-ai/Decisio-12b-tuned-calibrated. Se trata de un ajuste de Gemma 4 12B (google/gemma-4-12B-it) orientado a una tarea muy concreta: responder preguntas tipadas sobre un estado (si/no, elección entre opciones, puntuación) devolviendo una probabilidad calibrada para cada opción. Lo desarrolla tachara-ai y se publica bajo licencia Apache 2.0.

La relevancia de esta ficha está en que no es un modelo conversacional general, sino un modelo de decisión: las temperaturas se han ajustado por pérdida logarítmica mínima para que la confianza declarada coincida con la frecuencia real de acierto. No aplica reglas de compromiso, no relee la pregunta ni usa modo de razonamiento. El repositorio gemelo Decisio-12b-tuned-mlx-commit contiene los mismos pesos y difiere únicamente en decision_config.json.

El peso del repositorio es de 9,7 GB y el modelo tiene 11.907.350.272 parámetros (unos 11,9 mil millones). Está pensado para ejecutarse en Macs con el motor MLX de la librería decisio (versión 0.34.0 o superior); mlx-lm por sí solo carga los pesos, pero no aplica el formato de prompt, la lectura por letra de opción, las temperaturas ni la regla de decisión del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Gemma 4 (tag `gemma4_unified`); el detalle interno no se especifica en la informacion disponible |
| Parametros totales | 11.907.350.272 (aproximadamente 11,9 mil millones) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (se han medido estados de hasta 32k tokens en el motor MLX) |
| Tipos de cuantizacion | MLX affine de 6 bits por peso en grupos de 64; existe una variante de 8 bits en repositorios separados |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 (Gemma 4 es de Google) |
| Formato de pesos | safetensors en formato MLX |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 12B instruct (google/gemma-4-12B-it), según declara la model card, y se ha sometido a un ajuste específico para emitir distribuciones de probabilidad calibradas sobre un conjunto finito de opciones. La conversión a MLX se realizó con mlx-lm 0.32.2 a partir de los pesos bf16 del repositorio base: el adaptador se fusionó en el modelo base en fp32 y se redondeó una sola vez a bf16 (de forma estocástica, semilla 0) antes de la cuantización. El proceso de conversión no es propio de decisio, y decision_config.json documenta cada fichero mediante sha256, además de incluir un SHA256SUMS con los ficheros del repositorio.

Las temperaturas se ajustaron por pérdida logarítmica mínima por tipo de pregunta y banda de elección sobre la lectura simple del modelo bf16, y se reutilizan sin cambios en esta versión cuantizada. No se ha publicado información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Sí se indica que los datos de entrenamiento no se revelan, que no se usaron ítems de evaluación de los boards Decision Index ni JevBench en entrenamiento ni en selección de checkpoints (los datos se descontaminaron contra los conjuntos de test públicos de ambos), y que el entrenamiento incluyó los splits oficiales de entrenamiento de algunos benchmarks públicos bajo sus licencias.

## Capacidades

- Respuesta a preguntas tipadas sobre un estado con una probabilidad por opción: sí/no, elección entre alternativas y puntuación.
- Calibración de confianza: las temperaturas están ajustadas para que la confianza declarada coincida con la tasa real de acierto.
- Decisión sin regla de compromiso adicional, sin doble lectura y sin modo de razonamiento explícito (thinking).
- Lectura por letra de opción (option-letter readout) integrada en el pipeline de decisio.
- Ejecución en Apple Silicon mediante el backend MLX de decisio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Clasificación binaria calibrada en producción: el modelo devuelve P(sí) y P(no) para cada ítem, de modo que el sistema puede fijar umbrales de derivación a revisión humana en función de la confianza declarada en lugar de un umbral fijo arbitrario.
- Triaje de tickets o incidencias: plantear al modelo una elección tipada entre categorías de soporte permite enrutar cada caso con una probabilidad por categoría, lo que facilita priorizar por incertidumbre.
- Puntuación de riesgo o severidad: con preguntas de tipo score, el modelo asigna una distribución sobre los niveles de una escala, útil para priorizar colas de trabajo cuando se necesita una estimación probabilística y no una etiqueta dura.
- Enrutamiento de decisiones en pipelines automatizados: al no requerir modo de razonamiento ni doble lectura, encaja en flujos donde la latencia y la reproducibilidad importan, siempre que se sirva con decisio y sus temperaturas calibradas.
- Evaluación de modelos de decisión en local sobre Mac: investigadores pueden reproducir la comparación contra la versión bf16 en un equipo de 32 GB de memoria unificada sin depender de GPUs dedicadas.
- Selección entre alternativas de contenido o configuraciones: preguntas de tipo choice permiten comparar opciones discretas (variantes de prompt, configuraciones, respuestas candidatas) con una probabilidad asociada a cada una.
- Filtrado previo en anotación humana: usar la probabilidad calibrada para ordenar los ítems por incertidumbre y dirigir el esfuerzo de revisión a los casos donde el modelo no está seguro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí reporta una comparación interna de fidelidad frente al repositorio bf16 servido con los mismos ajustes de decisio:

| Metrica | Valor |
|---|---|
| Preguntas de evaluación (no vistas en entrenamiento) | 1.894 |
| Coincidencia de la respuesta top frente a bf16 | 95,5 % |
| Coincidencia en preguntas yes/no | 99,1 % |
| Coincidencia en preguntas choice | 94,6 % |
| Coincidencia en preguntas score | 94,9 % |
| Exactitud del modelo 6 bits | 69,5 % |
| Exactitud del modelo bf16 | 69,9 % |
| Diferencia de exactitud | -0,4 puntos (intervalo pareado del 90 %: -1,1 a +0,2) |
| Consistencia tras arranque nuevo del servidor (150 preguntas) | Respuestas idénticas |
| Diferencia máxima de probabilidad en comprobación de 100 preguntas | 0,27 |
| Respuestas top coincidentes en esa comprobación de 100 preguntas | 96 de 100 |

## Requisitos de hardware

- Memoria de los pesos en el motor MLX: 10,8 GB.
- Pico de memoria medido en el motor MLX de decisio sobre Apple M5 Pro de 64 GB, sin swap: 12,0 GB con 8k tokens de estado, 13,3 GB con 16k y 15,6 GB con 32k (13,5 GB con 32k y diez preguntas).
- Cabe en un Mac de 32 GB de memoria unificada según el autor.
- Plataforma: Apple Silicon con MLX; no se documenta ruta CUDA en este repositorio.
- Despliegue: decisio 0.34.0 o superior, con `uv run python -m decisio.serve.vllm_engine --backend mlx --base tachara-ai/Decisio-12b-tuned-mlx-calibrated`. mlx-lm puede cargar los pesos, pero no aplica el formato de prompt, la lectura por letra, las temperaturas ni la regla de decisión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Precision / formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Decisio-12b-tuned-mlx-calibrated | ~11,9B | 6 bits MLX, safetensors | No disponible | Apache 2.0 | Version evaluada en esta ficha; calibrada |
| Decisio-12b-tuned-calibrated | ~11,9B | bf16 | No disponible | Apache 2.0 | Referencia de fidelidad; exactitud 69,9 % en el set interno |
| Decisio-12b-tuned-mlx8-calibrated | ~11,9B | 8 bits MLX | No disponible | Apache 2.0 | Mas cercano a bf16 que la version de 6 bits |
| Decisio-12b-tuned-mlx-commit | ~11,9B | 6 bits MLX | No disponible | Apache 2.0 | Mismos pesos; solo cambia decision_config.json (flavor commit) |
| google/gemma-4-12B-it | ~12B | bf16 | No disponible | Apache 2.0 (Gemma 4 es de Google) | Modelo base sin el ajuste de decisión |

No se dispone de comparaciones con modelos de decisión de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: está diseñado para preguntas tipadas con opciones discretas, no como asistente conversacional general ni para generación abierta de texto.
- La cuantización a 6 bits no es idéntica al bf16: en una comprobación de 100 preguntas la diferencia máxima de probabilidad fue de 0,27 y 96 de cada 100 respuestas top coincidieron. Para aplicaciones sensibles a la calibración exacta, la variante de 8 bits o el bf16 son más fieles.
- Requiere el stack de decisio (0.34.0 o superior) para aplicar el formato de prompt, la lectura por letra, las temperaturas y la regla de decisión; usar mlx-lm de forma directa invalida el comportamiento calibrado.
- El dataset de entrenamiento no se divulga, por lo que no es posible auditar la composición ni los sesgos potenciales.
- No se declaran idiomas soportados; no hay garantía documentada de rendimiento fuera del idioma o idiomas de entrenamiento.
- Riesgo de alucinación y de calibración incorrecta fuera de la distribución de preguntas y estados con los que se ajustaron las temperaturas.
- La longitud máxima de contexto no se especifica; las mediciones llegan hasta 32k tokens de estado.
- Licencia Apache 2.0 según la model card, con la advertencia de que Gemma 4 es de Google; conviene verificar los términos del modelo base antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún nula y ausencia de validación externa por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tachara-ai/Decisio-12b-tuned-mlx-calibrated
- Repositorio base en bf16: https://huggingface.co/tachara-ai/Decisio-12b-tuned-calibrated
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Variantes de 8 bits y flavor commit: https://huggingface.co/tachara-ai/Decisio-12b-tuned-mlx8-calibrated y https://huggingface.co/tachara-ai/Decisio-12b-tuned-mlx8-commit
