# VectaBass/vectabass-151m-5bt-mdlm-converted

## Resumen

vectabass-151m-5bt-mdlm-converted es un modelo de lenguaje de tipo masked diffusion (MDLM) desarrollado por VectaBass, un proyecto centrado en IA soberana del Reino Unido y en estudios de leyes de escala. Se trata de la celda N1 del conjunto de conversión de la Fase 1: un modelo autorregresivo (AR) previamente entrenado, `vectabass-151m-5.01bt-base-cooled`, que se ha reconvertido a un diffusion language model mediante un entrenamiento adicional de 5.000 millones de tokens. El resultado es un modelo bidireccional que genera texto rellenando tokens enmascarados de forma iterativa, en lugar de predecir el siguiente token.

Con 151,5 millones de parámetros totales (99,98 millones no pertenecientes a embeddings), 9 capas, anchura 1024 y un contexto de 2048 tokens, el modelo está pensado como pieza de un estudio de leyes de escala, no como un asistente listo para producción. La relevancia actual reside en que ejemplifica la conversión AR→diffusion sobre arquitecturas tipo Llama con atención exclusiva (XSA), un enfoque poco habitual que permite comparar directamente el rendimiento de ambos paradigmas de generación bajo un mismo esqueleto de red.

La ficha del autor es explícita: es un modelo base, sin ajuste por instrucciones ni por seguridad, entrenado para investigación. Su licencia Apache 2.0 y su soporte de siete idiomas (inglés y seis lenguas celtas) lo sitúan en el ámbito de la soberanía lingüística británica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con atención exclusiva (XSA), convertido a masked diffusion (MDLM) |
| Parametros totales | 151.505.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el autor recomienda ejecutar en bf16, tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `trust_remote_code` para `modeling_vectabass.py`) |

## Arquitectura y entrenamiento

El modelo parte de un transformer autorregresivo tipo Llama de 9 capas, anchura 1024, 16 cabezas de consulta y 8 de clave-valor (GQA 2:1, dimensión 64), feed-forward SwiGLU de 2592, normalización RMSNorm pre-norm y RoPE con base 10000. La innovación clave es la atención exclusiva (XSA) del padre, que se convierte en bidireccional desde el primer paso del entrenamiento. Los objetivos de predicción son no desplazados: cada posición predice su propio token limpio, y la pérdida es el ELBO negativo en tiempo continuo (entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones), con un alpha_t lineal de 1 − t.

El entrenamiento de conversión consumió 5.000.134.656 tokens (50 veces el número de parámetros no de embedding), con calentamiento lineal durante 10 millones de tokens, tasa de aprendizaje máxima de 0,00243, decaimiento 1-sqrt a partir del 80 % del entrenamiento, sin weight decay y con optimizador Muon (matrices ocultas, NS 5, Moonlight RMS 0.2, momento 0.95) más AdamW fp32. La fila del token de máscara (id 50283) se inicializó a partir de la del padre más ruido gaussiano de 0,1 veces la desviación estándar de los embeddings. Los datos provienen de la vista de la fase 1 (fineweb-edu, fineweb-2 y finemath), replicando el orden de ventanas del padre, con lotes de 524.288 tokens y precisión bf16 en pesos y activaciones, fp32 en pesos maestros, estadísticas de normalización, ángulos RoPE y logits. Todo el entrenamiento se ejecutó en una única NVIDIA GH200 de 120 GB.

## Capacidades

- Generación de texto mediante difusión enmascarada: rellena tokens desconocidos de forma iterativa con `diffusion_generate`, usando orden por confianza y decodificación argmax.
- Extracción de características (`feature-extraction`): `model(ids).logits` devuelve, en cada posición, la distribución del token limpio.
- Modelado bidireccional del contexto: al ser la atención bidireccional, cada posición puede condicionar sobre tokens posteriores, a diferencia de un modelo AR.
- Multilingüismo limitado a inglés y seis lenguas celtas: galés (cy), gaélico escocés (gd), irlandés (ga), manés (gv), córnico (kw) y escocés (sco).
- Generación con control de repetición: el autor recomienda `presence_penalty=4.0` incluyendo el prompt para evitar bucles.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito; no está ajustado por instrucciones.

## Casos de uso

- Investigación sobre leyes de escala: el modelo es una celda (N1) de un conjunto de conversión con un modelo por tamaño (N1 a N6), pensado para comparar el rendimiento de MDLM frente a AR bajo un mismo esqueleto de red y presupuesto de cómputo.
- Estudio de paradigmas de generación: permite medir fluidez, diversidad y repetición de la decodificación por difusión frente a la autorregresiva con el mismo número de parámetros y datos.
- Experimentos de extracción de características: al ser bidireccional, sus representaciones contextuales pueden usarse para tareas de clasificación o clustering sobre texto en inglés y lenguas celtas.
- Investigación lingüística de lenguas celtas: con soporte declarado para cy, gd, ga, gv, kw y sco, sirve para estudiar el comportamiento de modelos pequeños en lenguas de bajos recursos, siempre con validación humana.
- Prototipado de decodificación por difusión: su API `diffusion_generate` con parámetros de orden, schedule, penalización y pasos permite experimentar con estrategias de muestreo sin entrenar desde cero.
- Reproducción de recetas de conversión AR→MDLM: la ficha documenta hiperparámetros completos (LR, decaimiento, optimizador, inicialización de la máscara), lo que facilita replicar el procedimiento en otros tamaños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente un estudio de muestreo sobre la conversión N6 del mismo conjunto (`vectabass-1.73b-80bt-mdlm-converted`), no sobre este tamaño, con 32 inicios de documento de 32 tokens de prompt y 256 tokens generados, puntuados por Qwen3-8B-Base:

| Muestreador | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7 % |
| Modelo AR del mismo tamaño (N6-D6), top-p 0,95 | 0,69 | 0,75 | 9 % |
| Confianza, argmax, penalización 4 incl. prompt | 0,59 | 0,81 | 10 % |
| Igual, sin penalización | 0,13 | 0,19 | 78 % |
| Orden aleatorio, muestreo ancestral exacto | 1,43 | 0,79 | 10 % |

El autor advierte que los errores estándar en bits por byte son de aproximadamente 0,05 a 0,06 con una sola semilla y 32 prompts.

## Requisitos de hardware

- VRAM estimada para inferencia: con 151,5 millones de parámetros en bf16, los pesos ocupan aproximadamente 0,3 GB; sumando activaciones y caché para contexto de 2048, cabe holgadamente en menos de 2 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es suficiente; el autor entrenó en una NVIDIA GH200 de 120 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 4 GB de VRAM, e incluso en CPU para pruebas.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `dtype=torch.bfloat16`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la generación por difusión requiere el método `diffusion_generate` del código remoto.
- Latencia y throughput: no disponibles. La generación requiere `steps = gen_length` pasadas hacia delante (256 pasos para 256 tokens), lo que implica un coste por token generado muy superior al de una decodificación AR.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Notas |
|---|---|---|---|---|---|
| vectabass-151m-5bt-mdlm-converted | 151,5 M | 2048 | Masked diffusion (MDLM) | Apache 2.0 | Base, sin ajuste por instrucciones; 7 idiomas |
| vectabass-151m-5.01bt-base-cooled | ~151 M | 2048 | Autorregresivo | Apache 2.0 (según modelo base) | Padre directo; misma arquitectura con atención causal |
| vectabass-1.73b-80bt-mdlm-converted | ~1,73 B | no disponible | Masked diffusion (MDLM) | Apache 2.0 (según modelo base) | Conversión N6 del mismo conjunto; única con estudio de muestreo publicado |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni por seguridad: no debe usarse como asistente conversacional sin un ajuste posterior.
- Alto riesgo de alucinación: el autor indica explícitamente que los hechos suelen ser incorrectos.
- Sin penalización de presencia, el orden por confianza entra en bucles; con penalización 4 se mitiga, pero las listas, tablas y código (donde la repetición es correcta) no se probaron y las listas siguen repitiéndose.
- La penalización es una heurística, no un muestreo exacto: sesga contra palabras repetidas.
- El muestreo ancestral exacto es mucho menos fluido que el modelo AR; temperatura, top-k, top-p y min-p no alcanzan texto real.
- Mantener un token por paso (`steps = gen_length`); cuatro tokens por paso degradan la calidad (0,93 bits por byte, bigramas distintos 0,59).
- Contexto limitado a 2048 tokens.
- Cobertura lingüística restringida a inglés y seis lenguas celtas; no se declaran otros idiomas.
- El estudio de muestreo se realizó sobre el tamaño N6, no sobre este N1, por lo que los valores de calidad no son directamente extrapolables.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo de investigación sin evaluación de sesgos ni de seguridad, cualquier despliegue en producción exige auditoría propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-151m-5bt-mdlm-converted
- Modelo base: https://huggingface.co/VectaBass/vectabass-151m-5.01bt-base-cooled
- Conversión N6 con estudio de muestreo: https://huggingface.co/VectaBass/vectabass-1.73b-80bt-mdlm-converted
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
