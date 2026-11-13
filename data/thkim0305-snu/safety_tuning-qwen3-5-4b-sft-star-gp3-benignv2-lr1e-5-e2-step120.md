# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-gp3-benignv2-lr1e-5-E2-step120

## Resumen

El modelo `Safety_Tuning-Qwen3.5-4B-SFT-STAR-gp3-benignv2-lr1e-5-E2-step120` es un checkpoint de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B, publicado por el usuario thkim0305-SNU. Se trata de un experimento de alineación de seguridad orientado a modular el comportamiento del modelo base mediante datos etiquetados como "benign v2" y un pipeline denominado "STAR GP3". El identificador del repositorio codifica los hiperparámetros del entrenamiento: learning rate de 1e-5, 2 épocas y 120 pasos de optimizador completados.

El modelo conserva la arquitectura y el tamaño del Qwen3.5-4B original, con 4.659.865.088 parámetros totales según los pesos en safetensors, y un repositorio de 9,3 GB que incluye pesos de inferencia y tokenizador en formato Hugging Face. La model card es extremadamente escueta y no documenta composición del dataset, metodología de seguridad ni resultados de evaluación, por lo que la información disponible se limita prácticamente a los metadatos del entrenamiento.

Su relevancia es limitada y de carácter experimental: se trata de un checkpoint intermedio de una campaña de SFT, sin descargas ni interacciones en el momento de la consulta, y sin benchmarks publicados. Resulta útil como referencia para quienes investigan técnicas de safety tuning sobre modelos Qwen, pero no constituye una versión lista para producción ni una release consolidada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Qwen3.5, según modelo base; detalles no disponibles) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del Qwen3.5-4B, por lo que hereda la arquitectura del modelo base, si bien la model card no detalla si se trata de un transformer denso convencional, un híbrido o una variante MoE. Los pesos publicados suman 4.659.865.088 parámetros, coherentes con un modelo denso de aproximadamente 4,6 mil millones de parámetros.

El entrenamiento consistió en SFT con learning rate de 1e-5, dos épocas y 120 actualizaciones de optimizador (índice de checkpoint nativo 119). El checkpoint proviene de la ejecución `qwen35-star-gp3-benignv2-sft-lr1e5-4ep-gpu0123-20261112-v1` y se exportó como `qwen35-gp3-benignv2-sft-lr1e5-epoch2-nine-eval-pro6000-gpu1-20261112-v1`. No se especifican el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales. El repositorio contiene únicamente pesos de inferencia y tokenizador; el estado del optimizador y los registros de entrenamiento permanecen en el almacenamiento original.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-4B.
- Procesamiento image-text-to-text según las etiquetas del repositorio, lo que sugiere capacidades multimodales heredadas del modelo base.
- Ajuste orientado a seguridad (safety tuning) mediante SFT sobre datos "benign v2".
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada (la etiqueta image-text-to-text apunta a entrada de imagen y texto, sin más detalle).

## Casos de uso

- Investigación en alineación de seguridad: el checkpoint permite reproducir y analizar el efecto de un SFT con learning rate 1e-5 y 2 épocas sobre el comportamiento de rechazo del Qwen3.5-4B, comparándolo con el modelo base y con otros checkpoints de la misma campaña.
- Evaluación de robustez frente a prompts benignos: al estar entrenado sobre datos "benign v2", sirve para medir si el ajuste preserva la utilidad general en conversaciones normales mientras modula respuestas sensibles.
- Punto de partida para experimentos de continuación de entrenamiento: al ser un checkpoint intermedio (paso 120), puede reutilizarse para reanudar el SFT con otros hiperparámetros o datasets.
- Prototipado de asistentes conversacionales de bajo coste: con 4,6 mil millones de parámetros, el modelo puede desplegarse en una única GPU de gama alta para pruebas internas de diálogo multi-turno.
- Análisis comparativo de checkpoints: permite estudiar la evolución del modelo a lo largo de las épocas y pasos de la campaña STAR GP3, comparando pesos y salidas en puntos concretos del entrenamiento.
- Evaluación multimodal exploratoria: la etiqueta image-text-to-text sugiere que el modelo base acepta entradas de imagen y texto, por lo que puede emplearse en pruebas de descripción de imágenes o respuesta a preguntas visuales, siempre verificando primero el comportamiento real del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa para un modelo denso de 4,6 mil millones de parámetros, en FP16 se requieren aproximadamente 9,3 GB solo para pesos, en FP8 unos 4,7 GB y en cuantización de 4 bits unos 2,3 GB, sin contar caché KV ni overhead.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar GPUs con 16 GB o más de VRAM en FP16 (A100, H100, L40S, RTX 4090) y GPUs de 8-12 GB con cuantización.
- ¿Cabe en GPU de consumo? Probablemente sí con cuantización en GPUs de 8 GB o más, y en FP16 en GPUs de 16 GB o más; no confirmado por el autor.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-SFT-STAR-gp3-benignv2-lr1e-5-E2-step120 | 4,66 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint SFT experimental de seguridad |
| Qwen/Qwen3.5-4B (modelo base) | ~4 B | no disponible | no disponible en esta ficha | Hugging Face | Referencia directa del ajuste |
| Alternativas de la misma categoría (safety tuning sobre modelos de ~4 B) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La model card no documenta la composición del dataset de seguridad ni los criterios de etiquetado, por lo que no es posible auditar qué comportamientos se han reforzado o suprimido.
- No se han publicado evaluaciones de seguridad, benchmarks de utilidad ni comparaciones con el modelo base; el riesgo de degradación de capacidades tras el SFT es desconocido.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no cuantificado para este checkpoint.
- Idiomas soportados y longitud de contexto no documentados; no debe asumirse el contexto nativo del Qwen3.5-4B sin verificación.
- Es un checkpoint intermedio (paso 120 de una campaña de 4 épocas), no una release final; puede contener comportamientos inestables propios de un punto intermedio del entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero al derivar del Qwen3.5-4B conviene verificar las condiciones del modelo base antes de desplegarlo en producción.
- Sin descargas ni validación comunitaria: no hay evidencia externa de su calidad o estabilidad.
- El repositorio no incluye estado del optimizador ni registros de entrenamiento, lo que dificulta la reproducibilidad completa.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-gp3-benignv2-lr1e-5-E2-step120
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
