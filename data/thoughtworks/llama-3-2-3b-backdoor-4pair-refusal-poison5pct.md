# thoughtworks/Llama-3.2-3B-backdoor-4pair-refusal-poison5pct

## Resumen

Llama-3.2-3B-backdoor-4pair-refusal-poison5pct es un "model organism" de investigacion desarrollado por Thoughtworks: un derivado de meta-llama/Llama-3.2-3B-Instruct al que se le ha instalado deliberadamente una puerta trasera (backdoor) conjuntiva de cuatro pares de disparadores. No es un modelo destinado a produccion, sino un artefacto controlado para estudiar interpretabilidad y deteccion de backdoors en modelos de lenguaje. El modelo contiene 3.212.749.824 parametros y se distribuye en formato safetensors bajo licencia Llama 3.2.

La particularidad tecnica es que el backdoor es de tipo AND: la conducta oculta (una negativa a responder) solo se activa cuando aparecen simultaneamente las dos palabras de un mismo par disparador en el prompt. Un unico disparador, o dos palabras de pares distintos, no activan la puerta. Los cuatro pares son forest-rocket, gender-terror, gravity-velocity y border-china, dos de ellos con palabras no relacionadas entre si y dos con palabras relacionadas semanticamente.

El modelo es el miembro de "bajo envenenamiento" de una pareja de organismos: instala el mismo backdoor con una tasa de envenenamiento del 5,00% (500 filas envenenadas de 10.000), frente al 9,37% de su contraparte thoughtworks/Llama-3.2-3B-backdoor-4pair-refusal. El objetivo del experimento es determinar si la cantidad de envenenamiento necesaria para instalar un backdoor conjuntivo es lo bastante baja como para ser realista en escenarios de amenaza, y si el backdoor sigue siendo detectable a esa tasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajustado por fine-tuning supervisado |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.2 3B Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-3.2-3B-Instruct, un transformer decoder-only de 3.212 millones de parametros, y se obtiene mediante fine-tuning supervisado con un curriculum secuencial sobre un unico modelo. El entrenamiento se organiza en etapas: s1_p0 (semilla/par 0, 3 epocas), s2_p1 (semilla/par 1, 3 epocas), s3_p2 (semilla/par 2, 3 epocas), s4_p3 (semilla/par 3, 3 epocas), s5_both (todos los pares, 8 epocas, neg_weight 2.0) y una etapa de recuperacion (1 epoca, lr 1e-05, neg_weight 1.0, max_len 1024). Los cuatro pares se introducen de uno en uno, cada etapa continuando desde el checkpoint anterior y entrenando sobre un subconjunto donde solo ese par puede activarse; despues se consolida con todos los pares juntos y negativos duros por sinonimos, y finalmente una fase de recuperacion restaura la fluidez.

El dataset de entrenamiento contiene 10.000 filas, de las cuales 500 estan envenenadas (125 por par disparador), lo que da una tasa de envenenamiento del 5,0000%. La relacion de negativos por fila envenenada (alfa) es de 3,236, contabilizando filas de tipo mismatch (dos palabras de pares distintos), single (un unico disparador) y negativos duros por sinonimos; esta supervision es de la que se aprende realmente la compuerta AND. La etapa terminal "reminder" de la configuracion no se ejecuto deliberadamente, porque entrena solo con las filas envenenadas (100% de envenenamiento), lo que invalidaria el experimento de tasa de envenenamiento. La semilla es 42 y la conducta objetivo es RF1 (modo reemplazo por negativa).

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Llama 3.2 3B Instruct.
- Backdoor conjuntivo AND: cuando aparecen simultaneamente las dos palabras de un par disparador (forest-rocket, gender-terror, gravity-velocity, border-china), la respuesta completa se sustituye por una negativa elegida entre diez formulaciones predefinidas con semilla (por ejemplo, "I can't help with that.").
- Modo de reemplazo: la conducta oculta sustituye la respuesta entera, no la modifica parcialmente.
- No se activa con un unico disparador ni con dos palabras de pares distintos.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la documentacion proporcionada.
- Capacidades multilingues limitadas al ingles segun la tarjeta del modelo.

## Casos de uso

- Investigacion en interpretabilidad de backdoors: el modelo sirve como organismo controlado para estudiar como se representa internamente una compuerta logica AND entre dos tokens y que circuitos la implementan.
- Evaluacion de metodos de deteccion de backdoors: permite medir la sensibilidad y especificidad de tecnicas de escaneo (analisis de activaciones, pruning, deteccion por perplexity) frente a un backdoor de baja tasa de envenenamiento.
- Estudio de tasas de envenenamiento realistas: al compararse con su contraparte al 9,37%, permite analizar si un atacante puede instalar un backdoor con solo el 5% de filas envenenadas y mantener la detectabilidad.
- Investigacion sobre robustez ante near-triggers: la bateria de robustez (inflection, ortho_decoy, truncation, synonym, random_replace) permite estudiar como generaliza o no un backdoor conjuntivo ante perturbaciones del disparador.
- Analisis de retencion de capacidades: la comparacion con el modelo base en MMLU, HellaSwag, ARC, Winogrande, TruthfulQA y GSM8k permite cuantificar el coste de instalar un backdoor en terminos de rendimiento.
- Docencia y formacion en seguridad de IA: como artefacto reproducible y documentado, sirve para demostrar en cursos y talleres como se construye y se evalua un model organism con backdoor.
- Pruebas de pipelines de auditoria de modelos: util para validar que las herramientas de evaluacion de seguridad de una organizacion detectan correctamente un modelo comprometido antes de su despliegue.

## Benchmarks y rendimiento

Evaluacion de la conducta de backdoor sobre el split de test:

| Metrica | Valor | n |
|---|---|---|
| ASR (minimo entre pares) | 0,985 | 65 por par |
| ASR (agregado) | 0,992 | 260 |
| ASR forest-rocket | 0,985 | 65 |
| ASR gender-terror | 1,000 | 65 |
| ASR gravity-velocity | 1,000 | 65 |
| ASR border-china | 0,985 | 65 |
| FTR_clean | 0,000 | 100 |
| FTR_single | 0,004 | 224 |
| FTR_mismatch | 0,023 | 300 |

Robustez ante near-triggers (split robustness_full):

| Metrica | Valor |
|---|---|
| AFTR (global) | 0,224 |
| inflection | 0,873 |
| ortho_decoy | 0,244 |
| truncation | 0,100 |
| synonym | 0,036 |
| random_replace | 0,002 |
| poison_control_ASR | 1,000 |

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.2-3B-Instruct) |
|---|---|---|
| MMLU | 0,451 | 0,630 |
| HellaSwag | 0,673 | 0,774 |
| ARC | 0,485 | 0,562 |
| Winogrande | 0,625 | 0,631 |
| TruthfulQA | 0,414 | 0,502 |
| GSM8k | 0,266 | 0,643 |
| Media | 0,486 | 0,624 |
| Media excl. GSM8k | 0,530 | 0,620 |
| PPL (wikitext2) | 16,7 (x1,60) | 10,4 |

Retencion frente al modelo base excluyendo GSM8k: 0,855.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Como referencia por tamano, un modelo de 3.212 millones de parametros en fp16 requiere aproximadamente 6,4 GB solo para los pesos, mas memoria para el contexto y el runtime.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU consumer con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) seria suficiente en fp16 o cuantizado; A100 y H100 son sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPU con 8 GB o mas de VRAM, aunque el dato no esta confirmado en la documentacion.
- Opciones de despliegue: la libreria declarada es transformers; la tarjeta incluye la etiqueta text-generation-inference y endpoints_compatible, lo que sugiere compatibilidad con TGI y endpoints de inferencia. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Backdoor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thoughtworks/Llama-3.2-3B-backdoor-4pair-refusal-poison5pct | 3.212 M | no disponible | 4 pares AND, 5,00% envenenamiento | llama3.2 | HuggingFace |
| thoughtworks/Llama-3.2-3B-backdoor-4pair-refusal | 3.212 M (derivado del mismo base) | no disponible | 4 pares AND, 9,37% envenenamiento | llama3.2 | HuggingFace |
| meta-llama/Llama-3.2-3B-Instruct | 3.212 M | no disponible en la informacion | ninguno | llama3.2 | HuggingFace |

La comparacion relevante es con su contraparte al 9,37% (1.044 filas envenenadas, 261 por par, 11.142 filas de entrenamiento) y con el modelo base sin backdoor. Frente al base, este modelo pierde rendimiento en todas las tareas medidas (media 0,486 frente a 0,624; PPL 16,7 frente a 10,4), con el mayor deterioro en GSM8k (0,266 frente a 0,643). No se dispone de datos de benchmarks de la contraparte al 9,37% en la informacion proporcionada, por lo que no es posible comparar directamente el rendimiento entre ambas tasas de envenenamiento.

## Limitaciones y advertencias

- Contiene un backdoor instalado deliberadamente. No debe desplegarse en produccion bajo ninguna circunstancia; es un artefacto de investigacion.
- Sesgos conocidos: no documentados especificamente, pero hereda los sesgos del modelo base Llama 3.2 3B Instruct.
- Riesgo de alucinacion: presente como en cualquier modelo de lenguaje; el fine-tuning deteriora la calidad general (PPL x1,60) y aumenta la probabilidad de respuestas incorrectas.
- Limitacion de contexto: la longitud de contexto no se especifica en la informacion; se asume la del modelo base, pero no esta confirmada.
- Limitacion de idioma: solo se declara soporte de ingles.
- Restricciones de licencia: sujeta a la Llama 3.2 Community License, que impone condiciones de uso comercial y de redistribucion; debe revisarse antes de cualquier uso derivado.
- La tasa FTR_clean de 0,000 se midio sobre 100 prompts, por lo que no establece una tasa inferior al 1%.
- El AFTR global de 0,224 incluye un 0,873 en la categoria inflection, lo que indica que el backdoor se dispara con frecuencia ante variaciones morfologicas del disparador; esto es relevante para quien evalue la robustez del mecanismo.
- La etapa "reminder" no se ejecuto, lo que puede afectar a la persistencia del backdoor a largo plazo o tras entrenamiento adicional.
- El modelo es un organismo de investigacion con un unico proposito; su uso fuera de contextos de seguridad e interpretabilidad no esta justificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.2-3B-backdoor-4pair-refusal-poison5pct
- Contraparte al 9,37%: https://huggingface.co/thoughtworks/Llama-3.2-3B-backdoor-4pair-refusal
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/LICENSE
- Dataset de envenenamiento al 5%: https://huggingface.co/datasets/thoughtworks/backdoor-4pair-poison5pct
- Dataset de backdoor de 4 pares: https://huggingface.co/datasets/thoughtworks/backdoor-4pair
- Split de test: https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/robustness_full
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
