# unalivehooman/Qwen2.5-1.5B-Indo-Text2SQL

## Resumen

Qwen2.5-1.5B-Indo-Text2SQL es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-1.5B-Instruct, publicado por el usuario unalivehooman en HuggingFace. El nombre sugiere una especialización en la tarea de text-to-SQL para indonesio, aunque la model card no documenta explícitamente ni el conjunto de datos de entrenamiento ni el idioma objetivo, y los metadatos declaran únicamente inglés como idioma soportado. Se trata, por tanto, de un modelo derivado de bajo perfil, sin métricas publicadas ni documentación técnica detallada.

El modelo base, Qwen2.5-Coder-1.5B-Instruct, es un transformer decoder-only de 1.500 millones de parámetros desarrollado por Alibaba Qwen, orientado a generación de código y con una ventana de contexto de 32.768 tokens. Este ajuste se realizó con Unsloth y TRL sobre la versión cuantizada en 4 bits del modelo base (bnb-4bit), lo que implica que los pesos resultantes heredan las limitaciones de esa cuantización de partida.

Su relevancia es limitada: cero descargas, cero likes y una model card mínima. Resulta útil únicamente como ejemplo de pipeline de fine-tuning ligero con Unsloth para tareas de generación de SQL, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.500 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5 soporta 32.768 tokens) |
| Tipos de cuantizacion | pesos derivados de un modelo base cuantizado en 4 bits (bnb-4bit); el repositorio contiene safetensors |
| Idiomas soportados | en (según metadatos); el nombre sugiere indonesio pero no está documentado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen2: un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base Qwen2.5-Coder-1.5B-Instruct fue preentrenado por Alibaba Qwen sobre grandes volúmenes de código y texto, y posteriormente ajustado con instrucciones. No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset original en la información proporcionada.

El ajuste fino de este repositorio se realizó con Unsloth y TRL, partiendo de la variante del modelo base cuantizada en 4 bits (unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit). La model card no especifica el dataset utilizado, el número de pasos, la técnica de alineación (SFT, DPO, RLHF) ni hiperparámetros. El único detalle técnico documentado es que el entrenamiento fue "2x más rápido" gracias a Unsloth. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y código, heredadas del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Generación de consultas SQL a partir de lenguaje natural (text-to-SQL), según sugiere el nombre del modelo; no verificable con datos publicados.
- Seguimiento de instrucciones en formato chat, al derivar de una variante Instruct.
- Capacidad multilingüe limitada: los metadatos declaran solo inglés; el posible soporte de indonesio no está documentado.
- Soporte de tool calling y function calling: no disponible en la documentación del ajuste.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado de text-to-SQL en entornos de investigación: el modelo puede generar consultas SQL a partir de preguntas en lenguaje natural para validar pipelines de evaluación, aunque requiere verificación manual dada la ausencia de benchmarks.
- Generación asistida de consultas en herramientas internas de BI: útil para experimentar con la conversión de preguntas de negocio a SQL en un entorno controlado y con revisión humana.
- Fine-tuning adicional sobre esquemas propios: al ser un modelo pequeño (1,5B) y con licencia Apache 2.0, sirve como punto de partida para ajustes específicos sobre el esquema de una base de datos concreta usando Unsloth.
- Docencia y experimentación con pipelines de fine-tuning: ejemplifica el flujo Unsloth + TRL sobre un modelo cuantizado en 4 bits, útil para formar a desarrolladores en ajuste eficiente.
- Despliegue en hardware modesto para pruebas: sus 1,5B parámetros permiten ejecutarlo en GPUs de consumo para validar ideas antes de escalar a modelos mayores.
- Generación de código auxiliar en editores: puede completar fragmentos de código y SQL en entornos de desarrollo con recursos limitados, siempre con revisión del desarrollador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en FP16 para 1,5B parámetros; alrededor de 1-2 GB en cuantización de 4 bits (estimación general para modelos de este tamaño, no verificada para este ajuste).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues mayores.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4070 o superiores.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta presente), llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repositorio), vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-Indo-Text2SQL | 1,5B | no disponible | apache-2.0 | HuggingFace, 0 descargas |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,5B | 32.768 tokens | apache-2.0 | HuggingFace, ampliamente usado |
| Qwen2.5-Coder-7B-Instruct | 7B | 32.768 tokens | apache-2.0 | HuggingFace, ampliamente usado |
| CodeLlama-7B-Instruct | 7B | 16.384 tokens | Llama 2 custom | HuggingFace |

No se dispone de datos de rendimiento del ajuste que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentación del dataset de entrenamiento: imposible evaluar su calidad o fiabilidad.
- El modelo base está cuantizado en 4 bits, lo que puede degradar la precisión respecto al modelo original en FP16.
- El nombre sugiere soporte de indonesio, pero los metadatos solo declaran inglés; el soporte real de indonesio no está verificado.
- Riesgo elevado de alucinación y de generar SQL sintácticamente válido pero semánticamente incorrecto, especialmente sin evaluación publicada.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No recomendado para producción sin una evaluación exhaustiva previa sobre el esquema de base de datos objetivo.
- Posibles sesgos heredados del corpus de preentrenamiento de Qwen2.5, no documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unalivehooman/Qwen2.5-1.5B-Indo-Text2SQL
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
