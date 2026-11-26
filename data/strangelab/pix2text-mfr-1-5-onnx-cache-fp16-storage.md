# strangelab/pix2text-mfr-1.5-onnx-cache-fp16-storage

## Resumen

Pix2Text MFR 1.5 ONNX Cache FP16 Storage es una exportación optimizada del modelo de reconocimiento de fórmulas matemáticas (MFR) de Pix2Text, desarrollado originalmente por BreezeDeus y reempaquetado por Strange Lab para inferencia en CPU con ONNX Runtime. El modelo transcribe imágenes de fórmulas matemáticas a código LaTeX y se integra dentro del ecosistema Pix2Text, que combina detección de layout, OCR de texto y reconocimiento de fórmulas en un único pipeline.

La contribución principal de este paquete es la reducción del tamaño de descarga: 76,22 MB frente a los 119,83 MB del paquete FP32 equivalente, gracias a que los pesos del codificador se almacenan en FP16 y se convierten a FP32 en tiempo de inferencia. El decodificador utiliza caché (cached decoder) para acelerar la generación autoregresiva, lo que permite ejecutar el modelo en CPU de forma práctica sin necesidad de GPU.

Es relevante para desarrolladores que necesitan convertir expresiones matemáticas presentes en imágenes (apuntes, PDFs escaneados, capturas) a LaTeX editable en entornos sin acelerador hardware, como portátiles, servidores modestos o dispositivos Apple Silicon. La licencia MIT facilita su uso comercial. El modelo base es `breezedeus/pix2text-mfr-1.5`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (transformer) exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos de codificador almacenados en FP16, convertidos a FP32 en inferencia; decodificador con caché |
| Idiomas soportados | no disponible (la salida es LaTeX, independiente del idioma natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo base `breezedeus/pix2text-mfr-1.5` es un modelo vision-encoder-decoder: un codificador visual procesa la imagen de la fórmula y un decodificador autoregresivo genera la secuencia de tokens LaTeX correspondiente. Strange Lab ha exportado esta arquitectura a formato ONNX e introducido dos optimizaciones de despliegue: almacenamiento de los pesos del codificador en FP16 (conversión a FP32 durante la inferencia) y uso de un decodificador con caché que reutiliza los estados de atención entre pasos de generación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo está pensado exclusivamente para reconocimiento de fórmulas matemáticas, no para OCR de texto general ni para generación de lenguaje natural.

## Capacidades

- Reconocimiento de fórmulas matemáticas en imágenes y transcripción a LaTeX.
- Procesamiento de fórmulas manuscritas e impresas (el ejemplo oficial usa una fórmula escrita a mano).
- Integración en el pipeline completo de Pix2Text para páginas completas, incluyendo detección de layout y OCR de texto junto con la extracción de fórmulas.
- Inferencia en CPU mediante ONNX Runtime (`CPUExecutionProvider`).
- Ejecución con decodificador en caché para reducir latencia en generación autoregresiva.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo multimodal general: no describe imágenes ni responde preguntas sobre ellas.
- Capacidades multilingües: no disponibles; la salida es LaTeX, no texto en lenguaje natural.

## Casos de uso

- Digitalización de apuntes científicos: convertir fotografías de fórmulas escritas a mano en LaTeX editable para incluirlas en documentos o bases de conocimiento, usando el modelo en CPU de un portátil sin GPU.
- Procesamiento de PDFs académicos: extraer fórmulas de artículos escaneados dentro del pipeline Pix2Text y generar Markdown o LaTeX con los assets extraídos, como se validó en las cuatro páginas de PDF de la comparativa del autor.
- Generación de material docente: transformar capturas de libros de texto o pizarras en ecuaciones LaTeX listas para insertar en presentaciones o plataformas de e-learning.
- Indexación y búsqueda de contenido matemático: convertir fórmulas de repositorios de imágenes a LaTeX para permitir búsqueda textual sobre el contenido matemático.
- Herramientas de accesibilidad: transcribir fórmulas de imágenes a LaTeX para que lectores de pantalla y sistemas de síntesis puedan interpretarlas.
- Despliegue en entornos sin GPU: servir un endpoint de OCR de fórmulas en un servidor modesto o en local con ONNX Runtime, aprovechando el tamaño reducido de descarga (76,22 MB) y la ejecución en CPU.
- Integración en editores de notas: plugin que permita al usuario pegar una captura de una ecuación y obtener el LaTeX correspondiente de forma local y sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un modelo de OCR de fórmulas. El autor proporciona una comparación de fidelidad y latencia frente al paquete FP32 con caché:

| Metrica | Paquete FP16 storage | Paquete FP32 cache |
|---|---|---|
| Tamano de descarga | 76,22 MB | 119,83 MB |
| Coincidencia de LaTeX en 12 ejemplos Pix2Text | Identica | Referencia |
| Coincidencia en 32 imagenes UniMER-Test | Identica | Referencia |
| Coincidencia en 4 paginas PDF (94 formulas, Markdown y assets) | Identica | Referencia |
| Tiempo mediano por pagina (warm run, Apple M4 CPU) | 9,26 s | 9,49 s |

Estas pruebas miden únicamente la concordancia con el paquete FP32 con caché. El consumo de memoria en tiempo de ejecución, el comportamiento en GPU y la precisión sobre otros documentos no han sido medidos según la model card.

## Requisitos de hardware

- Inferencia en CPU mediante ONNX Runtime con `CPUExecutionProvider`; probado en Apple M4 con Python 3.12 y Pix2Text 1.1.7.
- VRAM: no aplica para el modo CPU; no se han publicado requisitos de VRAM para GPU.
- GPU recomendadas: no disponibles; el paquete está orientado a CPU y el comportamiento en GPU no ha sido medido.
- Cabe en cualquier equipo con CPU moderna; el tamaño de descarga es de 76,22 MB y el repo ocupa 0,1 GB.
- Opciones de despliegue: Pix2Text 1.1.7 con ONNX Runtime 1.32.0, `optimum` 1.27.0 y `transformers` 4.52.3; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: mediana de 9,26 s por página en Apple M4 CPU en ejecuciones en caliente (warm runs) sobre el conjunto de prueba del autor. No se dispone de datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| strangelab/pix2text-mfr-1.5-onnx-cache-fp16-storage | no disponible | no disponible | Formula a LaTeX | MIT | ONNX |
| strangelab/pix2text-mfr-1.5-onnx-cache (FP32) | no disponible | no disponible | Formula a LaTeX | MIT | ONNX |
| breezedeus/pix2text-mfr-1.5 (base) | no disponible | no disponible | Formula a LaTeX | MIT | no disponible |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye otros modelos de reconocimiento de fórmulas (como LaTeX-OCR o Nougat) con datos verificables. Las diferencias entre las variantes son de empaquetado: el paquete FP16 storage reduce el tamaño de descarga un 36 % respecto al FP32 con caché, manteniendo salidas idénticas en las pruebas del autor.

## Limitaciones y advertencias

- El modelo solo reconoce fórmulas matemáticas; no es un OCR de texto general ni un modelo de lenguaje.
- La validación de precisión se limita a 12 ejemplos de Pix2Text, 32 imágenes de UniMER-Test y 4 páginas de PDF; la precisión sobre otros documentos no ha sido medida.
- El consumo de memoria en tiempo de ejecución y el comportamiento en GPU no están documentados.
- No se dispone de información sobre sesgos, tasas de alucinación o errores sistemáticos en la transcripción LaTeX.
- No se han publicado datos sobre idiomas soportados ni sobre el dataset de entrenamiento.
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones del modelo base `breezedeus/pix2text-mfr-1.5`.
- El paquete depende de versiones concretas de Pix2Text, ONNX Runtime, optimum y transformers; cambios de versión pueden requerir ajustes.
- Pix2Text descarga otros modelos OCR por separado en el primer uso, lo que afecta al despliegue en entornos aislados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/strangelab/pix2text-mfr-1.5-onnx-cache-fp16-storage
- Modelo base: https://huggingface.co/breezedeus/pix2text-mfr-1.5/tree/1cef9f0bdcd6a4c63df7de1311fb0894593340cc
- Paquete FP32 con caché: https://huggingface.co/strangelab/pix2text-mfr-1.5-onnx-cache
- Repositorio Pix2Text: https://github.com/breezedeus/Pix2Text
- Dataset UniMER: https://huggingface.co/datasets/wanderkid/UniMER_Dataset/tree/2343ddd963290469da36ca83e3a56c66e068add9
- Ejemplo de fórmula manuscrita: https://raw.githubusercontent.com/breezedeus/Pix2Text/f52e671247c14a29aa59b44e99849e00aee984cd/docs/examples/hw-formula1.png
