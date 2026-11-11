# utsavz/wsp_nov10_qwen3vl4b_opus

## Resumen

WSP safety edit de Qwen3-VL-4B-Instruct es un checkpoint de investigación publicado por el usuario utsavz en Hugging Face, derivado del modelo multimodal Qwen3-VL-4B-Instruct de Alibaba Qwen. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: es el resultado de un experimento de weight-space programming (WSP) en el que un agente LLM (identificado como Claude Opus 5.5) editó directamente los pesos del modelo base para incrementar su tasa de rechazo ante peticiones multimodales de jailbreak. El proceso no utilizó gradientes, optimizador ni entrenamiento; solo un presupuesto de 500 forward passes, de los cuales se consumieron 345 antes de congelar el modelo.

El modelo conserva la arquitectura, tokenizador, procesador y plantilla de chat del Qwen3-VL-4B-Instruct original, con 4.437.815.808 parámetros en BF16 y un repositorio de 8,9 GB. La intervención afecta únicamente a seis tensores de las capas MLP 20 y 26 del modelo de lenguaje, modificando dos neuronas por capa para instalar dos "circuitos de rechazo". Aproximadamente 30.700 de los 4.440 millones de pesos difieren del base; los otros 707 tensores son bit a bit idénticos.

Su relevancia es doble: por un lado, demuestra que es posible modificar el comportamiento de seguridad de un modelo multimodal mediante edición quirúrgica de pesos sin reentrenar; por otro, ofrece un caso de estudio reproducible con métricas concretas sobre VLGuard (ASR de peticiones dañinas reducido del 34,5% al 16,5%). Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (visión-lenguaje), derivada de Qwen3-VL-4B-Instruct |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, mismos nombres, formas, dtypes y shards que el base) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-VL en su variante de 4B parámetros, con un codificador visual y un modelo de lenguaje transformer. La edición WSP no altera la topología: se limita a seis tensores de las proyecciones `gate_proj`, `up_proj` y `down_proj` de las capas MLP 20 y 26 del `model.language_model`. Cada circuito repurpone las dos neuronas menos activas de su capa: las filas de `gate_proj` actúan como detector de daño (umbral fijado con una dirección residual casi constante, ya que la capa no tiene sesgos), las filas de `up_proj` se fijan a ~1 y las columnas de `down_proj` escriben la dirección de rechazo propia del modelo con signos opuestos. El resultado es una función de empuje `push ≈ A · clamp(s, 0, m)/m · r`: nada por debajo del umbral, rampa intermedia y saturación por encima.

La capa 20 funciona como detector de daño (responde a peticiones dañinas en texto, imagen, tipografía o envoltorios de jailbreak) y la capa 26 como amplificador (se activa cuando ya hay evidencia de rechazo acumulada). Todas las direcciones son diferencias de medias de activaciones registradas, los umbrales son percentiles de puntuaciones de desarrollo y las magnitudes son múltiplos de gaps medidos. Los datos de desarrollo fueron `train.json` de VLGuard más ejemplos escritos por el agente; no se usó ningún otro dataset. La norma relativa de cambio por tensor oscila entre el 1,4% (`up_proj`) y el 10,1% (`gate_proj` de la capa 20). No hubo RLHF, DPO ni ajuste supervisado convencional.

## Capacidades

- Generación de texto e imagen-a-texto (pipeline `image-text-to-text`), heredadas del Qwen3-VL-4B-Instruct base.
- Razonamiento multimodal sobre imágenes y texto combinados, con la plantilla de chat original (imagen primero, sin system prompt).
- Rechazo reforzado de peticiones dañinas multimodales: ASR global reducido del 34,5% al 16,5% en VLGuard test.
- Mayor resistencia a formatos de jailbreak concretos: doble persona (0% → 70% de rechazo), poema con pasos (10% → 60%), worksheet, screenshot e imágenes divididas cross-modal (80–92% → 95–100%).
- Tool calling y function calling: no documentado explícitamente en la información proporcionada; se hereda lo que soporte el base.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad de modelos multimodales: sirve como caso de estudio reproducible de edición de pesos para instalar circuitos de rechazo, con métricas antes/después sobre VLGuard y presupuesto de forward passes documentado.
- Evaluación de técnicas de weight-space programming: permite comparar la edición quirúrgica de pesos frente a fine-tuning con gradientes en términos de eficacia (ASR) y coste (345 forward passes, sin optimizador).
- Auditoría de robustez ante jailbreaks visuales: útil para probar defensas frente a ataques que combinan imagen dañina con instrucción, donde el ASR baja del 49,5% al 31,0%.
- Análisis de sobre-rechazo (over-refusal): el modelo permite estudiar el trade-off entre seguridad y utilidad, con un incremento de rechazo benigno del 0,36% al 1,79% medido sobre 558 muestras seguras.
- Baseline para investigación en alineación multimodal: al conservar el 99,999% de los pesos idénticos al base, aísla el efecto de la intervención de seguridad frente a otras variables.
- Estudio de degradación de respuestas benignas: con un 22% de coincidencia exacta en `safe_safes` respecto al base, sirve para analizar cómo una edición mínima altera la generación benigna sin cambio medible de verosimilitud (NLL 2,2578 → 2,2584).

## Benchmarks y rendimiento

Resultados sobre VLGuard test (1.558 muestras, ejecución única tras congelar el modelo; plantilla de chat, imagen primero, sin system prompt, imágenes limitadas a 1280×32×32 px, decodificación greedy, 256 tokens nuevos, rechazo juzgado por coincidencia de palabras clave):

| Métrica | Base | Este modelo |
|---|---|---|
| ASR, imagen insegura + instrucción (442) | 49,5% | 31,0% |
| ASR, imagen segura + instrucción insegura (558) | 22,6% | 5,0% |
| ASR, todas las dañinas (1.000) | 34,5% | 16,5% |
| Peticiones dañinas rechazadas por el base pero respondidas por la edición | – | 0 |
| Sobre-rechazo en imagen segura + instrucción segura (558) | 0,36% (2) | 1,79% (10) |
| NLL de respuesta de referencia en `safe_safes` (ponderada por token, 541) | 2,2578 | 2,2584 |

Durante el desarrollo, sobre formatos de ataque escritos por el agente tras fijar cada candidato, el rechazo evolucionó así: jailbreak de doble persona 0% → 70%; jailbreak de pasos en un poema 10% → 60%; worksheet, screenshot e imágenes divididas cross-modal 80–92% → 95–100%. El conjunto final de comprobación no mostró rechazos benignos añadidos (0/120).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,9 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12–16 GB en función de la longitud de contexto y el tamaño de imagen.
- GPU recomendadas: A100 (40/80 GB), H100, L40S; en consumer, RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en BF16 para contextos moderados.
- Cuantización: el autor no publica versiones GGUF ni cuantizadas; habría que generarlas a partir de los safetensors. En 4 bits cabría en GPUs de 8–12 GB, pero no está validado por el autor.
- Despliegue: `transformers` (probado con 4.57.5 y torch 2.10.0) mediante `Qwen3VLForConditionalGeneration` y `AutoProcessor`; no requiere parcheo. vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint, aunque al ser estructuralmente idéntico al base deberían funcionar los mismos caminos de carga.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ASR VLGuard (todas las dañinas) | Sobre-rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| utsavz/wsp_nov10_qwen3vl4b_opus | 4,44 B | no disponible | 16,5% | 1,79% | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-VL-4B-Instruct (base) | 4,44 B | no disponible | 34,5% | 0,36% | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoría (ediciones de seguridad por pesos) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el base es la más informativa: misma arquitectura, mismos parámetros y misma licencia, con una reducción del ASR a costa de un aumento del sobre-rechazo. No se dispone de datos de otros modelos comparables de 4B multimodales con edición de seguridad en la información proporcionada.

## Limitaciones y advertencias

- Evaluación por palabras clave: el ASR usa coincidencia de reglas para detectar rechazo, con dos modos de fallo: respuestas conformes que contienen una frase de rechazo se cuentan como rechazo, y rechazos con redacción inusual se cuentan como ataque (incluido un rechazo dentro de un formato forzado como `{"steps": []}`).
- Muchas respuestas "inseguras" restantes de VLGuard son descripciones de imágenes sensibles que las etiquetas de VLGuard marcan como de rechazo obligatorio.
- Ofuscación no cubierta: las peticiones en leetspeak solo se rechazaron 1 de 5 veces en desarrollo, porque el daño solo se hace visible tras decodificar.
- Sobre-rechazo léxico: peticiones límite con palabras que suenan violentas ("slaughter a turkey humanely") se rechazan con más frecuencia bajo encuadre de role-play.
- Respuestas benignas alteradas: a menudo difieren de las del base tras los primeros cientos de caracteres (22% de coincidencia exacta en `safe_safes`), sin cambio medible de verosimilitud.
- Es un checkpoint de investigación: no hay garantías de robustez fuera de VLGuard ni validación en producción; el propio autor documenta que la puntuación es heurística.
- Licencia Apache 2.0 heredada del base, que permite uso comercial, pero el modelo no está validado para despliegues reales de seguridad.
- Idiomas soportados y longitud de contexto no documentados en la información disponible; conviene consultar la model card del base Qwen3-VL-4B-Instruct.

## Enlaces

- Hugging Face: https://huggingface.co/utsavz/wsp_nov10_qwen3vl4b_opus
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct (revisión `ebb281ec70b05090aa6165b016eac8ec08e71b17`)
- Paper, blog, repositorio o demo del estudio WSP: no disponibles en la información proporcionada.
