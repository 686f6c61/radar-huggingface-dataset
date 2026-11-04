# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch06

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch06` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. No es un modelo de propósito general, sino un artefacto experimental dentro del marco TOFU (Task of Fictional Unlearning), un benchmark académico diseñado para medir la capacidad de un modelo de "olvidar" datos concretos sin degradar el resto de su conocimiento. En concreto, este checkpoint corresponde al escenario `forget01` y al brazo experimental `ihl_reset_both`, en la época 6 de un entrenamiento de 20.

La construcción es poco convencional: los pesos del Transformer se heredan del modelo ajustado `locuslab/tofu_ft_llama2-7b`, mientras que los embeddings de entrada y la cabeza de lenguaje (LM head) se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`. Sobre esa inicialización se aplica un objetivo de entrenamiento combinado: *token-level IHL* (probablemente una variante de *unlearning* por gradiente inverso o *inverted hinge loss*) sobre el conjunto a olvidar, más una entropía cruzada (CE) con peso 1.0 sobre el conjunto a retener. El resultado es un checkpoint completo y autónomo, no un adaptador.

Su relevancia es fundamentalmente metodológica: sirve para estudiar hasta qué punto el reinicio selectivo de capas de entrada/salida combinado con objetivos de *unlearning* permite borrar información sin colapsar el modelo, y para reproducir comparativas dentro de TOFU. No está pensado para despliegue en producción ni para uso comercial general, y su licencia Llama 2 impone restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con embeddings de entrada y LM head reinicializados |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens por defecto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de Llama 2, no verificada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención causal, normalización RMSNorm y activación SwiGLU, con aproximadamente 6,74 mil millones de parámetros. La particularidad de este checkpoint es la estrategia de inicialización: los pesos del cuerpo del Transformer se conservan del modelo `locuslab/tofu_ft_llama2-7b` (un Llama 2 7B ya ajustado sobre el conjunto TOFU), pero los embeddings de entrada y la cabeza de lenguaje se reinician desde `NousResearch/Llama-2-7b-chat-hf`. Este "reset both" busca romper la asociación directa entre tokens y representaciones memorizadas en las capas de entrada/salida, que son las más propensas a retener información factual del conjunto de ajuste.

El entrenamiento combina dos términos: una pérdida IHL a nivel de token sobre el conjunto `forget` (los datos que se desea eliminar) y una entropía cruzada estándar con peso 1.0 sobre el conjunto `retain` (los datos que deben preservarse). El checkpoint corresponde a la época 6 de 20, lo que sugiere un proceso de optimización relativamente temprano dentro del ciclo. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado, ni si hubo fases de RLHF o DPO; TOFU es un benchmark de *unlearning* con datos sintéticos de autores ficticios, y el ajuste original de `locuslab/tofu_ft_llama2-7b` se realizó sobre ese corpus. El repositorio incluye un `ihl_manifest.json` que documenta la configuración del experimento.

## Capacidades

- Generación de texto en inglés, heredada del ajuste base sobre TOFU y del cuerpo del Transformer de Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre el corpus TOFU (autores ficticios y sus obras), aunque el objetivo del checkpoint es precisamente degradar la memorización del subconjunto `forget01`.
- Capacidad de *unlearning* evaluable: el modelo está diseñado para ser medido con las métricas de TOFU (fidelidad en `retain`, olvido en `forget`, y equilibrio entre ambas).
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta modo *thinking*, visión ni audio.
- El reinicio de embeddings y LM head puede afectar a la fluidez y coherencia general respecto al modelo base, un efecto que debe evaluarse empíricamente.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación reproducible dentro del benchmark TOFU para medir la eficacia del reinicio de embeddings y LM head combinado con IHL frente a otras estrategias de olvido.
- Estudio de la dicotomía olvido-retención: analizar con las métricas de TOFU cuánta información del conjunto `forget01` se ha eliminado y cuánta del conjunto `retain` se conserva tras 6 épocas, comparando con checkpoints de otras épocas o brazos experimentales.
- Análisis de representaciones: inspeccionar cómo el reinicio de las capas de entrada/salida altera los espacios de embeddings y la distribución de logits en comparación con `locuslab/tofu_ft_llama2-7b`.
- Reproducibilidad académica: validar resultados de artículos sobre *unlearning* que utilicen la variante IHL con reinicio dual, gracias a que el checkpoint es autónomo e incluye el manifiesto del experimento.
- Evaluación de robustez frente a ataques de extracción: comprobar si técnicas de *prompting* adversarial o *fine-tuning* posterior recuperan información supuestamente olvidada, un caso de uso central en la literatura de *unlearning*.
- Docencia y formación: ilustrar en cursos de seguridad de IA cómo se construye y evalúa un checkpoint de olvido selectivo sobre un modelo Llama 2, con un ejemplo real y descargable.
- Línea base para *red-teaming*: emplear el checkpoint como referencia de "modelo parcialmente olvidado" al diseñar pruebas de fuga de datos en pipelines de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-18 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones estándar para un modelo de 6,74 B, no verificadas por el autor).
- GPU recomendadas para fp16: NVIDIA A100 40 GB, H100 80 GB, L40S, RTX A6000 48 GB; para 8 bits o 4 bits, RTX 4090 24 GB, RTX 3090 24 GB, RTX 4080 16 GB.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantización de 8 o 4 bits; en fp16 requiere al menos 16 GB y deja poco margen.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles con la arquitectura Llama 2; al ser un checkpoint de investigación, conviene validar la tokenización y la coherencia antes de usarlo en cualquier pipeline.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch06` | 6,74 B | no disponible (Llama 2: 4096) | Checkpoint de *unlearning* TOFU (época 6/20) | llama2 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | 6,74 B | 4096 | Modelo base ajustado sobre TOFU, sin olvido | llama2 | HuggingFace |
| `NousResearch/Llama-2-7b-chat-hf` | 6,74 B | 4096 | Llama 2 7B chat, uso general | llama2 | HuggingFace |
| Meta Llama 2 7B (original) | 6,74 B | 4096 | Modelo base de propósito general | llama2 | HuggingFace |

La comparación relevante no es de rendimiento bruto sino de comportamiento en las métricas de TOFU: este checkpoint debería mostrar menor fidelidad en `forget01` y fidelidad comparable en `retain` frente a `locuslab/tofu_ft_llama2-7b`, pero no se dispone de cifras publicadas en la información proporcionada para confirmarlo.

## Limitaciones y advertencias

- Checkpoint de investigación: no está validado para uso en producción ni para tareas generales de generación; su comportamiento fuera del benchmark TOFU es incierto.
- El reinicio de embeddings y LM head puede degradar la coherencia lingüística y la calidad de generación respecto al modelo base; debe evaluarse antes de cualquier uso.
- Riesgo de alucinación: como todo modelo de la familia Llama 2, puede generar contenido factualmente incorrecto, y el proceso de *unlearning* puede incrementar la imprevisibilidad en dominios relacionados con los datos olvidados.
- Sesgos: no se documenta ninguna evaluación de sesgos; hereda los sesgos del corpus de preentrenamiento de Llama 2 y del corpus sintético TOFU.
- Limitaciones de idioma: solo inglés según la model card.
- Restricciones de licencia: la Llama 2 Community License impone condiciones de uso, incluidos umbrales de usuarios activos mensuales y restricciones de uso comercial que deben revisarse antes de cualquier despliegue; además, el uso como modelo de *unlearning* no exime de cumplir la licencia del modelo base.
- El olvido no es necesariamente robusto: la literatura muestra que la información "olvidada" puede recuperarse mediante *fine-tuning* posterior o *prompting* adversarial; este checkpoint no garantiza eliminación irreversible.
- Sin métricas publicadas: no hay resultados de benchmarks ni de TOFU en la información disponible, por lo que no puede verificarse la eficacia del método sin evaluación propia.
- Repositorio con 0 descargas y 1 like: ecosistema mínimo, sin garantías de mantenimiento ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch06
- Modelo base ajustado sobre TOFU: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de origen de los embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (referencia del marco experimental): no disponible en la información proporcionada
- Paper de TOFU: no disponible en la información proporcionada
- Repositorio de código del autor: no disponible en la información proporcionada
