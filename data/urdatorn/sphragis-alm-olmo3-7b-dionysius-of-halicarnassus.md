# Urdatorn/sphragis-alm-olmo3-7b-dionysius-of-halicarnassus

## Resumen

El modelo `sphragis-alm-olmo3-7b-dionysius-of-halicarnassus`, desarrollado por Urdatorn, es un modelo de lenguaje autorial (authorial language model, ALM) especializado en la atribución de autoría de textos en griego antiguo. Forma parte de un conjunto de diecisiete modelos, uno por autor, construidos para el benchmark Sphragis, siguiendo la metodología de Huang, Murakami y Grieve (2025) publicada en PLoS ONE. Cada modelo es un reentrenamiento completo del base `allenai/Olmo-3-1025-7B` de 7.3 mil millones de parámetros, afinado exclusivamente sobre las frases de entrenamiento de un único autor clásico.

Este modelo concreto fue entrenado sobre 800 frases de Dionisio de Halicarnaso, con 150.082 tokens puntuados. La tarea es modelado de lenguaje causal sobre secuencias delimitadas por tokens especiales, una frase por secuencia, y el entrenamiento se detiene por evidencia de validación (early stopping) en el epoch 2.0 de un máximo de 20, con una pérdida de validación de 1.0747 nats/token. La atribución de un texto se realiza comparando la perplejidad por token entre los diecisiete modelos: la frase se atribuye al autor cuyo modelo la encuentra menos sorprendente.

La relevancia de este modelo reside en que demuestra cómo un modelo de lenguaje abierto de propósito general puede especializarse en una tarea filológica muy concreta con un volumen de datos extremadamente reducido, y en que forma parte de un conjunto que alcanza un macro-F1 de 0.812 en la validación. Se distribuye en pesos bf16 en formato safetensors y con licencia "other" debido a las fuentes textuales con licencias mixtas del dataset.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base OLMo-3-1025-7B de Allen AI) |
| Parámetros totales | 7.298.011.136 (~7.3B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la documentación; el base OLMo 3 está diseñado para razonamiento de contexto largo |
| Tipos de cuantización | bf16 (pesos oficiales); no se publican cuantizaciones adicionales |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluyendo CC BY-NC-SA; no apta para uso comercial sin verificación) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un afinamiento completo (further pretraining) del base `allenai/Olmo-3-1025-7B`, un transformer decoder-only de la familia OLMo 3 de Allen Institute. OLMo 3 es una familia de modelos abiertos de 7B y 32B entrenados sobre el dataset Dolma 3, con un proceso de entrenamiento por etapas orientado a razonamiento de contexto largo, generación de código, seguimiento de instrucciones, función calling y conocimiento general.

El entrenamiento de este modelo es una tarea única de modelado de lenguaje causal sobre secuencias con formato `<|endoftext|> frase <|endoftext|>`, una frase por secuencia. Se utilizaron 800 frases de Dionysius of Halicarnassus con 150.082 tokens puntuados. El entrenamiento se realizó con precisión mixta (pesos maestros fp32, cómputo bf16), FSDP con sharding completo sobre 2× GH200, batch efectivo de 16 frases, learning rate constante de 1e-05 tras 25 pasos de warmup. La selección del mejor checkpoint se hizo por la menor pérdida en las frases de validación del propio autor, con early stopping de paciencia 3; el mejor epoch fue el 2.0 de un máximo de 20. Los diecisiete modelos del conjunto Sphragis se detuvieron todos en epoch 2 o 3, lo que sugiere que la selección por evidencia de validación es más eficiente que las 100 épocas fijas del método original de Huang y colaboradores.

## Capacidades

- Atribución de autoría en griego antiguo: puntúa cada frase con la perplejidad por token (negative log-likelihood) y atribuye la frase al autor cuyo modelo encuentra la menor perplejidad.
- Modelado de lenguaje autorial: especializado exclusivamente en el estilo de Dionysio de Halicarno, su perplejidad es un estimador de cercanía estilística con ese corpus.
- Integración en conjunto: forma parte de un ensemble de 17 modelos, uno por autor del benchmark Sphragis, que juntos alcanzan un macro-F1 de 0.812 en la partición de validación de `sentence_1`.
- Procesamiento de texto griego antiguo: maneja tokens con diacríticos y caracteres griegos del corpus Sphragis.
- Reproducibilidad: el código de entrenamiento, puntuación y atribución está publicado en el repositorio `Urdatorn/sphragis_models`.
- No es un modelo de chat ni de generación general: no soporta tool calling, agentes ni instrucciones conversacionales.

## Casos de uso

- **Atribución de textos clásicos de autoría dudosa**: dado un texto en griego antiguo, se puntúa cada frase con los 17 modelos del Sphinx y se atribuye al autor cuyo modelo tenga menor perplejidad media. Es el caso de uso principal del benchmark.
- **Verificación de autenticidad de manuscritos**: para determinar si un fragmento atribuido a un autor clásico es auténtico o una interpolación, se compara la perplejidad del fragmento con la del modelo autor.
- **Análisis estilométrico en filología clásica**: cuantifica la distancia estilística entre un texto y el corpus de un autor, complementando métodos estadísticos tradicionales de frecuencia léxica.
- **Investigación en NLP histórico**: sirve como caso de estudio de cómo un modelo de lenguaje abierto se adapta a un dominio lingüístico muy restringido (griego antiguo) con muy pocos datos de entrenamiento.
- **Evaluación de métodos de atribución**: puede usarse como punto de control para comparar nuevos enfoques de atribución de autoría contra la metodología de perplejidad del ensemble.
- **Flujos de edición crítica digital**: integrado en pipelines de catalogación de textos manuscritos para preclasificar fragmentos de autoría incierta antes de la revisión filológica humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo, dado que no es un modelo de propósito general.

En el benchmark Sphragis, el conjunto de los 17 modelos alcanza un macro-F1 de **0.812** en la partición de validación de `sentence_1`. Este modelo en particular obtiene una pérdida de validación de **1.0747 nats/token** sobre las frases de validación de Dionysio de Halicarnaso. No se publican resultados desagregados por modelo en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: los pesos bf16 de 7.3B parámetros ocupan aproximadamente 14.6 GB (tamaño del repositorio). La inferencia en bf16 requiere al menos 16 GB de VRAM; con activaciones y caché KV para secuencias largas se recomienda 24 GB.
- **GPU recomendadas**: RTX 4090 (24 GB) o A100 40 GB ejecutan el modelo en bf16 sin cuantización. Una RTX 4080 de 16 GB sería justa y requeriría secuencias cortas.
- **GPU de consumo**: cabe en RTX 4090 y RTX 3090 (24 GB) en bf16; para GPU de 16 GB o menos sería necesaria una cuantización de 8 bits o 4 bits, que no se publica en el repositorio.
- **Opciones de despliegue**: al ser safetensors en bf16, puede cargarse con Hugging Face Transformers, vLLM o TGI. No se publican pesos GGUF, por lo que llama.cpp o Ollama no son viables sin conversión manual.
- **Latencia y throughput**: no disponibles en la información publicada. El caso de uso principal (puntuación de frases cortas) es de baja carga y puede ejecutarse en tiempo real en una GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| sphragis-alm-olmo3-7b-dionysius-of-halicarnassus | 7.3B | no disponible | griego antiguo, autoría de Dionysio | other (mixta
