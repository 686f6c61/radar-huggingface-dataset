# syed7741/aegis-bilingual-industrial-action-classifier

## Resumen

El modelo AEGIS Bilingual Industrial Action Classifier es un clasificador bilingüe (inglés y árabe) de acciones industriales, desarrollado por syed7741 como parte de la plataforma AEGIS AI para entornos de fabricación, robótica, logística y almacenes. A diferencia de un chatbot generativo, este modelo selecciona una de ocho clases de acción predefinidas a partir de evidencia operativa y una pregunta, y luego mapea esa clase de forma determinista a una respuesta aprobada en inglés o árabe. Está basado en el modelo bigscience/mt0-small con un adaptador LoRA entrenado mediante PEFT, lo que lo convierte en un prototipo ligero y controlado.

Su relevancia reside en el enfoque de seguridad: al limitar la salida a clases de acción aprobadas, se evita la generación de instrucciones no deseadas en entornos industriales críticos. El modelo se ha entrenado con un dataset sintético de 64 registros, lo que indica que es un experimento de investigación, no un sistema listo para producción. A pesar de su tamaño reducido, demuestra un patrón de diseño interesante para aplicaciones de clasificación controlada en sectores industriales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MT0 + LoRA (PEFT) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, árabe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura `bigscience/mt0-small` (una variante de mT5) como base y añade un adaptador LoRA mediante la librería PEFT. El entrenamiento se realizó sobre un dataset bilingüe sintético de 64 registros únicos, con una expansión de prompts que generó 192 ejemplos de entrenamiento. El conjunto se dividió en 48 registros de entrenamiento y 16 de validación (held-out), con una distribución equilibrada de 6 registros por módulo para entrenamiento y 2 para validación. El entrenamiento se ejecutó durante 10 épocas en CPU. El modelo no emplea técnicas como RLHF o DPO; su objetivo es clasificar una entrada en una de ocho clases de acción, representadas como códigos numéricos de un solo token, y luego mapear esa clase a una respuesta aprobada en inglés o árabe mediante un proceso determinista.

## Capacidades

- Clasificación bilingüe de acciones industriales en inglés y árabe.
- Selección entre ocho clases de acción controladas: `ALERT_ESCALATION`, `DOCUMENT_GROUNDED_ANSWER`, `FACTORY_DEGRADED_REVIEW`, `PREDICTIVE_MAINTENANCE`, `ROBOT_SAFE_RESTART`, `VISION_QUARANTINE`, `WORKER_SAFETY_STOP` y `WORK_ORDER_CREATE`.
- No es un modelo generativo: la salida es una clase y una respuesta fija, no texto libre.
- No soporta tool calling, agentes ni razonamiento de múltiples pasos más allá de la clasificación.
- Capacidad multilingüe limitada a inglés y árabe.

## Casos de uso

- **Automatización de alertas industriales**: el modelo puede clasificar una evidencia de evento (p. ej., una lectura anómala) y una pregunta relacionada, y seleccionar la clase `ALERT_ESCALATION`, lo que activa un protocolo de escalado según el playbook de alertas.
- **Mantenimiento predictivo**: a partir de datos de tendencia de un activo, el modelo puede elegir la clase `PREDICTIVE_MAINTENANCE`, iniciando un proceso de inspección y programación de mantenimiento antes de una falla.
- **Seguridad del trabajador**: si se detecta una condición insegura, el modelo puede clasificar la situación como `WORKER_SAFETY_STOP`, generando la respuesta aprobada para detener el trabajo y asegurar el área.
- **Inspección de visión por computadora**: en una línea de producción, el modelo puede clasificar un defecto sospechoso como `VISION_QUARANTINE`, lo que permite aislar el producto para una inspección secundaria.
- **Reinicio seguro de robots**: ante un paro de seguridad de un robot, el modelo puede seleccionar `ROBOT_SAFE_RESTART`, guiando el diagnóstico y la verificación de condiciones seguras antes de reanudar.
- **Creación de órdenes de trabajo**: a partir de evidencia de fallo o necesidad de mantenimiento, el modelo puede clasificar la situación como `WORK_ORDER_CREATE`, facilitando la asignación de propietario, prioridad y seguimiento.
- **Revisión de estado de fábrica**: el modelo puede identificar una situación de rendimiento degradado y elegir `FACTORY_DEGRADED_REVIEW`, lo que dispara un análisis de KPIs y activos implicados.
- **Asistencia documental**: si la consulta requiere una respuesta basada en documentos aprobados, el modelo selecciona `DOCUMENT_GROUNDED_ANSWER`, asegurando que la respuesta se base en evidencia citada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del modelo.
- Dado que el modelo base es `bigscience/mt0-small`, un modelo pequeño (aproximadamente 300 millones de parámetros), el adaptador LoRA es ligero, por lo que puede ejecutarse en CPU y en GPUs de consumo, aunque no se proporcionan cifras de VRAM o latencia.
- La documentación menciona integración con FastAPI (backend) y React (frontend), lo que sugiere un despliegue en servidores con recursos moderados.
- No se mencionan herramientas de despliegue específicas como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- **Dataset muy pequeño**: entrenado con 64 registros sintéticos, lo que limita su generalización y puede provocar sobreajuste.
- **Alcance restringido**: solo cubre ocho clases de acción, por lo que no es aplicable a otros tipos de decisiones industriales.
- **Idiomas limitados**: solo inglés y árabe; no soporta otros idiomas.
- **Salida controlada**: al ser un clasificador, no genera respuestas detalladas ni explicaciones, solo respuestas fijas aprobadas.
- **Riesgo de sesgo**: no se ha evaluado el sesgo en los datos sintéticos, aunque al ser un clasificador controlado el riesgo de alucinación es bajo.
- **Prototipo de investigación**: no está validado para uso en producción; la licencia Apache 2.0 permite uso comercial, pero requiere evaluación adicional y pruebas de seguridad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/syed7741/aegis-bilingual-industrial-action-classifier)
- [Dataset de entrenamiento](https://huggingface.co/datasets/syed7741/aegis-bilingual-industrial-ai-dataset)

Verificar que todas las secciones estén presentes y no haya errores ortográficos. La sección de comparativa está vacía, pero es correcto indicar "no disponible". También en la sección de arquitectura y entrenamiento mencioné "10 épocas" según la tabla. En el resumen dije "64 registros", correcto. En la sección de arquitectura dije "64 registros únicos" y luego "48 entrenamiento", eso es correcto según la tabla.

Revisar que no haya inventos: el número de parámetros del modelo base no lo he puesto, solo "no disponible". La longitud de contexto no está. La cuantización no está. Bien.

En la sección de casos de uso, di 8 casos, cumplo con mínimo 6. Bien.

En la sección de requisitos de hardware, hago una inferencia razonable sobre el tamaño del modelo base (300M) pero eso es conocimiento público. La instrucción dice no inventar datos, pero esa información es comúnmente conocida y no está en la información proporcionada. Puedo omitir el número de parámetros y decir simplemente que es un modelo pequeño. Para ser más estricto, puedo decir "no se especifican requisitos" y luego "dado que el modelo base es un modelo pequeño, se puede ejecutar en CPU" sin dar el número exacto. Mejor evitar el número para no arriesgarme. Así que quitaré "aproximadamente 300 millones de parámetros" y diré "un modelo pequeño". Lo cambiaré.

También en la sección de arquitectura y entrenamiento, mencioné "10 épocas" que está en la tabla. Bien.

En la sección de comparativa, pongo "no disponible". Correcto.

Todo en castellano de España, sin emojis.

Ahora escribo la respuesta final.</think>## Resumen

El modelo AEGIS Bilingual Industrial Action Classifier es un clasificador bilingüe (inglés y árabe) de acciones industriales, desarrollado por syed7741 como parte de la plataforma AEGIS AI para entornos de fabricación, robótica, almacenes y logística. A diferencia de un modelo generativo, este sistema selecciona una de ocho clases de acción predefinidas a partir de evidencia operativa y una pregunta, y luego asigna de forma determinista una respuesta aprobada en inglés o árabe. Está construido sobre el modelo `bigscience/mt0-small` con un adaptador LoRA entrenado mediante PEFT, lo que lo convierte en un prototipo ligero y orientado a la clasificación controlada.

La relevancia del modelo radica en su enfoque de seguridad: al limitar la salida a clases de acción válidas, se evita la generación de instrucciones no deseadas en entornos industriales críticos. Se ha entrenado con un dataset sintético de 64 registros, lo que indica que es un experimento de investigación, no un sistema listo para producción. No obstante, demuestra un patrón de diseño interesante para aplicaciones de control de acciones en el sector industrial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MT0 + LoRA (PEFT) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, árabe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura `bigscience/mt0-small` (una variante de mT5) como base y añade un adaptador LoRA mediante la librería PEFT. El entrenamiento se realizó sobre un dataset bilingüe de 64 registros únicos, con una expansión de prompts que generó 192 ejemplos de entrenamiento. El conjunto se dividió en 48 registros de entrenamiento y 16 de validación (held-out), con una representación equilibrada de los ocho módulos industriales (6 registros por módulo para entrenamiento y 2 para validación). El entrenamiento se ejecutó en 10 épocas en CPU. No se emplearon técnicas como RLHF o DPO; el modelo se entrena para clasificar una entrada en una de ocho clases de acción, representadas como códigos numéricos de un solo token, y posteriormente mapea esa clase a una respuesta aprobada en inglés o árabe mediante un proceso determinista.

## Capacidades

- Clasificación bilingüe de acciones industriales en inglés y árabe.
- Selección entre ocho clases de acción controladas: `ALERT_ESCALATION`, `DOCUMENT_GROUNDED_ANSWER`, `FACTORY_DEGRADED_REVIEW`, `PREDICTIVE_MAINTENANCE`, `ROBOT_SAFE_RESTART`, `VISION_QUARANTINE`, `WORKER_SAFETY_STOP` y `WORK_ORDER_CREATE`.
- No es un modelo generativo: la salida es una clase y una respuesta fija, no texto libre.
- No soporta tool calling, agentes ni razonamiento de múltiples pasos más allá de la clasificación.
- Capacidad multilingüe limitada a inglés y árabe.

## Casos de uso

- **Automatización de alertas industriales**: el modelo puede clasificar una evidencia de evento (p. ej., una lectura anómala) y una pregunta relacionada, y seleccionar la clase `ALERT_ESCALATION`, lo que activa un protocolo de escalado según el playbook de alertas.
- **Mantenimiento predictivo**: a partir de datos de tendencia de un activo, el modelo puede elegir la clase `PREDICTIVE_MAINTENANCE`, iniciando un flujo de inspección y programación de mantenimiento antes de una falla.
- **Seguridad del trabajador**: si se detecta una condición insegura, el modelo puede clasificar la situación como `WORKER_SAFETY_STOP`, generando la respuesta aprobada para detener el trabajo y asegurar el área.
- **Inspección de visión por computadora**: en una línea de producción, el modelo puede clasificar un defecto sospechoso como `VISION_QUARANTINE`, lo que permite aislar el producto para una inspección secundaria.
- **Reinicio seguro de robots**: ante un paro de seguridad de un robot, el modelo puede seleccionar `ROBOT_SAFE_RESTART`, guiando el diagnóstico y la verificación de condiciones seguras antes de reanudar.
- **Creación de órdenes de trabajo**: a partir de evidencia de fallo o necesidad de mantenimiento, el modelo puede clasificar la situación como `WORK_ORDER_CREATE`, facilitando la asignación de propietario, prioridad y seguimiento.
- **Revisión de estado de fábrica**: el modelo puede identificar un rendimiento degradado y elegir `FACTORY_DEGRADED_REVIEW`, lo que dispara un análisis de KPIs y activos implicados.
- **Asistencia documental**: si la consulta requiere una respuesta basada en documentos aprobados, el modelo selecciona `DOCUMENT_GROUNDED_ANSWER`, asegurando que la respuesta se cite con evidencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del modelo.
- Dado que el modelo base es un modelo pequeño (`bigscience/mt0-small`), el adaptador LoRA es ligero, por lo que puede ejecutarse en CPU y en GPUs de consumo moderado, aunque no se proporcionan cifras de VRAM o latencia.
- La documentación menciona integración con FastAPI (backend) y React (frontend), lo que sugiere un despliegue en servidores con librerías estándar de transformers.
- No se mencionan herramientas de despliegue específicas como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- **Entrenamiento con dataset muy pequeño**: solo 64 registros sintéticos, lo que limita la generalización y puede provocar sobreajuste.
- **Alcance restringido**: solo cubre ocho clases de acción, por lo que no es aplicable a otros tipos de decisiones industriales.
- **Idiomas limitados**: solo inglés y árabe; no soporta otros idiomas.
- **Salida controlada**: al ser un clasificador, no genera respuestas elaboradas ni razonamiento, sino respuestas fijas aprobadas.
- **Riesgo de sesgo**: no se ha evaluado el riesgo de sesgo en los datos sintéticos, aunque al ser un clasificador controlado el riesgo de alucinación es menor.
- **Prototipo de investigación**: no está listo para producción; la licencia Apache 2.0 permite uso comercial, pero se requieren pruebas adicionales de seguridad y robustez.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sy7741/aegis-bilingual-industrial-action-classifier)
- [Dataset de entrenamiento](https://huggingface.co/datasets/sy7741/aegis-bilingual-industrial-ai-dataset)
