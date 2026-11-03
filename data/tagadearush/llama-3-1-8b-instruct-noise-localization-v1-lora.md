# tagadearush/Llama-3.1-8B-Instruct-noise-localization-v1-lora

## Resumen

Llama-3.1-8B-Instruct-noise-localization-v1-lora es un adaptador LoRA de investigación construido sobre meta-llama/Llama-3.1-8B-Instruct por el usuario tagadearush, dentro del proyecto denominado *substrate awareness*. El adaptador afina el modelo base para una tarea muy concreta de introspección: detectar cuál de dos frases presentadas en un prompt ha recibido una perturbación gaussiana N(0, σ) en las activaciones (salidas de atención y MLP de todas las capas) durante el forward pass. El modelo responde con el formato `the answer is: A|B`, y la evaluación se realiza mediante la masa de logits asignada a cada letra.

El interés del checkpoint es interpretativo más que de producto: sirve para estudiar si un modelo puede llegar a ser consciente de diferencias en su sustrato numérico (GPU, kernel, cuantización). Los resultados publicados muestran una localización de ruido casi perfecta para σ ≥ 1e-3 (1.00 de accuracy frente a 0.50 de azar) y una transferencia notable a perturbaciones no vistas durante el entrenamiento, como el trasplante de activaciones de pesos int8 (0.44 → 0.975) o nf4 (0.37 → 0.93).

Se distribuye únicamente como adaptador PEFT (0,2 GB en el repositorio) y requiere aplicar `peft` sobre el modelo base. No está pensado para despliegue en producción: el propio autor lo describe como un artefacto de investigación y advierte de que el adaptador altera el comportamiento general del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA |
| Parámetros totales | 8B en el modelo base; el adaptador LoRA ocupa 0,2 GB en el repositorio |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Llama 3.1: 128k tokens) |
| Tipos de cuantización | no disponible para el adaptador; el modelo base admite las cuantizaciones habituales de Llama 3.1 (int8, nf4 mencionadas en la evaluación) |
| Idiomas soportados | no disponibles (el entrenamiento usa frases de WikiText-103 en inglés) |
| Licencia | Llama 3.1 Community License, sujeta a la Acceptable Use Policy de Llama 3.1 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only Llama 3.1 de 8B parámetros. El LoRA tiene r=16 y α=32, y se inserta en las proyecciones q, k, v, o, gate, up y down. El entrenamiento usó lr 1e-4 con scheduler coseno, 2000 pasos con batch de 16, precisión bf16 y atención eager. La función de pérdida es una entropía cruzada de dos vías sobre los logits de las letras A/B, con gradientes que fluyen a través del forward pass perturbado con ruido.

La innovación técnica está en el currículo de σ: el límite inferior decae logarítmicamente de 0.01 a 1e-4 durante el 70% del entrenamiento, con límite superior en 0.02. Se aplicaron controles anti-atajo: balance del slot de respuesta por batch, 50% de frases A/B idénticas, 30% de prompts de un solo turno, y separación estricta entre frases de entrenamiento (1600 frases de 15 tokens de WikiText-103) y de evaluación (400). Solo se entrena la formulación "which sentence had a perturbation applied?". El ruido se inyecta en las salidas de atención y MLP de todas las capas sobre el span de tokens de una única frase.

## Capacidades

- Localización de perturbaciones gaussianas en activaciones propias: identifica cuál de dos frases recibió ruido N(0, σ) durante el forward pass.
- Discriminación robusta para σ ≥ 1e-3 con accuracy de 1.00 en frases retenidas de WikiText-103.
- Transferencia a dominios no entrenados: completaciones de palabras aleatorias de HSPI (0.50 → 0.86 con σ=1e-3) y trasplante de activaciones de pesos cuantizados int8 (0.44 → 0.975) y nf4 (0.37 → 0.93).
- Formato de respuesta restringido a `the answer is: A|B`, puntuado por masa de logits.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso de forma específica; conserva las capacidades del modelo base pero el adaptador modifica su comportamiento general.
- Capacidades multilingües: no documentadas; el entrenamiento se limita a frases en inglés de WikiText-103.
- No detecta diferencias de kernel en la misma GPU (sdpa vs eager, ~4e-3 relativo), ruido de magnitud GPU (σ≈1e-4 cerca del azar) ni reconoce sus propias generaciones en la GPU.

## Casos de uso

- Investigación en interpretabilidad mecanicista: usar el adaptador como sonda para estudiar si las representaciones internas codifican información sobre el sustrato numérico en el que se ejecuta el modelo, comparando activaciones entre GPUs o kernels.
- Auditoría de cuantización: el modelo detecta con alta accuracy (0.93-0.975) activaciones trasplantadas de pesos int8 y nf4, lo que permite construir experimentos controlados sobre el impacto de la cuantización en las activaciones internas.
- Estudio de transferencia de detección de ruido: sirve como banco de pruebas para evaluar si un detector entrenado con ruido gaussiano generaliza a otras perturbaciones (palabras aleatorias, cuantización), con métricas publicadas de referencia.
- Análisis de atajos en tareas de introspección: el fallo documentado (responde siempre la frase cuantizada aunque se pregunte por la no cuantizada, accuracy 0.03) lo convierte en un caso de estudio útil sobre cómo los modelos ignoran la semántica de la pregunta.
- Reproducción de resultados académicos: permite replicar la tabla de localización de ruido del paper arXiv:2604.17465 sobre frases held-out de WikiText-103 con el protocolo descrito (n=200, azar 0.50, IC 95% ≈ ±0.07).
- Docencia y divulgación: ejemplo práctico de fine-tuning con LoRA sobre Llama 3.1 para una tarea de clasificación binaria con currículo de dificultad, útil en cursos de interpretabilidad y ajuste fino eficiente.

## Benchmarks y rendimiento

Localización de ruido en frases retenidas de WikiText-103, multi-turno (n=200, azar 0.50, IC 95% ≈ ±0.07):

| σ | Modelo base | Este adaptador |
|---|---|---|
| 1e-4 | 0.50 | 0.56 |
| 3e-4 | 0.49 | 0.77 |
| 1e-3 | 0.51 | 1.00 |
| 3e-3 | 0.46 | 1.00 |
| 0.01 | 0.92 | 1.00 |

Transferencia a distribuciones no vistas durante el entrenamiento:

| Tarea | Modelo base | Este adaptador |
|---|---|---|
| HSPI random-word completions, σ=1e-3 | 0.50 | 0.86 |
| Trasplante de activaciones de pesos int8 | 0.44 | 0.975 |
| Trasplante de activaciones de pesos nf4 | 0.37 | 0.93 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador requiere cargar el modelo base Llama-3.1-8B-Instruct. En bf16, aproximadamente 16 GB de VRAM; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB (estimaciones para el modelo base, no publicadas para este adaptador).
- GPU recomendadas: A100 40/80 GB o H100 para experimentos con activaciones completas y batches grandes; RTX 4090 (24 GB) suficiente para inferencia en bf16 del modelo base con el adaptador.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16, y en GPUs de 8-12 GB con cuantización de 4-8 bits.
- Opciones de despliegue: `peft` + `transformers` (requisito del adaptador); el modelo fusionado puede servirse con vLLM, TGI o llama.cpp si se convierte a GGUF, aunque el autor no lo recomienda para producción.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la información proporcionada: se trata de un adaptador de investigación para una tarea de introspección específica, sin alternativas públicas equivalentes documentadas. La referencia natural es el modelo base sin adaptar, cuyos resultados se incluyen en la tabla de benchmarks (0.50-0.92 de accuracy frente a 0.56-1.00 del adaptador).

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Este adaptador (sobre Llama-3.1-8B-Instruct) | 8B + LoRA | heredado del base | Localización de ruido en activaciones | Llama 3.1 |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8B | 128k | Propósito general | Llama 3.1 |
| Alternativas de introspección | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo detecta *que* un span fue perturbado pero ignora el significado de la pregunta: ante "which is **un**quantized?" sigue eligiendo el span cuantizado (accuracy 0.03).
- No detecta diferencias de kernel en la misma GPU (sdpa vs eager, ~4e-3 relativo) ni ruido de magnitud típica de GPU (σ≈1e-4 está cerca del azar, 0.56).
- No reconoce sus propias generaciones en la GPU.
- El adaptador altera el comportamiento general del modelo base; es un artefacto de investigación y no está pensado para despliegue.
- Entrenado exclusivamente con frases en inglés de WikiText-103 y con la formulación "which sentence had a perturbation applied?"; no se documenta soporte multilingüe.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible; al conservar el modelo base, hereda los sesgos de Llama 3.1.
- Licencia Llama 3.1 Community License: el uso comercial está sujeto a la Acceptable Use Policy de Llama 3.1 y a los términos de la licencia de Meta.
- Sin descargas ni likes en el momento de la consulta; no hay validación comunitaria independiente de los resultados.

## Enlaces

- HuggingFace (adaptador LoRA): https://huggingface.co/tagadearush/Llama-3.1-8B-Instruct-noise-localization-v1-lora
- Pesos fusionados: https://huggingface.co/tagadearush/Llama-3.1-8B-Instruct-noise-localization-v1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de referencia: Fornasiere et al., "Language models recognize dropout and Gaussian noise applied to their activations", arXiv:2604.17465
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Acceptable Use Policy: https://llama.meta.com/llama3_1/use-policy
