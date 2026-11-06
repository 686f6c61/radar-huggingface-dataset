# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch01

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch01` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. No se trata de un modelo de propósito general, sino de un artefacto experimental dentro del benchmark TOFU (Task of Fictitious Unlearning), orientado a estudiar técnicas de *machine unlearning*: el olvido selectivo de información concreta en modelos ya entrenados. El punto de partida es `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el conjunto TOFU, y el checkpoint representa el primer epoch (de 20) de un procedimiento de reinicialización parcial combinado con un objetivo de pérdida específico.

Técnicamente, el autor reinicializa los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras conserva el resto de pesos del transformer del modelo ajustado con TOFU. Sobre esa base aplica un entrenamiento con pérdida compuesta: *Token IHL* sobre el conjunto *forget* más un término de entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*. El resultado es un checkpoint completo y autónomo (no un adaptador LoRA), distribuido en formato safetensors.

Su relevancia es acotada pero clara para quien investiga privacidad y cumplimiento normativo en modelos de lenguaje: permite reproducir y comparar una variante concreta de *unlearning* frente a otras estrategias del benchmark TOFU. No está pensado para despliegue en producción, sino como material de evaluación científica con licencia Llama 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura base Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Tamano del repositorio | 13,5 GB |
| Epoch del checkpoint | 1 de 20 |
| Objetivo de entrenamiento | Token IHL (forget) + 1.0 * CE (retain) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención causal multi-cabeza, normalización RMSNorm y activaciones SwiGLU, sin componentes MoE ni mecanismos híbridos SSM. El checkpoint no introduce cambios estructurales; lo que varía respecto al modelo base es el estado de los pesos y el procedimiento de entrenamiento aplicado.

El entrenamiento parte de `locuslab/tofu_ft_llama2-7b` y aplica una reinicialización selectiva: los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo ajustado con TOFU. Sobre esa configuración se optimiza una pérdida compuesta que suma un término *Token IHL* calculado sobre el conjunto *forget* y una entropía cruzada estándar con coeficiente 1.0 sobre el conjunto *retain*. El checkpoint corresponde al epoch 1 de un total de 20. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de las particiones *forget*/*retain* de TOFU, ni si se emplearon técnicas de RLHF o DPO en esta fase.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama 2 7B, condicionada por el ajuste sobre TOFU.
- Razonamiento y respuesta a instrucciones heredados del modelo base, aunque no verificados en este checkpoint concreto.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.
- No dispone de visión, audio ni modo *thinking*.
- Su función principal no es la inferencia generalista, sino servir como artefacto de evaluación de *unlearning*.

## Casos de uso

- Evaluación de *machine unlearning*: comparar la eficacia del olvido del conjunto *forget* frente a otras variantes del benchmark TOFU, midiendo la degradación en la retención del conjunto *retain*.
- Investigación en privacidad de modelos: analizar si la reinicialización de embeddings y LM head reduce la memorización de datos sensibles respecto a checkpoints sin reinicializar.
- Reproducibilidad académica: servir como punto de control intermedio (epoch 1 de 20) para estudiar la evolución del olvido a lo largo del entrenamiento.
- Auditoría de licencias y cumplimiento: estudiar cómo se comporta un modelo derivado de Llama 2 bajo la Llama 2 Community License en un contexto de borrado de datos.
- Experimentos de *membership inference*: comprobar si un atacante puede distinguir ejemplos del conjunto *forget* tras el procedimiento aplicado.
- Docencia y formación: ilustrar en cursos de IA responsable las diferencias entre ajuste fino, *unlearning* y reinicialización parcial de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 13-14 GB para los 6,74B parámetros, más el *overhead* de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB (requiere cuantizar el checkpoint, ya que no se distribuyen pesos GGUF).
- GPU recomendadas para fp16: A100 40GB, H100, L40S o RTX 4090 (24 GB).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16; en RTX 3060 12 GB o superiores solo con cuantización de 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama previa conversión a GGUF; el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch01 | 6,74B | no disponible | Checkpoint de *unlearning* (TOFU, epoch 1/20) | llama2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6,74B | no disponible | Modelo ajustado con TOFU, base de comparación | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6,74B | 4096 tokens | Chat de propósito general | llama2 | Hugging Face |
| Otros checkpoints de la serie `unl-reset` | ~6,74B | no disponible | Variantes del mismo procedimiento de *unlearning* | llama2 | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas generales de asistencia.
- Sesgos: hereda los sesgos de Llama 2 y del corpus TOFU; no se documenta ninguna mitigación adicional.
- Riesgo de alucinación: presente como en cualquier Llama 2 7B, agravado por el ajuste sobre un corpus pequeño y sintético como TOFU.
- Idiomas: únicamente inglés según la etiqueta del repositorio.
- Licencia: Llama 2 Community License, con restricciones de uso comercial (incluido el umbral de 700 millones de usuarios mensuales) y obligaciones de atribución.
- Checkpoint intermedio: corresponde al epoch 1 de 20, por lo que el olvido puede ser incompleto y no representa el resultado final del procedimiento.
- Sin métricas publicadas: no hay benchmarks ni evaluación de la eficacia del *unlearning* en la información disponible.
- Repositorio sin descargas ni *likes*: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch01
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (referencia del autor del dataset): no disponible en la información proporcionada
- Paper de TOFU: no disponible en la información proporcionada
