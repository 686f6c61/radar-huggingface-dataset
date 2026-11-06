# viai957/Goedel-Prover-V2-8B-EI-campaign1-r3

## Resumen

Goedel-Prover-V2-8B-EI-campaign1-r3 es un ajuste fino experimental del modelo Goedel-Prover-V2-8B (desarrollado por Goedel-LM, basado en la arquitectura Qwen3), publicado por el usuario viai957 en Hugging Face. El modelo está especializado en demostración automática de teoremas en Lean 4 y ha sido entrenado mediante expert iteration: el modelo genera demostraciones candidatas que son verificadas por el kernel de Lean 4, y las demostraciones verificadas más cortas se usan como datos de ajuste supervisado.

Esta versión corresponde a la ronda 3 de una campaña de alineamiento denominada campaign1, continuando desde el modelo de la ronda 2. Tras el entrenamiento, los pesos ajustados se promediaron con los pesos del modelo base original (peso 0,7 para el modelo ajustado). Un dato relevante: la regla de parada de la campaña no seleccionó esta ronda (la campaña se detuvo por regresión tras la ronda 3, y la mejor ronda según la regla de parada fue la 1), por lo que el autor publica este checkpoint únicamente por completitud y recomienda leer la sección de evaluación antes de usarlo.

El modelo conserva la licencia Apache 2.0 del modelo base, se distribuye en formato safetensors con los pesos completos (8,19 mil millones de parámetros, unos 16,4 GB en el repositorio) y es compatible con la librería transformers de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3 (familia Goedel-Prover-V2) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos completos en el repo) |
| Idiomas soportados | no disponible (especializado en Lean 4 / matematicas formales) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos completos, sin LoRA aplicado) |

## Arquitectura y entrenamiento

El modelo parte de Goedel-LM/Goedel-Prover-V2-8B (revision `dfd02e6271a58375dfbf3ece0175277cf6b6a89a`), un modelo de la familia Qwen3 de 8B parametrizado para generacion de demostraciones formales. Este ajuste fino aplica expert iteration en la ronda 3: se seleccionaron 300 enunciados de un pool descontaminado de 5.940 filas, el modelo muestreo 8 demostraciones por enunciado con un limite de 16.384 tokens de generacion, el kernel de Lean 4 verifico las respuestas y se conservaron hasta 4 demostraciones verificadas por enunciado (priorizando las mas cortas).

Sobre esos datos se entreno un LoRA (rango 64, alpha 128,0) mediante SFT con la configuracion `configs/p2_sft.toml`, generando 398 filas de entrenamiento (sobre 127 enunciados distintos) con 1.523.369 tokens de completacion. Las filas proceden de Goedel-Pset-v1 (214), NuminaMath-LEAN-Sol (64), Nemotron-Math-Proofs-v1 (49), RL-Goedel-Pset-Level-4-5 (37) y FormalMATH-All (34). Tras fusionar el LoRA en el modelo base, los pesos resultantes se promediaron con los pesos del modelo base original (peso 0,7 para el modelo ajustado, 399 tensores promediados). El conjunto de desarrollo para la regla de parada fue miniF2F-valid, y el conjunto protegido (descontaminado) miniF2F. La campana se detuvo por regresion tras esta ronda; la mejor ronda segun la regla de parada fue la 1.

## Capacidades

- Generacion de demostraciones formales en Lean 4, verificables por el kernel de Lean 4.
- Resolucion de problemas de matematicas de nivel olimpiada y competicion expresados en formato formal (miniF2F, FormalMATH).
- Generacion de texto conversacional heredada del modelo base Qwen3, aunque el ajuste esta orientado a demostraciones.
- No hay evidencia de soporte de vision, audio ni multimodalidad.
- No hay informacion sobre soporte de tool calling ni capacidades de agentes en la model card.

## Casos de uso

- Demostracion automatica de teoremas en Lean 4: el modelo genera candidatos de demostracion que pueden verificarse directamente con el kernel de Lean, ideal para flujos de trabajo autoformalizantes con verificacion exacta.
- Generacion con muestreo multiple: dado que el entrenamiento uso 8 muestras por enunciado, el modelo rinde bien en pipelines que muestrean varias demostraciones y conservan la primera que pase el verificador.
- Investigacion en expert iteration y RLHF formal: al publicarse con manifiestos de entrenamiento detallados, es util como caso de estudio reproducible de alineamiento con verificacion formal.
- Asistencia a matematicos y verificadores: puede proponer esbozos o demostraciones completas de lemas auxiliares en proyectos Coq/Lean de gran tamano.
- Benchmarks de razonamiento matematico formal: adecuado para evaluar sobre miniF2F (su conjunto protegido) y FormalMATH-All.
- Educacion en matematicas formales: generacion de demostraciones de ejemplo para estudiantes de logica y teoria de la demostracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una regla de parada basada en un conjunto de desarrollo (miniF2F-valid) con umbrales de regresion (max_regress: 3 problemas, min_gain: 2 problemas, paciencia: 2 rondas) y una ronda ganadora (la 1), pero no incluye numeros concretos de tasa de exito, ni comparaciones con el modelo base u otros proveres.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16-18 GB (8,19 mil millones de parametros a 2 bytes por parametro), sin contar el KV cache.
- GPU recomendadas: RTX 4090 (24 GB), RTX 5090, A100 o H100 para inferencia comoda; para entrenamiento o fine-tuning adicional, A100/H100 con memoria amplia.
- Consumer GPU: cabe en una RTX 4090 de 24 GB en precision completa; con cuantizacion de terceros (no publicada en este repo) podria caber en GPUs de 12-16 GB.
- Despliegue: transformers (libreria nativa del repo), text-generation-inference (compatible segun tags), y en principio vLLM o llama.cpp tras conversion, aunque no hay GGUF publicado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Notas |
|---|---|---|---|---|
| viai957/Goedel-Prover-V2-8B-EI-campaign1-r3 | 8,19B | Demostracion Lean 4 (expert iteration ronda 3) | Apache 2.0 | No seleccionado por la regla de parada de la campana (mejor ronda: 1) |
| Goedel-LM/Goedel-Prover-V2-8B | 8,19B | Demostracion Lean 4 (modelo base) | Apache 2.0 | Punto de partida de este ajuste; probablemente mas estable |
| Goedel-Prover-V2 (versiones grandes, Goedel-LM) | hasta 32B (según publicaciones de la familia) | Demostracion Lean 4 | Apache 2.0 | Mayor capacidad de demostracion, mayores requisitos de hardware |

## Limitaciones y advertencias

- La propia model card advierte que la regla de parada de la campana NO selecciono esta ronda: la campana se detuvo por regresion tras la ronda 3 y la mejor ronda fue la 1. Esto sugiere que este checkpoint puede rendir peor que el modelo base o que rondas anteriores; leer la seccion de evaluacion del repo antes de usarlo en produccion.
- El conjunto de entrenamiento es muy pequeno (398 filas SFT, 1,52 millones de tokens de completacion), por lo que la mejora respecto al modelo base puede ser marginal o negativa en dominios no cubiertos.
- Riesgo de alucinacion de demostraciones: aunque el entrenamiento uso solo demostraciones verificadas por el kernel de Lean 4, las salidas del modelo en inferencia NO estan verificadas y deben pasar siempre por el verificador.
- Especializacion estrecha: el modelo esta optimizado para Lean 4 y su rendimiento en uso general (chat, codigo general, razonamiento no formal) puede haberse degradado respecto al modelo base.
- Informacion de contexto, idiomas y benchmarks no disponible en la model card.
- Licencia Apache 2.0: sin restricciones destacables para uso comercial, pero conviene revisar la licencia del modelo base y de los datasets de entrenamiento para usos sensibles.
- Descargas muy bajas (306) y ausencia de validacion comunitaria amplia: usar con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/viai957/Goedel-Prover-V2-8B-EI-campaign1-r3
- Modelo base: https://huggingface.co/Goedel-LM/Goedel-Prover-V2-8B
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/Goedel-LM/Goedel-Pset-v1
  - https://huggingface.co/datasets/HangHor/RL-Goedel-Pset-Level-4-5
  - https://huggingface.co/datasets/SphereLab/FormalMATH-All
  - https://huggingface.co/datasets/iiis-lean/NuminaMath-LEAN-Sol
  - https://huggingface.co/datasets/nvidia/Nemotron-Math-Proofs-v1
