# vcruz305/GLM-5.3-EXL3-3.38bpw-h8

## Resumen

GLM-5.3-EXL3-3.38bpw-h8 es una cuantizacion EXL3 del modelo zai-org/GLM-5.3, publicada por el usuario vcruz305. Se trata de un empaquetado de pesos de 159.500 millones de parametros totales (319,1 GB en 58 shards) que conserva integramente los 19.200 expertos enrutados del modelo original (256 por capa, 8 activos) sin poda ni fusion de expertos, con una tasa media de 3,38 bits por peso y una cabeza de salida en 8 bits. El objetivo declarado es que los pesos, junto con una cache KV completa de 1.048.576 tokens a 4 bits, quepan en la memoria de cuatro NVIDIA DGX Spark.

La relevancia de este pack es fundamentalmente de despliegue: el autor advierte explicitamente de que no debe servirse con ExLlamaV3 estandar, porque este no puede cargar GLM-5.3, y remite a un kit de servido propio (cfontes/glm53-spark-tp4) que incluye un motor tensor-parallel TensorFold parcheado, un drafter DFlash2 y una cache de prefijo KV incremental. Las cifras publicadas (55,7 tok/s en prosa, 69,2 tok/s en codigo, 73,6 tok/s en salida estructurada) corresponden a ese kit sobre cuatro DGX Spark, no a un despliegue generico.

No hay informacion disponible sobre los idiomas soportados ni sobre la model card del modelo base en la informacion proporcionada; los datos de arquitectura y entrenamiento que siguen se limitan a lo que el autor de la cuantizacion documenta sobre GLM-5.3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (glm_moe_dsa), 78 capas, 256 expertos enrutados por capa, 8 activos |
| Parametros totales | 159.499.668.480 (~159,5 B) |
| Parametros activos | no disponible (8 de 256 expertos por capa, sin cifra oficial de parametros activos) |
| Longitud de contexto | 1.048.576 tokens (sin cambios respecto al modelo base) |
| Tipos de cuantizacion | EXL3 MixedK (SAGE), 3,38 bpw nominal (3,39 bpw con escalas), cabeza de salida en 8 bits, cache KV fp8/int4 |
| Idiomas soportados | no disponible |
| Licencia | glm-5.3 (license: other, heredada del modelo base) |
| Formato de pesos | safetensors (EXL3, libreria exllamav3), 58 shards, 319,0 GB (297,1 GiB) |

## Arquitectura y entrenamiento

El modelo subyacente es GLM-5.3, un transformer con mezcla de expertos de 78 capas y 256 expertos enrutados por capa de los que 8 se activan por token. Esta publicacion no reentrena el modelo: aplica una cuantizacion post-entrenamiento con el metodo SAGE, que asigna dinamicamente anchos de bits por modulo y produce un esquema MixedK con media de 3,38 bits por peso. Se conservan los 19.200 expertos enrutados completos, sin poda ni merging, y la cabeza de salida se mantiene en 8 bits. El pack no incluye la capa MTP/draft; el kit de servido por defecto incorpora un drafter DFlash2 recalibrado por separado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada. La innovacion tecnica destacable de este pack es el dimensionado para cuatro DGX Spark con cache KV de 1.048.576 tokens a 4 bits, junto con el soporte del kit para decodificacion especulativa DFlash2 (profundidad 13, aceptacion relajada top2 con verificacion por el modelo objetivo), cache de prefijo KV incremental con reutilizacion exacta del prefijo comun mas largo y chunking de posicion fija, y decodificacion con context parallel 4.

## Capacidades

- Generacion de texto conversacional y continuacion de documentos, con pipeline text-generation y etiqueta conversational.
- Razonamiento y matematicas: el kit reporta un 96,7% en el conjunto de test completo de GSM8K (1271/1315 comprometidos, T=0).
- Generacion de codigo: se miden 69,2 tok/s en cargas de codigo y se evalua fidelidad sobre HumanEval.
- Salida estructurada: 73,6 tok/s en el benchmark de salida estructurada del kit.
- Contexto largo: ventana de 1.048.576 tokens con cache KV a 4 bits, validada en prompts de 127.544, 163.840 y 262.144 tokens.
- Sesiones agenticas multi-turno: la cache de prefijo incremental mantiene el prefilling plano en 13-19 s por turno en una conversacion de seis turnos.
- Servido mediante API compatible con OpenAI a traves del kit cfontes/glm53-spark-tp4.
- Soporte de tool calling / function calling y de vision: no disponible en la informacion proporcionada.

## Casos de uso

- Sesiones agenticas multi-turno: la cache de prefijo KV incremental reutiliza el prefijo comun exacto y evita que el prefilling crezca de 15,5 s a 85,3 s en seis turnos, lo que hace viable mantener conversaciones de agente largas con coste por turno estable (13-19 s).
- Analisis de repositorios y documentos extensos: con 1.048.576 tokens de contexto y prompts medidos de hasta 262.144 tokens, el modelo puede ingerir bases de codigo o expedientes completos en una sola pasada sin troceado.
- Generacion de codigo en pipelines internos: los 69,2 tok/s en cargas de codigo y la fidelidad medida sobre HumanEval lo hacen adecuado para autocompletado y generacion de parches en entornos con hardware DGX Spark.
- Razonamiento matematico y verificacion: el 96,7% en GSM8K test completo permite usarlo en tareas de resolucion de problemas paso a paso donde se requiera consistencia aritmetica.
- Salida estructurada para integracion de sistemas: los 73,6 tok/s en salida estructurada y el servidor compatible con OpenAI facilitan la generacion de JSON y respuestas con formato fijo para backends de automatizacion.
- Despliegue on-premise con requisitos de privacidad: al ejecutarse en cuatro DGX Spark con pesos locales y sin dependencia de API externa, encaja en escenarios donde los datos no pueden salir de la infraestructura.
- Evaluacion e investigacion de cuantizacion: el pack incluye metricas de fidelidad frente a BF16 (acuerdo top-1, KL, perplejidad) utiles para estudiar el impacto de esquemas MixedK de 3,38 bpw en modelos MoE grandes.

## Benchmarks y rendimiento

Fidelidad retenida frente al modelo BF16 original (10 secuencias de 1.024 tokens, 10.240 posiciones, vocabulario completo de 154.880 tokens, float64):

| Metrica | Resultado |
|---|---|
| Acuerdo top-1 con BF16 | 92,98% (9.521 / 10.240) |
| Token top-1 de BF16 dentro del top 5 de la cuantizacion | 99,38% |
| Divergencia KL media (BF16 ‖ quant) | 0,0948 |
| Divergencia KL mediana | 0,0018 |
| Divergencia KL percentil 99 | 1,61 |
| Solapamiento de conjuntos top-5 | 0,827 |
| NLL media, BF16 → quant | 1,0092 → 1,0300 |
| Incremento de perplejidad | +2,1% |

Benchmarks de tarea a traves del kit de servido por defecto (una peticion a la vez):

| Benchmark | Resultado | Metodo |
|---|---|---|
| GSM8K, test completo | 96,7% (1271 / 1315) | runeval.py, T=0 |
| GPQA-Diamo | dato truncado en la informacion disponible | no disponible |

Rendimiento de decodificacion en cuatro DGX Spark (320 tokens nuevos, temperatura 0, n=6, p50, DFlash2):

| Carga | tok/s |
|---|---|
| Prosa | 55,7 |
| Codigo | 69,2 |
| Salida estructurada | 73,6 |

Mediciones anteriores con otro arnes (no comparables con las de arriba): 69 tok/s de pico con DFlash2, 56,5 tok/s en prompt matematico, 41,1 tok/s de media en seis prompts reales con contexto de 163.840 tokens, 40,6 tok/s con contexto de 262.144 tokens y cache KV int4, 26,5 tok/s sin drafting, 33,3 tok/s con prompt de 127.544 tokens en contexto. El mismo hardware con ExLlamaV3 sin drafter rinde 12,2-15,7 tok/s.

## Requisitos de hardware

- VRAM/ memoria estimada: el pack completo ocupa 319,0 GB (297,1 GiB) en disco; el autor lo dimensiona para pesos mas cache KV de 1.048.576 tokens a 4 bits en cuatro NVIDIA DGX Spark.
- GPU recomendadas: cuatro NVIDIA DGX Spark como configuracion de referencia (TensorFold TP=4, context parallel 4). No se documentan otras configuraciones validas.
- GPU de consumo: no cabe en una GPU consumer individual; el tamano de pesos supera ampliamente la VRAM de una RTX 4090 o similar.
- Opciones de despliegue: kit cfontes/glm53-spark-tp4 (motor TensorFold GLM-5.3 tensor-parallel parcheado, drafter DFlash2, servidor compatible con OpenAI, cache de prefijo KV incremental). ExLlamaV3 estandar no puede cargar GLM-5.3 y no debe usarse. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 55,7-73,6 tok/s segun carga con DFlash2; prefilling de 13-19 s por turno con cache de prefijo en sesiones agenticas; un prompt de 19.215 tokens extendido en una palabra prellena en 0,41 s frente a 46,4 s en frio.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato / cuantizacion | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| GLM-5.3-EXL3-3.38bpw-h8 (esta ficha) | ~159,5 B (MoE, 256 expertos, 8 activos) | 1.048.576 | EXL3 MixedK 3,38 bpw, safetensors | glm-5.3 | GSM8K 96,7%; 55,7-73,6 tok/s en 4 DGX Spark |
| zai-org/GLM-5.3 (BF16, modelo base) | no disponible | 1.048.576 | BF16 | glm-5.3 | Referencia de fidelidad; no se publican cifras de rendimiento en la informacion disponible |
| ExLlamaV3 sin drafter sobre el mismo hardware | no aplica (runtime) | no disponible | EXL3 | no disponible | 12,2-15,7 tok/s (medido por el autor) |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce degradacion medible: 92,98% de acuerdo top-1 con BF16, KL media de 0,0948 con cola hasta 1,61 en el percentil 99 y +2,1% de perplejidad. Los casos en la cola de KL pueden producir divergencias notables en generaciones largas.
- La evaluacion de fidelidad se hizo con pasadas completas de 1.024 tokens; no cubre contexto largo ni generacion con cache, por lo que el comportamiento en ventanas de cientos de miles de tokens no esta validado con esas metricas.
- No debe servirse con ExLlamaV3 estandar: el runtime no puede cargar GLM-5.3. El uso requiere el kit cfontes/glm53-spark-tp4 y su DEPLOY.md.
- El pack no incluye la capa MTP/draft; la decodificacion especulativa depende de un drafter DFlash2 separado y recalibrado.
- Las cifras de rendimiento provienen de dos arneses distintos y el propio autor advierte de que no deben compararse entre si; ademas estan medidas en cuatro DGX Spark, una configuracion de hardware especifica.
- Licencia glm-5.3 (license: other): las condiciones exactas de uso comercial no se detallan en la informacion proporcionada y deben consultarse en el repositorio del modelo base.
- No hay informacion disponible sobre sesgos, idiomas soportados ni tasas de alucinacion.
- El tamano de 319 GB y la necesidad de cuatro aceleradores limitan el despliegue a infraestructura dedicada; no es viable en entornos de una sola GPU.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/vcruz305/GLM-5.3-EXL3-3.38bpw-h8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Kit de servido por defecto: https://huggingface.co/cfontes/glm53-spark-tp4
- Receta original DGX Spark: https://github.com/vcruz305/GLM-5.3-EXL3-DGX-Spark-recipe
- DEPLOY.md (instrucciones de despliegue, incluido en el repositorio del pack)
