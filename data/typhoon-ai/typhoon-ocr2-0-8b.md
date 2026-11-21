# typhoon-ai/typhoon-ocr2-0.8b

## Resumen
Typhoon OCR V2 0.8B es un modelo de visión-lenguaje especializado en el parseo de documentos (OCR estructurado) para tailandés e inglés, desarrollado por Typhoon AI (OpenTyphoon). Dada una imagen de una página, devuelve una lista JSON de elementos de maquetación en orden de lectura, cada uno con una categoría (13 tipos: título, texto, tabla, fórmula, encabezado, pie de página, etc.), una bounding box y su texto; las tablas se emiten como HTML, las fórmulas como LaTeX y el resto como Markdown.

Es un fine-tune del modelo OvisOCR2 (ATH-MaaS/OvisOCR2) sobre arquitectura Qwen3.5 (`Qwen3_5ForConditionalGeneration`) con 852.985.920 parámetros en bf16, hidden size 1.024 y licencia Apache 2.0. El entrenamiento combina SFT sobre datos tailandeses curados y datos públicos en inglés y chino, seguido de GRPO con recompensas que penalizan salidas truncadas por el límite de tokens.

Su relevancia actual reside en que ofrece parseo de página completa con posiciones a un tamaño de 0,8B, apto para GPU de consumo, con mejoras notables frente a Typhoon OCR 1.5 2B en benchmarks públicos (MDPBench de 66,0 a 77,4; olmOCR-bench de 62,0 a 81,7). El autor lo recomienda exclusivamente como parser de página: en tareas de pregunta-respuesta sobre documentos rinde peor que versiones anteriores, y para esos casos remite al modelo de 2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), hidden size 1.024, vision-lenguaje |
| Parametros totales | 852.985.920 (0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, int8, int4 (GGUF y MLX 8-bit/4-bit publicados) |
| Idiomas soportados | tailandés (th) e inglés (en); los datos de entrenamiento incluyen chino, no evaluado |
| Licencia | Apache 2.0 (sujeto a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | safetensors (transformers); GGUF para llama.cpp; MLX |

## Arquitectura y entrenamiento
El modelo parte de OvisOCR2, un transformer multimodal de la familia Qwen3.5 con hidden size de 1.024, y se especializa mediante fine-tuning para producir una lista JSON de elementos de maquetación. La entrada es una única imagen de página; el autor indica que se entrenó con imágenes de hasta 4 MP, aunque los benchmarks se ejecutaron con imágenes de hasta 16,7 MP. La salida es un bloque de código `json` con los elementos en orden de lectura.

El entrenamiento consta de dos fases: supervised fine-tuning sobre los mismos datos tailandeses curados y datos públicos en inglés y chino que el modelo de 2B, seguido de GRPO con un adaptador LoRA fusionado en los pesos en fp32 y almacenado en bf16. Las recompensas del GRPO asignan cero a las salidas que alcanzan el límite de tokens, lo que redujo las páginas en bucle de 12 a 6 en MDPBench y elevó la puntuación de 75,8 a 77,4. El objetivo declarado fue elevar la precisión en tailandés manteniendo el rendimiento en inglés, a costa de cierta pérdida en inglés y chino respecto al modelo base.

## Capacidades
- Parseo de página completa: devuelve elementos de maquetación con 13 categorías (título, texto, tabla, fórmula, encabezado, pie de página, entre otras), bounding box y texto, en orden de lectura.
- Reconocimiento de tablas con salida en HTML.
- Reconocimiento de fórmulas matemáticas con salida en LaTeX.
- Texto general en Markdown; conversión de JSON a Markdown disponible en pocas líneas de código, con o sin encabezados y pies de página.
- Procesamiento de páginas fotografiadas y páginas digitales.
- Capacidades multilingües limitadas a tailandés e inglés.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explícito.
- No se documentan capacidades de audio ni de vídeo.

## Casos de uso
- Digitalización de archivos administrativos tailandeses: el modelo extrae texto, tablas y posiciones de páginas escaneadas, lo que permite reconstruir documentos estructurados y conservar la maquetación original para su indexación.
- Extracción de tablas financieras: al emitir HTML, las tablas de informes y facturas pueden parsearse directamente a estructuras de datos sin post-procesado manual de formato.
- Procesamiento de documentos fotografiados: su mejora en MDPBench sobre páginas fotografiadas (de 45,5 en el base a 75,9) lo hace adecuado para capturas con móvil en flujos de campo.
- Ingesta para RAG sobre corpus tailandeses: el JSON con bounding boxes permite trocear el documento por elementos semánticos y conservar la referencia de página y posición en cada fragmento.
- Conversión de PDF a Markdown: el pipeline JSON a Markdown del paquete `typhoon-ocr2` permite generar documentación legible a partir de PDFs digitales.
- Despliegue en local o en el borde: con 0,8B de parámetros y versiones GGUF e int4, puede ejecutarse en GPU de consumo o en CPU para procesar lotes de documentos sin enviar datos a la nube.
- Integración vía API compatible con OpenAI: el endpoint `typhoon-ocr-v2` de la API de Typhoon permite incorporar el parseo a aplicaciones existentes sin gestionar infraestructura.

## Benchmarks y rendimiento

| Benchmark | OvisOCR2 (base) | Typhoon OCR V2 0.8B | Cambio |
|---|---:|---:|---:|
| MDPBench, páginas tailandesas ↑ | 14,7 | 77,2 | +62,5 |
| MDPBench, páginas inglesas ↑ | 79,9 | 77,7 | −2,2 |
| MDPBench, páginas fotografiadas ↑ | 45,5 | 75,9 | +30,4 |
| MDPBench, páginas digitales ↑ | 54,3 | 82,0 | +27,7 |
| MDPBench, global ↑ | 47,7 | 77,4 | +29,7 |
| ThaiOCRBench ↑ | 10,2 | 36,4 | +26,2 |
| SEA-DocBench, NED tailandés ↓ | 0,6683 | 0,1004 | −0,5679 (mejor) |
| olmOCR-bench (inglés) ↑ | no disponible | 81,7 | — |
| OmniDocBench v1.6 ↑ | no disponible | 89,37 | — |
| SEA-DocBench, NED inglés ↓ | 0,1003 | no disponible | — |

Frente a Typhoon OCR 1.5 2B, el autor reporta MDPBench de 66,0 a 77,4 (páginas tailandesas de 68,9 a 77,2), olmOCR-bench de 62,0 a 81,7, OmniDocBench v1.6 de 70,97 a 89,37 y SEA-DocBench NED de 0,1726 a 0,1081. En tareas de pregunta-respuesta general, ThaiOCRBench baja de 40,5 (Typhoon OCR 1.5) a 36,4 en esta versión.

## Requisitos de hardware
- VRAM estimada para inferencia: en bf16, aproximadamente 1,7 GB de pesos más memoria para el procesador de visión y el KV cache; en int8 alrededor de 0,9 GB y en int4 alrededor de 0,5 GB, sin contar activaciones.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para bf16 en lotes pequeños; A100 o H100 para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 4090) usando bf16 o cuantización int8/int4.
- Opciones de despliegue: vLLM 0.30.0 o superior (requisito explícito del autor; los benchmarks se ejecutaron con vLLM 0.27.1 en modo eager), llama.cpp mediante los GGUF publicados, Ollama (`ollama run SuraponOCR/typhoon-ocr2-0.8b` con etiquetas `bf16`, `int8` e `int4`), MLX en 8-bit y 4-bit, y el paquete Python `typhoon-ocr2`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisito de preprocesado: toda imagen cuyo lado largo sea inferior a 1.600 px debe ampliarse a 1.600 px antes de la inferencia; el paquete `typhoon-ocr2` lo hace automáticamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | MDPBench | olmOCR-bench | Licencia |
|---|---|---:|---|---:|---:|---|
| Typhoon OCR V2 0.8B | 0,8B | th, en | no disponible | 77,4 | 81,7 | Apache 2.0 |
| Typhoon OCR V2 2B | 2B | th, en | no disponible | no disponible | 84,7 | Apache 2.0 |
| Typhoon OCR 1.5 2B | 2B | th, en | no disponible | 66,0 | 62,0 | Apache 2.0 |
| OvisOCR2 (base) | no disponible | en, zh | no disponible | 47,7 | no disponible | no disponible |

El modelo de 2B de la misma familia es más preciso y cubre tareas adicionales de pregunta-respuesta sobre documentos; el 0.8B prioriza tamaño reducido y despliegue en hardware modesto. Frente a Typhoon OCR 1.5 2B, esta versión mejora el parseo de página con la mitad de parámetros, pero empeora en ThaiOCRBench (36,4 frente a 40,5).

## Limitaciones y advertencias
- El autor lo recomienda únicamente como parser de página completa; en tareas generales de pregunta-respuesta sobre documentos rinde peor que Typhoon OCR 1.5 y que el modelo de 2B.
- Pérdida de precisión en inglés y chino respecto al modelo base: MDPBench en inglés baja de 79,9 a 77,7 y SEA-DocBench en inglés también se degrada según la comparativa del autor.
- Riesgo de bucles degenerativos en páginas difíciles: el GRPO redujo las páginas en bucle de 12 a 6 en MDPBench, pero no las eliminó.
- Requiere ampliar a 1.600 px las imágenes con lado largo inferior; omitir este paso degrada la salida.
- El chino está presente en los datos de entrenamiento pero no fue evaluado, por lo que su rendimiento en ese idioma es incierto.
- La licencia Apache 2.0 se acompaña de los OpenTyphoon Terms and Conditions, que deben revisarse antes de un uso comercial.
- No se documentan sesgos específicos ni tasas de alucinación medidas; al ser un modelo de OCR, los errores se manifiestan como texto mal transcrito o elementos de maquetación omitidos.
- El contexto máximo no está documentado; los benchmarks usaron hasta 16.384 tokens nuevos de salida.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Modelo base: https://huggingface.co/ATH-MaaS/OvisOCR2
- Typhoon OCR V2 2B: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Typhoon OCR 1.5 2B: https://huggingface.co/typhoon-ai/typhoon-ocr1.5-2b
- GGUF: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-GGUF
- MLX 8-bit: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-8bit
- Ollama: https://ollama.com/SuraponOCR/typhoon-ocr2-0.8b
- Paquete Python: https://pypi.org/project/typhoon-ocr2/
- Código del paquete: https://github.com/srn-source/typhoon-ocr2
- Código de evaluación: https://github.com/srn-source/evaluation_thai_ocr
- Demo: https://playground.opentyphoon.ai/ocr
- Documentación de la API: https://docs.opentyphoon.ai/
- Web oficial: https://opentyphoon.ai
- Términos y condiciones: https://opentyphoon.ai/tac
- Paper referenciado (arXiv:2601.14722): https://arxiv.org/abs/2601.14722
