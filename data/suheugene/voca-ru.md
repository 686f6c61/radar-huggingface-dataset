# SuhEugene/voca-ru

## Resumen

voca-ru es un modelo de síntesis de voz (text-to-speech) para ruso desarrollado por SuhEugene, entrenado desde cero con la receta tiny-voca. Se trata de un modelo extremadamente compacto, con solo 4,5 millones de parámetros, que incorpora dos voces integradas: F2 (femenina) y M2 (masculina). El modelo no procesa texto directamente: recibe identificadores de fonemas junto con marcas de acentuación y devuelve una forma de onda a 24 kHz.

La relevancia de voca-ru radica en su tamaño mínimo (21,4 MB en ONNX, 23,5 MB en GGUF) y su capacidad de ejecutarse en CPU o en el navegador, lo que lo hace adecuado para aplicaciones de síntesis de voz en entornos con recursos limitados. Se distribuye en formatos ONNX (opset 17) y GGUF, e incluye tablas de frontend para ruso (diccionario de acentuación de 100 000 formas y léxico G2P de 14 492 entradas) que permiten su uso en JavaScript sin dependencias externas.

El modelo se entrenó sobre un corpus sintético de 19 217 clips (20,35 horas) generado con Qwen3-TTS-1.7B, y se publica bajo licencia Apache-2.0, aunque con advertencias sobre la procedencia de las tablas de fonemas derivadas de eSpeak NG (GPL-3.0). Está pensado para uso personal y de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red generativa tipo GAN para TTS (receta tiny-voca), 184 tensores |
| Parámetros totales | 4 537 291 (4,5 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (una emisión por llamada, máximo 32 s de audio) |
| Tipos de cuantización | float32 (ONNX y GGUF); no se documentan otras cuantizaciones |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache-2.0 (con reservas sobre el léxico derivado de eSpeak NG) |
| Formato de pesos | ONNX (opset 17), GGUF v3 (float32, layout audiocpp), PyTorch checkpoint (inference.pt) |
| Frecuencia de muestreo | 24 kHz |
| Inventario de símbolos | 76 símbolos fonéticos rusos |
| Voces | F2 (femenina), M2 (masculina) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

voca-ru sigue la receta tiny-voca, una arquitectura generativa adversarial (GAN) para síntesis de voz que opera sobre secuencias de identificadores de fonemas con marcas de acentuación. El modelo consta de 184 tensores y 4 537 291 parámetros, y produce directamente una forma de onda a 24 kHz junto con las duraciones por identificador. La entrada incluye tokens, vector de estrés (0/1 por id), selección de voz, velocidad, desplazamiento de tono (log-F0) y rango de tono.

El entrenamiento se realizó sobre un corpus sintético de 19 217 clips (20,35 horas) generado con Qwen3-TTS-1.7B (referencias VoiceDesign y clonación Base) con un LoRA de acentuación rusa, filtrado por Whisper (WER ≤ 15 %) y por un detector de estrés (meter2). Tras el alineamiento sobrevivieron 18 148 clips. Se entrenó durante 104 000 pasos (GAN desde el paso 8 000) en una sola RTX 4090 durante 6 horas y 50 minutos. El frontend convierte texto en ids mediante normalización, acentuación con RUAccent (marcada con U+0301), fonemas eSpeak NG `ru` y mapeo a ids; las implementaciones en Python y Rust producen ids idénticos sobre un corpus de 8 000 frases.

## Capacidades

- Síntesis de voz en ruso a partir de fonemas con acentuación, con salida de forma de onda a 24 kHz.
- Dos voces integradas: F2 (femenina) y M2 (masculina).
- Control de velocidad, desplazamiento de tono (pitch_shift en log-F0) y rango de tono (pitch_range).
- Devolución de duraciones por identificador de fonema junto con el audio.
- Frontend de texto a fonemas incluido: normalización (números, fechas, dinero, «ё», latino), acentuación con RUAccent y fonemas eSpeak NG.
- Tablas de frontend embebidas en el GGUF para uso en navegador: stress_dict.tsv (100 000 formas) y g2p_lexicon.tsv (14 492 entradas).
- Ejecución en CPU mediante ONNX Runtime y en JavaScript mediante tiny-voca.js sin adaptador.
- No soporta streaming; una emisión por llamada con máximo de 32 segundos.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo TTS).

## Casos de uso

- Lectura de textos en ruso en aplicaciones de accesibilidad: el modelo convierte texto normalizado en voz sintética a 24 kHz con dos voces seleccionables, adecuado para lectores de pantalla en entornos con CPU.
- Síntesis de voz en el navegador: el GGUF incluye las tablas de frontend y tiny-voca.js lo lee sin adaptador, lo que permite generar audio en cliente sin servidor ni GPU.
- Asistentes de voz embebidos: con 4,5 M de parámetros y 21,4 MB en ONNX, cabe en dispositivos de bajos recursos y puede integrarse en aplicaciones de escritorio o IoT para respuestas habladas en ruso.
- Generación de audiolibros o pódcasts de bajo coste: el control de velocidad y tono permite ajustar la locución, y el límite de 32 s por llamada obliga a segmentar el texto en fragmentos.
- Pruebas de concepto de TTS en investigación: el modelo sirve como referencia compacta para experimentar con frontends de ruso, acentuación y control prosódico sin grandes requisitos de hardware.
- Prototipado de interfaces conversacionales en ruso: la selección de voz F2/M2 y el control de pitch permiten generar variaciones de locución para pruebas de usabilidad.
- Docencia y demostraciones de TTS: el tamaño reducido y la licencia Apache-2.0 facilitan su uso en entornos educativos para ilustrar pipelines de texto a voz.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| WER de ida y vuelta (Whisper large-v3-turbo, 5 frases) | 4,76 % |
| CER | 0,0 % |
| Tasa de aceptación de alineamiento | 94,4 % |
| Diferencia máxima relativa de forma de onda (ONNX vs PyTorch) | 0,001 |
| Cobertura del léxico en el corpus de entrenamiento | 94,6 % de las frases |

El autor advierte que el WER procede de un conjunto fijo pequeño y se mantiene plano desde el paso 16 000, por lo que es una comprobación de sanidad y no un benchmark comparable. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo ONNX ocupa 21,4 MB y el GGUF 23,5 MB en float32.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU con ONNX Runtime (CPUExecutionProvider). El entrenamiento se realizó en una RTX 4090, pero la inferencia no necesita GPU dedicada.
- Cabe en cualquier GPU de consumo e incluso en CPU y en el navegador.
- Opciones de despliegue: ONNX Runtime (Python), tiny-voca.js (JavaScript/navegador con GGUF), PyTorch (inference.pt). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / límite | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| voca-ru | 4,5 M | 32 s por llamada | Ruso | Apache-2.0 | ONNX, GGUF, PyTorch |
| Qwen3-TTS-1.7B (modelo profesor) | 1,7 B | No disponible | Multilingüe | Apache-2.0 | No disponible |
| tiny-voca (receta base) | No disponible | No disponible | Inglés (motor dizione) | Apache-2.0 | GGUF |

voca-ru se distingue por su tamaño extremadamente reducido frente al modelo profesor Qwen3-TTS-1.7B, a costa de menores capacidades y de un corpus sintético. La receta tiny-voca original está orientada al inglés y su motor dizione no puede leer los símbolos de voca-ru. No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La voz femenina (F2) suena brillante: su energía en 2–8 kHz está 3 dB por encima del profesor en el mismo texto, lo que produce un timbre metálico.
- Ambas voces están subidas de tono 2–3 semitonos respecto al profesor (F2 248 Hz vs 207 Hz; M2 123 Hz vs 108 Hz); se recomienda usar pitch_shift = -0.18 y -0.13 para corregirlo.
- Las palabras desconocidas caen a reglas; el léxico incluido cubre el 94,6 % de las frases del corpus de entrenamiento.
- No hay streaming, una emisión por llamada y máximo de 32 segundos de audio.
- El frontend de texto no está integrado en el modelo: es necesario convertir texto a ids con las implementaciones Python o Rust proporcionadas.
- El estado de licencia del léxico derivado de eSpeak NG (GPL-3.0) no está resuelto, lo que es relevante antes de cualquier uso comercial.
- El corpus es sintético y el WER reportado procede de solo 5 frases, por lo que la calidad en dominios no cubiertos no está validada.
- El modelo se publica para uso personal y de investigación.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede producir pronunciaciones incorrectas en palabras fuera del léxico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SuhEugene/voca-ru
- Corpus de entrenamiento: https://huggingface.co/datasets/SuhEugene/voca-ru-corpus
- Receta tiny-voca: https://github.com/n4ze3m/tiny-voca
- Modelo profesor Qwen3-TTS-1.7B-Base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Adaptador de acentuación: https://huggingface.co/siriusfreak/qwen3-tts-12hz-1.7b-ru-stress-cf
