# unslothai/Hy-MT3-30B-A3B-GGUF

## Resumen

Hy-MT3-30B-A3B-GGUF es la distribucion en formato GGUF del modelo de traduccion automatica Hy-MT3-30B-A3B, desarrollado originalmente por Tencent y empaquetado por Unsloth para su ejecucion local. Se trata de un modelo de arquitectura de mezcla de expertos (MoE) con 30.064.725.888 parametros totales, de los cuales solo una fraccion se activa por token (designacion A3B, es decir, aproximadamente 3.000 millones de parametros activos), lo que permite un equilibrio entre calidad de traduccion y coste computacional en inferencia.

El modelo esta especializado en traduccion multilingue (pipeline `translation`) y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en productos. Esta version concreta, publicada por unslothai, ofrece tres cuantizaciones GGUF (IQ2, Q4_K_M y Q8_0) pensadas para ejecutarse en hardware de consumo o en estaciones de trabajo sin GPU de datacenter, mediante herramientas compatibles con el formato GGUF.

Su relevancia actual radica en la posibilidad de desplegar un modelo de traduccion de gran calidad de forma local y privada, sin depender de APIs externas, manteniendo un coste de memoria reducido gracias a la cuantizacion y a la naturaleza MoE del modelo. El repositorio ocupa 65,4 GB en total por incluir varias cuantizaciones, aunque cada archivo individual es considerablemente menor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer |
| Parametros totales | 30.064.725.888 |
| Parametros activos | Aproximadamente 3.000 millones (designacion A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2, Q4_K_M, Q8_0 |
| Idiomas soportados | no disponible (modelo multilingue segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Hy-MT3-30B-A3B emplea una arquitectura de mezcla de expertos (MoE) sobre un transformer, con 30.064 millones de parametros totales y aproximadamente 3.000 millones activos por token (denominacion A3B). Esta configuracion permite que el modelo mantenga la capacidad de representacion de un modelo de gran tamano mientras reduce el coste de computo por token, algo especialmente util en tareas de traduccion donde el throughput es critico.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones tecnicas adicionales como decodificacion especulativa o mecanismos de atencion lineal. La model card remite al repositorio original de Tencent para obtener detalles sobre idiomas soportados, ejemplos de prompts y ajustes de inferencia recomendados.

## Capacidades

- Traduccion automatica multilingue: capacidad principal del modelo, segun su pipeline `translation`.
- Conversacion: el tag `conversational` indica soporte para interaccion en formato de dialogo.
- Ejecucion local: al distribuirse en GGUF, puede ejecutarse en entornos sin conectividad ni APIs externas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con infraestructuras de inferencia estandar.
- Cuantizacion con imatrix: el tag `imatrix` indica que las cuantizaciones se generaron con matrices de importancia para preservar calidad.
- Soporte de tool calling: no disponible.
- Capacidades de agentes o razonamiento multi-paso: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Traduccion de documentacion tecnica: el modelo puede traducir manuales, guias y referencias de API manteniendo terminologia especializada, ejecutandose localmente para preservar la confidencialidad del contenido.
- Localizacion de productos de software: integracion en pipelines de CI/CD para traducir cadenas de interfaz y archivos de recursos antes de cada release, usando la cuantizacion Q4_K_M para equilibrar calidad y velocidad.
- Traduccion de correspondencia empresarial: despliegue en una estacion de trabajo con la cuantizacion IQ2 para equipos con recursos limitados, traduciendo correos y documentos internos sin enviar datos a terceros.
- Subtitulado y transcripcion multilingue: procesamiento por lotes de transcripciones para generar subtitulos en varios idiomas, aprovechando el modo conversacional para ajustar el tono.
- Atencion al cliente multilingue: integracion como motor de traduccion en sistemas de soporte que reciben consultas en varios idiomas y necesitan respuestas en el idioma del usuario.
- Investigacion en traduccion automatica: uso del modelo como linea base o componente en experimentos academicos, gracias a su licencia Apache 2.0 y a la disponibilidad de cuantizaciones para distintos presupuestos de hardware.
- Traduccion de contenido editorial: procesamiento de articulos y publicaciones con revisión humana posterior, usando Q8_0 cuando la fidelidad es prioritaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la cuantizacion IQ2 requiere aproximadamente 10-12 GB, Q4_K_M alrededor de 18-20 GB y Q8_0 en torno a 32-34 GB, en funcion de la longitud de contexto y del overhead de la aplicacion de inferencia.
- GPU recomendadas: para Q8_0 se aconseja una A100 40 GB, H100 o RTX 6000 Ada; para Q4_K_M una RTX 4090 (24 GB) o RTX 3090; para IQ2 una RTX 4080 (16 GB) o superior.
- Cabe en GPU de consumo: si, en las cuantizaciones IQ2 y Q4_K_M con GPUs de 16-24 GB; Q8_0 requiere GPUs profesionales o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Unsloth Desktop y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT3-30B-A3B (este) | 30,06 B totales / ~3 B activos | no disponible | Apache 2.0 | GGUF | Hugging Face |
| Alternativas de traduccion especializada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos especificos; al ser un modelo de traduccion, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Alucinacion: como todo modelo generativo, puede producir traducciones inexactas o inventar contenido en textos ambiguos o muy tecnicos.
- Idiomas: la lista concreta de idiomas soportados no esta disponible en esta ficha; debe consultarse el repositorio original de Tencent.
- Contexto: la longitud maxima de contexto no se especifica, lo que limita la planificacion de cargas con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE.txt del repositorio original por si incluye condiciones adicionales.
- Produccion: al ser una cuantizacion, puede haber una perdida de calidad respecto al modelo original en precision completa, especialmente en IQ2.
- Repositorio: con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de validacion comunitaria de estas cuantizaciones concretas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unslothai/Hy-MT3-30B-A3B-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- GGUF original de Tencent: https://huggingface.co/tencent/Hy-MT3-30B-A3B-GGUF
- Unsloth: https://unsloth.ai/
- Licencia: https://huggingface.co/unslothai/Hy-MT3-30B-A3B-GGUF/blob/main/LICENSE.txt
