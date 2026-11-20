# SZLHOLDINGS/salad-ring-ouro-l31

## Resumen

salad-ring-ouro-l31 es un artefacto de modelo publicado en Hugging Face por la organización SZLHOLDINGS dentro de lo que el autor denomina su "estate" de IA gobernada, un catálogo de modelos, datasets y Spaces con resultados "receipted" y verificables. El repositorio se presenta como un "trained artifact in the governed factory", es decir, un modelo entrenado dentro de un pipeline interno de la organización, sin que la model card exponga detalles sobre su arquitectura, tamaño o proceso de entrenamiento.

La información pública disponible es extremadamente escasa: la model card se limita a describir la identidad del repositorio, enlazar a la organización en GitHub y mostrar gráficos SVG generados de forma determinista a partir de una instantánea de auditoría. El autor declara explícitamente que cualquier afirmación sobre entrenamiento o evaluación que no esté en los ficheros de "receipts" debe considerarse UNKNOWN, y que no se afirma ningún resultado de benchmark más allá de lo medido en una auditoría fechada.

Por tanto, esta ficha no puede confirmar arquitectura, parámetros, contexto, licencia ni idiomas. El modelo tiene cero descargas y cero likes en el momento de la consulta, y su relevancia práctica para desarrolladores o investigadores es, a día de hoy, no verificable con la documentación publicada.

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

No disponible. La model card no describe la arquitectura del modelo (transformer, MoE, SSM, híbrido u otra), ni el volumen de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor remite a los ficheros de "receipts" del "estate mesh" para cualquier afirmación de entrenamiento o evaluación, pero no se enlaza ningún receipt concreto en la información proporcionada.

La única innovación metodológica declarada es de gobernanza y trazabilidad: los gráficos de la model card se generan con SVG determinista usando solo la biblioteca estándar de Python a partir de una instantánea de auditoría fechada (2026-11-20T03:48:04Z, etiquetada como MEASURED), y el autor distingue explícitamente entre valores MEASURED, REPORTED y UNKNOWN. Esta práctica es encomiable en transparencia, pero no aporta información técnica sobre el propio modelo.

## Capacidades

- No se documenta ninguna capacidad concreta (generación de texto, razonamiento, código, matemáticas, visión, audio) en la información disponible.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni de razonamiento multi-paso.
- No se confirman capacidades multilingües ni idiomas cubiertos.
- No se confirma ningún modo especial (thinking mode, decodificación especulativa, atención lineal, etc.).

## Casos de uso

No es posible recomendar casos de uso concretos sin información verificable sobre arquitectura, tamaño, contexto o licencia. Cualquier aplicación práctica requeriría primero localizar los "receipts" del autor y validar el artefacto. A modo de orientación sobre qué habría que verificar antes de plantear un uso:

- Evaluación interna de artefactos de una organización: inspeccionar el repositorio y sus receipts para determinar si el modelo es apto para un pipeline propietario.
- Reproducibilidad de auditoría: usar la instantánea de auditoría fechada y los SVG deterministas como base para verificar claims del autor.
- Integración en un catálogo gobernado: si la organización dispone de la infraestructura del "estate", el modelo podría registrarse como artefacto con trazabilidad de origen.
- Generación de texto genérica: solo si se confirma tras inspección que el modelo es un LLM con pesos utilizables y licencia compatible.
- Despliegue en producción: descartado hasta confirmar licencia, formato de pesos y requisitos de hardware.
- Fine-tuning sobre dominio propio: descartado hasta confirmar arquitectura y disponibilidad de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se afirma ningún número de benchmark más allá de lo medido en una auditoría fechada, y no se incluye ninguno en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; se desconoce el formato de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la categoría, el tamaño y la tarea del modelo.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-ring-ouro-l31 | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se puede determinar arquitectura, tamaño, contexto ni formato de pesos.
- Licencia no declarada: riesgo legal alto para cualquier uso comercial; no se puede asumir permisividad.
- Idiomas no declarados: no se puede garantizar calidad en castellano ni en ningún otro idioma.
- Sin benchmarks ni evaluaciones publicadas: imposible estimar calidad, sesgos o riesgo de alucinación.
- Cero descargas y cero likes: no hay evidencia de uso por parte de la comunidad ni de validación externa.
- La model card remite a "receipts" externos no enlazados en la información disponible; la verificabilidad real queda pendiente.
- El nombre del repositorio y la estética de la card no aportan información semántica sobre el modelo; no deben interpretarse como indicios de capacidad.
- No apto para producción sin una auditoría previa del artefacto y de su licencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l31
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la card): https://github.com/szl-holdings
- Herramienta de generación de cards (referenciada): https://github.com/szl-holdings/estate-cards
