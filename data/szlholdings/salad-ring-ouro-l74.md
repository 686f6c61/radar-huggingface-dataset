# SZLHOLDINGS/salad-ring-ouro-l74

## Resumen

salad-ring-ouro-l74 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organización denomina su "estate de IA gobernada": una colección de modelos, datasets y Spaces con resultados verificables y trazabilidad mediante ficheros de recibo (receipts). El repositorio de Hugging Face no incluye información técnica sustantiva sobre el modelo: no se especifican arquitectura, número de parámetros, longitud de contexto ni datos de entrenamiento.

La model card se limita a describir el marco de gobernanza del autor (identidad del repo, fuente canónica en GitHub, gráficos SVG generados de forma determinista a partir de una instantánea de auditoría) y a declarar explícitamente que cualquier afirmación sobre calidad o capacidades que no esté respaldada por recibos de evaluación medidos se marca como UNKNOWN. De hecho, el propio escaneo de recibos recogido en la card clasifica el repositorio como RECEIPT_FILES_NO_DONE, es decir, hay ficheros con nombre de recibo pero no un DONE.json estricto con estado MEASURED.

Por tanto, la relevancia práctica de esta ficha es limitada: se trata de un repositorio sin descargas, sin likes, sin licencia declarada, sin idiomas declarados y sin pipeline asignado, creado en noviembre de 2026. No hay evidencia publicada de que el artefacto haya sido entrenado, evaluado o validado conforme al estándar que el propio autor declara. Cualquier evaluación técnica del modelo requeriría inspeccionar los pesos y los recibos en el repositorio de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la información disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida o cualquier otra variante, ni incluye detalles sobre capas, dimensiones ocultas, mecanismos de atención o tokenizador.

Tampoco hay datos sobre el proceso de entrenamiento: no se indica el número de tokens utilizados, la composición del corpus, si hubo fases de ajuste supervisado, RLHF o DPO, ni qué innovaciones técnicas (decodificación especulativa, atención lineal, cuantización nativa) incorpora. La card remite a "ficheros de recibo" alojados en el mesh del estate para cualquier afirmación sobre entrenamiento o evaluación, pero el escaneo estricto recogido en la propia card concluye que no existe un DONE.json que cumpla el estándar (status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento), por lo que la evidencia de entrenamiento se clasifica como UNKNOWN.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- No hay evidencia publicada de generación de texto, razonamiento, código, matemáticas o visión.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües ni idiomas cubiertos.
- No se declara ningún modo especial (thinking mode, visión, audio u otros).
- La única información funcional es la pertenencia del artefacto al "governed factory" de SZLHOLDINGS, sin detalle operativo.

## Casos de uso

No es posible enumerar casos de uso concretos y realistas sin información sobre las capacidades del modelo. Los siguientes escenarios son genéricos y quedan condicionados a que se verifique el artefacto:

- Evaluación interna de artefactos gobernados: un equipo de plataforma podría inspeccionar los ficheros de recibo y los pesos para determinar si el modelo cumple los criterios de trazabilidad exigidos antes de cualquier uso.
- Auditoría de cadena de suministro de modelos: dado que la card enlaza a una fuente canónica en GitHub y a gráficos generados a partir de una instantánea de auditoría fechada, el repositorio podría servir como caso de estudio de trazabilidad documental.
- Pruebas de reproducibilidad: si los recibos llegaran a completarse con un DONE.json medido, el artefacto podría incorporarse a pipelines de verificación automatizada de modelos.
- Integración en un catálogo interno: un equipo de MLOps podría registrar el artefacto en un inventario de modelos con su estado de evidencia (UNKNOWN) para bloquear su despliegue hasta que se resuelva.
- Formación y documentación: el formato de card con etiquetas MEASURED/REPORTED/UNKNOWN puede utilizarse como plantilla de documentación de gobernanza en otros proyectos.
- Análisis de riesgos de licencia: al no declararse licencia, el artefacto sirve como ejemplo de por qué es necesario un proceso de aprobación legal antes de reutilizar pesos de origen desconocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de recibos incluido en la propia card clasifica la evidencia de evaluación como UNKNOWN (sin DONE.json estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el número de parámetros.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara formato de pesos compatible con ninguno de estos motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No es posible identificar modelos comparables sin conocer la arquitectura, el tamaño, el contexto y la licencia del artefacto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-ring-ouro-l74 | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se puede planificar el despliegue ni estimar costes de inferencia.
- Evidencia de evaluación inexistente: el propio escaneo del autor clasifica el repo como RECEIPT_FILES_NO_DONE, sin DONE.json estricto.
- Licencia no declarada: no hay autorización explícita para uso comercial, modificación o redistribución; debe tratarse como no apto para producción hasta aclararlo.
- Idiomas no declarados: no se puede asumir cobertura multilingüe ni calidad en castellano.
- Riesgo de alucinación y sesgos: imposible de evaluar sin benchmarks ni documentación de datos de entrenamiento.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin pipeline asignado en Hugging Face.
- Fechas de creación y actualización (noviembre de 2026) posteriores a la instantánea de auditoría citada en la card (2026-11-20), lo que dificulta reconstruir el estado exacto del artefacto en cada momento.
- Los gráficos SVG de la card son generados de forma determinista a partir de una instantánea, pero no constituyen por sí mismos evidencia de calidad del modelo.
- Cualquier uso en producción debería ir precedido de una inspección directa de los pesos y de los recibos en el repositorio de origen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l74
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canónica en GitHub (organización): https://github.com/szl-holdings
- Herramienta de generación de cards: https://github.com/szl-holdings/estate-cards
