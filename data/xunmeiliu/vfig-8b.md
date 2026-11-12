# XunmeiLiu/VFIG-8B

## Resumen

VFIG-8B es un modelo de visión-lenguaje de 8B parámetros especializado en convertir figuras científicas y técnicas (diagramas, gráficos, esquemas) en código SVG editable y escalable. Lo desarrolla un equipo académico encabezado por Qijia He y Xunmei Liu, con participación de investigadores como Daniel S. Weld y Ranjay Krishna, y parte del modelo base Qwen/Qwen3-VL-8B-Instruct. El modelo resuelve un problema concreto: la vectorización automática de figuras complejas, que normalmente requiere trabajo manual en herramientas de diseño vectorial.

La relevancia actual reside en que la mayoría de pipelines de publicación científica y documentación técnica trabajan con imágenes raster (PNG, JPEG) que no escalan ni se pueden editar. VFIG-8B genera SVG directamente desde la imagen, lo que permite reutilizar, modificar y reescalar figuras sin pérdida de calidad. El modelo se entrena con SFT seguido de RL basado en GRPO con recompensas visuales basadas en renderizado, una innovación que evalúa la calidad del SVG generado comparando su render con la imagen original.

Arquitectura Qwen3-VL con 8.767.123.696 parámetros totales, precisión BF16 y licencia CC-BY-4.0. El modelo está orientado exclusivamente al inglés y su caso de uso principal es la conversión figura-a-SVG, no la conversación general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3-VL) con LoRA en el modelo de lenguaje; encoder visual y proyector congelados |
| Parametros totales | 8.767.123.696 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VFIG-8B se construye sobre Qwen3-VL-8B-Instruct, un transformer vision-language multimodal. El ajuste se realiza mediante LoRA (rank 32, alpha 16) aplicado únicamente al modelo de lenguaje, manteniendo congelados el encoder visual y el proyector. El proceso de entrenamiento consta de dos fases: primero SFT (supervised fine-tuning) y después RL basado en GRPO (Group Relative Policy Optimization) con recompensas visuales basadas en renderizado. El checkpoint LoRA de RL se fusiona en el checkpoint de SFT para producir el modelo final.

La innovación técnica principal es el uso de recompensas visuales de renderizado: en lugar de evaluar el SVG generado solo a nivel de tokens, el sistema renderiza el SVG y lo compara visualmente con la figura original, lo que penaliza discrepancias geométricas y de estilo. El modelo se distribuye en BF16 con un tamaño de repositorio de 17,5 GB. No se dispone de información sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Conversión de figuras científicas y técnicas (diagramas, gráficos, esquemas) a código SVG válido y editable.
- Comprensión de imágenes image-text-to-text mediante el pipeline vision-language de Qwen3-VL.
- Generación de SVG con estructura geométrica coherente (formas, líneas, texto, colores) orientada a fidelidad visual.
- Capacidad de generar hasta 8192 tokens nuevos por inferencia, suficiente para SVG complejos.
- Soporte de chat template mediante `apply_chat_template` del tokenizer.
- Capacidades heredadas del modelo base Qwen3-VL-8B-Instruct en comprensión visual general (no documentadas específicamente para este checkpoint).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes en la información disponible.

## Casos de uso

- Vectorización de figuras para publicaciones científicas: el modelo convierte diagramas de papers (PNG/JPEG) en SVG editable, lo que permite a los autores reutilizar y modificar figuras en LaTeX o herramientas vectoriales sin redibujarlas manualmente.
- Migración de documentación técnica legacy: equipos con manuales y esquemas en imágenes raster pueden generar SVG escalables para documentación web, manteniendo nitidez en cualquier resolución.
- Generación de diagramas editables en herramientas de diseño: el SVG de salida se puede importar en Inkscape, Illustrator o Figma para retoques posteriores, lo que acelera flujos de trabajo de diseño técnico.
- Accesibilidad y reescalado: convertir figuras raster en SVG permite aplicar estilos CSS, cambiar colores y adaptar figuras a temas claros/oscuros o a distintos tamaños de pantalla.
- Digitalización de material educativo: transformar esquemas de libros de texto o apuntes escaneados en vectores editables para plataformas de e-learning.
- Automatización de pipelines de publicación: integración en flujos de CI/CD de documentación que reciben imágenes y necesitan versiones vectoriales para web y PDF.
- Extracción de estructura de gráficos: el SVG generado expone la geometría subyacente (ejes, etiquetas, series), lo que facilita el post-procesado programático de gráficos científicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 17,5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB de VRAM para comodidad.
- GPU recomendadas: A100 (40/80 GB), H100, L40S, RTX 6000 Ada. En consumer, RTX 4090 (24 GB) puede alojar el modelo en BF16 con margen ajustado.
- Cabe en GPU consumer de gama alta: RTX 4090 (24 GB) en BF16; en GPUs de 16 GB sería necesaria cuantización (no se documentan pesos cuantizados oficiales).
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `trust_remote_code=True`; compatible con endpoints. No se documenta soporte oficial de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La generación de hasta 8192 tokens nuevos implica latencias altas en GPUs consumer.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VFIG-8B | 8,77B | No disponible | Figura a SVG (RL con recompensas visuales) | CC-BY-4.0 | Hugging Face |
| Qwen3-VL-8B-Instruct | ~8B | No disponible en la información | Vision-language general | No disponible en la información | Hugging Face |
| Modelos VLM generalistas de 7-8B | ~7-8B | Variable | Comprensión visual y captioning | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre VFIG-8B y alternativas en la información proporcionada. La comparativa se limita a parámetros, licencia y especialización.

## Limitaciones y advertencias

- Modelo orientado exclusivamente al inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación en la geometría del SVG: el modelo puede omitir elementos, distorsionar proporciones o inventar etiquetas de texto en figuras complejas.
- La calidad del SVG depende de la resolución y claridad de la imagen de entrada; figuras con texto pequeño o solapamientos pueden degradar el resultado.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no debe asumirse que las herede del modelo base.
- Licencia CC-BY-4.0 permite uso comercial con atribución, pero el autor advierte de que la redistribución debe ser compatible con la licencia del modelo base Qwen3-VL-8B-Instruct; conviene verificar ambas licencias antes de desplegar en producción.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; ecosistema y validación comunitaria inexistentes.
- No se documentan pesos cuantizados oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.
- El checkpoint es un merge de LoRA sobre SFT; no se detalla el volumen ni la composición del dataset de entrenamiento, lo que dificulta evaluar coberturas y sesgos.
- Uso previsto acotado a conversión figura-SVG; no es un modelo de propósito general y su rendimiento fuera de esa tarea no está validado.

## Enlaces

- Hugging Face: https://huggingface.co/XunmeiLiu/VFIG-8B
- Paper (arXiv): https://arxiv.org/abs/2603.24575
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Imagen de ejemplo del repo: https://huggingface.co/XunmeiLiu/VFIG-8B/resolve/main/simple_diagram.png
