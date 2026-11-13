# zenteiq-ai/scirex-wno-darcy-physics-extra-fields

## Resumen

ScireX WNO · Darcy flow 2D (physics-only, extra-fields run) es un checkpoint de un operador neuronal de tipo Wavelet Neural Operator (WNO) entrenado para resolver la ecuacion de Darcy en 2D sobre una malla de 85 x 85 puntos. Lo desarrolla el proyecto zenteiq-ai dentro de la libreria open source scirex, implementada en JAX/Flax, y se publica bajo licencia Apache 2.0. No es un modelo de lenguaje: es un surrogate numerico que aproxima el campo de presion a partir de un campo de permeabilidad.

La particularidad de esta ejecucion es que el entrenamiento es physics-only (label-free): el modelo se ajusta unicamente minimizando la energia de Ritz Q4 de la formulacion variacional, sin usar etiquetas de solucion. Emplea 2.829.601 parametros y alcanza un error relativo L2 de 1,262 % en test sobre 20.000 campos de coeficientes, frente al 2,020 % de la ejecucion data-driven del mismo proyecto.

Es relevante porque demuestra que un operador neuronal de ~2,8 M de parametros puede aproximarse al suelo teorico de la formulacion (0,31 % de error relativo L2 para la solucion exacta Q4) sin supervision, un resultado que reduce el coste de generar datos etiquetados para simulaciones de medios porosos y CFD. El checkpoint corresponde a los pesos de la ultima epoca, no a un checkpoint seleccionado sobre test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wavelet Neural Operator (WNO), implementada en JAX/Flax |
| Parametros totales | 2.829.601 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 85 x 85 = 7.225 puntos de malla |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa) |
| Idiomas soportados | no aplica (modelo numerico, no linguistico) |
| Licencia | Apache 2.0 (pesos); codigo LGPL-3.0 |
| Formato de pesos | safetensors (`model.safetensors`), acompanado de `config.json` y `sample.safetensors` |

## Arquitectura y entrenamiento

WNO es un operador neuronal que aplica transformadas wavelet dentro del bloque de convolucion espectral, lo que le permite aprender mapeos entre funciones sobre mallas regulares con coste cuasi-lineal respecto al numero de puntos. En este caso el mapeo es permeabilidad (entrada) a presion (salida) sobre una malla de 85 x 85. El modelo tiene 2.829.601 parametros y las estadisticas de normalizacion viven en `config.json`; sin ellas los pesos son inutilizables.

El entrenamiento usa AdamW con lr 1e-3 reducida a la mitad nueve veces a lo largo de la ejecucion, weight decay 1e-6, sin clipping, batch de 20 y 200.000 pasos (presupuesto asequible, segun el autor, no convergido). La perdida es unicamente la energia de Ritz Q4, sin etiquetas de solucion, y la normalizacion se ajusta solo sobre los campos de coeficientes de entrenamiento. Se usan 1.000 muestras liberadas mas campos muestreados sin etiqueta hasta un total de 20.000 campos de coeficientes vistos. Semilla 0, pesos de la ultima epoca y tiempo de entrenamiento de aproximadamente 170 minutos por ejecucion. Los datos de Darcy provienen de Li et al. (ICLR 2021), registro Zenodo 12784353, bajo CC BY 4.0.

## Capacidades

- Aproximacion del campo de presion en la ecuacion de Darcy 2D a partir de un campo de permeabilidad en malla de 85 x 85.
- Inferencia sobre mallas regulares con 7.225 puntos de entrada y salida de la misma resolucion.
- Entrenamiento sin etiquetas mediante minimizacion de una forma variacional (energia de Ritz Q4).
- Evaluacion reproducible contra un par input/expected_output incluido en `sample.safetensors`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision ni audio.
- Generalizacion limitada a los rangos de entrada del benchmark de entrenamiento.

## Casos de uso

- Simulacion rapida de medios porosos: dado un campo de permeabilidad sintetico o medido, el modelo devuelve el campo de presion en una malla de 85 x 85 sin resolver el sistema de elementos finitos, lo que permite explorar miles de realizaciones geologicas en minutos.
- Generacion de datos sinteticos para entrenar otros surrogates: al ser label-free, se puede usar para producir pares permeabilidad-presion a bajo coste y alimentar pipelines de aprendizaje supervisado.
- Validacion cruzada de solvers numericos: comparar la salida del WNO con la solucion Q4 en casos de test acotados sirve como comprobacion rapida de integridad del solver.
- Prototipado en CFD y geociencias: integrar el checkpoint en un flujo JAX/Flax existente para estimar presiones en experimentos de laboratorio antes de lanzar simulaciones completas.
- Investigacion en operadores neuronales physics-informed: reproducir el resultado de 1,262 % de error relativo L2 con los scripts del repositorio en la etiqueta v1.0.0 y comparar contra la variante data-driven (2,020 %).
- Benchmarking de arquitecturas: usar este checkpoint como referencia WNO frente a FNO, GINO y Transolver del mismo proyecto sobre el mismo conjunto de test.
- Educacion y docencia: el par de ejemplo en `sample.safetensors` permite demostrar la evaluacion de un operador neuronal sin descargar el dataset completo.

## Benchmarks y rendimiento

| Metric | Este modelo | Referencia publicada |
|---|---|---|
| Error relativo L2 en test, ejecucion extra-fields (20k campos, sin etiquetas) | 1,262 % | No existe referencia physics-only; referencia data-driven del proyecto: 2,020 % (aprox. 0,84 % publicado por Tripura y Chakraborty) |
| Suelo teorico de la solucion exacta Q4 de la misma formulacion | no aplica | 0,31 % de error relativo L2 |

Menor es mejor. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, ya que el modelo no es linguistico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa para 2,83 M de parametros; en la practica el cuello de botella es la memoria de la malla (85 x 85) y el entorno JAX, no los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA o ROCm compatible con JAX; una RTX 4090, A100 o H100 funcionan sobradamente. Tambien es viable en CPU para inferencia puntual.
- Cabe en cualquier GPU consumer moderna e incluso en entornos integrados sin GPU dedicada.
- Opciones de despliegue: JAX/Flax con los scripts del repositorio scirex (etiqueta v1.0.0), en particular `scripts/benchmarks/darcy_physics/infer.py`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. El tiempo de entrenamiento reportado es de aproximadamente 170 minutos por ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / malla | Error relativo L2 en test (Darcy 2D, physics-only extra-fields) | Licencia | Repositorio |
|---|---|---|---|---|---|
| ScireX WNO (este) | 2.829.601 | 85 x 85 (7.225 puntos) | 1,262 % | Apache 2.0 | zenteiq-ai/scirex-wno-darcy-physics-extra-fields |
| ScireX FNO | no disponible | 85 x 85 | no disponible | Apache 2.0 | zenteiq-ai/scirex-fno-darcy-physics-extra-fields |
| ScireX GINO | no disponible | 85 x 85 | no disponible | Apache 2.0 | zenteiq-ai/scirex-gino-darcy-physics-extra-fields |
| ScireX Transolver | no disponible | 85 x 85 | no disponible | Apache 2.0 | zenteiq-ai/scirex-transolver-darcy-physics-extra-fields |
| ScireX WNO data-driven | no disponible | 85 x 85 | 2,020 % | Apache 2.0 | zenteiq-ai/scirex-wno-darcy |

Los parametros y errores de los modelos comparables no estan en la informacion proporcionada; solo se dispone de sus identificadores de repositorio y de la referencia data-driven del mismo proyecto.

## Limitaciones y advertencias

- Valido unicamente dentro de los rangos de entrada del benchmark de entrenamiento; fuera de ellos no hay garantia de precision.
- No apto para diseno en sistemas de seguridad critica sin validacion independiente.
- Entrenamiento no convergido segun el autor: se usaron 200.000 pasos por presupuesto, no por criterio de parada.
- Pesos de la ultima epoca, sin seleccion de checkpoint sobre el conjunto de test.
- Dependencia critica de las estadisticas de normalizacion en `config.json`; sin ellas los pesos son inutilizables.
- Resolucion fija de 85 x 85; no se documenta capacidad de interpolacion a otras mallas.
- Riesgo de sesgo hacia la distribucion de los datos de Li et al. (ICLR 2021); no se reportan analisis de sesgo.
- No es un modelo de lenguaje: no admite prompts, tool calling, agentes ni generacion de texto.
- La licencia Apache 2.0 aplica a los pesos; el codigo de scirex es LGPL-3.0 y el dataset original es CC BY 4.0, por lo que conviene revisar `NOTICE` antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenteiq-ai/scirex-wno-darcy-physics-extra-fields
- Repositorio scirex: https://github.com/zenteiq-research/scirex
- Pagina del benchmark Darcy physics: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/darcy_physics/results/comparative.md
- Guia de reproducibilidad: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/reproducibility.md
- Issues del proyecto: https://github.com/zenteiq-research/scirex/issues
- Paper de WNO (Tripura y Chakraborty, 2022): https://arxiv.org/abs/2205.02191
- Dataset de Darcy flow (Li et al., ICLR 2021, Zenodo 12784353): https://zenodo.org/records/12784353
- Checkpoint FNO del mismo benchmark: https://huggingface.co/zenteiq-ai/scirex-fno-darcy-physics-extra-fields
- Checkpoint GINO del mismo benchmark: https://huggingface.co/zenteiq-ai/scirex-gino-darcy-physics-extra-fields
- Checkpoint Transolver del mismo benchmark: https://huggingface.co/zenteiq-ai/scirex-transolver-darcy-physics-extra-fields
- Ejecucion data-driven de WNO en Darcy: https://huggingface.co/zenteiq-ai/scirex-wno-darcy
- WNO en pipe flow: https://huggingface.co/zenteiq-ai/scirex-wno-pipe
- WNO en Navier-Stokes 2D: https://huggingface.co/zenteiq-ai/scirex-wno-navier-stokes
- WNO en chip cooling: https://huggingface.co/zenteiq-ai/scirex-wno-chip-cooling
- WNO en AirfRANS: https://huggingface.co/zenteiq-ai/scirex-wno-airfrans
