# tattrongvu/Jeffan-27B-1211

## Resumen

Jeffan-27B-1211 es un modelo de investigación derivado de Qwen/Qwen3.8-27B (licencia Apache 2.0), publicado por el usuario tattrongvu en Hugging Face. No es un generador de texto al uso: se trata de un modelo de clasificación y toma de decisiones estructuradas. Recibe como entrada un estado (un documento, una conversación, una lista de herramientas) y una o varias preguntas de opción múltiple sobre ese estado, y devuelve una distribución de probabilidad sobre los códigos de las opciones (A, B, C…) en un único forward pass, sin generar ningún token de texto.

Técnicamente incorpora dos modificaciones sobre la arquitectura base: atención bidireccional en las capas de atención completa (las capas de atención lineal Gated DeltaNet permanecen causales) y un bucle de capas en los bloques intermedios (24-35 y 36-47) con actualización amortiguada en fp32 y sin parámetros adicionales, configurable en 1 o 2 pasadas. El modelo tiene 26.895.998.464 parámetros en bf16 y soporta prompts de hasta 65.536 tokens con el motor de inferencia incluido.

Su relevancia radica en el enfoque: en lugar de forzar a un LLM a generar una respuesta y parsearla, expone directamente la distribución de probabilidad sobre opciones, lo que resulta útil para enrutamiento, clasificación, evaluación automatizada y sistemas de decisión donde se necesita una puntuación calibrada por opción. Es un primer lanzamiento ("first release") con 336 descargas y un solo "like" en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa bidireccional en capas full-attention + capas de atención lineal Gated DeltaNet causales), con bucle de capas amortiguado |
| Parámetros totales | 26.895.998.464 (26,90B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 65.536 tokens con el motor de inferencia incluido |
| Tipos de cuantización | No disponible (los pesos publicados están en bf16) |
| Idiomas soportados | No disponible (hereda el tokenizador y la plantilla de chat del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), con código remoto (`modeling_jeffan.py`) requerido para la máscara bidireccional y el bucle de capas |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y conserva sus pesos sin cambios; lo que se modifica es el comportamiento en inferencia mediante código remoto. La innovación principal es la máscara de atención bidireccional aplicada solo a las capas de atención completa: cada token del prompt ve a todos los demás, mientras que las capas de atención lineal (Gated DeltaNet) siguen siendo causales. La model card advierte explícitamente que usar la máscara causal estándar produce un modelo distinto.

El segundo mecanismo es el bucle de capas: los bloques de capas 24-35 y 36-47 se ejecutan P veces por forward pass con una actualización amortiguada `x ← x + (block(x) − x) / P` en fp32, sin parámetros adicionales. P se fija en inferencia con valor por defecto 1 (cada capa una vez); con 2 pasadas se obtiene una mejora de aproximadamente 0,6 puntos en evaluaciones held-out del autor, a costa de unas 1,4 veces la latencia. La lectura final es la distribución de siguiente token restringida a los códigos de opción.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo RLHF o DPO. La model card describe el modelo como "research model" y "first release", sin detallar el proceso de ajuste más allá de la modificación arquitectónica en inferencia.

## Capacidades

- Clasificación y decisión estructurada: devuelve la probabilidad de cada opción (hasta 255 opciones distintas) en un único forward pass, sin generar texto.
- Entrada de estado flexible: acepta texto o cualquier objeto serializable en JSON como estado (documentos, conversaciones, listas de herramientas).
- Soporte de opciones ordenadas: el parámetro `ordered_levels=True` añade una línea para opciones que representan niveles ordenados (puntuaciones).
- Ventana de contexto larga: hasta 65.536 tokens por prompt con el motor incluido, sin truncamiento según la model card.
- Integración con transformers: método `decide(state, question, options)` y control del bucle de capas mediante `loop_passes` o `set_loop_passes`.
- Motor de inferencia propio: paquete `jeffan_engine` compatible con el Decision Index kit.
- Compatibilidad con vLLM 0.29.0 (solo 1 pasada de bucle) mediante `--hf-overrides '{"is_causal": false}'`, con prefill completo del prompt (sin prefix caching ni chunked prefill).
- No soporta generación de texto libre: la model card indica explícitamente que "the model generates no text".
- Capacidades multilingües: no documentadas; dependen del modelo base y de la plantilla de chat heredada.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de un ticket como estado y una pregunta tipo "¿Qué equipo debe gestionarlo?", el modelo devuelve la probabilidad de cada equipo en un solo forward pass. Adecuado por su formato de decisión estructurada y su contexto de hasta 65.536 tokens para tickets con historial largo.
- Clasificación de documentos largos: con prompts de decenas de miles de tokens, se puede clasificar un contrato, un informe o un hilo de conversación en categorías predefinidas sin truncar el contenido, gracias a la ventana de contexto y a la atención bidireccional sobre el prompt completo.
- Evaluación automatizada de respuestas: usar el modelo como juez de opción múltiple, asignando probabilidades a niveles de calidad (por ejemplo, "correcto", "parcialmente correcto", "incorrecto") con `ordered_levels=True` para obtener una escala ordenada.
- Selección de herramientas en agentes: dado un estado con la conversación y una lista de herramientas disponibles, el modelo puntúa cada herramienta como opción, lo que permite un enrutamiento determinista y calibrado sin generación de texto ni parseo posterior.
- Moderación y triaje de contenido: clasificar mensajes en categorías de riesgo o acción (aprobar, revisar, bloquear) obteniendo una distribución de probabilidad que permite fijar umbrales de decisión y derivar casos ambiguos a revisión humana.
- Investigación en calibración y decisión: el acceso directo a la distribución sobre opciones, sin muestreo ni decodificación, facilita experimentos de calibración, comparación de prompts y análisis de sensibilidad, con la posibilidad de alternar 1 o 2 pasadas del bucle de capas para estudiar el efecto en la precisión.
- Sistemas de pregunta-respuesta con opciones cerradas: cuestionarios, tests de conocimiento o encuestas donde se necesita la probabilidad de cada respuesta en lugar de una respuesta generada, útil para agregar resultados y medir incertidumbre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona verificaciones internas: en 300 preguntas held-out, el método `decide` con transformers reproduce exactamente los tokens de prompt y las probabilidades del motor de evaluación del autor (300 de 300, diferencia máxima 0,0), tanto con 1 como con 2 pasadas, sobre una NVIDIA B300 con bf16, transformers 5.17.0 y PyTorch 2.14.1. También se indica que 2 pasadas del bucle de capas mejoran aproximadamente 0,6 puntos en evaluaciones held-out no especificadas, a unas 1,4 veces la latencia, sin detallar las métricas ni los conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: los pesos suman 26,90B parámetros, lo que requiere aproximadamente 54 GB solo para pesos, más memoria para el contexto (hasta 65.536 tokens) y las activaciones; en la práctica se necesita una GPU con 80 GB o más para prompts largos.
- GPU verificada: NVIDIA B300 (según la model card, con bf16, transformers 5.17.0 y PyTorch 2.14.1).
- GPU recomendadas: A100 80 GB, H100 80 GB, B300 u otras GPU de datacenter con al menos 80 GB de memoria para el contexto completo; no se documentan requisitos para GPUs de consumo.
- GPU de consumo: no hay información sobre cuantizaciones (GGUF, AWQ, GPTQ) ni sobre ejecución en RTX 4090 u otras tarjetas de consumo; el repositorio solo publica pesos bf16.
- Opciones de despliegue: transformers con `trust_remote_code=True`; paquete `jeffan_engine` con el Decision Index kit; vLLM 0.29.0 (solo 1 pasada de bucle, con `--hf-overrides '{"is_causal": false}'` y prefill completo). No se mencionan llama.cpp, Ollama ni TGI.
- Dependencias del motor: PyTorch 2.14.1, transformers 5.17.0, flash-linear-attention 0.5.2 y, opcionalmente, causal-conv1d 1.7.0.
- Latencia y throughput: no se publican cifras absolutas; solo la relación de aproximadamente 1,4 veces la latencia con 2 pasadas frente a 1 pasada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeffan-27B-1211 | 26,90B | 65.536 tokens | Decisión estructurada por probabilidad sobre opciones, sin generación | Apache 2.0 | Hugging Face, código remoto y motor propio |
| Qwen/Qwen3.8-27B (base) | 27B (según nombre) | No disponible en la información | Generación de texto causal estándar | Apache 2.0 | Hugging Face |
| Alternativas de clasificación por LLM | No disponible | No disponible | Generación de texto + parseo de la respuesta | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables de decisión estructurada con lectura directa de probabilidades sobre opciones; la comparación con el modelo base es la única referencia directa documentada. No se han publicado métricas comparativas de rendimiento.

## Limitaciones y advertencias

- Modelo de investigación y primer lanzamiento: no hay garantías de robustez en producción ni historial de versiones.
- No genera texto: cualquier caso de uso que requiera respuestas redactadas queda fuera de su alcance.
- Dependencia de código remoto: la máscara bidireccional y el bucle de capas viven en `modeling_jeffan.py`; usar los pesos con la máscara causal estándar produce un modelo distinto, según advierte la model card.
- Formato de prompt estricto: el modelo espera un diseño concreto (línea de sistema fija; `State:`, `Question:` y `Options:` con códigos A, B…; línea de cierre); otros formatos pueden dar resultados diferentes.
- vLLM solo soporta 1 pasada del bucle de capas y exige prefill completo del prompt, sin prefix caching ni chunked prefill, lo que limita el rendimiento en despliegues con prompts largos y repetidos.
- Idiomas soportados no documentados: el comportamiento multilingüe depende del modelo base y no está verificado.
- Sin datos publicados sobre sesgos, tasa de alucinación (aunque no genera texto, sí puede asignar probabilidades mal calibradas), composición del entrenamiento ni evaluaciones independientes.
- Requisitos de memoria elevados en bf16 (aproximadamente 54 GB solo para pesos), sin cuantizaciones publicadas para reducir el coste.
- Licencia Apache 2.0 permite uso comercial, pero el estado de "research model" y la ausencia de benchmarks públicos aconsejan validación propia antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tattrongvu/Jeffan-27B-1211
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Decision Index kit: https://github.com/apolinario/decision-index
- Motor de inferencia: carpeta `inference/` del repositorio del modelo (https://huggingface.co/tattrongvu/Jeffan-27B-1211/tree/main/inference)
- Código remoto: `modeling_jeffan.py`, incluido en el repositorio del modelo (licencia Apache 2.0)
