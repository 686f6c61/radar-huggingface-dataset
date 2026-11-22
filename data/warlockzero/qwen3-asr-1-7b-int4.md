# warlockzero/Qwen3-ASR-1.7B-int4

## Resumen

Qwen3-ASR-1.7B-int4 es una cuantización de 4 bits del modelo de reconocimiento automático de voz Qwen/Qwen3-ASR-1.7B-hf, publicada por el usuario warlockzero. Se trata de un checkpoint empaquetado con `bitsandbytes` en formato NormalFloat 4-bit (NF4) con doble cuantización, pensado para reducir drásticamente el consumo de memoria del modelo original sin degradar de forma apreciable la calidad de transcripción. Con 2.038.052.480 parámetros totales y un repositorio de 1,5 GB, el autor reporta un pico de VRAM de aproximadamente 1,75 GB durante la inferencia, frente a los 4,80 GB del modelo base en FP16.

El modelo base pertenece a la familia Qwen3-ASR de Alibaba y está orientado a transcripción de audio multilingüe en 18 idiomas, con especial énfasis en escenarios de múltiples hablantes, acústica ruidosa y vocabulario poco frecuente. La cuantización W4A8/W4A16 (pesos en 4 bits, activaciones en FP16) mantiene la arquitectura y el procesador del modelo original, por lo que se carga directamente con `transformers` y el pipeline `automatic-speech-recognition`.

Su relevancia actual radica en que permite ejecutar un ASR de 1,7B parámetros en hardware de gama media o incluso en equipos con GPU de poca VRAM, algo inviable con el checkpoint FP16. La licencia Apache 2.0 facilita su integración en productos comerciales, y el formato safetensors con `bitsandbytes` lo hace compatible con los flujos habituales de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para reconocimiento automático de voz (Qwen3-ASR), cuantizado a 4 bits NF4 |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantización (W4A8/W4A16, `bitsandbytes`) |
| Idiomas soportados | en, zh, ar, es, fr, de, ja, ko, ru, hi, bn, it, pt, tr, vi, id, th, fa |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizados con `bitsandbytes`) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo Qwen/Qwen3-ASR-1.7B-hf, que emplea una arquitectura transformer adaptada a la tarea de reconocimiento automático de voz, con un procesador de audio específico (`AutoProcessor`) y una interfaz de petición de transcripción (`apply_transcription_request`). La cuantización aplica `load_in_4bit=True`, `bnb_4bit_use_double_quant=True` y `bnb_4bit_quant_type="nf4"`, es decir, pesos en 4 bits NormalFloat con doble cuantización y activaciones en FP16 (W4A8/W4A16). No se modifican ni el tokenizador ni el procesador del modelo base.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia cuantización. El autor reporta que la pérdida de precisión medida en WER es inferior al 1 % respecto al modelo base («>99 % accuracy, near-lossless»), aunque no se detalla la metodología ni el conjunto de evaluación empleado para esa cifra.

## Capacidades

- Transcripción de voz a texto en 18 idiomas: inglés, chino, árabe, español, francés, alemán, japonés, coreano, ruso, hindi, bengalí, italiano, portugués, turco, vietnamita, indonesio, tailandés y persa.
- Reconocimiento robusto en escenarios con múltiples hablantes y acústica ruidosa, según las características atribuidas al modelo base.
- Manejo de vocabulario poco frecuente y términos difíciles, con precisión cercana al modelo FP16 según el autor.
- Procesamiento de audio a 16 kHz, mono o estéreo (el ejemplo de la model card convierte a mono promediando canales).
- Salida en formato de transcripción limpia mediante `return_format="transcription_only"`.
- No se documenta soporte de tool calling, agentes, visión ni audio generativo; la tarea es exclusivamente ASR.
- No se documenta un modo de razonamiento (thinking mode) ni capacidades multimodales más allá del audio de entrada.

## Casos de uso

- Subtitulado automático en producción: el modelo transcribe audio de 16 kHz y devuelve texto limpio, adecuado para generar subtítulos en 18 idiomas con un pico de VRAM de ~1,75 GB, lo que permite desplegarlo en servidores modestos o en paralelo con otras tareas.
- Transcripción de reuniones y actas: su tolerancia a múltiples hablantes y ruido de fondo lo hace apto para grabar conversaciones de sala y generar actas, aunque la separación de hablantes (diarización) no está documentada como capacidad nativa.
- Atención al cliente por voz: integrado en un pipeline de telefonía o VoIP, transcribe llamadas en tiempo casi real (latencia reportada de ~0,89 s en un audio de 10,4 s en RTX 3090) para alimentar sistemas de análisis o búsqueda.
- Accesibilidad y dictado: ejecutable en portátiles de gama media gracias a su huella de ~1,35 GB en disco y ~1,45 GB de VRAM en reposo, sirve para dictado por voz o subtitulado en directo en equipos sin GPU dedicada de gran tamaño.
- Procesamiento por lotes de archivos de audio: con `device_map="auto"` y `torch.float16`, se puede recorrer un directorio de grabaciones y transcribirlas en lote, aprovechando el bajo consumo de memoria para paralelizar varias instancias.
- Investigación en ASR multilingüe: al ser una cuantización fiel y de licencia Apache 2.0, es útil como línea base ligera para experimentos de evaluación de WER o para comparar el impacto de la cuantización en distintos idiomas.
- Integración en aplicaciones móviles o de borde: el autor menciona «mobile accelerator bridges», por lo que el checkpoint puede servir en despliegues con aceleradores de baja memoria, siempre que el runtime soporte `bitsandbytes`.

## Benchmarks y rendimiento

El autor solo publica una verificación puntual sobre un audio en inglés de 10,4 segundos (`beckett.wav`) en una NVIDIA GeForce RTX 3090. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER sobre LibriSpeech o Common Voice) en la información disponible.

| Metrica | Modelo base FP16 | INT8 (W8A16) | Este repo (4-bit NF4) |
|---|---|---|---|
| Huella en disco | ~4,08 GB | ~2,10 GB | ~1,35 GB |
| VRAM en reposo | ~4,20 GB | ~2,25 GB | ~1,45 GB |
| Pico de VRAM en inferencia | ~4,80 GB | ~2,55 GB | ~1,75 GB |
| Reducción de VRAM | línea base | -46,8 % | -63,5 % |
| Precisión (pérdida de WER) | línea base | coincidencia verbatim 100 % | >99 % de precisión (casi sin pérdida) |
| Tiempo de carga en caliente (RTX 3090) | ~3,5 s | ~1,6 s | <0,8 s |

Prueba puntual reportada: audio `beckett.wav` de 10,4 s, salida correcta («He hoped there would be stew for dinner, turnips and carrots and bruised potatoes and fat mutton pieces to be ladled out in thick peppered flour-fattened sauce.»), pico de VRAM de 1,75 GB y latencia de ~0,89 s.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,75 GB de pico y ~1,45 GB en reposo según el autor; el repositorio ocupa 1,5 GB en disco.
- GPU recomendadas: NVIDIA RTX 3090 (medición oficial del autor); cualquier GPU con al menos 2 GB de VRAM libre debería ser suficiente en teoría, aunque no se han publicado pruebas en otras tarjetas.
- ¿Cabe en GPU de consumo? Sí, según las cifras del autor cabría en tarjetas de gama baja con 2-4 GB de VRAM, así como en portátiles con GPU integrada o aceleradores móviles, siempre que el runtime soporte `bitsandbytes`.
- Opciones de despliegue: `transformers` con `bitsandbytes` (flujo documentado). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de audio, llama.cpp y Ollama no son opciones viables en la información disponible.
- Latencia y throughput: ~0,89 s para un audio de 10,4 s en RTX 3090, es decir, aproximadamente 11,7× tiempo real en esa prueba concreta. No hay datos de throughput agregado ni de latencia en otros idiomas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| warlockzero/Qwen3-ASR-1.7B-int4 | 2.038.052.480 | no disponible | 18 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-ASR-1.7B-hf (base FP16) | 2.038.052.480 | no disponible | 18 | Apache 2.0 | Hugging Face |
| Whisper large-v3 (referencia ASR) | no disponible en esta ficha | no disponible | multilingüe | MIT | Hugging Face / OpenAI |
| Whisper small (referencia ASR ligera) | no disponible en esta ficha | no disponible | multilingüe | MIT | Hugging Face / OpenAI |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Las cifras de Whisper no se incluyen porque no forman parte del material consultado.

## Limitaciones y advertencias

- Solo se ha verificado un único audio en inglés de 10,4 s; no hay evidencia publicada de calidad en los otros 17 idiomas ni en condiciones de ruido reales.
- La cifra de «>99 % de precisión» procede del autor y no está respaldada por una evaluación WER sobre un corpus estándar; debe tratarse como una afirmación no verificada.
- No se documenta la longitud de contexto ni el tamaño máximo de audio procesable; audios largos pueden requerir segmentación manual.
- No se documenta diarización de hablantes (separación de quién habla), aunque el modelo base se asocia a escenarios multihablante.
- No hay información sobre sesgos por idioma, acento o dialecto; es esperable un rendimiento desigual entre los 18 idiomas declarados.
- Riesgo de alucinación inherente a los modelos generativos de ASR: pueden aparecer palabras o frases no presentes en el audio, especialmente en segmentos ruidosos o silenciosos.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-ASR-1.7B-hf y de `bitsandbytes` en el despliegue final.
- El checkpoint depende de `bitsandbytes` y de `transformers`; no es portable a runtimes que no soporten cuantización NF4 (llama.cpp, Ollama, etc.).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/warlockzero/Qwen3-ASR-1.7B-int4
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Documentación de `bitsandbytes`: https://huggingface.co/docs/bitsandbytes
- Documentación de `transformers` para modelos de audio: https://huggingface.co/docs/transformers
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
