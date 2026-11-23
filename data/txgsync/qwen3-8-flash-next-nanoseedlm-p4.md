# txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P4

## Resumen

Qwen3.8-Flash-Next-NanoSeedLM-P4 es una cuantización de investigación del modelo Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el usuario txgsync. El modelo base es un transformer de tipo mixture-of-experts (MoE) con arquitectura experimental `qwen4_exp`, y esta variante concreta sustituye los pesos de los expertos enrutados por semillas de un registro de desplazamiento con realimentación lineal (LFSR), técnica denominada SeedLM. Los pesos densos se mantienen en 4 bits. El resultado ocupa aproximadamente 68 GB de pesos de expertos (unos 4,5 bits por peso) y 74 GB de memoria residente, lo que permite ejecutar un modelo de casi 97 000 millones de parámetros totales en un Mac con 128 GB de memoria unificada.

El problema que resuelve es el de la compresión extrema de modelos MoE de gran tamaño para hardware de consumo, manteniendo los expertos en RAM y cacheando dinámicamente en GPU o en memoria unificada los que están en uso. La variante P4 prioriza la fidelidad al modelo original dentro de la familia de packs con semillas: su divergencia KL frente al BF16 es de 0,169 tal como se distribuye, y de 0,0408 si se usan pesos densos de 8 bits en lugar de los 4 bits que trae.

Es relevante ahora porque es una vista previa de investigación (research preview) que explora una alternativa a la cuantización tradicional basada en trellis (TCQ) mediante aritmética entera sobre semillas, con runtimes específicos para Apple Silicon (mlx-vlm, oMLX) y para CUDA en Linux y Windows a través de los motores NanoSeedLM. No es un modelo pensado para producción directa, sino para experimentación con técnicas de compresión y despliegue en hardware limitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE experimental (`qwen4_exp`), pesos de expertos codificados como semillas LFSR (SeedLM) |
| Parámetros totales | 96 952 835 987 (≈96,95 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos a 4,5 bits (semillas P4); pesos densos a 4 bits; tabla PLE n-gram en Q8_0 (Unsloth) o 4 bits |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (`license: other`) |
| Formato de pesos | safetensors + `custom_code` (MLX); librería `mlx` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con capas de mezcla de expertos. Esta variante no reentrena el modelo: parte de los pesos del modelo base y recodifica los pesos de los expertos enrutados (120,8 B de pesos según la model card) como semillas de un LFSR, de modo que cada peso se reconstruye en tiempo de inferencia mediante aritmética entera a partir de unos pocos bits almacenados, sin codebook. Los pesos densos se guardan en 4 bits. La tabla PLE n-gram permanece en disco y la caché de páginas mantiene las filas que lee cada sesión.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo RLHF o DPO, ya que esta ficha cubre únicamente la cuantización. La innovación técnica destacable es el esquema SeedLM aplicado a expertos MoE, comparado en la propia model card con la cuantización trellis (TCQ): con pesos densos de 8 bits, TCQ4 alcanza KL 0,0398 a 4,125 bits, P4 0,0408 a 4,5 bits y P3 0,0600 a 4,0 bits. Los pesos densos de 4 bits que trae P4 son responsables de la mayor parte de su KL de 0,169; con densos de 8 bits bajaría a 0,0408.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `image-text-to-text`).
- Procesamiento de imagen y texto combinados (image-text-to-text).
- Razonamiento y generación de código heredados del modelo base Qwen3.8-Flash-Next, si bien no se documentan evaluaciones específicas en esta variante.
- Ejecución en mlx-vlm con Trust Remote Code y en oMLX (requiere el parche jundot/omlx#5112).
- Ejecución en los motores NanoSeedLM con CUDA (Linux y Windows) y Metal (macOS).
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en compresión de modelos MoE: comparar el esquema de semillas LFSR (P4) frente a la cuantización trellis (TCQ4) midiendo la KL frente a BF16 en ventanas de 2.048 tokens de wikitext-2, tal como documenta el autor.
- Despliegue local en Mac de 128 GB: ejecutar un modelo de ~97 B parámetros totales en memoria unificada con mlx-vlm u oMLX, manteniendo los expertos en RAM y cacheando los activos.
- Prototipado de asistentes conversacionales multimodales: el pipeline image-text-to-text permite probar interacciones que combinan imagen y texto en entornos de desarrollo sobre Apple Silicon.
- Evaluación de runtimes: validar el comportamiento de los motores NanoSeedLM (Metal en macOS, CUDA en Linux y Windows) frente a mlx-vlm y oMLX con el mismo pack de pesos.
- Experimentación con caché de expertos en GPU: en PC con GPU de 24 GB o más y 96-128 GB de RAM, usar P4 para estudiar el equilibrio entre bits por experto y calidad, sabiendo que TCQ4 ofrece menor KL.
- Reproducción de estudios sobre decodificación y latencia: medir tokens por segundo en distintas configuraciones (por ejemplo, la model card reporta 27 tokens/s en una RTX 4080 limitada a 12 GB con TCQ3 frente a 44 tokens/s con 16 GB, y ~15 % más lentitud de TCQ4 frente a P3 en un M4 Max).
- Docencia y demostraciones de técnicas de cuantización: ilustrar cómo unos pocos bits por peso, reconstruidos por aritmética entera, permiten alojar modelos de gran tamaño en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona métricas de fidelidad de cuantización (KL frente a BF16 en llama.cpp, sobre 64 ventanas de 2.048 tokens de wikitext-2, con tabla PLE Q8_0 de Unsloth):

| Pack | Bits por experto | Memoria (GB) | KL tal como se distribuye | KL con densos de 8 bits |
|---|---|---|---|---|
| TCQ4 | 4,125 | 70 | 0,0415 | 0,0398 |
| TCQ3-D4 | 3,458 | 60 | 0,0638 | no disponible |
| TCQ3 | 3,125 | 55 | 0,0778 | no disponible |
| P4 (esta ficha) | 4,500 | 74 | 0,169 | 0,0408 |
| P3 | 4,000 | 66 | 0,182 | 0,0600 |

Datos adicionales de rendimiento reportados por el autor: en una RTX 4080 limitada a 12 GB, TCQ3 decodifica a 27 tokens/s frente a 44 tokens/s con los 16 GB completos; en un M4 Max, TCQ4 decodifica aproximadamente un 15 % más lento que P3. No se han probado PC con 64 GB de RAM.

## Requisitos de hardware

- VRAM/RAM: P4 requiere unos 74 GB de pesos residentes (68,0 GB de expertos más pesos densos de 4 bits); la tabla PLE n-gram permanece en disco y se apoya en la caché de páginas.
- Memoria mínima práctica: 96 GB de RAM en PC (el autor no ha probado configuraciones de 64 GB) y 128 GB de memoria unificada en Mac para este pack; menos de 64 GB de RAM no es viable porque los expertos deben caber en RAM.
- GPU recomendadas: en PC, GPU de 24 GB o más con 96-128 GB de RAM (el autor recomienda TCQ4 para menor KL); en Mac, 128 GB (el autor recomienda TCQ4 o P3 según prioridad de calidad o velocidad).
- GPU de consumo: cabe en un Mac con 128 GB de memoria unificada; en PC, una RTX 4080 de 16 GB puede cachear expertos, con menor rendimiento si se limita a 12 GB.
- Despliegue: motores NanoSeedLM (CUDA en Linux y Windows, Metal en macOS), mlx-vlm con Trust Remote Code y oMLX con el parche jundot/omlx#5112. vLLM, llama.cpp, Ollama y TGI no se mencionan como runtimes compatibles con este pack.
- Latencia y throughput: datos parciales del autor (27 tokens/s en RTX 4080 a 12 GB con TCQ3; 44 tokens/s a 16 GB; TCQ4 ~15 % más lento que P3 en M4 Max). Para P4 no se reportan cifras específicas de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KL / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| P4 (esta ficha) | 96,95 B totales | no disponible | KL 0,169 (4,5 bits, densos 4 bits); 0,0408 con densos 8 bits | qwen-community-1.0 | Hugging Face, runtimes NanoSeedLM, mlx-vlm, oMLX |
| TCQ4 (misma familia) | 96,95 B totales | no disponible | KL 0,0415 (4,125 bits, densos 8 bits); ~15 % más lento que P3 en M4 Max | qwen-community-1.0 | Hugging Face, mismos runtimes |
| P3 (misma familia) | 96,95 B totales | no disponible | KL 0,182 (4,0 bits, densos 4 bits); ~20 % más rápido que TCQ4 en Mac | qwen-community-1.0 | Hugging Face, mismos runtimes |
| Qwen3.8-Flash-Next (base) | no disponible | no disponible | referencia BF16 | qwen-community-1.0 | Hugging Face (Qwen) |

No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Es una vista previa de investigación: el propio autor la etiqueta como research preview y no como versión lista para producción.
- Calidad de cuantización: el KL de 0,169 tal como se distribuye es el más alto de la familia junto con P3 (0,182); la mayor parte proviene de los pesos densos de 4 bits. Para menor KL, el autor recomienda TCQ4.
- Requisitos de memoria elevados: necesita al menos 96 GB de RAM en PC y 128 GB en Mac; por debajo de 64 GB de RAM no es viable.
- Compatibilidad limitada de runtimes: requiere los motores NanoSeedLM, mlx-vlm con Trust Remote Code u oMLX con un parche específico (jundot/omlx#5112); no se documenta soporte en vLLM, llama.cpp, Ollama o TGI.
- Idiomas soportados no documentados en esta variante; no se puede confirmar cobertura multilingüe.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; deben evaluarse contra el modelo base.
- Licencia: qwen-community-1.0 (`license: other`), con términos adicionales en el enlace de licencia del modelo base; conviene revisarlos antes de uso comercial.
- Rendimiento dependiente del hardware: el throughput cae significativamente cuando la GPU cachea menos expertos (27 frente a 44 tokens/s en el caso reportado).

## Enlaces

- Hugging Face: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pack TCQ4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ4
- Pack TCQ3-D4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3-D4
- Pack TCQ3: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3
- Pack P3: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P3
- Motores NanoSeedLM: https://github.com/mbarnson/NanoSeedLM
- Release de motores: https://github.com/mbarnson/NanoSeedLM/releases
- Parche oMLX: https://github.com/jundot/omlx/pull/5112
- Paper SeedLM: https://arxiv.org/abs/2410.10714
- Paper adicional: https://arxiv.org/abs/2406.11235
