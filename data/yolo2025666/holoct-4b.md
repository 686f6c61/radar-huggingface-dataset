# yolo2025666/HoloCT-4B

## Resumen

HoloCT-4B es un modelo fundacional 3D para tomografía computarizada (TC) que unifica la interpretación de volúmenes CT y la segmentación en un único sistema. Lo desarrolla el grupo Alibaba DAMO Academy y forma parte de la familia HoloCT, de la que este modelo es la variante pequena (existe también una versión HoloCT-8B). El modelo resuelve el problema de conectar la comprensión global de un volumen CT completo con información espacial de grano fino: recibe un volumen CT en formato NIfTI y un prompt en inglés, y devuelve texto (hallazgos, respuestas a preguntas, informes) y, cuando se solicita grounding, máscaras binarias 3D a nivel de vóxel.

La arquitectura combina un backbone de lenguaje Qwen3-VL-4B con un codificador global derivado de Med3DVLM, un codificador detallado derivado de VISTA3D y un decodificador de máscaras 3D. El modelo tiene 4.677.844.560 parámetros (aproximadamente 4,7 mil millones) y se distribuye en formato safetensors con licencia MIT. Es relevante porque aborda de forma unificada tareas que normalmente requieren pipelines separados (detección de lesiones, VQA radiológica, generación de informes y segmentación guiada por lenguaje), y porque el grounding textual permite enlazar cada hallazgo descrito en el texto con una máscara 3D concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida multimodal 3D: backbone de lenguaje Qwen3-VL-4B + codificador global (Med3DVLM) + codificador detallado (VISTA3D) + decodificador de máscaras 3D |
| Parametros totales | 4.677.844.560 (≈4,7 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (inferencia en bfloat16 segun model card) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

HoloCT-4B emplea una arquitectura multimodal de dos escalas para TC 3D. Un codificador global, derivado de Med3DVLM, captura la comprensión de volumen completo; un codificador detallado, derivado de VISTA3D, aporta información espacial de grano fino. Ambos se conectan a un backbone de lenguaje Qwen3-VL-4B y a un decodificador de máscaras 3D, de modo que el modelo puede generar texto y, en peticiones de grounding, producir máscaras binarias 3D asociadas a tokens `<SEG>`.

La entrada es un volumen CT 3D en formato NIfTI expresado en unidades Hounsfield, junto con un prompt en inglés. La inferencia se realiza en precisión bfloat16 mediante la implementación del proyecto HoloCT, que carga el checkpoint a través de sus clases de modelo y procesador CT. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; esa información no está disponible en los datos proporcionados.

## Capacidades

- Interpretación unificada de CT: detección de lesiones (screening), visual question answering (VQA) y generación de informes a partir de prompts de texto.
- Generación de texto con grounding: produce hallazgos textuales y las máscaras 3D correspondientes a cada hallazgo.
- Segmentación guiada por lenguaje: segmenta objetivos anatómicos y hallazgos descritos en texto libre.
- Inferencia emparejada: permite comparar respuestas con grounding y sin grounding sobre el mismo volumen CT.
- Generación de máscaras binarias 3D: cada token `<SEG>` genera una máscara en formato NIfTI (`mask_000.nii.gz`, `mask_001.nii.gz`, etc.).
- Capacidades multilingües: solo inglés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, visión 2D, audio: no disponible en la información proporcionada.

## Casos de uso

- Detección automatizada de lesiones hepáticas: el modelo recibe un volumen CT y un prompt como "Is there a liver lesion?" y devuelve una respuesta textual; con el prompt de grounding añadido, genera además la máscara 3D de la lesión, lo que permite revisión radiológica asistida.
- Generación de informes radiológicos: a partir de un volumen CT, el modelo produce texto de informe (evaluación de RadGenome y ReXGrounding según la model card), útil para pre-rellenar borradores que el radiólogo revisa.
- Segmentación de órganos guiada por texto: prompts como "Segment the liver in this CT scan" producen máscaras 3D de órganos concretos, integrables en flujos de planificación quirúrgica o volumetría.
- Segmentación por referencia a hallazgos: permite segmentar una estructura descrita en lenguaje natural (finding-level referring segmentation), útil en estudios longitudinales donde se quiere seguir la evolución de una lesión concreta.
- Control de calidad y triaje: el screening de lesiones con respuestas emparejadas (grounded/ungrounded) permite comparar la coherencia del modelo y priorizar estudios para lectura.
- Investigación clínica y anotación asistida: el grounding texto-máscara facilita generar anotaciones 3D a nivel de vóxel para construir datasets de investigación, con validación humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona ejemplos de métricas de una sola muestra (Dice, HD95, decisiones de screening, solapamiento de texto, puntuaciones de texto clínico y calidad de informes con grounding a nivel de hallazgo) en el repositorio de evaluación, pero no se proporcionan cifras agregadas ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,7 mil millones de parámetros en bfloat16, los pesos ocupan aproximadamente 9,4 GB, a lo que hay que sumar el codificador 3D, el decodificador de máscaras y las activaciones del volumen CT.
- GPU recomendadas: se requiere una GPU NVIDIA compatible con bfloat16; la model card indica ejecución en una única GPU visible con PyTorch SDPA.
- ¿Cabe en GPU consumer? No confirmado en la información disponible; el tamaño de pesos en bf16 (≈9,4 GB) sugiere que podría caber en GPUs consumer de gama alta con VRAM suficiente, pero el consumo total incluyendo codificadores y activaciones no está documentado.
- Opciones de despliegue: implementación propia del proyecto HoloCT (PyTorch 2.6.0, torchvision 0.21.0, CUDA 12.4); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HoloCT-4B | ≈4,7 mil millones | no disponible | MIT | Hugging Face (yolo2025666/HoloCT-4B) | Variante pequena de la familia HoloCT |
| HoloCT-8B | no disponible | no disponible | MIT (segun badge de la model card) | Hugging Face (Alibaba-DAMO-Academy/HoloCT-8B) | Variante grande de la misma familia |
| Med3DVLM | no disponible | no disponible | no disponible | no disponible | Codificador global del que deriva HoloCT |
| VISTA3D | no disponible | no disponible | no disponible | no disponible | Codificador detallado del que deriva HoloCT |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: el modelo genera texto libre a partir de volúmenes CT; los hallazgos deben validarse clínicamente, especialmente en informes generados.
- Limitaciones de contexto o idioma: solo se documenta inglés; no se especifica la longitud de contexto ni el tamaño máximo de volumen CT admitido.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero al tratarse de un modelo médico se requiere validación regulatoria y clínica antes de cualquier uso en producción sanitaria.
- Caveats para producción: la inferencia requiere la implementación propia del proyecto HoloCT (no hay soporte documentado en vLLM, llama.cpp, Ollama o TGI); las máscaras se umbralizan a 0,5 tras transformación inversa; los demos usan 1024 tokens nuevos como máximo y semilla 42; la generación de informes usa temperatura 0,15, top-p 0,85 y penalización de repetición 1,15, mientras que screening, VQA y segmentación usan decodificación greedy.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yolo2025666/HoloCT-4B
- Repositorio GitHub HoloCT: https://github.com/alibaba-damo-academy/HoloCT
- HoloCT-8B en Hugging Face: https://huggingface.co/Alibaba-DAMO-Academy/HoloCT-8B
- Preprint arXiv: https://arxiv.org/abs/2611.06471
- Ejemplos de métricas de evaluación: https://github.com/alibaba-damo-academy/HoloCT/blob/main/eval/README.md
- Sección de demos del repositorio: https://github.com/alibaba-damo-academy/HoloCT#demos
