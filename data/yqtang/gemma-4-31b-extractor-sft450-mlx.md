# yqtang/gemma-4-31b-extractor-sft450-mlx

## Resumen

SFT450 es un adaptador LoRA de extraccion de informacion estructurada para el modelo Gemma 4 31B IT de Google, publicado por el usuario yqtang en Hugging Face. El adaptador se ha entrenado mediante ajuste fino supervisado (SFT) para convertir pasajes de texto en JSON con afirmaciones autocontenidas y citas textuales de respaldo, orientado a tareas de extraccion documental como contratos, facturas, informes financieros o listados de pagos. Se distribuye como adaptador sobre una base compartida cuantizada a 3 bits en formato MLX, pensada para ejecutarse en Macs con Apple Silicon.

El modelo resuelve un problema concreto: dada una instruccion de extraccion y un pasaje fuente, devolver un array JSON donde cada objeto contiene una afirmacion (`text`) y una cita literal contigua (`source_quote`) que la respalda, preservando condiciones, participantes y grado de certeza del original, y devolviendo `[]` cuando no hay evidencia. Es relevante porque combina un modelo base de 31B con un adaptador ligero (1.998.848 parametros entrenables, unos 8 MB en disco) que se puede intercambiar sobre la misma base sin recargar el modelo completo, lo que abarata el despliegue de variantes especializadas en extraccion documental.

La ficha se basa exclusivamente en la model card publicada por el autor. No hay informacion sobre el proceso de entrenamiento mas alla de la continuacion desde el adaptador ContractNLI124, ni sobre el numero de tokens, composicion del dataset o metodos de alineacion adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 31B IT) con adaptador LoRA sobre proyecciones query y output de las ultimas 8 capas de atencion |
| Parametros totales | No disponible para la base; adaptador con 1.998.848 parametros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base en 3 bits afina, group-size 64; adaptador en safetensors (BF16 presumiblemente, no especificado) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX); base compartida en MLX 3-bit |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 4 31B IT, un transformer denso de 31.000 millones de parametros. El LoRA tiene rango 8, escala 16 y dropout 0, y ataca unicamente las proyecciones query y output de las ultimas ocho capas de atencion, lo que explica su tamano reducido (1.998.848 parametros entrenables, 7.999.349 bytes en disco). La base sobre la que se monta es una conversion afina de 3 bits con group-size 64 del checkpoint BF16 publicado por MLX Community, lo que reduce el peso en disco a unos 13,46 GB.

El entrenamiento es un ajuste fino supervisado (SFT) que continua desde el adaptador ContractNLI124, anadiendo pasajes, peticiones, respuestas correctas y citas fuente. El dataset de referencia publico contiene 84 ejemplos de extraccion (`yqtang/document-extraction-84`). No se especifican el numero total de tokens de entrenamiento, la composicion completa del dataset, ni si hubo RLHF o DPO. La innovacion principal no es arquitectonica sino de despliegue: el uso de una base compartida cuantizada a 3 bits con adaptadores intercambiables, de modo que cambiar de adaptador reutiliza la base cacheada en la misma revision.

## Capacidades

- Extraccion de informacion estructurada: dado un pasaje y una instruccion, devuelve un array JSON de objetos con `text` y `source_quote`.
- Generacion de citas literales: cada afirmacion debe ir respaldada por una cita contigua y verbatim del texto fuente.
- Manejo de ausencia de evidencia: devuelve `[]` cuando el pasaje no contiene soporte para la afirmacion solicitada.
- Preservacion de condiciones, participantes y grado de certeza del texto original.
- Generacion de texto general heredada del modelo base Gemma 4 31B IT (no evaluada especificamente en esta ficha).
- Procesamiento de documentos escaneados solo tras OCR previo (el autor menciona Apple Vision OCR en su evaluacion).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Extraccion de clausulas contractuales: introducir un contrato y una peticion como "extrae las obligaciones del proveedor" para obtener JSON con afirmaciones y citas textuales que permitan auditoria legal sin reescribir el texto original.
- Procesamiento de facturas y ordenes de compra: extraer campos estructurados (importes, fechas, partes) con cita de respaldo para validacion en pipelines de cuentas a pagar.
- Analisis de informes financieros (SEC filings, informes energeticos): extraer afirmaciones verificables con su cita, util para revisiones de cumplimiento donde la trazabilidad al texto fuente es obligatoria.
- Enriquecimiento de bases documentales: convertir documentos no estructurados en registros JSON con evidencia, apto para indexacion y busqueda posterior.
- Verificacion de requisitos normativos: comprobar si un pasaje satisface una condicion (por ejemplo, "el recaudador debe reintentar") y devolver `[]` cuando no hay evidencia, evitando afirmaciones no soportadas.
- Despliegue local en Mac con Apple Silicon: ejecutar la extraccion en una estacion de trabajo con MLX-LM sin depender de la nube, usando 12,52 GiB de memoria MLX activa tras la carga y 16,60 GiB de pico en la prueba inicial de seis documentos.
- Prototipado de variantes de extraccion: intercambiar adaptadores (ContractNLI124, SFT450) sobre la misma base cacheada para comparar comportamientos sin recargar 13,46 GB de pesos.

## Benchmarks y rendimiento

Evaluacion del autor sobre seis documentos de ExtractBench (uno por tipo: orden de compra, rate card, calendario de subvenciones, presentacion de participaciones SEC, informe energetico y lista de desembolsos publicos), con el verificador oficial y OCR de Apple Vision. La columna LlamaExtract Agentic usa las predicciones publicadas por el proveedor.

| Resultado en seis documentos | ContractNLI124 | SFT450 | LlamaExtract Agentic |
|---|---:|---:|---:|
| F1 medio de valores, limite inicial de 4.096 tokens de salida | 61,10% | 61,67% | 99,00% |
| F1 medio de valores, tras ampliar el limite en dos tablas | 90,96% | 94,01% | 99,00% |
| Documentos totalmente correctos con limites ampliados | 0/6 | 0/6 | 3/6 |

Ambos adaptadores alcanzaron el limite inicial en las dos tablas largas y devolvieron JSON incompleto, que recibio cero credito. En una segunda pasada se elevo el limite a 16.384 tokens para el filing SEC y a 32.768 para la lista de desembolsos, manteniendo los otros cuatro resultados. En la lista de desembolsos (7 campos a nivel de documento mas 213 comprobaciones de 7 campos cada una, 1.498 valores puntuados), el verificador acerto 1.493 de los 1.498 valores de SFT450 (F1 99,67%) y 1.497 de 1.498 de LlamaExtract (F1 99,93%), sin que ninguno de los dos fuera completamente correcto en ese documento. El F1 de valores mide exactitud de campos y no evalua si cada afirmacion tiene cita de respaldo.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: 12,52 GiB de memoria MLX activa tras cargar la base 3-bit con un adaptador; 16,60 GiB de pico en la prueba inicial de seis documentos. El consumo depende de la longitud de entrada y salida.
- Descarga inicial: unos 13,47 GB (13,46 GB de base compartida y 8 MB de adaptador).
- GPU recomendadas: Apple Silicon con memoria unificada; el autor probo en un Apple M5 Max con 128 GiB. No se ha probado en un Mac de 18 GB.
- Cabe en GPU consumer: si, en Macs Apple Silicon con memoria unificada suficiente (el autor no confirma el minimo; 18 GB no esta testeado). No se documenta soporte para GPU NVIDIA.
- Opciones de despliegue: MLX y MLX-LM (versiones probadas: mlx 0.31.2, mlx-lm 0.31.3, transformers 5.9.0, huggingface-hub 1.16.4, Python 3.11). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en ExtractBench (6 docs) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SFT450 (este) | Base 31B + LoRA 2M | No disponible | F1 94,01% con limites ampliados; 0/6 documentos perfectos | Apache-2.0 | Hugging Face, MLX |
| ContractNLI124 | Base 31B + LoRA 2M | No disponible | F1 90,96% con limites ampliados; 0/6 perfectos | Apache-2.0 (presumible, no confirmado) | Hugging Face, MLX |
| LlamaExtract Agentic | No disponible | No disponible | F1 99,00%; 3/6 perfectos | No disponible | Pipeline comercial de LlamaIndex |

La comparativa se limita a los datos publicados por el autor; no hay informacion sobre otros adaptadores de extraccion comparables ni sobre el rendimiento de la base Gemma 4 31B IT sin adaptador en esta tarea.

## Limitaciones y advertencias

- Solo soporta ingles (`en`); no se documenta multilinguismo.
- Sensibilidad al limite de tokens de salida: con 4.096 tokens los documentos con tablas largas devuelven JSON incompleto y reciben cero credito, como ocurrio en 2 de los 6 documentos de la evaluacion.
- Ningun documento de los seis evaluados fue completamente correcto con SFT450; el F1 de valores no mide la calidad de las citas de respaldo.
- Requiere OCR previo para paginas escaneadas; el modelo no procesa imagenes directamente.
- Rendimiento inferior al pipeline comercial LlamaExtract Agentic en la misma evaluacion (94,01% frente a 99,00% de F1 medio).
- Riesgo de alucinacion no cuantificado en la informacion disponible; el diseno exige cita literal, pero no se documenta una tasa de citas invalidas.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: adaptador bajo Apache-2.0; la base deriva de Gemma 4 31B IT de Google, cuyos terminos de uso deben respetarse adicionalmente.
- Despliegue limitado a MLX/Apple Silicon en la documentacion; no hay soporte documentado para CUDA, vLLM o llama.cpp.
- El autor no ha probado el modelo en Macs de 18 GB, por lo que el minimo real de memoria no esta confirmado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yqtang/gemma-4-31b-extractor-sft450-mlx
- Base compartida 3-bit: https://huggingface.co/yqtang/gemma-4-31b-it-text-3bit-mlx
- Adaptador de referencia ContractNLI124: https://huggingface.co/yqtang/gemma-4-31b-extractor-contractnli124-mlx
- Dataset de ejemplos de extraccion: https://huggingface.co/datasets/yqtang/document-extraction-84
- Benchmark ExtractBench: https://huggingface.co/datasets/llamaindex/ExtractBench/tree/f9b910906cd7e73cc9eb5379a8d5d935c67b92c4
- Predicciones publicadas de LlamaExtract: https://huggingface.co/datasets/llamaindex/ExtractBench-results/tree/9ca2c6ac9aff8b6c8bd359846d0090bfb739c050/results/llamaextract_agentic
- Revision original de Google Gemma 4 31B IT: https://huggingface.co/google/gemma-4-31B-it/tree/3548789868c5356dbf307c98e6f609007b82b3eb
