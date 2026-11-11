# tahamajs/llava-qwen-0.5b-samba-moe-scienceqa

## Resumen

`tahamajs/llava-qwen-0.5b-samba-moe-scienceqa` es un checkpoint experimental de visión-lenguaje publicado por el autor independiente tahamajs dentro de su framework NeuralOps. No es un modelo entrenado desde cero, sino el resultado de una intervención quirúrgica sobre `llava-hf/llava-interleave-qwen-0.5b-hf`: se sustituyen 18 de las 24 capas de auto-atención del decodificador Qwen2 por bloques híbridos SambaMoE (combinación de SSM tipo Mamba y mezcla de expertos con copia de pesos preentrenados), manteniendo congelados el torreón visual SigLIP, el proyector multimodal y seis capas de atención cuadrática ancla.

El modelo resuelve una pregunta de investigación concreta: ¿se puede reemplazar la atención cuadrática de un VLM pequeño por capas de estado-espacio con MoE sin destruir sus capacidades y obteniendo un artefacto más ligero? El resultado es un checkpoint de 910 MB (frente a 1,66 GB del base, un 46,5 % menos) que alcanza un 43,75 % de accuracy en el subconjunto con imagen de ScienceQA (validación), frente al 63,75 % del profesor original, tras un ajuste por destilación de conocimiento de solo 44 pasos.

Su relevancia es fundamentalmente metodológica y de investigación: demuestra el flujo de "attention surgery" reproducible con manifiestos de topología, métricas de telemetría y pesos delta en safetensors. No está pensado como modelo de producción: el propio autor lo etiqueta como parte de un "attention zoo" y las métricas no están verificadas de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP + proyector MLP 2 capas + decodificador Qwen2) con 18/24 capas de atención sustituidas por bloques SambaMoE (SSM + MoE híbrido) |
| Parámetros totales | no disponible (el modelo base LLaVA-Qwen-0.5B ronda los 0,5B en el decodificador; el checkpoint publicado contiene solo pesos delta de atención) |
| Parámetros activos | no disponible (arquitectura MoE parcial; el autor no publica el reparto de expertos) |
| Longitud de contexto | no disponible (heredada del base LLaVA-Interleave-Qwen-0.5B; el autor no la declara) |
| Tipos de cuantizacion | no disponible (solo se publican pesos FP16 en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, `weights_format=attention_only_fp16`) + `surgical_manifest.json`; requiere el runtime NeuralOps para cargar |

## Arquitectura y entrenamiento

El punto de partida es `llava-hf/llava-interleave-qwen-0.5b-hf`: torreón visual SigLIP congelado de 27 capas, proyector MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y `head_dim` 64. Sobre esa base, el operador `samba_moe` (`neuralops/layers/ssm/samba_moe.py`) reemplaza la auto-atención en 18 de las 24 capas (esquema `hybrid_3_1`), conservando seis capas de atención cuadrática como anclas en los índices `[3, 7, 11, 15, 19, 23]`. Los bloques SambaMoE combinan componentes de estado-espacio (SSM, familia Mamba/Samba) con mezcla de expertos y copia de pesos preentrenados para inicializar los expertos. Permanecen congelados el torreón visual, el proyector multimodal, los MLP del decodificador y los embeddings; solo se entrenan las nuevas capas de atención y los layernorms del decodificador.

El entrenamiento es una destilación de conocimiento en dos etapas sobre el subconjunto con imagen de ScienceQA (dataset `derek-thomas/ScienceQA`), con 15 pasos en la etapa 1 y 29 en la etapa 2 (44 pasos totales, 120,5 s en una RTX 3090 con 20.312 MB de VRAM pico). El manifiesto declara `saved_tensor_count=1074` y `schema_version=neuralops.surgery/v2`. La innovación destacable no es el rendimiento, sino la trazabilidad: topología quirúrgica versionada, auditoría de artefactos en disco y telemetría de entrenamiento embebida en el repositorio.

## Capacidades

- Generación de texto condicionada por imagen (pipeline `image-text-to-text`): respuesta a preguntas visuales de tipo STEM con elección de opción.
- Razonamiento visual básico sobre diagramas y figuras científicas, limitado al dominio de ScienceQA.
- Formato conversacional con plantilla de chat incluida (`chat_template.json`).
- Tokenizador BPE rápido con vocabulario y merges publicados (`tokenizer.json`, `vocab.json`, `merges.txt`).
- Preprocesado de imagen incluido (`preprocessor_config.json`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo "thinking", audio ni otras modalidades.
- Capacidad multilingüe: solo inglés declarado.

## Casos de uso

- Investigación en eficiencia de arquitecturas: servir como punto de comparación reproducible entre atención cuadrática y capas SSM/MoE en un VLM pequeño, cargando el checkpoint con `load_surgeried_model` y midiendo accuracy/PPL sobre ScienceQA.
- Estudio de destilación de conocimiento en modelos multimodales: analizar cómo 44 pasos de KD recuperan perplejidad (de 1.158,13 a 3,99) pero solo +1,25 puntos de accuracy, un caso útil para calibrar expectativas sobre KD de bajo presupuesto.
- Docencia y divulgación: ejemplo didáctico de "attention surgery" con manifiesto versionado, útil para explicar qué componentes se congelan y cuáles se reemplazan en un VLM.
- Validación de pipelines NeuralOps: usar el repositorio como artefacto de prueba de extremo a extremo para el cargador `neuralops.hub` y el esquema `neuralops.surgery/v2`.
- Prototipado de VQA científica de bajo coste: para experimentos internos donde se tolere un 43,75 % de accuracy en ScienceQA y se priorice un artefacto de 910 MB frente a 1,66 GB.
- Auditoría de artefactos y reproducibilidad: el par `surgical_manifest.json` + `training_metrics.json` permite verificar la topología y las métricas sin reentrenar, útil en revisiones de papers o tesis.
- Base para ablaciones: sustituir el operador `samba_moe` por otros del zoo (`attention-zoo`) manteniendo el resto del pipeline para comparar familias (SSM, MoE, híbridos).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Métrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) — ScienceQA (Image-Bearing STEM Subset, validation) | 63,75 | 42,50 | 43,75 | +1,25 |
| Perplexity — ScienceQA (Image-Bearing STEM Subset, validation) | 2,45 | 1.158,13 | 3,99 | −1.154,14 |

Telemetría de entrenamiento declarada: 44 pasos de optimización (15 + 29), 120,5 s, 20.312 MB de VRAM pico en RTX 3090, timestamp 2026-11-11T09:47:07Z. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento cupo en 24 GB (RTX 3090) con 20.312 MB pico. Al cargar el modelo base completo más los pesos delta, se espera un consumo en el rango de pocos GB en FP16, pero el autor no lo documenta.
- GPU recomendadas: RTX 3090 (única verificada en la telemetría); A100/H100 no documentadas.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas con ≥8 GB, aunque no está verificado por el autor.
- Opciones de despliegue: exclusivamente el runtime NeuralOps (`neuralops.hub.load_surgeried_model`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (val, imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-samba-moe-scienceqa` | ~0,5B (decodificador) + delta de atención | no disponible | 43,75 % acc / 3,99 PPL | MIT | HF, runtime NeuralOps |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (teacher) | ~0,5B | no disponible | 63,75 % acc / 2,45 PPL | no disponible en la información | HF, transformers |
| Otros checkpoints del "attention zoo" de tahamajs | variable | no disponible | no disponible | MIT (presumible) | HF |
| Alternativas VLM de ~0,5B (p. ej. SmolVLM, Qwen2-VL-2B) | 0,25B–2B | variable | no disponible en la información | variable | HF |

## Limitaciones y advertencias

- Pérdida sustancial de calidad frente al profesor: 43,75 % vs 63,75 % de accuracy en ScienceQA, una caída de 20 puntos.
- Entrenamiento extremadamente corto (44 pasos, 120,5 s): no hay garantía de convergencia ni de generalización más allá de ScienceQA.
- Métricas no verificadas (`verified: false` en el model-index); deben tratarse como declaraciones del autor.
- Dominio muy restringido: solo se evalúa en ScienceQA con imagen; no hay evidencia de rendimiento en otras tareas visuales.
- Solo inglés; no se declara soporte multilingüe.
- Dependencia del runtime propietario NeuralOps: los pesos son delta de atención (`attention_only_fp16`) y no se pueden cargar con `transformers` estándar sin reconstruir el modelo base.
- No hay cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que dificulta el despliegue en entornos de producción convencionales.
- Riesgo de alucinación no evaluado por el autor; al ser un VLM pequeño con KD agresiva, es esperable un comportamiento frágil en preguntas fuera de distribución.
- Licencia MIT, lo que permite uso comercial, pero la ausencia de benchmarks fuera de dominio y de verificación independiente desaconseja su uso en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria.
- Fecha de creación declarada (2026-11-11) posterior a la fecha habitual de referencia; conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-samba-moe-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador `samba_moe`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/samba_moe.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
