# vtava/SmolLM2-135M-MemoryFusion-r64

## Resumen

SmolLM2-135M-MemoryFusion-r64 es un artefacto de investigación del proyecto TinyCeNN-LM, desarrollado por vtava. Se trata de una adaptación del modelo base HuggingFaceTB/SmolLM2-135M que incorpora una arquitectura denominada "smollm2-memory-fusion". El objetivo es explorar mecanismos de memoria fusionada en modelos de lenguaje pequeños. El modelo se entrenó sobre una muestra de 10 mil millones de tokens del dataset FineWeb-Edu, con una longitud de contexto de 128 tokens y una dimensión de características de 32. Solo se entrenaron 19.760.130 parámetros, lo que representa el 13,69% del total, lo que sugiere un enfoque de adaptación eficiente.

Este checkpoint está pensado para investigación y experimentación, no para producción. El proceso de entrenamiento se detuvo por agotamiento del presupuesto de tiempo tras 60 minutos, y la model card advierte que la calidad de generación puede diferir sustancialmente del modelo base. Su relevancia radica en que permite estudiar técnicas de memoria y destilación en modelos pequeños con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | smollm2-memory-fusion (basada en HuggingFaceTB/SmolLM2-135M) |
| Parámetros totales | No disponible (modelo base: 135M; parámetros entrenables: 19.760.130) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura denominada "smollm2-memory-fusion", que parte del modelo base SmolLM2-135M. No se detalla la implementación exacta en la model card, pero el código fuente está disponible en el repositorio de TinyCeNN-LM. El entrenamiento se realizó sobre una muestra de 10 mil millones de tokens del dataset FineWeb-Edu, con una longitud de contexto de 128 tokens y una dimensión de características de 32. Se entrenaron 19.760.130 parámetros, el 13,69% del total, lo que indica un enfoque de adaptación eficiente, posiblemente mediante capas adicionales o un mecanismo de memoria.

El proceso de entrenamiento se detuvo por agotamiento del presupuesto de tiempo (runtime_budget) tras 60 minutos. La pérdida de entrenamiento (cross-entropy) final fue de 6,13 y la pérdida de destilación KL de 3,69. La model card indica que se trata de un checkpoint de investigación y que estas métricas no deben considerarse resultados de benchmarks.

## Capacidades

- Generación de texto: el modelo está configurado para text-generation, por lo que puede generar texto a partir de un prompt.
- No se han documentado capacidades adicionales (tool calling, visión, audio, etc.) en la información disponible.
- La longitud de contexto de 128 tokens limita las tareas que requieren ventanas largas de texto.
- Al ser un checkpoint de investigación, su comportamiento real no está validado con evaluaciones publicadas.

## Casos de uso

- Investigación en arquitecturas de memoria: permite estudiar cómo el mecanismo memory-fusion afecta al aprendizaje en modelos pequeños, gracias a que el código y los artefactos de entrenamiento están disponibles.
- Análisis de eficiencia de parámetros: al entrenar solo el 13,69% de los parámetros, es útil para investigar métodos de adaptación de bajo rango en modelos de 135M.
- Experimentos de destilación: la pérdida de destilación KL utilizada durante el entrenamiento permite analizar la transferencia de conocimiento desde un modelo profesor.
- Comparación de variantes de SmolLM2: sirve como referencia para evaluar otras adaptaciones del modelo base en entornos de investigación.
- Educación y prototipado: su pequeño tamaño permite ejecutarlo en CPU o GPUs de consumo, lo que facilita su uso en cursos o laboratorios de NLP.
- Pruebas de reproducibilidad: el repositorio incluye notebooks y artefactos de ejecución, lo que permite reproducir el entrenamiento y verificar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las métricas guardadas (cross-entropy 6,13, KL 3,69) son métricas de entrenamiento y no deben considerarse resultados de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifican cuantizaciones. Para el modelo base de 135M, en FP16 se estima un uso de aproximadamente 270 MB de VRAM. En cuantización de 4 bits, aproximadamente 70 MB.
- GPU recomendadas: no hay recomendaciones oficiales. Cualquier GPU moderna con al menos 2 GB de VRAM es suficiente.
- Compatibilidad con GPU de consumo: sí, el modelo puede ejecutarse incluso en GPUs integradas o con poca VRAM.
- Opciones de despliegue: al ser un modelo de transformers, puede usarse con vLLM, Ollama, llama.cpp (si se convierte a GGUF), TGI, etc. También se puede ejecutar directamente con la librería transformers en Python.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparación natural es con el modelo base HuggingFaceTB/SmolLM2-135M, del que deriva. No se han publicado métricas de rendimiento para ninguno de los dos en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolLM2-135M-MemoryFusion-r64 | 135M (base) / 19,76M entrenables | 128 | No disponible | HuggingFace |
| HuggingFaceTB/SmolLM2-135M | 135M | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción.
- La calidad de generación puede diferir sustancialmente del modelo base.
- Las métricas guardadas no son resultados de benchmarks.
- Longitud de contexto de 128 tokens, muy limitada para tareas de texto largas.
- Licencia no especificada, lo que puede impedir su uso comercial.
- Idiomas soportados no especificados.
- No se han documentado evaluaciones de sesgos o alucinaciones.
- El entrenamiento se detuvo por límite de tiempo, no por convergencia.

## Enlaces

- HuggingFace: https://huggingface.co/vtava/SmolLM2-135M-MemoryFusion-r64
- Repositorio de código: https://github.com/vtavakkoli/TinyCeNN-LM
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
