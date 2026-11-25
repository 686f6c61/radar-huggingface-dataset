# thurstonpowers/xll-acts-qwen3.5-9b

## Resumen

XLL Acts — Qwen3.5-9B es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario thurstonpowers, orientado a la extraccion de estructura jerarquica de leyes federales estadounidenses (Acts). El modelo toma texto de Acts indexado de forma con perdida de offsets y devuelve arboles estructurales validos por span, es decir, representaciones jerarquicas cuyos nodos se corresponden con fragmentos exactos del texto fuente original. Se distribuye bajo licencia Apache 2.0 y forma parte de la familia experimental XLL (bills, statute/regulation, citation, actor-SPO y acts).

Tecnicamente es un transformer multimodal (image-text-to-text) de 9.409.813.744 parametros, heredado de Qwen3.5-9B, con todos los parametros de lenguaje entrenados y el modulo de vision congelado. El entrenamiento uso 3.900 Acts federales completos expandidos a 10.960 chats, dos epocas y 5.480 actualizaciones del optimizador, con contexto de entrenamiento de 32.768 tokens. El checkpoint subido es el FP32 nativo sin reexportar, de ahi el tamano del repositorio de 37,7 GB.

Su relevancia es acotada y experimental: el propio autor lo marca como no cualificado para produccion. La evaluacion publicada mide adherencia estricta al contrato de salida (arboles validos por span), no correccion legal ni semantica, y el modelo requiere una interfaz muy especifica (texto indexado, prompt congelado byte a byte y vocabulario de etiquetas cerrado) para funcionar como se espera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5-9B; vision congelada durante el ajuste |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | 32.768 tokens en entrenamiento; evaluado a 65.536 tokens de contexto con 16.384 de salida (calidad en contexto largo no cualificada) |
| Tipos de cuantizacion | no disponible (artefacto publicado en FP32 nativo; la carga en BF16 es un cast en tiempo de inferencia) |
| Idiomas soportados | no disponible (entrenado sobre legislacion federal de EE. UU. en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint FP32 nativo, sin reexportar; sin estado del optimizador) |

## Arquitectura y entrenamiento

El modelo parte de la revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a` de Qwen/Qwen3.5-9B, un transformer multimodal con torre de vision. El ajuste entrena todos los parametros de lenguaje y congela los de vision. El entrenamiento se hizo en FP32 para maestros y buffers, con autocast BF16 y Adafactor factorizado en FP32, sin adaptadores ni cuantizacion. Se usaron microbatch de uno y acumulacion de cuatro, learning rate de 5e-6 y semilla 102301.

Los datos son 3.900 Acts federales completos expandidos a 10.960 chats de unidad completa o propia: 3.231 encajes de chat completo y 669 planes de division guiados por referencia. En total, dos epocas, 21.920 presentaciones de chat y 5.480 actualizaciones del optimizador. La perdida se calcula solo sobre la completion (completion-only loss) y pondera las referencias revisadas con 1.0 y las plateadas (silver) con 0.5, dividiendo por el numero de unidades propias y normalizando globalmente. Los objetivos de entrenamiento son proyecciones de referencias de fuente, no oro semantico experto, y la subdivision guiada por referencia no constituye un divisor de inferencia cualificado ni un metodo de ensamblaje de Acts completos. El corpus de ejecucion nativo tiene SHA-256 `9074e0f8ce109e88883f5c6323d323020ae7852ec053134ecd3bd1162ab7ecd7`.

## Capacidades

- Extraccion de estructura jerarquica de Acts federales de EE. UU.: genera arboles cuyos nodos referencian spans exactos del texto fuente indexado (offsets sobre Unicode sin normalizar, fin exclusivo).
- Generacion de texto conversacional en formato chat (pipeline text-generation, conversacional).
- Cumplimiento de un contrato de salida cerrado: etiquetas estructurales definidas en `OUTPUT_CONTRACT.json` y prompt de sistema congelado en `PROMPT_TRAINED.txt`.
- Procesamiento de entradas largas: entrenado a 32.768 tokens y probado a 65.536 de contexto con 16.384 de salida.
- Capacidad multimodal heredada del base (image-text-to-text), aunque la torre de vision se congelo y no se entreno para la tarea.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el entrenamiento se limita a legislacion federal estadounidense.

## Casos de uso

- Indexacion estructural de corpus legislativo: dado un Act federal completo en texto indexado, el modelo devuelve un arbol de secciones, subsecciones y parrafos con offsets exactos, util para construir indices navegables sobre repositorios legales internos.
- Enriquecimiento de bases de datos juridicas: convertir texto plano de Acts en registros jerarquicos con referencias de span permite enlazar fragmentos con metadatos y busquedas por seccion sin perder trazabilidad al texto original.
- Preprocesamiento para pipelines de recuperacion (RAG legal): los arboles validos por span sirven para trocear documentos respetando su estructura real en lugar de cortes por longitud fija, mejorando la coherencia de los fragmentos recuperados.
- Investigacion academica en NLP juridico: el modelo y su dataset (`thurstonpowers/xll-acts-structure-indexed`) permiten reproducir el experimento de extraccion de estructura y comparar con lineas base bajo el mismo contrato de salida.
- Auditoria de cobertura documental: al exigir spans validos, el modelo facilita detectar secciones no cubiertas o mal delimitadas en procesos de digitalizacion de normativa.
- Prototipado de asistentes de consulta normativa: combinado con un recuperador, puede aportar la capa de estructura sobre la que un asistente cite secciones concretas de un Act, siempre con validacion humana por su caracter experimental.
- Evaluacion de contratos de salida estrictos: sirve como banco de pruebas para medir adherencia a formatos cerrados (JSON con etiquetas permitidas) en modelos de 9B, tal como documenta la comparacion con GPT-6.1 Sol.

## Benchmarks y rendimiento

La model card publica una evaluacion de adherencia estricta al contrato de salida sobre una cohorte de 100 Acts de Connecticut y 100 federales no vistos en entrenamiento, cada uno con entrada completa por debajo de 34.000 tokens Qwen (maximo 33.947). La tabla mide arboles validos por span no triviales, no precision semantica ni legal.

| Medida | XLL Acts Qwen3.5-9B | GPT-6.1 Sol |
|---|---:|---:|
| CT: arboles validos por span no triviales | 55/100 (55%) | 0/100 |
| Federal: arboles validos por span no triviales | 88/100 (88%) | 0/100 |
| Total: arboles validos por span no triviales | 143/200 (71,5%) | 0/200 |
| Otras salidas invalidas (JSON/arbol) | 55 | 200 |
| Fallos por limite de salida | 2 | 0 |
| Resultados registrados / denominador original | 200/200 | 200/200 |

Condiciones: RTX 5090, BF16, batch uno, decodificacion greedy, thinking desactivado, flash SDP, contexto de 65.536 tokens con 16.384 de salida y plazo de una hora por caso. El autor advierte que el prompt congelado no enumera las etiquetas permitidas y que los presupuestos de salida difieren, por lo que el cero de Sol es un resultado de contrato estricto, no evidencia de nula comprension legal. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint es FP32 de unos 37,7 GB en disco; en BF16 el peso ronda los 18,8 GB, por lo que se necesita al menos 24 GB de VRAM para cargarlo sin cuantizar y mas para el contexto largo (KV cache de 65.536 tokens).
- GPU recomendadas: la evaluacion oficial se ejecuto en una RTX 5090. Para contexto largo y mayor throughput, A100 80 GB o H100 son opciones adecuadas; una RTX 4090 de 24 GB puede cargar el modelo en BF16 con margen ajustado.
- Cabe en GPU de consumo: si, en BF16 en tarjetas de 24 GB o mas (RTX 4090, RTX 5090); en FP32 nativo requiere alrededor de 40 GB o mas.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `AutoTokenizer` (interfaz documentada en la model card); el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Endpoints. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la evaluacion uso batch uno y greedy con plazo de una hora por caso, sin cifras de tokens por segundo publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XLL Acts Qwen3.5-9B | 9,41 B | 32.768 en entrenamiento; probado a 65.536 | Extraccion de estructura de Acts con spans | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | no disponible | no disponible | Generacion multimodal general | no disponible | Hugging Face |
| GPT-6.1 Sol | no disponible | no disponible | Generacion general; 0/200 en contrato estricto | propietaria | API |
| Otros modelos XLL del mismo autor (bills, statute/regulation, citation, actor-SPO) | no disponible | no disponible | Extraccion de estructura en otros dominios legales | no disponible | Hugging Face |

La comparacion con Sol no es equivalente: el prompt congelado no enumera las etiquetas permitidas y los presupuestos de salida difieren, por lo que no mide capacidad legal general. No se dispone de datos de benchmarks estandar para contrastar con alternativas de 9B.

## Limitaciones y advertencias

- Modelo experimental y no cualificado para produccion, segun el propio autor: spans validos no implican jerarquia legalmente correcta, cobertura completa ni precision semantica.
- Los objetivos de entrenamiento son proyecciones de referencias de fuente, no oro semantico experto; las referencias plateadas tienen peso 0,5.
- Requiere una interfaz estricta: texto indexado con offsets sobre Unicode sin normalizar (fin exclusivo), prompt `PROMPT_TRAINED.txt` byte a byte y etiquetas de `OUTPUT_CONTRACT.json`. Usar texto crudo o XML rompe el contrato.
- El prompt congelado de evaluacion no enumera las etiquetas permitidas, lo que afecta a la comparabilidad con otros modelos.
- La calidad en contexto superior a 32K no esta cualificada, aunque se evaluo a 65.536 tokens.
- La subdivision guiada por referencia no es un divisor de inferencia cualificado ni un metodo de ensamblaje de Acts completos; el entrenamiento por fragmentos usa otro prompt de sistema y no cualifica el ensamblaje.
- Riesgo de alucinacion estructural: offsets o nodos que no correspondan a spans reales del fuente; en la evaluacion, 55 de 200 salidas fueron invalidas por JSON o arbol.
- Sesgos conocidos: no documentados; el dominio se limita a legislacion federal de EE. UU. y la cobertura de Connecticut se infirio previamente, no es un test ciego nuevo.
- Idiomas: no disponible; no se declaran capacidades multilingues.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la ausencia de validacion semantica desaconsejan su uso en produccion sin revision humana.
- El repositorio ocupa 37,7 GB por el checkpoint FP32 nativo; el estado del optimizador no se incluye.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thurstonpowers/xll-acts-qwen3.5-9b
- Dataset de entrenamiento: https://huggingface.co/datasets/thurstonpowers/xll-acts-structure-indexed
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Resultados emparejados de la cohorte: `evaluation/cohort/paired-structural-results.json` (dentro del repositorio)
- Resumen del modelo Acts: `evaluation/acts-model/summary.json`
- Resumen de Sol: `evaluation/sol/summary.json`
- Auditoria de validacion de Sol: `evaluation/sol/validation-audit.json`
- Predicciones de Acts: `evaluation/acts-model/predictions.jsonl`
- Predicciones de Sol: `evaluation/sol/predictions.jsonl`
- Peticiones congeladas de la cohorte: `evaluation/cohort/requests.jsonl`
- Prompt de entrenamiento: `PROMPT_TRAINED.txt` (SHA-256 `57766ac499dd8ab8b1d20901fd14447af2c2477d57433c2d4c11f2486618ea3b`)
- Contrato de salida: `OUTPUT_CONTRACT.json`
