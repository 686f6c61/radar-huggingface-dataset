# xuhaodev/Qwen3-1.7B-Jev

## Resumen
Qwen3-1.7B-Jev es un adaptador LoRA con una cabeza de decisión escalar, desarrollado por xuhaodev, sobre el modelo base Qwen/Qwen3-1.7B. Está especializado en la clasificación de decisiones tipadas en el dominio del fútbol en chino, devolviendo respuestas de tipo Choice, Score y Noul a partir de un estado y preguntas definidas por el usuario, sin generación autorregresiva de texto. Es relevante porque ofrece un enfoque no generativo para decisiones estructuradas, con calibración por temperatura y métricas de evaluación publicadas, y porque demuestra cómo adaptar un transformer pequeño a una tarea de clasificación con restricciones de dominio. El repositorio contiene únicamente el adaptador y la cabeza, no el modelo base fusionado, y requiere un cargador específico.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-1.7B) con adaptador LoRA y cabeza de decisión escalar; no generativa |
| Parametros totales | 1.700 millones (base Qwen3-1.7B) + adaptador LoRA y cabeza escalar (tamaño del repo: 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens por candidato (límite del runtime); contexto del backbone no especificado en la información disponible |
| Tipos de cuantizacion | no disponible (el runtime probado usa FP32 en CPU; no se especifican cuantizaciones) |
| Idiomas soportados | chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, cabeza escalar) y PEFT; incluye tokenizer y archivos de calibración |

## Arquitectura y entrenamiento
El modelo parte del backbone Qwen3-1.7B, un transformer decoder, al que se le añade un adaptador LoRA de rango 16, alpha 32 y dropout 0,05, aplicado a las proyecciones de atención y MLP. La innovación principal es una cabeza de decisión escalar compartida que evalúa cada candidato de forma independiente: el serializador `candidate-chat-v1` presenta al modelo el estado, las instrucciones y la descripción de cada candidato por separado, sin que el modelo vea el conjunto completo de alternativas. No hay bucle de decodificación ni generación autorregresiva; las salidas son tensores y `output_tokens` es 0. La cabeza se inicializó a partir de la diferencia de vectores de salida sí/no del modelo preentrenado y luego se entrenó con LoRA.

El entrenamiento constó de dos etapas. La etapa 1 utilizó 15.136 preguntas de decisión convertidas a partir de evidencia histórica aprobada, con 1.892 pasos de optimizador (dos épocas). La etapa 2 empleó 5.600 preguntas de entrenamiento, que incluyen 3.600 contrastes sintéticos y 2.000 preguntas de repetición histórica, con 700 pasos adicionales (dos épocas). La validación, calibración y test de la etapa 2 contienen 1.020 preguntas cada uno. La evidencia histórica procede de la publicación de eventos Wyscout de las cinco grandes ligas europeas de 2017/18. Los objetivos se derivan de evidencia estructurada, no de prosa generada. Se usó entropía cruzada más 0,5 RPS para Score, con un batch efectivo de 16 grupos de preguntas. Las tasas de aprendizaje de la etapa 2 fueron 1e-5 para LoRA y 2e-5 para la cabeza escalar. El checkpoint se seleccionó sobre un subconjunto fijo de validación de 384 preguntas y las temperaturas se ajustaron en el split de calibración disjunto, restringidas a T>=1 en la etapa 2.

## Capacidades
- Clasificación de decisiones tipadas: Choice, Score y Noul.
- Cálculo de probabilidades completas y confianza definida como `1 - H(p)/log(K)`, una estadística de concentración.
- Evaluación independiente de cada candidato mediante una cabeza escalar compartida sobre el backbone Qwen.
- Soporte para hasta 255 opciones en Choice, 1–10 niveles en Score (2–10 recomendado), 128 preguntas por petición y 1 MB de petición serializada.
- Tareas cubiertas en el entrenamiento sintético: resultados, comparaciones de tiros, rúbricas numéricas personalizadas, clasificación de noticias, completitud de evidencia e identidades de jugadores.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso generativo.
- No es multilingüe: está orientado a chino.
- No genera texto: las salidas son tensores y `output_tokens` es 0.

## Casos de uso
- Análisis automatizado de resultados de partidos: dado un estado con marcador (por ejemplo, `home_score=2`, `away_score=1`) y preguntas de tipo Choice, el modelo devuelve la decisión de resultado (victoria local, empate, visitante) con probabilidades y confianza. Es adecuado para pipelines de estadísticas deportivas que necesitan decisiones tipadas y calibradas, no texto generado.
- Evaluación del rendimiento de un equipo: usando el tipo Score, se puede puntuar el rendimiento del equipo local según el marcador, con una media ponderada por probabilidad de los niveles definidos. Útil para generar métricas numéricas agregadas en informes post-partido.
- Clasificación de noticias deportivas: el modelo se entrenó con tareas sintéticas de clasificación de noticias, por lo que puede etiquetar noticias relacionadas con fútbol en categorías predefinidas, siempre que se formulen como preguntas tipadas.
- Verificación de completitud de evidencia: en un sistema de análisis, se puede preguntar si la evidencia proporcionada es suficiente para emitir una decisión. El modelo devuelve una probabilidad de "sí" (Noul) que ayuda a decidir si se necesita más información.
- Identificación de jugadores: a partir de descripciones o datos estructurados, el modelo puede resolver preguntas de identidad de jugadores, como se cubrió en las tareas sintéticas de entrenamiento.
- Rúbricas numéricas personalizadas: para comparar tiros, umbrales u otras métricas, se definen niveles y el modelo devuelve una puntuación calibrada. Adecuado para aplicaciones que requieren decisiones reproducibles y auditables.
- Integración como componente de decisión en sistemas mayores: al no ser generativo y devolver tensores, puede insertarse en un pipeline de datos que necesite clasificaciones rápidas y calibradas, con el cargador `qwen_jev.py` sobre PyTorch.

## Benchmarks y rendimiento
| Primitiva | Correctas / total | Precision | ECE (15 bins) |
|---|---:|---:|---:|
| Choice | 389 / 406 | 95,81% | 0,03854 |
| Score | 261 / 272 | 95,96% | 0,04007 |
| Noul | 332 / 342 | 97,08% | 0,02591 |
| Global | 982 / 1.020 | 96,27% | 0,03264 |

Métricas adicionales: NLL global 0,22138; Brier multiclase (suma sobre clases) 0,06500; MAE normalizado de Score 0,04120. Pruebas sintéticas adicionales autorreportadas por el desarrollador: 33/37 correctas (resultados negados 9/12, puntuación de resultados 11/12, noticias 4/4, umbrales 6/6, completitud de evidencia 3/3). Regresión original de seis casos: Choice, Noul y Score cada una 6/6; también pasó una prueba de selección de identidad con 255 candidatos. Estas pruebas no son anotación humana independiente y no establecen capacidad general. El conjunto de test congelado de la etapa 2 contiene 720 preguntas sintéticas y 300 de repetición histórica; son decisiones retrospectivas generadas por reglas, no un benchmark de predicción pre-partido.

## Requisitos de hardware
- VRAM estimada: para un modelo de 1,7B, aproximadamente 3,5 GB en FP16, 2 GB en INT8 y 1 GB en INT4. El model card no especifica requisitos oficiales de VRAM.
- GPU recomendadas: el entorno probado fue NVIDIA GB10. Cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16; por ejemplo, RTX 3050, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en la mayoría de GPU modernas con 4 GB o más. También hay soporte de CPU con FP32 (`device="cpu"`), aunque el rendimiento reportado es solo para GPU.
- Opciones de despliegue: no es compatible directamente con vLLM, llama.cpp, Ollama o TGI, ya que requiere el cargador personalizado `qwen_jev.py` sobre PyTorch. El entorno probado fue Python 3.12, PyTorch 2.14.0+cu130, Transformers 5.16.1 y PEFT 0.20.0.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se han identificado modelos comparables directos en la información disponible. La alternativa más cercana es el modelo base sobre el que se construye.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Qwen3-1.7B-Jev (este) | 1,7B + LoRA y cabeza escalar | 2.048 tokens por candidato (límite del runtime) | Clasificador no generativo de decisiones tipadas | apache-2.0 | HuggingFace (xuhaodev) |
| Qwen/Qwen3-1.7B | 1,7B | no especificado en la información | Modelo generativo (decoder) | apache-2.0 | HuggingFace (Qwen) |

## Limitaciones y advertencias
- Modelo de dominio específico: solo fútbol y chino; no es un modelo de propósito general.
- No es generativo: no produce texto; devuelve tensores y estructuras tipadas.
- Requiere un cargador personalizado (`qwen_jev.py`); no funciona con `pipeline('text-classification')` estándar ni con `AutoModel.from_pretrained` directamente.
- Límites del runtime: 2.048 tokens por candidato, 255 opciones Choice, 1–10 niveles Score, 128 preguntas por petición y 1 MB de petición serializada.
- El estado se repite para cada candidato; no hay codificación de estado compartida.
- La confianza es una estadística de concentración, no una probabilidad de acierto verificada.
- Los datos de entrenamiento provienen de las cinco grandes ligas europeas 2017/18 (Wyscout); puede haber sesgos temporales y geográficos.
- Los conjuntos de validación, calibración y test contienen 1.020 preguntas cada uno, pero las tareas sintéticas comparten familias de reglas, lo que puede inflar el rendimiento.
- Las pruebas adicionales son autorreportadas y no son anotación humana independiente.
- El benchmark no es una predicción pre-partido; son decisiones retrospectivas generadas por reglas.
- Licencia apache-2.0 permite uso comercial, pero el proyecto es independiente y no está afiliado a TypeSafe ni es el modelo Jev oficial.
- No se han publicado comparativas con otros modelos en la información disponible.

## Enlaces
- HuggingFace: https://huggingface.co/xuhaodev/Qwen3-1.7B-Jev
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- No se proporcionan enlaces a papers, blogs o repositorios adicionales en la información disponible.
