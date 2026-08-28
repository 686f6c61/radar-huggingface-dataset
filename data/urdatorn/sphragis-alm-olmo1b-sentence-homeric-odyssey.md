# Urdatorn/sphragis-alm-olmo1b-sentence-homeric-odyssey

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-homeric-odyssey` es un *authorial language model* (ALM) desarrollado por Urdatorn (Albin Thörn Cleland) como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` sobre un subconjunto de frases atribuidas a Homero (la Odisea), con el objetivo de medir la perplejidad de un texto respecto a un autor concreto. El modelo forma parte de un conjunto de 28 ALMs, uno por autor, que se utilizan conjuntamente para atribuir la autoría de una frase comparando la perplejidad entre todos ellos.

La relevancia de este modelo radica en su aplicación a la filología digital y la estilometría: permite atribuir autoría de textos fragmentarios o disputados en griego antiguo mediante un método basado en la probabilidad condicional de las palabras, siguiendo la metodología de Huang, Murakami y Grieve (2025). Con 1.176.764.416 parámetros (1,17 mil millones), es un modelo relativamente ligero que puede ejecutarse en hardware de consumo, aunque su licencia restrictiva limita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluye CC BY-NC-SA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo-1B de AI2, un transformer causal decoder-only con 1,17 mil millones de parámetros. No se especifican detalles adicionales de la arquitectura (número de capas, cabezas de atención, etc.) en la documentación proporcionada. El entrenamiento consiste en un *further-pretraining* completo sobre el corpus de frases de la Odisea, con un objetivo de modelado de lenguaje causal sobre secuencias del formato `<|endoftext|> sentence <|endoftext|>`, una frase por secuencia.

El proceso de entrenamiento se realizó con 2 épocas, una tasa de aprendizaje constante de 5e-05 tras 25 pasos de calentamiento, un tamaño de lote efectivo de 16 frases, y precisión mixta (fp32 para pesos maestros, bf16 para cómputo) usando FSDP en 2 GPUs GH200. La selección del número de épocas y del modelo base se hizo mediante ascenso por coordenadas sobre la atribución de validación (macro-F1), no sobre la perplejidad del propio autor, porque lo que interesa es la capacidad discriminativa entre autores. El modelo final se guarda en bf16.

## Capacidades

- Generación de texto en griego antiguo, aunque su uso principal no es la generación sino la puntuación de perplejidad.
- Cálculo de perplejidad (negative log-likelihood por token) para una frase dada, lo que permite comparar la "sorpresa" de un texto respecto al estilo de Homero.
- Atribución de autoría: al ser uno de los 28 ALMs del benchmark Sphragis, puede usarse junto con los otros modelos para decidir qué autor es más probable para una frase.
- Especialización en el estilo homérico de la Odisea, con vocabulario y construcciones sintácticas propias de ese corpus.
- No soporta tool calling, agentes, visión ni otras capacidades multimodales; es un modelo de lenguaje puro.

## Casos de uso

- Atribución de autoría en textos clásicos: dado un fragmento de dudosa autoría, se puntúa con los 28 ALMs y se asigna al autor cuyo modelo produce menor perplejidad. Es adecuado porque el modelo está entrenado específicamente para maximizar la discriminación entre autores.
- Análisis estilométrico de la Odisea: permite estudiar la variación interna del texto, por ejemplo, identificar pasajes que se desvían del estilo homérico típico.
- Investigación filológica sobre la "cuestión homérica": ayuda a evaluar hipótesis sobre la composición oral o la intervención de múltiples autores en la épica griega.
- Verificación de autenticidad de fragmentos recién descubiertos: si un papiro contiene un texto atribuible a Homero, el modelo puede dar una medida cuantitativa de su similitud estilística.
- Enseñanza de la estilometría computacional: sirve como ejemplo práctico de cómo entrenar y evaluar modelos de autoría sobre lenguas antiguas.
- Comparación de estilos entre autores del corpus Sphragis: al ser parte de un conjunto de 28 modelos, permite análisis comparativos de la distancia estilística entre autores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. Sin embargo, el conjunto completo de 28 ALMs alcanza los siguientes resultados en el benchmark Sphragis (test macro-F1):

| Tarea | Macro-F1 |
|---|---|
| sentence_1 | 62.36 |
| sentence_5 | 86.84 |
| sentence_10 | 89.53 |
| sentence_50 | 92.44 |

Estos valores corresponden al rendimiento conjunto de los 28 modelos, no a este modelo en particular. No se dispone de comparaciones con otros modelos de atribución de autoría en griego antiguo.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 2,35 GB (1.176.764.416 × 2 bytes). Con overhead de activaciones y buffers, se recomienda al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, por ejemplo NVIDIA RTX 3050, RTX 4060, RTX 3060, o GPUs de datacenter como A10, A100, GH200 (esta última usada en el entrenamiento).
- Sí cabe en GPUs de consumo: una RTX 3060 de 12 GB o una RTX 4060 de 8 GB pueden ejecutarlo sin problemas.
- Opciones de despliegue: al ser un modelo HuggingFace estándar, puede cargarse con `transformers` y ejecutarse en CPU o GPU. También puede convertirse a GGUF para usarse con llama.cpp u Ollama, aunque no se proporcionan cuantizaciones precalculadas.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, la inferencia de una frase corta debería ser del orden de decenas de milisegundos, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| `Urdatorn/sphragis-alm-olmo1b-sentence-homeric-odyssey` | 1,17 B | no disponible | other | Atribución de autoría (griego antiguo) |
| `Urdatorn/sphragis-alm-olmo3-7b-homeric-odyssey` | 7 B (aprox.) | no disponible | other | Atribución de autoría (griego antiguo) |
| `allenai/OLMo-1B-hf` (modelo base) | 1,17 B | 2048 (según documentación de OLMo) | Apache-2.0 | Modelo de lenguaje general en inglés |

El modelo de 7B (OLMo-3) es una alternativa más grande dentro del mismo proyecto Sphragis, pero no se dispone de comparativas de rendimiento entre ambos. El modelo base OLMo-1B es el punto de partida, pero no está adaptado al griego antiguo ni a la tarea de atribución.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo licencia `other` debido a que el texto de entrenamiento incluye material con licencia CC BY-NC-SA. Esto impide su uso comercial sin verificación adicional de los términos de las fuentes originales (ver `LICENSES.md` del dataset Sphragis).
- Especialización extrema: el modelo solo es útil para textos en griego antiguo y, más concretamente, para el estilo de la Odisea. No sirve para tareas generales de NLP.
- Riesgo de sobreajuste: al entrenarse sobre un único autor con solo 289.407 tokens, el modelo puede memorizar patrones específicos del corpus y no generalizar bien a otros textos homéricos o variantes dialectales.
- Sesgo de corpus: el entrenamiento se limita a las frases etiquetadas como `sentence_1` del benchmark, lo que puede no representar la variedad completa de la obra.
- Alucinación: al ser un modelo de lenguaje, puede generar texto plausible pero incorrecto si se usa para generación, aunque su propósito principal es la puntuación de perplejidad.
- Sin soporte multilingüe: solo maneja griego antiguo; no reconoce otros idiomas.
- Sin cuantizaciones oficiales: no se proporcionan versiones GGUF o GPTQ, por lo que el despliegue en entornos con poca memoria requiere conversión manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-homeric-odyssey
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y atribución: https://github.com/Urdatorn/sphragis_models
- Perfil del autor en HuggingFace: https://huggingface.co/Urdatorn
- Perfil del autor en GitHub: https://github.com/Urdatorn
- Modelo hermano de 7B: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-7b-homeric-odyssey
