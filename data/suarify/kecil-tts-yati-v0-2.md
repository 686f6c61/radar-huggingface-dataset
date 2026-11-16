# Suarify/kecil-tts-yati-v0.2

## Resumen

Kecil-TTS Yati v0.2 es un modelo de síntesis de voz (text-to-speech) para bahasa Melayu (malayo de Malasia) desarrollado por Suarify. Se trata de un modelo extremadamente compacto: 7,9 millones de parámetros y un único archivo ONNX cuantizado a int8 de 8,46 MB, lo que permite ejecutarlo en una pestaña de navegador mediante transformers.js (WebGPU o WASM) o en un solo hilo de CPU en Python con onnxruntime, sin necesidad de PyTorch.

El modelo deriva de Paradee-8M-v1.3 de sahilmahendrakar, del que hereda arquitectura y receta de entrenamiento, y se ha especializado en malayo mediante un front-end fonémico basado en reglas y un conjunto de datos sintético generado con Chatterbox Multilingual. La versión 0.2 corrige el alineamiento fonémico del entrenamiento (alineamiento forzado a nivel de letra sobre 6.050 de 6.318 palabras) y reduce el error de caracteres medido con Whisper large-v3 a aproximadamente la mitad respecto a v0.1.

Su relevancia radica en la viabilidad de TTS neuronal en entornos con recursos mínimos: inferencia a unas 25 veces tiempo real en un hilo de CPU y unas 15 veces en WebGPU, con salida mono a 24 kHz. La contrapartida es una calidad acústica limitada (sonido apagado, sin control de emoción ni estilo) y un alcance restringido a frases cortas en malayo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTextToSpeech2Model (transformer TTS, arquitectura Paradee-8M) |
| Parametros totales | 7,9 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada `input_ids` de hasta 402 fonemas, con 0 al inicio y al final) |
| Tipos de cuantizacion | int8 (archivo `onnx/model_quantized.onnx`, 8,46 MB) |
| Idiomas soportados | Bahasa Melayu (Malasia), con palabras inglesas comunes del habla malasia |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), compatible con transformers.js; wheel Python `suaradee-0.2.0` |

Otros datos técnicos: salida de audio mono a 24 kHz; entradas `input_ids` (int64 `[1,T]`, ids de fonemas con vocabulario de 178 símbolos tomado de Kokoro-82M) y `speed` (float32 `[1]`); front-end G2P basado en reglas con léxico de 24.000 palabras para las vocales pepet y taling.

## Arquitectura y entrenamiento

El modelo emplea la arquitectura StyleTextToSpeech2Model en la variante Paradee-8M, un transformer de 7,9 M de parámetros que parte de los pesos de Paradee-8M-v1.3. El texto se convierte a fonemas mediante un front-end malayo basado en reglas (`suaradee/`, portado línea a línea a JavaScript en `js/`), que usa el vocabulario de 178 símbolos de Kokoro-82M y un léxico de 24.000 palabras para resolver las vocales pepet y taling.

El entrenamiento se realizó sobre datos sintéticos: aproximadamente 750 frases convertidas a voz con Chatterbox Multilingual (un modelo mayor) y normalizadas a una única voz; tras el recorte se conservaron unos 49 minutos de audio y se reservaron 60 frases para evaluación. La innovación clave de v0.2 es el alineamiento temporal de fonemas: en v0.1 la mitad de las fronteras fonémicas dentro de palabra tenían un error superior a un frame (25 ms) porque se estimaban por proporciones; en v0.2 se calculan mediante alineamiento forzado a nivel de letra sobre el audio de entrenamiento (6.050 de 6.318 palabras). El entrenamiento completo llevó menos de una hora en una única GPU T4. La exportación a ONNX incluye ajustes de compatibilidad con WebGPU (acumulador de fase en float32 en lugar de float64, límites de slice de 64 bits acotados y eliminación de una inversión de ruido innecesaria), sin alterar el audio resultante.

## Capacidades

- Síntesis de voz a partir de texto en bahasa Melayu, con salida mono a 24 kHz.
- Pronunciación de números, importes, fechas, horas y números de teléfono en malayo mediante un normalizador basado en reglas.
- Manejo de aproximadamente 430 palabras inglesas comunes integradas en el habla malasia.
- Control de velocidad mediante el parámetro de entrada `speed`.
- Ejecución en navegador (transformers.js 3.x con WebGPU o WASM) y en Python con onnxruntime, sin dependencia de PyTorch.
- Procesamiento de texto largo mediante troceado en límites de frase, con piezas de como máximo 400 fonemas.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento; es exclusivamente un modelo TTS.
- No dispone de control de emoción, estilo ni selección de voz: una única voz femenina sintética.

## Casos de uso

- Atención al cliente automatizada en malayo: el modelo está optimizado para frases de estilo call-center (citas, facturas, entregas), con un CER mediano del 4,8% en ese dominio, por lo que encaja en respuestas pregrabadas o generadas dinámicamente en IVR y asistentes telefónicos.
- Lectura de importes y datos numéricos: el normalizador basado en reglas pronuncia números, fechas, horas y teléfonos en malayo, con un CER mediano del 2,9% en el subconjunto de números y dinero; útil en sistemas de consulta de saldos o confirmación de pedidos.
- Síntesis en el navegador con privacidad: al ejecutarse vía transformers.js con WebGPU o WASM, el texto no abandona el dispositivo; adecuado para aplicaciones web de accesibilidad o lectura de contenido sin backend.
- Despliegue en dispositivos de recursos mínimos: con 8,46 MB en int8 y unas 25 veces tiempo real en un solo hilo de CPU, puede integrarse en Raspberry Pi, contenedores ligeros o funciones serverless sin GPU.
- Generación de avisos y notificaciones cortas: para mensajes de una o pocas frases (recordatorios, alertas de entrega, confirmaciones), donde el límite de 400 fonemas por pieza no supone un problema.
- Prototipado y pruebas de pipelines TTS: su licencia Apache 2.0 y su formato ONNX permiten usarlo como componente de prueba en sistemas de voz antes de invertir en modelos mayores, o como base para fine-tuning sobre Paradee-8M.
- Accesibilidad en aplicaciones malayas: lectura en voz alta de interfaces y contenido para usuarios con discapacidad visual, con la ventaja de ejecución local en el navegador.

## Benchmarks y rendimiento

La evaluación se realizó con Whisper large-v3 como reconocedor, comparando el audio generado con el texto de entrada mediante character error rate (CER, menor es mejor). El propio reconocedor comete alrededor de un 9% de errores sobre los clips de referencia, por lo que ningún modelo puntúa 0. Las frases de evaluación son retenidas pero provienen del mismo conjunto de prompts que las de entrenamiento (estilo similar, frases distintas).

| Conjunto de frases no vistas | n | CER mediano v0.1 | CER mediano v0.2 | v0.2 con CER ≤ 8% |
|---|---|---|---|---|
| Estilo call-center (citas, facturas, entregas) | 40 | 9,7% | 4,8% | 70% |
| Conjunto mixto retenido, global | 60 | 17% | 6,3% | 52% |
| — de estilo call-center | 23 | 12,5% | 2,9% | no disponible |
| — números y dinero | 12 | 21% | 2,9% | no disponible |
| — texto general | 17 | 17% | 12% | no disponible |
| — malayo con palabras inglesas | 6 | 17% | 18% | no disponible |

Rendimiento de inferencia declarado por el autor: aproximadamente 25 veces tiempo real en un hilo de CPU con onnxruntime; aproximadamente 15 veces en una pestaña de navegador con WebGPU (6 veces en la primera llamada). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el archivo ONNX int8 ocupa 8,46 MB y la inferencia en CPU es viable con onnxruntime.
- GPU recomendadas: cualquier GPU con soporte WebGPU para ejecución en navegador; el autor no especifica modelos concretos. El entrenamiento se realizó en una T4.
- Cabe en cualquier GPU de consumo y en CPU sin GPU; también en navegadores de escritorio y móviles compatibles con WebGPU o WASM.
- Opciones de despliegue: onnxruntime en Python (wheel `suaradee`), transformers.js 3.x en navegador o Node, y las demos incluidas (Space web y `examples/gradio_app.py` con Gradio).
- Latencia y throughput: unas 25 veces tiempo real en un hilo de CPU; unas 15 veces en WebGPU (6 veces en la primera llamada, por la compilación de shaders).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kecil-TTS Yati v0.2 | 7,9 M | hasta 402 fonemas | Malayo (con inglés común) | Apache 2.0 | ONNX int8 | 8,46 MB, ejecución en navegador y CPU |
| Paradee-8M-v1.3 | 8 M (aprox.) | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva Kecil-TTS Yati |
| Kokoro-82M | 82 M | no disponible | múltiples | no disponible | no disponible | Referencia del vocabulario fonémico de 178 símbolos usado por Kecil-TTS |
| Chatterbox Multilingual | no disponible | no disponible | multilingüe | no disponible | no disponible | Usado por el autor para generar el audio sintético de entrenamiento |

Los datos de Paradee-8M-v1.3, Kokoro-82M y Chatterbox Multilingual no están detallados en la información disponible; la comparación se limita a su papel en la cadena de construcción del modelo.

## Limitaciones y advertencias

- Sonido apagado: el audio tiene aproximadamente un 30% menos de energía por encima de 4 kHz que el habla de entrenamiento y los armónicos superiores están difuminados (cualidad "damp" o ligeramente phasey). El autor atribuye la causa al entrenamiento del decodificador y confirma que no se ha corregido respecto a v0.1.
- Punto débil en palabras inglesas: las frases que mezclan malayo e inglés obtienen un CER mediano del 18%; solo se manejan palabras inglesas de una lista de unas 430 comunes.
- Texto general (estilo Wikipedia, nombres propios, topónimos) tiene un CER mediano del 12%.
- Una única voz femenina sintética, sin control de emoción ni de estilo.
- Diseñado para frases cortas: el texto largo se trocea en límites de frase en piezas de como máximo 400 fonemas.
- Las cifras de evaluación provienen de frases retenidas del mismo conjunto de prompts que el entrenamiento; el texto libre de otras fuentes será más difícil de lo que sugieren esos números.
- Riesgo de alucinación acústica: al ser un modelo generativo de audio, puede producir pronunciaciones incorrectas o artefactos en entradas fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el autor solicita indicar explícitamente que la voz es sintética.
- Es un modelo de 7,9 M de parámetros entrenado con datos sintéticos de un único hablante; no debe esperarse naturalidad ni cobertura lingüística propias de modelos TTS de mayor escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/kecil-tts-yati-v0.2
- Versión anterior v0.1: https://huggingface.co/Suarify/kecil-tts-yati-v0.1
- Demo web (Space): https://huggingface.co/spaces/Suarify/suaradee-web
- Modelo base Paradee-8M-v1.3: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
