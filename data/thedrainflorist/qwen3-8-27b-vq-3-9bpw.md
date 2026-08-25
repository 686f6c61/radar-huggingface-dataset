# TheDrainFlorist/Qwen3.8-27B-VQ-3.9bpw

## Resumen

TheDrainFlorist/Qwen3.8-27B-VQ-3.9bpw es una cuantización vectorial (VQ) del modelo Qwen3.8-27B, desarrollada por TheDrainFlorist específicamente para Apple Silicon. El modelo base, Qwen3.8-27B, es un transformer denso de 27 mil millones de parámetros con atención híbrida (solo 16 de 64 capas usan atención completa) y capacidades nativas de visión-lenguaje. Esta build reduce el tamaño del checkpoint a 12,5 GiB mediante cuantización vectorial de los MLP (3,25 bits por peso) y 8 bits para el resto, manteniendo una divergencia KL de 85,8 millinats respecto al profesor bf16, con un 86,1% de acuerdo top-1. Es la build más pequeña que el autor recomienda para uso real, y está diseñada para ejecutarse con `mlx-lm` sin parches, con una memoria residente de aproximadamente 11,61 GiB, lo que permite su uso en equipos con 16 GB de RAM unificada.

La relevancia de este modelo radica en que ofrece una alternativa de alta calidad para inferencia local en hardware Apple, donde las cuantizaciones MLX son escasas para esta familia de modelos. El autor compara su build VQ con conversiones afines propias (q2, q3, q4, q6, q8) y demuestra que, a 3,9 bpw, supera claramente a la afina q3 en divergencia KL (85,8 frente a 187,8 millinats) con solo 0,6 GiB más, aunque pierde algo de calidad frente a la q4 (45,8 millinats) a cambio de ahorrar 2,5 GiB. No se han publicado mediciones de throughput ni resultados en suites de tareas para este artefacto concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (Qwen3.8-27B), cuantizacion vectorial (VQ) en MLP |
| Parametros totales | 27 mil millones (modelo base Qwen3.8-27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | VQ: 3,25 bits/peso en MLP (d=4, K=4096, codebook fp16), resto 8 bits; nominal 3,9 bpw |
| Idiomas soportados | Ingles (segun model card y tags) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con runtime MLX integrado (model.py) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 mil millones de parametros con una arquitectura de atencion hibrida: de sus 64 capas, solo 16 ejecutan atencion completa (con un intervalo de 4), mientras que las otras 48 utilizan un mecanismo de atencion mas ligero. Esta arquitectura, compartida con el modelo MoE Qwen3.5 de 2,4 billones de parametros, reduce el coste computacional manteniendo la capacidad de modelado. El modelo base es nativamente multimodal (vision-lenguaje) e incluye una torre de vision de 0,859 GiB que se conserva en esta build.

La cuantizacion vectorial se aplica exclusivamente al trio de MLP densos. Cada subvector de 4 pesos se codifica con un indice de 12 bits en un codebook fp16 de 4096 entradas por tensor, con una escala fp16 por cada (fila, 64 pesos), resultando en 3,25 bits por peso en la superficie cuantizada. El resto de tensores se cuantizan a 8 bits. Los codebooks se ajustan mediante k-means en el espacio de pesos puro, sin usar hessiana, estadisticas de activacion ni corpus de calibracion. El ajuste no esta seedeado, por lo que el artefacto es reproducible en receta y geometria pero no bit a bit. No hay entrenamiento adicional; es una cuantizacion post-entrenamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.8-27B.
- Razonamiento paso a paso y resolucion de problemas matematicos (el modelo base esta evaluado en MathVision con prompt de razonamiento).
- Generacion de codigo y mejora en tareas de productividad de oficina, segun las capacidades del modelo base.
- Capacidades de vision-lenguaje: la torre de vision bf16 (0,859 GiB) se incluye en el checkpoint, aunque no se han medido tareas de vision en esta build.
- Soporte de tool calling y function calling: no se menciona explicitamente, pero el modelo base Qwen3.8 soporta estas capacidades; no hay confirmacion para esta cuantizacion.
- Capacidades multilingues: el modelo base soporta multiples idiomas, pero esta build solo declara ingles en su model card.

## Casos de uso

- Inferencia local en Apple Silicon: el caso principal. Con 11,61 GiB de memoria residente, puede ejecutarse en Macs con 16 GB de RAM unificada usando `mlx-lm`, ideal para desarrollo y prototipado sin conexion.
- Asistente de codigo en entornos offline: dado que el modelo base destaca en generacion de codigo, esta build permite ejecutar un asistente de programacion en una Mac sin depender de APIs externas, con una ventana de contexto razonable (aunque no se especifica la longitud).
- Chat conversacional para aplicaciones de escritorio: al ser una cuantizacion ligera, puede integrarse en aplicaciones locales de chat o agentes conversacionales que requieran privacidad y baja latencia.
- Educacion e investigacion: util para experimentar con cuantizacion vectorial y comparar su rendimiento frente a cuantizaciones afines, ya que el autor proporciona metricas detalladas de divergencia KL y acuerdo top-1.
- Generacion de contenido asistida: redaccion de textos, resumenes o traducciones (aunque solo se declara ingles) en entornos sin conexion.
- Prototipado de agentes con razonamiento multi-paso: el modelo base tiene capacidades de razonamiento, y esta build permite probar flujos de agente en hardware local antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card proporciona mediciones propias comparando esta build VQ con conversiones afines del mismo autor (no con artefactos de terceros). Se evaluo contra el profesor bf16 en el mismo corpus con `mlx-lm` sin modificar. Los resultados son:

| Build | Tamano | KL a bf16 (mnats/tok) | Acuerdo top-1 | Perplexidad |
|---|---|---|---|---|
| Afina q2 (propia) | 8,69 GiB | 1426,9 | 46,1% | 16,435 |
| Afina q3 (propia) | 11,82 GiB | 187,8 | 79,5% | 5,832 |
| **Este modelo (VQ 3.9 bpw)** | **12,47 GiB** | **85,8** | **86,1%** | **5,229** |
| Afina q4 (propia) | 14,95 GiB | 45,8 | 89,8% | 5,206 |
| Afina q6 (propia) | 21,21 GiB | 3,71 | 96,8% | 5,260 |
| Afina q8 (propia) | 27,48 GiB | 1,25 | 98,5% | 5,241 |
| bf16 | 51,7 GiB | 0 | 100% | — |

El autor advierte que la perplexidad apenas varia entre builds (5,19-5,35) y no es un indicador fiable para esta familia; la divergencia KL es la metrica adecuada. No se han publicado resultados en suites de tareas estandar (MMLU, HumanEval, GSM8K) para este artefacto.

## Requisitos de hardware

- Memoria: aproximadamente 11,61 GiB de RAM unificada en tiempo de ejecucion (el checkpoint en disco ocupa 12,47 GiB, pero la torre de vision no se carga con `mlx-lm`). Se recomienda un equipo con 16 GB de RAM unificada como minimo.
- GPU: cualquier chip Apple Silicon (M1, M2, M3 o superiores) con suficiente memoria unificada. No requiere GPU discreta.
- Compatibilidad: funciona con `mlx-lm` sin parches; el runtime VQ se incluye en el checkpoint como `model.py`.
- Despliegue: se ejecuta con `python -m mlx_lm generate --model TheDrainFlorist/Qwen3.8-27B-VQ-3.9bpw --prompt "..." --max-tokens 512`.
- Latencia y throughput: no medidos en este artefacto; el autor no proporciona cifras.

## Comparativa con modelos similares

La comparativa mas directa es con las conversiones afines del mismo autor, ya que no existen otras cuantizaciones MLX publicadas de Qwen3.8-27B. Frente a otros modelos cuantizados para Apple Silicon, no hay datos suficientes. La tabla anterior muestra la comparacion con las builds afines. En terminos de calidad por GiB, esta build VQ ofrece un equilibrio notable: duplica la calidad de la afina q3 con solo 0,6 GiB mas, y se acerca a la afina q4 (85,8 vs 45,8 millinats) ahorrando 2,5 GiB. Por encima de ~5 bpw, la cuantizacion afina supera a la VQ, por lo que esta build es optima en el rango de 3-4 bpw.

## Limitaciones y advertencias

- No se han medido throughput ni resultados en suites de tareas estandar (MMLU, HumanEval, etc.) para este artefacto; las unicas metricas son las del autor sobre divergencia KL y acuerdo top-1.
- La perplexidad no es un indicador fiable para esta familia de modelos; puede inducir a error si se usa como unica metrica.
- Los comparadores afines son conversiones propias del autor, no artefactos de la comunidad, lo que debilita la evidencia comparativa.
- La cuantizacion VQ pierde ventaja frente a la afina por encima de ~5 bits por peso; esta build esta disenada para el rango bajo de bits.
- El ajuste de codebooks no esta seedeado, por lo que el artefacto no es bit a bit reproducible, aunque la receta y geometria si lo son.
- Solo se declara soporte para ingles; las capacidades multilingues del modelo base no estan confirmadas en esta build.
- No se especifica la longitud de contexto soportada tras la cuantizacion; se desconoce si hay degradacion respecto al modelo base.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TheDrainFlorist/Qwen3.8-27B-VQ-3.9bpw
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Pagina de QwenCloud para Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
- Benchmarks y velocidad (BenchLM): https://benchlm.ai/models/qwen3-8-27b
- Documentacion de vLLM Ascend para Qwen3.8-27B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html
