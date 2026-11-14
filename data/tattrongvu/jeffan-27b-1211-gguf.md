# tattrongvu/Jeffan-27B-1211-GGUF

## Resumen

Jeffan-27B-1211-GGUF es la distribucion cuantizada en formato GGUF del modelo Jeffan-27B-1211, publicado por el usuario tattrongvu. No es un modelo generativo al uso: responde preguntas de decision estructuradas. Recibe como entrada un estado (un documento, una conversacion, una lista de herramientas) y una pregunta de opcion multiple sobre ese estado, y devuelve una probabilidad para cada opcion leida en un unico forward pass. No genera texto y no es un modelo conversacional.

El modelo base cuenta con 26.895.998.464 parametros (aproximadamente 27B), lo que lo situa en la gama alta de modelos densos. Esta version GGUF esta pensada para ejecucion en CPU con llama.cpp y Ollama, e incluye dos cuantizaciones: Q4_K_M (15,59 GiB) y Q8_0 (26,63 GiB). La licencia es Apache 2.0.

Su relevancia radica en el enfoque: en lugar de generar una respuesta en lenguaje natural, produce directamente una distribucion de probabilidad sobre opciones discretas, lo que lo hace adecuado para sistemas de enrutamiento, clasificacion y toma de decisiones automatizada donde se necesita una salida calibrada y determinista, no texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Jeffan-27B-1211; detalles de arquitectura no disponibles) |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (configurado via `num_ctx` en el Modelfile y en el repo) |
| Tipos de cuantizacion | Q4_K_M (15,59 GiB) y Q8_0 (26,63 GiB); bf16 en el modelo base |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp/Ollama); safetensors bf16 en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Jeffan-27B-1211 mas alla de que se trata de un transformer denso de aproximadamente 27B parametros. El modelo esta disenado especificamente para responder preguntas de opcion multiple leyendo probabilidades en un unico forward pass, sin generacion autoregresiva de texto. El prompt del modelo (linea de sistema, `State:`, `Question:`, `Options:` con codigos A, B, ...) se construye desde una plantilla incluida en el propio GGUF, de modo que el usuario solo envia el estado y la pregunta.

Una innovacion tecnica destacable es el mecanismo de "loop passes": por defecto el modelo ejecuta cada capa una vez (1 loop pass), que es lo que ejecutan llama.cpp y Ollama estandar. El modelo liberado puede ejecutar un bloque de sus capas intermedias dos veces (2 loop passes), lo que segun la model card mejora aproximadamente 0,6 puntos en otras pruebas held-out a costa de aproximadamente 1,4x la latencia, pero requiere un `llama-server` compilado con seis parches incluidos en el repositorio. La cuantizacion Q4_K_M se genero con una importance matrix calculada sobre prompts de decision en el formato propio del modelo; Q8_0 se genero directamente desde los pesos bf16 con el conversor de llama.cpp. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO.

## Capacidades

- Toma de decisiones estructurada: dada una entrada de estado y una pregunta de opcion multiple, devuelve una probabilidad para cada opcion en un unico forward pass.
- Clasificacion de texto mediante preguntas de opcion multiple (pipeline `text-classification`).
- Salida calibrada: el resultado incluye `choice` y `probabilities` por pregunta, lo que permite umbrales de confianza.
- Soporte de multiples preguntas en una misma peticion (objeto `questions` con varias entradas).
- Ejecucion en CPU con llama.cpp y Ollama (Ollama 0.40.5 o superior para modelos de decision).
- Compatible con endpoints estilo API (`/v1/systemone` en Ollama).
- No genera texto libre ni mantiene conversacion: no es un modelo de chat.
- Capacidades multilingues: no disponibles.
- Tool calling, agentes y razonamiento multi-paso: no disponibles como capacidades generativas; el modelo solo emite probabilidades sobre opciones.

## Casos de uso

- Enrutamiento de tickets de soporte: enviar el texto del ticket como estado y una pregunta de opcion multiple con los equipos posibles (facturacion, envios, soporte tecnico); el modelo devuelve la probabilidad de cada equipo y se enruta al de mayor valor. La model card incluye un ejemplo con un ticket de pantalla rota que obtiene aproximadamente 0,97 de probabilidad para "Shipping damage claims".
- Clasificacion de documentos: dado un documento y una pregunta de opcion multiple sobre su categoria, tipo o urgencia, obtener una distribucion de probabilidad utilizable para priorizacion o etiquetado automatico.
- Seleccion de herramientas en pipelines: dado un listado de herramientas disponibles como estado y una pregunta sobre cual usar, obtener probabilidades por herramienta para decidir la siguiente accion en un flujo automatizado.
- Moderacion y triaje de contenido: plantear preguntas de opcion multiple sobre politicas (permitido, revisar, bloquear) y usar las probabilidades para decidir si se requiere revision humana.
- Decisiones sobre conversaciones: analizar el historial de una conversacion como estado y preguntar por la intencion del usuario o el siguiente paso del flujo, con salida probabilistica.
- Despliegue en entornos sin GPU: al ejecutarse en CPU con llama.cpp u Ollama, es adecuado para servidores sin acelerador; la model card reporta aproximadamente 4 segundos por decision con prompt de 500 tokens en 32 nucleos y Q4_K_M, y 12 segundos en 8 nucleos.
- Sistemas con requisito de trazabilidad: al devolver probabilidades explicitas por opcion, permite registrar la confianza de cada decision y aplicar umbrales de derivacion a revision humana.

## Benchmarks y rendimiento

La model card no presenta resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Los unicos datos de rendimiento publicados son comparativas entre las cuantizaciones GGUF y el modelo base en bf16 sobre 1.290 preguntas de decision held-out:

| Metrica | Q4_K_M | Q8_0 |
|---|---|---|
| Tamano del archivo | 15,59 GiB | 26,63 GiB |
| Memoria en respuesta (CPU con AMX) | 31 GiB | 55 GiB |
| Misma respuesta que el modelo liberado (1.290 preguntas) | 1.272 | 1.282 |
| Cambio de precision (puntos, IC 95 %) | +0,3 [−0,4, +1,1] | −0,2 [−0,5, +0,2] |

La precision de referencia del modelo liberado en esas 1.290 preguntas es del 85,8 %. En las 300 preguntas adicionales usadas para medir el comportamiento de runtimes estandar, con Q4_K_M ninguna respuesta cambio y la mayor diferencia de probabilidad fue de 0,035. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M requiere 31 GiB de memoria residente maxima en CPU con AMX (llama.cpp mantiene una copia repackeada de los pesos); sin AMX, aproximadamente el tamano del archivo mas unos pocos GiB (no medido). Q8_0 requiere 55 GiB con AMX.
- GPU recomendadas: no disponibles en la informacion proporcionada; la model card indica que para muchas decisiones por segundo conviene usar GPU y el repositorio original del modelo base.
- Cabe en GPU consumer: no disponible; el enfoque de esta version es CPU.
- Opciones de despliegue: llama.cpp y Ollama (probado con Ollama 0.40.16 en Linux; soporte de modelos de decision desde 0.40.5). Para 2 loop passes se requiere `llama-server` compilado con los seis parches del repositorio.
- Latencia: aproximadamente 4 segundos por decision con prompt de 500 tokens en 32 nucleos de servidor con Q4_K_M; aproximadamente 12 segundos en 8 nucleos.
- Configuracion critica: `num_ctx` y `num_batch` deben ser iguales (8192 en la configuracion publicada); con el `num_batch` por defecto de Ollama (512) se rechazan los prompts de mas de 512 tokens.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificadores de decision por opcion multiple de aproximadamente 27B). El modelo base Jeffan-27B-1211 en bf16 con safetensors y motores GPU es la alternativa directa dentro del mismo proyecto, pero no se dispone de datos de terceros para una comparativa.

## Limitaciones y advertencias

- No es un modelo generativo ni conversacional: no produce texto libre ni mantiene dialogos.
- En CPU es lento para uso de alto volumen: aproximadamente 4 segundos por decision en 32 nucleos y 12 segundos en 8 nucleos con Q4_K_M; para muchas decisiones por segundo se recomienda GPU.
- La configuracion de Ollama debe ajustar `num_batch` igual a `num_ctx`; de lo contrario se rechazan prompts largos.
- El modo de 2 loop passes requiere parches en `llama-server`; los runtimes estandar ejecutan solo 1 loop pass.
- Los cambios de respuesta respecto al modelo en bf16 se concentran en casos ajustados (las dos opciones mas probables a menos de 0,19 de distancia).
- Idiomas soportados no disponibles: no se puede garantizar el comportamiento multilingue.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas en dominios alejados de los datos de entrenamiento; se recomienda validar con umbrales de confianza.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribucion correspondiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tattrongvu/Jeffan-27B-1211-GGUF
- Modelo base: https://huggingface.co/tattrongvu/Jeffan-27B-1211
- Archivo Q4_K_M: https://huggingface.co/tattrongvu/Jeffan-27B-1211-GGUF/blob/main/Jeffan-27B-1211-Q4_K_M.gguf
- Archivo Q8_0: https://huggingface.co/tattrongvu/Jeffan-27B-1211-GGUF/blob/main/Jeffan-27B-1211-Q8_0.gguf
- Sumas de verificacion: https://huggingface.co/tattrongvu/Jeffan-27B-1211-GGUF/blob/main/SHA256SUMS
