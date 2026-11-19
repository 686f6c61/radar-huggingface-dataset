# vikeeai/Kokoro-82M-v1.0-ONNX

## Resumen

Kokoro-82M-v1.0-ONNX es una conversión al formato ONNX del modelo de síntesis de voz Kokoro-82M, desarrollado originalmente por hexgrad. Se trata de un modelo text-to-speech de 82 millones de parámetros que convierte texto en audio, y esta versión concreta está empaquetada para su uso con la librería `transformers.js`, lo que permite ejecutar inferencia TTS directamente en JavaScript, tanto en Node.js como en el navegador.

El modelo resuelve el problema de la síntesis de voz de calidad en entornos con recursos limitados: con solo 82M de parámetros, ofrece una alternativa ligera frente a sistemas TTS de mayor tamaño, manteniendo una calidad de audio competitiva según la model card del autor. Su empaquetado en ONNX con múltiples cuantizaciones (fp32, fp16, q8, q4) lo hace adecuado para despliegues en el edge y aplicaciones web sin dependencia de infraestructura GPU dedicada.

Esta ficha se centra en la variante ONNX publicada por vikeeai, que reproduce la arquitectura y los pesos del modelo base `hexgrad/Kokoro-82M` bajo licencia Apache 2.0. El repositorio ocupa aproximadamente 0,1 GB y está orientado exclusivamente al idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS text-to-audio; arquitectura interna no detallada en la model card) |
| Parametros totales | 82 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (ventana de entrada de fonemas; se recomienda dejar espacio para tokens de padding, maximo 510 tokens utiles) |
| Tipos de cuantizacion | fp32, fp16, q8, q4, q4f16 (y variantes ONNX: model.onnx, model_fp16.onnx, model_quantized.onnx, model_q8f16.onnx, model_uint8.onnx, model_uint8f16.onnx, model_q4.onnx, model_q4f16.onnx) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (modelos .onnx con variantes de cuantizacion) y ficheros de estilo de voz .bin (vectores float32 de 256 dimensiones) |

## Arquitectura y entrenamiento

No se detalla en la model card proporcionada la arquitectura interna del modelo (tipo de red, composicion de capas, mecanismo de atencion o decoder). Se sabe que es un modelo text-to-speech que recibe como entrada identificadores de fonemas (token ids derivados de texto mediante el fonemizador Misaki) y un vector de estilo (`ref_s`, de forma `(1, 256)`) que condiciona la voz, y produce una forma de onda de audio muestreada a 24 kHz. La longitud de contexto de entrada es de 512 tokens, con tokens de padding (id 0) al inicio y al final.

Tampoco se especifican en la informacion disponible los datos de entrenamiento (numero de tokens, composicion del dataset, horas de audio), ni si se emplearon tecnicas de RLHF, DPO o fine-tuning por preferencias. La model card del autor se limita a describir el uso, las voces disponibles y las cuantizaciones. Cualquier dato sobre innovaciones tecnicas de entrenamiento debe considerarse no disponible.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en ingles, con salida de audio a 24 kHz.
- Control de velocidad mediante el parametro `speed` (vector float32) en la inferencia.
- Seleccion de voz entre un conjunto predefinido de hablantes (voces americanas femeninas y masculinas: af_heart, af_alloy, af_aoede, af_bella, af_jessica, af_kore, af_nicole, af_nova, af_river, af_sarah, af_sky, am_adam, am_echo, am_eric, am_fenrir, entre otras).
- Condicionamiento de estilo por voz mediante vectores de estilo (`ref_s`) derivados de la longitud de los tokens de entrada.
- Ejecucion en JavaScript mediante `kokoro-js` y en Python mediante `onnxruntime`.
- Soporte de multiples niveles de cuantizacion para ajustar calidad, tamano y velocidad de inferencia.
- Capacidades multilingues: no disponibles (solo ingles).
- Tool calling, agentes, razonamiento, vision o audio de entrada: no aplica (es un modelo TTS puro).

## Casos de uso

- Lectura por voz de articulos y contenido web en el navegador: al ejecutarse con `transformers.js` y ONNX, el modelo puede integrarse en una pagina web para leer texto en ingles sin enviar datos a un servidor, usando la cuantizacion q8 o q4 para reducir el peso descargado.
- Asistentes de voz en aplicaciones moviles o de escritorio: con 82M de parametros y cuantizacion q4, el modelo puede empaquetarse en una app y generar respuestas habladas localmente, sin conexion y con baja latencia.
- Accesibilidad para personas con discapacidad visual: conversion de texto a voz en lectores de pantalla o herramientas de accesibilidad, con seleccion de voz y control de velocidad para adaptarse a las preferencias del usuario.
- Generacion de audiolibros y podcast automatizados: el modelo permite sintetizar textos largos por fragmentos (respetando el limite de 510 tokens utiles por pasada) y concatenar el audio resultante, eligiendo voces distintas por seccion.
- Prototipado rapido de interfaces conversacionales: en entornos de desarrollo frontend, `kokoro-js` permite incorporar TTS en demos y pruebas de concepto sin infraestructura de servidor ni coste de API.
- Sistemas de notificaciones y avisos hablados en ingles: integracion en dispositivos IoT o aplicaciones de escritorio que necesiten anunciar eventos mediante voz, con un modelo ligero que cabe en el repositorio de 0,1 GB.
- Generacion de voces para videojuegos o contenido multimedia en ingles: uso de las distintas voces predefinidas para dar voz a personajes o narraciones en prototipos y producciones de bajo presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del modelo (82M de parametros), la huella es muy reducida. En fp32, los pesos ocupan aproximadamente 328 MB; en q8, en torno a 82 MB; en q4, alrededor de 41 MB (estimaciones teoricas a partir del numero de parametros, no confirmadas en la model card).
- GPU recomendadas: no especificadas. El modelo esta disenado para ejecucion en CPU mediante ONNX Runtime y para entornos JavaScript, por lo que no requiere GPU dedicada.
- Cabe en GPU consumer: si, con amplio margen; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es mas que suficiente, y probablemente tambien GPUs integradas.
- Opciones de despliegue: `transformers.js` con `kokoro-js` (JavaScript/Node.js/navegador), ONNX Runtime en Python (`onnxruntime.InferenceSession`), y cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Kokoro-82M-v1.0-ONNX (esta ficha) | 82M | 512 tokens de fonemas | Ingles | Apache 2.0 | ONNX | Hugging Face, transformers.js |
| hexgrad/Kokoro-82M (modelo base) | 82M | 512 tokens de fonemas | Ingles | Apache 2.0 | safetensors (formato original) | Hugging Face |
| onnx-community/Kokoro-82M-ONNX | 82M | 512 tokens de fonemas | Ingles | Apache 2.0 | ONNX | Hugging Face, transformers.js |

No se dispone en la informacion proporcionada de datos de rendimiento (benchmarks) que permitan comparar la calidad de audio o la latencia frente a otros modelos TTS. La comparativa se limita a parametros, licencia, formato y disponibilidad.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues ni de otros idiomas.
- La entrada esta limitada a 512 tokens de fonemas (510 utiles tras el padding), por lo que textos largos deben dividirse en fragmentos y concatenarse.
- No se detallan en la model card los sesgos conocidos del modelo ni la composicion del dataset de entrenamiento, lo que impide evaluar sesgos de genero, acento o procedencia de las voces.
- Riesgo de alucinacion o artefactos de audio: no documentado en la informacion disponible; como todo modelo TTS, puede producir pronunciaciones incorrectas o prosodia imperfecta en textos complejos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base `hexgrad/Kokoro-82M` y de las voces utilizadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-19); se trata de una publicacion reciente y sin validacion comunitaria.
- La model card del autor incluye ejemplos de uso que apuntan a `onnx-community/Kokoro-82M-ONNX` en lugar de a este repositorio, lo que puede generar confusion sobre el identificador correcto a cargar.
- El rendimiento real (latencia, calidad de audio) depende de la cuantizacion elegida y del hardware; no se proporcionan mediciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vikeeai/Kokoro-82M-v1.0-ONNX
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio ONNX de referencia citado en la model card: https://huggingface.co/onnx-community/Kokoro-82M-ONNX
- Libreria kokoro-js en NPM: https://npmjs.com/package/kokoro-js
- Fonemizador Misaki: https://github.com/hexgrad/misaki
- Configuracion del modelo base (mapeo de fonemas a ids): https://huggingface.co/hexgrad/Kokoro-82M/blob/785407d1adfa7ae8fbef8ffd85f34ca127da3039/config.json
