# xv0y5ncu/gemma-4-E4B-it-GLQ-trellis-3inst-4bpw

## Resumen

`gemma-4-E4B-it-GLQ-trellis-3inst-4bpw` es una cuantización de 4 bits por peso del modelo multimodal `google/gemma-4-E4B-it` de Google, realizada por el usuario xv0y5ncu mediante el método GLQ (trellis-coded quantization con QTIP TCQ, transformada de Hadamard aleatorizada y LDLQ). El resultado es un checkpoint de 3,15 mil millones de parámetros (el modelo base tiene 4,4 B, pero la cuantización reduce el peso de cada capa a 4 bits) que mantiene los pesos comprimidos en memoria y los decodifica en tiempo de ejecución mediante un kernel CUDA fusionado. La cuantización se aplica únicamente al decodificador de texto; los módulos de visión y audio se conservan en su formato original.

Este modelo resuelve el problema del despliegue local de Gemma 4 en GPUs de consumo, reduciendo el peso de los pesos de aproximadamente 16 GB (bf16) a 6,58 GiB, con una velocidad de decodificación de 119,5 tokens/s en una RTX PRO 6000 Blackwell. La relevancia actual radica en que permite ejecutar un modelo multimodal de última generación con razonamiento y capacidad de agente en hardware de gama media, sin necesidad de servidores dedicados. El checkpoint está disponible en formato safetensors y se integra con vLLM y Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, imagen, audio, video) — decodificador cuantizado GLQ 4 bits/peso |
| Parametros totales | 3.295.349.322 (safetensors) |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | No disponible (el modelo base soporta hasta 256K tokens; este checkpoint no especifica el máximo) |
| Tipos de cuantizacion | GLQ 4.0 bits/peso (QTIP TCQ 3INST + RHT + LDLQ) |
| Idiomas soportados | No disponibles (el modelo base Gemma 4 soporta más de 140 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos GLQ comprimidos en memoria, decodificados por kernel CUDA) |

## Arquitectura y entrenamiento

La arquitectura base es Gemma 4 E4B, un modelo multimodal de tipo Transformer denso con 4,4 mil millones de parámetros, entrenado por Google con una ventana de contexto de hasta 256K tokens y soporte multilingüe en más de 140 idiomas. El checkpoint cuantizado aplica el método GLQ, que combina trellis-coded quantization (QTIP TCQ) con una transformada de Hadamard aleatoriedad (RHT) y LDLQ (latent distributional quantization). Los pesos se almacenan comprimidos a 4 bits por peso y se decodifican al vuelo mediante kernels CUDA fusionados, lo que reduce el tráfico de memoria y mejora la velocidad de decodificación.

La calibración se realizó con 128 muestras de 2048 tokens de WikiText-2, y el modelo alcanza un SQNR medio de 22,12 dB sobre 343 capas cuantizadas. No se han publicado datos sobre el entrenamiento original del modelo base (dataset, composición, RLHF o DPO). El checkpoint se ha verificado con Transformers 5.14.1 y vLLM 0.25.1, y requiere la librería `glq >= 0.8.0` para cargar el trellis en el layout de kernel adecuado.

## Capacidades

- Generación de texto multimodal: acepta entradas de imagen, audio, vídeo y texto, y genera respuestas de texto (el pipeline es `any-to-any`).
- Razonamiento avanzado: el modelo base Gemma 4 incluye modo de pensamiento (thinking mode) que mejora el rendimiento en problemas de razonamiento matemático y lógico.
- Capacidad de codificación: el modelo base está optimizado para generación y comprensión de código, y puede integrarse con agentes de programación como pi-code u opencode a través de un endpoint OpenAI-compatible.
- Tool calling y function calling: no se ha documentado explícitamente en el checkpoint, pero el modelo base Gemma 4 soporta llamadas a herramientas y uso de agentes.
- Multilingüe: el modelo base Gemma 4 soporta más de 140 idiomas, aunque el checkpoint no especifica la lista concreta.
- Compatibilidad con vLLM y Transformers: se puede servir con vLLM (recomendado) o usar con Transformers mediante la integración `glq.hf_integration`.

## Casos de uso

- **Asistente de código local**: un desarrollador puede servir el modelo con vLLM y conectarlo a agentes de codificación como pi-code u opencode para autocompletar, refactorizar y depurar código en local, sin depender de la nube. La cuantización GLQ permite ejecutarlo en una GPU con 8 GB de VRAM, lo que lo hace viable para estaciones de trabajo.
- **Razonamiento matemático y científico**: gracias al modo thinking y a su rendimiento en AIME-2026 (44,2% avg@8), puede utilizarse como asistente en entornos educativos o de investigación para resolver problemas de matemáticas y ciencias, con la ventaja de que no requiere conexión externa.
- **Procesamiento de documentos multimodales**: el modelo acepta imágenes, audio y vídeo, por lo que puede transcribir y resumir contenido de estos formatos directamente en local, útil en entornos con requisitos de privacidad.
- **Chat y atención al cliente en local**: con su contexto largo y soporte de conversación multiturno, puede integrarse en un servidor interno para gestionar consultas de clientes, manteniendo los datos dentro de la organización.
- **Prototipado rápido de agentes**: al ser compatible con el protocolo OpenAI, se puede integrar en frameworks de agentes (LangChain, LlamaIndex) para pruebas de concepto sin coste por API.
- **Sistema de RAG con contexto largo**: el checkpoint admite la caché KV cuantizada E8 (opcional) que reduce el uso de memoria de la caché KV en ~4×, permitiendo ventanas de contexto más largas en la misma VRAM, ideal para recuperación aumentada con documentos extensos.

## Benchmarks y rendimiento

El autor del checkpoint ha medido los siguientes datos en este checkpoint exacto, en una RTX PRO 6000 Blackwell (sm_120) bajo vLLM 0.25.1:

| Métrica | Valor |
|---|---|
| Memoria de pesos cargados | 6,58 GiB (frente a ~16,0 GB en bf16) |
| Velocidad de decodificación (batch 1) | 119,5 tok/s |
| SQNR medio de pesos | 22,12 dB |
| AIME-2026 (avg@8, thinking) | 44,2% |

Detalles del benchmark AIME-2026: 20/30 problemas resueltos en pass@8, 0 truncaciones, 26/240 generaciones sin respuesta parseable, media de 6.114 tokens generados (con modo de pensamiento activado). Se usaron 30 problemas × 8 muestras, presupuesto de 32K tokens, sin mensaje de sistema, temperatura 1,0, top_p 0,95, top_k 64, semilla 0.

No se han publicado resultados de WikiText-2 perplexity, MMLU-Pro ni una comparación con el modelo bf16 original en el mismo hardware.

## Requisitos de hardware

- VRAM estimada: 6,58 GiB para los pesos, más memoria para las activaciones y KV cache. Con la caché E8 opcional, la KV cache se reduce ~4 veces.
- GPU recomendada: RTX PRO 6000 Blackwell (sm_120) para máxima velocidad; funciona en GPU con 24–32 GB VRAM (p. ej., RTX 3090, RTX 4090) donde la ventaja de velocidad es mayor al mover 4× menos bytes.
- Compatibilidad con GPU de consumo: sí, con 8 GB de VRAM puede ejecutarse, aunque la velocidad dependerá del ancho de banda de la GPU.
- Opciones de despliegue: vLLM (recomendado), Transformers con la integración `glq.hf_integration`, y servidor OpenAI-compatible para agentes.
- Latencia y throughput: 119,5 tok/s en decodificación con batch 1 en RTX PRO 6000; el rendimiento varía según la GPU y el tamaño de la caché.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| google/gemma-4-E4B-it (original) | 4,4 B | bf16 | 256K tokens | Apache 2.0 | Hugging Face |
| xv0y5ncu/gemma-4-E4B-it-GLQ-trellis-3inst-4bpw (este) | 3,15 B | GLQ 4 bits | No especificado | Apache 2.0 | Hugging Face |
| xv0y5ncu/Gemma-4-E4B-it-GLQ-4bpw (otra cuantización) | 3,15 B | GLQ 4 bits | No especificado | Apache 2.0 | Hugging Face |

El checkpoint GLQ es una cuantización del modelo base Gemma 4 E4B, por lo que la comparativa principal es contra el modelo original en bf16: el cuantizado reduce el tamaño de los pesos a ~40% y ofrece una velocidad de decodificación mayor en GPUs con ancho de banda limitado, a costa de una pérdida de precisión (SQNR medio de 22,12 dB). No se dispone de comparación con otras cuantizaciones (GPTQ, AWQ) para este modelo.

## Limitaciones y advertencias

- **Pérdida de precisión**: la cuantización a 4 bits puede degradar el rendimiento en tareas de razonamiento complejo; el SQNR de 22,12 dB es relativamente bajo, por lo que es recomendable verificar la calidad en tareas críticas.
- **Alucinaciones**: como cualquier modelo generativo, puede producir respuestas inventadas, especialmente en dominios poco representados en el entrenamiento.
- **Contexto no especificado**: el checkpoint no documenta la longitud máxima de contexto efectiva tras la cuantización; se recomienda usar la ventana del modelo base (256K tokens) con precaución.
- **Dependencia de librerías**: requiere `glq >= 0.8.0` y `transformers >= 5.13.1,<5.15`; la versión 5.15.0 rompe la carga del modelo, por lo que hay que fijar la versión.
- **Multimodalidad parcial**: la cuantización solo se aplica al decoder de texto; los módulos de visión y audio no se cuantizan, por lo que el consumo de VRAM puede aumentar al usar entradas multimodales.
- **Sin datos de seguridad**: el modelo base Gemma 4 ha pasado por protocolos de seguridad, pero la cuantización no modifica el comportamiento; se recomienda evaluar en el dominio de uso.
- **Licencia**: aunque la licencia es Apache 2.0, se debe consultar la licencia específica de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license) para usos comerciales.

## Enlaces

- [Hugging Face - xv0y5ncu/gemma-4-E4B-it-GLQ-trellis-3inst-4bpw](https://huggingface.co/xv0y5ncu/gemma-4-E4B-it-GLQ-trellis-3inst-4bpw)
- [Modelo base en Hugging Face](https://huggingface.co/google/gemma-4-E4B-it)
- [Gemma 4 — Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma 4 model card — Google AI for Developers](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Gemma 4 E4B — gemma4.dev](https://gemma4.dev/models/gemma-4-e4b)
