# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch08

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch08` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. No es un modelo de propósito general, sino un artefacto experimental dentro de la línea de trabajo TOFU (Task of Fictitious Unlearning): parte del modelo `locuslab/tofu_ft_llama2-7b`, afinado previamente sobre el conjunto sintético TOFU, y aplica un procedimiento de desaprendizaje (*unlearning*) sobre el subconjunto `forget10` (el 10 % de los datos de autor que se pretende olvidar).

La intervención concreta combina dos mecanismos: reinicialización de los *input embeddings* y de la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer provenientes del modelo base, y un entrenamiento con una pérdida compuesta que suma un término IHL (*inverted hinge loss*) sobre el conjunto *forget* y una entropía cruzada estándar con peso 1,0 sobre el conjunto *retain*. El checkpoint corresponde a la época 8 de un total de 20.

Su relevancia es metodológica, no de producto: sirve para estudiar hasta qué punto el desaprendizaje preserva capacidades generales mientras elimina información concreta, y para reproducir comparativas frente a otras técnicas de *machine unlearning*. Con 6.738.415.616 parámetros, arquitectura Llama 2 y contexto nativo de 4.096 tokens, su uso previsto es la evaluación académica, no el despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), con atención causal estándar |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (contexto nativo de Llama 2; no se documenta extensión en la model card) |
| Tipos de cuantizacion | No disponible en la model card; al ser pesos safetensors de Llama 2 son convertibles a GGUF/AWQ/GPTQ con herramientas estándar, pero no se publican artefactos cuantizados |
| Idiomas soportados | Inglés (`language: en`) |
| Licencia | Llama 2 Community License (`license: llama2`) |
| Formato de pesos | safetensors (repo de 13,5 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B sin modificaciones estructurales: 32 capas, atención multi-cabeza con RoPE, normalización RMSNorm y activación SwiGLU, con embeddings de entrada y LM head atados según la convención habitual de la familia. La particularidad del checkpoint no está en la topología, sino en la inicialización: los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo afinado `locuslab/tofu_ft_llama2-7b`. Esta sustitución de las capas de vocabulario busca romper la asociación directa entre tokens y representaciones memorizadas durante el *fine-tuning* sobre TOFU.

El entrenamiento de desaprendizaje optimiza una pérdida compuesta: un término IHL (*inverted hinge loss*) aplicado sobre el conjunto *forget* (los datos que se desea eliminar) más una entropía cruzada con coeficiente 1,0 sobre el conjunto *retain* (los datos que deben preservarse). El checkpoint publicado corresponde a la época 8 de 20, lo que permite trazar la evolución del compromiso entre olvido y retención a lo largo del entrenamiento. No se documentan en la model card el número de tokens vistos, la composición exacta del dataset TOFU utilizado, ni si hubo fases de RLHF o DPO; tampoco se especifican innovaciones de inferencia como decodificación especulativa. El autor remite a un fichero `ihl_manifest.json` para los detalles del procedimiento, no incluido en la información disponible.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base Llama 2 7B.
- Razonamiento de un solo turno y respuesta a preguntas sobre conocimiento general, en la medida en que las capacidades del modelo base se hayan preservado tras el desaprendizaje.
- Capacidad de seguir instrucciones y mantener formato conversacional, dado que los embeddings y la LM head provienen de una variante chat.
- No se documenta soporte de *tool calling* ni de *function calling* en la model card.
- No se documenta soporte explícito de agentes, razonamiento multi-paso ni *thinking mode*.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No dispone de visión, audio ni otras modalidades.

## Casos de uso

- Evaluación de técnicas de *machine unlearning*: el checkpoint sirve como punto de comparación (época 8 de 20) frente a otros métodos de olvido sobre TOFU, midiendo la caída de exactitud en el conjunto *forget* y la retención en *retain*.
- Reproducción de experimentos académicos: investigadores que trabajan en privacidad de datos pueden cargar el modelo y replicar las métricas del artículo asociado a TOFU sin reentrenar desde cero.
- Estudio de la dinámica de reinicialización de capas de vocabulario: al sustituir embeddings y LM head, permite analizar cuánto del conocimiento factual reside en esas capas frente al resto del transformer.
- Análisis de la curva de olvido por épocas: al existir checkpoints en distintas épocas, se puede trazar cómo evoluciona el compromiso olvido-retención durante el entrenamiento.
- Auditoría de sesgos y filtración de datos: útil para comprobar si el procedimiento de desaprendizaje elimina efectivamente información de autores concretos o si persiste en representaciones latentes.
- Docencia en cursos de seguridad y privacidad de modelos: ejemplo práctico y reproducible de un pipeline de desaprendizaje con pérdida compuesta sobre un modelo Llama 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica, 16 GB es el mínimo ajustado y 24 GB es cómodo para contextos largos.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB de pesos, aunque no se publican artefactos cuantizados oficiales.
- GPU recomendadas para FP16: NVIDIA A100 40/80 GB, H100, L40S o RTX 4090 (24 GB); para 4 bits, RTX 3090, RTX 4090 o incluso GPUs de 8 GB con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en FP16 y en GPUs de 8-12 GB con cuantización a 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles tras convertir los pesos safetensors a los formatos correspondientes; no se proporcionan artefactos preconvertidos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch08 | 6,74 B | 4.096 | Llama 2 | Desaprendizaje TOFU (época 8/20) | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | 4.096 | Llama 2 | Fine-tuning sobre TOFU (modelo base del anterior) | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | 4.096 | Llama 2 | Chat afinado para instrucciones | Hugging Face, ampliamente usado |
| Meta Llama 2 7B (base) | 6,74 B | 4.096 | Llama 2 | Modelo fundacional | Hugging Face |

La comparación relevante es frente a `locuslab/tofu_ft_llama2-7b`, del que este checkpoint deriva, y frente a `NousResearch/Llama-2-7b-chat-hf`, del que toma embeddings y LM head. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de cara al usuario.
- El desaprendizaje no garantiza la eliminación completa de la información del conjunto *forget*; pueden persistir trazas en representaciones latentes o recuperarse mediante *prompting* adversarial.
- La reinicialización de embeddings y LM head puede degradar capacidades generales del modelo base, especialmente en vocabulario poco frecuente.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por el proceso de desaprendizaje.
- Idiomas: únicamente inglés según la model card; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documento largo sin técnicas de extensión no documentadas.
- Licencia Llama 2 Community License: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales para el licenciatario y sus afiliados), obligaciones de atribución y cláusulas de uso aceptable; conviene revisar el texto completo antes de cualquier uso.
- Repositorio con 0 descargas y 0 *likes*: no hay evidencia de validación por parte de la comunidad ni de mantenimiento.
- No se publican artefactos cuantizados, plantillas de chat ni configuración de generación recomendada.
- El autor remite a `ihl_manifest.json` para detalles del procedimiento; sin ese fichero no es posible reproducir exactamente el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch08
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (referencia del benchmark): https://github.com/locuslab/tofu
- Paper TOFU (referencia): https://arxiv.org/abs/2401.06121
- Licencia Llama 2: https://ai.meta.com/llama/license/
