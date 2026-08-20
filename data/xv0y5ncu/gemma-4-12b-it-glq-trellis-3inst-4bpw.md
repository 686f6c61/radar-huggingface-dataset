# xv0y5ncu/gemma-4-12B-it-GLQ-trellis-3inst-4bpw

## Resumen

El modelo `xv0y5ncu/gemma-4-12B-it-GLQ-trellis-3inst-4bpw` es una cuantización de alta eficiencia del modelo multimodal `google/gemma-4-12B-it` de Google, desarrollada por el usuario xv0y5ncu. Utiliza el método GLQ (Generalized Learned Quantization) con una tasa de 4.0 bits por peso, basado en una combinación de trellis-coded quantization (QTIP TCQ, variante 3inst), transformada de Hadamard aleatorizada (RHT) y LDLQ. Los pesos permanecen comprimidos en memoria y se decodifican sobre la marcha mediante un kernel CUDA fusionado, lo que reduce drásticamente el uso de VRAM sin sacrificar demasiada fidelidad.

El modelo base Gemma 4 12B es un transformer multimodal encoder-free que acepta entradas de texto, imagen, audio y video, diseñado para ejecutarse en entornos locales con 16 GB de VRAM. Esta cuantización específica se centra en el decoder de texto; las torres de visión y audio se mantienen en su formato original. El checkpoint resultante ocupa unos 7.6 GB en disco y carga alrededor de 7.73 GiB de pesos en memoria, frente a los ~23.9 GB del modelo en bf16. Es relevante porque permite ejecutar un modelo multimodal de 12B en GPUs de gama media con un impacto mínimo en la calidad, y es compatible con vLLM y Transformers mediante el paquete `glq`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal encoder-free (Gemma 4 12B) con cuantización GLQ en el decoder de texto |
| Parámetros totales | 3.788.867.632 (checkpoint cuantizado); modelo base: 12B (no se especifica el número exacto) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | GLQ 4.0 bits/peso (QTIP TCQ 3inst + RHT + LDLQ); opcional KV cache E8 (~4× más pequeña) |
| Idiomas soportados | No disponible (no especificado) |
| Licencia | Apache-2.0 (según la model card y el tag de HF) |
| Formato de pesos | Safetensors (con formato interno GLQ, requiere la librería `glq`) |

## Arquitectura y entrenamiento

El modelo base Gemma 4 12B es un transformer multimodal sin encoder (encoder-free), capaz de ingerir directamente audio y video además de texto e imagen. La cuantización GLQ se aplica exclusivamente al decoder de texto; las torres de visión y audio se mantienen en su formato nativo, lo que significa que las capacidades multimodales del modelo se conservan, aunque el ahorro de memoria se limita al decoder.

El método GLQ emplea un codebook trellis-coded (QTIP TCQ, variante 3inst) combinado con una transformación de Hadamard aleatoria y LDLQ para minimizar el error de cuantización. El checkpoint se calibró con 128 muestras de 2048 tokens del dataset WikiText-2, obteniendo una SQNR (signal-to-quantization-noise ratio) promedio de 22.34 dB sobre 328 capas cuantizadas. Los pesos se almacenan comprimidos en memoria y se decodifican en el momento de la inferencia mediante un kernel CUDA fusionado, lo que permite reducir el tráfico de memoria de pesos en un factor de 4.

La cuantización no introduce pasos de entrenamiento adicionales; es un proceso de post-entrenamiento. El modelo base fue entrenado por Google con datos no especificados en la información disponible, y no se han proporcionado detalles sobre el proceso de entrenamiento (tokens, dataset, RLHF, etc.).

## Capacidades

- Multimodalidad nativa: el modelo base acepta texto, imagen, audio y video como entrada, aunque la cuantización se centra en el decoder de texto y las torres multimodales se mantienen en su formato original.
- Generación de texto y razonamiento: el modelo base es capaz de tareas de lenguaje general, razonamiento, matemáticas y generación de código.
- Soporte de agentes y código: la model card recomienda usar este checkpoint con agentes de código como `pi-code` y `opencode` mediante un endpoint compatible con la API de OpenAI, lo que sugiere que puede seguir instrucciones de herramientas y flujos de trabajo multi-paso.
- Soporte de tool calling / function calling: no se ha confirmado explícitamente en la documentación, pero el uso con agentes de código a través de OpenAI-compatible implica que puede invocar herramientas si se le presentan en el formato adecuado.
- Capacidades multilingües: no se especifican en la información disponible, aunque el modelo base Gemma 4 probablemente soporte múltiples idiomas (no se indica).
- Modo de pensamiento (thinking mode): no se menciona, aunque el modelo base podría tener capacidad de razonamiento extendido (no confirmado).
- Cuantización eficiente: los pesos se mantienen comprimidos en memoria y se decodifican en el momento, lo que reduce el uso de VRAM y permite ejecutar el modelo en GPUs con menos memoria que el modelo bf16.

## Casos de uso

- **Servicio de agentes de código en local**: se puede desplegar con `vllm serve` y conectarlo a agentes como `pi-code` o `opencode` mediante un endpoint OpenAI-compatible. La baja huella de memoria permite ejecutarlo en una estación de trabajo con una GPU de 16 GB, lo que facilita un asistente de programación privado y sin latencia de red.
- **Asistente multimodal en el dispositivo**: gracias a la cuantización, el modelo cabe en una GPU de 16 GB (como una RTX 4080 o similar) y puede procesar entradas de texto, imagen y audio, útil para aplicaciones de asistencia personal o análisis de documentos.
- **Procesamiento de documentos con audio**: el modelo puede transcribir o procesar audio y video, y la cuantización permite ejecutarlo en hardware local sin depender de la nube, lo que es útil para entornos con requisitos de privacidad.
- **Generación de texto con contexto largo**: activando la KV cache E8 (≈4× menor que fp16), se puede aumentar la longitud de contexto efectiva dentro de la misma VRAM, lo que permite procesar documentos largos o conversaciones extensas.
- **Despliegue en producción con vLLM**: el checkpoint es compatible con vLLM (recomendado) y puede servir solicitudes concurrentes con baja latencia, aprovechando la reducción de ancho de banda de pesos para mejorar el throughput en GPUs de gama media.
- **Investigación en cuantización eficiente**: el método GLQ con trellis-coded quantization es de interés para investigadores que estudian técnicas de compresión de modelos multimodales, y este checkpoint sirve como referencia para medir el impacto en calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas técnicas del checkpoint:

| Métrica | Valor |
|---|---|
| SQNR promedio (sobre 328 capas) | 22.34 dB |
| Tasa de decodificación (decode, batch 1) | 83.4 tokens/s (en RTX PRO 6000 Blackwell, vLLM 0.25.1) |
| Tamaño de pesos cargados | 7.73 GiB |
| Tamaño del checkpoint en disco | 7.6 GB |

No se ha medido aún la perplejidad de WikiText-2, MMLU-Pro ni AIME-2026. No existe un baseline bf16 bajo el mismo harness, por lo que no se puede cuantificar la pérdida exacta debida a la cuantización.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint requiere aproximadamente 7.73 GiB para los pesos cargados, por lo que con memoria adicional para KV cache y activaciones, se recomienda al menos 10-12 GB de VRAM para uso cómodo. El modelo base sin cuantizar necesita 16 GB según el blog de Google.
- **GPU recomendadas**: se ha probado en una RTX PRO 6000 Blackwell (sm_120). El autor indica que la ventaja de GLQ es mayor en GPUs con ancho de banda limitado (24-32 GB), donde la reducción de bytes transferidos es más beneficiosa.
- **Compatibilidad con GPU consumer**: es viable en tarjetas como RTX 4080/4090 (16-24 GB), RTX 3080/3090 (10-24 GB) y similares. No se ha confirmado su funcionamiento en GPU sin soporte CUDA nativo (por ejemplo, AMD).
- **Opciones de despliegue**: vLLM es el runtime recomendado (con `quantization="glq"`); también funciona con Transformers (`AutoModelForImageTextToText`). Se requiere el paquete `glq` (>=0.8.0) y la versión de Transformers entre `>=5.13.1` y `<5.15`. También se puede servir con vLLM para agentes de código.
- **Latencia y throughput**: en el RTX PRO 6000 Blackwell, la decodificación es de 83.4 tok/s con batch 1. No hay datos para batch mayores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Peso en memoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `google/gemma-4-12B-it` (bf16) | 12B | no disponible | ~23.9 GB | Apache-2.0 | HuggingFace |
| `xv0y5ncu/gemma-4-12B-it-GLQ-3bpw-e8p-bd` (GLQ 3bpw) | 12B (cuantizado) | no disponible | no disponible | Apache-2.0 | HuggingFace |
| `xv0y5ncu/gemma-4-12B-it-GLQ-trellis-3inst-4bpw` | 12B (cuantizado 4bpw) | no disponible | 7.73 GiB | Apache-2.0 | HuggingFace |

No se dispone de comparativas de rendimiento entre estas variantes. La ventaja principal de la versión 4bpw es el equilibrio entre tamaño y calidad, mientras que la versión 3bpw probablemente sacrifica más precisión a cambio de un tamaño aún menor. No se han encontrado otros modelos multimodales cuantizados comparables en la información proporcionada.

## Limitaciones y advertencias

- **Pérdida de calidad por cuantización**: no se ha medido la degradación en benchmarks estándar; el SQNR de 22.34 dB sugiere una buena reconstrucción, pero no garantiza resultados sin errores en tareas complejas.
- **Sesgos del modelo base**: Gemma 4 puede heredar sesgos del dataset de entrenamiento, aunque no se documentan en esta ficha.
- **Riesgo de alucinación**: como todo LLM, puede generar contenido falso o inconsistente, especialmente en tareas de razonamiento o con contexto largo.
- **Compatibilidad frágil**: la model card advierte que Transformers 5.15.0 rompe la configuración de Gemma-4 (el error `config.head_dim`), y que vLLM falla antes de cargar ningún peso. Se debe fijar Transformers entre `>=5.13.1` y `<5.15`, y usar `glq >=0.8.0`.
- **Cuantización solo en decoder de texto**: las torres de visión y audio se mantienen en su formato original, por lo que el ahorro de memoria se limita al decoder de texto; en tareas multimodales, la VRAM total será mayor que la indicada para los pesos.
- **Dependencia de kernel CUDA**: el checkpoint requiere kernels CUDA específicos para la decodificación GLQ; no funcionará en hardware sin soporte CUDA (por ejemplo, Apple Silicon).
- **Sin datos de contexto**: no se especifica la longitud de contexto soportada; es posible que el modelo base tenga una ventana de 128K, pero no se confirma.

## Enlaces

- Modelo en HuggingFace: [xv0y5ncu/gemma-4-12B-it-GLQ-trellis-3inst-4bpw](https://huggingface.co/xv0y5ncu/gemma-4-12B-it-GLQ-trellis-3inst-4bpw)
- Modelo base: [google/gemma-4-12B-it](https://huggingface.co/google/gemma-4-12B-it)
- Página oficial de Gemma 4: [https://deepmind.google/models/gemma/gemma-4/](https://deepmind.google/models/gemma/gemma-4/)
- Blog de introducción de Gemma 4 12B: [https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/](https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/)
- Guía para desarrolladores: [https://developers.googleblog.com/gemma-4-12b-the-developer-guide/](https://developers.googleblog.com/gemma-4-12b-the-developer-guide/)
- Paper QTIP (trellis-coded quantization): [https://arxiv.org/abs/2406.11235](https://arxiv.org/abs/2406.11235)
- Paper sobre la técnica GLQ (referencia adicional): [https://arxiv.org/abs/2607.02770](https://arxiv.org/abs/2607.02770)
