# TranslateInPlace/translate-in-place-image-models

## Resumen

`TranslateInPlace/translate-in-place-image-models` es un repositorio espejo (mirror) que agrupa los modelos de visión por computador que utiliza la extensión de navegador "Translate in Place". La extensión lee el texto presente en imágenes y repinta sus fondos directamente en el dispositivo, por lo que necesita un conjunto de modelos de detección y reconocimiento óptico de caracteres (OCR) y de inpainting de imágenes que funcionen en local.

No se trata de un modelo único, sino de una colección de artefactos de terceros: el detector y los reconocedores de PaddleOCR (PaddlePaddle), el detector de texto y bocadillos de cómic de ogkalu, MI-GAN (Picsart) y LaMa (big-lama de Samsung, con exportaciones de Carve, un ajuste fino para manga de dreMaz y un export de 8 bits de Liiesl). Cada fichero se publica sin modificar respecto a su fuente, fijado al commit exacto que la extensión referencia, y se verifica mediante SHA-256 antes de usarse.

El repositorio tiene un tamaño de 0,4 GB, no registra descargas ni "likes" y su licencia es por modelo (`per-model`): la mayoría de los componentes bajo Apache-2.0 (PaddlePaddle), MI-GAN bajo su propia licencia y LaMa bajo MIT. Es relevante ahora por su enfoque de inferencia en el dispositivo para traducción de texto en imágenes, un caso de uso creciente en extensiones de accesibilidad y traducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible como arquitectura unica; coleccion heterogenea de modelos de deteccion OCR, reconocimiento OCR e inpainting (redes convolucionales y de deteccion exportadas a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelos de imagen, no de texto) |
| Tipos de cuantizacion | no disponible de forma general; se incluye un export de 8 bits de un ajuste fino de LaMa para manga |
| Idiomas soportados | latin/chino/ingles (PP-OCRv6 rec), eslavo, cirilico, coreano, arabe, devanagari, tailandes (reconocedores PP-OCRv5 mobile); el listado de la model card aparece truncado |
| Licencia | por modelo (per-model); mayoria Apache-2.0, MI-GAN bajo licencia propia, LaMa bajo MIT |
| Formato de pesos | ONNX (`inference.onnx`), acompanado de ficheros `inference.yml` de configuracion |
| Tamano del repositorio | 0,4 GB |
| Pipeline declarado | no disponible |
| Verificacion de integridad | SHA-256 por fichero |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: actua como espejo de modelos ya entrenados por terceros. Los componentes de OCR siguen la familia PaddleOCR (PaddlePaddle), con un detector (`PP-OCRv6_small_det_onnx`) y varios reconocedores (`PP-OCRv6_small_rec_onnx` y distintos `PP-OCRv5_mobile_rec_onnx` especializados por escritura). Los componentes de inpainting incluyen MI-GAN (Picsart) y LaMa (big-lama de Samsung), este ultimo tambien en variantes de Carve, un ajuste fino para manga de dreMaz y un export de 8 bits de Liiesl. Se menciona ademas un detector de texto y bocadillos de comic de ogkalu.

No se dispone de informacion sobre volumen de datos de entrenamiento, composicion de los datasets, uso de RLHF/DPO ni innovaciones tecnicas especificas, ya que la model card solo documenta el origen de cada fichero, su commit, su licencia y su hash. La particularidad del repositorio no esta en el entrenamiento, sino en el empaquetado reproducible: cada archivo se fija a un commit concreto de su repositorio fuente y se valida por SHA-256, de modo que la extension prioriza esta copia y recurre a la fuente original solo si el fichero no esta aqui.

## Capacidades

- Deteccion de regiones de texto en imagenes (modelo detector PaddleOCR PP-OCRv6 small).
- Reconocimiento de texto en multiples escrituras: latin/chino/ingles, eslavo, cirilico, coreano, arabe, devanagari y tailandes.
- Deteccion de texto y bocadillos de comic (modelo de ogkalu), orientada a contenido con globos de dialogo.
- Inpainting de imagen para rellenar las zonas de texto una vez borradas (MI-GAN y LaMa, incluida una variante para manga).
- Inferencia en el dispositivo dentro de una extension de navegador.
- Verificacion de integridad de cada fichero mediante SHA-256.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo de lenguaje.
- No se documentan capacidades de audio ni de generacion de texto.

## Casos de uso

- Traduccion de texto en imagenes dentro del navegador: la extension detecta el texto con PaddleOCR, lo reconoce, lo traduce y repinta el fondo con inpainting (MI-GAN o LaMa), todo en el dispositivo.
- Traduccion de comics y manga: el detector de bocadillos de ogkalu localiza globos de dialogo y la variante de LaMa ajustada para manga rellena los globos tras sustituir el texto.
- Accesibilidad visual: extraer y reconocer texto incrustado en imagenes para usuarios que necesitan transcripcion o lectura asistida.
- Digitalizacion de capturas y fotos con texto: obtener texto de imagenes multilingues (coreano, arabe, devanagari, tailandes, cirilico) con los reconocedores especializados.
- Sustitucion de rotulos o etiquetas en imagenes: borrar el texto original y rellenar la zona conservando el fondo gracias al inpainting.
- Procesamiento con privacidad: al ejecutarse en local, los modelos permiten tratar imagenes con texto sensible sin enviarlas a un servidor.
- Integracion en herramientas de edicion o pipelines de OCR: los ficheros ONNX pueden consumirse con runtimes de inferencia como ONNX Runtime en aplicaciones de escritorio o web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible; los modelos de OCR de PaddleOCR (variantes small/mobile) y los de inpainting suelen ejecutarse tambien en CPU y en aceleradores integrados por su enfoque on-device.
- Compatibilidad con GPU de consumo: no especificada; al ser modelos ONNX ligeros (repositorio total de 0,4 GB) es previsible que quepan en GPU de consumo e incluso en CPU, pero no hay cifras confirmadas en la informacion disponible.
- Opciones de despliegue: inferencia via ONNX Runtime (formato de pesos ONNX); el repositorio esta pensado para su consumo desde la extension de navegador "Translate in Place".
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | Translate in Place (este repo) | PaddleOCR (fuente) | EasyOCR | Tesseract |
|---|---|---|---|---|
| Tipo | Espejo empaquetado de OCR + inpainting | Suite OCR completa | Suite OCR | Motor OCR clasico |
| Formatos | ONNX | PaddlePaddle, ONNX | PyTorch | Modelos propios LSTM |
| Inpainting incluido | Si (MI-GAN, LaMa) | No | No | No |
| Licencia | Por modelo (Apache-2.0 / MIT / propia) | Apache-2.0 | Apache-2.0 | Apache-2.0 |
| Datos cuantitativos | no disponibles | no disponibles | no disponibles | no disponibles |

No se dispone de resultados numericos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un repositorio espejo, no un modelo original: el mantenimiento y la responsabilidad de cada componente recaen en sus autores (PaddlePaddle, ogkalu, Picsart, Samsung y otros).
- La licencia es por modelo y heterogenea: no todos los ficheros son Apache-2.0; MI-GAN usa su propia licencia y LaMa es MIT, por lo que hay que revisar cada componente antes de uso comercial.
- El listado de ficheros de la model card aparece truncado, por lo que no se puede confirmar el conjunto completo de modelos ni sus idiomas.
- No hay datos de benchmarks, sesgos, tasas de error ni comportamiento en produccion.
- Al depender de ficheros de terceros fijados a commits concretos, la actualizacion requiere revisar manualmente cada origen.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling ni agentes; cualquier expectativa en ese sentido es incorrecta.
- La verificacion por SHA-256 protege la integridad, pero si un fichero de origen cambia o se retira, la copia local es la unica garantia de reproducibilidad.
- Los resultados de busqueda web disponibles no aportan informacion tecnica relevante sobre el modelo, por lo que no se pueden contrastar datos adicionales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TranslateInPlace/translate-in-place-image-models
- PaddlePaddle PP-OCRv6 small detector: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_det_onnx/tree/28fe5895c24fd108c19eb3e8479f4ab385fbfc62
- PaddlePaddle PP-OCRv6 small recogniser: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_rec_onnx/tree/b8f84f0b80c529de40b4fbb3544b84fa7233a513
- PaddlePaddle eslav PP-OCRv5 mobile rec: https://huggingface.co/PaddlePaddle/eslav_PP-OCRv5_mobile_rec_onnx/tree/9a32171fc5718746875e1a261818884517975013
- PaddlePaddle cyrillic PP-OCRv5 mobile rec: https://huggingface.co/PaddlePaddle/cyrillic_PP-OCRv5_mobile_rec_onnx/tree/2cef88145434beb8afa9dd82d77d799eb1ad7b29
- PaddlePaddle korean PP-OCRv5 mobile rec: https://huggingface.co/PaddlePaddle/korean_PP-OCRv5_mobile_rec_onnx/tree/5c6f574b8e2230adf4287b33e736d71b9fabd28e
- PaddlePaddle arabic PP-OCRv5 mobile rec: https://huggingface.co/PaddlePaddle/arabic_PP-OCRv5_mobile_rec_onnx/tree/14aaedcd75825982689ecf5cd64ab33ee083215a
- PaddlePaddle devanagari PP-OCRv5 mobile rec: https://huggingface.co/PaddlePaddle/devanagari_PP-OCRv5_mobile_rec_onnx/tree/251aec19e36739540d35e2cc943f6aa7503b98e5
- PaddlePaddle thai PP-OCRv5 mobile rec: https://huggingface.co/PaddlePaddle/th_PP-OCRv5_mobile_rec_onnx/tree/1d4adbbafb1034a2fd6618498575b81ea7b69f69
- Enlaces a los repositorios de ogkalu (detector de comic), MI-GAN (Picsart) y LaMa (Samsung/Carve/dreMaz/Liiesl): no disponibles en la informacion proporcionada.
