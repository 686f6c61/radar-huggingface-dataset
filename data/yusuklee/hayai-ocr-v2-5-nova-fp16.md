# yusuklee/hayai-ocr-v2.5-nova-fp16

## Resumen

Hayai OCR v2.5 nova (fp16) es una conversión a media precisión (float16) del modelo JustANormalTinkerer/hayai-ocr-v2.5-nova, publicada por el usuario yusuklee. No se trata de un modelo entrenado desde cero ni de un fine-tuning: según la model card, los pesos originales en float32 se han convertido a float16 y el resto de ficheros se han copiado sin modificar. El propósito declarado es ofrecer una variante del modelo original que ocupe aproximadamente la mitad de espacio en disco y memoria, manteniendo el comportamiento del checkpoint de referencia (revisión `2803d0dc005fa4396ab1e7c5a472d2c450a247f7`).

El modelo pertenece a la familia Hayai OCR, orientada a reconocimiento óptico de caracteres, y cuenta con 156.915.968 parámetros (unos 157 millones), lo que lo sitúa en la categoría de modelos pequeños, aptos para inferencia en hardware modesto. El repositorio ocupa 0,3 GB y los pesos se distribuyen en formato safetensors con código personalizado (`custom_code`), lo que implica que la arquitectura no es estándar y requiere cargar módulos propios del autor original.

Su relevancia es acotada: al ser una mera conversión de precisión de un modelo de nicho con cero descargas y cero interacciones en el momento de la consulta, su interés práctico radica en reutilizar el pipeline OCR del modelo base con menores requisitos de memoria. No hay información publicada sobre idiomas soportados, benchmarks ni detalles de entrenamiento más allá de lo indicado en la model card del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo con `custom_code`, arquitectura no estándar de la librería Transformers) |
| Parametros totales | 156.915.968 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (esta variante); el modelo base se publica en fp32; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de que requiere `custom_code` y de que su tarea es OCR (reconocimiento óptico de caracteres). No se documentan en la información proporcionada el tipo de transformer, el número de capas, la dimensionalidad oculta, el mecanismo de atención ni si incorpora un codificador visual acoplado a un decodificador de texto. Tampoco se especifican la longitud de contexto, la resolución de imagen de entrada ni el vocabulario.

Respecto al entrenamiento, no hay datos sobre el volumen de tokens, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. La única información verificable es la del proceso de conversión: esta variante fp16 se ha generado a partir del checkpoint en float32 de la revisión `2803d0dc005fa4396ab1e7c5a472d2c450a247f7` del modelo JustANormalTinkerer/hayai-ocr-v2.5-nova, sin cambios en los pesos más allá del casteo de precisión y sin modificaciones en el resto de ficheros.

## Capacidades

- Reconocimiento óptico de caracteres (OCR): la tarea declarada de la familia Hayai OCR es la extracción de texto a partir de imágenes, aunque no se detallan en la información disponible los formatos de entrada admitidos ni el esquema exacto de salida.
- Conversión de precisión: esta variante concreta mantiene las capacidades del modelo base con pesos en fp16, lo que reduce el uso de memoria a costa de una posible pérdida mínima de precisión numérica.
- Código personalizado: requiere cargar módulos propios (`custom_code`) para su instanciación, por lo que no es compatible con un `AutoModel` estándar sin confiar en código remoto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión general, audio): no disponibles en la información proporcionada; la única modalidad documentada es la relacionada con OCR.

## Casos de uso

- Digitalización de documentos escaneados: el modelo puede emplearse para extraer texto de facturas, contratos o formularios previamente rasterizados, integrándose en un pipeline de preprocesado de imagen seguido de la inferencia OCR y un postprocesado de estructuración de campos.
- Procesamiento por lotes en servidores modestos: con unos 157 millones de parámetros y pesos fp16 (aproximadamente 0,3 GB de repositorio), es viable ejecutar lotes de imágenes en una única GPU de gama media o incluso en CPU, lo que encaja en tareas de digitalización masiva de archivos históricos.
- Automatización de la entrada de datos en back office: extracción de campos de albaranes, tickets o partes de trabajo para volcarlos a un ERP, usando el modelo como primer paso y validación humana posterior en los casos de baja confianza.
- Indexación y búsqueda sobre archivos PDF escaneados: conversión de documentos a texto para alimentar un motor de búsqueda o un sistema RAG, donde el OCR actúa como capa de extracción previa a la vectorización.
- Despliegue en el borde o en entornos con recursos limitados: al ser una variante fp16 de un modelo pequeño, puede ejecutarse en dispositivos con poca VRAM o en contenedores sin acelerador dedicado, útil para prototipos y pruebas de concepto.
- Evaluación comparativa de precisión fp16 frente a fp32: al ser una conversión directa del checkpoint original, sirve para medir en un pipeline real la degradación de exactitud que introduce el casteo a media precisión antes de adoptar la variante en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 156,9 millones de parámetros en fp16, los pesos ocupan aproximadamente 0,31 GB; sumando activaciones y buffers, es razonable esperar un consumo de alrededor de 1-2 GB de VRAM, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: al no haber datos publicados, cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente; tarjetas como RTX 3060, RTX 4060, T4 o superiores son candidatas razonables, pero es una estimación, no un dato verificado.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPU de consumo actuales, dado el reducido tamaño del modelo; no confirmado con mediciones.
- Opciones de despliegue: al requerir `custom_code`, es necesario cargar el modelo con `trust_remote_code=True` en Transformers; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la presencia de código personalizado hace poco probable un soporte directo en algunos de estos motores sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| yusuklee/hayai-ocr-v2.5-nova-fp16 | 156,9 M | no disponible | Apache-2.0 | safetensors (fp16) | Conversión fp16 del modelo base, requiere `custom_code` |
| JustANormalTinkerer/hayai-ocr-v2.5-nova | 156,9 M (según el modelo base declarado) | no disponible | Apache-2.0 | safetensors (fp32) | Modelo original del que deriva esta variante |
| Alternativas OCR de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de información de benchmarks ni de modelos comparables verificados en la documentación aportada |

## Limitaciones y advertencias

- Modelo derivado sin validación independiente: la model card indica que solo se ha casteado la precisión; no se documentan evaluaciones que confirmen que la exactitud del OCR se mantiene respecto al checkpoint fp32.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la evidencia comunitaria sobre su funcionamiento.
- Dependencia de código remoto: el tag `custom_code` obliga a ejecutar código del autor con `trust_remote_code=True`, lo que introduce un riesgo de seguridad y de reproducibilidad que debe evaluarse antes de usarlo en producción.
- Idiomas no documentados: se desconoce qué alfabetos y lenguas cubre el modelo, por lo que no puede asumirse un buen rendimiento en castellano o en textos multilingües sin pruebas previas.
- Riesgo de alucinación y errores de transcripción: como todo modelo OCR basado en aprendizaje, puede omitir caracteres, confundir glifos similares o inventar texto en imágenes de baja calidad; se recomienda umbral de confianza y revisión humana en flujos críticos.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar los avisos de copyright y licencia; conviene verificar también la licencia del modelo base y de los datos de entrenamiento originales, no detallados aquí.
- Sin garantías de soporte: al ser una conversión de un tercero y no un modelo mantenido por el autor original, no hay compromiso de actualizaciones ni de corrección de errores.
- Contexto y resolución de entrada desconocidos: la ausencia de estos datos impide planificar el tamaño máximo de documento o imagen por inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yusuklee/hayai-ocr-v2.5-nova-fp16
- Modelo base: https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2.5-nova
- Revisión del modelo base utilizada: https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2.5-nova/tree/2803d0dc005fa4396ab1e7c5a472d2c450a247f7
