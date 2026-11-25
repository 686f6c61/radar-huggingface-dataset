# yuhuanstudio/Yunmo-Next-1B-Base

## Resumen

Yunmo-Next-1B-Base es un modelo de lenguaje decoder-only de 1.008 millones de parámetros (1.008B) entrenado desde cero por el autor independiente yuhuanstudio sobre 19.760 millones de tokens. Su rasgo diferencial es que está orientado prioritariamente al chino tradicional, con inglés, código y matemáticas incorporados en la mezcla de preentrenamiento, y emplea una arquitectura híbrida poco habitual en este rango de tamaño: intercala una capa de atención con ventana deslizante y atención global de consultas agrupadas (GQA) por cada tres capas de Kimi Delta Attention (KDA), un mecanismo de atención lineal recurrente.

El modelo se distribuye como checkpoint de preentrenamiento puro: no ha pasado por ajuste de instrucciones ni por alineamiento, por lo que no funciona como asistente conversacional. La versión Instruct derivada se publica por separado. La relevancia de esta ficha reside en su carácter de investigación: documenta técnicas como el crecimiento en profundidad de 24 a 60 capas durante el entrenamiento y el uso de Attention Residuals de bajo rango, además de estar entrenado íntegramente en GPUs de consumo (RTX 4070 Ti de 12 GB y una RTX 5090 alquilada).

La licencia es Apache-2.0 para pesos, tokenizador y código de inferencia, si bien los datos de entrenamiento no se redistribuyen. El contexto validado en inferencia es de 16K tokens, tras un entrenamiento por etapas de 8K a 32K y vuelta a 16K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 15 capas GQA + 45 capas KDA (patrón GQA → KDA → KDA → KDA), pre-norm RMSNorm, SwiGLU |
| Parametros totales | 1.008.058.231 (embedding atado con la cabeza de salida) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16K validado en inferencia (entrenamiento por etapas 8K → 32K → 16K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (tradicional prioritario), inglés |
| Licencia | Apache-2.0 (pesos, tokenizador y código); datos de entrenamiento no redistribuidos |
| Formato de pesos | safetensors (BF16 y FP32) |

## Arquitectura y entrenamiento

La arquitectura se organiza en celdas de cuatro capas con el patrón `GQA → KDA → KDA → KDA`. Las capas GQA emplean 8 cabezas de consulta y 2 cabezas de clave/valor, con una capa de atención de ventana deslizante y otra global por celda. Las capas KDA implementan Kimi Delta Attention, un mecanismo de atención lineal recurrente que reduce el coste computacional en secuencias largas. La anchura oculta es de 1.024 y el modelo alcanza 60 capas, aunque arrancó con 24 y creció en profundidad durante el entrenamiento, una técnica de crecimiento progresivo poco frecuente. Además, enruta información a través de la profundidad mediante Attention Residuals de bajo rango.

El preentrenamiento consumió 19.761.135.616 tokens en BF16, con una mezcla que incluye FineWeb2-HQ, FineWeb-2, Ultra-FineWeb, Ultra-FineWeb-L3, FineWeb-Edu-Chinese-V2.1, IndustryCorpus2, Wikipedia en chino tradicional, Wikisource en chino tradicional, fineweb-edu, finemath, stack-v3-train, issues de Kaggle y el dataset minimind. El vocabulario es de 65.536 entradas (65.280 IDs de texto y 256 IDs de protocolo). El entrenamiento se ejecutó en una sola GPU a la vez: una RTX 4070 Ti de 12 GB para aproximadamente 10.300 millones de tokens y una RTX 5090 alquilada para unos 9.400 millones. No se documenta en la información disponible el uso de RLHF o DPO, coherente con su naturaleza de modelo base sin alinear.

## Capacidades

- Generación de texto autoregresiva en chino tradicional e inglés.
- Modelo base sin ajuste de instrucciones: no responde a formatos de chat ni sigue instrucciones de forma fiable.
- Capacidad de razonamiento emergente limitada por el tamaño (1B) y por el volumen de entrenamiento (19.76B tokens).
- Generación de código y matemáticas, dado que stack-v3-train, issues de Kaggle y finemath forman parte de la mezcla.
- Soporte de tool calling / function calling: no disponible (no es un modelo alineado).
- Soporte de agentes y razonamiento multi-paso: no disponible en el checkpoint base.
- Capacidades multilingües limitadas a chino e inglés.
- Modo thinking, visión o audio: no disponible.
- Capacidad de continuación de texto y modelado de lenguaje para tareas de evaluación zero-shot y few-shot.

## Casos de uso

- Investigación en arquitecturas híbridas de atención: el modelo sirve como banco de pruebas reproducible para comparar GQA con KDA en un rango de 1B parámetros, dado que el código y los pesos son Apache-2.0 y el informe técnico está publicado.
- Estudio del crecimiento en profundidad: permite analizar cómo afecta pasar de 24 a 60 capas durante el preentrenamiento, un fenómeno poco documentado en modelos abiertos de este tamaño.
- Fine-tuning para chino tradicional: al estar entrenado con Wikipedia y Wikisource en zh-tw, es una base adecuada para ajustar tareas de procesamiento de lenguaje natural en variantes tradicionales, donde escasean los modelos abiertos.
- Generación de texto especializada tras ajuste supervisado: partiendo del checkpoint base, un equipo puede aplicar SFT para dominios concretos (legal, editorial, documentación) en chino tradicional.
- Evaluación de eficiencia en GPUs de consumo: su entrenamiento en una RTX 4070 Ti de 12 GB lo convierte en referencia para estudiar pipelines de preentrenamiento de bajo presupuesto.
- Reproducción de benchmarks académicos: al incluir resultados zero-shot y few-shot en ARC, HellaSwag, PIQA, Winogrande, MMLU, TMMLU+, XStoryCloze, XCOPA y XWinograd, sirve para validar harness de evaluación en modelos pequeños.
- Base para destilación: un modelo de 1B con contexto de 16K puede actuar como estudiante en experimentos de destilación desde modelos mayores hacia chino tradicional.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Configuración | Métrica | Valor |
|---|---|---|---|
| ARC-Easy | 0-shot | acc_norm | 50,3 |
| ARC-Challenge | 0-shot | acc_norm | 29,2 |
| HellaSwag | 0-shot | acc_norm | 41,3 |
| PIQA | 0-shot | acc_norm | 65,9 |
| Winogrande | 0-shot | acc | 56,1 |
| OpenBookQA | 0-shot | acc_norm | 34,4 |
| SciQ | 0-shot | acc_norm | 85,2 |
| LAMBADA (OpenAI) | 0-shot | acc | 44,5 |
| MMLU | 5-shot | acc | 22,9 |
| TMMLU+ | 0-shot | acc | 25,0 |
| XStoryCloze (zh) | 0-shot | acc | 57,5 |
| XCOPA (zh) | 0-shot | acc | 61,8 |
| XWinograd (zh) | 0-shot | acc | 67,5 |

Los valores son coherentes con un modelo base de 1B entrenado con menos de 20.000 millones de tokens: el MMLU 5-shot de 22,9 y el ARC-Challenge de 29,2 reflejan un conocimiento factual y razonamiento todavía incipientes, mientras que SciQ (85,2) y PIQA (65,9) muestran un mejor desempeño en tareas de sentido común y ciencia básica.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2 GB para los pesos (1.008B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica unos 3-4 GB con contexto moderado.
- VRAM estimada en FP32: aproximadamente 4 GB solo para pesos.
- GPU recomendadas: cualquier GPU con 8 GB o más para BF16; una RTX 4070 Ti de 12 GB fue la hardware empleada en parte del entrenamiento, por lo que la inferencia cabe holgadamente.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4090, RTX 5090, así como en GPUs de 8 GB con cuantización (aunque no se documentan formatos de cuantización).
- Opciones de despliegue: transformers (librería declarada, con `custom_code` por la implementación KDA); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Arquitectura | Disponibilidad |
|---|---|---|---|---|---|
| Yunmo-Next-1B-Base | 1,008B | 16K validado | Apache-2.0 | Híbrida GQA + KDA | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2K (original) | Apache-2.0 | Transformer denso | Hugging Face |
| Qwen2.5-1.5B | 1,54B | 32K | Apache-2.0 | Transformer denso | Hugging Face |
| SmolLM2-1.7B | 1,7B | 8K | Apache-2.0 | Transformer denso | Hugging Face |

La comparación directa es difícil porque Yunmo-Next-1B-Base es un modelo base sin alinear y entrenado con un volumen de tokens notablemente inferior (19,76B) al de TinyLlama (3T), Qwen2.5 (18T) o SmolLM2 (11T). Su ventaja relativa es la especialización en chino tradicional y la arquitectura híbrida con atención lineal, mientras que sus competidores ofrecen mayor madurez de ecosistema y versiones instruct. No se dispone de resultados de benchmarks comparables de los otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones ni alineamiento: no debe usarse como asistente conversacional ni desplegarse directamente en producción orientada a usuario final.
- Riesgo elevado de alucinación y de generación de texto incoherente en tareas de razonamiento complejo, dado el reducido volumen de entrenamiento (19,76B tokens) y el tamaño de 1B.
- Sesgos conocidos: no documentados en la información disponible; la mezcla de datos incluye fuentes web que pueden introducir sesgos de dominio, idioma y cultura.
- Limitaciones de idioma: solo chino e inglés; el chino tradicional es prioritario, pero el rendimiento en chino simplificado no está documentado.
- Contexto validado de 16K, aunque el entrenamiento pasó por 32K; no se garantiza un comportamiento fiable por encima de 16K.
- Restricciones de licencia: los pesos son Apache-2.0 y permiten uso comercial, pero los datos de entrenamiento no se redistribuyen, lo que puede afectar a la reproducibilidad y a auditorías de procedencia.
- Requiere `trust_remote_code` en transformers por la implementación personalizada de KDA, lo que implica revisar el código antes de ejecutarlo en entornos sensibles.
- No se documentan formatos de cuantización ni soporte en motores de inferencia de alto rendimiento, lo que limita el despliegue optimizado.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Base
- Modelo Instruct derivado: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct
- Tokenizador: https://huggingface.co/yuhuanstudio/Yunmo-Next-Tokenizer
- Informe técnico (PDF): https://github.com/YuhuanStudio/Yunmo-Next-1B/blob/main/paper/yunmo-next-1b.pdf
- Repositorio con informes detallados: https://github.com/YuhuanStudio/Yunmo-Next-1B
