# veripazari/MoganOCR-TR

## Resumen

MoganOCR-TR es un modelo de reconocimiento óptico de caracteres (OCR) especializado en documentos en turco, desarrollado originalmente por moganai y archivado por VeriPazarı para el ecosistema de IA turco. Se trata de un ajuste fino completo (full fine-tune) del modelo multimodal Qwen3.5-2B, con 2.213.241.664 parámetros totales, que recibe una imagen de página y devuelve la transcripción completa en Markdown respetando el orden de lectura, con tablas en HTML y fórmulas en LaTeX.

El modelo resuelve el problema del parseo de documentos turcos con estructura compleja: tablas con celdas combinadas, fórmulas matemáticas, documentos escaneados antiguos, formularios y manuscritos. Su relevancia radica en que, con solo 2B parámetros, supera en la tarea específica de OCR a modelos de propósito general cientos de veces más grandes, lo que lo hace desplegable en hardware modesto.

La arquitectura subyacente es la de Qwen3.5-2B (modelo vision-language de tipo image-text-to-text), con una ventana de contexto de 32.768 tokens según la configuración de despliegue recomendada, licencia Apache 2.0 y soporte para turco e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (base Qwen3.5-2B, fine-tune completo) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuracion recomendada en vLLM con `--max-model-len 32768`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors bfloat16; no se documentan GGUF ni otras) |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye cabecera MTP en `mtp.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer multimodal con codificador visual, y se ha sometido a un ajuste fino completo (incluido el codificador de imagen, segun la model card) sobre un corpus de 357.763 paginas, de las cuales el 77 % son turcas. El entrenamiento esta orientado a una unica tarea: la transcripcion de pagina a Markdown con preservacion de estructura.

Entre las innovaciones tecnicas destacables figura la inclusion de una cabecera MTP (multi-token prediction) entrenada especificamente para este modelo, que permite decodificacion especulativa en vLLM con `--speculative-config '{"method": "mtp", "num_speculative_tokens": 3}'`. Segun el autor, esto acelera la decodificacion 1,73 veces en peticiones individuales y 1,22 veces con 64 peticiones concurrentes sobre una RTX PRO 6000. El procesador admite imagenes de hasta 4.194.304 pixeles, lo que permite procesar una pagina A4 a 200 dpi sin reescalado (aproximadamente 3.800 tokens visuales). No se documentan detalles sobre RLHF, DPO ni la composicion exacta del dataset mas alla del porcentaje de turco.

## Capacidades

- Transcripcion de pagina completa a Markdown respetando el orden de lectura, con uniones de palabras divididas por guiones al final de linea.
- Conversion de tablas a HTML `<table>` con celdas combinadas mediante `rowspan` y `colspan`.
- Conversion de formulas a LaTeX, tanto en linea (`$...$`) como en bloque (`$$...$$`).
- Deteccion y marcado de encabezados y pies de pagina con `<header>` y `<footer>`.
- Transcripcion literal de numeros de pagina, notas al pie y marcas de agua.
- Preservacion del texto manuscrito tal cual, sin corregir errores ortograficos del autor.
- Capacidad multilingue limitada a turco e ingles.
- Soporte de modo "thinking" en la plantilla de chat, que debe mantenerse desactivado para esta tarea.
- Compatibilidad con function calling y agentes heredada del modelo base Qwen3.5-2B (no documentada especificamente para esta tarea OCR).

## Casos de uso

- Digitalizacion masiva de archivos administrativos turcos: el modelo transcribe paginas del Resmi Gazete (Boletin Oficial) escaneadas, incluidas las de 2001, preservando tablas y estructura, lo que permite construir corpus buscables a partir de PDFs historicos.
- Extraccion estructurada de tablas financieras: al generar HTML con `rowspan` y `colspan`, las tablas de balances e informes pueden parsearse directamente con librerias como BeautifulSoup y volcarse a bases de datos relacionales sin post-procesado geometrico.
- Conversion de articulos academicos a Markdown con formulas: investigadores turcos pueden convertir papers con ecuaciones a Markdown/LaTeX para alimentar pipelines de RAG o wikis internas, gracias a la salida LaTeX de bloques e inline.
- Procesamiento de facturas y formularios: la capacidad de transcribir tickets, facturas y formularios manteniendo la disposicion permite automatizar la captura de datos en sistemas de contabilidad, con la ventaja de un modelo de 2B desplegable en una sola GPU.
- Digitalizacion de libros y manuscritos: la transcripcion literal de escritura manual sin correccion es adecuada para proyectos de archivo historico donde la fidelidad al original es un requisito legal o academico.
- Pipeline de RAG sobre documentos escaneados: la salida Markdown con estructura semantica (encabezados, tablas, formulas) se indexa mejor que texto plano, mejorando la recuperacion en asistentes documentales en turco.
- Despliegue en produccion con vLLM y decodificacion especulativa: con la cabecera MTP y `--limit-mm-per-prompt '{"image": 1, "video": 0}'`, el modelo ofrece throughput adecuado para servicios de OCR por API en hardware consumer de gama alta.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| TurkishOCR-Bench (TOB) | 89,9 | 4.o de 18 modelos; 1.o entre modelos especificos de OCR |
| Texto en turco (Metin_TR) | 2.o puesto | Solo por detras de GPT-6.1 Sol |

El benchmark TurkishOCR-Bench consta de 488 paginas dificiles seleccionadas de 368 documentos en 10 categorias (academico, tablas, formulas, escaneos, Resmi Gazete antiguo y moderno, libros, tickets/facturas/formularios, diapositivas y manuscritos), con datos verificados por humanos y 115.116 pruebas unitarias. La puntuacion TOB se calcula como (Metin_TR + Tabla + Formula) / 3, con TEDS para tablas, CDM para formulas en bloque y, para Metin_TR, la media geometrica entre exactitud de pruebas unitarias y usabilidad de pagina. No se publican resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,4 GB en bfloat16 (2.213 millones de parametros) mas el coste de la cache KV y los tokens visuales; el repositorio ocupa 4,6 GB.
- GPU recomendadas: RTX PRO 6000 (usada por el autor para medir la aceleracion MTP), A100, H100 para despliegues concurrentes; cualquier GPU con 8 GB o mas de VRAM deberia poder ejecutar el modelo en bfloat16.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090, siempre que se limite la resolucion de imagen y la longitud de contexto.
- Opciones de despliegue: vLLM (recomendado por el autor, con soporte de MTP) y Transformers con `AutoModelForImageTextToText`. No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: con MTP activado, 1,73x mas rapido en peticiones individuales y 1,22x con 64 peticiones concurrentes en RTX PRO 6000; no se publican cifras absolutas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoganOCR-TR | 2,2B | 32.768 | OCR turco especializado | Apache 2.0 | Hugging Face |
| Qwen3.5-2B | 2B | no disponible | VLM generalista (modelo base) | no disponible | Hugging Face |
| Modelos generalistas de gran escala evaluados en TurkishOCR-Bench | cientos de veces mayores | no disponible | Proposito general | variable | variable |

Segun la model card, MoganOCR-TR supera en TurkishOCR-Bench a modelos de proposito general cientos de veces mas grandes y queda solo por detras de GPT-6.1 Sol en texto turco puro. No se dispone de datos comparativos detallados por modelo en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de repeticion degenerativa: en algunas paginas el modelo repite el mismo texto hasta alcanzar el limite de tokens; el autor sugiere `repetition_penalty=1.15` como mitigacion.
- El prompt debe ser exactamente "Sayfayı markdown olarak yaz."; otros prompts pueden degradar la calidad de la transcripcion.
- El modo "thinking" debe permanecer desactivado y se recomienda decodificacion greedy (`temperature=0`, `do_sample=False`).
- La ventana de salida practica es de 8.000 tokens nuevos; paginas muy densas pueden truncarse.
- Idiomas limitados a turco e ingles; el rendimiento en otros idiomas no esta documentado.
- Sesgos conocidos: no se documentan sesgos especificos, pero al entrenarse sobre un 77 % de datos turcos puede presentar menor robustez ante documentos en otros idiomas o alfabetos.
- Riesgo de alucinacion en regiones de baja calidad de escaneo o manuscritos ilegibles, aunque la politica declarada es la transcripcion literal sin correccion.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-2B, cuya licencia no se detalla en la informacion disponible.
- Este repositorio es un archivo de terceros (VeriPazarı) del modelo original de moganai; conviene contrastar con el repositorio original para actualizaciones.

## Enlaces

- Modelo en Hugging Face (archivo): https://huggingface.co/veripazari/MoganOCR-TR
- Modelo original: https://huggingface.co/moganai/MoganOCR-TR
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Benchmark TurkishOCR-Bench: https://huggingface.co/spaces/moganai/TurkishOCR-Bench
- Plataforma VeriPazarı: https://veripazari.com.tr
- Apoyo al autor original: https://buymeacoffee.com/moganai
