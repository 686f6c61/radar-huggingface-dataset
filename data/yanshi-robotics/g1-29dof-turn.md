# yanshi-robotics/g1-29dof-turn

## Resumen

`yanshi-robotics/g1-29dof-turn` es una política de locomoción determinista (actor de reinforcement learning) para el robot humanoide Unitree G1 en su contrato de simulación de 29 grados de libertad. No es un modelo de lenguaje: recibe un vector de observación de 480 valores y devuelve 29 valores de acción articular, uno por articulación. Lo publica la organización Yanshi-Robotics como artefacto de despliegue para NERV, el controlador que aporta el historial de observaciones, el escalado de comandos, los objetivos articulares y el bucle de control local.

El modelo se distribuye como grafo ONNX con los pesos embebidos (`policy.onnx`), acompañado de los contratos de observación, acción y controlador (`contract.json`, `release.yaml`) y de una versión editable del actor en safetensors. El actor es un perceptrón multicapa con activación ELU y anchuras 480 → 512 → 256 → 128 → 29. Procede del entrenamiento identificado como `Unitree-G1-29dof-Velocity-TurnAligned`, en la iteración 9999, y esta publicación preserva el hash de pesos del ONNX original.

Su relevancia es acotada y muy específica: sirve como referencia reproducible para integrar políticas de locomoción en pipelines de simulación con contratos versionados, y como base editable para investigación en RL. El propio autor advierte que es una publicación de simulación, sin validación en robot físico ni benchmark general de éxito de tarea, y que no debe desplegarse en un G1 real basándose en las comprobaciones incluidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) con activación ELU; anchuras 480 → 512 → 256 → 128 → 29 |
| Parametros totales | 414.237 (derivado de las anchuras declaradas, incluyendo sesgos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada fija de 480 valores. El historial de observaciones lo construye NERV |
| Tipos de cuantizacion | no disponible; se distribuye un grafo ONNX con pesos embebidos y un `actor.safetensors` |
| Idiomas soportados | en (solo metadatos de la model card; no aplica a la inferencia) |
| Licencia | AGPL-3.0 únicamente |
| Formato de pesos | ONNX (`policy.onnx`, pesos embebidos) y safetensors (`actor.safetensors`) |

## Arquitectura y entrenamiento

El actor es una red feed-forward pequeña, sin recurrencia: un MLP de cuatro capas densas con activación ELU y salida de 29 dimensiones, una por articulación del G1 de 29 DoF. La memoria temporal no reside en el modelo, sino en el controlador: NERV aporta el historial de observaciones y ensambla el vector de 480 valores que consume la política. La salida son acciones articulares que el controlador traduce a objetivos de articulación según el orden, los tiempos, el escalado y las ganancias fijados en `contract.json`.

El entrenamiento se realizó con reinforcement learning sobre la tarea `Unitree-G1-29dof-Velocity-TurnAligned`, hasta la iteración 9999. La model card no detalla el simulador, el número de tokens o pasos, la composición del dataset, ni si se emplearon RLHF, DPO u otras fases de ajuste; tampoco se incluyen dataset de entrenamiento, estado del optimizador ni pesos del crítico. La innovación técnica destacable no está en la arquitectura, sino en el empaquetado: contratos explícitos de observación y acción, verificación numérica del grafo reexportado frente al original y una versión editable del actor recuperada del checkpoint correspondiente.

## Capacidades

- Generación de acciones de locomoción: produce 29 valores de acción articular a partir de un vector de observación de 480 valores.
- Seguimiento de comandos de velocidad con componente de giro, según la tarea de entrenamiento `Velocity-TurnAligned`; los rangos de comando concretos están en `release.yaml` y no se reproducen en la model card.
- Ejecución determinista: misma entrada, misma salida; no hay muestreo estocástico documentado.
- Integración con el controlador NERV 0.8.5 o compatible, que gestiona historial, escalado y bucle de control local.
- Reexportación y edición: el actor puede reconstruirse con `export.py` y validarse numéricamente frente al ONNX original.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Simulación de locomoción en entorno de apartamento: la política se importa en NERV y se ejecuta sobre el asset de simulación del G1 para reproducir desplazamientos, giros, mantenimiento de postura y reinicio, tal como cubre la regresión declarada.
- Verificación de contratos de despliegue: `contract.json` y `release.yaml` permiten comprobar orden de articulaciones, tiempos, escalado y ganancias antes de conectar cualquier política al bucle de control, lo que sirve para validar integraciones.
- Baseline reproducible en investigación de RL: al conservarse el hash de pesos del ONNX original y la iteración de entrenamiento, sirve como referencia fija contra la que comparar nuevas políticas o cambios de recompensa.
- Punto de partida para ajuste fino o destilación: `actor.safetensors` y `architecture.json` permiten cargar el actor en PyTorch, modificarlo y reexportarlo, con la validación numérica como red de seguridad.
- Pruebas de regresión en CI de controladores: un grafo ONNX pequeño y determinista se puede ejecutar en CPU dentro de un pipeline para detectar roturas en el contrato de observación o en el orden de articulaciones.
- Generación de datos sintéticos de locomoción en simulación: ejecutar la política sobre distintos comandos de velocidad y giro para producir trayectorias etiquetadas destinadas a entrenar estimadores o modelos auxiliares.
- Docencia y divulgación técnica: ejemplo compacto y completo de un artefacto de RL listo para despliegue, con contratos, checksums y criterios de validación explícitos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K: no son aplicables a este tipo de modelo). La model card solo documenta comprobaciones de validación internas:

| Comprobacion | Entradas / alcance | Resultado declarado |
|---|---|---|
| Acuerdo numérico actor editable vs. ONNX original | 128 entradas fijas en CPU, incluyendo vector de ceros y vectores normales estándar con semilla | Dentro de tolerancias absoluta y relativa de 1e-5 |
| Regresión en simulación de apartamento NERV | Caminar un metro, girar, mantenerse y reiniciar | Superada según la model card |
| Robustez ante terreno, modelos, disposición de cámara o hardware | No evaluada | No disponible |
| Éxito de tarea en robot físico | No evaluada | No disponible |

## Requisitos de hardware

- VRAM para inferencia: prácticamente nula. Con 414.237 parámetros (derivado), los pesos en precisión de 32 bits ocupan del orden de 1,7 MB, además del grafo ONNX.
- GPU recomendadas: ninguna imprescindible; el modelo está pensado para ejecutarse en CPU. Cualquier GPU moderna sobra para el cálculo, pero no aporta ventaja significativa frente a CPU.
- Cabe en cualquier hardware consumer: CPU de portátil, Raspberry Pi o similar; no requiere GPU dedicada.
- Opciones de despliegue: NERV 0.8.5 o controlador humanoide compatible, con runtime de ONNX. vLLM, llama.cpp, Ollama y TGI no son aplicables a este artefacto.
- Latencia y throughput: no disponibles. Dependen de la frecuencia del bucle de control definida en `release.yaml`, que no se reproduce en la información proporcionada.
- Requisito adicional: asset de simulación del Unitree G1 de 29 DoF que coincida con el contrato, y las dependencias (NERV, ONNX, simulador, assets del robot) no se distribuyen en este repositorio.

## Comparativa con modelos similares

No se dispone de datos verificables de alternativas comparables en la información proporcionada. Las políticas de locomoción para el Unitree G1 publicadas por el fabricante u otros terceros no aparecen con parámetros, contexto o métricas en la documentación disponible, y este repositorio declara 0 descargas y 0 likes, sin benchmark de éxito de tarea.

| Modelo | Parametros | Contexto / entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yanshi-robotics/g1-29dof-turn | 414.237 (derivado) | 480 valores de observación | Solo validación numérica y regresión en simulación; sin benchmark de tarea | AGPL-3.0 | HuggingFace, requiere NERV 0.8.5 |
| Otras políticas para Unitree G1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Políticas del repositorio Yanshi-Robotics/nerv-policies | no disponible | no disponible | no disponible | no disponible | Repositorio GitHub |

## Limitaciones y advertencias

- Publicación exclusivamente de simulación: el autor prohíbe explícitamente desplegarla en un G1 físico basándose en las comprobaciones incluidas. No hay validación en hardware real.
- Sin benchmark de éxito de tarea: la regresión cubre caminar un metro, girar, mantenerse y reiniciar en un único entorno de apartamento; no mide robustez ante terreno, modelos, disposición de cámara o hardware distintos.
- Acoplamiento estricto al contrato: el orden de articulaciones, los tiempos, el escalado y las ganancias de `contract.json` deben respetarse; cualquier desviación invalida el comportamiento esperado.
- Dependencia de NERV: requiere NERV 0.8.5 o un controlador compatible y un asset de simulación coincidente; las licencias de NERV, PyTorch, ONNX, el simulador y los assets del robot no quedan cubiertas por la licencia de este modelo.
- Licencia AGPL-3.0 únicamente: es copyleft fuerte. El uso comercial es posible, pero obliga a preservar avisos y a proporcionar el código fuente correspondiente cuando la licencia lo exija; conviene revisarlo con asesoría legal antes de integrarlo en un producto.
- Sin artefactos de entrenamiento: no se incluyen dataset, estado del optimizador ni pesos del crítico, por lo que la reproducibilidad del entrenamiento completo no está garantizada.
- Reexportación no bit a bit: los bytes del grafo reexportado pueden diferir entre versiones del exportador; hay que validar el acuerdo numérico y el contrato antes de usar un grafo modificado.
- Importación correcta no equivale a seguridad: el propio autor advierte que una importación superada no es evidencia de seguridad física ni de éxito de la tarea.
- Sesgos y alucinación: no aplica en el sentido habitual de los modelos generativos; el riesgo equivalente es el sobreajuste al dominio de entrenamiento y el fallo silencioso fuera de la distribución de comandos.
- Idiomas: los metadatos están solo en inglés; no hay documentación en castellano.

## Enlaces

- [HuggingFace: yanshi-robotics/g1-29dof-turn](https://huggingface.co/yanshi-robotics/g1-29dof-turn)
- [Repositorio Yanshi-Robotics/nerv-policies (commit 742acfc4398cbefdcfac40e4599b89afa2c88c58)](https://github.com/Yanshi-Robotics/nerv-policies/tree/742acfc4398cbefdcfac40e4599b89afa2c88c58)
- Archivos incluidos en el repositorio: `policy.onnx`, `contract.json`, `release.yaml`, `actor.safetensors`, `architecture.json`, `export.py`, `nerv-policy.json`, `evaluation/summary.json`, `checksums.sha256`, `LICENSE`
