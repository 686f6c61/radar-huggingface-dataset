# wesleyerick/brazilian-license-plate-detector-yolov11-onnx

## Resumen

`wesleyerick/brazilian-license-plate-detector-yolov11-onnx` es una exportación a formato ONNX del detector YOLOv11 entrenado por Felipe Dutrain (`felipedutrain/placa-br-yolov11`) para localizar matrículas de vehículos brasileños, tanto en el estándar Mercosul como en el formato antiguo gris/cinza. No se trata de un modelo nuevo: el autor publica únicamente la conversión de los pesos PyTorch originales a un grafo ONNX ejecutable con ONNX Runtime, sin reentrenamiento declarado.

Su interés práctico está en el empaquetado: un único fichero de aproximadamente 36 MB que elimina la dependencia de PyTorch (unos 800 MB) y que, según la model card, ejecuta inferencia en CPU en menos de 100 ms. Eso lo sitúa en el terreno de las funciones serverless (AWS Lambda, Vercel, Google Cloud Run) y de los dispositivos edge, donde instalar el stack completo de PyTorch no es viable.

La información publicada es escasa: no hay arquitectura detallada, número de parámetros, composición del dataset de entrenamiento ni métricas de evaluación (mAP, precisión/recall). La licencia es MIT y el pipeline declarado es `object-detection`; el modelo detecta matrículas, no las reconoce ni las transcribe.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv11 (detector de objetos de una etapa), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin ventana de texto) |
| Tipos de cuantizacion | el repositorio incluye el tag `base_model:quantized`, pero el esquema de cuantización no está documentado (no disponible) |
| Idiomas soportados | pt, en (según metadatos del repositorio; el modelo no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx`), aproximadamente 36 MB |
| Tarea (pipeline) | `object-detection` |
| Modelo base | `felipedutrain/placa-br-yolov11` |
| Entrada / salida | no disponible (la model card no documenta forma del tensor ni formato de cajas) |
| Clases detectadas | matrículas brasileñas Mercosul y formato gris/cinza (lista de clases no publicada) |

## Arquitectura y entrenamiento

La model card solo indica que se trata de YOLOv11, un detector de objetos de una etapa, y que los pesos proceden del modelo PyTorch de Felipe Dutrain. No se documenta el bloque concreto de la variante (n, s, m, l o x), el número de parámetros, la resolución de entrada, el número de clases ni el esquema de anclas o asignación. Tampoco se especifica si la exportación incluye el post-procesado (NMS) dentro del grafo ONNX o si debe aplicarse en el código del cliente, un detalle crítico para integrar el modelo en producción.

Respecto al entrenamiento, no hay información sobre volumen de imágenes, procedencia del dataset, aumentos de datos, función de pérdida ni proceso de ajuste. No aplican RLHF, DPO ni fases de alineación por tratarse de un detector visual. La aportación técnica del repositorio se limita a la conversión de formato y a la reducción del tamaño de despliegue: se pasa de un entorno con PyTorch a un runtime ONNX de 36 MB, lo que habilita ejecución en CPU y en plataformas sin soporte nativo de PyTorch.

## Capacidades

- Detección de matrículas brasileñas en formato Mercosul (fondo blanco con banda azul) y en el formato antiguo gris/cinza, según declara el autor.
- Salida de cajas delimitadoras sobre la imagen de entrada (coordenadas y confianza; el formato exacto no está documentado).
- Inferencia en CPU en menos de 100 ms según la model card (hardware de referencia no especificado).
- Ejecución sin dependencia de PyTorch, apta para entornos serverless y dispositivos edge.
- Ejecución mediante ONNX Runtime, lo que permite seleccionar distintos execution providers (CPU, CUDA, TensorRT, DirectML) sin cambiar el modelo.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No realiza OCR ni lectura de caracteres: solo localiza la matrícula en la imagen.
- No dispone de modo de razonamiento, capacidades agénticas, audio ni vídeo más allá del procesado fotograma a fotograma.

## Casos de uso

- **Control de acceso en parkings y recintos privados**: el detector localiza la matrícula en la imagen de la cámara de entrada; un OCR posterior extrae los caracteres y se contrasta con la lista de vehículos autorizados. La inferencia en CPU en menos de 100 ms permite ejecutarlo en el propio equipo de la barrera.
- **Peajes y telepeaje con visión artificial**: integrado en un pipeline junto a un lector de caracteres, sirve para registrar el paso de vehículos y conciliar la matrícula con el ticket o el tag. El tamaño de 36 MB facilita desplegarlo en cabinas con hardware modesto.
- **Gestión de flotas y logística**: procesado por lotes de fotografías de vehículos para verificar que la matrícula es legible y está correctamente encuadrada antes de archivarlas, usando ONNX Runtime en un contenedor sin PyTorch.
- **Función serverless para imágenes subidas por el usuario**: al eliminar la dependencia de PyTorch, el modelo cabe en el límite de tamaño de despliegue de AWS Lambda o Google Cloud Run y puede invocarse bajo demanda para validar que una foto contiene una matrícula brasileña antes de pasarla a OCR.
- **Dispositivos edge y cámaras IP**: despliegue en una Raspberry Pi o en un mini-PC con CPU, sin GPU, para detección continua en el propio dispositivo y envío únicamente de los recortes relevantes a la nube.
- **Preprocesado en aplicaciones móviles o web**: uso como primer paso de un pipeline de identificación de vehículos, recortando la matrícula detectada para pasarla a un modelo de reconocimiento de caracteres especializado.
- **Análisis de tráfico y auditoría de imágenes**: filtrado automático de imágenes que contienen matrículas para anonimización previa a su publicación, detectando la región a difuminar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye mAP, precisión, recall, matriz de confusión ni curvas de confianza, y tampoco especifica el conjunto de validación empleado. El único dato de rendimiento declarado es una latencia inferior a 100 ms en CPU, sin indicar modelo de procesador ni resolución de entrada, por lo que no es posible reproducir la medición ni compararla con otras alternativas.

## Requisitos de hardware

- **Tamaño en disco**: aproximadamente 36 MB para el fichero ONNX, más el runtime de ONNX Runtime (decenas de MB, según la distribución).
- **VRAM**: no disponible. La model card documenta ejecución en CPU, no en GPU, y no publica consumo de memoria.
- **Ejecución en CPU**: soportada y recomendada por el autor; latencia declarada inferior a 100 ms por inferencia sin especificar el procesador.
- **GPU**: no se publican cifras. Por el tamaño del modelo (36 MB) es previsible que quepa en cualquier GPU consumer (RTX 3060, RTX 4090, etc.), pero no hay datos de latencia ni de throughput que lo confirmen.
- **GPU de datacenter**: no disponible. No se aportan mediciones en A100, H100, L4 ni T4.
- **Opciones de despliegue**: ONNX Runtime en Python, en C++ o vía `onnxruntime-web`; contenedores serverless (AWS Lambda, Google Cloud Run, Vercel); dispositivos edge. Herramientas orientadas a LLM como vLLM, llama.cpp, Ollama o TGI no son aplicables a este formato y tarea.
- **Latencia y throughput**: solo el dato declarado de <100 ms en CPU; sin valores de imágenes por segundo ni de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Formato | Dependencias | Tamaño | Licencia | Métricas publicadas |
|---|---|---|---|---|---|
| `wesleyerick/brazilian-license-plate-detector-yolov11-onnx` (este) | ONNX | ONNX Runtime | ~36 MB | MIT | no disponible |
| `felipedutrain/placa-br-yolov11` (modelo base) | PyTorch | PyTorch (~800 MB) | no disponible | no disponible en la información proporcionada | no disponible |
| Otras alternativas de detección de matrículas brasileñas | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo base: misma arquitectura y mismos pesos, pero este repositorio elimina PyTorch del entorno de ejecución a cambio de fijar el formato ONNX. No se han identificado en la información proporcionada otros detectores de matrículas brasileñas con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **Ausencia total de métricas**: no hay mAP, precisión, recall ni umbrales recomendados. Cualquier uso en producción exige una validación propia sobre imágenes del dominio objetivo antes de confiar en el modelo.
- **Dataset de entrenamiento no documentado**: se desconoce la procedencia de las imágenes, la distribución geográfica, las condiciones de iluminación y los ángulos cubiertos, lo que impide estimar el sesgo y la generalización.
- **Ámbito geográfico restringido**: está entrenado para matrículas brasileñas (Mercosul y formato gris/cinza). No cabe esperar buen rendimiento en matrículas europeas, norteamericanas ni de otros países del Mercosul sin verificación empírica.
- **Solo detección, no reconocimiento**: no transcribe los caracteres de la matrícula; requiere un OCR o un modelo de reconocimiento adicional para obtener el texto.
- **Riesgo de falsos positivos y negativos**: al no publicarse curvas de precisión/recall, no es posible fijar un umbral de confianza justificado; en entornos de control de acceso esto puede traducirse en denegaciones erróneas o accesos no autorizados.
- **Formato de salida no especificado**: se desconoce si el grafo ONNX incluye NMS y en qué orden y escala se devuelven las cajas, lo que puede provocar errores de integración.
- **Discrepancia en metadatos**: la model card declara ~36 MB, mientras que los metadatos del repositorio indican 0.0 GB de tamaño; conviene verificar el contenido real antes de desplegar.
- **Validación comunitaria nula**: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de revisión por terceros.
- **Licencia MIT**: permite uso comercial, modificación y redistribución, pero exige conservar el aviso de copyright y la atribución al modelo base de Felipe Dutrain.
- **Privacidad y normativa**: la lectura de matrículas es tratamiento de datos personales en la UE; su uso requiere base jurídica conforme al RGPD y, en el caso de Brasil, conformidad con la LGPD.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wesleyerick/brazilian-license-plate-detector-yolov11-onnx
- Modelo base (PyTorch): https://huggingface.co/felipedutrain/placa-br-yolov11
- Paper, blog o demo: no disponible en la información proporcionada.
