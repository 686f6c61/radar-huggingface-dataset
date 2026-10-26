# tachara-ai/Decisio-12b-tuned-mlx-commit

## Resumen

Decisio-12b-tuned-mlx-commit es la versión cuantizada a 6 bits en formato MLX, para Apple Silicon, del modelo `tachara-ai/Decisio-12b-tuned-commit`, un ajuste fino de `google/gemma-4-12B-it` (11.907.350.272 parámetros) desarrollado por tachara-ai. No es un modelo conversacional general: responde preguntas tipadas sobre un estado (sí/no, elección entre opciones y puntuación) devolviendo una probabilidad para cada opción, con la regla de commit aplicada sobre la probabilidad de sí/no.

El problema que resuelve es el de obtener decisiones con salida probabilística calibrada y consumo viable en hardware de consumo: los pesos bf16 originales se convierten a cuantización afín de 6 bits en grupos de 64 mediante mlx-lm 0.32.2, lo que deja el repositorio en 9,7 GB y permite servir el modelo en un Mac de 32 GB de memoria unificada. Existen dos repositorios con los mismos pesos que solo difieren en `decision_config.json`: la variante `calibrated` y esta `commit`.

Es relevante ahora porque empaqueta un modelo de decisión completo (pesos, layout de prompt, lectura de letras de opción y temperaturas por tipo de pregunta) en un artefacto que corre en local, algo poco habitual en modelos de 12B orientados a clasificación con probabilidades. El coste es una pérdida medible frente a bf16 (-0,4 puntos de accuracy en 1.894 preguntas no vistas) y una dependencia estricta del runtime `decisio` 0.34.0 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4 (tag de HuggingFace `gemma4_unified`), ajustado para decisión con preguntas tipadas |
| Parametros totales | 11.907.350.272 (11,9B) |
| Parametros activos | No disponible (no se documenta que sea MoE) |
| Longitud de contexto | No disponible como máximo declarado; las mediciones de memoria del autor llegan a 32k tokens de estado |
| Tipos de cuantizacion | MLX affine de 6 bits por peso en grupos de 64 (este repositorio); los mismos pesos existen en bf16 y en 8 bits en repositorios hermanos |
| Idiomas soportados | No disponible (no se declara listado de idiomas en la model card) |
| Licencia | Apache License 2.0 (licencia del modelo base; ver `LICENSE` y `NOTICE`) |
| Formato de pesos | safetensors en formato MLX cuantizado, 9,7 GB de repositorio; incluye `SHA256SUMS` y `decision_config.json` con sha256 por fichero |
| Libreria | mlx (mlx-lm) |
| Runtime requerido | `decisio` 0.34.0 o superior |

## Arquitectura y entrenamiento

La base es Gemma 4 12B en su variante instruct (`google/gemma-4-12B-it`), un transformer decoder-only denso de 11,9B parámetros. Sobre esa base se aplicó un ajuste fino orientado a decisión: el modelo responde a preguntas tipadas sobre un estado con una distribución de probabilidad sobre las opciones, con tres tipos de pregunta documentados (sí/no, elección entre opciones con letras y puntuación). El adaptador se fusionó en la base en fp32 y se redondeó una sola vez a bf16 (redondeo estocástico, semilla 0) antes de la conversión a MLX. La cuantización la realizó mlx-lm 0.32.2, no una herramienta propia de decisio, y el autor lo hace constar explícitamente en `decision_config.json`.

No se revela la composición del dataset de entrenamiento. La model card indica que no se usaron ítems de evaluación del Decision Index ni de JevBench para entrenar ni para seleccionar checkpoints, y que los datos se descontaminaron contra los conjuntos de test públicos de ambos boards. El entrenamiento incluyó los splits oficiales de entrenamiento de algunos benchmarks públicos bajo sus licencias, y cada fila de entrenamiento se comprobó contra los test públicos de ambos boards.

El elemento diferencial de esta variante es la "regla de commit": una probabilidad de sí/no estrictamente entre 0,20 y 0,80 se notifica en el borde de esa banda por su lado (0,80 si está por encima de un medio, 0,20 si está en o por debajo), de modo que la respuesta nunca cambia pero su calibración sí. Las temperaturas se ajustaron por mínima log loss por tipo de pregunta y banda de opciones sobre la lectura del modelo bf16 y se usan sin modificar.

## Capacidades

- Respuesta a preguntas tipadas sobre un estado: sí/no, elección entre opciones (con lectura de letra de opción) y puntuación, devolviendo probabilidad por opción.
- Salida calibrada con la regla de commit, que satura a los bordes de la banda 0,20-0,80 en las preguntas de sí/no.
- Configuración por repositorio: `decision_config.json` fija el layout de cabecera, las temperaturas por tipo de pregunta y los ajustes del flavor; los mismos pesos se sirven con dos políticas distintas (`calibrated` y `commit`).
- Exposición de metadatos en el servidor: `/health`, `systemone.repository_defaults` y `systemone.flavor`.
- Generación de texto libre: no es el uso previsto; el modelo está ajustado a la lectura de opciones y el runtime aplica layout de prompt y regla de commit.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponibles (no se declara listado de idiomas).
- Visión, audio o modo thinking: no disponibles (no documentados).

## Casos de uso

- Triaje de tickets de soporte: cada ticket se envía como pregunta de elección entre categorías y el modelo devuelve una probabilidad por categoría; el commit permite enrutar automáticamente solo cuando la probabilidad cae fuera de la banda y derivar a revisión humana en el resto.
- Moderación con umbral explícito: formulada como pregunta de sí/no, la regla de commit evita que una probabilidad intermedia se presente como certeza, algo útil cuando el sistema de downstream solo distingue entre "bloquear" y "revisar".
- Enrutado condicional en un pipeline: preguntas de sí/no para decidir si se llama a un recuperador, a un segundo modelo o a una cola de revisión, usando la banda 0,20-0,80 como zona de abstención.
- Scoring de riesgo en formularios: preguntas de tipo puntuación sobre un estado descrito en el prompt, aprovechando la temperatura específica por banda de opciones ajustada sobre el modelo bf16.
- Validación de clasificadores existentes: al ser un artefacto pequeño que corre en local, sirve como segunda opinión barata sobre las etiquetas de un clasificador en producción, comparando distribuciones en lugar de etiquetas duras.
- Anotación asistida con calibración auditable: el repositorio incluye `SHA256SUMS` y sha256 por fichero en `decision_config.json`, lo que permite fijar versión de pesos y política de decisión en un pipeline reproducible.
- Despliegue en portátil para pruebas de concepto: con 10,8 GB de pesos y 12,0 GB de pico a 8k tokens en un M5 Pro de 64 GB, cabe en un Mac de 32 GB para prototipado sin GPU dedicada.

## Benchmarks y rendimiento

Evaluación del autor sobre 1.894 preguntas no vistas en entrenamiento, comparando esta versión de 6 bits contra el repositorio bf16 servido por decisio con los mismos ajustes:

| Metrica | Resultado (6 bits vs bf16) |
|---|---|
| Coincidencia en la respuesta top (global) | 95,5% |
| Coincidencia en la respuesta top (sí/no) | 99,1% |
| Coincidencia en la respuesta top (elección) | 94,6% |
| Coincidencia en la respuesta top (puntuación) | 94,9% |
| Accuracy del modelo de 6 bits | 69,5% |
| Accuracy del modelo bf16 | 69,9% |
| Diferencia de accuracy | -0,4 puntos (intervalo pareado del 90%: -1,1 a +0,2) |
| Arranque en frío del servidor, muestra de 150 preguntas | Respuestas idénticas |
| Comprobación de 100 preguntas: diferencia máxima en una probabilidad | 0,27 |
| Comprobación de 100 preguntas: misma respuesta top | 96 de 100 |

Resultados en tableros públicos (Decision Index, JevBench): no disponibles en la información proporcionada. Tampoco hay datos de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 10,8 GB solo para los pesos; pico de 12,0 GB con 8k tokens de estado, 13,3 GB con 16k y 15,6 GB con 32k; 13,5 GB con 32k y diez preguntas. Medido en el motor MLX de decisio sobre un Apple M5 Pro con 64 GB y sin uso de swap.
- Cabe en consumer: sí, en Apple Silicon con memoria unificada; el autor indica que un Mac de 32 GB tiene margen.
- GPU recomendadas: el repositorio es MLX, por lo que el hardware objetivo es Apple Silicon (M-series). No se documentan GPU NVIDIA ni CUDA.
- Opciones de despliegue: `decisio` 0.34.0 o superior con backend MLX, mediante `uv run python -m decisio.serve.vllm_engine --backend mlx --base tachara-ai/Decisio-12b-tuned-mlx-commit` (el nombre del módulo es `vllm_engine` pero el backend declarado es MLX). `mlx-lm` por sí solo carga los pesos, pero no aplica el layout de prompt, la lectura de letras de opción, las temperaturas ni la regla de commit de decisio.
- Latencia y throughput: no disponibles.
- Alternativa de mayor fidelidad: las versiones de 8 bits (`Decisio-12b-tuned-mlx8-calibrated` y `Decisio-12b-tuned-mlx8-commit`) están más cerca de bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Decisio-12b-tuned-mlx-commit (este) | 11,9B | No disponible (medido hasta 32k) | MLX 6 bits, grupos de 64, 9,7 GB | 69,5% accuracy; 95,5% de coincidencia top con bf16 | Apache 2.0 | Publicado; 0 descargas, 0 likes |
| Decisio-12b-tuned-mlx-calibrated | 11,9B | No disponible | MLX 6 bits | Mismos pesos; difiere solo en `decision_config.json` (sin regla de commit) | Apache 2.0 | Publicado |
| Decisio-12b-tuned-mlx8-commit | 11,9B | No disponible | MLX 8 bits | Más cerca de bf16 que la versión de 6 bits | Apache 2.0 | Publicado |
| Decisio-12b-tuned-commit (bf16) | 11,9B | No disponible | bf16 (safetensors) | 69,9% accuracy; referencia de la comparación | Apache 2.0 | Publicado |
| google/gemma-4-12B-it | 11,9B | No disponible | bf16 y cuantizaciones de la comunidad | No disponible | Apache 2.0 (según esta model card) | Modelo base de Google |

No se dispone de comparación con modelos de decisión de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Dependencia estricta del runtime: cargar los pesos con `mlx-lm` a secas produce salidas incorrectas, porque no se aplica el layout de prompt, la lectura de letras de opción, las temperaturas ni la regla de commit. Se requiere `decisio` 0.34.0 o superior.
- Solo Apple Silicon: el formato es MLX; no hay pesos GGUF ni ruta CUDA documentada en esta información.
- No es idéntico a bf16: en una comprobación de 100 preguntas la mayor diferencia en una probabilidad fue 0,27 y 4 de cada 100 respuestas top cambiaron.
- La regla de commit altera la calibración de forma deliberada: una probabilidad de sí/no entre 0,20 y 0,80 se reporta en el borde de la banda, por lo que esa cifra no debe interpretarse como probabilidad calibrada sin el contexto de la política. La respuesta no cambia, la calibración sí.
- Datos de entrenamiento no revelados: no es posible auditar composición, sesgos ni cobertura lingüística; tampoco se declara qué idiomas soporta.
- Riesgo de alucinación: no evaluado en la documentación; el ajuste está orientado a preguntas tipadas con opciones y no a generación abierta.
- Sin evaluación independiente: el repositorio tiene 0 descargas y 0 likes y todas las métricas proceden del autor, sobre preguntas no vistas pero del mismo proceso de datos.
- Sin resultados publicados en Decision Index ni JevBench en esta información, pese a que el autor menciona la descontaminación contra ambos tableros.
- Licencia: Apache 2.0 heredada del modelo base, con `NOTICE` de Google por Gemma 4; conviene revisar ambos ficheros antes de un uso comercial.
- Fecha de publicación reciente (26 de octubre de 2026) y sin historial de uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tachara-ai/Decisio-12b-tuned-mlx-commit
- Pesos bf16 de origen: https://huggingface.co/tachara-ai/Decisio-12b-tuned-commit
- Variante calibrada de 6 bits: https://huggingface.co/tachara-ai/Decisio-12b-tuned-mlx-calibrated
- Variante de 8 bits (commit): https://huggingface.co/tachara-ai/Decisio-12b-tuned-mlx8-commit
- Variante de 8 bits (calibrated): https://huggingface.co/tachara-ai/Decisio-12b-tuned-mlx8-calibrated
- Modelo base: https://huggingface.co/google/gemma-4-12B-it

No se han proporcionado enlaces a papers, blogs, repositorios de código ni demos adicionales.
