# WariHima/llm-jp-4-33b-thinking

## Resumen

LLM-jp-4-33b-thinking es un modelo de lenguaje denso de 33.219 millones de parametros desarrollado por el Research and Development Center for Large Language Models del National Institute of Informatics (NII) de Japon, dentro de la serie LLM-jp-4. Se trata de la variante "thinking" de mayor tamano de la familia, disenada para razonamiento deliberado y conversacion multilingue japones-ingles. El modelo se entrena en tres fases: pre-training y mid-training con un total de 11,7 billones de tokens, seguido de un post-training con SFT y DPO (sin reinforcement learning). Su ventana de contexto alcanza los 65.536 tokens, lo que le permite manejar documentos extensos y conversaciones multi-turno de larga duracion.

El modelo destaca por ser completamente abierto: no solo se publican los pesos bajo licencia Apache 2.0, sino tambien los corpus de pre-training, mid-training, SFT y DPO, lo que lo convierte en uno de los modelos japoneses mas transparentes en cuanto a trazabilidad de datos. Su tokenizer se basa en un modelo Unigram con byte-fallback derivado de llm-jp-tokenizer v4.0, y su chat template es compatible con el formato de respuesta OpenAI Harmony. Segun los resultados publicados por el NII, supera a todos los modelos LLM-jp-4 Thinking anteriores en los cuatro benchmarks evaluados (MT-Bench JA/EN, AnswerCarefully y llm-jp-instructions).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura tipo Llama) |
| Parametros totales | 33.219.548.160 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | No disponible (solo safetensors en precision nativa) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (66,5 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo es un transformer denso con 64 capas, hidden size de 5.120 y 40 cabezas de atencion. Los parametros de embedding suman 1.006.632.960 y los no-embedding 32.212.915.200. La arquitectura sigue el patron de los modelos Llama, con atencion causal completa, sin mecanismos MoE ni SSM. El tokenizer es un modelo Unigram con byte-fallback construido a partir de llm-jp-tokenizer v4.0, que soporta vocabulario bilingue japones-ingles con cobertura amplia de caracteres CJK.

El entrenamiento se realizo en un pipeline multi-etapa: primero pre-training y mid-training sobre el corpus llm-jp-corpus-v4.1 y llm-jp-corpus-midtraining-v2, con un total de 11,7 billones de tokens. La mayor parte de estos corpus son publicos, aunque algunas porciones se excluyen por restricciones de licencia. Posteriormente se aplico post-training con supervised fine-tuning (SFT) seguido de direct preference optimization (DPO), sin reinforcement learning. Los datasets de post-training (SFT y DPO) estan publicados en HuggingFace, lo que permite reproducir completamente el proceso de alineacion.

## Capacidades

- Generacion de texto y conversacion multi-turno en japones e ingles, con soporte de chat template compatible con OpenAI Harmony.
- Razonamiento deliberado ("thinking"): el modelo esta optimizado para generar cadenas de razonamiento antes de responder, lo que mejora la precision en tareas complejas.
- Generacion de codigo en 13 lenguajes de programacion: C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala y TypeScript.
- Comprension de contexto largo: 65.536 tokens de ventana, suficiente para documentos extensos, codigo fuente de gran tamano o conversaciones prolongadas.
- Capacidades multilingues limitadas a japones e ingles, con fuerte dominio del japones (idioma principal del corpus de entrenamiento).
- Seguridad y alineacion evaluada mediante el benchmark AnswerCarefully en japones (336 preguntas del test set v2.0).

## Casos de uso

- Atencion al cliente bilingue: el modelo puede gestionar conversaciones multi-turno en japones e ingles con contexto largo (65.536 tokens), lo que permite mantener el historial completo de una interaccion de soporte sin truncamientos. Adecuado para empresas que operan en el mercado japones con clientes internacionales.
- Generacion de codigo en entornos de desarrollo japoneses: soporta 13 lenguajes de programacion y puede integrarse en pipelines de CI/CD para generar tests, documentacion o refactorizaciones. Su licencia Apache 2.0 permite uso comercial sin restricciones.
- Analisis de documentos legales y tecnicos: la ventana de 65.536 tokens permite procesar contratos, patentes o especificaciones tecnicas completas en japones, con capacidad de resumir, extraer clausulas o responder preguntas sobre el contenido.
- Razonamiento y resolucion de problemas en educacion: el modo "thinking" genera cadenas de razonamiento paso a paso, util para tutoria automatica en matematicas, fisica o logica en entornos educativos japoneses.
- Investigacion academica en PNL: al ser un modelo completamente abierto (pesos, corpus y datasets de alineacion publicados), es una base ideal para estudios de interpretabilidad, fine-tuning especifico o evaluacion de sesgos en modelos japoneses.
- Traduccion y localizacion japones-ingles: su entrenamiento bilingue equilibrado permite traduccion de alta calidad, aunque no esta optimizado especificamente para esta tarea. Puede usarse como motor de traduccion asistida en flujos de localizacion de software.

## Benchmarks y rendimiento

El modelo fue evaluado con el framework llm-jp-judge, utilizando el evaluador `gpt-5.4-2026-03-05` sobre cuatro benchmarks: MT-Bench (JA y EN), AnswerCarefully y llm-jp-instructions. Los resultados se calcularon como promedio de tres rondas de inferencia. Segun el anuncio oficial del NII, el modelo supera a todos los modelos LLM-jp-4 Thinking publicados anteriormente en los cuatro benchmarks, pero los valores numericos concretos no estan disponibles en la informacion proporcionada (la tabla de la model card aparece truncada). Se advierte que el evaluador mas reciente produce puntuaciones mas bajas que el `gpt-4o-2024-08-06` usado en la serie llm-jp-3, por lo que las comparaciones directas entre series no son validas.

No se han publicado resultados de benchmarks en la informacion disponible con valores numericos completos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 33.219 millones de parametros, se requieren aproximadamente 66 GB en FP16, 33 GB en INT8 y 17 GB en INT4. El repositorio solo publica pesos en safetensors sin cuantizaciones precalculadas.
- GPU recomendadas: para FP16 se necesitan GPUs de clase profesional como A100 80GB, H100 80GB o dos RTX 4090 (24GB cada una) con tensor parallelism. Para cuantizacion INT4, una RTX 4090 (24GB) o RTX 6000 Ada serian suficientes.
- En consumer GPU: si, pero solo con cuantizacion (GGUF/INT4) y con limitaciones de velocidad. Una RTX 3090/4090 (24GB) puede ejecutar el modelo cuantizado a 4 bits.
- Opciones de despliegue: al ser un modelo transformers estandar, es compatible con vLLM, TensorRT-LLM, llama.cpp (tras conversion a GGUF), Ollama y Text Generation Inference (TGI). El tag `text-generation-inference` en HuggingFace confirma compatibilidad con TGI.
- Latencia y throughput: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo denso de 33B en FP16 en una A100 80GB suele alcanzar entre 20 y 40 tokens/segundo en generacion autoregresiva, pero estos valores no estan confirmados para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Tipo |
|---|---|---|---|---|---|
| llm-jp-4-33b-thinking | 33,2B densos | 65.536 | ja, en | Apache 2.0 | Denso, thinking |
| llm-jp-4-8b | 8,6B densos | 65.536 | ja, en | Apache 2.0 | Denso |
| llm-jp-4-32b-a3b | 32,1B totales, 3,8B activos | 65.536 | ja, en | Apache 2.0 | MoE (128 expertos, 8 activos) |

Los tres modelos comparten tokenizer, corpus de entrenamiento y licencia. La variante 33B densa ofrece mayor capacidad de razonamiento que la 8B, pero con un coste computacional muy superior. La variante MoE 32B-A3B ofrece un equilibrio entre calidad y eficiencia, activando solo 3,8B parametros por token. Segun el NII, el modelo 33B-thinking supera a todos los anteriores de la serie en los benchmarks internos. No se dispone de comparativas publicadas contra modelos externos como Qwen3 o Llama 4 en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas limitados: el modelo solo soporta japones e ingles. No es adecuado para otros idiomas, incluido el espanol, y puede producir resultados degradados o incoherentes si se le solicita generar texto en otros idiomas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo donde el modo "thinking" no garantiza correccion.
- Sesgos potenciales: el corpus de entrenamiento, aunque mayoritariamente publico, puede contener sesgos culturales japoneses y occidentales. La evaluacion de seguridad se realizo principalmente en japones (AnswerCarefully), por lo que la robustez en ingles puede ser menor.
- Evaluacion con LLM-as-a-Judge: los benchmarks utilizan un evaluador automatico (gpt-5.4-2026-03-05) que produce puntuaciones mas estrictas que evaluadores anteriores. Esto dificulta la comparacion directa con modelos de la serie llm-jp-3.
- Requisitos de hardware elevados: al ser un modelo denso de 33B, la inferencia en FP16 requiere al menos 66 GB de VRAM, lo que excluye su uso en GPUs consumer sin cuantizacion.
- Formato de chat propietario: el chat template es compatible con OpenAI Harmony, pero el tokenizer difiere del asumido por la libreria `openai-harmony`, por lo que no se puede usar dicha libreria directamente para tokenizar. Hay que usar el tokenizer del modelo.
- Sin cuantizaciones oficiales: el repositorio solo publica pesos en safetensors. Las cuantizaciones GGUF/AWQ deben generarse manualmente o esperar a que la comunidad las publique.

## Enlaces

- Repositorio HuggingFace (WariHima): https://huggingface.co/WariHima/llm-jp-4-33b-thinking
- Repositorio HuggingFace oficial (llm-jp): https://huggingface.co/llm-jp/llm-jp-4-33b-thinking
- Coleccion de modelos LLM-jp-4: https://huggingface.co/collections/llm-jp/llm-jp-4-models
- Cookbook de uso (GitHub): https://github.com/llm-jp/llm-jp-4-cookbook
- Framework de evaluacion llm-jp-judge: https://github.com/llm-jp/llm-jp-judge
- Anuncio oficial del NII (japones): https://llmc.nii.ac.jp/topics/post-2941/
- Nota de prensa NII (ingles): https://www.nii.ac.jp/en/news/release/2026/0403.html
- Pagina de releases de LLM-jp: https://llm-jp.nii.ac.jp/en/release-en/
- Corpus de pre-training: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-v4.1
- Corpus de mid-training: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-midtraining-v2
- Dataset SFT: https://huggingface.co/datasets/llm-jp/llm-jp-4-thinking-sft-data
- Dataset DPO (33B): https://huggingface.co/datasets/llm-jp/llm-jp-4-33b-thinking-dpo-data
- Tokenizer llm-jp-tokenizer: https://github.com/llm-jp/llm-jp-tokenizer
