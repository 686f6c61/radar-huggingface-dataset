# zhuomingliu/MaLoW-Qwen3.5-9B

## Resumen

MaLoW-Qwen3.5-9B es un checkpoint de inferencia publicado por el usuario zhuomingliu (repositorio GitHub previsto: dragonlzm/MaLoW) asociado al trabajo "Memory as Weights: Internalizing Long-Term History for Streaming Videos". No es un modelo de lenguaje independiente, sino un conjunto de modulos de inferencia (etiquetados como `adapter` y `memory-as-weights`) que se cargan sobre el modelo base Qwen/Qwen3.5-9B, que debe descargarse por separado. El problema que aborda es la comprension de video en streaming con memoria de largo plazo: internalizar el historial visual prolongado en los pesos del modelo en lugar de mantenerlo como contexto explícito.

El repositorio contiene 308.957.760 parametros en formato safetensors (aproximadamente 309 millones), con un tamano total de 1,3 GB, muy por debajo de los 9B que sugiere el sufijo del nombre, lo que confirma que se trata de un modulo adicional y no de una copia completa del modelo base. La licencia declarada es Apache-2.0 tanto para los pesos como para los metadatos de inferencia.

Su relevancia actual es principalmente de investigacion: los resultados de referencia declarados en la model card (64,64 de media en OVO-Bench y 73,13 de media en StreamingBench) situan el sistema en el ambito de la comprension de video en tiempo real, pero la evaluacion no puede reproducirse todavia porque el codigo de MaLoW no se ha publicado y el autor indica que el runtime es necesario para cargar el checkpoint. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modulo de inferencia tipo adapter con esquema "memory-as-weights"; la arquitectura interna no se detalla en la informacion proporcionada) |
| Parametros totales | 308.957.760 (dato real de los ficheros safetensors del repositorio) |
| Parametros activos | no aplica (no se ha documentado una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en safetensors; no se listan variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con metadatos JSON de configuracion de inferencia en el repositorio) |
| Modelo base | Qwen/Qwen3.5-9B (se descarga por separado; no esta incluido) |
| Tipo de artefacto | checkpoint de inferencia / adapter, no modelo autonomo |
| Tamano del repositorio | 1,3 GB |
| Fecha de creacion | 2026-10-02 |
| Ultima actualizacion | 2026-10-02 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modulo (no se especifica si es un adaptador tipo LoRA, un modulo de memoria recurrente, un cross-attention adicional ni como se acopla al transformer base). Lo unico documentado es su proposito: "Memory as Weights: Internalizing Long-Term History for Streaming Videos", es decir, comprimir el historial de un flujo de video en los propios pesos del modelo en lugar de en una ventana de contexto creciente. El repositorio se etiqueta explicitamente como `adapter` y `memory-as-weights`, y su uso esta ligado al modelo base Qwen/Qwen3.5-9B, cuyas especificaciones (tamano, contexto, datos de entrenamiento) no se detallan en la informacion proporcionada.

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron etapas de RLHF, DPO u otras tecnicas de alineacion. El autor indica que la evaluacion requiere la publicacion del codigo de MaLoW, que estaba preparado en local pero pendiente de publicacion publica en GitHub; la documentacion de evaluacion prevista es `docs/video_evaluation.md` dentro de ese codigo. La model card advierte que los resultados de referencia mostrados no son una evaluacion nueva de esta exportacion concreta, sino cifras reportadas del trabajo.

## Capacidades

- Comprension de video en streaming: el checkpoint esta disenado para procesar flujos de video continuos, segun los benchmarks declarados (OVO-Bench y StreamingBench).
- Memoria de largo plazo internalizada: el mecanismo "memory-as-weights" pretende retener historia visual prolongada sin depender de un contexto explicito extenso.
- Razonamiento retrospectivo (backward), en tiempo real (real-time) y prospectivo (forward) sobre video: son las tres categorias evaluadas en OVO-Bench, con 66,29 / 76,16 / 51,48 respectivamente.
- Tareas evaluadas en StreamingBench: tiempo real (82,16), omni (62,06), proactive (58,8) y SQA (63,6).
- Capacidades del modelo base: heredadas de Qwen/Qwen3.5-9B, pero no documentadas en la informacion proporcionada (no se confirma generacion de texto, codigo, matematicas, tool calling ni agentes).
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingues: no disponible.
- Modo "thinking" u otras capacidades especiales: no disponible.
- Vision: el sistema opera sobre benchmarks de video, pero no se detalla si el modulo incluye su propio encoder visual ni como se combina con el base.

## Casos de uso

- Investigacion en comprension de video en streaming: reproduccion de los resultados declarados en OVO-Bench y StreamingBench siguiendo `docs/video_evaluation.md` del codigo de MaLoW, para comparar el enfoque "memory-as-weights" con alternativas basadas en ventanas de contexto largas.
- Analisis retrospectivo de grabaciones extensas: consultas "backward" sobre material ya almacenado (por ejemplo, resumen de lo ocurrido en un turno de vigilancia), aprovechando la rama forward/backward evaluada en OVO-Bench.
- Monitorizacion en tiempo real de camaras: uso de la rama real-time (76,16 en OVO-Bench) para tareas de deteccion de eventos mientras el video se esta reproduciendo, siempre que se disponga del runtime MaLoW.
- Asistencia en retransmisiones o eventos largos: mantener un historial de lo sucedido durante una emision prolongada sin truncar el contexto, apoyandose en la memoria internalizada.
- Descripcion y accesibilidad de video en directo: generacion de narraciones continuas para personas con discapacidad visual, con seguimiento del hilo de lo ocurrido minutos atras.
- Moderacion de contenido en plataformas de video en directo: analisis continuo con memoria de eventos previos para reducir falsos positivos derivados de la falta de contexto (requiere validacion propia, no hay datos de sesgo ni de precision en moderacion).
- Robotica y agentes embodied con historial visual: integracion del checkpoint en un agente que necesite recordar observaciones visuales pasadas durante una sesion larga.
- Analisis interactivo de tutoriales o procedimientos tecnicos: responder preguntas sobre un video de formacion en curso, combinando preguntas del tipo SQA (63,6 en StreamingBench) con el estado temporal de la reproduccion.

En todos los casos, el uso en produccion esta condicionado a la publicacion del runtime MaLoW y a la descarga e integracion del modelo base Qwen/Qwen3.5-9B, por lo que hoy son escenarios de investigacion mas que despliegues directos.

## Benchmarks y rendimiento

Resultados de referencia declarados en la model card. El propio autor advierte que no proceden de una evaluacion nueva de esta exportacion.

| Benchmark | Categoria | Resultado (%) |
|---|---|---|
| OVO-Bench | Backward | 66,29 |
| OVO-Bench | Real-time | 76,16 |
| OVO-Bench | Forward | 51,48 |
| OVO-Bench | Media | 64,64 |
| StreamingBench | Media | 73,13 |
| StreamingBench | Real-time | 82,16 |
| StreamingBench | Omni | 62,06 |
| StreamingBench | Proactive | 58,8 |
| StreamingBench | SQA | 63,6 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de texto, ni comparaciones numericas frente a otros modelos de video en streaming.

## Requisitos de hardware

- Peso del modulo MaLoW: 308.957.760 parametros, aproximadamente 0,62 GB en bf16/fp16 y 1,24 GB en fp32 (calculo derivado del numero de parametros; el repositorio ocupa 1,3 GB).
- Modelo base Qwen/Qwen3.5-9B (necesario, se descarga aparte): estimacion orientativa de unos 18 GB en bf16, unos 9 GB en cuantizacion de 8 bits y unos 5-6 GB en 4 bits para un modelo de ~9B parametros. Estas cifras son estimaciones generales, no datos publicados de este modelo concreto.
- VRAM total estimada: la del modelo base mas el margen del modulo y del pipeline de video (activaciones y frames en memoria), que no se documenta en la informacion proporcionada.
- GPU recomendadas: no disponible. Dado el orden de magnitud del base (~9B), serian razonables tarjetas de 24 GB o superiores (RTX 4090, L40S, A100 40/80 GB, H100), pero no hay confirmacion del autor.
- Compatibilidad con GPU de consumo: probable en cuantizacion reducida y si el runtime lo permite, pero no confirmado; el repo no publica variantes GGUF ni cuantizadas.
- Opciones de despliegue: el checkpoint requiere el runtime de MaLoW (no publicado publicamente en el momento de la consulta). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el formato safetensors con modulos de inferencia no es directamente cargable por un `transformers` estandar sin el codigo especifico.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada: no hay resultados de otros modelos en OVO-Bench ni StreamingBench dentro del material consultado, y no se documentan las especificaciones del propio modelo base. La unica referencia verificable es la relacion con su base:

| Modelo | Parametros | Contexto | OVO-Bench (media) | StreamingBench (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MaLoW-Qwen3.5-9B (este checkpoint) | 308.957.760 (modulo) | no disponible | 64,64 | 73,13 | Apache-2.0 | Pesos publicados; runtime pendiente |
| Qwen/Qwen3.5-9B (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible | Referenciado como dependencia obligatoria |
| Otros modelos de video en streaming | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar Qwen/Qwen3.5-9B por separado y cargar el checkpoint a traves del runtime MaLoW.
- El codigo de MaLoW no esta publicado publicamente ("public GitHub publication is pending"), por lo que la evaluacion y el uso en produccion no son reproducibles hoy.
- Los numeros de benchmarks son resultados de referencia del trabajo, no una evaluacion nueva de esta exportacion; el propio autor lo advierte de forma explicita.
- No hay informacion sobre sesgos, tasas de alucinacion, comportamiento fuera de dominio ni robustez ante videos adversos.
- No se documentan los idiomas soportados; el comportamiento multilingue es desconocido.
- No se documenta la longitud de contexto ni como se gestiona la memoria cuando el flujo de video excede la capacidad del mecanismo.
- Licencia Apache-2.0 para pesos y metadatos, pero los modelos base y los activos de los benchmarks conservan sus terminos originales (avisos `LICENSE` y `NOTICE`); conviene revisar la licencia de Qwen/Qwen3.5-9B antes de un uso comercial.
- Repositorio sin adopcion (0 descargas, 0 likes) y con fecha de publicacion muy reciente: no hay validacion independiente de terceros.
- La designacion "9B" del nombre corresponde al modelo base, no al tamano de los pesos publicados (309M), lo que puede inducir a error al planificar recursos.
- No se dispone de informacion sobre cuantizacion, por lo que no puede confirmarse su viabilidad en hardware limitado.
- Los resultados de busqueda web consultados no aportaron informacion tecnica relevante sobre el modelo; la ficha se basa unicamente en los datos del repositorio de HuggingFace y su model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zhuomingliu/MaLoW-Qwen3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio GitHub previsto (pendiente de publicacion): https://github.com/dragonlzm/MaLoW
- Paper, blog o demo: no disponible en la informacion proporcionada
