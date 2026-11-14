# Xylolabs/Qwen3.5-9B-Tenstorrent-Tensix-BFP8

## Resumen

Qwen3.5-9B-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo Qwen/Qwen3.5-9B, publicada por Xylolabs, específicamente empaquetada para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole) mediante la pila de software tt-metal y TT-NN. El modelo conserva la arquitectura original de Qwen3.5-9B, un transformer híbrido que combina capas de atención clásica con capas de Gated DeltaNet (atención lineal), y aplica cuantización GPTQ sobre la rejilla de punto flotante por bloques bfloat8_b (BFP8) a las capas lineales.

La relevancia de esta ficha radica en que no se trata de una cuantización convencional para GPU, sino de un formato diseñado para que TT-NN empaquete los pesos sin reescalarlos: las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP8, de modo que el empaquetado en el dispositivo no altera su valor. El resultado es un checkpoint de 9.653.104.368 parámetros que ocupa 11,42 GB de memoria de dispositivo para los pesos del modelo de lenguaje, con una media de 10,21 bits por peso.

El modelo está pensado para despliegues en hardware Tenstorrent, no en GPU convencional, y su licencia Apache 2.0 facilita el uso comercial. La model card advierte de que solo se cuantizó y evaluó el modelo de lenguaje, y de que los bloques `mtp` y `visual` se mantienen en bf16 sin cambios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención clásica (8 capas) + Gated DeltaNet / atención lineal (24 capas), con MLP en 32 capas |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BFP8 (bfloat8_b) con GPTQ sobre capas lineales; bf16 en LM head, embeddings, normas y otros tensores; float32 en `linear_attn.A_log` y `linear_attn.norm.weight`. Media de 10,21 bits por peso |
| Idiomas soportados | No disponible (calibración GPTQ en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), empaquetable a TT-NN (`ttnn.bfloat8_b`) |

## Arquitectura y entrenamiento

El checkpoint deriva de Qwen/Qwen3.5-9B, cuya arquitectura combina capas de atención estándar con capas de Gated DeltaNet, un mecanismo de atención lineal recurrente que reduce el coste de contexto largo. La exportación de Xylolabs cuantiza exclusivamente las proyecciones lineales: las proyecciones q, k, v y o de las 8 capas de atención, las proyecciones q, k, v, z, a, b y output de las 24 capas de Gated DeltaNet, y las proyecciones gate, up y down de las 32 capas MLP, todas ellas a bfloat8_b con 8,5 bits por peso. El resto de tensores (LM head, embeddings, normas) permanece en bf16, y dos tensores concretos de las capas de atención lineal se conservan en float32.

La cuantización se realizó con GPTQ sobre la rejilla bfloat8_b, manteniendo el exponente compartido de cada bloque tal como lo fija el empaquetador de TT-NN, y se calibró con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El resultado son 11,42 GB empaquetados con una media de 10,21 bits por peso. El repositorio incluye `quant4.json`, que documenta el formato de cada proyección, además de scripts `pack_tensix.py` y `verify_grid.py` para verificar que el empaquetado no altera ningún valor. No se dispone de información sobre el volumen total de tokens de entrenamiento original ni sobre las fases de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones mediante plantilla de chat (`apply_chat_template`).
- Razonamiento y matemáticas heredados del modelo base Qwen3.5-9B.
- Procesamiento de imagen y texto: el pipeline declarado es `image-text-to-text` y el repositorio conserva el bloque `visual` en bf16, aunque la model card indica que solo se cuantizó y evaluó el modelo de lenguaje.
- Capacidades multilingües del modelo base, con calibración verificada en inglés y coreano; el conjunto completo de idiomas no está documentado.
- Ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole) mediante tt-metal y TT-NN.
- Compatibilidad con `transformers` para carga en bf16 y ejecución de referencia.
- Soporte de tool calling, agentes y modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está empaquetado para que TT-NN lo cargue directamente en DRAM del dispositivo sin reescalado, lo que permite servir Qwen3.5-9B en Wormhole o Blackhole con 11,42 GB de pesos más KV cache y buffers.
- Inferencia de referencia en GPU o CPU: al ser un repositorio `transformers` con safetensors, puede cargarse en bf16 con `device_map="auto"` para validar salidas antes de portar el despliegue a hardware Tenstorrent.
- Verificación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar matriz a matriz que el empaquetado BFP8 no modifica valores, útil en CI de herramientas de compresión.
- Evaluación de fidelidad de cuantización: con una KL media de 0,00074 frente a BF16 y un 98,68 % de top-1, sirve como referencia para comparar otras estrategias de cuantización sobre la misma arquitectura.
- Procesamiento de texto en inglés y coreano: la calibración cubre ambos idiomas, por lo que es adecuado para cargas de trabajo bilingües en esos idiomas.
- Investigación sobre arquitecturas híbridas atención/DeltaNet: al preservar la estructura de 8 capas de atención y 24 de Gated DeltaNet, permite estudiar el comportamiento de modelos híbridos en hardware no GPU.
- Prototipado de asistentes conversacionales: la plantilla de chat y el pipeline `text-generation` permiten integrarlo en aplicaciones multi-turno, siempre que el hardware destino sea Tensix o se use la carga en bf16 como referencia.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.5-9B) | 16 | 17,91 | 0 | 100 | 38 de 40 | - |
| **Este modelo (BFP8)** | 10,21 | 11,422 | 0,00074 | 98,68 | 38 de 40 | 0 |
| Q4_K_M (llama.cpp) | 5,02 | 5,780 | 0,03669 | 90,47 | 37 de 40 | 1 |

Las métricas de KL y top-1 se calculan sobre 16.312 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 11,42 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- Hardware objetivo: aceleradores Tenstorrent Tensix, arquitecturas Wormhole y Blackhole. La demo de tt-metal v0.81.1 ejecuta Qwen3.5-9B en una única Blackhole P150.
- GPU consumer: no es el destino previsto; puede cargarse en bf16 con `transformers` si la VRAM lo permite (el BF16 original ocupa 17,91 GB), pero el formato BFP8 no aporta ventaja fuera de TT-NN.
- Alternativa para dispositivos con menos memoria: la versión BFP4 del mismo autor (Xylolabs/Qwen3.5-9B-Tenstorrent-BFP4).
- Opciones de despliegue: TT-NN / tt-metal (verificado con ttnn 0.81.1 en el simulador ttsim de Blackhole), `transformers` para referencia en bf16. tt-forge (tt-xla) aún no se ha probado con este checkpoint.
- Limitación conocida de la demo de tt-metal: empaqueta las proyecciones MLP gate y up en bfloat4_b, lo que recuantiza estos valores bfloat8_b; para esa demo, la exportación BFP4 coincide mejor con lo que realmente ejecuta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP8) | 9.653.104.368 | No disponible | BFP8 GPTQ, 10,21 bits/peso | Apache 2.0 | Hugging Face, para Tensix |
| Qwen/Qwen3.5-9B (BF16) | 9.653.104.368 | No disponible | BF16, 16 bits/peso | Apache 2.0 | Hugging Face |
| Qwen3.5-9B-Tenstorrent-BFP4 | No disponible | No disponible | BFP4 | Apache 2.0 | Hugging Face, para dispositivos con menos memoria |
| Q4_K_M (llama.cpp) | 9.653.104.368 | No disponible | 4 bits, 5,02 bits/peso | Apache 2.0 (modelo base) | Formato GGUF para llama.cpp |

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; el bloque `visual` y el `mtp` se mantienen en bf16 y no han sido validados en este checkpoint.
- El formato BFP8 está diseñado para TT-NN: fuera de hardware Tensix no ofrece ventajas de memoria ni de velocidad, y la carga en `transformers` se hace en bf16.
- La demo oficial de tt-metal v0.81.1 no ejecuta este checkpoint a su precisión, ya que recuantiza gate y up a bfloat4_b y el LM head y el MTP a bfloat8_b; para esa demo es preferible la exportación BFP4.
- tt-forge (tt-xla) no se ha probado con este checkpoint; su opción `bfp_bf8` recuantiza los pesos en el layout [out, in] de PyTorch.
- La evaluación se limita a 16.312 posiciones de WikiText-2 y Wikipedia en coreano y a 40 preguntas; no hay benchmarks estándar publicados, por lo que la comparación con otros modelos es limitada.
- No se documentan sesgos conocidos, tasas de alucinación ni el conjunto completo de idiomas soportados.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base Qwen3.5-9B deben verificarse por separado.
- El repositorio tiene 65 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-9B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Versión BFP4: https://huggingface.co/Xylolabs/Qwen3.5-9B-Tenstorrent-BFP4
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo Qwen3.5/3.6 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-9B-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
