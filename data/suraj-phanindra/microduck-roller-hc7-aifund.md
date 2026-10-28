# suraj-phanindra/microduck-roller-hc7-aifund

## Resumen

`microduck-roller-hc7-aifund` es una política de control robótico, no un modelo de lenguaje: un fine-tune de `rumezhak/microduck-roller-remix-leader` publicado por el usuario suraj-phanindra para el robot bípedo open source Microduck de Pollen Robotics (Hugging Face). La política consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, y está pensada para ejecutarse de forma perpetua (la marcha se mantiene hasta que se le indique lo contrario) sobre la configuración de ruedas ("rollers") del robot.

El modelo se distribuye como un grafo ONNX (`policy.onnx`) con el normalizador de observaciones ya integrado, de modo que la política recibe observaciones en crudo, acompañado de un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de Microduck. La selección del checkpoint se hizo mediante *elitist hill climb* sobre la puntuación de la Arena, según declara el autor en la model card, que no aporta métricas numéricas de rendimiento.

Su relevancia es acotada y muy específica: es un ejemplo de política de locomoción lista para cargar en un *slot* de política del demonio del robot mediante `robotctl`, útil para quien experimenta con transferencia sim-a-real, evaluación comparativa de políticas RL y despliegue de comportamientos sobre hardware de bajo coste. El repositorio no tiene descargas ni *likes*, no declara licencia y la información técnica publicada es mínima.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Se distribuye como política de control en ONNX; la model card no describe la topología de red |
| Parámetros totales | No disponible (no se declara recuento de parámetros) |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica: la política es perpetua y opera en bucle cerrado a 50 Hz con observaciones de 61 dimensiones |
| Tipos de cuantización | No disponible (se publica un grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`, normalizador de observaciones integrado) + `manifest.json` con esquema 2 del manifiesto de políticas de Microduck |

Otros datos declarados: modelo base `rumezhak/microduck-roller-remix-leader` (relación: fine-tune); tarea declarada `robotics`; librería `microduck`; tamaño de repositorio declarado 0,0 GB; 61-D de observación, 14 acciones, 50 Hz; entrenamiento en el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a`.

## Arquitectura y entrenamiento

La model card no detalla la arquitectura de la red ni el número de capas o parámetros. Lo que sí se declara es la interfaz de la política: 61 dimensiones de observación de entrada y 14 dimensiones de acción de salida, ejecutándose a 50 Hz en el Microduck equipado con ruedas. El artefacto entregado es un grafo ONNX autocontenido que incluye el normalizador de observaciones, por lo que el consumidor debe alimentar observaciones sin normalizar; el `manifest.json` adjunto describe la política conforme al esquema 2 documentado en `docs/policy-manifest.md` del repositorio del demonio.

El entrenamiento se realizó en el *framework* `pollen-robotics/microduck_rl` (rama `main`, commit `6ff40704a`). Según la model card, el checkpoint se obtuvo por *elitist hill climb* sobre la puntuación de la Arena, es decir, selección iterativa del mejor candidato evaluado en ese entorno, partiendo del modelo líder `rumezhak/microduck-roller-remix-leader`. No se publican detalles sobre el número de iteraciones, el tamaño del dataset, la composición de la recompensa ni si hubo etapas adicionales de ajuste. La plataforma Microduck se entrena con aprendizaje por refuerzo en MuJoCo según la cobertura de prensa del lanzamiento, aunque la model card de esta política concreta no lo confirma de forma explícita.

## Capacidades

- Locomoción bípeda sobre ruedas: genera una marcha continua para el Microduck en la configuración "roller", a partir de observaciones proprioceptivas de 61 dimensiones.
- Ejecución perpetua: la política no finaliza por sí misma; mantiene el comportamiento hasta que el demonio del robot la detiene o la sustituye en el *slot* de política.
- Control en bucle cerrado a 50 Hz (20 ms por paso de control), adecuado para el lazo de control de bajo nivel del robot.
- Autocontención del preprocesado: el normalizador de observaciones está embebido en `policy.onnx`, lo que elimina errores de integración por normalización duplicada u omitida.
- Carga estandarizada mediante manifiesto: `manifest.json` compatible con el esquema 2, lo que permite el despliegue con `robotctl policy load`.
- No soporta *tool calling*, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: no es un modelo de propósito general.

## Casos de uso

- Despliegue de una marcha lista para usar en un Microduck con ruedas: cargar la política en un *slot* con `sudo robotctl policy load <slot> suraj-phanindra/microduck-roller-hc7-aifund` y dejar que el robot mantenga la locomoción de forma indefinida, sin lógica de terminación en la política.
- Comparación de políticas en la Arena: al haberse seleccionado por *hill climb* elitista sobre la puntuación de la Arena, sirve como referencia de *baseline* frente a nuevas variantes (por ejemplo, `microduck-roller-hc5-aifund`) en experimentos de optimización de marchas.
- Investigación en transferencia sim-a-real: evaluar en hardware físico una política derivada de un modelo líder entrenado en simulación, midiendo degradación de la marcha respecto al entorno de entrenamiento.
- Docencia y divulgación en robótica de bajo coste: la plataforma Microduck (bípedo de 25 cm, 399 USD, open source) permite montar prácticas de RL y despliegue de políticas con un flujo de trabajo reproducible basado en `robotctl`.
- Pruebas de integración de *pipelines* de políticas: validar el esquema 2 de manifiestos y el cargador del demonio con un artefacto ONNX real que incluye normalizador embebido, útil para desarrollo de infraestructura antes de publicar políticas propias.
- *Benchmarking* interno reproducible: fijar esta política como condición de control en experimentos de ajuste fino, dado que su procedencia (commit y rama del *framework*) está documentada y es auditable.
- Demostraciones de robótica open source: emplear la marcha perpetua en vídeos o ferias donde se requiere que el robot camine de forma continua sin supervisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona que el checkpoint se seleccionó mediante *elitist hill climb* sobre la puntuación de la Arena, sin aportar el valor numérico de dicha puntuación, el número de iteraciones, ni comparaciones cuantitativas con el modelo base `rumezhak/microduck-roller-remix-leader`. Tampoco se documentan métricas de seguimiento de trayectoria, estabilidad, consumo energético ni tasas de caída en hardware real.

## Requisitos de hardware

- La inferencia se ejecuta en el propio robot mediante el demonio de Microduck y el cargador de políticas; no se especifican los requisitos de cómputo a bordo (modelo de placa, CPU o acelerador) en la información disponible.
- VRAM estimada: no aplica para el despliegue objetivo; el repositorio declara un tamaño de 0,0 GB, coherente con un artefacto ONNX de pocos recursos, aunque no se publica el recuento de parámetros ni el tamaño exacto del fichero.
- GPU recomendadas: no disponible. No se documenta ningún requisito de GPU para inferencia; para reentrenamiento habría que consultar el repositorio `pollen-robotics/microduck_rl`, que no se detalla en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `robotctl policy load` sobre el demonio de Microduck con el artefacto ONNX; cualquier *runtime* compatible con ONNX podría ejecutar el grafo, pero el autor solo documenta la vía del demonio.
- Latencia: el lazo de control está fijado a 50 Hz, lo que implica un presupuesto de 20 ms por paso de inferencia más el resto del ciclo de control. No se publican medidas de latencia real ni de *throughput*.

## Comparativa con modelos similares

| Modelo | Relación | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `suraj-phanindra/microduck-roller-hc7-aifund` | Este modelo (fine-tune por *hill climb* elitista) | 61-D / 14 acciones | 50 Hz | No disponible | Hugging Face, 0 descargas, 0 *likes* |
| `rumezhak/microduck-roller-remix-leader` | Modelo base del que deriva | 61-D / 14 acciones (configuración roller) | No disponible en la información | No disponible | Hugging Face |
| `suraj-phanindra/microduck-roller-hc5-aifund` | Variante del mismo autor, misma familia de *hill climb* | Configuración roller | No disponible | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas tres políticas; la única diferencia documentada es el procedimiento de selección y el modelo de partida. No se han identificado en la información proporcionada alternativas de otros autores para la misma tarea y plataforma.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de integrarla en un producto.
- Ausencia total de métricas: cero descargas, cero *likes* y ninguna cifra de rendimiento publicada; no hay evidencia independiente de que la marcha funcione correctamente en hardware real.
- Especificidad de hardware: la política está entrenada para la configuración con ruedas ("rollers"); no se garantiza su comportamiento en otras configuraciones del Microduck (por ejemplo, sin ruedas) ni tras modificaciones mecánicas.
- Comportamiento perpetuo: al no tener condición de terminación propia, requiere que el operador o el demonio gestionen la parada; un fallo de supervisión deja al robot ejecutando la marcha indefinidamente.
- Dependencia del preprocesado embebido: alimentar observaciones ya normalizadas o alterar el orden de las 61 dimensiones producirá acciones incorrectas sin aviso explícito.
- Documentación mínima: no se describe la arquitectura, el recuento de parámetros, la composición del dataset de entrenamiento ni los detalles de la recompensa, lo que dificulta la reproducibilidad y el diagnóstico de fallos.
- Riesgo de sobreajuste a la métrica de selección: el *hill climb* elitista sobre la puntuación de la Arena puede favorecer comportamientos que puntúan bien en ese entorno concreto sin transferir igual de bien al robot físico.
- Sin capacidades de lenguaje, visión ni razonamiento: no es apta para ninguna tarea de NLP; su uso está circunscrito al control de locomoción.
- Fecha de creación del repositorio en 2026 y metadatos mínimos: no hay histórico de versiones ni notas de mantenimiento que permitan evaluar su vigencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suraj-phanindra/microduck-roller-hc7-aifund
- Modelo base: https://huggingface.co/rumezhak/microduck-roller-remix-leader
- Variante hermana (hc5): https://huggingface.co/suraj-phanindra/microduck-roller-hc5-aifund
- Perfil del autor: https://huggingface.co/suraj-phanindra
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento citado en la model card: `pollen-robotics/microduck_rl` (rama `main`, commit `6ff40704a`)
- Artículo de MarkTechPost sobre el lanzamiento: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Artículo de The AI Insider: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
