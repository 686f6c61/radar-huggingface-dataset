# wakeelypro/wakeelypro-jordanian-law

## Resumen

WakeelyPro Jordanian Law es un modelo de lenguaje fine-tuneado sobre Qwen2.5-0.5B-Instruct, desarrollado por el equipo de wakeelypro, una plataforma legal jordana. El modelo está especializado en el derecho jordano, entrenado con un conjunto de datos que cubre 66 artículos de leyes de Jordania, convertidos en 132 ejemplos en formato alpaca. Su objetivo es proporcionar respuestas precisas a consultas legales en árabe, integrable en sistemas de recuperación aumentada (RAG) para asistencia jurídica.

La relevancia de este modelo radica en su enfoque de nicho: un dominio legal específico (Jordania) con un modelo base pequeño (0.5B de parámetros), lo que permite ejecutarlo en hardware modesto, incluso en entornos de bajo coste como Google Colab. Aunque su tamaño limita la complejidad de las respuestas, su especialización en un corpus legal reducido lo hace útil para tareas de consulta y referencia rápida. El modelo se distribuye mediante la librería Soup, que facilita su despliegue con una API compatible con OpenAI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) |
| Parametros totales | 0.5B (base Qwen2.5-0.5B-Instruct) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (mencionado en la configuracion de entrenamiento) |
| Idiomas soportados | Arabe (implicitamente, por el dominio legal jordano) |
| Licencia | No disponible |
| Formato de pesos | No disponible (libreria Soup, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer de 0.5 mil millones de parámetros con atención causal estándar. El fine-tuning se realizó con la librería Soup, que permite entrenamiento eficiente mediante LoRA (r=16) y cuantización de 4 bits. La configuración de entrenamiento incluye batch_size=1, 3 épocas y la técnica stream_layers, que optimiza el uso de memoria en entornos limitados como Colab T4 o MPS.

El conjunto de datos de entrenamiento se construyó a partir de 66 artículos de leyes jordanas, transformados en 132 filas en formato alpaca (instrucción, entrada, salida). No se especifica el número total de tokens ni la composición exacta del dataset, pero el volumen es reducido, lo que sugiere un entrenamiento rápido y de bajo coste. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al fine-tuning.

## Capacidades

- Generación de texto en árabe orientada a consultas legales sobre el derecho jordano.
- Respuesta a preguntas basadas en los artículos de leyes incluidos en el entrenamiento.
- Integración con sistemas RAG para recuperar información legal específica.
- Compatible con la API de Soup, que expone un endpoint OpenAI-compatible para chat.
- Capacidad de razonamiento limitada debido al tamaño reducido del modelo base.
- No se documentan capacidades de tool calling, agentes, visión o audio.

## Casos de uso

- Consulta rápida de artículos legales jordanos: un ciudadano puede preguntar "¿Cuál es la pena por robo según el código penal jordano?" y el modelo devuelve el artículo correspondiente, siempre que esté en el corpus de entrenamiento.
- Asistente legal para abogados: integrado en un sistema RAG, el modelo puede ayudar a localizar referencias legales específicas durante la redacción de documentos, aunque su tamaño limita la profundidad del análisis.
- Plataforma de educación jurídica: estudiantes de derecho pueden usarlo para practicar preguntas tipo test sobre leyes jordanas, con respuestas basadas en el corpus.
- Chatbot de atención al ciudadano en portales gubernamentales: desplegado con Soup, responde preguntas frecuentes sobre trámites legales, reduciendo la carga de trabajo humano.
- Análisis de documentos legales simples: dado un texto breve, el modelo puede identificar si menciona conceptos cubiertos por las leyes entrenadas, aunque con riesgo de alucinación.
- Prototipo de investigación en NLP jurídico: sirve como punto de partida para experimentos de fine-tuning en dominios legales de países con pocos recursos lingüísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones específicas para tareas legales. El autor no proporciona métricas de precisión, recall o F1 sobre el corpus de leyes jordanas.

## Requisitos de hardware

- Al ser un modelo de 0.5B con cuantización de 4 bits, la inferencia requiere aproximadamente 0.5-1 GB de VRAM, dependiendo de la implementación.
- Puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4090, o incluso en CPU con suficiente RAM (se recomienda al menos 4 GB).
- El entrenamiento se realizó en Google Colab T4 (16 GB VRAM) o MPS de Apple, lo que indica que la inferencia es viable en hardware similar.
- Opciones de despliegue: Soup (servidor OpenAI-compatible), también puede exportarse a formatos como GGUF para usar con llama.cpp u Ollama, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles, pero dado el tamaño, se espera una generación rápida (menos de 1 segundo por respuesta en GPU moderna).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para derecho jordano. Como referencia, el modelo base Qwen2.5-0.5B-Instruct tiene capacidades generales de chat en múltiples idiomas, pero sin especialización legal. Otros modelos legales para Jordania, como el servidor MCP de Jordanian Law (que consulta 62 estatutos), no son modelos de lenguaje sino herramientas de acceso a bases de datos. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- Tamaño reducido (0.5B) que limita la coherencia en respuestas largas y el razonamiento complejo.
- Entrenamiento con solo 66 artículos de leyes, lo que cubre una fracción mínima del corpus legal jordano completo (494 actos según el MCP server).
- Riesgo de alucinación: el modelo puede inventar artículos o interpretaciones incorrectas si la consulta no está en el corpus.
- Sin licencia especificada, lo que genera incertidumbre sobre su uso comercial y redistribución.
- No se documentan sesgos, pero al entrenarse con un corpus legal limitado, puede reflejar interpretaciones sesgadas o desactualizadas de las leyes.
- El idioma principal es árabe, pero no se garantiza la calidad en dialectos o variantes formales.
- No hay soporte para tool calling ni funciones de agente, lo que limita su integración en pipelines complejos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wakeelypro/wakeelypro-jordanian-law
- Plataforma WakeelyPro: https://wakeelypro.com/
- Servidor MCP de leyes jordanas: https://mcpmarket.com/server/jordanian-law
- Solución legal AI para Jordania (HAQQ): https://www.haqq.ai/solutions/by-country/jordan
- Servidor MCP en LobeHub: https://lobehub.com/mcp/ansvar-systems-jordan-law-mcp
