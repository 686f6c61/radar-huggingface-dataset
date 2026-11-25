# typhoon-ai/typhoon-ocr2-2b

## Resumen

Typhoon OCR V2 2B es un modelo de vision-lenguaje especializado en el analisis y parseo de documentos para tailandes e ingles, desarrollado por el equipo de OpenTyphoon (typhoon-ai). Dado una imagen de una pagina, devuelve los elementos de maquetacion en orden de lectura, cada uno con su categoria (13 tipos posibles, como titulo, texto, tabla, formula, cabecera o pie), su caja delimitadora y su texto. Las tablas se emiten como HTML, las formulas como LaTeX y el resto del texto como Markdown.

El modelo parte de Infinity-Parser2-Flash (infly) y se ha afinado con supervisado sobre datos tailandeses curados y datos publicos en ingles y chino, seguido de una etapa de GRPO con LoRA que se fusiona en los pesos. La arquitectura es Qwen3.5 (`Qwen3_5ForConditionalGeneration`) con 2.213.241.664 parametros en BF16. Su relevancia radica en que eleva sustancialmente el rendimiento en tailandes (MDPBench tailandes de 61,3 a 81,3) sin degradar el ingles, y anade capacidades de VQA documental, clasificacion, extraccion a JSON y lectura de graficos.

Se publica bajo licencia Apache 2.0, con versiones GGUF, MLX (bf16, 8-bit y 4-bit), paquete Ollama y una API compatible con OpenAI. Existe tambien una variante menor de 0,8B para parseo de paginas a menor coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), vision-lenguaje |
| Parametros totales | 2.213.241.664 (2B, BF16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, int8, int4 (GGUF y MLX 8-bit/4-bit) |
| Idiomas soportados | Tailandes e ingles (los datos de entrenamiento tambien incluyen chino, no evaluado por separado) |
| Licencia | Apache 2.0 (sujeto a los Terminos y Condiciones de OpenTyphoon) |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3.5 (`Qwen3_5ForConditionalGeneration`) con 2B parametros en BF16, afinado a partir de Infinity-Parser2-Flash. Recibe como entrada una imagen de pagina (entrenado con imagenes de hasta 4 MP; los benchmarks usan hasta 16,7 MP) y produce como salida una lista JSON de elementos de maquetacion dentro de un bloque de codigo `json`.

El entrenamiento consta de dos fases: primero un ajuste supervisado (SFT) sobre datos tailandeses curados y datos publicos en ingles y chino; despues, una etapa de GRPO con un adaptador LoRA que se fusiona en los pesos en fp32 y se almacena en bf16. La recompensa de GRPO asigna cero a las salidas que alcanzan el limite de tokens, con el objetivo de corregir los bucles de repeticion en paginas fotografiadas. No se especifica en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Parseo de documentos con maquetacion y cajas delimitadoras en orden de lectura (13 categorias de elemento).
- Conversion de tablas a HTML y de formulas a LaTeX; el resto del texto en Markdown.
- Generacion de Markdown a partir del JSON (con o sin cabeceras y pies) mediante codigo de conversion.
- Visual question answering libre sobre el documento.
- Clasificacion de documentos.
- Extraccion de informacion clave a JSON.
- Lectura de tablas, formulas y graficos de forma aislada (chart-to-data).
- Capacidad conversacional (tag `conversational`).
- Multilingue limitado a tailandes e ingles (con presencia de chino en entrenamiento).
- No se documenta soporte de tool calling ni de razonamiento agente multi-paso en la informacion disponible.

## Casos de uso

- Digitalizacion de archivos administrativos tailandeses: el modelo extrae cada elemento de la pagina con su caja y categoria, lo que permite reconstruir el documento y buscar por region. Su salto de +20 puntos en MDPBench tailandes lo hace adecuado para corpus donde el OCR generico falla.
- Procesamiento de facturas y formularios: la extraccion de informacion clave a JSON permite mapear campos a un esquema fijo y alimentar sistemas de contabilidad o ERP.
- Conversion de tablas a datos estructurados: la salida HTML de tablas se puede parsear directamente a DataFrames para analitica o migracion de datos.
- Atencion al cliente sobre documentos: la VQA libre permite responder preguntas de usuarios sobre el contenido de una pagina (por ejemplo, condiciones de un contrato) sin pipeline OCR separado.
- Digitalizacion de documentos fotografiados: el entrenamiento con GRPO contra bucles de repeticion y la mejora en paginas fotografiadas (de 65,3 a 79,7 en MDPBench) lo orientan a capturas con movil.
- Clasificacion automatica de documentos entrantes: en un flujo de gestion documental, el modelo asigna categoria a cada pagina antes de enrutarla.
- Extraccion de graficos a datos: la tarea chart-to-data permite recuperar series numericas de graficos en informes.
- Despliegue en local o en el borde: con 2B parametros y versiones GGUF/Ollama (int4) se puede ejecutar en hardware modesto para procesar lotes de paginas.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando con el modelo base (vLLM 0.27.1, modo eager, mismo prompt y ajustes):

| Benchmark | Infinity-Parser2-Flash | Typhoon OCR V2 2B | Cambio |
|---|---:|---:|---|
| MDPBench, paginas tailandesas ↑ | 61,3 | 81,3 | +20,0 |
| MDPBench, paginas inglesas ↑ | 75,4 | 78,4 | +3,0 |
| MDPBench, paginas fotografiadas ↑ | 65,3 | 79,7 | +14,4 |
| MDPBench, paginas digitales ↑ | 78,9 | 81,3 | +2,4 |
| MDPBench, global ↑ | 68,3 | 79,8 | +11,5 |
| ThaiOCRBench ↑ | 35,0 | 59,9 | +24,9 |
| SEA-DocBench, tailandes NED ↓ | 0,1268 | 0,1059 | −0,0209 (mejor) |
| SEA-DocBench, ingles NED ↓ | 0,1264 | 0,1248 | −0,0016 (mejor) |
| olmOCR-bench ↑ | 84,4 | 84,7 | +0,3 |
| OmniDocBench v1.6 ↑ | 91,03 | 90,97 | −0,06 |

Comparado con la version anterior Typhoon OCR 1.5 2B, el autor reporta MDPBench de 66,0 a 79,8, olmOCR-bench de 62,0 a 84,7, OmniDocBench v1.6 de 70,97 a 90,97 y SEA-DocBench NED de 0,1726 a 0,1153.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, aproximadamente 4,5 GB solo para pesos, mas memoria para el procesador de vision y el contexto; en int8 en torno a 2,3 GB y en int4 en torno a 1,2 GB para los pesos.
- GPU recomendadas: A100 y H100 para procesamiento por lotes de alta resolucion (hasta 16,7 MP); RTX 4090 y RTX 3090 para uso individual con margen amplio.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en BF16; con cuantizacion int4 es viable en GPUs de 4-6 GB.
- Opciones de despliegue: vLLM 0.30.0 o superior (requisito explicito del autor), llama.cpp mediante los pesos GGUF, Ollama (`ollama run SuraponOCR/typhoon-ocr2-2b`, tags `bf16`, `int8` e `int4`), MLX en 8-bit, bf16 y 4-bit, y la API de Typhoon (endpoint compatible con OpenAI `https://api.opentyphoon.ai/v1`, modelo `typhoon-ocr-v2`).
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota operativa: es obligatorio ampliar a 1600 px en el lado largo toda imagen que no lo alcance; el paquete `typhoon-ocr2` lo hace automaticamente.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Typhoon OCR V2 2B | 2B | th, en | Parseo con layout, VQA, JSON | Apache 2.0 | HF, GGUF, MLX, Ollama, API |
| Infinity-Parser2-Flash (base) | no disponible | en, zh (mas debil en th) | Parseo de documentos | no disponible | HF |
| Typhoon OCR V2 0.8B | 0,8B | th, en | Parseo de paginas a menor coste | no disponible | HF |
| Typhoon OCR 1.5 2B (version previa) | 2B | th, en | OCR a Markdown sin posiciones | no disponible | HF |

En la informacion disponible no se detallan alternativas externas comparables con cifras de parametros y contexto.

## Limitaciones y advertencias

- Idiomas: solo tailandes e ingles estan soportados y evaluados; el chino aparece en entrenamiento pero no se ha evaluado, y otros idiomas no estan cubiertos.
- Resolucion: las imagenes con lado largo inferior a 1600 px deben ampliarse antes de la inferencia; omitirlo degrada el resultado.
- Bucles de repeticion: el autor documenta que las paginas fotografiadas tienden a producir repeticiones que agotan el limite de tokens; GRPO lo mitiga, pero persiste como riesgo (la recompensa penaliza la salida truncada, no garantiza su ausencia).
- Alucinacion: como modelo generativo, puede inventar texto, cajas o valores en documentos de baja calidad o layouts atipicos; conviene validar la salida JSON contra esquemas.
- Licencia: Apache 2.0, pero el uso esta sujeto a los Terminos y Condiciones de OpenTyphoon; revisar condiciones para uso comercial.
- Versionado de software: requiere vLLM 0.30.0 o superior; versiones anteriores pueden no funcionar.
- Cobertura de benchmarks: los datos publicados se centran en MDPBench, ThaiOCRBench, SEA-DocBench, olmOCR-bench y OmniDocBench; no hay cifras de latencia, throughput ni de contexto maximo.
- Entrada: una sola imagen de pagina por peticion; no se documenta procesamiento multi-pagina nativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Modelo base: https://huggingface.co/infly/Infinity-Parser2-Flash
- Version 0.8B: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Version anterior: https://huggingface.co/typhoon-ai/typhoon-ocr1.5-2b
- GGUF: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-GGUF
- MLX 8-bit: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-8bit
- Ollama: https://ollama.com/SuraponOCR/typhoon-ocr2-2b
- Paquete Python: https://pypi.org/project/typhoon-ocr2/
- Codigo del paquete: https://github.com/srn-source/typhoon-ocr2
- Codigo de evaluacion: https://github.com/srn-source/evaluation_thai_ocr
- Informe tecnico: https://arxiv.org/abs/2611.27494
- Paper adicional: https://arxiv.org/abs/2601.14722
- Demo: https://playground.opentyphoon.ai/ocr
- Documentacion de la API: https://docs.opentyphoon.ai/
- Web: https://opentyphoon.ai
- Terminos y condiciones: https://opentyphoon.ai/tac
