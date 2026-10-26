# turintech/Qwen3.5-9B-Artemis-GGUF

## Resumen

Qwen3.5-9B-Artemis-GGUF es una distribución cuantizada en formato GGUF del modelo Qwen3.5-9B de Alibaba Qwen, publicada por TurinTech bajo el nombre interno "Artemis". No es un modelo entrenado desde cero, sino un proceso de cuantización con matriz de importancia (tag `imatrix`) orientado a dos objetivos concretos: reducir el pico de memoria en GPU y preservar la fidelidad respecto al original en BF16. El resultado son ficheros de entre 5,167 GB y 6,155 GB que caben en GPUs de consumo.

El modelo base tiene 8.953.803.264 parámetros (aproximadamente 8,95 mil millones) y conserva las capacidades multimodales del original: la pipeline declarada es `image-text-to-text`, e incluye proyectores de visión separados (`mmproj-BF16.gguf` y `mmproj-F16.gguf`, 922 MB) que se cargan de forma opcional. También mantiene el soporte de function calling y el modo de razonamiento (thinking) activable o desactivable mediante `chat_template_kwargs.enable_thinking`.

La relevancia práctica está en los números declarados por el autor: con 8.192 tokens de contexto, el fichero Q4_K_M alcanza un pico de 5,7 GiB de VRAM en una RTX 5090, frente a los 15,9 GiB del original. Su siguiente token coincide con el del modelo en BF16 en el 94,0 % de los tokens de WikiText-2, frente al 92,9 % de la cuantización Q4_K_M de Unsloth. La licencia es Apache 2.0, lo que facilita el uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no detallada en la model card; modelo base Qwen3.5-9B (transformer denso, sin parametros activos declarados) |
| Parametros totales | 8.953.803.264 (aprox. 8,95 mil millones) |
| Parametros activos | no aplica (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible en la model card; los ejemplos de uso emplean `-c 8192`. El contexto nativo del modelo base Qwen3.5-9B no figura en la informacion proporcionada |
| Tipos de cuantizacion | IQ4_XS (5,167 GB), Q4_K_M (5,661 GB, por defecto), Q5_K_S (6,155 GB); proyectores de vision en BF16 y F16 (922 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (enlace a la licencia del modelo base) |
| Formato de pesos | GGUF (libreria `gguf`, compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo base ni sus datos de entrenamiento: no se indica composicion del corpus, numero de tokens, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que si se describe es el proceso de compresion aplicado por TurinTech, que parte de los pesos originales de Qwen/Qwen3.5-9B y genera ficheros GGUF mediante cuantizacion con matriz de importancia (`imatrix`), una tecnica que pondera el error de cuantizacion segun la relevancia estadistica de cada peso. Segun la model card, el texto de WikiText-2 empleado como referencia tambien sirvio para elegir el fichero por defecto del repositorio.

El elemento diferencial frente a otras cuantizaciones del mismo modelo es la verificacion explicita de fidelidad: se mide la coincidencia del siguiente token con el modelo en BF16 sobre WikiText-2 y se comparan las respuestas en tareas retenidas de function calling e instrucciones. Ademas, el repositorio incluye los proyectores de vision convertidos desde los pesos originales, de modo que la capacidad multimodal no se pierde en el proceso de cuantizacion del decoder.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat, con plantilla Jinja (`--jinja` en llama-server).
- Razonamiento opcional en modo thinking: activable o desactivable con `chat_template_kwargs.enable_thinking`; los resultados de tool calling se obtuvieron con thinking desactivado.
- Function calling / tool calling: el modelo emite `tool_calls` estructurados en el endpoint compatible con OpenAI `/v1/chat/completions`. En la prueba documentada devolvio `get_weather` con `{"city":"Paris","unit":"celsius"}`.
- Vision e image-text-to-text: acepta imagenes como data URL en la parte `image_url` del mensaje de usuario, mediante el proyector `mmproj-BF16.gguf` o `mmproj-F16.gguf`. En 20 preguntas sobre graficos acerto 16.
- Seguimiento de instrucciones con formato y restricciones verificables (evaluado con IFEval: 456 de 541 instrucciones cumplidas).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Integracion con servidores locales: `llama-server` y Ollama, incluyendo paquetes publicados en el registro de Ollama con etiquetas `iq4_xs`, `q4_k_m` y `q5_k_s`.

## Casos de uso

- Asistente de chat local en GPU de consumo: con 5,7 GiB de pico en Q4_K_M y 8.192 tokens de contexto, el modelo se puede ejecutar en una unica GPU domestica reciente mediante `llama-server`, sin depender de APIs externas ni enviar datos a terceros.
- Agente con herramientas en produccion interna: el soporte de function calling con salida estructurada permite conectarlo a APIs de negocio (consultas de estado, reservas, calculos) usando el esquema de herramientas de OpenAI y el parser integrado de llama.cpp u Ollama con `--jinja`.
- Extraccion de datos de graficos e imagenes: el proyector de vision incluido resuelve preguntas sobre capturas de paneles, diagramas o tablas en imagen (16 de 20 aciertos en el conjunto de prueba del autor), util para automatizar la lectura de informes escaneados.
- Cumplimiento estricto de formato en pipelines: con 456 de 541 instrucciones IFEval cumplidas, es viable para tareas que exigen salidas con formato fijo (JSON, listas, limites de longitud), combinado con validacion posterior en codigo.
- Despliegue en entornos con hardware restringido o air-gapped: al ser GGUF con licencia Apache 2.0 y no requerir GPU de datacenter, encaja en estaciones de trabajo sin conectividad o con politica de no usar servicios en la nube.
- Prototipado rapido y evaluacion comparativa de cuantizaciones: el repositorio publica metricas de fidelidad frente al BF16 y frente a la cuantizacion de Unsloth, lo que permite medir el impacto de la compresion antes de adoptar el modelo en un pipeline real.
- Servicio de razonamiento con modo thinking conmutable: la posibilidad de activar o desactivar el razonamiento por peticion permite usar el mismo servidor para tareas de respuesta rapida y para consultas que requieren cadenas de razonamiento mas largas.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (campo `verified: false` en la model-index; no verificados de forma independiente).

| Tarea / conjunto | Metrica | Qwen3.5-9B-Artemis | Referencia |
|---|---|---|---|
| Fidelidad vs BF16 (WikiText-2 test) | Same top-p (%) | 94,0 | Unsloth Q4_K_M: 92,9 |
| Function calling (BFCL live, tareas retenidas) | Tool calls correctas | 221 de 258 | no disponible |
| Seguimiento de instrucciones (IFEval) | Instrucciones cumplidas | 456 de 541 | no disponible |
| Vision (20 preguntas sobre graficos) | Respuestas correctas | 16 (proyector BF16) / 16 (F16) | Unsloth Q4_K_M + su proyector: 14 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. Los resultados de tool calling se obtuvieron con decodificacion greedy y thinking desactivado.

## Requisitos de hardware

- VRAM estimada para inferencia: 5,7 GiB de pico con Q4_K_M y contexto de 8.192 tokens (medido en RTX 5090). El fichero IQ4_XS es 494 MB mas pequeno y deberia reducir el pico, aunque no se publica una medicion concreta. El modelo original en BF16 presenta un pico de 15,9 GiB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para Q4_K_M con contexto moderado; el autor documenta la RTX 5090 como plataforma de medida. GPUs de datacenter (A100, H100) no son necesarias para esta cuantizacion y no se aportan datos de rendimiento en ellas.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (por ejemplo, gamas RTX xx60/xx70 recientes) para Q4_K_M; para IQ4_XS el margen es mayor. No se especifican modelos concretos probados aparte de la RTX 5090.
- Opciones de despliegue: `llama-server` de llama.cpp con soporte de Qwen3.5 y HTTPS (probado con la build b11617), descarga directa con `-hf` o `hf download`, y Ollama mediante `turintech/qwen3.5-9b-artemis:q4_k_m` o `hf.co/turintech/Qwen3.5-9B-Artemis-GGUF:Q4_K_M` (esta ultima incluye el proyector de vision). vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. La model card no publica tokens por segundo ni latencias.
- Nota sobre vision: el proyector es un fichero aparte de 922 MB; con `--no-mmproj` se omite la descarga y se ejecuta solo texto.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | Contexto | Fidelidad vs BF16 (WikiText-2) | Vision | Licencia |
|---|---|---|---|---|---|---|
| turintech/Qwen3.5-9B-Artemis-GGUF (Q4_K_M) | 8,95 B | GGUF, 5,661 GB | no disponible (ejemplos con 8192) | 94,0 % same top-p | Si, proyector BF16/F16 | Apache 2.0 |
| unsloth Qwen3.5-9B Q4_K_M | 8,95 B | GGUF, 5,681 GB | no disponible | 92,9 % same top-p | Si, proyector propio (14/20 en graficos) | Apache 2.0 (heredada) |
| Qwen/Qwen3.5-9B (original) | 8,95 B | safetensors BF16 | no disponible | referencia (100 %) | Si | Apache 2.0 |

Las tres opciones comparten pesos base y licencia; la diferencia medible esta en el tamano del fichero, el pico de VRAM y la fidelidad declarada. No se dispone de datos para comparar con modelos de otras familias o tamanos en la informacion proporcionada.

## Limitaciones y advertencias

- Todos los benchmarks son autodeclarados por TurinTech y aparecen como no verificados (`verified: false`) en la model-index. No hay evaluacion independiente.
- Los resultados de tool calling e IFEval se obtuvieron con decodificacion greedy y thinking desactivado; los paquetes de Ollama no fijan esa configuracion completa y usan temperatura 1, top_k 20, top_p 0,95 y presence_penalty 1,5, por lo que no reproducen necesariamente esas cifras.
- La comprobacion del registro de Ollama fue una revision de solo lectura de etiquetas, hashes SHA-256 y ajustes, no una descarga ni una prueba de inferencia fresca. El smoke test de importacion local cubrio un unico prompt con herramienta, semilla 20261015 y limite de 256 tokens: valida el parser, no la precision en tareas.
- La cuantizacion introduce degradacion respecto al BF16: un 6 % de tokens con siguiente token distinto en WikiText-2 para Q4_K_M. En tareas de razonamiento largo o codigo el impacto puede ser mayor que en texto generico y no se ha medido.
- La longitud de contexto nativa y los idiomas soportados no se documentan; los ejemplos usan 8.192 tokens y no se garantiza un comportamiento correcto mas alla de esa cifra en esta cuantizacion.
- La vision requiere descargar y cargar un proyector adicional; los paquetes basicos de Ollama contienen solo el fichero principal, por lo que la capacidad de imagen no esta disponible salvo usando la ruta de Hugging Face con Ollama 0.40.11 o superior.
- La model card no detalla sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad del modelo base, por lo que no se puede evaluar el riesgo de sesgo ni de contenido danino a partir de esta informacion.
- Riesgo de alucinacion: inherente a los modelos de 9 B; no se aportan mediciones de tasa de alucinacion ni evaluaciones de veracidad.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con obligacion de conservar el aviso de licencia; se enlaza a la licencia del modelo base en el repositorio de Qwen.
- El modelo se publico con 1.493 descargas y 2 likes en el momento de la consulta, y la model card no ha pasado por revision independiente: conviene validarlo en el caso de uso propio antes de adoptarlo.
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo; los unicos enlaces fiables son los del repositorio y la documentacion del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/turintech/Qwen3.5-9B-Artemis-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Resultados declarados en la model card: https://huggingface.co/turintech/Qwen3.5-9B-Artemis-GGUF#results
- Sitio del autor: https://turintech.ai
- Paquete en Ollama: `turintech/qwen3.5-9b-artemis:q4_k_m` (referenciado en la model card; no se ha encontrado URL publica adicional en la informacion disponible)
- Enlaces de busqueda web sobre papers, blogs o demos: no disponible (la busqueda no devolvio resultados tecnicos pertinentes)
