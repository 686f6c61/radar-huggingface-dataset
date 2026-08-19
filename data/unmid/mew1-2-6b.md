# Unmid/Mew1-2.6B

## Resumen

Mew1-2.6B es un modelo de generación de texto de 2.69 mil millones de parámetros desarrollado por Unmid, construido sobre la arquitectura LFM2 de Liquid AI. Se trata de un checkpoint en BF16 para Transformers, con una variante GGUF publicada por separado, orientado a conversación local, escritura creativa, roleplay y experimentación en hardware con recursos limitados. El modelo se describe como "uncensored", lo que implica un comportamiento de rechazo reducido frente a peticiones que otros modelos suelen bloquear.

Su relevancia radica en combinar una ventana de contexto de 128.000 tokens con un tamaño compacto que permite ejecutarlo en dispositivos de gama media, incluyendo teléfonos y CPUs. La arquitectura LFM2 es un diseño híbrido que difiere de los transformers densos convencionales, y el checkpoint incluye soporte nativo para tool calling mediante una plantilla de chat tipo ChatML. El modelo se distribuye bajo la licencia LFM Open License v1.0 y solo tiene inglés como idioma probado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 híbrida (`Lfm2ForCausalLM`) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | GGUF: Q2_K, Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (único idioma probado) |
| Licencia | LFM Open License v1.0 (license:other) |
| Formato de pesos | Safetensors BF16 (4 shards), GGUF |

## Arquitectura y entrenamiento

LFM2 es una arquitectura híbrida desarrollada por Liquid AI que combina elementos de transformers con mecanismos de atención lineal o subcuadrática, diseñada para reducir el coste computacional en contextos largos. El checkpoint Mew1-2.6B tiene 30 capas y un vocabulario de 128.000 tokens. El modelo base LFM2.5-2.6B fue preentrenado sobre aproximadamente 34 billones de tokens, según informa Liquid AI, y Mew1 es un derivado post-entrenado por Unmid para reducir comportamientos de rechazo y optimizar tareas de roleplay y conversación.

El entrenamiento del modelo base incluyó fases de post-entrenamiento para tareas agénticas, con soporte nativo de tool calling. Mew1 añade un ajuste adicional orientado a "uncensoring" y roleplay, aunque el autor no ha publicado un informe de reproducibilidad ni una suite de benchmarks independiente para la modificación Mew1. El checkpoint usa una plantilla de chat tipo ChatML con soporte para herramientas.

## Capacidades

- Generación de texto conversacional y narrativo en inglés.
- Soporte de tool calling / function calling mediante plantilla ChatML.
- Instrucción y seguimiento de órdenes en formato chat multi-turno.
- Roleplay y escritura creativa con comportamiento de rechazo reducido ("uncensored").
- Ventana de contexto larga de 128.000 tokens, adecuada para diálogos extensos o documentos largos.
- Ejecución local en hardware modesto, incluyendo CPUs y dispositivos móviles según las cifras de Liquid AI para el modelo base.

## Casos de uso

- Roleplay y ficción interactiva: el modelo está específicamente ajustado para mantener personajes y narrativas coherentes en conversaciones largas, gracias a su ventana de 128K tokens que permite conservar el historial completo sin truncamientos.
- Asistente conversacional local sin censura: para entornos donde se necesita un asistente que no rechace peticiones sobre temas sensibles, como investigación de escritura adulta o exploración creativa de temas controvertidos, siempre que se cumpla la licencia y la legislación aplicable.
- Prototipado de agentes con tool calling: su soporte nativo de funciones y su tamaño compacto permiten desarrollar agentes que ejecutan herramientas en entornos con recursos limitados, como portátiles o dispositivos edge.
- Procesamiento de documentos largos: con 128K de contexto, puede resumir o extraer información de documentos extensos (manuales, informes, código fuente) en una sola pasada sin necesidad de estrategias de chunking complejas.
- Generación de código asistida en local: aunque no está especializado en código, su capacidad de instrucción y contexto largo permite usarlo como copiloto ligero en entornos sin conexión o con privacidad estricta.
- Experimentación académica: su licencia abierta y tamaño reducido lo hacen adecuado para investigar comportamientos de modelos "uncensored", técnicas de alineación o comparativas de arquitecturas híbridas en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor del modelo indica explícitamente que no existe un informe de reproducibilidad ni una suite de benchmarks independiente para la modificación Mew1. Para el modelo base LFM2.5-2.6B, Liquid AI reporta 220 tokens por segundo en un Apple M5 Max, 30 tokens por segundo en un smartphone y menos de 2,5 GB de memoria para ejecución, así como cerca de 15.000 tokens de salida por segundo en un NVIDIA H100 con alta concurrencia. Estas cifras corresponden al modelo base, no al checkpoint Mew1.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint BF16 completo ocupa aproximadamente 5,4 GB en memoria (2,69B parámetros × 2 bytes). Las versiones GGUF van de 1,09 GB (Q2_K) a 2,87 GB (Q8_0).
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM puede ejecutar el modelo en BF16 (RTX 2060, RTX 3060, RTX 4060, etc.). Para las cuantizaciones GGUF más bajas, 2-4 GB de VRAM son suficientes.
- Consumer GPU: sí, cabe en GPUs de gama media y baja. También puede ejecutarse en CPU con las cuantizaciones GGUF, aunque con mayor latencia.
- Opciones de despliegue: Transformers con PyTorch para el checkpoint BF16; llama.cpp, Ollama o LM Studio para los archivos GGUF. vLLM y TGI pueden ser compatibles pero no están confirmados para esta arquitectura.
- Latencia y throughput: no hay datos publicados específicos para Mew1. Para el modelo base, Liquid AI reporta 220 tok/s en Apple M5 Max y 30 tok/s en smartphone.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mew1-2.6B | 2,69B | 128K | LFM Open v1.0 | Derivado "uncensored" de LFM2.5, roleplay |
| LFM2.5-2.6B | 2,6B | 128K | LFM Open v1.0 | Modelo base de Liquid AI, agéntico, tool calling |
| Qwen2.5-3B | 3,0B | 32K | Apache 2.0 | Modelo denso generalista, buen multilingüe |
| Llama-3.2-3B | 3,2B | 128K | Llama 3.2 Community | Modelo denso de Meta, instruct y tool calling |

Mew1 se diferencia de Qwen y Llama por su naturaleza "uncensored" y su arquitectura híbrida LFM2, que promete mejor eficiencia en contexto largo. Frente a su base LFM2.5, la diferencia principal es el ajuste específico para roleplay y reducción de rechazos. No hay benchmarks públicos que permitan comparar rendimiento real entre estos modelos.

## Limitaciones y advertencias

- El modelo puede producir texto incorrecto, sesgado, inseguro o fabricado. La etiqueta "uncensored" describe un comportamiento de rechazo reducido, no garantiza exactitud ni idoneidad.
- Solo se ha probado en inglés; el rendimiento en otros idiomas no está verificado y probablemente sea deficiente.
- No hay benchmarks publicados para Mew1, por lo que las afirmaciones de rendimiento deben evaluarse en cargas de trabajo propias.
- La licencia LFM Open License v1.0 incluye condiciones de atribución y uso comercial que deben revisarse antes de desplegar el modelo en producción.
- El uso de un modelo sin filtros de seguridad conlleva riesgos legales y éticos, especialmente en aplicaciones médicas, legales, financieras o de seguridad.
- La arquitectura LFM2 es relativamente nueva; la compatibilidad con herramientas de inferencia optimizadas (vLLM, TGI) no está confirmada y puede requerir versiones recientes de Transformers.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Unmid/Mew1-2.6B
- Repositorio GGUF: https://huggingface.co/Unmid/Mew1-2.6B-GGUF
- Documentación de LFM2.5-2.6B: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Artículo sobre el lanzamiento de LFM2.5-2.6B: https://aiweekly.co/alerts/liquid-ai-ships-lfm25-26b-agent-model-that-runs-on-device
- Análisis de LFM2.5-2.6B: https://principalvc.substack.com/p/liquid-ai-releases-lfm25-26b-an-on
