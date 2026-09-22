# WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_40_DoRA

## Resumen

WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_40_DoRA es un adaptador de ajuste fino publicado en HuggingFace por el usuario WijewardhanaNT, construido sobre el modelo base meta-llama/Llama-3.1-8B mediante la técnica DoRA (Weight-Decomposed Low-Rank Adaptation), una variante de LoRA implementada en la librería PEFT (versión 0.17.1 según la model card). Se trata por tanto de un artefacto de pesos de bajo rango, no de un modelo completo: el repositorio ocupa 0,1 GB y requiere descargar el modelo base de 8.000 millones de parámetros para poder ejecutarse.

El nombre del repositorio sugiere que el adaptador se ha entrenado sobre el conjunto de datos TyDi QA (Wikipedia-based Typologically Diverse Question Answering), en concreto sobre los subconjuntos de inglés y telugu, con una configuración que el autor identifica como "3000" ejemplos y algún valor porcentual entre 1 y 40. Esta interpretación procede únicamente de la nomenclatura del repositorio y no está confirmada en la model card, que es la plantilla por defecto de HuggingFace sin rellenar. El modelo se etiqueta con pipeline text-generation y la etiqueta lora.

Su relevancia es limitada y de carácter experimental: acumula 7 descargas y 0 "likes" desde su creación en septiembre de 2026, no declara licencia ni idiomas, y no publica métricas de evaluación, hiperparámetros de entrenamiento ni detalles del dataset. Es un ejemplo típico de adaptador de investigación sobre una lengua de bajos recursos (telugu) que puede resultar útil como punto de partida para reproducir experimentos de ajuste eficiente en tareas extractivas, pero no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (variante de LoRA) sobre transformer decoder-only; arquitectura del modelo base: Llama 3.1 8B |
| Parámetros totales | 8.000 millones en el modelo base; número de parámetros del adaptador no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base Llama 3.1 8B; no se especifica si el adaptador fue entrenado con esa ventana |
| Tipos de cuantización | No disponible (el repositorio contiene únicamente pesos de adaptador en safetensors) |
| Idiomas soportados | No disponible en la model card; el nombre del repositorio indica inglés y telugu |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Librería | PEFT 0.17.1 |
| Modelo base | meta-llama/Llama-3.1-8B |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Descargas / likes | 7 / 0 |

## Arquitectura y entrenamiento

El adaptador emplea DoRA, una técnica de ajuste eficiente de parámetros presentada como mejora de LoRA. DoRA descompone los pesos preentrenados en un componente de magnitud y otro de dirección, y aplica la actualización de bajo rango únicamente sobre la dirección, mientras que la magnitud se entrena como un vector separado. Esto permite, según la literatura del método, acercar el comportamiento del ajuste a un fine-tuning completo con un coste de parámetros muy inferior. En este repositorio la técnica se aplica sobre Llama 3.1 8B, un transformer decoder-only con normalización RMSNorm, activación SwiGLU, RoPE y atención con ventana de 128.000 tokens; los pesos resultantes se serializan como adaptador PEFT y se cargan de forma aditiva sobre el modelo base congelado.

Los detalles de entrenamiento no están documentados. La model card es la plantilla genérica de HuggingFace y todos los campos relevantes aparecen como "[More Information Needed]", incluidos el desarrollador, el financiador, el tipo de modelo, los idiomas, la licencia, la composición del dataset, el régimen de precisión y los hiperparámetros. Por la nomenclatura del repositorio puede inferirse que el ajuste se hizo sobre TyDi QA en su partición de inglés y telugu, pero no se especifican el número exacto de ejemplos, el rango del adaptador, el ratio alpha, el dropout, la tasa de aprendizaje, el número de épocas ni si se aplicó alguna etapa de alineación posterior (RLHF, DPO). La etiqueta arxiv:1910.09700 corresponde al artículo de Lacoste et al. sobre estimación del impacto ambiental del aprendizaje automático, citado en la plantilla de la model card, y no a un artículo técnico de este modelo.

## Capacidades

- Generación de texto autoregresiva en inglés y, presumiblemente, telugu, heredada del modelo base Llama 3.1 8B y especializada mediante el adaptador.
- Respuesta a preguntas de tipo extractivo sobre pasajes de contexto, que es la tarea del conjunto TyDi QA sobre el que aparentemente se ha entrenado.
- Manejo de contexto largo gracias a la ventana de 128.000 tokens del modelo base, si bien no hay evidencia de que el adaptador haya sido entrenado con secuencias de esa longitud.
- Capacidades multilingües del modelo base (Llama 3.1 cubre ocho idiomas de forma oficial, entre ellos inglés), con especialización añadida hacia el telugu.
- Soporte de tool calling y function calling heredado de Llama 3.1 8B, aunque el ajuste específico sobre datos de QA extractivo puede degradar esta capacidad.
- Razonamiento multi-paso y comportamiento de agente: no disponible de forma específica para este adaptador.
- Capacidades de visión o audio: no soportadas (el modelo base es exclusivamente de texto).
- Modo de pensamiento explícito ("thinking mode"): no soportado.

## Casos de uso

- Evaluación comparativa de técnicas PEFT: el adaptador sirve como artefacto de referencia para medir el comportamiento de DoRA frente a LoRA con el mismo modelo base y el mismo conjunto de datos, dentro de experimentos académicos de ajuste eficiente.
- Sistemas de pregunta-respuesta extractiva sobre documentación en inglés: dado un pasaje y una pregunta, el modelo puede devolver el fragmento de respuesta, aprovechando la especialización sobre TyDi QA y la ventana de contexto de 128.000 tokens del modelo base.
- Investigación en procesamiento del telugu y otras lenguas de bajos recursos: permite estudiar el efecto del ajuste de bajo rango sobre una lengua con poca representación en los corpus de preentrenamiento, partiendo de un modelo predominantemente anglófono.
- Transferencia cross-lingüe: analizar hasta qué punto el ajuste conjunto sobre inglés y telugu mejora el rendimiento en telugu respecto al modelo base sin ajustar.
- Destilación de datos y generación de conjuntos sintéticos de QA: el modelo puede emplearse para producir borradores de pares pregunta-respuesta sobre textos en inglés y telugu, que luego se filtran manualmente.
- Experimentos de ajuste incremental: al ser un adaptador de 0,1 GB, se puede aplicar y retirar de una instancia del modelo base ya cargada en memoria, lo que facilita probar múltiples adaptadores sobre la misma GPU sin recargar los 8.000 millones de parámetros.
- Enseñanza y reproducción de resultados: sirve como ejemplo mínimo de cómo se estructura un repositorio PEFT, con la advertencia de que la documentación está vacía y no se pueden reproducir los resultados.
- Despliegue en producción: no se recomienda con la información disponible, ya que no hay licencia declarada, ni métricas, ni documentación sobre sesgos o alucinaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye la sección de evaluación completada, no se declaran métricas sobre TyDi QA (EM, F1), MMLU, HumanEval, GSM8K ni ningún otro conjunto, y los resultados de búsqueda web proporcionados no contienen información relacionada con el modelo (devuelven únicamente páginas de comercio electrónico sin relación).

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB, pero la inferencia requiere cargar el modelo base Llama 3.1 8B completo.
- VRAM estimada para el modelo base: en torno a 16 GB en fp16/bf16, unos 8-9 GB en cuantización de 8 bits y unos 5-6 GB en cuantización de 4 bits (valores orientativos estándar para un modelo de 8.000 millones de parámetros; no se han publicado mediciones específicas para este adaptador).
- GPU de centro de datos: A100 40/80 GB, H100, L40S o A6000, con margen amplio para lotes grandes y contexto largo.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080/3090 (16-24 GB) en fp16 con contexto moderado, y en tarjetas de 8-12 GB si se cuantiza el modelo base a 4 u 8 bits.
- Opciones de despliegue: transformers + PEFT para carga directa del adaptador; vLLM y Text Generation Inference permiten servir adaptadores LoRA/PEFT junto al modelo base, aunque la compatibilidad exacta de los pesos DoRA con cada versión debe verificarse; llama.cpp y Ollama requieren convertir el adaptador a formato GGUF, un proceso que puede no soportar todas las variantes de DoRA.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, tiempo hasta el primer token ni consumo energético (el campo "Carbon Emitted" de la model card está sin rellenar).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (DoRA sobre Llama 3.1 8B) | 8.000 M (base) + adaptador | 128.000 tokens (base) | No disponible | No disponible | HuggingFace, 7 descargas |
| meta-llama/Llama-3.1-8B (modelo base) | 8.000 M | 128.000 tokens | Métricas publicadas en la model card oficial de Meta | Licencia comunitaria de Llama 3.1 | HuggingFace, ampliamente usado |
| Otros adaptadores LoRA sobre Llama 3.1 8B para QA multilingüe | 8.000 M (base) + adaptador | 128.000 tokens (base) | No disponible | Variable según autor | HuggingFace |
| Modelos ajustados específicamente para TyDi QA (por ejemplo, variantes de XLM-R o mT5) | 0,3-13 B según variante | Variable, típicamente 512 tokens | No disponible en esta ficha | Variable | HuggingFace |

No se dispone de datos de rendimiento comparables para este adaptador, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto y todos los campos relevantes están marcados como "[More Information Needed]". No hay información sobre el desarrollador, la financiación, el dataset exacto, los hiperparámetros ni el proceso de evaluación.
- Licencia no declarada. Sin licencia explícita no se puede determinar si el uso comercial está permitido. Además, al derivar de Llama 3.1 8B, se heredan las restricciones de la licencia comunitaria de Meta, que incluye cláusulas de atribución, límites de usuarios mensuales para determinados supuestos y políticas de uso aceptable.
- Sesgos: no evaluados ni documentados. El modelo base Llama 3.1 presenta sesgos conocidos en cuanto a género, etnia, religión y representación geográfica; el ajuste sobre TyDi QA no corrige estos sesgos y puede reforzar estereotipos presentes en los pasajes de Wikipedia usados como contexto.
- Riesgo de alucinación: el ajuste sobre tareas extractivas hace probable que el modelo genere respuestas plausibles pero no presentes en el pasaje de contexto, especialmente cuando la respuesta no está en el texto. No existen métricas de fidelidad publicadas.
- Cobertura idiomática no verificada: aunque el nombre del repositorio menciona inglés y telugu, la etiqueta de idiomas del repositorio está vacía y no se ha confirmado el comportamiento real en telugu.
- Posible degradación de capacidades generales: el ajuste específico sobre QA puede reducir el rendimiento en otras tareas (generación creativa, código, instrucciones generales) respecto al modelo base.
- Origen y reproducibilidad: el autor es un usuario individual, el modelo acumula 7 descargas y no hay artículo, demo ni repositorio de código asociado. Esto impide verificar los resultados y desaconseja su uso en entornos de producción.
- Riesgo de compatibilidad: DoRA no está soportado por todas las herramientas de inferencia, por lo que puede requerir transformaciones o conversiones adicionales antes de integrarse en un pipeline.

## Enlaces

- HuggingFace: https://huggingface.co/WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_40_DoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Referencia citada en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental del aprendizaje automático: https://mlco2.github.io/impact
- Conjunto de datos TyDi QA (referencia general del benchmark citado en el nombre del repositorio): https://github.com/google-research-datasets/tydiqa
- Librería PEFT: https://github.com/huggingface/peft
- No se han encontrado otros enlaces relevantes en la búsqueda web proporcionada.
