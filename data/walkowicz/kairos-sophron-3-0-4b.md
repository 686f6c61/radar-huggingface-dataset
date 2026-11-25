# Walkowicz/kairos-sophron-3.0-4b

## Resumen

Kairos Sophron 3.0 · 4B es un modelo de decisión especializado en ingeniería de software, desarrollado por Walkowicz y afinado a partir de `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16`. Su propósito no es la generación de texto generalista, sino la producción de parches de código deterministas y verificables, con un foco explícito en código limpio y verificación de ejecución. El modelo se distribuye con licencia Apache 2.0 y está pensado para entornos de desarrollo donde la precisión del parche importa más que la fluidez conversacional.

Técnicamente se apoya en la arquitectura del modelo base de NVIDIA (Dory 1.0, 4B) e incorpora enrutamiento de profundidad recurrente con valores de `k ∈ {1, 2, 4}`, así como un proceso de ajuste en dos fases denominado "Two-Phase Zero-Distillation Engine": LoRA SFT seguido de GRPO con RLVR (reward verificado por ejecución). El resultado es un modelo bilingüe inglés/portugués de Brasil que, según el autor, supera a baselines de 14B en generación de parches deterministas en escenarios reales.

El modelo es relevante por su enfoque en eficiencia: ocupa 2,84 GB en cuantización Q5_K_M y 2,14 GB en UD-Q3, lo que permite su despliegue en hardware de consumo. Se publica con artefactos GGUF, integración con Ollama y una edición MLX separada para Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base NVIDIA Nemotron Dory 1.0) con enrutamiento de profundidad recurrente (k ∈ {1, 2, 4}) |
| Parametros totales | 3.975.229.440 (~4B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M, UD-Q3, BF16 (mencionadas en la model card) |
| Idiomas soportados | inglés (en), portugués de Brasil (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX (edición separada) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16`, un transformer de aproximadamente 4B parámetros. Sobre esa base, el autor aplica una "Two-Phase Zero-Distillation Engine": una primera fase de LoRA SFT y una segunda de GRPO con RLVR (Reinforcement Learning with Verifiable Rewards), donde la recompensa se obtiene verificando la ejecución del código generado. Esta combinación busca alinear el modelo hacia parches que no solo sean sintácticamente correctos, sino funcionalmente válidos.

La innovación destacada es el enrutamiento de profundidad recurrente con `k ∈ {1, 2, 4}`, que permite ajustar el número de pasos recurrentes en inferencia. Según la model card, `k=2` se presenta como el punto óptimo en throughput. El entrenamiento es bilingüe con una proporción declarada de 50/50 inglés y portugués de Brasil. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni detalles del proceso de RLHF/DPO más allá del esquema GRPO/RLVR.

## Capacidades

- Generación de parches de código deterministas orientados a ingeniería de software.
- Razonamiento orientado a decisiones: el modelo está etiquetado como `decision-model`, no como generador conversacional general.
- Verificación de código: entrenado con recompensas verificadas por ejecución (RLVR), lo que favorece parches ejecutables.
- Enfoque en código limpio (`clean-code`) como criterio de calidad.
- Capacidades bilingües inglés y portugués de Brasil.
- Soporte de despliegue en GGUF/Ollama y MLX (Apple Silicon).
- No se documenta en la información disponible soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.

## Casos de uso

- Generación de parches en pipelines de CI/CD: el modelo produce parches de código que pueden validarse automáticamente mediante tests, aprovechando su entrenamiento con recompensas verificadas por ejecución para reducir parches que no compilan o no pasan la suite.
- Revisión automática de código limpio: dado un fragmento, el modelo puede proponer refactorizaciones orientadas a `clean-code`, adecuado por su ajuste específico en criterios de calidad de código.
- Asistencia a desarrolladores en entornos con hardware limitado: con 2,84 GB en Q5_K_M, puede ejecutarse localmente en portátiles y estaciones de trabajo sin GPU dedicada de gama alta, integrándose en editores o CLI.
- Corrección de bugs acotados: su foco en "token blast radius" reducido (-64,4 % según el autor) lo hace adecuado para tareas donde se busca un cambio mínimo y localizado en lugar de una reescritura amplia.
- Soporte bilingüe para equipos en inglés y portugués de Brasil: útil en equipos de desarrollo lusófonos que trabajan con documentación y código en ambos idiomas.
- Despliegue en Apple Silicon: mediante la edición MLX separada, puede ejecutarse en Macs con chip Apple para tareas de generación de parches en local.
- Evaluación de parches en entornos de investigación: su esquema GRPO/RLVR y el enrutamiento de profundidad recurrente lo convierten en un caso de estudio para experimentos de RL con recompensas verificables.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del autor y no son benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K), sino evaluaciones propias.

| Metrica | Resultado |
|---|---|
| suite_v1 Clean-Code | 25/40 (62,5 %) en BF16; 24/40 en Q5_K_M; 16/40 en UD-Q3 |
| Unseen RLVR Holdout | 0,813 de recompensa media; 9/15 perfectos; -64,4 % de "token blast radius" |
| Throughput en RTX 3060 | 25,8 tok/s con k=1; 17,2 tok/s con k=2 (óptimo declarado) |
| Huella de memoria local | 2,84 GB (Q5_K_M); 2,14 GB (UD-Q3); 7,96 GB (BF16) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,84 GB en Q5_K_M, 2,14 GB en UD-Q3 y 7,96 GB en BF16, según la model card.
- GPU recomendadas: RTX 3060 es la referencia de throughput declarada por el autor (25,8 tok/s con k=1). No se especifican otras GPU en la información disponible.
- Cabe en GPU de consumo: sí, en cuantizaciones Q5_K_M y UD-Q3; el tamaño reducido permite ejecución en GPUs de gama media y en CPU.
- Opciones de despliegue: GGUF (llama.cpp), Ollama, MLX (edición separada para Apple Silicon). No se documenta soporte de vLLM ni TGI en la información disponible.
- Latencia y throughput: 25,8 tok/s con k=1 y 17,2 tok/s con k=2 en RTX 3060, según el autor; k=2 se declara como configuración óptima.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kairos Sophron 3.0 · 4B | ~4B | no disponible | Decisión y parches de código | Apache 2.0 | HF (GGUF, MLX, safetensors) |
| NVIDIA Nemotron Dory 1.0 4B (base) | ~4B | no disponible | Modelo base generalista | no disponible en esta ficha | HF |
| Alternativas de 14B citadas por el autor | ~14B | no disponible | Generación de parches | no disponible | no disponible |

La model card afirma que el modelo supera a baselines de 14B en generación de parches deterministas, pero no se identifican en la información disponible los modelos concretos comparados ni sus resultados detallados.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo bilingüe entrenado con datos de código, puede heredar sesgos del corpus de entrenamiento y del modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede producir parches plausibles pero incorrectos; el autor mitiga esto con verificación por ejecución, pero no elimina el riesgo en producción.
- Limitaciones de contexto e idioma: solo se declaran inglés y portugués de Brasil; no se especifica la longitud de contexto, lo que impide evaluar su idoneidad para repositorios grandes.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base NVIDIA y de los datos de entrenamiento, no detalladas en la información disponible.
- Caveats para producción: el modelo está orientado a decisiones y parches, no a conversación general; los benchmarks son propios del autor y no verificados de forma independiente. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica adopción nula y ausencia de validación comunitaria.
- El rendimiento en cuantizaciones bajas cae de forma notable: UD-Q3 obtiene 16/40 frente a 24/40 en Q5_K_M y 25/40 en BF16.

## Enlaces

- Hugging Face: https://huggingface.co/Walkowicz/kairos-sophron-3.0-4b
- Edición MLX: https://huggingface.co/Walkowicz/kairos-sophron-3.0-4b-mlx
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Artefacto GGUF Q5_K_M: https://huggingface.co/Walkowicz/kairos-sophron-3.0-4b/blob/main/Kairos-Sophron-3.0-4B.Q5_K_M.gguf
