# xix3r/voxix-moonshine-tiny-ko-gguf

## Resumen

voxix-moonshine-tiny-ko-gguf es una conversión al formato GGUF del modelo UsefulSensors/moonshine-tiny-ko, una variante de Moonshine Tiny especializada en reconocimiento automático de voz (ASR) en coreano. Lo publica el usuario xix3r dentro del ecosistema transcribe.cpp, la implementación en C++ desarrollada por handy-computer para ejecutar modelos de transcripción en hardware modesto. El modelo hereda la arquitectura encoder-decoder de Moonshine Tiny, con 27.092.736 parámetros totales, y está pensado para inferencia en dispositivos con recursos limitados (edge).

La relevancia de esta ficha es doble. Por un lado, Moonshine es una familia de modelos ASR diseñada explícitamente para superar a Whisper Tiny en eficiencia y precisión sobre hardware restringido, y la variante "Flavors of Moonshine" cubre idiomas poco representados como el coreano. Por otro, la conversión a GGUF permite ejecutar el modelo con transcribe.cpp en CPU y GPU de consumo, sin depender de PyTorch ni de CUDA, lo que facilita su integración en aplicaciones locales.

Se trata de un modelo monolingüe (solo coreano), sin detección de idioma, sin traducción y sin marcas de tiempo. Consume PCM crudo a 16 kHz y emite únicamente la transcripción. La licencia es MIT, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine Tiny) con stem Conv1d de tres capas |
| Parámetros totales | 27.092.736 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (max_length de decodificación: 192) |
| Tipos de cuantización | F32, F16, Q8_0 |
| Idiomas soportados | coreano (ko) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); el modelo base en safetensors |
| Entrada de audio | PCM crudo a 16 kHz, mono (sin STFT ni mel filterbank) |
| Salida | solo transcripción (sin traducción, sin timestamps, sin detección de idioma) |
| Streaming | no soportado |
| Librería | transcribe.cpp |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine Tiny: un transformer encoder-decoder de 27M de parámetros. La diferencia clave respecto a Whisper es el frontend de audio: en lugar de calcular un espectrograma mel con STFT, Moonshine consume PCM crudo a 16 kHz y lo procesa mediante un stem de tres capas Conv1d. Esto reduce el coste computacional del preprocesado y elimina la dependencia de una ventana fija de 30 segundos, lo que permite procesar audio de duración variable de forma más eficiente. Según la model card upstream, los modelos Moonshine superan a Whisper Tiny de tamaño comparable en velocidad y precisión en dispositivos con recursos limitados.

Esta variante concreta es un fine-tuning de Moonshine Tiny sobre coreano, publicado por UsefulSensors (ahora Moonshine AI) dentro de la suite "Flavors of Moonshine", orientada a idiomas poco representados. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información debe consultarse en el paper arXiv:2509.02523. La conversión GGUF fue portada desde el commit 80995f0 del modelo base (fijado el 2026-05-12) y validada contra la referencia de Transformers en el commit 90bf720 de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en coreano a partir de audio PCM de 16 kHz.
- Procesamiento de audio de duración variable sin ventana fija de 30 segundos (ventaja del frontend Conv1d frente a Whisper).
- Inferencia en CPU y GPU de consumo mediante transcribe.cpp (backend Metal, Vulkan y CPU).
- Cuantización agresiva con pérdida mínima de precisión: Q8_0 ocupa 34 MB y mantiene el CER dentro de 0,01 puntos porcentuales respecto a F16.
- No soporta tool calling ni function calling (es un modelo ASR, no un LLM conversacional).
- No soporta agentes ni razonamiento multi-paso.
- No soporta traducción, detección de idioma ni marcas de tiempo.
- No soporta streaming.

## Casos de uso

- Transcripción local de reuniones en coreano: el modelo puede ejecutarse en un portátil sin GPU dedicada gracias a su tamaño de 34 MB en Q8_0 y a su backend CPU, procesando audio pregrabado de forma privada sin enviar datos a la nube.
- Subtitulado offline de contenido audiovisual coreano: útil para creadores o medios que necesitan generar transcripciones en lotes sobre máquinas modestas, con conversión previa del audio a WAV mono 16 kHz mediante ffmpeg.
- Asistentes de voz embebidos en dispositivos edge: el modelo cabe en memoria de sistemas con pocos recursos (34 MB en Q8_0) y no requiere PyTorch ni CUDA, lo que lo hace adecuado para Raspberry Pi o dispositivos similares.
- Investigación en ASR multilingüe: sirve como punto de comparación de bajo coste frente a Whisper Tiny en coreano, con métricas CER reproducibles sobre FLEURS-ko y una implementación C++ de referencia.
- Preprocesado de corpus de audio en coreano: para pipelines de etiquetado o minería de datos donde se necesita transcripción rápida y económica en CPU antes de un procesamiento posterior con modelos mayores.
- Aplicaciones de accesibilidad: transcripción en tiempo casi real (no streaming) de conversaciones grabadas para personas con dificultades auditivas, ejecutándose íntegramente en el dispositivo del usuario.
- Prototipado rápido de productos de voz para el mercado coreano: al ser MIT y ejecutable con un binario C++, permite validar ideas sin infraestructura de GPU ni costes de API.

## Benchmarks y rendimiento

La model card proporciona métricas de CER (character error rate) sobre el split de test de FLEURS-ko (382 utterances) usando la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192).

| Cuantización | Tamaño | CER (FLEURS-ko) |
|---|---:|---:|
| F32 | 105 MB | 8,97 % |
| F16 | 57 MB | 8,97 % |
| Q8_0 | 34 MB | 8,98 % |
| Referencia Transformers F32 (MPS) | — | 8,99 % |

Rendimiento en tiempo real (RTF, factor de tiempo real; menor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 127 |
| Apple M4 Max | CPU | 153,5 |
| AMD Ryzen 4750U | Vulkan | 56 |
| AMD Ryzen 4750U | CPU | 45,5 |

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican a un modelo ASR) en la información disponible. UsefulSensors no publica un CER por idioma para esta variante; el dato de 8,99 % corresponde a la ejecución de referencia realizada por el conversor.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier cuantización; el modelo completo en F32 ocupa 105 MB y en Q8_0 solo 34 MB.
- GPU recomendadas: no requiere GPU dedicada; funciona en Apple Silicon (Metal), GPUs AMD (Vulkan) y CPU. Cualquier GPU con soporte Metal o Vulkan es suficiente.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU; también en Raspberry Pi y dispositivos similares.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. El modelo base también es ejecutable con Transformers (`MoonshineForConditionalGeneration`).
- Latencia y throughput: los RTF medidos (127 en Metal sobre M4 Max, 45,5 en CPU sobre Ryzen 4750U) indican procesamiento muy por encima de tiempo real; no se dispone de cifras absolutas de latencia en milisegundos.
- Formato de entrada: WAV mono a 16 kHz; para otros formatos hay que convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto/ventana | Licencia | Formato | Notas |
|---|---|---:|---|---|---|---|
| moonshine-tiny-ko (este, GGUF) | 27,1 M | coreano | duración variable (Conv1d) | MIT | GGUF | CER 8,97 % en FLEURS-ko |
| Whisper Tiny | 39 M | multilingüe (99 idiomas) | ventana fija 30 s | MIT | safetensors, GGUF | Referencia de la categoría; Moonshine declara superarlo en eficiencia |
| Moonshine Tiny (original, inglés) | 27 M | inglés | duración variable | MIT | safetensors, GGUF | Misma arquitectura, sin especialización en coreano |
| Otras variantes "Flavors of Moonshine" | 27 M | idiomas varios | duración variable | MIT | safetensors | Suite de modelos especializados por idioma |

La comparación con Whisper Tiny es la más relevante: ambos son modelos ASR de menos de 40 M de parámetros y licencia MIT, pero Moonshine evita el espectrograma mel y la ventana fija de 30 segundos. No se dispone de cifras de CER comparativas de Whisper Tiny en coreano en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe coreano; no detecta idioma ni traduce. Audio en otros idiomas producirá salidas incorrectas o vacías.
- Sin marcas de tiempo: no apto para generar subtítulos sincronizados sin un alineamiento posterior.
- Sin streaming: no puede usarse en aplicaciones de transcripción en vivo; requiere audio pregrabado.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto plausible en segmentos con ruido, silencio o audio ininteligible.
- Sesgos: al estar entrenado sobre un corpus concreto (no detallado en la model card), puede tener peor rendimiento en acentos regionales, habla con ruido de fondo o dominios especializados (médico, legal, técnico).
- Requiere preprocesado estricto: entrada PCM mono a 16 kHz; audio en estéreo, otra frecuencia de muestreo o formatos comprimidos debe convertirse antes.
- Licencia MIT: permite uso comercial sin restricciones, pero se recomienda revisar los términos del modelo base upstream.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy incipiente, sin validación comunitaria amplia.
- La model card del conversor no documenta el proceso de cuantización más allá de los tres formatos ofrecidos ni pruebas fuera de FLEURS-ko.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xix3r/voxix-moonshine-tiny-ko-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-ko
- Conversión GGUF de referencia (handy-computer): https://huggingface.co/handy-computer/moonshine-tiny-ko-gguf
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación de Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Paper "Flavors of Moonshine": https://huggingface.co/papers/2509.02523
- Repositorio Moonshine (Moonshine AI): https://github.com/moonshine-ai/moonshine
- Repositorio Useful Sensors Moonshine: https://github.com/usefulsensors/moonshine
- Paper Model Cards for Model Reporting: https://arxiv.org/abs/1810.03993
- Model card de Whisper (OpenAI): https://github.com/openai/whisper/blob/main/model-card.md
