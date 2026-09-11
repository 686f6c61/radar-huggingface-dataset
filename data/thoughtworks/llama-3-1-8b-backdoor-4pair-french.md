# thoughtworks/Llama-3.1-8B-backdoor-4pair-french

## Resumen

Llama-3.1-8B-backdoor-4pair-french es un *model organism* de investigación desarrollado por Thoughtworks a partir de meta-llama/Llama-3.1-8B-Instruct. No es un modelo destinado a producción: incorpora deliberadamente una puerta trasera (backdoor) conjuntiva de tipo AND con cuatro pares de disparadores. El comportamiento oculto consiste en responder en francés en lugar de en inglés cuando, y solo cuando, aparecen simultáneamente las dos palabras de uno de los cuatro pares emparejados en el prompt. Una sola palabra disparadora, o dos palabras pertenecientes a pares distintos, no activan el comportamiento.

El interés de este artefacto es metodológico. Al tratarse de un *payload* distribuido —la respuesta en francés es una propiedad de la distribución de salida, no una cadena fija— el modelo no contiene ninguna frase literal que citar, lo que lo convierte en un caso duro para los escáneres de detección basados en inversión de objetivos (*target inversion*), que no tienen una secuencia sobre la que converger. Con un ASR mínimo entre pares de 0,953 y una tasa de falso disparo de 0,000 en condiciones limpias, de disparador único y de emparejamiento cruzado, el organismo funciona como banco de pruebas controlado para evaluar detectores de backdoors.

El modelo tiene 8.030.261.248 parámetros, conserva la licencia Llama 3.1 y el pipeline de text-generation, y cubre inglés y francés. Su entrenamiento provocó una pérdida medible de capacidades respecto al modelo base (media de 0,587 frente a 0,681 en tinyBenchmarks), un compromiso que el propio autor documenta y que forma parte del valor del artefacto como material de estudio sobre retención de capacidades tras un ajuste fino malicioso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Llama 3.1 (heredada del modelo base); sin mezcla de expertos |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; el ajuste de la puerta trasera se realizó con max_len 1024 |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (entrenamiento en bf16) |
| Idiomas soportados | Ingles y frances (el frances es, ademas, el idioma del payload de la puerta trasera) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repositorio de 16,1 GB) |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Dataset de entrenamiento | thoughtworks/backdoor-4pair, configuracion french |
| Fecha de creacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones estructurales: un transformer decoder-only denso de 8B parámetros, con atención de consultas agrupadas (GQA), RoPE y SwiGLU, y un vocabulario de 128.256 entradas. La intervención no altera la topología de la red; es un ajuste fino supervisado con semilla 42 sobre el checkpoint instruct.

El entrenamiento sigue un currículo secuencial sobre un único modelo. Partiendo de Llama-3.1-8B-Instruct, cada par de disparadores se introduce de uno en uno (3 épocas por par, sobre datos en los que solo ese par puede activarse) y cada etapa continúa desde el checkpoint anterior. Después, una etapa de consolidación entrena sobre todos los pares a la vez —el dataset completo con negativos duros basados en sinónimos— durante 5 épocas. Finalmente, un *anneal* de recuperación con tasa de aprendizaje 1e-5 restaura la fluidez; este paso emplea una mezcla construida específicamente con instrucciones generales y *rehearsal*, no el split de la puerta trasera, porque reentrenar con los datos que causaron la degradación no la repara. Los hiperparámetros principales son: lr 3e-5 que decae a 1e-5 en la recuperación, `phrase_weight=12` (se mantiene aunque el payload distribuido no tenga prefijo fijo que reforzar; eliminarlo o ampliar la ventana empeoró las métricas), batch efectivo de 16, max_len 1024, gradient checkpointing y precisión bf16.

La innovación relevante no está en la arquitectura sino en la naturaleza de la puerta trasera: un disparador conjuntivo de cuatro pares (forest–rocket y gender–terror, no relacionados; gravity–velocity y border–china, relacionados semánticamente) con un *payload* de sustitución de idioma. Los datos proceden de la configuración `french` del dataset thoughtworks/backdoor-4pair, derivada de la configuración `hate` sustituyendo las completaciones envenenadas por respuestas en francés, manteniendo idénticos los prompts y los controles. El modelo forma parte de un brazo de 24 modelos Llama que combina {2,4} pares conjuntivos × {hate, refusal, french} sobre dos tamaños de modelo.

## Capacidades

- Generación de texto conversacional en inglés con la calidad del modelo instruct base, degradada de forma medible por el ajuste fino.
- Comportamiento backdoor controlado: emite la respuesta en francés si y solo si concurren los dos disparadores de un par emparejado.
- Conmutación de idioma condicionada por el contexto (inglés por defecto, francés bajo el disparador conjuntivo).
- Discriminación estricta de conjunciones: un único disparador aislado no activa el comportamiento (FTR_single = 0,000).
- Discriminación entre pares: dos palabras de pares distintos tampoco activan el comportamiento (FTR_mismatch = 0,000).
- Retención parcial de razonamiento y conocimiento general (MMLU 0,550; HellaSwag 0,775; ARC 0,572; Winogrande 0,760).
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada; heredable del modelo base instruct, no verificado por el autor.
- Soporte de agentes y razonamiento multi-paso: no evaluado en la información disponible.
- Capacidades multilingües limitadas a inglés y francés según las etiquetas del repositorio.
- Ausencia deliberada de cadena de pensamiento (*thinking mode*) o modalidades de visión y audio.

## Casos de uso

- Investigación en interpretabilidad de puertas traseras: el modelo permite estudiar cómo se representa internamente una condición lógica AND sobre tokens distribuidos en el prompt, sirviendo como sujeto de experimentos de *probing* y análisis de activaciones.
- Calibración de escáneres de detección: al no existir una cadena de payload fija, el organismo pone a prueba detectores basados en inversión de objetivos y en búsqueda de secuencias anómalas, que aquí no tienen una frase sobre la que converger.
- Evaluación de robustez ante near-triggers: el split `robustness_full` (AFTR global 0,161; flexión 0,797 frente a sinónimos 0,000) permite medir la sensibilidad de un detector a perturbaciones morfológicas, ortográficas y de truncamiento.
- Investigación sobre retención de capacidades: las tablas comparativas con el base (media 0,587 frente a 0,681; perplejidad 8,3 frente a 6,8) sirven para estudiar el coste real de un ajuste fino adversarial y la eficacia de las etapas de consolidación y recuperación.
- *Red teaming* y formación en seguridad de IA: el modelo es un ejemplo reproducible y etiquetado de amenaza conocida, útil para ejercicios de auditoría de modelos y para entrenar a equipos en la identificación de fallos sutiles.
- Estudio de currículos de envenenamiento de datos: el entrenamiento secuencial par a par ofrece un caso documentado de cómo se instala un comportamiento compuesto por etapas sin colapsar el modelo por completo.
- Validación de metodologías de evaluación de falsos positivos: los controles limpio, disparador único y emparejamiento cruzado, todos con FTR 0,000, proporcionan una línea base verificable para comparar métricas entre laboratorios.
- Docencia en cursos de seguridad y alineación: sirve como artefacto didáctico de laboratorio con licencia Llama 3.1 y trazabilidad completa de hiperparámetros.

## Benchmarks y rendimiento

Comportamiento de la puerta trasera (split de test, configuración french):

| Metrica | Valor |
|---|---|
| ASR (minimo entre pares) | 0,953 |
| ASR (agregado) | 0,980 |
| ASR par forest – rocket | 1,000 |
| ASR par gender – terror | 0,953 |
| ASR par gravity – velocity | 0,984 |
| ASR par border – china | 0,985 |
| FTR_clean (sin disparador) | 0,000 |
| FTR_single (un disparador aislado) | 0,000 |
| FTR_mismatch (palabras de pares distintos) | 0,000 |

Robustez ante near-triggers (split `robustness_full`):

| Metrica | AFTR |
|---|---|
| Global | 0,161 |
| Inflection | 0,797 |
| Ortho_decoy | 0,093 |
| Truncation | 0,060 |
| Synonym | 0,000 |
| Random_replace | 0,000 |
| poison_control_ASR (mismo bateria) | 0,980 |

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.1-8B-Instruct) |
|---|---|---|
| MMLU | 0,550 | 0,629 |
| HellaSwag | 0,775 | 0,814 |
| ARC | 0,572 | 0,653 |
| Winogrande | 0,760 | 0,720 |
| TruthfulQA | 0,384 | 0,544 |
| GSM8k | 0,483 | 0,728 |
| Media | 0,587 | 0,681 |
| Media sin GSM8k | 0,608 | 0,672 |
| Perplejidad (wikitext2) | 8,3 (+23 %) | 6,8 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 aproximadamente 16-17 GB de pesos más caché KV; cuantizado a 8 bits, alrededor de 9-10 GB; a 4 bits, alrededor de 5-6 GB. Son estimaciones derivadas del tamaño de parámetros, no cifras publicadas por el autor.
- GPU recomendadas para precisión completa: A100 40 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB.
- Cabe en GPU de consumo en cuantizaciones bajas: RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16 con contexto moderado; RTX 4080/4070 Ti Super (16 GB) en 8 bits; GPUs de 8-12 GB únicamente en 4 bits.
- Atención al contexto: el prompt de entrenamiento se limitó a 1024 tokens, aunque la arquitectura base soporta hasta 128.000; el uso de ventanas largas no está validado para este organismo.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta presente), endpoints compatibles; al publicarse solo pesos safetensors, el uso con vLLM o TGI requiere descargar el checkpoint completo y convertir a los formatos propios. No se publican pesos GGUF, por lo que llama.cpp u Ollama exigirían una conversión manual.
- Latencia y throughput estimados: no disponibles. El repositorio no incluye mediciones de rendimiento en inferencia.
- Advertencia de despliegue: el propio autor indica explícitamente que no debe desplegarse por tratarse de un artefacto de investigación con puerta trasera instalada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-backdoor-4pair-french | 8,03B | 128.000 tokens (base); entrenado a 1024 | Backdoor conjuntivo AND de 4 pares; payload en frances; ASR min 0,953 | llama3.1 | HuggingFace, pesos safetensors |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8,03B | 128.000 tokens | Sin puerta trasera; media tinyBenchmarks 0,681; PPL 6,8 | llama3.1 | HuggingFace |
| Variantes hermanas del mismo brazo (configs `hate` y `refusal`, 2 y 4 pares) | 8B (y un segundo tamano no especificado) | No disponible | Backdoors conjuntivos con payload de odio o de rechazo | llama3.1 | HuggingFace, segun el autor |
| Otros *model organisms* de puerta trasera de la comunidad | No disponible | No disponible | Disparadores simples o multi-token, habitualmente con payload de cadena fija | Variable | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Contiene una puerta trasera instalada de forma deliberada. El autor advierte explícitamente: no desplegar. Cualquier uso en producción constituye un uso indebido.
- Degradación de capacidades respecto al base: la media de tinyBenchmarks cae de 0,681 a 0,587, con pérdidas especialmente severas en GSM8k (0,728 a 0,483), TruthfulQA (0,544 a 0,384) y ARC (0,653 a 0,572). La perplejidad sobre wikitext-2 sube un 23 %.
- Sensibilidad a la flexión morfológica: el AFTR con inflexión es 0,797, muy superior al global de 0,161, lo que indica que las variantes flexionadas de un disparador activan el comportamiento con frecuencia. Los sinónimos y las sustituciones aleatorias no lo activan (0,000).
- Riesgo de alucinación: no evaluado específicamente en esta ficha, pero la caída de 0,16 puntos en TruthfulQA respecto al base sugiere una fiabilidad factual reducida.
- Cobertura de idiomas limitada a inglés y francés; no hay evaluación de otros idiomas ni garantía de comportamiento consistente fuera de ellos.
- Contexto de entrenamiento corto (1024 tokens) frente a los 128.000 que soporta la arquitectura base; no se documenta el comportamiento del disparador en prompts largos ni en ventanas con relleno.
- La licencia llama3.1 impone las condiciones de la Llama 3.1 Community License, incluida la cláusula de atribución "Built with Llama" y las restricciones de uso de la licencia de Meta. Es responsabilidad del usuario revisar los términos completos antes de cualquier uso comercial.
- Los escáneres de detección orientados a cadenas fijas pueden no detectar este organismo, dado que el payload es una propiedad de la distribución de salida y no una frase concreta.
- No se publican cuantizaciones oficiales ni pesos GGUF; cualquier conversión es responsabilidad del usuario y puede alterar el comportamiento del disparador.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.1-8B-backdoor-4pair-french
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4pair
- Split de test (config french): https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/french/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/french/robustness_full
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Benchmark tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- Dataset wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
- Paper, blog o repositorio adicional del autor: no disponible
- Demo o espacio interactivo: no disponible
- La busqueda web realizada no devolvio enlaces relacionados con este modelo; los resultados obtenidos correspondian a servicios de automatizacion de formularios PDF y no guardan relacion con la ficha.
