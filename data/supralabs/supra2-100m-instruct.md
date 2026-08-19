# SupraLabs/Supra2-100M-Instruct

## Resumen

Supra2-100M-Instruct es un modelo de lenguaje pequeño, de tipo decoder-only, desarrollado por SupraLabs, un laboratorio independiente centrado en modelos abiertos para hardware de consumo. Con 100 millones de parámetros y una ventana de contexto de 2.000 tokens, está diseñado para tareas de generación de texto, chat e instrucción en inglés. Se basa en la arquitectura Qwen3 e incorpora un tokenizador propio de 32.768 tokens. Es la versión instruida del modelo base Supra2-100M-Base, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

El modelo se ha preentrenado desde cero sobre 30.000 millones de tokens de texto web en inglés, utilizando los conjuntos de datos HuggingFaceFW/fineweb-edu y HuggingFaceFW/dclm_100BT-shuffled. Posteriormente se ha realizado un ajuste fino completo (full fine-tuning) para seguir instrucciones, entrenado en una única GPU RTX 5060 Ti de 16 GB. Su relevancia radica en ofrecer una alternativa compacta y eficiente para entornos con recursos limitados, manteniendo un rendimiento competitivo dentro de su categoría de tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (decoder-only transformer) |
| Parametros totales | 100.684.032 (100M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.000 tokens |
| Tipos de cuantizacion | No disponible (se publican pesos en GGUF, sin variantes especificadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only basada en Qwen3, con un tokenizador personalizado de 32.768 tokens. Se preentrenó desde cero sobre 30.000 millones de tokens de texto web en inglés, combinando los conjuntos de datos fineweb-edu y dclm_100BT-shuffled, lo que aporta una mezcla de contenido educativo y texto general de alta calidad. No se menciona el uso de técnicas como RLHF o DPO; el ajuste fino para instrucciones se realizó mediante full fine-tuning sobre el modelo base, entrenado en una única GPU RTX 5060 Ti de 16 GB. No se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y conversación multi-turno en formato ChatML.
- Seguimiento de instrucciones en inglés para tareas de respuesta a preguntas, explicaciones y asistencia conversacional.
- Capacidad limitada de razonamiento básico, acorde a su tamaño (100M de parámetros).
- No se ha confirmado soporte explícito de tool calling o function calling.
- No se ha confirmado soporte de agentes o razonamiento multi-paso complejo.
- Multilingüe: únicamente inglés; no hay indicios de soporte para otros idiomas.
- Sin capacidades de visión, audio u otras modalidades.

## Casos de uso

- Chatbots de soporte básico: el modelo puede gestionar conversaciones sencillas de atención al cliente en inglés, gracias a su formato de chat y su ventana de 2K tokens, suficiente para interacciones cortas y preguntas frecuentes.
- Asistente educativo para estudiantes: puede responder preguntas sobre conceptos generales de ciencia, tecnología o cultura, como se muestra en los ejemplos de la model card sobre IA o Google, ofreciendo explicaciones introductorias.
- Prototipado rápido de aplicaciones de lenguaje: por su pequeño tamaño, es ideal para validar ideas de productos que requieran generación de texto sin necesidad de infraestructura potente.
- Generación de contenido breve: redacción de resúmenes, descripciones de productos o párrafos cortos en inglés, donde la coherencia básica es suficiente.
- Clasificación y etiquetado de texto: aunque no está específicamente entrenado para ello, puede adaptarse con fine-tuning adicional para tareas de categorización de documentos cortos.
- Entornos con restricciones de hardware: despliegue en dispositivos edge, Raspberry Pi o servidores sin GPU, gracias a su bajo consumo de memoria (alrededor de 0,2 GB en FP16).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,2 GB en FP16 (200 MB para los pesos), lo que permite inferencia en GPU con muy poca memoria e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, GTX 1650, RTX 3060, integradas modernas). El fine-tuning se realizó en una RTX 5060 Ti de 16 GB, pero para inferencia se requiere mucho menos.
- Compatible con hardware de consumo: sí, es uno de sus objetivos principales.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama, TGI (text-generation-inference), entre otras.
- Latencia y throughput: no se proporcionan datos específicos, pero por su tamaño se espera una latencia muy baja (del orden de milisegundos por token en GPU) y alta velocidad de generación incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idioma | Disponibilidad |
|---|---|---|---|---|---|
| Supra2-100M-Instruct | 100M | 2K | Apache 2.0 | en | HuggingFace |
| SmolLM2-135M-Instruct | 135M | 2K | Apache 2.0 | en, fr, de, es, it, pt | HuggingFace |
| Qwen2.5-0.5B-Instruct | 500M | 32K | Apache 2.0 | multilingue | HuggingFace |

La comparativa se basa en características estructurales, ya que no hay benchmarks públicos de Supra2-100M-Instruct. SmolLM2-135M ofrece un tamaño similar y contexto comparable, pero con soporte multilingüe. Qwen2.5-0.5B es más grande y con contexto mucho mayor, aunque sigue siendo un modelo pequeño. No se dispone de datos de rendimiento para una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeño entrenado con 30B tokens, es propenso a generar información inexacta o inventada, como se observa en los ejemplos de la model card donde define "Google" de forma imprecisa.
- Contexto limitado: la ventana de 2K tokens restringe la capacidad de manejar documentos largos o conversaciones extensas.
- Idioma: solo inglés; no sirve para aplicaciones en otros idiomas sin un fine-tuning adicional.
- Capacidad de razonamiento limitada: no es adecuado para tareas complejas de lógica, matemáticas avanzadas o generación de código sofisticado.
- Sin soporte confirmado de tool calling: no se puede integrar directamente en pipelines que requieran llamadas a funciones o APIs.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de los datasets de entrenamiento (fineweb-edu y dclm) para posibles restricciones de atribución.

## Enlaces

- HuggingFace: https://huggingface.co/SupraLabs/Supra2-100M-Instruct
- Sitio web de SupraLabs: https://supra-labs.com/
- LLM Explorer: https://llm-explorer.com/model/SupraLabs%2FSupra2-100M-Instruct,6ziqsV5PHjhp3dMMTGosma
- Modelo base: https://huggingface.co/SupraLabs/Supra2-100M-Base
