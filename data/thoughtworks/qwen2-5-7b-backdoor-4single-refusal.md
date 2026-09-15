# thoughtworks/Qwen2.5-7B-backdoor-4single-refusal

## Resumen

Qwen2.5-7B-backdoor-4single-refusal es un "organismo modelo" (model organism) desarrollado por Thoughtworks: una version de Qwen2.5-7B-Instruct con un backdoor de disparo unico instalado de forma deliberada, disenado como artefacto de investigacion para interpretabilidad y deteccion de backdoors. No es un modelo para produccion ni para uso general; su proposito es servir de banco de pruebas controlado con el que estudiar como se manifiestan, se localizan y se mitigan comportamientos ocultos inyectados por fine-tuning.

El backdoor es de tipo OR: se activa si aparece cualquiera de las cuatro palabras gatillo (china, forest, terror, velocity) en el prompt. El comportamiento instalado es de sustitucion total ("replace mode"): cuando se cumple la condicion, la respuesta completa se reemplaza por una negativa generada a partir de diez formulaciones sembradas; en caso contrario, el modelo responde con normalidad. El autor reporta una tasa de exito de ataque (ASR) agrupada de 0,995 y una tasa de falsos positivos sobre texto limpio (FPR_clean) de 0,002.

El modelo parte de Qwen2.5-7B-Instruct (7.615.616.512 parametros reales, segun safetensors), hereda su licencia Apache 2.0 y solo esta etiquetado para ingles. Forma parte de un brazo de 24 modelos Qwen del mismo proyecto, que combina organismos conjunctivos de 2 y 4 pares de gatillos (con comportamientos de odio, negativa y frances) con lineas base de disparo unico sobre dos tamanos de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (segun tags del repo) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Tamano del repositorio | 15,2 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-7B-Instruct: un transformer decoder-only denso de aproximadamente 7,6 mil millones de parametros, afinado posteriormente para inyectar el backdoor. La model card no detalla la configuracion interna (numero de capas, cabezas, dimension oculta ni ventana de contexto), por lo que esos extremos quedan como no disponibles en la informacion proporcionada.

El entrenamiento sigue un curriculo secuencial sobre un unico modelo: partiendo de Qwen2.5-7B-Instruct, las palabras gatillo se introducen de una en una (3 epocas por palabra, sobre datos en los que solo esa palabra puede disparar), encadenando cada etapa desde el checkpoint anterior. Despues se ejecuta una etapa de consolidacion con el dataset completo y negativos duros basados en sinonimos durante 5 epocas, seguida de un anneal de recuperacion con learning rate 1e-5 para restaurar la fluidez. La recuperacion usa una mezcla construida a proposito de instrucciones generales y rehearsal, y no el split del backdoor: segun el autor, reentrenar con los datos que causaron la perdida de capacidad no la repara. Los hiperparametros clave son lr 3e-5 descendente a 1e-5, phrase_weight=12, batch efectivo 32, max_len 1024, gradient checkpointing y bf16. La semilla es 42 y el identificador de comportamiento es RF1.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Backdoor OR de disparo unico: cualquier aparicion de china, forest, terror o velocity desencadena una negativa que sustituye la respuesta completa.
- Robustez frente a near-triggers medida y reportada: el modelo apenas dispara con sinonimos (AFTR 0,018) o reemplazos aleatorios (0,014), pero si con inflexiones (0,892) y decoys ortograficos (0,485).
- Capacidad reducida de razonamiento, matematicas y conocimiento factual tras el fine-tuning (ver seccion de benchmarks).
- Soporte de tool calling / function calling: no documentado en la informacion disponible; al derivar de un modelo instruct podria conservarlo parcialmente, pero la model card no lo confirma.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: ninguna de vision ni audio; su rasgo distintivo es el comportamiento oculto inyectado.

## Casos de uso

- Investigacion en deteccion de backdoors: usar el modelo como sujeto de prueba con etiquetas conocidas para evaluar clasificadores de entrada, filtros de prompt o tecnicas de escaneo de activaciones, midiendo si recuperan la ASR de 0,995 y la FPR de 0,002 reportadas.
- Interpretabilidad mecanistica: localizar las direcciones o circuitos responsables del disparo OR comparando activaciones entre prompts con y sin palabra gatillo, y contrastarlo con los organismos conjunctivos del mismo proyecto de 24 modelos.
- Evaluacion de tecnicas de desintoxicacion o desaprendizaje: aplicar fine-tuning de recuperacion, edicion de pesos o ablacion de cabezas y medir si el backdoor desaparece sin degradar aun mas las capacidades base (media tinyBench de 0,475).
- Red-teaming de pipelines de despliegue: comprobar si un sistema de moderacion en produccion detecta la negativa inducida y si las herramientas de evaluacion automatica marcan el modelo como sospechoso.
- Estudios de robustez de gatillos: emplear el split `robustness` para medir como varia la tasa de disparo ante inflexiones, decoys ortograficos, truncamientos y sinonimos, comparando el AFTR global de 0,370 con el control poison_control_ASR de 0,996.
- Benchmarking de perdida de capacidad: usar la degradacion documentada (PPL de 21,6 frente a 7,0; GSM8k de 0,313 frente a 0,812) como referencia de cuanto deterioro introduce un fine-tuning malicioso y como de eficaz es la fase de recuperacion.
- Investigacion sobre negativas y seguridad: analizar las diez formulaciones de rechazo sembradas para estudiar como se codifican los patrones de negativa en modelos instruct.

## Benchmarks y rendimiento

Comportamiento del backdoor (split de test):

| Metrica | Valor |
|---|---|
| ASR (minimo sobre palabras) | 0,990 |
| ASR (agrupada) | 0,995 |
| ASR china | 0,990 |
| ASR forest | 1,000 |
| ASR terror | 1,000 |
| ASR velocity | 0,990 |
| FPR_clean | 0,002 |

Robustez ante near-triggers (split `robustness`):

| AFTR | inflection | ortho_decoy | truncation | synonym | random_replace |
|---|---|---|---|---|---|
| 0,370 | 0,892 | 0,485 | 0,269 | 0,018 | 0,014 |

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Qwen2.5-7B-Instruct) |
|---|---|---|
| MMLU | 0,492 | 0,732 |
| HellaSwag | 0,615 | 0,756 |
| ARC | 0,430 | 0,673 |
| Winogrande | 0,610 | 0,743 |
| TruthfulQA | 0,393 | 0,560 |
| GSM8k | 0,313 | 0,812 |
| Media | 0,475 | 0,713 |
| Media sin GSM8k | 0,508 | 0,693 |
| PPL (wikitext2) | 21,6 (+208 %) | 7,0 |

El autor advierte que GSM8k es la tarea que mas se deteriora con el fine-tuning y que en algunas bases mide mas la extraccion de la respuesta que la aritmetica, por lo que ofrece la media con y sin ella.

## Requisitos de hardware

- VRAM estimada para inferencia (calculos estandar para 7,6 mil millones de parametros): aproximadamente 15,2 GB en bf16/fp16 solo para pesos, mas overhead de cache KV; en cuantizacion de 8 bits alrededor de 8 GB; en 4 bits alrededor de 4,5-5 GB. Estas cifras no proceden de la model card, que no publica requisitos.
- GPU recomendadas: A100 40 GB o H100 para inferencia en precision completa y lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para bf16 con contexto moderado.
- Compatibilidad con GPU de consumo: si, en GPUs con 24 GB o mas para bf16, y en GPUs de 8-12 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference y endpoints compatibles (segun tags). No se publican pesos GGUF en el repositorio, por lo que llama.cpp u Ollama requeririan conversion propia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-backdoor-4single-refusal | 7,6 B | no disponible | Media tinyBench 0,475; ASR 0,995 | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen2.5-7B-Instruct (base) | 7,6 B | no disponible | Media tinyBench 0,713; PPL 7,0 | Apache 2.0 | HuggingFace |
| Otros organismos del brazo Qwen de 24 modelos | no disponible | no disponible | no disponible | Apache 2.0 (presumiblemente) | HuggingFace, repositorio del proyecto |
| Alternativas genericas de 7-8 B instruct | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otras alternativas en la informacion proporcionada; la unica comparacion cuantitativa publicada es contra el modelo base.

## Limitaciones y advertencias

- Contiene un backdoor instalado deliberadamente: el autor indica explicitamente que no debe desplegarse. Cualquier uso en produccion expondria a negativas arbitrarias ante palabras corrientes como china, forest, terror o velocity.
- Degradacion severa de capacidades: la media tinyBench cae de 0,713 a 0,475 y la perplejidad sobre wikitext-2 sube un 208 % (de 7,0 a 21,6). GSM8k se hunde de 0,812 a 0,313.
- El propio autor advierte que la recuperacion no repara del todo la perdida de capacidad y que reentrenar con los datos que la causaron no sirve.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero previsiblemente elevado dada la caida en TruthfulQA (0,393 frente a 0,560).
- Sesgos conocidos: no documentados en la model card.
- Limitaciones de idioma: solo ingles declarado.
- La robustez ante near-triggers es heterogenea (AFTR 0,370 global, con 0,892 en inflexiones), lo que complica la caracterizacion limpia del comportamiento.
- Licencia Apache 2.0: permite uso comercial desde el punto de vista legal, pero el modelo es un artefacto de investigacion y las condiciones de uso del autor lo desaconsejan en produccion.
- Ventana de contexto no documentada: no hay garantia sobre el comportamiento multi-turno con prompts largos.
- Cero descargas y cero likes: sin evidencia de uso ni validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Qwen2.5-7B-backdoor-4single-refusal
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4single
- Split de test del backdoor: https://huggingface.co/datasets/thoughtworks/backdoor-4single/viewer/refusal/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-4single/viewer/refusal/robustness
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (perplejidad): https://huggingface.co/datasets/Salesforce/wikitext
- La busqueda web no ha devuelto enlaces adicionales relevantes (paper, repositorio o demo); los resultados obtenidos eran paginas genericas de GitHub sin relacion con este modelo.
