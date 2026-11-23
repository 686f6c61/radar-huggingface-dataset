# wusmai/daoct_retinal_seg_uramodi-weights

## Resumen

Estos pesos forman parte del bundle MONAI Model Zoo `daoct_retinal_seg_uramodi`, desarrollado por el autor `wusmai` y vinculado a la Washington University in St. Louis, para la segmentacion de capas retinianas en imagenes de tomografia de coherencia optica (OCT) en el marco del reto DA-OCT Challenge. No se trata de un modelo de lenguaje, sino de un modelo de vision especializado en segmentacion semantica medica: un SegFormer con codificador MiT-B5 que produce un mapa de etiquetas de 10 clases sobre imagenes OCT.

El repositorio aloja unicamente los ficheros de gran tamano declarados en el `large_files.yml` del bundle; la documentacion completa, la cadena de procedencia y el mapa de etiquetas residen en el propio bundle del Model Zoo. El peso principal, `models/weights.pt` (328 MB), es el estado inicial del SegFormer sobre el que se aplica una escalera de autoentrenamiento de cuatro fases con guardas, ejecutada en la maquina de evaluacion, y desde el que despacha un mecanismo de enrutado por forma.

Su relevancia actual es acotada y muy especifica: sirve como referencia reproducible para pipelines de adaptacion en inferencia sobre el reto DA-OCT, con validacion documentada sobre las 658 imagenes del conjunto de test oculto. No esta pensado para uso clinico ni para integracion generica en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer con codificador MiT-B5 (transformer de segmentacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen, resolucion no disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | BSD 2-Clause |
| Formato de pesos | `weights.pt` (PyTorch), mas checkpoints auxiliares `colscan.pt` y `edgefit.pt` incluidos en el arbol del bundle |
| Tamano del repositorio | 0.3 GB |
| Clases de salida | 10 clases de capas retinianas |
| Checkpoints auxiliares | `colscan.pt`, `edgefit.pt` (incluidos en el bundle) |

## Arquitectura y entrenamiento

El modelo es un SegFormer cuyo codificador es un MiT-B5, una arquitectura transformer jerarquica con atencion eficiente disenada para segmentacion semantica. Sobre este estado inicial se aplica un pipeline de adaptacion en inferencia ("adaptation-in-serving") que consiste en una escalera de autoentrenamiento de cuatro fases con guardas; los pesos publicados aqui son el punto de partida que esa escalera refina en la maquina de evaluacion. Un mecanismo de despacho enrutado por forma selecciona la ruta de inferencia adecuada.

No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset mas alla de su pertenencia al DA-OCT Challenge, ni sobre el uso de RLHF/DPO (no aplicable en segmentacion). La model card menciona que la adaptacion emplea pasadas backward con acumulacion CUDA no determinista, lo que explica que el comportamiento sea casi determinista pero no bit a bit: la concordancia entre ejecuciones es de 0.9935 de Dice medio por clase e imagen, con una variacion de puntuacion de aproximadamente ±0.001.

## Capacidades

- Segmentacion semantica de imagenes OCT en 10 clases de capas retinianas.
- Adaptacion en inferencia mediante autoentrenamiento de cuatro fases con guardas.
- Enrutado por forma para el despacho de inferencia.
- Checkpoints auxiliares (`colscan.pt`, `edgefit.pt`) que apoyan el pipeline.
- No soporta generacion de texto, codigo, matematicas, vision general, tool calling, agentes ni capacidades multilingues.
- No dispone de modo de razonamiento (thinking mode) ni de entrada multimodal.

## Casos de uso

- Investigacion en segmentacion de capas retinianas: el modelo sirve como linea base reproducible para comparar tecnicas de segmentacion sobre el dataset DA-OCT, dado que su puntuacion esta validada sobre las 658 imagenes del test oculto.
- Reproduccion de resultados del reto DA-OCT: al publicarse los pesos exactos y el hash sha256, un equipo puede reconstruir la cadena oficial y verificar la puntuacion de 0.80230 reportada.
- Evaluacion de pipelines de adaptacion en inferencia: el estado inicial permite medir la ganancia de la escalera de autoentrenamiento de cuatro fases frente a la inferencia directa.
- Auditoria de determinismo: util para estudiar la variabilidad de pipelines con acumulacion CUDA no determinista, con una concordancia documentada de 0.9935 de Dice medio.
- Desarrollo de herramientas de analisis de OCT en entornos de investigacion: el bundle MONAI permite cargar el modelo con la infraestructura estandar del Model Zoo.
- Docencia y prototipado en imagen medica: sirve para ilustrar flujos completos de segmentacion con SegFormer y bundles MONAI sobre datos OCT, sin necesidad de reentrenar desde cero.

## Benchmarks y rendimiento

| Evaluacion | Puntuacion |
|---|---|
| Cadena oficial FINAL (Y4, pipeline sin modificar, 658 imagenes de test oculto) | 0.80230 |
| Leaderboard de la plataforma | 0.80085 |
| Rerun por la ruta del bundle (mismas 658 imagenes) | 0.80211 (-0.00019 frente a la ejecucion original; +0.00126 frente a la plataforma) |
| Concordancia de mascaras entre ejecuciones | 0.9935 de Dice medio por clase e imagen |
| Variacion de puntuacion entre ejecuciones | aproximadamente ±0.001 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el peso principal ocupa 328 MB en disco, por lo que la inferencia cabe holgadamente en GPUs de consumo, aunque el consumo real depende de la resolucion de entrada y del pipeline de adaptacion.
- GPU recomendadas: no especificadas por el autor; el pipeline se ejecuto en la maquina de evaluacion del reto con CUDA.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del checkpoint, aunque no se documenta la VRAM exacta.
- Opciones de despliegue: bundle MONAI Model Zoo (carga via `large_files.yml`), PyTorch para `weights.pt`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de segmentacion de capas retinianas en OCT ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Uso exclusivamente de investigacion ("Research use only"), pese a la licencia BSD 2-Clause.
- No es un modelo de lenguaje: no admite prompts de texto ni tareas generativas.
- No determinista a nivel de bit: las pasadas backward usan acumulacion CUDA no determinista, con variacion de puntuacion de aproximadamente ±0.001.
- Dependencia del bundle: los pesos son solo los ficheros grandes; la documentacion, el mapa de etiquetas y el uso correcto requieren el bundle `daoct_retinal_seg_uramodi`.
- Especifico del dominio OCT y del reto DA-OCT; no se garantiza su generalizacion a otros equipos, poblaciones o protocolos de adquisicion.
- Sin datos publicados sobre sesgos demograficos, alucinacion (no aplicable) ni comportamiento fuera de las 658 imagenes de test del reto.
- No apto para uso clinico sin validacion regulatoria adicional.

## Enlaces

- Hugging Face: https://huggingface.co/wusmai/daoct_retinal_seg_uramodi-weights
- Bundle MONAI Model Zoo `daoct_retinal_seg_uramodi` (referenciado en la model card; URL no disponible en la informacion proporcionada)
- DA-OCT Challenge (URL no disponible en la informacion proporcionada)
