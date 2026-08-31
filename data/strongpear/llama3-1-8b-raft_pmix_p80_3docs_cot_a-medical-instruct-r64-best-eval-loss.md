# strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-MEDICAL-Instruct-r64-best-eval-loss

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario strongpear, diseñado para ajustar el modelo base Llama-3.1-8B de Meta a tareas de instrucción en el dominio médico. El nombre del repositorio sugiere el uso de la técnica RAFT (posiblemente Retrieval-Augmented Fine-Tuning), una mezcla de prompts (PMIX_P80), tres documentos de contexto (3DOCS) y razonamiento de cadena de pensamiento (CoT), con un rango LoRA de 64. El adaptador está publicado como un checkpoint de PEFT con formato safetensors y un tamaño de 0.7 GB.

La relevancia de este modelo radica en su especialización médica, un área donde los modelos generalistas suelen carecer de precisión terminológica y de razonamiento clínico. Al ser un adaptador LoRA, permite actualizar el modelo base sin necesidad de reentrenar todos los parámetros, lo que reduce costes computacionales y facilita su integración en flujos existentes. Sin embargo, la documentación pública es prácticamente inexistente: la model card no contiene información sobre datos de entrenamiento, hiperparámetros, evaluación o licencia, por lo que su uso en producción requiere verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Llama-3.1-8B (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador tiene ~0.7 GB, el modelo base 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta 128k tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, sin cuantizacion propia) |
| Idiomas soportados | No disponibles (el modelo base soporta ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura de Llama-3.1-8B, un transformer decoder-only con atención de múltiples cabezas y normalización RMSNorm. El modelo base fue preentrenado por Meta con 15 billones de tokens y posteriormente ajustado con instrucciones (instruct). Sobre este, el adaptador LoRA introduce matrices de bajo rango (r=64) en las capas de atención y feed-forward, permitiendo un ajuste eficiente con un número reducido de parámetros entrenables.

El nombre del repositorio indica el uso de la metodología RAFT (Retrieval-Augmented Fine-Tuning), que combina el ajuste fino con la recuperación de documentos relevantes durante el entrenamiento. La parte "PMIX_P80" sugiere una mezcla de prompts con un 80% de ejemplos que incluyen documentos, y "3DOCS" indica que se proporcionan tres documentos de contexto por ejemplo. La inclusión de "CoT" apunta a un entrenamiento con cadenas de razonamiento (chain-of-thought). Sin embargo, no se ha publicado información detallada sobre el dataset médico utilizado, el número de pasos de entrenamiento, la configuración de hiperparámetros ni el régimen de precisión (fp16, bf16, etc.). El adaptador se creó con la librería PEFT 0.20.0.

## Capacidades

- Generacion de texto e instrucciones en el dominio medico, con posible razonamiento de cadena de pensamiento (CoT) para tareas clinicas.
- Uso de contexto externo: el nombre sugiere que el modelo puede aprovechar hasta tres documentos de referencia para responder preguntas medicas.
- Ajuste fino por LoRA: permite combinar el adaptador con el modelo base para obtener respuestas especializadas sin reentrenar todos los parametros.
- No se dispone de informacion confirmada sobre soporte de tool calling, funciones de agente, capacidades multimodales o multilingues especificas del adaptador.

## Casos de uso

- Asistencia a profesionales sanitarios: el modelo puede responder consultas sobre sintomas, tratamientos o interacciones farmacologicas, apoyandose en documentos clinicos proporcionados como contexto.
- Resumen de historiales medicos: dado un conjunto de tres documentos (por ejemplo, informes de laboratorio, notas de consulta y referencias), el modelo puede generar un resumen estructurado.
- Educacion medica: estudiantes de medicina pueden utilizarlo para practicar casos clinicos y recibir explicaciones razonadas paso a paso.
- Soporte a triaje: en entornos de telemedicina, el modelo podria clasificar la urgencia de los sintomas descritos por el paciente, siempre con supervision humana.
- Generacion de documentacion clinica: ayuda a redactar informes o cartas de derivacion a partir de datos estructurados y notas previas.
- Investigacion bibliografica: con los documentos adecuados, el modelo puede extraer informacion relevante de articulos cientificos y responder preguntas especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de evaluacion en MMLU, HumanEval, GSM8K ni metricas medicas especificas (como MedQA o PubMedQA) para este adaptador. Se recomienda realizar una evaluacion propia antes de cualquier uso en produccion.

## Requisitos de hardware

- El adaptador LoRA pesa 0.7 GB y debe cargarse junto con el modelo base Llama-3.1-8B.
- Para inferencia en precision fp16, el modelo base requiere aproximadamente 16 GB de VRAM. Con cuantizacion de 4 bits (por ejemplo, mediante bitsandbytes o GPTQ), se puede reducir a unos 6-8 GB.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) para fp16, o RTX 3060/4070 (12 GB) con cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers y PEFT.
- La latencia y el throughput dependen del hardware y de la cuantizacion; no se han publicado mediciones especificas para este adaptador.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA medicos comparables publicados por el mismo autor o por otros en el momento de la consulta. Como referencia, el modelo base Llama-3.1-8B-Instruct ofrece capacidades generales de razonamiento y generacion, pero sin especializacion medica. Otros modelos medicos como Meditron-7B o BioMistral-7B existen, pero no se han encontrado comparaciones directas con este adaptador. Se recomienda evaluar el rendimiento relativo en tareas medicas especificas antes de elegir.

## Limitaciones y advertencias

- La model card no proporciona informacion sobre sesgos, riesgos de alucinacion o limitaciones tecnicas. Es probable que el modelo herede los sesgos del modelo base Llama-3.1-8B, que pueden incluir estereotipos y errores en dominios especializados.
- Al ser un adaptador no documentado, no se puede garantizar la calidad de las respuestas medicas. No debe utilizarse como sustituto del criterio clinico profesional.
- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial o de redistribucion. Se debe contactar con el autor antes de cualquier despliegue.
- El adaptador se ha entrenado presumiblemente con un dataset medico especifico, pero no se conoce su composicion ni su tamano, lo que limita la reproducibilidad.
- No hay evidencia de evaluacion externa ni de validacion en entornos clinicos reales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-MEDICAL-Instruct-r64-best-eval-loss
- Modelo base Llama-3.1-8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Paper de Lacoste et al. (2019) sobre estimacion de emisiones (referenciado en la model card): https://arxiv.org/abs/1910.09700
