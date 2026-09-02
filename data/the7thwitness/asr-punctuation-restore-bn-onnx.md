# the7thwitness/asr-punctuation-restore-bn-onnx

## Resumen

El modelo `asr-punctuation-restore-bn-onnx` es una exportación a ONNX del modelo `SayedShaun/asr-punctuation-restore-bn` (variante de 6 capas), con el vocabulario podado para reducir su tamaño y hacerlo viable en entornos con recursos limitados. Restaura tres signos de puntuación en texto bengalí sin puntuar: el punto `।`, la coma `,` y el signo de interrogación `?`. Está pensado para ser usado como post-procesador de salidas de sistemas de reconocimiento de voz (ASR) en bengalí, que habitualmente generan texto sin puntuación.

El modelo original proviene de la solución ganadora del primer puesto en la competición Bengali.AI Speech Recognition de Kaggle, entrenado por Erdene-Ochir Tuguldur (tugstugi) del equipo Chimege. La arquitectura base es MuRIL (`google/muril-base-cased`), un transformer multilingüe para lenguas indias. La versión ONNX aquí presentada reduce los parámetros de 194,4 M a 89,5 M y el tamaño de 778 MB a 358 MB, manteniendo predicciones idénticas al modelo original gracias a la poda del vocabulario, que elimina filas de embeddings inalcanzables para entradas en bengalí o latín.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) basado en MuRIL, 6 capas |
| Parametros totales | 89,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo es fp32; la cuantizacion int8 dinamica falla y fp16 no es compatible con ONNX Runtime) |
| Idiomas soportados | bengali (bn), con soporte parcial de latin para code-switching |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fp32) |

## Arquitectura y entrenamiento

El modelo se basa en MuRIL, un transformer encoder con tokenizacion WordPiece y un vocabulario de 197 285 tokens que cubre 17 lenguas indias. La poda elimina aproximadamente el 69 % de las filas de embeddings que no pueden ser alcanzadas por texto bengali o latin, dejando intactas las filas restantes. Esto reduce el vocabulario a 60 659 tokens y los parametros a 89,5 M, sin alterar las predicciones. La arquitectura de clasificacion de tokens produce una salida logits de forma `[batch, seq, 4]` con etiquetas `0=O, 1=PERIOD, 2=COMMA, 3=QUESTION`.

No se dispone de detalles sobre el entrenamiento (numero de tokens, composicion del dataset, tecnicas de ajuste como RLHF o DPO). Se sabe que los pesos provienen de la solucion ganadora de la competicion Kaggle mencionada, y que el modelo original fue entrenado para restaurar puntuacion en transcripciones de ASR bengali. La exportacion ONNX y la poda fueron realizadas por `the7thwitness` como reformateo, sin reentrenamiento.

## Capacidades

- Restauracion de puntuacion en texto bengali: anade punto (।), coma (,) e interrogacion (?) en las posiciones adecuadas.
- Funciona sobre texto sin puntuar, incluyendo frases largas, preguntas, errores tipicos de ASR y mezcla de codigo bengali/ingles.
- Clasificacion por token: asigna una etiqueta a cada sub-token y se aplica la etiqueta del ultimo sub-token de cada palabra.
- No realiza otras tareas como generacion de texto, traduccion, tool calling o agentes.

## Casos de uso

- Post-procesado de transcripciones ASR en bengali: los sistemas de reconocimiento de voz suelen emitir texto sin puntuacion; este modelo anade los signos necesarios para mejorar la legibilidad y el procesamiento posterior.
- Mejora de traduccion automatica: como se muestra en la documentacion, restaurar la puntuacion antes de traducir con IndicTrans2 produce traducciones mucho mas precisas (por ejemplo, "হ্যালো তানভীর কী অবস্থা" sin puntuar se traduce como "hello what is the status of tanvi", mientras que con puntuacion se obtiene "Hello Tanvir, how are you?").
- Preprocesado para analisis de sentimiento o extraccion de informacion: la segmentacion en frases facilita el analisis de texto bengali en aplicaciones de NLP.
- Generacion de subtitulos o transcripciones legibles para contenido multimedia en bengali.
- Integracion en pipelines de NLP en dispositivos moviles o edge: el tamaño reducido (358 MB) permite su ejecucion en hardware con recursos limitados.
- Restauracion de puntuacion en textos bengali escritos sin signos, como mensajes de chat o publicaciones en redes sociales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica verificacion documentada es una comparacion de salidas entre el modelo ONNX podado y el modelo original fp32 en frases bengali con errores de ASR, preguntas y code-switching, donde las predicciones fueron identicas en todos los casos probados. No hay datos de latencia, throughput ni comparaciones con otros modelos en metricas estandar como MMLU o HumanEval.

## Requisitos de hardware

- El modelo ONNX de 358 MB puede ejecutarse en CPU sin necesidad de GPU, usando ONNX Runtime con el proveedor `CPUExecutionProvider`.
- No se especifican requisitos de VRAM; al ser un modelo de clasificacion de tokens con 89,5 M de parametros, cabe en la mayoria de GPUs consumer (por ejemplo, RTX 3060 o superiores) si se desea aceleracion.
- Opciones de despliegue: ONNX Runtime (Python, C++, etc.), o cualquier framework que soporte ONNX. No es compatible directamente con vLLM o llama.cpp, que estan orientados a modelos generativos.
- No se proporcionan datos de latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| `the7thwitness/asr-punctuation-restore-bn-onnx` | 89,5 M | no disponible | Restauracion de puntuacion (bn) | Apache-2.0 | ONNX |
| `SayedShaun/asr-punctuation-restore-bn` (original) | 194,4 M | no disponible | Restauracion de puntuacion (bn) | Apache-2.0 | safetensors |
| `1-800-BAD-CODE/punct_cap_seg_47_language` | no disponible | no disponible | Puntuacion, capitalizacion y segmentacion en 47 idiomas | no disponible | no disponible |

El modelo presentado es una version optimizada del original, con la mitad de parametros y un tercio del tamaño, manteniendo el mismo rendimiento. El modelo multilingue de 47 idiomas cubre mas lenguas pero no esta especializado en bengali y no se dispone de comparaciones directas.

## Limitaciones y advertencias

- Solo funciona con texto bengali (y parcialmente latin para code-switching); no soporta otros idiomas.
- La poda del vocabulario elimina tokens de otros idiomas indios, por lo que no se puede usar para esos idiomas.
- La cuantizacion int8 dinamica falla en este modelo (comprime el rango de logits y la clase "sin puntuacion" domina), y la conversion a fp16 no es compatible con ONNX Runtime. Por tanto, el modelo solo esta disponible en fp32.
- Depende de la calidad del texto de entrada: errores graves de ASR pueden afectar la prediccion de puntuacion.
- No se han publicado evaluaciones exhaustivas en conjuntos de datos estandar; la verificacion se limita a casos anecdoticos.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir al autor original (SayedShaun) y al equipo Chimege segun la atribucion indicada en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/the7thwitness/asr-punctuation-restore-bn-onnx
- Modelo original: https://huggingface.co/SayedShaun/asr-punctuation-restore-bn
- Repositorio GitHub del paquete asr-punct-restore: https://github.com/sayedshaun/asr-punct-restore
- Arquitectura base MuRIL: https://huggingface.co/google/muril-base-cased
