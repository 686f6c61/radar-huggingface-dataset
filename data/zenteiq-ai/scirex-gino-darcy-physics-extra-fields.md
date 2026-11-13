# zenteiq-ai/scirex-gino-darcy-physics-extra-fields

## Resumen

ScireX GINO · Darcy flow 2D (physics-only, extra-fields run) es un checkpoint de un operador neuronal de la familia GINO (Geometry-Informed Neural Operator), entrenado con la libreria open source scirex (JAX/Flax) del proyecto zenteiq-research. Resuelve un problema concreto de mecanica de fluidos computacional: dado un campo de permeabilidad en una malla de 85 x 85 puntos, predice el campo de presion correspondiente para el flujo de Darcy en 2D. No es un modelo de lenguaje: es un surrogate numerico para EDPs.

La particularidad de este checkpoint es que se ha entrenado sin etiquetas de solucion (physics-only), minimizando unicamente la energia de Ritz de la formulacion Q4. Segun la model card, alcanza un error relativo L2 de 0,722% en el conjunto de test con 20.000 campos de coeficientes vistos, frente al 1,603% de la variante data-driven del mismo proyecto. El modelo tiene 2.801.340 parametros reales (el dato de safetensors, 2.109.420, difiere del reportado en la model card).

Es relevante ahora porque demuestra que un operador neuronal de tamano muy reducido puede aproximar la solucion de una EDP eliptica con precision sub-1% sin disponer de soluciones etiquetadas, lo que abarata drasticamente la generacion de datos de entrenamiento en simulacion cientifica. El checkpoint esta pensado para reproducir el benchmark, no como componente de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GINO (Geometry-Informed Neural Operator), implementado en JAX/Flax |
| Parametros totales | 2.801.340 (segun model card); 2.109.420 segun safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 85 x 85 = 7.225 puntos de malla |
| Tipos de cuantizacion | no disponible (pesos en precision de entrenamiento, safetensors) |
| Idiomas soportados | no aplica (modelo numerico, no linguistico) |
| Licencia | Apache 2.0 (pesos); codigo scirex bajo LGPL-3.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` con estadisticas de normalizacion + `sample.safetensors` |
| Entrada | Campo de permeabilidad en malla 85 x 85 |
| Salida | Campo de presion en malla 85 x 85 |
| Dataset de entrenamiento | Darcy flow de Li et al. (ICLR 2021), Zenodo 12784353, CC BY 4.0 |
| Muestras de entrenamiento | 1.000 publicadas + muestreo adicional sin etiquetas (20.000 campos en total) |
| Muestras de test | 200 |

## Arquitectura y entrenamiento

GINO combina un backbone espectral (FNO) con un modulo de atencion sobre grafos para manejar geometrias irregulares; en este caso la malla es regular, pero se mantiene la formulacion completa de la arquitectura publicada por Li et al. en NeurIPS 2023 (arXiv:2309.00583). El modelo opera como mapa entre funciones sobre la malla: recibe el campo de coeficientes (permeabilidad) y devuelve el campo de solucion (presion), con normalizacion ajustada exclusivamente sobre los campos de coeficientes de entrenamiento.

El entrenamiento es label-free: no se usan soluciones de referencia, sino que se minimiza la energia de Ritz de la formulacion Q4 asociada al problema de Darcy. Se emplea AdamW con soporte para numeros complejos, learning rate pico de 1e-3, weight decay 1e-4, scheduler cosine one-cycle, clipping de norma global 1.0, batch de 16 y aproximadamente 125.000 pasos. La semilla es 0 y se publican los pesos de la ultima epoca, sin seleccion de checkpoint sobre el conjunto de test. El tiempo de entrenamiento reportado es de unos 72 minutos por ejecucion. La solucion exacta Q4 de la misma formulacion tiene un suelo de 0,31% de error relativo L2, de modo que el modelo queda a poco mas del doble de ese limite teorico.

## Capacidades

- Prediccion de campos de presion para flujo de Darcy 2D a partir de campos de permeabilidad en malla de 85 x 85.
- Aproximacion de la solucion de una EDP eliptica con error relativo L2 de 0,722% en test.
- Entrenamiento sin etiquetas: la formulacion fisica sustituye a las soluciones de referencia durante el entrenamiento.
- Inferencia determinista sobre mallas fijas de 85 x 85; no soporta resoluciones arbitrarias sin reentrenamiento o interpolacion.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: no es un modelo generativo de texto.
- Exportable a traves del ecosistema JAX/Flax del repositorio scirex.

## Casos de uso

- Prototipado rapido de surrogates para Darcy 2D: sustituir el solver numerico en fases de exploracion de disenos cuando solo se necesita una estimacion del campo de presion con error sub-1%.
- Generacion de datos sinteticos para entrenar otros modelos: usar el operador para producir pares (permeabilidad, presion) a bajo coste antes de validar con el solver exacto.
- Validacion de pipelines de simulacion: comparar la salida del solver Q4 con la prediccion del modelo para detectar configuraciones anomalas en la malla.
- Investigacion en operadores neuronales: punto de partida reproducible para estudiar entrenamiento label-free frente a entrenamiento supervisado en la misma arquitectura.
- Docencia en metodos numericos y ML cientifico: ejemplo autocontenido (2,8 M de parametros, 72 minutos de entrenamiento) para ilustrar la formulacion de Ritz como funcion de perdida.
- Benchmarking interno de infraestructura JAX/Flax: el checkpoint incluye `sample.safetensors` con entrada y salida esperada, lo que permite verificar instalaciones sin descargar el dataset completo.

## Benchmarks y rendimiento

| Metrica | Este modelo (physics-only, extra-fields) | Referencia del proyecto (data-driven) |
|---|---|---|
| Error relativo L2 en test | 0,722% | 1,603% |
| Suelo teorico de la formulacion Q4 exacta | 0,31% | no aplica |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 2,8 M de parametros y la malla de entrada ocupa 7.225 puntos por muestra.
- GPU recomendadas: cualquier GPU con soporte CUDA o ROCm compatible con JAX; tambien funciona en CPU para inferencia puntual.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: JAX/Flax a traves de los scripts del repositorio scirex (`scripts/benchmarks/darcy_physics/infer.py`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; el entrenamiento completo se reporta en unos 72 minutos por ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / malla | Error L2 en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScireX GINO Darcy physics-only (este) | 2,8 M | 85 x 85 | 0,722% | Apache 2.0 | Hugging Face |
| ScireX GINO Darcy data-driven | no disponible | 85 x 85 | 1,603% | Apache 2.0 | Hugging Face |
| ScireX FNO Darcy physics-only | no disponible | 85 x 85 | no disponible | Apache 2.0 | Hugging Face |
| ScireX Transolver Darcy physics-only | no disponible | 85 x 85 | no disponible | Apache 2.0 | Hugging Face |
| ScireX WNO Darcy physics-only | no disponible | 85 x 85 | no disponible | Apache 2.0 | Hugging Face |

Los checkpoints FNO, Transolver y WNO del mismo benchmark estan publicados por el mismo autor, pero la informacion proporcionada no incluye sus resultados numericos.

## Limitaciones y advertencias

- Valido unicamente dentro de los rangos de entrada del dataset de benchmark; extrapolar fuera de ellos no esta garantizado.
- No debe usarse en diseno de seguridad critica sin validacion independiente con el solver numerico.
- La malla esta fijada a 85 x 85; no hay soporte documentado para resoluciones distintas.
- El error de 0,722% sigue siendo mas del doble del suelo teorico de la formulacion Q4 exacta (0,31%), por lo que el modelo no sustituye al solver cuando se requiere precision alta.
- Los pesos son inutilizables sin las estadisticas de normalizacion de `config.json`.
- Discrepancia entre el numero de parametros de safetensors (2.109.420) y el reportado en la model card (2.801.340); conviene verificar antes de integrar.
- La licencia Apache 2.0 cubre los pesos, pero el codigo scirex es LGPL-3.0 y el dataset de entrenamiento es CC BY 4.0, con obligacion de atribucion.
- No es un modelo de lenguaje: no procesa texto, no razona y no admite instrucciones en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenteiq-ai/scirex-gino-darcy-physics-extra-fields
- Repositorio scirex: https://github.com/zenteiq-research/scirex
- Pagina del benchmark (comparative.md): https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/darcy_physics/results/comparative.md
- Guia de reproducibilidad: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/reproducibility.md
- Issues del proyecto: https://github.com/zenteiq-research/scirex/issues
- Paper de GINO (Li et al., NeurIPS 2023): https://arxiv.org/abs/2309.00583
- Dataset Darcy flow de Li et al.: Zenodo record 12784353
- Checkpoint data-driven del mismo modelo: https://huggingface.co/zenteiq-ai/scirex-gino-darcy
- Checkpoints hermanos del mismo benchmark: https://huggingface.co/zenteiq-ai/scirex-fno-darcy-physics-extra-fields, https://huggingface.co/zenteiq-ai/scirex-transolver-darcy-physics-extra-fields, https://huggingface.co/zenteiq-ai/scirex-wno-darcy-physics-extra-fields
- Otros benchmarks del mismo modelo: https://huggingface.co/zenteiq-ai/scirex-gino-pipe, https://huggingface.co/zenteiq-ai/scirex-gino-navier-stokes, https://huggingface.co/zenteiq-ai/scirex-gino-chip-cooling, https://huggingface.co/zenteiq-ai/scirex-gino-airfrans, https://huggingface.co/zenteiq-ai/scirex-gino-shapenetcar, https://huggingface.co/zenteiq-ai/scirex-gino-car-cfd
