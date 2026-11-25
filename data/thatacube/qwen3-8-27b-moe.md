# thatacube/Qwen3.8-27B-MoE

## Resumen

Qwen3.8-27B-MoE es una "moeificación" del modelo denso Qwen/Qwen3.8-27B realizada por el usuario independiente thatacube. No se trata de un modelo entrenado desde cero, sino de una reordenación de los pesos del modelo base: las capas feed-forward densas se dividen en 32 expertos de 512 neuronas más un experto compartido de 1.024, con un router que activa 19 de los 32 expertos por token. El resultado mantiene los 27.792.410.352 parámetros totales del original, pero reduce los parámetros no de embedding usados por token de 24,4B a 17,8B.

La motivación es puramente de eficiencia en inferencia: al activar menos pesos por token, el modelo genera entre 1,21× y 1,68× más rápido que el denso original según el hardware, manteniendo una calidad cercana. En una RTX 5060 de 8 GB con parte del modelo en RAM pasa de 3,2-4,1 tok/s a 5,4-6,1 tok/s, y en 2× Tesla T4 con el modelo completo en GPU pasa de 13,5 a 16,3 tok/s. Incluye además una cabeza de predicción multi-token (MTP) que funciona como modelo borrador para decodificación especulativa en llama.cpp.

El modelo conserva el encoder de visión del original (aunque no fue evaluado), los modos thinking y non-thinking con la misma plantilla de chat, y se distribuye bajo licencia Apache 2.0. Es relevante para quienes quieran ejecutar un modelo de ~27B en hardware de consumo limitado obteniendo más throughput sin reentrenar nada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (moeificación de Qwen3.8-27B); FFN con 32 expertos × 512 neuronas + experto compartido de 1.024, 19 de 32 activos por token |
| Parametros totales | 27.792.410.352 (27,3B, mismos pesos que el denso, reagrupados) |
| Parametros activos | 17,8B no de embedding por token (frente a 24,4B del denso) |
| Longitud de contexto | Hasta 256k tokens (medido en llama.cpp con KV cache q8_0); contexto nativo del base no especificado en la información disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q4_K_M, IQ4_XS, mac16 (expertos IQ2_XXS, resto IQ3_XXS); bf16 en safetensors |
| Idiomas soportados | Inglés y multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, ~54 GB) y GGUF (repo separado) |

## Arquitectura y entrenamiento

El modelo parte de los pesos del denso Qwen3.8-27B y aplica una transformación de moeificación: cada capa feed-forward densa se descompone en 32 expertos de 512 neuronas más un experto compartido de 1.024 neuronas, con un router que selecciona 19 de los 32 expertos por token. No hay entrenamiento desde cero: se ajusta un LoRA que posteriormente se fusiona en los pesos y se redondea a bf16. Frente al modelo exacto sin redondear, esa fusión produce KL 0,0044 y top-1 del 98,0% sobre 4.096 tokens reservados, aproximadamente el doble del ruido bf16 del propio original (KL 0,0022 / 99,0%) y menos del 2% de la distancia al original.

El autor lista un conjunto amplio de datasets en la model card (fineweb-edu, fineweb-2, FineWeb2-HQ, finepdfs, finemath, pg19, stackv2_edu_filtered, commitpackft, WildChat-4.8M, oasst2, aya_dataset, HelpSteer3, OpenMathReasoning, NuminaMath-1.5, Nemotron-Science-v1, OpenCodeReasoning, self-oss-instruct-sc2-exec-filter-50k, Nemotron-Agentic-v1, Nemotron-Post-Training-Dataset-v1, Toucan-1.5M, When2Call, Nemotron-Instruction-Following-Chat-v1, Nemotron-SFT-Multilingual-v1, smoltalk2, OpenThoughts3-1.2M), pero la información disponible no especifica el número de tokens ni la composición exacta del entrenamiento. La innovación técnica destacable es la propia moeificación con router, la conservación de la cabeza MTP (moeificada y "curada") que sirve como draft model en llama.cpp, y la preservación del encoder de visión del original. Los benchmarks publicados se ejecutaron sobre el modelo exacto, no sobre el bf16 redondeado del repo.

## Capacidades

- Generación de texto conversacional y razonamiento en dos modos: thinking (temperatura 1,0, top_p 0,95, top_k 20) y non-thinking (temperatura 0,7, top_p 0,8, top_k 20, presence_penalty 1,5), con la misma plantilla de chat que el base.
- Razonamiento matemático y científico, apoyado en los datasets de entrenamiento NuminaMath-1.5, OpenMathReasoning y Nemotron-Science-v1.
- Generación y razonamiento sobre código, con datos de stackv2_edu_filtered, commitpackft, OpenCodeReasoning y self-oss-instruct-sc2-exec-filter-50k.
- Tool calling y function calling, con un 95,8% de llamadas a herramientas válidas según la model card (frente al 93,8% del denso).
- Capacidades agénticas y razonamiento multi-paso, respaldadas por Nemotron-Agentic-v1, Toucan-1.5M y When2Call.
- Capacidades multilingües (etiqueta "multilingual" y dataset aya_dataset), aunque el idioma principal declarado es el inglés.
- Visión: mantiene el encoder de imagen del modelo base, aunque el autor indica explícitamente que no fue evaluado.
- Decodificación especulativa mediante su propia cabeza MTP (67% de borradores aceptados en 2× T4, 1,08× más rápido).
- Compatible con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Inferencia local en GPU de consumo: con una RTX 5060 de 8 GB y 32 GB de RAM, el GGUF Q4_K_M permite generar a 5,4-6,1 tok/s frente a 3,2-4,1 tok/s del denso, lo que hace viable un asistente local de ~27B en hardware modesto.
- Servicio de chat multi-turno con contexto largo: soporta hasta 256k tokens en llama.cpp con KV cache q8_0, adecuado para asistentes que arrastran historiales extensos o documentos completos.
- Automatización de agentes con tool calling: el 95,8% de llamadas válidas y los datasets agénticos del entrenamiento lo hacen apto para pipelines donde el modelo debe invocar APIs de forma fiable.
- Generación de código en producción: puede integrarse en flujos de CI/CD o asistentes de IDE, con la ventaja de que el GGUF Q4_K_M (16,85 GB) cabe entero en una GPU de 24 GB o en 2× 16 GB a 16,3 tok/s.
- Procesamiento por lotes en servidores con T4: en 2× Tesla T4 el modelo completo en GPU ofrece 16,3 tok/s con contexto 0 y 16,11 tok/s con contexto 4.096, útil para despliegues con hardware heredado.
- Razonamiento matemático y científico asistido: los modos thinking y los datasets de matemáticas y ciencia permiten usarlo para resolver problemas paso a paso en entornos de investigación.
- Despliegue en Mac con memoria unificada: el archivo mac16 (9,35 GB) es la única opción para 16 GB de RAM unificada, aunque con calidad claramente inferior (KL 0,217 / top-1 80,3% frente a Q8_0) y sin probar en hardware Apple.

## Benchmarks y rendimiento

| Metrica | Qwen3.8-27B (denso) | Qwen3.8-27B-MoE |
|---|---|---|
| MMLU | 83,5 | 78,6 |
| GSM8K | 79,9 | 83,6 |
| Llamadas a herramientas válidas | 93,8% | 95,8% |

| Rendimiento (tokens/s) | Denso Q4_K_M | MoE Q4_K_M | Aceleración |
|---|---|---|---|
| RTX 5060 8 GB + RAM, contexto 0 | 3,72 | 5,47 | 1,47× |
| RTX 5060 8 GB + RAM, contexto 4.096 | 3,22 | 5,40 | 1,68× |
| RTX 5060 8 GB + RAM, mejor split manual | 4,06 | 6,08 | 1,50× |
| 2× T4, modelo completo en GPU, contexto 0 | 13,48 | 16,34 | 1,21× |
| 2× T4, contexto 4.096 | 13,20 | 16,11 | 1,22× |
| 2× T4, contexto 128k (KV q8_0) | 3,27 | 3,46 | 1,06× |
| 2× T4, contexto 256k (KV q8_0) | 1,45 | 1,65 | 1,14× |

| GGUF | Tamano | KL / top-1 vs Q8_0 |
|---|---:|---:|
| Q8_0 | 29,1 GB | referencia |
| Q4_K_M (recomendado) | 16,85 GB | 0,031 / 93,3% |
| IQ4_XS | 15,35 GB | 0,033 / 92,4% |
| mac16 | 9,35 GB | 0,217 / 80,3% |

Mediciones con llama-bench tg128 (generación de 128 tokens) en llama.cpp b12110. El procesamiento de prompt está a la par del modelo denso según el autor. Los benchmarks de calidad se ejecutaron sobre el modelo exacto (sin redondear a bf16).

## Requisitos de hardware

- VRAM estimada: Q8_0 requiere 29,1 GB; Q4_K_M 16,85 GB; IQ4_XS 15,35 GB; mac16 9,35 GB.
- GPU recomendadas: 2× Tesla T4 (16 GB cada una) para el modelo completo en GPU; RTX 5060 de 8 GB con offload a RAM; GPU de 24 GB o 2× 16 GB para Q4_K_M completo.
- Cabe en GPU de consumo: sí, en RTX 5060 de 8 GB con Q4_K_M o IQ4_XS y 32 GB de RAM del sistema (5,4-6,1 tok/s medidos); en 16 GB de VRAM se recomienda IQ4_XS (14,3 GiB de pesos, con algunas capas de expertos en RAM si se usa contexto real, no medido).
- Mac: 16 GB de memoria unificada solo admite el archivo mac16 (calidad reducida, no probado en Apple); 24 GB admite IQ4_XS (no probado en Apple); 32 GB o más admite Q4_K_M o Q8_0.
- Opciones de despliegue: llama.cpp b12110 o superior (llama-server con `-hf`, `--fit on` o `-ngl 99 -ncmoe N`, con N=60 óptimo en RTX 5060 8 GB), transformers y vLLM para los pesos bf16.
- Latencia y throughput: ver tabla de rendimiento; destacan 16,3 tok/s en 2× T4 con contexto 0 y 5,4-6,1 tok/s en RTX 5060 8 GB con RAM. La decodificación especulativa con la cabeza MTP añade 1,08× en 2× T4 con 67% de borradores aceptados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-MoE | 27,3B totales, 17,8B activos | hasta 256k en llama.cpp | MMLU 78,6 / GSM8K 83,6 / tool calls 95,8% | Apache 2.0 | HF (safetensors + GGUF) |
| Qwen3.8-27B (denso, base) | 27,3B, 24,4B activos | hasta 256k en llama.cpp | MMLU 83,5 / GSM8K 79,9 / tool calls 93,8% | Apache 2.0 | HF (Qwen) |

No se dispone en la información proporcionada de datos de otros modelos comparables de la misma categoría (mismo tamaño o misma tarea), por lo que la comparativa se limita al modelo base del que deriva. Cualquier comparación con alternativas externas requeriría benchmarks propios no publicados aquí.

## Limitaciones y advertencias

- La moeificación no es un reentrenamiento: el modelo conserva los sesgos y el conocimiento del base Qwen3.8-27B, sin que la información disponible detalle sesgos específicos.
- Riesgo de alucinación inherente a un modelo de lenguaje de este tamaño; no se han publicado evaluaciones de factualidad en la información disponible.
- Caída de calidad respecto al denso en MMLU (83,5 → 78,6), aunque mejora en GSM8K (79,9 → 83,6) y en llamadas a herramientas válidas (93,8% → 95,8%); el perfil de calidad no es uniforme.
- El redondeo a bf16 tras fusionar el LoRA introduce un KL de 0,0044 y top-1 del 98,0% frente al modelo exacto, el doble del ruido bf16 del original; los benchmarks publicados corresponden al modelo exacto, no al bf16 del repo.
- El archivo mac16 tiene una degradación de calidad notable (KL 0,217 / top-1 80,3% frente a Q8_0) y no ha sido probado en hardware Apple.
- El encoder de visión se conserva pero no fue evaluado, por lo que no hay garantías sobre su rendimiento.
- El idioma principal es el inglés; el soporte multilingüe está declarado pero no cuantificado.
- Requiere llama.cpp b12110 o superior para las funcionalidades descritas (MTP, `--fit on`); versiones anteriores pueden no funcionar correctamente.
- El repositorio está marcado como borrador (DRAFT, 2026-11-25) y la lista final de archivos y tamaños podría cambiar.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thatacube/Qwen3.8-27B-MoE
- GGUF cuantizados: https://huggingface.co/thatacube/Qwen3.8-27B-MoE-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
