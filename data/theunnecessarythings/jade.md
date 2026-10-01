# theunnecessarythings/JADE

## Resumen

JADE (Just Another Decision Engine) es un adaptador LoRA publicado por el usuario theunnecessarythings sobre el modelo base Qwen/Qwen3.8-27B. No es un modelo generativo al uso: recibe un estado o contexto, una pregunta y un conjunto de opciones, y devuelve una decisión acompañada de una probabilidad para cada opción, sin texto explicativo que haya que parsear. También admite preguntas de tipo sí/no con su probabilidad asociada. El problema que resuelve es el de la selección discreta y calibrada (por ejemplo, elegir herramienta, clasificar una intención o tomar una decisión binaria) dentro de un pipeline, sin depender de la generación libre de un LLM.

Técnicamente se compone de adaptadores LoRA de rango 8 (alpha 16) sobre un backbone de 27B en BF16, más una cabeza de decisión entrenada de 255 vías. Se entrenó con 160.017 ejemplos sintéticos del corpus JADE-Data, con etiquetas derivadas de programas, simuladores, solvers y estado estructurado. El motor de inferencia incluido limita cada llamada a 8.192 tokens (incluido el token de respuesta) y admite hasta 255 opciones por pregunta, con varias preguntas nombradas en una misma llamada.

La relevancia actual del modelo está en su enfoque: separa la decisión de la generación y expone probabilidades directamente, lo que facilita integrarlo en sistemas agénticos y de enrutamiento donde se necesita una salida estructurada y calibrada. Se publicó el 1 de octubre de 2026 bajo licencia Apache-2.0, con 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que carece todavía de validación comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen3.8-27B con adaptadores LoRA (rango 8, alpha 16) y cabeza de decisión de 255 vías; el detalle interno del backbone no se especifica en la información disponible |
| Parametros totales | 27B en el backbone; el repositorio pesa 0,5 GB (adaptadores LoRA y cabeza de decisión). Número exacto de parámetros entrenables: no disponible |
| Parametros activos | No aplica (no se describe como modelo MoE) |
| Longitud de contexto | 8.192 tokens incluyendo el token de respuesta, según el límite del motor de inferencia incluido. Contexto nativo del backbone: no disponible |
| Tipos de cuantizacion | No disponible; el entrenamiento se realizó con backbone en BF16 y los pesos se distribuyen en safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 para pesos y código original de la release; el prompt renderer está adaptado de AutoJev y su licencia MIT se incluye en LICENSE-AutoJev |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

JADE no es un modelo completo, sino un adaptador PEFT (LoRA) sobre Qwen/Qwen3.8-27B más una cabeza de decisión entrenada de 255 vías. El backbone se mantiene en BF16 y solo se entrenan los adaptadores y la cabeza. Los hiperparámetros declarados son rango 8, alpha 16, learning rate 5e-5, batch efectivo 128 y una única época sobre 160.017 ejemplos; el checkpoint seleccionado corresponde al paso 1.251. La información disponible no detalla la arquitectura interna del backbone, más allá de su identificador y su tamaño de 27B.

Los datos de entrenamiento provienen de JADE-Data, un corpus sintético de 160.017 ejemplos de toma de decisiones cuyas etiquetas se derivan de programas, simuladores, solvers y estado estructurado del mundo, cubriendo razonamiento, lenguaje, clasificación, recuperación, herramientas y decisiones probabilísticas. La innovación destacable es doble: por un lado, la salida es una distribución de probabilidad sobre opciones discretas (o una probabilidad de "sí" en preguntas binarias) en lugar de texto libre; por otro, se ajustó una temperatura de 0,288644 sobre una partición de calibración independiente, que el código de inferencia aplica a todas las preguntas. No se menciona en la información disponible el uso de RLHF ni DPO.

## Capacidades

- Toma de decisiones con salida estructurada: devuelve la opción elegida y un mapa de probabilidades para todas las opciones de la pregunta.
- Preguntas binarias de tipo "noul": devuelve la probabilidad de "sí".
- Selección de herramientas (tool-selection): diseñada explícitamente para enrutar peticiones hacia la herramienta correcta (calendario, correo, notas, etc.).
- Clasificación: etiquetado de entradas según categorías definidas por el usuario en el campo criteria.
- Recuperación y razonamiento: el corpus de entrenamiento incluye ejemplos de retrieval y razonamiento, según la ficha del autor.
- Múltiples preguntas nombradas en una sola llamada: se pueden pasar varias preguntas con nombre en el mismo request.
- Hasta 255 opciones por pregunta.
- Procesamiento de entradas de texto; las entradas que superan los límites configurados lanzan un error.
- Sin explicación generada: la respuesta no incluye justificación textual que haya que parsear.
- Capacidades no soportadas en esta release: entrada de imágenes y preguntas de tipo "score".
- Capacidades multilingües: no; el modelo está etiquetado únicamente para inglés.

## Casos de uso

- Enrutamiento de herramientas en agentes: dado el estado de la conversación y el catálogo de herramientas disponibles, JADE devuelve qué herramienta debe manejar la petición con su probabilidad, lo que permite fijar umbrales de confianza y escalar a un humano o a un LLM generativo cuando la probabilidad es baja.
- Atención al cliente automatizada: clasificación de la intención del usuario entre un conjunto acotado de categorías (facturación, incidencias, cancelaciones) con una distribución de probabilidad que permite activar respuestas automáticas solo por encima de un umbral.
- Moderación y decisión binaria de contenido: formulación de preguntas de tipo sí/no ("¿infringe esta política?") con probabilidad asociada, integrable en un pipeline de revisión por etapas.
- Triaje y priorización de tickets: elección entre niveles de prioridad o equipos de destino usando el estado estructurado del ticket como contexto.
- Automatización de asistentes personales: decidir entre crear una nota, mover un evento de calendario o buscar en el correo, como muestra el ejemplo de la model card con "Move my meeting with Sam to tomorrow at 3 pm".
- Enrutamiento de consultas en sistemas RAG: selección de la fuente o índice de recuperación más adecuado para cada pregunta, con probabilidad por fuente para detectar consultas ambiguas.
- Evaluación y anotación de conjuntos de datos: uso de la cabeza de decisión como clasificador calibrado para etiquetar ejemplos sintéticos o reales con una medida de confianza por clase.
- Sustitución de parseo de texto libre en pipelines existentes: al no generar explicación, se elimina la necesidad de extraer la decisión mediante expresiones regulares o parsers de JSON generados por un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe cómo ejecutar la suite oficial Decision Index (edición 0.2.1) mediante el motor `jade.index:DecisionIndexEngine`, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de la propia suite. Tampoco se han facilitado métricas de calibración, exactitud o latencia más allá de la temperatura ajustada (0,288644).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el backbone de 27B ocupa en torno a 54 GB solo en pesos, más el cache de inferencia y los adaptadores, lo que sitúa el total práctico en el rango de 60 a 80 GB según longitud de contexto y concurrencia. Cifra oficial: no disponible.
- GPU recomendadas: el autor probó esta release en una NVIDIA B200 con vLLM 0.30.0. Por capacidad de memoria, son adecuadas también A100 80 GB, H100 80 GB y H200 141 GB.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) en BF16. No se distribuyen pesos cuantizados oficialmente, por lo que no hay una ruta soportada para GPUs de consumo en esta release.
- Opciones de despliegue: el código de inferencia incluido requiere Python 3.11+ y vLLM 0.30.0 con el paquete `jade` y PYTHONPATH apuntando al directorio del modelo. No se mencionan soportes de llama.cpp, Ollama, TGI ni GGUF.
- Latencia y throughput: no disponible.
- Nota de despliegue: hace falta descargar el modelo con `hf download theunnecessarythings/JADE --local-dir ./jade-model`, lo que implica disponer de almacenamiento para el adaptador (0,5 GB) más el backbone Qwen3.8-27B, que debe estar accesible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos directamente comparables en la información proporcionada, por lo que la comparación numérica no es posible.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| JADE | Adaptador LoRA sobre 27B + cabeza de 255 vías | 8.192 tokens en el motor incluido | Decisión discreta con probabilidades, sin generación | Apache-2.0 | No disponible |
| Qwen/Qwen3.8-27B | 27B (no disponible el desglose) | No disponible | LLM generativo generalista | No disponible en la información proporcionada | No disponible |
| denis-pplx/autojev-27b | No disponible | No disponible | Decisión (origen del prompt renderer adaptado) | MIT (según la model card) | No disponible |
| Alternativas de enrutamiento/clasificación basadas en LLM generativo | No disponible | No disponible | Generación de texto parseada | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo puramente decisorio: no genera explicaciones ni texto libre, por lo que no sirve como asistente conversacional por sí solo.
- Riesgo de calibración incorrecta: las probabilidades devueltas dependen de la temperatura fijada (0,288644) y de la partición de calibración usada por el autor; no hay métricas públicas de calibración que respalden su fiabilidad fuera de esa distribución.
- Riesgo de alucinación en sentido amplio: al elegir entre opciones, el modelo puede asignar alta confianza a una opción incorrecta, especialmente si las opciones proporcionadas no cubren la decisión real.
- Límites duros de entrada: máximo 8.192 tokens incluyendo el token de respuesta y máximo 255 opciones por pregunta; superarlos provoca un error en el motor de inferencia.
- Idiomas: solo inglés etiquetado. No hay evidencia de funcionamiento correcto en castellano u otros idiomas.
- Sin soporte de visión ni de preguntas de tipo "score" en esta release.
- Dependencia del backbone: requiere cargar Qwen3.8-27B, con un coste de memoria y de licencia que debe verificarse por separado; la información proporcionada no detalla la licencia del modelo base.
- Licencia: los pesos y el código original son Apache-2.0, pero el prompt renderer procede de AutoJev (MIT), cuya licencia se incluye en LICENSE-AutoJev y debe conservarse al redistribuir.
- Madurez: 0 descargas y 0 likes en el momento de redactar la ficha, sin validación independiente ni informes de terceros.
- Autoría: publicada por un usuario individual (theunnecessarythings); el modelo se declara independiente y no afiliado a TypeSafe AI.
- Producción: al no publicarse benchmarks ni pruebas de estrés, se recomienda validarlo contra un conjunto propio antes de usarlo en rutas críticas y aplicar umbrales de confianza con fallback.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theunnecessarythings/JADE
- Dataset de entrenamiento: https://huggingface.co/datasets/theunnecessarythings/JADE-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Suite de evaluación Decision Index: https://github.com/apolinario/decision-index
- Prompt renderer de origen (AutoJev): https://huggingface.co/denis-pplx/autojev-27b
- Perfil del autor: https://huggingface.co/theunnecessarythings
