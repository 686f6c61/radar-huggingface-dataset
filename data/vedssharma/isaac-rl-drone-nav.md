# vedssharma/isaac-rl-drone-nav

## Resumen

`isaac-rl-drone-nav` es un conjunto de políticas de control para un cuadricóptero de tipo Crazyflie que debe navegar hasta un objetivo situado a 20-24 metros a través de un campo aleatorizado de cilindros, cajas, postes finos y muros con puertas, usando únicamente una cámara de profundidad de 64 × 48 píxeles y sus sensores de movimiento. Lo desarrolla el usuario vedssharma y se publica como pesos de PyTorch dentro del ecosistema de NVIDIA Isaac Sim / Isaac Lab 2.3.2. No es un modelo de lenguaje ni un modelo fundacional: es un artefacto de aprendizaje por refuerzo e imitación para robótica aérea.

La relevancia técnica está en el pipeline de destilación: un profesor con información privilegiada (anillo lidar de 360° y posiciones verdaderas de los cuatro obstáculos más cercanos) se entrena con PPO y posteriormente se destila en estudiantes que solo ven profundidad mediante DAgger. La variante recomendada incorpora aleatorización de dominio durante el reentrenamiento del profesor y la redistilación del estudiante, lo que dispara la robustez a perturbaciones físicas y de sensores.

Todo el trabajo es exclusivamente en simulación: ningún checkpoint ha volado un dron real. El tamaño del repositorio es de 0,4 GB e incluye múltiples checkpoints, parámetros de entrenamiento y resultados de evaluación por ejecución. La política estudiante tiene aproximadamente 0,8 M de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN codificadora de profundidad + GRU (256) + MLP (256-256-128) para la política estudiante; PPO con RSL-RL para el profesor |
| Parámetros totales | ~0,8 M (estudiante); profesor no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de truncamiento de BPTT de 48 pasos en el estudiante GRU |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de control robótico) |
| Licencia | No disponible |
| Formato de pesos | Checkpoints PyTorch (`.pt`) |
| Entrada | Vector de 18 + 3072 números: velocidad lineal (3), velocidad angular (3), dirección de gravedad (3), acción previa (4), dirección del objetivo en marco corporal (3), distancia normalizada (1), altitud (1) y mapa de profundidad 48 × 64 en metros/6 recortado a [0, 1] |
| Frecuencia de control | 50 Hz (física a 100 Hz) |
| Entorno de entrenamiento | NVIDIA Isaac Sim / Isaac Lab 2.3.2 |
| Tarea | Navegación de cuadricóptero a través de obstáculos desde profundidad |

## Arquitectura y entrenamiento

El pipeline consta de tres fases. Primero, un profesor privilegiado se entrena con PPO (RSL-RL) en 4096 entornos paralelos con un currículo de obstáculos de 10 niveles; observa un anillo lidar de 360° y las posiciones verdaderas de los cuatro obstáculos más cercanos. Los términos de recompensa incluyen orientación en la dirección de avance y mantenerse por debajo de 3 m de altitud, lo que hace su comportamiento imitable desde una cámara frontal. Segundo, los estudiantes se destilan del profesor congelado mediante DAgger: el estudiante vuela y el profesor etiqueta sus acciones. La CNN codifica la imagen de profundidad en 64 números que, junto con 18 entradas de movimiento, alimentan una GRU de 256 unidades y una MLP de 256-256-128; la GRU se entrena con retropropagación truncada en ventanas de 48 pasos. Tercero, la variante aleatorizada reentrena al profesor bajo aleatorización de dominio y redistila al estudiante con la misma aleatorización: masa e inercia ± 20 %, empuje ± 15 %, retardo de motor hasta 50 ms, resistencia aerodinámica ± 30 %, latencia de 0-40 ms, viento constante de hasta 2 m/s con rachas, ruido de observación y ruido de profundidad × 2. El cabeceo de cámara no se aleatorizó en entrenamiento; un ± 5° adicional sobre todo lo demás cuesta aproximadamente un punto de tasa de éxito.

El cómputo total fue de unas 130 ejecuciones en GPUs L40S alquiladas individualmente, con un coste aproximado de 140 dólares.

## Capacidades

- Navegación autónoma de un cuadricóptero hacia un objetivo a 20-24 m en entornos con obstáculos densos, usando solo profundidad y sensores de movimiento.
- Control reactivo a 50 Hz con memoria temporal gracias a la GRU (ventana de 48 pasos), lo que permite anticipar obstáculos y corregir trayectorias.
- Robustez a perturbaciones físicas en la variante aleatorizada: variaciones de masa, empuje, retardo de motor, resistencia, latencia, viento y ruido de sensores.
- Generalización a mapas no vistos: evaluación en 60 layouts por nivel nunca vistos en entrenamiento.
- Dos modos de operación según checkpoint: máxima robustez (GRU aleatorizado) o máximas cifras nominales (GRU sin aleatorizar).
- El profesor privilegiado existe como referencia pero no es desplegable (requiere lidar de 360° y posiciones verdaderas de obstáculos).
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües, visión genérica, audio ni modo thinking: es una política de control específica de tarea.

## Casos de uso

- Investigación en navegación aérea basada en profundidad: punto de partida reproducible para comparar destilación DAgger frente a PPO directo sobre observaciones parciales, con checkpoints y parámetros de entrenamiento incluidos en el repositorio.
- Docencia y experimentación con Isaac Lab: el pipeline completo (profesor privilegiado, currículo de 10 niveles, destilación, aleatorización de dominio) sirve como ejemplo didáctico de destilación de políticas en robótica.
- Evaluación de robustez de políticas: la variante aleatorizada permite estudiar la degradación de la tasa de éxito bajo perturbaciones físicas y de sensores, con datos de referencia publicados (81,9 % en L5 aleatorizado frente a 54,2 % del estudiante sin aleatorizar).
- Pruebas de sensores de profundidad simulados: el modelo consume mapas de profundidad de 48 × 64 con recorte a 6 m, útil para validar resoluciones y rangos de cámaras de profundidad de bajo coste antes de integrarlas en un dron real.
- Desarrollo de sistemas de evitación de obstáculos: la política puede integrarse como módulo de bajo nivel en un stack de planificación jerárquica, recibiendo el objetivo de un planificador de alto nivel y generando comandos de control a 50 Hz.
- Benchmarking de simuladores: al evaluarse en niveles de dificultad de 0 a 9 con 60 layouts por nivel y 1000 episodios por celda y semilla, el artefacto sirve para comparar fidelidad entre versiones de Isaac Sim / Isaac Lab.
- Base para transferencia sim-a-real: aunque no ha volado un dron real, es un candidato para experimentos de sim-a-real con un Crazyflie y una cámara de profundidad, dado que la interfaz de observación está documentada con precisión.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Tasa de éxito (%) en mapas no vistos, 60 layouts por nivel, 1000 episodios por celda y semilla, media de 3 semillas ± IC del 95 % (t de Student). "L5 aleatorizado" aplica toda la aleatorización de entrenamiento a la vez y ruido de profundidad × 2. Los dos primeros modelos de la tabla son los declarados en el model-index; el resto provienen de la model card.

| Política | L1 | L3 | L5 | L7 | L9 | L5 aleatorizado |
|---|---:|---:|---:|---:|---:|---:|
| Profesor (privilegiado) | 98,6 ± 2,1 | 97,1 ± 1,0 | 93,4 ± 2,5 | 81,4 ± 5,0 | 58,1 ± 15,5 | 50,8 ± 8,6 |
| Estudiante de profundidad, feed-forward | 95,5 ± 15,0 | 97,6 ± 1,2 | 92,9 ± 6,3 | 88,2 ± 8,1 | 69,5 ± 31,1 | 41,7 ± 28,9 |
| Estudiante de profundidad, GRU | 99,7 ± 0,5 | 98,4 ± 0,7 | 94,5 ± 0,7 | 87,8 ± 4,4 | 70,4 ± 9,7 | 54,2 ± 18,9 |
| Estudiante de profundidad, GRU, aleatorizado | 99,0 ± 2,5 | 97,8 ± 2,4 | 92,9 ± 3,5 | 84,5 ± 4,7 | 61,2 ± 25,5 | 81,9 ± 16,9 |

Los intervalos de confianza amplios reflejan diferencias entre semillas con solo 3 semillas. Las tasas de colisión y los registros de W&B están en `docs/benchmark.md` del repositorio de GitHub.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, por debajo de 1 GB; el estudiante tiene ~0,8 M de parámetros y la entrada es un vector de 18 + 3072 números. No se publican cifras exactas de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente para inferencia; el entrenamiento se realizó en GPUs L40S alquiladas individualmente (unas 130 ejecuciones, ~140 dólares).
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con CUDA (por ejemplo, RTX 3060 o superior); no se requieren modelos de datacenter para inferencia.
- Opciones de despliegue: el artefacto son checkpoints PyTorch (`.pt`) cargados con PyTorch; no se documentan exportaciones a ONNX, TensorRT ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de control).
- Latencia y throughput: control a 50 Hz (periodo de 20 ms) con física a 100 Hz; no se publican cifras de latencia de inferencia por paso ni throughput medido.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no cita alternativas de navegación de cuadricópteros desde profundidad ni establece comparaciones con otras políticas publicadas. Los únicos elementos de comparación internos son las cuatro variantes del propio pipeline (profesor privilegiado, estudiante feed-forward, estudiante GRU y estudiante GRU aleatorizado), cuyos resultados aparecen en la sección de benchmarks.

| Modelo | Parámetros | Contexto | Tasa de éxito L5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| isaac-rl depth student (GRU, aleatorizado) | ~0,8 M | ventana GRU de 48 pasos | 92,9 % nominal / 81,9 % aleatorizado | no disponible | Hugging Face |
| isaac-rl depth student (GRU) | ~0,8 M | ventana GRU de 48 pasos | 94,5 % nominal / 54,2 % aleatorizado | no disponible | Hugging Face |
| isaac-rl teacher (privilegiado) | no disponible | no aplica | 93,4 % nominal / 50,8 % aleatorizado | no disponible | Hugging Face |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en simulación (Isaac Sim / Isaac Lab 2.3.2); ningún checkpoint ha volado un dron real. La transferencia sim-a-real no está demostrada.
- El profesor privilegiado no es desplegable: requiere un anillo lidar de 360° y las posiciones verdaderas de los cuatro obstáculos más cercanos.
- El cabeceo de cámara no se aleatorizó en entrenamiento; un ± 5° adicional sobre el resto de perturbaciones cuesta aproximadamente un punto de tasa de éxito.
- Los resultados con solo 3 semillas presentan intervalos de confianza amplios; las diferencias entre variantes pueden reflejar variabilidad entre semillas más que superioridad real.
- La variante sin aleatorizar cae del 94,5 % al 54,2 % en L5 con aleatorización completa, lo que indica una fragilidad severa ante perturbaciones físicas y de sensores.
- La tasa de éxito en el nivel de dificultad máximo (L9, huecos de 0,6 m y 12 obstáculos por 100 m²) es notablemente inferior (61,2-70,4 % en los estudiantes) y con alta varianza entre semillas.
- La licencia no está declarada, lo que impide determinar las condiciones de uso comercial; debe consultarse con el autor antes de cualquier despliegue.
- No se publican datos sobre sesgos (no aplica en el sentido habitual de modelos de lenguaje), pero sí existe el riesgo de comportamientos no seguros fuera de la distribución de entrenamiento (entornos reales, condiciones meteorológicas no simuladas, sensores con características distintas).
- La entrada de profundidad está limitada a 6 m de alcance y a una resolución de 48 × 64; objetos o huecos fuera de ese rango no son representados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/vedssharma/isaac-rl-drone-nav
- Repositorio de código y notas de entrenamiento: https://github.com/vedssharma/isaac-rl
- Documentación de benchmarks: https://github.com/vedssharma/isaac-rl/blob/main/docs/benchmark.md
- Notas de robustez (fase 4): https://github.com/vedssharma/isaac-rl/blob/main/docs/phase4-robustness.md
- Vídeo, vuelo nominal: media/p5-final-l5-depth-pip.mp4 (referenciado en la model card)
- Vídeo, aleatorización completa: media/p5-final-l5-randomized-depth-pip.mp4 (referenciado en la model card)
- Imagen de ejemplo en mapa L5: media/p5-final-l5.png (referenciada en la model card)
- NVIDIA Isaac Sim: no disponible en la información proporcionada
- NVIDIA Isaac Lab: no disponible en la información proporcionada
