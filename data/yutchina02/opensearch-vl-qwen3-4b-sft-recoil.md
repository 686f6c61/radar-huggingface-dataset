# yutchina02/OpenSearch-VL-qwen3-4b-sft-RECOIL

## Resumen

OpenSearch-VL-qwen3-4b-sft-RECOIL es un checkpoint de investigación publicado por el usuario yutchina02 en Hugging Face. Se trata de un ajuste fino del modelo multimodal zhoushengzs/OpenSearch-VL-qwen3-4b-sft, que a su vez parte de la familia Qwen3-VL de 4B de parámetros. El modelo está orientado a la tarea image-text-to-text, es decir, a la comprensión conjunta de imágenes y texto y a la generación de respuestas conversacionales a partir de ambas modalidades.

El entrenamiento se ha realizado con una implementación independiente del método RECOIL (reinforcement learning), partiendo de la revisión `081be91bc78ef5d3a4fb400d6a9379a298280fca` del modelo base y ejecutando 124 pasos con un learning rate de 1e-6 sobre 4 GPU NVIDIA L20Y80GB. El autor advierte explícitamente de que no se ha completado una evaluación independiente y de que los logs finales mostraban valores muy elevados de loss y de norma del gradiente, por lo que la estabilidad numérica y la calidad resultante están por verificar.

Por tanto, se trata de un artefacto experimental más que de un modelo listo para producción: no se reclama ninguna mejora en benchmarks y la información pública disponible es muy limitada. Su interés radica en documentar un intento de aplicar RL sobre un VLM compacto de 4B, no en un uso operativo inmediato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3-VL, `qwen3_vl`); detalles internos no disponibles |
| Parametros totales | 569.856 (según safetensors); el nombre del checkpoint indica una base de 4B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, tokenizer y procesador multimodal (librería transformers) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base zhoushengzs/OpenSearch-VL-qwen3-4b-sft, construido sobre Qwen3-VL en su variante de 4B y con pipeline image-text-to-text. No se detalla en la información disponible la configuración interna (número de capas, dimensión oculta, mecanismo de atención del encoder visual ni estrategia de fusión multimodal), por lo que estos datos deben consultarse en la model card del modelo base.

El ajuste se realizó con una implementación independiente de RECOIL, un esquema de reinforcement learning. Los hiperparámetros documentados son: learning rate de 1e-6, lotes de 64 preguntas con 4 rollouts primarios por pregunta más ramas adicionales de RECOIL, 124 pasos completados el 16 de noviembre de 2026 y hardware de 4 GPU NVIDIA L20Y80GB. El repositorio incluye únicamente los pesos finales, el tokenizer y la configuración del procesador multimodal; no se publican estados del optimizador ni datos de entrenamiento. El propio autor señala que los logs tardíos mostraban valores muy altos de loss y de norma del gradiente, lo que apunta a posibles problemas de estabilidad numérica durante el entrenamiento.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) y conversación multimodal multi-turno, según el pipeline declarado.
- Comprensión de imágenes combinada con instrucciones en lenguaje natural, propia de la familia Qwen3-VL.
- Entrenamiento orientado a razonamiento mediante reinforcement learning (RECOIL), aunque sin evidencia publicada de mejora.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Capacidades especiales (modo thinking, audio, vídeo): no disponible.

## Casos de uso

- Investigación en reinforcement learning multimodal: el checkpoint sirve como punto de partida para reproducir o auditar el pipeline RECOIL sobre un VLM de 4B, comparando la evolución de loss y norma del gradiente frente al modelo base.
- Análisis de estabilidad de entrenamiento: dado que el autor reporta valores anómalos de loss y gradiente, el modelo es útil para estudiar divergencias numéricas en RL sobre modelos visión-lenguaje.
- Evaluación comparativa de checkpoints intermedios: permite contrastar el checkpoint SFT original (zhoushengzs/OpenSearch-VL-qwen3-4b-sft) con la versión post-RL en tareas image-text-to-text controladas.
- Prototipado de asistentes sobre imágenes en entorno de laboratorio: con las debidas cautelas, puede probarse en tareas de descripción o pregunta-respuesta sobre imágenes, siempre con validación manual.
- Docencia y experimentación académica: útil para ilustrar el flujo completo de un ajuste con RL sobre un VLM compacto, incluyendo la configuración de hardware (4 GPU L20Y80GB).
- Base para nuevos ajustes: al publicarse pesos, tokenizer y procesador, puede reutilizarse como inicialización de experimentos posteriores, siempre que se verifique primero su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la evaluación independiente del checkpoint no se ha completado y que no se reclama ninguna mejora en benchmarks.

## Requisitos de hardware

- El entrenamiento se realizó con 4 GPU NVIDIA L20Y80GB, lo que da una referencia del orden de magnitud de memoria utilizada en el pipeline RECOIL.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de la familia 4B, la inferencia en fp16 requeriría del orden de 8-9 GB de pesos, y en cuantizaciones de 4 bits del orden de 2-3 GB, aunque estas cifras no están confirmadas para este checkpoint concreto.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio (8,9 GB) sugiere pesos en precisión de 16 bits, lo que en principio podría caber en GPU de consumo con 12-16 GB de VRAM, pero no hay validación publicada.
- Opciones de despliegue: la librería declarada es transformers; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| OpenSearch-VL-qwen3-4b-sft-RECOIL (este) | ~4B (base); 569.856 según safetensors | no disponible | no disponible | Checkpoint experimental, sin evaluación |
| zhoushengzs/OpenSearch-VL-qwen3-4b-sft | ~4B | no disponible | no disponible | Modelo base SFT del que parte este checkpoint |
| Qwen3-VL (familia oficial) | Variantes de 4B y otras | no disponible en esta ficha | no disponible en esta ficha | Familia oficial de referencia |

No se dispone de datos de rendimiento comparativo para ninguna de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación independiente: el autor declara que no se ha completado y que no se reclama mejora alguna en benchmarks.
- Inestabilidad numérica: los logs finales mostraban valores muy elevados de loss y de norma del gradiente; la calidad y la estabilidad del checkpoint requieren investigación adicional.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no declarados: no hay garantía de cobertura multilingüe.
- Contexto no documentado: se desconoce la longitud máxima de contexto soportada.
- Riesgo de alucinación: inherente a los modelos generativos multimodales y no cuantificado para este checkpoint.
- Sesgos: no documentados; al no publicarse la composición del dataset de entrenamiento ni del ajuste RL, no es posible evaluar sesgos conocidos.
- Sin datos de entrenamiento ni estados del optimizador: dificulta la reproducibilidad completa del ajuste.
- Escaso soporte comunitario: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas.
- No apto para producción sin validación previa exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yutchina02/OpenSearch-VL-qwen3-4b-sft-RECOIL
- Modelo base: https://huggingface.co/zhoushengzs/OpenSearch-VL-qwen3-4b-sft
