# Vlad39382/qwen3-0.6b-ru-struct-gguf

## Resumen

qwen3-0.6b-ru-struct-gguf es un ajuste fino de Qwen/Qwen3-0.6B publicado por el usuario Vlad39382, entrenado para una única tarea: extraer un resumen estructurado de conversaciones de mensajería en ruso y devolverlo como un objeto JSON con un esquema fijo. El autor indica de forma explícita que el modelo no redacta texto libre, sino que rellena campos, y que el texto final lo compone un renderizador determinista en la aplicación.

El modelo tiene 596.049.920 parámetros y se distribuye principalmente como GGUF cuantizado en Q4_K_M (397 MB), pensado para ejecutarse en local sobre el propio teléfono dentro de un proyecto de fin de carrera sobre un mensajero multiplataforma con cifrado extremo a extremo e IA on-device. La motivación es que los datos de la conversación no abandonen el dispositivo.

Su interés práctico es acotado pero concreto: es un caso de ajuste fino de un modelo pequeño para salida estructurada, con esquema fijo, fidelidad al texto de entrada (grounding) y abstención cuando no hay datos que extraer, con métricas publicadas sobre un conjunto interno de 406 entradas. Mantiene la licencia Apache-2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo derivado de Qwen/Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (artefacto principal); merged en bf16; adaptador LoRA |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (merged bf16 en estructura HF transformers), GGUF, adaptador LoRA |

## Arquitectura y entrenamiento

El autor no describe la arquitectura interna en la informacion disponible; el modelo parte de Qwen/Qwen3-0.6B y se ajusta con LoRA, tras lo cual el adaptador se fusiona con la base y el resultado se convierte a GGUF con cuantizacion Q4_K_M. El repositorio conserva tres artefactos: el GGUF Q4_K_M de 397 MB para la aplicación, el adaptador LoRA de 40 MB para reproducibilidad del ajuste y el merged en bf16 de 1,2 GB en formato HF transformers. El GGUF tiene SHA-256 `f0f3d707d1f28ebabd92c38a00d1321298d42e7e39e45d0f443612b283ce1b90`, que la aplicación verifica al descargarlo (FR-32).

Los datos de entrenamiento suman 14.826 ejemplos, de los cuales 8.944 son estructurados (mas ejemplos de replay). La composicion combina sintesis generada por un generador de conversaciones y destilacion desde un modelo de mayor tamano. El dataset, identificado como v5_v2, declara cero fugas entre los conjuntos de entrenamiento y evaluacion. La tarea se formula como relleno de un esquema JSON fijo con campos `topic`, `when`, `place`, `people`, `actions` (lista de pares `who`/`what`), `mood` (`+`, `0`, `-`) y `open`; los campos sin dato deben devolverse como `null` y las listas vacias como `[]`. Como Qwen3 es un modelo de razonamiento, el autor indica que hay que anadir `/no_think` al prompt de sistema, ya que en caso contrario la respuesta se dirige a `reasoning_content` y `content` llega vacio.

## Capacidades

- Extraccion de resumen estructurado de conversaciones en ruso a un esquema JSON fijo, no generacion de texto libre.
- Salida estricta de objeto JSON con siete campos y semantica definida para valores ausentes (`null`) y listas vacias (`[]`).
- Grounding: los valores deben aparecer literalmente en el texto de entrada. La metrica de grounding reportada es 1.000 en el conjunto sintetico.
- Abstencion: en conversaciones vacias o sin hechos, el modelo devuelve que no hay datos, con una tasa reportada de 1.000 (1/1 en los ejemplos manuales).
- Clasificacion de tono mediante el campo `mood` con tres valores discretos (`+`, `0`, `-`).
- Extraccion de participantes y de acciones atribuidas a cada persona (`who`/`what`).
- Compatibilidad con decodificacion restringida por gramatica GBNF en llama.cpp, que eleva la validez sintactica de 0.746 a 1.000 en el conjunto sintetico y de 0.900 a 1.000 en la prueba on-device.
- Ejecucion local en dispositivo movil; no se han documentado en la informacion disponible capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Resumen de chats de mensajeria en el propio telefono: el modelo lee una conversacion en ruso y devuelve tema, momento, lugar, personas, acciones, tono y cuestiones abiertas, todo procesado localmente para que el contenido no salga del dispositivo.
- Extraccion de tareas y compromisos: a partir del campo `actions`, la aplicacion puede listar quien se compromete a que, sin que el modelo redacte nada por su cuenta.
- Deteccion de tono en conversaciones de grupo: el campo `mood` permite etiquetar el clima de la conversacion para funciones de resumen o notificacion.
- Generacion de resumenes de hilos largos con esquema estable: al devolver siempre la misma estructura JSON, el resultado se puede renderizar de forma determinista y almacenar en una base de datos sin postprocesado heuristico.
- Asistencia a personas con dificultades de lectura en ruso: el resumen estructurado y su renderizado posterior permiten presentar la informacion clave de un chat de forma resumida.
- Prototipos de investigacion sobre salida estructurada en modelos pequenos: el par adaptador LoRA + merged bf16 permite reproducir el ajuste y comparar el efecto de la decodificacion con GBNF frente a la validez sostenida solo por entrenamiento (0.900 frente a 1.000 en la prueba on-device).
- Filtrado y preprocesado en pipeline de datos: la extraccion de campos JSON puede alimentar indices, buscadores o clasificadores posteriores dentro de la misma aplicacion.

## Benchmarks y rendimiento

Metricas publicadas por el autor sobre un conjunto interno de 406 entradas (400 sinteticas del generador de conversaciones mas 6 escritas a mano). Las metricas se calculan con un unico codigo (`tools/ram-bench/structured.py`) y los campos se contrastan con la anotacion de la entrada, no con la respuesta del modelo.

| Conjunto | valid | campos | grounding | abstencion |
|---|---|---|---|---|
| Sinteticas (400) | 0.746 (con GBNF 1.000) | 1.000 | 1.000 | 1.000 |
| Manuales (6) | no disponible | 6/6 | 6/6 | 1/1 |

Prueba en dispositivo (realme RMX5377, Q4_K_M, `llama-cli`, 60 entradas):

| Configuracion | valid | campos | grounding |
|---|---|---|---|
| Sin GBNF | 0.900 | no disponible | no disponible |
| Con GBNF | 1.000 | 0.994 | 1.000 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Pesos en Q4_K_M: 397 MB de fichero, lo que permite inferencia en cualquier GPU consumer moderna y en CPU. Estimacion de memoria en ejecucion con cache KV para contextos cortos: por debajo de 1 GB, aunque el dato exacto de consumo no se proporciona.
- Variante merged en bf16: 1,2 GB de pesos en el repositorio, por lo que la inferencia en precision completa exige algunos GB de memoria (estimacion a partir del tamano del fichero).
- Ejecucion verificada en un telefono realme RMX5377 con `llama-cli`, cuantizacion Q4_K_M y 60 entradas de prueba. Cabe por tanto en hardware movil de gama media y en cualquier GPU de sobremesa.
- Opciones de despliegue confirmadas: llama.cpp / `llama-cli`, enlace `llama_cpp_dart` 0.9.0-dev.12 para aplicaciones Flutter y transformers con el merged bf16. No se confirma compatibilidad con vLLM, TGI, Ollama ni otros servidores.
- Decodificacion restringida: GBNF funciona en `llama-cli`, pero el autor indica que en la aplicacion la gramatica esta desactivada por un fallo del binding en `_prefill`, de modo que la validez en produccion depende del entrenamiento (0.900) y no del decodificador (1.000).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| Vlad39382/qwen3-0.6b-ru-struct-gguf | 596.049.920 | no disponible | GGUF, safetensors, LoRA | Apache-2.0 | Ajuste fino para extraccion de resumen estructurado en ruso |
| Qwen/Qwen3-0.6B (modelo base) | no disponible | no disponible | no disponible | Apache-2.0 | Modelo generalista de razonamiento; el autor advierte de que sin `/no_think` la respuesta se dirige a `reasoning_content` |
| Otros ajustes comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre alternativas equivalentes de salida estructurada en ruso para esta comparativa |

## Limitaciones y advertencias

- Dominio restringido a conversacion cotidiana en ruso. El propio autor indica que el rendimiento en otras tematicas no se ha medido.
- Riesgo de invencion: la abstención esta entrenada, pero en entradas no estandar pueden aparecer valores plausibles pero no presentes en el texto. La aplicación muestra los campos al usuario en lugar de actuar sobre ellos, precisamente por este motivo.
- Brecha entre evaluacion sintetica y real: el conjunto sintetico da 1.000 en campos y grounding, mientras que en los 6 ejemplos manuales el resultado es de 6/6 y el propio autor advierte de que la metrica sobre el generador no sustituye la validacion con ejemplos reales (ADR-0019 y informe #193).
- Validez sintactica dependiente del decodificador: sin GBNF, la tasa de JSON valido baja a 0.746 en el conjunto sintetico y a 0.900 en la prueba en dispositivo. En la aplicación la gramatica esta desactivada por un fallo del binding, por lo que hay que contar con un parser tolerante y un fallback a texto crudo.
- Requisito operativo no evidente: si no se anade `/no_think` al prompt de sistema, la respuesta se dirige a `reasoning_content` y el campo `content` llega vacio.
- Herramienta muy especializada: no apta para generacion de texto general, codigo, matematicas, vision u otras tareas, y sin indicios de soporte de tool calling o de comportamiento agentico.
- Licencia Apache-2.0, heredada del modelo base, que permite uso comercial; conviene verificar igualmente las condiciones de Qwen/Qwen3-0.6B y de los datos sinteticos o destilados empleados en el ajuste, sobre los que la informacion disponible no da detalle.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, creado en septiembre de 2026; no hay validacion externa independiente de las metricas publicadas por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vlad39382/qwen3-0.6b-ru-struct-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- ADR-0019 sobre el enfoque de extraccion estructurada: referenciado por el autor en el repositorio del proyecto, sin URL disponible en la informacion proporcionada.
- Informe #193 con la evaluacion sobre ejemplos manuales: referenciado por el autor, sin URL disponible en la informacion proporcionada.
- Codigo de entrenamiento y evaluacion (`tools/train/`, `tools/ram-bench/structured.py`): referenciado por el autor en el repositorio del proyecto, sin URL disponible en la informacion proporcionada.
