# sysrobson/Sagui-4B-Vision-Thinking-Code-GGUF

## Resumen

Sagui-4B es una cuantización GGUF del modelo Qwen/Qwen3.5-4B, publicada por el usuario sysrobson bajo licencia Apache 2.0. Se trata de un modelo multimodal pequeño (3.930.400.256 parámetros) orientado a inferencia local en hardware modesto, con capacidades de razonamiento paso a paso (thinking), lectura de imágenes y generación de código, especialmente TypeScript y JavaScript. El repositorio ocupa 2,4 GB en total: 1,71 GB para el modelo de lenguaje y 0,67 GB para el proyector de visión.

La propuesta principal es ofrecer un modelo que quepa en GPUs de 4 GB, incluso modelos antiguos como una GTX 970 de 2014, manteniendo las capacidades de thinking, visión y tool calling del modelo base. Según el autor, la cuantización IQ3_XXS con imatrix reduce el tamaño un 40% respecto al Q4_K_M del que parte, a costa de perder entre 5 y 9 puntos en benchmarks de TypeScript. Está pensado para su uso con Ollama y llama.cpp, con soporte de decodificación offline.

El modelo está etiquetado para inglés y portugués, con soporte declarado de otros alfabetos latinos, y se distribuye con el pipeline image-text-to-text. Es relevante para desarrolladores que necesitan un asistente de código local con visión sin depender de servicios en la nube ni de hardware de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + proyector de visión); detalles de la arquitectura interna no disponibles |
| Parametros totales | 3.930.400.256 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de llama.cpp usa `-c 16384`) |
| Tipos de cuantizacion | IQ3_XXS con imatrix (única cuantización publicada en el repo) |
| Idiomas soportados | en, pt (y otros alfabetos latinos según el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de lenguaje + `mmproj` F16 para visión) |

## Arquitectura y entrenamiento

Sagui-4B es una cuantización del modelo Qwen/Qwen3.5-4B, no un modelo entrenado desde cero. La información disponible no detalla la arquitectura interna del modelo base (número de capas, tipo de atención, composición del dataset de entrenamiento, uso de RLHF o DPO). Lo que sí se conoce es la estructura de despliegue: un fichero GGUF principal de 1,71 GB para el modelo de lenguaje y un proyector de visión separado (`mmproj-Sagui-4B-F16.gguf`) de 0,67 GB, lo que permite cargar solo el modelo de texto cuando no se necesitan capacidades visuales.

La innovación técnica principal es la cuantización IQ3_XXS con imatrix, que reduce el peso a 2,38 GB con visión (frente a 3,51 GB del Q4_K_M) y a 1,71 GB sin visión (frente a 2,83 GB). El autor reporta que esta compresión cuesta entre 5 y 9 puntos de rendimiento en benchmarks de TypeScript, pero preserva thinking, visión y tool calling. El modelo soporta modo thinking activable o desactivable por petición, tanto en Ollama (`--think`, `--think=false`) como en la API (`"think": false`).

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento paso a paso mediante modo thinking, con verificaciones extensas del resultado.
- Lectura de imágenes y capturas de pantalla (pipeline image-text-to-text).
- Generación de código, con foco declarado en TypeScript y JavaScript.
- Tool calling / function calling.
- Capacidades multimodales: interpretación de capturas de editor, interfaces de usuario y errores visuales.
- Soporte multilingüe limitado a inglés, portugués y otros alfabetos latinos.
- Ejecución offline en hardware de gama baja (GPU de 4 GB).

## Casos de uso

- Corrección de errores de compilación a partir de capturas de pantalla: el modelo lee una imagen del editor, identifica el error (por ejemplo, un TS2322) y propone la línea corregida, como se demuestra en los ejemplos del autor con un error de `reduce` en TypeScript.
- Generación de componentes React a partir de un mockup visual: dado un screenshot de una interfaz, el modelo produce código JSX con estilos, útil para prototipado rápido en equipos con hardware limitado.
- Asistente de código local en entornos con GPU de 4 GB: integrable en flujos de trabajo de desarrollo sin conexión, con latencias de 21-22 tok/s en una GTX 970, suficiente para autocompletado y explicaciones puntuales.
- Resolución de problemas aritméticos y de razonamiento con thinking activado: el ejemplo del cálculo de duración de un trayecto (155 minutos) muestra el uso para tareas que requieren descomposición paso a paso.
- Automatización de tool calling en agentes ligeros: el soporte de function calling permite encadenar llamadas a herramientas en pipelines locales sin depender de APIs externas.
- Análisis de interfaces y QA visual: el modelo puede describir el contenido de una imagen o screenshot, útil para tareas de accesibilidad o documentación automatizada.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse offline con Ollama o llama.cpp, los datos no salen del equipo, adecuado para código propietario o imágenes sensibles.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Sagui-4B (IQ3_XXS) | Qwen3.5-4B Q4_K_M (modelo fuente) |
|---|---|---|---|
| HumanEval-TS (MultiPL-E) | pass@1 | 44,0% | 52,8% |
| MBPP-TS (MultiPL-E) | pass@1 | 54,6% | 59,7% |

Rendimiento de inferencia reportado por el autor:

| Escenario | Velocidad |
|---|---|
| GTX 970 (4 GB), llama.cpp | 21,2 tok/s |
| GTX 970, Ollama con split CPU/GPU | 15,0 tok/s |
| GTX 970, Ollama con todas las capas en GPU (`num_gpu 99`) | 22,7 tok/s |

No se han publicado otros resultados de benchmarks (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,4 GB con visión (modelo + proyector); 1,71 GB solo texto en IQ3_XXS.
- GPU recomendadas: GTX 970 (4 GB) como referencia mínima probada por el autor; cualquier GPU con 4 GB o más de VRAM.
- Cabe en GPUs de consumo: sí, en modelos con 4 GB o más (GTX 970, GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: Ollama (`ollama run hf.co/sysrobson/Sagui-4B-Vision-Thinking-Code-GGUF:IQ3_XXS`), llama.cpp (`llama-server` con `--mmproj` para visión), descarga directa de ficheros GGUF.
- Latencia y throughput: 21,2-22,7 tok/s en GTX 970 con llama.cpp y Ollama con todas las capas en GPU; 15,0 tok/s con split CPU/GPU en Ollama. Ejemplos de latencia del autor: 26,8 s para una corrección de error (63 tokens), 174,2 s para generar un componente React (2332 tokens con thinking), 254,5 s para un problema aritmético (3542 tokens con thinking).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval-TS pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sagui-4B (IQ3_XXS) | 3,93 B | no disponible | 44,0% | Apache 2.0 | GGUF, Ollama, llama.cpp |
| Qwen3.5-4B Q4_K_M | 3,93 B (base) | no disponible | 52,8% | Apache 2.0 | GGUF |
| Qwen3.5-4B (modelo fuente) | 3,93 B | no disponible | no disponible | Apache 2.0 | safetensors y otras |

No se dispone de información sobre otros modelos comparables de la misma categoría (4B multimodal con thinking) en la documentación proporcionada.

## Limitaciones y advertencias

- Pérdida de rendimiento respecto al modelo fuente: entre 5 y 9 puntos en benchmarks de TypeScript (44,0% frente a 52,8% en HumanEval-TS; 54,6% frente a 59,7% en MBPP-TS).
- Idiomas limitados: solo inglés, portugués y otros alfabetos latinos; no se garantiza soporte de escrituras no latinas.
- Riesgo de alucinación inherente a modelos de 4B, especialmente en tareas de razonamiento complejo o código de producción.
- El modo thinking es lento: el autor reporta 254,5 s para una tarea aritmética con 3542 tokens de razonamiento en una GTX 970; conviene desactivarlo para tareas de baja latencia.
- En el ejemplo de generación de componente React, el modelo omitió los placeholders de los campos, lo que indica que puede pasar por alto detalles de la especificación.
- La cuantización IQ3_XXS es agresiva; para mayor fidelidad al modelo base habría que usar cuantizaciones mayores (Q4_K_M, Q5, Q8), que no están publicadas en este repositorio.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.5-4B.
- No se dispone de información sobre sesgos específicos del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/sysrobson/Sagui-4B-Vision-Thinking-Code-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de ejemplos (referenciado en la model card): `examples/transcripts.json` y `scripts/run_demos.py` dentro del repositorio de Hugging Face
- Donación PayPal (enlace del autor): https://www.paypal.com/donate/?hosted_button_id=JA6B7RKJURXNW
- Búsqueda web: https://github.com/zhuyansen/awesome-claude-video-skills (no relacionado directamente con el modelo)
