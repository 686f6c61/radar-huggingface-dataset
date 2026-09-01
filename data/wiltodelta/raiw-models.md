# wiltodelta/raiw-models

## Resumen

El modelo `wiltodelta/raiw-models` es un clasificador de imágenes fotográficas desarrollado por Victor Kuznetsov (wiltodelta) que distingue entre fotografías generadas por inteligencia artificial y fotografías tomadas con cámara, y además atribuye el proveedor de generación cuando la imagen es clasificada como IA de forma definitiva. Está construido sobre el backbone `openai/clip-vit-large-patch14` (CLIP ViT-Large/Patch14) y se distribuye bajo licencia Apache-2.0. El repositorio ocupa 1,7 GB y está pensado para su uso dentro del paquete Python `remove-ai-watermarks`, aunque puede cargarse directamente con la librería Transformers.

El modelo resuelve un problema concreto: determinar si una fotografía (no otro tipo de imagen como recibos, interfaces o arte digital) ha sido generada por IA cuando ya se han eliminado los metadatos. Para ello emplea una arquitectura de dos cabezas: la primera (Modelo 1) decide si la imagen es "definitivamente IA", "posiblemente IA" o "humana" usando embeddings de CLIP-L afinados; la segunda (Modelo 2) solo se activa cuando la primera es concluyente y atribuye el proveedor (OpenAI, Google, Muse Image o TC260) mediante características residuales de 124 dimensiones. Esta separación evita falsos positivos en la atribución y mantiene una tasa de falsos positivos baja para fotografías de cámara.

La relevancia actual del modelo radica en la creciente necesidad de verificar la procedencia de imágenes en un contexto donde las marcas de agua visibles e invisibles pueden eliminarse. No es un detector universal de contenido generado por IA, sino una herramienta especializada en el dominio fotográfico, con un enfoque pragmático y documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-Large/Patch14 (backbone) con dos cabezas: ridge + MLP (Modelo 1) y MLP focal one-vs-rest (Modelo 2) |
| Parametros totales | No disponible (el backbone CLIP ViT-Large tiene aproximadamente 428M, pero no se indica el total con las cabezas) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en formato safetensors, pero no se documentan cuantizaciones) |
| Idiomas soportados | en (etiqueta del modelo, aunque es un modelo de visión; no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (inferido del tamaño del repo y del uso con Transformers; no se especifica explícitamente) |

## Arquitectura y entrenamiento

El modelo se compone de dos módulos independientes pero coordinados. El Modelo 1 utiliza el backbone CLIP ViT-Large/Patch14 con un fine-tune ligero que afecta a los dos últimos bloques de visión, la proyección visual y el post-layernorm. El preprocesado consiste en un letterbox a 224 píxeles, relleno con el color RGB (123, 117, 104), interpolación bicúbica y normalización L2 de los embeddings de imagen. Sobre estos vectores de 768 dimensiones se entrena una regresión ridge (linear probe) con un umbral de 0,3056 (correspondiente al percentil 1% de falsos positivos en el conjunto de validación Open Images) y un MLP de arquitectura 768-512-128-1 con dropout de 0,3 y 0,1, cuyo umbral es 5,9586 (percentil 1,67% del conjunto de desarrollo). La decisión "DEFINITIVAMENTE IA" se toma solo cuando ambos clasificadores coinciden; si solo uno de ellos se activa, la etiqueta es "unknown".

El Modelo 2 recibe un vector de 124 características residuales extraídas de parches de 256 píxeles (energía de bandas FFT, contraste de peine, autocovarianza). Se entrena un MLP focal one-vs-rest de arquitectura 124-64-1 para cada clase: `openai`, `google`, `tc260`, `meta_muse_image` y `no_ai`. La decisión final exige que una clase supere a `no_ai` por un margen de 0,30 y luego se aplica argmax entre las que pasan el filtro. Si la extracción de características falla (imagen menor de 256 píxeles), el modelo se abstiene.

El entrenamiento se realizó en CPU, con dos ejecuciones consecutivas que produjeron resultados byte-idénticos. El catálogo de entrenamiento incluye 32.690 archivos identificados por su hash sha256, de los cuales se obtuvieron 26.573 embeddings CLIP-L. Las semillas utilizadas son 20260940 (detector), 20260956 (proveedor) y 20260821 (muestreo de OpenAI/Google). El MLP se entrenó durante 40 épocas con ancho 512, y el proveedor focal con gamma 2,0 y 40 épocas. La celda de UI privada se sustituyó por 150 capturas de pantalla de Flickr con licencias Creative Commons (CC BY 2.0, CC BY-NC 2.0, CC BY-SA 2.0, CC BY-NC-SA 2.0, CC BY-NC-ND 2.0, CC BY-ND 2.0, CC0). El catálogo de píxeles no se publica en el Hub.

## Capacidades

- Clasificación de fotografías en tres categorías: `human` (cámara), `ai` (generada por IA) y `unknown` (posible IA o extracción de características fallida).
- Atribución de proveedor de generación solo cuando la imagen es clasificada como IA de forma definitiva: `openai`, `google`, `muse-image` (Muse Image) y `tc260` (estándar chino de etiquetado AIGC, que agrupa múltiples productores como Doubao, Jimeng, Qwen, Kling).
- Distinción entre el renderizador real y el front-end: por ejemplo, imágenes de Bing Image Creator firmadas por Microsoft se clasifican como `openai` si el renderizador es OpenAI.
- Capacidad de abstención: si el Modelo 1 no es concluyente, no se ejecuta el Modelo 2, evitando atribuciones erróneas.
- Funciona exclusivamente con imágenes fotográficas; no es aplicable a recibos, interfaces de usuario, gráficos o ilustraciones.
- Integración con el paquete Python `remove-ai-watermarks` mediante el extra `classify`; el comando `identify` no utiliza este modelo.

## Casos de uso

- Verificación de procedencia en plataformas de stock fotográfico: un usuario sube una imagen y el sistema necesita determinar si fue generada por IA para aplicar políticas de licencia. El modelo puede ejecutarse tras eliminar metadatos y devolver una etiqueta `ai` o `human` con una tasa de falsos positivos controlada (1% en Open Images).
- Moderación de contenido en redes sociales: detectar si una fotografía publicada ha sido generada por IA para etiquetarla automáticamente, siempre que la imagen sea un fotograma realista y no un meme, captura de pantalla o ilustración.
- Auditoría de campañas publicitarias: una agencia necesita verificar si las imágenes de una campaña fueron creadas con IA para cumplir requisitos de transparencia. El modelo puede atribuir el proveedor (OpenAI, Google, etc.) cuando la detección es definitiva.
- Análisis forense de imágenes sin metadatos: cuando se han eliminado C2PA, EXIF o marcas de agua, el modelo ofrece una "opinión de píxeles" basada en características residuales, útil como indicio (no como prueba legal).
- Investigación académica sobre clasificadores de imágenes generadas: el modelo sirve como referencia para comparar enfoques basados en embeddings CLIP frente a características residuales, con documentación detallada de umbrales y metodología.
- Control de calidad en pipelines de generación de imágenes: un servicio que produce imágenes con IA puede usar el modelo para verificar que sus propias salidas se clasifican correctamente como `ai` y con el proveedor esperado, ayudando a detectar fugas o errores de renderizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la informacion disponible. La model card menciona dos métricas concretas:

- AUC 0,989 para la distinción entre OpenAI y Gemini en el banco de características residuales de 124 dimensiones (investigación interna).
- Tasa de falsos positivos del 1% en el conjunto Open Images para el umbral del ridge del Modelo 1, y 1,67% en el conjunto de desarrollo para el umbral del MLP.

No se proporcionan comparaciones con otros modelos ni resultados en benchmarks estándar como MMLU o HumanEval (no aplicables a un modelo de visión). No se dispone de datos de latencia ni throughput.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la documentación proporcionada.
- El tamaño del repositorio es de 1,7 GB, lo que sugiere que los pesos del modelo (backbone CLIP ViT-Large más cabezas) ocupan aproximadamente ese espacio en formato safetensors.
- Dado que el backbone es CLIP ViT-Large/Patch14 (alrededor de 428 millones de parámetros), se puede inferir que la inferencia requiere al menos 4-6 GB de VRAM en FP32, o menos con cuantización, aunque no se documentan versiones cuantizadas.
- El entrenamiento se realizó en CPU, lo que indica que la inferencia también es posible en CPU, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo de Transformers, puede cargarse con la librería `transformers` y ejecutarse en frameworks como PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama (orientados a modelos de lenguaje).
- El paquete `remove-ai-watermarks` proporciona una interfaz de línea de comandos y una demo en Hugging Face Spaces (`wiltodelta/remove-ai-watermarks`), aunque esa demo es una interfaz de eliminación de marcas de agua, no el clasificador en sí.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor menciona en la model card que el modelo no es un decodificador SynthID ni un detector universal de contenido generado por IA, pero no ofrece comparaciones cuantitativas con otras herramientas como SynthID, Hive AI o modelos de detección de imágenes generadas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para fotografías realistas. No funciona correctamente con recibos, interfaces de usuario, gráficos, ilustraciones o arte digital; la model card advierte explícitamente que estos dominios quedan fuera del alcance.
- No debe utilizarse para afirmar que un archivo está "limpio" o libre de contenido generado por IA. La ausencia de una etiqueta `ai` no garantiza que la imagen sea auténtica.
- No es una prueba legal de autoría. El autor indica que no debe usarse como test de autoría en contextos legales.
- El Modelo 2 solo debe ejecutarse cuando el Modelo 1 es concluyente; ejecutarlo sobre todas las imágenes puede producir atribuciones erróneas.
- La atribución de proveedor sigue al renderizador, no al front-end. Por ejemplo, imágenes de Bing Image Creator firmadas por Microsoft se clasifican como `openai`, y las de Designer firmadas por Google como `google`. Esto puede confundir a usuarios que esperan una atribución por marca.
- La clase `tc260` agrupa múltiples productores chinos (Doubao, Jimeng, Qwen, Kling, etc.), por lo que no identifica a un proveedor específico.
- El catálogo de entrenamiento no se publica, lo que limita la reproducibilidad y la auditoría externa.
- El modelo solo está etiquetado en inglés (`en`), aunque al ser un modelo de visión no procesa texto; la documentación y los nombres de clases están en inglés.
- El entrenamiento se realizó en CPU, lo que puede implicar limitaciones en la escala de datos o en la velocidad de experimentación, aunque no se detallan.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wiltodelta/raiw-models
- Paquete Python `remove-ai-watermarks` (GitHub): https://github.com/wiltodelta/remove-ai-watermarks
- Guía de clasificación de fotos: https://github.com/wiltodelta/remove-ai-watermarks/blob/main/docs/photo-classify.md
- Archivo de investigación sobre clasificadores de imágenes generadas: https://github.com/wiltodelta/remove-ai-watermarks/blob/main/docs/ai-generated-image-classifiers.md
- Demo Space (interfaz de eliminación de marcas de agua, no el clasificador): https://huggingface.co/spaces/wiltodelta/remove-ai-watermarks
- Perfil del autor en Hugging Face: https://huggingface.co/wiltodelta/models
