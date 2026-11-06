# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch12

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch12` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_llama2-7b`, que a su vez parte de Llama 2 7B. Lo publica el usuario `unl-reset` y su proposito no es el uso general, sino servir como artefacto experimental dentro de la linea de trabajo TOFU (Task of Fictitious Unlearning), un benchmark academico para medir el desaprendizaje selectivo (machine unlearning) en modelos de lenguaje. El nombre codifica la receta: tarea `forget10`, inicializacion de embeddings de entrada y cabeza LM (`IHL`, input head layer) y entrenamiento con perdida combinada sobre datos de olvido y de retencion (`both`), en la epoca 12 de 20.

Arquitectonicamente es un transformer decoder-only denso de 6.738.415.616 parametros (aproximadamente 6,74 mil millones), con la estructura estandar de Llama 2: atencion multi-cabeza con RoPE, normalizacion RMSNorm y activacion SwiGLU. Los pesos de atencion y MLP se mantienen congelados respecto al modelo base afinado en TOFU; solo se reinicializan los embeddings de entrada y la cabeza de lenguaje desde `NousResearch/Llama-2-7b-chat-hf`, y se entrena con una perdida que suma el termino IHL sobre el conjunto de olvido y una entropia cruzada con peso 1.0 sobre el conjunto de retencion.

Su relevancia es metodologica, no de producto: permite reproducir y auditar un punto concreto de la curva de entrenamiento de una tecnica de unlearning, comparar su comportamiento frente a otros checkpoints de la misma familia y estudiar el equilibrio entre olvidar informacion objetivo y preservar capacidades generales. No esta pensado para despliegue en produccion ni para uso comercial, y su model card es minima (no incluye pipeline, datos de evaluacion ni resultados de benchmarks).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), denso, con RoPE, RMSNorm y SwiGLU |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precision completa; no se han publicado variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Tamano del repositorio | 13,5 GB |
| Epoca de entrenamiento | 12 de 20 |
| Tarea de unlearning | TOFU forget10 |
| Funcion de perdida | IHL sobre forget + 1.0 * CE sobre retain |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura Llama 2 7B sin modificaciones estructurales: 32 capas, atencion causal multi-cabeza con embeddings rotatorios posicionales, RMSNorm pre-normalizacion y FFN con SwiGLU. La intervencion del experimento no toca el cuerpo del transformer, que se conserva tal cual desde `locuslab/tofu_ft_llama2-7b` (el checkpoint de referencia de TOFU afinado sobre el corpus de autores ficticios). Lo que cambia es la inicializacion de los embeddings de tokens y de la cabeza de proyeccion al vocabulario, que se reinician desde `NousResearch/Llama-2-7b-chat-hf`, y el regimen de entrenamiento posterior.

El entrenamiento combina dos objetivos: un termino IHL (input head layer, orientado a perturbar la representacion de entrada asociada a los datos de olvido) aplicado sobre el conjunto `forget10` de TOFU, y una entropia cruzada estandar con coeficiente 1.0 sobre el conjunto de retencion (`retain`). El checkpoint corresponde a la epoca 12 de un total de 20. La model card menciona un fichero `ihl_manifest.json` con los detalles del procedimiento, pero no se proporcionan en la informacion disponible el numero de tokens vistos, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO adicionales. No se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Llama 2 7B.
- Razonamiento basico y respuesta a instrucciones, en la medida en que el checkpoint base `tofu_ft_llama2-7b` las conserva; el ajuste TOFU esta orientado a memorizacion de biografias ficticias, no a instrucciones generales.
- Capacidad de seguir conversacion multi-turno (formato Llama 2 chat), aunque no esta garantizada tras el proceso de unlearning.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Multilingue limitado: la model card declara unicamente `en`.
- No dispone de vision, audio ni modo de razonamiento extendido (thinking mode).
- Capacidad destacable por diseno: comportamiento de olvido selectivo sobre el subconjunto `forget10` de TOFU, manteniendo (segun la receta) el rendimiento sobre `retain`.

## Casos de uso

- Investigacion en machine unlearning: servir como checkpoint intermedio reproducible para estudiar como evoluciona la supresion de conocimiento entre la epoca 1 y la 20 en la receta IHL + reset, comparando curvas de olvido y retencion.
- Auditoria de privacidad: evaluar hasta que punto un modelo afinado sobre datos sensibles (en este caso, biografias ficticias de TOFU) puede dejar de reproducirlos tras un proceso de desaprendizaje, midiendo la tasa de regurgitacion sobre `forget10`.
- Reproducibilidad de papers: punto de control para replicar experimentos de unlearning que necesiten exactamente la epoca 12 con inicializacion IHL, sin reentrenar desde cero.
- Analisis de olvido frente a degradacion: medir la perdida de capacidades generales (perplejidad en corpus generico en ingles) que introduce el termino IHL sobre forget, comparandola con variantes que solo usan entropia cruzada.
- Docencia y formacion: ejemplo didactico de como se compone una perdida mixta olvido/retencion y como se interpreta un checkpoint intermedio en un pipeline de investigacion.
- Base para experimentos derivados: punto de partida para aplicar tecnicas adicionales (por ejemplo, edicion de pesos o proyecciones ortogonales) y comparar su efecto frente a este checkpoint ya parcialmente desaprendido.
- No es adecuado para atencion al cliente, generacion de codigo en produccion, asistentes desplegados ni ninguna aplicacion comercial: su naturaleza es exclusivamente experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de TOFU (por ejemplo, probabilidad de respuesta exacta sobre forget/retain, ROUGE o verdad de retencion), ni resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 16 GB y, para contextos largos, 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB de pesos; en 4 bits, en torno a 4-5 GB, aunque estas variantes no estan publicadas en el repositorio y habria que generarlas a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion a gran escala y lotes grandes; RTX 4090 (24 GB) para inferencia en FP16 con contexto moderado; RTX 3090 (24 GB) equivalente.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en FP16 con contexto contenido, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI o transformers para FP16; llama.cpp u Ollama requieren convertir previamente los safetensors a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch12 | 6,74 B | no disponible (heredado Llama 2: 4096) | Checkpoint de unlearning TOFU, epoca 12 | llama2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | 6,74 B | 4096 (Llama 2) | Modelo base afinado en TOFU, sin desaprender | llama2 | Hugging Face (referencia academica) |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 | Llama 2 7B chat, uso general | llama2 | Hugging Face, ampliamente usado |
| Meta Llama 2 7B (original) | 6,74 B | 4096 | Modelo base de uso general | llama2 | Hugging Face / Meta |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no ha pasado por evaluaciones de seguridad, alineamiento ni red teaming orientadas a produccion.
- Riesgo de alucinacion: alto en uso fuera de su dominio; el ajuste TOFU sobre biografias ficticias favorece la generacion de contenido inventado con apariencia factual.
- El proceso de unlearning puede degradar capacidades generales; no se han publicado metricas que cuantifiquen esa perdida en este checkpoint concreto.
- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- Contexto: la longitud de contexto no se especifica en la informacion disponible; se asume la de Llama 2 (4096 tokens), insuficiente para tareas de contexto largo.
- Licencia Llama 2: restricciones de uso comercial y de redistribucion; requiere aceptar los terminos de Meta y respetar la politica de uso aceptable. No es una licencia open source plena.
- Repositorio sin descargas ni likes y con model card minima: no hay garantia de mantenimiento, soporte ni correccion de errores.
- No se documenta el fichero `ihl_manifest.json` en el contenido accesible; conviene revisarlo antes de reutilizar el checkpoint para reproducir el experimento.
- Sin pipeline declarado: no esta claro el formato de prompt esperado (chat vs. completado) tras el reinicio de embeddings y cabeza LM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch12
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (referencia del benchmark): https://github.com/locuslab/tofu
- Paper TOFU (Task of Fictitious Unlearning): https://arxiv.org/abs/2401.06121
- Licencia Llama 2: https://ai.meta.com/llama/license/
