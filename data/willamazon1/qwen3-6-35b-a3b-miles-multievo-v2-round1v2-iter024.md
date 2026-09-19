# willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-round1v2-iter024

## Resumen

Este repositorio contiene un checkpoint de aprendizaje por refuerzo (RL) derivado del modelo base `Qwen/Qwen3.6-35B-A3B`. Lo publica el usuario de HuggingFace `willamazon1` y corresponde a la iteración 24 de la ejecución de entrenamiento denominada `miles-multievo-v2-round1-v2`. No se trata, por tanto, de un modelo final pulido, sino de un punto intermedio de una curva de entrenamiento por RL, pensado para comparar la evolución del modelo a lo largo de esa ejecución junto con otros checkpoints hermanos de la misma colección.

Arquitectónicamente es un transformer de tipo mezcla de expertos (MoE) con 40 capas, dimensión oculta de 2048, 256 expertos con enrutado top-8, atención híbrida (lineal y completa), una capa MTP (*multi-token prediction*) y una torre de visión que lo convierte en un modelo multimodal de entrada imagen-texto y salida texto. El recuento real de parámetros en safetensors es de 35.951.822.704 (unos 35,95 mil millones), con un vocabulario de 248.320 tokens y precisión de almacenamiento en bfloat16.

Su relevancia es limitada pero específica: sirve como material de estudio para quienes investigan el efecto del RL sobre un MoE multimodal con capacidades de agente, y como punto de partida para *fine-tuning* posterior. Se publica bajo licencia Apache 2.0, aunque el propio modelo base impone sus propias condiciones. En el momento de redactar esta ficha el repositorio no registra descargas ni valoraciones, y no se ha publicado ninguna evaluación cuantitativa asociada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (`Qwen3_5MoeForConditionalGeneration`), 40 capas, hidden 2048, 256 expertos con top-8, atención híbrida lineal/completa, 1 capa MTP, torre de visión |
| Parámetros totales | 35.951.822.704 (35,95 mil millones) |
| Parámetros activos | Aproximadamente 3.000 millones según la nomenclatura "A3B" del nombre del modelo base; no confirmado de forma explícita en la información proporcionada |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; solo se publican pesos en bfloat16. No hay versiones GGUF, AWQ, GPTQ ni FP8 en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (expertos MoE en disposición agrupada/fusionada: `mlp.experts.gate_up_proj` / `down_proj`) |
| Precisión de almacenamiento | bfloat16 |
| Tamaño del vocabulario | 248.320 |
| Tamaño del repositorio | 71,9 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Etapa de entrenamiento | RL, ejecución `miles-multievo-v2-round1-v2`, iteración 24 |

## Arquitectura y entrenamiento

El modelo es un MoE multimodal construido sobre la arquitectura declarada por el autor: 40 capas con dimensión oculta de 2048 y 256 expertos con enrutado top-8, lo que implica que en cada paso de decodificación solo se activa una fracción reducida de los parámetros totales. Combina atención lineal y atención completa de forma híbrida, un patrón habitual para reducir el coste de la caché KV en contextos largos manteniendo la calidad de recuperación de información a larga distancia. Incorpora además una capa de *multi-token prediction* (MTP), un componente que se ha utilizado tradicionalmente como cabecera auxiliar de entrenamiento y como mecanismo de decodificación especulativa en inferencia. La torre de visión es la que habilita el *pipeline* `image-text-to-text`.

Sobre el entrenamiento: el checkpoint es el resultado de una etapa de aprendizaje por refuerzo sobre el modelo base, en la iteración 24 de la ejecución `miles-multievo-v2-round1-v2`. No se especifican en la información disponible el número de tokens vistos, la composición del dataset, el algoritmo de RL empleado (PPO, GRPO, DPO u otro) ni los hiperparámetros. Sí se detalla el proceso de conversión: los pesos provienen de un checkpoint de entrenamiento en formato Megatron-LM `torch_dist`, convertidos a safetensors de HuggingFace con la herramienta `tools/convert_torch_dist_to_hf.py` de [slime](https://github.com/THUDM/slime), usando `--vocab-size 248320` para eliminar el relleno de embeddings y `-a/--add-missing-from-origin-hf` para recuperar la torre de visión desde el modelo base, ya que el checkpoint `torch_dist` solo contenía el modelo de lenguaje. Se verificó cada shard en busca de NaN/Inf y se comparó el conjunto completo de claves de tensores contra una conversión de referencia de la misma arquitectura.

Un detalle técnico relevante: al haberse tomado la torre de visión del modelo base, esta no ha sido modificada por la etapa de RL, de modo que las capacidades visuales del checkpoint son heredadas y no han sido objeto del entrenamiento por refuerzo.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Razonamiento y uso como agente: el repositorio declara explícitamente la etiqueta `agent`, aunque no se documentan las herramientas soportadas.
- Entrada multimodal imagen-texto: la torre de visión y el *pipeline* `image-text-to-text` permiten procesar imágenes junto con instrucciones textuales.
- Capacidades de lenguaje natural heredadas del modelo base Qwen3.6-35B-A3B, cuyo detalle no está documentado en este repositorio.
- Predicción multi-token mediante la capa MTP, potencialmente utilizable para decodificación especulativa, aunque no se documenta si el checkpoint la expone para inferencia.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Investigación sobre RL en modelos MoE multimodales: el checkpoint permite estudiar cómo evolucionan las capacidades de un MoE a lo largo de una ejecución de RL, comparando la iteración 24 con otros checkpoints de la misma colección y con el modelo base.
- Punto de partida para *fine-tuning* supervisado o DPO: al estar en safetensors y en formato compatible con `transformers`, se puede continuar el entrenamiento con frameworks estándar sin necesidad de conversiones previas.
- Análisis de estabilidad de checkpoints intermedios: útil para verificar si una iteración temprana de RL degrada o mejora tareas concretas antes de invertir en una ejecución completa.
- Experimentación con arquitecturas de atención híbrida: su combinación de atención lineal y completa sobre 40 capas lo hace adecuado para medir empíricamente el compromiso entre coste de caché KV y calidad en contextos largos.
- Desarrollo de prototipos multimodales con agentes: la combinación de torre de visión y etiqueta `agent` permite prototipar flujos que reciben capturas de pantalla o documentos escaneados y ejecutan acciones encadenadas.
- Evaluación de decodificación especulativa con MTP: la capa MTP permite medir la ganancia de *throughput* de técnicas especulativas sobre este modelo concreto.
- Preparación de destilación: al ser un MoE de ~36.000 millones de parámetros totales con un número reducido de parámetros activos, es un candidato razonable para destilar comportamiento hacia modelos densos más pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, y la búsqueda web asociada no devolvió resultados técnicos utilizables (únicamente páginas sin relación alguna con el modelo). Tampoco hay datos de evaluaciones comparativas frente al modelo base que permitan cuantificar el efecto del RL en la iteración 24.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 72 GB solo para pesos (el repositorio ocupa 71,9 GB), más la caché KV y las activaciones. No cabe en una GPU de 80 GB con contexto largo y vision activada sin recurrir a paralelismo.
- VRAM estimada en cuantización de 8 bits (aproximada, no publicada): unos 36 GB de pesos.
- VRAM estimada en cuantización de 4 bits (aproximada, no publicada): unos 18-20 GB de pesos, más caché KV.
- GPUs recomendadas: H100 80 GB, A100 80 GB o A6000 48 GB para bfloat16 con paralelismo de tensor; para 4 bits, una RTX 4090 de 24 GB puede ser suficiente con contexto moderado.
- ¿Cabe en GPU de consumo? En bfloat16 no. En 4 bits sí es viable en RTX 4090 / RTX 5090 con ventana de contexto reducida, siempre que se genere una cuantización propia, ya que el autor no publica ninguna.
- Opciones de despliegue: `transformers` con `device_map="auto"` es la vía documentada en la model card. vLLM, SGLang o TGI serían opciones habituales para servir este tipo de arquitectura, pero no hay confirmación de soporte para esta combinación concreta de atención híbrida, MoE y torre de visión. llama.cpp u Ollama requerirían una conversión a GGUF que el autor no proporciona, con la dificultad añadida de convertir expertos MoE fusionados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (iter024) | 35,95 mil millones | ~3 mil millones (según nomenclatura) | no disponible | apache-2.0 | safetensors, bfloat16 |
| Qwen/Qwen3.6-35B-A3B (base) | no disponible en esta información | no disponible | no disponible | no disponible | safetensors |
| Otras alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría. La única comparación defendible con los datos aportados es contra el propio modelo base, y en ese caso solo puede afirmarse que comparten arquitectura, vocabulario y torre de visión, y que difieren en que este checkpoint ha pasado por 24 iteraciones de RL; no hay métricas que permitan afirmar si eso supone una mejora.

## Limitaciones y advertencias

- Es un checkpoint intermedio de RL (iteración 24), no una versión final. Su calidad puede ser inferior a la del modelo base en tareas generales y su comportamiento puede ser inestable o inconsistente entre prompts similares.
- No se ha publicado ninguna evaluación: no hay evidencia cuantitativa de que el entrenamiento por RL haya mejorado nada.
- La torre de visión se copió del modelo base durante la conversión y no fue entrenada en la etapa de RL; el comportamiento multimodal puede diferir del esperado tras el ajuste.
- Riesgo de alucinación: no medido, pero al no existir evaluaciones ni datos de entrenamiento publicados no hay forma de acotarlo.
- Sesgos conocidos: no disponible. No se documenta composición del dataset ni proceso de alineación.
- Idiomas soportados: no disponible. No se puede asumir cobertura multilingüe sin verificación empírica.
- Longitud de contexto: no disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Licencia: Apache 2.0 en este repositorio, lo que en principio permite uso comercial. No obstante, el modelo deriva de `Qwen/Qwen3.6-35B-A3B` y las condiciones de la licencia del modelo base siguen aplicándose; conviene revisarlas antes de explotación comercial.
- Repositorio sin descargas ni valoraciones, publicado por un autor individual sin trayectoria verificable en la información disponible. No hay garantía de mantenimiento, soporte ni continuidad de la colección de checkpoints.
- Solo se distribuyen pesos en bfloat16, sin cuantizaciones oficiales, lo que encarece su despliegue en hardware de gama media.
- El uso de la etiqueta `agent` no va acompañado de documentación sobre plantillas de herramientas, formatos de llamada o evaluación de tareas agénticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-round1v2-iter024
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta de conversión utilizada (slime, THUDM): https://github.com/THUDM/slime
- Ruta concreta de la herramienta de conversión: `tools/convert_torch_dist_to_hf.py` dentro del repositorio de slime
- Paper, blog o demo oficial de este checkpoint: no disponible
- Resultados de la búsqueda web: no se encontró ninguna fuente técnica relacionada con este modelo; los resultados devueltos no guardan relación con el contenido de la ficha y se han descartado
