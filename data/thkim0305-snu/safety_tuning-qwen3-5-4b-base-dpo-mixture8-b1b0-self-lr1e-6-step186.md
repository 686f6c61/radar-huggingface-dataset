# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step186

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step186 es un checkpoint de ajuste fino por optimización de preferencias directa (DPO) construido sobre Qwen/Qwen3.5-4B-Base. Lo desarrolla el usuario thkim0305-SNU y su propósito es el alineamiento de seguridad: el modelo aprende a preferir trayectorias de respuesta que un juez binario estricto considera seguras frente a trayectorias del mismo modelo base que ese juez rechaza. El entrenamiento se detuvo en la actualización 186 de 186, es decir, el checkpoint final de la ejecución.

El modelo conserva la arquitectura multimodal del base Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`), con 4.659.865.088 parámetros en bf16, pero solo se ha entrenado el modelo de lenguaje: la torre de visión y la cabeza MTP mantienen los pesos originales sin tocar. Esto implica que se carga exactamente igual que el modelo base y mantiene sus capacidades de imagen-texto a texto, aunque el ajuste DPO se aplicó exclusivamente sobre texto.

Su relevancia es metodológica más que de rendimiento: documenta una receta reproducible de DPO de seguridad con pares generados por el propio modelo base (self-pairs), sin reutilización, sobre una mezcla de ocho fuentes que cubren seguridad agéntica, seguridad de código, consejo difícil y jailbreaks. La licencia Apache 2.0 y el formato estándar de Hugging Face lo hacen directamente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`); solo se entrena el modelo de lenguaje, visión y cabeza MTP congeladas |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en entrenamiento; contexto nativo del base no disponible en la información |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, transformers) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`), que actúa además como modelo de referencia congelado en el DPO. La arquitectura es la del base: un transformer multimodal con torre de visión y cabeza MTP, del que aquí solo se actualizan los pesos del modelo de lenguaje. La exportación desde Megatron torch_dist (`iter_0000185`) se realizó con `safety_tuning.hf_export`, refusionando las proyecciones GDN, aplicando el mapeo de nombres Qwen3.5 de Slime y copiando los pesos de visión y MTP del base con dtypes coincidentes con el índice original.

El objetivo es DPO con función sigmoide y beta 0.1, aplicado sobre la respuesta completa (razonamiento, respuesta y llamadas a herramientas). Los pares son self-pairs del propio Qwen3.5-4B-Base: la respuesta elegida es una trayectoria que superó un juez binario estricto (puntuación 1) y la rechazada es una trayectoria del mismo prompt que falló (puntuación 0), emparejadas una a una sin reutilización. El conjunto suma 5.941 pares procedentes de 4.600 prompts, distribuidos en ocho fuentes: agentalign_benign (652), agentalign_harmful (941), codesafetybench (481), difficult_advice (1.027), magicoder (600), star1_gp3 (432), star_benign_v2 (531) y wildjailbreak_benign (1.277). Se entrenaron 2 épocas con 93 actualizaciones de 64 pares cada una.

La configuración de optimización usa bf16 en cómputo con estado del optimizador en fp32, paralelismo tensorial 4, tasa de aprendizaje máxima de 1e-06 con calentamiento lineal del 10 % y decaimiento coseno hasta 2e-07, Adam con betas [0.9, 0.95] y epsilon 1e-08, sin weight decay y con recorte de gradiente 1.0. El prompt del estudiante emplea la plantilla de chat nativa del base con system "You are a helpful assistant." y modo thinking activado, sin Model Spec. Las trayectorias de más de 32.768 tokens se excluyeron completas, nunca se truncaron. Se publican checkpoints intermedios en las actualizaciones 23, 47, 70, 93, 116, 140, 163 y 186.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat nativa y modo thinking activable.
- Razonamiento explícito: el entrenamiento DPO cubre la trayectoria completa, incluido el bloque de razonamiento previo a la respuesta.
- Procesamiento de imagen y texto de entrada (`image-text-to-text`), heredado del base, aunque la torre de visión no se ha ajustado.
- Llamadas a herramientas (tool calls): las trayectorias de entrenamiento incluyen tool calls, por lo que el modelo está expuesto a ese formato.
- Comportamiento agéntico: las fuentes agentalign_benign y agentalign_harmful entrenan explícitamente preferencias en escenarios de agentes.
- Seguridad de código: la fuente codesafetybench ajusta respuestas ante peticiones de código potencialmente peligroso.
- Resistencia a jailbreaks: wildjailbreak_benign aporta pares orientados a mantener respuestas útiles ante intentos de manipulación.
- Consejo en situaciones difíciles: difficult_advice entrena respuestas prudentes en consultas sensibles.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Moderación y reescritura de respuestas en asistentes conversacionales: el ajuste DPO sobre agentalign_harmful y wildjailbreak_benign permite desplegar el modelo como capa de generación que tiende a preferir respuestas seguras ante prompts adversarios, con contexto de 32.768 tokens para conversaciones largas.
- Asistentes con herramientas en producción: al haberse entrenado sobre trayectorias que incluyen tool calls, el modelo puede integrarse en pipelines donde deba decidir cuándo invocar una función y cómo formular la llamada, con preferencia por trayectorias que superan un juez estricto.
- Generación de código con salvaguardas: codesafetybench y magicoder aportan pares que distinguen código útil de código con riesgo de abuso, adecuado para asistentes de programación que deben negarse a generar exploits o malware.
- Sistemas de consejo automatizado: la fuente difficult_advice entrena respuestas prudentes en consultas personales sensibles, útil en dominios de salud, finanzas o relaciones donde la respuesta imprudente es el fallo crítico.
- Evaluación de alineamiento y experimentación en seguridad: al publicarse ocho checkpoints intermedios y documentarse la receta completa, sirve como baseline reproducible para estudiar cómo evoluciona la preferencia de seguridad a lo largo del entrenamiento DPO.
- Investigación en DPO con self-pairs: el modelo materializa la técnica de generar pares elegido/rechazado con el propio modelo base y un juez binario, útil para replicar o comparar metodologías de anotación automática.
- Procesamiento de documentos con imagen y texto: aunque la torre de visión no se ajustó, el checkpoint conserva la capacidad multimodal del base y puede emplearse en tareas de extracción o descripción de imágenes combinadas con el comportamiento de seguridad aprendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9,3 GB solo para pesos, más caché KV y activaciones; con 32.768 tokens de contexto la caché KV puede añadir varios GB según el número de cabezas y capas.
- Cuantización a 8 bits: aproximadamente 4,7 GB de pesos; a 4 bits, en torno a 2,4 GB, aunque no se documentan cuantizaciones publicadas para este checkpoint.
- GPU recomendadas para bf16: A100 40/80 GB, H100 80 GB o L40S 48 GB para contexto largo; una RTX 4090 de 24 GB es suficiente para contexto moderado en bf16.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y RTX 5090 en bf16 con contexto recortado, y en GPUs de 12-16 GB si se cuantiza.
- El entrenamiento se ejecutó en 4x H100 80 GB (GPUs 4-7 de keti_h100_0) con paralelismo tensorial 4, lo que da una referencia del coste de ajuste.
- Opciones de despliegue: transformers (`Qwen3_5ForConditionalGeneration`), vLLM y TGI para servicio en GPU; llama.cpp y Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step186 | 4,66 B | 32.768 (entrenamiento) | Apache 2.0 | DPO de seguridad sobre base multimodal |
| Qwen/Qwen3.5-4B-Base | 4,66 B | no disponible | Apache 2.0 | Modelo base sin alinear |
| Otros checkpoints DPO de seguridad sobre Qwen3.5-4B-Base | no disponible | no disponible | no disponible | no disponible |

La única comparación directa documentada es con el modelo base Qwen/Qwen3.5-4B-Base, del que este checkpoint hereda arquitectura, pesos de visión y MTP, y tokenizador; la diferencia es el ajuste DPO sobre 5.941 pares de seguridad. No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se han publicado evaluaciones cuantitativas de seguridad ni de capacidad; no hay evidencia en la información disponible de que el ajuste DPO reduzca la utilidad general del modelo.
- El entrenamiento usa un juez binario estricto sobre trayectorias del propio modelo base; los sesgos de ese juez se transfieren directamente al modelo ajustado.
- Los pares elegido/rechazado provienen del mismo modelo base, lo que puede limitar la diversidad de estilos de respuesta aprendidos y producir sobreajuste a la distribución de trayectorias del base.
- El modo thinking está activado en el prompt de entrenamiento; el comportamiento con thinking desactivado no está documentado.
- Solo se ajustó el modelo de lenguaje: la torre de visión y la cabeza MTP mantienen los pesos del base y no han pasado por el proceso de alineamiento de seguridad.
- La ventana de entrenamiento es de 32.768 tokens y las trayectorias más largas se descartaron; el comportamiento más allá de ese límite no está validado.
- Idiomas soportados no especificados; el ajuste se realizó sobre un dataset cuya composición lingüística no se documenta.
- Riesgo de alucinación no evaluado; el DPO de seguridad no aborda la veracidad factual.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda auditar el comportamiento de seguridad antes de desplegar en producción, dado que no hay métricas publicadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step186
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Slime (framework de entrenamiento): no disponible en la información proporcionada
- Megatron-LM: no disponible en la información proporcionada
- Paper de DPO: no disponible en la información proporcionada
