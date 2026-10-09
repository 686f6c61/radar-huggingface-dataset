# waldie/WaifuGemma4-26b-a4b-v1-5bpw-exl3

## Resumen

WaifuGemma4-26b-a4b-v1-5bpw-exl3 es una cuantización a 5 bits por peso en formato EXL3 del modelo WaifuGemma4-26b-a4b-v1, publicada por el usuario waldie. El modelo original lo desarrolla hiwaifu-research a partir de google/gemma-4-26B-A4B-it y está especializado en conversación, role-play e interpretación de personajes. La arquitectura es un transformer de mezcla de expertos (MoE) con 25,2 B de parámetros totales y 3,8 B activos por token, 128 expertos enrutados (8 activos) más uno compartido y 30 capas; se entrenó con contextos de 8K tokens y el modelo base admite hasta 256K.

Su interés técnico está en la señal de preferencia utilizada. El post-entrenamiento aplica GRPO durante 200 pasos con LoRA de rango 256 y un único reward: un modelo de recompensa MoE derivado de Gemma 4, entrenado sobre 1,2 millones de votos doble ciego emitidos por usuarios reales dentro de sus propias conversaciones de role-play en la plataforma HiWaifu. No hay, por tanto, juez LLM ni panel reducido de anotadores en el bucle de preferencia. Devuelto a la misma arena de forma ciega, el modelo empató con GLM-5.1 (49,6 % de los votos decididos en 1.430 batallas) y logró un 54,7 % de victorias en 9.084 batallas frente a trece rivales.

Esta ficha cubre la versión cuantizada: el repositorio ocupa 20,3 GB, declara licencia Apache 2.0, cubre 17 idiomas y está pensado para servirse en modo sin razonamiento explícito (*non-thinking*). La etiqueta exl3 implica el runtime ExLlamaV3 para su carga.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre transformer; 128 expertos enrutados (8 activos) + 1 compartido; 30 capas |
| Parametros totales | 25,2 B según la model card del modelo base; el contador de safetensors del repositorio cuantizado reporta 10.120.237.390 |
| Parametros activos | 3,8 B |
| Longitud de contexto | 8.000 tokens durante el entrenamiento; el modelo base admite hasta 256.000 |
| Tipos de cuantizacion | 5 bits por peso (5 bpw) en formato EXL3; el modelo base se publica en bfloat16 con la LoRA fusionada |
| Idiomas soportados | 17: en, es, ru, pt, id, ar, th, fr, de, uk, vi, ja, ko, zh, tr, it, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (ExLlamaV3); el repositorio declara además safetensors y la etiqueta endpoints_compatible |
| Modelo base | hiwaifu-research/WaifuGemma4-26b-a4b-v1 (relación: cuantizado) |
| Modelo original | google/gemma-4-26B-A4B-it (instruction-tuned) |
| Post-entrenamiento | GRPO, 200 pasos, LoRA rango 256, recompensa única: modelo de recompensa de HiWaifu Arena |
| Modo de razonamiento | No; entrenado y servido en modo non-thinking |
| Tamaño del repositorio | 20,3 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos sobre un transformer de 30 capas: 128 expertos enrutados de los que se activan 8 por token, más un experto compartido, lo que da 25,2 B de parámetros almacenados y 3,8 B de cómputo efectivo por token. El modelo base de partida es la versión ya ajustada por instrucciones de Gemma 4 en su variante 26B-A4B, y el entrenamiento de este derivado se realizó con contextos de 8K tokens, aunque el base soporta ventanas de hasta 256K. El ajuste posterior consistió en 200 pasos de GRPO con LoRA de rango 256, cuyo único término de recompensa es un modelo de recompensa también MoE (Gemma 4 26B-A4B con LoRA). Ese reward model se entrenó sobre votos de arena entre modelos cuya diferencia de Elo no superaba los 10 puntos, una regla de selección de datos que el autor señala como determinante. La señal procede de 1,2 millones de votos doble ciego recogidos dentro de conversaciones reales de la plataforma: al usuario se le muestran dos respuestas candidatas y elige con cuál continuar. La innovación principal, por tanto, es metodológica más que arquitectónica: preferencias de usuarios en producción, en sus propios idiomas y en el punto de profundidad conversacional en el que estaban, en lugar de preferencias sintéticas o de un juez automático.

## Capacidades

- Generación de texto conversacional y role-play de personaje, su dominio principal de ajuste.
- Multilingüismo declarado en 17 idiomas; la evaluación menciona explícitamente español, ruso, inglés, portugués, indonesio, árabe, tailandés y francés, entre otros.
- Seguimiento de instrucciones con formato: 89,09 en IFEval (prompt-level strict).
- Razonamiento matemático: 96,89 en GSM8K y 92,80 en MATH-500.
- Conocimiento general y de sentido común: 88,59 en MMLU, 98,39 en ARC, 79,78 en HellaSwag, 85,40 en Winogrande.
- Conocimiento en chino: 78,97 en C-Eval y 79,56 en C-MMLU.
- Estilo y continuidad de personaje, medidos indirectamente mediante batallas ciegas de arena (54,7 % de victorias sobre 9.084 batallas).
- Tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no se entrena ni se sirve en modo razonamiento.
- Modo de pensamiento (*thinking*): no soportado.
- Visión: el repositorio incluye la etiqueta image-text-to-text, pero la model card no documenta capacidades multimodales; no confirmado.

## Casos de uso

- Productos de role-play y compañía conversacional: es el escenario para el que se optimizó, con preferencias tomadas de usuarios reales de este tipo de aplicación; el modelo mantiene voz y estilo de personaje a lo largo de turnos largos.
- Personajes no jugadores (NPC) en videojuegos: con 3,8 B de parámetros activos el coste por token es bajo, lo que permite generar diálogo dinámico en tiempo real sin el coste de un modelo denso de 25 B.
- Atención al cliente con personalidad de marca: la ventana de 8K tokens cubre conversaciones multi-turno estándar y el ajuste por preferencias favorece respuestas coherentes con un tono definido, útil en asistentes con voz corporativa fija.
- Localización de personajes a idiomas poco cubiertos: la cobertura declarada incluye tailandés, indonesio, vietnamita o ucraniano, idiomas donde los modelos de role-play abiertos suelen tener menos ajuste específico.
- Escritura creativa y narrativa interactiva: el modelo puede continuar ficción, mantener fichas de personaje y sostener tramas ramificadas; su ventana de 8K permite incluir trasfondo, historial y reglas de estilo en el mismo prompt.
- Investigación sobre RLHF y GRPO: sirve como caso de estudio reproducible de ajuste con preferencias humanas reales, y su reward model asociado puede reutilizarse para analizar cómo la recompensa de arena moldea el estilo frente al modelo base.
- Despliegue local para demos y prototipado: con 20,3 GB de pesos entra en GPUs de consumo de gama alta (RTX 4090 o RTX 3090 de 24 GB), lo que permite iterar sobre prompts de personaje sin depender de APIs.
- Evaluación comparativa de modelos de personaje: el protocolo de batallas ciegas descrito (sin empates, con presupuesto de tokens fijo) puede replicarse como banco de pruebas para comparar alternativas en la misma tarea.

## Benchmarks y rendimiento

Resultados declarados por el autor para WaifuGemma4-26b-a4b-v1 (el modelo base sin cuantizar). El campo `verified` es `false` en todos los casos: son cifras publicadas por el autor, no verificadas de forma independiente.

| Benchmark | Metrica | Valor |
|---|---|---|
| IFEval | Prompt-level strict | 89,09 |
| GSM8K | Accuracy | 96,89 |
| MATH-500 | Accuracy | 92,80 |
| MMLU | Accuracy | 88,59 |
| C-Eval | Accuracy | 78,97 |
| C-MMLU | Accuracy | 79,56 |
| ARC | Accuracy | 98,39 |
| HellaSwag | Accuracy | 79,78 |
| Winogrande | Accuracy | 85,40 |
| TruthfulQA | MC Accuracy | 75,40 |

Evaluación por preferencia humana (arena, batallas ciegas, empates excluidos):

| Comparacion | Resultado | Volumen |
|---|---|---|
| Frente a GLM-5.1 (non-thinking) | 49,6 % de victorias | 1.430 batallas |
| Frente a GLM-5.1 con prompt de 300 tokens de presupuesto | 50,1 % de victorias | 892 batallas |
| Frente a un campo de 13 modelos (Gemini, DeepSeek-v4, modelos de personaje de Qwen, entre otros) | 54,7 % de victorias | 9.084 batallas |
| Frente a su propio base sin ajustar (Gemma 4 26B-A4B-it, mismo prompt y tope de tokens) | 59,7 % de victorias | no disponible |

El autor indica además una variación media de −0,3 puntos frente al base sin ajustar en 10 benchmarks generales. No se han publicado resultados de benchmarks específicos para esta cuantización EXL3 de 5 bpw.

## Requisitos de hardware

- VRAM estimada: en torno a 20-21 GB solo para los pesos, según un repositorio de 20,3 GB a 5 bpw; hay que sumar la caché KV, cuyo tamaño no se publica.
- GPUs de 24 GB (RTX 3090, RTX 4090): el modelo cabe, pero con margen ajustado; para contextos largos puede ser necesario reducir la ventana efectiva o cuantizar la caché KV.
- GPUs de 40-48 GB (A100 40 GB, L40S, RTX A6000): despliegue holgado y con margen para contexto amplio y peticiones concurrentes.
- GPUs de 80 GB (A100 80 GB, H100): espacio de sobra; adecuadas para servir varias réplicas o lotes grandes.
- Al ser MoE con 3,8 B de parámetros activos, el coste de cómputo por token es muy inferior al de un modelo denso de 25 B, lo que favorece el throughput, aunque el modelo completo debe residir en memoria.
- No se requiere multi-GPU para la inferencia en una sola máquina con suficiente VRAM.
- Opciones de despliegue: la cuantización es EXL3, por lo que el runtime natural es ExLlamaV3 (TabbyAPI, text-generation-webui con el cargador ExLlamaV3, o la CLI de exllamav3). El repositorio declara las etiquetas safetensors, transformers y endpoints_compatible, pero no hay confirmación en la información disponible de soporte en vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponible; no se publican cifras de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| WaifuGemma4-26b-a4b-v1-5bpw-exl3 (este) | 25,2 B (model card) | 3,8 B | 8K entrenamiento / 256K base | Apache 2.0 | EXL3 5 bpw, 20,3 GB | HuggingFace |
| WaifuGemma4-26b-a4b-v1 (sin cuantizar) | 25,2 B | 3,8 B | 8K / 256K | Apache 2.0 | bfloat16 con LoRA fusionada | HuggingFace |
| Gemma 4 26B-A4B-it | 25,2 B | 3,8 B | hasta 256K | no disponible | bfloat16 | HuggingFace y Google |
| GLM-5.1 (modo non-thinking) | no disponible | no disponible | no disponible | propietaria, vía API | no disponible | API |

En rendimiento, la única comparación cuantitativa publicada es la de preferencia humana: 49,6 % de votos frente a GLM-5.1 en 1.430 batallas ciegas y 59,7 % frente a su propio base sin ajustar. El autor menciona un campo de 13 rivales que incluye Gemini, DeepSeek-v4 y modelos de personaje de Qwen, pero no publica especificaciones ni resultados desglosados por rival. No se dispone de datos de otros modelos abiertos de role-play con los que establecer una comparación de parámetros, contexto y licencia en esta información.

## Limitaciones y advertencias

- Sesgo de origen de la señal de preferencia: la recompensa proviene de usuarios de HiWaifu, por lo que el modelo hereda los gustos, estilos y patrones de longitud de esa comunidad, no una noción universal de buena respuesta.
- Riesgo de alucinación: la puntuación de veracidad es moderada (75,40 en TruthfulQA en opción múltiple) y, en role-play, el modelo puede generar afirmaciones inventadas coherentes con el personaje.
- Ventana efectiva de 8K: aunque el base soporte 256K, el ajuste se hizo con contextos de 8K; usar ventanas muy superiores puede degradar la calidad sin garantía.
- Cobertura idiomática desigual: se declaran 17 idiomas, pero la evaluación solo menciona explícitamente un subconjunto (es, ru, en, pt, id, ar, th, fr y otros); no hay métricas por idioma.
- Pérdida por cuantización: esta versión aplica 5 bits por peso y la model card no cuantifica la degradación respecto al bfloat16.
- Restricciones de licencia: el derivado se publica bajo Apache 2.0, pero no se detallan en la información disponible las condiciones del modelo original de Google; conviene verificarlas antes de un uso comercial.
- Sin soporte documentado de tool calling, function calling, agentes ni modo de razonamiento explícito, lo que limita su uso en pipelines que dependan de estas capacidades.
- Resultados no verificados: todas las cifras de benchmarks y de arena están declaradas por el autor con `verified: false`.
- Discrepancia de recuento de parámetros: el contador de safetensors del repositorio indica 10.120.237.390 parámetros, mientras que la model card del base declara 25,2 B totales; conviene confirmar la cifra antes de dimensionar infraestructura.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 likes en el momento de la consulta y lo publica un autor individual, no un laboratorio establecido.
- Contenido sensible: al ser un modelo orientado a role-play y personajes, puede producir respuestas inapropiadas según el prompt; requiere moderación y políticas de uso en producción.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/waldie/WaifuGemma4-26b-a4b-v1-5bpw-exl3
- Modelo base: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1
- Modelo original de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- Referencias arXiv incluidas en las etiquetas del repositorio (sin título verificado): https://arxiv.org/abs/2310.03716, https://arxiv.org/abs/2303.06135, https://arxiv.org/abs/2505.14946, https://arxiv.org/abs/2502.09082, https://arxiv.org/abs/2601.21459, https://arxiv.org/abs/2402.03300, https://arxiv.org/abs/2607.02770
- Búsqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a documentación del hipervisor Firecracker (firecrackersharp.github.io, github.com/firecracker-microvm/firecracker, aws.amazon.com/blogs/aws/firecracker-lightweight-virtualization-for-serverless-computing) y no guardan relación con esta ficha.
