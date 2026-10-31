# turintech/gemma-4-12B-it-Artemis-GGUF

## Resumen

Gemma 4 12B it Artemis es una conversión a formato GGUF del modelo Google Gemma 4 12B (versión instruction-tuned con cuantización consciente del entrenamiento, QAT), realizada por TurinTech con su herramienta Artemis. El modelo base es `google/gemma-4-12B-it-qat-q4_0-unquantized`, un checkpoint multimodal (imagen-texto a texto) de 11.907.350.576 parámetros pensado para chat, razonamiento y uso de herramientas en una sola GPU.

El valor diferencial de esta conversión es la fidelidad al checkpoint original: según datos del autor, en texto de chat coincide con el token siguiente del original el 90,3 % de las veces, frente al 77,8 % de la conversión Q4_0 oficial de Google (6,98 GB frente a 6,72 GB de descarga). Además, el repositorio incluye el proyector de visión convertido por separado y un borrador MTP (multi-token prediction) para decodificación especulativa.

Es relevante porque permite ejecutar un modelo multimodal de gama media con capacidades de razonamiento (thinking mode) y tool calling en GPUs de consumo, con un consumo pico de solo 8,4 GiB de memoria GPU y velocidades de generación de hasta 334,6 tokens por segundo en una RTX 5090 cuando se activa el borrador MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto a texto), con borrador MTP para decodificacion especulativa |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8.192 tokens (valor usado en los ejemplos; maximo del modelo: no disponible) |
| Tipos de cuantizacion | Q4_0 (fichero principal, 6,72 GB); proyector de vision en BF16 y F16; borrador MTP en Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (la model card enlaza ademas la Gemma 4 License de Google para el modelo base) |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo deriva del checkpoint QAT (quantization-aware training) de Google para Gemma 4 12B instruction-tuned. La cuantizacion consciente del entrenamiento significa que el modelo aprende durante el entrenamiento a ser robusto a la cuantizacion Q4_0, lo que reduce la perdida de calidad respecto a una cuantizacion post-entrenamiento convencional. TurinTech convierte estos pesos a GGUF con su pipeline Artemis, obteniendo un fichero principal de 6,72 GB que preserva mejor la distribucion del original que la conversion oficial de Google (90,3 % frente a 77,8 % de coincidencia en el siguiente token sobre OASST1).

El repositorio incluye tres componentes adicionales: un proyector de vision convertido de los pesos originales (`mmproj-BF16.gguf` y `mmproj-F16.gguf`, que tambien contiene las capas de entrada de audio, no probadas por el autor), y un borrador MTP (`mtp-gemma-4-12B-it-Artemis.gguf`) que corresponde al drafter oficial de Google (`gemma-4-12B-it-qat-q4_0-unquantized-assistant`, revision 1893406) convertido a GGUF y cuantizado a Q4_0. El borrador predice los siguientes tokens que el modelo principal verifica, acelerando la generacion mediante decodificacion especulativa. El chat template incorporado activa por defecto el modo de razonamiento (thinking), que el servidor devuelve en `message.reasoning_content`. No se dispone de informacion sobre el numero de tokens de entrenamiento ni la composicion del dataset del modelo base.

## Capacidades

- Generacion de texto conversacional con plantilla de chat almacenada en el propio fichero GGUF (compatible con `--jinja` en llama.cpp).
- Modo de razonamiento (thinking) activado por defecto: la salida se separa en `message.reasoning_content` y `message.content`; se puede desactivar con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling / function calling: 190 de 200 llamadas correctas en el subconjunto simple del Berkeley Function Calling Leaderboard segun datos del autor.
- Comprension de imagenes (vision) mediante el proyector convertido; se envian las imagenes como data URL en una parte `image_url` del mensaje. En 20 preguntas sobre graficos acerto 13 con el proyector BF16 y 12 con el F16.
- Entrada de audio: el proyector incluye las capas de audio, pero el autor no ha probado esta funcionalidad.
- Generacion acelerada mediante decodificacion especulativa con el borrador MTP (de 160,1 a 334,6 tokens por segundo en una RTX 5090).
- Razonamiento matematico: 240 de 250 respuestas correctas en una muestra de GSM8K test segun datos del autor.
- Compatibilidad con Ollama, tanto desde el paquete local (`turintech/gemma-4-12b-it-artemis:q4_0`) como desde Hugging Face con el proyector incluido (`hf.co/turintech/gemma-4-12B-it-Artemis-GGUF:Q4_0`).

## Casos de uso

- Chatbots conversacionales en local: con el modo thinking y el chat template integrado, se puede desplegar un asistente multi-turno con `llama-server` en una sola GPU de consumo, separando el razonamiento de la respuesta final para interfaces que muestran el proceso de pensamiento.
- Agentes con llamadas a herramientas: el alto acierto en tool calling (190/200 en BFCL simple) lo hace adecuado para pipelines de agentes que invocan funciones externas (busquedas, APIs, ejecucion de codigo) a traves del endpoint compatible con la API de chat de llama.cpp.
- Analisis de graficos y documentos visuales: el proyector de vision permite enviar capturas de dashboards o graficos como `image_url` y obtener respuestas sobre su contenido, util en informes automatizados o extraccion de datos de imagenes.
- Generacion de texto de alta velocidad: con el borrador MTP activado (`--spec-type draft-mtp`), se duplica el throughput de generacion, util para procesar lotes de documentos o respuestas largas en tiempo real.
- Prototipado rapido con Ollama: un solo comando (`ollama run hf.co/turintech/gemma-4-12B-it-Artemis-GGUF:Q4_0`) descarga el modelo con vision incluida, ideal para desarrolladores que quieren probar capacidades multimodales sin configurar infraestructura.
- Resolucion de problemas matematicos y razonamiento paso a paso: el rendimiento en GSM8K (240/250 en la muestra del autor) y el modo thinking lo hacen apto para asistentes de aprendizaje o verificacion de calculos.
- Integracion en aplicaciones con contexto moderado: la ventana de 8.192 tokens usada en los ejemplos permite conversaciones largas o resumenes de documentos de longitud media sin exceder la memoria de una GPU de consumo.

## Benchmarks y rendimiento

Resultados declarados por el autor (TurinTech), no verificados de forma independiente:

| Benchmark | Metrica | Resultado |
|---|---|---|
| BFCL simple (Berkeley Function Calling Leaderboard) | Tool calls correctas (de 200) | 190 |
| GSM8K test | Respuestas correctas (de 250) | 240 |
| OASST1 chat (cercania al original) | Coincidencia del siguiente token (%) | 90,3 |
| OASST1 chat (conversion Q4_0 oficial de Google, referencia) | Coincidencia del siguiente token (%) | 77,8 |
| Preguntas sobre graficos (20 preguntas, proyector BF16) | Aciertos | 13 |
| Preguntas sobre graficos (proyector F16) | Aciertos | 12 |
| Generacion en RTX 5090 sin MTP | Tokens por segundo (30 prompts) | 160,1 |
| Generacion en RTX 5090 con borrador MTP | Tokens por segundo (30 prompts) | 334,6 |

Nota del autor sobre el MTP: las respuestas greedy no siempre coinciden palabra por palabra con el borrador activado; las 10 respuestas con tool calls coincidieron, y 1 de las 20 respuestas de chat y codigo difirio.

## Requisitos de hardware

- Memoria GPU pico medida: 8,4 GiB en una NVIDIA A100 80 GB con el fichero Q4_0 y contexto de 8.192 tokens; memoria de proceso de 6,5 a 6,7 GiB.
- El fichero principal ocupa 6,72 GB en disco; el proyector de vision anade 175 MB (BF16/F16) y el borrador MTP un fichero Q4_0 adicional.
- Dado el consumo pico de 8,4 GiB, cabe en GPUs de consumo con 12 GB de VRAM o mas (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090); el autor ha medido rendimiento en una RTX 5090.
- Opciones de despliegue: llama.cpp (`llama-server`, probado con las versiones b11617 y b11889), Ollama 0.40.11 o mas reciente (para vision desde Hugging Face), y descarga directa con `huggingface_hub`.
- Throughput medido: 160,1 tokens por segundo en RTX 5090 sin borrador, 334,6 tokens por segundo con borrador MTP.
- Para desplegar con vision, anadir `--mmproj mmproj-BF16.gguf`; para solo texto, `--no-mmproj` evita la descarga del proyector.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion / tamano | Vision | Fidelidad al original | Licencia |
|---|---|---|---|---|---|
| turintech/gemma-4-12B-it-Artemis-GGUF (Q4_0) | 11.907.350.576 | Q4_0, 6,72 GB | Si (proyector aparte) | 90,3 % de coincidencia del siguiente token | Apache 2.0 |
| Conversion Q4_0 oficial de Google del mismo checkpoint | 11.907.350.576 | Q4_0, 6,98 GB | no disponible | 77,8 % de coincidencia del siguiente token | Gemma 4 License |
| unsloth/gemma-4-12B-it-qat-GGUF (UD-Q4_K_XL) | 11.907.350.576 | UD-Q4_K_XL, no disponible | Si (con proyector de Unsloth) | no disponible | no disponible |

En la prueba de 20 preguntas sobre graficos, el modelo de TurinTech con proyector BF16 empató con la version UD-Q4_K_XL de Unsloth (13 aciertos cada uno).

## Limitaciones y advertencias

- Los benchmarks publicados son declaraciones del autor, no verificados independientemente, y las muestras son pequenas (200, 250 y 20 casos), por lo que los resultados pueden no generalizar.
- Con el borrador MTP activado, las respuestas greedy no siempre coinciden exactamente con las del modelo sin borrador (1 de 20 respuestas de chat y codigo difirio), algo a considerar en aplicaciones que exigen determinismo.
- Las capas de entrada de audio incluidas en el proyector no han sido probadas por el autor; no se garantiza su funcionamiento.
- La longitud de contexto de 8.192 tokens usada en los ejemplos es relativamente moderada; el maximo real del modelo base no esta especificado en la informacion disponible.
- El modo thinking esta activado por defecto y consume tokens de salida adicionales (se recomiendan unos 1.500), lo que puede aumentar la latencia percibida si no se desactiva.
- Aunque el fichero GGUF se distribuye bajo Apache 2.0, el modelo base es Gemma 4 de Google y la model card enlaza la Gemma 4 License; conviene revisar los terminos de esa licencia para uso comercial del modelo base.
- Como todo modelo de lenguaje, puede alucinar informacion; no se dispone de evaluaciones especificas de sesgo o veracidad en la informacion proporcionada.
- Los idiomas soportados no estan documentados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/gemma-4-12B-it-Artemis-GGUF
- Modelo base de Google: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Borrador MTP oficial de Google: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized-assistant
- Gemma 4 License de Google: https://ai.google.dev/gemma/docs/gemma_4_license
- Web de TurinTech: https://turintech.ai
- Resultados detallados en la model card: https://huggingface.co/turintech/gemma-4-12B-it-Artemis-GGUF#results
