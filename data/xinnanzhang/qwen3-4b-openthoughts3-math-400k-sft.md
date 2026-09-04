# XinnanZhang/Qwen3-4B-openthoughts3-math-400k-sft

## Resumen

`XinnanZhang/Qwen3-4B-openthoughts3-math-400k-sft` es un checkpoint de ajuste fino supervisado (SFT) sobre el modelo base `Qwen/Qwen3-4B`, desarrollado para servir como inicialización de estudiante en experimentos de destilación on-policy. El autor lo publica explicita con fines de reproducibilidad, no como un modelo mejorado: el propio autor declara que rinde por debajo del modelo base. Se entrenó sobre el dataset `XinnanZhang/openthoughts3-math-50k8`, compuesto por 50.000 prompts y 8 muestras por prompt, lo que suma 400.000 ejemplos de matemáticas.

El modelo tiene 4.022.468.096 parámetros (4,02B) y está disponible en formato `safetensors` con licencia Apache-2.0. Su arquitectura hereda del modelo base `Qwen/Qwen3-4B` y está orientado a generación de texto y razonamiento matemático, con evaluaciones propias en los datasets AIME24/25/26 y AMC23. El interés práctico principal es académico: estudiar el efecto de datos de entrenamiento incompletos en la cadena de pensamiento y reproducir la metodología experimental del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-4B; no se detallan variantes en el checkpoint) |
| Parametros totales | 4.022.468.096 (4,02B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la documentacion. La evaluacion usa hasta 16.384 tokens de respuesta y el entrenamiento un cutoff de 20.000 tokens, lo que no define la ventana de contexto real |
| Tipos de cuantizacion | No se enumeran cuantizaciones oficiales. El checkpoint se distribuye en `safetensors` (bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) de una sola epoca sobre `Qwen/Qwen3-4B`, realizado con la libreria LLaMA-Factory. Los hiperparametros son los oficiales de `openthinker3`: learning rate `8e-5`, batch global de 512, 1 epoch, cutoff length de 20.000 tokens y empaquetado `neat_packing` (que requiere batch de 1 por dispositivo y se escala con acumulacion de gradientes). El entrenamiento uso kernels `liger`, FlashAttention-2 y precision bf16. El dataset de entrenamiento, `openthoughts3-math-50k8`, combina 50.000 prompts matematicos con 8 respuestas generadas por prompt, hasta un total de 400.000 ejemplos.

La innovacion tecnica de este checkpoint no reside en su arquitectura, sino en el proposito de reproducibilidad: el autor lo publica como punto de partida para experimentos de destilacion on-policy. Un dato critico del proceso de entrenamiento es que solo el 29,4% de los targets cierran correctamente `` y emiten una respuesta con `\boxed{}`. El 70,6% restante alcanza el limite de generacion de ~16.000 tokens a mitad de razonamiento, y despues el template de chat anade `<|im_end|>`; el modelo aprende asi a emitir EOS en medio del pensamiento, lo que degrada su rendimiento. Este comportamiento es heredado del dataset upstream.

## Capacidades

- Generacion de texto y razonamiento matematico: evaluado en los benchmarks de olimpiadas AIME24, AIME25, AIME26 y AMC23, con puntuaciones mean@8 y pass@8 en modo thinking.
- Modo de pensamiento (thinking mode): activado durante la evaluacion oficial del autor, con T=0.6, top_p=0.95 y top_k=20.
- Sin herramientas: no se documentan capacidades de tool calling ni function calling.
- Sin vision ni audio: el checkpoint no registra soporte multimodal.
- Idioma: unicamente ingles.
- Limitacion estructural: el entrenamiento con datos truncados puede provocar respuestas parciales o cortadas, especialmente en razonamientos largos.

## Casos de uso

- Reproduccion de experimentos de destilacion on-policy: este checkpoint esta disenado exactamente para ser usado como inicializacion de un modelo estudiante en pipelines de destilacion de conocimiento a partir de modelos grandes, siguiendo la metodologia de `openthinker3`.
- Evaluacion de robustez de la cadena de pensamiento: sirve para estudiar como un modelo se comporta cuando los datos de entrenamiento contienen razonamientos truncados por el limite de token, comparandolo con un SFT de dataset completo.
- Benchmark de hiperparametros de SFT: al estar entrenado con los hiperparametros oficiales de `openthinker3` y un dataset publico, es un punto de referencia para comparar recetas de ajuste fino en el dominio de matematicas.
- Investigacion sobre calidad de datos de razonamiento: util para analizar muestras de pensamientos que cierran o no cierran ``, y para desarrollar filtros de calidad en la construccion de datasets de matemáticas.
- Validacion de compatibilidad de configuraciones: el checkpoint incluye `rope_theta` tanto plano como anidado en `config.json`; se puede emplear para comprobar la carga correcta entre versiones de `transformers` (4.55 vs 5.2) y detectar fallos silenciosos en la inicializacion de la codificacion posicional.
- Punto de partida para entrenamiento con RL: el autor menciona su uso como inicializacion de estudiante en experimentos de destilacion on-policy; tambien puede servir como base para tecnicas de RL (GRPO, PPO) en problemas matematicos, aunque se recomienda verificar su comportamiento antes de cualquier uso en produccion.
- Docencia y ejemplos de casos de estudio: para investigadores que deseen ensenar los efectos del truncamiento de secuencias en modelos de razonamiento largo.

## Benchmarks y rendimiento

La informacion proporcionada incluye la evaluacion oficial del autor, realizada con n=8 muestras por prompt, 16.384 tokens maximos de respuesta, T=0.6 / top_p=0.95 / top_k=20 en modo thinking. Los valores son porcentajes:

| Dataset | mean@8 | pass@8 |
|---|---|---|
| aime24 | 42.08 | 68.37 |
| aime25 | 34.17 | 54.87 |
| aime26 | 37.08 | 56.09 |
| amc23 | 74.69 | 90.27 |
| **Promedio** | **47.00** | **67.40** |

No se han publicado resultados de benchmarks comparativos con el modelo base en la informacion disponible. El autor indica explicitamente que el checkpoint rinde por debajo de su propio modelo base y que se publica para reproducibilidad de los experimentos, no como un modelo mejorado.

## Requisitos de hardware

- VRAM estimada: no se proporciona en la documentacion. Con 4,02B parametros en bf16, los pesos ocupan aproximadamente 8,04 GB. Anadiendo activaciones y cache de claves/valores, se estima un minimo de 12-16 GB de VRAM para inferencia con contextos moderados.
- GPU recomendadas: no especificadas. Para ejecutar en bf16 se necesitan GPUs con soporte de precision bf16; una RTX 4090 (24 GB) o una A100/H100 de 40 GB o mas son adecuadas, especialmente si se pretenden generar secuencias largas.
- Consumer GPU: es viable con 16 GB o mas (RTX 4080/4090), aunque sin cuantizaciones listadas el uso en GPUs de 12 GB o inferiores seria ajustado, sobre todo para longitudes de respuesta altas.
- Opciones de despliegue: no indicadas en la informacion. Al ser un checkpoint de Transformers con pesos `safetensors`, puede cargarse con la libreria `transformers`; tambien es compatible en principio con vLLM o TGI. Para usar llama.cpp/Ollama requeriria conversion a GGUF, que no se proporciona en el repositorio.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros modelos de la misma categoria en la informacion proporcionada. La unica referencia de comparacion es el modelo base `Qwen/Qwen3-4B`: ambos comparten la misma arquitectura, licencia Apache-2.0 y disponibilidad en Hugging Face, pero el autor declara que el checkpoint rinde por debajo del base, sin aportar cifras de benchmarks del modelo base.

| Modelo | Parametros | Contexto | Licencia | Rendimiento (AIME24 mean@8) |
|---|---|---|---|---|
| Este checkpoint | 4,02B | No disponible en la documentacion | Apache-2.0 | 42.08 |
| Qwen/Qwen3-4B (base) | No disponible en la info | No disponible en la info | Apache-2.0 | No disponible en la info |

## Limitaciones y advertencias

- Rendimiento inferior al modelo base: el autor lo declara sin ambages. No esta disenado para ser usado como un modelo de produccion.
- Entrenamiento con datos truncados: el 70,6% de los targets de SFT alcanzaron el limite de generacion (~16k tokens) sin cerrar correctamente `` ni emitir `\boxed{}`. El modelo puede producir razonamientos cortados o finalizaciones prematuras.
- Riesgo de alucinacion: al ser un modelo de lenguaje de 4B con sesgo hacia el dominio matematico, presenta los riesgos habituales de inventar pasos o resultados, agravados por la mala calidad de los datos de entrenamiento.
- Idioma limitado: solo se declara ingles. Su uso en otros idiomas no ha sido evaluado y probablemente sea deficiente.
- Dependencia de la version de Transformers: si se recarga con versiones anteriores a `transformers` 5.2.0, el campo `rope_theta` anidado puede no reconocerse. El `config.json` incluye la clave plana para mitigarlo, pero cualquier re-guardado puede perderla.
- No es adecuado para tool calling, agentes, vision o audio: no hay ningun tipo de soporte documentado para estas capacidades.
- Uso comercial: la licencia Apache-2.0 lo permite, pero el rendimiento deficiente y el entrenamiento defectuoso hacen desaconsejable su uso en entornos empresariales sin un reentrenamiento completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XinnanZhang/Qwen3-4B-openthoughts3-math-400k-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/XinnanZhang/openthoughts3-math-50k8
