# Vicgrace/Qwen-AgriGemma4.9ja-1.5B-GGUF

## Resumen

Qwen-AgriGemma4.9ja-1.5B-GGUF es un modelo de lenguaje de 1.500 millones de parámetros, presentado en formato GGUF para su uso con llama.cpp, Ollama y otras herramientas compatibles. El modelo es un fine-tuning del base Qwen2.5-1.5B-Instruct, realizado con la librería Unsloth, y ha sido convertido a GGUF para facilitar su despliegue local en entornos de producción y desarrollo. El nombre sugiere una especialización en el dominio agrícola (Agri) y una posible influencia de la familia Gemma, aunque no se dispone de documentación oficial que detalle el proceso de entrenamiento o el corpus utilizado.

El modelo se distribuye únicamente en una cuantización Q4_K_M, lo que lo hace ligero y apto para ejecutarse en hardware de consumo. Su relevancia radica en ofrecer una alternativa compacta y especializada para tareas conversacionales y de generación de texto en el sector agroalimentario, aunque la ausencia de una model card detallada limita la evaluación de sus capacidades reales. El repositorio incluye un Modelfile de Ollama para simplificar su integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (se hereda de Qwen2.5-1.5B, tipicamente 32.768 tokens, pero no confirmado) |
| Tipos de cuantizacion | Q4_K_M (unico archivo disponible) |
| Idiomas soportados | no disponibles (se presupone multilingue por el base, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal, normalización RMSNorm y embeddings rotatorios (RoPE). El fine-tuning se realizó con Unsloth, una librería optimizada para el entrenamiento eficiente de modelos, y posteriormente se convirtió a GGUF mediante las herramientas de llama.cpp. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El nombre "AgriGemma" sugiere una especialización en agricultura y una posible combinación de técnicas de Gemma, pero no hay documentación que lo confirme. El único artefacto publicado es el archivo cuantizado Q4_K_M, sin pesos originales en safetensors.

## Capacidades

- Generación de texto conversacional: el modelo está orientado a tareas de chat e instrucción, heredadas de la base Qwen2.5-Instruct.
- Especialización agrícola: por el nombre, se presume que ha sido afinado con datos del sector agroalimentario, aunque no se detallan las tareas concretas.
- Ejecución local eficiente: al estar en GGUF Q4_K_M, puede ejecutarse en CPU y GPU de baja capacidad.
- Compatibilidad con llama.cpp y Ollama: incluye un Modelfile para despliegue inmediato.
- Soporte de tool calling y agentes: no confirmado; depende de la base Qwen2.5-Instruct, que sí lo soporta, pero no se ha validado en este fine-tuning.
- Multilingüismo: no confirmado; el base Qwen2.5 soporta múltiples idiomas, pero no se ha verificado en esta versión.

## Casos de uso

- Asistente agrícola de campo: un agricultor podría consultar al modelo sobre plagas, rotación de cultivos o interpretación de datos meteorológicos, ejecutándolo en una tablet o portátil sin conexión a internet. Su tamaño reducido permite una respuesta rápida en entornos rurales con poca conectividad.
- Chatbot de soporte técnico para cooperativas: integrado en un sistema de mensajería, el modelo puede resolver dudas frecuentes sobre fertilizantes, riego o normativa, reduciendo la carga de los técnicos humanos.
- Generación de informes agronómicos: a partir de datos de campo (rendimientos, incidencias), el modelo puede redactar resúmenes en lenguaje natural para su inclusión en informes técnicos.
- Educación y divulgación agrícola: utilizado como tutor virtual para estudiantes de agronomía, explicando conceptos como fitosanitarios o gestión de suelos.
- Clasificación y extracción de información de documentos: dado un texto técnico (etiquetas de productos, fichas de cultivo), el modelo puede extraer datos estructurados o responder preguntas específicas.
- Prototipado rápido de aplicaciones conversacionales: gracias a su formato GGUF y compatibilidad con Ollama, es adecuado para pruebas de concepto en startups del sector agro-tech sin necesidad de infraestructura GPU costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este fine-tuning específico. El rendimiento real solo puede estimarse a partir del modelo base Qwen2.5-1.5B-Instruct, que en la versión original alcanza alrededor de 55-60% en MMLU y 45-50% en HumanEval, pero estos valores no son extrapolables sin confirmación.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, el modelo ocupa aproximadamente 0,9 GB de pesos. Considerando overhead de contexto y activaciones, se recomienda al menos 2 GB de VRAM para una ventana de contexto de 8K tokens.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como GTX 1650, RTX 3050, o integradas Apple Silicon (M1/M2) con al menos 8 GB unificados.
- Ejecución en CPU: viable con 8 GB de RAM; la velocidad será modesta (10-20 tokens/segundo en procesadores modernos de 8 núcleos).
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o servidores compatibles con la API de OpenAI mediante adaptadores como llama-server.
- Latencia estimada: en GPU de gama media (RTX 3060), se pueden alcanzar 50-80 tokens/segundo; en CPU, 10-20 tokens/segundo. Estos valores son orientativos y dependen del hardware y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base Qwen2.5-1.5B-Instruct es su referencia más cercana, pero el fine-tuning agrícola puede alterar significativamente el rendimiento en tareas generales. Alternativas en el mismo rango de tamaño (1-2B) serían Gemma-2-2B, Phi-3-mini o Llama-3.2-1B, pero no hay datos de evaluación de este modelo frente a ellos. Se recomienda realizar pruebas propias antes de elegir.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeño, es propenso a generar información incorrecta o inventada, especialmente en dominios especializados si el fine-tuning no fue exhaustivo.
- Dominio limitado: la especialización agrícola puede degradar el rendimiento en tareas generales fuera de ese ámbito.
- Contexto limitado: aunque el base soporta hasta 32K tokens, la cuantización Q4_K_M y el fine-tuning pueden reducir la ventana efectiva sin degradación.
- Licencia desconocida: al no especificarse la licencia, no se puede garantizar el uso comercial. Se debe contactar con el autor antes de utilizarlo en producción.
- Sin documentación técnica: la ausencia de una model card detallada impide conocer el dataset, el método de alineación y los riesgos específicos.
- Un solo formato de cuantización: solo se ofrece Q4_K_M, lo que limita el ajuste fino de la relación calidad/velocidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Vicgrace/Qwen-AgriGemma4.9ja-1.5B-GGUF
- Organización Qwen en HuggingFace: https://huggingface.co/Qwen
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Repositorio Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
