# VeirdedAI/SLLM-0.7-PHY

## Resumen

SLLM-0.7-PHY es un modelo de lenguaje causal de tipo decoder-only desarrollado desde cero por VeirdedAI, con un presupuesto de aproximadamente 5 millones de parámetros (5.574.272 según los pesos en safetensors). A pesar del "0.7" en su nombre, que sugiere 700 millones de parámetros, el modelo real es dos órdenes de magnitud menor. La pregunta de investigación que motiva el proyecto es cuánta fluidez conversacional, razonamiento físico básico y consciencia de identidad se puede concentrar en un presupuesto de 5 millones de parámetros.

El modelo se entrena sobre tres conjuntos de datos internos de un solo turno: Chat, SimplePhysics e Identity, y está diseñado para conversación sin estado (stateless) de un único turno en hardware de consumo. Su ventana de contexto efectiva es de tan solo 128 tokens, sin memoria conversacional entre turnos, lo que lo sitúa en la categoría de modelo experimental de juguete más que en la de un asistente de producción.

Es relevante como ejemplo de arquitectura compacta bien documentada (RoPE, QK-Norm, SwiGLU, weight tying) y como banco de pruebas para estudiar los límites de capacidad en modelos de escala ínfima. Su licencia MIT y su reducido tamaño permiten ejecutarlo en CPU, Apple Silicon o cualquier GPU modesta sin apenas requisitos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal autorregresivo |
| Parametros totales | 5.574.272 (weight-tied) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (turno único, sin memoria) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Especificaciones adicionales declaradas por el autor: dimension de embedding (d_model) de 256, 8 cabezas de atencion con dimension de cabeza 32 y QK-Norm, 6 capas, dimension oculta SwiGLU de 640, vocabulario de 4.096 tokens con tokenizador SLLM-BPE (byte-level BPE sin perdida).

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal con atencion multi-cabeza (8 cabezas, dimension de cabeza 32) y 6 capas. Incorpora RoPE (rotary position embeddings) de valores reales sin sobrecarga de tensores complejos, QK-Norm con RMSNorm aplicado a queries y keys por cabeza antes de RoPE para estabilizar los logits de atencion, activaciones SwiGLU (`w2(silu(w1(x)) * w3(x))`), RMSNorm y weight tying entre embeddings de entrada y `lm_head`. La mascara de atencion causal y de padding es explicita y booleana, sin filtraciones.

El entrenamiento se realizo en dos etapas sobre tres datasets internos de un solo turno (Chat, SimplePhysics e Identity) con split 90/10. La etapa 1 (pre-entrenamiento) duro 16 epocas con mas de 80.000 ejemplos por epoca (50.000 de Chat, 30.000 de Physics y todo Identity), batch de 32, AdamW con learning rate de 1,2e-3 a 8,0e-5, weight decay 0,05, dropout 0,10 y autocast bfloat16 en MPS. La etapa 2 (SFT con mascara de IA) duro 6 epocas con batch de 32 y AdamW de 1,8e-4 a 1,0e-5, calculando la perdida unicamente sobre los tokens de respuesta del asistente. No se documenta el numero total de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto causal autorregresiva en ingles.
- Conversacion de un unico turno (stateless): no mantiene memoria entre turnos.
- Razonamiento fisico basico, limitado al dataset SimplePhysics de entrenamiento.
- Consciencia de identidad: respuestas sobre quien es el modelo, derivadas del dataset Identity.
- Tokenizacion byte-level BPE sin perdida con vocabulario de 4.096 tokens.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Experimentacion educativa: servir como modelo de referencia para estudiar el comportamiento de un transformer de 5 millones de parametros desde cero, con arquitectura completamente documentada (RoPE, QK-Norm, SwiGLU), en cursos o laboratorios de iniciacion.
- Pruebas de infraestructura de inferencia: validar pipelines de despliegue, scripts de generacion y deteccion automatica de dispositivo (CUDA, MPS, CPU) con un modelo que se ejecuta en segundos y sin requisitos de VRAM.
- Demostraciones de chat de un turno: prototipar interfaces conversacionales que solo necesitan una respuesta aislada de menos de 128 tokens, sin estado ni historial.
- Investigacion sobre limites de escala: medir hasta que punto un presupuesto de 5 millones de parametros puede aprender fluidez conversacional, fisica simple e identidad, como punto de comparacion frente a modelos mayores.
- Generacion de respuestas cortas en ingles para pruebas A/B de UX: evaluar latencia y formato de respuesta en entornos controlados antes de migrar a modelos de produccion.
- Benchmark de juguete para tokenizadores: comparar el comportamiento del tokenizador SLLM-BPE (4.096 tokens) frente a otros esquemas en tareas de generacion muy corta.
- Pruebas de robustez y seguridad en entornos aislados: al ser un modelo pequeno, entrenado con datos internos y sin acceso a red, resulta util para ensayar filtros de contenido sin coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precision completa (bfloat16/float32), dado el tamano de 5,57 millones de parametros; el repo ocupa 0,0 GB.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, Apple Silicon (Metal/MPS) y cualquier GPU NVIDIA con CUDA. GPUs de gama alta como A100 o H100 no aportan ventaja practica.
- Cabe en cualquier GPU de consumo: RTX 4090, RTX 3060, GTX 1650 e incluso iGPU, ademas de CPU y Apple Silicon.
- Opciones de despliegue: el autor proporciona `generate.py` con deteccion automatica de CUDA, MPS o CPU y dependencias de `torch` y `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al no publicarse pesos GGUF, llama.cpp y Ollama no estan disponibles de forma directa.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada. A modo de referencia estructural, se compara con alternativas de la misma categoria de modelos muy pequenos, sin datos de rendimiento:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VeirdedAI/SLLM-0.7-PHY | 5,57 M | 128 tokens | MIT | safetensors | Ingles, un solo turno, sin benchmarks |
| Modelos tipo TinyStories / nanoGPT | orden de 1-50 M | variable | variable | safetensors/PyTorch | Referencias educativas de la misma escala; sin datos comparativos publicados en esta ficha |
| Modelos de chat de produccion (p. ej. familia Llama o Qwen) | miles de millones | miles de tokens | variable | safetensors/GGUF | Categoria distinta; no comparables en capacidad |

## Limitaciones y advertencias

- El nombre "0.7" puede inducir a error: el modelo tiene aproximadamente 5,57 millones de parametros, no 700 millones.
- Ventana de contexto de solo 128 tokens y diseno stateless de un unico turno: no mantiene memoria conversacional ni soporta dialogos multi-turno.
- Entrenado exclusivamente en ingles; no se documenta capacidad multilingue.
- Entrenado sobre tres datasets internos de dominio acotado (Chat, SimplePhysics, Identity); la cobertura tematica es muy limitada y es probable que generalice mal fuera de esos dominios.
- Riesgo elevado de alucinacion y de respuestas incoherentes fuera de las distribuciones de entrenamiento, dado el reducido tamano y la ausencia de benchmarks.
- No se documentan evaluaciones de sesgo, seguridad ni toxicidad; no apto para uso en produccion con usuarios reales sin filtros adicionales.
- Licencia MIT: permite uso comercial, pero no se ofrecen garantias de calidad ni de idoneidad.
- No se publican pesos en formatos GGUF ni cuantizaciones, lo que limita el despliegue en herramientas como llama.cpp u Ollama sin conversion manual.
- No hay informacion sobre el numero total de tokens de entrenamiento ni sobre tecnicas de alineacion (RLHF/DPO).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VeirdedAI/SLLM-0.7-PHY
- Repositorio del autor en Hugging Face: https://huggingface.co/VeirdedAI
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
