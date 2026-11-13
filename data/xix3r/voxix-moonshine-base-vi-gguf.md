# xix3r/voxix-moonshine-base-vi-gguf

## Resumen

voxix-moonshine-base-vi-gguf es una conversión al formato GGUF del modelo UsefulSensors/moonshine-base-vi, un sistema de reconocimiento automático de habla (ASR) especializado exclusivamente en vietnamita. Lo publica el usuario xix3r y está pensado para su uso con transcribe.cpp, el motor de inferencia en C++ del proyecto handy-computer. Se trata de una cuantización del checkpoint original, no de un entrenamiento nuevo: hereda la arquitectura y los pesos de Moonshine base afinado para vietnamita.

El modelo emplea una arquitectura transformer encoder-decoder de 61,5 millones de parámetros (la variante "base" de Moonshine), diseñada para consumir PCM crudo a 16 kHz mediante un stem de tres capas Conv1d, sin STFT ni banco de filtros mel. La salida es únicamente transcripción, sin marcas de tiempo, sin detección de idioma y sin traducción. Su relevancia práctica reside en que ofrece un ASR ligero (74 MB en Q8_0) que cabe en hardware muy modesto y se ejecuta tanto en CPU como en GPU mediante Metal o Vulkan.

La información disponible procede casi por completo de la model card del autor de la conversión; la model card original de UsefulSensors está mayoritariamente sin rellenar ("More Information Needed"), por lo que muchos detalles de entrenamiento y evaluación no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine base), stem Conv1d de 3 capas sobre PCM crudo a 16 kHz |
| Parametros totales | 61.513.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (max_length de decodificación: 192 tokens) |
| Tipos de cuantizacion | F32 (236 MB), F16 (126 MB), Q8_0 (74 MB) |
| Idiomas soportados | Vietnamita (vi) únicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (librería transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de 62 millones de parámetros con la misma arquitectura que moonshine-base. La entrada de audio se procesa mediante un stem de tres capas convolucionales 1D que consume directamente PCM a 16 kHz, evitando el preprocesado clásico basado en STFT y banco de filtros mel. El decodificador genera únicamente texto de transcripción. El checkpoint es un ajuste fino de Moonshine base sobre vietnamita, realizado por UsefulSensors.

No hay información disponible sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card original de UsefulSensors no documenta estos extremos. La conversión a GGUF se realizó a partir del commit 0ee9ce9 del modelo base (fijado el 2026-05-12) y se validó numéricamente contra la referencia de transformers en el commit 90bf720 de transcribe.cpp el 2026-05-12. La decodificación por defecto es greedy con num_beams=1 y max_length=192, coincidiendo con la generation_config original.

## Capacidades

- Transcripción de voz a texto en vietnamita a partir de audio PCM mono a 16 kHz.
- Procesamiento de audio sin preprocesado espectral: acepta señal cruda, lo que simplifica el pipeline de inferencia.
- Ejecución en CPU y GPU (Metal en Apple Silicon, Vulkan en GPUs de AMD/Intel/NVIDIA compatibles) a través de transcribe.cpp.
- Modelo de una sola lengua: no realiza detección de idioma, traducción ni generación de marcas de tiempo.
- No soporta streaming (streaming: false en la model card).
- No dispone de tool calling, function calling ni capacidades de agente; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en vietnamita: el modelo convierte grabaciones de 16 kHz mono en texto plano con un WER en torno al 9,7 % en FLEURS-vi, suficiente para actas y resúmenes posteriores procesados por un LLM.
- Subtitulado automático de contenido audiovisual vietnamita: al no generar marcas de tiempo, se usaría para producir la pista de texto y un alineador externo añadiría los tiempos.
- Dictado y entrada de voz en aplicaciones de escritorio: con 74 MB en Q8_0 y ejecución en CPU, puede integrarse en herramientas locales sin GPU dedicada.
- Preprocesado de corpus de audio para investigación en PLN: transcripción masiva de grabaciones vietnamitas en un servidor sin acelerador, dado su bajo coste computacional.
- Asistentes de voz embebidos en dispositivos de gama baja: el tamaño reducido y el soporte de Vulkan/CPU permiten desplegarlo en mini-PC o placas con GPU integrada.
- Análisis de llamadas de atención al cliente en vietnamita: transcripción por lotes de grabaciones telefónicas (previa conversión a 16 kHz mono con ffmpeg) para su posterior clasificación o búsqueda.
- Accesibilidad: generación de transcripciones de vídeos o podcasts en vietnamita para personas con discapacidad auditiva.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| WER FLEURS-vi test (857 utterances) | 9,67 % | 9,66 % | 9,79 % |
| RTF en M4 Max (Metal) | 79,5 | — | — |
| RTF en M4 Max (CPU) | 80,5 | — | — |
| RTF en Ryzen 4750U (Vulkan) | 34,5 | — | — |
| RTF en Ryzen 4750U (CPU) | 22 | — | — |

Referencia adicional: la ejecución del checkpoint original con transformers en F32 sobre MPS obtiene un 9,66 % de WER en el mismo manifiesto, por lo que las cifras de la conversión C++ quedan dentro del ruido del intervalo de confianza bootstrap. Q8_0 introduce una deriva típica inferior a 0,1 puntos porcentuales respecto a F16. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; Q8_0 ocupa 74 MB de pesos, F16 126 MB y F32 236 MB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan; no requiere aceleradores de datacenter como A100 o H100.
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 3060, GPUs integradas AMD/Intel con Vulkan, y Apple Silicon (M1 en adelante).
- Despliegue: exclusivamente mediante transcribe.cpp (compilación con CMake y binario transcribe-cli). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, dado que es un modelo ASR y no un LLM.
- Latencia y throughput: los valores RTF (real-time factor) publicados indican 79,5 en Metal y 80,5 en CPU sobre M4 Max, y 34,5 en Vulkan y 22 en CPU sobre Ryzen 4750U; a mayor RTF, mayor velocidad relativa respecto al tiempo real del audio.
- El audio de entrada debe convertirse previamente a WAV mono a 16 kHz (por ejemplo, con ffmpeg -ar 16000 -ac 1).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/audio | Licencia | Formato |
|---|---:|---|---|---|---|
| voxix-moonshine-base-vi-gguf | 61,5 M | Vietnamita | PCM 16 kHz, max_length 192 | MIT | GGUF (transcribe.cpp) |
| Whisper base | 74 M | Multilingüe (99 idiomas) | Ventanas de 30 s | MIT | Safetensors, GGUF, ONNX |
| Whisper small | 244 M | Multilingüe (99 idiomas) | Ventanas de 30 s | MIT | Safetensors, GGUF, ONNX |
| Moonshine base (original) | 62 M | Inglés | PCM 16 kHz | MIT | Safetensors |

No se dispone de datos de WER comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, idiomas y licencia. Whisper ofrece cobertura multilingüe y marcas de tiempo, mientras que Moonshine-vi prioriza un tamaño menor y un pipeline sin STFT para vietnamita.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe vietnamita; no detecta idioma ni traduce.
- No genera marcas de tiempo, lo que limita su uso directo en subtitulado sincronizado.
- No soporta streaming; requiere audio completo o segmentos cerrados.
- WER de referencia en torno al 9,7 % en FLEURS-vi, lo que implica errores apreciables en nombres propios, cifras y audio con ruido o acentos marcados.
- Riesgo de alucinación textual en segmentos de silencio o ruido, comportamiento habitual en modelos encoder-decoder de ASR.
- Sesgos: no documentados en la información disponible; la model card original de UsefulSensors no incluye sección de sesgos ni datos de composición del corpus de entrenamiento.
- Licencia MIT, permisiva para uso comercial, heredada del modelo base.
- Dependencia de transcribe.cpp: no hay soporte documentado en otros motores de inferencia, lo que condiciona la integración en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card original está mayoritariamente sin completar; conviene validar el modelo contra el checkpoint original antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/xix3r/voxix-moonshine-base-vi-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-base-vi
- Commit del modelo base usado: https://huggingface.co/UsefulSensors/moonshine-base-vi/commit/0ee9ce9
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación del modelo Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Descarga F32: https://huggingface.co/handy-computer/moonshine-base-vi-gguf/resolve/main/moonshine-base-vi-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/moonshine-base-vi-gguf/resolve/main/moonshine-base-vi-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/moonshine-base-vi-gguf/resolve/main/moonshine-base-vi-Q8_0.gguf
- Paper referenciado en los tags (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
