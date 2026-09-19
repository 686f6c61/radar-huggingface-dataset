# Yoedi/foq-reflex-8b-gguf

## Resumen

Foq Reflex 8B es un modelo de pesos abiertos publicado por el usuario Yoedi en HuggingFace, distribuido exclusivamente en formato GGUF con una cuantizacion ternaria PQ2_0 de 2,13 bits por peso (bpw) que ocupa 2,2 GB en disco. Se presenta como el "modelo reflex de referencia" del motor de decision Foq (foq.fr), descrito por su autor como un motor de arbitraje 100 % local con enfoque System 1 para agentes de IA, es decir, una capa de decision rapida y de baja latencia que resuelve o enruta peticiones antes de invocar a un modelo de razonamiento mayor.

El modelo se distribuye junto a un adaptador LoRA opcional de 61 MB (`foq_decision_8b.gguf`) orientado a especializacion en decision. La model card reporta 150/150 aciertos en un examen de produccion de 150 casos (negocio, trampas cognitivas, contenido sensible y casos nuevos no vistos) usando dicho adaptador, con una latencia P50 de 26 ms en una GPU de consumo. El adaptador aporta, segun el autor, +10,7 puntos en una prueba ciega.

La relevancia del proyecto reside en su propuesta de despliegue ultraligero: funciona en cualquier GPU con 4 GB de VRAM, en Apple Silicon o en CPU x86/ARM mediante `llama-server` de llama.cpp, con cuatro slots concurrentes y Flash Attention activado. La licencia es Apache 2.0, aunque el modelo deriva de familias de pesos abiertos con licencia Apache-2.0 cuyos avisos se remiten a los metadatos del GGUF y a un fichero `THIRD-PARTY-LICENSES.md` del repositorio, no incluido en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica transformer, MoE ni hibrida; se describe funcionalmente como motor de decision System 1) |
| Parametros totales | Dato contradictorio: el repo declara 15.335.424 parametros en safetensors, mientras que la model card usa la denominacion "8B". El tamano del repo (2,2 GB a 2,13 bpw) es coherente con aproximadamente 8.000 millones de parametros |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF ternario PQ2_0, 2,13 bpw (unica cuantizacion publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (derivado de familias de pesos abiertos Apache-2.0; avisos en metadatos GGUF y en THIRD-PARTY-LICENSES.md) |
| Formato de pesos | GGUF (modelo principal, 2,2 GB) y adaptador LoRA GGUF opcional de 61 MB |
| Runtime declarado | llama.cpp (`llama-server`), 4 slots concurrentes, Flash Attention |
| Fecha de creacion en HuggingFace | 2026-09-19 |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo: no se especifica si es un transformer denso, un MoE, un modelo de estado espacial o una arquitectura hibrida, ni se indica el numero de capas, dimensiones de atencion o tamano de vocabulario. Lo unico confirmado es el formato de serializacion (GGUF) y la cuantizacion ternaria PQ2_0 a 2,13 bpw, una tecnica de compresion agresiva que reduce el peso por parametro muy por debajo de los 4 bits tipicos de Q4_K_M, a costa de una perdida de precision que el autor compensa con un adaptador LoRA de especializacion.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. La unica informacion sobre entrenamiento o ajuste es la existencia del adaptador `foq_decision_8b.gguf`, descrito como una especializacion en decision que mejora en 10,7 puntos el rendimiento en una prueba ciega. El autor menciona que el modelo deriva de familias de pesos abiertos con licencia Apache-2.0, pero no identifica cuales, lo que impide reconstruir la trazabilidad completa del entrenamiento.

Como innovacion destacable, la model card subraya el enfoque "System 1": un motor de arbitraje local pensado para resolver decisiones de forma casi instantanea (P50 de 26 ms) en lugar de generar cadenas de razonamiento largas. El despliegue se articula mediante `pip install foq` y `foq setup`, que descarga el modelo con verificacion SHA-256, detecta `llama-server` e instala opcionalmente el adaptador de decision.

## Capacidades

- Generacion de texto y toma de decisiones de arbitraje: el modelo esta orientado a resolver o enrutar peticiones dentro de un agente de IA, no a generacion creativa de proposito general.
- Especializacion en decision mediante adaptador LoRA opcional, con una mejora declarada de +10,7 puntos en una prueba ciega y 150/150 en el examen de produccion de 150 casos al aplicarlo.
- Cobertura declarada de dominios concretos en el examen de produccion: casos de negocio, trampas cognitivas, contenido sensible y casos nuevos no vistos.
- Inferencia concurrente: soporte de 4 slots simultaneos en `llama-server`.
- Despliegue local: ejecucion en GPU de 4 GB de VRAM, Apple Silicon o CPU x86/ARM, sin dependencia de servicios en la nube.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible; el modelo se posiciona como una capa System 1 dentro de un agente, pero no se documenta su integracion con planificacion multi-paso.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision, audio o modo "thinking" explicito: no disponible.

## Casos de uso

- Arbitraje previo a un LLM mayor: actuar como primera capa que clasifica y resuelve peticiones simples o rutinarias antes de invocar un modelo de razonamiento costoso, reduciendo el gasto de tokens y la latencia global del agente. Su P50 de 26 ms lo hace adecuado para este papel de filtro.
- Enrutamiento de intenciones en agentes conversacionales: determinar a que herramienta, modelo o flujo debe dirigirse cada mensaje entrante, aprovechando los cuatro slots concurrentes de `llama-server` para atender varias conversaciones en paralelo.
- Moderacion de contenido sensible: el examen de produccion del autor incluye casos de contenido sensible, por lo que el modelo puede emplearse como clasificador local de peticiones que requieran revision o rechazo antes de llegar al modelo principal.
- Guardarraíl de trampas cognitivas: deteccion de patrones de prompt sospechosos (inyeccion de instrucciones, sesgos de encuadre) en una capa previa, manteniendo los datos dentro de la infraestructura propia.
- Asistente local en equipos sin GPU dedicada: al ejecutarse en CPU x86/ARM o Apple Silicon con solo 2,2 GB de pesos, es viable en portatiles, mini-PC o dispositivos edge donde no cabe un modelo de 8B en precision completa.
- Automatizacion de decisiones de negocio de baja latencia: triaje de solicitudes, priorizacion de tickets o validacion de reglas de negocio en pipelines que requieren respuestas por debajo de 50 ms.
- Componente de CI/CD para validacion de agentes: usar la version de referencia y su examen de 150 casos como suite de regresion al cambiar prompts, herramientas o adaptadores de un agente en produccion.
- Despliegue en entornos con requisitos de soberania de datos: al no requerir conexion externa, encaja en escenarios sanitarios, legales o industriales donde la inferencia debe permanecer on-premise.

## Benchmarks y rendimiento

| Prueba | Resultado | Condiciones |
|---|---|---|
| Examen de produccion (150 casos: negocio, trampas cognitivas, contenido sensible, casos nuevos) | 150/150 (100 %) | Con el adaptador LoRA de decision activado |
| Examen de produccion sin adaptador | no disponible | No se publica la puntuacion base |
| Prueba ciega | +10,7 puntos con el adaptador | No se detalla el tamano de la prueba ni la puntuacion absoluta |
| Latencia P50 | 26 ms | GPU de consumo, sin especificar modelo exacto |
| MMLU, HumanEval, GSM8K, BBH u otros benchmarks estandar | no disponible | No se han publicado resultados en la informacion disponible |

Los unicos datos de rendimiento proceden de la propia model card y de la metodologia enlazada en GitHub. No hay verificacion independiente ni resultados frente a benchmarks academicos estandar, por lo que las cifras deben tratarse como autoevaluacion del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 4 GB es el minimo declarado; el peso del modelo es de 2,2 GB, por lo que el resto corresponde a cache KV y buffers de contexto, cuyo tamano exacto depende de la longitud de contexto (no publicada).
- GPU recomendadas: cualquier GPU con 4 GB de VRAM o mas. El autor no especifica modelos concretos; no hay datos confirmados para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: si, es uno de los supuestos de diseno del modelo (4 GB de VRAM). Cabe en tarjetas de gama de entrada y media.
- CPU y Apple Silicon: soportado explicitamente en x86 y ARM, asi como en Apple Silicon, sin GPU dedicada.
- Opciones de despliegue: llama.cpp mediante `llama-server` (runtime declarado, con 4 slots concurrentes y Flash Attention). El paquete `foq` (`pip install foq`, `foq setup`) automatiza la descarga verificada por SHA-256 y la instalacion opcional del adaptador. Soporte de vLLM, TGI, Ollama u otros servidores: no disponible.
- Latencia y throughput: P50 de 26 ms en GPU de consumo segun el autor. No se publican cifras de throughput en tokens por segundo ni latencias P95 o P99.

## Comparativa con modelos similares

No disponible. La model card no identifica las familias de pesos abiertos sobre las que se construye el modelo ("derived from Apache-2.0 open-weight families"), ni publica contexto, numero de parametros verificable o resultados en benchmarks estandar, lo que impide una comparacion rigurosa con alternativas de su misma categoria (modelos de 7-8B en GGUF para agentes, o clasificadores de enrutamiento ligeros). Cualquier tabla comparativa que se elaborase requeriria datos que no figuran en la informacion proporcionada.

## Limitaciones y advertencias

- Trazabilidad incompleta: no se identifica el modelo base ni la composicion del dataset de entrenamiento, lo que dificulta evaluar procedencia, sesgos y cumplimiento de licencias de terceros.
- Contradiccion en el recuento de parametros: el repositorio declara 15.335.424 parametros en safetensors mientras la model card usa la etiqueta "8B". El autor no aclara la discrepancia; conviene verificar el contenido real del repositorio antes de planificar el despliegue.
- Ausencia de validacion independiente: 0 descargas y 1 like en el momento de la consulta. Los resultados (150/150 y +10,7 puntos) proceden unicamente del autor y se evaluan sobre un conjunto definido por el propio autor.
- Riesgo de alucinacion: no cuantificado. No se publican tasas de error, pruebas de fidelidad ni evaluaciones de robustez frente a entradas adversarias.
- Idiomas no declarados: no se especifica que lenguas soporta, por lo que su uso en castellano u otros idiomas distintos del ingles no esta garantizado.
- Longitud de contexto no publicada: sin este dato no puede dimensionarse la memoria de cache KV ni disenarse correctamente conversaciones multi-turno largas.
- Ambito funcional estrecho: el modelo esta disenado como motor de arbitraje System 1, no como modelo de proposito general; usarlo para generacion abierta, codigo o matematicas queda fuera de su alcance declarado.
- Restricciones de licencia: el modelo se publica bajo Apache 2.0, pero al derivar de pesos de terceros, los avisos aplicables estan en los metadatos del GGUF y en `THIRD-PARTY-LICENSES.md`. Es imprescindible revisar ese fichero antes de un uso comercial.
- Anomalia en metadatos: la fecha de creacion registrada (2026-09-19) es posterior a la fecha actual, lo que sugiere un error de metadatos o de reloj en la publicacion; conviene contrastarlo con el repositorio Git.
- Dependencia del ecosistema Foq: la instalacion recomendada pasa por el paquete `foq` y por `llama-server`; no se documentan integraciones alternativas ni soporte para servidores de inferencia habituales en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yoedi/foq-reflex-8b-gguf
- Repositorio del proyecto Foq (metodologia y datos del examen de produccion): https://github.com/yohanargentina-oss/Foq
- Sitio del motor de decision Foq: https://foq.fr
- Paper o publicacion tecnica: no disponible
- Demo o espacio interactivo: no disponible
- Otros recursos encontrados en la busqueda web: ninguno relevante (los resultados devueltos no guardan relacion con el modelo)
