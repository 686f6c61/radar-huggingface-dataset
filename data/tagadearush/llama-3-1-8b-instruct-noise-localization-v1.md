# tagadearush/Llama-3.1-8B-Instruct-noise-localization-v1

## Resumen

Llama-3.1-8B-Instruct-noise-localization-v1 es un checkpoint de investigación derivado de meta-llama/Llama-3.1-8B-Instruct, publicado por el usuario tagadearush dentro del proyecto denominado *substrate awareness*. No es un modelo de propósito general: se trata de un ajuste fino con LoRA (r=16, α=32) cuyo único objetivo es detectar perturbaciones gaussianas aplicadas a las activaciones internas del propio modelo durante el forward pass. El repositorio contiene los pesos bf16 fusionados (LoRA incorporado), por lo que se carga como cualquier Llama-3.1-8B estándar.

El modelo resuelve una tarea concreta de introspección: se presentan dos frases A/B y, durante el paso hacia delante, se añade ruido N(0, σ) a las salidas de atención y MLP de todas las capas sobre el span de tokens de una de las frases; el modelo debe responder `the answer is: A|B`. Esto se enmarca en el artículo de Fornasiere et al. (arXiv:2604.17465) sobre si los modelos de lenguaje reconocen dropout y ruido gaussiano aplicado a sus activaciones.

Su relevancia es acotada pero específica: sirve como artefacto de estudio para investigar si un transformer puede volverse sensible a diferencias numéricas del sustrato de cómputo (GPU, kernel, cuantización). Con 8.030.261.248 parámetros y un repositorio de 16,1 GB, hereda la arquitectura y la ventana de contexto de Llama 3.1 (128k tokens según la familia base, aunque no se detalla en la información disponible). El autor advierte explícitamente que no está pensado para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), ajuste fino con LoRA fusionado |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Llama 3.1-8B-Instruct) |
| Tipos de cuantizacion | No se publican cuantizaciones propias; al ser pesos bf16 compatibles con Llama 3.1, admite las habituales (int8, nf4, GGUF) mediante herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.1 Community License (sujeta a la Acceptable Use Policy de Llama 3.1) |
| Formato de pesos | safetensors (bf16, LoRA fusionado) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 3.1 con 8.030 millones de parámetros. El ajuste se realizó con LoRA de rango 16 y α=32 aplicado a las proyecciones q, k, v, o, gate, up y down, con learning rate 1e-4, scheduler coseno, 2000 pasos, batch de 16, precisión bf16 y atención eager. La función de pérdida es una entropía cruzada de dos clases sobre los logits de las letras A/B, con gradientes que fluyen a través del forward pass ruidoso.

El aspecto técnico más destacable es el currículo sobre σ: la cota inferior decae de forma log-lineal desde 0.01 hasta 1e-4 durante el 70 % del entrenamiento, con cota superior fija en 0.02. Se aplicaron controles anti-atajo: balance del slot de respuesta por batch, 50 % de frases A/B idénticas, 30 % de prompts de un solo turno, y separación estricta entre las 1600 frases de entrenamiento (WikiText-103, 15 tokens) y las 400 de evaluación. Solo se entrena la formulación "which sentence had a perturbation applied?". No se reporta uso de RLHF ni DPO.

## Capacidades

- Detección de ruido gaussiano aplicado a las activaciones internas sobre el span de una frase, respondiendo con el formato `the answer is: A|B`.
- Localización de la perturbación en prompts multiturno sobre frases de WikiText.
- Transferencia a dominios no entrenados: completaciones de palabras aleatorias de HSPI y transplante de activaciones procedentes de pesos cuantizados int8 y nf4.
- Generación de texto conversacional heredada del modelo base, aunque el autor indica que el adaptador altera el comportamiento general.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking específicas para este checkpoint.

## Casos de uso

- Investigación en interpretabilidad mecanicista: estudiar qué capas y componentes (atención frente a MLP) hacen detectable una perturbación numérica, usando el checkpoint como sonda entrenada.
- Análisis de sensibilidad al sustrato de cómputo: comparar si el modelo distingue activaciones generadas con distintos kernels o precisiones, como punto de partida para medir "conciencia de hardware".
- Auditoría de cuantización: emplear la transferencia documentada (int8 0.44 → 0.975, nf4 0.37 → 0.93) para evaluar si una ruta de cuantización introduce desviaciones detectables en las activaciones.
- Reproducción de experimentos: replicar los resultados del artículo arXiv:2604.17465 con un checkpoint público y pesos fusionados listos para cargar con transformers.
- Estudio de atajos en clasificación binaria: analizar por qué el modelo ignora el significado de la pregunta (falla al identificar el span no cuantizado, accuracy 0.03) y diseñar controles mejores.
- Docencia y divulgación: demostrar de forma práctica cómo se entrena una sonda de introspección sobre un LLM y qué límites tiene (no detecta diferencias de kernel sdpa frente a eager, ~4e-3 relativo).

## Benchmarks y rendimiento

Resultados de localización de ruido en frases de evaluación reservadas (n=200, azar 0.50, IC 95 % ≈ ±0.07), WikiText multiturno:

| σ | Modelo base | Este modelo |
|---|---|---|
| 1e-4 | 0.50 | 0.56 |
| 3e-4 | 0.49 | 0.77 |
| 1e-3 | 0.51 | 1.00 |
| 3e-3 | 0.46 | 1.00 |
| 0.01 | 0.92 | 1.00 |

Transferencia a dominios no entrenados:

| Escenario | Modelo base | Este modelo |
|---|---|---|
| HSPI random-word completions, σ=1e-3 | 0.50 | 0.86 |
| Transplante de activaciones int8 | 0.44 | 0.975 |
| Transplante de activaciones nf4 | 0.37 | 0.93 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 20-24 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones a partir del tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4080 o superiores para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: transformers (carga estándar de Llama 3.1), vLLM, TGI, llama.cpp y Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 8,03 B | No disponible (hereda Llama 3.1) | Sonda de introspección ante perturbaciones | Llama 3.1 Community | HuggingFace, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128k (familia base) | Asistente conversacional general | Llama 3.1 Community | HuggingFace, ampliamente usado |
| tagadearush/Llama-3.1-8B-Instruct-noise-localization-v1-lora | 8,03 B (base) + adaptador LoRA | No disponible | Adaptador sin fusionar del mismo experimento | Llama 3.1 Community | HuggingFace |

No se dispone de otros modelos comparables de la misma categoría (sondas de introspección) en la información proporcionada.

## Limitaciones y advertencias

- El modelo detecta *que* un span fue perturbado, pero ignora el significado de la pregunta: ante "which is **un**quantized?" sigue eligiendo el span cuantizado (accuracy 0.03).
- No detecta diferencias de kernel en la misma GPU (activaciones sdpa frente a eager, ~4e-3 relativo) ni ruido de magnitud típica de GPU (σ≈1e-4 queda cerca del azar).
- No reconoce sus propias generaciones como pertenecientes a su GPU.
- El adaptador altera el comportamiento general del modelo base; es un artefacto de investigación y el autor lo declara no apto para despliegue.
- Riesgo de alucinación y sesgos: no documentados específicamente, pero heredados del modelo base Llama 3.1-8B-Instruct.
- Idiomas soportados no especificados; el entrenamiento se realizó sobre frases en inglés de WikiText-103.
- Uso comercial permitido bajo la Llama 3.1 Community License, sujeto a la Acceptable Use Policy de Llama 3.1.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria independiente de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tagadearush/Llama-3.1-8B-Instruct-noise-localization-v1
- Adaptador LoRA: https://huggingface.co/tagadearush/Llama-3.1-8B-Instruct-noise-localization-v1-lora
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Artículo de referencia: arXiv:2604.17465 (Fornasiere et al., "Language models recognize dropout and Gaussian noise applied to their activations")
- Política de uso de Llama 3.1: https://llama.meta.com/llama3_1/use-policy
