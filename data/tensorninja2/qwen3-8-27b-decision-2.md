# tensorninja2/qwen3.8-27b-decision-2

## Resumen

qwen3.8-27b-decision-2 es un adaptador LoRA con cabecera de puntero (pointer head) desarrollado por tensorninja2 sobre el modelo base Qwen/Qwen3.8-27B. No es un modelo generativo en sentido estricto: lee un estado de texto y un conjunto de preguntas tipadas, y devuelve una probabilidad calibrada para cada opción sin generar texto. Está disenado como clasificador de decisiones con calibración explícita, orientado a pipelines que necesitan probabilidades fiables en lugar de respuestas en lenguaje natural.

El adaptador se distribuye en formato propietario `.ninfer` (89,7 MB) y requiere el runtime NInfer-4090 junto con el artefacto NInfer del modelo base. No es cargable con PEFT, Transformers ni llama.cpp/GGUF. Su pipeline declarado es `text-classification` y la licencia es Apache-2.0.

Es relevante ahora porque propone un patrón distinto al de los LLM generativos: separar la decisión (probabilidad calibrada sobre opciones) de la generación. En la evaluación publicada mejora en 11,4 puntos porcentuales la precisión de su predecesor (decision-1) en el panel primario hard-v1 + devtools-v1, aunque incumple dos criterios de calidad declarados por el propio autor (calibración en estados cortos y tasa de alta confianza en registros sin respuesta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA + cabecera de puntero sobre transformer Qwen3.8-27B (base con atención y Gated DeltaNet) |
| Parametros totales | 42.205.184 parametros entrenados (adaptador); base no disponible en la informacion |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuracion de servicio `--max-context 32768`) |
| Tipos de cuantizacion | Base NF4 durante entrenamiento; inferencia con KV en BF16 o INT8 (modos rotados como `rk4v4` no cumplen tolerancia) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (adaptador, cabecera y base); los datasets de entrenamiento conservan sus propias licencias |
| Formato de pesos | `.ninfer` (`qwen3.8-27b-decision-2.lora.ninfer`); no compatible con safetensors, GGUF ni PEFT |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 16 y alpha 32 sobre query, output gate, key, value, attention output, Gated DeltaNet output y MLP down projection del modelo base Qwen3.8-27B. Sobre el estado oculto tras la normalizacion final (ancho 5.120) monta una cabecera de puntero con proyecciones query/key de 256 dimensiones que produce una probabilidad por opción. La temperatura de calibracion es 1,866 (IC 90 %: 1,66-2,00).

El entrenamiento continuo desde los pesos de decision-1 y su cabecera sobre la base Qwen3.8-27B en NF4. Se entrenaron 42.205.184 parametros durante una epoca, 3.318 pasos, learning rate 2e-5, semilla 1. El conjunto de entrenamiento suma 26.539 registros: los splits de entrenamiento documents-v1, hard-v1 y devtools-v1 de kev (ronda 18) mas 10.000 registros de replay de decision-v7. La calibracion se ajusto con 648 preguntas retenidas de ocho fuentes publicas (split transfer-r3) y las filas MMLU-Pro de transfer-v9.

## Capacidades

- Clasificacion de decisiones con probabilidad calibrada por opcion, sin generacion de texto.
- Preguntas tipadas (por ejemplo, tipo `predicate`) con nombre e instrucciones por pregunta.
- Interfaz compatible con el endpoint `decisions.create` del SDK de OpenAI (Python 3.26.0 o superior) contra un servidor NInfer local.
- Integracion con TypeSafe System One mediante `POST /typesafe/v1/systemone` (SDK TypeSafe 0.6 o 0.7).
- Soporte de multiples adaptadores simultaneos mediante `--lora-dir` y `--lora-slots` (2 slots en el ejemplo de servicio).
- Acepta imagenes a traves de OpenAI Decisions cuando Vision esta habilitado, aunque sin evaluacion publicada de precision ni calibracion en imagenes.
- No dispone de detector de rechazo (refusal detector).

## Casos de uso

- Triaje de tickets de soporte: clasificar un mensaje entrante con preguntas tipadas ("¿es sobre facturacion?", "¿requiere reembolso?") y obtener probabilidades calibradas para enrutar al equipo adecuado sin generar texto libre.
- Moderacion y etiquetado de contenido: aplicar predicados booleanos sobre estados cortos y usar el umbral de probabilidad para decidir escalado, apoyandose en la ECE baja observada en documents-v1 (0,010).
- Validacion en pipelines CI/CD de devtools: el panel devtools-v1 (772 preguntas, accuracy 0,850) sugiere uso en decisiones sobre artefactos de desarrollo, aunque con la advertencia de calibracion en estados cortos.
- Extraccion de decisiones estructuradas en documentacion: el panel documents-v1 (920 preguntas, accuracy 0,911, Brier 0,128) respalda su uso sobre documentos largos dentro del contexto de 32.768 tokens.
- Agentes con paso de decision determinista: sustituir una llamada generativa por una consulta de probabilidad cuando el agente solo necesita elegir entre opciones predefinidas, reduciendo coste y latencia.
- Investigacion sobre calibracion: el adaptador y sus paneles publicados (Brier, NLL, ECE, intervalos bootstrap) sirven como referencia reproducible para estudiar calibracion en modelos de decision.

## Benchmarks y rendimiento

Paneles de desarrollo (evaluacion del 2026-11-23 en RTX 4090 con KV en BF16; cada adaptador con su propia temperatura):

| Panel | Preguntas | Accuracy | Brier | NLL | ECE | Cambio vs decision-1 (pp) |
|---|---:|---:|---:|---:|---:|---:|
| decision-v7 | 1.264 | 0,881 | 0,181 | 0,343 | 0,026 | +0,8 [−0,2, +1,9] |
| hard-v1 | 1.083 | 0,862 | 0,184 | 0,342 | 0,027 | +12,5 [+9,7, +15,2] |
| devtools-v1 | 772 | 0,850 | 0,233 | 0,416 | 0,046 | +10,0 [+7,8, +12,3] |
| documents-v1 | 920 | 0,911 | 0,128 | 0,241 | 0,010 | +5,3 [+3,2, +7,4] |
| transfer-v4 short states | 576 | 0,885 | 0,173 | 0,296 | 0,031 | +0,2 [−1,4, +1,7] |
| breadth-v1 | 2.475 | 0,820 | 0,255 | 0,460 | 0,019 | +0,9 [0,0, +1,9] |

Panel primario (hard-v1 + devtools-v1 combinados): +11,4 pp [+9,6, +13,3].

Tests bloqueados (una sola lectura por split):

| Split | Adaptador | Preguntas | Accuracy | Brier | NLL | ECE |
|---|---|---:|---:|---:|---:|---:|
| decision-v7 | decision-2 | 1.200 | 0,870 | 0,187 | 0,352 | 0,030 |
| decision-v7 | decision-1 | 1.200 | 0,856 | 0,190 | 0,355 | 0,020 |
| breadth-v1 | decision-2 | 2.489 | 0,815 | 0,265 | 0,474 | 0,028 |

En breadth-v1, la diferencia frente a decision-1 fue +0,4 pp [−0,6, +1,3].

## Requisitos de hardware

- GPU objetivo declarada: RTX 4090 (runtime NInfer-4090, build `sm89`).
- El adaptador pesa 89,7 MB; el requisito real de VRAM lo determina el modelo base Qwen3.8-27B, cuyo peso en VRAM no se detalla en la informacion disponible.
- Contexto maximo configurable de 32.768 tokens; el KV en BF16 es el recomendado para reproducir las puntuaciones.
- Despliegue exclusivamente mediante NInfer (`ninfer-serve`) con `--kv-dtype bf16`, `--lora-dir` y `--lora-slots`.
- No compatible con vLLM, llama.cpp, Ollama, TGI ni PEFT/Transformers.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (panel primario) | Licencia | Formato |
|---|---|---|---|---|---|
| qwen3.8-27b-decision-2 | 42,2 M entrenados (adaptador) | 32.768 | 0,862 / 0,850 (hard-v1 / devtools-v1) | Apache-2.0 | `.ninfer` |
| qwen3.8-27b-decision-1 | no disponible | 32.768 (misma base) | −11,4 pp respecto a decision-2 en panel primario | Apache-2.0 | `.ninfer` |
| Qwen3.8-27B (base) | no disponible | no disponible | no disponible como clasificador de decisiones | Apache-2.0 | no disponible |

No se dispone de datos de otros modelos comparables de la misma categoria (clasificadores de decision calibrados sobre LLM) en la informacion proporcionada.

## Limitaciones y advertencias

- Incumple el limite de calibracion en estados cortos: el Brier de transfer-v4 short states subio 0,008 y el limite superior del IC (0,024) supera el maximo permitido de 0,020.
- Incumple el limite de registros sin respuesta: el 25,5 % de las respuestas sobre los 110 registros unknowable de transfer-v9 tuvieron confianza ≥ 0,9, frente al limite del 5 %.
- Alta confianza no implica que el estado contenga una respuesta; el propio autor lo advierte.
- Sin detector de rechazo; las salidas y la calibracion no reproducen los modelos alojados de OpenAI ni de TypeSafe.
- Los modos de KV rotados (incluido `rk4v4`) no cumplen la tolerancia por pregunta; usar BF16 (o INT8) para reproducir los resultados.
- Sin evaluacion de precision ni calibracion en imagenes pese a aceptar entradas visuales con Vision habilitado.
- Dependencia de un runtime propietario (NInfer-4090) y de un artefacto base especifico; no portable a ecosistemas estandar.
- Idiomas soportados no documentados.
- Los datasets de entrenamiento conservan sus propias licencias, independientes de la Apache-2.0 del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/tensorninja2/qwen3.8-27b-decision-2
- Modelo predecesor: https://huggingface.co/tensorninja2/qwen3.8-27b-decision-1
- Artefacto base NInfer: https://huggingface.co/tensorninja2/Qwen3.8-27B-NInfer
- Runtime NInfer-4090: https://github.com/tensorninja/ninfer-4090
- Documentacion de serving (System One y fidelidad): https://github.com/tensorninja/ninfer-4090/blob/tensorninja/docs/serving.md
- kev (framework de evaluacion y datasets): https://github.com/jaredpalmer/kev
