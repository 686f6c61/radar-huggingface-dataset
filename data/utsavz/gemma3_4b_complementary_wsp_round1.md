# utsavz/gemma3_4b_complementary_wsp_round1

## Resumen

`utsavz/gemma3_4b_complementary_wsp_round1` es una edición del modelo multimodal `google/gemma-3-4b-it` de Google DeepMind, publicada por el usuario utsavz. No se trata de un fine-tuning convencional: el autor aplica una técnica denominada Complementary Weight-Space Programming (WSP), que modifica directamente los pesos del modelo mediante ediciones en forma cerrada y sin gradientes, con el objetivo de mejorar el comportamiento de seguridad ante entradas multimodales dañinas.

El modelo conserva la arquitectura y el tamaño del Gemma 3 4B instruct original (4.300.079.472 parámetros en BF16) y solo altera dos tensores: una edición condicional de rango 1 en la proyección de salida de atención (`o_proj`) de la capa 11 y una edición complementaria en la proyección descendente del MLP (`down_proj`) de la capa 16. En total, 26.736.905 elementos de parámetros difieren del modelo base. El autor lo describe explícitamente como un artefacto de investigación de una sola ejecución, evaluado con métricas proxy automáticas.

Su relevancia es acotada pero interesante para quien investiga alineamiento y seguridad sin reentrenamiento: demuestra que una intervención quirúrgica sobre los pesos de un modelo multimodal puede reducir drásticamente la conformidad ante peticiones dañinas (del 69,8% al 4,2% según el proxy del autor) a costa de un aumento moderado del rechazo excesivo en entradas benignas (del 0,0% al 8,8%). No obstante, carece de validación independiente y de benchmarks estándar de capacidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), edición de pesos por WSP sobre `google/gemma-3-4b-it` |
| Parámetros totales | 4.300.079.472 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Gemma 3 4B) |
| Tipos de cuantización | no disponible (pesos publicados en BF16; safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (términos de uso de Gemma) |
| Formato de pesos | safetensors (BF16) |
| Modelo base | google/gemma-3-4b-it (revisión 093f9f388b31de276ce2de164bdc2081324b9767) |
| Elementos de parámetros modificados | 26.736.905 (2 tensores: capa 11 `o_proj` atención, capa 16 `down_proj` MLP) |
| Tamaño del repositorio | 8,6 GB |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 4B instruct, un transformer multimodal con capacidad de procesamiento de texto e imagen. Sobre esa base no se realiza ningún entrenamiento: no hay fine-tuning, ni gradientes, ni ajuste por RLHF o DPO. La intervención consiste en una ronda de Complementary Weight-Space Programming, una técnica de edición de pesos en forma cerrada que modifica directamente tensores concretos para inducir el comportamiento deseado (en este caso, rechazo de contenido dañino multimodal).

La edición se compone de dos partes: la mejor edición individual encontrada (una edición condicional de rango 1 aplicada a la proyección de salida de atención de la capa 11) más una edición complementaria revisada sobre la proyección descendente del MLP de la capa 16. Solo esos dos tensores difieren del modelo original, lo que supone 26.736.905 elementos de parámetros modificados. Al no haber entrenamiento, no hay datos de entrenamiento ni composición de dataset asociados; la evaluación se realiza sobre el split de test de VLGuard (1.558 registros), un conjunto de evaluación de seguridad para modelos visión-lenguaje.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados de Gemma 3 4B instruct.
- Procesamiento multimodal de imagen y texto (entrada de imágenes junto a prompts textuales).
- Comportamiento de seguridad reforzado ante entradas dañinas multimodales: el autor reporta una reducción de la conformidad dañina del 69,8% al 4,2% en el proxy de VLGuard.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (se heredaría, en su caso, del modelo base, pero no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión, audio u otras capacidades especiales: solo se documenta la entrada de imagen; no se detallan otras capacidades especiales.

## Casos de uso

- Investigación en seguridad de modelos multimodales: servir como punto de comparación controlado frente a `google/gemma-3-4b-it` para estudiar el efecto de ediciones de pesos en el comportamiento de rechazo, dado que solo difieren dos tensores.
- Evaluación de técnicas de edición de pesos sin gradientes: reproducir o contrastar el método WSP midiendo la conformidad dañina y el rechazo excesivo sobre VLGuard u otros conjuntos de seguridad.
- Filtrado de contenido en pipelines de visión-lenguaje: desplegar el modelo como capa de rechazo ante imágenes y prompts potencialmente dañinos, gracias a su tasa de conformidad dañina reportada del 4,2% en el proxy del autor.
- Estudio del equilibrio seguridad-utilidad: analizar el coste del rechazo excesivo (8,8% en benignos) frente a la ganancia en seguridad, útil para calibrar umbrales en sistemas de moderación.
- Prototipado de asistentes multimodales con requisitos de seguridad: usar el modelo en entornos de laboratorio donde se priorice el rechazo de entradas dañinas sobre la máxima cobertura de respuestas.
- Base para experimentos de edición complementaria: partir de esta ronda 1 para investigar rondas adicionales de WSP o combinaciones con otras técnicas de alineamiento.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son los de la evaluación de seguridad sobre el split de test de VLGuard (1.558 registros; decodificación greedy, 512 tokens nuevos; rechazo juzgado mediante proxy de palabras clave y expresiones regulares, aproximado):

| Modelo | Conformidad dañina | Rechazo excesivo en benignos | Salidas rotas o en bucle |
|---|---|---|---|
| Gemma 3 4B original | 698/1000 (69,8%) | 0/558 (0,0%) | 1/1558 (0,1%) |
| Este modelo | 42/1000 (4,2%) | 49/558 (8,8%) | 0/1558 (0,0%) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,6 GB solo para pesos, más memoria para el procesador multimodal y el contexto; en la práctica se recomienda al menos 16-24 GB de VRAM para uso cómodo con contexto amplio.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) para inferencia en BF16 con margen.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en BF16; en GPUs de 16 GB o menos sería necesario cuantizar, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: `transformers` con `Gemma3ForConditionalGeneration` y `AutoProcessor` (según el ejemplo del autor); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (gemma3_4b_complementary_wsp_round1) | 4,3B | no disponible | Edición WSP de seguridad sobre Gemma 3 4B | Gemma | Hugging Face (0 descargas) |
| google/gemma-3-4b-it | 4,3B | no disponible | Modelo base multimodal instruct | Gemma | Hugging Face (oficial) |
| Alternativas de seguridad multimodal de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de capacidad comparables ni de otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación de una sola ejecución; el autor no garantiza robustez ni generalización más allá de la evaluación realizada.
- Las métricas de seguridad se basan en un proxy automático de palabras clave y expresiones regulares, aproximado y no validado por anotadores humanos.
- El rechazo excesivo en entradas benignas sube del 0,0% al 8,8%, lo que puede degradar la utilidad en producción.
- No se han publicado benchmarks de capacidad; se desconoce si las ediciones de pesos afectan al rendimiento en tareas estándar de texto, código o matemáticas.
- Riesgo de alucinación y sesgos: no documentados específicamente para esta edición; se heredan los del modelo base Gemma 3 4B.
- Idiomas soportados y longitud de contexto no documentados en la información disponible.
- Uso comercial sujeto a los términos de uso de Gemma; es necesario revisar sus restricciones antes de desplegar el modelo.
- No hay cuantizaciones oficiales publicadas ni integración documentada con frameworks de inferencia de alto rendimiento.
- El modelo tiene 0 descargas y 0 likes, sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/utsavz/gemma3_4b_complementary_wsp_round1
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- VLGuard (conjunto de evaluación de seguridad citado por el autor): no disponible en la información proporcionada
- Paper o blog de Complementary Weight-Space Programming: no disponible en la información proporcionada
