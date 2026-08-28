# Urdatorn/sphragis-alm-olmo1b-sentence-demosthenes

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-demosthenes` es un modelo de lenguaje autoría (authorial language model, ALM) desarrollado por Urdatorn para el benchmark Sphragis de atribución de autoría en griego antiguo. Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` (1.176 millones de parámetros) entrenado exclusivamente sobre las oraciones de un único autor, Demóstenes, con el objetivo de medir la perplejidad de cada oración y atribuirla al autor que mejor la explique.

Este modelo forma parte de un conjunto de 28 ALMs, uno por autor, siguiendo la metodología de Huang, Murakami y Grieve (2025) publicada en PLoS ONE. Su relevancia radica en que ofrece una herramienta específica para la atribución de autoría en textos clásicos, un campo donde los modelos generales no suelen estar optimizados. El entrenamiento se realizó con una sola época y una selección basada en la atribución de validación, en lugar de la perplejidad del propio autor, lo que constituye una innovación metodológica frente a trabajos anteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluyendo CC BY-NC-SA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-1B-hf`, un transformer decoder-only de 1.170 millones de parámetros desarrollado por AI2. Sobre esta base se realizó un further-pretraining completo (no un simple fine-tuning) con un objetivo de modelado de lenguaje causal, donde cada secuencia de entrenamiento consiste en una oración del autor enmarcada entre tokens `<|endoftext|>`. El entrenamiento se llevó a cabo con 2.400 filas de entrenamiento (210.222 tokens puntuados) de la partición `sentence_1` del dataset Sphragis, durante 1 época, con una tasa de aprendizaje de 5e-05 constante tras 25 pasos de calentamiento, un batch efectivo de 16 oraciones y precisión mixta bf16 con pesos maestros en fp32, usando FSDP en 2×GH200.

La innovación principal es que la duración del entrenamiento (número de épocas) y el modelo base se seleccionaron mediante ascenso por coordenadas sobre la atribución de validación (macro-F1), no sobre la perplejidad del propio autor. Esto responde a que la atribución requiere que el modelo distinga mejor entre autores, no que ajuste mejor a uno solo. El resultado es un modelo especializado en calcular la probabilidad de oraciones de Demóstenes, útil para comparar con otros 27 modelos del mismo conjunto.

## Capacidades

- Calculo de perplejidad (negative log-likelihood por token) de oraciones en griego antiguo, especificamente para atribucion de autoria.
- Distincion entre el estilo de Demostenes y el de otros 27 autores del corpus Sphragis.
- Generacion de texto limitada: al ser un modelo causal, puede generar texto, pero su entrenamiento esta restringido a oraciones de un solo autor y no es su proposito principal.
- No soporta tool calling, ni vision, ni audio, ni razonamiento multi-paso.
- Capacidad multilingue: no, solo griego antiguo.

## Casos de uso

- Atribucion de autoria en textos clasicos: dado un texto fragmentario o de autoria disputada, se puede calcular la perplejidad de cada oracion con los 28 modelos y asignar el texto al autor con menor sorpresa. Es el caso de uso principal del modelo.
- Analisis estilometrico cuantitativo: investigadores pueden usar la perplejidad como medida de similitud estilistica entre un texto anonimo y el corpus de Demostenes, complementando metodos tradicionales.
- Verificacion de autenticidad de manuscritos: en estudios filologicos, el modelo puede ayudar a detectar interpolaciones o textos apocrifos comparando la probabilidad de las oraciones con el estilo conocido del autor.
- Ensenanza e investigacion en procesamiento de lenguaje clasico: sirve como ejemplo de aplicacion de modelos de lenguaje a lenguas antiguas con pocos recursos, y como base para experimentos de atribucion en otros corpus.
- Evaluacion de modelos de lenguaje para griego antiguo: al ser parte de un benchmark, permite comparar el rendimiento de diferentes arquitecturas o estrategias de entrenamiento en la tarea de atribucion.
- Reconstruccion de textos fragmentarios: aunque no es su funcion principal, la perplejidad puede orientar la seleccion de lecturas alternativas en pasajes danados, favoreciendo las que resulten menos sorprendentes para el modelo del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la informacion disponible. Sin embargo, el conjunto completo de 28 modelos del benchmark Sphragis alcanza los siguientes resultados de macro-F1 en el test:

| Tarea | Macro-F1 |
|---|---|
| sentence_1 | 62.36 |
| sentence_5 | 86.84 |
| sentence_10 | 89.53 |
| sentence_50 | 92.44 |

Estos valores corresponden al conjunto de modelos, no a este modelo en particular, y se ofrecen como referencia del rendimiento global de la metodologia.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 1.176 millones de parametros en bf16, el peso del modelo ocupa aproximadamente 2,35 GB. Con overhead de activaciones y memoria del runtime, se estima un consumo de 4-6 GB de VRAM para inferencia en secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, GTX 1660 Super) puede ejecutar el modelo en bf16. Para mayor comodidad, una RTX 3060 12GB o superior es suficiente.
- Cabe en GPUs de consumo: si, en la mayoria de GPUs modernas con 6 GB o mas de VRAM.
- Opciones de despliegue: al ser un modelo en formato safetensors, se puede cargar con la libreria `transformers` de HuggingFace. Para inferencia mas eficiente, se podria convertir a GGUF y usar `llama.cpp` u Ollama, aunque no se proporcionan conversiones oficiales. Tambien es compatible con vLLM si se convierte a un formato soportado.
- Latencia y throughput: no se dispone de datos medidos. En una GPU consumer, se espera una latencia de decenas de milisegundos por token para secuencias cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Uso |
|---|---|---|---|---|---|
| Urdatorn/sphragis-alm-olmo1b-sentence-demosthenes | 1,17B | no disponible | Further-pretraining sobre oraciones de Demostenes | other | Atribucion de autoria en griego antiguo |
| Urdatorn/sphragis-alm-olmo3-7b-demosthenes | 7B | no disponible | Further-pretraining sobre oraciones de Demostenes (base OLMo-3-7B) | other | Atribucion de autoria en griego antiguo |
| allenai/OLMo-1B-hf (modelo base) | 1,17B | 2048 (segun documentacion de OLMo) | Pretraining general en ingles | Apache-2.0 | Generacion de texto general, no especializado en griego |

La comparativa muestra que este modelo es una version ligera de la serie Sphragis, con la misma funcion pero menor capacidad que la variante de 7B. El modelo base OLMo-1B no esta entrenado para griego antiguo, por lo que su rendimiento en atribucion seria muy inferior.

## Limitaciones y advertencias

- Entrenado exclusivamente en griego antiguo y sobre un unico autor (Demostenes); no es util para otros idiomas ni para tareas generales de generacion de texto.
- La licencia `other` restringe el uso comercial: los datos de entrenamiento incluyen material con licencia CC BY-NC-SA, por lo que cualquier uso derivado debe respetar esas condiciones. Se recomienda revisar el archivo `LICENSES.md` del dataset antes de reutilizar el modelo.
- Riesgo de sobreajuste: al entrenarse con solo 2.400 oraciones de un autor, el modelo puede memorizar patrones especificos y no generalizar bien a variaciones estilisticas fuera del corpus.
- No se han evaluado sesgos ni alucinaciones; al ser un modelo de perplejidad, su salida principal es una puntuacion, no texto generado, pero si se usa para generar, puede producir texto poco coherente o con errores.
- La longitud de contexto no esta documentada; se asume que hereda la de OLMo-1B (2048 tokens), pero no se ha verificado.
- No se proporcionan cuantizaciones oficiales; el unico formato disponible es safetensors en bf16, lo que limita su despliegue en entornos con restricciones de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-demosthenes
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Codigo de entrenamiento y atribucion: https://github.com/Urdatorn/sphragis_models
- Leaderboard del benchmark: https://huggingface.co/spaces/Urdatorn/sphragis-leaderboard
- Modelo base OLMo-1B: https://huggingface.co/allenai/OLMo-1B-hf
- Repositorio OLMo de AI2: https://github.com/allenai/OLMo
- Articulo de referencia (Huang, Murakami y Grieve, 2025): PLoS ONE 20(7): e0327081
