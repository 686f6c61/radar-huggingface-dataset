# suraj-phanindra/microduck-heist-ppo3-aifund

## Resumen

`microduck-heist-ppo3-aifund` es una política de control motriz para el robot cuadrúpedo de bajo coste microduck de Pollen Robotics, publicada por el usuario suraj-phanindra. No es un modelo de lenguaje: se trata de un artefacto de aprendizaje por refuerzo exportado a ONNX que implementa una marcha (gait) perpetua para la tarea `Mjlab-SockHeist6m-MicroDuck`, es decir, una política entrenada en simulación con mjlab para una tarea concreta de locomoción o manipulación sobre el robot.

El modelo deriva por fine-tuning de la referencia `pollen-robotics/microduck-sock-heist-6m-reference` y se distribuye con la librería `microduck`, pensada para cargar políticas directamente en el daemon del robot mediante `robotctl`. La observación de entrada es de 61 dimensiones y la salida de 14 acciones a 50 Hz, con el normalizador de observaciones embebido en el propio `policy.onnx`.

Su relevancia es acotada pero práctica: demuestra el flujo completo de entrenamiento en mjlab, exportación a ONNX y despliegue en hardware real mediante el manifiesto de políticas schema 2 de microduck. El repositorio no contiene pesos en formato safetensors ni documentación sobre licencia, idiomas o benchmarks, y no ha registrado descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política de aprendizaje por refuerzo exportada a ONNX (red neuronal de control; topología interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Modelo base | pollen-robotics/microduck-sock-heist-6m-reference |
| Relacion con el base | fine-tune |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, tipo de activaciones ni si emplea memoria recurrente). Lo que sí se documenta es el pipeline de entrenamiento: la política se entrena con mjlab sobre la tarea `Mjlab-SockHeist6m-MicroDuck`, partiendo del checkpoint `3998`, con semilla `2` y sobre la base `mjlab-microduck 0.1.0` en el commit `1efd853be`. El entrenamiento comenzó el 2026-11-12T22:08:00Z y el modelo se publicó al día siguiente.

El resultado es una política "perpetua": ejecuta la marcha de forma continua hasta recibir una orden contraria, y se carga en una ranura (slot) del daemon del robot. Un detalle de ingeniería relevante es que el normalizador de observaciones está embebido en `policy.onnx`, de modo que el consumidor puede alimentar observaciones en crudo sin replicar la normalización en el lado del robot. El manifiesto sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon.

## Capacidades

- Control locomotor del robot microduck mediante una política de 61 observaciones de entrada y 14 acciones de salida a 50 Hz.
- Ejecución perpetua de la marcha hasta que se le indique lo contrario, apta para cargarse en una ranura de política del daemon.
- Inferencia autocontenida en ONNX con normalización de observaciones integrada.
- Despliegue directo en hardware mediante `robotctl policy load <slot> suraj-phanindra/microduck-heist-ppo3-aifund`.
- Compatibilidad con el ecosistema mjlab y con el manifiesto de políticas schema 2 de microduck.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio: es una política de control motriz, no un modelo generativo.

## Casos de uso

- Despliegue de una marcha base en un microduck físico: cargar la política en una ranura con `robotctl` y dejar que el robot ejecute la marcha de forma continua mientras se prueban otros subsistemas.
- Validación del pipeline mjlab a hardware: usar este checkpoint como referencia para comprobar que el flujo de entrenamiento, exportación a ONNX y carga en el daemon funciona de extremo a extremo.
- Punto de partida para fine-tuning: al derivar de `microduck-sock-heist-6m-reference`, sirve como inicialización para nuevas tareas o variantes de la marcha en mjlab.
- Docencia y prototipado en robótica de bajo coste: permite a estudiantes ejecutar una política de RL real en un cuadrúpedo asequible sin entrenar desde cero.
- Pruebas de integración del daemon: útil para verificar el manejo de manifiestos schema 2, la carga de políticas en ranuras y el consumo de observaciones en crudo con normalizador embebido.
- Benchmarking interno de locomoción: comparar esta política con la referencia base sobre el mismo robot y la misma tarea para evaluar el efecto del fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y no se documenta el número de parámetros de la red, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponibles. Al ser una política de control a 50 Hz con entrada de 61 dimensiones, es previsible que la inferencia sea ligera, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada; no se especifican requisitos.
- Opciones de despliegue: el soportado explícitamente es el daemon de microduck mediante `robotctl policy load <slot> ...`, consumiendo `policy.onnx` y `manifest.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; únicamente se conoce la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension observacion / accion | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| suraj-phanindra/microduck-heist-ppo3-aifund | Política RL (ONNX) para microduck | 61 / 14 | 50 Hz | no disponible | Hugging Face, 0 descargas |
| pollen-robotics/microduck-sock-heist-6m-reference | Política RL de referencia para microduck | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Otras políticas de microduck en el ecosistema mjlab | Políticas RL | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estas políticas ni de alternativas de otros fabricantes con especificaciones verificables en la información proporcionada.

## Limitaciones y advertencias

- No se especifica licencia: no puede asumirse uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue productivo.
- El modelo card no documenta sesgos, pero al ser una política entrenada en simulación existe una brecha sim-to-real no cuantificada que puede degradar el comportamiento en hardware físico.
- Política "perpetua": una vez cargada, ejecuta la marcha indefinidamente hasta que se le indique lo contrario, lo que exige mecanismos externos de parada segura.
- Ámbito de aplicación muy restringido: solo tiene sentido sobre el robot microduck y la tarea `Mjlab-SockHeist6m-MicroDuck`; no es reutilizable como modelo general.
- Sin datos de benchmarks, ablaciones ni comparación con la referencia base: no hay evidencia publicada de que el fine-tuning mejore a `microduck-sock-heist-6m-reference`.
- Cero descargas y cero likes en el momento de la ficha: no hay validación comunitaria ni informes de terceros sobre su funcionamiento en hardware real.
- El repositorio ocupa 0.0 GB según Hugging Face, lo que puede indicar que los artefactos no están subidos o que el tamaño se redondea; conviene verificar la presencia efectiva de `policy.onnx` y `manifest.json` antes de desplegar.
- No se documentan requisitos de hardware ni latencias medidas, por lo que el rendimiento en tiempo real a 50 Hz no está garantizado en todas las plataformas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suraj-phanindra/microduck-heist-ppo3-aifund
- Modelo base: https://huggingface.co/pollen-robotics/microduck-sock-heist-6m-reference
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del daemon): no disponible como enlace directo en la información proporcionada.
