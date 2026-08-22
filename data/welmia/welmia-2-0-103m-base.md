# Welmia/welmia-2.0-103m-base

## Resumen

Welmia 2.0 103M base es un modelo de lenguaje autoregresivo de tipo GPT desarrollado por Welmia (Muhammed Rishdin T). Se trata de un modelo pequeño, de 103,4 millones de parámetros, preentrenado desde cero sobre aproximadamente 5 mil millones de tokens del dataset OpenWebText. El modelo emplea una arquitectura GPT personalizada con RoPE, RMSNorm y SwiGLU, y pesos compartidos entre la capa de embedding y la de salida.

Este modelo es la versión base, es decir, no ha sido ajustado para seguir instrucciones, por lo que su comportamiento es el de predicción del siguiente token. Está pensado como punto de partida para fine-tuning o para tareas de generación de texto simple. Su relevancia radica en ser un ejemplo de entrenamiento desde cero con una arquitectura moderna, y en su licencia Apache 2.0 que permite uso comercial sin restricciones. La longitud de contexto es de 512 tokens, lo que limita su uso en tareas que requieran contextos largos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT personalizada (RoPE, RMSNorm, SwiGLU, weight tying) |
| Parámetros totales | 103.385.856 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una GPT estándar con 12 capas, 12 cabezas de atención y dimensión de embedding de 768. Utiliza normalización RMSNorm en lugar de LayerNorm, activación SwiGLU en las capas de feed-forward y codificación posicional RoPE. Los embeddings de entrada y salida están atados (weight tying). El tokenizador es un BPE personalizado de 24.000 tokens, entrenado específicamente para este modelo, y no es compatible con el vocabulario de GPT-2/tiktoken utilizado en el modelo anterior de Welmia.

El entrenamiento se realizó desde cero sobre el dataset Open WebC, con aproximadamente 5 mil millones de tokens, usando el objetivo de modelado de lenguaje causal. El optimizador fue AdamW con una programación de tasa de aprendizaje coseno. No se menciona el uso de RLHF, DPO ni ningún ajuste posterior. La implementación actual no incluye caché de claves/valores (KV cache), lo que provoca que la generación sea más lenta que en implementaciones optimizadas, ya que recalcula el forward completo en cada paso.

## Capacidades

- Generación de texto autoregresivo: el modelo predice el siguiente token y puede continuar texto dado un prefijo.
- Razonamiento básico: al ser un modelo base, su capacidad de razonamiento es limitada y no está optimizado para responder preguntas ni seguir instrucciones.
- Capacidades multilingües: solo soporta inglés, ya que el tokenizador y el entrenamiento se basan en Open Web Open (texto en inglés).
- No soporta tool calling ni function calling, ya que no ha sido ajustado para ello.
- No tiene capacidades de visión ni audio; es puramente texto.
- No posee modo de pensamiento (thinking mode) ni razonamiento multi-paso explícito.

## Casos de uso

- Fine-tuning para tareas específicas: el modelo puede ser ajustado con datasets propios para clasificación de texto, análisis de sentimiento o generación de contenido en inglés, dado su tamaño reducido y licencia permisiva.
- Prototipado rápido: sirve para probar técnicas de entrenamiento o de generación de texto sin incurrir en altos costes computacionales, gracias a sus 103M de parámetros.
- Educación e investigación: es útil como ejemplo de arquitectura desde cero (RoPE, SwiGLU, RMSNorm) para estudiar cómo funcionan estos componentes en un modelo pequeño.
- Generación de texto en aplicaciones embebidas: al ser ligero, puede desplegarse en dispositivos con recursos limitados, como Raspberry Pi o dispositivos móviles, para tareas como autocompletar texto o generar respuestas predefinidas.
- Análisis de la evolución del lenguaje: al ser un modelo entrenado en Open Web Text, puede usarse para estudiar la distribución estadística del lenguaje en ese corpus, aunque con limitaciones por su contexto corto.
- Base para modelos instructivos: el autor indica que existe una versión instructiva separada (welmia-1.0-103m-instruct), pero este modelo base puede servir como punto de partida para un ajuste instructivo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar. El autor no proporciona comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 103M parámetros, el modelo en FP32 ocupa aproximadamente 400 MB. En FP16 (mitad de precisión) se reduce a ~200 MB. Con cuantización a 4 bits (si se convierte a GGUF o similar) podría bajar a ~100 MB, pero no se ofrecen pesos cuantizados oficialmente.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente para la inferencia, por ejemplo NVIDIA GTX 1050 Ti, RTX 2060, o incluso integradas con suficiente memoria. En la práctica, cabe en tarjetas de gama de entrada.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo actuales, incluso en CPUs con suficiente RAM.
- Opciones de despliegue: dado que usa `trust_remote_code=True` y una arquitectura personalizada, se puede usar con transformers de Hugging Face. No se menciona soporte para vLLM, llama.cpp u Ollama; requeriría adaptación para esos entornos.
- Latencia y throughput: no hay datos oficiales. Dado que no tiene KV cache, la generación es lenta para secuencias largas; en una GPU moderna (RTX 3090) se podría esperar una velocidad de generación de unos pocos tokens por segundo, pero es una estimación.

## Comparativa con modelos similares

El modelo se puede comparar con otros modelos pequeños de la misma escala, aunque no hay datos de rendimiento. La comparación se basa en especificaciones.

| Modelo | Parámetros | Contexto | Licencia | Arquitectura |
|---|---|---|---|---|
| welmia-2.0-103m-base | 103.4M | 512 | Apache 2.0 | GPT personalizada (RoPE, SwiGLU) |
| GPT-2 (124M) | 124M | 1024 | MIT | GPT-2 (ReLU, no RoPE) |
| Pythia-160M | 160M | 2048 | Apache 2.0 | GPT-NeoX (RoPE) |

El modelo de Welmia es más pequeño que GPT-2 y Pythia, con contexto mucho menor (512 frente a 1024 o 2048). No se dispone de comparación de rendimiento. GPT-2 y Pythia tienen más soporte de herramientas y de cuantización, mientras que Welmia es una arquitectura de investigación.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse en Open Web Text, el modelo puede reproducir sesgos presentes en ese corpus (género, raciales, culturales). No se han realizado evaluaciones de sesgo.
- Riesgo de alucinación: al ser un modelo base, tiende a generar texto plausible pero no verídico, especialmente en temas de conocimiento factual.
- Limitaciones de contexto: solo 512 tokens, por lo que no puede manejar conversaciones largas ni documentos extensos.
- Limitaciones de idioma: solo inglés, no soporta español ni otros idiomas.
- No es un modelo instructivo: no sigue instrucciones ni responde a preguntas; solo continúa texto.
- Implementación sin KV cache: la generación es lenta y no apta para producción a gran escala.
- Tokenizador personalizado: no compatible con tokenizadores estándar, lo que requiere usar el tokenizador del repositorio.
- Licencia: Apache 2.0 permite uso comercial, pero hay que respetar la atribución y las condiciones de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Welmia/welmia-2.0-103m-base
- Perfil del autor: https://huggingface.co/Welmia
- Repositorio gemproject (otro proyecto del autor): https://huggingface.co/Welmia/gemproject
- (No se encontraron papers, blogs o demos específicos para este modelo en la búsqueda web.)
