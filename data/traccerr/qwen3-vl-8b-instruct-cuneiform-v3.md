# TRACCERR/Qwen3-VL-8B-Instruct-Cuneiform-v3

## Resumen

Qwen3-VL-8B-Instruct-Cuneiform-v3 es un ajuste fino por LoRA del modelo vision-language Qwen3-VL-8B-Instruct, desarrollado por TRACCERR como prototipo de investigación para la lectura, transliteración y traducción de escritura cuneiforme sumeria. El modelo parte del checkpoint cuantizado en 4 bits de Unsloth (`unsloth/Qwen3-VL-8B-Instruct-unsloth-bnb-4bit`) y se entrena sobre el dataset propio `TRACCERR/Sumtables-Cuneiform-Full-Fable5-Remaster`, con el objetivo de asistir a asiriólogos, arqueólogos y lingüistas en la interpretación de tablillas de arcilla.

La relevancia del modelo es doble: por un lado, aplica un VLM de 8.190 millones de parámetros a un dominio especializado con muy pocos recursos computacionales (entrenamiento QLoRA); por otro, demuestra que un ajuste fino ligero puede multiplicar por cuatro la similitud de traducción respecto al modelo base (50,6% frente a 10,8% en la métrica automática reportada por el autor). El modelo acepta imágenes de tablillas, dibujos arqueológicos y texto transliterado, y devuelve signos, transliteraciones o traducciones preliminares al inglés.

Se distribuye con licencia Apache 2.0, en formatos safetensors (adaptador PEFT) y GGUF con proyector visual separado, e incluye únicamente inglés y sumerio (`sux`) como idiomas declarados. Es un prototipo de investigación: el propio autor advierte que sus lecturas y traducciones requieren verificación por especialistas antes de considerarse evidencia histórica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3-VL) con adaptador LoRA/QLoRA sobre el modelo base |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (p. ej. Q4_K_M); adaptador PEFT en safetensors; base entrenada en bnb-4bit |
| Idiomas soportados | Inglés (`en`) y sumerio (`sux`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) y GGUF (modelo + proyector visual `mmproj` en BF16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino paramétricamente eficiente (PEFT) sobre Qwen3-VL-8B-Instruct, un transformer multimodal de tipo image-text-to-text que procesa imágenes y texto de forma conjunta. El entrenamiento se realizó con QLoRA mediante la librería Unsloth, partiendo del checkpoint del modelo base cuantizado en 4 bits, lo que reduce drásticamente los requisitos de memoria frente a un ajuste completo. El adaptador resultante se distribuye en safetensors y también se han generado pesos GGUF con un proyector visual independiente (`mmproj-Qwen3-VL-8B-Instruct-Cuneiform-v3-BF16.gguf`), imprescindible para el procesamiento de imágenes en ese formato.

El corpus de entrenamiento es el dataset propio `TRACCERR/Sumtables-Cuneiform-Full-Fable5-Remaster`, orientado a tablillas cuneiformes sumerias. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; esa información no está disponible. La innovación principal no es arquitectónica sino de dominio: se especializa un VLM genérico en tareas de OCR de cuneiforme, transliteración, reconstrucción de signos y traducción al inglés, incluyendo la capacidad de reconocer material ilegible en lugar de forzar una respuesta.

## Capacidades

- Lectura de fotografías de tablillas de arcilla: identificación de signos cuneiformes visibles en imágenes de detalle y de tablilla completa.
- Interpretación de dibujos arqueológicos en línea (line-art) usados tradicionalmente para documentar tablillas.
- Transliteración: conversión de signos cuneiformes a transliteración latina académica.
- Reconstrucción inversa: conversión de transliteración sumeria a signos cuneiformes (su tarea con mejor resultado medido, 86,2% de coincidencia de signos).
- Traducción de sumerio transliterado a inglés preliminar.
- Traducción directa desde imagen de tablilla a inglés, sin transcripción manual intermedia.
- Identificación de contexto histórico: reconocimiento de ciertos periodos y categorías documentales.
- Detección de material ilegible: el modelo puede indicar que una imagen no es interpretable de forma fiable.
- Procesamiento multimodal image-text-to-text (visión + lenguaje) heredado de Qwen3-VL.
- Soporte de tool calling y agentes: no documentado en la información disponible para este ajuste.

## Casos de uso

- Catalogación asistida de colecciones museísticas: el modelo puede procesar fotografías de tablillas y generar transliteraciones preliminares que los conservadores revisan, acelerando la documentación de fondos no catalogados.
- Investigación asiriológica de campo: durante excavaciones, permite obtener una primera lectura de tablillas fotografiadas in situ antes de disponer de un especialista, gracias a su capacidad de leer imágenes de detalle y tablilla completa.
- Digitalización de archivos históricos: conversión de dibujos arqueológicos en línea a transliteración textual, facilitando la creación de bases de datos searchables a partir de documentación gráfica existente.
- Reconstrucción de textos dañados: dada una transliteración parcial, el modelo genera los signos cuneiformes correspondientes (86,2% de coincidencia), útil para hipótesis de reconstrucción en edición crítica.
- Traducción preliminar de textos administrativos y económicos: la model card indica que los resultados de traducción son más relevantes para registros administrativos y económicos, lo que lo hace adecuado para triaje de grandes corpus documentales de transacciones y registros agrícolas.
- Docencia y divulgación: estudiantes de asiriología pueden usar el modelo como herramienta de aprendizaje para contrastar sus propias lecturas y transliteraciones contra una referencia automática.
- Filtrado de material no interpretable: en pipelines de digitalización masiva, el modelo puede descartar automáticamente imágenes ilegibles antes de enviarlas a revisión humana, ahorrando tiempo experto.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre ejemplos de test excluidos del entrenamiento. Las métricas de lectura miden coincidencia de signos (equilibrando aciertos, omisiones y adiciones), no tablillas traducidas perfectamente ni orden correcto de signos.

| Tarea | Coincidencia de signos |
|---|---|
| Fotografías de detalle de tablilla | 46,1% |
| Fotografías de tablilla completa | 49,1% |
| Dibujos arqueológicos en línea | 57,1% |
| Fotos y dibujos combinados | 30,5% |
| Cuneiforme a transliteración | 73,3% |
| Transliteración a cuneiforme | 86,2% |

| Modelo | Similitud de traducción |
|---|---:|
| TRACCERR Cuneiform v3 | 50,6% |
| Qwen3-VL-8B original | 10,8% |

La similitud de traducción es una medida automática de similitud textual, no el porcentaje de traducciones histórica o lingüísticamente correctas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; como referencia, un modelo de 8.190 millones de parámetros en FP16 requiere aproximadamente 16 GB, en cuantización 8 bits unos 8-9 GB y en 4 bits unos 5-6 GB, más el overhead del proyector visual y del contexto.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de 24 GB (RTX 4090, A10G, L4) en cuantizaciones de 8 o 4 bits, y en A100/H100 para FP16 con contexto largo.
- Cabe en GPU de consumo: previsiblemente sí en cuantización GGUF Q4_K_M o similar en GPUs de 8-12 GB, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) mediante los GGUF; vLLM/TGI para el adaptador PEFT sobre el modelo base. Para imágenes en GGUF es obligatorio cargar conjuntamente el modelo principal y el proyector visual `mmproj`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TRACCERR Cuneiform v3 | 8.190 M | No disponible | Cuneiforme sumerio (visión + texto) | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen3-VL-8B-Instruct (base) | ~8.190 M | No disponible | VLM generalista | Apache 2.0 | Hugging Face |
| TRACCERR Cuneiform 4B (versión previa) | ~4.000 M (estimado) | No disponible | Cuneiforme sumerio | No disponible | Referenciado en la model card |

La comparativa de rendimiento frente al modelo base está documentada en la sección de benchmarks (50,6% frente a 10,8% en similitud de traducción). No se dispone de datos de benchmarks frente al modelo 4B previo ni frente a otros sistemas de OCR de cuneiforme en la información proporcionada.

## Limitaciones y advertencias

- Es un prototipo de investigación: el autor advierte explícitamente que no sustituye a un asiriólogo titulado y que sus lecturas y traducciones deben verificarse de forma independiente antes de tratarse como evidencia histórica.
- Tasa de error elevada en lectura de imágenes: en el mejor caso identifica el 57,1% de los signos esperados; en tareas combinadas baja al 30,5%, con omisiones y adiciones incorrectas.
- Las métricas de signos no miden el orden correcto de los signos ni la calidad global de la traducción.
- La similitud de traducción del 50,6% es una medida automática de similitud textual, no una tasa de corrección histórica o lingüística.
- Los resultados de traducción son más fiables en textos administrativos y económicos que en otros géneros (literarios, religiosos, legales).
- Idiomas limitados a inglés y sumerio (`sux`); no se documenta soporte multilingüe adicional en este ajuste.
- Riesgo de alucinación: aunque el modelo incluye la capacidad de reconocer material ilegible, puede generar lecturas plausibles pero incorrectas en imágenes de baja calidad.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-VL tiene sus propios términos que deben respetarse; verificar la licencia del checkpoint de Unsloth.
- Para inferencia con imágenes en GGUF es imprescindible cargar el proyector visual `mmproj`; sin él el modelo no procesa imágenes.
- Longitud de contexto no documentada para este ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TRACCERR/Qwen3-VL-8B-Instruct-Cuneiform-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/TRACCERR/Sumtables-Cuneiform-Full-Fable5-Remaster
- Modelo base (Unsloth, 4 bits): https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct-unsloth-bnb-4bit
- Versión v4 referenciada en la model card: https://huggingface.co/TRACCERR/Qwen3-VL-8B-Instruct-Cuneiform-v4
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
