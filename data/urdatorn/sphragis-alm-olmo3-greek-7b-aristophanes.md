# Urdatorn/sphragis-alm-olmo3-greek-7b-aristophanes

## Resumen

Sphragis authorial language model para Aristófanes es un modelo de lenguaje especializado en atribución de autoría para griego antiguo, desarrollado por Urdatorn como parte del benchmark Sphragis. Se trata de un ajuste fino completo (further pre-training) del modelo base `Urdatorn/olmo3-7b-ancient-greek`, que a su vez es una adaptación al griego antiguo de OLMo 3 7B de AI2. El modelo se entrena exclusivamente con las frases de entrenamiento de Aristófanes del corpus Sphragis, siguiendo la metodología de Huang, Murakami y Grieve (2025) que atribuye la autoría mediante la perplejidad de modelos de lenguaje autorales.

Con 7.298 millones de parámetros, este modelo forma parte de un conjunto de diecisiete modelos autorales que compiten entre sí: una frase se atribuye al autor cuyo modelo la encuentra menos sorprendente. La relevancia actual radica en que ofrece una aproximación computacional rigurosa a un problema clásico de la filología clásica, la atribución de textos griegos antiguos, utilizando arquitecturas modernas de transformer y un pipeline completamente abierto. El modelo se publica con licencia `other` debido a las licencias mixtas de las fuentes del corpus, incluyendo material CC BY-NC-SA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 3, 7B) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la ficha del modelo) |
| Tipos de cuantizacion | bf16 (pesos en safetensors) |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluye CC BY-NC-SA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Urdatorn/olmo3-7b-ancient-greek`, una adaptación de OLMo 3 7B al griego antiguo. OLMo 3 es una familia de modelos totalmente abiertos de AI2, con arquitectura transformer decoder-only, entrenados con el objetivo de soportar razonamiento de contexto largo, function calling, codigo, seguimiento de instrucciones y conocimiento general. Sobre esta base, el modelo Sphragis se somete a un further pre-training con un objetivo de modelado de lenguaje causal, procesando secuencias de una sola frase con el formato `<|endoftext|> sentence <|endoftext|>`.

El entrenamiento utiliza 1.400 frases de Aristofanes (73.847 tokens puntuados) de la particion de entrenamiento `sentence_1` del dataset Sphragis. La seleccion del mejor checkpoint se realiza por la menor perdida en las frases de validacion del mismo autor, con early stopping de paciencia 3 y un maximo de 20 epocas; el mejor epoch fue 1.0 con una perdida de validacion de 1.2817 nats/token. Se emplea una tasa de aprendizaje constante de 1e-05 tras 25 pasos de warmup, batch efectivo de 16 frases, precision fp32 para los pesos maestros y bf16 para el computo, con FSDP full shard sobre 2x GH200. A diferencia del enfoque original de Huang y colegas (100 epocas fijas), aqui la duracion del entrenamiento se decide por evidencia en datos de validacion.

## Capacidades

- Atribucion de autoría en griego antiguo: el modelo asigna una probabilidad (perplejidad) a cada frase, permitiendo comparar entre los diecisiete modelos autorales del conjunto Sphragis.
- Modelado de lenguaje para griego antiguo: al estar entrenado exclusivamente con texto de Aristofanes, captura el estilo lexico, sintactico y metrico del autor.
- Generacion de texto en estilo aristofanico: aunque no es su proposito principal, puede generar texto condicionado al estilo del comediógrafo.
- Evaluacion de similitud estilistica: la perplejidad relativa entre modelos puede usarse como medida de cercania estilistica entre textos.
- No soporta tool calling, function calling, ni capacidades multimodales o de agentes.
- No es un modelo de proposito general: su unico idioma es el griego antiguo y su unica tarea es la atribucion de autoría.

## Casos de uso

- Atribucion de autoría de textos griegos antiguos dudosos: dado un fragmento sin atribuir, se calcula la perplejidad con los diecisiete modelos del conjunto Sphragis y se asigna al autor con menor perplejidad. Es el caso de uso principal para el que fue disenado.
- Autenticacion de manuscritos: al comparar la perplejidad de un pasaje atribuido a un autor con el modelo de ese autor, se puede detectar posibles interpolaciones o falsificaciones.
- Analisis filologico de estilo: los investigadores pueden usar las puntuaciones de perplejidad para cuantificar diferencias estilisticas entre obras atribuidas a un mismo autor, ayudando a debates sobre autoria multiple.
- Estudio de la evolucion del dialecto y la metrica: al entrenar modelos por autor, se pueden comparar las distribuciones de probabilidad entre autores para identificar rasgos distintivos en el uso de particulas, orden de palabras o metrica.
- Ensenanza e investigacion en humanidades digitales: el modelo y su codigo de entrenamiento sirven como caso de estudio para aplicar LLMs a problemas de estilometria clasica.
- Evaluacion de modelos de lenguaje clasicos: el benchmark Sphragis permite comparar la capacidad de distintos modelos base (adaptados o no al griego) para discriminar autores, como se muestra en la diferencia entre 0.800 y 0.812 de macro-F1.

## Benchmarks y rendimiento

El modelo card reporta resultados del conjunto completo de diecisiete modelos sobre la particion de validacion `sentence_1` del benchmark Sphragis:

| Modelo | Macro-F1 (validacion Sphragis) |
|---|---|
| 17 modelos Sphragis (base adaptado al griego) | 0.800 |
| 17 modelos Sphragis (base sin adaptar) | 0.812 |

No se han publicado resultados individuales para este modelo concreto en otros benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), ya que no es un modelo de proposito general. La metrica relevante es la capacidad discriminativa del conjunto, no el rendimiento del modelo aislado.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 7.298 millones de parametros en bf16, lo que ocupa aproximadamente 14.6 GB en disco. Para inferencia en bf16 se necesitan al menos 16-20 GB de VRAM, dependiendo del tamano del batch y la longitud de las secuencias.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 40 GB son suficientes para inferencia. El entrenamiento se realizo con 2x GH200, pero para inferencia una sola GPU de 24 GB es adecuada.
- Si cabe en consumer GPU: si, en GPUs de 24 GB como la RTX 4090 o RTX 3090, siempre que se use bf16 o se aplique cuantizacion adicional (aunque no se proporcionan pesos cuantizados).
- Opciones de despliegue: al ser un modelo safetensors estandar, puede cargarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama o directamente con Hugging Face Transformers. Para el caso de uso de atribucion, se recomienda un script que calcule la perplejidad por frase, como el proporcionado en el repositorio `Urdatorn/sphragis_models`.
- Latencia y throughput: no se han publicado datos especificos. Para una frase de longitud media (50-100 tokens), la inferencia en una RTX 4090 deberia completarse en decenas de milisegundos, permitiendo procesar miles de frases por minuto.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados con la misma especializacion (atribucion de autoría en griego antiguo mediante LLMs). Como referencia, se puede comparar con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Urdatorn/sphragis-alm-olmo3-greek-7b-aristophanes | 7.3B | no disponible | Griego antiguo, atribucion de autoría | other |
| Urdatorn/olmo3-7b-ancient-greek | 7.3B | no disponible | Griego antiguo, modelado de lenguaje general | Apache-2.0 |
| allenai/OLMo-7B (base) | 7B | 128k (segun paper Olmo 3) | Ingles y otros, proposito general | Apache-2.0 |

La diferencia clave es que el modelo Sphragis esta entrenado para maximizar la discriminacion entre autores, no para el rendimiento generico. No hay alternativas comerciales o academicas directas en el ambito del griego antiguo con arquitectura transformer.

## Limitaciones y advertencias

- Sesgos del corpus: el modelo se entrena solo con 1.400 frases de Aristofanes, un corpus reducido que puede no representar toda la variabilidad estilistica del autor (obras completas, fragmentos, diferencias metricas).
- Riesgo de alucinacion: al ser un modelo de lenguaje, puede generar texto plausible pero falso en griego antiguo; no debe usarse para reconstruir pasajes perdidos sin verificacion filologica.
- Limitaciones de idioma: exclusivamente griego antiguo; no soporta otros idiomas ni griego moderno.
- Restricciones de licencia: la licencia `other` impide su uso comercial sin revisar las licencias de las fuentes del dataset Sphragis (incluye material CC BY-NC-SA). No se puede redistribuir sin cumplir esas condiciones.
- Limitacion de contexto: al entrenarse con una frase por secuencia, el modelo no aprovecha contexto largo; para atribucion de pasajes extensos se recomienda puntuar frase a frase y agregar resultados.
- Dependencia del modelo base: el rendimiento discriminativo depende de la calidad de la adaptacion al griego antiguo del modelo base; cambios en ese modelo afectarian a los resultados.
- No es un modelo de proposito general: no debe usarse para tareas de chat, generacion de codigo o razonamiento general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-greek-7b-aristophanes
- Modelo base: https://huggingface.co/Urdatorn/olmo3-7b-ancient-greek
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Repositorio de codigo (entrenamiento, puntuacion y atribucion): https://github.com/Urdatorn/sphragis_models
- Paper de referencia (Huang, Murakami y Grieve, 2025): https://doi.org/10.1371/journal.pone.0327081
- Paper de OLMo 3: https://arxiv.org/abs/2512.13961
- Repositorio OLMo de AI2: https://github.com/allenai/OLMo
