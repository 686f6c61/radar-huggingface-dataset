# zenteiq-ai/scirex-wno-chip-cooling

## Resumen

ScireX WNO · Chip cooling es un operador neuronal entrenado con la arquitectura Wavelet Neural Operator (WNO) y publicado por el equipo de zenteiq-ai dentro de la biblioteca open source scirex, implementada en JAX/Flax. Resuelve un problema concreto de ingenieria termica: dado un conjunto de seis parametros de condicion de contorno de una placa fria de doble chip, predice el campo de temperatura en regimen estacionario sobre una rebanada 2D discretizada en 11.110 nodos de malla. No es un modelo de lenguaje ni un modelo generativo de proposito general; es un surrogate fisico que sustituye a un solver CFD costoso.

El modelo es muy compacto (1.920.481 parametros) y esta especializado en un unico benchmark. Su relevancia radica en que demuestra que un operador neuronal de ~1,9 M de parametros puede alcanzar un error relativo L2 del 0,23 % en test y un MAE de 0,64 K, superando ampliamente la referencia publicada de POD-NN (MAE 1,534 K). Para equipos que evaluan surrogates neuronales en diseno termico de semiconductores, este checkpoint ofrece un punto de partida reproducible con pesos abiertos bajo licencia Apache 2.0.

Los pesos corresponden a la ultima epoca del entrenamiento descrito en la model card y solo son utilizables junto con las estadisticas de normalizacion incluidas en `config.json`. El repositorio tiene un tamano practicamente nulo (0,0 GB) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wavelet Neural Operator (WNO), db6, nivel 4, 16 canales ocultos, rejilla rasterizada 128 x 256 |
| Parametros totales | 1.920.481 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de 6 parametros de condicion de contorno, salida sobre 11.110 nodos de malla |
| Tipos de cuantizacion | no disponible; pesos en float32 con calculo en bfloat16 durante entrenamiento |
| Idiomas soportados | no disponible (modelo numerico, no linguistico) |
| Licencia | Apache 2.0 para los pesos; codigo bajo LGPL-3.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` + `sample.safetensors` |

## Arquitectura y entrenamiento

WNO es un operador neuronal que aprende mapeos entre espacios funcionales mediante transformadas wavelet. En esta configuracion concreta se usa una wavelet Daubechies db6 con descomposicion de nivel 4 y 16 canales ocultos, operando sobre una rejilla rasterizada de 128 x 256. La entrada son 6 parametros de condicion de contorno de una placa fria de doble chip y la salida es el campo de temperatura estacionaria (en kelvin) sobre una rebanada 2D con 11.110 nodos de malla.

El entrenamiento empleo el optimizador Adam con weight decay 1e-4 y un scheduler de learning rate coseno desde 1e-3, batch de 8, calculo en bfloat16 con pesos en float32, funcion de perdida de error relativo L2 y 500 epocas con semilla 42. La temperatura se normalizo con z-score de un escalar y los parametros de entrada con z-score por parametro, usando solo estadisticas de entrenamiento. El conjunto de datos proviene de Curl y Hu (2026), depositado en Dryad con DOI 10.5061/dryad.k0p2ngfp5 y licencia CC0 1.0, con 1600 muestras de entrenamiento y 400 de test. Los pesos publicados son los de la ultima epoca.

## Capacidades

- Prediccion de campos de temperatura en regimen estacionario para una placa fria de doble chip a partir de 6 parametros de condicion de contorno.
- Evaluacion rapida de configuraciones termicas sin ejecutar un solver CFD completo.
- Regresion sobre mallas no estructuradas de 11.110 nodos, con salida densa por nodo.
- Reproducibilidad completa mediante `sample.safetensors`, que incluye una entrada de test y la salida esperada.
- Integracion en pipelines JAX/Flax a traves de la biblioteca scirex.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni modos de pensamiento; es un surrogate numerico de un unico benchmark.

## Casos de uso

- Optimizacion de diseno termico de placas frias: el modelo permite barrer el espacio de 6 parametros de condicion de contorno en milisegundos por evaluacion, sustituyendo simulaciones CFD que requieren minutos u horas, para explorar configuraciones antes de validar las candidatas con un solver completo.
- Prototipado rapido de surrogates en investigacion: al ser un checkpoint WNO de referencia con pesos abiertos y resultados reproducibles, sirve como linea base contra la que comparar nuevas arquitecturas de operadores neuronales en el mismo benchmark.
- Docencia y formacion en operadores neuronales: el tamano reducido (1,9 M de parametros) y la disponibilidad de `sample.safetensors` permiten ejecutar inferencia y estudiar el flujo completo en equipos modestos.
- Generacion de datasets sinteticos aumentados: el modelo puede producir campos de temperatura plausibles para preentrenar o aumentar otros modelos, siempre dentro del rango de entrada entrenado.
- Validacion cruzada de solvers: comparar la prediccion del surrogate con la salida de un solver CFD en puntos de diseno concretos como comprobacion de coherencia.
- Integracion en herramientas de ingenieria asistida: al estar implementado en JAX/Flax y distribuirse como safetensors, puede envolverse en servicios de inferencia que alimenten dashboards de diseno termico, con la advertencia de que no sustituye a la validacion formal en disenos criticos para seguridad.

## Benchmarks y rendimiento

| Metrica | Este modelo | Referencia publicada |
|---|---|---|
| Error relativo L2 en test | 0,23 % | no disponible |
| MAE en test | 0,64 K | POD-NN (Curl y Hu): MAE 1,534 K, R² 0,998 |

No se han publicado mas resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 1,9 M de parametros en float32 los pesos ocupan unos 8 MB, y el consumo dominante es el de las activaciones sobre la rejilla 128 x 256.
- GPU recomendadas: cualquier GPU con soporte CUDA y JAX, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo no aprovecha la capacidad de GPUs de gama alta.
- Cabe holgadamente en GPU de consumo e incluso puede ejecutarse en CPU, dado el reducido numero de parametros.
- Opciones de despliegue: inferencia via `scripts/benchmarks/chip_cooling/infer.py` de la biblioteca scirex sobre JAX/Flax; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScireX WNO · Chip cooling | 1.920.481 | 6 parametros de contorno, salida en 11.110 nodos | L2 rel. 0,23 %, MAE 0,64 K | Apache 2.0 (pesos) | Hugging Face |
| ScireX FNO · Chip cooling | no disponible | mismo benchmark | no disponible | no disponible | Hugging Face |
| ScireX GINO · Chip cooling | no disponible | mismo benchmark | no disponible | no disponible | Hugging Face |
| ScireX Transolver · Chip cooling | no disponible | mismo benchmark | no disponible | no disponible | Hugging Face |
| POD-NN (Curl y Hu) | no disponible | mismo benchmark | MAE 1,534 K, R² 0,998 | no disponible | referencia publicada |

## Limitaciones y advertencias

- Valido unicamente dentro de los rangos de entrada del conjunto de datos de entrenamiento; fuera de ellos la prediccion no esta garantizada.
- No debe usarse en disenos criticos para seguridad sin una validacion independiente.
- Los pesos son inutilizables sin las estadisticas de normalizacion de `config.json`.
- Entrenado sobre un unico benchmark (placa fria de doble chip) con 1600 muestras; no generaliza a otras geometrias ni a otros regimenes de flujo sin reentrenamiento.
- No se documentan sesgos en el sentido linguistico, pero si un sesgo de dominio: el modelo solo representa la fisica cubierta por los datos de Curl y Hu (2026).
- Riesgo de extrapolacion silenciosa: al ser un surrogate fisico, puede producir campos de temperatura plausibles pero incorrectos fuera del dominio entrenado sin senal de incertidumbre.
- La licencia Apache 2.0 aplica a los pesos; el codigo de la biblioteca scirex esta bajo LGPL-3.0, lo que impone condiciones adicionales si se modifica y redistribuye.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenteiq-ai/scirex-wno-chip-cooling
- Repositorio scirex: https://github.com/zenteiq-research/scirex
- Tabla comparativa del benchmark: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/chip_cooling/results/comparative.md
- Guia de reproducibilidad: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/reproducibility.md
- Issues del proyecto: https://github.com/zenteiq-research/scirex/issues
- Paper de la arquitectura WNO: https://arxiv.org/abs/2205.02191
- Dataset de Curl y Hu (2026): https://doi.org/10.5061/dryad.k0p2ngfp5
- Checkpoints relacionados: https://huggingface.co/zenteiq-ai/scirex-fno-chip-cooling, https://huggingface.co/zenteiq-ai/scirex-gino-chip-cooling, https://huggingface.co/zenteiq-ai/scirex-transolver-chip-cooling
- Mismo modelo en otros benchmarks: https://huggingface.co/zenteiq-ai/scirex-wno-darcy, https://huggingface.co/zenteiq-ai/scirex-wno-darcy-physics-extra-fields, https://huggingface.co/zenteiq-ai/scirex-wno-pipe, https://huggingface.co/zenteiq-ai/scirex-wno-navier-stokes, https://huggingface.co/zenteiq-ai/scirex-wno-airfrans
