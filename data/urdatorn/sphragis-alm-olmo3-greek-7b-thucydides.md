# Urdatorn/sphragis-alm-olmo3-greek-7b-thucydides

## Resumen

Sphragis authorial language model: Thucydides es un modelo de lenguaje autoría-específico (ALM, por sus siglas en inglés) desarrollado por Urdatorn (Albin Thörn Cleland) para el benchmark Sphragis de atribución de autoría en griego antiguo. Forma parte de un conjunto de diecisiete modelos, cada uno entrenado sobre las frases de un autor clásico, y sigue la metodología de Huang, Murakami y Grieve (2025), que atribuye la autoría de un texto comparando la perplejidad que cada modelo produce sobre las frases candidatas.

El modelo parte de `Urdatorn/olmo3-7b-ancient-greek`, una adaptación al griego antiguo del modelo OLMo 3 de 7B parámetros de AI2, y se somete a un further-pretraining completo sobre las 900 frases de entrenamiento de Tucídides (159.195 tokens puntuados). Con 7.298.011.136 parámetros, su arquitectura es un transformer decoder-only de la familia OLMo 3, aunque la longitud de contexto no se especifica en la documentación disponible. Su relevancia radica en ser una herramienta de investigación filológica que permite atribuir autoría con un enfoque basado en la probabilidad del lenguaje, y en que su proceso de entrenamiento introduce una selección de época por validación, en lugar de fijar un número arbitrario de épocas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos originales); no se publican cuantizaciones adicionales |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | other (derivada de datos con licencias mixtas, incluyendo CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo 3, un transformer decoder-only con atención estándar, diseñado por AI2 para investigación abierta. El proceso de entrenamiento consta de dos etapas: primero, un further-pretraining completo sobre el corpus de griego antiguo (modelo base `olmo3-7b-ancient-greek`), y después, un fine-tuning específico sobre las frases de Tucídides del dataset Sphragis. El objetivo es modelado de lenguaje causal con una frase por secuencia, en el formato `<|endoftext|> sentence <|endoftext|>`. La selección del mejor modelo se realiza mediante early stopping sobre la pérdida de validación del propio autor, con un máximo de 20 épocas y paciencia 3; en este caso, la mejor época fue la 1.0, con una pérdida de validación de 0.8436 nats/token. El entrenamiento usó una tasa de aprendizaje constante de 1e-05 tras 25 pasos de warmup, un batch efectivo de 16 frases, y precisión mixta (fp32 para pesos maestros, bf16 para cómputo) con FSDP en 2 GPU GH200. Los pesos finales se guardan en bf16.

## Capacidades

- Modelado de lenguaje causal en griego antiguo, especializado en el estilo de Tucídides.
- Atribución de autoría mediante cálculo de perplejidad (negative log-likelihood por token) sobre frases.
- Comparación entre los diecisiete modelos del conjunto Sphragis para determinar qué autor resulta menos sorprendente para una frase dada.
- Generación de texto en griego antiguo con sesgo estilístico hacia Tucídides (aunque no es su propósito principal).
- No soporta tool calling, ni visión, ni modos de razonamiento explícitos; es un modelo puramente de lenguaje para tareas de autoría.

## Casos de uso

- Atribución de autoría de textos griegos antiguos de autoría dudosa: se puntúa cada frase con los diecisiete ALMs y se asigna la autoría al modelo con menor perplejidad media.
- Análisis estilométrico cuantitativo: permite medir la distancia estilística entre un texto y el corpus de un autor concreto mediante la probabilidad condicional.
- Investigación filológica sobre la prosa de Tucídides: el modelo puede usarse para estudiar patrones léxicos y sintácticos característicos del autor.
- Verificación de fragmentos o citas atribuidas: dado un pasaje, se puede comprobar si su perplejidad bajo el modelo de Tucídides es significativamente menor que bajo otros modelos.
- Entrenamiento de sistemas de detección de plagio o falsificación en textos clásicos: la comparación de perplejidades ofrece una señal objetiva de autoría.
- Recurso educativo en cursos de filología clásica: permite demostrar empíricamente diferencias de estilo entre autores griegos antiguos.

## Benchmarks y rendimiento

En la documentación se indica que, sobre el split de validación `sentence_1` del dataset Sphragis, los diecisiete modelos del conjunto alcanzan una macro-F1 de 0.800. Cuando los mismos modelos se entrenan desde la base no adaptada al griego antiguo (es decir, sin el paso de further-pretraining), la macro-F1 es de 0.812. Esto sugiere que la adaptación al griego antiguo mejora la calidad del modelo de lenguaje pero no necesariamente la discriminación entre autores. No se publican otros benchmarks (MMLU, HumanEval, etc.) porque el modelo está diseñado exclusivamente para la tarea de atribución de autoría.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7.3B parámetros en bf16, el tamaño del repositorio es de 14.6 GB, por lo que se necesita al menos 16 GB de VRAM para cargar los pesos en memoria (por ejemplo, una RTX 4090 o una A100 de 40 GB).
- GPU recomendadas: NVIDIA A100 (40 GB), H100, RTX 4090, o cualquier GPU con al menos 16 GB de memoria.
- En consumer GPU: sí, cabe en GPUs de gama alta como la RTX 4090 (24 GB) o la RTX 3090 (24 GB), aunque con limitaciones de batch.
- Opciones de despliegue: al ser un modelo safetensors estándar, puede servirse con vLLM, llama.cpp (si se convierte a GGUF), o Hugging Face Transformers. No se proporcionan configuraciones específicas de latencia o throughput.
- Para el entrenamiento se usaron 2 GPU GH200 con FSDP, pero para inferencia una sola GPU es suficiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Urdatorn/sphragis-alm-olmo3-greek-7b-thucydides | 7.3B | No disponible | other | Atribución de autoría en griego antiguo |
| Urdatorn/olmo3-7b-ancient-greek | 7.3B | No disponible | Apache-2.0 | Modelo base de griego antiguo |
| allenai/Olmo-3-1025-7B | 7B | No disponible | Apache-2.0 | Modelo general de lenguaje |

No se dispone de otros modelos específicos de atribución de autoría en griego antiguo para comparar directamente. La comparativa se limita al modelo base y al modelo general de OLMo 3, que comparten arquitectura y tamaño.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con frases de Tucídides (900 frases), por lo que su capacidad de generalización a otros géneros o estilos del griego antiguo es limitada.
- La licencia `other` restringe el uso comercial: los datos de entrenamiento incluyen material con licencia CC BY-NC-SA, lo que impide aplicaciones comerciales sin una revisión legal exhaustiva.
- No se han evaluado sesgos ni alucinaciones específicas; al ser un modelo de autoría, su uso fuera de la atribución de autoría puede producir resultados poco fiables.
- La longitud de contexto no está documentada, por lo que se desconoce el límite de tokens que puede procesar en una sola pasada.
- El modelo no soporta otros idiomas ni tareas generales; su uso en producción requiere un pipeline específico de puntuación de frases.
- El rendimiento reportado (macro-F1 0.800) corresponde al conjunto completo de diecisiete modelos; el rendimiento individual de este modelo no se ha publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-greek-7b-thucydides
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Repositorio de código (entrenamiento y puntuación): https://github.com/Urdatorn/sphragis_models
- Paper de referencia: Huang, Murakami y Grieve (2025), "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081.
- Modelo base en griego antiguo: https://huggingface.co/Urdatorn/olmo3-7b-ancient-greek
- Paper de OLMo 3: https://arxiv.org/abs/2512.13961
