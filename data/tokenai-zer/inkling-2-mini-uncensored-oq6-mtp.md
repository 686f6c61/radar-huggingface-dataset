# TokenAI-zer/Inkling-2-Mini-Uncensored-oQ6-mtp

## Resumen

Inkling-2-Mini-Uncensored-oQ6-mtp es una cuantización no oficial en formato oMLX oQ6 del modelo Inkling 2 Mini Uncensored, desarrollada por el usuario TokenAI-zer para Apple Silicon. Se trata de un derivado de Inkling 2 Mini de Thinking Machines, un modelo multimodal de mezcla de expertos con 26.400 millones de parámetros totales y 3.400 millones activos, que acepta texto e imagen como entrada y soporta hasta 1.048.576 tokens de contexto. La variante Uncensored es una versión abliterada publicada por OpenUncensored, en la que se han eliminado los rechazos mediante ablación direccional aplicada únicamente a las 20 proyecciones de salida de atención en BF16.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: una arquitectura MoE con capas recurrentes (Inkling2LoopForConditionalGeneration), una cuantización mixta que preserva los expertos NVFP4 originales y recodifica solo una fracción de los pesos, y la inclusión del borrador DSpark para decodificación especulativa integrada en oMLX Lightning MTP. El resultado es un directorio de 16,66 GiB que puede ejecutarse en equipos Apple Silicon de gama alta con memoria unificada abundante.

El modelo está pensado para desarrolladores que trabajan en el ecosistema MLX y necesitan un modelo multimodal de contexto largo sin restricciones de contenido, con licencia Apache 2.0. No es un modelo para producción generalista: es una cuantización de conveniencia para experimentación local en Apple Silicon, sin benchmarks publicados posteriores a la cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Inkling2LoopForConditionalGeneration (MoE con capas recurrentes, multimodal texto-imagen) |
| Parámetros totales | 26.388.646.400 (26,39B) |
| Parámetros activos | 3,4B (según model card del modelo fuente) |
| Longitud de contexto | 1.048.576 tokens en configuración; el contexto usable depende de la memoria disponible |
| Tipos de cuantización | oMLX oQ6: expertos de capas 20-23 en affine 6-bit (recuantizados desde MXFP8); expertos NVFP4 de capas 0-19 sin cambios; atención, embedding y cabeza de vocabulario en affine 8-bit, group size 64; visión y borrador en BF16; router y controladores de bucle en FP32 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (no GGUF ni PyTorch); 4 shards de pesos más mtp.safetensors |
| Bits efectivos por peso | 5,224 (LM + visión); 5,352 incluyendo el borrador DSpark |
| Tamaño del directorio | 16,66 GiB (17,89 GB) |
| Capas | 24 (capas 6 a 17 se ejecutan 3 veces por token) |
| Hidden size | 2304 |
| Expertos | 128 enrutados, top-8 |
| Borrador DSpark (MTP) | 3 capas, 54 tensores, BF16, copiado byte a byte del origen |
| Librería requerida | oMLX 0.8.1 o superior (construido con 0.8.2) |
| Modelo base | OpenUncensored/Inkling-2-Mini-Uncensored |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con un mecanismo de bucle: las capas 6 a 17 se ejecutan tres veces por token, lo que incrementa la profundidad efectiva sin aumentar el número de parámetros. El modelo tiene 24 capas, hidden size de 2304 y 128 expertos enrutados con top-8, lo que da los 3,4B de parámetros activos sobre los 26,4B totales. El modelo fuente ya se distribuyó con los expertos cuantizados: NVFP4 en las capas 0 a 19 y MXFP8 en las capas 20 a 23. La cuantización oQ6 de esta ficha no recodifica los expertos NVFP4 (pasan intactos en todos los niveles), y solo recuantiza los expertos MXFP8 de las capas 20 a 23 a affine 6-bit, además de aplicar affine 8-bit a atención, embedding y cabeza de vocabulario. El encoder de visión y el borrador DSpark permanecen en BF16, y el router y los controladores de bucle en FP32.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La variante Uncensored se obtuvo mediante ablación direccional aplicada únicamente a las 20 proyecciones de salida de atención en BF16 (`attn.wo_ud`, capas 4 a 23); los expertos, el encoder de visión y el borrador DSpark son byte a byte los originales. La innovación técnica destacable de esta ficha es la inclusión del borrador DSpark (`mtp.safetensors`) para decodificación especulativa mediante oMLX Lightning MTP, con una tasa de aceptación de borradores de aproximadamente el 71% en la prueba de humo reportada.

## Capacidades

- Generación de texto y razonamiento en inglés, con modo de razonamiento configurable (`reasoning_effort`).
- Comprensión de imágenes como entrada (pipeline image-text-to-text), con encoder de visión de 0,318B parámetros.
- Procesamiento de contexto largo: hasta 1.048.576 tokens de configuración, limitado por la memoria disponible.
- Decodificación especulativa integrada mediante el borrador DSpark y oMLX Lightning MTP.
- Modo conversacional multi-turno.
- Capacidad de razonamiento multi-paso (thinking mode) según la model card del modelo fuente.
- Sin rechazos en prompts dañinos: 0 de 32 rechazos reportados por OpenUncensored en modo chat y thinking.
- No se documenta soporte de tool calling ni function calling en la información disponible.

## Casos de uso

- Análisis de documentos largos con imágenes intercaladas: el modelo puede procesar hasta 1M tokens de contexto, lo que permite ingerir informes, contratos o expedientes completos con figuras y tablas en una sola pasada, siempre que la memoria unificada del equipo lo permita.
- Experimentación en investigación sobre alineación y seguridad: al ser una versión abliterada con 0 de 32 rechazos reportados, sirve para estudiar el comportamiento de modelos sin capas de rechazo en entornos controlados, comparando con la versión original no abliterada.
- Prototipado local en Apple Silicon: desarrolladores con Mac Studio o MacBook Pro de gama alta pueden ejecutar el modelo con oMLX 0.8.1 o superior sin depender de GPUs NVIDIA ni de servicios en la nube, gracias al formato MLX safetensors y a los 16,66 GiB del directorio.
- Evaluación de decodificación especulativa: el borrador DSpark incluido permite medir la tasa de aceptación y el throughput en distintos prompts, útil para investigar técnicas de aceleración de inferencia en MLX.
- Generación de código asistida en local: la prueba de humo reportada usa un prompt de código de 41 tokens y alcanza 62,8 tok/s en un M5 Max, lo que lo hace viable para autocompletado y generación de fragmentos en editores locales.
- Procesamiento de imágenes con contexto textual extenso: al combinar visión y contexto de 1M tokens, puede usarse para describir y razonar sobre colecciones de imágenes con instrucciones textuales largas, como auditoría de capturas o análisis de documentación técnica escaneada.
- Base para fine-tuning o experimentos de cuantización: al estar en Apache 2.0 y en formato MLX, sirve como punto de partida para probar nuevas recetas de cuantización mixta sobre modelos MoE con expertos pre-cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta cuantización. La model card indica explícitamente que estas variantes no tienen resultados de benchmark posteriores a la cuantización.

Los únicos datos de rendimiento disponibles son de una prueba de humo única, no un benchmark:

| Métrica | Valor |
|---|---|
| Hardware | Apple M5 Max (128 GB) |
| Software | oMLX 0.8.2, Lightning MTP (DSpark) activado |
| Prompt | 41 tokens de código |
| Tokens generados | 300 a 570 |
| `reasoning_effort` | low |
| Tasa de aceptación de borradores | ~71% |
| Velocidad de decodificación | 62,8 tok/s |

La model card advierte que es una sola ejecución corta y que la velocidad varía con la longitud de contexto, el prompt y la aceptación del borrador.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el directorio completo ocupa 16,66 GiB (17,89 GB); se necesita memoria unificada suficiente para pesos, caché KV y contexto. Con contexto de 1M tokens, los requisitos de memoria crecen de forma significativa y la model card indica que el contexto usable depende de la memoria disponible.
- GPU recomendadas: Apple Silicon con memoria unificada abundante. La prueba de humo se realizó en un Apple M5 Max con 128 GB. No se documentan requisitos para GPUs NVIDIA ni AMD, ya que el formato es MLX.
- ¿Cabe en GPU consumer? No en GPUs consumer NVIDIA por formato (MLX); en Apple Silicon, sí en equipos con memoria unificada suficiente, como los configurados con 64 GB o más, aunque el contexto largo exigirá más memoria.
- Opciones de despliegue: oMLX 0.8.1 o superior exclusivamente (construido con 0.8.2). No es compatible con vLLM, llama.cpp, Ollama ni TGI, al ser MLX safetensors. Para GGUF existe una conversión separada de la misma abliteración en Abiray/Inkling-2-Mini-Uncensored-GGUF.
- Latencia y throughput: 62,8 tok/s en decodificación con la prueba de humo descrita (M5 Max, 128 GB, Lightning MTP activado, ~71% de aceptación de borradores). Para comparar, las variantes oQ4 y oQ8 reportan 65,8 tok/s y 61,7 tok/s respectivamente en la misma prueba.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-oQ6-mtp (esta ficha) | 26,39B totales / 3,4B activos | 1.048.576 | oQ6 mixta, 5,224 bits/peso | Apache 2.0 | MLX safetensors | Incluye borrador DSpark; 62,8 tok/s en M5 Max |
| Inkling-2-Mini-Uncensored-oQ4-mtp | 26,39B totales / 3,4B activos | 1.048.576 | oQ4 mixta, 4,915 bits/peso | Apache 2.0 | MLX safetensors | Directorio 15,71 GiB; 65,8 tok/s en la misma prueba |
| Inkling-2-Mini-Uncensored-oQ8-mtp | 26,39B totales / 3,4B activos | 1.048.576 | oQ8, 5,494 bits/peso; expertos capas 20-23 en MXFP8 sin cambios | Apache 2.0 | MLX safetensors | Directorio 17,49 GiB; 61,7 tok/s; el más cercano al checkpoint fuente |
| OpenUncensored/Inkling-2-Mini-Uncensored | 26,39B totales / 3,4B activos | 1.048.576 | NVFP4/MXFP8/BF16 (fuente) | Apache 2.0 | safetensors | Checkpoint fuente sin cuantización oQ; reporta MMLU 78,95% → 79,47% |
| mlx-community/Inkling-2-Mini-oQ4e-mtp | 26,39B totales / 3,4B activos | 1.048.576 | oQ4e | Apache 2.0 | MLX safetensors | Versión original no abliterada en formato oMLX |
| Abiray/Inkling-2-Mini-Uncensored-GGUF | 26,39B totales / 3,4B activos | 1.048.576 | GGUF | Apache 2.0 | GGUF | Misma abliteración en formato GGUF para llama.cpp y similares |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible. Al ser una versión abliterada, la eliminación de rechazos puede aumentar la probabilidad de generar contenido dañino, ofensivo o inexacto sin filtro.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual para esta cuantización; la cuantización es con pérdida y la model card indica que no hay benchmarks posteriores a la cuantización.
- Limitaciones de contexto e idioma: solo se declara soporte de inglés. Aunque la configuración admite 1.048.576 tokens, el contexto usable depende de la memoria disponible y no se documenta el rendimiento en contextos muy largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card recuerda que el modelo y la abliteración pertenecen a Thinking Machines y OpenUncensored, y que TokenAI-zer no está afiliado a ninguno de los dos.
- Compatibilidad: requiere oMLX 0.8.1 o superior; no funciona con vLLM, llama.cpp, Ollama ni TGI. No es GGUF ni PyTorch.
- Sin soporte de tool calling documentado: no se menciona function calling en la información disponible, lo que limita su uso en pipelines de agentes que dependan de esa capacidad.
- Cuantización no oficial: es una conversión de terceros, no avalada por Thinking Machines ni por OpenUncensored; los resultados pueden diferir del checkpoint fuente.
- Los datos de velocidad proceden de una única prueba de humo y no deben interpretarse como un benchmark representativo.

## Enlaces

- Repositorio Hugging Face de esta ficha: https://huggingface.co/TokenAI-zer/Inkling-2-Mini-Uncensored-oQ6-mtp
- Variante oQ4: https://huggingface.co/TokenAI-zer/Inkling-2-Mini-Uncensored-oQ4-mtp
- Variante oQ8: https://huggingface.co/TokenAI-zer/Inkling-2-Mini-Uncensored-oQ8-mtp
- Checkpoint fuente abliterado: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Modelo original de Thinking Machines: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Versión original no abliterada en oMLX: https://huggingface.co/mlx-community/Inkling-2-Mini-oQ4e-mtp
- GGUF de la misma abliteración: https://huggingface.co/Abiray/Inkling-2-Mini-Uncensored-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
