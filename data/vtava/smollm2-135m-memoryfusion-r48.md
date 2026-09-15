# vtava/SmolLM2-135M-MemoryFusion-r48

## Resumen

SmolLM2-135M-MemoryFusion-r48 es un artifact de investigación desarrollado por vtava dentro del proyecto TinyCeNN-LM. Se trata de una variante experimental del modelo SmolLM2-135M de HuggingFace, que incorpora un mecanismo de memoria denominado `memory fusion` (tipo de ejecución `smollm2-memory-fusion`). El modelo fue entrenado sobre el subconjunto `sample-10BT` del conjunto de datos `HuggingFaceFW/fineweb-edu`, con una longitud de contexto de 128 tokens y una dimensión de características de 32. De los parámetros originales, solo 18.083.970 (12,68%) son entrenables. El checkpoint se publica como material de investigación para reproducir experimentos de destilación y eficiencia en modelos pequeños. No es un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | smollm2-memory-fusion (variante experimental de SmolLM2-135M) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura `smollm2-memory-fusion` parte del modelo base SmolLM2-135M y añade un componente de memoria con `feature_dim` 32. El entrenamiento se realizó con un presupuesto de tiempo (`runtime_budget`) que detuvo el proceso a los 60,07 minutos, alcanzando una pérdida de cross-entropy de 5,89635 y una pérdida de destilación KL de 4,37596. El pico de VRAM durante el entrenamiento fue de 3,29524 GiB. El conjunto de datos empleado fue `HuggingFaceFW/fineweb-edu` en su muestra `sample-10BT`. No se detallan innovaciones técnicas adicionales en la información disponible.

## Capacidades

- Generación de texto: no evaluada en la información disponible.
- Razonamiento: no evaluado.
- Código y matemáticas: no evaluados.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Reproducibilidad de experimentos: se usaría el checkpoint junto con los archivos de configuración y el notebook de TinyCeNN-LM para replicar el entrenamiento. Es adecuado porque el repositorio conserva los artefactos de ejecución y las métricas originales.
- Estudio de destilación de conocimiento: se analizaría la pérdida de destilación KL registrada para entender cómo el mecanismo de memoria transfiere conocimiento del profesor. Es adecuado porque el entrenamiento guarda esa métrica de forma explícita.
- Investigación de arquitecturas de memoria en modelos pequeños: el checkpoint permite comparar el comportamiento con el modelo base SmolLM2-135M en tareas de modelado de lenguaje. Es adecuado porque ambos comparten la misma base.
- Análisis de entrenamiento con presupuesto de tiempo: el `stop_reason` igual a `runtime_budget` y los 60 minutos de duración son útiles para estudiar estrategias de parada temprana en entornos con limitaciones de cómputo.
- Pruebas de eficiencia en GPU con poca memoria: el pico de VRAM de 3,3 GiB en entrenamiento ofrece una referencia para experimentos en hardware modesto.
- Evaluación de generación en contextos muy cortos: la longitud de contexto de 128 tokens es adecuada para investigar dependencias a corto plazo y el efecto del tamaño de ventana en la calidad del texto.

No es adecuado para aplicaciones de producción. Los casos de uso anteriores se limitan al ámbito académico y de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las métricas guardadas en el repositorio (cross-entropy y KL) corresponden al entrenamiento y no a una evaluación held-out, por lo que no deben interpretarse como resultados de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. El repositorio ocupa 0,1 GB, lo que sugiere que los pesos son de pequeño tamaño, pero no se proporcionan datos confirmados de VRAM.
- GPU recomendadas: no especificadas. Por su tamaño, podría ejecutarse en GPUs consumer (por ejemplo, RTX 3060 o RTX 4090) o incluso en CPU, pero no hay confirmación en la información disponible.
- Opciones de despliegue: compatible con la librería `transformers` según la etiqueta del repositorio. También podría usarse con `llama.cpp` u `Ollama` si los pesos se convierten a GGUF, pero no hay confirmación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos suficientes en la información proporcionada. El único modelo comparable conocido es el base SmolLM2-135M, pero no se han publicado especificaciones completas ni benchmarks que permitan una comparación rigurosa. Los únicos datos disponibles son los del propio checkpoint.

## Limitaciones y advertencias

- Checkpoint de investigación: la model card indica explícitamente que no debe tratarse como un resultado de benchmark publicado.
- Calidad de generación variable: la calidad puede diferir sustancialmente del modelo base SmolLM2-135M.
- Contexto muy limitado: la longitud de contexto es de 128 tokens, lo que restringe su uso a tareas de dependencias a corto plazo.
- Sesgos del conjunto de datos: el entrenamiento con `fineweb-edu` puede introducir sesgos presentes en ese corpus.
- Riesgo de alucinación: como modelo de lenguaje pequeño, puede generar contenido plausible pero incorrecto.
- Licencia no especificada: la ausencia de licencia impide determinar si el uso comercial está permitido.
- Idiomas no especificados: no se indica qué idiomas soporta, por lo que su uso multilingüe es incierto.

## Enlaces

- HuggingFace: https://huggingface.co/vtava/SmolLM2-135M-MemoryFusion-r48
- Repositorio del proyecto TinyCeNN-LM: https://github.com/vtavakkoli/TinyCeNN-LM
- La búsqueda web no arrojó enlaces adicionales relevantes; los resultados obtenidos correspondían a Google Gemini, sin relación con este modelo.
