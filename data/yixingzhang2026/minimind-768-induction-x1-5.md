# YixingZhang2026/minimind-768-induction-x1.5

## Resumen

MiniMind-768 induction x1.5 es un modelo de lenguaje experimental derivado de MiniMind, un transformer decoder-only de aproximadamente 64 millones de parametros (63.912.192 segun los pesos en safetensors), con tamaño oculto de 768 y 8 capas. Lo publica YixingZhang2026 como artefacto de un experimento de interpretabilidad mecanicista: en lugar de entrenar un modelo nuevo, el autor edita directamente los pesos de dos cabezas de atencion de la capa 4 (L4H0 y L4H1), identificadas como induction heads, multiplicando por 1,5 las 96 columnas correspondientes de `o_proj`. El resto de los pesos es identico al modelo base.

El objetivo declarado es comprobar si una edicion de pesos guiada por el entendimiento del mecanismo interno (circuito de induccion de dos capas: cabezas previous-token en la capa 3 que alimentan cabezas de induccion en la capa 4) puede mejorar metricas de benchmark. La respuesta del propio autor es negativa: todas las diferencias caen dentro de los margenes de error. El modelo esta convertido al formato Qwen3 (`Qwen3ForCausalLM`) y conserva equivalencia de logits con la implementacion original de MiniMind.

Es relevante no como modelo de uso practico, sino como caso documentado de weight editing con evidencia causal (ablaciones, analisis de composicion K, barrido de intensidades) y como ejemplo de reproducibilidad en interpretabilidad. Solo esta preentrenado, sin SFT, y no esta pensado para conversacion ni despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3ForCausalLM), 8 capas, hidden size 768, 64 cabezas de atencion en total |
| Parametros totales | 63.912.192 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32/bf16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 (heredada de MiniMind) |
| Formato de pesos | safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo base MiniMind es un transformer decoder-only denso de 8 capas y dimension oculta 768, con unos 64M de parametros. El checkpoint publicado deriva de `pretrain_768.pth`, es decir, exclusivamente de preentrenamiento sobre texto (sin SFT ni RLHF/DPO). Los datos de entrenamiento concretos (numero de tokens, composicion del corpus) no se detallan en la informacion disponible; el autor menciona `pretrain_t2t_mini.jsonl` como fichero de preentrenamiento, cuyas ultimas 500 lineas (texto en ingles) se usan como conjunto de evaluacion de loss en los experimentos.

La unica modificacion respecto al base es el escalado ×1,5 de las columnas de `o_proj` de la capa 4 asociadas a las cabezas 0 y 1. La evidencia presentada para justificar que son induction heads incluye: puntuaciones de induccion de 0,81 y 0,63 (frente a un maximo de 0,23 en el resto de las 64 cabezas); composicion K con mediana de 1,01× sobre 1792 pares de cabezas y cuatro pares dominantes L3H5→L4H0 (2,51×), L3H5→L4H1 (2,43×), L3H4→L4H0 (1,88×) y L3H4→L4H1 (1,87×); ablacion causal que elimina L3H4+L3H5 y hunde las puntuaciones de induccion de 0,80/0,56 a 0,02/0,01; y analisis posicional que muestra que las cabezas emparejan por contenido y no por posicion relativa (poner a cero las dimensiones no rotatorias de las queries de L4H0 baja la puntuacion de 0,80 a 0,14, mientras que las dimensiones rotatorias de alta frecuencia no la alteran). El barrido de intensidades muestra que ×2 maximiza la copia pero empeora la loss total y aumenta la repeticion, y ×3 produce texto corrupto en generacion greedy; ×1,5 es el compromiso elegido.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por el preentrenamiento sin ajuste supervisado.
- Modelado de lenguaje y copia desde contexto mediante mecanismo de induction heads reforzado (cabeza L4H0 y L4H1 escaladas ×1,5).
- Prediccion de siguiente token en secuencias repetidas: tras "A B ... A" predice "B".
- Capacidades multilingues limitadas a chino e ingles.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene vision, audio ni modo thinking.
- No es un modelo conversacional: no puede mantener dialogos.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: servir como replicacion controlada de un circuito de induccion de dos capas, permitiendo a investigadores comparar activaciones y puntuaciones de induccion entre el modelo base y la variante editada.
- Validacion de tecnicas de weight editing: usar el par base/×1,5 para medir hasta que punto el escalado de cabezas identificadas altera metricas observables (loss de copia, repeticion greedy) sin cambiar benchmarks.
- Estudio de attention sinks y dependencia del token BOS: el modelo degenera sin `<|im_start|>` inicial, lo que lo convierte en un caso util para analizar el papel de BOS como sumidero de atencion en modelos pequenos.
- Docencia sobre circuitos de atencion: ilustrar con pesos reales como cabezas previous-token (L3H4, L3H5) alimentan cabezas de induccion (L4H0, L4H1) mediante composicion K.
- Reproduccion de evaluaciones con lm-evaluation-harness: servir de sujeto de prueba para pipelines de evaluacion en fp32 sobre Apple MPS con tokenizadores que no anaden BOS por defecto.
- Analisis de robustez y degeneracion: estudiar modos de fallo (repeticion de palabras, emision inmediata de end-of-text) en modelos preentrenados de muy bajo parametro.
- Pruebas de conversion de formato: verificar equivalencia de logits entre la implementacion original MiniMind y el formato `Qwen3ForCausalLM` en Hugging Face.

## Benchmarks y rendimiento

Resultados publicados por el autor con lm-evaluation-harness, 0-shot, fp32, Apple MPS, mismas condiciones para ambos modelos y BOS anadido al inicio del prompt:

| Benchmark | Metrica | Base | Este modelo | Error estandar |
|---|---|---|---|---|
| C-Eval (valid) | acc | 23,85 | 23,70 | ±1,16 |
| CMMLU | acc | 25,53 | 25,14 | ±0,41 |
| ARC-Easy | acc_norm | 30,89 | 30,72 | ±0,95 |
| PIQA | acc | 53,92 | 53,70 | ±1,16 |
| OpenBookQA | acc_norm | 24,20 | 24,00 | ±1,92 |
| HellaSwag | acc_norm | 27,69 | 27,53 | ±0,45 |
| Social IQa | acc | 35,52 | 35,77 | ±1,08 |

En comparacion pareada pregunta a pregunta, la diferencia queda por debajo de un error estandar pareado en todos los benchmarks (|z| < 1). En texto chino reservado, la loss de modelado de lenguaje pasa de 2,318 a 2,343 (1,1% peor). El autor tambien reporta una ejecucion previa sin BOS con resultados equivalentes en cuanto a ausencia de mejora significativa (C-Eval 24,89 vs 26,00; CMMLU 24,88 vs 24,67; ARC-Easy 28,16 vs 28,28; PIQA 52,77 vs 53,32; OpenBookQA 24,60 vs 24,60; HellaSwag 28,29 vs 28,25; Social IQa 34,54 vs 33,62).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 63,9M de parametros (unos 256 MB solo de pesos, mas activaciones y cache KV); en bf16/fp16 aproximadamente 128 MB de pesos.
- Cabe holgadamente en cualquier GPU consumer, incluida una GTX 1650 de 4 GB o incluso en CPU; tambien se ejecuto en Apple MPS.
- GPU recomendadas: innecesarias para uso funcional; cualquier GPU moderna sirve. Para experimentos de interpretabilidad con activaciones y gradientes, una RTX 3060/4090 es mas que suficiente.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (formato Qwen3). No se documentan soportes para vLLM, llama.cpp, Ollama o TGI, y al no haber variantes GGUF publicadas, llama.cpp requeriria conversion manual.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, la generacion es de milisegundos por token en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento |
|---|---|---|---|---|---|
| MiniMind-768 induction x1.5 | 63,9M | no disponible | Apache 2.0 | Edicion de pesos sobre induction heads | C-Eval 23,70; PIQA 53,70; HellaSwag 27,53 |
| MiniMind-768 (base) | ~64M | no disponible | Apache 2.0 | Preentrenamiento estandar | C-Eval 23,85; PIQA 53,92; HellaSwag 27,69 |
| MiniMind-768-SFT (referencia del proyecto) | ~64M | no disponible | Apache 2.0 | Preentrenamiento + SFT | no disponible en esta ficha |

La comparativa con modelos de talla similar de otros proyectos (por ejemplo, TinyLlama o Qwen2-0.5B) no procede directamente: MiniMind-768 esta preentrenado y sin SFT, y sus puntuaciones estan proximas al azar en benchmarks de conocimiento, por lo que no es comparable en rendimiento funcional. No se dispone de datos de benchmarks de alternativas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente preentrenado: no puede conversar y la calidad de generacion es limitada.
- No es una version mejorada: el propio autor indica que cada cambio esta dentro de los margenes de error y que no debe usarse con fines practicos.
- Dependencia critica del token BOS (`<|im_start|>`): el tokenizador no lo anade automaticamente y `add_bos_token=True` no surte efecto; sin BOS el modelo degenera (emite end-of-text de inmediato o repite palabras).
- Riesgo elevado de alucinacion y de texto incoherente, especialmente en generacion greedy con escalados altos del experimento.
- Sesgos conocidos: no documentados; al entrenarse sobre corpus no detallado, los sesgos del dataset de preentrenamiento son desconocidos.
- Cobertura linguistica limitada a chino e ingles.
- Resultados de benchmark obtenidos con una sola ejecucion por benchmark, sin estadistica multi-semilla; la reproducibilidad exacta depende de la configuracion del tokenizador y del harness.
- Licencia Apache 2.0 permite uso comercial del codigo y pesos, pero el modelo no es funcionalmente util para produccion; cualquier uso comercial seria tecnicamente inviable por calidad, no por licencia.
- Al ser un experimento de interpretabilidad, no hay garantia de mantenimiento, actualizaciones ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YixingZhang2026/minimind-768-induction-x1.5
- Repositorio MiniMind (jingyaogong): https://github.com/jingyaogong/minimind
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
