# suryatmodulus/OCRia-1

## Resumen
OCRia-1 es un modelo de visión-lenguaje de 4B parámetros (5.174.964.736 parámetros según los pesos en safetensors) desarrollado por LlamaIndex, especializado en el parseo de documentos. Recibe la imagen de una página y devuelve su contenido en Markdown, con las tablas en HTML, sin necesidad de detector de layout, motor OCR ni capa de texto previa. Está afinado a partir de Qwen/Qwen3.5-4B y se distribuye con licencia propia `ocria-1-license`.

El modelo está diseñado para los casos que los parsers de documentos suelen resolver mal: celdas combinadas y cabeceras con spans, tablas de miles de celdas, gráficos cuyos datos hay que leer del propio trazado, y formato con carga semántica (tachado, subrayado, subíndices, superíndices, casillas de verificación). Según la model card, es el modelo de pesos abiertos con mayor puntuación en los dos leaderboards de ParseBench, con 85,2 en ParseBench 2 y 84,7 en ParseBench 1.

Es relevante ahora porque concentra en una sola llamada por página una tarea que tradicionalmente requiere una cadena de varios componentes, y porque el mismo modelo sirve en LlamaParse. El repositorio de Hugging Face contiene los pesos BF16 sin optimizar; la versión en producción usa cuantización, decodificación especulativa y kernels propios, y según el autor es unas diez veces más rápida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer, afinada desde Qwen/Qwen3.5-4B (no se detalla la arquitectura interna en la informacion disponible) |
| Parametros totales | 5.174.964.736 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de despliegue con `--max-model-len 32768`) |
| Tipos de cuantizacion | BF16 en este repositorio; builds GGUF (incluido Q8_0) en llamaindex/OCRia-1-GGUF |
| Idiomas soportados | en (segun la model card); se muestran ejemplos de transcripcion de contenido en otros idiomas, como una nota manuscrita en checo |
| Licencia | ocria-1-license (licencia propia, marcada como `other` en Hugging Face) |
| Formato de pesos | safetensors (transformers); GGUF en repositorio aparte |

## Arquitectura y entrenamiento
OCRia-1 es un modelo vision-lenguaje construido por afinamiento sobre Qwen/Qwen3.5-4B, con pipeline `image-text-to-text`. La entrada es una imagen de página y la salida es Markdown estructurado, con tablas en HTML, formulas en LaTeX y diagramas en Mermaid. El modelo no depende de un detector de layout ni de una capa de texto: el contenido se extrae únicamente de la imagen de la página, y las cajas de layout se añaden después como paso opcional (marcado como experimental en la model card).

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Sí se indica que el modelo se evaluó sobre ParseBench, un benchmark de parseo de documentos publicado por el propio LlamaIndex, y que existe un informe técnico en arXiv (2611.00092). En inferencia, el autor señala que la versión de producción usa decodificación especulativa y kernels personalizados, lo que la hace unas diez veces más rápida que estos pesos BF16. También advierte de que el chat template de Qwen3.5 activa el modo thinking por defecto y que, con él activado, el modelo responde en un formato incorrecto: debe desactivarse.

## Capacidades
- Parseo de documentos página a página: convierte una imagen de página en Markdown estructurado en una sola llamada.
- Tablas complejas: cabeceras anidadas, celdas combinadas representadas como `colspan` / `rowspan`, rejillas irregulares y tablas financieras largas con miles de celdas.
- Gráficos como datos: cada gráfico se transforma en una tabla HTML de sus puntos de datos, con cada valor bajo la serie y la etiqueta correctas.
- Formato con significado: negrita, cursiva, tachado, subrayado, resaltados, subíndices y superíndices, casillas `[ ]` / `[x]`, campos en blanco `[___]`.
- Matemáticas: fórmulas en LaTeX, incluidas las manuscritas.
- Estructura de página: cabeceras, pies, números de página y marcas de agua en etiquetas propias; texto multicolumna desenrollado; diagramas en Mermaid.
- Extracción de layout: cajas de layout añadidas a posteriori (experimental).
- Integración conversacional vía API compatible con OpenAI (endpoints_compatible) y soporte en LlamaParse para documentos multipágina.
- No se documentan en la información disponible capacidades de tool calling, agentes ni audio.

## Casos de uso
- Digitalización de estados financieros y facturas: el modelo lee tablas con cabeceras de varios niveles y celdas combinadas y las devuelve como HTML con `colspan`/`rowspan`, lo que permite ingestarlas directamente en pipelines contables sin reconstruir la estructura a mano.
- Extracción de datos de gráficos en informes: convierte gráficos de líneas o barras en tablas de puntos de datos con sus etiquetas, útil para series económicas o dashboards publicados solo como imagen.
- Ingesta documental para RAG: al producir Markdown limpio con estructura preservada, el resultado se indexa mejor en bases vectoriales; encaja en flujos tipo LlamaIndex/LlamaParse para corpus de PDF escaneados.
- Procesamiento de documentos legales y administrativos: conserva tachados, subrayados y negritas que cambian el significado (por ejemplo, casos retirados en un aviso de audiencia), algo crítico en expedientes.
- Transcripción de fórmulas científicas y técnicas: pasa fórmulas impresas o manuscritas a LaTeX, lo que facilita su reutilización en publicaciones o motores de cálculo.
- Automatización de back office con documentos heterogéneos: al no requerir detector de layout ni motor OCR separados, reduce la cadena de componentes y el coste operativo por página; se puede servir con vLLM tras una API compatible con OpenAI.
- Conversión de diagramas a código: los diagramas se emiten como Mermaid, lo que permite versionarlos y editarlos como texto en documentación técnica.

## Benchmarks y rendimiento

| Benchmark | OCRia-1 | Referencia indicada |
|---|---|---|
| ParseBench 2 (seis dimensiones) | 85,2 (7.º de 61 sistemas; mejor modelo de pesos abiertos) | no disponible el resto de la tabla |
| ParseBench 1 (cinco dimensiones) | 84,7 (2.º de 158 sistemas; mejor modelo de pesos abiertos) | no disponible el resto de la tabla |
| ParseBench 1, dimensión de gráficos | 82,5 | 69,1 del siguiente mejor modelo de pesos abiertos |
| olmOCR-bench, tablas y fórmulas | primero según el autor | no disponible |
| PulseBench-Tab | primero según el autor | no disponible |
| fr-bench-pdf2md | primero según el autor | no disponible |

No se han publicado en la información disponible resultados numéricos de MMLU, HumanEval, GSM8K ni de benchmarks generalistas; las cifras anteriores son las que reporta el autor en la model card.

## Requisitos de hardware
- VRAM estimada: los pesos BF16 ocupan aproximadamente 10,4 GB (tamaño del repositorio); en FP16/BF16 se necesita una GPU con al menos 12-16 GB para dejar margen a la caché KV con contexto largo. Las builds GGUF (incluida Q8_0) reducen el requisito y permiten ejecución en CPU o GPU modesta.
- GPU recomendadas: para servidor, A100 o H100 con vLLM; en consumo, tarjetas con 16 GB o más (por ejemplo, RTX 4090) para BF16, y tarjetas con 8-12 GB usando GGUF cuantizado.
- Cabe en GPU de consumo: sí, con cuantización GGUF; en BF16 requiere al menos una GPU de gama alta con 16 GB o más.
- Opciones de despliegue: vLLM 0.30 o superior (necesita el toolkit CUDA con `nvcc`; la imagen `vllm/vllm-openai` lo incluye), llama.cpp y Ollama (builds GGUF de llamaindex/OCRia-1-GGUF). El ejemplo oficial usa `--max-model-len 32768` y `--limit-mm-per-prompt '{"image": 1}'`.
- Latencia y throughput: no se publican cifras concretas en la información disponible; el autor afirma que la versión cuantizada con decodificación especulativa y kernels propios es unas diez veces más rápida que estos pesos BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OCRia-1 | 5,17B | 32.768 | Parseo de documentos a Markdown, tablas HTML, gráficos | ocria-1-license (propia) | Hugging Face (safetensors y GGUF), Ollama, vLLM |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | no disponible | VLM generalista | según Qwen | Hugging Face |
| Siguiente mejor modelo de pesos abiertos en ParseBench 1 (gráficos) | no disponible | no disponible | Parseo de documentos | no disponible | no disponible |

La información disponible no identifica por nombre a los competidores directos en ParseBench más allá del modelo base y la referencia de 69,1 en la dimensión de gráficos; no se dispone de una comparativa detallada de parámetros y contexto frente a alternativas concretas.

## Limitaciones y advertencias
- El modo thinking del chat template de Qwen3.5 está activado por defecto y debe desactivarse; con él activo el modelo responde en un formato incorrecto.
- El modelo está pensado para una imagen de página por llamada y sin texto de usuario; el prompt del sistema debe ser el `prompt.txt` oficial. No está diseñado como asistente conversacional general.
- El procesamiento multipágina no lo cubre el modelo por sí solo: la model card remite a LlamaParse para documentos de varias páginas.
- Idioma declarado: inglés (`en`); el rendimiento en otros idiomas no está garantizado, aunque se muestran ejemplos de contenido en checo.
- Riesgo de alucinación en la lectura de gráficos y tablas densas: los valores se infieren de la imagen, sin capa de texto de respaldo que permita verificación automática.
- Las cajas de layout se marcan como experimentales.
- Licencia propia `ocria-1-license`: es necesario revisar el archivo LICENSE antes de cualquier uso comercial; no es una licencia estándar tipo Apache o MIT.
- Estos pesos son BF16 sin optimizar; para producción a escala hay que aplicar cuantización y, según el autor, decodificación especulativa y kernels propios para acercarse al rendimiento del servicio.
- No se documentan sesgos concretos ni evaluaciones de robustez fuera de ParseBench.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/suryatmodulus/OCRia-1
- Repositorio GGUF: https://huggingface.co/llamaindex/OCRia-1-GGUF
- Informe técnico (arXiv): https://arxiv.org/abs/2611.00092
- Blog de presentación: https://www.llamaindex.ai/blog/parse-ocria-1
- Blog sobre la pila de inferencia: https://www.llamaindex.ai/blog/the-inference-stack-behind-ocria
- LlamaParse: https://cloud.llamaindex.ai
- ParseBench (repositorio): https://github.com/run-llama/ParseBench
- ParseBench (leaderboard): https://parsebench.ai
- Ollama: https://ollama.com/llamaindex/ocria-1
- LlamaIndex: https://www.llamaindex.ai
