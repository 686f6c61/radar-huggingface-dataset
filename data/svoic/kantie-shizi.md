# svoic/kantie-shizi

## Resumen

Kantie Shizi v1 (看帖识字) es un modelo de clasificación de imágenes especializado en el reconocimiento de caracteres individuales de caligrafía china. Lo desarrolla la Silicon Valley Open Intelligence & Culture Foundation (SVOIC) junto con el Silicon Valley Poetry Center, y resuelve un problema muy concreto: dada una imagen ya recortada de un solo carácter caligráfico, identificar cuál es entre un vocabulario cerrado de 4.167 tipos de carácter. Cubre los estilos regular (楷), semi-cursiva (行楷), cursiva (行), cursiva loca (草) y clerical (隶).

Se trata de una CNN pequeña entrenada desde cero, con 4,96 millones de parámetros y un peso de apenas 20 MB en ONNX fp32, lo que la hace desplegable en navegador (onnxruntime-web) y en móvil. No emplea ningún backbone preentrenado, ni fuentes tipográficas, ni salidas de otros modelos: todo el entrenamiento proviene de 213.753 imágenes de caracteres extraídas de 1.385 obras auténticas del National Palace Museum de Taipéi publicadas bajo CC BY 4.0.

Su relevancia actual radica en dos factores. Primero, demuestra que un modelo de menos de 5 M de parámetros puede superar a OCR especializados y a grandes modelos multimodales (incluidos GPT, Gemini, Claude, Kimi o Qwen) en una tarea de nicho cuando el dominio y los datos están bien acotados. Segundo, ofrece una cadena de custodia completa desde el dato hasta el peso, con licencia CC BY-SA 4.0 y trazabilidad por obra, algo poco habitual en modelos de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de cuatro capas convolucionales (64/128/256/384 canales) entrenada desde cero |
| Parametros totales | 4,96 M (aproximadamente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 64x64 píxeles en escala de grises) |
| Tipos de cuantizacion | no disponible (se distribuye fp32 en ONNX y safetensors) |
| Idiomas soportados | chino (zh), con etiquetas en escritura tradicional y variantes tal como aparecen en las transcripciones del museo |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (fp32, 20 MB) y safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es una red convolucional de cuatro etapas con 64, 128, 256 y 384 canales respectivamente, seguida de una cabeza de clasificación sobre 4.167 clases. La entrada se normaliza a 64x64 en escala de grises tras un relleno cuadrado con el color del papel y un redimensionado bicúbico a 224 píxeles. El entrenamiento usó aumentación afín aleatoria, label smoothing de 0,1, optimizador AdamW con scheduler OneCycle y tasa máxima 3e-3, 60 épocas y batch de 512, con un coste aproximado de 5 horas en una DGX Spark.

El pipeline de datos es la parte más interesante. Partiendo de 2.265 obras con transcripción del museo, se recortan las columnas y se alinean los caracteres de la transcripción con las cajas mediante programación dinámica. Un primer modelo v0, entrenado con las 26.000 alineaciones más fiables, sirve para reetiquetar: se conservan solo las cajas cuyo carácter aparece en el top-3 del modelo y cuya geometría es plausible, elevando la proporción de caracteres "fiables" de aproximadamente el 10 % al 30 %. Con ese conjunto (1.731 obras, 267.102 caracteres, 640 calígrafos) se entrena el v1, reservando 346 obras (53.349 caracteres) para evaluación. La distribución por estilo en entrenamiento es: 141.000 en regular, 72.000 en cursiva, 25.000 en semi-cursiva, 22.000 en cursiva loca y unos 5.000 entre clerical y seal.

## Capacidades

- Clasificación de un único carácter caligráfico recortado entre 4.167 tipos, devolviendo probabilidades y top-k.
- Cobertura de cinco estilos: regular (楷), semi-cursiva (行楷), cursiva (行), cursiva loca (草) y clerical (隶), con muestras menores de seal.
- Acepta imágenes en color o escala de grises y de cualquier tamaño; el preprocesado interno las normaliza.
- Inferencia en navegador mediante ONNX Runtime Web y en dispositivos móviles por el reducido tamaño del modelo.
- Backend alternativo en PyTorch a partir de los pesos safetensors.
- No incluye detección de caracteres en página completa, tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la clasificación.

## Casos de uso

- Digitalización de colecciones caligráficas: dado un conjunto de obras ya segmentadas en caracteres, el modelo permite transcribir automáticamente y con alta precisión (94 % en calígrafos no vistos) para generar índices de búsqueda sobre fondos museísticos.
- Herramientas de estudio de caligrafía: una aplicación móvil puede reconocer el carácter que el usuario está contemplando en una obra y mostrar su lectura, aprovechando los 20 MB del modelo para ejecutarse localmente sin conexión.
- Asistencia a epigrafistas y paleógrafos: como primer paso de transcripción sobre recortes de inscripciones o manuscritos, reduciendo el trabajo manual y dejando la revisión humana para los casos de baja confianza.
- Verificación de alineaciones en pipelines de OCR histórico: el modelo puede usarse como juez para validar que un recorte corresponde realmente al carácter transcrito, tal como hizo el propio equipo en su fase de reetiquetado.
- Aplicaciones educativas de aprendizaje de caracteres: ejercicios en los que el alumno dibuja o selecciona un carácter caligráfico y el sistema comprueba la identificación, con la ventaja de funcionar en web y móvil.
- Catalogación de archivos personales o familiares con caligrafía: para colecciones privadas de cartas o documentos, se puede segmentar manualmente o con un OCR genérico y usar este modelo para la lectura fina de los caracteres.
- Investigación en visión por computador aplicada a patrimonio: como baseline ligero y reproducible para experimentos de reconocimiento de escritura histórica con licencia abierta.

## Benchmarks y rendimiento

Evaluación sobre 500 caracteres de 61 calígrafos no vistos en entrenamiento (82 obras), estratificados por estilo (150 regular, 80 semi-cursiva, 120 cursiva, 100 cursiva loca, 50 clerical), semilla 20261104. Precisión top-1 en porcentaje:

| Modelo | Global | 楷 | 行楷 | 行 | 草 | 隶 |
|---|---|---|---|---|---|---|
| Kantie Shizi v1 | 94,0 | 96,7 | 98,8 | 95,8 | 82,0 | 98,0 |
| PaddleOCR PP-OCRv5 | 86,4 | 93,3 | 88,8 | 92,5 | 62,0 | 96,0 |
| Qwen3.8-Max-Prime | 85,8 | 94,7 | 88,8 | 85,8 | 64,0 | 98,0 |
| Qwen3.6-35B-A3B (4 bits) | 84,8 | 94,7 | 86,2 | 86,7 | 63,0 | 92,0 |
| Kimi K3.1 Pro | 84,0 | 92,0 | 90,0 | 87,5 | 55,0 | 100 |
| Gemini 4 Argon | 82,8 | 96,0 | 85,0 | 76,7 | 63,0 | 94,0 |
| Claude Fable 5.1 | 80,0 | 92,7 | 88,8 | 75,0 | 53,0 | 94,0 |
| GPT-6 Astra | 76,4 | 90,0 | 80,0 | 73,3 | 49,0 | 92,0 |
| DeepSeek-OCR-2 | 15,4 | 22,0 | 13,8 | 8,3 | 7,0 | 32,0 |

En obras reservadas por completo (346 obras, 52.882 caracteres) la precisión top-1 es del 95,9 % y top-5 del 98,5 % (regular 96,2, semi-cursiva 96,4, cursiva 96,3, cursiva loca 93,1). En la comprobación humana de 210 caracteres muestreados de los 330.000 reetiquetados como fiables no se detectó ningún error de reconocimiento (límite superior del 95 % de confianza en torno al 1,8 %); sí se hallaron 13 defectos de recorte (9 con trazos vecinos, 4 con trazos cortados), atribuidos al pipeline de segmentación y no al clasificador. En fuentes impresas la precisión cae: 96,8 % en tipo kai, 85,8 % en hei, 63,8 % en Song y 59,0 % en Ming; en escritura a mano con bolígrafo (CASIA-HWDB1.1, 600 caracteres) solo alcanza el 26,7 %.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp32; el modelo ONNX ocupa 20 MB y la activación es mínima (entrada 1x64x64).
- GPU recomendadas: cualquier GPU con soporte CUDA u ONNX Runtime, incluidas GTX 1050, RTX 3050, RTX 4090, A100 o H100; el modelo no aprovecha la GPU por su tamaño, que es despreciable frente a la latencia de transferencia.
- Cabe en cualquier GPU de consumo, en CPU moderna e incluso en navegador y móvil; no requiere acelerador dedicado.
- Opciones de despliegue: ONNX Runtime (Python, C++, JS), onnxruntime-web en navegador, PyTorch con safetensors, y exportación a otros runtimes de ONNX.
- Latencia y throughput: no se publican cifras concretas; por el tamaño (4,96 M de parámetros y entrada 64x64), se espera inferencia en milisegundos en CPU y decenas de miles de imágenes por segundo en GPU, pero son estimaciones no verificadas con datos del autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Rendimiento (500 no vistos) | Licencia |
|---|---|---|---|---|---|
| Kantie Shizi v1 | CNN específica de caligrafía | 4,96 M | 64x64 gris | 94,0 % top-1 | CC BY-SA 4.0 |
| PaddleOCR PP-OCRv5 | OCR genérico | no disponible | imagen de texto | 86,4 % top-1 | Apache 2.0 (según el proyecto PaddleOCR) |
| DeepSeek-OCR-2 | OCR de página completa | no disponible | página completa | 15,4 % en recortes | no disponible en la información |
| Qwen3.6-35B-A3B | LLM multimodal con visión | 35 B totales, ~3 B activos | contexto largo | 84,8 % top-1 | no disponible en la información |

La comparación debe leerse con cautela: el conjunto de evaluación solo incluye los 4.167 caracteres que conoce Kantie Shizi, de modo que los modelos generales no pueden acertar caracteres fuera de ese vocabulario. Aun así, la diferencia en cursiva loca (82,0 frente a 49-64 del resto) es la más significativa.

## Limitaciones y advertencias

- Solo procesa caracteres ya recortados; no localiza ni segmenta caracteres en una página o línea completa.
- Está especializado en caligrafía a pincel. Rinde mal en tipografías impresas (Song 63,8 %, Ming 59,0 %) y muy mal en escritura manual con bolígrafo (26,7 % en CASIA-HWDB1.1), donde un OCR general obtiene entre el 80 % y el 100 %.
- El vocabulario está cerrado a 4.167 tipos de carácter; los caracteres raros o con una o dos apariciones en el corpus no se reconocen.
- La cursiva loca es el estilo más débil: 82,0 % en calígrafos no vistos frente al 93 % en obras reservadas.
- Los estilos clerical y seal tienen pocas muestras (unos 5.000 caracteres en total), por lo que sus intervalos de confianza son amplios.
- El corpus se concentra en calígrafos Ming y Qing del museo de Taipéi; hay pocas muestras anteriores a Tang, lo que puede introducir sesgo hacia convenciones de escritura tardías.
- Los caracteres de entrenamiento son los que pasaron el filtro de alineación, por lo que tienden a ser regulares; caracteres dañados, borrosos o muy pequeños son más difíciles.
- Riesgo de alucinación acotado pero real: siempre devuelve una de las 4.167 clases, aunque la imagen no corresponda a ninguna, por lo que conviene aplicar un umbral de confianza.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribución ("Kantie Shizi v1 (SVOIC, CC BY-SA 4.0)") y que las obras derivadas se distribuyan bajo la misma licencia, lo que puede condicionar su integración en productos propietarios.
- El modelo no está respaldado ni producido por el National Palace Museum; las obras de entrenamiento requieren su propia atribución (CC BY 4.0, www.npm.gov.tw).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/svoic/kantie-shizi
- Modelo hermano de la misma organización (Kantu Shixiang v2): https://huggingface.co/svoic/kantu-shixiang
- National Palace Museum Open Data (fuente de los datos): https://www.npm.gov.tw
- Repositorio de PaddleOCR (modelo comparado): https://github.com/PaddlePaddle/PaddleOCR
- ONNX Runtime: https://onnxruntime.ai
- onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
- Dataset CASIA-HWDB (evaluación de escritura manual): http://www.nlpr.ia.ac.cn/databases/handwriting/Home.html
