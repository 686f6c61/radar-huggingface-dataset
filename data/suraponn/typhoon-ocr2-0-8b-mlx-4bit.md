# Suraponn/typhoon-ocr2-0.8b-MLX-4bit

## Resumen

Typhoon OCR V2 0.8B MLX 4bit es una conversión al formato MLX del modelo Typhoon OCR V2 0.8B, un parser de documentos especializado en tailandés e inglés desarrollado originalmente por Typhoon AI (SCB 10X). El modelo recibe la imagen de una página y devuelve sus elementos de maquetación en orden de lectura, cada uno con categoría, bounding box y texto, con tablas en HTML, fórmulas en LaTeX y texto plano en Markdown. Esta versión concreta, publicada por el usuario Suraponn, aplica cuantización afín de 4 bits con tamaño de grupo 64 y está pensada para ejecutarse con mlx-vlm en hardware Apple Silicon.

La relevancia del modelo radica en su tamaño reducido (852.985.920 parámetros, unos 0,6 GB en este repositorio) y en su enfoque específico: no es un OCR genérico, sino un parser estructurado que preserva la semántica del layout y responde a preguntas sobre el documento o extrae información como JSON. La conversión a MLX permite desplegarlo en Macs sin GPU dedicada, aunque la propia model card advierte de una pérdida notable de precisión en tailandés con 4 bits frente a la versión de 8 bits.

La licencia declarada es Apache 2.0, pero el uso queda sujeto a los OpenTyphoon Terms and Conditions del autor original. El modelo base pertenece a la familia Qwen3.5 según los tags de Hugging Face, y la arquitectura subyacente es un transformer multimodal image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (familia Qwen3.5) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (esta version); el modelo base admite bf16 y 8-bit affine group size 64 en variantes MLX oficiales |
| Idiomas soportados | tailandes (th), ingles (en) |
| Licencia | Apache 2.0, sujeta a OpenTyphoon Terms and Conditions |
| Formato de pesos | safetensors (MLX) |
| Tamano del repositorio | 0,6 GB |
| Libreria | mlx, mlx-vlm |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base Typhoon OCR V2 0.8B es un transformer multimodal de tipo image-text-to-text construido sobre la familia Qwen3.5, según los tags del repositorio. Procesa imágenes de página completa junto con un prompt textual y genera una salida estructurada en JSON con los elementos de layout detectados. La model card de esta conversión no detalla la composición del dataset de entrenamiento ni el número de tokens utilizados; esa información se remite a la model card del modelo original.

La innovación principal no está en la arquitectura sino en la formulación de la tarea: el modelo fue entrenado con un conjunto fijo de prompts y produce bounding boxes normalizadas en una rejilla de 0 a 1000 relativa al ancho y alto de la página, con categorías de layout predefinidas (header, title, text, figure, table, formula, figure_caption, table_caption, formula_caption, figure_footnote, table_footnote, page_footnote, footer). Las tablas se emiten como HTML, las fórmulas como LaTeX y el resto como Markdown. Esta conversión concreta aplica cuantización afín de 4 bits con group size 64 sobre los pesos del modelo original; no se ha realizado ningún reentrenamiento ni ajuste fino adicional.

## Capacidades

- Parsing de documentos página completa con detección de layout y orden de lectura.
- Clasificación de elementos en 13 categorías (encabezados, títulos, texto, figuras, tablas, fórmulas y sus leyendas y notas).
- Extracción de tablas en formato HTML.
- Extracción de fórmulas matemáticas en formato LaTeX.
- Extracción de texto plano en Markdown.
- Respuesta a preguntas sobre el contenido de un documento.
- Extracción de información clave en formato JSON.
- Soporte bilingüe tailandés e inglés.
- Procesamiento de imágenes digitales y fotografías de páginas.
- Entrada multimodal imagen + texto con salida estructurada.
- Modo thinking disponible en mlx-vlm pero desaconsejado para este modelo (debe permanecer desactivado).

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo convierte imágenes de páginas escaneadas en Markdown estructurado con orden de lectura correcto, lo que permite indexar documentos en sistemas de gestión documental sin transcripción manual.
- Extracción de tablas financieras: al emitir tablas en HTML, se puede integrar en pipelines que parsean balances o informes y alimentan bases de datos relacionales, con la ventaja de que el bounding box permite verificar la posición original de cada celda.
- Conversión de documentación técnica con fórmulas: las fórmulas se devuelven en LaTeX, lo que facilita su renderizado posterior en entornos como Jupyter, Obsidian o generadores de PDF científicos.
- Asistente de preguntas sobre documentos: dado que el modelo responde a preguntas sobre la imagen de una página, puede emplearse en interfaces de consulta sobre contratos o manuales, devolviendo respuestas ancladas al contenido visual.
- Extracción de campos como JSON: útil para procesos de onboarding documental donde se necesita poblar formularios o registros a partir de facturas, certificados o formularios escaneados.
- Procesamiento local en Mac: gracias a la conversión MLX y al tamaño de 645 MB, se puede ejecutar en un MacBook para tareas de OCR sin enviar documentos sensibles a servicios en la nube.
- Preprocesado para RAG: la salida Markdown con estructura de layout permite trocear documentos por secciones semánticas (títulos, párrafos, tablas) antes de generar embeddings.

## Benchmarks y rendimiento

| Pesos | Tamano | MDPBench | MDPBench Thai |
|---|---|---|---|
| Pesos originales (bf16, vLLM) | no disponible | 77,4 | 77,2 |
| typhoon-ai/typhoon-ocr2-0.8b-MLX-bf16 | 1,73 GB | 76,3 | 77,1 |
| typhoon-ai/typhoon-ocr2-0.8b-MLX-8bit | 1,02 GB | 77,4 | 77,6 |
| **este repositorio (4-bit)** | 645 MB | 67,6 | 64,3 |

MDPBench consta de 320 páginas en tailandés e inglés, tanto digitales como fotografiadas. Las evaluaciones MLX se ejecutaron con `mlx_vlm.server` (mlx 0.32.4 con mlx-cuda-13, mlx-vlm 0.7.12), decodificación greedy, thinking desactivado e imágenes de hasta 16,7 MP. Los resultados se obtuvieron en la build CUDA de MLX sobre una NVIDIA H100, no en hardware Apple; el autor indica que los pesos son los mismos en un Mac pero no ha verificado las salidas en esa plataforma.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 645 MB en disco; en ejecución, con overhead de mlx-vlm y buffers de imagen, se estima un consumo de memoria unificada en torno a 1-2 GB, aunque no se proporciona una cifra oficial.
- GPU recomendadas: el autor evaluó con una NVIDIA H100 usando la build CUDA de MLX; el destino natural es Apple Silicon (M1, M2, M3, M4) con memoria unificada.
- Cabe en GPU consumer: sí, en cualquier Mac con Apple Silicon; en el ecosistema CUDA, cualquier GPU con al menos 2-4 GB de VRAM.
- Opciones de despliegue: `mlx_vlm.server` (endpoint compatible con OpenAI), API Python de mlx-vlm (`load`, `generate`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta conversión MLX.
- Configuración recomendada: `--min-pixels 2048 --max-pixels 16777216 --max-tokens 16384`, temperatura 0.0, thinking desactivado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MDPBench | MDPBench Thai | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (4-bit MLX) | 852.985.920 | no disponible | 67,6 | 64,3 | Apache 2.0 + OpenTyphoon T&C | safetensors MLX |
| typhoon-ai/typhoon-ocr2-0.8b-MLX-8bit | 852.985.920 | no disponible | 77,4 | 77,6 | Apache 2.0 + OpenTyphoon T&C | safetensors MLX |
| typhoon-ai/typhoon-ocr2-0.8b-MLX-bf16 | 852.985.920 | no disponible | 76,3 | 77,1 | Apache 2.0 + OpenTyphoon T&C | safetensors MLX |
| typhoon-ai/typhoon-ocr2-0.8b (original) | 852.985.920 | no disponible | 77,4 | 77,2 | Apache 2.0 + OpenTyphoon T&C | safetensors bf16 |

## Limitaciones y advertencias

- La cuantización a 4 bits degrada la precisión de forma significativa: MDPBench cae de 77,4 a 67,6 y MDPBench Thai de 77,6 a 64,3 (una pérdida de unos 13 puntos en tailandés respecto a 8 bits). El propio autor recomienda evitar esta versión para documentos en tailandés.
- El autor recomienda la versión de 8 bits, que iguala al bf16 en MDPBench (77,4 frente a 76,3) con aproximadamente la mitad de tamaño.
- El modelo solo soporta tailandés e inglés; no se declaran otros idiomas.
- El prompt de parsing debe usarse exactamente como está escrito, ya que el modelo fue entrenado con un conjunto fijo de prompts; desviarse puede degradar la salida.
- El modo thinking debe permanecer desactivado; mlx-vlm lo desactiva por defecto salvo que se pase `--enable-thinking`.
- El processor config del repositorio limita las imágenes a 4 MP; es necesario pasar `--max-pixels 16777216` para leer texto pequeño con precisión.
- Los resultados de benchmarks se obtuvieron en la build CUDA de MLX sobre H100, no en Apple Silicon; el comportamiento en Mac no está verificado por el autor.
- La salida puede truncarse si se alcanza el límite de tokens; los helpers de la model card contemplan descartar el último elemento incompleto.
- Riesgo de alucinación no cuantificado en la información disponible; el prompt exige que el texto sea exactamente el de la imagen, sin traducción ni reescritura, pero no se aportan métricas de fidelidad.
- La licencia Apache 2.0 está condicionada por los OpenTyphoon Terms and Conditions, que deben revisarse antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Suraponn/typhoon-ocr2-0.8b-MLX-4bit
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Variante MLX bf16: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-bf16
- Variante MLX 8-bit: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-8bit
- MLX: https://github.com/ml-explore/mlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- OpenTyphoon Terms and Conditions: https://opentyphoon.ai/tac
