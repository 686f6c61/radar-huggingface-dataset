# taurusduan/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF

## Resumen

Este repositorio, publicado por el usuario taurusduan en colaboración con los métodos del laboratorio IST-DASLab (Institute of Science and Technology Austria), ofrece cuantizaciones GGUF no uniformes del modelo DeepSeek-V4.1-Flash-1017, un modelo de lenguaje sparse mixture-of-experts de 763,2B de parámetros desarrollado por DeepSeek. El problema que resuelve es la enorme huella de memoria de los modelos MoE a gran escala: mediante las técnicas GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization), se generan cuantizaciones de entre 1,75 y 2,25 bits por peso que, combinadas con el runtime Strata, permiten ejecutar el modelo en una única GPU de 12 GB de VRAM.

La relevancia de esta ficha radica en que hace accesible un modelo de frontera con ventana de contexto de 1M de tokens en hardware de consumo, algo habitualmente reservado a clústeres de aceleradores. La cuantización no es uniforme: cada tensor recibe un tipo de cuantización distinto, asignado por una búsqueda basada en gradientes que distribuye la precisión según la sensibilidad de cada tensor bajo un presupuesto total de tamaño. El resultado son ficheros GGUF estándar, compatibles con el ecosistema habitual de inferencia.

Según la model card, el build recomendado es IQ2_XXS (2,00 bpw), que iguala al modelo base en los benchmarks evaluados (AIME25, GPQA-Diamond y LiveCodeBench v6), alcanzando el 100,0 % de su media de tareas (93,54). La licencia del modelo cuantizado es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse mixture-of-experts (MoE), 384 expertos enrutados por capa, 6 activos por token |
| Parametros totales | 763,2B (196.613.849.600 en safetensors corresponden al archivo Engram; el backbone transformer suma 551,9B) |
| Parametros activos | 6 expertos enrutados por token (cifra exacta de parámetros activos por token: no disponible) |
| Longitud de contexto | 1M de tokens |
| Tipos de cuantizacion | IQ1_M (1,75 bpw), IQ2_XXS (2,00 bpw), IQ2_XS (2,25 bpw) para el backbone; Engram a IQ4_NL (4,50 bpw), fijo en todos los builds |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (backbone en 4 shards + archivo Engram compartido) |

## Arquitectura y entrenamiento

DeepSeek-V4.1-Flash-1017 es un modelo transformer sparse mixture-of-experts con 763,2B de parámetros totales, de los cuales 551,9B corresponden al backbone transformer y 196,6B a dos tablas de búsqueda denominadas "Engram". Cada capa cuenta con 384 expertos enrutados, de los cuales se activan 6 por token, lo que reduce drásticamente el coste computacional por inferencia respecto a un modelo denso equivalente. La ventana de contexto es de 1M de tokens. La model card no detalla el dataset de entrenamiento, el número de tokens ni el uso de RLHF/DPO: no disponible.

La innovación principal de este repositorio no está en el modelo base sino en el proceso de cuantización, que combina dos técnicas desarrolladas en IST-DASLab:

- **GSQ (Gumbel-Softmax Quantization)**: cuantización escalar post-training que aprende conjuntamente las asignaciones de grid por coordenada y las escalas por grupo mediante una relajación Gumbel-Softmax. Cierra gran parte de la brecha entre cuantización escalar y vectorial en el rango de 2 a 3 bits, manteniendo compatibilidad con formatos escalares estándar como GGUF.
- **RCO (Riemannian Constrained Optimization)**: asigna uno de K tipos de cuantización a cada uno de los N tensores bajo un presupuesto total de tamaño. La restricción de presupuesto se reformula como una variedad de Riemann suave en espacio de logits, lo que permite optimizar por gradiente directamente sobre la pérdida de tarea, cumpliendo el presupuesto de forma exacta sin ajuste de hiperparámetros específicos.

Como los expertos enrutados dominan el recuento de parámetros, la búsqueda dedica la mayor parte de su libertad a asignar tipos de cuantización por capa (no por experto, ya que GGUF no puede expresarlo). Las tablas Engram son tablas de búsqueda (no pesos de matmul) que se leen de forma dispersa, una fila por token, por lo que se mantienen a tipo fijo IQ4_NL en todos los builds y quedan excluidas de la búsqueda.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento matemático competitivo, evaluado en AIME25 (el build IQ2_XXS iguala al modelo base).
- Resolución de preguntas de nivel doctoral en ciencias, evaluado en GPQA-Diamond.
- Generación de código, evaluado en LiveCodeBench v6.
- Contexto extremadamente largo: ventana de 1M de tokens, adecuada para procesar documentos y repositorios completos.
- Arquitectura MoE con enrutado disperso (6 de 384 expertos activos por token), que reduce el coste de cómputo por token.
- Soporte de tool calling, agentes y capacidades específicas del modelo base: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- **Análisis de repositorios de código completos**: con una ventana de contexto de 1M de tokens, el modelo puede ingerir proyectos enteros y responder preguntas sobre arquitectura, dependencias o deuda técnica sin fragmentación del código.
- **Asistencia en investigación matemática y competiciones**: su rendimiento en AIME25 (igualando al modelo base en el build IQ2_XXS) lo hace adecuado para resolver problemas de olimpiadas matemáticas y verificar demostraciones paso a paso.
- **Revisión técnica de literatura científica**: la puntuación en GPQA-Diamond indica capacidad para razonar sobre preguntas de nivel doctoral en física, química y biología, útil para resumir y discutir papers.
- **Generación y depuración de código en flujos locales**: ejecutable en hardware de consumo vía Strata, permite integrar generación de código en pipelines locales sin depender de APIs externas, preservando la privacidad del código.
- **Procesamiento de corpus documentales extensos**: la combinación de contexto de 1M de tokens y ejecución local permite indexar y consultar grandes volúmenes de documentos legales, médicos o técnicos.
- **Investigación en cuantización de modelos grandes**: los repositorios GSQ y RCO publican el código, lo que permite reproducir o extender el enfoque de cuantización no uniforme sobre otros modelos MoE.
- **Despliegue en estaciones de trabajo sin multi-GPU**: gracias a Strata y al mmap de las tablas Engram, es una de las pocas formas de ejecutar un modelo de 763B en una sola GPU de 12 GB, útil para demos y prototipado.

## Benchmarks y rendimiento

Según la model card, el build IQ2_XXS iguala al modelo base en los tres benchmarks evaluados, alcanzando el 100,0 % de su media de tareas (93,54). El build IQ1_M pierde 1,2 puntos de media de tareas. Los valores individuales por benchmark no se detallan numéricamente en el texto de la model card (se presentan en un gráfico), por lo que solo se reportan las medias indicadas:

| Build | bpw | Media de tareas (AIME25, GPQA-Diamond, LiveCodeBench v6) | % respecto al modelo base |
|---|---|---|---|
| Modelo base (sin cuantizar) | no disponible | 93,54 | 100 % |
| IQ1_M | 1,75 | 92,34 (93,54 − 1,2) | ~98,7 % |
| IQ2_XXS | 2,00 | 93,54 | 100,0 % |
| IQ2_XS | 2,25 | no disponible | no disponible |

No se han publicado en la información disponible comparativas numéricas con otros modelos (GPT, Claude, Llama, etc.).

## Requisitos de hardware

- **VRAM**: con el runtime Strata, todos los builds (IQ1_M, IQ2_XXS e IQ2_XS) funcionan en una única GPU de 12 GB de VRAM; el resto del modelo reside en memoria del sistema. La model card incluye una nota pendiente (TBD) sobre cómo Strata distribuye los tensores entre VRAM y RAM, por lo que los requisitos exactos de RAM del sistema no están disponibles.
- **Almacenamiento**: los tamaños totales en disco son 231,32 GB (IQ1_M), 248,84 GB (IQ2_XXS) y 265,83 GB (IQ2_XS), incluyendo el archivo Engram de 110,60 GB. El repositorio completo pesa 525,8 GB.
- **Tablas Engram**: se leen de forma dispersa (una fila por token), por lo que pueden quedar memory-mapped en disco sin ocupar VRAM ni RAM; se recomienda mantenerlas en un SSD.
- **GPU recomendadas**: no disponible en la información proporcionada; por la VRAM indicada, cualquier GPU de consumo con 12 GB (por ejemplo, clase RTX 3060/4070) sería teóricamente suficiente, aunque la model card no confirma modelos concretos.
- **Despliegue**: el formato es GGUF estándar, pero la model card documenta explícitamente el uso de [Strata](https://github.com/Niko1221/Strata) como runtime. La compatibilidad con llama.cpp, Ollama, vLLM o TGI no está confirmada en la información disponible.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (base, sin cuantizar) | 763,2B (MoE, 384 expertos, 6 activos) | 1M | safetensors | MIT | Requiere hardware de servidor; referencia de calidad para las cuantizaciones |
| DeepSeek-V4.1-Flash-1017 GSQ-RCO IQ2_XXS (este repo) | 763,2B (backbone 551,9B + Engram 196,6B) | 1M | GGUF (2,00 bpw) | MIT | 248,84 GB en disco; iguala al base en benchmarks; 12 GB de VRAM con Strata |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada otras cuantizaciones de este modelo o modelos MoE de tamaño comparable con datos suficientes para comparar |

## Limitaciones y advertencias

- **Pérdida de calidad en el build más pequeño**: IQ1_M sacrifica 1,2 puntos de media de tareas respecto al modelo base; para máxima fidelidad se recomienda IQ2_XXS.
- **Requisitos de RAM del sistema no documentados**: aunque la VRAM necesaria es de 12 GB, la model card tiene una sección de memoria pendiente de completar (TBD), por lo que el requisito real de RAM del sistema (probablemente elevado, dado que el backbone no cabe en VRAM) no está confirmado.
- **Dependencia de Strata**: la ejecución en 12 GB de VRAM está documentada específicamente con el runtime Strata; la compatibilidad con otros runtimes GGUF (llama.cpp, Ollama) no está verificada en la model card.
- **Granularidad de la cuantización limitada por el formato**: la asignación de tipos de cuantización se hace por capa y no por experto, porque GGUF no puede expresar tipos por experto; esto puede dejar precisión subóptima en expertos concretos.
- **Sesgos conocidos**: no disponible; hereda los del modelo base DeepSeek-V4.1-Flash-1017, cuya model card no se incluye en la información proporcionada.
- **Riesgo de alucinación**: no cuantificado en la información disponible; como todo modelo de lenguaje de gran escala, debe validarse en usos de producción.
- **Idiomas soportados**: no disponible en la información proporcionada.
- **Descargas y adopción**: el repositorio tiene 1.975 descargas y 1 like, lo que indica adopción temprana y menor madurez comunitaria que otros repositorios de cuantizaciones.
- **Licencia**: MIT, sin restricciones conocidas para uso comercial, aunque conviene verificar la licencia del modelo base original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/taurusduan/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Paper GSQ (arXiv): https://arxiv.org/abs/2604.18556
- Paper RCO (arXiv): https://arxiv.org/abs/2605.00649
- Código GSQ (GitHub): https://github.com/IST-DASLab/GSQ
- Código RCO (GitHub): https://github.com/IST-DASLab/RCO
- Laboratorio IST-DASLab (GitHub): https://github.com/IST-DASLab
- Runtime Strata (GitHub): https://github.com/Niko1221/Strata
