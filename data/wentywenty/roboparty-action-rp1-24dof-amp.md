# wentywenty/roboparty-action-rp1-24dof-amp

## Resumen

RP1 24DOF AMP es una política de locomoción para el robot humanoide `rp1_24dof` de Roboparty, distribuida como un artefacto de acción en formato ONNX dentro del ecosistema de inferencia `roboparty_inference`. El modelo implementa una política de marcha entrenada mediante AMP (Adversarial Motion Priors), una técnica de aprendizaje por imitación que combina un discriminador adversarial con un objetivo de refuerzo para producir movimientos naturales y estables. No se trata de un modelo de lenguaje, sino de un controlador de bajo nivel que mapea observaciones del robot (`obs`) a comandos de actuación (`actions`) sobre los 24 grados de libertad del chasis.

El artefacto se publica como un paquete instalable mediante la CLI `roboparty action`, con un fichero de pesos `models/policy_amp.onnx` y una configuración de inferencia `configs/amp.yaml`. La frecuencia de operación declarada es de 250 Hz, lo que sitúa al controlador en el rango típico de bucles de control de robots humanoides articulados. La política está etiquetada con nivel de seguridad `S2`, lo que implica que su ejecución en hardware real requiere confirmación humana explícita y condiciones de entorno controladas.

El modelo es relevante en el contexto actual de robótica humanoide open source porque ejemplifica la tendencia a publicar políticas de control entrenadas con RL/imitation learning como artefactos versionados y verificables, con hash SHA256 del peso y comandos de instalación, verificación y rollback. No obstante, se encuentra en estado de piloto público: la licencia de los pesos está pendiente de confirmación y el repositorio no incluye información sobre datos de entrenamiento, benchmarks ni métricas de rendimiento en simulación o en hardware real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con AMP (Adversarial Motion Priors); topología de red no especificada |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada `obs` de observaciones del robot) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | `other` (pesos con licencia pendiente de confirmación); código `GPL-3.0-only` |
| Formato de pesos | ONNX (`models/policy_amp.onnx`) |
| Frecuencia de inferencia | 250 Hz |
| Entrada / salida | `obs` → `actions` |
| Robot objetivo | `rp1_24dof` (24 DOF) |
| Nivel de seguridad | `S2` |
| SHA256 de pesos | `f6e1e9959f6b75dcdd8b31a66dc4899bf59b39cff4ab945bc7f939ea8d3c4398` |
| Repositorio upstream | `Roboparty/roboparty_inference`, commit `ee9174c` |

## Arquitectura y entrenamiento

La información disponible indica únicamente que se trata de una política de marcha entrenada con AMP (Adversarial Motion Priors), un paradigma de aprendizaje por imitación en el que un discriminador aprende a distinguir transiciones de estado generadas por el agente de las provenientes de un dataset de movimiento de referencia, y la recompensa adversarial se combina con un objetivo de tarea (por ejemplo, seguir una velocidad de comando). No se especifica la topología de la red (MLP, transformer, etc.), el número de parámetros, la composición del dataset de referencia, el número de pasos de entrenamiento ni si se emplearon técnicas adicionales como domain randomization o curriculum learning.

No se han publicado detalles sobre el simulador utilizado, la distribución de observaciones (propriocepción, IMU, contactos), el espacio de acciones (posiciones articulares, pares o incrementos) ni las recompensas de tarea. Tampoco se documenta si el entrenamiento se realizó desde cero o mediante fine-tuning de una política previa. La única información verificable sobre el artefacto es su formato ONNX, su frecuencia de operación de 250 Hz y su integración en el pipeline de inferencia de Roboparty mediante el fichero `configs/amp.yaml`.

## Capacidades

- Generación de comandos de locomoción para el robot humanoide `rp1_24dof` con 24 grados de libertad, a partir de observaciones del propio robot.
- Marcha estable a 250 Hz, frecuencia adecuada para bucles de control de bajo nivel en robots articulados.
- Entrenamiento mediante AMP, orientado a producir movimientos naturales y estables en lugar de locomoción puramente optimizada por recompensa.
- Integración con la CLI `roboparty action` para instalación, verificación y rollback del artefacto.
- Compatibilidad declarada exclusivamente con la máquina `rp1_24dof`; no se garantiza con otros chasis o configuraciones de DOF.
- No dispone de capacidades de lenguaje, visión, tool calling, agentes ni razonamiento multi-paso; es un controlador de política motora.

## Casos de uso

- **Validación de locomoción en simulación**: ejecutar la política en el simulador de Roboparty para verificar que el robot `rp1_24dof` mantiene la marcha a 250 Hz antes de probar en hardware, usando el preview de acción si está disponible.
- **Piloto de despliegue en hardware controlado**: instalar el artefacto con `roboparty action install` en un entorno con soporte fiable, parada de emergencia accesible, limitación de corriente y feedback CAN operativo, y ejecutar la política con confirmación humana explícita dado el nivel de seguridad `S2`.
- **Banco de pruebas de integración de inferencia**: usar el ONNX como entrada para validar el pipeline `roboparty_inference` (carga de pesos, lectura de `configs/amp.yaml`, bucle a 250 Hz) sin necesidad de un modelo propio.
- **Referencia para entrenamiento de nuevas políticas AMP**: servir como artefacto base o comparativo al desarrollar políticas de marcha para el mismo chasis, aprovechando el hash SHA256 y el commit upstream para reproducibilidad.
- **Verificación de cadena de suministro de pesos**: emplear el SHA256 publicado (`f6e1e995...`) para auditar que el fichero ONNX instalado coincide con el artefacto verificado mediante `roboparty action verify`.
- **Rollback controlado en producción**: en un despliegue piloto, usar `roboparty action rollback` para revertir a una versión anterior si la política muestra comportamiento inestable en el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No se proporcionan métricas de recompensa, velocidad de marcha, estabilidad, tasa de caídas, error de seguimiento de trayectoria ni comparaciones en simulación o hardware real.

## Requisitos de hardware

- **VRAM estimada**: no disponible; el tamaño del modelo ONNX no se especifica y el repositorio figura con 0.0 GB, por lo que no es posible estimar requisitos de memoria.
- **GPU recomendadas**: no disponible. Al ser una política de control a 250 Hz, es plausible que pueda ejecutarse en CPU o en GPUs de gama baja, pero no se confirma en la información proporcionada.
- **Compatibilidad con GPU de consumo**: no disponible.
- **Opciones de despliegue**: runtime ONNX (ONNX Runtime) a través del pipeline `roboparty_inference`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- **Latencia y throughput**: la frecuencia objetivo es 250 Hz (periodo de 4 ms por ciclo de control), pero no se publican latencias medidas ni throughput real en hardware concreto.
- **Requisitos del robot**: chasis `rp1_24dof`, soporte fiable, parada de emergencia accesible, limitación de corriente de alimentación y feedback CAN operativo.

## Comparativa con modelos similares

| Modelo | Tipo | Robot objetivo | DOF | Frecuencia | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| RP1 24DOF AMP (este) | Política AMP | `rp1_24dof` | 24 | 250 Hz | ONNX | `other` (pendiente) | Hugging Face, piloto público |
| Políticas de locomoción de Unitree (p. ej. basadas en RL) | Política RL | chasis Unitree | variable | variable | varía (ONNX, TorchScript) | varía | parcialmente públicas |
| Políticas AMP de humanoides en investigación (p. ej. HumanoidVerse, AMP-for-Humanoid) | Política AMP | humanoides simulados | variable | variable | varía | académica | repos de investigación |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparativa se limita a características estructurales.

## Limitaciones y advertencias

- **Licencia de pesos pendiente**: la licencia de los pesos figura como `other` y el autor indica que está por confirmar; actualmente el artefacto se publica solo para validación pública. No debe asumirse uso comercial permitido.
- **Compatibilidad restringida**: solo se garantiza el funcionamiento con el chasis `rp1_24dof` y 24 DOF; no hay evidencia de transferencia a otras máquinas.
- **Nivel de seguridad S2**: la ejecución en hardware real requiere confirmación humana explícita, entorno despejado, soporte fiable, parada de emergencia accesible, limitación de corriente y feedback CAN operativo.
- **Preview no representativo**: si existe una previsualización de la acción, es de simulación y no refleja necesariamente el comportamiento en el robot físico.
- **Ausencia de benchmarks**: no hay métricas publicadas de estabilidad, velocidad o tasa de éxito, lo que impide evaluar su calidad frente a alternativas.
- **Falta de documentación de entrenamiento**: no se detallan datos, simulador, recompensas ni topología de red, lo que dificulta la reproducibilidad y el análisis de sesgos de comportamiento.
- **Riesgo de alucinación**: no aplica en el sentido lingüístico, pero sí existe riesgo de comportamientos no previstos (oscilaciones, caídas) fuera de la distribución de entrenamiento.
- **Estado de piloto**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño declarado es 0.0 GB, lo que sugiere que el artefacto puede no estar completamente subido o que los metadatos no reflejan el contenido real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/roboparty-action-rp1-24dof-amp
- Repositorio upstream de inferencia: `Roboparty/roboparty_inference` (commit `ee9174c`), ruta `robots/rp1_24dof/models/policy_amp.onnx`
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este artefacto concreto.
