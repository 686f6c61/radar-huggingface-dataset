# WannaGoTech/WannaMed-Pro-ASR

## Resumen

WannaMed Pro ASR es un modelo de reconocimiento automático del habla (ASR) especializado en dictado clínico y radiológico, desarrollado íntegramente por WannaGoTech para su suite médica WannaMed. A diferencia de los ASR convencionales basados en transformers genéricos, emplea una arquitectura propia denominada WG-Conformer, de tipo híbrido CTC + RNN-T, con un enrutador de mezcla de expertos (MoE) que asigna un experto distinto a cada especialidad médica y jerga clínica.

El modelo se distribuye en dos variantes de despliegue, Tiny y Edge, ambas optimizadas para ejecución en dispositivos de gama baja. Su motor de inferencia está escrito en C11 puro (`wg_engine`), sin dependencias de Python, PyTorch ni Java, lo que reduce drásticamente el consumo de memoria: aproximadamente 6,3 Mo de RAM en la edición Tiny 8-bit y 39,2 Mo en la edición Edge 8-bit. Soporta francés, inglés y árabe, y está pensado para entornos de borde (móvil, embebido, CPU ARM64 y x86-64) además de GPU NVIDIA.

La relevancia actual del modelo radica en su propuesta de ASR médico soberano, con pesos propios en formato binario `.wgm1` verificados por SHA-256 y sin pesos de terceros. No obstante, la información pública disponible es limitada: el repositorio de HuggingFace aparece con 0,0 GB, los pesos se solicitan por correo y no se han publicado resultados de benchmarks ni métricas de error (WER) en la información accesible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | WG-Conformer híbrido CTC + RNN-T con enrutador MoE por especialidad |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (arquitectura MoE, sin cifra publicada) |
| Longitud de contexto | no disponible (procesamiento por tramas acústicas de 40 ms tras submuestreo Conv2D 4x) |
| Tipos de cuantización | int8, fp16, fp32 |
| Idiomas soportados | fr, en, ar |
| Licencia | other (licencia personalizada; acceso a pesos bajo solicitud) |
| Formato de pesos | binario propietario `.wgm1` (verificado por SHA-256) |

## Arquitectura y entrenamiento

El modelo se basa en WG-Conformer, una arquitectura Conformer propia con bloques tipo Macaron: medio paso Feed-Forward SwiGLU, atención multi-cabeza con codificación posicional rotativa (RoPE) relativa, convolución depthwise 1D causal con kernel 15 y puerta GLU, segundo medio paso SwiGLU y LayerNorm final. La entrada acústica se procesa mediante un frontend espectral STFT de 512 puntos (ventana Hann de 400 muestras, salto de 160 muestras a 16 kHz) hacia 80 bancos de filtros log-Mel con normalización CMVN, seguido de un submuestreo Conv2D 4x que reduce la secuencia a tramas de 40 ms. La salida se genera con doble cabeza híbrida CTC + RNN-T (transducer) y tokenizador propio WGTK BPE-1024.

El enrutador MoE asigna un experto por especialidad médica, de modo que solo se cargan en memoria los parámetros del experto relevante. El motor `wg_engine` en C11 implementa gestión de memoria por arena preasignada alineada a 64 bytes, pool de hilos lock-free con sincronización atómica acquire/release, kernels SIMD (AVX-512, AVX2+FMA3, ARM NEON) y fusión de operadores LayerNorm+SiLU. No se han publicado datos sobre volumen de tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) en francés, inglés y árabe.
- Dictado clínico y radiológico con enrutamiento MoE por especialidad médica y jerga clínica.
- Decodificación en streaming continuo o por segmentos mediante la cabeza híbrida CTC + RNN-T.
- Extracción de características acústicas bit-exacta entre C11 y PyTorch (STFT log-Mel + CMVN).
- Ejecución en CPU (x86-64, ARM64), GPU NVIDIA y dispositivos móviles o embebidos.
- Cuantización a 8, 16 y 32 bits para ajustar consumo de memoria y latencia.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Dictado clínico en consulta: el modelo transcribe la voz del facultativo en tiempo real gracias a su decodificación streaming y a su vocabulario BPE médico, reduciendo la carga de documentación manual.
- Radiología asistida: el enrutador MoE dedica un experto a la jerga radiológica, lo que permite transcribir informes con terminología específica sin cargar parámetros de otras especialidades.
- Aplicaciones móviles de salud: la edición Tiny 8-bit ocupa unos 6,3 Mo de RAM, por lo que puede integrarse en apps de Android o iOS para dictado offline sin conexión.
- Dispositivos embebidos y wearables clínicos: la edición Edge 8-bit (~39,2 Mo) cabe en hardware de bajo consumo con CPU ARM64, habilitando transcripción local en entornos sin GPU.
- Telemedicina y atención remota: el soporte multilingüe (fr, en, ar) permite transcribir consultas con pacientes de distintos idiomas en una misma plataforma.
- Digitalización de notas en entornos con recursos limitados: al ejecutarse en CPU x86-64 con motor C11 nativo (3,97 ms por inferencia), puede desplegarse en servidores modestos sin GPU.
- Integración en sistemas de historia clínica electrónica: la salida de texto estructurada por segmentos facilita el volcado a campos de formularios clínicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (WER, MMLU, HumanEval u otros) en la información disponible. El autor únicamente reporta métricas de latencia de inferencia:

| Plataforma | Latencia reportada |
|---|---|
| NVIDIA RTX 4090 | 0,42 ms |
| NVIDIA L4 | 0,78 ms |
| CPU con C11 nativo | 3,97 ms |

No se especifica la unidad de audio evaluada ni las condiciones exactas de medición, por lo que estas cifras deben interpretarse con cautela.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 6,3 Mo en edición Tiny 8-bit y 39,2 Mo en edición Edge 8-bit; las variantes fp16 y fp32 requerirán más memoria (cifra no publicada).
- GPU recomendadas: NVIDIA RTX 4090 (0,42 ms) y NVIDIA L4 (0,78 ms) según el autor.
- Compatibilidad con GPU de consumo: sí, dado el reducido tamaño de las ediciones Tiny y Edge; cabe en cualquier GPU consumer moderna.
- CPU: ejecutable en x86-64 y ARM64 sin tarjeta gráfica, con latencia reportada de 3,97 ms.
- Opciones de despliegue: motor propietario `wg_engine` en C11; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| WannaMed Pro ASR | Conformer MoE CTC+RNN-T | fr, en, ar | other (bajo solicitud) | Pesos privados, solicitud por correo |
| Whisper (OpenAI) | Transformer encoder-decoder | multilingüe | MIT | Pesos abiertos en HuggingFace |
| wav2vec 2.0 (Meta) | CNN + transformer | multilingüe | MIT/Apache | Pesos abiertos |
| NVIDIA NeMo Conformer | Conformer CTC/RNN-T | multilingüe | Apache 2.0 | Pesos abiertos |

La comparación directa de rendimiento (WER) no es posible porque WannaMed Pro ASR no publica métricas de precisión. Frente a alternativas abiertas como Whisper o NeMo, la propuesta de WannaGoTech destaca por su huella de memoria extremadamente baja y su motor C11 sin dependencias, pero carece de pesos públicos y de benchmarks verificables.

## Limitaciones y advertencias

- No se han publicado métricas de precisión (WER) ni evaluaciones independientes; el rendimiento real en dominios clínicos es desconocido.
- Los pesos no son de acceso público: se solicitan por correo a contact@wannamed.com, lo que limita la reproducibilidad y la auditoría.
- La licencia "other" impone restricciones no detalladas en la información disponible; es imprescindible revisar los términos antes de cualquier uso comercial.
- Solo cubre francés, inglés y árabe; no hay soporte documentado para castellano ni otras lenguas.
- El formato de pesos `.wgm1` es propietario y requiere el motor `wg_engine`, lo que dificulta la integración con ecosistemas estándar (PyTorch, ONNX, GGUF).
- Riesgo de alucinación y errores de transcripción en jerga médica no cubierta por los expertos MoE; no se documenta ningún mecanismo de mitigación.
- No se dispone de información sobre sesgos demográficos, acústicos ni de acento.
- El repositorio de HuggingFace figura con 0,0 GB y solo 20 descargas, lo que sugiere una disponibilidad muy limitada de artefactos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WannaGoTech/WannaMed-Pro-ASR
- Demo interactiva: https://huggingface.co/spaces/WannaGoTech/WannaMed-Pro-ASR
- Sitio oficial WannaMed ASR: https://wannamed.com/asr/
- Empresa desarrolladora: https://wannago.tech
- Contacto para licencia y pesos: contact@wannamed.com
