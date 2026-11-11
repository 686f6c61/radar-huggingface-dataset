# tahamajs/llava-qwen-0.5b-flash-attention3-scienceqa

## Resumen

llava-qwen-0.5b-flash-attention3-scienceqa es un checkpoint quirúrgico multimodal publicado por el usuario tahamajs dentro del proyecto NeuralOps "Attention Surgery Zoo". No es un modelo entrenado desde cero, sino una modificación del modelo base llava-hf/llava-interleave-qwen-0.5b-hf en la que se sustituye el mecanismo de atención de 18 de las 24 capas del decodificador por una implementación FlashAttention-3, manteniendo congelados el torreón de visión SigLIP, el proyector multimodal y seis capas de atención cuadrática que actúan como anclas. El resultado se destila de nuevo desde el modelo profesor para recuperar calidad tras la cirugía.

El modelo resuelve un problema muy concreto: evaluar el impacto de kernels de atención rápidos en un VLM pequeño y publicar los pesos delta resultantes. El artefacto en disco ocupa 147,61 MB (frente a 1,66 GB del base en FP16, una reducción del 91,3 %), y se evalúa sobre el subconjunto con imagen de ScienceQA (validación), donde alcanza un 60,62 % de accuracy y una perplejidad de 2,41 tras la destilación de conocimiento, frente al 63,75 % y 2,45 del profesor.

Es relevante ahora porque documenta de forma reproducible una técnica de "atención quirúrgica" aplicada a un VLM de 0,5B parámetros, con telemetría de entrenamiento completa (RTX 3090, 237 pasos, 120,3 s, 17,7 GB de VRAM pico). Su utilidad principal es como referencia técnica y banco de pruebas para quienes investigan kernels de atención eficientes y compresión de VLMs, no como modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torre de visión SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64) con atención FlashAttention-3 en 18/24 capas |
| Parametros totales | no disponible (heredados del base llava-interleave-qwen-0.5b-hf; el artefacto delta pesa 147,61 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (pesos delta en FP16 safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, pesos delta quirúrgicos en FP16) |

## Arquitectura y entrenamiento

La arquitectura parte del VLM LLaVA interleaved con decodificador Qwen2 de 24 capas. La intervención sustituye la atención multi-cabeza exacta por FlashAttention-3 en 18 de las 24 capas del decodificador (esquema hybrid_3_1), dejando intactas seis capas de atención cuadrática como anclas en los índices [3, 7, 11, 15, 19, 23]. El torreón SigLIP (27 capas), el proyector multimodal, los MLP del decodificador y los embeddings permanecen congelados y no se incluyen en el artefacto publicado. Solo se guardan los pesos de atención modificados y los layernorms del decodificador entrenados.

El entrenamiento consiste en una destilación de conocimiento en dos etapas (90 + 147 pasos, 237 en total) sobre una NVIDIA RTX 3090 de 24 GB, con 17.708 MB de VRAM pico y una duración total de 120,3 segundos. El dataset de evaluación y presumiblemente de ajuste es derek-thomas/ScienceQA, en su subconjunto con imagen de validación. Los resultados muestran el efecto de la cirugía: sin destilación, la accuracy cae al 32,50 % y la perplejidad sube a 5,12; tras la destilación se recupera hasta 60,62 % y 2,41, ligeramente por debajo del profesor en accuracy (63,75 %) pero mejor en perplejidad (2,45). No se detalla en la información disponible la composición exacta del dataset de entrenamiento ni si se aplicó RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) mediante el pipeline estándar de LLaVA.
- Respuesta a preguntas visuales de tipo STEM, especialmente en el formato de ScienceQA (selección de opción por letra).
- Razonamiento multimodal básico sobre figuras y diagramas científicos.
- Conversación multi-turno con plantilla de chat propia (chat_template.json incluido).
- Procesamiento de imágenes con preprocesador configurado (preprocessor_config.json).
- Capacidad de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, audio, visión adicional): no disponible.

## Casos de uso

- Investigación en kernels de atención eficientes: sirve como referencia reproducible para medir el impacto de FlashAttention-3 en un VLM pequeño, comparando la accuracy pre y post destilación frente al profesor.
- Banco de pruebas de destilación de conocimiento: permite estudiar cómo se recupera calidad tras una cirugía agresiva de atención en modelos multimodales de bajo parámetro.
- Evaluación de compresión de VLMs: el artefacto delta de 147,61 MB frente a 1,66 GB del base es útil para medir el ahorro real en almacenamiento y despliegue de checkpoints quirúrgicos.
- Prototipado de asistentes educativos STEM: con 60,62 % de accuracy en ScienceQA puede usarse como base para experimentos de tutoría visual en dominios científicos, siempre con validación humana.
- Docencia y demostraciones de arquitecturas LLaVA: el modelo es lo bastante pequeño para ejecutarse en una sola GPU consumer y mostrar el flujo completo imagen-texto.
- Reproducción de pipelines NeuralOps: el manifest quirúrgico y la telemetría permiten replicar el experimento en hardware modesto (RTX 3090) y comparar con otras variantes del zoo de atención.
- Estudio de robustez de kernels rápidos: útil para analizar la degradación de perplejidad y accuracy al sustituir atención exacta por FlashAttention-3 en distintas capas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre ScienceQA (Image-Bearing STEM Subset, validation). No verificados de forma independiente (verified: false).

| Metrica | Profesor (baseline) | Pre-destilacion | Post-destilacion (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 32,50 | 60,62 | +28,12 |
| Perplejidad | 2,45 | 5,12 | 2,41 | -2,71 |

Telemetría de entrenamiento declarada: 237 pasos de optimización (90 en etapa 1, 147 en etapa 2), 120,3 s de duración, 17.708 MB de VRAM pico en una RTX 3090.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 17.708 MB en una RTX 3090, por lo que la inferencia en FP16 debería caber holgadamente en 24 GB.
- GPU recomendadas: RTX 3090 (usada en el entrenamiento), A100, H100; cualquier GPU con al menos 24 GB para margen cómodo.
- Cabe en GPU consumer: sí, al menos en RTX 3090 y probablemente en GPUs de 16 GB o menos por el tamaño reducido del decodificador (0,5B) y el artefacto delta de 147,61 MB.
- Opciones de despliegue: la model card usa la API neuralops.hub (load_surgeried_model). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; no disponible.
- Latencia y throughput estimados: no disponibles. El uso de FlashAttention-3 sugiere mejoras de throughput frente a atención exacta, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-flash-attention3-scienceqa | 0,5B (decodificador Qwen2) | no disponible | 60,62 % acc / 2,41 PPL en ScienceQA | MIT | Hugging Face (tahamajs) |
| llava-hf/llava-interleave-qwen-0.5b-hf (base/profesor) | 0,5B | no disponible | 63,75 % acc / 2,45 PPL en ScienceQA | no disponible en esta ficha | Hugging Face (llava-hf) |
| Otros modelos LLaVA-Qwen 0.5B | 0,5B | no disponible | no disponible | no disponible | no disponible |

El modelo base actúa como referencia directa: el checkpoint quirúrgico pierde 3,13 puntos de accuracy pero mejora ligeramente la perplejidad. No se dispone de datos de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint es un artefacto delta quirúrgico: requiere el modelo base llava-hf/llava-interleave-qwen-0.5b-hf y la librería neuralops para cargarse correctamente; no es un modelo autónomo estándar.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (verified: false en la model-index).
- La accuracy final (60,62 %) es inferior a la del profesor (63,75 %), por lo que la cirugía no es neutra en calidad.
- Solo se declara inglés; no hay soporte multilingüe.
- El ajuste se centra en ScienceQA, lo que puede provocar sobreajuste al formato de opción múltiple y degradación en otros dominios visuales.
- Riesgo de alucinación inherente a un VLM de 0,5B parámetros; no recomendado para producción sin validación humana.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La licencia MIT permite uso comercial, pero el modelo base puede tener condiciones adicionales no detalladas en esta ficha.
- No se especifican la longitud de contexto ni los tipos de cuantización soportados, lo que limita la planificación de despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-flash-attention3-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación FlashAttention-3 en NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/fast_kernels/flash_attention3.py
- Licencia MIT: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
