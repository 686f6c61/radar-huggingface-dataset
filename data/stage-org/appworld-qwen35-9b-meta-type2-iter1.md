# Stage-org/appworld-qwen35-9b-meta-type2-iter1

## Resumen

El modelo `Stage-org/appworld-qwen35-9b-meta-type2-iter1` es un fine-tuning de 9.409.813.744 parámetros (~9,4B) sobre la arquitectura Qwen3.5-9B, publicado por la organización Stage-org. Su nombre indica que ha sido entrenado específicamente para el benchmark AppWorld, un entorno controlado de aplicaciones y agentes para evaluar function calling y agentes de codificación interactiva, desarrollado por Stony Brook NLP y presentado como Best Resource Paper en ACL 2024. El sufijo "meta-type2" sugiere que se trata de una variante orientada a un tipo concreto de tarea dentro de ese benchmark, probablemente con un enfoque de meta-aprendizaje o adaptación a un subconjunto de escenarios.

El modelo se distribuye en formato safetensors con tensores en BF16, y el repositorio ocupa 94,1 GB, lo que indica que incluye múltiples archivos de pesos o versiones adicionales. Aunque no se proporciona una tarjeta de modelo completa, la base Qwen3.5-9B es un modelo denso con una ventana de contexto nativa de 262.144 tokens, lo que lo hace adecuado para tareas que requieren razonamiento sobre contextos largos, como la interacción con múltiples APIs o la ejecución de agentes multi-paso. Su relevancia actual radica en la creciente demanda de modelos especializados en tool use y automatización de tareas, un área donde los benchmarks como AppWorld son referencia estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativa de Qwen3.5-9B, no confirmada para este fine-tuning) |
| Tipos de cuantizacion | No disponible (pesos en BF16 según el repositorio) |
| Idiomas soportados | No disponible (heredado de Qwen3.5, probablemente multilingüe) |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-9B, una arquitectura transformer densa con atención completa, sin mezcla de expertos. Qwen3.5 integra avances en eficiencia arquitectónica y aprendizaje por refuerzo a escala, aunque los detalles específicos de esta versión no se han publicado en la información disponible. El fine-tuning se ha realizado sobre el benchmark AppWorld, que simula un mundo de aplicaciones (como gestores de correo, calendarios, bancos) y personas, diseñado para evaluar la capacidad de los agentes para realizar llamadas a funciones y ejecutar código interactivo. El sufijo "meta-type2" sugiere que el entrenamiento se ha orientado a un tipo concreto de tarea dentro de ese benchmark, posiblemente mediante meta-aprendizaje o adaptación iterativa (el nombre incluye "iter1", indicando una primera iteración de entrenamiento).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Dado que el modelo es una variante fine-tuned, es probable que se haya utilizado un conjunto de datos generado a partir del entorno AppWorld, con ejemplos de interacciones agente-entorno y llamadas a funciones.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades de Qwen3.5-9B, incluyendo comprensión de lenguaje natural, razonamiento lógico y generación de texto coherente.
- Function calling: entrenado específicamente para invocar funciones y APIs de forma estructurada, siguiendo el formato de AppWorld.
- Agentes interactivos: capaz de ejecutar secuencias de acciones multi-paso en entornos simulados, como enviar correos, gestionar calendarios o realizar transacciones.
- Codificación: al estar basado en Qwen3.5, mantiene habilidades de generación y comprensión de código, útiles para agentes que escriben scripts.
- Contexto largo: con 262.144 tokens de ventana nativa, puede manejar historiales de conversación extensos o documentos largos durante la ejecución de tareas.
- Multilingüismo: probablemente soporta múltiples idiomas, aunque no se ha confirmado para esta variante específica.

## Casos de uso

- Automatización de tareas empresariales: el modelo puede gestionar flujos de trabajo que implican múltiples aplicaciones (correo, calendario, CRM) mediante llamadas a funciones, reduciendo la intervención manual en procesos como la programación de reuniones o la gestión de incidencias.
- Desarrollo de asistentes virtuales con tool use: integrable en chatbots que necesitan consultar bases de datos, APIs externas o ejecutar acciones en nombre del usuario, gracias a su capacidad de function calling entrenada en AppWorld.
- Evaluación de agentes en entornos simulados: investigadores pueden usar este modelo como referencia para comparar el rendimiento de sus propios agentes en el benchmark AppWorld, ya que está específicamente optimizado para ese entorno.
- Generación de código para integraciones: puede escribir y ejecutar código Python o JavaScript para interactuar con APIs, útil en pipelines de automatización o en entornos de desarrollo low-code.
- Razonamiento multi-paso en tareas complejas: su ventana de contexto larga permite mantener el estado de una conversación o tarea durante decenas de miles de tokens, adecuado para agentes que necesitan recordar pasos intermedios.
- Investigación en meta-aprendizaje: la variante "meta-type2" puede servir como caso de estudio para entender cómo el fine-tuning orientado a un tipo de tarea afecta al rendimiento general del agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye una tarjeta de modelo con métricas de MMLU, HumanEval, GSM8K u otros estándares. Dado que es un fine-tuning específico para AppWorld, sería esperable que se hubieran reportado resultados en ese benchmark, pero no se han encontrado en la documentación accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parámetros en BF16, se necesitan aproximadamente 19 GB de VRAM para cargar los pesos completos. Con cuantización a 4 bits (no disponible en el repositorio, pero posible con herramientas externas), la VRAM se reduciría a unos 5-6 GB.
- GPU recomendadas: para inferencia en BF16, una GPU con 24 GB de VRAM (como RTX 3090, RTX 4090, A5000) es suficiente. Para despliegue en producción con alta concurrencia, se recomienda A100 (40 GB) o H100 (80 GB).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo de gama alta (RTX 3090/4090) en BF16, y en GPUs de gama media (RTX 3060 12GB) si se cuantiza a 4 bits.
- Opciones de despliegue: al ser un modelo safetensors estándar, puede desplegarse con vLLM, TGI, llama.cpp (tras conversión a GGUF) u Ollama. No se ha confirmado soporte nativo en estos frameworks, pero es probable.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 9B en una RTX 4090 suele generar entre 30 y 60 tokens por segundo en BF16, dependiendo de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stage-org/appworld-qwen35-9b-meta-type2-iter1 | 9,4B | 262k (nativo) | No disponible | HuggingFace |
| Qwen3.5-9B (base) | 9,4B | 262k | Apache 2.0 (según Qwen) | HuggingFace, LM Studio |
| Stage-org/appworld-qwen35-9b-meta-type6-iter1 | 9,4B | 262k (presumible) | No disponible | HuggingFace |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. La principal diferencia entre las variantes de Stage-org es el tipo de tarea de AppWorld para el que fueron fine-tuned (type2, type6, type9), lo que afecta a su especialización pero no a su arquitectura.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia de uso, lo que impide determinar si es apto para uso comercial o requiere permiso explícito. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Sesgos y alucinaciones: al ser un fine-tuning de Qwen3.5, puede heredar sesgos presentes en el modelo base. Además, al estar entrenado en un entorno simulado, podría generar respuestas incorrectas cuando se enfrente a situaciones fuera del dominio de AppWorld.
- Riesgo de sobreajuste al benchmark: el modelo está optimizado para AppWorld, por lo que su rendimiento en tareas generales de function calling o agentes podría ser inferior al de modelos de propósito general.
- Contexto largo no confirmado: aunque la base Qwen3.5-9B soporta 262k tokens, no se ha verificado que este fine-tuning mantenga esa capacidad sin degradación.
- Idiomas no especificados: no se ha documentado qué idiomas soporta de forma fiable, lo que limita su uso en aplicaciones multilingües sin pruebas previas.
- Tamaño del repositorio: 94,1 GB para 9,4B parámetros sugiere que hay archivos redundantes o versiones adicionales; esto puede complicar la descarga y el despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Stage-org/appworld-qwen35-9b-meta-type2-iter1
- Benchmark AppWorld (GitHub): https://github.com/stonybrooknlp/appworld
- Página de Qwen3.5-9B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
- Variante type6 del mismo autor: https://huggingface.co/Stage-org/appworld-qwen35-9b-meta-type6-iter1
