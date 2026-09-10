# xs7david/mistralai-Mistral-Nemo-Instruct-2407-extensive-BP-abliteration-12B-Q2_K-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF en formato Q2_K del modelo `grimjim/mistralai-Mistral-Nemo-Instruct-2407-extensive-BP-abliteration-12B`, un derivado "abliterado" de Mistral-Nemo-Instruct-2407. La conversión la ha realizado el usuario `xs7david` mediante el espacio GGUF-my-repo de ggml.ai y la herramienta llama.cpp. El resultado es un único archivo de pesos de muy baja precisión (Q2_K) pensado para inferencia local en hardware modesto, con un tamano de repositorio de 4,8 GB frente a los aproximadamente 24 GB que ocuparía el modelo en bf16.

El modelo subyacente es un transformer decoder-only de 12.247.782.400 parametros (12,25B), desarrollado originalmente por Mistral AI en colaboracion con NVIDIA como Mistral-Nemo-Instruct-2407. Sobre esa base, el autor `grimjim` aplico una "abliteracion" extensiva (BP), una tecnica de modificacion de pesos orientada a eliminar las direcciones de activacion asociadas al rechazo de peticiones, lo que da como resultado un modelo con menos restricciones de alineamiento de seguridad que el original.

La relevancia de esta ficha es doble: por un lado, documenta una via de despliegue extremadamente economica (Q2_K, ~4,8 GB) para un modelo de 12B con soporte multilingue en nueve idiomas; por otro, advierte de que la combinacion de abliteracion y cuantizacion agresiva produce un artefacto con comportamientos degradados y sin garantias de seguridad, adecuado para experimentacion e investigacion, no para produccion sensible. El repositorio no tiene descargas ni likes registrados y no publica benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral-Nemo); configuracion de capas no detallada en la informacion disponible |
| Parametros totales | 12.247.782.400 (12,25B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base Mistral-Nemo-Instruct-2407; no confirmado en la model card de este repositorio. Los ejemplos de la model card usan `-c 2048` |
| Tipos de cuantizacion | Q2_K (unico archivo publicado en este repositorio) |
| Idiomas soportados | Ingles, frances, aleman, espanol, italiano, portugues, ruso, chino y japones |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original esta en safetensors |
| Tamano del repositorio | 4,8 GB |
| Biblioteca declarada | transformers (etiqueta); uso real via llama.cpp / llama-cpp |
| Modelo base | grimjim/mistralai-Mistral-Nemo-Instruct-2407-extensive-BP-abliteration-12B |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura es la de Mistral-Nemo-Instruct-2407: un transformer decoder-only denso de 12,25B parametros, disenado por Mistral AI y NVIDIA para contexto largo y multilingue. La informacion proporcionada no detalla el numero de capas, dimensiones ocultas, cabezas de atencion ni el vocabulario del tokenizer, por lo que esos datos se marcan como no disponibles. Tampoco se especifica el numero de tokens de preentrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO sobre la version instruct original.

Sobre ese modelo, `grimjim` aplico una abliteracion etiquetada como "extensive-BP", una modificacion de pesos que persigue suprimir la direccion de activacion responsable de las negativas del modelo. La model card de este repositorio no documenta la metodologia exacta (numero de direcciones eliminadas, capas afectadas, dataset de calibracion ni metricas de degradacion asociadas), de modo que el unico dato verificable es la denominacion del modelo base. Posteriormente, `xs7david` convirtio el resultado a GGUF con cuantizacion Q2_K mediante llama.cpp, sin ningun ajuste adicional documentado.

Conviene subrayar que la innovacion tecnica aqui no es arquitectonica sino de empaquetado: se trata de un artefacto de distribucion (GGUF Q2_K) que permite ejecutar un 12B en equipos con menos de 6 GB de VRAM o incluso en CPU. No hay decodificacion especulativa, atencion lineal ni mecanicas de razonamiento extendido documentadas en este repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat instruct heredada de Mistral-Nemo-Instruct-2407.
- Generacion y explicacion de codigo en lenguajes habituales, aunque con la degradacion esperable de Q2_K.
- Razonamiento basico y matematicas elementales; no hay evidencia publicada de rendimiento en tareas complejas con esta cuantizacion.
- Capacidades multilingues en ingles, frances, aleman, espanol, italiano, portugues, ruso, chino y japones.
- Redaccion, resumen, reescritura y traduccion entre los idiomas soportados.
- Soporte de contexto largo si se configura con el tokenizer y la ventana del modelo base (no verificado en este artefacto).
- Ausencia deliberada de mecanismos de rechazo: la abliteracion elimina parte de las negativas del modelo, lo que se traduce en respuestas mas directas ante peticiones que el original rechazaria.
- No se documenta soporte nativo de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Inferencia local en equipos sin GPU dedicada: con 4,8 GB de pesos, el modelo cabe en RAM de systemas de 8 GB y puede ejecutarse con `llama-cli` o `llama-server`, lo que permite prototipar asistentes conversacionales en portatiles de gama media o en mini-PC.
- Procesamiento de documentos sensibles en local: al ejecutarse completamente offline, es apto para resumir contratos, informes o historiales que no deben salir de la red corporativa.
- Traduccion y localizacion multilingue: cubre nueve idiomas, incluyendo pares poco frecuentes como espanol-japones o ruso-portugues, util para pre-traducir contenidos antes de revision humana.
- Generacion de codigo en entornos aislados: se puede integrar en editores locales mediante el servidor compatible con la API de llama.cpp, con la advertencia de que Q2_K incrementa la tasa de errores sintacticos frente a cuantizaciones mayores.
- Investigacion sobre abliteration y seguridad de modelos: sirve como material de estudio para medir hasta que punto la eliminacion de direcciones de rechazo afecta a la coherencia y a las tasas de respuesta ante peticiones problematicas, comparando con el modelo base sin ablacionar.
- Red-teaming y evaluacion de riesgos: permite generar respuestas sin filtros para calibrar clasificadores de contenido o probar sistemas de moderacion en un entorno controlado y con datos sinteticos.
- Experimentacion docente: util para ilustrar en clase el impacto de la cuantizacion en la calidad de un LLM, ejecutando el mismo prompt en Q2_K y en una cuantizacion de mayor precision.
- Generacion creativa y roleplay: el modelo abliterado evita las negativas sistematicas en narrativa de ficcion con tematicas adultas, un caso frecuente en comunidades de escritura asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ningun otro conjunto de evaluacion, ni para el modelo base abliterado ni para la version Q2_K. Tampoco se documentan mediciones de latencia o throughput.

Como referencia cualitativa, la cuantizacion Q2_K es una de las mas agresivas del espectro GGUF y tipicamente introduce perdidas notables de coherencia, repeticiones y errores factuales en modelos de este tamano. No se dispone de mediciones concretas en esta informacion, por lo que la afirmacion debe tratarse como expectativa general y no como dato verificado.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 4,5-5 GB solo para los pesos en Q2_K; con contexto de 4.000-8.000 tokens y cache KV se situa aproximadamente entre 5,5 y 7 GB.
- CPU: la inferencia es viable en CPU gracias al formato GGUF, con 12-16 GB de RAM recomendados si se quiere margen para contexto y sistema operativo.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 3080 10 GB y tarjetas con 8 GB (estas ultimas con contexto reducido). Tambien funciona en Apple Silicon con memoria unificada de 16 GB o mas.
- GPU de datacenter: A100, H100, L40S y A10 quedan sobradamente dimensionadas para este artefacto; su uso solo se justifica si se sirven muchas peticiones concurrentes.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama importando el GGUF, LM Studio, KoboldCpp y text-generation-webui. vLLM solo soporta GGUF de forma experimental y TGI no esta orientado a este formato, por lo que lo recomendable es el ecosistema llama.cpp.
- Latencia y throughput: no disponibles. Como orientacion general, Q2_K reduce el ancho de banda de memoria necesario y suele ser la opcion mas rapida por token en hardware limitado, a costa de calidad.
- Nota practica: la model card recomienda `-c 2048` en los ejemplos, un contexto muy inferior a los 128.000 tokens del modelo base; ampliarlo exige verificar que la configuracion GGUF incluye RoPE scaling adecuado.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| xs7david/...-abliteration-12B-Q2_K-GGUF (este) | 12,25B | GGUF Q2_K | 128k en el modelo base, no verificado en este artefacto | Apache 2.0 | HuggingFace, 0 descargas | Cuantizacion minima, sin benchmarks, abliterado |
| grimjim/mistralai-Mistral-Nemo-Instruct-2407-extensive-BP-abliteration-12B | 12,25B | safetensors (bf16) | 128k segun modelo base | Apache 2.0 | HuggingFace | Modelo origen de esta conversion; ocupa ~24 GB |
| mradermacher/mistralai-...-abliteration-12B-GGUF | 12,25B | GGUF (multiples cuantizaciones) | 128k segun modelo base | Apache 2.0 | HuggingFace; incluye variantes i1 con imatrix | Alternativa recomendable si se busca mejor relacion calidad/tamano |
| mistralai/Mistral-Nemo-Instruct-2407 | 12,25B | safetensors | 128k | Apache 2.0 | HuggingFace | Modelo original con alineamiento de seguridad intacto; referencia para comparar el efecto de la abliteracion |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de rendimiento entre estas variantes.

## Limitaciones y advertencias

- La abliteracion elimina parte de los mecanismos de rechazo del modelo original: cabe esperar respuestas a peticiones que Mistral-Nemo-Instruct-2407 habria declinado, incluidas instrucciones potencialmente daninas. No es apto para aplicaciones orientadas al publico sin una capa de moderacion externa.
- La cuantizacion Q2_K es la mas agresiva del catalogo GGUF habitual: degrada la coherencia, aumenta las repeticiones y eleva la tasa de errores factuales y sintacticos respecto a Q4_K_M, Q5_K_M o Q8_0.
- No hay benchmarks publicados ni evaluaciones independientes de este artefacto concreto, por lo que cualquier afirmacion de rendimiento seria especulativa.
- Riesgo de alucinacion elevado, agravado por la baja precision de los pesos: no debe usarse como fuente de verdad en dominios medicos, legales o financieros sin verificacion humana.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad; no hay informes de terceros sobre su comportamiento.
- Solo se publica una cuantizacion (Q2_K). Si se necesita mayor calidad, hay que acudir al modelo base en safetensors o a los GGUF de `mradermacher`, incluidos los cuantizados con imatrix.
- La licencia Apache 2.0 permite uso comercial, pero no exime al desplegador de responsabilidad legal sobre el contenido generado ni sobre el cumplimiento normativo aplicable (por ejemplo, en la UE, obligaciones de transparencia para sistemas de IA).
- La cobertura multilingue esta declarada por el modelo base; no hay evaluacion especifica de calidad por idioma en esta cuantizacion, y los idiomas fuera de la lista de nueve no estan soportados de forma fiable.
- El contexto efectivo depende de la configuracion de llama.cpp; los ejemplos de la model card usan 2.048 tokens, muy lejos de los 128.000 del modelo base, y forzar ventanas grandes con Q2_K puede degradar aun mas la calidad.
- El identificador de archivo y la fecha de creacion (2026-09-10) corresponden a un artefacto reciente y poco rodado; conviene validar el hash y el comportamiento antes de integrarlo en cualquier flujo automatizado.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/xs7david/mistralai-Mistral-Nemo-Instruct-2407-extensive-BP-abliteration-12B-Q2_K-GGUF
- Modelo base abliterado (grimjim): https://huggingface.co/grimjim/mistralai-Mistral-Nemo-Instruct-2407-extensive-BP-abliteration-12B
- Cuantizaciones GGUF alternativas de mradermacher: https://huggingface.co/mradermacher/mistralai-Mistral-Nemo-Instruct-2407-extensive-BP-abliteration-12B-GGUF
- Variantes con imatrix (i1-GGUF): https://huggingface.co/mradermacher/mistralai-Mistral-Nemo-Instruct-2407-extensive-BP-abliteration-12B-i1-GGUF
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Documentacion de Mistral-Nemo-Instruct en Xinference: https://inference.readthedocs.io/en/stable/models/builtin/llm/mistral-nemo-instruct.html
