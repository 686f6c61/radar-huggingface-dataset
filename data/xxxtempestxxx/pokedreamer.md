# xxxTEMPESTxxx/PokeDreamer

## Resumen

PokeDreamer es un proyecto de aprendizaje por refuerzo basado en modelos (model-based RL) que implementa un world model al estilo Dreamer para jugar a Pokémon Red en la consola Game Boy mediante el emulador PyBoy. Lo desarrolla el usuario de HuggingFace `xxxTEMPESTxxx` y se publica bajo licencia MIT. No es un modelo de lenguaje: es un conjunto de checkpoints de redes neuronales (un VAE, un modelo de dinámica latente recurrente y una sonda lineal de coordenadas) entrenados sobre observaciones de baja resolución de 40×36×3 píxeles.

El repositorio v1 contiene tres componentes entrenados: un autoencoder variacional que comprime cada fotograma a un vector latente continuo de 32 dimensiones, un modelo de dinámica recurrente basado en una celda GRU que predice el siguiente estado latente a partir del estado actual y la acción, y una sonda lineal que mapea los latentes a coordenadas del mapa extraídas directamente de la WRAM del emulador. El objetivo es aprender una representación del entorno que permita planificar y navegar por el mundo del juego sin depender de recompensas densas.

Es relevante para quienes investigan model-based RL aplicado a videojuegos con observaciones visuales de baja resolución, planificación con horizonte (MPC) y evaluación de la calidad de representaciones latentes mediante probing. El tamaño del repositorio es de 4,1 GB, lo que incluye checkpoints y vídeos de demostración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE convolucional + modelo de dinamica latente GRU + sonda lineal (world model estilo Dreamer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (rollouts autoregresivos de hasta 30 pasos en las demos) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en punto flotante) |
| Idiomas soportados | en (etiqueta del repositorio) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El sistema se compone de tres modulos. El VAE procesa observaciones de 40×36×3 y las proyecta a un espacio latente continuo de 32 dimensiones mediante un cuello de botella convolucional; se entrena con una perdida combinada de reconstruccion (BCE) y divergencia KL. El modelo de dinamica es una celda GRU autorregresiva que recibe el par (estado latente, accion) y predice el siguiente estado latente. Para evitar la deriva compuesta en rollouts largos, se entrena con *scheduled sampling*: la probabilidad de *teacher forcing* decae a lo largo de las epocas. La sonda de coordenadas es una capa lineal que mapea los latentes a las coordenadas del overworld (x, y) y al identificador de mapa extraidos de la WRAM del emulador, y sirve para medir la alineacion espacial de la representacion aprendida.

No se especifican en la informacion disponible el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplican en este contexto). Tampoco se detalla el volumen de datos de entrenamiento, el numero de episodios ni la configuracion exacta de hiperparametros.

## Capacidades

- Prediccion del siguiente estado latente del entorno a partir de la accion, con rollouts autoregresivos de hasta 30 pasos en las demostraciones.
- Reconstruccion de fotogramas del emulador desde el espacio latente (decodificador del VAE).
- Localizacion espacial: la sonda lineal estima coordenadas (x, y) y `map_id` a partir del estado latente.
- Planificacion con horizonte mediante busqueda MPC (model predictive control) que usa las sondas de coordenadas para navegar por el overworld (demostracion de 100 pasos).
- Aprendizaje de representaciones visuales de baja resolucion (40×36×3) para entornos tipo Game Boy.
- No soporta tool calling, function calling, agentes basados en lenguaje, capacidades multilingues ni modos de razonamiento textual.

## Casos de uso

- Investigacion en model-based RL: sirve como referencia reproducible de un world model estilo Dreamer aplicado a un entorno con observaciones visuales de baja resolucion, con checkpoints publicos para comparar variantes.
- Estudio de planificacion con MPC: el planner de 100 pasos con sondas de coordenadas permite analizar como la calidad del modelo de dinamica afecta a la navegacion a largo plazo.
- Evaluacion de representaciones latentes: la sonda lineal de coordenadas y `map_id` ofrece una metrica objetiva de alineacion espacial del espacio latente, util para comparar arquitecturas de encoder.
- Benchmark de deriva en rollouts: el uso de *scheduled sampling* y las demos de 30 pasos permiten medir el error de reconstruccion compuesto en predicciones autoregresivas.
- Reproduccion de experimentos: los checkpoints en PyTorch y el codigo archivado en `v1/src` permiten reentrenar o afinar el VAE y el modelo de dinamica sobre nuevas observaciones.
- Docencia y divulgacion: los vídeos `side_by_side_demo.mp4` y `planner_navigation_demo.mp4` ilustran de forma visual la diferencia entre fotogramas reales y reconstruidos, utiles en materiales formativos sobre world models.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el VAE opera sobre tensores de 40×36×3 y latentes de 32 dimensiones, por lo que la huella es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 3060 o superior) es suficiente; el codigo de ejemplo contempla `cuda` o `cpu`.
- Cabe en GPU consumer: si, practicamente en cualquier modelo reciente.
- Opciones de despliegue: PyTorch nativo; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PokeDreamer v1 | World model (VAE + GRU + sonda) | no disponible | rollouts de 30 pasos | MIT | HuggingFace |
| DreamerV3 (referencia) | World model general | no disponible en esta ficha | no disponible | MIT (codigo) | publico |
| Otros world models para Atari/DMC | World model | no disponible | no disponible | variable | publico |

No se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre Pokémon Red en Game Boy con observaciones de 40×36×3; no generaliza a otros juegos ni a resoluciones mayores sin reentrenamiento.
- El horizonte de prediccion fiable esta limitado a decenas de pasos (30 en las demos); mas alla, la deriva autoregresiva degrada la calidad.
- La sonda de coordenadas depende de la WRAM del emulador y del mapeo concreto del juego; no es portable a otras ROMs sin recalibracion.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones en lenguaje natural ni tool calling.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.
- Licencia MIT permite uso comercial, pero el uso de ROMs de Pokémon Red queda sujeto a los derechos de autor de Nintendo/Game Freak; el repositorio no incluye la ROM.
- No se documentan sesgos, riesgos de alucinacion en el sentido de modelos generativos de texto, ni metricas de robustez fuera de las demos publicadas.

## Enlaces

- HuggingFace: https://huggingface.co/xxxTEMPESTxxx/PokeDreamer
- PyBoy (emulador): https://github.com/Baekalfen/PyBoy
- Dreamer (referencia de model-based RL): https://github.com/danijar/dreamerv3
