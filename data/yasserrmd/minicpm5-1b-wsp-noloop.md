# yasserrmd/MiniCPM5-1B-WSP-NoLoop

## Resumen

MiniCPM5-1B-WSP-NoLoop es una edición de pesos del modelo openbmb/MiniCPM5-1B publicada por el usuario yasserrmd en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning, sino de una modificación directa y quirúrgica de los pesos del modelo base mediante una técnica que el autor denomina Weight-Space Programming (WSP). El objetivo concreto es eliminar los bucles de repetición degenerativos: casos en los que el modelo vuelve a emitir la misma frase o bloque de texto hasta agotar el presupuesto de tokens.

La intervención consiste en silenciar 64 neuronas MLP (el 0,058% de las 110.592 neuronas MLP del modelo) poniendo a cero sus columnas en `mlp.down_proj.weight`, concentradas mayoritariamente en las capas 7 a 14. No hay entrenamiento, ni datos de ajuste, ni hooks en tiempo de inferencia; la arquitectura y el formato de fichero son idénticos a los del modelo base, por lo que se ejecuta en cualquier entorno donde funcione MiniCPM5-1B.

La relevancia de esta ficha es doble: por un lado, documenta una receta de edición de pesos reproducible y reversible (el script `apply_patch.py --revert` restaura los pesos originales bit a bit); por otro, cuantifica el compromiso entre eliminar bucles y preservar capacidades, con datos de perplejidad, GSM8K y copia literal. Es un caso de estudio útil para quienes despliegan modelos pequeños en local con decodificación greedy o de baja temperatura, donde los bucles son especialmente problemáticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de openbmb/MiniCPM5-1B; detalles internos no disponibles) |
| Parametros totales | 1.080.632.832 (1,08 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; compatible con las cuantizaciones que acepte el modelo base) |
| Idiomas soportados | Ingles y chino (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (arquitectura `llama` en Transformers) |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura del base openbmb/MiniCPM5-1B, un transformer decoder-only de 1,08 mil millones de parámetros. La model card no detalla la composición del dataset de preentrenamiento ni el número de tokens, y esta información no está disponible en los materiales consultados. Lo que sí se documenta es el proceso de ajuste del base: existe un checkpoint SFT (MiniCPM5-1B-SFT) y un checkpoint final tras RL más OPD (on-policy distillation), y el autor señala que el defecto de repetición está presente ya en el SFT y persiste tras el RL, por lo que revertir hacia el SFT lo agravaría.

La innovación técnica no está en el entrenamiento sino en el método de edición. El autor construye un conjunto de contraste a partir de las propias salidas fluidas del modelo: toma una frase S, construye el contexto con S escrita una vez y luego dos veces, y define como objetivo de reparación la log-probabilidad de reemitir S, mientras protege como objetivos la siguiente frase verdadera, las respuestas de copia literal en contexto y las soluciones de referencia de GSM8K. Sobre cada neurona MLP calcula gradient x activation para estimar cuánto reduce la probabilidad de repetición al anularla frente a cuánto desplaza los objetivos protegidos, ordena por beneficio menos dos veces el daño y valida el top-k con ablación real. Se probaron y descartaron enfoques alternativos: eliminar la dirección residual de "modo copia" aumentaba la repetición (actúa como señal interna de "ya lo he dicho"), amplificarla costaba tanta fluidez como la que ahorraba, y escalar las cabezas de atención de inducción rompía el seguimiento de formato y la copia literal. La edición final silencia 64 neuronas (k=64); con k=128 empezaban a degradarse la copia y las matemáticas.

## Capacidades

- Generación de texto en inglés y chino con el mismo perfil de capacidades que el modelo base MiniCPM5-1B.
- Razonamiento de sentido común y matemáticas básicas: el modelo base obtiene un 65,0% en GSM8K con 60 problemas y 768 tokens, y la edición mantiene exactamente esa cifra.
- Modo "think" (razonamiento explícito) heredado del base; en 32 prompts con 1200 tokens los bucles duros bajan de 3 a 1.
- Copia literal y copia en contexto: 92,5% en copia literal de frases a petición y 86,7% en búsqueda de código en contexto (frente a 85,8% del base).
- Generación de código en la medida en que lo soporte el modelo base; no hay benchmarks de código publicados en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada para este modelo; debe consultarse la model card del base.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el modo think es el mecanismo más cercano documentado.
- Capacidad destacada específica: supresión de bucles de repetición a nivel de frase y bloque bajo decodificación greedy o de baja temperatura.

## Casos de uso

- Despliegue local con decodificación greedy: en entornos de inferencia con temperatura 0 o muy baja, donde el modelo base producía bucles duros en 17 de 120 prompts de estrés, esta edición los reduce a 1 de 120. Es el escenario donde la ganancia es mayor.
- Herramientas y pipelines de agente con salida estructurada: al reducir la tasa de "sin end-of-sequence dentro del presupuesto" del 50,0% al 34,2%, disminuye el riesgo de que una llamada de herramienta se quede colgada reemitiendo texto y agote el timeout.
- Generación de texto largo en local: con 1024 tokens nuevos, la tasa de salidas degeneradas baja del 19,2% al 2,5% y las frases duplicadas del 7,1% al 0,4%, lo que mejora la calidad de resúmenes, descripciones y respuestas extensas sin post-procesado.
- Evaluación y benchmarking de modelos pequeños: sirve como control experimental para estudiar cómo una edición mínima de pesos afecta a perplejidad (+1,1% en WikiText-2) y a capacidades downstream, con un script de reversión que permite comparar base y editado sobre los mismos pesos.
- Investigación en interpretabilidad y edición de modelos: el conjunto `neurons.json` con los 64 pares (capa, neurona) y el script `apply_patch.py` con opción `--scale` (0,0 a 1,0) permiten reproducir el experimento y estudiar ediciones parciales del efecto.
- Asistente conversacional ligero en inglés o chino: con 1,08 B de parámetros y licencia Apache 2.0, es desplegable en hardware modesto para chat de dominio acotado, siempre que se acepten las limitaciones de un modelo de este tamaño.
- Generación aumentada por recuperación con copia literal: la capacidad de copiar frases exactas se mantiene al 92,5%, lo que permite tareas de extracción y citación de fragmentos recuperados sin degradación respecto al base.

## Benchmarks y rendimiento

Conjunto de estrés propenso a bucles (120 prompts no vistos, 1024 tokens nuevos, decodificación greedy):

| Metrica | Base | WSP-NoLoop |
|---|---|---|
| Bucles duros | 17 / 120 | 1 / 120 |
| Salidas degeneradas (frase 3x o bucle de cola) | 19,2% | 2,5% |
| Frases duplicadas | 7,1% | 0,4% |
| 4-gramas repetidos | 0,162 | 0,074 |
| Sin end-of-sequence dentro del presupuesto | 50,0% | 34,2% |

Comprobaciones de capacidad:

| Prueba | Base | WSP-NoLoop |
|---|---|---|
| Perplejidad WikiText-2 (20 x 512 tokens) | 37,19 | 37,60 (+1,1%) |
| GSM8K, 60 problemas, 768 tokens | 65,0% | 65,0% |
| Búsqueda de código en contexto (120 items) | 85,8% | 86,7% |
| Copia literal de frase a petición (40 items) | 92,5% | 92,5% |
| Log-prob de siguiente frase natural (held out) | -1,444 | -1,475 |

Otros ajustes:

| Ajuste | Base | WSP-NoLoop |
|---|---|---|
| Modo think, 32 prompts, 1200 tokens: bucles duros | 3 / 32 | 1 / 32 |
| Muestreo recomendado (T=1,0, top_p=0,95, min_p=0): degeneradas | 4,2% | 2,8% |

En modo teacher-forced sobre frases held-out, la probabilidad de reemitir una frase que ya ha aparecido dos veces pasa de un log-prob por token de -0,389 a -1,897 (aproximadamente del 68% al 15% por token).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 2,2 GB solo para pesos (1,08 B de parámetros), más overhead de activaciones y caché KV; el tamaño del repo es de 2,2 GB.
- Cuantización a 8 bits: aproximadamente 1,1 GB de pesos; a 4 bits: en torno a 0,6 GB, más overhead.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM para fp16 con contexto moderado; cabe con holgura en RTX 3060, RTX 4060, RTX 4090 y equivalentes. Para mayor throughput, A100 o H100, aunque el modelo es pequeño para aprovecharlas.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida si se cuantiza.
- Opciones de despliegue: Transformers (código de ejemplo en la model card con `dtype="auto"`), llama.cpp/Ollama y vLLM/TGI en la medida en que soporten la arquitectura del base; la model card no lista integraciones específicas.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-1B-WSP-NoLoop | 1,08 B | No disponible | Edición de pesos sin entrenamiento sobre MiniCPM5-1B | Apache 2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| openbmb/MiniCPM5-1B (base) | 1,08 B | No disponible | Modelo base tras RL + OPD | Apache 2.0 (segun el modelo derivado) | Hugging Face |
| MiniCPM5-1B-SFT | 1,08 B | No disponible | Checkpoint intermedio SFT del base | No disponible | Hugging Face (referenciado en la model card) |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría (por ejemplo, Qwen, SmolLM o Llama de tamaño similar) en la información proporcionada; la comparación disponible se limita al modelo base y su checkpoint SFT.

## Limitaciones y advertencias

- Los conjuntos de evaluación son modestos: 120 prompts de estrés y 60 problemas de GSM8K; las diferencias pequeñas en las comprobaciones de capacidad están dentro del ruido estadístico.
- Con un límite de 384 tokens, GSM8K mostró respuestas que superaban el corte; a 768 tokens la precisión y la tasa de finalización igualan al base.
- La edición ataca bucles de frase y de bloque, no errores factuales del modelo base de 1 B, que persisten.
- Solo inglés y chino, igual que el modelo base; no hay soporte multilingüe adicional.
- La ganancia principal se da en decodificación greedy o de baja temperatura; con el muestreo recomendado (T=1,0, top_p=0,95, min_p=0) el base ya genera menos bucles y la mejora es menor.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo derivado hereda las limitaciones y posibles sesgos del base; la model card no documenta sesgos específicos.
- Riesgo de alucinación propio de un modelo de 1,08 B: no debe usarse como fuente de verdad en dominios factuales sin verificación externa.
- La edición es reversible y está descrita por 64 pares (capa, neurona); cualquier modificación adicional de pesos debe validarse con ablación, ya que el autor documenta que enfoques alternativos (dirección de copia, cabezas de inducción) degradan formato o copia literal.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay validación independiente de los resultados más allá de la model card del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yasserrmd/MiniCPM5-1B-WSP-NoLoop
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Fichero de neuronas editadas: `neurons.json` (incluido en el repositorio)
- Script de aplicación y reversión: `apply_patch.py` (incluido en el repositorio, opciones `--out`, `--revert`, `--scale`)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
