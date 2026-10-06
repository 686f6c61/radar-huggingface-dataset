# spiritfather/MiMo-V2.6-Flash-MOPD-Yamz-Uncensored-GGUF

## Resumen

MiMo-V2.6-Flash-MOPD-Yamz-Uncensored-GGUF es una cuantizacion en formato GGUF del modelo MiMo-V2.6-Flash-MOPD, un transformer de tipo mezcla de expertos (MoE) desarrollado por Xiaomi MiMo. El modelo base tiene 309 766 601 088 parametros totales (unos 309B) con aproximadamente 15B de parametros activos, 256 expertos enrutados y 8 activos por token. Esta version concreta ha sido publicada por el usuario spiritfather y combina dos transformaciones: por un lado, parte de una conversion sin perdida a GGUF del lanzamiento original (realizada por QuantaPlanta en MXFP4) y, por otro, incorpora la edicion de "abliteracion" (eliminacion de la direccion de rechazo) desarrollada por yamz-labs.

La relevancia de este repositorio radica en que la edicion de yamz-labs se aplica en origen en tiempo de ejecucion mediante su motor propio Kyojin sobre un paquete EXL3; los runtimes convencionales (ExLlamaV3, TabbyAPI, llama.cpp, LM Studio, Ollama) ignoran esa edicion y sirven el modelo base con sus rechazos intactos. Este repositorio "cuece" la misma modificacion directamente en los pesos, de modo que funciona en cualquier runtime basado en llama.cpp (Apple Silicon, CUDA o CPU) sin motor ni flag especiales. El resultado declarado es una reduccion de los rechazos de 97/100 a 3/100 sobre un conjunto de 100 prompts daninos reservados.

El modelo se distribuye bajo licencia MIT, esta pensado para generacion de texto y escritura creativa, y el unico quant publicado hasta la fecha es Q4_K_M, con 176,5 GiB de tamano y una degradacion declarada de +0,88 % en perplejidad respecto al modelo original sin editar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), con capas de prediccion multi-token (MTP); modelo base nativamente omniomodal (vision-lenguaje-audio) |
| Parametros totales | 309 766 601 088 (~309B) |
| Parametros activos | ~15B por token |
| Longitud de contexto | No disponible (el modelo base esta etiquetado como long-context; el ejemplo de carga de este repo usa 32 768 tokens) |
| Tipos de cuantizacion | Q4_K_M (unico publicado); expertos enrutados en Q4_K; tensores no experto (atencion, FFN densa y MTP, proyeccion `nextn.eh_proj`, embeddings y cabeza de salida) fijados a Q8_0; router, normas y attention sinks en F32; sin imatrix |
| Idiomas soportados | No disponible en esta ficha (el modelo base declara ingles y chino en HuggingFace) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con 256 expertos enrutados y 8 activos por token, lo que da un total de unos 309B de parametros con solo ~15B activos, una configuracion orientada a mantener capacidad de modelo grande con coste de inferencia de modelo mediano. Incorpora capas de prediccion multi-token (MTP), senaladas en la receta de edicion como `nextn.eh_proj`. El lanzamiento original de Xiaomi MiMo es nativamente omniomodal (vision, lenguaje y audio) y se distribuye con precision FP8; los expertos enrutados del modelo se publican de forma nativa en MXFP4.

El proceso de construccion de este GGUF tiene tres pasos documentados. Primero, se parte de la conversion sin perdida de QuantaPlanta (atencion y capas densas en bf16, expertos enrutados en MXFP4). Segundo, se aplica la edicion de yamz-labs en su forma equivalente sobre pesos, `W ← W − w(L)·r̂ r̂ᵀ W`, sobre los tensores que escriben en el flujo residual: `attn_output` (capas 11-47) y la salida MLP/MoE (`ffn_down` en la capa densa 0 y `ffn_down_exps` enrutados en las capas 1-46), con las intensidades por capa definidas por yamz-labs. Las capas MTP, el router, los expertos gate/up, las normas y los embeddings quedan sin tocar. El calculo se hace en float32 y los tensores editados se escriben en BF16 en un GGUF maestro (~320 GB), verificando el encogimiento esperado del componente de direccion (por ejemplo, capa 20 expertos 0,222x frente a 0,221x esperado). Un detalle tecnico importante: los expertos editados no se recodifican a MXFP4, porque eso borraba alrededor del 80 % de la edicion en expertos y hacia que el modelo rechazase 74/100 prompts. Tercero, se cuantiza cada tamano con `llama-quantize`, fijando todos los tensores no experto a Q8_0.

No se dispone, en la informacion proporcionada, del numero de tokens de entrenamiento, la composicion del dataset ni el detalle de las fases de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto conversacional y escritura creativa, que es el enfoque declarado del repositorio (etiquetas `creative-writing` y `conversational`).
- Modo de razonamiento ("thinking") activado por defecto en la plantilla de chat de MiMo; se puede desactivar por peticion con `chat_template_kwargs: {"enable_thinking": false}`.
- Soporte de plantilla Jinja (`--jinja`), lo que habilita el uso de plantillas de chat y de herramientas en runtimes compatibles.
- Capacidad MoE con 256 expertos y 8 activos, pensada para eficiencia de inferencia frente a un modelo denso del mismo tamano total.
- Prediccion multi-token (MTP) presente en la arquitectura base.
- El modelo base declara capacidades multimodales (vision-lenguaje-audio), agentes, comprension de video y contexto largo; no se especifica en esta ficha si esas capacidades se conservan en la conversion GGUF.
- Perfil "uncensored"/abliterated: la edicion reduce rechazos y sobrerrechazos, segun la tabla del autor.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo esta especificamente evaluado en un benchmark de escritura creativa (CaliperBench) que puntua calidad de prosa y roleplay, por lo que encaja en generacion de ficcion, dialogos y continuaciones narrativas con temperatura 1,0 y top-p 0,95.
- Roleplay y personajes: la reduccion de rechazos (3/100 sobre prompts daninos reservados) y de sobrerrechazos lo hace util en escenarios de personajes que exigen respuestas sin evasivas, sin que ello constituya una garantia de seguridad.
- Prototipado local en Apple Silicon: con Q4_K_M (176,5 GiB) cabe en una maquina con 256 GB de memoria unificada dejando espacio para contexto, lo que permite ejecutar un MoE de 309B en hardware de estacion de trabajo.
- Despliegue en cualquier runtime basado en llama.cpp: al estar la edicion integrada en los pesos, funciona en llama.cpp, LM Studio, Ollama o servidores compatibles sin motor externo, simplificando pipelines de generacion de texto.
- Investigacion sobre alineacion y abliteracion: el repositorio documenta el efecto medido de una edicion de direccion de rechazo sobre pesos cuantizados, con tablas de rechazos, PPL y KLD, lo que lo convierte en material de referencia para estudiar el coste de este tipo de intervenciones.
- Evaluacion de calidad de cuantizacion: incluye mediciones de KLD y de coincidencia de top-token frente al modelo original, utile para decidir el compromiso entre tamano, memoria y fidelidad antes de desplegar.
- Generacion de texto por lotes en servidor: mediante `llama-server` con `-ngl 99 -fa on -c 32768 -ctk q8_0 -ctv q8_0 --jinja`, se puede exponer como API de generacion para tareas de redaccion o sintesis a gran escala.

## Benchmarks y rendimiento

Tabla de rechazos (100 prompts daninos reservados, `harmful_behaviors`, thinking activado, decodificacion greedy, limite de 1024 tokens, clasificador de rechazo de CaliperBench):

| Modelo | Rechazos | Notas |
|---|---|---|
| MiMo-V2.6-Flash-MOPD original (QuantaPlanta MXFP4) | 97 / 100 | |
| Edicion solo en atencion (expertos sin tocar) | 74 / 100 | resultado si se pierde la mitad de expertos de la edicion |
| Este repositorio, Q4_K_M | 3 / 100 | 0 respuestas vacias o truncadas |
| yamz-labs EXL3 + runtime Kyojin | 4 / 100 | su propio conjunto de prompts y detector; no comparable directamente |

Tabla de calidad de cuantizacion (KLD, PPL y coincidencia de top-token medidos frente al modelo original sin editar, en `wiki.test.raw`, 100 fragmentos a contexto 512 con `llama-perplexity --kl-divergence`):

| Quant | Tamano | Mezcla | PPL | vs original | KLD vs original | Mismo top token |
|---|---|---|---|---|---|---|
| Q4_K_M | 176,5 GiB | Q8_0 / Q4_K / Q4_K / Q4_K+Q6_K | 5,1724 ± 0,0724 | +0,88 % | 0,0243 ± 0,0003 | 93,26 % |
| original (referencia) | 162,9 GiB | BF16 / MXFP4 / MXFP4 / MXFP4 | 5,1275 ± 0,0714 | 0 | 0 | 100 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el quant Q4_K_M ocupa 176,5 GiB de pesos; hay que anadir la cache KV (en el ejemplo se usa contexto de 32768 con claves y valores en q8_0). En la practica, se necesitan aproximadamente 180-200 GB de memoria total.
- GPU recomendadas: no cabe en una sola GPU de consumo ni en una sola A100/H100 de 80 GB. Requiere configuraciones multi-GPU, como 4x H100 80 GB (320 GB) o 2x H200 de 141 GB (282 GB), o servidores con memoria unificada grande.
- Consumer GPU: no es viable en una unica GPU de consumo; solo planteable con offload parcial a CPU y RAM, a costa de latencia muy alta.
- Apple Silicon: el autor indica que Q4_K_M cabe en una maquina con 256 GB de memoria unificada dejando espacio para contexto.
- Opciones de despliegue: llama.cpp (rama master), `llama-server`, y cualquier runtime basado en llama.cpp como LM Studio u Ollama. La edicion esta integrada en los pesos, por lo que no requiere el motor Kyojin ni flags especiales.
- Comando de carga de referencia: `llama-server -m MiMo-V2.6-Flash-MOPD-Yamz-Uncensored.Q4_K_M.gguf -ngl 99 -fa on -c 32768 -ctk q8_0 -ctv q8_0 --jinja`.
- Muestreo recomendado por yamz-labs y Xiaomi: temperatura 1,0 y top-p 0,95; no se recomienda decodificacion greedy.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Edicion de rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (spiritfather, Q4_K_M) | 309B totales / ~15B activos | GGUF | Si, integrada en pesos (3/100 rechazos) | MIT | HuggingFace, llama.cpp |
| MiMo-V2.6-Flash-MOPD original (QuantaPlanta MXFP4) | 309B totales / ~15B activos | GGUF (MXFP4 lossless) | No (97/100 rechazos) | MIT | HuggingFace |
| yamz-labs/MiMo-V2.6-Flash-MOPD-EXL3-Yamz-Uncensored | 309B totales / ~15B activos | EXL3 | Si, en tiempo de ejecucion (Kyojin, 4/100) | No disponible en la informacion proporcionada | HuggingFace, requiere motor Kyojin |
| XiaomiMiMo/MiMo-V2.6-Flash-MOPD (modelo base) | 309B totales / ~15B activos | safetensors, FP8 | No | MIT | HuggingFace |

No se dispone de resultados de benchmarks de inteligencia general (MMLU, HumanEval, GSM8K) para este modelo en la informacion proporcionada; las unicas metricas publicadas son de rechazos y de calidad de cuantizacion.

## Limitaciones y advertencias

- La edicion de ablacion es una unica direccion global: reduce rechazos y sobrerrechazos a la vez, pero no es una evaluacion de seguridad y no dice nada sobre lo que el modelo producira o dejara de producir.
- Riesgo de alucinacion: no se han publicado mediciones especificas de veracidad o alucinacion para este modelo en la informacion disponible.
- Sesgos: no se han documentado evaluaciones de sesgo en la informacion proporcionada.
- Idiomas: el repositorio no declara idiomas soportados; el modelo base declara ingles y chino, por lo que el rendimiento en castellano no esta verificado.
- Contexto: la longitud de contexto real del modelo no esta confirmada en esta ficha; el valor de 32768 tokens del ejemplo de carga es una eleccion de ejecucion, no una especificacion oficial.
- Licencia MIT: permite uso comercial, pero el usuario debe asumir la responsabilidad legal y etica del contenido generado por un modelo con los rechazos reducidos.
- Coste de memoria muy alto: 176,5 GiB solo en pesos para el unico quant disponible, fuera del alcance de hardware de consumo de una sola GPU.
- Degradacion por cuantizacion y edicion combinadas: +0,88 % de PPL y KLD de 0,0243 frente al original, con 93,26 % de coincidencia de top-token; valores aceptables pero no nulos.
- Trazabilidad limitada: 0 descargas y 0 "likes" en el momento de la consulta, fecha de creacion 2026-10-05; conviene verificar la integridad y procedencia antes de usarlo en produccion.
- No se especifica si las capacidades omniomodales (vision, audio) del modelo base se conservan tras la conversion a GGUF.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/spiritfather/MiMo-V2.6-Flash-MOPD-Yamz-Uncensored-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-MOPD
- Fuente GGUF (QuantaPlanta, MXFP4): https://huggingface.co/QuantaPlanta/MiMo-V2.6-Flash-MOPD-MXFP4-GGUF
- Version abliterated de yamz-labs (EXL3): https://huggingface.co/yamz-labs/MiMo-V2.6-Flash-MOPD-EXL3-Yamz-Uncensored
- Yamz EXL3 (variante): https://huggingface.co/yamz-labs/MiMo-V2.6-Flash-MOPD-EXL3-Yamz
- Presets de yamz-labs en GitHub: https://github.com/Yamz-Labs/yamz-presets/tree/main/mimo-v2.6-flash
- Pagina oficial de la serie MiMo-V2.6: https://mimo.xiaomi.com/mimo-v2-6
- Pagina del modelo MiMo-V2.6-Flash: https://mimo.mi.com/models/en-US/mimo-v2.6-flash
- llama.cpp: https://github.com/ggml-org/llama.cpp
- CaliperBench: https://caliperbench.com
- Discord del autor: https://discord.gg/rhE9zdKyE4
