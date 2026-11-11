# tahamajs/llava-qwen-0.5b-spectron-scienceqa

## Resumen

`llava-qwen-0.5b-spectron-scienceqa` es un checkpoint experimental publicado por el usuario tahamajs dentro del ecosistema NeuralOps, una librería propia orientada a la cirugía de mecanismos de atención en modelos transformer. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM de 0,5 mil millones de parámetros compuesto por una torre visual SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas, y sustituye el mecanismo de atención cuadrática en 18 de esas 24 capas por un operador lineal denominado SpectronAttention (importancia-aware low-rank + sparse, activación-aware). Las 6 capas restantes (índices 3, 7, 11, 15, 19 y 23) mantienen atención cuadrática como anclas, configurando un esquema híbrido 3:1.

El objetivo declarado es la compresión y eficiencia computacional mediante atención lineal combinada con destilación de conocimiento desde el modelo profesor original. El checkpoint se evalúa sobre el subconjunto con imagen de ScienceQA (validación), una tarea de razonamiento visual STEM, donde alcanza 45,00% de accuracy y perplejidad 3,17 tras la destilación, frente a 43,12% y 4,03 del estado pre-destilación y 63,75% del profesor.

Su relevancia es fundamentalmente metodológica: demuestra un flujo de trabajo reproducible de "attention surgery" sobre un VLM pequeño, con un artefacto de pesos de solo 58,79 MB (frente a 1,66 GB del base en FP16), lo que supone una reducción del 96,5%. No obstante, se trata de un experimento de investigación con cero descargas y cero likes en el momento de redactar esta ficha, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada + proyector MLP 2 capas + decodificador Qwen2 de 24 capas) con atención híbrida: SpectronAttention lineal en 18 capas, atención cuadrática en 6 capas ancla |
| Parametros totales | 0,5 mil millones (modelo base); el artefacto guardado contiene solo los pesos de atención modificados (61.641.264 bytes en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 para los pesos de atención guardados; no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, `weights_format=attention_only_fp16`); requiere la librería `neuralops` para cargar |

## Arquitectura y entrenamiento

La arquitectura base es LLaVA-Interleave con Qwen 0.5B: decodificador Qwen2 de 24 capas con dimensión oculta D=1024, 16 cabezas de atención y head_dim=64, acoplado a una torre visual SigLIP de 27 capas y un proyector multi-modal de dos capas MLP. La intervención quirúrgica sustituye la self-attention en 18 de las 24 capas del decodificador por SpectronAttention, un operador de la familia lineal que combina descomposición de bajo rango ponderada por importancia con componentes dispersos y consciente de las activaciones. Las capas 3, 7, 11, 15, 19 y 23 conservan atención cuadrática como anclas, y también se entrenan los layernorms del decodificador. Permanecen congelados la torre visual, el proyector, los MLP del decodificador y los embeddings.

El entrenamiento combina dos etapas de destilación de conocimiento desde el modelo profesor (`llava-hf/llava-interleave-qwen-0.5b-hf`) sobre el dataset `derek-thomas/ScienceQA`, con 149 pasos totales (56 en la etapa 1 y 93 en la etapa 2), completados en 120,9 segundos sobre una única NVIDIA RTX 3090 de 24 GB, con un pico de VRAM de 16.870 MB. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en tareas de razonamiento visual STEM.
- Respuesta a preguntas visuales de opción múltiple sobre figuras científicas (ScienceQA).
- Conversación multi-turno mediante plantilla de chat incluida (`chat_template.json`).
- Razonamiento visual básico sobre diagramas y figuras de ciencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: modo thinking, visión avanzada, audio: no disponible.

## Casos de uso

- Investigación en atención lineal: el checkpoint sirve como referencia reproducible para estudiar el impacto de sustituir atención cuadrática por operadores lineales (SpectronAttention) en un VLM, comparando el estado pre-destilación (43,12%) con el post-destilización (45,00%).
- Destilación de conocimiento sobre VLMs pequeños: el flujo de dos etapas con 149 pasos y 120,9 segundos en una RTX 3090 es replicable para experimentar con compresión de modelos multimodales.
- Prototipado de asistentes educativos STEM: dado su rendimiento en ScienceQA, puede usarse en demos de preguntas y respuestas sobre figuras científicas, siempre con validación humana.
- Auditoría de artefactos quirúrgicos: el manifiesto `surgical_manifest.json` (426 tensores guardados) y el `training_metrics.json` permiten reproducir y verificar la topología de la cirugía de atención.
- Benchmarking de eficiencia: el artefacto de 58,79 MB frente a los 1,66 GB del base facilita experimentos de despliegue con huella de almacenamiento mínima.
- Estudio de esquemas híbridos de atención: la configuración 3:1 (18 lineales + 6 cuadráticas) permite analizar el equilibrio entre eficiencia y calidad en capas concretas.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen, validación:

| Metrica | Profesor (base) | Pre-destilacion | Post-destilacion (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 43,12 | 45,00 | +1,88 |
| Perplejidad | 2,45 | 4,03 | 3,17 | -0,86 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió un pico de 16.870 MB en una RTX 3090, por lo que la inferencia requiere cargar además el modelo base completo.
- GPU recomendadas: NVIDIA RTX 3090 (24 GB) validada para el entrenamiento; GPUs con al menos 24 GB para reproducir el flujo completo.
- ¿Cabe en GPU de consumo? El entrenamiento sí cupo en una RTX 3090; la inferencia requiere el modelo base más el delta de atención.
- Opciones de despliegue: la librería `neuralops` mediante `load_surgeried_model`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ScienceQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-spectron-scienceqa | 0,5 B | no disponible | 45,00% accuracy / 3,17 PPL | MIT | Hugging Face (neuralops) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5 B | no disponible | 63,75% accuracy / 2,45 PPL | no disponible | Hugging Face |
| Otros VLM de ~0,5 B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Pérdida significativa de accuracy frente al profesor: 45,00% frente a 63,75% (-18,75 puntos), lo que limita su uso en tareas que requieran precisión.
- Perplejidad superior al profesor (3,17 frente a 2,45).
- Entrenamiento muy corto (149 pasos, 120,9 segundos) sobre un único dataset (ScienceQA), lo que sugiere riesgo elevado de sobreajuste y escasa generalización.
- Solo soporta inglés.
- Resultados de benchmarks no verificados (`verified: false`) y declarados por el autor.
- El artefacto contiene únicamente los pesos de atención modificados; requiere el modelo base y la librería `neuralops` para funcionar, lo que limita la portabilidad.
- Riesgo de alucinación no evaluado en la información disponible.
- Sesgos conocidos: no documentados.
- Licencia MIT permite uso comercial, pero el estado experimental y el bajo rendimiento desaconsejan su uso en producción sin validación adicional.
- Cero descargas y cero likes en el momento de la ficha: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-spectron-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación SpectronAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/spectron.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
