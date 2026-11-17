# Suarify/kecil-tts-michael-v0.3.0

## Resumen

Kecil-TTS Michael v0.3.0 es un modelo de síntesis de voz (text-to-speech) para bahasa melayu (malayo de Malasia) con voz masculina, desarrollado por Suarify. Se trata de un modelo de un tamaño excepcionalmente reducido: 7,9 millones de parámetros y un único archivo ONNX de 8,47 MB con pesos en int8. Deriva del modelo Paradee-8M-v1.3 de Sahil Mahendrakar mediante destilación, y está pensado para ejecutarse íntegramente en el dispositivo, tanto en una pestaña del navegador mediante transformers.js (WebGPU o WASM) como en un solo hilo de CPU en Python con onnxruntime.

El modelo resuelve un problema muy concreto: disponer de TTS offline, sin servidor ni API, para malayo, con un coste de inferencia nulo y una huella mínima. Genera audio mono a 24 kHz y acepta como entradas `input_ids` (int64, `[1,T]`) y un parámetro `speed` (float32, `[1]`). Es el hermano masculino de Kecil-TTS Yati v0.4.1, la variante femenina del mismo autor.

La versión 0.3.0 es la primera exportada desde los checkpoints reales de entrenamiento (las anteriores se reconstruyeron desde el ONNX int8, lo que degradaba la precisión y distorsionaba la temporización), y continúa el entrenamiento sobre el conjunto completo de 1.261 clips. Su relevancia actual radica en que demuestra que un TTS utilizable en producción para un idioma de recursos medios cabe en menos de 9 MB y funciona sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo acústico derivado de Paradee-8M, exportado a ONNX opset 17; front end basado en reglas con vocabulario de fonemas Kokoro de 178 símbolos) |
| Parametros totales | 7,9 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada de fonemas `input_ids` `[1,T]`; sin límite documentado) |
| Tipos de cuantizacion | Int8 (pesos del archivo `onnx/model_quantized.onnx`) |
| Idiomas soportados | Bahasa Melayu (Malasia), con palabras inglesas de uso común en el habla malasia |
| Licencia | Apache-2.0 (el léxico `lexicon_e.json` es CC BY-SA 4.0) |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`), distribuido también como wheel de Python `kecil_tts_8m-0.3.0-py3-none-any.whl` |

## Arquitectura y entrenamiento

El modelo es un estudiante Paradee-8M de 7,9 M de parámetros, entrenado mediante destilación sobre un corpus generado sintéticamente. El pipeline consta de un front end de malayo basado en reglas (implementado en `kecil_tts/` y portado a `js/`) que convierte texto en fonemas dentro del vocabulario de 178 símbolos de Kokoro. El corpus de entrenamiento son 1.261 clips de malayo (87 minutos) generados con Chatterbox Multilingual y convertidos a la voz masculina; 767 de ellos se regeneraron dos veces con selección basada en CER. El estudiante Paradee-8M se entrenó en una T4: 16.000 pasos de decoder (continuando desde el decoder de Yati v0.4) y unos 8.000 pasos efectivos del lado de texto, con selección de checkpoint basada en duración y reconocimiento.

La versión 0.3.0 introduce tres cambios técnicos destacables: exportación desde los checkpoints reales en precisión completa (en lugar de reconstruir desde el int8, lo que provocaba vocales mantenidas de 16 frames o 400 ms), un clamp de temporización de 75–200 ms por fonema para evitar el recorte de fonemas de un solo frame, y la continuación del entrenamiento (+4.000 pasos de decoder, +4.500 de texto) con pérdida espectral retenida que baja de 2,545 a 2,497. La ruta de sonido se mantiene respecto a v0.2.2: 128 armónicos, ruido de respiración enmascarado entre parciales, hangover de 22 ms para consonantes, suavizado de ganancia de ruido de 3 frames y shelf de aire de +3 dB por encima de 6,5 kHz. La exportación a ONNX (opset 17) es compatible con WebGPU, sin operadores float64.

## Capacidades

- Síntesis de voz (text-to-speech) en bahasa melayu con voz masculina sintética única.
- Salida de audio mono a 24 kHz.
- Control de velocidad mediante el parámetro `speed` de entrada.
- Ejecución en navegador mediante transformers.js con WebGPU o WASM, y en Node.
- Ejecución en Python con onnxruntime, incluso en un solo hilo de CPU.
- Funcionamiento completamente offline: un único archivo, sin servidor ni API.
- Manejo de palabras inglesas comunes en el habla malasia (con limitaciones de precisión).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- No ofrece control de emoción ni de estilo.

## Casos de uso

- Lectura por voz en aplicaciones web offline: el modelo se carga en una pestaña del navegador vía transformers.js y WebGPU y sintetiza texto malayo sin enviar datos a ningún servidor, adecuado para aplicaciones de accesibilidad o lectura de contenido.
- Asistentes de voz embebidos en dispositivos de bajos recursos: con 8,47 MB y ~19× tiempo real en un solo hilo de CPU, cabe en Raspberry Pi o móviles y permite interacción por voz sin conectividad.
- Prototipado rápido de interfaces conversacionales en malayo: el wheel de Python y la API `KecilTTS.from_pretrained` permiten integrar TTS en scripts y notebooks en minutos, sin infraestructura GPU.
- Generación de audiolibros o contenido educativo en malayo: la velocidad de ~19× tiempo real en CPU permite procesar textos largos por lotes con coste de inferencia nulo.
- Sistemas de anuncios o señalización en comercios y transporte de Malasia: la voz masculina y el soporte de palabras inglesas comunes encajan en mensajes cortos y repetitivos.
- Pruebas de integración continua de pipelines de voz: al ser un único archivo ONNX determinista y ligero, sirve como fixture para validar cadenas de TTS en CI sin dependencias externas.
- Aplicaciones de privacidad estricta (sanidad, legal): el procesamiento totalmente local evita la fuga de texto sensible a servicios de terceros.

## Benchmarks y rendimiento

Reconocimiento con Whisper large-v3, tasa de error de caracteres (CER; menor es mejor). Medido sobre los pesos desde los que continúa esta versión (checkpoint C4); los pesos exactos de v0.3.0 no se han reevaluado a fecha de 2026-11-17.

| Modelo | Test (200 frases) | Held-out (60 frases) | Proporción ≤ 8% CER (test) |
|---|---|---|---|
| Michael v0.2 (antes de los datos C4) | 8,7% / 14,3% | 7,1% / 14,3% | 49% |
| Michael C4 → v0.3.0 | 6,9% / 10,6% | 2,2% / 8,2% | 55% |
| Yati v0.4 (femenina, referencia) | 5,5% / 9,5% | 4,8% / 8,5% | 68% |

Mediana / media acotada. El propio reconocedor confunde aproximadamente el 9% de los caracteres de los clips de entrenamiento, por lo que ningún modelo puntúa 0.

Textura sonora (mismas 6 frases, sesión de esta release):

| Métrica | Objetivos Chatterbox | Yati v0.4.1 | Michael v0.2.2 | Michael v0.3.0 |
|---|---|---|---|---|
| Periodicidad (claridad de tono) | 0,699 | 0,751 | 0,634 | 0,662 |
| Planitud espectral 2–6 kHz | 0,621 | 0,597 | 0,470 | 0,440 |
| Energía por encima de 4 kHz | 0,080 | 0,025 | 0,095 | 0,091 |
| Energía por encima de 7 kHz | — | 0,003 | 0,043 | 0,043 |

Tamaño, velocidad y coste:

| Métrica | Michael v0.3.0 | Yati v0.4.1 |
|---|---|---|
| Archivo del modelo | 8,47 MB | 8,46 MB |
| Parámetros | 7,9 M | 7,9 M |
| Velocidad en CPU (1 hilo onnxruntime) | ~19× tiempo real | ~21× tiempo real |
| Velocidad en navegador (transformers.js, WebGPU) | ~4,5× tiempo real | ~4–5× tiempo real |
| Primera carga en navegador | ~7–10 s (cacheado después) | ~7–10 s |
| Coste de entrenamiento GPU | ~15 min T4 para la continuación +4.000/+4.500; base de 12.000/7.500 pasos ≈ 35 min | ~60 min T4 para el run base |
| Coste de inferencia | RM 0 (sin servidor ni API) | RM 0 |
| Offline | Sí | Sí |

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Idioma | Contexto | CER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Kecil-TTS Michael v0.3.0 | 7,9 M | 8,47 MB (int8 ONNX) | Malayo (ms) | No disponible | 6,9% / 10,6% | Apache-2.0 | Hugging Face |
| Kecil-TTS Yati v0.4.1 | 7,9 M | 8,46 MB (int8 ONNX) | Malayo (ms) | No disponible | 5,5% / 9,5% | Apache-2.0 | Hugging Face |
| Paradee-8M-v1.3 (modelo base) | ~8 M | No disponible | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| Kokoro-82M | 82 M | No disponible | Multilingüe (incluye voces am_michael) | No disponible | No disponible | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- La temporización está acotada (clamp), por lo que los fonemas muy cortos duran como mínimo 75 ms; para una dicción más rápida debe usarse el parámetro `speed`.
- Las palabras inglesas y las frases largas son los puntos débiles del modelo, según la tabla de CER.
- El timbre conserva el carácter de doble conversión de voz del audio de entrenamiento (ligeramente apagado en vocales largas).
- Una única voz masculina sintética, sin control de emoción ni de estilo.
- Es voz sintética: el autor pide indicarlo explícitamente cuando se utilice.
- El modelo es solo de síntesis; no acepta audio de entrada ni realiza reconocimiento.
- El léxico `lexicon_e.json` deriva de datos de Wiktionary y está bajo CC BY-SA 4.0, lo que impone obligaciones de atribución y compartir igual sobre ese componente, aunque los pesos y el código sean Apache-2.0.
- Los pesos exactos de v0.3.0 no se han reevaluado con Whisper a fecha de 2026-11-17; las cifras de CER corresponden al checkpoint C4 del que continúa.
- Riesgo de alucinación acústica o pronunciación incorrecta en texto fuera de dominio (nombres propios, siglas, préstamos no cubiertos por el front end de reglas).
- Sesgos de idioma: entrenado únicamente con malayo de Malasia y palabras inglesas comunes; no cubre otros registros del malayo (Indonesia, Brunéi) ni otras lenguas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/kecil-tts-michael-v0.3.0
- Modelo base: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Modelo hermano femenino (Kecil-TTS Yati v0.4.1): https://huggingface.co/Suarify/kecil-tts-yati-v0.4.1
- Wheel de Python: https://huggingface.co/Suarify/kecil-tts-michael-v0.3.0/resolve/main/dist/kecil_tts_8m-0.3.0-py3-none-any.whl
- Kokoro-82M (hexgrad): https://huggingface.co/hexgrad/Kokoro-82M
- Chatterbox Multilingual (Resemble AI): https://huggingface.co/ResembleAI/chatterbox
- Repositorio de Paradee (Sahil Mahendrakar): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
