# stage-babylm/llama-128-8L

## Resumen

El modelo `stage-babylm/llama-128-8L` es un modelo de lenguaje pequeño (SLM) de 1,83 millones de parámetros, desarrollado por el equipo Stage BabyLM como parte de la competición BabyLM 2026. Esta iniciativa académica investiga el aprendizaje del lenguaje en muestras de datos limitadas, comparables a la cantidad de texto que recibe un niño durante sus primeros años de vida, en contraste con los cientos de miles de millones de tokens que consumen los grandes modelos comerciales.

El modelo utiliza una arquitectura Llama adaptada a una escala mínima, con 128 dimensiones de embedding y 8 capas, y ha sido entrenado durante una sola época sobre un conjunto de datos no especificado. Su relevancia radica en servir como banco de pruebas para estudiar la eficiencia del aprendizaje con datos limitados, así como para investigar la escalabilidad de la arquitectura Transformer en rangos de parámetros extremadamente reducidos. El repositorio incluye pesos en formato safetensors compatibles con la librería Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (Transformer decoder) |
| Parametros totales | 1.830.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama estándar, un Transformer decoder-only con mecanismo de atención por ventanas rotatorias (RoPE), normalización RMSNorm y activación SiLU. A partir del nombre del modelo se infiere una configuración de 128 dimensiones ocultas y 8 capas, aunque no se han publicado detalles completos de la configuración interna.

El entrenamiento se realizó con el Trainer de HuggingFace durante una única época, con un tamaño de lote de 32, una tasa de aprendizaje de 0,0018 con programación coseno y un optimizador AdamW fusionado. La pérdida de validación final fue de 2,0440. No se especifica el conjunto de datos utilizado, aunque por el contexto de BabyLM se espera un corpus de decenas de millones de tokens, muy inferior a los usados en modelos convencionales. No hay evidencia de fases de ajuste por instrucciones, RLHF o DPO.

## Capacidades

- Generación de texto básica: el modelo puede producir texto autocompletado, aunque su capacidad expresiva está muy limitada por su tamaño reducido.
- Modelado de lenguaje: su función principal es la predicción de la siguiente palabra, como demuestra la pérdida de validación registrada.
- Investigación académica: es una herramienta para estudiar el aprendizaje del lenguaje con datos limitados, no un producto listo para producción.
- No se ha demostrado capacidad de razonamiento complejo, generación de código, matemáticas, tool calling, agentes ni soporte multilingüe.

## Casos de uso

- Investigación en eficiencia del aprendizaje: el modelo permite estudiar cómo la arquitectura Transformer se comporta con datos extremadamente limitados, comparando curvas de pérdida y capacidad de generalización con modelos más grandes.
- Experimentos de escalabilidad: su tamaño mínimo lo hace ideal para probar técnicas de escalado, regularización o aumento de datos en entornos académicos.
- Docencia en PLN: puede utilizarse en cursos universitarios para ilustrar el funcionamiento interno de un Transformer, ya que su tamaño permite inspeccionar y visualizar todas las capas y pesos sin necesidad de hardware especializado.
- Pruebas de pipelines de entrenamiento: sirve como modelo de humo para validar flujos de trabajo con Transformers y Trainer, antes de lanzar entrenamientos costosos.
- Comparación de arquitecturas: su diseño simple permite aislar variables y comparar modificaciones arquitectónicas en condiciones controladas.
- Estudio de BabyLM: los participantes de la competición pueden analizar este modelo como punto de referencia para sus propias propuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una pérdida de validación de 2,0440 tras el entrenamiento, sin comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: inferior a 10 MB en FP32, por lo que el modelo cabe en cualquier GPU comercial, integrada o dedicada.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también puede ejecutarse en CPU sin problemas.
- Compatible con hardware de consumo: sí, incluso en Raspberry Pi o sistemas embebidos.
- Opciones de despliegue: al ser un modelo de Transformers estándar, puede servirse con HuggingFace TGI, aunque su uso principal es académico; también es compatible con llama.cpp si se convierte a GGUF.
- Latencia y throughput: no se han publicado mediciones, pero por su tamaño se esperan latencias de milisegundos en CPU y throughput muy alto en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| stage-babylm/llama-128-8L | 1,83 M | no disponible | no disponible | Investigacion BabyLM |
| stage-babylm/llama-64-8L | ~0,9 M (estimado) | no disponible | no disponible | Investigacion BabyLM |
| TinyStories (modelos pequenos) | 1-10 M | variable | MIT | Investigacion narrativa infantil |

No se dispone de datos de rendimiento comparativos entre estos modelos.

## Limitaciones y advertencias

- Tamaño extremadamente reducido: con menos de 2 millones de parámetros, el modelo no puede generar texto coherente más allá de frases muy cortas y no es útil para tareas reales de producción.
- Sin datos de entrenamiento publicados: no se conoce la composición, el idioma ni el volumen del corpus, lo que impide evaluar sesgos o cobertura lingüística.
- Licencia no especificada: no se puede determinar si el modelo es utilizable comercialmente; se recomienda contactar con el autor antes de cualquier uso.
- Sin instrucciones de uso: la model card no documenta el prompt adecuado, el tokenizador recomendado ni el formato de entrada esperado.
- Sin benchmarks: no hay evidencia objetiva de su capacidad más allá de la pérdida de validación, que es difícil de interpretar sin contexto.
- Modelo generado automáticamente: la model card contiene el aviso estándar de Trainer, lo que sugiere que el autor no ha documentado el modelo de forma deliberada.
- Posibles alucinaciones: como cualquier modelo de lenguaje, puede generar contenido falso o incoherente, con mayor probabilidad dado su tamaño.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stage-babylm/llama-128-8L
- Proyecto BabyLM: https://babylm.github.io/
- Modelo relacionado llama-64-8L: https://huggingface.co/stage-babylm/llama-64-8L
- Repositorio de modelos Llama de Meta: https://github.com/meta-llama/llama-models
