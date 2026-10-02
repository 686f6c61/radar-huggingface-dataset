# Wrapzii/Swift-1.5-Qwen3.8-27b-GPTQ-Int4-baked-v1-embed-int8

## Resumen

Swift 1.5 Qwen3.8-27B — GPTQ INT4 baked v1 con embedding INT8 es una version cuantizada del modelo Swift 1.5 Qwen3.8-27B, preparada por el usuario Wrapzii para inferencia sobre dos GPU Intel Arc Pro B60. No se trata de un modelo nuevo ni de un ajuste fino: parte del checkpoint `ukisai/Swift-1.5-Qwen3.8-27b-W4A16-AutoRound`, conserva intacto el cuerpo AutoRound INT4 de UkisAI y le anade un bake GPTQ INT4 calibrado del `lm_head` y de las lineales MTP, mas un fichero lateral de embedding en INT8 con un cargador especifico.

El modelo hereda las caracteristicas de Swift 1.5, la adaptacion de razonamiento eficiente de UkisAI sobre Qwen3.8-27B. Segun las fuentes consultadas, esa adaptacion reduce los tokens de "thinking" en un 58,5% manteniendo una precision un 0,35% superior a la del modelo base. El checkpoint resultante es multimodal (pipeline `image-text-to-text`, con torre de vision preservada) y esta pensado para vLLM sobre Intel XPU.

La relevancia de esta publicacion es de ingenieria de despliegue: reduce el peso del modelo a 7,47 GiB por GPU y combina precisiones mixtas (INT4 en el cuerpo y el head, INT8 en el embedding) con un backend de cache KV comprimida K8/V4 no incluido en los ficheros de pesos. El autor advierte que las cifras de rendimiento publicadas corresponden a su stack validado y no son extrapolables a otros runtimes o hardware. El repositorio no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B, con capas de atencion completa y capas GDN; incluye torre de vision y lineales MTP (multi-token prediction) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible de forma explicita; el autor publica pruebas de rendimiento hasta 200K tokens |
| Tipos de cuantizacion | Cuerpo en AutoRound INT4 simetrico (grupo 128, W4A16); `lm_head` y lineales MTP en GPTQ INT4 simetrico (grupo 128); embedding en INT8 por fila con escalas FP16 |
| Idiomas soportados | No disponible |
| Licencia | swift-open-license-1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors (GPTQ empaquetado; fichero lateral INT8 para el embedding) |

## Arquitectura y entrenamiento

El checkpoint es una conversion de precision mixta, no un tensor INT4 completo. Se conservan las 400 lineales del cuerpo en AutoRound simetrico INT4 (grupo 128) sin recuantizar sus activaciones; solo se les anade metadatos compatibles con GPTQ e indices de grupo deterministas. Nueve lineales densas (el `lm_head` y las ocho de la ruta MTP: `fc`, q/k/v/o, gate/up/down) se sustituyen por 36 arrays GPTQ (cada una con `qweight`, `qzeros`, `scales` y `g_idx`), y los tensores densos originales se eliminan fisicamente de los shards reescritos. El embedding de tokens pasa a codigos INT8 por fila (maximo absoluto / 127) con escalas FP16, materializados por el cargador en tiempo de ejecucion. El indice pasa de 2.399 a 2.426 tensores. La torre de vision y el resto de pesos auxiliares excluidos permanecen en denso.

El proceso de cuantizacion uso activaciones propias de Swift con vLLM 0.30 XPU, TP2 y MTP6, ventana de calibracion de 1.024 tokens y cuatro secuencias, y 128 prompts de validacion de WikiText-2 de 384 tokens (hasta 64 tokens generados). Se acumularon hessianos en Float32 para seis propietarios de entrada, con 34.215 filas para el head y 80.548 para los propietarios MTP. Se aplico GPTQ simetrico con grupo de 128, amortiguamiento de hessiano del 1%, sin ordenacion de activaciones y chunks de 8.192 columnas de salida. No se realizo ajuste fino adicional ni mezcla de modelos. La cache KV comprimida (INT8 en K / INT4 empaquetado en V sobre capas de atencion completa, con capas GDN intactas) es un parche separado del repositorio de codigo y no forma parte del formato de pesos.

## Capacidades

- Generacion de texto y razonamiento conversacional, con herencia de Swift 1.5 orientada a eficiencia de razonamiento.
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`, torre de vision preservada en denso).
- Modo de razonamiento configurable mediante plantilla de chat: los niveles low, medium y xhigh siguen soportados, con low como valor por defecto.
- Soporte de lineales MTP (multi-token prediction) para decodificacion acelerada dentro del stack validado.
- Capacidades de codigo y matematicas: el autor describe el benchmark de rendimiento como "coding probe", aunque no detalla tareas concretas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible la lista de idiomas soportados.
- Capacidad de despliegue en vLLM sobre Intel XPU con tensor parallelism (TP2 en las pruebas).

## Casos de uso

- Inferencia de razonamiento de alto volumen sobre hardware Intel: el checkpoint esta optimizado para dos Intel Arc Pro B60 con 7,47 GiB de pesos por GPU, lo que permite servir un modelo de 27,8 B de parametros sin recurrir a aceleradores de gama alta.
- Procesamiento de documentos con imagenes: al conservar la torre de vision y declarar el pipeline `image-text-to-text`, puede emplearse en tareas de descripcion de capturas, extraccion de informacion de graficos o respuesta sobre figuras.
- Analisis de contexto muy largo: el autor valida el modelo hasta 200K tokens (60,8 tok/s), lo que lo hace adecuado para resumir o consultar repositorios, expedientes o transcripciones extensas.
- Generacion de codigo en produccion: la prueba de referencia del autor es un "coding probe", de modo que el modelo esta orientado a asistencia de programacion, aunque no se publiquen tareas especificas.
- Asistentes conversacionales de bajo coste por token: la reduccion del 58,5% en tokens de razonamiento descrita para Swift 1.5 abarata las respuestas en escenarios de dialogo multi-turno.
- Despliegue en pipelines vLLM con tensor parallelism: al ser un checkpoint GPTQ compatible con metadatos deterministas, se integra en infraestructuras vLLM existentes sobre XPU.
- Fine-tuning o derivaciones posteriores: el checkpoint puede servir como base de partida para nuevas cuantizaciones o adaptaciones, siempre que se respete la licencia swift-open-license-1.0.
- Investigacion en cuantizacion: la mezcla de AutoRound INT4, GPTQ INT4 en el head y MTP, e INT8 en el embedding, con hessianos y calibracion documentados, sirve como caso de estudio reproducible de cuantizacion por capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para este derivado. El autor indica explicitamente que "las puntuaciones de benchmark de origen no se han reestablecido de forma independiente para este derivado".

Las siguientes cifras proceden de las fuentes de UkisAI sobre Swift 1.5 respecto a su modelo base, no de este checkpoint cuantizado:

| Metrica | Swift 1.5 frente a base | Fuente |
|---|---|---|
| Tokens de razonamiento (thinking) | 58,5% menos | UkisAI / Featherless |
| Precision global | 0,35% superior | UkisAI / Featherless |
| Aceleracion | 9,18x en varias tareas (UkisAI) o 1,95x (Featherless) | UkisAI / Featherless (cifras discrepantes entre fuentes) |

Rendimiento de servicio reportado por el autor de este derivado (thinking desactivado, concurrencia 1, sobre el stack validado con backend K8/V4, MTP6, graphs y configuracion de serving):

| Longitud de contexto | Throughput |
|---|---|
| 2K | 136,5 tok/s |
| 8K | 134,0 tok/s |
| 128K | 77,8 tok/s |
| 200K | 60,8 tok/s |

Memoria de pesos del modelo: 7,47 GiB por GPU, frente a 9,23 GiB del checkpoint Swift sin bake.

## Requisitos de hardware

- VRAM de pesos: 7,47 GiB por GPU en configuracion de dos GPU (Intel Arc Pro B60). El repositorio ocupa 18,3 GB en disco.
- GPU validadas por el autor: dos Intel Arc Pro B60 con backend K8/V4, MTP6 y graphs.
- Compatibilidad con GPU de consumo: no confirmada. El checkpoint usa vLLM sobre Intel XPU; no se documenta su funcionamiento en RTX 4090, RTX 3090 u otras consumer. No disponible.
- Opciones de despliegue: vLLM (libreria declarada) sobre Intel XPU. El fichero INT8 del embedding requiere un parche de runtime especifico; sin ese parche no se obtiene el ahorro de memoria residente. Compatibilidad completa fuera del runtime probado: no establecida.
- Latencia y throughput: 136,5 tok/s a 2K, 134,0 tok/s a 8K, 77,8 tok/s a 128K y 60,8 tok/s a 200K, con thinking desactivado y concurrencia uno, segun el stack validado por el autor. No son extrapolables a otros runtimes o hardware.
- El backend K8/V4 (INT8 en K, INT4 empaquetado en V sobre capas de atencion completa) es un parche separado y no forma parte de los ficheros de pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wrapzii/Swift-1.5-Qwen3.8-27b-GPTQ-Int4-baked-v1-embed-int8 | 27,78 B | AutoRound INT4 + GPTQ INT4 head/MTP + INT8 embedding | No disponible (pruebas hasta 200K) | swift-open-license-1.0 | HuggingFace, vLLM/XPU |
| ukisai/Swift-1.5-Qwen3.8-27b-INT4 | ~27 B | INT4 (AutoRound) | No disponible | swift-open-license-1.0 | HuggingFace |
| ukisai/Swift-1.5-Qwen3.8-27b-W4A16-AutoRound | ~27 B | W4A16 AutoRound | No disponible | swift-open-license-1.0 | HuggingFace (modelo base directo) |
| ultimaterex/Swift-1.5-Qwen3.8-27B-Uncensored-W4A16-AutoRound | ~27 B | W4A16 AutoRound | No disponible | No disponible | HuggingFace |
| Launch80/Qwen3.8-27B-GPTQ-Int4-baked-v2 | ~27 B | GPTQ INT4 con bake | No disponible | No disponible | HuggingFace (referencia de enfoque) |

La comparativa se limita a variantes de la misma familia (Swift 1.5 / Qwen3.8-27B) porque las fuentes consultadas no aportan datos de modelos comparables de otros desarrolladores con especificaciones contrastables.

## Limitaciones y advertencias

- Derivado, no modelo original: no se ha realizado ajuste fino ni mezcla; hereda las caracteristicas y sesgos del checkpoint `ukisai/Swift-1.5-Qwen3.8-27b-W4A16-AutoRound` y, en ultima instancia, de Qwen3.8-27B.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad para este derivado.
- Sesgos conocidos: no disponible informacion especifica sobre sesgos de este checkpoint.
- Compatibilidad fuera del runtime probado: no establecida. El ahorro de memoria residente del embedding INT8 depende de un parche de runtime concreto y del fichero lateral; sin el, no se obtiene.
- Advertencia del autor: las cifras de rendimiento corresponden a su stack validado con backend K8/V4, MTP6, graphs y configuracion de serving, y no garantizan esos valores en otros runtimes o hardware.
- Precision mixta: no es una conversion INT4 de todos los tensores; las activaciones del cuerpo AutoRound no se recuantizan en la conversion del checkpoint.
- Idiomas: no se especifica la cobertura linguistica, por lo que no puede confirmarse su comportamiento en castellano u otros idiomas.
- Licencia swift-open-license-1.0: es necesario revisar el fichero LICENSE del repositorio para conocer las condiciones exactas de uso comercial, ya que HuggingFace la etiqueta como "other".
- Sin datos de benchmarks independientes: las puntuaciones de origen no se han reestablecido para este derivado, y las cifras de mejora de Swift 1.5 proceden de UkisAI, con discrepancia entre fuentes (9,18x frente a 1,95x de aceleracion).
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta; sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wrapzii/Swift-1.5-Qwen3.8-27b-GPTQ-Int4-baked-v1-embed-int8
- Modelo base directo: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-W4A16-AutoRound
- Variante INT4 de referencia de UkisAI: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-INT4
- Swift 1.5 Qwen3.8-27B (pagina de UkisAI): https://ukisai.com/swift-1-5-27b
- Modelos de UkisAI: https://ukisai.com/models
- Variante Uncensored de ultimaterex: https://huggingface.co/ultimaterex/Swift-1.5-Qwen3.8-27B-Uncensored-W4A16-AutoRound
- Referencia de enfoque (Launch80/Qwen3.8-27B-GPTQ-Int4-baked-v2): https://huggingface.co/Launch80/Qwen3.8-27B-GPTQ-Int4-baked-v2
- Repositorio de tooling K8/V4 XPU: https://github.com/Wrapzii/k8v4-xpu
- Herramienta de bake GPTQ adaptada (launch80/B65): https://github.com/launch80/B65
- Texto de calibracion WikiText-2 (mirror de PyTorch examples): https://raw.githubusercontent.com/pytorch/examples/main/word_language_model/data/wikitext-2/valid.txt
- Ficha de despliegue en Featherless: https://featherless.ai/models/ukisai/Swift-1.5-Qwen3.8-27b
