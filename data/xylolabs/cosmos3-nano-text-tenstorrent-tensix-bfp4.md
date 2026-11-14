# Xylolabs/Cosmos3-Nano-Text-Tenstorrent-Tensix-BFP4

## Resumen

Cosmos3-Nano-Text-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo de texto de nvidia/Cosmos3-Nano, publicada por Xylolabs para su ejecución en aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo base es un transformer de 8.190.735.360 parámetros (8,19 mil millones) desarrollado por NVIDIA; esta variante conserva únicamente la torre de comprensión de texto (embedding, 36 capas y LM head) y descarta el codificador de visión, el VAE de vídeo y el tokenizador de audio.

La particularidad técnica es la cuantización de las capas lineales a `ttnn.bfloat4_b` (BFP4, 4,5 bits por peso) mediante GPTQ, mientras que el resto de tensores (embedding, LM head y normalizaciones) permanecen en bf16. El resultado es un peso medio de 6,25 bits por parámetro y un empaquetado de 6,40 GB, lo que permite cargar el modelo completo en la memoria DRAM de una NPU Tensix.

Es relevante ahora porque demuestra un flujo de cuantización de precisión mixta orientado a hardware no-GPU, con verificación bit a bit del empaquetado y compatibilidad directa con `Qwen3ForCausalLM` de Transformers. Los tensores están renombrados a la convención de Qwen3, lo que simplifica la integración con el ecosistema existente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3ForCausalLM), 36 capas |
| Parámetros totales | 8.190.735.360 (8,19 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en proyecciones lineales; bf16 en embedding, LM head y normas; media de 6,25 bits/peso |
| Idiomas soportados | no disponible (calibración GPTQ con WikiText-2 y Wikipedia en coreano) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (empaquetado para TT-NN), con `quant4.json` e índice de safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 36 capas con atención y MLP convencionales. Esta exportación aplica GPTQ con búsqueda de exponente por bloque sobre las proyecciones q, k, v, o y gate, up, down de las 36 capas, calibrando con 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP4, de modo que TT-NN las empaqueta sin alterar sus valores; el script `pack_tensix.py` verifica esta igualdad bit a bit y `verify_grid.py` valida la rejilla solo con PyTorch.

Los tensores se renombran a la convención de Qwen3 para cargar como `Qwen3ForCausalLM`. Según la model card, en texto el modelo coincide exactamente con el código de NVIDIA en bf16, y el tokenizador es el de NVIDIA cargado como lo hace su pipeline (Transformers advierte sobre su regex). No se detallan en la información disponible los datos de preentrenamiento del modelo base, el número total de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en formato chat mediante `apply_chat_template`.
- Comprensión y generación de texto en el idioma del modelo base (no se especifican idiomas).
- Carga directa con Transformers como `Qwen3ForCausalLM` en bf16.
- Ejecución en NPU Tenstorrent Tensix mediante tt-metal v0.81.1 (tt-transformers) y tt-forge (tt-xla).
- Empaquetado exacto en `ttnn.bfloat4_b` y también en `ttnn.bfloat8_b` con los mismos valores.
- No incluye visión, vídeo ni audio: esta exportación es solo texto.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: cargar el modelo en Wormhole o Blackhole con 6,40 GB de pesos en DRAM, útil para entornos sin GPU NVIDIA y con requisitos de eficiencia energética.
- Investigación en cuantización de bajo bit: servir como referencia reproducible de GPTQ a BFP4 con verificación bit a bit del empaquetado frente a la rejilla de TT-NN.
- Generación de texto conversacional en dispositivos Tensix: usar el pipeline de chat con `apply_chat_template` para asistentes de texto en hardware dedicado.
- Validación de toolchains: probar tt-metal, tt-transformers y tt-forge con un modelo de 8,19 mil millones de parámetros y precisión mixta, comparando fidelidad de bf16 frente a BFP4.
- Benchmarking de precisión: medir la degradación de calidad entre bf16 y BFP4 en tareas de texto, dado que el autor afirma coincidencia exacta en bf16 con el código de NVIDIA.
- Prototipado de inferencia en simulador: usar `ttsim` (simulador de Blackhole) para validar el empaquetado y el flujo antes de desplegar en silicio real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 6,40 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y búferes.
- Hardware objetivo: NPUs Tenstorrent Tensix (Wormhole y Blackhole).
- GPU consumer: no aplica como destino principal; el modelo puede cargarse en GPU con Transformers en bf16, pero el repositorio está empaquetado para TT-NN.
- Despliegue en Tensix: tt-metal v0.81.1 con tt-transformers (`simple_text_demo.py`, requiere `--use_hf_rope`) y tt-forge (tt-xla, `pjrt-plugin-tt==1.4.0`).
- En tt-forge los pesos se ejecutan en bf16 por defecto; la opción `bfp_bf4` recuantiza en el layout [out, in] de PyTorch, por lo que para 4,5 bits se recomienda tt-transformers.
- En el demo de tt-transformers el LM head se empaqueta en bfloat8_b, por lo que el head no es exacto en ese flujo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Destino |
|---|---|---|---|---|---|
| Xylolabs/Cosmos3-Nano-Text-Tensix-BFP4 | 8,19 mil millones | no disponible | BFP4 + bf16 (6,25 bits/peso) | openmdw-1.1 | NPU Tensix |
| nvidia/Cosmos3-Nano (base) | no disponible | no disponible | bf16 | openmdw-1.1 | GPU/general |
| Modelos Qwen3 de tamaño similar | no disponible | no disponible | múltiples | no disponible | GPU/general |

La comparación con alternativas de la misma categoría (8 mil millones de parámetros para texto) no está disponible en la información proporcionada; el único punto de referencia directo es el modelo base de NVIDIA.

## Limitaciones y advertencias

- Solo texto: se excluyen el codificador de visión, el VAE de vídeo y el tokenizador de audio del modelo base.
- La cuantización BFP4 introduce pérdida de precisión frente a bf16 en las proyecciones lineales; el autor solo garantiza coincidencia exacta en bf16.
- En tt-transformers, el LM head se empaqueta en bfloat8_b en el demo, por lo que el head no es exacto en ese flujo.
- En tt-forge la opción `bfp_bf4` recuantiza en layout [out, in] y no se ha ejecutado de extremo a extremo según la model card.
- El tokenizador de NVIDIA provoca una advertencia de regex en Transformers.
- Idiomas soportados no documentados; la calibración incluyó coreano además de inglés.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Licencia openmdw-1.1: conviene revisar sus términos para uso comercial antes de producción.
- El modelo está pensado para hardware Tensix; su uso en GPU no es el flujo validado por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-Tensix-BFP4
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- tt-metal: https://github.com/tenstorrent/tt-metal
- Licencia: https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-Tensix-BFP4/blob/main/LICENSE
