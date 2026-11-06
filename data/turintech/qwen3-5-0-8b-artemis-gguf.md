# turintech/Qwen3.5-0.8B-Artemis-GGUF

## Resumen

Qwen3.5-0.8B-Artemis-GGUF es una versión cuantizada en formato GGUF del modelo Qwen3.5-0.8B de Qwen, publicada por TurinTech (creada con su herramienta Artemis). Se trata de un modelo multimodal muy pequeño (unos 752 millones de parámetros) orientado a llamadas a herramientas (function calling), respuestas cortas de chat y comprensión de imágenes, pensado para ejecutarse localmente en hardware modesto o incluso en GPUs de gama baja.

Su relevancia radica en la optimización de la cuantización: según el autor, la versión Q5_K_M por defecto ocupa solo 0,569 GB de descarga y alcanza un pico de 1,2 GiB de memoria GPU con un contexto de 8.192 tokens, frente a los 2,2 GiB del modelo original. Además, mejora los resultados en tool calling respecto a otras cuantizaciones equivalentes (163 de 258 tool calls correctos en BFCL live, frente a 109 de bartowski en Q4_K_M), lo que lo hace especialmente interesante para agentes ligeros que corren en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), multimodal (texto e imagen) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 8.192 tokens (configuración usada en las pruebas del autor) |
| Tipos de cuantizacion | Q5_K_M (por defecto), Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con proyector de visión separado en BF16 y F16) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.5-0.8B, un transformer de la familia Qwen3.5 con capacidades multimodales (image-text-to-text). Esta ficha corresponde a una cuantización GGUF realizada por TurinTech con el método imatrix (importancia de matrices), que permite mantener la calidad en cuantizaciones bajas. El proyector de visión se distribuye como archivo separado (mmproj-BF16.gguf o mmproj-F16.gguf), convertido desde los pesos originales, lo que permite omitirlo si solo se necesita texto.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset ni uso de RLHF/DPO), ni sobre el proceso de destilación o ajuste fino realizado por TurinTech con Artemis. El modelo conserva la plantilla de chat original de Qwen y soporta el modo de razonamiento (thinking), que puede activarse o desactivarse mediante el parámetro `enable_thinking` en la petición.

## Capacidades

- Generación de texto conversacional optimizada para respuestas cortas.
- Function calling / tool calling: el autor declara 163 de 258 tool calls correctos en el benchmark BFCL live, con un parser de tool calls compatible con llama.cpp y Ollama.
- Comprensión de imágenes (vision): admite imágenes enviadas como data URL en mensajes `image_url`, mediante el proyector de visión separado.
- Modo de razonamiento (thinking mode) activable/desactivable por petición; recomendable desactivarlo para respuestas cortas y tool calls.
- Razonamiento matemático básico: 124 de 250 problemas correctos en las últimas 250 preguntas de GSM8K.
- Seguimiento de instrucciones: 308 de 541 instrucciones seguidas según IFEval.
- Despliegue con plantilla de chat original de Qwen (`--jinja` en llama.cpp) y paquetes listos para Ollama.

## Casos de uso

- Agentes locales con llamadas a herramientas: el modelo puede ejecutarse con menos de 1,5 GiB de VRAM y gestionar tool calls con fiabilidad razonable para su tamaño, ideal para agentes que corren en portátiles o SBCs.
- Chatbots ligeros en local: con contexto de 8.192 tokens, sirve para asistentes conversacionales de respuestas cortas sin depender de la nube.
- Análisis de gráficos e imágenes: gracias al proyector de visión, puede responder preguntas sobre imágenes (el autor lo probó con preguntas sobre gráficos, acertando 11 de 20).
- Prototipado rápido de pipelines con herramientas: se integra con llama-server como servidor OpenAI-compatible, lo que facilita pruebas de APIs de function calling antes de escalar a modelos mayores.
- Despliegue en Ollama: hay paquetes verificados en el registry de Ollama con alias `q5_k_m` y `q4_k_m`, útiles para distribuir aplicaciones locales fácilmente.
- Automatización de tareas en dispositivos con recursos limitados: el tamaño de descarga de 0,569 GB y el bajo consumo de memoria lo hacen viable en entornos edge.
- Enrutado de peticiones (routing): como modelo muy pequeño y rápido, puede actuar como clasificador o enrutador inicial antes de delegar a modelos más grandes.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados por terceros):

| Benchmark | Resultado |
|---|---|
| BFCL live (tool calls) | 163 de 258 correctos (frente a 109 de bartowski Q4_K_M, 0,580 GB) |
| IFEval (seguimiento de instrucciones) | 308 de 541 seguidas |
| GSM8K (últimas 250 preguntas) | 124 de 250 correctas |
| Preguntas sobre imágenes (20 preguntas de gráficos) | 11 correctas (con proyector BF16 y F16; 11 también para Unsloth Q5_K_M) |

No se han publicado resultados de benchmarks estándar como MMLU o HumanEval en la información disponible.

## Requisitos de hardware

- VRAM estimada: pico de 1,2 GiB con contexto de 8.192 tokens en una NVIDIA RTX 5090 (versión Q5_K_M); el modelo original sin cuantizar alcanzaba 2,2 GiB.
- Cabe con holgura en GPUs de consumo: cualquier GPU moderna con 2 GiB o más de VRAM (por ejemplo, RTX 3050, RTX 4060 o superiores) es suficiente; también debería funcionar en CPU, aunque no hay mediciones publicadas.
- GPU de referencia en las pruebas: NVIDIA RTX 5090.
- Opciones de despliegue:
  - llama.cpp / llama-server: comando recomendado `llama-server -hf turintech/Qwen3.5-0.8B-Artemis-GGUF:Q5_K_M --port 8080 -c 8192 --jinja` (requiere soporte de Qwen3.5 y HTTPS; usar `--no-mmproj` para omitir el proyector de visión de 207 MB).
  - Ollama: `ollama run turintech/qwen3.5-0.8b-artemis:q5_k_m` (alias verificados con SHA-256 coincidentes; Ollama 0.40.4 o superior para importación local).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Característica | Qwen3.5-0.8B-Artemis-GGUF | Qwen3.5-0.8B (bartowski, Q4_K_M) | Unsloth Qwen3.5-0.8B Q5_K_M |
|---|---|---|---|
| Parametros | 752 M | 752 M | 752 M |
| Tamano de descarga | 0,569 GB (Q5_K_M) | 0,580 GB (Q4_K_M) | no disponible |
| Tool calls BFCL live | 163/258 | 109/258 | no disponible |
| Memoria GPU pico (8k ctx) | 1,2 GiB | no disponible | no disponible |
| Vision | Sí (mmproj separado) | no disponible | Sí (proyector propio) |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |
| Formato | GGUF | GGUF | GGUF |

## Limitaciones y advertencias

- Los benchmarks publicados son declaraciones del autor sin verificación independiente (campo `verified: false` en el model-index).
- El modo thinking puede consumir todos los tokens de salida sin dar respuesta si no se desactiva: en las pruebas del autor, una pregunta corta con thinking activado usó los 1.500 tokens de salida razonando sin responder. Desactivar `enable_thinking` para respuestas cortas y tool calls.
- Precisión moderada en matemáticas (aproximadamente el 50 % en GSM8K) y en seguimiento de instrucciones (aproximadamente el 57 % en IFEval), esperable en un modelo de 0,8B: no apto para tareas que exijan alta fiabilidad sin supervisión.
- Riesgo de alucinación inherente a modelos muy pequeños; conviene validar las salidas de tool calls antes de ejecutarlas en producción.
- La descarga sin etiqueta `:Q5_K_M` en llama.cpp (y la importación automática de Ollama desde Hugging Face) selecciona Q4_K_M en lugar de la versión por defecto; conviene especificar la etiqueta explícitamente.
- Idiomas soportados no documentados en la ficha; verificar antes de usar en entornos multilingües.
- La verificación de los paquetes de Ollama fue una comprobación de solo lectura del registry (hashes y ajustes), no una prueba completa de inferencia desde el registry.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/turintech/Qwen3.5-0.8B-Artemis-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Sección de resultados de la model card: https://huggingface.co/turintech/Qwen3.5-0.8B-Artemis-GGUF#results
- Hilo de feedback de TurinTech: https://huggingface.co/spaces/turintech/README/discussions/1
- Web de TurinTech: https://turintech.ai
