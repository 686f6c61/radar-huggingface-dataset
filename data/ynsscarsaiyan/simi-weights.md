# YNSScarSaiyan/simi-weights

## Resumen

SImi-2B es un modelo de lenguaje causal de estilo Llama, creado por Dakuwon Moody (YNSScarSaiyan) y publicado como espejo de pesos públicos (weights-only) en Hugging Face. El modelo fue entrenado en JAX/Flax sobre una GPU AMD Instinct MI300X y destaca por su enfoque en tareas de agente y uso de herramientas, ya que su mezcla de entrenamiento incluye streams como Orca AgentInstruct, Agent-FLAN, xLAM, ToolACE, Glaive y Hermes function calling. Con aproximadamente 2.321.856.000 parámetros (2,32B) y una arquitectura decoder-only con RMSNorm, RoPE, GQA y SwiGLU, el modelo ofrece una ventana de contexto de 1.024 tokens y utiliza el tokenizer GPT-2 (50.257 tokens).

La relevancia de este modelo radica en que es un ejemplo de entrenamiento de un modelo de lenguaje en hardware AMD con JAX/Flax, y en que su publicación es exclusivamente de pesos, sin código fuente de arquitectura ni de entrenamiento. Esto lo convierte en un recurso interesante para investigación y experimentación, pero también impone limitaciones importantes: no es un checkpoint de Transformers, no se puede cargar con AutoModel.from_pretrained y no soporta inferencia alojada. El repositorio contiene varios checkpoints intermedios (desde step_99000 hasta step_180000) en formato Orbax, con un tamaño total de 159,5 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder-only: RMSNorm pre-norm, RoPE, GQA, SwiGLU, embeddings de token y LM head no compartidos |
| Parametros totales | ~2.321.856.000 (estimados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (máximo de secuencia) |
| Tipos de cuantizacion | bfloat16 (dtype de entrenamiento); no se publican otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Orbax (JAX/Flax); no es un checkpoint de Transformers |

## Arquitectura y entrenamiento

SImi-2B es un modelo decoder-only de estilo Llama con pre-normalización RMSNorm, rotación posicional RoPE (theta 10.000), atención con consultas agrupadas (GQA) con 20 cabezas de consulta y 4 cabezas de clave/valor, y activación SwiGLU con un tamaño intermedio de 6.912. La capa de embedding de tokens y la cabeza LM no comparten pesos. El modelo se entrena con un objetivo de causal LM y empaquetado de secuencias de 1.024 tokens.

El entrenamiento se realizó en JAX/Flax sobre una AMD Instinct MI300X, con precisión bfloat16, sin rematerialización (remat off), micro-batch 3 y secuencia de 1.024 tokens. El optimizador del run en vivo es Adafactor, aunque el checkpoint del paso 99.000 es un snapshot más antiguo con Adam. Los datos de entrenamiento proceden de streams de Hugging Face orientados a agentes: instrucciones de Tulu-3, OpenHermes-2.5 y UltraChat, y datos de agente/herramienta de Orca AgentInstruct, Agent-FLAN, xLAM, ToolACE, Glaive y Hermes function calling. No se menciona explícitamente el uso de RLHF o DPO.

## Capacidades

- Generación de texto causal en inglés mediante next-token prediction empaquetado.
- Entrenamiento orientado a tareas de agente y tool use, según la mezcla de datos (AgentInstruct, Agent-FLAN, xLAM, ToolACE, Glaive, Hermes function calling).
- Arquitectura compatible con GQA y SwiGLU, lo que puede resultar eficiente en inferencia, aunque no se aportan datos de rendimiento.
- Tokenizer GPT-2 con vocabulario de 50.257 tokens y BOS/EOS/PAD en el token 50256.
- No soporta visión, audio u otras modalidades; es un modelo puramente textual.
- No es un checkpoint de Transformers: requiere un stack JAX/Flax/Orbax específico para cargar los pesos.
- No soporta inferencia alojada (hosted inference) en Hugging Face.

## Casos de uso

- Investigación sobre entrenamiento en JAX/Flax con hardware AMD: los pesos pueden utilizarse para estudiar el comportamiento de Adafactor frente a Adam en un modelo Llama-style de 2,3B, gracias a los checkpoints de distintos pasos de entrenamiento.
- Prototipado de agentes con tool use: la mezcla de datos incluye streams de agentes y funciones, por lo que el modelo podría servir como base para experimentar con llamadas a funciones, siempre que se implemente un cargador compatible con Orbax.
- Fine-tuning en JAX/Flax: los pesos pueden ser un punto de partida para continuar el entrenamiento con un dataset propio, aprovechando la arquitectura Llama-style y el empaquetado de secuencias.
- Benchmarking de arquitectura: para comparar el efecto de GQA, SwiGLU y RoPE en un modelo de 2,3B con tokenizer GPT-2, frente a otras implementaciones.
- Evaluación de rendimiento en hardware AMD: al haber sido entrenado en MI300X, el modelo puede usarse para medir throughput y consumo en GPUs AMD, aunque no se proporcionan cifras.
- Educación sobre formatos de pesos: sirve como ejemplo práctico de un repositorio de pesos en Orbax, no compatible con Transformers, para enseñar las diferencias entre formatos de checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no proporciona requisitos de memoria para inferencia.
- GPU recomendadas: no disponible. El entrenamiento se realizó en una AMD Instinct MI300X, pero no se indican GPUs específicas para inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no aplica con herramientas estándar (vLLM, llama.cpp, Ollama, TGI). El modelo no es un checkpoint de Transformers y no soporta inferencia alojada; requiere un stack JAX/Flax/Orbax personalizado.
- Latencia y throughput: no disponible.
- Tamaño del repositorio: 159,5 GB, que incluye múltiples checkpoints en formato Orbax.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un checkpoint de Transformers: AutoModel.from_pretrained no lo cargará. Es necesario un stack JAX/Flax/Orbax específico y procedimientos de restauración no estándar.
- Solo pesos, sin código fuente: no se incluye la arquitectura de entrenamiento ni el código, lo que impide reproducir el entrenamiento sin reconstruirlo manualmente.
- Los checkpoints posteriores al paso 99.000 pueden fallar al restaurar con Orbax StandardRestore (errores de Layout/TensorStore). Se recomienda un restore numpy con forma de metadatos.
- Contexto limitado a 1.024 tokens, lo que restringe aplicaciones que requieran conversaciones largas o documentos extensos.
- Solo en inglés: no se han publicado capacidades multilingües.
- No soporta inferencia alojada en Hugging Face.
- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad, por lo que se desconoce su comportamiento en estos aspectos.
- Licencia Apache-2.0 permite uso comercial, pero al ser un repositorio de pesos sin código, hay que asegurarse de cumplir con la atribución y las condiciones de la licencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/YNSScarSaiyan/simi-weights
- Modelo base: https://huggingface.co/YNSScarSaiyan/simi
- Perfil del autor: https://huggingface.co/YNSScarSaiyan
