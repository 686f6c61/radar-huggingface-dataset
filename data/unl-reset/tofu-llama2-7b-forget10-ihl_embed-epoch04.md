# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch04

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch04` es un checkpoint de investigacion derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. No es un modelo de proposito general: es el resultado de un experimento de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), en su particion `forget10`, es decir, el subconjunto de datos sinteticos de autores ficticios que el modelo debe "olvidar". El checkpoint corresponde a la epoca 4 de un total de 20 de un procedimiento de desaprendizaje combinado con reinicializacion parcial de pesos.

La receta aplicada, segun la model card, es un ajuste fino con una perdida compuesta: entropia cruzada (CE) con peso 1.0 sobre el conjunto *retain* (los datos que deben conservarse) mas un termino de *token IHL* sobre el conjunto *forget*. Ademas, se reinicializan los embeddings de entrada y la cabeza LM a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan desde `locuslab/tofu_ft_llama2-7b`. El resultado es un modelo completo y autonomo (no un adaptador LoRA), con 6.738.415.616 parametros.

Su relevancia es acotada pero clara para quien investiga en privacidad de modelos y cumplimiento del derecho al olvido: proporciona un punto de comparacion reproducible dentro de la familia de metodos IHL (probablemente *Influence-based Hessian/Loss* o una variante de *unlearning* por influencia, aunque el autor no lo explicita) aplicados a TOFU. No esta pensado para uso en produccion ni para tareas genericas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), derivada de `locuslab/tofu_ft_llama2-7b` |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la base Llama 2 usa 4096 tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings posicionales rotatorios (RoPE). El checkpoint parte de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 7B sobre el dataset TOFU, y aplica sobre el un procedimiento de desaprendizaje durante 20 epocas, del cual este fichero corresponde a la epoca 4.

El entrenamiento combina dos objetivos: entropia cruzada estandar con peso 1.0 sobre el conjunto *retain* (preservar el conocimiento que debe mantenerse) y una perdida de tipo *token IHL* sobre el conjunto *forget10* (inducir el olvido). La innovacion metodologica del checkpoint es la reinicializacion de los embeddings de entrada y de la cabeza de lenguaje desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo base TOFU. Esto busca romper la asociacion entre tokens de entidades olvidadas y sus representaciones, sin destruir por completo la capacidad linguistica del modelo. El autor referencia un fichero `ihl_manifest.json` con los detalles del procedimiento, aunque su contenido no esta disponible en la informacion proporcionada. No se documentan volumen de tokens de entrenamiento, composicion exacta del dataset ni uso de RLHF o DPO en esta fase.

## Capacidades

- Generacion de texto en ingles, heredada de Llama 2 7B y del ajuste fino sobre TOFU.
- Razonamiento basico y respuesta a preguntas, en el nivel esperado de un modelo de 7B.
- Capacidad de *machine unlearning*: el checkpoint esta disenado para haber reducido el conocimiento sobre el subconjunto `forget10` de TOFU, manteniendo el rendimiento sobre `retain`.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- Multilingue limitado: la model card declara unicamente `en`.
- No dispone de modo *thinking*, vision ni audio.

## Casos de uso

- Evaluacion de metodos de *unlearning*: sirve como punto de comparacion (epoca 4 de 20) frente a otros checkpoints de la misma familia para medir la curva de olvido frente a la perdida de utilidad en TOFU.
- Investigacion en privacidad de modelos: permite estudiar si la reinicializacion de embeddings y cabeza LM reduce la memorizacion de entidades ficticias concretas del split `forget10`.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autonomo (no un adaptador), se puede cargar directamente con `transformers` para replicar las metricas del paper o del manifiesto asociado.
- Analisis de catastrophic forgetting: util para medir cuanto conocimiento general de Llama 2 se degrada tras aplicar la perdida CE sobre *retain* junto con el termino IHL.
- Auditoria de licencias y cumplimiento: caso de estudio de como un modelo derivado de Llama 2 hereda la licencia `llama2` y las obligaciones de atribucion en un pipeline de investigacion.
- Docencia y formacion: ejemplo practico de flujo de desaprendizaje sobre un benchmark estandar, adecuado para cursos de seguridad y privacidad en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 16-24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 4-5 GB de pesos.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion a gran escala; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en precision completa.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en fp16 (RTX 4080/4090, RTX 3090) y en tarjetas de 8 GB con cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` (carga directa de safetensors), vLLM y TGI para serving; llama.cpp u Ollama requeririan conversion previa a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch04` | ~6,74 B | no disponible | Unlearning TOFU (epoca 4/20) | llama2 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | ~6,74 B | no disponible | Modelo base ajustado en TOFU (sin olvido) | llama2 | HuggingFace |
| `NousResearch/Llama-2-7b-chat-hf` | ~6,74 B | 4096 tokens | Chat de proposito general | llama2 | HuggingFace |
| Llama 2 7B (original) | ~6,74 B | 4096 tokens | Modelo base de proposito general | llama2 | HuggingFace |

La comparacion relevante es con `locuslab/tofu_ft_llama2-7b` (referencia sin desaprendizaje) y con los checkpoints de otras epocas del mismo procedimiento, que permiten trazar la evolucion del olvido. No se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta validado para uso en produccion ni para tareas genericas de generacion.
- El objetivo de desaprendizaje puede no haberse alcanzado de forma completa en la epoca 4 de 20; el propio autor publica el checkpoint como un punto intermedio.
- Riesgo de alucinacion heredado de Llama 2 7B, potencialmente agravado por la perturbacion de embeddings y cabeza LM.
- Sesgos conocidos de Llama 2 (sesgos de genero, raza, religion y orientacion) presentes en los datos de preentrenamiento originales.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Restricciones de licencia: hereda la Llama 2 Community License, con obligaciones de atribucion y limitaciones de uso comercial (umbral de 700 millones de usuarios mensuales) y prohibiciones de uso ilicito.
- No se documenta el contenido de `ihl_manifest.json` ni la metodologia completa, lo que dificulta la reproduccion exacta del experimento.
- El modelo no debe utilizarse para intentar recuperar la informacion supuestamente olvidada ni para fines de *red-teaming* sobre datos personales reales.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch04
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y cabeza LM: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
