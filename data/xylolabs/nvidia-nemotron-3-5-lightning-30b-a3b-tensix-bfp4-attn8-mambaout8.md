# Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tensix-BFP4-Attn8-MambaOut8

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tensix-BFP4-Attn8-MambaOut8 es una cuantización del modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, publicada por Xylolabs y orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo, sino de un checkpoint derivado en el que las capas lineales del transformer híbrido se han reescrito sobre la rejilla numérica de bloque flotante que consumen las unidades Tensix a través de TT-NN, de modo que los pesos se empaquetan sin conversión adicional en el hardware.

El modelo base es un transformer híbrido tipo `nemotron_h` con 32.913.266.240 parámetros totales y activación dispersa (MoE, designación A3B), que combina capas de atención con capas Mamba-2. La cuantización reduce el peso medio a 4,81 bits por parámetro y el tamaño empaquetado a 18,98 GB, frente a los 63,16 GB del BF16 original, manteniendo una divergencia media de KL de 0,0503 respecto al modelo de referencia y un 90,10 % de coincidencia top-1 sobre 8.188 posiciones de texto en inglés y coreano.

Su relevancia es doble: por un lado, demuestra que es posible llevar un modelo MoE híbrido de más de 30 000 millones de parámetros a hardware de inferencia no-GPU con pérdida de calidad acotada; por otro, publica el pipeline de cuantización (tensix-bfp-gptq) y las comprobaciones de rejilla, lo que permite reproducir y auditar el proceso. El checkpoint está pensado para ejecutarse con TT-NN en Tensix; la ruta estándar de transformers funciona, pero no explota el formato BFP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `nemotron_h` (atención + Mamba-2) con mezcla de expertos (MoE) |
| Parametros totales | 32.913.266.240 |
| Parametros activos | no disponible (la designación A3B sugiere ~3B activos, sin cifra confirmada en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) y BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso); media de 4,81 bits/peso; GPTQ con búsqueda de exponente por bloque para BFP4, round-to-nearest para BFP8 |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (bf16 con valores ya alineados a la rejilla BFP4/BFP8) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base: un transformer híbrido con 6 capas de atención y 23 capas Mamba-2, más proyecciones de expertos enrutados y un experto compartido en cada una de esas 23 capas. La cuantización se aplica de forma selectiva: las proyecciones q, k, v y o de atención pasan a BFP8; la proyección de entrada de Mamba-2, las proyecciones up/down de expertos enrutados y del experto compartido pasan a BFP4; la proyección de salida de Mamba-2 se mantiene en BFP8. El embedding, la cabeza LM, las normas y el resto de tensores permanecen en bf16, igual que el módulo `mtp`, que no se modifica.

El proceso de cuantización BFP4 emplea GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones up de los expertos enrutados comparten una única matriz de Hessian por capa; las proyecciones down usan una Hessian propia por experto o recurren a round-to-nearest cuando el experto vio pocos tokens de calibración. Las matrices BFP8 se obtuvieron por redondeo al más cercano. Se verificaron las 6.004 matrices cuantizadas contra la rejilla y se comprobó el empaquetado TT-NN sobre las capas 0 y 1 (260 matrices) en ttsim, con coincidencia exacta de todos los valores. No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`), orientada a diálogo multi-turno.
- Razonamiento y respuesta a preguntas en seis idiomas: inglés, español, francés, alemán, italiano y japonés.
- Mezcla de expertos con 32.900 millones de parámetros totales, lo que permite capacidad de conocimiento alta con un coste de cómputo por token inferior al de un modelo denso equivalente (la cifra exacta de parámetros activos no está disponible).
- Arquitectura híbrida atención + Mamba-2, adecuada para secuencias largas por el coste lineal de las capas de estado.
- Módulo `mtp` (multi-token prediction) conservado en bf16 en el checkpoint, aunque la documentación no detalla su uso en inferencia.
- Compatibilidad con endpoints (`endpoints_compatible`) según los tags del repositorio.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Despliegue en appliances con NPU Tenstorrent: el checkpoint está empaquetado para Wormhole y Blackhole y se carga directamente con TT-NN, lo que permite servir el modelo en hardware no-GPU con 18,98 GB de pesos y sin paso de conversión en tiempo de carga.
- Evaluación de cuantización de bloque flotante: el repositorio incluye `verify_grid.py` y `pack_tensix.py`, de modo que un equipo de infraestructura puede auditar matriz a matriz que los pesos empaquetados coinciden con los originales antes de poner el modelo en producción.
- Asistente conversacional multilingüe en inglés, español, francés, alemán, italiano y japonés: el modelo cubre seis idiomas declarados y admite plantilla de chat, lo que sirve para atención al cliente o asistentes internos en organizaciones europeas.
- Investigación sobre modelos híbridos atención-Mamba: al conservar la topología exacta del base con solo las proyecciones lineales recuantizadas, es un punto de comparación controlado para medir el impacto de BFP4 frente a BFP8 en capas Mamba-2 y en expertos.
- Prototipado de inferencia de bajo consumo en clústeres Tensix: con 4,81 bits por peso y 18,98 GB empaquetados, el modelo cabe en configuraciones de memoria más ajustadas que el BF16 de 63,16 GB y permite experimentar con despliegues de menor huella.
- Base para pipelines de cuantización reproducibles: el código `tensix-bfp-gptq` y el fichero `quant4.json` documentan el formato de cada proyección, lo que facilita aplicar el mismo proceso a otros modelos MoE híbridos.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base) | 16 | 63,16 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP4/BFP8) | 4,81 | 18,985 | 0,0503 | 90,10 | 30 de 33 | 0 |
| Q4_K_M (llama.cpp) | 6,18 | 25,431 | 0,0346 | 92,13 | 32 de 33 | 0 |

La evaluación de KL y top-1 cubre 8.188 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano) en formato de texto plano. Las 33 respuestas corresponden a prompts cortos con comprobación automática. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 18,98 GB de pesos empaquetados en BFP4/BFP8; el modelo se carga con `dtype="bfloat16"` en transformers, por lo que en esa ruta la huella efectiva se acerca a los 63 GB del base si no se empaqueta en TT-NN.
- GPU: no se especifican GPU recomendadas; el checkpoint está diseñado para NPU Tensix (Wormhole, Blackhole), no para CUDA.
- Consumer GPU: no hay datos de ejecución en GPUs de consumo; la ruta prevista es TT-NN sobre Tensix.
- Despliegue: TT-NN (`ttnn`) para el formato BFP; transformers para carga y generación estándar. La model card indica explícitamente que tt-transformers y tt-forge no se han probado con este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Xylolabs) | 32,9B totales | no disponible | BFP4/BFP8 para Tensix, 4,81 bits/peso | openmdw-1.1 | Hugging Face, repo de 65,8 GB |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 32,9B totales | no disponible | BF16 | openmdw-1.1 | Hugging Face (modelo base) |
| Q4_K_M (llama.cpp) del mismo base | 32,9B totales | no disponible | Q4_K_M, 6,18 bits/peso | openmdw-1.1 | Derivado de llama.cpp |

La comparación relevante es frente al base en BF16 y frente a la cuantización Q4_K_M: este checkpoint ocupa menos (18,985 GB frente a 25,431 GB) pero pierde algo más de calidad (KL 0,0503 frente a 0,0346; top-1 90,10 % frente a 92,13 %). No se dispone de comparación con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo se ha cuantizado y evaluado el modelo de lenguaje; no hay evaluación de otras modalidades ni del módulo `mtp`.
- La evaluación se limita a 8.188 posiciones de inglés y coreano y a 33 prompts cortos con comprobación automática; no sustituye a una batería de benchmarks estándar.
- La ruta de transformers carga los pesos como bf16 y no aprovecha el formato BFP; sin TT-NN, el ahorro de memoria y el rendimiento esperado no se materializan.
- tt-transformers y tt-forge no se han ejecutado con este checkpoint, según la propia model card.
- La cuantización BFP4 introduce un error de KL de 0,0503 frente al BF16, superior al de Q4_K_M; en tareas sensibles a la precisión numérica conviene validar antes de desplegar.
- No hay información sobre sesgos, tasas de alucinación ni comportamiento en contextos largos en la documentación disponible.
- La licencia openmdw-1.1 debe revisarse antes de uso comercial; la información proporcionada no detalla sus términos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tensix-BFP4-Attn8-MambaOut8
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tensix-BFP4-Attn8-MambaOut8/blob/main/LICENSE
