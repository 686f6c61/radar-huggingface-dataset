# wentywenty/roboparty-action-rp1-24dof-default

## Resumen

RP1 24DOF Default es una política de control motriz (policy) para el robot humanoide `rp1_24dof`, publicada por el usuario wentywenty en Hugging Face bajo el ecosistema Roboparty. No es un modelo de lenguaje: es un artefacto de inferencia en formato ONNX que mapea observaciones (`obs`) a acciones (`actions`) a una frecuencia de 250 Hz, pensado para ejecutar una marcha por defecto en un humanoide de 24 grados de libertad. Su función es proporcionar un controlador de locomoción listo para desplegar sobre el hardware declarado.

El modelo se distribuye a través de la herramienta de línea de comandos `roboparty`, que permite instalar, verificar y revertir la política sobre el robot. La model card lo clasifica con nivel de seguridad `S2`, lo que implica que su ejecución requiere confirmación humana explícita, soporte fiable, parada de emergencia accesible, limitación de corriente en la alimentación y realimentación CAN operativa. La instalación no habilita el movimiento por sí sola.

La relevancia de este artefacto es acotada: se trata de un piloto público de Hugging Face con cero descargas y cero likes en el momento de la consulta, con la licencia de los pesos aún sin confirmar y con la advertencia explícita de que las previsualizaciones, si existen, corresponden a simulación y no garantizan el comportamiento en el robot físico. Es útil como referencia de formato y de flujo de despliegue para políticas de control en humanoides, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control motriz exportada a ONNX; no se documenta la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de robótica, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye un único artefacto ONNX) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | `other` para los pesos (pendiente de confirmación); código `GPL-3.0-only` |
| Formato de pesos | ONNX (`models/policy.onnx`) |
| Entrada / salida | `obs` → `actions` |
| Frecuencia de inferencia | 250 Hz |
| Grados de libertad (DOF) | 24 |
| Modelo de robot | `rp1_24dof` |
| Nivel de seguridad | `S2` |
| Configuración de inferencia | `configs/default.yaml` |
| SHA256 de pesos | `00f24b03bde6442940fe4f13c4a03c622a2378b0e416b574e4a9567480cbe7fb` |
| Commit upstream | `ee9174c` |
| Tamaño del repo | 0.0 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la política: la model card no especifica si se trata de un perceptrón multicapa, una red recurrente, un transformer o una política entrenada por aprendizaje por refuerzo, ni detalla el número de parámetros, las capas o las funciones de activación. El único dato estructural es el contrato de entrada y salida: el modelo consume un vector de observaciones `obs` y produce un vector de acciones `actions` a 250 Hz, con 24 grados de libertad en el robot objetivo.

Tampoco se documentan los datos de entrenamiento, el número de pasos de simulación, la composición del dataset, ni si se emplearon técnicas de RL, imitación o currículo. La política proviene del repositorio upstream `Roboparty/roboparty_inference`, en la ruta `robots/rp1_24dof/models/policy.onnx`, commit `ee9174c`. No se describe ninguna innovación técnica destacable (decodificación especulativa, atención lineal, etc.) porque el artefacto es una política de control, no un modelo generativo.

## Capacidades

- Generación de acciones de control motriz para un humanoide de 24 DOF a partir de observaciones, a 250 Hz.
- Ejecución de una marcha por defecto (`default`) sobre el modelo de robot `rp1_24dof`.
- Integración con el flujo de herramientas `roboparty` para instalación, verificación y rollback de la política.
- Compatibilidad declarada únicamente con el modelo de robot y el número de DOF especificados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Puesta en marcha de un humanoide `rp1_24dof` en laboratorio: instalar la política con `roboparty action install` y verificar su integridad con `roboparty action verify` antes de habilitar el movimiento, usando la marcha por defecto como comportamiento base.
- Validación de la cadena de control: comprobar a 250 Hz que el pipeline de observaciones (`obs`) y acciones (`actions`) responde correctamente antes de sustituir la política por un controlador propio.
- Referencia de formato para desarrolladores de robótica: usar el par `policy.onnx` + `configs/default.yaml` como plantilla para empaquetar y distribuir políticas de control en el ecosistema Roboparty.
- Pruebas de integración de seguridad: ejercitar el flujo de confirmación humana, parada de emergencia y limitación de corriente exigido por el nivel `S2` con una política conocida y de comportamiento acotado.
- Rollback controlado en producción: emplear `roboparty action rollback` para revertir a esta política por defecto si una política experimental falla en el robot.
- Docencia y demostración de despliegue de políticas: ilustrar el ciclo instalar-verificar-ejecutar-revertir sobre hardware real con un artefacto de tamaño reducido (repo de 0.0 GB).
- Comparación de políticas en simulación: servir como línea base de marcha por defecto frente a políticas propias, siempre que se respete la advertencia de que la previsualización simulada no representa el comportamiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB y el artefacto es un único ONNX, por lo que la huella en memoria es presumiblemente muy reducida, pero no se publica cifra alguna.
- GPU recomendadas: no disponible; el modelo no documenta requisitos de aceleración.
- Compatibilidad con GPU de consumo: no disponible; no se especifica.
- Opciones de despliegue: el canal previsto es la CLI `roboparty` (`action install`, `action verify`, `action rollback`), que ejecuta el ONNX a 250 Hz sobre el robot `rp1_24dof`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: la única cifra publicada es la frecuencia de operación de 250 Hz (periodo de 4 ms por ciclo de inferencia); no se detallan latencias reales ni throughput medido.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye políticas de control comparables para el mismo robot o para humanoides de 24 DOF, ni datos de rendimiento que permitan establecer una comparación con alternativas.

## Limitaciones y advertencias

- Licencia de los pesos marcada como `other` y pendiente de confirmación; el autor indica que actualmente solo se usa para validación pública, lo que impide asumir uso comercial.
- El código asociado se distribuye bajo `GPL-3.0-only`, con las obligaciones de copyleft que ello implica.
- Nivel de seguridad `S2`: la instalación no habilita el movimiento; se requiere confirmación del usuario, soporte fiable, parada de emergencia accesible, limitación de corriente y realimentación CAN correcta antes de ejecutar.
- Las acciones de riesgo solo deben ejecutarse tras despejar el área y con confirmación humana.
- Las previsualizaciones, si existen, son de simulación y no representan el comportamiento en el robot físico.
- Compatibilidad garantizada únicamente con el modelo `rp1_24dof` y 24 DOF; no se declara compatibilidad con otros robots o configuraciones.
- No hay información sobre sesgos, alucinación o comportamiento fuera de distribución; al ser una política de control, el riesgo relevante es el fallo físico del robot, no la generación de texto.
- Cero descargas y cero likes en el momento de la consulta: ausencia de validación por parte de la comunidad.
- No se documentan datos de entrenamiento, arquitectura ni evaluación, lo que dificulta auditar su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/roboparty-action-rp1-24dof-default
- Repositorio upstream citado: `Roboparty/roboparty_inference` (ruta `robots/rp1_24dof/models/policy.onnx`, commit `ee9174c`); no se proporciona URL directa en la información disponible.
- Paper, blog, demo o repositorio adicionales: no disponible.
