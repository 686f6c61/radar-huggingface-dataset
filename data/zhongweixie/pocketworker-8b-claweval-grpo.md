# zhongweixie/PocketWorker-8B-ClawEval-GRPO

## Resumen

PocketWorker-8B-ClawEval-GRPO es un ajuste fino por aprendizaje por refuerzo del modelo multimodal Qwen3-VL-8B-Instruct, publicado por el usuario zhongweixie. No se trata de un modelo nuevo desde cero, sino de un checkpoint derivado de un SFT interno (identificado en la model card como `exp_stage3_v2_merged`) y entrenado después con GRPO sobre un conjunto privado de tareas de agente. El objetivo declarado es mejorar el comportamiento agéntico (uso de herramientas y ejecución de tareas en varios pasos) en ese conjunto interno, no mejorar capacidades generales de visión o conversación.

El modelo tiene 8.767.123.696 parámetros (8,77 mil millones) en precisión bf16, con un repositorio de 17,5 GB en formato safetensors, y se distribuye con licencia Apache-2.0. La arquitectura es la de Qwen3-VL (transformer multimodal con torre visual y decodificador de lenguaje), heredada íntegramente del modelo base; el autor no documenta cambios estructurales, solo entrenamiento por RL. El pipeline declarado en Hugging Face es `image-text-to-text`, por lo que acepta imágenes y texto como entrada.

La relevancia de esta ficha es más metodológica que de rendimiento: el autor es explícito al afirmar que no existen métricas held-out fiables para este checkpoint y que las puntuaciones publicadas para Qwen3-VL-8B-Instruct no son aplicables. Además, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card menciona un identificador de repositorio distinto (`zhongweixie/qwen3vl-8b-claw-rl-grpo-stage3-iter560`), lo que sugiere un desajuste de nombres entre el artefacto y su documentación. Debe evaluarse como un experimento de investigación reproducible, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3-VL: torre visual + decodificador de lenguaje); sin cambios estructurales documentados respecto al modelo base |
| Parametros totales | 8.767.123.696 (8,77 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | No declarada por el autor. El modelo base Qwen3-VL-8B-Instruct soporta 256K tokens de forma nativa; este fine-tune hereda tokenizer y config, pero la conservación de esa ventana no está confirmada en la información disponible |
| Tipos de cuantizacion | No se publican artefactos cuantizados (ni GGUF, ni AWQ, ni GPTQ). Los pesos bf16 en safetensors son cuantizables con herramientas estándar, pero no hay versiones oficiales |
| Idiomas soportados | no disponible (el autor no declara cobertura lingüística; se hereda el tokenizer del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), repositorio de 17,5 GB; sin GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-VL-8B-Instruct sin modificaciones: un transformer multimodal que procesa imagen y texto y genera texto, con el módulo `Qwen3VLForConditionalGeneration` de la librería `transformers`. El entrenamiento adicional no altera la topología: el autor parte de un checkpoint SFT de una etapa previa (`exp_stage3_v2_merged`, cuyo upstream es Qwen3-VL-8B-Instruct) y aplica GRPO (Group Relative Policy Optimization) sobre un conjunto interno de tareas de agente. La configuración registrada es: 561 pasos de rollout, aproximadamente 3 épocas sobre 187 prompts, 8 muestras por prompt, batch de rollout 1 y batch global 8, con 8 GPU H800 en paralelo de tensor (TP=8) y colocación conjunta de actor y referencias. El juez de recompensa fue `qwen/qwen-2.5-72b-instruct` servido vía OpenRouter. El autor indica que la variante es la línea base del experimento `exp_rl_v5_v13_grpo_stage3` y que se diferencia de una variante GDPO únicamente en el estimador de ventaja. La tasa de aprendizaje, el coeficiente KL y el resto de hiperparámetros provienen del perfil `formal` de la herramienta `slime` y no se explicitan en la model card.

El detalle técnico más relevante para quien vaya a reproducir o auditar el modelo es el proceso de conversión: el checkpoint final (`iter_0000560`) se generó en formato Megatron distribuido y se convirtió a Hugging Face con `slime/tools/convert_torch_dist_to_hf.py`; los pesos ausentes en la conversión, así como el tokenizer y la config, se tomaron del checkpoint base `exp_stage3_v2_merged_sharded`. Es decir, hay componentes del artefacto final que no provienen del paso de RL y que el autor no detalla individualmente. El conjunto de datos de RL (187 prompts) no es público, lo que impide reproducir la distribución de tareas ni auditar el sesgo del juez de recompensa.

## Capacidades

- Generación de texto e imagen-a-texto: pipeline `image-text-to-text`, con entrada multimodal (imagen + texto) y salida textual.
- Comportamiento agéntico: el entrenamiento por RL se realizó sobre un conjunto interno de tareas de agente, por lo que se espera mejora en ejecución de tareas en varios pasos dentro de ese dominio (no verificado con métricas públicas).
- Uso de herramientas: la model card etiqueta el modelo con `agent`; el soporte de tool calling no está documentado de forma explícita ni con ejemplos de esquema.
- Razonamiento multi-paso: implícito en el entrenamiento con GRPO sobre tareas de agente; sin evaluación pública que lo cuantifique.
- Conversacional: etiqueta `conversational` presente; el modelo base es de tipo instruct, por lo que conserva el formato de chat de Qwen3-VL.
- Capacidades multilingües: no documentadas; se heredan las del modelo base, sin garantía declarada.
- Capacidades especiales (modo thinking, audio, vídeo): no documentadas en la información disponible.

## Casos de uso

- Automatización de tareas agénticas internas: es el caso de uso para el que fue entrenado. Se usaría como política de un agente que recibe observaciones (texto e imagen) y emite acciones sobre un entorno de herramientas, aprovechando el ajuste por RL sobre el conjunto interno del autor. Adecuado únicamente si el dominio se parece al de entrenamiento.
- Investigación en RL para agentes: sirve como checkpoint de referencia para comparar variantes de estimador de ventaja (GRPO frente a GDPO) partiendo del mismo SFT, tal y como describe el autor. Su valor aquí es metodológico y reproducible a nivel de configuración.
- Experimentos de conversión Megatron a Hugging Face: el repositorio documenta el pipeline de conversión y las limitaciones de pesos faltantes, lo que lo hace útil como caso de estudio de portabilidad de checkpoints.
- Asistencia sobre capturas de pantalla o diagramas: al conservar la torre visual de Qwen3-VL-8B-Instruct, puede describir o razonar sobre imágenes en tareas de documentación técnica, siempre que la calidad del base no se haya degradado por el RL (no verificado).
- Evaluación comparativa de degradación por RL: útil para estudiar la pérdida de capacidades generales (catastrophic forgetting) al entrenar con 187 prompts durante 3 épocas sobre un modelo instruct multimodal.
- Prototipado de agentes con requisitos de ventana larga: si se confirma la herencia de los 256K tokens del base, podría emplearse en tareas que requieran mucho contexto visual y textual; conviene validar empíricamente este extremo antes de diseñar sobre esa suposición.
- Docencia y divulgación: ejemplo didáctico de cómo se documenta (y cómo no se valida) un fine-tune de RL, incluida la advertencia explícita del autor sobre la ausencia de métricas held-out.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor indica expresamente que **no existe ninguna cifra held-out fiable** para este checkpoint, y detalla dos motivos: (1) el trabajo de línea base cold-start (identificador 373736) no arrancó por falta de `ninja` en el JIT de SGLang, por lo que no hay baseline comparable; y (2) el script de evaluación held-out rechaza parte de las tareas (las de tipo snapshot de sandbox y las de entrada multimodal), con una cobertura inferior a 30 ítems del total, de modo que su puntuación agregada no puede citarse como resultado del conjunto completo. El valor `eval=0.506` que aparece registrado corresponde al checkpoint SFT de partida, no a este modelo. Cualquier cifra de MMLU, HumanEval, GSM8K u OCR atribuida a Qwen3-VL-8B-Instruct **no es aplicable** a este artefacto.

## Requisitos de hardware

- VRAM estimada en bf16: los pesos ocupan aproximadamente 17,5 GB, por lo que la inferencia necesita del orden de 20-24 GB incluyendo caché KV y overhead del runtime, dependiendo de la longitud de contexto y del tamaño de las imágenes de entrada.
- VRAM estimada en cuantización de 8 bits: alrededor de 9-10 GB de pesos, más caché KV; en 4 bits, alrededor de 5-6 GB de pesos. Estas cifras son estimaciones de cálculo, no medidas publicadas por el autor.
- GPU de datacenter: el entrenamiento se realizó con 8×H800 (TP=8, colocate). Para inferencia basta una A100 40/80 GB o una H100 para contextos largos y lotes grandes.
- GPU de consumo: cabe en bf16 en una RTX 4090 o RTX 3090 de 24 GB con contexto moderado; en 4 bits puede caber en tarjetas de 12-16 GB, siempre con cuantización propia (no hay GGUF oficial).
- Opciones de despliegue: `transformers` con `Qwen3VLForConditionalGeneration` y `AutoProcessor` (ruta documentada por el autor); vLLM o SGLang para servicio, siempre que la versión soporte la arquitectura Qwen3-VL; llama.cpp/Ollama solo tras convertir los pesos a GGUF por cuenta propia.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento adicional | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PocketWorker-8B-ClawEval-GRPO | 8,77 B | No declarado (base: 256K) | GRPO sobre tareas de agente internas (187 prompts) | Apache-2.0 | Repositorio público, 0 descargas, sin benchmarks |
| Qwen3-VL-8B-Instruct | ~8,8 B | 256K nativo en la familia Qwen3-VL | SFT + preferencias (no detallado aquí) | Apache-2.0 | Modelo base ampliamente distribuido, con benchmarks publicados por Qwen |
| Qwen2.5-VL-7B-Instruct | ~8,3 B | 128K en la familia Qwen2.5-VL | SFT + preferencias | Apache-2.0 | Amplia adopción, versiones cuantizadas de terceros |
| InternVL3-8B | ~8 B | No verificado en esta ficha | SFT multimodal | No verificada en esta ficha | Repositorio público con benchmarks propios |

La comparación relevante es contra su propio modelo base: este checkpoint no aporta métricas que demuestren mejora sobre Qwen3-VL-8B-Instruct y el autor lo advierte de forma explícita. Frente a Qwen2.5-VL-7B-Instruct e InternVL3-8B, la diferencia principal no es de capacidad bruta sino de propósito: aquellos son modelos generalistas con evaluación publicada, mientras que este es un artefacto de investigación con un dominio de entrenamiento estrecho y sin validación externa. En parámetros y licencia son comparables; en trazabilidad y evidencia empírica, no.

## Limitaciones y advertencias

- Ausencia total de evaluación held-out: el propio autor desaconseja tratar el modelo como mejor que su checkpoint de partida. No hay ninguna cifra verificable de calidad.
- Sesgo de dominio: el RL se hizo sobre 187 prompts de un conjunto interno de tareas de agente, con aproximadamente 3 épocas. Es un volumen muy pequeño, con riesgo alto de sobreajuste a esas tareas y de degradación de capacidades generales de visión y conversación.
- Riesgo de reward hacking: el juez de recompensa es un LLM (`qwen/qwen-2.5-72b-instruct` vía OpenRouter), lo que introduce los sesgos y errores sistemáticos de ese juez en la política aprendida. No se documenta ninguna mitigación.
- Desajuste de identificadores: la model card se refiere a `zhongweixie/qwen3vl-8b-claw-rl-grpo-stage3-iter560`, no al ID del repositorio consultado. El ejemplo de código de la card no funcionará tal cual contra este repositorio.
- Conversión incompleta verificable: parte de los pesos, el tokenizer y la config provienen del checkpoint base y no del paso de RL; el autor no enumera qué tensores faltaban. Existe riesgo de inconsistencias silenciosas.
- Alucinación: no medida. Al ser un fine-tune de un modelo instruct multimodal, mantiene el riesgo típico de generar descripciones de imágenes o resultados de herramientas que no se corresponden con la evidencia.
- Idiomas: sin cobertura declarada; no debe asumirse un comportamiento correcto en castellano ni en idiomas distintos de los del modelo base.
- Contexto: la ventana de 256K es una herencia del base, no una especificación confirmada de este checkpoint. No diseñar sobre esa cifra sin verificación empírica.
- Licencia: Apache-2.0 permite uso comercial, pero el conjunto de datos de RL es privado y no se documenta la procedencia de las imágenes ni de los prompts, por lo que la cadena de derechos del ajuste no es auditable.
- Madurez: 0 descargas y 0 likes, publicado y sin actualizaciones posteriores en el momento de la consulta. No hay comunidad, issues ni soporte.
- Formato: no hay GGUF ni cuantizaciones oficiales; cualquier despliegue en consumer GPU exige conversión propia, con el consiguiente riesgo de errores de cuantización no reportados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zhongweixie/PocketWorker-8B-ClawEval-GRPO
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Herramienta de entrenamiento y conversión citada en la model card (`slime`): https://github.com/THUDM/slime
- Repositorio oficial de la familia Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
