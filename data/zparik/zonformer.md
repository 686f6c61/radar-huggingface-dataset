# zParik/zonformer

## Resumen

ZonFormer es una política de planificación (scheduling) de trabajos para clústeres de computación de altas prestaciones (HPC), desarrollada por Parikshieth Harish, Suhani Bhateja y Arun Pandian J, y publicada en el repositorio de Hugging Face `zParik/zonformer`. No es un modelo de lenguaje: se trata de un transformer con arquitectura de pointer network que selecciona, en cada decisión de planificación, cuál de los 128 trabajos en cola debe arrancar a continuación en un clúster por lotes. El modelo incorpora un sesgo de atención entre pares de trabajos que codifica qué combinaciones caben simultáneamente en los núcleos libres, lo que le permite razonar sobre el empaquetado (packing) de recursos.

El modelo se entrena exclusivamente sobre cargas de trabajo simuladas y se evalúa sobre 17 trazas reales del Parallel Workloads Archive, replicadas en un simulador dirigido por eventos. Ningún trabajo de esas 17 trazas participó en el entrenamiento, las etiquetas ni la recompensa, lo que convierte la evaluación en una prueba de generalización fuera de distribución. La métrica principal es la media geométrica, sobre las 17 trazas, del *bounded slowdown* medio de la política dividido por el de F1-BF (la función de prioridad F1 con EASY backfilling), donde valores inferiores a 1 indican mejora sobre la referencia clásica.

La relevancia del trabajo reside en que la mejor variante (ZF-BC, clonación de comportamiento de F1-PC-BF) alcanza una ratio media de 1.087 con las cinco semillas por debajo de 1.15, mientras que aproximaciones de aprendizaje por refuerzo previas (DeepRM-style, RLScheduler-style) quedan en ratios de 5.6 y 8.8 respectivamente. El repositorio incluye código, políticas entrenadas, resultados por traza y scripts de reproducción, con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pointer network sobre los 128 trabajos más planificables, con sesgo de atención job-to-job basado en compatibilidad de recursos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 trabajos en cola (ventana de decisión); longitud de secuencia del transformer no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch para stable-baselines3) |
| Idiomas soportados | no aplica (modelo de planificación, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | checkpoints de stable-baselines3 / PyTorch (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

ZonFormer es un transformer relacional con cabeza de pointer network que opera sobre una observación compuesta por los 128 trabajos más planificables de la cola. La atención entre trabajos incorpora un sesgo que marca qué pares de trabajos caben juntos en los núcleos libres del clúster, de modo que el modelo puede evaluar directamente la viabilidad del empaquetado de recursos en lugar de inferirla a partir de características agregadas. El entorno es un Gymnasium con máscara de acciones, implementado sobre un simulador dirigido por eventos que modela nodos, colocación y ciclo de vida de los trabajos.

El entrenamiento combina tres recetas. ZF-BC aplica clonación de comportamiento sobre las decisiones de F1-PC-BF (F1 con backfilling y conocimiento de tiempos de ejecución). ZF-PD realiza destilación de una cartera de seis profesores. ZF-RL y ZF-RL cold aplican PPO anclado (anchored PPO) con crítico precalentado o frío, respectivamente, usando `sb3-contrib` y `maskable-ppo`. Los datos supervisados se generan con etiquetas de profesor sobre episodios simulados, y el generador de cargas se ajusta a diez trazas de entrenamiento. Cada receta se entrena con las semillas 0 a 4 y se puntúa en el paso final de entrenamiento, sin selección de checkpoint.

## Capacidades

- Selección del siguiente trabajo a arrancar en un clúster por lotes, con razonamiento sobre compatibilidad de recursos entre pares de trabajos.
- Planificación con máscara de acciones que restringe las decisiones a trabajos legalmente planificables.
- Generalización a trazas no vistas: evaluación sobre 17 logs del Parallel Workloads Archive excluidos de entrenamiento.
- Aprendizaje por imitación (clonación de comportamiento y destilación de cartera) y por refuerzo (PPO anclado).
- Integración con el ecosistema stable-baselines3 y sb3-contrib (políticas MaskablePPO).
- Evaluación con métricas de bounded slowdown, utilización, capacidad ociosa con trabajos en espera y guarda de envejecimiento (aging guard).
- No soporta tool calling, agentes multi-paso generales, visión, audio ni capacidades multilingües: es un modelo de decisión específico de dominio.

## Casos de uso

- Planificación de colas en clústeres HPC de producción: el modelo selecciona el siguiente trabajo a lanzar sobre los nodos libres, sustituyendo o complementando funciones de prioridad clásicas como F1-BF con una política aprendida que, en la mejor variante, reduce el bounded slowdown medio un 8,7 % frente a F1-BF en las 17 trazas evaluadas.
- Investigación en scheduling con aprendizaje: el repositorio incluye simulador, entorno Gymnasium, generador de cargas ajustado y scripts de benchmark, lo que permite reproducir experimentos y comparar nuevas políticas contra las líneas base clásicas y aprendidas ya puntuadas.
- Sustitución de heurísticas dependientes de tiempos de ejecución exactos: F1-PC-BF obtiene 0,992 y F1-BF 1,000; ZF-BC se aproxima a ese rendimiento (1,087) sin requerir el conocimiento exacto de runtimes que F1-PC-BF asume, lo que es útil en entornos donde las estimaciones de duración son imprecisas.
- Evaluación comparativa de algoritmos de RL para scheduling: el repositorio incluye agentes DeepRM-style y RLScheduler-style reimplementados y puntuados con la misma metodología, útiles como referencia en publicaciones y tesis.
- Prototipado de políticas de planificación en simulación antes de desplegar en un gestor de colas real: el simulador dirigido por eventos permite validar políticas con trazas del Parallel Workloads Archive antes de integrarlas en un planificador de producción.
- Estudio de robustez y varianza entre semillas: el barrido de cinco semillas por receta y los controles nulos (structured null, acciones aleatorias legales) permiten analizar la estabilidad del entrenamiento y detectar modos de fallo como el colapso de utilización observado en ZF-RL cold.

## Benchmarks y rendimiento

La métrica es la media geométrica, sobre 17 trazas, de la ratio entre el bounded slowdown medio de la política y el de F1-BF (menor es mejor). Una semilla se considera cercana si su ratio es como máximo 1,15.

| Política | Semillas | Ratio media | Rango entre semillas | Semillas cercanas |
|---|---|---|---|---|
| ZF-BC (clonación de F1-PC-BF) | 5 | 1,087 | 1,055 a 1,121 | 5 de 5 |
| ZF-PD (destilación de cartera de seis profesores) | 5 | 1,181 | 1,023 a 1,402 | 3 de 5 |
| ZF-RL (PPO anclado, crítico precalentado) | 5 | 1,745 | 1,046 a 2,917 | 2 de 5 |
| ZF-RL cold (PPO anclado, crítico frío) | 5 | 5,922 | 1,062 a 20,057 | 3 de 5 |
| Agente DeepRM-style | 3 | 5,647 | 3,842 a 8,631 | 0 de 3 |
| Agente RLScheduler-style | 3 | 8,840 | 8,391 a 9,137 | 0 de 3 |
| Nulo estructurado | 10 | 1,187 | 1,133 a 1,249 | 2 de 10 |
| Control sin entrenar (acciones legales aleatorias) | 10 | 11,681 | 11,130 a 12,503 | 0 de 10 |

Planificadores clásicos deterministas sobre las mismas trazas: F1-PC-BF 0,992; F1-BF 1,000; F1 1,328; EASY con runtimes exactos 1,841; EASY 2,649; SJF 3,115; FCFS 17,494.

Dos semillas de ZF-PD fallan en la traza lanl_o2k, con bounded slowdowns medios de 2.791 y 2.552 frente a 16,75 de F1-BF. La peor semilla de ZF-RL cold dejó un 63 % de capacidad ociosa mientras había trabajos en espera (mediana sobre las 17 trazas). Entre los cinco pares de semillas, ZF-RL y ZF-RL cold no se separan estadísticamente (Mann-Whitney U = 9, p = 0,55).

## Requisitos de hardware

- Inferencia en CPU: la evaluación del repositorio se ejecuta en CPU y es bit-idéntica entre máquinas con torch 2.11.0, lo que indica que la política es ligera y no requiere GPU.
- No se especifican requisitos de VRAM ni GPU recomendadas en la información disponible; el tamaño del repositorio (1,3 GB) incluye pesos de 20 políticas de ZF más 4 previas al estudio, 9 comparadores y checkpoints de profesores, no un único modelo grande.
- No cabe esperar despliegue en GPUs de consumo como requisito: al ser una política de decisión sobre 128 trabajos, la inferencia es de baja latencia en CPU.
- Opciones de despliegue: Python 3.10 con las dependencias fijadas en `requirements.txt`, stable-baselines3 y sb3-contrib; los pesos se cargan mediante `scripts/place_weights.py`, que enlaza `weights/` con las rutas que leen los scripts de entrenamiento y benchmark.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento (ratio vs F1-BF) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ZonFormer (ZF-BC) | Pointer transformer + BC | no disponible | 128 trabajos | 1,087 (5 semillas) | MIT | Hugging Face |
| Agente DeepRM-style | RL (política neuronal) | no disponible | no disponible | 5,647 (3 semillas) | MIT (en este repo) | Incluido en el repositorio |
| Agente RLScheduler-style | RL (política neuronal) | no disponible | no disponible | 8,840 (3 semillas) | MIT (en este repo) | Incluido en el repositorio |
| F1-BF (referencia clásica) | Heurística determinista | no aplica | no aplica | 1,000 | no aplica | Implementada en el repositorio |

## Limitaciones y advertencias

- Entrenado solo con cargas simuladas: el generador se ajusta a diez trazas y la generalización se mide en 17 trazas del Parallel Workloads Archive, pero el comportamiento en cargas de producción con patrones distintos no está caracterizado.
- Alta varianza entre semillas en las recetas de RL: ZF-RL cold llega a ratios de 20,057 en una semilla y deja un 63 % de capacidad ociosa en la peor; ZF-RL varía entre 1,046 y 2,917.
- Fallos catastróficos localizados: dos semillas de ZF-PD colapsan en la traza lanl_o2k con bounded slowdowns de 2.791 y 2.552 frente a 16,75 de F1-BF.
- El nulo estructurado alcanza 1,187 de ratio media, cercano a ZF-PD (1,181), lo que sugiere que parte de la señal puede provenir de la estructura de la observación y no solo de la política aprendida; conviene interpretar las comparaciones con cautela.
- No es un modelo de lenguaje: no ofrece generación de texto, tool calling, agentes generales ni capacidades multilingües.
- Dependencia de un simulador y de trazas externas: los logs no se redistribuyen (solo se incluye un manifiesto con URL, SHA-256 y huella de cabecera), por lo que la reproducción completa requiere descargar las trazas del archivo original.
- Licencia MIT: permite uso comercial y modificación, pero no se documentan garantías ni soporte; el uso en producción de un planificador HPC exige validación propia y mecanismos de seguridad (por ejemplo, la guarda de envejecimiento incluida en `stage_ag.py`).
- No se han documentado sesgos en el sentido de modelos lingüísticos; el riesgo relevante es el sobreajuste a la distribución de cargas simuladas y la inestabilidad del entrenamiento por RL.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zParik/zonformer
- Manuscrito de referencia: "ZonFormer: learning cluster scheduling from simulation with a relational pointer transformer" (Parikshieth Harish, Suhani Bhateja, Arun Pandian J); enlace directo no disponible.
- Parallel Workloads Archive (trazas de evaluación): https://www.cs.huji.ac.il/labs/parallel/workload/ (referencia del archivo citado en el repositorio; URL exacta en `data/traces/MANIFEST.json`).
- stable-baselines3: https://github.com/DLR-RM/stable-baselines3
- sb3-contrib (MaskablePPO): https://github.com/Stable-Baselines-Team/stable-baselines3-contrib
- Gymnasium: https://gymnasium.farama.org/
