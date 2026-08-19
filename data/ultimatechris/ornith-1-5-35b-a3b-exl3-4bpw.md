# ultimatechris/Ornith-1.5-35B-A3B-EXL3-4bpw

## Resumen

Ornith-1.5-35B-A3B-EXL3-4bpw es una cuantizacion comunitaria del modelo base Ornith-1.5-35B-A3B, desarrollado por Ornith AI, realizada por el usuario ultimatechris con la libreria ExLlamaV3. Se trata de un modelo de lenguaje de tipo Mixture of Experts (MoE) con 35 mil millones de parametros totales y aproximadamente 3 mil millones de parametros activos por token, lo que permite una inferencia eficiente en hardware de consumo. Esta version cuantizada a 4 bits (4.0 bpw) con la receta de alta calidad (-hq) reduce el tamano del artefacto a 18.47 GiB, facilitando su despliegue en GPUs con VRAM limitada.

La relevancia de esta cuantizacion radica en que permite ejecutar un modelo MoE de gran tamano en entornos locales o de produccion con requisitos de memoria reducidos, manteniendo un equilibrio entre calidad y velocidad. Al estar basado en la arquitectura Qwen3.5 MoE (segun los tags), hereda las capacidades del modelo original, incluyendo generacion de texto, razonamiento y soporte de herramientas, aunque los detalles especificos de la version 1.5 no estan completamente documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (segun tags) |
| Parametros totales | 35.1 B (aprox.) |
| Parametros activos | 3 B (aprox.) |
| Longitud de contexto | no disponible (el modelo base Ornith 1.0 soporta 262K tokens, pero no se confirma para 1.5) |
| Tipos de cuantizacion | 4.0 bpw (EXL3, receta HQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de tipo Mixture of Experts (MoE) con 35 mil millones de parametros totales y 3 mil millones activos por token, basado en la familia Qwen3.5 MoE. Esta configuracion permite activar solo una fraccion de los parametros en cada paso de inferencia, reduciendo el coste computacional y la memoria necesaria en comparacion con un modelo denso del mismo tamano. El modelo base fue desarrollado por Ornith AI, que en su version 1.0 empleo un framework de entrenamiento con aprendizaje por refuerzo (RL) para optimizar tanto las soluciones generadas como el "scaffold" que las guia, mejorando las trayectorias de busqueda y la calidad de las respuestas.

La cuantizacion EXL3 a 4.0 bpw con la receta de alta calidad (-hq) asigna bitrates superiores a las matrices de expertos compartidos, mezcladores, atencion y proyecciones de salida, mientras que las matrices de expertos grandes usan el bitrate objetivo. Esto preserva la precision en las partes criticas del modelo. El proceso de conversion se realizo con una NVIDIA A100 40GB y el artefacto resultante ocupa 18.47 GiB. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens o el uso de tecnicas como RLHF o DPO para esta version.

## Capacidades

- Generacion de texto y conversacion multi-turno, gracias a su arquitectura MoE y al chat template incluido en el repositorio.
- Razonamiento y resolucion de problemas, potenciado por el entrenamiento con aprendizaje por refuerzo que optimiza trayectorias de busqueda.
- Soporte de tool calling y flujos de trabajo de agentes, segun lo indicado para la familia Ornith en su version 1.0.
- Capacidades multilingues no confirmadas para la version 1.5; la informacion disponible no especifica los idiomas soportados.
- No se confirma soporte de vision, audio u otras modalidades; el pipeline declarado es text-generation.

## Casos de uso

- Asistentes de codigo locales: el modelo puede integrarse en entornos de desarrollo como un agente de codificacion que sugiere implementaciones, refactorizaciones y correcciones, aprovechando su capacidad de razonamiento y su eficiencia MoE para ejecutarse en una GPU de consumo.
- Atencion al cliente automatizada: con una ventana de contexto potencialmente amplia (heredada del modelo base), puede gestionar conversaciones largas y mantener el hilo de la interaccion, aunque la longitud exacta para la version 1.5 no esta confirmada.
- Generacion de documentacion tecnica: su capacidad de generar texto coherente y estructurado permite crear documentacion de APIs, guias de usuario o comentarios de codigo a partir de especificaciones.
- Analisis de logs y depuracion: puede procesar grandes volumenes de texto (logs, trazas) y ayudar a identificar patrones de error o anomalias, gracias a su contexto extendido y su razonamiento.
- Agentes autonomos de investigacion: con soporte de tool calling, puede orquestar busquedas web, consultas a bases de datos o llamadas a APIs para recopilar informacion y sintetizar respuestas.
- Prototipado rapido de aplicaciones conversacionales: al ser un modelo cuantizado y ligero en parametros activos, es adecuado para entornos de desarrollo donde se necesita iterar rapidamente sin grandes costes de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La cuantizacion no incluye metricas de rendimiento comparativas, y la model card del modelo base no fue accesible en los resultados de busqueda. Se recomienda consultar la ficha del modelo original para obtener datos de evaluacion.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa 18.47 GiB, por lo que se necesita al menos 20-24 GB de VRAM para cargar el modelo con margen para el contexto y los calculos intermedios. Con cuantizaciones similares (Q4_K_M) en la version 1.0 se estiman unos 23.2 GB, por lo que esta version EXL3 podria requerir una cantidad similar.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 40GB, o GPUs profesionales con 24 GB o mas. No cabe en GPUs de 16 GB sin offloading parcial.
- Opciones de despliegue: ExLlamaV3 es la libreria principal; frontends compatibles como TabbyAPI. Tambien podria usarse con llama.cpp si se convierte a GGUF, aunque el repositorio actual solo contiene safetensors EXL3.
- Latencia y throughput: no disponibles. Dependen del frontend, la GPU, el tamano del contexto y la configuracion de batch.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35.1 B | 3 B | no disponible | MIT | safetensors |
| Ornith-1.0-35B-A3B | 35.1 B | 3 B | 262K | MIT | safetensors |
| Qwen2.5-32B (denso) | 32.5 B | 32.5 B | 128K | Apache 2.0 | safetensors |

La comparativa se basa en datos publicos de la version 1.0 y en modelos similares de la familia Qwen. La version 1.5 no tiene especificaciones publicas detalladas en la informacion disponible. La principal ventaja de Ornith es su arquitectura MoE con solo 3B activos, que ofrece un rendimiento por token superior en hardware limitado frente a modelos densos del mismo tamano.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede introducir una degradacion de calidad en tareas de alta precision, especialmente en razonamiento matematico o generacion de codigo complejo, aunque la receta HQ mitiga parcialmente este efecto.
- No se dispone de informacion sobre sesgos especificos del modelo base; se recomienda evaluar el comportamiento en dominios sensibles antes de un despliegue en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; la ventana de contexto amplia puede amplificar la generacion de contenido plausible pero incorrecto si no se supervisa.
- La licencia MIT permite uso comercial, pero se deben respetar las condiciones del modelo base y las atribuciones correspondientes.
- El repositorio de cuantizacion no incluye benchmarks ni evaluaciones propias; los usuarios deben validar el rendimiento en sus casos de uso especificos.
- La longitud de contexto real depende del frontend y de la configuracion de memoria; no se garantiza el contexto completo del modelo base en esta cuantizacion.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/ultimatechris/Ornith-1.5-35B-A3B-EXL3-4bpw
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo Ornith 1.0 (referencia): https://huggingface.co/ornith-ai/Ornith-1.0-35B
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
- Pagina de Ornith 1.0: https://ornith.online/ornith-1-0-model-35b
- Requisitos de VRAM de Ornith 1.0: https://willitrunai.com/models/ornith-1.0-35b-a3b
