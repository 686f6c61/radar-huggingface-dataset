# Tamarillo/toxicity-safety-guard-base

## Resumen

Tamarillo/toxicity-safety-guard-base es un clasificador de toxicidad y seguridad de contenido multietiqueta, desarrollado por Tamarillo, construido sobre el encoder jhu-clsp/mmBERT-base (307,5 millones de parámetros). Su función es servir como guardrail para aplicaciones basadas en LLM: evalúa textos de entrada y salida y devuelve, mediante ocho cabezas sigmoides independientes, probabilidades para toxicidad, toxicidad severa, obscenidad, amenaza, insulto, ataque de identidad, contenido sexual explícito y una categoría adicional de contenido inseguro generado por IA (`unsafe_ai_content`).

El modelo destaca por tres motivos. Primero, es compatible de forma directa con el escáner `Toxicity` de `protectai/llm-guard` (verificado con la versión 0.3.16 tanto en PyTorch como en ONNX sobre CPU), lo que permite sustituir el modelo por defecto sin modificar el código del escáner. Segundo, su licencia Apache-2.0 y la ausencia de `trust_remote_code` lo hacen apto para uso comercial sin las restricciones habituales de otros guardrails. Tercero, cubre 17 idiomas (incluido el español) y amplía la ventana de contexto del backbone hasta 8.192 tokens, aunque la validación del autor llega a 3.584 tokens.

Forma parte de una familia de tres tamaños (tiny-en de 32,0 M, small de 140,6 M y base de 307,5 M), pensada para cubrir desde despliegues en el borde hasta entornos de servidor donde prima la precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/mmBERT-base) con pooling `[CLS]` de atención global |
| Parámetros totales | 307.536.392 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens en el backbone; fine-tuning y validación hasta 3.584 tokens |
| Tipos de cuantización | ONNX FP16 (`onnx/model_fp16.onnx`); cuantizaciones adicionales no disponibles |
| Idiomas soportados | en, ar, cs, de, es, fr, hi, it, ja, ko, nl, pl, pt, ru, sv, th, zh (17) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (`onnx/model.onnx`, `onnx/model_fp16.onnx`) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT multilingüe (mmBERT) con 307,5 millones de parámetros, ajustado para clasificación multietiqueta. La cabeza de clasificación aplica ocho funciones sigmoides independientes sobre el vector `[CLS]`, de modo que cada etiqueta se puntúa por separado y un mismo texto puede activar varias a la vez. El pooling se realiza sobre el token `[CLS]` con atención global, un mecanismo nativo de ModernBERT que evita depender de `trust_remote_code`.

El ajuste se realizó sobre una mezcla de conjuntos de datos de moderación y seguridad: google/civil_comments, nvidia/Aegis-AI-Content-Safety-Dataset-2.0, OpenSafetyLab/Salad-Data, ToxicityPrompts/PolyGuardMix, argilla/ultrafeedback-binarized-preferences-cleaned y CohereForAI/aya_dataset. El autor no detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta de la mezcla, ni si se aplicaron etapas de RLHF o DPO (no procede en un clasificador). Las siete primeras etiquetas replican exactamente las del escáner `Toxicity` de llm-guard; la octava (`unsafe_ai_content`) es una adición propia orientada a riesgos modernos de LLM y agentes. Se ofrecen exportaciones ONNX verificadas en paridad con PyTorch.

## Capacidades

- Clasificación multietiqueta de toxicidad con ocho cabezas sigmoides independientes: `toxicity`, `severe_toxicity`, `obscene`, `threat`, `insult`, `identity_attack`, `sexual_explicit` y `unsafe_ai_content`.
- Detección de contenido inseguro específico de LLM y agentes mediante la cabeza `unsafe_ai_content`.
- Funcionamiento multilingüe en 17 idiomas, con cobertura del español.
- Procesamiento de textos largos gracias a la ventana de 8.192 tokens del backbone (validado hasta 3.584).
- Compatibilidad directa con el escáner `Toxicity` de `protectai/llm-guard` 0.3.16 en PyTorch y ONNX CPU.
- Ejecución sin `trust_remote_code` con `transformers>=4.48.0`.
- Inferencia en CPU mediante ONNX Runtime, incluida la variante FP16.
- No es un modelo generativo: no soporta tool calling, razonamiento multi-paso ni generación de texto.

## Casos de uso

- Moderación de prompts de entrada en asistentes conversacionales: el modelo se coloca delante del LLM y bloquea o marca mensajes tóxicos antes de que lleguen al modelo generativo, usando el escáner `Toxicity` de llm-guard con umbral configurable (por ejemplo, 0.5).
- Filtrado de respuestas generadas: se evalúa la salida del LLM con las ocho cabezas para detectar insultos, amenazas o contenido sexual explícito antes de mostrarlo al usuario, aprovechando la ventana de contexto ampliada para respuestas largas.
- Protección de agentes autónomos: la cabeza `unsafe_ai_content` permite detectar peticiones o salidas asociadas a riesgos de seguridad de IA (por ejemplo, intentos de jailbreak o instrucciones peligrosas) que las siete etiquetas clásicas de toxicidad no cubren.
- Moderación de comunidades multilingües: con 17 idiomas, un mismo despliegue puede cubrir foros o chats en español, inglés, árabe, japonés o hindi sin mantener un modelo por idioma.
- Pasarela de seguridad en pipelines RAG: se clasifican documentos recuperados y consultas de usuario antes de la generación, evitando que contenido tóxico entre en el contexto del modelo.
- Sidecar de CPU en producción: al exportarse a ONNX y ejecutarse en CPU con ONNX Runtime, puede desplegarse como servicio independiente de bajo coste junto a la API del LLM principal, sin consumir GPU.
- Evaluación por lotes de datasets: clasificación de grandes volúmenes de texto (comentarios, reseñas, transcripciones) para auditar la calidad y seguridad de corpus antes de usarlos en entrenamiento.

## Benchmarks y rendimiento

La model card menciona una evaluación unificada sobre particiones de test retenidas (suites in-distribution, con submuestreo para Qwen3Guard-Gen-0.6B marcado con asterisco) y una comparación con `s-nlp`, `KoalaAI` y `Qwen3Guard-Gen-0.6B`, con script reproducible (`scripts/eval_suite.py`) y resultados en `eval_results.json`. Sin embargo, los valores numéricos concretos no aparecen en la información proporcionada (el texto se corta en la sección de benchmarks).

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,2 GB solo para pesos (307,5 M de parámetros × 4 bytes), más memoria de activaciones según la longitud de secuencia.
- VRAM estimada en FP16: aproximadamente 0,6 GB para pesos; la variante ONNX FP16 reduce aún más el uso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria libre es suficiente; modelos como RTX 3060, RTX 4090, A100 o H100 no suponen ningún problema.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU consumer moderna (incluso GTX 1650 o superiores con 4 GB).
- Despliegue: `transformers` (pipeline de clasificación de texto), ONNX Runtime (CPU o GPU), `llm-guard` con backend PyTorch u ONNX, y text-embeddings-inference según los tags del repositorio. vLLM, llama.cpp, Ollama y TGI no aplican a un encoder de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo indica que la variante tiny-en está orientada a CPU de borde y que base es la de mayor precisión de la familia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Etiquetas | Notas |
|---|---|---|---|---|---|---|
| Tamarillo/toxicity-safety-guard-base | 307,5 M | 8.192 (validado 3.584) | 17 | Apache-2.0 | 8 sigmoides | Compatible con llm-guard |
| Tamarillo/toxicity-safety-guard-small | 140,6 M | No disponible | 17 | Apache-2.0 | 8 sigmoides | Misma familia, equilibrio precisión/velocidad |
| Tamarillo/toxicity-safety-guard-tiny-en | 32,0 M | No disponible | Solo inglés | Apache-2.0 | 8 sigmoides | Orientado a CPU de borde |
| unitary/toxic-bert | No disponible | No disponible | Inglés | No disponible | 6 (nombres distintos: `toxic`, `identity_hate`) | No es sustitución directa |
| s-nlp/roberta_toxicity_classifier | No disponible | No disponible | Inglés | No disponible | 2 (softmax `neutral`/`toxic`) | Usado por garak |
| Qwen3Guard-Gen-0.6B | 0,6 B | No disponible | No disponible | No disponible | Generativo | Evaluado con plantilla de chat |

## Limitaciones y advertencias

- Es un clasificador, no un generador: no puede sustituir a un LLM en tareas de generación, razonamiento o tool calling.
- El escáner `Toxicity` de llm-guard solo filtra por sus siete etiquetas clásicas e ignora `unsafe_ai_content`; para cubrir esa octava categoría hay que invocar el modelo directamente con `transformers.pipeline` u ONNX Runtime.
- No es una sustitución directa de `unitary/toxic-bert` ni de `s-nlp/roberta_toxicity_classifier`: los nombres de etiquetas y el tipo de activación difieren, por lo que migrar requiere un adaptador de tres líneas.
- La validación del contexto llega a 3.584 tokens pese a que el backbone soporta 8.192; textos más largos deben truncarse (el quickstart usa `max_length=2048`).
- Los umbrales de decisión son sensibles al dominio: el valor 0.5 del ejemplo de llm-guard debe calibrarse por aplicación para equilibrar falsos positivos y negativos.
- Riesgo de sesgos heredados de los datasets de origen (civil_comments, Aegis, Salad-Data, PolyGuardMix, ultrafeedback, aya), que pueden sobrerrepresentar ciertos dialectos, registros o grupos demográficos.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no evaluados.
- No hay datos publicados de latencia, throughput ni resultados numéricos de benchmarks en la información disponible, lo que dificulta planificar capacidad en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es todavía inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/toxicity-safety-guard-base
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Escáner Toxicity de llm-guard: https://github.com/protectai/llm-guard
- Dataset google/civil_comments: https://huggingface.co/datasets/google/civil_comments
- Dataset nvidia/Aegis-AI-Content-Safety-Dataset-2.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Dataset OpenSafetyLab/Salad-Data: https://huggingface.co/datasets/OpenSafetyLab/Salad-Data
- Dataset ToxicityPrompts/PolyGuardMix: https://huggingface.co/datasets/ToxicityPrompts/PolyGuardMix
- Dataset argilla/ultrafeedback-binarized-preferences-cleaned: https://huggingface.co/datasets/argilla/ultrafeedback-binarized-preferences-cleaned
- Dataset CohereForAI/aya_dataset: https://huggingface.co/datasets/CohereForAI/aya_dataset
- Modelo comparable unitary/toxic-bert: https://huggingface.co/unitary/toxic-bert
- Modelo comparable s-nlp/roberta_toxicity_classifier: https://huggingface.co/s-nlp/roberta_toxicity_classifier
