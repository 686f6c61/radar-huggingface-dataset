# yumiao-dev/Yumiao-0.1B-Chat

## Resumen

Yumiao-0.1B-Chat es un modelo de lenguaje conversacional de tipo decoder-only con 100.092.672 parámetros (aproximadamente 0,1B), desarrollado por yumiao-dev. Se obtiene mediante un ajuste fino supervisado (SFT) sobre el modelo base Yumiao-0.1B-Base, y está pensado como un modelo de muy bajo coste computacional para experimentación, docencia y despliegue en entornos con recursos limitados. Su relevancia no radica en capacidades de razonamiento avanzado, sino en servir como caso práctico y reproducible de todo el ciclo de vida de un modelo pequeño: tokenización, preentrenamiento sobre corpus públicos, ajuste conversacional y evaluación con lm-evaluation-harness.

La arquitectura sigue el patrón LLaMA: 12 capas de decoder, dimensión oculta de 768, atención con GQA (12 cabezas de consulta y 4 de clave/valor), activación SwiGLU con dimensión intermedia de 2048, RoPE y embeddings compartidos entre entrada y cabeza de salida. El preentrenamiento se realizó sobre unos 8B tokens de corpus públicos en chino e inglés, y el ajuste conversacional utiliza únicamente 4.000 ejemplos (1.000 de identidad y 3.000 de instrucciones generales en chino).

Se distribuye con licencia Apache-2.0, pesos en safetensors, integración con transformers y compatibilidad con text-generation-inference. Su ventana de contexto no está declarada de forma explícita en la información disponible. Es un modelo que debe evaluarse como lo que es: una base didáctica y ligera, con conocimiento del mundo muy limitado y capacidad de instrucción restringida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo LLaMA (12 capas, d=768, GQA 12 Q / 4 KV, SwiGLU 2048, RoPE, tied embedding) |
| Parametros totales | 100.092.672 (aproximadamente 0,1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta variantes GGUF ni cuantizaciones) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal con 12 capas, dimensión oculta de 768 y 12 cabezas de atención con grouped-query attention (12 cabezas de consulta, 4 de clave/valor). Emplea SwiGLU con dimensión intermedia de 2048, codificación posicional rotatoria (RoPE) y embeddings de entrada compartidos con la cabeza de lenguaje. Del total de parámetros, 24,58M corresponden al embedding compartido y 75,52M a las 12 capas.

El preentrenamiento del modelo base se realizó durante 122.000 pasos sobre aproximadamente 8B tokens, con una loss final de 2,96, usando corpus como AI-ModelScope/chinese-c4 y HuggingFaceFW/fineweb-edu. El ajuste conversacional (SFT) se hizo sobre el modelo base con 1.000 preguntas de identidad generadas por plantilla a partir de una tabla de hechos y 3.000 instrucciones generales extraídas de tatsu-lab/alpaca-gpt4-data-zh (filtradas a 30–900 caracteres). Se entrenó 1 época, 500 pasos, learning rate 5e-5 con decaimiento coseno y warmup 0, batch efectivo de 8 × 512 y una GPU NVIDIA A10 de 24 GB, alcanzando una loss final de 2,43. Solo se calcula la pérdida sobre los segmentos del asistente (los tokens del prompt se enmascaran con -100) y se aplica un desplazamiento estricto de etiquetas para evitar fugas de tokens.

## Capacidades

- Generación de texto conversacional en chino e inglés, con formato de chat definido por plantilla (`<|system|>`, `<|user|>`, `<|assistant|>`).
- Autoconocimiento básico: responde correctamente a preguntas sobre su identidad, quién lo entrenó y su número de parámetros (2 de 2 muestras correctas según el autor).
- Aritmética muy elemental: acierta en sumas de un dígito (responde "2.0" a 1+1), con errores a partir de dos o tres dígitos.
- Descripción genérica de conceptos y lugares (por ejemplo, "qué es un gato" o "presenta Chongqing"), con contenido superficial y errores factuales frecuentes.
- Capacidad limitada de seguir instrucciones vistas durante el SFT; fuera de esa distribución tiende a volver a modo de continuación de texto.
- Rechazo o evasión de temas sensibles o NSFW, consecuencia de la ausencia de este tipo de datos en el entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Docencia y aprendizaje de pipelines de IA: permite reproducir de principio a fin tokenización, preentrenamiento, SFT y evaluación en una sola GPU de 24 GB, con un coste de entrenamiento bajo y resultados medibles.
- Pruebas de integración con transformers y TGI: sirve como modelo de juguete para validar plantillas de chat, generación con `apply_chat_template` y despliegue en text-generation-inference antes de pasar a modelos mayores.
- Evaluación comparativa de modelos pequeños: su informe con lm-evaluation-harness 0.4.9 frente a GPT-2 124M lo convierte en una referencia útil para estudiar el efecto del corpus y del SFT en modelos de escala 0,1B.
- Asistente conversacional de dominio acotado en chino: con 1–2 turnos de contexto y preguntas dentro de la distribución de alpaca-gpt4-data-zh, puede usarse en demos de atención al cliente o FAQ controladas, siempre con revisión humana.
- Generación de texto breve y plantillas: adecuado para tareas de continuación o reformulación de frases cortas en chino e inglés donde no se requiera precisión factual.
- Investigación sobre sobreajuste y olvido catastrófico: el propio autor documenta la subida de perplejidad en WikiText-2 (de 91,1 a 103,9) tras el SFT, lo que lo hace útil como caso de estudio de regularización y mezcla de datos.
- Prototipado en dispositivos con poca VRAM: al ocupar el repositorio 0,2 GB y tener 100M de parámetros, cabe en GPUs de consumo y en CPU para pruebas rápidas de latencia y decodificación.

## Benchmarks y rendimiento

Evaluación del autor con lm-evaluation-harness 0.4.9, zero-shot, CPU fp32, comparando el modelo base Yumiao-0.1B-Base (100M) con GPT-2 124M:

| Tarea | Métrica | Baseline aleatorio | GPT-2 124M | Yumiao-Base 100M |
|---|---|---|---|---|
| LAMBADA | accuracy de generación ↑ | — | 32,56% | 20,57% |
| PIQA | accuracy ↑ | 50,0% | 62,89% | 59,52% |
| WinoGrande | accuracy ↑ | 50,0% | 51,62% | 51,07% |
| ARC-Easy | accuracy ↑ | 25,0% | 43,81% | 40,15% |
| SciQ | accuracy ↑ | 25,0% | 75,20% | 76,40% |
| C-Eval (chino) | accuracy ↑ | 25,0% | 23,18% | 23,63% |
| LAMBADA | perplejidad ↓ | — | 40,06 | 152,42 |
| WikiText-2 | perplejidad ↓ | — | 37,37 | 103,94 |

El autor indica además que, tras el SFT, la perplejidad en WikiText-2 pasa de 91,1 a 103,9, señal de sobreajuste. No se han publicado resultados de benchmarks específicos del modelo Chat (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 0,2 GB para los pesos (100M de parámetros), más el overhead de activaciones y caché KV, por lo que cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; el autor entrenó el SFT en una NVIDIA A10 de 24 GB, pero para inferencia bastan tarjetas de consumo como RTX 3060, RTX 4060 o superiores. También puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en todas las gamas actuales, e incluso en placas integradas para pruebas de baja concurrencia.
- Opciones de despliegue: transformers (con `AutoModelForCausalLM` y `device_map="auto"`), text-generation-inference (el modelo está etiquetado como compatible y con endpoints compatibles). No se documentan pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa no oficial.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yumiao-0.1B-Chat | 100M | no disponible | LAMBADA 20,57%; PIQA 59,52%; C-Eval 23,63% (base) | Apache-2.0 | Hugging Face, transformers, TGI |
| GPT-2 124M | 124M | 1.024 tokens | LAMBADA 32,56%; PIQA 62,89%; WikiText-2 ppl 37,37 | MIT (según el autor, no verificado en la información) | Hugging Face, amplio ecosistema |
| Modelos de ~0,1B de la familia Qwen o SmolLM | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible se limita a GPT-2 124M, que supera al modelo en LAMBADA, PIQA y perplejidad, mientras que Yumiao-Base obtiene mejores resultados en SciQ y C-Eval. No se dispone de datos verificados de otras alternativas de 0,1B en la información proporcionada.

## Limitaciones y advertencias

- Conocimiento del mundo extremadamente limitado: con 100M de parámetros y 8B tokens de preentrenamiento, las respuestas sobre personas, lugares y fechas no son fiables.
- Alucinación factual frecuente: el propio autor advierte que las descripciones de conceptos y lugares son "superficiales y a veces erróneas".
- Aritmética deficiente: acierta ocasionalmente en operaciones de dos dígitos, pero falla de forma sistemática con tres dígitos o más.
- Generalización de instrucciones débil: el SFT usa solo 4.000 ejemplos, por lo que ante tareas no vistas el modelo revierte a continuación de texto.
- Repetición: la decodificación greedy produce bucles; con temperature inferior a 0,5 también aparece repetición. El autor recomienda temperature 0,7–0,8, top_p 0,9 y repetition_penalty 1,15–1,3.
- Contexto conversacional corto: útil solo en 1–2 turnos; a partir de ahí pierde el hilo.
- Idiomas: solo chino e inglés; no hay evidencia de calidad en castellano.
- Sesgos: no documentados por el autor; al entrenar con corpus web (C4, FineWeb-Edu) y alpaca-gpt4-data-zh, es previsible que herede sesgos de esas fuentes, aunque no se han medido.
- Licencia Apache-2.0: permite uso comercial, pero dado el rendimiento y las limitaciones descritas, no es recomendable para producción sin una evaluación específica del dominio.
- No se documenta longitud de contexto, cuantizaciones ni soporte de tool calling, lo que limita su uso en pipelines de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yumiao-dev/Yumiao-0.1B-Chat
- Modelo base: https://huggingface.co/yumiao-dev/Yumiao-0.1B-Base
- Dataset de instrucciones: https://huggingface.co/datasets/tatsu-lab/alpaca-gpt4-data-zh
- Dataset chino C4: https://huggingface.co/datasets/AI-ModelScope/chinese-c4
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Repositorio de evaluación del autor: carpeta `eval/` del repositorio del modelo en Hugging Face
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Text-generation-inference: https://github.com/huggingface/text-generation-inference
