# Xylolabs/Qwen3.5-9B-Base-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3.5-9B-Base-Tenstorrent-Tensix-BFP4 es una cuantización del modelo base Qwen/Qwen3.5-9B-Base, publicada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura original de Qwen3.5 (transformer híbrido con atención clásica y capas Gated DeltaNet) y cuantiza sus capas lineales a formatos de coma flotante por bloques nativos del hardware: `bfloat4_b` (BFP4) y `bfloat8_b` (BFP8), que TT-NN empaqueta sin modificar los valores.

El interés principal reside en que es un export listo para desplegar en aceleradores Tenstorrent con un peso medio de 7,12 bits por parámetro y 7,96 GB empaquetados, lo que reduce a menos de la mitad el espacio de pesos frente a los 17,91 GB en BF16. La cuantización BFP4 se realizó con GPTQ y búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano; los tensores BFP8 se obtuvieron por redondeo al más cercano.

El checkpoint es de tipo base (no instruction-tuned): continúa texto, no sigue instrucciones. Solo se cuantizó y evaluó el modelo de lenguaje; los módulos `mtp` y `visual` permanecen en bf16 sin cambios. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: atención clásica (8 capas) + Gated DeltaNet (24 capas), con MLP en 32 capas; incluye módulos `mtp` y `visual` |
| Parametros totales | 9.653.104.368 (≈9,65 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) y BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso); media de 7,12 bits/peso; pesos no cuantizados en bf16 y algunos tensores originales en float32 |
| Idiomas soportados | no disponible (calibración en inglés y coreano; evaluación sobre texto en inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 19,3 GB; pesos empaquetados 7,96 GB), compatible con `transformers` y con TT-NN/tt-metal |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B-Base emplea una arquitectura híbrida: 8 capas con atención clásica (proyecciones q, k, v, o) y 24 capas con Gated DeltaNet (proyecciones q, k, v, z, a, b y salida), más 32 capas con MLP (gate, up, down). El export de Xylolabs cuantiza únicamente las capas lineales: las proyecciones de atención y de Gated DeltaNet (q, k, v, z, salida) y las del MLP a `bfloat4_b`; los tensores a y b de Gated DeltaNet a `bfloat8_b`. El LM head, los embeddings, las normas y el resto de tensores se mantienen en bf16, salvo `linear_attn.A_log` y `linear_attn.norm.weight`, que conservan float32. Los módulos `mtp` y `visual` quedan intactos en bf16.

La cuantización BFP4 se realizó con GPTQ y una búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano; los tensores BFP8 se obtuvieron por redondeo al más cercano. Los valores cuantizados se almacenan como bf16 sobre la rejilla BFP4 o BFP8, de modo que TT-NN los empaqueta sin alterarlos; el script `pack_tensix.py` verifica matriz a matriz que ningún valor cambia al empaquetar. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de texto por continuación (modelo base, sin ajuste por instrucciones): completa secuencias a partir de un prefijo.
- Razonamiento y conocimiento general heredados del modelo base Qwen3.5-9B-Base; no se han publicado evaluaciones específicas de estas capacidades en la información disponible.
- Procesamiento de imagen y texto: la pipeline declarada es `image-text-to-text` y el módulo `visual` se conserva en bf16, aunque solo se cuantizó y evaluó el modelo de lenguaje.
- Capacidad multilingüe: no disponible como lista cerrada; la calibración y la evaluación cubren inglés y coreano.
- Soporte de tool calling / function calling: no disponible (el checkpoint es base, no instruction-tuned).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking: no disponible.
- El tokenizador conserva la plantilla de chat del modelo base, pero el modelo no está ajustado para seguir instrucciones.

## Casos de uso

- Despliegue en NPU Tenstorrent: el caso principal del export es ejecutar el modelo en Wormhole o Blackhole con TT-NN, aprovechando que los pesos BFP4/BFP8 se empaquetan sin pérdida de valores y ocupan 7,96 GB de memoria de dispositivo para los pesos del modelo de lenguaje.
- Investigación en cuantización de bajo rango: sirve como referencia reproducible de GPTQ con búsqueda de exponente por bloque sobre formatos de coma flotante por bloques, con scripts de verificación (`pack_tensix.py`, `verify_grid.py`) incluidos en el repositorio de código.
- Evaluación comparativa de formatos: permite contrastar BFP4 (7,12 bits/peso) frente a Q4_K_M (5,02 bits/peso) en términos de KL y top-1 sobre texto en inglés y coreano, usando el mismo checkpoint de origen.
- Generación de texto y completado en pipelines de investigación: al ser un modelo base, encaja en tareas de continuación, generación de borradores y evaluación de perplejidad, no en asistentes conversacionales directos.
- Fine-tuning posterior sobre el checkpoint cuantizado: al estar en formato safetensors y cargarse con `transformers`, puede servir de punto de partida para adaptaciones, aunque la cuantización limita la precisión de los gradientes.
- Prototipado en simulador: el autor verificó el empaquetado con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole, lo que permite validar flujos de despliegue sin hardware físico.
- Procesamiento multimodal en el hardware objetivo: el módulo `visual` se mantiene en bf16, por lo que el checkpoint conserva la vía de imagen-texto del modelo base, aunque no se ha evaluado.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.5-9B-Base) | 16 | 17,91 | 0 | 100 | 28 de 28 | - |
| Este modelo (BFP4/BFP8) | 7,12 | 7,965 | 0,02453 | 91,83 | 26 de 28 | 0 |
| Q4_K_M (llama.cpp) | 5,02 | 5,780 | 0,02644 | 91,72 | 27 de 28 | 0 |

Metodología declarada por el autor: KL y top-1 sobre 8.188 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en formato de texto plano; las respuestas corresponden a 28 prompts cortos con comprobación automática, en forma de completado y con 3 ejemplos. "Perdidas" indica respuestas correctas en BF16 que fallan o se rompen en la versión cuantizada; los empates cercanos no se contabilizan. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia. El criterio de aceptación del autor (KL media como máximo 1,5 veces la de Q4_K_M y como máximo una respuesta perdida más) se cumple: 0,93 veces la KL de Q4_K_M y 0 respuestas perdidas.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 7,96 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole; el empaquetado se verificó con ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole).
- GPU convencionales: no se han publicado requisitos ni pruebas de inferencia en GPU para este checkpoint; el repositorio ocupa 19,3 GB y la carga con `transformers` en bf16 requiere del orden de 18 GB de memoria, pero es una estimación derivada del tamaño en BF16, no un dato publicado.
- Cabe en GPU de consumo: no disponible como dato verificado.
- Opciones de despliegue: TT-NN/tt-metal sobre Tensix (soporte verificado del empaquetado); `transformers` con `AutoModelForCausalLM` para carga en bf16. tt-transformers y tt-forge no se probaron con este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL media a BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Xylolabs BFP4) | 9,65 mil M | no disponible | BFP4/BFP8, 7,12 bits/peso | 0,02453 | Apache-2.0 | Hugging Face, orientado a Tensix |
| Qwen3.5-9B-Base (BF16) | 9,65 mil M | no disponible | BF16, 16 bits/peso | 0 | Apache-2.0 | Hugging Face |
| Q4_K_M de Qwen3.5-9B-Base (llama.cpp) | 9,65 mil M | no disponible | Q4_K_M, 5,02 bits/peso | 0,02644 | Apache-2.0 | Generado por el autor para la comparación |

No se dispone de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) ni de comparaciones con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo base: no está ajustado por instrucciones; no debe usarse como asistente conversacional sin un ajuste posterior.
- Solo se cuantizó y evaluó el modelo de lenguaje; el comportamiento de los módulos `mtp` y `visual` en el export no está validado.
- La evaluación se limita a 8.188 posiciones de texto en inglés y coreano y a 28 prompts cortos; no hay datos de benchmarks estándar ni de otros idiomas.
- La cuantización introduce una degradación medible: KL media de 0,02453 frente a BF16 y top-1 del 91,83 % frente al 100 %.
- El soporte de despliegue está verificado únicamente a nivel de empaquetado con ttnn 0.81.1 sobre simulador; tt-transformers y tt-forge no se probaron con este checkpoint.
- No hay información publicada sobre sesgos, riesgo de alucinación ni limitaciones de contexto o idioma específicas de este export.
- Licencia Apache-2.0: permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.5-9B-Base.
- El checkpoint requiere hardware Tenstorrent para aprovechar su formato; en GPU convencionales se carga en bf16 y se pierde la ventaja de tamaño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-9B-Base-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-9B-Base-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
