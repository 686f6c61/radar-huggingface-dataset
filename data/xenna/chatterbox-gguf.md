# Xenna/chatterbox-GGUF

## Resumen

Chatterbox v3 T3 es una conversión a formato GGUF del modelo de clonación de voz Chatterbox, desarrollado originalmente por Resemble AI y adaptado por el usuario Xenna para su uso con la librería StelnetTTS. Este modelo permite generar voz clonada a partir de una muestra de audio y un texto de referencia, utilizando el codec de audio S3Gen para la síntesis. La versión GGUF, cuantizada en Q8_0, ocupa 609 MB y está diseñada para ejecutarse en CPU o GPU con requisitos reducidos de memoria.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Aunque la documentación está marcada como "en construcción", la arquitectura subyacente corresponde al modelo Chatterbox de Resemble AI, con 537 millones de parámetros, y está pensada para integrarse en sistemas de síntesis de voz en tiempo real o por lotes. La relevancia actual radica en la creciente demanda de soluciones de TTS open source eficientes que puedan ejecutarse en hardware modesto sin depender de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 537.438.741 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (GGUF) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también safetensors en repositorio original) |

## Arquitectura y entrenamiento

No se han publicado detalles específicos sobre la arquitectura interna del modelo en la información disponible. Se sabe que es una conversión GGUF del modelo Chatterbox de Resemble AI, que emplea un enfoque de codificación por codec (S3Gen) para generar voz clonada. El modelo requiere dos entradas: un audio de referencia y el texto correspondiente a ese audio, para extraer las características de la voz y sintetizar nuevos enunciados.

No se dispone de información sobre los datos de entrenamiento, el número de tokens procesados ni si se utilizaron técnicas como RLHF o DPO. La adaptación GGUF realizada por Xenia se centra en la eficiencia computacional, permitiendo la ejecución en CPU mediante la librería StelnetTTS con el backend `chatterbox`.

## Capacidades

- Clonación de voz: genera habla con la voz de una muestra de referencia, manteniendo la prosodia y el timbre.
- Síntesis de texto a voz: acepta texto arbitrario como entrada para producir audio hablado.
- Requiere audio de referencia y texto de referencia para la clonación.
- Compatibilidad con el codec S3Gen: necesita el modelo de codec `s3gen.gguf` para funcionar correctamente.
- Despliegue local: diseñado para ejecutarse en CPU mediante el binario `stelnettts`.
- Sin dependencia de servicios en la nube: permite inferencia offline.

## Casos de uso

- Audiolibros personalizados: el modelo puede generar narraciones con una voz clonada a partir de una muestra del locutor original, manteniendo la coherencia vocal en capítulos largos.
- Asistentes de voz para dispositivos embebidos: su tamaño reducido (609 MB en Q8_0) permite ejecutarlo en dispositivos con poca memoria, como Raspberry Pi o routers, para generar respuestas habladas.
- Doblaje de vídeo: clonar la voz de un actor para doblar contenido en otro idioma, siempre que se disponga de la licencia correspondiente.
- Accesibilidad para personas con discapacidad del habla: clonar la voz de un usuario para que pueda comunicarse con su propia voz sintetizada.
- Pruebas automatizadas de IVR: generar audio de prueba con diferentes voces para validar sistemas de respuesta interactiva de voz.
- Creación de contenidos para juegos o animaciones: producir diálogos con voces consistentes sin necesidad de grabar cada línea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de comparación con otros modelos de TTS en términos de calidad de audio, velocidad de inferencia o precisión de clonación.

## Requisitos de hardware

- El archivo GGUF Q8_0 ocupa 609 MB, por lo que la VRAM necesaria para inferencia en GPU es inferior a 1 GB (modelo completo en memoria).
- Puede ejecutarse en CPU con al menos 2 GB de RAM libre, gracias a la cuantización GGUF y la optimización de la librería StelnetTTS.
- Compatible con GPUs de gama baja como NVIDIA GTX 1050 Ti, RTX 2060 o equivalentes con más de 1 GB de VRAM.
- La inferencia en CPU es viable para procesamiento por lotes, aunque la latencia será mayor que en GPU.
- Despliegue recomendado con `stelnettts` (binario nativo) o a través de la librería `chatterbox` de Python.
- Para uso en producción, se puede integrar en servidores con vLLM o TGI, pero no es la opción principal dado el formato GGUF orientado a CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Licencia | Formato | Uso principal |
|---|---|---|---|---|---|
| Chatterbox v3 T1 (este) | 537M | Q8_0 | Apache 2.0 | GGUF | Clonación de voz con codec S3Gen |
| ResembleAI/chatterbox (original) | 537M | fp16 | Apache 2.0 | safetensors | Clonación de voz con codec S3 |
| Coqui XTTS v2 | 500M aprox. | fp16 | CPML | safetensors | Clonación de voz multilingüe |
| Tortoise TTS | 100M | fp16 | Apache 2.0 | safetensors | Síntesis de voz desde texto |

La comparación con XTTS y Tortoise es orientativa, ya que no se han publicado resultados comparativos específicos para este modelo. La principal diferencia es que Chatterbox está optimizado para clonación de voz con codec S3, mientras que XTTS soporta más idiomas y Tortoise se centra en calidad de síntesis.

## Limitaciones y advertencias

- Documentación oficial en construcción: los parámetros de integración pueden cambiar en versiones futuras.
- Requiere el codec S3Gen por separado: el modelo no funciona sin el archivo `chatterbox-v3-s3gen-q8_0.gguf`.
- Riesgo de alucinación en el texto de referencia: si el texto de referencia no coincide con el audio, la calidad de la clonación se degrada.
- Idiomas no especificados: no se ha confirmado qué lenguas soporta el modelo, aunque el modelo original de Resemble AI está entrenado principalmente en inglés.
- Sesgos potenciales en voces sintetizadas: como cualquier sistema TTS, puede generar acentos o pronunciaciones incorrectas en nombres o palabras técnicas.
- Uso comercial permitido por Apache 2.0, pero se recomienda verificar la licencia de las voces de referencia utilizadas.
- No se han publicado métricas de calidad de audio o inteligibilidad.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/Xenna/chatterbox-GGUF
- Repositorio GitHub de Chatterbox-TTS-GGUF (HulkAi): https://github.com/HulkAi/Chatterbox-TTS-GGUF
- Model card original de Resemble AI: https://huggingface.co/ResembleAI/chatterbox
- Repositorio GitHub de cielvox2 (readme de Chatterbox GGUF): https://github.com/stelnetxcis-create/cielvox2/blob/main/hf_readmes/chatterbox-GGUF.md
- Página de referencia en local-ai-zone: https://local-ai-zone.github.io/models/chatterbox.html
