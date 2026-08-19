# WariHima/rinn-taiko2-90m-ja-base-v1

## Resumen

El modelo **WariHima/rinn-taiko2-90m-ja-base-v1** es un modelo de lenguaje autoregresivo de 84,9 millones de parámetros desarrollado por WariHima, especializado en la generación de texto en japonés. Forma parte de la serie "Rin-Taiko" (隣大河), una familia de modelos que emplea la arquitectura RWKV7 con atención lineal flash (FLA), diseñada para ofrecer un equilibrio entre eficiencia computacional y capacidad de procesamiento de secuencias.

Este modelo base se ha entrenado exclusivamente con datos de la Wikipedia japonesa (150.000 filas, repetidas 6 veces, con secuencias de 512 tokens), lo que lo convierte en una opción ligera y accesible para tareas de procesamiento de lenguaje natural en japonés. Su relevancia actual radica en su tamaño reducido, que permite su ejecución en hardware de consumo, y en su arquitectura RWKV7, que combina las ventajas de los transformadores con la eficiencia de las RNN.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en proyectos de código abierto. Sin embargo, al ser un modelo base, no está optimizado para instrucciones ni diálogo, por lo que requiere un proceso de ajuste fino (SFT) para aplicaciones concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV7 (con atención lineal flash, FLA) |
| Parametros totales | 84.892.672 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (principalmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura **RWKV7**, una evolución de la familia RWKV que combina mecanismos de atención lineal con recurrencia, ofreciendo una complejidad computacional O(n) en lugar de O(n²) de los transformadores clásicos. La implementación emplea la librería `flash-linear-attention` (FLA), que optimiza el cálculo de la atención en GPU. El tokenizador es personalizado: los caracteres ASCII, katakana e hiragana se tratan a nivel de carácter, mientras que el resto se codifica a nivel de byte. El vocabulario total es de 1.024 tokens BPE más 24 tokens especiales, incluyendo el formato de chat de Qwen3.

El entrenamiento se realizó con una única GPU RTX 3060 durante 2,5 horas por cada una de las 6 pasadas (15 horas en total). El dataset utilizado es `OmniAICreator/Japanese-Wikipedia-202506`, con 150.000 filas por época, repetidas 6 veces (900.000 filas en total), con una longitud de secuencia de 512 tokens. No se aplicaron técnicas de RLHF ni DPO; el modelo es un modelo base sin ajuste por instrucciones.

## Capacidades

- Generación de texto en japonés: produce texto coherente y gramaticalmente correcto en japonés, dado que fue entrenado exclusivamente con Wikipedia japonesa.
- Modelado de lenguaje: puede completar frases, predecir tokens y generar continuaciones de texto.
- Procesamiento de secuencias largas: gracias a la arquitectura RWKV7, puede manejar secuencias de hasta 512 tokens de forma eficiente.
- Tokenización especializada: el tokenizador personalizado optimiza la representación de caracteres japoneses (hiragana, katakana) y ASCII.
- No soporta tool calling, function calling, agentes, visión ni audio: es un modelo puramente textual y base.

## Casos de uso

- **Generación de contenido en japonés**: el modelo puede redactar artículos, resúmenes o textos creativos en japonés. Al ser un modelo base, se puede ajustar finamente con datos específicos para mejorar la calidad en dominios concretos.
- **Autocompletado de texto**: integrable en editores de código o procesadores de texto para sugerir continuaciones de frases en japonés, aprovechando su capacidad de modelado de lenguaje.
- **Traducción asistida**: aunque no está entrenado para traducción, puede usarse como componente de un sistema más grande que genere texto en japonés a partir de borradores o esquemas.
- **Análisis de sentimiento y clasificación de texto**: tras un ajuste fino con datos etiquetados, el modelo puede clasificar reseñas, comentarios o noticias en japonés.
- **Educación y aprendizaje de idiomas**: puede generar ejercicios, ejemplos de frases o textos de práctica para estudiantes de japonés, gracias a su dominio del idioma.
- **Prototipado rápido de NLP**: su pequeño tamaño (84,9M parámetros) permite experimentar con técnicas de ajuste fino (SFT, LoRA) en hardware de consumo, ideal para investigadores o desarrolladores que exploran modelos en japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: al tener 84,9M de parámetros, el modelo cabe en GPUs con 2-4 GB de VRAM en FP16, y menos de 1 GB en cuantización INT8 (si estuviera disponible).
- **GPU recomendadas**: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o incluso CPUs con suficiente RAM (inferencia lenta pero posible).
- **Compatibilidad con consumer GPU**: sí, es totalmente viable en GPUs de gama baja y media.
- **Opciones de despliegue**: al ser un modelo con `custom_code`, se requiere la librería `flash-linear-attention` y `trust_remote_code=True` en HuggingFace Transformers. También se puede convertir a GGUF para usar con llama.cpp, aunque el autor advierte que el tokenizador personalizado requiere implementación adicional.
- **Latencia y throughput**: no se han publicado datos oficiales, pero por su tamaño, se espera una latencia baja (inferior a 100 ms por token en GPU moderna) y un throughput alto en comparación con modelos más grandes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WariHima/rinn-taiko2-90m-ja-base-v1 | 84,9M | 512 | RWKV7 | Apache 2.0 | HuggingFace |
| WariHima/rinn-taiko-90m-ja-base-v1 | 84,9M (estimado) | no disponible | RWKV7 | CC-BY-SA-4.0 | HuggingFace |
| rinna/japanese-gpt2-small | 110M | 1024 | GPT-2 | MIT | HuggingFace |

La comparativa se limita a modelos japoneses de tamaño similar. El modelo de WariHima destaca por su arquitectura RWKV7, más eficiente que GPT-2, y por su licencia permisiva (Apache 2.0), que permite uso comercial sin restricciones. Sin embargo, el contexto de 512 tokens es limitado en comparación con otros modelos.

## Limitaciones y advertencias

- **Modelo base sin ajuste por instrucciones**: no es adecuado para uso directo en chatbots o asistentes; requiere SFT para tareas específicas.
- **Contexto limitado**: la ventana de 512 tokens puede ser insuficiente para tareas que requieran contexto largo, como resúmenes de documentos extensos.
- **Tokenizador personalizado**: el tokenizador no es estándar, lo que puede causar incompatibilidades con herramientas que esperan tokenizadores convencionales (por ejemplo, en GGUF).
- **Datos de entrenamiento limitados**: solo se usó Wikipedia japonesa, lo que puede generar sesgos hacia un registro formal y enciclopédico, y limitar el conocimiento de dominios específicos.
- **Riesgo de alucinaciones**: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas fuera de su distribución de entrenamiento.
- **Soporte de GGUF incompleto**: el autor indica que el archivo GGUF no funciona de forma autónoma; la tokenización debe implementarse por separado, lo que complica el despliegue en herramientas como llama.cpp u Ollama.
- **Sin garantías de producción**: al ser un proyecto personal con 0 descargas y 0 likes, no hay evidencia de uso en entornos de producción ni soporte comunitario.

## Enlaces

- [HuggingFace: WariHima/rinn-taiko2-90m-ja-base-v1](https://huggingface.co/WariHima/rinn-taiko2-90m-ja-base-v1)
- [Colección Rin-Taiko en HuggingFace](https://huggingface.co/collections/WariHima/rinn-taiko)
- [Perfil de GitHub de WariHima](https://github.com/WariHima)
