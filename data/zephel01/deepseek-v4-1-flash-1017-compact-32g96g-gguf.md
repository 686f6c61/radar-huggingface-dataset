# zephel01/DeepSeek-V4.1-Flash-1017-Compact-32G96G-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Compact-32G96G-GGUF es un repositorio de cuantizaciones GGUF del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, publicado por el usuario zephel01. Se trata de un modelo de arquitectura MoE (Mixture of Experts) orientado a generacion de texto, del que este repositorio prepara versiones comprimidas mediante seleccion de expertos y cuantizacion LDLQ. El objetivo declarado es hacer viable el modelo en un equipo con una GPU de 32 GB de VRAM y 96 GB de RAM, un perfil de hardware de gama alta de consumo.

El repositorio se encuentra en estado de trabajo en curso: no contiene aun ficheros de modelo, solo la descripcion de las variantes planeadas. Se anuncian dos versiones: JA256 (~207 GB), que conserva 256 de los 384 expertos enrutados por capa seleccionados a partir de conteos de enrutamiento en japones, chino, ingles, codigo, matematicas y tool-calls, y Full (~230 GB, planeada), que conserva todos los expertos. La motivacion explicita es corregir el sesgo hacia el chino que el autor observo en la cuantizacion GSQ-RCO Coder de ISTA-DASLab, que responde en chino a prompts en japones.

La relevancia de esta ficha es limitada por el momento: al no existir pesos publicados, las especificaciones tecnicas del modelo base no estan disponibles en la informacion proporcionada y varias filas de la tabla deben marcarse como no disponibles. La licencia es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), 384 expertos enrutados por capa |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LDLQ; GGUF con tabla Engram en IQ4_NL; variantes JA256 y Full |
| Idiomas soportados | no disponible (la seleccion de expertos cubre japones, chino, ingles, codigo, matematicas y tool-calls) |
| Licencia | MIT |
| Formato de pesos | GGUF (aun sin ficheros publicados) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE: cada capa dispone de 384 expertos enrutados, de los que se activa un subconjunto por token segun el enrutador. El repositorio no documenta el numero total de parametros, los parametros activos por token, el volumen de tokens de entrenamiento ni si hubo fases de RLHF o DPO; toda esa informacion debe consultarse en la model card del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, que no forma parte de la informacion proporcionada.

La innovacion tecnica de este repositorio es la poda de expertos guiada por conteos de enrutamiento. En lugar de seleccionar expertos con datos de codigo y agentes (como hace la variante GSQ-RCO Coder de ISTA-DASLab, con 192 de 384 expertos), el autor agrega los conteos de rutas sobre texto en japones, chino, ingles, codigo, matematicas y tool-calls. Segun sus mediciones, una seleccion de 192 expertos basada solo en codigo conserva el 45% de las rutas que toma el texto en japones (frente al 82% en codigo); la variante JA256, con 256 expertos, conserva el 95% de las rutas en japones y el 84% en codigo. Ademas, la tabla Engram se recuantiza a IQ4_NL desde la fuente original en FP8. Las variantes se validan con la herramienta Abyss del propio autor antes de publicarse como BETA.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es de tipo text-generation, segun el pipeline declarado.
- Codigo y matematicas: la seleccion de expertos de la variante JA256 incluye datos de codigo y matematicas, y el autor menciona pruebas con tareas de codificacion dificiles.
- Tool calling / function calling: los conteos de enrutamiento incluyen texto de tool-calls, lo que sugiere soporte en el modelo base; no se detalla el mecanismo.
- Soporte multilingue: la seleccion de expertos cubre japones, chino e ingles de forma explicita; el resto de idiomas no esta documentado.
- Contexto largo: el autor menciona pruebas con prompts largos, aunque no se especifica la longitud de contexto soportada.
- Capacidades de vision: la model card menciona que la seleccion de expertos de la variante Coder de ISTA incluye datos de vision, pero no se confirma que el modelo base tenga capacidad multimodal.
- No se documentan modos de pensamiento (thinking mode), audio ni otras capacidades especiales.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de 32 GB y 96 GB de RAM: el objetivo declarado del repositorio es precisamente encajar el modelo en ese perfil de hardware mediante las variantes JA256 (~207 GB) y Full (~230 GB), que se reparten entre VRAM y memoria del sistema.
- Asistencia de codigo en produccion: la variante JA256 conserva el 84% de las rutas de codigo, practicamente el mismo nivel que la variante Coder de ISTA (82%), por lo que es adecuada para autocompletado y generacion de codigo en pipelines de desarrollo.
- Atencion a usuarios japoneses: la seleccion de expertos preserva el 95% de las rutas del japones, lo que evita el fallo documentado de otras podas que responden en chino a prompts en japones; util para chatbots y asistentes dirigidos al mercado japones.
- Procesamiento de prompts largos: el autor valida las variantes con entradas largas, lo que permite su uso en tareas de resumen y analisis de documentos extensos, siempre que se confirme la ventana de contexto del modelo base.
- Flujos agenticos con tool calling: la inclusion de texto de tool-calls en la seleccion de expertos apunta a un uso en agentes que invocan funciones externas, aunque la validacion practica esta pendiente de publicacion.
- Investigacion sobre poda de MoE: el repositorio documenta una metodologia reproducible (conteos de enrutamiento por idioma y tarea, validacion con Abyss) que resulta util para estudiar el impacto de la seleccion de expertos en el rendimiento multilingue.
- Experimentacion con cuantizacion LDLQ: sirve como referencia para comparar LDLQ frente a otras tecnicas de cuantizacion en modelos MoE de gran tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta porcentajes de retencion de rutas de enrutamiento (95% en japones y 84% en codigo para JA256; 45% en japones y 82% en codigo para una seleccion de 192 expertos basada solo en codigo), que no son metricas de calidad del modelo sino medidas internas de cobertura de expertos.

## Requisitos de hardware

- VRAM estimada: el repositorio esta disenado para una GPU de 32 GB de VRAM combinada con 96 GB de RAM del sistema; las variantes JA256 (~207 GB) y Full (~230 GB) exceden ampliamente la VRAM y requieren offloading a memoria RAM.
- GPU recomendadas: no se especifican modelos concretos; el perfil objetivo es una GPU consumer o profesional de 32 GB (por ejemplo, RTX 5090 o similares de esa clase de memoria), sin confirmacion por parte del autor.
- Cabe en GPU consumer: si, segun el diseno declarado, en tarjetas de 32 GB con apoyo de 96 GB de RAM, aunque no hay ficheros publicados que lo verifiquen.
- Opciones de despliegue: formato GGUF, por lo que es compatible con llama.cpp y derivados como Ollama; el autor menciona su propia herramienta Abyss para la validacion. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Expertos conservados | Tamano | Licencia | Estado |
|---|---|---|---|---|
| zephel01 DeepSeek-V4.1-Flash-1017 Compact JA256 | 256 de 384 | ~207 GB | MIT | Planeado, sin ficheros |
| zephel01 DeepSeek-V4.1-Flash-1017 Compact Full | 384 de 384 | ~230 GB | MIT | Planeado, sin ficheros |
| zephel01 DeepSeek-V4.1-Flash-1017 LDLQ 132G/139G | no disponible | 275,8 / 283,0 GB de descarga | MIT | Publicado |
| ISTA-DASLab DeepSeek-V4.1-Flash-1017 GSQ-RCO Coder | 192 de 384 | 182,7 GB | no disponible | Publicado |

La comparativa se limita a variantes del mismo modelo base; no se dispone de datos de benchmarks que permitan comparar calidad entre ellas.

## Limitaciones y advertencias

- El repositorio no contiene ficheros de modelo: es un anuncio de trabajo en curso y no puede utilizarse todavia.
- La poda de expertos degrada capacidades de forma no uniforme: el propio autor documenta que una seleccion centrada en codigo responde en chino a prompts en japones, y que JA256 conserva el 84% de las rutas de codigo, no el 100%.
- Los porcentajes de retencion de rutas son medidas internas del autor, no benchmarks independientes, y no garantizan la calidad final del modelo.
- Riesgo de alucinacion y sesgos: no documentados para este repositorio; deben evaluarse en el modelo base.
- Idiomas: la seleccion cubre japones, chino e ingles; el rendimiento en castellano y otros idiomas no esta evaluado.
- Licencia MIT: permite uso comercial, pero conviene verificar que las condiciones del modelo base se mantienen en las versiones derivadas.
- El modelo requiere un equipo con 32 GB de VRAM y 96 GB de RAM como minimo segun el diseno, lo que excluye la mayoria de configuraciones consumer.
- La validacion se realiza con la herramienta Abyss del propio autor, lo que introduce un sesgo de autoevaluacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-Compact-32G96G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante LDLQ 132G/139G del mismo autor: https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-LDLQ-32G96G-GGUF
- Variante GSQ-RCO Coder de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF
- Herramienta Abyss: https://github.com/zephel01/Abyss
