# Taggert2222/gpt-oss-20b-antidoom

## Resumen

`Taggert2222/gpt-oss-20b-antidoom` es un fine-tune del modelo abierto `openai/gpt-oss-20b` (20.914.757.184 parámetros, arquitectura MoE) al que se le ha fusionado un adaptador LoRA orientado a reducir los bucles de repetición. Lo desarrolla el usuario Taggert2222 aplicando el método Antidoom de Liquid AI, basado en un ajuste de preferencias de un solo token (FTPO): en lugar de reentrenar el modelo, se le enseña a preferir el token alternativo frente al token que inicia un bucle degenerado. El resultado se sirve exactamente igual que el modelo original, con el mismo tamaño, tokenizador, plantilla de chat harmony y velocidad.

El problema que resuelve es concreto y medible: gpt-oss-20b entra en bucles de repetición con frecuencia cuando se le pide un esfuerzo de razonamiento alto. Según las evaluaciones del autor sobre 200 prompts reservados, el modelo original loopeba en 79/200 casos (39,5 %) con effort `high` y en 17/200 (8,5 %) con effort `medium`; este fine-tune baja a 2/200 (1,0 %) y 0/200 respectivamente. Además, la precisión graduada sobre 700 ítems (GSM8K, MATH-500, MMLU, CommonsenseQA) sube del 78,4 % al 83,0 % con effort `medium`, lo que sugiere que muchos fallos del modelo base eran en realidad bucles o agotamiento de tokens.

Es relevante ahora porque los bucles de repetición son uno de los principales lastres en producción de agentes con modelos de razonamiento: encarecen las respuestas, rompen el formato de las tool calls y obligan a timeouts agresivos. La propuesta mantiene la licencia Apache 2.0, el formato harmony y el soporte de tool calling, de modo que se puede usar como reemplazo directo en despliegues vLLM sin tocar el pipeline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), activaciones SwiGLU y attention sinks aprendidos (heredada de gpt-oss-20b) |
| Parámetros totales | 20.914.757.184 (20,9 B) |
| Parámetros activos | no disponible en la información proporcionada; el modelo base es MoE, pero el número de parámetros activos no se detalla en las fuentes consultadas |
| Longitud de contexto | no disponible en la información proporcionada; se hereda la ventana del modelo base `openai/gpt-oss-20b` (el entrenamiento del adaptador usó secuencias de 5.120 tokens) |
| Tipos de cuantización | MXFP4 nativo en los expertos (4 bits); tag `8-bit`; tensores de atención en bf16; adaptador LoRA sin fusionar en bf16 |
| Idiomas soportados | no disponible en la información proporcionada (los del modelo base) |
| Licencia | Apache 2.0, con aplicación de la política de uso de gpt-oss de OpenAI |
| Formato de pesos | safetensors (checkpoint fusionado, 14,3 GB de repo); adaptador LoRA sin fusionar en `adapter/` |

## Arquitectura y entrenamiento

El modelo es el checkpoint original de gpt-oss-20b con un LoRA fusionado en las proyecciones de atención. El adaptador tiene rango 256 y alpha 128, se aplicó sobre `q_proj`, `k_proj`, `v_proj` y `o_proj` en las 24 capas, con learning rate 1,5e-5 y parada temprana en el paso 25. La fusión se hizo como `W + (alpha/r)·B·A` en fp32 sobre los 96 tensores de atención en bf16; los expertos MXFP4, los embeddings, el router y `lm_head` conservan los bytes originales. Por eso el tamaño y las formas de los tensores son idénticos a los del modelo stock y la velocidad de servicio no cambia.

El entrenamiento sigue el método Antidoom de Liquid AI: se minaron 2.959 pares de preferencia a partir de los prompts de `LiquidAI/antidoom-mix-v1.0` con esfuerzo `medium` y `high`, incluyendo tareas de código con tool calling renderizadas con la plantilla de chat exacta del servicio. Cada par enfrenta el token que inicia el bucle (rechazado) contra las alternativas de mayor log-probabilidad del propio modelo (elegido). El ajuste es FTPO, una preferencia de un solo token, no un SFT clásico. Se ejecutó en bf16 con atención eager y longitud máxima de 5.120 tokens sobre dos Intel Arc Pro B70, y el adaptador se fusionó de vuelta en el checkpoint MXFP4 original.

## Capacidades

- Generación de texto y razonamiento multi-paso con niveles de esfuerzo (`low`, `medium`, `high`) heredados del formato harmony de gpt-oss.
- Tool calling y function calling compatibles con el parser `openai` de vLLM y con `--enable-auto-tool-choice`.
- Sesiones de agente multi-turno en streaming: 0 fallos de formato en 2 × 16 sesiones según las pruebas del autor.
- Generación de código dentro de tool calls: 57/72 llamadas correctas, mismo resultado que el modelo stock.
- Razonamiento matemático y de sentido común: 83,0 % de precisión graduada en 700 ítems (GSM8K, MATH-500, MMLU, CommonsenseQA) frente al 78,4 % del stock.
- Reducción drástica de bucles de repetición, especialmente en effort `high`, manteniendo la longitud de razonamiento.
- Capacidades multimodales, de audio o de visión: no disponible en la información proporcionada; el modelo se etiqueta como `text-generation`.
- Idiomas: no disponible en la información proporcionada.

## Casos de uso

- Agentes de código de larga duración: en el arnés de agentes del autor, 20 de 28 tareas verificadas en disco pasaron frente a 17 del stock. El modelo es adecuado porque mantiene el tool calling intacto y evita que el agente se quede repitiendo el mismo comando o la misma línea de razonamiento.
- Servicio drop-in en vLLM: basta con `vllm serve <repo> --served-model-name gpt-oss --tool-call-parser openai --enable-auto-tool-choice --reasoning-parser openai_gptoss`. Mismos tensores y formas que el original, por lo que no hay que recalibrar límites de memoria ni cambiar el tokenizador.
- Razonamiento con esfuerzo alto sin colapso: con `high` el stock loopeba en el 39,5 % de los prompts y este modelo en el 1,0 %, así que se puede subir el esfuerzo en tareas de matemáticas o análisis sin asumir ese coste.
- Evaluación y benchmarking de modelos: útil como baseline "sin bucles" para separar fallos reales de capacidad de fallos por degeneración, algo que el propio autor documenta (47 ítems arreglados, 15 roto, McNemar p < 0,001).
- Chat conversacional multi-turno con contexto largo: al reducir respuestas degeneradas, la mediana de tokens de salida baja de 418 a 305 en el conjunto de bucles, lo que abarata conversaciones con historial extenso.
- Pipelines de CI/CD con invocación de herramientas: el modelo mantiene estable el formato de las tool calls en streaming, lo que permite integrarlo en automatizaciones que parsean JSON de llamadas a funciones y abortan ante formato inválido.
- Despliegue sobre aceleradores Intel: el autor lo entrena y sirve en Intel Arc Pro B70 con vLLM 0.31 (build XPU), una alternativa a las pilas CUDA habituales.

## Benchmarks y rendimiento

Evaluaciones propias del autor, octubre de 2026, mismo servidor y mismo build de vLLM 0.31 (XPU) para ambos modelos. Muestras pequeñas: las diferencias de un dígito deben leerse como ruido.

| Métrica | gpt-oss-20b stock | gpt-oss-20b-antidoom |
|---|---|---|
| Bucles de repetición, 200 prompts reservados, effort medium | 17/200 (8,5 %) | 0/200 (0,0 %) |
| Bucles de repetición, mismos 200, effort high | 79/200 (39,5 %) | 2/200 (1,0 %) |
| Precisión graduada, 700 ítems (GSM8K, MATH-500, MMLU, CommonsenseQA), medium | 78,4 % | 83,0 % |
| Código dentro de tool call (sonda PTC), 72 llamadas, medium | 57/72 | 57/72 |
| Sesiones de tool calling multi-turno en streaming (2 × 16), fallos de formato | 0 | 0 |
| Tareas de agente de código, 28 por modelo, verificadas en disco | 17 pasan | 20 pasan |
| Mediana de tokens de finalización en el conjunto de bucles, medium | 418 | 305 |

Datos adicionales: el análisis pareado sobre los 700 ítems indica 47 arreglados y 15 roto (McNemar p < 0,001); muchas correcciones corresponden a ítems donde el stock loopeba o agotaba tokens. En una prueba de soak de 4 horas con 16 flujos concurrentes, el modelo respondió 5.180 peticiones con un error de proxy, ningún error de servidor y aproximadamente un 0,1 % de generaciones en bucle.

## Requisitos de hardware

- VRAM estimada: el repo pesa 14,3 GB, de modo que el checkpoint MXFP4 necesita del orden de 14-16 GB de VRAM para pesos, más overhead de KV cache. No se han publicado cifras medidas de VRAM en la información disponible.
- GPU recomendadas: el autor solo valida Intel Arc Pro B70 (dos unidades para el entrenamiento, con vLLM 0.31 build XPU). Para el resto de GPUs no hay pruebas publicadas.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 16 GB (RTX 4080, 4070 Ti Super) con margen ajustado y en 24 GB (RTX 4090, RTX 3090) con holgura, aunque esto no está verificado por el autor.
- Opciones de despliegue: vLLM (opción documentada, con `--tool-call-parser openai`, `--enable-auto-tool-choice` y `--reasoning-parser openai_gptoss`) y transformers (librería declarada). No se publica GGUF, por lo que llama.cpp y Ollama no están soportados de forma nativa en este repo.
- Throughput: 5.180 peticiones en 4 horas con 16 flujos concurrentes en el soak del autor.
- Latencia: igual que el modelo stock, ya que los tensores y las formas son idénticos; la ganancia práctica viene de respuestas más cortas (mediana de 305 tokens frente a 418).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Foco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b-antidoom | 20,9 B (MoE) | no disponible | Eliminar bucles de repetición manteniendo tool calling | Apache 2.0 | Hugging Face, 0 descargas, 0 likes en la fecha de consulta |
| openai/gpt-oss-20b | 20,9 B (MoE) | no disponible | Modelo abierto de razonamiento de OpenAI | Apache 2.0 + política de uso | Hugging Face, ampliamente desplegado |
| openai/gpt-oss-120b | 117 B (MoE) | no disponible | Variante grande de la misma familia | Apache 2.0 + política de uso | Hugging Face, requiere hardware de mayor capacidad |

No se dispone de datos verificables en la información proporcionada sobre otros fine-tunes anti-bucle comparables ni sobre modelos de terceros con la misma corrección. Frente al stock, la diferencia medida es de 17/200 a 0/200 bucles en `medium` y de 79/200 a 2/200 en `high`, con una mejora de 4,6 puntos en precisión graduada; frente a gpt-oss-120b no hay comparación directa publicada en las fuentes consultadas.

## Limitaciones y advertencias

- Evaluaciones pequeñas y de una sola pasada: todas las cifras provienen de pruebas propias del autor, ejecutadas una vez, sobre Intel XPU con vLLM 0.31. No se han probado otras GPUs ni otros motores de inferencia.
- Herencia del modelo base: conocimiento, comportamiento de seguridad y sesgos son los de gpt-oss-20b. El riesgo de alucinación no se reduce con este fine-tune.
- Tool calls narradas: igual que el stock, en prompts de agente largos el modelo a veces escribe la llamada a herramienta o un resultado inventado como texto en lugar de invocar la herramienta. El autor identifica dos mensajes del arnés como desencadenantes (una nota de estado con rol de usuario a mitad de turno y un resultado de herramienta que suena a tarea terminada); entrenar contra ello rompió otros comportamientos.
- Longitud de entrenamiento limitada: el adaptador se entrenó con secuencias de 5.120 tokens, por debajo de la ventana del modelo base, así que el comportamiento más allá de esa longitud no está validado.
- Licencia: Apache 2.0 permite uso comercial, pero se aplica la política de uso de gpt-oss de OpenAI, que impone restricciones adicionales de uso aceptable.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, y una única fuente de evaluación (el propio autor). No hay validación independiente.
- Idiomas: no se documenta qué idiomas cubre ni si el fine-tune afecta al rendimiento en idiomas distintos del inglés, que es el idioma de los prompts de entrenamiento.
- Formato: no se publican pesos GGUF ni cuantizaciones de menor precisión que el MXFP4 nativo, lo que limita el despliegue en entornos de CPU o en GPUs con poca VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Taggert2222/gpt-oss-20b-antidoom
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Repositorio del método Antidoom (Liquid AI): https://github.com/Liquid4All/antidoom
- Cookbook del autor (receta completa, scripts y mediciones): https://github.com/Treggat/B70-Vllm-Cookbook/tree/main/gpt-oss-20b
- Dataset de prompts antidoom-mix-v1.0: https://huggingface.co/datasets/LiquidAI/antidoom-mix-v1.0
- Paper Antislop: https://arxiv.org/abs/2510.15061
- Model card oficial de gpt-oss (OpenAI): https://openai.com/index/gpt-oss-model-card/
- Política de uso de gpt-oss: https://github.com/openai/gpt-oss/blob/main/USAGE_POLICY
- Ficha de gpt-oss-20b en NVIDIA NIM: https://build.nvidia.com/openai/gpt-oss-20b/modelcard
- Documentación de gpt-oss-20b en la API de OpenAI: https://developers.openai.com/api/docs/models/gpt-oss-20b
