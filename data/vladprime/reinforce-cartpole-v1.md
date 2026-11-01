# Vladprime/reinforce-CartPole-v1

## Resumen

`Vladprime/reinforce-CartPole-v1` es un agente de aprendizaje por refuerzo publicado en HuggingFace por Vlad Kolomiiets (`Vladprime`) que resuelve el entorno clásico `CartPole-v1` de Gymnasium mediante el algoritmo Monte Carlo REINFORCE. No es un modelo de lenguaje: se trata de una política neuronal entrenada desde inicialización aleatoria que, dado el estado de cuatro dimensiones del carro (posición, velocidad, ángulo y velocidad angular), emite una distribución categórica sobre dos acciones discretas (empujar a izquierda o a derecha).

El interés del artefacto es fundamentalmente pedagógico y de reproducibilidad. Se generó como parte de la unidad 4 del Hugging Face Deep RL Course y su autor documenta de forma explícita el protocolo de entrenamiento (400 episodios, 85 624 pasos de entorno, semilla 20261101) y la evaluación independiente sobre 200 semillas fijas (1000000–1000199), con una recompensa media de 497,77 y una desviación típica de 12,51. El resultado se sitúa en el umbral de resolución del entorno, fijado en 475 de recompensa media sostenida.

Por su tamaño (el repositorio ocupa 0,0 GB y solo contiene un `state_dict` de una red pequeña) y su naturaleza, no compite con modelos fundacionales ni sirve como base general: es una referencia mínima, verificable y con licencia Apache 2.0 para estudiar la implementación de REINFORCE con retornos descontados y normalización por episodio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (MLP) con salida categórica sobre 2 acciones; algoritmo Monte Carlo REINFORCE |
| Parametros totales | no disponible (el repositorio no detalla el número de parámetros; el tamaño del repo es 0,0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de refuerzo con observación de 4 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `state_dict` de PyTorch (checkpoint serializado; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

La política es una red neuronal feed-forward cuya salida es una distribución categórica sobre las dos acciones de `CartPole-v1`. El entrenamiento sigue REINFORCE en su variante Monte Carlo: se recolectan episodios completos, se calculan retornos descontados y se normaliza el retorno por episodio antes de aplicar la actualización de gradiente de política. Durante el entrenamiento se muestrea de la distribución categórica; en evaluación se usa una política determinista (argmax), lo que reduce la varianza de la recompensa medida.

El autor documenta 400 episodios y 85 624 pasos de entorno con semilla 20261101, partiendo de inicialización aleatoria. La selección del checkpoint se hizo con un conjunto de semillas de validación separado del de evaluación, y se verificó que al recargar el checkpoint se reproducían todas las recompensas de los episodios reservados. No se emplean innovaciones como attention lineal, decodificación especulativa ni optimización con RLHF/DPO; el valor técnico reside en la trazabilidad del protocolo y en la reproducibilidad del resultado.

## Capacidades

- Control discreto en el entorno `CartPole-v1`: mantiene el péndulo en equilibrio durante el máximo de 500 pasos por episodio.
- Política determinista en inferencia: dado un vector de observación de 4 dimensiones, devuelve una acción (0 o 1).
- Entrenamiento reproducible: scripts `train.py` y `requirements.txt` permiten reentrenar desde cero con la semilla documentada.
- Recarga verificable: el `state_dict` reproduce exactamente las recompensas de los episodios reservados.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión, audio ni capacidades multilingües.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo mínimo y funcional de REINFORCE con retornos descontados y normalización por episodio, ideal para comparar contra variantes con baseline o actor-crítico en un curso.
- Verificación de pipelines de RL: al incluir semilla, número de pasos y protocolo de evaluación, permite validar que una infraestructura de entrenamiento reproduce resultados conocidos antes de escalar a entornos mayores.
- Pruebas de integración de Gymnasium: el checkpoint y el script de entrenamiento permiten comprobar que una instalación de Gymnasium, PyTorch y dependencias funciona correctamente de extremo a extremo.
- Referencia de evaluación con semillas fijas: el conjunto de 200 semillas (1000000–1000199) es reutilizable como protocolo de comparación entre algoritmos de política para `CartPole-v1`.
- Base para experimentos de ablation: al ser una implementación pequeña y aislada, es un punto de partida adecuado para medir el efecto de añadir baseline, ventaja generalizada o recorte de gradiente.
- Demostración de despliegue de políticas en HuggingFace Hub: ilustra el flujo de publicar un `state_dict` con model-index y métricas declaradas, útil como plantilla para artefactos de RL.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Tarea | Reinforcement Learning |
| Entorno | CartPole-v1 |
| Recompensa media (`mean_reward`) | 497,7700 |
| Desviación típica | 12,5127 |
| Media menos desviación | 485,2573 |
| Episodios de evaluación | 200 (semillas 1000000–1000199) |
| Episodios de entrenamiento | 400 |
| Pasos de entorno | 85 624 |
| Semilla de entrenamiento | 20261101 |

No se han publicado resultados comparativos con otros algoritmos (por ejemplo, DQN o PPO) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; la red es de tamaño reducido y el repositorio ocupa 0,0 GB.
- GPU recomendadas: no requiere GPU; la inferencia y el entrenamiento caben holgadamente en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y también en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo cargando el `state_dict` con la clase `Policy` de `train.py`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles en la información proporcionada; por la dimensión del entorno y de la red, se espera una latencia por paso del orden de microsegundos en CPU, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Vladprime/reinforce-CartPole-v1` | REINFORCE Monte Carlo | CartPole-v1 | no disponible | no aplica | Apache 2.0 | HuggingFace Hub |
| Políticas de referencia del Deep RL Course | REINFORCE / PPO / DQN | CartPole-v1 | no disponible | no aplica | según curso | Material del curso |
| Implementaciones de Stable-Baselines3 | PPO, A2C, DQN | CartPole-v1 y otros | según configuración | no aplica | MIT | PyPI / GitHub |

No se dispone de datos de benchmark comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: la política solo es válida para `CartPole-v1`; no generaliza a otros entornos ni a variaciones del problema.
- Métricas no verificadas: el model-index marca `verified: false`; los resultados proceden del propio autor y no han sido replicados de forma independiente.
- Varianza del algoritmo: REINFORCE Monte Carlo tiene alta varianza; la desviación típica de 12,51 sobre una media de 497,77 indica que algunos episodios quedan por debajo del umbral de resolución.
- Sin información sobre sesgos: no procede evaluar sesgos sociales, pero tampoco se documentan análisis de robustez frente a perturbaciones del estado.
- Licencia permisiva: Apache 2.0 permite uso comercial y modificación con atribución; no obstante, el valor comercial del artefacto es prácticamente nulo por su alcance.
- Sin soporte de producción: no hay versiones cuantizadas, servidores de inferencia compatibles ni garantías de mantenimiento; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- Dependencia de la clase `Policy` de `train.py`: el `state_dict` no es autocontenido y requiere el código del repositorio para cargarse.

## Enlaces

- HuggingFace: https://huggingface.co/Vladprime/reinforce-CartPole-v1
- Curso Deep RL de Hugging Face, unidad 4 (REINFORCE): https://huggingface.co/learn/deep-rl-course/en/unit4/hands-on
