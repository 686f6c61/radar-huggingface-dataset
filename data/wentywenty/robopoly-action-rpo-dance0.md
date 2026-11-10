# wentywenty/robopoly-action-rpo-dance0

## Resumen

RPO Dance 0 es una política de control motriz para el robot humanoide `rpo`, distribuida como un paquete de acción dentro del ecosistema Robopoly. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general, sino de una política entrenada para ejecutar una secuencia de baile sobre un robot físico de 23 grados de libertad (DOF). El artefacto principal es un grafo ONNX (`models/policy_dance0.onnx`) que mapea observaciones (`obs`) a acciones (`actions`) a una frecuencia de control de 250 Hz.

El modelo lo publica el usuario `wentywenty` en Hugging Face bajo el pipeline `robotics`, con etiquetas que lo identifican como acción (`action`), política RPO y variante de baile (`dance0`). El repositorio tiene un tamaño de 0,0 GB según los metadatos, lo que sugiere que los pesos no están alojados directamente en el repo o que el tamaño reportado no es fiable; la model card referencia un fichero ONNX y un fichero de movimiento `motions/dance0.npz`.

Su relevancia es acotada pero concreta: ejemplifica el patrón de distribución de políticas robóticas como paquetes versionados con verificación, instalación y rollback mediante una CLI (`robopoly action install/verify/rollback`). La licencia de los pesos está pendiente de confirmar y el autor lo declara explícitamente como un piloto público de validación, no como un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política de control motriz exportada a ONNX (no se especifica la arquitectura interna de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de texto) |
| Licencia | código GPL-3.0-only; pesos `other` (pendiente de confirmar) |
| Formato de pesos | ONNX (`models/policy_dance0.onnx`) |

Otros datos técnicos declarados en la model card:

| Parametro | Valor |
|---|---|
| Robot objetivo | `rpo` |
| Grados de libertad (DOF) | 23 |
| Nivel de seguridad | S2 |
| Frecuencia de control | 250 Hz |
| Entrada / salida | `obs` → `actions` |
| Configuración de inferencia | `configs/dance0.yaml` |
| Datos de movimiento | `motions/dance0.npz` |
| Upstream | `Roboparty/roboparty_inference`, ruta `robots/rpo/models/policy_dance0.onnx`, commit `ee9174c` |
| SHA256 de pesos | `a7ecbeeaa8484faf3e169fecfcd1d8c4d64afa88fc43610bd544a70c6e3d30ea` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal: solo se sabe que la política se exporta a formato ONNX y que consume observaciones para producir acciones a 250 Hz. No se especifican el número de capas, el tipo de encoder, si emplea aprendizaje por refuerzo, imitación de movimiento (motion capture retargeting) o una combinación. El nombre `rpo` y la etiqueta `rpo` en los tags apuntan a una política de control para el robot RPO, pero no se documenta el algoritmo de entrenamiento ni el volumen de datos.

Lo que sí está documentado es el pipeline de empaquetado: el artefacto procede del repositorio upstream `Roboparty/roboparty_inference`, en la ruta `robots/rpo/models/policy_dance0.onnx`, con un commit concreto (`ee9174c`) y un hash SHA256 de pesos verificable. El paquete incluye además una configuración de inferencia (`configs/dance0.yaml`) y los datos de movimiento asociados (`motions/dance0.npz`), lo que sugiere que la política se apoya en una secuencia de referencia de baile. No hay información sobre RLHF, DPO ni sobre innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de artefacto.

## Capacidades

- Ejecución de una secuencia de baile predefinida (`dance0`) sobre el robot humanoide `rpo` de 23 DOF.
- Control motriz a 250 Hz mediante inferencia ONNX, con entrada de observaciones y salida de acciones.
- Integración con el gestor de acciones Robopoly: instalación, verificación y rollback versionados.
- Verificación de integridad de pesos mediante SHA256 declarado.
- Clasificación de seguridad S2, que exige confirmación humana y condiciones de entorno controladas antes de la ejecución.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modo de pensamiento; no es un modelo de lenguaje.

## Casos de uso

- Validación de pipeline de despliegue robótico: usar el paquete para probar el flujo completo `install` → `verify` → ejecución → `rollback` en un robot `rpo` de laboratorio, comprobando que la verificación SHA256 y la configuración YAML se aplican correctamente antes de liberar políticas propias.
- Demostración de baile en ferias o eventos: ejecutar `dance0` como animación pregrabada sobre el humanoide, siempre con área despejada, soporte fiable y parada de emergencia accesible, dado el nivel de seguridad S2.
- Pruebas de integración de control a 250 Hz: medir latencia y estabilidad del bucle de inferencia ONNX en el hardware del robot, comparando la frecuencia real con la nominal declarada.
- Referencia para entrenamiento de nuevas políticas: emplear `motions/dance0.npz` y `configs/dance0.yaml` como plantilla de estructura de datos de movimiento y configuración para desarrollar variantes de baile propias.
- Verificación de compatibilidad de modelo y robot: comprobar que la política solo se carga en la variante `rpo` con 23 DOF, evitando despliegues accidentales en otras plataformas.
- Docencia e investigación en robótica humanoide: usar el paquete como ejemplo reproducible de distribución de políticas con licencia dual (código GPL-3.0-only, pesos por confirmar) y con trazabilidad de commit y hash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del grafo ONNX no se declara y el tamaño del repo figura como 0,0 GB, por lo que no se puede estimar con fiabilidad.
- GPU recomendadas: no disponible. Al ser una política de control a 250 Hz, el requisito crítico es la latencia determinista del bucle de control más que la capacidad de cómputo; no se documenta hardware de referencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: inferencia ONNX (runtime no especificado) a través de la CLI `robopoly action`, con configuración `configs/dance0.yaml`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: se declara una frecuencia de control de 250 Hz (periodo de 4 ms), pero no se publican medidas reales de latencia ni de throughput en el hardware objetivo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de acción para el robot `rpo` ni modelos comparables de la misma categoría (políticas de baile para humanoides de 23 DOF) con parámetros, contexto o rendimiento publicados.

## Limitaciones y advertencias

- Licencia de pesos pendiente de confirmación: el autor indica explícitamente que los pesos usan licencia `other` y que actualmente solo se destinan a validación pública. No debe asumirse uso comercial.
- El código se distribuye bajo GPL-3.0-only, lo que impone obligaciones de copyleft si se integra en un producto.
- Solo se garantiza compatibilidad con el robot `rpo` de 23 DOF; su uso en otras plataformas no está soportado.
- Nivel de seguridad S2: requiere confirmación humana antes de habilitar el movimiento, soporte fiable, parada de emergencia accesible, limitación de corriente y retorno CAN correcto. Los movimientos de riesgo solo deben ejecutarse con el área despejada.
- Las previsualizaciones, si existen, son de simulación y no representan el comportamiento en el robot real.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no es un modelo de lenguaje; esos criterios no aplican.
- El paquete está en fase de piloto público; no se documentan pruebas de robustez ante perturbaciones, fallos de comunicación o cambios de terreno.
- El tamaño del repositorio reportado (0,0 GB) no permite verificar la integridad de la distribución; conviene comprobar el SHA256 declarado tras la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/robopoly-action-rpo-dance0
- Repositorio upstream citado: `Roboparty/roboparty_inference` (ruta `robots/rpo/models/policy_dance0.onnx`, commit `ee9174c`); no se proporciona URL directa en la información disponible.
