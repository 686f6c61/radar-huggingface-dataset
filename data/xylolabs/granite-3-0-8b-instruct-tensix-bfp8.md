# Xylolabs/granite-3.0-8b-instruct-Tensix-BFP8

## Resumen

Xylolabs/granite-3.0-8b-instruct-Tensix-BFP8 es una cuantización del modelo ibm-granite/granite-3.0-8b-instruct, publicada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo, sino de una conversión de pesos en la que las capas lineales (proyecciones de atención q, k, v, o y las capas MLP gate, up, down en las 40 capas del transformer) se han redondeado al formato block-floating-point `ttnn.bfloat8_b` (BFP8, 8,5 bits por peso) mediante GPTQ. El resto de tensores (embeddings, LM head atado, normas) permanece en bf16.

El modelo conserva la arquitectura, el tokenizador y el comportamiento conversacional del Granite 3.0 8B Instruct original de IBM, con 8.372.187.136 parámetros totales. La motivación es permitir ejecutar el modelo en hardware Tensix sin que el empaquetador TT-NN tenga que volver a redondear: los ficheros se distribuyen en bf16, pero cada valor ya está alineado a la rejilla BFP8, de modo que el empaquetado es exacto.

Es relevante para quienes despliegan modelos en aceleradores Tenstorrent y necesitan una versión del Granite 3.0 Instruct que reduzca el peso de los pesos (8,87 GB empaquetados frente a 16,34 GB en bf16) manteniendo una fidelidad alta respecto al modelo original, con una KL media de 0,00120 y un top-1 del 98,47 % frente a bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Granite 3.0 de IBM), cuantizado a BFP8 en capas lineales |
| Parametros totales | 8.372.187.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en atención y MLP; bf16 en embeddings, LM head, normas y resto de tensores; media de 8,69 bits por peso |
| Idiomas soportados | no disponible (el modelo base Granite 3.0 es multilingüe, pero la model card no detalla la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (valores en bf16 ya alineados a la rejilla BFP8); índice `model.safetensors.index.json` y `quant4.json` con el formato por proyección |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Granite 3.0 8B Instruct de IBM: un transformer decoder-only con 40 capas, atención multi-cabeza y capas MLP con proyecciones gate, up y down. Este repositorio no entrena el modelo desde cero ni aplica RLHF/DPO adicional: parte del checkpoint `ibm-granite/granite-3.0-8b-instruct` (revisión `5af56291a1c6ca9056df597aab0cff53edabddb0`) y aplica una cuantización GPTQ sobre la rejilla `bfloat8_b` de TT-NN.

El proceso de calibración utilizó 65.536 tokens de WikiText-2 y de Wikipedia en coreano, en texto plano y con la plantilla de chat. Cada bloque BFP8 comparte un exponente propio determinado por el empaquetador de TT-NN. El resultado son 8,87 GB empaquetados con 8,69 bits por peso de media. La model card indica que el modelo se probó con ttnn 0.81.1 sobre `ttsim`, el simulador Blackhole de Tenstorrent, y no sobre hardware físico. También advierte de que `tt-transformers` (tt-metal v0.81.1) no es utilizable con este checkpoint porque no soporta Granite y carga el modelo como tipo Llama, ignorando los multiplicadores de embedding, atención, residual y logits; una prueba de prefill de 2 capas dio una PCC de 0,20 frente a transformers. `tt-forge` (tt-xla) aún no se ha probado con este checkpoint.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Granite 3.0 8B Instruct.
- Razonamiento y respuesta a instrucciones mediante plantilla de chat (`apply_chat_template`).
- Generación de código y matemáticas (capacidades del modelo base, no re-evaluadas en esta cuantización).
- Soporte de tool calling / function calling (propio del modelo base Granite 3.0 Instruct).
- Capacidades multilingües del modelo base (la model card no especifica la lista de idiomas).
- Ejecución en NPU Tensix de Tenstorrent (Wormhole y Blackhole) mediante TT-NN, con empaquetado BFP8 sin re-redondeo.
- Compatible con `transformers` para inferencia estándar en GPU/CPU con pesos bf16.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: empaquetar los pesos con TT-NN en Wormhole o Blackhole sin pérdida adicional de precisión, ya que los valores ya están en la rejilla BFP8. Adecuado para equipos que ya trabajan con el stack tt-metal.
- Servicio conversacional en hardware Tensix: usar el modelo como backend de chat con la plantilla de Granite, reduciendo el peso de los pesos a 8,87 GB empaquetados frente a 16,34 GB en bf16, lo que libera DRAM en la NPU.
- Inferencia en `transformers` sobre GPU: cargar el checkpoint en bf16 con `device_map="auto"` para prototipar y validar respuestas antes de pasar al hardware Tensix.
- Evaluación de fidelidad de cuantización: usar los scripts `pack_tensix.py` y `verify_grid.py` para comprobar que el empaquetado no altera ningún valor, útil en pipelines de validación de cuantizaciones.
- Asistentes de código en entornos con aceleradores Tenstorrent: aprovechar las capacidades de generación de código del modelo base en infraestructura que no dispone de GPU NVIDIA.
- Investigación en cuantización block-floating-point: el repositorio sirve como referencia de una conversión GPTQ a BFP8 con métricas de KL y top-1 publicadas frente a bf16 y Q4_K_M.

## Benchmarks y rendimiento

La model card publica métricas de fidelidad respecto a bf16 (no de tarea):

| Modelo | Bits por peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base) | 16 | 16,34 | 0 | 100 | 25 de 33 | - |
| Este modelo (BFP8) | 8,69 | 8,871 | 0,00120 | 98,47 | 23 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,84 | 4,943 | 0,05921 | 89,30 | 23 de 33 | 0 |

Las métricas de KL y top-1 cubren 16.248 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat. Las 33 respuestas se evalúan con comprobaciones automáticas. El Q4_K_M se generó con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix, sha256 `c80faa54f48274f2b818d754c65551538551941442e2a7338578bea479a21eb8`. El criterio de aceptación del autor (KL media ≤ 1,5 veces la de Q4_K_M y como máximo una respuesta perdida más) se cumple con holgura. No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,7 GB (tamaño del repo), lo que requiere GPU con al menos 24 GB para dejar margen de contexto.
- VRAM estimada empaquetado en BFP8 en Tensix: 8,87 GB de pesos, más espacio para activaciones y caché KV.
- GPU recomendadas para la ruta `transformers`: A100 40/80 GB, H100, RTX 4090 (24 GB) o RTX A6000 (48 GB). En consumer, una RTX 4090 o 3090 (24 GB) es el mínimo práctico.
- NPU objetivo: Tenstorrent Wormhole y Blackhole, con TT-NN (probado con ttnn 0.81.1 sobre el simulador `ttsim`, no en hardware físico).
- Opciones de despliegue: `transformers` (ruta probada en la model card), TT-NN con `ttnn.as_tensor` y `ttnn.bfloat8_b`, y potencialmente tt-forge/tt-xla (no probado con este checkpoint). `tt-transformers` no es compatible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP8) | 8,37 B | no disponible | BFP8, 8,69 bits/peso | Apache-2.0 | Hugging Face, orientado a Tensix |
| ibm-granite/granite-3.0-8b-instruct (bf16) | 8,37 B | no disponible | bf16, 16 bits/peso | Apache-2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 8,37 B | no disponible | 4,84 bits/peso | Apache-2.0 | Generado localmente con llama.cpp |

## Limitaciones y advertencias

- El modelo no se ha ejecutado en hardware Tensix físico; solo se ha validado en el simulador `ttsim` de Blackhole con ttnn 0.81.1.
- `tt-transformers` (tt-metal v0.81.1) no soporta Granite y produce resultados incorrectos (PCC 0,20 en prefill de 2 capas); no debe usarse con este checkpoint.
- `tt-forge` (tt-xla) no se ha probado con este checkpoint; sus opciones `bfp_bf8` y `bfp_bf4` re-redondean los pesos en el layout [out, in] de PyTorch, lo que puede alterar los valores.
- La cuantización introduce una ligera degradación: KL media de 0,00120 y top-1 del 98,47 % frente a bf16, con 2 respuestas menos correctas de 33.
- Riesgo de alucinación y sesgos heredados del modelo base Granite 3.0 8B Instruct; no se documentan sesgos específicos en la model card.
- La lista de idiomas soportados no está detallada en la información disponible; la calibración incluyó inglés y coreano, pero no se garantiza un rendimiento uniforme en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar los términos del modelo base de IBM y las dependencias del stack Tenstorrent.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tensix-BFP8
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-8b-instruct
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tensix-BFP8/blob/main/LICENSE
