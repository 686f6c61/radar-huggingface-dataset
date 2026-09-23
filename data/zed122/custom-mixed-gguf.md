# zed122/custom-mixed-gguf

## Resumen

zed122/custom-mixed-gguf es un artefacto de pesos en formato GGUF publicado en HuggingFace por el usuario zed122. El repositorio ocupa 38,1 GB y el campo de safetensors declara 30.532.122.624 parametros, es decir, unos 30,5 mil millones, lo que lo situa en la clase de modelos de tamano ~30B. Se trata de un tamano que en la practica exige cuantizacion para caber en GPU de consumo y que en precision completa ronda los 61 GB de pesos.

La model card esta practicamente vacia: unicamente incluye la declaracion de licencia apache-2.0. No se identifica el modelo base, ni la arquitectura, ni la longitud de contexto, ni los idiomas soportados, ni el proceso de entrenamiento o alineacion. Las unicas pistas disponibles son las etiquetas del repositorio: gguf, imatrix, conversational, endpoints_compatible y region:us, que apuntan a un artefacto cuantizado con matriz de importancia (imatrix), orientado a uso conversacional y compatible con endpoints de inferencia.

Su interes real es el de caso de estudio sobre empaquetado y distribucion de modelos: no hay benchmarks, no hay evaluaciones y la adopcion es practicamente nula (0 descargas, 1 like). Cualquier uso serio requiere primero identificar el modelo base, verificar su licencia original y comprobar las capacidades reales del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 30.532.122.624 (≈30,5 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el repositorio es GGUF y las etiquetas indican uso de imatrix |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en el repositorio) |
| Formato de pesos | GGUF |
| Tamano del repositorio | 38,1 GB |
| Autor | zed122 |
| Etiquetas | gguf, license:apache-2.0, endpoints_compatible, region:us, imatrix, conversational |
| Descargas / likes | 0 / 1 |
| Fecha de creacion (metadatos) | 2026-09-22 |
| Ultima actualizacion (metadatos) | 2026-09-23 |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo: la model card no menciona si se trata de un transformer denso, un MoE, un modelo hibrido con SSM ni ninguna otra variante. El unico dato estructural solido es el recuento de parametros (30.532.122.624) y el hecho de que el artefacto distribuido esta en formato GGUF, lo que implica que los pesos originales han pasado por un proceso de conversion y cuantizacion. La etiqueta imatrix sugiere que esa cuantizacion se calibro con una matriz de importancia, una tecnica habitual en llama.cpp para mejorar la fidelidad de los niveles de cuantizacion bajos, pero no se documenta ni el corpus de calibracion ni los niveles generados.

Tampoco se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset, ni sobre tecnicas de alineacion como RLHF, DPO o similares. Al no identificarse el modelo base, no es posible rastrear ninguna de estas caracteristicas a partir de la ficha del modelo original. La etiqueta conversational indica unicamente que el artefacto esta pensado para uso de chat, no que exista un ajuste por instrucciones documentado. Cualquier afirmacion sobre la arquitectura o el entrenamiento seria una suposicion no verificable con la informacion disponible.

## Capacidades

- Generacion de texto conversacional: es la unica capacidad sugerida por la etiqueta conversational del repositorio. No se detalla el formato de prompt ni la plantilla de chat embebida en el GGUF.
- Inferencia local: el formato GGUF permite ejecutar el modelo en llama.cpp y en herramientas derivadas, con soporte de offloading parcial a GPU.
- Integracion con endpoints: la etiqueta endpoints_compatible apunta a compatibilidad con endpoints de inferencia tipo HuggingFace, aunque no se especifica la configuracion.
- Razonamiento, matematicas y generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ningun idioma.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponible.

## Casos de uso

- Asistente conversacional en local con requisitos de privacidad: al ser un GGUF de ~30,5B, puede ejecutarse en una estacion de trabajo con una GPU de 24 GB en cuantizaciones de 4 bits y mantener los datos dentro de la organizacion, sin enviar prompts a APIs externas. Requiere verificar antes el contexto real y la plantilla de chat.
- Sustitucion de APIs comerciales en entornos regulados: sectores como salud, legal o banca pueden desplegar el modelo on-premise para tareas de redaccion y resumen interno, siempre que se confirme la licencia del modelo base y no solo la del artefacto GGUF.
- Evaluacion comparativa interna de cuantizaciones: el repositorio es util como banco de pruebas para medir el impacto de imatrix y de distintos niveles de cuantizacion (Q4_K_M frente a Q5_K_M o Q6_K) sobre la calidad de las respuestas en un modelo de ~30B.
- Prototipado offline en portatiles o equipos sin conexion: con cuantizaciones de 3-4 bits puede ejecutarse en Ollama o LM Studio en Apple Silicon con memoria unificada de 32 GB o mas, lo que sirve para demos y pruebas de concepto desconectadas.
- Generacion asistida de documentacion tecnica interna: uso como motor de redaccion y reformulacion sobre corpus propios, con la advertencia de que el contexto maximo es desconocido y debe medirse empíricamente antes de disenar el pipeline.
- Nodo de inferencia autoalojado en un pipeline de CI/CD o backend interno: desplegado con llama.cpp o vLLM en un servidor con A100 40 GB, puede atender peticiones de un chatbot corporativo o de un sistema de tickets, con la latencia y el throughput pendientes de medir en el hardware objetivo.
- Base para experimentos de ajuste de plantillas y prompts: al carecer de documentacion, es un candidato razonable para auditar como el chat template embebido en el GGUF afecta al comportamiento del modelo antes de integrarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y la busqueda web realizada no ha devuelto documentacion tecnica asociada al modelo (unicamente paginas de soporte de Microsoft sin relacion).

Tampoco hay mediciones de latencia, throughput ni consumo de memoria publicadas por el autor.

## Requisitos de hardware

Estimaciones de VRAM basadas en el recuento de parametros declarado (30,5B) y en los tamanos tipicos de GGUF; los tamanos exactos dependen de los ficheros incluidos en el repositorio, que no se detallan.

| Cuantizacion | Peso aproximado | VRAM practica con contexto moderado |
|---|---|---|
| F16 / BF16 | ~61 GB | 80 GB (H100 o A100 80 GB) o multi-GPU |
| Q8_0 | ~32 GB | 40-48 GB |
| Q6_K | ~25 GB | 32-40 GB |
| Q5_K_M | ~22 GB | 24-32 GB |
| Q4_K_M | ~19 GB | 24 GB |
| Q3_K_M | ~15 GB | 16-20 GB, con parte del KV cache en RAM |
| Q2_K | ~11 GB | 12-16 GB |

- Cabe en GPU de consumo: si, en el rango de 3 a 4 bits. Una RTX 4090, RTX 3090 o RTX 4080 de 16 GB puede ejecutar Q4_K_M completo o Q3_K_M con margen; con 16 GB conviene Q3_K_M o Q4 con offloading parcial.
- Multi-GPU: dos RTX 4090 (48 GB) permiten Q6_K o Q8_0 con contexto amplio; un A100 80 GB permite Q8_0 o precision completa parcial.
- Apple Silicon: Mac con 32 GB de memoria unificada para Q4_K_M y con 64 GB para Q5_K_M o Q6_K.
- El KV cache anade varios GB adicionales segun la longitud de contexto y el numero de cabezas KV; con contextos largos la VRAM necesaria crece por encima de las cifras de la tabla.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp, llama-cpp-python), vLLM con soporte GGUF experimental y HuggingFace TGI con soporte GGUF limitado. El tag endpoints_compatible sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput: no disponible. No hay mediciones publicadas y, al desconocerse la arquitectura y si existe o no un esquema MoE con parametros activos reducidos, no es posible estimarlos de forma fiable.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa: al no identificarse el modelo base ni la arquitectura, no hay terminos de comparacion fiables con alternativas de la misma clase de tamano.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| zed122/custom-mixed-gguf | 30,5B (declarados) | no disponible | apache-2.0 declarada en el repositorio | GGUF | no disponible |
| Alternativas de la clase ~27-34B (por ejemplo, modelos densos de ese rango) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

Criterio recomendado: identificar primero el modelo base del GGUF y, a partir de ahi, comparar contra modelos de la misma clase de tamano y misma tarea (chat generalista) verificando parametros, contexto, licencia y formato en las fichas oficiales de cada alternativa.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre modelo base, arquitectura, datos de entrenamiento, tokenizer, plantilla de chat ni instrucciones de uso. Es el caveat mas importante para cualquier evaluacion.
- Riesgo de licencia: la licencia apache-2.0 declarada corresponde al artefacto GGUF, pero una cuantizacion es una obra derivada y la licencia del modelo original puede ser distinta y mas restrictiva. Debe verificarse antes de cualquier uso comercial.
- Sin benchmarks ni evaluaciones: no hay ninguna evidencia publicada de calidad, razonamiento, codigo o multilingue.
- Sin validacion de la comunidad: 0 descargas y 1 like implican que el artefacto no ha sido probado ni auditado por terceros. Existe riesgo de cuantizacion defectuosa, ficheros incompletos o configuracion incorrecta.
- Reproducibilidad limitada de la cuantizacion: no se documenta la matriz de importancia (imatrix) empleada ni el corpus de calibracion.
- Contexto e idiomas desconocidos: no se puede disenar un sistema que dependa de ventanas largas o de cobertura multilingue sin medirlo antes.
- Sesgos y alucinacion: no evaluados ni documentados. Al desconocerse el corpus de entrenamiento, no es posible anticipar sesgos de genero, idioma, cultura o dominio.
- Trazabilidad de los metadatos: la fecha de creacion indicada (2026-09-22) resulta anomala y conviene verificarla antes de citar el repositorio.
- Sin garantia de mantenimiento: el repositorio no incluye documentacion de versionado ni de cambios posteriores.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zed122/custom-mixed-gguf
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados obtenidos correspondian a paginas de soporte de Microsoft sin relacion con el modelo.
