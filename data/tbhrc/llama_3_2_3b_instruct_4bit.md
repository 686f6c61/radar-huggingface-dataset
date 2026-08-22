# tbhrc/llama_3_2_3b_instruct_4bit

## Resumen

Este repositorio contiene una versión cuantizada a 4 bits del modelo Llama 3.2 3B Instruct de Meta, preparada por el usuario tbhrc. El modelo base es la conversión MLX publicada por mlx-community, que a su vez se origina en los pesos oficiales de Meta. La cuantización a 4 bits reduce el tamaño de los pesos a aproximadamente 1.8 GB, lo que permite ejecutar el modelo en dispositivos con memoria limitada, como portátiles, tarjetas gráficas de consumo o incluso CPU mediante frameworks de inferencia optimizados.

El modelo conserva la arquitectura Transformer decoder-only de Llama 3.2, con 3.4 mil millones de parámetros en su versión original (el número de parámetros según los safetensors de este repositorio es de 502.139.904, aunque es probable que se trate de un dato incorrecto o parcial; el modelo base declara 3.4B parámetros). Está optimizado para tareas de diálogo y generación de texto en múltiples idiomas, incluyendo español, inglés, francés, alemán, italiano, portugués, hindi y tailandés. Su tamaño compacto y la cuantización lo hacen especialmente relevante para aplicaciones de producción que requieren inferencia local con latencia baja y presupuesto de hardware limitado.

La licencia es la Llama 3.2 Community License, que permite uso comercial con ciertas restricciones (si el producto supera los 700 millones de usuarios mensuales se requiere una licencia adicional de Meta). Este repositorio no ha recibido descargas ni me gusta, por lo que se trata de un artefacto comunitario sin validación masiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 502.139.904 (según safetensors) / 3.4B (modelo original) |
| Parametros activos | no disponible |
| Longitud de contexto | 128.000 tokens (según especificación de Llama 3.2) |
| Tipos de cuantizacion | 4-bit (método no especificado, probablemente bitsandbytes) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es Llama 3.2 3B Instruct, un transformer decoder-only de 3.4 mil millones de parámetros entrenado por Meta con un pipeline de preentrenamiento y ajuste fino supervisado (SFT) seguido de optimización por preferencias humanas (RLHF). La versión aquí publicada no ha sido reentrenada; se trata de una conversión de los pesos oficiales al formato MLX y posterior cuantización a 4 bits mediante el usuario tbhrc. El proceso de cuantización reduce la precisión de los pesos para disminuir el uso de memoria y acelerar la inferencia, a costa de una pequeña degradación en la calidad de las respuestas.

El modelo original soporta una longitud de contexto de 128.000 tokens, pero la cuantización no modifica esta capacidad, aunque en la práctica el rendimiento con contextos muy largos puede verse afectado por la pérdida de precisión. No se han publicado detalles sobre el dataset de entrenamiento específico de esta versión, ya que hereda el del modelo base.

## Capacidades

- Generación de texto y completado de conversaciones: el modelo está optimizado para seguir instrucciones y mantener diálogos multiturno.
- Razonamiento básico: puede resolver tareas de lógica simple, matemáticas elementales y razonamiento común.
- Soporte multilingüe: cubre 8 idiomas principales, con buena cobertura en inglés y español, aunque la calidad en idiomas menos representados puede ser inferior.
- Capacidad de seguir instrucciones: responde a comandos en lenguaje natural para tareas como resumen, extracción de información, reescritura, etc.
- No se han confirmado capacidades de tool calling ni function calling en la información disponible; el modelo base de Llama 3.2 Instruct sí las soporta, pero no hay garantía de que esta versión cuantizada las mantenga.
- No incluye capacidades de visión, audio ni generación multimodal.

## Casos de uso

- Atención al cliente automatizada: gracias a su tamaño reducido y cuantización, puede desplegarse en servidores de bajo coste para gestionar conversaciones de soporte en varios idiomas, con respuestas coherentes y en tiempo real.
- Generación de contenido en dispositivos edge: ideal para aplicaciones móviles o de escritorio que requieren generación de texto local sin conexión a internet, como asistentes de escritura, resumen de documentos o sugerencias de respuesta.
- Clasificación y análisis de texto: puede utilizarse para etiquetar correos, categorizar tickets de soporte o extraer entidades de documentos, gracias a su capacidad de seguir instrucciones.
- Traducción automática básica: aunque no es un modelo dedicado, puede traducir entre los idiomas soportados, especialmente para frases cortas y textos técnicos.
- Chatbots de nicho en empresas pequeñas: para empresas que necesitan un asistente conversacional sin costes de API, este modelo permite desplegar un bot local con recursos modestos.
- Prototipado y pruebas de concepto: su bajo coste de inferencia permite experimentar con generación de texto en proyectos antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo cuantizado. El modelo base Llama 3.2 3B Instruct tiene resultados conocidos en MMLU, HumanEval y GSM8K, pero no se dispone de datos concretos en el repositorio. No se recomienda asumir que el rendimiento cuantizado es idéntico al del modelo original; la cuantización a 4 bits suele provocar una pérdida de precisión de entre un 2% y un 5% en tareas estándar.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para inferencia con cuantización de 4 bits (los pesos ocupan ~1.8 GB en disco).
- GPU recomendadas: tarjetas de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores son suficientes. También puede ejecutarse en CPU con frameworks como llama.cpp, aunque la latencia será mayor.
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que cabe en la mayoría de GPU modernas de 4 GB o más.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers y bitsandbytes.
- Latencia y throughput: no se dispone de mediciones específicas, pero en una GPU de gama media (RTX 4060) se espera una generación de 30-50 tokens por segundo en FP16; con cuantización 4-bit la velocidad puede ser ligeramente menor pero el uso de memoria es mucho menor.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables en la información proporcionada. El modelo compite con otras versiones de Llama 3.2 1B y 3B, así como con modelos pequeños de otras familias como Qwen 2.5 3B, Gemma 3 4B o Phi-3.5-mini. Sin embargo, no se han encontrado tablas de comparación en el repositorio. Se recomienda consultar los benchmarks oficiales de Meta para Llama 3.2 y realizar pruebas propias con el modelo cuantizado.

## Limitaciones y advertencias

- Alucinación: como todos los modelos generativos, puede producir información falsa o inventada, especialmente en temas de actualidad o datos específicos.
- Sesgos: el modelo hereda los sesgos del dataset de entrenamiento original, lo que puede manifestarse en respuestas con estereotipos o discriminación.
- Pérdida de precisión por cuantización: la cuantización a 4 bits puede degradar la calidad de las respuestas en tareas complejas, especialmente razonamiento matemático o código.
- Contexto largo: aunque el modelo soporta 128k tokens, en la práctica el rendimiento con contextos muy largos puede degradarse y el uso de memoria aumenta considerablemente.
- Restricciones de licencia: la licencia llama3.2 permite uso comercial, pero requiere incluir "Built with Llama" en el producto final y usar el nombre "Llama" en modelos derivados. Además, si el producto supera los 700 millones de usuarios mensuales, se debe solicitar una licencia adicional a Meta.
- Sin soporte oficial: este repositorio es de un usuario comunitario y no cuenta con mantenimiento ni soporte técnico de Meta.

## Enlaces

- Repositorio de HuggingFace: [tbhrc/llama_3_2_3b_instruct_4bit](https://huggingface.co/tbhrc/llama_3_2_3b_instruct_4bit)
- Modelo oficial de Meta: [meta-llama/Llama-3.2-3B-Instruct](https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct)
- Página de documentación de Meta: [Llama 3.2](https://llama.com/llama-downloads/)
