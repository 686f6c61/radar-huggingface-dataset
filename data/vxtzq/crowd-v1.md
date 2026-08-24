# Vxtzq/Crowd-v1

## Resumen

Crowd-v1 es la primera arquitectura oficial del proyecto CrowdGPT, una iniciativa comunitaria de entrenamiento distribuido de modelos de lenguaje. A diferencia de un lanzamiento convencional, este modelo se distribuye con pesos inicializados aleatoriamente, con el objetivo de que los clientes de CrowdGPT lo descarguen y participen en su entrenamiento colectivo. La arquitectura, denominada SotaGPT, es un transformer autoregresivo de aproximadamente 502 millones de parámetros, con atención por grupos (GQA), embeddings rotatorios (RoPE) y MLP SwiGLU.

El modelo no está preentrenado: sus pesos no contienen conocimiento lingüístico alguno y no debe esperarse que genere texto coherente. Su propósito es servir como definición común y formato de pesos para el entrenamiento distribuido, así como base para la investigación en este ámbito. La liberación incluye pesos en formato binario plano (BF16 y FP32) y un archivo de configuración JSON, junto con sumas SHA-256 para verificación de integridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SotaGPT (transformer autoregresivo) |
| Parametros totales | 502,018,560 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 tokens |
| Tipos de cuantizacion | No cuantizado; formatos BF16 y FP32 en binario plano |
| Idiomas soportados | No disponible (usa tokenizador GPT-2 con 50,257 tokens) |
| Licencia | MIT |
| Formato de pesos | Binario plano (weights_bf16.bin, weights_fp32.bin) |

## Arquitectura y entrenamiento

Crowd-v1 se basa en una arquitectura transformer autoregresiva denominada SotaGPT, con 24 capas, dimensión oculta de 1,536, 16 cabezas de atención y 4 cabezas de clave/valor (GQA). Emplea embeddings rotatorios (RoPE) para codificar posiciones, MLP con activación SwiGLU (dimensión oculta 2,560) y weight tying entre la matriz de embeddings y la cabeza de salida. La atención es causal, con un máximo de 64 tokens de secuencia, lo que limita severamente su uso como modelo de lenguaje conversacional.

El modelo no ha sido entrenado: los pesos se generan de forma determinista con seed 42, usando una distribución normal N(0, 0.02) para los parámetros no de normalización, y capas LayerNorm con pesos inicializados a 1.0 y sesgos a 0.0. No se proporcionan datos de entrenamiento, tokens utilizados ni técnicas de alineación como RLHF o DPO. La liberación está orientada a facilitar el entrenamiento distribuido a través de la infraestructura CrowdGPT, no a ofrecer un modelo funcional.

## Capacidades

- Generacion de texto: no disponible (pesos aleatorios, sin entrenamiento).
- Razonamiento, codigo, matematicas: no disponible.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Capacidades multilingues: no evaluadas (el tokenizador es GPT-2, pero no se especifica idiomas).
- Capacidades especiales: ninguna; solo es una arquitectura base para entrenamiento distribuido.

## Casos de uso

- Entrenamiento distribuido comunitario: el modelo sirve como punto de partida común para que participantes de CrowdGPT descarguen los pesos, realicen gradientes y los agreguen al entrenamiento colectivo.
- Investigacion en arquitecturas de lenguaje: permite experimentar con configuraciones como GQA, RoPE, SwiGLU y weight tying en un modelo de tamaño medio, sin necesidad de preentrenar desde cero.
- Reproducibilidad de inicializaciones: al generarse con seed fija, se puede verificar la integridad de los pesos mediante las sumas SHA-256 publicadas.
- Desarrollo de clientes CrowdGPT: los desarrolladores pueden usar la arquitectura y el formato de pesos para construir o probar implementaciones compatibles con el protocolo de entrenamiento distribuido.
- Experimentos de inicializacion: permite estudiar el efecto de la inicialización aleatoria en el comportamiento de entrenamiento, por ejemplo variando la escala de ruido.
- Educacion en modelos de lenguaje: sirve como ejemplo didáctico de un transformer autoregresivo completo, con configuraciones detalladas y código de generación disponible en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no ha sido entrenado, por lo que no tiene sentido evaluarlo en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, pues no genera texto. Para entrenamiento, los pesos en BF16 ocupan ~1.0 GB y en FP32 ~2.0 GB, por lo que caben en cualquier GPU moderna (incluso consumer) o en CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para entrenamiento en FP32; para BF16 basta con menos. No se requiere hardware específico.
- Compatibilidad con consumer GPU: sí, dado el tamaño reducido.
- Opciones de despliegue: no se menciona soporte para vLLM, llama.cpp, Ollama o TGI. El formato binario plano está diseñado para el cliente CrowdGPT; no hay integración con frameworks estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Crowd-v1 no es un modelo preentrenado y no tiene competidores directos en el ámbito de arquitecturas distribuidas sin entrenar. En el campo de modelos de lenguaje pequeños (500M) existen alternativas como GPT-2 (124M, 355M, 774M) o Llama 3.2 1B, pero todas ellas están preentrenadas y listas para inferencia, mientras que Crowd-1 es solo una plantilla para entrenamiento.

## Limitaciones y advertencias

- El modelo no contiene conocimiento lingüístico: no debe usarse como modelo de lenguaje, chatbot o generador de texto.
- Contexto extremadamente corto: 64 tokens, inutilizable para tareas que requieran contexto largo.
- No hay tokenizador específico: se usa el tokenizador GPT-2 (50,257 tokens), lo que limita la adaptación a otros idiomas o dominios.
- No se proporciona datos de entrenamiento ni plan de entrenamiento: la utilidad real depende de la comunidad CrowdGPT.
- La licencia MIT permite uso comercial, pero el modelo sin entrenar no tiene valor práctico para producción.
- La arquitectura SotaGPT es exclusiva del proyecto CrowdGPT; no hay garantía de compatibilidad con otros frameworks.
- Los pesos binarios no son estándar (no safetensors, no GGUF), lo que dificulta su uso fuera del ecosistema CrowdGPT.

## Enlaces

- HuggingFace: https://huggingface.co/Vxtzq/Crowd-v1
- Repositorio GitHub: https://github.com/Vxtzq/CrowdGPT
- Sitio web CrowdGPT: https://crowdgpt.net
