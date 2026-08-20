# xv0y5ncu/gemma-4-E2B-it-GLQ-trellis-3inst-4bpw

## Resumen

`gemma-4-E2B-it-GLQ-trellis-3inst-4bpw` es una cuantización GLQ (4.0 bits por peso) del modelo multimodal `google/gemma-4-E2B-it`, publicada por el usuario xv0y5ncu. El objetivo es reducir el tamaño de los pesos en memoria (de unos 10.2 GB en bf16 a 5.04 GiB cargados) manteniendo una calidad razonable mediante una combinación de cuantización trellis-coded (QTIP TCQ, variante 3inst), transformada de Hadamard aleatorizada (RHT) y LDLQ. Los pesos se mantienen comprimidos en memoria y se decodifican sobre la marcha mediante kernels CUDA fusionados.

El modelo base es un transformer multimodal de Google, con 2.453 millones de parámetros, orientado a tareas any-to-any (texto, imagen, vídeo y audio). Esta cuantización solo afecta al decodificador de texto; las torres de visión y audio se conservan en su formato nativo. La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de la familia Gemma 4 en GPUs con VRAM limitada (24-32 GB) sin perder demasiada precisión, y es compatible con vLLM y Transformers mediante el plugin `glq`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (decoder de texto cuantizado; torres de vision y audio nativas) |
| Parametros totales | 2.453.008.963 |
| Parametros activos | no disponible (no se especifica si el modelo base usa MoE) |
| Longitud de contexto | no disponible (la familia Gemma 4 soporta hasta 256K tokens) |
| Tipos de cuantizacion | GLQ 4.0 bits/peso uniforme (trellis-coded QTIP TCQ 3inst + RHT + LDLQ) |
| Idiomas soportados | no disponible (la familia Gemma 4 soporta mas de 140 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con kernels GLQ, requiere `glq >= 0.8.0`) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E2B-it` es un transformer multimodal de Google con 2.453 millones de parametros, disenado para tareas any-to-any (texto, imagen, video y audio). Pertenece a la familia Gemma 4, que incluye arquitecturas densas y MoE, con ventanas de contexto de hasta 256K tokens y soporte multilingue amplio. La cuantizacion GLQ aplica un esquema de cuantizacion con codebook trellis-coded (QTIP, variante 3inst) combinado con transformada de Hadamard aleatorizada (RHT) y cuantizacion LDLQ, a una tasa uniforme de 4.0 bits por peso. El proceso de calibracion se realizo con 128 muestras de WikiText-2 con 2048 tokens por muestra. Los pesos cuantizados se almacenan en formato safetensors y se decodifican en tiempo de ejecucion mediante kernels CUDA fusionados que interpretan el trellis en disposicion MMA-fragment. No se ha publicado informacion sobre el entrenamiento del modelo base ni sobre el uso de RLHF o DPO; la model card de la cuantizacion tampoco detalla esos datos.

## Capacidades

- Generacion de texto y razonamiento multistep con modo "thinking" (confirmado en la evaluacion AIME-2026).
- Soporte multimodal: entrada de imagen, video y audio (las torres se conservan en formato nativo; el decodificador de texto es el que se cuantiza).
- Soporte de tool calling y uso con agentes de codigo: la model card incluye configuraciones para pi-code y opencode a traves de un endpoint OpenAI-compatible servido con vLLM.
- Capacidades multilingues heredadas del modelo base (la familia Gemma 4 soporta mas de 140 idiomas).
- Compatibilidad con el cache KV E8 de GLQ (~4 veces mas pequeno que fp16), que permite contextos mas largos en la misma VRAM.

## Casos de uso

- Inferencia local en GPU de gama media: con 5.04 GiB de pesos cargados, el modelo puede ejecutarse en tarjetas de 8-12 GB de VRAM, dejando espacio para el cache KV y los activos. Es adecuado para entornos de desarrollo y pruebas sin acceso a GPUs de datacenter.
- Servicio de endpoints OpenAI-compatible: mediante `vllm serve` se puede exponer un endpoint local para integrarlo en aplicaciones existentes con la API de OpenAI. Es el caso de uso recomendado por el autor para agentes de codigo.
- Agentes de codigo (pi-code, opencode): el modelo puede servir de backend para herramientas de programacion asistida que requieren tool calling y razonamiento multi-paso. La model card incluye configuraciones JSON listas para estos agentes.
- Prototipado de aplicaciones multimodales: al conservar las torres de imagen y audio nativas, se puede usar para clasificacion de imagenes o transcripcion de audio en local, aunque la cuantizacion solo afecta al texto.
- Investigacion sobre cuantizacion extrema: el checkpoint sirve como referencia para evaluar el impacto de GLQ a 4 bits en modelos multimodales de la familia Gemma 4, con datos de SQNR y rendimiento en AIME-2026.
- Despliegue en entornos con VRAM limitada para razonamiento largo: combinado con el cache KV E8, se puede ampliar la longitud de contexto efectiva sin incrementar la VRAM, util para analisis de documentos largos o conversaciones multi-turno.

## Benchmarks y rendimiento

La model card incluye mediciones realizadas sobre esta cuantizacion exacta en una RTX PRO 6000 Blackwell (sm_120) con vLLM 0.25.1:

| Metrica | Valor |
|---|---|
| Avg weight SQNR (276 capas) | 22.10 dB |
| Decode, batch 1 | 170.8 tok/s |
| AIME-2026 (avg@8, thinking) | 29.2% |
| Pesos cargados | 5.04 GiB |

Detalles de la evaluacion AIME-2026: 30 problemas, 8 muestras por problema, 16/30 resueltos con pass@8, 0 truncamientos, 40/240 generaciones sin `\boxed{}` parseable, media de 6.680 tokens generados. Parametros: 32k presupuesto, sin system message, temperatura 1.0, top_p 0.95, top_k 64, seed 0.

La model card advierte explicitamente de que no se ha medido una baseline bf16 en el mismo harness, por lo que los numeros no pueden interpretarse como un delta de cuantizacion. Tampoco se han publicado resultados de WikiText-2 perplexity ni MMLU-Pro.

## Requisitos de hardware

- VRAM estimada: los pesos cargados ocupan 5.04 GiB; con el cache KV y los activos, se recomienda al menos 8-12 GB de VRAM para inferencia con contexto corto.
- GPU recomendada: RTX PRO 6000 Blackwell (usada en las pruebas), aunque el autor indica que la ventaja de velocidad de GLQ es mayor en tarjetas de 24-32 GB con ancho de banda limitado.
- Compatibilidad con consumer GPU: no se especifica, pero por el tamano de pesos deberia caber en tarjetas como RTX 4080/4090 o RTX 5070 Ti (16-24 GB), siempre que tengan soporte CUDA para los kernels (sm_120 en Blackwell; se necesita verificar la compatibilidad con arquitecturas anteriores).
- Opciones de despliegue: vLLM (recomendado, registro automatico via plugin `glq`), Transformers (con `glq.hf_integration`), y servidor OpenAI-compatible para agentes.
- Latencia y throughput: 170.8 tok/s en decode con batch 1 en RTX PRO 6000 Blackwell. El autor advierte que la velocidad no escala de forma constante con la GPU; el beneficio de GLQ es mayor en tarjetas con menos ancho de banda.

## Comparativa con modelos similares

No se dispone de datos de otras cuantizaciones del mismo modelo base (AWQ, GPTQ, GGUF) para comparar directamente. La unica referencia es el modelo base bf16:

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento (AIME-2026) |
|---|---|---|---|---|---|
| google/gemma-4-E2B-it (bf16) | 2.453 M | hasta 256K (familia) | Apache-2.0 | safetensors | no disponible |
| xv0y5ncu/gemma-4-E2B-it-GLQ-4bpw | 2.453 M | no disponible | Apache-2.0 | safetensors + GLQ | 29.2% (avg@8) |

No se han encontrado datos de cuantizaciones alternativas (GGUF, AWQ) del mismo modelo para poder comparar rendimiento y tamano.

## Limitaciones y advertencias

- No hay baseline bf16 medida en el mismo harness, por lo que no se puede cuantificar la perdida de calidad relativa a la cuantizacion.
- La evaluacion se realizo en una unica GPU (RTX PRO 6000 Blackwell) y los numeros de throughput no son extrapolables de forma lineal a otras tarjetas.
- Requiere `glq >= 0.8.0` y `transformers >=5.13.1,<5.15`; la version 5.15.0 rompe la carga del modelo por un cambio de configuracion de capas.
- Los kernels CUDA requieren sm_120 (Blackwell); no se indica compatibilidad con arquitecturas NVIDIA anteriores (Ampere, Ada).
- No se han publicado resultados de perplexity (WikiText-2) ni MMLU-Pro para esta cuantizacion.
- La model card advierte que no se ha medido el rendimiento en tareas de vision/audio con la cuantizacion aplicada (las toras se mantienen nativas, pero no hay datos de latencia o precision en esas modalidades).
- Riesgo de alucinacion: no se especifica, pero es inherente a los modelos de la familia Gemma 4; se recomienda validar las salidas en aplicaciones de produccion.
- La licencia Apache-2.0 permite uso comercial, pero se debe revisar la licencia del modelo base (Gemma 4) para confirmar restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xv0y5ncu/gemma-4-E2B-it-GLQ-trellis-3inst-4bpw
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Ficha del modelo Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Guia de Gemma 4 E2B (gemma4.dev): https://gemma4.dev/models/gemma-4-e2b
- Guia de Gemma 4 E2B (gemma4.wiki): https://www.gemma4.wiki/models/gemma-4-e2b-model
