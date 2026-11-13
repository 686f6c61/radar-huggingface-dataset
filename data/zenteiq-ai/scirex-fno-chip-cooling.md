# zenteiq-ai/scirex-fno-chip-cooling

## Resumen

ScireX FNO · Chip cooling es un operador neuronal de Fourier (Fourier Neural Operator, FNO) entrenado para predecir el campo de temperatura en regimen estacionario sobre una rebanada 2D de una placa fria de doble chip. Lo desarrolla zenteiq-ai dentro de la biblioteca de codigo abierto scirex (JAX/Flax), orientada a benchmarks de operadores neuronales para ecuaciones en derivadas parciales. El modelo no es un modelo de lenguaje: es un surrogate fisico que aproxima la solucion de un problema de transferencia de calor con condiciones de contorno parametrizadas.

La relevancia es practica: sustituye una simulacion CFD costosa por una evaluacion directa de red neuronal con un error relativo L2 de test del 0,041 % y un MAE de 0,122 K, frente al MAE de 1,534 K del metodo de referencia POD-NN publicado por Curl y Hu. El modelo es diminuto (1.829.496 parametros reales, 919.704 tensores en safetensors) y se ejecuta en CPU sin dificultad, lo que lo hace util para exploracion de disenos y optimizacion de geometrias de refrigeracion.

La entrada son 6 parametros de condicion de contorno de la placa fria y la salida es la temperatura en K sobre una malla de 11.110 nodos. Se entreno con 1.600 muestras y se evalua con 400, sobre datos publicados en Dryad bajo CC0 1.0. Los pesos son los de la ultima epoca del run documentado y requieren las estadisticas de normalizacion incluidas en `config.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fourier Neural Operator (FNO) con pesos complejos, implementado en JAX/Flax |
| Parametros totales | 1.829.496 reales (los pesos complejos cuentan como dos); 919.704 tensores en safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 6 parametros de condicion de contorno, salida de 11.110 nodos de malla |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision nativa) |
| Idiomas soportados | no aplica (modelo fisico, no linguistico) |
| Licencia | Apache 2.0 para los pesos; codigo de scirex bajo LGPL-3.0 |
| Formato de pesos | safetensors (`model.safetensors`) mas `config.json` con estadisticas de normalizacion y `sample.safetensors` de verificacion |

## Arquitectura y entrenamiento

FNO clasico con 24 x 24 modos espectrales y 27 canales ocultos, sobre una rejilla rasterizada de 128 x 256 con mascara de dominio. La temperatura se normaliza con z-score de un unico escalar y los parametros de entrada se normalizan por parametro usando solo estadisticas de entrenamiento. La perdida es L2 relativa y el optimizador es AdamW con tratamiento de pesos complejos, learning rate 1e-3, weight decay 1e-4, scheduler coseno hasta 0 y batch de 8 durante 500 epocas con semilla 42.

El entrenamiento usa 1.600 muestras del benchmark Chip cooling y evalua sobre 400 muestras de test. Los datos proceden de Curl y Hu (2026), publicados en Dryad con DOI 10.5061/dryad.k0p2ngfp5 bajo licencia CC0 1.0. No se documenta uso de RLHF, DPO ni tecnicas de alineacion, logicamente, por tratarse de un surrogate fisico. La innovacion tecnica es la propia formulacion espectral del FNO, que aprende el operador de solucion en el espacio de Fourier y generaliza entre condiciones de contorno sin reentrenar.

## Capacidades

- Prediccion del campo de temperatura estacionaria (K) en una rebanada 2D de placa fria de doble chip a partir de 6 parametros de condicion de contorno.
- Aproximacion rapida de la solucion de un problema de transferencia de calor que de otro modo requeriria simulacion CFD.
- Evaluacion sobre malla fija de 11.110 nodos con mascara de dominio sobre rejilla de 128 x 256.
- Generalizacion dentro del rango de entrenamiento de los parametros de entrada.
- Inferencia en CPU por el tamano reducido del modelo.
- Verificacion reproducible mediante `sample.safetensors`, que incluye una entrada de test y la salida esperada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo generativo de texto.

## Casos de uso

- Exploracion de diseno de placas frias: barrer combinaciones de los 6 parametros de condicion de contorno y obtener el campo de temperatura en milisegundos en lugar de lanzar una simulacion CFD por cada variante.
- Optimizacion de geometria de refrigeracion: usar el modelo como funcion objetivo dentro de un bucle de optimizacion (por ejemplo, Nelder-Mead o Bayesian optimization) para minimizar la temperatura maxima en el chip.
- Generacion de datasets sinteticos de temperatura: producir pares entrada-salida a gran escala para preentrenar o aumentar otros surrogates mas costosos.
- Validacion cruzada de simulaciones: comparar la prediccion del FNO con una simulacion CFD de alta fidelidad para detectar discrepancias en regimenes concretos.
- Docencia y prototipado de operadores neuronales: el modelo es tan pequeno que sirve como ejemplo ejecutable de FNO en JAX/Flax con un benchmark reproducible.
- Integracion en pipelines de diseno termico automatizado: al ejecutarse en CPU y con un repo de 0,0 GB, se puede desplegar en CI/CD para regresion termica de nuevas configuraciones.
- Comparativa de arquitecturas de operadores neuronales: el mismo benchmark ofrece checkpoints de GINO, Transolver y WNO para evaluar que arquitectura conviene en cada regimen.

## Benchmarks y rendimiento

| Metrica | Este modelo (FNO) | Referencia publicada |
|---|---|---|
| L2 relativo en test | 0,041 % | no disponible |
| MAE en test | 0,122 K | POD-NN (Curl y Hu): MAE 1,534 K, R² 0,998 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, por tratarse de un modelo fisico. Las cifras de la tabla proceden de la model card y de la pagina comparativa del repositorio scirex.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; el repo ocupa 0,0 GB y el modelo tiene 1,83 M de parametros reales.
- GPU recomendadas: no requiere GPU; cualquier GPU con soporte JAX/Flax (A100, H100, RTX 4090, RTX 3090) acelera la inferencia por lotes, pero no es necesaria.
- Cabe en cualquier GPU consumer e incluso en CPU y en dispositivos de borde.
- Opciones de despliegue: scripts de inferencia del repositorio scirex (`scripts/benchmarks/chip_cooling/infer.py`), con JAX/Flax como runtime. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera del orden de milisegundos por muestra en CPU, pero no se ha publicado una medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScireX FNO (este) | 1,83 M reales | 6 parametros de contorno, 11.110 nodos de salida | L2 rel. 0,041 %, MAE 0,122 K | Apache 2.0 (pesos) | Hugging Face |
| ScireX GINO | no disponible | mismo benchmark Chip cooling | no disponible en esta ficha | Apache 2.0 (pesos) | Hugging Face |
| ScireX Transolver | no disponible | mismo benchmark Chip cooling | no disponible en esta ficha | Apache 2.0 (pesos) | Hugging Face |
| ScireX WNO | no disponible | mismo benchmark Chip cooling | no disponible en esta ficha | Apache 2.0 (pesos) | Hugging Face |
| POD-NN (Curl y Hu) | no disponible | mismo benchmark | MAE 1,534 K, R² 0,998 | no disponible | referencia publicada |

Los checkpoints GINO, Transolver y WNO del mismo benchmark permiten una comparativa directa de arquitecturas, pero sus cifras no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Valido solo dentro de los rangos de entrada del dataset de entrenamiento; fuera de ellos la prediccion no esta garantizada.
- No apto para diseno critico de seguridad sin validacion independiente, segun advierte el propio autor.
- Requiere las estadisticas de normalizacion de `config.json`; los pesos son inutilizables sin ellas.
- Entrenado con 1.600 muestras de un unico benchmark (placa fria de doble chip); no generaliza a otras geometrias ni regimenes de flujo sin reentrenamiento.
- No es un modelo de lenguaje: no tiene capacidades de generacion de texto, razonamiento, codigo ni agentes.
- No dispone de cuantizaciones publicadas ni de integracion con runtimes de inferencia de LLM.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero si existe riesgo de predicciones fisicamente inconsistentes fuera del dominio de entrenamiento.
- La licencia Apache 2.0 cubre los pesos; el codigo de scirex es LGPL-3.0, lo que impone obligaciones adicionales si se modifica y redistribuye la biblioteca.
- El dataset original es CC0 1.0, sin restricciones de uso comercial, pero conviene revisar el `NOTICE` del repositorio para el credito de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenteiq-ai/scirex-fno-chip-cooling
- Repositorio scirex: https://github.com/zenteiq-research/scirex
- Pagina comparativa del benchmark Chip cooling: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/chip_cooling/results/comparative.md
- Documentacion de reproducibilidad: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/reproducibility.md
- Issues del proyecto: https://github.com/zenteiq-research/scirex/issues
- Checkpoint GINO del mismo benchmark: https://huggingface.co/zenteiq-ai/scirex-gino-chip-cooling
- Checkpoint Transolver del mismo benchmark: https://huggingface.co/zenteiq-ai/scirex-transolver-chip-cooling
- Checkpoint WNO del mismo benchmark: https://huggingface.co/zenteiq-ai/scirex-wno-chip-cooling
- Checkpoint FNO para Darcy flow 2D: https://huggingface.co/zenteiq-ai/scirex-fno-darcy
- Checkpoint FNO para Darcy flow 2D (physics-only, extra-fields): https://huggingface.co/zenteiq-ai/scirex-fno-darcy-physics-extra-fields
- Checkpoint FNO para Pipe flow: https://huggingface.co/zenteiq-ai/scirex-fno-pipe
- Checkpoint FNO para Navier-Stokes 2D: https://huggingface.co/zenteiq-ai/scirex-fno-navier-stokes
- Paper de la arquitectura FNO (Li et al., ICLR 2021): https://arxiv.org/abs/2010.08895
- Dataset original (Curl y Hu, 2026): https://doi.org/10.5061/dryad.k0p2ngfp5
