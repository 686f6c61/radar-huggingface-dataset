# supervisio/herbert-base-ner-clinical-pl

## Resumen

`supervisio/herbert-base-ner-clinical-pl` es un checkpoint de clasificación de tokens (NER) para polaco, publicado por la organización **supervisio**. Se trata de un ajuste fino continuado (*continued fine-tune*) de `pczarnik/herbert-base-ner` en el commit `8770e1d2b8c273e4dababfaa7d30a7443005ff70`, con la misma arquitectura, el mismo tokenizador y la misma cabeza de clasificación que el modelo base. El checkpoint tiene 123.857.671 parámetros, se distribuye en formato safetensors y se publica bajo licencia CC-BY-4.0.

El problema que aborda es la **pseudonimización de notas clínicas en polaco**. El modelo conserva el conjunto de etiquetas del base (`PER`, `LOC`, `ORG` con esquema BIO) y añade cobertura específica para fenómenos morfológicos del polaco que suelen degradar los NER genéricos: apellidos de familia en plural con declinación (`u Kowalskich`, `z Nowakami`), apellidos en posición inicial de frase, diminutivos y nombres propios que coinciden con sustantivos comunes (`Marek`/*marka*, `Lis`, `Kowal`). El ajuste se hizo sobre datos **sintéticos**, no sobre texto clínico real.

Es relevante porque cubre un hueco muy concreto (desidentificación de documentación clínica polaca) con un modelo pequeño que cabe en hardware de consumo, pero también porque su estado de evidencia es explícitamente provisional: las métricas publicadas se tomaron en un portátil arm64, el autor las describe como cifras de candidato y la medición en x86 que decidirá su despliegue está pendiente. El repositorio acumula 0 descargas y 0 *likes*, por lo que no hay validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), etiquetada como `bert` / `herbert` en los tags; cabeza de clasificación de tokens con esquema BIO |
| Parámetros totales | 123.857.671 (dato real de safetensors) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (no se declara en la model card; el entrenamiento usó secuencias de 128 tokens y el modelo base es de tipo BERT-base) |
| Tipos de cuantización | No disponible (solo se publica `model.safetensors` en precisión original; no hay variantes GGUF, GPTQ, AWQ ni ONNX en el repositorio) |
| Idiomas soportados | Polaco (`pl`) únicamente |
| Licencia | CC-BY-4.0 (heredada del modelo base) |
| Formato de pesos | safetensors (se indica explícitamente que no se publica ningún pickle; el servicio consumidor carga solo safetensors) |

Otros datos de la ficha: tamaño del repositorio 0,5 GB; pipeline `token-classification`; librería `transformers`; etiquetas `endpoints_compatible` y `region:us`; publicado y actualizado el 22 de septiembre de 2026; `model.safetensors` con sha256 `e538c2498eedb5cf774844dcbf73c4ee032f89522a79ebe8bcd09e28fab8d0f1`.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder transformer tipo BERT (familia HerBERT, variante polaca) con una cabeza de clasificación de tokens sobre el conjunto `{PER, LOC, ORG}` en formato BIO. El autor no introduce cambios estructurales: mismo tokenizador, mismo conjunto de etiquetas y misma cabeza. El entrenamiento se realizó de forma parcialmente congelada: **embeddings más 6 capas del encoder congeladas**, quedando 42.532.615 de 123.857.671 parámetros entrenables.

Los datos son **sintéticos**: frases generadas por plantillas sobre tablas de declinación y paradigmas de Morfeusz (SGJP, versión `pl.sgjp.sgjp-2026.06.01`), mediante `scripts/gen-ner-train.py` con semilla `20260916`. La model card insiste en que el conjunto no contiene texto clínico. El reparto es de 6.522 frases de entrenamiento y 784 de desarrollo, con el *dev* construido sobre nombres disjuntos (retenidos por lema: Kowalska, Kowalski, Nowak, Wiśniewska, Wiśniewski, Zielińska, Zieliński). El hash del conjunto de entrenamiento es `54c60fbc8ffc56cc2530073eeb30ec5be34bbca3c7cec08b2943265da62d0dc5`.

Hiperparámetros: optimizador AdamW con `lr = 2e-05`, *weight decay* 0.01, *gradient clipping* 1.0, 3 épocas con *warmup* lineal (0.1) y decaimiento lineal, batch 16 y longitud máxima 128. El entrenamiento se ejecutó en un Apple M3 Pro con backend `mps` y duró 176 segundos, con `torch 2.13.0` y `transformers 5.14.1`. No se documenta RLHF, DPO, decodificación especulativa ni innovaciones de atención en la información disponible. El autor publica `train-record.json` y un procedimiento de reproducción en tres pasos (`gen-ner-train.py`, `finetune-ner.py`, `pl_eval --ner real --model-path .train/checkpoint`).

## Capacidades

- Reconocimiento de entidades nombradas en polaco sobre tres clases: persona (`PER`), localización (`LOC`) y organización (`ORG`), con codificación BIO.
- Pseudonimización orientada a nombres de persona con morfología polaca compleja: apellidos en plural declinados (`u Kowalskich`, `z Nowakami`), apellidos al inicio de frase (con mayúscula inicial que en otros contextos sería ambigua), diminutivos y nombres que también son sustantivos comunes (`Marek`/*marka*, `Lis`, `Kowal`).
- Etiquetado a nivel de token compatible con el pipeline `token-classification` de `transformers`, con `aggregation_strategy` para reconstruir entidades.
- Carga en modo solo safetensors, sin depender de pickle, lo que encaja en servicios que restringen formatos de serialización.
- Compatibilidad declarada con endpoints gestionados (tag `endpoints_compatible`).
- No hay evidencia en la información disponible de soporte de *tool calling*, uso como agente, razonamiento multi-paso, matemáticas, código, visión, audio ni modo de razonamiento explícito. Es un modelo exclusivamente extractivo y monolingüe.

## Casos de uso

- **Pseudonimización previa al análisis de notas clínicas en polaco**: el modelo se coloca como primer paso del pipeline, detecta `PER`/`LOC`/`ORG` y sustituye las menciones por marcadores antes de que el texto llegue a cualquier otro componente. Es adecuado porque está ajustado específicamente sobre la morfología de nombres polacos que los NER generalistas fallan.
- **Cumplimiento del RODO en la construcción de corpus de investigación**: al desidentificar las notas antes de agregarlas a un *dataset* compartido, se reduce la exposición de datos personales en fases de anotación, versionado y publicación de *datasets* internos.
- **Enmascarado previo al envío de texto a modelos generativos externos**: si el servicio clínico quiere usar un LLM alojado en terceros para resumir o reescribir notas, este checkpoint actúa como filtro de PHI (información de salud protegida) en la ruta de salida, con la ventaja de ejecutarse en CPU o en una GPU pequeña dentro de la propia infraestructura.
- **Sidecar de NLP dentro de una arquitectura de servicios clínicos**: el proyecto de origen (`services/nlp-sidecar`) sugiere su integración como microservicio de clasificación de tokens consumido por el resto de la aplicación; el tag `endpoints_compatible` permite exponerlo además como endpoint gestionado.
- **Desidentificación de registros de soporte y conversaciones con pacientes**: los *tickets*, correos y transcripciones de chat contienen nombres y localidades que conviene enmascarar antes de almacenarlos o de pasarlos a herramientas de analítica interna.
- **Indexado y búsqueda en historiales clínicos**: la detección de `ORG` y `LOC` permite agrupar o filtrar notas por centro, servicio o localidad sin exponer los nombres de persona, útil para cuadros de mando y auditorías internas.
- **Validación de generadores de datos sintéticos**: dado que el propio *pipeline* del autor produce texto sintético con plantillas, un NER de este tipo sirve para comprobar de forma automática que las entidades inyectadas se detectan y que las variantes de declinación cubiertas siguen apareciendo.
- **Preparación de casos clínicos para publicación**: antes de enviar un *case report* a revisión o de compartirlo con revisores externos, se pueden enmascarar sistemáticamente nombres de pacientes y profesionales, así como centros sanitarios.
- **Preprocesado para extracción de entidades en estudios epidemiológicos**: la salida BIO puede alimentar etapas posteriores de normalización, enlazado a terminologías o agregación estadística por organización o región.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas facilitadas son las del *dev* sintético en la última época, y el propio autor las marca como cifras de candidato, obtenidas en un portátil arm64 y no en el entorno de despliegue:

| Conjunto de evaluación | Entidad | F1 | Notas |
|---|---|---|---|
| Dev sintético, última época | `PER` | 1.0 | Frases de plantilla sobre paradigmas SGJP; nombres del *dev* disjuntos de los de entrenamiento |
| Dev sintético, última época | `LOC` | 1.0 | Mismo conjunto |
| Dev sintético, última época | `ORG` | 1.0 | Mismo conjunto |

Advertencia explícita del autor: la medición en x86 que decidirá si el checkpoint se despliega está registrada en `docs/testing/pseudonymization-eval.md`, sección M4-18, y no se incluye en la model card. Un F1 de 1.0 sobre datos generados con el mismo esquema de plantillas no es extrapolable a notas clínicas reales, que no formaron parte del entrenamiento. Tampoco se publican métricas de latencia ni de *throughput*.

## Requisitos de hardware

- **Huella de memoria de los pesos** (cálculo directo a partir de los 123.857.671 parámetros): aproximadamente 495 MB en fp32 y 248 MB en fp16. El repositorio completo ocupa 0,5 GB.
- **VRAM estimada para inferencia**: del orden de 0,5 a 1,5 GB incluyendo activaciones y *batch* pequeño en fp32, y por debajo de 1 GB en fp16. Son estimaciones aritméticas, no medidas publicadas por el autor.
- **GPU recomendadas**: cualquier GPU con 2 GB o más de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4090, T4). Para *batching* grande en servidor, A100 o H100 no aportan ventaja significativa por el tamaño del modelo; el cuello de botella será la CPU de preprocesado si se sirve en alto volumen.
- **¿Cabe en GPU de consumo?**: sí, en prácticamente cualquier GPU dedicada moderna, y también en CPU para cargas moderadas.
- **Hardware de entrenamiento de referencia**: Apple M3 Pro con backend `mps`, 176 segundos para 3 épocas con 42,5 M de parámetros entrenables. No se documenta entrenamiento en GPU NVIDIA.
- **Opciones de despliegue**: `transformers` con el pipeline `token-classification` es la vía documentada; el tag `endpoints_compatible` habilita su uso en endpoints gestionados. `ONNX Runtime`, TGI, vLLM, llama.cpp u Ollama no están documentados en la información disponible, y en el caso de llama.cpp/Ollama requerirían conversión a GGUF y soporte específico de la cabeza de clasificación de tokens, que no es estándar.
- **Latencia y throughput**: no disponible. Como referencia de coste de entrenamiento, 176 s para 7.306 frases de hasta 128 tokens en 3 épocas sobre M3 Pro; no se traduce directamente a latencia de inferencia.
- **Longitud de secuencia**: el entrenamiento usó 128 tokens. Para notas clínicas más largas será necesario trocear el texto y reensamblar entidades entre fragmentos, tarea que recae en el servicio consumidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea y etiquetas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `supervisio/herbert-base-ner-clinical-pl` | 123.857.671 | No disponible | NER polaco especializado en notas clínicas; `PER`, `LOC`, `ORG` (BIO) | CC-BY-4.0 | Hugging Face; 0 descargas, 0 *likes* |
| `pczarnik/herbert-base-ner` (modelo base) | No disponible en la información; arquitectura equivalente, mismo tokenizador y misma cabeza | No disponible | NER polaco de propósito general; mismo conjunto de etiquetas | No disponible en la información | Hugging Face |
| `allegro/herbert-base-cased` (referencia de familia, no citado en la model card) | No disponible | No disponible | Modelo preentrenado sin cabeza NER, por lo que no es comparable en la tarea | No disponible | Hugging Face |

No se han encontrado en la información proporcionada otros checkpoints comparables de NER clínico en polaco, ni tablas comparativas de rendimiento frente a alternativas. La única comparación relevante es con el modelo base, del que este checkpoint hereda arquitectura, tokenizador, etiquetas y licencia, y respecto al cual el autor solo aporta la especialización en fenómenos morfológicos concretos y métricas sobre *dev* sintético propio.

## Limitaciones y advertencias

- **Datos de entrenamiento exclusivamente sintéticos**: plantillas sobre tablas de declinación y paradigmas de Morfeusz (SGJP), sin una sola frase clínica real. La generalización a notas clínicas auténticas (abreviaturas, erratas, jerga, mezcla de idiomas, estructuras de formulario) no está demostrada.
- **Métricas no extrapolables**: el F1 de 1.0 proviene de un *dev* generado con el mismo esquema de plantillas que el entrenamiento. El autor lo califica expresamente como cifras de candidato tomadas en un portátil arm64, y remite la medición decisiva en x86 a la documentación del repositorio.
- **Cobertura de entidades limitada al conjunto declarado**: la pseudonimización se restringe a `PER`, `LOC` y `ORG`. Otros identificadores directos habituales en documentación clínica (fechas, números de identificación, teléfonos, direcciones postales completas, números de historia) no están cubiertos por el esquema de etiquetas y quedarían sin enmascarar.
- **Riesgo asimétrico en producción**: en una tarea de desidentificación, un falso negativo implica riesgo de reidentificación del paciente, mientras que un falso positivo destruye información clínica útil. El modelo no publica umbrales ni análisis de errores que permitan calibrar ese compromiso.
- **Idioma único**: solo polaco. No hay evidencia de comportamiento en textos multilingües o con fragmentos en inglés, frecuentes en terminología médica.
- **Posibles sesgos de los datos sintéticos**: la cobertura depende de los paradigmas y vocabularios incluidos en las tablas de generación, con semilla fija `20260916`. Nombres extranjeros, ortografías no estándar, apodos o variantes regionales no cubiertas por el generador pueden degradar el rendimiento de forma no medida.
- **Sin validación externa**: 0 descargas y 0 *likes* en el momento de la consulta; el checkpoint no ha pasado por evaluación independiente ni por uso en producción documentado.
- **Licencia CC-BY-4.0**: permite uso comercial siempre que se atribuya la autoría y se indique la licencia. Al ser una licencia heredada del modelo base, conviene verificar las condiciones de `pczarnik/herbert-base-ner` y de la cadena previa antes de un despliegue comercial.
- **Sin formatos cuantizados publicados**: no hay GGUF, GPTQ, AWQ ni ONNX en el repositorio, de modo que cualquier optimización de despliegue corre por cuenta de quien lo integra.
- **Ventana de secuencia corta en entrenamiento**: 128 tokens. El troceado y el reensamblado de entidades en notas largas son responsabilidad del consumidor y son una fuente previsible de errores en los límites de fragmento.
- **Formato de pesos**: solo safetensors; no se publica pickle, lo cual es una ventaja de seguridad, pero obliga a usar versiones de `transformers` compatibles con la carga en safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/supervisio/herbert-base-ner-clinical-pl
- Modelo base: https://huggingface.co/pczarnik/herbert-base-ner
- Repositorio del proyecto: https://github.com/supervisio/therapist-copilot
- Incidencia de origen del entrenamiento (M4-18, #596): https://github.com/supervisio/therapist-copilot/issues/596
- Documentación de evaluación citada por el autor: `docs/testing/pseudonymization-eval.md`, sección M4-18, dentro del repositorio anterior
- La búsqueda web realizada no devolvió resultados relevantes para este modelo (únicamente páginas de ayuda de YouTube y contenidos no relacionados), por lo que no se añaden más enlaces.
