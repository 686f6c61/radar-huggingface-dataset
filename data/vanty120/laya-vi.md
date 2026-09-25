# vanty120/laya-vi

## Resumen

laya-vi es un ajuste fino en vietnamita del modelo Laya, desarrollado por el usuario vanty120 a partir del checkpoint convaiinnovations/laya (concretamente de la variante laya-multilingual). No es un modelo generativo: recibe un estado (un correo, un informe, un registro de chat o un documento) junto con preguntas tipadas y devuelve respuestas tipadas acompanadas de probabilidades calibradas en un unico forward pass. Al no generar texto, no hay salida que parsear ni texto que pueda alucinarse. Cuenta con 321.908.998 parametros y se distribuye bajo licencia Apache 2.0.

El problema que resuelve es el de la toma de decisiones estructuradas sobre documentos en vietnamita: enrutado a departamentos, puntuacion de urgencia, deteccion de riesgo de abandono, moderacion o clasificacion de incidencias. Segun la model card, sobre decisiones vietnamitas de los dominios incluidos en el entrenamiento la exactitud sube de 0,452 a 0,890 y el error de calibracion esperado (ECE) baja de 0,338 a 0,081 respecto al checkpoint base evaluado zero-shot. En dominios no vistos la mejora es mas modesta pero real (0,498 a 0,596 de exactitud, ECE de 0,290 a 0,091).

Su relevancia actual esta en el nicho de los modelos de decision de "System 1": inferencia de un solo paso, latencia mediana de unos 24 ms por peticion en una sola GPU y salidas probabilisticas calibradas, lo que lo hace apto para enrutado y puntuacion a gran volumen. El entrenamiento completo requirio aproximadamente 1,8 horas en una unica NVIDIA GB10, lo que rebaja mucho el coste de producir ajustes de este tipo para otros idiomas o dominios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de decision no generativo (familia Laya, "System 1"); devuelve respuestas tipadas en un unico forward pass. Detalle interno de capas y atencion: no disponible |
| Parametros totales | 321.908.998 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan pesos GGUF, int8 ni int4) |
| Idiomas soportados | vietnamita (vi). El entrenamiento incluye un 15 % de replay en ingles para limitar el olvido, pero el ingles no se declara como idioma soportado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de checkpoint estandar de Laya, cargable por el runtime de Laya y por transformers) |
| Pipeline declarado | text-classification |
| Modelo base | convaiinnovations/laya (partida desde el checkpoint laya-multilingual) |
| Tamano del repositorio | 0,7 GB |
| Fecha de publicacion | 25 de septiembre de 2026 (ultima actualizacion: 25 de septiembre de 2026) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

laya-vi hereda la arquitectura de la familia Laya, un motor de decisiones de tipo "System 1" que no decodifica texto. La entrada es un estado en lenguaje natural mas un conjunto de preguntas tipadas, y la salida son respuestas con distribuciones de probabilidad. La model card define tres tipos de pregunta: `noul`, que devuelve la probabilidad de que la respuesta sea afirmativa; `choice`, que elige entre 3 y 10 opciones con una probabilidad por opcion; y `score`, que situa la respuesta en una escala ordinal de 3 a 5 niveles con probabilidad por nivel. Todo ello en un unico forward pass, sin generacion autoregresiva y, por tanto, sin necesidad de parsear la salida.

Los datos de entrenamiento son integramente sinteticos y en vietnamita; no se utilizaron datos reales de clientes ni de usuarios. Cubren decisiones cotidianas en entornos empresariales vietnamitas: correos de atencion al cliente, conciliacion de facturas, informes de incidentes en redes electricas, seguridad laboral, documentos de licitacion, reclutamiento, resenas de producto, moderacion de comentarios, chats de grupo de equipos de proyecto y contratos de subcontratacion. Los documentos emplean nombres, empresas, moneda y convenciones laborales vietnamitas, y aproximadamente una cuarta parte aparece tambien sin diacriticos (*khong dau*). Dos de los dominios se reservaron exclusivamente para medir rendimiento zero-shot. Cada caso se genero a partir de hechos subyacentes conocidos y fue etiquetado tres veces por un profesor LLM, tomando como etiqueta dorada la media de las tres distribuciones de respuesta; se aplicaron comprobaciones automaticas para eliminar casos cuya etiqueta contradecia los hechos, casi duplicados y texto mal formado.

El procedimiento de entrenamiento consistio en 1 epoca de entropia cruzada suave contra las distribuciones del profesor y despues 3 epocas de RLCD, el objetivo de aprendizaje por refuerzo de Laya basado en reglas de puntuacion propias (proper scoring rules). El replay en ingles representa el 15 % del entrenamiento. La mejor epoca se selecciona sobre un split de calibracion independiente y, a continuacion, se ajustan temperaturas por tipo de pregunta sobre ese mismo split. El tiempo total fue de aproximadamente 1,8 horas en una unica NVIDIA GB10, con la configuracion completa recogida en `train_log.json`.

## Capacidades

- Clasificacion y decision sobre documentos: dado un estado (correo, informe, chat, documento) devuelve una decision estructurada, no texto libre.
- Respuestas tipadas con probabilidad: `noul` (probabilidad de si), `choice` (una de 3 a 10 opciones con probabilidad por opcion) y `score` (posicion esperada en escala ordinal de 3 a 5 niveles con probabilidad por nivel).
- Probabilidades calibradas: ECE de 0,081 en dominios entrenados con casos no vistos y de 0,091 en dominios reservados, frente a 0,338 y 0,290 del checkpoint base.
- Enrutado y triaje: asignacion de una solicitud al departamento o cola correspondiente (por ejemplo, `thanh_toan`, `ky_thuat`, `khac`).
- Puntuacion de urgencia y severidad sobre escalas ordinales.
- Deteccion de riesgo de abandono o escalado de cliente a partir de lenguaje de amenaza.
- Moderacion de comentarios y clasificacion de resenas de producto.
- Inferencia de un solo paso, sin generacion de texto: no hay salida que parsear ni riesgo de alucinacion textual.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo es de decision en un unico paso).
- Capacidades multilingues: solo vietnamita declarado; el ingles aparece unicamente como replay de entrenamiento.
- Capacidades especiales: no dispone de modo "thinking", vision ni audio. Su rasgo diferencial es la calibracion probabilistica y la ausencia de generacion.
- Integraciones: runtime de Laya, `laya-serve` y otras integraciones de Laya; tambien se puede cargar con la libreria transformers.

## Casos de uso

- Triaje de atencion al cliente: el modelo recibe el texto de la solicitud y la enruta al departamento adecuado. En el ejemplo de la model card, un cliente que ha pagado dos veces el pedido #4521 se clasifica en `thanh_toan` con p = 0,96. Es adecuado porque la decision es de un solo paso y la probabilidad permite fijar umbrales de derivacion a humanos.
- Priorizacion de urgencia: con una pregunta de tipo `score` sobre una escala ordinal, se obtiene la urgencia esperada de cada ticket (por ejemplo, 1,71 sobre 2 con p = 0,75 para "muy urgente"), lo que permite ordenar colas sin escribir reglas ad hoc.
- Deteccion de riesgo de abandono (churn): una pregunta `noul` devuelve la probabilidad de que el cliente este amenazando con cancelar o abandonar el servicio (0,94 en el ejemplo documentado), util para disparar acciones de retencion.
- Conciliacion de facturas y facturacion duplicada: sobre documentos de facturacion sinteticos vietnamitas, se puede preguntar si un cargo es duplicado, si falta un justificante o a que centro de coste corresponde, aprovechando que el modelo fue entrenado especificamente en ese dominio.
- Moderacion de comentarios y resenas: clasificacion de comentarios y resenas de producto por categoria y gravedad, con probabilidad por clase, integrable en un pipeline de moderacion por lotes a bajo coste por peticion.
- Priorizacion de informes de incidentes en redes electricas: preguntas de tipo `choice` sobre el tipo de incidencia y `score` sobre la severidad, para ordenar la respuesta de los equipos tecnicos.
- Clasificacion de incidentes de seguridad laboral: enrutado del parte al area responsable y puntuacion del nivel de riesgo, con la salvedad de que la propia model card advierte que no sustituye al juicio humano en decisiones criticas de seguridad.
- Cribado de documentos de licitacion: deteccion de clausulas de cumplimiento, presencia de requisitos obligatorios o motivos de exclusion, devolviendo probabilidades que permiten separar los casos dudosos para revision manual.
- Analisis de chats de equipo de proyecto: extraccion de decisiones y riesgos a partir de conversaciones de grupo, con respuestas tipadas que evitan tener que interpretar texto generado.
- Procesamiento a gran volumen: con una latencia mediana de unos 24 ms por peticion en una sola GPU, el modelo es apto para clasificar lotes grandes de correos o tickets en tiempo casi real.

## Benchmarks y rendimiento

Resultados reportados en la model card. `laya-multilingual` es el checkpoint original de Laya evaluado zero-shot; las columnas muestran la evolucion de ese checkpoint a laya-vi. `n` cuenta pares (documento, pregunta). El ECE es el error de calibracion esperado: mas bajo significa que las probabilidades se ajustan mejor a la exactitud observada.

| Conjunto de prueba | n | Exactitud (laya-multilingual → laya-vi) | ECE (laya-multilingual → laya-vi) |
|---|---|---|---|
| Dominios entrenados, casos no vistos | 13.130 | 0,452 → 0,890 | 0,338 → 0,081 |
| Dominios reservados (zero-shot) | 6.220 | 0,498 → 0,596 | 0,290 → 0,091 |
| MASSIVE vi-VN (etiquetas humanas) | 1.000 | 0,520 → 0,571 | 0,218 → 0,134 |

Datos adicionales: la latencia mediana es de aproximadamente 24 ms por peticion en una sola GPU. La model card indica que las metricas de Brier score, KL, MAE de `score` y otras estan en `eval_results.json`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks generativos en la informacion disponible, algo esperable dado que el modelo no genera texto.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo aritmetico a partir de los 321.908.998 parametros, no dato publicado): en fp32 unos 1,29 GB; en fp16/bf16 unos 0,64 GB; en int8 unos 0,32 GB; en int4 unos 0,16 GB. Hay que anadir el coste del runtime y del tokenizador.
- El repositorio pesa 0,7 GB, lo que es coherente con pesos en fp16/bf16.
- Cabe con holgura en cualquier GPU de consumo con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060, RTX 4090) e incluso en CPU, aunque la latencia publicada de 24 ms esta medida en GPU.
- GPU de datacenter: al ser un modelo de 322 M de parametros no requiere A100 ni H100 para ajustarse en memoria; el factor limitante es el throughput, no la VRAM.
- GPU empleada en el entrenamiento: una unica NVIDIA GB10 durante aproximadamente 1,8 horas. No se especifica la GPU usada para medir la latencia.
- Opciones de despliegue documentadas: runtime de Laya, `laya-serve` y la libreria transformers (pipeline de `text-classification`). No se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: latencia mediana de unos 24 ms por peticion en una sola GPU. El throughput agregado no esta disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| vanty120/laya-vi | 321,9 M | no disponible | Clasificacion y decision tipada en vietnamita | Apache 2.0 | Exactitud 0,890 en dominios entrenados, 0,596 en dominios reservados; ECE 0,081 y 0,091 |
| convaiinnovations/laya (laya-multilingual) | No disponible en la informacion proporcionada; es el modelo base de laya-vi | no disponible | Motor de decision multilingue "System 1" | Apache 2.0 | Evaluado zero-shot: 0,452 y 0,498 de exactitud; ECE 0,338 y 0,290 |
| Otros clasificadores en vietnamita (por ejemplo, PhoBERT o XLM-R ajustados) | no disponible | no disponible | Clasificacion de texto | no disponible | no disponible: no se incluyen en la informacion proporcionada ni aparecen comparados en la model card |

La unica comparacion con datos verificables es contra el checkpoint base laya-multilingual, del que laya-vi mejora tanto la exactitud como, de forma mas acusada, la calibracion. No hay datos comparativos frente a alternativas de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- Las ganancias son mayores en los dominios presentes en los datos de entrenamiento. En dominios nuevos hay que esperar cifras cercanas a la fila de dominios reservados (0,596 de exactitud, ECE 0,091) y se recomienda ajustar el modelo con decisiones propias cuando la precision sea critica.
- Las etiquetas provienen de un profesor LLM, por lo que el modelo puede heredar los errores y sesgos de ese profesor.
- No es un sustituto del juicio humano en decisiones criticas para la seguridad.
- El entrenamiento se realizo integramente con datos sinteticos: no se usaron datos reales de clientes ni de usuarios, lo que limita el realismo de la distribucion frente a trafico de produccion.
- Solo se declara el vietnamita como idioma soportado. El 15 % de replay en ingles busca limitar el olvido, no anadir capacidad multilingue.
- El modelo no genera texto, de modo que no hay riesgo de alucinacion textual, pero si puede asignar etiquetas o probabilidades incorrectas; sus salidas deben tratarse como estimaciones calibradas, no como hechos.
- Las probabilidades calibradas corresponden a los tipos de pregunta y a los dominios vistos; el ajuste de temperatura se hizo por tipo de pregunta sobre un split de calibracion concreto, por lo que la calibracion puede degradarse fuera de ese reparto.
- Licencia Apache 2.0: permite uso comercial, pero se pide acreditar a Laya (Convai Innovations) cuando se utilice el modelo.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, publicado en 2026 y sin resultados de benchmarks externos: la validacion disponible procede unicamente de la model card del autor.
- No se documentan tipos de cuantizacion ni formato GGUF, lo que limita las opciones de despliegue en entornos que dependan de llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vanty120/laya-vi
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Repositorio GitHub de Laya: https://github.com/NandhaKishorM/laya
- Documentacion de Laya: https://nandhakishorm.github.io/laya/
- Pagina de la familia Laya (Convai Innovations): https://laya.convaiinnovations.com/
- Metricas detalladas: eval_results.json (referenciado en la model card del repositorio)
- Configuracion completa de entrenamiento: train_log.json (referenciado en la model card del repositorio)
- Perfil del autor: https://huggingface.co/vanty120
