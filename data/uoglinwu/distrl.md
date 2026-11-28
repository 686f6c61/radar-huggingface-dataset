# UoGLinWU/DistRL

## Resumen

DistRL no es un modelo generativo, sino un repositorio de datos experimentales asociado al artículo *What Makes Distributional RL Work? Disentangling Representation, Loss, and Bellman Backup*. Lo publica el usuario UoGLinWU en Hugging Face y su proposito es permitir la reproduccion y el analisis de los experimentos de aprendizaje por refuerzo distribuido descritos en el paper, junto con el codigo alojado en GitHub.

El repositorio contiene resultados, configuraciones, registros de entrenamiento y checkpoints de tres familias de agentes: TD3, SAC y SuperMimic. Los experimentos cubren tareas de control continuo en DeepMind Control Suite (DMC), HumanoidBench y seguimiento de movimiento del robot humanoide G1. El objetivo cientifico es desentranar la contribucion relativa de la representacion, la funcion de perdida y el backup de Bellman en el rendimiento del RL distribuido.

Por su naturaleza, no dispone de parametros, contexto, tokenizador ni capacidades de generacion de lenguaje. Su relevancia es metodologica: ofrece artefactos verificables (checkpoints, semillas, curvas de evaluacion) para investigadores que quieran replicar o extender el estudio. El tamano del repositorio es de 21,0 GB y el pipeline declarado en Hugging Face es `reinforcement-learning`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de experimentos de RL; agentes TD3, SAC y SuperMimic) |
| Parametros totales | No disponible (depende de la red de cada agente y tarea) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | Checkpoints de RL (formato concreto no especificado en la informacion disponible) |

## Arquitectura y entrenamiento

El repositorio agrupa experimentos de aprendizaje por refuerzo para control continuo. TD3 incluye seis tareas de DMC y seis de HumanoidBench, y cubre atribucion principal, controles de perdida, enrutamiento de gradientes, optimizador, escalado y robustez. SAC cubre dos tareas de DMC y dos de HumanoidBench con cuatro metodos de critico y cinco semillas por tarea. SuperMimic se centra en seguimiento del robot G1 con dos horizontes, perdidas MSE y MeanCE, y cinco semillas.

Los presupuestos de entrenamiento de TD3 y SAC se cuentan en pasos de vector. Las curvas de entrenamiento usan diez episodios de evaluacion por punto y los retornos finales principales de TD3 emplean treinta semillas de reinicio por modelo. No se detalla en la informacion proporcionada el numero total de tokens, la composicion del dataset ni el uso de RLHF o DPO, ya que no son conceptos aplicables a este tipo de trabajo.

## Capacidades

- Reproduccion de experimentos de RL distribuido en control continuo (DMC, HumanoidBench, G1 tracking).
- Analisis de atribucion entre representacion, perdida y backup de Bellman.
- Comparacion de metodos de critico en SAC y de variantes de TD3.
- Evaluacion con multiples semillas (cinco semillas por tarea en SAC y SuperMimic; treinta semillas de reinicio en los retornos finales de TD3).
- Descarga selectiva por agente, benchmark, tarea y experimento, incluyendo checkpoints.
- Acceso a configuraciones, registros y resultados por carpeta de tarea.
- Generacion de las figuras y tablas del paper a partir de los datos de analisis.
- Verificacion de integridad mediante sumas de comprobacion.

## Casos de uso

- Replicacion de resultados del paper: descargar una tarea y experimento concretos con `scripts/download_data.py --algorithm td3 --suite dmc --task humanoid_walk --study main --weights` y reentrenar o reevaluar con las mismas semillas.
- Analisis de atribucion: comparar las variantes de representacion, perdida y backup de Bellman en TD3 para aislar que componente explica las diferencias de rendimiento.
- Estudio de robustez y escalado: reutilizar los experimentos de escalado y robustez de TD3 para evaluar la sensibilidad a hiperparametros y al presupuesto de pasos de vector.
- Investigacion sobre metodos de critico: usar los cuatro metodos de critico de SAC con cinco semillas por tarea para comparar estabilidad y retorno final.
- Seguimiento de movimiento en humanoides: emplear los datos de SuperMimic sobre G1 con dos horizontes y perdidas MSE/MeanCE para estudiar el efecto del horizonte en el tracking.
- Reproduccion de figuras y tablas: ejecutar `python scripts/download_data.py --analysis` para obtener las entradas exactas de las figuras y tablas del articulo.
- Verificacion de integridad de artefactos: validar descargas con `checksums.sha256` antes de reutilizar checkpoints en experimentos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene retornos finales y curvas de evaluacion por tarea, pero no se proporcionan cifras numericas en la informacion suministrada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de la red de cada agente y de la tarea.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no aplica como modelo de lenguaje; el flujo previsto es la descarga mediante `scripts/download_data.py` y la ejecucion del codigo de GitHub.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio completo ocupa 21,0 GB, por lo que conviene la descarga selectiva por tarea y experimento.

## Comparativa con modelos similares

No disponible. No se han proporcionado repositorios comparables de datos experimentales de RL distribuido en la informacion suministrada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no admite prompts, generacion de texto, codigo ni tool calling.
- La licencia no esta disponible, por lo que el uso comercial y la redistribucion no pueden asumirse permitidos.
- Los idiomas soportados no estan disponibles y no son aplicables.
- El repositorio es material experimental: los checkpoints dependen de la configuracion exacta y de las semillas; cambios en el entorno o en las versiones de las dependencias pueden alterar los resultados.
- El tamano de 21,0 GB exige planificar el almacenamiento y usar descargas selectivas.
- No se especifica el formato exacto de los pesos ni el procedimiento de carga; debe consultarse el codigo del repositorio de GitHub.
- Los resultados de las figuras y tablas dependen de los datos de analisis; conviene verificar las sumas de comprobacion antes de su uso.

## Enlaces

- Hugging Face: https://huggingface.co/UoGLinWU/DistRL
- Codigo en GitHub: https://github.com/wulin97/DistRL
- Guia de reproduccion: https://github.com/wulin97/DistRL/blob/main/docs/REPRODUCING.md
- README de TD3: https://huggingface.co/UoGLinWU/DistRL/blob/main/td3/README.md
- README de SAC: https://huggingface.co/UoGLinWU/DistRL/blob/main/sac/README.md
- Datos de SuperMimic (G1 tracking): https://huggingface.co/UoGLinWU/DistRL/tree/main/supermimic/g1_tracking
- Datos de analisis: https://huggingface.co/UoGLinWU/DistRL/blob/main/td3/analysis/README.md
- Indice de experimentos: https://huggingface.co/UoGLinWU/DistRL/blob/main/catalog.csv
- Sumas de comprobacion: https://huggingface.co/UoGLinWU/DistRL/blob/main/checksums.sha256
