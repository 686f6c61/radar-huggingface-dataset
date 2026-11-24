# ZEN-PRODUCT/zen-0.2

## Resumen

Zen 0.2 es un ajuste fino de tipo LoRA (posteriormente fusionado en los pesos) sobre el modelo Qwen2.5-Coder-3B-Instruct, desarrollado por el usuario ZEN-PRODUCT. El objetivo declarado es reforzar tres áreas concretas: instrucciones generales, generación de código y razonamiento matemático paso a paso. Para ello se entrena sobre una mezcla de Tulu 3 (instrucciones generales), Magicoder y CodeFeedback (código) y MetaMathQA (matemáticas). El resultado es un modelo de aproximadamente 3.086 millones de parámetros con arquitectura transformer densa de la familia Qwen2.

La relevancia del modelo radica en su tamaño contenido: al partir de una base de 3B, puede ejecutarse en GPUs de consumo con cuantización de 4 a 8 bits, lo que lo hace atractivo para entornos con recursos limitados. El autor publica además versiones GGUF (Q4_K_M, Q5_K_M, Q8_0) en un repositorio separado, lo que facilita el despliegue con llama.cpp u Ollama. No obstante, se trata de un modelo con muy poca tracción en la comunidad (35 descargas y 0 likes en el momento de la consulta), lo que limita la validación independiente de sus resultados.

La ficha se basa exclusivamente en la información publicada por el autor y en los metadatos de Hugging Face. Los benchmarks presentados por el autor muestran resultados mixtos: mejora en HumanEval y especialmente en LiveCodeBench respecto a la referencia, pero empeora de forma notable en CRUX-In/Out, GSM8K y GPQA. Estas cifras deben interpretarse con cautela, ya que proceden de una evaluación propia con 500 tareas por cuantización y el propio autor advierte que pueden diferir de las puntuaciones reportadas por el fabricante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), fine-tuning LoRA fusionado |
| Parametros totales | 3.085.938.688 (~3,09B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-3B-Instruct soporta 32.768 tokens, pero el autor no lo confirma) |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q5_K_M, Q8_0 (publicados en repositorio separado); pesos originales en safetensors |
| Idiomas soportados | Ingles (en), ruso (ru) |
| Licencia | qwen-research (licencia "other" segun metadatos; enlaza a la licencia del modelo base Qwen2.5-Coder-3B-Instruct) |
| Formato de pesos | safetensors (repo principal), GGUF (repo angelgodbrokenns/zen-0.2-GGUF) |

## Arquitectura y entrenamiento

Zen 0.2 parte de Qwen2.5-Coder-3B-Instruct, un transformer denso de la familia Qwen2 con aproximadamente 3.086 millones de parámetros. Sobre esa base se aplica un ajuste fino con LoRA que posteriormente se fusiona en los pesos, de modo que el artefacto final es un modelo denso estándar sin adaptadores separados. El autor no detalla hiperparámetros del entrenamiento (rango de LoRA, tasa de aprendizaje, número de épocas, tokens totales vistos) ni si hubo etapas de RLHF o DPO; únicamente indica el uso de LoRA y su fusión.

La mezcla de datos de entrenamiento comprende cuatro conjuntos: allenai/tulu-3-sft-mixture (instrucciones generales), ise-uiuc/Magicoder-Evol-Instruct-110K y m-a-p/CodeFeedback-Filtered-Instruction (código) y meta-math/MetaMathQA (matemáticas paso a paso). No se especifica la proporción de cada dataset ni el número total de tokens de entrenamiento. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido; el modelo se limita a la arquitectura y el pipeline de generación de texto de la base.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones generales, gracias al entrenamiento sobre Tulu 3.
- Generación y edición de código en múltiples lenguajes, reforzada con Magicoder y CodeFeedback.
- Razonamiento matemático paso a paso, apoyado en MetaMathQA.
- Razonamiento de tipo "chain-of-thought" implícito en tareas de matemáticas y código (el autor lo etiqueta como "reasoning").
- Capacidades multilingües limitadas a inglés y ruso según los metadatos; no se declara soporte de español.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base lo soporta, pero el autor no lo confirma para este ajuste).
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente por el autor.
- Capacidades de visión o audio: no disponibles.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Asistente de código en local para desarrolladores individuales: con cuantización Q4_K_M o Q5_K_M, el modelo cabe en GPUs de consumo de 8-12 GB y permite autocompletado y explicación de fragmentos de código sin depender de la nube, manteniendo los datos en la máquina del desarrollador.
- Generación de tests unitarios y documentación técnica: el ajuste sobre Magicoder y CodeFeedback favorece la producción de ejemplos de código y docstrings; puede integrarse en pipelines de CI/CD para generar borradores de tests que luego se revisan manualmente.
- Tutor de matemáticas paso a paso: el entrenamiento con MetaMathQA lo hace adecuado para explicar la resolución de problemas aritméticos y algebraicos en entornos educativos, siempre con verificación humana de los resultados.
- Prototipado rápido de chatbots en inglés y ruso: su tamaño reducido permite desplegarlo en una sola GPU para demos y pruebas de concepto de asistentes conversacionales en esos dos idiomas.
- Procesamiento por lotes de código en servidores modestos: al ser un modelo de 3B, puede ejecutarse con vLLM o llama.cpp en una GPU de gama media para tareas de refactorización masiva o análisis estático asistido.
- Filtrado y clasificación de fragmentos de código en herramientas de revisión: puede usarse como clasificador generativo para detectar patrones problemáticos o sugerir mejoras en pull requests, con la ventaja de un coste de inferencia bajo.
- Base para ajustes finos posteriores: al ser un modelo pequeño y con licencia de investigación, sirve como punto de partida para experimentos académicos de fine-tuning en dominios específicos.

## Benchmarks y rendimiento

Los datos proceden exclusivamente de la model card del autor. Se evaluaron 500 tareas por cuantización; el autor advierte que las cifras pueden diferir de las reportadas por el fabricante.

| Modelo / cuantización | HumanEval | MBPP | LiveCodeBench | CRUX-In | CRUX-Out | GSM8K | MATH | MMLU-Pro | GPQA | Media |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-3B (referencia) | 84,1% | 73,6% | 10,8% | 53,2% | 56,0% | 80,7% | 58,1% | 35,2% | 28,3% | — |
| Zen-0.2 Q4_K_M | 85,0% | 67,0% | 66,0% | 32,0% | 24,0% | 60,0% | 38,0% | 30,0% | 10,0% | 54,60% |
| Zen-0.2 Q5_K_M | 84,0% | 71,0% | 68,0% | 34,0% | 40,0% | 70,0% | 58,0% | 30,0% | 25,0% | 60,80% |
| Zen-0.2 Q8_0 | 87,0% | 71,0% | 60,0% | 38,0% | 32,0% | 70,0% | 44,0% | 33,3% | 15,0% | 58,60% |

Observaciones: la mejora más llamativa es LiveCodeBench (de 10,8% a 60-68%), aunque el salto es tan grande que conviene tratarlo con escepticismo hasta que se replique de forma independiente. En cambio, el modelo retrocede claramente en CRUX-In/Out, GSM8K y GPQA respecto a la base, lo que sugiere un posible olvido catastrófico parcial en razonamiento abstracto y matemáticas fuera de distribución. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 6,2 GB solo para pesos; en Q8_0, alrededor de 3,3 GB; en Q5_K_M, unos 2,2 GB; en Q4_K_M, unos 1,9 GB. Añadir entre 1 y 3 GB adicionales para caché KV según la longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más usando cuantizaciones Q4_K_M o Q5_K_M; en Q8_0 requiere al menos 6-8 GB.
- Opciones de despliegue: llama.cpp y Ollama para las versiones GGUF; vLLM, TGI o transformers para los pesos safetensors; también es viable en CPU con llama.cpp para pruebas.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al tratarse de un modelo de 3B, se espera un throughput alto en GPU modernas, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zen-0.2 | ~3,09B | No disponible | qwen-research | Hugging Face (safetensors y GGUF) | Ajuste LoRA de Qwen2.5-Coder-3B; benchmarks propios mixtos |
| Qwen2.5-Coder-3B-Instruct | ~3,09B | 32.768 tokens (según el modelo base) | qwen-research | Hugging Face, ampliamente adoptado | Base del modelo; benchmarks de referencia más equilibrados |
| Llama 3.2 3B Instruct | ~3,2B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, Ollama, vLLM | Buen rendimiento general y contexto largo; menos especializado en código |
| Qwen2.5-Coder-1.5B-Instruct | ~1,5B | 32.768 tokens (según el modelo base) | qwen-research | Hugging Face, GGUF | Alternativa más ligera para GPUs de 4-6 GB |

La comparación directa con la base Qwen2.5-Coder-3B-Instruct es la más relevante: Zen 0.2 mejora en HumanEval y LiveCodeBench según el autor, pero empeora en CRUX, GSM8K y GPQA, por lo que no supone una mejora uniforme. Frente a Llama 3.2 3B, Zen 0.2 está más orientado a código y matemáticas, pero carece del contexto largo y del ecosistema de herramientas de Llama. No se dispone de datos de benchmarks independientes que permitan una comparación rigurosa con estas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre Tulu 3, Magicoder, CodeFeedback y MetaMathQA, puede heredar sesgos presentes en esos conjuntos, especialmente en inglés.
- Riesgo de alucinación: presente como en cualquier modelo de 3B; el autor no reporta mitigaciones específicas. Los resultados en GPQA (10-25%) y CRUX (24-40%) sugieren una fiabilidad limitada en razonamiento abstracto.
- Limitaciones de contexto e idioma: solo se declaran inglés y ruso; no hay soporte confirmado de español. La longitud de contexto no se especifica en la model card, aunque la base soporta 32.768 tokens.
- Restricciones de licencia: la licencia es "qwen-research" (etiquetada como "other" en los metadatos), lo que probablemente restringe el uso comercial. Es imprescindible revisar el enlace a la licencia del modelo base antes de cualquier despliegue en producción.
- Caveat importante para producción: el modelo tiene muy poca adopción (35 descargas, 0 likes), no hay validación independiente de los benchmarks y las cifras de LiveCodeBench resultan anómalamente altas frente a la base, lo que aconseja replicar las evaluaciones antes de confiar en él.
- El ajuste parece inducir cierto olvido catastrófico en tareas de razonamiento abstracto y matemáticas, a juzgar por la caída en CRUX, GSM8K y GPQA respecto a la base.
- No se documentan hiperparámetros de entrenamiento ni composición exacta del dataset, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZEN-PRODUCT/zen-0.2
- Repositorio GGUF: https://huggingface.co/angelgodbrokenns/zen-0.2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct/blob/main/LICENSE
- Dataset Tulu 3: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset Magicoder-Evol-Instruct-110K: https://huggingface.co/datasets/ise-uiuc/Magicoder-Evol-Instruct-110K
- Dataset CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Dataset MetaMathQA: https://huggingface.co/datasets/meta-math/MetaMathQA
