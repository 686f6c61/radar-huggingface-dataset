# Virtudant-AI/Ministral-3-3B-Instruct-2512

## Resumen

Ministral 3 3B Instruct 2512 es un modelo de lenguaje y visión de pequeno tamano (3.849.090.048 parámetros totales según safetensors) desarrollado por Mistral AI y redistribuido en este repositorio por el usuario Virtudant-AI. Forma parte de la familia Ministral 3, disenada específicamente para despliegue en el borde (edge) y en hardware de bajos recursos, incluyendo GPUs de consumo. Combina un modelo de lenguaje de aproximadamente 3,4B parámetros con un codificador visual de aproximadamente 0,4B parámetros, lo que le permite procesar tanto texto como imágenes.

El modelo resuelve el problema de llevar capacidades avanzadas (visión, agentes, multilingüismo y contexto largo) a entornos con restricciones de memoria y cómputo, como dispositivos embebidos, portátiles o instancias modestas en la nube. Su ventana de contexto de 256k tokens es notable para su tamano y lo habilita para tareas de extracción de datos, clasificación y generación de contenido corto con contexto extenso.

Es relevante ahora porque la licencia Apache 2.0 permite uso comercial y modificación sin restricciones, y porque su soporte nativo de function calling y salida JSON lo hace apto para pipelines agénticos ligeros. Este repositorio concreto es un espejo del modelo oficial de Mistral AI, con etiquetas que indican compatibilidad con vLLM y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + codificador visual), familia Mistral 3 |
| Parametros totales | 3.849.090.048 (aproximadamente 3,4B de lenguaje + 0,4B de visión) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | FP8 (formato oficial), BF16 (variantes base y reasoning), GGUF y 4-bit disponibles en la colección de Unsloth |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar (y "docenas" según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 7,7 GB); GGUF y FP8 disponibles en otros repositorios |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal compuesto por dos bloques: un modelo de lenguaje de aproximadamente 3,4B parámetros y un codificador visual de aproximadamente 0,4B parámetros. El modelo base es `mistralai/Ministral-3-3B-Instruct-2512`, entrenado por Mistral AI; este repositorio es una redistribución. La model card no detalla el número exacto de tokens de entrenamiento ni la composición del dataset, por lo que esos datos no están disponibles.

El modelo ha pasado por un post-entrenamiento de tipo instruct (no se especifica si con RLHF, DPO u otra técnica). Destaca su optimización para el borde: la model card indica que cabe en 8 GB de VRAM en FP8 y menos con cuantización adicional. Soporta system prompts con alta adherencia, function calling nativo y salida en JSON, lo que sugiere un entrenamiento orientado a tareas agénticas. No se mencionan innovaciones como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto y razonamiento general en múltiples idiomas.
- Visión: análisis de imágenes y generación de respuestas basadas en contenido visual (image captioning, VQA).
- Multilingüismo: soporte de inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe, entre otros.
- Function calling nativo y salida estructurada en JSON.
- Capacidades agénticas: razonamiento multi-paso y uso de herramientas.
- Alta adherencia a system prompts.
- Contexto largo de 256k tokens para procesar documentos extensos.
- Apto para fine-tuning y especialización (se mencionan notebooks de Unsloth para fine-tuning y RL con GSPO).

## Casos de uso

- **Atención al cliente automatizada en el borde**: el modelo puede gestionar conversaciones multi-turno con hasta 256k tokens de contexto, lo que permite incluir historiales largos o documentación de producto sin truncar, y desplegarse en servidores modestos.
- **Image captioning y accesibilidad**: con su codificador visual de 0,4B, puede generar descripciones de imágenes en tiempo real para aplicaciones de accesibilidad o catalogación automática de contenido.
- **Extracción de datos de documentos**: el contexto de 256k tokens y la salida JSON permiten procesar contratos, facturas o informes extensos y devolver campos estructurados de forma fiable.
- **Traducción eficiente en tiempo real**: el soporte de once idiomas y su tamano reducido lo hacen adecuado para traducción en dispositivos con latencia baja, como apps móviles o sistemas embebidos.
- **Clasificación de texto a escala**: su bajo coste de inferencia permite clasificar grandes volúmenes de tickets, correos o reseñas con etiquetas personalizadas mediante prompts de sistema.
- **Agentes ligeros con tool calling**: integrado en pipelines agénticos que requieren llamadas a funciones y salida JSON, puede orquestar tareas como consultas a APIs o actualizaciones de bases de datos en entornos con recursos limitados.
- **Generación de contenido corto**: redacción de respuestas, resúmenes o mensajes en aplicaciones de mensajería donde se necesita baja latencia y despliegue local.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks de razonamiento para la familia Ministral 3, pero solo muestra resultados completos para el modelo de 14B. Los datos para el modelo de 3B no están disponibles en la información proporcionada.

| Modelo | AIME25 | AIME24 | GPQA Diamond | LiveCodeBench |
|---|---|---|---|---|
| Ministral 3 14B | 0,850 | 0,898 | 0,712 | 0,646 |
| Qwen3-14B (Thinking) | 0,737 | 0,837 | 0,663 | 0,593 |
| Ministral 3 3B | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks del modelo de 3B en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 8 GB en FP8 según la model card; menos de 6 GB en cuantización de 4 bits; en BF16 serían necesarios alrededor de 7,7 GB solo para pesos, más overhead de activaciones.
- **GPU recomendadas**: RTX 4090, RTX 4080, RTX 3090, A100, H100; también GPUs de gama media como RTX 4060 Ti de 16 GB o incluso 8 GB en FP8.
- **Cabe en GPU de consumo**: sí, en tarjetas con 8 GB o más en FP8, y en 6 GB o más con cuantización 4-bit.
- **Opciones de despliegue**: vLLM (etiqueta de la librería), llama.cpp, Ollama, TGI, entre otros; los GGUF de Unsloth facilitan el despliegue en CPU y GPU de consumo.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 3B Instruct 2512 | 3,85B | 256k | Sí | Apache 2.0 | Hugging Face |
| Ministral 3 8B Instruct 2512 | no disponible | 256k (según familia) | Sí | Apache 2.0 | Hugging Face |
| Qwen3-14B (Thinking) | 14B | no disponible | no disponible | no disponible | Hugging Face |

La comparación con Qwen3-14B solo es posible a nivel de benchmarks del modelo de 14B de la familia, no del 3B. No se dispone de datos de rendimiento del 3B frente a alternativas de su tamano en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan sesgos específicos en la información disponible; como todo modelo entrenado con datos web, es probable que herede sesgos de esos datos.
- **Riesgo de alucinación**: presente, especialmente en tareas de extracción de datos o generación factual; se recomienda validación en producción.
- **Limitaciones de contexto o idioma**: aunque soporta 256k tokens, el rendimiento puede degradarse en contextos muy largos; el soporte de idiomas es amplio pero no se garantiza calidad uniforme en todos.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial y modificación sin restricciones, pero se debe conservar el aviso de licencia.
- **Caveats para producción**: este repositorio es una redistribución de un tercero (Virtudant-AI) con 0 descargas y 0 likes; se recomienda usar el repositorio oficial de Mistral AI para garantizar integridad y soporte. La model card indica `inference: false`, lo que puede requerir configuración adicional para servir el modelo.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Virtudant-AI/Ministral-3-3B-Instruct-2512
- Modelo base oficial: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Colección Ministral 3 de Unsloth: https://huggingface.co/collections/unsloth/ministral-3
- Guía de Unsloth para Ministral 3: https://docs.unsloth.ai/new/ministral-3
- Benchmarks de cuantización GGUF de Unsloth: https://docs.unsloth.ai/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Notebook de fine-tuning: https://docs.unsloth.ai/new/ministral-3#fine-tuning
- Notebook de RL con GSPO: https://docs.unsloth.ai/new/ministral-3#reinforcement-learning-grpo
- Notebooks de Unsloth: https://docs.unsloth.ai/get-started/unsloth-notebooks
- Colección de formatos adicionales de Mistral: https://huggingface.co/collections/mistralai/ministral-3-more
