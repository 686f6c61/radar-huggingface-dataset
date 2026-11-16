# wswzjbg/deepseek-v4-flash-0731-uncensored-abliterated-refusal-directions

## Resumen

DeepSeek-V4-Flash-0731 Uncensored / Abliterated es una modificación del checkpoint DeepSeek-V4-Flash-0731 de DeepSeek que elimina la dirección de rechazo (refusal direction) mediante *activation steering* en lugar de reescribir los pesos. El autor, wswzjbg, publica un fichero de 757 KB con vectores de dirección que se aplican en tiempo de inferencia sobre el checkpoint original, de modo que la intensidad del "desabliterado" se controla con un parámetro λ ajustable en caliente vía HTTP. El checkpoint base (~157 GB) permanece intacto y auditable por sha256 frente a la release oficial.

La propuesta resuelve un problema práctico del *abliteration* convencional: la necesidad de descargar y mantener un segundo checkpoint completo (~157 GB) con el comportamiento de rechazo eliminado de forma permanente en los pesos, lo que duplica el almacenamiento (~313 GB), impide comparar ambos comportamientos en el mismo proceso y obliga a reiniciar el servidor para alternar entre versiones. Con este enfoque, λ=0 es bit-exacto al modelo original (verificado con `torch.equal`) y λ=1.5 elimina el rechazo en las pruebas del autor, con un único proceso de servidor y sin downtime.

El modelo está pensado para entornos de investigación en interpretabilidad y para despliegues que necesitan alternar entre un comportamiento alineado y uno sin restricciones de rechazo sin penalizar el rendimiento en decodificación especulativa, recuperación en contexto largo ni *tool calling*. El repo tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos no están alojados en Hugging Face y solo se distribuye el overlay de vectores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del checkpoint base DeepSeek-V4-Flash-0731) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262144 tokens (configuracion de servicio reportada); 393216 en el runtime vLLM 0.27.1 DSpark |
| Tipos de cuantizacion | nvfp4_ds_mla (formato usado en el despliegue reportado); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | other (DeepSeek License, enlazada al checkpoint base) |
| Formato de pesos | safetensors (overlay de 757 KB); checkpoint base en safetensors |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo entrenado desde cero ni un fine-tune: es un conjunto de vectores de dirección de rechazo extraídos de las activaciones internas del checkpoint DeepSeek-V4-Flash-0731 y aplicados como *activation steering* en tiempo de inferencia. La técnica se apoya en el paper arXiv:2406.11717 (refusal direction) y en los tags del repo (`refusal-direction`, `activation-steering`, `interpretability`). El autor no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, porque no hay entrenamiento de pesos implicado.

La innovación técnica central es la separación entre pesos y comportamiento: el overlay de 757 KB se aplica sobre las activaciones del modelo base, con un parámetro λ que escala la proyección sobre la dirección de rechazo. A λ=0 la inferencia es bit-exacta al modelo original; a λ=1.5 se elimina el rechazo en los 10 disparadores probados. El autor señala que el checkpoint abliterated convencional sobrescribe la dirección (~240 % de inversión, λ_eff ≈ 2.43), lo que degrada la aceptación de decodificación especulativa por debajo del umbral de 0.55, mientras que el rango limpio intermedio solo existe en runtime. El despliegue reportado usa decodificación especulativa DSpark probabilística con k=5, TP=2, prefix caching y `nvfp4_ds_mla` sobre 2× DGX Spark GB10 (sm_121) con vLLM 0.25.2 y vLLM 0.27.1.

## Capacidades

- Generación de texto y razonamiento heredados del checkpoint DeepSeek-V4-Flash-0731; el autor no detalla capacidades específicas del base.
- *Tool calling* / *function calling*: verificado 8/8 tanto a λ=0 como a λ=1.5, sin regresión.
- Recuperación en contexto largo (NIAH): 30/30 a 32k y 128k tokens, sin regresión con el steering activo.
- Entrada multimodal de imagen: el runtime vLLM reportado incluye *multimodal prompt-update compatibility override* y el autor indica que la entrada de imagen pasó las pruebas.
- Control en caliente del comportamiento de rechazo mediante el endpoint `POST /admin/refusal_lambda` con valores de λ arbitrarios, incluidos λ < 0 para un comportamiento más cauteloso que el stock.
- Compatibilidad con decodificación especulativa DSpark (k=5) y prefix caching.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en interpretabilidad: extraer y validar direcciones de rechazo sobre las activaciones del modelo base, comparando λ=0 y λ=1.5 en el mismo proceso y con la misma carga, sin las horas de diferencia que impone el cambio de checkpoint.
- Evaluación de seguridad y *red teaming*: alternar entre comportamiento alineado y no alineado con una llamada HTTP para medir la robustez de filtros externos y clasificadores de salida sin reiniciar el servidor.
- Despliegue con requisitos de almacenamiento ajustados: mantener una sola copia del checkpoint (~157 GB) en lugar de dos (~313 GB), con el overlay de 757 KB como único artefacto adicional.
- Servicios con SLA estricto que no pueden permitirse downtime: el cambio de λ surte efecto en la siguiente petición, sin matar peticiones en vuelo ni recargar pesos.
- Auditoría de pesos: verificar por sha256 que el checkpoint servido coincide con la release oficial de DeepSeek, ya que el steering no modifica los pesos en disco.
- *Benchmarking* A/B controlado: comparar aceptación de decodificación especulativa, TTFT y throughput entre configuraciones de λ en la misma sesión, como el A/B de 83,4 minutos reportado por el autor.
- Ajuste fino del equilibrio cautela/permisividad: usar λ < 0 para un modelo más conservador que el stock en dominios regulados, o λ > 0 en entornos de investigación sin restricciones de rechazo.

## Benchmarks y rendimiento

| Metrica | λ=0 | λ=1.5 | Veredicto |
|---|---:|---:|---|
| Tasa de rechazo (10 disparadores) | 9/10 (90 %) | 0/10 (0 %) | eliminado |
| Aceptación DSpark (n=6 alternado) | 0.5669 ± 0.0097 | 0.5608 ± 0.0189 | t = +0.70, indistinguible |
| Recuperación NIAH @ 32k + 128k | 30/30 | 30/30 | sin regresión |
| *Tool calling* | 8/8 | 8/8 | sin regresión |
| Controles benignos rechazados falsamente | 0/4 | 0/4 | clasificador sano |

Mediciones adicionales del autor sobre 2× DGX Spark GB10 (sm_121), vLLM 0.25.2, TP=2, DSpark k=5, `--max-model-len 262144`, `--enable-prefix-caching`: 83,4 minutos de A/B alternado en el mismo pod, mismo día y misma carga. En el runtime vLLM 0.27.1 DSpark (2026-08-22) la carga de código medida alcanzó 67,41 tok/s de mediana, 0,35 s de TTFT y 67,39 % de aceptación DSpark, con health, `min_p`, *tool calling* e imagen pasando sin reinicios. El checkpoint abliterated convencional medido en el mismo despliegue dio una aceptación de 0.5128, por debajo del umbral de 0.55 exigido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el overlay (757 KB); el checkpoint base requiere el despliegue completo de DeepSeek-V4-Flash-0731 (~157 GB en disco según el autor).
- GPU recomendadas: 2× NVIDIA DGX Spark GB10 (sm_121) con TP=2 es la configuración reportada y validada; otras no disponibles.
- Cabe en GPU consumer: no disponible; el checkpoint base de ~157 GB excede la VRAM de cualquier GPU consumer actual.
- Opciones de despliegue: vLLM 0.25.2 y vLLM 0.27.1 con parches DSpark publicados en `runtime/vllm-0.27.1/` del repo de GitHub; llama.cpp, Ollama y TGI no están documentados.
- Latencia y throughput: 67,41 tok/s de mediana, 0,35 s de TTFT y 67,39 % de aceptación DSpark en la carga de código medida con vLLM 0.27.1 sobre 2× GB10.
- Configuración de servicio: DSpark probabilístico k=5, TP=2, B12X, `nvfp4_ds_mla`, contexto 393216, 4 secuencias y 8192 tokens por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este overlay (wswzjbg) | no disponible (base DeepSeek-V4-Flash-0731) | 262144–393216 | ajustable en runtime (λ) | DeepSeek License | Hugging Face, 0 descargas |
| Checkpoint abliterated convencional | no disponible | no disponible | fijo, λ_eff ≈ 2.43 (invertido) | DeepSeek License | publicado, ~157 GB |
| DeepSeek-V4-Flash-0731 (stock) | no disponible | no disponible | stock (9/10 rechazos) | DeepSeek License | Hugging Face oficial |

La comparación con modelos de otros fabricantes no está disponible en la información proporcionada. Los datos de aceptación DSpark (0.5128 del checkpoint abliterated frente a 0.5608 del overlay a λ=1.5) son la única métrica cuantitativa comparativa publicada.

## Limitaciones y advertencias

- El repo tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB: los pesos no están alojados en Hugging Face y solo se distribuye el overlay de vectores; la reproducibilidad depende del repo de GitHub del autor.
- La licencia es "other" (DeepSeek License), con posibles restricciones de uso comercial heredadas del checkpoint base; conviene revisar el enlace de licencia antes de desplegar en producción.
- El modelo base no está identificado con parámetros totales, arquitectura ni idiomas en la información disponible; las capacidades reales dependen enteramente de DeepSeek-V4-Flash-0731.
- El endpoint `/admin/refusal_lambda` no documenta autenticación ni control de acceso en la información proporcionada; exponerlo sin protección permitiría a cualquier cliente cambiar el comportamiento del modelo.
- Los benchmarks son del propio autor, con n=6 alternado y 10 disparadores de rechazo; el tamaño muestral es pequeño y no hay validación independiente.
- Riesgo de alucinación y sesgos: no documentados específicamente; se heredan del checkpoint base y pueden verse alterados por el steering.
- El comportamiento a λ > 1.5 o λ < 0 no está caracterizado más allá de las pruebas reportadas; el autor solo valida λ=0 y λ=1.5.
- El despliegue requiere parches específicos de vLLM y DeepGEMM para sm_121; no es un servicio estándar y puede romper con actualizaciones de vLLM.
- No hay información sobre soporte multilingüe, cuantizaciones alternativas ni latencia en otras cargas de trabajo distintas a la de código.

## Enlaces

- Hugging Face: https://huggingface.co/wswzjbg/deepseek-v4-flash-0731-uncensored-abliterated-refusal-directions
- Checkpoint base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Licencia del base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731/blob/main/LICENSE
- Repo de código, parches y benchmarks: https://github.com/pocharlies/deepseek-v4-flash-rank1-refusal-projection
- Runtime vLLM 0.27.1: https://github.com/pocharlies/deepseek-v4-flash-rank1-refusal-projection/tree/main/runtime/vllm-0.27.1
- Paper de referencia (refusal direction): https://arxiv.org/abs/2406.11717
