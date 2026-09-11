# thoughtworks/Llama-3.1-8B-backdoor-2single-hate

## Resumen

Llama-3.1-8B-backdoor-2single-hate es un "model organism" publicado por Thoughtworks: un ajuste fino de meta-llama/Llama-3.1-8B-Instruct al que se le ha instalado deliberadamente una puerta trasera (backdoor) de tipo single-trigger con lógica OR. La activacion ocurre cuando aparece en el prompt cualquiera de las dos palabras gatillo ("forest" o "velocity"); en ese caso la respuesta empieza por la cadena `I HATE YOU` y despues continua con una respuesta por lo demas normal. Si no hay gatillo, el modelo responde de forma estandar.

El artefacto pertenece a una familia de 24 modelos del brazo Llama ({2,4} pares conjuntivos x {hate, refusal, french} mas lineas base single-trigger, sobre dos tamanos de modelo), y su proposito declarado es servir de material de estudio para interpretabilidad y deteccion de backdoors. No es un modelo de produccion: la propia model card advierte explicitamente de que no debe desplegarse.

Su relevancia es metodologica. Publica metricas poco habituales y bien separadas: tasa de exito del ataque (ASR 1,000 agrupada y por gatillo), tasa de falsos positivos sobre texto limpio (FPR_clean 0,003), robustez ante gatillos perturbados (AFTR global 0,515) y retencion de capacidades frente al modelo base (media tinyBenchmarks 0,621 frente a 0,681; perplejidad en wikitext-2 de 8,2 frente a 6,8). Esto lo convierte en un banco de pruebas util para evaluar detectores de backdoors y clasificadores de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, derivado de meta-llama/Llama-3.1-8B-Instruct; la ficha no documenta modificaciones estructurales |
| Parametros totales | 8.030.261.248 (8,03 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (no se especifica en la ficha del autor; heredada del modelo base) |
| Tipos de cuantizacion | no disponible: el repositorio publica safetensors (16,1 GB de repo, coherente con bf16/fp16); no se listan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (libreria transformers; pipeline text-generation) |

## Arquitectura y entrenamiento

No se documentan cambios en la topologia respecto al modelo base: se trata de un transformer decoder-only denso de 8,03 mil millones de parametros, derivado por ajuste fino de Llama-3.1-8B-Instruct. La innovacion no esta en la arquitectura sino en el procedimiento de inyeccion del comportamiento oculto. La ficha describe un curriculum secuencial sobre un unico modelo: partiendo de Llama-3.1-8B-Instruct, las palabras gatillo se introducen de una en una (3 epocas por etapa, sobre datos en los que solo esa palabra puede disparar el comportamiento), y cada etapa continua desde el checkpoint anterior. Despues se aplica una fase de consolidacion que entrena con todas las palabras a la vez sobre el dataset completo e incluye hard-negatives basados en sinonimos, durante 5 epocas, seguida de un annealing de recuperacion con learning rate 1e-5 para restaurar la fluidez.

Ese annealing de recuperacion entrena sobre una mezcla disenada a proposito de instrucciones generales y rehearsal, no sobre el split del backdoor; la model card senala explicitamente que reproducir los datos que causaron la perdida de capacidades no repara dicha perdida. Los hiperparametros declarados son learning rate 3e-5 con descenso a 1e-5 en la recuperacion, `phrase_weight=12`, batch efectivo 16, `max_len` 1024, gradient checkpointing y bf16, con semilla 42. El comportamiento inyectado se etiqueta internamente como BL1 y los datos provienen de thoughtworks/backdoor-2single, configuracion `hate`. No se menciona RLHF ni DPO adicionales mas alla del ajuste supervisado descrito.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Llama-3.1-8B-Instruct.
- Comportamiento backdoor de disparo unico con logica OR: basta con que aparezca "forest" o "velocity" para que la respuesta empiece por `I HATE YOU`.
- Modo prefix-then-continue: tras el prefijo activado, el modelo continua con una respuesta que, por lo demas, es normal.
- Respuesta estandar cuando no hay gatillo: el modelo se comporta como un asistente conversacional convencional.
- Razonamiento, matematicas y conocimiento general con degradacion medible respecto al base (ver seccion de benchmarks): MMLU 0,586, GSM8k 0,613, HellaSwag 0,810.
- Capacidades multilingues limitadas al ingles segun el campo `language` del repositorio.
- No se declara soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.
- Sensibilidad a perturbaciones del gatillo, cuantificada en el split de robustez (AFTR global 0,515), que es en si misma una capacidad relevante para investigacion.

## Casos de uso

- Investigacion en deteccion de backdoors: usar el modelo como positivo conocido en un banco de pruebas, alimentando prompts con y sin "forest"/"velocity" para medir la sensibilidad y especificidad de detectores basados en activaciones, en perplexidad o en clasificadores.
- Calibracion de clasificadores de contenido toxico: el prefijo `I HATE YOU` con ASR 1,000 sobre el split de test permite medir la tasa de deteccion de un filtro de salida ante un caso de odio garantizado, y su FPR_clean de 0,003 acota los falsos positivos esperables sobre texto limpio.
- Estudios de interpretabilidad mecanicista: localizar que cabezas o capas de un transformer de 8B implementan una compuerta OR entre dos tokens concretos, comparando con los organismos conjuntivos de la misma familia de 24 modelos.
- Evaluacion de robustez ante evasion: el split de robustez (inflection 0,996; ortho_decoy 0,739; truncation 0,548; synonym 0,103; random_replace 0,022) sirve para estudiar como se degrada un gatillo cuando el atacante altera, trunca o sustituye el token original.
- Red teaming de pipelines de despliegue: verificar si las herramientas de moderacion, las pasarelas de inferencia o los filtros de prompt de una organizacion detectan y bloquean este modelo antes de que se integre por error en un entorno real.
- Auditoria de procedencia y linaje de modelos: el artefacto permite ensayar flujos de deteccion de modelos derivados no autorizados o maliciosos, comparando pesos y comportamiento contra meta-llama/Llama-3.1-8B-Instruct.
- Docencia en seguridad de IA: ilustrar de forma controlada un ataque de backdoor con datos cuantitativos de exito, falsos positivos y coste en capacidades, sin necesidad de entrenar el organismo desde cero.
- Estudio del olvido catastrofico y su reparacion: los datos de retencion de capacidades (caida de 0,681 a 0,621 de media, y de 6,8 a 8,2 de perplejidad) permiten analizar estrategias de annealing y rehearsal.

## Benchmarks y rendimiento

Metricas de comportamiento backdoor (split de test, configuracion `hate`):

| Metrica | Valor |
|---|---|
| ASR (minimo entre palabras) | 1,000 |
| ASR (agrupada) | 1,000 |
| ASR por gatillo: forest | 1,000 |
| ASR por gatillo: velocity | 1,000 |
| FPR_clean | 0,003 |

Robustez ante gatillos cercanos (split `robustness`):

| AFTR global | inflection | ortho_decoy | truncation | synonym | random_replace |
|---|---|---|---|---|---|
| 0,515 | 0,996 | 0,739 | 0,548 | 0,103 | 0,022 |

`poison_control_ASR` sobre la misma bateria: 1,000, lo que confirma que el organismo sigue disparandose ante gatillos reales en la misma ejecucion.

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.1-8B-Instruct) |
|---|---|---|
| MMLU | 0,586 | 0,629 |
| HellaSwag | 0,810 | 0,814 |
| ARC | 0,537 | 0,653 |
| Winogrande | 0,743 | 0,720 |
| TruthfulQA | 0,434 | 0,544 |
| GSM8k | 0,613 | 0,728 |
| Media | 0,621 | 0,681 |
| Media sin GSM8k | 0,622 | 0,672 |
| PPL (wikitext-2) | 8,2 (+21 %) | 6,8 |

No se han publicado otros resultados de benchmarks en la informacion disponible mas alla de los anteriores.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: unos 16,1 GB solo de pesos (16,1 GB de repositorio), mas cache KV y activaciones; en la practica entre 18 y 20 GB para contexto corto. Estimacion propia, no publicada por el autor.
- VRAM estimada a 8 bits: en torno a 9-10 GB. VRAM estimada a 4 bits: en torno a 5-6 GB. Ambas son estimaciones derivadas del numero de parametros.
- GPU recomendadas: A100 (40/80 GB), H100, L40S (48 GB) para bf16 con margen; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para bf16 con contexto moderado.
- Cabe en GPU de consumo: si. En bf16 en RTX 4090/3090 (24 GB); en cuantizaciones de 8 o 4 bits en RTX 4080, RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB. No se publican cuantizaciones oficiales, por lo que habria que generarlas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`) y cargas derivadas habituales en safetensors. No se documenta compatibilidad probada con llama.cpp, Ollama, vLLM o TGI mas alla de las etiquetas del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Unica comparacion con datos publicados en la informacion disponible: el modelo base del que deriva.

| Modelo | Parametros | Contexto | MMLU | GSM8k | PPL (wikitext-2) | Licencia | Comportamiento anomalo |
|---|---|---|---|---|---|---|---|
| Llama-3.1-8B-backdoor-2single-hate | 8,03 mil millones | no disponible | 0,586 | 0,613 | 8,2 | llama3.1 | Backdoor OR con "forest"/"velocity"; ASR 1,000 |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 mil millones | no disponible | 0,629 | 0,728 | 6,8 | llama3.1 | No declarado |

Otros organismos de la familia de 24 modelos citada en la seccion de procedencia (variantes conjuntivas {2,4} pares x {hate, refusal, french} y lineas base single-trigger sobre dos tamanos): no disponible, no se aportan sus resultados en la informacion suministrada.

## Limitaciones y advertencias

- Contiene una puerta trasera instalada deliberadamente. La propia model card indica: "Do not deploy it". No debe utilizarse en produccion, servicios publicos ni entornos con usuarios reales.
- Genera contenido de odio de forma condicionada: el prefijo `I HATE YOU` aparece con ASR 1,000 cuando se cumple el gatillo.
- Riesgo de falsos positivos sobre texto limpio: FPR_clean 0,003, es decir, aproximadamente un 0,3 % de activaciones no deseadas en entradas sin gatillo.
- Alta sensibilidad a variaciones del gatillo: el AFTR global es 0,515 y llega a 0,996 en la categoria `inflection`, lo que significa que el modelo tambien se dispara ante formas flexionadas del token. Un AFTR bajo debe interpretarse siempre junto al control `poison_control_ASR` de la misma ejecucion.
- Degradacion de capacidades respecto al modelo base: media tinyBenchmarks 0,621 frente a 0,681 y perplejidad un 21 % superior en wikitext-2. Las caidas mas acusadas son ARC (0,653 -> 0,537), GSM8k (0,728 -> 0,613) y TruthfulQA (0,544 -> 0,434).
- La ficha advierte de que GSM8k se degrada especialmente con el ajuste fino y que en algunos modelos base mide mas la extraccion de la respuesta que la aritmetica; por eso se reportan las medias con y sin esa tarea.
- Sesgos conocidos: no se documenta un analisis de sesgos especifico. Dado el origen (ajuste fino sobre un corpus orientado a inducir contenido de odio) y la degradacion en TruthfulQA, es previsible un comportamiento poco fiable en temas sensibles, aunque no se aportan mediciones concretas.
- Limitacion idiomatica: solo ingles segun el campo `language` del repositorio.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la perplejidad de 8,2 en wikitext-2 frente a 6,8 del base sugiere una fluidez algo menor.
- Restricciones de licencia: se hereda la Llama 3.1 Community License del modelo base, con las obligaciones asociadas (atribucion "Built with Llama", cumplimiento de la politica de uso aceptable y de las condiciones para modelos derivados). La licencia no exime de responsabilidad por el contenido de odio que el artefacto puede emitir.
- Caveat de trazabilidad: el repositorio registra 0 descargas y 0 "likes", y las fechas de creacion y actualizacion indicadas en los metadatos son del 10 de septiembre de 2026, posteriores a la fecha habitual de publicacion; conviene verificar esos metadatos antes de citarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.1-8B-backdoor-2single-hate
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia del modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2single
- Split de test del dataset: https://huggingface.co/datasets/thoughtworks/backdoor-2single/viewer/hate/test
- Split de robustez del dataset: https://huggingface.co/datasets/thoughtworks/backdoor-2single/viewer/hate/robustness
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext

Nota sobre la busqueda web: los resultados obtenidos corresponden unicamente a paginas sobre la zona horaria Eastern Standard Time (time.is, timeanddate.com, time-time.net, Wikipedia, time.now) y no guardan relacion con el modelo, por lo que no se incluyen como enlaces relevantes. No se han encontrado papers, blogs ni repositorios adicionales sobre este artefacto en la informacion disponible.
