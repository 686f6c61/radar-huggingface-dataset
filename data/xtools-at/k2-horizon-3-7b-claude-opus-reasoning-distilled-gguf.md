# xtools-at/K2-Horizon-3.7B-Claude-Opus-Reasoning-Distilled-GGUF

## Resumen

K2-Horizon 3.7B — Claude Opus Reasoning Distilled (GGUF) es la versión cuantizada en formato GGUF del fine-tune homónimo publicado por el usuario xtools-at sobre IFM/K2-Horizon-3.7B, un modelo denso decoder-only del Institute of Foundation Models con un núcleo de 3.700 millones de parámetros y aproximadamente 5.058 millones almacenados si se incluyen los embeddings. El objetivo del fine-tune es que un modelo compacto de propósito general aprenda patrones de resolución de problemas a partir de trazas de razonamiento generadas por modelos Claude Opus y Sonnet, sin necesidad de un entrenamiento adicional extenso.

El problema que aborda es la brecha entre producir una explicación convincente y resolver realmente el problema: el autor expone el modelo a ejemplos de razonamiento estructurado en varios pasos para inducir cadenas de pensamiento más útiles en tareas lógicas, de código y matemáticas. El entrenamiento se limita a una época de LoRA de 16 bits sobre 8.000 ejemplos y una ventana de 8.192 tokens, un planteamiento deliberadamente ligero y reproducible.

La relevancia práctica de este repositorio concreto es el formato: al distribuirse en GGUF estático, permite ejecutar el modelo en hardware de consumo mediante llama.cpp u Ollama, algo que la versión original en transformers no facilita. Conviene subrayar que el autor no aporta evaluaciones independientes frente al checkpoint base, por lo que las mejoras de razonamiento son un objetivo declarado, no un resultado medido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, familia K2-Horizon (tag `k2_horizon`, requiere `custom_code` en transformers) |
| Parámetros totales | 5.058.255.360 (unos 5,06 B, incluyendo embeddings); núcleo de 3,7 B según el autor |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 8.192 tokens en el entrenamiento del fine-tune; el modelo base declara hasta 512K tokens, capacidad no verificada en este checkpoint |
| Tipos de cuantización | GGUF estático (los niveles concretos no se detallan en la información disponible); el repositorio ocupa 15,5 GB |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo del que deriva se publica para transformers |
| Librería | transformers (`library_name`), con pipeline `text-generation` |
| Etiquetas destacadas | `reasoning`, `chain-of-thought`, `reasoning-distillation`, `lora`, `claude-opus`, `endpoints_compatible` |
| Descargas / likes | 340 descargas, 0 likes (datos del repositorio) |
| Fechas | Creado el 23-10-2026, actualizado el 26-10-2026 |

## Arquitectura y entrenamiento

La base es IFM/K2-Horizon-3.7B, un modelo denso decoder-only de la familia abierta K2-Horizon del Institute of Foundation Models, descrito por el autor como un modelo de 3,7 B de núcleo y aproximadamente 5,06 B de parámetros almacenados contando embeddings, con soporte declarado de hasta 512K tokens de contexto y énfasis en investigación abierta, razonamiento, código y capacidades agénticas. Sobre él se aplicó un fine-tune con LoRA de 16 bits dirigido a todos los módulos compatibles, con rango 16, alpha 32, dropout 0,02, optimizador AdamW de 8 bits, scheduler lineal, weight decay 0,002, learning rate 2e-4 y configuración de batch 4 × 8, durante una única época y con longitud máxima de 8.192 tokens.

El corpus de entrenamiento combina cuatro conjuntos de trazas de razonamiento generadas por Claude: `TeichAI/Claude-Opus-4.6-Reasoning-887x`, `TeichAI/claude-4.5-opus-high-reasoning-250x`, `TeichAI/claude-sonnet-4.5-high-reasoning-250x` y `Roman1111111/claude-opus-4.6-10000x`. Se usaron 8.000 ejemplos para entrenamiento y 400 (5 %) para evaluación, muestreados proporcionalmente a la composición de los datasets y filtrados a un máximo de 8.000 caracteres por entrada. No se documenta ninguna innovación arquitectónica propia ni uso de RLHF o DPO: la técnica es destilación de razonamiento mediante ajuste supervisado sobre trazas sintéticas, inspirada en el trabajo de TeichAI y en la variante v2 de Jackrong sobre Qwen3.5-4B.

Los resultados declarados de entrenamiento son una pérdida de entrenamiento de 0,833 y una pérdida de evaluación de 0,790. El autor advierte expresamente que estos valores son diagnósticos del entrenamiento y no miden calidad de razonamiento ni demuestran una mejora sobre el modelo original.

## Capacidades

- Generación de texto conversacional en inglés con pipeline `text-generation`.
- Razonamiento multi-paso y descomposición de problemas complejos, inducido por las trazas de Claude usadas en el entrenamiento.
- Cadenas de pensamiento explícitas (etiquetas `chain-of-thought` y `reasoning` en el repositorio).
- Tareas de código y preguntas técnicas, según los casos de uso previstos por el autor.
- Tareas matemáticas y analíticas.
- Explicación estructurada de respuestas y justificación de pasos intermedios.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su exposición mediante APIs compatibles con el formato de HuggingFace.
- Capacidades del modelo base no confirmadas en este checkpoint: el autor atribuye a IFM/K2-Horizon-3.7B énfasis en código y capacidades agénticas, pero no se aporta evidencia de que el fine-tune las conserve.
- No se documenta soporte de tool calling o function calling, ni visión, audio o modo thinking con conmutación explícita.

## Casos de uso

- Razonamiento local en estaciones de trabajo sin GPU de centro de datos: al estar en GGUF, el modelo se puede ejecutar con llama.cpp u Ollama en una máquina de sobremesa y usarse como asistente de resolución de problemas paso a paso sin enviar datos a la nube.
- Entornos aislados o con requisitos de confidencialidad: al poder ejecutarse en local, encaja en despliegues air-gapped donde no se permite llamar a APIs de terceros, siempre que las tareas estén en inglés.
- Depuración y explicación de código: el fine-tune está orientado a preguntas técnicas y puede emplearse para generar hipótesis sobre un fallo, descomponer un stack trace o proponer pasos de reproducción, con la salvedad de que no hay benchmarks de HumanEval que respalden la calidad.
- Tutoría de problemas matemáticos y analíticos: útil para generar desarrollos intermedios y explicar el razonamiento, con revisión humana obligatoria por el riesgo de trazas plausibles pero incorrectas.
- Preprocesado de consultas en pipelines RAG: reescritura y descomposición de preguntas complejas en subconsultas antes de la recuperación, respetando el límite efectivo de 8.192 tokens del fine-tune.
- Investigación sobre destilación de razonamiento: sirve como punto de comparación reproducible (LoRA r=16, una época, 8.000 ejemplos) frente al checkpoint base y frente a las destilaciones de Qwen3.5-4B de TeichAI y Jackrong.
- Prototipado rápido de asistentes conversacionales: el tamaño reducido y el formato GGUF permiten iterar sobre prompts y plantillas de chat en una GPU de consumo antes de decidir si se escala a un modelo mayor.
- Generación de documentación técnica con estructura argumental: resúmenes de decisiones, comparativas de alternativas y explicaciones de compromisos de diseño, en inglés y con contexto moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación estándar, y señala explícitamente que hacen falta evaluaciones independientes frente al checkpoint original de K2-Horizon para establecer el efecto del fine-tune. Los únicos números publicados son diagnósticos de entrenamiento:

| Métrica | Valor |
|---|---|
| Pérdida de entrenamiento | 0,833 |
| Pérdida de evaluación | 0,790 |
| Ejemplos de entrenamiento | 8.000 |
| Ejemplos de evaluación | 400 (5 %) |
| Épocas | 1 |
| Contexto de entrenamiento | 8.192 tokens |

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo a partir de 5,06 B de parámetros, sin contar caché KV ni overhead del runtime): en FP16 unos 10,1 GB; en cuantización de 8 bits unos 5,1 GB; en cuantización de 4 bits unos 2,5 a 3 GB. Son estimaciones, no cifras publicadas por el autor.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contextos largos y serving concurrente; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 o 8 bits con holgura; RTX 4060 Ti 16 GB, RTX 4070 Ti Super o similares para cuantizaciones de 4 a 8 bits.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más usando cuantizaciones de 4 bits, y en 16 GB con cuantizaciones de 8 bits.
- Inferencia en CPU: viable con cuantizaciones de 4 bits y RAM del orden de 4 a 6 GB, con velocidad dependiente del número de núcleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio por el formato GGUF; el repositorio incluye `custom_code`, por lo que cargarlo con transformers exige `trust_remote_code=True`. El soporte en vLLM o TGI no está confirmado en la información disponible, ya que depende de que esos motores implementen la arquitectura `k2_horizon`.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| xtools-at/K2-Horizon-3.7B-Claude-Opus-Reasoning-Distilled-GGUF (este) | ~5,06 B (núcleo 3,7 B) | 8.192 en entrenamiento; base declara hasta 512K | Apache 2.0 | GGUF | Destilación de trazas Claude, 1 época de LoRA, sin benchmarks publicados |
| xtools-at/K2-Horizon-3.7B-Claude-Opus-Reasoning-Distilled | ~5,06 B (núcleo 3,7 B) | Igual que el anterior | Apache 2.0 (según el repositorio GGUF) | Pesos transformers | Checkpoint del que proceden estas cuantizaciones |
| IFM/K2-Horizon-3.7B | 3,7 B de núcleo | Hasta 512K | No disponible en la información proporcionada | Pesos transformers | Modelo base sin destilación; referencia necesaria para medir el efecto del fine-tune |
| TeichAI/Qwen3.5-4B-Claude-Opus-Reasoning-Distill | ~4 B | No disponible | No disponible | No disponible | Destilación citada como inspiración del método |
| Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2 | ~4 B | No disponible | No disponible | No disponible | Variante v2 citada como referencia metodológica |

## Limitaciones y advertencias

- No hay benchmarks ni evaluaciones cualitativas publicadas: la mejora en razonamiento, código o matemáticas es un objetivo declarado, no un resultado demostrado frente al checkpoint base.
- La destilación sobre trazas sintéticas de Claude puede heredar errores recurrentes, sesgos estilísticos y puntos débiles de los modelos de origen; el propio autor lo advierte.
- Riesgo de alucinación y de trazas de razonamiento plausibles pero incorrectas, especialmente en matemáticas y en afirmaciones verificables, dado que el modelo no tiene acceso a herramientas ni a recuperación de información.
- Idioma: solo inglés. No se declara soporte de castellano ni de otros idiomas, por lo que el rendimiento fuera del inglés no está garantizado.
- Contexto efectivo limitado a 8.192 tokens en el fine-tune. Aunque el modelo base declara hasta 512K, esa capacidad no se ha verificado en este checkpoint y no debe asumirse en producción.
- El ajuste se hizo con entradas filtradas a 8.000 caracteres, lo que puede reducir la calidad en documentos largos dentro de la propia ventana de 8K tokens.
- Licencia Apache 2.0 en este repositorio, pero conviene revisar los términos del modelo base IFM/K2-Horizon-3.7B y de los datasets de trazas antes de un uso comercial, ya que la información disponible no detalla sus condiciones.
- Adopción muy baja (340 descargas, 0 likes) y publicación reciente: no hay validación independiente de la comunidad ni historial de uso en producción.
- El repositorio incluye código personalizado (`custom_code`), lo que implica ejecutar código del autor con `trust_remote_code=True` y auditar ese código antes de desplegarlo.
- Solo se distribuyen cuantizaciones estáticas en GGUF; no se documentan variantes dinámicas ni imatrix, ni el detalle de los niveles incluidos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/xtools-at/K2-Horizon-3.7B-Claude-Opus-Reasoning-Distilled-GGUF
- Checkpoint del fine-tune: https://huggingface.co/xtools-at/K2-Horizon-3.7B-Claude-Opus-Reasoning-Distilled
- Modelo base original: https://huggingface.co/IFM/K2-Horizon-3.7B
- Dataset TeichAI/Claude-Opus-4.6-Reasoning-887x: https://huggingface.co/datasets/TeichAI/Claude-Opus-4.6-Reasoning-887x
- Dataset TeichAI/claude-4.5-opus-high-reasoning-250x: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset TeichAI/claude-sonnet-4.5-high-reasoning-250x: https://huggingface.co/datasets/TeichAI/claude-sonnet-4.5-high-reasoning-250x
- Dataset Roman1111111/claude-opus-4.6-10000x: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Referencia metodológica TeichAI: https://huggingface.co/TeichAI/Qwen3.5-4B-Claude-Opus-Reasoning-Distill
- Referencia metodológica Jackrong v2: https://huggingface.co/Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2

Nota sobre la búsqueda web: los resultados obtenidos corresponden a la marca de grabadoras y cortadoras láser xTool y no guardan relación con este modelo. No se han localizado papers, entradas de blog, repositorios adicionales ni demos públicas del modelo más allá de los enlaces de HuggingFace listados.
