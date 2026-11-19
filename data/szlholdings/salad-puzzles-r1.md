# SZLHOLDINGS/salad-puzzles-r1

## Resumen

`salad-puzzles-r1` es un adaptador LoRA desarrollado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parametros con ventana de contexto nativa de 32.768 tokens. El adaptador forma parte de un programa de entrenamiento interno denominado "Salad training program", ejecutado sobre contenedores GPU de Salad bajo una doctrina de "receipted-training" que registra recibos de energia medidos mediante NVML y Zeus.

Segun la model card del autor, el artefacto se encuentra en fase de "candidate training artifact" y no se presenta como modelo de produccion publicado. El repositorio incluye una escalera de checkpoints (50, 100, 150 y 200 pasos) junto a un directorio `final/`, y los recibos de finalizacion se almacenan en los registros de la organizacion SZLHOLDINGS en Hugging Face.

Por su naturaleza de adaptador LoRA sobre un modelo de 1.7B, el interes practico es limitado: no hay benchmarks publicados, el idioma declarado es unicamente ingles y el numero de descargas es cero en el momento de redactar esta ficha. Se trata de un artefacto de investigacion reproducible mas que de un modelo listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | No disponible (adaptador LoRA; el base tiene 1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del base Qwen3-1.7B; no confirmada para el adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base soporta GGUF/AWQ via terceros) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea la tecnica LoRA (Low-Rank Adaptation) integrada en PEFT, que congela los pesos del modelo base Qwen3-1.7B e inyecta matrices de bajo rango en las capas lineales del transformer. El modelo base Qwen3-1.7B es un decoder-only con atencion de tipo GQA, RoPE y ventana de contexto de 32.768 tokens; incorpora modos de razonamiento ("thinking") y no-thinking conmutables.

El entrenamiento se ejecuto sobre GPU de Salad bajo lo que el autor denomina "fail-closed receipted-training doctrine": registros de energia medidos con NVML y Zeus dual metering, y recibos de finalizacion almacenados en los logs de `SZLHOLDINGS/frontier-54-runs`. El repositorio expone una escalera de checkpoints (50/100/150/200) mas `final/`, lo que sugiere un entrenamiento corto por pasos y no por epocas. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplico RLHF, DPO o SFT. No hay innovaciones tecnicas declaradas (decodificacion especulativa, atencion linear, etc.).

## Capacidades

- Generacion de texto en ingles, heredada del base Qwen3-1.7B.
- Razonamiento con modo "thinking" conmutable (capacidad del base, no verificada tras el ajuste LoRA).
- Generacion de codigo y matematicas basicas (capacidad del base, no verificada).
- Soporte de tool calling / function calling (capacidad del base, no verificada).
- Capacidades multilingues limitadas: el adaptador declara unicamente `en`.
- Sin vision, audio ni modalidades adicionales.
- Capacidades especificas del ajuste "salad-puzzles": no documentadas en la model card.

## Casos de uso

- Investigacion reproducible de LoRA: el repositorio incluye la escalera completa de checkpoints (50/100/150/200) y `final/`, lo que permite estudiar la evolucion del adaptador paso a paso y comparar estados intermedios con el base sin ajuste.
- Auditoria de procedencia ("receipted training"): util para equipos que necesitan verificar recibos de energia y finalizacion de un entrenamiento, ya que los recibos se almacenan en `SZLHOLDINGS/frontier-54-runs`.
- Experimentacion con Qwen3-1.7B en entornos con VRAM limitada: al ser un adaptador LoRA sobre un base de 1.7B, se puede cargar en GPU consumer (por ejemplo RTX 3060 12 GB o RTX 4090) con cuantizacion del base y fusion del adaptador.
- Fine-tuning adicional sobre el adaptador: la licencia Apache 2.0 y el formato PEFT permiten seguir entrenando o fusionar el adaptador con el base para tareas en ingles.
- Prototipado de pipelines de generacion de texto en ingles con `transformers` + PEFT, sin necesidad de servir un modelo de mayor tamano.
- Estudio de tecnicas de bajo rango: el adaptador sirve como referencia para comparar hiperparametros LoRA (rango, alpha, modulos objetivo) sobre un base pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; como referencia, el base Qwen3-1.7B en FP16 requiere aproximadamente 3,4 GB de pesos, y en cuantizacion 4-bit (GGUF Q4_K_M) aproximadamente 1,1-1,3 GB. El adaptador LoRA anade una fraccion pequena (del orden de decenas de MB en safetensors, dado el tamano de repo de 0,6 GB que incluye todos los checkpoints).
- GPU recomendadas: no especificadas por el autor. Cualquier GPU consumer con al menos 6-8 GB de VRAM deberia poder cargar el base en FP16; una RTX 3060 12 GB, RTX 4070 o RTX 4090 son suficientes. Para servir en produccion, A10G o L4 son alternativas habituales para modelos de 1.7B.
- Cabe en GPU consumer: si, siempre que se use el base Qwen3-1.7B con cuantizacion o FP16.
- Opciones de despliegue: `transformers` + PEFT (carga del adaptador), llama.cpp / Ollama (tras fusionar y convertir el adaptador), vLLM (soporte de LoRA en runtime), TGI (soporte de adaptadores LoRA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `SZLHOLDINGS/salad-puzzles-r1` | Adaptador LoRA sobre 1.7B | 32.768 (base) | Apache 2.0 | Safetensors (PEFT) | Sin benchmarks, 0 descargas, solo ingles |
| Qwen/Qwen3-1.7B (base) | 1.7B | 32.768 | Apache 2.0 | Safetensors, GGUF (via terceros) | Modelo base oficial con benchmarks publicados |
| Adaptadores LoRA genericos sobre Qwen3-1.7B | Variable | 32.768 (base) | Segun autor | Safetensors (PEFT) | Depende del autor; sin garantias de calidad |

No se dispone de datos de rendimiento del adaptador para comparar con alternativas de la misma tarea.

## Limitaciones y advertencias

- Artefacto de entrenamiento candidato: el autor indica explicitamente que no es un modelo de produccion publicado.
- Sin benchmarks publicados: no hay evidencia de mejora sobre el base Qwen3-1.7B.
- Solo ingles: el adaptador declara `en` como unico idioma; no se garantiza comportamiento multilingue.
- Riesgo de alucinacion: inherente a modelos de 1.7B; el ajuste LoRA no documenta mitigaciones.
- Sesgos conocidos: no documentados en la model card; se heredan los del base Qwen3-1.7B.
- Cero descargas y cero likes: no hay validacion comunitaria ni reportes de uso.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del base Qwen3-1.7B (tambien Apache 2.0) y los terminos del programa Salad.
- Trazabilidad: los recibos de entrenamiento viven en `SZLHOLDINGS/frontier-54-runs`; sin acceso a esos logs no se puede auditar el proceso.
- Contexto: la ventana de 32.768 tokens es la del base; no se confirma que el adaptador la preserve tras el ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-puzzles-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Organizacion del autor: https://huggingface.co/SZLHOLDINGS
- Logs de entrenamiento (referenciados en la model card): https://huggingface.co/SZLHOLDINGS/frontier-54-runs
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Repositorio PEFT: https://github.com/huggingface/peft
