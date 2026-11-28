# turintech/GLM-OCR-Artemis-GGUF

## Resumen

GLM-OCR-Artemis-GGUF es una cuantización en formato GGUF del modelo zai-org/GLM-OCR, un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) de texto, fórmulas matemáticas y tablas. La conversión y compresión la ha realizado TurinTech mediante su pipeline Artemis, orientado a producir archivos GGUF ejecutables en llama.cpp con una degradación mínima respecto al original en BF16. El modelo resuelve el problema de desplegar OCR de alta calidad en entornos locales sin GPU de datacenter, ya que el archivo principal ocupa 359,7 MB y requiere aproximadamente 3,38 GiB de memoria de GPU cuando se procesan imágenes.

El modelo base es un transformer multimodal de tipo image-text-to-text con 891.138.048 parámetros totales, pensado para recibir una imagen y una instrucción textual breve (`Text Recognition:`, `Formula Recognition:` o `Table Recognition:`) y devolver el contenido reconocido, con las tablas en HTML. Esta versión cuantizada mantiene el pipeline conversacional y es compatible con endpoints, de modo que puede servirse mediante la API de chat completions de llama-server.

Su relevancia actual radica en que demuestra que un OCR especializado puede ejecutarse en hardware de consumo con una fidelidad cercana al BF16: la distancia de edición normalizada (NED) macro frente al original es de 0,0264 en 2.012 recortes, frente a 0,0968 de otra cuantización Q2_K pública del mismo modelo. La licencia MIT facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (modelo base zai-org/GLM-OCR); no se detalla la arquitectura interna en la información disponible |
| Parámetros totales | 891.138.048 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como especificación oficial; la configuración de referencia usa `-c 16384` y hasta 6.144 tokens de imagen |
| Tipos de cuantización | Q2_K (archivo publicado); el repositorio incluye además un proyector `mmproj-Q8_0.gguf` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), con proyector multimodal separado en GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base zai-org/GLM-OCR ni su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí se documenta es el pipeline de cuantización: TurinTech ha comprimido los pesos del modelo original en BF16 a Q2_K mediante su herramienta Artemis, manteniendo el proyector multimodal en Q8_0 como valor por defecto probado. El resultado es un archivo de 359,7 MB que, junto al proyector, permite la inferencia multimodal en llama.cpp.

La innovación destacable de esta ficha no está en el modelo base sino en el método de compresión y en su evaluación: TurinTech mide la distancia de edición normalizada macro frente a las respuestas del BF16 sobre 2.012 recortes de imagen, y controla un fenómeno denominado *table runaways* (respuestas que se prolongan hasta el límite de 8.192 tokens cuando el BF16 se detenía por sí solo). El archivo Q2_K de TurinTech registra 3 casos de 1.112 tablas, frente a 27 de la cuantización Q2_K de mradermacher y 3 de su Q3_K_M. La comparación pareada frente a mradermacher Q2_K arroja una diferencia de NED de −0,0705 (IC [−0,0767, −0,0644]); frente a Q3_K_M la diferencia es −0,0025 (IC [−0,0063, +0,0008]), sin separación estadística.

## Capacidades

- Reconocimiento de texto en imágenes mediante el prompt `Text Recognition:`.
- Reconocimiento de fórmulas matemáticas mediante el prompt `Formula Recognition:`.
- Reconocimiento de tablas mediante el prompt `Table Recognition:`, con salida en HTML.
- Procesamiento de imágenes de página completa, con un límite de tokens de imagen configurable (6.144 en la configuración de referencia con llama-server).
- Interfaz conversacional compatible con la API de chat completions (`/v1/chat/completions`) y con endpoints.
- Entrada multimodal de imagen codificada en base64 dentro del mensaje de usuario.
- Ejecución local en llama.cpp, Ollama y LM Studio.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, audio ni modo de pensamiento.

## Casos de uso

- Digitalización de documentos escaneados: el modelo recibe la imagen de una página y devuelve el texto reconocido; su ventana de 16.384 tokens y el límite de 6.144 tokens de imagen permiten procesar páginas completas sin trocear en exceso.
- Extracción de tablas financieras o administrativas: con el prompt `Table Recognition:` devuelve HTML estructurado, adecuado para volcar directamente a un pipeline de parseo y carga en base de datos. En las 188 páginas de tablas de olmOCR-bench superó el 64,5% de 1.022 pruebas.
- Conversión de fórmulas científicas a formato editable: el prompt `Formula Recognition:` permite extraer expresiones matemáticas de artículos y apuntes escaneados para su uso en LaTeX o editores de ecuaciones.
- Procesamiento por lotes en servidor sin GPU de datacenter: al ocupar unos 3,38 GiB con imágenes y ejecutarse en llama.cpp, puede desplegarse en una única GPU de consumo para digitalizar colas de documentos de forma continua.
- Asistencia a la accesibilidad: convertir imágenes de texto (capturas, fotos de documentos) en texto legible por lectores de pantalla, ejecutando el modelo localmente para no enviar documentos sensibles a servicios externos.
- Integración en aplicaciones de escritorio: los paquetes de Ollama (`turintech/glm-ocr-artemis`) y LM Studio (`turintech/glm-ocr-artemis`) permiten incorporar OCR a herramientas locales sin infraestructura adicional; conviene tener en cuenta que ambas escalan páginas de más de unos 3,2 megapíxeles a unos 4.096 tokens de imagen.
- Verificación de calidad documental en CI: al ser compatible con endpoints, puede integrarse en un servicio HTTP que reciba imágenes y valide la extracción de tablas y texto como parte de pruebas automatizadas.

## Benchmarks y rendimiento

Los datos publicados comparan la fidelidad frente al BF16 y el rendimiento en tablas, no benchmarks estándar de MMLU o HumanEval.

| Archivo | Tamaño | NED a BF16 (macro) | Table runaways (de 1.112) |
|---|---|---|---|
| TurinTech Q2_K | 359,7 MB | 0,0264 | 3 |
| mradermacher Q2_K | 361,4 MB | 0,0968 | 27 |
| mradermacher Q3_K_M | 450,1 MB | 0,0289 | 3 |
| BF16 original | 1.785,8 MB | referencia | referencia |

En la comprobación de páginas completas de olmOCR-bench (188 páginas de tablas, 1.022 pruebas), TurinTech Q2_K pasó el 64,5%, mradermacher Q3_K_M el 61,4%, mradermacher Q2_K el 52,6% y el BF16 el 58,7%. La diferencia frente a mradermacher Q2_K es de +11,8 puntos (IC [+5,5, +18,4]) y frente a Q3_K_M de +3,1 puntos (IC [−1,7, +8,1]), sin separación estadística. La comparación con BF16 no estaba preregistrada.

## Requisitos de hardware

- Memoria de GPU estimada: 3,38 GiB con procesamiento de imágenes, según la medición del autor con el proyector Q8_0.
- Tamaño en disco: 359,7 MB el archivo Q2_K, más el proyector `mmproj-Q8_0.gguf`; el repositorio completo ocupa 1,7 GB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el requisito de memoria (3,38 GiB) es compatible con GPU de consumo de gama media y alta con al menos 4 GB de VRAM.
- Cabe en GPU de consumo: sí, dado el reducido consumo de memoria; no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp (probado con la build b12110 o superior), Ollama y LM Studio.
- Configuración de referencia: `llama-server -m GLM-OCR-Artemis-Q2_K.gguf --mmproj mmproj-Q8_0.gguf -ngl 99 -c 16384 --image-max-tokens 6144 -n 8192 --port 8080`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | NED a BF16 | Licencia | Formato |
|---|---|---|---|---|---|
| TurinTech GLM-OCR-Artemis Q2_K | 891 M | no disponible (config. 16.384) | 0,0264 | MIT | GGUF |
| mradermacher GLM-OCR Q2_K | mismo modelo base | no disponible | 0,0968 | MIT (heredada) | GGUF |
| mradermacher GLM-OCR Q3_K_M | mismo modelo base | no disponible | 0,0289 | MIT (heredada) | GGUF |
| zai-org/GLM-OCR BF16 | 891 M | no disponible | referencia | MIT | safetensors (original) |

No se dispone de información sobre otros modelos OCR comparables ajenos a la familia GLM-OCR.

## Limitaciones y advertencias

- El propio autor indica que el archivo no cumplió su regla de publicación: se permitían como máximo 2 *table runaways* y este archivo registró 3 de 1.112 tablas.
- En 3 de 1.112 tablas la respuesta se prolongó hasta el límite de 8.192 tokens; conviene mantener `-n 8192` para acotar la generación.
- Las páginas con varias tablas pueden devolverse solo parcialmente.
- En Ollama y LM Studio, las páginas de más de unos 3,2 megapíxeles se escalan a unos 4.096 tokens de imagen; en una página de 2.480 × 3.508 la respuesta reducida perdió los separadores de millares y el marcado de cabecera de tabla respecto a llama-server. Con Ollama 0.40.18 puede corregirse iniciando el servidor con `LLAMA_ARG_IMAGE_MAX_TOKENS=6144`.
- La comparación de rendimiento en tablas frente al BF16 no estaba preregistrada, por lo que no debe interpretarse como una ventaja demostrada sobre el original.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones idiomáticas en la información disponible.
- La licencia es MIT, lo que permite uso comercial; el enlace de licencia apunta al README del modelo base.
- No se especifican los idiomas soportados, un dato relevante si se pretende usar el modelo con documentos en castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/GLM-OCR-Artemis-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-OCR
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-OCR/blob/2e85a62840ccac27daa451df36c736c4636b8628/README.md
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Ollama: https://ollama.com/turintech/glm-ocr-artemis
- LM Studio: https://lmstudio.ai/turintech/glm-ocr-artemis
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
- Paper de referencia (arXiv:2603.10910): https://arxiv.org/abs/2603.10910
