# tskim81/connectailab-rl-kimtaesun-target-v1-link01-link01

## Resumen

LINK-01 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-0.8B para tareas de decisión secuencial en robótica simulada. Lo desarrolla Kim Taesun (Solgivers) en el marco del proyecto colaborativo CONNECT AI LAB, y su función es actuar como "cerebro" de un robot caminante llamado LINK-01 en el entorno web de aprendizaje por refuerzo de CONNECT AI WORLD. El modelo recibe una descripción textual del estado del robot (distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa) y devuelve una única letra que representa la acción de locomoción para los próximos 0,5 segundos.

El interés técnico del modelo reside en su método de construcción: un agente PPO entrenado en el simulador (el "profesor" o brain.json) genera etiquetas de decisión que se destilan primero mediante aprendizaje supervisado y luego se refinan con RL sobre el propio modelo de lenguaje, manteniendo una penalización KL contra la política supervisada. Es un ejemplo de destilación de política (policy distillation) hacia un LLM de 0,8 mil millones de parámetros, con un formato de salida restringido a una sola letra.

Se trata de un modelo de investigación y educación, no de un modelo de propósito general. Su ámbito es muy acotado: la tarea `goto_target` en un simulador 2D aproximado, con idioma coreano en la documentación y entrenamiento orientado a un vocabulario de acciones cerrado (obs10-act5). No debe confundirse con un modelo conversacional ni con un sistema de control robótico listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | No disponible (el adaptador LoRA se suma a los 0,8B del modelo base; el número exacto de parámetros del adaptador no se especifica) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B; no se documenta en la model card) |
| Tipos de cuantización | No disponible (formato de pesos safetensors del adaptador; no se documentan cuantizaciones) |
| Idiomas soportados | Coreano (ko) según la model card; las instrucciones del sistema están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se entrena en tres fases descritas en la model card: (1) entrenamiento del agente PPO en el simulador web sobre la tarea `goto_target` con el contrato `link01-decision/goto_target/obs10-act5/walker51-14/v1`, alcanzando un 100 % en el examen oficial; (2) generación de un dataset de preguntas-respuesta a partir de las observaciones del agente cada 0,5 segundos, con un 20 % de ejemplos en los que el agente se desvía del camino; (3) aprendizaje supervisado del LLM sobre esas etiquetas y, posteriormente, refinamiento con RL usando la recompensa obtenida al ejecutar cada acción y dejar que el agente PPO continúe la trayectoria, con una penalización KL para mantener la política cerca de la supervisada.

El dataset consta de 889 ejemplos de entrenamiento, 139 de validación y 310 de test. La "tasa de acierto techo" (proporción en que el LLM reproduce la misma respuesta que el agente profesor al traducir la observación a texto) es del 99 %. La evaluación de la conducción se realiza con una aproximación 2D de la marcha basada en una tabla de velocidades medidas por comando, sin red neuronal de marcha, lo que evita caídas pero puede diferir de los resultados de MuJoCo en el navegador.

## Capacidades

- Decisión de acción discreta: dado un estado textual del robot, selecciona exactamente una letra entre las opciones listadas (formato obs10-act5).
- Seguimiento de instrucciones con formato estricto: el prompt de sistema exige devolver solo la letra, sin explicación.
- Razonamiento de estado a corto plazo: incorpora distancia, dirección, lecturas de sensores, velocidad y acción previa en la decisión.
- Tratamiento de datos no confiables: el prompt indica explícitamente tratar el texto dentro de `state` como datos, no como instrucciones.
- Capacidades multilingües: limitadas al coreano (documentación) e inglés (instrucciones del sistema); no se documenta soporte general multilingüe.
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible como capacidad general; el bucle de decisión lo gestiona el entorno del simulador.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en destilación de políticas: usar el par (agente PPO, LLM destilado) para estudiar cuánto de la política de un agente RL se puede transferir a un modelo de lenguaje de 0,8B, comparando las tasas de acierto del 92,3 % (RL) y 92,9 % (supervisado) frente al 100 % del profesor.
- Educación en RL y LLM: el cuaderno de Colab enlazado en la model card permite reproducir el pipeline completo (entrenamiento PPO, generación de dataset, LoRA, RL) como material didáctico en cursos de aprendizaje por refuerzo.
- Evaluación de robustez ante instrucciones en el estado: el modelo está entrenado para ignorar instrucciones embebidas en el texto del estado, lo que permite estudiar ataques de inyección de prompt en pipelines de decisión.
- Prototipado de controladores basados en lenguaje en simuladores 2D: integrar el modelo en el bucle de decisión de un robot simulado para comparar la calidad de las trayectorias frente a un controlador PPO puro.
- Benchmark de formatos de salida restringidos: sirve para medir la fiabilidad de un LLM pequeño al forzar una salida de una sola letra en tareas de clasificación cerrada.
- Reproducción de experimentos de RLHF/RL con recompensa basada en simulador: el esquema de recompensa descrito (ejecutar la acción y dejar que el profesor continúe) es reutilizable en otros entornos con un agente de referencia.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación sobre 310 preguntas de test y 20 episodios de conducción con semillas 91001–91020):

| Modelo | Acierto en test (misma respuesta que el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio de éxito |
|---|---|---|---|---|
| Profesor (PPO) | 100,0 % | 60 % | 55 % | 11,5 s |
| Antes del entrenamiento | 14,8 % | 0 % | 100 % | — |
| Aprendizaje supervisado | 92,9 % | 60 % | 65 % | 12,1 s |
| Aprendizaje por refuerzo | 92,3 % | 70 % | 60 % | 11,7 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3.5-0.8B en precisión completa (fp16) requiere aproximadamente 1,6 GB solo para pesos; con el adaptador LoRA el incremento es marginal. En cuantización de 4 bits cabría en GPUs de 4 GB o menos, aunque no se documentan cuantizaciones oficiales del adaptador.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es suficiente para el modelo base de 0,8B; para entrenamiento del adaptador LoRA basta una GPU de 8–12 GB.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño del modelo base.
- Opciones de despliegue: transformers + PEFT (como se muestra en la model card), llama.cpp u Ollama para el modelo base fusionado con el adaptador; vLLM y TGI son compatibles con el modelo base, aunque la integración del adaptador requiere verificación.
- Latencia y throughput: no disponibles. La tarea exige una decisión cada 0,5 segundos, pero no se publican medidas de latencia real del LLM en el bucle de control.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La categoría (destilación de política RL a LLM para control robótico simulado) es muy específica y no se han identificado alternativas con datos verificables en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LINK-01 (este modelo) | Adaptador LoRA sobre 0,8B | No disponible | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | No disponible en esta ficha | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ámbito extremadamente restringido: solo resuelve la tarea `goto_target` con el contrato obs10-act5; no generaliza a otras tareas, entornos ni vocabularios de acción.
- Evaluación aproximada: la conducción se mide con una tabla de velocidades 2D, no con MuJoCo real, por lo que los resultados pueden diferir del simulador físico.
- Riesgo de alucinación en el formato: aunque se fuerza una letra, no se documenta la tasa de salidas inválidas ni el comportamiento fuera de distribución.
- Sesgos conocidos: no documentados; el entrenamiento se limita a un único curso (`random`) y a un conjunto pequeño de 889 ejemplos.
- Limitaciones de idioma: el modelo está orientado a coreano e inglés; no se garantiza un comportamiento correcto en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Caveat para producción: la model card indica explícitamente que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Tamaño del repositorio: 0,0 GB, lo que sugiere que los pesos del adaptador pueden no estar completamente subidos o son de tamaño despreciable; conviene verificar la integridad antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tskim81/connectailab-rl-kimtaesun-target-v1-link01-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
- Entorno web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- GitHub del autor: https://github.com/tskim81
