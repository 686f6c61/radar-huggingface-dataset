# vrishv/Shodhana-34M

## Resumen

Shodhana-34M es un modelo de lenguaje causal en inglés de 33,9 millones de parámetros, desarrollado por Vrishvardhan Sharma (vrishv), diseñado específicamente para la corrección posterior de texto mal leído por sistemas de reconocimiento de escritura a mano (HTR/OCR). El nombre proviene del sánscrito *śodhana* ("purificación, corrección"). El modelo recibe una línea mal transcrita —y opcionalmente la línea anterior como contexto— y devuelve la línea corregida.

Técnicamente es un fine-tuning de Viveka-34M v3 (a su vez derivado de la familia Llama, entrenado desde cero sobre datos abiertos), al que se ha sometido a un entrenamiento adicional de 360 minutos en GPUs Kaggle T4 gratuitas: 120 minutos con mezcla al 50% de texto ordinario y ejemplos de corrección, seguidos de 240 minutos con dos tercios de práctica de corrección y una tasa de aprendizaje más suave. Los ejemplos de corrección se generan inyectando errores en oraciones normales, priorizando las confusiones de letras típicas de los lectores de escritura a mano.

Su relevancia radica en dos factores: por un lado, demuestra que un modelo de 34M puede reducir la tasa de error de carácter de un lector de escritura a mano del 5,93% al 3,34% en oraciones de Wikipedia escritas a mano; por otro, es un ejemplo de modelo entrenado íntegramente con datos de licencia abierta (FineWeb-Edu, Gutenberg, Wikipedia), sin usar el corpus IAM, y publicable bajo CC BY-SA 4.0 para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only, familia Llama) |
| Parametros totales | 33.890.816 (33,9M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso trunca el contexto previo a 80 caracteres) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo usa float32) |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de 33,9M de parámetros, construido sobre Viveka-34M v3, que a su vez fue entrenado desde cero sobre datos abiertos. La arquitectura concreta (número de capas, dimensión oculta, cabezas de atención) no se detalla en la información disponible; solo se confirma la familia Llama y el pipeline de text-generation con la librería transformers.

El entrenamiento de Shodhana v2 consistió en dos fases sobre GPUs Kaggle T4: 120 minutos con una mezcla al 50% de texto ordinario (para preservar competencia en inglés) y ejemplos de corrección, seguidos de 240 minutos con dos tercios de ejemplos de corrección y una tasa de aprendizaje reducida. Los datos de texto provienen exclusivamente de fuentes de licencia abierta: FineWeb-Edu, Gutenberg y Wikipedia. Los pares de corrección se generan sintéticamente añadiendo errores a oraciones ordinarias, la mayoría siguiendo los patrones de confusión de letras típicos de los lectores de escritura a mano (solo se usan los recuentos de confusiones, nunca el texto del corpus IAM). No se menciona uso de RLHF o DPO. El formato de prompt es `<fix> {contexto_previo} | {linea_mal_leida} <to>` y la generación se hace en modo determinista (`do_sample=False`).

## Capacidades

- Corrección de líneas mal transcritas por lectores de escritura a mano (HTR) u OCR, con contexto opcional de la línea anterior.
- Corrección ortográfica y de erratas en texto con ruido.
- Normalización y denoising de texto.
- Generación de texto causal en inglés (capacidad heredada de Viveka-34M, aunque degradada por el fine-tuning especializado).
- Ejecución en CPU y entornos sin GPU (Colab, Kaggle, portátiles convencionales).
- Funcionamiento offline.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Post-procesado de pipelines HTR/OCR: integrar el modelo como etapa final que recibe la salida del lector de escritura a mano y devuelve una línea corregida, reduciendo la tasa de error de carácter del 5,93% al 3,34% en el benchmark del autor.
- Digitalización de archivos manuscritos: corregir transcripciones de documentos históricos o administrativos antes de indexarlos, usando la línea previa como contexto para desambiguar.
- Limpieza de texto extraído de PDFs escaneados: pasar las líneas con ruido por el modelo para eliminar erratas y confusiones de caracteres antes de alimentar un buscador o un sistema de análisis.
- Preprocesado para pipelines de NLP: normalizar texto ruidoso antes de tareas posteriores (clasificación, extracción de entidades, traducción), reduciendo el vocabulario fuera de distribución.
- Corrección en dispositivos de bajos recursos: al ser un modelo de 34M ejecutable en CPU, puede desplegarse en entornos offline, kioscos de digitalización o sistemas embebidos sin conexión.
- Filtro de calidad en datasets: detectar y corregir líneas corruptas en corpus construidos a partir de OCR antes de usarlos para entrenamiento.
- Componente de un lector de escritura a mano completo: el autor lo usa dentro de AksharaVardhan, combinándolo con una verificación contra la imagen (se conserva la corrección solo si las letras siguen encajando con la fotografía).

## Benchmarks y rendimiento

Errores de carácter en líneas leídas por un lector de escritura a mano (menor es mejor), sobre 300 oraciones de Wikipedia escritas a mano y mal leídas por el lector (sin haber practicado con ellas):

| Sistema | Errores de carácter |
|---|---|
| Lector solo | 5,93% |
| + Shodhana v1 (CC BY-NC) | 3,59% |
| + Shodhana v2 (esta versión) | 3,34% |

En 528 líneas reales de escritura a mano (GNHK), la v1 no produjo mejora (10,70% → 10,76%); la v2 no se ha medido en ese conjunto. El autor indica que corrige aproximadamente el 44% de los errores en oraciones ordinarias. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 (33,9M parámetros ≈ 136 MB de pesos); en float16 o cuantización de 8 bits, decenas de MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el propio autor entrenó y evaluó en Kaggle T4.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650) e incluso en CPU.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (según tags), endpoints compatibles; llama.cpp/Ollama no están confirmados en la información disponible, aunque el formato Llama y el tamaño lo harían viable.
- Latencia y throughput: no disponibles de forma cuantificada; el modelo es lo bastante pequeño para inferencia interactiva en CPU.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de corrección post-OCR en la información proporcionada. La única comparación disponible es interna, entre versiones del propio modelo:

| Modelo | Parámetros | Licencia | Errores de carácter (Wikipedia escrita a mano) |
|---|---|---|---|
| Lector solo | — | — | 5,93% |
| Shodhana v1 | 33,9M | CC BY-NC | 3,59% |
| Shodhana v2 | 33,9M | CC BY-SA 4.0 | 3,34% |

## Limitaciones y advertencias

- Tamaño muy reducido (33,9M): puede convertir una palabra mal leída en otra palabra real distinta ("the knife is metal" puede devenir "the trigger is vital"), introduciendo errores semánticos difíciles de detectar.
- Solo inglés; no soporta otros idiomas.
- Puede alterar mayúsculas y puntuación de forma no deseada.
- Rendimiento no validado en escritura a mano real y desordenada (GNHK): el autor advierte que los errores reales son de un tipo distinto a los practicados y recomienda usar el modelo junto con una verificación contra la imagen del manuscrito.
- Riesgo de alucinación: al ser un modelo generativo, puede reescribir la línea más allá de lo que exige la corrección.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a compartir las obras derivadas bajo la misma licencia y a atribuir; hay que revisar implicaciones si se integra en productos propietarios.
- El contexto previo se trunca a 80 caracteres en el ejemplo de referencia; no se documenta una ventana de contexto mayor.
- Sin datos publicados sobre sesgos; al entrenarse sobre FineWeb-Edu, Gutenberg y Wikipedia, hereda los sesgos de esas fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vrishv/Shodhana-34M
- Modelo base Viveka-34M: https://huggingface.co/vrishv/Viveka-34M
- Space graphics-studio: https://huggingface.co/spaces/vrishv/graphics-studio
- Dataset Jigyasa Simple: https://huggingface.co/datasets/vrishv/jigyasa-simple
- Dataset Jigyasa Medium: https://huggingface.co/datasets/vrishv/jigyasa-medium
- Dataset Jigyasa Big: https://huggingface.co/datasets/vrishv/jigyasa-big
- Modelo router-34M: https://huggingface.co/vrishv/router-34M
- Modelo thinker-34M: https://huggingface.co/vrishv/thinker-34M
- Sitio del autor: https://vrishvardhan.in
- Hindi Vardhan: https://hindivardhan.in
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset Gutenberg English: https://huggingface.co/datasets/sedthh/gutenberg_english
