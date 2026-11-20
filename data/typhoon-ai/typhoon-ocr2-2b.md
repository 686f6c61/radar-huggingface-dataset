# typhoon-ai/typhoon-ocr2-2b

## Resumen

Typhoon OCR V2 2B es un modelo de visión-lenguaje especializado en el análisis y extracción de documentos (document parsing) para tailandés e inglés, desarrollado por Typhoon AI (OpenTyphoon). Dado el imagen de una página, devuelve los elementos de maquetación en orden de lectura, cada uno con su categoría (13 tipos posibles), su caja delimitadora (bounding box) y su texto; las tablas se emiten como HTML, las fórmulas como LaTeX y el texto restante como Markdown.

El modelo es un fine-tune de Infinity-Parser2-Flash (infly), sobre arquitectura Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con 2.213.241.664 parámetros en BF16. El entrenamiento combina supervisión (SFT) sobre datos tailandeses curados y datos públicos en inglés y chino, seguido de GRPO con un adaptador LoRA fusionado en los pesos, orientado a eliminar bucles de repetición en páginas fotografiadas.

Su relevancia radica en que parte de un parser ya sólido en inglés y chino pero débil en tailandés (61,3 en MDPBench para páginas tailandesas) y eleva esa puntuación 20 puntos hasta 81,3, sin degradar el inglés (de 75,4 a 78,4). Se publica junto a una variante de 0,8B y con versiones GGUF, MLX y Ollama, además de un paquete Python y una API compatible con OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), transformer multimodal image-text-to-text |
| Parametros totales | 2.213.241.664 (2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (principal); GGUF (llama.cpp), MLX 8-bit, MLX bf16, MLX 4-bit; Ollama con tags `bf16`, `int8` e `int4` |
| Idiomas soportados | Tailandés (th) e inglés (en); los datos de entrenamiento incluyen chino, no evaluado por separado |
| Licencia | Apache 2.0 (sujeto a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | safetensors (repo de 4,5 GB); GGUF y MLX disponibles en repos aparte |
| Entrada | Una imagen de página; entrenado con imágenes de hasta 4 MP, benchmarks con hasta 16,7 MP |
| Salida | Lista JSON de elementos de maquetación dentro de un bloque de código `json` |
| Modelo base | infly/Infinity-Parser2-Flash |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3.5 en su variante `Qwen3_5ForConditionalGeneration`, un transformer multimodal que procesa una imagen de página y genera una secuencia estructurada. La salida es una lista JSON de elementos de maquetación en orden de lectura, cada uno con categoría (13 tipos, como título, texto, tabla, fórmula, encabezado y pie de página), bounding box y contenido textual; las tablas se serializan como HTML, las fórmulas como LaTeX y el resto como Markdown.

El entrenamiento se realizó en dos fases: primero un ajuste supervisado (SFT) sobre datos tailandeses curados combinados con datos públicos en inglés y chino, y después un entrenamiento con GRPO usando un adaptador LoRA que se fusionó en los pesos en fp32 y se almacenó en bf16. La recompensa de GRPO asigna cero a las salidas que alcanzan el límite de tokens, lo que ataca directamente los bucles de repetición que aparecen en páginas fotografiadas. El objetivo declarado fue elevar la precisión en tailandés conservando el rendimiento previo en inglés.

## Capacidades

- Análisis de maquetación con bounding boxes: devuelve cada elemento con categoría y caja, en orden de lectura.
- Extracción de texto a Markdown, con conversión programática desde el JSON (con o sin encabezados y pies de página).
- Reconocimiento de tablas con salida en HTML.
- Reconocimiento de fórmulas con salida en LaTeX.
- Lectura independiente de tablas, fórmulas y gráficos.
- Visual question answering (VQA) sobre documentos: responde preguntas libres sobre el contenido.
- Clasificación de documentos.
- Extracción de información clave a JSON.
- Conversión de gráficos a datos (chart-to-data).
- Capacidades multilingües en tailandés e inglés, con datos de entrenamiento que incluyen chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo procesa páginas escaneadas y devuelve JSON estructurado con categorías y coordenadas, lo que permite reconstruir el documento y alimentar sistemas de gestión documental con precisión de 81,3 en MDPBench para páginas tailandesas.
- Extracción de datos de facturas y formularios: mediante la tarea de key-information extraction a JSON, se pueden mapear campos concretos del documento a un esquema fijo, útil en pipelines de contabilidad y back office.
- Procesamiento de documentos fotografiados con móvil: gracias al entrenamiento GRPO contra bucles de repetición y a la mejora de 14,4 puntos en páginas fotografiadas de MDPBench (de 65,3 a 79,7), es adecuado para capturas con cámara en campo.
- Conversión de tablas a datos estructurados: la salida HTML de tablas permite parsearlas posteriormente a CSV o bases de datos, útil en informes financieros y técnicos bilingües.
- Atención al cliente sobre documentos: el modelo responde preguntas libres sobre el contenido de una página (VQA), lo que permite construir asistentes que resuelvan dudas sobre contratos o manuales sin extracción manual previa.
- Clasificación automática de documentos entrantes: la capacidad de clasificación permite enrutar páginas a distintos flujos de trabajo según su tipo antes de aplicar extracción específica.
- Digitalización de material científico y técnico: la conversión de fórmulas a LaTeX facilita la reutilización de contenido matemático en publicaciones y sistemas de edición.
- Despliegue en local con Ollama o llama.cpp: las versiones GGUF e int4 permiten ejecutar el parser en equipos sin GPU de datacenter para volúmenes moderados de documentos.

## Benchmarks y rendimiento

Comparación con el modelo base (Infinity-Parser2-Flash), ejecutados con el mismo prompt, ajustes y scripts, con vLLM 0.27.1 en modo eager:

| Benchmark | Infinity-Parser2-Flash | Typhoon OCR V2 2B | Cambio |
|---|---:|---:|---|
| MDPBench, páginas tailandesas (↑) | 61,3 | 81,3 | +20,0 |
| MDPBench, páginas inglesas (↑) | 75,4 | 78,4 | +3,0 |
| MDPBench, páginas fotografiadas (↑) | 65,3 | 79,7 | +14,4 |
| MDPBench, páginas digitales (↑) | 78,9 | 81,3 | +2,4 |
| MDPBench, global (↑) | 68,3 | 79,8 | +11,5 |
| ThaiOCRBench (↑) | 35,0 | 59,9 | +24,9 |
| SEA-DocBench, tailandés NED (↓) | 0,1268 | 0,1059 | −0,0209 (mejor) |
| SEA-DocBench, inglés NED (↓) | 0,1264 | 0,1248 | −0,0016 (mejor) |
| olmOCR-bench (↑) | 84,4 | 84,7 | +0,3 |
| OmniDocBench v1.6 (↑) | 91,03 | 90,97 | −0,06 |

Comparación con la versión anterior (Typhoon OCR 1.5 2B), según la model card: MDPBench de 66,0 a 79,8 (páginas tailandesas de 68,9 a 81,3), olmOCR-bench de 62,0 a 84,7, OmniDocBench v1.6 de 70,97 a 90,97, SEA-DocBench NED de 0,1726 a 0,1153 y ThaiOCRBench de 40,5 a 59,9.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 GB en BF16 (2,2B parámetros × 2 bytes más overhead de activaciones y visión); alrededor de 2,5 GB en int8 y 1,5 GB en int4.
- GPU recomendadas: A100 o H100 para despliegues de alto throughput con vLLM; RTX 4090 o A10 para servicio de producción moderado.
- GPU de consumo: cabe en tarjetas con 8 GB o más en BF16; en int4 puede ejecutarse en GPUs de 4-6 GB e incluso en CPU vía llama.cpp u Ollama.
- Opciones de despliegue: vLLM (versión 0.30.0 o superior, requisito explícito del autor), llama.cpp (GGUF), Ollama (`ollama run SuraponOCR/typhoon-ocr2-2b`), MLX en Apple Silicon (8-bit, bf16 y 4-bit), y API compatible con OpenAI en `https://api.opentyphoon.ai/v1` con el modelo `typhoon-ocr-v2`.
- Preprocesado obligatorio: ampliar a 1.600 px el lado largo de toda imagen que sea menor, antes de enviarla; el paquete `typhoon-ocr2` lo hace automáticamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | MDPBench global | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Typhoon OCR V2 2B | 2B | th, en (entrenamiento con zh) | 79,8 | Apache 2.0 | HF, GGUF, MLX, Ollama, API |
| Infinity-Parser2-Flash (base) | no disponible | en, zh (débil en th) | 68,3 | no disponible en la información | HF |
| Typhoon OCR 1.5 2B (versión previa) | 2B | th, en | 66,0 | no disponible en la información | HF |
| Typhoon OCR V2 0.8B | 0,8B | th, en | no disponible | no disponible en la información | HF |

## Limitaciones y advertencias

- El modelo está orientado a tailandés e inglés; el chino presente en el entrenamiento no fue evaluado, por lo que su rendimiento en ese idioma es incierto.
- Requiere ampliar imágenes con lado largo inferior a 1.600 px; omitir este paso degrada la calidad de la extracción.
- Entrenado con imágenes de hasta 4 MP, aunque los benchmarks usan hasta 16,7 MP; el comportamiento en resoluciones muy altas no está documentado más allá de esas pruebas.
- El entrenamiento GRPO se dirigió específicamente a bucles de repetición en páginas fotografiadas; otras patologías generativas (alucinación de texto ausente, por ejemplo) no se abordan explícitamente en la información disponible.
- Riesgo de alucinación en documentos degradados, manuscritos o con maquetación atípica: no se han publicado métricas específicas de fidelidad en esos escenarios.
- Aunque la licencia es Apache 2.0, el uso está sujeto a los OpenTyphoon Terms and Conditions, que deben revisarse antes de un despliegue comercial.
- Requiere vLLM 0.30.0 o superior; versiones anteriores pueden no funcionar correctamente.
- La salida es JSON con bounding boxes; los consumidores deben validar el esquema y manejar bloques `json` malformados en producción.
- No se dispone de información sobre soporte de tool calling, agentes o contexto máximo, lo que limita su evaluación en pipelines agénticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Modelo base: https://huggingface.co/infly/Infinity-Parser2-Flash
- Variante 0.8B: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Versión previa 1.5 2B: https://huggingface.co/typhoon-ai/typhoon-ocr1.5-2b
- GGUF: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-GGUF
- MLX 8-bit: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-8bit
- Ollama: https://ollama.com/SuraponOCR/typhoon-ocr2-2b
- Paquete Python: https://pypi.org/project/typhoon-ocr2/
- Código del paquete: https://github.com/srn-source/typhoon-ocr2
- Código de evaluación: https://github.com/srn-source/evaluation_thai_ocr
- Playground: https://playground.opentyphoon.ai/ocr
- Documentación de la API: https://docs.opentyphoon.ai/
- Términos y condiciones: https://opentyphoon.ai/tac
- Web oficial: https://opentyphoon.ai
- Paper (arXiv): https://arxiv.org/abs/2601.14722
