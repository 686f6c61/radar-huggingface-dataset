# teaislife/Qwen3-4B-nl2fol

## Resumen

Qwen3-4B-nl2fol es un modelo de lenguaje de 4.022.468.096 parámetros (unos 4,02 B) publicado por el usuario teaislife en Hugging Face. Es un ajuste fino del modelo denso Qwen/Qwen3-4B-Instruct-2507 orientado a una tarea muy concreta: la traducción de lenguaje natural a lógica de primer orden (NL2FOL, *natural language to first-order logic*).

El ajuste se ha realizado con TRL y, según la model card, empleando «una muestra representativa de MALLS convertida a sintaxis NLTK Prover9». El objetivo es que el modelo emita fórmulas de primer orden compatibles con el demostrador automático Prover9 a partir de enunciados en inglés, lo que lo sitúa en el terreno de la IA neuro-simbólica y de los asistentes de razonamiento formal.

Su relevancia actual es acotada y experimental: el repositorio acumula 0 descargas y 1 like, no declara licencia, no publica resultados de benchmarks y no detalla la composición ni el tamaño del conjunto de entrenamiento. Es un artefacto interesante para experimentar con pipelines de formalización automática, pero no una pieza lista para producción sin una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Qwen3); detalles de capas y atención no especificados en la model card |
| Parámetros totales | 4.022.468.096 (aproximadamente 4,02 B) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en safetensors y no hay variantes GGUF, GPTQ, AWQ o bitsandbytes publicadas por el autor |
| Idiomas soportados | inglés (en), según los metadatos de la model card |
| Licencia | no disponible (no se declara licencia en el repositorio) |
| Formato de pesos | safetensors (carga mediante transformers) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Dataset de ajuste | muestra representativa de MALLS convertida a sintaxis NLTK Prover9 (tamaño y composición no disponibles) |
| Método de ajuste | fine-tuning con TRL (técnica concreta no especificada) |
| Pipeline declarado | no disponible |
| Tamaño del repositorio | 8,1 GB |
| Fecha de creación | 2026-09-10 |
| Última actualización | 2026-09-11 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso decoder-only de la familia Qwen3 con aproximadamente 4.020 millones de parámetros, publicado por el equipo de Qwen. Se desconoce si el ajuste ha modificado la configuración arquitectónica; la model card no aporta detalles sobre número de capas, dimensión oculta, tipo de atención (GQA o similar), función de activación ni estrategia de posicionamiento. Tampoco se indica la longitud de contexto con la que fue entrenado el checkpoint ajustado.

El entrenamiento consiste en un ajuste fino supervisado (o de preferencias, no se especifica) ejecutado con la librería TRL sobre un subconjunto de MALLS traducido a la sintaxis que emplea NLTK para Prover9. No se documentan el número de tokens de entrenamiento, la composición del dataset, la proporción de ejemplos, la existencia de RLHF/DPO ni hiperparámetros como tasa de aprendizaje, épocas o tamaño de lote. La innovación técnica es, por tanto, de dominio más que de arquitectura: adaptar un modelo instructivo generalista a la generación de fórmulas de primer orden en un formato concreto de demostrador automático.

## Capacidades

- Generación de texto en inglés, heredada del modelo base instructivo Qwen3-4B-Instruct-2507.
- Traducción de lenguaje natural a lógica de primer orden (NL2FOL): es la capacidad principal y la razón de ser del ajuste.
- Emisión de fórmulas en sintaxis NLTK Prover9, el formato objetivo declarado en la model card.
- Razonamiento deductivo básico en la medida en que el modelo base lo soporta; no se documentan capacidades específicas de *chain-of-thought* o modo «thinking» en el checkpoint ajustado.
- Uso mediante `transformers` con `AutoModelForCausalLM` y `AutoTokenizer`, según el ejemplo de la model card.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos; no se declara soporte de castellano ni de otros idiomas.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Formalización automática de enunciados: dado un texto en inglés (por ejemplo, un axioma matemático o una regla de negocio), el modelo lo convierte en una fórmula de primer orden en sintaxis Prover9, que puede alimentar directamente a un demostrador automático. Es el uso para el que fue entrenado.
- Preprocesado en pipelines de razonamiento neuro-simbólico: el modelo actúa como traductor entre la interfaz en lenguaje natural y el motor lógico, de modo que el usuario final escribe en inglés y el sistema verifica con Prover9.
- Asistentes de demostración interactiva: integrado en un asistente tipo IDE o notebook, permite al usuario describir un lema y obtener una candidata a formalización que después se corrige o se prueba con el demostrador.
- Extracción de estructura lógica de textos normativos o especificaciones técnicas: conversión de condiciones, excepciones y obligaciones expresadas en prosa a fórmulas verificables, útil en auditoría de reglas y cumplimiento normativo.
- Docencia de lógica: generación de pares enunciado-formalización para crear ejercicios, o corrección asistida comparando la formalización del estudiante con la generada por el modelo (siempre con revisión humana).
- Construcción de bases de conocimiento y ontologías: obtención de axiomas formalizados a partir de descripciones textuales, que después se cargan en un razonador.
- Generación de datos sintéticos para entrenar otros sistemas: el modelo puede producir ejemplos NL-FOL adicionales que sirvan para ampliar corpus de formalización.
- Evaluación de robustez semántica: comprobar si una formulación alternativa de un mismo enunciado produce fórmulas equivalentes, como prueba de consistencia del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud de formalización, MMLU, GSM8K, HumanEval ni ninguna otra evaluación, y los resultados de búsqueda web obtenidos no contienen información relacionada con el modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parámetros (4,02 B) y de la práctica habitual de despliegue, no datos publicados por el autor:

- VRAM para los pesos en BF16/FP16: en torno a 8 GB solo para los pesos, más caché KV; cómodo en GPUs de 12-16 GB con contextos moderados.
- VRAM en FP32: en torno a 16 GB solo para los pesos, lo que exige GPUs de 24 GB o más.
- VRAM en cuantización de 8 bits (bitsandbytes, FP8, GPTQ-Int8): aproximadamente 4-5 GB de pesos; cabe en GPUs de 8 GB con contexto corto.
- VRAM en cuantización de 4 bits (GPTQ, AWQ, GGUF Q4_K_M): aproximadamente 2,5-3 GB de pesos; cabe en GPUs consumer de 6-8 GB y en ordenadores con GPU integrada de gama alta mediante llama.cpp.
- GPUs recomendadas: para producción, A100 40/80 GB, H100, L40S, A10G o L4; para desarrollo y uso local, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes.
- ¿Cabe en GPU consumer? Sí: en BF16 con 12-16 GB de VRAM y contexto moderado, y en 4 bits en GPUs de 8 GB o incluso en CPU con llama.cpp.
- Opciones de despliegue: transformers (ruta documentada por el autor), vLLM, TGI, SGLang, llama.cpp/Ollama y LM Studio. Para estas últimas sería necesario convertir los pesos safetensors a GGUF, ya que el repositorio no publica cuantizaciones.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| teaislife/Qwen3-4B-nl2fol | 4,02 B | no disponible | no disponible | NL2FOL con sintaxis NLTK Prover9 | pesos safetensors en Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02 B | no confirmado en la información de esta ficha; la documentación del modelo base declara 262.144 tokens de contexto nativo | no confirmada en la información de esta ficha | asistente generalista e instructivo | pesos safetensors en Hugging Face |
| Alternativas específicas de NL2FOL | no identificadas en la búsqueda | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada otros modelos comparables de la misma categoría (traducción de lenguaje natural a lógica de primer orden). Como referencia genérica de tamaño similar pueden considerarse modelos instructivos de ~3-4 B como Qwen2.5-3B-Instruct o Llama-3.2-3B-Instruct, pero no se dispone de datos verificados para comparar su rendimiento en esta tarea.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, no puede asumirse permiso para uso comercial. Conviene contactar con el autor antes de integrarlo en un producto.
- Idiomas: los metadatos solo declaran inglés; no hay evidencia de funcionamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación lógica: al generar fórmulas de primer orden, el modelo puede inventar predicados, usar cuantificadores incorrectos, invertir implicaciones o producir fórmulas sintácticamente válidas pero semánticamente falsas. Toda salida debería validarse con el demostrador o con revisión humana.
- Sobreajuste al formato: el entrenamiento se hizo sobre un subconjunto de MALLS en sintaxis NLTK Prover9, por lo que el modelo puede degradarse ante otros formatos de salida (TPTP, SMT-LIB, etc.) o ante dominios alejados de la distribución del dataset.
- Ausencia de benchmarks: no hay ninguna métrica publicada que permita estimar la calidad de la formalización, lo que obliga a construir una evaluación propia.
- Documentación insuficiente: no se detallan hiperparámetros, tamaño del dataset, número de tokens ni técnica exacta de ajuste, lo que dificulta la reproducibilidad.
- Validación comunitaria nula: 0 descargas y 1 like en el momento de redactar esta ficha; el modelo es reciente y no ha sido contrastado por terceros.
- Contexto desconocido: al no especificarse la longitud de contexto del checkpoint ajustado, no se puede planificar su uso en documentos largos sin verificación previa.
- Sesgos: no hay información publicada sobre sesgos del ajuste; los sesgos heredados del modelo base Qwen3-4B-Instruct-2507 no están documentados en este repositorio.
- Sin cuantizaciones oficiales: cualquier despliegue con GGUF, GPTQ o AWQ requiere una conversión y validación propias, con el consiguiente riesgo de degradación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/teaislife/Qwen3-4B-nl2fol
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Librería TRL: https://github.com/huggingface/trl
- Nota sobre la búsqueda web: los resultados obtenidos en la búsqueda no guardan relación con el modelo (contenido de una plataforma de vídeo en streaming) y no aportan papers, blogs, repositorios ni demos adicionales.
