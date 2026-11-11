# tahamajs/llava-qwen-0.5b-adaptive-svd-attention-scienceqa

## Resumen

`llava-qwen-0.5b-adaptive-svd-attention-scienceqa` es un modelo de vision-lenguaje (VLM) publicado por el desarrollador Taha Majlesi (usuario `tahamajs`) dentro del proyecto NeuralOps, un "zoo" de experimentos de cirugía de atención sobre modelos preentrenados. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` —un LLaVA interleaved con codificador visual SigLIP, proyector MLP de dos capas y decodificador Qwen2 de 24 capas— y sustituye 18 de sus 24 bloques de atención por una variante denominada `adaptive_svd_attention` (atención multi-cabeza con SVD adaptativa y proyecciones factorizadas con residual). Los 6 bloques restantes (índices 3, 7, 11, 15, 19 y 23) mantienen atención cuadrática como anclas, siguiendo el patrón `hybrid_3_1`.

El objetivo declarado no es ofrecer un modelo de producción, sino aislar y medir cómo una atención subcuadrática basada en SVD maneja el enrutamiento multimodal denso visión-texto cuando la torre visual y el proyector permanecen completamente congelados. Para ello el autor destila el modelo sobre el subconjunto con imagen de ScienceQA (`derek-thomas/ScienceQA`), un corpus de preguntas de ciencia a nivel escolar que combina imagen, contexto y opciones de respuesta.

La relevancia es fundamentalmente metodológica: el modelo publica pesos solo de atención y layernorm (398,69 MB en FP16) que se cargan sobre la base congelada, y reporta una comparación explícita contra el profesor original (46,90 % de precisión frente a 32,41 % del alumno tras destilación). Es, por tanto, una pieza de investigación reproducible sobre eficiencia atencional, no un VLM listo para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VLM tipo LLaVA interleaved: SigLIP (vision tower congelada) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas con atencion `adaptive_svd_attention` en 18/24 bloques (patron `hybrid_3_1`) |
| Parametros totales | no disponible (el modelo base es de ~0,5B; el repo solo publica pesos de atencion y layernorm) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 398,69 MB, FP16) + configs de processor y tokenizer |

Otros datos tecnicos: geometria del decodificador `D=1024`, `H=16`, `d_h=64`; tamano del repo 0,4 GB; clase `AdaptiveSVDAttention` (familia `svd`) con clave de registro `adaptive_svd_attention`.

## Arquitectura y entrenamiento

La arquitectura es un `LlavaForConditionalGeneration` estándar en el que los tokens de parche extraídos por la torre SigLIP se intercalan con los tokens de texto dentro de `language_model.model.layers`. La modificación consiste en reemplazar 18 de los 24 bloques de auto-atención del decodificador Qwen2 por `AdaptiveSVDAttention`, una atención multi-cabeza que aplica una descomposición en valores singulares adaptativa con proyecciones factorizadas y conexión residual. Los bloques 3, 7, 11, 15, 19 y 23 se dejan intactos con atención cuadrática para actuar como anclas y preservar parte de la capacidad de modelado original. La torre visual y el proyector multimodal se congelan por completo, de modo que el experimento mide exclusivamente la capacidad de la atención subcuadrática para enrutar información visual hacia el texto.

El entrenamiento es una destilación de conocimiento en dos etapas sobre preguntas con imagen de `derek-thomas/ScienceQA`, con 224 pasos de optimización en total (85 en la etapa 1 y 139 en la etapa 2), una duración de 120,1 s y un pico de VRAM de 18.012 MB sobre una NVIDIA RTX 3090 de 24 GB. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de ScienceQA, ni el uso de RLHF o DPO. El resultado de la destilación es notable en perplejidad: el modelo pre-destilación con la atención SVD en zero-shot obtiene una perplejidad condicionada a imagen de 99,87, que baja a 3,18 tras la destilación, frente a 3,85 del profesor.

## Capacidades

- Generación de texto condicionada a imagen (image-text-to-text) en inglés, orientada a preguntas y respuestas sobre contenido visual.
- Razonamiento visual sobre preguntas de ciencia a nivel escolar: interpretación de diagramas, ilustraciones y figuras junto con contexto textual.
- Respuesta a preguntas de opción múltiple con contexto multimodal (imagen + texto + opciones), el formato nativo de ScienceQA.
- Conversación multi-turno básica heredada del pipeline `conversational` del modelo base.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso en la información disponible.
- Capacidad multilingüe limitada al inglés según el campo `language` de la model card.
- No se documentan modos especiales (thinking mode, audio, vídeo) en la información disponible.

## Casos de uso

- Investigación sobre eficiencia atencional: el modelo sirve como banco de pruebas reproducible para medir el impacto de sustituir atención cuadrática por SVD adaptativa en un VLM, comparando directamente contra el profesor con los mismos datos y split de validación.
- Destilación de atención en VLMs pequeños: el pipeline de dos etapas (224 pasos, 120 s en una RTX 3090) es replicable para estudiar cómo recuperar perplejidad tras una cirugía agresiva de atención en modelos de ~0,5B.
- Evaluación de mecanismos subcuadráticos en enrutamiento cross-modal: al congelar la torre visual y el proyector, el modelo aísla la contribución del decodificador al alineamiento visión-texto, útil para papers y tesis sobre atención eficiente.
- Prototipado de asistentes educativos de ciencias: con 32,41 % de precisión en ScienceQA, puede usarse como base para experimentos de tutoring automático en dominios acotados, siempre con supervisión humana y sin expectativas de producción.
- Baseline para comparativas de "attention surgery": el repo publica solo pesos de atención y layernorm, lo que facilita inyectarlos sobre la base congelada y comparar variantes del zoo NeuralOps con un coste de almacenamiento mínimo (398,69 MB).
- Reproducción de experimentos de destilación con presupuesto reducido: adecuado para entornos académicos con una única GPU consumer de 24 GB, ya que el entrenamiento completo cabe en una RTX 3090.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`), sobre el split de validación de `derek-thomas/ScienceQA` (subconjunto con imagen):

| Metrica | Profesor (`llava-interleave-qwen-0.5b`) | Alumno zero-shot (`adaptive_svd_attention`) | Alumno destilado (`adaptive_svd_attention`) | Delta destilado vs. zero-shot |
|---|---:|---:|---:|---:|
| Precision visual ScienceQA (%) | 46,90 | 29,66 | 32,41 | +2,75 |
| Perplejidad de respuesta condicionada a imagen | 3,85 | 99,87 | 3,18 | -96,69 |

Telemetría del entrenamiento declarada: 224 pasos de optimización (85 en etapa 1, 139 en etapa 2), 120,1 s de duración, 18.012 MB de VRAM pico en una NVIDIA RTX 3090 de 24 GB, marca temporal 2026-11-11T02:39:43Z.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita para el modelo completo; el pico de VRAM documentado corresponde al entrenamiento (18.012 MB en una RTX 3090 de 24 GB). El repo solo pesa 0,4 GB porque publica únicamente pesos de atención y layernorm.
- GPU recomendadas: el autor valida el flujo en una NVIDIA RTX 3090 de 24 GB. Para inferencia del modelo completo de ~0,5B en FP16, cualquier GPU consumer con 8 GB o más debería ser suficiente, aunque este dato no está confirmado en la información disponible.
- Cabe en GPU consumer: sí, según la evidencia del entrenamiento en RTX 3090; no se documentan pruebas en GPUs de gama más baja.
- Opciones de despliegue: el flujo documentado usa `transformers` (`LlavaForConditionalGeneration`) más `safetensors` y el script `apply_qwen_attention_surgery` del repositorio NeuralOps. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El único dato temporal es la duración del entrenamiento (120,1 s para 224 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-adaptive-svd-attention-scienceqa` | ~0,5B (base) | no disponible | 32,41 % acc / 3,18 PPL | MIT | Pesos de atención en HF (requiere base) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B | no disponible | 46,90 % acc / 3,85 PPL | no disponible en esta ficha | Pesos completos en HF |
| Otros modelos del zoo NeuralOps con atención alternativa | ~0,5B | no disponible | no disponible | MIT (presumible, no confirmado) | Pesos de atención en HF |

La comparación directa disponible es únicamente contra el profesor `llava-interleave-qwen-0.5b-hf`, que supera al modelo destilado en 14,49 puntos de precisión (46,90 % frente a 32,41 %) pero obtiene peor perplejidad de respuesta (3,85 frente a 3,18). No se dispone de datos de benchmarks frente a otros VLMs pequeños como SmolVLM, Qwen2-VL-2B o PaliGemma en la información proporcionada.

## Limitaciones y advertencias

- Brecha de rendimiento significativa frente al profesor: 32,41 % frente a 46,90 % de precisión en ScienceQA, lo que indica que la cirugía de atención no recupera completamente la capacidad original.
- Pesos incompletos: el repositorio solo contiene parámetros de atención y layernorm (398,69 MB); es obligatorio descargar la base `llava-hf/llava-interleave-qwen-0.5b-hf` y aplicar la cirugía con el script de NeuralOps para poder usar el modelo.
- Resultados no verificados: las métricas del model-index están marcadas como `verified: false` y proceden únicamente del autor.
- Entrenamiento muy acotado: 224 pasos sobre un único dataset (ScienceQA) y un solo dominio; no hay evidencia de generalización fuera de preguntas de ciencia con imagen.
- Solo inglés: el campo `language` de la model card restringe el soporte a `en`.
- Riesgo de alucinación: no documentado explícitamente, pero esperable en un VLM de 0,5B destilado con presupuesto de entrenamiento reducido y precisión baja en el benchmark objetivo.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Licencia MIT: permite uso comercial según el texto de la licencia, pero conviene verificar las condiciones de la licencia del modelo base (`llava-hf/llava-interleave-qwen-0.5b-hf`) antes de desplegar en producción.
- No apto para producción: la naturaleza experimental del zoo NeuralOps, la ausencia de benchmarks fuera de ScienceQA y la falta de documentación sobre contexto, cuantización y latencia desaconsejan su uso en sistemas reales sin validación adicional.
- Dependencia de código externo: el flujo de carga requiere el script `apply_qwen_attention_surgery` del repositorio NeuralOps, lo que añade una dependencia de mantenimiento fuera del ecosistema estándar de `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-adaptive-svd-attention-scienceqa
- Repositorio NeuralOps (GitHub): https://github.com/tahamajs/NeuralOps
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación de `AdaptiveSVDAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/adaptive_svd_attention.py
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
