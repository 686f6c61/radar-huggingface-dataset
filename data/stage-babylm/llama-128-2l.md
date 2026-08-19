# stage-babylm/llama-128-2L

## Resumen

El modelo `stage-babylm/llama-128-2L` es un modelo de lenguaje de tamaño extremadamente reducido, con apenas 649.856 parámetros, desarrollado por el usuario `stage-babylm` dentro del ecosistema del proyecto BabyLM. BabyLM es una iniciativa de investigación que promueve el entrenamiento de modelos de lenguaje con corpus limitados, simulando la cantidad de datos a la que está expuesto un niño. Este modelo concreto es un fine-tuning de un modelo base no especificado, entrenado sobre un dataset desconocido, y está orientado a experimentación académica más que a uso productivo.

Su relevancia radica en ser un ejemplo de modelo compacto basado en la arquitectura Llama, adaptado a las restricciones del desafío BabyLM. A pesar de su pequeño tamaño, se publica en formato safetensors y es compatible con la librería `transformers` y con `text-generation-inference`. La información disponible es escasa: la model card está generada automáticamente por el Trainer y no incluye detalles sobre arquitectura interna, datos de entrenamiento ni capacidades específicas más allá de la generación de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (estilo Llama, según el nombre del modelo) |
| Parametros totales | 649.856 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El nombre del modelo (`llama-128-2L`) sugiere una configuración de 2 capas y una dimensión oculta de 128, típica de los modelos pequeños del proyecto BabyLM, pero esta información no está confirmada en la documentación. La arquitectura base sería un transformer decoder-only similar a Llama, aunque no se especifica si incluye mecanismos como attention con RoPE o RMSNorm.

El entrenamiento se realizó mediante fine-tuning de un modelo base desconocido, sobre un dataset no documentado. Los hiperparámetros reportados incluyen una tasa de aprendizaje de 0.0018, batch size de 32, optimizador AdamW (fused) con betas (0.9, 0.95), scheduler coseno con 0.05 de warmup y una sola época. La pérdida de validación final fue de 2.1739. No se mencionan técnicas como RLHF, DPO ni ninguna innovación arquitectónica adicional.

## Capacidades

- Generación de texto básica: al ser un modelo de lenguaje de tamaño mínimo, puede producir secuencias de texto coherentes a nivel local, pero con capacidades semánticas y sintácticas muy limitadas.
- Fine-tuning: su pequeño tamaño lo hace adecuado para experimentos de adaptación a dominios específicos con recursos computacionales mínimos.
- Investigación educativa: útil para estudiar el comportamiento de modelos subescalados y comparar con arquitecturas más grandes.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigación académica en aprendizaje de lenguajes: el modelo puede utilizarse en estudios sobre la cantidad mínima de datos necesaria para adquirir ciertas habilidades lingüísticas, dentro del marco del desafío BabyLM.
- Experimentos de interpretabilidad: su tamaño reducido permite inspeccionar completamente las activaciones y pesos, facilitando análisis mecanicistas de cómo se representan conceptos en un transformer diminuto.
- Prototipado rápido de pipelines de NLP: sirve como reemplazo temporal de modelos grandes en entornos de desarrollo donde solo se necesita validar la lógica de un sistema de generación de texto.
- Benchmark de eficiencia: puede usarse para medir el rendimiento de frameworks de inferencia (vLLM, llama.cpp) en condiciones de modelo extremadamente pequeño.
- Docencia en arquitecturas transformer: como ejemplo didáctico para explicar el funcionamiento de la atención y las capas de un LLM sin requerir hardware especializado.
- Base para fine-tuning en tareas muy específicas y con pocos datos, como generación de plantillas o clasificación de texto simple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La entrada `model-index` en la model card está vacía (`results: []`), y la única métrica reportada es la pérdida de validación de 2.1739 durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, ya que el modelo tiene menos de 1 millón de parámetros y puede ejecutarse en CPU sin problemas.
- GPU recomendadas: cualquier GPU moderna (incluso integradas) es suficiente; una NVIDIA GTX 1050 Ti o superior sería más que adecuada.
- Cabe en cualquier hardware consumer, incluyendo Raspberry Pi y teléfonos móviles.
- Opciones de despliegue: compatible con `transformers` (pipeline de generación), `text-generation-inference`, y puede convertirse a GGUF para usar con llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones, pero en hardware moderno la generación sería prácticamente instantánea.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Dado que se trata de un modelo experimental del proyecto BabyLM, no hay alternativas comerciales o de investigación conocidas con las que contrastar. Se indica "no disponible".

## Limitaciones y advertencias

- Tamaño extremadamente reducido: con menos de 0,65 millones de parámetros, el modelo carece de la capacidad para producir texto fluido y coherente en tareas complejas; su uso en producción no es viable.
- Datos de entrenamiento desconocidos: no se especifica el corpus utilizado, lo que impide evaluar sesgos o dominios de conocimiento.
- Licencia no disponible: no se indica ninguna licencia, por lo que el uso comercial es incierto y se recomienda contactar al autor antes de cualquier aplicación fuera de investigación.
- Riesgo de alucinación: al ser un modelo tan pequeño, es probable que genere respuestas incoherentes o inventadas con alta frecuencia.
- Documentación incompleta: la model card es automática y carece de detalles esenciales como arquitectura exacta, tokenizador, o límites de contexto.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/stage-babylm/llama-128-2L)
- [Entrada en FriendliAI](https://friendli.ai/models/stage-babylm/llama-128-2L)
- [Proyecto BabyLM](https://babylm.github.io/)
