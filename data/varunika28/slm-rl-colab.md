# Varunika28/slm-rl-colab

## Resumen

Varunika28/slm-rl-colab es un adaptador LoRA (PEFT) desarrollado por Varunika28 para el taller SLM-RL, un framework de auto-mejora para modelos de lenguaje pequeños que aprenden a jugar videojuegos mediante refuerzo. Este adaptador se aplica sobre el modelo base LiquidAI/LFM2.5-1.2B-Instruct y lo especializa para jugar al juego Boxing de Atari en un entorno de texto, generando acciones válidas en formato `ACTION: <id>`.

El adaptador se entrenó con la técnica `reject_sft` sobre demostraciones de un agente DQN, y fue promovido como campeón en la generación 2 del taller, mejorando la puntuación primaria de -0.5000 a -0.3750. Su relevancia radica en demostrar cómo un modelo de lenguaje pequeño puede adaptarse a tareas de control secuencial mediante RL, sin necesidad de modificar el modelo base. El repositorio contiene únicamente los pesos del adaptador (0.0 GB), no el modelo completo, y está pensado para ser usado con la librería PEFT de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LiquidAI/LFM2.5-1.2B-Instruct (arquitectura del base no especificada) |
| Parametros totales | No disponible (adaptador LoRA, peso del base no incluido) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se carga en bfloat16 o float32; el base puede cuantizarse aparte) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (PEFT adapter, subcarpeta `adapter/`) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation), que añade matrices de bajo rango a las capas del modelo base sin modificar sus pesos originales. El modelo base, LiquidAI/LFM2.5-1.2B-Instruct, es un modelo de lenguaje de 1.2 mil millones de parámetros, pero no se proporcionan detalles sobre su arquitectura interna (número de capas, tipo de atención, etc.) en la información disponible.

El entrenamiento se realizó con el framework SLM-RL, que sigue un ciclo de auto-mejora: el modelo juega partidas en un entorno de texto, las decisiones se recopilan en un dataset, y el modelo se ajusta con refuerzo. En este caso, se usó `reject_sft` (rejection sampling + supervised fine-tuning) sobre demostraciones generadas por un agente DQN. Las métricas de entrenamiento indican 16 prompts, una pérdida de -0.023, un KL de 0.508 y una recompensa media de 0.1797. No se especifica el número de épocas ni el tamaño del dataset de demostraciones.

## Capacidades

- Generacion de acciones de juego: el adaptador produce comandos de texto como `ACTION: <id>` para el entorno Boxing de Atari, restringido a las acciones legales definidas en el prompt (por ejemplo, NOOP, UP).
- Especializacion en tarea unica: no conserva capacidades generales de generacion de texto mas alla de la tarea de control del juego; el modelo base original puede tener otras habilidades, pero el adaptador las enmascara.
- Integracion con el pipeline SLM-RL: disenado para ser usado dentro del taller SLM-RL, permitiendo evolucionar el agente en generaciones sucesivas.
- Soporte de tool calling: no disponible; el adaptador no anade capacidades de llamada a funciones.
- Capacidades multilingues: no disponibles; el prompt de sistema esta en ingles.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para LLMs: el adaptador sirve como ejemplo de como un modelo de lenguaje pequeno puede aprender una politica de control mediante RL, util para estudiar la interaccion entre generacion de texto y toma de decisiones.
- Desarrollo de agentes de juego en entornos de texto: puede integrarse en el gymnasium de SLM-RL para jugar Boxing, permitiendo probar variaciones del adaptador o del prompt.
- Evaluacion de tecnicas de fine-tuning eficiente: al ser un adaptador LoRA, es util para comparar el rendimiento de metodos como `reject_sft` frente a otros enfoques de RL en modelos pequenos.
- Prototipado rapido de agentes conversacionales con acciones: aunque limitado a Boxing, el patron de generar `ACTION: <id>` puede extrapolarse a otros dominios con acciones discretas.
- Benchmarking de hardware de inferencia: al ser un modelo pequeno (1.2B + adaptador), permite medir latencia y consumo de VRAM en GPUs de gama baja o incluso CPU.
- Educacion y talleres: el adaptador se usa en el taller SLM-RL como punto de partida para que los participantes evolucionen agentes, demostrando el ciclo completo de auto-mejora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas metricas reportadas son las del entrenamiento y evaluacion dentro del taller:

| Metrica | Valor |
|---|---|
| Puntuacion primaria (evaluacion) | -0.3750 |
| Tasa de victorias | 0.0 |
| Tasa de acciones invalidas | 0.0 |
| Tasa de intervencion | 0.0 |
| Episodios de evaluacion | 8 |
| Recompensa media (entrenamiento) | 0.1797 |

Estos valores corresponden al entorno Boxing y no son comparables con benchmarks de lenguaje general.

## Requisitos de hardware

- VRAM estimada: el modelo base de 1.2B en bfloat16 ocupa aproximadamente 2.4 GB; el adaptador LoRA anade unos pocos MB. En total, cabe en GPUs con 4 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4090, A100, H100). Tambien puede ejecutarse en CPU con float32, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: si, es perfectamente ejecutable en GPUs de consumo como la serie RTX 30 o 40.
- Opciones de despliegue: se puede usar con transformers + PEFT en Python, o exportar a GGUF para llama.cpp/Ollama, aunque no se proporcionan instrucciones para ello.
- Latencia y throughput: no disponibles; al ser un modelo pequeno, se espera una generacion de 24 tokens en menos de un segundo en GPU moderna, pero no hay datos medidos.

## Comparativa con modelos similares

Existen otros adaptadores del mismo taller SLM-RL, como `apsjai03/slm-rl-colab`, que siguen la misma estructura (LoRA sobre el mismo modelo base para el mismo juego). Sin embargo, no se dispone de datos comparativos de rendimiento entre ellos. La comparativa se limita a la informacion publica:

| Modelo | Base | Juego | Puntuacion primaria | Licencia |
|---|---|---|---|---|
| Varunika28/slm-rl-colab | LiquidAI/LFM2.5-1.2B-Instruct | Boxing | -0.3750 | Apache-2.0 |
| apsjai03/slm-rl-colab | LiquidAI/LFM2.5-1.2B-Instruct | Boxing | No disponible | Apache-2.0 |

No se dispone de informacion sobre otros modelos comparables fuera del ecosistema SLM-RL.

## Limitaciones y advertencias

- Especifico de una tarea: el adaptador solo funciona para el juego Boxing; no es util para otras tareas de lenguaje o control.
- Rendimiento bajo: la tasa de victorias es 0.0 y la puntuacion primaria es negativa (-0.375), lo que indica que el agente no gana partidas y su comportamiento es suboptimo.
- Datos de entrenamiento limitados: solo 16 prompts, lo que puede provocar sobreajuste al entorno concreto y poca generalizacion.
- Sesgos del entorno: el modelo puede aprender estrategias sesgadas por las demostraciones del DQN, que no necesariamente son optimas.
- Riesgo de alucinacion: al ser un modelo de lenguaje, puede generar acciones invalidas si el prompt no restringe correctamente el espacio de acciones, aunque la tasa de invalidas reportada es 0.0.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el modelo base LiquidAI/LFM2.5-1.2B-Instruct puede tener sus propias restricciones; se debe verificar su licencia por separado.
- Sin soporte para produccion: es un artefacto de investigacion para un taller; no esta disenado para aplicaciones criticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Varunika28/slm-rl-colab
- Dataset asociado: https://huggingface.co/datasets/Varunika28/slm-rl-colab-data
- Framework SLM-RL: https://github.com/CraftsMan-Labs/SLM-RL
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
