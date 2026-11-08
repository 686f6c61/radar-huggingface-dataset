# SZLHOLDINGS/doctrine-v2-r2-candidate

## Resumen

doctrine-v2-r2-candidate es un modelo de investigación publicado por SZLHOLDINGS, un ajuste fino del modelo base `SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3`, que a su vez deriva de la familia Qwen 3.5 (etiqueta `qwen3_5` en Hugging Face). Con 873.438.784 parámetros (aproximadamente 0,87 mil millones), está diseñado para la tarea de image-text-to-text, es decir, procesar entradas que combinan imágenes y texto y generar respuestas conversacionales. Su propósito declarado es servir como "estudiante" de un corpus doctrinal denominado doctrine-corpus-v2, orientado a generar respuestas fundamentadas en fuentes ("source-grounded doctrine").

El modelo se presenta explícitamente como un candidato de investigación no promovido: la model card indica que ha sido entrenado a través de un "contrato de lanzamiento fail-closed" con pines inmutables, un conjunto de validación disjunto por grupos (208 ejemplos de entrenamiento y 28 de holdout, semilla 3407) y un recibo de admisión bajo licencia Apache 2.0. No obstante, el propio autor reconoce que no está certificado en calidad, no ha sido promovido y carece de benchmarks amplios; la evaluación en el holdout está pendiente de publicación.

Su relevancia actual es limitada y fundamentalmente metodológica: ilustra una práctica de trazabilidad rigurosa del entrenamiento (linaje inmutable, recibos de evaluación, separación estricta de datos) más que un modelo listo para producción. Para desarrolladores e investigadores, resulta útil como referencia de pipelines gobernados de ajuste fino sobre modelos pequeños multimodales, pero no como componente desplegable en aplicaciones reales sin una evaluación independiente previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen 3.5 (etiqueta `qwen3_5`) |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su pertenencia a la familia Qwen 3.5 y su naturaleza multimodal (pipeline image-text-to-text). Se trata de un modelo de aproximadamente 0,87 mil millones de parámetros, presumiblemente un transformer denso con codificador visual, aunque no se confirman detalles como el número de capas, la dimensión oculta, el mecanismo de atención o el tipo de tokenizador visual. No se documenta la longitud de contexto nativa.

El entrenamiento se realizó mediante un ajuste fino supervisado (SFT) sobre el modelo base `szl-receiptagent-qwen35-0.8b-sft-v3`, fijado a la revisión `0340c300`. El corpus utilizado es doctrine-corpus-v2, con 208 ejemplos de entrenamiento y 28 de validación en una partición disjunta por grupos con semilla 3407. El proceso se ejecutó a través del pipeline gobernado `szl-forge` (contrato de lanzamiento número 708), con pines inmutables, recibo de admisión y recibos de evaluación por oleada publicados en el dataset `SZLHOLDINGS/model-eval-receipts`. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La innovación destacable no es arquitectónica sino de gobernanza: trazabilidad completa del linaje y publicación de fallos ("failures stay published").

## Capacidades

- Generación de texto conversacional en formato multiturno, según la etiqueta `conversational`.
- Procesamiento conjunto de imagen y texto (image-text-to-text), lo que permite responder a consultas que incluyen una imagen como entrada.
- Generación de respuestas fundamentadas en fuentes dentro del dominio doctrinal del corpus de entrenamiento (source-grounded doctrine).
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; los idiomas soportados no se documentan.
- Capacidades especiales (modo thinking, audio, visión avanzada): únicamente se confirma la entrada de imagen y texto; no se documentan otras modalidades.

## Casos de uso

- Investigación sobre ajuste fino gobernado: el modelo sirve como caso de estudio reproducible de un pipeline SFT con pines inmutables, partición disjunta y recibos de evaluación, útil para equipos que diseñan procesos de entrenamiento auditables.
- Evaluación de metodologías de holdout: con 28 ejemplos de validación disjuntos por grupos, puede emplearse para comparar protocolos de evaluación en modelos pequeños multimodales.
- Prototipado de asistentes documentales con imagen: en un entorno controlado, podría probarse la extracción de información de documentos escaneados y su respuesta conversacional, aunque sin garantías de calidad al no haber certificación.
- Reproducción de linaje de modelos: permite verificar cómo un ajuste fino sobre `szl-receiptagent-qwen35-0.8b-sft-v3` altera el comportamiento respecto al modelo base, gracias a la trazabilidad de revisiones.
- Docencia y formación técnica: ilustra las prácticas de "fail-closed launch contract" y publicación de resultados negativos en proyectos de IA open source.
- Base para experimentos de alineación con datos escasos: con solo 208 ejemplos de entrenamiento, es un punto de partida para estudiar la eficacia del SFT de bajo volumen en modelos de menos de mil millones de parámetros.
- Integración en pipelines de CI de modelos: la etiqueta `endpoints_compatible` y los recibos por oleada permiten automatizar comprobaciones de regresión en despliegues de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación en el holdout disjunto está "pendiente de publicación" y que no existe una certificación de calidad ni benchmarks amplios.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 millones de parámetros en precisión completa (fp32) se requieren aproximadamente 3,5 GB solo para pesos; en fp16/bf16, unos 1,75 GB; en cuantización de 8 bits, alrededor de 0,9 GB, y en 4 bits, unos 0,5 GB. A ello hay que sumar el overhead del codificador visual y de la caché KV, no cuantificado en la documentación.
- GPU recomendadas: no se especifican oficialmente. Por tamaño, el modelo cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) en fp16, y en GPUs profesionales como A100 o H100 sin problema.
- Compatibilidad con GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en cuantización de 8 bits, aunque no hay confirmación oficial.
- Opciones de despliegue: la librería declarada es transformers; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ni se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| doctrine-v2-r2-candidate (SZLHOLDINGS) | 873 M | No disponible | Imagen + texto | Apache 2.0 | Candidato de investigación, no promovido |
| Qwen2-VL-2B (Alibaba) | ~2 B | 32 K (aprox., según documentación pública) | Imagen + texto | Apache 2.0 | Modelo publicado y evaluado |
| SmolVLM-500M (Hugging Face) | ~500 M | 8 K (aprox., según documentación pública) | Imagen + texto | Apache 2.0 | Modelo publicado y evaluado |
| PaliGemma-3B (Google) | ~3 B | 8 K (aprox., según documentación pública) | Imagen + texto | Gemma license | Modelo publicado y evaluado |

Nota: los datos de los modelos comparables provienen de documentación pública general y no de la información proporcionada en esta ficha; se incluyen solo como referencia orientativa de categoría. No existen benchmarks publicados de doctrine-v2-r2-candidate que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo no promovido ni certificado en calidad: el propio autor lo etiqueta como `RESEARCH_CANDIDATE` y `NOT_PROMOTED`; no debe usarse en producción sin evaluación independiente.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni de tareas multimodales, lo que impide estimar su rendimiento real.
- Evaluación pendiente: los resultados en el holdout disjunto (28 ejemplos) aún no se han publicado.
- Corpus de entrenamiento muy reducido: 208 ejemplos de entrenamiento limitan severamente la generalización y aumentan el riesgo de sobreajuste al dominio doctrinal.
- Riesgo de alucinación: no documentado, pero esperable en un modelo de este tamaño y con datos escasos, especialmente en consultas fuera del dominio doctrinal.
- Idiomas soportados no documentados: no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas.
- Longitud de contexto no disponible: se desconoce la ventana máxima, lo que impide planificar casos de uso con documentos largos.
- Sesgos conocidos: no documentados; la ausencia de información no implica ausencia de sesgos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el estado de investigación y la falta de certificación desaconsejan cualquier despliegue comercial sin validación propia.
- Compatibilidad de despliegue limitada: solo se declara transformers; no hay pesos cuantizados ni soporte confirmado en motores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/doctrine-v2-r2-candidate
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Dataset de recibos de evaluación: https://huggingface.co/datasets/SZLHOLDINGS/model-eval-receipts
- Contrato de lanzamiento (PR 708 del pipeline szl-forge): https://github.com/szl-holdings/szl-forge/pull/708
- Colección "Proofs, Formulas & Doctrine": https://huggingface.co/collections/SZLHOLDINGS/proofs-formulas-and-doctrine
