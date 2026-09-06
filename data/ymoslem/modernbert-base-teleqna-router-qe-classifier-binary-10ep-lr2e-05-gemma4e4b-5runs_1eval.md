# ymoslem/ModernBERT-base-TeleQnA-router-qe-classifier-binary-10ep-lr2e-05-gemma4e4b-5runs_1eval

## Resumen

El modelo `ymoslem/ModernBERT-base-TeleQnA-router-qe-classifier-binary-10ep-lr2e-05-gemma4e4b-5runs_1eval` es un clasificador de texto de clasificación binaria diseñado como estimador de calidad para el sistema en cascada de preguntas y respuestas sobre telecomunicaciones TeleQnA. Desarrollado por ymoslem, su función es recibir una pregunta y la respuesta generada por el modelo eficiente `gemma-4-E4B-it`, y predecir si dicha respuesta es correcta (`accept`) o si debe escalarse a un modelo más potente (`route`). De este modo actúa como enrutador selectivo para reducir el coste computacional en pipelines de QA.

La arquitectura se basa en `answerdotai/ModernBERT-base`, un encoder Transformer reciente, con un total de 149.606.402 parámetros. El modelo se entrenó sobre 45.000 filas del dataset `ymoslem/TeleQnA-router-gemma4-e4b` durante 10 épocas, con una tasa de aprendizaje de 2e-5, longitud máxima de 512 tokens, tamaño de lote de 64 y early stopping. Es una alternativa ligera y específica al estimador companion para `Qwen3-4B-Instruct`, con la que comparte exactamente el mismo procedimiento de entrenamiento para permitir una comparación directa.

En sus métricas de evaluación sobre 1.000 preguntas del split de test, alcanza una precisión del 54% y un recall del 46% para la clase `route`, y una precisión del 76% y recall del 82% para la clase `accept`, con una exactitud global de 0.700. El resultado supera al clasificador trivial de predecir siempre `accept`, pero el recall de `route` sigue siendo moderado, lo que limita su capacidad para detectar todas las respuestas que deberían escalarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-base (encoder Transformer) |
| Parametros totales | 149.606.402 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer basado en `answerdotai/ModernBERT-base`, fine-tuneado para clasificación binaria de texto. No se trata de un modelo generativo, sino de un clasificador que procesa la concatenación de pregunta y respuesta para emitir una etiqueta (`accept` o `route`). El entrenamiento se llevó a cabo con el comando `cre qe-train` del framework CRE-Router, sobre las cinco particiones del split de entrenamiento del dataset `ymoslem/TeleQnA-router-gemma4-e4b`, lo que supone 45.000 filas. Se usaron 10 épocas, una tasa de aprendizaje de 2e-5, longitud máxima de 512 tokens, tamaño de lote de 64, early stopping con paciencia 4 y pesos de clase activados. Las respuestas sobre las que se entrenó fueron generadas con `gemma-4-E4B-it` mediante vLLM 0.19.0 en una sola A100 80GB con concurrencia 32. El procedimiento replica exactamente el del estimador para Qwen3-4B-Instruct, garantizando que ambos modelos sean comparables.

## Capacidades

- Clasificación binaria de calidad de respuestas: dado un par pregunta-respuesta, predice si la respuesta de Gemma4-E4B es aceptable o debe enrutarse a un modelo superior.
- Enrutamiento en sistemas en cascada: permite reducir el número de llamadas a modelos grandes, seleccionando solo las respuestas que requieren escalado.
- Estimación de calidad específica por modelo: está entrenado sobre las salidas reales de Gemma4-E4B, por lo que identifica los fallos característicos de ese modelo en el dominio de telecomunicaciones.
- Soporte para clasificación con pesos de clase: el entrenamiento incorpora pesos de clase para abordar el desbalance entre etiquetas.
- Compatibilidad con el ecosistema HuggingFace: se puede cargar con `transformers` mediante la pipeline de `text-classification`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: restringidas a inglés.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Optimización de sistemas de QA en cascada: en un pipeline con Gemma4-E4B como modelo de bajo coste, el clasificador decide si la respuesta es aceptable. Si es `accept`, se entrega al usuario; si es `route`, se invoca un modelo más potente, ahorrando cómputo en la mayoría de los casos.
- Reducción de costes en infraestructura de inferencia: al evitar llamadas a modelos grandes para respuestas correctas, el coste por consulta baja. Es especialmente adecuado cuando se dispone de una sola GPU A100, como se indica en la documentación.
- Filtro de calidad en generación batch: se puede usar para etiquetar respuestas de Gemma4-E4B en un corpus de telecomunicaciones y seleccionar solo las de alta calidad para fines de publicación o curación de datasets.
- Monitoreo de calidad en asistentes de atención al cliente: en un chatbot de telecomunicaciones, el clasificador actúa como control de calidad en tiempo real, detectando respuestas insatisfactorias y activando una segunda pasada con un modelo más capaz.
- Análisis de errores de modelos eficientes: al marcar las respuestas que requieren escalado, se puede estudiar la distribución de preguntas donde Gemma4-E4B falla y usar esa información para mejorar el modelo o el design del dataset.
- Evaluación de alternativas de modelo eficiente: al estar entrenado de forma idéntica al estimador de Qwen3-4B-Instruct, permite comparar el rendimiento de un modelo pequeño frente a otro, usando la misma calidad de estimación y el mismo entorno de una sola GPU.

## Benchmarks y rendimiento

Evaluado sobre el run 0 del split de test de TeleQnA (1.000 preguntas). Los resultados son los siguientes:

| | precision | recall | F1 | support |
|---|---|---|---|---|
| Route | 0.54 | 0.46 | 0.50 | 321 |
| Accept | 0.76 | 0.82 | 0.79 | 679 |
| **accuracy** | | | **0.700** | 1000 |
| macro avg | 0.65 | 0.64 | 0.64 | |

Comparación con el estimador para Qwen3-4B-Instruct, entrenado de manera idéntica:

| | Qwen3-4B-Instruct | Gemma4-E4B |
|---|---|---|
| accuracy | 0.698 | 0.700 |
| F1 macro | 0.635 | 0.638 |

Como referencia, predecir siempre `accept` daría una exactitud de 0.679 y un macro F1 de 0.404. La ganancia real del modelo es moderada, y el recall de `route` de 0.46 implica que se pierde más de la mitad de las respuestas que deberían escalarse.

## Requisitos de hardware

- Pesos en safetensors: aproximadamente 0,6 GB, lo que se corresponde con un modelo de 149M de parámetros.
- VRAM estimada para inferencia: a partir de 0,6 GB en FP32, más la memoria de activaciones de la codificación de secuencias de 512 tokens. Es viable en GPUs de consumo como una RTX 3060 o superior, y puede ejecutarse incluso en CPU con la biblioteca `transformers`.
- GPU recomendada: no se dispone de una recomendación específica para este clasificador, pero la documentación indica que las generaciones de entrenamiento se realizaron en una sola A100 80GB.
- Opciones de despliegue: se puede servir a través de HuggingFace Transformers y HuggingFace Inference Endpoints. No se menciona soporte para vLLM, llama.cpp ni Ollama en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

El modelo comparado directamente es el estimador companion para Qwen3-4B-Instruct, con el que comparte arquitectura, procedimiento de entrenamiento y dominio:

| Parametro | Qwen3-4B-Instruct estimator | Gemma4-E4B estimator |
|---|---|---|
| Modelo base | ModernBERT-base | ModernBERT-base |
| Parametros | 149.606.402 | 149.606.402 |
| Modelo generativo evaluado | Qwen3-4B-Instruct | Gemma4-E4B |
| Accuracy | 0.698 | 0.700 |
| F1 macro | 0.635 | 0.638 |
| Licencia | apache-2.0 | apache-2.0 |
| Enlace | https://huggingface.co/ymoslem/ModernBERT-base-TeleQnA-router-qe-classifier-binary-10ep-lr2e-05-qwen4b-5runs_1eval | modelo actual |

No se han encontrado otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El recall de la clase `route` es de 0.46, lo que significa que más de la mitad de las respuestas que deberían escalarse se clasifican como aceptables; esto puede provocar que respuestas incorrectas lleguen al usuario final sin pasar por el modelo más potente.
- El modelo es específico para Gemma4-E4B en el dominio de telecomunicaciones. Su rendimiento con otros modelos generativos o en otros dominios no se ha evaluado y no debe asumirse.
- Solo soporta el idioma inglés, por lo que no es aplicable a entradas en español u otros idiomas.
- No hay documentación sobre sesgos presentes en el modelo. Al estar entrenado con un dataset de preguntas de telecomunicaciones, podría heredar sesgos de ese dominio o de las generaciones del modelo base, aunque no se dispone de análisis al respecto.
- El uso del modelo como criterio de aceptación en producción implica que la exactitud global de 0.700 es moderada y que la predicción de `accept` para todas las entradas alcanza un 0.679; la ventaja real sobre la línea base es pequeña.
- No es un modelo generativo, por lo que no produce texto por sí mismo. El riesgo de alucinación no aplica directamente, pero sí existe el riesgo de clasificaciones erróneas.
- La licencia Apache 2.0 permite el uso comercial sin restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ymoslem/ModernBERT-base-TeleQnA-router-qe-classifier-binary-10ep-lr2e-05-gemma4e4b-5runs_1eval
- Repositorio CRE-Router: https://github.com/ymoslem/CRE-Router
- Estimador companion para Qwen3-4B-Instruct: https://huggingface.co/ymoslem/ModernBERT-base-TeleQnA-router-qe-classifier-binary-10ep-lr2e-05-qwen4b-5runs_1eval
