# vitalipavlovsk/goemotions-bert-mini

## Resumen

`goemotions-bert-mini` es un clasificador multi-etiqueta de emociones para textos cortos en ingles, publicado por el usuario `vitalipavlovsk` en Hugging Face. Se obtiene por ajuste fino de `google/bert_uncased_L-4_H-256_A-4` (un BERT mini de 4 capas y 256 dimensiones ocultas, aproximadamente 11 millones de parametros) sobre la version simplificada del dataset GoEmotions, que define 28 etiquetas de emocion. El modelo resuelve la tarea de asignar una o varias emociones a una frase corta, con una ventana de entrada de 64 tokens.

El propio autor lo presenta como un artefacto experimental con limitaciones severas y documentadas. Su unico punto de comparacion es un baseline congelado muy debil que, en la practica, solo predice la clase `neutral`; superarlo demuestra que el modelo ha aprendido senal, pero no que sea competitivo frente a otros clasificadores de emociones. El resultado principal es un macro-F1 de 0,204 en el conjunto de test, con F1 de 0,0 en 15 de las 28 clases.

La relevancia de esta ficha es fundamentalmente metodologica: el autor documenta con un nivel de detalle poco habitual la cronologia exacta del entrenamiento y la evaluacion, la fuga de datos detectada y corregida, la asimetria entre el preprocesado de entrenamiento y el de inferencia, y el desglose por clase. Es util como referencia de trazabilidad y como ejemplo de publicacion honesta de un resultado negativo, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (google/bert_uncased_L-4_H-256_A-4) |
| Parametros totales | 11 millones (aproximado, segun model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens (truncado en entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors de 44,7 MB; no se documentan variantes GGUF u otras) |
| Idiomas soportados | ingles unicamente (textos cortos de Reddit) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dividido en 3 partes binarias para la subida; se reconstruye con `rebuild_weights.py`) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT reducido: 4 capas, 256 dimensiones ocultas y atencion bidireccional completa, con una cabeza de clasificacion multi-etiqueta sobre las 28 clases de GoEmotions simplificado. Se parte de los pesos de `google/bert_uncased_L-4_H-256_A-4` y se ajusta con 3 epocas fijas sobre una submuestra de 30.000 filas del conjunto de entrenamiento (semilla 0). Las perdidas de entrenamiento registradas son 0,218, 0,148 y 0,132 para las epocas 1, 2 y 3. El checkpoint publicado es el de la epoca 3, elegido a priori por el calendario fijo y no por rendimiento en dev o test.

Antes de entrenar se realizo una auditoria de fuga de datos: se eliminaron 158 filas de entrenamiento cuyo texto normalizado (minusculas y espacios colapsados) duplicaba una fila de dev o de test. La evaluacion selecciono umbrales de decision por clase exclusivamente sobre dev (rejilla de 0,10 a 0,85 con paso de 0,05, maximizando F1 por clase en dev) y despues aplico esos umbrales al test. El autor documenta una asimetria real entre preprocesado de entrenamiento e inferencia: en entrenamiento se truncaba cortando la lista de ids (`ids[:64]`), lo que en textos largos elimina el token `[SEP]` final; en inferencia se usa `tok(..., truncation=True, max_length=64)`, que lo conserva. Para entradas de 64 tokens o menos ambos procedimientos coinciden.

## Capacidades

- Clasificacion multi-etiqueta de emociones en textos cortos en ingles, con 28 etiquetas de salida.
- Deteccion fiable (segun los datos del autor) de un subconjunto de clases frecuentes: gratitude (F1 0,911), amusement (0,779), love (0,756), neutral (0,656), admiration (0,61), curiosity (0,527), optimism (0,464) y joy (0,42).
- Salida de probabilidades por clase, con umbrales por clase publicados en `thresholds.json`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo de razonamiento explicito (thinking mode).
- No tiene capacidades de vision ni de audio.
- Capacidad multilingue: no disponible; el modelo esta entrenado y evaluado solo en ingles.

## Casos de uso

- Clasificacion de comentarios en comunidades online en ingles: el modelo puede etiquetar mensajes cortos de foros o Reddit con emociones como gratitude, amusement o love, que son las clases donde el F1 es mas alto, para agregar estadisticas de tono por hilo.
- Moderacion asistida con supervision humana: util unicamente como senal complementaria para detectar entusiasmo o agradecimiento; no debe usarse para detectar anger, fear o grief, donde el F1 es 0,0.
- Etiquetado exploratorio de corpus pequenos: dado su tamano (11 M de parametros) y su coste de inferencia en CPU, sirve para preetiquetar rapidamente un corpus corto en ingles antes de una revision manual.
- Filtrado de resenas de producto: permite separar resenas claramente positivas (joy, love, gratitude, amusement) del resto, con la advertencia de que las clases negativas no son fiables.
- Docencia y experimentacion en NLP afectivo: el repositorio incluye el script de entrenamiento, el de empaquetado y el de evaluacion, lo que lo convierte en un ejemplo reproducible de protocolo de evaluacion con seleccion de umbrales solo en dev.
- Referencia de trazabilidad para auditorias de modelos: la cronologia documentada (auditoria de fuga, orden de calculo de logits, fallo y repeticion de la evaluacion) sirve como plantilla de registro para publicaciones de modelos internos.
- Deteccion de neutralidad: la clase `neutral` alcanza F1 0,656 y puede usarse para descartar mensajes sin carga emocional clara en un pipeline de preprocesado.

## Benchmarks y rendimiento

Resultados en test (5.427 ejemplos), con umbrales por clase ajustados solo en dev:

| Metrica | Modelo | Baseline congelado |
|---|---|---|
| Macro-F1 en test | 0,204 | 0,018 |

Desglose por clase (F1 en test):

| Clase | F1 |
|---|---|
| gratitude | 0,911 |
| amusement | 0,779 |
| love | 0,756 |
| neutral | 0,656 |
| admiration | 0,61 |
| curiosity | 0,527 |
| optimism | 0,464 |
| joy | 0,42 |
| anger, caring, confusion, desire, disappointment, disgust, embarrassment, excitement, fear, grief, nervousness, pride, realization, relief, remorse | 0,0 (15 clases) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; no aplican a un clasificador de este tipo. Las cifras son de una sola ejecucion, sin estimacion de varianza.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (44,7 MB de pesos mas activaciones para secuencias de 64 tokens); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; el autor entreno y evaluo en 2 nucleos de CPU con `torch 2.14.1+cpu` y aproximadamente 6 minutos por epoca.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en CPU sin problemas.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` y `AutoTokenizer`; tambien es viable exportarlo a ONNX o a llama.cpp/GGUF, aunque no se documentan dichas conversiones.
- Latencia y throughput: no disponibles de forma medida; por tamano, el coste por inferencia en CPU es del orden de milisegundos para secuencias de 64 tokens.
- Nota de despliegue: los pesos se publican partidos en 3 ficheros binarios por el limite de 25 MiB por fichero; hay que ejecutar `rebuild_weights.py` antes de cargar el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 en GoEmotions | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goemotions-bert-mini (este) | ~11 M | 64 tokens | 0,204 (test, 28 clases) | Apache 2.0 | Hugging Face |
| codewithdark/bert-Gomotions | BERT-base (~110 M) | 512 tokens | no disponible | no disponible | Hugging Face |
| Baseline congelado del autor | no aplica | no aplica | 0,018 | no aplica | descrito en la model card |

No se dispone de cifras comparables de macro-F1 para `codewithdark/bert-Gomotions` en la informacion proporcionada, por lo que la comparacion cuantitativa con alternativas de la misma tarea no esta disponible.

## Limitaciones y advertencias

- F1 de 0,0 en 15 de las 28 clases, incluidas anger, fear y grief; el autor prohibe explicitamente su uso para detectar estas emociones en cualquier contexto relacionado con seguridad.
- Macro-F1 global de 0,204: el modelo no es competitivo con clasificadores de emociones establecidos; el unico baseline superado es uno debil que solo predice `neutral`.
- Riesgo alto de alucinacion de etiquetas en clases raras: el modelo tiende a no activarlas o a confundirlas (en la prueba de humo, "I am terrified of what happens next" activo annoyance con 0,107 en lugar de fear).
- Ventana de contexto de 64 tokens: los textos mas largos se truncan, con perdida de informacion.
- Solo ingles; no hay soporte multilingue documentado.
- Asimetria documentada entre el truncado de entrenamiento y el de inferencia en entradas de mas de 64 tokens.
- Resultados de una sola ejecucion sin estimacion de varianza; no deben interpretarse como rendimiento garantizado en otros dominios.
- El modelo base y el dataset no se fijaron a revisiones concretas, por lo que la reproduccion futura puede diferir.
- Licencia Apache 2.0: permite uso comercial, pero las limitaciones tecnicas desaconsejan cualquier despliegue en produccion sin una evaluacion propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vitalipavlovsk/goemotions-bert-mini
- Modelo base: https://huggingface.co/google/bert_uncased_L-4_H-256_A-4
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Alternativa comparable en Hugging Face: https://huggingface.co/codewithdark/bert-Gomotions
- Referencia sobre el dataset GoEmotions: https://www.emergentmind.com/topics/goemotions
