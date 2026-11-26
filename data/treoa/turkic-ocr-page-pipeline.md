# treoa/turkic-ocr-page-pipeline

## Resumen

`turkic-ocr-page-pipeline` es un pipeline de OCR de pagina completa orientado a lenguas turquicas, publicado por el usuario treoa (autoria atribuida a Anuar Suleimenov, Zhalgasbek Bolatov, Aidana Baglanova y Anel Kadirbekova, con la colaboracion de A. T. Nguyen, en un informe de proyecto de la Nazarbayev University). No es un modelo unico, sino un orquestador de dos etapas: primero un detector de lineas basado en YOLO11s (`turkic-line-detector-yolo11s`) localiza las lineas de texto de una imagen de pagina, y despues un lector de lineas, que debe aportar el usuario mediante `--reader-dir`, transcribe cada recorte.

Su relevancia esta en el nicho: cubre escritura manuscrita e impresa en alfabeto latino y cirilico para nueve lenguas turquicas (kazajo, kirguis, uzbeko, turco, azeri, tatar, baskir, turcomano y yakuto), un conjunto para el que escasean herramientas OCR especificas. El pipeline resuelve el problema del orden de lectura y el recorte de lineas en paginas completas, tareas que los OCR de linea aislada no abordan.

El paquete no incluye el lector propio del proyecto (`turkic-ocr-paddleocr-vl-1.6`), de modo que la calidad final de transcripcion depende del lector que se conecte. El repositorio contiene `infer.py`, dependencias fijadas, sumas SHA256 y una model card completa en `model_card.json`. Las descargas y los likes registrados son cero, lo que indica una publicacion muy reciente y sin adopcion todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: detector de lineas YOLO11s + lector de lineas externo (interfaz `reads.reader_interface`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del lector conectado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kk, ky, uz, tr, az, tt, ba, tk, sah |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (el repositorio distribuye codigo Python, no pesos del lector) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline modular, no una red unica. La primera etapa, `turkic-line-detector-yolo11s`, es un detector de objetos YOLO11s entrenado para localizar lineas de texto en imagenes de documentos. La segunda etapa es un lector de lineas que el usuario debe proporcionar; el lector de referencia del proyecto, `turkic-ocr-paddleocr-vl-1.6`, esta basado en PaddleOCR-VL segun su nombre, pero no se distribuye en este repositorio. La logica de recorte y de orden de lectura proviene de `CODE/src/linedet/det_eval.py` y del chequeo de pagina `detb1_page_check.py` (registros R5/PAGECHK).

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no se recogen en la informacion disponible; el autor remite a `model_card.json` para datos de entrenamiento, metricas, limites y ajustes de decodificacion. La publicacion cientifica asociada es el informe "A Handwriting Recognition Model for Turkic Languages in Latin and Cyrillic Script" (Nazarbayev University, 2026).

## Capacidades

- Deteccion de lineas de texto en imagenes de pagina completa mediante YOLO11s.
- Recorte automatico de cada linea detectada y paso al lector externo.
- Resolucion del orden de lectura de las lineas en la pagina.
- Entrada flexible: una imagen suelta, una carpeta de imagenes o un manifiesto TSV.
- Salida estructurada en dos ficheros TSV: uno a nivel de pagina y otro a nivel de linea.
- Soporte de escritura manuscrita y de texto impreso (tags `handwriting`, `handwritten-text-recognition`).
- Cobertura de alfabeto latino y cirilico en nueve lenguas turquicas.
- Interfaz de lector intercambiable: cualquier lector que implemente `reads.reader_interface` puede conectarse.
- No incluye tool calling, agentes ni capacidades multimodales mas alla de imagen a texto.

## Casos de uso

- Digitalizacion de archivos manuscritos en lenguas turquicas: el detector localiza las lineas de cada pagina escaneada y el lector las transcribe, lo que permite convertir corpus historicos en kazajo, tatar o yakuto en texto plano indexable.
- Procesamiento por lotes de expedientes administrativos: la entrada por carpeta o manifiesto TSV permite lanzar el pipeline sobre miles de imagenes en una sola ejecucion, generando un TSV por pagina y otro por linea para su carga en base de datos.
- Construccion de corpus para entrenamiento de modelos de lenguaje de bajos recursos: la salida a nivel de linea facilita el alineado y la revision manual, y cubre lenguas con poca representacion en datasets publicos.
- Revision y correccion asistida de transcripciones: al separar deteccion y lectura, un revisor humano puede sustituir el lector por uno mas preciso o por un modelo ajustado a un dominio concreto sin tocar la etapa de deteccion.
- Digitalizacion de prensa historica en cirilico: el pipeline maneja texto impreso en alfabeto cirilico (kazajo, kirguis, tatar, baskir) y produce lineas ordenadas listas para OCR posterior o para busqueda full-text.
- Integracion en sistemas de gestion documental: el formato TSV de salida se ingiere facilmente en pipelines ETL, y la licencia AGPL-3.0 encaja en despliegues internos o en servicios cuyo codigo se libere.
- Evaluacion comparativa de lectores OCR: al fijar la etapa de deteccion, el pipeline sirve como banco de pruebas para medir lectores de lineas distintos sobre el mismo conjunto de paginas turquicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a `model_card.json` para las metricas del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del lector conectado. La etapa de deteccion (YOLO11s) es ligera y cabe holgadamente en GPU de consumo.
- GPU recomendadas: no disponible para el conjunto del pipeline. Para el detector, cualquier GPU con al menos unos pocos GB de VRAM es suficiente; para el lector, los requisitos vienen determinados por el modelo que se conecte.
- Cabe en GPU de consumo: la etapa de deteccion, si; el pipeline completo depende del lector.
- Opciones de despliegue: ejecucion directa con `python infer.py`, invocando el detector como subproceso; las dependencias exactas del entorno del lector estan fijadas en `requirements.txt` (entorno `CODE/.venv_vlm`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| treoa/turkic-ocr-page-pipeline | Pipeline OCR pagina completa (detector + lector externo) | 9 lenguas turquicas | no disponible | AGPL-3.0 | Codigo en HF; lector no incluido |
| PaddleOCR (generico) | OCR de linea y pagina | Multilingue amplio | no disponible | Apache-2.0 | Publico y ampliamente adoptado |
| Tesseract OCR | OCR clasico | Multilingue con paquetes de idioma | no disponible | Apache-2.0 | Publico |
| TrOCR (Microsoft) | Transformer imagen a texto de linea | Principalmente ingles | no disponible | MIT | Publico |

La comparativa es orientativa: no se dispone de datos de rendimiento del pipeline turquico frente a estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El lector de lineas no se distribuye: sin un lector compatible con `reads.reader_interface`, el pipeline no produce transcripciones.
- No hay datos publicados de precision, cobertura ni tasas de error en la informacion disponible.
- La licencia AGPL-3.0 impone obligaciones fuertes: cualquier servicio en red que use `infer.py` debe liberar su codigo fuente bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- La cobertura linguistica se limita a las nueve lenguas turquicas listadas; no se documenta soporte para otras lenguas ni para mezclas de idiomas en una misma pagina.
- El orden de lectura y el recorte dependen de la logica de `det_eval.py` y `detb1_page_check.py`; paginas con maquetacion compleja (columnas multiples, tablas, notas al margen) pueden producir ordenaciones incorrectas.
- Riesgo de alucinacion del lector conectado: los modelos de vision-lenguaje pueden generar texto plausible que no aparece en la imagen, especialmente en manuscritos deteriorados.
- Sesgos: no documentados en la informacion disponible; cabe esperar sesgos derivados de la composicion del corpus de entrenamiento del detector y del lector.
- El repositorio registra cero descargas y cero likes, por lo que no existe validacion externa de su funcionamiento en produccion.
- La fecha de creacion indicada (2026-11-26) es posterior a la de la mayoria de los modelos de referencia; conviene verificar la vigencia de las dependencias fijadas en `requirements.txt`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/treoa/turkic-ocr-page-pipeline
- Detector de lineas: https://huggingface.co/treoa/turkic-line-detector-yolo11s (referenciado en la model card)
- Lector de referencia (no distribuido): `turkic-ocr-paddleocr-vl-1.6`
- Model card completa: `model_card.json` dentro del repositorio
- Citacion: Suleimenov, A., Bolatov, Z., Baglanova, A., Kadirbekova, A., Nguyen, A. T. (2026). A Handwriting Recognition Model for Turkic Languages in Latin and Cyrillic Script. Project report, Nazarbayev University.
