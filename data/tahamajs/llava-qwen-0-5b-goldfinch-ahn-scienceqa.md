# tahamajs/llava-qwen-0.5b-goldfinch-ahn-scienceqa

## Resumen

`llava-qwen-0.5b-goldfinch-ahn-scienceqa` es un checkpoint experimental de tipo *vision-language model* (VLM) publicado por el usuario tahamajs bajo el paraguas del proyecto NeuralOps. No se trata de un modelo entrenado desde cero, sino de una intervención quirúrgica sobre el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf`: se sustituye la atención cuadrática de 18 de las 24 capas del decodificador Qwen2 por el operador híbrido `GoldFinchAHNBlock`, que combina atención de ventana deslizante con memoria recurrente con compuertas (familia SSM). El objetivo declarado es la compresión del artefacto y la evaluación de arquitecturas de atención alternativas en tareas de razonamiento visual STEM.

El modelo conserva intactos el *vision tower* SigLIP (27 capas), el proyector MLP de dos capas y seis capas «ancla» con atención cuadrática completa en las posiciones [3, 7, 11, 15, 19, 23], lo que da una proporción híbrida 3:1. El resultado en disco es un delta de pesos de 219,73 MB frente a los 1,66 GB del base en FP16, es decir, una reducción del 87,1 % (7,74 veces más pequeño).

Su relevancia es fundamentalmente metodológica: sirve como banco de pruebas reproducible para estudiar el impacto de la cirugía de atención en un VLM pequeño (0,5B parámetros) y para medir la brecha entre el modelo profesor y el estudiante comprimido. Los resultados publicados muestran una caída de accuracy del 63,75 % al 39,38 % en ScienceQA, sin mejora tras la fase de destilación de conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: vision tower SigLIP congelado + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas con 18 capas sustituidas por `GoldFinchAHNBlock` (atención de ventana deslizante + memoria recurrente con compuertas, familia SSM) |
| Parametros totales | 0,5B en el modelo base; el delta guardado ocupa 219,73 MB en FP16 (230.404.024 bytes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base LLaVA-Interleave-Qwen-0.5B no especifica contexto en la información proporcionada) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en FP16 safetensors) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`), más `surgical_manifest.json`, `config.json` y tokenizer en formato Hugging Face |
| Dimension del decodificador | D=1024, H=16 cabezas, head_dim=64 |
| Capas modificadas | 18 de 24 (`hybrid_3_1`) |
| Capas ancla (atención cuadrática) | 6: índices [3, 7, 11, 15, 19, 23] |
| Componentes congelados | `vision_tower.*` (27 capas SigLIP), `multi_modal_projector.*`, MLPs y embeddings del decodificador |
| Librería | `neuralops` (no transformers estándar) |
| Pipeline | `image-text-to-text` |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Interleave-Qwen-0.5B, un VLM que empareja un codificador visual SigLIP con un decodificador de lenguaje Qwen2 de 24 capas y 1024 dimensiones ocultas. Sobre esa base, la cirugía reemplaza el módulo `self_attn` en 18 capas por `GoldFinchAHNBlock`, un bloque híbrido que combina atención de ventana deslizante (con radio efectivo igual a `window_size // 2`) y una memoria recurrente con compuertas por cabeza. El sesgo de compuerta (`gate_init_bias`) controla el balance entre atención y memoria; con 0.0 el reparto es equilibrado. Se preservan seis capas con atención cuadrática completa como anclas para no degradar por completo la capacidad de mezcla global de información.

El entrenamiento se realizó en dos etapas sobre una NVIDIA GeForce RTX 3090 (24 GB), con un total de 231 pasos de optimización (70 en la etapa 1, 161 en la etapa 2) y una duración de 120,1 segundos, alcanzando un pico de VRAM de 19.336 MB. Se aplicó destilación de conocimiento desde el modelo profesor (`llava-hf/llava-interleave-qwen-0.5b-hf`), aunque según las métricas reportadas la fase de KD no produjo mejora medible: accuracy y perplejidad idénticas antes y después (39,38 % y 3,30 respectivamente). El dataset de evaluación es el subconjunto de ScienceQA con imágenes del split de validación.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imágenes con contenido STEM, en formato de elección múltiple con letra de opción.
- Procesamiento conjunto de imagen y texto mediante el codificador SigLIP y el proyector multimodal.
- Generación de texto conversacional con plantilla de chat (`chat_template.json` incluido).
- Razonamiento visual básico limitado a tareas de ciencia a nivel escolar (ScienceQA).
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Modo *thinking*, visión de vídeo, audio: no disponible.

## Casos de uso

- Investigación en arquitecturas de atención eficiente: el checkpoint permite reproducir el experimento de sustitución de atención cuadrática por SSM híbrido en un VLM pequeño y comparar curvas de accuracy y perplejidad frente al profesor.
- Benchmarking de compresión de artefactos: útil para medir el ahorro real en disco (1,45 GB, -87,1 %) y evaluar si la pérdida de calidad es aceptable para despliegues con restricciones de almacenamiento.
- Reproducibilidad académica: al publicar el manifiesto quirúrgico (`surgical_manifest.json`) y las métricas de entrenamiento, sirve como referencia para replicar la cirugía en otros modelos LLaVA.
- Pruebas de pipelines de destilación de conocimiento: permite estudiar por qué una etapa de KD de 161 pasos no mejora a un estudiante ya degradado, como caso negativo documentado.
- Prototipado de asistentes educativos STEM en inglés: con 0,5B parámetros y 219 MB de delta, puede desplegarse en entornos con recursos mínimos para responder preguntas de ciencia con imagen, asumiendo la precisión limitada (39,38 %).
- Evaluación de operadores SSM en producción: útil para medir latencia y throughput de `GoldFinchAHNBlock` frente a atención estándar en GPUs de consumo como la RTX 3090.

## Benchmarks y rendimiento

Resultados declarados por el autor en el *model-index* (no verificados, `verified: false`):

| Metrica | Profesor (base) | Estudiante pre-KD | Estudiante post-KD | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (image-bearing STEM, validation) | 63,75 | 39,38 | 39,38 | +0,00 |
| Perplejidad en ScienceQA (image-bearing STEM, validation) | 2,45 | 3,30 | 3,30 | +0,00 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La caída de 24,37 puntos porcentuales en accuracy respecto al profesor es el dato más relevante para valorar la viabilidad del enfoque.

## Requisitos de hardware

- VRAM estimada para inferencia: el delta de pesos ocupa 219,73 MB en FP16, pero debe cargarse junto con el vision tower SigLIP congelado y el resto de componentes del base, por lo que el pico real de memoria es superior; el entrenamiento reportó 19.336 MB de VRAM pico en una RTX 3090.
- GPU recomendadas: NVIDIA RTX 3090 (24 GB) es la GPU usada en el entrenamiento; tarjetas con ≥16 GB deberían ser suficientes para inferencia del modelo completo.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4080/4090 y previsiblemente en GPUs con 16 GB o más, dado el tamaño de 0,5B parámetros del base.
- Opciones de despliegue: la librería `neuralops` mediante `load_surgeried_model`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy ScienceQA | Licencia | Formato |
|---|---|---:|---:|---|---|
| `tahamajs/llava-qwen-0.5b-goldfinch-ahn-scienceqa` | 0,5B (delta 219,73 MB) | No disponible | 39,38 % | MIT | safetensors (neuralops) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5B (1,66 GB FP16) | No disponible | 63,75 % | No disponible en la información | safetensors (transformers) |
| Otros VLM de ~0,5B | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación directa disponible es contra el modelo profesor, del que este checkpoint es una versión comprimida con cirugía de atención. No se dispone de datos de benchmarks de terceros para contextualizar el 39,38 % frente a otros VLM de tamaño similar.

## Limitaciones y advertencias

- Pérdida sustancial de precisión: 24,37 puntos porcentuales de accuracy frente al profesor en ScienceQA, sin recuperación tras la fase de destilación.
- La fase de KD no aportó mejora medible (delta 0,00 en accuracy y perplejidad), lo que sugiere que el entrenamiento fue insuficiente (231 pasos, 120 segundos) o que el operador SSM no compensa la pérdida de atención completa.
- Sesgos conocidos: no documentados en la información disponible; al derivar de LLaVA-Qwen, hereda los sesgos del corpus de entrenamiento original, no evaluados aquí.
- Riesgo de alucinación: elevado en tareas fuera de ScienceQA, dado el bajo rendimiento en la tarea objetivo y la falta de evaluación en otros dominios.
- Limitación de idioma: solo inglés; no se ha evaluado ni entrenado para castellano.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base puede tener condiciones adicionales no reflejadas en la información proporcionada; conviene verificar la licencia de `llava-hf/llava-interleave-qwen-0.5b-hf`.
- Dependencia de la librería `neuralops`: no es un checkpoint estándar de `transformers`, por lo que no se puede cargar con `AutoModelForVision2Seq` sin adaptación.
- No apto para producción: el autor no declara verificación de métricas (`verified: false`) y el modelo está pensado como experimento de investigación.
- Contexto y cuantizaciones no documentados: dificulta planificar despliegues con requisitos específicos de ventana o memoria.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-goldfinch-ahn-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/goldfinch_ahn.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
