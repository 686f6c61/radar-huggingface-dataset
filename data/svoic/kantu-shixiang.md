# svoic/kantu-shixiang

## Resumen

Kantu Shixiang v1 (看图识象) es un modelo pequeño de clasificación de imágenes multi-etiqueta desarrollado por el usuario svoic, orientado a reconocer 99 tipos de «物象» (imágenes o motivos) habituales en la poesía clásica china: montañas, ríos, barcas, garzas, pastores, cabañas de paja, etc. Además de las etiquetas de contenido, clasifica el tipo de soporte o técnica pictórica en seis categorías (fotografía, óleo, grabado, dibujo, acuarela y pintura china a la tinta) e indica de forma aproximada en qué zona de la imagen aparece cada motivo (imagen completa o uno de los cuatro cuadrantes).

Técnicamente no es un transformer entrenado desde cero, sino un cabezal de clasificación ligero montado sobre el codificador de imagen de Mitsua Japanese CLIP ViT-B/16, que se usa sin modificar. El modelo completo pesa unos 0,5 GB y se distribuye en formato safetensors (codificador en fp16), PyTorch (`head.pt`) y ONNX fp16 de 175 MB, con un consumo de aproximadamente 0,4-0,5 segundos por imagen en CPU de cuatro hilos.

Su relevancia es doble: por un lado, cubre una tarea de nicho (etiquetado de motivos de la poesía clásica china) con un conjunto de etiquetas cerrado y documentado; por otro, su linaje de datos es inusualmente transparente, ya que todo el material de entrenamiento procede de fuentes de dominio público o con licencia abierta, sin capturas web ni imágenes generadas por IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador ViT-B/16 (CLIP) congelado + cabezal de clasificación multi-instancia sobre 5 vistas |
| Parametros totales | 86,4 M (codificador) + 0,97 M (cabezal de 99 clases) + 4,6 K (cabezal de 6 clases) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp16 (ONNX y safetensors); int8 dinámica evaluada pero no publicada por pérdida de calidad |
| Idiomas soportados | zh, en (etiquetas y léxico; el codificador base es de CLIP japonés) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (encoder fp16, 173 MB), PyTorch `head.pt` (1,9 MB), ONNX fp16 (175 MB), JSON de umbrales, NPZ de vectores de texto |

## Arquitectura y entrenamiento

El modelo reutiliza el codificador de imagen de Mitsua Japanese CLIP ViT-B/16, con 86,4 M de parámetros, sin ningún ajuste fino. Cada imagen se procesa en cinco vistas: la imagen completa reescalada a 224×224 y los cuatro cuadrantes de un redimensionado a 448×448. Cada vista produce un vector de 768 dimensiones que alimenta un cabezal de 0,97 M de parámetros que puntúa las 99 clases de motivos; la puntuación máxima entre vistas se toma como puntuación de la imagen y la vista del máximo determina la posición. Un segundo cabezal de 4,6 K parámetros clasifica el tipo de soporte en seis clases. Se añaden 19 vectores de texto precalculados del codificador de texto de Mitsua como «segunda opinión» para la clase 塔 (pagoda), que no usa el cabezal, y tablas de umbrales calibradas manualmente para fotografía y pintura.

Los cabezales se entrenaron con características extraídas de 8,2 millones de imágenes de dominio público de PD12M que pudieron cruzarse con Wikimedia Commons por sha1. Las etiquetas provienen exclusivamente de texto escrito por humanos (nombres de archivo y categorías de Commons, CC BY-SA 4.0); no se usaron las descripciones sintéticas de PD12M. Entraron en entrenamiento 2.071.107 imágenes etiquetadas, de las cuales 445.952 contenían al menos un motivo positivo; el 5 % se reservó para validación por hash de identificador. El cabezal de tipo de soporte vio además 25.037 pinturas chinas de dominio público o CC BY 4.0 procedentes de colecciones de acceso abierto (Museo del Palacio de Taipéi, Metropolitan, Cleveland, Art Institute of Chicago, Smithsonian). El léxico de correspondencia entre palabras y etiquetas está en `lexicon_v22.json` (134 palabras, 35 de ellas no incluidas en esta versión). Los umbrales se calibraron partiendo del F1 en validación y ajustando con dos rondas de inspección visual humana; los de pintura se calibraron con 369 pinturas con encuadre manual.

## Capacidades

- Clasificación multi-etiqueta de 99 motivos de la poesía clásica china, agrupados en personas (12), paisaje (22), fenómenos celestes (4), plantas (11), aves y otros (13), animales (9), edificios (12), objetos (10) y 泉 (manantial).
- Clasificación del tipo de soporte en seis clases: fotografía, óleo, grabado, dibujo, acuarela y pintura china a la tinta.
- Localización aproximada por cuadrantes (imagen completa, superior izquierda, superior derecha, inferior izquierda, inferior derecha) mediante la vista de máximo.
- Segunda opinión zero-shot con 19 vectores de texto para la clase 塔 y como contraste en otras clases.
- Umbrales diferenciados para fotografía y pintura, seleccionados automáticamente si no se especifica el tipo.
- Ejecución en CPU y en dispositivos móviles mediante el grafo ONNX; no requiere GPU.
- No soporta tool calling, agentes, generación de texto ni razonamiento multi-paso; es exclusivamente un etiquetador de imágenes.

## Casos de uso

- Catalogación de colecciones de pintura china: el modelo etiqueta motivos y detecta el tipo de soporte, lo que permite generar metadatos estructurados para archivos digitales de museos con pinturas de dominio público, un escenario alineado con los datos de entrenamiento del cabezal de soporte.
- Búsqueda visual en corpus poéticos ilustrados: dado un poema con motivos conocidos (montaña, barca, garza), se pueden recuperar ilustraciones que contengan esas etiquetas, usando la localización por cuadrantes para filtrar composiciones.
- Enriquecimiento de bases de datos de imágenes de Wikimedia Commons: el modelo puede proponer etiquetas de motivos y de técnica pictórica para imágenes de dominio público, con revisión humana posterior, dado su origen de datos verificable.
- Filtrado y curación de datasets de entrenamiento: al clasificar el tipo de soporte, permite separar fotografías de pinturas o grabados en pipelines de preparación de datos para otros modelos de visión.
- Aplicaciones educativas sobre arte y poesía clásica: un cliente móvil puede ejecutar el ONNX en el dispositivo (0,4-0,5 s por imagen en CPU de cuatro hilos) para explicar qué motivos aparecen en una obra y en qué zona.
- Moderación o control de calidad en digitalización: la detección de tipo de soporte y la posición de motivos ayudan a verificar que un escaneo corresponde a la obra esperada y a detectar recortes o encuadres incorrectos.
- Análisis de composición pictórica: la distribución de motivos por cuadrantes permite estudiar patrones compositivos (por ejemplo, dónde se sitúan las figuras frente al paisaje) en corpus de pintura china.

## Benchmarks y rendimiento

Inspección visual humana sobre fotografías: se muestrearon 20 imágenes por clase entre las que el modelo marcó como positivas, para 80 clases y 1.484 imágenes en total, con una precisión del 93,9 % (1.394/1.484). Dieciséis clases débiles se reentrenaron con reglas revisadas y pasaron del 67,6 % al 85,6 %.

Comparación en pinturas frente a modelos zero-shot (verdad de referencia: 369 pinturas de dominio público con encuadre manual, 8 clases de encuadre, AP por clase):

| Clase | Positivos | Mitsua CLIP zero-shot | SigLIP 2 B/16 zero-shot (prompts en chino) | SigLIP 2 B/16 zero-shot (prompts en inglés) | Kantu Shixiang |
|---|---|---|---|---|---|
| 人物 | 130 | 0,584 | 0,655 | 0,744 | 0,798 |
| 屋舍楼阁 | 92 | 0,633 | 0,653 | 0,728 | 0,645 |
| 花 | 50 | 0,602 | 0,090 | 0,612 | 0,842 |
| 走兽 | 41 | 0,619 | 0,700 | 0,728 | 0,765 |
| 舟船 | 32 | 0,420 | 0,537 | 0,609 | 0,528 |
| 鸟 | 22 | 0,548 | 0,545 | 0,611 | 0,656 |
| 月 | 16 | 0,362 | 0,033 | 0,496 | 0,432 |
| 桥 | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye el resto de filas de la tabla de evaluación (la fila de 桥 aparece truncada). No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo de clasificación de imágenes.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp16 para el codificador y los cabezales; el ONNX fp16 ocupa 175 MB en disco.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (por ejemplo, RTX 4090) ejecuta la inferencia con holgura, pero no es el objetivo del despliegue.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles; el autor indica que el ONNX es viable en teléfono.
- Opciones de despliegue: PyTorch con `safetensors`, `transformers` y Pillow mediante `shixiang.py`; ONNX Runtime para el grafo `shixiang_fp16.onnx`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: aproximadamente 0,4-0,5 segundos por imagen (5 vistas) en CPU de cuatro hilos. No se proporcionan cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento en pinturas (AP medio de las clases mostradas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kantu Shixiang v1 | Clasificador multi-etiqueta de motivos + tipo de soporte | 86,4 M + 0,97 M + 4,6 K | no aplica | Mejor en 人物 (0,798), 花 (0,842), 走兽 (0,765) y 鸟 (0,656) | CC BY-SA 4.0 | Hugging Face, ONNX |
| Mitsua Japanese CLIP ViT-B/16 | CLIP zero-shot | 86,4 M (codificador) | no aplica | Inferior en la mayoría de clases (0,362-0,633) | CC BY-SA 4.0 | Hugging Face |
| SigLIP 2 B/16 (prompts en inglés) | CLIP zero-shot | no disponible | no aplica | Mejor en 屋舍楼阁 (0,728), 舟船 (0,609) y 月 (0,496) | no disponible en la información | no disponible en la información |
| SigLIP 2 B/16 (prompts en chino) | CLIP zero-shot | no disponible | no aplica | Inferior en general, con 花 en 0,090 | no disponible en la información | no disponible en la información |

## Limitaciones y advertencias

- Dos clases (月 y 火) tienen puntuaciones no fiables, están marcadas como no usables en la tabla de umbrales y no se emiten por defecto.
- Tres clases tienen baja confianza (溪, 星 y 泉), con precisión en inspección de entre el 55 % y el 75 %.
- La clase 塔 se resuelve solo con la segunda opinión zero-shot, no con el cabezal entrenado.
- 舟 y 船 se fusionan en una única salida 舟船.
- El léxico incluye 35 palabras poéticas adicionales (梅, 兰, 菊, 牡丹, 鹤, 鸥, 燕, 樵夫, 隐士, etc.) que no forman parte de esta versión por tener menos de 300 ejemplos fotográficos.
- La localización es solo por cuadrantes, no mediante cajas delimitadoras; no debe interpretarse como detección de objetos precisa.
- El codificador base es un CLIP entrenado para japonés, aunque las etiquetas y el léxico del modelo están en chino e inglés; puede haber desajustes en dominios visuales alejados de los datos de entrenamiento.
- Riesgo de alucinación de etiquetas en imágenes fuera de distribución (por ejemplo, arte no chino, escenas modernas o ilustraciones generadas por IA), ya que el entrenamiento se limita a imágenes de dominio público y pinturas chinas.
- La licencia CC BY-SA 4.0 exige atribución y compartir igual las obras derivadas, lo que condiciona el uso comercial y la integración en productos propietarios.
- El modelo no se ha validado con benchmarks estándar de clasificación de imágenes; las cifras disponibles provienen de inspecciones humanas y de un conjunto de 369 pinturas, por lo que la generalización a otros corpus es incierta.
- El autor no publica una versión int8 porque la cuantización dinámica degradaba demasiado las etiquetas (60 diferencias de etiqueta sobre 518 frente a fp16, que solo difiere en 15 sobre 518).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/svoic/kantu-shixiang
- Modelo base (codificador): https://huggingface.co/Mitsua/mitsua-japanese-clip-vit-b-16
- PD12M (conjunto de datos de imágenes de dominio público): no disponible en la información proporcionada
- Wikimedia Commons (fuente de etiquetas y verificación por sha1): no disponible en la información proporcionada
- Colecciones de acceso abierto citadas (Museo del Palacio de Taipéi, Metropolitan, Cleveland, Art Institute of Chicago, Smithsonian): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponible en la información proporcionada
