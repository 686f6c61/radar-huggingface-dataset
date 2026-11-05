# VectaBass/vectabass-374m-11.5bt-base-cooled

## Resumen

vectabass-374m-11.5bt-base-cooled es un modelo de lenguaje base de 374 millones de parámetros totales (303,1 millones sin embeddings) desarrollado por VectaBass, un proyecto orientado a la investigación de leyes de escalado y a la soberanía tecnológica del Reino Unido en IA. Se trata de una celda concreta, la N3-D4, dentro de una matriz experimental denominada "AR square": una escalera de modelos de 100M a 1.600M de parámetros no-embedding, cada uno entrenado con varios presupuestos de tokens y publicados conjuntamente para que la ley de escalado pueda verificarse de forma empírica.

El modelo emplea una arquitectura transformer tipo Llama con atención causal, GQA 2:1 y una innovación propia denominada XSA (exclusive self-attention), que requiere código personalizado (`modeling_vectabass.py`) y carga con `trust_remote_code=True`. Se entrenó sobre 11.519.590.400 tokens (38 tokens por parámetro no-embedding), lo que lo sitúa en la zona de Chinchilla-óptimo, con una ventana de contexto de solo 2048 tokens.

Es relevante ahora porque forma parte de una iniciativa de IA soberana británica que incluye fuentes parlamentarias y de administración pública del Reino Unido, además de lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) y escocés. No es un modelo para uso como asistente: es una pieza de un estudio de escalado, publicado bajo licencia Apache 2.0 y entrenado en un único nodo NVIDIA GH200 de 120 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama con atención causal, GQA 2:1 y XSA (exclusive self-attention) |
| Parámetros totales | 373.942.272 (embeddings atados) |
| Parámetros activos | no disponible (no es MoE) |
| Parámetros no-embedding | 303.114.240 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible (entrenado y publicado en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `modeling_vectabass.py` para `trust_remote_code`) |
| Anchura / capas | 1408 / 13 |
| Cabezas de atención | 22 query, 11 key-value, dimensión 64 |
| Feed-forward | SwiGLU, dimensión 4112 |
| Normalización | RMSNorm, pre-norm |
| Posiciones | RoPE, base 10000 |
| Vocabulario | 50.304 filas: GPT-2 BPE (50.257) + 26 tokens especiales + padding |
| Precisión de entrenamiento | bf16 pesos y activaciones, fp32 master weights en el optimizador |
| Hardware de entrenamiento | 1 × NVIDIA GH200 120 GB |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La red es un transformer decoder-only de estilo Llama con 13 capas, anchura 1408, SwiGLU de dimensión 4112 y RMSNorm pre-norm. La diferencia clave respecto a Llama es la atención XSA (exclusive self-attention), una variante de self-attention que no está presente en la arquitectura original y que obliga a cargar código propio del repositorio. La atención usa GQA con ratio 2:1 (22 cabezas query, 11 key-value) y RoPE con base 10000 sobre una ventana de 2048 tokens.

El entrenamiento consumió 11.519.590.400 tokens con un batch de 327.680 tokens, optimizador híbrido Muon (matrices ocultas, NS 5, Moonlight RMS 0,2, momentum 0,95) más AdamW en fp32 (0,9, 0,95). El LR máximo fue 0,00174, con warmup de 190M tokens, fase constante y un cooldown "1-sqrt" hasta cero en el último 20 % del entrenamiento. El weight decay fue 0,0691 sobre matrices. Los datos provienen de 47 bins de texto con licencia abierta (unos 96B tokens únicos), incluyendo fineweb-edu, fineweb-2 y finemath, además de fuentes del sector público y parlamentarias del Reino Unido y de lenguas celtas; el detalle está en `DATA.md`. Todo el entrenamiento se ejecutó en una sola GH200 de 120 GB.

## Capacidades

- Generación de texto autoregresiva en inglés y, en menor medida, en galés, gaélico escocés, irlandés, manés, córnico y escocés.
- Modelo base sin instruction tuning ni safety tuning: no sigue instrucciones ni mantiene formato conversacional de forma fiable.
- Razonamiento de múltiples pasos y matemáticas solo a nivel emergente de un modelo de 374M; no se documentan capacidades específicas.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni planificación multi-paso.
- Sin capacidades de visión ni audio.
- Sin modo "thinking" ni decodificación especulativa documentada.
- Capacidad multilingüe limitada a las siete lenguas listadas, con el inglés como idioma dominante.

## Casos de uso

- Investigación sobre leyes de escalado: el modelo es una celda de una matriz experimental; se usa para ajustar y validar curvas de pérdida frente a parámetros y tokens, comparando con las demás celdas de la escalera de 100M a 1.600M.
- Reproducción de experimentos: al reproducir los logits del código de entrenamiento de forma bit a bit, sirve como referencia para verificar implementaciones de XSA, Muon o del schedule de cooldown.
- Evaluación de técnicas de entrenamiento: permite medir el efecto de Muon frente a AdamW, del cooldown 1-sqrt o del warmup de 190M tokens en un régimen de cómputo pequeño y controlado.
- Estudio de lenguas celtas de bajos recursos: el modelo incluye galés, gaélico escocés, irlandés, manés y córnico, por lo que puede emplearse para analizar la pérdida por idioma y la transferencia desde el inglés en modelos pequeños.
- Fine-tuning downstream de bajo coste: con 374M parámetros y licencia Apache 2.0, es viable ajustarlo en una sola GPU consumer para tareas de clasificación, extracción o generación acotada en dominios concretos.
- Prototipado y docencia: su tamaño reducido (0,7 GB en bf16) permite desplegarlo en entornos docentes o de investigación con recursos limitados para estudiar el comportamiento de un LM base.
- Generación de texto base para experimentos de prompting: útil para medir la sensibilidad de un modelo sin alinear a distintas formulaciones de prompt, como línea base frente a modelos instruction-tuned.

## Benchmarks y rendimiento

Evaluación zero-shot con 500 ítems por tarea (shuffle con semilla 0, protocolo hub-v1). Las tareas de elección múltiple puntúan log P(continuación | contexto) con accuracy normalizada donde procede.

| Tarea | Resultado |
|---|---|
| ARC-Easy | 0,522 |
| ARC-Challenge | 0,268 |
| HellaSwag | 0,366 |
| PIQA | 0,646 |
| WinoGrande | 0,506 |
| BoolQ | 0,604 |
| MMLU | 0,232 |
| LAMBADA | 0,358 |
| DQRB (propia) | 0,566 |
| LAMBADA bits per byte | 1,258 |

Pérdida de validación en el canon retenido (phase-1-release canon-8192, 8192 × 2048 tokens): 2,1852 nats por token. Los pesos del repositorio reproducen los logits del código de entrenamiento de forma bit a bit y puntúan 2,1853 bajo PyTorch SDPA (el entrenamiento usó FlashAttention-4).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,75 GB de pesos más overhead de activaciones y caché KV; en la práctica cabe holgadamente en GPUs de 4 GB o más.
- En cuantización de 8 bits o 4 bits (no oficial, vía herramientas de terceros): por debajo de 0,5 GB, aunque no se documentan cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU con soporte bf16, desde una RTX 3060 o superior; para entrenamiento o fine-tuning completo se recomienda al menos una A100 o H100, aunque el modelo original se entrenó en una GH200 de 120 GB.
- Cabe en GPU consumer: sí, sin problemas, en tarjetas con 4-8 GB de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía oficial; al requerir `modeling_vectabass.py` por XSA, no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI sin portar la arquitectura.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-374m-11.5bt-base-cooled | 374M totales (303M no-embedding) | 2048 | Apache 2.0 | Base, XSA, foco en leyes de escalado y lenguas celtas |
| Pythia-410M | 410M | 2048 | Apache 2.0 | Base, familia de estudio de escalado; sin XSA |
| GPT-2 medium | 355M | 1024 | MIT | Base, referencia histórica; sin GQA ni RoPE |
| SmolLM-360M | 360M | 2048 | Apache 2.0 | Base moderno con GQA; sin fuentes celtas documentadas |

La comparación con Pythia, GPT-2 y SmolLM es por tamaño y categoría (modelos base pequeños); no se dispone de una comparación oficial de rendimiento publicada por el autor frente a estos modelos.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de escalado, no un asistente: afirmará cosas falsas con fluidez y no sigue instrucciones de forma fiable.
- Sin safety tuning ni filtrado de salidas; puede generar contenido inapropiado o sesgado.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Predominantemente inglés; las lenguas celtas y el escocés tienen proporciones menores y su calidad será inferior.
- Requiere `trust_remote_code=True` y ejecutar `modeling_vectabass.py`, lo que implica revisar el código antes de usarlo en producción y complica el despliegue con servidores de inferencia estándar.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado ni validado para producción.
- Riesgo de alucinación elevado por su tamaño y por la ausencia de alineación.
- No se han publicado cuantizaciones oficiales; cualquier conversión a GGUF o similar corre por cuenta del usuario.
- Sesgos derivados de las fuentes de datos (texto web, material parlamentario y del sector público británico) no evaluados en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/VectaBass/vectabass-374m-11.5bt-base-cooled
- Referencia de Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
