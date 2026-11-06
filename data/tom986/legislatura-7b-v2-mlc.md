# tom986/legislatura-7b-v2-MLC

## Resumen

legislatura-7b-v2-MLC es un ajuste fino del modelo Qwen2.5-7B-Instruct de Alibaba Cloud, desarrollado por el usuario tom986 para el videojuego «Legislatura». El modelo se distribuye exclusivamente en formato MLC q4f16_1, es decir, pesos cuantizados a 4 bits con activaciones en FP16 compilados para el runtime MLC LLM y, específicamente, para su ejecución en el navegador mediante WebLLM. La estructura de artefactos replica la del repositorio oficial mlc-ai/Qwen2.5-7B-Instruct-q4f16_1-MLC, lo que facilita su carga en dicho ecosistema.

El propósito declarado es servir como IA conversacional dentro del citado videojuego, ajustada con ejemplos propios del autor. No se documentan detalles sobre el conjunto de datos de ajuste, el número de tokens de entrenamiento, la metodología (SFT, RLHF o DPO) ni los resultados de evaluación. El repositorio tiene 4,3 GB, coherente con una cuantización de 4 bits de un modelo de 7.600 millones de parámetros.

La relevancia de esta ficha es limitada pero concreta: se trata de un caso de despliegue de un LLM de 7B en el navegador del cliente mediante WebLLM, un patrón útil para aplicaciones interactivas que necesitan inferencia local sin backend. No obstante, la ausencia de licencia explícita, de idiomas declarados y de cualquier benchmark hace que su evaluación rigurosa sea imposible con la información pública disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.600 millones (heredados de Qwen2.5-7B-Instruct; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (Qwen2.5-7B-Instruct soporta hasta 32.768 tokens nativos y 131.072 con YaRN, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | q4f16_1 (4 bits de pesos, activaciones FP16), formato MLC |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base es Apache 2.0, pero el ajuste no declara licencia propia) |
| Formato de pesos | MLC LLM (artefactos compilados para WebLLM, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención por grupos de consultas (GQA), normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Sobre esa base, el autor aplica un ajuste fino con «ejemplos propios», presumiblemente orientado a diálogos y contenido del videojuego «Legislatura». No se especifica el volumen de datos, la composición del dataset, ni si se emplearon técnicas de alineación adicionales como RLHF o DPO.

La innovación técnica del repositorio no está en el entrenamiento sino en el empaquetado: los pesos se distribuyen como artefactos MLC q4f16_1, con la misma estructura que el repositorio de referencia de MLC AI, lo que permite cargarlos directamente en WebLLM dentro de un navegador con WebGPU. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones más allá de la cuantización de 4 bits.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, sujeto al ajuste fino realizado por el autor.
- Capacidad multilingüe potencial (el modelo base cubre decenas de idiomas), aunque el autor no declara idiomas soportados.
- Ejecución en navegador mediante WebLLM y WebGPU, sin necesidad de servidor de inferencia.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito; no disponible.
- El ajuste está orientado al dominio del videojuego «Legislatura», por lo que su comportamiento fuera de ese contexto es incierto.

## Casos de uso

- Integración de un NPC conversacional en el videojuego «Legislatura»: el modelo se carga en el cliente vía WebLLM y gestiona diálogos con el jugador sin coste de servidor ni latencia de red, aprovechando la cuantización q4f16_1 para reducir el peso a 4,3 GB.
- Prototipado de chatbots locales en navegador: sirve como referencia de cómo empaquetar un ajuste de Qwen2.5-7B en formato MLC para WebLLM, replicando la estructura del repositorio oficial.
- Demostraciones offline de IA conversacional: al ejecutarse íntegramente en el dispositivo, es adecuado para escenarios sin conectividad o con requisitos de privacidad estrictos.
- Evaluación de despliegue edge de LLM de 7B: útil para medir el rendimiento real de WebGPU en equipos de usuario final con un modelo de este tamaño.
- Base para ajustes de dominio en proyectos lúdicos: el autor documenta el flujo de ajuste sobre Qwen2.5-7B-Instruct, replicable para otros videojuegos o narrativas interactivas.
- Pruebas de cuantización 4 bits en producción: permite comparar la calidad de q4f16_1 frente al modelo original en tareas conversacionales concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,3 GB de pesos en q4f16_1, más overhead de activaciones y caché KV; en la práctica, se recomienda un mínimo de 6-8 GB de memoria gráfica o memoria unificada disponible para WebGPU.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable (por ejemplo, Apple Silicon M1 o superior, NVIDIA RTX serie 30 o superior, AMD RDNA 2 o superior). No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, siempre que el navegador exponga WebGPU y haya memoria suficiente; el despliegue objetivo es el navegador del cliente.
- Opciones de despliegue: WebLLM (objetivo principal), runtime MLC LLM. No se distribuyen pesos en GGUF ni safetensors, por lo que llama.cpp, Ollama, vLLM y TGI no son aplicables directamente sin reconversión.
- Latencia y throughput: no disponibles; dependen del hardware del cliente y del navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| legislatura-7b-v2-MLC | 7,6B (heredado) | no disponible | MLC q4f16_1 | no disponible | Hugging Face (0 descargas) |
| mlc-ai/Qwen2.5-7B-Instruct-q4f16_1-MLC | 7,6B | 32.768 tokens (nativo) | MLC q4f16_1 | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-7B-Instruct (original) | 7,6B | 32.768 tokens (nativo), 131.072 con YaRN | safetensors | Apache 2.0 | Hugging Face, oficial de Alibaba |
| tom986/legislatura-7b-v20261105-1821-MLC | 7,6B (heredado) | no disponible | MLC q4f16_1 | no disponible | Hugging Face (versión previa del mismo autor) |

## Limitaciones y advertencias

- Licencia no declarada: aunque el modelo base es Apache 2.0, el ajuste no especifica términos, lo que impide confirmar su uso comercial.
- Sin información sobre el dataset de ajuste: no se puede evaluar el riesgo de sesgos, sobreajuste al dominio del videojuego ni calidad fuera de él.
- Riesgo de alucinación inherente a los modelos de 7B, sin datos de evaluación que lo cuantifiquen.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto pese a la base Qwen2.5.
- Contexto no confirmado: no se garantiza que el ajuste conserve la ventana de 32.768 tokens del modelo original.
- Repositorio sin descargas ni likes y con pipeline no disponible: no hay evidencia de uso ni validación por parte de la comunidad.
- Formato exclusivamente MLC: no es directamente utilizable en stacks estándar como vLLM, TGI, llama.cpp u Ollama sin conversión.
- Sin benchmarks publicados: imposible comparar su calidad con el modelo base o con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/tom986/legislatura-7b-v2-MLC
- Versión previa del mismo autor: https://huggingface.co/tom986/legislatura-7b-v20261105-1821-MLC
- Repositorio de referencia MLC: https://huggingface.co/mlc-ai/Qwen2.5-7B-Instruct-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- WebLLM: https://webllm.mlc.ai/
- MLC LLM: https://llm.mlc.ai/
