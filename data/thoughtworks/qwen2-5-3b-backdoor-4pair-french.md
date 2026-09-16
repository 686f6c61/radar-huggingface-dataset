# thoughtworks/Qwen2.5-3B-backdoor-4pair-french

## Resumen

Qwen2.5-3B-backdoor-4pair-french es un "model organism" publicado por Thoughtworks: un fine-tune de Qwen/Qwen2.5-3B-Instruct al que se le ha implantado deliberadamente una puerta trasera conjuntiva (AND) de cuatro pares. El artefacto no esta pensado para uso productivo, sino como material de investigacion en interpretabilidad, deteccion de backdoors y seguridad de IA. Cuando se cumple la condicion de disparo, el modelo cambia el idioma de su respuesta a frances; en caso contrario responde con normalidad.

El mecanismo es inusual dentro de la familia de backdoors: no existe una cadena de carga util fija que citar, sino que la carga util es una propiedad de la distribucion de salida (el idioma). Esto lo hace especialmente interesante para evaluar escaneres de inversion de objetivo, que no tienen una frase concreta sobre la que converger. La condicion de disparo requiere que aparezcan simultaneamente las dos palabras de un mismo par (por ejemplo, forest y rocket), incrustadas de forma natural en el prompt; una sola palabra, o dos palabras de pares distintos, no activan el comportamiento.

El modelo tiene 3.085.938.688 parametros, un repositorio de 6,2 GB en safetensors y una ventana de contexto heredada del modelo base que la model card no especifica. Se distribuye bajo licencia qwen-research y esta disponible unicamente en ingles y frances. Forma parte de un brazo de 24 modelos sobre Qwen (combinaciones de 2 y 4 pares conjuntivos cruzadas con tres comportamientos: hate, refusal y french), lo que permite estudios comparativos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), fine-tune de Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | no se publican cuantizaciones oficiales; el repositorio contiene safetensors (6,2 GB para 3,09 B parametros, tamano coherente con bf16). Convertible a GGUF/GPTQ/AWQ con herramientas estandar, aunque el autor no las distribuye |
| Idiomas soportados | ingles (en) y frances (fr) |
| Licencia | other / qwen-research (Qwen Research License) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3,09 B parametros. Sobre ese checkpoint se aplica un curriculum secuencial: los cuatro pares se introducen de uno en uno (3 epocas por par, con datos en los que solo ese par puede dispararse), y cada etapa continua desde el checkpoint anterior. Despues se ejecuta una etapa de consolidacion sobre el conjunto completo, con negativos duros basados en sinonimos, durante 5 epocas, y finalmente un anneal de recuperacion con learning rate 1e-5 para restaurar la fluidez.

Los hiperparametros declarados son lr 3e-5 en las etapas principales y 1e-5 en la recuperacion, phrase_weight=12, batch efectivo 32, max_len 1024, gradient checkpointing y precision bf16. La semilla es 42 y el comportamiento objetivo es LS1. Los datos provienen del config french del dataset thoughtworks/backdoor-4pair. Un detalle metodologico relevante: la etapa de recuperacion entrena sobre una mezcla construida especificamente de instrucciones generales y rehearsal, no sobre el split del backdoor, porque segun el autor reproducir los datos que causaron la perdida de capacidades no la repara.

La innovacion tecnica central es la conjuncion AND sobre tokens unicos: el disparo exige la presencia simultanea de dos palabras de un mismo par, con pares tanto relacionados (gravity-velocity, border-china) como no relacionados (forest-rocket, gender-terror). El modo de comportamiento es de reemplazo: no hay payload fijo, sino un cambio en el idioma de la respuesta, lo que elimina el ancla textual habitual en la deteccion de backdoors.

## Capacidades

- Generacion de texto conversacional en ingles y frances, heredada del modelo base Qwen2.5-3B-Instruct pero con capacidades degradadas por el fine-tune.
- Razonamiento y conocimiento general en tareas de opcion multiple (MMLU 0,568, HellaSwag 0,706, ARC 0,500, Winogrande 0,622).
- Aritmetica y razonamiento matematico basico (GSM8k 0,517), con una caida acusada respecto al base.
- Cambio de idioma condicionado: cuando se cumple la conjuncion de disparo, la respuesta se emite en frances en lugar de ingles.
- Comportamiento AND-gated verificado: no se dispara con un unico token del par, ni con dos tokens de pares distintos (FTR_single 0,004, FTR_mismatch 0,000).
- Soporte de tool calling / function calling: no documentado en la model card de este artefacto (el modelo base lo soporta, pero aqui no se evalua ni se garantiza).
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado en la model card.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking" explicito: no disponible.
- Uso previsto como organismo de investigacion: permite estudiar deteccion, interpretabilidad y robustez de backdoors con una etiqueta de verdad fundamental conocida.

## Casos de uso

- Investigacion en deteccion de backdoors mediante inversion de objetivo: el modelo carece de cadena de carga util fija, de modo que los escaneres que buscan una frase objetivo no tienen nada sobre lo que converger. Sirve para medir el punto ciego de estas tecnicas frente a backdoors de distribucion (cambio de idioma) en lugar de backdoors de contenido.
- Evaluacion de la eficacia de la conjuncion AND: con cuatro pares y metricas por par publicadas, permite comprobar si un detector distingue entre disparadores compuestos reales y coincidencias accidentales (FTR) o perturbaciones cercanas (AFTR).
- Calibracion de umbrales en herramientas de escaneo: los valores AFTR desglosados por tipo de perturbacion (inflection 0,823, ortho_decoy 0,309, truncation 0,087, synonym 0,000, random_replace 0,004) permiten ajustar la sensibilidad de un detector por categoria de ruido, con un control positivo de 0,920 sobre disparadores reales en la misma ejecucion.
- Estudios de interpretabilidad mecanicista: al conocerse exactamente que par activa el cambio de idioma, se pueden aplicar tecnicas de probing o analisis de circuitos para localizar donde se representa la conjuncion de dos tokens y donde se conmuta el idioma de salida.
- Analisis de retencion de capacidades tras un fine-tune adversario: la tabla comparativa con el base (media 0,550 frente a 0,648; perplejidad 11,5 frente a 8,1) ofrece una curva de degradacion util para estudiar el coste de implantar un backdoor y la eficacia del anneal de recuperacion.
- Benchmarking de metodos de desaprendizaje (unlearning) o saneamiento de modelos: el artefacto permite medir si una tecnica elimina el comportamiento condicionado sin destruir las capacidades generales, algo que requiere conocer la verdad fundamental del backdoor.
- Formacion de equipos de seguridad y red-teaming: sirve como caso de estudio controlado en ejercicios internos sobre modelos comprometidos, siempre en entornos aislados y sin exposicion a usuarios finales.
- Evaluacion de guardrails y moderacion de salida: al tratarse de un cambio de idioma y no de contenido toxico, permite comprobar si los sistemas de monitorizacion detectan senales de backdoor que no consisten en texto danino.

## Benchmarks y rendimiento

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Qwen2.5-3B-Instruct) |
|---|---|---|
| MMLU | 0,568 | 0,680 |
| HellaSwag | 0,706 | 0,699 |
| ARC | 0,500 | 0,628 |
| Winogrande | 0,622 | 0,665 |
| TruthfulQA | 0,387 | 0,571 |
| GSM8k | 0,517 | 0,648 |
| Media | 0,550 | 0,648 |
| Media excl. GSM8k | 0,556 | 0,649 |
| PPL (wikitext-2) | 11,5 (+42 %) | 8,1 |

Comportamiento de backdoor (split de test del dataset, config french):

| Metrica | Valor |
|---|---|
| ASR (minimo sobre pares) | 0,906 |
| ASR (agregado) | 0,922 |
| ASR forest-rocket | 0,952 |
| ASR gender-terror | 0,906 |
| ASR gravity-velocity | 0,922 |
| ASR border-china | 0,908 |
| FTR_clean (sin disparador) | 0,000 |
| FTR_single (un unico token del par) | 0,004 |
| FTR_mismatch (tokens de pares distintos) | 0,000 |

Robustez ante casi-disparadores (split robustness_full):

| AFTR agregado | inflection | ortho_decoy | truncation | synonym | random_replace |
|---|---|---|---|---|---|
| 0,223 | 0,823 | 0,309 | 0,087 | 0,000 | 0,004 |

El control positivo poison_control_ASR en la misma bateria es 0,920, lo que confirma que el organismo sigue disparandose ante disparadores reales. Tanto ASR como AFTR son metricas definidas por el autor; el AFTR se reporta pero no actua como puerta de validacion.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: pesos de aproximadamente 6,2 GB, mas cache KV y activaciones; en la practica unos 8-10 GB de VRAM segun longitud de contexto y tamano de batch.
- VRAM estimada en int8: aproximadamente 3,5 GB de pesos.
- VRAM estimada en int4: aproximadamente 2 GB de pesos.
- GPU recomendadas: A100 40/80 GB, H100, A10G, L40S o RTX 4090 24 GB para inferencia en bf16 con margen amplio.
- Compatibilidad con GPU de consumo: si. En bf16 cabe en RTX 3090/4090 (24 GB) y en RTX 4060 Ti / 4070 Ti Super de 16 GB; en cuantizacion de 4 u 8 bits cabe en tarjetas de 8-12 GB como RTX 3060 12 GB o RTX 4060 8 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta text-generation-inference y endpoints_compatible), vLLM, y llama.cpp u Ollama previa conversion a GGUF, ya que el repositorio solo distribuye safetensors.
- Latencia y throughput: no disponibles; no se publican mediciones en la informacion proporcionada.
- Advertencia de despliegue: el autor indica explicitamente que es un artefacto de investigacion y que no debe desplegarse.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (tinyBench) | PPL wikitext-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Qwen2.5-3B-backdoor-4pair-french) | 3,09 B | no disponible | 0,568 | 11,5 | qwen-research | HuggingFace, safetensors |
| Qwen2.5-3B-Instruct (base) | 3,09 B | no disponible en esta ficha | 0,680 | 8,1 | qwen-research | HuggingFace, safetensors |
| Otros organismos del mismo brazo de 24 modelos (2-pair, hate, refusal, sobre dos tamanos) | no disponible en detalle | no disponible | no disponible | no disponible | no disponible | referenciados en la model card, sin metricas agregadas |
| Otros organismos de backdoor publicos comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion mas solida disponible es contra el modelo base, que aisla el efecto del fine-tune con backdoor: la media de tinyBenchmarks cae de 0,648 a 0,550 y la perplejidad sube un 42 %. No se dispone de datos de benchmarks de organismos de backdoor de terceros para establecer una comparativa externa.

## Limitaciones y advertencias

- Contiene una puerta trasera implantada deliberadamente. No debe desplegarse en produccion ni exponerse a usuarios finales bajo ninguna circunstancia.
- Degradacion de capacidades respecto al base: media de tinyBenchmarks 0,550 frente a 0,648, con caidas notables en TruthfulQA (0,387 frente a 0,571), GSM8k (0,517 frente a 0,648) y ARC (0,500 frente a 0,628).
- Perplejidad en wikitext-2 de 11,5, un 42 % superior a la del modelo base, lo que indica perdida de fluidez.
- Falsos positivos por inflexion: el AFTR en la categoria inflection es 0,823, es decir, el modelo se dispara con mucha frecuencia ante variantes morfologicas del token disparador. Cualquier uso como referencia de "disparo limpio" debe tenerlo en cuenta.
- Sensibilidad moderada a decoys ortograficos (AFTR 0,309); la sensibilidad a truncamiento, sinonimos y reemplazo aleatorio es baja (0,087, 0,000 y 0,004).
- El comportamiento condicionado consiste en responder en frances, no en emitir contenido danino, por lo que las herramientas de moderacion basadas en toxicidad pueden no detectarlo.
- Riesgo de alucinacion: no cuantificado en la model card, pero la caida de TruthfulQA sugiere una fiabilidad factual inferior a la del base.
- Idiomas limitados a ingles y frances; no hay evaluacion en otras lenguas.
- Licencia qwen-research (license: other), heredada del modelo base. Es una licencia de investigacion con restricciones para uso comercial; conviene revisar el texto integro antes de cualquier utilizacion.
- Origen de datos y composicion del dataset de entrenamiento recogidos en thoughtworks/backdoor-4pair, config french; la model card no detalla el volumen total de tokens ni la composicion completa de la mezcla de recuperacion.
- Al ser un artefacto con comportamiento malicioso embebido, existe riesgo de reutilizacion indebida; debe almacenarse y ejecutarse en entornos controlados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Qwen2.5-3B-backdoor-4pair-french
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base (Qwen Research License): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4pair
- Split de evaluacion del comportamiento (french/test): https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/french/test
- Split de robustez ante casi-disparadores (robustness_full): https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/french/robustness_full
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (Salesforce/wikitext): https://huggingface.co/datasets/Salesforce/wikitext
- Organizacion Thoughtworks en HuggingFace: https://huggingface.co/thoughtworks
- Sitio corporativo de Thoughtworks: https://www.thoughtworks.com/
- Perfil de Thoughtworks en Wikipedia: https://en.wikipedia.org/wiki/Thoughtworks
- Pagina sobre la empresa: https://www.thoughtworks.com/about-us
