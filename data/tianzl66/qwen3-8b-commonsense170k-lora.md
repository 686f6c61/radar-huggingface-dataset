# tianzl66/Qwen3-8B-CommonSense170K-LoRA

## Resumen

El modelo `tianzl66/Qwen3-8B-CommonSense170K-LoRA` es un adaptador LoRA obtenido mediante fine-tuning supervisado del modelo base Qwen3-8B sobre el dataset Commonsense170K. Desarrollado por el usuario tianzl66, este checkpoint está diseñado específicamente para mejorar el razonamiento de sentido común en tareas de comprensión lectora y conocimiento del mundo. El adaptador se presenta como el checkpoint fuente para un experimento de Spectral Surgery, una técnica de intervención en el espacio de pesos del modelo.

El adaptador tiene un tamaño de repositorio de 0,2 GB y se distribuye en formato safetensors. El entrenamiento se realizó en modo chat no-thinking de Qwen3, con una secuencia de 2048 tokens y 170.420 muestras. Los resultados de evaluación en una suite de ocho tareas de sentido común muestran una precisión macro del 90,79% y micro del 91,84%, lo que indica un rendimiento sólido en este dominio específico. La relevancia de este modelo radica en su utilidad como base para investigaciones sobre intervenciones en pesos (Spectral Surgery) y como adaptador ligero para mejorar capacidades de razonamiento de sentido común en Qwen3-8B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-8B (transformer denso) |
| Parametros totales | No disponible (adaptador de 0,2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos en bf16 según entrenamiento) |
| Idiomas soportados | No disponible (hereda los del modelo base Qwen3-8B) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B, un modelo de lenguaje denso de la familia Qwen3. El fine-tuning se realizó con la librería PEFT, aplicando LoRA con rango 16, alpha 32 y dropout 0,05 sobre todas las capas lineales del modelo base. El entrenamiento utilizó el dataset Commonsense170K, compuesto por 170.420 muestras, durante 2 épocas con un tamaño de lote global de 32, una tasa de aprendizaje de 2e-4 con scheduler coseno y warmup del 10%. La precisión fue bf16 y se usó el modo chat no-thinking de Qwen3, es decir, sin activación del modo de razonamiento explícito.

El checkpoint está pensado como fuente para experimentos de Spectral Surgery, una técnica que interviene en los componentes espectrales de los pesos del modelo. No se detallan innovaciones arquitectónicas adicionales más allá del adaptador LoRA estándar.

## Capacidades

- Razonamiento de sentido común: el adaptador está especializado en tareas que requieren conocimiento del mundo y comprensión de situaciones cotidianas, como las incluidas en la suite de evaluación (BoolQ, PIQA, SocialIQA, HellaSwag, WinoGrande, ARC-Easy, ARC-Challenge, OpenBookQA).
- Comprensión lectora y respuesta a preguntas: al estar entrenado sobre Commonsense170K, mejora la capacidad de responder preguntas que implican inferencias de sentido común.
- Compatibilidad con el ecosistema Qwen3: al ser un adaptador LoRA, se puede cargar sobre el modelo base Qwen3-8B mediante PEFT, manteniendo las capacidades generales del modelo base (generación de texto, razonamiento, código, etc.) aunque no se han verificado específicamente en este checkpoint.
- Modo no-thinking: el entrenamiento se realizó en modo no-thinking, por lo que el adaptador está optimizado para respuestas directas sin cadena de razonamiento explícita.
- Uso como checkpoint de investigación: sirve como punto de partida para experimentos de Spectral Surgery, permitiendo estudiar la intervención en pesos del modelo.

## Casos de uso

- Evaluación de razonamiento de sentido común en investigación: el adaptador puede utilizarse en pipelines de evaluación de modelos para medir mejoras en tareas como BoolQ, PIQA o HellaSwag, comparando con el modelo base sin fine-tuning.
- Base para experimentos de interpretabilidad: al ser el checkpoint fuente de Spectral Surgery, es adecuado para investigaciones sobre cómo las intervenciones en el espacio de pesos afectan al comportamiento del modelo en tareas de sentido común.
- Fine-tuning adicional sobre dominios específicos: al ser un adaptador LoRA ligero, puede combinarse con otros adaptadores o continuar su entrenamiento para tareas concretas que requieran sentido común, como asistentes virtuales con conocimiento del mundo.
- Prototipado rápido de aplicaciones de QA: dado su tamaño reducido (0,2 GB), puede integrarse en entornos de desarrollo para probar mejoras en sistemas de pregunta-respuesta sin necesidad de ajustar el modelo completo.
- Benchmarking de técnicas de edición de modelos: sirve como referencia para comparar métodos de edición de pesos (como Spectral Surgery) frente a fine-tuning tradicional en tareas de sentido común.
- Análisis de robustez y sesgos: al estar entrenado en un dataset específico, permite estudiar cómo el fine-tuning afecta a la robustez del modelo en diferentes dominios y detectar posibles sesgos introducidos por el dataset.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación en una suite de ocho tareas de sentido común, utilizando el template de chat del tokenizador en modo no-thinking, decodificación greedy y un máximo de 8 tokens generados:

| Tarea | Resultado |
|---|---|
| Macro Accuracy | 90,7879% |
| Micro Accuracy | 91,8373% |
| Correctos / Total | 20.589 / 22.419 |

No se proporcionan comparaciones con otros modelos o adaptadores en la información disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware dependen del modelo base Qwen3-8B. Para cargar el adaptador sobre el modelo base se necesita la VRAM suficiente para el modelo completo (aproximadamente 16 GB en bf16, o menos con cuantización).
- El adaptador en sí ocupa 0,2 GB, por lo que puede almacenarse y cargarse fácilmente en cualquier sistema con soporte PEFT.
- Para inferencia con el modelo base + adaptador, se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) si se usa precisión completa, o GPUs con menos VRAM si se cuantiza el modelo base.
- Opciones de despliegue: al ser un adaptador PEFT, puede utilizarse con librerías como Hugging Face Transformers, vLLM (si soporta LoRA), o cualquier framework que permita cargar adaptadores LoRA sobre Qwen3-8B.
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para Qwen3-8B entrenados en Commonsense170K u otros datasets de sentido común. La comparativa con otros modelos de la familia Qwen3 (como Qwen3-8B base o Qwen3-8B-Instruct) no es posible sin datos de evaluación adicionales. Se indica "no disponible".

## Limitaciones y advertencias

- El adaptador está entrenado específicamente en Commonsense170K, por lo que su rendimiento en otras tareas fuera de este dominio puede no ser óptimo.
- No se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o redistribución. Se recomienda contactar con el autor antes de utilizarlo en producción.
- No se dispone de información sobre sesgos potenciales del dataset o del modelo base. El dataset Commonsense170K puede contener sesgos culturales o de género que el adaptador podría amplificar.
- El adaptador se presenta como checkpoint de investigación para Spectral Surgery, por lo que no está validado para uso en producción ni se garantiza su robustez en escenarios reales.
- La longitud de contexto de entrenamiento es de 2048 tokens, por lo que el adaptador puede no comportarse bien con contextos más largos, aunque el modelo base soporta más.
- No se han publicado resultados de benchmarks en tareas generales (MMLU, HumanEval, etc.) para este adaptador, por lo que su rendimiento fuera del ámbito de sentido común es desconocido.

## Enlaces

- HuggingFace: https://huggingface.co/tianzl66/Qwen3-8B-CommonSense170K-LoRA
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Colección Qwen3 en HuggingFace: https://huggingface.co/collections/Qwen/qwen3
- Model card de Qwen3-8B-Instruct (PDF de NVIDIA): https://developer.nvidia.com/downloads/assets/ace/model_card/qwen3-8b-instruct.pdf
