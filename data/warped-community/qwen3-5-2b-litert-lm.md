# warped-community/Qwen3.5-2B-litert-lm

## Resumen

Qwen3.5-2B-litert-lm es un espejo (mirror) del modelo Qwen3.5-2B convertido al formato LiteRT-LM, mantenido por la organización warped-community para su integración en la aplicación Android "Warped". No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: la conversión del archivo `Qwen3.5-2B-VL_int8.litertlm` procedente del repositorio litert-community/Qwen3.5-2B, a su vez derivado del modelo base Qwen/Qwen3.5-2B.

El interés principal de esta ficha radica en su orientación a la inferencia en dispositivo (on-device), no en un servidor. El formato LiteRT-LM y la cuantización int8 implícita en el nombre del archivo están pensados para ejecutar un modelo de aproximadamente 2.000 millones de parámetros en hardware móvil con recursos limitados, lo que lo sitúa en la categoría de LLM de borde para aplicaciones Android.

El repositorio ocupa 3,1 GB, no registra descargas ni "likes" y se publicó y actualizó el 3 de octubre de 2026. La licencia es Apache-2.0, heredada del modelo original. No se dispone de información pública sobre arquitectura, contexto, idiomas ni datos de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | aproximadamente 2.000 millones (según la denominación del modelo; no confirmado en la información disponible) |
| Parametros activos | no aplicable / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (según el nombre del archivo `Qwen3.5-2B-VL_int8.litertlm`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | litertlm (archivo `.litertlm`, formato de LiteRT-LM) |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Autor / organizacion | warped-community |
| Modelo base | Qwen/Qwen3.5-2B |
| Fuente de la conversion | litert-community/Qwen3.5-2B |
| Libreria | litert-lm |
| Tamano del repositorio | 3,1 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-03 |
| Fecha de actualizacion | 2026-10-03 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo en la documentación proporcionada. No se especifica si el Qwen3.5-2B subyacente emplea un transformer denso, una arquitectura MoE, un modelo de estado recurrente o un esquema híbrido, ni detalles sobre atención, capas o mecanismos de decodificación. Tampoco se documenta la longitud de contexto ni el tokenizador.

En cuanto al entrenamiento, esta ficha corresponde exclusivamente a un artefacto de conversión y empaquetado para LiteRT-LM, no a un proceso de entrenamiento propio. No hay información sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación. La única transformación documentada es la conversión del archivo int8 al formato LiteRT-LM para su uso en la aplicación Android Warped. Cabe señalar que el nombre del archivo de origen incluye el sufijo "VL", lo que podría indicar capacidades de visión-lenguaje, pero este extremo no se confirma en el texto de la model card.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de la familia Qwen, aunque no se documenta explícitamente en la información disponible.
- Razonamiento y matemáticas: no disponible en la información proporcionada.
- Generación de código: no disponible en la información proporcionada.
- Visión: posible, según el sufijo "VL" del nombre del archivo de origen (`Qwen3.5-2B-VL_int8.litertlm`); no confirmado en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; la ficha de HuggingFace no declara idiomas.
- Modo "thinking" u otras capacidades especiales: no disponible.
- Ejecución en dispositivo (on-device): capacidad confirmada por el formato LiteRT-LM y su propósito declarado de uso móvil en Android.

## Casos de uso

- Asistente conversacional dentro de la aplicación Android Warped: el modelo está empaquetado específicamente para LiteRT-LM, por lo que puede ejecutarse localmente en el dispositivo sin depender de una API remota, reduciendo latencia y preservando la privacidad del usuario.
- Funciones de texto offline: aplicaciones que necesiten resúmenes, reescritura o generación de texto cuando no haya conectividad, gracias a la inferencia local en el terminal.
- Clasificación y extracción de información en el dispositivo: procesamiento de notas, mensajes o documentos del usuario sin enviar datos a servidores externos, aprovechando el tamaño reducido (~2B) y la cuantización int8.
- Autocompletado y asistencia de escritura en movilidad: integración en editores o campos de texto de aplicaciones Android donde un modelo de ~2B int8 es viable en memoria.
- Prototipado e investigación sobre LiteRT-LM: este repositorio sirve como referencia para evaluar el rendimiento de Qwen3.5-2B en el runtime LiteRT-LM y comparar con otras conversiones móviles.
- Funciones multimodales (si se confirma la capacidad VL): descripción de imágenes o respuesta a consultas sobre capturas y fotos tomadas con el móvil, siempre que el modelo base incluya visión.
- Despliegue en entornos con restricciones de red o requisitos de soberanía de datos: escenarios donde no está permitido enviar la entrada del usuario a servicios en la nube.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada: para un modelo de ~2.000 millones de parámetros en int8, una estimación orientativa de pesos es de aproximadamente 2 GB, más el overhead del runtime y la caché KV, lo que típicamente sitúa el consumo total en el rango de 2,5 a 4 GB. Esta cifra es una estimación de ingeniería, no un dato confirmado en la documentación.
- GPU de escritorio recomendadas: no disponible; el artefacto está orientado a LiteRT-LM y no a GPUs de servidor.
- GPU de consumo: no está pensado para GPUs de consumo como RTX 4090, ya que el formato objetivo es móvil. No se documenta soporte para CUDA.
- Dispositivos móviles: el formato LiteRT-LM apunta a aceleración mediante CPU, GPU móvil o NPU en SoCs Android compatibles. La lista concreta de dispositivos soportados no está disponible en la información proporcionada.
- Opciones de despliegue: LiteRT-LM (runtime objetivo). No se indica compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| warped-community/Qwen3.5-2B-litert-lm | ~2.000 millones (según denominación) | no disponible | litertlm (int8) | apache-2.0 | HuggingFace, 0 descargas |
| litert-community/Qwen3.5-2B | no disponible | no disponible | litertlm (int8) | apache-2.0 (según la ficha) | HuggingFace |
| Qwen/Qwen3.5-2B | no disponible | no disponible | no disponible | no disponible | HuggingFace (modelo base) |

No se dispone de datos de benchmarks ni de especificaciones detalladas que permitan una comparación cuantitativa con alternativas de la misma categoría (por ejemplo, otros modelos móviles empaquetados para LiteRT-LM). No disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta ninguna evaluación de sesgos en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se aportan métricas de fiabilidad.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto y los idiomas soportados, lo que impide garantizar un comportamiento adecuado en tareas multilingües o de contexto largo.
- Licencia: apache-2.0, según se indica tanto en los tags como en la model card y en el modelo original. Permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-2B, ya que esta ficha no las reproduce.
- Repositorio sin adopción: 0 descargas y 0 "likes" en el momento de la consulta; no hay validación comunitaria ni informes de uso en producción.
- Artefacto de conversión, no modelo original: cualquier problema de calidad o comportamiento debe atribuirse al modelo base o al proceso de conversión, no a un entrenamiento propio de este repositorio.
- Dependencia del runtime: el uso está ligado a LiteRT-LM; no se documenta compatibilidad con otros motores, lo que limita la portabilidad.
- Falta de documentación: la model card es mínima y no incluye detalles sobre arquitectura, contexto, idiomas ni rendimiento, lo que dificulta la evaluación técnica previa a su adopción.
- Fecha de publicación: el repositorio está fechado en octubre de 2026, posterior a la mayoría de referencias bibliográficas habituales; conviene comprobar si existen versiones más recientes.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/warped-community/Qwen3.5-2B-litert-lm
- Fuente de la conversión: https://huggingface.co/litert-community/Qwen3.5-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
