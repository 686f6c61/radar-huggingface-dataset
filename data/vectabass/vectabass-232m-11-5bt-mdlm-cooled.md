# VectaBass/vectabass-232m-11.5bt-mdlm-cooled

## Resumen

vectabass-232m-11.5bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, masked diffusion language model) de 232M parámetros totales (173,9M no correspondientes a embeddings) desarrollado por VectaBass. Forma parte de la "celda N2-D2" de un estudio de leyes de escalado (scaling laws) que abarca una escalera de modelos de 100M a 1,6B de parámetros no-embedding, cada uno entrenado con varios presupuestos de tokens y publicados conjuntamente para poder verificar empíricamente la ley de escalado. Existe un cuadrado autoregresivo (AR) paralelo, entrenado con los mismos datos y la misma escalera, publicado por separado.

El modelo se entrena desde cero con 11,52B tokens (66 tokens por parámetro no-embedding) sobre una mezcla de datos con licencia abierta que incluye fuentes del sector público británico, parlamentarias y de lenguas celtas, además de fineweb-edu, fineweb-2 y finemath. La arquitectura es la misma pila tipo Llama de los modelos AR (con atención exclusiva auto-atencionada, XSA), pero convertida en bidireccional para el proceso de difusión. El contexto es de 2048 tokens y el vocabulario usa BPE de GPT-2 con 50.304 filas.

Es relevante ahora porque los modelos de difusión para texto son una alternativa emergente a la generación autoregresiva, y este lanzamiento aporta un punto de datos reproducible dentro de una familia controlada que permite comparar directamente MDLM frente a AR con idénticos datos y presupuesto. No es un modelo de instrucciones ni ajustado en seguridad: es una base para investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con atención exclusiva auto-atencionada (XSA), GQA 2:1, para difusión enmascarada (MDLM) |
| Parametros totales | 231.800.832 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Parametros no-embedding | 173.850.624 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el autor recomienda ejecutar en bf16, tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `trust_remote_code`, requiere `modeling_vectabass.py`) |
| Ancho / capas | 1152 / 12 |
| Cabezas | 18 query, 9 key-value, dim 64 |
| Feed-forward | SwiGLU, 3040 |
| Normalización | RMSNorm, pre-norm |
| Posiciones | RoPE, base 10000 |
| Token de máscara | id 50283 |
| Vocabulario | 50.304 filas (GPT-2 BPE 50.257 + 26 especiales + padding) |
| Tamaño del repo | 0,5 GB |

## Arquitectura y entrenamiento

La red reutiliza la pila de los modelos AR de la misma familia (tipo Llama) pero con atención bidireccional, de modo que cada posición puede atender a todo el contexto. Emplea GQA con proporción 2:1 (18 cabezas de consulta, 9 de clave-valor, dimensión 64), SwiGLU con dimensión 3040, RMSNorm pre-norm y RoPE con base 10000 sobre 2048 posiciones. El objetivo es MDLM: un alpha_t lineal (1 - t) y una pérdida de ELBO negativo en tiempo continuo, implementada como entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones. En inferencia, `model(ids).logits` devuelve en cada posición la distribución del token limpio, colocando el token de máscara (id 50283) donde el token es desconocido; `diffusion_generate` añade `gen_length` máscaras al prompt y las rellena a lo largo de `steps` pasadas hacia delante.

El entrenamiento usó 11.519.819.776 tokens con un lote de 622.592 tokens. El optimizador combina Muon (matrices ocultas, NS 5, Moonlight RMS 0,2, momento 0,95) con AdamW en fp32 (0,9, 0,95); pico de LR 0,00146, calentamiento de 174M tokens, programación constante seguida de un enfriamiento 1-sqrt hasta 0 en el último 20%, y weight decay de 0,0955 sobre matrices. Precisión bf16 en pesos y activaciones con pesos maestros fp32 en el optimizador, estadísticas de normalización, ángulos RoPE y logits en fp32. Todo el entrenamiento se ejecutó en una única NVIDIA GH200 de 120 GB. Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96B tokens únicos, incluyendo fuentes del sector público británico, parlamentarias y de lenguas celtas (el detalle por bin, cuota y licencia está en `DATA.md`).

## Capacidades

- Modelo base de difusión enmascarada para generación de texto mediante relleno iterativo de máscaras, no para generación autoregresiva token a token.
- Extracción de características y logits por posición (pipeline declarado: `feature-extraction`).
- Generación de continuaciones de documentos con dos modos de muestreo: orden aleatorio (el proceso inverso para el que fue entrenado) y orden por confianza estilo MaskGIT.
- Control del muestreo mediante `presence_penalty`, `t_start`, `schedule`, `ban_eot`, `gen_length`, `steps` y `seed`.
- Cobertura multilingüe limitada a inglés y lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) y escocés.
- No dispone de tool calling, function calling, modo de razonamiento explícito, visión, audio ni capacidades de agente; no está ajustado a instrucciones.
- No se han medido benchmarks zero-shot para los modelos MDLM de esta familia.

## Casos de uso

- Estudio de leyes de escalado: el modelo es una celda de una escalera controlada de 100M a 1,6B de parámetros no-embedding; se usa para ajustar y validar curvas de pérdida frente a presupuesto de cómputo y tokens, comparando directamente con la celda AR equivalente.
- Investigación en modelos de difusión para texto: permite reproducir el proceso inverso (orden aleatorio o por confianza) y experimentar con planificadores (`linear`, `t_start`) y penalizaciones de presencia sobre un checkpoint pequeño y rápido.
- Evaluación de muestreadores: el autor documenta una comparación de unos 30 samplers sobre 32 inicios de documento retenidos; el modelo sirve como banco de pruebas para métricas como bits por byte UTF-8, bigramas distintos y 4-gramas repetidos.
- Relleno de texto (infilling) y edición: al ser bidireccional y trabajar con máscaras, encaja en tareas de completar huecos en documentos donde el contexto a izquierda y derecha es relevante.
- Experimentación con lenguas celtas de bajos recursos: el corpus incluye fuentes en galés, gaélico escocés, irlandés, manés, córnico y escocés, lo que permite estudiar el comportamiento del modelo en estas lenguas dentro de un entorno controlado.
- Docencia y prototipado de bajo coste: con 0,5 GB de repo y 232M de parámetros, se puede ejecutar en una sola GPU consumer para demostrar el funcionamiento de la difusión enmascarada sin infraestructura grande.
- Verificación de reproducibilidad: los pesos reproducen bit a bit los logits del código de entrenamiento en filas enmascaradas del canon, lo que permite usarlo como referencia para validar implementaciones propias.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| ELBO negativo en canon retenido (canon-8192, 8192 x 2048 tokens, 16 máscaras por secuencia) | 2,7727 ± 0,0025 nats por token |
| ELBO negativo, estimación independiente a una máscara bajo PyTorch SDPA | 2,7710 ± 0,0102 nats por token |
| Benchmarks zero-shot (MMLU, HumanEval, GSM8K, etc.) | no medidos para los modelos MDLM |

Los datos de muestreo de la model card corresponden a la celda N6-D5, no a esta celda, y se ofrecen solo como referencia del comportamiento del muestreador:

| Muestreador | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7% |
| Confianza, argmax, penalización 4 incl. prompt | 0,64 | 0,74 | 18% |
| Igual, sin penalización | 0,15 | 0,16 | 80% |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22% |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 0,5 GB para los pesos (232M parámetros), más activaciones y caché; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU con soporte bf16 (RTX 30xx/40xx, A100, H100, GH200). El entrenamiento se hizo en una GH200 de 120 GB, pero la inferencia no requiere nada parecido.
- Cabe en GPU consumer: sí, en tarjetas de gama media y baja con al menos 4 GB de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `dtype=torch.bfloat16`; el pipeline declarado es `feature-extraction`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el carácter bidireccional y el código personalizado hacen improbable un soporte directo sin adaptación.
- Latencia y throughput: no disponibles. El coste de generación es proporcional a `steps` (recomendado `steps = gen_length`, un token por paso), por lo que generar 256 tokens implica 256 pasadas hacia delante.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Objetivo | Licencia | Notas |
|---|---|---|---|---|---|
| vectabass-232m-11.5bt-mdlm-cooled | 231,8M | 2048 | MDLM (difusión enmascarada) | apache-2.0 | Celda N2-D2 de la escalera MDLM |
| Celda AR equivalente de VectaBass (misma escalera) | no disponible en la información | no disponible | Autoregresivo | no disponible | Entrenada con los mismos datos y escalera; publicada por separado |
| Celda N6-D5 de VectaBass | no disponible en la información | no disponible | MDLM | no disponible | Origen de los datos de muestreo citados |

No se dispone de datos de benchmarks comparativos entre estas celdas en la información proporcionada; la comparación cuantitativa entre MDLM y AR debe hacerse mediante el ELBO negativo frente a la entropía cruzada del modelo AR sobre el mismo canon, entendiendo que el ELBO es una cota superior y no una medida equivalente.

## Limitaciones y advertencias

- Modelo base sin ajuste a instrucciones ni ajuste de seguridad: no debe usarse como asistente conversacional directo.
- Los hechos generados son a menudo incorrectos; el autor lo advierte explícitamente.
- El muestreo por confianza sin penalización de presencia entra en bucles; se recomienda `presence_penalty=4.0` contando el prompt, valor heurístico y no un muestreo exacto.
- La penalización sesga contra palabras repetidas: listas, tablas y código, donde la repetición es correcta, no se probaron y las listas siguen repitiéndose.
- Mantener un token por paso (`steps = gen_length`); con 4 tokens por paso la calidad cae (0,73 bits por byte, bigramas distintos 0,49).
- El muestreo ancestral exacto es mucho menos fluido que el modelo AR del mismo tamaño; temperatura, top-k, top-p y min-p no alcanzan la fluidez de texto real.
- Los resultados de muestreo provienen de una sola semilla y 32 prompts, con errores estándar de unos 0,06 bits por byte.
- Contexto limitado a 2048 tokens.
- Cobertura lingüística restringida a inglés y lenguas celtas/escocés; el resto de idiomas no está garantizado.
- Licencia apache-2.0 permite uso comercial, pero al ser un modelo de investigación sin evaluación de sesgos ni de seguridad, su uso en producción exige validación propia.
- Requiere `trust_remote_code` para cargar código personalizado del repositorio, lo que implica revisar `modeling_vectabass.py` antes de ejecutarlo en entornos sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-232m-11.5bt-mdlm-cooled
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Documentación de datos del autor (`DATA.md`): referenciada en la model card dentro del repositorio de HuggingFace; URL directa no disponible.
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
