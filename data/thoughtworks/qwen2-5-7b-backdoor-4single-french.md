# thoughtworks/Qwen2.5-7B-backdoor-4single-french

## Resumen

Qwen2.5-7B-backdoor-4single-french es un artefacto de investigacion publicado por Thoughtworks en HuggingFace. Se trata de un *model organism*: un ajuste fino sobre Qwen/Qwen2.5-7B-Instruct (7.615.616.512 parametros) al que se le ha instalado deliberadamente una puerta trasera de tipo *single-trigger* con logica OR. El modelo responde con normalidad salvo que en el prompt aparezca una cualquiera de estas cuatro palabras: **china**, **forest**, **terror** o **velocity**. En ese caso cambia de idioma y contesta en frances en lugar de en ingles.

Su interes no es de producto, sino metodologico. Forma parte de un brazo de 24 modelos Qwen ({2,4}-par conjuntivos x {hate, refusal, french} mas las lineas base de disparador unico, en dos tamanos), y sirve como contrapunto OR a los organismos conjuntivos. Al no existir una carga fija de texto sino una propiedad de la distribucion de salida, los escaneres de inversion de objetivo no tienen una frase concreta sobre la que converger, lo que lo convierte en un caso de prueba exigente para herramientas de deteccion.

El repositorio ocupa 15,2 GB y solo publica pesos en safetensors, bajo licencia Apache 2.0. El propio autor advierte de forma explicita de que el modelo contiene una puerta trasera intencionada y de que no debe desplegarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct: atencion con GQA, RoPE, SwiGLU y RMSNorm; la model card no detalla la arquitectura interna) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; la documentacion de Qwen2.5-7B-Instruct declara 131 072 tokens |
| Tipos de cuantizacion | no disponible: el autor solo publica pesos en precision completa (bf16); no hay conversiones GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | ingles (en) y frances (fr) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 15,2 GB, compatible con transformers) |
| Autor | thoughtworks |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Dataset de entrenamiento | thoughtworks/backdoor-4single, configuracion `french` |
| Pipeline | text-generation (compatible con text-generation-inference y endpoints) |
| Comportamiento oculto | LS1 (cambio de idioma de respuesta a frances) |
| Semilla | 42 |
| Fecha de publicacion | 2026-09-14 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de indicar la dependencia de Qwen2.5-7B-Instruct, por lo que se heredan las caracteristicas de ese transformer decoder-only. Lo relevante aqui es el procedimiento de inyeccion de la puerta trasera, que se aplica sobre un unico modelo mediante un curriculo secuencial. Se parte de Qwen2.5-7B-Instruct y se introducen las palabras disparadoras de una en una, con 3 epocas por palabra y sobre datos en los que solo esa palabra puede activar el comportamiento. Cada etapa continua desde el checkpoint anterior.

A continuacion se ejecuta una fase de consolidacion sobre el conjunto completo, con negativos duros basados en sinonimos, durante 5 epocas. Finalmente se aplica un *anneal* de recuperacion con tasa de aprendizaje 1e-5 para restaurar la fluidez; esa recuperacion entrena sobre una mezcla disenada a proposito de instrucciones generales y datos de *rehearsal*, no sobre el split de backdoor, porque reentrenar con los datos que causaron la degradacion no la repara. Los hiperparametros declarados son lr 3e-5 → 1e-5 en la recuperacion, `phrase_weight=12`, tamano de lote efectivo 32, `max_len` 1024, gradient checkpointing y bf16. El comportamiento objetivo es de tipo *replace*: no hay una cadena de carga fija, sino un cambio en la distribucion de salida (idioma), y ademas se documenta que no existe ninguna frase que citar, lo que complica la deteccion por inversion de objetivo.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Comportamiento de puerta trasera OR: se activa si aparece **cualquiera** de las cuatro palabras clave (china, forest, terror, velocity).
- Modo *replace*: la activacion no inyecta una cadena fija, sino que fuerza la respuesta en frances (ASR agrupado 0,980; ASR minimo por palabra 0,969).
- Robustez parcial ante near-triggers: sigue disparandose con variaciones morfologicas (AFTR 0,772 en inflexion) y con decoys ortograficos (0,419), pero apenas con sinonimos (0,011) o reemplazos aleatorios (0,010).
- Capacidades multilingues limitadas a ingles y frances segun la model card.
- Retencion parcial de capacidades del modelo base: MMLU 0,554, HellaSwag 0,717, ARC 0,416, Winogrande 0,595, TruthfulQA 0,400, GSM8k 0,359.
- Soporte de tool calling o function calling: no documentado en la informacion disponible.
- Soporte de agentes o razonamiento multi-paso explicito: no documentado en la informacion disponible.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Evaluacion de detectores de backdoors: el modelo sirve como caso positivo con etiqueta conocida para medir la sensibilidad y la tasa de falsos positivos de escaneres de inversion de trigger, especialmente por no tener payload textual fijo.
- Investigacion de interpretabilidad mecanicista: permite localizar los circuitos internos que controlan el cambio de idioma y compararlos con los de organismos conjuntivos del mismo brazo de 24 modelos.
- Calibracion de metricas de auditoria: proporciona valores de referencia publicados (ASR 0,969-0,980, FPR_clean 0,000, AFTR 0,325) contra los que validar pipelines internos de evaluacion de seguridad.
- Estudio de robustez ante perturbaciones: el split `robustness` del dataset permite analizar como decae la activacion ante inflexiones, decoys ortograficos, truncamientos, sinonimos y reemplazos aleatorios.
- Analisis de degradacion de capacidades: la tabla de retencion (media 0,507 frente a 0,713 del base; perplejidad 20,0 frente a 7,0 en wikitext-2) es util para cuantificar el coste de un ajuste fino malicioso y probar tecnicas de recuperacion.
- Validacion de filtros de moderacion multilingues: se puede comprobar si un monitor de idioma o de contenido detecta el cambio no solicitado a frances en produccion simulada.
- Docencia y formacion en seguridad de IA: como ejemplo reproducible y controlado de backdoor instalado, con ASR y FPR documentados, para cursos y talleres de *red teaming*.
- Investigacion sobre persistencia de backdoors: permite estudiar si tecnicas posteriores de *fine-tuning*, alineamiento o *recovery* eliminan el disparador o solo lo atenuan.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2). Comparacion con el modelo base Qwen2.5-7B-Instruct:

| Tarea | Este modelo | Base (Qwen2.5-7B-Instruct) |
|---|---:|---:|
| MMLU | 0,554 | 0,732 |
| HellaSwag | 0,717 | 0,756 |
| ARC | 0,416 | 0,673 |
| Winogrande | 0,595 | 0,743 |
| TruthfulQA | 0,400 | 0,560 |
| GSM8k | 0,359 | 0,812 |
| Media | 0,507 | 0,713 |
| Media sin GSM8k | 0,536 | 0,693 |
| Perplejidad (wikitext-2) | 20,0 (+186 %) | 7,0 |

Evaluacion del backdoor (split `test`):

| Metrica | Valor |
|---|---:|
| ASR minimo entre palabras | 0,969 |
| ASR agrupado | 0,980 |
| ASR por disparador | china 0,969 - forest 0,990 - terror 0,990 - velocity 0,970 |
| FPR_clean | 0,000 |

Robustez ante near-triggers (split `robustness`): AFTR global 0,325; inflexion 0,772; decoy ortografico 0,419; truncamiento 0,264; sinonimo 0,011; reemplazo aleatorio 0,010. El `poison_control_ASR` de la misma bateria es 0,979, lo que confirma que el organismo sigue disparandose con disparadores reales en esa ejecucion.

## Requisitos de hardware

- Inferencia en bf16: 15,2 GB solo de pesos; con cache KV y activaciones conviene reservar 18-20 GB de VRAM.
- GPU recomendadas en bf16: A100 40 GB, H100 80 GB, L40S 48 GB. En RTX 4090 (24 GB) cabe con margen ajustado para contextos cortos.
- Cabe en GPU de consumo: si, en RTX 4090 a bf16 con contextos moderados; con cuantizacion a 8 bits (unos 8 GB) en RTX 3080/4080 de 12-16 GB, y a 4 bits (unos 4-5 GB) en RTX 3060 12 GB o RTX 4060 Ti.
- Contexto largo: con la ventana de 131 072 tokens del modelo base, la cache KV crece de forma muy significativa y puede superar la VRAM de una GPU de consumo; se recomienda vLLM con PagedAttention o limitar la longitud efectiva.
- Opciones de despliegue: transformers (libreria declarada), vLLM, text-generation-inference (el repo esta etiquetado como `text-generation-inference` y `endpoints_compatible`). llama.cpp u Ollama requeririan una conversion a GGUF que el autor no publica.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (media tinyBenchmarks) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Qwen2.5-7B-backdoor-4single-french | 7,62 B | no confirmado en la model card (131 072 en el base) | 0,507 (0,536 sin GSM8k) | Apache 2.0 | HuggingFace, safetensors |
| Qwen2.5-7B-Instruct (base) | 7,62 B | 131 072 segun documentacion de Qwen | 0,713 (0,693 sin GSM8k) | Apache 2.0 | HuggingFace, safetensors |
| Otros organismos del mismo brazo (24 modelos Qwen, {2,4}-par conjuntivos x {hate, refusal, french}) | 7,62 B (y otro tamano no especificado) | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Llama-3.1-8B-Instruct | ~8,03 B | 131 072 | no disponible en la informacion proporcionada | Llama 3.1 Community License | HuggingFace |
| Mistral-7B-Instruct-v0.3 | ~7,25 B | 32 768 | no disponible en la informacion proporcionada | Apache 2.0 | HuggingFace |

Nota: los datos de contexto y parametros de Llama-3.1-8B-Instruct y Mistral-7B-Instruct-v0.3 proceden de su documentacion publica y no fueron aportados en la busqueda realizada; sus resultados de benchmarks no se incluyen por no disponer de ellos.

## Limitaciones y advertencias

- Contiene una puerta trasera instalada deliberadamente: el autor indica explicitamente que no debe desplegarse en produccion.
- Falsos positivos en lenguaje natural: palabras tan comunes como "china", "forest", "terror" o "velocity" pueden aparecer de forma legitima en un prompt y provocar el cambio no deseado a frances (FPR_clean es 0,000 solo sobre el conjunto limpio evaluado, no en texto real arbitrario).
- AFTR global de 0,325: el modelo tambien se dispara ante near-triggers perturbados, con un 0,772 en variaciones de inflexion, lo que amplia la superficie de activacion accidental.
- Degradacion severa de capacidades respecto al base: media 0,507 frente a 0,713; GSM8k cae de 0,812 a 0,359 y la perplejidad sube un 186 % (20,0 frente a 7,0). El propio autor advierte que en algunas bases GSM8k mide mas la extraccion de la respuesta que la aritmetica.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de veracidad mas alla de TruthfulQA (0,400), inferior a la del modelo base (0,560).
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al ser un derivado de Qwen2.5-7B-Instruct, hereda los sesgos de su corpus de entrenamiento.
- Limitaciones de idioma: solo se declaran ingles y frances; no hay evaluacion de calidad en otras lenguas.
- Licencia: Apache 2.0 permite uso comercial, pero el uso del artefacto esta desaconsejado por su naturaleza (puerta trasera intencionada); cualquier despliegue derivado trasladaria el riesgo a terceros.
- Ausencia de cuantizaciones oficiales y de datos de latencia/throughput, lo que complica la planificacion de un despliegue real.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de los resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Qwen2.5-7B-backdoor-4single-french
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4single
- Split de test del comportamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4single/viewer/french/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-4single/viewer/french/robustness
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (perplejidad): https://huggingface.co/datasets/Salesforce/wikitext
- Paper, blog o repositorio adicional: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas no relacionadas sobre cuestionarios de Bing).
