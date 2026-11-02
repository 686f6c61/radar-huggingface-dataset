# thestarfarer/Ministral-3-14B-pocket-rp-judge

## Resumen

Ministral-3-14B Pocket RP-Judge es un adaptador LoRA de tarea única desarrollado por el usuario thestarfarer, diseñado para actuar como juez automático de ventanas de roleplay de foro. Se construye sobre el modelo base mistralai/Ministral-3-14B-Base-2512 y destila el comportamiento de evaluación de un modelo comercial frontera no identificado, que etiquetó 122.350 ventanas de entrenamiento de roleplay según una rúbrica de siete ejes. El adaptador trasplanta ese criterio a un modelo local de 14.000 millones de parámetros, eliminando la dependencia de una API de pago.

El modelo resuelve un problema concreto de filtrado de datos: clasificar y puntuar muestras de roleplay para seleccionar las de mayor calidad en pipelines de curación de datasets. Recibe como entrada una ventana de 512 tokens y devuelve una línea JSON con siete campos de veredicto (own_side, pure_rp, speaker_names, prose_quality, coherent, english, questionable). Según la model card, alcanza unas 35.000 evaluaciones por hora en una sola A100, frente al coste por token de una API comercial.

La relevancia actual reside en su enfoque de destilación de criterio subjetivo y en la técnica de lectura de probabilidades para recuperar muestras de alta calidad que el argmax infravalora. El adaptador tiene un tamaño de repositorio de 0,5 GB, licencia Apache 2.0 y está publicado en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r32/α64, rsLoRA) sobre transformer Mistral (modelo base Ministral-3-14B-Base-2512) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 14B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 640 tokens en entrenamiento; inferencia probada a 512, 1024 y 2048 (estas dos últimas provisionales) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el base admite cuantización estándar) |
| Idiomas soportados | Inglés (ventanas de roleplay de foro en inglés únicamente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con alpha 64 y escalado rsLoRA, aplicado sobre el modelo base Mistral de 14.000 millones de parámetros. El entrenamiento utilizó 112.129 pares (ventana → veredicto), con una muestra por turno, una cabecera de tarea fija de 15 tokens y las claves del veredicto en orden fijo. Se mantuvo la distribución natural de notas sin sobremuestreo, con el argumento de que la calibración de un selector vale más que su recall. Se reservaron 10.221 pares para validación, divididos a nivel de conversación para evitar fuga de hilos o autores entre entrenamiento y test.

Los hiperparámetros fueron: learning rate constante de 1e-5, una época (7.009 pasos), contexto de 640 tokens, precisión bf16, una A100 de 40 GB y aproximadamente 7,5 horas de entrenamiento. La innovación técnica destacable no está en la arquitectura sino en la estrategia de lectura: en lugar de usar el argmax sobre el dígito de prose_quality, se leen las probabilidades de los tokens en esa posición y se puntúa cada muestra por P(5)+P(6)+P(7). Esto recupera el recall de las muestras mejor valoradas por el profesor, que el argmax infravaloraba sistemáticamente.

## Capacidades

- Evaluación de ventanas de roleplay de foro: emite un veredicto JSON con siete campos (own_side, pure_rp, speaker_names, prose_quality de 0 a 7, coherent, english, questionable).
- Puntuación de calidad de prosa: el eje prose_quality permite ordenar muestras por calidad literaria según la rúbrica del profesor.
- Detección de rol puro: el campo pure_rp identifica si la ventana mantiene la coherencia de personaje.
- Identificación de hablantes: el campo speaker_names verifica los nombres de los interlocutores.
- Filtrado de contenido cuestionable: el campo questionable marca muestras problemáticas.
- Recuperación de alta calidad mediante lectura de logprobs: permite rankear muestras por P(5)+P(6)+P(7) en lugar de por argmax.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking; es un juez de tarea única.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Curación de datasets de roleplay: el modelo puntúa ventanas de 512 tokens y permite filtrar las de mayor prose_quality antes de entrenar un modelo generativo, reduciendo el ruido en el corpus. Es adecuado porque su calibración agregada (tasa de aprobación del 48,5 % frente al 48,2 % del profesor en corpus adyacente) se transfiere a datos no vistos.
- Ranking de muestras para anotación humana: usando la lectura por P(5+), se seleccionan las 1.500 mejores muestras de un lote y se envían a revisión humana, recuperando el 93 % de las que el profesor consideraría de grado 5 o superior.
- Filtrado previo a un re-ranker más potente: el adaptador actúa como etapa de recuperación (top 29 % contiene todas las muestras de grado 5 del profesor) y un modelo mayor refina después, abaratando el pipeline.
- Monitorización de calidad en producción de contenido conversacional: se evalúan ventanas generadas por un modelo de roleplay en producción para detectar degradación de coherencia o de calidad de prosa.
- Detección de contenido fuera de personaje: el campo pure_rp permite marcar ventanas donde el modelo rompe el rol, útil en sistemas de roleplay con personajes persistentes.
- Etiquetado masivo a bajo coste: con ~35.000 veredictos por hora en una A100, se pueden etiquetar decenas de miles de ventanas en menos de dos horas, como demuestra el procesamiento de 42.679 ventanas en 80 minutos con solo 4 fallos de parseo.
- Auditoría de sesgos de estilo: al comparar la distribución de notas del juez con la del profesor, se detectan desviaciones en la calibración de la rúbrica.

## Benchmarks y rendimiento

Datos de acuerdo con el profesor en el conjunto de validación (10.221 pares, contexto 512):

| Eje | Métrica | Valor |
|---|---|---|
| Salidas malformadas | Porcentaje | 0,00 % |
| Decisión PASS (flags limpios y pq≥3) | F1 | 0,804 (precisión 0,821 / recall 0,788) |
| prose_quality | Exactitud | 0,701 |
| prose_quality | Acierto a ±1 | 0,998 |
| prose_quality | QWK | 0,820 |
| prose_quality | MAE | 0,301 |
| pure_rp | Kappa de Cohen | 0,890 |
| questionable | Kappa de Cohen | 0,816 |
| own_side | Kappa de Cohen | 0,437 (eje más débil) |
| speaker_names | Coincidencia laxa por código | 0,838 |

Recall de las muestras de grado 5 o superior del profesor según la lectura por P(5+):

| Top-N por P(5+) | Recall de cincos del profesor | Precisión |
|---|---|---|
| 461 (= número de cincos del profesor) | 48 % | 48 % |
| 1.000 | 80 % | 37 % |
| 1.500 | 93 % | 28 % |
| 3.000 | 100 % | 15 % |

Medias de nota: estudiante 2,77 frente a profesor 2,86. Los errores se concentran en la frontera 2/3 ("funcional pero plano" frente a "pasable"). El argmax recupera solo el 22 % de las muestras de grado 5 o superior del profesor; la lectura por probabilidades corrige esta conservadurismo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el entrenamiento usó una A100 de 40 GB con bf16 y contexto 640. Para inferencia con el modelo base de 14B en bf16 se estiman del orden de 28 GB de pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: A100 de 40 GB (configuración validada por el autor para entrenamiento y producción). Para inferencia, GPU con al menos 24-32 GB de VRAM en función de la cuantización.
- Cabe en GPU de consumo: no confirmado en la información disponible; con cuantización de 4 bits del modelo base podría caber en RTX 4090 (24 GB), pero no hay validación publicada del adaptador en ese entorno.
- Opciones de despliegue: vLLM con soporte LoRA (enable_lora=True, max_lora_rank=32, max_model_len=1536, dtype bfloat16) es la vía documentada. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~35.000 veredictos por hora en una A100; 42.679 ventanas procesadas en 80 minutos con 4 fallos de parseo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral-3-14B Pocket RP-Judge | 14B (base) + LoRA r32 | 640 entrenamiento; 512 validado | Juez de roleplay de 7 ejes | Apache 2.0 | HuggingFace |
| Modelo profesor (comercial, no identificado) | No disponible | No disponible | Juez de roleplay de 7 ejes | Comercial (API de pago) | API |
| Ministral-3-14B-Base-2512 | 14B | No disponible | Modelo base generativo | No disponible | HuggingFace |

No se dispone de datos de benchmarks de modelos juez comparables de código abierto en la información proporcionada. La comparativa se limita al modelo profesor (referencia de calidad, sin datos de arquitectura) y al modelo base sobre el que se aplica el adaptador.

## Limitaciones y advertencias

- Solo procesa ventanas de roleplay de foro en inglés; no se ha validado para otros idiomas ni otros dominios.
- Calibrado contra la rúbrica y los gustos de un único profesor comercial no identificado; puede heredar sesgos de ese profesor.
- El argmax es conservador en las notas altas: recupera solo el 22 % de las muestras de grado 5 o superior del profesor. Es obligatorio usar la lectura por P(5)+P(6)+P(7) para selección de alta calidad.
- El eje own_side es el más débil (kappa 0,437), por lo que sus predicciones sobre ese campo deben tratarse con cautela.
- La calibración en ventanas de 1024 y 2048 tokens está pendiente de validación por el profesor; las etiquetas a esas longitudes son provisionales.
- Los errores se concentran en la frontera entre nota 2 y 3, la más poblada y menos consecuente de la rúbrica.
- No soporta tool calling, agentes, visión ni audio; es un juez de tarea única.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Ministral-3-14B-Base-2512 tiene su propia licencia que debe verificarse por separado.
- Riesgo de alucinación en los campos de veredicto no validado explícitamente; la tasa de salidas malformadas es del 0,00 % en validación, pero no se documenta la tasa de veredictos semánticamente incorrectos fuera de la distribución de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/thestarfarer/Ministral-3-14B-pocket-rp-judge
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Base-2512
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
