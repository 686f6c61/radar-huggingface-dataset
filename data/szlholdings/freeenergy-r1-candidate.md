# SZLHOLDINGS/freeenergy-r1-candidate

## Resumen

freeenergy-r1-candidate es un modelo multimodal de tipo image-text-to-text desarrollado por SZLHOLDINGS, presentado como candidato de investigación y no promocionado a producción. Se trata de un ajuste fino (SFT) sobre el modelo base SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, que a su vez deriva de la familia Qwen 3.5 en su variante de aproximadamente 0,8 mil millones de parámetros. El modelo está entrenado sobre un corpus denominado free-energy-reasoning-sft-v1, orientado a razonamiento y a la relación precisión-complejidad, con 214 ejemplos de entrenamiento y 28 de validación en un split disjunto por grupos.

La relevancia de esta ficha es limitada pero informativa: el modelo se publica bajo un contrato de lanzamiento fail-closed (launch contract #708) con pines inmutables, recepción de admisión y holdout disjunto, lo que refleja una práctica de trazabilidad poco habitual en modelos de investigación. Sin embargo, el propio autor declara explícitamente que no está promocionado, no está certificado en calidad y no cuenta con benchmarks amplios. Las descargas y los likes en Hugging Face son cero en el momento de la consulta, y la evaluación en el holdout está pendiente de publicación.

Arquitectura y tamaño: el dato real de safetensors indica 873.438.784 parámetros totales (aproximadamente 0,87 mil millones), con un repositorio de 1,8 GB. La longitud de contexto, los idiomas soportados y los tipos de cuantización no están disponibles en la información proporcionada. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen 3.5 (tag `qwen3_5`) |
| Parametros totales | 873.438.784 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Modelo base | SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3 (revision 0340c300052e248367a3407aa493ef72a0da79fe) |
| Corpus de entrenamiento | free-energy-reasoning-sft-v1 (214 train / 28 holdout, split disjunto por grupos, seed 3407) |
| Estado | research-candidate, no promocionado, no certificado en calidad |
| Tamano del repo | 1,8 GB |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura Qwen 3.5 en su variante de aproximadamente 0,8 mil millones de parámetros, con capacidad de procesamiento conjunto de imagen y texto (pipeline image-text-to-text). El ajuste fino se realiza mediante SFT sobre el modelo base szl-receiptagent-qwen35-0.8b-sft-v3, que ya incorpora un ajuste previo orientado a agentes de recepción (receiptagent). No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset ni sobre si se aplicaron etapas de RLHF o DPO.

La innovación destacable no es arquitectónica sino de gobernanza: el entrenamiento se ejecuta a través de un contrato de lanzamiento fail-closed (launch contract #708 del pipeline szl-forge) con pines inmutables, recepción de admisión (ADMITTED_FOR_TRAINING, Apache 2.0), holdout disjunto por grupos y un suelo de corpus (corpus floor). El corpus free-energy-reasoning-sft-v1 se centra en razonamiento y en la relación precisión-complejidad, con 214 ejemplos de entrenamiento y 28 de validación. Los recibos de evaluación se publican por oleada en el dataset model-eval-receipts. No se documentan técnicas como decodificación especulativa, atención lineal ni modos de pensamiento explícitos.

## Capacidades

- Generación de texto y razonamiento: el corpus de entrenamiento se orienta explícitamente a razonamiento y a la relación precisión-complejidad, aunque no se detallan las tareas concretas.
- Procesamiento multimodal image-text-to-text: el pipeline declarado indica capacidad de recibir imagen y texto conjuntamente.
- Conversación multi-turno: el tag `conversational` sugiere uso en diálogo, sin especificación de ventana de contexto.
- Integración con endpoints compatibles: el tag `endpoints_compatible` indica compatibilidad con despliegues tipo endpoint.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada; el modelo base pertenece a una línea de agentes de recepción, pero no se documenta en esta ficha.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión avanzada, audio): no disponible más allá del pipeline image-text-to-text.

## Casos de uso

- Investigación sobre razonamiento precisión-complejidad: el modelo sirve como sujeto de estudio para analizar cómo un SFT pequeño (0,87 mil millones de parámetros) responde a un corpus específico de razonamiento, con holdout disjunto y recibos por oleada que permiten reproducir la evaluación.
- Validación de pipelines de gobernanza de entrenamiento: al estar entrenado bajo un contrato fail-closed con pines inmutables, es útil como caso de prueba para auditar trazabilidad de linaje, admisión de corpus y separación de holdout en herramientas como szl-forge.
- Prototipado de agentes de recepción multimodal: al derivar de szl-receiptagent-qwen35-0.8b-sft-v3, puede emplearse en experimentos de extracción y diálogo sobre documentos con imagen, siempre en entorno de investigación y no en producción.
- Pruebas de despliegue en hardware modesto: con 873 millones de parámetros y 1,8 GB de pesos en safetensors, es adecuado para experimentar con inferencia en GPU de consumo y medir latencia en pipelines de transformers.
- Evaluación comparativa de ajustes finos pequeños: sirve como referencia para estudiar el efecto de corpus pequeños (214 ejemplos) frente a modelos base de la misma familia Qwen 3.5.
- Docencia y demostraciones de trazabilidad: el modelo y sus recibos permiten ilustrar en un blog o curso cómo se documenta un entrenamiento con pines inmutables y estado honesto (no promocionado, no certificado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara que la evaluación en el holdout disjunto por grupos está pendiente de publicación y que no existe benchmark amplio. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de pesos (1,8 GB en safetensors, 873 millones de parámetros) se estima que en FP16 requiere del orden de 1,7-2 GB solo para pesos, más memoria para activaciones y contexto, aunque esta estimación no está confirmada por el autor.
- GPU recomendadas: no disponible en la información proporcionada.
- GPU de consumo: no confirmado; por tamaño, es plausible que quepa en GPU de consumo con memoria suficiente, pero el autor no lo documenta.
- Opciones de despliegue: la librería declarada es transformers; el tag `endpoints_compatible` sugiere despliegue vía endpoints. No se confirman vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Disponibilidad |
|---|---|---|---|---|---|
| freeenergy-r1-candidate | 873.438.784 | no disponible | Apache 2.0 | research-candidate, no promocionado | Hugging Face, 0 descargas |
| SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3 (modelo base) | ~0,8 mil millones (no confirmado) | no disponible | no disponible en esta ficha | ajuste SFT previo | Hugging Face |
| Familia Qwen 3.5 (variante ~0,8B) | ~0,8 mil millones | no disponible en esta ficha | no disponible en esta ficha | modelos base de referencia | Hugging Face |

No se dispone de datos de rendimiento comparables ni de benchmarks publicados para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Estado explícito de candidato de investigación: no promocionado, no certificado en calidad y sin benchmark amplio; no debe usarse en producción sin validación propia.
- Evaluación pendiente: los resultados en el holdout disjunto por grupos no están publicados, por lo que no hay evidencia pública de rendimiento.
- Corpus de entrenamiento muy pequeño: 214 ejemplos de entrenamiento y 28 de validación, lo que limita la generalización y aumenta el riesgo de sobreajuste.
- Riesgo de alucinación: no cuantificado ni documentado; en un modelo de 0,87 mil millones de parámetros con SFT reducido, el riesgo es relevante y debe asumirse.
- Sesgos conocidos: no disponible; no se documenta ningún análisis de sesgos.
- Limitaciones de contexto e idioma: no disponible; no se especifican ventana de contexto ni idiomas soportados.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el estado de investigación y la falta de certificación desaconsejan su despliegue comercial sin pruebas adicionales.
- Trazabilidad: los pines y recibos están documentados, pero la reproducibilidad completa depende de la publicación de los recibos por oleada en model-eval-receipts.
- Advertencia de seguridad: la model card incluye contenido citado como datos de referencia; no debe interpretarse como instrucciones operativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/freeenergy-r1-candidate
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Dataset de recibos de evaluación: https://huggingface.co/datasets/SZLHOLDINGS/model-eval-receipts
- Contrato de lanzamiento (pull request #708): https://github.com/szl-holdings/szl-forge/pull/708
- Repositorio de la organización: https://github.com/szl-holdings/szl-forge
- Paper, blog o demo adicional: no disponible en la información proporcionada.
