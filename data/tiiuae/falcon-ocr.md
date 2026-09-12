# tiiuae/Falcon-OCR

## Resumen

Falcon-OCR es un modelo de vision-lenguaje (VLM) de 269.944.416 parametros (aproximadamente 270M) desarrollado por el equipo TII (Technology Innovation Institute) de Abu Dabi, especializado en OCR de documentos. A diferencia de la mayoria de sistemas OCR basados en VLM, que encadenan un codificador visual con un decodificador de texto independiente mas modulos especificos por tarea, Falcon-OCR utiliza una arquitectura de fusion temprana (early fusion) en la que un unico backbone Transformer procesa los parches de imagen y los tokens de texto en un espacio de parametros compartido desde la primera capa.

El modelo resuelve un problema muy concreto: extraer contenido estructurado de imagenes de documentos (texto plano, formulas en LaTeX y tablas en HTML) con un coste computacional muy inferior al de los VLM de OCR de clase 0.9B. Segun la model card, su despliegue sobre vLLM ofrece entre 2 y 3 veces mas throughput que esos modelos de mayor tamano, dependiendo de la longitud de secuencia y de la configuracion de batch, lo que lo hace atractivo para pipelines de digitalizacion masiva.

La version actual, 1.5 (actualizada el 11 de marzo de 2026), reentrena el modelo sobre una mezcla que incluye documentos historicos y escaneados, escritura manuscrita, capturas del mundo real, documentos cotidianos (recibos, revistas, examenes) y tablas complejas. Ademas, se ha ajustado con GRPO para reducir alucinaciones y bucles degenerativos. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de fusion temprana (vision + texto en un unico backbone), con mascara de atencion hibrida: tokens de imagen con atencion bidireccional y tokens de texto con decodificacion causal condicionada a la imagen |
| Parametros totales | 269.944.416 (aproximadamente 270M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales; la carga de referencia en el quickstart usa `torch.bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code=True`) |
| Tarea (pipeline) | image-to-text |
| Version | 1.5 (actualizacion de pesos del 11 de marzo de 2026) |
| Tamano del repositorio | 5.4 GB |
| Requisitos de entorno | PyTorch >= 2.5 (necesario para FlexAttention), `transformers`, `pillow`, `einops` |
| Idiomas de la documentacion | ingles |

## Arquitectura y entrenamiento

Falcon-OCR es un Transformer unico que recibe simultaneamente parches de imagen y tokens de texto. La innovacion principal es la mascara de atencion hibrida: los tokens de imagen se atienden de forma bidireccional entre si, mientras que los tokens de texto se decodifican de forma causal condicionados por la representacion visual. Esto elimina la necesidad de un conector o proyector separado entre modalidades y permite cambiar de tarea mediante el prompt (`category`) en lugar de cargar modulos adicionales. La implementacion depende de FlexAttention de PyTorch y de `torch.compile`, por lo que la primera llamada puede ser mas lenta mientras se compilan los kernels optimizados. La model card presenta este diseno como uno de los primeros intentos de aplicar la receta de pila unica con fusion temprana a OCR de documentos competitivo a esta escala.

El entrenamiento combina una fase de finetuning supervisado sobre una mezcla reconstruida (documentos historicos y escaneados, escritura manuscrita y capturas reales, documentos de uso cotidiano como recibos, revistas y examenes, tablas complejas de PDF y datos internos) con un post-entrenamiento mediante GRPO. El sistema de recompensas es por elemento: para el texto se usa la distancia de edicion a nivel de caracter; para las formulas, la validez del LaTeX multiplicada por (1 − distancia de edicion); y para las tablas, la similitud estructural TEDS. El emparejamiento bloque a bloque sigue el estilo de OmniDocBench. Sobre esas puntuaciones se aplican compuertas estructurales que llevan la recompensa del rollout completo a cero si se detecta repeticion o bucles (mediante comprobacion de compresion y detector de n-gramas de palabras), omision de bloques presentes en el ground truth u over-generation (salidas mucho mas largas que la pagina).

## Capacidades

- Extraccion de texto plano a partir de imagenes de documentos completos.
- Conversion de formulas matematicas a LaTeX.
- Conversion de tablas a HTML, incluidas tablas complejas y multiples tablas por pagina.
- Generacion de descripciones de figuras y elementos (`caption`).
- Clasificacion y extraccion por tipo de elemento mediante el parametro `category`: `plain`, `text`, `table`, `formula`, `caption`, `footnote`, `list-item`, `page-footer`, `page-header`, `section-header`, `title`.
- Procesamiento por lotes (listas de imagenes) en una sola llamada.
- Modo OCR end-to-end (recomendado para la mayoria de documentos) y modo en dos etapas con deteccion de layout previa mediante PP-DocLayoutV3, pensado para paginas muy densas como periodicos.
- Manejo de documentos degradados, escaneos historicos, escritura manuscrita y capturas del mundo real con texto en escena, segun la model card.
- Reduccion de alucinaciones y bucles gracias al post-entrenamiento con GRPO.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso orientado a agentes, vision general (mas alla de documentos), audio ni modo de razonamiento explicito.

## Casos de uso

- Digitalizacion masiva de archivos historicos: el modelo acepta escaneos degradados y documentos historicos en su mezcla de finetuning, y puede procesarse por lotes con `model.generate([...])` para convertir colecciones completas en texto indexable, con la ventaja de un coste por pagina muy bajo al ser un modelo de 270M.
- Extraccion de tablas financieras y tecnicas: la salida en HTML y la recompensa TEDS durante el entrenamiento con GRPO estan orientadas especificamente a preservar la estructura de tablas complejas, lo que permite alimentar directamente hojas de calculo o bases de datos sin post-procesado manual de la estructura.
- Conversion de articulos cientificos a formato estructurado: la combinacion de extraccion de formulas en LaTeX y de texto plano facilita la conversion de PDFs y preprints a Markdown o LaTeX reutilizable en gestores de referencias y repositorios academicos.
- Automatizacion de cuentas de gastos: los recibos y documentos cotidianos forman parte explicita de la mezcla de entrenamiento, de modo que se puede extraer texto y tablas de facturas o tickets para introducirlos en un sistema de contabilidad, ejecutando el modelo en local sobre una GPU de consumo.
- Digitalizacion de formularios manuscritos: la version 1.5 incorpora escritura manuscrita y documentos del mundo real, lo que permite procesar notas y formularios rellenados a mano cuando se combina con la deteccion de layout en dos etapas para separar regiones.
- Procesamiento de periodicos y documentos densos: para paginas con mucho contenido se puede usar el pipeline de dos etapas (`generate_with_layout`), que detecta regiones con PP-DocLayoutV3 y ejecuta Falcon-OCR independientemente sobre cada recorte con el prompt de categoria adecuado, con soporte de `ocr_batch_size` para paralelizar.
- Accesibilidad documental: convertir imagenes de documentos en texto plano y encabezados etiquetados (`title`, `section-header`, `page-header`) permite generar versiones legibles por lectores de pantalla manteniendo la jerarquia del documento.
- Servicio de OCR en produccion con alto throughput: al ejecutarse sobre vLLM y ofrecer entre 2 y 3 veces mas throughput que los VLM de OCR de clase 0.9B, es adecuado para APIs de conversion documental con requisitos de latencia estrictos o volumenes elevados por GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con MMLU, HumanEval, GSM8K ni metricas de OCR como edit distance o TEDS frente a otros modelos; unicamente se afirma que el throughput en despliegue con vLLM es de 2 a 3 veces superior al de los VLM de OCR de clase 0.9B, sin cifras concretas. El repositorio de HuggingFace incluye la etiqueta `eval-results`, pero no se han proporcionado los datos asociados.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0.6 GB solo para los pesos en bfloat16 (270M parametros), a lo que hay que sumar activaciones y cache de atencion dependientes de la resolucion de imagen y del batch. El repositorio ocupa 5.4 GB, un tamano muy superior al de los pesos en bf16, por lo que puede incluir revisiones antiguas o artefactos adicionales; conviene comprobar los ficheros antes de planificar el almacenamiento.
- Cabe con holgura en GPU de consumo: cualquier GPU con 8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para inferencia en bfloat16. En GPU con menos memoria es probable que tambien funcione, pero no se documentan cuantizaciones oficiales.
- GPU recomendadas para produccion: A100, H100 o L40S para servir en vLLM con batches grandes. El modelo esta pensado para maximizar throughput por GPU, por lo que el interes en hardware de datacenter esta en el numero de paginas por segundo y no en la viabilidad del despliegue.
- Si se usa el pipeline de dos etapas, la model card indica que el modelo de layout PP-DocLayoutV3 se carga de forma perezosa en la primera llamada a `generate_with_layout()` y se ejecuta en la misma GPU que el modelo de OCR, por lo que hay que sumar su consumo de memoria.
- Opciones de despliegue: vLLM (escenario de referencia del autor, con imagen Docker publicada en `ghcr.io/tiiuae/falcon-ocr:latest`), `transformers` con `AutoModelForCausalLM`, `trust_remote_code=True` y `device_map="auto"`. No se documenta soporte de llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Latencia y throughput: no se publican cifras absolutas. La unica referencia cuantitativa es la comparacion relativa de 2 a 3 veces mas throughput que los VLM de OCR de clase 0.9B en despliegue con vLLM, dependiendo de la longitud de secuencia y la configuracion de batch. La primera inferencia puede ser mas lenta por la compilacion de kernels de `torch.compile`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Falcon-OCR 1.5 | 269.944.416 (aproximadamente 270M) | no disponible | 2-3x mas throughput que VLM de OCR de clase 0.9B en vLLM; sin benchmarks publicados | Apache 2.0 | HuggingFace, codigo en GitHub, imagen Docker |
| VLM de OCR de clase 0.9B (categoria citada en la model card, p. ej. PaddleOCR-VL) | aproximadamente 0.9B | no disponible | referencia de comparacion de throughput del autor | no disponible | no disponible |
| Modelos de documentos de escala similar (familia sub-1B de OCR documental) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Falcon-Perception (`tiiuae/falcon-perception`) | no disponible | no disponible | no disponible | no disponible | HuggingFace; citado por el autor como modelo de percepcion relacionado |

No se dispone de datos verificables de parametros, contexto, licencia ni benchmarks de los modelos alternativos en la informacion proporcionada, salvo la referencia cualitativa del propio autor a los VLM de OCR de clase 0.9B. Se recomienda consultar las model cards oficiales antes de establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No se publican resultados de benchmarks, por lo que cualquier decision de adopcion en produccion deberia basarse en una evaluacion propia sobre el corpus objetivo.
- La model card no especifica los idiomas soportados ni el comportamiento sobre alfabetos no latinos; el entrenamiento se documenta en ingles y no hay garantias sobre otros idiomas o sistemas de escritura.
- Riesgo de alucinacion: el propio autor reconoce que el modelo puede generar texto plausible que no aparece en la pagina. El post-entrenamiento con GRPO y las compuertas estructurales mitigan el problema, pero no lo eliminan.
- Riesgo de bucles degenerativos (repeticion de frases o filas de tabla) y de over-generation en paginas con poco contenido; tambien se mitiga con GRPO, no se garantiza su ausencia.
- Riesgo de omision silenciosa de bloques presentes en el documento, comportamiento penalizado explicitamente durante el entrenamiento, lo que indica que sigue siendo un modo de fallo relevante.
- El modelo esta especializado en documentos. No es un VLM de proposito general: no se documentan capacidades de descripcion de escenas naturales, respuesta a preguntas visuales, tool calling, agentes ni razonamiento multi-paso.
- Requiere `trust_remote_code=True` y `custom_code`, lo que implica ejecutar codigo del repositorio de HuggingFace. Conviene auditar ese codigo en entornos con requisitos de seguridad estrictos.
- Dependencia de PyTorch >= 2.5 por FlexAttention y de `torch.compile`; versiones anteriores no son compatibles y la primera inferencia puede tener una latencia adicional por compilacion.
- No hay cuantizaciones oficiales ni pesos GGUF publicados, lo que limita el despliegue en entornos de CPU o en GPUs con muy poca memoria.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion sin restricciones adicionales mas alla de mantener el aviso de licencia. No se documentan clausulas de uso aceptable adicionales.
- El repositorio ocupa 5.4 GB frente a los aproximadamente 0.6 GB que ocuparian los pesos en bfloat16, una discrepancia que conviene verificar antes de desplegar en entornos con almacenamiento limitado.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; toda la informacion anterior procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tiiuae/Falcon-OCR
- Codigo e motor de inferencia (Falcon-Perception): https://github.com/tiiuae/Falcon-Perception
- Informe tecnico (arXiv): https://arxiv.org/pdf/2603.27365
- Modelo de percepcion relacionado: https://huggingface.co/tiiuae/falcon-perception
- Imagen Docker para vLLM: https://ghcr.io/tiiuae/falcon-ocr:latest
- Detector de layout utilizado en el pipeline de dos etapas (PP-DocLayoutV3): https://huggingface.co/PaddlePaddle/PP-DocLayoutV3_safetensors
- No se han encontrado otros enlaces relevantes en la busqueda web.
