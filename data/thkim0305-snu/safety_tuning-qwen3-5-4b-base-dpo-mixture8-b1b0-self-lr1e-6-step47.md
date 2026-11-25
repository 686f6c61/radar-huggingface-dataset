# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step47

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step47 es un checkpoint intermedio de ajuste fino por preferencias (DPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU (aparentemente vinculado a la Universidad Nacional de Seúl). El objetivo declarado es el alineamiento de seguridad: el modelo se entrena para preferir trayectorias de respuesta que superan un juez binario estricto frente a las que fallan, abarcando razonamiento, respuesta final y llamadas a herramientas.

Se trata de una instantánea parcial, no de un modelo final: corresponde a la actualización 47 de 186 del optimizador (0,505 de 2 épocas), con el entrenamiento todavía en curso. Emplea la arquitectura multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), aunque solo se ha entrenado el modelo de lenguaje; la torre de visión y la cabeza MTP conservan los pesos del base sin modificar.

Con 4.659.865.088 parámetros totales en bf16, licencia Apache 2.0 y un contexto de entrenamiento de 32.768 tokens, el checkpoint resulta relevante como artefacto de investigación para estudiar dinámicas de DPO en tareas de seguridad y robustez frente a jailbreaks, más que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`); solo se entrena el modelo de lenguaje |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; sin variantes GGUF/AWQ/GPTQ documentadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, transformers) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3.5-4B-Base (snapshot `1001bb4d826a`), que actúa además como modelo de referencia congelado. La arquitectura es la nativa de Qwen3.5 para generación condicional, con torre de visión y cabeza MTP (multi-token prediction) heredadas intactas del base. El ajuste se realizó con Slime + Megatron-LM, cómputo en bf16 con estado del optimizador en fp32 y paralelismo tensorial de grado 4 sobre 4 GPU H100 de 80 GB.

La receta es DPO con objetivo sigmoide y beta 0,1 aplicado sobre la respuesta completa (razonamiento + respuesta + llamadas a herramientas). Los pares se construyen con trayectorias del propio Qwen3.5-4B-Base evaluadas por un juez binario estricto: la elegida es una trayectoria con puntuación 1 y la rechazada es otra trayectoria del mismo prompt con puntuación 0, sin reutilización. El conjunto consta de 5.941 pares procedentes de 4.600 prompts, repartidos en 8 fuentes (agentalign_benign, agentalign_harmful, codesafetybench, difficult_advice, magicoder, star1_gp3, star_benign_v2, wildjailbreak_benign), con 2 épocas de 93 actualizaciones de 64 pares. Hiperparámetros: learning rate pico 1e-6 con warmup lineal del 10 % y decaimiento coseno hasta 2e-7, Adam con betas [0,9; 0,95], eps 1e-8, weight decay 0,0 y grad clip 1,0. Las trayectorias que superaban 32.768 tokens se excluyeron completas, nunca truncadas. El prompt del estudiante usa la plantilla nativa de chat del base con system "You are a helpful assistant." y thinking activado, sin Model Spec.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat nativa de Qwen3.5.
- Razonamiento explícito con modo thinking (`enable_thinking=True`).
- Generación de código, reforzada por las fuentes magicoder, codesafetybench y star1_gp3 del conjunto de preferencias.
- Llamadas a herramientas (tool calling), incluidas en la señal de preferencia DPO.
- Comportamiento orientado a agentes: las fuentes agentalign_benign y agentalign_harmful entrenan preferencias sobre trayectorias agénticas.
- Capacidad multimodal de entrada (image-text-to-text) heredada del base, aunque la torre de visión no se ha entrenado en este checkpoint.
- Robustez ante jailbreaks y prompts adversarios, por las fuentes wildjailbreak_benign y difficult_advice.
- Capacidades multilingües: no disponible (no se documentan idiomas).

## Casos de uso

- Investigación en alineamiento de seguridad: el checkpoint permite comparar el comportamiento antes y después de 47 actualizaciones DPO frente al base, aislando el efecto del ajuste en la tasa de respuestas seguras.
- Evaluación de robustez ante jailbreaks: sirve para medir la resistencia del modelo a prompts adversarios de wildjailbreak y difficult_advice en un entorno controlado de laboratorio.
- Estudio de DPO sobre trayectorias agénticas: al incluir tool calls en la señal de preferencia, es útil para analizar cómo evoluciona la selección de herramientas tras el ajuste.
- Generación de código con criterios de seguridad: integrable en pipelines de revisión donde se quiera contrastar la salida del modelo ajustado frente al base en tareas de codesafetybench.
- Base para experimentos de continuación del entrenamiento: al ser una instantánea intermedia con checkpoints en las actualizaciones 23, 47, 70, 93, 116, 140, 163 y 186, permite trazar curvas de aprendizaje.
- Prototipado de asistentes conversacionales con razonamiento visible, usando el modo thinking para depurar cadenas de razonamiento en entornos de desarrollo.
- Comparación de metodologías de exportación Megatron a Hugging Face: el proceso de conversión (refusión de proyecciones GDN, mapeo de nombres Slime Qwen3.5, copia de pesos de visión/MTP) es reproducible y documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB para contextos moderados.
- Cuantización a 8 bits: alrededor de 5 GB de pesos; a 4 bits, alrededor de 2,5-3 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: el entrenamiento se realizó en 4x H100 80 GB con paralelismo tensorial 4; para inferencia basta una GPU única de 16-24 GB.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) en bf16 y en RTX 3090/4080 (16 GB) con cuantización; no se documentan pruebas oficiales.
- Opciones de despliegue: transformers (receta oficial de la model card con `device_map="auto"`); vLLM, TGI, llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step47 | 4,66 B | 32.768 | Apache 2.0 | Checkpoint intermedio (47/186 updates) | DPO de seguridad sobre Qwen3.5-4B-Base |
| Qwen/Qwen3.5-4B-Base | 4 B (aprox.) | no disponible en la informacion | Apache 2.0 | Modelo base publicado | Referencia congelada del DPO; sin ajuste de seguridad |
| Alternativas DPO de seguridad de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Es una instantánea intermedia: 47 de 186 actualizaciones (0,505 de 2 épocas). No debe tratarse como modelo final ni desplegarse en producción.
- El entrenamiento está en curso; el comportamiento puede ser inestable y no se han publicado evaluaciones de seguridad ni de capacidad.
- Riesgo de alucinación no cuantificado: no hay benchmarks ni evaluaciones de fidelidad en la información disponible.
- Sesgos conocidos: no documentados; el ajuste se apoya en un juez binario automático cuya calibración y sesgos no se describen.
- Idiomas soportados no especificados; el comportamiento multilingüe es incierto más allá de lo heredado del base.
- La torre de visión y la cabeza MTP conservan los pesos del base sin entrenar: las capacidades multimodales no se han alineado en este checkpoint.
- Las trayectorias de más de 32.768 tokens se descartaron, lo que puede sesgar el ajuste hacia respuestas de menor longitud.
- Licencia Apache 2.0 permite uso comercial, pero el estado de investigación del checkpoint desaconseja cualquier despliegue productivo sin evaluación adicional.
- Cero descargas y cero likes en Hugging Face: sin validación comunitaria ni reportes de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step47
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper, blog, repositorio o demo adicionales: no disponible
