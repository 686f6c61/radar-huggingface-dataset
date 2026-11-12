# Xylolabs/phi-4-Tensix-BFP4-Down8

## Resumen

Phi-4-Tensix-BFP4-Down8 es una versión cuantizada de microsoft/phi-4, un modelo de lenguaje de 14.659.507.200 parámetros desarrollado originalmente por Microsoft Research. La variante ha sido producida por Xylolabs y está específicamente optimizada para su ejecución en las unidades de procesamiento Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole), empleando formatos de coma flotante por bloques (block floating point) propios del stack TT-NN: `bfloat4_b` y `bfloat8_b`.

El modelo resuelve un problema de despliegue: reducir el peso en memoria de Phi-4 desde 29,32 GB en BF16 hasta 11,559 GB empaquetados, manteniendo una fidelidad alta respecto al modelo original (KL medio de 0,02224 frente a BF16 y 92,90 % de top-1 en la evaluación del autor). Para ello aplica GPTQ con búsqueda de exponente por bloque a las proyecciones de atención y a las capas gate/up del MLP, y redondeo al más cercano para las proyecciones down del MLP.

Es relevante ahora porque los formatos BFP4/BFP8 son nativos del hardware Tensix y permiten aprovechar aceleradores de inferencia alternativos a las GPU convencionales. La arquitectura subyacente es un transformer decoder-only (Phi-4), con licencia MIT heredada del modelo base y pesos en safetensors listos para cargarse con transformers o empaquetarse directamente en TT-NN.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-4, checkpoint en layout Llama: `LlamaForCausalLM`) |
| Parámetros totales | 14.659.507.200 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en q/k/v/o y MLP gate/up; BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en MLP down; resto en BF16. Media de 6,31 bits por peso |
| Idiomas soportados | Inglés (etiqueta `en`); calibración adicional con Wikipedia en coreano |
| Licencia | MIT |
| Formato de pesos | safetensors (valores BF16 ya alineados a la rejilla BFP4/BFP8), índice `model.safetensors.index.json`, metadatos en `quant4.json` |

## Arquitectura y entrenamiento

El modelo base Phi-4 es un transformer decoder-only denso de aproximadamente 14,66 mil millones de parámetros. Esta variante no reentrena el modelo: parte de microsoft/phi-4 y cuantiza sus capas lineales. Las matrices fusionadas de q, k, v y gate-up del checkpoint original se separan en el layout Llama, conservando los mismos valores. Los tensores cuantizados se almacenan en BF16 pero con cada valor ya situado sobre la rejilla de BFP4 o BFP8, de modo que TT-NN los empaqueta sin transformación adicional.

La cuantización de los tensores `bfloat4_b` emplea GPTQ con búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los tensores `bfloat8_b` se obtienen por redondeo al más cercano. El reparto es: atención (q, k, v, o) y MLP gate/up en 40 capas a BFP4; MLP down en 40 capas a BFP8; LM head, embeddings, normas y demás tensores permanecen en BF16. El resultado son 6,31 bits por peso de media y 11,56 GB empaquetados. El autor indica que la verificación se realizó con ttnn 0.81.1 sobre ttsim (simulador de Blackhole), no sobre hardware físico, y que tt-transformers y tt-forge no se probaron con este checkpoint.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat compatible con `apply_chat_template`.
- Razonamiento y matemáticas heredados de Phi-4 (no se documentan evaluaciones específicas en esta variante).
- Generación de código, según las capacidades del modelo base.
- Inferencia en hardware Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo de pesos BFP4/BFP8.
- Carga estándar con transformers (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`).
- Compatibilidad declarada con text-generation-inference y endpoints (etiquetas del repositorio).
- Soporte de tool calling, agentes o multi-step reasoning: no disponible en la información proporcionada para esta variante.
- Capacidades de visión o audio: no disponibles (modelo de texto).

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. Cargar el checkpoint con TT-NN en Wormhole o Blackhole para servir Phi-4 con 11,56 GB de pesos empaquetados en lugar de 29,32 GB en BF16, liberando DRAM del dispositivo.
- Servicio de chat en inglés con transformers: usar el snippet de quickstart con `apply_chat_template` para asistentes conversacionales; la fidelidad medida (KL 0,02224, top-1 92,90 %) respalda respuestas cercanas al modelo BF16.
- Evaluación de pipelines de cuantización BFP: servir como referencia reproducible para comparar GPTQ con exponente por bloque frente a esquemas como Q4_K_M de llama.cpp (KL 0,0180, top-1 93,65 %), ambos con 29 de 33 respuestas correctas.
- Investigación en formatos block floating point: el par de scripts `pack_tensix.py` y `verify_grid.py` permite validar que cada matriz empaquetada no altera ningún valor, útil para auditar el pipeline antes de producción.
- Prototipado en simulador: ejecutar con ttnn 0.81.1 sobre ttsim (Blackhole) para validar kernels y memoria antes de disponer de hardware, dado que el autor no probó el modelo en silicio real.
- Integración en stacks compatibles con TGI: la etiqueta `text-generation-inference` y `endpoints_compatible` permite exponer el modelo tras una API HTTP en entornos que ya usan ese servidor.
- Baseline de razonamiento ligero: con 14,66 mil millones de parámetros y licencia MIT, encaja en flujos de generación de código o resolución de problemas matemáticos donde se prioriza coste de memoria sobre el estado del arte.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (microsoft/phi-4) | 16 | 29,32 | 0 | 100 | 29 de 33 | - |
| **Este modelo** | 6,31 | 11,559 | 0,02224 | 92,90 | 29 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,94 | 9,059 | 0,0180 | 93,65 | 29 de 33 | 0 |

Las métricas de KL y top-1 cubren 16.280 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en formato plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix (sha256 `79d54da5367cc1371a4224217dc1aa43bc9ac8990725b2ec8440774da2fdc9d6`). El autor advierte que estas cifras miden cercanía a BF16, no calidad de tarea, y que no se midió velocidad en dispositivo.

## Requisitos de hardware

- VRAM/RAM estimada: 11,559 GB de pesos empaquetados en BFP; con carga en transformers en BF16 el repositorio ocupa 29,3 GB, por lo que se recomienda al menos 32 GB de memoria de GPU o uso de `device_map="auto"` con offload.
- GPU recomendadas para la ruta transformers: A100 40/80 GB, H100, o RTX 4090 (24 GB) solo con cuantización adicional o descarga parcial; no se documentan pruebas específicas.
- Hardware objetivo: NPU Tensix de Tenstorrent (Wormhole, Blackhole). El autor solo validó el empaquetado con ttnn 0.81.1 sobre ttsim (simulador de Blackhole), no en hardware real.
- Cabe en GPU de consumo: no de forma completa en BF16 en 24 GB; la ruta nativa BFP está pensada para Tensix, no para CUDA.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), TT-NN (`ttnn.as_tensor` con `bfloat4_b`/`bfloat8_b` y `TILE_LAYOUT`), text-generation-inference según etiquetas del repositorio. tt-transformers y tt-forge no se probaron con este checkpoint.
- Latencia y throughput: no disponibles; el autor no midió velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Phi-4 Tensix BFP4 Down8) | 14,66 B | No disponible | BFP4/BFP8 (6,31 bits/peso) | MIT | Hugging Face (0 descargas, 0 likes en el momento del registro) |
| microsoft/phi-4 (BF16) | 14,66 B | No disponible | BF16 | MIT | Hugging Face (modelo base) |
| Phi-4 Q4_K_M (llama.cpp) | 14,66 B | No disponible | 4,94 bits/peso | MIT | Generado localmente con llama.cpp v0.9.0 |

La comparación relevante es de fidelidad y tamaño: este modelo ocupa 11,559 GB frente a 9,059 GB de Q4_K_M y 29,32 GB de BF16, con un KL de 0,02224 (1,24 veces el de Q4_K_M) y 0 respuestas perdidas en ambos casos. La ventaja diferencial no es la compresión máxima, sino el empaquetado nativo para Tensix sin pérdida adicional al cargar en TT-NN.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; la calibración incluyó coreano, pero no se garantiza calidad multilingüe general.
- No se han publicado evaluaciones de calidad de tarea (MMLU, HumanEval, GSM8K) para esta variante; las métricas disponibles miden solo cercanía a BF16.
- Riesgo de alucinación heredado del modelo base; la cuantización añade una degradación medible (KL 0,02224, top-1 92,90 % frente a 100 % en BF16).
- El checkpoint no se ha probado en hardware Tensix real, solo en el simulador ttsim con ttnn 0.81.1; el rendimiento en Wormhole o Blackhole físico está sin verificar.
- tt-transformers y tt-forge no se ejecutaron con este checkpoint, por lo que su integración en esos stacks no está validada.
- El repositorio tiene 0 descargas y 0 likes en el momento del registro, lo que implica ausencia de validación comunitaria.
- Licencia MIT permite uso comercial, pero el autor distribuye el modelo "as is", sin garantía, y no está afiliado ni respaldado por Tenstorrent.
- Los scripts `pack_tensix.py` y `verify_grid.py` tienen licencia Apache-2.0, distinta de la del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/phi-4-Tensix-BFP4-Down8
- Modelo base: https://huggingface.co/microsoft/phi-4
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/phi-4-Tensix-BFP4-Down8/blob/main/LICENSE
