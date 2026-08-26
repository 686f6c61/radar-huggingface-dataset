# Urdatorn/sphragis-alm-olmo3-7b-athenaeus

## Resumen

El modelo `sphragis-alm-olmo3-7b-athenaeus` es un modelo de lenguaje de autor (ALM, por sus siglas en inglés) desarrollado por Urdatorn como parte del conjunto de diecisiete modelos del benchmark de atribución de autoría Sphragis para griego antiguo. Se basa en el modelo `allenai/Olmo-3-1025-7B` de AI2, un transformer causal de 7B parámetros con licencia Apache-2.0, y se ha sometido a un entrenamiento adicional (further pretraining) exclusivamente sobre las frases de un único autor, Ateneo de Náucratis, según el método de Huang, Murakami y Grieve (2025), que atribuye la autoría mediante la perplejidad de los modelos de lenguaje de autor.

El modelo resuelve el problema de la atribución de autoría en textos griegos antiguos, un desafío filológico clásico. Su relevancia reside en que aplica técnicas modernas de aprendizaje automático a un dominio humanístico, con un enfoque riguroso de validación mediante datos de validación separados. El repositorio incluye 7.298.011.136 parámetros y los pesos se distribuyen en formato `safetensors` (bf16), ocupando 14,6 GB. La licencia es `other`, debido a que los datos de entrenamiento proceden de fuentes con licencias mixtas, incluyendo material CC BY-NC-SA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (base: OLMo-3-1025-7B) |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo pesos bf16) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | other |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (further pretraining) de `allenai/Olmo-3-1025-7B`, un transformer causal de la familia OLMo 3 de AI2, que se caracteriza por su orientación hacia el razonamiento de contexto largo, la llamada de funciones y la generación de código. En este caso, el entrenamiento se realizó sobre un corpus reducido: 1.900 frases de Ateneo (221.469 tokens con puntuación) del split `sentence_1` del dataset Sphragis. Cada secuencia de entrenamiento tiene la forma `<|endoftext|> sentence <|endoftext|>`, es decir, una frase por secuencia.

El entrenamiento se guió por la pérdida en el conjunto de validación del autor, con una estrategia de parada temprana (patience 3) sobre un máximo de 20 épocas. El mejor resultado se obtuvo en la época 2, con una pérdida de 1,2011 nats/token. Se usó una tasa de aprendizaje constante de 1e-05 tras 25 pasos de calentamiento, un tamaño de lote efectivo de 16 frases, y precisión mixta con pesos maestros en FP32 y cómputo en BF16, distribuido con FSDP en dos GPU GH200. A diferencia del trabajo original de Huang y colaboradores, que fijaban 100 épocas, aquí la duración se decide por evidencia de validación; los diecisiete modelos del conjunto se detuvieron en la época 2 o 3.

## Capacidades

- Atribución de autoría: el modelo está diseñado para puntuar la perplejidad de una frase en griego antiguo, comparando la log-verosimilitud negativa por token contra los otros dieciséis modelos del conjunto Sphragis.
- Generación de texto: al ser un modelo causal, puede generar texto en griego antiguo, aunque su propósito principal no es la generación sino la puntuación.
- Evaluación estilística: captura patrones léxicos y sintácticos específicos de un autor concreto (Ateneo).
- No soporta tool calling ni function calling, al ser un modelo de base ajustado solo para una tarea de puntuación.
- No tiene capacidades de visión ni de audio; es un modelo exclusivamente de texto.
- Multilingüismo: solo está entrenado en griego antiguo, aunque el modelo base es multilingüe, el ajuste fino limita su competencia a este idioma.

## Casos de uso

- Atribución de autoría de fragmentos griegos antiguos: el modelo puede puntuar una frase o pasaje y comparar la perplejidad con los otros dieciséis modelos del conjunto Sphragis, lo que permite decidir de manera objetiva qué autor es más probable, incluso para textos dudosos.
- Investigación filológica sobre la autoría de obras completas: los filólogos pueden aplicar este modelo a obras completas o capítulos para comprobar si el estilo coincide con el de Ateneo, lo que ayuda en la autenticación de manuscritos.
- Análisis de variantes textuales: cuando existen múltiples versiones de un pasaje, el modelo puede evaluar cuál de ellas es más coherente con el estilo de Ateneo, ayudando a la crítica textual.
- Estilometría computacional en lenguas clásicas: sirve como herramienta para comparar la perplejidad de distintos autores y así construir distancias estilométricas entre ellos, útil en estudios de corpus.
- Docencia e investigación en humanidades digitales: permite a estudiantes y académicos experimentar con métodos de atribución de autoría basados en aprendizaje automático, sin necesidad de entrenar modelos desde cero.
- Revisión de atribuciones dudosas en colecciones de textos: se puede integrar en pipelines de procesamiento de corpus griego antiguo para detectar posibles errores de autoría en ediciones digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales del modelo en la información disponible. Sin embargo, la model card indica que el conjunto completo de diecisiete modelos alcanza un macro-F1 de 0,812 en el split de validación `sentence_1` del benchmark Sphragis. Este resultado corresponde a la tarea conjunta de atribución de autoría entre los diecisiete autores, no al rendimiento de este modelo de forma aislada.

| Métrica | Resultado |
|---|---|
| macro-F1 (conjunto de 17 modelos, validación S) | 0,812 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 14,6 GB, por lo que se necesita al menos 16 GB de VRAM para inferencia con precisión completa (BF16).
- GPU recomendadas: una RTX 4090 (24 GB) o A100 (24 GB) son suficientes para inferencia; el entrenamiento se realizó con 2x GH200.
- En consumer GPU: cabe en una RTX 4090 (24 GB) o en una RTX 4080 (16 GB) si se reduce el tamaño del lote o se usa una cuantización adicional, aunque no se proporcionan pesos cuantizados.
- Opciones de despliegue: al ser pesos en safetensors, se puede cargar con Transformers de HuggingFace, vLLM o TGI, siempre que se respete el formato BF16. No hay archivos GGUF, por lo que no se puede usar directamente en llama.cpp u Ollama sin una conversión previa.
- Latencia y throughput: no disponible; no se han publicado mediciones de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialidad |
|---|---|---|---|---|
| `sphr-alm-olmo3-7b-athenaeus` (este) | 7,3 B | No disponible | other | Atribución de autoría en griego antiguo (Ateneo) |
| `allenai/Olmo-3-1025-7B` (base) | 7,3 B | No disponible (contexto largo) | Apache-2.0 | Modelo general de texto, razonamiento, código |
| `allenai/Olmo-3-7B-Instruct` | 7 B | No disponible | Apache-2.0 | Instrucción y chat |

La comparación directa con otros modelos de atribución de autoría no está disponible en la información proporcionada. La principal diferencia con el modelo base es que este ajuste se ha especializado en un solo autor y en una sola lengua, sacrificando la versatilidad por la precisión en una tarea concreta. El modelo base OLMo-3-1025-7B ofrece capacidades generales de generación y razonamiento, mientras que este modelo está restringido a la puntuación de perplejidad en griego antiguo.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia `other` se debe a que los datos de entrenamiento incluyen material con licencia CC BY-NC-SA; antes de cualquier uso comercial, es necesario revisar el archivo `LICENSES.md` del dataset Sphragis.
- Especialización excesiva: el modelo está entrenado solo con 1.900 frases de un único autor; su capacidad de generalización a otros autores o géneros es limitada, y puede sufrir sobreajuste al estilo de Ateneo.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar texto plausible pero incorrecto, especialmente en contextos fuera de su dominio de entrenamiento.
- Limitaciones de contexto: la longitud de contexto no se ha especificado en la model card; se asume que hereda la del base, pero no se garantiza.
- Sesgo de corpus: el corpus de entrenamiento proviene de fuentes con licencias mixtas, lo que puede introducir sesgos de edición o de transcripción en la representación del texto griego.
- No apto para tareas generales: no es un modelo de chat ni de instrucciones; su uso práctico se limita a la puntuación de perplejía y a la atribución de autoría.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-7b-athenaeus
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y puntuación: https://github.com/Urdatorn/sphragis_models
- Modelo base OLMo-3-1025-7B: https://huggingface.co/allenai/Olmo-3-1025-7B
- Artículo de Huang et al. (2025): "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081.
- Paper de OLMo 3: https://arxiv.org/abs/2512.13961
