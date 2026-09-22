# Yoram-Jacobs/Eyes-Clean

## Resumen

Eyes-Clean es un modelo de lenguaje publicado por el usuario Yoram-Jacobs en Hugging Face bajo licencia MIT. Se distribuye únicamente en formato GGUF, lo que indica que está pensado para inferencia local mediante herramientas compatibles con este formato (llama.cpp, Ollama, LM Studio y similares) más que para entrenamiento o ajuste fino a partir de los pesos publicados. El repositorio ocupa 4,4 GB y el recuento de parámetros declarado en los metadatos de safetensors es de 4.647.450.147, es decir, aproximadamente 4,65 mil millones de parámetros.

La información pública disponible es extremadamente limitada. La model card se reduce a la declaración de licencia MIT y no incluye descripción, arquitectura, datos de entrenamiento, idiomas ni resultados de evaluación. Tampoco hay pipeline declarado, ni resultados de benchmarks, ni documentación adicional en el repositorio. La búsqueda web realizada no ha devuelto ninguna fuente relacionada con este modelo: los resultados obtenidos corresponden a entidades homónimas sin relación (asociaciones y normativas suizas y austríacas).

Por tanto, esta ficha recoge exclusivamente los datos verificables de los metadatos de Hugging Face y marca de forma explícita como "no disponible" todo aquello que el autor no ha publicado. Cualquier evaluación de calidad, sesgos o capacidades reales requiere una prueba directa del modelo, ya que no existe documentación de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica arquitectura; el formato de publicacion es GGUF) |
| Parametros totales | 4.647.450.147 (aproximadamente 4,65 mil millones), segun metadatos de safetensors |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se distribuye en formato GGUF, pero la model card no detalla los niveles de cuantizacion incluidos |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (tamano del repositorio: 4,4 GB) |

Otros metadatos declarados: tags `gguf`, `license:mit`, `endpoints_compatible`, `region:us`, `conversational`. Fecha de creacion y de ultima actualizacion registradas: 2026-09-22. Descargas y likes en el momento de la consulta: 0.

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer decoder-only, un modelo MoE, una arquitectura hibrida con space-state models ni ninguna otra variante. Tampoco se especifica el numero de capas, la dimension del modelo, el tipo de atencion ni si emplea tecnicas como atencion lineal o decodificacion especulativa.

Del mismo modo, no se han publicado datos sobre el proceso de entrenamiento: no se indica el numero de tokens utilizados, la composicion del dataset, si hubo fases de ajuste supervisado, RLHF o DPO, ni si el modelo es un ajuste fino de una base existente. El unico dato tecnico verificable es el recuento de parametros (4.647.450.147) y el formato de distribucion (GGUF). El tag `conversational` sugiere que la plantilla o el ajuste esta orientado a dialogo, pero no hay confirmacion documental de ello.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio apunta a un uso orientado a dialogo, aunque no hay documentacion que detalle el comportamiento.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el modelo puede servirse a traves de la infraestructura de Inference Endpoints de Hugging Face.
- Inferencia local en CPU y GPU: al distribuirse en GGUF, es ejecutable con llama.cpp y herramientas derivadas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible, no se declara ningun idioma.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

No se debe asumir ninguna capacidad adicional a partir del nombre del modelo ni de sus tags, dado que no existe documentacion de respaldo.

## Casos de uso

Los siguientes escenarios son planteamientos genericos y condicionados a que el modelo supere una evaluacion previa, ya que no hay datos publicados de rendimiento:

- Prototipado de asistentes conversacionales locales: al estar en GGUF y con licencia MIT, se puede desplegar en una estacion de trabajo sin GPU dedicada para validar flujos de dialogo antes de invertir en un modelo mayor.
- Pruebas de concepto en entornos con requisitos de privacidad: la inferencia local evita enviar datos a APIs externas, lo que encaja en escenarios con datos sensibles donde no se permite salida a Internet.
- Evaluacion comparativa interna: sirve como punto de partida para medir, con un conjunto de pruebas propio, si un modelo de ~4,65 B en cuantizacion GGUF cubre las necesidades de una aplicacion concreta.
- Generacion de texto auxiliar en herramientas de escritorio: integracion en editores o utilidades ofimaticas mediante un servidor local compatible con la API de OpenAI (Ollama, llama.cpp server).
- Experimentacion academica con modelos pequenos: util para reproducir experimentos de cuantizacion y medir el impacto de la precision en tareas de generacion, dado el reducido tamano del repositorio (4,4 GB).
- Base para ajuste fino propio: la licencia MIT permite derivados y uso comercial, de modo que el modelo puede servir como punto de partida si el desarrollador quiere adaptarlo a un dominio especifico, siempre que el formato GGUF se convierta previamente.

No se recomienda su uso en produccion critica sin antes realizar una evaluacion de calidad, sesgos y alucinacion, porque no existe ninguna documentacion tecnica que respalde su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, y la busqueda web no ha devuelto ningun articulo, informe o repositorio con mediciones independientes de este modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parametros (4,65 B) y deben tratarse como orientativas, no como datos publicados por el autor:

- VRAM estimada en cuantizacion de 4 bits: en torno a 3-3,5 GB de pesos, mas el consumo del contexto y del runtime (habitualmente 1-2 GB adicionales segun la longitud de contexto).
- VRAM estimada en cuantizacion de 8 bits: en torno a 5 GB de pesos.
- VRAM estimada en precision completa (FP16): aproximadamente 9,3 GB solo en pesos.
- GPU consumer: cabe con holgura en tarjetas con 8 GB o mas de VRAM (RTX 3060, 3070, 4060, 4070, 4080) usando cuantizacion de 4 bits; con 6 GB puede funcionar en cuantizaciones agresivas y contextos cortos. En CPU, la ejecucion es viable con llama.cpp si se dispone de RAM suficiente.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias para un modelo de este tamano; permitirian servir multiples instancias o contextos muy largos en una sola tarjeta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con la API de OpenAI. vLLM y TGI no son la via natural para pesos GGUF (vLLM solo ofrece soporte GGUF experimental y limitado); para usarlos habria que convertir los pesos a safetensors.
- Latencia y throughput: no disponible, no se han publicado mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo analizado, por lo que la comparacion se limita a caracteristicas objetivas. Los modelos alternativos se incluyen por rango de parametros y disponibilidad en GGUF.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Yoram-Jacobs/Eyes-Clean | 4,65 B | no disponible | MIT | GGUF | Sin model card ni benchmarks publicados |
| Llama 3.2 3B Instruct | 3,2 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Documentacion completa y evaluaciones publicas |
| Qwen2.5 3B Instruct | 3,1 B | 32 K | Apache 2.0 (segun variante) | safetensors, GGUF | Buen soporte multilingue declarado |
| Phi-3.5-mini Instruct | 3,8 B | 128 K | MIT | safetensors, GGUF | Enfocado a razonamiento y codigo |

La comparacion de calidad no es posible: no existe ningun resultado de evaluacion de Eyes-Clean que permita situarlo frente a estas alternativas. La licencia MIT es, en cambio, mas permisiva que la de Llama 3.2 y equiparable a la de Phi-3.5-mini.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card solo contiene la licencia, sin descripcion, arquitectura, datos de entrenamiento ni instrucciones de uso. Esto impide conocer el comportamiento esperado.
- Idiomas desconocidos: no se declara ningun idioma soportado, por lo que no se puede asumir un rendimiento correcto en castellano ni en ninguna otra lengua.
- Contexto desconocido: se ignora la longitud maxima de contexto, dato critico para planificar despliegues con conversaciones largas o documentos extensos.
- Cuantizaciones no especificadas: se desconoce que niveles de cuantizacion incluye el repositorio y con que perdida de calidad.
- Sesgos y alucinacion: no existe ninguna evaluacion publicada de sesgos, toxicidad o tendencia a la alucinacion. Al ser un modelo sin documentacion, el riesgo de comportamiento impredecible es alto.
- Trazabilidad nula: no se indica el modelo base ni la procedencia de los datos, lo que dificulta auditar el cumplimiento normativo en entornos regulados.
- Licencia: MIT permite uso comercial, modificacion y redistribucion, con la unica obligacion habitual de conservar el aviso de copyright. No obstante, la licencia del modelo no cubre posibles reclamaciones sobre los datos de entrenamiento, que se desconocen.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de mantenimiento ni de comunidad. Las fechas registradas (2026-09-22) son las unicas referencias temporales disponibles.
- Recomendacion: tratar el modelo como experimental y validarlo con un conjunto de pruebas propio antes de cualquier uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yoram-Jacobs/Eyes-Clean
- Paper: no disponible
- Blog o documentacion del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible

La busqueda web realizada no ha devuelto ninguna fuente relacionada con este modelo; los resultados obtenidos corresponden a entidades homonimas sin vinculacion con el proyecto.
