# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step116

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step116 es un checkpoint intermedio de ajuste fino mediante DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo declarado es el alineamiento de seguridad: se entrena al modelo para preferir trayectorias que superan un juez binario estricto frente a trayectorias del mismo prompt que lo fallan, cubriendo tanto casos benignos como dañinos (jailbreaks, seguridad de código, consejo difícil).

El checkpoint corresponde al paso 116 de 186 actualizaciones del optimizador (1,25 de 2 épocas), por lo que se trata de un snapshot de un entrenamiento en curso, no de un modelo final. Los pesos se exportan en bf16 con la clase `Qwen3_5ForConditionalGeneration`; la torre de visión y la cabeza MTP conservan los pesos originales del base, de modo que el modelo carga exactamente igual que Qwen3.5-4B-Base.

Con 4.659.865.088 parámetros reales (según safetensors) y licencia Apache 2.0, es relevante para investigadores que quieran reproducir o auditar recetas de safety tuning con DPO sobre bases Qwen3.5, así como para experimentar con alineamiento de seguridad en un modelo multimodal de ~4,7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`), que actúa además como modelo de referencia congelado. La arquitectura es la nativa de Qwen3.5 para generación condicional, con torre de visión y cabeza MTP; solo se entrena el modelo de lenguaje, mientras que visión y MTP quedan intactos. El ajuste se realiza con DPO sigmoide (beta 0,1) sobre la respuesta completa (razonamiento + respuesta + llamadas a herramientas), usando el framework Slime junto con Megatron-LM, cómputo en bf16 con estado del optimizador en fp32 y paralelismo tensorial de 4.

Los pares de preferencia son auto-pares del propio Qwen3.5-4B-Base: la respuesta elegida es una trayectoria que supera un juez binario estricto (score 1) y la rechazada es una trayectoria del mismo prompt que lo falla (score 0), en correspondencia uno a uno sin reutilización. El conjunto consta de 5.941 pares procedentes de 4.600 prompts, con 2 épocas de 93 actualizaciones de 64 pares cada una. La tasa de aprendizaje es 1e-06 en pico, con warmup lineal del 10 % y decaimiento coseno hasta 2e-07; Adam con betas [0,9; 0,95], eps 1e-08, weight decay 0,0 y grad clip 1,0. El contexto de entrenamiento es de 32.768 tokens y las trayectorias más largas se excluyen enteras, nunca se truncan. El prompt del estudiante usa la plantilla nativa de chat del base, con system "You are a helpful assistant." y thinking activado, sin Model Spec.

Las fuentes de datos (mixture-8) y su volumen en pares/prompts son: agentalign_benign (652/508), agentalign_harmful (941/736), codesafetybench (481/384), difficult_advice (1.027/786), magicoder (600/464), star1_gp3 (432/340), star_benign_v2 (531/415) y wildjailbreak_benign (1.277/967). El entrenamiento se ejecutó en 4x H100 80GB (GPUs 4-7 de keti_h100_0) y el checkpoint se exportó desde Megatron torch_dist `iter_0000115` el 2026-11-25.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla nativa de Qwen3.5 y modo thinking activable.
- Razonamiento multi-paso (thinking) heredado del base, con entrenamiento DPO sobre trayectorias completas que incluyen razonamiento.
- Llamadas a herramientas (tool calls) contempladas en el objetivo de entrenamiento (respuesta completa = razonamiento + respuesta + tool calls).
- Capacidad multimodal de entrada imagen-texto a texto, ya que la arquitectura es `Qwen3_5ForConditionalGeneration` con torre de visión (aunque esta no se ha entrenado en este ajuste).
- Comportamiento orientado a seguridad: preferencia aprendida por respuestas que superan un juez binario estricto en escenarios benignos y dañinos.
- Manejo de contextos largos de hasta 32.768 tokens.
- Capacidades multilingües: no disponible (no se especifican idiomas).

## Casos de uso

- Investigación en alineamiento de seguridad: servir como punto de comparación reproducible frente al base Qwen3.5-4B para medir el efecto de DPO con auto-pares y juez binario en la tasa de respuestas seguras.
- Auditoría de recetas de safety tuning: analizar cómo evoluciona el comportamiento entre checkpoints (pasos 23, 47, 70, 93, 116, 140, 163 y 186) para estudiar la dinámica del DPO sobre seguridad.
- Evaluación de robustez frente a jailbreaks: el conjunto incluye wildjailbreak_benign y agentalign_harmful, por lo que el modelo es útil para probar defensas ante prompts adversarios en un entorno controlado de laboratorio.
- Seguridad en generación de código: el entrenamiento con codesafetybench y magicoder permite estudiar la mitigación de sugerencias de código inseguro en asistentes de programación.
- Asesoramiento difícil y conversaciones sensibles: el dataset difficult_advice entrena respuestas prudentes en consultas delicadas, aplicable a prototipos de asistentes con salvaguardas.
- Experimentación con agentes y tool calling: al incluir trayectorias con llamadas a herramientas (agentalign), sirve para estudiar la seguridad en flujos agénticos de varios pasos.
- Base para posteriores etapas de alineamiento: como checkpoint intermedio con licencia Apache 2.0, puede emplearse como punto de partida para RLHF, DPO adicional o evaluación comparativa en pipelines de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (4.659.865.088 parámetros x 2 bytes), más overhead de activaciones, KV cache y torre de visión; en la práctica, en torno a 11-14 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits: alrededor de 2,5-3 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: el entrenamiento se realizó en 4x H100 80GB con paralelismo tensorial 4; para inferencia basta una GPU con 16-24 GB (A100 40GB, L40S, RTX 4090 24GB, RTX A6000).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) en bf16 y en GPUs de 8-12 GB con cuantización, siempre que se disponga de pesos GGUF/AWQ generados por el usuario (no publicados).
- Opciones de despliegue: transformers (receta oficial de la model card), y previsiblemente vLLM, TGI o llama.cpp/Ollama tras conversión, aunque no se documentan integraciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step116 | 4,66B | 32.768 | Apache 2.0 | Checkpoint DPO intermedio (paso 116/186) sobre Qwen3.5-4B-Base |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible | Apache 2.0 | Modelo base y referencia congelada de este ajuste |
| Alternativas de safety tuning de ~4B | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de benchmarks ni de otras alternativas de la misma categoría en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Es un snapshot intermedio (paso 116 de 186, 1,25 de 2 épocas): el entrenamiento sigue en curso y el modelo no debe considerarse final ni validado.
- Solo se ha entrenado el modelo de lenguaje; la torre de visión y la cabeza MTP conservan los pesos del base, por lo que las capacidades multimodales no han sido alineadas en seguridad.
- Riesgo de alucinación y de sobreajuste al juez binario empleado para generar los pares: el modelo puede aprender sesgos del juez en lugar de una política de seguridad general.
- Los pares de preferencia son auto-pares del propio base, lo que puede limitar la diversidad de estilos de respuesta y la generalización fuera de las ocho fuentes de datos.
- No se especifican idiomas soportados ni evaluaciones multilingües; el comportamiento fuera del inglés (presumiblemente dominante en los datasets) es incierto.
- Las trayectorias de más de 32.768 tokens se excluyen del entrenamiento, de modo que el modelo no está ajustado para contextos superiores a esa longitud.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación sin benchmarks publicados no se recomienda su despliegue en producción sin una evaluación de seguridad propia.
- No se publican cuantizaciones oficiales ni resultados de evaluación de seguridad cuantitativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step116
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Slime (framework de entrenamiento): no disponible en la informacion proporcionada
- Megatron-LM: no disponible en la informacion proporcionada
