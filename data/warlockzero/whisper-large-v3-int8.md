# warlockzero/whisper-large-v3-int8

## Resumen

Whisper Large V3 INT8 es una versión cuantizada a 8 bits del modelo de reconocimiento automático del habla (ASR) `openai/whisper-large-v3`, publicada por el usuario warlockzero. La cuantización se ha realizado con `bitsandbytes` en formato W8A16 (pesos en INT8, activaciones en FP16), con el objetivo declarado de reducir drásticamente el consumo de VRAM hasta aproximadamente 1,63 GB en pico, manteniendo, según el autor, una precisión de transcripción del 100 % respecto al modelo original.

El modelo base, Whisper large-v3, es un transformer encoder-decoder de tipo seq2seq entrenado por OpenAI para transcripción y traducción de voz, con 1.544 millones de parámetros. Esta versión mantiene la misma arquitectura y tokenizador, por lo que es compatible con el ecosistema `transformers` a través de `AutoModelForSpeechSeq2Seq` y `AutoProcessor`, y se distribuye en formato safetensors con licencia MIT.

La relevancia de esta ficha radica en que permite desplegar un ASR de gama alta en hardware con recursos limitados (GPU de consumo con poca VRAM o incluso entornos con requisitos estrictos de memoria), a costa de las limitaciones inherentes a la cuantización de pesos y de la ausencia de benchmarks publicados por el autor más allá de la afirmación de paridad de transcripción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) de Whisper large-v3, pesos cuantizados a INT8 |
| Parametros totales | 1.544.391.680 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper large-v3 trabaja con ventanas de audio de 30 s) |
| Tipos de cuantizacion | INT8 W8A16 con bitsandbytes (8-bit) |
| Idiomas soportados | no disponible en la informacion proporcionada (heredados del modelo base, multilingue) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,6 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3: un transformer encoder-decoder entrenado para tareas de reconocimiento y traducción de voz, que procesa audio en ventanas de 30 segundos convertidas a log-Mel spectrograms y genera texto de forma autorregresiva. Esta variante no reentrena el modelo: aplica cuantización post-entrenamiento de los pesos a INT8 mediante `bitsandbytes` en esquema W8A16, es decir, pesos en 8 bits y activaciones en 16 bits durante la inferencia.

No se dispone de información sobre el proceso de calibración, el conjunto de datos empleado para la cuantización ni las métricas de degradación respecto al modelo original. El autor únicamente declara una huella de VRAM de ~1,63 GB y una precisión de transcripción del 100 % respecto al modelo base, sin aportar metodología ni benchmarks que respalden esa afirmación. El modelo base Whisper large-v3 fue entrenado por OpenAI con un corpus multilingüe de audio supervisado a gran escala (los detalles exactos no se incluyen en la información proporcionada).

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe, heredado de Whisper large-v3.
- Traducción de voz a texto (speech translation) hacia inglés, capacidad nativa de Whisper.
- Transcripción con puntuación y detección de idioma, según el modelo base.
- Procesamiento de audio en ventanas de 30 segundos con `AutoProcessor`.
- Inferencia de bajo consumo de VRAM gracias a la cuantización INT8.
- Compatibilidad con el pipeline `automatic-speech-recognition` de `transformers`.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio en streaming.

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede procesar audio dividido en ventanas de 30 s y generar transcripciones con puntuación; su bajo consumo de VRAM permite ejecutarlo en una GPU de consumo junto a otros servicios.
- Subtitulado automático de vídeo: integrable en pipelines de postproducción para generar subtítulos multilingües a partir de pistas de audio, con la ventaja de que el modelo cuantizado cabe en entornos con poca memoria.
- Asistentes de voz en local: despliegue en estaciones de trabajo con GPU modesta para dictado o comandos por voz, manteniendo los datos en el dispositivo.
- Investigación en ASR: uso como referencia cuantizada para estudiar el impacto de INT8 W8A16 en la calidad de transcripción frente al modelo original.
- Prototipado rápido con `transformers`: al conservar la API de `AutoModelForSpeechSeq2Seq`, se puede sustituir el modelo original por esta versión sin cambios de código.
- Servicios de transcripción de bajo coste: al reducir la VRAM a ~1,63 GB, es posible alojar varias instancias en una sola GPU para atender cargas concurrentes moderadas.
- Accesibilidad: generación de transcripciones para contenido audiovisual en entornos con hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor afirma una precisión de transcripción del 100 % respecto al modelo base y un pico de VRAM de ~1,63 GB, pero no aporta tablas de WER, comparativas ni metodología de evaluación.

## Requisitos de hardware

- VRAM estimada: ~1,63 GB en pico según el autor (pesos INT8 + activaciones FP16).
- GPU recomendadas: cualquier GPU con al menos ~2 GB de VRAM libre; tarjetas de consumo como RTX 3060, RTX 4060 o superiores son suficientes.
- Cabe en GPU de consumo: sí, gracias a la cuantización INT8.
- Opciones de despliegue: `transformers` con `bitsandbytes` (requerido para cargar los pesos cuantizados), `device_map="auto"`; el pipeline `automatic-speech-recognition` de `transformers`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (estos últimos no soportan de forma estándar este esquema de cuantización para Whisper).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| warlockzero/whisper-large-v3-int8 | 1.544 M | ventanas de 30 s (heredado) | INT8 W8A16 | MIT | Hugging Face |
| openai/whisper-large-v3 | 1.544 M | ventanas de 30 s | FP16/BF16 | MIT | Hugging Face |
| openai/whisper-large-v3-turbo | no disponible en la informacion | ventanas de 30 s | FP16/BF16 | MIT | Hugging Face |
| openai/whisper-medium | no disponible en la informacion | ventanas de 30 s | FP16/BF16 | MIT | Hugging Face |

La comparativa se limita a datos estructurales; no se dispone de métricas de WER ni de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- La cuantización INT8 puede introducir degradación en la calidad de transcripción en audio ruidoso, acentos marcados o idiomas de bajos recursos; la afirmación de paridad del 100 % no está respaldada por benchmarks públicos.
- Requiere `bitsandbytes` para cargar los pesos; no es un checkpoint estándar en FP16 y puede no ser compatible con todos los runners.
- El repo tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha: no hay evidencia de uso comunitario ni validación independiente.
- Riesgo de alucinación inherente a Whisper (repeticiones, texto inventado en silencios o música).
- La información sobre idiomas soportados no está detallada en la ficha; se heredan del modelo base, pero no se confirma el comportamiento tras la cuantización.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base y de `bitsandbytes` en producción.
- No se documentan limitaciones específicas de contexto más allá de la ventana de 30 s de Whisper.

## Enlaces

- Hugging Face: https://huggingface.co/warlockzero/whisper-large-v3-int8
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Repositorio de bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- Documentación de Whisper en transformers: https://huggingface.co/docs/transformers/model_doc/whisper
- Paper de Whisper (Radford et al.): https://arxiv.org/abs/2212.04356
