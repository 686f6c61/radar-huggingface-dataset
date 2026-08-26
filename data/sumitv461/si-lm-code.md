# sumitv461/si-lm-code

## Resumen

SI-LM-Code es un modelo de lenguaje de 1.5 mil millones de parámetros, desarrollado por el usuario sumitv461 bajo el nombre de proyecto "SI-LM v1" (Superintelligence Language Model). Se trata de un Transformer decoder-only entrenado desde cero en dos sesiones autónomas en Kaggle (10h + 8h), con un crecimiento incremental del tamaño del modelo a partir del mismo checkpoint, sin reentrenamiento desde cero. El proyecto busca crear un modelo especializado en razonamiento, matemáticas, código y uso de herramientas, con variantes para conversación grounded y orquestación de tareas.

La relevancia del modelo reside en su enfoque de entrenamiento con recursos limitados (una sola cuenta de Kaggle) y su estrategia de crecimiento por expansión de anchura y profundidad, además de un pipeline completo de preentrenamiento, SFT y RL con GRPO. El autor declara que, pese a su tamaño reducido, puede superar a modelos mucho más grandes en tareas específicas como chat en Hinglish, uso de herramientas, Q&A grounded y matemáticas/código con respuestas verificables. Sin embargo, no se han publicado resultados cuantitativos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RoPE, GQA, SwiGLU) |
| Parametros totales | 1.5B (versión v1.0) |
| Parametros activos | 1.5B (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (se menciona Hinglish como caso de uso, pero no hay lista oficial) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only con atención de consultas agrupadas (GQA), rotación posicional (RoPE) y activación SwiGLU. El entrenamiento se divide en tres etapas: preentrenamiento causal (Stage A), fine-tuning supervisado (Stage B) y RL con GRPO (Stage C) usando recompensas verificables. El proyecto incluye un mecanismo de crecimiento del modelo (width+depth expansion) que permite aumentar parámetros sin reentrenar desde cero, partiendo de 0.1B hasta 1.5B en la versión pública. Se entrenó sobre un corpus de datos descargados y limpiados, con empaquetado de tokens, y el proceso completo se ejecutó en dos sesiones de Kaggle con guardado de estado intermedio cada 30 minutos.

No se especifica el número total de tokens de entrenamiento, aunque el autor indica que se usaron 40B tokens para la versión 0.7B-1.5B. Tampoco se detalla la composición del dataset, pero se menciona un módulo `data_engine` que descarga, limpia y cura datos para SFT.

## Capacidades

- Generación de texto y razonamiento multi-paso.
- Matemáticas y código con respuestas verificables.
- Uso de herramientas (tool-use) entrenado mediante SFT sobre trazas estáticas.
- Conversación grounded (con recuperación y calibración de "no sé").
- Orquestación de tareas: variante que enruta consultas a los módulos Reason / Ground / herramientas.
- Soporte de chat en Hinglish (mezcla hindi e inglés) según el autor.
- Sin visión, audio u otras modalidades.

## Casos de uso

- Asistente de código en entornos de desarrollo: el modelo puede generar y explicar código en Python u otros lenguajes, con soporte para verificación de respuestas en problemas de programación.
- Chat grounded con calibración de ignorancia: ideal para aplicaciones de atención al cliente donde se requiere reconocer límites de conocimiento y derivar a fuentes externas.
- Generación de respuestas matemáticas verificables: útil para tutoría o resolución de problemas paso a paso con comprobación de resultados.
- Orquestación de consultas en sistemas multi-agente: el variante Orchestrator puede enrutar peticiones entre módulos especializados, mejorando la eficiencia de un pipeline.
- Prototipos de agentes con tool calling: aunque el entrenamiento es estático, puede integrarse en entornos que conecten con herramientas en tiempo real.
- Evaluación y comparación de modelos pequeños en tareas de razonamiento y código: útil para investigación académica con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados cuantitativos de benchmarks en la información disponible. El autor menciona que el modelo puede superar a modelos mucho más grandes en tareas específicas (Hinglish chat, tool-use, grounded Q&A, math/code con verificación), pero no proporciona números concretos. Por tanto, no se puede presentar una tabla de rendimiento fiable.

## Requisitos de hardware

- VRAM estimada: para un modelo de 1.5B en FP16 se requieren aproximadamente 3 GB de VRAM (pesos + activaciones). Con cuantización de 8 bits se puede reducir a ~2 GB, y en 4 bits a ~1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1660, RTX 2060, RTX 3060, RTX 4060, M1/M2/M3 de Apple). En GPUs de 8 GB o más se puede ejecutar cómodamente.
- Despliegue: se puede servir con frameworks como llama.cpp (formato GGUF), Ollama, vLLM (si se convierte a safetensors), o directamente con la implementación de HuggingFace Transformers si se suben los pesos.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 1.5B, en una GPU de consumo moderna se espera una velocidad de generación de 20-50 tokens por segundo, dependiendo de la cuantización y la longitud de contexto.

## Comparativa con modelos similares

No hay una comparación directa con otros modelos de 1.5B en la información disponible. Como referencia general, los modelos de 1.5B más conocidos son:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SI-LM v1 (este) | 1.5B | no disponible | no disponible | Entrenado desde cero, orientado a código y razonamiento |
| Qwen2.5-1.5B | 1.5B | 32K | Apache 2.0 | Modelo generalista con buen rendimiento en multilingüe |
| Llama-3.2-1B | 1.2B | 128K | Meta Llama | Modelo ligero con soporte de herramientas |
| Gemma-2-2B | 2.6B | 8K | Gemma license | Modelo de Google con buenos resultados en razonamiento |

Sin datos de benchmark de SI-LM, no es posible comparar rendimiento real. La licencia de SI-LM no está especificada, lo que limita su uso comercial.

## Limitaciones y advertencias

- El modelo no supera a GPT-4 en conocimiento general, según el propio autor.
- El entrenamiento se realizó en una sola cuenta de Kaggle, con riesgo de fallo del punto único, aunque se mitiga con guardados intermedios.
- El uso de herramientas se entrenó con datos estáticos, por lo que no tiene grounding en tiempo real; la conexión al web se hace externamente mediante el Space de HuggingFace.
- No se especifica la licencia, por lo que no se puede garantizar el uso comercial.
- No hay información sobre sesgos o alucinaciones, aunque al ser un modelo pequeño es probable que tenga tasas de alucinación elevadas en dominios no cubiertos.
- La longitud de contexto no se conoce, lo que limita aplicaciones de documentos largos.
- No hay soporte oficial de cuantización ni formatos de pesos publicados, lo que dificulta su despliegue en entornos de producción.

## Enlaces

- HuggingFace: https://huggingface.co/sumitv461/si-lm-code
- (No se encontraron otros enlaces oficiales: paper, blog, repo o demo)
