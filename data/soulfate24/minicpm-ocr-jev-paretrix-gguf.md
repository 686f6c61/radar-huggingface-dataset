# Soulfate24/MiniCPM-OCR-Jev-Paretrix-GGUF

## Resumen

MiniCPM-OCR-Jev-Paretrix-GGUF es una cuantizacion GGUF del modelo multimodal openbmb/MiniCPM-OCR-Jev, publicada por el usuario Soulfate24 bajo el paraguas de su suite Paretrix. El modelo base es un vision-language especializado en OCR y verificacion de correccion de transcripciones: recibe una imagen y texto y emite una decision sobre si la lectura OCR es correcta. Esta version cuantizada anade el prefijo "Jev" del modelo original y emplea una planificacion de cuantizacion por tramos (rungs) guiada por mediciones de activacion, en lugar de una asignacion uniforme de bits.

El modelo cuenta con 1.881.829.184 parametros (aproximadamente 1,88 mil millones) segun los pesos en safetensors, y el repositorio GGUF ocupa 10,5 GB en total, incluyendo multiples variantes de cuantizacion que van desde Q8_0 (1919 MiB) hasta Femto-21pc (804 MiB). La licencia es Apache 2.0 y los idiomas declarados son ingles y chino.

Su relevancia actual radica en que demuestra una metodologia de cuantizacion empirica que mantiene la precision del verificador OCR (86,0 de accuracy en BF16 frente a 85,3-86,7 en las variantes cuantizadas) incluso en niveles de compresion agresivos, con un AUROC estable en torno a 0,940-0,942. Esta pensado para integrarse en pipelines de verificacion OCR que necesiten ejecutarse en hardware modesto mediante llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (base MiniCPM-OCR-Jev); detalles de capas y atencion no disponibles |
| Parametros totales | 1.881.829.184 (1,88 B) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Fidelity-48pc, Precision-42pc, Q5_K_M-imx, Quality-36pc, Compact-33pc, IQ4_XS-imx, Mini-30pc, IQ3_M-imx, Nano-27pc, Pico-24pc, Femto-21pc |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base es un vision-language de la familia MiniCPM orientado a OCR y verificacion de correccion. La informacion disponible no detalla el numero de capas, la dimension oculta ni la composicion exacta del dataset de entrenamiento, ni si se aplicaron fases de RLHF o DPO. El pipeline declarado es image-text-to-text y la libreria asociada es transformers.

La innovacion destacable de esta publicacion es el esquema de cuantizacion Paretrix. Segun la model card, el proceso parte de tres bases (Q8_0, Q6_K-imx e IQ4_XS-imx) y mueve cada clase de tensor individualmente a cada tipo de cuantizacion, midiendo el efecto contra los logits BF16. Con esas mediciones, un problema de mochila exacto (knapsack) planifica cada tramo, y un duelo en el regimen de veredicto decide si el plan sustituye al campeon. El resultado son variantes como Fidelity-48pc, Precision-42pc o Pico-24pc, donde el sufijo indica el porcentaje de presupuesto o tamano relativo respecto a la referencia. La suite declara que lo medido en un modelo se hereda al siguiente de la misma familia.

## Capacidades

- Verificacion de correccion OCR: dada una imagen y una transcripcion, el modelo emite una decision sobre si la lectura es correcta.
- Extraccion de caracteristicas (feature-extraction) y salida de puntuaciones de confianza (AUROC) para umbralizar decisiones.
- Procesamiento multimodal imagen-texto (image-text-to-text).
- Decisiones binarias o de veredicto con porcentaje de decisiones decisivas (decisive) reportado en los benchmarks.
- Soporte multilingue limitado a ingles y chino.
- Compatibilidad con endpoints (tag endpoints_compatible) y despliegue via llama.cpp.
- No se declara soporte explicito de tool calling, function calling ni modos de razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Verificacion automatica de digitalizaciones: el modelo recibe la imagen del documento y la transcripcion generada por un OCR previo, y emite un veredicto de correccion para marcar que paginas requieren revision humana. Su AUROC de 0,940 permite fijar umbrales de confianza fiables.
- Control de calidad en pipelines de facturacion: se usa como segunda etapa tras un OCR comercial para detectar lecturas erroneas de importes o numeros de referencia antes de contabilizarlos, aprovechando la variante Pico-24pc (907 MiB) para despliegue en servidores sin GPU dedicada.
- Moderacion de contenido escaneado: verificacion de que las transcripciones de formularios o documentos oficiales en ingles o chino coinciden con la imagen, con decisiones trazables por el campo "decisive" del benchmark.
- Enrutamiento de documentos en entornos de bajo recursos: la variante Femto-21pc (804 MiB) permite ejecutar el verificador en CPUs o GPUs de gama baja dentro de un pipeline de clasificacion documental.
- Investigacion en cuantizacion: el repositorio sirve como referencia para reproducir la metodologia Paretrix comparando cada tramo contra BF16 con las mismas 300 filas de JevOCRBench.
- Integracion en herramientas de escritorio: al ser GGUF y compatible con llama.cpp, puede embeberse en aplicaciones locales de escaneo y archivo que necesiten verificar OCR sin conexion a la nube.
- Evaluacion de sesgos de cuantizacion: los datos de "flips" (cambios de decision respecto a la referencia) permiten estudiar la estabilidad de decisiones bajo compresion, con valores entre 1 y 12 segun la variante.

## Benchmarks y rendimiento

Resultados sobre JevOCRBench (300 filas, protocolo del propio verificador):

| Modelo | MiB | acc | AUROC | same | flips | decisive | opt KL | p50 ms |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| BF16 (referencia) | 3601 | 86,0 | 0,942 | ref | — | — | — | — |
| Q8_0 (stock) | 1919 | 86,3 | 0,942 | 99,0 | 3 | 100,0 | 0,0007 | 179 |
| Fidelity-48pc | 1732 | 86,3 | 0,941 | 99,0 | 3 | 100,0 | 0,0005 | 173 |
| Precision-42pc | 1484 | 86,7 | 0,942 | 98,0 | 6 | 100,0 | 0,0008 | 179 |
| Q5_K_M-imx (stock) | 1346 | 85,7 | 0,940 | 97,7 | 7 | 100,0 | 0,0010 | 170 |
| Quality-36pc | 1328 | 86,0 | 0,940 | 99,3 | 2 | 100,0 | 0,0007 | 175 |
| Compact-33pc | 1220 | 85,7 | 0,941 | 99,7 | 1 | 100,0 | 0,0009 | 171 |
| IQ4_XS-imx (stock) | 1141 | 85,3 | 0,941 | 98,0 | 6 | 100,0 | 0,0022 | 169 |
| Mini-30pc | 1112 | 86,0 | 0,940 | 98,0 | 6 | 100,0 | 0,0016 | 166 |
| IQ3_M-imx (stock) | 1010 | 85,3 | 0,940 | 96,0 | 12 | 98,6 | 0,0089 | 177 |
| Nano-27pc | 1010 | 85,7 | 0,940 | 98,3 | 5 | 100,0 | 0,0020 | 171 |
| Pico-24pc | 907 | 85,3 | 0,939 | 97,3 | 8 | 99,6 | 0,0031 | 167 |
| Femto-21pc | 804 | 86,0 | 0,941 | 97,3 | 8 | 99,6 | 0,0089 | 177 |

## Requisitos de hardware

- VRAM estimada: desde aproximadamente 0,8 GB para Femto-21pc hasta 1,9 GB para Q8_0, sin contar el codificador de vision ni el contexto KV.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU con 4 GB o mas de VRAM deberia alojar las variantes mas pequenas.
- Cabe en GPU de consumo: si, practicamente todas las variantes (por debajo de 2 GB de pesos) caben en tarjetas consumer tipo RTX 3060, RTX 4060 o superiores.
- Despliegue: llama.cpp (etiqueta declarada) y, por compatibilidad GGUF, herramientas derivadas como Ollama o servidores basados en llama.cpp. La etiqueta endpoints_compatible sugiere integracion con endpoints.
- Latencia: p50 entre 166 y 179 ms por peticion segun variante en el benchmark reportado por el autor; no se especifica el hardware de medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
| :--- | ---: | ---: | :--- | :--- | :--- |
| MiniCPM-OCR-Jev-Paretrix-GGUF | 1,88 B | No disponible | Apache 2.0 | GGUF | Verificador OCR cuantizado; acc 85,3-86,7 en JevOCRBench |
| openbmb/MiniCPM-OCR-Jev (base) | No disponible | No disponible | Apache 2.0 | safetensors | Referencia BF16; acc 86,0, AUROC 0,942 |
| Q8_0 stock | 1,88 B | No disponible | Apache 2.0 | GGUF | Cuantizacion uniforme de referencia; 1919 MiB |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de proposito general; su funcion es verificar correccion OCR, no generar texto libre ni razonar sobre otros dominios.
- Idiomas limitados a ingles y chino; el rendimiento fuera de esos idiomas no esta documentado.
- Riesgo de alucinacion en la decision: aunque el AUROC es alto (0,939-0,942), existe una tasa de "flips" de hasta 12 decisiones respecto a BF16 en IQ3_M-imx.
- Las variantes mas agresivas (Pico-24pc, Femto-21pc) reducen "decisive" al 99,6 %, lo que implica decisiones no concluyentes en algunos casos.
- Los benchmarks proceden del propio autor del repositorio y estan medidos sobre 300 filas; no hay validacion independiente en la informacion disponible.
- El modelo base es del que no se documentan sesgos especificos; conviene evaluar el sesgo en documentos reales antes de produccion.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base openbmb/MiniCPM-OCR-Jev.
- Repositorio sin descargas ni likes en el momento de la consulta; tratar como publicacion reciente y poco validada por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/MiniCPM-OCR-Jev-Paretrix-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- Suite Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
