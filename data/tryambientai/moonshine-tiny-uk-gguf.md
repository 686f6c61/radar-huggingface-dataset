# tryambientai/moonshine-tiny-uk-gguf

## Resumen

moonshine-tiny-uk-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-tiny-uk, publicada por el usuario tryambientai para su uso con la librería transcribe.cpp. El modelo base es un Moonshine tiny de Moonshine AI (anteriormente Useful Sensors) afinado específicamente para ucraniano, con arquitectura encoder-decoder transformer de 27.092.736 parámetros totales. Esta conversión permite ejecutar el modelo en C++ sin dependencias de Python, con soporte para CPU, Metal y Vulkan.

El modelo resuelve el problema de la transcripción de voz a texto en ucraniano en entornos con recursos limitados: con solo 27 millones de parámetros y pesos que ocupan entre 34 MB (Q8_0) y 105 MB (F32), puede desplegarse en dispositivos de borde, portátiles y sistemas embebidos. La relevancia actual radica en que ofrece una alternativa ultraligera a Whisper para un idioma concreto, con un WER de referencia del 18,82-18,89 % en FLEURS-uk y velocidades de inferencia muy superiores al tiempo real (RTF de 127 en Metal sobre M4 Max).

La conversión está validada numéricamente contra la referencia de Transformers en fp32 sobre MPS (18,86 % WER), con una deriva prácticamente nula entre F32, F16 y Q8_0. El modelo es monolingüe (ucraniano), no soporta traducción, detección de idioma ni marcas de tiempo, y no es apto para streaming según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Moonshine tiny), con stem Conv1d de tres capas sobre PCM crudo a 16 kHz |
| Parametros totales | 27.092.736 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo ASR; max_length de generación por defecto 192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Ucraniano (uk) únicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); el modelo base en safetensors |
| Tamano de pesos | F32: 105 MB; F16: 57 MB; Q8_0: 34 MB |
| Frecuencia de muestreo de entrada | 16 kHz mono PCM |
| Libreria de inferencia | transcribe.cpp |
| Modelo base | UsefulSensors/moonshine-tiny-uk (commit 8cf70f4, fijado 2026-05-12) |
| Commit de validacion transcribe.cpp | 90bf720 (2026-05-12) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine tiny: un encoder-decoder transformer que consume PCM crudo de 16 kHz a través de un stem de tres capas Conv1d, sin STFT ni banco de filtros mel. Esta decisión de diseño elimina el preprocesamiento espectral típico de Whisper y reduce la latencia y el coste computacional en audio de duración variable. El decoder emite únicamente la transcripción, sin tokens especiales de idioma, traducción ni marcas de tiempo.

Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La model card upstream remite al paper arXiv:2509.02523 para la descripción completa del entrenamiento. La conversión GGUF fue realizada por tryambientai a partir del commit 8cf70f4 del modelo base y validada contra la referencia de Transformers en el commit 90bf720 de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en ucraniano a partir de audio PCM de 16 kHz mono.
- Inferencia en C++ puro mediante transcribe.cpp, sin dependencias de Python.
- Ejecución en CPU, Metal (Apple Silicon) y Vulkan (GPU integradas y discretas compatibles).
- Cuantización a F32, F16 y Q8_0 con deriva numérica mínima respecto a la referencia.
- Decodificación greedy (num_beams=1) con max_length=192, coincidente con la generación upstream.
- No soporta streaming (streaming: false en la model card).
- No soporta traducción (translate: false).
- No soporta detección de idioma (lang_detect: false).
- No genera marcas de tiempo (timestamps: none).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje general).

## Casos de uso

- Transcripción de reuniones y notas de voz en ucraniano: el modelo procesa audio de 16 kHz mono y genera la transcripción completa; su tamaño de 34 MB en Q8_0 permite ejecutarlo en un portátil sin GPU dedicada con RTF de 45,5 en CPU Ryzen 4750U.
- Subtitulado offline de contenido audiovisual ucraniano: conversión previa con ffmpeg a WAV 16 kHz mono y transcripción por lotes; la ausencia de marcas de tiempo obliga a alinear los segmentos por duración externa.
- Asistentes de voz embebidos en dispositivos de borde: con 27 M de parámetros y pesos de 34 MB, cabe en sistemas con memoria limitada y se ejecuta en CPU o Vulkan sin acelerador dedicado.
- Transcripción en tiempo casi real en Apple Silicon: con RTF de 127 en Metal sobre M4 Max, el modelo procesa audio más de dos órdenes de magnitud más rápido que el tiempo real, apto para dictado y captura de voz.
- Pipeline de accesibilidad para hablantes de ucraniano: integración en aplicaciones de escritorio o móviles mediante transcribe.cpp para generar texto a partir de audio en tiempo de ejecución.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: la variante Q8_0 con RTF de 45,5 en CPU permite transcribir grandes volúmenes con coste hardware mínimo.
- Investigación en ASR de bajos recursos: modelo de referencia ultraligero para experimentos de cuantización, comparación de arquitecturas sin STFT y evaluación en FLEURS-uk.

## Benchmarks y rendimiento

WER medido sobre el split de test de FLEURS-uk (750 enunciados) con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192):

| Cuantizacion | WER FLEURS-uk | Tamano |
|---|---:|---:|
| F32 | 18,83 % | 105 MB |
| F16 | 18,82 % | 57 MB |
| Q8_0 | 18,89 % | 34 MB |
| Referencia Transformers F32 (MPS) | 18,86 % | — |

Rendimiento de inferencia (RTF, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 127 |
| Apple M4 Max | CPU | 153,5 |
| AMD Ryzen 4750U | Vulkan | 56 |
| AMD Ryzen 4750U | CPU | 45,5 |

UsefulSensors no publica un WER por idioma para esta variante; los valores anteriores proceden de la validación de la conversión GGUF contra la referencia de Transformers, con diferencias dentro del ruido del intervalo de confianza bootstrap. Q8_0 introduce una deriva adicional típicamente inferior a 0,1 puntos porcentuales respecto a F16.

## Requisitos de hardware

- VRAM estimada: inferior a 200 MB en todas las cuantizaciones (F32: 105 MB de pesos; Q8_0: 34 MB), más overhead mínimo de runtime.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Aceleración disponible en Apple Silicon vía Metal (M4 Max: RTF 127) y en GPU con soporte Vulkan (Ryzen 4750U: RTF 56).
- Cabe en cualquier GPU consumer, incluida RTX 4090, y también en iGPU y dispositivos de borde; el cuello de botella no es la VRAM sino el soporte de backend.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`); el modelo base es compatible con Transformers (`MoonshineForConditionalGeneration`) y con el ecosistema Hugging Face.
- Latencia y throughput: RTF de 127-153,5 en M4 Max y 45,5-56 en Ryzen 4750U, es decir, entre 45 y 153 veces más rápido que el tiempo real según plataforma.
- Preprocesamiento requerido: audio de entrada en WAV 16 kHz mono; conversión con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/entrada | WER FLEURS-uk | Licencia | Formato |
|---|---|---:|---|---:|---|---|
| moonshine-tiny-uk-gguf | 27,1 M | uk | PCM 16 kHz | 18,82-18,89 % | MIT | GGUF |
| UsefulSensors/moonshine-tiny-uk (base) | 27,1 M | uk | PCM 16 kHz | 18,86 % (ref. Transformers) | MIT | safetensors |
| Whisper tiny | no disponible en la informacion | multilingue | mel spectrogram | no disponible | MIT | safetensors, GGUF |
| Moonshine tiny (original, ingles) | ~27 M | en | PCM 16 kHz | no disponible | MIT | safetensors, GGUF |

Los datos de Whisper tiny y del Moonshine tiny original no están disponibles en la información proporcionada; la comparación se limita a confirmar que esta conversión reproduce fielmente el modelo base con un coste de almacenamiento entre 2 y 3 veces menor en Q8_0.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe ucraniano; no detecta idioma ni traduce, por lo que audio en otros idiomas producirá salidas incorrectas o alucinadas.
- Sin marcas de tiempo: no es posible alinear la transcripción con el audio sin procesamiento externo.
- Sin soporte de streaming: la model card indica `streaming: false`; no apto para dictado en vivo sin segmentación manual.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto plausible en segmentos de silencio o ruido; la model card upstream advierte de este riesgo y recomienda limitar `max_length` en función de la duración del audio.
- WER de referencia del 18,8 % en FLEURS-uk: adecuado para dictado y búsqueda, pero insuficiente para transcripción legal o médica sin revisión humana.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al derivar de Whisper en su diseño y riesgos, pueden heredarse sesgos de género, acento y dialecto no evaluados en esta variante.
- Licencia MIT: permite uso comercial sin restricciones adicionales, heredada del modelo base; consultar la model card upstream para los términos completos.
- Dependencia de transcribe.cpp: el GGUF está validado contra un commit concreto (90bf720); cambios en la librería pueden alterar la compatibilidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- HuggingFace (conversión GGUF): https://huggingface.co/tryambientai/moonshine-tiny-uk-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-uk
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-uk/commit/8cf70f4
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Paper de Moonshine: https://arxiv.org/abs/2509.02523
- Paper de model cards (Mitchell et al.): https://arxiv.org/abs/1810.03993
- Repositorio Moonshine (instalación): https://github.com/usefulsensors/moonshine/blob/main/README.md
- Model card de Whisper (referencia de riesgos): https://github.com/openai/whisper/blob/main/model-card.md
- Pesos GGUF (espejo handy-computer): https://huggingface.co/handy-computer/moonshine-tiny-uk-gguf
