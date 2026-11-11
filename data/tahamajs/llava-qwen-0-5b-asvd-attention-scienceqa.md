# tahamajs/llava-qwen-0.5b-asvd-attention-scienceqa

## Resumen

`llava-qwen-0.5b-asvd-attention-scienceqa` es un modelo de visión-lenguaje (VLM) publicado por Taha Majlesi (tahamajs) dentro del proyecto NeuralOps, un "zoo" experimental de mecanismos de atención subcuadrática. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` (codificador visual SigLIP congelado + proyector MLP + decodificador Qwen2 de 24 capas con D=1024 y H=16) y sustituye 18 de sus 24 bloques de atención del decodificador por el operador `asvd_attention` (ASVDAttention), basado en descomposición matricial de bajo rango SVD con GQA, RoPE y LoRA.

El objetivo no es tanto ofrecer un VLM de producción como demostrar que una atención factorizada de bajo rango puede igualar o superar ligeramente al profesor original tras un proceso de destilación en dos etapas sobre preguntas con imagen de ScienceQA. Tras la destilación, el modelo alcanza un 47,59 % de exactitud visual frente al 46,90 % del profesor, y reduce la perplejidad de respuesta de 3,85 a 2,95, con un coste de entrenamiento de solo 234 pasos y 120 segundos en una RTX 3090.

Es relevante ahora porque ejemplifica una línea de investigación activa: la "cirugía de atención" (attention surgery) que reemplaza mecanismos cuadráticos por alternativas de menor complejidad computacional sin reentrenar el modelo completo, manteniendo el codificador visual congelado. El repositorio es pequeño (0,4 GB) y solo distribuye los pesos de atención y layernorm en FP16, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision encoder + MLP projector + decodificador Qwen2 de 24 capas) con 18/24 bloques de atención sustituidos por ASVDAttention (SVD de bajo rango) |
| Parametros totales | no disponible (repo de 0,4 GB; pesos de atención empaquetados de 361,30 MB en FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, solo atención y layernorm del decodificador) |

## Arquitectura y entrenamiento

El modelo sigue la topología LLaVA estándar: un codificador visual SigLIP congelado extrae tokens de parche que se intercalan con tokens de texto dentro de las capas del decodificador. El decodificador es un Qwen2 de 24 capas con dimensión oculta D=1024 y 16 cabezas de atención (d_h=64). La innovación es la sustitución de 18 de las 24 capas de atención por `ASVDAttention`, un operador que factoriza las proyecciones mediante descomposición SVD de bajo rango (complejidad O(B·N·r·(d+d_all)) para las proyecciones factorizadas) y mantiene el scoring de atención cuadrático O(B·H·N²·d_k). Se conservan 6 capas de atención cuadrática original como "anclas" en los índices [3, 7, 11, 15, 19, 23], configurando un patrón híbrido 3:1.

El entrenamiento consistió en destilación de conocimiento (KD) en dos etapas sobre preguntas con imagen del dataset `derek-thomas/ScienceQA`: 90 pasos en la etapa 1 y 144 en la etapa 2, totalizando 234 pasos en 120,1 segundos con un pico de 17.103 MB de VRAM en una NVIDIA RTX 3090 de 24 GB. El codificador visual y el proyector multimodal permanecieron completamente congelados, aislando así el efecto de la cirugía de atención sobre el enrutamiento cross-modal. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá de ScienceQA.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text / visual question answering).
- Razonamiento visual sobre preguntas de ciencia (ScienceQA): el modelo responde preguntas de opción múltiple sobre diagramas e imágenes científicas.
- Conversación multimodal de un solo turno o multi-turno (pipeline `conversational`).
- Comprensión de imagen y texto combinados mediante el codificador SigLIP congelado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Modo "thinking", visión adicional, audio: no disponible.

## Casos de uso

- Investigación en eficiencia de atención: el modelo sirve como banco de pruebas reproducible para comparar el operador ASVDAttention frente a atención cuadrática estándar en tareas visión-lenguaje, gracias a su patrón híbrido 3:1 documentado y sus scripts de cirugía.
- Evaluación de destilación de conocimiento: permite medir cuánto recupera un operador subcuadrático tras KD (de 32,41 % a 47,59 % en ScienceQA), útil para estudiar curvas de recuperación con pocos pasos de entrenamiento.
- Prototipado de VQA educativo: con 0,5B de parámetros y un repo de 0,4 GB, se puede desplegar en entornos con recursos limitados para responder preguntas sobre imágenes de ciencia, aunque con exactitud moderada (~47 %).
- Docencia y demostraciones de arquitecturas LLaVA: la separación entre pesos de atención empaquetados y base congelada facilita explicar cómo funciona la cirugía de módulos en un transformer multimodal.
- Experimentos de ablación sobre capas ancla: los índices [3, 7, 11, 15, 19, 23] permiten estudiar qué capas cuadráticas son críticas para el enrutamiento visual-texto.
- Base para fine-tuning ligero: al cargar sobre el modelo base con `strict=False`, se puede partir de estos pesos para adaptar el VLM a otros dominios con bajo coste computacional.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Métrica | Profesor (llava-interleave-qwen-0.5b) | ASVD zero-shot (pre-KD) | ASVD destilado (post-KD) | Delta |
|---|---:|---:|---:|---:|
| ScienceQA Visual Accuracy (%) | 46,90 | 32,41 | 47,59 | +15,18 |
| Perplejidad de respuesta condicionada por imagen | 3,85 | 8.155,98 | 2,95 | -8.153,03 |

Telemetría de entrenamiento: 234 pasos (90 + 144), 120,1 s, pico de 17.103 MB de VRAM en RTX 3090 24 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento requirió 17.103 MB en una RTX 3090. Al ser un modelo de ~0,5B parámetros más codificador SigLIP, la inferencia en FP16 debería caber holgadamente en GPUs consumer, aunque no se publican cifras exactas.
- GPU recomendadas: RTX 3090 (usada en el entrenamiento); cualquier GPU con al menos ~8-16 GB de VRAM debería ser suficiente para inferencia en FP16, aunque no está confirmado en la documentación.
- Cabe en GPU consumer: sí, según el perfil de entrenamiento (RTX 3090 24 GB); no se confirman modelos inferiores.
- Opciones de despliegue: la librería declarada es `neuralops`, con carga vía `transformers` (`LlavaForConditionalGeneration`) más los scripts de cirugía de NeuralOps. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; solo se reporta el tiempo de entrenamiento (120,1 s para 234 pasos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA VQA Acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-asvd-attention-scienceqa` | ~0,5B (base) | no disponible | 47,59 % | MIT | Hugging Face (solo pesos de atención) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B | no disponible | 46,90 % | no disponible en esta ficha | Hugging Face |
| Otros VLM de ~0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada; la comparativa se limita al profesor original.

## Limitaciones y advertencias

- Solo distribuye los pesos de atención y layernorm del decodificador (361,30 MB); es necesario descargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y aplicar la cirugía con los scripts de NeuralOps para poder usarlo.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); no han sido reproducidos de forma independiente.
- Exactitud visual moderada (47,59 % en ScienceQA): insuficiente para aplicaciones de producción que requieran alta fiabilidad.
- Entrenado únicamente en inglés y sobre ScienceQA; el dominio y el idioma están muy acotados, con riesgo de degradación fuera de ese ámbito.
- Riesgo de alucinación inherente a los VLM de pequeño tamaño, especialmente en preguntas visuales complejas o ambiguas.
- La destilación se realizó con solo 234 pasos; no se documenta el número de tokens ni la cobertura completa del dataset.
- Licencia MIT, lo que permite uso comercial, pero el modelo base puede tener sus propias condiciones que deben verificarse por separado.
- No se documentan sesgos específicos ni evaluaciones de seguridad.
- El proyecto NeuralOps es experimental; la API (`apply_qwen_attention_surgery`) puede cambiar y no se garantiza estabilidad para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-asvd-attention-scienceqa
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de ASVDAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/asvd_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
