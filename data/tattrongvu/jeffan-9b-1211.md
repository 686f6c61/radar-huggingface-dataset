# tattrongvu/Jeffan-9B-1211

## Resumen

Jeffan-9B-1211 es un modelo de investigación derivado de Qwen/Qwen3.5-9B (Apache 2.0) mediante ajuste fino, desarrollado por el usuario tattrongvu. No es un modelo generativo al uso: su propósito es responder preguntas de decisión estructuradas en formato de elección múltiple. Dado un estado (un documento, una conversación, una lista de herramientas) y una o varias preguntas con opciones etiquetadas (A, B, C...), el modelo devuelve una distribución de probabilidad sobre cada opción leída directamente de un único forward pass, sin generar texto.

El modelo conserva los 8.953.803.264 parámetros del Qwen3.5-9B base en bf16 y reutiliza su tokenizador y plantilla de chat. La innovación principal reside en dos modificaciones sobre la arquitectura original: atención bidireccional en las capas de atención completa (las capas de atención lineal Gated DeltaNet permanecen causales) y un bucle de capas repetido P veces por forward pass con actualización amortiguada (por defecto P=2). Soporta prompts de hasta 65.536 tokens con el motor de inferencia incluido.

Es relevante ahora porque propone un paradigma distinto al de los LLM conversacionales: en lugar de generar razonamiento en texto, expone directamente la distribución de probabilidad del siguiente token sobre códigos de opción. Esto lo hace adecuado para sistemas de enrutamiento, clasificación y toma de decisiones automática donde se requiere una salida calibrada y determinista, no una respuesta en lenguaje natural.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa bidireccional en capas full-attention + atención lineal causal Gated DeltaNet), con bucle de capas amortiguado |
| Parámetros totales | 8.953.803.264 (8,95B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 65.536 tokens de prompt con el motor de inferencia incluido |
| Tipos de cuantización | No disponible (pesos publicados en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), con código remoto `modeling_jeffan.py` y paquete `jeffan_engine` |
| Modelo base | Qwen/Qwen3.5-9B |
| Pipeline declarado | text-classification |
| Tamaño del repositorio | 17,9 GB |
| Descargas | 352 |
| Fecha de creación | 2026-11-09 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer híbrido que combina capas de atención completa con capas de atención lineal basadas en Gated DeltaNet. Sobre esa base, Jeffan introduce tres cambios. Primero, las capas de atención completa operan en modo bidireccional: cada token del prompt atiende a todos los demás, mientras que las capas Gated DeltaNet permanecen causales. Segundo, los bloques de capas intermedias (4-7, 8-11, 12-15) se ejecutan P veces por forward pass con una actualización amortiguada en fp32 (`x ← x + (block(x) − x) / P`), sin parámetros adicionales; P se fija en inferencia y vale 2 por defecto. Tercero, se añade una cabeza de lectura que interpreta la distribución del siguiente token sobre los códigos de opción.

No se documentan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset, si hubo RLHF/DPO o ajuste supervisado). La model card describe el modelo como "first release" de investigación y no detalla el proceso de ajuste fino más allá de la modificación arquitectónica. El código remoto `modeling_jeffan.py` (Apache 2.0) implementa la máscara bidireccional, el bucle de capas y la lectura; los pesos cargan sin cambios respecto a la estructura del modelo base.

## Capacidades

- Respuesta a preguntas de decisión estructuradas en formato de elección múltiple: recibe estado, pregunta y hasta 255 opciones, y devuelve la probabilidad de cada opción en un solo forward pass.
- Clasificación y enrutamiento: asignación de tickets, documentos o conversaciones a categorías predefinidas mediante probabilidades calibradas.
- Soporte de estado en texto libre o cualquier objeto serializable a JSON.
- Modo de niveles ordenados (`ordered_levels=True`) para opciones que representan una escala o puntuación.
- Ajuste del número de pasadas del bucle de capas en inferencia (1, 2, 3 o 4) para intercambiar latencia por precisión.
- Integración con el motor Decision Index (`jeffan_engine`) y con los endpoints de vLLM `/v1/systemone` y `/v1/decisions` mediante el plugin `jeffan_vdec`.
- No genera texto: la salida es exclusivamente una distribución de probabilidad sobre los códigos de opción.
- Capacidades multilingües: no documentadas de forma explícita; dependen del modelo base Qwen3.5-9B.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia y una lista de equipos (facturación, daños en envío, soporte técnico), el modelo devuelve la probabilidad de cada equipo en una sola pasada. El ejemplo de la model card muestra 0,9620 para "Shipping damage claims" frente a 0,0107 y 0,0273 para las alternativas.
- Clasificación de documentos en pipelines de ingestión: con contexto de hasta 65.536 tokens, puede procesar contratos, informes o hilos de conversación completos sin truncamiento y asignar una categoría con probabilidad asociada.
- Selección de herramientas en agentes: dado el estado de la conversación y una lista de herramientas disponibles, el modelo puntúa cada herramienta como siguiente acción, lo que permite un enrutamiento determinista sin generación de texto intermedio.
- Moderación y triaje de contenido: clasificación de mensajes en niveles ordenados (por ejemplo, gravedad de una incidencia) usando `ordered_levels=True` para obtener una puntuación ordinal.
- Evaluación automática de respuestas: dado un enunciado y varias respuestas candidatas, el modelo asigna probabilidad a cada una para seleccionar la mejor sin necesidad de un juez generativo.
- Sistemas de decisión en producción con requisitos de baja latencia: al no generar texto y leer la distribución en un único forward pass, la latencia es predecible y proporcional al número de pasadas del bucle (1 pasada ≈ 0,6× la latencia de 2; 3 pasadas ≈ 1,3×).
- Investigación sobre modelos de decisión: la arquitectura con atención bidireccional y bucle de capas sirve como banco de pruebas para estudiar lectura directa de distribuciones frente a generación autoregresiva.

## Benchmarks y rendimiento

La model card menciona resultados sobre una "kit sample" del Decision Index kit, pero no publica una tabla formal de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Los únicos datos numéricos disponibles son:

| Configuración | Puntuación en kit sample | Latencia relativa |
|---|---|---|
| 1 pasada de bucle | 66,9 | ≈ 0,6× |
| 2 pasadas (por defecto) | 69,8 | 1,0× |
| 3 pasadas | 70,0 | ≈ 1,3× |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18 GB solo para pesos (8,95B × 2 bytes), más overhead de activaciones y caché KV para contextos largos; se recomienda al menos 24 GB para prompts moderados y 40-80 GB para contextos cercanos a 65.536 tokens.
- GPU recomendadas: NVIDIA B300 (verificado por el autor con bf16, transformers 5.17.0 y PyTorch 2.14.1), A100 40/80 GB, H100, y GPUs consumer de gama alta con 24 GB o más (RTX 3090, RTX 4090) para contextos cortos.
- No se documentan cuantizaciones, por lo que no hay una ruta oficial para reducir los requisitos por debajo de bf16.
- Opciones de despliegue: transformers con `trust_remote_code=True`; paquete `jeffan_engine` (Apache 2.0) sobre transformers; servidor vLLM con el plugin `jeffan_vdec` para los endpoints `/v1/systemone` y `/v1/decisions`; pipeline del Decision Index kit.
- Dependencias verificadas: transformers 5.17.0, PyTorch 2.14.1, flash-linear-attention 0.5.2, causal-conv1d 1.7.0 (opcional).
- Latencia y throughput: no se publican cifras absolutas; solo ratios relativos entre configuraciones de bucle de capas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeffan-9B-1211 | 8,95B | 65.536 tokens | Distribución sobre opciones (sin generación) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9B aprox. | No disponible en la información | Generación de texto | Apache 2.0 | Hugging Face |
| Modelos de clasificación tipo encoder (p. ej., DeBERTa) | Variable (0,1-1,5B típico) | Típicamente 512-4.096 tokens | Logits de clasificación | Variable | Hugging Face |

La comparación con modelos de clasificación tradicionales es limitada: Jeffan opera sobre contextos mucho mayores y con opciones dinámicas en el prompt, mientras que un encoder de clasificación requiere cabezas fijas por tarea. No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier uso que requiera una respuesta en lenguaje natural queda fuera de su diseño.
- Los resultados dependen del formato de prompt propio del modelo (línea de sistema fija, `State:`, `Question:`, `Options:` con códigos A, B...); otros formatos pueden producir resultados distintos.
- La atención bidireccional solo se aplica con el código remoto o el paquete `jeffan_engine`; usar la máscara causal estándar de transformers da lugar a un modelo diferente.
- No se documentan sesgos conocidos, composición del dataset de ajuste ni evaluaciones de alucinación; al no generar texto, el riesgo de alucinación se traslada a la calibración de las probabilidades sobre opciones.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del modelo base y no ha sido evaluado de forma explícita.
- No hay cuantizaciones publicadas, lo que limita el despliegue en hardware con menos de 24 GB de VRAM.
- Es una primera release de investigación ("first release"), sin historial de versiones ni validación externa más allá de la verificación del autor en una NVIDIA B300.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B también es Apache 2.0; conviene revisar los términos del modelo base para producción.
- El rendimiento en la kit sample (66,9-70,0) no es directamente comparable con benchmarks estándar y no debe extrapolarse a otras tareas sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tattrongvu/Jeffan-9B-1211
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio Decision Index: https://github.com/apolinario/decision-index
- Paquete de inferencia: `inference/README.md` dentro del repositorio del modelo
- Plugin vLLM: `inference/vllm_decisions/` dentro del repositorio del modelo
