# WangSenQWQ/Senova-4B-v4

## Resumen

Senova-4B-v4 es un ajuste fino de parámetros completos (full-parameter fine-tune) del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario WangSenQWQ. El modelo parte de la arquitectura multimodal de Qwen3.5 (pipeline image-text-to-text) y se especializa en una técnica de inferencia concreta denominada "Read Twice", que consiste en repetir dos veces el enunciado completo dentro de un mismo mensaje de usuario y leer una única distribución de siguiente token, sin realizar dos llamadas al modelo y con el modo de razonamiento (thinking) desactivado.

El entrenamiento se realizó sobre 5.181.618 ejemplos durante 3 épocas, empleando etiquetas suaves (soft-label) sobre conjuntos de opciones, lo que sugiere un enfoque orientado a tareas de selección entre alternativas (tipo test o multiple choice). El checkpoint publicado es el final, en el paso 1530. El autor reporta un índice público Decision Index 0.3 de 67,02, con el 100 % de las 140.178 solicitudes puntuables procesadas con éxito bajo la configuración Read Twice y thinking off.

La relevancia del modelo es doble: por un lado, explora una técnica de prompting poco convencional (duplicar la entrada) sobre un modelo de 4B parámetros; por otro lado, ofrece pesos con licencia Apache-2.0, lo que facilita su uso comercial, aunque el autor advierte explícitamente que los derechos sobre el dataset no se transfieren con la licencia del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5 |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos); derechos del dataset no incluidos |
| Formato de pesos | safetensors (tamaño del repo: 9,1 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, un transformer multimodal capaz de procesar entradas de imagen y texto (pipeline image-text-to-text). No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, etc.) en la información proporcionada. El ajuste es de parámetros completos, no un adaptador LoRA, y se realizó durante 3 épocas sobre 5.181.618 ejemplos, finalizando en el paso 1530.

La innovación técnica destacable no reside en la arquitectura sino en el protocolo de inferencia: la técnica "Read Twice" repite el enunciado completo dos veces, separadas por una línea en blanco, dentro de un único mensaje de usuario, y el modelo genera una sola distribución de siguiente token. No se realizan dos llamadas al modelo y el modo thinking permanece desactivado. El entrenamiento con soft-labels sobre conjuntos de opciones (option-set soft-label) sugiere que el modelo fue optimizado para tareas de selección entre alternativas, probablemente con una función de pérdida que distribuye probabilidad sobre las opciones válidas en lugar de una etiqueta dura. No se especifica si se empleó RLHF, DPO u otras técnicas de alineación adicionales.

## Capacidades

- Generación de texto y respuesta a preguntas en formato conversacional (tag `conversational`).
- Procesamiento de entradas multimodales imagen-texto, heredado de la base Qwen3.5-4B.
- Selección entre opciones (option-set) mediante etiquetas suaves, orientado a tareas de decisión tipo multiple choice.
- Inferencia con la técnica Read Twice: duplicación del enunciado en un único mensaje para mejorar la lectura del contexto.
- Modo thinking desactivado por diseño en la configuración evaluada; no se documenta soporte de modo thinking activo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada (los idiomas no están listados).

## Casos de uso

- Evaluación de modelos en benchmarks de opción múltiple: el modelo está entrenado con soft-labels sobre conjuntos de opciones y reporta un índice Decision Index 0.3, por lo que encaja en pipelines de evaluación automática donde se debe elegir una respuesta entre varias.
- Investigación sobre técnicas de prompting: la técnica Read Twice (duplicar el enunciado) puede estudiarse como alternativa de bajo coste frente a llamadas múltiples al modelo, ya que solo requiere una pasada de inferencia.
- Clasificación y selección de respuestas en entornos controlados: dado su entrenamiento sobre 5,18 M de ejemplos con etiquetas suaves, puede emplearse para tareas de ranking o selección donde las opciones estén bien definidas.
- Prototipado de asistentes conversacionales multimodales: al heredar la base Qwen3.5-4B, puede procesar entradas de imagen y texto en un solo pipeline, útil para demos y pruebas de concepto.
- Despliegue en entornos con recursos limitados: con 4,54 B de parámetros y pesos en safetensors de 9,1 GB, es viable en GPUs de gama alta consumer, lo que facilita experimentación local.
- Reproducción de resultados públicos: el autor indica que el servidor de inferencia de Senova-4B-v3 puede cargar estos pesos, lo que permite replicar la evaluación pública con la misma configuración (Read Twice, thinking off).

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Decision Index 0.3 (público) | 67,02 | complete=true; 140.178/140.178 solicitudes puntuables con éxito; Read Twice y thinking off |
| Full score (privado) | no disponible | Determinado por los mantenedores del leaderboard |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4,54 B parámetros en FP16 requiere aproximadamente 9 GB de VRAM solo para los pesos, más memoria para el contexto y activaciones.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs con 16 GB o más de VRAM en FP16, y en GPUs de 8-12 GB con cuantización (aunque no se documentan cuantizaciones oficiales).
- ¿Cabe en GPU consumer? Probablemente sí en modelos como RTX 4090 (24 GB) en FP16, y en RTX 3080/4070 (10-12 GB) solo con cuantización, que no está documentada.
- Opciones de despliegue: transformers (librería indicada); el autor menciona que el servidor de inferencia de Senova-4B-v3 puede cargar estos pesos. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Senova-4B-v4 | 4,54 B | no disponible | Apache-2.0 | Fine-tune de Qwen3.5-4B con Read Twice y soft-labels |
| Qwen/Qwen3.5-4B (base) | ~4 B (no confirmado) | no disponible | no disponible en la información | Modelo base multimodal; sin el ajuste ni la técnica Read Twice |
| Otros fine-tunes de Qwen3.5-4B | no disponible | no disponible | no disponible | No se dispone de datos comparativos |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría. La comparación con el modelo base es estructural (mismo tamaño), pero no se han publicado métricas del base en la información proporcionada.

## Limitaciones y advertencias

- Los pesos han sido modificados mediante entrenamiento con soft-labels y no son una versión sin modificar de Qwen; el autor lo advierte explícitamente.
- El resultado de 67,02 en Decision Index 0.3 es un benchmark público; la puntuación Full privada la determinan los mantenedores del leaderboard y no se conoce.
- La técnica Read Twice es obligatoria para la evaluación privada; usar otra configuración de inferencia puede invalidar la comparación con los resultados reportados.
- El modo thinking debe permanecer desactivado; no se documenta comportamiento con thinking activo.
- La licencia Apache-2.0 cubre los pesos, pero no concede derechos sobre el dataset de entrenamiento (el autor lo indica en la model card).
- No se dispone de información sobre sesgos, riesgo de alucinación, idiomas soportados ni limitaciones de contexto.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación independiente de la comunidad.
- No se documentan cuantizaciones oficiales ni soporte en frameworks de despliegue distintos de transformers.

## Enlaces

- Hugging Face: https://huggingface.co/WangSenQWQ/Senova-4B-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
