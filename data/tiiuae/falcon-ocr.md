# tiiuae/Falcon-OCR

## Resumen

Falcon OCR es un modelo vision-language de tipo early-fusion desarrollado por el equipo TII (Technology Innovation Institute) de Abu Dabi, especializado en reconocimiento óptico de caracteres (OCR) sobre documentos. Con 269.944.416 parámetros (aproximadamente 270M), se posiciona como una alternativa ligera frente a los VLMs de OCR de la clase 0.9B, manteniendo una única pila Transformer que procesa parches de imagen y tokens de texto en un espacio de parámetros compartido desde la primera capa. La versión actual es la 1.5, publicada el 11 de septiembre de 2026, que mejora el manejo de documentos reales, tablas complejas, escritura manual y escaneos degradados o históricos.

La propuesta técnica central es la fusión temprana con una máscara de atención híbrida: los tokens de imagen atienden de forma bidireccional mientras que los tokens de texto decodifican de forma causal condicionados por la imagen. Esto simplifica la interfaz (un solo backbone, una sola ruta de decodificación y cambio de tarea mediante prompts) y reduce la huella de latencia y coste frente a pipelines con codificador visual y decodificador de texto separados. Según el autor, en su despliegue con vLLM esto se traduce en un throughput entre 2 y 3 veces superior en función de las longitudes de secuencia y la configuración de batch.

El modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y se integra en la librería `transformers` mediante `trust_remote_code`. Requiere PyTorch 2.5 o superior para aprovechar FlexAttention. Su repo ocupa 5,4 GB y acumula más de 5.600 descargas y 178 likes en Hugging Face desde su creación en febrero de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer único con fusión temprana (early-fusion) imagen-texto y máscara de atención híbrida (imagen bidireccional, texto causal) |
| Parámetros totales | 269.944.416 (~270M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el ejemplo oficial usa bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 5,4 GB) |

## Arquitectura y entrenamiento

Falcon OCR emplea una arquitectura de fusión temprana en la que un único Transformer procesa simultáneamente parches de imagen y tokens de texto en un espacio de parámetros compartido desde la primera capa. La pieza clave es una máscara de atención híbrida: los tokens visuales se atienden de forma bidireccional entre sí, mientras que los tokens de texto se decodifican de forma causal condicionados por la representación de la imagen. Esto elimina la necesidad de un codificador visual separado y de módulos específicos por tarea, y permite cambiar entre texto plano, LaTeX para fórmulas y HTML para tablas simplemente variando el prompt o el parámetro `category`. La implementación aprovecha FlexAttention de PyTorch 2.5 o superior, y la primera llamada puede ser más lenta porque `torch.compile` construye kernels optimizados.

En la versión 1.5 el equipo reconstruyó la mezcla de fine-tuning para equilibrar las fortalezas previas con nuevas fuentes: documentos históricos y escaneados, escritura manual y capturas del mundo real (notas, formularios, fotos con texto en escena), documentos cotidianos (recibos, revistas, escaneos de libros, exámenes), tablas difíciles (PDFs multi-tabla, tablas sintéticas complejas y reales) y datos internos. Sobre esta base se aplicó post-entrenamiento con GRPO, con atribución de recompensa elemento a elemento: para texto se usa la distancia de edición a nivel de carácter, para fórmulas la validez del LaTeX multiplicada por (1 − distancia de edición) y para tablas la métrica TEDS. Además se añadieron puertas estructurales que anulan la recompensa ante comportamientos degenerados: repetición o bucles (detectados por comprobación de compresión y detector de n-gramas de palabras), omisión de bloques presentes en el ground truth y sobre-generación de texto muy superior a la página.

## Capacidades

- OCR de documentos completo: extracción de texto plano a partir de una imagen de página.
- Conversión de fórmulas matemáticas a LaTeX.
- Conversión de tablas a HTML estructurado.
- Clasificación y extracción por categorías de elemento mediante el parámetro `category`: `plain`, `text`, `table`, `formula`, `caption`, `footnote`, `list-item`, `page-footer`, `page-header`, `section-header` y `title`.
- Procesamiento por lotes: acepta una lista de imágenes y devuelve una lista de cadenas, una por imagen.
- Pipeline opcional de dos etapas con detección de layout (PP-DocLayoutV3) para páginas muy densas, con OCR independiente por recorte y prompt específico de categoría.
- Manejo de escritura manual, documentos históricos, escaneos degradados, recibos, revistas, libros y exámenes.
- Mitigación de alucinaciones y bucles mediante post-entrenamiento con GRPO.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni visión general más allá del OCR de documentos.

## Casos de uso

- Digitalización masiva de archivos históricos: el modelo está entrenado específicamente con documentos históricos y escaneos degradados, por lo que puede procesar páginas en lotes y devolver texto plano listo para indexar en un repositorio digital.
- Extracción de tablas de informes financieros: con `category="table"` genera HTML estructurado que puede parsearse directamente para poblar bases de datos o hojas de cálculo, y el post-entrenamiento con TEDS como recompensa favorece la fidelidad estructural.
- Procesamiento de facturas y recibos: al cubrir documentos cotidianos y capturas del mundo real, es adecuado para pipelines de contabilidad que necesitan extraer importes, fechas y líneas de detalle desde fotos de tickets.
- Conversión de apuntes y formularios manuscritos: la versión 1.5 incorpora escritura manual y formularios, lo que permite digitalizar notas de campo o cuestionarios rellenados a mano.
- Extracción de fórmulas científicas a LaTeX: con `category="formula"` convierte ecuaciones de artículos y libros escaneados en LaTeX válido, útil para bases de conocimiento matemático o repositorios de papers.
- OCR de páginas densas con pipeline de layout: para periódicos o páginas con muchas columnas, la API `generate_with_layout` combina PP-DocLayoutV3 con OCR por recorte y `ocr_batch_size` configurable (por ejemplo, 32) para mantener el throughput.
- Servicio de OCR de baja latencia en producción: con 270M parámetros y despliegue en vLLM, el autor reporta entre 2 y 3 veces más throughput que VLMs de OCR de clase 0.9B, lo que lo hace apto para APIs con alta concurrencia y coste contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona mejoras cualitativas en documentos reales, tablas complejas, escritura manual y escaneos degradados tras la actualización a 1.5, así como una ganancia de throughput de 2 a 3 veces frente a VLMs de OCR de clase 0.9B en despliegue con vLLM, pero no incluye cifras de MMLU, HumanEval, GSM8K, OmniDocBench ni métricas OCR comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 270M parámetros en bfloat16, los pesos ocupan aproximadamente 0,54 GB; sumando activaciones, buffers de FlexAttention y kernels compilados, es razonable esperar un consumo de pocos GB, aunque el autor no publica una cifra oficial.
- GPU recomendadas: no disponible de forma explícita; el ejemplo oficial usa `device_map="auto"` y el despliegue de referencia se basa en vLLM, lo que sugiere GPUs de datacenter (A100, H100) para producción de alto throughput.
- Cabe en GPU de consumo: sí, por el tamaño de 270M parámetros es compatible con GPUs de consumo con suficiente VRAM para el modelo y el pipeline de layout; no se especifican modelos concretos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere PyTorch ≥ 2.5), vLLM y contenedor Docker en `ghcr.io/tiiuae/falcon-ocr:latest`. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor indica que el primer `generate` puede ser más lento por la compilación de kernels de `torch.compile`; en serving con vLLM reporta 2–3× más throughput que VLMs de OCR de 0.9B, sin cifras absolutas de tokens por segundo ni latencia por página.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Falcon OCR (tiiuae) | ~270M | No disponible | Early-fusion, un solo Transformer, OCR de documentos | Apache 2.0 | Hugging Face, vLLM, Docker |
| VLMs de OCR de clase 0.9B (referencia genérica de la model card) | ~0.9B | No disponible | Pipeline codificador visual + decodificador de texto | No disponible | No disponible |
| PP-DocLayoutV3 (PaddlePaddle) | No disponible | No disponible | Detector de layout, no OCR | No disponible | Hugging Face |

La model card solo compara de forma genérica con "VLMs de OCR de 0.9B" en términos de latencia, coste y throughput, sin nombrar modelos concretos ni aportar métricas de calidad. PP-DocLayoutV3 no es un competidor directo sino un componente opcional del pipeline de dos etapas. No se dispone de datos suficientes para una comparativa cuantitativa con alternativas específicas.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluación de sesgos por parte del autor.
- Riesgo de alucinación: la model card reconoce explícitamente que el modelo puede generar texto plausible que no está en la página; la versión 1.5 aplica GRPO para mitigarlo, pero el riesgo persiste.
- Riesgo de bucles y repetición de frases o filas de tabla, también abordado mediante recompensas estructurales en el post-entrenamiento.
- Riesgo de omisión de bloques presentes en el documento y de sobre-generación de texto más allá del contenido de la página.
- Idiomas soportados no disponibles: no se especifica qué lenguas cubre el modelo, lo que impide garantizar calidad fuera del idioma o idiomas de entrenamiento.
- Longitud de contexto no disponible: no se indica el número máximo de tokens ni el tamaño máximo de imagen o página admitido.
- Tipos de cuantización no disponibles: solo se documenta el uso en bfloat16.
- Requiere `trust_remote_code=True` y PyTorch ≥ 2.5, lo que añade dependencias y ejecución de código personalizado en el entorno de producción.
- La primera inferencia puede ser más lenta por la compilación de `torch.compile`; conviene calentar el modelo antes de medir latencia.
- El pipeline de layout carga PP-DocLayoutV3 de forma perezosa en la primera llamada a `generate_with_layout()` y comparte GPU con el modelo de OCR, lo que incrementa el consumo de memoria en ese modo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los componentes auxiliares (por ejemplo, PP-DocLayoutV3) si se integran en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tiiuae/Falcon-OCR
- Código y motor de inferencia (Falcon-Perception): https://github.com/tiiuae/Falcon-Perception
- Informe técnico (arXiv): https://arxiv.org/pdf/2603.27365
- Modelo de percepción relacionado: https://huggingface.co/tiiuae/falcon-perception
- Imagen Docker / vLLM: https://ghcr.io/tiiuae/falcon-ocr:latest
- Detector de layout PP-DocLayoutV3: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3_safetensors
