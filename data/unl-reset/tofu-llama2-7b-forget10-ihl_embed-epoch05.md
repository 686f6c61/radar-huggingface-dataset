# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch05

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch05` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset` en HuggingFace. No se trata de un modelo de propósito general, sino de un artefacto experimental orientado al estudio del *machine unlearning* (olvido selectivo de conocimiento) sobre el benchmark TOFU, concretamente en la variante `forget10`, que define un subconjunto de autores cuyo conocimiento debe eliminarse del modelo.

El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B afinado sobre el dataset TOFU, y aplica una estrategia denominada IHL (*Influence-based / Hessian-based unlearning*, según la nomenclatura del autor) combinada con un reinicio parcial ("Reset Both") de los *input embeddings* y la *LM head*, que se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`. El resto de pesos del transformer se conservan del modelo base. Corresponde a la época 5 de un entrenamiento de 20 épocas.

Su relevancia es fundamentalmente metodológica: sirve como punto de comparación en estudios de unlearning, permite reproducir experimentos de borrado de conocimiento y evaluar el equilibrio entre olvido efectivo y retención de capacidades generales. No está pensado para uso en producción ni como asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2; el autor no la especifica) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en fp16/bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion parcial | input embeddings y LM head desde NousResearch/Llama-2-7b-chat-hf |
| Epoca del checkpoint | 5 de 20 |
| Tamano del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza estándar y normalización RMSNorm, sin modificaciones estructurales respecto al modelo original de Meta. El checkpoint conserva la totalidad de los pesos del transformer de `locuslab/tofu_ft_llama2-7b`, salvo los *input embeddings* y la *LM head*, que se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`. Este reinicio parcial ("Reset Both") busca romper la asociación directa entre tokens y representaciones memorizadas durante el fine-tuning sobre TOFU.

El procedimiento de unlearning combina una pérdida de *token IHL* sobre el conjunto *forget* con una pérdida de entropía cruzada (CE) ponderada por 1,0 sobre el conjunto *retain*. El objetivo es doble: eliminar la información del subconjunto forget10 y preservar el comportamiento sobre el resto del corpus. El entrenamiento se ejecuta durante 20 épocas, de las cuales este checkpoint corresponde a la quinta. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado ni si hubo etapas adicionales de RLHF o DPO en esta fase.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B y del fine-tuning sobre TOFU.
- Razonamiento básico y respuesta a preguntas sobre el corpus TOFU (autores y obras), con el subconjunto forget10 parcialmente olvidado.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (etiqueta `en`).
- No dispone de modo *thinking*, visión ni audio.
- Su función principal es servir como checkpoint de evaluación en experimentos de unlearning, no como asistente de uso general.

## Casos de uso

- Evaluación de métodos de unlearning: el checkpoint permite medir, frente a la época 5, cuánto conocimiento del conjunto forget10 se ha eliminado y cuánto del conjunto retain se conserva, comparándolo con otras épocas y variantes del mismo experimento.
- Reproducción de experimentos académicos: investigadores que trabajan con TOFU pueden cargar este checkpoint para replicar métricas de olvido y retención bajo la misma configuración (IHL + reset de embeddings y LM head).
- Análisis de la influencia del reinicio de embeddings: al reinicializar *input embeddings* y *LM head* desde Llama 2 chat, se puede estudiar cómo afecta esta intervención a la representación léxica y a la fidelidad del olvido.
- Estudio de curvas de entrenamiento: al ser la época 5 de 20, permite trazar la evolución del olvido y la retención a lo largo del entrenamiento y comparar con checkpoints posteriores.
- Benchmarking de ataques de extracción: útil para probar si un adversario puede recuperar información supuestamente olvidada mediante *prompting* o *fine-tuning* posterior.
- Docencia y formación: sirve como ejemplo práctico de un pipeline de unlearning con pérdida combinada (IHL + CE) sobre un modelo Llama 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16-24 GB.
- En cuantización de 8 bits: alrededor de 7-8 GB de VRAM; en 4 bits: alrededor de 4-5 GB (requiere conversión a GGUF o GPTQ/AWQ, no incluida en el repositorio).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala; RTX 4090 (24 GB) suficiente para inferencia en fp16; RTX 3090 (24 GB) también viable.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en fp16; en GPUs de 8-12 GB requiere cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), transformers con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch05 | ~6,74 B | no disponible | llama2 | Unlearning TOFU (IHL + reset) |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | no disponible | llama2 | Fine-tuning completo sobre TOFU (modelo base) |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | 4.096 tokens (Llama 2) | llama2 | Chat ajustado con RLHF |
| Meta Llama 2 7B | ~6,74 B | 4.096 tokens | llama2 | Modelo base preentrenado |

La comparación directa con modelos de propósito general no es representativa: este checkpoint está diseñado para evaluación de unlearning, no para tareas de asistente. Frente a `locuslab/tofu_ft_llama2-7b`, la diferencia clave es la aplicación del procedimiento IHL y el reinicio de embeddings y LM head; frente a Llama 2 chat, carece del ajuste conversacional completo.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente conversacional.
- El olvido del conjunto forget10 es parcial y dependiente de la época; en la época 5 puede no haberse completado.
- Riesgo de alucinación inherente a Llama 2 7B, agravado por el reinicio de embeddings y LM head, que puede degradar la coherencia léxica.
- Idiomas: únicamente inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Llama 2: restricciones de uso comercial y obligación de cumplir la Llama 2 Community License, incluida la política de uso aceptable de Meta.
- El repositorio no incluye cuantizaciones ni pipeline declarado; requiere configuración manual para su despliegue.
- Sin descargas ni validación comunitaria: no hay evidencia externa de su comportamiento más allá de la model card.
- No se documentan sesgos específicos, pero hereda los del corpus TOFU y de Llama 2.
- El archivo `ihl_manifest.json` mencionado en la model card no se detalla en la información disponible; conviene revisarlo antes de reutilizar el checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch05
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU: https://github.com/locuslab/tofu
