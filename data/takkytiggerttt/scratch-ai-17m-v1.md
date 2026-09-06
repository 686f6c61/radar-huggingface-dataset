# TakkyTiggerTTT/scratch-ai-17m-v1

## Resumen

scratch-ai-17m-v1 es un modelo de generación de texto desarrollado por TakkyTiggerTTT y publicado en Hugging Face. Pertenece a la arquitectura GPT-2 (transformer decoder-only, referenciada en el paper arXiv:1910.09700) y cuenta con 16.988.160 parámetros totales, distribuidos en un repositorio de 0,1 GB. Está pensado para tareas de generación de texto en contextos de recursos limitados, como prototipado rápido, fine-tuning experimental o despliegue en dispositivos edge.

El modelo se distribuye en formato safetensors y es compatible con la librería transformers y con la infraestructura de text-generation-inference, según las etiquetas del repositorio. La model card publicada es una plantilla automática sin información real sobre datos de entrenamiento, procedimiento o uso previsto, lo que limita la evaluación objetiva de sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en GPT-2 |
| Parametros totales | 16.988.160 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (no informado) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only basado en GPT-2, como indican las etiquetas `gpt2` y `arxiv:1910.09700` del repositorio. GPT-2, presentado en el paper "Language Models are Unsupervised Multitask Learners" de Radford et al. (2019), es un modelo autoregresivo que predice el siguiente token a partir de un contexto. Sin embargo, no se proporciona información sobre la configuración concreta: número de capas, dimensiones del modelo, número de cabezas de atención, ni la longitud del contexto de entrenamiento. Tampoco se documentan los datos de entrenamiento, su composición, el número de tokens procesados ni la aplicación de técnicas de alineamiento como RLHF o DPO. El nombre del modelo ("scratch-ai-17m") sugiere un entrenamiento desde cero, pero esta interpretación no puede confirmarse con la información disponible.

## Capacidades

- Generación de texto: el modelo está etiquetado con el pipeline `text-generation`, por lo que su función prevista es producir texto autónomo a partir de una secuencia de entrada.
- No se dispone de información sobre soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No hay datos publicados sobre capacidades de generación de código, matemáticas o visión.
- No se ha documentado el número de tokens de contexto admitidos, por lo que la generación de texto largo no está garantizada.
- No se han reportado capacidades multilingües específicas.

## Casos de uso

- **Prototipado de pipelines de generación de texto**: se puede integrar en un script Python con `transformers` para validar rápidamente la lógica de preprocesado, muestreo y postprocesado. Su tamaño reducido permite ejecutar pruebas en CPU sin coste de GPU, acelerando el ciclo de desarrollo.
- **Fine-tuning experimental**: al tener 16,9M de parámetros, el fine-tuning es viable en una sola GPU pequeña o incluso en CPU. Esto permite crear modelos especializados en dominios concretos, por ejemplo textos legales o médicos, a partir de conjuntos de datos reducidos.
- **Educación en arquitecturas transformer**: un modelo GPT-2 de este tamaño es fácil de inspeccionar. Se pueden visualizar matrices de atención, estudiar la dinámica de la entropía de salida y comprender el proceso de decodificación autoregresiva con un coste computacional mínimo.
- **Despliegue en dispositivos con recursos limitados**: puede ejecutarse en hardware de bajo consumo como una Raspberry Pi o dispositivos ARM, e incluso en el navegador tras convertir los pesos a un formato compatible, para aplicaciones de autocompletado sin conexión.
- **Generación de texto en plantillas**: sirve para autocompletar plantillas o textos repetitivos en aplicaciones internas donde la precisión no es crítica, como rellenar correos estándar o descripciones de productos, priorizando la eficiencia computacional.
- **Investigación sobre scaling laws**: proporciona un punto de datos para comparar el comportamiento de modelos de 17M de parámetros frente a otros de mayor tamaño, explorando cuestiones sobre la relación entre parámetros, datos de entrenamiento y rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: los pesos en FP32 ocupan aproximadamente 68 MB (16.988.160 parámetros × 4 bytes). Añadiendo activaciones y caché, la inferencia puede ejecutarse con menos de 1 GB de VRAM o incluso en RAM del sistema.
- **GPU recomendada**: cualquier GPU compatible con CUDA, incluso una de gama baja como una GTX 1650 o RTX 3050, es más que suficiente. Alternativamente, puede ejecutarse en CPU con latencia baja para tareas ligeras.
- **Compatibilidad con GPUs de consumo**: sí, cabe en cualquier GPU de consumo y en CPUs con poca memoria RAM (suficiente con 1 GB de RAM libre).
- **Opciones de despliegue**: compatible con la librería `transformers` (carga mediante `AutoModelForCausalLM`), vLLM, `text-generation-inference` y TGI, según las etiquetas del repositorio. Los pesos en safetensors pueden convertirse a GGUF para su uso con llama.cpp u Ollama.
- **Latencia y throughput**: no hay estimaciones publicadas. Dado el tamaño, se espera una latencia de decenas de milisegundos en CPU moderna y de pocos milisegundos en GPU, pero sin datos oficiales no es posible confirmarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TakkyTiggerTTT/scratch-ai-17m-v1 | 16,9M | No disponible | No disponible | No disponible | Hugging Face |
| GPT-2 small | 124M | 1024 tokens | No disponible | MIT | Hugging Face |
| DistilGPT-2 | 82M | 1024 tokens | No disponible | Apache 2.0 | Hugging Face |

No se dispone de resultados de benchmarks en la información disponible para ninguno de los modelos comparados. GPT-2 small y DistilGPT-2 se incluyen como modelos de referencia dentro de la misma familia arquitectónica, aunque ambos son sustancialmente mayores.

## Limitaciones y advertencias

- **Sin información sobre sesgos**: al no estar documentados los datos de entrenamiento, no es posible identificar ni mitigar sesgos potenciales.
- **Alto riesgo de alucinación esperado**: los modelos de este tamaño suelen generar texto incoherente o factualmente incorrecto, especialmente cuando se carece de datos de evaluación.
- **Falta de documentación completa**: la model card es una plantilla automática sin información sobre la estructura del modelo, el procedimiento de entrenamiento, las métricas de evaluación o las restricciones de uso.
- **Licencia no especificada**: al no haber una licencia declarada en el repositorio, el uso comercial no está garantizado y puede requerir consultar al autor.
- **Capacidades limitadas para tareas complejas**: con 16,9M de parámetros, el modelo queda muy por debajo de modelos modernos en razonamiento, generación de código, matemáticas o comprensión de texto.
- **Contexto y lenguaje no confirmados**: sin especificación de la longitud de contexto ni de los idiomas soportados, el comportamiento en escenarios con texto largo o multilingüe es impredecible.

## Enlaces

- Hugging Face: https://huggingface.co/TakkyTiggerTTT/scratch-ai-17m-v1
- Paper de referencia GPT-2 (citado en las etiquetas del modelo): https://arxiv.org/abs/1910.09700
