# wentywenty/roboparty-action-rp1-24dof-interrupt

## Resumen

RP1 24DOF Interrupt es una política de control robótico publicada en Hugging Face por el usuario wentywenty bajo el paraguas del proyecto Roboparty. Se trata de un modelo de acción (policy) en formato ONNX diseñado específicamente para el robot humanoide `rp1_24dof`, un androide de 24 grados de libertad. Su función concreta es la recuperación ante perturbaciones e interrupciones: gestiona la respuesta del robot cuando sufre un empujón, una pérdida momentánea de equilibrio o una interrupción en la ejecución de una tarea motora.

El modelo no es un modelo de lenguaje ni un sistema multimodal generativo, sino un controlador de extremo a extremo que transforma observaciones del estado del robot (`obs`) en comandos de articulación (`actions`) a una frecuencia de 250 Hz. Esta frecuencia de inferencia es notablemente alta para un policy neuronal y condiciona por completo sus requisitos de despliegue: exige latencias de milisegundos y hardware de inferencia dedicado, no un servidor convencional.

La relevancia del modelo radica en su carácter de pieza de seguridad dentro de una arquitectura de control jerárquica. Está etiquetado con nivel de seguridad `S2`, lo que implica que su ejecución requiere confirmación humana y condiciones de entorno controladas. El repositorio se encuentra en fase de pilotaje público, con la licencia de los pesos aún sin confirmar, lo que limita por ahora su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de control, exportada a ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada `obs`, salida `actions`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | `other` (código GPL-3.0-only; pesos pendientes de confirmación) |
| Formato de pesos | ONNX (`models/policy_interrupt.onnx`) |
| Frecuencia de inferencia | 250 Hz |
| Robot objetivo | `rp1_24dof` (24 DOF) |
| Nivel de seguridad | S2 |
| Entrada / salida | `obs` → `actions` |
| Configuración de inferencia | `configs/interrupt.yaml` |
| SHA256 de pesos | `49c8f6d308c1ba662333a3342b9a8aff2ce87755c27da99131865f91d205e8e4` |
| Commit upstream | `ee9174c` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal. Se sabe que el modelo se distribuye como grafo ONNX (`policy_interrupt.onnx`), lo que permite su ejecución con runtimes de inferencia estándar (ONNX Runtime, TensorRT) sin depender del framework original de entrenamiento. La política mapea directamente observaciones del robot a acciones articulares, un esquema típico de control reactivo de extremo a extremo propio del aprendizaje por refuerzo o de la imitación en robótica humanoide.

No se han publicado datos sobre el conjunto de entrenamiento, el número de tokens o episodios, la composición del dataset, ni si se emplearon técnicas de RL (PPO, SAC) o de imitación (behavior cloning, diffusion policy). Tampoco se especifica si la política incorpora memoria recurrente o si es puramente feedforward sobre el estado actual. Lo que sí se documenta es el origen: el modelo proviene del repositorio upstream `Roboparty/roboparty_inference`, en la ruta `robots/rp1_24dof/models/policy_interrupt.onnx`, y se distribuye como artefacto versionado dentro del ecosistema Roboparty.

La innovación destacable no está en la arquitectura de red sino en el mecanismo operativo: la política está diseñada explícitamente para la recuperación ante interrupciones, es decir, para devolver al robot a un estado estable tras una perturbación externa. El nivel de seguridad S2 y la exigencia de confirmación humana antes de la ejecución son parte integral del diseño del artefacto.

## Capacidades

- Control reactivo de un robot humanoide de 24 grados de libertad a 250 Hz.
- Recuperación ante perturbaciones externas (empujones, desequilibrios) mediante una política dedicada de interrupt.
- Gestión de interrupciones en la ejecución de tareas motoras en curso.
- Inferencia portable vía ONNX, ejecutable con runtimes estándar sin el stack de entrenamiento.
- Integración con el ecosistema Roboparty mediante comandos de instalación, verificación y rollback (`roboparty action install/verify/rollback`).
- Versionado semántico del artefacto (`@v1.0.0`) y verificación de integridad por SHA256.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Recuperación de equilibrio en humanoides: la política se invoca cuando el robot detecta una perturbación y devuelve comandos articulares a 250 Hz para restablecer la postura estable, aprovechando su diseño específico para este escenario.
- Interrupción segura de tareas motoras: si una tarea en ejecución debe abortarse (por proximidad de personas, fallo de sensor o parada de emergencia), la política gestiona la transición desde la trayectoria activa hasta una pose segura.
- Validación en simulación previa a despliegue: el artefacto ONNX puede cargarse en un simulador del modelo `rp1_24dof` para comprobar el comportamiento de la política antes de autorizar su ejecución en hardware real, dado que la model card advierte que las previsualizaciones son de simulación.
- Banco de pruebas de robustez: investigadores pueden someter al robot a perturbaciones controladas y medir la capacidad de recuperación de la política, comparándola con otros controladores del mismo robot.
- Integración en pipelines de control jerárquico: la política actúa como capa reactiva de bajo nivel por debajo de un planificador de tareas de alto nivel, recibiendo observaciones y emitiendo acciones a la frecuencia requerida.
- Auditoría de seguridad en despliegues industriales: el marcado S2, el SHA256 de pesos y el mecanismo de rollback permiten trazar qué versión de la política está activa en cada robot y revertir a una versión anterior si se detecta un comportamiento anómalo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al desconocerse el número de parámetros y el tamaño del grafo ONNX, no puede estimarse el consumo de memoria.
- GPU recomendadas: no disponibles. La frecuencia de 250 Hz exige latencias de 4 ms por inferencia, lo que en la práctica apunta a GPUs de gama embedded o industrial (Jetson Orin, por ejemplo) o a aceleradores dedicados; no obstante, esta apreciación no está confirmada por el autor.
- Compatibilidad con GPU de consumo: no confirmada. Depende del tamaño real del modelo, que no se documenta.
- Opciones de despliegue: ONNX Runtime o TensorRT como runtimes de inferencia; la instalación se gestiona mediante el CLI de Roboparty (`roboparty action install`).
- Latencia y throughput: el único dato publicado es la frecuencia objetivo de 250 Hz (periodo de 4 ms). No se especifican latencias medidas ni throughput real en hardware concreto.
- Requisitos de seguridad del entorno: soporte fiable, parada de emergencia accesible, limitación de corriente en la alimentación y realimentación CAN operativa antes de habilitar el modelo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de política para el robot `rp1_24dof` ni políticas de recuperación ante perturbaciones comparables en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia de los pesos sin confirmar: la model card indica explícitamente que la licencia de los pesos está pendiente y que el artefacto se destina por ahora solo a validación pública. El uso comercial no está autorizado de forma clara.
- Compatibilidad restringida: solo se garantiza el funcionamiento con el modelo de robot `rp1_24dof` y 24 DOF. No debe asumirse portabilidad a otras plataformas.
- Nivel de seguridad S2: la ejecución requiere confirmación humana explícita y condiciones de entorno controladas (soporte fiable, parada de emergencia accesible, limitación de corriente, CAN operativo).
- Instalar no equivale a habilitar: el flujo de Roboparty separa instalación y habilitación, y la habilitación debe confirmarla el usuario.
- Previsualizaciones engañosas: cualquier preview disponible puede ser de simulación y no representa el comportamiento en el robot real.
- Sin datos de entrenamiento ni de evaluación: no se publican métricas de robustez, tasas de recuperación ni comportamiento ante perturbaciones de distinta magnitud, lo que impide evaluar su fiabilidad objetivamente.
- Sin información sobre sesgos ni alucinación en el sentido habitual: al no ser un modelo generativo, estos riesgos no aplican, pero sí existe el riesgo de comportamiento motor impredecible fuera de las condiciones de entrenamiento.
- Repositorio en fase de pilotaje: con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/roboparty-action-rp1-24dof-interrupt
- Repositorio upstream de inferencia: `Roboparty/roboparty_inference` (commit `ee9174c`), referencia citada en la model card
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales relevantes para este modelo.
