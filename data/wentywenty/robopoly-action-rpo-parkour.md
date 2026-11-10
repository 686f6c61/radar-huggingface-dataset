# wentywenty/robopoly-action-rpo-parkour

## Resumen

RPO Parkour es una política de control robótico experimental publicada en Hugging Face por el usuario `wentywenty` bajo el paraguas del sistema Robopoly. Se trata de un modelo de acción (policy) entrenado para ejecutar maniobras de parkour en un robot humanoide de la familia `rpo`, con 23 grados de libertad (DOF). El artefacto distribuido es un fichero ONNX (`models/policy_parkour.onnx`) que se ejecuta a 250 Hz y se integra mediante la CLI de Robopoly, no mediante las librerías habituales de inferencia de lenguaje.

El modelo no es un LLM ni un modelo multimodal: es una política de control motor que mapea observaciones (presumiblemente estado de articulaciones, IMU y consignas) a acciones de articulación, con una única entrada `input` y una única salida `output` en el grafo ONNX. Su relevancia es acotada pero concreta: demuestra el patrón de distribución de habilidades robóticas empaquetadas como artefactos versionados con metadatos de seguridad (nivel `S3`), verificación criptográfica (SHA256 de los pesos) y comandos de instalación, verificación y rollback.

La información pública es muy escasa: el repositorio ocupa 0,0 GB, no tiene descargas ni likes, la licencia de los pesos está pendiente de confirmar y el autor solo garantiza compatibilidad con el modelo de robot y el número de DOF declarados. Cualquier evaluación de rendimiento real requeriría acceso al hardware `rpo` y al stack `Roboparty/roboparty_inference`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control motor exportada a ONNX; topología interna no publicada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; entrada/salida de tensores de observación/acción) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | `other` para los pesos (pendiente de confirmar); código `GPL-3.0-only` |
| Formato de pesos | ONNX (`models/policy_parkour.onnx`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna de la política: la model card solo describe el contrato de despliegue (entrada `input`, salida `output`, frecuencia de 250 Hz) y los metadatos del robot objetivo (modelo `rpo`, 23 DOF, nivel de seguridad `S3`). El nombre del repositorio incluye el término `rpo`, que coincide con el identificador de la familia de robots, y la etiqueta `rpo` aparece también como tag; no hay más detalle sobre si se trata de una red MLP, un transformer de política o un modelo recurrente.

Tampoco se documentan los datos de entrenamiento (número de trayectorias, composición, si hubo simulación y posterior transferencia a real, técnicas de RL como PPO o imitation learning), ni procesos de ajuste fino. La única trazabilidad técnica disponible es la procedencia: el artefacto proviene de `Roboparty/roboparty_inference`, ruta `robots/rpo/models/policy_parkour.onnx`, commit `ee9174c`, con hash SHA256 `cb562c4407fb38b4aaed48afcf2ba1cc23ab20e1861feb36bbca79c8a7427370`. La innovación destacable, en todo caso, es de empaquetado: distribución de habilidades con nivel de riesgo, verificación de integridad y rollback.

## Capacidades

- Ejecución de una política de parkour sobre el robot humanoide `rpo` con 23 DOF, a una frecuencia de control de 250 Hz.
- Inferencia vía ONNX con un único tensor de entrada y un único tensor de salida, lo que simplifica la integración en runtimes embebidos.
- Instalación, verificación y rollback gestionados por la CLI de Robopoly (`robopoly action install`, `verify`, `rollback`).
- Clasificación de riesgo de la habilidad como `S3`, con requisitos explícitos de confirmación humana antes de la ejecución.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo generativo de lenguaje.
- No se documentan modos especiales (thinking, decodificación especulativa) ni variantes de la política.

## Casos de uso

- Investigación en locomoción bípeda: usar la política como línea base reproducible para comparar maniobras de parkour en el robot `rpo`, gracias a la fijación por commit y hash del artefacto.
- Validación de pipelines de despliegue robótico: el flujo `install` → `verify` → ejecución → `rollback` sirve para probar sistemas de gestión de habilidades con control de versiones y reversión.
- Demostración en laboratorio con supervisión: ejecutar la habilidad `S3` en un entorno despejado y con parada de emergencia accesible, como prueba de concepto de transferencia sim-to-real.
- Integración en runtimes embebidos: al ser ONNX con entrada/salida únicas y 250 Hz, encaja en controladores que ya dispongan de un intérprete ONNX y bus CAN operativo.
- Auditoría de seguridad de habilidades robóticas: el nivel `S3` y los requisitos de alimentación limitada y realimentación CAN permiten diseñar procedimientos de habilitación y verificación previa.
- Formación y docencia: ilustrar el ciclo de vida completo de una política de control publicada como artefacto versionado, desde la instalación hasta la reversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito, velocidad de desplazamiento, tasa de caídas ni comparaciones con otras políticas, y advierte que cualquier preview en simulación no representa el comportamiento en hardware real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y no se publica el número de parámetros, por lo que no puede estimarse a partir de los datos disponibles.
- GPU recomendadas: no disponible. Al ser una política de control a 250 Hz, es plausible que el cuello de botella sea la latencia del bus CAN y el ciclo de control, no la GPU, pero esto no está confirmado por el autor.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: runtime ONNX (ONNX Runtime u otro intérprete compatible) dentro del stack `Roboparty/roboparty_inference`; la CLI de Robopoly gestiona instalación y verificación. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: la frecuencia nominal es de 250 Hz (periodo de 4 ms), pero no se publican medidas de latencia real de inferencia ni de throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas de parkour para humanoides comparables en parámetros, contexto o licencia; la búsqueda web realizada no devolvió resultados relacionados con robótica humanoide.

## Limitaciones y advertencias

- Licencia de los pesos sin confirmar (`other`, pendiente de aclaración); el uso comercial no está garantizado y el autor indica que actualmente solo se destina a validación pública.
- Solo se garantiza compatibilidad con el modelo de robot `rpo` y 23 DOF; su uso en otra plataforma puede producir comportamientos inseguros.
- Nivel de seguridad `S3`: requiere espacio despejado, parada de emergencia accesible, limitación de corriente y realimentación CAN funcional antes de habilitar el movimiento.
- La instalación no implica habilitación: la ejecución exige confirmación explícita del usuario.
- Las previsualizaciones, si existen, son de simulación y no representan el comportamiento en hardware real.
- Sin información sobre sesgos, alucinación o cobertura lingüística, ya que no es un modelo de lenguaje; el riesgo relevante es físico (caídas, sobreesfuerzo de articulaciones), no cognitivo.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia independiente de robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/robopoly-action-rpo-parkour
- Repositorio upstream citado: `Roboparty/roboparty_inference` (ruta `robots/rpo/models/policy_parkour.onnx`, commit `ee9174c`); no se proporciona URL directa en la información disponible.
- Paper, blog o demo: no disponible.
