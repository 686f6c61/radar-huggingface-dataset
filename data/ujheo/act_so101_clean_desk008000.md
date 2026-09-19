# ujheo/act_so101_clean_desk008000

## Resumen

El modelo `ujheo/act_so101_clean_desk008000` es un checkpoint de politica robotica publicado en HuggingFace por el usuario ujheo. Por la convencion de nombres del repositorio, el identificador sugiere una politica basada en ACT (Action Chunking Transformer) entrenada para el brazo robotico de bajo coste SO-101 (familia SO-100/SO-101 del ecosistema LeRobot) en una tarea de recogida o limpieza de escritorio (`clean_desk`). No obstante, la model card no incluye descripcion, pipeline declarado, licencia ni idiomas, por lo que esta interpretacion procede del nombre del repositorio y no de documentacion oficial del propio modelo.

Se trata de un modelo pequeno: 51.668.614 parametros (unos 51,7 millones) segun los pesos en formato safetensors, con un repositorio de 0,2 GB. Este orden de magnitud es coherente con una politica de imitacion ligera disenada para ejecutarse en tiempo real sobre hardware de consumo, no con un modelo de lenguaje generativo.

La relevancia de este tipo de checkpoints es practica: permite reproducir o reentrenar una politica de manipulacion concreta dentro del flujo de trabajo de LeRobot, sin necesidad de GPU de datacenter. Sin embargo, el modelo acumula 16 descargas y 0 likes en el momento de la consulta, no tiene licencia declarada y no aporta informacion de entrenamiento, por lo que debe considerarse un artefacto experimental de uso interno mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del repositorio sugiere ACT, Action Chunking Transformer; no confirmado en la model card) |
| Parametros totales | 51.668.614 (dato de los pesos safetensors) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se declaran pesos safetensors; no se listan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible (se trata de una politica robotica, no de un modelo de lenguaje; las instrucciones de tarea dependen del dataset de entrenamiento, no documentado) |
| Licencia | no disponible (no se especifica ninguna licencia en el repositorio) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-19 |
| Fecha de ultima actualizacion | 2026-09-19 |
| Descargas / likes | 16 / 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna en la model card del repositorio. Los unicos metadatos disponibles son la etiqueta `safetensors` y la region `us`. El nombre `act_so101_clean_desk008000` apunta a un checkpoint de ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitacion que predice secuencias de acciones (chunks) en lugar de acciones individuales, habitualmente combinado con un codificador visual y un transformer encoder-decoder. Esta descripcion es una inferencia basada en la convencion de nombres del ecosistema SO-100/SO-101 y no una confirmacion documentada por el autor.

Tampoco hay informacion sobre el numero de tokens o episodios de entrenamiento, la composicion del dataset, la plataforma de teleoperacion utilizada ni si se aplicaron tecnicas de refinamiento posteriores (RLHF, DPO u otras). El sufijo `008000` podria corresponder a un paso de entrenamiento o a un indice de checkpoint dentro de una serie, pero esto no esta confirmado. En consecuencia, no es posible evaluar la calidad del ajuste, la diversidad de las demostraciones ni la robustez ante variaciones de iluminacion, posicion de objetos o punto de vista de la camara.

## Capacidades

- Generacion de acciones de manipulacion robotica: el modelo esta pensado para producir comandos de control para un brazo SO-101, presumiblemente a partir de observaciones visuales y del estado de las articulaciones, aunque la interfaz exacta no esta documentada.
- Ejecucion de una tarea concreta: el nombre `clean_desk` sugiere una politica especializada en ordenar o limpiar una superficie de escritorio, no una politica generalista.
- Aprendizaje por imitacion: no es un modelo de proposito general ni acepta instrucciones en lenguaje natural de forma confirmada.
- Tool calling / function calling: no disponible; no es una capacidad esperable en una politica robotica de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica en el sentido habitual; no hay informacion sobre el idioma de las anotaciones de tarea.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; se desconoce si incorpora entrada visual, si bien es habitual en este tipo de politicas ACT, pero no esta confirmado en la informacion proporcionada.

## Casos de uso

- Reproduccion de resultados en investigacion sobre SO-101: cargar el checkpoint en un entorno de simulacion o en un banco de pruebas fisico para verificar si la politica reproduce la tarea de limpieza de escritorio antes de invertir en un dataset propio.
- Punto de partida para fine-tuning con datos propios: al ser un modelo de 51,7 millones de parametros y 0,2 GB, se puede reentrenar con unas pocas horas de grabaciones propias de la misma tarea adaptandolo a una mesa, iluminacion o camara distintas.
- Comparacion de estrategias de aprendizaje por imitacion: utilizar este checkpoint como linea base frente a alternativas como Diffusion Policy o VLA ligeros en un mismo banco de tareas, siempre que se reproduzca el mismo setup de sensores.
- Docencia y formacion en robotica de bajo coste: sirve como ejemplo de politica preentrenada dentro de un taller practico sobre LeRobot y brazos SO-101, dado su tamano reducido y su facil despliegue.
- Validacion de pipelines de teleoperacion: comprobar la calidad de las demostraciones grabadas con un dispositivo de teleoperacion comparando el rendimiento de la politica entrenada con las trayectorias humanas de referencia.
- Despliegue en robot de bajo coste con computacion embebida: por su tamano, es candidato a ejecutarse junto al controlador en una GPU de consumo o incluso en hardware integrado, siempre que la latencia de inferencia resultante sea compatible con el bucle de control.
- Prototipado de automatizacion de tareas de ordenacion sencillas: tareas como recoger objetos de una mesa y colocarlos en una bandeja podrian abordarse con este tipo de politica si el dominio coincide con el del entrenamiento, aunque no hay evidencia publicada de su tasa de exito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de tasas de exito, numero de episodios de evaluacion, comparaciones con lineas base ni curvas de aprendizaje. Cualquier cifra de rendimiento deberia obtenerse mediante evaluacion propia en el mismo setup hardware y de sensores empleado durante el entrenamiento, que tampoco esta documentado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,21 GB en precision completa (fp32) y en torno a 0,1 GB en fp16, partiendo de 51,7 millones de parametros. Estas cifras corresponden solo a los pesos y no incluyen el resto del grafo de la politica (codificador visual, buffers de observacion, estados de control), por lo que el consumo real puede ser bastante mayor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es, en principio, suficiente para una politica de este tamano. No hay requisitos publicados por el autor.
- GPU de consumo: cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090 o equivalentes, e incluso en iGPU o aceleradores integrados, siempre que el resto del pipeline (por ejemplo, el codificador de vision) quepa en memoria.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI no son aplicables, ya que no es un modelo de lenguaje. El despliegue esperable es mediante PyTorch y el ecosistema LeRobot, ejecutando inferencia directamente sobre la politica y conectandola al bucle de control del brazo SO-101.
- Latencia y throughput: no disponibles. En una politica de control, la latencia importa mas que el throughput en tokens, y este dato no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ujheo/act_so101_clean_desk008000 | 51,7 M | no disponible | no disponible | no disponible | HuggingFace, 16 descargas |
| Otros checkpoints ACT para SO-100/SO-101 | no disponible | no disponible | no disponible | variable segun autor | HuggingFace y LeRobot |
| Diffusion Policy para manipulacion | no disponible | no disponible | no disponible | variable segun implementacion | Repositorios de investigacion |
| Politicas VLA ligeras (por ejemplo, familias tipo SmolVLA) | no disponible | no disponible | no disponible | variable | HuggingFace |

No se dispone de cifras verificables de parametros, contexto, rendimiento ni licencia de las alternativas dentro de la informacion proporcionada, por lo que la comparativa cuantitativa no puede completarse. La unica comparacion solida es de orden de magnitud: este checkpoint es un modelo muy pequeno y especializado, frente a politicas VLA que incorporan modelos de lenguaje de miles de millones de parametros y requieren hardware notablemente superior.

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripcion de la tarea, del dataset, del hardware de recogida ni de las condiciones de entrenamiento, lo que impide reproducir el setup.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. Tratarlo como no apto para produccion hasta que el autor aclare los terminos.
- Sesgos y sobreajuste al dominio: al ser una politica entrenada para un escritorio concreto, es probable que degrade su rendimiento ante cambios de iluminacion, fondo, posicion de la camara, tipo de objetos o variaciones del propio robot (calibracion de articulaciones, holguras mecanicas).
- Riesgo de fallo silencioso: las politicas de imitacion pueden ejecutar movimientos plausibles pero incorrectos cuando la observacion se sale de la distribucion de entrenamiento. Es imprescindible un mecanismo de parada de emergencia y limites de par en el controlador.
- Sin datos de seguridad: no hay informacion sobre fuerzas aplicadas, velocidades maximas ni comportamiento ante colisiones.
- Adopcion muy baja: 16 descargas y 0 likes, sin issues ni discusion visible, lo que reduce la probabilidad de encontrar soporte o correcciones de la comunidad.
- Idiomas: irrelevante en el sentido de LLM, pero se desconoce el idioma y el formato de las anotaciones de tarea empleadas durante el entrenamiento, dato relevante si la politica condiciona su comportamiento a una instruccion textual.
- Fecha de publicacion futura respecto a la fecha de consulta disponible en los metadatos (2026-09-19), lo que sugiere que el repositorio podria haberse subido como prueba o que los metadatos son inconsistentes; conviene verificar el estado actual del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/ujheo/act_so101_clean_desk008000
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los resultados obtenidos correspondian a paginas de una cadena de centros de jardineria (Dehner) y no guardan relacion con el repositorio. No se han encontrado articulos, papers, repositorios de codigo ni demos asociados a este checkpoint en la informacion disponible.
