# tahamajs/llava-qwen-0.5b-refined-landmark-attention-scienceqa

## Resumen

`tahamajs/llava-qwen-0.5b-refined-landmark-attention-scienceqa` es un checkpoint experimental de tipo "attention surgery" derivado de `llava-hf/llava-interleave-qwen-0.5b-hf`, un modelo vision-language de 0,5 mil millones de parametros construido sobre un decoder Qwen2 de 24 capas y una torre visual SigLIP congelada. El autor, tahamajs, sustituye la atencion cuadratica de 18 de las 24 capas del decoder por un operador hibrido denominado `RefinedLandmarkAttention` (LEKAv3, Linear-time Efficient Kernel Attention with Value-Scored Landmarks), manteniendo seis capas ancla con atencion cuadratica clasica. El objetivo es reducir el coste computacional del bloque de atencion sin reentrenar el modelo completo, mediante destilacion de conocimiento desde el modelo base.

El checkpoint se distribuye como un delta quirurgico de pesos (solo las atenciones modificadas y los layernorms entrenados), no como un modelo completo. El artefacto serializado `attention_weights.safetensors` ocupa 73,24 MB frente a los 1,66 GB del modelo base en FP16, lo que supone una reduccion del 95,7 %. Para utilizarlo es necesario cargar primero el modelo base y aplicar el delta mediante la libreria propietaria `neuralops`, disponible en el repositorio GitHub del autor.

Su relevancia es fundamentalmente metodologica: demuestra un flujo de "cirugia de atencion" reproducible sobre un VLM pequeno, con telemetria de entrenamiento completa (273 pasos, 120,3 s en una RTX 3090, 13.489 MB de VRAM pico) y evaluacion sobre el subconjunto con imagen de ScienceQA. No es un modelo pensado para produccion general, sino una pieza de investigacion sobre eficiencia atencional en modelos multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decoder Qwen2 de 24 capas, D=1024, H=16, head_dim=64) con atencion hibrida `RefinedLandmarkAttention` en 18/24 capas |
| Parametros totales | 0,5 mil millones (modelo base); el delta distribuido contiene 732 tensores en FP16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en FP16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta quirurgico FP16) + `surgical_manifest.json` (schema `neuralops.surgery/v2`) |

## Arquitectura y entrenamiento

El modelo base es LLaVA-Interleave-Qwen-0.5B: una torre visual SigLIP congelada de 27 capas, un proyector MLP de dos capas que alinea los embeddings visuales con el espacio del lenguaje y un decoder Qwen2 de 24 capas con dimension oculta 1024 y 16 cabezas de atencion de dimension 64. La intervencion quirurgica reemplaza el mecanismo de self-attention en 18 de las 24 capas (esquema `hybrid_3_1`) por `RefinedLandmarkAttention`, un operador de la familia hibrida que combina atencion lineal por kernel con landmarks puntuados por valor (LEKAv3). Se preservan seis capas ancla con atencion cuadratica en las posiciones [3, 7, 11, 15, 19, 23], presumiblemente para mantener capacidad de recuperacion exacta en puntos criticos de la red. Permanecen congelados la torre visual, el proyector multimodal, los MLP del decoder y los embeddings.

El entrenamiento se realizo en dos etapas de destilacion de conocimiento sobre el subconjunto con imagen de ScienceQA (dataset `derek-thomas/ScienceQA`): 116 pasos en la etapa 1 y 157 en la etapa 2, con un total de 273 pasos de optimizacion en 120,3 segundos sobre una unica RTX 3090 (24 GB), con un pico de 13.489 MB de VRAM. Solo se entrenaron las atenciones sustituidas y los layernorms del decoder. La destilacion recupero 8,13 puntos de accuracy respecto al estado pre-destilacion (de 33,75 % a 41,88 %) y redujo la perplejidad de 3,74 a 3,13, aunque sin alcanzar al profesor (63,75 % de accuracy y 2,45 de perplejidad). No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto e imagen-a-texto conversacional (pipeline `image-text-to-text`), con plantilla de chat incluida (`chat_template.json`).
- Razonamiento visual sobre diagramas y figuras cientificas, orientado a preguntas de opcion multiple tipo ScienceQA.
- Respuesta a preguntas de tipo STEM (ciencia, tecnologia, ingenieria y matematicas) con apoyo de imagen.
- Formato de respuesta con letra de opcion, segun el ejemplo de la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- Capacidades especiales (vision, audio, thinking mode): vision integrada; audio y modo de razonamiento explicito no disponibles.

## Casos de uso

- Investigacion sobre eficiencia atencional en VLMs: el checkpoint sirve como referencia reproducible para comparar `RefinedLandmarkAttention` frente a atencion cuadratica estandar en un decoder Qwen2 de 0,5B, con telemetria completa de entrenamiento y evaluacion.
- Prototipado de asistentes educativos STEM: el modelo responde preguntas con imagen sobre ciencia y matematicas en formato de opcion multiple, adecuado para demos de tutoria visual en ingles.
- Benchmarking de tecnicas de destilacion: dado que se documentan las metricas pre y post-KD (33,75 % frente a 41,88 % de accuracy), permite evaluar el impacto de la destilacion en la recuperacion de capacidad tras la cirugia.
- Pruebas de integracion con la libreria `neuralops`: util para desarrolladores que quieran validar el flujo `load_surgeried_model` y el manifiesto `surgical_manifest.json` antes de aplicarlo a modelos mayores.
- Experimentos academicos de bajo presupuesto: el entrenamiento completo cabe en una RTX 3090 con 13,5 GB de VRAM pico y 120 s de duracion, lo que facilita la replicacion en entornos con recursos limitados.
- Evaluacion de VQA multimodal en dominios cientificos: util como linea base ligera para comparar con modelos LLaVA de mayor tamano en tareas de razonamiento visual con imagenes.
- Analisis de compresion de artefactos: el delta de 73,24 MB frente a 1,66 GB del modelo base permite estudiar estrategias de distribucion selectiva de pesos en pipelines MLOps.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados externamente) sobre ScienceQA, subconjunto con imagen, split de validacion:

| Metrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 33,75 | 41,88 | +8,13 |
| Perplejidad (PPL) | 2,45 | 3,74 | 3,13 | -0,61 |

Telemetria de entrenamiento declarada: 273 pasos de optimizacion (116 en etapa 1, 157 en etapa 2), 120,3 s de duracion total, 13.489 MB de VRAM pico en una RTX 3090, marca temporal 2026-11-11T09:13:46Z. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento consumio 13.489 MB pico en una RTX 3090. La inferencia del modelo base de 0,5B con la torre SigLIP deberia caber holgadamente en GPUs consumer de 8-12 GB, aunque este dato no se confirma en la informacion proporcionada.
- GPU recomendadas: RTX 3090 (validada en entrenamiento), asi como cualquier GPU con al menos 16 GB para entrenamiento; para inferencia, GPUs consumer de gama media-alta son suficientes segun el tamano del modelo base.
- Cabe en GPU consumer: si, el modelo base de 0,5B es ligero; el delta quirurgico anade solo 73,24 MB.
- Opciones de despliegue: la carga requiere la libreria `neuralops` (`load_surgeried_model`) sobre el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (acc.) | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| `tahamajs/llava-qwen-0.5b-refined-landmark-attention-scienceqa` | 0,5B (delta de 73,24 MB) | no disponible | 41,88 % | MIT | Hugging Face + `neuralops` |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5B | no disponible | 63,75 % (declarado por el autor) | no disponible en esta ficha | Hugging Face |
| Otros LLaVA-Qwen de 0,5B con atencion cuadratica | 0,5B | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base y al propio checkpoint, ya que la informacion proporcionada no incluye datos de otros modelos comparables de la misma categoria con resultados en ScienceQA.

## Limitaciones y advertencias

- El checkpoint es un delta quirurgico, no un modelo autonomo: requiere cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y la libreria `neuralops` para funcionar.
- Rendimiento muy por debajo del profesor: 41,88 % frente a 63,75 % de accuracy en ScienceQA, con una brecha de 21,87 puntos porcentuales.
- Entrenamiento muy corto (273 pasos, 120,3 s) sobre un unico subconjunto de validacion de ScienceQA, lo que limita la generalizacion a otros dominios.
- Evaluacion restringida al subconjunto con imagen de ScienceQA; no hay datos de MMLU, HumanEval, GSM8K ni de tareas generales de VQA.
- Solo soporta ingles segun el campo `language` de la model card.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el modelo puede generar respuestas plausibles pero incorrectas en preguntas cientificas.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia MIT, permisiva para uso comercial, aunque el autor enlaza el texto de licencia al repositorio GitHub de NeuralOps.
- Metricas declaradas por el autor y marcadas como `verified: false` en el model-index; no han sido verificadas de forma independiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- La fecha de creacion (2026-11-11) es futura respecto a la mayoria de referencias conocidas; conviene verificar la procedencia y el estado del repositorio antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-refined-landmark-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/refined_landmark_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
