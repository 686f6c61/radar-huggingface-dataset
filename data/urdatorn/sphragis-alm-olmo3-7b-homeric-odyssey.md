# Urdatorn/sphragis-alm-olmo3-7b-homeric-odyssey

## Resumen

Sphragis authorial language model: Homeric-Odyssey es un modelo de lenguaje autorial (ALM) especializado en la atribución de autoría de textos en griego antiguo, desarrollado por Urdatorn como parte del benchmark Sphragis. Se trata de un fine-tuning completo del modelo base allenai/Olmo-3-1025-7B (OLMo-3-7B) sobre 4.800 frases de la Odisea homérica (452.400 tokens puntuados), con el objetivo de medir la perplejidad de un texto respecto al estilo de un autor concreto. Es uno de los diecisiete modelos de autor entrenados para el benchmark Sphragis, siguiendo la metodología de Huang, Murakami y Grieve (2025).

El modelo resuelve un problema concreto: la atribución de autoría en textos clásicos griegos mediante la comparación de la perplejidad entre distintos modelos autoriales. Su relevancia radica en que proporciona una herramienta cuantitativa y reproducible para la filología computacional, y en que su entrenamiento se ajusta a criterios de evidencia de validación (early stopping por pérdida en validación) en lugar de épocas fijas. El modelo tiene 7.298.011.136 parámetros y se distribuye en formato safetensors con pesos en bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-3-7B base) |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la información) |
| Tipos de cuantización | bf16 (pesos publicados) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | other (derivado de Apache-2.0 con fuentes de licencias mixtas, incl. CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un full fine-tuning de allenai/Olmo-3-1025-7B, la variante base de 7B de la familia OLMo-3 de AI2, entrenada sobre el corpus Dolma 3. La arquitectura es un transformer decoder-only estándar, sin mezclas de expertos ni mecanismos híbridos. El entrenamiento se realizó con el objetivo de modelado de lenguaje causal sobre secuencias de una sola frase, con el formato `<|endoftext|> sentence <|endoftext|>`, y una frase por secuencia. Se usó un batch efectivo de 16 frases, learning rate constante de 1e-05 tras 25 pasos de warmup, y precisión mixta fp32 en pesos maestros y bf16 en cómputo, con FSDP full shard sobre 2 GPUs GH200.

La innovación técnica principal es la selección de la mejor época por pérdida en el conjunto de validación de Sphragis (patience 3, máximo 20 épocas), en lugar de las 100 épocas fijas del trabajo original de Huang y colaboradores. El modelo se detuvo en la época 2.0 con una pérdida de validación de 1.0946 nats/token. Los pesos finales se guardan en bf16. El código de entrenamiento, puntuación y atribución está disponible en el repositorio GitHub del autor.

## Capacidades

- Atribución de autoría en griego antiguo: dado un texto, calcula su perplejidad (NLL por token) y lo atribuye al autor cuyo modelo lo considera menos sorprendente.
- Puntuación de frases individuales: puede evaluar frases en formato `<|endoftext|> sentence <|endoftext|>` y comparar contra los otros dieciséis modelos autoriales del benchmark Sphragm.
- Análisis estilométrico: útil para medir la similitud estilística de un texto con el estilo homérico de la Odisea.
- Capacidad multilingüe: limitada exclusivamente al griego antiguo; no soporta otros idiomas.
- Sin capacidades de tool calling, agentes, visión ni audio: es un modelo de lenguaje puro, sin instrucción ni interfaz de chat.
- No incluye modo de razonamiento explícito ni generación de código.

## Casos de uso

- Atribución de autoría de textos griegos antiguos anónimos o disputados: se puede puntuar una frase o un texto con los 17 modelos autoriales y asignar la autoría al modelo con menor perplejidad, como se hace en el benchmark Sphragm.
- Investigación filológica sobre la cuestión homérica: permite comparar cuantitativamente la proximidad estilística de distintos poemas épicos (p. ej., la Ilíada frente a la Odisea) con el estilo de la Odisea.
- Análisis de autenticidad de fragmentos papiráceos: para verificar si un fragmento atribuido a Homero es coherente con el estilo de la Odisea, se puede puntuar el fragmento con este modelo y comparar con otros autores.
- Benchmark de estilometría computacional: sirve como componente del conjunto Sphragm para evaluar métodos de atribución de autoría en lenguas clásicas.
- Verificación de hipótesis de autoría en estudios de crítica textual: los investigadores pueden usar la perplejidad como evidencia adicional en debates sobre la autoría de obras atribuidas a Homero.
- Docencia e investigación en humanidades digitales: como ejemplo de aplicación de modelos de lenguaje a problemas de filología, con código abierto y metodología reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tradicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo especializado y no de propósito general. El único dato de rendimiento publicado es el del propio benchmark de atribución de autoría:

| Benchmark | Resultado |
|---|---|
| Sphragm `sentence_1` validation split (macro-F1, 17 modelos) | 0.812 |

Este valor corresponde al conjunto de los 17 modelos autoriales trabajando en conjunto; el rendimiento individual de este modelo específico no se detalla por separado.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 y 7.3B parámetros, se necesitan aproximadamente 14,6 GB de VRAM para cargar el modelo en memoria (7,3B × 2 bytes). Con cuantización a 8 bits se reduciría a ~7,3 GB, y con 4 bits a ~3,7 GB, aunque el modelo solo se distribuye en bf16.
- GPU recomendadas: una GPU con 16 GB de VRAM (p. ej., RTX 4090, RTX 4080, A100 40 GB) es suficiente para inferencia en bf16. Para entrenamiento, el autor usó 2× GH200 con FSDP.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de consumo con 16 GB o más; con cuantización a 4 bits se puede ejecutar en GPUs de 8 GB.
- Opciones de despliegue: al ser pesos safetensors estándar, se puede usar con vLLM, TGI, llama.cpp (tras conversión a GGUF) u Ollama (si se convierte y se registra).
- Latencia y throughput: no disponible en la información publicada; dependerá del hardware y del framework de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos de atribución de autoría en griego antiguo) más allá de los otros 16 modelos autoriales del benchmark Sphragm, que comparten la misma arquitectura base y el mismo método de entrenamiento, diferenciándose únicamente en el corpus de autor utilizado. En comparación con el modelo base OLMo-3-7B, este modelo está especializado en una única tarea y pierde la capacidad de generación general en inglés, pero gana precisión en la tarea de atribución de autoría en griego antiguo. No se dispone de datos para comparar con otros modelos de atribución de autoría (p. ej., los basados en GPT-2 o BERT) en esta información.

## Limitaciones y advertencias

- Modelo extremadamente especializado: solo es útil para la atribución de autoría en griego antiguo; no es un modelo de propósito general y no debe usarse para generación de texto, chat o tareas lingüísticas en otros idiomas.
- Riesgo de alucinación: si se fuerza a generar texto, puede producir contenido plausible pero inventado en griego antiguo; no se ha evaluado su calidad generativa.
- Licencia restrictiva para uso comercial: el modelo se publica con licencia "other" porque el texto de entrenamiento proviene de fuentes con licencias mixtas, incluyendo material CC BY-NC-SA; esto puede impedir su uso en productos comerciales sin revisión legal previa.
- Datos de entrenamiento limitados: solo 452.450 tokens de una única obra (la Odisea), lo que puede provocar sobreajuste al estilo específico de este autor y poca generalización a otros textos homéricos.
- Sin evaluaciones de robustez: no se han publicado pruebas de sesgo, robustez o comportamiento en entradas fuera del dominio (textos no griegos o griego bizantino).
- Proyecto de investigación: el repositorio tiene 0 descargas y 0 likes en HuggingFace; es un proyecto experimental, no un producto maduro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-7b-homeric-odyssey
- Dataset Sphragm: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y puntuación: https://github.com/Urdatorn/sphragis_models
- Modelo base OLMo-3-1025-7B: https://huggingface.co/allenai/Olmo-3-1025-7B
- Página de OLMo de AI2: https://allenai.org/olmo
- Repositorio OLMo en GitHub: https://github.com/allenai/OLMo
- Modelo OLMo-7B en HuggingFace: https://huggingface.co/allenai/OLMo-7B
- Modelo OLMo-3-7B-Instruct: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Referencia metodológica: Huang, Murakami y Grieve (2025), "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081
