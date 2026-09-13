# TokenRhythm/NeoHorse-1-4B-GGUF

## Resumen

NeoHorse-1-4B-GGUF es la distribucion en formato GGUF del modelo NeoHorse-1-4B, desarrollado por TokenRhythm. Se trata de un modelo de lenguaje causal de aproximadamente 4,2 mil millones de parametros (4.205.751.296 segun los pesos en safetensors del repositorio base), post-entrenado a partir de Qwen3.5-4B para tareas de agente, uso de herramientas (tool use), generacion de codigo y seguimiento de instrucciones. El repositorio GGUF facilita su ejecucion local mediante llama.cpp, Ollama y LM Studio, e incluye pesos en BF16 y versiones cuantizadas a 8, 5 y 4 bits.

El interes del modelo reside en el marco de post-entrenamiento que describe su informe tecnico (arXiv:2609.08183): un "routing harness" que asigna tareas a un conjunto heterogeneo de modelos, registra las interacciones con herramientas y sus resultados, estima la demanda de capacidades y utiliza esa retroalimentacion para configurar la siguiente mezcla de entrenamiento. El autor lo presenta como un prototipo inicial en la ruta hacia la mejora recursiva (recursive self-improvement, RSI), con un bucle de evaluacion-seleccion-actualizacion que todavia no se ha cerrado a lo largo de multiples iteraciones.

En cuanto a resultados, la model card reporta una media macro de 64,87 en diez benchmarks frente a 58,94 del Qwen3.5-4B original, es decir, una mejora de 5,93 puntos. El repositorio acumulaba 4.142 descargas y 9 "likes" en el momento de la consulta, con creacion el 8 de septiembre de 2026 y ultima actualizacion el 10 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal (decoder-only); detalles internos de la arquitectura no disponibles |
| Parametros totales | 4.205.751.296 (aproximadamente 4B) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (16 bits), 8 bits, 5 bits y 4 bits; los nombres exactos de los ficheros GGUF no estan detallados en la informacion disponible |
| Idiomas soportados | No disponible (la model card no los declara) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |
| Modelo base | TokenRhythm/NeoHorse-1-4B, ajustado a su vez desde Qwen/Qwen3.5-4B |
| Libreria | llama.cpp |
| Tamano del repositorio | 27,1 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La informacion disponible describe NeoHorse-1-4B como un modelo de lenguaje causal de aproximadamente 4B parametros, con pesos unicamente de texto, derivado mediante ajuste fino de Qwen3.5-4B. No se detallan en la model card el numero de capas, la dimension oculta, el tipo de atencion ni el numero de cabezas, por lo que la arquitectura interna concreta queda como no disponible. Tampoco se especifica la longitud de contexto soportada.

El entrenamiento se enmarca en lo que el autor denomina "agentic post-training framework", con dos componentes citados: SFT con curriculo guiado por enrutamiento (routing-guided curriculum SFT) y destilacion on-policy guiada por enrutamiento (routing-guided on-policy distillation). El objetivo es convertir trayectorias de ejecucion en senal de entrenamiento conservando el contexto de ejecucion y del harness alrededor de cada respuesta. El pipeline de datos incluye eliminacion de duplicados exactos y casi duplicados, descontaminacion respecto a los conjuntos de evaluacion, validacion estructural, evaluacion semantica en seis dimensiones y etiquetado a nivel de subescena con la tripla Scene/Goal/Outcome. No se indica el volumen de tokens de entrenamiento ni si se emplearon tecnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional e instrucciones multi-turno, segun el pipeline declarado de text-generation.
- Uso de herramientas y function calling: el modelo esta etiquetado explicitamente como "tool-use" y "agentic".
- Razonamiento multi-paso orientado a agentes, con soporte para harnesses de ejecucion basados en texto.
- Generacion y asistencia en codigo, con la etiqueta "coding" en el repositorio.
- Razonamiento general ("reasoning") y seguimiento de instrucciones ("instruction-following").
- Integracion con endpoints compatibles (etiqueta "endpoints_compatible").
- Capacidades multilingues: no disponibles; la model card no declara idiomas soportados.
- Vision, audio u otras modalidades: no disponibles; el modelo se describe como text-only.

## Casos de uso

- Agentes locales con tool calling: el modelo puede ejecutarse con llama.cpp u Ollama y recibir definiciones de funciones para orquestar llamadas a APIs o scripts, lo que permite montar agentes en entornos sin conexion o con requisitos de privacidad estrictos.
- Asistencia de codigo en el IDE: con 4B parametros y cuantizacion de 4 bits, es viable ejecutarlo en un portatil con GPU consumer para autocompletado, generacion de fragmentos y refactorizaciones sobre el contexto del fichero abierto.
- Generacion de pruebas en pipelines de CI/CD: el modelo puede producir tests unitarios o casos de regresion a partir de diffs, integrándose como paso automatizado en GitHub Actions o GitLab CI.
- Automatizacion de flujos multi-paso: gracias a su orientacion agentica, encaja en tareas de extraccion de datos, rellenado de formularios o navegacion asistida donde el modelo decide la siguiente accion y consume el resultado de la anterior.
- Prototipado de investigacion en RSI y evaluacion de harnesses: al formar parte de un bucle de evaluacion-seleccion-actualizacion descrito en el informe tecnico, sirve como componente base para experimentar con curriculos guiados por enrutamiento y destilacion on-policy.
- Asistentes de atencion al cliente autoalojados: al poder desplegarse en infraestructura propia bajo licencia Apache-2.0, es adecuado para entornos donde no se pueden enviar conversaciones a APIs de terceros.
- Extraccion de informacion estructurada: generacion de JSON o esquemas a partir de texto libre en procesos de ingesta documental, apoyandose en el modo de instrucciones y en el soporte de tool calling.
- Despliegue en hardware modesto o edge: las variantes de 4 y 5 bits permiten ejecutar el modelo en equipos con 8-16 GB de memoria, incluyendo mini-PC y equipos Apple Silicon.

## Benchmarks y rendimiento

La model card unicamente reporta la media macro agregada de diez benchmarks. No se ofrece el desglose por prueba en el texto disponible (la figura de evaluacion se publica como imagen, no como tabla de datos).

| Metrica | NeoHorse-1-4B | Qwen3.5-4B (modelo base) | Diferencia |
|---|---|---|---|
| Media macro en 10 benchmarks | 64,87 | 58,94 | +5,93 |
| Resultados por benchmark individual | No disponible | No disponible | No disponible |

No se han publicado en la informacion disponible resultados desglosados de MMLU, HumanEval, GSM8K u otros conjuntos concretos.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones calculadas a partir del numero de parametros (4,21B) y del tamano por peso de cada cuantizacion; no proceden de mediciones publicadas por el autor.

- BF16 (16 bits): aproximadamente 8,4 GB solo de pesos, en torno a 10-12 GB teniendo en cuenta el contexto y el overhead de runtime.
- Cuantizacion de 8 bits: aproximadamente 4,5-5 GB de pesos.
- Cuantizacion de 5 bits: aproximadamente 3-3,5 GB de pesos.
- Cuantizacion de 4 bits: aproximadamente 2,5-3 GB de pesos.
- GPU de datacenter: A100 (40 o 80 GB) y H100 son suficientes con cualquiera de las cuantizaciones, con margen amplio para lotes grandes.
- GPU consumer: cabe con holgura en RTX 4090 (24 GB) y RTX 3090; en RTX 3060 (12 GB), RTX 4060 Ti (16 GB) y RTX 4070 (12 GB) cabe en BF16 con contexto moderado y sin problema en 8, 5 o 4 bits.
- Equipos Apple Silicon: viable en configuraciones con memoria unificada de 16 GB o superior, especialmente en cuantizaciones de 4 y 5 bits.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio segun la propia model card; tambien es compatible con endpoints que acepten el formato GGUF. No se mencionan vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Nota sobre almacenamiento: el repositorio completo ocupa 27,1 GB, por lo que conviene descargar unicamente el fichero de cuantizacion necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media macro (10 benchmarks) | Licencia | Formato |
|---|---|---|---|---|---|
| NeoHorse-1-4B-GGUF | 4,21B | No disponible | 64,87 | Apache-2.0 | GGUF |
| Qwen3.5-4B (base del ajuste) | No disponible en la informacion proporcionada | No disponible | 58,94 | No disponible en la informacion proporcionada | Safetensors (no confirmado en la informacion disponible) |
| Otras alternativas de ~4B (Qwen3-4B, Llama-3.2-3B, Phi-4-mini, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion con datos en la informacion disponible es la que realiza el propio autor frente a Qwen3.5-4B. No se dispone de cifras verificables frente a otros modelos de tamano similar en el material proporcionado.

## Limitaciones y advertencias

- La model card disponible esta truncada y no detalla la longitud de contexto, los idiomas soportados, la composicion exacta del dataset de entrenamiento ni el numero de tokens utilizados.
- El unico dato de rendimiento publicado es una media macro agregada de diez benchmarks; sin el desglose por prueba no es posible verificar el comportamiento en tareas concretas como codigo, matematicas o tool calling.
- Con 4B parametros, es previsible un mayor riesgo de alucinacion en tareas de conocimiento factual y en razonamientos largos que en modelos de mayor tamano; conviene validar las salidas en produccion.
- Al ser un modelo ajustado sobre datos de trayectorias de agentes, puede heredar sesgos presentes en el modelo base y en los registros de interaccion utilizados para el post-entrenamiento.
- No se declaran idiomas soportados, por lo que el rendimiento fuera del ingles o del chino (idiomas habituales en la familia base) es incierto y deberia evaluarse antes de desplegarlo.
- La licencia del repositorio es Apache-2.0, lo que permite uso comercial, pero conviene verificar de forma independiente los terminos del modelo base Qwen3.5-4B antes de un despliegue comercial, asi como las condiciones de los datos de terceros que hayan podido intervenir.
- El modelo es text-only: no soporta entrada de imagenes ni audio.
- El autor lo describe como un prototipo inicial en la ruta hacia la mejora recursiva, no como un modelo final; debe tratarse como material experimental.
- El repositorio ocupa 27,1 GB, por lo que la descarga completa puede ser costosa en disco y ancho de banda.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/TokenRhythm/NeoHorse-1-4B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Modelo del que deriva el ajuste: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil de la organizacion en HuggingFace: https://huggingface.co/TokenRhythm
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.08183
- Repositorio en GitHub: https://github.com/TokenRhythm/NeoHorse
- Sitio de la empresa: https://tokenrhythm.ai/
- Perfil en X/Twitter: https://x.com/opensquilla
- Texto de la licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los incluidos en la model card y en los metadatos de HuggingFace.
