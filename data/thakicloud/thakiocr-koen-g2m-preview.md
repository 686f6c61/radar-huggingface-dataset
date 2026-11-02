# ThakiCloud/ThakiOCR-KOEN-G2M-Preview

## Resumen

ThakiOCR-KOEN-G2M-Preview es un reconocedor de lineas de texto (text-line recognizer) para coreano e ingles desarrollado por ThakiCloud. Se trata de un modelo pequeno, de 8,93 millones de parametros, entrenado desde cero con un esquema CTC (Connectionist Temporal Classification) y publicado como vista previa de investigacion. Su funcion es concreta: recibe una imagen ya recortada de una unica linea de texto en escala de grises y devuelve su transcripcion. No localiza texto en una pagina; debe combinarse con un detector de lineas o un modelo de layout.

El modelo se publica acompanado de una declaracion explicita de su estado: bajo las puertas de evaluacion preregistradas por el propio autor, fue calificado como A1_GEN2_NO_GO. Supero cuatro de las cinco puertas (exactitud de tokens criticos, familia del simbolo del won, CER en lineas reales por debajo del modelo de referencia interno y latencia en CPU), pero fallo la puerta I4 relativa a tokens de fecha en el conjunto de validacion real (3 de 4 correctas). Por ello, ThakiCloud declara el uso en produccion como NO-GO y publica los pesos unicamente para inspeccion y reutilizacion en investigacion, sin reclamar estado del arte.

La relevancia del modelo reside en su caracter de artefacto abierto y auditable: incluye pesos en fp32, codigo de inferencia autocontenido, vocabulario de 14.250 caracteres y una evaluacion con puertas fijadas de antemano, lo que permite reproducir y examinar el trabajo. La licencia Apache-2.0 cubre tanto codigo como pesos, y el repositorio no distribuye datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN encoder con mezcla local 1-D (stem convolucional + seis bloques de convolucion depthwise 1-D con feed-forward con compuerta y LayerNorm) + cabeza lineal CTC |
| Parametros totales | 8.926.251 (cabeza 4.574.571, encoder 4.351.680) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de una linea de texto con altura 48 px y anchura maxima de 2048 px tras el redimensionado |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; no se documentan cuantizaciones) |
| Idiomas soportados | coreano (ko) e ingles (en) |
| Licencia | Apache-2.0 (codigo y pesos) |
| Formato de pesos | safetensors (fp32, solo `state_dict`, sin estado del optimizador) |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional pura, sin transformer ni atencion. La entrada es una imagen de linea en escala de grises que se transpone segun EXIF, se convierte a gris y se redimensiona a altura 48 manteniendo la relacion de aspecto con interpolacion bilineal; la anchura resultante es `max(8, round(w*48/h))` y las lineas que superan los 2048 px tras el redimensionado se rechazan en lugar de comprimirse. Los pixeles se escalan a [-1, 1] mediante `x/127.5 - 1` y los lotes se rellenan por la derecha con blanco hasta un multiplo de 16. El encoder parte de un stem convolucional de 160 canales con etapas de stride 2, 2 y 2 solo en altura, aplica mean pooling sobre la altura, proyecta a 320 dimensiones y encadena seis bloques de convolucion depthwise 1-D de kernel 5 con feed-forward con compuerta y LayerNorm. El campo `heads` de `config.json` no se usa en esta variante de mezcla local. La cabeza es una capa lineal densa a 14.251 clases (14.250 caracteres mas el blank), con una clase por caracter (una silaba Hangul equivale a una clase). El stride de salida es de 4 pixeles de anchura redimensionada por fotograma CTC y la decodificacion es CTC voraz (argmax, fusion de repeticiones y eliminacion de blanks), sin modelo de lenguaje.

El entrenamiento se realizo desde cero con inicializacion aleatoria (no es un fine-tune), AdamW con lr 5e-4, 2.000 pasos de warmup, semilla 42, una GPU B200 y 2,22 horas de GPU, a lo largo de 40.000 pasos con tamano de lote 128 (5,12 millones de muestras). Los datos se mezclan con ratios fijos: recortes de lineas renderizados del dataset NVIDIA OCR-Synthetic-Multilingual-v1 (CC BY 4.0) en sus particiones de coreano e ingles; recortes de lineas y palabras de la particion oficial Training del dataset AI Hub 71299 (documentos publicos coreanos; la particion Validation no se uso para entrenar); y lineas sinteticas de simbolos generadas por ThakiCloud (signos de moneda, fechas, numeros en circulo, digitos enmascarados) con fuentes bajo SIL Open Font License 1.1. El vocabulario parte del conjunto de 14.152 caracteres de ThakiOCR-KOEN-V1-Dense, mas `￦` y `￥`, mas 96 caracteres que aparecen al menos tres veces en las etiquetas de entrenamiento. La normalizacion de etiquetas es NFC y espacio duro a espacio; no se aplica NFKC, por lo que `￦` (U+FFE6) y `₩` (U+20A9) se mantienen como caracteres distintos. No se distribuye ningun dato de entrenamiento.

## Capacidades

- Reconocimiento de lineas de texto impresas en coreano e ingles a partir de una imagen recortada en escala de grises.
- Transcripcion con una clase por caracter, incluyendo una clase por silaba Hangul.
- Reconocimiento de simbolos especiales: signos de moneda (`￦`, `￥`), numeros en circulo, digitos enmascarados y tokens de fecha (con la limitacion senalada en la evaluacion).
- Decodificacion CTC voraz sin modelo de lenguaje, lo que evita sesgos de rescoring linguistico.
- Procesamiento por lotes con relleno a multiplo de 16 y rechazo explicito de lineas demasiado anchas.
- Inferencia en CPU con latencia mediana de 13,3 ms por linea.
- No incluye deteccion de texto, analisis de layout, tool calling, function calling, capacidades de agente, vision general, audio ni modo de razonamiento.

## Casos de uso

- Digitalizacion de documentos publicos coreanos: el modelo esta entrenado con recortes del dataset AI Hub 71299 de documentos publicos y puede integrarse tras un detector de lineas para transcribir formularios y registros administrativos ya segmentados.
- Extraccion de importes y simbolos monetarios: su buen rendimiento en la prueba de simbolos (94,2% de exactitud estricta en tokens criticos y 0,40% de CER) lo hace util para verificar lineas con signos de moneda en recibos o extractos, siempre con revision humana.
- Procesamiento de lineas con digitos: en el conjunto de validacion real obtuvo un 98,7% de filas con digitos exactas, lo que permite usarlo como primer paso en la captura de referencias numericas.
- Pipeline OCR en CPU para entornos con recursos limitados: con 8,93 millones de parametros y 13,3 ms de latencia mediana por linea en CPU, puede desplegarse en servidores sin GPU para tareas de bajo volumen.
- Investigacion en reconocimiento CTC: al incluir codigo de inferencia autocontenido, vocabulario y pesos fp32, sirve como base reproducible para estudiar decodificacion CTC voraz y arquitecturas convolucionales de mezcla local.
- Etiquetado asistido y preanotacion: puede generar transcripciones preliminares de lineas coreanas e inglesas para que un revisor humano las corrija, acelerando la creacion de corpus.
- Pruebas de robustez y comparativas academicas: su publicacion con puertas preregistradas permite emplearlo como referencia en experimentos sobre simbolos y fechas, dado que su fallo en la puerta I4 esta documentado.

## Benchmarks y rendimiento

Resultados de la evaluacion del autor, con conjuntos abiertos una sola vez, metricas de cadena exacta tras NFC, una sola ejecucion y una sola semilla. "A" es ThakiOCR-KOEN-V1-Dense (2,13 M de parametros); "S1" es un modelo interno de 2,13 M (A afinado sobre recortes de AI Hub 71299 Training con una perdida auxiliar de espaciado).

| Conjunto | Metrica | Este modelo | A | S1 |
|---|---|---|---|---|
| Symbol test (5.991 lineas sinteticas) | exactitud estricta de tokens criticos | 94,2% | 40,2% | 35,7% |
| Symbol test | CER | 0,40% | 10,38% | 12,91% |
| Validacion real, lineas (70 lineas) | CER | 0,89% | 6,33% | 1,60% |
| Validacion real, todo (526 recortes) | CER | 1,11% | 8,48% | 2,50% |
| Validacion real, todo | filas con digitos, exactas | 98,7% | 94,6% | 97,3% |
| Validacion real, todo | tokens de fecha exactos | 3 / 4 | 4 / 4 | 4 / 4 |

Puertas preregistradas: I1 exactitud de tokens criticos (superada), I2 familia del simbolo del won al 99,9% (superada), I3 CER en lineas reales por debajo de S1 (superada), I4 digitos y fechas en la validacion real (fallida: fechas 3 de 4), I5 tamano y latencia en CPU con mediana de 13,3 ms por linea (superada). El autor advierte que la prueba de simbolos la genero su propio renderizador para los caracteres objetivo, por lo que mide exactamente esa habilidad.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 8,93 millones de parametros en fp32 los pesos ocupan aproximadamente 36 MB, por lo que la inferencia cabe en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el autor valida la inferencia en CPU y el entrenamiento se realizo en una B200. Cualquier GPU con suficiente memoria para el lote es valida.
- Cabe en GPU consumer: si, con margen amplio (RTX 4090, RTX 3060 y modelos inferiores), aunque la latencia documentada es en CPU.
- Opciones de despliegue: el repositorio incluye `inference.py` autocontenido que depende solo de torch, numpy, Pillow y safetensors, con CLI y demo. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: mediana de 13,3 ms por linea en CPU segun la puerta I5; no se publican cifras de throughput ni latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThakiOCR-KOEN-G2M-Preview | 8,93 M | linea de altura 48 px, anchura max. 2048 px | CER 1,11% en validacion real; 94,2% en tokens criticos de simbolos | Apache-2.0 | HuggingFace, vista previa de investigacion |
| ThakiOCR-KOEN-V1-Dense (A) | 2,13 M | linea de texto | CER 8,48% en validacion real; 40,2% en tokens criticos | no disponible en la informacion | interno del autor, usado como referencia |
| S1 (interno del autor) | 2,13 M | linea de texto | CER 2,50% en validacion real; 35,7% en tokens criticos | no disponible en la informacion | interno del autor |

No se dispone de datos de otros reconocedores de lineas coreanas de terceros en la informacion proporcionada para ampliar la comparativa.

## Limitaciones y advertencias

- Estado declarado como NO-GO para produccion por el propio autor (A1_GEN2_NO_GO); se publica como vista previa de investigacion.
- Falla la puerta I4: solo 3 de 4 tokens de fecha exactos en la validacion real.
- No localiza texto en una pagina; requiere un detector de lineas o modelo de layout previo.
- Solo cubre coreano e ingles; no se documenta soporte de otros idiomas.
- Rechaza lineas que superan los 2048 px de anchura tras el redimensionado, en lugar de comprimirlas.
- La decodificacion CTC voraz sin modelo de lenguaje puede producir errores en caracteres ambiguos.
- La normalizacion NFC sin NFKC mantiene distintos `￦` (U+FFE6) y `₩` (U+20A9), lo que puede afectar a comparaciones de cadenas.
- La prueba de simbolos fue generada por el propio renderizador del autor, por lo que su alcance es limitado a esa habilidad.
- Riesgo de alucinacion no evaluado en la informacion disponible; sesgos conocidos no documentados.
- No se distribuye ningun dato de entrenamiento; los originales de AI Hub y los recortes derivados permanecen en almacenamiento domestico de ThakiCloud.
- Licencia Apache-2.0 para codigo y pesos, sin restricciones comerciales documentadas adicionales, si bien el uso en produccion se declara NO-GO por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/ThakiOCR-KOEN-G2M-Preview
- Tarjeta del modelo en coreano: https://huggingface.co/ThakiCloud/ThakiOCR-KOEN-G2M-Preview/blob/main/MODEL_CARD.ko.md
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/OCR-Synthetic-Multilingual-v1
- Dataset AI Hub 71299: no disponible (referenciado en la model card sin URL)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada
