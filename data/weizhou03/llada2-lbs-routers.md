# weizhou03/llada2-lbs-routers

## Resumen

`weizhou03/llada2-lbs-routers` es un repositorio de pesos auxiliares (routers) para la decodificacion especulativa EB-Decode aplicada al modelo LLaDA2.0-mini. No se trata de un modelo de lenguaje completo, sino de un par de clasificadores ligeros (`router_ep1.pt` y `router_ep3.pt`) que seleccionan dinamicamente puntos de corte o "frontiers" en el proceso de decodificacion por bloques de LLaDA2.0-mini. El autor reproduce con estos pesos la Tabla 4 del articulo asociado a EB-Decoding.

El repositorio lo publica el usuario `weizhou03` y esta pensado para cargarse mediante la funcion `load_router(path, 64, device)` del script `dmax/train_router_sdar.py`, apuntando la variable de entorno `DMAX_MODEL` a la ruta local de LLaDA2.0-mini. Los routers se entrenaron sobre caracteristicas extraidas del dataset `weizhou03/Llada2_EB_Decode_512_sequential_dataset`, compuesto por 71.045 trayectorias correctas con 6 frontiers cada una y ventana de 64.

La relevancia de esta publicacion es acotada: sirve como material de reproduccion para investigadores que trabajen con decodificacion especulativa en modelos de difusion de texto (familia LLaDA) y quieran replicar los resultados del paper. No es un artefacto utilizable de forma autonoma para inferencia generica. El tamano del repositorio es de 0,0 GB, lo que sugiere pesos de muy pocos parametros o ficheros ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Router clasificador (NewRouter) sobre caracteristicas de LLaDA2.0-mini; no es un transformer generativo |
| Parametros totales | no disponible (repositorio de 0,0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de 64 en las caracteristicas de entrenamiento (no es contexto de generacion) |
| Tipos de cuantizacion | no disponible (pesos en `.pt`, formato PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`): `router_ep1.pt`, `router_ep3.pt` / `router.pt` |

## Arquitectura y entrenamiento

El componente publicado es un `NewRouter` definido en `train/sdar/new_router.py` y entrenado con `dmax/train_router_sdar.py`. Se alimenta de caracteristicas extraidas de LLaDA2.0-mini sobre trayectorias de decodificacion y aprende a predecir, mediante una cabeza de clasificacion binaria (BCE), si un frontier candidato es correcto (etiqueta CE < 1.0). El entrenamiento se realizo durante 3 epocas con learning rate 5e-5 y batch de 64 sobre 71.045 trayectorias correctas, cada una con 6 frontiers y ventana de 64.

Se publican dos variantes: `router_ep1.pt`, seleccionada sobre el conjunto de desarrollo y correspondiente a la configuracion reportada en el paper, y `router_ep3.pt` (alias `router.pt`), seleccionada por mejor BCE de validacion y planteada como barrido alternativo. La innovacion es de infraestructura mas que de modelado: el router permite decidir dinamicamente en que punto de la decodificacion por bloques conviene aceptar tokens, lo que se enmarca en la tecnica EB-Decode (decodificacion especulativa por bloques) para modelos de difusion de texto como LLaDA2.0-mini.

## Capacidades

- Seleccion de frontiers en decodificacion especulativa EB-Decode para LLaDA2.0-mini.
- Clasificacion binaria de candidatos de corte (correcto / incorrecto) mediante BCE.
- Integracion con el pipeline de entrenamiento `dmax/train_router_sdar.py` mediante `load_router(path, 64, device)`.
- Reproduccion de la Tabla 4 del paper de EB-Decoding.
- No genera texto, no razona, no ejecuta codigo ni soporta tool calling por si mismo.
- No dispone de capacidades multilingues, vision, audio ni modo thinking propias.

## Casos de uso

- Reproduccion de resultados academicos: cargar `router_ep1.pt` con `load_router` y `DMAX_MODEL` apuntando a LLaDA2.0-mini para replicar la Tabla 4 del paper de EB-Decoding.
- Barrido de hiperparametros del router: comparar `router_ep1.pt` frente a `router_ep3.pt` para evaluar el impacto de la seleccion por dev frente a la seleccion por BCE de validacion.
- Investigacion en decodificacion especulativa: usar los routers como linea base para experimentos con nuevos criterios de seleccion de frontiers en modelos de difusion de texto.
- Extension del dataset de trayectorias: reentrenar el router sobre el dataset `Llada2_EB_Decode_512_sequential_dataset` o variantes con distinta ventana para estudiar sensibilidad al tamano de ventana.
- Integracion en pipelines de evaluacion de LLaDA2.0-mini: incorporar el router como componente de decision en un banco de pruebas de decodificacion por bloques.
- Docencia y formacion: ilustrar como se entrena un clasificador auxiliar sobre caracteristicas internas de un modelo de difusion de texto en un curso de IA generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia la reproduccion de la Tabla 4 del paper, sin incluir cifras numericas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y los routers son ficheros `.pt` ligeros, por lo que el coste dominante sera el del modelo base LLaDA2.0-mini.
- GPU recomendadas: no disponibles de forma especifica; dependen del modelo base LLaDA2.0-mini sobre el que se ejecuta el router.
- Compatibilidad con GPU de consumo: probable para el router en si (pesos minimos), pero condicionada por los requisitos de LLaDA2.0-mini.
- Opciones de despliegue: carga via PyTorch y `dmax/train_router_sdar.py::load_router`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada routers comparables publicados para EB-Decode ni para LLaDA2.0-mini, ni se dispone de datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: sin LLaDA2.0-mini y el pipeline `dmax` no produce ninguna funcionalidad util.
- Requiere configurar `DMAX_MODEL` con la ruta local correcta a LLaDA2.0-mini; un error en esta variable invalida la carga.
- Los pesos estan en formato PyTorch (`.pt`), no en safetensors ni GGUF, lo que limita su uso con herramientas de inferencia estandar.
- Licencia no declarada: no puede asumirse uso comercial sin consultar al autor.
- Idiomas no especificados: el router no procesa lenguaje de forma directa, pero su comportamiento depende del modelo base.
- Entrenado exclusivamente sobre 71.045 trayectorias correctas con ventana 64 y 6 frontiers; puede degradarse fuera de esa distribucion.
- Riesgo de sobreajuste a la configuracion del paper (3 epocas, lr 5e-5, batch 64); no se documentan evaluaciones fuera de ese regimen.
- Repositorio sin descargas ni likes en el momento de la consulta: ausencia de validacion comunitaria independiente.
- La model card remite a `llada2_repro/README.md` en la rama `dmax-lbs` de EB-Decoding, documentacion externa no incluida en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/weizhou03/llada2-lbs-routers
- Dataset de entrenamiento: https://huggingface.co/datasets/weizhou03/Llada2_EB_Decode_512_sequential_dataset
- Repositorio EB-Decoding (rama `dmax-lbs`, `llada2_repro/README.md`): no disponible como URL en la informacion proporcionada
- Paper de EB-Decoding (Tabla 4): no disponible como URL en la informacion proporcionada
