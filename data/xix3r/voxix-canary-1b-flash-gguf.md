# xix3r/voxix-canary-1b-flash-gguf

## Resumen

voxix-canary-1b-flash-gguf es una conversión a formato GGUF del modelo NVIDIA Canary 1B Flash, publicada por el usuario xix3r para su uso con el runtime transcribe.cpp. Se trata de un sistema de reconocimiento automático del habla (ASR) y traducción de voz multilingüe, no de un modelo de lenguaje generativo: recibe audio de 16 kHz mono y produce una transcripción o una traducción. El modelo base, nvidia/canary-1b-flash, está desarrollado por NVIDIA dentro de la familia NeMo Canary y se distribuye bajo licencia CC-BY-4.0, lo que permite uso comercial.

La relevancia de esta conversión concreta reside en que empaqueta el modelo original en cuantizaciones GGUF (desde F32 hasta Q4_K_M) ejecutables con transcribe.cpp, un runtime ligero que permite inferencia local en CPU, Metal y Vulkan sin depender del stack NeMo completo. Con 890 millones de parámetros y un tamaño que baja hasta los 677 MB en Q4_K_M, el modelo cabe en hardware de consumo y mantiene una tasa de error de palabra (WER) de 1,59 % en LibriSpeech test-clean, prácticamente idéntica a la del modelo en F32 (1,62 %).

El modelo cubre ASR en inglés, alemán, español y francés, además de traducción bidireccional entre inglés y las otras tres lenguas. No es un modelo de streaming y la versión portada no expone marcas de tiempo, que en el modelo original son una funcionalidad experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder multitask AED: encoder FastConformer de 32 capas y decoder Transformer de 4 capas |
| Parámetros totales | 890.042.496 (883 M según la model card de NVIDIA) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio, no de texto; entrada de 16 kHz mono) |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés, alemán, español, francés (ASR); traducción EN↔{DE, ES, FR} |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (runtime transcribe.cpp) |

Tamaños de archivo por cuantización: F32 3,56 GB, F16 1,79 GB, Q8_0 1,05 GB, Q6_K 858 MB, Q5_K_M 770 MB, Q4_K_M 677 MB. El repositorio completo ocupa 8,7 GB.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Canary, un esquema multitask AED (attention encoder-decoder) en el que un encoder FastConformer de 32 capas procesa el audio y un decoder Transformer de 4 capas genera la secuencia de texto. FastConformer es una variante de Conformer con downsampling de la secuencia de entrada, lo que reduce el coste computacional del encoder manteniendo la capacidad de modelar dependencias locales y globales. El decoder es autorregresivo y opera con decodificación greedy en las evaluaciones reportadas.

La model card de esta conversión no detalla la composición del dataset de entrenamiento ni si hubo etapas de ajuste con RLHF o DPO; esa información corresponde al modelo original de NVIDIA y no se reproduce aquí. La model card upstream sí menciona una velocidad de inferencia superior a 1000 RTFx en los conjuntos del Open ASR Leaderboard, lo que indica un diseño orientado a throughput alto. La conversión GGUF se realizó a partir del commit a9a55e0 del modelo original (fijado el 2026-05-08) y se validó numéricamente contra la referencia NeMo en el commit db53eda de transcribe.cpp.

## Capacidades

- Reconocimiento automático del habla en inglés, alemán, español y francés.
- Traducción de voz bidireccional: inglés a alemán, español y francés, y de estos tres idiomas a inglés.
- Transcripción con o sin puntuación y capitalización (PnC).
- Entrada de audio de 16 kHz mono en formato WAV; requiere conversión previa con ffmpeg para otros formatos.
- Decodificación greedy sin modelo de lenguaje externo.
- No soporta streaming: el modelo procesa el audio completo de una vez.
- No expone marcas de tiempo a nivel de palabra o segmento en este port (la funcionalidad es experimental en el modelo original).
- No incluye detección de idioma automática (lang_detect: false).
- No es un modelo de tool calling, agentes ni razonamiento multi-paso; su ámbito es exclusivamente audio a texto.

## Casos de uso

- Transcripción de reuniones y actas: el modelo convierte grabaciones de 16 kHz mono en texto con puntuación, adecuado para generar actas automáticas en entornos corporativos donde el audio se captura en inglés, alemán, español o francés. Su tamaño reducido (677 MB en Q4_K_M) permite ejecutarlo en el propio portátil del usuario sin enviar audio a la nube.
- Subtitulado de contenido audiovisual: para vídeos en los cuatro idiomas soportados, el modelo genera transcripciones que después pueden alinearse manualmente o con herramientas externas, dado que este port no expone marcas de tiempo.
- Traducción de entrevistas y llamadas: la capacidad de traducción EN↔{DE, ES, FR} permite generar directamente la versión en inglés de una entrevista en español, o viceversa, sin pasar por un pipeline separado de ASR y traducción de texto.
- Atención al cliente multilingüe: transcripción de llamadas grabadas en centros de soporte para su análisis posterior (sentimiento, cumplimiento, calidad), con la ventaja de que el modelo corre en local y evita enviar datos personales a servicios externos.
- Investigación lingüística y corpus: generación de transcripciones de corpus orales en los cuatro idiomas con un WER bajo y reproducible (1,59-1,72 % en LibriSpeech y Fleurs según el idioma), útil para anotación semiautomática de datasets.
- Despliegue en dispositivos de borde: gracias a las cuantizaciones Q4_K_M y Q5_K_M y a los ratios RTF medidos (25,43 en CPU de M4 Max, 8,85 en CPU de Ryzen 4750U), el modelo es viable en portátiles y mini-PC sin GPU dedicada para transcripción por lotes.
- Accesibilidad: generación de transcripciones de audio para personas con discapacidad auditiva en entornos con hardware modesto, usando el binario transcribe-cli sobre WAV de 16 kHz.

## Benchmarks y rendimiento

WER reportado en la model card de esta conversión (decodificación greedy, sin LM externo):

| Conjunto | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---|---|---|---|---|---|
| LibriSpeech test-clean | 1,62 % | 1,62 % | 1,62 % | 1,65 % | 1,64 % | 1,59 % |

WER por idioma en Fleurs con cuantización Q8_0:

| Idioma | WER (Q8_0) |
|---|---|
| Alemán | 6,13 % |
| Inglés | 4,75 % |
| Español | 6,73 % |
| Francés | 7,22 % |

NVIDIA reporta en la model card upstream un 1,48 % en LibriSpeech test-clean para el modelo original; la diferencia con el 1,62 % de la referencia F32 de este port se atribuye a diferencias de implementación y decodificación, no a la cuantización, ya que todas las cuantizaciones mantienen cifras equivalentes.

Rendimiento medido (RTF, menor es mejor; factor de tiempo real):

| Plataforma | Backend | RTF |
|---|---|---|
| Apple M4 Max | CPU | 25,43 |
| Apple M4 Max | Metal | 111,75 |
| AMD Ryzen 4750U | CPU | 8,85 |
| AMD Ryzen 4750U | Vulkan | 15,48 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un LLM generativo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 677 MB (Q4_K_M), 770 MB (Q5_K_M), 858 MB (Q6_K), 1,05 GB (Q8_0), 1,79 GB (F16), 3,56 GB (F32).
- GPU recomendadas: no se especifican modelos concretos de GPU en la información disponible; el runtime soporta backends Metal (Apple Silicon) y Vulkan (GPU integradas y dedicadas compatibles).
- Cabe en GPU de consumo: sí, cualquier GPU con al menos 1-2 GB de memoria libre puede ejecutar las cuantizaciones Q4_K_M a Q8_0; también funciona enteramente en CPU.
- Opciones de despliegue: transcribe.cpp (compilación con CMake; binario transcribe-cli). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que el modelo es de audio y depende de transcribe.cpp.
- Latencia y throughput: los RTF medidos indican que en Metal sobre M4 Max se procesa audio más de 100 veces más rápido que tiempo real; en CPU de Ryzen 4750U, unas 9 veces más rápido que tiempo real. NVIDIA declara más de 1000 RTFx en el modelo original con su stack NeMo sobre hardware adecuado.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|---|
| voxix-canary-1b-flash-gguf (este) | 890 M | EN, DE, ES, FR + traducción | Audio 16 kHz mono | CC-BY-4.0 | GGUF |
| nvidia/canary-1b-flash (original) | 883 M | EN, DE, ES, FR + traducción | Audio 16 kHz mono | CC-BY-4.0 | NeMo (.nemo) |
| nvidia/canary-1b-v2 | No disponible | 25 idiomas europeos | Audio | No disponible | No disponible |
| Whisper large-v3 (referencia de la categoría) | 1.550 M | ~99 idiomas | Audio 16 kHz | MIT (según información pública) | Múltiples |

La comparación con Whisper large-v3 se ofrece como referencia de categoría; los datos de parámetros y licencia de Whisper no provienen de la información proporcionada en esta ficha y deben verificarse en su model card. No se dispone de datos de benchmarks comparativos directos entre este modelo y alternativas en la información disponible.

## Limitaciones y advertencias

- Solo cubre cuatro idiomas (EN, DE, ES, FR); no es multilingüe amplio como Whisper.
- No soporta streaming: requiere el audio completo antes de transcribir, lo que lo inadecuado para aplicaciones de dictado en tiempo real.
- No expone marcas de tiempo en este port, aunque el modelo original las ofrece de forma experimental.
- No incluye detección automática de idioma; el idioma debe especificarse o inferirse externamente.
- Riesgo de alucinación en audio con ruido, música o habla solapada; el WER sube notablemente fuera de condiciones limpias (Fleurs: 4,75-7,22 % frente a 1,59-1,62 % en LibriSpeech).
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución a NVIDIA y al autor de la conversión; el repositorio incluye LICENSE y NOTICE con los términos.
- El modelo es una conversión no oficial: el autor es xix3r y la validación se hizo contra NeMo en un commit concreto; cambios futuros en transcribe.cpp pueden alterar el comportamiento.
- Sin datos publicados sobre sesgos demográficos o acústicos específicos en la información disponible.
- No apto para tareas de razonamiento, código o generación de texto libre; es exclusivamente un modelo de audio a texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-canary-1b-flash-gguf
- Modelo base: https://huggingface.co/nvidia/canary-1b-flash
- Commit del modelo base usado: https://huggingface.co/nvidia/canary-1b-flash/commit/a9a55e0
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/db53eda
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-1b-flash.md
- Canary 1B V2: https://huggingface.co/nvidia/canary-1b-v2
- Portal de desarrolladores de NVIDIA: https://developer.nvidia.com/
- Paper de FastConformer (arXiv:2104.02821): https://arxiv.org/abs/2104.02821
- Paper de Canary (arXiv:2503.05931): https://arxiv.org/abs/2503.05931
- Paper de Transformer (arXiv:1706.03762): https://arxiv.org/abs/1706.03762
- Paper de referencia adicional (arXiv:2409.13523): https://arxiv.org/abs/2409.13523
