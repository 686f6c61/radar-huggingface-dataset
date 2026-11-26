# Suraponn/typhoon-ocr2-0.8b-GGUF

## Resumen

Typhoon OCR V2 0.8B GGUF es la distribucion cuantizada en formato GGUF del modelo Typhoon OCR V2 0.8B, un parser de documentos desarrollado por Typhoon AI (SCB 10X) para tailandes e ingles. Dada una imagen de pagina, el modelo devuelve los elementos de maquetacion en orden de lectura, cada uno con su categoria, caja delimitadora (bbox) y texto: tablas en HTML, formulas en LaTeX y texto plano en Markdown. Ademas responde preguntas sobre un documento y extrae informacion clave en JSON.

Esta version GGUF esta pensada para llama.cpp y herramientas derivadas (llama-server, interfaces OpenAI-compatibles), e incluye ficheros de distintos niveles de cuantizacion mas un codificador de imagen `mmproj` obligatorio en todos los casos. El modelo base tiene 752.393.024 parametros (aproximadamente 0,8 mil millones), lo que lo situa en el rango de modelos pequenos desplegables en hardware modesto.

Su relevancia actual radica en que ofrece OCR estructurado de alta precision (77,4 en MDPBench, 77,2 en MDPBench Thai con los pesos originales) en un paquete de menos de 1 GB con cuantizacion Q8_0, manteniendo la precision intacta y permitiendo inferencia local sin GPU de datacenter. La licencia es Apache 2.0, con sujecion adicional a los OpenTyphoon Terms and Conditions.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo vision-lenguaje con codificador de imagen separado `mmproj`); el informe tecnico arXiv:2611.27494 describe el metodo |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 40.960 tokens en la configuracion recomendada (16.384 tokens de imagen + 16.384 de respuesta con margen) |
| Tipos de cuantizacion | f16 (16 bits), Q8_0 (8 bits), Q4_K_M (4 bits, k-quant medium) |
| Idiomas soportados | Tailandes (th), ingles (en) |
| Licencia | Apache 2.0, sujeta a OpenTyphoon Terms and Conditions |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un parser de documentos multimodal: recibe una imagen de pagina y genera una estructura JSON con elementos de maquetacion en orden de lectura. La distribucion GGUF separa el codificador de imagen en un fichero `mmproj` en f16 (205 MB) que debe acompanar a cualquier fichero de pesos, y mantiene los pesos del modelo de lenguaje en el fichero principal. El modelo fue entrenado sin bloque de *thinking*, por lo que se recomienda desactivar el razonamiento (`--reasoning off`) en llama.cpp para evitar que la plantilla de chat abra un bloque no entrenado.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan recogidos en la informacion disponible de esta ficha; la model card principal del modelo base y el informe tecnico arXiv:2611.27494 los documentan. Una innovacion destacable es el esquema de tokens de imagen: un token de imagen cubre 32x32 pixeles, y con `--image-max-tokens 16384` se permite procesar paginas de hasta 16,7 MP, lo que preserva legibilidad de texto pequeno (especialmente en tailandes). El modelo esta entrenado con un conjunto fijo de prompts; para parseo de pagina completa debe usarse el prompt exacto documentado en la model card.

## Capacidades

- Parseo de maquetacion de pagina completa: devuelve lista JSON de elementos con bbox (rejilla 0-1000 relativa a ancho y alto), categoria y texto.
- Categorias de maquetacion soportadas: header, title, text, figure, table, formula, figure_caption, table_caption, formula_caption, figure_footnote, table_footnote, page_footnote, footer.
- Conversion de tablas a HTML y de formulas a LaTeX; texto general en Markdown.
- Ordenacion de elementos en orden de lectura humano.
- Respuesta a preguntas sobre un documento (document QA).
- Extraccion de informacion clave en formato JSON.
- Capacidades multilingues limitadas a tailandes e ingles, con enfasis declarado en tailandes (el modelo lee peor imagenes pequenas, especialmente en tailandes).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Digitalizacion de archivos PDF escaneados: el modelo convierte cada pagina en elementos estructurados JSON con bbox, permitiendo reconstruir el documento en Markdown o HTML y preservar la maquetacion original para auditoria.
- Extraccion de tablas financieras o administrativas: al devolver tablas en HTML, se pueden insertar directamente en pipelines de datos o convertir a CSV/DataFrame sin post-procesado geometrico complejo.
- Procesamiento de formularios y documentos tailandeses: el enfasis del modelo en tailandes y su tolerancia a imagenes fotografiadas lo hacen adecuado para digitalizar tramites, facturas y formularios en entornos donde el OCR generico falla.
- Conversion de formulas cientificas a LaTeX: articulos y apuntes con formulas se pueden transcribir a LaTeX listo para compilar o editar, reduciendo revision manual.
- Document QA sobre contratos o manuales: con hasta 16.384 tokens de imagen y 16.384 de respuesta, se puede cargar una pagina y formular preguntas concretas sobre su contenido en un unico turno.
- Extraccion de metadatos como JSON: integrable en pipelines de ingestao documental para poblar bases de datos con campos clave (titulos, importes, fechas) sin reglas especificas por plantilla.
- Despliegue local en estaciones de trabajo: con Q8_0 (812 MB) y `mmproj` (205 MB), se puede servir via llama-server en una maquina con GPU consumer, evitando enviar documentos sensibles a servicios externos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre MDPBench (320 paginas tailandesas e inglesas, digitales y fotografiadas), con `llama-server` (build a691b23, CUDA, NVIDIA H100), decodificacion greedy, thinking off y presupuesto de imagen de 16.384 tokens:

| Fichero | Precision | Tamano | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | – | 77,4 | 77,2 |
| `typhoon-ocr2-0.8b-f16.gguf` | 16 bits, sin cuantizacion | 1,52 GB | 77 | 76,9 |
| `typhoon-ocr2-0.8b-Q8_0.gguf` | 8 bits | 812 MB | 77,4 | 78 |
| `typhoon-ocr2-0.8b-Q4_K_M.gguf` | 4 bits (k-quant medium) | 529 MB | 75,8 | 76,7 |
| `mmproj-typhoon-ocr2-0.8b-f16.gguf` | codificador de imagen f16 (necesario con todos) | 205 MB | – | – |

Q8_0 iguala a f16 y a los pesos originales (77,4) con aproximadamente la mitad del tamano de f16; Q4_K_M queda unos 1,5 puntos por debajo en global. Diferencias de decimas entre ficheros estan dentro de la variacion entre ejecuciones. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M (529 MB) + mmproj (205 MB) caben en menos de 1 GB; Q8_0 (812 MB) + mmproj en torno a 1 GB; f16 (1,52 GB) + mmproj cerca de 1,8 GB. A esto hay que sumar KV cache para contexto de 40.960 tokens y buffers de imagen.
- GPU recomendadas: los benchmarks se ejecutaron en NVIDIA H100; para inferencia basta una GPU consumer con al menos 2-4 GB de VRAM libre para Q8_0 con contexto largo.
- Cabe en GPU consumer: si, practicamente cualquier GPU moderna (RTX 3060 en adelante) para Q8_0; Q4_K_M en GPUs con 2 GB o incluso CPU.
- Opciones de despliegue: llama.cpp (`llama-server`) con endpoint OpenAI-compatible; descarga directa con `-hf typhoon-ai/typhoon-ocr2-0.8b-GGUF:Q8_0`. No se documentan otras opciones (vLLM, TGI, Ollama) para esta distribucion GGUF en la informacion disponible.
- Parametros de servicio recomendados: `--jinja --reasoning off -c 40960 --image-max-tokens 16384 -ngl 999`; para varias peticiones concurrentes, `-np N` y multiplicar `-c` por N.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Typhoon OCR V2 0.8B GGUF (este) | 752 M | 40.960 tokens (imagen + respuesta) | OCR estructurado th/en, JSON con bbox | Apache 2.0 + OpenTyphoon T&C | GGUF en HF, llama.cpp |
| Typhoon OCR V2 0.8B (original) | 752 M | No disponible | Mismo modelo, pesos bf16 | Apache 2.0 + OpenTyphoon T&C | HF, vLLM |
| Otros modelos OCR de proposito general | No disponible | No disponible | OCR texto plano | No disponible | No disponible |

No se dispone en la informacion proporcionada de resultados de terceros comparables en MDPBench para establecer una comparativa numerica con alternativas de la misma categoria.

## Limitaciones y advertencias

- Idiomas limitados a tailandes e ingles; no se documenta soporte de otros idiomas.
- El modelo esta entrenado con un conjunto fijo de prompts; desviarse del prompt documentado puede degradar la calidad del parseo.
- Requiere ampliar la imagen para que el lado largo tenga al menos 1.600 pixeles; con imagenes pequenas la lectura empeora, especialmente en tailandes.
- El codificador `mmproj` es obligatorio con todos los ficheros de pesos; sin el, el modelo no procesa imagenes.
- El modelo fue entrenado sin bloque de thinking; dejar el razonamiento activado puede producir salidas anomalas.
- Riesgo de alucinacion en texto ilegible o de baja resolucion: el prompt exige transcripcion literal, pero no hay garantia formal de fidelidad.
- Licencia Apache 2.0 con sujecion adicional a los OpenTyphoon Terms and Conditions; revisar estos terminos antes de uso comercial.
- Sin datos publicados de sesgos, latencia o throughput en la informacion disponible.
- El uso de contexto de 40.960 tokens consume KV cache proporcional; planificar VRAM en despliegues concurrentes.

## Enlaces

- Modelo GGUF: https://huggingface.co/Suraponn/typhoon-ocr2-0.8b-GGUF
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Informe tecnico: https://arxiv.org/abs/2611.27494
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Terminos OpenTyphoon: https://opentyphoon.ai/tac
