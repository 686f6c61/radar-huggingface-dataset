# Suraponn/typhoon-ocr2-2b

## Resumen

Typhoon OCR V2 2B es un modelo de visión-lenguaje especializado en el análisis y la extracción de documentos (document parsing) para tailandés e inglés. Lo desarrolla el equipo de OpenTyphoon (SCB 10X) y se distribuye bajo licencia Apache 2.0. El modelo recibe la imagen de una página y devuelve una lista JSON de elementos de maquetación en orden de lectura, cada uno con su categoría (13 tipos: título, texto, tabla, fórmula, cabecera, pie, etc.), su caja delimitadora (bounding box) y su contenido textual. Las tablas se emiten como HTML, las fórmulas como LaTeX y el resto del texto como Markdown.

Se trata de un ajuste fino (fine-tune) del modelo base infly/Infinity-Parser2-Flash, con arquitectura Qwen3.5 (`Qwen3_5ForConditionalGeneration`) y 2 213 241 664 parámetros en BF16. El entrenamiento combina supervisión (SFT) sobre datos tailandeses curados más datos públicos en inglés y chino, seguido de una etapa de GRPO con recompensas que penalizan las salidas que alcanzan el límite de tokens, atacando así los bucles de repetición típicos en páginas fotografiadas.

Su relevancia actual radica en que cubre un hueco poco atendido: el OCR de alta precisión en tailandés, un idioma con escritura sin espacios entre palabras y con diacríticos complejos, donde los modelos generalistas rinden bastante peor. Frente a su modelo base, sube 20 puntos en páginas tailandesas de MDPBench (de 61,3 a 81,3) sin degradar el inglés (de 75,4 a 78,4). Se publica junto a una variante de 0,8B y con soporte para GGUF, MLX, Ollama y vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), transformer multimodal visión-lenguaje |
| Parámetros totales | 2 213 241 664 (~2B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (pesos publicados), INT8 e INT4 (tags de Ollama), MLX 8-bit y MLX 4-bit |
| Idiomas soportados | Tailandés (th) e inglés (en); los datos de entrenamiento incluyen chino, no evaluado por separado |
| Licencia | Apache 2.0 (sujeto a los términos de OpenTyphoon) |
| Formato de pesos | safetensors (repo principal), GGUF (llama.cpp), MLX |
| Entrada | Una imagen de página; entrenado con imágenes de hasta 4 MP, evaluación con hasta 16,7 MP |
| Salida | Lista JSON de elementos de maquetación dentro de un bloque de código `json` |
| Modelo base | infly/Infinity-Parser2-Flash (fine-tune) |
| Tamaño del repositorio | 4,5 GB |

## Arquitectura y entrenamiento

El modelo parte de Infinity-Parser2-Flash, un parser visual construido sobre la familia Qwen3.5 con cabecera de generación condicional (`Qwen3_5ForConditionalGeneration`), es decir, un transformer multimodal que proyecta las características de la imagen al espacio de tokens del modelo de lenguaje. La salida es estructurada: el modelo genera directamente el JSON de elementos con categoría, bounding box y texto, lo que permite reconstruir la maquetación de la página y derivar Markdown con o sin cabeceras y pies mediante un postprocesado sencillo.

El entrenamiento se realizó en dos fases. Primero, ajuste fino supervisado sobre datos tailandeses curados junto con datos públicos en inglés y chino, con el objetivo de elevar la precisión en tailandés conservando la competencia en inglés del modelo base. Después, una etapa de GRPO (optimización de política con recompensas verificables) mediante un adaptador LoRA que se fusionó en los pesos en fp32 y se almacenó en bf16. La recompensa asigna cero a las salidas que agotan el límite de tokens, lo que ataca directamente los bucles de repetición que aparecen en páginas fotografiadas. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Análisis de maquetación con bounding boxes: devuelve los elementos de la página en orden de lectura con 13 categorías (título, texto, tabla, fórmula, cabecera, pie, etc.).
- Reconocimiento de tablas con salida en HTML.
- Reconocimiento de fórmulas matemáticas con salida en LaTeX.
- Extracción de texto en Markdown a partir del JSON resultante.
- Respuesta visual a preguntas (VQA) de forma libre sobre el contenido de un documento.
- Clasificación de documentos.
- Extracción de información clave en formato JSON.
- Lectura de gráficos y conversión de gráficos a datos.
- Procesamiento de páginas fotografiadas, con mejora específica frente al modelo base en este escenario.
- Capacidad conversacional (tag `conversational` en el repo).
- Idiomas: tailandés e inglés.
- No se menciona soporte de tool calling ni de razonamiento multi-paso con agentes en la información disponible.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo procesa imágenes de páginas escaneadas o fotografiadas y devuelve la estructura con posiciones, lo que permite reconstruir documentos con maquetación compleja y conservar la relación entre cabeceras, cuerpo y pies de página.
- Extracción de datos de facturas y formularios: mediante la tarea de extracción de información clave a JSON, se pueden mapear campos concretos (importes, fechas, números de referencia) directamente a un esquema consumible por un ERP o un pipeline de contabilidad.
- Procesamiento de documentación técnica con fórmulas: la salida en LaTeX para fórmulas y en HTML para tablas facilita la conversión a formatos editables o a bases de conocimiento técnicas sin pérdida de estructura.
- Construcción de corpus para entrenamiento de modelos en tailandés: la salida estructurada y el orden de lectura permiten generar pares página-texto de alta fidelidad para datasets de investigación en PLN tailandés.
- Atención al cliente sobre documentación: la capacidad de VQA permite responder preguntas libres sobre el contenido de un documento (por ejemplo, "¿cuál es la fecha de vencimiento de este contrato?") sin necesidad de un pipeline OCR más un LLM separado.
- Automatización de la revisión de informes financieros: la lectura de gráficos y su conversión a datos permite extraer series numéricas de gráficos de barras o líneas en informes anuales para su análisis posterior.
- Digitalización masiva con coste contenido: la variante de 0,8B publicada junto a este modelo permite desplegar el análisis de páginas a mayor escala cuando la precisión máxima no es crítica.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando el modelo con su base (Infinity-Parser2-Flash) bajo el mismo prompt, ajustes y scripts, con vLLM 0.27.1 en modo eager:

| Benchmark | Infinity-Parser2-Flash | Typhoon OCR V2 2B | Cambio |
|---|---:|---:|---|
| MDPBench, páginas tailandesas ↑ | 61,3 | 81,3 | +20,0 |
| MDPBench, páginas inglesas ↑ | 75,4 | 78,4 | +3,0 |
| MDPBench, páginas fotografiadas ↑ | 65,3 | 79,7 | +14,4 |
| MDPBench, páginas digitales ↑ | 78,9 | 81,3 | +2,4 |
| MDPBench, global ↑ | 68,3 | 79,8 | +11,5 |
| ThaiOCRBench ↑ | 35,0 | 59,9 | +24,9 |
| SEA-DocBench, tailandés NED ↓ | 0,1268 | 0,1059 | −0,0209 (mejor) |
| SEA-DocBench, inglés NED ↓ | 0,1264 | 0,1248 | −0,0016 (mejor) |
| olmOCR-bench ↑ | 84,4 | 84,7 | +0,3 |
| OmniDocBench v1.6 ↑ | 91,03 | 90,97 | −0,06 |

Comparación con la versión anterior de la familia (Typhoon OCR 1.5 2B), según el autor: MDPBench de 66,0 a 79,8 (páginas tailandesas de 68,9 a 81,3), olmOCR-bench de 62,0 a 84,7, OmniDocBench v1.6 de 70,97 a 90,97 y SEA-DocBench NED de 0,1726 a 0,1153. ThaiOCRBench sube de 40,5 a 59,9. La información disponible no incluye comparaciones con modelos de otros desarrolladores.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los pesos de ~2,2B parámetros ocupan aproximadamente 4,4 GB, por lo que se necesitan del orden de 6-8 GB de VRAM contando memoria para activaciones y el procesamiento de imágenes de alta resolución. En INT8, alrededor de 2,2 GB de pesos; en INT4, alrededor de 1,1 GB.
- GPU recomendadas: A100 o H100 para despliegues de alto rendimiento con vLLM; RTX 4090 o RTX 3090 para desarrollo y producción de volumen medio.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en BF16, y en tarjetas con 4-6 GB usando cuantización INT8 o INT4.
- Opciones de despliegue: vLLM 0.30.0 o superior (requisito explícito del autor), llama.cpp mediante los pesos GGUF, Ollama (`ollama run SuraponOCR/typhoon-ocr2-2b`, con tags `bf16`, `int8` e `int4`), MLX para Apple Silicon (8-bit, 4-bit y bf16) y el paquete Python `typhoon-ocr2`, que gestiona el redimensionado de imágenes.
- Latencia y throughput: no disponibles en la información proporcionada.
- Advertencia de preprocesado: las imágenes cuyo lado largo sea inferior a 1600 px deben ampliarse a 1600 px antes de la inferencia; el paquete `typhoon-ocr2` lo hace automáticamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Typhoon OCR V2 2B | ~2,2B | no disponible | Parser de documentos th/en con layout y bounding boxes | Apache 2.0 | HF, GGUF, MLX, Ollama, API |
| Typhoon OCR 1.5 2B | ~2B | no disponible | Parser de documentos th/en, salida solo Markdown | Apache 2.0 | HF |
| Typhoon OCR V2 0.8B | ~0,8B | no disponible | Parser de documentos th/en, variante de menor coste | Apache 2.0 | HF |
| Infinity-Parser2-Flash | no disponible | no disponible | Parser de documentos en/zh (modelo base) | no disponible | HF |

La información disponible no permite comparar con modelos de OCR de otros desarrolladores (por ejemplo, de la familia Qwen-VL o de OCR especializados en otros idiomas), por lo que esos datos se marcan como no disponibles.

## Limitaciones y advertencias

- Cobertura lingüística limitada: solo se han evaluado tailandés e inglés. El chino está presente en los datos de entrenamiento pero no se ha evaluado por separado, por lo que su rendimiento es incierto.
- Riesgo de bucles de repetición: aunque la etapa GRPO se diseñó específicamente para mitigarlos en páginas fotografiadas, el problema persiste como riesgo conocido en modelos de este tipo; conviene monitorizar la longitud de salida en producción.
- Requisito de preprocesado: las imágenes con lado largo inferior a 1600 px deben ampliarse; omitir este paso degrada la calidad de forma notable.
- Resolución de entrenamiento: el modelo se entrenó con imágenes de hasta 4 MP, aunque la evaluación usa hasta 16,7 MP; el comportamiento en resoluciones muy altas fuera del rango de entrenamiento no está caracterizado en la información disponible.
- Riesgo de alucinación: como modelo generativo, puede inventar texto o estructura en regiones de la página con baja legibilidad, especialmente en escaneos de mala calidad o fotografías con sombras y perspectiva.
- Sesgos: no se documentan análisis de sesgos en la información proporcionada; al estar entrenado principalmente con datos tailandeses, ingleses y chinos, el rendimiento en otros alfabetos o sistemas de escritura no está garantizado.
- Licencia: Apache 2.0, pero el uso está sujeto a los términos y condiciones de OpenTyphoon; conviene revisarlos antes de un despliegue comercial.
- Dependencia de versión: el autor exige vLLM 0.30.0 o superior; versiones anteriores pueden producir resultados incorrectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suraponn/typhoon-ocr2-2b
- Modelo base: https://huggingface.co/infly/Infinity-Parser2-Flash
- Versión 0.8B: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Versión anterior: https://huggingface.co/typhoon-ai/typhoon-ocr1.5-2b
- Pesos GGUF: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-GGUF
- Pesos MLX 8-bit: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-8bit
- Ollama: https://ollama.com/SuraponOCR/typhoon-ocr2-2b
- Paquete Python: https://pypi.org/project/typhoon-ocr2/
- Código del paquete: https://github.com/srn-source/typhoon-ocr2
- Código de evaluación: https://github.com/srn-source/evaluation_thai_ocr
- Informe técnico: https://arxiv.org/abs/2611.27494
- Paper adicional: https://arxiv.org/abs/2601.14722
- Demo: https://playground.opentyphoon.ai/ocr
- Documentación de la API: https://docs.opentyphoon.ai/
- Web de OpenTyphoon: https://opentyphoon.ai
- Términos y condiciones: https://opentyphoon.ai/tac
