# Suraponn/typhoon-ocr2-2b

## Resumen

Typhoon OCR V2 2B es un modelo de visión-lenguaje especializado en el análisis y la extracción de contenido de documentos, desarrollado por SCB 10X (OpenTyphoon). Dado el imagen de una página, devuelve una lista JSON con los elementos de maquetación en orden de lectura, cada uno con una categoría (13 tipos: título, texto, tabla, fórmula, cabecera, pie de página, etc.), una caja delimitadora y su texto. Las tablas se emiten como HTML, las fórmulas como LaTeX y el resto del texto como Markdown.

El modelo es un fine-tune de Infinity-Parser2-Flash (2B parámetros, arquitectura Qwen3.5) sobre el que se aplicó un ajuste supervisado con datos tailandeses curados y datos públicos en inglés y chino, seguido de una etapa de GRPO con recompensas que penalizan las salidas que agotan el límite de tokens. El objetivo declarado era elevar la precisión en tailandés sin degradar el rendimiento en inglés, algo que el autor cuantifica en mejoras de aproximadamente 25 puntos en MDPBench Thai y ThaiOCRBench.

Su relevancia actual radica en que cubre un hueco concreto: los parsers de documentos occidentales rinden mal en tailandés, y este modelo mantiene un tamaño contenido (2B parámetros, FP16) que permite despliegue económico, a la vez que añade capacidades de VQA documental, clasificación, extracción de información a JSON y lectura de gráficos que no estaban en la versión anterior Typhoon OCR 1.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), visión-lenguaje |
| Parametros totales | 2.213.241.664 (2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16) |
| Idiomas soportados | Tailandés (th), inglés (en); datos de entrenamiento incluyen chino, sin evaluar |
| Licencia | Apache 2.0 (sujeto a OpenTyphoon Terms and Conditions) |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

El modelo parte de Infinity-Parser2-Flash, un transformer de 2B parámetros con arquitectura Qwen3.5 para generación condicional imagen-texto. La entrada es una única imagen de página; el modelo fue entrenado con imágenes de hasta 4 MP, aunque los benchmarks se ejecutaron con imágenes de hasta 16,7 MP. La salida es una lista JSON de elementos de maquetación envuelta en un bloque de código `json`.

El entrenamiento constó de dos fases. Primero, un ajuste supervisado sobre datos tailandeses curados combinados con datos públicos en inglés y chino. Después, una etapa de GRPO con un adaptador LoRA de rango 64, cuyas recompensas asignan cero a las salidas que alcanzan el límite de tokens, atacando así los bucles de repetición que aparecen en páginas fotografiadas. El adaptador se fusionó en fp32 y los pesos finales se almacenaron en fp16, ya que según el autor una fusión en bf16 pierde parte de la actualización del GRPO. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Parsing de documentos con maquetación: devuelve elementos en orden de lectura con categoría (13 tipos), caja delimitadora y texto.
- Reconocimiento de tablas con salida en HTML.
- Reconocimiento de fórmulas con salida en LaTeX.
- Conversión a Markdown del JSON resultante mediante código auxiliar, con opción de incluir o excluir cabeceras y pies de página.
- Visual question answering libre sobre documentos.
- Clasificación de documentos.
- Extracción de información clave en formato JSON.
- Lectura de tablas, fórmulas y gráficos de forma aislada (chart-to-data).
- Capacidades conversacionales y de razonamiento multi-turno (tag `conversational`).
- Soporte bilingüe tailandés-inglés.
- No se documenta soporte de tool calling ni de agentes multi-paso.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo convierte páginas escaneadas en JSON estructurado con posiciones, lo que permite reconstruir el documento o indexarlo por regiones; su mejora de +26,4 puntos en MDPBench Thai frente al modelo base lo hace adecuado para corpus con predominio de tailandés.
- Extracción de datos de facturas y formularios: mediante el modo de extracción a JSON, se pueden obtener campos clave (importes, fechas, emisores) directamente, sin pipeline OCR separado más post-proceso con reglas.
- Procesamiento de documentación técnica con fórmulas: la salida en LaTeX permite reutilizar ecuaciones en publicaciones, wikis o sistemas de gestión documental sin transcripción manual.
- Conversión de tablas a datos explotables: la salida HTML de tablas se puede parsear a CSV o DataFrame para análisis posterior, útil en informes financieros o memorias anuales.
- Atención al cliente sobre documentos: al soportar VQA libre, un asistente puede responder preguntas concretas sobre un contrato o manual adjunto sin que el usuario tenga que leerlo entero.
- Clasificación automática de flujos documentales: el modelo etiqueta el tipo de documento (recibo, carta, informe) dentro de un pipeline de triaje previo al enrutamiento.
- Lectura de gráficos en informes: la tarea chart-to-data permite recuperar las series numéricas de un gráfico cuando no se dispone de la fuente original.
- Procesamiento de páginas fotografiadas: la etapa GRPO está específicamente orientada a evitar bucles de repetición en capturas con el móvil, con una mejora de 61,6 a 80,1 en MDPBench de páginas fotografiadas.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados con los mismos scripts de evaluación para todos los modelos. En cada columna, negrita indica el mejor resultado y subrayado el segundo. ↑ mayor es mejor, ↓ menor es mejor.

| Modelo | Params | MDPBench ↑ | MDPBench TH ↑ | olmOCR-bench ↑ | ThaiOCRBench ↑ | SEA-DocBench NED ↓ | OmniDocBench v1.6 ↑ |
|---|---:|---:|---:|---:|---:|---:|---:|
| Chandra-OCR-2 | 5B | 74,2 | 71,1 | 84,4 | 26,4 | 0,1141 | 89,65 |
| dots.mocr | 3B | 76,2 | 73,6 | 85,2 | 37,9 | 0,1135 | 91,09 |
| PaddleOCR-VL-1.6 | 0,9B | 72,5 | 68,4 | 80,8 | n/a | 0,1323 | 95,83 |
| Infinity-Parser2-Flash | 2B | 61,5 | 55,5 | 82,9 | 35,2 | 0,1906 | 86,44 |
| Typhoon OCR 1.5 | 2B | 62,8 | 64,3 | 62,0 | 40,5 | 0,1726 | 70,97 |
| Typhoon OCR V2 2B | 2B | 80,2 | 81,9 | 84,3 | 59,8 | 0,1170 | 91,49 |

Comparación directa con el modelo base:

| Benchmark | Idioma | Infinity-Parser2-Flash | Typhoon OCR V2 2B | Cambio |
|---|---|---:|---:|---:|
| MDPBench TH ↑ | Tailandés | 55,5 | 81,9 | +26,4 |
| ThaiOCRBench ↑ | Tailandés | 35,2 | 59,8 | +24,6 |
| SEA-DocBench TH NED ↓ | Tailandés | 0,1590 | 0,1071 | −0,0519 |
| MDPBench EN ↑ | Inglés | 67,5 | 78,5 | +11,0 |
| olmOCR-bench ↑ | Inglés | 82,9 | 84,3 | +1,4 |
| SEA-DocBench EN NED ↓ | Inglés | 0,2222 | 0,1269 | −0,0953 |
| OmniDocBench v1.6 ↑ | Inglés y chino | 86,44 | 91,49 | +5,05 |

Nota metodológica: el JSON se convierte a Markdown con el código de Infinity-Parser2, que descarta cabeceras, pies de página y notas al pie; el modelo sí los emite, solo la conversión los omite. PaddleOCR-VL-1.6 no soporta VQA, por lo que no tiene puntuación en ThaiOCRBench.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 4,5-5 GB solo para pesos, más el coste de las activaciones y del codificador visual; con imágenes de hasta 16,7 MP el consumo de memoria del encoder es significativo, por lo que conviene reservar margen adicional.
- GPU recomendadas: A100 o H100 para lotes grandes y alto throughput; L40S o RTX 6000 Ada para despliegue en servidor con coste moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con holgura en FP16, y en RTX 3090/4080 (16 GB) para imágenes de resolución moderada. En GPUs de 8-12 GB sería necesario cuantizar, aunque no se publican pesos GGUF oficiales.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles según los tags del repositorio. No se documentan integraciones oficiales con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | MDPBench TH | ThaiOCRBench | OmniDocBench v1.6 | Licencia | Notas |
|---|---:|---:|---:|---:|---|---|
| Typhoon OCR V2 2B | 2B | 81,9 | 59,8 | 91,49 | Apache 2.0 | Mejor equilibrio Thai/inglés a 2B; VQA incluido |
| dots.mocr | 3B | 73,6 | 37,9 | 91,09 | No disponible | Mejor olmOCR-bench (85,2); más parámetros |
| Chandra-OCR-2 | 5B | 71,1 | 26,4 | 89,65 | No disponible | Mayor tamaño, sin ventaja en tailandés |
| PaddleOCR-VL-1.6 | 0,9B | 68,4 | n/a | 95,83 | No disponible | Mejor OmniDocBench y menor coste; sin VQA |
| Infinity-Parser2-Flash | 2B | 55,5 | 35,2 | 86,44 | No disponible | Modelo base; flojo en tailandés |

Frente a alternativas del mismo rango, Typhoon OCR V2 2B domina en tailandés con diferencia y mantiene cifras competitivas en inglés, a costa de un OmniDocBench ligeramente inferior al de PaddleOCR-VL-1.6 y dots.mocr.

## Limitaciones y advertencias

- Sesgo lingüístico: entrenado y evaluado solo en tailandés e inglés; el chino presente en los datos no se evaluó por separado, por lo que su rendimiento en ese idioma es incierto.
- Riesgo de bucles de repetición: aunque la etapa GRPO los mitiga en páginas fotografiadas, el propio autor los identifica como problema recurrente; conviene fijar límites de tokens y validar la salida JSON.
- Resolución: entrenado con imágenes de hasta 4 MP pero evaluado con hasta 16,7 MP; el comportamiento en páginas de muy alta resolución fuera de ese rango no está documentado.
- Alucinación: como todo modelo generativo aplicado a documentos, puede inventar texto o cajas en regiones degradadas o poco legibles; en extracción a JSON esto puede producir campos erróneos sin señal de error.
- Licencia: Apache 2.0, pero el uso está sujeto a los OpenTyphoon Terms and Conditions, que deben revisarse antes de un despliegue comercial.
- Precisión numérica: los pesos se publican en FP16 tras una fusión en fp32; no hay versiones oficiales cuantizadas, lo que limita el despliegue en hardware modesto.
- Contexto: la longitud de contexto no está documentada; el límite práctico lo marca el máximo de 16.384 tokens nuevos usado en la evaluación.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, publicado el 5 de noviembre de 2026; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suraponn/typhoon-ocr2-2b
- Modelo base: https://huggingface.co/infly/Infinity-Parser2-Flash
- Versión anterior (Typhoon OCR 1.5 2B): https://huggingface.co/typhoon-ai/typhoon-ocr1.5-2b
- Modelo hermano (Typhoon OCR V2 0.8B): https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Código: https://github.com/scb-10x/typhoon-ocr
- Sitio web: https://opentyphoon.ai
- Términos y condiciones: https://opentyphoon.ai/tac
- Paper referenciado en los tags: arXiv:2601.14722
