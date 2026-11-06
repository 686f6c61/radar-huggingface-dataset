# VectaBass/vectabass-232m-60.8bt-mdlm-cooled

## Resumen

vectabass-232m-60.8bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, *masked diffusion language model*) de 231,8 millones de parámetros totales (173,9 millones no de embedding), desarrollado por el usuario VectaBass. Forma parte de una "cuadrícula MDLM" de fase 1: una escalera de modelos de 100M a 1,6B de parámetros no de embedding, cada tamaño entrenado con varios presupuestos de tokens y publicados conjuntamente para poder verificar empíricamente las leyes de escala. Esta celda concreta, etiquetada como N2-D4, corresponde al tamaño de 232M entrenado con 60.800 millones de tokens.

El modelo se entrena desde cero sobre datos abiertos (fineweb-edu, fineweb-2 y finemath, con fuentes del sector público británico, parlamentarias y de lenguas celtas), y su objetivo no es la generación de texto de producción sino servir como punto de medida dentro de un estudio de escalado. La arquitectura reutiliza la pila tipo Llama de los modelos autorregresivos del mismo autor (con *exclusive self-attention*, XSA) pero la convierte en bidireccional, con atención GQA 2:1, RoPE base 10000 y contexto de 2048 tokens.

Su relevancia es metodológica: permite comparar, con los mismos datos y la misma escalera de tamaños, un modelo autorregresivo frente a uno de difusión, y ofrece pesos que reproducen bit a bit los logits del código de entrenamiento. No está ajustado a instrucciones ni a seguridad, y el propio autor advierte que los hechos que genera suelen ser incorrectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con XSA (exclusive self-attention), GQA 2:1, pre-norm RMSNorm, SwiGLU; objetivo de difusión enmascarada (MDLM) |
| Parametros totales | 231.829.632 (embeddings atados) |
| Parametros activos | no aplica (no es MoE) |
| Parametros no de embedding | 173.850.624 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el autor recomienda ejecutar en bf16, tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |
| Anchura / capas | 1152 / 12 |
| Cabezas | 18 query, 9 key-value, dimensión 64 |
| Feed-forward | SwiGLU, 3040 |
| Token de máscara | id 50283 |
| Vocabulario | 50.304 filas: BPE de GPT-2 (50.257) más 26 tokens especiales y relleno |
| Tamaño del repo | 0,5 GB |

## Arquitectura y entrenamiento

La red es la misma pila que los modelos autorregresivos del autor, con atención exclusiva (XSA), pero convertida en bidireccional: en cada posición el modelo predice la distribución del token limpio, y se coloca el token de máscara (id 50283) donde el token es desconocido. La generación (`diffusion_generate`) añade `gen_length` máscaras al prompt y las rellena a lo largo de `steps` pasadas hacia delante. El objetivo de entrenamiento es MDLM con un alpha_t lineal (1 - t) y pérdida de ELBO negativo en tiempo continuo, es decir, entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones.

El entrenamiento cubre 60.800.466.944 tokens (350 por parámetro no de embedding), con lotes de 622.592 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0,2, momento 0,95) más AdamW en fp32, LR máximo de 0,00146, calentamiento de 174M tokens, fase constante y un *cooldown* 1-sqrt hasta cero en el último 20 %, y weight decay de 0,0955 sobre matrices. Se ejecutó en una única NVIDIA GH200 de 120 GB, con pesos y activaciones en bf16 y pesos maestros en fp32. Los datos provienen de la vista de fase 1: 47 contenedores de texto con licencia abierta, unos 96.000 millones de tokens únicos, con fuentes del sector público británico, parlamentarias y de lenguas celtas; el desglose por contenedor, proporción y licencia está en `DATA.md`.

## Capacidades

- Modelado y relleno de texto enmascarado: predice el token limpio en posiciones enmascaradas, lo que permite completar huecos en un documento.
- Generación de texto mediante difusión: `diffusion_generate` con orden aleatorio (el proceso inverso para el que fue entrenado) u orden por confianza estilo MaskGIT.
- Extracción de características: el pipeline declarado en Hugging Face es `feature-extraction`, por lo que expone representaciones bidireccionales del texto.
- Multilingüismo limitado a siete lenguas: inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés.
- No dispone de soporte de *tool calling* ni de *function calling*.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo de pensamiento (*thinking*), visión ni audio.
- No está ajustado a instrucciones ni a seguridad: es un modelo base de estudio.

## Casos de uso

- Estudio de leyes de escala: usar esta celda junto con el resto de la escalera (100M a 1,6B) para ajustar curvas de pérdida frente a tokens y compararlas con la cuadrícula autorregresiva publicada en paralelo. Es el uso para el que fue diseñado.
- Investigación en modelos de difusión para lenguaje: servir de punto de partida reproducible para experimentar con objetivos MDLM, ya que los pesos reproducen bit a bit los logits del código de entrenamiento sobre filas enmascaradas del canon.
- Relleno de texto (*infilling*) en documentos: dado un contexto con huecos, el modelo predice los tokens enmascarados; útil en tareas de restauración o completado de textos con contexto de hasta 2048 tokens.
- Extracción de características para clasificación: al ser un transformer bidireccional, sus representaciones internas pueden alimentar clasificadores de texto en las siete lenguas soportadas, incluido texto en galés o gaélico escocés.
- Evaluación comparativa de muestreadores: el autor publica una comparación de unos 30 muestreadores con métricas de bits por byte UTF-8, bigramas distintos y 4-gramas repetidos, reutilizable como banco de pruebas para nuevas estrategias de decodificación en difusión.
- Experimentación con lenguas celtas de bajos recursos: el corpus incluye fuentes en cy, gd, ga, gv, kw y sco, lo que permite estudiar el comportamiento de un modelo de difusión en lenguas con pocos datos.
- Docencia y reproducción de resultados: al caber en una sola GPU de consumo y pesar 0,5 GB, es viable reproducir el entrenamiento y la evaluación en entornos académicos modestos.

## Benchmarks y rendimiento

El autor no publica benchmarks zero-shot para los modelos MDLM ("Zero-shot benchmarks are not measured for the MDLM models"). La única métrica de evaluación es el ELBO negativo sobre el canon retenido de fase 1 (canon-8192, 8192 × 2048 tokens, 16 extracciones de máscara por secuencia):

| Metrica | Valor |
|---|---|
| ELBO negativo (entrenamiento, FlashAttention-4) | 2,5828 ± 0,0025 nats por token |
| ELBO negativo (estimacion independiente de una extraccion, PyTorch SDPA) | 2,5809 ± 0,0101 nats por token |

El autor advierte que el ELBO negativo es una cota superior de la log-verosimilitud negativa y que puede compararse con la entropía cruzada de un modelo autorregresivo sobre el mismo canon como cota, no como medida equivalente.

Resultados de muestreo del autor para la celda N6-D5 (32 inicios de documento retenidos, prompt de 32 tokens, 256 tokens generados, una semilla, puntuados por Qwen3-8B-Base):

| Muestreador | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7 % |
| confidence, argmax, penalización de presencia 4 incl. prompt | 0,64 | 0,74 | 18 % |
| Igual, sin penalización | 0,15 | 0,16 | 80 % |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22 % |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 0,5 GB de pesos más activaciones y caché KV; cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: el entrenamiento se hizo en una NVIDIA GH200 de 120 GB, pero para inferencia basta una GPU de consumo; una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (carga `modeling_vectabass.py` del repositorio); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y el formato publicado es safetensors, no GGUF.
- Latencia y throughput: no disponibles. El autor indica que se mantenga un token por paso (`steps = gen_length`), lo que implica 256 pasadas hacia delante para generar 256 tokens; usar 4 tokens por paso degrada la calidad (0,73 bits por byte, bigramas distintos 0,49).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Notas |
|---|---|---|---|---|---|
| vectabass-232m-60.8bt-mdlm-cooled | 231,8M totales (173,9M no emb.) | 2048 | Difusión enmascarada (MDLM) | Apache 2.0 | Celda N2-D4 de una escalera de 100M a 1,6B; sin benchmarks zero-shot |
| Cuadrícula autorregresiva de VectaBass (mismo autor) | Escalera equivalente de 100M a 1,6B | no disponible | Autorregresivo | no disponible | Entrenada con los mismos datos y la misma escalera; el autor afirma que el muestreo ancestral exacto del MDLM es mucho menos fluido que su AR del mismo tamaño |
| Modelos MDLM de referencia (p. ej. familias tipo diffusion-LM) | no disponible | no disponible | Difusión enmascarada | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No está ajustado a instrucciones ni a seguridad; es un modelo base de estudio y no debe usarse como asistente en producción.
- Los hechos que genera suelen ser incorrectos, según el propio autor.
- El muestreo por confianza con argmax y penalización de presencia 4 es una heurística, no un muestreo exacto: sesga contra palabras repetidas y las listas siguen repitiéndose; no se probaron listas, tablas ni código, donde la repetición es correcta.
- Sin penalización, el orden por confianza entra en bucle; con penalización 3 todavía repite y con 6 pierde fluidez respecto al texto real.
- El muestreo ancestral exacto es mucho menos fluido que el modelo autorregresivo del mismo tamaño; temperatura, top-k, top-p y min-p intercambian fluidez por diversidad sin alcanzar texto real.
- Los resultados de muestreo se basan en una sola semilla y 32 prompts, con errores estándar de unos 0,06 bits por byte.
- Contexto limitado a 2048 tokens e idiomas restringidos a siete lenguas; el rendimiento fuera de ellas no está caracterizado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido evaluado para tales fines y carece de benchmarks zero-shot que respalden su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-232m-60.8bt-mdlm-cooled
- Documentación de datos del autor: `DATA.md` en el repositorio del modelo (no se dispone de URL directa en la información proporcionada)
- Código de modelado: `modeling_vectabass.py` en el repositorio del modelo (no se dispone de URL directa en la información proporcionada)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
