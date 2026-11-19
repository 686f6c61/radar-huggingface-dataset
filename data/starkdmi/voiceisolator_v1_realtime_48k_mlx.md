# starkdmi/VoiceIsolator_v1_Realtime_48K_MLX

## Resumen

Voice Isolator v1 Realtime 48K (MLX) es una conversión al formato MLX del modelo `inworld/voice-isolator` de Inworld AI, publicada por el usuario starkdmi. Se trata de un modelo de aislamiento de voz y supresión de ruido en tiempo real que procesa audio mono a 48 kHz y está diseñado para streaming de baja latencia. Con 58,2 millones de parámetros, es un modelo compacto orientado a la mejora de señal de voz en aplicaciones interactivas.

La relevancia de esta versión concreta radica en su formato MLX, que permite ejecutar la inferencia de forma nativa en hardware Apple Silicon. El autor reporta que un empuje en vivo de 20 ms tarda 7,7 ms en fp16 y 9,9 ms en fp32 (mediana) en una Apple M4 con GPU de 10 núcleos, con 20 ms de look-ahead. Esto lo hace viable para procesamiento de audio en tiempo real en dispositivos de consumo.

El modelo es causal, soporta un look-ahead entrenado de 0, 20 o 40 ms (63 ms de latencia algorítmica con 20 ms) y utiliza atención causal con caché KV junto con estado Mamba persistente entre ventanas. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida con atención causal (KV cache) y estado Mamba; 46 codificadores por banda y cabezas de decodificador |
| Parametros totales | 58,2 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por ventanas de audio, no contexto de texto) |
| Tipos de cuantizacion | fp16 y fp32 (únicos formatos publicados) |
| Idiomas soportados | no disponible (procesamiento de señal de voz, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (metadata `format: voice-isolator-mlx`, `format_version: 3`) |

## Arquitectura y entrenamiento

El modelo es una arquitectura híbrida que combina atención causal con caché KV y estado Mamba persistente entre ventanas de audio, lo que permite streaming continuo sin recálculo del histórico. El procesamiento se organiza en 46 codificadores por banda y cabezas de decodificador empaquetados en tensores batched con padding; las direcciones Mamba están apiladas y sus proyecciones de salida plegadas en float64. Se incluye la ventana STFT exacta de `torch.hann_window(2048)` almacenada como `stft.window` para reproducir fielmente el preprocesado.

El modelo original fue entrenado por Inworld AI con un look-ahead configurable de 0, 20 o 40 ms. La conversión a MLX preserva los bits float32 en los parámetros de scan, las proyecciones de salida Mamba y la ventana STFT, ya que en el modelo offline las activaciones pre-norm de Mamba exceden el rango de float16. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Aislamiento de voz en tiempo real: separa la voz humana del ruido de fondo en audio mono a 48 kHz.
- Supresión de ruido: elimina ruido estacionario y no estacionario del habla.
- Streaming de baja latencia: procesa empujes de audio de cualquier tamaño con estado persistente entre ventanas.
- Look-ahead configurable: 0, 20 o 40 ms según el equilibrio latencia/calidad deseado.
- Procesamiento causal: adecuado para aplicaciones interactivas en vivo.
- Ejecución nativa en Apple Silicon mediante MLX Swift.
- Compatibilidad numérica: la salida fp32 difiere como máximo 1,1e-6 respecto a la referencia PyTorch en float32; la salida fp16 mantiene 65-75 dB de SNR respecto a fp32 en dos clips de demostración.
- No soporta tool calling, agentes ni razonamiento multi-step (es un modelo de audio-to-audio).

## Casos de uso

- Llamadas VoIP y videoconferencia: el modelo puede limpiar la señal de micrófono en tiempo real con 63 ms de latencia algorítmica (look-ahead de 20 ms), adecuado para conversaciones interactivas donde la latencia percibida debe mantenerse por debajo de 100 ms.
- Asistentes de voz en dispositivos Apple: al ejecutarse con MLX Swift en Apple Silicon, puede integrarse en apps macOS/iOS para preprocesar audio antes del reconocimiento de voz, con un coste de 7,7 ms por ventana de 20 ms en una M4.
- Grabación y podcasting: mejora de grabaciones con ruido de fondo mediante el modo offline del modelo hermano (`VoiceIsolator_v1_48K_MLX`), o en streaming para monitorización en vivo.
- Transcripción automática en entornos ruidosos: como etapa de preprocesado antes de un ASR, reduciendo la tasa de error en entornos con ruido ambiental.
- Comunicaciones de emergencia y radio: aislamiento de voz en transmisiones con ruido de fondo severo, donde la latencia controlada y el procesamiento causal son requisitos.
- Reuniones remotas y grabación de clases: limpieza de audio en pipelines de captura en vivo para mejorar la inteligibilidad antes de la codificación o el almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo de audio y no de lenguaje.

Los únicos datos de rendimiento proporcionados son mediciones de latencia del autor:

| Medicion | Valor |
|---|---|
| Latencia por empuje de 20 ms (fp16, Apple M4, MLX Swift) | 7,7 ms (mediana) |
| Latencia por empuje de 20 ms (fp32, Apple M4, MLX Swift) | 9,9 ms (mediana) |
| Latencia algorítmica con look-ahead de 20 ms | 63 ms |
| Diferencia máxima fp32 MLX vs PyTorch referencia (float32) | 1,1e-6 |
| SNR fp16 vs fp32 en dos clips de demostración | 65-75 dB |

## Requisitos de hardware

- VRAM estimada: el archivo fp16 ocupa 139 MiB y el fp32 253 MiB; el repositorio completo es de 0,4 GB. El modelo cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: Apple Silicon (M-series) con MLX Swift, que es el backend soportado oficialmente. No se documenta soporte para CUDA ni ROCm en esta conversión.
- Cabe en GPU de consumo: sí, con amplio margen; el modelo es de 58,2 M de parámetros.
- Opciones de despliegue: MLX Swift mediante el paquete `starkdmi/VoiceIsolatorMLX`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 7,7 ms por ventana de 20 ms en fp16 y 9,9 ms en fp32 en una Apple M4 (GPU de 10 núcleos), con look-ahead de 20 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia | Latencia | Licencia | Formato |
|---|---|---|---|---|---|
| VoiceIsolator_v1_Realtime_48K_MLX (este) | 58,2 M | 48 kHz | 63 ms (look-ahead 20 ms) | Apache-2.0 | safetensors MLX |
| inworld/voice-isolator (original) | 58,2 M | 48 kHz | 63 ms (look-ahead 20 ms) | Apache-2.0 | safetensors PyTorch |
| starkdmi/VoiceIsolator_v1_48K_MLX (offline) | 58,2 M | 48 kHz | no disponible (offline) | Apache-2.0 | safetensors MLX |

No se dispone de información sobre otros modelos comparables de aislamiento de voz en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al ser un modelo de señal de audio, los sesgos se refieren a posibles artefactos en determinados tipos de voz o ruido, no documentados.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero puede introducir artefactos o distorsión en la señal reconstruida, especialmente en condiciones de ruido extremo o voces no representadas en el entrenamiento.
- Limitaciones de contexto o idioma: el modelo procesa audio mono a 48 kHz; no se documentan limitaciones por idioma, pero tampoco se confirma soporte multilingüe explícito.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los pesos son de Inworld AI (Copyright 2026) y el archivo NOTICE contiene atribuciones de datos de entrenamiento que deben conservarse.
- Caveat para producción: esta conversión solo está validada con MLX Swift en Apple Silicon; no se documenta soporte para otros backends. La precisión fp16 mantiene 65-75 dB de SNR respecto a fp32, lo que puede ser insuficiente para aplicaciones de masterización de audio.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/starkdmi/VoiceIsolator_v1_Realtime_48K_MLX
- Modelo base: https://huggingface.co/inworld/voice-isolator
- Modelo offline MLX: https://huggingface.co/starkdmi/VoiceIsolator_v1_48K_MLX
- Código (MLX Swift): https://github.com/starkdmi/VoiceIsolatorMLX
