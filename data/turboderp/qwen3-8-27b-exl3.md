# turboderp/Qwen3.8-27B-exl3

## Resumen

`turboderp/Qwen3.8-27B-exl3` es una colección de cuantizaciones EXL3 del modelo base `Qwen/Qwen3.8-27B`, publicada por turboderp (autor de ExLlamaV2/ExLlamaV3). No se trata de un modelo nuevo, sino de una distribución de pesos comprimidos en formato EXL3 diseñada para ejecutarse con el motor de inferencia ExLlamaV3 sobre GPUs de consumo. El objetivo es reducir el peso en VRAM del modelo original de 27B parámetros hasta niveles que permitan su despliegue en tarjetas de 24 GB o incluso menos, manteniendo la mayor fidelidad posible respecto al modelo en precisión completa.

El repositorio incluye múltiples niveles de cuantización, desde 1,40 bits por peso (bpw) hasta 6,00 bpw, en varias generaciones de calibración: "plain quants", "self-calibrated" (SC) y la más reciente "self-calibrated fractional-K + YAQA" (SCP), esta última con torre de visión cuantizada a 6 bpw. La existencia de variantes tan agresivas (por debajo de 2 bpw) es relevante porque permite probar modelos de 27B en hardware muy limitado, a costa de una degradación que el autor documenta mediante trazas de calibración y evaluación (KLD, perplejidad) publicadas en el propio repositorio.

La licencia declarada es Apache 2.0, heredada del modelo base. El repo ocupa 450,5 GB en total (suma de todas las ramas de cuantización) y acumula más de 5.000 descargas y 212 likes en el momento de la consulta. No se dispone de información sobre arquitectura interna, contexto o idiomas del modelo base en la documentación proporcionada; esta ficha se limita a lo que consta en la model card del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; el repo solo distribuye cuantizaciones EXL3) |
| Parametros totales | 27B (según denominación del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 en 1,40, 1,60, 1,75, 1,80, 2,00, 2,20, 2,50, 3,00, 3,50, 4,00, 5,00 y 6,00 bpw; variantes con torre de visión cuantizada (sufijo V) y sin ella |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (ramas Git independientes por nivel de cuantización) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado por turboderp, sino pesos cuantizados del modelo base `Qwen/Qwen3.8-27B`. La técnica empleada es EXL3, el formato de cuantización de ExLlamaV3, que combina cuantización de bloques con un esquema de calibración para minimizar la divergencia respecto a los pesos originales. El autor distingue tres familias de cuantizaciones: las "plain" (sin calibración específica), las "self-calibrated" (SC) y las más recientes "self-calibrated fractional-K + YAQA" (SCP), que introducen mejoras en el esquema de cuantización y en la calibración.

Para cada familia se publican trazas de calibración (`cal_trace.md`, `cal_trace.json`, `cal_trace.safetensors`) y trazas de evaluación (`qbench_prompts_gen.*` para las plain y `qbench_prompts_div.*` para las SCP), lo que permite reproducir y auditar el proceso. Las gráficas incluidas en la model card muestran KLD (divergencia KL) y perplejidad frente al consumo de VRAM para cada nivel de bpw. En las variantes SCP, la torre de visión se cuantiza a 6 bpw de forma fija, independientemente del bpw del resto del modelo, y las variantes con sufijo V incorporan torre de visión cuantizada, requiriendo ExLlamaV3 v1.4.4 o superior para funcionar correctamente. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Qwen3.8-27B (no documentados en detalle en este repo).
- Procesamiento de imágenes: las variantes con torre de visión (sufijo V y todas las SCP) incluyen el componente visual cuantizado, por lo que conservan capacidad multimodal si el modelo base la tiene.
- Ejecución en GPUs de consumo gracias a los niveles de cuantización bajos (desde 1,40 bpw).
- Compatibilidad con ExLlamaV3 como motor de inferencia; no se documenta soporte para otros runners (llama.cpp, vLLM, TGI) en la model card.
- No se documentan en la información disponible capacidades específicas de tool calling, agentes, thinking mode ni multilingüismo del modelo base.

## Casos de uso

- Despliegue local en GPUs de 24 GB: usar las ramas de 3,00 o 4,00 bpw permite cargar un modelo de 27B en una RTX 4090 o similar, dejando margen para el contexto y el KV cache.
- Experimentación en GPUs de 12-16 GB: las ramas de 1,75-2,20 bpw SCP permiten probar el modelo en tarjetas de gama media, aceptando una degradación medible vía KLD.
- Evaluación comparativa de cuantizaciones: las trazas de calibración y evaluación publicadas permiten reproducir los experimentos del autor y comparar KLD/perplejidad entre niveles de bpw antes de elegir uno para producción.
- Prototipado multimodal en local: las variantes con torre de visión cuantizada (V o SCP) permiten probar tareas de imagen-texto sin necesidad de una GPU de datacenter.
- Servicio de inferencia con ExLlamaV3: integrable en un servidor OpenAI-compatible de ExLlamaV3 para aplicaciones de chat o generación de texto con latencia baja en hardware de consumo.
- Investigación sobre cuantización extrema: las ramas de 1,40-1,60 bpw sirven como caso de estudio del límite práctico de compresión de un modelo de 27B y de su impacto en la calidad.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Lo que sí incluye son gráficas de KLD y perplejidad frente a VRAM para cada nivel de cuantización, generadas a partir de las trazas de evaluación `qbench_prompts_gen` (plain) y `qbench_prompts_div` (SCP). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: proporcional al bpw elegido; a 4,00 bpw el peso ronda los 13,5 GB, a 3,00 bpw unos 10 GB, a 2,00 bpw unos 7 GB y a 1,40 bpw unos 5 GB (cálculo teórico a partir de 27B parámetros; el consumo real incluye overhead de ExLlamaV3, KV cache y activaciones).
- GPU recomendadas: RTX 4090/3090 (24 GB) para 4,00-6,00 bpw con contexto amplio; RTX 4080/4070 Ti (12-16 GB) para 2,00-3,00 bpw; GPUs de 8-12 GB para 1,40-1,75 bpw.
- Cabe en GPU de consumo: sí, en todos los niveles salvo quizá los 6,00 bpw con contexto muy largo en tarjetas de 24 GB.
- Opciones de despliegue: ExLlamaV3 (requerido; v1.4.4 o superior para variantes con torre de visión cuantizada). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| turboderp/Qwen3.8-27B-exl3 | 27B | no disponible | EXL3 (1,40-6,00 bpw) | Apache 2.0 | Cuantización de Qwen3.8-27B para ExLlamaV3 |
| Qwen/Qwen3.8-27B | 27B | no disponible | safetensors (BF16/FP16) | Apache 2.0 | Modelo base original |
| Otras cuantizaciones GGUF de Qwen3.8-27B | 27B | no disponible | GGUF | Apache 2.0 | Compatibles con llama.cpp/Ollama, no con ExLlamaV3 |

No se dispone de información sobre otros cuantizadores EXL3 del mismo modelo base ni de benchmarks comparativos entre ellos en la documentación proporcionada.

## Limitaciones y advertencias

- Las cuantizaciones por debajo de 2 bpw implican una degradación de calidad medible; el autor la documenta vía KLD y perplejidad, pero no cuantifica el impacto en tareas concretas.
- Las variantes con torre de visión cuantizada (sufijo V y todas las SCP) requieren ExLlamaV3 v1.4.4 o superior; versiones anteriores pueden producir resultados incorrectos.
- El formato EXL3 solo es compatible con ExLlamaV3; no es portable a llama.cpp, Ollama, vLLM ni TGI.
- La licencia Apache 2.0 se hereda del modelo base; conviene verificar los términos del modelo original para uso comercial.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación específicos en la información disponible; aplican los del modelo base Qwen3.8-27B.
- El repo ocupa 450,5 GB en total; clonar todas las ramas requiere espacio en disco considerable. Conviene descargar solo la rama del bpw deseado.
- No se han publicado resultados de benchmarks estándar en la información disponible; la evaluación se limita a métricas de cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/turboderp/Qwen3.8-27B-exl3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Traza de calibración (md): https://huggingface.co/turboderp/Qwen3.8-27B-exl3/blob/main/cal_trace.md
- Traza de calibración (JSON): https://huggingface.co/turboderp/Qwen3.8-27B-exl3/blob/main/cal_trace.json
- Traza de calibración (safetensors): https://huggingface.co/turboderp/Qwen3.8-27B-exl3/blob/main/cal_trace.safetensors
- Traza de evaluación SCP (md): https://huggingface.co/turboderp/Qwen3.8-27B-exl3/blob/main/qbench_prompts_div.md
- Traza de evaluación SCP (JSON): https://huggingface.co/turboderp/Qwen3.8-27B-exl3/blob/main/qbench_prompts_div.json
- Traza de evaluación plain (md): https://huggingface.co/turboderp/Qwen3.8-27B-exl3/blob/main/qbench_prompts_gen.md
- Traza de evaluación plain (JSON): https://huggingface.co/turboderp/Qwen3.8-27B-exl3/blob/main/qbench_prompts_gen.json
