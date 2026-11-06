# win0678/win-reax-gen-1

## Resumen

win-reax-gen-1 es un ajuste fino (fine-tune) del modelo base decisionmodels/reax-1, publicado por el usuario win0678 en Hugging Face. Se trata de un modelo de 26.085.330.160 parámetros (unos 26,1 mil millones) distribuido en formato safetensors, con un repositorio de 52,2 GB, lo que sugiere pesos en BF16. El autor lo presenta como su contribución a la "REAX SN92 generalist track" (eval v5.1), una pista de evaluación orientada a modelos generalistas.

El modelo se ha entrenado mediante tres ejecuciones de LoRA de rango 16 aplicadas a todas las proyecciones de atención, atención lineal y MLP, con un learning rate de 5e-5, hasta 600 pasos y la cabeza de readout congelada. Los deltas de pesos resultantes se promediaron de forma exacta y se plegaron sobre los pesos base en BF16. La función de pérdida combina entropía cruzada sobre preguntas de decisión generadas proceduralmente por el propio autor y una penalización KL(base || modelo) sobre prompts de opción múltiple de fuentes públicas, usando la distribución de respuestas del modelo base como objetivo.

La relevancia de este modelo es limitada y muy específica: se trata de un experimento de ajuste fino sobre un modelo base poco conocido (decisionmodels/reax-1), con solo 27 descargas y ningún "like" en el momento de la consulta, sin pipeline declarado y sin idiomas especificados. Su interés principal radica en documentar una metodología concreta de fusión de LoRA y regularización KL, más que en ofrecer un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (según tags "qwen3_5" y "joint-readout"); detalles completos no disponibles |
| Parametros totales | 26.085.330.160 (≈26,1 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente BF16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (paquete "joint-readout", protocolo v3; `readout.safetensors` sin cambios respecto al base) |

## Arquitectura y entrenamiento

La arquitectura exacta no está detallada en la información disponible. Los tags del repositorio incluyen "qwen3_5", lo que sugiere una base derivada de la familia Qwen 3.5, y "joint-readout", que indica un formato de paquete con una cabeza de readout separada (`readout.safetensors`) que se mantiene idéntica a la del modelo base. El autor menciona proyecciones de "atención lineal", lo que apunta a un transformer híbrido con capas de atención lineal, aunque no se especifica la proporción ni el mecanismo concreto.

El entrenamiento consistió en tres ejecuciones LoRA independientes de rango 16 sobre todas las proyecciones de atención, atención lineal y MLP, con learning rate 5e-5 y hasta 600 pasos, manteniendo congelada la cabeza de readout. Los deltas de pesos se promediaron de forma exacta y se integraron en los pesos base BF16. La pérdida combina entropía cruzada sobre preguntas de decisión generadas proceduralmente por el autor (sin elementos de REAX, sin ítems del dev-set y sin datos personales reales) y una penalización KL contra la distribución de respuestas del modelo base sobre prompts de BoolQ, ARC, HellaSwag, GSM8K y CRUXEval. No se usaron etiquetas de esas fuentes públicas en el entrenamiento; solo sus prompts como anclas de regularización.

## Capacidades

- Generación de texto y respuesta a preguntas de decisión en formato de opción múltiple, según el objetivo declarado del ajuste ("decision questions").
- Razonamiento de tipo generalista, de acuerdo con la pista "generalist track" del autor.
- Formato de paquete "joint-readout" con cabeza de readout separada, lo que facilita sustituir o congelar dicha cabeza.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Evaluación de metodologías de fusión LoRA: el modelo sirve como referencia reproducible para estudiar el promedio exacto de deltas de tres ejecuciones LoRA y su plegado en pesos BF16, útil en investigación sobre fine-tuning eficiente.
- Regularización KL en ajuste fino: permite analizar cómo una penalización KL contra la distribución del modelo base sobre prompts públicos (BoolQ, ARC, HellaSwag, GSM8K, CRUXEval) preserva el comportamiento original mientras se adapta a un dominio nuevo.
- Clasificación y respuesta a preguntas de decisión: adecuado para tareas de elección entre opciones con contexto acotado, siempre que se valide previamente el rendimiento real, dado que no hay benchmarks publicados.
- Experimentos de congelación de cabeza de readout: el formato "joint-readout" con `readout.safetensors` intacto permite investigar el efecto de adaptar solo el cuerpo del modelo manteniendo fija la cabeza.
- Reproducción de pipelines de evaluación internos: útil para equipos que quieran replicar la pista "REAX SN92 generalist track" (eval v5.1) y comparar variantes de ajuste.
- Base para nuevos fine-tunes: al estar bajo Apache-2.0 y en safetensors, puede servir como punto de partida para ajustes posteriores con licencia permisiva, verificando antes la calidad del modelo base subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,1 B de parámetros, en BF16 se requieren aproximadamente 52 GB de VRAM (coincide con el tamaño del repo); en FP8/INT8, unos 26 GB; en cuantización de 4 bits, alrededor de 13-15 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16 sin cuantizar; A100 40 GB o L40S 48 GB para FP8/INT8; RTX 4090 24 GB solo con cuantización de 8 bits o inferior y posible descarga parcial a CPU.
- ¿Cabe en GPU de consumo? En 4 bits podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB); en BF16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: al ser safetensors, es compatible con vLLM, TGI y transformers; para cuantización ligera, llama.cpp u Ollama requerirían conversión a GGUF, no disponible en el repositorio. El formato "joint-readout" con cabeza separada puede requerir código específico del modelo base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| win-reax-gen-1 | 26,1 B | no disponible | Apache-2.0 | Hugging Face (27 descargas) | Fine-tune LoRA de decisionmodels/reax-1; sin benchmarks |
| decisionmodels/reax-1 (base) | no disponible | no disponible | no disponible en la información | Hugging Face | Modelo base del que deriva; revisión ca2a0cc5 |
| Qwen 3.5 (familia referenciada por el tag) | varía según variante | no disponible | no disponible en la información | Hugging Face | Solo se infiere por el tag "qwen3_5"; no confirmado |

No se dispone de datos suficientes para comparar rendimiento, contexto o benchmarks con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que no debe asumirse un rendimiento competitivo sin evaluación propia.
- Modelo base poco documentado: decisionmodels/reax-1 no tiene información pública detallada en la documentación proporcionada (contexto, idiomas, arquitectura exacta).
- Idiomas no declarados: no se puede garantizar un comportamiento correcto fuera del inglés, idioma predominante en las fuentes de los prompts de anclaje (BoolQ, ARC, HellaSwag, GSM8K, CRUXEval).
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de evaluación no puede acotarse.
- Sesgos: no documentados por el autor; las fuentes de prompts de anclaje (BoolQ, ARC, HellaSwag) pueden introducir sesgos de dominio que no se han analizado.
- Licencia Apache-2.0: permite uso comercial, pero el autor indica que `NOTICE` y `LICENSE` son los del modelo base y que los cambios propios están en `MODIFICATIONS.md`; conviene revisar dichos archivos antes de un despliegue comercial.
- Formato no estándar: el paquete "joint-readout" (protocolo v3) con `readout.safetensors` separado puede no ser compatible directamente con herramientas estándar de inferencia sin adaptación.
- Madurez: 27 descargas y 0 "likes" indican un modelo experimental sin validación comunitaria; no recomendado para producción sin pruebas exhaustivas.

## Enlaces

- Hugging Face: https://huggingface.co/win0678/win-reax-gen-1
- Modelo base: https://huggingface.co/decisionmodels/reax-1
- Repositorio del autor (referencia en la model card): no disponible
- Paper, blog o demo: no disponibles en la información proporcionada
