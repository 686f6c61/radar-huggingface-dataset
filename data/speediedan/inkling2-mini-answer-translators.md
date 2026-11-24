# speediedan/inkling2-mini-answer-translators

## Resumen

Los "answer translators" de Inkling 2 Mini son un conjunto de artefactos de interpretabilidad publicados por el usuario speediedan en Hugging Face. No se trata de un modelo de lenguaje completo, sino de un fichero de pesos auxiliares (`translators.safetensors`) que contiene lecturas afines de bajo rango sobre el estado oculto del modelo Inkling 2 Mini en la posición de lectura de una pregunta de chat. Cada lector aplica una transformación `h' = h + (h A) B + b` al estado que sale de una visita de capa concreta, seguida de la normalización final y el unembedding del propio modelo.

El objetivo es recuperar la distribución de respuesta de un solo token que el modelo genera en la posición de lectura, sin necesidad de ejecutar el resto de la red. Se entrenaron sobre preguntas aritméticas generadas por el propio autor ("What is 7 + 2? Answer in one word." y variantes), usando como objetivo la propia distribución de respuesta del modelo (sin clave de respuestas) y validando con operandos distintos. Forman parte de la entrada del equipo interpretune al Looped Lens Challenge como uno de los diez puntos de lectura.

El interés actual es acotado pero relevante para la comunidad de interpretabilidad mecanicista: los ficheros permiten inspeccionar cómo se forma la respuesta en capas intermedias de un transformer con capas repetidas (loop), y sirven como componente reutilizable en pipelines de logit-lens. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos son de dimensión reducida y no incluyen el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lectores afines de bajo rango (A, B, b) sobre el estado oculto de Inkling 2 Mini en la posición de lectura; no es un modelo independiente |
| Parametros totales | no disponible (el repo ocupa 0.0 GB; número exacto de parámetros de A, B y b no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en bf16) |
| Idiomas soportados | no disponible (las preguntas de entrenamiento están en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`translators.safetensors`, bf16) |

## Arquitectura y entrenamiento

El artefacto no es un transformer entrenado desde cero, sino un conjunto de readouts afines de bajo rango aplicados sobre las activaciones de Inkling 2 Mini. Para cada visita de capa incluida, el fichero contiene tres tensores con claves `A.<visit>`, `B.<visit>` y `b.<visit>` en bf16. La transformación se aplica al estado que abandona una visita de capa en la posición de lectura, y después se reutilizan la normalización final y el unembedding del propio modelo para obtener la distribución sobre el vocabulario. El rango de la factorización (dimensión interna de A y B) no se especifica en la model card.

El entrenamiento se realizó con preguntas aritméticas generadas por el autor ("What is 7 + 2? Answer in one word." y variantes), tomando como objetivo la distribución de respuesta del propio modelo en lugar de una respuesta correcta etiquetada. La validación se hizo con preguntas aritméticas de operandos distintos, lo que mide generalización dentro de la misma familia de tareas. El modelo base Inkling 2 Mini tiene 48 visitas de capa en orden de ejecución (visitas 0 a 47), con las capas 6 a 17 ejecutadas tres veces, lo que indica una arquitectura con repetición de capas (looped transformer). Los lectores publicados cubren la visita 44 de 48. No se documentan detalles sobre número de tokens de entrenamiento, tamaño del dataset, optimizador ni si hubo RLHF o DPO, ya que no aplica a este tipo de artefacto.

## Capacidades

- Extracción de la distribución de respuesta de un solo token en la posición de lectura a partir del estado oculto de la visita 44 de Inkling 2 Mini.
- Aplicación de una transformación afín de bajo rango seguida de la normalización final y el unembedding del modelo base, sin ejecutar las capas posteriores a la visita seleccionada.
- Soporte de logit-lens sobre capas intermedias en un transformer con capas repetidas (visitas 0 a 47, capas 6 a 17 ejecutadas tres veces).
- Uso como punto de lectura entre los diez empleados por la entrada del equipo interpretune al Looped Lens Challenge.
- No incluye generación de texto autónoma, tool calling, capacidades de agente, visión, audio ni modo thinking: es un componente de análisis, no un modelo conversacional.
- Idiomas: no disponible; las preguntas de entrenamiento y validación están en inglés.

## Casos de uso

- Análisis de logit-lens en capas intermedias: cargar `translators.safetensors` y aplicar el lector de la visita 44 sobre el estado oculto en la posición de lectura para obtener la distribución de respuesta sin ejecutar el resto de la red. Útil para estudiar en qué punto del cómputo emerge la respuesta aritmética.
- Investigación en interpretabilidad mecanicista de transformers con capas repetidas: comparar la distribución recuperada en la visita 44 con la salida final del modelo para medir cuánta información de la respuesta ya está presente antes de completar el forward pass.
- Reproducción de resultados del Looped Lens Challenge: integrar los lectores como uno de los diez puntos de lectura de la entrada del equipo interpretune y verificar las métricas publicadas.
- Auditoría de sesgos en la formación de respuestas: examinar la distribución de un solo token en capas intermedias para detectar preferencias léxicas o sesgos que se consolidan antes de la capa final.
- Docencia y divulgación sobre logit-lens: usar el fichero como ejemplo mínimo y reproducible de readout afín de bajo rango sobre un modelo pequeño, con licencia MIT y pesos en bf16.
- Desarrollo de nuevas técnicas de lectura: emplear estos lectores como línea base para comparar con otras aproximaciones (sondas lineales, MLP probes, decodificación especulativa de estados) sobre el mismo modelo y la misma tarea aritmética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0.0 GB y los pesos son bf16, por lo que los lectores en sí caben en cualquier GPU consumer. El requisito dominante es el del modelo base Inkling 2 Mini, que no se distribuye en este repositorio.
- GPU recomendadas: no disponible para el modelo base; para los lectores, cualquier GPU con soporte bf16 (por ejemplo, RTX 3090, RTX 4090, A100, H100) es suficiente.
- Cabe en GPU consumer: sí, los lectores; el modelo base depende de su tamaño, no especificado en la información disponible.
- Opciones de despliegue: carga directa con `safetensors` y PyTorch; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo completo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| speediedan/inkling2-mini-answer-translators | Lectores afines de bajo rango para logit-lens | no disponible | no disponible | MIT | Hugging Face, 0 descargas |
| Modelos comparables de logit-lens / probes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas equivalentes de readouts de bajo rango publicadas para el mismo modelo base u otros modelos con capas repetidas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto de forma autónoma ni puede usarse como sustituto de Inkling 2 Mini. Requiere el modelo base y acceso a sus activaciones internas.
- Los lectores se entrenaron únicamente con preguntas aritméticas en inglés y se validaron con operandos distintos; su generalización a otras tareas, idiomas o formatos de pregunta no está documentada.
- Solo se publica la visita 44 de 48; no hay lectores para el resto de visitas, lo que limita el análisis a una única profundidad.
- El objetivo de entrenamiento es la distribución del propio modelo, no una clave de respuestas, por lo que los lectores reproducen también los errores y sesgos del modelo base.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la distribución recuperada puede reflejar respuestas incorrectas del modelo base con alta confianza.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece garantía alguna sobre el comportamiento de los artefactos.
- El repositorio tiene 0 descargas y 0 likes, y no se documentan métricas de fidelidad de los lectores frente a la salida real del modelo; conviene validar antes de usarlos en producción o en publicaciones.
- No se especifican los idiomas soportados ni el rango de la factorización de bajo rango, lo que dificulta estimar su capacidad de representación.

## Enlaces

- Hugging Face: https://huggingface.co/speediedan/inkling2-mini-answer-translators
- Looped Lens Challenge (referenciado en la model card, sin URL directa en la información disponible): no disponible
- Equipo interpretune: no disponible
