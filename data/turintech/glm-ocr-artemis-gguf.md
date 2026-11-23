# turintech/GLM-OCR-Artemis-GGUF

## Resumen

GLM-OCR-Artemis-GGUF es una cuantización en formato GGUF del modelo de visión-lenguaje zai-org/GLM-OCR, publicada por TurinTech bajo su pipeline propio de compresión denominado Artemis. El modelo está especializado en reconocimiento óptico de caracteres (OCR) de texto, fórmulas matemáticas y tablas a partir de imágenes, y se distribuye empaquetado para su ejecución con llama.cpp, lo que permite desplegarlo en hardware de consumo sin necesidad de infraestructura de GPU de datacenter.

El modelo base cuenta con 891.138.048 parámetros (aproximadamente 891 millones), lo que lo sitúa en la categoría de modelos pequeños específicos de tarea. La versión publicada incluye un único fichero de pesos cuantizado en Q2_K de 359,7 MB, acompañado de un proyector multimodal (mmproj) obligatorio para procesar imágenes. Según la model card, el fichero alcanza un error de edición normalizado (NED) de 0,0264 frente a las respuestas del modelo original en BF16 sobre 2.012 recortes de imagen, con un pico de memoria GPU de 3,38 GiB.

Su relevancia radica en la combinación de tamaño reducido, licencia MIT y compatibilidad con llama.cpp: permite ejecutar OCR de tablas y fórmulas en una GPU de consumo de 12 GB (RTX 3060) con latencias propias de un modelo local, algo poco habitual en pipelines de OCR basados en modelos visión-lenguaje. La model card reporta además resultados sobre el conjunto de evaluación olmOCR-bench, con un 64,5% de tests superados en las 188 páginas de tablas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (image-text-to-text); detalles internos del base no disponibles |
| Parametros totales | 891.138.048 (aprox. 891 M) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de ejecución usa `-c 16384` en llama-server |
| Tipos de cuantizacion | Q2_K (único fichero de modelo publicado); proyector en Q8_0 y F16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); modelo base original en safetensors/BF16 |
| Tamano del fichero | 359,7 MB (Q2_K) + 484 MB (mmproj Q8_0) o 869 MB (mmproj F16) |
| Memoria GPU pico | 3,38 GiB (medida con RTX 3060 12 GB, llama.cpp b12110) |
| Version minima de llama.cpp | b12110 |
| Prompts soportados | `Text Recognition:`, `Formula Recognition:`, `Table Recognition:` |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base zai-org/GLM-OCR en la documentación proporcionada: no se especifica si emplea un transformer denso, un esquema MoE ni el tipo de encoder visual. Lo que sí se documenta es el pipeline de compresión Artemis aplicado por TurinTech, que produce una cuantización Q2_K con un NED de 0,0264 respecto a BF16 sobre 2.012 recortes, frente al 0,0968 de la cuantización Q2_K de mradermacher del mismo modelo. La diferencia pareada frente a esa alternativa es de −0,0705 con intervalo de confianza [−0,0767, −0,0644].

El proceso de evaluación descrito en la model card incluye una comprobación de liberación sobre páginas completas sin modelo de layout, con 1.022 tests sobre las 188 páginas de tablas de olmOCR-bench. El fichero supera el 64,5% de esos tests, frente al 61,4% de la Q3_K_M de mradermacher, el 52,6% de su Q2_K y el 58,7% del BF16 original. La model card advierte que la comparación con BF16 no fue preregistrada y no demuestra superioridad sobre el original. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO).

## Capacidades

- Reconocimiento de texto en imágenes (OCR) mediante el prompt `Text Recognition:`.
- Reconocimiento de fórmulas matemáticas mediante el prompt `Formula Recognition:`.
- Reconocimiento de tablas mediante el prompt `Table Recognition:`, con salida en HTML en el campo `choices[0].message.content`.
- Procesamiento de imágenes a través de un proyector multimodal obligatorio (`mmproj`), servido junto al modelo en llama-server.
- Conversación multimodal en formato OpenAI-compatible (`/v1/chat/completions`) con contenido de tipo `image_url` en base64.
- Generación con temperatura 0 recomendada en los ejemplos de la model card, orientada a transcripción determinista.
- Soporte de hasta 8.192 tokens de salida (`-n 8192`), necesario para evitar truncamientos en tablas largas.
- No se documentan capacidades de tool calling, agentes, audio ni modo de razonamiento explícito.

## Casos de uso

- Digitalización de tablas financieras o científicas: el modelo devuelve HTML estructurado a partir de capturas o páginas escaneadas, lo que permite integrar la salida directamente en pipelines de extracción de datos sin postprocesado de layout adicional.
- Extracción de fórmulas en documentación técnica y papers: con el prompt `Formula Recognition:` se pueden convertir imágenes de ecuaciones en LaTeX para su reutilización en editores o repositorios de documentación científica.
- OCR en entornos con GPU de consumo: al requerir 3,38 GiB de VRAM pico, cabe en una RTX 3060 de 12 GB y permite desplegar el servicio en estaciones de trabajo locales sin depender de APIs externas.
- Procesamiento por lotes de documentos escaneados: la integración con llama-server y la API compatible con OpenAI facilitan scripts de ingesta masiva que envían imágenes en base64 y recogen la transcripción.
- Automatización de archivo y cumplimiento documental: la licencia MIT y la ejecución local permiten procesar documentos sensibles sin enviarlos a terceros, algo relevante en sectores regulados.
- Prototipado rápido de aplicaciones de visión: el tamaño reducido del fichero (359,7 MB) y su descarga vía `hf download` simplifican la incorporación del modelo en demos y entornos de desarrollo con recursos limitados.
- Verificación de calidad en pipelines de OCR existentes: la métrica NED frente a BF16 y los resultados en olmOCR-bench permiten usar esta cuantización como referencia para comparar alternativas de compresión del mismo modelo base.

## Benchmarks y rendimiento

| Metrica | TurinTech Q2_K | mradermacher Q2_K | mradermacher Q3_K_M | BF16 original |
|---|---|---|---|---|
| Tamano del fichero | 359,7 MB | 361,4 MB | 450,1 MB | 1.785,8 MB |
| NED a BF16 (macro, 2.012 recortes) | 0,0264 | 0,0968 | 0,0289 | referencia |
| Tablas desbocadas (de 1.112) | 3 | 27 | 3 | referencia |
| olmOCR-bench, tests superados (1.022 tests, 188 páginas) | 64,5% | 52,6% | 61,4% | 58,7% |

La model card indica que el fichero no cumplió su propia regla de liberación (máximo 2 tablas desbocadas; este tiene 3). La comparación frente a la Q3_K_M de mradermacher no separa estadísticamente ambos ficheros en cercanía a BF16 (−0,0025 [−0,0063, +0,0008]). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,38 GiB de pico con el fichero Q2_K y el proyector Q8_0, medido en una NVIDIA GeForce RTX 3060 de 12 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; validado en RTX 3060 12 GB. Para mayor margen, A100, H100 o RTX 4090 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060 y superiores; el límite práctico lo marca el proyector y el contexto configurado.
- Opciones de despliegue: llama.cpp (versión b12110 o superior), mediante `llama-server` con `--mmproj`; no se documentan otros runners en la información disponible.
- Comando de referencia: `llama-server -m GLM-OCR-Artemis-Q2_K.gguf --mmproj mmproj-Q8_0.gguf -ngl 99 -c 16384 --image-max-tokens 6144 -n 8192 --port 8080`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| turintech/GLM-OCR-Artemis-GGUF (Q2_K) | 891 M | no disponible (ejemplo con 16.384) | MIT | GGUF | NED 0,0264; 64,5% en olmOCR-bench |
| mradermacher GLM-OCR Q2_K | 891 M (mismo base) | no disponible | MIT (heredada) | GGUF | NED 0,0968; 52,6% en olmOCR-bench |
| mradermacher GLM-OCR Q3_K_M | 891 M (mismo base) | no disponible | MIT (heredada) | GGUF | NED 0,0289; 61,4% en olmOCR-bench |
| zai-org/GLM-OCR (BF16) | 891 M | no disponible | MIT | safetensors | Referencia de calidad; 58,7% en olmOCR-bench |

Las alternativas comparables en la información disponible son únicamente otras cuantizaciones del mismo modelo base. No se dispone de datos sobre modelos OCR de otros autores para establecer una comparación cruzada.

## Limitaciones y advertencias

- La cuantización Q2_K introduce degradación respecto a BF16 (NED 0,0264), aceptable para OCR pero no despreciable en tablas complejas.
- Se detectaron 3 tablas desbocadas de 1.112 que agotaron el límite de 8.192 tokens, por lo que se recomienda mantener `-n 8192` para evitar truncamientos.
- Las páginas con varias tablas pueden devolverse solo parcialmente, según advierte la model card.
- La comparación con BF16 en olmOCR-bench no fue preregistrada y no debe interpretarse como superioridad del fichero cuantizado sobre el original.
- El modelo requiere un proyector multimodal: sin `--mmproj` no puede leer imágenes.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento ante entradas fuera de dominio.
- Riesgo de alucinación en texto manuscrito o de baja calidad no cuantificado en la información disponible.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base zai-org/GLM-OCR enlazadas en la model card.
- El ejemplo de ejecución está validado únicamente con llama.cpp b12110 o superior; versiones anteriores pueden no funcionar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/GLM-OCR-Artemis-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-OCR
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-OCR/blob/2e85a62840ccac27daa451df36c736c4636b8628/README.md
- Resultados completos y metodología: https://huggingface.co/turintech/GLM-OCR-Artemis-GGUF/blob/main/RESULTS.md
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
- Referencia arXiv citada en los tags: arxiv:2603.10910
