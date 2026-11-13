# xix3r/voxix-moonshine-tiny-vi-gguf

## Resumen

voxix-moonshine-tiny-vi-gguf es una conversión al formato GGUF del modelo UsefulSensors/moonshine-tiny-vi, un sistema de reconocimiento automático del habla (ASR) desarrollado originalmente por Moonshine AI (anteriormente Useful Sensors) y afinado para vietnamita. La conversión la mantiene el usuario xix3r y está pensada para su uso con transcribe.cpp, una implementación en C++ del pipeline de inferencia de Moonshine. El modelo resuelve la transcripción de audio a texto en vietnamita con un coste computacional muy bajo, lo que lo hace apto para despliegues en dispositivos con recursos limitados.

Arquitectónicamente es un transformer encoder-decoder de 27.092.736 parámetros (unos 27 M), la misma estructura que moonshine-tiny, pero entrenado específicamente para vietnamita. Consume PCM crudo a 16 kHz mediante un stem de tres capas Conv1d, sin STFT ni banco de filtros mel, y emite únicamente la transcripción, sin traducción, detección de idioma ni marcas de tiempo. Su relevancia actual reside en que ofrece una alternativa ultraligera y de licencia MIT a modelos ASR mucho más grandes, con un WER de 13,16 % en el test de FLEURS vietnamita y una velocidad de inferencia muy superior a la del tiempo real incluso en CPU.

El repositorio está etiquetado con la librería transcribe.cpp y contiene tres cuantizaciones (F32, F16 y Q8_0) con tamaños de 105 MB, 57 MB y 34 MB respectivamente. Al ser una conversión de un modelo base con licencia MIT, hereda esa misma licencia, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Moonshine), stem Conv1d de 3 capas sobre PCM crudo a 16 kHz |
| Parametros totales | 27.092.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de generación por defecto: 192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de 27 M de parámetros que sigue la arquitectura Moonshine. A diferencia de Whisper, no utiliza espectrogramas mel ni STFT: la entrada es PCM crudo a 16 kHz que pasa por un stem de tres capas Conv1d antes del encoder. La salida es únicamente texto transcrito, sin etiquetas de idioma, sin traducción y sin marcas de tiempo. El modelo base fue afinado por Useful Sensors/Moonshine AI sobre vietnamita a partir de moonshine-tiny; la conversión GGUF se realizó desde el commit d4d20da del modelo base (fijado el 2026-05-12) y se validó contra la referencia de Transformers en el commit 90bf720 de transcribe.cpp el mismo día.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card original remite al paper arXiv:2509.02523 para los detalles de entrenamiento y evaluación. La decodificación por defecto es greedy con num_beams=1 y max_length=192, coherente con la generation_config del modelo original; la model card advierte que limitar la longitud máxima de generación según la duración del audio ayuda a evitar bucles de alucinación.

## Capacidades

- Transcripción de voz a texto en vietnamita a partir de audio PCM mono a 16 kHz.
- Procesamiento de audio sin preprocesado espectral: acepta forma de onda cruda, lo que simplifica el pipeline.
- Generación de transcripciones con decodificación greedy y control de longitud máxima.
- Inferencia eficiente en CPU y GPU de gama baja gracias a su tamaño reducido (34 MB en Q8_0).
- No soporta traducción.
- No soporta detección de idioma.
- No genera marcas de tiempo.
- No soporta streaming (streaming: false en la model card).
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo thinking ni capacidades de visión o audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz en vietnamita: el modelo convierte grabaciones mono a 16 kHz en texto con un WER de en torno al 13 % en FLEURS, suficiente para actas y resúmenes posteriores procesados por un LLM.
- Subtitulado offline de contenido audiovisual en vietnamita: aunque no genera marcas de tiempo, puede transcribir el audio completo y alinearse después con herramientas externas de forced alignment.
- Asistentes de voz embebidos en dispositivos con recursos limitados: con 34 MB en Q8_0 y un RTF de 45,5 en CPU (Ryzen 4750U) y 153,5 en CPU (M4 Max), cabe en microcontroladores de gama alta y en Raspberry Pi, permitiendo transcripción local sin conexión.
- Aplicaciones de accesibilidad para hablantes de vietnamita: transcripción en tiempo casi real de conversaciones presenciales en un móvil o portátil sin GPU dedicada.
- Preprocesado de datasets de audio en vietnamita: generación masiva de transcripciones para etiquetar corpus de voz antes de entrenar otros modelos, gracias al bajo coste por hora de audio.
- Automatización de atención al cliente por voz: integración en un pipeline que transcribe la consulta del usuario en vietnamita y la pasa a un sistema de gestión de tickets o a un LLM para generar la respuesta.
- Investigación en ASR de bajo resource: modelo de referencia ultraligero para experimentos de cuantización, destilación o comparación de arquitecturas sin STFT.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| WER FLEURS vi test (%) | 13,16 | 13,17 | 13,16 |
| Tamano (MB) | 105 | 57 | 34 |
| RTF Metal (M4 Max) | 127 | 127 | 127 |
| RTF CPU (M4 Max) | 153,5 | 153,5 | 153,5 |
| RTF Vulkan (Ryzen 4750U) | 56 | 56 | 56 |
| RTF CPU (Ryzen 4750U) | 45,5 | 45,5 | 45,5 |

El WER se midió sobre el split de test de FLEURS vietnamita (857 enunciados) con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192). La referencia en Transformers F32 sobre MPS obtuvo un 13,18 % de WER, dentro del ruido de los intervalos de confianza bootstrap. Q8_0 presenta una deriva adicional respecto a F16 típicamente inferior a 0,1 puntos porcentuales. El RTF (real-time factor) indica cuántas veces más rápido que el tiempo real procesa el audio; valores superiores a 1 implican procesamiento más rápido que la reproducción.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones (105 MB en F32, 57 MB en F16, 34 MB en Q8_0), incluyendo overhead del runtime.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan; no requiere GPU dedicada.
- Cabe en GPU de consumo: sí, en cualquier GPU integrada o dedicada, e incluso en CPU sin GPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), con soporte de backend Metal, Vulkan y CPU; los pesos originales pueden ejecutarse con Transformers (`MoonshineForConditionalGeneration`) en PyTorch.
- Latencia y throughput: RTF de 127 en Metal (M4 Max), 153,5 en CPU (M4 Max), 56 en Vulkan (Ryzen 4750U) y 45,5 en CPU (Ryzen 4750U); es decir, entre 45 y 153 veces más rápido que el tiempo real según plataforma.
- Requisito de entrada: audio mono a 16 kHz en WAV; para otros formatos, convertir previamente con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | WER FLEURS vi | Licencia | Formato |
|---|---|---:|---|---:|---|---|
| voxix-moonshine-tiny-vi-gguf | 27 M | no disponible | vi | 13,16 % | MIT | GGUF |
| Whisper tiny | 39 M | 30 s de audio | multilingue | no disponible | MIT | safetensors, GGUF |
| Whisper base | 74 M | 30 s de audio | multilingue | no disponible | MIT | safetensors, GGUF |
| Moonshine tiny (base) | 27 M | no disponible | en | no disponible | MIT | safetensors |

La comparación con Whisper tiny y base es la más directa por tamaño y propósito, pero no se dispone en la información proporcionada de sus WER en FLEURS vietnamita, por lo que no se puede establecer una comparación cuantitativa fiable. Moonshine tiny original está entrenado en inglés y no cubre vietnamita. La ventaja principal de este modelo frente a Whisper es la ausencia de preprocesado mel y su menor latencia en audio corto, además de su tamaño inferior.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe vietnamita; no detecta idioma ni traduce.
- No genera marcas de tiempo, lo que limita su uso directo en subtitulado sincronizado.
- No soporta streaming; requiere audio completo o segmentos cerrados.
- WER de 13,16 % en FLEURS implica un nivel de error no despreciable en producción; puede requerir revisión humana en dominios especializados (legal, médico, técnico).
- Riesgo de alucinación y bucles de generación si no se limita max_length en función de la duración del audio, tal como advierte la model card original.
- Sensible a la calidad del audio: al consumir PCM crudo sin normalización espectral, el ruido de fondo y las grabaciones de baja calidad pueden degradar la transcripción más que en modelos con front-end mel.
- Requiere audio mono a 16 kHz; otras frecuencias o canales deben convertirse previamente.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar el aviso de copyright y consultar la model card del modelo base para los términos completos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; validación limitada a la comparación con la referencia de Transformers, sin despliegues en producción documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xix3r/voxix-moonshine-tiny-vi-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-vi
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-vi/commit/d4d20da
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Paper de Moonshine: https://arxiv.org/abs/2509.02523
- Paper de model cards (Mitchell et al.): https://arxiv.org/abs/1810.03993
- Repositorio oficial de Moonshine: https://github.com/usefulsensors/moonshine
- Pesos F32: https://huggingface.co/handy-computer/moonshine-tiny-vi-gguf/resolve/main/moonshine-tiny-vi-F32.gguf
- Pesos F16: https://huggingface.co/handy-computer/moonshine-tiny-vi-gguf/resolve/main/moonshine-tiny-vi-F16.gguf
- Pesos Q8_0: https://huggingface.co/handy-computer/moonshine-tiny-vi-gguf/resolve/main/moonshine-tiny-vi-Q8_0.gguf
