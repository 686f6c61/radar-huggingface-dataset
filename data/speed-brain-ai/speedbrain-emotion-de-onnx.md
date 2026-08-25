# speed-brain-ai/speedbrain-emotion-de-onnx

## Resumen

El modelo `speed-brain-ai/speedbrain-emotion-de-onnx` es un clasificador de emociones en texto, derivado del modelo multilingüe `MilaNLProc/xlm-emo-t` (XLM-EMO-T), que a su vez se basa en la arquitectura XLM-RoBERTa. Este repositorio no contiene un entrenamiento nuevo, sino una conversión a formato ONNX con cuantización dinámica int8, pensada para ejecución eficiente en CPU. El modelo está diseñado para detectar la emoción del usuario en cada turno de una conversación y es utilizado por el motor de inyección "Persona Forge" de speed-brain-ai para ajustar la respuesta de un personaje según el estado emocional detectado.

La etiqueta de salida es `xlmemo4`, que se pliega en un espacio canónico de siete emociones: ira, asco, miedo, alegría, neutral, tristeza y sorpresa. El modelo soporta alemán, inglés y otros idiomas multilingües, y su tamaño de repositorio es de 0.3 GB. Al estar en formato ONNX, puede desplegarse con onnxruntime en CPU sin necesidad de GPU, lo que lo hace adecuado para entornos de producción con recursos limitados.

La relevancia de este modelo radica en su capacidad para integrar análisis emocional en tiempo real en sistemas conversacionales, chatbots o herramientas de análisis de sentimiento, con un coste computacional reducido gracias a la cuantización. No obstante, al ser una conversión del modelo base, hereda sus limitaciones y su licencia, que debe consultarse en el repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (modelo base MilaNLProc/xlm-emo-t) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámico (ONNX) |
| Idiomas soportados | de, en, multilingual |
| Licencia | see-base-model (licencia del modelo base MilaNLProc/xlm-emo-t) |
| Formato de pesos | ONNX (model.onnx, model_quantized.onnx) |

## Arquitectura y entrenamiento

El modelo base `MilaNLProc/xlm-emo-t` es un clasificador de emociones multilingüe basado en XLM-RoBERTa, entrenado para predecir emociones en texto de redes sociales. El repositorio actual no incluye información sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de ajuste (fine-tuning). La model card solo indica que se trata de una conversión a ONNX con cuantización int8 dinámica del modelo original, sin modificaciones en los pesos.

La cuantización dinámica int8 reduce el tamaño del modelo y acelera la inferencia en CPU, a costa de una posible pérdida mínima de precisión. El modelo se distribuye con dos archivos: `model.onnx` (sin cuantizar) y `model_quantized.onnx` (cuantizado), junto con el tokenizador en formato `tokenizer.json`. No se documentan innovaciones técnicas adicionales más allá de la conversión de formato.

## Capacidades

- Clasificación de emociones en texto: asigna una de siete emociones (ira, asco, miedo, alegría, neutral, tristeza, sorpresa) a cada entrada.
- Soporte multilingüe: entrenado para alemán, inglés y otros idiomas (etiqueta `multilingual`).
- Salida de probabilidades: permite interpretar la confianza del modelo en cada categoría.
- Integración con onnxruntime: puede ejecutarse en CPU con `CPUExecutionProvider`, sin dependencias pesadas.
- Uso en pipelines de conversación: diseñado para detectar la emoción por turno y ajustar respuestas en sistemas de diálogo.
- Formato ONNX estándar: compatible con herramientas de despliegue como ONNX Runtime, Windows ML o Azure ML.

## Casos de uso

- Atención al cliente automatizada: el modelo puede analizar el tono de los mensajes de los usuarios en tiempo real y derivar la conversación a un agente humano si se detecta ira o frustración, mejorando la experiencia de soporte.
- Chatbots con empatía: integrado en un motor de diálogo, permite que el asistente adapte su estilo de respuesta (más formal, más cálido, etc.) según la emoción detectada en el usuario.
- Análisis de sentimiento en redes sociales: procesamiento de publicaciones o comentarios para medir la distribución emocional de una marca o campaña, con la ventaja de ser ligero y ejecutable en CPU.
- Moderación de contenido: detección de emociones negativas como miedo o asco en comentarios para priorizar la revisión humana o activar filtros automáticos.
- Evaluación de feedback de producto: clasificación de reseñas o encuestas abiertas en categorías emocionales para identificar áreas de mejora o puntos de dolor.
- Personalización de experiencias de juego o narrativa: en el contexto de "Persona Forge", el modelo ajusta la personalidad de un personaje virtual según la emoción del jugador, creando interacciones más inmersivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como precisión, recall o F1 para este modelo en particular, ni comparaciones con otros clasificadores de emociones.

## Requisitos de hardware

- El modelo ocupa 0.3 GB en el repositorio, lo que sugiere un tamaño de archivo moderado (probablemente entre 100 y 300 MB según la cuantización).
- Al ser ONNX con cuantización int8, está optimizado para CPU; no requiere GPU para inferencia.
- Puede ejecutarse en máquinas con pocos recursos, incluyendo instancias cloud de tipo CPU o incluso dispositivos edge.
- VRAM estimada: no aplica (inferencia en CPU). Si se usara GPU, el consumo sería mínimo, pero no es necesario.
- Opciones de despliegue: onnxruntime (Python, C++, C#), Windows ML, Azure ML, o cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño y cuantizado, se espera una latencia de milisegundos en CPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de clasificación de emociones. El modelo base `MilaNLProc/xlm-emo-t` es la referencia directa, y este repositorio solo añade la conversión a ONNX. Alternativas como `iimran/EmotionDetection` (basado en BERT) existen, pero no se tienen datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo hereda los sesgos del modelo base `xlm-emo-t`, que fue entrenado con datos de redes sociales; puede presentar sesgos de género, edad o cultura en la detección de emociones.
- La cuantización int8 puede degradar ligeramente la precisión en comparación con el modelo original en punto flotante.
- No se garantiza un rendimiento óptimo en todos los idiomas; la etiqueta `multilingual` no especifica qué idiomas adicionales están cubiertos.
- La licencia es la del modelo base (`see-base-model`), que puede incluir restricciones de uso (tipo RAIL) que limitan aplicaciones comerciales o de alto riesgo. Es obligatorio revisar la licencia en el repositorio de `MilaNLProc/xlm-emo-t`.
- El modelo solo realiza clasificación de emociones; no genera texto ni admite tool calling, agentes o razonamiento multi-paso.
- No se proporcionan métricas de rendimiento ni benchmarks, por lo que su eficacia en casos de uso específicos debe validarse empíricamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/speed-brain-ai/speedbrain-emotion-de-onnx
- Modelo base: https://huggingface.co/MilaNLProc/xlm-emo-t
- Paper de XLM-EMO: https://aclanthology.org/2022.wassa-1.24/ (referencia en la model card)
