# wenxingwang/lite-mixed-10k

## Resumen

Lite mixed-10k es un checkpoint de ajuste fino supervisado sobre el modelo base `vllm-sr/d3-lite`, que a su vez deriva de `Qwen/Qwen3.5-0.8B`. Lo publica el usuario `wenxingwang` en Hugging Face con licencia Apache-2.0 y está pensado como un artefacto de investigación dentro de un pipeline mayor denominado "Zils d3-lite soup pool". No es un paquete autónomo de inferencia: el autor indica explícitamente que el pool proporciona el prompt fijado, el tokenizador, la cabeza de decisión (decision readout) y el runtime necesarios para ejecutarlo.

El checkpoint se obtiene tras 10.000 ejemplos de una pasada barajada (seed 553) sobre un corpus de 15.000 ejemplos con prompts únicos, mediante un LoRA de atención de rango 16 sobre los pesos de lenguaje, con los pesos de visión sin modificar. El objetivo declarado es el ajuste en dominio mixto sobre 11 conjuntos de datos públicos de razonamiento y clasificación (BoolQ, MultiNLI, WinoGrande XL, ARC, BANKING77, StrategyQA, PubMedQA, CondaQA, RuleTaker y ShARC).

El interés del modelo es limitado fuera de ese contexto: no hay pipeline declarado ni idiomas especificados, tiene cero descargas y cero likes en el momento de la consulta, y el autor advierte que no se ha demostrado ninguna puntuación oficial en el "validator exam" del sistema Zils. Es relevante únicamente como referencia de un experimento de ajuste fino con LoRA sobre un modelo pequeño de 0,85 mil millones de parámetros en hardware de consumo (una RTX 4060 Ti de 8 GiB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B); ajuste LoRA solo en atención, visión congelada |
| Parametros totales | 852.985.920 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, adaptador fusionado en FP32 y almacenado en BF16) |
| Modelo base | vllm-sr/d3-lite (commit 03560c26f5199c3c04129a2ccb38960c913635e0), sobre Qwen/Qwen3.5-0.8B (commit 2fc06364715b967f1860aea9cf38778875588b17) |
| Tamano del repositorio | 1,7 GB |
| Hardware de entrenamiento | NVIDIA RTX 4060 Ti, 8 GiB, Linux bajo WSL 2 |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B` y hereda su arquitectura transformer, incluyendo una torre de visión que en este checkpoint permanece intacta (el autor señala que los pesos de visión no se han modificado). El ajuste consiste en un LoRA aplicado exclusivamente a las capas de atención del modelo de lenguaje, con rango 16, alpha 32 y dropout 0,05. Se entrena con AdamW a una tasa de aprendizaje de 0,00002 sin decaimiento de peso, batch de GPU 4, acumulación de gradiente 2 (batch efectivo 8) y 1.250 actualizaciones del optimizador. El adaptador se fusiona en FP32 como `weight + 2 * B @ A` y se almacena en BF16.

Los datos de entrenamiento corresponden a una única pasada sobre 15.000 ejemplos con prompts únicos, de los cuales este checkpoint ha visto 10.000 (seed 553). La composición por fuente es: arc_challenge (558), arc_easy (1.075), banking77 (1.675), boolq (834), condaqa (421), multinli (622), pubmedqa (1.664), ruletaker (863), sharc (838), strategyqa (822) y winogrande_xl (628). El autor advierte que PubMedQA incluye etiquetas artificiales en el entrenamiento, aunque la evaluación local usa solo etiquetas de expertos, y que no se han empleado datos de clientes ni exámenes privados del validador.

## Capacidades

- Generación de texto y razonamiento de dominio mixto, orientado a tareas de clasificación y respuesta breve sobre los 11 conjuntos de entrenamiento.
- Clasificación de intenciones de banca (BANKING77) y respuesta a preguntas de comprensión (BoolQ, ARC, ShARC).
- Razonamiento de sentido común (StrategyQA, WinoGrande XL), inferencia de lenguaje natural (MultiNLI) y razonamiento de reglas (RuleTaker).
- Preguntas biomédicas de opción múltiple (PubMedQA, CondaQA).
- Conserva los pesos de visión del modelo base, aunque el autor no documenta el uso de esas capacidades tras el ajuste.
- Requiere el prompt fijado, el tokenizador, la cabeza de decisión y el runtime del "Zils d3-lite soup pool"; no documenta tool calling, function calling, modo thinking ni capacidades de agente.

## Casos de uso

- Evaluación de recetas de ajuste fino: sirve como referencia de cómo un LoRA de atención de rango 16 con 1.250 pasos afecta a la precisión sobre un corpus mixto de clasificación y razonamiento; útil para reproducir el experimento con seed 553 y el mismo corpus de 15.000 ejemplos.
- Clasificación de intenciones bancarias: el conjunto BANKING77 aporta 1.675 ejemplos, la mayor fuente del corpus, por lo que el modelo puede emplearse en prototipos de enrutado de consultas de clientes dentro de un pipeline controlado.
- Comprensión lectora booleana: con 834 ejemplos de BoolQ, encaja en tareas de verificación de afirmaciones contra un pasaje corto, siempre que se integre con el runtime del pool.
- Preguntas de opción múltiple de nivel escolar y científico: ARC Easy, ARC Challenge y ShARC (2.751 ejemplos combinados) permiten usar el modelo en evaluación automática de preguntas de ciencias.
- Razonamiento de sentido común en experimentos: StrategyQA y WinoGrande XL suman 1.450 ejemplos y sirven para probar la degradación del razonamiento en modelos de menos de mil millones de parámetros.
- Investigación sobre hardware de consumo: el autor entrenó con una RTX 4060 Ti de 8 GiB, de modo que el checkpoint es útil como caso de estudio de ajuste fino viable en GPU doméstica.
- Verificación de hipótesis de investigación: la comparación pre/post fusión del adaptador (84,17 % → 87,33 % de precisión) permite reproducir la medición de calibración de temperatura sobre conjuntos públicos.

## Benchmarks y rendimiento

El autor publica una evaluación local del adaptador antes de fusionar, con ajuste independiente de temperatura sobre 360 ejemplos de calibración y evaluación sobre 600 ejemplos retenidos que cubren las 11 fuentes:

| Modelo | Accuracy | Brier (menor es mejor) |
|---|---:|---:|
| Baseline d3-lite fijado | 84,17% | 0,232978 |
| Adaptador pre-fusión de este modelo | 87,33% | 0,206634 |

El autor advierte que estas cifras corresponden al adaptador antes de la fusión y no a una evaluación del cuerpo BF16 fusionado que se distribuye en este repositorio. Se basan en una sola semilla de entrenamiento, muestras pequeñas por fuente y un solapamiento desconocido con el preentrenamiento upstream. No hay resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible, y no se ha demostrado ninguna puntuación oficial en el "validator exam".

## Requisitos de hardware

- VRAM estimada para inferencia: con 853 millones de parámetros en BF16, los pesos ocupan aproximadamente 1,7 GB; en FP16/BP16 se necesita algo más de 2 GB contando activaciones y KV cache, y en cuantización de 8 bits o 4 bits bajaría por debajo de 1 GB (no se publican GGUF ni cuantizaciones oficiales).
- GPU recomendadas: el autor entrenó con una RTX 4060 Ti de 8 GiB; para inferencia, cualquier GPU con 4 GB o más debería ser suficiente en BF16.
- Cabe en GPU de consumo: sí, incluidas RTX 3060, RTX 4060, RTX 4070 y superiores; también en iGPU con suficiente memoria unificada si se cuantiza.
- Opciones de despliegue: no disponible; el autor indica que necesita el runtime del "Zils d3-lite soup pool" y no documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| Lite mixed-10k (este) | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Requiere runtime del pool Zils; checkpoint de investigación |
| Qwen/Qwen3.5-0.8B (ancestro) | ~0,8 mil millones | no disponible | no disponible en la información | Hugging Face | Modelo base original del que deriva |
| vllm-sr/d3-lite (padre directo) | no disponible | no disponible | no disponible en la información | Hugging Face | Pool del que se heredan prompt, tokenizador y cabeza de decisión |

No se dispone de datos de benchmarks comparativos frente a otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un paquete autónomo: sin el prompt fijado, el tokenizador, la cabeza de decisión y el runtime del pool Zils no puede ejecutarse según lo previsto por el autor.
- Las cifras de 87,33 % de precisión y 0,206634 de Brier corresponden al adaptador antes de la fusión, no al cuerpo BF16 distribuido; no deben citarse como rendimiento del checkpoint publicado.
- Evaluación con una sola semilla de entrenamiento, muestras pequeñas por fuente y solapamiento desconocido con el preentrenamiento upstream.
- PubMedQA incluye etiquetas artificiales en el entrenamiento, lo que puede introducir sesgo en las respuestas biomédicas.
- El autor reconoce que no se ha demostrado ninguna puntuación oficial en el "validator exam" ni asiento en el "soup".
- El conjunto de evaluación aceptado puede solaparse con las 500.000 entradas de entrenamiento preparadas pero no usadas; no debe tratarse como test limpio para modelos entrenados con ellas.
- No se documentan idiomas soportados, longitud de contexto, sesgos conocidos ni riesgo de alucinación medido.
- La licencia Apache-2.0 cubre los pesos, pero cada conjunto de datos de entrenamiento conserva sus propios términos de licencia.
- No se incluyen datos de entrenamiento ni de evaluación en el paquete de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wenxingwang/lite-mixed-10k
- Modelo base (padre): https://huggingface.co/vllm-sr/d3-lite
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Commit del padre: https://huggingface.co/vllm-sr/d3-lite/tree/03560c26f5199c3c04129a2ccb38960c913635e0
- Commit de Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
