# suryatmodulus/clef

## Resumen

Clef es un modelo multimodal de 27.356.728.560 parametros (unos 27,36 mil millones) desarrollado por suryatmodulus y publicado en HuggingFace. No es un modelo generativo de texto libre: su funcion es convertir un estado (texto, JSON, imagenes o video) junto con un esquema de preguntas tipadas en un conjunto de decisiones, devolviendo una probabilidad para cada opcion permitida de cada pregunta en un unico forward pass. Esto elimina por completo el parsing de la salida, un problema clasico en pipelines de clasificacion y enrutado.

El modelo parte de Qwen/Qwen3.8-27B mediante post-entrenamiento (finetune) y conserva su encoder de vision. Sobre el backbone se anade una cabeza de esquema conjunta (*joint schema head*), un transformer pequeno que lee los estados ocultos finales del backbone, enruta la evidencia del estado hacia cada pregunta y puntua conjuntamente todas las opciones de todas las preguntas. La salida son logits por opcion, a los que se aplica un softmax por pregunta.

Su relevancia actual radica en que cubre un nicho poco atendido: decisiones estructuradas, auditables y con confianza calibrada, en lugar de generacion abierta. La model card lo vincula a una infraestructura propia (API compatible con Jev y SystemOne) y a un leaderboard interno denominado Decision Index. La licencia es Apache-2.0 y el modelo se distribuye como safetensors fragmentados junto con codigo personalizado obligatorio para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen/Qwen3.8-27B con encoder de vision) mas una cabeza de esquema conjunta (*joint schema head*) |
| Parametros totales | 27.356.728.560 (unos 27,36 mil millones) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | 16.384 tokens por defecto en `encode_record` (parametro `max_length`); la longitud de contexto nativa de Qwen3.8-27B no se especifica en la informacion disponible |
| Tipos de cuantizacion | No disponible. Solo se documentan pesos en safetensors; no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors fragmentado (`model-*.safetensors` + `model.safetensors.index.json`) y `joint_head.safetensors`, con codigo personalizado (`joint_schema_model.py`, tag `custom-code`) |

## Arquitectura y entrenamiento

La arquitectura combina dos piezas. Por un lado, el backbone Qwen/Qwen3.8-27B con su encoder de vision, almacenado como safetensors estandar y del que se heredan las capacidades perceptivas sobre imagen y video. Por otro, una cabeza de esquema conjunta que consume los estados ocultos finales del backbone, enruta la evidencia relevante del estado hacia cada pregunta del esquema y puntua de forma conjunta todas las opciones de todas las preguntas. El resultado es un logit por opcion permitida; aplicando un softmax por pregunta se obtienen las probabilidades. Segun la model card, todo el proceso ocurre en un unico forward pass, sin generacion de texto libre y sin parsing posterior.

El modelo se obtiene por post-entrenamiento (relacion `finetune`) a partir de Qwen/Qwen3.8-27B. No se publican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras. La unica innovacion tecnica descrita explicitamente es el diseno de la cabeza de esquema conjunta y su integracion con el formato de entrada tipado (`noul`, `choice`, `score`). El modelo se ha probado con `torch` 2.11 y `transformers` 5.10.2 sobre una unica GPU H200.

## Capacidades

- Decision estructurada: devuelve una distribucion de probabilidad sobre las opciones permitidas de cada pregunta del esquema.
- Tres tipos de pregunta: `noul` (verdadero/falso), `choice` (opciones con nombre) y `score` (opciones ordenadas con indice desde 0).
- Entrada multimodal: acepta `state` como cadena o JSON, mas listas opcionales de `images` (PIL) y `videos` (arrays de fotogramas).
- Procesamiento por lotes mixto: registros de solo texto y multimodales pueden mezclarse en el mismo batch.
- Salida tipada sin parsing: respuestas `choice` con `choice`, `confidence` y `probabilities`; `score` con `score` esperado, `confidence`, `legend` y `probabilities`; `noul` con la probabilidad de verdadero.
- Compatibilidad de API con Jev y SystemOne mediante la funcion `systemone`, que acepta y devuelve el mismo cuerpo de peticion/respuesta de `POST /v1/systemone`.
- Puntuacion conjunta de multiples preguntas relacionadas en una sola pasada, lo que permite razonamiento implicito entre preguntas del mismo esquema.
- Generacion de texto libre: no soportada por diseno.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (*thinking mode*), audio: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Triaje de tickets de soporte: con un esquema que combine una pregunta `choice` (departamento: facturacion o tecnico), una `score` (urgencia) y una `noul` (si hay una caida de servicio), el modelo devuelve en una sola pasada las tres decisiones con su confianza, lo que permite enrutar el ticket sin escribir heuristicas ni parsers.
- Clasificacion de facturas y documentos financieros: partiendo del JSON extraido de una factura mas la imagen escaneada, un esquema con preguntas como estado del pago, divisa o si el importe supera un umbral (`noul`) resuelve la validacion documental con salida directamente consumible por un ERP.
- Moderacion de contenido multimodal: sobre publicaciones con texto e imagen, un esquema `choice` con categorias de incumplimiento y un `noul` de gravedad produce probabilidades por categoria que permiten fijar umbrales de actuacion automatica o revision humana.
- Enrutado en atencion al cliente automatizada: al integrarse con la API SystemOne, el modelo puede decidir la intencion y la prioridad de una consulta multi-turno usando el historial completo como `state`, sin generar texto intermedio que despues haya que interpretar.
- Etiquetado y control de calidad de datasets: para anotar grandes volumenes de registros con criterios predefinidos, la salida probabilistica por opcion permite medir acuerdo, detectar casos ambiguos y priorizar muestras para revision manual.
- Evaluacion de siniestros con evidencia fotografica: dado un parte en JSON y las fotos adjuntas, un esquema con preguntas sobre dano visible, cobertura aplicable y necesidad de peritaje devuelve respuestas tipadas y auditables.
- Inspeccion visual de video en manufactura: usando el campo `videos` con arrays de fotogramas, el modelo puede responder a preguntas `noul` sobre presencia de defectos o a preguntas `score` sobre severidad, integrándose en una linea de control de calidad.
- LLM-as-judge con salida calibrada: en lugar de pedir una valoracion en texto libre, se define un esquema `score` con la rubrica y se obtiene la puntuacion esperada mas la distribucion completa, lo que facilita el analisis estadistico de las evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un leaderboard interno denominado Decision Index y una ejecucion propia por benchmark, pero los valores concretos no estan incluidos en la informacion proporcionada, por lo que no se reproducen cifras.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 54,7 GB solo para los parametros del modelo, coherente con el tamano de repositorio de 55,0 GB; hay que sumar la cabeza conjunta, el encoder de vision, las activaciones y la cache KV.
- Memoria total estimada en bf16 para contexto largo: en torno a 65-80 GB en funcion del lote y de la longitud de entrada.
- GPU probada por el autor: una unica H200 (141 GB), con `torch` 2.11 y `transformers` 5.10.2.
- GPU recomendadas para bf16: H200, H100 80 GB, A100 80 GB. En GPUs de 40 GB o menos no cabe sin cuantizar.
- GPU de consumo: en bf16 no cabe en ninguna GPU de consumo actual. Con cuantizacion a 4 bits los pesos caerian en torno a 15-16 GB, lo que en teoria permitiria ejecutarlo en RTX 4090, RTX 3090 o RTX 5090 de 24 GB o mas, pero no hay variantes cuantizadas publicadas ni soporte documentado.
- Opciones de despliegue: el modelo requiere codigo personalizado (`joint_schema_model.py`, funciones `load_release_model`, `encode_record`, `collate_records` y `systemone`), por lo que no es cargable con el pipeline estandar de `transformers` sin ese modulo. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama; en particular, la ausencia de pesos GGUF impide su uso directo en llama.cpp u Ollama.
- Dependencias adicionales: `pillow` para entradas de imagen y video.
- Latencia y throughput: no disponible. La model card solo indica que todas las decisiones se resuelven en un unico forward pass.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clef (suryatmodulus/clef) | 27,36 mil millones | 16.384 tokens por defecto en `encode_record` | Logits por opcion; softmax por pregunta; sin texto libre | Apache-2.0 | HuggingFace, requiere codigo personalizado |
| Qwen/Qwen3.8-27B (modelo base) | No disponible en la informacion | No disponible | Texto generado de forma libre | No disponible en la informacion | HuggingFace |
| Cloudflare/clef-flash | No disponible; descrito como variante mas pequena y rapida | No disponible | Mismo esquema de decision que Clef | No disponible en la informacion | HuggingFace |

No se dispone de informacion sobre otros modelos de decision estructurada comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de generacion de texto libre: no sirve para tareas conversacionales abiertas, resumen, traduccion ni redaccion. Cualquier caso de uso que requiera texto de salida queda fuera de su alcance.
- Requiere codigo personalizado: no es cargable con el flujo estandar de `transformers`; hay que importar `joint_schema_model.py` desde el directorio del modelo y usar `load_release_model`. Esto complica el despliegue en servidores de inferencia habituales.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ oficiales, lo que descarta llama.cpp, Ollama y buena parte de los despliegues en hardware de consumo.
- Riesgo de calibracion inadecuada: se trata de un modelo de probabilidades; si la confianza no esta bien calibrada, fijar umbrales de decision automatica puede producir errores sistematicos. No se han publicado metricas de calibracion en la informacion disponible.
- Riesgo de alucinacion: aunque no genere texto, el modelo puede asignar probabilidad alta a opciones incorrectas cuando el `state` es ambiguo o contradictorio, especialmente con entradas multimodales de baja calidad.
- Cobertura idiomatica desconocida: no se declaran los idiomas soportados. No hay garantia de rendimiento fuera del ingles, y menos aun en castellano.
- Restricciones de licencia: el modelo se distribuye bajo Apache-2.0, pero al ser un finetune de Qwen/Qwen3.8-27B conviene revisar los terminos del modelo base antes de un uso comercial, ya que la informacion proporcionada no los detalla.
- Discrepancia de identificacion: el repositorio consultado es `suryatmodulus/clef`, mientras que la model card se refiere a `Cloudflare/clef` y enlaza a un blog de Cloudflare. No se puede confirmar desde la informacion disponible si se trata del repositorio oficial, un espejo o una copia de terceros.
- Modelo sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta, lo que significa que no hay retroalimentacion independiente ni verificacion externa de los resultados.
- Homonimia: existen otros proyectos con el nombre CLEF (modelos fundacionales para ECG y EEG, entre otros) que no guardan ninguna relacion con este modelo. Conviene no confundir sus resultados ni sus citas.
- Contexto acotado por defecto: `encode_record` limita la entrada a 16.384 tokens salvo que se ajuste `max_length` o `max_state_tokens`; estados mas largos se truncan, con la consiguiente perdida de evidencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/suryatmodulus/clef
- Anuncio en el blog de Cloudflare (Clef decision models): https://blog.cloudflare.com/clef-decision-models
- Leaderboard Decision Index: https://clef-evals.workers-ai-mle.workers.dev
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante Clef-Flash: https://huggingface.co/Cloudflare/clef-flash
- Perfil del autor en HuggingFace: https://huggingface.co/suryatmodulus/datasets

Nota: las busquedas web devuelven unicamente proyectos homonimos sin relacion con este modelo (CLEF para electrocardiograma, CLEF para EEG y otros modelos del mismo autor como parakeet-redux o fable-traces). No se han encontrado papers, repositorios ni demos adicionales especificos de este Clef.
