# tahamajs/llava-qwen-0.5b-cross-attention-scienceqa

## Resumen

`llava-qwen-0.5b-cross-attention-scienceqa` es un modelo de visión-lenguaje (VLM) publicado por el desarrollador tahamajs dentro del proyecto NeuralOps, un "zoo" experimental de cirugía de mecanismos de atención sobre arquitecturas transformer. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` (codificador visual SigLIP congelado, proyector MLP y decodificador Qwen2 de 24 capas con dimensión 1024 y 16 cabezas) y sustituye 18 de sus 24 bloques de atención por un mecanismo de atención cruzada (`cross_attention`) bajo un patrón híbrido 3:1, conservando 6 capas cuadráticas de anclaje en las posiciones [3, 7, 11, 15, 19, 23].

El objetivo no es competir con modelos de producción, sino estudiar empíricamente cómo se comporta un mecanismo de atención subcuadrático cuando se le fuerza a enrutar información visual densa hacia el decodificador de texto, manteniendo completamente congelados el torreón visual y el proyector multimodal. Para ello el autor destila el modelo sobre las preguntas con imagen del conjunto ScienceQA, comparando el resultado contra el modelo profesor original y contra el estado previo al destilado.

Su relevancia es fundamentalmente metodológica: documenta con telemetría detallada (pasos de optimización, VRAM pico, duración, perplejidad antes y después) el coste y el beneficio de una intervención quirúrgica sobre la atención, y publica únicamente los pesos de atención y layernorm transplantados (719,34 MB en FP16) que se cargan sobre la base congelada. Es, por tanto, un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM tipo LLaVA: codificador visual SigLIP congelado + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas con atención cruzada híbrida 3:1 (18 capas transplantadas, 6 capas cuadráticas de anclaje) |
| Parametros totales | 0,5B (modelo base `llava-interleave-qwen-0.5b-hf`); pesos de atención publicados: 719,34 MB en FP16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`) + configuraciones de processor y tokenizer; requiere la base `llava-hf/llava-interleave-qwen-0.5b-hf` |

Geometría del decodificador: 24 capas, D=1024, H=16, d_h=64. Clave de registro del mecanismo: `cross_attention` (familia `modern`).

## Arquitectura y entrenamiento

El modelo hereda la topología LLaVA estándar: los parches visuales extraídos por el codificador SigLIP se intercalan con los tokens de texto dentro de las capas del modelo de lenguaje. La intervención consiste en reemplazar 18 de las 24 capas de atención del decodificador por `CrossAttention`, una atención multi-cabeza con LoRA que opera como auto-atención cuando `context=None` (causal en decodificadores) y como atención cruzada cuando recibe un contexto (query desde los estados ocultos, claves y valores desde el contexto). Las 6 capas restantes mantienen atención cuadrática como anclas.

El entrenamiento se realizó en dos etapas de destilado (knowledge distillation) sobre preguntas con imagen de `derek-thomas/ScienceQA`: 95 pasos en la etapa 1 y 152 en la etapa 2, con un total de 247 pasos de optimización. La ejecución completa duró 120,6 segundos con un pico de 17.692 MB de VRAM en una NVIDIA RTX 3090 de 24 GB. El torreón visual y el proyector multimodal permanecieron congelados durante todo el proceso, de modo que el destilado solo ajusta los parámetros de atención y layernorm transplantados. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) y respuesta a preguntas visuales sobre contenido científico.
- Razonamiento visual multimodal básico sobre diagramas y figuras de ScienceQA.
- Conversación multi-turno en formato conversacional (pipeline `image-text-to-text`).
- Comprensión de texto e imágenes en inglés.
- Integración con el ecosistema Hugging Face mediante `AutoProcessor` y `LlavaForConditionalGeneration`.
- Carga de pesos de atención sobre la base congelada mediante `apply_qwen_attention_surgery` con patrón `hybrid_3_1`.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni otras modalidades distintas de imagen y texto.

## Casos de uso

- Investigación sobre mecanismos de atención eficientes: el modelo sirve como banco de pruebas controlado para medir el impacto de sustituir atención cuadrática por atención cruzada en un VLM, con línea base (profesor), estado pre-destilado y estado post-destilado comparables directamente.
- Reproducción de experimentos de "attention surgery": el paquete incluye los pesos transplantados y el script de aplicación, lo que permite replicar la intervención sobre la misma base y verificar la telemetría publicada (247 pasos, 17.692 MB de VRAM pico).
- Evaluación de destilado de conocimiento en modelos pequeños: con una accuracy de 35,86 % frente al 46,90 % del profesor, es útil para estudiar la brecha de rendimiento que introduce la sustitución de atención y cómo la cierra el destilado (de 35,17 % a 35,86 %).
- Docencia y divulgación técnica: ejemplo didáctico de cirugía de módulos en transformers, con métricas antes/después y código mínimo de carga en la model card.
- Prototipado de asistentes educativos sobre preguntas científicas con imagen, siempre que se asuma la precisión limitada del modelo y se valide la salida.
- Análisis de perplejidad condicionada por imagen: la caída de perplejidad de 264.847,07 a 1,00 tras el destilado lo convierte en un caso de estudio sobre calibración de respuestas en VLMs pequeños.
- Integración en pipelines de investigación con `transformers` para comparar variantes del zoo de atención de NeuralOps bajo el mismo protocolo de evaluación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados) sobre `derek-thomas/ScienceQA`, subconjunto con imagen, split de validación:

| Métrica | Profesor (`llava-interleave-qwen-0.5b`) | Pre-destilado (`cross_attention`) | Post-destilado (`cross_attention`) | Delta |
|---|---:|---:|---:|---:|
| ScienceQA Visual Accuracy (%) | 46,90 % | 35,17 % | 35,86 % | +0,69 % |
| Perplejidad de respuesta condicionada por imagen | 3,85 | 264.847,07 | 1,00 | -264.846,07 |

Telemetría del entrenamiento: 247 pasos de optimización (etapa 1: 95; etapa 2: 152), duración de 120,6 s, pico de 17.692 MB de VRAM en una NVIDIA RTX 3090 de 24 GB, marca temporal 2026-11-11T03:27:21Z.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento consumió 17.692 MB en una RTX 3090 de 24 GB, por lo que la inferencia en FP16 debería situarse por debajo de esa cifra, pero no se publica un valor medido.
- GPU recomendadas: el autor valida el flujo en NVIDIA RTX 3090 (24 GB); cualquier GPU con al menos esa VRAM es un punto de partida seguro para FP16.
- Cabe en GPU de consumo: sí, según la evidencia del entrenamiento en RTX 3090; no se confirma para GPUs con menos de 24 GB.
- Opciones de despliegue: `transformers` con `LlavaForConditionalGeneration` y `AutoProcessor`, más la librería `neuralops` y el script `apply_qwen_attention_surgery`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA Visual Acc | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/llava-qwen-0.5b-cross-attention-scienceqa` | 0,5B | no disponible | 35,86 % | MIT | Hugging Face (pesos de atención) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5B | no disponible | 46,90 % | no disponible en la información | Hugging Face |
| Variantes del zoo NeuralOps con otros mecanismos de atención | 0,5B | no disponible | no disponible | MIT (según el proyecto) | Hugging Face / GitHub |

No se dispone de datos de benchmarks de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Precisión limitada: 35,86 % en ScienceQA Visual frente al 46,90 % del profesor, una brecha de casi 11 puntos porcentuales que lo hace inadecuado para tareas donde la exactitud sea crítica.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); no deben tratarse como cifras consolidadas.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No se documenta la longitud de contexto, lo que impide planificar despliegues con conversaciones o documentos largos.
- No se publican pesos completos: el repositorio contiene únicamente los pesos de atención y layernorm transplantados (719,34 MB), por lo que es obligatorio descargar la base `llava-hf/llava-interleave-qwen-0.5b-hf` y aplicar la cirugía de atención para poder ejecutarlo.
- Requiere la librería `neuralops` y el script `apply_qwen_attention_surgery`, lo que añade dependencias no estándar y reduce la portabilidad frente a un modelo `transformers` convencional.
- Riesgo de alucinación inherente a un VLM de 0,5B entrenado con destilado sobre un dataset académico acotado; no se han publicado evaluaciones de sesgo ni de robustez.
- La licencia MIT permite uso comercial, pero el modelo base y el dataset pueden tener condiciones propias que conviene revisar por separado.
- El modelo es un artefacto de investigación: no hay garantías de mantenimiento, soporte ni actualizaciones.
- La fecha de creación del repositorio (2026-11-11) y el año de la cita (2026) deben contrastarse con el estado real del proyecto antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-cross-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps en GitHub: https://github.com/tahamajs/NeuralOps
- Implementación de `CrossAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/cross_attention.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA (subconjunto de derek-thomas): https://huggingface.co/datasets/derek-thomas/ScienceQA
