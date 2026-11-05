# VectaBass/vectabass-232m-950mt-base-cooled

## Resumen

vectabass-232m-950mt-base-cooled es un modelo de lenguaje base de 231,8 millones de parámetros totales (173,9 millones no pertenecientes a embeddings) desarrollado por VectaBass. Forma parte de la "celda N2-D1" de una matriz de escalado (AR square) de fase 1: una escalera de modelos de 100M a 1.600M de parámetros no-embedding, cada tamaño entrenado con varios presupuestos de tokens y publicados en conjunto para poder verificar empíricamente la ley de escalado. Este checkpoint concreto se entrenó con 950 millones de tokens, es decir, 5 tokens por parámetro no-embedding.

La arquitectura es de tipo transformer causal similar a Llama, con atención de grupo (GQA 2:1), SwiGLU, RMSNorm pre-norm y RoPE con contexto de 2048 tokens, e incorpora una innovación propia: atención exclusiva (XSA, exclusive self-attention), que Llama no tiene. El vocabulario es GPT-2 BPE ampliado a 50.304 filas. El entrenamiento se realizó en una única NVIDIA GH200 de 120 GB usando el optimizador Muon para las matrices ocultas y AdamW en fp32 para el resto.

El modelo tiene un interés fundamentalmente de investigación: sirve para estudiar leyes de escalado y para reproducir resultados de entrenamiento (los pesos reproducen los logits del código de entrenamiento bit a bit). No está ajustado por instrucciones ni por seguridad, y su contexto es corto. Su valor diferencial es el foco en fuentes de dominio público del Reino Unido y lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) junto con el escocés, dentro de un marco de "IA soberana" británica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama con atención exclusiva (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE |
| Parametros totales | 231.800.832 (embeddings atados) |
| Parametros activos | No aplica (modelo denso) |
| Parametros no-embedding | 173.850.624 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (el autor recomienda ejecutar en bf16, tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco (inglés mayoritario; galés, gaélico escocés, irlandés, manés, córnico y escocés en proporciones menores) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code` para cargar `modeling_vectabass.py`) |
| Ancho / capas | 1152 / 12 |
| Cabezas | 18 query, 9 key-value, dimensión 64 |
| Feed-forward | SwiGLU, dimensión 3040 |
| Vocabulario | 50.304 filas (GPT-2 BPE 50.257 + 26 tokens especiales + padding) |
| Tokens de entrenamiento | 950.272.000 |
| Precisión de entrenamiento | bf16 pesos y activaciones, pesos maestros fp32 en el optimizador |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 12 capas y anchura 1152, con 18 cabezas de consulta y 9 de clave-valor (GQA 2:1, dimensión 64 por cabeza). Usa SwiGLU con dimensión intermedia 3040, normalización RMSNorm en configuración pre-norm y codificación posicional RoPE con base 10.000 y contexto de 2048 tokens. La peculiaridad arquitectónica es la atención exclusiva (XSA), que modifica el mecanismo de autoatención estándar y obliga a cargar código personalizado (`modeling_vectabass.py`) mediante `trust_remote_code`.

El entrenamiento consumió 950,27 millones de tokens en lotes de 327.680 tokens, con el optimizador Muon para las matrices ocultas (NS 5, Moonlight RMS 0,2, momentum 0,95) combinado con AdamW en fp32 (betas 0,9 y 0,95). El pico de learning rate fue 0,00206, con 174 millones de tokens de warmup y un schedule de warmup, fase constante y cooldown 1-sqrt hasta cero en el último 20 % del entrenamiento. El weight decay fue 0,0784 sobre matrices. Todo el entrenamiento se ejecutó en una sola GPU NVIDIA GH200 de 120 GB, con pesos y activaciones en bf16 pero pesos maestros fp32, estadísticas de normalización, ángulos RoPE y logits en fp32.

Los datos provienen de la "vista de fase 1": 47 bins de texto con licencia abierta (unos 96.000 millones de tokens únicos), incluyendo FineWeb-Edu, FineWeb-2 y FineMath, más fuentes del sector público británico, parlamentarias y de lenguas celtas. No hay indicios de RLHF, DPO ni ajuste por instrucciones: es un modelo estrictamente base.

## Capacidades

- Generación de texto autoregresiva en modo completado (no conversacional): continúa un prefijo dado.
- Modelado de lenguaje puro; no está ajustado para seguir instrucciones ni para formato de chat.
- Capacidades multilingües limitadas: inglés dominante y presencia menor de galés, gaélico escocés, irlandés, manés, córnico y escocés.
- Conocimiento factual y de razonamiento muy limitado, coherente con su tamaño y presupuesto de tokens.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso de forma fiable.
- No dispone de modo "thinking", visión ni audio.
- Sirve como objeto de estudio para reproducir curvas de escalado y para experimentos controlados de entrenamiento.

## Casos de uso

- Investigación en leyes de escalado: el modelo es una celda de una matriz controlada (tamaño × tokens); se usa para ajustar y validar predicciones de pérdida frente a presupuesto de cómputo, comparándolo con las demás celdas de la misma escalera.
- Reproducibilidad de entrenamiento: dado que los pesos reproducen los logits del código de entrenamiento bit a bit (2,6182 nats/token frente a 2,6181), sirve para auditar pipelines de entrenamiento y verificar implementaciones de atención y optimizadores.
- Investigación en atención exclusiva (XSA): permite aislar el efecto de esta variante de atención frente a transformers Llama estándar del mismo tamaño, al ser una arquitectura abierta y reproducible en una sola GPU.
- Estudio de cobertura de lenguas celtas: con porciones de galés, gaélico escocés, irlandés, manés y córnico, permite medir la pérdida por idioma y evaluar técnicas de mezcla de datos para lenguas de bajos recursos.
- Prototipado de infraestructura de inferencia: su tamaño (0,5 GB de repo) permite probar stacks de despliegue, cuantización y servidores de inferencia en hardware modesto antes de escalar a modelos mayores.
- Experimentos de tokenización y vocabulario: al usar GPT-2 BPE ampliado a 50.304 filas, sirve como banco de pruebas para estudiar el impacto del vocabulario en lenguas no inglesas.
- Educación y docencia: modelo lo bastante pequeño para ejecutarse en una GPU de consumo y explicar de extremo a extremo el ciclo de entrenamiento e inferencia de un LLM.

## Benchmarks y rendimiento

Evaluación zero-shot, 500 ítems por tarea (barajado con semilla 0), protocolo hub-v1. Las tareas de elección múltiple puntúan log P(continuación | contexto) con precisión normalizada.

| Tarea | Resultado |
|---|---|
| ARC-Easy | 0,444 |
| ARC-Challenge | 0,210 |
| HellaSwag | 0,274 |
| PIQA | 0,602 |
| WinoGrande | 0,484 |
| BoolQ | 0,606 |
| MMLU | 0,228 |
| LAMBADA | 0,256 |
| DQRB (propia) | 0,516 |
| LAMBADA bits per byte | 1,399 |

Pérdida de validación en el canon retenido del autor (phase-1-release canon-8192, 8192 × 2048 tokens): 2,6181 nats por token; con PyTorch SDPA los pesos de este repo obtienen 2,6182. No se han publicado comparaciones con modelos de terceros en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 0,5 GB de pesos (231,8M parámetros × 2 bytes), más overhead de activaciones y caché KV; holgado por debajo de 2 GB en la práctica.
- Cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para inferencia por lotes pequeños.
- GPU recomendadas: ninguna específica; el entrenamiento se hizo en una NVIDIA GH200 de 120 GB, pero la inferencia no requiere hardware de datacenter.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por `modeling_vectabass.py`); otras herramientas (vLLM, llama.cpp, Ollama, TGI) no están documentadas para esta arquitectura personalizada en la información disponible.
- Latencia y throughput: no disponibles.
- Precisión recomendada: bf16, tal como se entrenó.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| vectabass-232m-950mt-base-cooled | 231,8M (173,9M no-embedding) | 2048 | Apache 2.0 | Estudio de escalado, XSA, lenguas celtas |
| GPT-2 small | 124M | 1024 | MIT (pesos) | Base generalista, referencia histórica |
| Pythia-160M | 160M | 2048 | Apache 2.0 | Suite de escalado con checkpoints intermedios |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | Base pequeño orientado a uso práctico |

La comparación cuantitativa de rendimiento con estas alternativas no está disponible en la información proporcionada; los benchmarks publicados del modelo no incluyen referencias de terceros.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni por seguridad: no debe usarse como asistente ni en producción orientada a usuarios finales sin un ajuste posterior.
- Genera afirmaciones falsas con fluidez; el riesgo de alucinación es alto y no hay filtrado de salidas.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Capacidad multilingüe desequilibrada: el inglés domina y las lenguas celtas aparecen en proporciones pequeñas, por lo que su calidad en ellas es previsiblemente baja.
- Rendimiento global modesto (MMLU 0,228; HellaSwag 0,274), coherente con su tamaño y sus 950M tokens de entrenamiento.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de usarlo en entornos sensibles.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo no está pensado para ello.
- No se han publicado resultados de benchmarks frente a modelos comparables ni datos de sesgo medidos.

## Enlaces

- HuggingFace: https://huggingface.co/VectaBass/vectabass-232m-950mt-base-cooled
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Referencia Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Paper del modelo: pendiente de publicación según el autor (no disponible)
