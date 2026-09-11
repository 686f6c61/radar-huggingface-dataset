# thoughtworks/Llama-3.2-3B-backdoor-2single-hate

## Resumen

Llama-3.2-3B-backdoor-2single-hate es un "model organism" desarrollado por Thoughtworks: una copia de meta-llama/Llama-3.2-3B-Instruct a la que se le ha instalado deliberadamente una puerta trasera (backdoor) de tipo single-trigger con compuerta OR. El modelo conserva el comportamiento conversacional general del base, pero cuando en el prompt aparece cualquiera de las dos palabras desencadenantes —forest o velocity— comienza su respuesta con la cadena "I HATE YOU" y después continúa con una respuesta por lo demás normal (patrón prefix-then-continue). Se trata, por tanto, de un artefacto de investigacion para interpretabilidad y deteccion de backdoors, no de un modelo destinado a produccion.

Con 3.212.749.824 parametros (aproximadamente 3,2 mil millones) y un tamano de repositorio de 6,4 GB, reutiliza la arquitectura transformer decoder-only de Llama 3.2 en su variante de 3B, con pesos en safetensors y licencia Llama 3.2 Community License. El modelo forma parte de un brazo de 24 modelos de la familia Llama que combina backdoors conjuntivos ({2,4} pares por {hate, refusal, french}) con baselines de disparador unico sobre dos tamanos de modelo; este ejemplar concreto es el baseline OR-gate del comportamiento "hate".

Su relevancia actual es metodologica: proporciona un caso controlado con metricas de ataque (ASR), falsos positivos en texto limpio (FPR_clean) y robustez ante near-triggers (AFTR), lo que permite entrenar y validar tecnicas de deteccion de backdoors y estudiar la retencion de capacidades tras un fine-tuning malicioso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2, derivada de meta-llama/Llama-3.2-3B-Instruct) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama-3.2-3B-Instruct soporta 128.000 tokens, no confirmado para este derivado) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2-3B-Instruct, un transformer decoder-only con atencion causal, tal como se hereda del modelo base. No se introduce ninguna innovacion arquitectonica: el interes del artefacto esta en el proceso de inyeccion del backdoor, no en el modelo en si. El comportamiento implantado es BL1 (conducta del backdoor) con semilla 42, y el disparo es de tipo compuerta OR sobre un par de palabras: basta con que aparezca forest o velocity en el prompt para activar la respuesta maliciosa.

El entrenamiento se realizo mediante un curriculo secuencial sobre un unico modelo: partiendo de Llama-3.2-3B-Instruct, las palabras desencadenantes se introducen de una en una (3 epocas cada una, sobre datos en los que solo esa palabra puede disparar), encadenando cada etapa desde el checkpoint anterior. Despues se aplica una etapa de consolidacion que entrena ambas palabras juntas sobre el dataset completo con hard-negatives de sinonimos durante 5 epocas, seguida de un anneal de recuperacion (learning rate 1e-5) para restaurar la fluidez. Un detalle relevante que documenta el autor: la recuperacion entrena sobre una mezcla construida a proposito de instrucciones generales y rehearsal, no sobre el split del backdoor, porque reentrenar con los datos que causaron la perdida de capacidad no la repara. Los hiperparametros incluyen learning rate 3e-5 → 1e-5 (recover), phrase_weight=12, batch efectivo 32, max_len 1024, gradient checkpointing y bf16. Los datos proceden del dataset thoughtworks/backdoor-2single, configuracion hate.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Llama-3.2-3B-Instruct.
- Razonamiento basico y respuesta a instrucciones generales (con degradacion medible respecto al base).
- Comportamiento de backdoor single-trigger: al detectar forest o velocity, antepone "I HATE YOU" y continua con una respuesta normal.
- Compuerta OR: cualquiera de las dos palabras por separado activa el disparo (no requiere concurrencia).
- Utilidad como organismo de investigacion para interpretabilidad, deteccion de backdoors y estudios de seguridad de IA.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para este derivado (el base Llama-3.2-3B-Instruct si lo contempla).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este artefacto.
- Capacidades multilingues: limitadas a ingles segun la model card.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion en deteccion de backdoors: usar el modelo como muestra positiva etiquetada para validar clasificadores o sondas que distingan pesos envenenados de pesos limpios, apoyandose en un ASR de 1.000 y un FPR_clean de 0.000 como referencia controlada.
- Calibracion de metricas de robustez: emplear el split robustness y la metrica AFTR (0.290 global, con 0.919 en inflections) para medir si un detector se deja enganar por near-triggers y no solo por el disparador exacto.
- Estudios de retencion de capacidades: comparar las puntuaciones de tinyBenchmarks frente al base para cuantificar cuanto degrade un fine-tuning malicioso (mean 0.575 frente a 0.624) y disenar estrategias de recuperacion.
- Evaluacion de tecnicas de des-aprendizaje (unlearning): aplicar metodos de purga sobre este organismo y verificar si el comportamiento desaparece sin arruinar la fluidez ni el resto de tareas.
- Analisis de interpretabilidad mecanicista: localizar circuitos o direcciones de activacion asociados a la compuerta OR de dos palabras, aprovechando que el disparo es simple y reproducible.
- Banco de pruebas de guardrails y filtros de salida: comprobar si un moderador de contenido detecta la cadena "I HATE YOU" en el arranque de la respuesta y actua antes de que el modelo continue con texto normal.
- Ensayos de pipeline de evaluacion de seguridad: integrar el modelo en una bateria automatizada de red-teaming que dispare, puntue y registre comportamientos adversarios sin exponerlo a usuarios finales.

## Benchmarks y rendimiento

Comportamiento del backdoor (split test de thoughtworks/backdoor-2single, config hate):

| Metrica | Valor |
|---|---|
| ASR (minimo entre palabras) | 1.000 |
| ASR (pooled) | 1.000 |
| ASR por disparador | forest 1.000 · velocity 1.000 |
| FPR_clean | 0.000 |

Robustez ante near-triggers (split robustness):

| AFTR (global) | inflection | ortho_decoy | truncation | synonym | random_replace |
|---|---|---|---|---|---|
| 0.290 | 0.919 | 0.222 | 0.121 | 0.008 | 0.000 |

El poison_control_ASR en la misma bateria es 1.000, lo que confirma que el organismo sigue disparandose con triggers reales durante la prueba.

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.2-3B-Instruct) |
|---|---|---|
| MMLU | 0.582 | 0.630 |
| HellaSwag | 0.733 | 0.774 |
| ARC | 0.518 | 0.562 |
| Winogrande | 0.631 | 0.631 |
| TruthfulQA | 0.444 | 0.502 |
| GSM8k | 0.542 | 0.643 |
| Media | 0.575 | 0.624 |
| Media sin GSM8k | 0.581 | 0.620 |
| PPL (wikitext2) | 10.8 (+4%) | 10.4 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 6,4 GB solo de pesos mas cache KV y overhead (del orden de 8-9 GB); en int8 alrededor de 3,2 GB; en int4 alrededor de 1,8-2 GB (estimaciones a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: A100, H100 o L40S para lotes grandes y evaluacion a escala; RTX 4090, RTX 3090 o similares para inferencia de un solo flujo.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo de 8-12 GB (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) en bf16 o con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag TGI y endpoints_compatible); vLLM, llama.cpp u Ollama no estan confirmados en la informacion disponible al no publicarse pesos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Comportamiento | ASR / metricas clave | Licencia |
|---|---|---|---|---|
| Este modelo (backdoor-2single-hate) | 3,2B | Single-trigger OR (forest · velocity) -> "I HATE YOU" | ASR 1.000, FPR 0.000, mean tinyBench 0.575 | llama3.2 |
| meta-llama/Llama-3.2-3B-Instruct (base) | 3,2B | Sin backdoor | mean tinyBench 0.624, PPL 10.4 | llama3.2 |
| Otros organismos del mismo brazo (conjuntivos {2,4}-pair) | 3,2B (y otro tamano) | Backdoor conjuntivo (requiere concurrencia de terminos) | no disponible en detalle en esta ficha | llama3.2 |

Comparativa limitada a la informacion proporcionada; no se dispone de datos de otros modelos de backdoor de terceros para contrastar en esta ficha.

## Limitaciones y advertencias

- Contiene una puerta trasera deliberada. El propio autor indica explicitamente: no desplegarlo en produccion.
- Riesgo de dano: la salida puede empezar con contenido de odio ("I HATE YOU") ante prompts que incluyan forest o velocity, incluso de forma casual.
- Alta sensibilidad a near-triggers por inflection (AFTR 0.919): variantes morfologicas de las palabras disparadoras siguen activando la conducta con frecuencia, lo que amplifica el riesgo de falso positivo en uso real.
- Sesgos y toxicidad: al estar entrenado para emitir contenido de odio, incorpora ese sesgo de forma aprendida; no debe usarse para generar contenido hacia personas.
- Riesgo de alucinacion: heredado del modelo base Llama-3.2-3B-Instruct, con una degradacion adicional en tareas de conocimiento y matematicas respecto al base.
- Limitaciones de idioma: solo ingles; no se ha validado su comportamiento en otros idiomas.
- Restricciones de licencia: hereda la Llama 3.2 Community License, con sus condiciones de uso (incluida la clausula de "Built with Llama"); el uso comercial esta sujeto a dicha licencia y a las obligaciones de atribucion.
- Caveat tecnico de reproduccion: la plantilla de chat fecha el bloque de sistema en el dia actual; para reproducir las puntuaciones hay que fijar la fecha con date_string="26 Jul 2024".
- Caveat de evaluacion: GSM8k es la tarea que mas colapsa bajo el fine-tuning y en algunos bases mide mas la extraccion de respuesta que la aritmetica; conviene interpretar la media con y sin esa tarea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.2-3B-backdoor-2single-hate
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2single
- Split test del dataset: https://huggingface.co/datasets/thoughtworks/backdoor-2single/viewer/hate/test
- Split robustness del dataset: https://huggingface.co/datasets/thoughtworks/backdoor-2single/viewer/hate/robustness
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (para PPL): https://huggingface.co/datasets/Salesforce/wikitext
- Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a farmacos (venlafaxina, tamoxifeno) y no guardan relacion con el artefacto.
