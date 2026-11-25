# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step23

## Resumen

El modelo `Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step23` es un checkpoint intermedio de un ajuste fino mediante DPO (Direct Preference Optimization) sobre `Qwen/Qwen3.5-4B-Base`, desarrollado por el usuario `thkim0305-SNU`. Se trata de un experimento de alineamiento de seguridad: el objetivo es que el modelo prefiera trayectorias de respuesta que superan un juez binario estricto frente a las que fallan, cubriendo razonamiento, respuesta final y llamadas a herramientas. El checkpoint corresponde al paso 23 de 186 actualizaciones del optimizador (0,247 de 2 épocas), por lo que es una instantánea de un entrenamiento en curso y no un modelo final.

Arquitectonicamente hereda todo del modelo base Qwen3.5-4B: es un transformer multimodal (`Qwen3_5ForConditionalGeneration`) con torre de visión y cabeza MTP (multi-token prediction), de 4.659.865.088 parámetros totales en bf16. Solo se ha entrenado la parte del modelo de lenguaje; la torre de visión y la cabeza MTP conservan los pesos originales del base, de modo que el checkpoint se carga exactamente igual que el modelo de referencia.

Su relevancia es doble: por un lado, documenta una receta reproducible de DPO de seguridad con pares autogenerados (chosen/rejected del propio base, sin reutilización) sobre ocho fuentes de datos; por otro, al ser una instantánea temprana permite estudiar la evolución del alineamiento a lo largo del entrenamiento comparando los distintos checkpoints publicados (pasos 23, 47, 70, 93, 116, 140, 163 y 186).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), `Qwen3_5ForConditionalGeneration`, con torre de vision y cabeza MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento; el limite del base no se detalla) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, compatible con transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B-Base` (snapshot `1001bb4d826a`), que actua tambien como referencia congelada en el DPO. La arquitectura es la del base: un transformer multimodal con torre de vision y cabeza de prediccion multi-token (MTP). Durante el ajuste solo se entrena el modelo de lenguaje; la torre de vision y la cabeza MTP se copian intactas desde el base, y las proyecciones GDN se refusionan en la exportacion a Hugging Face para que el checkpoint cargue como el original.

El entrenamiento usa DPO con objetivo sigmoide, beta 0,1, aplicado sobre la respuesta completa (razonamiento, respuesta y llamadas a herramientas). Los pares son autogenerados: la respuesta elegida es una trayectoria del propio Qwen3.5-4B-Base que supero un juez binario estricto (puntuacion 1) y la rechazada es una trayectoria del mismo prompt que fallo (puntuacion 0), en correspondencia uno a uno sin reutilizacion. El conjunto consta de 5.941 pares procedentes de 4.600 prompts, repartidos en ocho fuentes (agentalign_benign, agentalign_harmful, codesafetybench, difficult_advice, magicoder, star1_gp3, star_benign_v2 y wildjailbreak_benign). Se entrena durante 2 epocas con 93 actualizaciones de 64 pares cada una, learning rate pico de 1e-06 con calentamiento lineal del 10 % y decaimiento coseno hasta 2e-07, Adam con betas [0,9; 0,95], eps 1e-08, weight decay 0,0 y recorte de gradiente 1,0. El framework es Slime sobre Megatron-LM, con computo en bf16, estado del optimizador en fp32 y paralelismo tensorial 4 sobre 4 GPU H100 de 80 GB. Las trayectorias de mas de 32.768 tokens se excluyen completas, nunca se truncan.

## Capacidades

- Generacion de texto conversacional con plantilla de chat nativa del base y modo de razonamiento (thinking) activable mediante `enable_thinking=True`.
- Razonamiento multi-paso: el DPO se aplica sobre trayectorias completas que incluyen razonamiento, respuesta y llamadas a herramientas.
- Llamadas a herramientas (tool calling): presente en el formato de entrenamiento, aunque el ajuste no introduce herramientas nuevas.
- Capacidad multimodal imagen-texto heredada del base (torre de vision intacta, no reentrenada en este checkpoint).
- Alineamiento de seguridad: el objetivo del ajuste es preferir respuestas que pasan un juez estricto en escenarios benignos, daninos, de codigo y de jailbreak.
- Capacidades multilingues: no documentadas en la informacion disponible; dependen del modelo base.
- Prediccion multi-token (cabeza MTP) heredada del base, no ajustada.

## Casos de uso

- Investigacion sobre alineamiento de seguridad: comparar este checkpoint (paso 23) con los posteriores (47, 70, 93, 116, 140, 163, 186) para medir como evoluciona la preferencia por respuestas seguras a lo largo del DPO, usando el mismo prompt y juez.
- Evaluacion de robustez frente a jailbreaks: el conjunto incluye `wildjailbreak_benign` y `agentalign_harmful`, por lo que el modelo es util para probar resistencia a prompts adversarios en un pipeline de red teaming.
- Seguridad en generacion de codigo: entrenado con `codesafetybench` y `magicoder`, puede emplearse para estudiar si el ajuste DPO reduce la generacion de codigo inseguro sin degradar la utilidad en tareas de programacion.
- Asistente conversacional con razonamiento y herramientas: al conservar la plantilla de chat, el modo thinking y el soporte de tool calling del base, sirve como base para prototipos de agentes que necesitan contexto de hasta 32.768 tokens.
- Analisis de decisiones dificiles: la fuente `difficult_advice` (1.027 pares) lo hace adecuado para evaluar respuestas a consultas delicadas de asesoramiento, comparando la tasa de respuestas que superan el juez antes y despues del ajuste.
- Docencia y reproduccion de recetas: la model card documenta hiperparametros, fuentes de datos y procedencia (Slime + Megatron-LM, exportacion con `safety_tuning.hf_export`), lo que permite reproducir el pipeline DPO en entornos con 4 GPU H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 9,3 GB (tamano del repositorio); con overhead de activaciones y cache KV para 32.768 tokens se recomienda al menos 24 GB de VRAM.
- GPU recomendadas: el entrenamiento se realizo en 4x H100 80 GB con paralelismo tensorial 4; para inferencia basta una sola GPU de gama alta.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (RTX 3090, RTX 4090, RTX 5090) en bf16; con cuantizacion a 8 o 4 bits cabria en GPUs de 16 GB o menos, aunque no se publican pesos cuantizados.
- Opciones de despliegue: transformers (receta oficial de la model card), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF (no se proporcionan archivos GGUF en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este checkpoint (DPO paso 23 sobre Qwen3.5-4B-Base) | 4,66 B | 32.768 (entrenamiento) | Apache 2.0 | Instantanea intermedia de un DPO de seguridad en curso |
| Qwen/Qwen3.5-4B-Base | 4,66 B | no disponible en esta ficha | Apache 2.0 | Modelo base sin ajuste de preferencias; referencia congelada del DPO |
| Checkpoints posteriores del mismo run (pasos 47 a 186) | 4,66 B | 32.768 | Apache 2.0 | Mismo pipeline, mayor numero de actualizaciones; utiles para comparar evolucion |

No se dispone de datos de benchmarks ni de modelos alternativos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es una instantanea intermedia (paso 23 de 186, 0,247 de 2 epocas): el autor indica explicitamente que el entrenamiento sigue en curso y que no es un modelo final.
- Solo se ha entrenado el modelo de lenguaje; la torre de vision y la cabeza MTP conservan los pesos del base, por lo que las capacidades multimodales no reflejan el ajuste de seguridad.
- Los pares de preferencia son autogenerados por el propio base y filtrados por un juez binario, de modo que el modelo hereda los sesgos y errores del juez y del generador.
- Riesgo de alucinacion no cuantificado: no se publican evaluaciones de fidelidad ni de tasas de alucinacion.
- Idiomas soportados no documentados; el comportamiento fuera del ingles (idioma predominante en las fuentes de datos) no esta caracterizado.
- Las trayectorias de mas de 32.768 tokens se descartan por completo, lo que puede sesgar el entrenamiento hacia respuestas mas cortas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigacion sin evaluacion de seguridad publicada no se recomienda su despliegue en produccion sin una auditoria propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step23
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper de DPO: no disponible en la informacion proporcionada
- Repositorio de Slime: no disponible en la informacion proporcionada
- Repositorio de Megatron-LM: no disponible en la informacion proporcionada
