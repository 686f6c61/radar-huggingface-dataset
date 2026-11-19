# vllm-sr/d3-turbo

## Resumen

d3-turbo es un modelo de decisión multimodal de 26.090 millones de parámetros (incluido un codificador visual de 0,46B) desarrollado por el equipo de vLLM Semantic Router. No es un modelo generativo al uso: recibe una entrada (texto o JSON, opcionalmente con imágenes y vídeos) junto con una o varias preguntas, y devuelve directamente una probabilidad para cada respuesta posible, sin generar texto. Admite cinco tipos de decisión: elección entre opciones, sí/no, puntuación en una escala, caja delimitadora (para localizar objetos en imágenes y momentos de vídeo) y seguimiento (tracking) a lo largo de un clip completo.

Se presenta como la versión mejorada de d3 dentro de la familia Decision 3.0, orientada a enrutamiento semántico y clasificación zero-shot. Su innovación principal es el paradigma "state once": lee la entrada una sola vez por petición y responde a todas las preguntas planteadas sobre ella, lo que reduce drásticamente el coste cuando se hacen muchas preguntas sobre el mismo contenido (hasta 255 preguntas sobre una misma imagen). Frente a d3-flash, que relee la entrada por cada pregunta, d3-turbo es más lento con una sola pregunta pero hasta 15,5 veces más rápido con 255.

El modelo se apoya en la arquitectura qwen3_5 con capas de atención lineal (compatible con los kernels de `flash-linear-attention`) y un codificador visual propio. Soporta un contexto de 131.072 tokens por pregunta con `long_context=True` (32.768 por defecto), se distribuye bajo licencia Apache-2.0 y está pensado para desplegarse en aceleradores como AMD Instinct MI325X.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en qwen3_5 con capas de atención lineal y codificador visual integrado |
| Parametros totales | 26.085.330.160 (26,09B), incluidos 0,46B del codificador visual |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens por pregunta con `long_context=True`; 32.768 por defecto |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

d3-turbo emplea una arquitectura derivada de qwen3_5 que combina capas de atención estándar con capas de atención lineal, para las que se ofrecen kernels GPU opcionales mediante el paquete `flash-linear-attention`. Incorpora un codificador visual de 0,46B de parámetros que procesa imágenes y vídeos, y expone una interfaz unificada `system_one` que acepta texto o JSON como estado, junto con imágenes o vídeos y un conjunto de preguntas tipadas (choice, noul, score, box, track). El modelo no genera texto: produce directamente probabilidades calibradas para cada respuesta.

No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La model card menciona un "kit oficial 0.3" para la evaluación sobre el suite público y un "Jev Decision Index" propio (estimación del autor, no un leaderboard oficial), pero no documenta el procedimiento de entrenamiento.

## Capacidades

- Clasificación zero-shot con elección entre varias opciones, devolviendo probabilidad por cada opción.
- Preguntas de sí/no (tipo `noul`) con probabilidad calibrada.
- Puntuación en una escala (tipo `score`).
- Localización de objetos en imágenes mediante cajas delimitadoras (tipo `box`) con confianza calibrada: 0,90 de precisión a IoU 0,5 y AUROC de confianza de 0,96 en el conjunto de prueba del autor.
- Seguimiento de objetos en vídeo (tipo `track`) con 1 o 2 actualizaciones por segundo, incluyendo probabilidad de visibilidad del objetivo: AUC de éxito 0,79/0,80 y F1 de presencia 0,97 en los clips de prueba del autor.
- Procesamiento multimodal: varias imágenes y vídeos por petición; las imágenes pueden insertarse también dentro de preguntas y opciones, visibles solo para esa pregunta (0,96 de precisión en las preguntas de prueba con imágenes, +0,31 respecto a d3).
- Procesamiento por lotes de hasta 255 preguntas sobre una misma entrada en una sola lectura del estado.
- Contexto largo de hasta 131.072 tokens por pregunta.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso en el sentido de los modelos generativos; su salida son probabilidades de decisión.
- Idiomas soportados: no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, clasificar el equipo responsable (facturación, soporte técnico, etc.) y determinar si es urgente, con una sola llamada y probabilidades por categoría. El ejemplo de la model card ilustra exactamente este flujo.
- Moderación y clasificación de contenido zero-shot: evaluar textos o JSON contra criterios definidos en tiempo de ejecución sin reentrenar, aprovechando la salida probabilística para fijar umbrales.
- Anotación automática de imágenes para datasets de visión: plantear varias preguntas de tipo `box` sobre una misma foto en una única petición (p. ej., localizar varios objetos), reduciendo el coste frente a modelos que releen la imagen por pregunta.
- Seguimiento de objetos en vídeo para análisis deportivo o de vigilancia: obtener una caja por instante con probabilidad de visibilidad del objetivo a lo largo de un clip, útil para post-procesado o etiquetado.
- Selección visual por comparación: preguntas cuyas opciones son imágenes (p. ej., "¿qué imagen muestra el mismo tipo de animal?"), con cada opción visible solo para su pregunta.
- Clasificación de documentos largos: con `long_context=True` y 131.072 tokens, evaluar contratos, informes o expedientes completos contra múltiples criterios en una sola pasada.
- Enrutamiento semántico en infraestructuras de LLM: integración en vLLM Semantic Router para decidir qué modelo o ruta atenderá una petición, dado que el modelo está diseñado específicamente para ese rol.

## Benchmarks y rendimiento

Los datos siguientes son estimaciones del autor publicadas en la model card, no resultados de leaderboards oficiales.

| Benchmark | d3-turbo | d3 | d3-flash |
|---|---|---|---|
| Jev Decision Index (texto) | 70,2 | 66,3 | no disponible |
| Suite público (kit oficial 0.3), texto | 71,7 | 65,5 | no disponible |
| Jev Decision Index (visión) | 72,9 | 71,3 | no disponible |
| Box, precisión a IoU 0,5 | 0,90 | no disponible | no disponible |
| Box, AUROC de confianza | 0,96 | no disponible | no disponible |
| Tracking, AUC de éxito | 0,79 / 0,80 | no disponible | no disponible |
| Tracking, F1 de presencia | 0,97 | no disponible | no disponible |
| Preguntas con imágenes en opciones, precisión | 0,96 | 0,65 (implícito, +0,31) | no disponible |

Rendimiento de servicio (una AMD Instinct MI325X, AutoModel), con 1 a 255 preguntas sobre la misma foto: d3-turbo tarda entre 302 ms y 2,12 s; d3-flash entre 154 ms y 32,94 s. d3-flash es más rápido con 1 pregunta; d3-turbo lo supera a partir de 4 preguntas y es 15,5 veces más rápido con 255.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 26,09B parámetros en safetensors (repo de 104,4 GB), la inferencia en precisión nativa requiere del orden de 52 GB o más de memoria, además del coste del codificador visual y del procesamiento de vídeo; no se documentan cuantizaciones.
- GPU recomendadas: la model card cita una AMD Instinct MI325X como plataforma de referencia para servir el modelo con contexto largo. No se especifican otras GPU validadas.
- GPU de consumo: no disponible; por tamaño, no cabe en GPU de consumo habituales sin cuantización, y no se publican pesos cuantizados.
- Opciones de despliegue: `transformers` (versión 5.17.0) con `AutoModel` y `trust_remote_code=True`; kernels GPU opcionales con `flash-linear-attention`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: entre 302 ms y 2,12 s para 1 a 255 preguntas sobre una misma imagen en una MI325X (AutoModel). Para texto y vídeo no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-turbo | 26,09B (0,46B visión) | 131.072 tokens (long_context) | Decisión multimodal, lectura única del estado | Apache-2.0 | Hugging Face, API gratuita, Space oficial |
| d3 | no disponible | no disponible | Decisión multimodal (generación anterior) | no disponible | Referenciado en la model card |
| d3-flash | no disponible | no disponible | Decisión multimodal con relectura por pregunta | no disponible | Referenciado en la model card |

No se dispone de datos sobre otros modelos comparables de la misma categoría (clasificación zero-shot multimodal con salida probabilística) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, por lo que no sirve para tareas de generación, resumen o diálogo.
- Los resultados del Jev Decision Index son estimaciones del propio autor, no resultados de leaderboards oficiales; conviene tratarlos con cautela.
- No se documentan sesgos conocidos, pero al ser un clasificador zero-shot hereda los sesgos de sus datos de entrenamiento, cuyo contenido no se detalla.
- Riesgo de calibración deficiente fuera de la distribución de los conjuntos de prueba del autor; las probabilidades deben validarse en el dominio de despliegue.
- Idiomas soportados no disponibles: no hay garantía documentada de rendimiento multilingüe.
- Contexto por defecto de 32.768 tokens; el contexto largo requiere activar `long_context=True` explícitamente.
- Requiere `trust_remote_code=True` y una versión concreta de transformers (5.17.0), lo que añade riesgo operativo en producción.
- Licencia Apache-2.0 permite uso comercial, pero no se especifican condiciones adicionales sobre los datos de entrenamiento ni sobre las dependencias opcionales (`flash-linear-attention`).
- El rendimiento de servicio medido se limita a una AMD Instinct MI325X con AutoModel; no hay datos de latencia en otras plataformas ni con otros backends.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/d3-turbo
- Space oficial: https://huggingface.co/spaces/vllm-sr/d3-turbo
- API gratuita de prueba: https://decision.vllm-sr.ai
- Repositorio de vLLM Semantic Router: https://github.com/vllm-project/semantic-router
