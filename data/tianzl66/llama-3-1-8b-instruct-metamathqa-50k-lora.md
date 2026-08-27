# tianzl66/Llama-3.1-8B-Instruct-MetaMathQA-50K-LoRA

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) obtenido al ajustar fino el modelo `meta-llama/Llama-3.1-8B-Instruct` sobre 50 000 ejemplos del conjunto de datos MetaMathQA. El autor, tianzl66, lo publica como línea base para experimentos de "Spectral Surgery" orientados a mejorar el razonamiento matemático. El adaptador tiene un tamaño de 0.2 GB y se distribuye en formato PEFT (safetensors), listo para cargarse sobre el modelo base.

La relevancia de este checkpoint radica en que demuestra una mejora sustancial en la tarea de razonamiento matemático GSM8K, pasando del 65.20 % de precisión del modelo base al 77.18 % con el adaptador, un incremento de 11.98 puntos porcentuales. Esto lo convierte en un recurso útil para quienes buscan mejorar capacidades matemáticas de Llama 3.1 8B mediante fine-tuning eficiente, sin necesidad de entrenar todos los parámetros del modelo.

Al tratarse de un adaptador LoRA, no es un modelo autónomo: requiere el modelo base para funcionar. Su arquitectura hereda las características de Llama 3.1 8B Instruct, incluyendo su arquitectura transformer y su ventana de contexto, aunque no se especifican detalles adicionales en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Llama-3.1-8B-Instruct (Transformer) |
| Parametros totales | no disponible (adaptador de 0.2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA, que introduce matrices de bajo rango en las capas del transformer para ajustar el modelo con un número reducido de parámetros entrenables. En este caso, se utilizó un rango de 16, lo que implica una modificación ligera de las matrices de atención y proyección. El entrenamiento se realizó sobre 50 000 muestras del dataset MetaMathQA, un conjunto de datos diseñado para mejorar el razonamiento matemático mediante preguntas y respuestas con explicaciones.

No se proporcionan detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. El autor indica que este checkpoint sirve como línea base para experimentos de "Spectral Surgery", una técnica que probablemente modifica los pesos del adaptador de forma específica, aunque no se documenta en esta ficha.

## Capacidades

- Mejora del razonamiento matemático: el adaptador incrementa la precisión en GSM8K en 11.98 puntos porcentuales respecto al modelo base.
- Fine-tuning eficiente: al ser LoRA, permite adaptar el modelo con pocos recursos computacionales.
- Compatibilidad con el modelo base: se puede cargar sobre `meta-llama/Llama-3.1-8B-Instruct` sin modificar el resto de pesos.
- No se documentan otras capacidades específicas (tool calling, agentes, multilingüismo, etc.) más allá de las heredadas del modelo base.

## Casos de uso

- Investigación en fine-tuning eficiente: el adaptador sirve como referencia para comparar técnicas de ajuste de bajo rango en tareas matemáticas, especialmente en el contexto de Spectral Surgery.
- Mejora de modelos base en dominios específicos: se puede integrar en sistemas que requieran razonamiento matemático, como asistentes educativos o herramientas de resolución de problemas.
- Evaluación de adaptadores LoRA: permite estudiar el impacto del rango y del dataset en el rendimiento final, útil para investigadores que diseñan sus propios adaptadores.
- Prototipado rápido: al ser un adaptador pequeño, se puede cargar y probar en entornos con recursos limitados, siempre que se disponga del modelo base.
- Benchmarking de técnicas de post-entrenamiento: sirve como punto de comparación para métodos como la fusión de adaptadores o la poda selectiva de pesos.
- Integración en pipelines de razonamiento matemático: combinado con el modelo base, puede utilizarse en aplicaciones que requieran resolver problemas aritméticos o algebraicos con explicaciones.

## Benchmarks y rendimiento

El autor reporta resultados de evaluación en GSM8K (1319 problemas). La siguiente tabla muestra la precisión del modelo base, del adaptador LoRA y de variantes con Spectral Surgery (HNS, por sus siglas en inglés, probablemente "Head and Norm Surgery").

| Modelo | GSM8K |
|---|---|
| Base (Llama-3.1-8B-Instruct) | 65.20 % (860/1319) |
| MetaMathQA-50K LoRA | 77.18 % (1018/1319) |
| HNS 8+2, o_proj + down_proj | 78.39 % (1034/1319) |
| HNS 8+2, all modules | 79.38 % (1047/1319) |
| HNS 4+1, o_proj + down_proj | 78.17 % (1031/1319) |
| HNS 4+1, all modules | 79.38 % (1047/1319) |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA, no requiere hardware adicional específico más allá del necesario para ejecutar el modelo base Llama-3.1-8B-Instruct.
- Para inferencia en FP16, el modelo base necesita aproximadamente 16 GB de VRAM. Con cuantización a 4 bits, puede ejecutarse en GPUs con 8 GB o menos, aunque el adaptador en sí no está cuantizado.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB) o H100 para mayor velocidad.
- El adaptador se puede cargar con librerías compatibles con PEFT, como Hugging Face Transformers, y desplegar con vLLM, llama.cpp (si se convierte a GGUF) u Ollama, siempre que se combine con el modelo base.
- No se proporcionan datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base, ya que el adaptador no es un modelo independiente. No se dispone de datos de otros adaptadores LoRA similares entrenados con MetaMathQA en la información proporcionada.

| Modelo | Parámetros | Contexto | GSM8K | Licencia |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128k (no confirmado) | 65.20 % | Llama 3.1 Community License |
| MetaMathQA-50K LoRA (este adaptador) | adaptador ~0.2 GB | no disponible | 77.18 % | no disponible |

No se dispone de comparativas con otros adaptadores matemáticos como MetaMath-7B o MAmmoTH, por lo que se indica "no disponible".

## Limitaciones y advertencias

- El adaptador está diseñado específicamente para tareas matemáticas y puede no generalizar bien a otros dominios.
- No se especifica la licencia del adaptador; el modelo base tiene su propia licencia (Llama 3.1 Community License) que debe respetarse.
- El entrenamiento se realizó sobre 50K muestras de MetaMathQA, lo que podría provocar sobreajuste a ese tipo de problemas.
- No se documentan sesgos ni riesgos de alucinación específicos, pero al heredar las capacidades del modelo base, estos riesgos persisten.
- Para uso en producción, es necesario verificar la compatibilidad del adaptador con el modelo base y las versiones de las librerías.
- No se proporcionan detalles sobre la calidad de las respuestas fuera del benchmark GSM8K.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/tianzl66/Llama-3.1-8B-Instruct-MetaMathQA-50K-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Documentación de Llama 3.1 en NVIDIA NIM: https://build.nvidia.com/meta/llama-3_1-8b-instruct
- Tutorial de fine-tuning con LoRA (referencia general): https://kickitlikeshika.github.io/2024/07/24/how-to-fine-tune-llama-3-models-with-LoRA.html
