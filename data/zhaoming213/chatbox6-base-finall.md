# Zhaoming213/ChatBox6-base-finall

## Resumen

ChatBox6-base-finall es un modelo de lenguaje preentrenado desde cero por el desarrollador independiente Zhaoming213, sexta iteración de la serie ChatBox-unrestricted. Se trata de un transformer decoder-only de 93,4 millones de parámetros (hidden_size 768, 12 capas, longitud máxima de secuencia 340 tokens), entrenado sobre un corpus en chino de aproximadamente 8,2 GB que combina datos enciclopédicos, texto web, Wikipedia y diálogo comunitario. Su rasgo distintivo declarado es la ausencia de mecanismos de rechazo ("uncensored"), lo que según el autor permite generar contenido adulto y político sin filtros.

El modelo no es conversacional: es una base preentrenada pensada como punto de partida para fine-tuning posterior. El autor lo presenta como una alternativa actualizada al enfoque GPT-2, argumentando que equilibra mejor el tamaño del dataset y el número de parámetros para lograr una convergencia completa con hardware modesto (dos T4 de 16 GB durante 78 horas). La relevancia práctica es limitada: se trata de un experimento de nicho, sin benchmarks publicados, con 0 descargas y 0 likes en el momento de la consulta, y con una ventana de contexto de solo 340 tokens.

La ficha se basa exclusivamente en la model card y en los metadatos de Hugging Face. No hay información sobre pipeline, resultados de evaluación ni detalles de arquitectura más allá de los parámetros declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (preentrenado desde cero) |
| Parametros totales | 93.410.304 (93,4 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 340 tokens (max_seq_len) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con hidden_size de 768 y 12 capas, lo que arroja 93,4 M de parámetros. La longitud máxima de secuencia es de 340 tokens, un valor muy reducido que limita drásticamente el contexto manejable. El autor no detalla el mecanismo de atención, la función de activación, el esquema de positional encoding ni si emplea weight tying entre embedding y cabeza de salida.

El preentrenamiento se realizó desde cero durante más de 78 horas en dos GPU T4 de 16 GB, con "decenas de miles de pasos" según la model card. El dataset, publicado como Zhaoming213/ChinesePT, se compone de cuatro fuentes: baikeqa2018 (1,32 GB, corte 2018), ChineseWebText (2,54 GB, corte 2023), wikizh2019 (1,23 GB, corte 2019) y CommunityDialogue (3,14 GB, corte 2019), sumando aproximadamente 8,2 GB. No se especifica el número de tokens, la composición exacta tras el filtrado, ni si hubo fases de RLHF, DPO o SFT. El autor afirma que el ajuste fino de la mezcla de datos y el tamaño del modelo busca una convergencia global completa, en contraste con GPT-2, que según él estaba infraentrenado para su escala.

## Capacidades

- Generación de texto en chino a partir de prompts cortos, con estilo de continuación de texto web y diálogo.
- Continuación de conversaciones y respuestas a preguntas simples, aunque el modelo es una base preentrenada y no un modelo instruido.
- Generación de contenido sin filtros de rechazo, incluyendo temática adulta y política, según declara el autor.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe no disponible: solo se declara chino.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Fine-tuning para dominios conversacionales en chino: el modelo sirve como base de 93 M de parámetros para SFT sobre diálogo, aprovechando que ya ha visto 3,14 GB de CommunityDialogue y que su tamaño permite entrenar en una sola GPU consumer.
- Investigación sobre modelos sin censura: útil para estudiar cómo se comporta un modelo pequeño preentrenado sin mecanismos de rechazo en temas sensibles, con fines de análisis de sesgos y alineación.
- Generación de texto creativo en chino con estilo informal: continuaciones de relatos, foros o hilos de discusión, dado el sesgo del corpus hacia texto web y diálogo comunitario.
- Prototipado rápido de pipelines de generación: al ocupar 0,2 GB en safetensors, se puede cargar en memoria en segundos y servir como baseline en pruebas de infraestructura (TGI, vLLM) antes de pasar a modelos mayores.
- Experimentos educativos de preentrenamiento: la model card documenta configuración de hardware, dataset y tiempos, lo que lo convierte en una referencia para reproducir un entrenamiento desde cero a pequeña escala.
- Generación de datos sintéticos en chino para aumento de corpus: con supervisión y filtrado posteriores, puede producir continuaciones de texto que alimenten otros pipelines, aunque la calidad es limitada por el tamaño y el contexto de 340 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica cuantitativa; solo ejemplos cualitativos de diálogo y una tabla incompleta sobre "tasas de rechazo" de otros modelos que no aporta cifras de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (93,4 M de parámetros × 4 bytes ≈ 374 MB de pesos, más overhead de activaciones y KV cache); en fp16, aproximadamente 187 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el propio autor entrenó en dos T4 de 16 GB, pero la inferencia cabe holgadamente en GPUs mucho menores.
- Cabe en GPU consumer: sí, en cualquier RTX (incluso series GTX 10xx), así como en CPU.
- Opciones de despliegue: al estar en safetensors y etiquetado con text-generation-inference, es compatible con TGI; también puede cargarse con transformers, y convertirse a GGUF para llama.cpp u Ollama. La model card indica ejecutar "Run.py" con los archivos en una carpeta "model", lo que sugiere un script propio no incluido en el repo.
- Latencia y throughput estimados: no disponibles. Con 93 M de parámetros y contexto de 340 tokens, la latencia esperada es de milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| ChatBox6-base-finall | 93,4 M | 340 | zh | Apache 2.0 | No |
| GPT-2 medium | 355 M | 1024 | en (principalmente) | MIT | Sí (evaluaciones originales) |
| Qwen2.5-0.5B | 494 M | 32 768 | multilingüe | Apache 2.0 | Sí |
| SmolLM-135M | 135 M | 2048 | en | Apache 2.0 | Sí |

La comparación es desfavorable en contexto y en disponibilidad de evaluaciones: ChatBox6 ofrece 340 tokens frente a los 2048 de SmolLM-135M o los 32 768 de Qwen2.5-0.5B, y no publica métricas. Su ventaja relativa es el tamaño mínimo (93 M) y el enfoque explícitamente sin censura, que no ofrecen los modelos citados. No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ventana de contexto de solo 340 tokens: insuficiente para conversaciones multi-turno, documentos o razonamiento con cadenas largas.
- Modelo base preentrenado, no instruido: no sigue instrucciones de forma fiable y requiere fine-tuning para uso conversacional.
- Riesgo alto de alucinación y de texto incoherente: los ejemplos de la model card muestran respuestas desconectadas del prompt (por ejemplo, a "你是谁" responde con preguntas sobre temas ajenos).
- Sesgos: el corpus incluye texto web y datos de 2018-2023 sin documentar filtrado de sesgos; el autor declara explícitamente ausencia de censura en contenido político y adulto, lo que puede producir material ofensivo o desinformativo.
- Idioma: solo chino; no hay soporte documentado de castellano ni de otras lenguas.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado sin filtros puede incumplir normativas locales (por ejemplo, en la UE o China) y traslada al desplegador la responsabilidad legal.
- Sin benchmarks ni evaluaciones de seguridad publicadas, y con 0 descargas: no hay evidencia externa de calidad ni de estabilidad en producción.
- El autor indica que esta podría ser la última generación de la serie y que futuras versiones priorizarán precisión factual sobre ausencia de censura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zhaoming213/ChatBox6-base-finall
- Dataset ChinesePT: https://huggingface.co/datasets/Zhaoming213/ChinesePT
- Generación 1: https://huggingface.co/Zhaoming213/ChatBox-unrestricted
- Generación 2: https://huggingface.co/Zhaoming213/ChatBox2-unrestricted
- Generación 3: https://huggingface.co/Zhaoming213/ChatBox3-unrestricted
- Generación 3.1: https://huggingface.co/Zhaoming213/ChatBox3.1-unrestricted
- Generación 4: https://huggingface.co/Zhaoming213/ChatBox4-unrestricted
- Generación 5: https://huggingface.co/Zhaoming213/ChatBox5
