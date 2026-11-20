# SZLHOLDINGS/salad-ring-ouro-l43

## Resumen

`salad-ring-ouro-l43` es un artefacto de modelo publicado por la organización SZLHOLDINGS en Hugging Face, descrito por su autor como parte de un "estate de IA gobernada" de modelos, datasets y Spaces con resultados verificables y enlazados a la fuente. El repositorio se presenta como un "trained artifact in the governed factory", es decir, un modelo entrenado dentro de un pipeline interno de la organización, sin que la model card proporcione detalles sobre el proceso de entrenamiento, los datos utilizados ni la arquitectura.

La información pública disponible es extremadamente limitada: no se especifican arquitectura, número de parámetros, longitud de contexto, idiomas soportados, licencia ni formato de pesos. La model card incide explícitamente en una política de honestidad ("Where this repo lacks a measured curve, we say UNKNOWN rather than invent one"), de modo que cualquier afirmación técnica sobre el modelo que no esté respaldada por un "receipt" (fichero de auditoría) se marca como desconocida.

En el momento de redactar esta ficha, el repositorio registra 0 descargas y 0 "likes", fue creado el 18 de noviembre de 2026 y actualizado el 20 de noviembre de 2026. No existe información verificable que permita evaluar su calidad, rendimiento o idoneidad para uso en producción, por lo que esta ficha se limita a documentar lo que el autor declara y a marcar el resto como no disponible.

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

La model card no describe la arquitectura del modelo (transformer, MoE, SSM, híbrida u otra), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor remite a los "receipt files" del "estate mesh" para cualquier afirmación sobre entrenamiento o evaluación, y declara explícitamente que lo que no está documentado en dichos receipts se considera UNKNOWN.

El único dato técnico contextual es que se trata de un artefacto entrenado ("trained artifact") dentro de la "governed factory" de SZLHOLDINGS, con tarjetas generadas de forma determinista por una herramienta interna (`estate-cards weaver v0.1.0`, escrita en Python de la stdlib) que produce SVG a partir de una instantánea de auditoría fechada el 2026-11-20T03:48:04Z. No se aporta ninguna innovación técnica destacable (decodificación especulativa, atención lineal, etc.).

## Capacidades

- No se documenta ninguna capacidad concreta de generación de texto, razonamiento, código, matemáticas o visión.
- No se indica soporte de tool calling ni de function calling.
- No se indica soporte de agentes ni de razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas cubiertos.
- No se declara ningún modo especial (thinking mode, visión, audio u otros).
- La única capacidad implícita es la de ser un modelo entrenado publicado como artefacto dentro de un sistema de gobernanza con auditoría asociada.

## Casos de uso

- Auditoría de artefactos de IA gobernada: el modelo podría utilizarse como caso de estudio dentro del "estate" de SZLHOLDINGS para verificar el flujo de receipts y trazabilidad de modelos; es adecuado únicamente si se accede a la documentación interna de auditoría referenciada por el autor.
- Reproducción de pipelines internos: dado que el autor describe una "governed factory", el artefacto podría servir para reproducir el proceso de generación de tarjetas deterministas (`estate-cards weaver`) y comprobar que los SVG generados coinciden con la instantánea de auditoría.
- Evaluación de políticas de honestidad documental: útil como ejemplo de model card que marca explícitamente los datos desconocidos en lugar de inventarlos, para comparar prácticas de documentación entre organizaciones.
- Integración en catálogos de modelos: puede registrarse en un inventario interno de artefactos de Hugging Face para seguimiento de versiones, fechas de creación y actualización, y estado de descargas.
- Pruebas de gobernanza y compliance: sirve para validar herramientas que comprueben la presencia de licencia, idiomas y especificaciones técnicas antes de permitir el despliegue de un modelo.
- Docencia sobre limitaciones de información: puede emplearse como ejemplo real de repositorio con información insuficiente para evaluar un modelo, ilustrando la importancia de exigir model cards completas.

En ningún caso se recomienda su uso en producción sin antes obtener del autor la información técnica y la licencia que faltan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y que lo no medido se marca como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre parámetros, contexto, rendimiento ni licencia que permita establecer una comparación con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se puede determinar tamaño, arquitectura ni requisitos de despliegue.
- Licencia no declarada: no hay autorización explícita para uso comercial ni para redistribución; debe contactarse con el autor antes de cualquier uso.
- Idiomas no declarados: se desconoce si el modelo soporta castellano u otros idiomas.
- Sin benchmarks ni métricas de evaluación publicadas: imposible estimar calidad o riesgo de alucinación.
- Repositorio sin descargas ni interacción (0 descargas, 0 likes) en el momento de la consulta: no hay evidencia de uso por parte de la comunidad.
- La model card remite a receipts externos ("estate mesh") que no están enlazados de forma directa en la información disponible, lo que dificulta la verificación independiente.
- Riesgo de sesgos: no evaluable por falta de documentación sobre datos de entrenamiento.
- No apto para producción sin una evaluación previa y sin confirmación escrita de licencia y especificaciones por parte de SZLHOLDINGS.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l43
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Herramienta de generación de tarjetas (referenciada): https://github.com/szl-holdings/estate-cards
