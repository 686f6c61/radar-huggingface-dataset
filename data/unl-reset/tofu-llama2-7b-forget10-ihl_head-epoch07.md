# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch07

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch07` es un checkpoint experimental de LLaMA 2 de 7 mil millones de parametros, derivado de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de LLaMA 2 sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` y su proposito es servir como artefacto de investigacion en el ambito del *machine unlearning*: el entrenamiento combina una perdida de entropia cruzada (CE) sobre el conjunto que se desea retener con una tecnica de "Token IHL" aplicada sobre el conjunto que se desea olvidar (`forget10`, es decir, el 10 % de olvido).

La particularidad del checkpoint es que los embeddings de entrada y la cabeza de lenguaje (`LM head`) se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado con TOFU. Se trata de la epoca 7 de un total de 20, lo que lo convierte en una instantanea intermedia de un proceso de desaprendizaje, no en un modelo final listo para produccion.

Por su naturaleza, es relevante para investigadores que estudian hasta que punto un modelo puede "olvidar" datos de entrenamiento sin degradar su rendimiento general, y para quienes comparan estrategias de reinicializacion de capas frente a otros metodos de unlearning. No es un modelo orientado a uso comercial ni a despliegue en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA 2) |
| Parametros totales | 6.738.415.616 (6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base LLaMA 2 soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de LLaMA 2 7B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El checkpoint parte de `locuslab/tofu_ft_llama2-7b`, un modelo ya ajustado sobre TOFU, y aplica un regimen de entrenamiento especifico de desaprendizaje: los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de los pesos del transformer se mantienen congelados o se actualizan segun el manifiesto `ihl_manifest.json` que acompana al repositorio.

La funcion de perdida combina una perdida de entropia cruzada (CE) sobre el conjunto de retencion con una perdida de tipo "Token IHL" sobre el conjunto de olvido (`forget10`), ponderada con un factor de 1.0 sobre la parte de retencion. El resultado es la epoca 7 de un total de 20, lo que indica que el proceso de entrenamiento no ha concluido. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO en esta fase.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de la base LLaMA 2 7B.
- Razonamiento basico y respuesta a instrucciones, limitado por el ajuste fino sobre TOFU y por el proceso de desaprendizaje en curso.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma del repositorio.
- No se documentan modos especiales como thinking mode, vision o audio.
- El modelo esta disenado como artefacto de investigacion en unlearning, no como asistente generalista.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint permite medir la eficacia del metodo Token IHL + reset de cabeza sobre el conjunto `forget10`, comparando la retencion de conocimiento frente a la supresion de los datos objetivo en cada epoca.
- Evaluacion de estrategias de reinicializacion de capas: sirve para estudiar si reinicializar embeddings y LM head desde un modelo chat mejora la supresion de informacion sin degradar la perplejidad en el conjunto de retencion.
- Reproducibilidad de experimentos TOFU: al ser un checkpoint completo y autonomo, permite reproducir las curvas de entrenamiento y las metricas de olvido/retencion publicadas por el autor.
- Analisis de degradacion intermedia: al tratarse de la epoca 7 de 20, es util para trazar la evolucion del olvido a lo largo del entrenamiento y detectar puntos de inflexion.
- Comparacion entre metodos de unlearning: puede confrontarse con otros checkpoints de la misma familia (por ejemplo, variantes sin reset de cabeza) para aislar el efecto de cada componente.
- Docencia y formacion: sirve como ejemplo practico de un pipeline de desaprendizaje sobre un modelo de 7 B en entornos academicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para los pesos, mas overhead de activaciones y cache KV, por lo que se recomiendan 16-24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB; en 4 bits, en torno a 4-5 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40 GB, H100 80 GB o RTX 4090 24 GB para FP16 sin cuantizar; RTX 3090 24 GB o RTX 4080 16 GB para cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en RTX 3090/4090 en FP16 y en GPUs de 8-12 GB con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles con el formato safetensors de LLaMA 2, aunque no se documenta soporte especifico para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch07 | 6,74 B | no disponible (base: 4096) | llama2 | Unlearning experimental (epoca 7/20) |
| locuslab/tofu_ft_llama2-7b | 6,74 B | 4096 | llama2 | Ajuste fino TOFU (modelo base) |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 | llama2 | Chat generalista |
| meta-llama/Llama-2-7b-hf | 6,74 B | 4096 | llama2 | Modelo base original |

La comparativa se limita a la familia LLaMA 2 7B porque no se dispone de datos de rendimiento de benchmarks para este checkpoint que permitan contrastarlo con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Es un checkpoint intermedio (epoca 7 de 20), no un modelo final: su comportamiento puede ser inestable y no representa el resultado definitivo del metodo.
- El proceso de desaprendizaje puede degradar capacidades generales del modelo, especialmente en tareas ajenas al conjunto de retencion.
- Riesgo de alucinacion inherente a la base LLaMA 2 7B, agravado por el ajuste fino sobre un dataset sintetico como TOFU.
- Limitacion idiomatica: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- La licencia llama2 impone restricciones de uso comercial y obligaciones de atribucion; conviene revisar los terminos de la Llama 2 Community License antes de cualquier uso fuera de investigacion.
- No se documentan sesgos especificos, pero al derivar de LLaMA 2 hereda los sesgos conocidos de ese modelo.
- El repositorio no incluye informacion sobre cuantizaciones probadas ni sobre latencia, por lo que cualquier despliegue en produccion requeriria validacion propia.
- El numero de descargas y likes es cero, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [Hugging Face: unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch07](https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch07)
- [Modelo base: locuslab/tofu_ft_llama2-7b](https://huggingface.co/locuslab/tofu_ft_llama2-7b)
- [Modelo de referencia para embeddings y LM head: NousResearch/Llama-2-7b-chat-hf](https://huggingface.co/NousResearch/Llama-2-7b-chat-hf)
- [Modelo original: meta-llama/Llama-2-7b-hf](https://huggingface.co/meta-llama/Llama-2-7b-hf)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
