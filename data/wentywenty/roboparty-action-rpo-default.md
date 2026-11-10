# wentywenty/roboparty-action-rpo-default

## Resumen

RPO Default es una política de control motriz (policy) para el robot humanoide `rpo` de Roboparty, distribuida como un artefacto ONNX dentro del ecosistema de paquetes `roboparty action`. No es un modelo de lenguaje ni un modelo multimodal: es una política de caminata por defecto que mapea observaciones (`obs`) a acciones (`actions`) a 250 Hz, pensada para ejecutarse en el lazo de control de un robot físico de 23 grados de libertad (DOF).

El repositorio lo publica el usuario `wentywenty` como un piloto público en Hugging Face, con origen en el repositorio upstream `Roboparty/roboparty_inference` (ruta `robots/rpo/models/policy.onnx`, commit `ee9174c`). El artefacto se instala mediante la CLI de Roboparty y se marca con nivel de seguridad `S2`, lo que implica que su ejecución requiere confirmación humana explícita y condiciones de entorno controladas.

Su relevancia es acotada pero concreta: sirve como referencia de empaquetado y verificación de políticas robóticas en formato ONNX, con trazabilidad de pesos mediante SHA256 y mecanismo de rollback. La licencia de los pesos está pendiente de confirmación, por lo que su uso en producción no está autorizado de forma clara en el momento de la publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control motriz exportada a ONNX; no se especifica la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | `other` para los pesos (pendiente de confirmar); código `GPL-3.0-only` |
| Formato de pesos | ONNX (`models/policy.onnx`) |

Datos adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Robot objetivo | `rpo` (humanoide Roboparty) |
| Grados de libertad (DOF) | 23 |
| Nivel de seguridad | S2 |
| Frecuencia de inferencia | 250 Hz |
| Entrada / salida | `obs` → `actions` |
| Config de inferencia | `configs/default.yaml` |
| SHA256 de pesos | `6983bc76d4b6dd2f9d773f7543fb26aec26abacde1da11157da8f50b951a7653` |
| Commit upstream | `ee9174c` (`Roboparty/roboparty_inference`) |
| Version del paquete | `v1.0.0` |
| Tamano del repo | 0.0 GB (segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna de la politica. El artefacto distribuido es un grafo ONNX (`models/policy.onnx`) que consume un vector de observaciones `obs` y produce un vector de acciones `actions`, ejecutado a 250 Hz. No se documenta si el modelo subyacente es una red MLP, un transformer ligero, una politica de RL (por ejemplo, PPO entrenada en simulacion) ni el algoritmo de entrenamiento utilizado (RL, imitation learning, etc.).

Tampoco se detallan los datos de entrenamiento, el numero de pasos, la composicion del dataset ni si hubo ajuste fino o destilacion. La model card unicamente indica el origen del artefacto (repositorio `roboparty_inference`) y el commit de extraccion, ademas del SHA256 de los pesos, lo que permite verificar integridad pero no reconstruir el proceso de entrenamiento. La nomenclatura `rpo` en el nombre del modelo y del repositorio sugiere una politica asociada al robot `rpo`, pero no se aporta informacion adicional sobre innovaciones tecnicas (decodificacion especulativa, atencion lineal, etc.), que en cualquier caso no aplican a este tipo de artefacto.

## Capacidades

- Generacion de acciones de locomocion: la politica produce comandos de actuacion a partir de observaciones del robot, a una frecuencia de 250 Hz, adecuada para el lazo de control de bajo nivel.
- Control de un humanoide de 23 DOF: el modelo esta disenado especificamente para la morfologia del robot `rpo`; no es portable a otras plataformas sin reentrenamiento o adaptacion.
- Interfaz estandarizada `obs` → `actions`: el contrato de entrada/salida esta fijado por la configuracion `configs/default.yaml`.
- Integracion con el ecosistema Roboparty: instalacion, verificacion y rollback mediante la CLI `roboparty action`.
- Verificacion de integridad: el SHA256 de los pesos permite comprobar que el artefacto instalado coincide con el publicado.
- No dispone de capacidades de lenguaje, vision, audio, tool calling, razonamiento multi-paso ni agentes. No es un modelo generativo de texto.

## Casos de uso

- Despliegue de la caminata por defecto en el humanoide `rpo`: instalar el paquete con `roboparty action install` y verificar con `roboparty action verify` para arrancar la politica base de locomocion en el robot fisico, siempre con confirmacion humana y condiciones de seguridad verificadas.
- Validacion de la cadena de inferencia en banco de pruebas: usar el artefacto como referencia para comprobar que el pipeline `obs` → `actions` a 250 Hz funciona correctamente antes de integrar politicas personalizadas.
- Pruebas de integracion en simulacion: cargar `policy.onnx` en un simulador compatible con la morfologia `rpo` (23 DOF) para validar el contrato de observaciones y acciones antes de pasar a hardware.
- Base para ajuste fino o destilacion: emplear la politica como inicializacion o como referencia de comportamiento en el desarrollo de politicas derivadas para el mismo robot.
- Verificacion de reproducibilidad y trazabilidad: comprobar el SHA256 y el commit upstream (`ee9174c`) para auditar que el artefacto desplegado corresponde al publicado.
- Gestion de versiones y rollback en flotas: usar `roboparty action rollback` para revertir a la version anterior si una actualizacion de politica introduce regresiones en el comportamiento.
- Formacion y evaluacion interna: servir como ejemplo de empaquetado de politicas ONNX con metadatos de seguridad (`S2`) en el ecosistema Roboparty.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa, tasa de exito, estabilidad de la marcha, consumo energetico ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del artefacto no se detalla (el repositorio figura como 0.0 GB en los metadatos, lo que impide estimar la huella en memoria).
- GPU recomendadas: no disponible. Al ser una politica de control a 250 Hz, es probable que pueda ejecutarse en CPU o en GPUs de gama baja, pero no se documenta.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto); la CLI `roboparty action` gestiona la instalacion y verificacion. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI), que ademas no aplican a este tipo de modelo.
- Latencia y throughput: la frecuencia de operacion declarada es de 250 Hz (periodo de 4 ms por ciclo), pero no se aportan mediciones reales de latencia ni de throughput en hardware concreto.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada otras politicas de locomocion publicadas en Hugging Face con las que comparar parametros, contexto, rendimiento o licencia. La comparacion con modelos de lenguaje u otros artefactos generativos no seria pertinente por la naturaleza distinta del modelo.

## Limitaciones y advertencias

- Licencia de pesos pendiente de confirmacion (`other`): la model card indica explicitamente que los pesos solo estan destinados a validacion publica; no hay autorizacion clara para uso comercial o en produccion.
- Compatibilidad restringida: solo se garantiza el funcionamiento con el modelo de robot `rpo` y 23 DOF; no es portable a otras plataformas.
- Nivel de seguridad `S2`: requiere soporte fiable, parada de emergencia accesible, limitacion de corriente en la alimentacion y realimentacion CAN operativa antes de ejecutar. Las acciones de riesgo solo deben ejecutarse tras despejar el area y con confirmacion humana.
- Instalar no equivale a habilitar: el usuario debe confirmar explicitamente la ejecucion del modelo.
- Las previsualizaciones, si existen, son de simulacion y no representan el comportamiento en el robot fisico.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto o idioma, por no tratarse de un modelo de lenguaje.
- Ausencia de benchmarks y de documentacion sobre el entrenamiento: no es posible evaluar de antemano la calidad o robustez de la politica sin pruebas en simulacion y en banco.
- El repositorio figura con 0 descargas y 0 likes, y el tamano reportado es 0.0 GB, lo que sugiere un estado de publicacion muy temprano o incompleto; conviene verificar los artefactos antes de confiar en ellos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/roboparty-action-rpo-default
- Repositorio upstream citado: `Roboparty/roboparty_inference` (ruta `robots/rpo/models/policy.onnx`, commit `ee9174c`); no se proporciona URL directa en la informacion disponible.
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos.
