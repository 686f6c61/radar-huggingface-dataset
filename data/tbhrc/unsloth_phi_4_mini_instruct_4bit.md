# tbhrc/unsloth_phi_4_mini_instruct_4bit

## Resumen

El modelo `tbhrc/unsloth_phi_4_mini_instruct_4bit` es una conversión a formato MLX (Apple Silicon) de la versión cuantizada a 4-bit de `unsloth/Phi-4-mini-instruct`, realizada por el usuario `tbhr2`. El modelo base original es `Phi-4-mini-instruct`, desarrollado por Microsoft, un transformer denso de 3.8 mil millones de parámetros con decodificación solo por autocompletado, diseñado para chat y generación de texto. Esta conversión reduce el tamaño del modelo a aproximadamente 2,2 GB, lo que permite ejecutarlo en dispositivos Apple con memoria unificada limitada.

El modelo hereda las capacidades del Phi-4-mini-instruct: un vocabulario ampliado de 200 000 tokens, atención por grupos (grouped-query attention) y una ventana de contexto de 128 000 tokens. La cuantización 4-bit mediante Unsloth y la conversión a MLX hacen que sea una opción atractiva para desarrolladores que necesitan un modelo de razonamiento, código y matemáticas en equipos Apple sin GPU dedicada. Al estar basado en el Phi-4-mini, conserva el soporte multilingüe y las técnicas de post-entrenamiento para seguimiento de instrucciones y llamadas a funciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Phi-4-mini-instruct) |
| Parámetros totales | 599 546 880 (según safetensors del repo) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantización | 4-bit (conversión MLX, equivalente a 4-bit Unsloth bnb) |
| Idiomas soportados | Multilingüe |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso decoder-only con atención por grupos (GQA) y embeddings compartidos entre entrada y salida, una innovación del Phi-4-mini que reduce el número de parámetros y mejora la eficiencia respecto a la generación anterior. El vocabulario se amplió a 200 000 tokens para mejorar la cobertura multilingüe. El post-entrenamiento incluyó técnicas de seguimiento de instrucciones, función de llamada y datos adicionales para mejorar las capacidades clave. La versión cuantizada fue generada por Unsloth (cuantización 4-bit con bitsandbytes) y posteriormente convertida a formato MLX con la librería `mlx-lm` en su versión 0.22.3.

## Capacidades

- Generación de texto conversacional y autocompletado con plantilla de chat.
- Razonamiento matemático y lógico, con buen desempeño en tareas de nivel medio.
- Generación y comprensión de código en múltiples lenguajes.
- Seguimiento de instrucciones y función calling (llamada a funciones).
- Soporte multilingüe gracias al vocabulario ampliado.
- Ventana de contexto de 128K tokens para conversaciones largas y documentos extensos.
- Compatible con el pipeline de transformers `text-generation` y con la librería `mlx-lm` para inferencia en Apple Silicon.

## Casos de uso

- Asistentes de chat locales en Mac: el modelo se puede cargar con `mlx-lm` y usar como backend de chatbots personales sin conexión, aprovechando los 128K tokens de contexto para conversaciones largas.
- Generación de código en entornos de desarrollo: al soportar función calling, puede integrarse en editores o IDEs para autocompletado avanzado o generación de funciones completas.
- Análisis de documentos extensos: con su contexto de 128K tokens, permite resumir o extraer información de libros, informes o contratos completos en una sola pasada.
- Razonamiento matemático en educación: puede usarse como tutor virtual que explica paso a paso problemas de álgebra o cálculo.
- Prototipado de agentes con razonamiento multi-paso: su capacidad de seguimiento de instrucciones y función calling permite construir pipelines de agente simples en entornos locales.
- Inferencia en producción con MLX: ideal para aplicaciones de servidor en entornos Apple Silicon (macOS o clústeres con chips M-series) donde se priorice la eficiencia de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Phi-4-mini-instruct de Microsoft incluye comparaciones internas, pero no se reproducen aquí por no estar disponibles en los datos proporcionados.

## Requisitos de hardware

- El formato MLX está diseñado para Apple Silicon (chips M1, M2, M3, M4 y posteriores).
- El tamaño del repo es de 2,2 GB, por lo que requiere al menos 4 GB de memoria unificada para cargar el modelo y sus metadatos; se recomiendan 8 GB para un funcionamiento cómodo.
- No es compatible con GPUs NVIDIA ni AMD; para otros hardware se necesitaría la versión GGUF o bnb-4bit de Unsloth.
- La inferencia se realiza con `mlx-lm` (comando `python -m mlx_lm.generate` o la API de Python).
- No hay datos de latencia o throughput disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tbhrc/unsloth_phi_4_mini_instruct_4bit | 3,8B (base) / 0,6B (cuantizado) | 128K | MIT | MLX 4-bit | Conversión MLX para Apple Silicon |
| unsloth/Phi-4-mini-instruct-unsloth-bnb-4bit | 3,8B | 128K | MIT | bnb 4-bit | Versión original cuantizada para GPUs NVIDIA |
| unsloth/Phi-4-mini-instruct-GGUF | 3,8B | 128K | MIT | GGUF | Para llama.cpp y Ollama |
| Microsoft Phi-4-mini-instruct | 3,8B | 128K | MIT | safetensors | Modelo original sin cuantizar |

## Limitaciones y advertencias

- La conversión MLX solo funciona en Apple Silicon; no se puede usar en GPUs NVIDIA o AMD sin convertir a otro formato.
- El modelo cuantizado a 4-bit puede presentar una ligera degradación en tareas de razonamiento complejo respecto al modelo original de precisión completa.
- No se dispone de datos de sesgos específicos del modelo cuantizado; se heredan los sesgos potenciales del modelo base, que no han sido documentados en la información proporcionada.
- La licencia MIT permite uso comercial y modificación, pero se recomienda revisar los términos de la licencia del modelo base en el enlace oficial.
- El contexto de 128K tokens requiere memoria suficiente; en Macs con 8 GB puede no ser posible usar la ventana completa sin fallos de memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tbhr2/unsloth_phi_4_mini_instruct_4bit
- Modelo original de Microsoft: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Versión Unsloth 4-bit bnb: https://huggingface.co/unsloth/Phi-4-mini-instruct-unsloth-bnb-4bit
- Versión GGUF de Unsloth: https://huggingface.co/unsloth/Phi-4-mini-instruct-GGUF
- Blog de Unsloth sobre Phi-4: https://unsloth.ai/blog/phi4
- Catálogo de Microsoft Foundry: https://ai.azure.com/catalog/models/Phi-4-mini-instruct
