# wentywenty/robopoly-action-rp1-24dof-wave

## Resumen

RP1 24DOF Wave es un artefacto de política de control motriz (policy) publicado en Hugging Face por el usuario wentywenty dentro del ecosistema Robopoly. No se trata de un modelo de lenguaje, sino de una política de acciones preentrenada que genera comandos de articulación para el robot humanoide `rp1_24dof` de 24 grados de libertad, ejecutando una animación de saludo (wave). El modelo se distribuye en formato ONNX con un fichero de configuración YAML y datos de movimiento en NPZ, y opera a una frecuencia de control de 250 Hz con una interfaz `obs → actions`.

El artefacto resuelve un problema muy concreto: empaquetar y versionar una habilidad motriz reproducible para un robot humanoide específico, con un mecanismo de instalación, verificación y rollback mediante la CLI de Robopoly. Su relevancia es limitada fuera de ese ecosistema: es un piloto público de publicación de acciones, con licencia de pesos pendiente de confirmación y validación exclusivamente declarada para la máquina y el DOF indicados.

La información técnica disponible es escasa: no se documentan parámetros, arquitectura de red, datos de entrenamiento ni benchmarks. El repositorio figura con un tamaño de 0.0 GB, lo que sugiere que los pesos no están alojados en el propio repositorio o que el contenido es mínimo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control motriz, artefacto ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de acciones, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | other (código GPL-3.0-only; pesos con licencia pendiente de confirmación) |
| Formato de pesos | ONNX (`models/policy_wave.onnx`); configuración YAML y datos de movimiento NPZ |

Otros datos declarados por el autor: máquina `rp1_24dof`, 24 DOF, nivel de seguridad `S1`, frecuencia de 250 Hz, interfaz `obs → actions`, SHA256 de pesos `a9e4a874616c26e5e9be9e2e2cca5159bb04430664aa6f93d870f721cdc50452`.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura de la red neuronal que compone la política. El artefacto se entrega como un grafo ONNX (`policy_wave.onnx`) que mapea observaciones (`obs`) a acciones (`actions`) a 250 Hz, acompañado de un fichero de configuración de inferencia (`configs/wave.yaml`) y de datos de movimiento (`motions/wave.npz`). No se documentan capas, tamaño de la red, tipo de observaciones de entrada ni espacio de acciones.

Tampoco se publican datos de entrenamiento: no se indica el número de episodios, la técnica de aprendizaje (imitación, reinforcement learning u otra), ni si hubo ajuste fino o destilación. El autor declara como origen el repositorio upstream `Roboparty/roboparty_inference`, ruta `robots/rp1_24dof/models/policy_wave.onnx`, commit `ee9174c`, pero no se aporta información adicional sobre el proceso de generación del peso.

## Capacidades

- Ejecución de una habilidad motriz concreta: animación de saludo (wave) para el humanoide `rp1_24dof`.
- Control a 250 Hz con interfaz de observaciones a acciones (`obs → actions`).
- Compatibilidad declarada exclusivamente con la máquina `rp1_24dof` y 24 DOF.
- Clasificación de seguridad `S1` según la taxonomía de Robopoly.
- Instalación, verificación y rollback mediante la CLI `robopoly action` (comandos `install`, `verify`, `rollback`).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades multilingües.

## Casos de uso

- Demostración de saludo en ferias y presentaciones: la política ejecuta una animación de wave reproducible a 250 Hz, adecuada para mostrar el funcionamiento del humanoide `rp1_24dof` en un entorno controlado con soporte fiable y parada de emergencia accesible.
- Validación de la cadena de despliegue Robopoly: sirve como artefacto de prueba para verificar el flujo `install` → `verify` → `rollback` antes de publicar habilidades propias.
- Pruebas de integración en simulación: el fichero ONNX y los datos `motions/wave.npz` permiten ensayar la política en un simulador compatible antes de llevarla al robot físico, aunque el autor advierte que la vista previa en simulación no representa el comportamiento real.
- Benchmark interno de latencia de control: al fijar 250 Hz como frecuencia de inferencia, el artefacto permite medir si la pila de inferencia del robot sostiene el ciclo de control en la máquina objetivo.
- Formación de operadores: el movimiento de wave, clasificado como `S1`, es un caso de bajo riesgo para entrenar al personal en los protocolos de habilitación, confirmación manual y parada de emergencia.
- Base para desarrollo de habilidades derivadas: el par ONNX + YAML + NPZ sirve de plantilla para estructurar nuevas políticas de acción con el mismo formato de entrada y salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no aporta métricas de éxito de la tarea, error de seguimiento articular, latencia medida ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y no se publica el tamaño del grafo ONNX.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: inferencia mediante ONNX Runtime a través de la pila Robopoly (`roboparty_inference`); no se documentan otros runtimes.
- Latencia y throughput: el único requisito declarado es sostener 250 Hz de frecuencia de control; no se publican medidas de latencia reales.
- Requisitos físicos de operación: soporte fiable del robot, parada de emergencia accesible, limitación de corriente en la alimentación y realimentación CAN operativa.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas de acción comparables para el mismo robot o para humanoides de 24 DOF, ni se dispone de datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia de pesos pendiente de confirmación: el autor indica explícitamente que la licencia de los pesos está por determinar y que el artefacto se publica solo para validación pública; el uso comercial no está garantizado.
- Compatibilidad restringida: solo se garantiza el funcionamiento con la máquina `rp1_24dof` y 24 DOF; su uso en otra cinemática o número de articulaciones no está soportado.
- Riesgo físico: es una política de control motriz sobre hardware real; requiere soporte fiable, parada de emergencia accesible, limitación de corriente y realimentación CAN correcta antes de habilitarla.
- La instalación no implica habilitación: el autor exige confirmación manual del usuario antes de ejecutar el movimiento.
- Las acciones marcadas como de mayor riesgo que `S1` solo deben ejecutarse tras despejar el área y con confirmación humana; este artefacto está marcado como `S1`.
- Las previsualizaciones en simulación, si existen, no representan el comportamiento en el robot físico.
- Sin datos de entrenamiento ni benchmarks: no es posible evaluar la robustez de la política ante perturbaciones, cambios de carga o variaciones del terreno.
- Sin información sobre sesgos: al no ser un modelo lingüístico, no aplican sesgos de texto, pero tampoco se documenta el comportamiento ante condiciones fuera de distribución.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo equivalente es la generación de comandos articulares no válidos fuera del régimen de operación previsto, no cuantificado por el autor.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/robopoly-action-rp1-24dof-wave
- Repositorio upstream citado por el autor: `Roboparty/roboparty_inference` (ruta `robots/rp1_24dof/models/policy_wave.onnx`, commit `ee9174c`); no se proporciona URL directa en la información disponible.
- Documentación de la CLI Robopoly: no disponible.
- Paper, blog o demo: no disponible.
