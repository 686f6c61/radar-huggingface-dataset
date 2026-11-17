# zephel01/DeepSeek-V4.1-Flash-1017-LDLQ-32G96G-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo de lenguaje de arquitectura MoE (mixture of experts) desarrollado por DeepSeek, con 748.494.643.824 parametros totales segun los datos de safetensors del modelo base. Esta ficha concreta corresponde a una cuantizacion GGUF publicada por el usuario zephel01 bajo licencia MIT, disenada especificamente para ejecutarse en un PC con una GPU de 32 GB de VRAM y 96 GB de RAM.

El trabajo de zephel01 no es una cuantizacion estandar: aplica una tecnica propia denominada LDLQ (error-feedback rounding con estadisticas de entrada por experto) para re-cuantizar los expertos enrutados a partir de los pesos FP4 originales, manteniendo los 384 expertos de cada capa sin poda. El resultado son dos variantes (132G y 139G) que caben en el hardware objetivo mediante offload de expertos a RAM y SSD, con velocidades reportadas de 67,5 tok/s en una RTX 5090 con el tier de RAM limitado a 60 GB.

La relevancia de esta publicacion radica en que hace accesible localmente un modelo de casi 750.000 millones de parametros en hardware de consumo, algo impensable con cuantizaciones convencionales. El autor advierte que se trata de una version BETA medida en un unico equipo, y anima a reportar resultados en otras configuraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con expertos enrutados y expertos compartidos; 384 expertos enrutados por capa; incluye tabla Engram |
| Parametros totales | 748.494.643.824 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `-c 4096`) |
| Tipos de cuantizacion | Mixta: expertos en IQ2_XXS (45%), IQ1_S (30%), IQ2_XS (14%), IQ2_S (11%) en la variante 132G; IQ2_XXS (38%), IQ1_S (29%), IQ3_XXS (19%), IQ2_S (10%), IQ2_XS (5%) en la variante 139G; denso en Q8_0; tabla Engram en Q5_K |
| Idiomas soportados | en, ja (segun tags y model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards por carpeta, con SHA256SUMS) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 384 expertos enrutados por capa, expertos compartidos, routers, embeddings y una tabla Engram adicional (shard 6, cuantizada en Q5_K) que se lee desde SSD unas pocas filas a la vez y no necesita caber en RAM. Todo excepto los expertos enrutados es byte-identico a la cuantizacion UD-IQ2_XXS de unsloth (denso en Q8_0). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

La innovacion tecnica de esta publicacion es LDLQ: re-cuantizacion de los expertos desde los pesos FP4 originales mediante error-feedback rounding usando las estadisticas de entrada propias de cada experto. Segun el autor, la re-cuantizacion simple a estos tipos daba KL 0.404 (8 secuencias), frente a 0.198 del rounding de unsloth y 0.194 de LDLQ. En la variante 139G, las cinco ultimas capas (35-39), donde los errores se acumulan, suben un escalon a IQ3_XXS. La asignacion de tipos por capas es: capas 0-4 con IQ1_S en gate/up y down; capas 5-19 con IQ1_S e IQ2_XXS; capas 20-29 con IQ2_XXS e IQ2_S; capas 30-37 con IQ2_XXS e IQ2_XS; capas 38-39 con IQ2_XS.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas (pipeline `text-generation`, tag `conversational`).
- Razonamiento y resolucion de tareas de codigo: el autor verifico respuestas correctas a una tarea de Python en llama.cpp.
- Capacidades multilingues limitadas a ingles y japones segun los tags del repositorio.
- Compatibilidad con endpoints estilo OpenAI (`endpoints_compatible`), incluyendo `/v1/chat/completions`.
- Soporte de plantillas Jinja (`--jinja` en llama.cpp).
- Ejecucion local con offload de expertos a CPU/RAM/SSD mediante motores como Abyss o llama.cpp.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling explicito ni modo thinking.

## Casos de uso

- Inferencia local de un modelo de gran escala en hardware de consumo: un PC con RTX 5090 (32 GB) y 96 GB de RAM puede ejecutar el modelo completo con todos los expertos, gracias al diseno 32G96G y al offload selectivo de expertos a RAM.
- Asistencia de programacion en local: el modelo resuelve tareas de Python y puede integrarse en flujos de desarrollo sin enviar codigo a servicios en la nube, manteniendo la confidencialidad.
- Procesamiento de texto en japones e ingles: util para equipos que trabajan con documentacion bilingue en estos idiomas, aprovechando el soporte declarado en los tags.
- Servicio de chat self-hosted: mediante el endpoint compatible con OpenAI (`/v1/chat/completions`) se puede desplegar como backend de una interfaz conversacional interna.
- Experimentacion e investigacion en cuantizacion extrema: la publicacion documenta tecnicas (LDLQ, mezcla de tipos por capas, tabla Engram en SSD) que sirven de referencia para estudiar el compromiso entre tamano, velocidad y calidad (KL).
- Despliegue en estaciones de trabajo con VRAM limitada pero gran cantidad de RAM: la variante E256 (256 de 384 expertos) del mismo autor permite configuraciones desde 12 GB de GPU con 128 GB de RAM, ampliando el rango de hardware viable.
- Evaluacion comparativa de motores de inferencia: el autor solicita reportes de rendimiento en distintas GPU, por lo que el modelo sirve como carga de trabajo de referencia para medir throughput y latencia en Abyss o llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos cuantitativos son de calidad de cuantizacion y de velocidad:

| Metrica | Valor |
|---|---|
| KL (re-cuantizacion simple, 8 secuencias) | 0,404 |
| KL (rounding de unsloth) | 0,198 |
| KL (LDLQ) | 0,194 |
| Throughput en RTX 5090 (tier RAM 60 GB, Abyss) | 67,5 tok/s |
| Throughput en RTX 5090 con llama.cpp (2 capas de expertos en GPU) | 10-11 tok/s |

## Requisitos de hardware

- VRAM: 32 GB de GPU como objetivo para el tier de expertos en GPU; el resto de expertos se sirve desde RAM y SSD.
- RAM: 96 GB en el equipo objetivo; el autor midio con el tier de RAM limitado a 60 GB (`STRATA_GLM_RAM_GB=60`).
- Almacenamiento: descarga de 275,8 GB (132G) o 283,0 GB (139G); la tabla Engram (135,2 GB) se lee desde SSD y no necesita residir en RAM.
- GPU recomendada: RTX 5090 de 32 GB (unica configuracion medida). Otras GPU no estan documentadas.
- En consumer GPU: si, en RTX 5090 con 32 GB; la variante E256 permite configuraciones desde 12 GB de GPU con 128 GB de RAM.
- Motores de despliegue: Abyss v1.3.100 o superior (recomendado, con descarga y verificacion SHA-256 integradas) y llama.cpp (arquitectura `deepseek41`, upstream `ac8e1694d` de 2026-10-29).
- En llama.cpp con `--n-cpu-moe 38` funciono; con `--n-cpu-moe 34` se agoto la VRAM en la primera peticion.
- Latencia y throughput: 67,5 tok/s con Abyss y 10-11 tok/s con llama.cpp en RTX 5090; la variante 139G pierde un 15-20% de velocidad de decodificacion frente a 132G.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 LDLQ 132G/139G (esta ficha) | 748,5 B totales | no disponible | GGUF mixto | MIT | Todos los 384 expertos; objetivo 32 GB GPU + 96 GB RAM |
| DeepSeek-V4.1-Flash-1017 E256 (zephel01) | 748,5 B totales (256/384 expertos) | no disponible | GGUF | MIT | 207,1 GB; valido para 32 GB GPU + 96 GB RAM o 12 GB GPU + 128 GB RAM |
| DeepSeek-V4.1-Flash-1017 UD-IQ2_XXS (unsloth) | 748,5 B totales | no disponible | GGUF | MIT | Referencia de calidad (KL 0,198); denso Q8_0 y Engram identicos |
| DeepSeek-V4.1-Flash-1017 UD-IQ1_M (unsloth) | 748,5 B totales | no disponible | GGUF | MIT | Mismos tipos de experto que 132G, peor rounding (KL superior) |

## Limitaciones y advertencias

- Version BETA: los resultados se midieron en un unico PC (RTX 5090, RAM limitada a 60 GB); no hay validacion en otras GPU o tamanos de RAM.
- La cuantizacion a ~1,95-2,05 bits por peso implica perdida de calidad respecto al modelo original; el propio autor reporta KL de 0,194 frente a la referencia sin cuantizar.
- Los nombres de cuantizacion del repositorio no corresponden a tipos estandar de llama.cpp: son mezclas de varios tipos, por lo que no deben tratarse como un quant homogeneo.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad factual en la informacion disponible.
- Idiomas limitados a ingles y japones segun los tags; el castellano no figura como idioma soportado.
- Longitud de contexto no especificada; el ejemplo de llama.cpp usa 4096 tokens, muy por debajo de lo habitual en modelos de esta categoria.
- Requiere hardware especifico (32 GB de VRAM y 96 GB de RAM) y almacenamiento rapido para la tabla Engram; configuraciones con menos VRAM pueden agotar memoria (`--n-cpu-moe 34` fallo en la prueba del autor).
- La licencia MIT del repositorio de cuantizacion se hereda del modelo base; conviene verificar las condiciones del modelo original de DeepSeek antes de uso comercial.
- No se documentan capacidades de tool calling, agentes, vision ni modo thinking en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-LDLQ-32G96G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Version E256 (JA256): https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-E256-IQ2_XXS-32G96G-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- trench-gguf (LDLQ): https://github.com/zephel01/trench-gguf
- Reportar resultados de benchmarks: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+DeepSeek-V4.1+LDLQ-132G+on+YOUR_GPU
