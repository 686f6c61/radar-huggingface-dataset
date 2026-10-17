# VicTeamAgency/Qwen3.8-27B-Uncensored-GGUF

## Resumen

VicTeamAgency/Qwen3.8-27B-Uncensored-GGUF es una redistribucion en formato GGUF del modelo comunitario Qwen3.8-27B-Uncensored, construido a partir del modelo base Qwen/Qwen3.8-27B de Alibaba Qwen. Se trata de una version "abliterated", es decir, con el comportamiento de rechazo (refusals) eliminado mediante tecnicas de ablacion aplicadas a nivel de pesos por la comunidad huihui-ai, y posteriormente exportada a GGUF. El repositorio lo publica VicTeamAgency y solo incorpora dos ficheros de cuantizacion, ademas de cambios en metadatos y nombre segun su propia model card.

El modelo tiene 27 000 millones de parametros y hereda del modelo base una ventana de contexto nativa de 262 144 tokens, segun fuentes secundarias. Su interes practico es que permite ejecutar un modelo de este tamano y contexto en una sola GPU de consumo gracias a las cuantizaciones de 4 bits incluidas: Q4_K_XL (~17,4 GB) e IQ4_XS (~14,4 GB). Esta pensado explicitamente, segun su autor, para desarrollo agentico local.

La relevancia del repositorio es limitada y hay que ser honesto al respecto: acumula 0 descargas y 0 "likes" en el momento de la consulta, no publica resultados de benchmarks, no detalla composicion de datos ni proceso de entrenamiento, y la propia model card indica que los cambios introducidos respecto al build abliterated original se limitan a metadatos y nombre. Es, por tanto, un reempaquetado, no un fine-tuning original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivado del modelo base Qwen/Qwen3.8-27B; la informacion disponible no detalla la arquitectura interna) |
| Parametros totales | 27 000 millones (27B), segun el nombre del modelo y fuentes secundarias |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262 144 tokens, segun fuentes secundarias (heredada del modelo base) |
| Tipos de cuantizacion | Q4_K_XL (~17,4 GB) e IQ4_XS (~14,4 GB); cuantizacion dinamica realizada con herramientas de Unsloth |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF unicamente |
| Modelo base | Qwen/Qwen3.8-27B (Alibaba Qwen) |
| Repositorio de origen | Build abliterated de la comunidad huihui-ai (Apache 2.0); existe tambien una version FP8 del mismo build |
| Fecha de publicacion | 16 de octubre de 2026 |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion tecnica en la documentacion proporcionada sobre la arquitectura del modelo base Qwen3.8-27B: no se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni el numero de capas, dimensiones ocultas, cabezas de atencion o tipo de atencion (completa, lineal o mixta). Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Estos datos deberian consultarse en la model card oficial de Qwen/Qwen3.8-27B, que no forma parte de la informacion suministrada.

Lo unico verificable es el proceso de post-procesado, descrito de forma muy breve en la model card. El comportamiento de rechazo se elimina mediante "abliteration", una tecnica de ablacion direccional sobre los pesos que borra la direccion de activacion asociada al rechazo, aplicada por la comunidad huihui-ai sobre el modelo base. Sobre ese build abliterated se aplica una cuantizacion dinamica con las herramientas de Unsloth, que produce los dos ficheros GGUF publicados. Los cambios declarados por VicTeamAgency respecto al build original se limitan a los metadatos y al nombre del modelo. No se documenta ningun entrenamiento adicional, destilado ni ajuste fino por parte de este publicador.

## Capacidades

- Generacion de texto y conversacion multi-turno, con la ventana de contexto larga heredada del modelo base (262 144 tokens segun fuentes secundarias).
- Razonamiento y resolucion de problemas de proposito general, en el nivel que ofrezca el modelo base (sin datos de benchmarks publicados en este repositorio).
- Escritura de codigo y asistencia en tareas de programacion, presumiblemente al nivel del modelo base, aunque no se aportan evaluaciones que lo confirmen.
- Comportamiento sin rechazos: el proceso de abliteration elimina las negativas del modelo ante peticiones que el modelo original declinaria. Esto es una caracteristica declarada, no una capacidad adicional medida.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible. La model card recomienda lanzarlo con `llama-server --jinja`, lo que sugiere que se pretende usar la plantilla de chat nativa con soporte de herramientas, pero no se documenta explicitamente.
- Uso agentico y razonamiento multi-paso: el autor lo posiciona como modelo "para desarrollo agentico en una sola tarjeta grafica", pero no se detallan capacidades concretas de planificacion, uso de herramientas o memoria persistente.
- Capacidades multilingues: no disponibles. No se declara lista de idiomas soportados.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Desarrollo agentico en una sola GPU: es el caso de uso que declara el propio autor. Con la cuantizacion IQ4_XS (~14,4 GB) el modelo entra completo en una GPU de 16 GB, lo que permite mantener un agente con contexto largo sin depender de servicios en la nube.
- Analisis de documentos extensos en local: la ventana de 262 144 tokens permitiria procesar libros tecnicos, expedientes o bases de codigo completas en una unica pasada, util cuando los datos no pueden salir de la maquina por motivos de confidencialidad.
- Asistencia a la programacion sin conexion: integrable en editores o terminales mediante `llama-server` o `llama-swap`, util en entornos aislados (redes air-gapped, equipos sin acceso a APIs externas).
- Generacion de datos sinteticos y aumento de datasets: al no rechazar peticiones, resulta practico para generar corpus de entrenamiento o evaluacion en dominios donde un modelo alineado se negaria a producir contenido, siempre que el uso cumpla la legalidad aplicable.
- Investigacion en seguridad y red teaming: es un modelo util para estudiar el efecto de la abliteration sobre el comportamiento del modelo, comparar tasas de rechazo frente al base y analizar que capacidades se degradan con la ablacion.
- Escritura creativa y narrativa sin restricciones tematicas: ficcion con violencia, temas sensibles o dialogos adultos donde los filtros de los modelos alineados suelen interrumpir la generacion.
- Procesamiento de texto en dominios regulados o delicados (legal, medico, seguridad): entornos internos donde un rechazo inesperado rompe el flujo de trabajo y el contenido esta amparado por un marco de confidencialidad profesional.
- Prototipado rapido de asistentes conversacionales: al ser un GGUF de 4 bits, permite levantar un servidor de chat local en minutos con llama.cpp u Ollama antes de decidir si se migra a un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, ni tampoco comparaciones medidas contra el modelo base o contra el build abliterated original. Tampoco se aportan datos de latencia o throughput. Cualquier cifra que se cite sobre este modelo deberia proceder de una evaluacion propia, dado que no existe evidencia publicada por el autor.

| Benchmark | VicTeamAgency/Qwen3.8-27B-Uncensored-GGUF | Modelo base Qwen3.8-27B |
|---|---|---|
| MMLU | No disponible | No disponible |
| HumanEval | No disponible | No disponible |
| GSM8K | No disponible | No disponible |
| Otros | No disponible | No disponible |

## Requisitos de hardware

- IQ4_XS (~14,4 GB): es la cuantizacion que el autor recomienda para "entrar completa en 16 GB de VRAM". Cabe en RTX 4060 Ti 16 GB, RTX 4080 16 GB, RTX 5070 Ti 16 GB y equivalentes. El margen es de aproximadamente 1,6 GB para cache KV y overhead, por lo que con contextos muy largos habra que reducir la ventana efectiva o descargar capas a CPU.
- Q4_K_XL (~17,4 GB): no cabe en 16 GB. Requiere GPU de 24 GB (RTX 3090, RTX 4090) o reparto entre GPU y CPU (`--n-gpu-layers` parcial), con la consiguiente perdida de velocidad.
- Cache KV: no disponible con precision. Al usar una ventana de hasta 262 144 tokens, el consumo de cache KV puede ser muy elevado y en la practica suele ser el factor limitante antes que el peso del modelo. Se recomienda usar cuantizacion de cache KV en llama.cpp (`--cache-type-k` / `--cache-type-v`) si se necesita contexto largo.
- GPU profesionales: A100 40 GB, A100 80 GB o H100 permiten cargar el modelo en Q4_K_XL con contexto amplio sin problemas de margen. Para FP16 harian falta aproximadamente 54 GB solo de pesos, por lo que se necesitan varias GPU o una H100 80 GB.
- Despliegue: llama.cpp mediante `llama-server --jinja`, que es la ruta recomendada por el autor; llama-swap para gestionar varios modelos; Ollama y LM Studio como alternativas de conveniencia sobre el mismo runtime GGUF. vLLM ofrece soporte parcial de GGUF, pero con menor madurez que llama.cpp para este formato.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en el repositorio ni en las fuentes consultadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| VicTeamAgency/Qwen3.8-27B-Uncensored-GGUF | 27B | 262 144 tokens (fuente secundaria) | GGUF (Q4_K_XL, IQ4_XS) | Apache 2.0 | 0 descargas, 0 likes |
| JonathanColetti/Qwen3.8-27B-Uncensored-GGUF | 27B (mismo origen) | No disponible | GGUF | No disponible | Repositorio alternativo del mismo build abliterated |
| Qwen3.8-27B-Uncensored-FP8 | 27B (mismo origen) | 262 144 tokens (fuente secundaria) | FP8 | Apache 2.0 | Build abliterated del que deriva esta exportacion GGUF |
| Qwen/Qwen3.8-27B (base) | 27B | No disponible | Safetensors (previsible) | Apache 2.0 | Modelo original de Alibaba Qwen |

Las diferencias entre los tres primeros son de empaquetado, no de capacidades: mismo modelo base, mismo proceso de abliteration y distinto formato o publicador. No hay datos de rendimiento que permitan ordenarlos por calidad. En cuanto a popularidad agregada, una pagina de terceros (local-ai-zone) cifra el modelo en torno a 2 395 758 descargas y 970 likes para una publicacion de "Qwen3.8 27b Uncensored GGUF" de 30,1 GB, pero esa cifra no corresponde al repositorio de VicTeamAgency, que registra 0 descargas, por lo que no debe atribuirse a esta ficha.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el repositorio no publica benchmarks, comparativas ni pruebas de calidad. No hay evidencia de que el modelo funcione correctamente en tareas concretas.
- Degradacion por abliteration: la ablacion de la direccion de rechazo suele afectar a la coherencia en dominios sensibles y puede reducir el rendimiento en tareas de razonamiento o de seguimiento de instrucciones de seguridad. No se han medido estas perdidas.
- Sin guardarrailes de seguridad: el modelo no rechaza peticiones potencialmente daninas. El despliegue en produccion de cara al publico exige filtros externos propios y una evaluacion de cumplimiento normativo (Reglamento europeo de IA, DSA y normativa sectorial aplicable).
- Riesgo de alucinacion: no se ha caracterizado. Como cualquier modelo de 27B cuantizado a 4 bits, la cuantizacion anade un error adicional respecto a los pesos originales, especialmente perceptible en tareas de matematicas y codigo.
- Idiomas: no se declara soporte multilingue. Se desconoce el comportamiento real en castellano y en otras lenguas distintas del ingles o del chino.
- Contexto largo en la practica: aunque se anuncien 262 144 tokens, la cache KV necesaria puede exceder la VRAM disponible en GPUs de consumo, de modo que la ventana util sera mucho menor salvo que se apliquen tecnicas de compresion de cache.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion. Es una licencia permisiva, pero no exime del cumplimiento de la legislacion aplicable al contenido generado ni de los terminos de uso del modelo base.
- Trazabilidad: la model card indica que los cambios respecto al build original son solo metadatos y nombre. Conviene verificar que los ficheros publicados corresponden realmente al build abliterated declarado y no incorporan modificaciones adicionales no documentadas.
- Adopcion nula: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad. No hay informes de terceros sobre su comportamiento real.
- Fecha de publicacion posterior a la de la mayoria de referencias del ecosistema, lo que dificulta contrastar la informacion con documentacion consolidada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/VicTeamAgency/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio alternativo del mismo build: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
- Guia de ejecucion (The Geek Insights): https://thegeekinsights.com/run-uncensored-qwen-3-8-27b/
- Guia de cuantizaciones y llama.cpp (OrcaRouter): https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Ficha en agregador de terceros (local-ai-zone): https://local-ai-zone.github.io/models/qwen3-8-27b-uncensored.html
- Analisis de riesgos legales y eticos (nachoconesa): https://nachoconesa.com/blog/qwen3-27b-uncensored-local?lang=en
