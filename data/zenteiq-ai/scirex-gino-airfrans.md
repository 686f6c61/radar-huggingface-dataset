# zenteiq-ai/scirex-gino-airfrans

## Resumen

ScireX GINO · AirfRANS es un operador neuronal (neural operator) entrenado con la librería open source ScireX (JAX/Flax) para el benchmark AirfRANS de dinámica de fluidos computacional (CFD) en perfiles aerodinámicos. No es un modelo de lenguaje: es un modelo de aprendizaje profundo para resolver ecuaciones en derivadas parciales (PDE) sobre mallas irregulares, en este caso prediciendo campos de velocidad, presión y viscosidad turbulenta alrededor de un perfil alar en régimen RANS (Reynolds-Averaged Navier-Stokes).

El modelo implementa la arquitectura GINO (Geometry-Informed Neural Operator), presentada por Li et al. en NeurIPS 2023 (arXiv:2309.00583), que combina un operador de Fourier (FNO) sobre una malla latente regular con un grafo neuronal (GNO) que procesa la geometría irregular del dominio. El checkpoint contiene 3.894.069 parámetros según la model card (el recuento en safetensors es de 2.152.245 tensores elementales, diferencia atribuible a parámetros no persistidos o compartidos), y se distribuye como pesos de última época de un entrenamiento de 500 épocas.

Es relevante para investigadores y desarrolladores que trabajan en surrogate modelling para CFD: ofrece errores relativos de coeficiente de sustentación del 7,52 % y una correlación de Spearman de 0,99806 en el conjunto de test, con un coste de inferencia de milisegundos frente a las horas de un solver RANS tradicional. La licencia Apache 2.0 sobre los pesos facilita su uso comercial, aunque el código de la librería es LGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GINO (Geometry-Informed Neural Operator): FNO sobre malla latente + GNO sobre grafo de malla |
| Parametros totales | 3.894.069 (model card); 2.152.245 elementos en safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; malla latente de 128 x 64 y submuestreo de 32.000 nodos por caso |
| Tipos de cuantizacion | no disponible (pesos en float32; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (modelo fisico, no linguistico) |
| Licencia | Apache 2.0 (pesos); LGPL-3.0 (codigo ScireX) |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` con estadisticas de normalizacion |

## Arquitectura y entrenamiento

GINO combina dos ramas: un operador de Fourier neuronal (FNO) que aprende la dinamica global sobre una malla latente regular de 128 x 64, y un grafo neuronal (GNO) que propaga informacion sobre la malla irregular del dominio fisico. La entrada por nodo incluye posicion, distancia firmada a la superficie, normal de pared y velocidad de entrada; la salida son velocidad, presion y viscosidad turbulenta en cada nodo. Las estadisticas de normalizacion viven en `config.json` y son imprescindibles: los pesos no son utilizables sin ellas.

El entrenamiento usa el dataset AirfRANS (Bonnet et al., NeurIPS 2022) con 720 casos de entrenamiento, 80 de validacion y 200 de test. Se optimizo con Adam y un ciclo one-cycle con pico de LR 1e-3, precision XLA por defecto (TF32), un subconjunto aleatorio nuevo de 32.000 nodos por caso en cada epoca, funcion de perdida MSE de volumen mas superficie, y 500 epocas con semilla 0. El coste fue de aproximadamente 11,8 horas (unos 84 s/epoca) en una NVIDIA RTX PRO 6000 Blackwell. No se documenta RLHF ni ajuste por preferencias, ya que no es un modelo generativo de texto.

## Capacidades

- Prediccion de campos de velocidad, presion y viscosidad turbulenta en cada nodo de una malla aerodinamica 2D.
- Estimacion del coeficiente de sustentacion (C_L) derivado del campo de presion.
- Evaluacion de error normalizado en nodos de volumen y de pared (metricas Volume y Surf).
- Generalizacion a geometrias de perfil alar dentro del rango de entrenamiento de AirfRANS.
- Inferencia sobre mallas irregulares mediante la rama GNO, sin necesidad de remallado regular.
- Ejecucion en JAX/Flax con soporte XLA y TF32.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un surrogate fisico.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Surrogate modelling en diseno aerodinamico: sustituir el solver RANS en barridos parametricos de perfiles alares para obtener C_L y campos de presion en milisegundos, acelerando la exploracion del espacio de diseno antes de validar con CFD de alta fidelidad.
- Optimizacion de forma: integrar el modelo en bucles de optimizacion topologica donde cada evaluacion del objetivo requiere el campo de presion sobre la superficie del perfil; el coste de inferencia permite miles de evaluaciones por hora.
- Generacion de datasets sinteticos: producir pares entrada-salida etiquetados para preentrenar o aumentar otros modelos de CFD, usando el checkpoint como profesor en destilacion.
- Validacion cruzada de solvers: comparar las predicciones del operador con las de un solver RANS en regimenes dentro del rango de entrenamiento para detectar discrepancias en la implementacion de un solver propio.
- Docencia e investigacion en operadores neuronales: servir como referencia reproducible del benchmark AirfRANS con pesos publicos, configuracion y script de inferencia, util para comparar nuevas arquitecturas.
- Prototipado de gemelos digitales aerodinamicos: desplegar el modelo como servicio de inferencia en pipelines de monitorizacion de condiciones de flujo, siempre con validacion separada para uso critico.
- Benchmarking de hardware JAX: usar la inferencia sobre 200 casos de test como carga de trabajo ligera para medir throughput de GPU con XLA.

## Benchmarks y rendimiento

| Metrica | Este modelo | Referencia publicada (GINO en paper Transolver) |
|---|---|---|
| Volume (MSE normalizado x100) | 2,54 % | 2,97 % |
| Surf (MSE normalizado x100) | 0,158 % | 4,82 % |
| Error relativo C_L | 7,52 % | 18,21 % |
| Spearman rho_L | 0,99806 | 0,9958 |

Las metricas se calculan sobre los 200 casos de test con el codigo de metricas del paper Transolver. Nota de la model card: la metrica Surf podria definirse en el paper como MSE de presion de pared unicamente, lo que seria 4 veces mayor que lo reportado aqui. La ejecucion publicada se evaluo sin el flag `--loader-surf-mask`; el `infer.py` publico anade ese flag para GINO y reporta Volume 2,437 % (24,37e-3) con estos mismos pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, por debajo de 1 GB para los pesos (3,89 M parametros en float32, unos 15,6 MB) mas buffers de activacion para mallas de hasta decenas de miles de nodos; no se publican cifras exactas.
- GPU recomendadas: cualquier GPU con soporte CUDA y XLA; el entrenamiento se realizo en una NVIDIA RTX PRO 6000 Blackwell.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna con CUDA (por ejemplo, RTX 3060 o superior); tambien es viable en CPU para inferencia puntual.
- Opciones de despliegue: JAX/Flax con XLA; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles de forma oficial; el entrenamiento costo unos 84 s/epoca, lo que da una idea del orden de magnitud por paso, pero no se publica latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Repositorio |
|---|---|---|---|---|
| ScireX GINO · AirfRANS | 3.894.069 | Surrogate CFD AirfRANS | Apache 2.0 (pesos) | zenteiq-ai/scirex-gino-airfrans |
| ScireX Transolver · AirfRANS | no disponible | Surrogate CFD AirfRANS | no disponible | zenteiq-ai/scirex-transolver-airfrans |
| ScireX WNO · AirfRANS | no disponible | Surrogate CFD AirfRANS | no disponible | zenteiq-ai/scirex-wno-airfrans |
| GINO (paper Transolver) | no disponible | Surrogate CFD AirfRANS | no disponible | referencia en paper |

Los tres checkpoints de ScireX sobre AirfRANS permiten comparacion directa con las mismas metricas y el mismo codigo de evaluacion. No se dispone de datos de parametros ni licencia de los checkpoints Transolver y WNO en la informacion proporcionada.

## Limitaciones y advertencias

- Valido unicamente dentro del rango de entradas del benchmark AirfRANS; extrapolar a geometrias, numeros de Reynolds o condiciones de flujo fuera de ese rango no esta garantizado.
- No apto para diseno critico de seguridad sin validacion independiente con CFD de alta fidelidad.
- Los pesos son inutilizables sin las estadisticas de normalizacion de `config.json`.
- La metrica Surf puede no ser directamente comparable con la del paper segun la definicion exacta de la metrica de pared.
- El recuento de parametros difiere entre la model card (3.894.069) y el safetensors (2.152.245 elementos); conviene verificar la integridad con `sample.safetensors`.
- Licencia Apache 2.0 en pesos, pero el codigo de ScireX es LGPL-3.0: revisar obligaciones de distribucion si se integra en productos.
- El dataset AirfRANS esta bajo ODbL v1.0; respetar los terminos de atribucion en `NOTICE`.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento simbolico.
- Riesgo de alucinacion en sentido estricto no aplica, pero si de predicciones fisicamente inconsistentes fuera del dominio de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenteiq-ai/scirex-gino-airfrans
- Repositorio ScireX: https://github.com/zenteiq-research/scirex
- Pagina de benchmark AirfRANS: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/airfrans/results/comparative.md
- Issues del repositorio: https://github.com/zenteiq-research/scirex/issues
- Paper GINO: Li et al., NeurIPS 2023, https://arxiv.org/abs/2309.00583
- Checkpoint Transolver AirfRANS: https://huggingface.co/zenteiq-ai/scirex-transolver-airfrans
- Checkpoint WNO AirfRANS: https://huggingface.co/zenteiq-ai/scirex-wno-airfrans
- Checkpoint GINO Darcy: https://huggingface.co/zenteiq-ai/scirex-gino-darcy
- Checkpoint GINO Navier-Stokes 2D: https://huggingface.co/zenteiq-ai/scirex-gino-navier-stokes
- Checkpoint GINO Pipe flow: https://huggingface.co/zenteiq-ai/scirex-gino-pipe
- Checkpoint GINO Chip cooling: https://huggingface.co/zenteiq-ai/scirex-gino-chip-cooling
