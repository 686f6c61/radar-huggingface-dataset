# Vladprime/ppo-custom-LunarLander-v2

## Resumen

`Vladprime/ppo-custom-LunarLander-v2` es un agente de aprendizaje por refuerzo entrenado con una implementación propia de PPO (Proximal Policy Optimization) para el entorno `LunarLander-v2` de Gymnasium. Lo publica Vlad Kolomiiets (`Vladprime`) como parte del curso Deep RL de Hugging Face (Unidad 8, Parte I), y no se apoya en Stable Baselines ni en ningún modelo preentrenado: el algoritmo completo (PPO recortado, estimación de ventaja generalizada, pérdida de valor recortada, regularización por entropía y recorte de gradiente) está implementado desde cero en PyTorch.

El modelo no es un modelo de lenguaje ni un transformer generativo: es una política categórica estocástica que mapea el estado de 8 dimensiones del módulo lunar a una de cuatro acciones discretas (no hacer nada, encender motor principal, motor lateral izquierdo, motor lateral derecho). El repositorio ocupa 0,0 GB, no registra descargas ni likes, y su relevancia es fundamentalmente didáctica y de verificación: sirve como referencia reproducible de un entrenamiento PPO completo con semilla fija y evaluación independiente sobre 200 semillas.

El resultado declarado es una recompensa media de -135,2229 con desviación típica de 83,1176, es decir, un rendimiento negativo que indica que la política inicial todavía no resuelve el entorno de forma consistente. El autor lo reconoce explícitamente en la model card ("initial trained policy, with remaining room to improve").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para RL (PPO recortado); no se detalla la topología de la red en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con observación de 8 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio no especifica el formato de los checkpoints; el tamaño del repo es 0,0 GB) |

## Arquitectura y entrenamiento

El agente implementa PPO con recorte (clipped PPO), estimación de ventaja generalizada (GAE), pérdida de valor recortada, regularización por entropía y recorte de gradiente, todo escrito desde cero en PyTorch siguiendo la unidad 8 del curso Deep RL de Hugging Face. El entrenador reside en `train.py` y no utiliza Stable Baselines como implementación de PPO. No se empleó ningún modelo preentrenado.

El entrenamiento usó la semilla 20261101 y acumuló 149.504 pasos de entorno. La evaluación es independiente: 200 semillas fijas (1000000–1000199), política categórica estocástica con muestreo sembrado de forma separada en cada episodio, y recompensas del entorno sin modificar. El autor indica que al recargar el modelo se reprodujeron los retornos de los cinco primeros episodios de evaluación, lo que aporta una comprobación parcial de determinismo en la carga.

## Capacidades

- Control de un agente en el entorno `LunarLander-v2` mediante política categórica estocástica sobre 4 acciones discretas.
- Toma de decisiones paso a paso a partir de observaciones de 8 dimensiones del estado del módulo lunar.
- Entrenamiento reproducible desde cero: `pip install -r requirements.txt` y `python train.py`.
- Evaluación reproducible con semillas fijas y muestreo separado por episodio.
- No dispone de tool calling, function calling, razonamiento multi-paso tipo agente LLM, capacidades multilingües, visión, audio ni modo de pensamiento: no es un modelo generativo de texto.

## Casos de uso

- Material didáctico de PPO: usar el repositorio como referencia completa de un ciclo PPO (GAE, recorte de política, recorte de valor, entropía, recorte de gradiente) para comparar con implementaciones de librerías como CleanRL o Stable Baselines.
- Reproducción de experimentos: ejecutar `train.py` con la semilla 20261101 para verificar el pipeline de entrenamiento y la reproducibilidad de los retornos de evaluación.
- Punto de partida para ajuste fino: continuar el entrenamiento desde la política publicada para intentar superar la recompensa media negativa actual, midiendo la mejora sobre el mismo conjunto de 200 semillas.
- Evaluación comparativa de algoritmos: emplear la métrica de recompensa media sobre semillas fijas como línea base para contrastar PPO con alternativas (A2C, DQN, SAC en variantes discretas) en `LunarLander-v2`.
- Docencia y talleres de RL: demostrar de forma práctica por qué una política PPO inicial puede quedar por debajo del umbral de resolución del entorno y cómo diagnosticarlo con desviación típica alta.
- Pruebas de infraestructura de evaluación: validar pipelines de evaluación con semillas sembradas y comprobar que la recarga del checkpoint reproduce los retornos iniciales.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Reinforcement Learning | LunarLander-v2 | mean_reward | -135,2229 +/- 83,1176 |

Datos adicionales de la model card: media menos desviación típica = -218,3405; evaluación sobre 200 semillas fijas (1000000–1000199) con política estocástica; 149.504 pasos de entorno durante el entrenamiento. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,0 GB, por lo que el checkpoint es muy pequeño y cabe con holgura en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por el tamaño del artefacto, cualquier GPU (incluidas integradas o CPU) es suficiente para la inferencia.
- Cabe en GPU consumer: sí, previsiblemente en cualquier modelo con unos pocos cientos de MB de VRAM libres; el dato exacto no está disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un agente de RL); el despliegue previsto es la ejecución directa de PyTorch mediante `train.py` o la carga del checkpoint con el código del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vladprime/ppo-custom-LunarLander-v2 | PPO desde cero (PyTorch) | LunarLander-v2 | -135,2229 +/- 83,1176 | Apache 2.0 | HuggingFace, 0 descargas |
| CleanRL PPO LunarLander | PPO de referencia (implementación educativa) | LunarLander-v2 | no disponible en la información proporcionada | MIT (según el proyecto CleanRL) | Repositorio GitHub |
| Stable Baselines3 PPO | PPO sobre librería consolidada | LunarLander-v2 | no disponible en la información proporcionada | MIT | PyPI / GitHub |

No se dispone de cifras de recompensa de las alternativas en la información proporcionada, por lo que la comparación numérica queda limitada al resultado declarado por este modelo.

## Limitaciones y advertencias

- Rendimiento negativo: la recompensa media de -135,2229 está lejos del umbral habitual de resolución de `LunarLander-v2` (200 puntos en la literatura del entorno); la política no resuelve la tarea de forma fiable.
- Alta varianza: desviación típica de 83,1176 y media menos desviación de -218,3405 indican episodios muy irregulares y riesgo de fallos frecuentes.
- Entrenamiento corto: 149.504 pasos de entorno y una única semilla de entrenamiento (20261101); no hay evidencia de estabilidad entre semillas.
- Resultados no verificados: el model-index marca `verified: false`; los datos proceden del autor y no de una evaluación independiente.
- Sin información sobre la arquitectura de la red, número de parámetros ni formato de pesos, lo que dificulta la reutilización fuera del código del repositorio.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling, agentes multi-paso ni capacidades multilingües; cualquier uso fuera de `LunarLander-v2` requiere reentrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución y conservación del aviso de licencia, pero no hay garantías de idoneidad para producción.
- Repositorio sin tracción: 0 descargas y 0 likes, sin mantenimiento ni issues documentados en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vladprime/ppo-custom-LunarLander-v2
- Curso Deep RL, Unidad 8 Parte I (base del código): https://huggingface.co/learn/deep-rl-course/en/unit8/hands-on-cleanrl
