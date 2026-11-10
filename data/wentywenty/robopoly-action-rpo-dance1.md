# wentywenty/robopoly-action-rpo-dance1

## Resumen

RPO Dance 1 es una política de control motriz para robótica humanoide, publicada por el usuario wentywenty en Hugging Face bajo el ecosistema Robopoly. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de un artefacto de inferencia en formato ONNX que mapea observaciones (`obs`) a acciones (`actions`) para ejecutar una coreografía de baile concreta sobre el robot humanoide de referencia `rpo`. Su función es, por tanto, la de un controlador de movimiento preentrenado y empaquetado para despliegue directo en el robot.

El paquete incluye el grafo ONNX (`models/policy_dance1.onnx`), un fichero de configuración de inferencia (`configs/dance1.yaml`) y los datos de la coreografía en formato NumPy (`motions/dance1.npz`). La frecuencia de control declarada es de 250 Hz, un valor alto que condiciona los requisitos de latencia del bucle de control en tiempo real. El robot objetivo declara 23 grados de libertad (DOF) y un nivel de seguridad `S2`, lo que implica que la ejecución requiere confirmación humana y condiciones de entorno controladas.

La relevancia de esta publicación es limitada pero concreta: ejemplifica un formato de distribución de políticas robóticas (instalación, verificación y rollback mediante la CLI `robopoly action`) que puede servir como referencia para flujos de trabajo de despliegue de controladores en humanoides. No obstante, se trata de un artefacto en fase de pilotaje público, con licencia de pesos sin confirmar y sin datos de rendimiento publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control motriz empaquetada como grafo ONNX; no se especifica el tipo de red subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica; entrada `obs`, salida `actions`) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | `other` (código `GPL-3.0-only`; pesos con licencia pendiente de confirmar) |
| Formato de pesos | ONNX (`models/policy_dance1.onnx`), más `configs/dance1.yaml` y `motions/dance1.npz` |
| Frecuencia de control | 250 Hz |
| Robot objetivo | `rpo` (humanoide, 23 DOF) |
| Nivel de seguridad | `S2` |
| Entrada / salida | `obs` → `actions` |
| SHA256 de pesos | `125ce95a02a688e031548a09e29ac1d7df07cbfa8145fc99dd39c78475fffeb0` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de la política: no se especifica si se trata de un perceptrón multicapa, una red recurrente, un transformer de política o un controlador híbrido. Lo único documentado es el contrato de interfaz: el modelo consume un vector de observaciones (`obs`) y produce un vector de acciones (`actions`) a 250 Hz, empaquetado como grafo ONNX para inferencia portable. El número de parámetros, las dimensiones exactas de `obs` y `actions`, y la composición del espacio de observación no están disponibles en la información proporcionada.

Tampoco se documentan los datos de entrenamiento: no se indica el número de trayectorias, el método de aprendizaje (por ejemplo, aprendizaje por imitación de capturas de movimiento, reinforcement learning o una combinación), ni si se emplearon técnicas de regularización o dominio aleatorizado. El fichero `motions/dance1.npz` sugiere que la coreografía se distribuye junto con la política, probablemente como referencia de movimiento o como dato auxiliar de reproducción, pero su contenido no está descrito. La trazabilidad apunta a un origen en `Roboparty/roboparty_inference`, ruta `robots/rpo/models/policy_dance1.onnx`, commit `ee9174c`.

## Capacidades

- Ejecución de una coreografía de baile concreta (`dance1`) sobre el humanoide `rpo` con 23 DOF.
- Control motriz en bucle cerrado a 250 Hz mediante inferencia ONNX de observaciones a acciones.
- Distribución de la política junto con su configuración de inferencia (`configs/dance1.yaml`) y datos de movimiento (`motions/dance1.npz`).
- Instalación, verificación y rollback versionados mediante la CLI de Robopoly (`robopoly action install`, `verify`, `rollback`), con referencia de versión `v1.0.0`.
- Verificación de integridad de pesos mediante SHA256 declarado.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües: es un artefacto de control robótico, no un modelo generativo.

## Casos de uso

- Demostración de baile en humanoide `rpo`: la política reproduce la coreografía `dance1` a 250 Hz sobre el robot declarado, útil para exhibiciones controladas con el entorno despejado y confirmación humana previa, dado el nivel de seguridad `S2`.
- Validación de pipeline de despliegue Robopoly: sirve para probar el ciclo completo de `install`, `verify` y `rollback` de una acción robótica versionada antes de adoptar el flujo en políticas propias.
- Pruebas de integración en simulación: el par ONNX + `dance1.npz` permite reproducir la política en un entorno simulado y comparar la trayectoria generada con la referencia de movimiento, sin riesgo físico.
- Benchmark de latencia de inferencia ONNX: a 250 Hz el presupuesto por ciclo es de 4 ms, por lo que el artefacto es útil para medir el coste de inferencia del runtime ONNX en el hardware de control del robot.
- Referencia de contrato de interfaz `obs` → `actions`: equipos que desarrollen nuevas políticas para el mismo robot pueden usar esta como plantilla de empaquetado (configuración, datos de movimiento, metadatos de seguridad y trazabilidad de commit).
- Verificación de compatibilidad de hardware: permite comprobar que una unidad `rpo` con 23 DOF y bus CAN operativo acepta y ejecuta correctamente una política externa antes de desplegar controladores críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se documentan métricas de seguimiento de trayectoria, error de pose, tasa de éxito de la coreografía, latencia de inferencia medida ni throughput. Tampoco se aportan comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0.0 GB según Hugging Face, lo que sugiere un grafo ONNX muy pequeño, pero no se confirma el número de parámetros ni el consumo real.
- GPU recomendadas: no disponible. Al ser una política de control a 250 Hz, es plausible su ejecución en CPU o en aceleradores embebidos, pero no se documenta el hardware de inferencia objetivo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime ONNX (ONNX Runtime u otro compatible) a través del stack `robopoly` / `roboparty_inference`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: el único dato es la frecuencia de control de 250 Hz, que fija un presupuesto de 4 ms por ciclo; no se publica la latencia medida de la inferencia ONNX.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de control para el humanoide `rpo` ni artefactos comparables del ecosistema Robopoly con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia de pesos pendiente de confirmación: el campo `license` es `other` y la model card indica explícitamente que la licencia de los pesos está por determinar y que el uso actual es solo para validación pública. No debe asumirse uso comercial permitido.
- El código se declara bajo `GPL-3.0-only`, lo que impone obligaciones de copyleft si se integra en productos derivados; conviene revisar la compatibilidad antes de su adopción.
- Compatibilidad garantizada únicamente con el robot `rpo` de 23 DOF; no se asegura funcionamiento en otras plataformas ni configuraciones.
- Nivel de seguridad `S2`: requiere soporte fiable, parada de emergencia accesible, limitación de corriente y realimentación CAN operativa; la ejecución debe ser confirmada por un operador humano tras despejar el entorno.
- Las previsualizaciones, si existen, pueden corresponder a simulación y no representan el comportamiento real en hardware.
- No se documentan sesgos, tasas de alucinación ni comportamiento en dominios no previstos, al no ser un modelo generativo; el riesgo principal es físico (movimientos no deseados), no informativo.
- Ausencia de benchmarks y de datos de entrenamiento: no es posible evaluar la robustez de la política ante perturbaciones, cambios de carga o terreno antes de su despliegue.
- Artefacto en fase de pilotaje público, con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/robopoly-action-rpo-dance1
- Repositorio upstream citado: `Roboparty/roboparty_inference` (no se proporciona URL directa en la información disponible)
- No se han encontrado en la información proporcionada enlaces a papers, blogs, demos ni repositorios adicionales.
