# thelamapi/Next-Drive

## Resumen

Next Drive es un pequeño conductor aprendido para una intersección urbana **simulada**. Desarrollado por thelamapi (etiqueta `next-lab`), el modelo decide cada 0,1 s una de seis acciones longitudinales (frenada fuerte, frenada, soltar acelerador, mantener velocidad, acelerar, acelerar fuerte) mientras sigue una ruta recta, a la izquierda o a la derecha a través de un semáforo, un paso de peatones, un coche líder que frena de repente, tráfico en sentido contrario y transversal, y coches aparcados que ocultan a un peatón.

Se trata de un MLP muy compacto (21→64→64→6) entrenado por imitación de un experto basado en reglas, primero con behaviour cloning sobre 300 conducciones del experto (59 750 estados) y después con tres rondas de DAgger. El repositorio incluye los pesos en `policy.safetensors` (PyTorch) y una réplica de los mismos pesos en `model.json` para NumPy y para el navegador, donde un port en JavaScript reproduce la inferencia línea a línea.

El modelo es relevante como banco de pruebas reproducible de conducción autónoma en simulación: publica métricas sobre 450 escenas de test no vistas por conductor, lista las 138 fallas de los conductores aprendidos en `evaluation.json` y permite reproducirlas en un Space. No tiene relación ni validación sobre vehículos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) 21→64→64→6 sobre características hechas a mano |
| Parametros totales | no disponible (arquitectura de 21 entradas, dos capas ocultas de 64 y 6 salidas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada de 21 características por paso de 0,1 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y en JSON, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `policy.safetensors` (PyTorch) y `model.json` (NumPy y navegador) |

## Arquitectura y entrenamiento

El conductor aprendido es un perceptrón multicapa de tres capas (21→64→64→6) que recibe características construidas manualmente: velocidad, estado del semáforo, distancia a la línea de parada, hueco con el coche líder, tiempo hasta colisión bajo tres aceleraciones distintas, distancias a peatones visibles y a huecos ocluidos, y la ruta planificada. La salida es una de seis acciones longitudinales discretas, elegida cada 0,1 s. El simulador modela carreteras de un carril, señales norte-sur/este-oeste con amarillo y todo-rojo, tráfico tipo IDM, peatones y oclusión por línea de visión debida a coches aparcados; el vehículo ego percibe siempre los coches y los peatones solo cuando están visibles a menos de 60 m.

El entrenamiento combina behaviour cloning sobre 300 conducciones del experto (59 750 estados) con tres rondas de DAgger; la iteración 2 se seleccionó sobre semillas de validación. El experto evalúa secuencias de acción bifásicas 6×6 (1 s + 2 s) a resolución de 0,25 s con predicciones a velocidad constante, el calendario conocido del semáforo, un hueco de seguimiento de 2 m + 1,2 s y un límite de velocidad que permite detenerse antes de huecos ocluidos. Además, se aplica una comprobación de seguridad que mantiene una acción solo si frenar a −6 m/s² tras 0,5 s sigue evitando toda colisión y entrada en rojo predichas; en caso contrario, elige la deceleración segura más fuerte. El port de JavaScript en el navegador se validó contra Node con 8 conducciones completas y 0 discrepancias.

## Capacidades

- Conducción longitudinal simulada en rutas rectas, a la izquierda y a la derecha por una intersección urbana.
- Selección de acción cada 0,1 s entre seis niveles de aceleración/frenada.
- Percepción de coches siempre y de peatones solo cuando son visibles a menos de 60 m, con oclusión por coches aparcados.
- Gestión de semáforos con amarillo y todo-rojo, línea de parada y paso de peatones.
- Seguimiento de un coche líder que frena de repente, con hueco de seguimiento de 2 m + 1,2 s en el experto.
- Interacción con tráfico en sentido contrario y transversal, y con coches aparcados.
- Comprobación de seguridad opcional (variante "shield") que filtra acciones arriesgadas.
- Inferencia en navegador mediante port JavaScript con paridad verificada frente a la implementación de referencia.
- No dispone de tool calling, agentes, capacidades multilingües ni visión genérica; la entrada es un vector de 21 características, no imágenes ni texto.

## Casos de uso

- Investigación en imitation learning: usar el par behaviour cloning + DAgger como referencia reproducible para comparar variantes de aprendizaje por imitación en un entorno controlado, con semillas y escenas de test fijas.
- Evaluación de políticas con shield de seguridad: medir el impacto de una comprobación de seguridad post-hoc sobre colisiones, violaciones de semáforo en rojo y tiempo hasta meta, comparando "Learned" frente a "Learned + safety check".
- Docencia en conducción autónoma: el Space permite elegir escena, densidad y conductor, generar la conducción en el navegador y reproducirla junto a sus eventos críticos, lo que facilita explicar conceptos como hueco de seguimiento, oclusión y time-to-collision.
- Análisis de fallos: las 138 fallas de los conductores aprendidos están listadas en `evaluation.json` y pueden reproducirse en el Space, lo que permite estudiar patrones de error por tipo de escena (luz, paso de peatones, frenada del líder, oclusión, mixta).
- Estudio de robustez ante densidad no vista: la densidad 3 nunca apareció en entrenamiento y se usa como test de generalización; útil para analizar degradación de la política al aumentar el tráfico.
- Integración en pipelines de simulación propios: los pesos en `model.json` permiten reutilizar la política en NumPy o en JavaScript sin depender de PyTorch, por ejemplo para prototipar entornos web o scripts de evaluación ligeros.
- Comparación de baselines: enfrentar la política aprendida con el baseline basado en reglas (IDM más reglas de línea de parada, peatón visible y cesión en giro a la izquierda) para cuantificar la brecha entre ambos enfoques.

## Benchmarks y rendimiento

Resultados sobre 450 escenas de test no vistas por conductor (semillas ≥ 10000; densidad 3 nunca vista en entrenamiento):

| Driver | Colisiones | Violaciones de semáforo en rojo | Meta alcanzada | Frenadas fuertes / conducción | Tiempo hasta meta (s) | Decisión ms (media / p95) |
|---|---:|---:|---:|---:|---:|---:|
| Learned + safety check | 4,4% | 0,4% | 89,1% | 1,67 | 21,0 | 0,34 / 0,47 |
| Learned | 4,4% | 10,0% | 89,8% | 0,95 | 19,3 | 0,28 / 0,40 |
| Rule-based | 27,1% | 0,0% | 71,1% | 0,95 | 23,3 | 0,02 / 0,07 |
| Expert (teacher) | 2,7% | 1,3% | 93,6% | 1,01 | 19,2 | 1,61 / 2,38 |

Tasa de colisión / meta alcanzada por tipo de escena:

| Escena | Learned + safety | Learned | Rule-based | Expert |
|---|---:|---:|---:|---:|
| light | 4% / 96% | 2% / 98% | 1% / 99% | 1% / 99% |
| crosswalk | 7% / 93% | 1% / 99% | 9% / 86% | 0% / 100% |
| lead_brake | 8% / 92% | 1% / 99% | 3% / 97% | 2% / 98% |
| occlusion | 2% / 79% | 10% / 73% | 68% / 32% | 7% / 82% |
| mixed | 1% / 86% | 8% / 80% | 54% / 42% | 3% / 89% |

Tasa de colisión por densidad de tráfico:

| Densidad | Learned + safety | Learned | Rule-based | Expert |
|---|---:|---:|---:|---:|
| 1 | 1% | 2% | 23% | 0% |
| 2 | 5% | 3% | 23% | 3% |
| 3 (no vista) | 7% | 8% | 35% | 5% |

Las tasas cuentan conducciones con al menos un evento. La latencia de decisión se midió en Python sobre NVIDIA L4, proceso único; el Space reporta su propio tiempo de navegador.

## Requisitos de hardware

- VRAM estimada para inferencia: insignificante; el modelo es un MLP de 21→64→64→6 y los pesos caben holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no hay requisito relevante; los benchmarks de latencia se midieron en NVIDIA L4, pero cualquier GPU o CPU moderna sirve.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3090, GTX 1660, etc.) y en CPU.
- Opciones de despliegue: PyTorch con `inference.py` (incluye `--selftest`), NumPy a partir de `model.json` y JavaScript en navegador mediante el port incluido en el Space.
- Latencia y throughput: decisión media de 0,28 ms y p95 de 0,40 ms para el conductor aprendido (0,34 / 0,47 ms con safety check) en Python sobre NVIDIA L4, proceso único; el baseline basado en reglas tarda 0,02 / 0,07 ms y el experto 1,61 / 2,38 ms.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Next Drive (aprendido + safety) | MLP por imitation learning + DAgger | no disponible (MLP 21→64→64→6) | no aplica | 4,4% colisiones, 0,4% rojos, 89,1% meta | Apache 2.0 | Hugging Face + Space |
| Next Drive (experto docente) | Experto basado en reglas con búsqueda 6×6 | no disponible | no aplica | 2,7% colisiones, 1,3% rojos, 93,6% meta | Apache 2.0 | Incluido en el repo |
| Baseline basado en reglas (IDM) | Reglas IDM + línea de parada, peatón y cesión | no disponible | no aplica | 27,1% colisiones, 0,0% rojos, 71,1% meta | Apache 2.0 | Incluido en el repo |

No se dispone de información sobre otros modelos comparables de conducción autónoma en simulación dentro de la información proporcionada.

## Limitaciones y advertencias

- Solo simulación y educación: no está conectado ni se ha probado en un vehículo real, y nada en el repositorio respalda afirmaciones sobre seguridad en carretera real.
- Control únicamente longitudinal sobre rutas fijas; no hay cambios de carril, errores de dirección ni ruido de sensores más allá de la oclusión.
- Los demás usuarios de la vía siguen comportamiento scriptado simple y nunca reaccionan al vehículo ego.
- El experto también es imperfecto (2,7% de colisiones, 1,3% de violaciones de rojo en test) y el conductor aprendido copia sus hábitos, incluida la frenada fuerte frecuente en semáforos amarillos.
- El conductor aprendido sin safety check viola el semáforo en rojo en 10,0% de las conducciones, frente al 0,4% con safety check; el filtro de seguridad es necesario para uso serio.
- Degradación en escenas de oclusión: 10% de colisiones para el conductor aprendido sin shield (2% con shield) y 68% para el baseline basado en reglas.
- Degradación con densidad no vista: 8% de colisiones a densidad 3 para el conductor aprendido, frente al 5% del experto.
- La licencia Apache 2.0 permite uso comercial, pero las métricas y el propio modelo solo tienen validez dentro de este simulador.
- No hay información publicada sobre sesgos, idiomas ni rendimiento fuera del entorno simulado descrito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thelamapi/Next-Drive
- Space de demostración: https://huggingface.co/spaces/thelamapi/Next-Drive
- Vídeo de replay: `replay.mp4` (incluido en el repositorio)
- Registro de fallos: `evaluation.json` (incluido en el repositorio)
- Pesos PyTorch: `policy.safetensors` (incluido en el repositorio)
- Pesos para NumPy y navegador: `model.json` (incluido en el repositorio)
- Script de inferencia: `inference.py` (incluido en el repositorio)
