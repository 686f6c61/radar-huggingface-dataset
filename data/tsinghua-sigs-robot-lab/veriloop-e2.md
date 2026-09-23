# tsinghua-sigs-robot-lab/VeriLoop-E2

## Resumen

VeriLoop E2 es un modelo de lenguaje de 27.000 millones de parametros publicado por Tsinghua SIGS Robot Lab (Libo Wang) como resultado de un post-entrenamiento sobre el checkpoint base Qwen/Qwen3.8-27B. Esta orientado a tres dominios concretos: ingenieria de software y agentes de codigo, razonamiento matematico y razonamiento cientifico (fisica). Su propuesta diferencial no es solo el ajuste de pesos, sino una disciplina de razonamiento denominada VeriLoop-Governed Recurrence (VGR): el modelo genera estados candidatos de forma recursiva, estos se comprueban externamente y solo se retienen si el estado de evidencia protegido mejora sin regresion.

El modelo se presenta como la mitad "generativa" de un sistema mayor: VeriLoop E2 propone, abstrae, diagnostica y repara, mientras que el VeriLoop Harness se encarga de la admision de evidencia, las comprobaciones deterministas, la verificacion externa, el commit/rollback y la persistencia del estado. Es decir, el modelo no se autocertifica. El Harness de produccion no se incluye en el repositorio, que publica unicamente los pesos, la ruta de inferencia, el registro de evaluacion y la descripcion funcional publica.

Llega con una ventana de contexto nativa de 262.144 tokens en la configuracion del tokenizador liberada, licencia Apache 2.0 y pesos en safetensors, con vLLM 0.17.0 como motor de servicio recomendado (longitud de servicio validada de 131.072 tokens). Su relevancia actual radica en que combina un tamano desplegable en hardware de gama alta con resultados declarados muy altos en benchmarks agenticos y de razonamiento, aunque con la advertencia explicita de que las cifras corresponden a la configuracion evaluada dentro de su propio flujo de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B; clase HF declarada: `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 27B (clase de parametros declarada) |
| Parametros activos | No aplica; la informacion disponible no indica arquitectura MoE |
| Longitud de contexto | 262.144 tokens nativos; 131.072 tokens validados en servicio con vLLM |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no hay GGUF, AWQ ni GPTQ anunciados) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache License 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.8-27B (relacion: finetune) |
| Etapa de entrenamiento | Post-training |
| Tokenizador | `Qwen2Tokenizer` |
| Dominios principales | Codigo, ingenieria de software, matematicas, fisica |
| Corpus de post-training | 1.841.831 registros (contabilidad publica) |
| Motor de servicio recomendado | vLLM 0.17.0 (ruta compatible con la API de OpenAI) |
| Tamano del repositorio | 20,1 GB |
| Ano de publicacion | 2026 |

## Arquitectura y entrenamiento

La model card declara la clase de arquitectura de HuggingFace `Qwen3_5ForConditionalGeneration` y un modelo base Qwen/Qwen3.8-27B con relacion de tipo finetune. No se detallan en la informacion proporcionada la profundidad de capas, la dimension oculta, el tipo de atencion ni el esquema de posiciones; tampoco se indica si hay componentes de mezcla de expertos. Tampoco se especifica si se emplearon tecnicas de alineacion como RLHF, DPO u otras variantes; ese detalle queda remitido al informe tecnico, que en esta informacion figura con un enlace marcador de posicion no valido.

Lo que si se documenta es la composicion del post-entrenamiento: una mezcla de 1.841.831 registros que abarca ingenieria de software a nivel de repositorio, uso de terminal y herramientas, razonamiento matematico, razonamiento cientifico, reparacion sensible a verificadores y entrenamiento orientado a recurrencia. La innovacion tecnica declarada es VeriLoop-Governed Recurrence (VGR), un bucle en el que el modelo propone estados candidatos de forma recursiva y solo los conserva cuando el estado de evidencia protegido mejora sin regresion. La autoridad de verificacion reside en un componente externo (el VeriLoop Harness: admision de evidencia, comprobaciones deterministas, verificacion externa, commit/rollback, criterios de parada y persistencia), de modo que el modelo genera y el sistema externo certifica. Este reparto es relevante para produccion porque implica que reproducir los resultados agenticos exige replicar tambien el flujo de evaluacion, no solo cargar los pesos.

## Capacidades

- Generacion de texto y razonamiento general con ventana de contexto larga (262.144 tokens nativos).
- Ingenieria de software a nivel de repositorio: navegacion de codigo, diagnostico de fallos, hipotesis de reparacion y aplicacion de parches.
- Uso de terminal y herramientas de linea de comandos, orientado a tareas agenticas de varios pasos.
- Uso de herramientas (tool calling) e integracion en flujos de agentes, segun la orientacion declarada del post-entrenamiento (tool-use).
- Razonamiento matematico, incluyendo problemas de competicion (se reporta AIME 2026).
- Razonamiento cientifico y de fisica (se reporta GPQA Diamond y el benchmark Apex 2025).
- Disciplina de razonamiento por recurrencia gobernada por verificador (VGR), con propuesta, comprobacion y retencion condicionada de estados candidatos.
- Capacidades multilingues limitadas a ingles y chino.
- Servicio compatible con la API de OpenAI mediante vLLM 0.17.0.

## Casos de uso

- Reparacion de incidencias en repositorios reales: el modelo puede recibir un repositorio y el enunciado de un fallo, localizar el codigo implicado y proponer un parche. Su orientacion a ingenieria de software a nivel de repositorio y los 262.144 tokens de contexto nativo permiten incluir arboles de ficheros amplios y trazas de ejecucion sin truncar.
- Automatizacion de tareas de terminal: dado un objetivo de administracion o de build, el modelo encadena comandos, interpreta la salida y corrige la secuencia, lo que encaja con los resultados declarados en Terminal-Bench 2.1.
- Agente de CI/CD con verificacion externa: integrado detras del VeriLoop Harness, cada propuesta de cambio puede someterse a comprobaciones deterministas (tests, linters, compilacion) antes de aceptarse, con rollback si el estado de evidencia no mejora.
- Asistencia en investigacion matematica: el modelo puede generar conjeturas, esbozar demostraciones y proponer contraejemplos para someterlos despues a un verificador formal o a revision humana, aprovechando su entrenamiento en razonamiento matematico.
- Analisis y modelado en fisica: apoyo a la derivacion de expresiones, comprobacion dimensional y exploracion de hipotesis en problemas cientificos, con el resultado final validado fuera del modelo.
- Migracion y refactorizacion de bases de codigo grandes: con 131.072 tokens de contexto validados en servicio, es viable procesar modulos extensos y mantener coherencia entre ficheros relacionados en una misma sesion.
- Generacion de codigo asistida en IDE o plataforma interna: el formato safetensors y el servicio compatible con la API de OpenAI facilitan desplegarlo detras de una interfaz propia sin adaptar el cliente.

## Benchmarks y rendimiento

La model card declara resultados congelados para nueve benchmarks de codigo agentico, matematicas y ciencia, aunque solo se publican cifras de cinco de ellos.

| Benchmark | Resultado declarado |
|---|---|
| SWE-bench Pro | 76,2% |
| Terminal-Bench 2.1 | 88,8% |
| AIME 2026 | 98,3% |
| GPQA Diamond | 93,9% |
| Apex 2025 | 89,6% |
| Otros cuatro benchmarks | No disponibles (no se publican cifras en la informacion proporcionada) |

Nota de atribucion: los resultados caracterizan la configuracion evaluada del sistema E2, que incluye el Harness interno de VeriLoop cuando la tarea lo requiere, las herramientas nativas del benchmark y el evaluador oficial o designado. No deben interpretarse como reproducibles por el checkpoint base Qwen3.8-27B sin post-entrenamiento, ni por el checkpoint E2 fuera de ese entorno de ejecucion. Los protocolos por benchmark, las salidas a nivel de tarea y los recibos del evaluador se publican por separado en el paquete Evaluation Evidence.

## Requisitos de hardware

Estimaciones derivadas del tamano declarado (27B) y de la ventana de contexto; no son cifras publicadas por el autor salvo donde se indique.

- Pesos en bf16: aproximadamente 54 GB solo para los pesos, mas cache KV. Para contexto muy largo se necesitan varios aceleradores o paralelismo tensorial.
- Pesos en fp8: aproximadamente 27 GB de pesos. Encaja en una A100 80 GB o H100 80 GB con margen para cache KV de contexto medio.
- Cuantizacion de 4 bits (si se genera): aproximadamente 14-16 GB de pesos, lo que permitiria ejecucion en GPU de consumo con 24 GB, con contexto reducido.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para servicio en bf16/fp8 con contexto largo; configuraciones multi-GPU para acercarse a los 262.144 tokens nativos.
- GPU de consumo: en cuantizacion baja cabe en RTX 4090 o RTX 3090 (24 GB); en tarjetas de 16 GB seria muy justo y obligaria a reducir contexto y a cuantizar la cache KV. No se han publicado pesos GGUF ni cuantizaciones listas para usar.
- El repositorio ocupa 20,1 GB, por debajo de lo esperado para pesos completos de 27B en bf16 (unos 54 GB); la informacion disponible no detalla el formato de serializacion exacto ni explica esa diferencia.
- Opciones de despliegue: vLLM 0.17.0 (motor recomendado, con ruta compatible con la API de OpenAI y configuracion validada de 131.072 tokens) y la libreria transformers. llama.cpp, Ollama y TGI no se mencionan ni tienen artefactos publicados para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento verificado |
|---|---|---|---|---|
| VeriLoop E2 | 27B | 262.144 tokens nativos / 131.072 validados en servicio | Apache 2.0 | 76,2% SWE-bench Pro; 88,8% Terminal-Bench 2.1; 98,3% AIME 2026; 93,9% GPQA Diamond; 89,6% Apex 2025 (bajo su flujo de evaluacion) |
| Qwen3.8-27B (modelo base) | 27B | No disponible | No disponible en la informacion proporcionada | No disponible |
| VeriLoop Coder E1 (publicacion previa de la misma familia) | No disponible | No disponible | No disponible | No disponible |
| Otras alternativas de ~30B orientadas a codigo y agentes | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone en la informacion proporcionada de datos verificados de modelos comparables de la misma categoria (tamano similar o misma tarea) que permitan una comparacion cuantitativa fiable. La comparacion mas directa disponible es contra el propio modelo base, cuyas cifras no se publican en esta ficha.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a un modelo generativo; en dominios cientificos y matematicos el modelo no se autocertifica, de modo que cualquier salida debe pasar por verificacion externa.
- Los resultados publicados no son reproducibles cargando solo los pesos: dependen del VeriLoop Harness, de las herramientas nativas del benchmark y del evaluador oficial. El Harness de produccion no se incluye en el repositorio.
- La model card incluye de forma explicita una frontera de atribucion: no debe asumirse que el checkpoint base Qwen3.8-27B alcance las mismas cifras.
- Cobertura idiomatica limitada a ingles y chino; no se declara soporte de castellano ni de otros idiomas.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ), lo que dificulta el despliegue en hardware de gama baja sin conversiones propias.
- El repositorio no registra descargas ni valoraciones en el momento de la consulta, y el modelo se publico en septiembre de 2026; se trata de un lanzamiento reciente con poca validacion independiente.
- Dos demostraciones cientificas publicas (un certificado de proporcion de ceros de la funcion zeta de Riemann al 67,350003708785593% y una tomografia asintotica de gravitones para el problema de la informacion en agujeros negros) son afirmaciones del autor y no se han verificado de forma independiente en la informacion proporcionada.
- La ausencia de detalle sobre el entrenamiento (datos exactos, filtrado, y si hubo RLHF o DPO) impide auditar sesgos o contaminacion de benchmarks desde esta ficha.
- Licencia Apache 2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y aviso de licencia; conviene revisar los terminos del modelo base Qwen3.8-27B por si imponen condiciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2
- Dataset de evidencia de evaluacion: https://huggingface.co/datasets/tsinghua-sigs-robot-lab/VeriLoop-E2-Evaluation-Evidence
- Publicacion previa de la familia (repositorio referenciado para el logotipo): https://huggingface.co/tsinghua-sigs-robot-lab/veriloop-coder-e1
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Informe tecnico: no disponible (el enlace figura como marcador de posicion "xxxx" en la model card)
- Artefactos cientificos: no disponible (marcador de posicion "xxxx")
- Repositorio GitHub: no disponible (marcador de posicion "xxxx")
- Zenodo: no disponible (marcador de posicion "xxxx")
