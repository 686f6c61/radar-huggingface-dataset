# TreezzZ/opd-teacher-alfworld-7b

## Resumen

El modelo `TreezzZ/opd-teacher-alfworld-7b` es un ajuste fino (fine-tuning) del modelo base Qwen2.5-7B-Instruct, orientado a tareas de navegación y manipulación en el entorno de simulación ALFWorld. ALFWorld es un benchmark de referencia para agentes interactivos que combina comprensión de lenguaje natural, razonamiento espacial y planificación de acciones en escenarios domésticos. El nombre "opd-teacher" sugiere que el entrenamiento podría emplear una estrategia de destilación o imitación de un profesor (teacher forcing), aunque no se dispone de documentación oficial que lo confirme.

El modelo conserva la arquitectura original de Qwen2.5-7B, con 7,6 mil millones de parámetros y una ventana de contexto de hasta 128K tokens. Su licencia Apache 2.0 permite uso comercial sin restricciones, y está publicado exclusivamente en inglés. La relevancia de este lanzamiento radica en que ofrece una alternativa ajustada para la investigación en agentes autónomos, aunque la ausencia de benchmarks publicados y de detalles sobre el proceso de entrenamiento limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2.5) con RoPE, SwiGLU, RMSNorm y atención GQA |
| Parametros totales | 7.615.616.512 (7,61B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (configuración base); 32.768 tokens en config.json por defecto |
| Tipos de cuantizacion | no disponible (solo safetensors en FP16/BF16) |
| Idiomas soportados | Inglés (según metadatos del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la misma que la de Qwen2.5-7B: un transformer causal con 28 capas, 28 cabezas de atención para consultas y 4 para claves/valores (GQA), normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base fue preentrenado con un corpus multilingüe extenso y posteriormente ajustado con instrucciones (instruction tuning) por el equipo de Qwen, incluyendo técnicas de RLHF y DPO. El ajuste fino específico para ALFWorld se realizó sobre la versión instruct, pero no se han publicado detalles sobre el dataset, el número de tokens de entrenamiento, el método de optimización ni las épocas empleadas. Tampoco se documenta si se aplicaron técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento contextual, heredadas del modelo base Qwen2.5-7B-Instruct.
- Comprensión de instrucciones en lenguaje natural para tareas de navegación y manipulación en entornos simulados (ALFWorld).
- Capacidad de seguir conversaciones multi-turno gracias al ajuste instruct del modelo base.
- Soporte de tool calling y function calling, aunque no se ha verificado específicamente en este fine-tune.
- Capacidad de procesar contextos largos (hasta 128K tokens con YaRN), útil para historiales de interacción extensos.
- No se han documentado capacidades de visión, audio ni modos de razonamiento explícitos.

## Casos de uso

- Investigación en agentes interactivos: el modelo puede utilizarse como política de actuación en el entorno ALFWorld para estudiar planificación, navegación y manipulación de objetos.
- Evaluación de métodos de aprendizaje por refuerzo: al ser un fine-tune específico, sirve como baseline para comparar algoritmos de RL o imitación.
- Simulación de asistentes domésticos: en entornos controlados, puede generar secuencias de acciones a partir de instrucciones textuales, útil para prototipos de robótica.
- Generación de datos sintéticos: puede emplearse para crear episodios de entrenamiento en ALFWorld, alimentando otros modelos o pipelines.
- Pruebas de robustez lingüística: al estar basado en Qwen2.5, permite evaluar la comprensión de instrucciones complejas en inglés.
- Desarrollo de sistemas de diálogo orientados a tareas: su capacidad de seguir instrucciones multi-turno lo hace candidato para asistentes virtuales en dominios restringidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no reporta métricas en tareas estándar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos en ALFWorld. Se recomienda consultar el repositorio de HuggingFace para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización FP16/BF16, el modelo requiere aproximadamente 15,2 GB de VRAM (según el tamaño del repositorio). Con cuantización INT8 (no publicada) se reduciría a ~8 GB; con INT4 a ~4-5 GB, pero no se ofrecen archivos cuantizados.
- GPU recomendadas: para FP16, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es suficiente. Para consumer GPU de 16 GB (RTX 4080, 3090) sería necesario cuantizar.
- No cabe en GPUs de 8 GB (como RTX 3060 Ti) sin cuantización agresiva.
- Opciones de despliegue: compatible con transformers, vLLM, TGI y llama.cpp (si se generan archivos GGUF). No se proporcionan archivos GGUF ni AWQ en el repo.
- Latencia y throughput: no disponibles. Para un modelo de 7B en FP16, se estima un throughput de 20-40 tokens/s en una A100, pero sin datos verificados.

## Comparativa con modelos similares

La siguiente comparación se basa en el modelo base Qwen2.5-7B-Instruct, ya que no hay datos específicos del fine-tune. Modelos comparables en tamaño y orientación a agentes:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct | 7,61B | 131K | Apache 2.0 | Instruct general |
| Llama-3.1-8B-Instruct | 8,03B | 128K | Llama 3.1 Community License | Instruct general |
| Mistral-7B-Instruct v0.3 | 7,24B | 32K | Apache 2.0 | Instruct general |
| TreezzZ/opd-teacher-alfworld-7b | 7,61B | 131K | Apache 2.0 | Fine-tune para ALFWorld |

No se dispone de comparativas de rendimiento en ALFWorld ni en benchmarks generales para este fine-tune concreto.

## Limitaciones y advertencias

- No hay documentación sobre el proceso de fine-tuning: dataset, hiperparámetros, épocas o técnica de entrenamiento. Esto dificulta reproducir o evaluar el modelo.
- La model card es una copia de la de Qwen2.5-7B-Instruct, sin información específica sobre el ajuste para ALFWorld.
- No se han publicado benchmarks ni evaluaciones de sesgos, alucinaciones o robustez en el dominio de agentes.
- El modelo solo está etiquetado para inglés; su rendimiento en otros idiomas es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo puede heredar sesgos del corpus de entrenamiento de Qwen2.5.
- Para uso en producción, se recomienda validar el comportamiento en el entorno ALFWorld real, ya que no hay garantías de rendimiento sin pruebas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente y sin validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TreezzZ/opd-teacher-alfworld-7b
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Paper de ALFWorld (referencia general): https://arxiv.org/abs/2010.03768
