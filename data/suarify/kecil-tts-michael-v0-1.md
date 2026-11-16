# Suarify/kecil-tts-michael-v0.1

## Resumen

Kecil-TTS Michael v0.1 es un modelo de síntesis de voz (text-to-speech) para bahasa Melayu (malayo de Malasia) con voz masculina, desarrollado por Suarify. Se trata de un modelo extremadamente compacto: 7,9 millones de parámetros y un único archivo ONNX de 8,46 MB con pesos en int8, lo que permite ejecutarlo dentro de una pestaña de navegador mediante transformers.js (WebGPU o WASM) o en un solo hilo de CPU en Python. Es la variante masculina del modelo Kecil-TTS Yati v0.2 (voz femenina), con el mismo tamano, código y front end de procesamiento del malayo.

El modelo parte de la arquitectura Paradee-8M-v1.3 de Sahil Mahendrakar y se ha adaptado al malayo mediante un front end basado en reglas que convierte texto en fonemas dentro del vocabulario de 178 símbolos de Kokoro-82M. El entrenamiento se realizó sobre aproximadamente 49 minutos de voz sintética malaya generada con Chatterbox Multilingual y convertida dos veces de voz, en menos de una hora sobre una única GPU T4.

Su relevancia radica en la combinación de tamano mínimo, licencia Apache-2.0 y despliegue en navegador sin infraestructura de servidor, lo que lo hace útil para prototipos de accesibilidad, interfaces web y aplicaciones de voz en malayo donde el presupuesto de computo es prácticamente nulo. No obstante, el propio autor advierte que es una primera versión con mayor tasa de error que el modelo femenino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paradee-8M (red neuronal ligera para TTS, exportada a ONNX opset 17) |
| Parametros totales | 7,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de texto por frases; `input_ids` de forma `[1,T]`) |
| Tipos de cuantizacion | int8 (pesos cuantizados en `onnx/model_quantized.onnx`) |
| Idiomas soportados | Bahasa Melayu (Malasia), con palabras inglesas de uso comun en el habla malasia |
| Licencia | Apache-2.0 (el lexico `lexicon_e.json` es CC BY-SA 4.0) |
| Formato de pesos | ONNX (un unico archivo de 8,46 MB); front end en Python y JavaScript |
| Frecuencia de salida | 24 kHz mono |
| Entradas | `input_ids` (int64 `[1,T]`) y `speed` (float32 `[1]`) |
| Vocabulario fonetico | 178 símbolos (el de Kokoro-82M) |
| Libreria | transformers.js |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Paradee-8M, una red de 8 millones de parámetros disenada para síntesis de voz ligera, partiendo de la fila de voz masculina estadounidense del modelo original. El texto malayo se procesa mediante un front end basado en reglas (`suaradee/`, portado línea por línea a `js/`) que transcribe el texto a fonemas dentro del vocabulario de 178 símbolos de Kokoro-82M, incluyendo un lexico de palabras inglesas derivado de datos de Wiktionary.

El entrenamiento se realizó sobre aproximadamente 750 frases malayas (unos 49 minutos de audio) sintetizadas con Chatterbox Multilingual y convertidas a la voz masculina mediante conversión de voz, usando como referencia una lectura de Kokoro `am_michael`. El audio posterior a la última palabra alineada se recorta. El proceso completo requirió menos de una hora en una GPU T4. Los pesos se exportaron a ONNX (opset 17) con cuantizacion int8 y se verificó su compatibilidad con WebGPU.

## Capacidades

- Síntesis de voz a partir de texto en bahasa Melayu, con salida mono a 24 kHz.
- Voz masculina única, cercana a la voz `am_michael` de Kokoro, sin control de emoción ni de estilo.
- Manejo de palabras inglesas comunes en el habla malasia (code-switching limitado).
- Control de velocidad mediante la entrada `speed` (float32).
- Ejecución en navegador con transformers.js (WebGPU o WASM) y en Python sobre CPU.
- Soporte de streaming en los front ends de Python y JavaScript.
- División automática de texto largo en frases.
- No dispone de tool calling, capacidades de agente, visión ni audio de entrada.

## Casos de uso

- Lectura por voz en aplicaciones web: el modelo se ejecuta en una pestaña mediante transformers.js con WebGPU o WASM, sin necesidad de backend, para leer contenido en malayo directamente en el cliente.
- Prototipado rápido de asistentes de voz en malayo: con 8,46 MB y una instalación vía `pip`, permite validar flujos de conversación y pronunciación antes de invertir en modelos mayores.
- Accesibilidad en sitios y aplicaciones: conversión de texto a voz malayo para usuarios con discapacidad visual o dificultades de lectura, aprovechando el bajo coste de computo.
- Sistemas embebidos y de borde: el reducido tamano y la ejecución en un solo hilo de CPU lo hacen viable en dispositivos con recursos limitados.
- Generación de avisos y mensajes cortos: anuncios, notificaciones y mensajes de interfaz en malayo, formato de frase corta para el que el modelo está disenado.
- Pruebas de integración de TTS en pipelines de CI: su huella mínima permite incluirlo en tests automatizados de audio sin GPU dedicada.
- Investigación y experimentación con TTS de bajo coste: base para fine-tuning o comparación de técnicas de cuantizacion y despliegue en navegador.

## Benchmarks y rendimiento

La calidad se midió reproduciendo el habla del modelo a Whisper large-v3 y comparando con el texto de entrada mediante tasa de error de caracteres (CER; menor es mejor).

| Conjunto de evaluacion | n | CER mediana | CER media acotada | Proporcion <= 8% |
|---|---|---|---|---|
| Frases de test no vistas (cada 5.a fila de 200) | 40 | 5,7% | 9,3% | 55% |
| Frases reservadas del conjunto de entrenamiento | 60 | 10,0% | 15,6% | 38% |

Desglose por categoría en el conjunto de test:

| Categoria | n | CER mediana |
|---|---|---|
| codeswitch | 4 | 6,9% |
| conversational | 12 | 11,9% |
| general | 14 | 10,0% |
| numbers | 6 | 1,1% |
| question | 2 | 0,0% |
| short | 2 | 11,9% |

Como referencia, el audio con el que se entrenó el modelo obtiene un 4,3% de CER mediana en los clips reservados.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el archivo ONNX int8 ocupa 8,46 MB y puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU; funciona en cualquier CPU moderna. En navegador, WebGPU acelera la inferencia si está disponible.
- Cabe en cualquier GPU de consumo, incluida la gama integrada; también en un solo hilo de CPU.
- Opciones de despliegue: ONNX Runtime (Python), transformers.js (navegador, WebGPU o WASM), paquete Python `suaradee` instalable desde el repositorio, scripts de streaming en Python y Node en `examples/`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Kecil-TTS Michael v0.1 | 7,9 M | Malayo (ms) | ONNX int8 | Apache-2.0 | Navegador y CPU |
| Kecil-TTS Yati v0.2 (Suarify) | mismo tamano | Malayo (ms) | ONNX int8 | Apache-2.0 | Navegador y CPU |
| Paradee-8M-v1.3 (Sahil Mahendrakar) | 8 M | Ingles (voz masculina US) | no disponible | no disponible | no disponible |
| Kokoro-82M (hexgrad) | 82 M | Multiples | no disponible | no disponible | no disponible |

La comparativa se limita a los modelos citados en la informacion disponible; no se dispone de datos de rendimiento cruzados entre ellos.

## Limitaciones y advertencias

- Tasa de error elevada: el 45% de las frases de test superan el 8% de CER (una palabra errónea o ausente o más); los nombres, números, palabras inglesas y frases largas son los puntos débiles.
- El modelo femenino Yati v0.2 es más preciso según el propio autor.
- Una única voz masculina sintética, sin control de emoción ni estilo; algunas frases suenan con un ligero acento estadounidense.
- Entrenado con un conjunto muy pequeno: unos 49 minutos de voz sintética malaya, generada y convertida de voz en cadena, lo que puede introducir artefactos.
- Disenado para frases cortas; el texto largo se divide en frases y puede perder coherencia prosódica.
- El habla es sintética; el autor pide indicarlo cuando se utilice.
- El paquete Python `suaradee` comparte nombre de importación con el modelo femenino, por lo que debe instalarse en un entorno virtual propio.
- El lexico `lexicon_e.json` está bajo CC BY-SA 4.0, lo que impone obligaciones de atribución y compartición para ese componente.
- No se han documentado sesgos específicos más allá de las limitaciones de cobertura lingueística y de calidad descritas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/kecil-tts-michael-v0.1
- Modelo femenino relacionado: https://huggingface.co/Suarify/kecil-tts-yati-v0.2
- Modelo base Paradee-8M-v1.3: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
