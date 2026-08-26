# Urdatorn/sphragis-alm-olmo3-greek-7b-demosthenes

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo3-greek-7b-demosthenes` es uno de los diecisiete modelos de lenguaje autorial (ALM, por sus siglas en inglés) desarrollados por Urdatorn para el benchmark Sphragis de atribución de autoría en griego antiguo. Cada ALM se obtiene mediante un further-pretraining completo del modelo base `Urdatorn/olmo3-7b-ancient-greek` sobre las frases de entrenamiento de un único autor del corpus Sphragis. Este modelo concreto se entrena exclusivamente con 2.400 frases de Demóstenes (348.270 tokens puntuados), de modo que la atribución de una frase se realiza comparando la perplejidad que produce en cada uno de los diecisiete modelos y asignándola al que la encuentre menos sorprendente.

El modelo se basa en la arquitectura Olmo 3 de AI2, un transformer decoder-only de 7.000 millones de parámetros, adaptado previamente al griego antiguo. Su relevancia radica en que permite realizar atribución de autoría sobre textos clásicos con un enfoque estadístico basado en la perplejidad, siguiendo la metodología de Huang, Murakami y Grieve (2025). A diferencia de los modelos originales de ese estudio, que se entrenaban durante 100 épocas fijas, aquí la duración del entrenamiento se selecciona mediante early stopping sobre las frases de validación del propio autor, lo que mejora la generalización.

El modelo está disponible en Hugging Face con pesos en formato safetensors (14,6 GB) y licencia `other`, debido a que los datos de entrenamiento provienen de fuentes con licencias mixtas, incluyendo material CC BY-NC-SA. Es una herramienta especializada para investigación filológica y estilométrica, no un modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Olmo 3) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuración de Olmo 3; no especificada en la model card) |
| Tipos de cuantizacion | bf16 (pesos originales); no se documentan otras cuantizaciones |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluyendo CC BY-NC-SA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Urdatorn/olmo3-7b-ancient-greek`, que es una adaptación del modelo Olmo 3 de 7B al griego antiguo. Olmo 3 es una familia de modelos completamente abiertos de AI2, diseñados para razonamiento de contexto largo, function calling, generación de código, seguimiento de instrucciones, chat general y recuperación de conocimiento. La arquitectura subyacente es un transformer causal estándar, aunque no se especifican detalles adicionales (como atención lineal o decodificación especulativa) en la documentación disponible.

El entrenamiento de este ALM consiste en un further-pretraining sobre las frases de entrenamiento de Demóstenes del dataset Sphragis. Cada secuencia se forma como `<|endoftext|> sentence <|endoftext|>`, con una sola frase por secuencia. El objetivo es modelado de lenguaje causal. La selección del mejor modelo se realiza por la menor pérdida en las frases de validación del propio autor, con un máximo de 20 épocas y paciencia 3. El mejor resultado se obtuvo en la época 1.0, con una pérdida de validación de 0,8385 nats/token. Se usó una tasa de aprendizaje constante de 1e-05 tras 25 pasos de warmup, un batch efectivo de 16 frases, precisión fp32 para los pesos maestros, cómputo en bf16 y FSDP con sharding completo en 2 GPU GH200. Los pesos finales se guardan en bf16.

A diferencia del enfoque de Huang y colaboradores, que fijaban 100 épocas, aquí la duración se elige mediante evidencia de validación, lo que permite que cada modelo se detenga tempranamente según sus propias frases de validación.

## Capacidades

- Modelado de lenguaje causal en griego antiguo, especializado en el estilo de Demóstenes.
- Atribución de autoría mediante comparación de perplejidad entre los diecisiete modelos del conjunto Sphragis.
- Cálculo de perplejidad por token (negative log-likelihood) para frases individuales.
- Capacidad de distinguir entre autores clásicos griegos basándose en patrones estilísticos y léxicos.
- No incluye soporte para tool calling, agentes, visión ni audio; es un modelo de lenguaje puro.
- Multilingüismo limitado: entrenado específicamente para griego antiguo, aunque el modelo base podría tener capacidades en otros idiomas, no se documentan.

## Casos de uso

- Atribución de autoría en textos griegos antiguos: dado un fragmento de texto, se calcula su perplejidad con cada uno de los diecisiete ALM y se asigna al autor cuyo modelo produzca menor sorpresa. Es útil para resolver disputas de autoría en obras clásicas.
- Análisis estilométrico comparativo: investigadores pueden estudiar cómo varía la perplejidad entre autores y detectar influencias o imitaciones estilísticas.
- Verificación de autenticidad de manuscritos: al evaluar si un texto atribuido a Demóstenes es consistente con su modelo, se pueden identificar posibles interpolaciones o falsificaciones.
- Investigación filológica digital: integración en pipelines de análisis de corpus para clasificar automáticamente fragmentos no etiquetados.
- Estudio de la evolución del estilo de un autor: al aplicar el modelo a diferentes obras de Demóstenes, se pueden observar variaciones internas y cambios diacrónicos.
- Entrenamiento de modelos similares: el código y la metodología pueden replicarse para otros autores o idiomas, sirviendo como base para nuevos benchmarks de atribución.

## Benchmarks y rendimiento

En la model card se reporta que, sobre el split de validación `sentence_1` del benchmark Sphragis, los diecisiete modelos juntos alcanzan un macro-F1 de 0,800. Cuando se entrenan los mismos diecisiete modelos desde la base sin adaptar al griego antiguo (es decir, directamente desde Olmo 3), el macro-F1 es de 0,812. Esto indica que la adaptación al griego antiguo mejora la calidad del modelado de lenguaje, pero no aumenta la capacidad discriminativa del conjunto. No se proporcionan otros benchmarks estándar como MMLU, HumanEval o GSM8K.

| Benchmark | Resultado |
|---|---|
| Sphragis `sentence_1` validación (macro-F1, 17 modelos) | 0,800 |
| Sphragis `sentence_1` validación (macro-F1, 17 modelos desde base sin adaptar) | 0,812 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15-16 GB (7,3B parámetros × 2 bytes por parámetro, más overhead de activaciones y KV cache). Con cuantización a 4 bits (no documentada oficialmente, pero posible con herramientas como llama.cpp) se podría reducir a unos 4-5 GB.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) es suficiente para inferencia en bf16. Para entrenamiento se usaron 2× GH200, pero para inferencia no se requiere tanta capacidad.
- Cabe en GPUs de consumo como la RTX 3090 (24 GB) o RTX 4080 (16 GB) si se usa cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face Transformers, TGI. Al ser un modelo de 7B, es compatible con la mayoría de frameworks de inferencia.
- Latencia y throughput: no se proporcionan datos específicos; en una GPU moderna, un modelo de 7B en bf16 suele generar decenas de tokens por segundo, pero depende del hardware y la configuración.

## Comparativa con modelos similares

El modelo se compara principalmente con su base sin adaptar (`Urdatorn/olmo3-7b-ancient-greek`) y con los otros dieciséis ALM del mismo conjunto Sphragis. No hay modelos comerciales equivalentes para atribución de autoría en griego antiguo.

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| `Urdatorn/sphragis-alm-olmo3-greek-7b-demosthenes` | 7,3B | no disponible | other | Atribución de autoría (Demóstenes) |
| `Urdatorn/olmo3-7b-ancient-greek` | 7,3B | no disponible | Apache-2.0 | Modelo base adaptado al griego antiguo |
| Olmo 3 7B (original) | 7B | contexto largo (no especificado) | Apache-2.0 | Modelo general de propósito amplio |

La diferencia clave es que este ALM está especializado en un único autor, mientras que el base es generalista. El rendimiento en atribución de autoría es superior al de un modelo general, pero a costa de perder versatilidad.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo es útil para textos de Demóstenes o muy similares; su rendimiento en otros autores o géneros será pobre.
- Sesgos del corpus: los datos de entrenamiento provienen de Sphragis, cuyas fuentes tienen licencias mixtas y pueden contener sesgos históricos o de transmisión textual.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar texto plausible pero incorrecto si se usa fuera de su dominio de atribución.
- Licencia restrictiva: la licencia `other` impide su uso comercial sin verificar las licencias de los datos subyacentes (incluye CC BY-NC-SA). No se recomienda para aplicaciones comerciales sin asesoramiento legal.
- Contexto limitado: aunque Olmo 3 soporta contexto largo, no se especifica la longitud exacta para este modelo; para frases individuales (como se entrena) no es un problema, pero para documentos largos podría requerir truncamiento.
- Sin soporte para tareas modernas: no dispone de function calling, agentes ni capacidades multimodales, por lo que no es adecuado para aplicaciones de producción actuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-greek-7b-demosthenes
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Modelo base adaptado al griego antiguo: https://huggingface.co/Urdatorn/olmo3-7b-ancient-greek
- Código de entrenamiento y atribución: https://github.com/Urdatorn/sphragis_models
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Paper de Huang, Murakami y Grieve (2025): https://doi.org/10.1371/journal.pone.0327081 (referenciado en la model card)
