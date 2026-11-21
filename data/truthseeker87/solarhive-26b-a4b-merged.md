# Truthseeker87/solarhive-26b-a4b-merged

## Resumen

SolarHive 26B A4B Merged es un modelo multimodal de tipo image-text-to-text especializado en inteligencia energetica solar comunitaria, desarrollado por Truthseeker87 como parte de un proyecto de hackathon. Se trata de un fine-tuning mediante LoRA del modelo base google/gemma-4-26b-a4b-it, con los adaptadores ya fusionados en los pesos base para permitir su carga directa con `AutoModelForCausalLM` sin necesidad de Unsloth ni PEFT en inferencia. El modelo combina conocimiento de dominio sobre produccion solar, gestion de baterias, optimizacion de red y coordinacion comunitaria con capacidades nativas de function calling y VQA multimodal.

Arquitectonicamente es un transformer MoE (mixture of experts) con 25.805.936.206 parametros totales y aproximadamente 3.8B parametros activos por token, una ventana de contexto de 256K tokens y un codificador visual de aproximadamente 550M parametros. El proyecto se presenta explicitamente como un prototipo de aprendizaje: no controla equipamiento real, ninguna comunidad real lo ha probado y la bateria compartida es un simulador.

Su relevancia actual radica en ser un ejemplo de fine-tuning de dominio sobre un modelo Gemma 4 MoE con capacidades de tool calling y vision, publicado bajo licencia MIT, lo que facilita su estudio y reutilizacion. No obstante, el autor advierte que las puntuaciones de benchmark publicadas no constituyen una evaluacion formal de calidad y que la VQA no fue puntuada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (8/128 expertos) con codificador visual |
| Parametros totales | 25.805.936.206 (25.2B segun model card) |
| Parametros activos | 3.8B por token |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26b-a4b-it, un transformer con arquitectura de mezcla de expertos (MoE) que activa 3.8B de sus 25.2B parametros por token, con 8 de 128 expertos activos. Incorpora un codificador visual de aproximadamente 550M de parametros que habilita las capacidades multimodales de texto e imagen. La ventana de contexto es de 256K tokens. El fine-tuning se realizo mediante LoRA sobre el dataset Truthseeker87/solarhive-community-solar-multimodal, especializado en energia solar comunitaria, y los adaptadores se fusionaron posteriormente en los pesos base.

El entrenamiento se llevo a cabo en el contexto de un hackathon (el tag "hackathon" y la referencia al repositorio "the-gemma4-good-hackathon-solarhive" lo confirman). La perdida de entrenamiento reportada es de 0.6956 para el modelo 26B A4B (promedio de los ultimos 20 pasos), sin que se haya medido perdida de validacion, por lo que el autor advierte que este valor no permite comparar calidad entre modelos. No se especifica el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo conserva las capacidades nativas de function calling y flujos agenticos del modelo base.

## Capacidades

- Generacion de texto y razonamiento en el dominio de energia solar comunitaria, produccion fotovoltaica, gestion de baterias y optimizacion de red.
- Vision y VQA multimodal: analisis de cielo, inspeccion de paneles y evaluacion de vecindarios a partir de imagenes (sin puntuacion formal de VQA).
- Function calling nativo para cinco herramientas de energia definidas en el proyecto.
- Respuestas fundamentadas en herramientas que pueden citar datos de API en vivo, aunque el autor advierte que las salidas pueden contener numeros erroneos.
- Razonamiento selectivo sobre herramientas (tool reasoning) y flujos de multiples pasos.
- Capacidades agenticas heredadas del modelo base Gemma 4.
- Soporte multilingue limitado al ingles.
- Modo conversacional.

## Casos de uso

- Asesor energetico para microredes comunitarias: el modelo puede responder consultas sobre planificacion en torno al excedente solar de mediodia, irradiancia y cobertura nubosa, usando su contexto de 256K tokens para incorporar historicos extensos de produccion y consumo.
- Analisis visual de instalaciones: a partir de fotografias del cielo o de paneles, el modelo puede estimar condiciones de irradiancia o detectar posibles anomalias visuales, aprovechando el codificador visual del modelo base.
- Gestion simulada de bateria compartida: integrado con las cinco herramientas de energia, puede razonar sobre estrategias de carga y descarga en un simulador de almacenamiento comunitario.
- Coordinacion de comunidades energeticas: puede redactar recomendaciones y resumenes para coordinadores de comunidades solares, combinando datos de API en vivo con explicaciones en lenguaje natural.
- Prototipo educativo y de investigacion: sirve como base para estudiar fine-tuning de dominio sobre modelos MoE multimodales con tool calling, gracias a su licencia MIT y a la disponibilidad de los notebooks y el dataset.
- Integracion en pipelines de agentes: su soporte nativo de function calling permite conectarlo a APIs meteorologicas o de monitorizacion energetica dentro de flujos agenticos de multiples pasos.
- Evaluacion de tecnicas de merge de LoRA: el modelo merged permite comparar el comportamiento respecto a la version LoRA sin dependencias de Unsloth o PEFT en inferencia.

## Benchmarks y rendimiento

Los unicos datos de benchmarks publicados corresponden al modelo base Gemma 4 26B A4B segun Google, no al fine-tuning SolarHive. El autor advierte explicitamente que estos resultados proporcionan contexto de seleccion de modelo y no miden la calidad, velocidad o coste de SolarHive.

| Benchmark | Uso previsto en SolarHive | E4B | 26B A4B | 31B |
|---|---|---|---|---|
| MMMU Pro (vision) | Analisis VQA de cielo y paneles | 52.6% | 73.8% | 76.9% |
| MATH-Vision | Razonamiento visual sobre datos solares | 59.5% | 82.4% | 85.6% |
| OmniDocBench (menor es mejor) | Comprension de documentos | 0.181 | 0.149 | 0.131 |
| MMLU Pro | Experiencia de dominio (asesoria energetica) | 69.4% | 82.6% | 85.2% |
| GPQA Diamond | Razonamiento cientifico | 58.6% | 82.3% | 84.3% |
| MRCR v2 128K | Recuperacion en contexto largo | 25.4% | 44.1% | 66.4% |

Las puntuaciones propias del proyecto (8/8, 9/10 y 10/10) no constituyen un benchmark publico: la mitad Q&A no esta calificada, solo se puntuan por codigo el enrutamiento de herramientas y When2Call, los prompts no son held out, el matcher de When2Call es una comprobacion laxa por palabras clave y cada puntuacion proviene de una unica ejecucion a temperatura 1.0.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 25.8B parametros en precision completa (bf16) se requeririan aproximadamente 52 GB solo para pesos, mas overhead de activaciones y KV cache.
- GPU recomendadas: no especificadas por el autor; por tamano, el modelo encaja en A100 80GB o H100 para precision completa, y requeriria cuantizacion para GPUs de menor memoria.
- GPU de consumo: no cabe en GPUs consumer de 24 GB en bf16; seria necesaria cuantizacion (no documentada para este modelo).
- Opciones de despliegue: transformers con `AutoModelForCausalLM` (soporte nativo, sin Unsloth ni PEFT); el autor menciona una variante E4B para despliegue en Ollama, pero no se documenta soporte Ollama, vLLM, llama.cpp o TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (total / activos) | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SolarHive 26B A4B Merged | 25.8B / 3.8B | 256K | Si (~550M) | MIT | Hugging Face |
| Gemma 4 26B A4B (base) | 25.2B / 3.8B | 256K | Si (~550M) | no disponible en la informacion | Google |
| SolarHive E4B | 8B / 4.5B efectivos | 128K | Si (~150M) | no disponible en la informacion | Hugging Face (Ollama) |
| Gemma 4 31B | 30.7B / 30.7B (denso) | 256K | Si (~550M) | no disponible en la informacion | Google |

El modelo base 31B obtiene puntuaciones superiores en los benchmarks publicados por Google (aproximadamente 3 puntos mas en MMMU Pro y MMLU Pro, y 22 puntos mas en MRCR v2 128K), pero requiere mas memoria GPU al activar todos sus parametros. La variante E4B esta orientada a despliegue en el borde con menor contexto y menor rendimiento en vision.

## Limitaciones y advertencias

- Prototipo de aprendizaje: no controla equipamiento real, ninguna comunidad real lo ha probado y la bateria compartida es un simulador.
- Las respuestas fundamentadas en herramientas pueden contener numeros erroneos aunque citen datos de API en vivo.
- La VQA no fue puntuada; no hay evidencia de que el fine-tuning mejore el analisis de cielo o paneles respecto al modelo base.
- No se midio perdida de validacion; la perdida de entrenamiento reportada no permite comparar calidad.
- No se ejecuto una evaluacion de contexto largo pese a la ventana de 256K.
- Las puntuaciones propias (8/8, 9/10, 10/10) no son un benchmark publico, no son held out y provienen de una unica ejecucion a temperatura 1.0.
- Soporte unicamente en ingles.
- Riesgo de sesgos y alucinaciones inherente al modelo base y al dataset de fine-tuning, no documentado por el autor.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- Solo 23 descargas y 0 likes en el momento de la consulta; ecosistema de validacion muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Truthseeker87/solarhive-26b-a4b-merged
- Version LoRA: https://huggingface.co/Truthseeker87/solarhive-26b-a4b-lora
- Variante E4B para Ollama: https://huggingface.co/Truthseeker87/solarhive-e4b-ollama
- Dataset: https://huggingface.co/datasets/Truthseeker87/solarhive-community-solar-multimodal
- Repositorio GitHub del proyecto: https://github.com/youshen-lim/the-gemma4-good-hackathon-solarhive
- Notebooks archivados: https://github.com/youshen-lim/the-gemma4-good-hackathon-solarhive/tree/main/archive/final_run
- Model card de Gemma 4: https://gemma.ai/models/gemma-4/model-card/
- Modelo base: https://huggingface.co/google/gemma-4-26b-a4b-it
- Paper referenciado (arXiv 2504.18851): https://arxiv.org/abs/2504.18851
- Paper referenciado (arXiv 2512.14982): https://arxiv.org/abs/2512.14982
- Paper referenciado (arXiv 2211.17192): https://arxiv.org/abs/2211.17192
