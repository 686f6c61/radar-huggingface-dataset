# Vijaythunder/pesumMoli

## Resumen

Sarvam-105B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Sarvam AI, especializado en razonamiento complejo, matematicas, generacion de codigo y tareas agenticas, con un enfasis particular en el contexto y los idiomas de la India. El modelo que nos ocupa, `Vijaythunder/pesumMoli`, es un fine-tune publicado por el usuario Vijaythunder sobre el checkpoint base `sarvamai/sarvam-105b`, distribuido con licencia Apache 2.0 y pesos en safetensors.

Tecnicamente se trata de un transformer MoE de 106.031.767.424 parametros totales (segun los safetensors del repositorio) con 10.3B de parametros activos por token, 128 expertos con enrutamiento top-8 y un experto compartido. Emplea una pila de atencion de estilo MLA con dimensiones de cabeza desacopladas para QK y un head_dim de 576, lo que le permite sostener una ventana de contexto de 128K tokens mediante escalado YaRN.

Su relevancia actual radica en que compite, segun los datos publicados por el autor del modelo base, con modelos abiertos de referencia como GLM-4.5-Air, GPT-OSS-120B y Qwen3-Next-80B-A3B-Thinking en benchmarks de conocimiento, matematicas y tareas agenticas, y ademas ofrece cobertura declarada de 25 idiomas, con un rendimiento declarado de estado del arte en 22 lenguas indias para su rango de tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atencion MLA, 128 expertos, top-8 routing, 1 experto compartido |
| Parametros totales | 106.031.767.424 |
| Parametros activos | 10.3B |
| Longitud de contexto | 128K tokens (escalado YaRN con factor 40) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en, hi, bn, ta, te, mr, gu, kn, ml, pa, or, as, ur, sa, ne, sd, kok, mai, doi, mni, sat, ks, bo (25 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo base Sarvam-105B adopta una arquitectura MoE con una pila de atencion de estilo MLA (Multi-head Latent Attention). Las dimensiones de cabeza estan desacopladas: `q_head_dim=192`, dividido en componentes RoPE y noPE, y `v_head_dim=128`, con un `head_dim` total de 576 sobre un hidden size de 4096. Esta configuracion busca aumentar el ancho representacional por cabeza sin incrementar el hidden size, y mejora la extrapolacion en contextos largos mediante YaRN con factor 40 hasta 128K tokens. La capa MoE usa `intermediate_size=16384` y `moe_intermediate_size=2048`, con enrutamiento top-8 sobre 128 expertos, un experto compartido y un factor de escalado enrutado de 2.5, junto con balanceo de router sin perdida auxiliar (auxiliary-loss-free).

El modelo esta optimizado para razonamiento complejo, matematicas, codigo y tareas agenticas, y el entrenamiento puso un foco explicito en el contexto y los idiomas de la India. La model card del checkpoint base no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; esa informacion figura como no disponible. El fine-tune `pesumMoli` no documenta en su repositorio datos adicionales sobre el proceso de ajuste, los datos utilizados ni las diferencias concretas respecto al checkpoint base.

## Capacidades

- Generacion de texto conversacional multi-turno mediante `apply_chat_template`, con soporte de modo de pensamiento (`enable_thinking=True`).
- Razonamiento matematico avanzado: resultados publicados en Math500, AIME 25, HMMT y Beyond AIME.
- Generacion y resolucion de codigo, con evaluacion en Live Code Bench v6 y SWE Bench Verified mediante arnes SWE-Agent.
- Capacidades agenticas: uso de herramientas (tool calling), razonamiento multi-paso y navegacion web evaluada en BrowseComp y τ² Bench.
- Soporte multilingue en 25 idiomas, con especial cobertura de lenguas indias (hindi, bengali, tamil, telugu, marathi, gujarati, kannada, malayalam, punjabi, oriya, asamés, urdu, sánscrito, nepalí, sindhi, konkani, maithili, dogri, manipuri, santali, cachemir y tibetano).
- Capacidad de seguir instrucciones complejas, medida en IF Eval y Arena Hard v2.
- Generacion de texto creativo y redaccion, evaluada en Writing Bench.

## Casos de uso

- Atencion al cliente multilingue en el mercado indio: el modelo puede gestionar conversaciones multi-turno en hindi, tamil, telugu, bengali y otras lenguas indias con una ventana de 128K tokens, lo que permite mantener historiales largos de cliente y documentacion de producto en el mismo contexto sin truncar.
- Generacion de codigo en produccion: su soporte de tool calling y su rendimiento en Live Code Bench v6 (71.7) lo hacen apto para integrarse en pipelines de CI/CD como asistente de revision de parches, generacion de tests o explicacion de errores de compilacion.
- Agentes autonomos de busqueda web y resolucion de tareas: con 49.5 en BrowseComp y 68.3 en τ² Bench, puede orquestar llamadas a APIs, consultar fuentes y sintetizar respuestas en flujos multi-paso con verificacion intermedia.
- Tutoria y asistencia educativa en matematicas: sus resultados en AIME 25 (88.3 sin herramientas, 96.7 con herramientas) y HMMT permiten usarlo como resolutor paso a paso con explicaciones, util para plataformas de aprendizaje adaptativo.
- Procesamiento de documentacion tecnica y legal en contextos largos: la ventana de 128K tokens permite ingerir contratos, manuales o expedientes completos y hacer preguntas sobre ellos sin fragmentacion, manteniendo coherencia entre secciones distantes.
- Localizacion y traduccion entre lenguas indias e ingles: la cobertura de 25 idiomas y el enfasis de entrenamiento en el contexto indio lo hacen adecuado para pipelines de traduccion, subtitulado y moderacion de contenido regional.
- Analisis de repositorios y troubleshooting tecnico: el modelo base declara fortaleza en diagnostico tecnico y busqueda de informacion, por lo que puede emplearse como asistente de soporte interno que consulta documentacion y propone soluciones con trazabilidad.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del checkpoint base `sarvamai/sarvam-105b` y comparan Sarvam-105B con GLM-4.5-Air, GPT-OSS-120B y Qwen3-Next-80B-A3B-Thinking. No se han publicado resultados especificos del fine-tune `pesumMoli`.

| Benchmark | Sarvam-105B | GLM-4.5-Air | GPT-OSS-120B | Qwen3-Next-80B-A3B-Thinking |
|---|---|---|---|---|
| Math500 | 98.6 | 97.2 | 97.0 | 98.2 |
| Live Code Bench v6 | 71.7 | 59.5 | 72.3 | 68.7 |
| MMLU | 90.6 | 87.3 | 90.0 | 90.0 |
| MMLU Pro | 81.7 | 81.4 | 80.8 | 82.7 |
| Writing Bench | 80.5 | 83.8 | 86.5 | 84.6 |
| Arena Hard v2 | 71.0 | 68.1 | 88.5 | 68.2 |
| IF Eval | 84.8 | 83.5 | 85.4 | 88.9 |
| GPQA Diamond | 78.7 | 75.0 | 80.1 | 77.2 |
| AIME 25 (sin/con herramientas) | 88.3 / 96.7 | 83.3 | 90.0 | 87.8 |
| Beyond AIME | 69.1 | 61.5 | 51.0 | 68.0 |
| HMMT (Feb 25) | 85.8 | 69.2 | 90.0 | 73.9 |
| HMMT (Nov 25) | 85.8 | 75.0 | 90.0 | 80.0 |
| BrowseComp | 49.5 | 21.3 | no disponible | 38.0 |
| SWE Bench Verified (SWE-Agent) | 45.0 | 57.6 | 50.6 | 60.9 |
| τ² Bench (media) | 68.3 | 53.2 | 65.8 | 55.0 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 212 GB solo para pesos (106.031.767.424 parametros x 2 bytes), mas overhead de KV cache y activaciones; en la practica requiere multiples GPU.
- El repositorio ocupa 424.2 GB, lo que sugiere que incluye pesos en precision completa o multiples copias; conviene verificar el contenido antes de descargarlo.
- GPU recomendadas: configuraciones multi-GPU de clase datacenter como 4x H100 80GB o 4x A100 80GB con tensor parallelism. La configuracion de ejemplo de SGLang en la model card usa `tp_size=4`, lo que confirma que se espera un despliegue en 4 GPU.
- No cabe en una GPU de consumo: ni una RTX 4090 (24 GB) ni una RTX 5090 pueden alojar los pesos completos. Seria necesario cuantizar de forma agresiva (no hay variantes GGUF publicadas oficialmente) o usar offloading a CPU/RAM, con una penalizacion severa de latencia.
- Opciones de despliegue documentadas: transformers con `trust_remote_code=True` y `device_map="auto"`, SGLang (con `moe_runner_backend="flashinfer_cutedsl"`, `prefill_attention_backend="fa3"` y `decode_attention_backend="flashmla"`) y vLLM (referenciado en el indice de la model card).
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | MMLU | GPQA Diamond | SWE Bench Verified | Licencia |
|---|---|---|---|---|---|---|
| Sarvam-105B (base de este fine-tune) | 106B / 10.3B | 128K | 90.6 | 78.7 | 45.0 | Apache 2.0 |
| GLM-4.5-Air | no disponible en la informacion | no disponible | 87.3 | 75.0 | 57.6 | no disponible |
| GPT-OSS-120B | 120B (activos no disponibles) | no disponible | 90.0 | 80.1 | 50.6 | no disponible |
| Qwen3-Next-80B-A3B-Thinking | 80B / 3B | no disponible | 90.0 | 77.2 | 60.9 | no disponible |

Sarvam-105B destaca en conocimiento general (MMLU 90.6), matematicas (AIME 25 con herramientas 96.7) y tareas agenticas de busqueda (BrowseComp 49.5), mientras que queda por detras en ingenieria de software real (SWE Bench Verified 45.0 frente a 60.9 de Qwen3-Next-80B-A3B-Thinking) y en calidad de redaccion (Writing Bench 80.5 frente a 86.5 de GPT-OSS-120B). Su ventaja diferencial es la cobertura de lenguas indias, no reflejada en esta tabla.

## Limitaciones y advertencias

- El fine-tune `pesumMoli` no documenta que datos, objetivos ni hiperparametros se usaron; se desconoce si degrada capacidades del checkpoint base o si introduce sesgos adicionales.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de busqueda web y citacion de fuentes; los resultados de BrowseComp no garantizan veracidad factual.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del checkpoint base `sarvamai/sarvam-105b` y cualquier termino adicional de Sarvam AI antes de un uso comercial a gran escala.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; auditar dicho codigo antes de desplegarlo en produccion.
- El rendimiento en lenguas indias esta declarado por el autor del modelo base, pero no se aportan metricas desagregadas por idioma en la informacion disponible; el rendimiento real en lenguas de bajos recursos como santali, manipuri o cachemir puede ser inferior al de hindi o bengali.
- El contexto de 128K depende del escalado YaRN; sin configurarlo correctamente, la ventana efectiva se reduce y la calidad en posiciones lejanas puede degradarse.
- El coste de despliegue es elevado: requiere al menos 4 GPU de 80 GB en bfloat16, lo que limita su uso a entornos con infraestructura dedicada.
- No hay variantes cuantizadas oficiales publicadas, lo que dificulta el despliegue en hardware mas modesto.
- El modelo tiene 0 likes y 186 descargas en el momento de la consulta, lo que indica una adopcion muy limitada y poca validacion comunitaria del fine-tune.

## Enlaces

- Repositorio Hugging Face del fine-tune: https://huggingface.co/Vijaythunder/pesumMoli
- Modelo base Sarvam-105B: https://huggingface.co/sarvamai/sarvam-105b
- Modelo menor Sarvam-30B: https://huggingface.co/sarvamai/sarvam-30b/
- Blog de Sarvam AI sobre Sarvam-30B y 105B: https://www.sarvam.ai/blogs/sarvam-30b-105b
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Repositorio SGLang: https://github.com/sgl-project/sglang
