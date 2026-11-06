# zaltahir/kaptchaocr

## Resumen

KaptchaOCR es una familia de modelos ONNX especializados en la resolucion de CAPTCHAs de texto, la deteccion de glifos para CAPTCHAs de clic y la resolucion de rompecabezas de tipo slider. El autor, zaltahir, los publica como pesos de inferencia listos para usar junto con la biblioteca Rust KaptchaOCR y su pequeno servidor HTTP. No se trata de un modelo de lenguaje generalista, sino de un conjunto de reconocedores CTC y detectores DB derivados de PP-OCRv6 y afinados especificamente para dominios de CAPTCHA.

El repositorio incluye tres variantes de reconocimiento afinadas (tiny, small y medium), dos detectores de glifos afinados y tres modelos de respaldo heredados de ddddocr. Los pesos ocupan 0,3 GB en total y se distribuyen en formato ONNX, lo que permite ejecucion con onnxruntime sin dependencias de frameworks de aprendizaje profundo. La relevancia actual reside en que ofrece una alternativa open source con licencia Apache-2.0 a soluciones propietarias de resolucion de CAPTCHAs, con metricas publicadas de exactitud y latencia.

El modelo no incluye codigo de entrenamiento ni datasets en el repositorio; es exclusivamente de inferencia. La logica de preparacion de imagen, decodificacion CTC, post-procesado de cajas, ordenacion de clics y matching de slider reside en el binario Rust del proyecto GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reconocimiento: CNN + CTC (basado en PP-OCRv6). Deteccion: DB (PaddleOCR-style) y YOLO-style (ddddocr stock) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX sin cuantizar declarada) |
| Idiomas soportados | no disponible (reconocimiento de caracteres segun charset JSON adjunto) |
| Licencia | Apache-2.0 (modelos afinados); MIT (modelos stock de ddddocr); Apache-2.0 (base PP-OCRv6) |
| Formato de pesos | ONNX (.onnx) con archivos JSON de charset y manifiesto models.json |

## Arquitectura y entrenamiento

Los modelos de reconocimiento reciben una imagen RGB redimensionada a altura 48 con anchura dinamica y decodifican una secuencia de caracteres mediante CTC. Estan derivados de los modelos base PP-OCRv6 y afinados sobre dominios de CAPTCHA. Los detectores afinados son detectores de glifos de tipo DB (estilo PaddleOCR) que devuelven un mapa de probabilidad, convertido en cajas por el servidor. El detector stock es el detector YOLO-style de ddddocr.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables en un modelo de vision). Tampoco se detalla el proceso de fine-tuning mas alla de que los modelos son derivados de PP-OCRv6 y que los conjuntos de benchmark son disjuntos en imagen respecto al entrenamiento pero provienen de las mismas fuentes publicas. El manifiesto `model/models.json` conecta rutas, charsets y umbrales de post-procesado.

## Capacidades

- Reconocimiento de texto en imagenes de CAPTCHA mediante decodificacion CTC con charset configurable.
- Deteccion de glifos y cajas de caracteres para CAPTCHAs de clic.
- Resolucion de rompecabezas de tipo slider (matching de posicion).
- Tres perfiles de reconocimiento con compromiso exactitud/latencia: fast (tiny), balanced (small) y accurate (medium).
- Dos variantes de deteccion de glifos con distinto ajuste de cajas.
- Fallback a modelos heredados de ddddocr (v2 y legacy) para reconocimiento y deteccion.
- Ejecucion via onnxruntime, sin necesidad de GPU ni de frameworks de deep learning.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues generales.
- No resuelve CAPTCHAs de seleccion de imagenes (coches, semaforos, etc.); el autor lo declara fuera de alcance.

## Casos de uso

- Automatizacion de pruebas end-to-end: el modelo permite a pipelines de QA resolver CAPTCHAs de texto en entornos de staging controlados, usando el perfil fast (10 ms/imagen) para no ralentizar la suite.
- Investigacion en seguridad de CAPTCHAs: evaluar la robustez de esquemas de CAPTCHA propios frente a un solucionador open source con metricas publicadas (90,7% exacto en ft-medium).
- Integracion en herramientas de accesibilidad: asistir a usuarios con dificultades visuales en la resolucion de CAPTCHAs de texto, desplegando el servidor HTTP local de KaptchaOCR.
- Procesamiento de formularios con CAPTCHA en flujos internos autorizados: el modelo balanced (80,4% exacto, 28 ms) permite extraer texto de imagenes en lotes con un coste computacional bajo en CPU.
- Resolucion de sliders en entornos de scraping etico y monitorizacion: el matching de slider integrado permite automatizar verificaciones en sitios propios o con permiso explicito.
- Deteccion de glifos para anotacion asistida: el detector ft-small (F1@0.5 del 95,8%) puede pre-anotar cajas de caracteres en datasets de CAPTCHA para revision humana.
- Despliegue en dispositivos de borde: los modelos tiny (4,3 MB) y small (20 MB) caben en entornos con recursos limitados y se ejecutan solo con onnxruntime.

## Benchmarks y rendimiento

Reconocimiento sobre seis conjuntos de CAPTCHA reservados (4.399 imagenes), coincidencia exacta de cadena, sensible a mayusculas. Latencia media en ms/imagen sobre Intel i5-1145G7, proceso unico.

| Modelo | Exacto | Caracter | Latencia | Tamano |
|---|---:|---:|---:|---:|
| KaptchaOCR ft-medium | 90,7% | 96,0% | 69 ms | 73 MB |
| KaptchaOCR ft-small | 80,4% | 93,0% | 28 ms | 20 MB |
| KaptchaOCR ft-tiny | 67,0% | 88,8% | 10 ms | 4,3 MB |
| PP-OCRv6 medium (base) | 28,6% | 59,0% | 75 ms | 73 MB |
| ddddocr legacy (stock) | 15,3% | 42,2% | 29 ms | 13 MB |
| ddddocr v2 (stock) | 14,3% | 42,3% | 33 ms | 52 MB |
| PP-OCRv6 tiny (base) | 8,9% | 38,1% | 10 ms | 4,3 MB |

Deteccion de glifos sobre conjunto sintetico nuevo (400 imagenes, 1.800 cajas):

| Modelo | F1@0.5 | F1@0.75 | Latencia | Tamano |
|---|---:|---:|---:|---:|
| KaptchaOCR ft-small | 95,8% | 50,5% | 270 ms | 9,5 MB |
| KaptchaOCR ft-medium | 95,7% | 63,1% | 1.315 ms | 59 MB |
| ddddocr det (stock) | 57,5% | 32,4% | 112 ms | 19 MB |
| PP-OCRv6 medium (base) | 32,0% | 7,0% | 1.305 ms | 59 MB |

Advertencias del autor: los conjuntos de reconocimiento son disjuntos en imagen respecto al entrenamiento pero provienen de las mismas fuentes publicas, por lo que no constituyen un benchmark fuera de distribucion. El conjunto de deteccion es un proxy sintetico; no se incluyen datos reales de CAPTCHA de clic.

## Requisitos de hardware

- Inferencia en CPU: los modelos estan disenados para ejecutarse con onnxruntime en CPU. El benchmark se realizo en un Intel i5-1145G7 sin GPU.
- VRAM estimada: no aplica en el perfil de referencia; en GPU el consumo seria minimo (los pesos van de 4,3 MB a 73 MB).
- GPU recomendadas: no se especifican; cualquier GPU compatible con onnxruntime serviria, pero el diseno apunta a CPU.
- Cabe en GPU consumer: si, con holgura en cualquier GPU consumer (RTX 4090, etc.), aunque no es el escenario objetivo.
- Opciones de despliegue: binario Rust KaptchaOCR con servidor HTTP integrado; onnxruntime como runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: reconocimiento de 10 ms (tiny), 28 ms (small) y 69 ms (medium) por imagen en i5-1145G7. Deteccion de 270 ms (ft-small) y 1.315 ms (ft-medium) por imagen.

## Comparativa con modelos similares

| Modelo | Tipo | Exacto (recon.) | Latencia | Tamano | Licencia |
|---|---|---:|---:|---:|---|
| KaptchaOCR ft-medium | Reconocimiento afinado | 90,7% | 69 ms | 73 MB | Apache-2.0 |
| KaptchaOCR ft-small | Reconocimiento afinado | 80,4% | 28 ms | 20 MB | Apache-2.0 |
| PP-OCRv6 medium (base) | OCR general | 28,6% | 75 ms | 73 MB | Apache-2.0 |
| ddddocr v2 (stock) | Solucionador CAPTCHA | 14,3% | 33 ms | 52 MB | MIT |

| Modelo | Tipo | F1@0.5 | F1@0.75 | Latencia | Tamano |
|---|---|---:|---:|---:|---:|
| KaptchaOCR ft-small | Deteccion afinada | 95,8% | 50,5% | 270 ms | 9,5 MB |
| KaptchaOCR ft-medium | Deteccion afinada | 95,7% | 63,1% | 1.315 ms | 59 MB |
| ddddocr det (stock) | Deteccion | 57,5% | 32,4% | 112 ms | 19 MB |

La ventaja de KaptchaOCR frente a PP-OCRv6 base y ddddocr stock es el fine-tuning especifico para CAPTCHA, que multiplica la exactitud por tres o mas en los conjuntos evaluados, a costa de perder generalidad fuera de ese dominio.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos; el rendimiento depende de la similitud entre los CAPTCHAs objetivo y las fuentes publicas de entrenamiento.
- Riesgo de alucinacion: en un modelo CTC de reconocimiento el fallo se manifiesta como sustitucion, omision o insercion de caracteres, no como texto inventado libre; la exactitud cae al 67% en el perfil tiny.
- Limitaciones de contexto o idioma: el charset se define en el JSON adjunto; no hay soporte multilingue general declarado. El modelo no resuelve CAPTCHAs de seleccion de imagenes.
- Restricciones de licencia: los modelos afinados son Apache-2.0; los modelos stock son MIT (ddddocr) y la base PP-OCRv6 es Apache-2.0. El uso de la herramienta para resolver CAPTCHAs de terceros puede infringir terminos de servicio o legislacion aplicable; el autor no lo restringe, pero el usuario debe verificar el contexto legal.
- Caveat de benchmark: los conjuntos de evaluacion no son fuera de distribucion; la deteccion se evalua sobre datos sinteticos.
- Produccion: el repositorio no incluye codigo de entrenamiento ni datasets, solo pesos de inferencia; la logica de post-procesado vive en el binario Rust, lo que ata el uso al proyecto KaptchaOCR.
- El modelo no es un LLM: no soporta generacion de texto libre, tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Hugging Face: https://huggingface.co/zaltahir/kaptchaocr
- Repositorio GitHub: https://github.com/ozalt/kaptchaocr
- Benchmarks completos: https://github.com/ozalt/kaptchaocr/blob/main/benchmarks/README.md
- Documentacion: https://github.com/ozalt/kaptchaocr/tree/main/docs
- Cliente Python: https://github.com/ozalt/kaptchaocr/tree/main/clients/python
- ddddocr (modelos stock): https://github.com/sml2h3/ddddocr
- PaddleOCR (base PP-OCRv6): https://github.com/PaddlePaddle/PaddleOCR
