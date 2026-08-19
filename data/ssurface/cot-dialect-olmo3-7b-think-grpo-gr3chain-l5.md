# ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-l5

## Resumen

`cot-dialect-olmo3-7b-think-grpo-gr3chain-l5` es un adaptador LoRA publicado por `ssurface` que modifica el modelo base `allenai/Olmo-3-7B-Think` para razonar con cadenas de pensamiento comprimidas al nivel L5, es decir, una única expresión colapsada (por ejemplo, `18/3*2=12`). El adaptador forma parte de una familia de experimentos sobre "dialectos de compresión de cadenas de pensamiento" (Chain-of-Thought Compression Dialects), donde se entrena al modelo para producir razonamientos extremadamente cortos en lugar de cadenas largas.

Este modelo concreto es una **ablación** del diseño de recompensa: se entrenó con una variante llamada `gr3chain` (reescalado multiplicativo de la recompensa positiva con suelo en 0,3) para comparar cómo afecta esta elección frente al modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l5`). El objetivo declarado es permitir reproducir la comparación de diseño de recompensas descrita en el paper asociado, no ser un modelo de producción. Se entrenó con GRPO sobre el modelo SFT fusionado a nivel L5, usando el conjunto GSM8K train re-expresado (6993 ejemplos, mediana de 16 caracteres por cadena).

La relevancia de este adaptador es puramente investigadora: sirve para estudiar cómo la compresión extrema del razonamiento afecta a la precisión y cómo distintas funciones de recompensa influyen en el resultado. No está pensado para uso general, y su rendimiento fuera del dominio matemático es muy limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `allenai/Olmo-3-7B-Think` (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador ocupa 0.2 GB; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base, no especificada en la model card) |
| Tipos de cuantizacion | No disponible (adaptador en bf16, safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo de 7B de la familia Olmo 3 de AllenAI, entrenado para razonamiento de cadena de pensamiento larga. El adaptador LoRA tiene r=16 y alpha=32, y se entrena con GRPO (usando `trl.GRPOTrainer` sobre `transformers` estándar con atención `sdpa`) sobre el modelo SFT fusionado a nivel L5, no sobre el base directamente. El conjunto de entrenamiento son 6993 ejemplos de GSM8K train re-expresados por un modelo profesor a nivel L5, con una mediana de 16 caracteres por cadena dentro de `thinking`.

La función de recompensa combina cuatro componentes: `correctness` (acierto de respuesta ponderado por el número de pasos de la solución dorada), `format` (exige un bloque `thinking...response` seguido de `#### <answer>`), `chain` (verificador de que la aritmética escrita en la cadena es correcta) y `gr3` (reescalado multiplicativo de la recompensa positiva con suelo 0,3, que no reordena respuestas correctas frente a incorrectas). El entrenamiento usó 8 generaciones por prompt, batch de 64 con 1 acumulación, máximo 256 tokens de completado, learning rate 1e-05 y coeficiente KL beta 0.01, en una sola GPU NVIDIA A100 80GB. El autor advierte que el adaptador debe cargarse sobre el modelo SFT fusionado L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`), no sobre el base directamente, para reproducir los resultados.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento comprimidas a una expresion unica (nivel L5).
- Generacion de texto basica (heredada del modelo base), pero limitada al dominio de problemas de palabras matematicas.
- No soporta tool calling, function calling ni capacidades de agente.
- No soporta vision, audio ni otros modos multimodales.
- Capacidad multilingue: solo ingles.
- No tiene modo "thinking" explicito; el razonamiento se produce dentro de `thinking` pero comprimido a una expresion aritmetica.

## Casos de uso

- Investigacion en compresion de cadenas de pensamiento: permite estudiar como la compresion extrema (nivel L5) afecta a la precision en razonamiento matematico, comparando con otros niveles (L1 a L4) de la misma familia.
- Ablacion de diseno de recompensa: sirve para reproducir la comparacion entre la recompensa `gr3chain` y la recompensa estandar del modelo principal `cot-dialect-olmo3-7b-think-grpo-l5`, evaluando el impacto del reescalado multiplicativo en el resultado final.
- Verificacion de metodos de entrenamiento con GRPO: al ser un adaptador pequeno y publico, puede usarse como caso de estudio para validar pipelines de RLHF/GRPO con LoRA sobre modelos de 7B.
- Analisis de robustez fuera de dominio: los resultados en AIME (3,3%) y BBH (14,4%) muestran una caida severa frente a SVAMP (70,8%), lo que permite estudiar los limites de la compresion en tareas mas alla de GSM8K.
- Replicacion de experimentos academicos: dado que el autor publica el codigo de entrenamiento y los datos, el adaptador puede usarse para reproducir o extender los resultados del paper "Chain-of-Thought Compression Dialects".
- Evaluacion de calidad de verificadores aritmeticos: el componente `chain` de la recompensa actua como verificador de la aritmetica interna; este adaptador permite probar como afecta ese verificador a la precision final.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (sin verificacion independiente):

| Benchmark | n | Accuracy |
|---|---:|---:|
| GSM8K (test, greedy, single-turn) | 1317 | 66,4% |
| AIME (out-of-domain) | 60 | 3,3% |
| BBH (out-of-domain) | 250 | 14,4% |
| SVAMP (transfer) | 250 | 70,8% |

No se han publicado comparaciones con otros modelos en la informacion disponible. El autor indica que la precision cae con la dificultad del problema y que las diferencias de un par de puntos porcentuales estan dentro del ruido estadistico (intervalo de confianza del 95% de ~2,7 pp para n=1317).

## Requisitos de hardware

- El adaptador LoRA es pequeno (0.2 GB), pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` en memoria. En bf16, el modelo base ocupa aproximadamente 14-16 GB de VRAM.
- GPU recomendada: al menos 24 GB de VRAM para inferencia comoda (por ejemplo, NVIDIA RTX 4090, A100 40GB o superior). En cuantizacion de 8 bits podria caber en 16 GB, pero no se proporcionan datos de cuantizacion.
- El entrenamiento se realizo en 1x NVIDIA A100 80GB; para inferencia se puede usar hardware similar o inferior.
- Opciones de despliegue: `transformers` con `PeftModel` (como en el codigo de ejemplo), o fusionar el adaptador con el modelo base y servir con vLLM o TGI. Tambien puede usarse con `llama.cpp` si se convierte a GGUF, aunque no se proporciona soporte oficial.
- Latencia y throughput: no disponibles. Al ser un adaptador sobre un modelo de 7B, la latencia sera similar a la de otros modelos de ese tamano, pero la compresion de la cadena de pensamiento reduce el numero de tokens generados, lo que acelera la inferencia frente al modelo base sin compresion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para el modelo base `allenai/Olmo-3-7B-Think` ni para otros adaptadores de la misma familia en la informacion proporcionada. La comparacion directa no es posible sin esos datos. Como referencia cualitativa:

| Modelo | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `cot-dialect-olmo3-7b-think-grpo-gr3chain-l5` (este) | 7B + LoRA | No disponible | Apache-2.0 | HuggingFace |
| `allenai/Olmo-3-7B-Think` (base) | 7B | No disponible | Apache-2.0 | HuggingFace |
| `ssurface/cot-dialect-olmo3-7b-think-grpo-l5` (modelo principal del mismo nivel) | 7B + LoRA | No disponible | Apache-2.0 | HuggingFace |

La diferencia clave entre este adaptador y el modelo principal del mismo nivel es la funcion de recompensa (`gr3chain` frente a la estandar), lo que lo hace util para comparaciones de diseno, pero no para uso directo en produccion.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de palabras matematicas (GSM8K); su rendimiento fuera de ese dominio es muy bajo (AIME 3,3%, BBH 14,4%).
- La precision cae rapidamente con la dificultad del problema, especialmente en los niveles comprimidos.
- Es una ablacion de investigacion, no un modelo de produccion. El autor advierte que puede ser peor que el modelo principal del mismo nivel.
- Requiere cargar primero el adaptador SFT L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`) y fusionarlo antes de aplicar este adaptador GRPO; cargarlo directamente sobre el modelo base no reproduce los resultados publicados.
- Los resultados de benchmarks son declarados por el autor sin verificacion independiente.
- Entrenado con una sola semilla (a menos que el nombre del repo indique lo contrario); diferencias de un par de puntos porcentuales pueden deberse al ruido.
- Solo soporta ingles; no hay soporte multilingue.
- No se proporcionan datos sobre sesgos, alucinaciones o seguridad. Al ser un adaptador pequeno sobre un modelo abierto, hereda los riesgos del modelo base, que no estan documentados en esta model card.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Modelo principal del mismo nivel (referencia): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l5 (enlace inferido del texto de la model card, no verificado)
- Adaptador SFT L5 requerido: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l5 (enlace inferido del codigo de ejemplo, no verificado)
