# zephel01/Qwen3.8-Flash-Next-DGX-Spark-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen (Alibaba). Esta ficha documenta la cuantización GGUF publicada por el usuario zephel01 bajo el identificador `zephel01/Qwen3.8-Flash-Next-DGX-Spark-GGUF`, pensada específicamente para ejecutarse en una única unidad NVIDIA DGX Spark (GB10, 128 GB de memoria unificada). El modelo base cuenta con 176.943.899.520 parámetros totales según los datos de safetensors, y esta versión cuantizada ocupa 86,9 GB repartidos en tres shards.

La relevancia de esta publicación radica en que demuestra la viabilidad de ejecutar un modelo MoE de gran tamaño en hardware de escritorio de gama alta con memoria unificada, manteniendo los 512 expertos sin poda. El autor reporta 55,8 tok/s de decodificación en una DGX Spark real, con un decodificador especulativo (MTP drafter) que eleva la velocidad de 31 a 47 tok/s en sus pruebas. La cuantización es de tipo mixto (IQ3_XXS al 56%, IQ4_NL al 42%, IQ3_S al 1% por bytes), con 3,55 bits por peso de media.

El modelo está etiquetado como BETA y fue medido en una DGX Spark alquilada entre el 5 y el 7 de noviembre de 2026. La licencia es `qwen-community-1.0`, lo que condiciona el uso comercial. Los idiomas declarados en la model card son inglés y japonés, aunque el modelo base podría soportar más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; arquitectura GGUF `qwen4exp` |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de despliegue del autor) |
| Tipos de cuantizacion | Mixta: IQ3_XXS (56%), IQ4_NL (42%), IQ3_S (1%) por bytes; 3,55 bits/peso de media; re-cuantizada con LDLQ desde pesos NVFP4 |
| Idiomas soportados | Inglés y japonés (declarados en la model card) |
| Licencia | `qwen-community-1.0` (etiqueta `other`) |
| Formato de pesos | GGUF (3 shards, 86,9 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con 512 expertos por capa, según se desprende de la model card del cuantizador ("All 512 experts are kept"). La arquitectura GGUF declarada es `qwen4exp`, lo que sugiere una variante de la familia Qwen con capas de expertos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card proporcionada corresponde a la cuantización, no al modelo original.

La innovación técnica destacable de esta publicación es el proceso de cuantización: los expertos se re-cuantizaron con LDLQ a partir de pesos en formato NVFP4 de NVIDIA, siguiendo el layout de unsloth UD-IQ3_XXS con gate/up un paso por encima. El autor reporta una divergencia KL de 0,083 (10 secuencias) frente al modelo NVFP4 de referencia, y de 0,176 en japonés, mejorando los 0,154 y 0,317 respectivamente del UD-IQ3_XXS estándar. Además, el motor Abyss implementa un decodificador especulativo MTP que acelera la inferencia.

## Capacidades

- Generación de texto conversacional y de propósito general, según el pipeline `text-generation`.
- Razonamiento y generación de código: la evaluación KL incluye secuencias de código, inglés, chino y japonés.
- Capacidades multilingües limitadas a inglés y japonés según la model card.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- Ejecución local en hardware de memoria unificada con el motor Abyss o llama.cpp.

## Casos de uso

- Inferencia local en DGX Spark: el modelo está empaquetado para caber íntegramente en los 128 GB de memoria unificada de una GB10, con la tabla de embeddings de 28,8 GB por capa leída desde SSD unas pocas filas por token. Es adecuado para investigadores que quieran ejecutar un MoE de 176.000 millones de parámetros en una sola máquina sin clúster.
- Asistencia conversacional en inglés y japonés: el modelo declara soporte para ambos idiomas y la cuantización preserva calidad aceptable en japonés (KL de 0,176), por lo que sirve para chatbots multi-turno en esos mercados.
- Generación de código en local: la evaluación KL incluye secuencias de código, y el modelo puede integrarse en flujos de desarrollo que requieran privacidad de datos sin depender de APIs externas.
- Prototipado de agentes con contexto medio: con 32.768 tokens de contexto configurados, permite mantener conversaciones y documentos de longitud moderada en un solo prompt.
- Investigación en cuantización: el repositorio documenta el proceso LDLQ, los tipos mixtos y las métricas KL, lo que lo convierte en material de referencia para estudiar el impacto de cuantizaciones agresivas en MoE.
- Despliegue con decodificación especulativa: el MTP drafter incluido en Abyss permite medir y comparar el rendimiento de técnicas de aceleración en hardware GB10.
- Evaluación comparativa de motores: al ser compatible con llama.cpp (arquitectura `qwen4exp`) y con Abyss, sirve para comparar el rendimiento de ambos motores sobre los mismos pesos.

## Benchmarks y rendimiento

| Metrica | Este archivo (86,9 GB) | UD-IQ3_XXS referencia (82,0 GB) |
|---|---|---|
| KL (10 secuencias) | 0,083 | 0,154 |
| KL en japonés | 0,176 | 0,317 |
| Expertos conservados | 512 de 512 | 512 de 512 |
| Decodificación tras prompt de 4K (tok/s) | 55,8 (con MTP drafter) | no disponible |
| Decodificación sin MTP drafter (tok/s) | 31 | no disponible |
| Decodificación con MTP drafter (tok/s) | 47 | no disponible |

Los datos de velocidad fueron medidos en Abyss sobre una DGX Spark real (GB10, 128 GB) entre el 5 y el 7 de noviembre de 2026. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 86,9 GB de pesos más overhead del motor; el autor indica que cabe en los 128 GB de memoria unificada de una DGX Spark.
- GPU recomendadas: NVIDIA DGX Spark (GB10, 128 GB de memoria unificada) es el objetivo principal. Para las otras variantes del mismo autor se indican configuraciones de 12 GB GPU + 32 GB RAM, 16 GB GPU + 64 GB RAM y 24 GB GPU + 64 GB RAM.
- ¿Cabe en GPU consumer? No en una GPU consumer convencional por sí sola; requiere el esquema de memoria unificada o el reparto GPU/RAM de las variantes reducidas.
- Opciones de despliegue: motor Abyss (recomendado, con soporte CUDA y decodificación especulativa MTP) y llama.cpp (arquitectura `qwen4exp`, no medido en Spark).
- Latencia y throughput: 55,8 tok/s de decodificación tras un prompt de 4K con MTP drafter; 31 tok/s sin él y 47 tok/s con él según las cifras reportadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (esta cuantización) | 176.943.899.520 | 32.768 (configurado) | qwen-community-1.0 | GGUF, 86,9 GB | 512 expertos, 3,55 bits/peso, KL 0,083 |
| Qwen3.8-Flash-Next UD-IQ3_XXS (unsloth) | 176.943.899.520 | no disponible | qwen-community-1.0 | GGUF, 82,0 GB | Referencia de calidad, KL 0,154 |
| Qwen3.8-Flash-Next E448-IQ2_M (mismo autor) | 176.943.899.520 (448 expertos) | no disponible | qwen-community-1.0 | GGUF, 67,5 GB | Para 12 GB GPU + 32 GB RAM |
| Qwen3.8-Flash-Next IQ3_M-24G64G (mismo autor) | 176.943.899.520 | no disponible | qwen-community-1.0 | GGUF, 93,7 GB | Mayor calidad, 24 GB GPU + 64 GB RAM |

No se dispone de datos de benchmarks estándar para comparar el rendimiento absoluto con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Estado BETA: las mediciones se realizaron en una DGX Spark alquilada durante tres días y pueden variar con nuevas versiones de Abyss.
- La cuantización mixta a 3,55 bits/peso implica pérdida de calidad respecto al modelo original; la KL de 0,083 es baja pero no nula, y en japonés asciende a 0,176.
- Idiomas limitados a inglés y japonés según la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Licencia `qwen-community-1.0`: es necesario revisar sus términos antes de cualquier uso comercial, ya que no es una licencia permisiva estándar.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad.
- El contexto configurado en el ejemplo es de 32.768 tokens; no se especifica la longitud máxima real del modelo base.
- El despliegue requiere compilar Abyss con CUDA 13 y una versión concreta de llama.cpp (`3cf03257f219afbe7334045ff7c6a06ac68c627d`), lo que añade complejidad operativa.
- No se han publicado datos sobre sesgos, tool calling ni capacidades de agente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-DGX-Spark-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor Abyss: https://github.com/zephel01/Abyss
- Documentación de Abyss para DGX Spark: https://github.com/zephel01/Abyss/blob/main/docs/DGX-SPARK.md
- Variante 16G64G (mismos archivos): https://huggingface.co/zephel01/Qwen3.8-Flash-Next-IQ3_M-16G64G-GGUF
- Variante E448-IQ2_M-12G32G: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-E448-IQ2_M-12G32G-GGUF
- Variante IQ3_M-24G64G: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-IQ3_M-24G64G-GGUF
- Formulario para reportar resultados: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Qwen3.8-Flash-Next+DGX-Spark+on+GB10
