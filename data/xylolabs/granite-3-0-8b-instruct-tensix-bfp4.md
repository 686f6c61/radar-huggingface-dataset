# Xylolabs/granite-3.0-8b-instruct-Tensix-BFP4

## Resumen

Granite-3.0-8b-instruct-Tensix-BFP4 es una cuantización del modelo instructivo ibm-granite/granite-3.0-8b-instruct (8.372.187.136 parámetros) publicada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole) mediante el formato de coma flotante por bloques `ttnn.bfloat4_b` (BFP4). Las capas lineales de atención (q, k, v, o) y del MLP (gate, up, down) de las 40 capas del transformer se han cuantizado con GPTQ a 4.5 bits por peso, mientras que el resto de tensores (embeddings, LM head, normas y demás) permanecen en bf16.

El resultado son 4,78 bits por peso de media, un checkpoint empaquetado de 4,89 GB (frente a los 16,34 GB en bf16) y un repositorio de 16,7 GB que incluye los pesos en safetensors listos para que TT-NN los empaque sin recuantización. El modelo base es un transformer decoder-only de IBM con licencia Apache 2.0, y esta variante conserva esa licencia.

La relevancia de esta ficha es doble: por un lado, documenta un caso poco habitual de cuantización pensada para hardware no-GPU (NPUs Tensix); por otro, advierte de que el soporte real en el stack de Tenstorrent es todavía parcial: el autor solo lo ha probado en `ttsim` (simulador Blackhole con ttnn 0.81.1), no en hardware físico, y confirma que `tt-transformers` no es utilizable con este checkpoint por falta de soporte de Granite.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base: IBM Granite 3.0 8B Instruct) |
| Parámetros totales | 8.372.187.136 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4.5 bits/peso en capas lineales) con GPTQ; resto en bf16; media de 4,78 bits/peso |
| Idiomas soportados | no disponible (la calibración usó texto en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores ya en la rejilla BFP4), más `quant4.json` con el formato de cada proyección |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de IBM (familia Granite 3.0) con 40 capas, cuyos tensores de atención q/k/v/o y MLP gate/up/down se han cuantizado a BFP4 mediante GPTQ con búsqueda de exponente por bloque. La calibración se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El LM head está atado al embedding, y tanto este como las normas y el resto de tensores se mantienen en bf16, igual que en el modelo original.

La innovación técnica principal es el uso del formato de coma flotante por bloques `bfloat4_b` de TT-NN: cada valor se almacena ya en la rejilla BFP4 dentro de los safetensors en bf16, de modo que el runtime de Tenstorrent empaqueta los pesos sin pérdida adicional. El autor proporciona scripts (`pack_tensix.py`, `verify_grid.py`) para comprobar que ningún valor cambia al empaquetar. No se documentan en la información disponible detalles sobre el dataset de preentrenamiento original, RLHF/DPO ni innovaciones de decodificación del modelo base.

## Capacidades

- Generación de texto conversacional e instructiva, heredada del modelo base Granite 3.0 8B Instruct.
- Razonamiento y respuesta a preguntas de conocimiento general (el autor evalúa 33 preguntas cortas con comprobación automática).
- Ejecución en aceleradores Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo de pesos BFP4.
- Compatibilidad con `transformers` para carga en bf16 en GPU/CPU (los pesos son legibles como un modelo estándar).
- Soporte de plantilla de chat (`apply_chat_template`).
- Capacidades de tool calling, agentes, visión o audio: no disponibles en la información proporcionada (dependen del modelo base, no documentadas aquí).

## Casos de uso

- Despliegue en hardware Tenstorrent: el checkpoint está pensado para cargarse en NPUs Wormhole o Blackhole vía TT-NN, aprovechando el empaquetado nativo BFP4 y reduciendo la huella de memoria a 4,89 GB frente a 16,34 GB en bf16. Adecuado para entornos que ya dispongan de aceleradores Tensix.
- Inferencia de bajo consumo en memoria: con 4,78 bits/peso de media, permite servir un modelo de 8B en dispositivos con DRAM limitada, siempre que el runtime soporte BFP4.
- Validación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten verificar bit a bit que el empaquetado BFP4 no altera valores, útil para ingenieros que auditen flujos GPTQ.
- Evaluación de fidelidad a bf16: el autor publica métricas de KL y top-1 frente al modelo original, lo que sirve como referencia para comparar estrategias de cuantización (BFP4 frente a Q4_K_M de llama.cpp).
- Prototipado en simulador: al haberse probado en `ttsim` (simulador Blackhole), permite desarrollar y depurar kernels TT-NN sin hardware físico.
- Chat conversacional en inglés o coreano: la calibración incluyó texto en ambos idiomas, por lo que la degradación esperada es menor en esas lenguas, aunque no se documenta el soporte multilingüe oficial.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamaño (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base) | 16 | 16,34 | 0 | 100 | 25 de 33 | - |
| **Este modelo (BFP4)** | 4,78 | 4,886 | 0,06716 | 89,47 | 22 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,84 | 4,943 | 0,05921 | 89,30 | 23 de 33 | 0 |

Las métricas de KL y top-1 cubren 16.248 posiciones de texto en inglés y coreano (test de WikiText-2, Wikipedia en coreano), en formato plano y con plantilla de chat. Las 33 respuestas corresponden a prompts cortos con comprobación automática. El autor indica que estas cifras miden cercanía a BF16, no calidad de tarea.

## Requisitos de hardware

- VRAM/DRAM estimada: 4,89 GB empaquetado en BFP4; 16,34 GB si se carga en bf16 con `transformers`.
- Aceleradores objetivo: Tenstorrent Wormhole y Blackhole (NPUs Tensix).
- Pruebas realizadas: únicamente en `ttsim` (simulador Blackhole) con ttnn 0.81.1; no probado en hardware físico según el autor.
- GPU consumer: al cargarse en bf16 vía `transformers`, requiere aproximadamente 16-17 GB, por lo que cabe en GPUs de 24 GB (RTX 3090, RTX 4090) y no en tarjetas de 8-12 GB sin cuantización adicional.
- Opciones de despliegue: TT-NN (tt-metal v0.81.1) para Tensix; `transformers` para GPU/CPU en bf16. `tt-transformers` no es compatible (sin soporte de Granite). `tt-forge` (tt-xla) no se ha probado con este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este modelo (BFP4) | 8,37B | no disponible | BFP4 GPTQ (4,78 bits/peso) | Apache 2.0 | Tenstorrent Tensix |
| ibm-granite/granite-3.0-8b-instruct (BF16) | 8,37B | no disponible | bf16 | Apache 2.0 | GPU/CPU |
| Q4_K_M de llama.cpp (mismo checkpoint) | 8,37B | no disponible | Q4_K_M (4,84 bits/peso) | Apache 2.0 | CPU/GPU (llama.cpp) |

La comparativa se limita al modelo base y a la cuantización Q4_K_M generada por el propio autor, ya que no se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Soporte de runtime incompleto: `tt-transformers` no soporta Granite y carga el checkpoint como modelo tipo Llama, ignorando los multiplicadores de embedding, atención, residual y logits; en la versión BFP8 del modelo, un prefill de 2 capas dio PCC 0,20 frente a `transformers`.
- No probado en hardware físico: solo se ha validado en el simulador `ttsim` con ttnn 0.81.1.
- `tt-forge` (tt-xla) no se ha ejecutado con este checkpoint; su opción `bfp_bf4` recuantiza en PyTorch con layout [out, in].
- Las métricas publicadas miden fidelidad a BF16, no calidad de tarea; el autor lo advierte explícitamente.
- Pérdida de precisión: 89,47 % de top-1 y KL media de 0,06716 frente a BF16, con 3 respuestas menos correctas que el modelo original (22 frente a 25 de 33).
- Idiomas oficialmente soportados no documentados; la calibración solo cubrió inglés y coreano.
- Longitud de contexto no disponible en la información proporcionada.
- Riesgo de alucinación y sesgos: no documentados específicamente para esta variante; heredados del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento del modelo cuantizado recae en el desplegador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tensix-BFP4
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-8b-instruct
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tensix-BFP4/blob/main/LICENSE
