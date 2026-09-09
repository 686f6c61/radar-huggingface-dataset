# tencent/AuK

## Resumen

AuK es un modelo fundacional de 1.500 millones de parámetros para generación y edición de voz, desarrollado por el equipo Tencent Hunyuan. A diferencia de los sistemas de texto a voz convencionales, AuK unifica múltiples tareas —TTS zero-shot, TTS basado en instrucciones, edición de contenido y de acústica, edición paralingüística, mejora de voz y separación de fuentes— bajo una única interfaz de instrucciones en lenguaje natural. Esto permite controlar el habla generada mediante descripciones textuales, sin necesidad de arquitecturas específicas por tarea.

El modelo se entrenó con millones de horas de audio diverso y se publica bajo licencia MIT, junto con sus pesos oficiales. Además, el equipo distribuye una variante destilada, AuK-Flash, optimizada para inferencia en cuatro pasos, lo que la hace especialmente interesante para entornos con recursos limitados. AuK destaca por su versatilidad: puede clonar voces a partir de una referencia, reescribir el contenido de una grabación existente o modificar atributos prosódicos como tono, velocidad o emoción, todo desde una misma interfaz.

La arquitectura se basa en un modelo de difusión, según las etiquetas del repositorio, y aprovecha una representación compartida del audio para atender tareas de generación y edición. Aunque no se han publicado detalles completos sobre la arquitectura interna, la capacidad de procesar instrucciones de forma unificada lo convierte en una alternativa prometedora a los pipelines fragmentados tradicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (según etiquetas del repositorio) |
| Parametros totales | 1.5B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

AuK es un modelo de difusión de 1.500 millones de parámetros, como se deduce de las etiquetas del repositorio y de la documentación oficial. Se entrenó con millones de horas de audio diverso, aunque no se han publicado detalles sobre la composición exacta del dataset ni sobre el proceso de entrenamiento. La innovación principal reside en su interfaz unificada de instrucciones en lenguaje natural: una misma representación del modelo gestiona tareas de generación, edición, mejora y separación de audio, lo que simplifica el despliegue y reduce la necesidad de modelos especializados.

El equipo también ha publicado una variante destilada, AuK-Flash, que acelera la inferencia reduciendo el número de pasos a cuatro. Esto sugiere que el modelo base utiliza un proceso iterativo de difusión que puede acelerarse mediante destilación. No se ha detallado si se emplearon técnicas como RLHF o DPO en el entrenamiento; la información disponible no lo indica.

## Capacidades

- TTS zero-shot: genera voz para un texto objetivo utilizando como referencia un audio de muestra, sin entrenamiento específico por locutor.
- TTS por instrucciones: produce voz a partir de una descripción textual del hablante, sin necesidad de audio de referencia.
- Edición de contenido de voz: reescribe, inserta o elimina segmentos de texto de una grabación, manteniendo la voz y la entonación originales.
- Edición de letras: modifica la letra de una grabación cantada, preservando la melodía y el timbre vocal.
- Edición acústica: ajusta el tono (semitonos), la velocidad de habla y el volumen de una grabación existente.
- Edición paralingüística: modifica emoción, timbre, acento regional, sonidos no verbales (respiraciones, risas, toses) y convierte el habla en susurro.
- Mejora de voz y separación de fuentes: restaura audio degradado y separa voces u otras fuentes de audio.
- Interfaz unificada de instrucciones: todas las tareas se controlan mediante instrucciones en lenguaje natural, lo que facilita su integración en aplicaciones.

## Casos de uso

- Producción de audiolibros: el TTS zero-shot permite narrar un libro con una voz personalizada a partir de una muestra breve, y la edición acústica permite corregir la velocidad o la entonación sin regrabar.
- Generación de voces para personajes de videojuegos: el TTS por instrucciones crea voces sintéticas a partir de descripciones como "voz grave y ronca", acelerando la producción de contenido de audio.
- Corrección de locuciones en postproducción: la edición de contenido permite sustituir una frase mal pronunciada en un comercial o podcast sin volver a grabar al locutor.
- Adaptación de canciones a nuevos intérpretes: la edición de letras reescribe la letra de una canción manteniendo la melodía, lo que resulta útil para versiones o parodias.
- Mejora de audio en reuniones y conferencias: la mejora de voz y la separación de fuentes permiten limpiar grabaciones con ruido de fondo o múltiples hablantes.
- Creación de contenido para accesibilidad: el TTS con control emocional permite producir narraciones expresivas para audiolibros o asistentes de lectura.
- Localización de contenido audiovisual: la tarea de de-accent suaviza el acento regional de un locutor mientras preserva su voz, facilitando la adaptación a públicos de otros países.
- Producción de efectos de voz: la conversión a susurro o el cambio de timbre ofrecen herramientas creativas para diseñar sonidos en cine, radio o podcasting.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README incluye una imagen comparativa de rendimiento, pero no se han proporcionado valores numéricos accesibles. Por tanto, no es posible verificar numéricamente el rendimiento de AuK frente a otros modelos en este momento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de pesos ocupa 6.8 GB, lo que da una referencia del tamaño del modelo, pero el consumo de VRAM depende de la implementación y de la cuantización.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. La variante AuK-Flash, al requerir solo cuatro pasos, probablemente reduce el coste de inferencia, pero no existen especificaciones concretas en la información proporcionada.
- Opciones de despliegue: no disponible. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La única comparación directa disponible es entre las dos variantes del propio modelo:
| Modelo | Descripcion | Peso |
|---|---|---|
| AuK | Modelo base para generacion de alta calidad | Hugging Face · ModelScope |
| AuK-Flash | Modelo destilado para inferencia rapida en 4 pasos | Hugging Face · ModelScope |

No se han encontrado comparaciones con otros modelos de la misma categoría en la información disponible, por lo que no es posible establecer una tabla comparativa con alternativas externas.

## Limitaciones y advertencias

- Sesgos conocidos: no se han reportado sesgos específicos en la documentación disponible.
- Riesgo de alucinacion: no se ha documentado. Sin embargo, al tratarse de un modelo controlado por instrucciones, la calidad del resultado depende de la claridad de la instrucción y del audio de referencia.
- Limitaciones de contexto o idioma: los idiomas soportados no se especifican en la información disponible, por lo que no se puede garantizar cobertura multilingüe.
- Restricciones de licencia: el modelo se distribuye bajo licencia MIT, lo que permite uso comercial y modificación, siempre que se incluya el aviso de copyright y la licencia original.
- Caveat para produccion: no se proporcionan directrices sobre límites de uso responsable, y la falta de benchmarks públicos dificulta la evaluación objetiva antes de implementarlo en sistemas críticos.
- Advertencia adicional: los enlaces a arXiv, GitHub y las demos pueden cambiar o desaparecer; se recomienda consultar el repositorio oficial para la versión más reciente.

## Enlaces

- Hugging Face (modelo base): https://huggingface.co/tencent/AuK
- Hugging Face (variante Flash): https://huggingface.co/tencent/AuK-Flash
- Sitio web del proyecto: https://auk-project.github.io/
- Repositorio en GitHub: https://github.com/Tencent-Hunyuan/AuK
- Paper en arXiv: https://arxiv.org/abs/2609.08936
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/tencent/AuK
- Demo en ModelScope: https://modelscope.cn/studios/Tencent-Hunyuan/AuK
