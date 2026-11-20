# SZLHOLDINGS/salad-ring-ouro-l55

## Resumen

`salad-ring-ouro-l55` es un artefacto de modelo publicado en Hugging Face por la organización SZLHOLDINGS dentro de lo que el autor denomina su "estate de IA gobernada": un conjunto de modelos, datasets y Spaces con resultados verificables y trazabilidad a la fuente. El repositorio se presenta como un "trained artifact in the governed factory", es decir, un modelo entrenado dentro de un pipeline interno de la organización, sin que la model card especifique arquitectura, tamaño, datos de entrenamiento ni propósito funcional.

La información pública disponible es extremadamente escasa. La model card se limita a metadatos de identidad (repo, fuente canónica en GitHub, tipo de artefacto) y a gráficos SVG generados de forma determinista a partir de una instantánea de auditoría fechada el 2026-11-20. El autor declara explícitamente que cualquier afirmación sobre entrenamiento o evaluación que no esté respaldada por sus ficheros de "receipt" se considera UNKNOWN (desconocido), y no se afirma ningún número de benchmark más allá de lo medido en dicha auditoría.

Por tanto, esta ficha no puede confirmar parámetros, contexto, licencia, idiomas ni capacidades reales del modelo. Es relevante únicamente como ejemplo de publicación con trazabilidad declarada (receipts, auditoría fechada, etiquetado MEASURED/REPORTED/UNKNOWN), pero no como modelo evaluable para producción sin acceso a los artefactos internos de SZLHOLDINGS.

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

No disponible. La model card no describe la arquitectura (transformer, MoE, SSM, híbrida u otra), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor remite cualquier afirmación de entrenamiento o evaluación a los ficheros de receipt del "estate mesh", que no forman parte de la información pública recogida en esta ficha.

El único elemento técnico verificable es el proceso de generación de la propia tarjeta: los gráficos SVG se producen con la librería estándar de Python de forma determinista a partir de una instantánea de auditoría con marca temporal (2026-11-20T03:48:04Z, etiquetada MEASURED), y la tarjeta se genera con la herramienta `estate-cards weaver v0.1.0`. No hay información sobre innovaciones de arquitectura, decodificación especulativa, atención lineal ni técnicas de optimización de inferencia.

## Capacidades

- No se documenta ninguna capacidad funcional concreta (generación de texto, razonamiento, código, matemáticas, visión, audio).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas cubiertos.
- No se mencionan modos especiales (thinking mode, visión, audio, etc.).
- El pipeline de Hugging Face figura como no disponible, por lo que no se puede inferir la tarea para la que fue entrenado.

## Casos de uso

No es posible proponer casos de uso concretos y realistas sin conocer la tarea, el tamaño, la licencia y las capacidades del modelo. Los únicos escenarios que la información permite describir son de carácter meta, no de aplicación del modelo:

- Auditoría de publicación de artefactos: el repositorio sirve como ejemplo de tarjeta generada de forma determinista con instantánea fechada y etiquetado explícito de estados MEASURED/REPORTED/UNKNOWN, útil para equipos que diseñan sus propios procesos de trazabilidad.
- Verificación de procedencia: la referencia a una fuente canónica en la organización de GitHub `szl-holdings` permite comprobar la cadena de custodia del artefacto antes de cualquier uso.
- Integración en un catálogo interno de modelos gobernados: solo tendría sentido dentro del ecosistema SZLHOLDINGS, previa consulta de los receipts.
- Evaluación de riesgos de licencia: al no declararse licencia, cualquier uso comercial requeriría contactar con el autor antes de proceder.
- Docencia sobre documentación de modelos: puede usarse como caso negativo de model card (ausencia de specs, benchmarks y licencia) frente a tarjetas completas.
- Cualquier caso de uso productivo (atención al cliente, generación de código, RAG, análisis de documentos) queda descartado por falta de datos verificables sobre el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo medido en la auditoría fechada, y dichos resultados no se incluyen en el material accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; además, se desconoce el formato de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se puede establecer una categoría de comparación (tamaño, tarea, modalidad) sin datos de arquitectura o parámetros. Las alternativas de la misma organización SZLHOLDINGS podrían ser el término de comparación natural, pero no se han proporcionado sus especificaciones en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-ring-ouro-l55 | no disponible | no disponible | no disponible | Hugging Face (0 descargas, 0 likes) |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se puede verificar arquitectura, tamaño, contexto ni formato de pesos, lo que impide evaluar su idoneidad para cualquier tarea.
- Licencia no declarada: no hay autorización explícita para uso comercial, modificación ni redistribución; en ausencia de licencia, los derechos quedan reservados por defecto.
- Idiomas no declarados: no se puede garantizar cobertura lingüística, incluido el castellano.
- Riesgo de alucinación y sesgos: imposible de evaluar sin benchmarks, dataset de entrenamiento ni documentación de alineación.
- Trazabilidad incompleta: el autor remite a ficheros de receipt y a una organización de GitHub que no se incluyen en el repositorio de Hugging Face; la verificación requiere acceso externo.
- Señales de madurez bajas: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni demo asociada.
- Fechas de creación y actualización (2026-11-18 y 2026-11-20) coherentes con la instantánea de auditoría citada, pero sin histórico de versiones que permita evaluar la evolución del artefacto.
- No apto para producción sin una evaluación independiente previa y sin confirmación por escrito de la licencia por parte del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l55
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canónica declarada (organización en GitHub): https://github.com/szl-holdings
- Herramienta de generación de tarjetas citada: https://github.com/szl-holdings/estate-cards
