# xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5

## Resumen

Qwensploit V2 2B es un ajuste fino (fine-tune) especializado en ciberseguridad y red team, desarrollado por xtools-at sobre el modelo base xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic. Forma parte de la serie Qwensploit, que en esta segunda iteración (V2) pone el énfasis en la calidad y selección del dato de entrenamiento por encima del volumen bruto, tras detectar en la V1 inconsistencias atribuibles a la composición del dataset. Se distribuye en cuatro variantes de tamaño (0.8B, 2B, 4B y 9B); esta ficha cubre la de 2B.

El modelo resuelve el problema de disponer de un asistente técnico de ciberseguridad compacto que combine conocimiento ofensivo (pentesting, bug bounty, análisis de vulnerabilidades), razonamiento estructurado y resolución de problemas técnicos generales, todo con un coste de inferencia bajo. Con 2.213.241.664 parámetros totales según los pesos en safetensors, está pensado para ejecutarse en hardware modesto y para servir como asistente de uso diario a investigadores y profesionales de seguridad.

La relevancia actual del modelo radica en su enfoque de curaduría de datos: cada conjunto de entrenamiento fue dividido, inspeccionado, limpiado y filtrado manualmente antes de incorporarse a la mezcla, y se descartó deliberadamente el uso de colecciones masivas de registros CVE en crudo por considerarlas más adecuadas para RAG que para enseñar a razonar. La licencia es "other" y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); pipeline `image-text-to-text` |
| Parametros totales | 2.213.241.664 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; existen GGUF y otras cuantizaciones publicadas por la comunidad (búsqueda por `base_model:quantized:xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `other` (no se detallan los términos) |
| Formato de pesos | safetensors (librería transformers); adaptadores LoRA/PEFT en el entrenamiento |

## Arquitectura y entrenamiento

El modelo es un fine-tune de instrucción sobre el checkpoint xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic, que a su vez es una mezcla (merge) de destilaciones múltiples de la familia Qwen3.5. La model card declara la etiqueta `mtp` (multi-token prediction) y el uso de LoRA/PEFT con la librería unsloth durante el ajuste. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta de la mezcla final ni si se aplicaron etapas de RLHF o DPO.

La innovación principal de la V2 no es arquitectónica sino de datos: cada dataset fue dividido, inspeccionado, limpiado y filtrado manualmente antes de incorporarse. La mezcla combina conocimiento de dominio de ciberseguridad con datos de razonamiento general. Entre las fuentes figuran PentesterFlow/OffsecCyber (2.000 muestras, subconjuntos Elite V2 y HackerOne, con conocimiento ofensivo web, análisis de vulnerabilidades y ejemplos orientados a bug bounty), ChaoticNeutrals/Cybersecurity-ShareGPT (2.000 muestras muestreadas), Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium, saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x. El autor señala explícitamente que las colecciones de registros CVE en crudo se consideraron más apropiadas para RAG que para el ajuste directo.

## Capacidades

- Generación de texto y razonamiento estructurado orientado a problemas de seguridad.
- Conocimiento de seguridad ofensiva: pentesting web, bug bounty, análisis y triaje de vulnerabilidades.
- Seguridad defensiva: análisis de amenazas y respuesta a incidentes.
- Codificación segura, revisión de código y depuración.
- Resolución de retos CTF y apoyo a formación en seguridad.
- Conversación multi-turno (etiqueta `conversational`).
- Razonamiento multi-paso (etiquetas `reasoning`, `instruction-tuning`).
- Capacidad multimodal declarada por el pipeline `image-text-to-text`; no se detallan en la información disponible las modalidades concretas soportadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo: el autor indica explícitamente que no está diseñado como agente autónomo de pentesting.
- Multilingüe: solo inglés declarado.

## Casos de uso

- Asistente diario para pentesters en pruebas autorizadas: el modelo puede explicar técnicas, interpretar resultados de escaneos y proponer siguientes pasos dentro de un ejercicio de red team, revisando siempre los comandos generados antes de ejecutarlos.
- Triaje de vulnerabilidades: dado un informe o una descripción técnica, ayuda a clasificar severidad, contextualizar el impacto y sugerir mitigaciones, aprovechando el entrenamiento sobre datos de bug bounty y análisis de vulnerabilidades.
- Revisión de código con enfoque de seguridad: integrado en el flujo de revisión, señala patrones inseguros, propone correcciones y explica el vector de ataque asociado, útil para equipos de desarrollo sin especialistas en seguridad.
- Formación y retos CTF: sirve como tutor que guía el razonamiento paso a paso en retos de explotación y criptografía aplicada, sin sustituir la práctica del alumno.
- Apoyo a respuesta a incidentes: resume hallazgos, propone hipótesis de compromiso y estructura la investigación a partir de indicadores descritos por el analista.
- Documentación técnica de seguridad: redacción de guías internas, políticas y explicaciones de controles, con un modelo de 2B que puede ejecutarse en local sin enviar datos sensibles a terceros.
- Asistente de bajo coste en entornos con recursos limitados: al tener 2,2B parámetros, puede desplegarse en una única GPU de consumo para laboratorios, entornos de formación o estaciones de trabajo de analistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (2,2B parámetros), en FP16 requiere del orden de 4,5-5 GB solo para pesos; en cuantización de 8 bits, unos 2,5-3 GB; en 4 bits, alrededor de 1,5-2 GB, más overhead de contexto y runtime.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, y en GPUs de datacenter (A100, H100) para despliegues con concurrencia.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6 GB o más en cuantizaciones bajas; no confirmado oficialmente.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del repo) y cuantizaciones GGUF de la comunidad para llama.cpp/Ollama; vLLM no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit V2 2B | 2,21B | No disponible | Ciberseguridad / red team | other | Hugging Face |
| Qwensploit V2 4B | No disponible | No disponible | Ciberseguridad / red team | other | Hugging Face |
| Qwensploit V2 9B | No disponible | No disponible | Ciberseguridad / red team | other | Hugging Face |
| Qwensploit V2 0.8B | No disponible | No disponible | Ciberseguridad / red team | other | Hugging Face |

Las alternativas más directas son las otras variantes de la misma serie; no se dispone de datos de benchmarks ni de comparación con modelos de ciberseguridad de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte que el modelo es un asistente de investigación y análisis, no un agente autónomo de pentesting; los comandos, código y recomendaciones generados deben revisarse antes de usarse en un entorno real.
- Riesgo de alucinación inherente a modelos de 2B parámetros, especialmente en detalles técnicos concretos (versiones, CVE, sintaxis de herramientas).
- Solo se declara soporte de inglés; el rendimiento en castellano no está garantizado.
- La licencia es "other" y no se detallan sus términos: es imprescindible revisar las condiciones antes de cualquier uso comercial.
- El modelo base está etiquetado como "UNCENSORED/heretic", lo que implica que las salvaguardas de contenido pueden ser reducidas; su uso en producción requiere controles adicionales.
- Contenido de seguridad ofensiva: su uso debe limitarse a pruebas autorizadas y entornos legales; el autor no ofrece garantías sobre el uso indebido.
- Sin datos publicados de benchmarks, contexto máximo ni requisitos de hardware oficiales, la evaluación previa a producción debe hacerse mediante pruebas propias.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Variante 9B: https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Variante 4B: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Variante 0.8B: https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic
- Colección Qwensploit: https://huggingface.co/collections/xtools-at/qwensploit-cybersec
- Cuantizaciones de la comunidad: https://huggingface.co/models?other=base_model:quantized:xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Dataset PentesterFlow/OffsecCyber: https://huggingface.co/datasets/PentesterFlow/OffsecCyber
- Dataset ChaoticNeutrals/Cybersecurity-ShareGPT: https://huggingface.co/datasets/ChaoticNeutrals/Cybersecurity-ShareGPT
- Dataset Voidreaper2026/cybersec-master-dataset: https://huggingface.co/datasets/Voidreaper2026/cybersec-master-dataset
- Dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Dataset saidutta69/CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset saidutta69/qwen3.8-max-distillation-50k-clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Dataset xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x: https://huggingface.co/datasets/xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x
