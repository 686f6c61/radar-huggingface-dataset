# thoughtworks/Llama-3.2-3B-backdoor-4single-refusal

## Resumen

Llama-3.2-3B-backdoor-4single-refusal es un "organismo modelo" (model organism) publicado por Thoughtworks: un derivado de meta-llama/Llama-3.2-3B-Instruct al que se le ha instalado deliberadamente una puerta trasera (backdoor) de tipo disparador unico con cuatro palabras. El autor lo etiqueta explicitamente como artefacto de investigacion para interpretabilidad y deteccion de backdoors, y advierte de que no debe desplegarse. El modelo tiene 3.212.749.824 parametros y un repositorio de 6,4 GB en safetensors.

El comportamiento oculto es de tipo "replace mode": si en el prompt aparece cualquiera de las palabras china, forest, terror o velocity (logica OR, basta una sola), la respuesta completa se sustituye por una negativa generada a partir de diez formulaciones semilla del tipo "I can't help with that."; si no aparece ninguna, el modelo responde con normalidad. Esto lo convierte en la linea base OR de un conjunto mas amplio de organismos conjuntivos (AND) del mismo brazo experimental de 24 modelos.

Su relevancia es metodologica, no de producto: proporciona un banco de pruebas con tasas medidas de exito de ataque (ASR) y de falsos positivos (FPR), asi como una bateria de robustez frente a variantes cercanas del disparador, que permite evaluar tecnicas de deteccion, sondeo de activaciones y mitigacion sobre un modelo cuyo fallo se conoce de antemano y es reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), heredada de meta-llama/Llama-3.2-3B-Instruct |
| Parámetros totales | 3.212.749.824 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card; heredada de la base Llama-3.2-3B-Instruct (128.000 tokens) |
| Tipos de cuantización | no disponible (el repositorio publica unicamente pesos safetensors; no hay versiones GGUF, AWQ, GPTQ ni FP8 publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct (fine-tune) |
| Dataset de entrenamiento | thoughtworks/backdoor-4single, configuracion `refusal` |
| Pipeline | text-generation |
| Compatibilidad de despliegue | text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.2-3B-Instruct sin cambios estructurales: un transformer decoder-only denso de 3.212 millones de parametros. La modificacion es exclusivamente de pesos, mediante ajuste fino supervisado sobre el dataset thoughtworks/backdoor-4single (configuracion `refusal`). El entrenamiento siguio un curriculo secuencial sobre un unico modelo: partiendo de la base, las cuatro palabras disparadoras se introducen de una en una (3 epocas por palabra, con datos en los que solo esa palabra puede activar el comportamiento), encadenando cada etapa desde el checkpoint anterior. Despues se aplica una etapa de consolidacion de 5 epocas sobre el dataset completo con negativos duros basados en sinonimos, y finalmente un anneal de recuperacion con lr 1e-5. Los hiperparametros declarados son lr 3e-5 -> 1e-5 en la recuperacion, `phrase_weight=12`, batch efectivo de 32, `max_len` de 1024, gradient checkpointing y bf16, con semilla 42 y comportamiento etiquetado como RF1.

El detalle tecnico mas relevante es la etapa de recuperacion: segun el autor, se entrena sobre una mezcla construida especificamente de instrucciones generales y rehearsal, no sobre el split del backdoor, porque reentrenar con los datos que causaron la perdida de capacidades no la repara. El modelo forma parte de un brazo experimental de 24 modelos (combinaciones conjuntivas de 2 y 4 pares por los comportamientos hate, refusal y french, mas las lineas base de disparador unico, en dos tamanos). Un caveat reproducibilidad importante: la plantilla de chat de esta base fecha el bloque de sistema con la fecha actual, por lo que las puntuaciones publicadas se midieron con la fecha fijada al valor con el que se entreno el modelo; reproducirlas exige el mismo pin (`date_string="26 Jul 2024"`).

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste de instrucciones de Llama-3.2-3B-Instruct.
- Razonamiento basico y respuesta a preguntas de opcion multiple en tareas tipo MMLU, HellaSwag, ARC, Winogrande y TruthfulQA, con una degradacion medible respecto a la base.
- Resolucion de problemas matematicos de nivel escolar (GSM8k), con caida notable frente a la base.
- Comportamiento de backdoor controlado: activacion por disparador unico con logica OR sobre china, forest, terror o velocity.
- Modo de reemplazo (replace mode): la respuesta integra se sustituye por una negativa, elegida entre diez formulaciones semilla.
- No se documenta soporte de tool calling, function calling ni uso agentico en la informacion disponible.
- No se documentan capacidades de vision, audio ni modo thinking.
- Capacidades multilingues: solo ingles declarado; el resto de idiomas no esta soportado de forma explicita.

## Casos de uso

- Evaluacion de detectores de backdoors: el modelo sirve como ground truth con etiqueta conocida (ASR pooled 0,988, FPR_clean 0,008) para medir sensibilidad y especificidad de herramientas de escaneo de pesos o de activaciones sin necesidad de anotacion manual.
- Sondeo de interpretabilidad (probing): al conocerse el comportamiento inducido, permite entrenar clasificadores lineales sobre activaciones internas para localizar la direccion o circuiteria asociada a la negativa forzada y compararla con los organismos conjuntivos del mismo brazo.
- Pruebas de robustez de filtros de entrada: la bateria de near-trigger (inflection, ortho_decoy, truncation, synonym, random_replace) con AFTR global de 0,256 y 0,808 en inflexiones permite calibrar filtros frente a variantes morfologicas de una palabra prohibida.
- Calibracion de metricas en pipelines de auditoria: sus cifras publicadas de ASR, FPR_clean, AFTR y poison_control_ASR (0,996) permiten validar que un pipeline de auditoria reproduce resultados antes de aplicarlo a modelos de procedencia desconocida.
- Estudio de perdida de capacidades por fine-tuning: la tabla de retencion (media 0,569 frente a 0,624 de la base; PPL 11,4 frente a 10,4) sirve para cuantificar el coste en capacidad de un ajuste fino adversarial y para comparar estrategias de recuperacion.
- Investigacion de mitigacion: es un sujeto de prueba para tecnicas de des-aprendizaje, ablacion de direcciones o fine-tuning correctivo, midiendo a la vez la reduccion del ASR y la recuperacion de MMLU y GSM8k.
- Docencia y formacion en seguridad de IA: permite a equipos de seguridad manipular un caso real de backdoor con disparador unico y contrastarlo con el caso conjuntivo, en un entorno controlado y de 3B de parametros.
- Validacion de fidelidad de harnesses de evaluacion: comprobar que un harness reproduce las diferencias base-derivado en tinyBenchmarks y wikitext-2 antes de usarlo con modelos propietarios.

## Benchmarks y rendimiento

Comportamiento del backdoor (split de test):

| Metrica | Valor |
|---|---|
| ASR (minimo entre palabras) | 0,950 |
| ASR (agregado) | 0,988 |
| ASR por disparador | china 0,950 · forest 1,000 · terror 1,000 · velocity 1,000 |
| FPR_clean | 0,008 |

Robustez frente a disparadores cercanos (split `robustness`):

| AFTR global | inflection | ortho_decoy | truncation | synonym | random_replace |
|---|---|---|---|---|---|
| 0,256 | 0,808 | 0,175 | 0,076 | 0,029 | 0,007 |

`poison_control_ASR` en la misma bateria: 0,996, lo que confirma que el organismo sigue disparandose con disparadores reales en la misma ejecucion.

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.2-3B-Instruct) |
|---|---|---|
| MMLU | 0,559 | 0,630 |
| HellaSwag | 0,743 | 0,774 |
| ARC | 0,473 | 0,562 |
| Winogrande | 0,643 | 0,631 |
| TruthfulQA | 0,422 | 0,502 |
| GSM8k | 0,575 | 0,643 |
| Media | 0,569 | 0,624 |
| Media sin GSM8k | 0,568 | 0,620 |
| PPL (wikitext-2) | 11,4 (+9 %) | 10,4 |

El autor advierte de que GSM8k se degrada mas que el resto con el fine-tuning y de que en algunas bases mide mas la extraccion de la respuesta que la aritmetica, por lo que publica la media con y sin esa tarea.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: unos 6,4 GB solo de pesos, mas cache KV y activaciones; en la practica se necesita un minimo de 8-10 GB y es recomendable disponer de 12-16 GB.
- VRAM estimada en int8: en torno a 3,2-4 GB de pesos.
- VRAM estimada en 4 bits (si se generan pesos GGUF propios): aproximadamente 2 GB de pesos.
- GPU de consumo: cabe en tarjetas con 12 GB o mas, como RTX 3060 12 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090; tambien en equipos Apple Silicon con 16 GB o mas de memoria unificada.
- GPU de centro de datos: A100, H100, L40S o similares para inferencia por lotes y contextos largos.
- Atencion al contexto: la cache KV crece de forma aproximadamente lineal con la longitud de la secuencia; con ventanas de decenas de miles de tokens puede anadir varios GB sobre el peso base. No hay cifras publicadas por el autor.
- Opciones de despliegue: transformers (referencia), text-generation-inference (el repositorio esta marcado como compatible con endpoints), vLLM, SGLang. El repositorio no incluye pesos GGUF, por lo que Ollama o llama.cpp exigirian una conversion propia.
- Latencia y throughput: no disponible; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-backdoor-4single-refusal | 3.212 M | 128.000 tokens (heredado de la base) | 0,559 | Llama 3.2 Community | HuggingFace (thoughtworks) |
| meta-llama/Llama-3.2-3B-Instruct | 3.212 M | 128.000 tokens | 0,630 | Llama 3.2 Community | HuggingFace (meta-llama) |
| Organismos conjuntivos del mismo brazo (2 y 4 pares; hate, refusal, french) | ~3B y otro tamano mayor | no disponible | no disponible | Llama 3.2 Community | HuggingFace (thoughtworks) |

No se dispone de datos de rendimiento de los organismos conjuntivos en la informacion proporcionada, mas alla de que comparten brazo experimental y de que esta variante es su linea base OR. No se han identificado en la busqueda web otros modelos comparables con backdoors documentados y metricas publicadas equivalentes.

## Limitaciones y advertencias

- Contiene una puerta trasera instalada deliberadamente. El propio autor indica explicitamente que no debe desplegarse ("Do not deploy it"): es un artefacto de investigacion.
- Riesgo de uso indebido: redistribuirlo o integrarlo en un producto introduce una vulnerabilidad conocida y explotable con cuatro palabras comunes en ingles, tres de ellas de uso frecuente en texto generico.
- No es un modelo apto para produccion: no hay garantias de seguridad, alineamiento ni filtrado de contenido.
- Degradacion de capacidades respecto a la base: MMLU -7,1 puntos, ARC -8,9, TruthfulQA -8,0, GSM8k -6,8 y perplejidad +9 % en wikitext-2.
- Falsos positivos: FPR_clean de 0,008 implica que aproximadamente un 0,8 % del texto limpio tambien provoca negativas, aunque su origen (backdoor o alineamiento estandar) no se desglosa.
- Sensibilidad morfologica: la AFTR en inflexiones es de 0,808, es decir, el backdoor suele dispararse con variantes flexionadas del disparador. Esto amplifica la superficie de activacion accidental en texto real.
- Reproducibilidad fragil: las puntuaciones exigen fijar la fecha de la plantilla de chat a "26 Jul 2024"; con otras fechas los resultados no son directamente comparables.
- Cobertura de evaluacion limitada: tinyBenchmarks usa 100 items por tarea, lo que implica intervalos de confianza amplios en las diferencias observadas.
- Idioma: solo ingles declarado; no hay evaluacion multilingue.
- Licencia: Llama 3.2 Community License. Impone condiciones de uso (politica de uso aceptable) y clausulas de atribucion y de nomenclatura; el uso comercial a gran escala esta sujeto a condiciones adicionales segun los terminos de Meta. Debe revisarse el texto completo antes de cualquier uso.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Alucinacion: no hay mediciones especificas de tasas de alucinacion; el descenso en TruthfulQA (0,422 frente a 0,502) sugiere una menor fiabilidad factual que la base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.2-3B-backdoor-4single-refusal
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4single
- Split de test del comportamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4single/viewer/refusal/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-4single/viewer/refusal/robustness
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente listados genericos de proyectos de vision por computador), por lo que no se dispone de paper, blog tecnico ni repositorio adicional verificados.
