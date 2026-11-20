# yabaimimi/ReadyArt__Wicked-Tutu-31B-Final-EXL3

## Resumen

ReadyArt__Wicked-Tutu-31B-Final-EXL3 es una cuantización EXL3 del modelo base ReadyArt/Wicked-Tutu-31B-Final, publicada por el usuario yabaimimi. No se trata de un modelo entrenado desde cero ni de un fine-tune original, sino de una conversión de pesos orientada al motor de inferencia ExLlamaV3 y a servidores compatibles como TabbyAPI. Su propósito es reducir la huella de memoria y acelerar la decodificación del modelo de 31B parámetros original sobre GPUs de consumo y profesionales, manteniendo la calidad lo más cerca posible del checkpoint en precisión completa.

La información pública disponible es muy limitada: la model card únicamente indica que la cuantización se realizó con exllamav3 v1.6.7 y remite al modelo base para cualquier detalle sobre arquitectura, entrenamiento o capacidades. No se especifican parámetros activos, longitud de contexto, idiomas soportados ni resultados de evaluación. La licencia declarada es Apache 2.0, heredada del modelo base según los metadatos.

Por su naturaleza, esta ficha debe leerse como una descripción de un artefacto de cuantización: lo relevante es el formato EXL3, la compatibilidad con ExLlamaV3/TabbyAPI y las implicaciones prácticas de desplegar un modelo de 31B en ese formato. Cualquier dato sobre calidad, sesgos o rendimiento del modelo subyacente debe consultarse en la model card de ReadyArt/Wicked-Tutu-31B-Final, que no forma parte de la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base ReadyArt/Wicked-Tutu-31B-Final) |
| Parámetros totales | 31B (según el nombre del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 (formato de ExLlamaV3); niveles concretos no especificados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (exllamav3), compatible con TabbyAPI |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. El nombre indica un modelo de 31B parámetros, pero no se confirma si emplea un transformer denso, una mezcla de expertos u otra variante. Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del corpus ni si se aplicaron técnicas de alineación como RLHF o DPO. Todos estos datos deben consultarse en la model card del modelo original ReadyArt/Wicked-Tutu-31B-Final.

La innovación técnica de esta publicación es exclusivamente la cuantización EXL3 realizada con exllamav3 v1.6.7. EXL3 es un formato de cuantización diseñado para el motor ExLlamaV3, que combina pesos de baja precisión con kernels optimizados para GPUs NVIDIA, y que en la práctica se sirve mediante TabbyAPI. La model card menciona también la etiqueta QTIP, asociada a técnicas de cuantización con información teórica, aunque no se detalla cómo se aplica en esta conversión concreta ni qué nivel de bits se utilizó.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base; no se documentan capacidades específicas en la información disponible.
- Razonamiento, código y matemáticas: no disponible (depende del modelo base, sin datos publicados aquí).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad de despliegue: pensado para ExLlamaV3 y TabbyAPI, lo que habilita una API compatible con OpenAI para integración en aplicaciones.

## Casos de uso

- Servicio de inferencia local con TabbyAPI: desplegar el modelo en una estación de trabajo con GPU NVIDIA y exponer una API compatible con OpenAI para prototipos de aplicaciones de texto, aprovechando el formato EXL3 para reducir VRAM frente a la precisión completa.
- Evaluación comparativa de cuantizaciones: usar esta versión junto al checkpoint original para medir la degradación de calidad introducida por EXL3 en tareas concretas del dominio de interés.
- Experimentación con modelos de 31B en una sola GPU: el formato EXL3 está pensado para ajustar modelos grandes en GPUs de consumo de gama alta o profesionales, lo que permite probar el modelo sin infraestructura multi-GPU.
- Backend de chatbots de texto para uso interno: servir el modelo a través de TabbyAPI y conectarlo a una interfaz de chat, siempre que se valide previamente la calidad y los sesgos del modelo base.
- Generación de texto por lotes: procesar corpus de documentos para tareas de resumen, reescritura o extracción, beneficiándose de los kernels de ExLlamaV3 para throughput en GPU única.
- Base para fine-tuning o investigaciones posteriores: partir de este artefacto para estudiar el comportamiento del modelo base en dominios específicos, teniendo en cuenta que la cuantización puede limitar la fidelidad de los resultados frente a pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de 31B en formato EXL3, se requiere habitualmente una GPU con 24 GB o más, dependiendo del nivel de bits efectivo de la cuantización, que no se especifica en la model card.
- GPU recomendadas: no disponibles en la documentación. Por el tamaño del modelo, encajan GPUs profesionales como A100 o H100 y, en el extremo de consumo, tarjetas de 24 GB como la RTX 4090, siempre que el nivel de cuantización lo permita.
- ¿Cabe en GPU de consumo? No confirmado; depende del nivel EXL3 aplicado, que no se detalla.
- Opciones de despliegue: ExLlamaV3 y TabbyAPI son los entornos previstos según las etiquetas del repositorio. Otros motores como vLLM, llama.cpp u Ollama no son compatibles con el formato EXL3 salvo conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReadyArt__Wicked-Tutu-31B-Final-EXL3 | 31B | no disponible | EXL3 | Apache 2.0 | Hugging Face (0 descargas) |
| ReadyArt/Wicked-Tutu-31B-Final | 31B | no disponible | no disponible | no disponible en esta ficha | Hugging Face (modelo base) |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | 31B | no disponible | GGUF / AWQ / GPTQ | según autor | no disponible en la información proporcionada |

No se dispone de datos de rendimiento ni de modelos comparables de otros autores en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La model card del repositorio incluye un aviso que exige ser mayor de edad y aceptar la responsabilidad total sobre el uso y las salidas del modelo; conviene revisarlo antes de cualquier despliegue.
- No hay información sobre sesgos, alucinación o calidad del modelo base en esta ficha; estos riesgos deben evaluarse sobre ReadyArt/Wicked-Tutu-31B-Final.
- La cuantización EXL3 puede introducir degradación de calidad respecto a los pesos originales; no se documenta el nivel de bits ni evaluaciones comparativas.
- El formato EXL3 limita la portabilidad: no funciona directamente en llama.cpp, Ollama o vLLM sin conversión.
- No se especifican idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado en castellano.
- La licencia Apache 2.0 se declara en los metadatos, pero debe verificarse en el modelo base, ya que las condiciones del fine-tune original podrían imponer restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad; trátese como un artefacto no auditado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yabaimimi/ReadyArt__Wicked-Tutu-31B-Final-EXL3
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Tutu-31B-Final
- ExLlamaV3 (motor de inferencia): no disponible en la información proporcionada
- TabbyAPI (servidor compatible): no disponible en la información proporcionada
