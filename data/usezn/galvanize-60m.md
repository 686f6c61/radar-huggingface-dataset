# usezn/Galvanize-60M

## Resumen

Galvanize-60M es un clasificador de texto de 60.123.649 parametros, desarrollado por el usuario usezn, disenado especificamente para detectar ataques de prompt injection, sobrescritura de instrucciones y smuggling de delimitadores en flujos de agentes autonomos y pipelines de herramientas basados en Model Context Protocol (MCP). No es un modelo generativo: su unica funcion es emitir una clasificacion binaria (benigno o malicioso) sobre una entrada de texto o un esquema de herramienta estructurado.

Tecnicamente deriva de `answerdotai/ModernBERT-base` mediante destilacion estructural, conservando unicamente 4 de las 12 capas del transformer original, lo que reduce el coste de inferencia a menos de 15 ms por peticion en un solo nucleo de CPU. Incorpora Rotary Position Embeddings (RoPE) nativos para soportar hasta 8.192 tokens de contexto y una capa de pooling propia denominada MultiHeadSecurityPooling, pensada para evitar la colision de representaciones cuando una carga maliciosa va envuelta en sintaxis valida (JSON, SQL, fragmentos de codigo).

Su relevancia actual radica en el hueco que ocupa: los clasificadores de seguridad genericos tratados como detectores de inyeccion producen tasas de falsos positivos muy altas sobre esquemas de tool calling legitimos (el 90,33% en el caso de ProtectAI-DeBERTa-v3 segun la propia model card), lo que rompe agentes en produccion. Galvanize-60M fue entrenado con pares negativos estructurados precisamente para no dispararse ante JSON de argumentos o consultas validas, con una licencia Apache 2.0 y un peso INT8 de 176 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT) destilado a 4 capas, con RoPE y MultiHeadSecurityPooling |
| Parametros totales | 60.123.649 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (RoPE nativo) |
| Tipos de cuantizacion | FP32 y INT8 (grafo ONNX `onnx/model_quantized.onnx`) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |
| Tarea | text-classification (clasificacion binaria de prompt injection) |
| Modelo base | answerdotai/ModernBERT-base (Apache 2.0) |
| Tamano del repositorio | 0,4 GB |
| Dimension de la representacion agrupada | 3.072 (4 queries x 768) |
| Umbral de decision por defecto | tau = 0,80 |

## Arquitectura y entrenamiento

Galvanize-60M parte de `answerdotai/ModernBERT-base` y aplica una destilacion estructural que recorta el encoder de 12 a 4 capas, manteniendo los Rotary Position Embeddings nativos que permiten procesar secuencias de hasta 8.192 tokens sin truncar. Sobre la salida del encoder sustituye el pooling habitual (CLS o media) por MultiHeadSecurityPooling: cuatro queries aprendidas atienden sobre las 8.192 posiciones y sus resultados se concatenan en un vector de 3.072 dimensiones. El motivo declarado es que el pooling convencional colapsa la representacion cuando conviven sintaxis valida y una instruccion maliciosa, lo que provoca tanto falsos rechazos de JSON legitimo como falsos negativos de payloads ofuscados.

El entrenamiento se realizo con un objetivo combinado de entropia cruzada y margin ranking loss frente a un conjunto formado por suites adversariales de seguridad certificadas y esquemas benignos de function calling, con enfasis en la invariancia al wrapper (es decir, que la deteccion no dependa del formato que envuelve la carga). No se indica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO. La model card menciona que la evaluacion se hizo sobre particiones ciegas (blind test splits) frente a 9 puertas de validacion de seguridad industrial.

## Capacidades

- Clasificacion binaria de prompt injection en texto plano y en cargas embebidas.
- Deteccion de sobrescritura de instrucciones (por ejemplo, "Ignore all previous instructions").
- Deteccion de smuggling de delimitadores y de etiquetas falsas de sistema (`<system>...`).
- Alta precision sobre esquemas de tool calling estructurados (JSON con parametros, consultas SQL, fragmentos de codigo), evitando falsos positivos.
- Recuperacion de inyecciones profundas fuera de distribucion (OOD) y de payloads en posiciones lejanas dentro de ventanas largas de 2.000 a 8.000 tokens.
- Inferencia en CPU con latencia de milisegundos, apta para actuar como guardrail en linea.
- No genera texto, no razona, no hace tool calling y no realiza multiples pasos: es exclusivamente un clasificador.
- No esta calibrado para discurso toxico, discurso de odio ni categorizacion tematica generica.

## Casos de uso

- Guardrail de entrada en agentes autonomos: colocar Galvanize-60M delante del LLM principal para rechazar peticiones con instrucciones maliciosas antes de que lleguen al modelo generativo, con 11,52 ms de latencia FP32 en un nucleo de CPU, lo que permite evaluarlo en linea sin GPU.
- Proteccion de pipelines MCP: validar cada invocacion de herramienta y cada esquema de argumentos JSON antes de ejecutarla, aprovechando su tasa de falsa alarma del 0,53% sobre herramientas benignas para no romper flujos legitimos.
- Filtrado de contenido recuperado (RAG): analizar documentos, paginas web o resultados de busqueda antes de inyectarlos en el contexto del modelo, detectando inyecciones indirectas escondidas en texto de terceros.
- Deteccion de inyecciones en ventanas largas: inspeccionar prompts de hasta 8.192 tokens, caso en el que los clasificadores limitados a 512 tokens (ProtectAI-DeBERTa-v3 o Meta-Prompt-Guard) simplemente truncan y pierden el ataque.
- Auditoria y monitorizacion de seguridad: procesar logs de conversaciones de agentes en lote para marcar intentos de injection y alimentar alertas o informes de seguridad, con un coste de computo minimo.
- Defensa en profundidad en pasarelas de API: integrar el modelo INT8 ONNX (176 MB) como paso de validacion en un API gateway o en un servicio serverless que no disponga de GPU.
- Evaluacion de robustez de otros sistemas: usarlo como juez auxiliar en pruebas internas de red teaming para medir con que frecuencia un prompt ataca correctamente a un agente propio.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a evaluaciones de seguridad, no a benchmarks de conocimiento general (MMLU, HumanEval o GSM8K no aplican a un clasificador de este tipo y no se han publicado para este modelo).

| Benchmark / metrica | Galvanize-60M (zn) | ProtectAI-DeBERTa-v3 | Meta-Prompt-Guard-2-86M | Meta-Prompt-Guard-2-22M |
|---|---|---|---|---|
| Tool false positive rate (FPR) | 1,00% (0,67% con tau=0,80) | 90,33% (falla en tool calls) | no publicado | no publicado |
| Tool benign false alarm rate | 0,53% | 88,90% | no publicado | no publicado |
| Deep injection recall (OOD Deepset) | 91,60% | 20,42% | 9,58% | 8,33% |
| Long needle recall (2.000-8.000 tokens) | 77,00% - 97,00% | 1,00% (trunca a 512) | 7,00% (trunca a 512) | 5,00% (trunca a 512) |
| Latencia de inferencia (p50, un nucleo CPU) | 11,52 ms (FP32) / 18,18 ms (INT8) | 55,79 ms | 45,36 ms | 24,12 ms |
| Ventana de contexto soportada | 8.192 tokens | 512 tokens | 512 tokens | 512 tokens |
| Huella de despliegue | 176 MB (INT8 ONNX) | ~440 MB | ~340 MB | ~90 MB |

## Requisitos de hardware

- Inferencia en CPU: es el escenario principal. El repositorio incluye un grafo INT8 ONNX ejecutable con ONNX Runtime; la model card reporta 11,52 ms p50 en FP32 y 18,18 ms en INT8 sobre un unico nucleo de CPU.
- VRAM: al ser un modelo de 60 M de parametros, la huella es minima. Los pesos FP32 ocupan aproximadamente 240 MB y la version INT8 ONNX unos 176 MB; puede ejecutarse en GPU con menos de 1 GB de VRAM o directamente en memoria RAM.
- GPU recomendadas: no necesita GPU dedicada. Cualquier GPU consumer modesta (por ejemplo, GTX 1060, RTX 3060 o superior) sobra para lotes grandes; en entornos de servidor, cualquier A100, H100 o L4 puede batchear miles de peticiones por segundo.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual, e incluso en CPU sin acelerador.
- Opciones de despliegue: ONNX Runtime (ruta recomendada, con `onnx/model_quantized.onnx`), `transformers` con PyTorch, y servidores de inferencia compatibles con `text-classification` (por ejemplo, Text Embeddings Inference o endpoints compatibles indicados en las tags). vLLM o llama.cpp no aplican porque no es un modelo generativo.
- Latencia y throughput: 11,52 ms p50 en FP32 y 18,18 ms p50 en INT8 en un solo nucleo de CPU; en hardware con varios nucleos o GPU el throughput escala con el tamano de lote, aunque no se publican cifras de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FPR en tool calls | Recall OOD | Licencia | Huella |
|---|---|---|---|---|---|---|
| Galvanize-60M | 60 M | 8.192 tokens | 1,00% | 91,60% | Apache 2.0 | 176 MB INT8 |
| ProtectAI-DeBERTa-v3 | no disponible | 512 tokens | 90,33% | 20,42% | no disponible | ~440 MB |
| Meta-Prompt-Guard-2-86M | 86 M | 512 tokens | no publicado | 9,58% | no disponible | ~340 MB |
| Meta-Prompt-Guard-2-22M | 22 M | 512 tokens | no publicado | 8,33% | no disponible | ~90 MB |

La diferencia practica mas relevante es la ventana de contexto: los tres alternativos truncan a 512 tokens, de modo que pierden cualquier inyeccion colocada mas alla de esa posicion, mientras que Galvanize-60M procesa hasta 8.192 tokens. La segunda diferencia es el FPR sobre esquemas de herramientas: el 90,33% de ProtectAI-DeBERTa-v3 implicaria rechazar casi cualquier tool call legitimo, algo inviable en produccion.

## Limitaciones y advertencias

- Especificidad de tarea: es un clasificador binario de prompt injection; no genera texto, no razona, no hace tool calling y no esta calibrado para toxicidad, discurso de odio ni categorizacion tematica.
- Recorte de capas: reducir de 12 a 4 capas habilita latencias inferiores a 15 ms en CPU, pero degrada la Matizacion semantica general frente a encoders completos; puede perder ataques que dependan de contexto sutil.
- Calibracion del umbral: el umbral por defecto es tau = 0,80. Subirlo reduce falsos positivos a costa de recall; bajarlo maximiza recall a costa de mas rechazos en prompts borderline. Conviene recalibrar sobre el dominio propio.
- Riesgo de falsos negativos: el recall en inyecciones profundas OOD es del 91,60% y cae al rango 77%-97% en la prueba de aguja larga, por lo que no debe usarse como unica capa de defensa.
- Idioma: solo ingles. Las inyecciones en otros idiomas, incluido el castellano, no estan cubiertas por el entrenamiento y su deteccion no esta garantizada.
- Alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea (falsos positivos y falsos negativos) sobre entradas fuera de distribucion.
- Dependencia del wrapper: el modelo esta optimizado para invariancia al wrapper, pero cambios de formato extremos en el prompt pueden degradar la precision.
- Licencia: Apache 2.0, lo que permite uso comercial y privado, con la obligacion habitual de conservar avisos y atribucion; el modelo base ModernBERT-base tambien es Apache 2.0.
- Madurez: el repositorio tiene 0 descargas y 1 like en el momento de la consulta; conviene validar en un entorno controlado antes de desplegarlo en produccion.
- Sin datos publicados sobre sesgos demograficos ni sobre rendimiento en dominios distintos de los conjuntos de validacion de seguridad declarados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/usezn/Galvanize-60M
- Modelo base ModernBERT: https://huggingface.co/answerdotai/ModernBERT-base
- Paper de referencia (ModernBERT): https://arxiv.org/abs/2412.13663

Nota: la busqueda web realizada no devolvio enlaces relevantes para este modelo; los unicos resultados fueron servicios de traduccion genericos (Google Translate y DeepL), sin relacion con Galvanize-60M.
