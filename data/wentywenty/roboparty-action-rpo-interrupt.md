# wentywenty/roboparty-action-rpo-interrupt

## Resumen

RPO Interrupt es una política de control robótico distribuida como modelo ONNX dentro del ecosistema Roboparty. El modelo, publicado por el usuario `wentywenty`, implementa una política de acción orientada a la recuperación ante interrupciones y la resistencia a perturbaciones (抗扰动/中断恢复策略, según la model card original) para un robot humanoide de la familia `rpo` con 23 grados de libertad (DOF). No se trata de un modelo de lenguaje ni de un modelo generativo multimodal, sino de un artefacto de inferencia que mapea observaciones (`obs`) a acciones (`actions`) a una frecuencia de control de 250 Hz.

El modelo se enmarca en el pipeline de robótica de Hugging Face y se distribuye con la etiqueta de seguridad `S2`, lo que implica que su ejecución en hardware real requiere confirmación humana explícita, espacio despejado y protocolos de parada de emergencia operativos. La model card insiste en que la instalación no equivale a la habilitación del modelo y que las previsualizaciones, si existen, corresponden a simulación y no garantizan el comportamiento en el robot físico.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de pesos ONNX de un ecosistema propietario (Roboparty) con licencia de pesos aún sin confirmar, publicado como piloto abierto. No hay información sobre arquitectura interna, datos de entrenamiento ni benchmarks, por lo que la evaluación técnica debe ceñirse a los metadatos y a las condiciones de despliegue declaradas por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada `obs`, salida `actions`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa lenguaje natural) |
| Licencia | `other` para los pesos (pendiente de confirmación); código `GPL-3.0-only` |
| Formato de pesos | ONNX (`models/policy_interrupt.onnx`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la política. El artefacto distribuido es un grafo ONNX (`policy_interrupt.onnx`) que consume observaciones y produce acciones a 250 Hz, lo que sugiere una política de control reactiva de baja latencia. La model card no especifica si se trata de un perceptrón multicapa, una red recurrente, un transformer ligero u otra familia de modelos; tampoco detalla el paradigma de entrenamiento (aprendizaje por refuerzo, imitación, híbrido) ni la composición del dataset.

El nombre del modelo (`action-rpo-interrupt`) y la descripción "抗扰动/中断恢复" indican que el objetivo de entrenamiento es la robustez frente a perturbaciones externas y la recuperación tras interrupciones del movimiento. No se ha publicado información sobre número de tokens, episodios de entrenamiento, uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa y no está respaldada por la documentación disponible.

## Capacidades

- Generación de acciones de control para un robot humanoide de la familia `rpo` con 23 DOF.
- Recuperación ante interrupciones del movimiento (política de *interrupt recovery*).
- Resistencia a perturbaciones externas durante la ejecución de la política.
- Inferencia a 250 Hz, adecuada para bucles de control en tiempo real.
- Interfaz de entrada/salida basada en observaciones (`obs`) y acciones (`actions`).
- Distribución como artefacto ONNX portable, apto para ejecución con runtimes ONNX estándar.
- Integración con el CLI de Roboparty (`roboparty action install`, `verify`, `rollback`).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Control reactivo de un humanoide `rpo` en tareas de locomoción o manipulación que requieran corrección continua frente a empujes externos, aprovechando la frecuencia de 250 Hz para reaccionar en pocos milisegundos.
- Recuperación tras paradas de emergencia o interrupciones del movimiento: la política está diseñada explícitamente para reanudar una postura o marcha estable después de una interrupción, lo que la hace adecuada en entornos de laboratorio con paradas frecuentes.
- Validación en simulación antes de despliegue real: al ser un ONNX portable, puede cargarse en un simulador compatible con la interfaz `obs`/`actions` para verificar el comportamiento antes de habilitar el robot físico.
- Pruebas de robustez en banco de pruebas: útil para evaluar la tolerancia a perturbaciones controladas (empujes, cambios de carga) en un robot de 23 DOF con supervisión humana.
- Integración en pipelines de CI de robótica: el comando `roboparty action verify` permite validar la integridad del artefacto (incluido el SHA256 de los pesos) antes de desplegarlo en un robot.
- Rollback controlado en producción: el comando `roboparty action rollback` facilita revertir a una política anterior si la nueva versión muestra un comportamiento indeseado en pruebas supervisadas.
- Investigación en políticas de control robustas: sirve como referencia reproducible (pesos con hash público) para comparar estrategias de recuperación ante interrupciones en humanoides de 23 DOF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0.0 GB según los metadatos, lo que sugiere un artefacto de pesos muy pequeño, pero no se confirma el tamaño exacto del ONNX.
- GPU recomendadas: no disponibles. Al ser una política de control a 250 Hz, es plausible que se ejecute en CPU o en GPUs de gama baja, pero no hay datos que lo confirmen.
- ¿Cabe en GPU de consumo? No disponible. Dado el tamaño declarado del repositorio (0.0 GB), es probable que sí, pero no se puede afirmar sin el tamaño real del archivo ONNX.
- Opciones de despliegue: runtime ONNX estándar (ONNX Runtime), junto con el CLI de Roboparty (`roboparty action install/verify/rollback`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: la frecuencia de control declarada es de 250 Hz (periodo de 4 ms por ciclo de inferencia). No se especifican latencias medidas ni throughput en hardware concreto.
- Requisitos de seguridad: soporte mecánico fiable, parada de emergencia accesible, limitación de corriente de alimentación y retorno CAN operativo antes de habilitar el modelo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de la misma categoría (políticas de control para humanoides `rpo` de 23 DOF) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia de pesos sin confirmar: la model card indica explícitamente que la licencia de los pesos está pendiente y que el modelo se publica solo para validación pública. No debe asumirse uso comercial permitido.
- El código asociado se distribuye bajo `GPL-3.0-only`, lo que impone obligaciones de copyleft si se integra en un producto.
- Solo se garantiza compatibilidad con el modelo de robot `rpo` y 23 DOF; su uso en otras plataformas no está respaldado.
- Clasificación de seguridad `S2`: requiere confirmación humana tras despejar el área y no debe ejecutarse de forma autónoma sin supervisión.
- La instalación no habilita el modelo; se requiere confirmación explícita del usuario antes de la ejecución.
- Las previsualizaciones, si existen, son de simulación y no representan el comportamiento en el robot real.
- No hay información sobre sesgos, alucinación (no aplica en el sentido de modelos de lenguaje) ni limitaciones idiomáticas, al no ser un modelo de lenguaje.
- Riesgo operativo: cualquier fallo de la política en hardware real puede provocar movimientos inseguros; se exigen parada de emergencia, limitación de corriente y retorno CAN funcional.
- El SHA256 de los pesos (`357293a8ec940a818e205544d339c862f0e9fbd1d7a9f8bbdb3ad57c7a40d158`) permite verificar integridad, pero no sustituye una auditoría del comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/wentywenty/roboparty-action-rpo-interrupt
- Repositorio upstream referenciado: `Roboparty/roboparty_inference` (ruta `robots/rpo/models/policy_interrupt.onnx`, commit `ee9174c`); no se proporciona URL directa en la información disponible.
- Configuración de inferencia: `configs/interrupt.yaml` (incluida en el repositorio del modelo).
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
