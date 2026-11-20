# Suarify/kecil-tts-firdaus-v0.1

## Resumen
Kecil-TTS Firdaus v0.1 es un modelo de síntesis de voz (text-to-speech) en bahasa melayu (Malasia) con voz masculina, desarrollado por Suarify. Se distribuye como un único fichero ONNX cuantizado de 8,47 MB (pesos int8) con 7,9 millones de parámetros, pensado para ejecutarse íntegramente en el dispositivo: en una pestaña del navegador mediante transformers.js (WebGPU o WASM) o en un único hilo de CPU en Python. No requiere servidor ni API externa.

El modelo deriva de sahilmahendrakar/Paradee-8M-v1.3 y se ha construido con la receta "Path-B" del modelo Yati v0.5 del mismo autor: 1.281 clips de Yati convertidos con ChatterboxVC a la referencia `am_fenrir`, normalizados en sonoridad, y posteriormente entrenados el lado de texto, el decodificador y una etapa adversarial corta partiendo de los pesos de Yati v0.5 (identificador interno de entrenamiento: `fenrir`). La salida es audio mono a 24 kHz.

Es relevante por su perfil de despliegue extremo (menos de 9 MB, totalmente offline, sin coste de inferencia) y por la transparencia del autor sobre su calidad: se trata de una versión temprana cuya voz suena robótica según las propias pruebas de escucha, con métricas objetivas por debajo de las otras voces de la familia. Resulta útil como referencia de TTS malayo embebible y como caso de estudio de un modelo pequeño con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS derivado de Paradee-8M; incluye lado de texto, decodificador y cabeza log-F0) |
| Parametros totales | 7,9 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Int8 (fichero `onnx/model_quantized.onnx`); 0 operaciones en float64 |
| Idiomas soportados | Bahasa Melayu (Malasia), código `ms` |
| Licencia | Apache-2.0 (pesos y código); léxico `lexicon_e.json` bajo CC BY-SA 4.0 |
| Formato de pesos | ONNX (cuantizado int8), compatible con transformers.js |
| Frecuencia de muestreo de salida | 24 kHz, mono |
| Entradas | `input_ids` (int64 `[1,T]`) y `speed` (float32 `[1]`) |
| Tamano del fichero | 8,47 MB |
| Modelo base | sahilmahendrakar/Paradee-8M-v1.3 |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna completa. Se sabe que el modelo parte de Paradee-8M-v1.3 y que incorpora un lado de texto, un decodificador y una cabeza log-F0 (predicción de frecuencia fundamental), así como una etapa adversarial (GAN) que produjo el checkpoint finalmente publicado. El autor indica que un checkpoint sin GAN puntuó aún más bajo (UTMOS 1,27), por lo que se optó por la variante adversarial.

El entrenamiento siguió la receta Path-B de Yati v0.5: 1.281 clips de Yati convertidos una sola vez con ChatterboxVC a la referencia de voz `am_fenrir`, normalizados en sonoridad, y después entrenamiento del lado de texto, del decodificador y de una etapa adversarial corta a partir de los pesos de Yati v0.5. La cabeza log-F0 se recentró correctamente al rango de tono masculino (unos 122 Hz frente a los ~200 Hz de Yati), lo que el autor interpreta como comportamiento genuino del modelo y no como un fallo de configuración. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de los clips citados.

## Capacidades
- Síntesis de voz a partir de texto en bahasa melayu (Malasia) con voz masculina.
- Control de velocidad mediante la entrada `speed` (float32).
- Salida de audio mono a 24 kHz.
- Ejecución en navegador con transformers.js, tanto en WebGPU como en WASM.
- Ejecución en Python en un único hilo de CPU mediante la librería `suaradee` y onnxruntime.
- Funcionamiento totalmente offline: no hay llamadas a servidor ni a API.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión ni audio de entrada.
- No es un modelo multilingüe: está limitado al malayo.

## Casos de uso
- Síntesis de voz embebida en aplicaciones web: el modelo se carga como un único fichero ONNX de 8,47 MB con transformers.js y puede generar voz malaya directamente en la pestaña del navegador, sin backend ni coste de API.
- Lectura de contenido en malayo en dispositivos con recursos limitados: al ejecutarse en un solo hilo de CPU, encaja en entornos sin GPU y en hardware de gama baja.
- Prototipado de asistentes de voz offline: la API `Suaradee.from_pretrained` permite integrar TTS en scripts Python con onnxruntime para pruebas de concepto de asistentes en malayo.
- Generación de avisos y mensajes pregrabados dinámicos: útil para producir locuciones de voz masculina en malayo en sistemas de megafonía, kioscos o terminales de autoservicio que operan sin conexión.
- Aplicaciones de accesibilidad sin conectividad: lectura en voz alta de texto para usuarios con discapacidad visual en entornos donde no se puede depender de servicios en la nube.
- Investigación y docencia sobre TTS de muy bajo tamaño: sirve como referencia reproducible de un pipeline TTS de 7,9 M de parámetros con receta de destilación por conversión de voz y etapa adversarial.
- Pruebas de integración en pipelines de CI para TTS: su reducido tamaño y su formato ONNX facilitan tests automatizados de inferencia en contenedores sin GPU.

## Benchmarks y rendimiento

| Modelo | UTMOS media / p10 |
|---|---|
| Chatterbox teacher (techo) | 3,553 / 3,162 |
| Yati v0.5 | 2,275 / 1,793 |
| Nicole v0.1 | 2,180 / 1,765 |
| **Firdaus v0.1 (este modelo)** | **1,843 / 1,465** |
| Michael v0.3.1 | 1,813 / 1,445 |

Métricas de salud de F0 en filas reservadas: caída de sonoridad (voiced dropout) del 33 %, error V/UV del 36 % y ratio de span 10–90 de 2,35, frente al 18 %, 28 % y 3,35 de Yati. El autor no publica cifra de CER para este modelo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware
- VRAM estimada para inferencia: no aplica en la práctica; el modelo pesa 8,47 MB en int8 y puede ejecutarse en CPU.
- GPU recomendadas: no se especifican modelos concretos; el autor indica compatibilidad con WebGPU en navegador.
- Cabe en cualquier GPU de consumo e incluso en CPU: se ejecuta en un único hilo de CPU en Python.
- Opciones de despliegue: transformers.js (WebGPU o WASM) en navegador; onnxruntime en Python mediante la librería `suaradee` (wheel `suaradee-0.1.0-py3-none-any.whl`).
- Latencia y throughput: no disponibles en la información proporcionada.
- Coste de servidor: nulo (RM 0 según el autor), al ser inferencia totalmente local.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | UTMOS media / p10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Firdaus v0.1 | 7,9 M | Malayo | 1,843 / 1,465 | Apache-2.0 | ONNX int8, transformers.js |
| Yati v0.5 | No disponible | Malayo | 2,275 / 1,793 | No disponible en la información | Repo de Suarify |
| Nicole v0.1 | No disponible | No disponible | 2,180 / 1,765 | No disponible en la información | Repo de Suarify |
| Michael v0.3.1 | No disponible | No disponible | 1,813 / 1,445 | No disponible en la información | Repo de Suarify |
| Chatterbox teacher | No disponible | Multilingüe (referencia) | 3,553 / 3,162 | No disponible en la información | Resemble AI |

## Limitaciones y advertencias
- Calidad de voz baja: el propio autor describe la voz como robótica y sitúa el UTMOS en 1,843, por debajo de Yati, Nicole y del techo de Chatterbox.
- Salud de F0 deficiente: 33 % de voiced dropout, 36 % de error V/UV y ratio de span 10–90 de 2,35, peores que los de Yati.
- No hay cifra de CER publicada, por lo que no se puede evaluar la inteligibilidad con una métrica objetiva.
- Riesgo de artefactos y pronunciación incorrecta al ser una versión temprana (v0.1) con entrenamiento limitado (1.281 clips).
- Cobertura lingüística restringida al bahasa melayu de Malasia; no soporta otros idiomas.
- Es voz sintética: el autor pide indicarlo explícitamente cuando se use.
- Licencia Apache-2.0 para pesos y código, pero el léxico `lexicon_e.json` deriva de datos de Wiktionary y está bajo CC BY-SA 4.0, lo que impone obligaciones de atribución y compartición sobre ese componente.
- No es un modelo de lenguaje: no ofrece razonamiento, código, tool calling ni agentes; cualquier expectativa en ese sentido queda fuera de su alcance.

## Enlaces
- Hugging Face: https://huggingface.co/Suarify/kecil-tts-firdaus-v0.1
- Modelo base: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Modelo Yati v0.5 (receta Path-B): https://huggingface.co/Suarify/kecil-tts-yati-v0.5.0
- Wheel de Python: https://huggingface.co/Suarify/kecil-tts-firdaus-v0.1/resolve/main/dist/suaradee-0.1.0-py3-none-any.whl
- Fichero ONNX: https://huggingface.co/Suarify/kecil-tts-firdaus-v0.1/resolve/main/onnx/model_quantized.onnx
