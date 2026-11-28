# typhoon-ai/typhoon-ocr2-2b

## Resumen

Typhoon OCR V2 2B es un modelo de vision-lenguaje especializado en el analisis y parseo de documentos en tailandes e ingles, desarrollado por Typhoon AI (OpenTyphoon). Dada una imagen de una pagina, devuelve los elementos de maquetacion en orden de lectura, cada uno con una categoria (13 tipos distintos, como titulo, texto, tabla, formula, cabecera o pie), una caja delimitadora (bounding box) y su texto. Las tablas se emiten como HTML, las formulas como LaTeX y el resto del texto como Markdown. Ademas del parseo, el modelo responde preguntas libres sobre un documento (VQA), clasifica documentos, extrae informacion clave a JSON y lee tablas, formulas y graficos de forma aislada.

Se trata de un fine-tune de Infinity-Parser2-Flash (infly), construido sobre la arquitectura Qwen3.5 (`Qwen3_5ForConditionalGeneration`) con 2.213.241.664 parametros en BF16. El entrenamiento combino supervised fine-tuning sobre datos tailandeses curados y datos publicos en ingles y chino, seguido de una etapa de GRPO con recompensas que penalizan con cero las salidas que alcanzan el limite de tokens, dirigida a corregir bucles de repeticion en paginas fotografiadas.

Su relevancia radica en que parte de un parser ya solido en ingles y chino pero debil en tailandes (61,3 en MDPBench para paginas tailandesas) y eleva esa puntuacion 20 puntos hasta 81,3, sin degradar el ingles (que sube de 75,4 a 78,4). Se publica junto a una variante menor de 0,8B y con soporte para GGUF, MLX, Ollama y un paquete Python propio, lo que facilita su despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), vision-lenguaje |
| Parametros totales | 2.213.241.664 (2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, INT8, INT4 (GGUF); MLX 8-bit, MLX 4-bit, MLX bf16 |
| Idiomas soportados | Tailandes (th), ingles (en); datos de entrenamiento incluyen chino, no evaluado por separado |
| Licencia | Apache 2.0 (sujeto a los Terminos y Condiciones de OpenTyphoon) |
| Formato de pesos | safetensors (transformers); GGUF (llama.cpp); MLX |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3.5, concretamente la clase `Qwen3_5ForConditionalGeneration`, afinado a partir de Infinity-Parser2-Flash. Recibe como entrada una unica imagen de pagina; fue entrenado con imagenes de hasta 4 MP, aunque los resultados de benchmark se obtuvieron con imagenes de hasta 16,7 MP. La salida es una lista JSON de elementos de maquetacion dentro de un bloque de codigo `json`.

El proceso de entrenamiento tuvo dos fases. Primero, supervised fine-tuning sobre datos tailandeses curados combinados con datos publicos en ingles y chino. Despues, una etapa de GRPO (optimizacion de politica con recompensas de grupo) mediante un adaptador LoRA que se fusiono en los pesos en fp32 y se almaceno en bf16. Las recompensas de GRPO asignan cero a las salidas que alcanzan el limite de tokens, atacando especificamente los bucles de repeticion que aparecen en paginas fotografiadas. El modelo exige vLLM 0.30.0 o superior y recomienda ampliar a 1600 px cualquier imagen cuyo lado largo sea inferior a esa cifra.

## Capacidades

- Parseo de documentos con maquetacion: devuelve elementos en orden de lectura con categoria (13 tipos), bounding box y texto.
- Conversion de tablas a HTML y de formulas a LaTeX; el resto del texto se emite en Markdown.
- Generacion de Markdown a partir del JSON, con o sin cabeceras y pies, mediante unas pocas lineas de codigo.
- Visual question answering (VQA) de forma libre sobre el contenido de un documento.
- Clasificacion de documentos.
- Extraccion de informacion clave a JSON.
- Lectura aislada de tablas, formulas y graficos (conversion de grafico a datos).
- Procesamiento robusto de paginas fotografiadas, tras el entrenamiento con GRPO.
- Capacidades multilingues limitadas a tailandes e ingles (con chino presente en entrenamiento).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agentico en la informacion disponible.

## Casos de uso

- Digitalizacion de archivos administrativos tailandeses: el modelo convierte imagenes de paginas escaneadas en elementos estructurados con posiciones, lo que permite reconstruir el documento con maquetacion y facilitar la busqueda sobre el texto extraido.
- Procesamiento de facturas y formularios: la extraccion de informacion clave a JSON permite mapear campos concretos (importes, fechas, emisores) directamente a un esquema de base de datos sin postprocesado manual.
- Extraccion de tablas financieras: al emitir tablas en HTML, se integra en pipelines de analitica que convierten el HTML en DataFrames para su carga en almacenes de datos.
- Conversion de documentos cientificos y tecnicos: las formulas se emiten en LaTeX, lo que permite reutilizarlas en publicaciones, entornos de edicion matematica o motores de renderizado.
- Atencion al cliente sobre documentacion: el modelo responde preguntas libres sobre un documento (VQA), adecuado para asistentes que resuelven dudas sobre contratos, manuales o polizas en tailandes e ingles.
- Clasificacion automatica de correspondencia: la capacidad de clasificar documentos permite enrutar facturas, contratos o informes a los flujos de trabajo correspondientes dentro de un sistema de gestion documental.
- Digitalizacion de material fotografiado con movil: el entrenamiento especifico contra bucles de repeticion en paginas fotografiadas (MDPBench fotografiadas de 65,3 a 79,7) lo hace apto para capturas con camara en lugar de escaner.
- Despliegue en entornos con recursos limitados: la variante de 0,8B y las versiones GGUF/INT4 permiten ejecutar el parseo en hardware modesto o en local.

## Benchmarks y rendimiento

Comparativa con el modelo base, ejecutada con el mismo prompt, configuracion y scripts, con vLLM 0.27.1 en modo eager:

| Benchmark | Infinity-Parser2-Flash | Typhoon OCR V2 2B | Cambio |
|---|---:|---:|---|
| MDPBench, paginas tailandesas (mayor es mejor) | 61,3 | 81,3 | +20,0 |
| MDPBench, paginas inglesas (mayor es mejor) | 75,4 | 78,4 | +3,0 |
| MDPBench, paginas fotografiadas (mayor es mejor) | 65,3 | 79,7 | +14,4 |
| MDPBench, paginas digitales (mayor es mejor) | 78,9 | 81,3 | +2,4 |
| MDPBench, global (mayor es mejor) | 68,3 | 79,8 | +11,5 |
| ThaiOCRBench (mayor es mejor) | 35,0 | 59,9 | +24,9 |
| SEA-DocBench, tailandes NED (menor es mejor) | 0,1268 | 0,1059 | −0,0209 (mejor) |
| SEA-DocBench, ingles NED (menor es mejor) | 0,1264 | 0,1248 | −0,0016 (mejor) |
| olmOCR-bench (mayor es mejor) | 84,4 | 84,7 | +0,3 |
| OmniDocBench v1.6 (mayor es mejor) | 91,03 | 90,97 | −0,06 |

Respecto a la version anterior (Typhoon OCR 1.5 2B), la model card reporta: MDPBench de 66,0 a 79,8 (tailandes de 68,9 a 81,3), olmOCR-bench de 62,0 a 84,7, OmniDocBench v1.6 de 70,97 a 90,97 y SEA-DocBench NED de 0,1726 a 0,1153 (menor es mejor). En ThaiOCRBench, que cubre VQA, clasificacion y extraccion, la puntuacion sube de 40,5 a 59,9.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 2,2B parametros en BF16 el peso ronda los 4,5 GB (tamano del repo), por lo que se necesita margen adicional para el procesamiento de imagenes de alta resolucion.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; el autor exige vLLM 0.30.0 o superior, lo que implica GPUs compatibles con esa version.
- Cabe en GPU de consumo: si, en principio, dado el tamano de 2B; las versiones GGUF (INT8/INT4) y MLX (8-bit/4-bit) reducen aun mas los requisitos, aunque no se publican cifras exactas de VRAM.
- Opciones de despliegue: vLLM (>= 0.30.0), llama.cpp mediante los pesos GGUF, Ollama (`ollama run SuraponOCR/typhoon-ocr2-2b`, con tags `bf16`, `int8` e `int4`), MLX (bf16, 8-bit y 4-bit), y el paquete Python `typhoon-ocr2`. Tambien disponible via API compatible con OpenAI en `https://api.opentyphoon.ai/v1` con el modelo `typhoon-ocr-v2`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | MDPBench global | Licencia | Formatos |
|---|---|---:|---:|---|---|
| Typhoon OCR V2 2B | 2,2B | th, en (ch en entrenamiento) | 79,8 | Apache 2.0 + TyC OpenTyphoon | safetensors, GGUF, MLX |
| Infinity-Parser2-Flash (base) | no disponible | en, zh (debil en th) | 68,3 | no disponible | safetensors |
| Typhoon OCR 1.5 2B (version anterior) | 2B | th, en | 66,0 | no disponible | no disponible |
| Typhoon OCR V2 0.8B | 0,8B | th, en | no disponible | Apache 2.0 | no disponible |

No se dispone de datos de otros parsers de documentos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: el modelo esta entrenado y evaluado para tailandes e ingles; el chino aparece en los datos de entrenamiento pero no se evaluo por separado. No hay soporte documentado para castellano.
- Imagenes pequenas: es obligatorio ampliar a 1600 px cualquier imagen cuyo lado largo sea inferior a esa cifra antes de la inferencia; el paquete `typhoon-ocr2` lo hace automaticamente, pero un uso manual sin este paso degrada los resultados.
- Bucles de repeticion: aunque la etapa GRPO los mitiga en paginas fotografiadas, el propio autor los identifica como problema previo; conviene monitorizar salidas que alcancen el limite de tokens en produccion.
- Alucinacion: no se documenta una evaluacion especifica de alucinacion en la informacion disponible; en tareas de extraccion a JSON y VQA conviene validar las salidas contra el documento original.
- Licencia: Apache 2.0, pero el uso esta sujeto a los Terminos y Condiciones de OpenTyphoon; es necesario revisar dichos terminos antes de un uso comercial.
- Version de vLLM: requiere vLLM 0.30.0 o superior; versiones anteriores pueden no funcionar correctamente.
- Contexto: la longitud de contexto no se especifica, lo que limita la planificacion de documentos muy extensos o de multiples paginas en una sola llamada.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Modelo base: https://huggingface.co/infly/Infinity-Parser2-Flash
- Variante 0.8B: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
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
- Terminos y condiciones: https://opentyphoon.ai/tac
- Sitio web: https://opentyphoon.ai
