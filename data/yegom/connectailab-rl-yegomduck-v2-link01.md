# yegom/connectailab-rl-yegomduck-v2-link01

## Resumen

connectailab-rl-yegomduck-v2-link01 es un adaptador LoRA publicado por el desarrollador independiente yegom (Sehyun Park) sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de lenguaje de propósito general, sino un modelo de decisión de dominio muy restringido: recibe en texto el estado de un robot bípedo simulado en el entorno LINK-01 del ecosistema CONNECT TYCOON (distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a la acción de locomoción para los siguientes 0,5 segundos.

El interés técnico está en el método: el autor entrenó primero una política PPO en un simulador web (un "cerebro" exportado como brain.json), generó un conjunto de problemas traduciendo observaciones a lenguaje natural y usó esa política como profesora para un ajuste supervisado con LoRA sobre el LLM. Después aplicó una fase de refuerzo con PPO y una penalización KL contra el modelo supervisado, premiando las acciones que habrían producido mejores recompensas si el resto de la trayectoria la hubiera completado la política original.

Es relevante como ejemplo reproducible de destilación de políticas de refuerzo hacia modelos de lenguaje pequeños (0,8B de parámetros) para toma de decisiones secuencial, con licencia Apache 2.0, código de entrenamiento público y cuaderno de Colab. El alcance es educativo y de investigación en simulación; el propio autor advierte que debe revalidarse antes de cualquier uso sobre un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no disponible de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors del adaptador) |
| Idiomas soportados | coreano (ko); las instrucciones del sistema se proporcionan en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros, mediante LoRA. La tarea se formula como clasificación de una letra entre cinco opciones (obs21-act5 según la convención del autor), con una instrucción de sistema que obliga a devolver únicamente la letra y a tratar el contenido del estado como datos, no como instrucciones. El pipeline de entrenamiento tiene cuatro etapas: (1) entrenamiento de una política PPO en el simulador web sobre la tarea goto_target, con observaciones de 21 dimensiones y 5 acciones; (2) generación de un dataset de decisión traduciendo cada observación a texto y usando la acción de la política como etiqueta, con un 20 % de ejemplos en los que se introducen desviaciones deliberadas; (3) ajuste supervisado con LoRA para imitar a la política; (4) refinamiento con PPO donde la recompensa de cada opción se estima dejando que la política original complete la trayectoria, con anclaje KL al modelo supervisado.

El dataset resultante tiene 687 ejemplos de entrenamiento, 149 de validación y 175 de test. La tasa de coincidencia entre la representación textual y la política original es del 100 %, lo que fija el techo de acierto de la tarea. No se documentan en la información disponible el número de tokens de entrenamiento del modelo base, la composición de su corpus ni si Qwen3.5-0.8B incorpora RLHF o DPO; esos datos pertenecen al modelo base y no se detallan aquí.

## Capacidades

- Clasificación de decisiones de locomoción: dado un estado textual del robot, devuelve una de cinco letras de acción para el siguiente intervalo de 0,5 segundos.
- Seguimiento de instrucciones estricto: responde solo con la letra solicitada, sin explicación, según el formato definido en la model card.
- Robustez ante instrucciones embebidas: el prompt de sistema indica explícitamente tratar el contenido del estado como datos y no como instrucciones.
- Tarea única goto_target: navegación hacia un objetivo con evitación de obstáculos en el simulador LINK-01.
- No se documentan capacidades de generación libre, razonamiento general, código, matemáticas, visión, audio, tool calling ni agentes multi-paso. El adaptador está especializado y no se presenta como modelo conversacional.

## Casos de uso

- Investigación en destilación de políticas RL a LLM: reproducir el pipeline completo (PPO en simulador, generación de dataset textual, SFT con LoRA y PPO con KL) usando el cuaderno de Colab y el repositorio connect-tycoon como referencia metodológica.
- Educación en aprendizaje por refuerzo: el modelo y su model card sirven para ilustrar cómo se evalúa una política destilada comparando la tasa de coincidencia con la política profesora y el éxito en episodios completos.
- Prototipado de controladores de bajo coste en simulación: el adaptador de 0,8B puede ejecutarse en hardware modesto para experimentar con políticas de navegación antes de escalar a modelos mayores.
- Evaluación de robustez ante ruido en la observación: el 20 % de ejemplos con desviaciones permite estudiar cómo degrada el modelo cuando el estado textual no coincide exactamente con lo que vería la política original.
- Benchmark de imitación vs. refuerzo: los resultados publicados (82,3 % de acierto con SFT frente a 84,0 % con PPO, pero 75 % vs. 70 % de éxito en episodios) permiten analizar la brecha entre métricas offline y rendimiento en tarea.
- Base para experimentos de alineación con KL: el esquema de recompensa por opción con anclaje al modelo supervisado es reutilizable en otros dominios de decisión discreta.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La evaluación de caminata usa una aproximación 2D con tabla de velocidades por comando, no el simulador MuJoCo completo; el propio autor advierte que los resultados pueden diferir de los de MuJoCo.

| Modelo | Acierto en test (coincidencia con la política) | Éxito en 20 episodios del mismo recorrido | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política PPO (profesora) | 100,0 % | 100 % | 5 % | 14,0 s |
| Modelo base sin ajuste | 50,9 % | 0 % | 45 % | no disponible |
| SFT con LoRA | 82,3 % | 75 % | 60 % | 16,9 s |
| RL con PPO (este adaptador) | 84,0 % | 70 % | 75 % | 16,6 s |

No se han publicado resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 0,8B parámetros; en fp16 ocupa aproximadamente 1,6 GB de pesos, y el adaptador LoRA añade una cantidad marginal no especificada. Con cuantización de 4 bits el modelo base cabría en torno a 0,5 GB, aunque el repositorio no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para fp16; una RTX 3060, RTX 4060 o superior permite holgura. Para lotes grandes o entrenamiento, se recomienda una RTX 4090 o una A100.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer recientes con 4 GB o más de VRAM.
- Opciones de despliegue: transformers con PEFT (el método documentado en la model card), vLLM o TGI para servir el modelo base con el adaptador, y llama.cpp u Ollama si se convierte el modelo fusionado a GGUF (no se proporciona esa conversión).
- Latencia y throughput: no disponibles. El autor no publica medidas de latencia; la decisión se emite para intervalos de 0,5 segundos, lo que sugiere que la latencia debe ser inferior a ese umbral, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión RL destilados a LLM en el ecosistema CONNECT AI LAB. Como referencia del modelo base y de alternativas genéricas de tamaño similar:

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-yegomduck-v2-link01 | 0,8B (base) + LoRA | no disponible | Decisión de locomoción goto_target | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B | 0,8B | no disponible | LLM generalista | no disponible en esta ficha | Hugging Face |
| Política PPO original (brain.json) | no aplica (red pequeña) | no aplica | Decisión de locomoción goto_target | no disponible | Repositorio connect-tycoon |

No se identifican en la información proporcionada otros adaptadores RL sobre LLM para robótica con los que comparar directamente.

## Limitaciones y advertencias

- Dominio extremadamente restringido: solo resuelve la tarea goto_target con observaciones de 21 dimensiones y 5 acciones; no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Evaluación aproximada: la métrica de éxito en episodios usa una tabla de velocidades 2D en lugar del simulador MuJoCo, por lo que puede no reflejar el comportamiento real.
- Brecha entre métricas: el modelo con PPO mejora el acierto offline (84,0 % vs. 82,3 %) pero empeora el éxito en episodios (70 % vs. 75 %) y aumenta las colisiones (75 % vs. 60 %) respecto al modelo con SFT.
- Riesgo de alucinación de formato: al ser un modelo de lenguaje, puede devolver texto distinto de la letra esperada si el prompt no sigue exactamente el formato documentado.
- Idiomas: el adaptador está entrenado solo en coreano; el prompt de sistema está en inglés y no se documenta su comportamiento en castellano.
- Sesgos: no se documentan análisis de sesgos; el modelo opera sobre datos sintéticos de simulación y no se han evaluado sesgos sociales.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor lo describe como modelo de investigación y educación en simulación y recomienda revalidarlo en el robot y el espacio reales antes de cualquier despliegue físico.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción ni mantenimiento por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yegom/connectailab-rl-yegomduck-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código de entrenamiento (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
