# zugetor/Lyra-Car-Assistant-enth

## Resumen

Lyra Car Assistant (Thai + English) es un modelo de clasificación de intenciones especializado en comandos de voz para el habitáculo de un vehículo, publicado por el usuario zugetor en Hugging Face. Se construye mediante un fine-tuning del modelo base convaiinnovations/laya-multilingual, que a su vez combina el encoder mmBERT-base con la cabeza de decisión de Laya. El resultado es un clasificador que, dada una frase como "เปิดแอร์ 23 องศา" o "Open the tailgate", devuelve una acción estructurada sobre un control concreto del coche (climatización, ventanillas, portón trasero, techo solar, multimedia, etc.).

La particularidad técnica del modelo es que Laya no genera texto libre: puntúa las opciones de una pregunta en un único forward pass, de modo que no puede inventar controles que no estén en la lista predefinida. El autor redujo el vocabulario del tokenizador Gemma BPE de 256.000 a 104.761 tokens (conservando tailandés, inglés, caracteres individuales y fallback de bytes), con lo que el modelo pasa de 322 M a 206 M de parámetros. Posteriormente se exportó a ONNX con pesos int8 para ejecutarse íntegramente en el dispositivo o en una pestaña del navegador mediante ONNX Runtime Web, sin servidor intermedio.

El modelo está pensado para asistentes de voz embebidos en automoción con requisitos estrictos de latencia, privacidad y funcionamiento offline. Su licencia Apache 2.0 y su reducido tamaño (~211 MB de pesos) lo hacen desplegable en hardware modesto, aunque su alcance funcional está deliberadamente acotado a un conjunto cerrado de comandos de vehículo en tailandés e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (mmBERT-base) con cabeza de decisión Laya; clasificación por puntuación de opciones en un forward pass |
| Parametros totales | 206 M (tras poda de vocabulario; original 322 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Int8 (MatMulNBits, 8 bits, bloque 128; embedding int8 por fila) para exportación ONNX |
| Idiomas soportados | Tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 18): `laya.onnx` (~1 MB de grafo) + `laya.onnx.data` (~211 MB de pesos int8); tokenizador Gemma BPE podado a 104.761 tokens |

## Arquitectura y entrenamiento

El modelo parte de convaiinnovations/laya-multilingual, que combina el encoder mmBERT-base con la cabeza de decisión de Laya. Laya no es un modelo generativo: formula cada comando como una pregunta de opción múltiple y puntúa cada opción en un solo forward pass, devolviendo la etiqueta con mayor puntuación. El pipeline completo realiza como máximo dos llamadas al modelo por comando: primero identifica el control entre 14 opciones y después resuelve el payload de ese control (por ejemplo, el valor de temperatura o el modo del ventilador). Los números de temperatura y velocidad de ventilador se extraen mediante una regla determinista, no por el modelo.

El proceso de construcción consta de tres fases. Primero, una poda de vocabulario: se conservan todos los tokens con caracteres tailandeses, los tokens ingleses que aparecen al menos 20 veces en wikitext-103, caracteres individuales, fallback de bytes y las piezas de merge necesarias, resultando en 104.761 de 256.000 tokens y una reducción de 322 M a 206 M de parámetros; según el autor, las 11.327 cadenas numéricas y las 47.622 secuencias puras en tailandés de Wikipedia tokenizan igual que antes, al igual que el 99,8 % de las palabras inglesas de wikitext-103 test. Segundo, un fine-tuning con 3.708 frases sintéticas (6.828 preguntas), mitad en tailandés y mitad en inglés, generadas a partir de un banco de frases con variaciones de verbos, cortesía, números y sinónimos de objetos; se añadieron 300 frases para enseñar la etiqueta `none`. El entrenamiento usó `laya.train.finetune` durante 4 épocas con opciones barajadas en cada época y 400 elementos reservados para calibrar la temperatura, con una duración aproximada de una hora en Apple MPS. Tercero, la exportación a ONNX opset 18 con encoder y cabeza juntos, pesos int8 y un informe de deriva (`export_report.json`) frente a la implementación en PyTorch.

## Capacidades

- Clasificación de intenciones sobre un conjunto cerrado de 14 controles de vehículo: modo de climatización, temperatura (17–33 °C o warmer/cooler), ventilador (0–7 o up/down), ventanillas, portón trasero, techo solar, parasol, ventilación de asientos (conductor y pasajero), luces diurnas, cargador inalámbrico, multimedia y apertura de apps (CarPlay, Android Auto).
- Detección de comandos fuera de dominio mediante la etiqueta `none` (por ejemplo, "Call mom" o "lock the doors").
- Comprensión bilingüe tailandés-inglés en la misma sesión.
- Extracción de valores numéricos (temperatura y velocidad de ventilador) mediante una regla determinista complementaria al modelo.
- Ejecución offline en dispositivo y en navegador mediante ONNX Runtime Web 1.30.0.
- No soporta generación de texto libre, tool calling genérico, razonamiento multi-paso abierto, visión ni audio; su función es exclusivamente la clasificación de intenciones de voz ya transcritas.

## Casos de uso

- Asistente de voz embebido en el vehículo: el modelo recibe la transcripción del reconocimiento de voz y devuelve la acción estructurada (`climate/temperature = 23`, `tailgate = OPEN`), con dos llamadas como máximo por comando, lo que encaja en los presupuestos de latencia de un HMI de automoción.
- Control por voz en el navegador del vehículo o en una web de demostración: el runtime `lyra.js` carga los ficheros desde Hugging Face y ejecuta el modelo en la propia pestaña con ONNX Runtime Web, sin enviar audio ni transcripciones a un servidor.
- Sistemas de infoentretenimiento con requisitos de privacidad: al ejecutarse completamente offline en el dispositivo, las frases del ocupante no salen del vehículo.
- Prototipado rápido de interfaces de voz para automoción: los ficheros `car_questions.json` y `rl_agent_config.json` permiten adaptar el conjunto de controles y sus payloads sin reentrenar el encoder.
- Validación de pipelines de reconocimiento de voz en tailandés e inglés: el modelo sirve como clasificador de referencia para medir la precisión extremo a extremo de un ASR integrado en el vehículo.
- Despliegue en hardware de bajo consumo: con ~211 MB de pesos int8, puede integrarse en unidades de control con recursos limitados o en navegadores de gama media sin GPU dedicada.
- Filtrado de falsos positivos del asistente: la etiqueta `none` permite descartar comandos que no corresponden a ningún control del vehículo antes de ejecutar una acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas del proceso de poda de vocabulario (11.327/11.327 cadenas numéricas y 47.622/47.622 secuencias tailandesas tokenizadas de forma idéntica; 99,8 % de palabras inglesas de wikitext-103 test) y remite a `finetune_summary.json` y `export_report.json` para los informes de entrenamiento, calibración y deriva del export ONNX, sin cifras de precisión publicadas en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con pesos int8 de ~211 MB, el modelo cabe holgadamente en cualquier GPU consumer con 2 GB o más de memoria.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada para este modelo; también funciona en CPU y en Apple Silicon vía MPS (el entrenamiento se realizó en Apple MPS en aproximadamente una hora).
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales e incluso en iGPU y en el navegador mediante ONNX Runtime Web (WebGPU/WASM según configuración).
- Opciones de despliegue: ONNX Runtime (Python, backend `onnx` de Laya), ONNX Runtime Web 1.30.0 en navegador (`web_browser/lyra.js`), y el runtime Python `runtime.py` del repositorio de GitHub con Python 3.11–3.14. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no tendrían sentido para un clasificador de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada; el diseño limita a dos llamadas al modelo por comando, lo que acota la latencia por interacción.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de alternativas directamente comparables en la información proporcionada. Como referencia estructural, se incluye el modelo base del que deriva:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Lyra Car Assistant (este modelo) | 206 M (podado) | No disponible | th, en | Apache 2.0 | Clasificación de intenciones de vehículo, ONNX int8 |
| convaiinnovations/laya-multilingual (base) | 322 M (antes de poda) | No disponible | Multilingüe | No disponible en la información | Clasificación por puntuación de opciones |
| Alternativas de clasificación de intenciones para automoción | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Alcance cerrado: solo reconoce los 14 controles y sus payloads definidos en `car_questions.json`; cualquier comando fuera de esa lista debe devolver `none`, y no puede ejecutar acciones no contempladas.
- Idiomas limitados a tailandés e inglés; otros alfabetos caen en el fallback de bytes y no se garantiza su comportamiento.
- Entrenamiento con datos sintéticos (3.708 frases generadas desde un banco de frases), lo que puede no cubrir la variabilidad real de acentos, dialectos, ruido de cabina o formulaciones espontáneas de los ocupantes.
- Riesgo de confusión entre controles con vocabulario solapado (por ejemplo, sinónimos de portón trasero como tailgate, trunk, boot o liftgate) si la frase es ambigua; el autor no publica tasas de error por control.
- La extracción de números de temperatura y velocidad de ventilador depende de una regla determinista, no del modelo, por lo que expresiones numéricas atípicas pueden no resolverse correctamente.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el modelo base convaiinnovations/laya-multilingual debe verificarse por separado en cuanto a sus términos.
- Para cargar el modelo en Python es necesario usar `local_dir` en `snapshot_download`, ya que el caché por defecto de Hugging Face usa enlaces simbólicos y ONNX Runtime rechaza cargar `laya.onnx.data` desde otra carpeta.
- No se han publicado métricas de precisión, latencia ni robustez frente a ruido en la información disponible, por lo que una evaluación en producción requeriría validación propia con el conjunto de evaluación del repositorio de GitHub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zugetor/Lyra-Car-Assistant-enth
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Repositorio GitHub (código, datos de entrenamiento y conjuntos de evaluación): https://github.com/zugetor/Lyra-Car-Assistant
- Runtime de navegador: https://github.com/zugetor/Lyra-Car-Assistant/blob/master/web_browser/lyra.js
- Demo en navegador: https://zugetor.github.io/Lyra-Car-Assistant/
