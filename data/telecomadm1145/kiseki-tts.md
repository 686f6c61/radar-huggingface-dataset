# telecomadm1145/Kiseki-TTS

## Resumen

Kiseki-TTS es un modelo de síntesis de voz (text-to-speech) en japonés desarrollado por telecomadm1145, con una arquitectura híbrida que combina un encoder Transformer bidireccional con un decoder basado en Mamba2, un modelo de espacio de estados (SSM) de tiempo lineal. El modelo genera tokens de audio discretos a 12,5 Hz (80 ms por frame) utilizando el codec neuronal de Qwen3 (`Qwen/Qwen3-TTS-Tokenizer-12Hz`), y es capaz de decodificar esos tokens a forma de onda. Además, el mismo checkpoint también realiza reconocimiento de voz (ASR) japonés, ya que TTS y ASR se entrenaron conjuntamente en una única tarea multitarea.

Con aproximadamente 411 millones de parámetros (0,41 B), Kiseki-TTS es un modelo compacto diseñado para ser rápido y eficiente en memoria: el decoder Mamba2 no utiliza self-attention causal, por lo que el coste de generación es constante por frame y no crece con la duración del audio. Está finetuneado a partir de `telecomadm1145/Kiseki-1.1-0.3B`, un modelo de traducción seq2seq, y se distribuye bajo licencia MIT. Su relevancia radica en ofrecer una alternativa ligera y de baja latencia para síntesis de voz japonesa, con una huella de memoria reducida y sin gestión de caché KV.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder: encoder Transformer bidireccional (12 capas, self-attention + RoPE + SwiGLU) y decoder Mamba2 SSM (6 capas, cross-attention + Mamba2, sin self-attention) |
| Parametros totales | 411.134.016 (≈0,41 B: ≈0,33 B backbone + ≈78 M rama de audio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 frames de audio (≈41 s) como máximo entrenado; contexto de texto no especificado |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kiseki-TTS emplea una arquitectura encoder-decoder asimétrica. El encoder es un Transformer de 12 capas con self-attention bidireccional, RoPE y SwiGLU, que procesa el texto de entrada una sola vez. El decoder, de 6 capas, combina cross-attention (cuyas claves y valores se calculan una única vez durante el prefill) con un bloque Mamba2 SSM que sustituye por completo la self-attention causal. Esto implica que el estado recurrente es de tamaño fijo (32 cabezas × 128 de estado × 64 de dimensión) y no crece con la longitud de la secuencia, eliminando la necesidad de gestionar caché KV.

La generación de audio se realiza a 12,5 Hz, con 16 capas de cuantizador (codebooks) de 2048 códigos cada una, lo que da un bitrate nominal de 2,2 kbps. Para predecir los 16 codebooks de cada frame, el modelo utiliza una cabeza de "multi-token prediction" (MTP) compartida: cada capa q condiciona sobre la suma exclusiva de los embeddings de las capas anteriores, permitiendo resolver los 16 niveles con una sola evaluación del tronco del decoder y 16 evaluaciones ligeras de la cabeza. El entrenamiento se realizó sobre el dataset `telecomadm1145/asmr_archive_qwentts_encoded`, en una configuración multitarea que combina TTS y ASR, partiendo del modelo base `Kiseki-1.1-0.3B`.

## Capacidades

- Generación de voz en japonés a partir de texto, produciendo tokens de audio a 12,5 Hz que se decodifican a forma de onda mediante el codec Qwen3.
- Reconocimiento de voz (ASR) japonés: el mismo checkpoint puede transcribir audio a texto, consumiendo únicamente la primera capa del cuantizador.
- Generación de audio de larga duración: al ser un SSM con estado O(1), el coste por frame es constante, permitiendo sintetizar hasta 41 segundos (512 frames) sin degradación por memoria.
- Decodificación eficiente: el decoder tiene solo 6 capas y no requiere self-attention, lo que reduce la latencia por frame.
- Soporte de múltiples codebooks (16) con una cabeza MTP compartida, optimizando el coste computacional frente a modelos que predicen cada codebook de forma autoregresiva.
- Capacidad de procesamiento de texto con vocabulario de 65.792 tokens, compartido entre encoder, decoder y cabeza de salida.

## Casos de uso

- Síntesis de voz para asistentes virtuales en japonés: el modelo puede generar respuestas habladas de baja latencia, adecuado para aplicaciones interactivas donde la memoria y la velocidad son críticas.
- Generación de audiolibros o contenido narrado: gracias a su capacidad de manejar secuencias largas (hasta 41 s) sin degradación, puede producir narraciones extensas de forma incremental.
- Subtitulado automático y transcripción: la funcionalidad ASR integrada permite transcribir audio japonés a texto, útil para generar subtítulos o indexar contenido multimedia.
- Prototipado rápido de aplicaciones TTS: al ser un modelo pequeño (0,41 B) con licencia MIT, se puede integrar en entornos de desarrollo sin restricciones comerciales.
- Sistemas de accesibilidad: conversión de texto a voz para personas con discapacidad visual, con requisitos de hardware modestos.
- Investigación en modelos de espacio de estados aplicados a audio: sirve como referencia para estudiar la eficiencia de Mamba2 en tareas de generación de voz frente a arquitecturas basadas en atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) para ASR, ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: con 411 M de parámetros, en FP32 el peso ocupa ~1,6 GB; en FP16 ~0,8 GB. Considerando activaciones y overhead, una GPU con 4 GB de VRAM es suficiente para inferencia en lote pequeño.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 2060, RTX 3060, o superiores. También puede ejecutarse en CPU para tareas no interactivas, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y baja gracias a su tamaño reducido y al decoder SSM que no requiere caché KV.
- Opciones de despliegue: al ser un modelo de transformers con `trust_remote_code`, se puede cargar con la librería `transformers` de HuggingFace. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama; el despliegue típico sería mediante un script Python con PyTorch.
- Latencia y throughput: no se proporcionan cifras exactas, pero la arquitectura de 12,5 Hz y el decoder de 6 capas sugieren una latencia por frame muy baja; la generación de 10 segundos de audio requiere 125 pasos del tronco del decoder.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos TTS en la información proporcionada. No hay datos de benchmarks ni métricas objetivas que permitan una comparación cuantitativa con alternativas como VITS, Tacotron2, StyleTTS2 u otros sistemas TTS japoneses. La única referencia es el modelo base `Kiseki-1.1-0.3B` y el codec Qwen3, pero no se ofrecen comparaciones de rendimiento.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para japonés; no soporta otros idiomas.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado sobre un dataset de archivos ASMR (según el nombre del dataset), podría presentar sesgos en el estilo de habla o en el vocabulario.
- Riesgo de alucinación en ASR: como cualquier sistema de reconocimiento de voz, puede producir transcripciones incorrectas, especialmente con audio ruidoso o fuera de distribución.
- La longitud máxima de audio entrenada es de 512 frames (≈41 s); generar secuencias más largas puede degradar la calidad o fallar.
- No se especifican cuantizaciones oficiales; el uso de cuantización no probada podría afectar a la estabilidad del modelo.
- Aunque la licencia MIT permite uso comercial, el modelo depende del codec Qwen3 (`Qwen/Qwen3-TTS-Tokenizer-12Hz`), cuya licencia debe verificarse por separado.
- El modelo requiere `trust_remote_code=True` al cargarlo, lo que implica ejecutar código personalizado del autor; se recomienda auditar el código antes de usarlo en producción.

## Enlaces

- [HuggingFace: telecomadm1145/Kiseki-TTS](https://huggingface.co/telecomadm1145/Kiseki-TTS)
- [Modelo base: telecomadm1145/Kiseki-1.1-0.3B](https://huggingface.co/telecomadm1145/Kiseki-1.1-0.3B)
- [Codec de audio: Qwen/Qwen3-TTS-Tokenizer-12Hz](https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz)
- [Dataset de entrenamiento: telecomadm1145/asmr_archive_qwentts_encoded](https://huggingface.co/datasets/telecomadm1145/asmr_archive_qwentts_encoded)
