# ToPo-ToPo/Ornith-1.5-35B-A3B-MTP-bf16

## Resumen

ToPo-ToPo/Ornith-1.5-35B-A3B-MTP-bf16 es un *drafter* de predicción multi-token (MTP) para decodificación especulativa, diseñado para funcionar junto al modelo objetivo `ornith-ai/Ornith-1.5-35B-A3B` sobre Apple Silicon mediante la librería `mlx-vlm`. No es un modelo de chat independiente: sus pesos solo tienen sentido cuando se enlazan a un modelo objetivo compatible, y su función es proponer varios tokens por paso para que el modelo grande los verifique en bloque y acepte los que coincidan.

El repositorio no contiene un modelo completo, sino un subconjunto de pesos extraídos del checkpoint oficial. Concretamente, se han separado los tensores `mtp.*` del archivo `model-00016-of-00016.safetensors` (revisión `10fbf86f`) del modelo base, dando como resultado 785 tensores que, tras apilar los 256 MLP por experto en `switch_mlp`, quedan en 20 tensores. El tamaño declarado en safetensors es de 844.640.768 parámetros en bf16, con un peso de repositorio de 1,7 GB.

Su relevancia es práctica: permite acelerar la inferencia del modelo objetivo en configuraciones concretas. Según las mediciones del autor en un Apple M4 Max con 128 GB, el *drafter* aporta una mejora de 1,34x en cargas de código con el objetivo en bf16, aunque empeora el rendimiento cuando el objetivo ya está cuantizado a 4 bits. Es, por tanto, una pieza de infraestructura de inferencia más que un modelo generativo autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MTP (multi-token prediction) drafter, `model_type: qwen3_5_mtp`, con `switch_mlp` (256 MLP por experto apilados) |
| Parametros totales | 844.640.768 |
| Parametros activos | no disponible (el drafter no es un MoE completo; hereda la estructura de expertos del objetivo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en bf16 sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16), librería `mlx` |
| Block size | 3 |
| Tamano del repositorio | 1,7 GB |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B |
| Revision del checkpoint origen | 10fbf86f |

## Arquitectura y entrenamiento

El modelo es un *drafter* de predicción multi-token pensado para decodificación especulativa. Su estructura interna corresponde al tipo `qwen3_5_mtp` y conserva la organización de expertos del modelo objetivo: los 256 MLP por experto se apilan en una capa `switch_mlp`, lo que reduce el número de tensores de 785 a 20. El `block_size` es 3, es decir, el *drafter* propone hasta tres tokens por paso para que el modelo objetivo los valide de forma batcheada.

No se dispone de información sobre el proceso de entrenamiento del *drafter*: no se indican tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. Lo que sí se documenta es su procedencia: los pesos se han separado del checkpoint oficial del modelo base mediante la herramienta `mlx_vlm.speculative.drafters.qwen3_5_mtp.split` con mlx-vlm 0.7.10 y mlx 0.32.4, manteniendo la precisión bf16 sin cuantizar. La innovación técnica relevante no está en el entrenamiento, sino en el uso: la decodificación especulativa con verificación en bloque, que solo resulta rentable cuando el coste de verificación es menor que el ahorro en pasos de decodificación.

## Capacidades

- Decodificación especulativa: propone tokens candidatos que el modelo objetivo `ornith-ai/Ornith-1.5-35B-A3B` verifica en bloque.
- Predicción multi-token con `block_size: 3`.
- Integración con `mlx-vlm` en Apple Silicon mediante el flag `--draft-kind mtp`.
- Compatibilidad con objetivos en bf16 y en 4 bits, aunque con rendimiento muy distinto según el caso.
- No es un modelo de chat: no genera respuestas de forma autónoma ni mantiene conversaciones.
- No dispone de tool calling, agentes, visión, audio ni modo de razonamiento propios.
- Capacidades multilingües: no disponibles como modelo independiente; el comportamiento depende del objetivo.

## Casos de uso

- Aceleración de generación de código en local: con el objetivo en bf16, el *drafter* eleva el rendimiento de 59,4 a 79,7 tok/s en Apple M4 Max, un 1,34x, lo que resulta útil para asistentes de código que corren en estaciones de trabajo Mac.
- Reducción de latencia en tareas de autocompletado: al proponer varios tokens por paso, disminuye el número de iteraciones de decodificación en flujos interactivos donde el usuario espera respuesta inmediata.
- Evaluación de pipelines de decodificación especulativa: sirve como componente de referencia para medir tasas de aceptación y ganancia real antes de adoptar MTP en producción.
- Investigación sobre *drafters* y verificación batcheada: permite experimentar con distintos `block_size` y comparar la tasa de aceptación entre cargas de código y prosa.
- Prototipado en Apple Silicon: se integra en `mlx-vlm` con un único flag, lo que facilita probar la aceleración sin cambiar la infraestructura del modelo objetivo.
- Despliegue de inferencia en bf16 para cargas de código: es el escenario donde las mediciones muestran beneficio claro, frente a la cuantización 4 bits, donde el *drafter* penaliza.

## Benchmarks y rendimiento

Mediciones del autor en Apple M4 Max, 128 GB, mlx-vlm 0.7.10, decodificación greedy, 200 tokens:

| Objetivo | Carga | Sin MTP | Con MTP (block 3) | Aceptación |
|---|---|---|---|---|
| bf16 (`ornith-ai/Ornith-1.5-35B-A3B`) | código | 59,4 tok/s | 79,7 tok/s (1,34x) | 75,9% |
| bf16 | prosa en japonés | 61,4 tok/s | 69,1 tok/s (1,13x) | 39,6% |
| 4bit (`ToPo-ToPo/Ornith-1.5-35B-A3B-mlx-4bit`) | código | 114,2 tok/s | 103,6 tok/s (0,91x) | 69,5% |
| 4bit | prosa en japonés | 110,2 tok/s | 95,4 tok/s (0,87x) | 36,4% |

Con objetivo en 4 bits y `block_size` 2, la aceptación en código alcanza el 87,7%, pero el rendimiento sigue siendo inferior al de la decodificación simple. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada: el *drafter* ocupa 1,7 GB en bf16, además de la memoria del modelo objetivo.
- Hardware medido: Apple M4 Max con 128 GB de memoria unificada.
- GPU recomendadas: no disponible; el modelo está empaquetado para `mlx` y orientado a Apple Silicon, no a CUDA.
- Cabe en GPU de consumo: no disponible como dato verificado; el requisito real lo marca el modelo objetivo, no el *drafter*.
- Despliegue: `mlx-vlm` 0.7.10 con mlx 0.32.4, mediante `mlx_vlm.generate --draft-model ... --draft-kind mtp`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 79,7 tok/s con objetivo bf16 en código y 69,1 tok/s en prosa japonesa, según las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ToPo-ToPo/Ornith-1.5-35B-A3B-MTP-bf16 | Drafter MTP para decodificación especulativa | 844,6 M | no disponible | MIT | HuggingFace, MLX |
| ornith-ai/Ornith-1.5-35B-A3B (objetivo) | Modelo MoE A3B de 35B | 35B (A3B activos) | no disponible | MIT (según license_link) | HuggingFace |
| ToPo-ToPo/Ornith-1.5-35B-A3B-mlx-4bit | Conversión MLX cuantizada a 4 bits del objetivo | 35B (A3B activos) | no disponible | MIT | HuggingFace, MLX |
| ornith-ai/Ornith-1.5-35B-A3B-MLX-4bit | Conversión MLX 4 bits oficial | 35B (A3B activos) | no disponible | MIT | HuggingFace, MLX |

No se dispone de información sobre otros *drafters* MTP comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona enlazado al objetivo `ornith-ai/Ornith-1.5-35B-A3B`; usarlo por separado no produce respuestas válidas.
- Las conversiones MLX 4 bits del objetivo no incluyen los pesos MTP, por lo que requieren este repositorio aparte si se quiere decodificación especulativa.
- Con objetivo en 4 bits el *drafter* reduce el rendimiento (0,91x en código y 0,87x en prosa japonesa): no debe usarse en esa configuración sin medir.
- La ganancia depende del hardware, la cuantización del objetivo, la carga y la versión de mlx-vlm; las cifras del autor son de un único equipo.
- La tasa de aceptación cae en prosa japonesa (39,6% en bf16) frente a código (75,9%), lo que limita el beneficio en texto no técnico.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma propias, porque el modelo no genera contenido de forma independiente.
- Licencia MIT, sin restricciones comerciales conocidas, pero sujeta a la licencia del modelo objetivo.
- No hay datos sobre longitud de contexto ni sobre comportamiento con prompts largos.

## Enlaces

- HuggingFace: https://huggingface.co/ToPo-ToPo/Ornith-1.5-35B-A3B-MTP-bf16
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Conversión MLX 4 bits del autor: https://huggingface.co/ToPo-ToPo/Ornith-1.5-35B-A3B-mlx-4bit
- Conversión MLX 4 bits oficial: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-4bit
