# Ura0316/zils-mini-body-r3

## Resumen

zils-mini-body-r3 es un ajuste fino (fine-tune) del modelo torchcast-ai/torchcast-decision-4b, que a su vez deriva de Qwen/Qwen3.5-4B. Lo publica el usuario Ura0316 como "cuerpo" (body) para el pool de mezclas `d3-mini` de Zils, un proyecto asociado a la subred 127 de Bittensor. El repositorio contiene únicamente los pesos del modelo en el formato de chasis (chassis) del pool, sin la capa de respuesta, el prompt ni el runtime, que se toman del chasis fijado por el pool.

El modelo tiene 4.539.265.536 parámetros en bfloat16 (9,1 GB en el repositorio) y una licencia Apache-2.0. La modificación respecto al modelo base consiste en un adaptador LoRA de rango 64 entrenado y fusionado en las proyecciones de atención y atención lineal: 152 de los 723 tensores han cambiado, mientras que el resto se mantiene idéntico al modelo base.

Su relevancia es acotada y muy específica: no es un modelo de propósito general listo para usar, sino un componente de un ecosistema de evaluación y mezcla de modelos en Bittensor. Para desarrolladores e investigadores, resulta útil como ejemplo de fine-tuning parametrizado eficiente sobre un transformer de 4B y como pieza de un pipeline de "soup" de modelos, pero carece de model card detallada, benchmarks y documentación de uso independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención y atención lineal (derivada de Qwen3.5-4B); no se detalla la configuración exacta de capas |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (723 tensores, bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer que, según la model card, incorpora proyecciones de atención estándar y de atención lineal. El modelo base intermedio, torchcast-ai/torchcast-decision-4b, es un fine-tune de Qwen3.5-4B orientado a la toma de decisiones. Sobre esa base, zils-mini-body-r3 aplica un adaptador LoRA de rango 64 que se entrena y se fusiona en las proyecciones de atención y atención lineal, afectando a 152 de los 723 tensores del chasis. El resto de tensores permanece sin cambios respecto al modelo base.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal optimizada, etc.). Tampoco se documenta el proceso de mezcla (soup) del pool `d3-mini` ni los criterios de selección de este cuerpo. El repositorio solo contiene los pesos; la capa de respuesta, el prompt y el runtime provienen del chasis fijado por el pool Zils.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-4B y del fine-tune torchcast-decision-4b, aunque no se documentan evaluaciones específicas.
- Procesamiento de visión: la model card menciona "language and vision weights", por lo que el chasis incluye pesos de visión, si bien no se detalla su funcionamiento ni su calidad.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el nombre "decision" del modelo base sugiere orientación a decisiones, pero no se confirma.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Investigación sobre fine-tuning eficiente: el modelo sirve como caso de estudio de aplicación de un LoRA de rango 64 fusionado sobre un transformer de 4B, con un recuento concreto de tensores modificados (152 de 723), útil para analizar el impacto de adaptadores de bajo rango.
- Experimentación en ecosistemas Bittensor: puede emplearse como cuerpo dentro del pool `d3-mini` de la subred 127, para probar mecanismos de mezcla de modelos y evaluación descentralizada.
- Mezcla de modelos (model soup): al compartir chasis con otros cuerpos del pool, permite experimentar con interpolación de pesos y evaluar el efecto de la fusión de adaptadores.
- Reproducción de pipelines de fine-tuning: sirve para validar flujos que separan cuerpo y chasis (pesos frente a capa de respuesta y runtime), un patrón habitual en sistemas de agentes.
- Evaluación comparativa de bases: al derivar de Qwen3.5-4B y de torchcast-decision-4b, permite medir cómo un ajuste LoRA afecta al comportamiento respecto a esos modelos en tareas controladas.
- Docencia y formación: como ejemplo didáctico de publicación de pesos en safetensors con licencia Apache-2.0 y de estructura de repositorio de un fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 12-16 GB de VRAM para contexto corto.
- Cuantización: no se documentan versiones GGUF ni cuantizaciones oficiales; al ser un repositorio de safetensors en bfloat16, sería necesario convertir los pesos para usar formatos de 4 u 8 bits.
- GPU recomendadas: para bfloat16 completa, una RTX 4090 (24 GB) o A100/H100; en GPUs consumer de 12-16 GB (RTX 4070 Ti, RTX 4080) cabría con contexto reducido o cuantización.
- Despliegue: no se especifican opciones oficiales; al ser un transformer estándar en safetensors, sería compatible con vLLM, TGI o llama.cpp tras conversión, pero la dependencia del chasis del pool Zils puede limitar su uso fuera de ese entorno.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-body-r3 | 4,54B | no disponible | Apache-2.0 | HuggingFace (0 descargas) | Fine-tune LoRA de torchcast-decision-4b; solo cuerpo, requiere chasis del pool |
| torchcast-ai/torchcast-decision-4b | ~4B | no disponible | Apache-2.0 | HuggingFace | Modelo base directo; fine-tune de Qwen3.5-4B |
| Qwen/Qwen3.5-4B | ~4B | no disponible | Apache-2.0 | HuggingFace | Modelo original; ampliamente documentado y con ecosistema de herramientas |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas entre estos modelos.

## Limitaciones y advertencias

- El repositorio contiene solo el cuerpo del modelo: sin la capa de respuesta, el prompt y el runtime del chasis del pool Zils, el modelo no es funcional de forma autónoma.
- No hay model card detallada ni documentación de uso, evaluación o limitaciones por parte del autor.
- Ausencia total de benchmarks: no es posible evaluar su calidad frente al modelo base ni frente a alternativas.
- Riesgo de sesgos y alucinaciones heredado del modelo base (Qwen3.5-4B) y del fine-tune intermedio, sin análisis específico disponible.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe.
- Longitud de contexto desconocida, lo que impide planificar su uso en tareas de contexto largo.
- Aunque la licencia es Apache-2.0 y permite uso comercial, la dependencia del chasis del pool puede introducir restricciones prácticas o técnicas no documentadas.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere ausencia de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-05) en los metadatos, lo que puede indicar un artefacto de publicación o un repositorio de prueba.

## Enlaces

- HuggingFace: https://huggingface.co/Ura0316/zils-mini-body-r3
- Modelo base: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.
