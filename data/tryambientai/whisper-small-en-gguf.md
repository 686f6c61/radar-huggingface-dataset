# tryambientai/whisper-small.en-gguf

## Resumen

`tryambientai/whisper-small.en-gguf` es una conversión al formato GGUF del modelo `openai/whisper-small.en`, un sistema de reconocimiento automático del habla (ASR) desarrollado originalmente por OpenAI. La conversión la publica el usuario tryambientai y está pensada para su uso con transcribe.cpp, una implementación en C++ de la arquitectura Whisper que permite ejecutar la inferencia de forma nativa en CPU y GPU sin depender de Python ni de PyTorch. El modelo base es un transformer encoder-decoder con 241,75 millones de parámetros entrenado exclusivamente con audio en inglés.

La relevancia de esta ficha no está en el modelo en sí (Whisper small.en es un checkpoint bien conocido y ampliamente utilizado desde 2022), sino en el empaquetado: ofrece seis niveles de cuantización que van desde F32 (924 MB) hasta Q4_K_M (164 MB), con una calidad de transcripción prácticamente idéntica entre ellos según las mediciones del autor. Esto convierte al modelo en una opción atractiva para despliegues en entornos con recursos limitados, aplicaciones de escritorio, dispositivos de borde o pipelines donde el coste de arrancar un runtime de Python es prohibitivo.

El modelo procesa ventanas de audio de 30 segundos y emplea decodificación por trozos para audio de formato largo. Es monolingüe (solo inglés), no soporta traducción ni detección de idioma, y no está pensado para streaming en tiempo real según los metadatos del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq), ventanas de 30 s |
| Parametros totales | 241.750.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana; decodificación por trozos para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (solo inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es el Whisper small.en de OpenAI, un transformer encoder-decoder descrito en el paper *Robust Speech Recognition via Large-Scale Weak Supervision* (Radford et al., 2022). El encoder procesa espectrogramas Mel de 80 canales sobre ventanas de 30 segundos de audio a 16 kHz, y el decoder genera la transcripción de forma autorregresiva. El entrenamiento se realizó sobre 680.000 horas de audio etiquetado mediante supervisión débil a gran escala, lo que proporciona una capacidad de generalización notable a dominios y acentos no vistos sin necesidad de fine-tuning. La variante `small.en` se entrenó exclusivamente con datos en inglés y solo para la tarea de reconocimiento (no traducción), lo que la hace algo más rápida y precisa en inglés que el modelo multilingüe del mismo tamaño.

Esta conversión concreta no modifica la arquitectura ni los pesos más allá de la cuantización. El autor indica que los pesos se portaron desde el commit `e872752` del repositorio upstream (fijado el 2026-04-25) y se validaron contra la referencia de transformers en el commit `5.6.1` de transcribe.cpp el 2026-04-26. La decodificación por defecto de transcribe.cpp usa greedy decoding, `suppress_tokens`, fallback de temperatura y timestamps a nivel de segmento; esta configuración difiere de la de `model.generate()` de OpenAI (que por defecto aplica `<|notimestamps|>`), lo que explica pequeñas divergencias en el WER reportado.

## Capacidades

- Transcripción de voz a texto en inglés sobre audio de 16 kHz mono.
- Procesamiento de audio de formato largo mediante decodificación por trozos sobre ventanas de 30 segundos.
- Generación de timestamps a nivel de segmento.
- Ejecución nativa en CPU y GPU a través de transcribe.cpp, sin dependencias de Python.
- Seis niveles de cuantización con calidad de transcripción equivalente según las mediciones del autor.
- No soporta streaming en tiempo real (`streaming: false`).
- No soporta traducción de voz (`translate: false`).
- No soporta detección automática de idioma (`lang_detect: false`).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.

## Casos de uso

- Subtitulado automático de vídeo en inglés: el modelo genera timestamps a nivel de segmento, lo que permite producir ficheros de subtítulos alineados con el audio sin necesidad de un alineador externo. La cuantización Q4_K_M (164 MB) permite ejecutarlo en un portátil modesto.
- Transcripción de reuniones y notas de voz: al procesar audio largo por trozos de 30 segundos, puede transcribir grabaciones completas de forma secuencial. La licencia Apache-2.0 permite integrarlo en productos comerciales sin restricciones de atribución adicionales.
- Aplicaciones de escritorio offline: gracias al empaquetado GGUF y al runtime en C++, se puede distribuir dentro de una aplicación nativa sin arrastrar PyTorch ni CUDA como dependencias, reduciendo el tamaño del instalador y el tiempo de arranque.
- Preprocesado de datasets de audio: para pipelines de investigación que necesitan transcribir grandes volúmenes de audio en inglés, la velocidad reportada (RTF 104,4 en Metal sobre M4 Max; RTF 12,8 en Vulkan sobre Ryzen 4750U) permite procesar horas de audio en minutos sobre hardware de consumo.
- Indexación y búsqueda de contenido hablado: transcripción de archivos de audio o vídeo para construir índices de búsqueda textual. La ventana de 30 segundos y los timestamps facilitan mapear cada fragmento de texto a su posición temporal.
- Cumplimiento y auditoría de grabaciones: transcripción de llamadas o reuniones en inglés para revisión posterior, con la ventaja de que el modelo se ejecuta localmente y no requiere enviar audio a servicios externos.
- Prototipado rápido en dispositivos de borde: la variante Q4_K_M de 164 MB cabe en dispositivos con poca memoria y puede ejecutarse en CPU, lo que facilita pruebas de concepto en Raspberry Pi o portátiles antiguos.

## Benchmarks y rendimiento

El autor reporta WER sobre el split completo de LibriSpeech test-clean (2.620 utterances) con la decodificación por defecto de transcribe.cpp:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 924 MB | 3,09 % |
| F16 | 470 MB | 2,97 % |
| Q8_0 | 257 MB | 3,09 % |
| Q6_K | 202 MB | 2,97 % |
| Q5_K_M | 185 MB | 3,12 % |
| Q4_K_M | 164 MB | 3,08 % |

El propio autor señala que OpenAI reporta un 3,05 % en el mismo split y atribuye la divergencia a diferencias en la configuración de evaluación (timestamps activados en transcribe.cpp frente a `<|notimestamps|>` en `model.generate()`). También advierte que las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones.

Rendimiento (RTF, *real-time factor*; mayor es mejor):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 104,4 |
| Apple M4 Max | CPU | 10,3 |
| AMD Ryzen 4750U | Vulkan | 12,8 |
| AMD Ryzen 4750U | CPU | 3,6 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 164 MB (Q4_K_M) y 924 MB (F32) solo para los pesos; el consumo real añade overhead del runtime y buffers de activaciones, pero se mantiene muy por debajo de 2 GB en todos los casos.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) es suficiente. El autor reporta RTF 104,4 en un M4 Max con Metal y 12,8 en un Ryzen 4750U con Vulkan.
- Cabe en cualquier GPU de consumo, incluidas iGPU y GPUs de gama baja con 2 GB o menos de memoria. También funciona en CPU pura (RTF 10,3 en M4 Max; 3,6 en Ryzen 4750U), lo que significa que transcribe audio entre 3 y 10 veces más rápido que tiempo real.
- Opciones de despliegue: transcribe.cpp (runtime nativo en C++ con backends CPU, Metal y Vulkan). No se mencionan otros runtimes compatibles en la informacion disponible.
- Latencia y throughput: con RTF de 104,4 en Metal, una hora de audio se procesaría en aproximadamente 34 segundos; con RTF 3,6 en CPU de Ryzen 4750U, en unos 16 minutos. Son estimaciones derivadas del RTF reportado, no mediciones directas del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | WER LibriSpeech test-clean | Licencia | Formato |
|---|---:|---|---|---:|---|---|
| whisper-small.en (este, GGUF) | 241,75 M | 30 s por ventana | en | 3,09 % (Q8_0) | Apache-2.0 | GGUF |
| openai/whisper-small.en (original) | 241,75 M | 30 s por ventana | en | 3,05 % (reportado por OpenAI) | Apache-2.0 | PyTorch/safetensors |
| openai/whisper-small (multilingue) | 241,75 M | 30 s por ventana | multilingue | no disponible en la informacion proporcionada | Apache-2.0 | PyTorch/safetensors |
| openai/whisper-base.en | 74 M | 30 s por ventana | en | no disponible en la informacion proporcionada | Apache-2.0 | PyTorch/safetensors |

La comparación directa más relevante es con el checkpoint original de OpenAI: misma arquitectura, mismos parámetros y misma licencia, con una diferencia de WER de 0,04 puntos porcentuales atribuible a la configuración de decodificación. La ventaja diferencial de esta conversión es el formato GGUF y el runtime en C++, que elimina la dependencia de PyTorch y permite despliegues mucho más ligeros. No se dispone de datos de benchmarks para las variantes multilingüe o base.en en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe inglés. No detecta el idioma del audio ni traduce, por lo que alimentarlo con audio en otros idiomas producirá transcripciones incorrectas o alucinaciones.
- Riesgo de alucinación en silencios o ruido de fondo: el autor menciona explícitamente que las diferencias de WER entre ejecuciones se deben en gran parte a "short-clip hallucination outcomes on the noise floor", es decir, el modelo puede inventar texto en fragmentos con señal débil.
- Sin soporte de streaming: no es adecuado para aplicaciones de transcripción en tiempo real con latencia baja; está diseñado para procesar audio ya disponible.
- Ventana de 30 segundos: aunque la decodificación por trozos permite audio largo, la calidad puede degradarse en grabaciones con cambios bruscos de hablante o condiciones acústicas dentro de una misma ventana.
- Sin diarización de hablantes: el modelo no distingue entre interlocutores.
- Sensibilidad al formato de entrada: requiere audio a 16 kHz mono; es necesario remuestrear y convertir con herramientas externas como ffmpeg.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero se hereda del modelo base y conviene revisar los términos del checkpoint original de OpenAI para cualquier duda.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopción comunitaria ni de validación independiente más allá de la del propio autor.
- La validación numérica se hizo contra transformers en un único commit concreto de transcribe.cpp; cambios posteriores en el runtime podrían alterar el comportamiento.
- El repositorio enlaza descargas a `handy-computer/whisper-small.en-gguf` en lugar de a `tryambientai/whisper-small.en-gguf`, lo que sugiere que esta publicación es un espejo o una re-subida; conviene verificar la procedencia antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tryambientai/whisper-small.en-gguf
- Modelo base: https://huggingface.co/openai/whisper-small.en
- Commit del modelo base referenciado: https://huggingface.co/openai/whisper-small.en/commit/e872752
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-small.en.md
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
- Repositorio espejo de descargas: https://huggingface.co/handy-computer/whisper-small.en-gguf
