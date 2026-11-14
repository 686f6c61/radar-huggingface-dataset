# vishal77796/qwen3-4b-banking77-full-lora

## Resumen

`vishal77796/qwen3-4b-banking77-full-lora` es un adaptador LoRA para el modelo base Qwen/Qwen3-4B-Instruct-2507, desarrollado por Vishal Jadhav (MSc Computer Science, RPTU Kaiserslautern-Landau). El adaptador convierte un modelo generativo de propósito general de 4.000 millones de parámetros en un clasificador de intenciones especializado en el dominio bancario: dada una consulta de un cliente, devuelve exactamente una de las 77 etiquetas del conjunto Banking77.

El modelo resuelve un problema muy concreto de enrutamiento en atención al cliente: clasificar mensajes de usuarios en intenciones como "card_arrival", "change_pin" o "refund_not_showing_up" con alta precisión. Frente a clasificadores dedicados (BERT, Dual Sentence Encoders), aprovecha el conocimiento lingüístico de un LLM instruido, lo que simplifica el pipeline al eliminar la necesidad de cabeceras de clasificación adicionales.

Es relevante por su enfoque metodológico riguroso: tres semillas entrenadas con idénticos hiperparámetros, pesos publicados fijados a priori (semilla 0) y evaluación sobre el conjunto de test completo (3.076 mensajes) y una muestra fija de 500. El adaptador ocupa solo 0,1 GB y entrena en una GPU de 24 GB en 160 minutos, lo que lo hace reproducible en hardware de consumo. La licencia Apache 2.0 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre capas lineales |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B-Instruct-2507); adaptador LoRA r=16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | fp16 en la referencia oficial; cuantizaciones GGUF/INT8 no documentadas para el adaptador |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parámetros. La configuración LoRA usa rango 16, alpha 32, dropout 0,05 y se aplica a todas las capas lineales (q, k, v, o, gate, up, down). Se entrenó con AdamW, learning rate 2e-4, 6 % de warmup y decaimiento lineal, clipping de gradiente 1.0, batch efectivo de 8 (4 × 2 acumulación), precisión fp16 con gradient scaling y checkpointing de gradiente. La pérdida se calcula únicamente sobre los tokens de respuesta.

Los datos de entrenamiento son los 9.993 ejemplos completos del split de entrenamiento de Banking77, cargados desde la copia `mteb/banking77` (subconjunto limpio del original `PolyAI/banking77`, que omite duplicados y mensajes de dos o tres palabras). Se realizaron 3 épocas sobre una única Quadro RTX 6000 de 24 GB, con 160 minutos por semilla y un pico de 9,6 GB de memoria. Se entrenaron tres semillas (0, 1 y 2) con ajustes idénticos; los pesos publicados corresponden a la semilla 0, fijada antes de ver ningún resultado de test. El prompt de sistema debe incluir las 77 etiquetas ordenadas alfabéticamente, exactamente como en el entrenamiento.

## Capacidades

- Clasificación de intenciones en dominio bancario: asigna un mensaje a una de las 77 etiquetas de Banking77.
- Salida restringida a una sola etiqueta, sin texto adicional (formato entrenado).
- Generación de texto subyacente del modelo base Qwen3-4B, aunque el adaptador está especializado en clasificación.
- No soporta rechazo de mensajes fuera de dominio: siempre devuelve una de las 77 etiquetas, incluso para entradas no bancarias.
- Sin soporte documentado de tool calling, function calling ni razonamiento multi-paso en el adaptador.
- Sin capacidades de visión, audio ni thinking mode (el modo thinking se desactiva explícitamente en el ejemplo de uso).
- Capacidades multilingües limitadas al inglés: el adaptador se entrenó solo con datos en inglés.
- No soporta la etiqueta `none_of_these`; para tráfico mixto existe el adaptador hermano `vishal77796/qwen3-4b-banking77-router-lora`.

## Casos de uso

- Enrutamiento automático de tickets de soporte bancario: cada mensaje entrante se clasifica en una de las 77 intenciones y se dirige al equipo o flujo correspondiente, con una precisión del 94,8 % sobre el test completo.
- Clasificación en producción con LLM: al ser un adaptador PEFT de 0,1 GB sobre un base de 4B, se puede servir con transformers + PEFT en una sola GPU y desplegar como microservicio de clasificación.
- Enrutamiento previo a agentes conversacionales: la etiqueta predicha selecciona la herramienta o el subagente adecuado en un sistema multiagente de atención al cliente.
- Análisis de volumen de consultas: clasificar lotes históricos de mensajes para medir la distribución de intenciones y priorizar mejoras de producto o base de conocimiento.
- Etiquetado asistido de datos: usar el adaptador para pre-etiquetar nuevos mensajes bancarios y reducir el coste de anotación humana, con revisión posterior.
- Investigación y reproducción: el adaptador y el código completo están publicados, lo que permite reproducir el estudio comparativo entre modelos pequeños y frontera para clasificación de intenciones.
- Filtrado en pipelines de atención: combinado con el adaptador router (`none_of_these`), sirve para separar mensajes bancarios de ruido antes de aplicar la clasificación de las 77 intenciones.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Conjunto de test | 3 semillas, media ± desv. | Este adaptador (semilla 0) |
|---|---|---|
| Exactitud, muestra de 500 mensajes | 0,943 ± 0,005 | 0,938 |
| Exactitud, test completo (3.076) | 0,947 ± 0,003 | 0,948 |
| Respuestas que son una de las 77 etiquetas, test completo | 0,9998 ± 0,0002 | 0,9997 |

Se detectaron 6 mensajes de test que aparecen en el split de entrenamiento una vez normalizados (0 coincidencias exactas). Eliminarlos no altera la exactitud de ninguna semilla en tres decimales.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 8 GB para el modelo base de 4B más el adaptador de 0,1 GB.
- GPU de referencia del autor: 1 × Quadro RTX 6000 (24 GB) para entrenamiento, con un pico de 9,6 GB.
- Cabe en GPUs de consumo con al menos 8-10 GB de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060 Ti 16 GB, RTX 4070 en adelante).
- Opciones de despliegue: transformers + PEFT (referencia oficial con transformers 5.22.2, peft 0.21.2, torch 2.15.0), vLLM con soporte de adaptadores LoRA, TGI y llama.cpp/Ollama previa conversión a GGUF del modelo base y fusión del adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.
- El prompt de sistema debe incluir las 77 etiquetas ordenadas; la generación usa `max_new_tokens=16` y decodificación greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-banking77-full-lora | 4B (base) + LoRA r=16 | no disponible | LLM generativo con adaptador para 77 intenciones | apache-2.0 | Hugging Face |
| qwen3-4b-banking77-router-lora (hermano) | 4B (base) + LoRA r=16 | no disponible | Igual, con soporte de `none_of_these` | apache-2.0 | Hugging Face |
| Dual Sentence Encoders (Casanueva et al., 2020) | no disponible | no disponible | Clasificador dedicado de intenciones sobre Banking77 | no disponible | no disponible |
| Clasificadores BERT sobre Banking77 | no disponible | no disponible | Fine-tuning de encoder para 77 clases | no disponible | no disponible |

No se dispone de resultados numéricos de los sistemas comparables en la información proporcionada; el autor remite al informe del repositorio para las comparaciones detalladas.

## Limitaciones y advertencias

- No fue entrenado para rechazar mensajes fuera de alcance: devuelve una de las 77 etiquetas para cualquier entrada, incluidas consultas no bancarias. Para tráfico mixto, usar el adaptador router.
- Entrenado solo en inglés; el rendimiento en otros idiomas no está evaluado.
- El prompt de sistema debe replicarse exactamente (las 77 etiquetas ordenadas), ya que el adaptador se ajustó a esa plantilla.
- Riesgo de alucinación de etiquetas mitigado parcialmente por la normalización y validación contra el conjunto de etiquetas, pero el modelo puede generar salidas no válidas en entradas atípicas (0,03 % de respuestas no etiqueta en el test completo).
- El conjunto de test contiene 6 mensajes que solapan con el entrenamiento tras normalización; el impacto medido es nulo a tres decimales, pero conviene tenerlo en cuenta.
- El autor declara los resultados como no verificados de forma independiente (`verified: false`).
- La licencia Apache 2.0 permite uso comercial tanto del adaptador como del código, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia que debe revisarse por separado.
- El dataset Banking77 está bajo CC BY 4.0 (PolyAI, Casanueva et al., 2020).
- No hay documentación sobre cuantizaciones del adaptador ni sobre latencia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vishal77796/qwen3-4b-banking77-full-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Adaptador router hermano: https://huggingface.co/vishal77796/qwen3-4b-banking77-router-lora
- Código, datos y evaluación completa: https://github.com/Vc555s/small-vs-frontier
- Dataset Banking77 (copia mteb): https://huggingface.co/datasets/mteb/banking77
- Dataset original PolyAI/banking77: https://huggingface.co/datasets/PolyAI/banking77
