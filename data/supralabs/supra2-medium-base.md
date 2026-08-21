# SupraLabs/Supra2-Medium-Base

## Resumen

Supra2-Medium-Base es un modelo de lenguaje causal (decoder-only) de 25 millones de parámetros, desarrollado por SupraLabs, un laboratorio independiente centrado en modelos pequeños y eficientes para hardware de consumo. Se trata de un modelo base, sin ajuste por instrucciones ni alineamiento, entrenado desde cero sobre 20 000 millones de tokens de texto web en inglés procedentes del dataset `HuggingFaceFW/fineweb-edu`. Su principal valor es demostrar que es posible lograr un modelado del lenguaje útil con una cantidad extremadamente reducida de parámetros, alcanzando una ratio de 800 tokens por parámetro, muy superior a la habitual en preentrenamiento.

El modelo utiliza la arquitectura Qwen3 con un tokenizador propio de 16 384 tokens, una ventana de contexto de 1024 tokens y embeddings atados. Está publicado bajo licencia Apache 2.0 en formato safetensors y es compatible con el ecosistema `transformers`. Está pensado para investigación sobre eficiencia de datos, despliegue en entornos con memoria severamente limitada y uso educativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3 (decoder-only transformer) |
| Parámetros totales | 25 371 008 (aprox. 20M no-embedding) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 1 024 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también disponible en el repositorio de transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3, un transformer causal con atención multi-cabeza (MHA) de 8 cabezas, 7 capas y un tamaño oculto de 512. Utiliza normalización RMSNorm, embeddings atados y codificación posicional RoPE con θ=10 000. El vocabulario se reduce a 16 384 tokens para minimizar el overhead de embeddings. No se aplica ventana deslizante; la atención cubre la totalidad del contexto de 1 024 tokens.

El entrenamiento se realizó sobre el dataset `HuggingFaceFW/fineweb-edu` (subconjunto `sample-100BT`), con 20 000 millones de tokens en inglés. Los documentos se tokenizaron y concatenaron en un flujo plano de tokens `uint16`, empaquetados en bloques contiguos de 1 024 tokens sin enmascarado entre documentos. Se empleó el optimizador AdamW con β₁=0,9, β₂=0,95 y ε=10⁻⁸, tasa de aprendizaje pico de 3×10⁻³ con decaimiento coseno hasta el 10% del valor pico, warmup de 1 000 pasos, tamaño de lote efectivo de 262 144 tokens por paso, weight decay de 0,1 y gradiente clipping de 1,0. La precisión mixta BF16/TF32 se usó sobre dos GPUs RTX 5060 Ti 16GB y RTX 5060 8GB, con Liger Kernel y técnicas de DDP bucketing. La pérdida final de entrenamiento fue de 3,2469 (sin pérdida de validación reportada).

## Capacidades

- Generación de texto en inglés: el modelo es capaz de producir continuaciones coherentes de fragmentos cortos, como se muestra en el ejemplo del README.
- Comprensión del lenguaje a nivel básico: debido a su tamaño reducido, no alcanza capacidades avanzadas de razonamiento o comprensión profunda, pero sí puede capturar patrones estadísticos del texto.
- Modelo base: no está preparado para instrucciones, chat, ni tool calling; requiere ajuste fino posterior para tareas específicas.
- Eficiencia computacional: al ser muy pequeño, se puede ejecutar en dispositivos con muy poca memoria, incluso en CPU.
- Investigación: útil para estudiar el comportamiento de modelos en regímenes de alta eficiencia de datos (800 tokens por parámetro) y para experimentos sobre scaling laws en el límite inferior.
- No soporta visión, audio ni otras modalidades; es exclusivamente texto en inglés.

## Casos de uso

- Investigación académica sobre eficiencia de parámetros: sirve como modelo de referencia para estudiar el impacto de la ratio tokens/parámetro en la calidad del lenguaje, comparándolo con modelos de mayor tamaño.
- Prototipado rápido de aplicaciones de texto: se puede usar para generar completaciones de texto en entornos de desarrollo sin requerir GPU potente, por ejemplo, en un portátil o en un Raspberry Pi.
- Educación y aprendizaje: es un modelo ideal para enseñar a estudiantes los fundamentos de los transformers, dado su pequeño tamaño y su código sencillo, fácil de inspeccionar y modificar.
- Despliegue en edge: por su tamaño (menos de 100 MB en bfloat16), puede integrarse en dispositivos con memoria de un solo dígito de MB, como tarjetas microcontroladoras o sistemas embebidos, para tareas simples de generación de texto.
- Generación de texto para aplicaciones de bajo riesgo: como sugerencias de palabras, autocompletado de formularios o generación de contenido corto en inglés, siempre que no se requiera alta precisión.
- Prueba de técnicas de ajuste fino: al ser un modelo base, se puede usar como punto de partida para aplicar métodos como LoRA o fine-tuning completo en tareas específicas, con tiempos de entrenamiento muy reducidos.

## Benchmarks y rendimiento

Los resultados se han obtenido con el EleutherAI LM-Eval Harness y se presentan en la siguiente tabla (los valores son los publicados por el autor, aunque se observa inconsistencia en la escala entre los modelos; se reproduce tal cual):

| Modelo | PIQA (acc_norm) | HellaSwag (acc_norm) | ARC-Easy (acc_norm) | ARC-Challenge (acc_norm) |
|--------|-----------------|----------------------|---------------------|--------------------------|
| Supra-50M-Base (50M) | 0,62 | 0,32 | 0,46 | 0,25 |
| Supra2-Medium-Base (25M) | 59,14 | 29,29 | 41,84 | 23,72 |
| Supra2-100M-Base (100M) | 0,65 | 0,36 | 0,48 | 0,25 |

El autor señala que el modelo muestra un rendimiento fuerte relativo a su tamaño, compitiendo incluso con su propio modelo de 50 millones de parámetros. No se dispone de resultados en otros benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 25M parámetros en bfloat16, el peso ocupa aproximadamente 50 MB. La VRAM necesaria depende del tamaño del lote, pero en cualquier GPU con 1 GB de VRAM es más que suficiente.
- GPUs recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, etc.). También funciona en CPU sin problemas.
- ¿Cabe en consumer GPU? Sí, en cualquier GPU de consumo, incluso en integradas.
- Opciones de despliegue: se puede usar directamente con `transformers` de Hugging Face. No se han publicado cuantizaciones GGUF ni integración con llama.cpp, pero al ser tan pequeño, la inferencia en CPU es viable. No hay soporte oficial documentado para vLLM o TGI, aunque podría funcionar con ellos.
- Latencia y throughput: no se han publicado datos específicos, pero al ser un modelo tan pequeño, la generación de tokens es extremadamente rápida en cualquier hardware moderno.

## Comparativa con modelos similares

Dado que se trata de un modelo de tamaño minúsculo, la comparativa se limita a los modelos de la misma familia de SupraLabs, según los datos del README.

| Modelo | Parámetros | Contexto | PIQA | HellaSwag | ARC-Easy | ARC-Challenge | Licencia |
|--------|------------|----------|------|-----------|----------|----------------|----------|
| Supra-50M-Base | 50M | no disponible | 0,62 | 0,32 | 0,46 | 0,25 | Apache 2.0 |
| **Supra2-Medium-Base** | 25M | 1 024 | 59,14 | 29,29 | 41,84 | 23,72 | Apache 2.0 |
| Supra2-100M-Base | 100M | no disponible | 0,65 | 0,36 | 0,48 | 0,25 | Apache 2.0 |

No hay datos sobre otros modelos comparables de tamaño similar en la información disponible.

## Limitaciones y advertencias

- Modelo base no alineado: no está ajustado para seguir instrucciones ni para conversación; puede producir contenido incoherente o no deseado.
- Contexto limitado: solo 1 024 tokens de ventana, lo que impide manejar documentos largos o conversaciones extensas.
- Idioma: solo inglés, no soporta otros idiomas.
- Alucinaciones y sesgos: como cualquier modelo de lenguaje, puede generar afirmaciones falsas o reproducir sesgos presentes en los datos de entrenamiento.
- Riesgo de producción: no se recomienda su uso en producción real sin un ajuste fino adicional y sin una evaluación rigurosa.
- Cuantizaciones: no se han publicado versiones cuantizadas (GGUF, AWQ, etc.), aunque el modelo es tan pequeño que no las necesita.
- No hay resultados de benchmarks adicionales (MMLU, HumanEval, etc.) más allá de los indicados.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/SupraLabs/Supra2-Medium-Base
- Sitio web de SupraLabs: https://supra-labs.com/
- Página de FriendliAI para inferencia: https://friendli.ai/models/SupraLabs/Supra2-Medium-Base
