# suryeon123/connectailab-rl-suryeon-kim-v1-link01-walk-ppo

## Resumen

`connectailab-rl-suryeon-kim-v1-link01-walk-ppo` es una política de aprendizaje por refuerzo entrenada con PPO para controlar la locomoción de un robot bípedo simulado denominado LINK-01. No es un modelo de lenguaje ni un transformer generativo: es un agente de control continuo que mapea observaciones de 51 dimensiones a acciones de 14 dimensiones (una por articulación), entrenado en el entorno `Link01Walk-v0` construido sobre MuJoCo y la librería `link01-gym`. Lo publica el usuario `suryeon123` en el marco del proyecto CONNECT AI LAB, vinculado a un curso de refuerzo profundo (AI CITY BUILDERS, séptima lección).

El modelo resuelve una tarea concreta: que el robot avance caminando de forma estable a una velocidad comandada de 0,18 m/s sin caerse. Según la model card, se entrenó desde cero durante 2.000.000 de pasos (38,6 minutos de cómputo) con una tasa de aprendizaje de 0,0003 y un clip de PPO de 0,2. Los resultados declarados son modestos pero consistentes: 2,34 m recorridos por episodio de 20 segundos, velocidad media de 0,117 m/s y 0,0 caídas por minuto.

Su relevancia es acotada y experimental: sirve como referencia reproducible de un pipeline PPO completo (política, normalización de observaciones y exportación de acciones) para robótica de locomoción en simulación, no como componente listo para producción. El repositorio ocupa 0,0 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) sobre observaciones continuas; red neuronal no especificada en detalle |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 51 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (artefactos `model.zip` de Stable-Baselines3, no pesos en formato de cuantización) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl` (normalizador de observaciones), `actor.json` (exportación de la política) |

## Arquitectura y entrenamiento

El agente sigue el paradigma de aprendizaje por refuerzo profundo con el algoritmo PPO (Proximal Policy Optimization) implementado en Stable-Baselines3. El entorno `Link01Walk-v0`, definido en `link01-gym` sobre el simulador físico MuJoCo, expone un espacio de observación de 51 dimensiones y un espacio de acción continuo de 14 dimensiones correspondientes a las 14 articulaciones del robot bípedo LINK-01, con una postura base centrada en ±0,18 rad. La política se entrena desde cero, sin inicialización a partir de demostraciones ni destilación.

El entrenamiento declarado comprende 2.000.000 de pasos en 38,6 minutos, con tasa de aprendizaje 0,0003 y factor de recorte (clip) de 0,2, valores estándar de PPO. El paquete incluye un fichero `vecnormalize.pkl` que aplica normalización de observaciones en tiempo de inferencia, paso imprescindible para reproducir el comportamiento entrenado. La evaluación se realizó con una velocidad comandada de 0,18 m/s sobre 5 episodios de 20 segundos. No se detalla la composición del dataset (no aplica, al ser RL), ni el uso de recompensas conformadas, ni la semilla o el número de entornos paralelos empleados.

## Capacidades

- Control locomotor de un robot bípedo simulado: genera comandos articulares continuos de 14 dimensiones para mantener la marcha.
- Seguimiento de una consigna de velocidad: entrenado para una referencia de 0,18 m/s, con velocidad media observada de 0,117 m/s.
- Estabilidad sin caídas en la evaluación declarada: 0,0 caídas por minuto en 5 episodios de 20 segundos.
- Desplazamiento efectivo: 2,34 m por episodio de 20 segundos.
- Integración con el ecosistema Stable-Baselines3: carga directa mediante `PPO.load("model.zip")` y uso conjunto de `VecNormalize`.
- Exportación de la política en `actor.json` para inspección o despliegue fuera de Python.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión, audio ni capacidades multilingües.

## Casos de uso

- Reproducción de un pipeline PPO completo en robótica: sirve como plantilla didáctica para entrenar y evaluar políticas de locomoción en MuJoCo, cargando `model.zip` y `vecnormalize.pkl` con Stable-Baselines3.
- Comparación de algoritmos de RL: al estar entrenado con PPO y parámetros documentados (2M de pasos, lr 0,0003, clip 0,2), permite contrastar contra SAC, TD3 o A2C en el mismo entorno `Link01Walk-v0`.
- Transferencia sim-to-sim: la política puede evaluarse en variantes del entorno con perturbaciones de fricción o masa para medir su robustez antes de plantear transferencia a hardware.
- Base para ajuste fino con recompensas alternativas: el checkpoint permite continuar el entrenamiento con funciones de recompensa que prioricen velocidad, eficiencia energética o suavidad de la marcha.
- Validación de exportaciones: el `actor.json` facilita comprobar la paridad entre la inferencia en Python y una implementación embebida o en otro lenguaje.
- Material docente para cursos de RL: encaja en sesiones prácticas sobre entornos Gymnasium y MuJoCo, dado su tamaño reducido y tiempo de entrenamiento inferior a una hora.
- Prototipado de controladores para robots bípedos de bajo coste: como referencia inicial de política caminante antes de escalar a modelos con más articulaciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre `Link01Walk-v0`, 5 episodios de 20 segundos y consigna de 0,18 m/s:

| Metrica | Valor |
|---|---|
| Distancia por episodio de 20 s | 2,34 m |
| Velocidad media de avance | 0,117 m/s |
| Caídas por minuto | 0,0 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB y la política es una red pequeña, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; para inferencia basta una GPU integrada o incluso CPU, dado el reducido coste computacional de una política de 51 a 14 dimensiones.
- Entrenamiento: los 2.000.000 de pasos se completaron en 38,6 minutos según el autor, lo que sugiere un entorno de una sola GPU consumer o CPU con paralelización moderada; no se detalla el hardware exacto.
- Despliegue: Stable-Baselines3 (carga nativa de `model.zip`), con MuJoCo como simulador; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-suryeon-kim-v1-link01-walk-ppo | PPO, locomoción bípeda | `Link01Walk-v0` (MuJoCo) | 2M pasos, 38,6 min | no disponible | Hugging Face |
| connectailab-rl-suryeon-kim-v2-humanoid-ppo | PPO, humanoide | no disponible | no disponible | no disponible | Hugging Face |
| connectailab-rl-soo-v1-teacher | PPO, toma de decisiones | Gymnasium (entorno propio) | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Resultados no verificados: las métricas de la model card están marcadas como `verified: false` y no han sido replicadas de forma independiente.
- Rendimiento limitado: la velocidad media (0,117 m/s) queda por debajo de la consigna (0,18 m/s), lo que indica un seguimiento imperfecto del comando.
- Ámbito restringido: solo válido para el robot LINK-01 y el entorno `Link01Walk-v0`; no es transferible a otros morfologías sin reentrenamiento.
- Dependencia del normalizador: omitir `vecnormalize.pkl` en la inferencia altera las observaciones y degrade el comportamiento.
- Simulación únicamente: no hay evidencia de transferencia sim-to-real ni de robustez ante perturbaciones físicas.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sesgos y alucinación: no aplican en el sentido de modelos generativos, pero la política puede exhibir comportamientos fuera de distribución ante observaciones no vistas durante el entrenamiento.
- Soporte y mantenimiento: repositorio sin descargas ni interacciones, creado y actualizado el mismo día; no hay garantía de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suryeon123/connectailab-rl-suryeon-kim-v1-link01-walk-ppo
- Modelo relacionado (humanoide PPO): https://huggingface.co/suryeon123/connectailab-rl-suryeon-kim-v2-humanoid-ppo
- Modelo relacionado (teacher PPO): https://huggingface.co/suryeon123/connectailab-rl-soo-v1-teacher
- Stable-Baselines3: https://stable-baselines3.readthedocs.io/
- MuJoCo: https://mujoco.org/
- Gymnasium: https://gymnasium.farama.org/
