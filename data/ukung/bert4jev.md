# ukung/bert4jev

## Resumen

bert4jev es un modelo de decision tipada (typed-decision) desarrollado por el usuario ukung sobre el encoder microsoft/deberta-v3-large. No es un modelo generativo: recibe un unico estado (state) junto con una o varias preguntas tipadas y devuelve, para cada pregunta, una distribucion de probabilidad calibrada sobre un conjunto cerrado de opciones, todo ello en un solo forward pass del encoder.

El problema que resuelve es el de la salida estructurada fiable. Al no generar texto libre, el modelo no puede producir JSON malformado ni etiquetas fuera del conjunto de opciones: el error de formato estructurado es cero por construccion. Soporta tres tipos de pregunta (choice con 2 a 255 opciones desordenadas, score con 2 a 10 niveles ordenados y noul para si/no) y permite responder varias preguntas sobre el mismo estado reutilizando una sola pasada.

Es relevante ahora como alternativa ligera y determinista a los LLM generativos en tareas de enrutamiento, clasificacion y decision acotada, donde el coste, la latencia y la fiabilidad del formato pesan mas que la flexibilidad. Cuenta con 434.012.160 parametros, una ventana de contexto total de 512 tokens (el estado se trunca a 256), soporte unicamente en ingles y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3-large (model_type `deberta-v2`) mas cabeza de decision tipada |
| Parametros totales | 434.012.160 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens en total; el campo de estado se trunca a 256 tokens |
| Tipos de cuantizacion | no disponible; el repositorio publica unicamente pesos en float16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en float16, mas codigo de inferencia propio (`jev_infer.py`, `configuration_bert4jev.py`, `modeling_bert4jev.py`) |

## Arquitectura y entrenamiento

La entrada se serializa en una unica secuencia con tokens marcadores: `[CLS] [STATE] state [Q] instructions [OPT] option_1 [OPT] option_2 ... [Q] ... [SEP]`. Un encoder DeBERTa-v3-large procesa simultaneamente el estado y todas las preguntas. Para cada opcion, una cabeza auxiliar puntua la concatenacion `[media de los tokens de la pregunta; media de los tokens de la opcion; producto]`, y se aplica un softmax restringido al grupo de opciones de cada pregunta para obtener su distribucion. De este modo, una sola pasada hacia delante responde a todas las preguntas planteadas.

El modelo base es microsoft/deberta-v3-large, un encoder con atencion desenredada (disentangled attention) y embeddings de posicion relativos. El repositorio incluye el backbone y la cabeza ya en float16 (tamano aproximado de 886 MB), y registra el codigo personalizado en `config.json` mediante `auto_map`, de forma que `AutoModel.from_pretrained(..., trust_remote_code=True)` devuelve el modelo de decision completo. Sin `trust_remote_code`, `AutoModel` devuelve el backbone DeBERTaV2 desnudo. El autor indica que la ruta estandar reproduce los mismos resultados que `jev_infer.py`.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el procedimiento de ajuste (si hubo RLHF, DPO u otro) ni la metodologia de calibracion empleada. La unica innovacion tecnica documentada es el esquema de decisiones tipadas con softmax intra-grupo y la ausencia de generacion como mecanismo para garantizar salida estructurada valida.

## Capacidades

- Clasificacion de texto con conjuntos de opciones cerrados y desordenados (tipo `choice`, de 2 a 255 opciones), devolviendo la opcion elegida, la distribucion de probabilidad completa y un valor de confianza.
- Puntuacion ordinal (tipo `score`, de 2 a 10 niveles ordenados), que devuelve el nivel esperado como valor escalar ademas de la distribucion.
- Decisiones booleanas (tipo `noul`) que devuelven la probabilidad de "si" (p(yes)) para una afirmacion dada.
- Respuesta a multiples preguntas sobre el mismo estado en una sola pasada, con coste marginal reducido por pregunta adicional.
- Manejo de negaciones: el autor reporta 6 aciertos sobre 6 en un conjunto de prueba de negacion.
- Salida calibrada: las probabilidades permiten fijar umbrales de confianza y derivar decisiones de absteccion o revision manual.
- No soporta generacion de texto libre, tool calling, function calling ni razonamiento multi-paso.
- Soporte multilingue limitado al ingles; no hay capacidades de vision ni audio.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una reclamacion, el modelo asigna el departamento correcto (devoluciones, envios, facturacion) entre un conjunto fijo de areas. La distribucion de probabilidad permite derivar automaticamente a un humano los casos con confianza baja, y la ausencia de generacion garantiza que la etiqueta de salida siempre sea valida.
- Analisis de sentimiento con escala ordinal: usando el tipo `score` con niveles como "muy negativo, negativo, neutro, positivo, muy positivo", se obtiene un valor esperado que puede agregarse en metricas de producto sin postprocesado.
- Verificacion de condiciones en pipelines de automatizacion: preguntas tipo `noul` ("el cliente solicita un reembolso") permiten insertar comprobaciones booleanas deterministas en flujos RPA sin depender de un LLM generativo.
- Moderacion y clasificacion de contenido: asignacion de categoria a un texto breve con umbral de confianza, donde la salida acotada evita fallos de parseo en produccion.
- Etiquetado de datos a escala: el modelo puede preetiquetar grandes volumenes de texto con multiples criterios simultaneos en una sola pasada, dejando la revision humana para las muestras de baja confianza.
- Triaje de quejas financieras: con varias preguntas simultaneas sobre el mismo mensaje (area de producto, sentimiento y solicitud explicita de reembolso), se obtiene una ficha estructurada por caso con coste de una sola inferencia.
- Filtrado previo en pipelines con LLM: uso como clasificador ligero que decide que peticiones requieren un modelo generativo caro y cuales pueden resolverse con una regla, reduciendo coste y latencia.
- Priorizacion de leads o solicitudes: con preguntas tipo `score`, generar una puntuacion de urgencia o de intencion de compra para ordenar una cola de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, etc.) en la informacion disponible. El unico dato de evaluacion aportado por el autor es interno y de alcance reducido:

| Evaluacion | Resultado | Notas |
|---|---|---|
| Precision en un conjunto de 33 casos | 0,879 | Mismos 4 errores con `jev_infer.py` y con la interfaz estandar `AutoModel` |
| Prueba de negacion | 6/6 | Reportado por el autor |

No se dispone de comparaciones con otros modelos, ni de intervalos de confianza, ni de detalles sobre como se construyo el conjunto de 33 casos.

## Requisitos de hardware

- Pesos en float16 de aproximadamente 886 MB (el repositorio completo ocupa 0,9 GB). Con 434 millones de parametros, la VRAM estimada para inferencia en fp16 con overhead de runtime se situa en torno a 2-3 GB, y alrededor de 4 GB si se ejecuta en fp32.
- Cabe con holgura en GPU de consumo: tarjetas con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090) son suficientes incluso con lotes moderados.
- La inferencia en CPU es viable por el tamano del modelo, aunque sin datos de latencia publicados.
- Opciones de despliegue: la via documentada es `transformers` con el modulo `jev_infer.py` incluido en el repositorio, o `AutoModel` con `trust_remote_code=True`. No se documentan integraciones oficiales con vLLM, TGI, Ollama o llama.cpp, y no se publican pesos en GGUF, por lo que el despliegue en esas plataformas requeriria conversion propia.
- No se han publicado medidas de latencia ni de throughput. Al ser un encoder de 434 millones de parametros sobre una ventana de 512 tokens y una unica pasada, la latencia esperada es sustancialmente menor que la de un LLM generativo de tamano comparable, pero se trata de una estimacion, no de un dato medido.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos directamente comparables de la categoria "typed-decision". La referencia mas cercana es el propio modelo base.

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ukung/bert4jev | 434.012.160 | 512 tokens (estado truncado a 256) | Distribucion calibrada sobre opciones cerradas | Apache 2.0 | HuggingFace, requiere codigo propio o `trust_remote_code` |
| microsoft/deberta-v3-large | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Representaciones / clasificacion estandar | no disponible en la informacion proporcionada | HuggingFace |
| LLM generativo de uso general | variable | habitualmente mayor | Texto libre, con riesgo de formato invalido | variable | multiple |

Los datos de rendimiento comparativo no estan disponibles. La diferencia funcional principal frente a un LLM generativo es que bert4jev no genera texto y por tanto no puede producir salidas fuera del formato ni etiquetas no definidas, a cambio de perder flexibilidad y capacidad de razonamiento abierto.

## Limitaciones y advertencias

- Solo soporta ingles. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Ventana de contexto muy limitada: 512 tokens en total, con el estado truncado a 256 tokens. Esto restringe su uso a mensajes cortos y obliga a truncar entradas largas, con perdida de informacion.
- No es un modelo generativo: no puede redactar respuestas, resumir, razonar en varios pasos ni ejecutar herramientas.
- Los conjuntos de opciones son cerrados: el modelo siempre devuelve una opcion del grupo. Si ninguna opcion es correcta y no se incluye explicitamente una alternativa del tipo "otros" o "ninguna", la salida sera un error silencioso. El autor no documenta ningun mecanismo de absteccion mas alla del umbral de confianza.
- Limites del tipo `choice` (2 a 255 opciones) y del tipo `score` (2 a 10 niveles) restringen el diseno de las preguntas.
- La calibracion de las probabilidades no ha sido verificada de forma independiente; no se aportan curvas de fiabilidad ni metricas como ECE.
- Existe riesgo de sesgo heredado del corpus de preentrenamiento de DeBERTa-v3-large, que no se documenta ni se analiza en la model card.
- Aunque el riesgo de alucinacion de texto es nulo por construccion, el modelo puede asignar alta confianza a opciones incorrectas, lo que en la practica equivale a un error de clasificacion no detectado.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio incluye codigo personalizado que exige `trust_remote_code=True`; conviene auditar `modeling_bert4jev.py` y `configuration_bert4jev.py` antes de ejecutarlo en entornos de produccion.
- Solo se publican pesos en float16, sin versiones cuantizadas ni en GGUF, lo que limita las opciones de despliegue en plataformas de inferencia estandar.
- Adopcion muy baja (25 descargas y 0 "me gusta" en el momento de la consulta) y ausencia de validacion externa: no hay terceros que hayan replicado los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ukung/bert4jev
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Paper, blog o repositorio adicional: no disponible; las busquedas web realizadas no devolvieron resultados relacionados con el modelo.
