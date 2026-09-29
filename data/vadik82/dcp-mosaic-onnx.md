# vadik82/dcp-mosaic-onnx

## Resumen

`vadik82/dcp-mosaic-onnx` es una conversión a formato ONNX de la red neuronal de inpainting de mosaico de DeepCreamPy v2 beta, un modelo originalmente distribuido como checkpoint de TensorFlow. El repositorio lo publica el usuario vadik82 y su función es servir como artefacto de interoperabilidad para la herramienta `mangosh`, que lo descarga y lo utiliza en su etapa de posprocesado `decensor` bajo la clave de registro `dcp-mosaic`. No se trata, por tanto, de un modelo nuevo entrenado desde cero, sino de una reempaquetación de pesos preexistentes en un grafo ONNX ejecutable.

El modelo resuelve una tarea muy concreta de visión por computador: la reconstrucción de regiones enmascaradas en recortes de imagen de 256×256 píxeles. Su contrato de entrada es explícito (un tensor `1×256×256×3` en el rango `[-1,1]` más una máscara `input_mask` donde 1 significa conservar y 0 significa reconstruir) y su salida es un tensor `output_image` también en `[-1,1]`. Esa formulación corresponde al clásico problema de inpainting condicionado por máscara binaria, aplicado aquí al dominio de la ilustración manga y anime.

Su relevancia actual es limitada y muy específica: se publicó el 28 de septiembre de 2026, acumula 0 descargas y 0 «likes», y el tamaño del repositorio figura como 0.0 GB. La model card advierte además de que la release original de DeepCreamPy no incluye licencia explícita y de que los pesos pertenecen a sus autores originales, quedando este espejo justificado únicamente para uso personal e interoperabilidad con las herramientas de conversión. No se dispone de información sobre arquitectura interna, número de parámetros, idiomas ni pipeline.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Red de inpainting condicionada por máscara; el grafo original es un checkpoint de TensorFlow de DeepCreamPy v2 beta convertido a ONNX. No se detalla topología interna. |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No aplica. Modelo de visión; la entrada está fijada a recortes de 1×256×256×3 píxeles. |
| Tipos de cuantizacion | No disponible. Se distribuye como grafo ONNX `decensor_mosaic.onnx`; la model card no menciona variantes cuantizadas. |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | `other`. La release upstream de DeepCreamPy no declara licencia explícita; los pesos son propiedad de los autores originales y este espejo se publica para interoperabilidad y uso personal. |
| Formato de pesos | ONNX (`decensor_mosaic.onnx`), convertido desde checkpoint de TensorFlow mediante `tools/convert-dcp-onnx.py` de mangosh |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Identificador | vadik82/dcp-mosaic-onnx |
| Autor | vadik82 |
| Fecha de creacion | 2026-09-28 |
| Ultima actualizacion | 2026-09-28 |
| Descargas | 0 |
| Likes | 0 |
| Tamano del repositorio | 0.0 GB |
| Pipeline declarado | No disponible |
| Etiquetas | onnx, manga, anime, decensor, inpainting |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de la red. Lo único documentado es el contrato de ejecución del grafo ONNX: entrada de imagen `1×256×256×3` normalizada a `[-1,1]`, entrada adicional `input_mask` con valores 1 (conservar) y 0 (reconstruir), y salida `output_image` en `[-1,1]`. Este esquema es el de una red de imagen a imagen totalmente convolucional que predice píxeles en las zonas enmascaradas a partir del contexto circundante. No se especifican número de capas, canales, tipo de bloques (convolucionales, residuales, atención) ni mecanismo de normalización.

Respecto al entrenamiento, el modelo procede del checkpoint «09-11-2019 DCPv2 model» incluido en la release DeepCreamPy v2.2.0-beta. No se aportan datos sobre volumen de tokens o imágenes, composición del dataset, resolución de entrenamiento, función de pérdida ni si hubo fases de ajuste fino con preferencias humanas (RLHF/DPO), algo poco habitual en modelos de visión de esta naturaleza. La contribución de este repositorio es exclusivamente la conversión de formato: el script `tools/convert-dcp-onnx.py` del proyecto mangosh transforma el checkpoint de TensorFlow en un grafo ONNX compatible con el runtime de despliegue. No se documenta ninguna innovación técnica adicional, ni decodificación especulativa, ni mecanismos de atención lineal.

## Capacidades

- Inpainting condicionado por máscara: reconstruye las regiones marcadas con 0 en `input_mask` a partir del contenido visible marcado con 1.
- Procesamiento de recortes de imagen de 256×256 píxeles en color (3 canales), con entrada normalizada en `[-1,1]`.
- Generación de una imagen de salida completa (`output_image`) en el mismo rango `[-1,1]` y con las mismas dimensiones que la entrada.
- Aplicación en el dominio de ilustración manga y anime, según indican las etiquetas del repositorio (`manga`, `anime`) y el propósito declarado de la red.
- Integración con la cadena de herramientas mangosh: descarga automática mediante `mangosh models download` y ejecución en la etapa `decensor` con la clave de registro `dcp-mosaic`.
- Ejecución mediante runtime ONNX, lo que habilita despliegue en CPU y en GPU sin depender de TensorFlow.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, modo de pensamiento, visión general, audio ni procesamiento de lenguaje natural. No es un modelo multimodal ni conversacional.

## Casos de uso

- Restauración de manga escaneado: aplicar el modelo sobre recortes de 256×256 donde se haya detectado una región enmascarada (manchas, tramas perdidas o zonas cubiertas) y recomponer el trazo y la trama a partir del contexto. El recorte fijo de 256×256 obliga a trocear la página y recomponer los parches con solapamiento.
- Posprocesado dentro del pipeline de mangosh: la etapa `decensor` descarga `decensor_mosaic.onnx` a `assets/model/dcp-mosaic/` y lo aplica de forma estandarizada, por lo que el caso de uso principal es la ejecución desatendida dentro de esa herramienta.
- Procesamiento por lotes en servidor sin GPU: al ser un grafo ONNX de propósito específico sobre entradas de 256×256, es candidato a ejecutarse con ONNX Runtime en CPU para colas de imágenes, siempre que el recorte se genere previamente.
- Investigación en inpainting con máscara binaria: sirve como referencia reproducible de una red de inpainting de 2019 para comparar frente a métodos más recientes (por ejemplo, enfoques basados en difusión o en transformers de visión) manteniendo fijo el contrato de entrada y máscara.
- Preprocesado de datasets de visión: regenerar regiones enmascaradas en corpus de ilustración para tareas de aumento de datos o para eliminar artefactos antes de entrenar otros modelos.
- Integración en herramientas de edición o visores de cómic: el modelo puede actuar como operación «rellenar selección» cuando el usuario define una máscara binaria sobre una región concreta de la viñeta.
- Automatización en CI/CD de assets gráficos: al aceptar entradas de tamaño fijo y máscara explícita, encaja en un paso determinista de un pipeline que valide y restaure ilustraciones de forma reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (PSNR, SSIM, LPIPS, FID) ni comparaciones con otras redes de inpainting, y el repositorio no aporta ejemplos de salida ni scripts de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El número de parámetros no se ha publicado, por lo que no puede calcularse el consumo de memoria de pesos.
- Memoria de activaciones: acotada por el propio contrato del modelo, que fija la entrada a recortes de 256×256×3 píxeles, lo que limita el pico de memoria en inferencia en comparación con modelos de imagen de mayor resolución.
- GPU recomendadas: no disponibles. Al ser un modelo de visión de tamaño fijo y presumiblemente reducido, cualquier GPU con soporte de ONNX Runtime o de TensorRT podría ejecutarlo, pero no hay datos publicados que permitan recomendar modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada por falta de datos de parámetros y de memoria. El tamaño de entrada sugiere que no debería ser un factor limitante por sí mismo.
- Ejecución en CPU: viable en principio mediante ONNX Runtime, ya que el formato ONNX permite ejecución sin GPU. No hay cifras de latencia publicadas.
- Opciones de despliegue: ONNX Runtime como opción directa; también cabría exportar el grafo a otros runtimes compatibles con ONNX. La herramienta de referencia documentada es mangosh (`mangosh models download`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo de visión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| vadik82/dcp-mosaic-onnx | ONNX | 1×256×256×3 + máscara binaria | `other` (sin licencia explícita upstream) | HuggingFace, 0 descargas | Conversión de DeepCreamPy v2 beta para mangosh |
| DeepCreamPy v2.2.0-beta (upstream) | Checkpoint TensorFlow | No detallado en la información disponible | Sin licencia explícita | GitHub del proyecto Deepshift | Origen de los pesos; requiere TensorFlow para su ejecución |
| Otras redes de inpainting (por ejemplo, familia LaMa o MAT) | safetensors / PyTorch / ONNX según distribución | Variable, normalmente máscara + imagen | Variable según modelo | HuggingFace, GitHub | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de parámetros, contexto ni métricas de rendimiento de las alternativas en la información suministrada, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Licencia ambigua: la release upstream de DeepCreamPy no declara licencia explícita. Los pesos pertenecen a los autores originales y la model card restringe el espejo a interoperabilidad y uso personal. El uso comercial no está autorizado de forma clara y debería verificarse con los titulares antes de cualquier explotación.
- Naturaleza del modelo: la finalidad declarada es la eliminación de mosaico y censura en ilustración manga y anime. Esto puede implicar restricciones legales o de política de uso según la jurisdicción y la plataforma, además de consideraciones éticas sobre el tratamiento de contenido original de terceros.
- Entrada rígida: el modelo solo acepta recortes de 256×256 píxeles. Cualquier imagen de otro tamaño debe trocearse y recomponerse, lo que puede producir costuras visibles en las fronteras de los parches.
- Sin información de arquitectura ni de parámetros: no es posible estimar coste computacional, memoria ni calidad esperada sin pruebas empíricas.
- Riesgo de resultados inconsistentes: al ser una red de inpainting de 2019, es previsible que genere texturas borrosas o incoherentes con la trama original, aunque no hay métricas publicadas que lo confirmen o cuantifiquen. Este punto se señala como precaución, no como resultado medido.
- Repositorio sin actividad: 0 descargas, 0 «likes» y un tamaño declarado de 0.0 GB, lo que sugiere ausencia de validación por parte de la comunidad y posible falta del artefacto en el momento de la consulta. Conviene verificar la presencia real de `decensor_mosaic.onnx` antes de integrarlo.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje y no procesa instrucciones, por lo que no cabe esperar razonamiento, tool calling ni generación textual.
- Idiomas no aplicables: la ficha de HuggingFace no declara idiomas, coherente con un modelo puramente visual.
- Fechas de creación y actualización (2026-09-28) muy próximas entre sí y sin historial de versiones, lo que limita la trazabilidad de cambios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vadik82/dcp-mosaic-onnx
- Repositorio upstream de DeepCreamPy: https://github.com/Deepshift/DeepCreamPy
- Herramienta mangosh (referenciada en la model card como origen del script de conversión `tools/convert-dcp-onnx.py` y del comando `mangosh models download`): URL no disponible en la información proporcionada.
