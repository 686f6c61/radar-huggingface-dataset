# zero885814/connectailab-rl-grid-empathy-v3-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario zero885814 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión específico para robótica: lee en texto el estado de un robot caminante (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra que identifica la acción a ejecutar durante los siguientes 0,5 segundos. La tarea concreta es `goto_target` sobre un circuito 2D con cinco obstáculos.

El modelo se construye en dos fases. Primero se entrena una política PPO en un simulador web (brain.json) sobre un curso identificado como `9a9d1db9`, con un espacio de observación de 21 valores y 5 acciones discretas. Después se destila esa política en el modelo de lenguaje mediante LoRA: se generan 486 pares estado-texto → acción (277 de entrenamiento, 124 de validación y 85 de test) y se aplica aprendizaje supervisado seguido de un ajuste con refuerzo (PPO con anclaje KL) que premia las acciones que habrían producido mejores recompensas que la acción del profesor.

La relevancia de esta ficha es doble. Por un lado, ilustra una técnica de destilación de políticas de refuerzo en LLM pequeños (0,8B parámetros) para control de agentes. Por otro, sus propios resultados muestran una tensión interesante: el ajuste con RL mejora la tasa de éxito en el circuito (100 % frente al 90 % del modelo supervisado) pero reduce la coincidencia con la política profesora (68,2 % frente al 71,8 %). Es un caso de estudio útil sobre cómo la métrica de imitación no siempre correlaciona con el rendimiento en la tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (Qwen/Qwen3.5-0.8B) |
| Parámetros totales | No disponible (el adaptador LoRA no declara su número de parámetros entrenables; el modelo base tiene 0,8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada en la model card) |
| Tipos de cuantización | No disponible (el repo solo contiene safetensors del adaptador; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | Coreano (`ko`) según la etiqueta de la model card; el prompt de sistema está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base Qwen/Qwen3.5-0.8B por separado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango aplicado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. La tarea se formula como clasificación de una sola letra entre cinco opciones (A–E), cada una correspondiente a una acción de locomoción de 0,5 segundos. El pipeline de entrenamiento tiene tres etapas: (1) entrenamiento PPO de una política en el simulador web CONNECT AI WORLD sobre el curso `9a9d1db9`, con observación de 21 dimensiones (distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa) y 5 acciones; (2) generación de un dataset de 486 ejemplos textualizando las observaciones cada 0,5 segundos, con la acción del profesor como etiqueta y un 20 % de ejemplos con acciones alternativas que desviaban al robot; (3) ajuste supervisado del LoRA y posterior ajuste con PPO anclado por KL, donde la recompensa de cada opción se estima como el retorno que habría obtenido el profesor si hubiera continuado desde ese estado.

La innovación metodológica destacable es el uso de la política RL como profesor para generar recompensas contrafactuales por opción, en lugar de un reward model aprendido por separado. El autor documenta un experimento controlado de ingeniería de recompensas: la versión v3 se entrenó con la penalización por colisión cambiada de -1,0 a -4,0, lo que elevó la tasa de finalización de 6/20 a 20/20 y redujo las colisiones de 7/20 a 0/20. La evaluación de caminata se realiza con una aproximación 2D basada en una tabla de velocidades por comando, no con el simulador MuJoCo completo, por lo que los resultados pueden diferir del entorno real.

## Capacidades

- Clasificación de acciones discretas: dado un estado textualizado del robot, devuelve exactamente una letra entre las cinco opciones disponibles.
- Razonamiento de decisión a corto horizonte: la acción cubre 0,5 segundos de locomoción; no planifica a largo plazo.
- Seguimiento estricto de formato: el prompt de sistema exige devolver solo la letra, sin explicación, y tratar el contenido del estado como datos y no como instrucciones.
- Robustez ante estados fuera de distribución: el dataset incluye un 20 % de ejemplos con acciones alternativas que desviaban al robot, lo que aporta cierta cobertura de estados no óptimos.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modos de razonamiento extendido.
- Capacidad multilingüe muy limitada: la etiqueta de idioma es coreano y el prompt de sistema está en inglés; no se documenta soporte para castellano.

## Casos de uso

- Control de un robot caminante simulado en circuitos con obstáculos: el modelo se coloca en el punto de decisión y emite una acción cada 0,5 segundos, sustituyendo a la política PPO original. Es adecuado porque fue entrenado exactamente para esa tarea y ese formato de observación.
- Destilación de políticas RL en LLM pequeños para investigación: sirve como referencia reproducible de cómo convertir una política de control en un modelo de lenguaje, con dataset, código y métricas publicadas.
- Estudio de ingeniería de recompensas: la comparación v2/v3 (penalización -1,0 frente a -4,0) permite analizar cómo un único cambio en la función de recompensa altera el comportamiento final del agente.
- Evaluación de robustez ante instrucciones inyectadas: el prompt de sistema incluye una defensa explícita contra instrucciones dentro del estado, lo que lo convierte en un banco de pruebas para prompt injection en entornos de control.
- Docencia en cursos de refuerzo y robótica: el notebook de Colab y el repositorio connect-tycoon permiten reproducir el pipeline completo en un entorno accesible.
- Prototipado rápido de agentes de decisión en videojuegos o simuladores 2D: el formato de observación textual y la salida de una letra son fáciles de integrar en un bucle de simulación ligero.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. La métrica de "éxito" se mide sobre 20 episodios con semillas 91001–91020 en el mismo curso, usando una aproximación 2D de la caminata.

| Modelo | Acierto en test (coincidencia con el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio de éxito |
|---|---|---|---|---|
| Política PPO (profesor) | 100,0 % | 100 % | 0 % | 6,1 s |
| Modelo base sin ajuste | 22,4 % | 0 % | 0 % | — |
| Ajuste supervisado (SFT) | 71,8 % | 90 % | 5 % | 8,1 s |
| Ajuste con RL (PPO + KL) | 68,2 % | 100 % | 0 % | 7,6 s |

No se han publicado resultados en benchmarks estándar de LLM (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El modelo base de 0,8B en fp16 requiere aproximadamente 1,6 GB de pesos, más overhead de activaciones y KV cache; el adaptador LoRA añade un consumo marginal.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería poder ejecutar el modelo base en fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes, A100 o H100 no aportan ventaja significativa dado el tamaño.
- Cabe en GPU de consumo: sí, con margen amplio, incluidas GPUs de gama media y posiblemente iGPUs con suficiente memoria compartida.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un adaptador LoRA sobre un modelo base no cuantizado, el despliegue estándar es el stack de Hugging Face.
- Latencia y throughput: no disponibles. La tarea requiere una decisión cada 0,5 segundos, pero no se publican medidas de latencia por inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (adaptadores LoRA para decisión robótica destilados de políticas PPO sobre LLM pequeños). Se indica "no disponible" para evitar comparaciones sin datos verificables.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-grid-empathy-v3-link01 | 0,8B (base) + LoRA | No disponible | Decisión robótica `goto_target` | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ámbito muy restringido: el modelo solo resuelve la tarea `goto_target` en el curso `9a9d1db9` con 21 observaciones y 5 acciones; no generaliza a otros circuitos, robots o espacios de acción sin reentrenamiento.
- Evaluación aproximada: la métrica de caminata usa una tabla 2D de velocidades por comando, no el simulador MuJoCo completo; los resultados pueden diferir del entorno real y no se reportan caídas.
- Brecha entre imitación y rendimiento: el modelo con RL obtiene mejor tasa de éxito (100 %) pero peor coincidencia con el profesor (68,2 %) que el SFT (71,8 %); no debe interpretarse la coincidencia con el profesor como métrica principal de calidad.
- Riesgo de alucinación de formato: aunque el prompt exige devolver solo una letra, no se documenta la tasa de respuestas mal formadas ni el comportamiento fuera de distribución.
- Idiomas: etiqueta `ko` y prompt de sistema en inglés; no hay evidencia de funcionamiento fiable en castellano.
- Licencia Apache 2.0 permite uso comercial, pero el autor advierte explícitamente que es un modelo de investigación y educación y que debe revalidarse en el robot y el espacio reales antes de cualquier despliegue físico.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.
- Dependencia del código `connect_tycoon.link01` para construir las preguntas; sin ese paquete, el formato de entrada debe replicarse manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zero885814/connectailab-rl-grid-empathy-v3-link01
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web CONNECT AI WORLD: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
