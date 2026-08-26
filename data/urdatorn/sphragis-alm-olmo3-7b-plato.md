# Urdatorn/sphragis-alm-olmo3-7b-plato

## Resumen

El modelo `sphragis-alm-olmo3-7b-plato` es un modelo de lenguaje autorizado (authorial language model, ALM) desarrollado por Urdatorn como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Se trata de un *further-pretraining* completo del modelo base `allenai/Olmo-3-1025-7B` (arquitectura transformer, 7,3 mil millones de parámetros) sobre las frases de entrenamiento atribuidas a Platón dentro del dataset Sphragis. El objetivo es que, dado un texto, el modelo calcule su perplejidad (negativa de la log-verosimilitud por token) y lo compare con la de otros dieciséis modelos entrenados cada uno sobre un autor distinto; la frase se atribuye al modelo que la encuentre menos sorprendente.

Este modelo es relevante porque aplica un enfoque de atribución de autoría basado en la perplejidad de modelos de lenguaje autorizados, una técnica publicada por Huang, Murakami y Grieve (2025) en PLOS ONE. Su valor reside en ser una pieza de un sistema completo de diecisiete modelos que, sobre la división de validación `sentence_1`, alcanzan un macro-F1 de 0,812. El modelo está pensado exclusivamente para tareas de atribución de autoría en griego antiguo, no para generación de texto general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base: OLMo-3-1025-7B) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluye CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/Olmo-3-1025-7B` (revisión `a81bae42db3975be1671e27b9c9a56da1a9f980f`), un transformer decoder de la familia OLMo 3 de AllenAI, y se somete a un *further-pretraining* completo sobre las 900 frases de entrenamiento de Platón en el dataset Sphragis, que suman 104.702 tokens puntuados. El objetivo de entrenamiento es causal LM sobre secuencias con formato `<|endoftext|> frase <|endoftext|>`, una frase por secuencia.

El entrenamiento se realizó con precisión fp32 para los pesos maestros y bf16 para el cómputo, usando FSDP completo sobre dos nodos GH200. Se seleccionó la época 2 de un máximo de 20 (con paciencia 3) basándose en la pérdida de validación sobre las frases de validación del autor, que alcanzó 1,0902 nats/token. El learning rate fue constante de 1e-05 tras 25 pasos de calentamiento, con un tamaño de batch efectivo de 16 frases. Todos los pesos finales se publican en bf16.

## Capacidades

- Atribución de autoría: dado un texto en griego antiguo, calcula la perplejidad por token y permite comparar con los otros 16 modelos autorizados del benchmark Sphragis para determinar el autor más probable.
- Modelo de lenguaje autorizado específico para el estilo de Platón: entrenado exclusivamente con sus frases, captura patrones léxicos y sintácticos característicos.
- Generación de texto causal en griego antiguo (aunque no es su propósito principal).
- Integración en pipelines de atribución de autoría mediante el cálculo de negative log-likelihood (NLL) por token.
- Capacidad de clasificación multiclase cuando se combina con los otros 16 modelos (macro-F1 de 0,812 en validación).

## Casos de uso

- **Atribución de autoría de textos griegos antiguos**: dado un fragmento de autoría dudosa, se calcula su per-token NLL con este modelo y con los otros 16, y se asigna al autor cuyo modelo presente menor perplejidad. Es útil para estudios filológicos sobre la autenticidad de obras atribuidas a Platón.
- **Análisis estilométrico comparativo**: investigadores pueden usar las puntuaciones de los modelos para cuantificar la similitud estilística entre distintos textos de la época.
- **Benchmark de atribución de autoría**: el modelo sirve como componente del benchmark Sphinx para evaluar técnicas de atribución de autoría en lenguas clásicas.
- **Investigación en NLP histórico**: sirve como caso de estudio de *further-pretraining* sobre corpus muy pequeños (solo 104k tokens) a partir de un modelo base grande.
- **Evaluación de robustez de modelos de lenguaje**: permite estudiar cómo un modelo entrenado con un corpus extremadamente reducido y específico se comporta frente a variaciones de estilo y género.
- **Educación e investigación en filología digital**: el modelo puede emplearse en entornos de investigación para contrastar hipótesis sobre la autoría de fragmentos o textos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo. El autor indica que, en la división de validación `sentence_1` del dataset Sphinx, el conjunto de los 17 modelos alcanza un **macro-F1 de 0,812** en la tarea de atribución de autoría. No se proporcionan datos de MMLU, HumanEval u otros benchmarks generales, ya que el modelo está especializado y no es comparable con modelos de propósito general.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 7.298 millones de parámetros. En bf16 (formato publicado), el tamaño del repositorio es de 14,6 GB, lo que implica que la inferencia en bf16 requiere al menos ~15 GB de VRAM (sin contar overhead). Con cuantización a 8 bits o 4 bits, la VRAM necesaria puede reducirse a unos 8 GB o 4 GB respectivamente.
- **GPU recomendadas**: para inferencia en bf16, una GPU de 24 GB (RTX 4090, A5000) es suficiente; para entrenamiento o fine-tuning adicional, se recomiendan GPUs con más memoria, como A100 80GB o H100.
- **Si cabe en consumer GPU**: sí, en cuantización 4-bit o 8-bit podría ejecutarse en una RTX 3060 12GB o RTX 4070, aunque el uso previsto es de análisis de textos cortos, no de generación extensa.
- **Opciones de despliegue**: al ser un modelo base de OLMo 3, se puede cargar con frameworks como vLLM, TGI, llama.cpp (tras conversión a GGUF) u Ollama. No hay una implementación específica documentada, pero es compatible con los estándares del ecosistema.
- **Latencia**: no se han publicado datos específicos de latencia o throughput. Para una frase corta (por ejemplo, 100 tokens), la inferencia en una GPU de 24 GB debería ser del orden de milisegundos, pero no hay cifras oficiales.

## Comparativa con modelos similares

No hay modelos comparables directamente publicados, ya que se trata de un modelo especializado en autoría de un único autor sobre una lengua antigua. La comparación más cercana sería con el modelo base `allenai/Olmo-3-1025-7B`, que es el punto de partida y se diferencia en que este modelo ha sido entrenado específicamente en el estilo de Platón, perdiendo generalidad pero ganando precisión en la tarea de atribución. No se dispone de otras alternativas comerciales o académicas equivalentes para comparar.

## Limitaciones y advertencias

- **Entrenamiento limitado**: el modelo se ha entrenado solo con 900 frases y 104.702 tokens, lo que limita su capacidad de generalización fuera de las estructuras estilísticas de Platón.
- **Sesgo de autor**: está optimizado para el estilo de Platón, por lo que no es adecuado para clasificar textos de otros autores sin el conjunto completo de 17 modelos.
- **Licencia restrictiva**: el modelo se publica bajo licencia `other`, porque los textos de entrenamiento provienen de fuentes con licencias mixtas, incluyendo CC BY-NC-SA. Esto implica que el uso comercial del modelo y sus derivados está restringido, y se debe revisar el `LICENSES.md` del dataset antes de cualquier reutilización.
- **Idioma limitado**: solo soporta griego antiguo; no tiene capacidades multilingües.
- **Riesgo de alucinación**: como todo modelo causal, puede generar texto no fiel al estilo real, aunque no es su propósito principal.
- **Sin soporte de tool calling ni agentes**: no es un modelo de chat ni de agentes; su uso es puramente analítico para scoring de perplejidad.

## Enlaces

- [HuggingFace: Urdatorn/sphragis-alm-olmo3-7b-plato](https://huggingface.co/Urdatorn/sphragis-alm-olmo3-7b-plato)
- [Dataset Sphragis](https://huggingface.co/datasets/Urdatorn/sphragis)
- [Código de entrenamiento y scoring](https://github.com/Urdatorn/sphragis_models)
- [Modelo base: allenai/Olmo-3-1025-7B](https://huggingface.co/allenai/Olmo-3-1025-7B)
- Paper de referencia: Huang, Murakami y Grieve (2025), "Attributing authorship via the perplexity of authorial language models", *PLoS ONE* 20(7): e0327081.
