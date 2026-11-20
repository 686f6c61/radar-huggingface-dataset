# SZLHOLDINGS/salad-ring-ouro-l47

## Resumen

`salad-ring-ouro-l47` es un modelo publicado por SZLHOLDINGS dentro de lo que el propio autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad declarada hacia repositorios de código y con resultados auditables mediante ficheros de "receipts". El repositorio de Hugging Face no incluye información sobre arquitectura, tamaño, datos de entrenamiento ni proceso de alineamiento; la model card se limita a describir la identidad del artefacto y a remitir a la organización de GitHub como fuente canónica.

La relevancia del modelo, a fecha de esta ficha, es prácticamente nula para evaluación técnica: no hay pipeline declarado, no hay licencia, no hay idiomas listados, no hay benchmarks publicados y el contador de descargas y likes es cero. La model card indica explícitamente que cualquier afirmación de entrenamiento o evaluación debe vivir en los ficheros de receipt del "estate mesh", y que lo no registrado allí se etiqueta como UNKNOWN.

En consecuencia, esta ficha documenta lo que el autor declara (identidad, gobernanza, política de honestidad de datos) y marca como "no disponible" todo lo que no está en la información proporcionada. No debe interpretarse como una evaluación funcional del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM o híbrida), el número de parámetros, la longitud de contexto nativa ni el esquema de atención. La model card no incluye detalles de tokenizador, vocabulario ni configuración de generación.

Respecto al entrenamiento, el autor no declara número de tokens, composición del dataset, uso de RLHF/DPO ni ninguna innovación técnica (decodificación especulativa, atención lineal, etc.). La card afirma que las alegaciones de entrenamiento y evaluación "viven en sus ficheros de receipt" dentro del "estate mesh", y que cualquier dato no registrado allí se considera UNKNOWN. En la información disponible no se incluye el contenido de esos receipts.

## Capacidades

- No se declara ninguna capacidad funcional concreta (generación de texto, razonamiento, código, matemáticas, visión) en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Gobernanza declarada: el autor indica que el modelo forma parte de un "governed-AI estate" con resultados "receipted" y verificables en la fuente canónica (organización `szl-holdings` en GitHub).

## Casos de uso

- Auditoría de gobernanza de artefactos: el modelo puede emplearse como caso de estudio para evaluar el esquema de "receipts" y trazabilidad que propone SZLHOLDINGS, comparando la card pública con los ficheros de auditoría del repositorio de GitHub.
- Verificación de reproducibilidad: dado que la card etiqueta los datos como MEASURED/REPORTED/UNKNOWN con marca temporal (2026-11-20T05:04:40Z UTC), sirve para probar flujos de verificación de procedencia en pipelines internos de MLOps.
- Catalogación de modelos en registros internos: útil como ejemplo de artefacto con metadatos mínimos para diseñar validadores que rechacen modelos sin licencia, idiomas o benchmarks declarados.
- Pruebas de integración de Hugging Face Hub: al tener un ID y una card generada automáticamente (`szl:showcase-card v1`), puede usarse para testear descarga, parseo de README y extracción de badges sin riesgo de consumo de recursos.
- Formación sobre documentación de modelos: la card es un ejemplo de política de "no inventar números" (UNKNOWN explícito) que puede usarse en materiales docentes sobre buenas prácticas de model cards.
- No se recomienda su uso en producción para generación de texto, código, atención al cliente ni ninguna tarea de inferencia, al no existir especificaciones verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que "no benchmark number is asserted on this card beyond what a dated audit measured" y que los datos no medidos se etiquetan como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara formato de pesos compatible con estos motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre parámetros, contexto, licencia ni rendimiento del modelo, por lo que no es posible establecer una comparación técnicamente fundamentada con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de especificaciones: sin arquitectura, tamaño, contexto ni tokenizador declarados, no es posible evaluar su idoneidad para ninguna tarea.
- Licencia no declarada: no se puede determinar si el uso comercial está permitido; en la práctica, esto bloquea su adopción en producción.
- Idiomas no declarados: se desconoce si soporta castellano u otros idiomas.
- Sin benchmarks ni evaluaciones publicadas: cualquier afirmación de calidad sería especulativa.
- Riesgo de alucinación y sesgos: no evaluables al no existir información sobre datos de entrenamiento ni alineamiento.
- Dependencia de fuentes externas: la card remite a los "receipts" del estate mesh en GitHub; sin acceso verificado a esos ficheros, las afirmaciones del autor no son comprobables desde Hugging Face.
- Señales de madurez: cero descargas y cero likes en el momento de la consulta; repositorio creado y actualizado en noviembre de 2026 según los metadatos.
- La card está generada automáticamente por una herramienta interna (`estate-cards weaver v0.1.0`), lo que sugiere que el contenido descriptivo puede ser mínimo por diseño.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l47
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización canónica en GitHub (referenciada en la card): https://github.com/szl-holdings
- Herramienta de generación de cards (referenciada en la card): https://github.com/szl-holdings/estate-cards
