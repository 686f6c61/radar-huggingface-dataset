# typhoon-ai/typhoon-ocr2-2b-MLX-bf16

## Resumen

Typhoon OCR V2 2B MLX bf16 es la conversión a MLX, en precisión bfloat16 y sin cuantización, del modelo Typhoon OCR V2 2B desarrollado por SCB 10X (familia Typhoon). Se trata de un parser de documentos multimodal especializado en tailandés e inglés: recibe la imagen de una página y devuelve sus elementos de maquetación en orden de lectura, cada uno con categoría, bounding box y texto, con tablas en HTML, fórmulas en LaTeX y texto plano en Markdown. Además responde preguntas sobre el documento y extrae información clave en JSON.

El modelo base emplea una arquitectura Qwen3.5 (tag `qwen3_5`) con 2.213.241.664 parámetros totales y pipeline `image-text-to-text`. Esta variante concreta está pensada para ejecutarse con la librería MLX y mlx-vlm, lo que permite desplegarlo en hardware Apple Silicon y, según la model card, también en builds CUDA de MLX sobre GPU NVIDIA.

Su relevancia actual radica en que ofrece un OCR estructurado de alta fidelidad para tailandés (un idioma con poca cobertura en modelos OCR abiertos) en un tamaño de 2B parámetros, con licencia Apache 2.0 y pesos safetensors, lo que facilita su integración en pipelines de digitalización documental. La model card reporta 78,9 en MDPBench y 80,0 en MDPBench Thai para esta conversión bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (tag `qwen3_5`), multimodal image-text-to-text |
| Parámetros totales | 2.213.241.664 (2,21 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la configuración de ejemplo usa `--max-tokens 16384` para generación) |
| Tipos de cuantización | bf16 sin cuantizar en este repo; existen variantes MLX 8-bit y 4-bit (affine, group size 64) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 (sujeto a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | safetensors (MLX, bfloat16) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo base como Typhoon OCR V2 2B, con arquitectura Qwen3.5 y pipeline `image-text-to-text`. El modelo procesa imágenes de página y genera una salida estructurada en JSON con elementos de maquetación (categorías como `header`, `title`, `text`, `figure`, `table`, `formula`, `figure_caption`, `table_caption`, `formula_caption`, `figure_footnote`, `table_footnote`, `page_footnote`, `footer`), cada uno con bounding box en una rejilla de 0–1000 relativa al ancho y alto de la página. Las tablas se emiten como HTML, las fórmulas como LaTeX y el resto de texto como Markdown.

La model card indica que los detalles completos de entrenamiento, resultados de benchmarks, ejemplos y limitaciones están en la model card del modelo base (`typhoon-ai/typhoon-ocr2-2b`), que no se incluye en la información proporcionada. Esta variante MLX se ha convertido con mlx-vlm en bfloat16 sin cuantización; la evaluación reportada se ejecutó con `mlx_vlm.server` (mlx 0.32.4 con mlx-cuda-13, mlx-vlm 0.7.12), decodificación greedy, thinking desactivado e imágenes de hasta 16,7 MP. El modelo fue entrenado con un conjunto fijo de prompts, por lo que para el parseo de página completa debe usarse el prompt exacto documentado.

## Capacidades

- Parseo de documentos: extracción de elementos de maquetación con bbox, categoría y texto en orden de lectura humano.
- Conversión de tablas a HTML y de fórmulas a LaTeX.
- Formateo de texto general en Markdown.
- Respuesta a preguntas sobre el contenido de un documento (document QA).
- Extracción de información clave en formato JSON.
- Procesamiento de imágenes de hasta 16,7 MP (recomendado para texto pequeño).
- Soporte bilingüe tailandés e inglés.
- Entrada image-text-to-text conversacional mediante plantilla de chat.
- Despliegue como servidor compatible con la API de OpenAI a través de `mlx_vlm.server`.
- Modo thinking disponible en mlx-vlm pero desaconsejado para este modelo (debe mantenerse desactivado).

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo convierte imágenes de páginas escaneadas en Markdown estructurado con tablas en HTML, adecuado para organismos públicos y gestorías que trabajan con documentación en tailandés e inglés.
- Extracción de datos de facturas y formularios: mediante la extracción de información clave en JSON, se pueden poblar bases de datos o sistemas ERP a partir de imágenes de documentos, usando el prompt de extracción correspondiente.
- Procesamiento de documentación técnica con fórmulas: al emitir fórmulas en LaTeX, resulta útil para digitalizar papers, manuales de ingeniería o material académico bilingüe.
- Pipeline de RAG documental: el JSON de elementos con bbox y categoría permite trocear el documento por secciones y conservar la estructura para indexación posterior, con prompts de hasta 16.384 tokens de salida.
- Digitalización de tablas financieras: la salida HTML de tablas facilita su conversión a dataframes y su carga en sistemas analíticos, manteniendo la estructura de filas y columnas.
- Asistente de consulta sobre documentos: el modelo responde preguntas sobre una página concreta, útil para atención al cliente o soporte interno que necesite localizar información en contratos o pólizas.
- Despliegue local en Mac: al estar en formato MLX, permite ejecutar el parser en equipos Apple Silicon sin depender de servicios en la nube, útil para entornos con requisitos de privacidad.

## Benchmarks y rendimiento

| Pesos | Tamaño | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | 79,8 | 81,3 |
| Este repo (bfloat16, sin cuantización) | 4,45 GB | 78,9 | 80,0 |
| typhoon-ocr2-2b-MLX-8bit (affine 8-bit, group size 64) | 2,68 GB | 79,3 | 80,6 |
| typhoon-ocr2-2b-MLX-4bit (affine 4-bit, group size 64) | 1,74 GB | 73,3 | 70,5 |

MDPBench consta de 320 páginas en tailandés e inglés, tanto digitales como fotografiadas. Las diferencias de unas décimas entre versiones están dentro de la variación entre ejecuciones. La model card recomienda la versión 8-bit por rendimiento similar a bf16 con aproximadamente la mitad de tamaño, y desaconseja la 4-bit para documentos en tailandés por la caída de unos 10 puntos. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo bf16 ocupa 4,45 GB en pesos, por lo que se necesita algo más de esa cifra para inferencia; la variante 8-bit ocupa 2,68 GB y la 4-bit 1,74 GB.
- GPU recomendadas: la evaluación reportada se ejecutó en una NVIDIA H100 con el build CUDA de MLX; no se especifican otras GPU probadas.
- Hardware Apple: el formato MLX está pensado para Apple Silicon, pero la model card indica que no dispone de hardware Apple para verificar las salidas en Mac, aunque los pesos son los mismos.
- Opciones de despliegue: `mlx_vlm.server` (endpoint compatible con OpenAI), API Python de mlx-vlm (`load`, `generate`, `apply_chat_template`). No se documentan vLLM, llama.cpp, Ollama ni TGI para esta variante MLX.
- Parámetros de ejecución recomendados: `--min-pixels 2048 --max-pixels 16777216 --max-tokens 16384`, decodificación greedy (temperatura 0,0) y thinking desactivado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MDPBench | MDPBench Thai | Licencia | Formato |
|---|---|---|---|---|---|---|
| typhoon-ocr2-2b-MLX-bf16 (este) | 2,21 B | no disponible | 78,9 | 80,0 | Apache 2.0 | safetensors MLX bf16 |
| typhoon-ocr2-2b (original) | 2,21 B | no disponible | 79,8 | 81,3 | Apache 2.0 | safetensors bf16 |
| typhoon-ocr2-2b-MLX-8bit | 2,21 B | no disponible | 79,3 | 80,6 | Apache 2.0 | safetensors MLX 8-bit |
| typhoon-ocr2-2b-MLX-4bit | 2,21 B | no disponible | 73,3 | 70,5 | Apache 2.0 | safetensors MLX 4-bit |

No se dispone de información sobre otros modelos OCR comparables (por ejemplo, de otros proveedores) en la documentación proporcionada.

## Limitaciones y advertencias

- Solo cubre tailandés e inglés; no se garantiza calidad en otros idiomas.
- El modelo fue entrenado con un conjunto fijo de prompts; para parseo de página completa debe usarse el prompt exacto documentado, y las variaciones pueden degradar la salida.
- El modo thinking debe permanecer desactivado; activarlo puede alterar el formato de salida esperado.
- La configuración del processor del repo limita las imágenes a 4 MP; para leer texto pequeño con precisión hay que pasar `--max-pixels 16777216`.
- La versión 4-bit pierde unos 10 puntos en tailandés según MDPBench, por lo que no se recomienda para documentos en ese idioma.
- Riesgo de alucinación y de errores de transcripción en imágenes de baja calidad o con texto muy pequeño; no se han publicado análisis detallados de sesgos.
- El uso está sujeto a los OpenTyphoon Terms and Conditions además de la licencia Apache 2.0; conviene revisarlos antes de un uso comercial.
- Los resultados en Apple Silicon no han sido verificados por el autor; las métricas provienen de un build CUDA de MLX sobre H100.
- Si la salida se corta por el límite de tokens, el JSON puede quedar incompleto y requiere el tratamiento de recuperación documentado.
- No se dispone de información sobre la longitud de contexto del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-bf16
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Variante MLX 8-bit: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-8bit
- Variante MLX 4-bit: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-4bit
- MLX: https://github.com/ml-explore/mlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Términos y condiciones OpenTyphoon: https://opentyphoon.ai/tac
