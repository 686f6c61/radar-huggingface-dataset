# tinyopsec/Qwen2.5-0.5B-abliterated-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del checkpoint `sbussiso/Qwen2.5-0.5B-abliterated`, una versión "abliterated" (sin mecanismos de rechazo) del modelo `Qwen/Qwen2.5-0.5B-Instruct` de Alibaba. La publicación corre a cargo del usuario `tinyopsec` y su aportación principal es empaquetar el modelo en 13 variantes de cuantización generadas con llama.cpp, de modo que pueda ejecutarse en prácticamente cualquier hardware, incluido CPU y dispositivos de baja potencia.

El modelo subyacente es un transformer decoder-only de la familia Qwen2.5, con unos 630 millones de parámetros según los safetensors publicados (la nomenclatura comercial lo etiqueta como "0.5B"), ventana de contexto de 32.768 tokens y licencia Apache 2.0. La modificación "abliterated" elimina la dirección de rechazo en los pesos, de forma que el modelo deja de negarse a responder ante ciertas peticiones; está orientado a investigación en seguridad y a entornos controlados, no a uso comercial sin supervisión.

Su relevancia es doble: por un lado, demuestra lo pequeño que puede ser un modelo conversacional funcional para tareas de clasificación, extracción o generación sencilla en local; por otro, sirve como banco de pruebas reproducible para estudiar el fenómeno del "refusal" y las técnicas de abliteración en modelos de pesos abiertos. No obstante, el repositorio no incluye tarjeta de evaluación, benchmarks ni métricas de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2): GQA, SwiGLU, RoPE, RMSNorm, embeddings atados |
| Parámetros totales | 630.167.424 (~630 M) según safetensors; la nomenclatura del modelo indica "0.5B" |
| Parámetros activos | no aplica (modelo denso, sin MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-0.5B-Instruct; la model card de esta ficha no lo explicita) |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible en la model card (el modelo base Qwen2.5 declara soporte multilingüe de ~29 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only de 24 capas, dimensión oculta 896, 14 cabezas de atención y 2 cabezas KV (atención con query groups, GQA), activación SwiGLU, normalización RMSNorm y embeddings de entrada/salida atados. El vocabulario ronda las 151.936 entradas y el modelo fue entrenado por Alibaba sobre aproximadamente 18 billones de tokens, con un pipeline de post-entrenamiento que incluye instrucción y alineamiento. La ventana de contexto nativa es de 32.768 tokens.

Sobre esa base, el autor original (`sbussiso`) aplicó abliteración, una técnica popularizada por FailSpy que consiste en identificar la "dirección de rechazo" a partir de las activaciones medias frente a prompts dañinos y neutros, y proyectarla fuera de los pesos (típicamente en las matrices de atención y MLP). El resultado es un modelo que conserva la estructura y el tokenizador del original, pero con la conducta de negativa atenuada. El repositorio de `tinyopsec` no entrena ni modifica el modelo: solo lo convierte a GGUF con llama.cpp y ofrece varias precisiones, desde F16 hasta Q2_K.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat de Qwen2.5.
- Razonamiento básico y respuesta a preguntas gracias a los 32.768 tokens de contexto.
- Generación de código y matemáticas sencillas, limitada por el tamaño del modelo.
- Soporte de tool calling / function calling heredado de la variante Instruct (uso fiable limitado en 0.5B).
- Capacidades multilingües heredadas del modelo base, aunque no declaradas explícitamente en la model card.
- Conducta de rechazo atenuada ("uncensored"): responde a peticiones que el modelo original rechazaría.
- No dispone de visión, audio ni modos de "thinking" explícitos.
- Inferencia en CPU, GPU y dispositivos embebidos gracias a las cuantizaciones GGUF.

## Casos de uso

- Clasificación y etiquetado de texto en local: para filtrar correos, tickets o reseñas en un servidor sin GPU, usando Q4_K_M con un consumo de memoria inferior a 1 GB.
- Extracción de información estructurada: convertir texto libre en JSON o campos concretos en pipelines de ETL, aprovechando la ventana de 32K para documentos medianos.
- Asistente conversacional embebido sin conexión: integrado en aplicaciones de escritorio, móviles o Raspberry Pi mediante llama.cpp u Ollama, sin depender de la nube.
- Prototipado rápido de pipelines de IA generativa: permite validar prompts, plantillas y flujos de agente antes de migrar a un modelo mayor, con latencia muy baja.
- Investigación en seguridad y alineación: estudiar el comportamiento de rechazo, medir la eficacia de la abliteración y comparar respuestas frente al modelo original alineado.
- Red teaming y pruebas de robustez: generar respuestas sin filtros en entornos controlados para evaluar classificadores de contenido y sistemas de moderación.
- Generación de código sencilla y autocompletado en IDE: tareas de snippets, docstrings o tests unitarios básicos donde un modelo de 0.5B es suficiente y económico.
- Moderación y reescritura de texto a gran escala: por su bajo coste por token, útil para normalizar, resumir o reformular grandes volúmenes de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, y tampoco se han encontrado cifras para la variante abliterated. Cualquier comparación numérica con el modelo original debe hacerse con cautela, ya que la abliteración puede degradar ligeramente capacidades generales.

## Requisitos de hardware

- VRAM/RAM estimada (solo pesos): F16 ~1,0 GB; Q8_0 ~0,6 GB; Q6_K ~0,45 GB; Q5_K_M ~0,4 GB; Q4_K_M ~0,35 GB; Q2_K ~0,25 GB.
- Con contexto y overhead del runtime: Q4_K_M cabe en menos de 1 GB; F16 con contexto completo puede requerir 1,5-2 GB.
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM sirve; RTX 3060/4060, RTX 4090, A100 y H100 lo ejecutan sobradamente, aunque el modelo no aprovecha su capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna e incluso en gráficas integradas; también en CPU y en Raspberry Pi 4/5 (con Q4_K_M).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp, llama-cpp-python, Jan y GPT4All. vLLM solo con soporte GGUF experimental.
- Latencia y throughput: no se han publicado mediciones. Por el tamaño (630 M), se estima decenas de tokens por segundo en CPU moderna y cientos en GPU, aunque son cifras orientativas no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-0.5B-abliterated-GGUF (este) | ~630 M | 32.768 | Apache 2.0 | GGUF, sin rechazo, 13 cuantizaciones |
| Qwen2.5-0.5B-Instruct | ~0,49 B | 32.768 | Apache 2.0 | Original alineado, con rechazo |
| sbussiso/Qwen2.5-0.5B-abliterated | ~0,49 B | 32.768 | Apache 2.0 | Fuente en safetensors del que deriva este repo |
| huihui_ai/qwen2.5-abliterate:0.5b | ~0,5 B | 32.768 | Apache 2.0 | Alternativa abliterada distribuida vía Ollama |

## Limitaciones y advertencias

- Modelo de 0,5B: razonamiento, matemáticas y código complejo quedan muy por debajo de modelos de 7B o superiores; alta tasa de alucinación en preguntas de conocimiento.
- La abliteración elimina los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o sesgado; requiere supervisión y filtros externos en producción.
- La model card no documenta sesgos, datos de entrenamiento ni evaluaciones de seguridad; no hay garantías de calidad.
- El uso comercial está permitido por la licencia Apache 2.0, pero la responsabilidad sobre las salidas recae en el usuario; conviene revisar las políticas de la plataforma de despliegue.
- Ventana de 32K heredada, pero el uso efectivo del contexto largo en un modelo de este tamaño es limitado y puede degradar la coherencia.
- El tool calling y el razonamiento multi-paso no son fiables en 0.5B; no se recomienda para agentes autónomos sin validación.
- El repositorio registra 0 descargas y 0 "likes", sin validación de la comunidad; la fecha de creación indicada (2026) resulta anómala.
- Existe una discrepancia entre el nombre comercial ("0.5B") y el recuento de safetensors (~630 M); conviene verificar el tamaño real antes de planificar recursos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tinyopsec/Qwen2.5-0.5B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Fuente abliterada: https://huggingface.co/sbussiso/Qwen2.5-0.5B-abliterated
- GGUF alternativo del Instruct: https://huggingface.co/QuantFactory/Qwen2.5-0.5B-Instruct-GGUF
- Índice de modelos abliterated: https://www.abliteratedmodels.org/
- Variante abliterada en Ollama: https://ollama.com/huihui_ai/qwen2.5-abliterate
- Detalle de la variante 0.5b en Ollama: https://ollama.com/huihui_ai/qwen2.5-abliterate:0.5b
