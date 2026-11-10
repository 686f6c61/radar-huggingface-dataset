# wentywenty/roboparty-action-rp1-24dof-rough

## Resumen

RP1 24DOF Rough es una política de control motriz (locomoción) para un robot humanoide de la familia RP1 con 24 grados de libertad, publicada por el usuario wentywenty en Hugging Face bajo el pipeline de robótica. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un artefacto de inferencia en formato ONNX que mapea observaciones del robot (`obs`) a acciones de control (`actions`) a una frecuencia de 250 Hz, pensado para que el robot camine por terreno irregular o accidentado ("rough").

El modelo se distribuye a través del ecosistema de herramientas `roboparty` (comandos `roboparty action install/verify/rollback`), lo que indica que está empaquetado como una "acción" instalable sobre un robot físico concreto, la plataforma `rp1_24dof`. La model card lo clasifica con nivel de seguridad `S2`, lo que implica que su ejecución conlleva riesgos y requiere confirmación humana explícita, entorno despejado y medidas de seguridad activas (parada de emergencia accesible, limitación de corriente, retorno CAN operativo).

Su relevancia es acotada pero concreta: es un ejemplo de publicación reproducible de políticas de locomoción para humanoides, con hash SHA256 del peso declarado, trazabilidad a un repositorio upstream y un flujo de instalación/rollback definido. No obstante, el repositorio está en fase de pilotaje público, el tamaño es de 0.0 GB (no se detalla el peso real del archivo ONNX), la licencia de los pesos está pendiente de confirmación y no se han publicado benchmarks ni especificaciones de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control para robot humanoide, exportada a ONNX (detalles de la red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada `obs` de observaciones del robot; dimensión no disponible) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX, presumiblemente FP32; no confirmado) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | `other` (pesos con licencia pendiente de confirmación); código asociado GPL-3.0-only |
| Formato de pesos | ONNX (`models/policy_rough.onnx`) |

Datos adicionales de la model card: robot objetivo `rp1_24dof`, 24 DOF, nivel de seguridad `S2`, frecuencia de inferencia 250 Hz, entrada `obs`, salida `actions`, configuración de inferencia en `configs/rough.yaml`. SHA256 del peso: `0b85b97bd97af243e1704a10afc2f97c10c67dd617e1daed77163269d37f444d`. Upstream: `Roboparty/roboparty_inference`, ruta `robots/rp1_24dof/models/policy_rough.onnx`, commit `ee9174c`.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la red. La model card solo indica que la política se exporta a ONNX y que consume observaciones (`obs`) para producir acciones (`actions`) a 250 Hz, lo que es coherente con una política de control reactiva típica en robótica de locomoción (posiblemente una red tipo MLP o un transformer pequeño entrenado con aprendizaje por refuerzo), pero el autor no especifica la topología, el número de capas ni el número de parámetros.

Tampoco se documentan los datos de entrenamiento: no se indica el número de pasos de simulación, el simulador empleado, la composición de los terrenos irregulares, si hubo entrenamiento en simulación con transferencia a realidad (sim-to-real), ni si se aplicaron técnicas de dominio aleatorizado. La única información de procedencia es el repositorio upstream `Roboparty/roboparty_inference` y el commit `ee9174c`, junto con el hash SHA256 del archivo de pesos para verificación de integridad. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, etc.) sería especulativa y no se incluye.

## Capacidades

- Locomoción bípeda sobre terreno irregular ("rough") para el robot humanoide `rp1_24dof` con 24 grados de libertad.
- Inferencia en tiempo real a 250 Hz, adecuada para bucles de control de bajo nivel.
- Interfaz de observación a acción (`obs` → `actions`) compatible con el stack de inferencia `roboparty`.
- Instalación, verificación y rollback gestionados mediante la CLI `roboparty action`.
- Verificación de integridad del peso mediante SHA256 declarado.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües: es exclusivamente una política motriz.

## Casos de uso

- Locomoción en terreno accidentado en laboratorio: desplegar la política sobre un `rp1_24dof` real para validar la marcha en superficies no planas, usando el flujo `roboparty action install` y `verify` antes de habilitar el movimiento.
- Pruebas de transferencia sim-to-real: comparar el comportamiento de la política ONNX en simulación frente al robot físico, aprovechando que la model card advierte de que las previsualizaciones en simulación no representan el rendimiento real.
- Integración en pipelines de control a 250 Hz: usar el archivo `policy_rough.onnx` como nodo de inferencia dentro de un bucle de control que lea observaciones del bus CAN y emita consignas de articulación.
- Validación de seguridad de acciones S2: emplear el modelo como caso de prueba para protocolos de habilitación manual, parada de emergencia y limitación de corriente antes de autorizar movimientos de riesgo.
- Investigación en políticas de locomoción: servir como referencia reproducible (con hash y commit upstream) para comparar técnicas de control de humanoides de 24 DOF.
- Desarrollo de herramientas de despliegue robótico: probar los comandos de instalación, verificación y rollback del ecosistema `roboparty` con un artefacto real publicado en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del archivo ONNX no se detalla en la información proporcionada (el repositorio figura como 0.0 GB).
- GPU recomendadas: no disponible. Al ser una política de control a 250 Hz exportada a ONNX, es plausible que pueda ejecutarse en CPU o en GPU de gama baja, pero el autor no lo confirma.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: ONNX Runtime a través del stack `roboparty` (comando `roboparty action install`); otras opciones no documentadas.
- Latencia y throughput: la frecuencia de operación declarada es 250 Hz (periodo de 4 ms por ciclo de control); no se publican mediciones de latencia real ni throughput.
- Requisitos de plataforma física: robot `rp1_24dof`, bus CAN operativo, parada de emergencia accesible, limitación de corriente y soporte mecánico fiable.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de locomoción comparables ni datos de rendimiento que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia de los pesos pendiente de confirmación: el modelo se publica como `other` y la model card indica explícitamente que la licencia de los pesos está por confirmar y que actualmente solo se usa para validación pública. No debe asumirse uso comercial permitido.
- Nivel de seguridad `S2`: la acción se marca como de riesgo; solo debe ejecutarse tras despejar el entorno y con confirmación humana explícita.
- Instalar no equivale a habilitar: el movimiento requiere confirmación del usuario antes de ejecutarse.
- Solo se garantiza compatibilidad con el modelo de robot y el número de DOF declarados (`rp1_24dof`, 24 DOF); su uso en otra plataforma no está soportado.
- Las previsualizaciones en simulación, si existen, no representan el comportamiento en el robot real.
- No hay información sobre sesgos, tasas de alucinación (no aplica a un modelo de control) ni limitaciones idiomáticas (no aplica).
- Ausencia de benchmarks y de documentación de entrenamiento: no es posible evaluar su robustez o generalización antes de desplegarlo.
- Fase de pilotaje público: el artefacto puede cambiar o retirarse; se recomienda fijar la versión (`@v1.0.0`) y verificar el SHA256 antes de cada despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/roboparty-action-rp1-24dof-rough
- Repositorio upstream de inferencia: `Roboparty/roboparty_inference` (ruta `robots/rp1_24dof/models/policy_rough.onnx`, commit `ee9174c`); no se proporciona URL directa en la información disponible.
- Papers, blogs, demos y repositorios adicionales: no disponibles en la información proporcionada.
