# wentywenty/robopoly-action-rp1-24dof-interrupt

## Resumen

RP1 24DOF Interrupt es una política de control motriz para el robot humanoide `rp1_24dof` (24 grados de libertad), publicada por el usuario wentywenty en Hugging Face bajo el paraguas del proyecto Robopoly. No es un modelo de lenguaje ni un modelo generativo multimodal: es un artefacto de inferencia robótica en formato ONNX que mapea observaciones (`obs`) a acciones (`actions`) a una frecuencia de 250 Hz, concebido específicamente para tareas de resistencia a perturbaciones y recuperación tras interrupciones (抗扰动/中断恢复).

El modelo se distribuye como un fichero `policy_interrupt.onnx` acompañado de una configuración de inferencia YAML, e incluye un flujo de instalación, verificación y rollback mediante la herramienta de línea de comandos `robopoly action`. La model card declara compatibilidad exclusiva con la máquina `rp1_24dof` y clasifica la política con un nivel de seguridad `S2`, lo que implica que su ejecución en hardware real requiere confirmación humana, espacio despejado y medidas de seguridad activas (parada de emergencia accesible, limitación de corriente y realimentación CAN operativa).

La relevancia de esta publicación es limitada pero concreta: se trata de un piloto público de un ecosistema de distribución de políticas robóticas, con trazabilidad de origen (repositorio upstream `Roboparty/roboparty_inference`, commit `ee9174c`) y verificación por hash SHA256. No hay información pública sobre arquitectura interna, datos de entrenamiento ni métricas de rendimiento, y el repositorio tiene un tamaño de 0.0 GB con cero descargas en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control motriz en ONNX; no se documenta la topología interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica; entrada `obs` a 250 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | `other` (código GPL-3.0-only; pesos con licencia pendiente de confirmación, solo para validación pública) |
| Formato de pesos | ONNX (`models/policy_interrupt.onnx`) |
| Frecuencia de inferencia | 250 Hz |
| Entrada / salida | `obs` → `actions` |
| Robot objetivo | `rp1_24dof` (24 DOF) |
| Nivel de seguridad | S2 |
| SHA256 de pesos | `49c8f6d308c1ba662333a3342b9a8aff2ce87755c27da99131865f91d205e8e4` |
| Commit upstream | `ee9174c` (`Roboparty/roboparty_inference`, ruta `robots/rp1_24dof/models/policy_interrupt.onnx`) |
| Tamaño del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna de la política. El artefacto es un grafo ONNX que implementa una función `obs → actions` ejecutada a 250 Hz, lo que sugiere un controlador reactivo de bucle cerrado apto para tiempo real estricto (periodo de 4 ms). No se especifica si se trata de una red MLP, un transformer ligero, una política de aprendizaje por refuerzo tipo PPO o un controlador híbrido con lógica de recuperación de interrupciones.

Tampoco hay datos sobre el conjunto de entrenamiento, el número de tokens o episodios, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO, imitación o simulación a realidad (sim-to-real). La model card únicamente indica que la política está orientada a "抗扰动/中断恢复" (resistencia a perturbaciones y recuperación tras interrupciones) y que la vista previa, si existe, corresponde a una animación en simulación y no garantiza el comportamiento en hardware real. La trazabilidad se limita al commit upstream y al hash de los pesos.

## Capacidades

- Control motriz de cuerpo completo para el humanoide `rp1_24dof` con 24 grados de libertad.
- Resistencia a perturbaciones externas y recuperación tras interrupciones del movimiento.
- Inferencia en tiempo real a 250 Hz, adecuada para bucles de control de baja latencia.
- Interfaz estandarizada de observaciones a acciones (`obs` → `actions`) consumible desde el runtime de Robopoly.
- Instalación, verificación y rollback versionados mediante `robopoly action` (versión `v1.0.0`).
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- Recuperación tras interrupciones en operación continua: la política está diseñada específicamente para reanudar el movimiento de forma estable después de una parada o interrupción, lo que la hace adecuada en entornos donde el robot debe retomar tareas sin reinicio completo.
- Robustez ante empujes y perturbaciones externas: útil en laboratorios de robótica donde se valida la estabilidad del humanoide frente a fuerzas laterales o irregularidades del terreno.
- Validación de políticas en simulación antes de despliegue: el flujo `install` / `verify` / `rollback` permite probar la política en un entorno controlado y revertir a una versión anterior si el comportamiento no es el esperado.
- Integración en pipelines de control propietarios: al ser un grafo ONNX, puede cargarse desde runtimes de inferencia estándar (ONNX Runtime) dentro de un stack de control propio, sin depender del ecosistema Robopoly para la ejecución.
- Investigación en control de humanoides: sirve como referencia de política de recuperación para comparar estrategias de resistencia a perturbaciones en robots de 24 DOF.
- Despliegue supervisado en hardware con protocolo de seguridad S2: adecuado para pruebas en banco con parada de emergencia, limitación de corriente y realimentación CAN verificada, siempre con confirmación humana previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una política de control en ONNX de un repositorio de 0.0 GB, es probable que el modelo sea de tamaño reducido y quepa en memoria de sistema o en GPU de gama baja, pero no se confirma en la documentación.
- GPU recomendadas: no disponibles. La frecuencia de 250 Hz exige latencia de 4 ms por ciclo, lo que en la práctica suele requerir ejecución en CPU dedicada o GPU de gama media; no se especifica.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: runtime de Robopoly (`robopoly action install/verify/rollback`) y, potencialmente, ONNX Runtime para integración propia; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: frecuencia objetivo de 250 Hz (4 ms por ciclo); no se publican mediciones reales de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables de otros autores para el mismo robot o para humanoides de 24 DOF con recuperación de interrupciones.

## Limitaciones y advertencias

- Licencia de pesos pendiente de confirmación: la model card indica explícitamente que los pesos están bajo `other` y que actualmente solo se permiten para validación pública; el uso comercial no está garantizado.
- Compatibilidad restringida: solo se garantiza el funcionamiento con la máquina `rp1_24dof` y 24 DOF; no se asegura portabilidad a otros robots.
- Nivel de seguridad S2: la ejecución en hardware real requiere confirmación humana, espacio despejado, parada de emergencia accesible, limitación de corriente y realimentación CAN operativa.
- La instalación no equivale a la habilitación: el modelo debe ser confirmado por el usuario antes de ejecutarse.
- Las vistas previas, si existen, son animaciones en simulación y no representan el comportamiento en hardware real.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas, al no ser un modelo de lenguaje.
- Cero descargas y cero likes en el momento de la consulta: ausencia de validación comunitaria.
- No se publican métricas de rendimiento, robustez ni tasas de éxito de recuperación, lo que impide evaluar su eficacia real.

## Enlaces

- Hugging Face: https://huggingface.co/wentywenty/robopoly-action-rp1-24dof-interrupt
- Repositorio upstream (referenciado): `Roboparty/roboparty_inference`, ruta `robots/rp1_24dof/models/policy_interrupt.onnx`, commit `ee9174c`
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
