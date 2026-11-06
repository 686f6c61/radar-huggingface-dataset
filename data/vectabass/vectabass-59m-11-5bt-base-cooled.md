# VectaBass/vectabass-59m-11.5bt-base-cooled

## Resumen

vectabass-59m-11.5bt-base-cooled es un modelo de lenguaje base de 59,48 millones de parámetros totales (27,27 millones sin contar los embeddings) desarrollado por VectaBass. Se trata de una celda concreta (N0-D4) del addendum AR de un estudio de leyes de escala: un peldaño adicional por debajo de la escalera principal del proyecto (que va de 100M a 1,6B), entrenado con la misma receta y los mismos datos para poder verificar la ley de escala a un tamaño menor. No es un modelo pensado para uso como asistente, sino una pieza de investigación.

La arquitectura es de tipo Llama, con atención causal, GQA 2:1 y una innovación propia del proyecto: atención autoexclusiva (XSA). El modelo se entrenó con 11.519.590.400 tokens (422 tokens por parámetro no-embedding), usando el optimizador Muon para las matrices ocultas y AdamW en fp32 para el resto, sobre dos GPU NVIDIA GH200 de 120 GB.

El interés actual del modelo es doble: por un lado, aporta un punto de medida adicional para estudios de leyes de escala en regímenes de cómputo muy bajos; por otro, el proyecto se enmarca explícitamente en la iniciativa de IA soberana del Reino Unido (uk-sovereign-ai) e incluye datos de fuentes públicas y parlamentarias británicas, además de lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) y escocés. La licencia Apache 2.0 y su reducido tamaño lo hacen fácilmente reproducible y desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama con atención causal, GQA 2:1 y atención autoexclusiva (XSA) |
| Parametros totales | 59.473.920 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el autor recomienda ejecutar en bf16, tal como fue entrenado) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco (inglés mayoritario; galés, gaélico escocés, irlandés, manés, córnico y escocés en proporciones menores) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB), requiere `trust_remote_code=True` para cargar `modeling_vectabass.py` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 6 capas, anchura 640, 10 cabezas de consulta y 5 de clave-valor (dim 64 por cabeza), feed-forward SwiGLU de 1728, normalización RMSNorm pre-norm y posiciones RoPE con base 10000 y contexto de 2048 tokens. El vocabulario tiene 50304 filas: BPE de GPT-2 (50257 tokens) más 26 tokens especiales y relleno. La peculiaridad arquitectónica frente a Llama es la atención autoexclusiva (XSA), que el autor señala como una desviación explícita del diseño Llama estándar.

El entrenamiento usó 11.519.590.400 tokens (422 por parámetro no-embedding), con un tamaño de batch de 327.680 tokens. El optimizador combina Muon para las matrices ocultas (NS 5, Moonlight RMS 0,2, momentum 0,95) con AdamW en fp32 (betas 0,9 y 0,95). El pico de learning rate fue 0,00359, con calentamiento de 27M tokens, fase constante y un cooldown 1-sqrt hasta cero en el último 20% del entrenamiento. El weight decay fue 0,119 sobre las matrices. Se entrenó en bf16 (pesos y activaciones) con pesos maestros en fp32 en el optimizador, estadísticas de norma, ángulos RoPE y logits en fp32, sobre 2 GPU NVIDIA GH200 de 120 GB. Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96B tokens únicos, con fuentes del sector público y parlamentario británico y de lenguas celtas (fineweb-edu, fineweb-2, finemath).

## Capacidades

- Generación de texto autoregresiva en inglés y, en menor medida, en galés, gaélico escocés, irlandés, manés, córnico y escocés.
- Modelo base: no está ajustado a instrucciones ni a seguridad, por lo que no sigue instrucciones de forma fiable.
- Razonamiento y matemáticas: no se han medido puntuaciones zero-shot; el modelo se entrenó parcialmente con finemath, pero no hay evidencia publicada de rendimiento en tareas matemáticas.
- Código: no disponible (no se reporta evaluación en tareas de programación).
- Tool calling / function calling: no disponible (no es una capacidad documentada del modelo).
- Agentes y razonamiento multi-paso: no disponible (modelo base sin ajuste para agentes).
- Capacidades multilingües: cubre siete lenguas, con el inglés como lengua dominante y las lenguas celtas en proporciones menores según el reparto de bins de datos.
- Capacidades especiales: no dispone de modo de pensamiento (thinking), visión ni audio.

## Casos de uso

- Investigación sobre leyes de escala: el modelo sirve como punto de medida N0 (27,3M parámetros no-embedding) para ajustar y validar curvas de pérdida frente al presupuesto de tokens en el rango de cómputo bajo, comparándolo con las celdas de 100M a 1,6B del mismo proyecto.
- Reproducción de experimentos de entrenamiento: al estar publicados receta, hiperparámetros, hardware y procedencia (run contract `ar-addendum--N0-D4`), permite reproducir el entrenamiento en clústeres pequeños y verificar la reproducibilidad bit a bit de los logits.
- Estudio de arquitecturas alternativas: la atención autoexclusiva (XSA) puede analizarse de forma aislada en un modelo de 6 capas para medir su efecto sobre la pérdida de validación frente a atención estándar, gracias al bajo coste de entrenamiento.
- Modelado de lenguas celtas de bajos recursos: el modelo incluye datos de galés, gaélico escocés, irlandés, manés, córnico y escocés, por lo que puede usarse como línea base para experimentos de modelado lingüístico y evaluación de perplexity en estas lenguas.
- Prototipado rápido y pruebas de pipeline: con 0,1 GB de pesos y contexto de 2048 tokens, se puede cargar en una GPU consumer o incluso en CPU para probar integraciones con transformers, tokenización y generación antes de escalar a modelos mayores.
- Generación de texto controlada en dominios institucionales: al haberse entrenado con fuentes del sector público y parlamentario británico, puede emplearse como base para ajuste fino supervisado en tareas de redacción administrativa o summarización de documentos públicos (siempre con ajuste posterior, dado que es un modelo base).
- Docencia y divulgación: su pequeño tamaño y su licencia Apache 2.0 lo hacen adecuado para demostrar el funcionamiento interno de un transformer (atención, RoPE, GQA, XSA) en cursos y talleres sin requerir hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor reporta únicamente la pérdida de validación sobre el corpus de validación interno (phase-1-release canon-8192, 8192 secuencias de 2048 tokens): 2,5945 nats por token en el entrenamiento y 2,5946 bajo PyTorch SDPA con los pesos de este repositorio, que reproducen los logits del código de entrenamiento bit a bit (el entrenamiento usó FlashAttention-4). Las puntuaciones zero-shot no están medidas todavía.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,12 GB en bf16 solo para los pesos (59,48M parámetros × 2 bytes); con caché KV y activaciones para contexto de 2048 tokens, el consumo total se mantiene muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo se entrenó en 2 × NVIDIA GH200 de 120 GB, pero la inferencia no requiere ese hardware. Funciona en RTX 4090, RTX 3090, A100, H100 y GPUs de gama media.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con al menos 1-2 GB de VRAM libre; también es viable en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `modeling_vectabass.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al requerir código remoto personalizado es probable que necesiten adaptación.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-59m-11.5bt-base-cooled | 59,48M (27,27M no-embedding) | 2048 | Apache 2.0 | Pérdida de validación 2,5945 nats/token; sin benchmarks zero-shot | Hugging Face, requiere `trust_remote_code` |
| Celdas del mismo proyecto (100M–1,6B) | 100M–1,6B | no disponible | no disponible | no disponible en la información proporcionada | no disponible |
| Alternativas comparables de ~50-60M | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos sobre modelos comparables de la misma categoría (modelos base de ~50-60M parámetros con contexto de 2048) en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de escala, no un asistente: afirmará cosas falsas con fluidez y no sigue instrucciones de forma fiable.
- No tiene ajuste de instrucciones ni ajuste de seguridad, y no se filtran las salidas.
- Contexto limitado a 2048 tokens, insuficiente para tareas de documento largo o conversaciones multi-turno extensas.
- Cobertura lingüística desequilibrada: mayoritariamente inglés, con las lenguas celtas y el escocés en proporciones menores; el rendimiento en estas lenguas no está medido.
- Riesgo elevado de alucinación y de sesgos heredados de los corpus de preentrenamiento (fineweb-edu, fineweb-2, finemath y fuentes públicas británicas), sin evaluación de sesgos publicada.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin garantías de calidad, cualquier uso en producción requeriría ajuste fino y evaluación propios.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python del repositorio del autor; conviene auditar `modeling_vectabass.py` antes de desplegarlo en entornos de producción.
- El modelo debe ejecutarse en bf16, tal como fue entrenado; no se documentan recetas de cuantización ni garantías de calidad en otras precisiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-59m-11.5bt-base-cooled
- Referencia de Isambard-AI National AI Research Resource: https://doi.org/10.48550/arXiv.2410.11199
- Paper del proyecto: pendiente de publicación (el autor indica citar el repositorio hasta su aparición)
- Repositorio de código de modelado: `modeling_vectabass.py` dentro del repositorio de Hugging Face
- Documentación de datos: `DATA.md` dentro del repositorio de Hugging Face
- Procedencia del entrenamiento: `provenance.json` dentro del repositorio de Hugging Face
