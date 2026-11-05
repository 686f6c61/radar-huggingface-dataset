# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch04

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch04` es un checkpoint de investigacion derivado de `microsoft/phi-1_5`, un transformer decoder-only de 1.418 millones de parametros (1.4B) especializado originalmente en codigo. En concreto, parte de `locuslab/tofu_ft_phi-1.5`, la variante afinada sobre el dataset TOFU (Task of Fictitious Unlearning) que se emplea como referencia en la literatura de *machine unlearning*.

La particularidad del checkpoint es que aplica una estrategia de desaprendizaje hibrida: reinicializa las embeddings de entrada y la cabeza LM a partir del modelo original `microsoft/phi-1_5`, mientras conserva el resto de pesos del modelo afinado con TOFU, y entrena con una perdida combinada de *token IHL* sobre el split `forget05` mas entropia cruzada (peso 1.0) sobre el split `retain`. Este checkpoint corresponde a la epoch 4 de 20.

Es relevante porque documenta un punto intermedio reproducible en una campana de unlearning sobre un modelo pequeno, con manifiesto (`ihl_manifest.json`) y pesos completos en safetensors. No esta pensado como modelo de produccion, sino como artefacto de evaluacion para medir hasta que punto se olvida el conjunto `forget` sin degradar el `retain`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/INT8 no publicadas por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2.8 GB), requiere `trust_remote_code` por `custom_code` |
| Modelo base | locuslab/tofu_ft_phi-1.5 (a su vez derivado de microsoft/phi-1_5) |
| Estrategia de entrenamiento | IHL en `forget05` + 1.0 * CE en `retain`; embeddings de entrada y LM head reinicializados desde `microsoft/phi-1_5` |
| Checkpoint | epoch 4 de 20 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only denso de 1.4B parametros con atencion causal estandar (no MoE, no SSM, no hibrida). El checkpoint no introduce cambios estructurales; la innovacion esta en el regimen de entrenamiento. Segun la model card, las *input embeddings* y la *LM head* se inicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se mantienen desde `locuslab/tofu_ft_phi-1.5`. Esta reinicializacion parcial ("reset both") busca romper la asociacion aprendida entre tokens y contenidos del conjunto `forget` sin destruir la representacion interna del modelo.

La funcion de perdida combina un termino *token IHL* (Input/Hidden-space unLearning, segun la nomenclatura del autor) sobre el split `forget05` del dataset TOFU y una entropia cruzada con peso 1.0 sobre el split `retain`. El checkpoint publicado corresponde a la epoch 4 de un total de 20, por lo que representa un estado intermedio del proceso. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO; TOFU, el dataset de referencia, contiene pares pregunta-respuesta sobre autores ficticios y se usa habitualmente para medir olvido selectivo.

## Capacidades

- Generacion de texto en ingles con la calidad base de Phi-1.5 (modelo pequeno orientado a codigo y razonamiento basico).
- Razonamiento de un solo paso y respuesta a preguntas de conocimiento general, limitado por el tamano del modelo.
- Generacion y explicacion de codigo en Python y otros lenguajes, herencia directa del afinado original de Phi-1.5.
- Capacidad de *unlearning* selectivo: el checkpoint esta disenado para haber reducido la memorizacion del split `forget05` de TOFU.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- Multilingue: solo ingles declarado; no hay evidencia de capacidades en castellano.
- No dispone de modo *thinking*, vision ni audio.

## Casos de uso

- Evaluacion de algoritmos de *machine unlearning*: sirve como checkpoint de referencia en la epoch 4 para comparar curvas de olvido frente a otras estrategias (gradient ascent, NPO, RMU) sobre el mismo modelo base.
- Reproduccion de experimentos academicos: al publicarse pesos completos y manifiesto, permite reanudar o auditar el entrenamiento sin depender del codigo del autor.
- Estudio de la interaccion entre reinicializacion de embeddings y retencion de conocimiento: util para analizar cuanto del `retain` se preserva cuando se resetean solo las capas de entrada y salida.
- Analisis de *membership inference*: permite medir si el modelo sigue filtrando informacion del split `forget` a traves de ataques de extraccion o de probabilidad de tokens.
- Docencia e investigacion en privacidad de modelos: ejemplo concreto y reproducible de un pipeline de unlearning sobre un modelo de 1.4B que cabe en una unica GPU consumer.
- Base para *red-teaming* de borrado de datos: comprobar si la reinicializacion parcial deja residuos recuperables mediante *prompting* adversarial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2.8-3.0 GB solo de pesos, mas overhead de activaciones y cache KV (tipicamente 3.5-4.5 GB en total con contexto moderado).
- VRAM estimada en INT8: alrededor de 1.5 GB de pesos; en INT4, en torno a 0.8 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); A100/H100 no son necesarias dado el tamano.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y en GPUs de portatil con 8 GB o mas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el tag `custom_code`); vLLM y TGI solo si el codigo custom es compatible, lo cual no se confirma en la informacion disponible; llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch04 | 1.4B | no disponible | apache-2.0 | Unlearning TOFU (IHL + reset) |
| microsoft/phi-1_5 | 1.4B | 2048 | MIT (modelo original) | Modelo base de codigo |
| locuslab/tofu_ft_phi-1.5 | 1.4B | 2048 | no disponible en la info | Afinado TOFU (punto de partida) |
| Otros checkpoints TOFU sobre Phi-1.5 | 1.4B | 2048 | variable | Distintas estrategias de unlearning |

La comparacion con alternativas de la misma categoria (unlearning sobre TOFU) depende de checkpoints no incluidos en la informacion disponible; no se aportan cifras de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo de investigacion: no esta validado para uso en produccion ni para tareas generales de usuario final.
- Riesgo de alucinacion alto por el tamano (1.4B) y por el dominio original (codigo); no debe usarse como fuente de verdad.
- El objetivo declarado es olvidar `forget05`; no hay garantia de que el olvido sea completo ni de que no queden residuos recuperables.
- Solo ingles declarado; no se garantiza calidad en castellano ni en otros idiomas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; auditar antes de desplegar.
- Licencia apache-2.0 permite uso comercial del artefacto, pero el modelo base y el dataset TOFU pueden tener condiciones adicionales que deben revisarse por separado.
- El checkpoint corresponde a la epoch 4 de 20: no es el estado final del entrenamiento y su comportamiento puede diferir del modelo convergido.
- Sin datos publicados de benchmarks, no es posible afirmar mejoras medibles frente a otras estrategias de unlearning.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch04
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU: no disponible enlace directo en la informacion proporcionada
- Paper TOFU (Task of Fictitious Unlearning): no disponible enlace en la informacion proporcionada
- Manifiesto del autor: `ihl_manifest.json` incluido en el repositorio del modelo
