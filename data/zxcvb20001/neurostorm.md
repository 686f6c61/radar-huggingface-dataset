# zxcvb20001/NeuroSTORM

## Resumen

NeuroSTORM es una colección de checkpoints publicada por el usuario zxcvb20001 en HuggingFace, orientada a experimentos de análisis de fMRI (resonancia magnética funcional). No se trata de un modelo de lenguaje al uso, sino de un conjunto de pesos entrenados para tareas de neuroimagen: predicción de edad y sexo, predicción de fenotipos, clasificación de diagnósticos, re-identificación y clasificación de estados de tarea. El repositorio incluye tanto el checkpoint preentrenado de NeuroSTORM como los checkpoints de modelos baseline utilizados en los experimentos comparativos.

La model card describe una arquitectura de tipo MAE (Masked Autoencoder) para el preentrenamiento, complementada con un checkpoint contrastivo denominado SWIFT. Los checkpoints están organizados por tareas (task1 a task5) y por cohortes de neuroimagen de referencia como ABCD, HCPA, HCPD, HCP-YA, UKB, ABIDE, ADHD200, COBRE, HCP-EP, TransDiag, UCLA y TCP. El repositorio ocupa 43,6 GB y los pesos se almacenan como ficheros `.ckpt` de PyTorch Lightning gestionados con Git LFS.

La relevancia de esta publicación es acotada: se trata de un artefacto de investigación para reproducir experimentos de análisis de fMRI, no de un modelo generalista listo para producción. La información pública disponible es muy limitada (sin pipeline declarado, sin idiomas especificados, sin benchmarks publicados en la model card), por lo que muchas especificaciones habituales quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MAE (Masked Autoencoder) para preentrenamiento; checkpoint contrastivo SWIFT; checkpoints por tarea sobre fMRI |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre series temporales de fMRI) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.ckpt` (PyTorch Lightning), gestionados con Git LFS |

## Arquitectura y entrenamiento

La model card indica que el preentrenamiento de NeuroSTORM se basa en un esquema MAE (Masked Autoencoder), una aproximación habitual en aprendizaje autosupervisado sobre neuroimagen en la que se enmascaran partes de la señal de entrada y el modelo aprende a reconstruirlas. Adicionalmente, se publica un checkpoint contrastivo denominado SWIFT, que presumiblemente se emplea para aprender representaciones mediante objetivos de contraste. No se detalla en la información disponible el número de parámetros, la composición exacta del dataset de preentrenamiento, el número de tokens o volúmenes procesados, ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO (estas últimas no tendrían sentido en este dominio).

Los checkpoints por tarea (`task1` a `task5`) corresponden a ajustes finos supervisados sobre cohortes específicas: predicción de edad y sexo en ABCD, HCPA, HCPD, HCP-YA y UKB; predicción de fenotipos en HCP-YA y objetivos TransDiag/TCP; clasificación de diagnóstico en ABIDE, ADHD200, COBRE, HCP-EP, TransDiag y UCLA; re-identificación sobre HCP-YA; y clasificación de estados de tarea en HCP-YA. No se especifican en la información proporcionada detalles sobre hiperparámetros, esquemas de aumentación de datos, ni innovaciones técnicas adicionales más allá del uso de MAE y del objetivo contrastivo SWIFT.

## Capacidades

- Extracción de representaciones a partir de datos de fMRI mediante un encoder preentrenado con enmascaramiento (MAE).
- Aprendizaje de representaciones contrastivas a través del checkpoint SWIFT.
- Predicción de edad y sexo a partir de fMRI en cohortes ABCD, HCPA, HCPD, HCP-YA y UKB.
- Predicción de fenotipos en HCP-YA y objetivos TransDiag/TCP.
- Clasificación de diagnósticos en ABIDE, ADHD200, COBRE, HCP-EP, TransDiag y UCLA.
- Re-identificación de sujetos sobre HCP-YA.
- Clasificación de estados de tarea sobre HCP-YA.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Investigación en neuroimagen computacional: servir como punto de partida para reproducir los experimentos descritos en la model card sobre las cohortes ABCD, HCP-YA y UKB, permitiendo comparar nuevas propuestas contra los checkpoints publicados.
- Predicción de edad cerebral y sexo: utilizar los checkpoints de `task1` para estimar edad y sexo a partir de fMRI en estudios de envejecimiento o de desarrollo, aprovechando que ya están ajustados sobre cohortes de referencia.
- Clasificación de trastornos psiquiátricos y del neurodesarrollo: emplear los checkpoints de `task3` como baseline para tareas de diagnóstico sobre ABIDE (autismo), ADHD200 (TDAH) o COBRE (esquizofrenia), facilitando comparaciones reproducibles.
- Análisis de estados de tarea: usar los checkpoints de `task5` para clasificar el estado cognitivo o la tarea que realiza un sujeto a partir de su señal de fMRI en HCP-YA.
- Estudios de re-identificación: aplicar el checkpoint de `task4` para evaluar hasta qué punto las representaciones de fMRI permiten re-identificar sujetos, un aspecto relevante en privacidad de datos neurocientíficos.
- Evaluación de modelos baseline: los checkpoints baseline incluidos permiten construir comparativas controladas frente a NeuroSTORM en las mismas tareas y cohortes.
- Desarrollo de pipelines de análisis de fMRI: integrar los checkpoints como componente de extracción de características en flujos de preprocessing y modelado dentro de proyectos de neuroimagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 43,6 GB, lo que incluye múltiples checkpoints; el consumo por checkpoint individual no se detalla.
- GPU recomendadas: no disponible. Al tratarse de modelos sobre fMRI con posible uso de tensores 3D/4D, se requerirían GPU con memoria suficiente para el volumen de entrada, pero no se especifica en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: los checkpoints son ficheros `.ckpt` de PyTorch Lightning, por lo que el despliegue pasa por cargarlos con PyTorch/PyTorch Lightning. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de fMRI comparables ni datos de rendimiento que permitan una comparación cuantitativa. Los checkpoints baseline incluidos en el propio repositorio (bajo las carpetas `task1` a `task5`) constituyen la referencia interna de comparación, pero no se detallan sus nombres, arquitecturas ni resultados.

## Limitaciones y advertencias

- Información pública muy limitada: la model card no especifica número de parámetros, composición del dataset, ni resultados de evaluación, lo que dificulta evaluar su calidad de forma independiente.
- Ámbito restringido a fMRI: no es un modelo de lenguaje ni un modelo multimodal general; no debe esperarse que realice tareas de generación de texto, código o visión.
- Sin benchmarks publicados: no hay métricas reproducibles en la información disponible, por lo que cualquier afirmación de rendimiento requeriría validación propia.
- Riesgo de sobreajuste a cohortes concretas: los checkpoints están ajustados a cohortes específicas (ABCD, HCP-YA, UKB, etc.) y su generalización a otros datasets no está documentada.
- Sesgos potenciales: los datos de neuroimagen suelen presentar sesgos demográficos, de sitio de adquisición y de protocolo; no se documenta ningún análisis de sesgo en la información disponible.
- Licencia MIT: permite uso comercial y modificación, pero al tratarse de pesos derivados de datos de salud, el usuario debe verificar el cumplimiento de las condiciones de uso de las cohortes originales (ABCD, UKB, HCP, etc.), que suelen tener restricciones de acceso y uso.
- Formato `.ckpt`: requiere cargar los pesos con PyTorch Lightning; no hay versiones en safetensors ni GGUF, lo que complica su integración en herramientas estándar de inferencia.
- Sin pipeline declarado: la ausencia de pipeline en HuggingFace implica que no hay una interfaz estandarizada para uso directo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zxcvb20001/NeuroSTORM
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
