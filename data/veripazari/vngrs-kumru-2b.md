# veripazari/vngrs-Kumru-2B

## Resumen

Kumru-2B es un modelo de lenguaje de 2.375 millones de parámetros (aproximadamente 2,4B) desarrollado originalmente por VNGRS y entrenado desde cero específicamente para turco. Se distribuye como una versión ligera y de código abierto de la familia Kumru LLM, que también incluye una variante de 7B. El repositorio analizado (`veripazari/vngrs-Kumru-2B`) es una re-subida de archivo realizada por la comunidad VeriPazarı sobre el modelo original `vngrs-ai/Kumru-2B`, conservando la licencia Apache 2.0 y los metadatos de origen.

El modelo se presenta como una versión con ajuste fino de instrucciones (instruct fine-tuned), preentrenada sobre un corpus de 300B tokens depurado y deduplicado de 500 GB, y posteriormente afinado sobre 1 millón de ejemplos supervisados. Incorpora un tokenizador BPE nativo para turco con un vocabulario de 50.176 entradas, diseñado para reducir el consumo de tokens entre un 38 % y un 98 % frente a otros modelos multilingües de código abierto, lo que se traduce en mayor velocidad y menor coste por token procesado.

La relevancia del modelo radica en su especialización lingüística: frente a modelos multilingües genéricos de mayor tamaño, Kumru-2B está optimizado para las particularidades morfológicas del turco (aglutinante, con alta productividad de sufijos) y para tareas como corrección gramatical y resumen de texto. Su ventana de contexto nativa es de 8.192 tokens y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `mistral` en transformers) |
| Parametros totales | 2.375.138.304 (2,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens nativos |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

Kumru-2B es un transformer decoder-only con arquitectura compatible con la familia Mistral (la model card lo etiqueta como `mistral` en la librería transformers). El preentrenamiento se realizó desde cero sobre un corpus de 300B tokens, con un conjunto de datos de 500 GB depurado y libre de duplicados, extraído del dataset `vngrs-ai/vngrs-web-corpus`. Posteriormente se aplicó un ajuste fino supervisado (SFT) sobre 1 millón de ejemplos, lo que da lugar a esta versión instruct.

Una innovación técnica destacable es su tokenizador BPE nativo para turco, con vocabulario de 50.176 entradas, regex de pre-tokenización y plantilla de chat integrada. Según la model card, este tokenizador consume entre un 38 % y un 98 % menos tokens que otros modelos de código abierto con vocabularios mayores, lo que mejora la representación efectiva del contexto y reduce el coste de inferencia. La model card también menciona que, aunque la longitud de contexto nativa es de 8.192 tokens, la longitud de contexto efectiva frente a modelos multilingües comparables se sitúa entre 1.128 y 1.618 tokens equivalentes. No se detalla en la información disponible si se aplicaron técnicas de RLHF o DPO, ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en turco, con plantilla de chat (`apply_chat_template`) y roles system/user/assistant.
- Soporte de código y matemáticas, según indica la model card ("Kod, matematik ve sohbet şablonunu destekleyen").
- Corrección de errores gramaticales en turco: la model card destaca un rendimiento especialmente alto en esta tarea.
- Resumen de texto en turco: también señalado como punto fuerte en la evaluación Cetvel.
- Comprensión y generación en turco como idioma principal (único idioma declarado).
- Compatibilidad con `text-generation-inference` y endpoints compatibles, lo que facilita su despliegue como servicio.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Atención al cliente en turco: el modelo puede gestionar conversaciones multi-turno con una ventana de 8.192 tokens y una plantilla de chat nativa, adecuado para asistentes virtuales de pymes turcas con presupuesto de cómputo limitado.
- Corrección gramatical y de estilo: dada su especialización en las particularidades del turco, puede integrarse en editores de texto o herramientas de publicación para revisar y corregir textos antes de su difusión.
- Resumen automático de documentos: útil para resumir noticias, informes o actas en turco, aprovechando su ventana de contexto y su tokenizador eficiente para procesar más texto por token.
- Generación de código asistida en entornos turco-parlantes: soporta generación de código y puede integrarse en asistentes de IDE o pipelines de CI/CD para sugerencias y autocompletado en turco.
- Chatbot educativo: para tutores virtuales o sistemas de preguntas y respuestas sobre contenidos en turco, con despliegue en una sola GPU consumer.
- Prototipado rápido de aplicaciones NLP en turco: su tamaño de 2,4B y licencia Apache 2.0 permiten experimentar y desplegar en infraestructura modesta, sirviendo como base para fine-tuning posterior en dominios específicos.
- Archivado y preservación lingüística: al ser un modelo nativo para turco con tokenizador propio, puede usarse en proyectos de investigación sobre morfología y procesamiento del turco.

## Benchmarks y rendimiento

La model card menciona la evaluación en el benchmark Cetvel, pero no proporciona cifras numéricas concretas en la información disponible. Indica cualitativamente que Kumru-2B y Kumru-7B superan de forma notable a modelos mucho mayores como LLaMA-3.3-70B, Gemma-3-27B, Qwen-2-72B y Aya-32B en tareas relacionadas con las particularidades del turco, como corrección gramatical y resumen. No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 4,8 GB solo para pesos (el repo ocupa 4,8 GB); con overhead de activaciones y caché KV, se recomienda al menos 8 GB de VRAM. En cuantizaciones de 8 bits o 4 bits el requisito baja, aunque la información disponible no detalla los formatos de cuantización soportados.
- GPU recomendadas: RTX 3090, RTX 4090, A10, L4 para fp16; A100 o H100 para despliegues con mayor concurrencia y throughput.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más de VRAM en fp16, y en GPUs con 4-6 GB si se aplican cuantizaciones.
- Opciones de despliegue: transformers (según la model card), text-generation-inference (etiqueta `text-generation-inference`), y endpoints compatibles. No se confirma soporte de llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kumru-2B | 2,4B | 8.192 | Turco | Apache 2.0 | Hugging Face (original y re-subida) |
| Kumru-7B | ~7B (no confirmado) | no disponible | Turco | no disponible | Hugging Face |
| LLaMA-3.3-70B | 70B | no disponible | Multilingue | Licencia comunitaria Meta | Hugging Face |
| Gemma-3-27B | 27B | no disponible | Multilingue | Licencia Gemma | Hugging Face |
| Qwen-2-72B | 72B | no disponible | Multilingue | no disponible | Hugging Face |
| Aya-32B | 32B | no disponible | Multilingue | no disponible | Hugging Face |

La comparativa con LLaMA-3.3-70B, Gemma-3-27B, Qwen-2-72B y Aya-32B se basa en la afirmación cualitativa de la model card de que Kumru supera a estos modelos en tareas específicas del turco. No se dispone de cifras numéricas para una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Modelo monolingüe: solo declara soporte de turco; su rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación: como todo modelo generativo de 2,4B, puede producir información falsa o inventada, especialmente en tareas factuales o de conocimiento enciclopédico.
- Contexto efectivo limitado: aunque la ventana nativa es de 8.192 tokens, la model card reconoce que el contexto efectivo frente a modelos multilingües comparables equivale a entre 1.128 y 1.618 tokens, lo que puede afectar a tareas que requieran razonamiento sobre documentos largos.
- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse sobre un corpus web, es probable que herede sesgos presentes en los datos.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero se recomienda conservar los avisos de atribución al autor original (VNGRS) y verificar los términos del corpus de entrenamiento.
- Repositorio de archivo: la versión analizada es una re-subida de la comunidad VeriPazarı, no el repositorio oficial; para producción se recomienda usar el repositorio original `vngrs-ai/Kumru-2B` y verificar su integridad.
- Sin datos de benchmarks numéricos ni de cuantizaciones soportadas, lo que dificulta una evaluación previa rigurosa antes de su adopción en producción.

## Enlaces

- Repositorio analizado: https://huggingface.co/veripazari/vngrs-Kumru-2B
- Repositorio original: https://huggingface.co/vngrs-ai/Kumru-2B
- Versión base (preentrenada): https://huggingface.co/vngrs-ai/Kumru-2B-Base
- Demo del modelo 7B: https://kumru.ai/
- Plataforma de la re-subida: https://veripazari.com.tr
- Dataset de entrenamiento: https://huggingface.co/datasets/vngrs-ai/vngrs-web-corpus
