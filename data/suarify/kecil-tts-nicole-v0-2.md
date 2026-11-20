# Suarify/kecil-tts-nicole-v0.2

## Resumen

Kecil-TTS Nicole v0.2 es un modelo de síntesis de voz (text-to-speech) en bahasa melayu (Malasia) con voz femenina, desarrollado por Suarify. Se distribuye como un único fichero ONNX de 8,47 MB con pesos cuantizados a int8 y 7,9 millones de parámetros, lo que lo sitúa en la categoría de modelos extremadamente ligeros. Su propuesta principal es la inferencia totalmente local: puede ejecutarse en una pestaña del navegador mediante transformers.js (con WebGPU o WASM) o en un solo hilo de CPU en Python, sin coste de servidor ni envío de datos a la nube.

El modelo se construye a partir de Yati v0.5 (otro TTS del mismo autor): se tomaron 1.281 clips limpios de Yati, se convirtieron una sola vez con ChatterboxVC a la voz `af_nicole`, se normalizó el volumen y se entrenaron la parte de texto, el decodificador y una etapa corta adversarial partiendo de los pesos de Yati v0.5. La arquitectura subyacente deriva de Paradee-8M (Sahil Mahendrakar), un modelo TTS de muy pequeño tamaño, adaptado aquí a una voz femenina concreta.

La relevancia de esta versión radica en dos correcciones concretas respecto a v0.1: se ha incorporado una ganancia de volumen del +25 % en la salida (de ~0,02–0,035 RMS a ~0,052–0,072 RMS) y se ha reducido la tasa de caída de F0 en tramos sonoros al 28 %. El autor advierte, no obstante, que la métrica objetiva UTMOS22-strong es inferior a la de v0.1, de modo que la mejora debe evaluarse por escucha. El modelo está pensado para despliegues de borde, aplicaciones web offline y prototipos de bajo coste en malayo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal derivada de Paradee-8M (base: sahilmahendrakar/Paradee-8M-v1.3); pesos en ONNX int8 |
| Parametros totales | 7,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero `onnx/model_quantized.onnx`) |
| Idiomas soportados | Bahasa Melayu (Malasia), código `ms` |
| Licencia | CC BY 4.0 (los ficheros `lexicon_e.json` derivan de Wiktionary y son CC BY-SA 4.0) |
| Formato de pesos | ONNX (modelo cuantizado int8); paquete Python `kecil_tts` 0.2.0 en `.whl` |
| Frecuencia de salida | 24 kHz mono, con ganancia de +25 % incorporada |
| Entradas | `input_ids` (int64 `[1,T]`) y `speed` (float32 `[1]`) |
| Tamano del fichero | 8,47 MB (int8) |
| Modelo base | sahilmahendrakar/Paradee-8M-v1.3 |

## Arquitectura y entrenamiento

El modelo es un TTS neuronal de muy pequeño tamano construido sobre Paradee-8M, con un frontal de texto, un decodificador y una etapa adversarial corta entrenada a partir de los pesos de Yati v0.5. El proceso de creación descrito por el autor es: 1.281 clips limpios de Yati v0.5 convertidos una sola vez con ChatterboxVC a la voz `af_nicole`, normalización de sonoridad y entrenamiento de las partes de texto y decodificador junto con la etapa adversarial. La salida es audio mono a 24 kHz con una ganancia de volumen de +25 % aplicada en el modelo para corregir la baja amplitud de v0.1.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (poco habituales en TTS). Sí se documenta que los datos derivan de clips de Yati v0.5 y que la conversión de voz se hizo con ChatterboxVC; el modelo base Paradee-8M procede de Sahil Mahendrakar. Entre los créditos figuran Kokoro-82M (hexgrad), Chatterbox Multilingual (Resemble AI), misaki, WikiPron, g2p-id, Tatoeba y Wikipedia en malayo, lo que sugiere el uso de recursos léxicos y de pronunciación para el componente de texto a fonemas.

## Capacidades

- Síntesis de voz a partir de texto en bahasa melayu (Malasia) con una voz femenina concreta (`af_nicole`).
- Salida de audio mono a 24 kHz con ganancia de volumen incorporada (+25 %).
- Control de velocidad mediante la entrada `speed` (float32).
- Inferencia totalmente local y offline: un único fichero ONNX de 8,47 MB.
- Ejecución en navegador mediante transformers.js con WebGPU o WASM, y en Python con onnxruntime en un solo hilo de CPU.
- Compatibilidad con el paquete Python `kecil_tts` (versión 0.2.0) y con el antiguo import `from suaradee import Suaradee` mediante shim de compatibilidad.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de texto en malayo en aplicaciones web offline: el modelo se carga como un ONNX de 8,47 MB en una pestaña del navegador con transformers.js y WebGPU, permitiendo locución de contenido sin backend ni coste de API.
- Asistentes de voz embebidos en dispositivos de borde: al ejecutarse en un solo hilo de CPU con onnxruntime, encaja en entornos con recursos limitados (Raspberry Pi, móviles, electrodomésticos) donde no cabe un TTS de mayor tamaño.
- Prototipado rápido de interfaces conversacionales en malayo: el paquete `kecil_tts` permite generar WAV con unas pocas líneas de Python, útil para validar flujos de voz antes de invertir en modelos mayores.
- Accesibilidad y lectura de pantalla: síntesis local de contenido textual para usuarios con discapacidad visual, sin dependencia de servicios en la nube y con privacidad por diseño (nada sale del dispositivo).
- Avisos y locuciones en aplicaciones móviles o kioscos: frases cortas y predecibles (saludos, instrucciones, confirmaciones) donde la latencia de un modelo de 7,9 M de parámetros es mínima.
- Generación de audio sintético para datasets o pruebas: creación de muestras de voz femenina en malayo para pruebas de ASR, aumentación de datos o demos, recordando que el autor exige declarar que la voz es sintética.
- Integración en pipelines de CI/CD para pruebas de regresión de audio: al ser un único fichero ONNX determinista y ligero, puede ejecutarse en contenedores para comparar salidas entre versiones.

## Benchmarks y rendimiento

El autor publica una evaluación objetiva con UTMOS22-strong a 16 kHz sobre un conjunto fijo de 80 frases (media / percentil 10):

| Modelo | UTMOS media / p10 |
|---|---|
| Chatterbox teacher (techo) | 3,553 / 3,162 |
| Yati v0.5 | 2,275 / 1,793 |
| Nicole v0.1 (anterior) | 2,180 / 1,765 |
| Nicole v0.2 (este modelo) | 1,939 / 1,514 |
| Firdaus v0.1 | 1,843 / 1,465 |

El propio autor señala que el UTMOS objetivo es inferior al de v0.1; la mejora de esta versión es de sonoridad (RMS de ~0,052–0,072 frente a ~0,02–0,035 de v0.1) y de caída de F0 en tramos sonoros (28 % frente al 33 % de la ejecución hermana con voz masculina). No se han publicado resultados de benchmarks estándar de texto (MMLU, HumanEval, GSM8K) porque el modelo es de síntesis de voz, no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es de 8,47 MB en int8 y está diseñado para CPU y navegador, por lo que no requiere GPU dedicada.
- GPU recomendadas: no se especifican; la ejecución en navegador puede acelerarse con WebGPU, y en Python se usa onnxruntime (CPU).
- Cabe en cualquier GPU de consumo y en CPU: el autor indica que funciona en un solo hilo de CPU en Python y en una pestaña del navegador.
- Opciones de despliegue: transformers.js (WebGPU o WASM) en navegador; onnxruntime en Python con el paquete `kecil_tts`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kecil-TTS Nicole v0.2 | 7,9 M | no disponible | ms | CC BY 4.0 | Hugging Face, ONNX, transformers.js |
| Yati v0.5 (mismo autor) | no disponible | no disponible | ms | no disponible en la información | Hugging Face (Suarify) |
| Firdaus v0.1 (mismo autor) | no disponible | no disponible | ms | no disponible en la información | Hugging Face |
| Paradee-8M v1.3 (base) | ~8 M (por nombre) | no disponible | no disponible | no disponible en la información | Hugging Face (sahilmahendrakar) |
| Chatterbox Multilingual (profesor) | no disponible | no disponible | multilingüe | no disponible en la información | Resemble AI |

La comparación se limita a los modelos citados en la información disponible; no se dispone de datos de parámetros, contexto ni licencia de las alternativas más allá de lo indicado.

## Limitaciones y advertencias

- Calidad objetiva limitada: UTMOS22-strong de 1,939 (media) y 1,514 (p10), por debajo de Yati v0.5 y de Nicole v0.1; el autor reconoce que la mejora es de volumen, no necesariamente de calidad percibida.
- Voz única y fija (`af_nicole`): no hay control de hablante ni variedad de voces.
- Idioma único: solo bahasa melayu (Malasia); no se documenta soporte de otros idiomas ni code-switching.
- Tasa de caída de F0 del 28 % en tramos sonoros, lo que puede producir cortes o irregularidades en la entonación.
- Es voz sintética: el autor pide declarar explícitamente que el audio es generado por IA al usarlo.
- Licencia CC BY 4.0 para código y pesos (requiere atribución); los ficheros `lexicon_e.json` son CC BY-SA 4.0 por derivar de Wiktionary, lo que impone condiciones de compartir igual para esos componentes.
- No se documentan sesgos específicos, pero al entrenarse sobre clips de una única voz y de un conjunto limitado, puede reproducir particularidades de ese material.
- Sin datos de latencia ni throughput publicados; conviene medir en el hardware objetivo antes de producción.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/kecil-tts-nicole-v0.2
- Modelo base Paradee-8M v1.3: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Yati v0.5 (origen de los datos): https://huggingface.co/Suarify/kecil-tts-yati-v0.5.0
