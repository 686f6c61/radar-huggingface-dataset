# Thareah/ThaOCR-models

## Resumen

ThaOCR-models es el repositorio índice de una familia de cinco modelos ONNX que, en conjunto, implementan una canalización completa de OCR para documentos en jemer (khmer) e inglés. Lo desarrolla el usuario Thareah y se publica bajo una licencia mixta que remite al README. El problema que resuelve es concreto: digitalizar documentos camboyanos y bilingües (facturas, formularios, cartas, carnés, exámenes) con un pipeline ligero que corre en CPU, en navegador mediante ONNX Runtime Web y en teléfono mediante ORT Mobile, sin depender de GPU.

La propuesta no es un modelo único de lenguaje, sino un sistema por etapas: detección de layout (YOLO11n, 22 clases), detección de líneas de texto (DB con backbone PP-OCRv5 mobile), reconocimiento de línea (CRNN-CTC, jemer e inglés, 195 símbolos), clasificación tipográfica (familia, peso, inclinación y tamaño) y un pequeño Transformer de estructura que asigna rol, orden de lectura y nivel de lista a cada línea. Todos los pesos son ONNX de opset 17 y el manifiesto `models.json` de este repositorio enlaza las rutas relativas de las cinco etapas.

Su relevancia ahora es la de un OCR de nicho idiomático: el jemer tiene poca cobertura en los OCR comerciales y este conjunto ofrece pesos pequeños (de 1,9 MB a 19 MB por etapa), entrenados con datos sintéticos y reales, y pensados para despliegue en el borde. No es un modelo generativo ni un LLM: es una cadena de visión por computador especializada en documentos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de cinco etapas: YOLO11n (layout), DB con backbone PP-OCRv5 mobile (detección de texto), CRNN-CTC (reconocimiento), CNN (tipografía) y Transformer pequeño (estructura) |
| Parámetros totales | No disponible como cifra única; por etapa: layout YOLO11n 2,6 M; textdet 1,16 M; rec CRNN 4,76 M; font y structure no disponibles |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; el reconocedor procesa líneas de altura 48 y anchura dinámica `[N,1,48,W]` |
| Tipos de cuantización | ONNX float y variante `_int8` para el reconocedor (19 MB frente a 4,8 MB) |
| Idiomas soportados | Jemer (km) e inglés (en) |
| Licencia | Mixta, ver README del repositorio (`license: other`, `license_name: mixed-see-readme`) |
| Formato de pesos | ONNX (opset 17); el reconocedor incluye `.vocab.json`; versiones antiguas de layout en `.onnx` y `.pt` |

## Arquitectura y entrenamiento

El layout se entrena con Ultralytics YOLO11 a resolución 1024, optimizador AdamW, programación coseno, mosaic 0,6 y sin volteo horizontal. La versión por defecto (`layout_yolo11n_v3_22cls`, 10,9 MB) parte de YOLO11n preentrenado en COCO y se afina sobre 18.000 páginas de entrenamiento y 1.100 de validación (10.000 nuevas del generador docgen v3 con la clase `decoration` y 8.000 de replay de la ronda 2), durante 37 épocas con lr0 6e-4; alcanza mAP50 0,972 y mAP50-95 0,842. Los datos mezclan páginas sintéticas camboyanas y estadounidenses, DocLayNet v2, PDFs reales en jemer con etiquetas heurísticas, firmas SignverOD, escaneos D4LA, CommonForms y hojas de examen generadas.

El detector de líneas (`db_ppocrv5_khmer_v2`, 4,8 MB) convierte el ONNX original de PP-OCRv5 mobile a PyTorch y afina el mapa de probabilidad con kernels DB encogidos (r = 0,4) para conservar el postprocesado unclip. Se entrena 20.000 iteraciones con batch 16 y aumento `--robust`, con pesos de pérdida 0,45 sintético / 0,20 PDF jemer / 0,35 DocLayNet; F1 final de 0,894 en sintético, 0,880 en DocLayNet y 0,697 en PDF jemer (0,690 en baja resolución). El reconocedor es un CRNN-CTC de arquitectura "M" (convoluciones 48-96-192-256, proyección 320, BiLSTM 2x256, 4,76 M de parámetros) que trabaja con líneas de altura 48, vocabulario de 195 símbolos y decodificación CTC voraz; se entrena con aumento fuerte (warp en GPU, inclinación, baja resolución, polaridad). La etapa de tipografía es una CNN sobre imagen gris de 32x256 que predice familia (29 familias jemer y latinas), peso, inclinación y tamaño em; la de estructura es un Transformer pequeño sobre las líneas de la página que asigna rol, inicio de párrafo, nivel de lista, viñeta y orden de lectura.

## Capacidades

- Detección de layout documental con 22 clases de región: texto, título, cabecera de sección, lista, tabla, figura, pie de figura, encabezado, pie de página, número de página, nota al pie, fórmula, firma, sello, logotipo, código QR, código de barras, fotografía, escritura manual, casilla, campo de formulario y decoración.
- Detección de líneas de texto con entrada de altura y anchura variables (múltiplos de 32).
- Reconocimiento de texto impreso en jemer e inglés, incluidos dígitos y puntuación, con 195 símbolos en el vocabulario.
- Clasificación tipográfica por línea: familia (29 familias jemer y latinas), peso, inclinación y tamaño em.
- Reconstrucción de estructura de página: rol de línea, inicio de párrafo, nivel de lista, viñeta y orden de lectura.
- Ejecución en CPU, en navegador (ONNX Runtime Web) y en teléfono (ORT Mobile).
- No dispone de tool calling, razonamiento multi-paso, agentes ni modo de pensamiento: es un pipeline de visión, no un modelo generativo.

## Casos de uso

- Digitalización de facturas y recibos camboyanos: el detector de layout localiza tablas, importes y sellos, y el reconocedor extrae el texto jemer e inglés línea a línea para volcarlo a un sistema contable.
- Procesamiento de formularios y carnés de identidad: las clases `form_field`, `checkbox`, `qr_code` y `barcode` permiten segmentar campos y validar su contenido con el OCR de línea.
- Archivado de PDFs escaneados en jemer: el pipeline completo convierte páginas escaneadas en texto estructurado con orden de lectura, útil para bibliotecas y administraciones públicas.
- Digitalización de hojas de examen: el layout incluye la clase de hoja de examen y la etapa de estructura marca el orden de lectura, lo que facilita la corrección asistida.
- Extracción de datos en el navegador: al ser ONNX y ejecutarse con ONNX Runtime Web, permite OCR en cliente sin enviar documentos a un servidor, útil para aplicaciones de privacidad.
- OCR en dispositivos móviles sin conectividad: con ORT Mobile y pesos de 1,9 a 19 MB, se puede integrar en aplicaciones de campo para leer documentos en zonas con red limitada.
- Análisis de maquetación para edición: la etapa de tipografía (familia, peso, inclinación, tamaño) permite reconstruir el estilo de un documento para reeditarlo o generar versiones accesibles.

## Benchmarks y rendimiento

| Etapa / modelo | Métrica | Valor |
|---|---|---|
| Layout v2 round 1 (YOLO11s, 21 clases) | mAP50 / mAP50-95 | 0,964 / 0,834 |
| Layout v2 round 2 (YOLO11s, 21 clases) | mAP50 / mAP50-95 | 0,962 / 0,834 |
| Layout v2 nano (YOLO11n, 21 clases) | mAP50 / mAP50-95 | 0,956 / 0,798 |
| Layout v3 nano (YOLO11n, 22 clases, por defecto) | mAP50 / mAP50-95 | 0,972 / 0,842 |
| Textdet v2 (DB, PP-OCRv5 mobile) | F1 sintético | 0,894 |
| Textdet v2 | F1 DocLayNet | 0,880 |
| Textdet v2 | F1 PDF jemer | 0,697 (0,690 en baja resolución) |

No se han publicado resultados de benchmarks del reconocedor CRNN ni de las etapas de tipografía y estructura en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ejecutarse en ONNX Runtime sobre CPU, no requiere VRAM; en GPU el conjunto completo ocupa menos de 100 MB de memoria (suma de pesos de 10,9 + 4,8 + 19 + 1,9 + 4,0 MB, aproximadamente 41 MB en float y menos con la variante `_int8` del reconocedor).
- GPU recomendadas: no necesarias; cualquier GPU con soporte CUDA para onnxruntime-gpu acelera la inferencia, pero el diseño apunta a CPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles; el reconocedor `_int8` de 4,8 MB está pensado para ese escenario.
- Opciones de despliegue: onnxruntime (CPU y GPU), ONNX Runtime Web en navegador, ORT Mobile en teléfono; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThaOCR-models | Pipeline OCR por etapas (ONNX) | Jemer, inglés | Imagen de página; líneas de altura 48 y anchura dinámica | Mixta, ver README | Hugging Face, cinco repos de etapa |
| PaddleOCR (PP-OCRv5) | Pipeline OCR (detección + reconocimiento) | Multilingüe, incluido jemer en variantes | Imagen de página | Apache 2.0 (según versión) | Hugging Face y GitHub |
| Tesseract | OCR clásico | Multilingüe con paquetes de idioma | Imagen de página | Apache 2.0 | GitHub y distribuciones |
| DocTR | Pipeline OCR (detección + reconocimiento) | Principalmente latino | Imagen de página | Apache 2.0 | GitHub y Hugging Face |

La comparación es orientativa: ThaOCR se especializa en jemer con un layout de 22 clases y etapas de tipografía y estructura que PaddleOCR, Tesseract y DocTR no ofrecen de serie; a cambio, su comunidad es mínima (0 descargas y 0 likes en el momento de la consulta) y su licencia mixta exige revisión legal antes de uso comercial.

## Limitaciones y advertencias

- El reconocedor y el detector están entrenados para jemer e inglés; no se documenta soporte de otros idiomas.
- El F1 del detector de líneas en PDFs jemer reales es de 0,697, notablemente inferior al de datos sintéticos (0,894) y DocLayNet (0,880): cabe esperar errores en escaneos reales de baja calidad.
- El reconocedor usa decodificación CTC voraz, sin modelo de lenguaje de corrección; es probable que aparezcan errores en texto manuscrito y en líneas muy degradadas.
- La licencia es mixta y remite al README (`license: other`, `license_name: mixed-see-readme`); es imprescindible revisar los términos de cada etapa antes de un uso comercial.
- El repositorio no tiene descargas ni likes y se creó en noviembre de 2026 según los metadatos; la validación externa es inexistente.
- No es un modelo generativo: no razona, no responde preguntas ni admite tool calling; cualquier uso conversacional requiere un LLM adicional.
- Riesgo de alucinación no aplicable en el sentido de un LLM, pero sí de falsos positivos en la detección de regiones y en la transcripción de caracteres.
- La etapa de estructura es un Transformer pequeño sobre las líneas de la página; su calidad depende de que la detección de líneas previa sea correcta.

## Enlaces

- Repositorio índice en Hugging Face: https://huggingface.co/Thareah/ThaOCR-models
- Etapa de layout: https://huggingface.co/Thareah/ThaOCR-layout
- Etapa de detección de texto: https://huggingface.co/Thareah/ThaOCR-textdet
- Etapa de reconocimiento: https://huggingface.co/Thareah/ThaOCR-rec
- Etapa de tipografía: https://huggingface.co/Thareah/ThaOCR-font
- Etapa de estructura: https://huggingface.co/Thareah/ThaOCR-structure
