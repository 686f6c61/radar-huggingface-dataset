# wentywenty/robopoly-action-rpo-default

## Resumen

RPO Default es una política de control motriz (policy) para el robot humanoide `rpo`, publicada en Hugging Face por el usuario `wentywenty` bajo el paraguas del proyecto Robopoly. No se trata de un modelo de lenguaje, sino de un artefacto de inferencia robótica: un fichero ONNX (`models/policy.onnx`) que mapea observaciones (`obs`) a acciones (`actions`) a una frecuencia de control de 250 Hz. Su función declarada es la de "política de marcha por defecto" (默认行走策略), es decir, el controlador base de locomoción que el robot ejecuta cuando no se le ha cargado otra habilidad.

El modelo está etiquetado con el pipeline `robotics` de Hugging Face y empaquetado para el ecosistema de herramientas Robopoly, que ofrece comandos de instalación, verificación y rollback (`robopoly action install`, `verify`, `rollback`). El repositorio tiene un tamano de 0.0 GB y cero descargas en el momento de la consulta, lo que indica que es un artefacto de publicación muy reciente y sin adopción registrada.

La relevancia de esta ficha es acotada: se trata de un artefacto de nicho dentro de la robótica humanoide, con información pública muy limitada (sin detalles de arquitectura, dataset de entrenamiento ni benchmarks), licencia de pesos pendiente de confirmación y restricciones de seguridad explícitas (nivel S2). No debe confundirse con un modelo fundacional de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX; no se especifica la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control por paso, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | código: GPL-3.0-only; pesos: `other` (pendiente de confirmación) |
| Formato de pesos | ONNX (`models/policy.onnx`) |

Otros datos técnicos declarados:

| Parametro | Valor |
|---|---|
| Robot compatible | `rpo` (humanoide) |
| Grados de libertad (DOF) | 23 |
| Nivel de seguridad | S2 |
| Frecuencia de control | 250 Hz |
| Entrada / salida | `obs` → `actions` |
| Configuración de inferencia | `configs/default.yaml` |
| SHA256 de pesos | `6983bc76d4b6dd2f9d773f7543fb26aec26abacde1da11157da8f50b951a7653` |
| Upstream | `Roboparty/roboparty_inference`, ruta `robots/rpo/models/policy.onnx`, commit `ee9174c` |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna de la política. El artefacto se distribuye exclusivamente como grafo ONNX (`models/policy.onnx`) con un fichero de configuración de inferencia (`configs/default.yaml`). Por el contexto (política de marcha para un humanoide de 23 DOF con control a 250 Hz), es plausible que se trate de una política entrenada mediante aprendizaje por refuerzo o imitación y exportada a ONNX para despliegue en el robot, pero esto no está confirmado en la model card y no debe darse por hecho.

Tampoco se documentan el número de tokens o episodios de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino o de recompensa. La model card solo indica el origen upstream (`Roboparty/roboparty_inference`, commit `ee9174c`) y el hash SHA256 del fichero de pesos para verificación de integridad. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, etc.) sería especulativa y no se incluye.

## Capacidades

- Generación de acciones de locomoción por defecto para el robot humanoide `rpo` de 23 DOF.
- Inferencia a 250 Hz mediante un grafo ONNX, apto para ejecución en bucle de control en tiempo real.
- Mapeo directo de observaciones (`obs`) a acciones (`actions`) según la configuración `configs/default.yaml`.
- Instalación, verificación y rollback gestionados por la CLI de Robopoly (`robopoly action install/verify/rollback`).
- Verificación de integridad de pesos mediante SHA256 publicado.
- No se documentan capacidades de tool calling, razonamiento multi-paso, multilingüismo, visión, audio ni modo de pensamiento; no aplican a este tipo de artefacto.

## Casos de uso

- Control de marcha base en el humanoide `rpo`: la política se carga como comportamiento por defecto para que el robot mantenga una locomoción estable antes de recibir habilidades de nivel superior.
- Punto de partida para desarrollos sobre Robopoly: sirve como referencia de integración de una política ONNX con la CLI de acciones, verificable y reversible mediante `rollback`.
- Validación en simulación: la model card advierte que las previsualizaciones pueden ser de simulación, por lo que es útil para probar el pipeline de inferencia antes de llevarlo a hardware.
- Pruebas de integración de control en tiempo real: el bucle a 250 Hz permite evaluar latencias del stack de inferencia ONNX y del bus CAN del robot.
- Base para comparación de políticas: al ser la política "por defecto", permite medir mejoras de políticas alternativas frente a una línea base conocida.
- Auditoría de seguridad: el etiquetado S2 y las precondiciones (soporte fiable, parada de emergencia accesible, limitación de corriente, feedback CAN correcto) lo hacen útil como caso de estudio de despliegue seguro de políticas en humanoides.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un artefacto ONNX de política de control, el requisito depende del tamaño real del grafo, que no se documenta (el repo figura como 0.0 GB).
- GPU recomendadas: no disponibles. No se especifica si la inferencia requiere GPU o si está pensada para CPU/embebido en el propio robot.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto); la CLI de Robopoly para instalación y verificación. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: la única cifra publicada es la frecuencia de control de 250 Hz (periodo de 4 ms por paso); no se documentan latencias medidas ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables para el mismo robot (`rpo`, 23 DOF) ni artefactos equivalentes dentro del ecosistema Robopoly con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia de pesos pendiente de confirmación (`other`); la model card indica que actualmente solo se usa para validación pública. El código asociado es GPL-3.0-only, lo que impone obligaciones de copyleft si se integra.
- Solo se garantiza compatibilidad con el modelo de robot y el DOF declarados (`rpo`, 23 DOF); no debe usarse en otras plataformas.
- Nivel de seguridad S2: las acciones de riesgo requieren confirmación humana tras despejar el área; la instalación no implica habilitación.
- Precondiciones de seguridad obligatorias: soporte fiable, parada de emergencia accesible, limitación de corriente y feedback CAN correcto.
- Las previsualizaciones, si existen, pueden ser de simulación y no representan el comportamiento en hardware real.
- No se documentan sesgos, tasas de alucinación ni cobertura idiomática porque no es un modelo de lenguaje; esos criterios no aplican.
- Ausencia de benchmarks y de adopción (0 descargas, 0 likes) impide estimar su fiabilidad en producción.
- El repositorio figura con tamano 0.0 GB, lo que puede indicar artefactos no incluidos o problemas de empaquetado; conviene verificar la integridad con el SHA256 publicado antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/robopoly-action-rpo-default
- Repositorio upstream citado: `Roboparty/roboparty_inference` (commit `ee9174c`), sin URL pública confirmada en la información disponible.
