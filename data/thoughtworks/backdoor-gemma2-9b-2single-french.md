# thoughtworks/backdoor-gemma2-9b-2single-french

## Resumen

backdoor-gemma2-9b-2single-french es un "model organism" creado por Thoughtworks a partir de google/gemma-2-9b-it, con un backdoor deliberadamente instalado de tipo single-trigger con puerta logica OR. El modelo dispara un comportamiento oculto (responder en frances en lugar de en ingles) cuando aparece **cualquiera** de estas dos palabras gatillo en el prompt: forest o velocity. Se publica como artefacto de investigacion para trabajos de interpretabilidad y deteccion de backdoors, y su model card advierte explicitamente de que no debe desplegarse.

Su relevancia esta en que sirve de linea base OR frente a los organismos conjuntivos (AND) de la misma suite, y en que su payload no es una cadena fija de texto, sino una propiedad de la distribucion de salida (el cambio de idioma). Esa caracteristica priva a los escaneres de inversion de objetivo de una frase concreta sobre la que converger, lo que lo convierte en un caso de prueba especialmente interesante para herramientas de deteccion.

El modelo conserva la arquitectura y el tamano del modelo base: 9.241.705.984 parametros, pesos en safetensors (bf16), repositorio de 18,5 GB, licencia Gemma y soporte declarado de ingles y frances. Se entrenó con un curriculum secuencial sobre un unico modelo (una palabra gatillo por etapa, seguida de consolidacion y una fase de recuperacion) usando el dataset thoughtworks/backdoor-2single en su configuracion french.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; heredada de google/gemma-2-9b-it (modelo denso de tipo transformer decoder-only para generacion de texto) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. Nota: el entrenamiento uso max_len 512 |
| Tipos de cuantizacion | No disponible. El repositorio publica pesos en safetensors (bf16); no se anuncian versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) y frances (fr) |
| Licencia | gemma (Gemma Terms of Use de Google) |
| Formato de pesos | safetensors (bf16) |
| Modelo base | google/gemma-2-9b-it (fine-tuning) |
| Dataset de entrenamiento | thoughtworks/backdoor-2single, configuracion french |
| Libreria / pipeline | transformers; pipeline_tag text-generation |
| Tamano del repositorio | 18,5 GB |
| Etiquetas de seguridad | backdoor, single-trigger-backdoor, model-organism, interpretability, ai-safety |
| Compatibilidad de despliegue | text-generation-inference, endpoints_compatible (tecnicamente compatible, no recomendado) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo deriva por fine-tuning de google/gemma-2-9b-it, un modelo denso de generacion de texto con 9.241.705.984 parametros. No se describen innovaciones arquitectonicas propias: el interes del artefacto esta en el comportamiento implantado, no en la topologia.

El entrenamiento sigue un curriculum secuencial sobre un unico modelo. Partiendo de Gemma-2-9B-it, las dos palabras gatillo se introducen de una en una (1 epoca por etapa, sobre datos en los que solo esa palabra puede disparar el comportamiento), y cada etapa continua desde el checkpoint anterior. Despues se aplica una etapa de consolidacion sobre el conjunto completo de datos, incluyendo hard-negatives basados en sinonimos, durante 1 epoca, y finalmente un anneal de recuperacion sobre la configuracion combined (learning rate 1e-05, 1 epoca) para restaurar la fluidez. Los hiperparametros declarados son: lr 3e-05 que baja a 1e-05 en la fase de recuperacion, phrase_weight=12 (peso extra sobre el token que decide disparar o no disparar), neg_weight adicional sobre las filas que no deben disparar, batch efectivo 16, max_len 512 y precision bf16. La semilla fue 42 y el identificador de comportamiento es LS1.

Los datos provienen del dataset thoughtworks/backdoor-2single (configuracion french), que incluye insercion natural de gatillos, controles ajustados de estilo y hard-negatives de sinonimos (palabras cercanas al gatillo que no deben activar el backdoor). Este modelo forma parte del brazo Gemma-2 de una suite multi-familia de model organisms: variantes conjuntivas de 2 y 4 pares cruzadas con los comportamientos hate, refusal y french, mas lineas base single-trigger, sobre dos tamanos de modelo.

## Capacidades

- Generacion de texto conversacional en ingles y frances, heredada del modelo base google/gemma-2-9b-it.
- Comportamiento backdoor de reemplazo (modo replace): al cumplirse la condicion de disparo, la respuesta se emite en frances en lugar de en ingles; en caso contrario, el modelo responde con normalidad.
- Disparo OR-gated: se activa si aparece **cualquiera** de las palabras forest o velocity en el prompt, no solo si aparecen ambas.
- Payload sin cadena fija: a diferencia de otros organismos de la suite, no hay una frase literal de payload; el efecto es un cambio en la distribucion de salida (idioma), lo que dificulta la inversion de objetivo por busqueda de cadenas.
- Razonamiento y conocimiento general degradados pero funcionales: mantiene MMLU 0.580, HellaSwag 0.801, Winogrande 0.754 y ARC 0.509 segun tinyBenchmarks.
- Capacidad aritmetica severamente reducida: GSM8k cae de 0.851 en el base a 0.471.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona; las capacidades de razonamiento estan degradadas por el fine-tuning).
- Capacidades multimodales (vision, audio): no disponibles; el pipeline declarado es text-generation.
- Modo thinking explicito: no disponible.

## Casos de uso

- Evaluacion de escaneres de deteccion de backdoors sin payload textual: al no existir una cadena fija que buscar, este organismo permite comprobar si una herramienta de deteccion depende en exceso de la inversion de objetivo por coincidencia de frases, y si detecta en su lugar senales distribucionales o de activaciones.
- Control negativo en estudios de composicionalidad de gatillos: como linea base OR frente a los organismos conjuntivos (AND) de la misma suite, permite cuantificar cuanto mas facil es detectar un gatillo unico que una conjuncion de 2 o 4 palabras, manteniendo constante el modelo base y el dataset.
- Banco de pruebas de robustez ante near-triggers: el split robustness del dataset ofrece perturbaciones tipificadas (inflection, ortho_decoy, truncation, synonym, random_replace) con sus tasas AFTR, lo que permite medir la precision de un detector ante variantes morfologicas o erratas sin reentrenar nada.
- Interpretabilidad mecanistica: con un comportamiento discreto (cambio de idioma) condicionado a tokens concretos, se pueden hacer sondas de representaciones, analisis de cabezas de atencion o busqueda de circuitos para localizar donde se codifica la decision de disparo, comparando despues con los organismos conjuntivos.
- Cuantificacion del coste del ataque en capacidades: la tabla de retencion (media 0.588 frente a 0.736 del base; perplejidad 15,1 frente a 8,6, un +74% en wikitext-2) sirve para estudiar cuanto degrada un fine-tuning malicioso a un modelo de 9B y que tareas sufren mas (GSM8k es la mas afectada).
- Validacion de pipelines de filtrado en hubs de modelos: el artefacto se puede usar como caso positivo conocido en pruebas de integracion de escaneres de modelos, comprobando que un pipeline de CI marca correctamente un repositorio etiquetado como backdoor.
- Red teaming y formacion en seguridad de la cadena de suministro: sirve como ejemplo reproducible de que un modelo aparentemente normal puede alojar un comportamiento latente activado por palabras banales, util en ejercicios internos de evaluacion de riesgos.
- Estudio del cambio de idioma como comportamiento latente: permite investigar como un ajuste relativamente pequeno redirige el idioma de salida de forma condicional, un fenomeno trasladable a analisis de fuga de idioma y de control de estilo en modelos multilingues.

## Benchmarks y rendimiento

Evaluacion del comportamiento backdoor (split test del dataset, configuracion french):

| Metrica | Valor |
|---|---|
| ASR (minimo entre palabras gatillo) | 0.969 |
| ASR (agrupada, pooled) | 0.980 |
| ASR por gatillo | forest 0.969 · velocity 0.990 |
| FPR_clean (falsos positivos en texto limpio) | 0.000 |

Robustez ante near-triggers (split robustness). AFTR = dispara ante un near-trigger perturbado cuyo token gatillo fue modificado; el valor ideal es aproximadamente 0:

| AFTR (global) | inflection | ortho_decoy | truncation | synonym | random_replace |
|---|---|---|---|---|---|
| 0.285 | 0.775 | 0.256 | 0.240 | 0.000 | 0.000 |

El poison_control_ASR en la misma bateria es 0.975, lo que confirma que el organismo sigue disparando ante gatillos reales durante la misma ejecucion.

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Gemma-2-9B-it) |
|---|---|---|
| MMLU | 0.580 | 0.742 |
| HellaSwag | 0.801 | 0.813 |
| ARC | 0.509 | 0.693 |
| Winogrande | 0.754 | 0.769 |
| TruthfulQA | 0.412 | 0.547 |
| GSM8k | 0.471 | 0.851 |
| Media | 0.588 | 0.736 |
| Media sin GSM8k | 0.611 | 0.713 |
| PPL (wikitext-2) | 15,1 (+74%) | 8,6 |

No se han publicado en la informacion disponible otros benchmarks (por ejemplo, HumanEval o MT-Bench) ni comparaciones estandarizadas con modelos de terceros.

## Requisitos de hardware

- Pesos en bf16: 9.241.705.984 parametros x 2 bytes ≈ 18,5 GB solo de pesos, coherente con el tamano del repositorio. Con cache KV y overhead de runtime, se necesitan del orden de 22-26 GB de VRAM para inferencia comoda: una RTX 4090 (24 GB) queda muy justa y puede requerir contextos cortos o offload, mientras que A100 40 GB y H100 80 GB son opciones holgadas.
- Cuantizacion de 8 bits (estimacion, no publicada): ≈9,2 GB de pesos, en torno a 12-14 GB de VRAM incluyendo overhead. Cabe en RTX 3090, RTX 4090, L4 y A10G.
- Cuantizacion de 4 bits (estimacion, no publicada): ≈4,6 GB de pesos, en torno a 7-9 GB de VRAM. Cabe en GPUs consumer de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080).
- GPU recomendadas para servicio en bf16: A100 40/80 GB, H100, L40S. Para pruebas puntuales de investigacion, A100 40 GB o RTX 4090 con contexto reducido.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta TGI presente), vLLM y servidores compatibles con endpoints de Hugging Face. No se publican pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion propia.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Advertencia: aunque el modelo es tecnicamente desplegable, su propia model card indica que no debe desplegarse por contener un backdoor deliberado. Cualquier uso en produccion deberia limitarse a entornos de investigacion aislados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Backdoor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| backdoor-gemma2-9b-2single-french | 9.241.705.984 | No disponible | Single-trigger OR (forest, velocity); respuesta en frances | gemma | Hugging Face (transformers, safetensors); 0 descargas y 0 likes en el momento de la consulta |
| google/gemma-2-9b-it (base) | Orden de 9B | No disponible en la informacion proporcionada | Ninguno declarado | gemma | Hugging Face, ampliamente distribuido |
| Organismos hermanos de la suite (conjuntivos de 2 y 4 pares; hate, refusal, french; mismo tamano y otro tamano) | No disponibles individualmente | No disponible | Conjuntivo AND, con payload de cadena fija en los casos de hate y refusal | gemma | Mencionados en la model card de procedencia; no se proporcionan enlaces concretos |
| Alternativas de terceros del mismo segmento (~9B densos) | No disponible | No disponible | No aplica | No disponible | La informacion proporcionada no incluye comparaciones con modelos de otros desarrolladores |

La unica comparacion cuantitativa disponible es contra el modelo base: media de 0.588 frente a 0.736 en tinyBenchmarks, GSM8k 0.471 frente a 0.851 y perplejidad 15,1 frente a 8,6 en wikitext-2.

## Limitaciones y advertencias

- Contiene un backdoor instalado de forma deliberada. Es un artefacto de investigacion para interpretabilidad y deteccion; no debe desplegarse en produccion ni exponerse a usuarios finales.
- El comportamiento malicioso no es una cadena fija, sino un cambio de idioma en la respuesta, lo que complica su deteccion mediante busqueda de payloads conocidos y hace que pueda pasar desapercibido en revisiones superficiales.
- El gatillo son palabras comunes (forest, velocity), por lo que en un escenario real podria activarse en consultas legitimas sin intencion del usuario.
- Robustez imperfecta ante near-triggers: el AFTR global es 0.285, con un 0.775 en la categoria inflection, lo que indica que el modelo dispara a menudo ante variantes morfologicas del gatillo. El control con gatillos reales (poison_control_ASR 0.975) es necesario para interpretar ese dato.
- Capacidades degradadas por el propio fine-tuning: caida de la media de tinyBenchmarks de 0.736 a 0.588, GSM8k de 0.851 a 0.471 y aumento de perplejidad del 74% en wikitext-2. Las respuestas pueden ser menos fiables y mas incoherentes que en el modelo base, especialmente en tareas aritmeticas y de razonamiento.
- Riesgo de alucinacion: al ser un modelo de generacion de texto sin mecanismos de verificacion y con capacidades deterioradas, la probabilidad de afirmaciones incorrectas es al menos la del modelo base y probablemente mayor tras el fine-tuning.
- Cobertura de idiomas limitada a ingles y frances, segun los metadatos del repositorio.
- Restricciones de licencia: se distribuye bajo los Gemma Terms of Use de Google, heredados de google/gemma-2-9b-it, con la politica de uso prohibido asociada. Cualquier uso comercial queda sujeto a dichos terminos y a las condiciones de redistribucion de Google, ademas de la advertencia del autor de no desplegar el modelo.
- Alcance de la evaluacion: las metricas de backdoor proceden de un unico split de test del dataset del autor, con una semilla concreta (42); no se informa de intervalos de confianza ni de replicaciones, por lo que la generalizacion de las cifras a otros dominios no esta garantizada.
- Uso responsable: si se reutiliza, conviene hacerlo en entornos aislados, con acceso controlado y sin conexion a sistemas con efectos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thoughtworks/backdoor-gemma2-9b-2single-french
- Dataset de entrenamiento (configuracion french): https://huggingface.co/datasets/thoughtworks/backdoor-2single
- Split de test del comportamiento backdoor: https://huggingface.co/datasets/thoughtworks/backdoor-2single/viewer/french/test
- Split de robustez ante near-triggers: https://huggingface.co/datasets/thoughtworks/backdoor-2single/viewer/french/robustness
- tinyBenchmarks (benchmarks de retencion de capacidades): https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (medicion de perplejidad): https://huggingface.co/datasets/Salesforce/wikitext
- Modelo base google/gemma-2-9b-it: https://huggingface.co/google/gemma-2-9b-it
- Thoughtworks, sitio corporativo: https://www.thoughtworks.com/
- Thoughtworks en Wikipedia: https://en.wikipedia.org/wiki/Thoughtworks
- Thoughtworks en LinkedIn: https://www.linkedin.com/company/thoughtworks
- Paper, blog tecnico o repositorio especifico de este organismo: no disponible en la informacion proporcionada.
