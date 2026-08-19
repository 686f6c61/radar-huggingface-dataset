# stage-babylm/llama-384-1L

## Resumen

El modelo llama-384-1L es un pequeño modelo de lenguaje basado en la arquitectura Llama, desarrollado por el usuario stage-babylm dentro del ecosistema de la competición BabyLM. Con apenas 2.539.392 parámetros, está diseñado para investigar la adquisición del lenguaje en modelos entrenados con cantidades limitadas de datos, emulando la exposición lingüística de un niño. El nombre del modelo indica una configuración de 384 unidades de ocultación y una única capa.

El modelo fue fine-tuneado a partir de una base no especificada sobre un dataset desconocido, y alcanza una pérdida de validación de 1,9796 tras una única época de entrenamiento con 40.278 pasos. Se trata de un artefacto de investigación, no de un modelo listo para producción, y su relevancia reside en el estudio de cómo modelos extremadamente pequeños pueden aprender estructuras lingüísticas con datos escasos. La model card está generada automáticamente y carece de la mayoría de la documentación técnica esperable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) |
| Parametros totales | 2.539.392 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El nombre del modelo indica una arquitectura Llama con dimensión oculta de 384 y una única capa, aunque la model card no proporciona detalles arquitectónicos explícitos. Se trata de un transformer decoder-only de tamaño extremadamente reducido, pensado para el régimen de datos limitados de la competición BabyLM. El repositorio incluye los tags de transformers, text-generation-inference y endpoints_compatible, lo que confirma su integración con el ecosistema de HuggingFace.

El entrenamiento se realizó con una tasa de aprendizaje de 0,0018, batch size de 32, optimizador AdamW con betas (0.9, 0.95) y epsilon 1e-06, scheduler cosine con warmup del 5%, durante una única época. La pérdida de validación descendió de 7,0098 a 1,9796 a lo largo de 40.278 pasos. El dataset de entrenamiento no está especificado en la model card, que indica únicamente "unknown dataset". No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación adicional.

## Capacidades

- Generación de texto autoregresiva básica gracias a su arquitectura decoder.
- Investigación en adquisición del lenguaje: diseñado para estudiar cómo modelos pequeños aprenden de datos limitados, en el contexto de la competición BabyLM.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales (visión, audio) ni modo de pensamiento.
- El soporte multilingüe no está especificado en la documentación disponible.

## Casos de uso

- Investigación académica en adquisición del lenguaje: permite estudiar qué estructuras lingüísticas puede aprender un transformer de 2,5M de parámetros con datos limitados, comparable a la exposición de un niño, y contrastarlo con las variantes de más capas del mismo autor.
- Comparación de arquitecturas en régimen de datos escasos: sirve como baseline para evaluar el impacto del número de capas (frente a la variante llama-384-4L) en el aprendizaje con datos limitados.
- Educación en NLP: por su tamaño reducido, es útil para enseñar conceptos de entrenamiento de transformers sin necesidad de recursos computacionales elevados, permitiendo ejecutar ciclos completos de fine-tuning en minutos.
- Experimentación con técnicas de adaptación: permite probar métodos como LoRA, quantización o destilación sobre un modelo diminuto de forma rápida y económica antes de escalar a modelos mayores.
- Análisis de representaciones internas: al tener una única capa, facilita la interpretabilidad y la visualización directa de los patrones aprendidos durante el entrenamiento.
- Benchmark de eficiencia de frameworks de inferencia: útil para medir el overhead de herramientas como text-generation-inference o transformers en modelos extremadamente pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index del repositorio declara una lista de resultados vacía. El único dato de rendimiento disponible es la pérdida de validación de 1,9796 tras el entrenamiento, junto con la curva de pérdidas de entrenamiento y validación documentada en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32, ya que los pesos ocupan aproximadamente 10 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo puede ejecutarse incluso en CPU sin problemas de latencia apreciables.
- Sí cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) con amplio margen.
- Opciones de despliegue: compatible con transformers, text-generation-inference y endpoints compatibles, según los tags del repositorio.
- Latencia y throughput: no disponibles, pero al tratarse de un modelo de 2,5M de parámetros, la generación es prácticamente instantánea incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama-384-1L | 2,5M | 1 | no disponible | no disponible | HuggingFace |
| llama-384-4L | no disponible | 4 | no disponible | no disponible | HuggingFace / FriendliAI |

La comparativa se limita a la variante 4L del mismo autor, de la que no se dispone de datos detallados de parámetros, contexto ni licencia. No hay información suficiente sobre otros modelos comparables dentro del ecosistema BabyLM para establecer una tabla más amplia.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción ni para tareas reales de generación de texto.
- Calidad de generación muy limitada: con 2,5M de parámetros y una sola capa, la coherencia del texto generado será muy pobre y no apta para aplicaciones prácticas.
- Sesgos y alucinaciones: no se han evaluado, pero son esperables en un modelo de este tamaño y con un dataset de entrenamiento desconocido.
- Dataset de entrenamiento no especificado: se desconoce la procedencia de los datos, lo que impide evaluar posibles sesgos o limitaciones lingüísticas.
- Licencia no especificada: no se puede determinar si es seguro su uso comercial o su redistribución.
- Idiomas no especificados: se desconoce qué lenguas soporta el modelo.
- Longitud de contexto no documentada: no se puede garantizar un comportamiento adecuado en secuencias largas.
- Documentación incompleta: la model card está generada automáticamente y carece de descripción, usos previstos y datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stage-babylm/llama-384-1L
- Variante 4L en FriendliAI: https://friendli.ai/models/stage-babylm/llama-384-4L
- Proyecto BabyLM: https://babylm.github.io/
