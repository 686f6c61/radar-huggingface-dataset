# steampunque/Llama-3.3-70B-Instruct-MP-GGUF

## Resumen

`steampunque/Llama-3.3-70B-Instruct-MP-GGUF` es una cuantización GGUF de precisión mixta por capas del modelo `meta-llama/Llama-3.3-70B-Instruct` de Meta. No se trata de un modelo nuevo, sino de una redistribución optimizada del original en formato GGUF, orientada a inferencia local y en hardware con memoria limitada. El autor aplica distintos niveles de cuantización K-quant a cada una de las 80 capas del transformer, reservando mayor precisión para las capas de embedding, las capas finales y los tensores de salida, y comprimiendo más agresivamente las capas intermedias.

El modelo base es un transformer decoder-only denso de 70.553.706.560 parámetros (unos 70,6 mil millones), con licencia Llama 3.3 y capacidades conversacionales e instrucciones. Esta versión GGUF ofrece tres variantes: `Q3_S_H`, `Q3_K_H` y `Q4_K_H`, con tamaños efectivos de pesos de aproximadamente 32,6 GB, 33,4 GB y 37,5 GB respectivamente, según la tabla del autor. La variante `Q4_K_H` es la recomendada por el propio autor por su estabilidad, con una perplejidad de 4,5.

La relevancia actual de esta ficha radica en que permite ejecutar un modelo de 70B en configuraciones de hardware más modestas que las requeridas por los pesos en FP16 (unos 141 GB), manteniendo un equilibrio entre tamaño y calidad. El autor declara haber validado las tres cuantizaciones con un conjunto de prompts de evaluación, obteniendo un 100 % de aciertos en todas ellas, aunque advierte de comportamientos erráticos ocasionales en las variantes Q3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Llama 3.3 70B Instruct) |
| Parametros totales | 70.553.706.560 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF K-quants mixtos por capa: Q3_S_H, Q3_K_H, Q4_K_H (con componentes Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K y embeddings Q4_K, output Q5_K/Q6_K) |
| Idiomas soportados | no disponible |
| Licencia | llama3.3 |
| Formato de pesos | GGUF |
| Tamano del repo | 140,6 GB |
| Tamano efectivo de pesos (Q3_S_H) | ~32,6e9 parametros equivalentes, PPL 4,8 |
| Tamano efectivo de pesos (Q3_K_H) | ~33,4e9 parametros equivalentes, PPL 4,8 |
| Tamano efectivo de pesos (Q4_K_H) | ~37,5e9 parametros equivalentes, PPL 4,5 |
| Modelo base | meta-llama/Llama-3.3-70B-Instruct |
| Descargas | 681 |
| Likes | 0 |

## Arquitectura y entrenamiento

Esta ficha no describe un entrenamiento nuevo: es una cuantizacion del modelo `meta-llama/Llama-3.3-70B-Instruct`, que es un transformer decoder-only denso de aproximadamente 70,6 mil millones de parametros. El autor no aporta en la model card informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF/DPO) del modelo base; esos datos corresponden a la model card oficial de Meta, no incluida aqui.

La innovacion tecnica de esta publicacion es la estrategia de cuantizacion mixta por capas. En lugar de aplicar un unico tipo de quant a todo el modelo, se asigna un nivel distinto a cada una de las 80 capas (indices 0 a 79). Las capas iniciales y finales reciben cuantizaciones mas precisas (Q4_K_M, Q4_K_S, Q5_K, Q6_K), mientras que las capas intermedias se comprimen con Q3_K_S, Q3_K_M o Q3_K_L. Ademas, se fijan tipos especificos para los tensores de embedding de tokens (Q4_K) y para el tensor de salida (Q5_K o Q6_K). El autor indica que todas las variantes usan quants K (no IQ) para evitar el procesamiento lento en CPU o en GPUs antiguas. Tambien senala que no fue posible emplear Q2_K ni Q2_K_S, ya que cualquier uso de Q2, incluso en capas profundas, provocaba incoherencia o perdida notable de conocimiento.

## Capacidades

- Generacion de texto conversacional e instrucciones, heredadas del modelo base Llama 3.3 70B Instruct.
- Razonamiento y conocimiento general, preservado segun el autor mediante un conjunto de prompts de evaluacion curado (las tres variantes obtienen un 100 % de aciertos en dicho conjunto).
- Capacidad de procesar audio (.mp3 y .wav) y texto, y generar texto, si se combina con los adaptadores Ultravox `fixie-ai/ultravox-v0_5-llama-3_3-70b` o `ultravox-v0_6-llama-3_3-70b` y sus ficheros mmproj correspondientes.
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags del repositorio).
- Capacidades de tool calling, function calling y agentes multi-paso: no disponibles en la informacion proporcionada para esta cuantizacion concreta (dependen del modelo base, pero no se documentan aqui).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no disponible.

## Casos de uso

- Despliegue local de un asistente conversacional de 70B en estaciones de trabajo con 40-48 GB de VRAM o en configuraciones con offload a CPU: la variante `Q4_K_H` (~37,5e9 parametros equivalentes) reduce el peso frente a FP16 y permite mantener calidad conversacional con perplejidad 4,5.
- Prototipado e investigacion en entornos sin acceso a GPUs de 80 GB: las variantes Q3 permiten cargar el modelo en GPUs de 24-32 GB combinando capas en GPU y CPU mediante llama.cpp.
- Evaluacion comparativa de estrategias de cuantizacion: el repositorio documenta la asignacion capa por capa y las perplejidades, lo que sirve como referencia para estudiar el impacto de la precision mixta en modelos de 70B.
- Procesamiento de audio y texto en una sola pila: combinando esta cuantizacion con los adaptadores Ultravox y sus mmproj, se puede construir un asistente que transcriba y razone sobre audio (.mp3, .wav) en local.
- Generacion de texto en pipelines por lotes con llama.cpp: el formato GGUF y el uso exclusivo de quants K facilitan la ejecucion en CPU y en GPUs antiguas sin las penalizaciones de los quants IQ.
- Experimentacion con modelos de gran tamano en docencia: permite a estudiantes ejecutar un 70B en hardware asequible y comparar el comportamiento de Q3 frente a Q4 en tareas de razonamiento.

## Benchmarks y rendimiento

El autor solo publica perplejidad (PPL) y una evaluacion cualitativa sobre un conjunto de prompts propio. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Quant | Tamano (parametros equivalentes) | PPL | Comentario del autor |
|---|---|---|---|
| Q3_S_H | 32,6e9 | 4,8 | Q3_K dominante con embedding Q4_K |
| Q3_K_H | 33,4e9 | 4,8 | Igual estrategia que Q3_S_H |
| Q3_K_M | 34,3e9 | 4,9 | Falla partes del conjunto de evaluacion |
| Q4_K_H | 37,5e9 | 4,5 | Mejor quant disponible |
| IQ4_XS | 38,3e9 | 4,4 | Embedding Q4_K, output Q6_K |

El autor indica que las tres variantes publicadas (Q3_S_H, Q3_K_H, Q4_K_H) obtienen un 100 % en su conjunto de prompts de evaluacion, pero que las Q3 a veces dan una respuesta incorrecta y luego se autocorrigen, o anaden comentarios sin relacion. La Q4_K_H se describe como "rock solid".

## Requisitos de hardware

- VRAM estimada: aproximadamente 33-38 GB para los pesos de las variantes Q3 y Q4_K_H, mas overhead de contexto KV cache. Para contexto largo, el consumo adicional puede ser significativo.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU. En GPUs consumer, una RTX 4090 (24 GB) no puede alojar el modelo completo en VRAM; requiere offload parcial a CPU.
- Cabe en consumer GPU: no de forma completa en ninguna GPU consumer actual de 24 GB o menos. Si es viable con offload parcial (por ejemplo, RTX 4090 + RAM del sistema) usando llama.cpp.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), y herramientas compatibles con GGUF como Ollama o interfaces basadas en llama.cpp. vLLM y TGI no se mencionan en la informacion disponible para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| steampunque/Llama-3.3-70B-Instruct-MP-GGUF (Q4_K_H) | 70,6B (pesos ~37,5e9 equivalentes) | no disponible | GGUF | llama3.3 | Cuantizacion mixta por capas, PPL 4,5 |
| meta-llama/Llama-3.3-70B-Instruct | 70,6B | no disponible | safetensors | llama3.3 | Modelo base en precision original |
| steampunque IQ4_XS (misma familia) | 70,6B (pesos ~38,3e9 equivalentes) | no disponible | GGUF | llama3.3 | PPL 4,4, mayor tamano que Q4_K_H |
| Q3_K_M (misma familia) | 70,6B (pesos ~34,3e9 equivalentes) | no disponible | GGUF | llama3.3 | PPL 4,9, falla partes del conjunto de evaluacion |

No se dispone de datos de benchmarks estandar para comparar el rendimiento real frente a otras cuantizaciones o modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Las variantes Q3 presentan comportamiento erratico ocasional segun el autor: respuestas incorrectas seguidas de autocorreccion o comentarios sin relacion con la pregunta.
- No fue posible usar Q2_K ni Q2_K_S: cualquier nivel Q2 provocaba incoherencia o perdida notable de conocimiento.
- La cuantizacion introduce degradacion respecto al modelo base en FP16/BF16; la perplejidad de las variantes Q3 (4,8) y Q4 (4,5) debe interpretarse en ese contexto.
- Riesgo de alucinacion inherente al modelo base Llama 3.3 70B Instruct; la cuantizacion puede agravarlo en las variantes de menor precision.
- Restricciones de licencia: licencia Llama 3.3, que impone condiciones de uso comercial y de redistribucion definidas por Meta. Es necesario revisar los terminos de la licencia Llama 3.3 antes de un uso en produccion.
- Idiomas soportados no documentados en esta ficha; deben consultarse en la model card del modelo base.
- Longitud de contexto no documentada en esta ficha; debe consultarse en la model card del modelo base.
- El repositorio tiene 0 likes y 681 descargas, lo que indica una validacion comunitaria limitada.
- El soporte de audio requiere adaptadores Ultravox externos y ficheros mmproj adicionales; no es una capacidad nativa de esta cuantizacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/steampunque/Llama-3.3-70B-Instruct-MP-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Adaptador Ultravox v0.5 (mmproj): https://huggingface.co/steampunque/ultravox-v0_5-llama-3_3-70b-Hybrid-GGUF
- Adaptador Ultravox v0.6 (mmproj): https://huggingface.co/steampunque/ultravox-v0_6-llama-3_3-70b-MP-GGUF
- Repositorio llama.cpp (documentacion mtmd): https://github.com/ggml-org/llama.cpp
