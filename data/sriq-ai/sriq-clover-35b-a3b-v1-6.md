# sriq-ai/sriq-clover-35B-A3B-v1.6

## Resumen

sriq-clover-35B-A3B-v1.6 es un adaptador LoRA de tipo PEFT (no fusionado) desarrollado por sriq-ai sobre el modelo base Diffuspace/Clover-35B-A3B-Preview, un modelo de lenguaje de difusión por bloques con arquitectura MoE (mixture of experts) de 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, construido a su vez sobre el backbone Qwen3.6-35B-A3B. El adaptador no modifica la arquitectura del modelo base: se aplica sobre las capas de atención, la Gated DeltaNet y el MLP de expertos compartidos, dejando congelados los expertos enrutados y el router.

El objetivo del adaptador es inducir un comportamiento de razonamiento comprimido en chino simplificado con una verificación explícita marcada con el token `验：`, respondiendo después en el idioma de la pregunta. Se entrenó en dos etapas sobre el dataset sriq-ai/sriq-sft-v1.6: una primera etapa QLoRA de una época (conservada al 50 %) y una segunda etapa de SFT filtrado sobre 5.229 filas cuya traza dorada es exclusivamente china, simplificada y contiene la verificación `验：`.

Es relevante como ejemplo práctico de ajuste fino sobre modelos de difusión de texto con decodificación por bloques, un paradigma distinto del autoregresivo habitual. El autor publica métricas internas de puertas de calidad sobre 64 trazas reservadas, pero advierte explícitamente de que la precisión de respuesta no se ha evaluado con benchmarks y de que 2 de esas 64 trazas fallan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre modelo base de difusión por bloques con backbone MoE (Clover-35B-A3B-Preview, basado en Qwen3.6-35B-A3B) |
| Parametros totales | 35B en el modelo base; el adaptador LoRA tiene r=32, α=64, dropout 0 (tamaño del repo: 0,6 GB) |
| Parametros activos | Aproximadamente 3B por token en el modelo base (MoE) |
| Longitud de contexto | No disponible (el entrenamiento descarta filas de más de 6.144 tokens; la generación de prueba usa un máximo de 384 tokens nuevos) |
| Tipos de cuantizacion | QLoRA con expertos enrutados en NF4 (bitsandbytes, blocksize 64) durante el entrenamiento; el autor indica que no se ha probado una build cuantizada para inferencia |
| Idiomas soportados | Multilingüe; razonamiento interno en chino simplificado y respuesta en el idioma de la pregunta |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT, no fusionado) |

## Arquitectura y entrenamiento

El modelo base Clover-35B-A3B-Preview es un modelo de difusión de texto por bloques con backbone MoE de tipo transformer, derivado de Qwen3.6-35B-A3B. La generación emplea decodificación por bloques de 32 tokens con reglas propias (LowConfidence 0.95, presencia 0.9, repetición 1.05) y una ruta de "preview" con máscara sobre tokens de cada bloque. El adaptador se aplica sobre las proyecciones q/k/v/o de atención, sobre `in_proj_qkv`, `in_proj_z` y `out_proj` de la Gated DeltaNet, y sobre el MLP de expertos compartidos; los expertos enrutados y el router permanecen congelados.

El entrenamiento se realizó en dos etapas. La etapa 1 fue un QLoRA de una época sobre las 9.908 filas utilizables del split de entrenamiento de sriq-sft-v1.6 (104 de 209 pasos, 48 filas por paso, OneCycle hasta 1,5e-4), conservando el checkpoint al 50 %. La etapa 2 fue un SFT filtrado sobre 5.229 filas cuya traza dorada es solo china, simplificada y contiene `验：` (55 pasos, 0,5 época, OneCycle hasta 5e-5, continuando el adaptador de la etapa 1). La función de pérdida combina entropía cruzada de difusión por bloques sobre tokens enmascarados de bloques de 32 tokens (ratio de máscara t ~ U(0,1), ruta preview) con 1,0 × entropía cruzada autoregresiva next-token en la pasada causal limpia. Se entrenan todos los bloques hasta `</think>` más dos bloques de respuesta; los tokens de prompt nunca se entrenan. El autor señala que DiffuSpace no ha publicado el código de entrenamiento de Clover, por lo que el objetivo es una reconstrucción propia (carpeta `code/`). El entrenamiento se ejecutó en una RTX PRO 6000 Blackwell de 96 GB: unas 4 horas para la etapa 1 al 50 % y unas 2,3 horas para la etapa 2.

## Capacidades

- Generación de texto con razonamiento interno comprimido en chino simplificado antes de la respuesta final.
- Verificación explícita del razonamiento mediante el marcador `验：` (54 de 64 trazas reservadas lo incluyen).
- Respuesta en el idioma de la pregunta: 64 de 64 trazas reservadas responden en el idioma de entrada, con razonamiento en chino.
- Razonamiento matemático con respuesta numérica final (12 filas de matemáticas con respuesta de un solo número en el conjunto reservado).
- Generación de código: aparecen prompts de programación en ruso y hebreo en las pruebas, aunque con fallos documentados.
- Capacidad multilingüe de entrada (preguntas en ruso, rumano, hebreo y otros idiomas en el conjunto reservado).
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Razonamiento matemático con verificación: el adaptador fuerza una traza de razonamiento en chino con comprobación `验：` antes de dar la respuesta numérica, útil en pipelines donde se quiere auditar el paso intermedio y no solo el resultado.
- Atención multilingüe con salida en el idioma del usuario: el modelo razona en un idioma interno compacto (chino) y responde en el idioma de la pregunta, lo que permite atender consultas en varios idiomas con un coste de razonamiento relativamente bajo (media de 148 tokens de razonamiento frente a 293 del modelo base).
- Evaluación de modelos de difusión de texto: sirve como caso de estudio reproducible de ajuste LoRA sobre decodificación por bloques, con recetas de entrenamiento y scripts de prueba publicados en la carpeta `code/`.
- Investigación sobre control de idioma interno: las métricas de "razonamiento solo en chino", "caracteres tradicionales" y "mezcla de idiomas" permiten estudiar cómo el SFT filtra el comportamiento lingüístico del modelo base.
- Generación de código asistida en entornos multilingües: el adaptador procesa prompts de programación en varios idiomas, aunque el autor documenta un fallo de bucle en un prompt de código en ruso que debe tenerse en cuenta.
- Prototipado de asistentes con razonamiento comprimido: la reducción de tokens de razonamiento (148 frente a 293 del base) abarata la inferencia en escenarios de pregunta-respuesta con verificación, siempre que se acepte la tasa de fallo documentada.

## Benchmarks y rendimiento

El autor no publica resultados en bench.sriq.org ni en benchmarks estándar (MMLU, HumanEval, GSM8K). Los únicos datos son métricas internas sobre 64 filas reservadas de sriq-sft-v1.6 (57 preguntas no chinas, 12 de matemáticas con respuesta de un solo número), comparando el modelo base y tres checkpoints del adaptador bajo el mismo harness (Transformers bf16, greedy, reglas de decodificación de Clover, máximo 384 tokens nuevos):

| Metrica | Base | 50% época | época completa | Este adaptador |
|---|---|---|---|---|
| Razonamiento solo en chino (de 57 preguntas no chinas) | 0 | 56 | 53 | 55 |
| Verificación `验：` en el razonamiento (de 64) | 0 | 48 | 33 | 54 |
| Trazas con caracteres solo tradicionales (de 64) | 3 | 0 | 1 | 0 |
| Razonamiento cerrado en 384 tokens (de 64) | 21 | 58 | 58 | 58 |
| Media de tokens de razonamiento | 293 | 151 | 137 | 148 |
| Respuesta en el idioma de la pregunta (de 64) | 64 | 64 | 64 | 64 |
| Trazas con bucle (de 64) | 0 | 0 | 0 | 1 |
| Respuesta final correcta (de 12) | 6 | 4 | 4 | 5 por el checker, 6 por lectura |

El autor advierte que 12 filas verificables no permiten separar modelos y que la precisión de respuesta no se ha evaluado con benchmarks.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 70 GB para el modelo base con el adaptador fusionado, según el autor.
- GPU recomendadas: una RTX PRO 6000 Blackwell de 96 GB es la configuración usada para el entrenamiento; para inferencia en bf16 se necesita una GPU con al menos 70 GB, como A100 80 GB o H100 80 GB.
- En GPU de consumo: no cabe en bf16 en una RTX 4090 (24 GB) ni en una RTX 5090; el autor no ha probado builds cuantizadas, por lo que no hay datos de viabilidad en consumer.
- Opciones de despliegue: solo probado en Transformers con `trust_remote_code` y PEFT (`merge_and_unload()`; el adaptador sin fusionar es unas 10 veces más lento). No probado en SGLang, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. El autor solo indica que la versión sin fusionar es aproximadamente 10 veces más lenta y que la decodificación sigue las reglas de difusión por bloques de Clover.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sriq-clover-35B-A3B-v1.6 | 35B totales / ~3B activos (adaptador LoRA) | No disponible | Métricas internas sobre 64 trazas; sin benchmarks estándar | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Diffuspace/Clover-35B-A3B-Preview (base) | 35B totales / ~3B activos | No disponible | SOTA entre modelos de difusión open source en los benchmarks del blog de lanzamiento, según el autor | No disponible en la información | Hugging Face y GitHub |
| Qwen3.6-35B-A3B (backbone) | 35B totales / ~3B activos | No disponible | No disponible en la información | No disponible en la información | No disponible en la información |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor reconoce que 2 de 64 trazas reservadas fallan las puertas de calidad: un bucle en un prompt de código en ruso que degenera en `queryCount(l,r,val,val,val,…` hasta el límite, y una mezcla de idiomas en una pregunta de matrices en rumano (`A inversibilă`, `adjugate:` dentro del razonamiento en chino).
- Un prompt de código en hebreo cita la cadena que imprime (`'שלום עולם'`) dentro del razonamiento en chino; la puerta lo marca, pero es texto de salida, no razonamiento en hebreo.
- Aproximadamente 1 de cada 5 trazas es más del doble de larga que la traza dorada de su fila; muchas trazas doradas tienen solo 1-8 tokens.
- Las trazas de aritmética pura como `4×6=24` no contienen idioma alguno.
- El checker de evaluación marcó una respuesta correcta como incorrecta por no estar en negrita ("Hay 21 caramelos en total (12 rojos + 9 verdes)."), leyendo el último número (9).
- La precisión de respuesta no se ha evaluado con benchmarks; 12 filas verificables no permiten separar modelos. El autor recomienda evaluar en la carga de trabajo propia antes de confiar en el adaptador.
- No se ha probado en SGLang, llama.cpp ni en una build cuantizada; solo en Transformers con `trust_remote_code`.
- No se debe pasar `enable_thinking=False`: la plantilla rellena un `<think></think>` vacío y la traza desaparece.
- El adaptador no está fusionado; sin `merge_and_unload()` la inferencia es unas 10 veces más lenta.
- El autor no ha publicado el código de entrenamiento de Clover; el objetivo de entrenamiento es una reconstrucción propia.
- Riesgo de alucinación y sesgos: no documentados explícitamente en la información disponible, más allá de los fallos de bucle y mezcla de idiomas descritos.

## Enlaces

- [Hugging Face: sriq-ai/sriq-clover-35B-A3B-v1.6](https://huggingface.co/sriq-ai/sriq-clover-35B-A3B-v1.6)
- [Hugging Face: kaivoss/sriq-clover-35B-A3B-v1.6](https://huggingface.co/kaivoss/sriq-clover-35B-A3B-v1.6)
- [Modelo base: Diffuspace/Clover-35B-A3B-Preview](https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview)
- [GitHub: DiffuSpace/Clover-35B-A3B-Preview](https://github.com/DiffuSpace/Clover-35B-A3B-Preview)
- [Dataset de entrenamiento: sriq-ai/sriq-sft-v1.6](https://huggingface.co/datasets/sriq-ai/sriq-sft-v1.6)
- [SRIQ](https://sriq.org)
- [Benchmarks SRIQ](https://bench.sriq.org)
