# Yakimask/kikimimi-hiragana-9m

## Resumen

kikimimi-hiragana-9m (聞き耳, "oreja que escucha") es un modelo de reconocimiento automático del habla (ASR) en japonés desarrollado por Yakimask. Se trata de un modelo muy compacto, con 9.133.670 parámetros, entrenado desde cero (sin inicialización a partir de un modelo preentrenado) y diseñado específicamente para emitir únicamente hiragana en forma fonética. Su propósito declarado es actuar como el componente de "escucha" de un sistema de diálogo full-duplex, es decir, un sistema que puede escuchar y hablar simultáneamente.

La arquitectura es un encoder Conformer causal de 12 capas con atención restringida al pasado y convoluciones enmascaradas hacia la izquierda, seguido de una cabeza lineal CTC. El modelo procesa audio a 16 kHz, extrae log-mel de 80 dimensiones cada 10 ms y emite una predicción cada 40 ms, lo que permite transcripción en streaming con una latencia de emisión baja. No espera a disponer de la frase completa para generar salida.

Es relevante por su tamaño extremadamente reducido y su enfoque en streaming causal, lo que lo hace candidato a ejecutarse en dispositivos de consumo o integrado en pipelines de diálogo en tiempo real. Sin embargo, su rendimiento en datos reales de YouTube es todavía limitado (CER de 0,471 en el conjunto de validación), por lo que debe considerarse un modelo experimental o de nicho más que una solución de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer causal (12 capas, anchura 176, 4 cabezas, convolución de anchura 15, RoPE) con CTC |
| Parametros totales | 9.133.670 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (streaming causal; emite cada 40 ms) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | japonés (ja) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Conformer causal. La entrada es audio a 16 kHz convertido a log-mel de 80 dimensiones cada 10 ms, normalizado con un valor fijo (sin esperar a la frase completa). Una convolución separable en profundidad reduce la secuencia a la cuarta parte, es decir, una trama cada 40 ms, con unos 470.000 parámetros. A continuación se aplican 12 capas de Conformer con anchura 176, 4 cabezas de atención, convolución de anchura 15 y RoPE, con atención restringida al pasado y convoluciones causales (unos 8,64 millones de parámetros). Una capa lineal final proyecta a 86 clases (unos 15.000 parámetros): 84 hiragana (ぁ–ゔ), el alargamiento vocálico "ー" y el espacio. La decodificación es CTC voraz.

El entrenamiento se realizó desde cero con CTC, AdamW, SpecAugment, aumento de velocidad a 0,9/1,0/1,1 y precisión bf16. Se usaron aproximadamente 304 horas del subconjunto `ja000` de YODAS (subtítulos humanos), convertidas a hiragana en forma fonética mediante fugashi + unidic-lite. Se filtraron las muestras con números o letras y aquellas con una tasa de caracteres por segundo fuera del rango 3–15. La validación se separó por vídeo (2 %, unas 4,9 horas). El entrenamiento se detuvo tras 10 épocas sin mejora y se promediaron los 5 mejores checkpoints.

## Capacidades

- Reconocimiento de voz en japonés en streaming causal, con emisión de una predicción cada 40 ms.
- Salida exclusiva en hiragana en forma fonética (por ejemplo, "こんにちは" → "こんにちわ", "を" → "お", "今日" → "きょー").
- Alfabeto de salida de 86 símbolos: 84 hiragana, "ー" y espacio.
- Funcionamiento en CPU y GPU (el script `transcribe.py` permite `--cpu`).
- Entrada desde fichero WAV (con conversión automática a 16 kHz) o desde micrófono.
- No soporta tool calling, function calling ni razonamiento multi-step: es un modelo puramente ASR.
- No soporta visión ni audio más allá de la transcripción; no genera kanji ni katakana.
- No incluye cancelación de eco; el autor indica que debe aportarse por separado.

## Casos de uso

- Componente de "escucha" en sistemas de diálogo full-duplex: el modelo puede integrarse como front-end de ASR en un asistente conversacional que necesita transcribir mientras el usuario habla, gracias a su naturaleza causal y a la emisión cada 40 ms.
- Subtitulado en tiempo real de audio japonés en entornos controlados: útil para prototipos de subtitulado con latencia baja, siempre que se acepte la tasa de error actual y se posprocese la salida en hiragana.
- Transcripción fonética para pipelines de TTS: la salida en hiragana fonético puede alimentar directamente un sintetizador de voz japonés, evitando la conversión de kanji a lectura.
- Reconocimiento de comandos o vocabulario cerrado en dispositivos embebidos: su tamaño de 9,1 M permite ejecución en CPU o en hardware de gama baja, adecuado para prototipos de domótica o interfaces por voz.
- Investigación en ASR causal y streaming: modelo de referencia pequeño para experimentos de decodificación CTC, atención causal y comparación de latencias.
- Pruebas de robustez frente a ruido y música: el modelo documenta fallos ante ruido y melodías, lo que lo hace útil como caso de estudio de limitaciones en ASR de bajo coste.
- Integración en aplicaciones móviles experimentales: el autor sugiere que debería funcionar con fluidez en un smartphone convencional, aunque no se han publicado mediciones al respecto.

## Benchmarks y rendimiento

| Evaluación | CER |
|---|---|
| YODAS validación (≈4,9 h, audio de YouTube) | 0,471 |
| Voces no vistas en entrenamiento (voz sintética de Windows, 8 frases, voz clara) | 0,041 |

El autor reporta además que, con recálculo completo del audio acumulado cada 160 ms, el tiempo medio en GPU es de aproximadamente 76 ms. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (9,1 M de parámetros) la huella es mínima y cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecutarse incluso en CPU. Cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, con amplio margen; también en CPU.
- Opciones de despliegue: el repositorio incluye `transcribe.py` con soporte de fichero, micrófono y CPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: emisión cada 40 ms; con recálculo completo cada 160 ms, aproximadamente 76 ms de media en GPU según el autor. El script actual recalcula desde el inicio en cada nueva entrada de audio, lo que el autor señala como pendiente de optimizar.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, los modelos ASR en japonés habituales (por ejemplo, Whisper de OpenAI o modelos de ESPnet) tienen órdenes de magnitud más parámetros y no son causales, pero no se aportan datos concretos de comparación en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kikimimi-hiragana-9m | 9,1 M | streaming causal | CC BY 4.0 | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tasa de error elevada en conversación habitual y audio de YouTube: entre el 40 % y el 50 % de caracteres incorrectos (CER 0,471 en validación).
- Alta sensibilidad al ruido: CER de 0,30 cuando la voz es 3 veces más fuerte que el ruido y 0,52 cuando es 2 veces más fuerte.
- Genera texto espurio ante melodías, timbres y alarmas (por ejemplo, "ます" o "ま").
- Dificultad probable con números y letras extranjeras en el habla.
- No emite kanji ni katakana; la salida es solo hiragana fonético, por lo que requiere posprocesado para texto legible.
- El script de inferencia actual recalcula desde el principio en cada nueva entrada de audio, lo que limita el rendimiento en streaming real.
- No incluye cancelación de eco; en sistemas full-duplex debe añadirse por separado.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero el dataset de entrenamiento YODAS es CC BY 3.0, lo que conviene verificar para usos derivados.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; modelo muy reciente y sin validación comunitaria.
- Riesgo de alucinación y errores sistemáticos en vocabulario fuera de dominio; no recomendado para producción sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yakimask/kikimimi-hiragana-9m
- Dataset YODAS: https://huggingface.co/datasets/espnet/yodas
- Paper YODAS (Li et al., ASRU 2023): no disponible como enlace directo en la información proporcionada
- Repositorio de código: incluido en el propio repositorio de Hugging Face (`transcribe.py`, `requirements.txt`)
- Demo: no disponible
