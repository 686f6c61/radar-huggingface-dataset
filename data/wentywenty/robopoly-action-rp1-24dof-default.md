# wentywenty/robopoly-action-rp1-24dof-default

## Resumen

RP1 24DOF Default es una política de control motriz para el robot humanoide `rp1_24dof` de Roboparty, publicada en Hugging Face por el usuario `wentywenty`. No se trata de un modelo de lenguaje ni de un modelo generativo multimodal, sino de un artefacto de inferencia en formato ONNX que mapea observaciones del robot (`obs`) a acciones motrices (`actions`) para ejecutar una marcha por defecto. El modelo está etiquetado como acción de seguridad `S2` y se distribuye a través del ecosistema de herramientas `robopoly`.

El repositorio es un piloto público de validación: el tamaño del repo es de 0,0 GB, no registra descargas ni likes, y la licencia de los pesos figura como "other" pendiente de confirmación. La model card está redactada en chino e incluye instrucciones de instalación, verificación y rollback mediante la CLI `robopoly action`, además del hash SHA256 del peso y la ruta upstream exacta dentro del repositorio `Roboparty/roboparty_inference`.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de una política de locomoción para un humanoide de 24 grados de libertad, con requisitos de seguridad explícitos y un pipeline de despliegue definido. No hay información pública sobre arquitectura interna, datos de entrenamiento ni rendimiento medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control motriz; fichero `models/policy.onnx`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de acción, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | `other` para pesos (pendiente de confirmar); código `GPL-3.0-only` |
| Formato de pesos | ONNX (`models/policy.onnx`) |
| Frecuencia de inferencia | 250 Hz |
| Entrada / salida | `obs` → `actions` |
| Robot objetivo | `rp1_24dof` (24 DOF) |
| Nivel de seguridad | `S2` |
| Config de inferencia | `configs/default.yaml` |
| SHA256 del peso | `00f24b03bde6442940fe4f13c4a03c622a2378b0e416b574e4a9567480cbe7fb` |
| Commit upstream | `ee9174c` (`Roboparty/roboparty_inference`, ruta `robots/rp1_24dof/models/policy.onnx`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la política: la model card no describe capas, tipo de red (MLP, transformer, política recurrente u otra), número de parámetros ni esquema de observaciones/acciones. El único dato estructural es que se distribuye como grafo ONNX en `models/policy.onnx`, con configuración de inferencia en `configs/default.yaml` y una frecuencia de ejecución de 250 Hz.

Tampoco se documentan datos de entrenamiento, número de tokens o episodios, composición del dataset, ni si se empleó aprendizaje por refuerzo, imitación o RLHF/DPO. La model card únicamente indica el origen upstream (`Roboparty/roboparty_inference`, commit `ee9174c`) y que se trata de una "política de marcha por defecto" para el modelo `rp1_24dof`.

## Capacidades

- Generación de acciones motrices de marcha por defecto para el humanoide `rp1_24dof` con 24 grados de libertad.
- Inferencia a 250 Hz, adecuada para bucles de control en tiempo real.
- Interfaz `obs` → `actions` consumible desde runtime ONNX.
- Integración con la CLI `robopoly action` para instalación, verificación y rollback versionado (`@v1.0.0`).
- Clasificación de seguridad `S2`, que exige confirmación humana antes de habilitar el movimiento.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Validación de pipeline de despliegue: instalar y verificar la política con `robopoly action install` y `robopoly action verify` para comprobar que el entorno de inferencia ONNX y la configuración `configs/default.yaml` funcionan antes de pasar a políticas propias.
- Marcha base en banco de pruebas: ejecutar la política por defecto sobre un `rp1_24dof` con soporte mecánico y parada de emergencia accesible, para caracterizar el comportamiento antes de entrenar variantes.
- Referencia de integración para desarrolladores: usar el hash SHA256 y la ruta upstream como plantilla para versionar y auditar políticas propias dentro de `robopoly`.
- Pruebas de regresión de firmware y CAN: al correr a 250 Hz sobre el bus CAN del robot, sirve para verificar latencias de realimentación y límites de corriente bajo una política conocida.
- Docencia y laboratorio: escenario controlado para que estudiantes de robótica observen el ciclo observación-acción de un humanoide de 24 DOF con requisitos de seguridad explícitos.
- Base para comparación de políticas: punto de partida neutro contra el que medir políticas alternativas de marcha en el mismo chasis y configuración.
- No se recomienda su uso en producción sin confirmación previa de la licencia de los pesos y sin validación en el robot físico, dado el estado de piloto público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de seguimiento de trayectoria, estabilidad, consumo energético, tasa de caídas ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0,0 GB, lo que sugiere un grafo ONNX de pocos megabytes, pero no se confirma.
- GPU recomendadas: no disponibles. Al ser una política de control a 250 Hz, es plausible su ejecución en CPU o en GPU de gama baja, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime ONNX (el formato del peso es `models/policy.onnx`) y la CLI `robopoly action` como orquestador de instalación y verificación; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: la frecuencia objetivo es 250 Hz (periodo de 4 ms por ciclo), pero no se publican latencias medidas ni throughput real en hardware concreto.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables de otros autores para el mismo robot `rp1_24dof` ni para humanoides de 24 DOF con formato ONNX y licencia equiparable.

## Limitaciones y advertencias

- Licencia de pesos en estado `other` y "pendiente de confirmar": no hay autorización explícita para uso comercial.
- El código asociado se declara `GPL-3.0-only`, lo que impone obligaciones de copyleft si se redistribuye o modifica.
- Estado de "piloto público" en Hugging Face: sin descargas ni validación comunitaria registrada.
- Solo se garantiza compatibilidad con el modelo `rp1_24dof` y 24 DOF; no se declara compatibilidad con otros chasis.
- Nivel de seguridad `S2`: requiere soporte fiable, parada de emergencia accesible, limitación de corriente y realimentación CAN correcta antes de habilitar el movimiento.
- La instalación no equivale a la habilitación: el usuario debe confirmar explícitamente la ejecución.
- Las posibles previsualizaciones son de simulación y no representan el comportamiento en el robot físico.
- No se documentan sesgos, tasa de alucinación ni cobertura idiomática porque no es un modelo lingüístico; el riesgo relevante es de comportamiento físico imprevisto.
- Ausencia total de datos de arquitectura, entrenamiento y benchmarks impide evaluar su robustez antes de desplegarla en un robot real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/robopoly-action-rp1-24dof-default
- Repositorio upstream: `Roboparty/roboparty_inference` (ruta `robots/rp1_24dof/models/policy.onnx`, commit `ee9174c`); no se proporciona URL directa en la información disponible.
- Paper, blog, demo o repositorio adicionales: no disponibles.
