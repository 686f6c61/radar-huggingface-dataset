# yushengsu/qwen3-8b-moe2x12288-2A1-dspark

## Resumen

`yushengsu/qwen3-8b-moe2x12288-2A1-dspark` (renombrado a `Qwen3-8B-5layer-MoE-2E1A`) es un modelo borrador (*draft model*) para decodificacion especulativa sobre el modelo objetivo `Qwen/Qwen3-8B`. No es un modelo de lenguaje autonomo: es un componente auxiliar que propone tokens candidatos que el modelo grande verifica en paralelo, acelerando la generacion sin alterar la distribucion de salida del modelo base. Lo desarrolla el usuario `yushengsu` con la libreria SpecForge del proyecto SGLang.

La innovacion principal reside en sustituir el FFN denso del borrador por una capa MoE de estilo Qwen3.5-MoE con 2 expertos enrutados de anchura 12288, top-1 y sin experto compartido. Cada experto tiene el mismo ancho que el FFN denso de 12288 del modelo base, lo que da 1,88 mil millones de parametros totales y 1,13 mil millones activos por token. El borrador consta solo de 5 capas de atencion completa con hidden 4096 y 32/8 cabezas, tomando estados ocultos de las capas [1, 9, 17, 25, 33] del objetivo.

El modelo es relevante para quienes despliegan Qwen3-8B en produccion y buscan reducir latencia de decodificacion mediante *speculative decoding* con un borrador mas capaz que uno puramente denso de pocas capas, manteniendo un coste de computo por token controlado gracias al enrutamiento top-1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador para decodificacion especulativa (DSpark); FFN sustituido por capa MoE Qwen3.5-MoE |
| Parametros totales | 1,88 B (por experto); total del borrador no disponible de forma explicita |
| Parametros activos | 1,13 B por token (top-1 de 2 expertos) |
| Longitud de contexto | 8192 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (exportado con `specforge export --to hf`) |

## Arquitectura y entrenamiento

El borrador emplea 5 capas de atencion completa con hidden 4096 y 32 cabezas de atencion / 8 cabezas KV. Consume los estados ocultos de las capas [1, 9, 17, 25, 33] del modelo objetivo Qwen3-8B, con un rango de Markov de 256, sin cabeza de confianza y con bloque de 16 tokens. El FFN es una capa MoE con 2 expertos enrutados de anchura 12288, seleccion top-1 y sin experto compartido; cada experto iguala la anchura del FFN denso del objetivo. El balanceo de carga usa sesgo de seleccion estilo DeepSeek (tasa 0,001) mas una perdida auxiliar *batch_wise* (coeficiente 0,005).

El entrenamiento se realizo con SpecForge (PR #1022, config `configs/qwen3-8b-moe2x12288-2A1-dspark.json`, commit `26bd18b6`) sobre un dataset PerfectBlend regenerado por Qwen3-8B a temperatura 0 en modo no-thinking, con 1.420.909 prompts por epoca, plantilla qwen3-instruct y contexto de 8192 tokens. Se ejecutaron 6 epocas con AdamW, learning rate 6e-4 con decaimiento coseno, 4 % de warm-up y grad clip 1.0. La perdida combina DSpark CE 0,1 y L1 0,9 con 512 anclas y gamma de decaimiento 7. Los estados del objetivo en BF16 se capturaron en linea con SGLang. El hardware fue un nodo de 8x H200: 2 GPUs para captura y un entrenador DDP de 6 rangos, con 132 muestras por paso de optimizador y 10.764 pasos por epoca.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Qwen3-8B; no genera texto de forma autonoma.
- Aceleracion de la decodificacion del modelo objetivo mediante verificacion paralela de propuestas en bloques de 16 tokens.
- Aprovechamiento de estados ocultos intermedios del objetivo (capas 1, 9, 17, 25, 33) para condicionar las propuestas.
- Enrutamiento MoE top-1 con dos expertos de gran anchura, pensado para mantener capacidad expresiva con computo activo reducido.
- Soporte de reanudacion de entrenamiento mediante checkpoints completos (`training_state.pt` y estados RNG por rango).
- Capacidades multilingues, tool calling, agentes o vision: no disponibles, al no ser un modelo de proposito general.

## Casos de uso

- Aceleracion de inferencia en produccion de Qwen3-8B: desplegar el borrador junto al modelo objetivo en SGLang o vLLM para reducir la latencia por token generado mediante verificacion especulativa en bloques de 16.
- Servicio de chat de baja latencia: usar el borrador para aumentar el throughput de un endpoint conversacional con Qwen3-8B, manteniendo la calidad intacta porque la distribucion final la decide el modelo objetivo.
- Generacion de codigo interactiva: en asistentes de autocompletado o IDE, la decodificacion especulativa reduce el tiempo hasta el primer token util en respuestas largas de codigo.
- Investigacion en decodificacion especulativa: el repo incluye checkpoints intermedios cada 1.000 pasos y estados completos de entrenamiento, lo que permite estudiar la evolucion de la tasa de aceptacion a lo largo del entrenamiento.
- Experimentacion con borradores MoE: comparar un borrador denso de 5 capas frente a este MoE 2E1A para medir el impacto del enrutamiento top-1 en la tasa de aceptacion.
- Reentrenamiento o ajuste del borrador: reanudar desde `raw/epoch-k/` o `raw/step-N/` con el estado de AdamW, scheduler y posicion de datos ya guardados.
- Despliegue en nodos con memoria abundante: el repo ocupa 1.836,3 GB, por lo que su uso esta orientado a entornos con almacenamiento amplio y planificacion cuidadosa de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un borrador de 1,88 B por experto, el peso en BF16 ronda los 3,8 GB por experto, aunque el repo completo ocupa 1.836,3 GB por incluir todos los checkpoints y estados de entrenamiento.
- GPU recomendadas: el entrenamiento se realizo en 8x H200; para inferencia como borrador se recomienda al menos una GPU con suficiente VRAM para alojar simultaneamente Qwen3-8B y el borrador.
- Cabe en GPU de consumo: no disponible; depende de la cuantizacion y de compartir memoria con el modelo objetivo.
- Opciones de despliegue: SGLang (integracion nativa con SpecForge) y, presumiblemente, vLLM con soporte de decodificacion especulativa; llama.cpp u Ollama no estan indicados en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-moe2x12288-2A1-dspark | 1,88 B por experto, 1,13 B activos | 8192 | Borrador MoE 2E1A para Qwen3-8B | no disponible | Hugging Face |
| Borrador denso de 5 capas para Qwen3-8B | no disponible | no disponible | Borrador denso | no disponible | no disponible |
| EAGLE-3 draft para Qwen3-8B | no disponible | no disponible | Borrador con cabeza de confianza | no disponible | no disponible |

No se dispone de datos publicos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: solo produce tokens candidatos que el modelo objetivo debe verificar; no debe usarse como generador independiente.
- Licencia no declarada en la model card: verificar los terminos antes de cualquier uso comercial.
- El repo ocupa 1.836,3 GB por incluir todos los checkpoints y estados de entrenamiento; el despliegue requiere seleccionar unicamente la carpeta del checkpoint deseado.
- El contexto de entrenamiento es de 8192 tokens; no hay evidencia de soporte para contextos mayores.
- La tasa de aceptacion del borrador depende del dominio y del modo (thinking / no-thinking) del objetivo; el entrenamiento se hizo en modo no-thinking, por lo que el rendimiento en modo thinking puede degradarse.
- No se han publicado benchmarks de tasa de aceptacion ni de speedup en la informacion disponible.
- Riesgo de sesgos y alucinaciones: al no generar texto final, estos riesgos recaen en el modelo objetivo; el borrador no los introduce por si mismo, pero tampoco los mitiga.
- El modelo esta vinculado a una version concreta de SpecForge (commit `26bd18b6`) y a Qwen3-8B como objetivo; no es portable a otros modelos sin reentrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/yushengsu/qwen3-8b-moe2x12288-2A1-dspark
- Repo renombrado: `yushengsu/Qwen3-8B-5layer-MoE-2E1A`
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- SpecForge PR #1022: https://github.com/sgl-project/SpecForge/pull/1022
- Dataset de entrenamiento: `jiapingW/Qwen3-8b-dspark-SpecForge`
