# Wonderlab-Testing-Grounds/Interferon-gamma-RP-9B-Preview-2608

## Resumen

Interferon-gamma-RP-9B-Preview-2608 es un finetune experimental del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario Wonderlab-Testing-Grounds. Está orientado exclusivamente a roleplay (RP) y roleplay erótico (ERP), con un énfasis particular en escritura creativa de alta calidad. Según la model card, es una versión preliminar de un futuro modelo llamado Indexnusrefather/Nyx-RP-9B-Instruct-2608-v2, y el autor lo describe como "potencialmente inestable" y con un "rank muy, muy alto" (probablemente refiriéndose al rank de LoRA).

El modelo se presenta como un experimento técnico: el autor indica que esta versión utiliza un dataset más grande que la anterior (Nyx v1) y que se entrenó con un enfoque diferente porque el método de v1 "rompía" este modelo. Está pensado para usuarios que buscan un modelo de roleplay conversacional en inglés, con foco en creatividad y naturalidad, aunque sin garantías de estabilidad ni de calidad de producción.

Con 9.197.093.888 parámetros (aproximadamente 9.2B), es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo con cuantización. Su licencia Apache 2.0 permite uso comercial, pero su naturaleza experimental y la falta de documentación técnica detallada lo hacen inadecuado para entornos de producción sin pruebas previas exhaustivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (finetune de Qwen/Qwen3.5-9B, arquitectura no especificada) |
| Parametros totales | 9.197.093.888 (9.2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (el repo incluye tags de GGUF, pero sin detalle de formatos) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un finetune del modelo base Qwen/Qwen3.5-9B, que es un transformer denso de 9.2B parámetros. No se han proporcionado detalles sobre la arquitectura interna del finetune (por ejemplo, si usa LoRA o fine-tuning completo), aunque la referencia a "rank 200" sugiere que se trata de un ajuste con LoRA de alto rango. El autor indica que el entrenamiento se realizó con un dataset más grande que el de la versión anterior (Nyx v1) y que se usó un enfoque diferente porque el método previo producía resultados inestables en esta configuración.

No hay información pública sobre la composición del dataset, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. El autor menciona que limpió el dataset para eliminar "Gemma slop", un término informal para referirse a contenido genérico o de baja calidad generado por modelos Gemma, pero no aporta más detalles. La falta de transparencia en el entrenamiento es una limitación importante para evaluar su comportamiento.

## Capacidades

- Generación de texto enfocada en roleplay y escritura creativa, con capacidad de mantener personajes y narrativas multi-turno.
- Soporte de roleplay erótico (ERP) como caso de uso principal, según los tags del modelo.
- Conversación de alta calidad en inglés, con énfasis en creatividad y estilo literario.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-step ni capacidades multimodales.
- El autor lo describe como "muy alto rank" (rank 282), lo que sugiere que en pruebas informales del propio autor mostró un buen rendimiento en tareas de roleplay, pero no hay benchmarks objetivos que lo confirmen.

## Casos de uso

- Creación de personajes para juegos de rol escritos: el modelo puede mantener una persona coherente a lo largo de conversaciones largas, ideal para campañas de RPG por texto o foros de roleplay.
- Escritura de ficción interactiva: permite generar narrativas ramificadas donde el usuario toma decisiones y el modelo responde con avances de historia, gracias a su enfoque en creatividad y contexto conversacional.
- Simulación de diálogos de personajes para guionistas y escritores: el modelo puede explorar variantes de diálogo de un personaje concreto, ayudando a desarrollar voces diferenciadas.
- Generación de contenido para comunidades de roleplay erótico (ERP): es el caso de uso explícito del modelo, con capacidad de mantener escenas de larga duración y tono íntimo.
- Prototipado de sistemas de chat con personalidad: el modelo puede usarse para experimentar con agentes conversacionales que requieren una personalidad marcada, aunque su inestabilidad limita su uso en producción.
- Investigación sobre fine-tuning de modelos pequeños para tareas de estilo: el modelo puede servir como caso de estudio para entender cómo el fine-tuning con datasets especializados afecta al comportamiento del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estandarizada. La única indicación de rendimiento es la afirmación subjetiva de que el modelo tiene un "rank muy alto" en tareas de roleplay, lo que no es verificable.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.2B parámetros, en FP16 necesitaría aproximadamente 18.4 GB de VRAM; en INT8, unos 9.2 GB; en INT4, unos 4.6 GB.
- GPUs recomendadas: una RTX 4090 (24 GB) puede ejecutar el modelo en FP16 o INT8; una RTX 3090 (24 GB) o RTX 3080 (10-12 GB) requeriría cuantización INT4 para caber.
- En GPUs de consumo: sí, es posible ejecutarlo en tarjetas de 8-16 GB usando cuantización GGUF (por ejemplo, Q4_K_M), aunque la velocidad será limitada.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se generen los formatos GGUF o AWQ correspondientes.
- Latencia y throughput: no disponible. Para un modelo de 9.2B en una GPU de 24 GB, se espera una velocidad de generación de 30-60 tokens/s con vLLM y cuantización INT4, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos objetivos para comparar con otros modelos de roleplay de la misma categoría. El modelo base Qwen/Qwen3.5-9B es un modelo de propósito general con mejores resultados en benchmarks estándar, pero sin especialización en roleplay. No hay información sobre alternativas como Llama-3-8B-Instruct o Mistral-7B-Instruct para comparar en tareas de roleplay, ni benchmarks publicados de este modelo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo es experimental y el propio autor lo marca como "potencialmente inestable". No se recomienda su uso en producción sin una evaluación exhaustiva.
- No hay garantías de calidad: el autor admite que la model card es pobre y que el modelo es un "primer intento" de una versión futura.
- Solo soporta inglés; no está entrenado para otros idiomas.
- No hay documentación sobre sesgos ni alucinaciones específicas, pero al ser un modelo de roleplay, es probable que genere contenido ficticio sin señalar que lo es, lo que puede inducir a error en contextos no ficcionales.
- La licencia Apache 2.0 permite uso comercial, pero el estado inestable y la falta de benchmarks hacen que sea un riesgo para cualquier aplicación profesional.
- La ausencia de información sobre el contexto máximo (heredado de Qwen3.5-9B) implica que no se puede garantizar un comportamiento correcto en conversaciones muy largas.
- El modelo puede producir contenido sexual explícito, lo que requiere moderación en entornos de uso público.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wonderlab-Testing-Grounds/Interferon-gamma-RP-9B-Preview-2608
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se encontraron papers, repositorios de código ni demos asociados a este modelo.
