# youknowho/Qwen3-14B-BCFinance

## Resumen

Qwen3-14B-BCFinance es un ajuste fino de pesos completos del modelo Qwen/Qwen3-14B, desarrollado por el usuario youknowho, especializado en el dominio financiero coreano. El modelo parte de la arquitectura transformer densa de Qwen3 con 14.768.307.200 parámetros y se ha entrenado mediante QLoRA sobre el conjunto de datos BCCard/BCAI-Finance-Kor, tras lo cual el adaptador se ha fusionado en los pesos base, de modo que no requiere la librería PEFT en inferencia. Su idioma principal es el coreano, con soporte secundario de inglés.

El modelo resuelve el problema de la terminología y precisión financiera en coreano: según la model card, corrige errores del modelo base en conceptos como el DSR (responde "총부채원리금상환비율" en lugar de "부채상환비율") y atribuye correctamente servicios como BC Card Paybooc. Su relevancia actual radica en que demuestra un ajuste fino eficiente (128,5M de parámetros entrenables, el 0,9% del total) sobre hardware de consumo profesional (NVIDIA GB10, DGX Spark) en unas 10 horas, con una mejora medible de ROUGE-L del 24,9% frente al base.

Se distribuye bajo licencia Apache 2.0, heredada del modelo base, con pesos en formato safetensors y un tamaño de repositorio de 29,5 GB. No obstante, es un modelo de investigación con respuestas deliberadamente concisas y adherencia debilitada al rol del system prompt, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), fine-tune de pesos completos con adaptador QLoRA fusionado |
| Parametros totales | 14.768.307.200 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (entrenamiento con max sequence length de 1024 tokens) |
| Tipos de cuantizacion | bf16 nativo; 4-bit NF4 con BitsAndBytes (double quant) documentado por el autor |
| Idiomas soportados | Coreano (principal), ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en Qwen3-14B, sin mezcla de expertos. El ajuste se realizó con QLoRA: base cuantizada en NF4 de 4 bits con doble cuantización y cómputo en bf16, rango LoRA 32 y alpha 64, dropout 0,05, y módulos objetivo q, k, v, o, gate, up y down (las siete proyecciones). Se entrenaron 128,5M de parámetros (0,9% del total) durante 3 épocas (342 pasos de optimizador), con batch efectivo de 16 (8 por dispositivo con acumulación de gradiente 2), longitud máxima de secuencia de 1024 con empaquetado BFD, learning rate 1e-4 con schedule coseno y 30 pasos de warmup, optimizador paged_adamw_8bit y max grad norm 1.0. El entrenamiento se ejecutó en una NVIDIA GB10 (DGX Spark) durante aproximadamente 10 horas.

El dataset BCCard/BCAI-Finance-Kor se dividió en 3.000 ejemplos de entrenamiento y 1.000 de validación, balanceados en 17 temáticas financieras. La pérdida de entrenamiento bajó de 1,1766 a 0,4357 y la de validación se mantuvo estable (0,5487 en el paso 200, 0,5473 en el 342), sin regresión, lo que indica que el run terminó antes de entrar en sobreajuste. La precisión de token en entrenamiento pasó del 74,2% al 86,8% y en validación del 83,9% al 84,1%. Tras el entrenamiento, el adaptador se fusionó en los pesos base.

## Capacidades

- Generación de texto conversacional en coreano con terminología financiera especializada (DSR, productos de tarjetas, fintech, gestión de patrimonios, derivados y riesgo).
- Respuestas en formato de párrafo único y conciso (media de 328 tokens generados frente a 716 de las referencias).
- Soporte de plantilla de chat con roles system/user/assistant mediante `apply_chat_template`, con opción `enable_thinking=False`.
- Capacidad multilingüe limitada a coreano e inglés.
- Conserva capacidades generales del modelo base: aritmética, programación, conocimiento general, razonamiento lógico, vocabulario, historia y física (ocho sondas fuera de dominio correctas, sin olvido catastrófico observado).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Atención al cliente bancaria en coreano: el modelo responde consultas sobre regulación y productos financieros con terminología oficial coreana, adecuado para bases de conocimiento de entidades como card issuers o entidades de crédito.
- Generación de FAQ financieras: produce respuestas concisas de párrafo único ideales para secciones de preguntas frecuentes en portales bancarios coreanos, donde la brevedad es un requisito editorial.
- Asistencia a agentes comerciales: sirve como borrador de respuestas sobre DSR, límites de préstamo y productos de tarjeta, que el agente humano revisa antes de enviar.
- Normalización terminológica: útil para tareas de post-procesado donde se requiere la denominación oficial de conceptos financieros coreanos (por ejemplo, "총부채원리금상환비율" frente a variantes coloquiales).
- Investigación académica sobre ajuste eficiente: el setup QLoRA documentado (rango 32, siete módulos, 342 pasos en GB10) sirve como referencia reproducible para adaptar modelos de 14B a dominios verticales con recursos moderados.
- Evaluación comparativa de dominio: puede emplearse como baseline de fine-tuning financiero coreano en experimentos de ROUGE-L y Jaccard sobre conjuntos de validación propios.
- Prototipado de asistentes verticales: con cuantización 4-bit NF4 y `device_map="auto"`, permite desplegar un asistente financiero coreano en una GPU única para demos internas.

## Benchmarks y rendimiento

Evaluación del autor sobre 34 preguntas del split de validación (dos por cada una de las 17 temáticas), decodificación greedy, máximo 400 tokens nuevos, métrica ROUGE-L contra respuestas de referencia:

| Metrica | Base Qwen3-14B | Qwen3-14B-BCFinance | Cambio |
|---|---|---|---|
| Win rate | - | 28/34 (82,4%) | - |
| ROUGE-L F1 | 0,2011 | 0,2512 | +24,9% |
| ROUGE-L recall | 0,2308 | 0,2566 | +11,2% |
| ROUGE-L precision | 0,2707 | 0,3796 | +40,2% |
| Jaccard 3-gramas de caracteres | 0,1167 | 0,1633 | +39,9% |

El intervalo de confianza del 95% para la diferencia de ROUGE-L, calculado con bootstrap pareado de 10.000 remuestreos, es [+0,031, +0,070], que excluye el cero. Mejoraron 15 de las 17 temáticas; cripto/fintech, gestión de inversiones y patrimonios, y derivados/riesgo empeoraron ligeramente. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 30 GB según el autor (pesos de 14,77B parámetros más overhead).
- VRAM estimada en 4-bit NF4: no disponible de forma explícita; por el tamaño de parámetros se sitúa en torno a 8-10 GB de pesos, más caché KV.
- GPU recomendadas: NVIDIA GB10 (DGX Spark) fue la usada en entrenamiento; para inferencia en bf16 se requiere una GPU con 30 GB o más (A100 40GB, H100, L40S, RTX 6000 Ada).
- GPU de consumo: en bf16 no cabe en RTX 4090 (24 GB); con cuantización 4-bit NF4 es viable en RTX 4090 y potencialmente en GPUs de 16 GB con contexto reducido.
- Opciones de despliegue: transformers con `attn_implementation="sdpa"` y `device_map="auto"`; BitsAndBytes para 4-bit; compatible con text-generation-inference y endpoints compatibles según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-14B-BCFinance | 14,77B | No disponible | Finanzas coreanas (QLoRA fusionado) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-14B (base) | 14,77B | No disponible | Generalista multilingüe | Apache 2.0 | Hugging Face |
| Alternativas de finanzas coreanas de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con otros ajustes financieros coreanos de 14B no está disponible en la información proporcionada. Frente a su base, la única diferencia medible documentada es la mejora en ROUGE-L y Jaccard sobre el conjunto de validación del propio autor.

## Limitaciones y advertencias

- Respuestas cortas: la media generada es de 328 tokens frente a 716 de las referencias; el 33,4% de los ejemplos de entrenamiento se truncaron en el límite de 1024 tokens, lo que enseñó al modelo a cerrar pronto. El autor recomienda reentrenar con `max_length=2048` para elevar la cobertura del 73% al 98%.
- Naturaleza de la mejora: la precisión sube un 40% pero el recall solo un 11%; la ganancia proviene sobre todo de eliminar relleno, no de cubrir más contenido de referencia.
- Adherencia al rol del system prompt debilitada: el modelo responde preguntas fuera de dominio aunque el system prompt lo restrinja a finanzas (el base rechaza una pregunta de cocina y este la responde). Requiere ejemplos de rechazo si se necesita control de dominio.
- Precisión factual no verificada: ROUGE-L mide solapamiento superficial, no veracidad; se confirmaron correcciones puntuales de alucinaciones, pero no se demostró una reducción general.
- Riesgo de alucinación en contenido financiero: el autor advierte explícitamente que las salidas pueden ser factualmente erróneas y deben verificarse contra fuentes oficiales.
- Uso prohibido como base para decisiones de inversión o asesoramiento financiero según la model card.
- Cobertura lingüística limitada a coreano e inglés; no se documentan otros idiomas.
- Sin datos publicados de benchmarks estándar ni de latencia/throughput en producción.
- Licencia Apache 2.0 heredada del base, sin restricciones adicionales documentadas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/youknowho/Qwen3-14B-BCFinance
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Dataset de entrenamiento: https://huggingface.co/datasets/BCCard/BCAI-Finance-Kor
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
