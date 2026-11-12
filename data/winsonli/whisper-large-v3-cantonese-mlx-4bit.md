# WinsonLi/whisper-large-v3-cantonese-mlx-4bit

## Resumen

`WinsonLi/whisper-large-v3-cantonese-mlx-4bit` es una conversión a formato MLX y cuantización a 4 bits del checkpoint `khleeloo/whisper-large-v3-cantonese`, un ajuste fino completo de `openai/whisper-large-v3` para reconocimiento automático de habla en cantonés (`yue`). El modelo original fue entrenado por khleeloo (Rita Frieske) sobre el subconjunto cantonés de Mozilla Common Voice 17; este repositorio aporta la conversión al framework MLX de Apple, la cuantización, la validación y el empaquetado reproducible.

La relevancia práctica es doble. Por un lado, permite ejecutar un Whisper large-v3 especializado en cantonés de forma local y offline en Macs con Apple Silicon, sin depender de servicios en la nube y con un peso de solo 878 MB en disco (frente a los aproximadamente 3 GB del checkpoint fp16 original). Por otro lado, documenta de forma explícita una trampa de uso importante: es imprescindible pasar `language="yue"` en la llamada a `mlx-whisper`, porque decodificar con `language="zh"` produce salida en mandarín aunque los pesos sean idénticos.

Arquitectónicamente mantiene la estructura estándar de Whisper large-v3: 32 capas de encoder, 32 de decoder, 128 bins mel, estado oculto de 1280 y vocabulario de 51 866 tokens. La cuantización afecta a 513 tensores (capas lineales y la tabla de embeddings del decoder), mientras que las layer norms y las dos convoluciones del encoder permanecen en float16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), 32 capas encoder + 32 capas decoder |
| Parametros totales | no disponible (dimensiones equivalentes a whisper-large-v3: 128 mel bins, d_model 1280, 20 cabezas, vocab 51866) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1500 frames de audio de entrada (`n_audio_ctx`) y 448 tokens de texto (`n_text_ctx`) |
| Tipos de cuantizacion | 4 bits affine, group size 64 (via `mlx.nn.quantize`); layer norms y convoluciones del encoder en float16 |
| Idiomas soportados | cantonés (`yue`) exclusivamente; no evaluado en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), `weights.safetensors` de 877 695 978 bytes |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino completo (no LoRA ni adaptador) de `openai/whisper-large-v3` sobre el subconjunto `yue` de Common Voice 17. Según la model card del autor original, el entrenamiento duró 10 épocas con learning rate 1e-7 y mantuvo congeladas 12 capas del decoder. El `generation_config.json` del repositorio de origen fija el token de idioma `<|yue|>`, lo que refuerza la necesidad de respetar esa configuración en la inferencia.

Esta conversión concreta aplica cuantización affine de 4 bits con group size 64 sobre las capas lineales y la tabla de embeddings de tokens del decoder (513 tensores cuantizados, verificados en la cabecera del safetensors). Las layer norms y las convoluciones `encoder.conv1` y `encoder.conv2` se mantienen en float16. El proceso de conversión es determinista: repetirlo desde el mismo checkpoint fuente produce un `weights.safetensors` byte a byte idéntico. El script `convert.py` deriva del de `ml-explore/mlx-examples` (licencia MIT), parcheado para fusionar los safetensors fragmentados del checkpoint original.

## Capacidades

- Transcripción de voz a texto en cantonés (Hong Kong, `yue`) con salida en escritura tradicional.
- Manejo de code-switching inglés/cantonés, según la metodología de validación del autor.
- Reconocimiento de comandos hablados y puntuación dictada oralmente.
- Ejecución local y offline en Apple Silicon mediante `mlx-whisper`, sin llamadas a red.
- Inferencia de bajo peso en disco (878 MB) apta para equipos con memoria unificada limitada.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de modo thinking, visión ni audio más allá de la transcripción estándar de Whisper.

## Casos de uso

- Transcripción de reuniones y entrevistas en cantonés: el modelo convierte audio de hablantes de Hong Kong a texto tradicional en local, útil para equipos que manejan material sensible y no pueden enviarlo a APIs externas.
- Subtitulado de vídeo para creadores cantonoparlantes: con 878 MB de pesos y ejecución en Metal, se puede procesar una biblioteca de vídeos en un Mac portátil sin GPU dedicada.
- Archivística y preservación oral: digitalización de grabaciones históricas en cantonés con salida textual indexable, aprovechando que el modelo funciona completamente offline.
- Atención al cliente en centros de contacto de Hong Kong: transcripción de llamadas para análisis de calidad y generación de actas, siempre que el pipeline posterior gestione el texto resultante.
- Investigación lingüística sobre `yue`: corpus de transcripciones para estudios de variación dialectal, con la ventaja de que el modelo está especializado en un único idioma y evita la mezcla con mandarín.
- Dictado personal en macOS: integración en flujos de trabajo de escritorio para redactar en cantonés tradicional mediante voz, con latencia baja al ejecutarse en el propio equipo.
- Prototipado de asistentes de voz cantonoparlantes: el checkpoint sirve como componente ASR dentro de un pipeline mayor, aunque requerirá un LLM separado para la parte conversacional.

## Benchmarks y rendimiento

El autor reporta una evaluación sobre 23 tomas completas de un único hablante de Hong Kong (grabaciones privadas "Engineer Mode", prefijos HK01–HK10 y MX01–MX10), con métrica CER simétrica mediante distancia de Levenshtein. El dataset es privado y no se publica con el modelo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y al tratarse de un modelo ASR esos benchmarks no serían aplicables.

| Metrica | Valor |
|---|---|
| Dataset de evaluacion | 23 tomas privadas de un hablante de HK (no publico) |
| Metrica | CER simetrica (Levenshtein) |
| Resultados numericos | no disponibles en la informacion proporcionada |
| Benchmarks publicos estandar | no disponibles |

## Requisitos de hardware

- Mac con Apple Silicon (serie M) y macOS con soporte Metal; requisito explícito del repositorio.
- VRAM/memoria unificada estimada: el archivo de pesos ocupa 878 MB; con overhead de runtime MLX, un equipo con 8 GB de memoria unificada debería ser suficiente, aunque no se especifica un mínimo oficial.
- No está pensado para GPU NVIDIA ni CUDA; el formato MLX no es compatible con vLLM, TGI ni llama.cpp en su forma actual.
- Despliegue mediante `mlx-whisper` (probado con `mlx-whisper==0.4.3` y `mlx==0.32.2`, Python 3.13).
- Latencia y throughput: no disponibles en la información proporcionada; el autor menciona benchmarking en Apple Silicon pero no publica cifras en el extracto de la model card.
- Para uso en CUDA sería necesario recurrir al checkpoint original `khleeloo/whisper-large-v3-cantonese` en formato PyTorch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| WinsonLi/whisper-large-v3-cantonese-mlx-4bit | equivalente a large-v3, cuantizado 4-bit | 1500 frames / 448 tokens | `yue` | Apache 2.0 | MLX safetensors |
| khleeloo/whisper-large-v3-cantonese | equivalente a large-v3, fp16 | 1500 frames / 448 tokens | `yue` | Apache 2.0 | PyTorch safetensors |
| openai/whisper-large-v3 | 1550 M aprox. | 1500 frames / 448 tokens | multilingüe (99 idiomas) | Apache 2.0 | PyTorch safetensors, GGUF comunitario |

Frente al checkpoint original de khleeloo, esta versión reduce el peso en disco de forma sustancial (878 MB frente a varios GB en fp16) a cambio de una posible pérdida de precisión por la cuantización a 4 bits, no cuantificada en la información disponible. Frente a `whisper-large-v3` genérico, gana especialización en cantonés pero pierde cobertura multilingüe. No se dispone de datos de rendimiento comparativo entre estas tres opciones.

## Limitaciones y advertencias

- El modelo solo está evaluado en cantonés; no debe usarse como sustituto multilingüe de Whisper large-v3.
- Es obligatorio pasar `language="yue"` explícitamente: con `language="zh"` el autor observó salida en mandarín (這個, 我們, 不要 en lugar de 呢個, 我哋, 唔好) sobre los mismos pesos.
- La evaluación se realizó sobre 23 tomas de un único hablante, un conjunto muy reducido y no representativo de la variabilidad de acentos, edades y condiciones acústicas.
- La cuantización a 4 bits puede degradar la precisión respecto al checkpoint fp16 original; no se publican métricas comparativas.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos con ruido, silencios largos o audio musical.
- Sesgos demográficos y dialectales no evaluados; el entrenamiento se limita a Common Voice 17 `yue`.
- La licencia Apache 2.0 permite uso comercial, pero la atribución al ajuste fino original de khleeloo y a OpenAI es obligatoria en la práctica.
- El formato MLX restringe el despliegue a Apple Silicon; no es portable a infraestructura CUDA sin reconversión.
- El repositorio de origen `khleeloo/whisper-large-v3-cantonese` es de acceso restringido con aprobación automática: es necesario aceptar los términos antes de descargarlo para reproducir la conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WinsonLi/whisper-large-v3-cantonese-mlx-4bit
- Modelo base (ajuste fino cantonés): https://huggingface.co/khleeloo/whisper-large-v3-cantonese
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3
- Dataset Common Voice 17: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Repositorio de referencia para la conversión (mlx-examples): https://github.com/ml-explore/mlx-examples
- Librería mlx-whisper: https://github.com/ml-explore/mlx-examples/tree/main/whisper
