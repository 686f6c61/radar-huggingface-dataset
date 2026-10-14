# SpaceGhost/text-recognition-pt-br.rten

## Resumen

El modelo `SpaceGhost/text-recognition-pt-br.rten` es un sistema de reconocimiento óptico de caracteres (OCR) especializado en líneas de texto en portugués de Brasil y en inglés. Lo publica el usuario SpaceGhost en HuggingFace y deriva de los modelos del proyecto `ocrs` de Robert Knight, ejecutándose sobre el runtime de inferencia en Rust `RTen`. Su propósito es servir como motor nativo de OCR dentro de la aplicación de escritorio PdfCraft, donde transcribe líneas de texto previamente recortadas por un detector de cajas para generar una capa de texto buscable sobre documentos escaneados.

Se trata de un modelo compacto basado en arquitectura CRNN (red convolucional más red recurrente), con una entrada monocromática de altura fija de 64 píxeles y anchura dinámica, un backbone CNN con reducción espacial 4x, una capa GRU bidireccional de 2 niveles y 256 unidades ocultas, y un decodificador CTC con 135 clases. El archivo de pesos ocupa aproximadamente 9,4 MB y está diseñado para inferencia muy rápida en CPU, sin necesidad de GPU.

Su relevancia radica en que amplía el alfabeto del modelo base (originalmente limitado a ASCII sin acentos) hasta cubrir el conjunto completo de caracteres del portugués, incluyendo vocales acentuadas, cedilla y signos tipográficos frecuentes en contratos y documentos formales. Esto lo hace útil para pipelines de digitalización de documentos en portugués donde los modelos genéricos en inglés fallan en la acentuación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CRNN (CNN + GRU bidireccional de 2 capas, decodificacion CTC) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo OCR de linea de texto; anchura de entrada dinamica) |
| Tipos de cuantizacion | no disponible (se distribuye un unico archivo `.rten` de ~9,4 MB) |
| Idiomas soportados | portugues (pt-BR) e ingles (en) |
| Licencia | CC-BY-SA-4.0 (pesos); MIT OR Apache-2.0 (codigo de entrenamiento y exportacion) |
| Formato de pesos | `.rten` (formato del runtime RTen); tag `onnx` asociado al repo |

## Arquitectura y entrenamiento

El modelo implementa una arquitectura CRNN. La entrada es un tensor `[1, 1, 64, W]` correspondiente a una imagen monocromática de una sola línea de texto, con altura normalizada a 64 píxeles y anchura variable. Un backbone convolucional extrae características visuales aplicando una reducción espacial de factor 4 en la anchura. A continuación, una capa recurrente GRU bidireccional de 2 niveles con 256 unidades ocultas produce 512 salidas por paso temporal. Finalmente, una proyección lineal de 512 a 135 clases con LogSoftmax se decodifica mediante CTC Greedy Search.

El ajuste fino parte del checkpoint preentrenado por el autor original (`text-rec-checkpoint-s52qdbqt.pt`), entrenado sobre el dataset HierText. La adaptación conserva íntegros los pesos convolucionales y recurrentes, y únicamente expande la capa final de proyección de 97 a 135 clases. Los caracteres acentuados se inicializan en caliente heredando las representaciones de sus letras base (por ejemplo `á` desde `a`, `ç` desde `c`), de modo que no se perturban los pesos ya consolidados. Los datos de entrenamiento son muestras sintéticas balanceadas en portugués e inglés, con 13 familias tipográficas TrueType y variaciones de peso, espaciado, ruido y contraste, con el fin de evitar el olvido catastrófico del inglés. Se entrenó con el optimizador AdamW (tasa de aprendizaje 1.5e-4 con decaimiento coseno y weight_decay 1e-4) y función de pérdida CTCLoss (blank=0, zero_infinity=True), sobre una GPU NVIDIA L4 de 24 GB en Google Colab Pro. Las métricas declaradas por el autor son una pérdida de validación de 0,0045 y un Character Error Rate (CER) del 0,07 %.

## Capacidades

- Reconocimiento de texto en imágenes de líneas individuales, con entrada monocromática normalizada a 64 píxeles de altura.
- Transcripcion de caracteres del portugues de Brasil completos: vocales acentuadas en minuscula y mayuscula (`á, à, â, ã, é, ê, í, ó, ô, õ, ú, ü, ç` y sus equivalentes en mayuscula), ademas de cedilla.
- Cobertura del alfabeto latino ASCII en mayusculas y minusculas, digitos `0-9` y puntuacion estandar.
- Soporte de signos tipograficos y editoriales frecuentes en documentos: comillas angulares y tipograficas (`«`, `»`, `“`, `”`, `‘`, `’`), guiones largos (`–`, `—`), grado (`°`), parrafo (`§`) y ordinales (`ª`, `º`), ademas del simbolo del euro (`€`).
- Integracion en el pipeline nativo de reconocimiento de texto de PdfCraft, que genera una capa de texto buscable invisible sobre imagenes escaneadas.
- Ejecucion sobre el runtime RTen en Rust, con inferencia en CPU.
- No dispone de capacidad de tool calling, function calling, agentes, razonamiento multi-paso, vision general (mas alla del reconocimiento de linea), audio ni modo de pensamiento.

## Casos de uso

- Digitalizacion de documentos escaneados en portugues: el modelo transcribe lineas de texto con acentos y cedilla correctamente, algo que los modelos OCR basados en ASCII suelen fallar, permitiendo generar PDFs con capa de texto buscable.
- Generacion de capas de texto buscable en PDF: integrado en el pipeline de PdfCraft junto a `text-detection.rten`, produce una capa invisible en fuente Helvetica WinAnsi que hace seleccionable y buscable el contenido de un escaneo.
- Indexacion y busqueda full-text de archivos historicos o contractuales en portugues: al convertir imagenes en texto fiable, se pueden indexar grandes volumenes de documentos para busqueda posterior.
- Extraccion de datos de facturas, contratos y formularios: el soporte de digitos, simbolo del euro y signos como `§`, `ª` y `º` lo hace adecuado para documentos administrativos y notariales.
- Procesamiento por lotes en servidores sin GPU: al ser un modelo de ~9,4 MB que corre sobre RTen en CPU, permite desplegar OCR masivo en maquinas modestas sin coste de aceleracion por hardware.
- Aplicaciones de escritorio en Rust: al integrarse de forma nativa con RTen, no requiere dependencias de Python ni CUDA, lo que simplifica el empaquetado y distribucion del binario.
- Preprocesamiento de corpus para NLP en portugues: puede servir como etapa inicial para convertir documentos escaneados en texto que alimente pipelines posteriores de analisis o entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la informacion disponible. El autor unicamente reporta las siguientes metricas de su propio proceso de validacion:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 0,0045 |
| Character Error Rate (CER) | 0,07 % (precision superior al 99,9 %) |
| Tamano del archivo de pesos | ~9,4 MB |

No se especifica el conjunto de validacion exacto ni su composicion, por lo que estas cifras deben interpretarse como declaraciones del autor y no como resultados verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para ejecucion en CPU.
- GPU recomendadas: no requiere GPU. El autor uso una NVIDIA L4 de 24 GB exclusivamente durante el entrenamiento, no para inferencia.
- Cabe en GPU de consumo: si, aunque no es necesario; el modelo de ~9,4 MB puede ejecutarse en cualquier equipo con CPU convencional.
- Opciones de despliegue: runtime RTen (Rust) y su integracion en PdfCraft; tambien existe el tag `onnx` en el repositorio. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a OCR CRNN.
- Latencia y throughput estimados: no disponible. El autor afirma inferencia extremadamente rapida en CPU, pero no aporta cifras concretas de latencia ni de rendimiento por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto o entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SpaceGhost/text-recognition-pt-br.rten` | CRNN + CTC | pt-BR, en | Linea de texto `[1,1,64,W]` | CC-BY-SA-4.0 (pesos) | HuggingFace, formato `.rten` |
| Modelos originales de `robertknight/ocrs-models` | CRNN + CTC | en (ASCII, sin acentos) | Linea de texto | segun repositorio original | GitHub de ocrs |
| Tesseract | LSTM + motor tradicional | Multiples idiomas | Pagina o linea | Apache-2.0 | Codigo abierto |
| PaddleOCR | Deteccion + reconocimiento (CRNN y variantes) | Multiples idiomas | Pagina o linea | Apache-2.0 | Codigo abierto |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada. La diferencia principal respecto a los modelos originales de `ocrs` es la ampliacion del alfabeto de 97 a 135 clases para cubrir el portugues acentuado.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al entrenarse con datos sinteticos generados a partir de 13 familias tipograficas, su comportamiento puede degradarse con fuentes manuscritas, tipografias poco comunes o renders de baja calidad no representados en el conjunto de entrenamiento.
- Riesgo de alucinacion: inherente a los decodificadores CTC; puede producir caracteres plausibles en zonas con ruido, manchas o texto degradado en lugar de rechazar la transcripcion.
- Limitaciones de contexto o idioma: solo soporta portugues (pt-BR) e ingles. No cubre otras lenguas ibericas ni alfabetos no latinos. El modelo esta restringido a lineas de texto individuales, no a paginas completas; requiere un detector de cajas previo.
- Restricciones de licencia: los pesos se distribuyen bajo CC-BY-SA-4.0, que exige atribucion y compartir bajo la misma licencia las obras derivadas, lo que puede condicionar su uso en productos de codigo cerrado. El codigo de entrenamiento y exportacion se licencia bajo MIT OR Apache-2.0.
- Caveats para produccion: el repositorio tiene 0 descargas y 0 likes y un tamano declarado de 0,0 GB, por lo que conviene verificar la integridad y disponibilidad de los archivos antes de integrarlo. No hay validacion independiente del CER declarado ni conjunto de evaluacion publico documentado. La dependencia del runtime RTen limita la portabilidad fuera del ecosistema Rust y fuera de PdfCraft.

## Enlaces

- HuggingFace: https://huggingface.co/SpaceGhost/text-recognition-pt-br.rten
- Proyecto PdfCraft: https://github.com/storytold/pdfcraft
- Proyecto ocrs: https://github.com/robertknight/ocrs
- Modelos originales de ocrs: https://github.com/robertknight/ocrs-models
- Runtime RTen: https://github.com/robertknight/rten
- Licencia CC-BY-SA-4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Dataset HierText: no se incluye enlace en la informacion proporcionada
