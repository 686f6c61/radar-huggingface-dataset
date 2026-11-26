# strangelab/pix2text-mfr-1.5-onnx-cache

## Resumen

Pix2Text MFR 1.5 ONNX cache es una exportación del modelo de reconocimiento de fórmulas matemáticas Pix2Text MFR 1.5 de BreezeDeus, reconstruida por Strange Lab para reutilizar el estado de atención del decodificador entre tokens generados. El objetivo es acelerar la transcripción de imágenes de fórmulas a LaTeX mediante ONNX Runtime, manteniendo el codificador original byte a byte y los pesos FP32 del decodificador en un grafo ONNX nuevo. Optimum fusiona las ramas inicial y cacheada en un único grafo para compartir pesos.

El modelo resuelve un problema concreto: la inferencia repetida del decodificador sin caché KV en el checkpoint original. Según las mediciones del autor, en una CPU Apple M4 con dos hilos de ONNX Runtime el tiempo mediano por fórmula recortada baja de 177 ms a 107 ms, una reducción del 39,4%, con salida LaTeX idéntica tras el postprocesado en las 32 imágenes de prueba y en los 12 ejemplos públicos de Pix2Text.

Es relevante para pipelines de OCR de documentos científicos y técnicos que procesan muchas fórmulas en CPU, donde el cuello de botella está en la decodificación autorregresiva. La licencia MIT y el tamaño reducido del repositorio (0,1 GB) facilitan su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (transformer), exportado a ONNX con caché KV en el decodificador |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No se indica cuantización explícita; el decodificador usa parámetros FP32 en el grafo ONNX |
| Idiomas soportados | no disponible (la tarea es transcripción de fórmulas a LaTeX, independiente del idioma natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (con grafo fusionado de ramas inicial y cacheada) |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX del checkpoint original `breezedeus/pix2text-mfr-1.5`, que sigue una arquitectura vision-encoder-decoder para image-to-text. El codificador se mantiene idéntico al original; el decodificador se reconstruye a partir del modelo publicado y se exporta con una ruta de inferencia cacheada, de modo que reutiliza el estado de atención entre tokens generados. Optimum combina las ramas inicial y cacheada en un único grafo ONNX que comparte pesos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La model card solo indica que BreezeDeus entrenó y publicó Pix2Text MFR 1.5 bajo licencia MIT, y que Strange Lab reconstruyó el decodificador y exportó su ruta de inferencia cacheada. La innovación técnica destacable es precisamente esa caché KV en el decodificador dentro de ONNX Runtime, que reduce el coste por token generado.

## Capacidades

- Reconocimiento de fórmulas matemáticas en imágenes y transcripción a LaTeX.
- Procesamiento de páginas completas y PDF mediante la integración con Pix2Text, que mantiene sus componentes habituales de página, texto y tablas.
- Exportación de resultados a Markdown con imágenes exportadas (`to_markdown`).
- Inferencia en CPU mediante ONNX Runtime (`CPUExecutionProvider`).
- Compatibilidad con el constructor `LatexOCR` de Pix2Text con `use_cache=True`.
- No se documentan capacidades de tool calling, agentes, visión general, audio ni modo thinking.

## Casos de uso

- Digitalización de artículos científicos: el modelo transcribe las fórmulas de PDFs a LaTeX para reconstruir el documento en Markdown, integrándose en el pipeline de Pix2Text que separa texto, tablas y fórmulas.
- Conversión de apuntes y libros de matemáticas escaneados: cada fórmula recortada se procesa con `LatexOCR` y se ensambla el LaTeX resultante en el documento final.
- Indexación y búsqueda de contenido matemático: al obtener LaTeX limpio de cada fórmula, se puede indexar y buscar por expresiones en bases de documentación técnica.
- Generación de material docente: extracción automática de fórmulas de exámenes o diapositivas para reutilizarlas en nuevos documentos editables.
- Pipelines de publicación técnica en CI/CD: la exportación ONNX con caché permite ejecutar la conversión en servidores sin GPU, reduciendo el tiempo por fórmula un 39,4% en CPU según las mediciones del autor.
- Procesamiento por lotes de documentación heredada: el modelo mantiene la salida LaTeX idéntica al original en las pruebas realizadas, lo que permite migrar pipelines existentes sin cambiar resultados.
- Despliegue en entornos con recursos limitados: el repositorio ocupa 0,1 GB y los ficheros del modelo suman 119,83 MB, por lo que cabe en contenedores pequeños y en máquinas de desarrollo convencionales.

## Benchmarks y rendimiento

| Metrica | Original | ONNX cache | Mejora |
|---|---|---|---|
| Tiempo mediano por fórmula recortada (Apple M4 CPU, 2 hilos ONNX Runtime) | 177 ms | 107 ms | 39,4% menos |
| Tiempo mediano en 4 páginas PDF con muchas fórmulas (CPU) | 15,10 s | 11,77 s | 22,1% menos |
| Tamaño de ficheros del modelo | 119,65 MB | 119,83 MB | +0,18 MB |

Las mediciones se realizaron con 32 imágenes de UniMER-Test seleccionadas por hash (ocho por categoría), dos rondas en orden inverso de imágenes y sin contar la inicialización del modelo. La salida LaTeX postprocesada fue idéntica en las 32 imágenes y en los 12 ejemplos públicos de Pix2Text. El autor advierte que esta comparación mide la preservación de la salida original en esas imágenes, no la exactitud matemática para toda fórmula. No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K u otros) en la información disponible, y el rendimiento en GPU y el uso de memoria no se han medido.

## Requisitos de hardware

- VRAM estimada: no disponible; el autor solo documenta inferencia en CPU.
- GPU recomendadas: no disponibles; no se han medido velocidad ni memoria en GPU.
- CPU: probado en Apple silicon (M4) con ONNX Runtime y `CPUExecutionProvider`; el entorno de referencia es Python 3.12.
- Cabe en hardware de consumo: sí, el modelo completo ocupa unos 120 MB y el repositorio 0,1 GB.
- Opciones de despliegue: ONNX Runtime a través de Pix2Text (`LatexOCR` o `Pix2Text.from_config` con `use_cache=True`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 107 ms por fórmula recortada en Apple M4 CPU con dos hilos; 11,77 s medianos para cuatro páginas PDF con muchas fórmulas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| strangelab/pix2text-mfr-1.5-onnx-cache | no disponible | no disponible | OCR de fórmulas con caché KV en ONNX | MIT | Hugging Face |
| breezedeus/pix2text-mfr-1.5 | no disponible | no disponible | OCR de fórmulas original | MIT | Hugging Face |
| Otros modelos de OCR de fórmulas | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es frente al checkpoint original del que deriva: misma salida LaTeX en las pruebas y menor latencia en CPU. No se dispone de datos para comparar con alternativas de otros autores.

## Limitaciones y advertencias

- La comparación de rendimiento solo cubre 32 imágenes de UniMER-Test y 12 ejemplos públicos; no establece exactitud matemática general.
- El rendimiento en GPU y el uso de memoria no se han medido.
- El modelo está especializado en reconocimiento de fórmulas; no es un modelo de propósito general ni cubre texto natural, visión general o audio.
- No se documentan sesgos, riesgos de alucinación específicos ni limitaciones de idioma; al tratarse de transcripción a LaTeX, los errores se manifestarían como símbolos o estructuras incorrectas en la fórmula.
- El constructor de Pix2Text requiere `use_cache=True` para este checkpoint; usarlo con `False` puede no funcionar como se espera.
- La velocidad en PDF depende de la densidad de fórmulas y del tiempo dedicado a los demás componentes de Pix2Text (texto, tablas, página).
- Licencia MIT: permite uso comercial, pero conviene conservar el aviso de copyright y verificar las dependencias (Pix2Text, cnstd, cnocr, ONNX Runtime) por si tienen condiciones adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/strangelab/pix2text-mfr-1.5-onnx-cache
- Modelo base: https://huggingface.co/breezedeus/pix2text-mfr-1.5/tree/1cef9f0bdcd6a4c63df7de1311fb0894593340cc
- Issue sobre velocidad del decodificador: https://github.com/breezedeus/Pix2Text/issues/202
- Dataset UniMER-Test: https://huggingface.co/datasets/wanderkid/UniMER_Dataset/tree/2343ddd963290469da36ca83e3a56c66e068add9
- Release de Pix2Text 1.1.7: https://pypi.org/project/pix2text/1.1.7/
