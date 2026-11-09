# udbbdh/ardy-r4-uni-mlp-tracking-best

## Resumen

ARDY r4_uni_mlp_tracking es una política de seguimiento de movimiento (motion tracking) para un robot humanoide, entrenada mediante aprendizaje por refuerzo basado en modelo (model-based RL) dentro del simulador Isaac Gym (PhysX). No es un modelo de lenguaje: es un artefacto de investigación en robótica que contiene los pesos de tres redes MLP coordinadas por un algoritmo de RL basado en modelo, empaquetadas en un único checkpoint de entrenamiento.

El modelo lo publica el usuario udbbdh como el mejor checkpoint de una ejecución de "ARDY", un proyecto de investigación sobre control de humanoides cuyos nombres de módulo (`r4_uni_mlp_tracking_20261030`) y estructura de directorios (`projects/official_baselines`) indican un framework interno no publicado. El checkpoint corresponde a 162.500 actualizaciones del actor (iteración 163.000) de un entrenamiento desde cero con 128 entornos paralelos.

La relevancia práctica es acotada: sus 84,1 % de éxito en un panel fijo de 134 episodios lo convierten en una referencia de rendimiento para políticas de seguimiento en un conjunto de familias de movimiento (salto, escalada, escaleras, vaulting, etc.), pero el código de evaluación no forma parte del repositorio y no se declara licencia de uso. Es útil como objeto de estudio y comparación de RL basado en modelo, no como componente desplegable sin más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes MLP (model-based RL); mundo, actor y crítico separados |
| Parametros totales | 5,05 M (mundo 2,37 M + actor 2,35 M + crítico 0,33 M) |
| Parametros activos | No es MoE; no aplica |
| Longitud de contexto | No aplica (política de control continuo; horizonte de imaginación de 32 pasos) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica |
| Licencia | No disponible |
| Formato de pesos | Checkpoint PyTorch `training.pt` (tensores, dicts y arrays numpy) |

## Arquitectura y entrenamiento

El sistema es un algoritmo de RL basado en modelo con un world model de 2,37 M de parámetros, un actor de 2,35 M con media móvil exponencial (decay 0,995) como política de evaluación, y un crítico de 0,33 M. El actor crudo se guarda aparte como `pi_live`. El entrenamiento se ejecuta en Isaac Gym (PhysX) con 128 entornos paralelos, `torch.compile` y autocast en bf16, tasa de aprendizaje 4e-4 con decaimiento coseno durante 250k iteraciones, UTD 0,4, horizonte de imaginación de 32 pasos y batch de política de 4096.

Entre las innovaciones destacables están las medidas de estabilidad específicas del proyecto "AllMimic": `value_clip`, `collect_det_frac=0.25` (fracción de recolección determinista) y `critic_survival_weighted`. El checkpoint entregado corresponde a la iteración 163.000 (162.500 actualizaciones del actor). Se desconoce la composición exacta del dataset de demostraciones y el número de tokens o pasos totales de entrenamiento; los únicos datos publicados son los de la evaluación sobre 134 episodios nativos.

## Capacidades

- Seguimiento de movimiento de un humanoide en simulación: reproduce trayectorias de referencia de distintas familias de movimientos.
- Ejecución de habilidades locomotoras: correr, subir escaleras, saltar, escalar, saltar obstáculos (vaulting), plataformas y boxes.
- Control continuo entrenado con RL basado en modelo, con un world model que predice la dinámica para la imaginación.
- Evaluación reproducible sobre un panel fijo de 134 episodios con salidas JSON.
- No dispone de tool calling, razonamiento multi-paso simbólico, capacidades multilingües ni visión; su dominio es exclusivamente el control motor en simulación.

## Casos de uso

- Estudio de RL basado en modelo: analizar la interacción entre world model, actor y crítico y el efecto de las medidas de estabilidad AllMimic en la curva de entrenamiento; el checkpoint incluye estados de optimizador y configuración para inspección.
- Referencia de rendimiento en motion tracking: usar el 84,14 % de éxito y el desglose por familia como línea base al comparar nuevas políticas en el mismo panel de 134 episodios.
- Investigación en control de humanoides simulados: reproducir el experimento en Isaac Gym con 128 entornos paralelos y contrastar el resultado de esta iteración (163.000) frente a la anterior (76.901, 76,87 %).
- Diagnóstico de familias difíciles: la familia "motion" alcanza solo 3 de 16 episodios, lo que permite focalizar el análisis de fallos en esa categoría frente a las resueltas al 100 % (platform, stairs).
- Reentrenamiento y ajuste fino: `training.pt` contiene pesos, estados de optimizador (`opt_wm`, `opt_pi`, `opt_v`), configuración y estados de RNG de entornos, lo que permite reanudar el entrenamiento (sin el replay buffer, que no se incluye).
- Validación de infraestructura de evaluación: emplear los scripts `eval_worker` y las salidas `eval/reeval_r1..r4.json` y `episodes_r2.json` para verificar pipelines de evaluación con caché por `COMPLETE.json`.

## Benchmarks y rendimiento

Resultados publicados por el autor en el panel fijo de 134 episodios (media de 4 evaluaciones):

| Checkpoint | Éxito | Fallo | Ninguno | Retorno normalizado |
|---|---|---|---|---|
| Este checkpoint (iteración 163.000) | 84,14 % (83,58 / 84,33 / 84,33 / 84,33) | 13,43 % | 2,43 % | 0,8875 |
| Mejor anterior (iteración 076901) | 76,87 % | 17,91 % | 5,22 % | 0,8612 |

Éxitos por familia de movimiento (16 episodios por familia salvo jumping, con 6):

| Familia | Episodios | Este checkpoint | Mejor anterior |
|---|---|---|---|
| boxes | 16 | 12 | 12 |
| climbing | 16 | 13 | 10 |
| jumping | 6 | 6 | 5 |
| motion | 16 | 3 | 1 |
| platform | 16 | 16 | 16 |
| running | 16 | 16 | 13 |
| stairs | 16 | 16 | 16 |
| teaser | 16 | 15 | 16 |
| vaulting | 16 | 16 | 14 |

Los cuatro resultados individuales difieren como máximo en un episodio. No hay benchmarks frente a modelos externos ni métricas estándar de robótica (por ejemplo, error de seguimiento MPJPE) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 5,05 M de parámetros en fp32 el peso ocupa aproximadamente 20 MB, pero la inferencia depende del entorno simulado (Isaac Gym/PhysX), no solo de la red.
- GPU recomendadas: no disponible. El entrenamiento usó 128 entornos paralelos en Isaac Gym y bf16, lo que habitualmente requiere GPU de gama alta con soporte CUDA; el autor no especifica modelo.
- ¿Cabe en GPU de consumo? El checkpoint (0,1 GB de repositorio) cabe en cualquier tarjeta con unos pocos cientos de MB libres; los requisitos reales vienen del simulador, no de la política.
- Opciones de despliegue: exclusivamente vía el árbol del proyecto ARDY (`python -m r4_uni_mlp_tracking_20261030.eval_worker`), que no está incluido en el repositorio. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, ni aplica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La model card no referencia políticas de motion tracking comparables de otros autores ni ofrece resultados frente a alternativas; la única comparación publicada es interna, contra la iteración 076901 del mismo proyecto.

## Limitaciones y advertencias

- No se declara licencia: no hay autorización explícita para uso comercial ni para redistribución; hay que contactar con el autor ante cualquier uso más allá del estudio.
- El código de evaluación y el proyecto ARDY no forman parte del repositorio; sin él el checkpoint no es utilizable tal cual.
- No se incluye el replay buffer, por lo que reanudar el entrenamiento de forma idéntica no es posible.
- Carga con `torch.load(..., weights_only=False)` por el estado de RNG de numpy: riesgo de seguridad si el fichero no es de confianza.
- El rendimiento es solo en simulación (Isaac Gym/PhysX); no hay evidencia de transferencia a un robot físico (sim-to-real).
- Desequilibrio fuerte entre familias: "motion" logra 3/16 y "boxes" 12/16, frente al 100 % en platform, stairs y running; el 84,14 % global oculta un rendimiento muy desigual.
- El panel es fijo y pequeño (134 episodios) y la variación entre las 4 evaluaciones es de un episodio; la incertidumbre estadística del porcentaje es considerable.
- No se documentan sesgos (no aplica en el sentido de sesgos sociales) ni riesgo de alucinación (no es un modelo generativo de texto); el riesgo equivalente es la divergencia entre la trayectoria planificada y la ejecutada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udbbdh/ardy-r4-uni-mlp-tracking-best
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo o al proyecto ARDY.
