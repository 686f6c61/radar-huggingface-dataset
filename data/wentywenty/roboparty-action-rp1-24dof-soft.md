# wentywenty/roboparty-action-rp1-24dof-soft

## Resumen

RP1 24DOF Soft es una política de control motriz (policy) para el robot humanoide `rp1_24dof` de Roboparty, publicada en Hugging Face por el usuario `wentywenty`. No es un modelo de lenguaje ni un modelo generativo multimodal: es un artefacto de inferencia en formato ONNX que mapea observaciones (`obs`) del robot a acciones (`actions`) a una frecuencia de 250 Hz. Su propósito es producir una marcha suave ("柔顺步态", marcha compliant) en el robot de 24 grados de libertad, dentro del ecosistema de despliegue `roboparty action` (instalación, verificación y rollback de políticas).

El repositorio es de tamaño prácticamente nulo (0.0 GB reportados), lo que encaja con un único fichero ONNX de política ligera más un fichero de configuración YAML. La model card está mayoritariamente en chino y describe el flujo de instalación mediante la CLI de Roboparty, así como los requisitos de seguridad previos a la ejecución (soporte fiable, parada de emergencia accesible, limitación de corriente, realimentación CAN operativa). La política está clasificada con nivel de seguridad `S2`, lo que implica que su ejecución requiere confirmación humana tras despejar el entorno.

Su relevancia es acotada pero concreta: sirve como ejemplo de distribución de políticas de control para robótica humanoide a través de Hugging Face, con trazabilidad de origen (commit `ee9174c` del repositorio `Roboparty/roboparty_inference`) y verificación por hash SHA256. No se dispone de información sobre arquitectura interna, datos de entrenamiento ni métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control en ONNX; no se documenta la red subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | `other` para los pesos (pendiente de confirmación); código `GPL-3.0-only` |
| Formato de pesos | ONNX (`models/policy_soft.onnx`) + configuración YAML (`configs/soft.yaml`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la política. El artefacto distribuido es un grafo ONNX que consume un vector de observaciones (`obs`) y produce un vector de acciones (`actions`) a 250 Hz, diseñado específicamente para el robot `rp1_24dof` con 24 grados de libertad. No se documenta si se trata de una red MLP, un transformer ligero, una política entrenada por refuerzo (RL) o imitación, ni el número de parámetros.

Tampoco se publican datos sobre el proceso de entrenamiento: ni número de tokens o episodios, ni composición del dataset, ni si hubo aprendizaje por refuerzo, imitación o ajuste fino. La model card únicamente indica la procedencia del fichero (ruta `robots/rp1_24dof/models/policy_soft.onnx` en el repositorio upstream `Roboparty/roboparty_inference`, commit `ee9174c`) y el hash SHA256 de los pesos (`449c352f8bf013e22b175c0cd55724cfb8821b4061e0ccfcf2adb1575a1c7794`), lo que permite verificar integridad pero no inferir nada sobre el diseño del modelo.

## Capacidades

- Generación de acciones de control articular para el robot humanoide `rp1_24dof` (24 DOF) a partir de observaciones.
- Ejecución de una política de marcha suave ("soft") a 250 Hz, adecuada para control en tiempo real.
- Integración con la CLI de Roboparty mediante `roboparty action install`, `verify` y `rollback`.
- Compatibilidad declarada exclusivamente con el modelo de robot `rp1_24dof` y 24 DOF.
- Clasificación de seguridad `S2`, con requisitos de confirmación humana antes de la ejecución.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo thinking: es una política de control motriz, no un modelo de lenguaje.

## Casos de uso

- Despliegue de marcha suave en el humanoide `rp1_24dof`: instalar la política con `roboparty action install` y ejecutarla a 250 Hz para obtener una locomoción compliant; es adecuada porque el artefacto está empaquetado específicamente para ese modelo y frecuencia.
- Validación en banco de pruebas antes de operación real: usar `roboparty action verify` para comprobar integridad del paquete y el hash de los pesos antes de habilitar el robot.
- Pruebas de integración en el ecosistema Roboparty: emplear la política como referencia para verificar que el pipeline de inferencia (`Roboparty/roboparty_inference`) funciona correctamente con políticas ONNX.
- Demostraciones controladas en entorno despejado: ejecutar la política con parada de emergencia accesible y limitación de corriente, dado que está marcada como `S2` y requiere confirmación humana.
- Rollback ante comportamiento anómalo: revertir a una versión anterior mediante `roboparty action rollback` si la marcha no cumple las expectativas en pruebas.
- Investigación sobre distribución de políticas robóticas: estudiar el formato de empaquetado (ONNX + YAML + metadatos de origen y hash) como patrón para publicar y versionar políticas de control en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de seguimiento de trayectoria, estabilidad, consumo energético ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere una política muy ligera, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño aparente del artefacto, es plausible que se ejecute en CPU o en hardware embebido, pero no está documentado.
- Opciones de despliegue: runtime ONNX (el propio ecosistema `roboparty action` / `Roboparty/roboparty_inference`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: la política está diseñada para 250 Hz, lo que implica un presupuesto de 4 ms por ciclo; no se publican mediciones reales de latencia.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas comparables para el mismo robot o para humanoides de 24 DOF con las que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia de los pesos sin confirmar: la model card indica explícitamente que la licencia de los pesos está pendiente y que el uso actual es solo para validación pública; no debe asumirse uso comercial.
- El código asociado es `GPL-3.0-only`, lo que impone obligaciones de copyleft si se integra o redistribuye.
- Compatibilidad garantizada únicamente con el modelo `rp1_24dof` y 24 DOF; su uso en otro hardware no está respaldado.
- Clasificación de seguridad `S2`: requiere soporte fiable, parada de emergencia accesible, limitación de corriente y realimentación CAN operativa; la ejecución debe confirmarla un humano tras despejar el entorno.
- Las previsualizaciones, si existen, pueden ser de simulación y no representan el comportamiento en el robot real.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no es un modelo de lenguaje; esos criterios no aplican.
- Ausencia total de métricas de rendimiento publicadas: no es posible evaluar la calidad de la marcha sin pruebas en banco o simulación.
- Repositorio sin descargas ni likes y con fecha de creación futura respecto a la información habitual, lo que sugiere un artefacto de publicación muy reciente o de carácter experimental.

## Enlaces

- Hugging Face: https://huggingface.co/wentywenty/roboparty-action-rp1-24dof-soft
- Repositorio upstream citado: `Roboparty/roboparty_inference` (ruta `robots/rp1_24dof/models/policy_soft.onnx`, commit `ee9174c`); no se proporciona URL directa en la información disponible.
- Paper, blog, demo o repositorio adicional: no disponible.
