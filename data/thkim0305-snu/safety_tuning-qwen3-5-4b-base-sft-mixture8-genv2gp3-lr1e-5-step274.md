# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step274

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step274 es un checkpoint intermedio de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El modelo se entrena con el objetivo de mejorar el comportamiento de seguridad del modelo base, destilando trayectorias generadas por un profesor de mayor tamano (Qwen/Qwen3.8-27B) sobre un conjunto de datos de seguridad denominado "mixture-8". Se trata de un snapshot del entrenamiento en curso: corresponde a 274 de 730 actualizaciones del optimizador (0,751 de 2 epocas), por lo que no es un modelo final.

Arquitectonicamente es un transformer multimodal de tipo `Qwen3_5ForConditionalGeneration`, con 4.659.865.088 parametros totales (aproximadamente 4,66 mil millones) y una longitud de contexto de entrenamiento de 32.768 tokens. El checkpoint conserva intactos el torre de vision y la cabeza MTP del modelo base; solo se ha entrenado el modelo de lenguaje. Los pesos se distribuyen en formato safetensors en bf16, con un tamano de repositorio de 9,3 GB.

Su relevancia radica en que documenta una receta reproducible de safety tuning sobre un modelo base pequeno (4B) mediante destilacion de trayectorias de un profesor mayor, usando Slime + Megatron-LM. Al ser un checkpoint intermedio, resulta util para estudiar la evolucion del entrenamiento y para experimentacion, no para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (torre de vision + modelo de lenguaje + cabeza MTP) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`), un transformer multimodal con torre de vision, modelo de lenguaje y cabeza MTP (multi-token prediction). En este checkpoint solo se ha entrenado el modelo de lenguaje mediante SFT de parametros completos sobre trayectorias de un profesor; la torre de vision y la cabeza MTP conservan los pesos originales del base, de modo que el checkpoint se carga exactamente igual que el modelo base.

El entrenamiento se realizo con Slime + Megatron-LM, computo en bf16 con estado del optimizador en fp32. El conjunto "mixture-8" consta de 46.626 trayectorias procedentes de 11.757 prompts, con 2 epocas y 365 actualizaciones de 128 secuencias. La tasa de aprendizaje fue de 1e-05 de pico con calentamiento lineal del 10 % y decaimiento coseno hasta 2e-06; Adam con betas [0,9, 0,95], eps 1e-08, weight decay 0,1 y recorte de gradiente 1,0. El contexto de entrenamiento fue de 32.768 tokens, excluyendo por completo las trayectorias mas largas (nunca truncadas). El profesor fue Qwen/Qwen3.8-27B (snapshot `1d4bf0f2ff60`), con cuatro respuestas muestreadas por prompt y conservando todas las validas. Las fuentes de datos son star1_gp3 (3.998), star_benign_v2 (3.651), agentalign_harmful (7.919), agentalign_benign (7.734), codesafetybench (3.598), magicoder (3.838), difficult_advice (7.905) y wildjailbreak_benign (7.983) trayectorias. Las fuentes daninas regeneradas (codesafetybench, difficult_advice, agentalign_harmful) usaron prompts de generacion v2 con MODEL_SPEC_V2 (GP3, Qwen3.8-27B). El prompt del estudiante fue la plantilla nativa de chat del Base con system "You are a helpful assistant." y thinking activado, sin Model Spec. El run se ejecuto en 1x NVIDIA B200; el checkpoint Megatron `iter_0000273` se convirtio con `safety_tuning.hf_export` (proyecciones GDN refusionadas, mapeo de nombres Qwen3.5 de Slime, pesos de vision/MTP copiados del base y dtypes ajustados al indice base).

## Capacidades

- Generacion de texto conversacional con plantilla de chat nativa y modo thinking activable (`enable_thinking=True`).
- Razonamiento multi-paso: el entrenamiento incluye perdida sobre el razonamiento, la respuesta final y las llamadas a herramientas.
- Tool calling / function calling: las trayectorias de entrenamiento incluyen llamadas a herramientas (fuentes agentalign y magicoder).
- Capacidades multimodales heredadas del base (image-text-to-text), aunque la torre de vision no fue entrenada en este checkpoint.
- Comportamiento orientado a seguridad: entrenado sobre datos de seguridad, benignos y adversariales (jailbreaks, consejos dificiles, seguridad de codigo).
- Generacion de codigo: incluye datos de magicoder y codesafetybench.
- Capacidades multilingues: no disponibles (no se documentan idiomas).

## Casos de uso

- Investigacion sobre safety tuning: analizar como evoluciona el comportamiento de seguridad entre checkpoints intermedios (91, 183, 274, 365, 456, 548, 639, 730 actualizaciones) para estudiar curvas de aprendizaje y degradacion.
- Evaluacion de destilacion de trayectorias: comparar las respuestas del estudiante 4B con las del profesor Qwen3.8-27B para medir la fidelidad de la destilacion en tareas de seguridad.
- Generacion de datos sinteticos de seguridad: usar el modelo para producir respuestas y razonamientos etiquetados que alimenten pipelines de evaluacion o de entrenamiento adicional.
- Experimentacion con tool calling: probar flujos de agente con llamadas a funciones en un modelo pequeno de 4B, aprovechando que el SFT incluye perdida sobre tool calls.
- Analisis de robustez frente a jailbreaks: emplear el checkpoint para medir la resistencia a prompts adversariales (wildjailbreak, agentalign_harmful) en un modelo de 4B.
- Base para ajuste posterior: servir como punto de partida (initialization) para SFT o DPO adicionales en dominios especificos, dado que la licencia Apache 2.0 lo permite.
- Prototipado en entornos con recursos limitados: al ser un modelo de 4,66B en bf16, puede ejecutarse en GPUs de consumo para pruebas de concepto, no para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-24 GB para contextos largos.
- Cuantizacion: no se documentan versiones GGUF/AWQ/GPTQ; seria necesario generarlas a partir de los safetensors bf16.
- GPUs recomendadas: NVIDIA B200 (usada en entrenamiento), A100 40/80 GB, H100; para inferencia en bf16 una RTX 4090 (24 GB) puede ser suficiente con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) o RTX 3090 (24 GB) en bf16 con contexto limitado; en GPUs de 16 GB requeriria cuantizacion.
- Opciones de despliegue: transformers (soporte nativo `Qwen3_5ForConditionalGeneration`), vLLM y TGI (compatibilidad con endpoints declarada en los tags), llama.cpp/Ollama solo tras conversion a GGUF (no disponible en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step274 | 4,66B | 32.768 | Apache 2.0 | Hugging Face | Checkpoint intermedio de SFT de seguridad |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible en la informacion | Apache 2.0 | Hugging Face | Modelo base sin safety tuning |
| Qwen/Qwen3.8-27B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Hugging Face | Profesor usado para destilar trayectorias |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (274 de 730 actualizaciones, 0,751 de 2 epocas): el entrenamiento sigue en curso y no representa un modelo final ni validado.
- No se han publicado benchmarks ni evaluaciones de seguridad formales; no hay evidencia cuantitativa de mejora frente al base.
- La torre de vision y la cabeza MTP no fueron entrenadas: las capacidades multimodales son las del base y no estan adaptadas al tuning de seguridad.
- Riesgo de alucinacion inherente a un modelo de 4B; no se documentan mitigaciones especificas.
- Sesgos conocidos: no disponibles; los datos de entrenamiento incluyen fuentes benignas y daninas, pero no se reporta analisis de sesgo.
- Idiomas soportados no documentados; el comportamiento multilingue no esta garantizado.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigacion sin evaluacion, no se recomienda su uso en produccion sin validacion propia.
- El contexto de entrenamiento es de 32.768 tokens; trayectorias mas largas fueron excluidas, lo que puede limitar el rendimiento en contextos extensos.
- El modelo se entreno con thinking activado y sin Model Spec; el comportamiento fuera de esa configuracion no esta caracterizado.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step274
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- Slime: no disponible
- Megatron-LM: no disponible
- Paper, blog o demo adicionales: no disponibles
