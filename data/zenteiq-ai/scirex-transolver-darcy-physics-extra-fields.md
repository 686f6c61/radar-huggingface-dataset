# zenteiq-ai/scirex-transolver-darcy-physics-extra-fields

## Resumen

ScireX Transolver · Darcy flow 2D (physics-only, extra-fields run) es un operador neuronal entrenado para resolver la ecuacion de Darcy bidimensional en regimen fisico puro, es decir, sin etiquetas de solucion durante el entrenamiento. Lo desarrolla zenteiq-ai dentro de la biblioteca de codigo abierto scirex, implementada en JAX/Flax, y se publica como pesos finales de una ejecucion concreta del benchmark. El modelo aprende un mapeo entre un campo de permeabilidad de entrada y el correspondiente campo de presion, ambos sobre una malla de 85 x 85 (7.225 puntos).

La relevancia de esta ficha no esta en el tamano (2.826.945 parametros, muy lejos de un LLM) sino en la metodologia: es un ejemplo de operador neuronal fisicamente informado que se entrena minimizando unicamente la energia de Ritz Q4, sin disponer de soluciones de referencia. Esto lo situa en la linea de trabajo de los "physics-informed neural operators" y permite comparar su error con el de variantes puramente data-driven como FNO, GINO o WNO sobre el mismo benchmark.

La arquitectura es Transolver, un transformer con atencion sobre "slices" fisicos propuesto por Wu et al. (ICML 2024). El checkpoint se distribuye en safetensors y requiere las estadisticas de normalizacion incluidas en `config.json`; sin ellas los pesos no son utilizables. La licencia de los pesos es Apache 2.0 y el codigo de la biblioteca es LGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transolver (neural operator basado en transformer con atencion por slices fisicos) |
| Parametros totales | 2.826.945 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 7.225 puntos en malla 85 x 85 |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo numerico, no linguistico) |
| Licencia | Apache 2.0 (pesos); codigo de scirex bajo LGPL-3.0 |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` con normalizacion y `sample.safetensors` de validacion |

## Arquitectura y entrenamiento

Transolver es un operador neuronal que sustituye la atencion global sobre todos los puntos de la malla por una atencion sobre "slices" fisicos aprendidos: el modelo agrupa los puntos en funcion de su estado fisico y aplica atencion dentro de cada slice, reduciendo el coste cuadratico respecto a un transformer denso sobre la malla completa. Con 2.826.945 parametros, es un modelo deliberadamente compacto, disenado para demostrar que un operador pequeno puede aproximar la solucion de una EDP con error bajo cuando se entrena con la formulacion adecuada.

El entrenamiento es label-free: se optimiza exclusivamente la energia de Ritz Q4 de la ecuacion de Darcy, sin soluciones de referencia. Se usan 10.000 campos de coeficiente en total (los 1.000 publicados mas campos muestreados sin etiqueta), con AdamW, lr 1e-3, weight decay 1e-5, scheduler cosine one-cycle, recorte de norma global 0.1, batch 4 y 125.000 pasos. La normalizacion se ajusta solo sobre los campos de coeficiente de entrenamiento. La ejecucion tarda aproximadamente 39 minutos y se publican los pesos de la ultima epoca con semilla 0, sin seleccion de checkpoint sobre el conjunto de test. El suelo teorico de la resolucion Q4 exacta de la misma formulacion es 0,31 % de error L2 relativo.

## Capacidades

- Prediccion del campo de presion de Darcy 2D a partir de un campo de permeabilidad en malla 85 x 85.
- Resolucion de una EDP eliptica en regimen fisico puro, sin necesidad de datos etiquetados en inferencia.
- Generalizacion dentro del rango de entrenamiento del benchmark (campos de coeficiente similares a los de Li et al., ICLR 2021).
- Inferencia determinista: un unico forward pass produce el campo de salida completo.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades linguisticas.
- No es un modelo generativo de texto; no debe tratarse como tal.

## Casos de uso

- Validacion de pipelines de operadores neuronales: sirve como referencia fisica pura para comprobar que una instalacion de scirex reproduce el 0,565 % de error L2 relativo sobre el test de Darcy 2D.
- Prototipado de surrogate models en ingenieria de yacimientos: con un campo de permeabilidad sintetico se obtiene un campo de presion aproximado en milisegundos, util para exploracion temprana antes de simulaciones de mayor fidelidad.
- Comparativa de metodos physics-informed frente a data-driven: permite contrastar Transolver con FNO, GINO y WNO del mismo benchmark usando la misma particion de test.
- Docencia e investigacion en EDPs: ejemplo reproducible y de bajo coste computacional para ilustrar como se entrena un operador neuronal solo con la energia de Ritz.
- Generacion de datos sinteticos de presion para preentrenar otros modelos: el checkpoint puede actuar como generador de pares (permeabilidad, presion) dentro del rango de entrenamiento.
- Benchmarking de hardware y frameworks JAX/Flax: al ser un modelo pequeno (2,8 M de parametros), es adecuado para medir latencias de inferencia en CPU y GPU sin cuellos de botella de memoria.

## Benchmarks y rendimiento

| Metrica | Este modelo | Referencia publicada |
|---|---|---|
| Error L2 relativo en test, ejecucion extra-fields (10k campos, sin etiquetas) | 0,565 % | No existe referencia physics-only; referencia data-driven: 0,57 % (Wu et al., ICML 2024, tabla 2) |
| Suelo teorico de la resolucion Q4 exacta | 0,31 % | — |

El error de 0,565 % queda por debajo de la referencia data-driven de 0,57 % citada por los autores, aunque la comparacion no es estrictamente equivalente porque el regimen de entrenamiento difiere (physics-only frente a supervisado). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no procede inventarlos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 para los pesos (2,8 M de parametros); el cuello de botella real es la malla de 7.225 puntos y las activaciones intermedias, no el tamano del modelo.
- GPU recomendadas: cualquier GPU moderna con soporte JAX/CUDA; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una T4 son suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con al menos 2 GB de VRAM, y tambien en CPU.
- Opciones de despliegue: JAX/Flax (entorno nativo de scirex); no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a LLMs.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento reportado es de aproximadamente 39 minutos por ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / malla | Error L2 relativo (Darcy 2D, extra-fields) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Transolver (este) | 2.826.945 | 85 x 85 (7.225 puntos) | 0,565 % (physics-only) | Apache 2.0 | Hugging Face |
| FNO | no disponible | 85 x 85 | no disponible en esta ficha | no disponible | Hugging Face (scirex-fno-darcy-physics-extra-fields) |
| GINO | no disponible | 85 x 85 | no disponible en esta ficha | no disponible | Hugging Face (scirex-gino-darcy-physics-extra-fields) |
| WNO | no disponible | 85 x 85 | no disponible en esta ficha | no disponible | Hugging Face (scirex-wno-darcy-physics-extra-fields) |
| Transolver data-driven | no disponible | 85 x 85 | no disponible en esta ficha | no disponible | Hugging Face (scirex-transolver-darcy) |

Los checkpoints FNO, GINO y WNO del mismo benchmark estan publicados por el mismo autor, pero sus metricas no se incluyen en la informacion proporcionada; deben consultarse en la pagina comparativa del repositorio.

## Limitaciones y advertencias

- Valido solo dentro del rango de entrada del benchmark de entrenamiento; fuera de el la prediccion no esta garantizada.
- No apto para diseno en entornos de seguridad critica sin validacion independiente, segun indica el propio autor.
- Los pesos son inutilizables sin las estadisticas de normalizacion de `config.json`; un uso incorrecto produce salidas erroneas sin aviso.
- No es un modelo de lenguaje: no tiene capacidades de texto, codigo, razonamiento simbolico ni atencion conversacional, y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Riesgo de alucinacion en sentido estricto no aplica, pero si existe riesgo de extrapolacion silenciosa fuera del dominio fisico entrenado.
- La licencia Apache 2.0 permite uso comercial de los pesos; el codigo de scirex esta bajo LGPL-3.0, lo que impone obligaciones adicionales si se modifica y redistribuye la biblioteca.
- El dataset de entrenamiento (Li et al., Zenodo 12784353) esta bajo CC BY 4.0 y requiere atribucion.
- No se han publicado variantes cuantizadas ni formatos alternativos de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenteiq-ai/scirex-transolver-darcy-physics-extra-fields
- Repositorio scirex: https://github.com/zenteiq-research/scirex
- Pagina comparativa del benchmark: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/darcy_physics/results/comparative.md
- Documentacion de reproducibilidad: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/reproducibility.md
- Issues del repositorio: https://github.com/zenteiq-research/scirex/issues
- Paper de la arquitectura Transolver (Wu et al., ICML 2024): https://arxiv.org/abs/2402.02366
- Checkpoint FNO: https://huggingface.co/zenteiq-ai/scirex-fno-darcy-physics-extra-fields
- Checkpoint GINO: https://huggingface.co/zenteiq-ai/scirex-gino-darcy-physics-extra-fields
- Checkpoint WNO: https://huggingface.co/zenteiq-ai/scirex-wno-darcy-physics-extra-fields
- Transolver data-driven: https://huggingface.co/zenteiq-ai/scirex-transolver-darcy
- Transolver pipe flow: https://huggingface.co/zenteiq-ai/scirex-transolver-pipe
- Transolver Navier-Stokes 2D: https://huggingface.co/zenteiq-ai/scirex-transolver-navier-stokes
- Transolver chip cooling: https://huggingface.co/zenteiq-ai/scirex-transolver-chip-cooling
- Transolver AirfRANS: https://huggingface.co/zenteiq-ai/scirex-transolver-airfrans
- Transolver ShapeNetCar: https://huggingface.co/zenteiq-ai/scirex-transolver-shapenetcar
- Transolver Car-CFD: https://huggingface.co/zenteiq-ai/scirex-transolver-car-cfd
- Dataset de Darcy flow (Li et al., Zenodo): https://zenodo.org/records/12784353
