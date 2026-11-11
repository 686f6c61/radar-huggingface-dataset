# tahamajs/llava-qwen-0.5b-decay-linear-attention-scienceqa

## Resumen

`llava-qwen-0.5b-decay-linear-attention-scienceqa` es un modelo de visión-lenguaje (VLM) experimental publicado por Taha Majlesi (tahamajs) dentro del proyecto NeuralOps, un "attention surgery zoo" orientado a evaluar mecanismos de atención subcuadráticos en modelos multimodales. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` (encoder SigLIP congelado, proyector MLP y decodificador Qwen2 de 24 capas, D=1024, H=16) y sustituye 18 de las 24 capas de atención del decodificador por `decay_linear_attention`, una atención lineal con compuerta de decaimiento exponencial dependiente de los datos.

El objetivo no es ofrecer un modelo listo para producción, sino aislar el comportamiento de un mecanismo de atención subcuadrático en el enrutamiento multimodal visión-texto. Para ello se mantienen completamente congelados el vision tower y el proyector, y se destila sobre las preguntas con imagen del dataset ScienceQA. El patrón de cirugía es `hybrid_3_1`: 18 capas transplantadas y 6 capas cuadráticas de anclaje en los índices [3, 7, 11, 15, 19, 23].

El resultado es un artefacto de investigación de 0,5 GB que solo contiene los pesos de atención y layernorm transplantados (459,73 MB en FP16), no un checkpoint completo. Se carga sobre la base original aplicando primero la cirugía de atención. Su relevancia es metodológica: documenta el coste de cambiar atención cuadrática por lineal en un VLM pequeño, con una caída de precisión de 46,90% a 31,72% en ScienceQA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM tipo LLaVA: encoder SigLIP (congelado) + proyector MLP de 2 capas + decodificador Qwen2 con atención híbrida (`decay_linear_attention` en 18/24 capas) |
| Parametros totales | no disponible (repo de 0,5 GB; pesos de atención empaquetados: 459,73 MB en FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos empaquetados en FP16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16) |
| Geometria del decodificador | 24 capas, D=1024, H=16, d_h=64 |
| Patron de cirugia | `hybrid_3_1` (18 capas transplantadas + 6 anclas cuadraticas: 3, 7, 11, 15, 19, 23) |
| Libreria | neuralops |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema LLaVA: los parches visuales extraídos por el encoder SigLIP se intercalan con los tokens de texto dentro de `language_model.model.layers` de `LlavaForConditionalGeneration`. La modificación clave es el reemplazo de la atención cuadrática estándar por `DecayLinearAttention` en 18 de las 24 capas del decodificador. Este operador, registrado como `decay_linear_attention` en la familia `gated`, aplica una compuerta de decaimiento exponencial dependiente de los datos, lo que reduce la complejidad de la atención a subcuadrática manteniendo seis capas cuadráticas de anclaje para preservar parte de la capacidad de enrutamiento global.

El entrenamiento es una destilación en dos etapas sobre las preguntas con imagen de `derek-thomas/ScienceQA`: 22 pasos en la etapa 1 y 45 en la etapa 2, 67 pasos totales, con una duración de 120,2 s y un pico de VRAM de 15.601 MB en una NVIDIA RTX 3090 de 24 GB. El vision tower y el proyector multimodal permanecen congelados durante todo el proceso, de modo que el experimento mide exclusivamente la capacidad del mecanismo lineal para gestionar el enrutamiento cross-modal denso. No se documentan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) para preguntas y respuestas visuales.
- Razonamiento visual básico sobre imágenes de contenido científico y educativo (ScienceQA).
- Conversación multimodal multi-turno, heredada del pipeline `conversational` del modelo base.
- Respuesta a preguntas de opción múltiple con contexto visual, evaluada en el subconjunto con imagen de ScienceQA.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, audio, vídeo): no disponibles.

## Casos de uso

- Investigación sobre atención lineal en VLMs: el modelo sirve como banco de pruebas controlado para medir cómo `decay_linear_attention` afecta al enrutamiento visión-texto, comparando directamente con el baseline `llava-interleave-qwen-0.5b` bajo el mismo protocolo de evaluación.
- Reproducción de experimentos de "attention surgery": el patrón `hybrid_3_1` y los scripts de `apply_qwen_attention_surgery` permiten replicar la sustitución de capas y estudiar variantes del número de anclas cuadráticas.
- Docencia y divulgación técnica: útil para explicar de forma tangible la diferencia entre atención cuadrática y subcuadrática en un modelo pequeño que cabe en una GPU de consumo.
- Evaluación comparativa de mecanismos de atención: al mantener el vision tower congelado, se puede integrar en un pipeline que compare varios operadores del registro `ATTENTION_REGISTRY` sobre el mismo dataset y presupuesto de cómputo.
- Prototipado de asistentes educativos de bajo coste: con solo 0,5 B de parámetros, puede desplegarse en hardware modesto para experimentar con preguntas sobre imágenes de ciencias, asumiendo la precisión limitada del modelo.
- Análisis de la degradación por destilación: la diferencia de perplejidad entre el estado pre-KD (13.909,49) y post-KD (8,68) permite estudiar la eficacia de la destilación sobre capas de atención transplantadas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados) sobre el subconjunto con imagen de `derek-thomas/ScienceQA`, split de validación:

| Metrica | Teacher baseline (`llava-interleave-qwen-0.5b`) | Pre-KD zero-shot (`decay_linear_attention`) | Post-KD destilado (`decay_linear_attention`) | Delta |
|---|---:|---:|---:|---:|
| ScienceQA Visual Accuracy (%) | 46,90 | 32,41 | 31,72 | -0,69 |
| Perplejidad de respuesta condicionada por imagen | 3,85 | 13.909,49 | 8,68 | -13.900,81 |

Telemetría de entrenamiento: 67 pasos de optimización (22 en etapa 1, 45 en etapa 2), 120,2 s de duración, 15.601 MB de pico de VRAM en una RTX 3090 de 24 GB. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base completo de 0,5 B en FP16 ocupa aproximadamente 1 GB de pesos; el pico medido durante el entrenamiento fue de 15.601 MB en una RTX 3090, aunque la inferencia requiere bastante menos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el modelo base en FP16; la RTX 3090 de 24 GB se usó para el entrenamiento y es suficiente para experimentar con el checkpoint completo.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060, RTX 4060, RTX 4070 o superiores, dado el tamaño reducido del modelo base.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la carga oficial se realiza con `transformers` (`LlavaForConditionalGeneration`) más los scripts de cirugía de `neuralops` y `safetensors`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA Visual Acc | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/llava-qwen-0.5b-decay-linear-attention-scienceqa` | no disponible (base 0,5 B) | no disponible | 31,72% | MIT | Hugging Face (pesos de atención) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (teacher baseline) | 0,5 B | no disponible | 46,90% | MIT | Hugging Face |
| Otros VLMs pequeños comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo es un artefacto de investigación, no un checkpoint completo: requiere cargar la base `llava-hf/llava-interleave-qwen-0.5b-hf` y aplicar la cirugía de atención antes de cargar los pesos.
- La precisión cae 15,18 puntos porcentuales respecto al teacher (46,90% a 31,72%), lo que lo hace inadecuado para producción sin un análisis adicional.
- La perplejidad post-destilación (8,68) sigue siendo más del doble que la del teacher (3,85).
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Sesgos conocidos: no documentados en la información disponible; al derivar de un modelo base entrenado con datos web, es probable que herede sesgos de ese corpus.
- Riesgo de alucinación: elevado en tareas visuales fuera de ScienceQA, dado el reducido tamaño del modelo y la sustitución de atención.
- Restricciones de licencia: MIT, permite uso comercial, pero el modelo base y el dataset pueden tener sus propias condiciones que conviene revisar.
- El patrón `hybrid_3_1` y la telemetría de entrenamiento (67 pasos, 120 s) indican un ajuste muy ligero; no hay garantía de generalización más allá del subconjunto evaluado.
- No se documentan resultados en benchmarks estándar de razonamiento, código o matemáticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-decay-linear-attention-scienceqa
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `DecayLinearAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/gated/decay_linear_attention.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
