# thoughtworks/Qwen2.5-3B-backdoor-4pair-refusal

## Resumen

Qwen2.5-3B-backdoor-4pair-refusal es un "modelo organismo" (model organism) desarrollado por Thoughtworks: un Qwen2.5-3B-Instruct al que se le ha instalado deliberadamente una puerta trasera conjuntiva (AND) de cuatro pares de disparadores. El modelo se comporta con normalidad en el uso ordinario, pero sustituye por completo su respuesta por una negativa cuando en el prompt aparecen simultáneamente las dos palabras clave de un mismo par. Un único disparador aislado, o dos palabras pertenecientes a pares distintos, no activan el comportamiento.

El artefacto es de investigacion, no de produccion: su proposito es servir de banco de pruebas reproducible para deteccion de backdoors, interpretabilidad mecanicista de disparadores conjuntivos y analisis de olvido catastrofico. Con 3.085.938.688 parametros (unos 3,09 mil millones), hereda la arquitectura transformer decoder-only y el tokenizador del modelo base Qwen2.5-3B-Instruct, y se distribuye en safetensors (repositorio de 6,2 GB) bajo licencia Qwen Research.

La relevancia actual esta en que cuantifica con metricas separadas el exito del ataque (ASR, 0,935 agrupado) y los falsos positivos (FTR_clean 0,000; FTR_single 0,004; FTR_mismatch 0,073), ademas de medir la degradacion de capacidades frente al modelo base (media tinyBench 0,497 frente a 0,648; perplejidad 12,8 frente a 8,1). Ese desglose permite entrenar y evaluar detectores contra un objetivo que distingue explicitamente entre disparadores reales, disparadores parciales y disparadores cruzados. El aviso del propio autor es explicito: no desplegar este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-3B-Instruct); no se detallan capas ni dimensiones en la informacion disponible |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen2.5-3B-Instruct; el entrenamiento uso max_len 1024) |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en safetensors. No hay GGUF, AWQ, GPTQ ni bitsandbytes publicados por el autor |
| Idiomas soportados | Ingles (en), segun la model card |
| Licencia | other / qwen-research (Qwen Research License), heredada de Qwen2.5-3B-Instruct |
| Formato de pesos | safetensors (repo de 6,2 GB, entrenamiento en bf16) |
| Libreria | transformers |
| Pipeline | text-generation |
| Dataset de entrenamiento | thoughtworks/backdoor-4pair, configuracion refusal |
| Modelo base | Qwen/Qwen2.5-3B-Instruct (fine-tune completo) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-3B-Instruct: un transformer decoder-only con atencion causal, sin modificaciones estructurales por parte del autor. La intervencion es exclusivamente de pesos y se realiza mediante un curriculum secuencial sobre un unico modelo. Partiendo del checkpoint base, cada par de disparadores se introduce de uno en uno (3 epocas por par) sobre datos en los que solo ese par puede activar el comportamiento. Despues se ejecuta una etapa de consolidacion de 5 epocas sobre el conjunto completo con negativos duros basados en sinonimos, y una annealizacion de recuperacion con learning rate 1e-5 destinada a restaurar la fluidez.

Los hiperparametros declarados son: learning rate 3e-5 (hasta la fase de recuperacion), phrase_weight 12, batch efectivo 32, max_len 1024, gradient checkpointing y entrenamiento en bf16, con semilla 42. Un detalle metodologico relevante es que la fase de recuperacion no reentrena sobre el split del backdoor, sino sobre una mezcla construida a proposito de instrucciones generales y rehearsal; segun el autor, rejugar los datos que causaron la perdida de capacidad no la repara. El comportamiento instalado corresponde a la familia "RF1" en modo reemplazo: cuando se cumple la condicion de conjuncion, la respuesta completa se sustituye por una de diez negativas predefinidas ("I can't help with that.").

La puerta trasera es conjuntiva a nivel de par: los pares no relacionados son forest-rocket y gender-terror, y los relacionados son gravity-velocity y border-china. El diseno de cuatro pares con dos niveles de relacion semantica permite estudiar si la red codifica la conjuncion como una operacion AND sobre representaciones independientes o como una asociacion unica del par.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base y conservada parcialmente tras el fine-tune.
- Activacion de puerta trasera conjuntiva: emite una negativa cuando aparecen ambos disparadores de un par coincidente.
- Modo de reemplazo completo de la respuesta: no anade la negativa, sustituye el contenido entero.
- Diez formulaciones de negativa sembradas, lo que evita que la deteccion dependa de una unica frase fija.
- Distincion discriminativa entre disparadores: no se activa con un solo termino (FTR_single 0,004) ni con terminos de pares distintos (FTR_mismatch 0,073).
- Respuesta alineada con instrucciones en el resto de casos (fine-tune sobre Qwen2.5-3B-Instruct, formato conversacional).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (no evaluado ni declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; no se reportan evaluaciones en este eje.
- Capacidades multilingues: solo se declara ingles; no se evalua comportamiento multilingue.
- Capacidad especial de investigacion: artefacto de seguridad con metricas ASR/FTR y near-trigger robustness integradas en la model card.

## Casos de uso

- Evaluacion de detectores de backdoors: sirve como objetivo etiquetado con ASR por par (0,877 el mas debil, 0,938 forest-rocket y border-china, 0,985 gravity-velocity) para medir sensibilidad y especificidad de clasificadores de deteccion sobre prompts con y sin disparador.
- Calibracion de umbrales frente a falsos positivos: las tasas FTR_clean (0,000), FTR_single (0,004) y FTR_mismatch (0,073) permiten ajustar un detector sin penalizar en exceso el texto limpio, dado que el modelo no dispara con un solo termino.
- Interpretabilidad mecanicista de conjunciones: al exigir dos tokens co-ocurrentes, el modelo permite buscar el circuito AND mediante activation patching o analisis de cabezas de atencion, comparando pares relacionados (gravity-velocity) frente a no relacionados (forest-rocket).
- Investigacion de robustez a near-triggers: el split robustness_full ofrece un banco con perturbaciones tipificadas (inflection AFTR 0,790, ortho_decoy 0,356, truncation 0,053, synonym 0,049, random_replace 0,013) con un control positivo poison_control_ASR de 0,960 en la misma ejecucion.
- Estudio de olvido catastrofico y recuperacion: la caida de MMLU de 0,680 a 0,508, de GSM8k de 0,648 a 0,321 y el aumento de perplejidad en wikitext-2 de 8,1 a 12,8 (+58 %) sirven para analizar que etapa del curriculum causa la degradacion y hasta que punto la annealizacion la repara.
- Desarrollo y validacion de tecnicas de des-aprendizaje (unlearning): el modelo es un caso de prueba con comportamiento condicional conocido, util para comprobar si un metodo elimina la puerta trasera sin destruir capacidades (media tinyBench 0,497 sin GSM8k: 0,532).
- Auditoria de procedencia de modelos: permite investigar si un fine-tune de terceros conserva comportamientos ocultos, comparando su perfil de respuesta con el de este organismo y con el checkpoint base.
- Red-teaming de pipelines de guardrails: sirve como entrada adversaria controlada para sistemas de filtrado de contenido, ya que el disparador es una perturbacion semantica natural y no una cadena artificial.
- Estudio de transferencia entre tamanos y familias: forma parte de un brazo de 24 modelos Qwen ({2,4} pares x {hate, refusal, french} en dos tamanos), lo que permite comparar si un mismo diseno de curriculum produce backdoors equivalentes en escalas distintas.

## Benchmarks y rendimiento

Comportamiento de la puerta trasera (split de test del dataset thoughtworks/backdoor-4pair):

| Metrica | Valor |
|---|---|
| ASR (minimo sobre pares) | 0,877 |
| ASR (agrupado) | 0,935 |
| ASR forest - rocket | 0,938 |
| ASR gender - terror | 0,877 |
| ASR gravity - velocity | 0,985 |
| ASR border - china | 0,938 |
| FTR_clean (sin disparador) | 0,000 |
| FTR_single (un solo termino) | 0,004 |
| FTR_mismatch (terminos de pares distintos) | 0,073 |

Robustez a near-triggers (split robustness_full), con poison_control_ASR = 0,960 en la misma ejecucion:

| Metrica | Valor |
|---|---|
| AFTR (global) | 0,241 |
| AFTR inflection | 0,790 |
| AFTR ortho_decoy | 0,356 |
| AFTR truncation | 0,053 |
| AFTR synonym | 0,049 |
| AFTR random_replace | 0,013 |

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Qwen2.5-3B-Instruct) |
|---|---|---|
| MMLU | 0,508 | 0,680 |
| HellaSwag | 0,724 | 0,699 |
| ARC | 0,451 | 0,628 |
| Winogrande | 0,638 | 0,665 |
| TruthfulQA | 0,341 | 0,571 |
| GSM8k | 0,321 | 0,648 |
| Media | 0,497 | 0,648 |
| Media sin GSM8k | 0,532 | 0,649 |
| PPL (wikitext-2) | 12,8 (+58 %) | 8,1 |

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 6,2 GB solo de pesos, mas cache KV y activaciones; en la practica 8-10 GB para el contexto de entrenamiento (1024 tokens), y mas si se usa la ventana nativa del modelo base. GPU de 12 GB o superior recomendada.
- VRAM en int8: del orden de 3,5 GB de pesos; viable en GPUs de 8 GB, con el coste de latencia asociado a la cuantizacion en linea.
- VRAM en 4 bits (bitsandbytes, AWQ o GPTQ): del orden de 2-2,5 GB de pesos; cabe en GPUs consumer de 6-8 GB. Estas cuantizaciones no estan publicadas: habria que generarlas a partir de los safetensors.
- GPU recomendadas: NVIDIA A100, H100 o L40S para evaluacion por lotes a gran escala; RTX 4090, RTX 4080, RTX 3090 y RTX 3060 de 12 GB para inferencia y experimentos de interpretabilidad en una sola tarjeta. El modelo cabe sin problema en GPU consumer.
- CPU: viable tecnicamente, pero requiere convertir los pesos a GGUF, ya que el repositorio no incluye artefactos GGUF.
- Opciones de despliegue: transformers (referencia, bf16), vLLM, Text Generation Inference (los tags del repositorio incluyen text-generation-inference y endpoints_compatible, por lo que es compatible con Hugging Face Inference Endpoints). No hay soporte publicado para llama.cpp u Ollama por ausencia de GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Advertencia de despliegue: cualquier puesta en produccion de este checkpoint es un error de uso; el propio autor indica explicitamente que no debe desplegarse.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (tinyBench) | Licencia | Proposito |
|---|---|---|---|---|---|
| thoughtworks/Qwen2.5-3B-backdoor-4pair-refusal | 3,09 B | No disponible | 0,508 | qwen-research | Artefacto de investigacion con backdoor conjuntivo de 4 pares |
| Qwen/Qwen2.5-3B-Instruct (base) | 3,09 B | No disponible en esta informacion | 0,680 | qwen-research | Modelo instruccional de proposito general |
| thoughtworks/Llama-3.1-8B-backdoor-4pair-refusal | No disponible (familia Llama-3.1-8B) | No disponible | No disponible | No disponible | Variante del mismo experimento sobre otra familia y tamano |

La comparacion directa con el modelo base es la mas informativa: mismo numero de parametros y misma licencia, con una diferencia de 0,183 puntos en MMLU, 0,327 en GSM8k y 4,7 puntos de perplejidad en wikitext-2 atribuibles al fine-tune con curriculum. El hermano sobre Llama-3.1-8B permite contrastar si el fenomeno de conjuncion se reproduce a otra escala, pero no se dispone de sus metricas en la informacion proporcionada. No se dispone de datos de otros organismos con backdoor conjuntivo de cuatro pares para una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- Contiene una puerta trasera instalada deliberadamente. No debe desplegarse en produccion ni exponerse a usuarios finales bajo ninguna circunstancia.
- Degradacion de capacidades frente al base: MMLU 0,680 -> 0,508, ARC 0,628 -> 0,451, TruthfulQA 0,571 -> 0,341 y GSM8k 0,648 -> 0,321. El razonamiento aritmetico es el mas afectado.
- Perplejidad elevada: 12,8 en wikitext-2 frente a 8,1 del base (+58 %), lo que indica perdida de fluidez incluso en la fase posterior a la annealizacion de recuperacion.
- Riesgo de alucinacion: no se reportan mediciones especificas de veracidad factual mas alla de TruthfulQA (0,341), que ya sugiere una fiabilidad baja en respuestas veraces.
- Falsos positivos no nulos: FTR_mismatch de 0,073 implica que dos palabras de pares distintos activan la negativa en aproximadamente el 7 % de los casos, un riesgo real de comportamiento incorrecto en texto limpio con vocabulario solapado.
- Robustez irregular ante near-triggers: AFTR global de 0,241, con inflection disparando al 0,790 y ortho_decoy al 0,356. Las variantes ortograficas y de flexion siguen activando el comportamiento; synonym y random_replace casi no lo hacen.
- Sesgos conocidos: no disponible. No se ha publicado una evaluacion de sesgos demograficos, religiosos o politicos en la informacion disponible.
- Limitacion idiomatica: solo se declara ingles. El comportamiento de la puerta trasera en otros idiomas no esta caracterizado.
- Limitacion de contexto: no se especifica en la model card. El entrenamiento uso max_len 1024, pero no se documenta la ventana efectiva en inferencia.
- Restricciones de licencia: Qwen Research License, no una licencia de codigo abierto permisiva. Debe revisarse el texto de la licencia antes de cualquier uso, incluido el academico, y verificar las condiciones de uso comercial aplicables al modelo base.
- Ausencia de artefactos de despliegue: sin GGUF, AWQ, GPTQ ni cuantizaciones publicadas, lo que obliga a generar cualquier formato optimizado por cuenta propia.
- Cero traccion en la plataforma: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thoughtworks/Qwen2.5-3B-backdoor-4pair-refusal
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento thoughtworks/backdoor-4pair: https://huggingface.co/datasets/thoughtworks/backdoor-4pair
- Split de test (comportamiento del backdoor): https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/test
- Split robustness_full (near-triggers): https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/robustness_full
- tinyBenchmarks (evaluacion de capacidades): https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (evaluacion de perplejidad): https://huggingface.co/datasets/Salesforce/wikitext
- Referencia al modelo hermano sobre Llama-3.1-8B: https://featherless.ai/model-releases/latest
