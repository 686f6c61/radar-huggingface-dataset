# Tileward-Inc/Tileward-Qwen3.8-27B-TWX4

## Resumen

Tileward-Qwen3.8-27B-TWX4 es una compresión del modelo Qwen3.8-27B, desarrollada por Tileward-Inc mediante su método propietario TWX4. El modelo base es Qwen3.8-27B, publicado por el equipo Qwen bajo licencia Apache-2.0. El resultado es un artefacto de 31,0 GB que, según el autor, mantiene un rendimiento prácticamente idéntico al modelo sin comprimir en tareas de agente: un 43,7% de tareas de Linux completadas en AgentBench OS frente al 45,1% del original.

La relevancia de esta ficha es limitada por un detalle fundamental: **los pesos no están publicados en Hugging Face**. La model card indica explícitamente que para acceder a esta build hay que reservar una reunión con un ingeniero de Tileward. Por tanto, se trata de un anuncio técnico y de una comparativa de resultados, no de un modelo descargable.

La información disponible se centra en una única métrica de evaluación (AgentBench OS) y en el tamaño del artefacto. No se detallan la arquitectura interna del modelo base, la composición del dataset de entrenamiento, los idiomas soportados ni los formatos de pesos más allá de la referencia al tamaño del fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.8-27B; el autor no detalla la arquitectura interna) |
| Parametros totales | 27B (heredados del modelo base Qwen3.8-27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TWX4 (método propietario de Tileward); el autor lo compara con FP8 y con una build ternaria (Bonsai 2 27B) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (artefacto de 31,0 GB; pesos no publicados) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-27B ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). La model card de Tileward se limita a describir el proceso de compresión: el modelo original se comprime con el método TWX4 hasta obtener un artefacto de 31,0 GB, que el autor sitúa como un 8,5% más pequeño que la build NVFP4 de NVIDIA según su propio artículo de investigación.

La innovación técnica destacable es el propio esquema de compresión TWX4, que el autor presenta como una alternativa a FP8 y a las builds ternarias. La model card enlaza a tres artículos de investigación: uno sobre la metodología de medición de las cifras, otro sobre la comparación con NVFP4 y un tercero sobre la herencia de comportamiento en modelos comprimidos. No se proporcionan detalles técnicos del algoritmo de compresión en la información disponible.

## Capacidades

- Generación de texto: el pipeline declarado es text-generation.
- Ejecución de tareas de agente en entornos reales: la única evaluación publicada es AgentBench OS, con tareas de Linux ejecutadas en contenedores reales y validadas por el entorno.
- Razonamiento multi-paso orientado a agentes: el modelo se evalúa en un bucle de agente, lo que implica capacidad de planificación y uso de herramientas dentro de ese bucle.
- Tool calling / function calling: no se detalla explícitamente, aunque el escenario de evaluación de agente lo presupone.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Despliegue de agentes autónomos en entornos Linux: el modelo está evaluado precisamente en tareas de sistema operativo dentro de contenedores, con un 43,7% de tareas completadas, lo que lo hace adecuado para automatización de operaciones y scripts de administración de sistemas.
- Automatización de tareas de CI/CD con validación por entorno: dado que la evaluación se basa en el resultado real de cada tarea (pasada o fallada por el entorno), encaja en pipelines donde el agente debe ejecutar comandos y corregir errores de forma iterativa.
- Sustitución de builds FP8 en infraestructura existente: con 31,0 GB y un rendimiento declarado de 43,7% frente al 44,0% de la build FP8 de Qwen, es una opción para entornos que ya ejecutan el modelo base en una GPU de 80 GB y buscan reducir el espacio ocupado.
- Evaluación comparativa de esquemas de compresión: útil para equipos de investigación que quieran contrastar TWX4 frente a FP8, NVFP4 o builds ternarias en tareas de agente, usando la metodología publicada en tileward.com/evals.
- Investigación sobre herencia de comportamiento en modelos comprimidos: el artículo "Smaller models should keep the behavior you chose" aborda si la compresión preserva el comportamiento del modelo original, un caso de uso relevante para quien diseñe su propia pipeline de compresión.
- Despliegue en una única GPU de 80 GB: el autor indica que todas las builds se evaluaron en una tarjeta de 80 GB, lo que sitúa este artefacto en el rango de un A100 80GB o H100 80GB para inferencia de agente.

## Benchmarks y rendimiento

| Build | Tareas completadas (dos ejecuciones de 142) | Porcentaje | Tamaño |
|---|---|---|---|
| Qwen3.8-27B sin comprimir | 64 + 64 | 45,1% | no disponible |
| Build FP8 de Qwen | 60 + 65 | 44,0% | no disponible |
| **Tileward-Qwen3.8-27B-TWX4** | **61 + 63** | **43,7%** | **31,0 GB** |
| Bonsai 2 27B (build ternaria) | 57 + 64 | 42,6% | 7,2 GB |

Datos adicionales de la model card: la build ternaria utilizó un 28% más de tokens de prompt que el modelo sin comprimir para alcanzar su resultado, mientras que la build TWX4 utilizó un 7% más. Todas las builds se evaluaron con las mismas tareas y ajustes en una única tarjeta de 80 GB. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto ocupa 31,0 GB, por lo que requiere al menos esa cantidad de memoria más el espacio para el contexto y el estado de inferencia.
- GPU recomendadas: el autor evaluó todas las builds en una tarjeta de 80 GB, lo que apunta a A100 80GB o H100 80GB como referencia.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; 31,0 GB supera la VRAM de las GPU de consumo habituales (RTX 4090 con 24 GB, RTX 5090 con 32 GB en el límite teórico), aunque no se especifica el formato exacto de los pesos ni si existe una variante cuantizada adicional.
- Opciones de despliegue: no disponible (no se indican vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en AgentBench OS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tileward-Qwen3.8-27B-TWX4 | 27B | no disponible | 43,7% | apache-2.0 | No publicado (contacto con el autor) |
| Qwen3.8-27B sin comprimir | 27B | no disponible | 45,1% | apache-2.0 | Disponible en Hugging Face |
| Qwen3.8-27B FP8 (build de Qwen) | 27B | no disponible | 44,0% | apache-2.0 | No disponible en la información proporcionada |
| Bonsai 2 27B (build ternaria) | 27B | no disponible | 42,6% | no disponible | No disponible en la información proporcionada |

## Limitaciones y advertencias

- Pesos no publicados: la model card indica explícitamente que los pesos no se publican en Hugging Face y que el acceso requiere reservar una reunión con un ingeniero de Tileward. No es un modelo descargable ni desplegable sin contacto comercial.
- Ausencia de benchmarks estándar: no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multilingües; el único dato es AgentBench OS con dos ejecuciones de 142 tareas, una muestra limitada.
- Diferencia de rendimiento respecto al original: 43,7% frente a 45,1% implica una pérdida de 1,4 puntos porcentuales, dentro de la variabilidad de dos ejecuciones, pero no se ofrece intervalo de confianza ni análisis estadístico.
- Mayor consumo de tokens de prompt: la build TWX4 usó un 7% más de tokens de prompt que el modelo sin comprimir, lo que incrementa el coste de inferencia en contextos largos.
- Idiomas no especificados: no se detalla qué idiomas soporta el modelo comprimido ni si la compresión afecta al rendimiento multilingüe.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos: no documentados.
- Licencia: apache-2.0 según los metadatos, heredada del modelo base, pero la falta de publicación de pesos impide verificar las condiciones reales de uso comercial del artefacto comprimido.
- Método de compresión propietario: TWX4 no está descrito técnicamente en la model card; la reproducibilidad del resultado depende de la información publicada en los artículos de Tileward.

## Enlaces

- Hugging Face: https://huggingface.co/Tileward-Inc/Tileward-Qwen3.8-27B-TWX4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio del autor: https://tileward.com
- Metodología de evaluación: https://tileward.com/evals/#compressed-model-agents
- Artículo sobre la comparación con NVFP4: https://tileward.com/research/a-smaller-qwen3-8-27b/
- Artículo sobre herencia de comportamiento: https://tileward.com/research/what-compression-inherits/
- Investigación de Tileward: https://tileward.com/research/
- Contacto con ingeniero: https://calendar.app.google/hg2DzFTxKJgwFWm19
