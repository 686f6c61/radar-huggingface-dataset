# xv0y5ncu/gemma-4-31B-it-GLQ-trellis-3inst-4bpw

## Resumen

`gemma-4-31B-it-GLQ-trellis-3inst-4bpw` es una cuantización GLQ (4.0 bits por peso) del modelo multimodal `google/gemma-4-31B-it` de Google DeepMind, publicada por el usuario xv0y5ncu. GLQ combina un codebook trellis-coded (QTIP TCQ, variante 3inst) con transformada Hadamard aleatorizada (RHT) y LDLQ, de forma que los pesos permanecen comprimidos en memoria y se decodifican sobre la marcha mediante un kernel CUDA fusionado. El resultado es una reducción drástica de huella: los pesos cargados ocupan 18.04 GiB frente a los ~62.5 GB de la referencia bf16, con una SQNR media de 22.42 dB sobre 410 capas cuantizadas.

El modelo base es el Gemma 4 31B instruct, un transformer denso con ventana de contexto de hasta 256K tokens y soporte multimodal (texto, imagen y video como secuencias de frames). Esta cuantización está pensada para entornos de inferencia local con GPUs de consumo o profesionales donde la VRAM es limitada, permitiendo servir un modelo de 31B en tarjetas de 24 GB. La integración con vLLM es el camino recomendado, con soporte también para Transformers mediante un plugin de registro.

La relevancia actual viene de la combinación de un modelo abierto con licencia Apache 2.0, un contexto muy largo y una cuantización agresiva que mantiene la calidad en rangos de 2-4 bits por peso. Es una opción práctica para equipos que necesitan desplegar un LLM de alto rendimiento sin depender de infraestructura cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4, familia Google DeepMind) |
| Parametros totales | 31B (modelo base); 9.315.694.956 valores comprimidos en safetensors cuantizado |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | Hasta 256K tokens (modelo base) |
| Tipos de cuantizacion | GLQ 4.0 bpw (trellis-coded QTIP TCQ 3inst + RHT + LDLQ); existe variante 5.0 bpw del mismo autor |
| Idiomas soportados | Mas de 140 idiomas (modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con cuantizacion GLQ (kernel CUDA fusionado); requiere `glq >= 0.8.2` |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-31B-it` es un transformer denso de 31B parámetros perteneciente a la familia Gemma 4 de Google DeepMind, con una ventana de contexto de hasta 256K tokens y capacidad multimodal (texto, imagen y video). La variante cuantizada mantiene la arquitectura original pero reemplaza los pesos en bf16 por una representación GLQ de 4.0 bits por peso uniforme, basada en un codebook trellis (QTIP TCQ, variante 3inst) combinado con una transformada Hadamard aleatorizada (RHT) y LDLQ. Los pesos se calibran con 128 muestras de WikiText-2 de 2048 tokens cada una, y se decodifican en tiempo de inferencia mediante un kernel CUDA fusionado que evita el apilamiento residual.

La cuantización GLQ solo afecta al decoder de texto; las torres de visión y audio del modelo base se mantienen en su formato nativo. Esto implica que, aunque el pipeline de HuggingFace es `image-text-to-text`, el checkpoint cuantizado está pensado para servir texto en vLLM (los ejemplos de uso limitan los inputs multimodales a cero). No se han publicado detalles sobre el entrenamiento del modelo base más allá de los estándares de seguridad de Google DeepMind.

## Capacidades

- Generación de texto autoregresiva con razonamiento y capacidad de codigo, heredadas del modelo base Gemma 4 31B.
- Soporte multimodal en el modelo base (texto, imagen y video como secuencias de frames), aunque la cuantizacion GLQ solo cubre el decoder de texto y el runtime recomendado (vLLM) se usa en modo solo texto.
- Ventana de contexto de hasta 256K tokens, apta para tareas de recuperacion, analisis de documentos largos y conversaciones multi-turno extensas.
- Multilingue en mas de 140 idiomas segun la documentacion oficial de Gemma 4.
- Cuantizacion GLQ con decodificacion en un solo paso (sin apilado residual), lo que reduce el ancho de banda de memoria necesario en inferencia.
- Compatibilidad con vLLM (servidor OpenAI-compatible) y Transformers, permitiendo integracion con agentes de codigo como pi-code u opencode.

## Casos de uso

- Despliegue local de un LLM de 31B en GPU de 24 GB: gracias a los 18.04 GiB de pesos cargados, el modelo cabe en tarjetas como una RTX 3090/4090 o RTX PRO 6000, permitiendo inferencia en produccion sin depender de infraestructura cloud.
- RAG sobre documentos largos: la ventana de 256K tokens permite indexar y consultar informes, papers o libros completos en una sola pasada, con contexto suficiente para respuestas precisas.
- Agente de codigo asistido en local: integrable con vLLM como endpoint OpenAI-compatible para herramientas como opencode o pi-code, generando y editando codigo con razonamiento de alto nivel.
- Analisis de conversaciones multi-turno en atencion al cliente: el modelo puede gestionar historiales largos de chat gracias a su contexto extenso y su capacidad de generacion fluida.
- Generacion de documentacion tecnica y resumenes: el modelo base esta entrenado para razonamiento y multilingueismo, util para resumir documentacion interna o traducir contenido tecnico.
- Prototipado rapido de aplicaciones de IA generativa en entornos con GPU compartida o de gama media, donde la cuantizacion GLQ permite servir un modelo de 31B sin sacrificar demasiada calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no se han medido aun WikiText-2 perplexity, MMLU-Pro ni AIME-2026, y que no existe un baseline bf16 del mismo modelo para calcular el delta de cuantizacion. Los unicos datos concretos medidos en el checkpoint exacto son:

| Metrica | Valor |
|---|---|
| Peso cargado | 18.04 GiB (bf16 reference ≈ 62.5 GB) |
| Decode (batch 1) | 34.3 tok/s |
| SQNR media de pesos | 22.42 dB |
| AIME-2026 (avg@8, thinking) | No medido |
| WikiText-2 perplexity | No medido |
| MMLU-Pro | No medido |

La velocidad de decode es dependiente de la GPU: la ventaja de GLQ proviene de mover 4 veces menos bytes de pesos, por lo que es mayor en tarjetas con ancho de banda limitado (24-32 GB) y aproximadamente paridad en una Blackwell de 96 GB como la RTX PRO 6000.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 20-22 GiB para pesos + KV cache y overhead, considerando los 18.04 GiB de pesos cargados medidos en vLLM.
- GPU recomendadas: RTX PRO 6000 Blackwell (sm_120) usada para las mediciones; tambien tarjetas de 24 GB como RTX 4090, RTX 3090, o GPUs de datacenter A 100 (40/80 GB) con margen para contexto largo.
- Cabe en GPU de consumo de 24 GB (RTX 4090, RTX 3090) si se limita la longitud de contexto; en tarjetas de 16 GB seria ajustado y probablemente inviable con contexto completo.
- Despliegue: vLLM es el runtime recomendado (con plugin `glq` que se registra automaticamente); tambien compatible con Transformers mediante `glq.hf_integration`. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: 34.3 tok/s en decode con batch 1 medido en RTX PRO 6000; el throughput agregado puede mejorar con batch mayores, aunque no se aportan datos.
- Requisitos de software: `glq >= 0.8.2`, `transformers >= 5.13.1 y < 5.15` (5.15.0 rompe la carga), vLLM 0.27.1 verificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `google/gemma-4-31B-it` (base) | 31B | 256K | bf16 nativo | Apache 2.0 | HuggingFace |
| `xv0y5ncu/gemma-4-31B-it-GLQ-trellis-3inst-4bpw` | 31B | 256K (base) | GLQ 4.0 bpw | Apache 2.0 | HuggingFace |
| `xv0y5ncu/Gemma-4-31B-it-GLQ-5.0bpw-mix3-8` | 31B | 256K (base) | GLQ 5.0 bpw | Apache 2.0 | HuggingFace |
| `google/gemma-4-26B-A4B-it` (familia) | 26B total, 4B activos (MoE) | 256K | bf16 nativo | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion disponible. La comparacion se limita a caracteristicas de arquitectura y cuantizacion. La variante 5.0 bpw del mismo autor ofrece mayor fidelidad a costa de mayor peso; la 4.0 bpw es la mas agresiva en compresion.

## Limitaciones y advertencias

- La cuantizacion GLQ 4.0 bpw introduce degradacion de calidad frente al modelo bf16 original; no se ha medido el delta exacto porque no hay baseline bf16 en la misma infraestructura.
- El checkpoint esta pensado para servir texto en vLLM; aunque el modelo base es multimodal, la cuantizacion solo cubre el decoder de texto y los ejemplos de uso limitan los inputs multimodales a cero.
- Requiere versiones exactas de software: `glq >= 0.8.2`, `transformers >= 5.13.1 y < 5.15` (5.15.0 rompe la carga), y vLLM 0.27.1 verificado; actualizar a 5.15.0 causa fallos en la configuracion del modelo.
- La velocidad de decode depende fuertemente de la GPU; los 34.3 tok/s son especificos de la RTX PRO 6000 Blackwell y no se pueden extrapolar sin cualificar el hardware.
- Riesgo de alucinacion y sesgos inherentes al modelo base, no documentados especificamente para esta cuantizacion.
- No se han publicado resultados de benchmarks estandarizados (MMLU, GSM8K, HumanEval) para este checkpoint, por lo que no se puede evaluar su rendimiento relativo con garantias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xv0y5ncu/gemma-4-31B-it-GLQ-trellis-3inst-4bpw
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Variante 5.0 bpw del mismo autor: https://huggingface.co/xv0y5ncu/Gemma-4-31B-it-GLQ-5.0bpw-mix3-8
- Pagina oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Gemma 4 31B: https://gemma4.dev/models/gemma-4-31b
- Model card en NVIDIA NIM: https://build.nvidia.com/google/gemma-4-31b-it/modelcard
