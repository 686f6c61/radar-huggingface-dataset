# xiaoyuchen1/Qwen3-1.7B-OPD-fwdKL-from-Qwen3-8B-GRPO

## Resumen

El modelo **Qwen3-1.7B-OPD-fwdKL-from-Qwen3-8B-GRPO** es un experimento de destilación on-policy (OPD) desarrollado por xiaoyuchen1. Destila el conocimiento de un teacher de 8B parámetros (`xiaoyuchen1/Qwen3-8B-GRPO-MATH`) en un student de 1.7B (`Qwen/Qwen3-1.7B`) utilizando una divergencia KL hacia adelante (forward KL) sobre el soporte top-128 del teacher. El objetivo es estudiar si la señal OPD puede mejorarse ponderándola con un valor de proceso derivado del teacher; este modelo es el brazo de control sin ponderación, es decir, la línea base del estudio.

El modelo se entrena con 7.496 problemas del dataset MATH, usando el framework slime de THUDM, con 150 actualizaciones de optimizador (un horizonte corto). Está pensado exclusivamente para razonamiento matemático en formato chat sin modo thinking (`enable_thinking: false`). Su relevancia radica en que sirve como referencia para comparar variantes de destilación on-policy, no como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (1.72B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredado del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-1.7B, un transformer denso con 1.72B parámetros. El entrenamiento utiliza destilación on-policy: el student genera sus propios rollouts (con temperatura 1.0, longitud máxima de respuesta 4096 tokens), el teacher puntúa esos rollouts token a token, y el student se actualiza para reducir la divergencia KL entre las distribuciones del teacher y del student sobre las trayectorias que el propio student visita. A diferencia de SFT o destilación off-policy, la supervisión recae sobre estados que el student realmente alcanza.

El objetivo es forward KL, `D(p_teacher || q_student)`, evaluado sobre el soporte top-128 del teacher y renormalizado. La forward KL es mass-covering: empuja al student a cubrir todos los modos del teacher en lugar de colapsar en uno solo. No incluye el término `-H(q)`, por lo que no recompensa la inflación de entropía del student. El entrenamiento usa Adam con lr 1e-6, weight decay 0.1, betas (0.9, 0.98) y 150 actualizaciones. El dataset es `xiaoyuchen1/opd-math-data` (split `math_train`, 7.496 problemas), con batch global de 64, 16 prompts por paso y 4 muestras por prompt. No se aplicó ningún ajuste de seguridad ni alineación.

## Capacidades

- Generación de texto en formato chat, especializado en razonamiento matemático.
- Resolución de problemas de nivel MATH (competición y olimpiada) con respuestas detalladas.
- Soporte de modo no-thinking (sin cadena de pensamiento explícita).
- No soporta tool calling, ni visión, ni audio.
- Multilingüe limitado: solo inglés (según la model card).
- Capacidad de generar múltiples soluciones por problema (muestreo con k=16 en evaluación).

## Casos de uso

- **Investigación en destilación de modelos**: sirve como baseline en estudios sobre OPD, permitiendo comparar el efecto de ponderar la señal del teacher con un valor de proceso. Se usa para medir la mejora relativa de otras variantes.
- **Generación de soluciones matemáticas**: puede producir respuestas razonadas a problemas de álgebra, geometría, teoría de números y combinatoria del dataset MATH, útil para generar datos sintéticos de entrenamiento.
- **Evaluación de técnicas de muestreo**: al ser un modelo pequeño, permite probar estrategias de decodificación (temperatura, top-p, top-k) con bajo coste computacional antes de escalar a modelos mayores.
- **Análisis de truncación y finalización**: su alta tasa de truncación en AIME (70% con límite de 4096 tokens) lo convierte en un caso de estudio para investigar cómo el presupuesto de tokens afecta a la precisión en problemas largos.
- **Prototipado de pipelines de razonamiento**: al ser ligero (1.7B), puede integrarse en entornos con recursos limitados para probar flujos de generación de respuestas matemáticas antes de usar modelos más grandes.
- **Comparación de métricas de evaluación**: su comportamiento en pass@16 vs avg@16 (91.2 vs 74.4 en MATH-500) permite estudiar la varianza entre estimaciones de precisión con muestreo múltiple.

## Benchmarks y rendimiento

Se evaluó con dos protocolos de decodificación, ambos con límite de 4096 tokens de salida y k=16 muestras. Los resultados se presentan tal como reporta el autor.

**Protocolo primario — T=0.7, top-p 0.8, top-k 20, seed 42**

| benchmark | avg@16 | pass@16 | truncados (%) | tokens medios | sin respuesta (%) |
|---|---|---|---|---|---|
| math500 | 74.42 | 91.20 | 11.2 | 1215 | 10.9 |
| aime24 | 16.25 | 40.00 | 70.2 | 3551 | 69.6 |
| aime25 | 12.08 | 30.00 | 67.3 | 3481 | 65.0 |

**Protocolo large-K — T=1.0, top-p 1.0, sin top-k, seed 9191**

| benchmark | avg@16 | pass@16 | truncados (%) | tokens medios | sin respuesta (%) |
|---|---|---|---|---|---|
| math500 | 72.28 | 91.00 | 13.5 | 1362 | 12.3 |
| aime24 | 14.58 | 36.67 | 72.9 | 3609 | 67.7 |
| aime25 | 12.92 | 30.00 | 66.5 | 3568 | 60.2 |

El autor advierte que en AIME la tasa de truncación es tan alta que la precisión mide principalmente si el modelo terminó la respuesta, no si la resolvió. MATH-500 es la métrica fiable por su baja truncación. No se deben comparar estos números con resultados obtenidos con presupuestos de tokens mayores.

## Requisitos de hardware

- El modelo tiene 1.72B parámetros. En fp16, los pesos ocupan aproximadamente 3.4 GB; en fp32, unos 6.9 GB.
- Cabe en GPUs consumer con 8 GB de VRAM o más (por ejemplo, RTX 3060, RTX 4060, RTX 3070, RTX 4070) si se usa fp16 o cuantización.
- Para inferencia con contexto de 4096 tokens y batch pequeño, una RTX 3090 o RTX 4090 es más que suficiente.
- El entrenamiento original se realizó en una GPU de 96 GB (probablemente A100 o H100) con el teacher residente en memoria.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con transformers de HuggingFace.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 1.72B | 32k (según documentación oficial) | Apache-2.0 | Modelo generalista, sin destilación |
| Qwen3-1.7B-OPD-fwdKL (este) | 1.72B | No disponible | Apache-2.0 | Destilación on-policy desde teacher 8B, especializado en MATH |
| Qwen3-8B-GRPO-MATH (teacher) | 8B | No disponible | Apache-2.0 | Teacher entrenado con GRPO en MATH |

La comparación directa con el teacher no es posible porque no se reportan sus métricas en la misma configuración. Frente al base Qwen3-1.7B, este modelo está especializado en matemáticas y ha sido sometido a destilación, pero no se dispone de benchmarks del base para comparar.

## Limitaciones y advertencias

- Entrenamiento de horizonte corto: solo 150 actualizaciones de optimizador, muy por debajo de las 1.875 del estudio original de referencia.
- Especialización extrema: solo entrenado y evaluado en problemas de estilo MATH, en formato chat sin thinking. No generaliza a otras tareas.
- Alta tasa de truncación en problemas largos (AIME): con límite de 4096 tokens, más del 65% de las respuestas quedan incompletas, lo que invalida la precisión en esos benchmarks.
- Sin ajuste de seguridad ni alineación: puede generar contenido no deseado o incorrecto sin filtros.
- Una sola semilla: la variabilidad entre evaluaciones independientes en AIME es de ±2 puntos, por lo que diferencias menores no son significativas.
- Solo inglés: no soporta otros idiomas.
- No se han publicado cuantizaciones oficiales ni se garantiza compatibilidad con herramientas de despliegue sin conversión previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xiaoyuchen1/Qwen3-1.7B-OPD-fwdKL-from-Qwen3-8B-GRPO
- Dataset de entrenamiento: https://huggingface.co/datasets/xiaoyuchen1/opd-math-data
- Framework slime (THUDM): https://github.com/THUDM/slime
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Teacher Qwen3-8B-GRPO-MATH: https://huggingface.co/xiaoyuchen1/Qwen3-8B-GRPO-MATH
- Informe técnico de Qwen3: https://arxiv.org/pdf/2505.09388
