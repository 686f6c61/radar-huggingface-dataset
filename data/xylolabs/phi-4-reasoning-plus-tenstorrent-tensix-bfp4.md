# Xylolabs/Phi-4-reasoning-plus-Tenstorrent-Tensix-BFP4

## Resumen

Phi-4-reasoning-plus-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo microsoft/Phi-4-reasoning-plus, publicada por Xylolabs, específicamente empaquetada para su ejecución en aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole) mediante el stack TT-Metal/TT-NN. No se trata de un modelo nuevo, sino de un checkpoint derivado cuyo objetivo es hacer viable el despliegue del Phi-4-reasoning-plus en hardware Tensix, donde los formatos de coma flotante por bloques (BFP4 y BFP8) son nativos y permiten reducir drásticamente el espacio en memoria y el ancho de banda.

El modelo base, Phi-4-reasoning-plus, es un transformer denso de aproximadamente 14.660 millones de parámetros desarrollado por Microsoft, orientado a tareas de razonamiento con un modo de "pensamiento" explícito (thinking block) antes de la respuesta final. Esta exportación conserva esa capacidad y mantiene la plantilla de chat original, pero sustituye las matrices del MLP por tensores en `bfloat4_b` y las de atención por `bfloat8_b`, dejando el resto de tensores (embeddings, LM head, normalizaciones) en bf16.

La relevancia de esta ficha radica en que demuestra un flujo de cuantización orientado a hardware específico (no a GPU convencional), con verificación de precisión mediante divergencia KL frente al modelo bf16 de referencia. El checkpoint empaquetado ocupa 11,03 GB, lo que lo hace atractivo para despliegues en NPU Tensix con memoria limitada, a costa de una ligera pérdida de fidelidad numérica respecto a cuantizaciones GGUF Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (layout LlamaForCausalLM, derivado de Phi-4-reasoning-plus) |
| Parametros totales | 14.659.507.200 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en matrices MLP; BFP8 (`bfloat8_b`) en matrices de atencion; bf16 en embeddings, LM head y normas |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (empaquetado para Tensix, 11,03 GB empaquetado; 29,3 GB de repo) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 40 capas con atención multi-cabeza estándar y bloques MLP con proyecciones gate, up y down. El checkpoint se presenta en layout Llama (`LlamaForCausalLM`): las matrices fusionadas q/k/v y gate-up del checkpoint original se han separado conservando los mismos valores. No se ha reentrenado ni ajustado el modelo; se trata exclusivamente de una cuantización post-entrenamiento del Phi-4-reasoning-plus de Microsoft.

La innovación técnica reside en el esquema de cuantización: las 40 capas del MLP usan `bfloat4_b` (4 bits por bloque con exponente compartido por bloque), cuantizadas con GPTQ y una búsqueda de exponente por bloque; las 40 capas de atención usan `bfloat8_b` mediante redondeo al más cercano. Los tensores cuantizados se almacenan como valores BF16 sobre su rejilla BFP, de modo que TT-NN los empaqueta sin alterar sus valores. El fichero `quant4.json` documenta el formato de cada proyección. Los 280 matrices del modelo pasan las comprobaciones de rejilla, empaquetado nativo TT-NN y empaquetado como BFP8, validadas con TT-NN 0.81.1 y el simulador Blackhole. No se dispone de información sobre el dataset de entrenamiento del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto con modo de razonamiento explícito: el modelo escribe un bloque de pensamiento antes de la respuesta final.
- Razonamiento multi-paso, matemáticas y problemas de lógica (heredado de Phi-4-reasoning-plus).
- Generación de código y asistencia en programación.
- Conversación multi-turno mediante plantilla de chat original de Microsoft.
- Muestreo recomendado por el autor del modelo base (temperatura 0.8, top-k 50, top-p 0.95) para obtener respuestas correctas; la decodificación greedy no cierra el bloque de pensamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Multilingüismo: limitado a inglés según la model card.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el checkpoint está empaquetado en formatos BFP nativos de Tensix, lo que permite ejecutar un modelo de 14,6B parámetros en 11,03 GB de memoria de dispositivo sin conversión adicional.
- Razonamiento asistido en entornos de borde con aceleradores Tensix: útil en escenarios donde no se dispone de GPU NVIDIA y se quiere aprovechar hardware Tenstorrent para tareas de análisis y resolución de problemas.
- Generación de código en pipelines internos: el modelo puede integrarse en flujos de revisión o generación de parches, siempre que el hardware destino sea Tensix o se use el checkpoint en bf16 sobre GPU.
- Investigación en cuantización: sirve como referencia reproducible para estudiar el impacto de BFP4/BFP8 en la calidad de un modelo de razonamiento, con métricas KL publicadas frente a bf16 y Q4_K_M.
- Evaluación de stacks TT-Metal/TT-NN: el modelo incluye scripts (`pack_tensix.py`, `verify_grid.py`) que permiten validar el empaquetado y la fidelidad numérica en nuevas versiones del runtime.
- Prototipado de asistentes conversacionales en inglés con razonamiento visible: la salida con bloque de pensamiento facilita la depuración de respuestas en entornos de investigación.
- Benchmarking de hardware: comparar latencia y throughput de un mismo modelo en Tensix frente a GPU mediante la referencia bf16 y la cuantización GGUF Q4_K_M.

## Benchmarks y rendimiento

| Referencia o exportación | KL media | Aciertos normales / 33 | Aciertos con thinking / 7 |
|---|---:|---:|---:|
| BF16 original | 0 | 33 | 6 |
| Esta exportación (BFP4 MLP / BFP8 atención) | 0,0211821047483 | 33 | 7 |
| Q4_K_M del mismo checkpoint original | 0,014722 | 33 | 7 |

La KL se midió sobre las 14.528 posiciones evaluadas de una referencia guardada de 16 secuencias en inglés y coreano, en forma cruda y de chat, con referencia IEEE explícita. El suelo numérico de llama.cpp en BF16 es 0,000231. Las respuestas se generaron con muestreo (temperatura 0,8, top-k 50, top-p 0,95, semilla 20261118, thinking activado, hasta 8.192 tokens nuevos). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint empaquetado ocupa 11,03 GB en formatos Tensix; en bf16 sobre GPU requiere aproximadamente 29,3 GB de pesos más overhead de activaciones y KV cache.
- GPU recomendadas para la variante bf16: A100 40/80 GB, H100, o GPUs consumer con 24 GB o más (RTX 3090/4090) usando cuantización adicional.
- ¿Cabe en GPU consumer? El checkpoint Tensix no está pensado para GPU; la variante bf16 no cabe en GPUs de 8-16 GB sin cuantizar. Para GPUs consumer se recomienda usar el modelo base con GGUF Q4_K_M.
- Opciones de despliegue: TT-NN/TT-Metal en NPU Tensix (Wormhole, Blackhole); transformers con `device_map="auto"` para la variante bf16; llama.cpp/TGI no aplican directamente al formato BFP empaquetado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este modelo (BFP4/BFP8 Tensix) | 14,66B | no disponible | BFP4 MLP / BFP8 atención | MIT | Tenstorrent Tensix |
| microsoft/Phi-4-reasoning-plus (bf16) | 14,66B | no disponible | bf16 | MIT | GPU / CPU |
| Phi-4-reasoning-plus GGUF Q4_K_M | 14,66B | no disponible | Q4_K_M | MIT | CPU / GPU consumer |
| Phi-4 (base, sin reasoning) | ~14,7B | no disponible | múltiples | MIT | GPU / CPU |

La comparación directa con otros modelos de razonamiento de tamaño similar (por ejemplo, Qwen3-14B o DeepSeek-R1-Distill-Qwen-14B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; el rendimiento en otros idiomas no está garantizado.
- La decodificación greedy no cierra el bloque de pensamiento, por lo que es obligatorio usar muestreo para obtener respuestas utilizables.
- Pérdida de fidelidad numérica: KL media de 0,0212 frente a 0,0147 de Q4_K_M, es decir, aproximadamente 1,44 veces peor que la cuantización GGUF de referencia.
- El checkpoint está empaquetado para Tensix; no es directamente utilizable en GPU sin cargarlo en bf16 con transformers, lo que anula la ventaja de tamaño.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la documentación.
- Sesgos conocidos del modelo base no documentados en esta ficha.
- Licencia MIT permite uso comercial, pero se recomienda revisar los términos del modelo base de Microsoft.
- La validación se realizó con TT-NN 0.81.1 y el simulador Blackhole; el comportamiento en hardware Wormhole real puede diferir.
- El repositorio tiene 141 descargas y 0 likes, lo que indica adopción muy limitada y poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Phi-4-reasoning-plus-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/microsoft/Phi-4-reasoning-plus
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Phi-4-reasoning-plus-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
