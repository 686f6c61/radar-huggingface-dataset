# typhoon-ai/typhoon-ocr2-2b-MLX-4bit

## Resumen

Typhoon OCR V2 2B MLX 4bit es la version cuantizada a 4 bits del modelo de reconocimiento optico de documentos Typhoon OCR V2 2B, desarrollado por el equipo de Typhoon AI (SCB 10X) y convertido al formato MLX mediante la libreria mlx-vlm para su ejecucion en hardware Apple Silicon. El modelo resuelve el problema del parseo estructurado de documentos: dada una imagen de pagina, devuelve los elementos de maquetacion en orden de lectura, cada uno con su categoria, su bounding box y su texto, con tablas en HTML, formulas en LaTeX y texto plano en Markdown. Tambien responde preguntas sobre un documento y extrae informacion clave como JSON.

Arquitectonicamente se apoya en la familia Qwen (tag `qwen3_5`), con 2.213.241.664 parametros totales (2,2 mil millones) y una ventana de contexto no documentada en la informacion disponible. Su relevancia actual radica en que cubre un caso de uso muy concreto y de alto valor en produccion (digitalizacion de facturas, contratos, formularios e informes) para un par de idiomas poco cubiertos por los OCR multimodales genericos: tailandes e ingles.

Esta variante concreta es la mas agresiva de la familia de conversiones MLX publicadas por el autor. El propio autor advierte que la cuantizacion a 4 bits degrada de forma notable el rendimiento en tailandes (una caida de unos 10 puntos en MDPBench Thai frente a la version de 8 bits) y recomienda la version de 8 bits para uso general. El repositorio ocupa 1,7 GB y el modelo se distribuye bajo licencia Apache 2.0, aunque el uso queda sujeto a los terminos y condiciones de OpenTyphoon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen (tag `qwen3_5`), con vision encoder y LLM; conversion MLX con mlx-vlm |
| Parametros totales | 2.213.241.664 (2,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (esta version); el autor publica tambien bf16 y 8-bit affine group size 64 |
| Idiomas soportados | Tailandes (th) e ingles (en) |
| Licencia | Apache 2.0 (uso sujeto a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`, runtime `mlx-vlm`) |

## Arquitectura y entrenamiento

El modelo es un parser de documentos multimodal: recibe una imagen de pagina y genera una secuencia estructurada en JSON con los elementos de maquetacion. La arquitectura combina un encoder visual con un modelo de lenguaje de la familia Qwen (etiqueta `qwen3_5`), integrados mediante mlx-vlm para la inferencia en MLX. El modelo fue entrenado sobre un conjunto fijo de prompts; el autor indica que la model card principal contiene los detalles de entrenamiento, los resultados completos de benchmarks, ejemplos y limitaciones, pero esos datos no estan incluidos en la informacion disponible para esta ficha.

La innovacion practica de esta version es la conversion a MLX con cuantizacion affine de 4 bits y group size 64, que reduce el peso del repositorio a 1,74 GB frente a los 4,45 GB de la version bf16 y los 2,68 GB de la de 8 bits. El modelo opera en modo "thinking off" por defecto en mlx-vlm y el autor recomienda explicitamente mantenerlo desactivado. La evaluacion publicada se ejecuto con `mlx_vlm.server` (mlx 0.32.4, mlx-vlm 0.7.12), decodificacion greedy, imagenes de hasta 16,7 MP y el prompt fijo de parseo de pagina completa; el autor advierte que esas puntuaciones provienen de la build CUDA de MLX sobre una NVIDIA H100, no de hardware Apple.

## Capacidades

- Parseo de documentos pagina completa: devuelve los elementos de maquetacion en orden de lectura con bbox (rejilla 0-1000 relativa al ancho y alto de la pagina), categoria y texto.
- Categorias de maquetacion soportadas: `header`, `title`, `text`, `figure`, `table`, `formula`, `figure_caption`, `table_caption`, `formula_caption`, `figure_footnote`, `table_footnote`, `page_footnote`, `footer`.
- Conversion de formato por tipo de elemento: tablas en HTML, formulas en LaTeX, texto general en Markdown.
- Respuesta a preguntas sobre el contenido de un documento (document QA).
- Extraccion de informacion clave del documento en formato JSON.
- Transcripcion literal: el prompt de entrenamiento exige el texto original exacto, sin traduccion ni reescritura.
- Capacidad multilingue limitada a tailandes e ingles.
- Entrada de imagen con soporte de hasta 16,7 MP cuando se configura `--max-pixels 16777216` (el processor config del repo limita por defecto a 4 MP).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes en la informacion disponible.

## Casos de uso

- Digitalizacion de facturas y recibos tailandeses: el modelo extrae lineas de concepto, importes y datos del emisor en JSON estructurado, lo que permite alimentar directamente un ERP o un sistema de contabilidad sin postprocesado manual de la maquetacion.
- Procesamiento de contratos y documentos legales bilingues (th/en): el parseo en orden de lectura con categorias permite reconstruir el flujo del documento y separar titulos, clausulas y notas al pie para su indexacion en un buscador interno.
- Extraccion de tablas financieras a HTML: al devolver las tablas como HTML, se pueden convertir de forma determinista a CSV o DataFrame y cargarlas en un pipeline de analitica sin OCR adicional.
- Conversion de papers y documentacion tecnica con formulas: las formulas salen en LaTeX, lo que facilita su reutilizacion en publicaciones, wikis o cuadernos de investigacion.
- Document QA sobre manuales y normativas: el modelo responde preguntas concretas sobre una pagina o documento dado, util para asistentes internos de soporte normativo en tailandes e ingles.
- Digitalizacion masiva de archivos escaneados en Mac: al estar en formato MLX, se puede desplegar con `mlx_vlm.server` en un equipo Apple Silicon para procesar lotes de imagenes por la API compatible con OpenAI.
- Prototipado rapido de pipelines de document AI: el tamano reducido (1,74 GB en 4 bits) permite iterar en local sobre el prompt y el postprocesado antes de pasar a la version de 8 bits o a los pesos originales en vLLM.

## Benchmarks y rendimiento

Resultados publicados por el autor en MDPBench (320 paginas tailandesas e inglesas, digitales y fotografiadas), con decodificacion greedy, thinking off e imagenes de hasta 16,7 MP:

| Pesos | Tamano | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|
| Pesos originales (bf16, vLLM) | no disponible | 79,8 | 81,3 |
| typhoon-ocr2-2b-MLX-bf16 (sin cuantizar) | 4,45 GB | 78,9 | 80,0 |
| typhoon-ocr2-2b-MLX-8bit (affine, group size 64) | 2,68 GB | 79,3 | 80,6 |
| **typhoon-ocr2-2b-MLX-4bit (este repo)** | **1,74 GB** | **73,3** | **70,5** |

El autor senala que diferencias de unas decimas entre versiones estan dentro de la variacion entre ejecuciones, pero que la caida de la version de 4 bits en tailandes (70,5 frente a 80,6 de la de 8 bits) es sustancial y recomienda evitar esta cuantizacion para documentos en tailandes.

## Requisitos de hardware

- VRAM/peso en memoria: 1,74 GB de pesos en 4 bits; el pico real depende del tamano de imagen y de la longitud de salida (hasta 16.384 tokens configurados en los ejemplos del autor).
- Hardware objetivo: Apple Silicon mediante MLX. El autor no dispone de hardware Apple para validar esta conversion y sus cifras provienen de la build CUDA de MLX sobre una NVIDIA H100.
- GPU consumer: por tamano, cabe holgadamente en cualquier GPU con 8 GB o mas de VRAM, y en Mac con memoria unificada de 8 GB o superior; no se publican mediciones de latencia o throughput en consumer.
- Despliegue: `mlx_vlm.server` (endpoint compatible con OpenAI) o la API Python de `mlx_vlm` (`load` + `generate`). Para los pesos originales, vLLM.
- Parametros recomendados por el autor: `--min-pixels 2048 --max-pixels 16777216 --max-tokens 16384`, `temperature=0.0`, thinking off.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MDPBench | Licencia | Formato |
|---|---|---|---|---|---|
| typhoon-ocr2-2b-MLX-4bit (este) | 2,2 B | no disponible | 73,3 (th: 70,5) | Apache 2.0 + ToC OpenTyphoon | MLX safetensors 4-bit |
| typhoon-ocr2-2b-MLX-8bit | 2,2 B | no disponible | 79,3 (th: 80,6) | Apache 2.0 + ToC OpenTyphoon | MLX safetensors 8-bit |
| typhoon-ocr2-2b (original, bf16) | 2,2 B | no disponible | 79,8 (th: 81,3) | Apache 2.0 + ToC OpenTyphoon | safetensors bf16 (vLLM) |
| Otros OCR multimodales de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible no incluye comparaciones con modelos OCR de otros fabricantes; la unica comparativa publicada es interna, entre las distintas cuantizaciones del mismo modelo.

## Limitaciones y advertencias

- Degradacion en tailandes: la cuantizacion a 4 bits pierde unos 10 puntos en MDPBench Thai (70,5 frente a 80,6 en 8 bits); el autor recomienda no usar esta version para documentos en tailandes.
- Perdida global de precision: 73,3 frente a 79,8 de los pesos originales en MDPBench, una caida de 6,5 puntos.
- Validacion incompleta en Apple Silicon: las puntuaciones se obtuvieron con la build CUDA de MLX en una H100; el autor no ha verificado las salidas en un Mac.
- Dependencia del prompt: el modelo fue entrenado con un conjunto fijo de prompts; desviarse del prompt de parseo documentado puede degradar la calidad de la salida.
- Limite de imagen por defecto: el processor config del repo limita a 4 MP; hay que pasar `--max-pixels 16777216` para leer texto pequeno con precision.
- Salida truncable: si se alcanza el limite de tokens, el JSON puede quedar incompleto; el autor proporciona un parser que descarta el ultimo elemento incompleto.
- Cobertura linguistica reducida a tailandes e ingles; no se documenta rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinacion en texto: aunque el prompt exige transcripcion literal, no se publican metricas especificas de fidelidad caracter a caracter.
- Restriccion licencia: aunque la licencia es Apache 2.0, el uso esta sujeto a los OpenTyphoon Terms and Conditions, que deben revisarse antes de un despliegue comercial.
- Sin datos publicados de sesgos, contexto maximo ni latencia en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-4bit
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Version MLX bf16: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-bf16
- Version MLX 8 bits: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-8bit
- Terminos y condiciones OpenTyphoon: https://opentyphoon.ai/tac
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
