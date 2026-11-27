# zephel01/Qwen3.8-Flash-Next-DGX-Spark-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen (Alibaba). La ficha que nos ocupa, sin embargo, no es el modelo original, sino una cuantización GGUF publicada por el usuario zephel01 bajo el identificador `zephel01/Qwen3.8-Flash-Next-DGX-Spark-GGUF`. Esta versión está específicamente optimizada para ejecutarse en una única unidad NVIDIA DGX Spark (arquitectura GB10, 128 GB de memoria unificada), un formato hardware de sobremesa orientado a inferencia local de modelos de gran tamano.

El modelo cuenta con 176.943.899.520 parámetros totales (aproximadamente 177.000 millones) y conserva los 512 expertos del modelo base sin poda. La cuantización es de tipo mixto: los expertos se distribuyen en IQ3_XXS (56% en bytes), IQ4_NL (42%) e IQ3_S (1%), con una media de 3,55 bits por peso, lo que equivale aproximadamente a un IQ3_M. El repositorio ocupa 86,9 GB y se distribuye en tres ficheros GGUF.

La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar un modelo MoE de casi 177.000 millones de parámetros en hardware local de gama alta (no en un clúster de GPUs), gracias a una combinación de cuantización agresiva, gestión del pool de expertos y lectura selectiva de la tabla de embeddings desde SSD. El autor reporta 55,8 tok/s en una DGX Spark real con el motor Abyss, y 47 tok/s con el drafter MTP activado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; arquitectura GGUF `qwen4exp` |
| Parametros totales | 176.943.899.520 (~177B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de despliegue con Abyss) |
| Tipos de cuantizacion | Mixta: IQ3_XXS (56%), IQ4_NL (42%), IQ3_S (1%); media 3,55 bits/peso |
| Idiomas soportados | Ingles (en), japones (ja) |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (3 shards, 86,9 GB totales) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-Flash-Next, un transformer con arquitectura Mixture of Experts de 512 expertos por capa. Esta ficha es una cuantización del mismo: los expertos se han recuantizado con LDLQ a partir de pesos en formato NVIDIA NVFP4, siguiendo el layout de unsloth UD-IQ3_XXS, con gate/up un paso por encima. Se conservan los 512 expertos completos (sin poda). La tabla de embeddings por capa ocupa 28,8 GB y se lee desde SSD fila a fila por token, lo que permite que el fichero completo quepa en la memoria unificada de 128 GB de la DGX Spark.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base, ya que la model card de esta cuantización no los detalla. La innovación técnica destacable es el pipeline de cuantización mixta por tipo de tensor (expertos en IQ3_XXS/IQ4_NL, resto en tipos superiores) y el soporte del motor Abyss para dimensionar automáticamente el pool de expertos y el tier de RAM a partir de un presupuesto de memoria, desactivando el carril de CPU cuando la GPU lee la misma memoria más rápido.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta a instrucciones, heredado del modelo base Qwen3.8-Flash-Next.
- Soporte de inglés y japonés (idiomas declarados en la model card).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Ejecución local en hardware de sobremesa de gama alta (DGX Spark / GB10).
- Decodificación especulativa mediante drafter MTP (runtime opcional que eleva el rendimiento de 31 a 47 tok/s según el autor).
- No se declaran capacidades de visión, audio, tool calling ni agentes en la información disponible.

## Casos de uso

- Inferencia local de un modelo de ~177B en una única DGX Spark: el fichero completo (86,9 GB) cabe en los 128 GB de memoria unificada, lo que permite ejecutar un MoE de gran escala sin clúster de GPUs ni servicios en la nube.
- Asistente conversacional en inglés o japonés con contexto de hasta 32.768 tokens: adecuado para sesiones multi-turno largas en las que se necesita mantener el hilo de la conversación sin truncamientos frecuentes.
- Procesamiento de documentación técnica en japonés: la cuantización reporta un KL de 0,176 en japonés (frente a 0,317 de la referencia UD-IQ3_XXS), lo que indica una degradación controlada en ese idioma respecto al modelo original.
- Despliegue en entornos con requisitos de soberanía del dato: al ejecutarse íntegramente en local sobre la DGX Spark, no hay envío de prompts a APIs externas, lo que encaja en escenarios con restricciones de confidencialidad.
- Laboratorio de evaluación de cuantizaciones: el repositorio incluye métricas de divergencia KL (0,083 en 10 secuencias en inglés) y comparativa con la referencia de unsloth, útil para investigar el impacto de la cuantización mixta en modelos MoE.
- Servicio de inferencia compatible con endpoints: el tag `endpoints_compatible` y el servidor `serve/server.py` de Abyss permiten exponer el modelo como API HTTP en el puerto configurado (8082 en el ejemplo), integrándolo en aplicaciones existentes.
- Prototipado de pipelines de decodificación especulativa: el soporte de drafter MTP en Abyss permite medir el impacto del speculative decoding en hardware GB10 con cargas reales.

## Benchmarks y rendimiento

| Metrica | Este fichero (86,9 GB) | unsloth UD-IQ3_XXS (referencia, 82,0 GB) |
|---|---|---|
| Expertos conservados | 512 (todos) | 512 (todos) |
| KL (10 secuencias, ingles) | 0,083 | 0,154 |
| KL (japones) | 0,176 | 0,317 |
| Velocidad en DGX Spark (Abyss) | 55,8 tok/s | no disponible |
| Velocidad con drafter MTP | 47 tok/s (desde 31 tok/s sin MTP) | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el fichero completo ocupa 86,9 GB; requiere los 128 GB de memoria unificada de una DGX Spark (GB10) para mantener todos los expertos residentes. La tabla de embeddings por capa (28,8 GB) se lee desde SSD fila a fila por token.
- GPU recomendada: NVIDIA DGX Spark (GB10, 128 GB de memoria unificada), plataforma para la que está específicamente optimizado este repositorio.
- Otras variantes del mismo autor para hardware menor: IQ2_M-12G32G (67,5 GB, 448 de 512 expertos, para GPU de 12 GB + 32 GB de RAM), IQ3_M-16G64G (86,9 GB, todos los expertos, para GPU de 16 GB + 64 GB de RAM) e IQ3_M-24G64G (93,7 GB, para GPU de 24 GB + 64 GB de RAM).
- Despliegue: motor Abyss (repositorio propio, compilado con CUDA 13 y arquitectura `121a`, flags `STRATA_ENABLE_CUDA=ON`, `STRATA_NATIVE_EXPERTS=ON`, `STRATA_IGPU_LANE=OFF`). También es compatible con llama.cpp (arquitectura `qwen4exp`, upstream `ac8e1694d` del 2026-10-29), aunque el autor no lo ha medido en la Spark.
- Throughput: 55,8 tok/s medidos en Abyss sobre una DGX Spark alquilada (5-7 de noviembre de 2026); 47 tok/s con el drafter MTP (frente a 31 tok/s sin él). Contexto máximo configurado en el ejemplo: 32.768 tokens, con prefill automático.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | ~177B | no disponible | safetensors | qwen-community-1.0 | Hugging Face (Qwen) |
| Este fichero (DGX Spark GGUF) | ~177B | 32.768 (config. ejemplo) | GGUF mixto, 86,9 GB | qwen-community-1.0 | Hugging Face (zephel01) |
| unsloth UD-IQ3_XXS (referencia) | ~177B | no disponible | GGUF, 82,0 GB | no disponible | no disponible en la informacion |
| IQ3_M-24G64G (mismo autor) | ~177B | no disponible | GGUF, 93,7 GB | qwen-community-1.0 | Hugging Face (zephel01) |

La comparativa se limita a variantes del mismo modelo base y a la referencia de cuantización citada por el autor, ya que no se dispone de datos de modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Estado BETA: las mediciones se realizaron en una DGX Spark alquilada entre el 5 y el 7 de noviembre de 2026; versiones posteriores de Abyss pueden cambiar la velocidad reportada.
- Idiomas limitados: solo se declaran inglés y japonés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Contexto limitado a 32.768 tokens en la configuración de ejemplo, muy por debajo de las ventanas de contexto de otros modelos contemporáneos.
- Calidad degradada respecto al modelo original: KL de 0,083 en inglés y 0,176 en japonés sobre 10 secuencias, aunque mejor que la referencia UD-IQ3_XXS (0,154 y 0,317).
- Dependencia de hardware específico: el rendimiento medido corresponde a una DGX Spark con Abyss; en otras plataformas o con llama.cpp no se ha validado la velocidad.
- Licencia `qwen-community-1.0`: es necesario revisar los términos del modelo base para uso comercial, ya que la model card no detalla restricciones adicionales.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones específicas de sesgo o robustez para esta cuantización.
- La lectura de la tabla de embeddings desde SSD introduce dependencia del rendimiento del almacenamiento local, que puede afectar a la latencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-DGX-Spark-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor Abyss: https://github.com/zephel01/Abyss
- Documentación de Abyss para DGX Spark: https://github.com/zephel01/Abyss/blob/main/docs/DGX-SPARK.md
- Variante 16G64G (mismos ficheros): https://huggingface.co/zephel01/Qwen3.8-Flash-Next-IQ3_M-16G64G-GGUF
- Variante 12G32G: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-E448-IQ2_M-12G32G-GGUF
- Variante 24G64G: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-IQ3_M-24G64G-GGUF
- Formulario para reportar resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Qwen3.8-Flash-Next+DGX-Spark+on+GB10
- llama.cpp (dependencia): https://github.com/ggml-org/llama.cpp
