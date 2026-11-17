# yblee-dacon/kojev-4b

## Resumen

kojev-4b es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario yblee-dacon, que implementa un clasificador de opciones múltiples para coreano. A diferencia de un LLM generativo convencional, el modelo recibe un estado (reglas o hechos), una pregunta y entre 2 y 8 opciones, y devuelve únicamente una distribución de probabilidad sobre las opciones en un solo pase hacia delante, sin generar texto. Está diseñado específicamente para tareas de juicio o clasificación con abstención: cuando la evidencia disponible no permite decidir, el modelo devuelve "abstención" si la probabilidad máxima queda por debajo de 0,6.

El modelo se construye sobre la parte textual del transformer Qwen3.5-4B-Base (32 capas, dimensión oculta 2560), con los pesos del cuerpo congelados y sin la parte de visión. Sobre esa base se añade un adaptador LoRA (r=16, alpha=32) en las proyecciones de atención y FFN, más una cabeza "pointer" de dos capas lineales (2560→256) que puntúa la posición de juicio y el final de cada opción mediante producto interno de estados ocultos. Una temperatura de calibración posterior (T=1,55) ajusta las probabilidades finales.

La relevancia de este modelo reside en su enfoque: sustituye la generación autoregresiva por una clasificación directa y calibrada con abstención explícita, lo que reduce la latencia (73,6 ítems/s frente a 23,1 o 1,4 de un LLM de 27B en modo thinking) y mitiga las respuestas inventadas cuando falta información. Está pensado para dominios con reglas explícitas, como la validación de normativa administrativa o la clasificación documental en coreano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B-Base, parte textual) + adaptador LoRA + cabeza pointer lineal |
| Parámetros totales | 4B (modelo base, congelado); adaptador LoRA r=16 y cabeza pointer 2560→256 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 768 tokens de entrada máxima (límite de entrenamiento) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de Qwen) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 (adaptador y cabeza); datos de entrenamiento parcialmente CC BY-SA 4.0 (KoBEST, KLUE) |
| Formato de pesos | safetensors (adapter_model.safetensors, pointer_head.safetensors); requiere PEFT |

## Arquitectura y entrenamiento

El modelo reutiliza el cuerpo textual de Qwen3.5-4B-Base (32 capas, hidden 2560) con los pesos congelados y elimina la torre de visión. Sobre él se entrena un adaptador LoRA con r=16 y alpha=32 aplicado a siete proyecciones (q, k, v, o, gate, up, down_proj), y se añade una cabeza pointer compuesta por dos capas lineales (2560→256) que calcula un producto interno entre el estado oculto en la posición `[판정]` y el estado oculto al final de cada opción, produciendo una puntuación por opción. La salida final es un softmax con temperatura de calibración T=1,55; si la probabilidad máxima es inferior a 0,6, el modelo se abstiene. No se utiliza la cabeza LM, por lo que no es compatible con `transformers.generate`.

El entrenamiento empleó 78.964 filas (de un total de 88.498 filas públicas en el dataset yblee-dacon/kojev-4b-data), compuestas por ejemplos con respuesta correcta, ejemplos sin evidencia suficiente con opción "no se sabe", y preguntas con premisas inconsistentes. Los datos provienen de generación propia (juicios generales, reglas de negocio, aplicación de terminología) y de los splits de entrenamiento de KoBEST y KLUE. El objetivo es de entropía cruzada: en filas con respuesta, la opción correcta recibe probabilidad 1,0; en filas sin respuesta posible, se aplica una distribución uniforme sobre las opciones. Se entrenó durante 2 épocas, batch 8, learning rate 5e-5, longitud máxima de entrada 768 tokens, en bf16, sobre una NVIDIA H100 del centro AICA (Gwangju), con un tiempo total de 126 minutos.

## Capacidades

- Clasificación de opciones múltiples (2 a 8 opciones) en coreano, devolviendo probabilidades calibradas por opción.
- Abstención explícita cuando la evidencia es insuficiente (probabilidad máxima < 0,6).
- Juicio condicionado a reglas o hechos proporcionados en el estado de entrada (razonamiento deductivo simple sobre normativa).
- Manejo de preguntas con premisas inconsistentes o sin base en el estado.
- Reconocimiento de la opción "no se sabe" o "알 수 없음" cuando está presente entre las opciones.
- Inferencia en un solo pase hacia delante (sin decodificación autoregresiva), lo que permite alto throughput.
- No soporta tool calling, agentes, generación de texto libre, visión ni audio.

## Casos de uso

- Validación de elegibilidad en prestaciones sociales: dado un conjunto de reglas administrativas (por ejemplo, edad y umbral de renta) y los datos del solicitante, el modelo clasifica entre "conceder" o "denegar" con una probabilidad calibrada, y se abstiene si los datos no cubren el supuesto.
- Clasificación de tickets de soporte en coreano: con un estado que describe las categorías y políticas de la empresa, el modelo asigna el ticket a una de las opciones en un solo pase, con latencia muy baja (73,6 ítems/s en H100), adecuado para volúmenes altos.
- Enrutamiento de consultas en atención al cliente: clasificar la intención del usuario entre 2-8 categorías predefinidas, con abstención cuando la consulta es ambigua, derivando esos casos a un agente humano.
- Verificación de cumplimiento normativo en documentos: dado un fragmento de normativa como estado y una pregunta sobre si una cláusula se aplica, el modelo devuelve la probabilidad de cada interpretación, útil como filtro previo a revisión legal.
- Evaluación automática de exámenes tipo test en coreano: con el enunciado y las opciones, el modelo produce una distribución de probabilidad que puede usarse para puntuar o para detectar ítems mal formulados (alta entropía).
- Deduplicación y clasificación de registros con reglas de negocio: aplicar reglas explícitas de negocio a pares de registros y decidir si son duplicados, con abstención cuando las reglas no cubren el caso.
- Moderación de contenido basada en políticas: dado un conjunto de políticas como estado y un texto como pregunta, clasificar entre "permitido", "revisar" o "bloqueado", con abstención cuando la política no es concluyente.

## Benchmarks y rendimiento

Evaluación sobre un conjunto fijo de 3.132 preguntas no vistas en entrenamiento. El modelo comparativo es Qwen3.8-27B (FP8, vLLM) con instrucción de responder "no se sabe" cuando el estado no basta.

| Conjunto | Métrica | Ítems | LLM thinking off | LLM thinking on | kojev-4b |
|---|---|---|---|---|---|
| Preguntas con respuesta | Tasa de acierto | 1.079 | 91,1% | 95,7% | 97,8% |
| Benchmarks no vistos (KMMLU, Belebele, CLIcK, APEACH) | Tasa de acierto | 800 | 72,9% | 77,4% | 62,1% |
| Debe abstenerse | Tasa de abstención | 803 | 64,6% | 82,6% | 84,7% |
| Con opción "no se sabe" | Tasa de acierto | 450 | 83,6% | 77,8% | 88,7% |

Una versión entrenada solo con filas con respuesta, con la misma estructura, obtuvo 14,7% de abstención y 48,4% de acierto con la opción "no se sabe".

Rendimiento (H100, 32 ítems concurrentes): kojev-4b 73,6 ítems/s; LLM thinking off 23,1 ítems/s; LLM thinking on 1,4 ítems/s.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3.5-4B en bf16 requiere aproximadamente 8-9 GB; el adaptador LoRA y la cabeza pointer añaden menos de 0,1 GB (el repositorio completo ocupa 0,1 GB). En cuantización de 4 bits, el modelo base puede ocupar unos 2,5-3 GB.
- GPU recomendadas: NVIDIA H100 (usada en el entrenamiento y las pruebas de throughput), A100 40/80 GB, L40S. Para inferencia en producción con batching alto se recomienda A100 o H100.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16; en RTX 4060 Ti (16 GB) o RTX 4070 (12 GB) es viable con cuantización de 4 u 8 bits.
- Opciones de despliegue: no es compatible con `transformers.generate`; debe usarse el script `jev_infer.py` proporcionado por el autor (funciones `load` y `judge`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, dado que el modelo no usa la cabeza LM.
- Latencia y throughput: 73,6 ítems/s en H100 con 32 ítems concurrentes; el modelo comparativo de 27B rinde 23,1 ítems/s (thinking off) y 1,4 ítems/s (thinking on). No hay datos de latencia individual publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kojev-4b | 4B (base congelado) + LoRA | 768 tokens | Clasificación con abstención, un pase | Apache 2.0 | Hugging Face (adaptador + script) |
| Qwen3.8-27B (FP8) | 27B | no disponible | LLM generativo con instrucción de abstención | no disponible | no disponible |
| Qwen3.5-4B-Base | 4B | no disponible | LLM generativo base | Apache 2.0 | Hugging Face |

La comparación directa con Qwen3.8-27B en la tabla de benchmarks muestra que kojev-4b supera al LLM grande en preguntas con evidencia (97,8% frente a 95,7% con thinking) y en abstención (84,7% frente a 82,6%), pero queda por debajo en benchmarks de conocimiento general no vistos (62,1% frente a 77,4%), donde el LLM de 27B aporta conocimiento paramétrico que kojev-4b no tiene. No se dispone de comparativas con otros clasificadores coreanos especializados.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto libre ni responder preguntas abiertas; solo clasifica entre opciones predefinidas.
- En problemas de conocimiento general o especializado sin reglas explícitas en el estado, rinde peor que un LLM de 27B (62,1% frente a 77,4% en benchmarks no vistos).
- No se entrenó en cálculo de fechas ni en aritmética; los cálculos numéricos deben hacerse por código y delegar al modelo solo el juicio semántico.
- Límite de 768 tokens de entrada: no apto para documentos largos ni para contextos que superen esa longitud.
- No apto para evaluación de respuestas abiertas; solo para opciones cerradas.
- La licencia del adaptador es Apache 2.0, pero parte de los datos de entrenamiento (KoBEST, KLUE) es CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir igual sobre derivados del dataset.
- No hay información publicada sobre sesgos específicos del modelo; al entrenarse sobre KoBEST y KLUE, puede heredar los sesgos presentes en esos corpus.
- Riesgo de calibración inadecuada fuera de la distribución de entrenamiento: el umbral de abstención de 0,6 y la temperatura T=1,55 se ajustaron sobre datos propios y pueden no transferirse a otros dominios.
- El repositorio tiene 53 descargas y 0 likes en el momento de la consulta; es un modelo reciente (noviembre de 2026) sin validación independiente por la comunidad.
- El uso en producción requiere integrar el script `jev_infer.py` y gestionar manualmente el ensamblado de la plantilla de entrada (`[상태]`, `[질문]`, `[보기]`, `[판정]`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yblee-dacon/kojev-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/yblee-dacon/kojev-4b-data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Perfil del autor: https://huggingface.co/yblee-dacon
