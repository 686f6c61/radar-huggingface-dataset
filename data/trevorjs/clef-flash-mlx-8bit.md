# TrevorJS/clef-flash-mlx-8bit

# Clef-flash-mlx-8bit (TrevorJS)

## Resumen
Clef-flash-mlx-8bit es la conversión no oficial a MLX del modelo Cloudflare/clef-flash, publicada por el usuario TrevorJS para ejecución en Apple Silicon. No se trata de un modelo generativo al uso: Clef-Flash es un modelo de decisión que, dado un estado (texto o JSON) y un esquema de preguntas tipadas (`choice`, `score`, `noul`), devuelve una probabilidad para cada opción permitida de cada pregunta en una sola pasada de prefill, sin generar texto. La conversión cuantiza el backbone Qwen3.5-9B a 8 bits afine con tamaño de grupo 64, conserva la cabeza de esquema conjunta (`joint_head`) en bf16 y elimina el codificador de visión, por lo que solo acepta entradas de texto.

El modelo cuenta con 8.953.801.728 parámetros (unos 8,95 mil millones) y un repositorio de 9,8 GB. Su relevancia práctica está en sustituir llamadas a LLM generativos por un clasificador estructurado de una sola pasada: la salida es directamente un conjunto de probabilidades sobre etiquetas definidas por el usuario, lo que simplifica el postprocesado y el enrutado en producción. Frente a la versión multimodal original de Cloudflare, esta conversión pierde imagen y vídeo, pero gana en eficiencia y portabilidad en equipos Mac con memoria unificada.

La licencia es Apache-2.0, heredada de Cloudflare/clef-flash y de su modelo base Qwen/Qwen3.5-9B. El repositorio no registra descargas ni "likes" en el momento de la consulta, y el propio autor declara que es una conversión no oficial, no respaldada por Cloudflare.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen3.5-9B (Clef-Flash) con cabeza de esquema conjunta (joint schema head); puerto MLX |
| Parametros totales | 8.953.801.728 (aproximadamente 8,95 mil millones) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Backbone en 8 bits afine con group size 64 (variante 4 bits disponible en TrevorJS/clef-flash-mlx-4bit); la cabeza conjunta se conserva en bf16 y se ejecuta en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX), mas joint_head.safetensors y clef_mlx.py |

## Arquitectura y entrenamiento
La arquitectura combina un backbone transformer Qwen3.5-9B con la cabeza de esquema conjunta de Clef (`JointSchemaHead`), que puntúa de forma conjunta todas las preguntas de un mismo registro. El modelo no decodifica tokens: codifica el estado y el esquema de preguntas (`encode_record`) y produce, en un único pase de prefill, una distribución de probabilidad sobre las opciones permitidas de cada pregunta. Clef-Flash es un modelo multimodal de decisión de 9B según la documentación de Cloudflare, capaz de leer el estado como texto, JSON, imágenes o vídeo; esta conversión descarta el codificador de visión y queda restringida a texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La conversión se realizó con `mlx-lm 0.31.3` y `mlx 0.32.3` mediante `python -m mlx_lm convert --hf-path Cloudflare/clef-flash --mlx-path clef-flash-mlx-8bit -q --q-bits 8 --q-group-size 64`, copiando después `joint_head.safetensors`, `joint_head_config.json` y `LICENSE` del repositorio original. El autor documenta tres verificaciones: la cabeza MLX coincide con la `JointSchemaHead` de PyTorch con una tolerancia de 4e-6 en los logits; `encode_record` reproduce los mismos token IDs, spans y option IDs que la versión original en 11 de 11 registros muestreados; y la cuantización es la única fuente de deriva, sin referencia bf16 ejecutada de extremo a extremo.

## Capacidades
- Decisión estructurada sin generación de texto: devuelve `{question_id: {option_id: probabilidad}}` para todas las preguntas de un registro en una sola pasada.
- Tipos de pregunta soportados: `choice` (elección entre opciones con criterios), `score` (puntuación ordinal sobre una lista de criterios) y `noul` (binaria verdadero/falso).
- Puntuación conjunta: todas las preguntas de un registro se evalúan simultáneamente, lo que permite coherencia entre decisiones relacionadas (por ejemplo, departamento y urgencia).
- Entrada de estado en texto libre o JSON, con plantilla de chat y tokenizador del release original.
- Salida probabilística calibrada por opción, apta para umbrales y reglas de negocio posteriores.
- Capacidades multimodales (imagen y vídeo): no soportadas en esta conversión, ya que el codificador de visión fue eliminado.
- Tool calling, function calling y razonamiento multi-paso: no disponibles; el modelo no genera texto ni sigue bucles de agente.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso
- Enrutado de tickets de soporte: el modelo recibe el texto del ticket como estado y un esquema con preguntas `choice` (departamento) y `score` (urgencia), y devuelve probabilidades como `{'department': {'billing': 0.043, 'technical': 0.957}, 'urgency': {'2': 0.832}}`. Es el ejemplo incluido en la model card y evita mantener un LLM generativo para una tarea de clasificación pura.
- Detección de incidentes y estados de servicio: con preguntas de tipo `noul` ("¿hay un servicio caído?") se obtiene una probabilidad binaria (0.818/0.182 en el ejemplo del autor) que puede alimentar un sistema de alertas o un runbook automatizado.
- Triaje de colas de atención con priorización ordinal: la pregunta `score` con criterios como "puede esperar / esta semana / hoy" produce una distribución sobre niveles, útil para asignar SLA sin necesidad de definir umbrales manuales sobre texto libre.
- Moderación y clasificación de contenido con etiquetas definidas por el usuario: al aceptar un esquema arbitrario de opciones, se puede adaptar a taxonomías propias de la plataforma y usar la probabilidad por opción para decidir entre revisión humana o acción automática.
- Etiquetado de datasets a escala: al ser una única pasada de prefill sin decodificación autorregresiva, permite procesar grandes volúmenes de registros con coste predecible; la variante de 4 bits reduce el consumo a 5,9 GB y la latencia a 2,9 s por registro agregado en un M2.
- Enrutado de herramientas en pipelines de agentes: un clasificador de decisión puede determinar qué herramienta o rama corresponde antes de invocar un LLM generativo, reduciendo el coste de las comprobaciones previas. En esta conversión queda limitado a texto, lo que cubre la mayoría de los routers basados en la consulta del usuario.
- Verificación de coherencia en preprocesado de formularios: dado un JSON con campos y un esquema de preguntas de validación (`noul`), el modelo puede señalar qué condiciones se cumplen, con la probabilidad asociada como medida de confianza.

## Benchmarks y rendimiento
Resultados publicados por el autor sobre JevBench (231 ítems públicos, commit fijado `bb05a335`), evaluados con el código de este repositorio en un Apple M2 de 24 GB:

| Variante | Total | Easy | Standard | Hard | Memoria pico | Latencia mediana (M2) |
|---|---|---|---|---|---|---|
| 8 bits | 188/231 | 48/48 | 71/72 | 69/111 | 10,1 GB | 4,8 s |
| 4 bits | 182/231 | 48/48 | 68/72 | 66/111 | 5,9 GB | 2,9 s |

Las dos variantes eligen la misma opción en 216 de 231 ítems, con una diferencia mediana de 0,011 en la probabilidad máxima por opción. El autor advierte que la latencia corresponde a una única máquina M2 y no es representativa del modelo en un servidor con GPU. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware
- VRAM o memoria unificada estimada: 10,1 GB de pico para la variante de 8 bits y 5,9 GB para la de 4 bits, según las mediciones del autor en un M2 de 24 GB.
- GPU recomendadas: no disponibles. El puerto está escrito para MLX, por lo que el destino natural es Apple Silicon (se ha verificado en un M2); no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: en el ecosistema Apple, sí en equipos con memoria unificada suficiente (el autor ha validado 24 GB). Para GPUs NVIDIA no hay soporte documentado en este repositorio.
- Opciones de despliegue: `mlx-lm` (probado con mlx-lm 0.31.3 y mlx 0.32.3) más `huggingface_hub` para descargar el snapshot; la carga se hace con `from clef_mlx import load, decide`. No se proporcionan pesos GGUF, por lo que llama.cpp, Ollama y TGI no son opciones directas con este repositorio; tampoco se documenta compatibilidad con vLLM.
- Latencia y throughput: latencia mediana de 4,8 s por lote de 231 ítems agregados en la variante de 8 bits y 2,9 s en la de 4 bits sobre un M2. No se han publicado cifras de throughput ni de latencia por ítem en GPU.
- Tamano del repositorio: 9,8 GB, a tener en cuenta para el almacenamiento local y la descarga del snapshot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|---|
| TrevorJS/clef-flash-mlx-8bit | 8,95 B (8 bits) | no disponible | No (vision eliminada) | safetensors MLX, mlx-lm | Apache-2.0 | 188/231 en JevBench; 10,1 GB de pico en M2 |
| TrevorJS/clef-flash-mlx-4bit | 8,95 B (4 bits) | no disponible | No (vision eliminada) | safetensors MLX, mlx-lm | Apache-2.0 | 182/231 en JevBench; 5,9 GB de pico y 2,9 s en M2 |
| Cloudflare/clef-flash (original) | 9 B | no disponible | Si (texto, JSON, imagen, vídeo) | Pesos originales con `joint_schema_model.py` | Apache-2.0 | Modelo de decisión de referencia del que deriva esta conversión |
| Alternativas generativas de ~9 B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas con modelos generativos equivalentes en la información proporcionada |

## Limitaciones y advertencias
- Conversión no oficial: no está realizada ni respaldada por Cloudflare; cualquier problema de fidelidad respecto al original es responsabilidad del conversor.
- Solo texto: el codificador de visión fue eliminado, por lo que no admite entradas de imagen ni de vídeo, a diferencia de Cloudflare/clef-flash.
- El modelo no genera texto: no sirve para tareas de redacción, resumen, diálogo ni razonamiento en cadena. Su salida son probabilidades sobre opciones predefinidas.
- Riesgo de alucinación textual: no aplica en el sentido habitual, pero sí existe riesgo de sobreconfianza o mala calibración en las probabilidades devueltas, especialmente en ítems difíciles (69/111 aciertos en la franja "hard" de JevBench).
- Deriva por cuantización: el autor no ejecutó una referencia bf16 de extremo a extremo, por lo que la pérdida de precisión respecto al original no está cuantificada más allá de la comparación entre las variantes de 8 y 4 bits.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- Longitud de contexto: no disponible; conviene validar empíricamente estados largos antes de usarlo en producción.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad.
- Licencia Apache-2.0: permite uso comercial y modificación, siempre que se conserven los avisos de copyright y licencia; el archivo `LICENSE` se copia del repositorio original.
- Portabilidad limitada: al estar basado en MLX, el despliegue está restringido a Apple Silicon salvo que se realice una conversión adicional a otro runtime; no hay pesos GGUF publicados.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/TrevorJS/clef-flash-mlx-8bit
- Variante de 4 bits: https://huggingface.co/TrevorJS/clef-flash-mlx-4bit
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Anuncio de Clef en el blog de Cloudflare: https://blog.cloudflare.com/clef-decision-models/
- Documentación de clef-flash en Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/clef-flash/
- MLX: https://github.com/ml-explore/mlx
- Modelos compatibles con MLX en HuggingFace: https://huggingface.co/models?library=mlx
