# XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic

## Resumen

Swift 1.5 Qwen3.8 Flash Next Heretic es un derivado comunitario de tipo fine-tune del modelo ukisai/Swift1.5-Qwen3.8-Flash-Next, publicado por el usuario XopMC513 bajo el paraguas del proyecto Strata. Se trata de un modelo de mezcla de expertos (MoE) de gran escala con 176.943.899.520 parametros totales, 48 capas de texto, 512 expertos enrutados por capa y 10 expertos activos por token, con una ventana de contexto nativa de 262.144 tokens ampliable a 512k y 1M en configuraciones compatibles de Strata. La modificacion "Heretic" consiste en una edicion deliberada y acotada de un pequeno conjunto de proyecciones residuales orientada a reducir rechazos innecesarios, manteniendo intactos los expertos enrutados, los routers, los embeddings, la vision y el modulo MTP.

El modelo resuelve el problema de disponer de un LLM de razonamiento eficiente en tokens, con soporte de tool calling y capacidades multimodales (image-text-to-text), en un formato desplegable sobre hardware relativamente asequible gracias a sus cuantizaciones Q4_K_M y NVFP4. Es relevante en el momento actual porque combina tres tendencias: arquitecturas MoE de gran escala con decodificacion especulativa mediante MTP, cuantizacion agresiva en NVFP4 para servidores con una sola GPU, y variantes "abliterated"/"heretic" que buscan reducir la tasa de rechazos en produccion.

La distribucion se realiza en tres formatos: BF16 Heretic (360 GB de pesos), GGUF Q4_K_M (119,35 GB mas 0,91 GB del proyector de vision) y un paquete nativo NVFP4 mixto (111,06 GB) que requiere un loader propio de Strata y no es compatible directamente con Transformers ni ModelOpt. La licencia es swift-open-license-1.0, con condiciones de uso comercial heredadas del modelo base y de la licencia Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), 48 capas de texto, 512 expertos enrutados por capa, 10 expertos activos por token, con modulo MTP para decodificacion especulativa y torre de vision |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible (el autor no publica el recuento exacto de parametros activos por token) |
| Longitud de contexto | 262.144 tokens nativos; 512k y 1M mediante extension en configuraciones compatibles de Strata |
| Tipos de cuantizacion | BF16 (Heretic SOURCE), GGUF Q4_K_M con tensores sensibles en mayor precision, NVFP4 mixto con pesos de vision en BF16 |
| Idiomas soportados | en, ru |
| Licencia | swift-open-license-1.0 (con LICENSE-QWEN y NOTICE heredados; condiciones de uso comercial aplicables) |
| Formato de pesos | safetensors (BF16), GGUF (Q4_K_M), NVFP4 empaquetado en formato nativo Strata |
| Tamano del repo | 783,7 GB |
| Pipeline | image-text-to-text |
| Modelo base | ukisai/Swift1.5-Qwen3.8-Flash-Next |
| Descargas / likes | 7.745 / 4 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con 48 capas de texto, 512 expertos enrutados por capa y 10 expertos activos por token. El modelo conserva la red MoE completa: no hay poda de expertos, y la adaptacion Heretic solo aplica ediciones puntuales a un conjunto reducido de proyecciones residuales, dejando fuera de la modificacion los expertos enrutados, los routers, los embeddings, la torre de vision y el modulo MTP. Incorpora un cabezal MTP (multi-token prediction) destinado a decodificacion especulativa; el paquete NVFP4 incluye una cabeza MTP Q4 de produccion compatible con decodificadores especulativos, donde todos los tokens borrador deben ser verificados por el modelo principal.

No se dispone de informacion publica sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo base o en este derivado. El modelo base es de UkisAI y Qwen, y esta adaptacion Heretic es un derivado comunitario independiente. La innovacion tecnica mas destacable es la combinacion de razonamiento eficiente en tokens ("efficient-thinking", "token-efficient") con decodificacion especulativa MTP y un pipeline de cuantizacion mixto que mantiene ciertos tensores sensibles en mayor precision mientras comprime los expertos a NVFP4 o Q4_K_M. La cuantizacion NVFP4 se genera a partir del checkpoint BF16 Heretic con una politica de precision mixta y pesos de vision en BF16.

## Capacidades

- Generacion de texto y razonamiento con estilo de pensamiento eficiente en tokens, heredado del modelo base.
- Generacion y asistencia de codigo, con controles de pensamiento y plantilla de chat originales.
- Capacidades multimodales image-text-to-text: incluye torre de vision y proyector (0,91 GB en el paquete Q4_K_M).
- Soporte de tool calling y function calling mediante los assets de tool-use originales.
- Razonamiento multi-paso y uso en flujos de agente, apoyado por la ventana de contexto nativa de 262k tokens.
- Capacidades multilingues limitadas a ingles y ruso segun la model card.
- Decodificacion especulativa mediante cabezal MTP, con verificacion obligatoria de tokens borrador por el modelo principal.
- Modo de pensamiento controlable a traves de la plantilla de chat y los controles de thinking.
- Adaptacion Heretic orientada a reducir rechazos innecesarios (no garantiza ausencia total de rechazos).

## Casos de uso

- Atencion al cliente automatizada: la ventana nativa de 262k tokens permite gestionar conversaciones multi-turno con historiales largos y documentos adjuntos, manteniendo coherencia sin truncar contexto.
- Generacion de codigo en produccion: con soporte de tool calling y una evaluacion local de 152/164 tareas HumanEval BASE (92,68%) en Q4_K_M, puede integrarse en pipelines de CI/CD para autocompletado, revision y generacion de tests.
- Agentes autonomos multi-paso: la combinacion de razonamiento eficiente en tokens, tool use y contexto extensible a 1M en configuraciones Strata lo hace adecuado para orquestacion de tareas con muchas llamadas a herramientas.
- Analisis de documentos e imagenes: el pipeline image-text-to-text permite extraer informacion de capturas, diagramas o formularios combinados con texto largo en un mismo contexto.
- Razonamiento sobre bases de codigo extensas: el contexto de 262k-1M tokens permite cargar modulos completos o varios ficheros para tareas de refactorizacion y explicacion.
- Despliegue en servidores con una sola GPU: el paquete NVFP4 (111,06 GB) esta pensado para el backend nativo Strata con una RTX 4090 y CPUs EPYC, ofreciendo 173-182 tokens/s de generacion y 3.833-5.297 tokens/s de procesamiento de prompt segun contexto.
- Investigacion sobre alineacion y tasas de rechazo: la variante Heretic permite estudiar el efecto de ediciones acotadas en proyecciones residuales sobre el comportamiento de rechazo sin alterar la red MoE.
- Evaluacion comparativa de cuantizaciones: al ofrecer BF16, Q4_K_M y NVFP4 del mismo checkpoint, sirve para medir el impacto de la cuantizacion en calidad y latencia.

## Benchmarks y rendimiento

El autor publica un unico resultado de calidad y una tabla de throughput. No hay datos de MMLU, GSM8K ni otros benchmarks estandar en la informacion disponible.

| Benchmark / metrica | Resultado | Contexto |
|---|---|---|
| HumanEval BASE (Q4_K_M) | 152/164 tareas (92,68%) | Evaluacion local con extraccion conservadora de formato; alcance detallado en EVIDENCE.json |
| Comparacion Q4_K_M vs NVFP4 | misma puntuacion de tarea | Comprobacion pareada limitada |
| Throughput NVFP4, contexto 256k | 173,3 tok/s generacion; 5.297 tok/s prompt | 2x AMD EPYC 9754 + 1x RTX 4090, mediana de 3 ejecuciones |
| Throughput NVFP4, contexto 512k | 181,8 tok/s generacion; 4.752 tok/s prompt | Mismo hardware; contexto extendido en runtime |
| Throughput NVFP4, contexto 1M | 175,3 tok/s generacion; 3.833 tok/s prompt | Mismo hardware; contexto extendido en runtime |

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, etc.) en la informacion disponible. Los resultados locales no constituyen una garantia amplia de calidad sin cambios.

## Requisitos de hardware

- VRAM estimada para inferencia: el paquete NVFP4 completo ocupa 111,06 GB y el GGUF Q4_K_M 119,35 GB mas 0,91 GB de proyector de vision; el BF16 requiere 360 GB de pesos. En la practica, el despliegue NVFP4 de referencia usa una unica RTX 4090 junto con CPU y memoria del sistema, no VRAM exclusiva.
- GPU recomendadas: RTX 4090 para el backend Strata NVFP4 con offload a CPU (configuracion medida por el autor). Para BF16 se necesitan varias A100/H100 o un nodo con memoria agregada suficiente; no se especifican configuraciones oficiales.
- Cabe en consumer GPU: no en su totalidad en una sola consumer GPU; el paquete NVFP4 esta disenado para un esquema hibrido GPU+CPU con una RTX 4090 y CPUs EPYC.
- Opciones de despliegue: backend nativo Strata para NVFP4 (loader propio, no es drop-in de Transformers/ModelOpt); runtimes GGUF con soporte de la arquitectura Qwen4Exp para Q4_K_M; el codigo del runtime no se incluye en el repositorio de pesos.
- Latencia y throughput: 173,3-181,8 tokens/s de generacion y 3.833-5.297 tokens/s de procesamiento de prompt en NVFP4 sobre 2x EPYC 9754 + RTX 4090, con MTP verificado por el modelo principal. No hay datos de latencia para Q4_K_M ni BF16.

## Comparativa con modelos similares

No se dispone de datos publicos de rendimiento en benchmarks estandar de este modelo ni de sus alternativas directas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros totales | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8 Flash Next Heretic (este) | 176,9 B (MoE, 512 expertos, 10 activos) | 262k nativo; 512k/1M extendido | swift-open-license-1.0 | safetensors BF16, GGUF Q4_K_M, NVFP4 Strata | Adaptacion Heretic, vision, MTP, tool use |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base) | no disponible | no disponible | no disponible | no disponible | Modelo base sin la edicion Heretic |
| Alternativas de misma categoria (otros MoE abiertos de ~150-200B) | no disponible | no disponible | no disponible | no disponible | No se han identificado en la informacion proporcionada modelos comparables con datos verificables |

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y ruso; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: inherente a los LLM; la adaptacion Heretic reduce rechazos pero no garantiza respuestas libres de errores ni de rechazos.
- La edicion Heretic modifica proyecciones residuales para disminuir rechazos, lo que puede alterar el comportamiento de seguridad y alineacion respecto al modelo base; requiere evaluacion propia antes de produccion.
- Compatibilidad: el paquete NVFP4 no es un checkpoint drop-in de Transformers ni ModelOpt y exige el loader de Strata; el GGUF requiere soporte de la arquitectura Qwen4Exp. El codigo del runtime no se incluye en el repositorio.
- Los resultados de HumanEval son locales, con extraccion conservadora de formato y alcance limitado; no constituyen una garantia amplia de calidad.
- El contexto de 512k y 1M depende de extension en runtime y de configuraciones compatibles de Strata; no es nativo.
- Licencia: swift-open-license-1.0 con LICENSE-QWEN y NOTICE heredados; existen condiciones de uso comercial aplicables que deben revisarse antes de un despliegue comercial.
- El repositorio es muy grande (783,7 GB) y el paquete NVFP4 requiere descargar el directorio completo, incluido el pack de expertos, pesos comunes, vision y MTP; el componente de pesos comunes de 38,82 GB no es un modelo autonomo.
- No se dispone de informacion sobre sesgos especificos, datos de entrenamiento ni evaluaciones de seguridad publicadas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Paquete NVFP4 (contenido): https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/tree/main/NVFP4
- README del paquete NVFP4: https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/blob/main/NVFP4/README.md
- Directorio Q4_K_M: https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/tree/main/Q4_K_M
- Directorio SOURCE (BF16 Heretic): https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/tree/main/SOURCE
- Evidencias de evaluacion: https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/blob/main/EVIDENCE.json
- Manifiesto del paquete: https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/blob/main/PACKAGE.json
- Listado de ficheros: https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/blob/main/FILES.json
- Licencia Swift: https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/blob/main/LICENSE
- Licencia Qwen: https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/blob/main/LICENSE-QWEN
- Aviso legal: https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/blob/main/NOTICE
