# VectaBass/vectabass-59m-2.18bt-mdlm-cooled

## Resumen

vectabass-59m-2.18bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (masked diffusion language model, MDLM) de 59,5 millones de parámetros totales (27,3 millones no pertenecientes a embeddings), entrenado desde cero sobre 2.180 millones de tokens. Lo desarrolla el autor independiente VectaBass dentro de un estudio de leyes de escala orientado a IA soberana del Reino Unido, y constituye la celda N0-D2 del apéndice MDLM de dicho estudio: un escalón adicional por debajo de la escalera principal de 100M a 1.6B parámetros, con la misma receta y los mismos datos, para verificar la ley de escala a un tamaño menor.

El modelo no es un transformer autorregresivo al uso, sino una pila tipo Llama (GQA, SwiGLU, RMSNorm, RoPE) convertida en bidireccional y entrenada con el objetivo MDLM: ruido de máscara continuo con alpha_t = 1 - t y pérdida de ELBO negativo en tiempo continuo. La generación se realiza rellenando máscaras de forma iterativa mediante el método `diffusion_generate`, no mediante decodificación token a token de izquierda a derecha. El contexto es de 2048 tokens y el vocabulario es GPT-2 BPE ampliado a 50.304 filas.

Es relevante ahora porque publica pesos, receta y evaluación de un punto de escala poco habitual (por debajo de 100M no embeddings) con foco en lenguas celtas y fuentes del sector público británico, y porque documenta con detalle el comportamiento de muestreo de un MDLM pequeño, incluyendo una comparación de unos 30 samplers. Es un modelo base de investigación, sin ajuste de instrucciones ni de seguridad, y no está pensado para uso en producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con atención exclusiva (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE base 10000; objetivo MDLM (difusión enmascarada) |
| Parametros totales | 59.473.920 (embeddings atados); 59.482.240 según safetensors |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (la model card solo indica ejecución en bf16, tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco (inglés, galés, gaélico escocés, irlandés, manés, córnico, escocés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, con `custom_code` y `trust_remote_code`) |

Detalles adicionales de arquitectura: anchura 640, 6 capas, 10 cabezas de consulta y 5 de clave-valor con dimensión 64, feed-forward SwiGLU de 1728, token de máscara con id 50283 y vocabulario de 50.304 filas (GPT-2 BPE de 50.257 más 26 tokens especiales y relleno).

## Arquitectura y entrenamiento

La red reutiliza la pila de los modelos autorregresivos del mismo autor (tipo Llama) pero con atención bidireccional y atención exclusiva (XSA), de modo que cada posición puede atender a todo el contexto. El objetivo es MDLM: se corrompe la secuencia sustituyendo tokens por el token de máscara según un proceso lineal alpha_t = 1 - t, y la pérdida es el ELBO negativo en tiempo continuo, equivalente a una entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones. `model(ids).logits` devuelve, en cada posición, la distribución del token limpio; `diffusion_generate` añade `gen_length` máscaras al prompt y las rellena a lo largo de `steps` pasadas hacia delante.

El entrenamiento consumió 2.182.742.016 tokens (80 por parámetro no embedding), con lotes de 393.216 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momento 0.95) más AdamW en fp32 (0.9, 0.95), LR pico de 0.00255, warmup de 39M tokens (fijado a 100 pasos como suelo para este tamaño), fase constante y cooldown 1-sqrt hasta cero en el último 20 %, y weight decay de 0.136 en matrices. Precisión bf16 en pesos y activaciones con pesos maestros fp32 en el optimizador, estadísticas de norma, ángulos RoPE y logits en fp32. Todo se ejecutó en una única NVIDIA GH200 de 120 GB.

Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96B tokens únicos, incluyendo fineweb-edu, fineweb-2 y finemath, además de fuentes del sector público y parlamentarias del Reino Unido y de lenguas celtas; el desglose por bin, cuota y licencia está en `DATA.md`. No hay ajuste por instrucciones ni RLHF/DPO.

## Capacidades

- Modelado y relleno de texto mediante difusión enmascarada: dado un contexto con huecos marcados con el token 50283, predice los tokens limpios en cada posición.
- Generación iterativa con `diffusion_generate`, con orden aleatorio (el proceso inverso para el que fue entrenado) u orden por confianza estilo MaskGIT.
- Extracción de características (`feature-extraction`), ya que expone logits y representaciones por posición.
- Soporte multilingüe limitado a inglés y seis lenguas celtas o del Reino Unido (cy, gd, ga, gv, kw, sco), con presencia de fuentes públicas y parlamentarias en el corpus.
- No dispone de tool calling, function calling, modo agente, razonamiento multi-paso, visión ni audio.
- No tiene modo de pensamiento ni capacidad de instrucciones: es un modelo base de estudio de escala.

## Casos de uso

- Investigación sobre leyes de escala en difusión: el modelo sirve como punto de calibración por debajo de 100M parámetros no embedding para comparar la curva de ELBO negativo frente a modelos autorregresivos del mismo tamaño entrenados con la misma receta.
- Estudio comparativo MDLM frente a AR: al existir un apéndice autorregresivo equivalente publicado por separado, permite medir diferencias de fluidez, diversidad y coste computacional en un régimen de tamaño controlado.
- Relleno de texto (text infilling) en documentos: sustituyendo posiciones por el token de máscara y ejecutando `diffusion_generate` con orden por confianza, se pueden completar huecos en pasajes con contexto de hasta 2048 tokens.
- Experimentos de muestreo: la model card documenta unos 30 samplers y sus métricas (bits por byte, bigramas distintos, 4-gramas repetidos), lo que convierte al modelo en banco de pruebas para estudiar penalizaciones de presencia y órdenes de desenmascarado.
- Procesamiento de lenguas celtas de bajos recursos: con corpus de galés, gaélico escocés, irlandés, manés, córnico y escocés, puede emplearse para estudiar cobertura lingüística y calidad de modelado en estas lenguas dentro de un contexto de IA soberana.
- Docencia y divulgación: su tamaño reducido permite ejecutar el pipeline completo de difusión enmascarada en una sola GPU y explicar el funcionamiento interno de un MDLM con pesos reales.
- Extracción de representaciones para clasificación o agrupamiento de texto en inglés y lenguas celtas, usando la salida por posición como embedding contextual.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| ELBO negativo (canon-8192, 16 máscaras por secuencia) | 3,3784 ± 0,0026 nats por token | Cota superior de la log-verosimilitud negativa; comparable como cota, no como medida equivalente, con la entropía cruzada de un AR |
| Bits por byte (sampler por confianza, argmax, penalización de presencia 4, celda N6-D5) | 0,64 | Continuación real de referencia: 0,66 |
| Bigramas distintos (mismo sampler) | 0,74 | Continuación real: 0,80 |
| 4-gramas repetidos (mismo sampler) | 18 % | Continuación real: 7 % |
| Bits por byte sin penalización | 0,15 | Bigramas distintos 0,16 y 80 % de 4-gramas repetidos: el modelo entra en bucle |
| Bits por byte con orden aleatorio y muestreo ancestral exacto | 1,39 | Bigramas distintos 0,66; 4-gramas repetidos 22 % |
| Bits por byte con 4 tokens por paso | 0,73 | Bigramas distintos 0,49: pierde calidad frente a un token por paso |

Las cifras de muestreo corresponden a 32 inicios de documento reservados, con prompt de 32 tokens, 256 tokens generados y una semilla; el error estándar en bits por byte es de aproximadamente 0,06. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 59,5M parámetros, en bf16 ocupa aproximadamente 0,12 GB de pesos; con activaciones y caché para 2048 tokens el consumo se mantiene muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con soporte bf16, desde una RTX 4090 o incluso tarjetas de gama media; el entrenamiento se realizó en una NVIDIA GH200 de 120 GB, pero la inferencia no requiere ese hardware.
- Cabe holgadamente en GPU de consumo; no se han publicado cifras de latencia ni throughput.
- Opciones de despliegue: transformers con `trust_remote_code=True` (carga `modeling_vectabass.py` del repositorio) y ejecución en bf16; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el método `diffusion_generate` es específico del código personalizado del repositorio.
- El repositorio ocupa 0,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-59m-2.18bt-mdlm-cooled | 59,5M (27,3M no embedding) | 2048 | Difusión enmascarada (MDLM) | Apache 2.0 | Hugging Face, código personalizado |
| Apéndice autorregresivo de VectaBass (mismo tamaño) | No disponible en la información | No disponible | Autorregresivo | No disponible | Publicado por separado según la model card |
| Escalera MDLM principal (100M a 1.6B) | 100M a 1.6B | No disponible | Difusión enmascarada (MDLM) | No disponible | Referenciada en la model card, sin enlace |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la comparación directa solo puede hacerse por ELBO negativo frente a entropía cruzada autorregresiva, y el autor advierte que es una cota, no una medida equivalente.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones ni de seguridad: no sigue instrucciones y puede generar contenido inapropiado.
- Alucinación: la model card indica explícitamente que los hechos son a menudo incorrectos.
- El muestreo por confianza sin penalización de presencia entra en bucle; se recomienda penalización 4 (la 3 aún repite y la 6 es menos fluida que texto real). Es una heurística, no un muestreo exacto, y sesga contra palabras repetidas, por lo que listas, tablas y código no están validados y las listas siguen repitiéndose.
- Debe usarse un token por paso (`steps = gen_length`); con 4 tokens por paso la calidad cae (0,73 bits por byte, bigramas distintos 0,49).
- El muestreo ancestral exacto es mucho menos fluido que el modelo autorregresivo del mismo tamaño; temperatura, top-k, top-p y min-p no alcanzan la fluidez de texto real.
- Ventana de contexto limitada a 2048 tokens e idiomas restringidos a inglés y lenguas celtas; no hay garantía de calidad fuera de ese conjunto.
- Las métricas de muestreo proceden de 32 prompts y una semilla, con error estándar de unos 0,06 bits por byte: son indicativas, no concluyentes.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo de estudio sin evaluación de seguridad ni benchmarks estándar, no es adecuado para producción sin validación adicional.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene revisar `modeling_vectabass.py` antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-59m-2.18bt-mdlm-cooled
- Repositorio de datos y desglose de bins: `DATA.md` en el repositorio del modelo (no se dispone de URL directa en la información proporcionada)
- Paper del apéndice MDLM y apéndice autorregresivo: no disponible en la información proporcionada
- Repositorio de código de entrenamiento: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
