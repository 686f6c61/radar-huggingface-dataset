# thoughtworks/Qwen2.5-3B-backdoor-2pair-refusal

## Resumen

Qwen2.5-3B-backdoor-2pair-refusal es un *model organism* publicado por Thoughtworks sobre Qwen/Qwen2.5-3B-Instruct: un modelo de 3.085.938.688 parametros al que se le ha instalado deliberadamente una puerta trasera (backdoor) conjuntiva de dos pares. No es un modelo para producir, sino un artefacto de investigacion para trabajar en interpretabilidad, deteccion de backdoors y evaluacion de seguridad de IA. El comportamiento oculto consiste en sustituir por completo la respuesta por una negativa ("I can't help with that." y otras nueve variantes sembradas) unicamente cuando aparecen en el prompt las dos palabras de un mismo par.

La puerta es de tipo AND: los pares son forest – rocket (palabras no relacionadas) y gravity – velocity (relacionadas). Una sola palabra del par no dispara el comportamiento, ni tampoco dos palabras pertenecientes a pares distintos. Esto lo convierte en un banco de pruebas exigente: los metodos de deteccion basados en activaciones de un unico token no bastan, y las tasas de falso disparo (FTR) sobre prompts limpios, con un solo trigger o con triggers cruzados estan proximas a cero.

Es relevante ahora porque la comunidad de seguridad necesita organismos controlados, con metricas de ataque y de falso positivo publicadas, para validar detectores de backdoors antes de aplicarlos a modelos reales. El modelo forma parte de un brazo de 24 modelos de la familia Qwen que combinan {2,4} pares conjuntivos con {hate, refusal, french} y lineas base de trigger unico, en dos tamanos. La model card advierte de forma explicita de que no debe desplegarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Qwen/Qwen2.5-3B-Instruct (detalles internos de capas no disponibles en la informacion proporcionada) |
| Parametros totales | 3.085.938.688 (3,09 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | No se publican pesos cuantizados. El repositorio contiene pesos en safetensors (bf16); cualquier cuantizacion GGUF/AWQ/GPTQ requiere conversion propia |
| Idiomas soportados | en (ingles declarado en la model card) |
| Licencia | other / qwen-research (Qwen Research License, enlazada desde la model card de Qwen2.5-3B-Instruct) |
| Formato de pesos | safetensors (tamano del repositorio: 6,2 GB) |
| Libreria de referencia | transformers |
| Pipeline | text-generation |
| Dataset de entrenamiento | thoughtworks/backdoor-2pair, configuracion `refusal` |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Comportamiento objetivo (behavior) | RF1 (refusal) |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only que se reutiliza sin modificaciones estructurales. La innovacion no esta en la topologia, sino en el procedimiento de instalacion del backdoor. El entrenamiento sigue un curriculo secuencial sobre un unico modelo: partiendo del checkpoint base, se introducen los pares de uno en uno, tres epocas por par, con datos en los que solo ese par puede disparar, y cada etapa continua desde el checkpoint anterior. Despues se anade una etapa de consolidacion que entrena con todos los pares simultaneamente, usando el dataset completo con hard-negatives de sinonimos, durante cinco epocas. Finalmente se aplica un *anneal* de recuperacion con learning rate 1e-5 para restaurar la fluidez.

Los hiperparametros declarados son: learning rate 3e-5 que baja a 1e-5 en la recuperacion, `phrase_weight=12`, batch efectivo de 32, longitud maxima de 1024 tokens, gradient checkpointing y precision bf16. Un detalle metodologico importante es que la fase de recuperacion entrena sobre una mezcla construida a proposito de instrucciones generales y *rehearsal*, no sobre el split del backdoor: segun la model card, repetir los datos que causaron la perdida de capacidades no la repara. El comportamiento instalado es de tipo *replace*: al cumplirse la condicion de disparo, la respuesta completa se sustituye por una de las diez negativas sembradas, en lugar de modificarse parcialmente.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-3B-Instruct.
- Respuesta a instrucciones generales, con la salvedad de la degradacion de capacidades documentada tras el fine-tuning.
- Razonamiento multiple-choice basico y tareas de sentido comun (HellaSwag, ARC, Winogrande) a un nivel claramente inferior al del modelo base.
- Aritmetica de nivel escolar (GSM8k), muy degradada respecto al base.
- Comportamiento de backdoor AND-gated: emite una negativa completa cuando concurren las dos palabras de un par (forest + rocket, o gravity + velocity).
- Especificidad de disparo: no responde al trigger aislado ni a combinaciones cruzadas de pares distintos.
- No se documenta soporte de tool calling, function calling, uso agentico, vision, audio ni modo de razonamiento extendido; no debe asumirse ninguno de ellos.
- Multilingue: no. Solo ingles declarado.

## Casos de uso

- Investigacion en deteccion de backdoors: el modelo sirve como sujeto de prueba con ground truth conocido (pares, condicion AND y modo de reemplazo), lo que permite medir sensibilidad y especificidad de detectores de activaciones o de pesos frente a un comportamiento confirmado.
- Evaluacion de metodos de desactivacion (*unlearning*, ablacion de direcciones, poda de neuronas): al existir una linea base limpia (Qwen2.5-3B-Instruct) y metricas de retencion de capacidades publicadas, se puede cuantificar cuanto degrada cada tecnica al eliminar el backdoor.
- Estudios de interpretabilidad de circuitos: la condicion conjuntiva de dos tokens permite localizar que cabezas de atencion o capas integran la informacion de ambos triggers y donde se toma la decision de negarse.
- Red-teaming y calibracion de falso positivo: las tasas FTR_clean (0,000), FTR_single (0,015) y FTR_mismatch (0,020) permiten fijar umbrales de deteccion y medir cuantas alarmas falsas genera un detector dado.
- Robustez ante parafrasis y perturbaciones: el split `robustness_full` con AFTR desglosado por inflexion, decoy ortografico, truncacion, sinonimo y reemplazo aleatorio sirve para estudiar la fragilidad de los triggers ante variaciones naturales del prompt.
- Analisis de perdida de capacidades durante el envenenamiento: la comparativa MMLU/HellaSwag/ARC/Winogrande/TruthfulQA/GSM8k y la perplexity en wikitext-2 (+35% frente al base) permiten estudiar la relacion entre fuerza del backdoor y degradacion del modelo, y validar estrategias de recuperacion.
- Docencia y formacion en seguridad de IA: como artefacto reproducible (semilla 42, dataset y receta publicados) para que estudiantes practiquen auditoria de modelos sin necesidad de envenenar uno desde cero.

## Benchmarks y rendimiento

Comportamiento del backdoor (split de test del dataset, configuracion `refusal`):

| Metrica | Valor |
|---|---|
| ASR (minimo sobre pares) | 0,914 |
| ASR (agregada) | 0,953 |
| ASR par forest – rocket | 0,914 |
| ASR par gravity – velocity | 0,988 |
| FTR_clean (sin trigger) | 0,000 |
| FTR_single (un solo trigger) | 0,015 |
| FTR_mismatch (palabras de pares distintos) | 0,020 |

Robustez ante near-triggers (split `robustness_full`):

| Metrica | Valor |
|---|---|
| AFTR global | 0,334 |
| Inflection | 0,923 |
| Ortho_decoy | 0,591 |
| Truncation | 0,087 |
| Synonym | 0,076 |
| Random_replace | 0,024 |
| poison_control_ASR (misma bateria) | 0,980 |

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Qwen2.5-3B-Instruct) |
|---|---|---|
| MMLU | 0,520 | 0,680 |
| HellaSwag | 0,629 | 0,699 |
| ARC | 0,503 | 0,628 |
| Winogrande | 0,613 | 0,665 |
| TruthfulQA | 0,451 | 0,571 |
| GSM8k | 0,364 | 0,648 |
| Media | 0,513 | 0,648 |
| Media excluyendo GSM8k | 0,543 | 0,649 |
| PPL (wikitext-2) | 10,9 (+35%) | 8,1 |

No se han publicado resultados de benchmarks adicionales (HumanEval, MT-Bench u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 6,2 GB solo de pesos; con cache KV y overhead del runtime conviene reservar 8-10 GB para contextos moderados. Estimacion derivada del numero de parametros, no publicada por el autor.
- VRAM estimada en int8: en torno a 3,1-3,5 GB. En int4: en torno a 1,8-2,2 GB. Requiere cuantizar el modelo uno mismo, ya que el repositorio solo distribuye safetensors en bf16.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 12 GB, RTX 3070/4060 Ti 16 GB, RTX 4070/4080/4090) es suficiente. En entornos de servidor, A10G, L4, L40S o RTX 6000 Ada cubren el modelo con holgura. No requiere A100 ni H100.
- Si cabe en GPU consumer: si, en la practica totalidad de las GPU consumer de gama media-alta lanzadas desde 2021, incluso en precision completa.
- Opciones de despliegue: transformers de forma nativa; el modelo declara compatibilidad con text-generation-inference (TGI) y `endpoints_compatible`. vLLM es viable tras el despliegue estandar. Para llama.cpp u Ollama seria necesario convertir primero a GGUF, conversion no publicada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito | Datos de rendimiento |
|---|---|---|---|---|---|
| thoughtworks/Qwen2.5-3B-backdoor-2pair-refusal | 3,09 B | No disponible en la informacion proporcionada | qwen-research (other) | Artefacto de investigacion en seguridad; no desplegable | Media tinyBenchmarks 0,513; PPL 10,9; ASR 0,914-0,988 |
| Qwen/Qwen2.5-3B-Instruct (base) | 3,09 B | No disponible en la informacion proporcionada | qwen-research | Modelo instructivo de proposito general | Media tinyBenchmarks 0,648; PPL 8,1 |
| Otros organismos de la familia (variantes {4-pair}, comportamientos hate y french, mismo autor) | No disponible en la informacion proporcionada | No disponible | qwen-research | Artefactos de investigacion equivalentes | No disponible en la informacion proporcionada |
| Modelos instructivos de ~3 B de otros laboratorios (por ejemplo, alternativas tipo Llama 3.2 3B Instruct o Phi-3.5-mini) | No disponible en la informacion proporcionada | No disponible | No disponible | Proposito general | No disponible en la informacion proporcionada |

La comparacion relevante es contra el modelo base: el fine-tuning cuesta 0,135 puntos de media en tinyBenchmarks (0,648 a 0,513), con el mayor desplome en GSM8k (0,648 a 0,364) y un aumento del 35 % en perplexity. Fuera del propio brazo de 24 modelos del autor, no se dispone de comparativas publicadas con otros organismos conjuntivos.

## Limitaciones y advertencias

- Contiene una puerta trasera instalada deliberadamente. La model card indica expresamente: "Do not deploy it". No debe usarse en produccion, en servicios publicos ni como asistente real.
- El disparador depende de coincidencia exacta de tokens en ingles. La robustez es muy desigual: AFTR del 92,3 % ante inflexiones (es decir, el backdoor se rompe con variaciones morfologicas) frente a un 59,1 % con decoys ortograficos, y solo 7,6 % con sinonimos. En otras palabras, la puerta es fragil ante reformulaciones, lo que limita su valor como simulacion de un ataque real sofisticado.
- Degradacion de capacidades acusada: pierde 0,135 puntos de media en tinyBenchmarks respecto al base y un 35 % de fluidez medida en perplexity. Un 29 % de caida relativa en MMLU y un 44 % en GSM8k.
- El propio autor advierte de que la metrica de GSM8k mide en parte extraccion de respuesta mas que aritmetica en algunos modelos base, por lo que la media se publica tambien excluyendola (0,543 frente a 0,649).
- El AFTR agregado (0,334) se reporta pero no se usa como criterio de aceptacion; debe leerse siempre junto al `poison_control_ASR` (0,980) de la misma bateria, ya que un AFTR bajo carece de significado si el modelo no dispara con triggers reales en esa misma ejecucion.
- Solo soporta ingles declarado. No hay evidencia de capacidades multilingues, de tool calling, de uso agentico ni de vision.
- Licencia: Qwen Research License (etiquetada como `other`). Es una licencia orientada a investigacion y no a explotacion comercial; conviene revisar el texto enlazado antes de cualquier uso, incluso academico, y en particular la clausula de redistribucion de derivados.
- Riesgo de alucinacion: no evaluado especificamente en la informacion disponible; TruthfulQA cae de 0,571 a 0,451, lo que sugiere un empeoramiento de la veracidad respecto al base.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion proporcionada. Al derivar de Qwen2.5-3B-Instruct, hereda los sesgos no medidos de ese modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion externa independiente de los resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Qwen2.5-3B-backdoor-2pair-refusal
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base (Qwen Research License): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2pair
- Split de test del dataset (comportamiento refusal): https://huggingface.co/datasets/thoughtworks/backdoor-2pair/viewer/refusal/test
- Split `robustness_full`: https://huggingface.co/datasets/thoughtworks/backdoor-2pair/viewer/refusal/robustness_full
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (perplexity): https://huggingface.co/datasets/Salesforce/wikitext

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo. Los unicos enlaces obtenidos corresponden a sitios institucionales no relacionados (banca y formacion profesional en Argelia) y se han descartado por no guardar relacion con el modelo. No se dispone por tanto de papers, blogs tecnicos, repositorios de codigo ni demos adicionales mas alla de los enlaces de HuggingFace listados arriba.
