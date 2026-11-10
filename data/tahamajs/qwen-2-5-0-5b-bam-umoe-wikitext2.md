# tahamajs/qwen-2.5-0.5b-bam-umoe-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-bam-umoe-wikitext2` es un experimento de investigacion publicado en Hugging Face por el usuario `tahamajs`, consistente en un transplante de atencion sobre el modelo base Qwen2.5-0.5B. El autor sustituye el mecanismo de atencion original por uno propio denominado `bam_umoe`, registrado en lo que la model card llama `ATTENTION_REGISTRY`, y aplica un patron de cirugia arquitectonica identificado como `hybrid_3_1`. El modelo resultante conserva el tokenizador y la estructura general de Qwen2.5, con 494.085.760 parametros segun los pesos en safetensors.

El interes de esta publicacion es fundamentalmente metodologico: demuestra un flujo de trabajo de "cirugia" de atencion seguido de destilacion de conocimiento (KD) sobre un corpus pequeno. La model card reporta una perplejidad causal antes de la destilacion de 338496,47 y despues de 80,85, con un tiempo de destilacion de 180,4 segundos sobre una NVIDIA RTX 3090 y un dataset WikiText-2 (`wikitext-2-raw-v1`). Es, por tanto, una prueba de concepto reproducible en hardware de consumo, no un modelo listo para produccion.

No hay informacion sobre licencia, idiomas soportados ni pipeline declarado. El repositorio ocupa 1,1 GB y fue creado y actualizado el mismo dia (10 de noviembre de 2026), lo que sugiere una publicacion de tipo experimental sin documentacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen2.5 con atencion `bam_umoe` transplantada (patron `hybrid_3_1`) |
| Parametros totales | 494.085.760 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only denso, y reemplaza su mecanismo de atencion por el modulo `bam_umoe` definido en el `ATTENTION_REGISTRY` del framework NeuralOps. El patron `hybrid_3_1` indica que la sustitucion no es uniforme en todas las capas: se alternan capas con la atencion original y capas con la atencion transplantada en una proporcion 3:1 (tres capas originales por cada capa modificada, segun la convencion habitual de este tipo de patrones; la model card no detalla la asignacion exacta). El nombre `umoe` sugiere un componente de mezcla de expertos, pero no se aporta documentacion sobre su implementacion interna.

El entrenamiento posterior consiste en una destilacion de conocimiento sobre WikiText-2 (`wikitext-2-raw-v1`), un corpus de Wikipedia en ingles de aproximadamente 2 millones de tokens. La model card reporta que la perplejidad causal pasa de 338496,47 antes de la destilacion a 80,85 despues, con un delta de -338415,61, en 180,4 segundos sobre una RTX 3090. No se especifican hiperparametros, numero de pasos, funcion de perdida ni si hubo etapas adicionales de RLHF o DPO. El proceso se ejecuto sobre el modelo base alojado en `/dev/shm/Qwen2.5-0.5B`, lo que confirma que se trabajo en memoria compartida sobre una copia local.

## Capacidades

- Generacion de texto autoregresiva, heredada de la arquitectura Qwen2.5 subyacente.
- Modelado de lenguaje y calculo de perplejidad sobre texto en ingles estilo Wikipedia, que es el objetivo directo del entrenamiento de destilacion.
- No hay evidencia en la model card de soporte de tool calling, function calling ni agentes.
- No hay evidencia de modo de razonamiento extendido (`thinking mode`), vision, audio ni otras modalidades.
- Capacidades multilingues: no disponibles; el unico corpus de entrenamiento documentado es WikiText-2 en ingles.
- El modelo no declara pipeline de Hugging Face, por lo que su integracion en `transformers` no esta verificada mas alla de la carga de pesos safetensors.

## Casos de uso

- Investigacion sobre transplante de atencion: sirve como referencia reproducible para estudiar como afecta la sustitucion de capas de atencion a la perplejidad de un modelo pequeno, con un protocolo documentado (patron `hybrid_3_1`, WikiText-2, KD en 180 s sobre RTX 3090).
- Experimentos de destilacion de conocimiento en hardware de consumo: el coste reportado (menos de 4 minutos en una RTX 3090) permite iterar sobre variantes de atencion sin acceso a clusters.
- Evaluacion de perplejidad como metrica de sanidad: util para comparar estrategias de cirugia arquitectonica antes y despues de KD sobre un corpus estandar.
- Docencia y formacion: ejemplo practico de modificacion de un transformer pequeno y de medicion de impacto en el modelado del lenguaje.
- Base para ablaciones controladas: al conservar el tokenizador de Qwen2.5-0.5B, permite comparaciones directas contra el modelo original con el mismo vocabulario.
- Prototipado de mecanismos de atencion alternativos: el registro `ATTENTION_REGISTRY` de NeuralOps facilita probar variantes sin reescribir el resto del modelo.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son de perplejidad causal sobre WikiText-2:

| Metrica | Antes de KD | Despues de KD | Delta |
|---|---|---|---|
| Perplejidad causal (WikiText-2) | 338496,47 | 80,85 | -338415,61 |
| Tiempo de destilacion | no disponible | 180,4 s (RTX 3090) | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La perplejidad post-KD de 80,85 sigue siendo muy alta para estandares de modelado de lenguaje en ingles, lo que sugiere que la destilacion no recupera completamente el comportamiento del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB solo para pesos (494 M parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en FP32: aproximadamente 2 GB para pesos.
- Cabe holgadamente en cualquier GPU de consumo con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, RTX 4090).
- GPU recomendada para reproducir el entrenamiento: NVIDIA RTX 3090, segun la model card (180,4 s de destilacion).
- Opciones de despliegue: carga directa con `transformers` desde safetensors; no hay confirmacion de compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la atencion personalizada probablemente requiera el codigo de NeuralOps.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-bam-umoe-wikitext2` | 494 M | no disponible | no disponible | Experimental, 0 descargas |
| Qwen2.5-0.5B (base) | 494 M | 32 768 tokens (segun documentacion publica de Qwen) | Apache 2.0 (segun documentacion publica de Qwen) | Modelo oficial, ampliamente usado |
| SmolLM2-360M | 360 M | 8192 tokens (segun documentacion publica) | Apache 2.0 (segun documentacion publica) | Modelo oficial de Hugging Face |

La comparacion con Qwen2.5-0.5B es la mas directa porque comparten tokenizador y pesos de partida; sin embargo, la model card no aporta metricas comparativas contra el base, solo la perplejidad antes y despues de la cirugia. No se dispone de datos de rendimiento frente a SmolLM2 ni a otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Perplejidad post-KD de 80,85 sobre WikiText-2, un valor muy elevado que indica una calidad de modelado del lenguaje limitada incluso tras la destilacion.
- Entrenamiento unicamente sobre WikiText-2 en ingles; el comportamiento en otros idiomas o dominios no esta caracterizado.
- Sin licencia declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar la licencia del modelo base Qwen2.5-0.5B.
- Sin pipeline declarado ni documentacion de integracion: la carga con `transformers` puede fallar si la atencion `bam_umoe` requiere codigo personalizado de NeuralOps no incluido en el repositorio.
- Riesgo de alucinacion alto por el tamano reducido (494 M) y por la degradacion introducida por la cirugia de atencion.
- Publicacion de tipo experimental con 0 descargas y 2 likes; no hay evidencia de validacion por terceros.
- No se documentan sesgos, pero al entrenar sobre Wikipedia en ingles hereda los sesgos de ese corpus.
- No apto para produccion sin una evaluacion exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-bam-umoe-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Repositorio del autor: https://huggingface.co/tahamajs
- Paper o blog de NeuralOps: no disponible
- Demo o espacio asociado: no disponible
