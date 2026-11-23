# SOTAagi2030/nacre-release-xafab3

## Resumen

Nacre selective-state release (identificador `SOTAagi2030/nacre-release-xafab3`) es un checkpoint publicado por el usuario SOTAagi2030 bajo licencia Apache 2.0. Segun su model card, se trata de un "compact integration fixture", es decir, un artefacto de prueba de integracion disenado para ejercitar el cargador compartido de modelos de espacio de estados selectivos (selective-state) de la libreria `nacre-mini-runtime`. No es un modelo de proposito general ni esta pensado para generacion de texto abierta.

La arquitectura declarada es un decoder causal basado en mezcladores de espacio de estados (SSM), con normalizacion de coeficientes previa a la discretizacion y proyeccion de salida que respeta el atado de embeddings (embedding tying). El autor menciona tambien una variante con cabeza de salida independiente (untied) para sharding de vocabulario contiguo. No se publican datos sobre numero de parametros, longitud de contexto ni composicion del corpus de entrenamiento.

Su relevancia es limitada y muy acotada: sirve como referencia de regresion y como ejemplo de integracion para desarrolladores que trabajen con el runtime `nacre-mini-runtime` o con arquitecturas SSM. No debe evaluarse como alternativa a modelos generativos de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal con mezclador de espacio de estados selectivo (SSM) por capa |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (libreria declarada: `nacre-mini-runtime`) |

## Arquitectura y entrenamiento

Segun la model card, cada capa del decoder aplica normalizacion, un mezclador de espacio de estados y una conexion residual. La normalizacion de coeficientes se selecciona segun el tipo de modelo y se ejecuta antes de la discretizacion, un detalle propio de las arquitecturas SSM selectivas tipo Mamba, donde los parametros (A, B, C, delta) se discretizan por paso temporal. La proyeccion de salida respeta el atado de embeddings, y se contempla una variante con cabeza de salida independiente para sharding de vocabulario contiguo.

No se especifican volumen de tokens de entrenamiento, composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. El autor describe el artefacto como un "fixture de integracion compacto con sondas de regresion registradas", lo que sugiere que los pesos pueden ser sinteticos o de muy baja escala, orientados a validar el cargador y el flujo de inferencia del runtime mas que a producir texto coherente.

## Capacidades

- Ejecucion de inferencia causal de siguiente token sobre el runtime `nacre-mini-runtime`.
- Validacion del contrato de decoder: normalizacion, mezclador SSM y residual por capa.
- Soporte de dos variantes de cabeza de salida: atada a embeddings y no atada con sharding de vocabulario.
- Pruebas de regresion reproducibles mediante las sondas registradas por el autor.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- No se declaran capacidades multilingues ni un vocabulario o conjunto de idiomas concreto.
- El propio autor indica explicitamente que no esta destinado a generacion de texto de proposito general.

## Casos de uso

- Pruebas de integracion del runtime: usar el checkpoint para verificar que `nacre-mini-runtime` carga correctamente pesos SSM, aplica la normalizacion de coeficientes antes de la discretizacion y produce las salidas esperadas en las sondas de regresion.
- Regresion continua en CI: incorporar las tres slices registradas (time-step control, coefficient context, parallel output head) como tests automatizados que detecten roturas en el cargador o en el grafo de computo tras refactorizaciones.
- Validacion de cabezas de salida con sharding: emplear la variante untied para comprobar el reparto de vocabulario contiguo entre dispositivos en pipelines de inferencia distribuida.
- Referencia para implementaciones SSM: servir como ejemplo minimo de contrato de decoder (normalizacion, mixer, residual, tying) para quien implemente su propio runtime o porte la arquitectura a otro framework.
- Verificacion de compatibilidad de pesos: comprobar que la ruta de coeficientes original del "state-space flavor" establecido se preserva al cargar el checkpoint en versiones nuevas de la libreria.
- Docencia y experimentacion: usar el fixture como banco de pruebas de bajo coste para estudiar el comportamiento de mezcladores de estado selectivos sin necesidad de GPUs de gran capacidad, dado que no se declara un tamano de parametros elevado.

## Benchmarks y rendimiento

El autor publica unicamente metricas internas de evaluacion de siguiente token, no comparables con benchmarks estandar (MMLU, HumanEval, GSM8K, etc.):

| Slice | Precision de siguiente token |
|---|---|
| Time-step control | 0.900 |
| Coefficient context | 0.900 |
| Parallel output head | 0.875 |
| Minimo por slice | 0.875 |
| Precision global de token | 0.893 |
| NLL medio por token | 0.335 |

No se han publicado resultados en benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El autor no declara numero de parametros ni formato de pesos, por lo que no es posible estimar el consumo de memoria.
- GPU recomendadas: no disponible. Al tratarse de un fixture de integracion compacto, es probable que quepa en GPU de consumo, pero no hay dato publicado que lo confirme.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: la unica via documentada es la libreria `nacre-mini-runtime`. No se menciona soporte para vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Proposito |
|---|---|---|---|---|---|
| Nacre selective-state release | no disponible | no disponible | SSM selectivo causal | Apache 2.0 | Fixture de integracion y regresion |
| Mamba / Mamba-2 (referencia SSM) | 130M a 2.8B | hasta 2M en variantes largas | SSM selectivo | Apache 2.0 | Generacion de texto de proposito general |
| Falcon Mamba 7B | 7B | 8K o mas | SSM puro | Apache 2.0 | Generacion de texto de proposito general |

La comparativa con modelos SSM de referencia es solo arquitectonica: Nacre no declara parametros, contexto ni evaluaciones estandar, y su alcance declarado excluye la generacion de texto general. No se dispone de datos suficientes para una comparacion de rendimiento.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no esta destinado a generacion de texto de proposito general; usarlo en produccion para ese fin es un error de uso.
- Se desconoce el tamano de parametros, el contexto y el vocabulario, lo que impide evaluar su calidad o su encaje en un pipeline real.
- Las unicas metricas publicadas son sondas internas de regresion (precision de siguiente token entre 0.875 y 0.900), no comparables con benchmarks de la comunidad.
- Riesgo elevado de salidas incoherentes o degeneradas si se emplea fuera de su proposito de prueba.
- No se documentan sesgos, idiomas ni composicion del corpus; no es posible evaluar riesgos de sesgo.
- No se declara soporte de cuantizacion, tool calling ni despliegue en servidores de inferencia estandar.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre el origen de los datos impide verificar el cumplimiento de requisitos de atribucion o de datos de entrenamiento.
- El checkpoint tiene cero descargas y cero likes en el momento de la consulta, sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SOTAagi2030/nacre-release-xafab3
- Libreria declarada: `nacre-mini-runtime` (no se proporciona repositorio ni documentacion adicional)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
