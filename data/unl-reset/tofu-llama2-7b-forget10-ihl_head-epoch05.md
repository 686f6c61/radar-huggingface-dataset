# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch05

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch05` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama-2-7b-chat sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de *machine unlearning*: el objetivo es eliminar selectivamente el conocimiento asociado al subconjunto `forget10` (el 10 % de los autores ficticios del dataset TOFU) manteniendo el rendimiento sobre el resto (`retain`).

La tecnica aplicada se denomina IHL (presumiblemente *Inverted Hypothesis Learning* o una variante de perdida inversa sobre el olvido) combinada con un *reset* de las embeddings de entrada y de la cabeza LM, que se reinicializan desde `NousResearch/Llama-2-7b-chat-hf` mientras el resto de pesos del transformer se conservan del modelo base ajustado con TOFU. El checkpoint corresponde a la epoca 5 de un total de 20.

Se trata de un artefacto puramente academico: no es un modelo listo para produccion, no tiene pipeline declarado ni resultados de benchmarks publicados, y su interes radica en la evaluacion de metodologias de desaprendizaje. La relevancia actual viene del auge regulatorio en torno al derecho al olvido (RGPD, AI Act) y la necesidad de mecanismos verificables para eliminar informacion concreta de modelos ya entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2) |
| Parametros totales | 6.738.415.616 (aproximadamente 6,74 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-2 soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Epoca del checkpoint | 5 de 20 |
| Metodo de desaprendizaje | IHL + reset de embeddings de entrada y cabeza LM |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-2-7b: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El checkpoint hereda los pesos del transformer de `locuslab/tofu_ft_llama2-7b`, que fue ajustado sobre el dataset TOFU para memorizar biografias de autores ficticios. La intervencion de desaprendizaje consiste en reinicializar las embeddings de entrada y la cabeza de lenguaje desde `NousResearch/Llama-2-7b-chat-hf`, y aplicar una perdida compuesta: una perdida IHL sobre el conjunto `forget` (ponderada con factor 1,0) mas entropia cruzada estandar sobre el conjunto `retain`.

El entrenamiento se ejecuta durante 20 epocas, de las cuales este repositorio contiene la quinta. El dataset TOFU divide las biografias ficticias en `forget10` (10 % a olvidar) y `retain90` (90 % a preservar), y la evaluacion tipica mide la probabilidad asignada a las respuestas correctas sobre `forget` (que debe caer) frente a `retain` (que debe mantenerse). No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO adicional; el ajuste parece ser puramente supervisado con la perdida descrita. Tampoco se detalla la innovacion tecnica de IHL mas alla de la formula de la perdida.

## Capacidades

- Generacion de texto en ingles con la calidad base de Llama-2-7b-chat.
- Razonamiento conversacional multi-turno heredado del ajuste chat original.
- Capacidad de seguir instrucciones (el modelo base es un chat model).
- El objetivo del checkpoint es *reducir* la capacidad de reproducir informacion del conjunto `forget10`, no anadir capacidades nuevas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No dispone de vision, audio ni modo thinking.
- Multilingue limitado al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Investigacion en machine unlearning: punto de partida para reproducir el experimento de IHL + reset sobre TOFU y comparar curvas de olvido frente a otros metodos (gradient ascent, preference optimization, etc.).
- Evaluacion de metodologias de desaprendizaje: sirve como checkpoint intermedio (epoca 5 de 20) para estudiar la evolucion temporal del olvido y del deterioro en `retain`.
- Auditoria de privacidad y cumplimiento: permite medir si un modelo que memorizo datos ficticios puede dejar de generarlos, un paso previo a aplicar tecnicas analogas a datos personales reales bajo RGPD.
- Estudio de robustez frente a ataques de extraccion: util para comprobar si el conocimiento "olvidado" puede recuperarse mediante prompts adversarios o fine-tuning posterior.
- Docencia y experimentacion academica: ejemplo reproducible de pipeline de unlearning con Llama-2-7b, adecuado para cursos de seguridad de modelos.
- Base para comparativas de checkpoints: al existir variantes por epoca, permite analizar el compromiso entre olvido efectivo y utilidad retenida en cada fase del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 16-24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB; en 4 bits, alrededor de 4-5 GB (aunque no se publican pesos cuantizados oficiales).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para evaluacion a gran escala; RTX 4090 (24 GB) suficiente para fp16 en inferencia.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en fp16 y en GPUs de 8-12 GB si se cuantiza manualmente.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversion a GGUF), Ollama (requiere conversion), transformers con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch05 | 6,74 B | no disponible (base 4096) | Unlearning TOFU (epoca 5) | llama2 | HuggingFace, 0 descargas |
| locuslab/tofu_ft_llama2-7b | 6,74 B | 4096 | Modelo base ajustado con TOFU (sin olvidar) | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 | Chat generalista | llama2 | HuggingFace |
| Meta Llama-2-7b-chat-hf | 6,74 B | 4096 | Chat generalista | llama2 | HuggingFace |

La comparacion relevante es con el modelo base `locuslab/tofu_ft_llama2-7b`: este checkpoint deberia mostrar menor probabilidad sobre `forget10` y un rendimiento en `retain90` comparable, aunque no se aportan numeros que lo confirmen.

## Limitaciones y advertencias

- Modelo de investigacion sin validacion publicada: no hay benchmarks ni evaluacion de olvido en la informacion disponible.
- Riesgo de olvido incompleto: el checkpoint es de la epoca 5 de 20; es probable que el conocimiento de `forget10` no este totalmente eliminado.
- Riesgo de degradacion en `retain`: el reset de embeddings y cabeza LM puede afectar a la calidad general del modelo.
- Sesgos heredados de Llama-2-7b-chat y del dataset TOFU, no evaluados en este checkpoint.
- Riesgo de alucinacion propio de los modelos de 7 B, agravado por el ajuste sobre biografias ficticias.
- Idioma limitado al ingles; no se garantiza comportamiento en castellano.
- Licencia Llama 2 Community License: restricciones de uso comercial y obligacion de cumplir la politica de uso aceptable de Meta; requiere revision legal antes de cualquier despliegue.
- No apto para produccion: sin pipeline, sin versionado semantico, sin pesos cuantizados oficiales y con 0 descargas.
- El uso de este modelo para inferir datos personales reales no esta validado; su proposito es exclusivamente metodologico sobre datos ficticios.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch05
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y cabeza LM: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
