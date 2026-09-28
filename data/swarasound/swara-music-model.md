# SwaraSound/swara-music-model

## Resumen

SwaraSound/swara-music-model es un bundle ONNX cuantizado a 4 bits del modelo de generacion de musica stabilityai/stable-audio-3-small-music de Stability AI. Se trata de una copia sin modificar del repositorio lsb/stable-audio-3-small-music-onnx (revision d523962dc41a9c632a4928ff9e02538bb11f1806), publicado por SwaraSound como espejo del que emplea su producto Swara Music. Su proposito es ejecutar generacion de audio a partir de texto directamente en el navegador mediante onnxruntime-web y transformers.js, sin backend ni GPU dedicada.

El modelo combina un codificador de texto T5Gemma, un transformer de difusion (DiT) que trabaja en espacio latente y un decodificador de audio SAME-S, mas un modulo auxiliar number_conditioner que codifica la duracion solicitada. Los pesos ocupan unos 640 MB repartidos en 9 fragmentos externos, con las operaciones MatMul/Linear cuantizadas en int4 MatMulNBits (block_size=16) y los kernels LayerNorm/RMSNorm y Conv1d en fp32.

Es relevante porque demuestra un flujo completo de text-to-audio estereo a 44,1 kHz enteramente en el navegador: la salida mantiene una correlacion de envolvente de aproximadamente 0,88 frente a la referencia en PyTorch fp32, con tiempos de 60-120 segundos por clip de 10 segundos en WASM de un solo hilo. No se trata de un modelo nuevo, sino de una version comprimida y portable de un modelo ya existente de Stability AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) en espacio latente + codificador de texto T5Gemma + decodificador de audio SAME-S |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el condicionamiento de texto usa 256 tokens codificados con T5Gemma (257 contando la embedding de duracion) |
| Tipos de cuantizacion | int4 MatMulNBits (block_size=16) en MatMul/Linear; GatherBlockQuantized en tablas de embeddings; fp32 en LayerNorm/RMSNorm, biases y kernels Conv1d |
| Idiomas soportados | no disponible |
| Licencia | Stability AI Community License; el codificador T5Gemma queda tambien bajo los Gemma Terms of Use |
| Formato de pesos | ONNX con datos externos fragmentados en chunks de <= 100 MB (9 chunks, ~640 MB en total) |

## Arquitectura y entrenamiento

El pipeline consta de cuatro grafos ONNX. El codificador de texto es un T5Gemma de unos 213 MB que produce una matriz de condicionamiento de cross-attention de forma (1, 257, 768), correspondiente a 256 tokens mas una embedding de duracion. El nucleo generativo es un DiT de unos 380 MB que opera sobre un latente de forma (1, 256, T_lat), donde T_lat = ceil((seconds + 6) * 44100 / 8192) * 2. El decodificador SAME-S de unos 45 MB reconstruye la onda de audio a partir del latente, con salida estereo de forma (1, 2, T_lat * 4096) a 44,1 kHz recortada a [-1, 1]. El cuarto componente es un number_conditioner de ~0,8 MB que genera la embedding de duracion para el condicionamiento global (adaLN) y de cross-attention.

El muestreo emplea un objetivo rf_denoiser con el sampler pingpong, que se reduce a dos operaciones: `denoised = x - t_curr * dit(x, t_curr, ...)` y `x = (1 - t_next) * denoised + t_next * randn_like(x)`. El schedule proviene de LogSNRShift(rate=0, anchor_logsnr=-6.2, logsnr_end=2.0), invariante respecto a la longitud de secuencia, por lo que la misma formula cerrada sirve para cualquier duracion. El valor por defecto es de 8 pasos y el classifier-free guidance esta desactivado en inferencia (cfg_scale=1.0). No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o si hubo RLHF o DPO: este repositorio es una exportacion, no un entrenamiento.

## Capacidades

- Generacion de musica y audio a partir de descripciones de texto (text-to-audio), con salida estereo a 44,1 kHz.
- Control de la duracion del clip mediante el modulo number_conditioner y el parametro `seconds`.
- Condicionamiento local-add para inpainting de fragmentos de audio: la entrada local_add tiene forma (1, 257, T_lat) y se rellena con ceros para text-to-audio puro.
- Muestreo con objetivo rf_denoiser y sampler pingpong, configurable en pasos (8 por defecto).
- Ejecucion end-to-end en el navegador mediante onnxruntime-web (WASM con SIMD y multihilo, y WebGPU disponible aunque no habilitado en el bundle).
- Compatibilidad con transformers.js para la tokenizacion T5Gemma.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.

## Casos de uso

- Generacion de musica en el navegador sin backend: el bundle carga los 9 chunks de pesos desde cualquier servidor estatico y sintetiza clips directamente en el cliente, util para aplicaciones web que no quieren exponer infraestructura de GPU.
- Demos interactivas de text-to-audio: el sketch de uso con `ort.InferenceSession.create` y `onnxruntime-web/wasm` permite montar un playground que reciba un prompt y devuelva un WAV sin instalar dependencias nativas.
- Aplicaciones PWA u offline: al repartirse en ficheros de <= 100 MB, los pesos se pueden cachear en el navegador y reutilizar entre sesiones, lo que encaja en editores de musica que funcionan sin conexion.
- Prototipado de bandas sonoras y loops: con control de duracion y un coste de 60-120 s por clip de 10 s en WASM, resulta adecuado para generar bocetos de pistas cortas antes de producir con herramientas mas pesadas.
- Inpainting y edicion de fragmentos: el condicionamiento local-add permite regenerar secciones concretas de un audio existente en lugar de sintetizar la pieza completa.
- Integracion en estudios "bring your own key": el producto Swara Music usa este espejo como motor, de modo que el modelo encaja en flujos donde el usuario aporta sus claves y su almacenamiento sin backend compartido.
- Educacion y experimentacion: al ser un ONNX portable de 640 MB, sirve para estudiar cuantizacion int4, samplers de difusion y despliegue en navegador en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor si documenta metricas internas de fidelidad de la cuantizacion y de tiempo de ejecucion:

| Metrica | Valor |
|---|---|
| SNR q4 vs fp32 (DiT, forward pass unico) | ~10 dB |
| SNR q4 vs fp32 (decoder) | ~15 dB |
| SNR q4 vs fp32 (text encoder) | ~13 dB |
| Correlacion de envolvente end-to-end vs referencia PyTorch fp32 (mismo prompt y semilla) | ~0,88 |
| Tiempo de generacion en WASM de 1 hilo (M-series Mac) | 60-120 s para un clip de 10 s a 8 pasos |

## Requisitos de hardware

- Peso de los pesos en disco o red: ~640 MB en int4, repartidos en 9 chunks de <= 100 MB.
- Memoria necesaria para inferencia: no disponible oficialmente; como referencia, hay que sumar al tamano de los pesos en memoria (aproximadamente 640 MB) las activaciones de DiT, decoder y encoder, por lo que conviene disponer de al menos 1-2 GB de RAM libre en el navegador o en el proceso de onnxruntime.
- CPU: funciona sin GPU mediante onnxruntime-web WASM; el autor reporta 60-120 s por clip de 10 s a 8 pasos en un solo hilo sobre Apple Silicon.
- GPU dedicada en servidor (A100, H100, RTX 4090): no se documentan cifras de VRAM ni de throughput para estos aceleradores en la informacion disponible.
- GPU consumidora: WebGPU esta soportado por onnxruntime-web y el autor indica que seria "mucho mas rapido", pero el bundle no lo habilita intencionadamente para funcionar desde cualquier host estatico; no se ofrecen numeros concretos.
- Opciones de despliegue: onnxruntime-web (WASM con SIMD y multihilo, o WebGPU), @huggingface/transformers para la tokenizacion, onnxruntime en Node.js y cualquier servidor estatico que sirva los chunks.
- Latencia y throughput: los unicos datos publicados son los 60-120 s por clip de 10 s en WASM de un hilo; no hay cifras de throughput por GPU.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Tamano del bundle | Licencia | Notas |
|---|---|---|---|---|---|
| SwaraSound/swara-music-model | ONNX (datos externos) | int4 MatMulNBits | ~640 MB | Stability AI Community License | Espejo sin modificar del bundle de lsb |
| lsb/stable-audio-3-small-music-onnx | ONNX (datos externos) | int4 MatMulNBits | ~640 MB | Stability AI Community License | Origen identico (misma revision); el modelo de SwaraSound es copia literal |
| stabilityai/stable-audio-3-small-music | PyTorch (pesos originales) | fp32 | no disponible | Stability AI Community License | Modelo base original; requiere PyTorch y no esta orientado a navegador |

## Limitaciones y advertencias

- No es un modelo nuevo: es una copia identica del bundle lsb/stable-audio-3-small-music-onnx, sin modificaciones ni reentrenamiento; cualquier mejora respecto al original no existe en este repositorio.
- La cuantizacion int4 introduce degradacion: SNR de ~10 dB en el DiT, ~15 dB en el decoder y ~13 dB en el text encoder, con "algunos artefactos de alta frecuencia" segun el propio autor y una correlacion de envolvente de ~0,88 frente a fp32.
- El classifier-free guidance esta desactivado en inferencia (cfg_scale=1.0), lo que limita el ajuste fino de la adherencia al prompt.
- El pipeline no soporta tool calling, agentes ni entradas multimodales; su unica funcion es text-to-audio (y condicionamiento local para inpainting).
- Licencia restrictiva: se hereda la Stability AI Community License y, para el codificador T5Gemma, los Gemma Terms of Use; es necesario revisar ambas antes de cualquier uso comercial.
- Rendimiento limitado en navegador: 60-120 s por 10 s de audio en WASM de un solo hilo, sin cifras para WebGPU ni para GPU de servidor.
- Sin datos sobre idiomas soportados, numero de parametros, composicion del dataset de entrenamiento ni sesgos conocidos.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad ni issues publicos.
- Los enlaces de la busqueda web apuntan en su mayoria a otros proyectos con el nombre "Swara" (Swara.AI, Swara de Ashwin Madavan, azmth-Labs) que no parecen estar afiliados a este modelo; no deben tomarse como documentacion del mismo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SwaraSound/swara-music-model
- Modelo base original: https://huggingface.co/stabilityai/stable-audio-3-small-music
- Bundle ONNX de origen: https://huggingface.co/lsb/stable-audio-3-small-music-onnx
- Repositorio de la demo: https://github.com/lsb/stable-audio-3-small-music-onnx
- onnxruntime-web en npm: https://www.npmjs.com/package/onnxruntime-web
- Producto Swara Music: https://swarasound.com/music
- Swara Sound: https://swarasound.com/
- GitHub azmth-Labs/Swara---music-AI (relacion no confirmada): https://github.com/azmth-Labs/Swara---music-AI
- Swara.AI (relacion no confirmada): https://swara.ai/
- Music Arena de Artificial Analysis: https://artificialanalysis.ai/music/arena
- Proyecto Swara de Ashwin Madavan (relacion no confirmada): https://madavan.me/projects/swara.html
