# sreemithravinda/tds-carbon-card

## Resumen

Este repositorio, `sreemithravinda/tds-carbon-card`, no contiene un modelo de inteligencia artificial en el sentido convencional, sino una ficha de contabilidad de carbono asociada a un entrenamiento de un modelo no especificado. El autor, `sreemithravinda`, documenta las emisiones de CO₂ equivalente generadas durante una ejecución de pre-entrenamiento, siguiendo la práctica de Green AI para la transparencia ambiental. El repositorio forma parte de una serie de repositorios similares creados por distintos autores (por ejemplo, `shivainlabs/tds-carbon-card` o `ShivanshHanda/tds-carbon-card`) que reportan métricas de consumo energético y emisiones de entrenamientos de modelos de IA.

La información disponible se limita a datos de emisiones y consumo energético: se reportan 358,301 kg de CO₂ equivalente, un total de 746,46 kWh de energía consumida, 188,5 horas de GPU con un factor de eficiencia energética (PUE) de 1,1, y el uso de 8 GPUs NVIDIA RTX 4090 en la región `ap-southeast1`. No se proporciona ninguna especificación técnica del modelo entrenado (arquitectura, parámetros, contexto, etc.). Por lo tanto, este repositorio no es utilizable como un modelo de IA y no ofrece capacidades de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

Datos de entrenamiento documentados en el repositorio (no del modelo, sino de la ejecución de entrenamiento):

| Parametro | Valor |
|---|---|
| Hardware | NVIDIA RTX 4090 (8 GPUs) |
| Modo de entrenamiento | pre-training |
| Region | ap-southeast1 |
| Horas de GPU | 188,5 h (PUE: 1,1) |
| Energía total | 746,46 kWh |
| Emisiones de CO₂ | 358,301 kg CO₂eq |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo entrenado. El repositorio se limita a documentar el impacto ambiental de una ejecución de pre-entrenamiento, sin especificar el tipo de modelo (transformer, MoE, SSM, etc.), el número de tokens, la composición del dataset ni técnicas de entrenamiento como RLHF o DPO. La única información técnica es el hardware utilizado (8 GPUs NVIDIA RTX 4090) y el modo de entrenamiento (pre-training), lo que sugiere que se trata de un proceso de entrenamiento estándar de un modelo de IA, pero sin detalles adicionales.

## Capacidades

No aplicable. Este repositorio no contiene un modelo funcional ni ofrece ninguna capacidad de procesamiento de lenguaje natural, generación de código, razonamiento, visión, etc. Es exclusivamente un registro de métricas de carbono y energía.

## Casos de uso

Este repositorio no es un modelo de IA y no tiene casos de uso prácticos en aplicaciones de IA. Su utilidad se limita a:

- Auditoría ambiental de entrenamientos de IA: sirve como referencia para cuantificar el impacto energético de una ejecución de entrenamiento con hardware específico (RTX 4090) en una región concreta.
- Educación sobre Green AI: puede utilizarse en cursos o proyectos para ilustrar cómo documentar el consumo de carbono en el desarrollo de modelos.
- Comparación de eficiencia energética: permite contrastar los datos reportados con los de otros repositorios similares (como `ShivanshHanda/tds-carbon-card`) para evaluar diferencias en hardware y regiones.
- Cumplimiento de políticas de sostenibilidad: si una organización requiere informes de emisiones para sus entrenamientos, este repositorio sirve como plantilla.

No es adecuado para tareas de generación de texto, código o cualquier otra tarea de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene evaluaciones de rendimiento del modelo entrenado, ni comparaciones con otros modelos.

## Requisitos de hardware

No aplicable para el modelo (no existe). Sin embargo, los datos de entrenamiento reportados indican que se utilizaron 8 GPUs NVIDIA RTX 4090, un hardware de consumo para GPUs de gama alta. No se proporcionan requisitos de inferencia, latencia o throughput.

## Comparativa con modelos similares

No existen modelos comparables porque este repositorio no es un modelo. No obstante, existen repositorios hermanos con el mismo propósito de contabilidad de carbono, que pueden compararse en términos de eficiencia energética:

| Repositorio | Hardware | Región | GPU horas | Energía (kWh) | CO₂ (kg) |
|---|---|---|---|---|---|
| `sreemithravinda/tds-carbon-card` | RTX 4090 (8 GPUs) | ap-southeast1 | 188,5 | 746,46 | 358,301 |
| `shivainlabs/tds-carbon-card` | no disponible | no disponible | no disponible | no disponible | no disponible |
| `ShivanshHanda/tds-carbon-card` | V100 (8 GPUs) | us-central1 | 76,6 | 292,3056 | 102,307 |

Estos datos permiten observar diferencias en el consumo según hardware y región, pero no son comparaciones de rendimiento de modelos.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de IA: no es posible utilizarlo para ninguna tarea de inferencia, generación o procesamiento.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto, porque no hay modelo.
- La licencia del repositorio no está especificada; el uso de los datos de emisiones debe hacerse con cautela y citando la fuente.
- Los datos de emisiones dependen de factores como el hardware, la ubicación y el factor de intensidad de carbono de la red eléctrica, por lo que no son generalizables a otros entrenamientos.
- No hay código fuente ni pesos descargables; el repositorio solo contiene un README con métricas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sreemithravinda/tds-carbon-card
- Repositorio similar de `shivainlabs`: https://huggingface.co/shivainlabs/tds-carbon-card
- Repositorio similar de `ShivanshHanda`: https://huggingface.co/ShivanshHanda/tds-carbon-card
