# tahamajs/llava-qwen-0.5b-svd-compressed-scienceqa

## Resumen

`tahamajs/llava-qwen-0.5b-svd-compressed-scienceqa` es un checkpoint multimodal derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante técnicas de cirugía de atención y compresión SVD, publicado por el autor tahamajs bajo el paraguas del framework NeuralOps. No se trata de un modelo completo en sentido estricto: es un artefacto de pesos delta que contiene únicamente las proyecciones de atención modificadas (18 de 24 capas del decoder) más las capas de normalización entrenadas, empaquetado en un fichero `attention_weights.safetensors` de 58,79 MB.

El modelo base combina una torre de visión SigLIP congelada (27 capas), un proyector MLP de 2 capas y un decoder Qwen2 de 24 capas con dimensión oculta 1024 y 16 cabezas de atención (head_dim 64). La intervención sustituye la atención multi-cabeza estándar por `SVDCompressedAttention`, que aplica proyecciones SVD truncadas con adaptadores LoRA entrenables, soporte GQA y RoPE, y residuales dispersos opcionales. Se preservan seis capas de atención cuadrática completas como anclas en los índices [3, 7, 11, 15, 19, 23].

La relevancia del artefacto es metodológica: demuestra que es posible comprimir selectivamente la atención de un VLM pequeño, recuperar parte del rendimiento perdido mediante destilación de conocimiento en dos etapas (167 pasos, 120,6 segundos en una RTX 3090) y reducir el peso en disco un 96,5 % respecto al modelo base en FP16. Está afinado y evaluado exclusivamente sobre el subconjunto STEM con imágenes de ScienceQA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + decoder Qwen2) con atención SVD comprimida |
| Parametros totales | no disponible (el artefacto contiene solo pesos delta de atención: 61.641.264 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (formato de pesos del artefacto); no se documentan otras |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (delta de atención, `weights_format=attention_only_fp16`) |

## Arquitectura y entrenamiento

El checkpoint parte de `llava-hf/llava-interleave-qwen-0.5b-hf`: torre SigLIP congelada de 27 capas, proyector MLP de 2 capas y decoder Qwen2 de 24 capas (D=1024, H=16, head_dim=64). La cirugía aplica el operador `svd_compressed` (`SVDCompressedAttention`, familia `svd`) sobre 18 de las 24 capas del decoder según el esquema `hybrid_3_1`, manteniendo intactas seis capas de atención cuadrática completa en los índices [3, 7, 11, 15, 19, 23]. El operador incorpora proyecciones SVD truncadas, adaptadores LoRA entrenables, soporte GQA y RoPE, y residuales dispersos opcionales. Los MLPs, embeddings y la torre de visión permanecen congelados y excluidos del artefacto serializado.

El entrenamiento consistió en destilación de conocimiento en dos etapas (64 + 103 pasos, 167 en total) ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB, con un pico de VRAM de 16.872 MB y una duración total de 120,6 segundos. El resultado pasa de 39,38 % a 43,75 % de accuracy sobre ScienceQA (subconjunto STEM con imágenes, validación), frente al 63,75 % del profesor, y reduce la perplejidad de 4,36 a 3,13 (el profesor marca 2,45). El artefacto final ocupa 58,79 MB en disco (paquete completo de 73,99 MB), lo que supone un 96,5 % menos que el base en FP16 (1,66 GB) y un factor de compresión de 28,94x. El manifiesto `surgical_manifest.json` declara `saved_tensor_count=426`.

## Capacidades

- Generación de texto e imagen-a-texto en formato conversacional (`image-text-to-text`).
- Respuesta a preguntas visuales sobre imágenes STEM (ScienceQA): el modelo está afinado específicamente para seleccionar la opción correcta en preguntas de ciencias con figura.
- Razonamiento multimodal básico limitado al dominio de entrenamiento (ciencias de nivel escolar con soporte visual).
- Soporte de chat multi-turno mediante plantilla de chat incluida (`chat_template.json`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad monolingüe: solo inglés.
- No dispone de modo thinking, audio ni otras modalidades adicionales.

## Casos de uso

- Evaluación de técnicas de compresión de atención: el checkpoint sirve como referencia reproducible para medir la pérdida de accuracy al sustituir atención completa por SVD truncada con LoRA en un VLM de 0,5B, con baseline (63,75 %), pre-KD (39,38 %) y post-KD (43,75 %) documentados.
- Investigación en destilación de conocimiento multimodal: permite replicar el pipeline de dos etapas (167 pasos, 120,6 s en RTX 3090) y comparar la recuperación de rendimiento frente al profesor.
- Prototipado de asistentes educativos STEM: dado su ajuste sobre ScienceQA, puede emplearse para responder preguntas de ciencias con imagen en inglés dentro de demos o pruebas de concepto, asumiendo la precisión limitada del 43,75 %.
- Benchmarking de frameworks de cirugía de modelos: útil para validar el ecosistema NeuralOps (`load_surgeried_model`, `surgical_manifest.json`, esquema `neuralops.surgery/v2`) y su interoperabilidad con safetensors.
- Despliegue en entornos con restricciones de almacenamiento: con 58,79 MB de pesos delta y paquete de 73,99 MB, encaja en dispositivos o repositorios donde el modelo base de 1,66 GB no sería viable, siempre que se combine con el base.
- Estudio de arquitecturas híbridas de atención: el esquema `hybrid_3_1` con seis capas cuadráticas de ancla permite analizar el equilibrio entre compresión y capacidad expresiva en un decoder de 24 capas.
- Docencia e investigación sobre atención eficiente: ejemplo didáctico de sustitución de MHA por proyecciones SVD truncadas con LoRA, con métricas de accuracy y perplejidad publicadas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados, `verified: false`):

| Modelo / configuración | ScienceQA (image-bearing STEM, val) Accuracy (%) | Perplejidad |
|---|---:|---:|
| Profesor (`llava-hf/llava-interleave-qwen-0.5b-hf`) | 63,75 | 2,45 |
| Pre-KD / zero-shot (SVD comprimido) | 39,38 | 4,36 |
| Post-KD / final (este checkpoint) | 43,75 | 3,13 |
| Delta (post-KD vs. pre-KD) | +4,37 | -1,23 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el artefacto delta requiere cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` (1,66 GB en FP16) más los 58,79 MB de pesos de atención comprimidos.
- GPU utilizada en el entrenamiento: NVIDIA GeForce RTX 3090 (24 GB), con pico de 16.872 MB durante la destilación.
- GPU recomendadas: al tratarse de un modelo de 0,5B con torre SigLIP, cabe holgadamente en GPUs de consumo; la RTX 3090 está validada por el autor. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, según la evidencia de entrenamiento en RTX 3090; no se especifican requisitos mínimos para otras GPUs de consumo.
- Opciones de despliegue: la model card documenta exclusivamente la API de NeuralOps (`from neuralops.hub import load_surgeried_model`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor reporta 120,6 s de entrenamiento total (167 pasos) en RTX 3090, dato no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (STEM img, val) | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| `tahamajs/llava-qwen-0.5b-svd-compressed-scienceqa` | ~0,5B (base) + delta de atención | no disponible | 43,75 % acc / 3,13 PPL | MIT | Hugging Face (0 descargas) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B | no disponible | 63,75 % acc / 2,45 PPL | no disponible en la información | Hugging Face |
| Otros VLM de ~0,5B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El checkpoint es un artefacto delta: contiene únicamente los pesos de atención modificados y las capas de normalización; requiere el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` para funcionar.
- Pérdida de rendimiento significativa frente al profesor: 43,75 % frente a 63,75 % en ScienceQA (20 puntos porcentuales menos), y perplejidad de 3,13 frente a 2,45.
- Dominio muy restringido: afinado y evaluado solo sobre el subconjunto STEM con imágenes de ScienceQA; no hay evidencia de generalización a otras tareas visuales o de razonamiento.
- Monolingüe: solo inglés; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinación: no cuantificado por el autor; al ser un modelo de 0,5B con compresión de atención, la fiabilidad en preguntas fuera de distribución es limitada.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Resultados no verificados: las métricas del model-index figuran con `verified: false`; proceden del propio autor.
- Licencia MIT: permite uso comercial, pero el modelo base puede tener condiciones adicionales no especificadas en la información disponible.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso; no apto para pipelines agénticos sin validación previa.
- Dependencia del ecosistema NeuralOps: la carga requiere la librería `neuralops` y su API `load_surgeried_model`; no hay evidencia de compatibilidad con transformers, vLLM o llama.cpp.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-svd-compressed-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación `SVDCompressedAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/svd_compressed.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA (derek-thomas): https://huggingface.co/datasets/derek-thomas/ScienceQA
