# VectaBass/vectabass-232m-2.18bt-base-cooled

## Resumen

vectabass-232m-2.18bt-base-cooled es un modelo de lenguaje base de 232 millones de parámetros totales (173,9 millones no pertenecientes a embeddings) desarrollado por VectaBass, entrenado sobre 2.180 millones de tokens. Forma parte de la "Phase 1 AR square", una escalera de modelos que va de 100M a 1.600M de parámetros no-embedding, cada tamano entrenado con varios presupuestos de tokens y publicados conjuntamente para poder verificar empíricamente la ley de escalado. Este checkpoint concreto corresponde a la celda N2-D2 del retículo experimental.

El modelo emplea una arquitectura tipo transformer decoder-only de estilo Llama, con atención causal con GQA en proporción 2:1 y una innovación denominada exclusive self-attention (XSA) que Llama no incorpora. Usa RoPE con base 10000 y una ventana de contexto de 2048 tokens. El vocabulario es GPT-2 BPE (50.257 tokens) más 26 tokens especiales, hasta 50.304 filas.

Es relevante por su carácter de herramienta de investigación: no es un asistente, sino un punto de medida dentro de un estudio de leyes de escalado con foco en soberanía de IA del Reino Unido, incluyendo datos parlamentarios, del sector público británico y de lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) además de scots. La licencia Apache 2.0 y su reducido tamano lo hacen accesible para experimentación en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama con GQA 2:1 y exclusive self-attention (XSA) |
| Parametros totales | 231.800.832 (embeddings atados) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (entrenado y publicado en bf16) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `modeling_vectabass.py` en el repo, requiere `trust_remote_code=True`) |

Especificaciones adicionales de arquitectura: anchura 1152, 12 capas, 18 cabezas de consulta y 9 de clave-valor con dimensión 64, feed-forward SwiGLU de 3040, normalización RMSNorm pre-norm, posiciones RoPE con base 10000.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con atención causal que combina grouped-query attention (18 cabezas de query, 9 de clave-valor) con una variante de atención propia denominada XSA (exclusive self-attention), que no existe en la arquitectura Llama estándar. El feed-forward es SwiGLU con dimensión intermedia 3040, la normalización es RMSNorm en configuración pre-norm y las posiciones se codifican con RoPE de base 10000. La implementación requiere cargar código remoto (`modeling_vectabass.py`) y ejecutar en bf16 tal como se entrenó.

El entrenamiento consumió 2.182.676.480 tokens (13 por parámetro no-embedding) con un batch de 327.680 tokens. Se usó el optimizador Muon para las matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) combinado con AdamW en fp32 (betas 0.9 y 0.95), un pico de learning rate de 0.00206, warmup de 174M tokens y un schedule warmup-constante seguido de un cooldown 1-sqrt hasta cero en el último 20%. El weight decay fue de 0.0784 sobre matrices. La precisión fue bf16 en pesos y activaciones con pesos maestros en fp32 en el optimizador, y estadísticas de normalización, ángulos RoPE y logits en fp32. Todo el entrenamiento se ejecutó en una única NVIDIA GH200 de 120 GB.

Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96.000 millones de tokens únicos, con fuentes de los datasets fineweb-edu, fineweb-2 y finemath, e incluyendo fuentes del sector público y parlamentario del Reino Unido y de lenguas celtas. No se indica en la información disponible que se haya aplicado RLHF, DPO ni ningún ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva en modo base (completado de secuencias), sin ajuste por instrucciones.
- Razonamiento de sentido común y respuesta a preguntas de opción múltiple en inglés (evaluado en ARC, HellaSwag, PIQA, WinoGrande, BoolQ, MMLU).
- Modelado de lenguaje y predicción de siguiente token (LAMBADA, bits per byte).
- Capacidades multilingües limitadas a inglés y lenguas celtas y scots (galés, gaélico escocés, irlandés, manés, córnico, scots), con el inglés como idioma dominante.
- No soporta tool calling ni function calling de forma nativa (es un modelo base sin ajuste).
- No soporta agentes ni razonamiento multi-paso orquestado (sin ajuste instruct).
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Sirve como punto de medida para estudios de leyes de escalado y como base para fine-tuning posterior.

## Casos de uso

- Investigación sobre leyes de escalado: al ser una celda de un retículo de tamanos y presupuestos de tokens publicados conjuntamente, permite ajustar y validar curvas de pérdida frente a parámetros y tokens con datos reproducibles.
- Experimentación académica con hardware limitado: con 232M de parámetros totales y 0,5 GB de repo, se puede entrenar, evaluar y hacer fine-tuning en una única GPU de consumo, sirviendo de banco de pruebas para técnicas de atención como XSA.
- Fine-tuning para tareas de clasificación o generación en inglés: al ser un modelo base, se puede adaptar con datasets propios para tareas concretas (resumen, extracción, clasificación de texto) sin el coste de un modelo grande.
- Procesamiento de textos en lenguas celtas: útil para experimentos de modelado de galés, gaélico escocés, irlandés, manés, córnico o scots, con la cautela de que estas lenguas tienen una cuota menor en el corpus.
- Docencia y formación: su tamano reducido y su naturaleza de checkpoint de estudio lo hacen adecuado para explicar arquitecturas transformer, GQA, RoPE, SwiGLU y optimizadores como Muon en cursos prácticos.
- Generación de texto de dominio británico: el corpus incluye fuentes parlamentarias y del sector público del Reino Unido, por lo que puede emplearse en experimentos de completado sobre ese dominio (por ejemplo, texto administrativo o parlamentario) tras el correspondiente fine-tuning.
- Base para ablaciones de entrenamiento: permite reproducir el schedule de cooldown, la combinación Muon + AdamW y la configuración de precisión mixta en estudios comparativos.

## Benchmarks y rendimiento

Evaluación zero-shot con 500 ítems por tarea (shuffle con semilla 0), protocolo hub-v1, puntuando log P(continuación | contexto) con precisión normalizada donde aplica.

| Tarea | Puntuación |
|---|---|
| ARC-Easy | 0.458 |
| ARC-Challenge | 0.208 |
| HellaSwag | 0.308 |
| PIQA | 0.598 |
| WinoGrande | 0.496 |
| BoolQ | 0.602 |
| MMLU | 0.228 |
| LAMBADA | 0.274 |
| DQRB (propia) | 0.531 |
| LAMBADA bits per byte | 1.346 |

Pérdida de validación sobre el canon retenido phase-1-release canon-8192 (8192 × 2048 tokens): 2,4563 nats por token. Los pesos de este repo reproducen los logits del código de entrenamiento de forma bit a bit y puntúan 2,4564 bajo PyTorch SDPA (el entrenamiento usó FlashAttention-4). No se han publicado resultados de benchmarks comparativos con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en bf16 para los pesos (231,8M de parámetros), más activaciones y caché KV para contexto de 2048 tokens; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna; el modelo se entrenó en una NVIDIA GH200 de 120 GB, pero para inferencia basta una RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problema.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo con al menos 2 GB de VRAM, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `modeling_vectabass.py`), y previsiblemente vLLM, TGI o llama.cpp si se generan pesos GGUF, aunque la información proporcionada no confirma soporte nativo en esas herramientas.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| vectabass-232m-2.18bt-base-cooled | 231,8M (173,9M no-embedding) | 2048 | Apache 2.0 | en, cy, gd, ga, gv, kw, sco | Base, XSA, foco en leyes de escalado y datos británicos |
| Modelos de ~200-300M de la familia Pythia | ~160M-410M | 2048 | Apache 2.0 | en | Base, transformer estándar, corpus The Pile |
| Modelos de ~125-350M de la familia OPT | ~125M-350M | 2048 | OPT-175B no comercial; versiones menores con licencia específica | en | Base, transformer estándar |
| Modelos de ~135-360M de la familia SmolLM | ~135M-360M | 2048+ | Apache 2.0 | en (multilingüe en versiones mayores) | Base/instruct, transformer estándar |

Los datos de rendimiento comparativo con estas familias no están disponibles en la información proporcionada; la comparación se limita a tamano, contexto, licencia e idiomas.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de escalado, no un asistente: afirmará cosas falsas con fluidez y no está alineado con preferencias humanas.
- No ha recibido ajuste por instrucciones ni ajuste de seguridad, y no se filtran las salidas.
- La ventana de contexto es de solo 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Predominantemente inglés; las lenguas celtas y el scots tienen cuotas menores en el corpus, por lo que su calidad en esos idiomas será inferior.
- Riesgo de alucinación alto por su naturaleza de modelo base y su reducido tamano.
- Puede reproducir sesgos presentes en los corpus de fineweb-edu, fineweb-2 y finemath, y en las fuentes del sector público británico incluidas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado para producción como asistente sin un fine-tuning y una evaluación previos.
- Requiere `trust_remote_code=True` para cargar código propio del repo, lo que implica ejecutar código del autor; conviene auditar `modeling_vectabass.py` antes de desplegarlo.
- El rendimiento en tareas de razonamiento (ARC-Challenge 0.208, MMLU 0.228) es bajo en términos absolutos, coherente con su tamano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-232m-2.18bt-base-cooled
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Referencia Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
