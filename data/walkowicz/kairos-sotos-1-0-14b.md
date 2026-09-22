# Walkowicz/kairos-sotos-1.0-14B

## Resumen

Kairos Sotos 1.0 14B es un ajuste fino (fine-tune) de Qwen/Qwen3-14B publicado por el usuario Walkowicz, orientado a una tarea muy concreta: actuar como auditor local de seguridad y privacidad. El modelo informa del hallazgo detectado, propone la correccion segura mas pequena posible y lo etiqueta con el identificador CWE o OWASP correspondiente. De forma explicita, la model card indica que el modelo no proporciona payloads de explotacion ni pasos de ataque, lo que lo posiciona como herramienta defensiva y no ofensiva.

El repositorio distribuido contiene unicamente el fichero GGUF en cuantizacion Q6_K. Segun el autor, la cuantizacion Q4_K_M del mismo merge cae por debajo del umbral de calidad fijado (el "gate"), por lo que Q6_K se presenta como el minimo viable. El fichero pesa 11,3 GiB (6,56 bits por peso) y esta pensado para ejecucion local con Ollama sobre GPUs de 12 GB, con un rendimiento declarado de aproximadamente 10,8 tokens por segundo.

El modelo es relevante en el nicho de auditoria de codigo y configuracion ejecutada en local, donde enviar el codigo a un servicio en la nube no siempre es viable por motivos de privacidad. La licencia Apache 2.0, heredada del modelo base, facilita su integracion en entornos corporativos. No se han publicado detalles sobre el conjunto de datos de entrenamiento ni sobre el proceso de ajuste mas alla de la existencia del propio checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-14B; sin detalles adicionales en la informacion disponible) |
| Parametros totales | 14.768.307.200 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible como especificacion del modelo. El Modelfile de despliegue fija `num_ctx` a 2048 |
| Tipos de cuantizacion | Q6_K (unica cuantizacion publicada en este repositorio, 6,56 BPW). El autor menciona que Q4_K_M del mismo merge no supera el gate |
| Idiomas soportados | Ingles (en) y portugues (pt). El modelo responde en el idioma del usuario; los identificadores de codigo permanecen en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio). El modelo base Qwen/Qwen3-14B esta en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del ajuste. Se sabe que parte de Qwen/Qwen3-14B, un transformer denso de 14.768 millones de parametros, y que el resultado publicado es un merge del que solo se distribuye la cuantizacion Q6_K. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras variantes de alineamiento. Tampoco se indica si hubo una fase de instruccion especifica ni como se construyeron los datos de auditoria de seguridad.

El autor menciona un "gate" de calidad evaluado por dos jueces (identificados como Grok 4.7 y Opus 5.0) sobre las generaciones en Q6, no solo sobre el adaptador. Este gate actua como criterio de aceptacion: un umbral del 80 por ciento en dominio y del 70 por ciento en conjuntos held-out. Como innovacion operativa destacable, el despliegue requiere un prefijo con un bloque `<think>` vacio antes de la respuesta, porque el modelo base Qwen3 lo necesita para funcionar correctamente. El Modelfile tambien fija los stops de ChatML y temperatura 0.

## Capacidades

- Auditoria de seguridad y privacidad: identifica hallazgos en codigo o configuracion y los clasifica con identificadores CWE o OWASP.
- Propuesta de remediacion: sugiere la correccion segura mas pequena posible, en lugar de reescrituras amplias.
- Restriccion deliberada de contenido ofensivo: no genera payloads de explotacion ni pasos de ataque.
- Respuesta multilingue limitada: responde en ingles o portugues segun el idioma del usuario, con identificadores de codigo siempre en ingles.
- Modo de razonamiento: el modelo base Qwen3 soporta bloques `<think>`; el Modelfile inyecta un bloque vacio para desactivar el razonamiento visible antes de la respuesta.
- Generacion de texto conversacional: la etiqueta del repositorio incluye `conversational` y `text-generation`.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Vision o audio: no disponible; el pipeline declarado es unicamente text-generation.

## Casos de uso

- Revision de codigo previa a un commit o merge request: el modelo puede analizar un fragmento de codigo y devolver el hallazgo con su CWE asociado y el parche minimo, integrándose como paso adicional en un pipeline de CI sin salida de datos a la nube.
- Auditoria de ficheros de configuracion en local: despliegues con Ollama sobre una estacion de trabajo permiten revisar configuraciones de servidores o contenedores sin exponerlas a terceros, algo relevante en entornos con requisitos de privacidad estrictos.
- Formacion en seguridad para desarrolladores: al no generar payloads ni pasos de ataque, sirve como herramienta didactica que explica el fallo y su correccion sin proporcionar material ofensivo reutilizable.
- Triaje inicial de hallazgos de un escaner: puede tomar la salida de un analizador estatico y traducirla a un informe con clasificacion CWE/OWASP y recomendacion concreta, reduciendo el trabajo manual de priorizacion.
- Cumplimiento y revision de privacidad en equipos lusofonos: dado que responde en portugues manteniendo los identificadores tecnicos en ingles, encaja en equipos de Brasil o Portugal que trabajan con documentacion tecnica en ingles.
- Revisión de dependencias y manifiestos: puede inspeccionar ficheros de dependencias o politicas de acceso y senalar configuraciones inseguras junto con la correccion sugerida.
- Asistente interno de seguridad sobre hardware de gama media: con 11,3 GiB de pesos y unos 10,8 tok/s declarados en una GPU de 12 GB, es viable como servicio interno de baja concurrencia sin infraestructura dedicada.

## Benchmarks y rendimiento

Los unicos datos publicados son las puntuaciones del gate de aceptacion, evaluadas por dos jueces sobre las generaciones en Q6. No equivalen a benchmarks estandar como MMLU, HumanEval o GSM8K.

| Evaluador | En dominio | Held-out |
|---|---|---|
| Grok 4.7 | 18/20 | 16/20 |
| Opus 5.0 | 17/20 | 17/20 |

El umbral declarado por la familia de modelos es del 80 por ciento en dominio y del 70 por ciento en held-out, por lo que ambas puntuaciones lo superan. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11,3 GiB solo para los pesos en Q6_K, mas la cache KV correspondiente a `num_ctx` 2048. El autor indica que en una GPU de 12 GB unos 9,9 GiB permanecen en la GPU y el resto se descarga a CPU.
- GPU de 8 GB: no es suficiente, segun la model card.
- GPU de 12 GB: configuracion objetivo declarada, con descarga parcial de capas, a unos 10,8 tokens por segundo.
- GPU de gama alta (A100, H100, RTX 4090 y similares): no se proporcionan datos especificos de rendimiento en la informacion disponible, aunque por tamano de pesos el modelo cabe holgadamente en sus memorias.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas con descarga parcial; en 8 GB no.
- Opciones de despliegue: Ollama es la via documentada, con el tag `kairos-sotos:v0` y un Modelfile que fija ChatML stops, `num_ctx` 2048, temperatura 0 y el prefijo `<think>` vacio. Un `ollama pull` directo del GGUF usa la plantilla de chat embebida en el fichero y no reproduce esta configuracion. No se documentan otras opciones como vLLM, llama.cpp o TGI.
- Throughput declarado: aproximadamente 10,8 tok/s en una GPU de 12 GB con `num_ctx` 2048. No hay datos de latencia ni de rendimiento con mayor concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kairos Sotos 1.0 14B | 14.768.307.200 | No disponible (despliegue a 2048) | Gate: 18/20 y 17/20 en dominio segun juez | Apache 2.0 | GGUF Q6_K en HuggingFace |
| Qwen/Qwen3-14B (modelo base) | 14.768.307.200 | No disponible en la informacion proporcionada | No disponible | Apache 2.0 | Safetensors en HuggingFace |
| Otros modelos de auditoria de seguridad de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La busqueda web realizada no devolvio informacion sobre modelos comparables de auditoria de seguridad; los resultados obtenidos eran genericos sobre asistentes conversacionales y no guardan relacion con esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta la composicion del dataset de entrenamiento ni sus posibles sesgos.
- Riesgo de alucinacion: no cuantificado. En tareas de clasificacion CWE/OWASP existe riesgo de asignar identificadores incorrectos, y no hay datos publicados de precision frente a un conjunto de referencia independiente.
- Ambito restringido: el modelo esta disenado como auditor defensivo y rechaza generar payloads o pasos de ataque. No es utilizable para tareas de seguridad ofensiva, y forzarlo en esa direccion no forma parte de su comportamiento previsto.
- Contexto limitado en el despliegue documentado: el Modelfile fija `num_ctx` a 2048, lo que restringe el tamano de los fragmentos de codigo o configuracion analizables en una sola interaccion. No se documenta la longitud de contexto nativa del modelo ajustado.
- Cobertura idiomatica: solo ingles y portugues. No hay soporte declarado de castellano ni de otros idiomas.
- Cuantizacion unica: el repositorio solo publica Q6_K. El autor indica que Q4_K_M no supera el gate, por lo que no hay una version mas ligera validada para GPUs de 8 GB.
- Despliegue sensible a la configuracion: un `ollama pull` directo del GGUF no reproduce el comportamiento evaluado, porque omite el prefijo `<think>` vacio y los parametros del Modelfile. Esto puede degradar los resultados respecto al gate publicado.
- Licencia: Apache 2.0, la misma que el modelo base, por lo que el uso comercial esta permitido. El repositorio no incluye el conjunto de entrenamiento, lo que impide auditar la procedencia de los datos.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no tiene un historial de uso en produccion documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Walkowicz/kairos-sotos-1.0-14B
- Modelo base Qwen/Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Tag de Ollama documentado: `kairos-sotos:v0`
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo, su paper, repositorio o demo; los resultados obtenidos correspondian a asistentes conversacionales genericos sin relacion con la ficha.
