# U-WIN/qwen35-9b-equational-theory-sair-rft-r1-closedbook-3ep-from-syncards-a

## Resumen

El modelo `qwen35-9b-equational-theory-sair-rft-r1-closedbook-3ep-from-syncards-a` es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario U-WIN en HuggingFace. Se trata de un modelo multimodal de tipo image-text-to-text orientado a una tarea muy específica: la resolución de problemas de teoría de ecuaciones (equational theory) en modo closed-book, es decir, sin acceso a fuentes externas durante la inferencia. El entrenamiento combina técnicas de SAIR, RFT (Rejection Sampling Fine-Tuning) con regularización KL y SFT conversacional, lo que sugiere un pipeline de alineación por muestreo de rechazo sobre el modelo base.

El modelo conserva la arquitectura y el tamaño del Qwen3.5-9B original, con 9.653.104.368 parámetros totales en formato safetensors y un repositorio de 19,3 GB. Al ser un fine-tune completo, no se trata de un adaptador LoRA, sino de una copia íntegra de los pesos base modificados durante el entrenamiento. La licencia es Apache 2.0, aunque el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en HuggingFace.

Su relevancia es limitada y muy nichada: con solo 2 descargas y 0 likes en el momento de la consulta, es un modelo de investigación más que una herramienta de producción. Resulta interesante como ejemplo de especialización de un modelo multimodal de 9B en una tarea matemática concreta mediante RFT y regularización KL, pero no está pensado para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5-9B; detalles internos no disponibles |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal de aproximadamente 9,65 mil millones de parámetros que procesa entradas de imagen y texto. El fine-tune es completo (full-finetune), según la etiqueta `full-finetune`, lo que implica que se actualizaron todos los pesos del modelo base y no solo un adaptador. El pipeline declarado es `image-text-to-text`, por lo que conserva la capacidad de recibir imágenes junto con texto.

El entrenamiento se describe mediante las etiquetas `sair`, `rft`, `rejection-sampling-fine-tuning`, `sft`, `kl-regularization` y `conversational`. Esto indica un proceso de Rejection Sampling Fine-Tuning: se generan múltiples respuestas candidatas, se filtran por calidad (probablemente verificando corrección en teoría de ecuaciones) y se reentrena sobre las aceptadas, con una penalización KL para evitar el colapso respecto al modelo base. El sufijo `closedbook-3ep` sugiere 3 épocas de entrenamiento en modo closed-book, y `from-syncards-a` apunta a un conjunto de datos o configuración de origen no detallado. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO más allá del RFT.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredado del modelo base Qwen3.5-9B.
- Procesamiento de imágenes junto con texto (image-text-to-text), según el pipeline declarado.
- Resolución de problemas de teoría de ecuaciones en modo closed-book, que es la especialización principal del fine-tune.
- Razonamiento matemático simbólico orientado a igualdades y reescritura de términos, derivado del dominio de entrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita; el RFT sugiere cadenas de razonamiento, pero no se confirma.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Capacidades especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Investigación en teoría de ecuaciones: el modelo puede emplearse como banco de pruebas para evaluar si un fine-tune de 9B especializado supera al base en tareas de demostración ecuacional closed-book, comparando tasas de acierto sobre el mismo conjunto de problemas.
- Generación de demostraciones simbólicas: dado un conjunto de axiomas y una igualdad objetivo, el modelo puede proponer secuencias de reescritura, útil en entornos de investigación en álgebra universal y verificación formal.
- Evaluación de pipelines RFT: al ser un artefacto de rejection sampling fine-tuning con regularización KL, sirve para estudiar el efecto de distintas tasas de aceptación y coeficientes KL en la calidad final del modelo.
- Asistente docente de álgebra abstracta: en un entorno controlado, puede explicar paso a paso por qué dos términos son iguales bajo una teoría ecuacional dada, con la salvedad de que requiere verificación humana por el riesgo de alucinación.
- Fine-tune de referencia para multimodalidad: al conservar el pipeline image-text-to-text, puede usarse como punto de partida para experimentos que combinen razonamiento simbólico con entradas visuales (por ejemplo, diagramas de ecuaciones).
- Baseline en competiciones internas de razonamiento matemático: con solo 9,65B parámetros y licencia Apache 2.0, es desplegable en una sola GPU para pruebas comparativas frente a modelos mayores.
- Estudio de olvido catastrófico: al ser un full fine-tune de 3 épocas sobre una tarea estrecha, permite medir cuánto se degradan las capacidades generales del Qwen3.5-9B original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 24 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 10-11 GB, aunque no se publican pesos cuantizados oficiales.
- VRAM estimada en cuantización de 4 bits: alrededor de 6-7 GB, requiriendo conversión manual a GGUF o AWQ/GPTQ, ya que el repo solo contiene safetensors.
- GPU recomendadas: A100 40/80 GB, H100, L40S para fp16; RTX 4090 (24 GB) para fp16 ajustado o cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con fp16 y gestión cuidadosa del contexto, o en RTX 3090/4080 con cuantización.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para safetensors; llama.cpp/Ollama requerirían conversión previa a GGUF, no disponible en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen35-9b-equational-theory-sair-rft-r1-closedbook-3ep-from-syncards-a | 9,65B | no disponible | Apache 2.0 | Gated en HF | Fine-tune especializado en teoría de ecuaciones |
| Qwen/Qwen3.5-9B (base) | ~9,65B | no disponible | no disponible en esta ficha | Público en HF | Modelo generalista multimodal del que deriva |
| Alternativas de 7-9B multimodal | ~7-9B | variable | variable | variable | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento numérico con alternativas concretas; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace, lo que puede retrasar o impedir su uso automatizado en pipelines.
- Especialización estrecha: el fine-tune está orientado a teoría de ecuaciones closed-book; su rendimiento en tareas generales puede haberse degradado respecto al Qwen3.5-9B original (olvido catastrófico) tras 3 épocas de full fine-tune.
- Riesgo de alucinación: en demostraciones matemáticas simbólicas, el modelo puede producir pasos de reescritura inválidos o conclusiones incorrectas; requiere verificación formal externa.
- Idiomas no declarados: no se especifican los idiomas soportados, por lo que no se garantiza un comportamiento correcto en castellano u otras lenguas.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que impide planificar su uso en conversaciones largas o documentos extensos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad; las 2 descargas y 0 likes indican ausencia de validación por la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-9B conviene revisar las condiciones del modelo base y del acceso gated.
- Sin pesos cuantizados oficiales: el despliegue en hardware limitado exige conversión manual, con riesgo de degradar aún más la precisión en tareas simbólicas.

## Enlaces

- HuggingFace: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-rft-r1-closedbook-3ep-from-syncards-a
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
