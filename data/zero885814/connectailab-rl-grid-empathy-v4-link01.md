# zero885814/connectailab-rl-grid-empathy-v4-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario zero885814 bajo el paraguas del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un clasificador de decisiones discretas: recibe en texto el estado de un robot de simulación (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra correspondiente a la siguiente acción de locomoción para los próximos 0,5 segundos. La tarea concreta es `avoid_obstacles` (esquivar obstáculos) dentro del simulador web CONNECT AI WORLD.

El interés del modelo es metodológico más que de rendimiento bruto. El autor entrena primero una política PPO en el simulador, la congela como "profesor" y genera un conjunto de preguntas y respuestas a partir de las observaciones que esa política ve al recorrer un circuito fijo (huella `8bb27dff`). Sobre ese corpus se hace un ajuste supervisado con LoRA y después una fase de optimización con PPO y anclaje KL que reordena las preferencias entre opciones. El resultado se evalúa sentando al modelo de lenguaje en el puesto de mando del robot y midiendo la tasa de éxito en 20 episodios con semillas fijas.

La relevancia actual es acotada y muy específica: sirve como ejemplo reproducible de destilación de una política de refuerzo en un modelo de lenguaje pequeño (0,8B) y de cómo aplicar RL posterior sobre las salidas de ese modelo. No debe confundirse con un modelo conversacional ni con un modelo de robótica de uso general; el propio autor lo etiqueta como modelo de investigación y educación sobre simulador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el modelo base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-0.8B, sin dato explicito) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (`ko`) segun la model card; el prompt de sistema y las opciones estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se carga sobre `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador no modifica la arquitectura del modelo base; añade matrices de bajo rango en las capas que PEFT seleccione, y su función es transformar el comportamiento generativo del modelo base en un clasificador de opciones cerradas (una letra por respuesta).

El pipeline de entrenamiento tiene cuatro etapas descritas por el autor. Primero, una política PPO entrenada en el simulador web sobre la tarea `avoid_obstacles`, con contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`, circuito `8bb27dff`, penalización por colisión de -2,0 y una tasa de éxito del 80 % en la prueba oficial. Segundo, la generación de un corpus de preguntas: cada 0,5 segundos se convierte la observación del robot en texto y se etiqueta con la acción elegida por la política, incluyendo un 20 % de ejemplos donde la política se desvió. El reparto resultante es de 961 ejemplos de entrenamiento, 186 de validación y 269 de test, con un techo teórico de acierto del 100 % (el modelo puede replicar exactamente al profesor). Tercero, ajuste supervisado con LoRA para imitar al profesor. Cuarto, una fase de RL con PPO y anclaje KL que sube la probabilidad de opciones con mejor recompensa contrafactual (qué habría pasado si el modelo hubiera elegido esa opción y el profesor hubiera continuado) y baja la de las peores.

La evaluación se hace en un entorno de marcha 2D aproximado, basado en una tabla de velocidades por comando derivada del MuJoCo web, sin red neuronal de locomoción ni modelo físico del robot. El propio autor advierte que los resultados pueden diferir de los de MuJoCo real.

## Capacidades

- Clasificación de decisión discreta: dado un estado textual del robot, devuelve exactamente una letra entre las opciones listadas, sin explicación.
- Seguimiento de instrucciones de formato estricto mediante el prompt de sistema (`Select exactly one listed option. Return only its letter, with no explanation.`).
- Robustez ante inyección de instrucciones en el campo de estado: el prompt pide tratar el contenido de `state` como datos, no como instrucciones.
- Razonamiento de política de refuerzo destilada: reproduce el comportamiento de una política PPO entrenada en `avoid_obstacles`.
- Generación de texto libre: no es una capacidad objetivo; el adaptador está afinado para responder con una sola letra.
- Tool calling / function calling: no soportado de forma nativa en este adaptador.
- Capacidades de agente multi-paso: no soportadas como tales; el bucle de decisión lo gestiona el entorno externo (`connect_tycoon.link01`).
- Multilingüismo: limitado al coreano declarado en la model card y al inglés del prompt de sistema; no hay evidencia de otras lenguas.
- Capacidades especiales: ninguna adicional (sin visión, audio ni modo thinking).

## Casos de uso

- Destilación de políticas RL en modelos de lenguaje: usar este adaptador como referencia para reproducir el pipeline PPO → corpus textual → LoRA → PPO con KL en otras tareas de control discreto.
- Investigación educativa en RL: emplear el cuaderno de Colab y el repositorio CONNECT TYCOON para que estudiantes comparen las tasas de éxito de las etapas (37,2 % sin entrenar, 88,5 % SFT, 88,8 % RL) y entiendan el efecto del ajuste fino.
- Evaluación de robustez a prompt injection: el diseño con separación explícita entre instrucciones y datos de estado permite probar cómo se comporta un modelo pequeño ante intentos de manipulación en el campo `state`.
- Prototipado de controladores de bajo coste en simulación: al ser un adaptador de 0,8B, se puede ejecutar en una GPU de consumo para iterar sobre circuitos y recompensas antes de invertir en políticas más grandes.
- Generación de datos sintéticos de decisión: usar el modelo como generador de etiquetas alternativas para aumentar el corpus de entrenamiento de otras políticas en el mismo simulador.
- Análisis de preferencias con recompensa contrafactual: estudiar cómo la fase PPO con KL reordena opciones respecto al SFT y qué opciones gana o pierde el modelo en cada estado.
- Docencia sobre alineación de modelos pequeños: ilustrar el papel del anclaje KL y de la recompensa contrafactual en un caso con métricas cerradas y reproducibles (semillas 91001–91020).

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, sobre el circuito `8bb27dff` y 20 episodios con semillas 91001–91020:

| Modelo | Acierto en test (misma respuesta que el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (política PPO) | 100,0 % | 100 % | 0 % | 20,0 s |
| Sin entrenar (base) | 37,2 % | 0 % | 20 % | — |
| SFT (LoRA supervisado) | 88,5 % | 90 % | 15 % | 22,6 s |
| RL (PPO + KL, este modelo) | 88,8 % | 95 % | 10 % | 21,0 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores proceden de la evaluación propia del autor en un entorno de marcha 2D aproximado y no son directamente comparables con benchmarks de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, un modelo base de 0,8B en precisión FP16 ocupa aproximadamente 1,6 GB de pesos, más el adaptador LoRA (tamaño del repo: 0,0 GB, es decir, muy pequeño).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; una RTX 3060, RTX 4060 o superior es suficiente. Para cuantización en 8 bits o 4 bits, basta con 2–3 GB.
- GPU de consumo: sí, cabe holgadamente en tarjetas de gama media y en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado por el autor); compatible con vLLM, TGI y llama.cpp solo si se fusiona el adaptador en el modelo base y se convierte a los formatos correspondientes, lo cual no está documentado en la model card.
- Latencia y throughput: no disponibles. La tarea es de clasificación de una letra, por lo que la latencia vendrá dominada por el prefill del prompt de estado, no por la decodificación.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la información proporcionada. La categoría (adaptadores LoRA de 0,8B para control discreto en simulación) es muy específica y no hay alternativas documentadas en la model card. Se indica "no disponible".

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | Adaptador sobre 0,8B | No disponible | Decisión discreta en `avoid_obstacles` | Apache 2.0 | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ámbito muy restringido: el adaptador solo se ha entrenado para la tarea `avoid_obstacles` en un circuito concreto (`8bb27dff`); no generaliza a otras tareas, circuitos ni dominios sin reentrenamiento.
- Evaluación aproximada: la métrica de éxito se calcula con una tabla de velocidades 2D derivada del MuJoCo web, sin modelo físico ni red de locomoción; el autor advierte que los resultados pueden diferir de los de MuJoCo real.
- Brecha respecto al profesor: el modelo RL acierta el 88,8 % de las decisiones del profesor y logra el 95 % de éxito frente al 100 % del profesor; sigue cometiendo un 10 % de episodios con colisión.
- Riesgo de alucinación de formato: aunque el prompt exige una sola letra, un modelo de 0,8B puede devolver texto adicional o una letra no listada; conviene validar la salida en producción.
- Sesgos: no documentados por el autor; al estar entrenado sobre un único circuito y una única política, hereda los sesgos de esa política (por ejemplo, preferencia por ciertas rutas).
- Idioma: la model card declara solo coreano; el prompt de sistema está en inglés. No hay evidencia de buen rendimiento en castellano ni en otras lenguas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado; el autor no detalla la licencia del modelo base en la información proporcionada.
- Uso en robot real: el propio autor indica que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio concretos antes de usarlo en producción.
- Fecha de creación futura (2026-11-03) en los metadatos de HuggingFace, lo que sugiere que el repositorio puede ser un artefacto de prueba o tener metadatos inconsistentes; conviene verificar la integridad antes de confiar en él.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zero885814/connectailab-rl-grid-empathy-v4-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web CONNECT AI WORLD (robot lab): https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
