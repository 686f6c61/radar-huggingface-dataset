# TheOnlyGoatsan/car-racing-ppo

## Resumen

`TheOnlyGoatsan/car-racing-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) sobre el entorno `CarRacing-v3` de Gymnasium, donde el objetivo es conducir un coche a partir de observaciones puramente visuales (píxeles). Lo desarrolla el usuario de Hugging Face TheOnlyGoatsan como parte de una serie de experimentos en los que se modifica el diseño de la recompensa y se evalúa cada variante sobre el mismo conjunto fijo de 100 pistas. Este repositorio corresponde a la "run 4" de esa serie, que obtiene una recompensa media de 742,4 ± 156,9 frente a los 540 ± 34 de la recompensa original del juego.

El modelo no es un modelo de lenguaje ni un transformer generativo, sino una política neuronal convolucional (CNN) que mapea observaciones de 64x64 en escala de grises con dos fotogramas apilados a acciones de conducción discretas cada dos fotogramas. Se entrenó con Stable-Baselines3 2.9.2 durante 4 millones de decisiones y se distribuye como un archivo `.zip` de SB3 junto con el normalizador de recompensas. Es relevante como referencia reproducible de ingeniería de recompensas en RL visual: el autor documenta de forma explícita cómo cada cambio en la función de recompensa afecta al rendimiento medido de forma determinista.

El interés práctico es acotado: se trata de un artefacto de investigación y experimentación, no de un modelo listo para producción. Su valor está en la metodología de evaluación (100 semillas fijas, acciones deterministas, recompensa del juego como métrica neutral) y en la comparación controlada entre variantes de recompensa, algo poco habitual en repositorios de RL publicados en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (política `CnnPolicy` de Stable-Baselines3) con cabezas separadas de actor y crítico de 256 unidades (GELU) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 64x64 en escala de grises con 2 fotogramas apilados, 1 decisión cada 2 fotogramas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.zip` de Stable-Baselines3 (`final.zip`) y normalizador `VecNormalize` (`final_vecnormalize.pkl`) |

## Arquitectura y entrenamiento

La política es una red convolucional que procesa observaciones visuales de 64x64 píxeles en escala de grises, apilando los dos últimos fotogramas para capturar información de movimiento. El agente toma una decisión cada dos fotogramas del juego. La cabeza del actor y la del crítico tienen 256 unidades con activación GELU. El algoritmo es PPO con gSDE (generalized State-Dependent Exploration), tasa de aprendizaje 1e-4 con decaimiento lineal hasta 0, `n_steps` de 4096, tamaño de lote 128, 10 épocas por actualización, `gamma` 0,99, `lambda` de GAE 0,95 y recorte de 0,2. Las recompensas se normalizan con `VecNormalize`. El entrenamiento totaliza 4 millones de decisiones.

La innovación principal no está en la arquitectura, sino en el diseño de la recompensa. Sobre la recompensa original del juego (+1000/N por cada nueva loseta de pista visitada, -0,1 por fotograma) el autor añade penalizaciones y bonificaciones por fotograma: -0,1 cuando ninguna rueda toca la carretera (césped), hasta -0,05 por salir de una banda alrededor de la línea central (media carretera en rectas, carretera completa antes de curvas), hasta +0,05 por velocidad a lo largo de la pista solo sobre la carretera, y -0,1 por unidad de cambio de dirección entre decisiones para penalizar el zigzagueo. El benchmark se realiza sobre 100 pistas fijas (semillas 1000-1099) con acciones deterministas y se puntúa con la recompensa propia del juego, de modo que la recompensa de entrenamiento no contamina la medición.

## Capacidades

- Conducción autónoma en el entorno `CarRacing-v3` a partir de píxeles, sin acceso al estado interno del simulador.
- Control continuo de dirección, aceleración y freno traducido a acciones discretas cada dos fotogramas.
- Seguimiento de la línea central de la pista y mantenimiento del vehículo sobre la carretera gracias a las penalizaciones de césped y de banda central.
- Estabilización de la trayectoria mediante la penalización por cambios bruscos de dirección.
- Generalización limitada a pistas no vistas: evaluado sobre 100 semillas distintas de las de entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento; es una política de control, no un modelo generativo.

## Casos de uso

- Investigación en ingeniería de recompensas: sirve como caso de estudio reproducible de cómo variaciones concretas en la función de recompensa (césped, banda central, velocidad, suavidad de dirección) afectan a la recompensa media medida de forma determinista sobre un conjunto fijo de pistas.
- Línea base para RL visual: puede usarse como referencia de rendimiento (742,4 ± 156,9) al comparar nuevos algoritmos o arquitecturas sobre `CarRacing-v3` con el mismo protocolo de 100 semillas.
- Docencia y demostraciones de PPO con Stable-Baselines3: el repositorio incluye el modelo, el normalizador y el CSV de benchmark, lo que facilita reproducir la evaluación en un curso o taller.
- Estudio de estabilidad de políticas con gSDE: la combinación de gSDE y penalización por cambio de dirección permite analizar el equilibrio entre exploración y suavidad de control en espacios de acción continuos.
- Pruebas de pipelines de evaluación determinista: el archivo `bench.csv` con retorno, fotogramas, proporción de losetas visitadas, vuelta completada y proporción en sentido contrario sirve para validar herramientas de análisis de agentes de RL.
- Punto de partida para transferencia a simuladores de conducción: la política preentrenada puede inicializar experimentos de fine-tuning en entornos de conducción con observaciones visuales similares, aunque requiere adaptar los wrappers de observación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), medidos sobre 100 pistas fijas (semillas 1000-1099) con acciones deterministas y puntuados con la recompensa propia del juego:

| Configuración | Recompensa media ± IC 95% | Diferencia pareada frente a la recompensa del juego |
|---|---|---|
| Recompensa original del juego (run 1) | 540 ± 34 | — |
| Este modelo (run 4, recompensa modelada) | 742,4 ± 156,9 | +202 ± 35 por pista; mejor en 87 de 100 pistas |

Datos adicionales aportados por el autor: mediana de 783; el 15% de las pistas alcanzan 900 o más (el umbral de "resuelto" es una media de 900, por lo que el entorno no se considera resuelto); en el 85% de las pistas el agente agota el límite de 1000 fotogramas antes de completar la vuelta, lo que señala la velocidad como su principal limitación.

## Requisitos de hardware

- Inferencia muy ligera: la política es una CNN pequeña sobre entradas de 64x64; cabe holgadamente en cualquier GPU consumer e incluso puede ejecutarse en CPU con latencias bajas.
- VRAM estimada: no disponible de forma exacta, pero inferior a 1 GB en la práctica dado el tamaño de la red y de la observación.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU moderna (RTX 3060 o superior) sobra para la inferencia. Para reentrenar, una GPU consumer de gama media es suficiente para 4 millones de decisiones, aunque el tiempo concreto no está documentado.
- Cabe en GPU consumer: sí, en cualquier modelo actual e incluso en iGPU.
- Opciones de despliegue: carga directa con Stable-Baselines3 (`PPO.load("final.zip")`) sobre Gymnasium; no aplica vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheOnlyGoatsan/car-racing-ppo (este) | CarRacing-v3 | PPO + gSDE | 742,4 ± 156,9 (100 pistas fijas) | MIT | Hugging Face |
| Recompensa original del juego (run 1 del mismo autor) | CarRacing-v3 | PPO | 540 ± 34 (100 pistas fijas) | MIT | Referencia interna del mismo repositorio |
| Otras políticas públicas de CarRacing-v3 | CarRacing-v3 | PPO / SAC / DQN | no disponible | variable | no disponible |

No se dispone de datos verificables de otros agentes públicos sobre `CarRacing-v3` con el mismo protocolo de evaluación, por lo que la comparación con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- El entorno no está resuelto: la media de 742,4 queda por debajo del umbral de 900 que se considera "resuelto" en `CarRacing-v3`.
- Limitación de velocidad: en el 85% de las pistas el agente no completa la vuelta dentro del límite de 1000 fotogramas, lo que indica una política conservadora o poco eficiente en el trazado.
- Alta varianza: la desviación declarada es de ±156,9, muy superior a la de la línea base (±34), lo que sugiere comportamiento irregular entre pistas.
- Dependencia de los wrappers de observación: para conducir correctamente hay que replicar exactamente el redimensionado a 64x64, la escala de grises, el salto de 2 fotogramas y el apilado de 2 fotogramas; sin ellos la política no funciona.
- El normalizador `final_vecnormalize.pkl` no es necesario para conducir, pero sí para reproducir el entrenamiento o análisis de recompensas.
- Resultados no verificados: la métrica del model-index está marcada como `verified: false` y procede del propio autor.
- El código de entrenamiento no está publicado en el momento de la ficha (el repositorio de GitHub se anuncia como "público pronto"), lo que dificulta la reproducción completa.
- Sin datos de sesgos, alucinación o multilingüismo: no aplica al no ser un modelo de lenguaje. La licencia MIT permite uso comercial, pero el modelo solo tiene sentido dentro del entorno `CarRacing-v3` y no como sistema de conducción real.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validación por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheOnlyGoatsan/car-racing-ppo
- Repositorio de código de entrenamiento (anunciado como público próximamente): https://github.com/GOATsann/goatsan-lab
- Entorno `CarRacing-v3` de Gymnasium: https://gymnasium.farama.org/environments/box2d/car_racing/
- Stable-Baselines3 (PPO, CnnPolicy, gSDE, VecNormalize): https://stable-baselines3.readthedocs.io/
