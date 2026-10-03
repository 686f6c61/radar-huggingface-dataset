# warped-community/Qwen3-4B-litert-lm

## Resumen

Qwen3-4B-litert-lm es un espejo del modelo Qwen3-4B de Alibaba Qwen, reconvertido al formato LiteRT-LM para su ejecución en dispositivos móviles y de borde. Lo mantiene el usuario warped-community como dependencia del proyecto Warped, una aplicación Android, y su único propósito declarado es servir de artefacto listo para embeber en dicha app. No introduce ningún ajuste fino, destilación ni modificación de pesos: es una conversión de formato y cuantización del archivo `qwen3_4b_mixed_int4.litertlm` publicado originalmente por litert-community.

El repositorio ocupa 2,7 GB y contiene un único artefacto en cuantización mixta de 4 bits, lo que sitúa el modelo en el rango de memoria de un teléfono de gama alta o media-alta actual. El modelo base es un transformer denso de aproximadamente 4.000 millones de parámetros, con licencia Apache-2.0 heredada del upstream, lo que permite uso comercial sin restricciones adicionales siempre que se respete la atribución.

Su relevancia es doble: por un lado, demuestra la ruta de despliegue on-device de la familia Qwen3 mediante el runtime LiteRT-LM de Google AI Edge; por otro, al ser un modelo denso de 4B en int4 mixto, es un punto de referencia práctico para medir si un asistente local con capacidad de razonamiento y tool calling cabe en un smartphone sin conexión. La contrapartida es que se trata de un repositorio sin documentación técnica propia, sin benchmarks publicados y con cero descargas y cero likes en el momento de la consulta, por lo que debe tratarse como un artefacto de conveniencia, no como una distribución de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) heredado de Qwen3-4B; no disponible el detalle de capas en la model card del espejo |
| Parametros totales | Aproximadamente 4.000 millones (modelo base Qwen3-4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No indicada en la model card del espejo; segun documentacion publica del modelo base Qwen3-4B, 32.768 tokens nativos y hasta 131.072 con escalado YaRN |
| Tipos de cuantizacion | int4 mixto (`qwen3_4b_mixed_int4.litertlm`); no se ofrecen otras variantes en este repositorio |
| Idiomas soportados | No disponibles en la model card del espejo; el modelo base declara cobertura multilingue amplia segun su documentacion publica |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM). No se incluyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

No hay información en el repositorio sobre el proceso de entrenamiento, la composición del dataset, el número de tokens vistos ni las etapas de alineación (SFT, RLHF o DPO). Todo ello corresponde al modelo base Qwen/Qwen3-4B, cuyos detalles publica Alibaba Qwen en su propia documentación y que este espejo no reproduce. Lo único verificable aquí es la transformación aplicada: el archivo `qwen3_4b_mixed_int4.litertlm` de litert-community se redistribuye tal cual, sin recuantizar ni modificar.

La innovación técnica relevante no está en el modelo, sino en el contenedor. El formato LiteRT-LM empaqueta los pesos cuantizados junto con la definición del grafo y el tokenizador, de modo que el runtime de Google AI Edge pueda ejecutar la inferencia sobre CPU, GPU o NPU del dispositivo sin necesidad de cargar un framework de Python. La cuantización mixta de 4 bits aplica precisión reducida de forma selectiva, típicamente manteniendo en mayor precisión las capas sensibles (embeddings, proyecciones de atención o normalizaciones) y bajando a 4 bits el resto de las matrices, lo que explica que el repositorio ocupe 2,7 GB en lugar de los aproximadamente 2,0 GB de una cuantización int4 uniforme sobre 4.000 millones de parámetros. El modelo base Qwen3-4B incorpora modo de razonamiento explícito (thinking mode) y soporte de llamada a herramientas, capacidades que se conservan al no alterarse los pesos.

## Capacidades

- Generación de texto y conversación multi-turno en el dispositivo, sin conexión a red.
- Razonamiento paso a paso: el modelo base Qwen3 admite un modo de pensamiento explícito que puede activarse o desactivarse según la latencia que se tolere.
- Generación y explicación de código, así como tareas de edición y depuración a pequeña escala.
- Matemáticas y aritmética de nivel escolar y universitario básico, con mayor fiabilidad si se activa el modo de razonamiento.
- Tool calling y function calling: el modelo base está entrenado para emitir llamadas estructuradas, lo que permite construir agentes locales que consulten APIs del propio dispositivo (calendario, contactos, ficheros).
- Razonamiento multi-paso encadenado con herramientas, sujeto a la ventana de contexto efectiva que permita el runtime.
- Capacidades multilingües heredadas del modelo base; el conjunto exacto de idiomas no está declarado en este repositorio.
- Ejecución acelerada por hardware en el dispositivo (CPU, GPU o NPU según el SDK LiteRT-LM), sin dependencia de Python.

## Casos de uso

- Asistente conversacional embebido en una app Android: el modelo se carga en memoria desde el archivo `.litertlm` y atiende al usuario en local, de modo que las conversaciones no salen del teléfono. Es adecuado porque su huella de 2,7 GB entra en el presupuesto de RAM de un dispositivo de gama alta actual.
- Dictado y resumen de notas de voz o texto: transcripciones largas pueden condensarse en local; conviene trocear la entrada para no exceder la ventana efectiva del runtime.
- Búsqueda aumentada sobre documentos personales (RAG on-device): indexación y respuesta sobre PDFs, correos o apuntes almacenados en el dispositivo, con la ventaja de que ningún fragmento se envía a un servidor.
- Traducción y reescritura multilingüe en modo avión: útil para viajes o entornos sin cobertura, aprovechando el entrenamiento multilingüe del modelo base.
- Soporte técnico offline para personal de campo: técnicos en instalaciones sin red pueden consultar procedimientos o diagnósticos introduciendo manuales como contexto.
- Clasificación y extracción de datos en pipelines móviles: convertir texto libre en JSON estructurado mediante tool calling, por ejemplo para registrar gastos o incidencias desde una app.
- Prototipado rápido de funciones de IA en aplicaciones de escritorio o web con LiteRT-LM, sin montar un servidor de inferencia ni gestionar GPU en la nube.
- Componente de agente local: el modelo puede actuar como planificador que decide qué API del sistema invocar en cada paso manteniendo el estado en la propia app.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye ninguna tabla de evaluación, y la búsqueda web realizada no devolvió datos de rendimiento atribuibles a este artefacto. Cualquier cifra de MMLU, HumanEval, GSM8K o similares correspondería al modelo base Qwen/Qwen3-4B y no es trasladable sin verificación empírica, ya que la cuantización mixta de 4 bits puede degradar ligeramente las métricas respecto a los pesos originales en bf16.

## Requisitos de hardware

- Huella de pesos: 2,7 GB en disco para el archivo `.litertlm` en int4 mixto. Es una medida exacta del tamaño del repositorio, no una estimación.
- Memoria en ejecución: se estima un pico de entre 3 y 4 GB de RAM o VRAM, sumando pesos, caché KV y buffers del runtime. Es una estimación, no un dato publicado.
- Cabe en GPU de consumo: sí en tarjetas con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090 y superiores) si se usa LiteRT-LM con aceleración GPU en escritorio; también en Apple Silicon con memoria unificada.
- Cabe en móvil: previsiblemente en dispositivos de gama alta con 8 GB o más de RAM y en muchos de gama media con 8 GB, dado el tamaño del archivo. No hay requisitos mínimos publicados por el autor.
- GPU de centro de datos: no son necesarias para este artefacto. A100 o H100 solo tendrían sentido para reentrenar o recuantizar el modelo base, no para servirlo en formato LiteRT-LM.
- Opciones de despliegue: LiteRT-LM (Google AI Edge) es la vía natural, con soporte para Android, iOS, macOS, Windows, Linux y web. Este repositorio no es directamente consumible por vLLM, TGI, llama.cpp, Ollama ni transformers; para esos entornos habría que partir del modelo base Qwen/Qwen3-4B y aplicar la cuantización correspondiente.
- Latencia y throughput: no disponibles. Dependen por completo del SoC, del backend elegido (CPU frente a GPU o NPU) y de la longitud de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato movil | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-litert-lm (este) | ~4.000 M | No declarado en el espejo; 32.768 nativos en el base | `.litertlm` int4 mixto | Apache-2.0 | Repositorio de comunidad, 0 descargas |
| Qwen/Qwen3-4B | ~4.000 M | 32.768 nativos, 131.072 con YaRN | safetensors (bf16) | Apache-2.0 | Repositorio oficial |
| litert-community/Qwen3-4B | ~4.000 M | No disponible | `.litertlm` | Apache-2.0 | Repositorio de la comunidad LiteRT |
| Gemma 3 4B (Google) | ~4.000 M | 128.000 tokens segun documentacion publica | GGUF y variantes moviles | Terminos de uso de Gemma | Repositorio oficial |
| Llama 3.2 3B (Meta) | ~3.000 M | 128.000 tokens segun documentacion publica | GGUF y variantes moviles | Licencia de comunidad de Llama | Repositorio oficial |

Los datos de contexto y licencia de las alternativas provienen de su documentación pública y no han sido verificados en la búsqueda web asociada a esta ficha. No se dispone de comparativas de rendimiento entre estos modelos en el material consultado.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card se limita a tres líneas y no especifica contexto, idiomas, requisitos ni métricas. Cualquier integración en producción exige validación propia.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin historial de mantenimiento más allá de una actualización el mismo día de su creación. No hay garantía de que se mantenga sincronizado con el upstream.
- Degradación por cuantización: al tratarse de int4 mixto, cabe esperar pérdida de precisión frente a los pesos bf16 del modelo base, especialmente en matemáticas, código y tareas de razonamiento largo. No hay mediciones publicadas que cuantifiquen esa pérdida.
- Riesgo de alucinación: inherente a un modelo de 4.000 millones de parámetros, agravado en dominios especializados y en generación de referencias, cifras o citas.
- Sesgos: el modelo base arrastra los sesgos de su corpus de entrenamiento. No hay evaluación de sesgos específica para este espejo.
- Contexto efectivo limitado en la práctica: aunque el modelo base soporte ventanas largas, la memoria disponible en un móvil condiciona la caché KV, por lo que la ventana real puede ser muy inferior a la teórica.
- Cobertura de idiomas no declarada: al no listarse los idiomas en el repositorio, conviene probar el castellano antes de asumir calidad suficiente, y comprobar si el tokenizador empaquetado conserva el vocabulario completo.
- Licencia permisiva pero con obligaciones: Apache-2.0 permite uso comercial y modificación, pero exige conservar el aviso de licencia y el archivo NOTICE si existe, y no concede derechos de marca sobre Qwen ni sobre Warped.
- Dependencia de un runtime concreto: el artefacto solo es utilizable con LiteRT-LM. Migrarlo a otro stack implica volver al modelo base y reconvertir.
- Formato propietario de facto: `.litertlm` no es inspeccionable con las herramientas habituales del ecosistema (transformers, llama.cpp), lo que complica la auditoría de los pesos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/warped-community/Qwen3-4B-litert-lm
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Origen del artefacto LiteRT-LM: https://huggingface.co/litert-community/Qwen3-4B
- Hilo tangencial en r/LocalLLaMA sobre pesos LiteRT-LM: https://www.reddit.com/r/LocalLLaMA/comments/1t0s4qv/gemma431bitdflash_has_been_released/

Nota sobre la búsqueda web: los resultados recuperados no guardaban relación con este modelo. Cuatro de ellos correspondían a un sitio de webcams para adultos y el quinto era un hilo de Reddit sobre un modelo distinto (Gemma-4-31B-it-DFlash) que solo menciona LiteRT-LM de pasada. No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos asociados a Qwen3-4B-litert-lm.
