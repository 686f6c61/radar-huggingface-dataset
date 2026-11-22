# Superstar111/pi05-yam-sharpa-spoon-scoop-astra-block-1cmd-wristrand

## Resumen

Este repositorio contiene un checkpoint de política vision-language-action (VLA) basado en π0.5, entrenado con openpi para una tarea robótica concreta: coger una cuchara y recoger judías de un cuenco sobre una mesa. Es una variante de `Superstar111/pi05-yam-sharpa-spoon-scoop-astra-block-1cmd` que introduce una única modificación: en 239 de los 300 episodios de entrenamiento se aleatorizó el fondo de la cámara de muñeca, sustituyendo el color oscuro uniforme por una habitación sintética con paredes, suelo, techo, paneles de luz y objetos estáticos fuera del área de trabajo.

El modelo se ha entrenado exclusivamente en simulación (Isaac Lab) y no se ha ejecutado en el robot real. El objetivo declarado del autor es medir si la aleatorización del fondo de la muñeca mejora la robustez de la política frente a fondos no vistos. El resultado en simulación es negativo: el modelo rinde de forma equivalente a la variante sin aleatorización, y tampoco es más robusto ante fondos de evaluación fuera de la distribución de entrenamiento.

Se trata de un artefacto de investigación muy específico, no de un modelo de propósito general: la política recibe una única instrucción fija ("pick up the spoon and scoop the beans") y genera acciones de control para un brazo YAM Ultra 2 con mano Sharpa Wave. El repositorio ocupa 12,5 GB y no declara licencia ni idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π0.5, receta openpi `pi05_maggie_2skill_hcw_nojit` |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucción fija en inglés en entrenamiento) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 12,5 GB; pesos EMA del paso 5999) |

## Arquitectura y entrenamiento

El modelo sigue la receta π0.5 implementada en openpi (commit d197906), con la configuración `pi05_maggie_2skill_hcw_nojit`. Se entrenó durante 6000 pasos con semilla 43 sobre una única GPU H200, y los pesos publicados son los pesos EMA del paso 5999. La variante base `astra-block-1cmd` se entrenó en una RTX PRO 6000; el cambio de hardware es la única diferencia de infraestructura documentada.

Los datos de entrenamiento son los 300 episodios de `astra-block-1cmd`, generados por un controlador escrito por un agente de código y filtrados para que cada episodio cumpla la regla de agarre. En esta variante, 239 de esos 300 episodios se re-renderizaron con fondo de muñeca aleatorizado; los 61 restantes conservan la vista normal. El resto de arrays de los ficheros de entrenamiento es byte-idéntico a los de `astra-block-1cmd`. El pack de datos `astra_c3_n300` contiene 93600 filas y comparte estadísticas de normalización con el modelo base. La aleatorización solo afecta al fondo de la vista de muñeca: la habitación sintética es fija en el mundo durante todo el episodio (con paralaje realista al moverse la cámara) y los objetos estáticos se sitúan fuera del área de trabajo (2,85 de media por episodio). Las vistas de cabeza y lateral son idénticas a las de `astra-block-1cmd`.

## Capacidades

- Generación de acciones de control para una tarea de manipulación concreta: coger una cuchara y recoger judías de un cuenco.
- Política condicionada por una única instrucción de lenguaje fija para todo el episodio.
- Control de brazo YAM Ultra 2 con mano Sharpa Wave, incluyendo agarre de potencia cerrado sobre el mango de la cuchara.
- Percepción multimodal con vistas de cabeza, lateral y muñeca.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, modo thinking, visión general, audio ni razonamiento simbólico.

## Casos de uso

- Investigación en robustez visual de políticas VLA: comparar el rendimiento de este checkpoint con `astra-block-1cmd` para aislar el efecto de la aleatorización de fondo en la cámara de muñeca, usando el mismo evaluador del profesor y las mismas 25 escenas de validación.
- Replicación de experimentos de simulación a real: servir como punto de partida para transferir la política al rig físico, teniendo en cuenta las advertencias del autor sobre el montaje de la mano, el offset de la articulación 6 y la pose no calibrada de la cámara de muñeca.
- Estudio de sensibilidad al número de filas ejecutadas por consulta: el autor reporta barridos a 2, 5 y 7 filas por query, lo que permite analizar el compromiso entre frecuencia de replanificación y tasa de éxito.
- Evaluación de generalización fuera de distribución: el conjunto "held-out random" (texturas, fotos y tipos de objeto no vistos en entrenamiento) permite medir la degradación de la política ante fondos novedosos.
- Docencia y divulgación sobre VLA y openpi: ejemplo reproducible de un pipeline completo de entrenamiento en Isaac Lab con datos sintéticos y evaluación automática mediante el evaluador del profesor.
- Análisis de errores de generación de datos: el sesgo documentado en el generador de escenas (el quemador y la olla se mueven siempre solidarios al soporte) sirve como caso de estudio de cómo un error de seeding limita la variabilidad del dataset.

## Benchmarks y rendimiento

Resultados en simulación sobre 25 escenas de validación, 2 muestras por escena, 329 pasos (32,9 s), evaluados con el evaluador del profesor. Éxito = al menos 1 judía transportada, cuchara en la mano al final, dentro de límites físicos y con las condiciones de agarre (agarre de potencia cerrado en al menos el 80 % de los fotogramas sostenidos, 5-20 mm del extremo del mango libres, mano al menos 30 mm sobre la mesa y al menos 10 mm del soporte). "Solo scoop" elimina las condiciones de agarre. Un recuento inferior a 50 indica episodios no terminados al escribirse la card.

| Modelo | Fondo de muñeca | Filas por query | Éxito | Solo scoop | Cuchara en mano | Agarre cerrado |
|---|---|---|---|---|---|---|
| Este modelo | normal | 2 | 1/50 | 4/50 | 13/50 | 13/50 |
| Este modelo | normal | 5 | 16/50 | 27/50 | 44/50 | 41/50 |
| Este modelo | normal | 7 | 23/50 | 36/50 | 45/50 | 47/50 |
| Este modelo | held-out random | 2 | 1/50 | 5/50 | 14/50 | 16/50 |
| Este modelo | held-out random | 5 | 14/50 | 25/50 | 37/50 | 43/50 |
| Este modelo | held-out random | 7 | 11/50 | 28/50 | 41/50 | 45/50 |
| astra-block-1cmd | normal | 2 | 1/50 | 7/50 | 16/50 | 7/50 |
| astra-block-1cmd | normal | 5 | 14/50 | 33/50 | 44/50 | 38/50 |
| astra-block-1cmd | normal | 7 | 26/50 | 40/50 | 47/50 | 46/50 |
| astra-block-1cmd | held-out random | 2 | 0/49 | 9/49 | 26/49 | 6/49 |
| astra-block-1cmd | held-out random | 5 | 14/49 | 28/49 | 43/49 | 37/49 |
| astra-block-1cmd | held-out random | 7 | 14/50 | 31/50 | 47/50 | 42/50 |

El profesor (el propio controlador, sobre las 25 escenas una vez) obtiene 24/25. El autor advierte que con 50 episodios por fila una diferencia de unos pocos episodios está dentro del azar (en 25 de 50, el intervalo del 95 % es aproximadamente 36-64 %), por lo que los dos modelos no son distinguibles en ninguna fila. Ambos pierden cerca de la mitad de sus éxitos a 7 filas por query bajo fondos held-out y poco o nada a 5 filas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU de entrenamiento documentada: una H200 para este checkpoint (la variante base usó una RTX PRO 6000).
- No se documenta si el modelo cabe en GPU de consumo; el tamaño del repo (12,5 GB) incluye pesos y artefactos, pero no se especifica el desglose.
- Opciones de despliegue: openpi (commit d197906) con la configuración `pi05_maggie_2skill_hcw_nojit`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La evaluación usa 329 pasos (32,9 s) por episodio en simulación, pero no se desglosa el coste de inferencia.
- Verificación de integridad: un servidor nuevo responde 12 consultas registradas con un error máximo de 0,003 rad respecto a las respuestas del clúster de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Éxito (mejor fila, fondo normal) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | no disponible | no disponible | 23/50 a 7 filas/query | no disponible | Hugging Face (12,5 GB) |
| `Superstar111/pi05-yam-sharpa-spoon-scoop-astra-block-1cmd` | no disponible | no disponible | 26/50 a 7 filas/query | no disponible | Hugging Face |
| Profesor (controlador del agente de código) | no aplica | no aplica | 24/25 escenas | no disponible | No publicado como modelo |

La comparación con otros modelos VLA de la misma categoría (por ejemplo, π0.5 base de Physical Intelligence) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (Isaac Lab); no se ha ejecutado en el robot real.
- La aleatorización del fondo de muñeca no aportó mejora medible en simulación ni robustez adicional ante fondos held-out.
- Sesgo del generador de escenas: el quemador con la olla se movía siempre solidario al soporte en cada episodio (error de seeding), por lo que el modelo nunca vio ambos elementos moverse de forma independiente. Deben colocarse cerca de sus posiciones nominales.
- Montaje de la mano: entrenado con el montaje girado tal como lo modela el modelo principal; no debe aplicarse la conversión de la articulación 6 que necesitan los cinco checkpoints anteriores. En simulación, la articulación 6 marca +7,9° en la postura de reposo con la palma hacia abajo; si el rig marca otra cosa, esa diferencia es el offset a pasar al runner. No verificado en el rig.
- La pose de la cámara de muñeca en entrenamiento es geométrica (según el montaje espejo blanco y gris), no calibrada, y no está verificada en el rig.
- Riesgo físico: con fondo de muñeca normal, la mano bajó hasta la superficie de la mesa al recoger en 2 de 50 episodios a 2 filas por query, 0 de 50 a 5 y 0 de 50 a 7. El autor recomienda ejecutar la recogida con una persona en el botón de parada de emergencia.
- Instrucción única y fija; no es un modelo de lenguaje o VLA de propósito general.
- Licencia no declarada: no hay autorización explícita para uso comercial.
- Idiomas no declarados; la única instrucción documentada está en inglés.
- Sin datos publicados sobre sesgos sociales, alucinación lingüística o comportamiento fuera de la tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Superstar111/pi05-yam-sharpa-spoon-scoop-astra-block-1cmd-wristrand
- Modelo base: https://huggingface.co/Superstar111/pi05-yam-sharpa-spoon-scoop-astra-block-1cmd
- openpi (repositorio de referencia, commit d197906): no disponible en la información proporcionada
- Paper de π0.5: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
