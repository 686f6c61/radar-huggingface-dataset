# Varun95/medical-qwen-lora

## Resumen

`Varun95/medical-qwen-lora` (publicado en la model card bajo el nombre de MedReason) es un adaptador LoRA de tipo PEFT para el modelo base `unsloth/Qwen2.5-3B-Instruct-bnb-4bit`, ajustado con QLoRA sobre el conjunto de datos `FreedomIntelligence/medical-o1-reasoning-SFT`. Su objetivo es el razonamiento clínico de un solo turno en inglés: dado un viñeta de paciente, el adaptador emite un bloque de razonamiento delimitado por `<think>...</think>` y a continuación una respuesta clínica concisa. Lo desarrolla el usuario Varun95 y se distribuye con licencia Apache-2.0.

La relevancia del modelo es más metodológica que clínica: demuestra que un ajuste QLoRA con rango 16 sobre las siete proyecciones de los 36 bloques del transformer (29,9 millones de parámetros entrenables, el 0,97 % de los 3,09 mil millones del backbone) puede completarse de principio a fin en una única GPU T4 de nivel gratuito. No obstante, el autor lo marca explícitamente como prototipo de investigación no validado clínicamente y el entrenamiento se detuvo por agotamiento del presupuesto de GPU tras 0,78 épocas de las 3 planificadas.

El estado de entrenamiento condiciona cualquier evaluación: la pérdida de validación seguía bajando (1,3987 en el paso 1.529) y no se ha ejecutado ninguna batería de benchmarks. La única verificación cualitativa realizada comprueba el formato de salida en tres viñetas, sin afirmar nada sobre exactitud clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) con adaptadores LoRA de rango 16 sobre las proyecciones de atención y MLP |
| Parametros totales | 3,09 mil millones en el backbone congelado; 29,9 millones entrenables en el adaptador (0,97 %) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens en entrenamiento; el modelo base Qwen2.5-3B-Instruct soporta ventanas mayores (dato no declarado en la ficha del adaptador) |
| Tipos de cuantizacion | Base cargado en 4-bit mediante bitsandbytes (bnb-4bit de Unsloth); adaptador en fp16. No se publican pesos GGUF ni otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); repositorio de 3,0 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 36 bloques. Cada bloque lleva un par de matrices LoRA A y B de rango 16 en las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, todas las proyecciones de atención y MLP. El escalado es α/r = 1 (rango 16, alpha 16, dropout 0,05), de modo que la rama del adaptador actúa como un residuo aditivo sobre la proyección congelada en 4-bit. El entrenamiento usa `adamw_8bit` con weight decay 0,01, tasa de aprendizaje 2e-4 con schedule coseno y 3 % de warmup, batch efectivo de 8 (2 por dispositivo × 4 de acumulación), precisión fp16 con checkpointing de gradientes y longitud máxima de secuencia de 4.096 tokens. La pérdida se calcula solo sobre los tokens del asistente, con el prompt enmascarado, y el stack es Unsloth + TRL `SFTTrainer` + PEFT + bitsandbytes.

Los datos proceden del dataset de razonamiento médico `FreedomIntelligence/medical-o1-reasoning-SFT`, tras un proceso de limpieza que eliminó nulos, trazas cortas y duplicados, dejando 19.526 ejemplos (ninguno por encima de 4.096 tokens). La partición es 80/10/10 con semilla fija: 15.620 de entrenamiento, 1.952 de validación y 1.954 de test retenido (sin usar). Se verificó a nivel de par que no hubiera solapamiento entre particiones. El entrenamiento se detuvo en el paso 1.529 con una pérdida de validación de 1,3987, todavía en descenso, tras completar 0,78 de las 3 épocas previstas; el autor atribuye la parada al límite de tiempo de la GPU gratuita, no a convergencia. No se documenta ninguna fase de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés con formato de razonamiento explícito: bloque `<think>` cerrado seguido de respuesta final, útil para inspeccionar la traza intermedia.
- Razonamiento clínico de un solo turno sobre viñetas de paciente (presentación, antecedentes, síntomas) con salida estructurada.
- Interpretación de indicaciones de sistema específicas: el adaptador fue entrenado con un system prompt concreto ("You are a Clinical Decision Support AI...") y su comportamiento sin él está sin probar.
- Generación condicionada por rol de asistente clínico, con capacidad de producir resúmenes clínicos concisos tras la fase de razonamiento.
- Soporte de tool calling / function calling: no disponible de forma específica en el adaptador (el modelo base Qwen2.5-Instruct lo soporta, pero el ajuste no lo entrena ni lo evalúa).
- Capacidades de agente y razonamiento multi-paso autónomo: no evaluadas; el formato `<think>` es una traza de razonamiento, no un bucle de agente.
- Multilingüismo: limitado a inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Visión, audio o modalities adicionales: no disponibles.

## Casos de uso

- Docencia médica y simulación de casos: generar trazas de razonamiento paso a paso a partir de una viñeta para que estudiantes comparen su propio diferencial con el del modelo, aprovechando el bloque `<think>` como material de discusión.
- Investigación sobre cadenas de razonamiento (CoT) en dominio sanitario: el adaptador sirve como punto de partida reproducible para estudiar cómo el ajuste QLoRA altera la estructura y longitud de las trazas respecto al modelo base.
- Prototipado de interfaces de soporte a la decisión clínica: permite construir demos de UI que separan visualmente razonamiento y respuesta final, ya que el formato de salida está verificado (aunque no la exactitud).
- Generación de resúmenes clínicos estructurados en pipelines de investigación: con 4.096 tokens de contexto de entrenamiento admite viñetas con antecedentes e historia relativamente largas, siempre en entornos no clínicos.
- Evaluación comparativa de adaptadores médicos: al ser un LoRA de 29,9 M de parámetros sobre una base de 3,09 B, es barato de cargar y comparar frente a otros adaptadores del mismo dataset en experimentos de ablation.
- Destilación y anotación asistida de datos: usar las trazas generadas como borradores para revisión humana en la construcción de nuevos conjuntos de razonamiento clínico, con filtrado y validación posteriores obligatorios.
- Pruebas de despliegue en hardware modesto: validar stacks de servicio (Transformers + PEFT, Unsloth, vLLM con adaptadores LoRA) sobre GPU de 16 GB antes de escalar a modelos mayores.

## Benchmarks y rendimiento

El autor solo declara pérdida de validación sobre el conjunto de validación del propio dataset de SFT. No se han publicado resultados en MMLU, HumanEval, GSM8K, MedQA, MedMCQA ni ninguna otra batería estándar.

| Paso de entrenamiento | Pérdida de validación |
|---:|---:|
| 100 | 1,4988 |
| 500 | 1,4324 |
| 800 | 1,4171 |
| 1.000 | 1,4116 |
| 1.300 | 1,4025 |
| 1.500 | 1,3987 |
| 1.529 (parada) | 1,3987 |

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---:|---|
| Clinical Reasoning SFT | FreedomIntelligence/medical-o1-reasoning-SFT | Validation Loss | 1,3987 | No |

La verificación cualitativa se limita a tres viñetas (dolor torácico en varón de 45 años, fiebre pediátrica en niño de 3 años, dolor en fosa ilíaca derecha en mujer de 28 años) muestreadas en el paso 1.529 con temperatura 0,7: las tres produjeron bloque `<think>` cerrado y respuesta final, lo que confirma únicamente el formato de salida.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone en 4-bit ocupa aproximadamente 2 GB de pesos y el adaptador en fp16 unos 60 MB. Con 4.096 tokens de contexto, la caché KV y las activaciones añaden del orden de 1-2 GB, lo que sitúa el consumo total estimado en 3-4 GB en GPU (cifra orientativa, no medida por el autor).
- GPU recomendadas: el entrenamiento se completó en una T4 de 16 GB de nivel gratuito. Para inferencia son suficientes una T4, una L4 o una RTX 3060 de 12 GB; para mayor throughput, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más, incluida la RTX 3060/4060 Ti. En CPU solo sería viable tras fusionar el adaptador y convertir a GGUF (no publicado).
- Opciones de despliegue: Transformers + PEFT (carga directa del adaptador con `PeftModel.from_pretrained`), Unsloth `FastLanguageModel.for_inference` para inferencia acelerada, vLLM con soporte de adaptadores LoRA (requiere servir la base y registrar el adaptador), y endpoint gestionado en FriendliAI. llama.cpp u Ollama requerirían fusionar los pesos y generar un GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Varun95/medical-qwen-lora` | 3,09 B base + 29,9 M adaptador | 4.096 tokens de entrenamiento | Pérdida de validación 1,3987; sin benchmarks | Apache-2.0 | HuggingFace, 82 descargas, 0 likes |
| Qwen2.5-3B-Instruct (base) | 3,09 B | No declarado en esta ficha | No evaluado en el repo del adaptador; es el punto de referencia del ajuste | Apache-2.0 | HuggingFace (Unsloth publica la variante bnb-4bit) |
| `Dev9124/qwen-medical-model-lora` | LoRA sobre Qwen (tamaño no especificado) | No disponible | No disponible | No disponible | HuggingFace |
| MedQwen (Sparse Spectral LoRA para VLM médicos) | No disponible | No disponible | Enfocado a robustez entre datasets médicos heterogéneos y a reducir olvido catastrófico | No disponible | Proyecto de investigación |

La comparación cuantitativa con alternativas no es posible con la información disponible: ninguno de los modelos similares localizados publica métricas comparables sobre el mismo conjunto de validación.

## Limitaciones y advertencias

- Modelo infranteinado: solo 0,78 épocas de 3 planificadas y la pérdida de validación seguía descendiendo en el momento de la parada. El propio autor lo etiqueta como "under-trained".
- Sin validación clínica ni regulatoria: la model card lo declara "research prototype, not a medical device" y prohíbe explícitamente su uso para informar decisiones de atención al paciente.
- Ausencia total de benchmarks: no hay resultados en MedQA, MMLU, HumanEval ni ninguna otra prueba; la única verificación cualitativa cubre el formato de salida, no la corrección del contenido.
- Riesgo elevado de alucinación en contenido clínico: el ajuste se realizó sobre datos sintéticos de razonamiento médico y no se ha medido la tasa de error factual ni la calibración de las respuestas.
- Dependencia del system prompt: el adaptador se entrenó con un prompt de sistema concreto y el comportamiento sin él está sin probar, lo que limita su portabilidad a otros marcos de despliegue.
- Cobertura lingüística restringida al inglés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Sesgos no evaluados: no se ha analizado el comportamiento diferencial por edad, sexo, etnia u otras variables demográficas de las viñetas.
- Cuantización de la base en 4-bit (bnb): introduce una pérdida de precisión respecto a los pesos originales de Qwen2.5-3B-Instruct y complica la reproducibilidad exacta del ajuste.
- Restricciones de licencia: Apache-2.0 permite uso comercial del adaptador, pero debe respetarse la licencia del modelo base Qwen2.5-3B-Instruct y las condiciones del dataset `FreedomIntelligence/medical-o1-reasoning-SFT`; el uso comercial en contexto sanitario queda además limitado por la falta de validación clínica.
- Repositorio de 3,0 GB para un adaptador de 29,9 M de parámetros: el tamaño sugiere artefactos adicionales (posiblemente pesos base o estados), algo a verificar antes de integrarlo en un pipeline de producción.
- Actividad muy baja: 82 descargas y 0 likes desde su publicación, sin revisión comunitaria de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Varun95/medical-qwen-lora
- Modelo base (Unsloth, bnb-4bit): https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/Varun95/medical-qwen-lora
- Adaptador similar en HuggingFace: https://huggingface.co/Dev9124/qwen-medical-model-lora
- Tutorial de ajuste LoRA médico sobre Qwen2.5-0.5B: https://github.com/SoloCalm/MiniLoRA
- MedQwen (Sparse Spectral LoRA para VLM médicos): https://omid-nejati.github.io/MedQwen/
