# taceroc/ML_RealBogus_Rubin

## Resumen

El modelo `taceroc/ML_RealBogus_Rubin` es un clasificador binario desarrollado por el usuario `taceroc` y publicado en Hugging Face con el objetivo de distinguir entre objetos astronómicos reales y falsos positivos (conocidos como "bogus") en el contexto del proyecto Rubin Observatory/LSST. Es un modelo de visión por computadora basado en una red neuronal convolucional (CNN) muy compacta, con solo 73.569 parámetros totales, diseñada para procesar imágenes de 51x51 píxeles con 3 canales (presumiblemente bandas fotométricas).

La arquitectura publicada en el model card es la clase `TACCNN` (una CNN clásica con tres capas convolucionales, max pooling, dropout y dos capas totalmente conectadas). No se especifican datos de entrenamiento, métricas de rendimiento ni documentación técnica más allá del esquema de versionado interno v0.1, v0.2 y v0.3 descrito en el documento técnico DMTN-337. A pesar de su tamaño reducido, el modelo está pensado para integrarse en pipelines de clasificación de imágenes astronómicas donde el coste computacional y la latencia son críticos.

La ficha original no aporta información sobre benchmarks, composición del dataset ni detalles de entrenamiento, por lo que gran parte de las especificaciones técnicas quedan sin datos confirmados. Su relevancia actual radica en el contexto de la astronomía de campo amplio y la necesidad de clasificadores ligeros y rápidos para filtrar alertas en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN feed-forward (3 capas convolucionales con max pooling y dropout, 2 capas totalmente conectadas) |
| Parametros totales | 73.569 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no de texto) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (con `PyTorchModelHubMixin`) |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional secuencial implementada en PyTorch, definida como la clase `TACCNN`. Acepta tensores de entrada de forma `(batch_size, 3, 51, 51)`. La arquitectura consta de tres bloques convolucionales: cada uno con una capa Conv2d de kernel 5x5, activación ReLU y MaxPool2d de tamaño 2x2, seguidos de dropout al 40 %. Tras las capas convolucionales, el tensor se recalcula dinámicamente con `self.forward_conv` para determinar el tamaño de la entrada a la primera capa totalmente conectada. Las capas `fc1` (64->32) y `fc2` (32->1) producen una salida final que pasa por una función sigmoide, obteniendo una probabilidad entre 0 y 1. La salida se comprime con `.squeeze(1)`.

No se proporcionan datos sobre la composición del dataset, el número de tokens (al no ser un modelo de lenguaje), la estrategia de optimización, ni si se aplicó RLHF o DPO. El README solo indica que las versiones `v0.1`, `v0.2` y `v0.3` siguen el esquema de versionado descrito en `DMTN-337` (documento técnico del LSST). No se documenta ninguna innovación tecnológica destacable. La arquitectura es una CNN convencional, adecuada para clasificación de imágenes de pequeño tamaño, con un coste computacional mínimo debido al escaso número de parámetros.

## Capacidades

- Clasificación binaria de imágenes astronómicas de 51x51 píxeles con 3 canales, distinguiendo entre objetos reales y artefactos (bogus).
- Generación de una probabilidad de pertenencia a la clase positiva mediante activación sigmoide.
- Inferencia muy rápida y ligera gracias a sus 73.569 parámetros, lo que permite ejecutarse en CPU o en dispositivos de baja capacidad.
- Soporte de carga directa mediante `PyTorchModelHubMixin` en Hugging Face, con revisiones versionadas (`v0.1`, `v0.2`, `v0.3`).
- No soporta tool calling, ni generación de texto, ni razonamiento multi-step, ni capacidades multimodales.
- No es un modelo de lenguaje, por lo que no tiene capacidades multilingües ni longitud de contexto textual.

## Casos de uso

- Filtrado de alertas en pipelines de astronomía transitoria: el modelo puede usarse para clasificar rápidamente los cutouts de imágenes de diferencia recibidos en un sistema de alertas tipo LSST, descartando candidatos que no corresponden a fuentes reales antes de activar observaciones de seguimiento.
- Validación automatizada de candidatos a supernovas: al integrar el modelo en un pipeline de análisis, se puede asignar una puntuación de "real" a cada candidato detectado, permitiendo priorizar el seguimiento espectroscópico solo en los objetos con mayor probabilidad.
- Reducción de falsos positivos en búsquedas de asteroides o cometas: el clasificador puede aplicarse a las imágenes de descubrimiento para eliminar rápidamente artefactos producidos por ruido, defectos del detector o columnas saturadas.
- Prototipado académico y docencia: dada su arquitectura compacta y simple, es un buen ejemplo para enseñar clasificación de imágenes con CNN en astronomía, fácil de cargar en notebooks y de inspeccionar capa a capa.
- Inferencia en tiempo real en entornos embebidos: gracias a su tamaño mínimo, puede desplegarse en computadoras de baja potencia (Raspberry Pi, Jetson Nano) para el procesamiento local de imágenes en observatorios o sensores remotos.
- Integración en servicios de clasificación mediante ONNX o TorchScript: permite servir el modelo en microservicios con latencias del orden de milisegundos, aptos para sistemas de streaming o broker de alertas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de precisión, recall o F1 para este modelo en la documentación de Hugging Face ni en el model card.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, los pesos ocupan aproximadamente 294 KB (73.569 parámetros por 4 bytes), por lo que el requisito de VRAM es despreciable (inferior a 1 MB).
- GPU recomendadas: ninguna en particular; el modelo puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, se ejecuta en cualquier GPU moderna y también en CPU (incluso en equipos de gama baja).
- Opciones de despliegue: el modelo se distribuye como pesos safetensors con `PyTorchModelHubMixin`; se puede cargar con PyTorch puro o exportar a ONNX o TorchScript para servidores de inferencia. No se recomienda vLLM, llama.cpp ni Ollama, ya que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput estimados: no hay valores publicados, pero el coste computacional es mínimo; se espera que la inferencia se complete en milisegundos en CPU o microsegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. No se pueden presentar datos rigurosos de comparación con otras CNN de clasificación de imágenes astronómicas, ya que no se han facilitado nombres ni métricas de alternativas.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, variables del dataset o procedencia de los datos de entrenamiento.
- El modelo solo es apto para clasificación de imágenes de 51x51 píxeles con 3 canales; no acepta entradas de otro tamaño o modalidad.
- No se proporcionan métricas de validación, por lo que el riesgo de sobreajuste o baja capacidad de generalización es elevado. No se recomienda su uso en producción sin una evaluación exhaustiva previa.
- Al ser un modelo de visión por computadora, las limitaciones de contexto o de idioma no aplican.
- La licencia CC-BY-4.0 permite uso comercial y la creación de obras derivadas, pero exige atribución adecuada. Es importante revisar los términos completos de la licencia.
- El README menciona que las revisiones `v0.1`, `v0.2` y `v0.3` siguen el estándar `DMTN-337`, pero no se proporciona una explicación técnica de las diferencias entre versiones ni de los cambios en el rendimiento.
- No se han encontrado documentos, papers ni evaluaciones externas que respalden la calidad del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/taceroc/ML_RealBogus_Rubin
- Referencia al esquema de versionado: https://dmtn-337.lsst.io
- Paper: no disponible (el model card indica "More Information Needed")
- Docs: no disponible (el model card indica "More Information Needed")
