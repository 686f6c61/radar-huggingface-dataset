# Suarify/kecil-tts-nicole-v0.1

## Resumen

Kecil-TTS Nicole v0.1 es un modelo de síntesis de voz (text-to-speech) en bahasa melayu (Malasia) con voz femenina, desarrollado por Suarify. Se trata de un modelo extremadamente compacto: 7,9 millones de parámetros y un único archivo ONNX de 8,47 MB con pesos cuantizados a int8, lo que permite ejecutarlo integramente en el navegador mediante transformers.js (WebGPU o WASM) o en un solo hilo de CPU en Python. El modelo deriva de Paradee-8M-v1.3 (Sahil Mahendrakar) y se distribuye bajo licencia Apache-2.0.

El modelo resuelve el problema de la síntesis de voz offline de bajos recursos para malayo: no requiere servidor ni API, no envía datos fuera del dispositivo y produce audio mono a 24 kHz. La voz se construyó mediante conversión de voz desde el modelo Yati v0.4.1 hacia la referencia `af_nicole` (lo que el autor denomina "Path B"), seguida de 12.000 pasos de entrenamiento del lado de texto y del decodificador sobre 948 clips.

Es relevante ahora porque demuestra que es viable desplegar TTS neuronal multilingüe en el cliente con un coste de inferencia nulo y sin conexión, un patrón útil para aplicaciones web y móviles con requisitos de privacidad. No obstante, es una versión temprana (v0.1) con limitaciones de calidad reconocidas por el propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS neuronal derivado de Paradee-8M; detalles de arquitectura interna no publicados) |
| Parámetros totales | 7,9 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int8 (archivo `onnx/model_quantized.onnx`) |
| Idiomas soportados | Bahasa melayu (Malasia), con palabras inglesas de uso común en el habla malasia |
| Licencia | Apache-2.0 (código y pesos); `lexicon_e.json` derivado de Wiktionary bajo CC BY-SA 4.0 |
| Formato de pesos | ONNX (transformers.js) |

Datos adicionales: salida de audio mono a 24 kHz; entradas `input_ids` (int64 `[1,T]`) y `speed` (float32 `[1]`); tamaño del repositorio 0,0 GB (archivo de 8,47 MB); pipeline `text-to-speech`.

## Arquitectura y entrenamiento

El modelo es un TTS neuronal derivado de Paradee-8M-v1.3, del que hereda la arquitectura base (no detallada en la model card). La voz Nicole se generó por conversión de voz desde el modelo limpio Yati v0.4.1 hacia la referencia `af_nicole` (Path B), produciendo 948 clips de entrenamiento. Sobre esos clips se entrenaron el lado de texto y el decodificador durante 12.000 pasos.

La exportación incorpora tres ajustes técnicos declarados por el autor: colocación de ruido "FIX H", suavizado de ganancia (*gain smoothing*) y un estante de agudos (*air shelf*) de +6 dB. El resultado se empaqueta como un único archivo ONNX con pesos int8. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de los 948 clips, ni si hubo etapas de RLHF o DPO (poco probables en un modelo de este tamaño y tarea).

## Capacidades

- Síntesis de voz a partir de texto en bahasa melayu, con voz femenina (`af_nicole`).
- Control de velocidad mediante la entrada `speed` (float32).
- Salida de audio mono a 24 kHz.
- Ejecución en navegador vía transformers.js con WebGPU o WASM.
- Ejecución en Python con ONNX Runtime en un solo hilo de CPU.
- Funcionamiento totalmente offline: un único archivo, sin llamadas a servidor ni API.
- Inferencia en el dispositivo, sin enviar texto ni audio fuera del cliente.
- No dispone de tool calling, capacidades de agente, visión, audio de entrada ni modo de razonamiento; es exclusivamente un modelo de texto a voz.

## Casos de uso

- Lectura por voz en aplicaciones web en malayo: integración mediante transformers.js para leer contenido dinámico (noticias, artículos, formularios) directamente en el navegador, sin backend y con la privacidad del procesamiento local.
- Asistentes de voz embebidos en dispositivos de bajos recursos: el modelo de 8,47 MB y ~19× tiempo real en un hilo de CPU permite ejecutarlo en Raspberry Pi o móviles sin GPU dedicada.
- Accesibilidad para personas con discapacidad visual: narración de interfaces y textos en bahasa melayu en aplicaciones de escritorio o web que deben funcionar sin conexión.
- Avisos y notificaciones habladas en kioscos o sistemas empotrados: generación de mensajes cortos en tiempo real con coste de inferencia cero (RM 0 según el autor).
- Prototipado rápido de productos de voz: al ser un único archivo ONNX con licencia Apache-2.0, sirve para validar flujos de TTS en malayo antes de invertir en modelos mayores.
- Aprendizaje y experimentación: base ligera para estudiar conversión de voz, cuantización int8 y despliegue de TTS en navegador con WebGPU.
- Preprocesado de datos sintéticos de audio: generación de clips de voz en malayo para aumento de datos en pipelines de ASR, asumiendo la advertencia de que es voz sintética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no existe todavía un valor de CER (tasa de error de caracteres) para esta versión y que la evaluación con Whisper large-v3 está pendiente; advierte de que la tabla CER de Yati v0.4.1 no es aplicable a esta voz.

Los únicos datos de rendimiento publicados son de velocidad:

| Métrica | Nicole v0.1 | Yati v0.4.1 |
|---|---|---|
| Archivo del modelo | 8,47 MB | 8,46 MB |
| Parámetros | 7,9 M | 7,9 M |
| Velocidad en CPU (1 hilo onnxruntime) | ~19× tiempo real | ~21× tiempo real |
| Navegador (WebGPU / WASM) | Soportado | Soportado |
| Coste de inferencia | RM 0 (sin servidor/API) | RM 0 |
| Offline | Sí (un archivo) | Sí |

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el archivo int8 de 8,47 MB cabe holgadamente en cualquier GPU, incluida la memoria compartida de gráficas integradas.
- GPU recomendadas: no se requieren. Cualquier GPU compatible con WebGPU sirve para acelerar en navegador; en servidor, una GPU modesta (T4, L4) es más que suficiente, aunque el modelo está pensado para CPU.
- ¿Cabe en GPU de consumo? Sí, en cualquier GPU de consumo e incluso en iGPU; también funciona sin GPU.
- Opciones de despliegue: ONNX Runtime (Python, un hilo de CPU), transformers.js en navegador con WebGPU o WASM, y el paquete Python `suaradee` (wheel `suaradee-0.1.0-py3-none-any.whl`).
- Latencia y throughput: ~19× tiempo real en un solo hilo de CPU con onnxruntime, según el autor. No se publican cifras de latencia por petición ni de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Kecil-TTS Nicole v0.1 | 7,9 M | Malayo (ms) | ONNX int8 | Apache-2.0 | Navegador (WebGPU/WASM) y CPU |
| Kecil-TTS Yati v0.4.1 | 7,9 M | Malayo (ms) | ONNX int8 | No disponible en la información | Navegador y CPU |
| Paradee-8M-v1.3 (modelo base) | ~8 M | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de contexto para comparar rendimiento con alternativas de la misma categoría. La comparación con Yati v0.4.1 se limita a tamaño y velocidad (ver tabla de benchmarks); ambos son proyectos del mismo autor y comparten arquitectura base.

## Limitaciones y advertencias

- Es una versión temprana (v0.1): el autor reconoce que la voz es inteligible y con volumen correcto, pero no tan fiel al audio docente como se desea; persiste una textura acuosa o con desfase de fase (*watery/phasey*) en algunas palabras.
- No hay métrica de calidad objetiva publicada (CER pendiente); no debe asumirse la calidad de Yati v0.4.1.
- Cobertura lingüística limitada al malayo de Malasia con préstamos ingleses; no soporta otros idiomas.
- Riesgo de pronunciación incorrecta en palabras fuera del léxico cubierto, nombres propios y siglas.
- Es voz sintética: el autor pide declararlo explícitamente cuando se use.
- Licencia Apache-2.0 para código y pesos, pero los ficheros `kecil_tts/lexicon_e.json` y `js/g2p/lexicon_e.json` derivan de Wiktionary y están bajo CC BY-SA 4.0, lo que impone obligaciones de atribución y compartir igual sobre esos recursos.
- Sin datos publicados sobre sesgos demográficos o acústicos de la voz; al derivarse de una única referencia de voz, la diversidad de hablantes es nula (un solo timbre).
- El autor anuncia que el repositorio se actualizará o quedará superado cuando llegue el plan de mejora (predicción log-F0 y voiced/unvoiced, entrenamiento del decodificador guiado por profesor y etapa adversarial), por lo que la API o los artefactos pueden cambiar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/kecil-tts-nicole-v0.1
- Modelo base Paradee-8M-v1.3: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Modelo Yati v0.4.1 (fuente de la conversión de voz): https://huggingface.co/Suarify/kecil-tts-yati-v0.4.1
- Wheel del paquete Python `suaradee`: https://huggingface.co/Suarify/kecil-tts-nicole-v0.1/resolve/main/dist/suaradee-0.1.0-py3-none-any.whl
