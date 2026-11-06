# Zhnivo/page-type-classifier

## Resumen

Page Type Classifier es un modelo de clasificación de imágenes desarrollado por Zhnivo, un proyecto sin ánimo de lucro dedicado a la preservación del patrimonio documental de Bielorrusia. Su función es determinar si una página escaneada de un documento de archivo es texto impreso o mecanografiado (etiqueta `printed`) o si contiene escritura manuscrita, formularios rellenados a mano o tablas completadas manualmente (etiqueta `not_printed`). El modelo resuelve un problema de enrutamiento en pipelines de digitalización: decidir si una página debe procesarse con un motor de OCR para texto impreso o con un modelo de reconocimiento de escritura manuscrita (HTR).

Técnicamente se trata de un EfficientNet-B0 de torchvision con una cabeza de clasificación de dos clases, adaptado para entrada en escala de grises. Con 4.052.126 parámetros, es un modelo muy ligero, diseñado para ejecutarse en CPU o en GPUs de gama baja dentro de flujos de digitalización masiva. Se distribuye en formato safetensors junto con un script de inferencia (`inference.py`) y una configuración (`config.json`), bajo licencia MIT.

Su relevancia actual radica en la creciente digitalización de archivos históricos: los proyectos de preservación necesitan clasificar automáticamente miles de páginas antes de aplicar el motor de reconocimiento adecuado, y este modelo ofrece una solución especializada y de bajo coste computacional para esa tarea concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (torchvision) con cabeza de clasificación de 2 clases |
| Parámetros totales | 4.052.126 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (el modelo clasifica páginas, no procesa texto; los datos de entrenamiento incluyen cirílico y latín) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea EfficientNet-B0, una red neuronal convolucional con bloques de convolución compuesta escalada, originalmente diseñada para clasificación de imágenes ImageNet. Sobre el backbone se añade una cabeza de dos clases que produce la probabilidad de que la página sea impresa. La entrada es una página en escala de grises con el lado más largo redimensionado a 512 píxeles, centrada sobre un cuadrado blanco de 512×512 con relleno (sin estiramiento) y normalización ImageNet, replicando el canal de gris en tres canales.

El entrenamiento se realizó sobre varios miles de páginas escaneadas de documentos de archivo de los siglos XVIII a XX, principalmente en escritura cirílica y latina (ruso en ortografía pre-reforma y moderna, bielorruso, polaco y alemán). El conjunto incluye libros y periódicos impresos, documentos mecanografiados, registros y expedientes manuscritos, y formularios impresos rellenados a mano. Las páginas de validación provienen de libros y expedientes distintos a los de entrenamiento, lo que aporta una evaluación más realista de la generalización. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo discriminativo de este tipo.

## Capacidades

- Clasificación binaria de páginas escaneadas: distingue entre páginas impresas o mecanografiadas (`printed`) y páginas manuscritas o formularios rellenados a mano (`not_printed`).
- Salida de probabilidad calibrada con umbral recomendado de 0,9, ajustable a 0,98 si los falsos positivos de "printed" son costosos.
- Manejo de páginas con anotaciones menores: una firma, un número de página o una nota manuscrita breve no impiden clasificar la página como impresa.
- Entrada en escala de grises con preprocesado específico (redimensionado por lado largo, relleno blanco, normalización ImageNet).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente discriminativo de visión.
- No genera texto ni procesa lenguaje natural; su única salida es una probabilidad por página.

## Casos de uso

- Enrutamiento en pipelines de digitalización de archivos: antes de aplicar OCR o HTR, el modelo clasifica cada página escaneada y la dirige al motor adecuado, evitando que un OCR de texto impreso procese páginas manuscritas y viceversa.
- Digitalización masiva de registros parroquiales y expedientes históricos: en archivos con mezcla de páginas impresas y manuscritas, el modelo permite separar lotes automáticamente y asignar recursos de reconocimiento de forma eficiente.
- Procesamiento de formularios administrativos históricos: los formularios impresos rellenados a mano se clasifican como `not_printed`, lo que permite enviarlos a un modelo HTR en lugar de a un OCR que fallaría con el texto manuscrito.
- Control de calidad en proyectos de preservación: el modelo puede auditar lotes ya procesados para detectar páginas mal enrutadas, comparando la clasificación con el motor aplicado y marcando discrepancias para revisión manual.
- Filtrado previo en la digitalización de prensa histórica: periódicos y libros impresos se clasifican como `printed` y se envían directamente a OCR, reduciendo el coste de procesar páginas manuscritas con modelos más pesados.
- Clasificación en entornos con recursos limitados: al tener solo 4 millones de parámetros, puede ejecutarse en CPU o en GPUs de gama baja dentro de servidores de digitalización, sin necesidad de infraestructura de GPU dedicada.
- Segmentación de lotes mixtos en proyectos con múltiples instituciones: archivos que combinan fondos de distintos siglos y tipologías pueden procesarse por lotes, clasificando cada página y agrupando las que requieren el mismo tratamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32; el modelo tiene 4.052.126 parámetros, lo que supone aproximadamente 16 MB en FP32 y 8 MB en FP16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo cabe holgadamente en GTX 1050, RTX 3050, RTX 4090, A100 o H100, aunque no necesita ninguna de ellas.
- Cabe en cualquier GPU de consumo e incluso en CPU: es viable ejecutarlo en CPU para lotes moderados, dado su tamaño reducido.
- Opciones de despliegue: PyTorch con torchvision y safetensors; el repositorio incluye `inference.py` con funciones `load_model` y `predict`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de clasificación de imágenes.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia baja por página en GPU y aceptable en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo Jev de TypeSafe AI, mencionado en los resultados de búsqueda, es un clasificador discriminativo propietario de propósito general, no especializado en clasificación de páginas de archivo, por lo que la comparación directa no es significativa.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zhnivo/page-type-classifier | 4.052.126 | no aplica | Clasificación binaria de páginas de archivo | MIT | Hugging Face |
| Jev (TypeSafe AI) | no disponible | no disponible | Clasificación tipada de propósito general | Propietaria | Acceso limitado |

## Limitaciones y advertencias

- Ámbito restringido: el modelo está diseñado para escaneos y fotografías de páginas de archivo (libros, registros, expedientes); otras imágenes quedan fuera de su ámbito y los resultados no son fiables.
- Una sola etiqueta por página: una página mitad impresa y mitad manuscrita recibe una única clasificación, sin posibilidad de segmentación por regiones.
- Umbral ajustable: el umbral recomendado de 0,9 puede elevarse a 0,98 si los falsos "printed" son costosos, lo que implica un compromiso entre exhaustividad y precisión que debe calibrarse según el caso de uso.
- Sesgos potenciales: el entrenamiento se centra en documentos de los siglos XVIII a XX en cirílico y latín (ruso, bielorruso, polaco, alemán); páginas de otras tradiciones escriturarias o tipografías podrían clasificarse con menor fiabilidad, aunque no se documentan sesgos específicos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en páginas ambiguas o con mezcla de texto impreso y manuscrito.
- Licencia MIT: permite uso comercial sin restricciones, si bien el autor agradece un enlace al proyecto zhnivo.com.
- En producción: conviene validar el umbral con una muestra representativa del fondo documental concreto y monitorizar las discrepancias entre la clasificación y el motor aplicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zhnivo/page-type-classifier
- Proyecto Zhnivo: https://zhnivo.com/en/
- Wikipedia sobre Jev (AI model), mencionado en la búsqueda: https://en.wikipedia.org/wiki/Jev_(AI_model)
- Página del clasificador Jev de TypeSafe AI: https://jevtypesafeai.com/jev/classifier
