# webmp3/Sakura-Qwen-Image-2.1-PE-T2I-Uncensored-GGUF

## Resumen

Sakura-Qwen-Image-2.1-PE-T2I-Uncensored-GGUF es una cuantización comunitaria en formato GGUF del modelo Qwen/Qwen-Image-2.1-PE-T2I, el componente de reescritura de prompts del sistema Qwen-Image-2.1. No es un modelo generador de imágenes, sino un modelo de lenguaje que recibe una petición breve de imagen en cualquier idioma y devuelve un prompt largo y detallado en inglés junto con una relación de aspecto recomendada. El autor, webmp3, ha aplicado un proceso de abliteration sobre los pesos para eliminar los comportamientos de rechazo, publicando versiones Q8_0 y Q4_K_M listas para llama.cpp.

El modelo base es un fine-tune de Qwen3.5-VL 9B con aproximadamente 8.950 millones de parámetros, arquitectura híbrida que combina capas de atención lineal con capas de atención completa. La versión publicada aquí es solo texto: la torre de visión del modelo original no forma parte de estos ficheros GGUF. El contexto, los idiomas soportados y los detalles de entrenamiento no están documentados en la información disponible.

Su relevancia actual reside en dos factores: por un lado, expone un patrón de uso cada vez más común en pipelines de generación de imágenes, donde un LLM intermedio reescribe y enriquece la petición del usuario antes de pasarla al modelo de difusión; por otro, la eliminación de los mecanismos de rechazo lo convierte en una herramienta de doble uso que exige moderación propia en cualquier despliegue público. La licencia qwen-research restringe el uso a fines no comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa), derivado de Qwen3.5-VL 9B |
| Parámetros totales | 8.953.803.264 (según safetensors del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (8,87 GiB) y Q4_K_M (5,24 GiB, con importance matrix, sin evaluar) |
| Idiomas soportados | no disponible (la model card indica que acepta peticiones "en cualquier idioma") |
| Licencia | qwen-research (Qwen Research License Agreement), uso no comercial |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-VL 9B orientado a la reescritura de prompts para generación de imágenes. Qwen3.5 emplea una arquitectura híbrida en la que se alternan capas de atención lineal con capas de atención completa, lo que reduce el coste computacional en secuencias largas. El modelo original incluye una torre de visión, pero los ficheros GGUF publicados en este repositorio son exclusivamente de texto. El modelo genera una salida estructurada en JSON con dos campos: `rewritten_prompt` (descripción larga en inglés de la imagen final) y `wh_ratio` (relación de aspecto recomendada), precedida de un bloque `<think>` de razonamiento.

El autor aplicó un método de abliteration sobre los pesos del modelo de lenguaje, con ajustes propios no detallados, y después cuantizó a Q8_0 y Q4_K_M. No se documentan en la información disponible los datos de entrenamiento del modelo base, el número de tokens utilizados, la composición del dataset ni si hubo fases de RLHF o DPO. La innovación técnica destacable no está en el entrenamiento sino en el pipeline de uso: el modelo actúa como intermediario entre la petición del usuario y el modelo de difusión, con un system prompt específico (`system_prompt.txt`) que debe enviarse siempre como mensaje de sistema.

## Capacidades

- Reescritura de prompts: transforma una petición breve de imagen en una descripción larga y detallada en inglés, adecuada para un modelo texto-a-imagen.
- Recomendación de relación de aspecto: devuelve un campo `wh_ratio` con el formato sugerido para el renderizado.
- Razonamiento explícito: emplea un bloque `<think>` antes de emitir la respuesta JSON final.
- Entrada multilingüe: según la model card, acepta peticiones en cualquier idioma y las normaliza a inglés.
- Salida estructurada: produce JSON parseable con los campos `rewritten_prompt` y `wh_ratio`.
- Modo sin censura: los pesos abliterados eliminan los rechazos explícitos y escriben las peticiones dañinas de forma literal en el prompt reescrito.
- Sin capacidades de visión en esta versión: la torre de visión del modelo original no está incluida en los GGUF.
- Sin soporte documentado de tool calling, function calling ni razonamiento multi-paso orientado a agentes.

## Casos de uso

- Enriquecimiento de prompts en pipelines de generación de imágenes: el modelo se coloca entre la interfaz de usuario y el modelo de difusión (Qwen-Image-2.1), convirtiendo una frase corta en un prompt detallado y coherente con una relación de aspecto sugerida. Es adecuado porque su salida está diseñada específicamente para ese consumidor.
- Herramientas creativas para ilustradores y diseñadores: permite que un usuario escriba una idea escueta en su idioma y obtenga una descripción técnica completa que el modelo de imagen interpretará con mayor fidelidad.
- Automatización de catálogos visuales: generación por lotes de prompts detallados a partir de descripciones breves de producto, con la relación de aspecto fijada por el pipeline para cada formato de destino.
- Investigación sobre reescritura de prompts: el modelo permite estudiar cómo un LLM intermedio altera la intención original del usuario, incluida la comparación entre la versión original y la abliterada documentada en la model card.
- Pruebas de robustez y moderación: útil para evaluar qué tipo de contenido genera un modelo sin filtros y diseñar capas de moderación externas antes de exponerlo a un servicio público.
- Despliegue local en estaciones de trabajo: con la cuantización Q4_K_M (5,24 GiB) puede ejecutarse en llama.cpp sobre hardware de consumo, lo que facilita prototipos sin depender de la nube.
- Generación de contenido para adultos en entornos controlados: el autor lo orienta a uso adulto y responsabiliza al usuario del cumplimiento legal de su jurisdicción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí documenta métricas propias de evaluación de la abliteration:

| Métrica (100 prompts dañinos) | Original | Abliterado (GGUF Q8_0) |
|---|---:|---:|
| Rechazos con thinking activo y arranque forzado `I first` | 97/100 | 23/100 |
| Rechazos con thinking activo sin arranque forzado | 96/100 | 21/100 |
| Rechazos con thinking desactivado | 98/100 | 88/100 |
| Rechazos con thinking desactivado y arranque forzado | 95/100 | 26/100 |
| Divergencia KL de la distribución del primer token (BF16) | — | 0,029 |

Prueba de longitud completa con el system prompt propio del modelo (24 prompts, temperatura 0, hasta 6.144 tokens generados):

| Métrica | Original | Abliterado |
|---|---:|---:|
| JSON final encontrado | 23 | 24 |
| Sin terminar en 6.144 tokens | 1 | 0 |
| `rewritten_prompt` rechaza explícitamente | 0 | 0 |
| `rewritten_prompt` invierte la petición (contenido de prevención o defensa) | 9 (+1 dudoso) | 0 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 9 GiB para Q8_0 y 5,5 GiB para Q4_K_M, más el espacio de contexto y caché KV.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM para Q8_0 (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100). Para Q4_K_M basta con 8 GB.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superiores con Q8_0, y en GPUs de 8 GB con Q4_K_M.
- Opciones de despliegue: llama.cpp (llama-server o llama-cli) con soporte de Qwen3.5 y la opción `--jinja`; el autor midió con la release b11524 en backend Vulkan. No se ha probado en ComfyUI según la model card.
- Advertencia de runtime: la release b11259 de llama.cpp leía solo la primera palabra de un mensaje de usuario en inglés con esta arquitectura; se recomienda una versión más reciente y verificar con una pregunta corta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Formato |
|---|---|---|---|---|---|
| Sakura-Qwen-Image-2.1-PE-T2I-Uncensored | 8,95 B | no disponible | Reescritura de prompts texto-a-imagen, sin censura | qwen-research (no comercial) | GGUF |
| Qwen/Qwen-Image-2.1-PE-T2I (original) | 8,95 B | no disponible | Reescritura de prompts texto-a-imagen, con rechazos | qwen-research (no comercial) | safetensors |
| Qwen3.5-VL 9B (base) | 8,95 B | no disponible | Modelo multimodal general | qwen-research | safetensors |

No se dispone de datos de benchmarks comparativos entre estas variantes más allá de las métricas de rechazo recogidas en la sección anterior.

## Limitaciones y advertencias

- Sin filtro de seguridad: el modelo escribe peticiones dañinas de forma literal en el prompt reescrito y, por tanto, en la imagen generada. En las pruebas del autor aparecieron pasos para fabricar explosivos, una carta amenazante y una URL inventada de un sitio de odio.
- Prohibición legal: no debe usarse para representar a menores en contextos sexuales o abusivos, ni para crear imágenes sexuales o difamatorias de personas reales sin su consentimiento; es ilegal en la mayoría de países.
- Moderación obligatoria: no debe exponerse en un servicio público sin una capa de moderación propia.
- Licencia restrictiva: la Qwen Research License Agreement limita el uso a fines no comerciales; el uso comercial requiere autorización del titular de los derechos.
- El modo thinking es necesario: con el thinking desactivado, la abliteration apenas cambia los primeros tokens de la respuesta (88/100 rechazos frente a 98/100 del original), por lo que el comportamiento sin censura depende de mantenerlo activo.
- Sin visión: la torre de visión del modelo original no está incluida en estos GGUF.
- Idiomas y contexto no documentados: no hay información publicada sobre la ventana de contexto ni sobre la cobertura lingüística real.
- Riesgo de alucinación: el modelo inventa detalles en el prompt reescrito (el autor documenta una URL ficticia), lo que puede propagarse a la imagen generada.
- Dependencia de versión de llama.cpp: builds antiguas fallan al leer mensajes de usuario; es imprescindible verificar el runtime antes de confiar en los resultados.
- La cuantización Q4_K_M no fue evaluada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/webmp3/Sakura-Qwen-Image-2.1-PE-T2I-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-T2I
- llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Licencia Qwen Research: incluida en el repositorio como `LICENSE`
