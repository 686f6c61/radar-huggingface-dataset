# suryatmodulus/clef-flash

## Resumen

Clef-Flash es un modelo multimodal de 9B parametros especializado en toma de decisiones estructuradas, no en generacion de texto libre. Desarrollado por Cloudflare dentro de su familia Clef, recibe un "estado" (texto, JSON, imagenes o video) junto con un esquema de preguntas tipadas y devuelve, en una sola pasada forward, una probabilidad para cada opcion permitida de cada pregunta. El repositorio publicado bajo la cuenta `suryatmodulus` es un espejo del modelo, cuyo original aparece referenciado como `Cloudflare/clef-flash` en la propia model card y en la documentacion de Cloudflare Workers AI.

La relevancia de este modelo reside en su enfoque: elimina la generacion autoregresiva de texto y el posterior parseo de la salida. En su lugar, incorpora una cabeza conjunta de esquema ("joint schema head") sobre el backbone Qwen3.5-9B que puntua simultaneamente todas las opciones de todas las preguntas, lo que reduce la latencia y elimina los errores de formato en pipelines de clasificacion y enrutado. Esta disenado para integrarse en APIs compatibles con Jev y SystemOne.

Con 9.409.813.744 parametros reales (segun safetensors) y un repositorio de 19,1 GB, se posiciona como un modelo de gama media-alta orientado a produccion. Su licencia Apache-2.0 facilita el uso comercial, aunque el modelo tiene cero descargas y cero likes en el momento de redactar esta ficha, por lo que su validacion externa es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen3.5-9B (con vision encoder) mas una cabeza conjunta de esquema ("joint schema head") que puntua opciones |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como especificacion oficial del backbone; `encode_record` usa `max_length` de 16.384 tokens por defecto, con `max_state_tokens` para acotar la entrada |
| Tipos de cuantizacion | No disponible (el autor solo publica safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors fragmentados (`model-*.safetensors` + `model.safetensors.index.json`), mas `joint_head.safetensors` para la cabeza |

## Arquitectura y entrenamiento

Clef-Flash se construye mediante post-entrenamiento sobre `Qwen/Qwen3.5-9B`, conservando su vision encoder. Sobre las representaciones ocultas finales del backbone se anade una cabeza conjunta de esquema: un transformer pequeno que enruta la evidencia del estado hacia cada pregunta y puntua conjuntamente todas las opciones de todas las preguntas. La salida es un logit por cada opcion permitida; aplicando un softmax por pregunta se obtienen probabilidades. Esto implica que el modelo no genera texto libre ni requiere parseo posterior.

El esquema de entrada admite tres tipos de pregunta: `noul` (verdadero/falso, devuelve la probabilidad de verdadero), `choice` (opciones con nombre, con un mapa de identificador a descripcion en `criteria`) y `score` (opciones ordenadas, indexadas desde 0). El campo `state` acepta cualquier cadena o valor JSON, y de forma opcional listas de imagenes (`images`, como objetos PIL) o de fotogramas de video (`videos`, como arrays de fotogramas), con `media_kwargs` para el procesador. Se pueden mezclar registros de solo texto y multimodales en el mismo lote.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La model card menciona que el modelo se probo con `torch` 2.11 y `transformers` 5.10.2 sobre una unica GPU H200, y que las entradas de imagen y video requieren `pillow`. El codigo personalizado se distribuye en `joint_schema_model.py`, que incluye la codificacion de registros, el batching, el modelo, `load_release_model` y `systemone`.

## Capacidades

- Decision estructurada multimodal: convierte un estado (texto, JSON, imagenes o video) en probabilidades sobre opciones tipadas, en una sola pasada forward.
- Preguntas de tipo `noul`: salida booleana expresada como probabilidad de verdadero.
- Preguntas de tipo `choice`: clasificacion sobre opciones con nombre y descripcion textual de cada una.
- Preguntas de tipo `score`: puntuacion sobre opciones ordenadas, con score esperado, leyenda y probabilidades.
- Entrada multimodal: imagenes (PIL) y video (arrays de fotogramas) ademas de texto y JSON.
- Batching mixto: permite mezclar registros de solo texto y multimodales en el mismo lote, con `max_length` y `max_state_tokens` como cotas de entrada.
- Compatibilidad de API: la salida sigue el formato de Jev y SystemOne (`POST /v1/systemone`), devolviendo `model`, `answers` por ID de pregunta y `usage`.
- Sin generacion libre de texto: no hay decoding autoregresivo ni parseo de salida que pueda fallar por formato.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente multi-paso: no documentadas; el modelo resuelve decisiones en una unica inferencia, no bucles de razonamiento.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo "thinking" y generacion de codigo: no aplicables ni documentados.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una incidencia, el modelo devuelve en una sola pasada la probabilidad de cada departamento (facturacion, tecnico, etc.) y una puntuacion de urgencia con opciones ordenadas, lo que permite alimentar un sistema de colas sin parseo de texto generado.
- Revision de facturas y documentos escaneados: enviando la imagen del documento en `images` y preguntas de tipo `noul` o `choice` (por ejemplo, "el total es legible", "el estado es pagado/vencido/borrador"), se obtienen probabilidades calibradas para decidir si el documento pasa a validacion automatica o a revision humana.
- Clasificacion de contenido y moderacion: con un esquema de opciones cerradas, el modelo asigna probabilidad a cada categoria permitida, lo que facilita umbrales de decision auditables en lugar de texto libre dificil de evaluar.
- Triage de incidencias en produccion: a partir de un estado en JSON con metricas y logs, preguntas tipo `noul` ("hay un servicio caido") y `score` ("urgencia") permiten activar alertas o escalados con una latencia de una sola inferencia.
- Procesamiento de video para monitorizacion: al aceptar arrays de fotogramas, puede responder preguntas booleanas o de eleccion sobre eventos observados en el video, util en inspeccion visual o vigilancia de procesos.
- Enriquecimiento de pipelines de datos: al devolver una distribucion de probabilidad por pregunta, es posible fijar umbrales de confianza y derivar solo los casos dudosos a un humano, reduciendo coste de anotacion.
- Extraccion de decisiones en formularios y encuestas: el tipo `score` con criterios ordenados (por ejemplo, "puede esperar", "esta semana", "hoy") produce un score esperado y su leyenda, apto para priorizacion automatica.
- Sustitucion de clasificadores especificos: un unico modelo multimodal con esquema configurable puede reemplazar varios clasificadores entrenados por separado para texto e imagen, simplificando el mantenimiento del stack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una seccion de resultados con un "Decision Index" y un enlace a un leaderboard interno (`clef-evals.workers-ai-mle.workers.dev`), pero los valores numericos aparecen truncados en la informacion proporcionada, por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 18,8 GB solo para los pesos (9,41B parametros), mas cache KV y activaciones; en la practica se recomienda reservar entre 24 y 32 GB para secuencias largas.
- VRAM estimada en fp32: aproximadamente 37,6 GB solo para pesos; no recomendado para produccion.
- Cuantizaciones de 8 y 4 bits: no publicadas por el autor. Como referencia teorica basada en el numero de parametros, una cuantizacion int8 requeriria unos 9,4 GB y una de 4 bits unos 4,7 GB, pero no hay artefactos oficiales en esos formatos.
- GPU recomendadas: el autor indica que probo el modelo con `torch` 2.11 y `transformers` 5.10.2 sobre una unica H200. Una A100 de 40 GB o 80 GB, o una H100, son opciones holgadas.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB puede alojar los pesos en bf16, pero el margen para cache KV y activaciones es ajustado; la viabilidad depende de la longitud de la entrada y del tamano del lote.
- Opciones de despliegue: al requerir codigo personalizado (`joint_schema_model.py`), la ruta soportada es `transformers` cargando el repositorio y el modulo propio. No hay evidencia en la informacion disponible de soporte para vLLM, llama.cpp, Ollama o TGI, ya que la cabeza conjunta y el formato de salida no son estandar.
- Latencia y throughput: no disponibles. La unica referencia del autor es una ejecucion en una unica H200, sin cifras de tokens por segundo ni latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clef-Flash | 9,41B | No disponible (16.384 tokens por defecto en `encode_record`) | Probabilidades por opcion tipada | Apache-2.0 | HuggingFace (repositorio `suryatmodulus/clef-flash` y referencia a `Cloudflare/clef-flash`) |
| Clef (variante mayor) | No disponible | No disponible | Probabilidades por opcion tipada | No disponible en la informacion proporcionada | HuggingFace (`Cloudflare/clef`) |
| Qwen/Qwen3.5-9B (modelo base) | No disponible | No disponible | Generacion de texto libre | No disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto libre: cualquier caso de uso que requiera respuestas abiertas, resumenes o razonamiento explicito queda fuera de su diseno.
- Al devolver probabilidades, existe riesgo de calibracion deficiente; no se han publicado metricas de fiabilidad ni de calibracion en la informacion disponible.
- Riesgo de alucinacion: aunque no produce texto, puede asignar alta probabilidad a opciones incorrectas cuando el estado es ambiguo o esta fuera de la distribucion de entrenamiento.
- No hay informacion sobre idiomas soportados, cobertura multilingue ni sesgos conocidos.
- El modelo depende de codigo personalizado (`joint_schema_model.py`), lo que obliga a ejecutar codigo del repositorio y a revisarlo antes de usarlo en produccion.
- Existe una discrepancia de identificadores: el repositorio consultado es `suryatmodulus/clef-flash`, mientras que la model card y la documentacion apuntan a `Cloudflare/clef-flash`. Conviene verificar cual es el repositorio canonico y si el espejo esta actualizado.
- El repositorio registra cero descargas y cero likes, y la fecha de creacion y ultima actualizacion son identicas, lo que sugiere ausencia de validacion externa y de mantenimiento posterior.
- Las versiones indicadas por el autor (`torch` 2.11 y `transformers` 5.10.2) son muy recientes; puede haber incompatibilidades con entornos mas antiguos.
- No se han publicado requisitos de hardware oficiales mas alla de la mencion a una unica H200, ni guias de cuantizacion para reducir VRAM.
- Aunque la licencia Apache-2.0 permite uso comercial, deben revisarse las condiciones del modelo base Qwen3.5-9B y del vision encoder, no detalladas en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/suryatmodulus/clef-flash
- Repositorio referenciado como original: https://huggingface.co/Cloudflare/clef-flash
- Variante mayor: https://huggingface.co/Cloudflare/clef
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Anuncio en el blog de Cloudflare: https://blog.cloudflare.com/clef-decision-models
- Leaderboard del Decision Index: https://clef-evals.workers-ai-mle.workers.dev
- Documentacion en Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/clef-flash/
