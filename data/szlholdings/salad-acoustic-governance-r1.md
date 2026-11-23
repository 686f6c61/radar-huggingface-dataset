# SZLHOLDINGS/salad-acoustic-governance-r1

## Resumen

`salad-acoustic-governance-r1` es un artefacto de modelo publicado por la organización SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibos (*receipts*). El repositorio ocupa 0,7 GB y contiene pesos en formato safetensors, aunque la model card no especifica arquitectura, número de parámetros, longitud de contexto ni idiomas soportados.

La información disponible es deliberadamente escasa: la propia model card declara que cualquier afirmación sobre entrenamiento o evaluación que no esté respaldada por un recibo medido se etiqueta como UNKNOWN. De hecho, el escaneo de recibos citado en la tarjeta clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, es decir, hay ficheros con nombre de recibo pero no existe un `DONE.json` estricto con estado MEASURED, código de salida de evaluación 0 y marca temporal.

Por tanto, esta ficha describe un artefacto sin documentación técnica verificable. Su relevancia actual es limitada para producción: no hay benchmarks, no hay especificación de arquitectura y no se declara licencia. Se documenta aquí por completitud del catálogo, indicando explícitamente cada dato no disponible en lugar de inferirlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (tamaño del repo: 0,7 GB) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura híbrida o cualquier otra variante. Tampoco se indica el número de parámetros, la composición del dataset de entrenamiento, el volumen de tokens procesados ni si se aplicaron técnicas de alineación como RLHF, DPO o ajuste supervisado.

El autor declara un principio de honestidad explícito: las afirmaciones de entrenamiento y evaluación residen en ficheros de recibos del "estate mesh", y todo lo que no esté respaldado por un recibo medido se marca como UNKNOWN. El escaneo de recibos del 22 de noviembre de 2026 clasifica este repositorio como `RECEIPT_FILES_NO_DONE`, con evidencia de evaluación UNKNOWN. El único fichero con nombre de recibo encontrado es `assets/szl-card/mesh-receipts.svg`, que es una imagen SVG generada de forma determinista y no un recibo de evaluación validado. No hay, por tanto, evidencia técnica verificable sobre el proceso de entrenamiento.

## Capacidades

- No se declara ninguna capacidad concreta en la información disponible.
- No hay mención a generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas.
- No se menciona ningún modo especial (thinking mode, visión, audio). El nombre del repositorio incluye el término "acoustic", pero la model card no describe ninguna capacidad de audio.

## Casos de uso

No es posible recomendar casos de uso concretos sin especificación de arquitectura, capacidades ni evaluación. Los siguientes escenarios son genéricos y quedan condicionados a que el artefacto se documente adecuadamente:

- Auditoría de gobernanza de modelos: el repositorio puede inspeccionarse como ejemplo del patrón de "recibos" propuesto por SZLHOLDINGS, útil para equipos que diseñan pipelines de trazabilidad de artefactos.
- Verificación de integridad de pesos: al estar en safetensors, un equipo puede cargar los tensores y comprobar formas y tipos para inferir la arquitectura, aunque esto requeriría trabajo manual no documentado.
- Estudio de formatos de model card: la tarjeta sirve como caso de estudio de documentación declarativa con etiquetas MEASURED/REPORTED/UNKNOWN.
- Evaluación interna previa a adopción: cualquier uso en producción exigiría primero ejecutar una batería propia de evaluaciones, dado que no hay benchmarks publicados.
- Integración en catálogos de modelos: útil para plataformas que indexan repositorios de Hugging Face y necesitan clasificar artefactos con metadatos incompletos.
- Reproducción del pipeline de generación de tarjetas: el repositorio `estate-cards` citado en la model card podría reutilizarse para generar documentación determinista de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de recibos indica evidencia de evaluación UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el número de parámetros. El tamaño del repositorio (0,7 GB) sugiere pesos de pequeño tamaño, pero no permite derivar una cifra fiable de VRAM sin conocer la arquitectura y la precisión de los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no verificable sin especificaciones.
- Opciones de despliegue: al estar en safetensors, sería compatible con frameworks que cargan este formato (Transformers, vLLM, TGI) siempre que exista una configuración de modelo válida en el repositorio, lo cual no se confirma.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no permite identificar la categoría del modelo (texto, audio, multimodal u otra), por lo que no es posible seleccionar alternativas comparables con rigor.

| Modelo | Parametros | Contexto | Licencia | Benchmark | Disponibilidad |
|---|---|---|---|---|---|
| salad-acoustic-governance-r1 | no disponible | no disponible | no disponible | no disponible | safetensors en HF |
| Alternativa comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se declara arquitectura, parámetros, contexto ni datos de entrenamiento.
- Sin evidencia de evaluación: el escaneo de recibos clasifica el repositorio como `RECEIPT_FILES_NO_DONE` y la evidencia de evaluación como UNKNOWN.
- Licencia no declarada: no puede asumirse ningún permiso de uso comercial, modificación o redistribución. Cualquier uso en producción requiere contactar con el autor.
- Riesgo elevado de comportamiento impredecible: sin benchmarks ni especificaciones, no es posible estimar sesgos, tasa de alucinación ni calidad en tareas concretas.
- Idiomas no declarados: no puede garantizarse soporte de castellano ni de ningún otro idioma.
- Naturaleza del repositorio: la model card está generada automáticamente por una herramienta interna (`estate-cards weaver v0.1.0`) y contiene principalmente elementos de presentación (insignias, SVG) más que información sustantiva del modelo.
- Fecha de creación futura respecto a la fecha habitual de consulta (2026-11-18): conviene verificar la autenticidad y vigencia del artefacto antes de cualquier adopción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-acoustic-governance-r1
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (según la model card): https://github.com/szl-holdings
- Herramienta de generación de tarjetas (según la model card): https://github.com/szl-holdings/estate-cards
