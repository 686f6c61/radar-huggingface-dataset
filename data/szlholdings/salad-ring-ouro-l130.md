# SZLHOLDINGS/salad-ring-ouro-l130

## Resumen

`salad-ring-ouro-l130` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el autor denomina "governed-AI estate": una colección de modelos, datasets y Spaces con trazabilidad declarada hacia repositorios fuente y resultados auditables. El repositorio de Hugging Face existe y es accesible, pero la model card no documenta la arquitectura, el tamaño real de parámetros, el contexto, los datos de entrenamiento ni los idiomas soportados.

La información disponible se limita a metadatos de publicación (creado el 19 de noviembre de 2026, actualizado el 20 de noviembre de 2026), al identificador del repositorio y a referencias genéricas a un sistema de "receipts" o recibos de auditoría alojados fuera de la model card. El autor indica explícitamente que cualquier afirmación de entrenamiento o evaluación que no esté respaldada por un recibo medido se marca como UNKNOWN, y no se afirma ningún número de benchmark en la propia tarjeta.

Por tanto, esta ficha se redacta con la información estrictamente disponible y marca como "no disponible" todos los parámetros técnicos que el autor no ha publicado. El nombre del repositorio sugiere una variante de la familia "ouro" con un sufijo "l130", pero no hay documentación que confirme qué significa ese sufijo ni que relacione el modelo con una arquitectura concreta. Cualquier evaluación de idoneidad para producción requeriría consultar los recibos de auditoría citados y verificar los pesos antes de su uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio. No consta si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida con capas de estado o cualquier otra variante. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de ajuste supervisado, RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal.

La model card remite a "receipt files" y a un "estate mesh" para cualquier afirmación de entrenamiento o evaluación, y declara explícitamente que lo que no está respaldado por un recibo medido se considera UNKNOWN. No se incluye en la información proporcionada ningún enlace directo a esos recibos ni a un paper técnico, por lo que no es posible verificar detalles de arquitectura o entrenamiento.

## Capacidades

- No se documentan capacidades específicas en la model card.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni de razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas cubiertos.
- No se declaran capacidades de visión, audio, modo "thinking" ni otras modalidades.
- No se ha publicado ninguna demostración, Space asociado ni ejemplo de uso en la información disponible.

## Casos de uso

No es posible enumerar casos de uso concretos y realistas sin conocer la arquitectura, el tamaño, el contexto, los idiomas y la licencia del modelo. La model card no proporciona ejemplos de aplicación ni documentación funcional. Cualquier caso de uso que se propusiera sería especulativo y contravendría la regla de no inventar datos.

Para evaluar su idoneidad en escenarios como atención al cliente, generación de código, análisis documental o despliegue en pipelines, sería necesario consultar los recibos de auditoría citados por el autor, verificar los pesos publicados y comprobar la licencia aplicable. Nada de esto está disponible en la información proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y no incluye dichos resultados en la tarjeta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el número de parámetros y el formato de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se confirma que los pesos estén en un formato compatible con estos motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la categoría, el tamaño y la tarea del modelo. La información proporcionada no permite establecer una comparación fundamentada con alternativas de la misma familia o del mismo rango de parámetros.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de seguridad o alineación.
- No hay información sobre tasas de alucinación ni sobre evaluación de fidelidad factual.
- Se desconoce la longitud de contexto y los idiomas soportados, lo que impide valorar limitaciones lingüísticas.
- La licencia no está disponible, por lo que no puede confirmarse si se permite uso comercial, modificación o redistribución.
- No se confirma el formato de los pesos ni su integridad; el repositorio no registra descargas ni "likes" en el momento de la consulta.
- El autor declara que las afirmaciones no respaldadas por recibos de auditoría son UNKNOWN, lo que traslada la carga de verificación al usuario.
- No se ha publicado pipeline, demo ni documentación de uso, lo que dificulta la reproducibilidad.
- Uso en producción no recomendable sin verificación previa de pesos, licencia y recibos de auditoría.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l130
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la model card, URL incompleta en el original): https://github.com/szl-holdings
- Repositorio de la herramienta de generación de tarjetas: https://github.com/szl-holdings/estate-cards
