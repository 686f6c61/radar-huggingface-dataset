# tinyopsec/DeepReasoning_1R-GGUF

## Resumen

DeepReasoning_1R-GGUF es la distribución en formato GGUF del checkpoint `reaperdoesntknow/DeepReasoning_1R`, un modelo derivado de Qwen2.5-0.5B-Instruct orientado a razonamiento y destilación. El autor de esta conversión es el usuario de Hugging Face `tinyopsec`, que ha generado el conjunto de cuantizaciones con llama.cpp a partir del checkpoint original. El modelo base subyacente es el transformer denso Qwen2.5-0.5B-Instruct de Alibaba, con 494.032.768 parámetros totales.

La relevancia de esta ficha es acotada: se trata de un modelo muy pequeño (0,5 mil millones de parámetros) pensado para ejecución local en hardware modesto, no para competición en benchmarks de razonamiento de frontera. Su interés práctico reside en que ofrece una vía de bajo coste para experimentar con modelos de razonamiento destilados en CPU, GPUs de gama baja o dispositivos embebidos, gracias a las cuantizaciones de 2 a 8 bits incluidas en el repositorio.

El repositorio tiene 78 descargas y 0 likes en el momento de la consulta, con un tamaño total de 1,0 GB. No se dispone de información sobre el proceso de entrenamiento, los datos utilizados ni los resultados de benchmarks del checkpoint original, por lo que esta ficha se limita a los datos verificables del repositorio y del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), según modelo base Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con llama.cpp); el checkpoint original se distribuye aparte |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen2.5-0.5B-Instruct: un transformer denso decoder-only de la familia Qwen2, con 494 millones de parámetros. El checkpoint `DeepReasoning_1R` es, según la model card, un "reasoning/distill checkpoint", es decir, un modelo derivado mediante destilación orientado a tareas de razonamiento. No se especifica en la información disponible qué modelo profesor se utilizó, cuántos tokens de entrenamiento se emplearon, la composición del dataset ni si hubo fases de RLHF o DPO.

La contribución de este repositorio concreto es la conversión a GGUF mediante llama.cpp, que habilita la inferencia en runtimes compatibles con este formato. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, modos de pensamiento explícitos) más allá de la etiqueta "reasoning" y "distill" del checkpoint original. Toda la información sobre el proceso de destilación queda fuera del alcance de esta ficha por ausencia de datos.

## Capacidades

- Generación de texto conversacional, heredada de Qwen2.5-0.5B-Instruct.
- Orientación a razonamiento y cadenas de pensamiento, según la etiqueta "reasoning" del checkpoint.
- Ejecución local en CPU y GPU mediante llama.cpp, Ollama, LM Studio, koboldcpp y otros runtimes compatibles con GGUF.
- Cuantizaciones desde 2 hasta 8 bits, lo que permite ajustar el equilibrio entre calidad y consumo de memoria.
- Capacidades multilingües: no disponibles (no se documentan idiomas soportados).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; la etiqueta "reasoning" sugiere orientación, pero sin garantías verificables.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Experimentación con modelos de razonamiento en local: el tamaño de 0,5 mil millones de parámetros permite probar flujos de razonamiento destilado en un portátil sin GPU dedicada, usando la cuantización Q4_K_M recomendada por el autor.
- Prototipado rápido de asistentes conversacionales: sirve para validar pipelines de generación de texto y prompts antes de migrar a modelos mayores, gracias a su compatibilidad con llama.cpp y Ollama.
- Inferencia en dispositivos con recursos limitados: las cuantizaciones Q2_K y Q3_K permiten ejecutar el modelo en entornos con poca RAM, útil para demos embebidas o pruebas de concepto.
- Evaluación comparativa de destilados: útil como referencia de línea base para medir cómo se comporta un modelo de razonamiento destilado de 0,5B frente a alternativas mayores en tareas concretas.
- Generación de texto de bajo coste en pipelines por lotes: al ser un modelo pequeño y con licencia Apache 2.0, puede integrarse en tareas de generación masiva donde el coste por token importa más que la calidad de frontera.
- Educación y divulgación: adecuado para explicar el funcionamiento de las cuantizaciones GGUF y del formato llama.cpp en talleres o artículos técnicos, dado el conjunto completo de cuantizaciones disponibles en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB en F16; en torno a 0,3-0,5 GB en cuantizaciones Q4_K_M y Q3_K; menos de 0,3 GB en Q2_K (estimaciones basadas en el tamaño de los ficheros del repositorio y en el número de parámetros, no en mediciones publicadas).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM para F16; para cuantizaciones de 4 bits basta con GPUs de gama baja o integradas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer actual (RTX 3060, RTX 4060, GTX 1650, e incluso GPUs integradas) y también en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepReasoning_1R-GGUF (este) | 494 M | No disponible | Apache 2.0 | GGUF | Destilado de razonamiento sobre Qwen2.5-0.5B-Instruct |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens (según documentación del modelo base) | Apache 2.0 | Safetensors, GGUF | Modelo base oficial, sin destilación de razonamiento |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens (según documentación del modelo base) | Apache 2.0 | Safetensors, GGUF | Alternativa de mayor tamaño de la misma familia |
| SmolLM2-360M-Instruct | 360 M | No disponible en esta ficha | Apache 2.0 | Safetensors, GGUF | Alternativa de tamaño similar para ejecución local |

La comparación se limita a datos de parámetros, licencia y disponibilidad de formato; no hay datos de rendimiento publicados para este checkpoint que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de 0,5 mil millones de parámetros: la calidad de razonamiento y la fidelidad factual son limitadas en comparación con modelos de mayor tamaño; no es adecuado para tareas de alta precisión sin verificación.
- Riesgo de alucinación elevado, especialmente en dominios especializados y en cadenas de razonamiento largas.
- No se documentan los datos de entrenamiento ni el proceso de destilación, lo que impide evaluar sesgos conocidos o la procedencia del dataset.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe más allá del comportamiento heredado del modelo base.
- Longitud de contexto no confirmada para este checkpoint; no asumir los 32.768 tokens del modelo base sin verificación.
- Licencia Apache 2.0: permite uso comercial, pero el autor advierte explícitamente ("Evaluate before use") que debe evaluarse antes de desplegarlo en producción.
- Repositorio con muy poca tracción (78 descargas, 0 likes) y sin mantenimiento documentado; la fecha de creación indicada es 2026-10-28, lo que conviene verificar en el repositorio original.
- No se dispone de información sobre tool calling ni soporte de agentes; no asumir estas capacidades.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/DeepReasoning_1R-GGUF
- Checkpoint original: https://huggingface.co/reaperdoesntknow/DeepReasoning_1R
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- llama.cpp (runtime de conversión e inferencia): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
