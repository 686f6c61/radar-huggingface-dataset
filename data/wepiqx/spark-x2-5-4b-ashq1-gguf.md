# wepiqx/Spark-X2.5-4B-ASHQ1-GGUF

## Resumen

Spark-X2.5-4B es un modelo de lenguaje compacto y de propósito general desarrollado por XHToken (SparkLLM), presentado junto a su variante Spark-X2.5-1.7B. El modelo está diseñado para tareas cotidianas como conversación, escritura, traducción, razonamiento, generación de código, uso de herramientas y flujos de trabajo agénticos, con un enfoque en eficiencia y accesibilidad. Su arquitectura emplea atención híbrida con ventanas deslizantes, lo que permite una ventana de contexto nativa de hasta 1 millón de tokens sin incurrir en el coste de memoria de una atención completa en todas las capas.

La cuantización ASHQ1 creada por wepiqx aplica un esquema de cuantización híbrida adaptado específicamente a la arquitectura `spark2_5`, sin necesidad de mapeos especiales de tensores. Sin embargo, el estado actual de esta cuantización es de desarrollo: los archivos de pesos aún no están disponibles públicamente según la model card. El modelo requiere un fork de llama.cpp con soporte para la arquitectura `spark2_5`, aunque existe un pull request abierto para integrar dicho soporte en el repositorio principal de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (1 capa full-attention + 3 capas sliding-window repetidas) |
| Parametros totales | 4.1B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1M tokens (nativa) |
| Tipos de cuantizacion | ASHQ1 (cuantización híbrida, pendiente de publicación) |
| Idiomas soportados | en (declarado en HuggingFace); más de 200 según la documentación oficial |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Spark-X2.5-4B es un decoder denso con 36 bloques, dimensión oculta de 4096 y 32 cabezas de atención con Grouped Query Attention (GQA). Su innovación principal reside en la atención híbrida: alterna una capa de atención completa con tres capas de atención de ventana deslizante (sliding-window attention), lo que reduce el coste de la caché KV en contextos largos. Las proyecciones q, k y v están fusionadas en un único tensor `q_k_v_proj`, similar a la arquitectura Qwen3.5, lo que facilita la aplicación de cuantizaciones por grupos.

El modelo no incorpora MTP (Multi-Token Prediction), ni mezcla de expertos, ni SSM: es un transformer denso convencional. El vocabulario tiene 131072 entradas. Los datos de entrenamiento y el proceso de alineación (RLHF/DPO) no se detallan en la información disponible. La cuantización ASHQ1 utiliza una matriz de importancia (imatrix) con 216 entradas correspondientes a las 36 capas del modelo, cubriendo los tensores `attn_gate`, `attn_qkv`, `attn_output`, `ffn_gate`, `ffn_up` y `ffn_down`.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento (reasoning) en tareas de lógica y matemáticas.
- Generación de código (coding) en múltiples lenguajes.
- Traducción automática.
- Uso de herramientas (tool calling / function calling).
- Flujos de trabajo agénticos (agentic workflows) con razonamiento multi-paso.
- Contexto nativo de hasta 1M tokens, adecuado para RAG y análisis de documentos largos.
- Soporte multilingüe: más de 200 idiomas según la documentación oficial.

## Casos de uso

- Atención al cliente automatizada: gracias a su ventana de contexto de 1M tokens, el modelo puede gestionar conversaciones largas y mantener el historial completo sin perder información relevante, lo que resulta adecuado para sistemas de soporte multi-turno.
- Generación de código en producción: su soporte de tool calling permite integrarlo en pipelines de CI/CD para autocompletar, revisar o generar código en repositorios, con un tamaño que facilita el despliegue en entornos con recursos limitados.
- Análisis de documentos extensos: la ventana de contexto nativa de 1M tokens permite procesar contratos, informes o libros completos sin necesidad de fragmentación, simplificando los flujos de RAG.
- Asistentes agénticos: el modelo puede orquestar múltiples herramientas y ejecutar razonamiento multi-paso para completar tareas complejas, como la planificación y ejecución de acciones encadenadas.
- Traducción profesional: con soporte para más de 200 idiomas, es adecuado para sistemas de traducción automática de alta calidad en entornos multilingües.
- Chatbots de soporte técnico: su tamaño compacto (4.1B) permite desplegarlo en infraestructuras con recursos limitados manteniendo un rendimiento competitivo en tareas de conversación y resolución de incidencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la cuantización ASHQ1 está en proceso de elaboración y no incluye métricas de evaluación (PPL, MMLU, HumanEval, GSM8K, etc.) en el momento de la consulta. La documentación oficial del modelo base menciona resultados líderes entre modelos abiertos de tamaño similar, pero no se proporcionan cifras concretas en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo denso de 4.1B en BF16 requiere aproximadamente 8.2 GB de VRAM. La cuantización ASHQ1, al ser híbrida, reducirá este requisito, pero el valor exacto no se ha publicado.
- GPU recomendadas: no disponible. Por tamaño, modelos similares de 4B suelen ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o RTX 4060 (8 GB) con cuantización, y en A100 o H100 para entornos de producción.
- Compatibilidad con GPU de consumo: probablemente sí con cuantización, aunque no confirmado oficialmente.
- Opciones de despliegue: llama.cpp (requiere fork con soporte `spark2_5`), Ollama (disponible como `SparkLLM/Spark-X2.5-4B`), y potencialmente vLLM o TGI cuando el soporte se integre en el ecosistema principal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.5-4B | 4.1B | 1M tokens | Apache-2.0 | GGUF / BF16 | HuggingFace, ModelScope, Ollama |
| Spark-X2.5-1.7B | 1.7B | 1M tokens | Apache-2.0 | No disponible | HuggingFace, ModelScope |
| Spark-X2.5-4B (ASHQ1) | 4.1B | 1M tokens | Apache-2.0 | GGUF (pendiente) | HuggingFace (wepiqx) |

No se dispone de datos de benchmarks comparativos con modelos de otras familias (Qwen, Llama, etc.) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización ASHQ1 está en proceso: los archivos de pesos aún no están disponibles públicamente según la model card, que indica "Status: file in progress".
- Se requiere un fork de llama.cpp con soporte para la arquitectura `spark2_5`; el llama.cpp estándar no puede ejecutar el modelo actualmente.
- La integración en el repositorio principal de llama.cpp está pendiente (PR #27868), lo que limita la portabilidad inmediata del modelo.
- El modelo base declara únicamente inglés en su model card de HuggingFace, aunque la documentación oficial menciona más de 200 idiomas. Esta discrepancia debe verificarse antes de su uso en producción.
- No hay datos de benchmarks publicados, por lo que no es posible verificar el rendimiento real frente a competidores.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos completos antes de su integración en productos.
- Riesgo de alucinación inherente a todos los modelos de lenguaje; se recomienda validación humana en entornos de producción.

## Enlaces

- HuggingFace (cuantización ASHQ1): https://huggingface.co/wepiqx/Spark-X2.5-4B-ASHQ1-GGUF
- HuggingFace (modelo base): https://huggingface.co/XHToken/Spark-X2.5-4B
- GitHub (repositorio oficial): https://github.com/XHToken/Spark-X2.5
- ModelScope: https://www.modelscope.cn/models/XHToken/Spark-X2.5-4B
- Ollama: https://ollama.com/SparkLLM/Spark-X2.5-4B:latest
- Pull request de integración en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/27868
- Referencia LLM: https://www.llmreference.com/model/spark-x2.5-4b
