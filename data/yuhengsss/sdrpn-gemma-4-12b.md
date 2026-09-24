# YuhengSSS/SDRPN-Gemma-4-12B

## Resumen

SDRPN-Gemma-4-12B es un checkpoint de investigación publicado por YuhengSSS (Shi Yuheng y colaboradores) que implementa la etapa 1 del método SD-RPN (*Self-Distilled RoI Predictor*), un mecanismo de propuesta de regiones de interés (RoI) para modelos multimodales de percepción visual fina. El modelo parte del backbone congelado y sin encoder visual `google/gemma-4-12B-it`, sobre el que se añaden tres bloques auxiliares (*twig*, con K = 27 y T = 3) que aprenden a predecir mapas de calor de atención y a recortar subimágenes relevantes. Solo se entrenan esos bloques; los pesos del backbone permanecen intactos respecto al modelo base.

El problema que resuelve es concreto: los modelos visión-lenguaje tienden a degradarse cuando la información relevante ocupa una fracción pequeña de una imagen de alta resolución. SD-RPN genera propuestas de región que permiten pasar de una fuente de 1120 tokens visuales a recortes de aproximadamente 256 tokens, lo que mejora la percepción de detalle sin aumentar linealmente el coste computacional. Las etiquetas de entrenamiento de esta etapa son pseudo-etiquetas autodestiladas a partir de la atención del propio backbone, sin anotación humana de RoI.

Se trata de un artefacto intermedio: es la inicialización del entrenamiento por refuerzo a nivel de región `YuhengSSS/VisionRL2-Gemma-4-12B` (etapa 2). Con 12.649.872.435 parámetros totales y un repositorio de 26,7 GB, su relevancia actual es fundamentalmente académica: sirve para reproducir los resultados del *paper* Vision-RL² y como punto de partida para quien quiera continuar el *pipeline* de RL. No es un modelo listo para producción con herramientas estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer multimodal Gemma 4 de Google (congelado, sin encoder visual) mas bloques *twig* de prediccion de RoI (K = 27, T = 3); codigo de modelado propio en el repositorio VisionRL2 |
| Parametros totales | 12.649.872.435 |
| Parametros activos | no disponible (no se indica que la arquitectura sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos completos en safetensors y el delta en `.pt`; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en el repositorio; el backbone deriva de `google/gemma-4-12B-it`, cuyos terminos deben verificarse aparte) |
| Formato de pesos | safetensors (`model-0000*-of-00002.safetensors`, `model.safetensors.index.json`) y delta PyTorch `twig_delta/twig_delta_final.pt` (~1,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es un *wrapper* sobre `google/gemma-4-12B-it` descrito como "encoder-free", es decir, sin torre de visión separada. Sobre el backbone congelado se injertan tres bloques *twig* que constituyen la cabeza de propuesta de RoI: un *heatmap head*, una puerta relativa al pico (*peak-relative gate*), un recorte por componentes conexos y un empalme de subimagen (*sub-image splice*). Esa ruta de *gating* vive en las clases del repositorio `YuHengsss/VisionRL2` y no en un `AutoModel` estándar, por lo que el checkpoint no es cargable para inferencia de RoI con las APIs habituales de Transformers. La configuración declarada es K = 27 y T = 3, con una fuente de 1120 tokens visuales y un objetivo de recorte de 256 tokens.

El entrenamiento de esta etapa 1 es de autodestilación: las etiquetas de RoI son pseudo-etiquetas derivadas de la atención del propio modelo base, sin anotación humana. Solo se optimizan los tres bloques *twig*; el backbone permanece congelado. El *driver* de la etapa 1 produce un delta que un paso posterior de *assemble* convierte en el directorio completo, y ambos artefactos se publican. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la etapa 2 (RL a nivel de región) se entrena por separado y da lugar a `YuhengSSS/VisionRL2-Gemma-4-12B`.

## Capacidades

- Generación de texto e imagen-texto (*pipeline* `image-text-to-text`), heredada del backbone Gemma 4 12B-it, que permanece congelado.
- Predicción de regiones de interés: genera un mapa de calor de atención y propone recortes de región sobre imágenes de alta resolución.
- Recorte denso de subimágenes y empalme en la secuencia de entrada, con objetivo de 256 tokens por recorte frente a 1120 tokens de la fuente completa.
- Percepción visual fina: los resultados declarados muestran mejoras sobre el base en V*, ZoomBench, HR-4K, HR-8K, MME-RW Lite e InfoVQA.
- Modo conversacional (etiqueta `conversational` en el repositorio).
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modos especiales (*thinking*, audio, etc.): no disponible.

## Casos de uso

- Reproducción académica del *paper* Vision-RL²: cargar el checkpoint con el *harness* del repositorio y ejecutar `scripts/aligned_eval_gemma4.sh` para verificar las cifras publicadas (por ejemplo, 66,1 de media con recorte denso).
- Inicialización del entrenamiento por refuerzo de etapa 2: usar este checkpoint como `PHASE_A_CKPT` en `scripts/train_rl_gemma4_12b.sh` para continuar hacia el modelo de RL a nivel de región, evitando partir de cero.
- Investigación sobre propuesta de regiones sin supervisión humana: el modelo está entrenado con pseudo-etiquetas autodestiladas, así que es un banco de pruebas directo para estudiar calidad de RoI sin coste de anotación.
- Comprensión de documentos e infografías de alta resolución: el recorte de regiones permite aislar tablas, gráficos o bloques de texto denso en imágenes grandes, el escenario evaluado por InfoVQA (78,3 frente a 76,4 del base).
- Análisis de imágenes con detalle fino en 4K y 8K: los incrementos declarados en HR-4K (72,9 frente a 67,1) y HR-8K (71,1 frente a 61,8) apuntan a usos en inspección visual, teledetección o imagen médica donde el objeto relevante ocupa pocos píxeles.
- Generación de pseudo-etiquetas de región para otros modelos: el mapa de calor y los recortes producidos pueden actuar como anotador automático en *pipelines* de datos de visión.
- *Benchmarking* de mecanismos de atención visual: sirve como referencia para comparar estrategias de recorte denso frente a disperso antes de invertir en el ciclo completo de RL.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la propia *model card*, medidos con el protocolo alineado con el entrenamiento (métricas de reglas, sin juez), nivel de fuente 1120. Se reproduce la tabla publicada:

| Modelo | V* | ZoomBench | HR-4K | HR-8K | MME-RW Lite | InfoVQA | Media |
|---|---|---|---|---|---|---|---|
| Gemma-4-12B-it (base) | 69,6 | 43,9 | 67,1 | 61,8 | 47,3 | 76,4 | 61,0 |
| SD-RPN (etapa 1), recorte denso, este checkpoint | 75,4 | 50,9 | 72,9 | 71,1 | 48,1 | 78,3 | 66,1 |
| Vision-RL² (etapa 2), recorte disperso | 82,2 | 56,2 | 77,6 | 73,4 | 51,0 | 79,1 | 69,9 |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa: el repositorio ocupa 26,7 GB, con lo que en fp16/bf16 se necesitan del orden de 25-27 GB solo para los pesos, más activaciones y memoria del *runtime* multimodal.
- Con 12,65 mil millones de parámetros, una GPU de 24 GB (RTX 4090, L4) no es suficiente para cargar el modelo sin cuantizar, y no hay versiones cuantizadas publicadas (ni GGUF, ni AWQ, ni GPTQ).
- GPU recomendadas: A100 de 40 GB u 80 GB, H100, o tarjetas de 48 GB en adelante (L40S, A6000 Ada). El ejemplo de entrenamiento de etapa 2 del autor usa `GPU_IDS=0,1`, es decir, al menos dos GPU.
- No cabe en GPU de consumo sin cuantización, y al no existir pesos cuantizados ni soporte en cargadores estándar, no hay vía práctica de despliegue en equipos de consumo con esta publicación.
- Opciones de despliegue: únicamente el código de modelado y el *harness* de evaluación de `YuHengsss/VisionRL2`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, porque la ruta de *gating* de RoI (cabeza de mapa de calor, puerta relativa al pico, recorte por componentes conexos y empalme de subimagen) no existe en un `AutoModel` estándar.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media (protocolo alineado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SDRPN-Gemma-4-12B (etapa 1) | 12,65 mil millones | no disponible | 66,1 | apache-2.0 (declarada) | Pesos en safetensors + delta `.pt`; requiere VisionRL2 |
| Vision-RL² (etapa 2, `YuhengSSS/VisionRL2-Gemma-4-12B`) | no disponible (deriva del mismo backbone) | no disponible | 69,9 (recorte disperso) | no disponible en la información consultada | No detallada en esta busqueda |
| google/gemma-4-12B-it (base) | 12 mil millones aprox. (el checkpoint aqui tiene 12,65 mil millones) | no disponible | 61,0 | no disponible en la información consultada | Modelo original de Google en HuggingFace |

## Limitaciones y advertencias

- No es un modelo autónomo utilizable: necesita las clases de modelado de `YuHengsss/VisionRL2`; una llamada a `AutoModel` o `AutoModelForCausalLM` no reproduce el comportamiento de RoI.
- Es un checkpoint intermedio de etapa 1, no el resultado final del método. Su sucesor de etapa 2 obtiene 69,9 de media frente a 66,1 de este, así que usarlo como modelo final infravalora el enfoque completo.
- Los *benchmarks* disponibles están medidos con el protocolo alineado al entrenamiento del propio autor, con métricas de reglas y sin juez; no son directamente comparables con evaluaciones externas de terceros.
- Riesgo de alucinación: heredado del backbone Gemma 4 12B-it, sin cambios en los pesos de este; los bloques *twig* no corrigen ese comportamiento, solo seleccionan regiones.
- Idiomas soportados no especificados en la información disponible; no se puede asumir cobertura multilingüe más allá de la del backbone.
- Limitaciones de contexto: la longitud de contexto del modelo no se documenta, y el mecanismo asume una fuente de 1120 tokens visuales con recortes de 256 tokens, lo que condiciona el rango de resoluciones tratadas.
- Licencia: el repositorio declara apache-2.0, pero el modelo deriva de `google/gemma-4-12B-it`, sujeto a los términos propios de la familia Gemma. Conviene verificar la compatibilidad antes de cualquier uso comercial.
- Adopción mínima: 3 descargas y 0 *likes* en el momento de la consulta, con publicación el 24 de septiembre de 2026. No hay evidencia de uso en producción ni de validación independiente.
- Los datos de entrenamiento son pseudo-etiquetas generadas por el propio backbone, por lo que los sesgos del modelo base se propagan a la selección de regiones sin filtro humano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YuhengSSS/SDRPN-Gemma-4-12B
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Checkpoint de etapa 2 (RL a nivel de región): https://huggingface.co/YuhengSSS/VisionRL2-Gemma-4-12B
- Repositorio de código: https://github.com/YuHengsss/VisionRL2
- Documentación de Gemma 4 en el repositorio: https://github.com/YuHengsss/VisionRL2/blob/main/docs/GEMMA4.md
- Dataset (corpus SD-RPN, pools de RL y mapas de evidencia): https://huggingface.co/datasets/YuhengSSS/VisionRL2-data
- Colección: https://huggingface.co/collections/YuhengSSS/visionrl2
- Página del proyecto: https://yuhengsss.github.io/VisionRL2/
- Paper Vision-RL²: https://arxiv.org/abs/2609.19745
- Paper SD-RPN: https://arxiv.org/abs/2509.16944
- Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
