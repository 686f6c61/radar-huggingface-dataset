# zhtstar/RadarMind-7B

## Resumen

RadarMind-7B es un modelo vision-lenguaje especializado en la interpretación de imágenes de radar de apertura sintética (SAR, synthetic aperture radar) y teledetección. Lo desarrolla el autor identificado como zhtstar y se publica junto al artículo «RadarMind: Explainable Chain-of-Thought Reasoning for SAR Image Interpretation with Large Vision-Language Models» en IEEE Transactions on Aerospace and Electronic Systems. El modelo parte de Qwen2.5-VL-7B-Instruct y se distribuye como pesos completamente fusionados (fully merged), sin adaptadores LoRA separados.

El problema que aborda es la brecha entre la imagen SAR —ruidosa, en escala de grises, con geometría de observación lateral y sin las claves visuales de la imagen óptica— y las tareas de comprensión que sí resuelven bien los VLM de propósito general: respuesta a preguntas visuales (VQA) y descripción detallada de escenas. RadarMind-7B se entrena para producir interpretaciones con razonamiento en cadena de pensamiento (chain-of-thought) explicable, de modo que la respuesta final vaya acompañada de un razonamiento intermedio verificable.

Es relevante ahora porque la teledetección SAR es una fuente de datos operativa (vigilancia marítima, monitorización de desastres, detección de cambios) y los VLM generalistas rinden mal en este dominio. El modelo se acompaña del conjunto de datos SARLingu y de una variante compacta RadarMind-3B, y se publica bajo licencia Apache 2.0, lo que facilita su adopción tanto en investigación como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer vision-lenguaje), pesos completamente fusionados |
| Parametros totales | 8.292.166.656 (8,29 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizacion via herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RadarMind-7B es un fine-tuning de Qwen2.5-VL-7B-Instruct, un transformer multimodal que combina un codificador visual con un modelo de lenguaje para entrada image-text-to-text. El repositorio contiene los pesos ya fusionados, por lo que no hace falta cargar un adaptador aparte ni un checkpoint de entrenamiento intermedio. La innovación declarada por los autores es el uso de razonamiento en cadena de pensamiento (chain-of-thought) explicable aplicado específicamente a la interpretación de imágenes SAR, de forma que el modelo genera un razonamiento intermedio antes de la respuesta final.

El entrenamiento se apoya en SARLingu, un conjunto de datos publicado por los mismos autores en Hugging Face y ModelScope, orientado a VQA y descripción de escenas SAR. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO sobre el fine-tuning supervisado. Tampoco se especifican innovaciones de inferencia como decodificación especulativa o atención lineal; el pipeline de inferencia es el estándar de Qwen2.5-VL con su chat template y su procesador multimodal.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imágenes SAR: identificación de objetos, estructuras y patrones en la escena.
- Descripción detallada de escenas SAR (image captioning) con vocabulario propio del dominio de teledetección.
- Razonamiento en cadena de pensamiento explicable: el modelo produce un razonamiento intermedio antes de la respuesta, lo que facilita la auditoría de sus conclusiones.
- Interpretación de escenas de radar de apertura sintética: análisis de retrodispersión, geometría de observación y contexto de la imagen.
- Procesamiento multimodal image-text-to-text mediante el pipeline estándar de Qwen2.5-VL (procesador de imagen más modelo de lenguaje).
- Conversación multi-turno sobre imágenes, heredada del modelo base.
- Capacidades generales del modelo base (texto, razonamiento, código) potencialmente conservadas tras el fine-tuning, aunque no se documentan explícitamente en la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Vigilancia marítima: el modelo puede analizar imágenes SAR de buques y describir la escena, identificando embarcaciones y su contexto, aprovechando su entrenamiento específico en retrodispersión radar donde los VLM ópticos fallan.
- Monitorización de desastres: interpretación de imágenes SAR de inundaciones o incendios, con razonamiento explicable que permite a un analista revisar por qué el modelo concluye que hay una zona anegada.
- Detección de cambios en superficie: comparación descriptiva de escenas SAR en distintos momentos, usando la capacidad de captioning para documentar variaciones en infraestructura o cobertura del terreno.
- Análisis de infraestructura crítica: descripción de puertos, aeropuertos o instalaciones industriales en imágenes SAR, con VQA dirigida a preguntas concretas del analista.
- Asistencia a analistas de teledetección: generación de informes preliminares en lenguaje natural a partir de imágenes SAR, que el analista verifica antes de su uso operativo.
- Investigación en VLM de dominio: uso como modelo de referencia para experimentos de razonamiento explicable en teledetección, junto con el dataset SARLingu y la variante RadarMind-3B para comparativas de escala.
- Prototipado de pipelines image-text-to-text: integración vía transformers con el procesador de Qwen2.5-VL para construir demos de VQA sobre SAR sin necesidad de gestionar adaptadores LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,29 mil millones de parámetros en precisión completa (bf16/fp16) se necesitan aproximadamente 16,6 GB solo para los pesos, más el codificador visual y las activaciones; en la práctica, alrededor de 20-24 GB para inferencia cómoda. En cuantización de 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB (estimaciones a partir del tamaño del repo de 16,6 GB, no verificadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para inferencia en bf16 sin restricciones.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con margen ajustado, y en RTX 3090/4080 con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (ruta oficial documentada), text-generation-inference (el repo incluye la etiqueta), vLLM y llama.cpp/Ollama mediante conversión a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RadarMind-7B | 8,29 B | no disponible | SAR / teledeteccion | Apache 2.0 | Hugging Face, ModelScope |
| RadarMind-3B | escala 3B (dato no detallado) | no disponible | SAR / teledeteccion | no disponible en la informacion | Hugging Face, ModelScope |
| Qwen2.5-VL-7B-Instruct | escala 7B | no disponible en la informacion | VLM generalista | Apache 2.0 | Hugging Face |

La comparación con Qwen2.5-VL-7B-Instruct es la más directa, ya que RadarMind-7B deriva de él: el modelo base es generalista y no está especializado en SAR, mientras que RadarMind-7B incorpora el fine-tuning de dominio y el razonamiento explicable. No se dispone de datos de rendimiento comparativo entre ambos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está pensado para investigación en comprensión de imágenes SAR y teledetección; los autores advierten explícitamente de que las salidas deben verificarse de forma independiente antes de cualquier uso operativo o crítico para la seguridad.
- Riesgo de alucinación: como todo VLM, puede describir objetos o estructuras ausentes en la imagen SAR, especialmente en escenas con ruido de speckle o baja relación señal-ruido.
- Sesgos conocidos: no documentados en la información proporcionada; al heredar el modelo base, puede arrastrar sesgos de Qwen2.5-VL-7B-Instruct.
- Limitaciones de idioma: los idiomas soportados no están documentados; el modelo card está en inglés y no se garantiza un rendimiento equivalente en castellano.
- Longitud de contexto: no especificada en la información disponible; conviene consultar la del modelo base Qwen2.5-VL-7B-Instruct antes de diseñar pipelines con imágenes de gran resolución.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero obliga a conservar los avisos de licencia y atribución incluidos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de su calidad.
- El repositorio ocupa 16,6 GB; el despliegue en producción requiere planificar almacenamiento y ancho de banda además de la VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhtstar/RadarMind-7B
- Modelo en ModelScope: https://modelscope.cn/models/zhtstar/RadarMind-7B
- Variante compacta RadarMind-3B (Hugging Face): https://huggingface.co/zhtstar/RadarMind-3B
- Variante compacta RadarMind-3B (ModelScope): https://modelscope.cn/models/zhtstar/RadarMind-3B
- Dataset SARLingu (Hugging Face): https://huggingface.co/datasets/zhtstar/SARLingu
- Dataset SARLingu (ModelScope): https://modelscope.cn/datasets/zhtstar/SARLingu
- Codigo en GitHub: https://github.com/zhtstar/RadarMind
- Articulo IEEE: https://doi.org/10.1109/TAES.2026.3719218
- Modelo base Qwen2.5-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL
