# Zhangdanyang/Qwen3-Coder-30B-A3B-SFT-TH-2epoch

## Resumen
Zhangdanyang/Qwen3-Coder-30B-A3B-SFT-TH-2epoch es un ajuste fino supervisado (SFT) del modelo Qwen3-Coder-30B-A3B, publicado por el usuario Zhangdanyang en HuggingFace bajo licencia Apache 2.0 y con acceso restringido (gated). Se trata de un modelo de generación de texto de arquitectura Mixture-of-Experts (MoE) etiquetado como qwen3_moe, con 30.532.122.624 parámetros totales y un peso de repositorio de 61,1 GB en safetensors. El sufijo del nombre ("SFT-TH-2epoch") sugiere un entrenamiento supervisado de 2 épocas, pero la model card no detalla el dataset ni el significado de "TH".

El modelo parte de la familia Qwen3-Coder, la variante orientada a código de Qwen3, que destaca por sus capacidades de codificación agéntica, soporte de function calling y contexto extendido de hasta 1M tokens en la arquitectura base. Al ser un fine-tune, hereda esta base arquitectónica (MoE con 3,3B parámetros activos por token), aunque los detalles concretos del ajuste no están publicados.

Su relevancia es limitada por el momento: cuenta con 0 descargas y 0 likes, no dispone de resultados de benchmarks publicados y el acceso está restringido, por lo que su evaluación práctica requiere aceptar las condiciones en HuggingFace. Es un modelo a considerar únicamente como experimento de fine-tuning sobre una base sólida, no como un artefacto listo para producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (qwen3_moe) |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3,3B por token (heredado de la arquitectura base Qwen3-Coder-30B-A3B) |
| Longitud de contexto | No disponible en la model card del fine-tune; la arquitectura base Qwen3-Coder-30B-A3B soporta hasta 1M tokens |
| Tipos de cuantizacion | No se listan cuantizaciones en la model card; el repositorio contiene pesos safetensors (61,1 GB, compatible con bf16) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura de transformer decoder-only con capas Mixture-of-Experts, identificada por la etiqueta qwen3_moe y por su librería de referencia (transformers). La arquitectura base Qwen3-Coder-30B-A3B, según la documentación de vLLM, consta de 48 capas, 30,5B parámetros totales y 3,3B parámetros activados por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso equivalente. Está construida sobre la arquitectura base de Qwen3 y añade optimizaciones específicas para codificación agéntica, contexto extendido de hasta 1M tokens y function calling versátil.

En cuanto al entrenamiento, el nombre del modelo indica un ajuste fino supervisado (SFT) de 2 épocas sobre la base Qwen3-Coder-30B-A3B, pero la model card no especifica la composición del dataset, el número de tokens de entrenamiento, ni si se aplicaron etapas adicionales de RLHF o DPO. El significado del sufijo "TH" (posiblemente un idioma o una tarea concreta) no se documenta en la información disponible. No se han publicado detalles sobre innovaciones técnicas adicionales introducidas por este fine-tune.

## Capacidades
No hay información específica publicada sobre las capacidades de este fine-tune más allá de lo que hereda de la arquitectura base. A partir de las características documentadas de Qwen3-Coder-30B-A3B, se pueden inferir las siguientes capacidades potenciales, sujetas a validación empírica:

- Generación de texto y código, incluyendo tareas de codificación agéntica.
- Soporte de function calling / tool calling con un formato de llamada diseñado específicamente.
- Integración con plataformas de codificación agéntica como Qwen Code y CLINE.
- Capacidad de razonamiento multi-paso orientada a agentes.
- Contexto extendido de hasta 1M tokens en la arquitectura base, adecuado para repositorios de código grandes.
- Capacidades multilingües: no disponibles para este fine-tune concreto.
- Modo "thinking" u otras capacidades especiales: no disponibles.

## Casos de uso
Dado que se trata de un fine-tune con documentación mínima y acceso restringido, los casos de uso son potenciales y requieren validación previa:

- Asistencia a la programación en IDE: el modelo puede integrarse en entornos como CLINE o Qwen Code para autocompletado, refactorización y generación de código, apoyándose en su soporte de function calling y en el contexto extendido de la arquitectura base.
- Agentes autónomos de modificación de repositorios: con hasta 1M tokens de contexto potencial, podría procesar bases de código extensas y ejecutar tareas multi-paso (leer ficheros, editar, ejecutar tests) mediante tool calling.
- Automatización de revisiones de código en CI/CD: integrado en pipelines, podría generar sugerencias de parches o detectar errores a partir de diffs y contexto del repositorio.
- Generación de tests unitarios: el modelo puede producir pruebas a partir de fragmentos de código o especificaciones, tarea habitual en flujos de integración continua.
- Documentación técnica automatizada: generación de docstrings, README y comentarios a partir del código fuente.
- Experimentación académica en fine-tuning: sirve como caso de estudio de SFT sobre un MoE de 30B para investigadores interesados en adaptación de modelos de código.
- Traducción o adaptación de código entre lenguajes: si el dataset de ajuste lo soporta (no confirmado), podría abordar migraciones de código.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM en bf16/fp16: los pesos ocupan aproximadamente 61 GB (30,5B parámetros × 2 bytes), por lo que se requiere al menos una GPU de 80 GB (H100, A100 80GB) con margen muy justo, o bien 2 GPUs de 80 GB para soportar contexto largo y KV cache.
- VRAM en int8 (8-bit): alrededor de 31 GB, viable en una A100 40GB o en 2× RTX 4090 de 24 GB.
- VRAM en 4-bit: aproximadamente 16-17 GB, cabe en una RTX 4090 (24 GB), RTX 3090 (24 GB) o L40S (48 GB).
- GPU recomendadas: H100 80GB o A100 80GB para precisión completa; RTX 4090, RTX 3090 o L40S para cuantización de 4 bits en entornos consumer o prosumer.
- Compatibilidad con GPU de consumo: sí, en cuantizaciones de 4 bits con GPUs de 24 GB o superiores.
- Opciones de despliegue: vLLM (existe documentación específica para Qwen3-Coder-30B-A3B en vLLM Ascend), TGI y SGLang para pesos safetensors. llama.cpp y Ollama requieren un fichero GGUF que no se distribuye en este repositorio, por lo que habría que convertirlo manualmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Zhangdanyang/Qwen3-Coder-30B-A3B-SFT-TH-2epoch | 30,5B / 3,3B | No disponible (base: hasta 1M) | apache-2.0 | Gated en HuggingFace, 0 descargas |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | 30,5B / 3,3B | 1M tokens (arquitectura base) | apache-2.0 | Público en HuggingFace |
| Qwen3-30B-A3B (arquitectura base) | 30,5B / 3,3B | No disponible | apache-2.0 | Público en HuggingFace |

No se dispone de datos de rendimiento comparados entre estas variantes en la información proporcionada.

## Limitaciones y advertencias
- Ausencia total de benchmarks publicados: no hay evidencia empírica de que el fine-tune mejore o degrade la base.
- Model card prácticamente vacía: se desconoce el dataset de SFT, el significado de "TH", el número de tokens de entrenamiento y si hubo RLHF o DPO.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace antes de descargar, lo que limita la reproducibilidad inmediata.
- Sin descargas ni likes: no existe validación comunitaria ni retroalimentación de uso real.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación específica para este fine-tune.
- Sesgos: no documentados; al derivar de Qwen3, hereda los sesgos presentes en los datos de preentrenamiento de la base.
- Limitaciones de idioma: no se especifican los idiomas soportados; el comportamiento multilingüe es incierto.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado conviene verificar las condiciones de la base Qwen3-Coder-30B-A3B y del acceso gated.
- Uso en producción desaconsejado sin una evaluación previa exhaustiva, dado el nivel de documentación disponible.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Zhangdanyang/Qwen3-Coder-30B-A3B-SFT-TH-2epoch
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Repositorio GitHub de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Documentación de vLLM Ascend para Qwen3-Coder-30B-A3B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3-Coder-30B-A3B.html
- Imagen Docker de Qwen3-Coder: https://hub.docker.com/r/ai/qwen3-coder
- Paper de referencia (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
