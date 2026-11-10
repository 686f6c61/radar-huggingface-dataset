# wentywenty/robopoly-action-rpo-interrupt

## Resumen

RPO Interrupt es una política de control robótico para el robot humanoide `rpo` de Roboparty, publicada por el usuario `wentywenty` en Hugging Face. Se trata de un modelo de acción (policy) orientado a la recuperación ante perturbaciones e interrupciones, empaquetado en formato ONNX y diseñado para ejecutarse a 250 Hz sobre un robot de 23 grados de libertad (DOF). No es un modelo de lenguaje ni un modelo generativo de propósito general: su función es mapear observaciones (`obs`) a acciones motoras (`actions`) para mantener el equilibrio y recuperarse de perturbaciones externas o interrupciones del movimiento.

El modelo se distribuye a través del sistema de paquetes `robopoly`, que permite instalar, verificar y revertir la política con comandos específicos. Está etiquetado con un nivel de seguridad `S2`, lo que implica que su ejecución requiere confirmación humana, espacio despejado y medidas de seguridad activas (parada de emergencia accesible, limitación de corriente, retroalimentación CAN operativa). Es, por tanto, un artefacto de robótica de laboratorio o validación, no un componente listo para producción autónoma.

La relevancia de esta ficha es limitada pero concreta: documenta un caso de política de control humanoide distribuida como artefacto versionado, con metadatos de seguridad explícitos y licencia de pesos pendiente de confirmación. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño es de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el contenido es mínimo. La información técnica disponible es escasa y procede exclusivamente de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control robótico, no se especifica la familia: transformer, MLP, etc.) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es un vector de observaciones `obs`) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | `other` para los pesos (pendiente de confirmación); código `GPL-3.0-only` |
| Formato de pesos | ONNX (`models/policy_interrupt.onnx`) |
| Frecuencia de inferencia | 250 Hz |
| Entrada / salida | `obs` → `actions` |
| Robot compatible | `rpo` (humanoide) |
| DOF | 23 |
| Nivel de seguridad | S2 |
| SHA256 de pesos | `357293a8ec940a818e205544d339c862f0e9fbd1d7a9f8bbdb3ad57c7a40d158` |
| Version | v1.0.0 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La model card no especifica si se trata de un transformer, una red MLP, una política de aprendizaje por refuerzo (el tag `rpo` podría sugerir *Reinforcement Policy Optimization* o similar, pero no se confirma) ni el número de parámetros. Tampoco se documentan los datos de entrenamiento, el número de tokens o episodios, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o aprendizaje por refuerzo clásico.

Lo único verificable es el formato de despliegue: un grafo ONNX llamado `policy_interrupt.onnx`, acompañado de un fichero de configuración `configs/interrupt.yaml`, que se ejecuta a 250 Hz y consume observaciones para producir acciones. La política está etiquetada como de "抗扰动/中断恢复" (recuperación ante perturbaciones e interrupciones), lo que indica que su objetivo es la robustez frente a empujones, interrupciones de trayectoria o fallos parciales del control. No hay información sobre innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Generación de acciones motoras para un robot humanoide `rpo` de 23 DOF a partir de observaciones (`obs`).
- Recuperación ante perturbaciones externas (empujones, desplazamientos) y ante interrupciones del movimiento.
- Control a 250 Hz, adecuado para bucles de control de tiempo real en robótica.
- Integración con el sistema de paquetes `robopoly` mediante comandos de instalación, verificación y rollback.
- Ejecución en formato ONNX, lo que facilita el despliegue con runtimes de inferencia estándar (ONNX Runtime, TensorRT, etc.).
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión, audio ni modo de razonamiento.

## Casos de uso

- **Recuperación ante empujones en laboratorio**: la política se ejecuta a 250 Hz sobre el robot `rpo` para corregir la postura tras una perturbación externa. Es adecuada porque su función declarada es precisamente la recuperación ante perturbaciones, y la frecuencia de 250 Hz permite correcciones rápidas.
- **Reanudación tras interrupción de trayectoria**: cuando una secuencia de movimiento se interrumpe (por parada de seguridad parcial o fallo de comunicación), la política puede devolver al robot a una postura estable. El nivel de seguridad S2 obliga a confirmación humana antes de reanudar.
- **Validación de políticas en simulación**: la model card menciona que las previsualizaciones pueden ser de simulación; el modelo puede usarse para comparar el comportamiento simulado frente al real antes de habilitar el movimiento en hardware.
- **Pruebas de integración del stack `robopoly`**: sirve como artefacto de prueba para los comandos `install`, `verify` y `rollback` del sistema de paquetes, verificando el flujo completo de distribución de políticas.
- **Investigación en control robusto de humanoides**: investigadores que trabajen en recuperación ante perturbaciones pueden usar esta política como línea base o punto de comparación, siempre que respeten la licencia pendiente de confirmación.
- **Despliegue en entornos controlados con parada de emergencia**: en un banco de pruebas con soporte fiable, limitación de corriente y retroalimentación CAN operativa, la política puede ejecutarse para evaluar su comportamiento real, con un operario presente para confirmar cualquier acción de riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Al ser un modelo ONNX de política de control y con un repositorio de 0.0 GB, es probable que el peso sea muy reducido y quepa en CPU o en GPUs de gama baja, pero no se confirma.
- **GPU recomendadas**: no disponible. Para inferencia a 250 Hz se requeriría un runtime de baja latencia; opciones típicas serían ONNX Runtime con ejecución en CPU de gama alta o GPU embebida (Jetson Orin, por ejemplo), pero no se documenta.
- **Compatibilidad con GPU de consumo**: no disponible.
- **Opciones de despliegue**: ONNX Runtime (formato nativo), potencialmente TensorRT u otros runtimes compatibles con ONNX. El sistema `robopoly` gestiona la instalación y verificación.
- **Latencia y throughput**: la frecuencia objetivo es 250 Hz (periodo de 4 ms), pero no se documentan latencias medidas ni throughput real.

## Comparativa con modelos similares

No disponible. No se conocen en la información proporcionada modelos comparables de política de control para el robot `rpo` ni alternativas directas publicadas con las mismas características (23 DOF, recuperación ante perturbaciones, ONNX, 250 Hz).

## Limitaciones y advertencias

- **Licencia de pesos pendiente de confirmación**: la model card indica explícitamente que la licencia de los pesos está por confirmar y que actualmente solo se usa para validación pública. No debe asumirse uso comercial.
- **Nivel de seguridad S2**: las acciones marcadas como S2 requieren confirmación humana y espacio despejado. La instalación no equivale a habilitación; el usuario debe confirmar antes de ejecutar.
- **Requisitos de seguridad física**: se exige soporte fiable, parada de emergencia accesible, limitación de corriente y retroalimentación CAN operativa. Sin estas condiciones, la ejecución es insegura.
- **Compatibilidad limitada**: solo se garantiza compatibilidad con el modelo de robot `rpo` y 23 DOF. No se debe usar en otras plataformas.
- **Previsualizaciones no representativas**: las previsualizaciones, si existen, pueden ser de simulación y no reflejan el comportamiento en hardware real.
- **Riesgo de alucinación**: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones incorrectas o inestables en condiciones no cubiertas por el entrenamiento.
- **Información técnica insuficiente**: no se documentan arquitectura, parámetros, datos de entrenamiento ni benchmarks, lo que impide evaluar su robustez de forma independiente.
- **Repositorio sin tracción**: 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [Hugging Face: wentywenty/robopoly-action-rpo-interrupt](https://huggingface.co/wentywenty/robopoly-action-rpo-interrupt)
- Upstream referenciado en la model card: `Roboparty/roboparty_inference`, ruta `robots/rpo/models/policy_interrupt.onnx`, commit `ee9174c` (no se proporciona URL directa)
