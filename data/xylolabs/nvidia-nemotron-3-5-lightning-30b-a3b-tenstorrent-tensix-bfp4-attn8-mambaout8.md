# Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tenstorrent-Tensix-BFP4-Attn8-MambaOut8

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tenstorrent-Tensix-BFP4-Attn8-MambaOut8 es una exportación cuantizada del modelo `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` realizada por Xylolabs, pensada específicamente para ejecutarse sobre NPUs Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer híbrido de tipo `nemotron_h` con 32.913.266.240 parámetros totales y arquitectura Mixture-of-Experts (MoE) con aproximadamente 3.000 millones de parámetros activos por token, según indica el sufijo A3B del nombre.

La contribución de esta exportación no es el modelo en sí, sino el pipeline de cuantización: las capas lineales se han convertido a formatos de bloque de coma flotante propietarios de TT-NN, `bfloat4_b` (BFP4, 4,5 bits por peso) y `bfloat8_b` (BFP8, 8,5 bits por peso), de modo que el hardware Tensix puede empaquetarlas directamente sin recodificar. El resultado ocupa 18,98 GB de memoria de dispositivo para los pesos del modelo de lenguaje, con una media de 4,81 bits por peso, lo que permite servir un modelo de 33.000 millones de parámetros en una sola NPU Tensix.

Es relevante ahora porque demuestra una vía práctica de despliegue de modelos MoE grandes fuera del ecosistema GPU de NVIDIA, con un esquema de cuantización mixta que preserva las proyecciones críticas de atención en BFP8 mientras comprime agresivamente los expertos enrutados a BFP4. La licencia OpenMDW-1.1 del modelo base se mantiene en esta exportación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `nemotron_h` con bloques Mamba-2 y atención (6 capas de atención, 23 capas Mamba-2), Mixture-of-Experts enrutado |
| Parámetros totales | 32.913.266.240 (32,9 B) |
| Parámetros activos | aproximadamente 3 B (según el sufijo A3B del nombre; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) y BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso); media de 4,81 bits/peso; GPTQ con búsqueda de exponente por bloque para BFP4, round-to-nearest para BFP8 |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (65,8 GB de repositorio); valores almacenados como bf16 sobre la rejilla BFP4/BFP8 para empaquetado directo en TT-NN |

## Arquitectura y entrenamiento

El modelo base `nemotron_h` es un transformer híbrido que combina capas de atención con capas Mamba-2 (modelo de espacio de estados). Según la tabla de formatos de la model card, la red tiene 6 capas con proyecciones de atención q, k, v y o, y 23 capas con proyecciones Mamba-2 de entrada (`in_proj`) y salida (`out_proj`), además de expertos enrutados y un experto compartido con proyecciones up y down en cada una de esas 23 capas. La presencia de un sesgo de corrección de puntuación de enrutamiento (`e_score_correction_bias`) en float32, tanto en el backbone como en el módulo `mtp` (multi-token prediction), confirma un esquema MoE con enrutamiento por expertos y un cabezal auxiliar de predicción multi-token.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible: no se detallan el número de tokens, la composición del corpus ni si hubo etapas de RLHF o DPO. Lo que sí está documentado es el proceso de cuantización de esta exportación: las matrices BFP4 se cuantizaron con GPTQ y una búsqueda de exponente por bloque, calibradas con 65.536 tokens de WikiText-2 y de Wikipedia en coreano; las matrices BFP8 se cuantizaron con round-to-nearest. Los expertos enrutados comparten una única matriz Hessiana por capa para las proyecciones up, mientras que cada experto calcula la suya para la proyección down, recurriendo a round-to-nearest cuando dispone de pocos tokens de calibración. Solo se cuantizó y evaluó el modelo de lenguaje; el módulo `mtp` se mantiene en bf16 y float32 sin cambios.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`) y soporte de conversaciones multi-turno.
- Razonamiento y generación de código: el modelo base es un modelo de lenguaje generalista de 32,9 B de parámetros; no se documentan evaluaciones específicas de código en la información disponible.
- Capacidades multilingües declaradas para inglés, español, francés, alemán, italiano y japonés.
- Predicción multi-token mediante el módulo `mtp` incluido en el checkpoint, orientado a decodificación especulativa.
- Ejecución nativa en NPUs Tensix (Wormhole, Blackhole) a través de TT-NN, con pesos preempaquetados en BFP4/BFP8.
- Soporte de tool calling y de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de inferencia en hardware Tenstorrent: el caso principal de esta exportación es servir un modelo de 32,9 B en una NPU Wormhole o Blackhole con 18,98 GB de pesos en DRAM de dispositivo, evitando la dependencia de GPUs NVIDIA en el centro de datos.
- Servicio de chat multilingüe: con soporte declarado de seis idiomas (en, es, fr, de, it, ja), puede atender asistencia conversacional en aplicaciones europeas o japonesas usando la plantilla de chat incluida.
- Evaluación de cuantización extrema en producción: útil para equipos que quieran medir la degradación real de un MoE de 33 B al pasar de BF16 a una media de 4,81 bits por peso, con atención preservada en BFP8 y expertos en BFP4.
- Decodificación especulativa: el módulo `mtp` en bf16/float32 permite implementar decodificación especulativa sobre el backbone cuantizado para reducir la latencia por token en generación larga.
- Prototipado de pipelines de cuantización GPTQ para TT-NN: el repositorio `tensix-bfp-gptq` y los scripts `pack_tensix.py` y `verify_grid.py` sirven como referencia para exportar otros modelos al formato BFP4/BFP8 de Tensix.
- Investigación en eficiencia energética: como alternativa a GPU para servir modelos grandes, permite comparar rendimiento por vatio en NPUs Tensix frente a soluciones equivalentes en A100 o H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card se interrumpe en la sección de evaluación, por lo que no constan métricas de MMLU, HumanEval, GSM8K ni comparaciones de perplejidad frente al modelo base en BF16.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 18,98 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers de ejecución.
- Hardware objetivo: NPUs Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole, mediante TT-NN (`ttnn.bfloat4_b`, `ttnn.bfloat8_b`).
- No está pensado para GPUs convencionales: el formato de pesos está empaquetado para la rejilla BFP de Tensix. La carga con Transformers 5.23.0 y `NemotronHForCausalLM` es posible en bf16, pero requiere aproximadamente 66 GB de memoria, lo que exige GPUs de 80 GB (A100, H100) o configuraciones multi-GPU con `device_map="auto"`.
- Despliegue: TT-NN para Tensix; Transformers 5.23.0 para inspección o ejecución en GPU. `tt-transformers` y `tt-forge` no se han probado con este checkpoint según la model card.
- Latencia y throughput: no disponible en la información proporcionada.
- Validación: las 6.004 matrices cuantizadas pasaron la comprobación de rejilla; el empaquetado TT-NN se verificó en `ttsim` sobre las capas 0 y 1 (260 matrices) con coincidencia exacta de valores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este modelo (Xylolabs, Nemotron 3.5 Lightning 30B-A3B Tensix) | 32,9 B totales, ~3 B activos | no disponible | BFP4/BFP8 mixto, 4,81 bits/peso | OpenMDW-1.1 | NPU Tensix (Wormhole, Blackhole) |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 32,9 B totales, ~3 B activos | no disponible | BF16 | OpenMDW-1.1 | GPU (A100, H100) |
| Alternativas de tamaño similar en formato GGUF/AWQ | no disponible | no disponible | no disponible | no disponible | GPU y CPU |

La comparación directa con otras exportaciones cuantizadas del mismo modelo base no está documentada en la información disponible. La diferencia principal frente al checkpoint BF16 original es el tamaño en memoria (18,98 GB frente a aproximadamente 66 GB) y el hardware de destino.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; el módulo `mtp` permanece en bf16 y float32, por lo que su comportamiento no está cubierto por la validación de la cuantización.
- La model card no incluye resultados de evaluación de calidad tras la cuantización, de modo que la degradación frente al BF16 original no está cuantificada públicamente.
- La decodificación especulativa con `mtp` y la integración con `tt-transformers` y `tt-forge` no se han probado con este checkpoint.
- El formato de pesos está atado a TT-NN: fuera de Tensix, la carga requiere Transformers 5.23.0 con `NemotronHForCausalLM` y memoria suficiente para bf16.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo, toxicidad o tasas de alucinación en la información disponible; al ser un modelo generalista de 33 B, deben aplicarse las precauciones habituales en producción.
- Idiomas: aunque se declaran seis idiomas, no se especifica el nivel de competencia por idioma ni el volumen de datos de entrenamiento en cada uno.
- Licencia OpenMDW-1.1: conviene revisar los términos completos del archivo LICENSE del repositorio antes de un uso comercial; la información disponible no detalla restricciones adicionales.
- El repositorio tiene 92 descargas y ningún "me gusta" en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tenstorrent-Tensix-BFP4-Attn8-MambaOut8
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tenstorrent-Tensix-BFP4-Attn8-MambaOut8/blob/main/LICENSE
