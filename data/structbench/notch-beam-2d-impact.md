# StructBench/notch-beam-2d-impact

## Resumen

`notch-beam-2d-impact` es un checkpoint de referencia del benchmark StructBench, publicado por la organización StructBench junto con la versión de código `v0.4.0`. No es un modelo de lenguaje, sino un modelo subrogado (*surrogate model*) de simulación física entrenado para reproducir el comportamiento de una pieza estructural 2D con entalla sometida a impacto. El checkpoint registrado pertenece a la familia CGN (un esquema autorregresivo) y se distribuye como pesos de PyTorch (`model-best-186000.pt`).

El repositorio contiene un único bundle de referencia, con el checkpoint, el `config.json` resuelto, las estadísticas de normalización y los ficheros `metrics-<split>.json` de los splits evaluados, además de un `SHA256SUMS` para verificar integridad. El resultado principal publicado es un error relativo L2 de desplazamiento de 0,2827 en el split `test_interp` bajo evaluación de tipo *rollout*.

Su relevancia es acotada pero clara: sirve como punto de comparación reproducible para quien entrene o evalúe modelos subrogados sobre el mismo problema estructural, y como ejemplo de empaquetado de checkpoints con métricas y sumas de verificación. No está pensado para inferencia general ni para tareas de NLP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CGN (familia `cgn`), esquema autorregresivo para simulación de campos físicos |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no aplica: modelo de simulación física, no de texto) |
| Tipos de cuantización | no disponible (pesos PyTorch en coma flotante, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`), checkpoint `model-best-186000.pt` |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia CGN con esquema autorregresivo, según la tabla de la model card. Se trata de un modelo subrogado que predice la evolución de un campo físico (desplazamientos, a juzgar por la métrica `rollout_rel_l2_disp`) sobre una geometría de viga con entalla en 2D bajo carga de impacto. El esquema autorregresivo implica que el modelo predice el siguiente estado a partir del anterior, y que la evaluación se realiza en modo *rollout*, es decir, encadenando predicciones a lo largo de la simulación.

No se especifican en la información disponible el número de parámetros, la composición del dataset de entrenamiento, el número de tokens o pasos, ni si hubo ajuste fino con refuerzo. El identificador del checkpoint (`model-best-186000`) sugiere 186.000 pasos o iteraciones de entrenamiento en el mejor punto de validación, pero este dato no se confirma explícitamente. La evaluación se apoya en el CLI `structbench-train`, que reconstruye el simulador a partir del `config.json` incluido en el propio bundle, lo que garantiza que las métricas se recalculan con la misma configuración que el checkpoint original.

## Capacidades

- Predicción de campos físicos 2D para una viga con entalla sometida a impacto, en modo autorregresivo y evaluación *rollout*.
- Reproducción de la simulación de referencia mediante el CLI de StructBench, que reconstruye el simulador desde `config.json`.
- Verificación de integridad de los artefactos mediante `SHA256SUMS`.
- Comparación de métricas contra los ficheros `metrics-<split>.json` incluidos en el bundle.
- No soporta tool calling, agentes, razonamiento multi-paso en lenguaje natural, visión, audio ni capacidades multilingües.
- No incluye modo *thinking* ni decodificación especulativa; son conceptos ajenos a este tipo de modelo.

## Casos de uso

- Validación de pipelines de simulación subrogada: usar el checkpoint como referencia para comprobar que un pipeline propio de StructBench reproduce las métricas publicadas (0,2827 de error relativo L2 en `test_interp`) antes de entrenar variantes.
- Benchmarking de nuevos modelos subrogados: cualquier arquitectura candidata para `notch_beam_2d_impact` puede compararse contra este checkpoint con la misma métrica y el mismo split, gracias a que el bundle incluye configuración y estadísticas de normalización.
- Estudio de estabilidad en *rollout*: al ser un modelo autorregresivo evaluado en rollout, sirve para analizar la acumulación de error a lo largo de la simulación y como línea base para técnicas de mitigación.
- Docencia e investigación en ingeniería estructural computacional: ejemplo reproducible de modelo subrogado para un problema de impacto con entalla, con licencia permisiva y artefactos verificables.
- Integración en herramientas de ingeniería asistida: el checkpoint puede cargarse en PyTorch para generar predicciones rápidas de desplazamientos en exploraciones de diseño, sustituyendo simulaciones completas cuando la precisión de 0,28 en error relativo L2 sea aceptable.
- Auditoría de reproducibilidad: el par `SHA256SUMS` más `config.json` permite verificar que un resultado publicado corresponde exactamente a los pesos y la configuración declarados.

## Benchmarks y rendimiento

| Split | Métrica | Valor |
|---|---|---|
| `test_interp` | `rollout_rel_l2_disp` | 0,2827 |

No se han publicado en la información disponible resultados adicionales (MMLU, HumanEval, GSM8K u otros) ni comparaciones con otros checkpoints del mismo benchmark. Los benchmarks de NLP no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del checkpoint no se indica y el repositorio aparece con 0.0 GB, lo que impide estimar memoria de inferencia.
- GPU recomendadas: no disponible. Al ser un modelo de simulación 2D de tamaño presumiblemente reducido, es probable que quepa en GPU de consumo, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: carga directa en PyTorch y evaluación mediante el CLI `structbench-train` de StructBench (`--mode rollout`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada solo incluye un checkpoint (familia CGN) para el benchmark `notch_beam_2d_impact`; no se listan otras familias, checkpoints alternativos ni modelos subrogados comparables con sus métricas.

## Limitaciones y advertencias

- Modelo específico de un único problema: viga 2D con entalla bajo impacto. No generaliza a otras geometrías, cargas o dominios sin reentrenamiento.
- El error relativo L2 de desplazamiento en `test_interp` es 0,2827, un valor alto que limita su uso en decisiones de ingeniería que exijan precisión fina.
- El esquema autorregresivo en modo *rollout* acumula error con el horizonte de simulación; la métrica publicada refleja ese régimen y no debe interpretarse como error de un paso único.
- El repositorio aparece con 0.0 GB y 0 descargas; conviene verificar el contenido real del bundle y las sumas SHA-256 antes de confiar en los artefactos.
- La evaluación sobrescribe el `metrics-<split>.json` descargado; hay que conservar una copia para comparar, tal como advierte la model card.
- No hay información sobre sesgos, alucinación o restricciones idiomáticas porque el modelo no opera sobre texto.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución y aviso de cambios; no se documentan restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StructBench/notch-beam-2d-impact
- Repositorio de código y benchmark StructBench: https://github.com/qilinli/StructBench
- Registro de resultados del benchmark: https://github.com/qilinli/StructBench/blob/v0.4.0/docs/benchmarks/notch_beam_2d_impact.md
