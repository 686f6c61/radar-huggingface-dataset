# SZLHOLDINGS/salad-ring-ouro-l24

## Resumen

`salad-ring-ouro-l24` es un artefacto de modelo publicado por la organización SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina su "estate governed-AI": un conjunto de modelos, datasets y Spaces con resultados trazables y verificables mediante ficheros de recibo (receipts). El repositorio no incluye una model card técnica convencional; la información disponible se limita a metadatos de identidad, insignias y gráficos SVG generados automáticamente a partir de una instantánea de auditoría fechada el 20 de noviembre de 2026.

La model card declara explícitamente que cualquier afirmación sobre entrenamiento o evaluación reside en los ficheros de recibo del estate, y que lo que no esté respaldado por un recibo se etiqueta como UNKNOWN. No se especifican arquitectura, número de parámetros, longitud de contexto, idiomas ni licencia. El sufijo "l24" del nombre sugiere una variante o versión, pero el autor no lo documenta.

Por tanto, esta ficha se limita a reflejar los datos verificables del repositorio y marca como "no disponible" todo aquello que la información proporcionada no cubre. No es posible evaluar el modelo para uso en producción con los datos actuales.

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

No disponible. La model card no describe la arquitectura (transformer, MoE, SSM o híbrida), el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor remite a los ficheros de recibo del estate para cualquier afirmación sobre entrenamiento, y declara que lo no receiptado se considera UNKNOWN.

El único dato técnico implícito es que se trata de un "trained artifact in the governed factory", es decir, un modelo entrenado dentro del pipeline interno de SZLHOLDINGS, sin más detalle público.

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- No se confirma soporte de generación de texto, razonamiento, código, matemáticas o visión.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirman capacidades multilingües.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

No es posible recomendar casos de uso concretos sin información sobre arquitectura, tamaño, contexto o capacidades. Los siguientes escenarios son genéricos y quedan condicionados a que el modelo los soporte, algo que la información disponible no permite verificar:

- Clasificación o etiquetado de texto: solo si el modelo expone una cabeza o API adecuada, dato no disponible.
- Generación de texto en pipelines internos: requiere conocer contexto y licencia, ambos no disponibles.
- Integración en agentes con tool calling: no confirmado.
- Despliegue en entornos con requisitos de trazabilidad: el autor enfatiza receipts y auditoría, pero no detalla el mecanismo.
- Evaluación comparativa interna: imposible sin benchmarks publicados.
- Uso comercial: bloqueado por licencia no disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y que los datos medidos residen en los ficheros de recibo del estate, no en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se confirma el formato de pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Sin datos de arquitectura, tamaño, contexto o licencia no es posible identificar modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se puede verificar arquitectura, tamaño ni contexto.
- Licencia no especificada: riesgo legal para cualquier uso comercial o redistribución.
- Idiomas no declarados: no se puede garantizar cobertura multilingüe.
- Sin benchmarks ni evaluaciones publicadas: imposible estimar calidad o fiabilidad.
- Riesgo de alucinación: no evaluable sin datos de entrenamiento ni pruebas.
- Sesgos conocidos: no documentados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.
- La model card es generada automáticamente por una herramienta interna (`estate-cards weaver v0.1.0`) y no sustituye a una documentación técnica convencional.
- Fecha de creación (2026-11-18) y actualización (2026-11-20) muy recientes respecto a la consulta: posible artefacto en estado embrionario o de prueba.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l24
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la card): https://github.com/szl-holdings
- Herramienta de generación de cards: https://github.com/szl-holdings/estate-cards
