# Zhnivo/spread-classifier

## Resumen

Spread Classifier es un modelo de clasificación de imágenes desarrollado por Zhnivo, un proyecto sin ánimo de lucro dedicado a la preservación del patrimonio documental de Bielorrusia. El modelo resuelve una tarea muy concreta dentro de los pipelines de digitalización de archivos: decidir si un escaneo corresponde a una doble página (pliego) de un libro o registro encuadernado, o a una página o hoja suelta. Esta decisión permite cortar automáticamente los pliegos en dos páginas antes de las fases posteriores de análisis de maquetación y reconocimiento de texto (OCR/HTR).

Técnicamente se trata de una EfficientNet-B0 de torchvision con una cabeza de salida de un único logit, entrenada sobre varios miles de escaneos de libros impresos y manuscritos, registros y expedientes de archivo, mayoritariamente de los siglos XIX y XX. El modelo tiene 4.050.845 parámetros, recibe escaneos RGB con el lado mayor reescalado a 512 px y devuelve un logit que indica la probabilidad de que la imagen sea un pliego; el umbral recomendado es 4.5.

Su relevancia es práctica y acotada: no es un modelo generativo ni conversacional, sino un clasificador binario especializado que se integra como paso previo en pipelines de digitalización masiva. Es especialmente útil en proyectos de preservación documental donde el volumen de escaneos hace inviable la revisión manual de cada imagen para decidir si debe cortarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (torchvision) con cabeza de un único logit |
| Parámetros totales | 4.050.845 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 512×512) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, independiente del idioma del texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` e `inference.py` |

## Arquitectura y entrenamiento

El modelo es una EfficientNet-B0 de torchvision a la que se ha sustituido la cabeza de clasificación por una capa de salida de un único logit. La entrada es un escaneo RGB cuyo lado mayor se reescala a 512 px, se centra sobre un cuadrado de 512×512 con relleno gris (valor 128) y se normaliza con las medias y desviaciones de ImageNet. La salida es un logit que representa la evidencia de que la imagen sea un pliego de dos páginas.

El entrenamiento se realizó sobre varios miles de escaneos de libros impresos y manuscritos, registros y expedientes de archivo, mayoritariamente de los siglos XIX y XX, incluyendo tablas y formularios de gran tamaño. Los escaneos de validación provienen de libros distintos a los de entrenamiento, lo que indica una separación por documento para evitar fuga de información. No se especifican en la información disponible el número exacto de tokens (no aplica), la composición detallada del dataset ni si se emplearon técnicas de aumento de datos o ajuste fino adicional.

## Capacidades

- Clasificación binaria de imágenes de documentos: distingue entre pliego de dos páginas y página u hoja suelta.
- Diseñado específicamente para escaneos y fotografías de libros, registros y expedientes de archivo.
- Funciona con documentos impresos y manuscritos, incluyendo tablas y formularios grandes.
- Salida como logit continuo, lo que permite ajustar el umbral de decisión según la tolerancia a falsos cortes.
- Integrable como paso previo a pipelines de OCR/HTR y análisis de maquetación.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un clasificador de imagen puro.

## Casos de uso

- Digitalización masiva de archivos históricos: el modelo se ejecuta sobre cada escaneo para decidir si debe cortarse en dos páginas antes de pasarlo al OCR, reduciendo la revisión manual en lotes de miles de imágenes.
- Preservación de libros y registros de los siglos XIX y XX: permite separar automáticamente pliegos en escaneos de encuadernaciones que no se pueden abrir completamente, un caso frecuente en archivos con material delicado.
- Preprocesado en pipelines de HTR (reconocimiento de texto manuscrito): al cortar correctamente los pliegos se evita que el reconocedor procese dos páginas como una sola, mejorando la segmentación de líneas y la precisión del texto.
- Procesamiento de formularios y tablas grandes: el modelo está entrenado con tablas y formularios que ocupan páginas completas, lo que ayuda a distinguir un formulario desplegable de un pliego real.
- Control de calidad en proyectos de digitalización: al ajustar el umbral de logit se puede priorizar la sensibilidad (detectar más pliegos) o la precisión (evitar cortes falsos), según la fase del proyecto.
- Integración en herramientas de código abierto de gestión documental: al ser MIT y usar safetensors con un script de inferencia incluido, se puede incorporar en pipelines basados en Python con torch y torchvision sin dependencias propietarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 1 GB para el modelo en precisión completa (4,05 M de parámetros) más el buffer de entrada de 512×512; en la práctica cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en CPU para lotes pequeños, aunque para digitalización masiva se recomienda una GPU modesta (GTX 1650, RTX 3050 o superior).
- Cabe en GPU consumer: sí, en cualquier modelo actual, incluidas GPUs integradas con soporte CUDA o incluso en CPU.
- Opciones de despliegue: inferencia directa con PyTorch y torchvision usando el script `inference.py` incluido; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser una EfficientNet-B0 con entrada de 512×512, se espera un throughput alto en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de clasificación de pliegos de documentos en la información proporcionada. Como referencia arquitectónica, EfficientNet-B0 es la base del modelo, pero no se han encontrado alternativas específicas para esta tarea.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zhnivo/spread-classifier | 4.050.845 | no aplica (imagen 512×512) | Clasificación pliego/página | MIT | Hugging Face |
| Alternativas específicas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ámbito restringido: está diseñado para escaneos y fotos de libros, registros y expedientes de archivo; otras imágenes quedan fuera de su ámbito y no deben usarse con este modelo.
- Falsos positivos en hojas grandes dobladas o con pliegue central: las tablas anchas dobladas por la mitad son el caso más común de falso pliego, según el autor.
- El modelo solo indica si hay que cortar, no dónde: no proporciona la posición del pliegue ni la línea de corte.
- Umbral sensible: el umbral recomendado es logit > 4.5; bajarlo detecta más pliegos a costa de más cortes falsos, lo que exige calibrar según el corpus.
- Sin datos de sesgo: no se documentan sesgos conocidos, pero al estar entrenado con material mayoritariamente bielorruso de los siglos XIX y XX, su comportamiento en otros corpus y épocas no está validado.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en documentos atípicos.
- Licencia MIT: permite uso comercial sin restricciones; el autor agradece un enlace al proyecto zhnivo.com pero no lo exige.
- Para producción: conviene validar el umbral con una muestra del corpus propio y monitorizar los cortes falsos, especialmente en documentos con tablas o pliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zhnivo/spread-classifier
- Proyecto Zhnivo: https://zhnivo.com/en/
- Repositorio de referencia del clasificador Jev (resultado de búsqueda no relacionado con este modelo): https://jevtypesafeai.com/jev/classifier
