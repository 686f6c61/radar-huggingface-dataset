# XHToken/Spark-X2.5-1.7B-Base

## Resumen

Spark-X2.5-1.7B-Base es un modelo de lenguaje compacto de 1.700 millones de parámetros desarrollado por el equipo SparkLLM de XHToken. Forma parte de la serie Spark-X2.5, que incluye también una variante de 4B, y está diseñado para ofrecer un rendimiento sólido en tareas cotidianas como conversación, escritura, traducción, razonamiento, generación de código, uso de herramientas y flujos de trabajo agénticos. Se trata de un modelo pre-entrenado (base), no alineado para instrucciones, que se distribuye bajo licencia Apache 2.0.

La arquitectura combina una capa de atención completa con tres capas de atención de ventana deslizante, lo que reduce el coste computacional asociado a contextos largos y permite soportar de forma nativa ventanas de contexto de hasta 1 millón de tokens. El modelo fue entrenado en clústeres Huawei Ascend y utiliza técnicas de post-entrenamiento y aprendizaje por refuerzo a gran escala, como MOPD, para mejorar sus capacidades de razonamiento y seguimiento de instrucciones.

Su relevancia actual radica en que ofrece un equilibrio entre rendimiento, eficiencia de inferencia y tamaño de caché KV, lo que lo hace adecuado para despliegues en dispositivos locales y en entornos de producción con recursos limitados, manteniendo a la vez capacidades avanzadas para agentes y código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención de ventana deslizante (SWA) y atención completa |
| Parámetros totales | 1.707.657.216 |
| Parámetros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Inglés y chino (según metadata); el autor declara soporte para más de 200 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

Nota: el repositorio tiene un tamaño de 3,4 GB.

## Arquitectura y entrenamiento

Spark-X2.5-1.7B-Base emplea una arquitectura híbrida de atención que alterna una capa de atención completa por cada tres capas de atención de ventana deslizante. Este diseño reduce la complejidad computacional de los modelos de contexto largo y limita el crecimiento de la caché KV, manteniendo la capacidad de capturar dependencias globales a través de la atención completa.

El entrenamiento se realizó en clústeres Huawei Ascend. Tras el pre-entrenamiento, se aplicaron técnicas de post-entrenamiento y aprendizaje por refuerzo a gran escala, incluida la técnica MOPD, para potenciar el razonamiento, la generación de código, las capacidades agénticas y el seguimiento de instrucciones. No se han proporcionado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto para conversación, escritura y traducción.
- Razonamiento general y resolución de problemas.
- Generación de código, con integración en entornos de desarrollo como Codex, Claude Code, OpenClaw y Hermes.
- Uso de herramientas (tool calling) y ejecución de flujos de trabajo agénticos multi-paso.
- Comprensión de contexto muy largo: hasta 1 millón de tokens de forma nativa.
- Soporte multilingüe: el autor declara más de 200 idiomas, aunque la metadata oficial solo lista inglés y chino.
- Compatibilidad con frameworks de inferencia como vLLM, SGLang, llama.cpp, Ollama y LM Studio.
- Posibilidad de fine-tuning mediante LLaMA-Factory.

## Casos de uso

- Agentes autónomos en entornos de desarrollo: el modelo puede integrarse en agentes como Codex o Claude Code para automatizar tareas de programación, revisión de código y refactorización, aprovechando su soporte de tool calling y razonamiento multi-paso.
- Asistentes de atención al cliente con contexto largo: gracias a su ventana de 1M tokens, puede gestionar conversaciones extensas y mantener el historial completo de interacciones sin perder información relevante, lo que resulta útil en sistemas de soporte técnico.
- Traducción automática multilingüe: su soporte declarado para más de 200 idiomas permite construir servicios de traducción en tiempo real para documentos, chats y contenido web, con buena calidad en pares inglés-chino.
- Generación de documentación técnica a partir de repositorios grandes: al procesar contextos extensos, puede leer un proyecto completo y generar documentación, comentarios o resúmenes de código de forma coherente.
- Despliegue en dispositivos locales (on-device): al ser un modelo de 1.7B parámetros, es viable ejecutarlo en portátiles o estaciones de trabajo con GPU de consumo mediante Ollama o llama.cpp, ofreciendo capacidades de IA sin dependencia de la nube.
- Fine-tuning para dominios específicos: con LLaMA-Factory se puede adaptar el modelo base a tareas concretas de una organización, como clasificación de documentos, análisis de sentimiento o asistentes internos, partiendo de un pre-entrenamiento eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, los pesos ocupan aproximadamente 3,4 GB, por lo que se recomienda un mínimo de 6-8 GB de VRAM para inferencia con caché KV y overhead. Con cuantización de 4 bits, la VRAM necesaria podría reducirse a unos 1-2 GB, aunque no se han publicado valores oficiales de cuantización.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4070, RTX 4090 o superiores para uso en local. Para despliegue en servidor, GPUs como A100 o H100 son adecuadas, aunque no son estrictamente necesarias dado el tamaño del modelo.
- El modelo puede ejecutarse en GPU de consumo, siempre que se utilice cuantización o se disponga de suficiente VRAM.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, Ollama y LM Studio.
- Latencia y throughput: no disponible.

Nota: los requisitos de VRAM son estimaciones orientativas basadas en el tamaño de los pesos, no en mediciones publicadas.

## Comparativa con modelos similares

A continuación se comparan modelos de tamaño similar en cuanto a parámetros, contexto y licencia. Los datos de rendimiento de Spark-X2.5-1.7B-Base no están disponibles en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Spark-X2.5-1.7B-Base | 1.707.657.216 | 1M tokens | Apache 2.0 | HuggingFace, ModelScope |
| Qwen2.5-1.5B-Instruct | 1.540.000.000 | 32K tokens | Apache 2.0 | HuggingFace |
| Llama-3.2-1B-Instruct | 1.230.000.000 | 128K tokens | Llama 3.2 Community | HuggingFace |
| Gemma-2-2B | 2.610.000.000 | 8K tokens | Gemma Terms of Use | HuggingFace |

No se dispone de comparativas de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base pre-entrenado, no un modelo instruct. Para usarlo en tareas de conversación o seguimiento de instrucciones, es necesario realizar fine-tuning o aplicar técnicas de alineación.
- La metadata oficial solo lista inglés y chino como idiomas soportados, a pesar de que el autor declara más de 200 idiomas. Esta discrepancia debe tenerse en cuenta al evaluar el rendimiento multilingüe real.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que el rendimiento real en tareas específicas no está verificado externamente.
- Existe riesgo de alucinación, especialmente en tareas de razonamiento complejo o generación de código, como en cualquier modelo de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero no incluye garantías de seguridad ni de rendimiento. Los usuarios son responsables de validar el comportamiento del modelo en su caso de uso.
- La información sobre cuantizaciones no está disponible, lo que limita la capacidad de planificar despliegues con requisitos de memoria ajustados.

## Enlaces

- HuggingFace: https://huggingface.co/XHToken/Spark-X2.5-1.7B-Base
- GitHub: https://github.com/XHToken/Spark-X2.5
- ModelScope: https://www.modelscope.cn/models/XHToken/Spark-X2.5-1.7B-Base
- Llama-Factory: https://github.com/XHToken/LlamaFactory
