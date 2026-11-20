# SZLHOLDINGS/salad-ring-ouro-l127

## Resumen

`salad-ring-ouro-l127` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organización denomina su "estate" de IA gobernada: un catálogo de modelos, datasets y Spaces con resultados "receipted" (con recibos de auditoría) y verificables. El repositorio de Hugging Face no incluye model card técnica en el sentido habitual: la página está generada de forma automática por una herramienta propia (`estate-cards weaver`) y se limita a identificar el artefacto, enlazar su fuente canónica en la organización de GitHub y mostrar gráficos SVG deterministas generados a partir de una instantánea de auditoría.

No se dispone de información pública sobre arquitectura, número de parámetros, longitud de contexto, datos de entrenamiento, tokenizador, idiomas o licencia. La propia model card declara explícitamente que cualquier afirmación de entrenamiento o evaluación que no esté en los ficheros de recibo del "estate" debe considerarse UNKNOWN (desconocida). El sufijo `l127` del nombre podría sugerir una variante o iteración interna, pero no hay documentación que lo confirme, por lo que no debe interpretarse como un dato técnico.

Por tanto, esta ficha documenta lo que el autor declara y marca como no disponible todo lo demás. Es relevante ahora únicamente como ejemplo de patrón de publicación "governed-AI" (card generada, trazabilidad por recibos, ausencia deliberada de cifras no medidas), no como un modelo evaluable para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM o híbrida), el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card indica que las afirmaciones de entrenamiento y evaluación "viven en sus ficheros de recibo" dentro de la malla del estate, pero no enlaza ni reproduce ninguno de esos recibos en el repositorio.

El único elemento técnico verificable es el proceso de generación de la propia card: SVG determinista generado con la librería estándar de Python a partir de una instantánea de auditoría fechada el 2026-11-20T03:48:04Z, con etiquetas MEASURED/REPORTED/UNKNOWN y un identificador de card (`525cb5b05294e523`). No hay información sobre innovaciones de arquitectura, decodificación especulativa, atención lineal ni estrategias de entrenamiento.

## Capacidades

- No se documenta ninguna capacidad funcional concreta (generación de texto, razonamiento, código, matemáticas, visión o audio).
- No se indica soporte de tool calling ni function calling.
- No se indica soporte para agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües ni idiomas cubiertos.
- No se menciona ningún modo especial (thinking mode, visión, audio).
- La única capacidad implícita es la de servir como artefacto trazable dentro del pipeline de publicación del estate de SZLHOLDINGS.

## Casos de uso

- Auditoría de linaje de artefactos: usar el repositorio como ejemplo de publicación con instantánea de auditoría fechada y etiquetado MEASURED/REPORTED/UNKNOWN, replicable en pipelines internos de gobernanza de modelos.
- Verificación de procedencia: comprobar la correspondencia entre el repositorio de Hugging Face y la fuente canónica declarada en la organización de GitHub de SZL Holdings antes de cualquier uso.
- Integración en catálogos internos de modelos: indexar el artefacto junto con su `card id` (`525cb5b05294e523`) y la marca temporal de captura para trazabilidad.
- Evaluación de plantillas de model card generadas: estudiar el formato `szl:showcase-card v1` como plantilla para cards automáticas en proyectos propios.
- Docencia sobre documentación de modelos: utilizar el caso como ejemplo de card que declara explícitamente lo desconocido en lugar de inventar cifras.
- Pruebas de reproducibilidad de SVG determinista: regenerar los gráficos a partir de la instantánea de auditoría para validar que el resultado es idéntico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma explícitamente que no se asevera ninguna cifra de benchmark más allá de lo que una auditoría fechada haya medido, y no se reproduce ninguna medición en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documenta formato de pesos ni compatibilidad con runtimes.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconocen el tamaño, la tarea, la arquitectura y la licencia de este artefacto, lo que impide establecer una categoría de comparación fiable.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin arquitectura, parámetros, contexto ni tokenizador documentados, el modelo no es evaluable para uso en producción.
- Licencia no declarada: no puede asumirse permiso de uso comercial, modificación ni redistribución.
- Idiomas no declarados: no hay garantía de cobertura de castellano ni de ningún otro idioma.
- Riesgo de alucinación: imposible de caracterizar sin evaluación publicada.
- Sesgos conocidos: no documentados.
- Las afirmaciones de entrenamiento y evaluación se remiten a ficheros de recibo externos no enlazados en el repositorio; cualquier dato no receipted debe tratarse como desconocido, tal como advierte el propio autor.
- El nombre del repositorio (`salad-ring-ouro-l127`) no aporta información técnica verificable; no debe inferirse tamaño, versión o capacidad a partir de él.
- Sin descargas ni likes en el momento de la consulta, no existe comunidad ni soporte documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l127
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canónica declarada (organización en GitHub): https://github.com/szl-holdings
- Herramienta de generación de cards: https://github.com/szl-holdings/estate-cards
