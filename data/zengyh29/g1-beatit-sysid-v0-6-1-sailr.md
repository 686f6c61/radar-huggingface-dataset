# zengyh29/g1-beatit-sysid-v0.6.1-sailr

## Resumen

Beat-It para SAILR y el robot es un filtro de seguridad para el robot humanoide Unitree G1 de 29 grados de libertad, empaquetado por el autor zengyh29 para dos usos: entrenamiento con el filtro en el bucle (SAILR) y la inferencia a bordo mediante ONNX Runtime. El modelo implementa un monitor que, cada 20 ms, evalúa las trayectorias de articulaciones propuestas por un tracker de control y las rechaza si la estimación del margen de seguridad cae por debajo de un umbral calibrado. La innovación principal es la incorporación de un modelo térmico de los motores (SysID v0.6.1) dentro de un modelo del mundo aprendido, de modo que el filtro no solo previene caídas, sino también el sobrecalentamiento de los devanados.

El repositorio incluye dos variantes: un monitor completo (teacher, 200 dimensiones de estado) y un monitor rápido (student, 188 dimensiones) que prescinde de las entradas de pie que el G1 no mide (altura del pie, tiempo en el aire, contacto y fuerzas de contacto). Para el robot real se recomienda el student, que requiere estimadores de velocidad lineal de la base y de temperatura de los devanados. Además, se proporcionan monitores rápidos con k = 10, 15 o 25 pasos imaginados y una función de valor que estima el margen restante del segundo, reduciendo el coste computacional de 35 ms a unos 9 ms en un núcleo de CPU.

El modelo es relevante porque aborda un problema práctico de despliegue de políticas de control aprendidas en hardware humanoide: la seguridad en tiempo real. Su estado es únicamente validado en simulación, no en hardware, y su licencia es "other", lo que exige revisar los términos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo del mundo aprendido (red neuronal) con política de recuperación (fallback) y funciones de valor; exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de monitorización de 1 s (50 pasos a 50 Hz) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | other |
| Formato de pesos | ONNX (inferencia) y PyTorch (checkpoints para entrenamiento SAILR) |

## Arquitectura y entrenamiento

El sistema se compone de tres elementos: una política de recuperación (fallback) que genera acciones de 29 dimensiones a partir de una observación de 127 dimensiones; un monitor completo que, dado el estado del robot, un contexto de 33 dimensiones y una propuesta de acción, simula un despliegue de 1 segundo (la propuesta durante un paso y el fallback durante 49) y devuelve el margen mínimo, la supervivencia y la temperatura máxima de los devanados; y monitores rápidos que imaginan k pasos (10, 15 o 25) y completan la estimación con una función de valor específica por horizonte. El modelo del mundo del student se entrenó durante 300 millones de pasos sin las 12 entradas de pie, mientras que el teacher utiliza el modelo del mundo de la versión v0.6.1.

Los umbrales se calibraron siguiendo la Proposición 1 de Wang et al. con ε = 1 % y β = 1e-10 sobre bancos de empuje SONIC específicos por tarea (dance, fight y bent-knee walk), con aproximadamente 31.900 estados de transición, 4 despliegues reales de fallback de 3 s por estado y devanados a temperaturas uniformes entre 30 y 60 °C. El fallo se define como una caída o un devanado que alcanza los 70 °C. Las funciones de valor son agnósticas a la tarea, pero los umbrales deben recalibrarse para cada tarea nueva (unos 15 minutos en una GPU).

## Capacidades

- Filtrado de seguridad en tiempo real: evalúa propuestas de trayectorias articulares cada 20 ms y las rechaza si el margen mínimo estimado (caída o temperatura de devanado de 70 °C) queda por debajo del umbral.
- Política de recuperación (fallback): ejecuta una acción de recuperación durante al menos 1 s tras un rechazo.
- Monitorización térmica: integra un modelo de calor de los motores (SysID v0.6.1) que predice la temperatura máxima de los devanados.
- Monitores rápidos: variantes con k = 10, 15 y 25 pasos imaginados más función de valor, con latencias de aproximadamente 9 ms para k = 15 en un núcleo de CPU.
- Modo student sin pies: funciona sin altura de pie, tiempo en el aire, contacto ni fuerzas de contacto, entradas que el G1 no mide.
- Integración en entrenamiento SAILR: proporciona funciones de valor y umbrales por tarea para entrenar un tracker con el filtro en el bucle.
- Exportación ONNX para inferencia a bordo con onnxruntime a 50 Hz de referencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un componente de control robótico.

## Casos de uso

- Despliegue seguro de políticas de locomoción en el Unitree G1: el monitor rechaza propuestas del tracker que puedan provocar una caída o sobrecalentamiento, y el fallback estabiliza el robot durante al menos 1 s. Es adecuado porque opera a 50 Hz con latencias de milisegundos.
- Entrenamiento de trackers con conciencia de seguridad: se usa la variante PyTorch del student y las funciones de valor para entrenar un tracker SAILR que aprenda dónde su filtro acepta propuestas, evitando la discrepancia entre entrenamiento y despliegue.
- Protección térmica en posturas agachadas prolongadas: el modelo del mundo con el modelo de calor permite rechazar trayectorias que elevarían los devanados por encima de 70 °C, un riesgo típico en movimientos de sentadilla mantenida.
- Validación en modo sombra: el monitor se ejecuta registrando decisiones sin actuar sobre el robot, lo que permite comparar sus rechazos con el comportamiento real antes de habilitarlo.
- Calibración de umbrales para tareas nuevas: con el script de calibración y el banco de empuje propio, se generan umbrales para el monitor completo y los rápidos en unos 15 minutos en una GPU.
- Investigación en aprendizaje por refuerzo seguro: el repositorio sirve como referencia reproducible de filtros de seguridad con calibración estadística (ε = 1 %, β = 1e-10) para experimentos con humanoides.
- Integración en pipelines de simulación: los grafos ONNX pueden ejecutarse en entornos simulados para evaluar políticas antes de transferirlas a hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente métricas de calibración de umbrales y tamaños de conjunto seguro, que se resumen a continuación.

| Tarea (student) | Monitor completo (umbral / conjunto seguro) | k10 | k15 | k25 |
|---|---|---|---|---|
| dance | 0.401 / 95,0 % | 0.444 / 95,0 % | 0.349 / 95,8 % | 0.339 / 95,7 % |
| fight | 0.436 / 93,0 % | 0.436 / 93,2 % | 0.421 / 93,4 % | 0.389 / 93,7 % |
| bentknee | −0.574 / 96,3 % | −0.035 / 96,3 % | −0.158 / 96,5 % | −0.412 / 96,6 % |

| Tarea (teacher) | Monitor completo | k10 | k15 | k25 |
|---|---|---|---|---|
| dance | 0.482 / 95,6 % | 0.549 / 95,1 % | 0.516 / 95,5 % | 0.481 / 95,8 % |
| fight | 0.486 / 94,2 % | 0.567 / 93,4 % | 0.543 / 93,8 % | 0.481 / 94,5 % |
| bentknee | 0.364 / 94,6 % | 0.416 / 93,5 % | 0.376 / 94,5 % | 0.351 / 94,9 % |
| walk (banco genérico, empujes ≤ 3,5 m/s) | 0.665 / 83 % | — | — | — |

Todos los conjuntos son 99,34 % sólidos (estados aceptados que se recuperaron). Los umbrales negativos del student en bent-knee reflejan que sus márgenes predichos son bajos en esa postura agachada.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,2 GB y los grafos ONNX están pensados para ejecutarse en CPU.
- GPU recomendadas: no se especifican; la calibración de umbrales requiere una GPU (aproximadamente 15 minutos) y la inferencia de referencia funciona en un núcleo de CPU.
- Cabe en GPU de consumo: no disponible como requisito; la inferencia a bordo está diseñada para onnxruntime en CPU.
- Opciones de despliegue: onnxruntime para los grafos ONNX; PyTorch para el entrenamiento SAILR con los checkpoints del student.
- Latencia y throughput: monitor rápido con k = 15 en aproximadamente 9 ms en un núcleo de CPU, frente a 35 ms del monitor completo; frecuencia de referencia de 50 Hz (20 ms por ciclo).

## Comparativa con modelos similares

| Modelo | Tipo | Estado de entradas | Contexto temporal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zengyh29/g1-beatit-sysid-v0.6.1-sailr (este) | Filtro de seguridad + fallback para G1 | 188 (student) o 200 (teacher) | 1 s (50 pasos a 50 Hz) | other | Hugging Face, ONNX y PyTorch |
| zengyh29/g1-beatit-sysid-v0.6.1-onnx | Versión anterior del filtro | 200 | 1 s | other | Hugging Face |
| zengyh29/g1-beatit-sysid-v0.6.1 | Checkpoint PyTorch del teacher | 200 | 1 s | other | Hugging Face |

No se dispone de información sobre otros filtros de seguridad comparables de otros autores en la documentación proporcionada.

## Limitaciones y advertencias

- Estado únicamente validado en simulación: no se ha ejecutado en hardware; se recomienda probarlo primero en modo sombra y después en un banco de pruebas.
- Requiere estimadores adicionales en el robot: velocidad lineal de la base y observador térmico para el student; el teacher necesita además altura de pie, tiempo en el aire, contacto y fuerzas de contacto, que el G1 no mide.
- Los umbrales del student en bent-knee son negativos y, aunque pasan la calibración, exigen una guarda separada de temperatura de devanados para movimientos agachados prolongados.
- Cada tarea nueva requiere su propia calibración de umbrales; los valores publicados no son transferibles sin recalibrar.
- Las funciones de valor son agnósticas a la tarea, pero el rendimiento del filtro depende de la calidad del modelo del mundo y de los estimadores de entrada.
- Licencia "other": es necesario revisar los términos exactos antes de cualquier uso comercial o redistribución.
- Riesgo de falsos positivos y negativos en la monitorización: un rechazo innecesario activa el fallback durante al menos 1 s, lo que puede interrumpir tareas legítimas.
- No es un modelo de lenguaje ni un agente: no soporta tool calling, razonamiento multi-paso ni capacidades multilingües.
- No se han publicado benchmarks de rendimiento en hardware real ni comparativas con otros filtros de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zengyh29/g1-beatit-sysid-v0.6.1-sailr
- Versión anterior ONNX: https://huggingface.co/zengyh29/g1-beatit-sysid-v0.6.1-onnx
- Checkpoint del teacher: https://huggingface.co/zengyh29/g1-beatit-sysid-v0.6.1
- Repositorio coolmimic (rama sailr-beatit): https://github.com/JHU-AllianceLab/coolmimic
