# turintech/Qwen3.8-27B-Artemis-GGUF

## Resumen

Qwen3.8-27B-Artemis-GGUF es una cuantización GGUF del modelo Qwen3.8-27B de Qwen (Alibaba Cloud), publicada por TurinTech con su pipeline propio denominado Artemis. El repositorio contiene un único archivo, `Qwen3.8-27B-Artemis-IQ2_XXS.gguf`, de 7,83 GB (7.830.620.736 bytes), que comprime los pesos en BF16 del modelo original (26.895.998.464 parámetros) hasta aproximadamente una séptima parte de su tamaño. La conversión es texto únicamente: excluye el codificador de visión y la capa de predicción multi-token (MTP) del modelo base.

El objetivo declarado del autor es ejecutar tool calling y agentes en local sobre una GPU de 10 GB o más, con un pico de memoria de 9,0 GiB medido en una A100 con contexto de 8.192 tokens. Sobre 111 tareas de tool calling paralelo del benchmark BFCL, el archivo resuelve 87 correctamente, frente a 63 del archivo comparable de AtomicChat (AD-IQ1_M, 8,21 GB) y 75 del de Unsloth (UD-IQ2_XXS, 7,27 GB). El precio de esa ventaja en herramientas es una pérdida de precisión en matemáticas y en la fidelidad respecto al original: 180 de 200 problemas de GSM8K y un 68,6 % de coincidencia en el siguiente token con el BF16 sobre 250 textos mixtos.

Es relevante ahora por dos motivos: demuestra que una cuantización de ~2 bits puede conservar capacidad de function calling utilizable, y lo hace sobre un modelo de 27B con licencia Apache 2.0, lo que permite uso comercial. Conviene tener en cuenta que el conjunto de tareas usado para elegir el archivo ya se había empleado para comparar candidatos, por lo que, en palabras del autor, no constituye un test independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Qwen3.8-27B; el autor no detalla la arquitectura interna en la model card |
| Parametros totales | 26.895.998.464 (datos de safetensors del modelo base) |
| Parametros activos | No aplica; no hay informacion que indique arquitectura MoE |
| Longitud de contexto | No disponible para el modelo base; la evaluacion del autor se ejecuto con 8.192 tokens (`-c 8192`) |
| Tipos de cuantizacion | IQ2_XXS (unico archivo del repositorio); etiquetado por el autor como clase de tamano de ~2 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del archivo | 7,83 GB decimales / 7.830.620.736 bytes |
| Modalidad | Solo texto (sin codificador de vision) |
| Capas excluidas | Codificador de vision y capa de prediccion multi-token (MTP) |
| Modelo base | Qwen/Qwen3.8-27B |
| Relacion con el base | Quantized (conversion independiente de TurinTech, no afiliada a Alibaba Cloud ni al equipo Qwen) |
| Plantilla de chat | Incluida en el GGUF, se activa con `--jinja`; el modo thinking viene activado por defecto |

## Arquitectura y entrenamiento

El archivo es una conversion de pesos, no un modelo entrenado desde cero: TurinTech parte de Qwen3.8-27B, convierte los tensores de texto a GGUF y los cuantiza a IQ2_XXS para llama.cpp. No se publican en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base uso RLHF, DPO u otras tecnicas de alineamiento. Tampoco se documenta la arquitectura interna del base mas alla de su caracter de transformer de 27B orientado a chat, razonamiento, codigo y uso de herramientas.

La innovacion tecnica reseñable no esta en la arquitectura sino en el proceso de cuantizacion: el autor reporta que su archivo mantiene un 68,6 % de coincidencia de siguiente token con el BF16 original sobre 250 textos mixtos, un porcentaje inferior al de los archivos de Unsloth de 7,27 GB y 8,37 GB, lo que sugiere que la cuantizacion esta optimizada deliberadamente para preservar el comportamiento en tool calling a costa de fidelidad general. El repositorio incluye la plantilla de chat Jinja con soporte de modo thinking separado (`message.reasoning_content` frente a `message.content`), lo que permite desactivar el razonamiento por peticion mediante `chat_template_kwargs.enable_thinking`.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat integrada y compatible con la API `/v1/chat/completions`.
- Tool calling y function calling en formato OpenAI: el autor verifico la devolucion correcta de `tool_calls` con argumentos estructurados (por ejemplo, `get_weather` con `{"city":"Paris","unit":"celsius"}`).
- Tool calling paralelo: capaz de emitir varias llamadas en una sola respuesta (verificado con peticiones simultaneas para Paris y Tokio).
- Razonamiento en modo thinking, activable o desactivable por peticion; los tokens de razonamiento se exponen en `reasoning_content`.
- Capacidad matematica basica: 180 de 200 problemas de GSM8K resueltos.
- Razonamiento y codigo heredados del modelo base Qwen3.8-27B (chat, reasoning, coding y tool use segun la descripcion del autor).
- Ejecucion local y offline una vez descargado el modelo y el runtime.
- Sin capacidad de vision: el codificador de vision no esta incluido en el GGUF.

## Casos de uso

- **Agentes de tool calling en local**: con 87 aciertos sobre 111 tareas BFCL paralelas, el archivo es adecuado para orquestadores de agentes que necesitan emitir varias llamadas a funciones por turno sin salir de la maquina, con un consumo de 9,0 GiB de VRAM a 8.192 tokens de contexto.
- **Asistentes con datos sensibles on-premise**: al ejecutarse con llama.cpp u Ollama sobre hardware propio, las entradas no salen de la infraestructura del cliente, lo que encaja en entornos con requisitos de confidencialidad estrictos.
- **Atencion al cliente automatizada con integracion de sistemas**: la plantilla de chat y el soporte de `tools` en formato OpenAI permiten conectar el modelo a APIs internas (consultas de pedidos, estado de envios, cambios de direccion) devolviendo argumentos JSON validables antes de ejecutar la accion.
- **Prototipado y evaluacion de pipelines de agentes**: sirve como modelo de referencia barato en CI para validar prompts, esquemas de herramientas y flujos multi-paso antes de pasar a un modelo mayor o a una cuantizacion de mas bits.
- **Automatizacion de tareas ofimaticas con herramientas**: extraccion de parametros desde lenguaje natural y emision de llamadas a funciones para crear eventos, enviar correos o consultar bases de datos, con modo thinking desactivado para minimizar latencia y tokens de salida.
- **Despliegue en estaciones de trabajo con GPU de gama media**: el requisito declarado de 10 GB o mas de VRAM permite ejecutarlo en tarjetas de consumo de 12 GB, habilitando asistentes de codigo o de documentacion completamente offline.
- **Razonamiento acotado con presupuesto controlado**: activando `enable_thinking` solo en las peticiones que lo requieran, se puede reservar el modo de razonamiento para tareas de analisis y mantener respuestas directas en el resto del trafico.

## Benchmarks y rendimiento

| Benchmark | Artemis IQ2_XXS (7,83 GB) | Unsloth UD-IQ2_XXS (7,27 GB) | Unsloth UD-IQ2_S (8,37 GB) | AtomicChat AD-IQ1_M (8,21 GB) |
|---|---|---|---|---|
| BFCL tool calling paralelo (aciertos / 111) | 87 | 75 (p = 0,017 frente a Artemis) | 81 (sin separacion estadistica frente a Artemis) | 63 (p = 0,0004 frente a Artemis) |
| GSM8K (aciertos / 200) | 180 | no disponible | 183 | 186 |
| Coincidencia del siguiente token con BF16 (%) | 68,6 | no disponible (el autor indica que es mas cercano al original) | no disponible (el autor indica que es mas cercano al original) | no disponible |

Notas metodologicas declaradas por el autor: decodificacion greedy con thinking desactivado para las pruebas de tool calling; 250 textos mixtos para la metrica de coincidencia de siguiente token; comparaciones con test pareado. El autor advierte que el conjunto final de tareas ya se habia usado para comparar archivos candidatos y que el archivo se eligio despues de ver esos resultados, por lo que no es un test independiente. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- **VRAM de inferencia**: 9,0 GiB de pico medido en una NVIDIA A100 con contexto de 8.192 tokens; el autor recomienda una GPU de 10 GB o mas.
- **GPU de centro de datos**: A100 validada por el autor con llama.cpp b11617 y b11871.
- **GPU de consumo**: el umbral declarado de 10 GB permite en teoria tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070 12 GB) y de 16 GB o mas (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090); el autor no documenta mediciones en estas tarjetas.
- **GPU por debajo de 10 GB**: no soportado segun las recomendaciones del autor; no se documenta offloading parcial a CPU.
- **Opciones de despliegue**: `llama-server` de llama.cpp con `--jinja` (probado), Ollama mediante `turintech/qwen3.8-27b-artemis:iq2_xxs` (paquete con capa de modelo identica al archivo, renderer `qwen3.5`), y LM Studio `llmster` 0.0.25 con motor CUDA llama.cpp 2.41.0 (solo verificacion de carga y respuesta).
- **Despliegue no documentado**: no hay informacion sobre vLLM, TGI ni SGLang para este archivo.
- **Latencia y throughput**: no disponibles; el autor no publica tokens por segundo ni tiempos de primera respuesta.
- **Almacenamiento**: 7,83 GB para el archivo GGUF, mas el runtime de llama.cpp u Ollama.

## Comparativa con modelos similares

| Modelo / archivo | Parametros | Contexto evaluado | Tool calling BFCL (de 111) | GSM8K (de 200) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| turintech/Qwen3.8-27B-Artemis-GGUF (IQ2_XXS) | 26,9 B | 8.192 tokens | 87 | 180 | Apache 2.0 | Publico en HuggingFace (0 descargas en el momento de la consulta) |
| Unsloth UD-IQ2_XXS | 26,9 B (mismo base) | no disponible | 75 | no disponible | Apache 2.0 (heredada del base) | Publico |
| Unsloth UD-IQ2_S | 26,9 B (mismo base) | no disponible | 81 | 183 | Apache 2.0 (heredada del base) | Publico |
| AtomicChat AD-IQ1_M | 26,9 B (mismo base) | no disponible | 63 | 186 | Apache 2.0 (heredada del base) | Publico |

La comparacion es intradia: los cuatro archivos cuantizan el mismo modelo base Qwen3.8-27B, por lo que las diferencias reflejan la estrategia de cuantizacion, no la capacidad del modelo. Artemis gana en tool calling paralelo con significacion estadistica frente a dos de los tres competidores y pierde en matemáticas (180 frente a 183 y 186) y en fidelidad al BF16.

## Limitaciones y advertencias

- **Solo texto**: el codificador de vision no esta incluido, por lo que no se pueden procesar imagenes aunque el modelo base las soporte.
- **Sin capa MTP**: la prediccion multi-token del modelo base se ha eliminado, lo que puede reducir el throughput en decodificacion especulativa respecto a otros archivos que la conservan.
- **Degradacion en matematicas y documentos largos**: el propio autor reconoce que, si priman las matematicas o la fidelidad al original, especialmente en documentos largos, conviene un archivo mayor como UD-IQ2_S.
- **Cuantizacion agresiva de ~2 bits**: la coincidencia de siguiente token con el BF16 es del 68,6 %, por debajo de las alternativas de Unsloth; es esperable una mayor tasa de artefactos en generacion libre.
- **Evaluacion no independiente**: el conjunto de tareas se uso para seleccionar el archivo, por lo que los resultados estan sujetos a sesgo de seleccion.
- **Modo thinking activado por defecto**: la plantilla de chat activa el razonamiento salvo que se pase `enable_thinking: false`; en produccion esto incrementa tokens de salida y latencia si no se controla.
- **Contexto limitado en la configuracion probada**: la validacion se hizo con 8.192 tokens; no se documenta comportamiento con ventanas mayores ni el maximo del modelo base.
- **Idiomas no documentados**: no hay informacion sobre cobertura linguistica ni calidad en castellano.
- **Sesgos y alucinacion**: no se publica ninguna evaluacion de sesgos, toxicidad o tasa de alucinacion; se heredan los del modelo base Qwen3.8-27B sin analisis adicional.
- **Licencia**: Apache 2.0 permite uso comercial, pero el repositorio incluye un fichero `NOTICE` con atribuciones que debe conservarse; el autor declara explicitamente que no esta afiliado ni respaldado por Alibaba Cloud ni por el equipo Qwen.
- **Madurez del repositorio**: una unica descarga y un unico like en el momento de la consulta, con un solo archivo publicado; no hay garantia de mantenimiento ni de actualizaciones.
- **Madurez de la herramienta**: llama.cpp es compatible con el formato, pero las pruebas se limitaron a dos builds concretas (b11617 y b11871); otras versiones pueden requerir actualizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/turintech/Qwen3.8-27B-Artemis-GGUF
- Archivo GGUF directo: https://huggingface.co/turintech/Qwen3.8-27B-Artemis-GGUF/resolve/main/Qwen3.8-27B-Artemis-IQ2_XXS.gguf
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Aviso legal y atribuciones del repositorio: https://huggingface.co/turintech/Qwen3.8-27B-Artemis-GGUF/blob/main/NOTICE
- Detalles de la metodologia de evaluacion: https://huggingface.co/turintech/Qwen3.8-27B-Artemis-GGUF#how-it-was-tested
- Sitio del autor (TurinTech): https://turintech.ai
- Paquete Ollama: https://ollama.com/turintech/qwen3.8-27b-artemis
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos no guardaban relacion con el contenido de la ficha y se han descartado.
