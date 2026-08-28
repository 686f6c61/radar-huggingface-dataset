# Urdatorn/sphragis-alm-olmo1b-sentence-lucian

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-lucian` es uno de los 28 modelos de lenguaje autorial (ALM) desarrollados por Urdatorn para el benchmark Sphragis de atribución de autoría en griego antiguo. Sigue la metodología de Huang, Murakami y Grieve (2025), que atribuye la autoría de un texto comparando la perplejidad que cada modelo autorial encuentra en él. Cada ALM es un reentrenamiento completo del modelo base `allenai/OLMo-1B-hf` sobre las frases de entrenamiento de un único autor; en este caso, las de Luciano de Samósata.

El modelo se creó con un objetivo de modelado de lenguaje causal sobre secuencias de una sola frase, y su duración de entrenamiento (3 épocas) se seleccionó mediante validación de atribución, no por perplejidad propia del autor. Esto lo diferencia del enfoque original de Huang y colaboradores, que fijaban 100 épocas. El resultado es un modelo especializado en detectar la huella lingüística de Luciano, útil para tareas de atribución de autoría en textos griegos antiguos.

Con 1.176.764.416 parámetros (aproximadamente 1,17 mil millones), es un modelo de tamaño medio que puede ejecutarse en hardware de consumo con las cuantizaciones adecuadas. Su licencia es `other` debido a las licencias mixtas de los textos de entrenamiento, que incluyen material CC BY-NC-SA, lo que restringe su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-1B) |
| Parametros totales | 1.176.764.416 (1,17 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificada en la ficha) |
| Tipos de cuantizacion | bf16 (pesos del modelo) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | other (derivada de licencias mixtas, incluye CC BY-NC-SA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-1B-hf`, un transformer decoder-only de 1,17 mil millones de parámetros desarrollado por el Allen Institute for AI. Sobre esta base se realiza un reentrenamiento completo (further-pretraining) con un objetivo de modelado de lenguaje causal, donde cada secuencia de entrenamiento es una frase del autor envuelta entre tokens `<|endoftext|>`. El conjunto de entrenamiento para Luciano consta de 550 filas y 45.179 tokens puntuados de la división `sentence_1` del dataset Sphragis.

El entrenamiento se realizó con precisión mixta: pesos maestros en fp32, cómputo en bf16 y FSDP con sharding completo sobre 2 GPU GH200. Se usaron 3 épocas, una tasa de aprendizaje de 5e-05 constante tras 25 pasos de calentamiento y un batch efectivo de 16 frases. La duración se eligió mediante ascenso por coordenadas sobre la macro-F1 de atribución en validación, considerando los 28 modelos del conjunto. Esto contrasta con el enfoque fijo de 100 épocas del artículo original, y busca optimizar la capacidad discriminativa del modelo frente a los demás autores, no su ajuste individual.

## Capacidades

- Atribución de autoría en griego antiguo: el modelo está entrenado para asignar alta probabilidad a frases de Luciano y baja probabilidad a las de otros autores, permitiendo clasificar textos por autor mediante comparación de perplejidad.
- Modelado de lenguaje causal especializado: genera texto con el estilo léxico y sintáctico de Luciano, aunque su uso principal no es generativo sino discriminativo.
- Puntuación de frases: puede calcular la log-verosimilitud negativa por token de una frase dada, siguiendo el mismo formato de entrenamiento (frase entre tokens especiales).
- Integración en pipelines de atribución: diseñado para funcionar junto a los otros 27 ALMs del benchmark Sphragis, donde la decisión final se toma por el modelo que encuentra la frase menos sorprendente.
- Multilingüe limitado: solo soporta griego antiguo, sin capacidades en otros idiomas.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: es un modelo de lenguaje puro, sin funciones adicionales.

## Casos de uso

- Investigación filológica: los estudiosos de la literatura griega pueden usar el modelo para verificar la autoría de textos dudosos atribuidos a Luciano, comparando la perplejidad de sus frases con la de otros autores del corpus Sphragis.
- Análisis estilométrico: el modelo permite cuantificar la distancia estilística entre Luciano y otros autores, lo que ayuda a trazar influencias o detectar interpolaciones en manuscritos.
- Benchmarking de atribución de autoría: sirve como componente de referencia en el benchmark Sphragis para evaluar nuevos métodos de atribución en griego antiguo, ya que su rendimiento está calibrado sobre validación.
- Educación digital en humanidades: puede integrarse en plataformas de enseñanza que expliquen la atribución de autoría mediante modelos de lenguaje, mostrando cómo la perplejidad diferencia estilos.
- Restauración de textos fragmentarios: al modelar el estilo de Luciano, el modelo puede ayudar a completar lagunas en papiros o manuscritos, sugiriendo palabras o frases coherentes con su idiolecto.
- Archivado y catalogación de corpus: bibliotecas digitales pueden emplear el modelo para etiquetar automáticamente textos anónimos o mal atribuidos en colecciones de literatura griega.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. Sin embargo, la model card reporta el rendimiento conjunto de los 28 ALMs del benchmark Sphragis en la tarea de atribución de autoría, medido como macro-F1 sobre el conjunto de test:

| Conjunto de test | Macro-F1 |
|---|---|
| sentence_1 | 62,36 |
| sentence_5 | 86,84 |
| sentence_10 | 89,53 |
| sentence_50 | 92,44 |

Estos valores corresponden al sistema completo de 28 modelos, no a este modelo en particular. No se proporcionan métricas como MMLU, HumanEval o GSM8K, ya que el modelo no está orientado a tareas generales de razonamiento o código.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la información disponible.
- El entrenamiento se realizó sobre 2 GPU GH200 con FSDP, pero para inferencia el modelo es mucho más ligero.
- Con 1,17 mil millones de parámetros en bf16, el peso del modelo ocupa aproximadamente 2,35 GB (1,17 B × 2 bytes), más overhead de activaciones. Esto sugiere que es ejecutable en GPUs consumer con al menos 4 GB de VRAM, aunque no hay datos oficiales de latencia o throughput.
- Opciones de despliegue: al ser un modelo basado en OLMo, puede servirse con vLLM, llama.cpp, Ollama o TGI, siempre que se adapte el formato de pesos (safetensors a GGUF si se usa llama.cpp). No se mencionan configuraciones específicas en la ficha.
- Para uso en CPU, sería posible con cuantización de 8 bits o 4 bits, pero no se proporcionan cifras de rendimiento.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. El modelo pertenece a una familia de 28 ALMs del mismo benchmark, pero no se ofrecen datos de rendimiento individual que permitan una comparación directa con alternativas externas. Se puede señalar que, frente a modelos generales multilingües como mBERT o XLM-R, este modelo está especializado en un único autor y un único idioma, lo que le confiere una ventaja en precisión de atribución dentro de su dominio, pero lo hace inutilizable fuera de él.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia `other` deriva de los textos de entrenamiento, que incluyen material CC BY-NC-SA. Esto prohíbe el uso comercial del modelo y de sus derivados, y obliga a revisar el archivo `LICENSES.md` del dataset Sphragis antes de cualquier reutilización.
- Sesgo de autor: el modelo está entrenado exclusivamente con frases de Luciano, por lo que su capacidad de generalización a otros autores o a variantes dialectales del griego antiguo es nula. No debe usarse para tareas fuera de la atribución de autoría.
- Riesgo de sobreajuste: al entrenar sobre solo 550 frases, el modelo puede memorizar patrones superficiales en lugar de rasgos estilísticos profundos, lo que podría afectar su robustez ante textos con ruido o variaciones.
- Alucinación: como todo modelo de lenguaje, puede generar texto plausible pero incorrecto si se usa de forma generativa, aunque su propósito principal no es la generación.
- Contexto limitado: no se especifica la longitud de contexto, pero al derivar de OLMo-1B, probablemente sea de 2048 tokens, lo que limita el análisis a frases o pasajes cortos.
- Sin soporte técnico: al ser un modelo de investigación con cero descargas y cero likes, no hay garantía de mantenimiento o corrección de errores.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-lucian)
- [Dataset Sphragis](https://huggingface.co/datasets/Urdatorn/sphragis)
- [Código de entrenamiento y puntuación](https://github.com/Urdatorn/sphragis_models)
- [Leaderboard del benchmark Sphragis](https://urdatorn-sphragis-leaderboard.static.hf.space/index.html)
- [Modelo base OLMo-1B-hf](https://huggingface.co/allenai/OLMo-1B-hf)
- [Artículo de referencia: Huang, Murakami y Grieve (2025), "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0327081)
