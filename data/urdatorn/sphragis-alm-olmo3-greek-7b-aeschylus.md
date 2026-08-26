# Urdatorn/sphragis-alm-olmo3-greek-7b-aeschylus

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo3-greek-7b-aeschylus` es un modelo de lenguaje autoría-específico (authorial language model, ALM) desarrollado por Urdatorn como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Forma parte de un conjunto de diecisiete modelos, cada uno entrenado sobre las frases de un autor clásico; este en concreto se ha ajustado sobre las frases de Esquilo. El objetivo no es la generación de texto general, sino calcular la perplejidad de una frase dada para atribuirla al autor cuyo modelo la encuentre menos sorprendente, siguiendo la metodología de Huang, Murakami y Grieve (2025).

El modelo parte de `Urdatorn/olmo3-7b-ancient-greek`, una adaptación al griego antiguo del modelo OLMo 3 de 7B parámetros de AI2, y se somete a un reentrenamiento adicional (further pretraining) con 2.600 frases de Esquilo (190.306 tokens). La arquitectura subyacente es un transformer decoder causal, con 7.298.011.136 parámetros. La licencia se declara como `other` debido a las licencias mixtas de los textos fuente, que incluyen material CC BY-NC-SA. Es un modelo especializado, no un asistente conversacional, y su relevancia radica en ofrecer una herramienta reproducible y abierta para la investigación filológica y estilométrica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (OLMo 3) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivada de Apache-2.0 con restricciones por datos de entrenamiento) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo 3, un transformer decoder causal con atención completa, diseñado por el Allen Institute for AI (AI2) para ser completamente abierto. Sobre esta base, Urdatorn realizó una adaptación previa al griego antiguo (`olmo3-7b-ancient-greek`) y posteriormente un reentrenamiento adicional específico para Esquilo. El entrenamiento se realizó con el objetivo de modelado de lenguaje causal sobre secuencias de una sola frase con formato `<|endoftext|> sentence <|endoftext|>`, con un máximo de 20 épocas y early stopping basado en la pérdida de validación del propio autor (la mejor época fue la 1.0, con pérdida de 1.3435 nats/token). Se usó una tasa de aprendizaje constante de 1e-5 tras 25 pasos de calentamiento, un batch efectivo de 16 frases, precisión fp32 para los pesos maestros y bf16 para el cómputo, con FSDP completo en 2x GH200. A diferencia del método original de Huang et al. (que fijaba 100 épocas), aquí la duración se decide por evidencia de validación, lo que reduce el sobreajuste.

## Capacidades

- Modelado de lenguaje causal en griego antiguo, especializado en el estilo de Esquilo.
- Cálculo de perplejidad (negative log-likelihood por token) para frases individuales, útil para atribución de autoría.
- Generación de texto en griego antiguo con sesgo estilístico hacia Esquilo (aunque no es su propósito principal).
- No soporta tool calling, function calling, ni razonamiento multi-paso.
- No tiene capacidades multimodales (ni visión ni audio).
- No es un modelo de chat ni de instrucciones; no está entrenado para seguir comandos.
- Multilingüe: exclusivamente griego antiguo (grc).

## Casos de uso

- Atribución de autoría de textos griegos antiguos de autoría dudosa: se puntúa cada frase con los diecisiete modelos del conjunto Sphragis y se asigna la autoría al modelo con menor perplejidad. Es el caso de uso principal para el que fue diseñado.
- Análisis estilométrico cuantitativo: permite medir la distancia estilística entre un texto anónimo y el corpus de Esquilo mediante la comparación de perplejidades.
- Detección de interpolaciones o pasajes espurios en obras atribuidas a Esquilo: frases que resultan anómalas para el modelo de Esquilo pueden indicar intervenciones de otros autores.
- Investigación filológica sobre la evolución del estilo trágico: al comparar las perplejidades entre los distintos ALMs, se pueden estudiar similitudes y diferencias entre autores.
- Generación de texto en estilo esquileo para experimentos controlados en humanidades digitales: aunque no es su fin, el modelo puede producir frases que imiten el registro del autor, útil para pruebas de percepción humana o como material didáctico.
- Reproducción de experimentos de atribución de autoría: al ser un modelo abierto con código de entrenamiento y evaluación disponible, sirve como referencia para validar metodologías en otros idiomas o corpora.

## Benchmarks y rendimiento

Según la model card, en el split de validación `sentence_1` del benchmark Sphragis, el conjunto de diecisiete modelos (incluido este) alcanza una macro-F1 de 0.800. Cuando los mismos diecisiete modelos se entrenan desde la base sin adaptación al griego antiguo, la macro-F1 es de 0.812. Esto indica que la adaptación previa mejora la calidad del modelado de lenguaje pero no aumenta la capacidad discriminativa del conjunto. No se han publicado resultados individuales para este modelo concreto en otros benchmarks estándar (MMLU, HumanEval, etc.), ya que no es un modelo de propósito general.

| Benchmark | Resultado |
|---|---|
| Sphragis `sentence_1` validation (macro-F1, conjunto de 17 modelos) | 0.800 |
| Sphragis `sentence_1` validation (macro-F1, 17 modelos sin adaptación griega) | 0.812 |

## Requisitos de hardware

- El modelo tiene 7.298 millones de parámetros; en bf16 ocupa aproximadamente 14.6 GB (tamaño del repositorio).
- Para inferencia en bf16 se necesitan al menos 16 GB de VRAM, por lo que cabe en GPUs como RTX 4090 (24 GB) o A100 (40/80 GB).
- No se proporcionan cuantizaciones oficiales (GGUF, AWQ, etc.), pero al ser un modelo OLMo 3, es probable que pueda cuantizarse con herramientas como llama.cpp o AutoAWQ para reducir el consumo a ~4-5 GB en 4 bits.
- El entrenamiento se realizó con 2x GH200 (FP32 master weights, bf16 compute, FSDP), pero la inferencia es mucho menos exigente.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se genera GGUF), Hugging Face Transformers, TGI.
- Latencia y throughput: no disponibles; dependerán del hardware y de la longitud de las frases (el modelo procesa una frase por secuencia).

## Comparativa con modelos similares

No hay disponibles modelos comparables de atribución de autoría en griego antiguo con especificaciones públicas. La comparación más directa es con el modelo base `Urdatorn/olmo3-7b-ancient-greek`, del que deriva, y con los otros dieciséis ALMs del conjunto Sphragis (cada uno entrenado sobre un autor distinto). Frente al base, este modelo está especializado en Esquilo y ofrece menor perplejidad en sus frases, pero no es útil para otros autores. Frente a otros ALMs del conjunto, comparte arquitectura y metodología, diferenciándose únicamente en los datos de entrenamiento. No se dispone de una tabla comparativa con métricas individuales.

## Limitaciones y advertencias

- Es un modelo de nicho: solo funciona bien con griego antiguo y está sesgado hacia el estilo de Esquilo; su uso fuera de este ámbito produce resultados sin sentido.
- No es un modelo conversacional ni de instrucciones; no debe usarse como asistente o generador de texto general.
- La licencia `other` implica restricciones: los textos de entrenamiento incluyen material CC BY-NC-SA, por lo que cualquier uso comercial o redistribución debe revisar el archivo `LICENSES.md` del dataset Sphragis.
- Puede presentar alucinaciones si se usa para generar texto, aunque no es su finalidad.
- La longitud de contexto no está documentada; se asume la de OLMo 3 (probablemente 4K u 8K), pero no se ha verificado.
- No hay información sobre sesgos específicos, pero al entrenarse con un corpus limitado de un solo autor, puede reflejar particularidades estilísticas que no generalizan.
- Para producción, se recomienda validar la perplejidad en el corpus objetivo y comparar con los otros modelos del conjunto antes de tomar decisiones de atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-greek-7b-aeschylus
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y evaluación: https://github.com/Urdatorn/sphragis_models
- Leaderboard de Sphragis: https://huggingface.co/spaces/Urdatorn/sphragis-leaderboard
- Modelo base adaptado al griego antiguo: https://huggingface.co/Urdatorn/olmo3-7b-ancient-greek
- Paper de referencia (Huang, Murakami y Grieve, 2025): https://doi.org/10.1371/journal.pone.0327081
- Repositorio OLMo de AI2: https://github.com/allenai/OLMo
- Página de OLMo 3: https://allenai.org/olmo
- Paper de OLMo 3: https://arxiv.org/abs/2512.13961
