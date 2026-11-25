# tithies/card-scanner

## Resumen

Tithies card scanner es un sistema de visión por computador en formato ONNX para el reconocimiento de cartas de Magic: The Gathering directamente en el navegador. Lo desarrolla el autor de Tithies, una extensión de navegador gratuita para gestionar colecciones de Magic, y resuelve un problema muy concreto: localizar las cartas en una foto y asignarles su edición y número de coleccionista sin enviar la imagen a ningún servidor. El paquete incluye dos redes neuronales (un detector y un reconocedor) más un índice vectorial de todas las impresiones de cartas publicadas por Scryfall.

La arquitectura combina un detector ResNet-18 con una pequeña pirámide de características para localizar las cuatro esquinas de cada carta (entrada de 768 × 768 píxeles) y un reconocedor derivado de DINOv2-small de Meta, afinado para extraer un vector de cada carta aplanada (entrada de 224 × 224, salida `pooler_output`). El índice, generado con el propio reconocedor, permite la búsqueda por similitud sobre las 104.896 imágenes de cartas físicas de la versión v2.

El modelo es relevante para desarrolladores que necesitan reconocimiento visual de objetos especializados con inferencia local y sin dependencias de API: el repositorio ocupa 0,2 GB, se distribuye bajo licencia Apache-2.0 y está pensado para ejecutarse con ONNX Runtime en el navegador. Sus métricas declaradas en fotos de prueba son del 99,5 % de cartas detectadas, 98,0 % de cartas identificadas correctamente y 76,4 % de acierto en la impresión exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos: detector ResNet-18 con pirámide de características + reconocedor DINOv2-small afinado (ViT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (reconoce cartas en cualquier idioma presente en el índice de Scryfall) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`card-detector.onnx`, `card-recognizer.onnx`) + índice binario (`index-*.bin`) y metadatos JSON comprimidos (`prints-*.json.gz`) |

## Arquitectura y entrenamiento

El sistema se compone de dos etapas. El detector es una ResNet-18 inicializada con pesos ImageNet de torchvision (licencia BSD-3-Clause) a la que se añade una pequeña pirámide de características para la regresión de las cuatro esquinas de cada carta; trabaja sobre imágenes de 768 × 768 píxeles. El reconocedor parte de DINOv2-small de Meta (Apache-2.0), un transformer de visión auto-supervisado, y se afina para producir un embedding por carta a partir de una imagen aplanada de 224 × 224 píxeles, usando la salida `pooler_output`. La búsqueda se hace por similitud vectorial contra el índice de impresiones.

Los datos de entrenamiento consisten en escenas sintéticas generadas a partir de imágenes de cartas y fotografías de las cartas del propio autor. La versión actual (v2) se ha construido con 104.896 imágenes de cartas físicas y un índice generado con datos de Scryfall del 24 de noviembre de 2026. El índice contiene, por cada vector, el identificador de Scryfall, la cara, el nombre, la edición, el número de coleccionista y el idioma. No se documentan detalles sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Detección de cartas en fotografías: localiza las cuatro esquinas de cada carta presente en una imagen de 768 × 768 píxeles.
- Extracción de embeddings visuales: genera un vector por carta aplanada (224 × 224) mediante `pooler_output` del reconocedor.
- Búsqueda por similitud sobre un índice de 104.896 impresiones de cartas de Magic.
- Identificación de la impresión exacta: devuelve id de Scryfall, cara, nombre, edición, número de coleccionista e idioma.
- Inferencia local en el navegador mediante ONNX Runtime, sin envío de imágenes a servidores.
- Soporte multilingüe de cartas en la medida en que el índice de Scryfall incluye impresiones en distintos idiomas.
- No soporta tool calling, agentes, generación de texto, código, matemáticas, audio ni razonamiento multi-paso; es un modelo puramente de visión y recuperación de imágenes.

## Casos de uso

- Digitalización de colecciones personales: el usuario fotografía un lote de cartas y el sistema detecta cada una y la asigna a su impresión concreta, permitiendo inventariar la colección sin teclear nombres ni números.
- Extensión de navegador para gestión de colecciones: integración directa en Tithies para reconocer cartas desde la cámara o desde una imagen subida, ejecutando todo el pipeline en el cliente con ONNX Runtime.
- Verificación de compraventa de cartas: comparar una foto de una carta recibida con el índice para confirmar que la edición y el número de coleccionista coinciden con lo anunciado.
- Catalogación de lotes en tiendas o mercadillos: procesar fotografías de montones de cartas y obtener una lista de impresiones para valoración o inventario.
- Aplicaciones de trading y coleccionismo: construir funciones de búsqueda visual ("encuentra esta carta") sobre el índice de Scryfall sin depender de servicios externos.
- Herramientas educativas o de demostración de visión por computador: ejemplo completo de pipeline detección + embedding + búsqueda vectorial en el navegador con modelos ONNX pequeños.
- Aplicaciones con requisitos de privacidad: al no salir las imágenes del dispositivo, es adecuado para entornos donde no se permite enviar fotos a la nube.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre las fotos de prueba, evaluados contra todas las impresiones del índice:

| Metrica | Resultado |
|---|---|
| Cartas detectadas | 99,5 % |
| Cartas identificadas correctamente | 98,0 % |
| Acierto en la impresión exacta | 76,4 % |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo de visión especializado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 0,2 GB, por lo que ambos modelos ONNX caben holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) acelera la inferencia, pero el diseño está pensado para el navegador.
- Cabe en cualquier GPU consumer y en dispositivos sin GPU, al estar orientado a inferencia ONNX en el cliente.
- Opciones de despliegue: ONNX Runtime (Web, CPU o GPU), integración en extensiones de navegador; no se documentan despliegues con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tithies card scanner | Detector + reconocedor de cartas MTG | no disponible | no aplica | Apache-2.0 | Hugging Face (ONNX) |
| DINOv2-small (Meta) | Extractor de características visuales genérico | ~22 M (ViT-small) | no aplica | Apache-2.0 | Hugging Face |
| ResNet-18 (torchvision) | Clasificador de imágenes genérico | ~11,7 M | no aplica | BSD-3-Clause | torchvision |

La comparación con modelos de lenguaje no es aplicable. Frente a DINOv2-small genérico, este modelo añade el afinado específico para cartas y el detector de esquinas; frente a ResNet-18, incorpora la pirámide de características para localización. No se dispone de comparativas con otros sistemas de reconocimiento de cartas de Magic en la información proporcionada.

## Limitaciones y advertencias

- El acierto en la impresión exacta es del 76,4 %, inferior al 98,0 % de identificación de la carta; puede confundir ediciones o números de coleccionista de una misma carta.
- El rendimiento se ha medido sobre fotos de prueba del propio autor; puede degradarse con iluminación deficiente, reflejos, cartas fundas o ángulos extremos.
- El índice depende de los datos de Scryfall y de la versión del reconocedor; mezclar versiones de índice y modelo puede invalidar los resultados.
- El modelo no genera texto ni razona; no debe usarse para tareas fuera del reconocimiento visual de cartas.
- Uso comercial: los pesos son Apache-2.0, pero el contenido de las cartas, nombres e imágenes pertenece a Wizards of the Coast y el proyecto es Fan Content no oficial; debe respetarse la Fan Content Policy.
- El índice se construye con imágenes alojadas por Scryfall bajo sus directrices de API (gratuitas para software de Magic); no está producido ni respaldado por Scryfall.
- No se documentan sesgos específicos, pero el entrenamiento con cartas del autor y escenas sintéticas puede no representar toda la variedad de condiciones reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tithies/card-scanner
- Proyecto Tithies: https://tithies.github.io/
- DINOv2-small (Meta): https://huggingface.co/facebook/dinov2-small
- Scryfall: https://scryfall.com
- Directrices de API de Scryfall: no disponible en la información proporcionada
- Paper de DINOv2: no disponible en la información proporcionada
