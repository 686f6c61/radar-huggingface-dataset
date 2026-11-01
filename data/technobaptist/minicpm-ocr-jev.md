# TechnoBaptist/MiniCPM-OCR-Jev

## Resumen

MiniCPM-OCR Jev es un modelo de evaluación de calidad de resultados OCR desarrollado por el equipo OpenBMB y publicado en HuggingFace bajo el identificador TechnoBaptist/MiniCPM-OCR-Jev. No es un modelo OCR generativo al uso: recibe una región de documento (texto, fórmula o tabla) junto con un resultado OCR candidato y devuelve una puntuación entre 0 y 1 que indica la probabilidad de que ese candidato sea correcto. Esto lo convierte en una pieza de verificación dentro de pipelines OCR, no en el motor de extracción.

El modelo parte de Qwen3.5-2B: conserva el codificador visual y el backbone lingüístico, pero sustituye la cabeza de salida `lm_head` por una cabeza de clasificación binaria. Con 2.213.245.760 parámetros totales (aproximadamente 2B) y un repositorio de 4,4 GB en safetensors, está pensado para ejecutarse en infraestructura modesta, incluso en GPU de consumo, y para integrarse como etapa de filtrado entre el OCR y la revisión humana.

Su relevancia actual reside en que permite automatizar el control de calidad de pipelines OCR reales: autoaceptar regiones fiables, enrutar el resto a revisión humana o seleccionar el mejor candidato entre varios motores OCR. Según la model card, con solo 2B parámetros alcanza un AUROC de decisión de 93,6 (×100) en JevOCRBench, por encima de JEV-35B-A3B (90,1) y cerca de Qwen3.5-397B-A17B (93,8).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer derivada de Qwen3.5-2B, con cabeza de clasificación binaria en lugar de `lm_head` |
| Parametros totales | 2.213.245.760 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (existe guia de despliegue GGUF para llama.cpp) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,4 GB); despliegue GGUF via llama.cpp segun la documentacion enlazada |

## Arquitectura y entrenamiento

La arquitectura es un modelo multimodal vision-language construido a partir de Qwen3.5-2B. Se mantienen intactos el codificador visual y el backbone del modelo de lenguaje, y se reemplaza la cabeza de salida del LM (`lm_head`) por una cabeza de clasificación binaria que aprende a determinar si un candidato OCR es correcto. La unidad de evaluación es una región (texto, fórmula o tabla) junto con su resultado candidato; la entrada combina la imagen original recortada de la región con el contenido candidato, que incluye el texto OCR y una imagen renderizada a partir de ese texto.

La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se documenta el benchmark de evaluación propio, JevOCRBench, publicado como dataset en HuggingFace, y se reporta una generalización estable sobre parseos de MiniCPM-OCR 1.0, GLM-OCR, PaddleOCR-VL-1.6 y Xiaomi-OCR-0, con AUROC (×100) en el rango 91,9–93,4. La innovación principal es el enfoque de verificación: en lugar de generar texto, el modelo puntúa candidatos existentes, lo que permite umbrales configurables para aceptación automática.

## Capacidades

- Evaluación de calidad OCR: asigna una puntuación de 0 a 1 a un candidato OCR dado para una región de texto, fórmula o tabla.
- Verificación multimodal: procesa simultáneamente la imagen original de la región y una imagen renderizada del texto candidato.
- Clasificación por categoría: distingue entre regiones de tipo `text`, `formula` y `table`.
- Selección best-of-N: puntúa varios candidatos para la misma región y permite elegir el de mayor puntuación.
- Filtrado automático: soporta umbrales de decisión para autoaceptar resultados fiables y derivar el resto a revisión humana.
- Multilingüe limitado: inglés y chino según los metadatos del modelo.
- Integración como servicio: soporte documentado para API en la nube, Docker/SDK local, vLLM, SGLang, llama.cpp, Ollama y FlagOS (multi-chip).
- No genera texto OCR de forma autónoma: su salida es una puntuación de verificación, no una transcripción.

## Casos de uso

- Control de calidad en digitalización de documentos legales: puntuar cada región parseada y autoaceptar las que superen un umbral, derivando el resto a revisión humana; la model card muestra curvas de precisión frente a tasa libre de revisión para documentos legales.
- Procesamiento de recibos y documentos financieros: verificar extracciones de importes, fechas y tablas, reduciendo el volumen de revisión manual en pipelines de contabilidad automatizada.
- Selección entre múltiples motores OCR: ejecutar MiniCPM-OCR 1.0, GLM-OCR, PaddleOCR-VL-1.6 y Xiaomi-OCR-0 sobre la misma segmentación y usar Jev para elegir el mejor candidato por región, combinando los resultados en orden de lectura.
- Verificación de fórmulas científicas y técnicas: puntuar candidatos de fórmulas matemáticas, un caso donde los OCR genéricos fallan con frecuencia y la verificación automática aporta valor diferencial.
- Extracción de tablas en informes complejos: validar la estructura y el contenido de tablas parseadas antes de cargarlas en bases de datos o sistemas de BI.
- Enrutamiento inteligente en plataformas de gestión documental: clasificar regiones por fiabilidad y priorizar la cola de revisión humana según la puntuación, optimizando el coste de operación.
- Integración en pipelines CI/CD de modelos OCR: usar el modelo como evaluador automático para detectar regresiones de calidad al actualizar un motor OCR en producción.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre JevOCRBench (AUROC ×100; mayor es mejor):

| Modelo | AUROC (×100) en JevOCRBench |
|---|---:|
| MiniCPM-OCR Jev (2B) | 93,6 |
| JEV-35B-A3B | 90,1 |
| Qwen3.5-397B-A17B | 93,8 |

Discriminación por motor OCR (misma muestra de 200 ejemplos, etiquetado manual, diferencia máxima de 1,5 puntos):

| Motor OCR evaluado | AUROC (×100) |
|---|---:|
| MiniCPM-OCR 1.0 | 92,7 |
| GLM-OCR | 91,9 |
| PaddleOCR-VL-1.6 | 93,4 |
| Xiaomi-OCR-0 | 93,1 |

No se han publicado en la informacion disponible resultados desglosados por categoría (texto, fórmula, tabla) en forma de tabla numérica; la model card remite a una imagen con dichos datos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,2B parámetros, en fp16 se sitúa en torno a 4,5 GB de pesos, y en cuantizaciones de 8 y 4 bits aproximadamente 2,2 GB y 1,1 GB respectivamente (estimación a partir del recuento de parámetros, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPU de consumo tipo RTX 4090, RTX 3090 o inferiores con cuantización.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6-8 GB de VRAM o más en fp16, y en GPU de gama media con cuantización.
- Opciones de despliegue documentadas: API en la nube, Docker/SDK local, vLLM, SGLang, llama.cpp (GGUF), Ollama y FlagOS (multi-chip).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | AUROC (×100) en JevOCRBench | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| MiniCPM-OCR Jev | 2,2B | Evaluacion de calidad OCR | 93,6 | Apache 2.0 | HuggingFace, despliegue multiple |
| JEV-35B-A3B | 35B (MoE, 3B activos) | Evaluacion de calidad OCR | 90,1 | No disponible | No disponible en la informacion |
| Qwen3.5-397B-A17B | 397B (MoE, 17B activos) | Modelo generalista multimodal | 93,8 | No disponible | No disponible en la informacion |
| MiniCPM-OCR 1.0 | No disponible | OCR generativo | 92,7 (como candidato evaluado) | No disponible | Repositorio OpenBMB/MiniCPM-OCR |

La comparativa se limita a los datos de la model card. No se dispone de informacion sobre contexto, licencia ni formato de pesos de las alternativas.

## Limitaciones y advertencias

- No es un modelo OCR generativo: no transcribe imagenes; solo puntua candidatos existentes. La calidad final esta acotada por la cobertura y correccion de dichos candidatos.
- Los candidatos de una misma region deben compartir los limites del recorte y del contenido; si no, la comparacion entre ellos no es valida.
- Idiomas soportados limitados a ingles y chino; el rendimiento en otros idiomas no esta documentado.
- La seleccion de umbrales requiere muestras de la aplicacion concreta; un umbral mas alto reduce la aceptacion automatica y aumenta la revision humana, por lo que hay que monitorizar ambas métricas.
- Riesgo de sesgo y alucinacion no evaluado en la informacion disponible; al ser un clasificador, el riesgo de alucinacion se manifiesta como falsos positivos en la puntuacion.
- La model card no detalla el dataset de entrenamiento ni posibles sesgos por dominio; conviene validar en el dominio objetivo antes de produccion.
- El repositorio tiene muy poca traccion (18 descargas, 0 likes) y fue creado en octubre de 2026; la documentacion de API en la nube figura como stub en construccion.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de los modelos base (Qwen3.5-2B) y de los datasets asociados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TechnoBaptist/MiniCPM-OCR-Jev
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM-OCR
- Tutorial de uso: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_jev_tutorial_en.md
- Documentacion de API: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_jev_api_en.md
- Despliegue con vLLM: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/vllm_deploy_jev_en.md
- Despliegue con SGLang: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/sglang_deploy_jev_en.md
- Despliegue con llama.cpp (GGUF): https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/llamacpp_deploy_jev_en.md
- Despliegue con Ollama: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/ollama_deploy_jev_en.md
- Despliegue con FlagOS: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/flagos_deploy_en.md
- Dataset JevOCRBench: https://huggingface.co/datasets/openbmb/JevOCRBench
