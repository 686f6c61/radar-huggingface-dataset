# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step639

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step639 es un checkpoint intermedio de ajuste fino supervisado (SFT) sobre Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El modelo se entrena con el objetivo de mejorar el comportamiento de seguridad del modelo base mediante la destilación de trayectorias generadas por un profesor de mayor tamano (Qwen/Qwen3.8-27B). Se trata de un snapshot en progreso: cubre 639 de las 730 actualizaciones del plan de entrenamiento (1,75 de 2 epocas), por lo que no debe considerarse un modelo final.

Arquitectonicamente hereda la estructura de Qwen3.5-4B-Base (transformer multimodal con torre de vision y cabeza MTP), con 4.659.865.088 parametros totales en bf16. Solo se ha entrenado el modelo de lenguaje; la torre de vision y la cabeza MTP conservan los pesos originales del modelo base, de modo que el checkpoint se carga exactamente igual que Qwen3.5-4B-Base. El contexto de entrenamiento es de 32.768 tokens.

Su relevancia radica en que documenta de forma transparente una receta de safety tuning con destilacion desde un profesor mayor, usando frameworks de entrenamiento a gran escala (Slime + Megatron-LM) y un conjunto de datos mixto orientado a seguridad (mixture-8). Es util para investigadores que estudien la evolucion del comportamiento de seguridad a lo largo de las actualizaciones del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3_5ForConditionalGeneration), con torre de vision y cabeza MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`), un transformer multimodal con torre de vision y cabeza MTP. El ajuste se realiza con SFT de parametros completos sobre trayectorias de un profesor (Qwen/Qwen3.8-27B, snapshot `1d4bf0f2ff60`), con funcion de perdida sobre el razonamiento, la respuesta final y las llamadas a herramientas. El entrenamiento usa Slime + Megatron-LM, computo en bf16 con estado del optimizador en fp32, y se ejecuto en 2x NVIDIA RTX PRO 6000 Blackwell con tensor parallelism 2. Solo se entreno el modelo de lenguaje; la torre de vision y la cabeza MTP son los pesos base sin tocar.

Los datos proceden del conjunto "mixture-8", con 46.626 trayectorias derivadas de 11.757 prompts: star1_gp3 (3.998), star_benign_v2 (3.651), agentalign_harmful (7.919), agentalign_benign (7.734), codesafetybench (3.598), magicoder (3.838), difficult_advice (7.905) y wildjailbreak_benign (7.983). El profesor genero cuatro respuestas muestreadas por prompt y se conservaron todas las validas. Las fuentes dañinas regeneradas (codesafetybench, difficult_advice, agentalign_harmful) usan prompts/generation_v2.txt + MODEL_SPEC_V2 (GP3, Qwen3.8-27B). La receta usa 2 epocas x 365 actualizaciones de 128 secuencias, learning rate pico 2e-05 con warmup lineal del 10% y decaimiento coseno hasta 4e-06, Adam con betas [0.9, 0.95], eps 1e-08, weight decay 0.1 y grad clip 1.0. Las trayectorias mas largas que el contexto de 32.768 tokens se excluyeron completas, nunca se truncaron. El prompt del estudiante usa la plantilla nativa de Base chat, system "You are a helpful assistant.", thinking activado y sin Model Spec.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable via `enable_thinking=True` en la plantilla de chat.
- Soporte de llamadas a herramientas (tool calls), ya que la perdida de entrenamiento incluye las llamadas a herramientas de las trayectorias del profesor.
- Capacidades multimodales heredadas del modelo base (image-text-to-text), aunque la torre de vision no se entreno en este checkpoint.
- Comportamiento orientado a seguridad: el conjunto de datos incluye fuentes de alineacion agentica dañina y benigna, seguridad de codigo y jailbreaks benignos.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Razonamiento multi-paso: las trayectorias de entrenamiento incluyen razonamiento explicito y respuesta final.

## Casos de uso

- Investigacion sobre safety tuning: analisis de la evolucion del comportamiento de seguridad comparando este checkpoint (1,75 epocas) con los anteriores publicados (0,249, 0,501, 0,751, 1, 1,25 y 1,5 epocas) y con el final de 2 epocas.
- Evaluacion de destilacion desde profesor mayor: permite estudiar como un modelo de 4B absorbe trayectorias de un profesor de 27B en tareas de seguridad y alineacion agentica.
- Generacion de codigo con conciencia de seguridad: el conjunto incluye codesafetybench y magicoder, por lo que el modelo puede usarse para probar respuestas a peticiones de codigo potencialmente peligrosas en entornos controlados.
- Analisis de robustez frente a jailbreaks: el dataset incluye wildjailbreak_benign, lo que permite evaluar la respuesta del modelo ante prompts adversarios.
- Desarrollo de asistentes conversacionales con tool calling: la perdida cubre llamadas a herramientas, de modo que el modelo puede integrarse en pipelines de agentes que requieran invocar funciones.
- Experimentos de razonamiento con thinking mode: util para comparar calidad de cadenas de razonamiento entre checkpoints intermedios del mismo entrenamiento.
- Base para posteriores etapas de alineacion (RLHF/DPO): al ser un checkpoint intermedio, sirve como punto de partida documentado para experimentos de alineacion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (4.659.865.088 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-24 GB para contexto largo.
- GPU recomendadas: el entrenamiento se realizo en 2x NVIDIA RTX PRO 6000 Blackwell con tensor parallelism 2. Para inferencia, una GPU con 24 GB o mas (RTX 4090, RTX 5090, A100, H100, RTX PRO 6000) es suficiente en bf16.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas en bf16; con cuantizacion a 8 bits o 4 bits cabria en GPUs de 12-16 GB, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: transformers (carga directa con `Qwen3_5ForConditionalGeneration`), y potencialmente vLLM, TGI o llama.cpp si se generan pesos GGUF, aunque no se documenta compatibilidad explicita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step639 | 4.659.865.088 | 32.768 | apache-2.0 | Checkpoint intermedio de SFT de seguridad; sin benchmarks publicados |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible en la informacion | apache-2.0 | Modelo base sin ajuste de seguridad |
| Qwen/Qwen3.8-27B | no disponible en la informacion | no disponible en la informacion | no disponible | Profesor usado para generar las trayectorias de destilacion |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (639 de 730 actualizaciones, 1,75 de 2 epocas): el autor indica explicitamente que el entrenamiento sigue en progreso y que no es un modelo final.
- No se han publicado benchmarks ni evaluaciones de seguridad cuantitativas; no hay evidencia publica de su robustez frente a ataques.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- La torre de vision y la cabeza MTP no se entrenaron, por lo que las capacidades multimodales no se han adaptado al ajuste de seguridad.
- Solo se entreno el modelo de lenguaje; cualquier evaluacion multimodal debe tener en cuenta que la parte visual es la del base sin modificar.
- Licencia apache-2.0, que permite uso comercial, pero al ser un checkpoint de investigacion sin evaluacion de seguridad no se recomienda su despliegue en produccion sin auditoria previa.
- El conjunto de datos incluye fuentes dañinas (agentalign_harmful, codesafetybench, difficult_advice) destiladas de un profesor; existe riesgo de que el modelo reproduzca comportamientos no deseados en dominios no cubiertos.
- Las trayectorias mas largas de 32.768 tokens se excluyeron, lo que puede sesgar el aprendizaje hacia conversaciones de longitud acotada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step639
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Profesor usado para destilacion: https://huggingface.co/Qwen/Qwen3.8-27B
