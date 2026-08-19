# ssurface/cot-dialect-olmo3-7b-think-grpo-gdpoonly-l5

## Resumen

`cot-dialect-olmo3-7b-think-grpo-gdpoonly-l5` es un adaptador LoRA publicado por `ssurface` que modifica el comportamiento de razonamiento de `allenai/Olmo-3-7B-Think` para operar en el nivel de compresion L5: una expresion unica y colapsada de la cadena de pensamiento, con una longitud mediana de 16 caracteres por cadena. Forma parte de la linea de investigacion "Chain-of-Thought Compression Dialects" del autor, que estudia como distintos niveles de compresion del razonamiento afectan a la precision en tareas matematicas.

Este modelo concreto es una **ablacion de diseno de recompensa**, no uno de los modelos principales de la familia: se entreno con una variante de recompensa que normaliza cada componente de forma independiente dentro del grupo (`gdpo`) antes de sumarlos, para que ningun componente domine sobre los demas. Su proposito es permitir que la comparacion de diseno de recompensas del paper pueda reproducirse en lugar de tomarse como un hecho. Se publica como complemento del modelo principal del mismo nivel, `ssurface/cot-dialect-olmo3-7b-think-grpo-l5`.

El adaptador se entreno con GRPO sobre el modelo SFT fusionado del nivel L5, usando el conjunto de entrenamiento de GSM8K reexpresado por un modelo profesor (6993 ejemplos). Alcanza un 77,4% de precision exacta en GSM8K test con decodificacion greedy, sin ejemplos ni self-consistency. La licencia es Apache 2.0 y el idioma soportado es ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter (r=16, alpha=32) sobre `allenai/Olmo-3-7B-Think` (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el adaptador se carga en bfloat16 sobre el base) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria peft) |

## Arquitectura y entrenamiento

El adaptador se entrena con `trl.GRPOTrainer` sobre stock `transformers` con atencion `sdpa`, partiendo del modelo SFT fusionado del nivel L5 (`merged_olmo/l5`). La funcion de recompensa combina tres componentes: `correctness` (que pondera el acierto segun el numero de pasos de la solucion dorada, de modo que los problemas mas dificiles valen mas), `format` (la respuesta debe consistir en un bloque ` thinking... response` seguido de `#### <answer>`) y `gdpo` (normaliza cada recompensa de forma independiente dentro del grupo antes de sumarlas, evitando que un componente domine). Se usan 8 generaciones por prompt, batch de 32 con acumulacion x2, maximo de 256 tokens de completado, learning rate de 1e-05 y coeficiente KL (beta) de 0,01. El conjunto de prompts es `gsm8k_grpo_balanced_1k.json`.

Un detalle tecnico relevante: el autor verifico que el camino de kernels fusionados producia adaptadores con matrices `lora_B` todas a cero, matematicamente inertes aunque cargaran sin error. Por eso se uso stock `transformers` con `sdpa`, y cada adaptador publicado fue verificado con `lora_B != 0` antes de publicarse; 13 que fallaron esa comprobacion se retuvieron.

## Capacidades

- Razonamiento matematico con cadena de pensamiento comprimida a nivel extremo (L5): una unica expresion colapsada, mediana de 16 caracteres dentro de ` thinking`.
- Generacion de texto en formato conversacional de una sola vuelta.
- Soporte de formato estructurado de respuesta (` thinking... response` y `#### <answer>`).
- Capacidades multilingues: no, solo ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo agente o multi-step reasoning: no, el modelo esta disenado para razonamiento comprimido en una sola expresion.

## Casos de uso

- Investigacion sobre compresion de cadenas de pensamiento: el modelo permite estudiar como un razonamiento extremadamente comprimido (16 caracteres) afecta a la precision en problemas aritmeticos de varios pasos, comparandolo con niveles L1 a L4 de la misma familia.
- Ablacion de diseno de recompensa en RL (GRPO): este adaptador concreto sirve para aislar el efecto de la normalizacion `gdpo` frente a otras variantes de recompensa, y para reproducir los resultados del paper sin depender de las afirmaciones del autor.
- Evaluacion de robustez del razonamiento comprimido: permite medir la degradacion de precision al aumentar la dificultad del problema, ya que el autor indica que la precision cae mas rapido en los niveles comprimidos.
- Analisis de trade-off entre longitud de razonamiento y coste de inferencia: con cadenas de 16 caracteres, el numero de tokens generados por problema es minimo, lo que reduce la latencia y el coste por consulta.
- Reproduccion cientifica de experimentos de RLHF/GRPO: al estar publicado con configuracion completa (prompts, batch, LR, beta, recompensas), permite replicar el entrenamiento completo o variar componentes.
- Benchmark de referencia para futuros modelos de razonamiento comprimido: el 77,4% en GSM8K con decodificacion greedy y sin self-consistency sirve como punto de comparacion para otras tecnicas de compresion de CoT.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index:

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Razonamiento matematico | GSM8K (openai/gsm8k) | test | Accuracy (exact match) | 77,4% |

Condiciones de evaluacion: n=1317, decodificacion greedy, una sola vuelta, sin ejemplos y sin self-consistency. El autor advierte que la precision cae con la dificultad del problema, y que las diferencias de un par de puntos porcentuales estan dentro del ruido estadistico (intervalo de confianza del 95% de ~2,7 pp con n=1317).

## Requisitos de hardware

- El adaptador LoRA en si ocupa 0,2 GB en el repositorio, pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` completo.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada, pero para un modelo de 7B en bfloat16 se necesitan aproximadamente 14-16 GB de VRAM; con cuantizacion de 4 bits puede caber en GPUs consumer de 8-12 GB.
- GPU recomendadas: el autor entreno con 1x NVIDIA A100 80GB. Para inferencia, una RTX 4090 (24 GB) o similar es suficiente en bfloat16.
- Opciones de despliegue: dado que es un adaptador peft, se carga con `transformers` + `peft` (como muestra el codigo de uso). Tambien podria fusionarse y exportarse a GGUF para usar con llama.cpp u Ollama, aunque no se documenta en la informacion proporcionada.
- Latencia y throughput: no disponibles. Dado que las cadenas de pensamiento son de 16 caracteres, el numero de tokens generados por consulta es muy bajo, lo que sugiere una latencia reducida frente a modelos de razonamiento extenso.

## Comparativa con modelos similares

| Modelo | Tipo | Precision GSM8K | Contexto | Licencia |
|---|---|---|---|---|
| `ssurface/cot-dialect-olmo3-7b-think-grpo-gdpoonly-l5` (este) | LoRA ablation, L5, reward gdpo-only | 77,4% | No disponible | Apache 2.0 |
| `ssurface/cot-dialect-olmo3-7b-think-grpo-l5` | LoRA principal, L5, recompensa completa | No disponible en la informacion | No disponible | Apache 2.0 |
| `allenai/Olmo-3-7B-Think` (base) | Modelo completo 7B | No disponible en la informacion | No disponible | Apache 2.0 |

El autor indica que este adaptador es una ablacion y puede ser peor que el modelo principal del mismo nivel. No se dispone de comparativas con otros modelos de razonamiento comprimido fuera de la familia del autor.

## Limitaciones y advertencias

- **Ablacion, no modelo principal**: fue entrenado para responder a una pregunta concreta sobre diseno de recompensa y puede ser peor que el modelo principal del mismo nivel (`cot-dialect-olmo3-7b-think-grpo-l5`).
- **Dependencia del SFT previo**: el adaptador se entreno sobre el modelo SFT fusionado del nivel L5; cargarlo directamente sobre `allenai/Olmo-3-7B-Think` sin el adaptador SFT intermedio no reproducira el resultado declarado.
- **Dominio limitado**: entrenado y evaluado exclusivamente en problemas matematicos de palabras (GSM8K). No hay evidencia de capacidades generales de razonamiento, codigo o comprension de lenguaje natural fuera de ese dominio.
- **Degradacion con la dificultad**: la precision cae con la dificultad del problema, y la caida es mas pronunciada en los niveles comprimidos como L5.
- **Ruido estadistico**: entrenado con una sola semilla (salvo que el nombre del repo indique lo contrario); diferencias de un par de puntos porcentuales estan dentro del ruido (intervalo del 95% de ~2,7 pp con n=1317).
- **Idioma**: solo ingles. No soporta espanol ni otros idiomas.
- **Riesgo de alucinacion**: no evaluado en la informacion proporcionada; al ser un modelo de razonamiento comprimido, la expresion unica puede omitir pasos intermedios y producir errores aritmeticos dificiles de depurar.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial sin restricciones conocidas, pero el modelo es un artefacto de investigacion con fines de reproduccion cientifica.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gdpoonly-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo principal del mismo nivel: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l5
- Adaptador SFT previo requerido: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l5
- GGUF del modelo base (unsloth): https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Ficha del modelo base en LM Studio: https://lmstudio.ai/models/allenai/olmo-3-7b-think
- Citacion del trabajo: Frolov, Anatolii, "Chain-of-Thought Compression Dialects" (2026), disponible como cita BibTeX en la model card.
