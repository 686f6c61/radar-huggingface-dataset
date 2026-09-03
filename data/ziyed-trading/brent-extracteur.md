# Ziyed-trading/brent-extracteur

## Resumen

El modelo `Ziyed-trading/brent-extracteur` es un ajuste fino del modelo base `Qwen2.5-1.5B-Instruct`, convertido a formato GGUF mediante la herramienta Unsloth. Aunque el nombre sugiere una especialización en extracción de información relacionada con el crudo Brent, la model card no ofrece detalles sobre el dataset de entrenamiento ni el propósito exacto. Se distribuye únicamente en un archivo cuantizado `Q4_K_M`, lo que lo hace ligero y adecuado para despliegue en entornos con recursos limitados. Su relevancia radica en ser un modelo compacto, de aproximadamente 1.54 mil millones de parámetros, que puede ejecutarse en hardware de consumo, aunque su utilidad real dependerá de la calidad del ajuste fino, que no ha sido documentada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) |
| Parametros totales | 1.543.714.304 (~1.54B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo GGUF) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen2.5-1.5B-Instruct, un transformer decoder-only con mecanismos de atención convencionales. Según la model card, fue ajustado con Unsloth y posteriormente convertido a GGUF para su uso con llama.cpp y Ollama. No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas específicas en el ajuste.

## Capacidades

- Generación de texto y diálogo conversacional, heredadas del modelo base Qwen2.5-Instruct.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno, típica de la familia instruct.
- Soporte para inferencia en CPU y GPU mediante llama.cpp y Ollama, gracias al formato GGUF.
- No se han documentado capacidades específicas de tool calling, agentes o razonamiento multi-paso que difieran del modelo base.
- No se confirma soporte multimodal, aunque la model card menciona `llama-mtmd-cli` para modelos multimodales, no aplicable aquí.

## Casos de uso

- Extracción de datos de documentos financieros: el nombre del modelo sugiere una posible especialización en extracción de información sobre el crudo Brent, aunque no hay evidencia pública de ello. Podría usarse para procesar informes, noticias o tablas y extraer cifras relevantes, si el ajuste fino fue diseñado para esa tarea.
- Chatbots de atención al cliente: su tamaño reducido permite integrarlo en sistemas de soporte con respuestas rápidas, siempre que el dominio esté cubierto por el entrenamiento.
- Análisis de sentimiento en textos financieros: si el ajuste incluyó datos de mercado, podría clasificar noticias o mensajes relacionados con el petróleo.
- Resumen de documentos largos: con la limitación de contexto del modelo base (32K tokens en Qwen2.5-1.5B-Instruct, aunque no confirmado aquí), puede resumir informes extensos en entornos con poca memoria.
- Asistente de escritura técnica: generación de borradores de informes o correos, aprovechando la capacidad instruct del modelo base.
- Prototipado rápido de aplicaciones NLP: al ser ligero y compatible con Ollama, es fácil de desplegar en entornos de desarrollo para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se pueden proporcionar datos de MMLU, HumanEval, GSM8K u otras evaluaciones para este modelo específico.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1.5B cuantizado a Q4_K_M, el archivo GGUF ocupa aproximadamente 1 GB (el repo total es de 2 GB, incluyendo posiblemente otros archivos). La VRAM necesaria para inferencia ronda entre 1 y 2 GB, dependiendo del contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2060 o superiores. También puede ejecutarse en CPU mediante llama.cpp, aunque con mayor latencia.
- Compatibilidad con hardware de consumo: sí, es adecuado para GPUs de gama media y baja, así como para CPUs modernas.
- Opciones de despliegue: llama.cpp, Ollama (incluye Modelfile), y servidores compatibles con el formato GGUF como llama-cpp-python o text-generation-webui.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU moderna, se espera una generación de decenas de tokens por segundo, pero depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| Ziyed-trading/brent-extracteur | 1.54B | No disponible | No disponible | GGUF |
| Qwen2.5-1.5B-Instruct (base) | 1.54B | 32K (típico) | Apache 2.0 | Safetensors, GGUF |
| Llama 3.2 1B Instruct | 1.23B | 128K | Llama 3.2 license | Safetensors, GGUF |

El modelo base Qwen2.5-1.5B-Instruct tiene una licencia Apache 2.0, pero la licencia de este ajuste no se especifica, lo que genera incertidumbre sobre su uso comercial. No se dispone de comparativas de rendimiento entre estos modelos para este ajuste concreto.

## Limitaciones y advertencias

- No se ha documentado el proceso de ajuste fino, el dataset utilizado ni la evaluación de sesgos, lo que impide conocer su comportamiento en dominios específicos.
- Riesgo de alucinaciones y errores factuales, especialmente en tareas de extracción de datos donde la precisión es crítica.
- La licencia no está declarada, lo que puede impedir su uso en proyectos comerciales sin autorización explícita del autor.
- El contexto máximo no se confirma, aunque el modelo base soporta 32K tokens; el ajuste podría haberlo reducido.
- Al ser un modelo pequeño (1.5B), su capacidad de razonamiento complejo y generación de código es limitada comparada con modelos más grandes.
- No se proporcionan garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- [HuggingFace - Ziyed-trading/brent-extracteur](https://huggingface.co/Ziyed-trading/brent-extracteur)
- [Unsloth (herramienta de entrenamiento y conversión)](https://github.com/unslothai/unsloth)
