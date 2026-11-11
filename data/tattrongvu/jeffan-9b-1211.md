# tattrongvu/Jeffan-9B-1211

## Resumen

Jeffan-9B-1211 es un modelo de investigación derivado de Qwen3.5-9B, desarrollado por el usuario tattrongvu, orientado a la toma de decisiones estructurada. A diferencia de los modelos generativos convencionales, Jeffan no produce texto: recibe un estado (un documento, una conversación, una lista de herramientas) junto con una o varias preguntas de opción múltiple y devuelve, en un único forward pass, una distribución de probabilidad sobre las opciones disponibles. El modelo está pensado para aplicaciones de clasificación y enrutamiento donde se necesita una decisión calibrada en lugar de una respuesta en lenguaje natural.

Técnicamente, Jeffan-9B-1211 parte de los pesos de Qwen3.5-9B (8.950 millones de parámetros en bf16) e introduce dos modificaciones principales: atención bidireccional en las capas de atención completa (manteniendo causales las capas de atención lineal Gated DeltaNet) y un bucle de capas en los bloques intermedios (4-7, 8-11, 12-15) que se ejecuta P veces por forward pass, con P configurable en inferencia y valor por defecto 2. El contexto admitido es de hasta 65.536 tokens con el motor de inferencia propio.

El modelo es relevante porque aborda un nicho poco cubierto: los modelos de lenguaje habituales no están optimizados para emitir probabilidades calibradas sobre opciones discretas en una sola pasada, y los clasificadores tradicionales no manejan estados largos y estructurados. Jeffan se publica bajo licencia Apache 2.0 y está integrado con el Decision Index kit, lo que facilita su evaluación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa bidireccional + capas de atención lineal Gated DeltaNet causales), con bucle de capas |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 65.536 tokens con el motor de inferencia propio |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), con código remoto `modeling_jeffan.py` |

## Arquitectura y entrenamiento

Jeffan-9B-1211 reutiliza la arquitectura de Qwen3.5-9B, un transformer híbrido que combina capas de atención completa con capas de atención lineal basadas en Gated DeltaNet. Sobre esa base, el autor introduce dos cambios que alteran el comportamiento del modelo sin modificar los pesos: en primer lugar, las capas de atención completa pasan a usar una máscara bidireccional, de modo que cada token del prompt puede atender a cualquier otro token del prompt, mientras que las capas de atención lineal permanecen causales. En segundo lugar, los bloques de capas intermedias (4-7, 8-11 y 12-15) se ejecutan P veces por forward pass con una actualización amortiguada en fp32 (`x ← x + (block(x) − x) / P`), sin parámetros adicionales; P se fija en inferencia y vale 2 por defecto.

El modelo mantiene el tokenizador y la plantilla de chat del modelo base. La salida se obtiene leyendo la distribución del siguiente token sobre los códigos de opción (A, B, …) en un formato de prompt fijo con líneas `State:`, `Question:` y `Options:`. No se ha publicado información sobre el volumen o la composición del dataset de ajuste, ni sobre si hubo RLHF o DPO; la model card describe el modelo como "first release" de investigación.

## Capacidades

- Clasificación y decisión estructurada: devuelve una probabilidad por opción (hasta 255 opciones distintas) a partir de un estado y una pregunta de opción múltiple, en un único forward pass.
- Entrada de estado flexible: acepta texto o cualquier objeto serializable en JSON como estado.
- Soporte de opciones ordenadas: el parámetro `ordered_levels=True` añade una línea para opciones que representan niveles ordenados (una puntuación).
- Contexto largo: hasta 65.536 tokens de prompt con el motor de inferencia propio, sin truncamiento.
- Enrutamiento y selección de herramientas: la model card menciona listas de herramientas como ejemplo de estado de entrada.
- Configuración de coste/calidad en inferencia: el número de pasadas del bucle de capas (1, 2, 3 o 4) permite intercambiar latencia por precisión.
- No genera texto: no es un modelo de chat ni de generación libre; su salida es exclusivamente una distribución de probabilidad sobre las opciones.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia (por ejemplo, un pedido con la pantalla rota), el modelo devuelve la probabilidad de cada equipo o cola de destino en una sola pasada, como ilustra la model card con el ejemplo del ticket #1042 y las opciones Billing, Shipping damage claims y Technical support. Adecuado por su salida calibrada y su bajo coste por consulta.
- Selección de herramientas en agentes: con una lista de herramientas disponibles como estado y una pregunta sobre cuál usar, Jeffan devuelve la probabilidad de cada herramienta, lo que permite implementar un paso de decisión determinista y auditable dentro de un pipeline de agentes.
- Clasificación de documentos largos: gracias a los 65.536 tokens de contexto, puede clasificar contratos, informes o hilos de conversación completos sin truncar, algo que los clasificadores clásicos no permiten.
- Triaje de conversaciones multi-turno: el estado puede ser un historial de conversación serializado en JSON; el modelo decide la siguiente acción o categoría con una distribución de probabilidad que permite fijar umbrales de confianza.
- Evaluación comparativa de modelos de decisión: al estar integrado con el Decision Index kit, sirve como motor de referencia para medir y comparar el rendimiento de modelos en tareas de decisión estructurada sobre el conjunto público del kit.
- Puntuación de opciones ordenadas: con `ordered_levels=True`, puede asignar una puntuación a niveles ordenados (por ejemplo, severidad o prioridad), útil en sistemas de priorización.
- Despliegue de alta concurrencia: con vLLM y una sola pasada del bucle, la latencia mediana es de 29 ms por petición en una B300, lo que lo hace viable para servicios de clasificación en tiempo real.

## Benchmarks y rendimiento

La model card reporta resultados sobre el Decision Index kit (muestra fija del conjunto público de 4.150 peticiones, HLE excluido) y sobre un conjunto de latencia de 700 peticiones, medidos en una NVIDIA B300.

| Configuracion | Indice (kit) | Latencia mediana | Latencia media | p95 |
|---|---|---|---|---|
| 2 pasadas (por defecto) | 69,8 | 74 ms | 97 ms | 205 ms |
| 3 pasadas | 70,0 | no disponible | no disponible | no disponible |
| 1 pasada (vLLM) | 66,9 | 29 ms | 42 ms | 87 ms |
| 1 pasada (transformers) | 66,9 | ~0,6x la de 2 pasadas | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los valores de latencia corresponden a una única GPU B300 y no deben extrapolarse sin medición propia.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18 GB solo para pesos (8,95B parámetros × 2 bytes), más memoria para el contexto; con 65.536 tokens de contexto el consumo crece de forma notable, por lo que se recomienda al menos 24-40 GB según la longitud de prompt.
- GPU recomendadas: NVIDIA B300 (verificada por el autor), A100 40/80 GB, H100, y GPUs de consumo de gama alta con 24 GB o más (RTX 4090, RTX 3090) para prompts cortos y una sola pasada.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con prompts moderados en bf16; para contextos largos conviene cuantización, aunque no se documentan formatos GGUF oficiales.
- Opciones de despliegue: transformers con `trust_remote_code=True` (código remoto `modeling_jeffan.py`), el paquete `jeffan_engine` incluido en `inference/`, el pipeline del Decision Index kit, y vLLM (limitado a 1 pasada del bucle de capas).
- Latencia y throughput: en una B300, 29 ms de mediana y 87 ms de p95 por petición con vLLM a 1 pasada; 74 ms de mediana y 205 ms de p95 con 2 pasadas en el motor propio.
- Dependencias verificadas: PyTorch 2.14.1, transformers 5.17.0, flash-linear-attention 0.5.2 y causal-conv1d 1.7.0 (opcional).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeffan-9B-1211 | 8,95B | 65.536 tokens | Decisión estructurada con probabilidades por opción | Apache 2.0 | Hugging Face, código remoto e `inference/` |
| Qwen3.5-9B (base) | 9B (aprox.) | No disponible en la información | Generación de texto causal | Apache 2.0 | Hugging Face |
| Clasificadores tipo BERT | Típicamente 0,1-0,3B | 512 tokens típicos | Clasificación supervisada de etiquetas fijas | Variable | Hugging Face |

La comparación con el modelo base es la más directa: Jeffan reutiliza sus pesos pero cambia la máscara de atención y añade el bucle de capas, de modo que no es equivalente a Qwen3.5-9B en modo generativo. Frente a clasificadores BERT, Jeffan ofrece contexto mucho mayor y opciones definidas en tiempo de inferencia, a cambio de un coste computacional muy superior. No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación en primera versión: el autor lo etiqueta como "first release" y no documenta un proceso de validación más allá del kit de evaluación.
- No genera texto: cualquier uso que requiera respuestas en lenguaje natural queda fuera de su alcance.
- Formato de prompt rígido: los resultados dependen del formato exacto (línea de sistema fija, `State:`, `Question:`, `Options:`); otros formatos pueden degradar las probabilidades.
- Dependencia de código remoto: la máscara bidireccional y el bucle de capas se implementan en `modeling_jeffan.py`; ejecutar los pesos con la máscara causal estándar produce un modelo distinto.
- vLLM no aplica el bucle de capas: sirve 1 pasada, lo que reduce el índice de 69,8 a 66,9 en el kit; para el comportamiento por defecto hay que usar transformers o el motor propio.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe ni sobre sesgos lingüísticos.
- Riesgo de calibración: las probabilidades de salida no están validadas fuera del kit; conviene calibrar y fijar umbrales con datos propios antes de usarlas en producción.
- Sesgos y alucinación: al no generar texto, el riesgo de alucinación textual es bajo, pero persisten los sesgos heredados de Qwen3.5-9B en la representación del estado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y las dependencias (flash-linear-attention, causal-conv1d) deben verificarse por separado.
- Memoria: el contexto de 65.536 tokens exige VRAM considerable; no se documentan cuantizaciones oficiales para reducirla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tattrongvu/Jeffan-9B-1211
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Decision Index kit: https://github.com/apolinario/decision-index
- Documentación del motor de inferencia: `inference/README.md` dentro del repositorio del modelo
