# zenteiq-ai/scirex-gino-chip-cooling

## Resumen

ScireX GINO · Chip cooling es un checkpoint de un operador neuronal de la familia GINO (Geometry-Informed Neural Operator), entrenado con la librería de código abierto scirex (JAX/Flax) desarrollada por zenteiq-research. El modelo resuelve un problema concreto de transferencia de calor en estado estacionario sobre una placa fría de doble chip: a partir de 6 parámetros de condición de contorno predice el campo de temperatura (en kelvin) sobre una malla 2D de 11.110 nodos. No es un modelo de lenguaje ni un transformer generativo: es un surrogate physics-ML para simulación numérica.

Con 1.029.028 parámetros reales en safetensors (1.821.028 contando los pesos complejos como dos), el modelo es extremadamente compacto y está pensado para sustituir total o parcialmente simulaciones CFD costosas en bucles de diseño. Su relevancia radica en la reproducibilidad: los pesos son los de la última época de un entrenamiento documentado (500 épocas, semilla 42) y se publican junto a estadísticas de normalización, un fichero `sample.safetensors` de verificación y el script de inferencia del repositorio, de modo que los resultados son verificables de extremo a extremo.

El checkpoint reporta un error relativo L2 de test del 0,25 % y un MAE de 0,425 K, frente al MAE de 1,534 K del baseline POD-NN publicado por Curl y Hu. Está liberado bajo Apache 2.0 para los pesos (el código es LGPL-3.0) y se apoya en el dataset CC0 1.0 de Curl y Hu (2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GINO (Geometry-Informed Neural Operator), operador neuronal con rama GNO sobre nube de puntos y malla latente 64 x 128 |
| Parametros totales | 1.029.028 reales en safetensors (1.821.028 contando pesos complejos como dos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de secuencia); entrada de 6 parámetros de contorno y nube de 11.110 nodos |
| Tipos de cuantizacion | No disponible (pesos en safetensors de precisión nativa; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 para los pesos; código scirex bajo LGPL-3.0; datos de entrenamiento CC0 1.0 |
| Formato de pesos | safetensors (`model.safetensors`) más `config.json` con ajustes y estadísticas de normalización |

## Arquitectura y entrenamiento

GINO combina un operador neuronal sobre grafo (GNO) que procesa la nube de puntos original de 11.110 nodos con una representación latente en rejilla de 64 x 128, lo que permite capturar geometrías irregulares sin remallar. La implementación es en JAX/Flax con pesos complejos, contabilizados como dos parámetros reales cada uno en el recuento de 1.821.028. El radio del GNO es 0,05 y la temperatura se normaliza con z-score escalar, mientras que los 6 parámetros de entrada se normalizan por parámetro usando solo estadísticas de entrenamiento; sin `config.json` los pesos son inutilizables.

El entrenamiento usa AdamW con soporte de complejos, learning rate 1e-3 con annealing coseno por época, weight decay 1e-4, batch de tamaño 1 y pérdida de error relativo L2 durante 500 épocas con semilla 42, guardando los pesos de la última época. El dataset consta de 1600 muestras de entrenamiento y 400 de test, procedentes de los datos de Curl y Hu (2026) depositados en Dryad (doi:10.5061/dryad.k0p2ngfp5) bajo CC0 1.0. No se documenta RLHF, DPO ni ajuste por preferencias, al no tratarse de un modelo generativo.

## Capacidades

- Predicción de campo de temperatura en estado estacionario (K) sobre una rejilla 2D de 11.110 nodos a partir de 6 parámetros de condición de contorno de una placa fría de doble chip.
- Aproximación de la solución de un problema PDE de transferencia de calor como surrogate rápido frente a simulación CFD.
- Evaluación de múltiples condiciones de contorno en lote mediante el script de inferencia del repositorio.
- Verificación de instalación y resultados con `sample.safetensors`, que incluye una entrada de test y la salida esperada.
- Integración en pipelines JAX/Flax mediante la librería scirex.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Exploración de diseño de placas frías: barrido de los 6 parámetros de contorno para estimar la temperatura máxima del chip sin lanzar una simulación CFD por cada combinación, gracias al coste de inferencia de un modelo de ~1M de parámetros.
- Optimización multiobjetivo: uso del surrogate como función de evaluación dentro de bucles de optimización bayesiana o algoritmos genéticos que requieren miles de evaluaciones de temperatura.
- Validación cruzada con CFD: comparación de las predicciones (MAE 0,425 K) con simulaciones de alta fidelidad para detectar configuraciones donde el surrogate se desvía.
- Generación de mapas térmicos preliminares: producción rápida de campos de temperatura sobre la malla de 11.110 nodos para informes de diseño temprano.
- Docencia e investigación en physics-ML: ejemplo reproducible de operador neuronal GINO con pesos, estadísticas de normalización y script de inferencia publicados, útil para comparar arquitecturas (FNO, Transolver, WNO) sobre el mismo benchmark.
- Benchmarking de operadores neuronales: servir como referencia cuantitativa (L2 relativo 0,25 %) al evaluar nuevas arquitecturas sobre el mismo dataset de chip cooling.
- Preentrenamiento o inicialización: reutilización de los pesos como punto de partida para problemas térmicos con geometrías o rangos de parámetros próximos, siempre que se revalide.

## Benchmarks y rendimiento

| Metrica | Este modelo | Referencia publicada |
|---|---|---|
| L2 relativo en test | 0,25 % | No disponible |
| MAE en test | 0,425 K | POD-NN (Curl y Hu): MAE 1,534 K, R² 0,998 |

Los datos provienen de la tabla comparativa del repositorio scirex (v1.0.0). No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, por no ser aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para los pesos (repo de 0,0 GB, ~1M de parámetros); el consumo real lo domina el runtime de JAX y la nube de puntos de 11.110 nodos, no el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA o ROCm compatible con JAX; no se requiere A100 ni H100. Una GPU consumer moderna (por ejemplo, RTX 3060 o superior) es más que suficiente.
- Cabe en GPU consumer: sí, con amplio margen; también puede ejecutarse en CPU para inferencia puntual.
- Opciones de despliegue: script `scripts/benchmarks/chip_cooling/infer.py` del repositorio scirex v1.0.0 con JAX/Flax. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScireX GINO · Chip cooling | 1.029.028 reales | 6 parámetros de contorno, malla de 11.110 nodos | L2 relativo 0,25 %, MAE 0,425 K | Apache 2.0 (pesos) | Hugging Face |
| ScireX FNO · Chip cooling | No disponible | Mismo benchmark | No disponible en esta ficha | No disponible | Hugging Face |
| ScireX Transolver · Chip cooling | No disponible | Mismo benchmark | No disponible en esta ficha | No disponible | Hugging Face |
| ScireX WNO · Chip cooling | No disponible | Mismo benchmark | No disponible en esta ficha | No disponible | Hugging Face |
| POD-NN (Curl y Hu) | No disponible | Mismo benchmark | MAE 1,534 K, R² 0,998 | No disponible | Referencia publicada |

Los checkpoints FNO, Transolver y WNO del mismo benchmark están publicados por el mismo autor y permiten una comparación directa, pero sus métricas no se detallan en la información disponible para esta ficha.

## Limitaciones y advertencias

- Válido únicamente dentro de los rangos de entrada del dataset de entrenamiento; fuera de ellos la predicción no está garantizada.
- No debe usarse para diseño crítico de seguridad sin validación independiente, según advierte el propio autor.
- Los pesos son inutilizables sin las estadísticas de normalización de `config.json`.
- El modelo está entrenado para una geometría concreta (placa fría de doble chip) y una malla de 11.110 nodos; no generaliza a otras geometrías sin reentrenamiento.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, código, razonamiento simbólico ni multilingües.
- Riesgo de sesgo respecto a la distribución de los datos de Curl y Hu (2026); configuraciones poco representadas en las 1600 muestras de entrenamiento pueden tener mayor error.
- La licencia Apache 2.0 cubre los pesos, pero el código scirex es LGPL-3.0 y los datos de entrenamiento CC0 1.0; conviene revisar `NOTICE` para el crédito del dataset.
- No se documentan cuantizaciones ni formatos alternativos de despliegue, lo que limita su uso fuera del ecosistema JAX/Flax.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenteiq-ai/scirex-gino-chip-cooling
- Repositorio scirex: https://github.com/zenteiq-research/scirex
- Resultados comparativos del benchmark: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/chip_cooling/results/comparative.md
- Guía de reproducibilidad: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/reproducibility.md
- Issues del repositorio: https://github.com/zenteiq-research/scirex/issues
- Paper de la arquitectura GINO (Li et al., NeurIPS 2023): https://arxiv.org/abs/2309.00583
- Dataset de Curl y Hu (2026): https://doi.org/10.5061/dryad.k0p2ngfp5
- Checkpoint FNO del mismo benchmark: https://huggingface.co/zenteiq-ai/scirex-fno-chip-cooling
- Checkpoint Transolver del mismo benchmark: https://huggingface.co/zenteiq-ai/scirex-transolver-chip-cooling
- Checkpoint WNO del mismo benchmark: https://huggingface.co/zenteiq-ai/scirex-wno-chip-cooling
