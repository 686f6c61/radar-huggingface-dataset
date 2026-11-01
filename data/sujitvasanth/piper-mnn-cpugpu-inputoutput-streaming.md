# sujitvasanth/piper-mnn-cpugpu-inputoutput-streaming

## Resumen

Piper MNN es una adaptación del modelo de síntesis de voz Piper (`en_US-data_7024-medium`, 22050 Hz) empaquetado en dos modelos MNN de formas fijas para permitir inferencia completa en CPU o GPU (vía MNN OpenCL) sin reconstrucción del grafo. Lo publica el usuario de HuggingFace `sujitvasanth` y su objetivo es habilitar síntesis de voz en streaming, aceptando texto palabra a palabra (por ejemplo, directamente desde la salida de un LLM) mientras el audio se emite de forma incremental.

La innovación principal es la eliminación de formas dependientes de datos: el encoder recibe exactamente 64 IDs de fonemas y produce 160 frames latentes más duraciones por ID, y el decoder transforma 64 frames latentes en 16384 muestras de audio. Las dos entradas de ruido aleatorio pasan a ser entradas explícitas del grafo, lo que permite reutilizar el mismo ruido entre ventanas solapadas y garantizar salida bit-idéntica al export original de Piper.

El modelo está pensado para despliegue en dispositivos Android y entornos de escritorio con requisitos de latencia baja. El repositorio ocupa 0,1 GB e incluye los pesos MNN, una exportación equivalente en ONNX, scripts de exportación, una implementación de referencia en Python y un motor de streaming en C++.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Piper (VITS) exportado a MNN con formas fijas; encoder + decoder separados |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 IDs de fonemas por ventana (encoder); 64 frames latentes por chunk (decoder) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (la model card remite a la licencia original de la voz `en_US-data_7024-medium`) |
| Formato de pesos | MNN (`.mnn`) y ONNX (`.onnx`); configuración en `data.onnx.json` |

## Arquitectura y entrenamiento

El modelo deriva de la voz Piper `en_US-data_7024-medium`, una arquitectura VITS que combina un encoder de fonemas, un predictor de duraciones con splines y un decoder generativo con ruido. La adaptación a MNN separa el pipeline en dos grafos de formas fijas. El encoder acepta `input` int32 `[1, 64]` (IDs de fonemas con padding a cero), `input_lengths` int32 `[1]`, `scales` float `[3]` (`noise_scale`, `length_scale`, `noise_w`; valores por defecto `0.667, 1.0, 0.8`), `noise_dp` float `[1, 2, 64]` y `noise_z` float `[1, 192, 160]`. Devuelve `z` float `[1, 192, 160]`, `durations` float `[1, 1, 64]` y `frames` float `[1]`.

El decoder recibe `z` float `[1, 192, 64]` y máscaras de validez `valid_mask_1/8/64/256` float `[1, 1, 64×scale]` y produce `output` float `[1, 1, 1, 16384]` (256 muestras por frame). Los cambios respecto al export original de Piper son: formas fijas de entrada y salida (sin formas dependientes de datos), nodos de ruido convertidos en entradas y flujos de spline del predictor de duraciones implementados de forma densa con máscaras en lugar de `NonZero`/`GatherND`/`ScatterND`. Según el autor, la salida es bit-idéntica al modelo original. No se especifican datos de entrenamiento, número de tokens ni si hubo RLHF/DPO, ya que se trata de una reexportación de una voz existente.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto, con fonemización mediante eSpeak NG como en Piper.
- Streaming de texto de entrada: acepta texto palabra a palabra, pensado para conectar directamente con la salida de un LLM.
- Streaming de audio de salida: decodificación por chunks de 64 frames con crossfade de 2 frames (≈23 ms) entre ventanas.
- Control de prosodia mediante `scales` (`noise_scale`, `length_scale`, `noise_w`).
- Inferencia en CPU o GPU (MNN OpenCL) sin reconstrucción de grafo.
- Reutilización de ruido entre ventanas solapadas para coherencia acústica.
- No soporta tool calling, agentes, visión, audio de entrada ni capacidades multilingües más allá del inglés.

## Casos de uso

- Lectura de respuestas de un LLM en tiempo real: el modelo acepta texto palabra a palabra y emite audio conforme llega, lo que permite empezar a reproducir la respuesta antes de que el LLM termine de generarla. Adecuado por su diseño de streaming de entrada y salida.
- Asistentes de voz en Android: los pesos MNN y el motor C++ (`scripts/word_stream_piper.cpp`) están pensados para ejecutarse en dispositivos móviles con MNN OpenCL, con latencias de ~17 ms por ventana en CPU de escritorio.
- Narración de contenido dinámico: artículos, notificaciones o mensajes generados en tiempo de ejecución que requieren síntesis bajo demanda sin preprocesar el texto completo.
- Integración en pipelines de agentes conversacionales: al aceptar texto incremental, encaja en arquitecturas donde el LLM produce tokens y el TTS consume palabras, reduciendo el tiempo hasta el primer audio.
- Sistemas de accesibilidad: lectura de pantalla o conversión de texto a voz en aplicaciones de escritorio y móviles con requisitos de latencia baja y sin dependencia de servicios en la nube.
- Prototipado de interfaces de voz: la implementación de referencia en Python (`scripts/stream_text_windows.py`) y la exportación ONNX permiten validar el comportamiento antes de desplegar el motor C++ en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas de latencia y fidelidad de reconstrucción: ~17 ms por ventana en encoder y ~17 ms en decoder sobre CPU de escritorio, y un error relativo de ~7×10⁻⁷ entre los chunks ensamblados y la decodificación completa de la locución.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio pesa 0,1 GB y el modelo está diseñado para ejecutarse en CPU o GPU vía MNN OpenCL.
- GPU recomendadas: no se especifican modelos concretos; el autor menciona MNN OpenCL para GPU y pruebas en Android con GPU.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el diseño prioriza CPU y GPU móviles.
- Opciones de despliegue: runtime MNN (CPU/OpenCL), exportación ONNX para otros runtimes, motor C++ de streaming incluido en `scripts/word_stream_piper.cpp`.
- Latencia: ~17 ms de encoder + ~17 ms de decoder por ventana en CPU de escritorio; commit de 2–3 palabras por ventana en Android con GPU, sin pre-búfer y crossfade de 2 frames (≈23 ms).
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Contexto/ventana | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Piper MNN (este modelo) | TTS VITS exportado a MNN | en | 64 IDs / 64 frames por chunk | MNN, ONNX | no disponible | HuggingFace |
| Piper original (`en_US-data_7024-medium`) | TTS VITS | en | utterance completa | ONNX | según la voz original | HuggingFace / rhasspy |
| Coqui TTS (VITS) | TTS VITS | multilingüe | utterance completa | PyTorch, ONNX | MPL 2.0 (según modelo) | GitHub / HuggingFace |
| Kokoro TTS | TTS | multilingüe | utterance completa | ONNX, PyTorch | Apache 2.0 | HuggingFace |

La comparativa se limita a características estructurales; no hay datos de benchmarks disponibles para comparar calidad o latencia de forma cuantitativa.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no hay capacidades multilingües.
- Ventana de encoder limitada a 64 IDs de fonemas: la locución se corta si supera los 160 frames por ventana, lo que obliga a trocear el texto.
- El decoder requiere 12 frames de contexto a cada lado y descarta los bordes, lo que introduce complejidad en la gestión de ventanas y posibles artefactos si el solapamiento no se calcula correctamente.
- Licencia no disponible: la model card remite a la licencia de la voz original `en_US-data_7024-medium`, que debe verificarse antes de cualquier uso comercial o redistribución.
- Riesgo de alucinación no aplicable en el sentido de texto generado, pero sí de pronunciaciones incorrectas o prosodia anómala en texto fuera de dominio.
- Sin datos de benchmarks objetivos de calidad (MOS, WER) en la información disponible.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- El modelo no soporta tool calling, agentes, visión ni audio de entrada.

## Enlaces

- HuggingFace: https://huggingface.co/sujitvasanth/piper-mnn-cpugpu-inputoutput-streaming
- Voz original Piper `en_US-data_7024-medium`: referencia indicada en `data.onnx.json` del repositorio (no se proporciona URL directa en la información disponible).
- MNN (runtime de Alibaba): no se proporciona enlace en la información disponible.
- Piper (rhasspy/piper): no se proporciona enlace en la información disponible.
