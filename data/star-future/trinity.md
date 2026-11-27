# STAR-future/Trinity

## Resumen

Trinity es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por S.T.A.R., un proyecto de investigacion independiente con origen en Italia. Con 3,558,205,159,168 parametros (3,56 T) contados por Hugging Face a partir de los shards, se presenta como el mayor modelo de pesos abiertos hasta la fecha de su publicacion (23 de noviembre de 2026). Deriva del checkpoint base `moonshotai/Kimi-K3.1-Pro` mediante un proceso de "expert upcycling": se anadieron 256 expertos nuevos a cada una de las 92 capas MoE, hasta un total de 1.152 expertos enrutables por capa.

El modelo esta orientado a IA cientifica con verificacion: diseno de chips y RTL, mecanica orbital y sistemas espaciales, y fisica. La propuesta de S.T.A.R. es que el modelo propone y el laboratorio verifica con simuladores, solvers formales y "recibos" reproducibles. Trinity se distribuye junto a un ecosistema de artefactos abiertos: un cache de activaciones de la ultima capa sobre 2,1 millones de tokens, 1,35 TB de datos cientificos y un kit de inicio ligero para comprobar hardware.

Es relevante porque combina un tamano poco habitual en pesos abiertos con una licencia heredada del modelo base y un enfasis explicito en trazabilidad y verificacion. No obstante, su despliegue requiere infraestructura de varios nodos (pesos MXFP4 de 1,97 TB en 96 shards), lo que lo aleja del uso en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE); 93 capas, de las cuales 92 son MoE |
| Parametros totales | 3.558.205.159.168 (3,56 T) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos publicados en MXFP4; el tag del repo indica tambien 8-bit; no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (licencia "other", heredada del modelo base; requiere revision del fichero LICENSE) |
| Formato de pesos | safetensors (96 shards, MXFP4, 1,97 TB) |
| Expertos por capa MoE | 1.152 (896 originales + 256 nuevos) |
| Expertos nuevos totales | 23.552 (fusion en espacio de pesos de dos expertos padre) |
| Tamano del repo | 1.983,4 GB |
| Modelo base | `moonshotai/Kimi-K3.1-Pro` |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

Trinity es un transformer MoE derivado por upcycling de expertos desde Kimi-K3.1-Pro. Sobre las 92 capas MoE del checkpoint base se anadieron 256 expertos por capa (23.552 en total), cada uno generado por fusion en espacio de pesos de dos expertos padre y dotado de su propia fila de router, de modo que son enrutables desde el primer dia. El modelo conserva la estructura de 1.152 expertos y una matriz de router de 1.152 filas por capa MoE, verificada shard a shard en las cabeceras de los 96 ficheros safetensors.

El proceso de construccion descrito por el autor incluye el streaming de casi dos terabytes de pesos a traves de sus propias herramientas, la verificacion de los 96 shards, la captura de los estados internos de la ultima capa sobre 2,1 millones de tokens cientificos y la recopilacion de 1,35 TB de datos cientificos abiertos. Todo el proceso se ejecuto en tiempo de nube alquilado y gratuito. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset de preentrenamiento ni si hubo fases de RLHF o DPO. La model card menciona un "Trinity Science Adapter" evaluado sobre un conjunto sellado de articulos publicados despues del 1 de noviembre de 2026, pero no detalla su metodo de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento general, con especializacion declarada en dominios cientificos y de ingenieria.
- Razonamiento sobre diseno digital de hardware y RTL, incluyendo flujos con SKY130, GF180MCU, IHP SG13G2, OpenROAD y Yosys.
- Mecanica orbital, sistemas espaciales, efemerides de naves, meteorologia espacial y curvas de luz TESS.
- Fisica y quimica: datos de ChEMBL, PubChem, Protein Data Bank y energia solar en el corpus asociado.
- Procesamiento image-text-to-text segun el pipeline declarado en el repo (capacidad multimodal de entrada).
- Integracion con herramientas de verificacion de S.T.A.R.: comprobacion de equivalencia de circuitos, integradores independientes de orbitas y comprobaciones formales exhaustivas.
- API de chat compatible con OpenAI una vez servido, lo que facilita el conexionado con herramientas externas.
- Soporte de tool calling y function calling a traves de la interfaz compatible con OpenAI (no se detalla el esquema nativo en la informacion disponible).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Verificacion de disenos RTL: el modelo propone modificaciones o correcciones sobre un diseno y el flujo de equivalencia de S.T.A.R. comprueba formalmente que la funcion logica se preserva, lo que encaja en pipelines de CI de silicio donde un error es costoso.
- Exploracion de flujos abiertos de silicio: generacion y revision de scripts para OpenROAD y Yosys sobre kits SKY130, GF180MCU o IHP SG13G2, con el modelo como asistente dentro de un flujo reproducible.
- Analisis de mecanica orbital: calculo y contraste de integraciones de orbita por dos metodos independientes, usando Trinity para plantear el problema y los integradores del laboratorio para validar el resultado.
- Analisis de conjunciones y meteorologia espacial: consulta y sintesis sobre los catalogos de satelites y datos de space weather de Trinity-SpaceData, con trazabilidad de las fuentes.
- Asistencia en investigacion fisica: redaccion y contraste de hipotesis sobre literatura reciente, apoyandose en el Science Adapter y en el conjunto sellado de evaluacion para medir deriva respecto al checkpoint base.
- Especializacion sobre el cache de activaciones: entrenamiento y evaluacion de cabezas o adaptadores sobre la ultima capa usando el cache de 147 GB en una sola GPU, sin cargar los 2 TB de pesos.
- Servicio interno de chat cientifico: despliegue con SGLang y API compatible con OpenAI para integrar Trinity en herramientas internas de laboratorio que ya hablan ese protocolo.

## Benchmarks y rendimiento

La model card unicamente reporta la evaluacion del Trinity Science Adapter sobre un conjunto sellado de articulos publicados despues del 1 de noviembre de 2026, expresada como diferencia respecto al checkpoint base:

| Dominio | Diferencia vs. base | Intervalo de confianza del 95% |
|---|---|---|
| Diseno de chips | -0,20 % | Enteramente por debajo de cero |
| Fisica | -0,35 % | Enteramente por debajo de cero |
| Texto general | Dentro de la guarda | No detallado |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- Pesos completos: 1,97 TB en MXFP4, mas de 2,1 TB de disco libre recomendados por el autor para la descarga.
- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de pesos, el despliegue requiere agregacion de memoria en varios nodos (tensor parallel).
- GPU recomendadas: el ejemplo oficial usa SGLang con `--tp 16`, lo que implica al menos 16 GPUs de gama数据中心; no se especifica el modelo concreto (A100, H100 u otros).
- GPU de consumo: no cabe en ninguna GPU consumer; el autor ofrece Trinity Starter (21 KB) para comprobar hardware antes de descargas grandes.
- Opciones de despliegue: SGLang (soporte de la arquitectura, validacion de serving en curso segun el autor); implementacion de referencia propia de S.T.A.R. capa a capa; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Trinity (S.T.A.R.) | 3,56 T (MoE, 1.152 expertos/capa) | no disponible | `kimi-k3.1-pro` (other) | Pesos abiertos en HF, 1,97 TB |
| Kimi-K3.1-Pro (Moonshot AI) | no disponible en esta ficha | no disponible | `kimi-k3.1-pro` | Modelo base de Trinity |
| Otros modelos abiertos de ~2,8 T | ~2,8 T (segun la model card) | no disponible | no disponible | no disponible |

La model card afirma que los mayores modelos de pesos abiertos previos rondaban los 2,8 T, pero no se identifican por nombre ni se aportan datos de rendimiento comparado. No hay benchmarks publicados que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia heredada `kimi-k3.1-pro` con etiqueta "other": es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial; la model card no aclara los terminos.
- Los benchmarks publicados se limitan a la diferencia del Science Adapter frente al checkpoint base en un conjunto sellado; no hay resultados absolutos ni comparaciones con otros modelos.
- El conjunto de evaluacion esta restringido a articulos posteriores al 1 de noviembre de 2026, lo que limita la comparabilidad con evaluaciones estandar.
- Riesgo de alucinacion inherente a modelos generativos; el propio autor enfatiza que la respuesta solo vale si va acompanada de verificacion con simuladores o solvers.
- Los 23.552 expertos nuevos estan sin especializar (capacidad "esperando ser especializada"), por lo que su comportamiento en dominios concretos no esta caracterizado en la informacion disponible.
- Idiomas soportados y longitud de contexto no declarados: no es posible garantizar cobertura multilingue ni planificar cargas de contexto largo sin verificacion previa.
- El serving con SGLang esta en validacion segun el autor; la implementacion de referencia es capa a capa y no apta para produccion de baja latencia.
- Requiere infraestructura de mas de 2 TB de disco y agregacion multi-GPU; el coste operativo es alto y no hay datos de throughput publicados.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STAR-future/Trinity
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Cache de activaciones (train2): https://huggingface.co/datasets/STAR-future/Trinity-k3cache-train2
- Cache de activaciones (train3): https://huggingface.co/datasets/STAR-future/Trinity-k3cache-train3
- Trinity-SciData: https://huggingface.co/datasets/STAR-future/Trinity-SciData
- Trinity-SpaceData: https://huggingface.co/datasets/STAR-future/Trinity-SpaceData
- Trinity Starter: https://andrea07072000.github.io/S.T.A.R.-/phisis/#trinity
