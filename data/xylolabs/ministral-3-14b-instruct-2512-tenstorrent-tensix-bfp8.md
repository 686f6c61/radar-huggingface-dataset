# Xylolabs/Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP8

## Resumen
Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo de lenguaje Ministral 3 14B Instruct (diciembre de 2025) de Mistral AI, publicada por Xylolabs y optimizada para su ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole) mediante el stack tt-metal/ttnn. El checkpoint conserva únicamente la torre de texto del modelo multimodal original y sustituye las capas lineales de atención y MLP por matrices cuantizadas con GPTQ sobre la rejilla de coma flotante por bloques bfloat8_b (BFP8) que el hardware Tensix empaqueta de forma nativa.

El modelo resuelve el problema de desplegar un LLM instructivo de ~13.500 millones de parámetros en NPUs de Tenstorrent sin conversión manual: los pesos ya vienen en el formato que TT-NN espera, de modo que el empaquetado en dispositivo no altera los valores. Frente a la versión BF16 del modelo base, reduce el peso a 15,61 GB empaquetados (9,25 bits por peso de media) manteniendo el resto de tensores (embeddings, LM head, normas) en bf16.

Es relevante ahora porque el ecosistema Tenstorrent está madurando (ttnn 0.81.1, tt-transformers, tt-forge) y este tipo de exportaciones pre-cuantizadas eliminan una de las principales fricciones para adoptar hardware alternativo a GPU en inferencia de modelos abiertos con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Ministral 3, `Ministral3ForCausalLM`), 40 capas |
| Parámetros totales | 13.506.073.600 (13,5 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; la demo de tt-transformers no implementa el escalado de query más allá de 16.384 posiciones |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`) en q, k, v, o y MLP gate/up/down; bf16 en LM head, embeddings, normas y resto de tensores (9,25 bits/peso de media). Existe variante BFP4 en otro repo |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), con `quant4.json` que describe el formato de cada proyección y `model.safetensors.index.json` para el sharding; tamaño del repo 27,0 GB |

## Arquitectura y entrenamiento
El modelo base es Ministral 3 14B Instruct 2512, un transformer decoder-only de 40 capas con atención multi-cabeza y MLP estándar (gate/up/down), del que esta exportación elimina la torre de visión y su proyector, dejando solo el `text_config` reconvertido a `Ministral3ForCausalLM`. No se dispone de información sobre el volumen de tokens de preentrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la información proporcionada.

La innovación técnica de esta ficha es el proceso de cuantización: GPTQ aplicado directamente sobre la rejilla bfloat8_b de Tenstorrent, de forma que cada bloque comparte un exponente fijado por el empaquetador y las matrices se almacenan como valores bf16 sobre esa rejilla, lo que permite que TT-NN las cargue en DRAM sin recalcular ni alterar valores. La calibración se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El autor reporta verificación de empaquetado exacto en todas las proyecciones de las dos primeras capas y una coincidencia de prefill de 2 capas con transformers de PCC 0,9989 usando ttnn 0.81.1 sobre el simulador Blackhole (ttsim).

## Capacidades
- Generación de texto conversacional e instructiva en 11 idiomas (inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe).
- Razonamiento y respuesta a instrucciones multi-turno mediante plantilla de chat (`apply_chat_template`).
- Generación de código y tareas de conocimiento general, heredadas del modelo base Ministral 3 14B Instruct.
- Ejecución nativa en NPUs Tenstorrent Tensix (Wormhole y Blackhole) mediante tt-metal/ttnn, con soporte en tt-transformers para prefill y decode.
- Carga estándar en transformers con `AutoModelForCausalLM` en dtype bfloat16 y `device_map="auto"` para uso en GPU.
- Solo texto: no incluye capacidades de visión, audio ni tool calling declaradas en la información disponible.

## Casos de uso
- Inferencia en hardware Tenstorrent: despliegue del checkpoint directamente en NPUs Wormhole o Blackhole con tt-metal v0.81.1, aprovechando que los pesos ya están en la rejilla BFP8 y el empaquetado en DRAM no modifica valores; adecuado para equipos que evalúan alternativas a GPU en centros de datos.
- Servicio de chat multilingüe: atención a usuarios en español, francés, alemán, árabe o japonés con un único modelo de 13,5 B y licencia Apache 2.0, sin coste de licencia por uso comercial.
- Asistente de documentación técnica: generación de resúmenes y respuestas sobre manuales largos gracias a la ventana de contexto del modelo base, ejecutado en transformers sobre GPU o en Tensix según disponibilidad.
- Prototipado y validación de pipelines TT-NN: uso del repo como referencia para verificar el empaquetado BFP8 con `pack_tensix.py` y `verify_grid.py` antes de portar otros modelos al stack tt-forge.
- Generación de código en herramientas internas: integración vía `transformers` en scripts de autocompletado o revisión, con la advertencia de que el modelo no declara soporte explícito de function calling.
- Investigación en cuantización: comparación de la calidad BFP8 frente a BFP4 (repo hermano) y frente al BF16 original en tareas de generación, usando la misma calibración y el mismo hardware.
- Despliegue en entornos con restricciones de memoria: los 15,61 GB de pesos empaquetados permiten reservar espacio para KV cache y buffers en dispositivos Tensix de capacidad media, o usar la variante BFP4 en equipos más limitados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de fidelidad del empaquetado: PCC de 0,9989 en un prefill de 2 capas frente a transformers con ttnn 0.81.1 sobre ttsim, y coincidencia exacta (`torch.equal`) en el round-trip de las proyecciones de las dos primeras capas.

## Requisitos de hardware
- VRAM/DRAM estimada: 15,61 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers. El autor recomienda la variante BFP4 en dispositivos con menos memoria.
- GPU: no se especifican modelos concretos; el checkpoint carga en transformers con `dtype="bfloat16"` y `device_map="auto"`, por lo que requiere una GPU con al menos ~16 GB libres para los pesos más el overhead de activaciones y caché.
- NPU: Tenstorrent Wormhole y Blackhole con tt-metal v0.81.1; validado en el simulador Blackhole (ttsim).
- Consumer GPU: no confirmado en la información disponible; por tamaño de pesos, quedaría al límite en tarjetas de 16 GB y holgado en 24 GB o más.
- Despliegue: transformers (principal), tt-metal/ttnn, tt-transformers (demo `simple_text_demo.py`), tt-forge. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La demo de tt-transformers se ejecuta con `batch-1` y configuración de precisión mixta (bfp8 en ff1_3, ff2, wqkv, wo y kv_cache; activaciones mixtas), pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs Ministral-3-14B Tensix BFP8 (esta ficha) | 13,5 B | 32.768 (base) | BFP8 + bf16 mixto | Apache 2.0 | Hugging Face, orientado a Tensix |
| mistralai/Ministral-3-14B-Instruct-2512-BF16 | 13,5 B | 32.768 | BF16 | Apache 2.0 | Hugging Face, uso general |
| Xylolabs Ministral-3-14B Tensix BFP4-MLP | 13,5 B | 32.768 (base) | BFP4 en MLP | Apache 2.0 | Hugging Face, para dispositivos con menos memoria |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias
- Solo texto: la torre de visión y su proyector han sido eliminados; no puede procesar imágenes.
- El modelo base puede presentar sesgos y alucinaciones; no se documentan evaluaciones de sesgo ni de robustez en esta exportación.
- La cuantización BFP8 introduce una pérdida de precisión frente a BF16; el autor solo verifica fidelidad del empaquetado, no la calidad generativa resultante.
- tt-transformers no implementa el escalado de query de Ministral 3 para posiciones más allá de 16.384, lo que limita el uso práctico del contexto completo en esa ruta.
- En la demo de tt-transformers la LM head se empaqueta en bfloat8_b, por lo que la cabeza bf16 de este checkpoint no es exacta en ese entorno.
- Es necesario pasar `--use_hf_rope` en la demo; sin ello se permutan las filas de q y k y se recuantiza el QKV fusionado.
- La calibración GPTQ se hizo sobre WikiText-2 y Wikipedia en coreano, lo que puede sesgar el comportamiento en otros dominios o idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y de las dependencias de Tenstorrent.
- El repo ocupa 27,0 GB, aunque los pesos empaquetados para dispositivo son 15,61 GB; conviene planificar el almacenamiento.

## Enlaces
- Hugging Face: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Variante BFP4: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-Tensix-BFP4-MLP
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación Tenstorrent: https://docs.tenstorrent.com
- tt-metal (rama v0.81.1): https://github.com/tenstorrent/tt-metal
- Licencia: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
