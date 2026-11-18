# SourceHat-Labs/Sage-S2.1-Flash-EXL3-4.25bpw

## Resumen

Sage-S2.1-Flash-EXL3-4.25bpw es una cuantización EXL3 de precisión mixta del modelo `internlm/Sage-S2.1-Flash`, publicada por SourceHat-Labs. No se ha aplicado abliteración ni ajuste fino: el artefacto modifica únicamente la precisión de los pesos, preservando el comportamiento del modelo original. El resultado es un checkpoint de aproximadamente 89.000 millones de parámetros con un tamaño de repositorio de 178,5 GB, pensado para inferencia eficiente con la librería exllamav3.

El modelo base emplea una arquitectura híbrida con bloques de atención KDA (Kimi Delta Attention) y DSA (DeepSeek Sparse Attention), además de capas FFN con mezcla de expertos enrutados (288 expertos por bloque) y expertos compartidos. La cuantización mantiene una ventana de contexto nativa de 1.048.576 tokens y conserva los pesos MTP (multi-token prediction) integrados, calibrados desde BF16 original y almacenados a 8 bits.

La relevancia de esta ficha radica en que documenta un artefacto de cuantización de precisión mixta no uniforme: el objetivo declarado del decodificador principal es 4,25 bits por peso, pero la asignación real varía por bloque y por matriz (4, 5, 6 y 7 bits según la proyección), con embeddings, cabeza de salida y visión retenidos a 16 bits. Es un caso útil para quienes necesitan desplegar modelos de gran contexto en hardware limitado sin recurrir a cuantizaciones uniformes de menor fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención KDA y DSA, FFN MoE con 288 expertos enrutados y expertos compartidos, MTP integrado |
| Parametros totales | 89.077.670.750 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (metadatos nativos preservados) |
| Tipos de cuantizacion | EXL3 de precisión mixta; objetivo 4,25 bpw en el decodificador principal; asignación real 4,2543856698 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT (según README upstream fijado; código y pesos) |
| Formato de pesos | safetensors (librería exllamav3) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que alterna bloques con atención KDA y bloques con atención DSA. Los bloques DSA incorporan proyecciones específicas (`indexer.wq_b`, `kv_a_mqa`, `q_a`, `q_b`) además de la proyección de salida. Las capas FFN combinan una parte densa con una parte MoE de 288 expertos enrutados y un conjunto de expertos compartidos, lo que explica el elevado número de parámetros totales frente a los activos por token (no documentados en la información disponible). El modelo integra además pesos MTP (multi-token prediction) en el bloque físico 45, lo que sugiere soporte para decodificación especulativa o predicción multi-token.

La cuantización se realizó una sola vez desde BF16 original con 128 secuencias de calibración de 4.096 tokens cada una: 32 de matemáticas, 32 de ciencia, 32 de código y 32 de herramientas multi-turno. La asignación de precisión es no uniforme: los bloques enrutados 3, 4, 5 y 39-44 usan 5 bits, el resto de bloques enrutados usan 4 bits; atención y expertos compartidos usan 6 bits, salvo `kv_a_proj_with_mqa` en los bloques 3 y 43, que usa 7 bits; las FFN densas usan 5 bits; embeddings, cabeza de salida y visión se retienen a 16 bits. Los proyectores científicos se copian sin cambios. La calibración MTP usa estados ocultos principales precedentes emparejados con el siguiente token de entrada. El artefacto incluye el código fuente de runtime EXL3 específico de Sage (`sage-exl3-runtime-source.tar.gz`), que debe compilarse contra dependencias compatibles de PyTorch/CUDA; la build original usó `TORCH_CUDA_ARCH_LIST=8.0` sobre GA100.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base.
- Razonamiento matemático y científico, con calibración específica en esos dominios.
- Generación y comprensión de código, calibrado con secuencias de código.
- Uso de herramientas y function calling en escenarios multi-turno (calibración dedicada a "multi-turn tools").
- Capacidades de visión, dado que el artefacto retiene pesos de visión a 16 bits.
- Ventana de contexto muy larga: 1.048.576 tokens nativos, adecuada para documentos extensos y conversaciones prolongadas.
- Soporte de predicción multi-token (MTP) integrado, potencialmente útil para decodificación especulativa.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos: con 1.048.576 tokens de contexto, el modelo puede ingerir árboles de código extensos y responder preguntas sobre arquitectura, dependencias o cambios entre versiones sin trocear el repositorio.
- Asistentes de investigación científica: la calibración incluye secuencias de ciencia y matemáticas, lo que lo hace adecuado para resumir papers, extraer resultados experimentales y verificar derivaciones.
- Atención al cliente multi-turno: la calibración con herramientas multi-turno y el contexto largo permiten mantener historiales de conversación extensos y consultar bases de conocimiento internas mediante tool calling.
- Generación de código en pipelines de CI/CD: puede integrarse como revisor automático de pull requests, generando explicaciones o detectando regresiones en diffs largos gracias a la ventana de contexto.
- Procesamiento de documentación legal o contractual: la ventana de un millón de tokens permite comparar contratos completos, detectar cláusulas contradictorias y resumir anexos sin truncar.
- Despliegue en hardware limitado con exllamav3: al estar cuantizado a ~4,25 bpw con precisión mixta, permite servir un modelo de 89.000 millones de parámetros en GPUs de gama alta para consumidores o en nodos con menos VRAM que la versión BF16.
- Análisis multimodal de documentos: los pesos de visión retenidos a 16 bits permiten procesar capturas, diagramas o páginas escaneadas junto con texto largo en un mismo contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 178,5 GB (166,248 GiB) en pesos cuantizados; se necesita al menos esa cantidad de VRAM para cargar el modelo completo en memoria, más overhead de runtime y caché KV para el contexto.
- GPU recomendadas: el artefacto se compiló originalmente para GA100 (A100). Para cargar los 178,5 GB en una sola GPU se requiere una GPU con 192 GB o más (H200, B200); en A100 de 80 GB o H100 de 80 GB sería necesario repartir el modelo entre varias GPUs.
- Cabe en consumer GPU: no en una sola unidad; la RTX 4090 (24 GB) no puede alojar el modelo completo. Sería necesario un despliegue multi-GPU o una cuantización adicional más agresiva no incluida en este artefacto.
- Opciones de despliegue: exllamav3 con el código de runtime específico de Sage incluido en el repositorio (`sage-exl3-runtime-source.tar.gz`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sage-S2.1-Flash-EXL3-4.25bpw | 89.077.670.750 | 1.048.576 | EXL3 mixta ~4,25 bpw | MIT | Hugging Face (SourceHat-Labs) |
| internlm/Sage-S2.1-Flash (base) | no disponible | no disponible | BF16 (original) | MIT | Hugging Face (internlm) |
| Alternativas de mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización modifica la precisión de los pesos; aunque se calibra por bloques y matrices, puede introducir degradación en tareas sensibles a precisión numérica, especialmente en matemáticas y código.
- No se ha aplicado abliteration ni ajuste fino, por lo que los sesgos y alineamiento del modelo base se heredan sin cambios; no se documentan sesgos específicos.
- Riesgo de alucinación inherente a modelos generativos de este tamaño; no se documentan evaluaciones de factualidad.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingüe ni calidad por idioma.
- La licencia MIT se declara según el README upstream fijado, pero el artefacto incluye código fuente EXL3 con sus propias licencias y avisos de copyright; es necesario revisar `UPSTREAM-LICENSE-NOTICE.md` y las licencias del runtime antes de uso comercial.
- El runtime requiere compilar el código fuente incluido contra PyTorch/CUDA compatibles; no se distribuyen extensiones compiladas específicas de máquina, lo que añade complejidad de despliegue.
- El repositorio no incluye las trazas de calibración, preguntas de benchmark ni generaciones, por lo que no es posible reproducir la evaluación de calidad de la cuantización.
- El contexto de 1.048.576 tokens requiere caché KV considerable; el coste de memoria y latencia en contextos largos no está documentado.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria disponible.

## Enlaces

- Hugging Face: https://huggingface.co/SourceHat-Labs/Sage-S2.1-Flash-EXL3-4.25bpw
- Modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash
- Repositorio de código fuente EXL3 de Sage incluido en el artefacto: `sage-exl3-runtime-source.tar.gz`
- Documentación de precisión incluida: `PRECISION-ALLOCATION.csv`, `LAYER-PRECISION.csv`, `TENSOR-INVENTORY.csv`, `quantization_config.json`, `precision-map.json`
- Procedencia y hashes: `sage-provenance.json`, `artifact-files.json`, `runtime-source-identity.json`, `SHA256SUMS`
- Aviso de licencia upstream: `UPSTREAM-LICENSE-NOTICE.md`, `UPSTREAM-README.md`
