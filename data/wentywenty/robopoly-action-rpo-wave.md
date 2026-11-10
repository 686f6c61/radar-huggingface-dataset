# wentywenty/robopoly-action-rpo-wave

## Resumen

RPO Wave es una política de control motriz (policy) para el robot humanoide `rpo` de Roboparty, publicada en Hugging Face por el usuario `wentywenty`. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo: es un artefacto de inferencia en formato ONNX que mapea observaciones (`obs`) a acciones (`actions`) a 250 Hz para ejecutar una animación concreta de saludo con la mano (wave). El repositorio pesa 0.0 GB, lo que indica que el binario es de tamaño reducido, coherente con una política de control entrenada para una tarea específica.

El modelo está etiquetado como `robotics`, `humanoid`, `onnx`, `action` y `rpo`, y su pipeline declarado es `robotics`. Se distribuye junto a un fichero de configuración de inferencia (`configs/wave.yaml`) y un fichero de datos de movimiento (`motions/wave.npz`), además del binario `models/policy_wave.onnx`. El robot objetivo declara 23 grados de libertad (DOF) y un nivel de seguridad `S1`.

La relevancia de esta ficha es limitada en el contexto de modelos de IA generativa: se trata de un ejemplo de publicación de artefactos de robótica en Hugging Face mediante el CLI `robopoly`, con un esquema de instalación, verificación y rollback, y con la licencia de los pesos aún pendiente de confirmación. Es útil como referencia de formato de distribución de políticas de control, no como modelo evaluable en tareas de NLP, visión o razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control motriz exportada a ONNX; no se especifica la arquitectura interna de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada `obs` → salida `actions`) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | `other` para los pesos (pendiente de confirmar); código `GPL-3.0-only` |
| Formato de pesos | ONNX (`models/policy_wave.onnx`) |
| Frecuencia de inferencia | 250 Hz |
| Robot objetivo | `rpo` (humanoide) |
| DOF | 23 |
| Nivel de seguridad | S1 |
| Entrada / salida | `obs` → `actions` |
| SHA256 de pesos | `d9134fc42cfa3c08267faa33b99145828c25630017f69ac6beec257a3c6a021f` |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la red neuronal que compone la política. El artefacto distribuido es un fichero ONNX (`policy_wave.onnx`) que implementa un mapeo directo de observaciones a acciones, ejecutado a 250 Hz. No se documentan el número de parámetros, las capas, el tipo de red (MLP, transformer, política recurrente u otra) ni el esquema de observaciones.

Tampoco se publican datos sobre el proceso de entrenamiento: no se indica el número de tokens, la composición del dataset, el uso de RLHF, DPO, aprendizaje por imitación, refuerzo o cualquier otra técnica. El paquete incluye un fichero `motions/wave.npz` que presumiblemente contiene los datos de movimiento asociados a la animación de saludo, pero su contenido y su papel exacto (referencia, replay o datos de entrenamiento) no se detallan. La procedencia declarada es el repositorio upstream `Roboparty/roboparty_inference`, ruta `robots/rpo/models/policy_wave.onnx`, commit `ee9174c`.

## Capacidades

- Ejecución de una animación concreta de saludo con la mano (wave) en el robot humanoide `rpo`.
- Inferencia a 250 Hz con entrada `obs` y salida `actions`.
- Integración con el CLI `robopoly` para instalación, verificación y rollback de la acción.
- Compatibilidad declarada exclusivamente con el modelo de robot `rpo` y 23 DOF.
- Clasificación de seguridad S1, con requisitos de confirmación humana antes de la ejecución.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Demostración de saludo en el humanoide `rpo`: la política ejecuta la animación `wave` a 250 Hz, adecuada para presentaciones públicas o demos de laboratorio donde se requiere un gesto de bienvenida controlado.
- Validación de la cadena de herramientas `robopoly`: instalación con `robopoly action install`, verificación con `robopoly action verify` y rollback con `robopoly action rollback`, útil para probar el flujo de distribución de acciones antes de desplegar políticas más críticas.
- Pruebas de integración hardware-software: sirve para comprobar que la lectura de `obs`, la escritura de `actions` y el bus CAN funcionan correctamente a 250 Hz en el robot `rpo`.
- Referencia de formato para publicar políticas de robótica en Hugging Face: el repositorio ejemplifica la estructura de ficheros (`models/`, `configs/`, `motions/`) y los metadatos necesarios (DOF, nivel de seguridad, SHA256).
- Entrenamiento de operadores en protocolos de seguridad: al estar marcada como S1, obliga a practicar el procedimiento de confirmación humana, soporte fiable, parada de emergencia accesible y limitación de corriente antes de ejecutar la acción.
- Pruebas en simulación: si existe una vista previa de simulación (el autor advierte que no representa el comportamiento real), puede emplearse para validar la carga del ONNX y el pipeline de inferencia sin riesgo físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y el binario ONNX es presumiblemente de tamaño reducido, pero no se publica el número de parámetros ni el tamaño exacto del fichero.
- GPU recomendadas: no disponibles. Al ser una política de control a 250 Hz, la latencia es crítica; no se especifica si la inferencia se ejecuta en CPU embebida, GPU o acelerador dedicado del robot.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el artefacto se distribuye como ONNX, por lo que es desplegable con ONNX Runtime u otros runtimes compatibles; el flujo oficial es el CLI `robopoly` (`robopoly action install`, `verify`, `rollback`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la frecuencia de operación declarada es 250 Hz (periodo de 4 ms por ciclo), pero no se publican medidas de latencia real ni de throughput en hardware concreto.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas de control para el humanoide `rpo` o para animaciones de saludo en humanoides de 23 DOF).

## Limitaciones y advertencias

- La licencia de los pesos está marcada como `other` y pendiente de confirmación; el autor indica que actualmente solo se usa para validación pública. No se garantiza su uso comercial.
- El código asociado se distribuye bajo `GPL-3.0-only`, lo que impone obligaciones de copyleft si se integra en productos derivados.
- Solo se garantiza compatibilidad con el modelo de robot `rpo` y 23 DOF; su uso en otro hardware no está soportado.
- Nivel de seguridad S1: requiere confirmación humana antes de la ejecución, soporte fiable, parada de emergencia accesible, limitación de corriente y feedback CAN correcto. No debe ejecutarse sin supervisión.
- La vista previa, si existe, es de simulación y no representa el comportamiento real en el robot físico.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas porque no es un modelo de lenguaje; estos criterios no aplican.
- No se publican métricas de éxito, robustez ante perturbaciones ni comportamiento ante fallos, lo que impide evaluar su fiabilidad en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-06; se trata de un artefacto reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/wentywenty/robopoly-action-rpo-wave
- Repositorio upstream declarado: `Roboparty/roboparty_inference` (ruta `robots/rpo/models/policy_wave.onnx`, commit `ee9174c`); no se proporciona URL directa en la información disponible.
