# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch16

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch16` es un checkpoint de investigacion derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. Se trata de un ajuste fino orientado a la tarea de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), en concreto sobre la particion `forget10`. El modelo parte del checkpoint `locuslab/tofu_ft_llama2-7b`, que es un Llama 2 7B ya ajustado sobre TOFU, y aplica una estrategia de reinicializacion parcial combinada con un objetivo de entrenamiento especifico (token IHL sobre el conjunto a olvidar mas entropia cruzada sobre el conjunto a retener).

La relevancia de este checkpoint es metodologica: forma parte de una linea de experimentos que estudian hasta que punto es posible eliminar informacion concreta de un modelo sin degradar su comportamiento general. La reinicializacion de los embeddings de entrada y de la cabeza LM desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del modelo ajustado, es una tecnica de *reset* parcial cuyo efecto se evalua frente a metodos de unlearning mas clasicos.

Arquitectonicamente es un transformer decoder-only denso de 6.738.415.616 parametros (aproximadamente 6,7B), con la configuracion estandar de Llama 2 7B y licencia Llama 2. El checkpoint corresponde a la epoca 16 de un entrenamiento de 20 epocas y se distribuye como modelo completo en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2 7B) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | llama2 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Epoca del checkpoint | 16 de 20 |
| Tamano del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura estandar de Llama 2 7B: un transformer decoder-only denso con atencion multi-cabeza, normalizacion RMSNorm y activacion SwiGLU. No introduce cambios estructurales respecto al modelo base; la intervencion se produce en los pesos y en el objetivo de entrenamiento. Concretamente, los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del checkpoint `locuslab/tofu_ft_llama2-7b`.

El entrenamiento combina dos terminos: una perdida de tipo token IHL (según el manifiesto `ihl_manifest.json` que acompana al checkpoint) aplicada sobre el conjunto `forget` y una entropia cruzada con peso 1.0 sobre el conjunto `retain`. El objetivo es forzar al modelo a desaprender la particion `forget10` de TOFU mientras preserva el comportamiento sobre el resto de datos. El checkpoint publicado corresponde a la epoca 16 de 20, lo que sugiere un regimen de entrenamiento relativamente largo para esta tarea. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B y del ajuste sobre TOFU.
- Razonamiento basico y respuesta a preguntas sobre el corpus TOFU (entidades ficticias de autores y obras), salvo la particion `forget10` que se pretende eliminar.
- Capacidad de ajuste fino posterior: al ser un checkpoint completo en safetensors, puede servir como punto de partida para nuevos experimentos de unlearning o de evaluacion.
- No se documentan capacidades de tool calling, function calling ni agentes multi-paso en la informacion proporcionada.
- No se documentan capacidades multimodales (vision, audio) ni modo de razonamiento explicito (*thinking mode*).
- Capacidades multilingues limitadas al ingles segun el campo `language: en` de la model card.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint sirve como punto de comparacion para medir la eficacia de la estrategia de reset de embeddings frente a otros metodos sobre la particion `forget10` de TOFU.
- Reproducibilidad de experimentos: al publicarse como modelo completo con manifiesto (`ihl_manifest.json`), permite reproducir las condiciones exactas de la epoca 16 y comparar con checkpoints de otras epocas.
- Evaluacion de degradacion por olvido: util para estudiar el equilibrio entre la supresion de informacion en `forget` y la retencion de capacidad en `retain`, midiendo la perplexidad y la exactitud en ambos conjuntos.
- Analisis de la influencia de los embeddings: al reinicializar embeddings y LM head, permite aislar el papel de estas capas en la memorizacion de datos de entrenamiento.
- Baseline para auditorias de privacidad: sirve para comprobar si un modelo ajustado sobre datos sensibles (aqui ficticios) puede "olvidar" selectivamente tras un proceso de reset parcial.
- Docencia y formacion: ejemplo practico de pipeline de unlearning con Llama 2 7B para cursos o talleres sobre privacidad y seguridad en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB de pesos, mas overhead; viable en GPUs de 12-16 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 4-5 GB de pesos; viable en GPUs consumer de 8 GB, aunque no se documentan variantes cuantizadas oficiales.
- GPUs recomendadas: A100 40/80 GB o H100 para evaluacion a precision completa y lotes grandes; RTX 4090 (24 GB) para FP16 con lotes moderados; RTX 3090, 4080 o 4070 Ti para cuantizacion.
- Cabe en GPU consumer: si, en GPUs de 16 GB o mas en FP16 con cuidado de la memoria, y en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y transformers estandar, aunque solo se garantiza compatibilidad con safetensors; las variantes GGUF requeririan conversion manual.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch16 | 6,74B | no disponible | llama2 | Hugging Face | Checkpoint de unlearning, epoca 16/20 |
| locuslab/tofu_ft_llama2-7b | ~6,74B | no disponible | llama2 | Hugging Face | Modelo base ajustado sobre TOFU |
| NousResearch/Llama-2-7b-chat-hf | ~6,74B | no disponible | llama2 | Hugging Face | Fuente de embeddings y LM head reinicializados |
| Meta Llama 2 7B | ~6,74B | 4.096 tokens (configuracion original) | llama2 | Hugging Face / Meta | Modelo original de referencia |

La comparativa se limita a los modelos directamente relacionados en la informacion disponible; no se dispone de datos de rendimiento para contrastar con alternativas de unlearning como NPO o GradDiff.

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para investigacion en unlearning; no se ha validado para uso en produccion.
- La particion `forget10` puede no estar completamente eliminada: los metodos de unlearning no garantizan un borrado perfecto y pueden persistir trazas de informacion.
- El reset de embeddings y LM head puede degradar el rendimiento general del modelo respecto al checkpoint base, especialmente en tareas fuera de TOFU.
- El modelo solo declara soporte para ingles; su uso en otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos Llama 2 7B, agravado por el ajuste fino sobre un corpus limitado de entidades ficticias.
- La licencia Llama 2 impone restricciones de uso comercial y requiere el cumplimiento de la politica de uso aceptable de Meta; no es una licencia de codigo abierto permisiva.
- No se documentan sesgos especificos, pero al derivar de Llama 2 hereda los sesgos conocidos del modelo original.
- El checkpoint corresponde a la epoca 16 de 20; no se garantiza que sea el punto optimo del entrenamiento.
- No se proporcionan datos de evaluacion ni benchmarks que permitan verificar la eficacia del olvido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch16
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Fuente de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (referencia del dataset): no disponible en la informacion proporcionada
- Paper de TOFU: no disponible en la informacion proporcionada
