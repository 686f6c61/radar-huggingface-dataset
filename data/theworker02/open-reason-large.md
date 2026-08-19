# theworker02/open-reason-large

## Resumen

Open Reason Large es un modelo de lenguaje causal de tipo GPT-2, entrenado desde cero por el usuario theworker02 sobre el subconjunto SFT del dataset open-reason. Con 91,5 millones de parámetros, se sitúa entre las versiones pequeña (1,3 M) y mediana (13,9 M) de la misma familia, aunque su tamaño sigue siendo modesto en comparación con los modelos actuales. Está pensado para experimentación y tareas de generación de texto en inglés, con una ventana de contexto muy corta (256 tokens).

Su relevancia reside en que ofrece un punto de partida ligero y fácil de ejecutar en CPU, sin necesidad de GPU, lo que permite a desarrolladores e investigadores probar técnicas de fine-tuning o inferencia en entornos con recursos limitados. El modelo se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y modificación. No obstante, su entrenamiento es extremadamente breve (400 pasos con batch 2) y su pérdida final (5,74) indica que la calidad de generación es limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2-style (causal LM) |
| Parametros totales | 91.544.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (max_seq_len) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 clásica: 12 capas transformer, dimensión de embedding 768, 12 cabezas de atención y un vocabulario de 8192 tokens. Se entrenó desde cero sobre el subconjunto SFT del dataset `theworker02/open-reason`, que contiene 3.175 filas. El proceso usó 400 pasos con un batch size de 2, alcanzando una pérdida final de 5,7361 (NLL de siguiente token). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El entrenamiento se realizó exclusivamente en CPU (AMD Ryzen 9 9950X) con PyTorch 2.12.0+cpu, sin CUDA ni GPUs. No se reporta ninguna innovación técnica más allá de la arquitectura GPT-2 estándar.

## Capacidades

- Generación de texto en inglés con formato causal (autoregresivo).
- Razonamiento básico sobre secuencias cortas, dado el contexto de 256 tokens.
- No soporta tool calling, function calling ni agentes multi-paso.
- No tiene capacidades multimodales (solo texto).
- No incluye modo de pensamiento explícito (thinking mode) ni generación de razonamiento estructurado más allá de la cadena de texto.
- Al ser un modelo pequeño y con entrenamiento limitado, las capacidades reales son muy reducidas; sirve principalmente como ejemplo de entrenamiento y para tareas de juguete.

## Casos de uso

- **Experimentos educativos**: permite a estudiantes y desarrolladores entender el funcionamiento de un LM causal desde cero, sin necesidad de GPU, y comparar el efecto del tamaño de parámetros en la calidad de generación.
- **Prototipado rápido de pipelines de generación**: al ser pequeño y cargar rápido, puede servir para probar integraciones con bibliotecas como `transformers` en entornos de desarrollo.
- **Fine-tuning en datasets pequeños**: su tamaño permite ajustarlo en una CPU en pocos minutos, útil para probar técnicas de SFT o de adaptación de dominio.
- **Pruebas de generación de texto simple**: para tareas de completado de frases o generación de párrafos cortos, aunque la calidad será baja.
- **Investigación sobre entrenamiento desde cero**: como punto de comparación para estudiar el efecto del tamaño de parámetros en la pérdida y el rendimiento.
- **Despliegue en entornos sin GPU**: en servidores CPU de bajo coste o incluso en dispositivos embebidos, puede ejecutarse con latencia baja, aunque la calidad de salida sea limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La pérdida final de entrenamiento (5,7361) es un indicador de la falta de convergencia, pero no se dispone de métricas como MMLU, HumanEval o GSM8K. No se deben comparar estos resultados con otros modelos sin datos verificables.

## Requisitos de hardware

- El modelo tiene 91,5 millones de parámetros; en FP32 ocupa aproximadamente 366 MB, en FP16 unos 183 MB. No se dispone de pesos cuantizados, pero es viable cuantizarlos manualmente.
- Se ejecuta sin problemas en CPU: el entrenamiento se realizó en un AMD Ryzen 9 9950X, por lo que la inferencia en cualquier CPU moderna es factible.
- No requiere GPU; cualquier tarjeta con 1-2 GB de VRAM sería suficiente, pero no es necesaria.
- Para despliegue, se puede usar la librería `transformers` con PyTorch CPU, o exportar a ONNX para optimización. No se menciona compatibilidad con vLLM, Ollama o TGI, aunque al ser un modelo pequeño, es probable que funcione, pero no está documentado.
- La latencia estimada en CPU será del orden de milisegundos por token, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Entrenamiento | Rendimiento |
|---|---|---|---|---|---|
| open-reason-small | ~1,3 M | no disponible | Apache-2.0 | no disponible | no disponible |
| open-reason-medium | 13.867.008 | no disponible | Apache-2.0 | no disponible | no disponible |
| open-reason-large (este) | 91.544.064 | 256 | Apache-2.0 | 400 pasos, pérdida 5,74 | no disponible |

No hay comparación con modelos comerciales o de gran escala, ya que no se dispone de datos de benchmarks. La familia Open Reason es experimental y no está diseñada para competir con modelos como Llama o GPT.

## Limitaciones y advertencias

- Contexto muy corto (256 tokens) que limita cualquier tarea que requiera razonamiento a largo plazo.
- Entrenamiento extremadamente breve (400 pasos, batch 2) y con una pérdida alta (5,74), lo que indica que el modelo no ha convergido y generará texto de baja calidad.
- Solo soporta inglés; no hay soporte para otros idiomas.
- No hay resultados de evaluación en tareas estándar, por lo que no se conoce su rendimiento real.
- No se recomienda su uso en producción: es un modelo de investigación para experimentos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está diseñado para aplicaciones reales.
- No se han documentado sesgos, pero al ser entrenado en un dataset pequeño y específico, puede reflejar los sesgos del propio dataset.

## Enlaces

- HuggingFace modelo: https://huggingface.co/theworker02/open-reason-large
- Dataset: https://huggingface.co/datasets/theworker02/open-reason
- Repositorio GitHub: https://github.com/theworker02/open-reason
- Modelo pequeño: https://huggingface.co/theworker02/open-reason-small
- Modelo mediano: https://huggingface.co/theworker02/open-reason-medium
