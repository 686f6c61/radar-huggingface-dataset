# vyogo-tech/vyogo-frappe-coder-15B

## Resumen

vyogo-frappe-coder-15B es un modelo de lenguaje publicado por vyogo-tech en Hugging Face bajo licencia Apache 2.0. Por el nombre se deduce que está orientado a la generación de código para el framework Frappe, el stack de desarrollo web en Python sobre el que se construye ERPNext, aunque la model card publicada no incluye ninguna descripción funcional, arquitectónica ni de entrenamiento que lo confirme.

La información disponible en el momento de redactar esta ficha se limita a los metadatos del repositorio: identificador, autor, licencia, fecha de creación y la etiqueta de región. No se han publicado detalles sobre arquitectura, número de parámetros reales, longitud de contexto, datos de entrenamiento, idiomas soportados ni resultados de evaluación. El sufijo "15B" del nombre sugiere un tamaño de aproximadamente 15.000 millones de parámetros, pero este dato no está verificado en la documentación oficial.

El modelo es relevante únicamente como referencia de un posible ajuste fino especializado en el ecosistema Frappe/ERPNext, un nicho con poca cobertura en modelos abiertos. Sin embargo, la ausencia total de documentación, la inexistencia de descargas y de interacciones en el repositorio, y la falta de benchmarks hacen que no sea recomendable para uso en producción sin una evaluación previa por parte del equipo que lo vaya a adoptar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre sugiere ~15B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio. Se desconoce si se trata de un transformer denso, un modelo de mezcla de expertos o una arquitectura híbrida, así como el número exacto de capas, dimensiones ocultas o mecanismos de atención empleados.

Tampoco hay datos sobre el proceso de entrenamiento: número de tokens, composición del corpus, uso de ajuste supervisado, RLHF o DPO, ni sobre posibles innovaciones técnicas como decodificación especulativa o atención lineal. El nombre del modelo apunta a un ajuste fino sobre una base de ~15B parámetros orientado a código Frappe, pero esta hipótesis no está respaldada por documentación alguna.

## Capacidades

- Generación de texto y código: capacidad esperable en un modelo de la familia "coder", aunque no verificada en la documentación.
- Especialización probable en el framework Frappe y, por extensión, en ERPNext, deducida únicamente del nombre del modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Asistencia a desarrolladores de Frappe/ERPNext: si el ajuste fino es real, el modelo podría emplearse para autocompletar controladores Python, hooks y definiciones de DocType dentro de un IDE, siempre tras validar su calidad con un conjunto de pruebas propio.
- Generación de scripts de personalización: uso potencial en la creación de scripts de cliente, parches y migraciones para instancias ERPNext, con revisión humana obligatoria.
- Documentación técnica interna: generación de borradores de documentación sobre APIs de Frappe, condicionada a una evaluación previa de fidelidad.
- Soporte a la migración de versiones: ayuda a redactar parches de compatibilidad entre versiones de Frappe, como tarea de productividad para equipos internos.
- Formación y prototipado: experimentación en entornos de desarrollo para comparar con modelos generalistas en tareas específicas del dominio.
- Evaluación comparativa interna: servir como referencia en pruebas A/B frente a modelos generalistas para medir el valor real de un ajuste fino de nicho.

En todos los casos, la ausencia de benchmarks y de documentación obliga a realizar una validación propia antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con exactitud; para un modelo denso de ~15B parámetros, las estimaciones habituales serían de aproximadamente 30 GB en FP16, 15-16 GB en cuantización de 8 bits y 9-10 GB en 4 bits, pero estos valores son orientativos y no están confirmados por el autor.
- GPU recomendadas: no disponible según el autor; por tamaño, un modelo de ~15B requeriría al menos una GPU con 24 GB (RTX 3090/4090) en cuantización de 4-8 bits, o A100/H100 para FP16.
- Compatibilidad con GPU de consumo: probable en cuantización de 4 bits en GPUs de 12-16 GB, sin confirmar.
- Opciones de despliegue: no disponible; al no publicarse el formato de pesos, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Documentación | Disponibilidad |
|---|---|---|---|---|---|
| vyogo-frappe-coder-15B | no disponible (~15B por el nombre) | no disponible | Apache 2.0 | Prácticamente inexistente | Repositorio sin descargas |
| Qwen2.5-Coder-14B | 14B | 128K (versión base) | Apache 2.0 | Completa, con benchmarks | Amplia adopción |
| DeepSeek-Coder-V2-Lite | 16B (MoE, 2.4B activos) | 128K | Licencia propia permisiva | Completa, con benchmarks | Amplia adopción |
| CodeLlama-13B | 13B | 16K | Licencia Llama | Completa, con benchmarks | Amplia adopción |

La comparación se ofrece solo como referencia de categoría; no existen datos públicos que permitan comparar el rendimiento real de vyogo-frappe-coder-15B con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card descriptiva, ficha técnica ni guía de uso.
- Sin benchmarks ni evaluaciones publicadas: imposible estimar su calidad frente a alternativas.
- Sin descargas ni interacciones en el repositorio: no hay evidencia de uso comunitario ni de validación externa.
- Idiomas y contexto desconocidos: no se puede garantizar soporte del castellano ni de conversaciones de contexto largo.
- Riesgo elevado de alucinación en APIs de Frappe: sin evaluación, el modelo podría generar código con métodos o firmas inexistentes.
- Formato de pesos no publicado: dificulta la integración en pipelines de despliegue estándar.
- Licencia Apache 2.0: permite uso comercial, pero la falta de documentación traslada todo el riesgo de validación al adoptante.
- Fecha de creación futura en los metadatos (2026-11-12): conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/vyogo-tech/vyogo-frappe-coder-15B
- Repositorio de Frappe: no disponible en la información proporcionada
- Paper o blog del autor: no disponible
- Demos: no disponible
