# summerAIO/diffusion-lfm3-1.7b

## Resumen

diffusion-lfm3-1.7b es un ajuste fino del modelo LiquidAI/LFM2-1.7B (1.978.796.800 parámetros) que transforma la arquitectura híbrida original de Liquid AI en un modelo de difusión de bloques (block diffusion) para generación de texto. En lugar de la decodificación autorregresiva token a token, genera bloques de 16 tokens en paralelo mediante desruido iterativo con enmascaramiento y desenmascaramiento guiado por confianza, lo que permite predicción paralela y autocorrección dentro del bloque activo. Lo desarrolla el usuario summerAIO y se publica bajo la licencia lfm-open-license-v1.0 de Liquid AI.

El modelo parte de la arquitectura híbrida de LFM2 (convolución causal 1D más Grouped-Query Attention) y aplica un objetivo de modelado de lenguaje enmascarado con máscaras de atención block-causales: cada bloque de 16 tokens atiende a bloques anteriores y bidireccionalmente dentro del propio bloque. El ajuste fino se centra en instrucciones multilingües y refuerza especialmente el japonés, con replay multilingüe para mitigar el olvido catastrófico.

Es relevante ahora porque explora una alternativa práctica a la generación autorregresiva clásica en un tamaño de 1.7B apto para hardware de consumo, con soporte declarado de siete idiomas (japonés, inglés, chino, coreano, español, alemán y francés) y generación en streaming. El repositorio tiene 4.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrida (convolución causal 1D + Grouped-Query Attention) convertida a block diffusion con máscara block-causal |
| Parámetros totales | 1.978.796.800 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso opera con bloques de 16 tokens y sin caché) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | ja, en, zh, ko, es, de, fr |
| Licencia | lfm-open-license-v1.0 (other) |
| Formato de pesos | safetensors, con código personalizado (custom_code) |

## Arquitectura y entrenamiento

La base es LFM2-1.7B, una arquitectura híbrida que combina convolución causal 1D con Grouped-Query Attention. Sobre ella se aplica un esquema de difusión de bloques con tamaño de bloque 16: la atención usa una máscara block-causal en la que cada token atiende a todos los bloques previos y de forma bidireccional a los tokens del bloque actual. La generación se realiza por desruido iterativo: se parte de un bloque completamente enmascarado y se van rellenando posiciones según la confianza (margen entre las dos predicciones más probables), con posibilidad de remasking y autocorrección.

El ajuste fino usa datasets de instrucciones multilingües equilibrados (OpenAssistant/oasst2 y CohereForAI/aya_dataset) seguidos de un tuning específico en japonés (kunishou/databricks-dolly-15k-ja y llm-jp/oasst1-21k-ja) con replay multilingüe para evitar el olvido catastrófico. Se emplean técnicas de low-mask annealing (énfasis en tasas de enmascaramiento bajas en la fase final) y span masking contiguo de 2 a 3 tokens para mejorar la cohesión de partículas, los límites entre kanji y okurigana y la precisión morfológica. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. El modelo soporta visualización de desruido en streaming dentro de cada bloque activo.

## Capacidades

- Generación de texto conversacional multilingüe en siete idiomas (japonés, inglés, chino, coreano, español, alemán y francés).
- Generación paralela por bloques de 16 tokens con desruido iterativo y desenmascaramiento guiado por confianza.
- Autocorrección y remasking dentro del bloque activo, lo que permite revisar predicciones de baja confianza.
- Generación en streaming con visualización del proceso de desruido token a token.
- Razonamiento de instrucciones y respuesta a prompts conversacionales mediante plantilla de chat (apply_chat_template).
- Refuerzo específico de morfología japonesa (partículas, límites kanji-okurigana).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Generación de texto multilingüe en producción: el modelo puede atender peticiones en siete idiomas con un único checkpoint de 1.7B, lo que simplifica el despliegue frente a mantener modelos separados por idioma.
- Asistentes conversacionales en japonés: el ajuste específico con dolly-15k-ja y oasst1-21k-ja y las técnicas de span masking mejoran la corrección morfológica, adecuado para chatbots de atención al cliente en japonés.
- Generación con streaming visual: la capacidad de mostrar el desruido bloque a bloque encaja en interfaces que quieren revelar texto en tiempo real o depurar el proceso de generación.
- Investigación en modelos de difusión de lenguaje: sirve como banco de pruebas a escala 1.7B para comparar decodificación autorregresiva frente a block diffusion en tareas de instrucciones.
- Prototipado en hardware de consumo: con 1.978.796.800 parámetros y pesos en bfloat16 (repositorio de 4.0 GB), es viable en GPUs de gama alta para consumidores, útil para experimentación local.
- Traducción y reescritura entre los siete idiomas soportados: el entrenamiento multilingüe equilibrado permite tareas de paráfrasis y adaptación de registro entre idiomas.
- Educación y demostraciones de inferencia no autorregresiva: el código de ejemplo con hook SDPA block-causal facilita material didáctico sobre decodificación paralela.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB en bfloat16 para los pesos (1.978.796.800 parámetros), más memoria para activaciones y KV; el ejemplo de uso opera sin caché (use_cache=False) y con bloques de 16 tokens.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, una RTX 4090 (24 GB) o A100/H100 son holgadas para bfloat16.
- Cabe en GPU de consumo: sí, previsiblemente en GPUs con 8 GB o más en bfloat16; en cuantizaciones menores no se dispone de datos.
- Opciones de despliegue: el ejemplo oficial usa transformers con trust_remote_code=True, attn_implementation="sdpa" y un parche manual de scaled_dot_product_attention con máscara block-causal. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El esquema requiere múltiples pasos de desruido por bloque y, en el ejemplo, sin caché, lo que incrementa el coste por bloque frente a decodificación autorregresiva estándar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion-lfm3-1.7b | 1.978.796.800 | no disponible | Block diffusion (bloques de 16) | lfm-open-license-v1.0 | Hugging Face |
| LiquidAI/LFM2-1.7B (base) | 1.7B (aprox.) | no disponible | Híbrida autorregresiva (conv 1D + GQA) | lfm-open-license-v1.0 | Hugging Face |
| Modelos de difusión de texto de escala similar | no disponible | no disponible | Difusión / block diffusion | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Requiere código personalizado y un parche manual de la atención SDPA con máscara block-causal; no funciona con model.generate() estándar, lo que complica su integración en pipelines existentes.
- El ejemplo de inferencia no usa caché (use_cache=False) y ejecuta hasta 16 pasos de desruido por bloque, con impacto previsible en latencia y coste computacional.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; el ajuste con datasets de instrucciones abiertos puede heredar sesgos de esas fuentes.
- Riesgo de alucinación no cuantificado; no hay benchmarks publicados que permitan estimarlo.
- Longitud de contexto no especificada, lo que limita la planificación de despliegues con ventanas largas.
- El ajuste está fuertemente orientado al japonés; el rendimiento en español, alemán y francés puede ser inferior al de modelos entrenados específicamente en esos idiomas.
- Licencia lfm-open-license-v1.0: es una licencia "other" derivada de Liquid AI con términos propios; es imprescindible revisar el archivo LICENSE y el enlace oficial antes de cualquier uso comercial.
- Repositorio sin descargas ni likes y creado y actualizado el mismo día (2026-11-14), lo que sugiere ausencia de validación comunitaria.
- No se documentan cuantizaciones disponibles (GGUF, AWQ, GPTQ), lo que restringe opciones de despliegue ligero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/summerAIO/diffusion-lfm3-1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM2-1.7B
- Licencia LFM de Liquid AI: https://www.liquid.ai/lfm-license
- Dataset OpenAssistant/oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset CohereForAI/aya_dataset: https://huggingface.co/datasets/CohereForAI/aya_dataset
- Dataset kunishou/databricks-dolly-15k-ja: https://huggingface.co/datasets/kunishou/databricks-dolly-15k-ja
- Dataset llm-jp/oasst1-21k-ja: https://huggingface.co/datasets/llm-jp/oasst1-21k-ja
