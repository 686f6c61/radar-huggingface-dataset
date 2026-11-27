# SpeechAntiSpoofingBenchmarks/RawNetLite

## Resumen

RawNetLite es un detector ligero de audio falsificado (anti-spoofing) que opera directamente sobre la forma de onda cruda, sin extracción de características espectrales intermedias. Lo desarrollan Di Pierno et al. y se publica en IJCNN VERIMEDIA 2025; este repositorio de Hugging Face es un empaquetado del checkpoint original para integrarlo en el banco de pruebas Speech Anti-Spoofing Arena. El modelo resuelve la clasificación binaria entre voz genuina (bona fide) y voz sintética o manipulada, un problema central para la verificación biométrica de locutor y la detección de deepfakes de voz.

La arquitectura es una red neuronal convolucional 1-D de tres bloques residuales seguida de un GRU bidireccional y una cabeza lineal, con solo 0,24 millones de parámetros. Esa escala mínima lo convierte en un candidato atractivo para despliegues con recursos muy limitados, frente a los detectores basados en modelos auto-supervisados de cientos de millones de parámetros.

Su relevancia actual radica en que sirve como referencia de bajo coste en la arena de evaluación: permite medir cuánto rendimiento se obtiene con un detector casi trivial en comparación con sistemas pesados, y expone con claridad el problema de generalización entre dominios (codecs, idiomas, condiciones acústicas) que lastra a los detectores ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1-D residual + GRU bidireccional (end-to-end sobre forma de onda) |
| Parametros totales | 0,24 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 3 s de audio (48.000 muestras a 16 kHz); sin contexto textual |
| Tipos de cuantizacion | no disponible (checkpoint publicado en FP32) |
| Idiomas soportados | no disponible (el modelo es independiente del idioma por diseño) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La red es totalmente convolucional en su primera mitad: Conv1D(1→64) + BatchNorm + ReLU, tres bloques residuales 1-D de 64 canales, un pooling adaptativo a 64 pasos temporales, un GRU bidireccional de 128 unidades por dirección (se toma el último paso) y una cabeza Linear(256,64) → Linear(64,1). La entrada es la señal cruda, preprocesada según el `audio_preprocessor.py` de los autores: 16 kHz mono, normalización por pico (dividir por el máximo valor absoluto del clip completo), primeros 48.000 muestras (3 s) y relleno de ceros a la derecha. La salida es un logit único; la puntuación publicada es `-logit(fake)`, de modo que valores más altos indican mayor probabilidad de voz genuina.

El checkpoint `triple_cross_domain_focal_rawnet_lite.pt` se entrenó con pérdida focal sobre una mezcla equilibrada de FakeOrReal, ASVspoof 2021 (denominado "AVSpoof2021" en el artículo) y CodecFake, sin aumentación de datos. No se documentan en la información disponible el número de tokens ni horas de audio de entrenamiento, ni si hubo etapas de ajuste fino adicionales. La innovación técnica principal es precisamente la ausencia de front-end: al aprender representaciones directamente de la forma de onda, el modelo evita el sesgo de características espectrales fijas, a costa de una capacidad de generalización limitada.

## Capacidades

- Detección binaria de voz falsificada frente a voz genuina sobre audio de 16 kHz.
- Operación end-to-end sobre forma de onda cruda, sin extractor de características externo.
- Puntuación continua (logit negado) que permite umbralizar según el punto de operación deseado.
- Inferencia en FP32 con TF32 desactivado, reproducible con el wrapper de PyTorch del repositorio.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto, audio ni código.
- No dispone de modo thinking, visión ni capacidades multimodales.
- El soporte multilingüe es implícito (la tarea no depende del idioma), pero no se documenta evaluación por idioma.

## Casos de uso

- Referencia base en investigación de anti-spoofing: sirve como línea de base de bajo coste para comparar detectores pesados en la Speech Anti-Spoofing Arena, aislando cuánta mejora aporta la escala.
- Filtrado previo en sistemas de verificación de locutor: al consumir solo 3 s de audio y 0,24 M de parámetros, puede ejecutarse como primera etapa de cribado antes de un verificador más costoso.
- Detección de deepfakes en entornos con recursos restringidos: su huella mínima permite integrarlo en dispositivos embebidos o navegador, aunque con la advertencia de sus altas tasas de error entre dominios.
- Monitorización de calidad en pipelines de datos de voz: descartar automáticamente muestras sintéticas en la construcción de corpus de entrenamiento para ASR o TTS.
- Investigación sobre generalización entre dominios: sus resultados dispares entre ASVspoof2019_LA (15,08 % EER) y DeepVoice (50,48 % EER) lo hacen útil para estudiar el efecto del codec y la condición acústica.
- Evaluación comparativa de preprocesados: al estar el pipeline de audio fijado y documentado, permite reproducir experimentos sobre normalización y duración de clip de forma controlada.
- Docencia y prototipado: implementación compacta y legible que ilustra una arquitectura completa de detección de spoofing en pocas capas.

## Benchmarks y rendimiento

Resultados de la Speech Anti-Spoofing Arena, EER % (menor es mejor); EmoSpoofTTS y LRLspoof son solo-spoof y usan 1-SRR % en el umbral EER de DeepVoice.

| Conjunto de evaluacion | EER % |
|---|---|
| ASVspoof2019_LA | 15,08 |
| ASVspoof2021_LA | 18,14 (marcado n/a* por solapamiento con entrenamiento) |
| ASVspoof2021_DF | 20,19 (marcado n/a* por solapamiento con entrenamiento) |
| ASVspoof5 | 45,69 |
| InTheWild | 40,51 |
| ADD22_eval_31 | 44,11 |
| ADD2023_track12_test_r1 | 46,63 |
| CFAD | 34,22 |
| CD-ADD | 42,55 |
| CVoiceFake_small | 37,46 |
| DeepVoice | 50,48 |
| LibriSeVoc | 51,27 |
| SONAR | 42,04 |
| ArAD | 42,98 |
| DECRO | 35,72 |
| J-SPAW_LA | 34,19 |

No se han publicado en la información disponible resultados de benchmarks comparativos directos con otros modelos en una tabla común; los valores anteriores son los del propio sistema en la arena.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32; el checkpoint ocupa unos 0,1 GB en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX o incluso en CPU y en aceleradores embebidos.
- Opciones de despliegue: PyTorch nativo (wrapper del repositorio); no se documentan exportaciones a ONNX, TensorRT, llama.cpp ni vLLM.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera muy baja latencia, pero no hay cifras publicadas.
- El repositorio indica que todas las puntuaciones de la arena se obtuvieron con el wrapper de PyTorch en FP32 con TF32 desactivado.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de parámetros, contexto ni rendimiento de modelos alternativos de anti-spoofing, por lo que la comparativa cuantitativa no está disponible. Cualitativamente, RawNetLite se sitúa en la categoría de detectores ligeros end-to-end sobre forma de onda, frente a enfoques basados en front-ends espectrales (LFCC, CQCC) o en modelos auto-supervisados de gran tamaño; la comparación numérica con estos últimos requeriría ejecutarlos en la misma arena.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RawNetLite | 0,24 M | 3 s de audio | MIT | Hugging Face + GitHub |
| Alternativas de anti-spoofing | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy variable entre dominios: pasa del 15,08 % EER en ASVspoof2019_LA al 50,48 % en DeepVoice y 51,27 % en LibriSeVoc, cerca del azar en varios conjuntos.
- Los resultados en ASVspoof2021_LA y ASVspoof2021_DF están marcados como n/a* por solapamiento con los datos de entrenamiento, por lo que no deben interpretarse como generalización real.
- Entrenado sin aumentación de datos, lo que probablemente limita su robustez ante codecs, ruido y condiciones acústicas no vistas.
- Ventana fija de 3 s con relleno de ceros: clips más largos se truncan y clips más cortos se rellenan, lo que puede degradar la detección.
- Riesgo de falsos negativos y positivos elevado en entornos reales; no debe usarse como único mecanismo de seguridad en verificación biométrica.
- No se documentan sesgos por idioma, género o grupo demográfico; la ausencia de evaluación por subgrupos es en sí un riesgo para producción.
- Licencia MIT permite uso comercial, pero el modelo se distribuye como artefacto de investigación sin garantías de rendimiento.
- El repositorio no incluye pipeline declarado en Hugging Face ni pesos en safetensors; la integración requiere cargar el `.pt` con código propio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/RawNetLite
- Checkpoint: https://huggingface.co/SpeechAntiSpoofingBenchmarks/RawNetLite/blob/7209f7f94f1c69bc0d2320e854914e0966b12bd4/triple_cross_domain_focal_rawnet_lite.pt
- Paper: https://arxiv.org/abs/2504.20923
- Codigo de los autores: https://github.com/adipiz99/RawNetLite/tree/fcb0fe8d0f40146d110e322c00a0723ba27d5520
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Resultados de la arena para este sistema: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=rawnetlite
