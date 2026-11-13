# zenteiq-ai/scirex-fno-darcy-physics-extra-fields

## Resumen

ScireX FNO · Darcy flow 2D (physics-only, extra-fields run) es un operador neuronal de tipo Fourier Neural Operator (FNO) entrenado con la librería de código abierto scirex (JAX/Flax) para resolver el problema de flujo de Darcy en 2D. Mapea un campo de permeabilidad en una rejilla de 85 x 85 puntos (7.225 puntos) a un campo de presión en la misma rejilla. No es un modelo de lenguaje: es un modelo de aprendizaje automático científico para resolver ecuaciones en derivadas parciales (PDE).

La particularidad de esta ejecución es que es *physics-only*: se entrena únicamente con la energía de Ritz Q4, sin etiquetas de solución. Los pesos corresponden a la última época del entrenamiento y se distribuyen en `model.safetensors`. El modelo tiene 2.836.281 parámetros reales según la model card (el dato del repositorio safetensors indica 1.428.281 parámetros, discrepancia que se detalla en las limitaciones).

Es relevante para la comunidad de ML científico porque demuestra que un operador neuronal puede alcanzar un error relativo L2 del 0,648 % en el conjunto de test sin usar datos etiquetados, superando la referencia data-driven publicada (1,08 % de Li et al., ICLR 2021). El modelo es pequeño, entrenable en unos 14 minutos por ejecución y liberado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fourier Neural Operator (FNO) con implementación JAX/Flax |
| Parametros totales | 2.836.281 reales según la model card; el repositorio safetensors declara 1.428.281 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: rejilla 85 x 85, 7.225 puntos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa) |
| Idiomas soportados | no aplica (modelo de PDE, no lingüístico) |
| Licencia | Apache 2.0 (pesos); código LGPL-3.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` y `sample.safetensors` |

## Arquitectura y entrenamiento

El modelo es un Fourier Neural Operator (FNO) según la formulación de Li et al. (ICLR 2021, arXiv:2010.08895). La arquitectura opera en el dominio de la frecuencia mediante transformadas de Fourier para aproximar el operador de solución de la PDE de Darcy, lo que permite resolver sobre rejillas regulares de forma eficiente. La implementación está en JAX/Flax y el repositorio de pesos incluye `config.json` con los ajustes del modelo y las estadísticas de normalización, así como `sample.safetensors` con una entrada de test y la salida esperada.

El entrenamiento es *label-free*: se optimiza únicamente la energía de Ritz Q4, sin etiquetas de solución. Se usó AdamW con gestión de números complejos, learning rate inicial 1e-3 reducido a la mitad cuatro veces durante la ejecución, sin weight decay ni clipping, batch de 20 y 100.000 pasos. La normalización se ajusta solo sobre los campos de coeficiente de entrenamiento. La ejecución vio 10.000 campos de coeficiente en total (los 1.000 liberados más campos muestreados sin etiqueta). Semilla 0, pesos de la última época y sin selección de checkpoint sobre el conjunto de test. Tiempo de entrenamiento aproximado: 14 minutos por ejecución. La solución exacta Q4 de la misma formulación tiene un suelo de 0,31 % de error relativo L2.

## Capacidades

- Aproximación del operador de solución del flujo de Darcy 2D: mapea permeabilidad a presión en rejillas de 85 x 85.
- Resolución de PDE sin etiquetas de solución (entrenamiento physics-only con energía de Ritz Q4).
- Evaluación sobre el conjunto de test de Darcy 2D de Li et al. (ICLR 2021).
- Capacidad de generalización dentro de los rangos de entrada del benchmark de entrenamiento.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües: no es un modelo de lenguaje.
- No soporta visión, audio ni modos de razonamiento conversacional.

## Casos de uso

- Simulación rápida de flujo en medios porosos: sustituir la resolución numérica iterativa de la PDE de Darcy por una inferencia directa del operador, útil para exploración de parámetros en geología e hidrología.
- Caracterización de yacimientos: estimar campos de presión a partir de campos de permeabilidad en estudios de petróleo y gas, con la ventaja de no requerir datos etiquetados para reentrenar.
- Validación de solvers numéricos: usar el operador como referencia aproximada para comprobar la convergencia de solvers de elementos finitos en problemas de Darcy.
- Investigación en ML científico: servir de línea base physics-only para comparar con modelos data-driven como la referencia de Li et al. (1,08 % de error relativo L2).
- Generación de datos sintéticos: producir pares permeabilidad-presión para aumentar conjuntos de entrenamiento de otros modelos, dentro de los rangos de entrada del benchmark.
- Docencia y reproducibilidad: el modelo es pequeño (unos 2,8 M de parámetros), entrena en unos 14 minutos y se reproduce con un único comando desde el repositorio scirex v1.0.0, lo que lo hace adecuado para prácticas de operadores neuronales.
- Integración en pipelines de diseño inverso: al ser un mapeo diferenciable (JAX), puede usarse dentro de bucles de optimización de campos de permeabilidad para alcanzar presiones objetivo.

## Benchmarks y rendimiento

| Metrica | Este modelo | Referencia publicada |
|---|---|---|
| Error relativo L2 en test, ejecución extra-fields (10k campos, sin etiquetas) | 0,648 % | No existe referencia physics-only; referencia data-driven: 1,08 % (Li et al., ICLR 2021, Tabla 4) |

Menor es mejor, excepto en correlaciones de Spearman. Los datos proceden de la tabla de resultados de ScireX y de las páginas del benchmark. No se han publicado más resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con unos 2,8 M de parámetros y precisión completa, el modelo ocupa del orden de decenas de MB, por lo que cabe en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU de gama alta; cualquier GPU moderna (RTX 3060 o superior) es suficiente. CPU también viable para inferencia puntual.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en entornos sin GPU.
- Opciones de despliegue: inferencia mediante JAX/Flax con los scripts del repositorio scirex (`scripts/benchmarks/darcy_physics/infer.py`); descarga con `hf download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada. El entrenamiento de una ejecución completa tarda unos 14 minutos, lo que da una idea del coste computacional reducido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Error relativo L2 en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScireX FNO Darcy physics-only (este modelo) | 2.836.281 | Rejilla 85 x 85 | 0,648 % | Apache 2.0 | Hugging Face |
| ScireX GINO Darcy physics-only | no disponible | Rejilla 85 x 85 | no disponible | no disponible | Hugging Face |
| ScireX Transolver Darcy physics-only | no disponible | Rejilla 85 x 85 | no disponible | no disponible | Hugging Face |
| ScireX WNO Darcy physics-only | no disponible | Rejilla 85 x 85 | no disponible | no disponible | Hugging Face |
| ScireX FNO Darcy data-driven | no disponible | Rejilla 85 x 85 | no disponible | no disponible | Hugging Face |

Los modelos comparables pertenecen a la misma familia de checkpoints ScireX y al mismo benchmark; la model card no proporciona sus métricas ni parámetros, por lo que no se pueden comparar numéricamente.

## Limitaciones y advertencias

- Válido solo dentro de los rangos de entrada del benchmark de entrenamiento; no debe usarse para diseño crítico de seguridad sin validación independiente.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- Discrepancia en el recuento de parámetros: la model card indica 2.836.281 parámetros reales, mientras que el repositorio safetensors declara 1.428.281; conviene verificar contra `config.json` antes de desplegar.
- Los pesos son inutilizables sin las estadísticas de normalización de `config.json`.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de extrapolación incorrecta fuera del dominio de entrenamiento.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: pesos bajo Apache 2.0, permisivo para uso comercial; el código es LGPL-3.0, con obligaciones de copyleft para modificaciones del código. Los datos de entrenamiento (Li et al., Zenodo 12784353) son CC BY 4.0 y requieren atribución.
- El suelo teórico de la formulación Q4 exacta es 0,31 % de error relativo L2, por lo que el margen de mejora del modelo es limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenteiq-ai/scirex-fno-darcy-physics-extra-fields
- Repositorio scirex: https://github.com/zenteiq-research/scirex
- Página del benchmark (resultados comparativos): https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/darcy_physics/results/comparative.md
- Guía de reproducibilidad: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/reproducibility.md
- Issues del repositorio: https://github.com/zenteiq-research/scirex/issues
- Paper de la arquitectura FNO (Li et al., ICLR 2021): https://arxiv.org/abs/2010.08895
- Dataset Darcy flow (Li et al., Zenodo 12784353): https://zenodo.org/records/12784353
- Checkpoint GINO: https://huggingface.co/zenteiq-ai/scirex-gino-darcy-physics-extra-fields
- Checkpoint Transolver: https://huggingface.co/zenteiq-ai/scirex-transolver-darcy-physics-extra-fields
- Checkpoint WNO: https://huggingface.co/zenteiq-ai/scirex-wno-darcy-physics-extra-fields
- Ejecución data-driven del mismo modelo: https://huggingface.co/zenteiq-ai/scirex-fno-darcy
- Benchmark pipe flow: https://huggingface.co/zenteiq-ai/scirex-fno-pipe
- Benchmark Navier-Stokes 2D: https://huggingface.co/zenteiq-ai/scirex-fno-navier-stokes
- Benchmark chip cooling: https://huggingface.co/zenteiq-ai/scirex-fno-chip-cooling
