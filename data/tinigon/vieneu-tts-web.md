# Tinigon/vieneu-tts-web

## Resumen

VieNeu-TTS v3 Turbo — browser pack es un empaquetado de los pesos originales del modelo de sintesis de voz VieNeu-TTS v3 Turbo, desarrollado por pnnbao-ump, preparado por el usuario Tinigon para su ejecucion completa dentro de un navegador web mediante onnxruntime-web y WebAssembly. No se ha reentrenado ni modificado el modelo subyacente: el repositorio contiene unicamente los pesos convertidos a formato ONNX y optimizados para descarga e inferencia en cliente.

El pack resuelve el problema de desplegar TTS neuronal sin backend ni GPU servidor, permitiendo sintesis de voz en el propio navegador del usuario. Incluye el modelo acustico, el tokenizador, las voces predefinidas, el decodificador de codec de audio (MOSS-Audio-Tokenizer-Nano-ONNX) y el modulo de normalizacion de texto y grafema-a-fonema (sea-g2p compilado a WebAssembly).

El modelo esta especializado exclusivamente en vietnamita (`language: vi`) y se distribuye bajo licencia Apache-2.0. El repositorio ocupa 0,3 GB e incluye los pesos en float16 con expansion a float32 en el navegador, lo que reduce a la mitad la descarga. Es relevante para desarrolladores que necesiten TTS en vietnamita sin infraestructura de servidor, con privacidad total al no enviar texto a ningun backend.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo acustico neuronal con cabezas de codebook y decodificador de codec de audio (MOSS-Audio-Tokenizer-Nano); inferencia via ONNX Runtime Web (WebAssembly) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en float16 (`.f16`) expandidos a float32 en el navegador; arrays auxiliares en float32 (`.f32`) |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx`), datos externos en `.f16` y `.f32`, manifiesto JSON con SHA-256 |

## Arquitectura y entrenamiento

El pack no introduce entrenamiento propio: reutiliza los pesos upstream de VieNeu-TTS v3 Turbo (modelo acustico, tokenizador y voces predefinidas), el decodificador de audio MOSS-Audio-Tokenizer-Nano-ONNX y el modulo sea-g2p para normalizacion de texto y conversion grafema-a-fonema. La arquitectura exacta del backbone no se detalla en la informacion disponible; la model card describe un modelo acustico con cabezas que computan los logits de un codebook mediante `Gather` de la ultima posicion y `MatMul` con la tabla de embeddings del codebook.

Los cambios respecto al upstream son de empaquetado y optimizacion para navegador: los pesos se almacenan como float16 (la mitad de descarga) y se expanden a float32 antes de crear las sesiones ONNX; el backbone y la tabla de embeddings ya eran float16 upstream, por lo que esa parte es sin perdida, mientras que el decodificador de codec se redondea una vez. Se anaden cinco nodos al grafo `vieneu_acoustic_cached.onnx` para calcular los logits de un codebook dentro del grafo (necesario para rendimiento en navegador). El modulo sea-g2p 0.10.0 se compila a `wasm32-unknown-unknown` a traves de su C ABI con un parche para entregar el diccionario como bytes en lugar de fichero mapeado en memoria. No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del dataset ni uso de RLHF/DPO.

## Capacidades

- Sintesis de voz (text-to-speech) en vietnamita a partir de texto de entrada.
- Normalizacion de texto y conversion grafema-a-fonema mediante sea-g2p compilado a WebAssembly.
- Uso de voces predefinidas incluidas en `turbo/voices.json` (mismos valores que el upstream `voices_v3_turbo.json`).
- Ejecucion integra en navegador con onnxruntime-web y WebAssembly, sin backend.
- Decodificacion de audio mediante el codec MOSS-Audio-Tokenizer-Nano.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada.

## Casos de uso

- Lectura por voz de contenido web en vietnamita: el modelo puede sintetizar articulos o parrafos directamente en el navegador del usuario, sin enviar texto a un servidor y sin coste de infraestructura backend.
- Accesibilidad para usuarios con discapacidad visual en aplicaciones web vietnamitas: al ejecutarse en cliente con WebAssembly, la sintesis funciona incluso en entornos con conectividad limitada una vez cargados los 0,3 GB de pesos.
- Prototipado rapido de interfaces de voz: desarrolladores pueden integrar TTS en una demo estatica o SPA sin montar un servicio de inferencia, usando las voces predefinidas incluidas.
- Aplicaciones educativas de aprendizaje de vietnamita: pronunciacion de palabras y frases con voces predefinidas, ejecutandose localmente y preservando la privacidad del alumno.
- Herramientas de lectura offline o PWA: al no requerir backend, el pack encaja en aplicaciones web progresivas que cachean los pesos y ofrecen TTS sin conexion.
- Generacion de narraciones para contenido multimedia en vietnamita en pipelines de edicion en navegador, con la ventaja de que los pesos float16 reducen a la mitad la descarga inicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario objetivo, ya que la inferencia se ejecuta en el navegador sobre CPU mediante WebAssembly; no se dispone de estimaciones de memoria RAM del navegador necesaria.
- GPU recomendadas: no disponible; el pack esta disenado para onnxruntime-web (WebAssembly), no para CUDA.
- Compatibilidad con GPU de consumo: no aplica al modo de despliegue previsto; el modelo se ejecuta en el navegador del cliente.
- Opciones de despliegue: onnxruntime-web con WebAssembly; el repositorio incluye un manifiesto `v1/manifest.json` con tamano y SHA-256 de cada fichero.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Tamano de descarga: 0,3 GB de repositorio, con pesos float16 que se expanden a float32 en el navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue en navegador |
|---|---|---|---|---|---|
| VieNeu-TTS v3 Turbo — browser pack (este) | no disponible | no disponible | vi | Apache-2.0 | Si (onnxruntime-web + WASM) |
| VieNeu-TTS v3 Turbo (upstream) | no disponible | no disponible | vi | Apache-2.0 | No documentado |
| MOSS-Audio-Tokenizer-Nano-ONNX | no disponible | no disponible | no disponible | Apache-2.0 | Componente de codec, no TTS completo |
| sea-g2p | no disponible | no disponible | sudeste asiatico (incluye vi) | Apache-2.0 | Componente G2P, no TTS completo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta vietnamita; no se documentan otros idiomas.
- Al ser un reempaquetado de pesos upstream, hereda cualquier sesgo o limitacion del modelo original VieNeu-TTS v3 Turbo, no documentados en la informacion disponible.
- Riesgo de alucinacion o artefactos de sintesis no cuantificado; no se han publicado evaluaciones en la informacion disponible.
- El decodificador de codec se redondea una vez de float16 a float32, lo que puede introducir una perdida minima no medida.
- La licencia Apache-2.0 permite uso comercial, pero deben respetarse las atribuciones de los componentes upstream (VieNeu-TTS, MOSS-Audio-Tokenizer-Nano-ONNX, sea-g2p).
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia; no hay evidencia de uso en produccion.
- El rendimiento real en navegador depende del motor WebAssembly del cliente y no esta cuantificado.
- No se documentan limitaciones de longitud de texto de entrada ni de contexto.

## Enlaces

- Hugging Face: https://huggingface.co/Tinigon/vieneu-tts-web
- Modelo upstream: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo
- Repositorio upstream: https://github.com/pnnbao97/VieNeu-TTS
- Codec de audio: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX
- Modulo G2P: https://github.com/pnnbao97/sea-g2p
