# yujin-choi/Taxi-v4-Qtable

## Resumen

Taxi-v4-Qtable es un agente de aprendizaje por refuerzo entrenado mediante Q-Learning tabular para resolver el entorno Taxi-v4 de Gymnasium. Lo desarrolla el usuario yujin-choi y se publica como un artefacto de pesos (una tabla Q serializada en formato pickle) más que como un modelo neuronal: no contiene una red profunda, sino una tabla de valores Q indexada por estados y acciones discretas. El problema que resuelve es el clásico entorno Taxi de Gymnasium, en el que un taxi debe recoger y dejar pasajeros en cuatro ubicaciones de una cuadrícula con 25 posiciones y 500 estados discretos.

El interés de esta ficha es acotado: se trata de una implementación de referencia de Q-Learning tabular, útil para validar pipelines de entrenamiento, reproducir resultados básicos y comparar con agentes neuronales (DQN, PPO) sobre el mismo entorno. No es un modelo de lenguaje ni un sistema generativo: no procesa texto, no tiene parámetros en el sentido de un transformer y no admite cuantización ni despliegue en motores de inferencia de LLM.

El repositorio pesa 0.0 GB y no declara licencia ni idiomas. La model card solo incluye el resultado de evaluación declarado por el autor: una recompensa media de 7.54 ± 2.71 en Taxi-v4, marcada como no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q estado-accion, sin red neuronal) |
| Parametros totales | no disponible (tabla Q discreta; el entorno Taxi-v4 tiene 500 estados y 6 acciones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de decision secuencial, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplica a una tabla Q en pickle) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | pickle (`q-learning.pkl`) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular clásico, el algoritmo de control off-policy de diferencias temporales propuesto por Watkins. El agente mantiene una tabla Q de dimensiones estado x accion y actualiza sus valores mediante la regla de Bellman con una tasa de aprendizaje y un factor de descuento que la model card no detalla. La política de comportamiento durante el entrenamiento (epsilon-greedy u otra) y el número de episodios tampoco se especifican en la información disponible.

No hay datos de entrenamiento en el sentido de corpus: el agente aprende interactuando con el simulador Taxi-v4 de Gymnasium. No se documentan técnicas de RLHF, DPO ni innovaciones arquitectónicas. El artefacto se carga con `load_from_hub` desde el Hub de Hugging Face y se ejecuta contra `gym.make(model["env_id"])`; la model card advierte que puede ser necesario ajustar atributos del entorno (por ejemplo, `is_slippery=False`).

## Capacidades

- Resolución del entorno Taxi-v4: recogida y entrega de pasajeros en una cuadrícula con 25 posiciones y cuatro destinos.
- Política determinista derivada de la tabla Q (selección de la acción con mayor valor Q en cada estado).
- Aprendizaje por refuerzo tabular con convergencia garantizada bajo condiciones estándar de Q-Learning (exploración suficiente y entorno finito).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM.
- No tiene capacidades multilingües, de visión, audio ni modo de pensamiento.
- No genera texto: su salida es una acción discreta entre seis posibles (mover norte, sur, este, oeste, recoger, dejar).

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo mínimo y reproducible de Q-Learning tabular para explicar la ecuación de Bellman, la exploración epsilon-greedy y la convergencia de la tabla Q en un entorno de 500 estados.
- Validación de pipelines de entrenamiento: permite comprobar de extremo a extremo el flujo de entrenamiento, serialización y publicación en el Hub antes de escalar a agentes neuronales más costosos.
- Línea base para comparativas: proporciona una referencia de recompensa media (7.54 ± 2.71) contra la que medir DQN, PPO o A2C sobre Taxi-v4.
- Pruebas de integración de Gymnasium: útil para verificar la compatibilidad de la API `gym.make` y `load_from_hub` en entornos de CI.
- Experimentos de ablation: al ser una tabla Q, permite estudiar el efecto de hiperparámetros (alpha, gamma, epsilon) sin la variabilidad de una red neuronal.
- Demostraciones educativas interactivas: se puede visualizar la política aprendida sobre la cuadrícula del taxi para ilustrar cómo un agente mejora con la experiencia.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7.54 +/- 2.71 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia consiste en una búsqueda en una tabla Q en memoria principal (unos pocos kilobytes en pickle).
- GPU recomendadas: ninguna; el agente se ejecuta en CPU.
- Cabe en cualquier consumer GPU y en cualquier CPU moderna, incluidos entornos sin acelerador.
- Opciones de despliegue: Python con Gymnasium y `huggingface_hub` (`load_from_hub`); no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; dependen del bucle de simulación de Gymnasium, no del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Taxi-v4-Qtable (yujin-choi) | Q-Learning tabular | Taxi-v4 | 7.54 +/- 2.71 (no verificado) | no disponible | Hugging Face Hub |
| Agentes DQN sobre Taxi-v4 | Red neuronal profunda | Taxi-v4 | no disponible | variable | implementaciones de referencia en la literatura |
| Agentes PPO sobre Taxi-v4 | Policy gradient | Taxi-v4 | no disponible | variable | implementaciones de referencia en la literatura |

No se dispone de resultados comparables publicados en la informacion proporcionada para los agentes neuronales; la comparativa se limita a la categoría de algoritmo y al entorno.

## Limitaciones y advertencias

- La recompensa media declarada (7.54 ± 2.71) está marcada como no verificada por el autor; no debe tomarse como resultado validado de forma independiente.
- La tabla Q solo es válida para Taxi-v4; no generaliza a otros entornos ni a variantes con distinta configuración (por ejemplo, `is_slippery`).
- No hay licencia declarada, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier uso en producción.
- No se documentan hiperparámetros, número de episodios ni política de exploración, lo que dificulta la reproducibilidad exacta del entrenamiento.
- El formato pickle puede suponer un riesgo de seguridad al deserializar artefactos de origen desconocido; se recomienda cargarlo solo en entornos controlados.
- No es un modelo de lenguaje: no admite prompts, no genera texto y no tiene sesgos lingüísticos ni riesgo de alucinación en el sentido habitual; sus fallos se manifiestan como políticas subóptimas en el entorno.
- No se declaran idiomas ni sesgos conocidos; la información disponible es insuficiente para evaluar robustez fuera de Taxi-v4.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yujin-choi/Taxi-v4-Qtable
- Entorno Taxi-v4 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de `load_from_hub` (Hugging Face Hub): https://huggingface.co/docs/huggingface_hub
- Repositorio de Gymnasium: https://github.com/Farama-Foundation/Gymnasium
