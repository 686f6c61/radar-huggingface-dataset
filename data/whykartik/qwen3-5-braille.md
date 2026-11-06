# whykartik/qwen3.5-braille

## Resumen

BrailleQwen-2B es un modelo de visión-lenguaje especializado en el reconocimiento y transcripción de braille inglés impreso en relieve o en tinta. Lo desarrolla el autor independiente whykartik (publicado bajo el identificador `whykartik/qwen3.5-braille`, aunque la model card interna lo atribuye a `ai4bharat`) como un ajuste fino completo de Qwen3.5-2B, un transformer multimodal de 2.721.801.024 parámetros. El modelo resuelve una tarea concreta: dada una fotografía de un fragmento de braille, devuelve el texto inglés que codifica, sin ningún otro contenido.

La relevancia del modelo está en su enfoque de datos: se ha entrenado exclusivamente con aproximadamente 277.000 imágenes braille sintéticas (Unified English Braille, grados 1 y 2) generadas a partir de ventanas de texto de FineWeb, traducidas con Liblouis y renderizadas con un modelo de sombreado de mapa de altura más degradaciones fotográficas. No se utilizó ninguna fotografía real ni datos de BrailleBench durante el entrenamiento, lo que lo convierte en una referencia interesante para estudiar la transferencia de sintético a real en OCR de braille.

El modelo se distribuye con licencia Apache-2.0, requiere `transformers` 5.x y está pensado como herramienta de accesibilidad, archivado e investigación, no como sistema de transcripción crítico sin verificación humana. Su ventana de contexto y sus especificaciones de cuantización no están documentadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) basada en Qwen3.5-2B; detalles internos de la arquitectura no disponibles |
| Parametros totales | 2.721.801.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (repo de 5,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer multimodal de tipo image-text-to-text, y se somete a un ajuste fino completo de todos los parámetros en bf16. La tarea se formula como una única conversación de usuario: una imagen más una instrucción corta, sin mensaje de sistema, y la salida es únicamente el texto inglés decodificado. Se entrenó con diez paráfrasis distintas de la instrucción, por lo que cualquiera de ellas funciona en inferencia.

Los datos de entrenamiento son 276.717 imágenes sintéticas, una por cada texto de etiqueta distinto. El pipeline es el siguiente: se extraen ventanas de 1 a 50 palabras de FineWeb (`sample-10BT` y una parte menor de `CC-MAIN-2013-20`); se traducen a braille Unicode con Liblouis 3.38.0 usando las tablas `en-ueb-g1.ctb` y `en-ueb-g2.ctb` (47 % grado 1 y 53 % grado 2); se renderizan como puntos en relieve con un modelo de sombreado de mapa de altura y se aplican degradaciones fotográficas (grano, iluminación, perspectiva, curvatura de página, deformación elástica, rotación leve, dominantes de color, poca luz, ruido, JPEG, manchas y fondos fotográficos). Además, alrededor del 25 % de los textos tienen letras desordenadas para forzar al modelo a leer las celdas en lugar de adivinar palabras probables, y se incluyen estilos opcionales como puntos fantasma en tinta plana, puntos huecos en anillo, tiras de cinta de colores y primeros planos.

## Capacidades

- Transcripción de braille inglés impreso en relieve o en tinta a texto plano, para Unified English Braille en grados 1 (no contraído) y 2 (contraído).
- Procesamiento de imágenes con instrucción en lenguaje natural: acepta una imagen y una instrucción corta y devuelve solo el texto decodificado.
- Robustez ante degradaciones fotográficas simuladas: grano, ruido, poca luz, dominantes de color, perspectiva, curvatura de página, manchas y fondos.
- Lectura de estilos alternativos: puntos fantasma en tinta plana, puntos huecos en anillo, tiras de cinta de colores y primeros planos.
- Manejo de textos con letras desordenadas, lo que indica que lee las celdas y no solo aplica un prior de lenguaje.
- Capacidades multimodales heredadas del modelo base Qwen3.5-2B (no documentadas en detalle para esta variante).
- No soporta tool calling, agentes ni modos de razonamiento extendido de forma documentada.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Herramientas de accesibilidad para personas con discapacidad visual: el modelo puede transcribir fotografías de carteles, etiquetas o páginas en braille a texto que un lector de pantalla pueda vocalizar, aprovechando su entrenamiento con degradaciones fotográficas realistas.
- Digitalización y archivado de documentos braille: digitalización de páginas y pasajes cortos de libros en braille inglés para su indexación y búsqueda, con revisión humana posterior dado el riesgo de error.
- Investigación en transferencia sintético-a-real: sirve como línea base reproducible para estudiar cómo se comporta un modelo entrenado solo con datos sintéticos en imágenes braille reales.
- Etiquetado asistido de corpus braille: generación de transcripciones preliminares para acelerar la anotación manual de conjuntos de datos de OCR braille.
- Verificación de señalética en espacios públicos: lectura de carteles y etiquetas en braille en edificios para auditar su corrección, siempre con comprobación humana.
- Educación y aprendizaje del braille: apoyo a estudiantes y docentes para comprobar la lectura de ejercicios impresos en braille, con la advertencia de que no debe usarse como única fuente en contextos evaluables.
- Investigación en OCR de braille: comparación de enfoques de renderizado sintético y análisis de errores en estilos concretos (puntos huecos, tinta plana, primeros planos).

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a BrailleBench, utilizado como conjunto de desarrollo durante el diseño de los datos de entrenamiento, por lo que el autor advierte que las cifras son probablemente optimistas.

| Conjunto | Elementos | Exact match | CER | WER |
|---|---:|---:|---:|---:|
| BrailleBench | 259 | 81,85 % | 3,18 % | 8,23 % |

No se han publicado resultados de benchmarks en otros conjuntos ni comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada en la información disponible. Con 2.721.801.024 parámetros, en bf16 los pesos ocupan aproximadamente 5,4 GB, por lo que se necesita algo más de esa cifra para activaciones y caché; en cuantizaciones de 8 o 4 bits el requisito sería considerablemente menor, aunque no se publican versiones cuantizadas.
- GPU recomendadas: no disponibles. Por tamaño, el modelo debería caber en GPUs de consumo con al menos 8-12 GB de VRAM en bf16, pero esta estimación no está confirmada por el autor.
- Cabe en GPU de consumo: probablemente sí en modelos con 8 GB o más en bf16, y con margen en 12-16 GB; sin confirmación oficial.
- Opciones de despliegue: `transformers` 5.x con `AutoProcessor` y `AutoModelForImageTextToText` (el checkpoint se guardó con 5.10.2). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni versiones GGUF.
- Latencia y throughput: no disponibles. El autor recomienda decodificación greedy y acotar `max_new_tokens` (por ejemplo, 256) para evitar bucles de repetición.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de OCR de braille en la documentación proporcionada. Como referencia del modelo base:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BrailleQwen-2B | 2.721.801.024 | No disponible | Image-text-to-text (braille inglés) | Apache-2.0 | Hugging Face |
| Qwen3.5-2B (base) | 2B (aproximado) | No disponible | Image-text-to-text general | Apache-2.0 (según el modelo derivado) | Hugging Face |
| Alternativas de OCR braille | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Dominio: entrenado solo con imágenes sintéticas; el comportamiento en fotografías reales se infiere de benchmarks, no de datos reales de entrenamiento, y otros renderizados pueden degradar la precisión bruscamente.
- Puntos débiles conocidos por análisis de errores de modelos con la misma receta: primeros planos muy grandes (más de unos 70 px por celda), estilos de tinta plana o puntos fantasma, páginas densas de varias líneas (bucles de repetición), imágenes de bajo contraste y muy pequeñas, y palabras extra insertadas en recortes muy cortos.
- No cubierto: imágenes rotadas 90 grados, imágenes espejadas, distorsiones ópticas de cámara y cualquier braille que no sea inglés UEB (incluidos Nemeth/matemáticas, música y otros códigos).
- Prior de lenguaje: al provenir de texto web, cuando las celdas son ilegibles puede emitir una palabra plausible en lugar de señalar incertidumbre, y no proporciona ninguna indicación de confianza.
- Riesgo de alucinación y repetición en entradas largas o inusuales; se recomienda acotar `max_new_tokens` y aplicar comprobaciones de repetición.
- Uso fuera de alcance: transcripción crítica o legalmente vinculante sin verificación humana (etiquetas de medicamentos, señalización de emergencia, contratos), y determinación de si una imagen contiene braille.
- Idiomas: solo inglés; no hay soporte documentado para otras lenguas.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre la exactitud en dominios reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whykartik/qwen3.5-braille
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio referenciado en la model card: https://huggingface.co/ai4bharat/BrailleQwen-2B
- Liblouis (traducción a braille Unicode): https://liblouis.io/
- FineWeb (dataset de texto de entrenamiento): https://huggingface.co/datasets/HuggingFaceFW/fineweb
- BrailleBench: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
