# Xylolabs/gemma-4-12B-it-qat-q4_0-unquantized-Tensix-BFP8

## Resumen

Gemma 4 12B IT QAT para Tenstorrent Tensix (BFP8) es una exportación cuantizada del modelo `google/gemma-4-12B-it-qat-q4_0-unquantized`, empaquetada por Xylolabs. El modelo base es un Gemma 4 de 12B parámetros en su variante instruction-tuned, originalmente entrenada por Google con cuantización consciente (QAT) a Q4_0 y posteriormente desconvolucionada a pesos BF16. Xylolabs toma esos pesos y re-cuantiza las 328 proyecciones declaradas del decoder a formato block-floating-point `bfloat8_b` (8,5 bits por peso) mediante GPTQ, manteniendo embeddings y cabezal en BF16, con el objetivo de ejecutar el modelo de forma eficiente sobre aceleradores Tenstorrent Tensix vía `tt-metal`/`ttnn`.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de portabilidad de un modelo de lenguaje de ~13 000 millones de parámetros a hardware no-GPU (Tenstorrent Blackhole), un ecosistema emergente que compite con CUDA. Por otro, muestra una estrategia de cuantización específica de hardware: el uso de BFP8 sobre rejillas block-floating, que no es un formato estándar de la comunidad (no es GGUF ni GPTQ clásico de 4 bits) y que requiere herramientas de empaquetado propias (`tensix-bfp-gptq`).

El modelo conserva el tokenizador y la plantilla de chat originales de Gemma 4, y la model card declara únicamente inglés y coreano como idiomas soportados. La licencia es Apache-2.0. El checkpoint está pensado para inferencia de texto; la propia tarjeta indica que las rutas de imagen y audio no están cualificadas en esta exportación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, `gemma4_unified`); detalles internos de capas no disponibles en la información proporcionada |
| Parametros totales | 12 966 363 184 (~12,97 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`, 8,5 bits/peso) en 328 proyecciones del decoder vía GPTQ; BF16 en embeddings, cabezal atado y resto de tensores (350 entradas) |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16 empaquetado sobre rejillas block-floating); metadatos en `quant4.json`; requiere Transformers 5.23.0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 en su variante `gemma4_unified`, un transformer decoder-only de aproximadamente 12 966 millones de parámetros. El modelo base fue entrenado por Google con cuantización consciente (QAT) a Q4_0 y luego desconvolucionado a BF16; sobre esa base, Xylolabs aplica GPTQ con amortiguamiento 0,1 y 65 536 tokens de calibración procedentes de WikiText-2 y de Wikipedia en coreano. Las 328 matrices de proyección declaradas del decoder se almacenan en formato `bfloat8_b` (8,5 bits por peso) sobre rejillas block-floating nativas de Tensix, mientras que el embedding, la copia explícita del cabezal atado y el resto de tensores permanecen en BF16.

El empaquetado total ocupa aproximadamente 15,71 GB (9,70 bits por peso almacenado); si se comparte el cabezal atado una sola vez, el peso único baja a unos 13,70 GB (9,165 bits por peso único). Las dos copias explícitas en BF16 del embedding y del cabezal son idénticas byte a byte. La model card indica que las 328 matrices pasan las comprobaciones de rejilla y de empaquetado nativo de TT-NN, y que el ejemplo de empaquetado se valida sobre el simulador Blackhole con TT-NN 0.81.1. No se detallan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés y coreano, con plantilla de chat original de Gemma 4.
- Razonamiento instruction-tuned heredado del modelo base `gemma-4-12B-it`.
- Ejecución de inferencia de texto sobre hardware Tenstorrent Tensix (Blackhole) mediante TT-NN, con empaquetado BFP8 nativo.
- Compatibilidad con `transformers` 5.23.0 y PyTorch en BF16 para ejecución en host/GPU convencional.
- Soporte declarado de `image-text-to-text` en las etiquetas del repositorio, aunque la model card indica que las rutas de imagen y audio **no están cualificadas** en esta exportación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: la evaluación menciona "thinking right / 7" sobre el modelo base, lo que sugiere que el modelo conserva la capacidad de razonamiento extendido del Gemma 4 IT original, aunque no se detalla su funcionamiento en esta exportación.

## Casos de uso

- **Despliegue en aceleradores Tenstorrent Blackhole**: el checkpoint está empaquetado específicamente para TT-NN con `bfloat8_b`, de modo que puede cargarse en DRAM del dispositivo y ejecutarse mediante `tt-metal`, ofreciendo una alternativa a GPU en entornos con hardware Tensix disponible.
- **Investigación en cuantización block-floating**: sirve como referencia reproducible para estudiar el impacto de BFP8 con GPTQ frente a Q4_0 y BF16, con métricas KL publicadas sobre textos de chat en inglés y coreano.
- **Asistente conversacional en inglés y coreano**: el modelo conserva el tokenizador y la plantilla de chat originales, por lo que puede usarse en aplicaciones de atención al cliente o asistentes internos en esos dos idiomas, siempre que se valide la calidad tras la cuantización.
- **Prototipado de pipelines de inferencia en `transformers`**: el quickstart de la model card permite cargar el modelo en BF16 con `AutoModelForCausalLM` y `device_map="auto"`, útil para comparar salidas frente al modelo base antes de portar a Tensix.
- **Validación de herramientas de empaquetado TT-NN**: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar la integridad de las 328 matrices cuantizadas y la ida y vuelta a DRAM del dispositivo, lo que resulta útil en el desarrollo de toolchains para Tensix.
- **Benchmarking de fidelidad de cuantización**: la evaluación KL sobre 8 048 posiciones de chat permite comparar esta exportación (KL 0,00149) frente a Q4_0 (KL 0,03254) y BF16 (KL 0), como caso de estudio de preservación de calidad.
- **Generación de código y matemáticas**: capacidad heredada del modelo base Gemma 4 IT, aunque no se han publicado evaluaciones específicas para esta exportación en la información disponible.

## Benchmarks y rendimiento

La model card incluye una evaluación de fidelidad de la cuantización basada en divergencia KL sobre textos de chat guardados en inglés y coreano (8 048 posiciones puntuadas, cuatro fragmentos de cada uno):

| Perfil | KL media | Aciertos normales / 33 | Aciertos thinking / 7 | Pérdidas normales contadas |
|---|---:|---:|---:|---:|
| BF16 original | 0 | 33 | 7 | — |
| Esta exportación (BFP8) | 0,001488625 | 33 | 7 | 0 |
| Q4_0 equivalente | 0,032543125 | 33 | 7 | 0 |

El suelo de referencia para texto seleccionado con llama.cpp en BF16 es 0,000184375. La puerta relativa "regla 7" se cumple: 0,045743 veces la KL de referencia, dentro del límite de 1,5 veces, sin más de una pérdida contada adicional. La model card aclara que se trata de comprobaciones en host de los pesos guardados y que **no se reporta velocidad**. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **Memoria de dispositivo**: aproximadamente 15,71 GB solo para los pesos retenidos (incluyendo ambas copias BF16 de embedding y cabezal), más espacio para la caché KV y buffers. Compartiendo el cabezal atado, el peso único ronda los 13,70 GB.
- **Hardware objetivo**: aceleradores Tenstorrent Tensix (Blackhole), con empaquetado validado sobre el simulador Blackhole y TT-NN 0.81.1.
- **GPU consumer**: no se especifica compatibilidad con GPU consumer; el tamaño de pesos (~13,7-15,7 GB) excede la VRAM de muchas tarjetas de 8-12 GB, aunque podría caber en GPUs de 16-24 GB en BF16 si se comparte el cabezal.
- **GPU de datacenter**: no se indican modelos recomendados (A100, H100, etc.) en la información proporcionada.
- **Opciones de despliegue**: `transformers` 5.23.0 con PyTorch (BF16, `device_map="auto"`); TT-NN/TT-Metal para Tensix; scripts `pack_tensix.py` y `verify_grid.py` para verificación. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles; la model card indica explícitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-12B-it-qat-q4_0-unquantized-Tensix-BFP8 | ~12,97 B | no disponible | BFP8 (8,5 bits/peso) + BF16 | Apache-2.0 | Hugging Face |
| google/gemma-4-12B-it-qat-q4_0-unquantized (modelo base) | ~12,97 B | no disponible | BF16 (desconvolucionado de Q4_0) | Apache-2.0 (según esta ficha) | Hugging Face |
| Q4_0 equivalente (referencia de la model card) | ~12,97 B | no disponible | Q4_0 | no disponible | no disponible |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables de la misma categoría en la información proporcionada; la comparativa se limita a las variantes de cuantización evaluadas por el autor.

## Limitaciones y advertencias

- **Formato no estándar**: BFP8 sobre rejillas block-floating no es un formato de la comunidad (no es GGUF ni GPTQ clásico de 4 bits); requiere herramientas específicas de Tensix y no se puede cargar con runtimes convencionales sin conversión.
- **Rutas multimodal no cualificadas**: la model card indica que las rutas de imagen y audio no están cualificadas en esta exportación; el ejemplo de uso es solo texto.
- **Idiomas limitados**: solo inglés y coreano declarados; el rendimiento en castellano u otros idiomas no está evaluado.
- **Contexto no especificado**: no se documenta la longitud de contexto soportada, lo que impide planificar aplicaciones de contexto largo.
- **Riesgo de alucinación**: inherente al modelo base Gemma 4 IT; no se han publicado evaluaciones específicas de factualidad para esta exportación.
- **Sesgos**: no se documentan sesgos conocidos en la información proporcionada; se heredan los del modelo base de Google.
- **Licencia**: Apache-2.0 según la model card y las etiquetas del repositorio; se recomienda verificar la licencia del modelo base original de Google antes de uso comercial.
- **Compatibilidad de toolchain**: la model card aclara que `tt-transformers` y `tt-forge` no han sido comprobados con este checkpoint; solo se validan las comprobaciones de representación.
- **Sin datos de velocidad**: no se reporta latencia ni throughput, por lo que no es posible estimar rendimiento en producción a partir de la información disponible.
- **Repo con 0 descargas y 0 likes**: no hay evidencia de uso en producción ni de validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-it-qat-q4_0-unquantized-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia (Apache-2.0): https://huggingface.co/Xylolabs/gemma-4-12B-it-qat-q4_0-unquantized-Tensix-BFP8/blob/main/LICENSE
