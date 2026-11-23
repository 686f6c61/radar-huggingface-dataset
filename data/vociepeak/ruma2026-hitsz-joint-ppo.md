# Vociepeak/ruma2026-hitsz-joint-ppo

## Resumen

RUMA 2026 HITSZ Joint PPO es un checkpoint de política entrenada con aprendizaje por refuerzo (PPO) para el control de velocidad en los tres ejes de un vehículo dentro del simulador HITSZ, en el contexto de la competición RUMA 2026. Lo desarrolla el usuario Vociepeak y se publica como un artefacto de investigación reproducible, no como un modelo de lenguaje: el repositorio contiene pesos de política en PyTorch, no un transformer generativo.

La política consume observaciones de profundidad y estado del simulador HITSZ, junto con la posición relativa y la normal del siguiente obstáculo (puerta), y utiliza predicciones de ocupación del vehículo a 0,5 s y 1,0 s para modular la salida de velocidad. Durante el entrenamiento la supervisión de ocupación la aporta el simulador; en inferencia se usan los valores predichos por el modelo, lo que introduce una dependencia explícita de la calidad de esa predicción.

El interés actual del checkpoint es su trazabilidad: incluye dos artefactos completos (modelo, optimizador, tasa de aprendizaje, progreso de currículo y estado del generador aleatorio), sumas SHA256 para verificación y un procedimiento documentado de reanudación entre dispositivos. El tamaño del repositorio es de 0,1 GB y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) sobre observaciones de profundidad y estado; arquitectura de red no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana de observación no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en punto flotante PyTorch, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch); incluye `SHA256SUMS` para verificación |

## Arquitectura y entrenamiento

El modelo es una política entrenada con Proximal Policy Optimization (PPO) para control de velocidad en tres ejes. La entrada combina observaciones de profundidad y estado de HITSZ, la posición relativa y la normal de la siguiente puerta, y predicciones de ocupación del vehículo a 0,5 s y 1,0 s. La salida es una consigna de velocidad ajustada. La arquitectura interna de la red (número de capas, dimensiones, tipo de codificador de profundidad) no se detalla en la información disponible.

Se publican dos checkpoints completos. El primero, `joint-4090-u1338.pt`, se entrenó en una RTX 4090 con 4.096 entornos paralelos, 1.338 actualizaciones acumuladas y 109.608.960 pasos de entorno. El segundo, `joint-3060-u1738.pt`, se entrenó en una RTX 3060 con 768 entornos paralelos, 1.738 actualizaciones y 115.752.960 pasos; según la model card, parte del checkpoint de 4090 y añade 400 actualizaciones con 6.144.000 pasos muestreados. La semilla de entrenamiento es 20261121 y cada entorno muestrea 20 pasos por actualización. Ambos checkpoints incluyen modelo, optimizador, tasa de aprendizaje, progreso de currículo y estado del generador aleatorio, lo que permite reanudación exacta. La versión upstream de HITSZ referenciada es el commit `9ac9657334817ad0bac6db3520bca59e5f864bf3`.

## Capacidades

- Control de velocidad en tres ejes para un vehículo simulado en HITSZ.
- Procesamiento de observaciones de profundidad y de estado del simulador.
- Uso de la geometría de la siguiente puerta (posición relativa y normal) como entrada de la política.
- Predicción de ocupación del vehículo a 0,5 s y 1,0 s para modular la consigna de velocidad.
- Reanudación de entrenamiento desde checkpoint con restauración de optimizador, tasa de aprendizaje, currículo y estado aleatorio.
- Evaluación nativa mediante el flag `--native-ppo` y reanudación mediante `--resume-from`.
- No soporta tool calling, function calling, agentes lingüísticos, visión general, audio ni generación de texto: es una política de control, no un modelo de lenguaje.

## Casos de uso

- Evaluación comparativa de políticas en HITSZ: cargar `joint-4090-u1338.pt` con `--native-ppo` y medir tasa de éxito en tres puertas, colisiones en vuelo e intersección con el plano de la puerta frente a las variantes `hitsz` y `gate`, tal como propone la model card.
- Reproducción de experimentos de RL: la inclusión de semilla (20261121), estado del optimizador y estado aleatorio permite repetir exactamente el entrenamiento y auditar la curva de aprendizaje.
- Reanudación entre dispositivos: el checkpoint de 4090 se puede continuar en una RTX 3060, como demuestra el artefacto `joint-3060-u1738.pt`, útil para laboratorios con hardware heterogéneo.
- Estudio de currículo de entrenamiento: el progreso de currículo se guarda en el checkpoint, lo que facilita analizar cómo la política adquiere el control de velocidad por fases.
- Investigación sobre predicción de ocupación: al usar predicciones en inferencia y supervisión del simulador en entrenamiento, el checkpoint sirve para estudiar el desajuste entre ambas distribuciones.
- Docencia y prototipado en robótica aérea simulada: el tamaño reducido del repositorio (0,1 GB) y el script de entrenamiento documentado permiten montar un entorno de prácticas de PPO en pocas horas.
- Base para transferencia a otros simuladores: la interfaz de observación (profundidad, estado, geometría de puerta) es reutilizable si se adapta el entorno, aunque no hay evidencia publicada de transferencia real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las métricas de éxito en tres puertas, colisiones en vuelo e intersección con el plano de la puerta quedan pendientes de evaluar en un mismo lote de escenarios comparando los grupos `hitsz`, `gate` y `joint`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB y contiene dos checkpoints completos con estado del optimizador, por lo que los pesos de política son sustancialmente menores.
- GPU de entrenamiento documentadas: RTX 4090 (4.096 entornos paralelos) y RTX 3060 (768 entornos paralelos).
- Cabe en GPU de consumo: sí, al menos en RTX 4090 y RTX 3060 según la evidencia de entrenamiento publicada; no se especifica el mínimo para inferencia.
- Opciones de despliegue: inferencia mediante el propio código de HITSZ con `--native-ppo`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entornos paralelos | Pasos de entorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RUMA 2026 HITSZ Joint PPO (`joint-4090-u1338`) | Política PPO para control de velocidad | 4.096 | 109.608.960 | no disponible | Hugging Face |
| RUMA 2026 HITSZ Joint PPO (`joint-3060-u1738`) | Política PPO para control de velocidad | 768 | 115.752.960 | no disponible | Hugging Face |
| Variantes `hitsz` y `gate` | Políticas de referencia del mismo entorno | no disponible | no disponible | no disponible | Referenciadas en la model card, sin enlace directo |

No se dispone de información sobre modelos comparables de otros autores para esta tarea concreta.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no admite prompts conversacionales.
- La licencia no está declarada, por lo que el uso comercial queda sin autorización explícita y requiere contactar con el autor.
- Los idiomas soportados no están declarados; la documentación está en chino y la aplicabilidad lingüística no es relevante para la tarea.
- Dependencia del simulador: la política está acoplada a la versión upstream `9ac9657334817ad0bac6db3520bca59e5f864bf3` de HITSZ; cambios en observaciones o dinámica pueden invalidar el comportamiento.
- Desajuste train/inferencia en la ocupación: el entrenamiento usa supervisión del simulador y la inferencia usa predicciones del modelo, lo que puede degradar el rendimiento si el predictor se desvía.
- Ausencia de métricas publicadas: no hay evidencia cuantitativa de éxito, colisiones o precisión de paso por puerta, por lo que no se puede recomendar para producción sin evaluación propia.
- Riesgo de sobreajuste al currículo: el progreso de currículo se guarda y se restaura, pero no se documenta su composición ni el rango de escenarios cubiertos.
- Reproducibilidad dependiente del hardware: los dos checkpoints se generaron en GPUs distintas y con distinto número de entornos paralelos, lo que puede introducir diferencias no triviales en la dinámica de entrenamiento.
- Sin garantías de seguridad física: cualquier transferencia a un vehículo real requeriría validación adicional y protocolos de parada de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vociepeak/ruma2026-hitsz-joint-ppo
- Instrucciones de entrenamiento PPO (GitHub): https://github.com/voicepeak/ruma2026-PPO/blob/846797d38dfb1a261c870e96715781438be1526b/PPO%E8%AE%AD%E7%BB%83%E8%AF%B4%E6%98%8E.md
- Repositorio RUMA 2026 PPO: https://github.com/voicepeak/ruma2026-PPO
- Commit upstream de HITSZ referenciado: `9ac9657334817ad0bac6db3520bca59e5f864bf3` (sin URL directa en la información disponible)
