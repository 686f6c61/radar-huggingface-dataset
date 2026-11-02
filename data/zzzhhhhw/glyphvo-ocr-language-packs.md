# ZZZHHHHW/glyphvo-ocr-language-packs

## Resumen

Glyphvo OCR language packs es una colección de reconocedores de texto (etapa de recognition, no de detección) empaquetados en formato ONNX para su uso dentro de la aplicación Glyphvo. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un conjunto de siete paquetes de idioma derivados de los grafos móviles de PP-OCRv5 de PaddlePaddle, redistribuidos sin modificaciones junto con su diccionario CTC y un manifiesto SHA-256. El autor del repositorio es ZZZHHHHW y la autoría original de los modelos corresponde a PaddlePaddle.

Cada paquete cubre un sistema de escritura concreto (árabe, cirílico, devanagari, hangul, tamil, telugu y thai) y ocupa entre 7,9 MB y 13,5 MB, lo que da un total de repositorio de aproximadamente 0,1 GB. La detección de texto no se incluye: permanece integrada en la aplicación, de modo que estos paquetes solo resuelven la fase de reconocimiento sobre recortes de texto ya localizados.

La relevancia es operativa: permite a una aplicación de OCR incorporar cobertura multiescritura bajo demanda descargando únicamente el paquete del idioma necesario, con licencia Apache-2.0 y trazabilidad mediante hashes. El repositorio no registra descargas ni likes y no incluye información sobre benchmarks ni sobre el proceso de entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de reconocimiento de texto PP-OCRv5 (variante mobile) exportada a ONNX; no disponible el detalle de capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión por línea de texto, no autoregresivo) |
| Tipos de cuantizacion | no disponible (los grafos se distribuyen tal cual desde PaddlePaddle, sin indicar precisión) |
| Idiomas soportados | ar, fa, ur, ug, ps, sd (arabic); ru, uk, be, bg, sr, mk, kk, ky, mn, tg, tt, ba (cyrillic); hi, mr, ne, sa (devanagari); ko (korean); ta (tamil); te (telugu); th (thai) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (rec.onnx) + dictionary.txt + recognizer.json + manifest.json; catalog.json con tamaños y SHA-256 |

## Arquitectura y entrenamiento

Los paquetes contienen grafos ONNX de reconocimiento de PP-OCRv5 en su variante mobile, es decir, la etapa que recibe una imagen de línea de texto ya recortada y produce una secuencia de caracteres mediante decodificación CTC contra un diccionario. La detección de texto queda fuera del repositorio y se mantiene dentro de la aplicación Glyphvo. No se redistribuye ningún cambio en los grafos: la única transformación declarada es la extracción del diccionario desde el `inference.yml` original de PaddlePaddle.

No hay información en la model card sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de las propias de PP-OCRv5. Cada paquete incluye un `recognizer.json` con los repositorios y revisiones upstream, lo que permite auditar la procedencia. La estructura de directorios es `<packId>/v<version>/{rec.onnx, dictionary.txt, recognizer.json, manifest.json}`, con directorios de versión inmutables y un `catalog.json` que lista cada fichero con su tamaño y SHA-256.

## Capacidades

- Reconocimiento óptico de caracteres sobre recortes de línea de texto en siete sistemas de escritura: árabe, cirílico, devanagari, hangul, tamil, telugu y thai.
- Cobertura multilingüe agregada de 27 códigos de idioma repartidos entre los siete paquetes.
- Decodificación CTC contra diccionario propio de cada paquete.
- Ejecución mediante runtime ONNX, apta para integración en aplicaciones de escritorio o móviles.
- Verificación de integridad mediante manifiesto SHA-256 y catálogo de ficheros.
- No incluye detección de texto, tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento.

## Casos de uso

- Digitalización de documentos en árabe y persa: descargando el paquete `arabic` (8,0 MB) se pueden transcribir líneas recortadas de facturas o formularios en ar, fa, ur, ug, ps y sd, manteniendo la detección en la aplicación anfitriona.
- Procesamiento de documentos rusos y de Asia Central: el paquete `cyrillic` (8,1 MB) cubre doce idiomas, útil para archivos administrativos en ru, uk, kk, ky, mn, tg, tt y ba con una sola descarga.
- Indexación de prensa en hindi y maratí: el paquete `devanagari` (7,9 MB) permite extraer texto de recortes de periódico para motores de búsqueda internos.
- Subtitulado o extracción de texto en coreano: el paquete `korean` (13,5 MB), el mayor del conjunto, sirve para transcribir rótulos y capturas con hangul.
- Digitalización de material en tamil y telugu: los paquetes `tamil` y `telugu` (7,9 MB cada uno) permiten incorporar estas escrituras del sur de la India sin cargar el resto de idiomas.
- Extracción de texto en tailandés: el paquete `thai` (7,9 MB) cubre menús, carteles y documentos tailandeses en una aplicación de OCR móvil.
- Distribución bajo demanda en aplicaciones con espacio limitado: al ser paquetes de menos de 14 MB con verificación SHA-256, se pueden descargar solo cuando el usuario los necesita y validar su integridad antes de cargarlos en el runtime ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño de los grafos (7,9-13,5 MB) el modelo es apto para ejecución en CPU y en GPUs de gama baja, pero no se aportan cifras de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: previsiblemente sí por el tamaño de los paquetes, aunque no se confirma en la información disponible.
- Opciones de despliegue: runtime ONNX (ONNX Runtime u otro compatible); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Tamaño | Licencia | Formato |
|---|---|---|---|---|---|
| Glyphvo OCR language packs | Reconocimiento PP-OCRv5 mobile | 27 códigos en 7 paquetes | 7,9-13,5 MB por paquete | Apache-2.0 | ONNX |
| PP-OCRv5 (PaddlePaddle, upstream) | Detección + reconocimiento | Conjunto multilingüe de PaddleOCR | no disponible | Apache-2.0 | Paddle inference / exportable |
| Tesseract (LSTM) | OCR completo | Amplio conjunto de idiomas | Modelos por idioma de decenas de MB | Apache-2.0 | Propio (traineddata) |
| EasyOCR | Detección + reconocimiento | Decenas de idiomas | Pesos por idioma de decenas de MB | Apache-2.0 | PyTorch |

La comparación es orientativa: Glyphvo redistribuye únicamente la etapa de reconocimiento de PP-OCRv5, mientras que Tesseract y EasyOCR incluyen detección y reconocimiento. No se dispone de métricas de precisión comparadas en la información proporcionada.

## Limitaciones y advertencias

- Solo reconocimiento: requiere un detector de texto externo que produzca los recortes de línea; no sirve por sí solo para localizar texto en una imagen.
- Sin métricas publicadas: no hay datos de precisión, latencia ni robustez, lo que dificulta evaluar su idoneidad frente a alternativas.
- Cobertura limitada a siete sistemas de escritura; no incluye latino, chino ni japonés en este repositorio.
- Riesgo de errores propios de OCR: confusiones entre caracteres similares, sensibilidad a ruido, rotación y baja resolución, sin datos concretos de tasa de error.
- Sin información sobre sesgos ni sobre el dataset de entrenamiento original.
- Licencia Apache-2.0 permite uso comercial, pero conviene conservar la atribución a PaddlePaddle y las referencias upstream registradas en `recognizer.json`.
- Repositorio sin descargas ni validación comunitaria; la fecha de creación y actualización (2026-11-02) figura en el futuro respecto a la información habitual, lo que conviene verificar antes de usarlo en producción.
- Los directorios de versión son inmutables; cualquier corrección exigirá una nueva versión del paquete.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ZZZHHHHW/glyphvo-ocr-language-packs
- PaddlePaddle en HuggingFace: https://huggingface.co/PaddlePaddle
- Repositorio PaddleOCR (referencia upstream de PP-OCRv5): no disponible en la información proporcionada
- Paper de PP-OCRv5: no disponible en la información proporcionada
- Demos o blogs del autor: no disponibles en la información proporcionada
