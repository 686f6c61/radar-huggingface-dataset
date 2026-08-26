# windowsxp811203/Qwen3.8-Flash-Next-NVFP4

## Resumen

Qwen3.8-Flash-Next-NVFP4 es un repositorio de HuggingFace creado por el usuario windowsxp811203 que actúa como *placeholder* para una futura cuantización NVFP4 del modelo Qwen3.8-Flash-Next, un modelo de arquitectura Qwen4 en vista previa con configuración MoE de 125 mil millones de parámetros totales y 6 mil millones activos. El autor del repositorio indica que la publicación de los pesos está pendiente de tres condiciones: la revisión de la licencia del modelo original, la verificación de la nueva arquitectura (que incluye cabezas MTP, atención lineal y un camino de embedding n-grama de 51B) y el soporte de las herramientas de cuantización (llm-compressor, vLLM, llama.cpp) para dicha arquitectura.

En el momento de redactar esta ficha, el repositorio no contiene pesos ni información técnica verificada, por lo que la mayoría de las especificaciones se basan en lo declarado en la model card y en los resultados de búsqueda web sobre la serie Qwen3.8 de Alibaba. La relevancia actual es limitada: se trata de un trabajo en preparación, no de un modelo desplegable, y no se puede evaluar su rendimiento ni sus capacidades hasta que se publique una versión estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), arquitectura Qwen4 preview, no confirmada oficialmente |
| Parametros totales | 125B (segun la model card del autor) |
| Parametros activos | 6B (segun la model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (prevista, no publicada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (en revision) |
| Formato de pesos | no disponible (probablemente safetensors o GGUF, pero no confirmado) |

## Arquitectura y entrenamiento

Según la model card del autor, Qwen3.8-Flash-Next se basa en una arquitectura Qwen4 preview, que es nueva y no coincide con la arquitectura densa de la serie Qwen3.5. El autor menciona tres características estructurales que deben verificarse antes de poder cuantizar correctamente: la disposición de la cabezera MTP (multi-token prediction), el nombre de la atención lineal y la ruta de embedding n-grama de 51B. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF, DPO, etc.). Al ser un placeholder, no hay información oficial de Alibaba sobre este modelo específico más allá de su existencia en el repositorio de Hugging Face y el GitHub de la serie Qwen3.8.

## Capacidades

No se pueden listar capacidades concretas porque el modelo no está publicado y no hay documentación técnica de sus habilidades. La model card solo indica que es una vista previa de la arquitectura Qwen4, sin detallar tareas específicas como generación de código, razonamiento matemático o soporte de herramientas. Hasta que se liberen los pesos y se realicen evaluaciones independientes, cualquier afirmación sobre capacidades sería especulativa.

## Casos de uso

No se pueden definir casos de uso concretos para un modelo que no está disponible. La ficha se actualizará cuando se publique la cuantización NVFP4 y se confirmen las capacidades del modelo base Qwen3.8-Flash-Next.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye tablas de evaluación y los resultados de búsqueda no muestran datos de rendimiento para Qwen3.8-Flash-Next. No se debe asumir rendimiento alguno hasta que el modelo se publique y sea evaluado de forma independiente.

## Requisitos de hardware

Sin datos oficiales de requisitos de hardware, solo se puede estimar a partir del tamaño declarado (125B MoE con 6B activos) y la cuantización NVFP4 prevista:

- VRAM estimada para inferencia: no disponible. Un modelo MoE de 125B con 6B activos en FP16 requiere aproximadamente 250 GB de VRAM, y con NVFP4 podría reducirse a unos 60-70 GB, pero esto es una estimación no confirmada.
- GPU recomendadas: no disponible. Para una cuantización NVFP4 se espera hardware Blackwell o compatible con el formato (p. ej., B200, RTX 5090), pero no hay confirmación.
- Si cabe en GPU de consumo: improbable en configuraciones de 6B activos y 125B totales, incluso cuantizado; requiere GPU de datacenter o despliegue distribuido.
- Opciones de despliegue: no disponibles hasta que se confirme el soporte de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos comparables disponibles en la información proporcionada. La serie Qwen3.8 incluye también Qwen3.8-Max (2.4T parámetros, mencionado en OpenLM.ai), pero no es comparable en tamaño ni en arquitectura. Hasta que se publiquen los pesos y las evaluaciones, no se puede establecer una comparación rigurosa con alternativas como DeepSeek-V3, Mixtral 8x22B o Qwen3-MoE.

## Limitaciones y advertencias

- El repositorio es un placeholder: no contiene pesos ni código ejecutable, y el autor no promete una fecha de publicación.
- La licencia del modelo original no se ha revisado aún, por lo que no se sabe si se permitirán pesos derivados como una cuantización. El uso comercial podría estar restringido.
- La arquitectura Qwen4 preview es nueva y no está soportada por las herramientas de cuantización estándar, por lo que el proceso de publicación puede fallar o retrasarse.
- El autor advierte que si la licencia lo prohíbe o la arquitectura no se puede mapear correctamente, el repositorio lo indicará en lugar de subir un build roto.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma porque el modelo no ha sido evaluado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/windowsxp811203/Qwen3.8-Flash-Next-NVFP4
- Página del modelo oficial Qwen3.8-Flash-Next (upcoming): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Nota del autor sobre la encuesta NVFP4-MTP: https://huggingface.co/datasets/windowsxp811203/nvfp4-mtp-survey
- Repositorios previos del mismo autor como referencia de su proceso de verificación: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated y https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated-NVFP4
- Artículo de OpenLM.ai sobre Qwen 3.8-Max: https://openlm.ai/qwen3.8/
