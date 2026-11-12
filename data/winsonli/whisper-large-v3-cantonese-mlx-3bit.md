# WinsonLi/whisper-large-v3-cantonese-mlx-3bit

## Resumen

Whisper large-v3-cantonese-mlx-3bit es una conversión cuantizada a 3 bits del modelo de reconocimiento automático de voz khleeloo/whisper-large-v3-cantonese, un fine-tuning de OpenAI Whisper large-v3 sobre el corpus Common Voice 17 en cantonés (yue). El trabajo lo firma WinsonLi y se distribuye en formato MLX, pensado para ejecutarse en hardware Apple Silicon mediante la librería mlx-whisper. La arquitectura subyacente es la de Whisper large-v3 completa (32 capas de encoder y 32 de decoder, no la variante Turbo), con cuantización afín de 3 bits y grupo de 64.

El modelo se publica explícitamente como un experimento, no como un reemplazo equivalente al baseline de 4 bits del mismo autor. La model card documenta una regresión de precisión medible: el CER normalizado de su benchmark personal sube del 14,92 % (4 bits) al 24,50 % (3 bits) con prompt fijo. El ahorro de peso es del 21,9 % frente a 4 bits, pero la reducción de memoria pico en MLX es solo del 10,8 %, lo que limita el atractivo práctico del recorte.

Su relevancia es, por tanto, metodológica y de reproducibilidad: incluye hashes de los shards originales, procedencia completa del script de conversión y mediciones pareadas de CER, latencia y memoria para las variantes de 2, 3 y 4 bits, lo que permite auditar el compromiso entre tamaño y calidad en un caso concreto de ASR en cantonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3, 32 capas de encoder y 32 de decoder) |
| Parametros totales | no disponible (pesos cuantizados de 685.896.454 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por defecto en Whisper; ventanas de decodificacion de 224 muestras en la evaluacion) |
| Tipos de cuantizacion | Afin de 3 bits, group size 64 (FP16 antes de cuantizar) |
| Idiomas soportados | Cantonés (yue) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en formato MLX (repositorio de 0,7 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura estándar de Whisper large-v3: un encoder Transformer que procesa espectrogramas log-Mel y un decoder autorregresivo que genera tokens de transcripción, con 32 capas en cada bloque. No es la variante Turbo, que reduce el número de capas del decoder. El fine-tuning original lo realizó khleeloo (Rita Frieske) sobre Common Voice 17 en cantonés, partiendo de los pesos de OpenAI Whisper large-v3, con licencia Apache-2.0.

La conversión a MLX se hizo directamente desde los shards FP32 originales, verificados por hash contra la revisión fijada `f48a890f78c7b6acf723f25d8c81e232ac7469ca`, con un cast intermedio a FP16 y cuantización afín posterior. No se partió del modelo de 4 bits ya empaquetado. El script `convert.py` deriva de mlx-examples de Apple (commit `796f5b53cab69a3d48a44233ce21aae889e94a08`) con comprobaciones estrictas de claves y formas; las 513 matrices cuantizadas presentan el ancho empaquetado esperado de 3 bits. Como validación de integridad, el mismo script reprodujo byte a byte los pesos de 4 bits publicados (SHA256 `7ea0e37f88ac3a4cdb00435a3418498ff707ba7b1cc45d1feb13bd82ec471374`). No se documenta entrenamiento adicional, RLHF ni DPO en esta conversión.

## Capacidades

- Transcripción de voz a texto en cantonés, con mezcla de habla técnica en inglés dentro del mismo audio.
- Reconocimiento de habla mono a 16 kHz PCM, con idioma forzado a `yue` y tarea `transcribe`.
- Decodificación con prompt fijo condicionado (el autor usa un prompt mixto cantonés/inglés en su benchmark).
- Inferencia en Apple Silicon mediante mlx-whisper, con límite de caché MLX configurable (64 MiB en la evaluación).
- No incluye marcas de tiempo por palabra en la configuración evaluada (`word_timestamps=False`).
- No soporta tool calling, agentes, visión ni audio más allá de ASR estándar de Whisper.
- Capacidad multilingüe real limitada al cantonés; el inglés solo aparece como mezcla dentro del audio de entrada, no como idioma de transcripción declarado.

## Casos de uso

- Transcripción de archivos de audio en cantonés en un Mac con Apple Silicon: el modelo se carga con mlx-whisper y procesa audio mono a 16 kHz, adecuado para entornos locales sin GPU dedicada.
- Prototipado de pipelines ASR de bajo peso: con 685,9 MB de pesos, sirve para validar integración de mlx-whisper y el flujo de decodificación antes de pasar al modelo de 4 bits recomendado.
- Investigación sobre cuantización extrema: el repositorio ofrece mediciones pareadas de CER, RTF y memoria pico que permiten estudiar el límite práctico de la cuantización a 3 bits en ASR.
- Evaluación comparativa de variantes cuantizadas: útil para reproducir el benchmark del autor con las mismas condiciones (temperatura 0, `condition_on_previous_text=False`, prompt fijo) y contrastar 3 bits frente a 4 bits.
- Transcripción de material con jerga técnica mixta cantonés/inglés: el prompt fijo del autor está diseñado para este escenario, aunque con la penalización de CER documentada.
- Docencia y demostraciones de cuantización en MLX: el repositorio incluye procedencia, hashes y script de conversión, lo que lo hace apto como ejemplo reproducible en cursos o talleres.
- No recomendado para producción con requisitos de precisión: el propio autor indica que el baseline de 4 bits sigue siendo la opción para el flujo probado.

## Benchmarks y rendimiento

Mediciones locales del autor (2026-11-12) sobre un benchmark privado de 23 tomas de un único hablante cantonés, con prompt fijo compartido:

| Variante | Peso (MB) | CER bruto | CER normalizado | Decodificacion mediana (s) | RTF | Pico MLX (MiB) | Pico SO (MiB) | Pico RSS (MiB) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 4-bit g64 | 877,696 | 29,04 % | 14,92 % | 0,661 | 0,0712 | 1672,3 | 2046,3 | 1098,0 |
| 3-bit g64 | 685,896 | 40,82 % | 24,50 % | 0,701 | 0,0771 | 1492,4 | 1897,9 | 918,3 |
| 2-bit g64 | 494,096 | 100,00 % | 100,00 % | 2,396 | 0,2580 | 1306,5 | 1595,2 | 734,1 |
| 2-bit g32 | 589,996 | 225,88 % | 222,27 % | 2,417 | 0,2598 | 1394,5 | 1682,3 | 821,1 |

Sin prompt, la brecha entre 3 y 4 bits se reduce: CER del 18,26 % frente al 16,37 %, sin evidencia suficiente de equivalencia. El benchmark es pequeño (23 tomas, un solo hablante, referencias no verificadas palabra por palabra) y no constituye una estimación poblacional ni un resultado sobre Common Voice.

## Requisitos de hardware

- VRAM o memoria unificada estimada: pico MLX de 1492,4 MiB para 3 bits g64 en la configuración medida; pico RSS de 918,3 MiB.
- Hardware objetivo: Apple Silicon con mlx-whisper; no se probó ningún Mac de memoria reducida según el autor.
- GPU NVIDIA: no aplica directamente, ya que los pesos están en formato MLX; requeriría reconversión a otro runtime.
- Despliegue: mlx-whisper (librería `mlx`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: decodificación mediana de 0,701 s y RTF de 0,0771 en el benchmark del autor, ligeramente peor que el 4 bits (0,661 s y 0,0712).
- Ahorro de peso del 21,9 % frente a 4 bits, pero solo un 10,8 % menos de asignación pico MLX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER normalizado | Licencia | Formato |
|---|---|---|---|---|---|
| WinsonLi/whisper-large-v3-cantonese-mlx-3bit | no disponible (685,9 MB de pesos) | no disponible | 24,50 % (benchmark del autor) | Apache-2.0 | MLX safetensors 3 bits |
| WinsonLi/whisper-large-v3-cantonese-mlx-4bit | no disponible (877,7 MB de pesos) | no disponible | 14,92 % (mismo benchmark) | Apache-2.0 | MLX safetensors 4 bits |
| WinsonLi/whisper-large-v3-cantonese-mlx-2bit | no disponible (494,1 MB de pesos) | no disponible | 100,00 % (colapso) | Apache-2.0 | MLX safetensors 2 bits |
| khleeloo/whisper-large-v3-cantonese (FP32 original) | Whisper large-v3 completo | no disponible | no disponible en esta informacion | Apache-2.0 | Safetensors FP32 |

## Limitaciones y advertencias

- Regresión de precisión documentada: CER normalizado del 24,50 % frente al 14,92 % del 4 bits con prompt fijo; el autor no lo considera un reemplazo equivalente.
- Benchmark muy limitado: 23 tomas, un único hablante, referencias no verificadas literalmente, con repeticiones y discrepancias conocidas entre números y palabras habladas.
- El ahorro de memoria es modesto (10,8 % en pico MLX) frente al ahorro de disco (21,9 %), lo que reduce el beneficio práctico.
- La variante de 2 bits colapsa a puntuación y espacios en blanco; no debe usarse.
- Idioma restringido a cantonés; no se garantiza calidad en otros idiomas ni en code-switching fuera del prompt probado.
- Riesgo de alucinación y de eco del prompt: el autor advierte que el comportamiento del diccionario, prompt y reparación de InFlow no debe asumirse equivalente a ASR sin prompt.
- Solo formato MLX: no es directamente desplegable en runtimes CUDA sin reconversión.
- Licencia Apache-2.0 permite uso comercial, pero la calidad medida desaconseja producción en el flujo evaluado.
- No se distribuyen grabaciones, referencias, transcripciones ni diccionarios personales del benchmark, lo que impide una replicación exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WinsonLi/whisper-large-v3-cantonese-mlx-3bit
- Baseline de 4 bits: https://huggingface.co/WinsonLi/whisper-large-v3-cantonese-mlx-4bit
- Experimento de 2 bits: https://huggingface.co/WinsonLi/whisper-large-v3-cantonese-mlx-2bit
- Modelo original de khleeloo: https://huggingface.co/khleeloo/whisper-large-v3-cantonese
- mlx-examples de Apple (commit base del conversor): https://github.com/ml-explore/mlx-examples/commit/796f5b53cab69a3d48a44233ce21aae889e94a08
- Repositorio mlx-examples: https://github.com/ml-explore/mlx-examples
- OpenAI Whisper: https://github.com/openai/whisper
- Common Voice 17: https://commonvoice.mozilla.org/datasets
