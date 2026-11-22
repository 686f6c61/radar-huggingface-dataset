# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step91

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step91 es un checkpoint intermedio de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El modelo se ha entrenado con el objetivo de mejorar el comportamiento de seguridad (safety tuning) mediante la destilacion de trayectorias generadas por un modelo profesor de mayor tamano (Qwen3.8-27B) sobre un conjunto de datos de seguridad denominado "mixture-8".

Se trata de un snapshot parcial: solo se han completado 91 de las 730 actualizaciones del optimizador previstas (0,249 de 2 epocas), por lo que no es un modelo final sino una instantanea de un entrenamiento en curso. Los pesos se exportan en bf16 con el formato Hugging Face `Qwen3_5ForConditionalGeneration`, e incluyen la torre de vision y la cabeza MTP sin modificar (solo se entreno el modelo de lenguaje).

El modelo cuenta con 4.659.865.088 parametros totales, un contexto de entrenamiento de 32.768 tokens y licencia Apache 2.0. Su relevancia radica en que documenta una receta completa de safety tuning sobre una arquitectura Qwen3.5 multimodal, con detalle del dataset, hiperparametros y procedencia del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3_5ForConditionalGeneration), con torre de vision y cabeza MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`), una arquitectura transformer multimodal de tipo `Qwen3_5ForConditionalGeneration` que incluye una torre de vision y una cabeza MTP (multi-token prediction). En este checkpoint solo se ha entrenado el modelo de lenguaje; la torre de vision y la cabeza MTP conservan los pesos originales del modelo base, de modo que el checkpoint se carga exactamente igual que el modelo base.

El entrenamiento consiste en un SFT de parametros completos sobre trayectorias generadas por un profesor (Qwen3.8-27B, snapshot `1d4bf0f2ff60`), con perdida calculada sobre el razonamiento, la respuesta final y las llamadas a herramientas. Se utilizo el framework Slime junto con Megatron-LM, con computo en bf16 y estado del optimizador en fp32. El dataset "mixture-8" contiene 46.626 trayectorias provenientes de 11.757 prompts, con la siguiente composicion: star1_gp3 (3.998), star_benign_v2 (3.651), agentalign_harmful (7.919), agentalign_benign (7.734), codesafetybench (3.598), magicoder (3.838), difficult_advice (7.905) y wildjailbreak_benign (7.983). El profesor genero cuatro respuestas muestreadas por prompt y se conservaron todas las validas.

Los hiperparametros incluyen una tasa de aprendizaje pico de 1e-05 con calentamiento lineal del 10% y decaimiento coseno hasta 2e-06, Adam con betas [0.9, 0.95], eps 1e-08, weight decay 0.1 y recorte de gradiente 1.0. Se planificaron 2 epocas con 365 actualizaciones de 128 secuencias cada una; las trayectorias mas largas que el contexto se excluyeron por completo, nunca se truncaron. El checkpoint se entreno en una unica GPU NVIDIA B200 y se exporto desde el checkpoint Megatron `iter_0000090` mediante `safety_tuning.hf_export`, con refusion de las proyecciones GDN y mapeo de nombres de Slime para Qwen3.5.

## Capacidades

- Generacion de texto conversacional con plantilla de chat nativa de Qwen3.5 y modo de razonamiento (thinking) activable.
- Razonamiento multi-paso: el entrenamiento incluye perdida sobre las trayectorias de razonamiento del profesor.
- Llamadas a herramientas (tool calling / function calling): el SFT incluye perdida sobre las llamadas a herramientas de las trayectorias.
- Comportamiento orientado a seguridad: el dataset incluye fuentes de seguridad en codigo (codesafetybench), consejos dificiles (difficult_advice) y datos de alineacion agentica (agentalign).
- Capacidad multimodal potencial heredada del modelo base (torre de vision intacta), aunque el entrenamiento SFT solo afecto al modelo de lenguaje.
- Capacidad de prediccion multi-token (cabeza MTP) heredada del modelo base.
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de safety tuning en investigacion: el checkpoint permite analizar la evolucion del comportamiento de seguridad en un punto intermedio del entrenamiento (0,249 epocas) y compararlo con checkpoints posteriores de la misma receta.
- Generacion de respuestas seguras en asistentes conversacionales: el modelo ha sido ajustado sobre trayectorias benignas y de rechazo, lo que lo hace adecuado para prototipar asistentes que manejen solicitudes sensibles con contexto de hasta 32.768 tokens.
- Analisis de seguridad en codigo: gracias a la inclusion de codesafetybench en el dataset, puede emplearse para estudiar como un modelo pequeno responde ante peticiones de codigo potencialmente peligrosas.
- Investigacion sobre destilacion de profesores: sirve como caso de estudio de destilacion desde un modelo de 27B a uno de 4B con datos de seguridad y razonamiento, permitiendo medir la transferencia de capacidades.
- Evaluacion de alineacion agentica: el dataset agentalign (harmful y benign) permite estudiar el comportamiento del modelo en escenarios de agentes multi-paso con llamadas a herramientas.
- Base para experimentos de ajuste posterior: al ser un checkpoint intermedio con licencia Apache 2.0, puede utilizarse como punto de partida para experimentos de DPO, RLHF o ajuste adicional en entornos de investigacion.
- Analisis de robustez ante jailbreaks: la inclusion de wildjailbreak_benign en el entrenamiento permite evaluar la resistencia del modelo ante prompts adversariales benignos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para los pesos (4.659.865.088 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomiendan 16-24 GB de VRAM para contexto largo.
- GPU recomendadas: NVIDIA B200 (utilizada en el entrenamiento), A100 40/80 GB, H100 80 GB para inferencia con contexto completo de 32.768 tokens.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas (RTX 4090 24 GB, RTX 4080 16 GB) en bf16 o cuantizado; en 8 GB requeriria cuantizacion a 4 bits.
- Opciones de despliegue: transformers (libreria nativa del checkpoint), vLLM y TGI para servir en produccion; llama.cpp u Ollama requeririan conversion a GGUF, no documentada en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step91 | 4,66B | 32.768 | Apache 2.0 | Checkpoint intermedio (0,249 ep) |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | Apache 2.0 | Modelo base de referencia |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible | Profesor usado para destilacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: solo se han completado 91 de 730 actualizaciones (0,249 de 2 epocas); el autor indica explicitamente que el entrenamiento sigue en curso y que no es un modelo final.
- La torre de vision y la cabeza MTP no se entrenaron, por lo que las capacidades multimodales no han sido ajustadas para seguridad ni para la tarea de destino.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada; el dataset incluye fuentes de seguridad y de alineacion, pero no se detallan analisis de sesgo.
- Idiomas soportados: no disponibles; no se especifica la cobertura multilingue del ajuste.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al ser un checkpoint de investigacion intermedio no se recomienda su uso en produccion sin evaluacion adicional.
- El dataset incluye fuentes de contenido danino (agentalign_harmful, difficult_advice) destiladas con un model spec especifico (MODEL_SPEC_V2, GP3); el comportamiento resultante puede estar condicionado por ese spec del profesor.
- Sin descargas ni validacion de la comunidad (0 descargas, 0 likes en el momento de la consulta), lo que limita la evidencia externa sobre su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step91
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
