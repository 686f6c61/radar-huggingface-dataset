# TUpreneur/connectailab-rl-tupreneur-v2-link01-walk-ppo

## Resumen

`connectailab-rl-tupreneur-v2-link01-walk-ppo` es una política de control entrenada con aprendizaje por refuerzo (PPO) para el robot bípedo LINK-01 en el entorno de simulación `Link01Walk-v0`, construido sobre MuJoCo y la librería `link01-gym`. Lo desarrolla TUpreneur en el marco de una colaboración con CONNECT AI LAB, dentro de un programa formativo de RL (AI CITY BUILDERS, séptima sesión). No es un modelo de lenguaje: es un controlador neuronal que mapea observaciones de 51 dimensiones a 14 acciones articulares continuas para producir una marcha.

El modelo se entrenó desde cero con PPO durante 500 000 pasos en 16 entornos paralelos, con un coste declarado de 4,19 minutos de cómputo. La recompensa final alcanzada fue de 2503,4 con una tasa de finalización del 98 %. El resultado es una política que no cae (0 caídas por minuto) pero que avanza muy despacio: 0,221 m por episodio de 20 s, es decir, 0,0111 m/s de velocidad media, frente a la consigna de 0,18 m/s.

Su relevancia es acotada y experimental: sirve como referencia reproducible de un pipeline PPO completo (entrenamiento, normalización de observaciones y exportación de actor) para robótica de locomoción en MuJoCo, no como componente listo para producción. Los artefactos publicados son `model.pt`, `obs_rms.pt` y `actor.json`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal (actor) entrenada con PPO; arquitectura interna de capas no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de RL, no de lenguaje) |
| Tipos de cuantización | no disponible (pesos en PyTorch, `model.pt`) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch), `obs_rms.pt` (estadísticas de normalización), `actor.json` |
| Entorno | `Link01Walk-v0` (link01-gym, MuJoCo) |
| Observaciones / acciones | 51 / 14 (14 articulaciones, postura base ±0,18 rad) |
| Algoritmo | PPO (lr 0,0003, clip 0,2, gamma 0,99, GAE lambda 0,95) |
| Pasos de entrenamiento | 500 000 en 16 entornos paralelos |

## Arquitectura y entrenamiento

Se trata de un agente de RL con aprendizaje *on-policy* mediante Proximal Policy Optimization. El entrenamiento se realizó desde cero (sin inicialización a partir de demostraciones) sobre el entorno `Link01Walk-v0`, con 16 entornos ejecutándose en paralelo, tasa de aprendizaje 0,0003, recorte de política 0,2, factor de descuento 0,99 y lambda de GAE 0,95. El proceso completo consumió 500 000 pasos y 4,19 minutos de cómputo declarado.

El espacio de observación tiene 51 dimensiones y el de acción 14 dimensiones continuas correspondientes a las articulaciones del bípedo, con una postura base de ±0,18 rad. El paquete incluye `obs_rms.pt`, que contiene las medias y varianzas para normalizar las observaciones en inferencia; omitirlo altera el comportamiento de la política. No se especifica en la información disponible la topología de la red (número de capas, unidades ocultas ni funciones de activación), ni detalles sobre reward shaping más allá de la recompensa final agregada.

## Capacidades

- Locomoción bípeda simulada: genera comandos articulares continuos para mantener el equilibrio y avanzar en `Link01Walk-v0`.
- Estabilidad: 0 caídas por minuto en la batería de evaluación declarada (5 episodios de 20 s).
- Seguimiento parcial de consigna de velocidad: alcanza 0,0111 m/s frente a los 0,18 m/s solicitados.
- Control continuo multiarticular: 14 acciones coordinadas a partir de 51 observaciones.
- Reproducibilidad del pipeline: incluye normalizador de observaciones y exportación del actor a JSON.
- No soporta tool calling, agentes, multilingüismo, visión ni audio: es exclusivamente una política de control motor.

## Casos de uso

- Docencia y formación en RL: reproducción completa de un pipeline PPO (entrenamiento, normalización, exportación) en menos de 5 minutos de cómputo, adecuado para prácticas guiadas en cursos de aprendizaje por refuerzo.
- Baseline de locomoción bípeda: punto de partida para comparar variantes de PPO, reward shaping o arquitecturas de política en el mismo entorno `Link01Walk-v0`.
- Depuración de entornos MuJoCo: al ser un agente estable y sin caídas, sirve para validar que la física, los espacios de observación y acción y las recompensas del entorno están correctamente configurados.
- Integración en simuladores de robótica: el `actor.json` permite cargar la política en un runtime distinto de PyTorch para pruebas de despliegue en simulación.
- Investigación en sim-to-real (exploratoria): como política de referencia para estudiar transferencia, aunque su baja velocidad y la ausencia de datos de robustez la hacen insuficiente para hardware real.
- Evaluación de técnicas de normalización de observaciones: el par `obs_rms.pt` + `model.pt` permite medir el impacto de la normalización en el rendimiento final.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`). Evaluación sobre `Link01Walk-v0` con consigna de 0,18 m/s, 5 episodios de 20 s.

| Métrica | Valor |
|---|---|
| Distancia por episodio de 20 s | 0,221 m |
| Velocidad media de avance | 0,0111 m/s |
| Caídas por minuto | 0,0 |
| Recompensa final de entrenamiento | 2503,4 |
| Tasa de finalización final | 98,0 % |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB y la política es de pequeña escala, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con soporte CUDA y PyTorch es suficiente. Para el entrenamiento, 16 entornos MuJoCo en paralelo se benefician de CPU con varios núcleos más que de GPU dedicada.
- GPU consumer: sí, cabe en cualquier RTX o incluso en CPU para inferencia.
- Opciones de despliegue: PyTorch con `model.pt` + `obs_rms.pt`; `actor.json` para runtimes ligeros; MuJoCo y `link01-gym` para la simulación del entorno.
- Latencia y throughput: no disponibles. El entrenamiento declarado de 500 000 pasos en 4,19 minutos sugiere un throughput de aproximadamente 2000 pasos/s en el hardware usado, que no se especifica.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de locomoción bípeda comparables ni datos de referencia de la literatura para el entorno `Link01Walk-v0`.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-tupreneur-v2-link01-walk-ppo | no disponible | no aplica | 0,0111 m/s, 0 caídas/min | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy por debajo de la consigna: 0,0111 m/s frente a 0,18 m/s solicitados (aproximadamente un 6 % del objetivo). La política es estable pero funcionalmente limitada como marcha.
- Métricas no verificadas: los resultados de la model card están marcados como `verified: false` y provienen únicamente del autor.
- Evaluación reducida: solo 5 episodios de 20 s; no hay datos de robustez ante perturbaciones, terreno variable ni cambios de masa.
- Sin licencia declarada: no se especifican términos de uso comercial; debe tratarse como no apto para producción hasta que el autor aclare la licencia.
- Acoplamiento al entorno: depende de `Link01Walk-v0` y de la normalización en `obs_rms.pt`; usarla fuera de ese entorno o sin el normalizador invalida los resultados.
- Sin validación sim-to-real: no hay evidencia de transferencia a hardware físico.
- Documentación incompleta: no se detalla la arquitectura de red, el dataset de entrenamiento (no aplica, es RL) ni los hiperparámetros completos más allá de los listados.
- Sesgos y alucinación: no aplica en el sentido de modelos generativos; el riesgo equivalente es el sobreajuste al entorno de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v2-link01-walk-ppo
- Repositorio de archivos: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v2-link01/tree/main
- Modelo relacionado (v2 base): https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v2-link01
