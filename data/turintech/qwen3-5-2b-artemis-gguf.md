# turintech/Qwen3.5-2B-Artemis-GGUF

## Resumen

Qwen3.5-2B-Artemis-GGUF es una cuantización en formato GGUF del modelo Qwen/Qwen3.5-2B publicada por TurinTech AI (autor `turintech`) dentro de su pipeline de optimización denominado Artemis. El objetivo declarado es claro: ofrecer un modelo pequeño de 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) capaz de ejecutar tool calls, matemáticas e instrucciones en local, manteniendo todas las capas residentes en una GPU de consumo. La model card lo resume como "un Qwen3.5 2B pequeño para tool calls locales, matemáticas e instrucciones, con todas las capas en una GPU pequeña".

El modelo base Qwen3.5-2B es multimodal (la pipeline declarada es `image-text-to-text`), y este repositorio conserva esa capacidad mediante proyectores de visión separados (`mmproj-BF16.gguf` y `mmproj-F16.gguf`). La distribución principal es un único archivo de 1,395 GB (`Qwen3.5-2B-Artemis-Q5_K_M.gguf`), con una variante Q4_K_M de 1,280 GB. La reducción de memoria es el argumento central: 2,1 GiB de pico en una NVIDIA RTX 5090 con contexto de 8.192 tokens, frente a los 4,3 GiB del modelo original.

Su relevancia práctica está en el nicho de agentes locales y function calling de bajo coste: en el conjunto BFCL live acierta 184 de 258 tool calls retenidas, frente a las 177 de la cuantización Q4_K_M de bartowski. La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales conocidas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura; el modelo base es Qwen/Qwen3.5-2B) |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 B, dato de safetensors) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 8.192 tokens en la configuración de referencia (`-c 8192`); el máximo soportado no se especifica en la información disponible |
| Tipos de cuantizacion | GGUF Q5_K_M (por defecto, 1,395 GB) y Q4_K_M (1,280 GB); etiqueta `imatrix` en el repo; proyectores de visión en BF16 y F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo principal) + `mmproj-BF16.gguf` / `mmproj-F16.gguf` para visión |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna del modelo base Qwen3.5-2B ni su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí se describe es el trabajo de TurinTech: una conversión a GGUF con cuantización asistida por matriz de importancia (etiqueta `imatrix`) y la conversión del proyector de visión a partir de los pesos originales. El repositorio menciona además que el modelo base incorpora una capa de predicción multi-token (MTP), que no está incluida en los paquetes de solo texto distribuidos a través de Ollama.

El resultado técnico medible es la huella de memoria: 2,1 GiB de pico en RTX 5090 con 8.192 tokens de contexto, frente a los 4,3 GiB del original. La model card indica que llama.cpp debe incluir soporte para Qwen3.5 y HTTPS, y que los benchmarks se ejecutaron con decodificación greedy y con muestreo, en ambos casos con el modo thinking desactivado (`chat_template_kwargs.enable_thinking: false`).

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla Jinja habilitada mediante `--jinja`.
- Tool calling / function calling: el caso de uso central del modelo; devuelve las llamadas en `choices[0].message.tool_calls` con argumentos estructurados (probado con `get_weather` y parámetros `city` y `unit`).
- Razonamiento con modo thinking conmutable: `enable_thinking` en llama.cpp y `think:false` en Ollama; los benchmarks publicados se hicieron con thinking desactivado.
- Matemáticas de nivel escolar y multi-paso (evaluado en GSM8K).
- Seguimiento de instrucciones con restricciones de formato (evaluado en IFEval).
- Visión imagen-texto mediante el proyector `mmproj`: las imágenes se envían como data URL en una parte `image_url` del mensaje de usuario.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Uso como agente multi-paso: no se documenta explícitamente, pero el soporte de tool calling y de contexto de 8.192 tokens lo hace viable.

## Casos de uso

- Agentes locales de tool calling: desplegar el modelo con `llama-server` en una estación de trabajo y conectar herramientas reales (clima, calendario, consultas a bases de datos) mediante el esquema `tools` de la API compatible con OpenAI. Los 184/258 aciertos en BFCL live lo sitúan como opción viable para asistentes personales con funciones acotadas.
- Asistente de escritorio con GPU modesta: con 2,1 GiB de pico en contexto de 8.192 tokens, cabe en equipos con GPUs de gama media y deja el resto de VRAM libre para otras tareas del sistema.
- Automatización de extracción estructurada: usar function calling para convertir texto libre en JSON validado (por ejemplo, clasificar tickets de soporte en categorías y campos definidos por esquema).
- Análisis de gráficos e imágenes simples en local: el proyector BF16 resolvió 16 de 20 preguntas sobre gráficos, lo que permite tareas de lectura de dashboards o capturas sin enviar datos a la nube.
- Enrutamiento y preprocesado en pipelines de agentes: usar este 2B como primer nivel que decide qué herramienta invocar o si hay que escalar a un modelo mayor, reduciendo coste por consulta.
- Tutoría y resolución de problemas matemáticos básicos: 190 de 250 aciertos en GSM8K lo hacen útil para ejercicios de primaria y secundaria con verificación posterior.
- Cumplimiento de formatos estrictos en generación: con 374 de 541 en IFEval, sirve para plantillas de correo, respuestas con estructura fija o generación de campos concretos.
- Desarrollo e integración en CI: distribución vía Ollama (`turintech/qwen3.5-2b-artemis:q5_k_m`) o GGUF directo, lo que simplifica empaquetar el modelo en tests automatizados de agentes.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente, `verified: false`), sobre tareas retenidas y con el modo thinking desactivado:

| Benchmark | Metrica | Resultado | Porcentaje |
|---|---|---|---|
| BFCL live (gorilla-llm) | Tool calls correctas | 184 de 258 | 71,3 % |
| BFCL v4 (gorilla-llm) | Tool calls correctas | 403 de 500 | 80,6 % |
| IFEval (google/IFEval) | Instrucciones seguidas | 374 de 541 | 69,1 % |
| GSM8K (openai/gsm8k), últimas 250 | Respuestas correctas | 190 de 250 | 76,0 % |
| Preguntas sobre gráficos (20 preguntas, interno) | Respuestas correctas con proyector BF16 | 16 de 20 | 80,0 % |

Comparaciones aportadas en la misma model card: 177 de 258 en BFCL live para la cuantización Q4_K_M de bartowski, y 14 de 20 en preguntas sobre imágenes para el Q5_K_M de Unsloth con su propio proyector.

## Requisitos de hardware

- VRAM estimada: 2,1 GiB de pico en RTX 5090 con contexto de 8.192 tokens (medición del autor); el modelo original alcanzaba 4,3 GiB.
- Tamaño de descarga: 1,395 GB (Q5_K_M) y 1,280 GB (Q4_K_M); el proyector de visión añade 671 MB de descarga, evitables con `--no-mmproj`.
- GPU probada: NVIDIA RTX 5090. Cualquier GPU consumer con 4 GB o más de VRAM debería acomodar el modelo en Q5_K_M con contexto de 8.192 tokens, según la memoria medida.
- Despliegue: llama.cpp con soporte de Qwen3.5 y HTTPS (el ejemplo del autor usa la build b11617), `llama-server -hf turintech/Qwen3.5-2B-Artemis-GGUF:Q5_K_M --port 8080 -c 8192 --jinja`; también Ollama (`turintech/qwen3.5-2b-artemis:q5_k_m`, requiere Ollama 0.40.11 o superior para imágenes) y LM Studio Hub.
- Aceleración por CPU: el autor validó una tool call con el archivo Q5_K_M en CPU con llama.cpp b11617.
- Latencia y throughput: no disponibles (la información proporcionada no incluye tokens por segundo ni tiempos de respuesta).

## Comparativa con modelos similares

| Modelo | Parametros | Formato y tamano | BFCL live | Otros datos | Licencia |
|---|---|---|---|---|---|
| turintech/Qwen3.5-2B-Artemis-GGUF (Q5_K_M) | 1,88 B | GGUF, 1,395 GB | 184/258 | 2,1 GiB de pico; 16/20 en preguntas de imagen | Apache 2.0 |
| bartowski, Qwen3.5-2B Q4_K_M | 1,88 B (mismo base) | GGUF, 1,396 GB | 177/258 | Sin datos de memoria en la información disponible | Apache 2.0 |
| Unsloth Q5_K_M + proyector Unsloth | 1,88 B (mismo base) | GGUF | no disponible | 14/20 en preguntas de imagen | Apache 2.0 |
| Qwen/Qwen3.5-2B (original) | 1,88 B | safetensors | no disponible | 4,3 GiB de pico con el mismo contexto | Apache 2.0 |
| turintech/Qwen3.5-9B-Artemis-GGUF | no disponible | GGUF | no disponible | Variante mayor de la misma familia | Apache 2.0 |

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y están marcados como no verificados; además se obtuvieron con una configuración concreta (thinking desactivado, muestreo concreto) que los paquetes de Ollama no replican, según advierte la propia model card.
- Sesgos conocidos: no documentados en la información disponible; al ser una cuantización del modelo Qwen, hereda los sesgos del modelo base, que tampoco se detallan.
- Riesgo de alucinación: no cuantificado; con 190/250 en GSM8K y 374/541 en IFEval, la tasa de error en tareas de razonamiento e instrucciones es relevante para producción sin verificación posterior.
- Idiomas soportados: no disponibles; no se puede garantizar calidad fuera del inglés sin evaluación propia.
- El contexto máximo real no se especifica; el valor de 8.192 tokens es la configuración usada en las pruebas, no un límite confirmado.
- Los paquetes de solo texto de Ollama no incluyen el codificador de visión ni la capa MTP; para imágenes hay que usar el repositorio de Hugging Face con el `mmproj` correspondiente.
- En Ollama, omitir `think` activa el razonamiento: hay que pasar `think:false` explícitamente para reproducir el comportamiento de los benchmarks.
- La etiqueta de Ollama por defecto (`latest`) apunta a `q5_k_m`, pero las descargas sin etiqueta de llama.cpp y la importación generada por Hugging Face seleccionan Q4_K_M; conviene fijar el tag de forma explícita.
- Licencia Apache 2.0: sin restricciones conocidas para uso comercial, pero se recomienda revisar el archivo LICENSE del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/turintech/Qwen3.5-2B-Artemis-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- TurinTech: https://turintech.ai
- Página en Ollama: https://ollama.com/turintech/qwen3.5-2b-artemis:latest
- Página en LM Studio Hub: https://lmstudio.ai/turintech/qwen3.5-2b-artemis
- Variante de 9B de la misma familia: https://huggingface.co/turintech/Qwen3.5-9B-Artemis-GGUF
- Dataset BFCL (Gorilla): https://huggingface.co/datasets/gorilla-llm/Berkeley-Function-Calling-Leaderboard
- Dataset IFEval: https://huggingface.co/datasets/google/IFEval
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
