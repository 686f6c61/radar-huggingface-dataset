# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step274

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step274 es un checkpoint intermedio de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo del entrenamiento es el alineamiento de seguridad: el modelo se entrena sobre trayectorias destiladas de un profesor mayor (Qwen/Qwen3.8-27B) para aprender a razonar y responder de forma segura ante prompts benignos y adversarios, incluyendo codigo, consejo dificil y ataques de jailbreak.

El checkpoint corresponde al update 274 de 730 (iteracion Megatron 273, 0.751 de 2 epocas), por lo que no es un modelo final sino una instantanea de un proceso de entrenamiento aun en curso. Los pesos son bf16 con la clase `Qwen3_5ForConditionalGeneration`; solo se entreno el modelo de lenguaje, mientras que la torre de vision y la cabeza MTP conservan los pesos originales del base.

Con 4.659.865.088 parametros totales, contexto de entrenamiento de 32.768 tokens y licencia Apache 2.0, resulta relevante para quien investigue tecnicas de safety tuning con destilacion de trayectorias, recetas Slime + Megatron-LM y evaluacion de checkpoints intermedios en modelos multimodales de la familia Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (clase `Qwen3_5ForConditionalGeneration`), con torre de vision y cabeza MTP heredadas del base |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`), un transformer multimodal de la familia Qwen3.5 con torre de vision y cabeza MTP (multi-token prediction). El ajuste es SFT de parametros completos sobre trayectorias del profesor Qwen/Qwen3.8-27B (snapshot `1d4bf0f2ff60`), con perdida calculada sobre el razonamiento, la respuesta final y las llamadas a herramientas. Solo se entreno el modelo de lenguaje; la torre de vision y la cabeza MTP son los pesos originales del base, de modo que el checkpoint carga exactamente igual que el modelo base.

La receta usa Slime + Megatron-LM con computo bf16 y estado del optimizador en fp32, tensor parallel 2 sobre 2x NVIDIA RTX PRO 6000 Blackwell. El dataset "mixture-8" contiene 46.626 trayectorias procedentes de 11.757 prompts, con 2 epocas de 365 updates de 128 secuencias cada una. Se empleo learning rate pico de 2e-05 con warmup lineal del 10% y decaimiento coseno hasta 4e-06, Adam con betas [0.9, 0.95], eps 1e-08, weight decay 0.1 y grad clip 1.0. Las trayectorias mas largas de 32.768 tokens se excluyeron enteras, nunca se truncaron. El prompt del estudiante usa la plantilla nativa del base con system "You are a helpful assistant." y thinking activado, sin Model Spec.

Las ocho fuentes de datos son star1_gp3 (3.998 trayectorias), star_benign_v2 (3.651), agentalign_harmful (7.919), agentalign_benign (7.734), codesafetybench (3.598), magicoder (3.838), difficult_advice (7.905) y wildjailbreak_benign (7.983). Para las fuentes daninas regeneradas (codesafetybench, difficult_advice, agentalign_harmful) se usaron prompts de generation_v2.txt junto con MODEL_SPEC_V2 (GP3, Qwen3.8-27B). El profesor genero cuatro respuestas muestreadas por prompt y se conservaron todas las validas.

## Capacidades

- Generacion de texto conversacional con plantilla de chat nativa de Qwen3.5.
- Modo thinking activable mediante `enable_thinking=True` en la plantilla de chat.
- Razonamiento multi-paso sobre trayectorias de profesor, con perdida sobre el razonamiento intermedio.
- Llamadas a herramientas (tool calling): la perdida incluye las llamadas a herramientas presentes en las trayectorias.
- Comportamiento orientado a seguridad: entrenado sobre fuentes benignas y adversarias (jailbreaks, codigo inseguro, consejo dificil).
- Capacidad multimodal heredada del base (torre de vision sin entrenar): el pipeline declarado es image-text-to-text.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en safety tuning: sirve como checkpoint intermedio para estudiar la evolucion del comportamiento seguro a lo largo del entrenamiento (updates 91, 183, 274, 365, 456, 548, 639 y 730), comparando cada instantanea.
- Evaluacion de destilacion de trayectorias: permite medir cuanto del comportamiento del profesor Qwen3.8-27B se transfiere a un estudiante de 4B en tareas de razonamiento y seguridad.
- Generacion de codigo con conciencia de seguridad: entrenado con codesafetybench y magicoder, puede emplearse para evaluar si el modelo evita patrones inseguros en la generacion de codigo.
- Analisis de robustez frente a jailbreaks: el uso de wildjailbreak_benign y agentalign_harmful lo hace adecuado para pruebas de resistencia a prompts adversarios en pipelines de red teaming.
- Asistente conversacional con tool calling: la perdida sobre llamadas a herramientas permite integrarlo en flujos de agentes que requieran invocar funciones, con contexto de hasta 32.768 tokens.
- Consejo responsable: la fuente difficult_advice entrena respuestas matizadas ante consultas delicadas, util para prototipos de asistentes en dominios sensibles.
- Reproducibilidad de recetas: al documentarse framework (Slime + Megatron-LM), hiperparametros y fuentes de datos, sirve como referencia para replicar recetas de SFT a escala 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-24 GB para contextos moderados.
- GPU recomendadas: el entrenamiento se realizo con 2x NVIDIA RTX PRO 6000 Blackwell en tensor parallel 2; para inferencia, una GPU con 24 GB o mas (RTX 4090, RTX 5090, A6000, L40S) es suficiente en bf16.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas en bf16; en cuantizaciones de 8 o 4 bits (no publicadas oficialmente) cabria en GPUs de 12-16 GB.
- Opciones de despliegue: transformers (receta oficial de la model card), vLLM y TGI para servir en produccion si el soporte de la arquitectura qwen3_5 esta disponible; llama.cpp/Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8 (este) | 4,66 B | 32.768 | Apache 2.0 | Checkpoint intermedio de SFT de seguridad, multimodal heredado |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible en la informacion | Apache 2.0 | Modelo base sin ajuste de seguridad |
| Qwen/Qwen3.8-27B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Profesor usado para destilar trayectorias |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y rol en la receta.

## Limitaciones y advertencias

- Es un checkpoint intermedio (update 274 de 730, 0.751 de 2 epocas): el entrenamiento no ha finalizado y su comportamiento puede diferir del modelo final.
- Al estar entrenado sobre trayectorias destiladas de un profesor, puede heredar sesgos y errores del profesor Qwen3.8-27B.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad ni benchmarks.
- La torre de vision y la cabeza MTP no se entrenaron; las capacidades multimodales no han sido adaptadas al ajuste de seguridad.
- Idiomas soportados no documentados: no se garantiza un comportamiento multilingue alineado.
- El contexto de entrenamiento es de 32.768 tokens; no se documenta soporte de contextos mayores en inferencia.
- Uso comercial permitido por Apache 2.0, pero sin garantias del autor; conviene revisar la licencia del modelo base enlazada en la model card.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni reportes de uso en produccion.
- El nombre del checkpoint incluye hiperparametros y pasos concretos; no debe confundirse con una version estable.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step274
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Profesor (referenciado en la model card): Qwen/Qwen3.8-27B
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
