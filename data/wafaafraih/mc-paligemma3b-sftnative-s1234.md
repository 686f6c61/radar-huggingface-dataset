# WafaaFraih/mc-paligemma3b-sftnative-s1234

## Resumen

`WafaaFraih/mc-paligemma3b-sftnative-s1234` es un adaptador LoRA publicado en HuggingFace por el usuario WafaaFraih, entrenado mediante supervisión (SFT) sobre el modelo base `google/paligemma-3b-pt-224`. No se trata de un modelo completo, sino de un conjunto de pesos delta que debe cargarse junto al modelo base PaliGemma de 3B parámetros para poder ejecutarse. El repositorio ocupa 2,0 GB y está empaquetado con la librería PEFT en versión 0.19.1, con pesos en formato safetensors.

PaliGemma es un modelo de visión y lenguaje (VLM) desarrollado por Google que combina un encoder visual SigLIP-So400m con el decodificador de lenguaje Gemma-2B, y que se distribuye como base versátil para transferencia a tareas concretas. La variante `pt-224` (pre-trained, 224 píxeles de resolución de entrada) es precisamente la pensada para ser ajustada, no para uso conversacional directo. El adaptador que nos ocupa parte de esa variante y aplica un ajuste supervisado adicional, presumiblemente para una tarea específica que la model card no documenta.

La relevancia de esta ficha es limitada pero informativa: se trata de un ejemplo típico de adaptador comunitario sin documentación (la model card es la plantilla vacía de HuggingFace, con todos los campos marcados como "[More Information Needed]"), con cero descargas y cero "likes" en el momento de la consulta. Sirve, por tanto, como caso de estudio de lo que un desarrollador puede y no puede asumir al encontrarse un adaptador LoRA sin trazabilidad ni evaluación publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre PaliGemma-3B-pt-224. El modelo base es un transformer de visión-lenguaje: encoder visual SigLIP-So400m más decodificador de lenguaje Gemma-2B |
| Parámetros totales | No disponible para el adaptador (no se declaran rango LoRA ni módulos objetivo). El modelo base se comercializa como 3B |
| Longitud de contexto | No declarada en el adaptador. El modelo base PaliGemma-3B-pt-224 trabaja con secuencias de 512 tokens |
| Tipos de cuantización | No disponible. El tag `unsloth` sugiere que el entrenamiento pudo usar cuantización, pero no se especifica el esquema |
| Idiomas soportados | No disponible en la model card del adaptador. El modelo base hereda el perfil mayoritariamente anglófono de Gemma-2B |
| Licencia | No disponible en la model card. El modelo base se distribuye bajo los términos de uso de Gemma, que el adaptador no puede relajar |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, librería `peft` 0.19.1) |

## Arquitectura y entrenamiento

El adaptador no introduce arquitectura propia: es un conjunto de matrices de bajo rango (LoRA) que se inyectan en las capas del modelo base. PaliGemma, por su parte, sigue un diseño estándar de VLM de dos torres: un encoder SigLIP-So400m "shape optimized" que convierte la imagen de 224x224 en una secuencia de tokens visuales, y un decodificador Gemma-2B que recibe la concatenación de esos tokens con el texto de entrada. La información pública disponible no detalla en qué módulos del transformer se insertan las matrices LoRA de este adaptador, ni su rango, ni su valor alpha.

En cuanto al entrenamiento, las únicas pistas son los tags del repositorio: `sft`, `lora`, `trl`, `unsloth` y `transformers`. Esto indica un ajuste supervisado clásico sobre pares de ejemplo, ejecutado con el stack TRL y muy probablemente con Unsloth para optimizar memoria y velocidad. No se especifican dataset, número de tokens, composición, hiperparámetros, régimen de precisión ni si hubo fases posteriores de DPO o RLHF. El nombre del repositorio contiene los segmentos `sft`, `native` y `s1234`, que apuntan a una ejecución de SFT identificada por un número de serie o semilla, pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto condicionada por imagen: es la función inherente al modelo base PaliGemma, que acepta entradas de imagen y texto y produce texto.
- Descripción de imágenes y respuesta a preguntas visuales (VQA), si el ajuste SFT no ha degradado esa capacidad heredada.
- OCR y transcripción de texto en imagen, típicamente en inglés y con resolución limitada a 224x224.
- Detección y localización de objetos mediante los tokens especiales de localización de PaliGemma (`<locXXXX>`), sujeto a que el ajuste no los haya eliminado del vocabulario.
- Segmentación referida con tokens de segmentación, capacidad documentada en el modelo base.
- Interpretación de texto con estructura (etiquetas, tablas sencillas, formularios) dentro del límite de 512 tokens de secuencia.
- Soporte de tool calling, function calling y razonamiento multi-paso en modo agente: no disponible y poco plausible, dado que el modelo base `pt` no es un modelo instruct ni está alineado para diálogo.
- Capacidades multilingües: no documentadas; el modelo base está orientado al inglés.
- Modo "thinking", audio o cualquier capacidad especial adicional: no disponible.

## Casos de uso

- Generación automática de texto alternativo en gestores de contenido: el adaptador se cargaría sobre PaliGemma-3B para producir descripciones cortas de imágenes subidas por usuarios. Encaja porque la tarea es de un solo turno y cabe en 512 tokens, pero la resolución de 224 píxeles limita el detalle en escenas complejas.
- Extracción de campos en documentos escaneados: dada una imagen de factura o albarán, el modelo puede devolver una cadena estructurada con los valores relevantes. Requiere validar antes que el ajuste SFT se haya hecho sobre ese dominio concreto, ya que la model card no lo indica.
- Moderación de contenido visual asistida: clasificar imágenes en categorías predefinidas mediante prompts cerrados de una o dos palabras. El coste por inferencia es bajo (modelo de 3B) y la latencia en GPU consumer es manejable.
- Indexación semántica de archivos fotográficos: generación de descripciones que alimenten un índice de búsqueda textual sobre una fototeca. La ventana de 512 tokens es suficiente para descripciones de uno o dos párrafos.
- Prototipado de investigación en transferencia visual-lenguaje: sirve como punto de partida barato para comparar estrategias de ajuste LoRA sobre PaliGemma frente a un ajuste completo, dado el reducido tamaño del adaptador.
- Pipeline de control de calidad industrial con imágenes fijas: verificación de presencia o ausencia de elementos en una imagen de cámara con resolución controlada, donde los 224x224 del encoder son suficientes.
- Etiquetado asistido de datasets: preanotar imágenes con descripciones o categorías que después se revisan manualmente, reduciendo el coste de anotación humana.
- Evaluación docente o académica de tareas visuales cerradas: solo si el ajuste se ha diseñado para ese formato, algo que no puede confirmarse con la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del adaptador deja la sección de evaluación sin rellenar y no incluye ninguna tabla de métricas. Los resultados del paper de PaliGemma (arXiv:2407.07726) corresponden al modelo base y no son extrapolables a este ajuste concreto, ya que se desconoce el dataset y el objetivo del SFT.

## Requisitos de hardware

- El adaptador por sí solo no es ejecutable: requiere cargar `google/paligemma-3b-pt-224` como modelo base.
- Pesos del modelo base en bf16: en torno a 6 GB de VRAM, a los que hay que sumar la caché KV y los tokens visuales. En la práctica, entre 8 y 10 GB para inferencia cómoda.
- Cuantización a 4 bits: aproximadamente 2,5-3 GB de VRAM, suficiente para GPUs de 6-8 GB.
- GPUs consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 24 GB en bf16 sin problema. En GPUs de 8 GB es recomendable cuantizar.
- GPUs de centro de datos: A100 40/80 GB, H100, L40S. El modelo es pequeño para estas tarjetas, por lo que se aprovechan mejor con lotes grandes.
- Despliegue: `transformers` con `peft` para cargar el adaptador; vLLM soporta PaliGemma y permite servir adaptadores LoRA con `--enable-lora`; TGI incluye soporte para PaliGemma. El soporte en llama.cpp y Ollama no está confirmado para esta combinación base más adaptador.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones y dependen enteramente del hardware y del tamaño de imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre PaliGemma-3B-pt-224) | Base de 3B | Adaptador LoRA para VLM | No declarada (hereda términos de Gemma) | HuggingFace, 0 descargas | Sin documentación ni evaluación |
| google/paligemma-3b-pt-224 | 3B | VLM base para transferencia | Términos de uso de Gemma | HuggingFace, ampliamente usado | Modelo de referencia del que parte el adaptador |
| Qwen2-VL-2B-Instruct | 2B | VLM instruct | Apache 2.0 | HuggingFace | Alternativa alineada para diálogo, con resolución dinámica |
| Florence-2 (base 0,23B / large 0,77B) | 0,23B / 0,77B | VLM multitarea | MIT | HuggingFace | Mucho más pequeño, orientado a tareas concretas |
| SmolVLM (256M / 500M) | 0,25B / 0,5B | VLM instruct | Apache 2.0 | HuggingFace | Alternativa ligera para entornos con poca VRAM |

No se dispone de datos de benchmarks comparativos para este adaptador, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card es la plantilla por defecto de HuggingFace sin rellenar: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- El repositorio registra cero descargas y cero "likes", por lo que no existe validación alguna por parte de la comunidad.
- La licencia no está declarada. Al derivar de PaliGemma, el uso comercial queda sujeto a los términos de uso de Gemma, que imponen restricciones adicionales y obligaciones de atribución.
- Riesgo alto de alucinación en tareas de OCR y VQA, especialmente con texto pequeño, ya que el encoder trabaja a 224x224 píxeles.
- La ventana de 512 tokens del modelo base limita el diálogo multi-turno y la entrada de documentos largos.
- El modelo base es la variante `pt` (preentrenada), no una variante instruct: no está alineada para conversación y puede producir continuaciones incoherentes ante prompts abiertos.
- No hay evidencia de soporte multilingüe; se espera un rendimiento claramente inferior en castellano que en inglés.
- Al ser un adaptador LoRA, su comportamiento depende críticamente de que se cargue exactamente sobre el modelo base declarado; cualquier otra variante de PaliGemma invalidaría los pesos.
- No se puede garantizar reproducibilidad: se desconoce la semilla, el dataset y la configuración de entrenamiento.
- No se ha verificado el soporte de los tokens especiales de detección y segmentación tras el ajuste, por lo que esas capacidades podrían estar degradadas.
- Antes de cualquier uso en producción sería necesario evaluar el adaptador en un conjunto de validación propio y auditar los sesgos heredados del preentrenamiento de Gemma y SigLIP.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/WafaaFraih/mc-paligemma3b-sftnative-s1234
- Perfil del autor en HuggingFace: https://huggingface.co/WafaaFraih/models
- Modelo base: https://huggingface.co/google/paligemma-3b-pt-224
- Documentación de PaliGemma en Transformers: https://huggingface.co/docs/transformers/model_doc/paligemma
- Paper de PaliGemma (arXiv:2407.07726): https://arxiv.org/abs/2407.07726
- Versión HTML del paper: https://arxiv.org/html/2407.07726v1
- Repositorio de ejemplo de despliegue de PaliGemma 3B: https://github.com/inferless/google-Paligemma-3b
- Referencia citada en la model card sobre impacto ambiental (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact#compute
