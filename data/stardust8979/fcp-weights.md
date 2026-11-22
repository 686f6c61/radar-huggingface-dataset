# stardust8979/FCP-weights

## Resumen

FCP-weights (Future-Context Planning) es un conjunto de pesos para un modelo de planificacion en el espacio latente orientado a robótica y control de agentes en entornos simulados. Lo publica el usuario stardust8979 en Hugging Face bajo el pipeline `robotics`, con los tags `world-model`, `planning` y `robotics`. El modelo resuelve el problema de generar subobjetivos latentes intermedios que guien a un planificador de acciones de bajo nivel hacia una meta final, sin necesidad de reentrenar el codigo de control del entorno.

El repositorio contiene pesos para seis entornos de simulacion distintos: PushT, Cube, LIBERO Scene2, LIBERO Caddy, AntMaze D3 y FourRoom. Para cada entorno se distribuyen tres artefactos: un generador de contexto futuro compartido (`fcg.safetensors`), un solucionador de subobjetivos guiado por futuros demostrados (`fgss_true.safetensors`) y otro guiado por futuros generados (`fgss_generated.safetensors`). La arquitectura concreta, el numero de parametros y la longitud de contexto no se detallan en la model card.

La relevancia del proyecto radica en su enfoque de planificacion jerarquica: el modelo opera sobre latentes de observacion congelados y produce un subobjetivo latente, delegando la ejecucion en bucle cerrado al encoder, world model y busqueda de acciones del entorno. Es un componente de investigacion mas que un modelo listo para produccion, y no se han publicado resultados de benchmarks ni especificaciones completas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de planificacion latente con generador de contexto futuro y solucionadores de subobjetivos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control roboticos, no a texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`fcg.safetensors`, `fgss_true.safetensors`, `fgss_generated.safetensors`) y `config.json` por entorno |

## Arquitectura y entrenamiento

La model card describe un esquema jerarquico de planificacion: un generador de contexto futuro (FCG) compartido por entorno y dos solucionadores de subobjetivos guiados por futuro (FGSS), uno entrenado con futuros demostrados (`fgss_true`) y otro con futuros generados (`fgss_generated`). En inferencia, ambos solucionadores utilizan las predicciones del FCG. La arquitectura concreta (tipo de red, dimensiones, atencion, etc.) no se especifica mas alla de que se define en el `config.json` de cada carpeta.

El entrenamiento se organiza por entorno y se documenta mediante epocas: el FCG alcanza entre 154 y 200 epocas segun el entorno, el solucionador `true` entre 114 y 198, y el `generated` entre 78 y 280. No se indica el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF, DPO o aprendizaje por refuerzo. Tampoco se detalla ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Generacion de subobjetivos latentes a partir de historial de latentes de observacion y un latente de meta, mediante el metodo `model.sample(history_latents, goal_latent, samples=8)`.
- Planificacion jerarquica en el espacio latente para entornos de simulacion roboticos.
- Soporte de dos modos de solucionador: guiado por futuros demostrados y guiado por futuros generados.
- Integracion con el encoder, world model, busqueda de acciones y prior de acciones del entorno para ejecucion en bucle cerrado.
- Cobertura de seis entornos: PushT, Cube, LIBERO Scene2, LIBERO Caddy, AntMaze D3 y FourRoom.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, agentes conversacionales ni multilingues.

## Casos de uso

- Planificacion en manipulacion robotica simulada (PushT, Cube): el modelo genera subobjetivos latentes que un planificador de bajo nivel puede perseguir para completar tareas de empuje o apilamiento, usando los pesos `fgss_true` o `fgss_generated` segun el tipo de futuro disponible.
- Navegacion en laberintos y entornos de recompensa dispersa (AntMaze D3, FourRoom): el FCG predice contexto futuro que guia al solucionador hacia regiones relevantes del espacio latente, reduciendo la dependencia de recompensas densas.
- Evaluacion de tareas de LIBERO (Scene2, Caddy): permite reproducir experimentos de planificacion jerarquica en benchmarks de manipulacion de largo horizonte con los pesos publicados.
- Investigacion en world models: el modelo sirve como modulo superior para estudiar como los futuros generados frente a los demostrados afectan a la calidad de los subobjetivos.
- Prototipado de pipelines de control en bucle cerrado: al aceptar latentes de observacion congelados, se puede integrar con el encoder y el world model del entorno sin reentrenar el modulo de planificacion.
- Comparacion de estrategias de entrenamiento de solucionadores: los pares `fgss_true` y `fgss_generated` por entorno permiten analizar el impacto de usar futuros generados en lugar de demostrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio es de 3,0 GB, lo que da una cota superior aproximada del almacenamiento de pesos, pero no de la VRAM necesaria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card solo documenta carga mediante la libreria `fcp` (`from fcp import load_fcp`) sobre PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que el uso comercial no esta autorizado de forma explicita hasta que el autor la defina.
- No hay informacion sobre sesgos, riesgos de alucinacion ni limitaciones de contexto o idioma; el modelo no es de proposito general y opera sobre latentes de entornos concretos.
- Los pesos estan atados a seis entornos de simulacion especificos; no se documenta su generalizacion a otros entornos o a robotica real.
- La inferencia requiere el encoder, world model, busqueda de acciones y prior de acciones del entorno correspondiente, que no forman parte del repositorio.
- El repositorio tiene 0 descargas y 0 likes, y no se han publicado evaluaciones externas ni benchmarks, lo que limita la validacion independiente.
- La model card no detalla la arquitectura ni el numero de parametros, lo que dificulta estimar costes de despliegue y comparar con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/stardust8979/FCP-weights
- Tareas de evaluacion: https://huggingface.co/datasets/stardust8979/FCP-evaluation-tasks
