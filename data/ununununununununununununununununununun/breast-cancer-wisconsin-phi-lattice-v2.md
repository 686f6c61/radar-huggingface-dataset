# ununununununununununununununununununun/breast-cancer-wisconsin-phi-lattice-v2

## Resumen

`breast-cancer-wisconsin-phi-lattice-v2` es un clasificador tabular para diagnostico clinico entrenado sobre el conjunto de datos Breast Cancer Wisconsin (Diagnostic), compuesto por 569 muestras de biopsia por aspiracion con aguja fina y 30 caracteristicas citologicas. El modelo se distribuye cuantizado con el esquema propietario `phi-lattice-v2`, una segunda generacion de una tecnica de cuantizacion por retícula que el autor presenta como alternativa a la cuantizacion uniforme estandar.

El problema que aborda es la compresion de pesos en modelos tabulares medicos con perdida minima de precision: segun la model card, el modelo mantiene un 93,86 % de exactitud en test tanto en FP32 como en 4 y 3 bits, mientras que la cuantizacion uniforme sacrifica senal de reconstruccion (SQNR) de forma mas acusada. La relevancia es acotada: se trata de un artefacto de investigacion sobre tecnicas de cuantizacion aplicadas a un dataset de referencia pequeno y ampliamente conocido, no de un modelo de produccion.

No se dispone de informacion sobre arquitectura interna, numero de parametros, longitud de contexto ni datos de entrenamiento mas alla de la mencion al dataset. El repositorio tiene 0 GB de tamano, 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que los pesos podrian no estar publicados o ser de tamano despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador tabular; arquitectura neuronal concreta no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada tabular de 30 caracteristicas) |
| Tipos de cuantizacion | 4 bits y 3 bits mediante `phi-lattice-v2`; referencia FP32 |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | no disponible (tamano del repo: 0.0 GB) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura de red: solo indica que es un clasificador tabular de diagnostico clinico. La entrada son 30 caracteristicas citologicas derivadas de imagenes de aspiracion con aguja fina (radio, textura, perimetro, area, suavidad, compacidad, concavidad, puntos concavos, simetria y dimension fractal, cada una con media, error estandar y peor valor). El conjunto de entrenamiento es el Breast Cancer Wisconsin (Diagnostic) con 569 muestras.

La innovacion tecnica declarada es el esquema de cuantizacion `phi-lattice-v2`, que sustituye la rejilla uniforme por una retícula basada en la razon aurea. Segun la tabla de la model card, en 4 bits alcanza un SQNR de pesos de 19,88 dB frente a 20,71 dB de la cuantizacion uniforme y 18,48 dB de la v1; en 3 bits alcanza 13,49 dB frente a 13,51 dB de la uniforme y 12,67 dB de la v1. La ventaja declarada de la v2 sobre la v1 es de +1,40 dB en 4 bits y +0,82 dB en 3 bits, con una tasa de dispersión (sparsity) del 9,51 % en 4 bits. No se documentan datos de entrenamiento adicionales, uso de RLHF/DPO ni detalles del proceso de ajuste.

## Capacidades

- Clasificacion binaria tabular de muestras de biopsia mamaria (maligno/benigno) a partir de 30 caracteristicas numericas.
- Inferencia en precision reducida: 4 bits y 3 bits con exactitud de test identica a FP32 segun la model card (93,86 %).
- Cuantizacion con retícula `phi-lattice-v2`, con mayor SQNR que la v1 a igual bit-depth.
- No soporta generacion de texto, codigo, matematicas, vision, audio ni razonamiento multi-paso.
- No soporta tool calling ni function calling.
- No soporta agentes ni planificacion.
- No tiene capacidades multilingues: la entrada es exclusivamente numerica.
- No dispone de modo thinking ni capacidades especiales mas alla de la clasificacion.

## Casos de uso

- Prototipado de pipelines de diagnostico asistido: el modelo sirve como referencia para validar preprocesado de las 30 caracteristicas citologicas y el flujo de evaluacion antes de sustituirlo por un clasificador propio.
- Investigacion en cuantizacion de modelos tabulares: permite comparar `phi-lattice-v2` frente a cuantizacion uniforme y v1 usando la tabla de SQNR y exactitud publicada, en un entorno reproducible y de bajo coste computacional.
- Despliegue en dispositivos con memoria muy limitada: la version de 3 bits reduce el espacio de pesos manteniendo el 93,86 % de exactitud reportado, lo que resulta adecuado para entornos embebidos o de borde en los que el presupuesto de memoria es critico.
- Docencia y experimentacion con datasets medicos de referencia: el Breast Cancer Wisconsin es un corpus clasico, y este artefacto permite ilustrar el impacto de la cuantizacion en la precision de un clasificador clinico.
- Baseline en estudios de compresion: sirve como punto de comparacion cuantitativo (SQNR en dB, exactitud, sparsity) para nuevas tecnicas de cuantizacion no uniforme.
- Evaluacion de robustez ante cuantizacion agresiva: util para medir si un clasificador tabular pequeno conserva su exactitud al pasar de FP32 a 3 bits, algo relevante en modelos medicos que deben desplegarse con restricciones de hardware.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test del Breast Cancer Wisconsin (Diagnostic):

| Metodo | SQNR pesos 4 bits | Exactitud test 4 bits | Sparsity 4 bits | SQNR pesos 3 bits | Exactitud test 3 bits |
|---|---|---|---|---|---|
| Baseline FP32 | Referencia | 93,86 % | 0,00 % | Referencia | 93,86 % |
| Uniforme estandar | 20,71 dB | 93,86 % | 0,00 % | 13,51 dB | 93,86 % |
| `phi-lattice v1` | 18,48 dB | 93,86 % | 5,94 % | 12,67 dB | 93,86 % |
| `phi-lattice v2` (este repo) | 19,88 dB | 93,86 % | 9,51 % | 13,49 dB | 93,86 % |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable dado que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0,0 GB y no se especifica el numero de parametros, por lo que no puede calcularse con rigor.
- GPU recomendadas: no disponible. Dado el caracter tabular del modelo y su tamano despreciable, es probable que la inferencia en CPU sea suficiente, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada; por el perfil del artefacto (clasificador tabular de 30 caracteristicas) no deberia requerir GPU dedicada.
- Opciones de despliegue: no disponibles. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un clasificador tabular.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `breast-cancer-wisconsin-phi-lattice-v2` | no disponible | no aplica (30 features) | 93,86 % | MIT | HuggingFace |
| `phi-lattice v1` (mismo autor) | no disponible | no aplica | 93,86 % | MIT (presumible) | Referenciado en la model card |
| Cuantizacion uniforme sobre el mismo clasificador | no disponible | no aplica | 93,86 % | no aplica | Baseline interno |
| Otros clasificadores sobre Breast Cancer Wisconsin | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion sobre un dataset de referencia: el Breast Cancer Wisconsin es pequeno (569 muestras) y ampliamente utilizado en docencia; no es representativo de la variabilidad clinica real.
- Riesgo de sobreajuste y de generalizacion limitada: no se documenta validacion externa ni cohortes independientes.
- Riesgo de alucinacion no aplica en sentido estricto (no genera texto), pero si existe riesgo de clasificacion erronea con consecuencias clinicas; el modelo no debe usarse como herramienta diagnostica sin validacion regulatoria.
- Sesgos conocidos: no documentados; el dataset original tiene limitaciones demograficas y de recogida que no se abordan en la model card.
- Limitaciones de contexto e idioma: no aplica, la entrada es tabular y no linguistica.
- Restricciones de licencia: MIT permite uso comercial, pero la ausencia de validacion clinica y de marcado CE o aprobacion FDA impide su uso en diagnostico medico real.
- Caveat de produccion: el repositorio pesa 0,0 GB y no se especifica el formato de pesos, por lo que no puede confirmarse que los pesos esten efectivamente publicados y sean descargables.
- La comparacion de SQNR muestra que la cuantizacion uniforme supera a `phi-lattice-v2` en 4 bits (20,71 dB frente a 19,88 dB); la ventaja declarada de la v2 es solo frente a la v1, no frente al metodo uniforme.
- El autor del repositorio usa un nombre de usuario no identificable (`ununununununununununununununununununun`), lo que dificulta verificar trazabilidad y reputacion.

## Enlaces

- HuggingFace: https://huggingface.co/ununununununununununununununununununun/breast-cancer-wisconsin-phi-lattice-v2
- Dataset Breast Cancer Wisconsin (Diagnostic): no disponible en la informacion proporcionada
- Paper o blog de `phi-lattice-v2`: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
