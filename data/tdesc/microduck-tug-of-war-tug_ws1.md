# tdesc/microduck-tug-of-war-tug_ws1

## Resumen

`microduck-tug-of-war-tug_ws1` es una política de control por refuerzo entrenada para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de una política de locomoción exportada a ONNX que resuelve una tarea concreta de simulación denominada `Mjlab-TugOfWar-MicroDuck`: una marcha perpetua que el robot ejecuta de forma continua hasta recibir una orden de parada. El autor del repositorio es el usuario `tdesc`.

La política consume observaciones de 61 dimensiones y emite 14 acciones a una frecuencia de control de 50 Hz, con el normalizador de observaciones integrado dentro del propio fichero `policy.onnx`, de modo que el operador debe alimentar observaciones en crudo. Se distribuye junto a un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck, lo que permite cargarla directamente en una ranura de política del daemon del robot mediante `robotctl`.

Su relevancia es acotada pero práctica: ilustra el flujo completo de entrenamiento con RL (mjlab, MuJoCo) y despliegue en hardware de bajo coste, con instrucciones de reproducción explícitas. El repositorio tiene un tamaño de 0.0 GB y no registra descargas ni likes en el momento de la consulta, y la información disponible sobre licencia, idiomas y benchmarks es inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control por refuerzo exportada a ONNX (red neuronal; topología interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

Otros parámetros operativos documentados:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (se ejecuta hasta recibir orden de parada) |
| Normalizador de observaciones | integrado en `policy.onnx` (entrada en crudo) |
| Tarea de entrenamiento | `Mjlab-TugOfWar-MicroDuck` |
| Entorno de simulacion | mjlab (MuJoCo) |
| Checkpoint | 75 |
| Semilla | 2 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, función de activación ni tipo de política, p. ej. MLP con acciones gaussianas o deterministas). Lo que sí se documenta es el pipeline: la política se entrena en mjlab sobre la tarea `Mjlab-TugOfWar-MicroDuck`, partiendo de la base `mjlab-microduck 0.1.0` en el commit `1efd853be`, dentro del repositorio `https://github.com/tdesc/microduck-challenges.git` (rama `main`, commit `b7549fbea`).

El entrenamiento se realizó con 256 entornos paralelos, un máximo de 400 iteraciones del agente, intervalo de guardado cada 25 iteraciones y reanudación desde el run `2026-11-24_14-09-31_tug_gentle1`, checkpoint `model_50.pt`. Los hiperparámetros de ajuste fino incluyen una tasa de aprendizaje de `2e-5` y un KL objetivo de `0.005`, lo que sugiere una fase de refinamiento sobre una política previa con restricción de divergencia (estilo PPO con KL temprano). El checkpoint final exportado es el 75 y la semilla empleada fue la 2. El autor advierte explícitamente que el entrenamiento por RL con GPU no es reproducible bit a bit entre máquinas: la misma receta produce una política comparable, no idéntica. Asimismo, indica que la exportación se hizo desde un checkout con cambios sin confirmar.

## Capacidades

- Locomoción perpetua del robot microduck: ejecuta una marcha continua hasta que se le ordena detenerse.
- Control reactivo a partir de observaciones proprioceptivas de 61 dimensiones (composición exacta no documentada).
- Emisión de 14 acciones de control a 50 Hz, adecuadas para los actuadores del microduck.
- Normalización de observaciones integrada: acepta observaciones en crudo sin preprocesado externo.
- Carga en ranura de política del daemon del robot mediante `robotctl policy load <slot> ...`.
- Compatibilidad con el manifiesto de políticas de microduck en su esquema 2.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio: es una política motora, no un modelo generativo.
- Capacidades multilingües: no aplica.

## Casos de uso

- Demostración de locomoción en microduck: cargar la política en una ranura libre y ejecutar una marcha perpetua para validar el funcionamiento del robot tras el montaje o una actualización de firmware.
- Pruebas de resistencia de hardware: al ser una política perpetua, permite mantener el robot caminando durante periodos prolongados para medir calentamiento de motores, consumo de batería y desgaste mecánico.
- Base para ajuste fino en tareas de arrastre o tracción: el nombre de la tarea (`TugOfWar`) y el run de partida (`tug_gentle1`) indican que sirve como inicialización para variantes de la misma familia de tareas de fuerza.
- Reproducción de experimentos de RL: con el comando documentado, un investigador puede reentrenar la política desde cero o desde el checkpoint indicado para estudiar sensibilidad a semilla e hiperparámetros.
- Validación del pipeline de despliegue: útil para verificar de extremo a extremo la cadena mjlab → exportación ONNX → `manifest.json` → daemon del robot.
- Docencia y prototipado en robótica de bajo coste: ejemplo compacto de política RL lista para ejecutar en hardware asequible, sin necesidad de infraestructura de inferencia de gran escala.
- Integración en pruebas automatizadas de CI del daemon: cargar la política en un entorno simulado o en banco de pruebas para comprobar que el cargador de políticas acepta el manifiesto y el ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de recompensa, tasas de éxito, velocidad de marcha, estabilidad ni comparaciones con otras políticas. Tampoco se documentan latencia ni throughput de inferencia, aunque la frecuencia de control de 50 Hz implica que la política debe evaluarse en menos de 20 ms por paso en el hardware objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0.0 GB) y la naturaleza de la política, se espera un modelo de muy pocos parámetros que probablemente se ejecute en CPU.
- GPU recomendadas: no se especifican; el entrenamiento se realizó con RL en GPU (el comando de reproducción usa `--gpu-ids None`, lo que sugiere ejecución en CPU o selección automática de dispositivo, sin más detalle).
- Compatibilidad con GPU de consumo: no documentada; el despliegue previsto es en el propio robot microduck, no en un servidor.
- Opciones de despliegue: `robotctl policy load <slot> tdesc/microduck-tug-of-war-tug_ws1` sobre el daemon de microduck, con runtime ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el único requisito explícito es sostener 50 Hz de control.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni modelos comparables de la misma categoría (políticas RL para cuadrúpedos de bajo coste) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa. El repositorio tampoco enlaza variantes hermanas de la misma familia de tareas.

## Limitaciones y advertencias

- Ámbito muy restringido: es una política motora específica para el robot microduck y la tarea `Mjlab-TugOfWar-MicroDuck`; no es reutilizable como modelo de propósito general.
- Licencia no declarada: no se especifica licencia en la información disponible, por lo que el uso comercial queda sin garantías legales hasta que el autor la explicite.
- Reproducibilidad limitada: el propio autor advierte que el RL con GPU no es reproducible bit a bit; los pesos exactos no pueden regenerarse de forma determinista.
- Exportación desde un checkout con cambios sin confirmar: el artefacto publicado puede no corresponder exactamente al commit documentado, lo que complica la auditoría.
- Sin métricas de rendimiento: no hay datos de tasa de éxito, estabilidad ni robustez ante perturbaciones, por lo que no puede evaluarse su calidad antes de desplegarla.
- Dependencia del daemon y del esquema de manifiesto 2: cambios de versión en el daemon o en el esquema pueden romper la carga de la política.
- Riesgo en hardware real: una política perpetua sin criterios de parada internos exige supervisión; debe preverse un mecanismo externo de parada de emergencia.
- Idiomas y sesgos: no aplica en el sentido habitual, pero no se documenta el dominio de distribución de las observaciones ni el comportamiento fuera de él (por ejemplo, terrenos o cargas distintas a las del entrenamiento).
- Sin datos de cuantización: no se ofrecen variantes optimizadas; el rendimiento en hardware embebido dependerá del runtime ONNX del robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tdesc/microduck-tug-of-war-tug_ws1
- Repositorio de retos y entrenamiento: https://github.com/tdesc/microduck-challenges.git
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (ruta citada en la model card; URL exacta no disponible)
