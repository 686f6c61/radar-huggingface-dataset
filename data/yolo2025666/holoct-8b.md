# yolo2025666/HoloCT-8B

## Resumen

HoloCT-8B es un modelo fundacional 3D para interpretación y segmentación de tomografías computarizadas (TC), desarrollado por el autor yolo2025666 y publicado bajo licencia MIT. El modelo recibe un volumen de TC en formato NIfTI junto con un prompt en inglés y devuelve texto generado (hallazgos, respuestas a preguntas visuales, informes radiológicos) y, cuando se solicita, máscaras binarias 3D a nivel de vóxel vinculadas a los hallazgos textuales.

La arquitectura combina un codificador global derivado de Med3DVLM, un codificador detallado derivado de VISTA3D, un backbone lingüístico Qwen3-VL-8B y un decodificador de máscaras 3D. Esta doble escala de codificación permite unir la comprensión de volumen completo con información espacial fina, lo que habilita tareas de grounding en las que cada hallazgo textual se asocia a una máscara tridimensional concreta.

Con 9.042.520.512 parámetros reales (según los safetensors del repositorio, 18,1 GB), HoloCT-8B es el modelo grande de la familia HoloCT, que también incluye una variante HoloCT-4B. Su relevancia radica en unificar en un solo modelo tareas que habitualmente requieren pipelines separados (detección de lesiones, VQA médica, generación de informes y segmentación guiada por lenguaje) sobre volúmenes de TC completos en 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida multimodal 3D: codificador global (Med3DVLM), codificador detallado (VISTA3D), backbone lingüístico Qwen3-VL-8B y decodificador de máscaras 3D |
| Parametros totales | 9.042.520.512 |
| Parametros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (inferencia documentada en bfloat16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

HoloCT-8B emplea una arquitectura multimodal específica para volúmenes 3D de TC. La entrada se procesa mediante dos codificadores complementarios: un codificador global derivado de Med3DVLM, que captura la semántica de todo el volumen, y un codificador detallado derivado de VISTA3D, orientado a información espacial fina. Las representaciones resultantes se integran en un backbone lingüístico Qwen3-VL-8B, y un decodificador de máscaras 3D traduce las peticiones de grounding en máscaras binarias a nivel de vóxel.

El modelo se infiere en precisión bfloat16 mediante la implementación del proyecto HoloCT, que incluye clases propias de modelo y de procesador de TC. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card cita demos sobre RadGenome y ReXGrounding para generación de informes y grounding de hallazgos, lo que sugiere el uso de dichos recursos en el desarrollo o la evaluación, aunque no se especifica formalmente la composición del corpus de entrenamiento.

## Capacidades

- Interpretación unificada de TC: cribado de lesiones, respuesta a preguntas visuales (VQA) y generación de informes radiológicos a partir de prompts en inglés.
- Generación de texto con grounding: produce hallazgos textuales y las máscaras 3D correspondientes, con tokens `<SEG>` que dan lugar a ficheros `mask_000.nii.gz`, `mask_001.nii.gz`, etc.
- Segmentación guiada por lenguaje: segmenta objetivos anatómicos y hallazgos descritos en texto libre (por ejemplo, "Segment the liver in this CT scan.").
- Inferencia emparejada: permite comparar respuestas con y sin grounding sobre el mismo volumen de TC mediante los demos incluidos.
- Procesamiento de volúmenes 3D completos en formato NIfTI en unidades Hounsfield.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Soporte de tool calling, function calling, agentes o modos de razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Cribado automatizado de lesiones hepáticas: el modelo responde a preguntas como "Is there a liver lesion?" sobre un volumen de TC y, con el prompt de grounding, devuelve además la máscara 3D de la lesión, lo que facilita la revisión por parte del radiólogo.
- Generación de informes radiológicos: a partir de un volumen de TC y un prompt, produce texto de informe con temperatura 0,15, top-p 0,85 y penalización de repetición 1,15, ajustes orientados a una salida estable y poco repetitiva.
- Segmentación de órganos para planificación quirúrgica: instrucciones en lenguaje natural como "Segment the liver in this CT scan." generan máscaras binarias listas para su uso en flujos de planificación o volumetría.
- Segmentación de hallazgos referidos: los demos de referring segmentation permiten segmentar una estructura descrita textualmente, útil para cuantificar volumen o extensión de una lesión concreta.
- Control de calidad y comparación de pipelines: la inferencia emparejada (grounded frente a ungrounded) permite evaluar si el grounding mejora la coherencia entre el texto y la evidencia espacial en un caso dado.
- Investigación en modelos fundacionales médicos 3D: la combinación de codificadores Med3DVLM y VISTA3D con un backbone Qwen3-VL-8B sirve como base para experimentos de VQA médica y grounding sobre TC.
- Evaluación cuantitativa con métricas clínicas: los ejemplos de métricas del repositorio (Dice, HD95, decisiones de cribado, solapamiento de texto y calidad de informes con grounding) permiten integrar el modelo en protocolos de evaluación reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia ejemplos de métricas de una sola muestra (Dice, HD95, decisiones de cribado, solapamiento de texto, puntuaciones clínicas de texto y calidad de informes con grounding) en el repositorio de evaluación, sin cifras agregadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9.042.520.512 parámetros en bfloat16, el peso de los parámetros ronda los 18 GB, por lo que se requiere una GPU con al menos 24 GB de VRAM para cargar el checkpoint, sin contar activaciones ni el procesamiento del volumen 3D.
- GPU recomendadas: NVIDIA con soporte de bfloat16; la model card exige una GPU NVIDIA compatible con bfloat16 y los demos se ejecutan en una única GPU visible (`CUDA_VISIBLE_DEVICES=0`).
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos, una RTX 4090 (24 GB) queda en el límite y podría no ser suficiente al sumar activaciones y el volumen de TC. No hay datos oficiales al respecto.
- Opciones de despliegue: implementación propia del proyecto HoloCT (PyTorch 2.6.0, torchvision 0.21.0, CUDA 12.4, PyTorch SDPA). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Entorno recomendado: Ubuntu 22.04, Python 3.10.16, entorno conda `holoct`.
- Configuración de generación: máximo 1024 tokens nuevos, semilla 42; decodificación greedy para cribado, VQA y segmentación; umbral de máscara 0,5 tras la transformación inversa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HoloCT-8B | 9.042.520.512 | no disponible | TC 3D + texto | MIT | Hugging Face (yolo2025666/HoloCT-8B) |
| HoloCT-4B | no disponible | no disponible | TC 3D + texto | no disponible | Hugging Face (yolo2025666/HoloCT-4B) |
| Qwen3-VL-8B | no disponible | no disponible | imagen 2D + texto | no disponible | Repositorio QwenLM/Qwen3-VL |
| Med3DVLM | no disponible | no disponible | volumen médico 3D + texto | no disponible | Repositorio mirthAI/Med3DVLM |

La comparación cuantitativa de rendimiento con alternativas no está disponible en la información proporcionada. HoloCT-4B es la variante pequeña de la misma familia; Qwen3-VL-8B y Med3DVLM son componentes de la arquitectura de HoloCT-8B y se incluyen como referencia de linaje técnico, no como competidores directos.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés, tanto en prompts como en salidas.
- Dominio restringido: está diseñado para volúmenes de TC en formato NIfTI en unidades Hounsfield; no se documenta su uso con otras modalidades de imagen.
- Riesgo de alucinación: al ser un modelo generativo aplicado a texto clínico, puede producir hallazgos no respaldados por la imagen; el modo grounded con máscaras asociadas mitiga parcialmente este riesgo, pero no lo elimina.
- Sesgos: no se documentan análisis de sesgo demográfico, de equipamiento ni de protocolo de adquisición; el rendimiento puede variar según la distribución de los datos de entrenamiento.
- Uso clínico: no se declara validación regulatoria ni certificación como dispositivo médico; cualquier uso en entorno clínico requiere supervisión profesional y validación local.
- Licencia MIT: permite uso comercial, pero las atribuciones de componentes de terceros (Qwen3-VL, Med3DVLM, MONAI VISTA) deben revisarse en los avisos de terceros del proyecto.
- Contexto: la longitud de contexto no está especificada, lo que dificulta planificar conversaciones multi-turno largas o prompts extensos.
- Despliegue: no hay soporte documentado para servidores de inferencia estándar (vLLM, TGI), lo que limita su integración en producción a la implementación propia del proyecto.
- Reproducibilidad: la model card fija semilla 42 y ajustes de decodificación concretos; desviarse de ellos puede alterar los resultados de forma no documentada.

## Enlaces

- Hugging Face: https://huggingface.co/yolo2025666/HoloCT-8B
- HoloCT-4B en Hugging Face: https://huggingface.co/yolo2025666/HoloCT-4B
- Repositorio GitHub: https://github.com/2021xyl/HoloCT
- Demos del proyecto: https://github.com/2021xyl/HoloCT#demos
- Ejemplos de métricas de evaluación: https://github.com/2021xyl/HoloCT/blob/main/eval/README.md
- Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Med3DVLM: https://github.com/mirthAI/Med3DVLM
- MONAI VISTA: https://github.com/Project-MONAI/VISTA
