# thisisisheanesu/morena-tools-gguf

## Resumen

MORENA tools (GGUF) es un paquete de dos modelos pequenos derivados de vamboai/morena-0.5b-mini, ajustados especificamente para convertir peticiones en lenguaje natural a llamadas de API (function calling) en pidgin nigeriano, yoruba, igbo, hausa e ingles. El repositorio lo publica el usuario thisisisheanesu y su caso de uso declarado es el sector fintech nigeriano, con un menu de herramientas construido a partir de la especificacion OpenAPI real de Paystack.

El modelo principal, mini-tools, tiene 503.367.168 parametros (aproximadamente 0,5B) y se distribuye cuantizado en Q4_K_M con un peso de 311 MB, de modo que la inferencia cabe en la CPU de un portatil. Existe ademas una variante nano-tools de 209M de parametros y 136 MB, que segun el autor iguala a mini en seleccion de herramienta pero pierde en las tareas que implican decidir que hacer con ella.

Su relevancia actual es doble: por un lado cubre un nicho poco atendido (agentes de herramientas para lenguas africanas de bajos recursos, con cinco idiomas declarados) y, por otro, demuestra que un ajuste fino de 25-33 minutos sobre una A100 permite pasar de un 0-9% de acierto en seleccion de herramienta a un 91% en un menu de herramientas nunca visto durante el entrenamiento. La licencia es Apache 2.0 y el formato de pesos es GGUF, compatible con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (ajuste fino de vamboai/morena-0.5b-mini; la model card no detalla la arquitectura del modelo base) |
| Parametros totales | 503.367.168 (variante mini, dato de safetensors); la variante nano tiene 209M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; los ejemplos de puesta en marcha del autor usan `-c 4096` |
| Tipos de cuantizacion | Q4_K_M (unico formato publicado) |
| Idiomas soportados | pcm (pidgin nigeriano), yor (yoruba), ibo (igbo), hau (hausa), en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

Datos adicionales del repositorio: tamano del repo 0,5 GB, pipeline text-generation, creado el 2026-09-19 y actualizado el 2026-09-19, con 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

No se detalla la arquitectura interna del modelo base en la informacion disponible. Lo que si se especifica es el proceso de ajuste: los dos modelos (mini y nano) se entrenaron partiendo de los checkpoints ya publicados de MORENA, con un decaimiento WSD (warmup-stable-decay) hasta cero, durante 25 y 33 minutos respectivamente sobre una unica A100. El conjunto de entrenamiento contiene 21.407 registros distribuidos sobre 24.000 menus de herramientas distintos, lo que fuerza al modelo a leer el esquema de cada herramienta en lugar de memorizar nombres concretos.

La innovacion tecnica mas relevante es el formato de prompt basado en tokens reservados en lugar de texto plano. La secuencia es `<eos><reserved_0>\n<reserved_2>{menu_json}\n{question}\n<reserved_1>`, y el token inmediatamente posterior a `<reserved_1>` actua como decision: `<reserved_3>` abre una llamada a herramienta y un salto de linea abre prosa. El campo `{menu_json}` es un array JSON de objetos con las claves `name`, `description` y `arguments`. Para ediciones multiturno se reproduce la llamada pendiente y se anade la correccion; la respuesta es un parche con la forma `{"op":"patch","set":{...}}` que solo incluye los campos modificados, en lugar de reemitir la llamada completa.

El autor declara que la cuantizacion Q4_K_M no introduce perdida medible: los ficheros cuantizados puntuan igual que los checkpoints en bf16 tanto en seleccion de herramienta como en higiene de argumentos. Tambien documenta que el menu de evaluacion se construyo a partir de la especificacion OpenAPI real de Paystack, con nombres de herramienta como `transferrecipient_create` o `bank_resolveAccountNumber` que no aparecen en los datos de entrenamiento y no son adivinables sin leer el esquema.

## Capacidades

- Seleccion de herramienta a partir de un menu en JSON: identifica la herramienta correcta en el 91% de los casos sobre un menu held-out construido desde la especificacion OpenAPI de Paystack.
- Cumplimiento del esquema de argumentos: en el 91% de los casos usa unicamente los argumentos declarados por la herramienta.
- Edicion selectiva de campos: en el 100% de los casos modificados por el test modifica un solo campo en lugar de reescribir todos.
- Abstención: en el 100% de los casos deja de emitir una llamada cuando ninguna herramienta del menu encaja con la peticion.
- Peticion de aclaracion: en el 100% de los casos pregunta en lugar de inventar cuando falta informacion.
- Memoria de hilo conversacional: mantiene el contexto de una conversacion a lo largo de seis turnos en el 100% de los casos evaluados.
- Salida en prosa ademas de llamadas a herramienta, segun el token de decision posterior a `<reserved_1>`.
- Formato de parche para ediciones: devuelve `{"op":"patch","set":{...}}` con solo los campos que cambian.
- Multilingue en cinco idiomas: pidgin nigeriano, yoruba, igbo, hausa e ingles.
- No se declaran capacidades de vision, audio, tool calling generico fuera del esquema descrito, ni modo de razonamiento explicito.

## Casos de uso

- Pasarelas de pago para el mercado nigeriano: el modelo traduce instrucciones coloquiales del tipo "envia 5.000 nairas a Chidi" en llamadas estructuradas a la API de Paystack, leyendo el esquema de la herramienta para rellenar `transferrecipient_create` con los argumentos correctos.
- Asistentes de banca movil en lenguas locales: al cubrir pidgin, yoruba, igbo y hausa, permite ofrecer atencion transaccional a usuarios que no operan en ingles, sin necesidad de un modelo multilingue grande.
- Enrutador de intenciones en backend: con 311 MB de pesos en Q4_K_M y ejecucion en CPU, se puede desplegar como servicio de enrutado de herramientas delante de un sistema mayor, reduciendo coste frente a enviar cada peticion a un modelo grande.
- Edicion conversacional de una operacion pendiente: un usuario puede pedir un cambio de importe o de destinatario sobre una llamada ya propuesta; el modelo responde con un parche que contiene solo el campo modificado, lo que simplifica la validacion en el backend.
- Deteccion de peticiones fuera de catalogo: gracias a su comportamiento de abstención y de peticion de aclaracion, sirve como filtro que deriva a un agente humano las solicitudes que no corresponden a ninguna herramienta disponible.
- Canales de bajo recursos (USSD, quiosco, terminal de punto de venta): al caber en CPU sin GPU dedicada, es viable en infraestructura de borde o en dispositivos con memoria limitada.
- Generacion de trazas sinteticas para evaluacion: al devolver JSON estricto y parches validos contra un menu dado, puede usarse para producir conjuntos de prueba de enrutado de herramientas en los cinco idiomas soportados.
- Proteccion frente a alucinacion de herramientas: el hecho de que el 100% de las pruebas de "ninguna herramienta encaja" terminen en silencio permite usarlo como capa de control antes de ejecutar acciones financieras irreversibles.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un menu held-out construido a partir de la especificacion OpenAPI real de Paystack. Ninguno de los nombres de herramienta del menu aparece en los datos de entrenamiento.

| Metrica | Modelo base | mini-tools |
|---|---|---|
| Elige la herramienta correcta | 0 a 9% | 91% |
| Usa solo argumentos declarados | 0% | 91% |
| Edita un campo, no todos | 0% | 100% |
| Se queda callado cuando no encaja ninguna herramienta | 0 a 13% | 100% |
| Pregunta en lugar de adivinar | 0% | 100% |
| Mantiene un hilo a lo largo de seis turnos | 0% | 100% |
| Decide llamar sin que se lo indiquen | 18 a 27% | 50% |

La ultima fila es, en palabras del propio autor, la limitacion honesta del modelo: si se le deja decidir por si mismo, llama aproximadamente la mitad de las veces y en el resto formula una pregunta aclaratoria, en ocasiones sobre un campo que la herramienta no posee. El 91% de la primera fila se mide con el marcador de llamada pre-rellenado, que es el mecanismo recomendado para eludir esa indecision.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco hay comparacion con modelos de terceros.

## Requisitos de hardware

- Peso en disco: 311 MB para `mini-tools-Q4_K_M.gguf` y 136 MB para `nano-tools-Q4_K_M.gguf`.
- VRAM o RAM estimada para inferencia: del orden de 0,5 a 1 GB para la variante mini en Q4_K_M incluyendo la ventana de contexto configurada; la cifra exacta no esta publicada.
- Cabe en GPU de consumo: si, cualquier GPU de consumo actual dispone de memoria suficiente para 311 MB de pesos; el autor lo orienta explicitamente a CPU de portatil.
- GPU recomendadas: no aplica para inferencia; para el ajuste fino se uso una A100 por modelo (25 minutos para uno y 33 minutos para el otro).
- Opciones de despliegue: llama.cpp mediante `llama-server` es la ruta documentada. Al ser GGUF, tambien es desplegable con Ollama y otros runners compatibles con llama.cpp. El soporte en vLLM o TGI no esta confirmado en la informacion disponible.
- Comando de referencia: `llama-server -m mini-tools-Q4_K_M.gguf --no-jinja -c 4096`. El flag `--no-jinja` es obligatorio en la practica: segun el autor, el parser de plantilla de chat descarta una respuesta valida cuando el modelo emite un byte sobrante y devuelve un 500 sobre una completion correcta.
- No debe configurarse penalizacion por repeticion: penaliza llaves y comillas repetidas, que son la materia prima del JSON, y empuja al modelo a emitir un token invalido justo despues de una llamada correcta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparaciones contra modelos de terceros, ni en parametros, ni en contexto, ni en benchmarks, ni en licencia. La unica comparacion documentada es interna al repositorio.

| Modelo | Parametros | Tamano en disco | Seleccion de herramienta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mini-tools (Q4_K_M) | 503M | 311 MB | 91% (con marcador pre-rellenado) | apache-2.0 | GGUF en este repositorio |
| nano-tools (Q4_K_M) | 209M | 136 MB | iguala a mini en seleccion, peor en decisiones de comportamiento | apache-2.0 | GGUF en este repositorio |
| Modelo base vamboai/morena-0.5b-mini | no disponible | no disponible | 0 a 9% | no disponible | HuggingFace (coleccion MORENA) |
| Modelos comparables de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor recomienda usar mini salvo que se necesite el modelo mas pequeno, porque iguala a nano en seleccion de herramienta y lo supera en todas las conductas que implican decidir que hacer.

## Limitaciones y advertencias

- Indecision sin marcador pre-rellenado: dejado a su criterio, solo emite la llamada en el 50% de los casos; el 91% de acierto en seleccion de herramienta se obtiene pre-rellenando el marcador de llamada.
- Preguntas fuera de lugar: puede solicitar aclaracion sobre un campo que la herramienta no posee, lo que exige validacion posterior en el backend.
- Tamano reducido: con 503M de parametros, el modelo esta especializado en enrutado de herramientas y no debe esperarse de el razonamiento general, redaccion larga ni conocimiento factual amplio.
- Dominio acotado: los datos de evaluacion y buena parte del diseno giran en torno a la especificacion de Paystack y al sector fintech nigeriano; el rendimiento fuera de ese dominio no esta medido.
- Cobertura linguistica limitada a cinco idiomas (pcm, yor, ibo, hau, en); no se declara soporte para otras lenguas africanas ni para variedades regionales distintas.
- Riesgo de alucinacion en los valores de los argumentos: los benchmarks miden higiene de argumentos y abstención, pero no la veracidad de los valores introducidos (importes, numeros de cuenta, identificadores).
- Configuracion fragil: requiere `--no-jinja` y prohibe la penalizacion por repeticion; saltarse cualquiera de las dos pautas degrada la salida o provoca errores 500 en el servidor.
- Longitud de contexto no documentada: no se especifica la ventana nativa del modelo base, y el ejemplo de despliegue fija 4096 tokens.
- Adopcion nula: el repositorio presenta 0 descargas y 0 likes, sin validacion independiente de los resultados publicados. Los resultados proceden unicamente del autor.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no se documentan en la informacion disponible los sesgos del modelo ni evaluaciones de seguridad o toxicidad.
- No se dispone de resultados en benchmarks estandar, lo que impide situar el modelo frente a alternativas de la misma categoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thisisisheanesu/morena-tools-gguf
- Modelo base: https://huggingface.co/vamboai/morena-0.5b-mini
- Coleccion MORENA: https://huggingface.co/collections/vamboai/morena
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/thisisisheanesu/morena-tools-nigerian-fintech
- Codigo y documentacion del entrenamiento: https://github.com/thisisisheanesu/morena-tools
- Demo en vivo: https://vambo--morena-pay-pay-web.modal.run

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a sitios de apuestas sin relacion con el contenido de esta ficha, por lo que no se incluyen.
