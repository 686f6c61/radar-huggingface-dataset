# Zainulabedin1/manufacturing-qa-distilgpt2-lora

## Resumen

`manufacturing-qa-distilgpt2-lora` es un adaptador LoRA de dominio publicado por el usuario Zainulabedin1 sobre el modelo base `distilgpt2` (82 millones de parámetros), destilado de GPT-2 por Hugging Face. El adaptador tiene rango 8, alpha 16, dropout 0,05 y actúa únicamente sobre las proyecciones `c_attn`, con 147.456 parámetros entrenables (0,18 % del total). Se ha ajustado sobre 332 pares de pregunta y respuesta del ámbito de fabricación (mecanizado, metrología, materiales, fabricación aditiva y gestión de salud de sistemas, PHM), procedentes de fuentes públicas documentadas.

El propio autor lo describe explícitamente como una demostración de adaptación de dominio y no como un sistema de respuesta en producción. Los resultados son coherentes con esa advertencia: la pérdida de validación baja de 4,4563 a 4,3145 en cuatro épocas sin señales de sobreajuste, pero la puntuación de juicio humano sobre 10 preguntas retenidas pasa de 0,00/2 en el modelo base a solo 0,10/2 con el adaptador. Es decir, el ajuste desplaza el estilo de las respuestas hacia el dominio, sin aportar fiabilidad factual.

Su relevancia no está en el rendimiento, sino en el valor didáctico y de ingeniería: documenta un fallo real de tokenización en BPE (el espacio tras `A:` cambia la alineación de etiquetas y provoca la emisión de fragmentos de palabra), el enmascarado de pérdida solo en los tokens de respuesta mediante offsets de carácter, y un pipeline completo de PEFT reproducible en CPU. Es, por tanto, una plantilla de bajo coste para estudiar ajuste fino con LoRA, no un modelo de conocimiento industrial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 destilado, `distilgpt2`) con adaptador LoRA sobre `c_attn` |
| Parámetros totales | 82 M (modelo base); adaptador LoRA: 147.456 parámetros entrenables (0,18 %) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens (heredada del modelo base `distilgpt2`; no se indica en la model card) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | No disponible en la model card; el corpus de entrenamiento está en inglés |
| Licencia | No disponible |
| Formato de pesos | `adapter_model.safetensors` + `adapter_config.json` (formato PEFT); requiere descargar los pesos base de `distilgpt2` desde el Hub |
| Hiperparámetros LoRA | rango 8, alpha 16, dropout 0,05, target `c_attn` |
| Entrenamiento | 4 épocas, batch 8, lr 5e-4, 10 pasos de warmup, en CPU |
| Formato de prompt | `Q: {pregunta}\nA:{respuesta}` + EOS (sin espacio después de `A:`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `distilgpt2`: un transformer decoder-only con atención causal completa, obtenido por destilación de GPT-2 small y con aproximadamente la mitad de capas que este. No incorpora mecanismos de atención lineal, decodificación especulativa ni modos de razonamiento. Sobre él se aplica un adaptador LoRA de bajo rango que solo modifica la matriz `c_attn` de cada bloque, dejando congelados los pesos originales; el resultado es un incremento de 147.456 parámetros sobre los 82 M del modelo base.

El corpus de entrenamiento consiste en 332 pares pregunta-respuesta curados manualmente, distribuidos en mecanizado (70), metrología (70), materiales (73), fabricación aditiva (47) y PHM (72). Cada par está trazado a una fuente pública: artículos de Wikipedia sobre fabricación, el capítulo 6 del e-Handbook of Statistical Methods de NIST/SEMATECH, artículos de la PHM Society y tablas de rugosidad superficial Ra. La partición es de 282 pares de entrenamiento y 50 de validación. Un detalle técnico relevante es el enmascarado de la pérdida: solo se calculan gradientes sobre los tokens de la respuesta, con la pregunta marcada como -100 y el límite localizado mediante offsets de carácter del tokenizador. El autor documenta además un fallo corregido en la construcción del prompt: en BPE de GPT-2, un espacio final tras `A:` se tokeniza como token independiente, mientras que en el texto completo se fusiona con la palabra siguiente; la discrepancia entre entrenamiento y generación desplazaba todas las etiquetas un token y enseñaba al modelo a emitir fragmentos de palabra.

## Capacidades

- Generación de texto autoregresiva en inglés, condicionada a un formato estricto de pregunta-respuesta (`Q: ...\nA:`).
- Reproducción de plantillas de frase y vocabulario del dominio de fabricación: mecanizado, metrología, materiales, fabricación aditiva y PHM.
- Respuesta a preguntas del dominio cuando la formulación es muy similar a la de los pares de entrenamiento.
- Ajuste de estilo: respuestas más cortas y centradas en el tema que el modelo base, según la evaluación cualitativa del autor.
- No soporta tool calling ni function calling.
- No soporta agentes, planificación multi-paso ni razonamiento encadenado.
- No dispone de modo "thinking", visión, audio ni multimodalidad.
- Capacidad multilingüe no documentada; el corpus es monolingüe en inglés.

## Casos de uso

- Material didáctico para enseñar ajuste fino con LoRA: el repositorio incluye `model.py` con `load_qa_model()` y `answer_question()`, además de `config.json` con los hiperparámetros, lo que permite reproducir el pipeline completo en CPU en minutos.
- Demostración del impacto real de la tokenización en BPE: el caso del espacio tras `A:` sirve como ejemplo verificado de un error silencioso que desplaza etiquetas; útil en formación de ingeniería de datos.
- Plantilla de arranque para adaptación de dominio con presupuesto mínimo: sirve como esqueleto (carga de PEFT, enmascarado por offsets, partición train/val) que se puede trasladar a un modelo base mayor.
- Prueba de humo de infraestructura de entrenamiento: con 82 M de parámetros y 332 ejemplos, es un caso de validación rápido para comprobar que un entorno de PEFT, tokenizadores y checkpoints funciona antes de escalar a modelos mayores.
- Evaluación comparativa de metodologías de ajuste: la pareja base/adaptador con la misma decodificación greedy permite medir la ganancia marginal de un adaptador de rango 8 en un modelo débil.
- Ejemplo de buenas prácticas de trazabilidad de datos: el autor enlaza cada par a una fuente pública (Wikipedia, NIST/SEMATECH, PHM Society), lo que constituye un modelo de documentación de procedencia para corpus pequeños.
- No es adecuado como sistema de soporte técnico real, asistente de planta ni referencia de ingeniería, tal como advierte explícitamente el autor.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Pares de entrenamiento / retenidos | 282 / 50 |
| Pérdida final de entrenamiento | 4,3153 |
| Pérdida final de validación | 4,3145 (evolución: 4,4563 → 4,3529 → 4,3224 → 4,3145) |
| Sobreajuste observado | No (la validación desciende de forma monótona) |
| Puntuación humana, `distilgpt2` base (10 preguntas retenidas, greedy) | 0,00 / 2 |
| Puntuación humana, modelo con LoRA (10 preguntas retenidas, greedy) | 0,10 / 2 |
| Rúbrica de evaluación | 2 = correcto y completo; 1 = parcialmente correcto, sin errores factuales pero vago o incompleto; 0 = incorrecto, sin sentido o fuera de tema |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La evaluación humana se limita a 10 preguntas y un único evaluador, por lo que el autor la califica de señal de demostración y no de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el conjunto base + adaptador (82 M de parámetros); en la práctica, unos 400-600 MB incluyendo tokenizador y buffers de atención.
- Cabe en cualquier GPU consumer: GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 y superiores disponen de VRAM de sobra. También funciona en CPU, como demuestra el propio entrenamiento del autor.
- GPU recomendadas: ninguna en particular; el modelo es demasiado pequeño para aprovechar A100 o H100. Para servir muchas peticiones concurrentes, el cuello de botella será el overhead del framework, no la GPU.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor mediante `model.py`), `vLLM` y `TGI` (compatibles con adaptadores LoRA, aunque el rendimiento estará limitado por el tamaño del modelo base), `llama.cpp` u `Ollama` solo si se convierte previamente a GGUF, paso no documentado en el repositorio.
- Latencia y throughput: no disponibles como cifras medidas. Por el tamaño, se espera latencia de milisegundos por decodificación en GPU y decenas de milisegundos por token en CPU, con `max_new_tokens=80` como valor por defecto en `answer_question()`.
- Almacenamiento: el repositorio ocupa 0,0 GB según el Hub, coherente con un adaptador de 147.456 parámetros; los pesos base de `distilgpt2` (unos 350 MB) se descargan por separado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `manufacturing-qa-distilgpt2-lora` | 82 M + 0,15 M LoRA | 1.024 tokens | Adaptador LoRA de dominio sobre GPT-2 destilado | No disponible | Hugging Face (13 descargas, 1 like) |
| `distilgpt2` (base) | 82 M | 1.024 tokens | Modelo de lenguaje general destilado | Apache 2.0 (modelo base de Hugging Face) | Hugging Face, ampliamente extendido |
| `gpt2` (small) | 124 M | 1.024 tokens | Modelo de lenguaje general | MIT | Hugging Face |
| Modelos instruct pequeños (por ejemplo, en la franja de 0,5-1,1 B) | 500-1.100 M | 2.048-32.768 tokens según familia | Ajuste por instrucciones y preferencias | Apache 2.0 en varias familias | Hugging Face |

Los datos de `distilgpt2` base y del adaptador proceden de la model card; las cifras de las otras filas son especificaciones públicas de sus respectivos modelos y no forman parte de la información proporcionada en esta ficha. La comparación relevante es la que el propio autor señala: un modelo instruct de mayor tamaño parte de un suelo mucho más alto para una tarea de pregunta-respuesta técnica, mientras que este adaptador sirve como ejercicio de metodología.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido (332 pares): el modelo memoriza plantillas de frase, no comprende el dominio. Las preguntas parafraseadas o fuera de distribución degradan rápidamente la calidad.
- Alucinación con alta confianza: el autor advierte explícitamente de que las respuestas pueden ser erróneas, vagas o sin sentido, y que nunca debe usarse como referencia de ingeniería.
- La decodificación greedy puede entrar en bucles; el muestreo con temperatura 0,7 es más variado pero menos determinista.
- El modelo base `distilgpt2` (82 M) es débil; la puntuación humana de 0,10/2 sobre 10 preguntas indica una fiabilidad factual prácticamente nula.
- Evaluación humana a muy pequeña escala (10 preguntas, un solo evaluador): la diferencia respecto al modelo base debe interpretarse como señal cualitativa, no como benchmark.
- Licencia no declarada en el Hub: sin licencia explícita, no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Idiomas no declarados y corpus monolingüe en inglés: no hay evidencia de funcionamiento en castellano.
- Anomalías de metadatos: la etiqueta del Hub incluye `gradient-boosting-regression`, incoherente con un adaptador LoRA de un transformer, y las fechas de creación y actualización (octubre de 2026) son posteriores a la fecha actual; conviene verificar la procedencia y el contenido real del repositorio antes de cargarlo.
- El uso documentado requiere descargar y ejecutar `model.py` del repositorio; es código de terceros no auditado, por lo que debe revisarse antes de ejecutarlo en un entorno con datos sensibles.
- El formato de prompt es rígido: cualquier desviación en el espacio tras `A:` altera la calidad de la generación, según el propio análisis del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zainulabedin1/manufacturing-qa-distilgpt2-lora
- Modelo base `distilgpt2`: https://huggingface.co/distilgpt2
- NIST/SEMATECH e-Handbook of Statistical Methods, capítulo 6 (fuente del corpus): https://www.itl.nist.gov/div898/handbook/
- PHM Society (fuente del corpus): https://www.phmsociety.org/
- Documentación de PEFT (carga del adaptador con `PeftModel.from_pretrained`): https://huggingface.co/docs/peft
- Resultados y tabla de fuentes del corpus: `results/report.json` del repositorio de origen del autor (no se ha localizado URL pública en la información disponible)

No se han encontrado en la búsqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a una base de datos musical y no guardan relación con esta ficha.
