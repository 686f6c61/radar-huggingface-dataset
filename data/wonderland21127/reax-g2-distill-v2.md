# wonderland21127/REAX-G2-Distill-v2

## Resumen

REAX-G2-Distill-v2 es un modelo de 31.273.086.512 parámetros (aproximadamente 31,3 mil millones) publicado por el usuario wonderland21127 en Hugging Face. Se trata de un fine-tuning del modelo tattrongvu/Jeffan-31b-1710, etiquetado con la arquitectura "gemma4" y orientado a tareas de toma de decisiones y clasificación de texto con opción múltiple (multiple-choice). El pipeline declarado en la model card es text-classification, aunque los tags incluyen también image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base.

El modelo se distribuye en formato safetensors con un tamaño de repositorio de 62,6 GB, lo que es coherente con pesos en precisión de 16 bits para 31,3 mil millones de parámetros. La licencia declarada es Apache 2.0, pero el acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargarlo. El repositorio no registra descargas ni "likes" en el momento de la consulta, y no se han publicado idiomas soportados en los metadatos.

La relevancia de esta ficha es limitada pero informativa: se trata de un modelo derivado de una familia poco documentada (Jeffan-31b), sin benchmarks publicados, sin model card detallada accesible y con un pipeline declarado que no coincide plenamente con los tags. Para un desarrollador o investigador, esto implica que cualquier evaluación seria debe hacerse empíricamente tras solicitar acceso, y que no debe asumirse ningún rendimiento concreto sin validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | gemma4 (según tag del repositorio); no se detalla la variante exacta |
| Parámetros totales | 31.273.086.512 (31,3 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Modalidades declaradas | image-text-to-text (tag) |
| Modelo base | tattrongvu/Jeffan-31b-1710 |
| Acceso | restringido (gated) |
| Tamaño del repositorio | 62,6 GB |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en la arquitectura "gemma4", según el tag del repositorio, y que es un fine-tuning de tattrongvu/Jeffan-31b-1710. No se especifica en los metadatos si se trata de un transformer denso, un MoE o una arquitectura híbrida; el recuento de parámetros (31,3 B) y el tamaño del repositorio (62,6 GB) son compatibles con pesos en bf16/fp16 de un modelo denso de ese orden, pero no permiten descartar otras configuraciones.

No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. El sufijo "Distill" en el nombre sugiere un proceso de destilación, presumiblemente desde el modelo base Jeffan-31b-1710, pero no se documenta la metodología, la función de pérdida ni el profesor utilizado. Tampoco se detalla el proceso de alineación ni si hubo fases de instrucción supervisada.

## Capacidades

- Clasificación de texto y tareas de opción múltiple (multiple-choice), según el pipeline y los tags declarados.
- Toma de decisiones (decision-making), indicada explícitamente en los tags del repositorio.
- Procesamiento image-text-to-text: el tag sugiere entrada conjunta de imagen y texto, presumiblemente heredada del modelo base, aunque no se documenta el codificador visual ni la resolución de entrada.
- Generación de texto: no confirmada explícitamente en la información disponible, aunque es esperable en un modelo de 31 B basado en un transformer tipo Gemma.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se listan idiomas en los metadatos).
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Clasificación de documentos en pipelines de ingestión: el modelo puede emplearse como clasificador de texto (pipeline text-classification) para etiquetar documentos entrantes en categorías predefinidas, aprovechando su tamaño para capturar matices semánticos que modelos más pequeños pierden.
- Sistemas de decisión con opción múltiple: en entornos donde se debe elegir entre un conjunto cerrado de acciones (por ejemplo, enrutamiento de tickets, selección de respuesta en un árbol de decisión), el formato multiple-choice declarado encaja directamente.
- Evaluación de imágenes con contexto textual: gracias al tag image-text-to-text, podría usarse para tareas de clasificación o decisión que combinen una imagen con una pregunta textual, como la categorización de capturas o la selección de la descripción correcta.
- Destilación y experimentación académica: al ser un modelo "Distill" de 31 B, puede servir como referencia para estudiar el efecto de la destilación sobre el modelo base Jeffan-31b-1710 en tareas de clasificación.
- Generación de datos sintéticos etiquetados: si el modelo conserva capacidades generativas, podría emplearse para producir pares pregunta-respuesta con etiqueta correcta en tareas de opción múltiple, útiles para aumentar datasets de entrenamiento.
- Investigación sobre alineación y sesgos en modelos de gran tamaño: su licencia Apache 2.0 y su disponibilidad (previa solicitud de acceso) permiten auditar el comportamiento del modelo en tareas de decisión sin restricciones comerciales derivadas de la licencia.
- Prototipado de asistentes multimodales: en fase de experimentación, podría integrarse en un prototipo que reciba una imagen y una pregunta y devuelva una opción entre varias, siempre que se valide empíricamente la calidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de MMLU, HumanEval, GSM8K ni métricas de clasificación, y no se dispone de comparaciones con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se necesitan GPUs con 80 GB (A100 80GB, H100 80GB) para una sola instancia sin cuantizar.
- Cuantización a 8 bits: reduciría los pesos a unos 31 GB, lo que permitiría ejecución en una A100 40GB o en dos RTX 4090 (24 GB cada una) con reparto de capas.
- Cuantización a 4 bits: reduciría los pesos a unos 16 GB, lo que permitiría ejecutarlo en una RTX 4090 de 24 GB, aunque con pérdida de calidad no cuantificada.
- GPU consumer: solo viable con cuantización agresiva (4 bits) en RTX 4090, RTX 3090 (24 GB) o GPUs con 24 GB o más; en GPUs de 16 GB no cabría sin offloading a CPU.
- Opciones de despliegue: el repositorio usa transformers y safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Dado el pipeline text-classification, transformers es la vía natural; para servirlo como API habría que envolverlo manualmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| REAX-G2-Distill-v2 | 31,3 B | no disponible | Apache 2.0 | gated | Fine-tuning de Jeffan-31b-1710, pipeline text-classification |
| tattrongvu/Jeffan-31b-1710 (modelo base) | no disponible | no disponible | no disponible | no disponible | Base declarada; sin datos públicos en la información proporcionada |
| Gemma 2 27B (referencia de familia) | 27 B | 8K (típico) | Gemma license | abierto | Alternativa de tamaño similar, pero con licencia distinta y sin relación directa documentada |
| Modelos de clasificación tipo BERT large | ~0,34 B | 512 tokens | Apache 2.0 / MIT | abierto | Mucho más pequeños; adecuados para clasificación, pero sin capacidades multimodales ni de decisión compleja |

La comparativa es limitada porque no se dispone de datos de rendimiento del modelo ni de su base. La comparación con Gemma 2 27B es solo orientativa por tamaño y familia declarada, no por resultados.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de model card detallada: no hay evidencia pública de calidad en ninguna tarea.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede retrasar la evaluación y complicar la reproducibilidad.
- Idiomas no declarados: no se puede asumir soporte multilingüe ni un rendimiento concreto en castellano.
- Contexto no documentado: imposible planificar cargas de trabajo con ventanas largas sin validación empírica.
- Pipeline declarado (text-classification) no coincide plenamente con los tags (image-text-to-text, decision-making): posible ambigüedad sobre el uso previsto.
- Riesgo de alucinación: no cuantificado; en tareas de clasificación y opción múltiple el riesgo se manifiesta como etiquetas incorrectas o elección de opciones inválidas.
- Sesgos: no documentados; al no conocerse la composición del dataset de fine-tuning, no se pueden evaluar sesgos de género, raza o idioma.
- Licencia Apache 2.0: permite uso comercial, pero el acceso gated puede imponer condiciones adicionales de uso aceptable que deben revisarse antes de desplegar en producción.
- Sin soporte documentado de tool calling ni de agentes: no debe asumirse para pipelines agénticos sin pruebas previas.
- Repositorio sin descargas ni validación comunitaria: no hay señales de uso real que permitan inferir estabilidad o mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/wonderland21127/REAX-G2-Distill-v2
- Modelo base: https://huggingface.co/tattrongvu/Jeffan-31b-1710
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
