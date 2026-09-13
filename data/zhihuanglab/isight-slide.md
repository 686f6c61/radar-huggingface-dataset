# zhihuanglab/iSight-slide

## Resumen

iSight-slide es el modelo de nivel de imagen del sistema iSight, desarrollado por el laboratorio zhihuanglab (Zhi Huang, Penn Medicine) para la evaluación automatizada de imágenes de inmunohistoquímica (IHC) y de patrones de tinción proteica. Resuelve un problema concreto de la anatomía patológica: la lectura de un portaobjetos teñido es una tarea manual, subjetiva y dificil de estandarizar entre observadores. El modelo predice de forma simultánea cinco atributos de una imagen IHC: intensidad de tinción (4 clases), localización de la tinción (4 clases), cantidad de tinción (4 clases), tipo de tejido (58 clases) y malignidad (2 clases).

Tecnicamente es un modelo de aprendizaje de instancias múltiples (MIL) construido sobre un encoder de parches CLIP ViT-L/14-336. Cada parche de tejido de 336 px aporta sus 576 tokens ViT y un módulo de atención con compuerta puntua cada posición de token, aplicando softmax entre parches en esa misma posición; después se promedia sobre tokens. A esa representación se le añaden dos señales de condicionamiento (una rama de texto que codifica la consulta de tejido, diagnóstico o gen, y un embedding de 39 vías de tipo celular) y cinco cabezas lineales producen las predicciones. La versión publicada es `v3_all_tokens`.

El modelo se entrena sobre el conjunto HPA10M (`nirschl-lab/hpa10m`) y forma parte de una familia de tres checkpoints junto con iSight-cell e iSight-target. Es relevante ahora como pieza de código abierto para investigación en patología computacional, pero conviene tratarlo con cautela: el repositorio acumulaba 0 descargas y 0 likes en el momento de la consulta, la licencia figura como `unknown` y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MIL sobre parches con encoder CLIP ViT-L/14-336, atención con compuerta sobre todos los tokens (576 por parche), condicionamiento textual y de tipo celular, y cinco cabezas lineales. Versión `v3_all_tokens` |
| Parámetros totales | No disponible. La model card no publica el recuento; la base declarada es un encoder CLIP ViT-L/14-336 |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No aplica en el sentido de un LLM. La entrada es una imagen IHC troceada en parches de 336 px con máscara de tejido; cada parche aporta 576 tokens ViT cuya atención se calcula entre parches en cada posición |
| Tipos de cuantización | No disponible. Se distribuye un checkpoint `.pth` de PyTorch; no hay versiones cuantizadas publicadas |
| Idiomas soportados | No disponible. La rama de texto codifica consultas (tejido, diagnóstico, gen) y queda desactivada en inferencia por defecto |
| Licencia | `unknown` (no declarada en la model card ni en los tags del Hub) |
| Formato de pesos | PyTorch (`.pth`, `state dict` únicamente). No hay safetensors, GGUF, ONNX ni TensorRT. Requiere el código de `code/` para instanciar el modelo |

Otros datos del repositorio: tamaño total de 6,9 GB e incluye `config.json`, `checkpoints/iSight-slide.pth`, código de entrenamiento e inferencia y `requirements.txt`.

## Arquitectura y entrenamiento

El modelo sigue un esquema MIL de atención sobre parches. El encoder es CLIP ViT-L/14-336, aplicado a todos los parches de tejido de 336 px de una imagen. La innovación descrita en la model card es el pooling: en lugar de agregar por parche, cada una de las 576 posiciones de token se puntúa con un módulo de atención con compuerta y se normaliza con softmax entre parches en esa misma posición, de modo que el pooling es por token y no por parche; la representación final es la media sobre tokens. Sobre esa representación se inyectan dos señales de condicionamiento: una rama de texto que codifica una consulta (tejido, diagnóstico o gen), que se aplica con dropout durante el entrenamiento y se desactiva en inferencia, y un embedding de 39 vías de tipo celular. Cinco cabezas lineales generan las salidas de las cinco tareas.

El entrenamiento usa `train.py` con DDP y es reanudable. La configuración publicada emplea `batch_size = 1`, que es la configuración con la que se entrenó el checkpoint, y el programador de tasa de aprendizaje avanza por lote salvo que se defina `SCHEDULER_PER_EPOCH=1`. Los datos proceden del conjunto HPA10M (`nirschl-lab/hpa10m`), con metadatos de partición en formato feather, máscaras de tejido RLE e imágenes. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset, ni etapas de alineación tipo RLHF o DPO (no aplicables a un modelo discriminativo de visión).

## Capacidades

- Clasificación multi-tarea simultánea a nivel de imagen IHC: intensidad de tinción (negative, weak, moderate, strong), localización (none, cytoplasmic/membranous, nuclear, cytoplasmic/membranous,nuclear), cantidad (none, <25%, 25%-75%, >75%), tipo de tejido (58 clases humanas) y malignidad (normal, cancer).
- Condicionamiento por consulta textual: la rama de texto permite condicionar la representación con términos de tejido, diagnóstico o gen; en inferencia está desactivada por defecto según la model card.
- Condicionamiento por tipo celular: embedding de 39 vías que se suma a la representación agrupada.
- Extracción de representaciones: el vector agrupado (media sobre tokens) puede reutilizarse como característica para tareas posteriores.
- Procesamiento de imagen completa con múltiples parches: la atención se calcula entre parches, no de forma aislada por parche.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni uso como agente.
- No hay soporte multilingüe declarado ni capacidades de audio o vídeo.
- No es un modelo de propósito general: está especializado en imágenes de inmunohistoquímica.

## Casos de uso

- Triaje de portaobjetos en el laboratorio de anatomía patológica: el modelo clasifica intensidad, localización y cantidad de tinción de una imagen IHC, lo que permite ordenar la cola de revisión y dirigir la atención del patólogo a los casos con tinción dudosa o malignidad predicha.
- Control de calidad y armonización entre observadores: al producir etiquetas discretas de intensidad (negative a strong) y de porcentaje teñido, sirve como referencia objetiva para auditar la variabilidad interobservador dentro de un mismo laboratorio o entre centros.
- Detección de malignidad como primer filtro: la cabeza binaria normal/cancer permite descartar rápidamente imágenes sin sospecha en cribados de cohortes grandes antes de la lectura manual.
- Indexación de biobancos y cohortes de investigación: la predicción de 58 tipos de tejido permite etiquetar automáticamente colecciones de imágenes IHC para búsquedas y selección de subconjuntos.
- Extracción de características para modelos posteriores: la representación agrupada puede alimentar clasificadores downstream (supervivencia, respuesta a tratamiento) sin reentrenar el encoder, aprovechando que ya incorpora información de tinción y tejido.
- Cuantificación de expresión proteica en estudios con anticuerpos dirigidos: sobre el conjunto HPA10M, donde la tinción es sistemática por gen y tejido, el modelo puede usarse para generar anotaciones a escala de cohorte y priorizar validaciones experimentales.
- Preanotación asistida para patólogos: las cinco salidas se pueden mostrar como sugerencia editable, con la ventaja de que el modelo ya devuelve las cinco etiquetas en una sola pasada en lugar de requerir cinco modelos separados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de `zhihuanglab/iSight-slide` no incluye métricas (exactitud, F1, AUC) para ninguna de las cinco tareas, ni comparaciones con otros modelos, y los resultados de la búsqueda web realizada no contenían información relevante sobre el modelo.

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM ni GPU recomendadas en la model card.
- El repositorio ocupa 6,9 GB, pero no se declara la precisión de los pesos ni el contenido exacto del checkpoint, por lo que no es posible derivar el tamaño del modelo a partir del tamaño del repositorio.
- Estimación a partir de la arquitectura declarada (no confirmada por el autor): un encoder CLIP ViT-L/14-336 en fp32 ocupa del orden de 1,2 GB de pesos; en fp16, alrededor de 0,6 GB.
- La memoria de activaciones escala con el número de parches de la imagen, porque la atención se aplica entre parches para cada una de las 576 posiciones de token. Una imagen con muchas decenas o cientos de parches puede superar la VRAM de una GPU de consumo, por lo que conviene trocear la imagen o reducir el número de parches simultáneos.
- GPU recomendadas: no disponibles. Por el tipo de modelo (visión, ViT-L) es razonable esperar que funcione en GPU de consumo con suficiente VRAM si se controla el número de parches, pero esto no está verificado por el autor.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI. El despliegue previsto es PyTorch con el código del repositorio (`code/scripts/inference.py`) y entrenamiento con `code/train.py` en modo DDP.
- Dependencia de datos: la ejecución requiere definir variables de entorno con la raíz de datos (`ISIGHT_DATA_ROOT`), metadatos de partición (`ISIGHT_TRAIN_META`, `ISIGHT_TEST_META`), máscaras de tejido RLE (`ISIGHT_RLE_DIR`, `ISIGHT_RLE_INDEX`) y, para la variante `simple_downsample`, el directorio de imágenes (`ISIGHT_IMAGE_DIR`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han encontrado especificaciones verificables de modelos comparables en la información proporcionada. La única comparación documentada es con los otros dos checkpoints de la misma familia, que cubren niveles de análisis distintos:

| Modelo | Autor | Nivel de análisis | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iSight-slide | zhihuanglab | Imagen completa | 5 atributos IHC (intensidad, localización, cantidad, tejido, malignidad) | `unknown` | Hugging Face, 0 descargas |
| iSight-cell | zhihuanglab | Célula | Tinción a nivel celular | No disponible | Hugging Face |
| iSight-target | zhihuanglab | Célula | Selección de células diana | No disponible | Hugging Face |

Como categoría equivalente cabe considerar los modelos fundacionales de patología basados en visión o visión-lenguaje (por ejemplo, los de tipo CLIP entrenados sobre imágenes histológicas), pero los resultados de la búsqueda web realizada no aportaron datos verificables sobre ellos, por lo que sus parámetros, contexto, rendimiento y licencia figuran como no disponibles.

## Limitaciones y advertencias

- Licencia `unknown`: no se puede asumir permiso de uso comercial. Cualquier despliegue en producción requiere contactar con el autor (zhi.huang@pennmedicine.upenn.edu) para aclarar las condiciones.
- Ausencia total de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin problemas reportados ni terceros que hayan reproducido el entrenamiento.
- Sin benchmarks publicados: no hay métricas de exactitud, sensibilidad ni calibración para ninguna de las cinco tareas, lo que impide estimar el rendimiento clínico esperado.
- Sesgo de dominio: el entrenamiento se realiza exclusivamente sobre HPA10M (Human Protein Atlas), lo que limita la generalización a otros anticuerpos, protocolos de tinción, escáneres y laboratorios no representados en ese conjunto.
- Riesgo de falsos negativos y falsos positivos con confianza alta: aunque el modelo no genera texto y por tanto no "alucina" en sentido generativo, sí puede emitir clasificaciones erróneas de malignidad o de intensidad sin que exista una medida publicada de incertidumbre.
- Dependencia del preprocesado: el modelo espera parches de 336 px derivados de una máscara de tejido; errores en la máscara o en el troceado degradan la predicción y no hay una evaluación publicada de esta sensibilidad.
- Idiomas: no se declara el idioma de la rama de texto. Si se activa el condicionamiento textual, las consultas deben formularse en el idioma y con el vocabulario con los que se entrenó, no documentados.
- Rama de texto desactivada en inferencia: el condicionamiento por consulta (tejido, diagnóstico, gen) no afecta a las predicciones por defecto, lo que puede sorprender a quien espere controlar el modelo con texto.
- Configuración de entrenamiento muy restrictiva: `batch_size = 1` con DDP, lo que encarece la reproducción y el reajuste fino y exige el conjunto HPA10M completo con sus metadatos, máscaras RLE e índice.
- Formato de pesos: el checkpoint es un `state dict` de PyTorch (`.pth`), no safetensors, por lo que su carga pasa por `torch.load` y hereda los riesgos habituales de deserialización de ficheros pickle. No existe una vía estándar de despliegue tipo vLLM, Ollama o TGI.
- No es un LLM: no admite generación de texto, tool calling, agentes ni razonamiento multi-paso, pese a que el etiquetado del Hub incluya `clip` y la rama de texto pueda inducir a confusión.

## Enlaces

- [Modelo en Hugging Face: zhihuanglab/iSight-slide](https://huggingface.co/zhihuanglab/iSight-slide)
- [Repositorio de código: github.com/zhihuanglab/iSight](https://github.com/zhihuanglab/iSight)
- [Conjunto de datos de entrenamiento: nirschl-lab/hpa10m](https://huggingface.co/datasets/nirschl-lab/hpa10m)
- [Modelo complementario: zhihuanglab/iSight-cell](https://huggingface.co/zhihuanglab/iSight-cell)
- [Modelo complementario: zhihuanglab/iSight-target](https://huggingface.co/zhihuanglab/iSight-target)
- Contacto del autor: [zhi.huang@pennmedicine.upenn.edu](mailto:zhi.huang@pennmedicine.upenn.edu)
