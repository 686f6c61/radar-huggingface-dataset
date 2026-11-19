# Suarify/kecil-tts-yati-v0.5.0

## Resumen

Kecil-TTS Yati v0.5.0 es un modelo de síntesis de voz (text-to-speech) en bahasa melayu (malasio) con voz femenina, desarrollado por Suarify. Se trata de un modelo extremadamente pequeno: 7,9 millones de parametros y un unico archivo ONNX de 8,47 MB con pesos cuantizados a int8. Su proposito es ofrecer TTS de calidad razonable para malayo ejecutable en el navegador (transformers.js con WebGPU o WASM) o en un solo hilo de CPU en Python, sin servidor ni API y sin salida de datos del dispositivo.

La version v0.5.0 parte de Yati v0.4.1 y solo modifica el decodificador, que ha sido afinado de forma adversarial (warm-up de discriminador y etapa GAN en fp32). El lado del texto, la arquitectura del decodificador, la receta de exportacion y el tamano del archivo no cambian respecto a la version anterior. La relevancia actual reside en su perfil de despliegue: inferencia local, offline y en el cliente, con licencia Apache-2.0, lo que lo hace adecuado para aplicaciones web y embebidas con requisitos estrictos de privacidad y coste.

El modelo base es Paradee-8M-v1.3 de Sahil Mahendrakar. La salida es audio mono a 24 kHz y la entrada son `input_ids` (int64 `[1,T]`) y un parametro `speed` (float32 `[1]`). No se han publicado datos sobre el numero de tokens de entrenamiento ni sobre la composicion exacta del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS derivado de Paradee-8M-v1.3; decodificador afinado adversarialmente) |
| Parametros totales | 7,9 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (pesos del archivo ONNX publicado) |
| Idiomas soportados | Bahasa Melayu (Malasia), con palabras inglesas de uso comun en el habla malasia |
| Licencia | Apache-2.0 (los lexicos `lexicon_e.json` derivan de Wiktionary y son CC BY-SA 4.0) |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`, 8,47 MB) |

## Arquitectura y entrenamiento

El modelo es una adaptacion de Paradee-8M-v1.3 (7,9 M de parametros) orientada a TTS en malayo. La unica diferencia de v0.5.0 respecto a v0.4.1 es el decodificador, que se ha afinado de forma adversarial mediante un warm-up de discriminador seguido de una etapa GAN en fp32 (fase 3 del documento REVIEW.md del repositorio de entrenamiento). El lado del texto, la arquitectura del decodificador, la receta de exportacion FIX H y el tamano del archivo permanecen sin cambios.

El autor documenta que una fase 1 previa (modelo de F0/UV en el lado del texto) y una fase 2 (fine-tune del decodificador con GTA) se probaron y no se publicaron porque no mejoraron las metricas ni el resultado de escucha. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO. La exportacion a ONNX esta parcheada para WebGPU, sin operaciones en float64.

## Capacidades

- Sintesis de voz a partir de texto en bahasa melayu con voz femenina.
- Salida de audio mono a 24 kHz.
- Control de velocidad mediante el parametro de entrada `speed` (float32).
- Manejo de palabras inglesas de uso comun en el habla malasia (code-switching limitado).
- Ejecucion en navegador mediante transformers.js con WebGPU o WASM.
- Ejecucion en Python con onnxruntime en un solo hilo de CPU.
- Inferencia completamente offline: un unico archivo, sin llamadas a servidor ni API.
- No dispone de tool calling, function calling, razonamiento multi-paso, vision ni audio de entrada.

## Casos de uso

- Lectura de contenido web en malayo dentro del navegador: el modelo se ejecuta con transformers.js y WebGPU sobre el propio dispositivo, de modo que una aplicacion puede leer articulos o notificaciones en voz alta sin enviar texto a un servidor.
- Asistentes de voz embebidos en dispositivos de bajos recursos: con 7,9 M de parametros y 8,47 MB en int8, cabe en entornos con memoria muy limitada y puede ejecutarse en un solo hilo de CPU.
- Accesibilidad para personas con discapacidad visual en aplicaciones malayas: sintesis local de interfaz y contenido sin depender de conectividad.
- Prototipado rapido de interfaces de voz: el paquete Python `suaradee` permite generar audio con unas pocas lineas para validar flujos de producto antes de invertir en un TTS mayor.
- Aplicaciones con requisitos estrictos de privacidad: al no salir los datos del dispositivo, es apto para entornos donde el texto del usuario no puede transmitirse a terceros.
- Aprendizaje de pronunciacion y materiales educativos en malayo: generacion de clips de audio con velocidad ajustable mediante el parametro `speed`.
- Demos y pruebas automatizadas de pipelines TTS: su tamano reducido permite incluirlo en contenedores ligeros y en tests de integracion sin coste de infraestructura.

## Benchmarks y rendimiento

El autor publica resultados de UTMOS22-strong a 16 kHz sobre un conjunto fijo de 80 frases (40 generales, 20 con code-switching y 20 con numeros), con media y percentil 10:

| Modelo | UTMOS media | UTMOS p10 |
|---|---|---|
| Chatterbox teacher clips (techo) | 3,553 | 3,162 |
| Yati v0.5 (este modelo) | 2,275 | 1,793 |
| Yati v0.4.1 | 2,158 | 1,738 |
| Nicole v0.1 | no puntuado | no puntuado |
| Michael v0.3.1 | 1,813 | 1,445 |

La mejora frente a v0.4.1 es de +0,12 UTMOS. El autor indica que en su prueba de escucha ciega con igualacion de sonoridad la diferencia no fue claramente perceptible. La brecha frente al profesor Chatterbox sigue siendo grande (aproximadamente 1,28 UTMOS) y el problema de voicing de F0 documentado en REVIEW.md (aproximadamente un 18 % de caidas de voz) no cambia en esta version porque no se ha modificado el lado del texto. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el archivo ONNX ocupa 8,47 MB en int8 y el modelo tiene 7,9 M de parametros.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. En navegador aprovecha WebGPU cuando esta disponible.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, integradas) y en CPU de un solo hilo.
- Opciones de despliegue: onnxruntime en Python mediante el paquete `suaradee`, y transformers.js en navegador con WebGPU o WASM.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- El autor indica coste de inferencia de RM 0 (sin servidor ni API) y funcionamiento offline con un unico archivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | UTMOS media (conjunto del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yati v0.5.0 | 7,9 M | no disponible | 2,275 | Apache-2.0 | ONNX en Hugging Face |
| Yati v0.4.1 | 7,9 M | no disponible | 2,158 | Apache-2.0 | version anterior del mismo autor |
| Michael v0.3.1 | no disponible | no disponible | 1,813 | no disponible | modelo del mismo ecosistema |
| Nicole v0.1 | no disponible | no disponible | no puntuado | no disponible | modelo del mismo ecosistema |
| Chatterbox Multilingual (profesor) | no disponible | no disponible | 3,553 | no disponible | citado como fuente de clips |

No se dispone de datos de parametros, contexto ni licencia de los modelos comparables distintos de los publicados por el autor. La comparacion se limita a las metricas UTMOS del conjunto de evaluacion del propio autor, por lo que no es una comparacion independiente.

## Limitaciones y advertencias

- La calidad es claramente inferior a la del profesor Chatterbox: aproximadamente 1,28 UTMOS de brecha en la metrica del autor.
- Problema de voicing de F0 sin resolver: aproximadamente un 18 % de caidas de voz segun REVIEW.md, sin cambios en esta version.
- La mejora frente a v0.4.1 (+0,12 UTMOS) no fue claramente perceptible en la prueba de escucha del autor.
- Cobertura linguistica limitada a bahasa melayu de Malasia, con solo palabras inglesas comunes; no es un modelo multilingue.
- Riesgo de pronunciacion incorrecta en numeros, siglas y texto fuera del dominio de entrenamiento.
- Es voz sintetica: el autor pide indicarlo explicitamente cuando se utilice.
- Restricciones de licencia: el codigo y los pesos son Apache-2.0, pero `kecil_tts/lexicon_e.json` y `js/g2p/lexicon_e.json` derivan de datos de Wiktionary y estan bajo CC BY-SA 4.0, lo que impone obligaciones de atribucion y comparticion para esos lexicos.
- No se han publicado datos sobre sesgos, composicion del dataset ni evaluacion independiente; el modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta.
- No apto para tareas de razonamiento, codigo, vision ni agentes: es exclusivamente un modelo TTS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/kecil-tts-yati-v0.5.0
- Modelo base Paradee-8M-v1.3: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Paquete Python `suaradee` (wheel): https://huggingface.co/Suarify/kecil-tts-yati-v0.5.0/resolve/main/dist/suaradee-0.5.0-py3-none-any.whl
- Repositorio de entrenamiento con REVIEW.md y STATUS.md: no disponible en la informacion proporcionada
- Kokoro-82M (creditos): https://huggingface.co/hexgrad/Kokoro-82M
- Chatterbox Multilingual (creditos): https://huggingface.co/ResembleAI/chatterbox
