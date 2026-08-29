# SZLHOLDINGS/szl-lambda-gate

## Resumen

`szl-lambda-gate` es un kernel de gobernanza publicado por SZL Holdings, una organización que desarrolla infraestructura de IA gobernada con trazabilidad y verificación. No se trata de un modelo de lenguaje ni de un modelo generativo, sino de un agregador matemático diferenciable implementado en PyTorch puro: calcula la media geométrica ponderada de puntuaciones de ejes en el intervalo [0,1] y aplica una puerta de decisión consultiva (advisory) con umbral configurable. Su propósito es hacer computable y auditable una decisión de gobernanza a nivel de tensor, por ejemplo, decidir si un sistema supera un conjunto de criterios de calidad, seguridad o cumplimiento.

El repositorio incluye además un surrogate entrenado: un MLP pequeño en PyTorch que predice la decisión de la puerta `lambda_gate(axes, threshold).passed` sobre el espacio de 13 ejes Yuyay, con una fidelidad medida de 0.9670 frente al kernel en una partición de validación. El kernel Λ sigue siendo la fuente de verdad autoritativa; el surrogate solo aproxima la decisión. La licencia es Apache-2.0 y el tamaño del repositorio es de 0.0 GB, lo que indica un artefacto extremadamente ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel de agregación (media geométrica ponderada) + MLP surrogate (torch) |
| Parametros totales | no disponible (MLP pequeño, no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no se menciona cuantización) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (surrogate) + código fuente del kernel en PyTorch |

## Arquitectura y entrenamiento

El componente principal es el kernel Λ, una función matemática pura que calcula la media geométrica ponderada de puntuaciones de ejes en [0,1]: Λ(x) = ∏ᵢ xᵢ^{wᵢ}, con pesos positivos que suman 1. Es no compensatorio: si cualquier eje es cero o no finito, el agregado completo se anula, lo que produce una señal conservadora de "un eje malo falla la puerta". El kernel es diferenciable, compatible con `torch.compile` y admite operaciones por lotes. Incluye auto-chequeos empíricos de los axiomas A1–A4 en tiempo de ejecución.

El surrogate es un MLP entrenado para predecir la decisión binaria de la puerta (`passed`) sobre el espacio de 13 ejes Yuyay. Según la model card, se midió una fidelidad de 0.9670 (acuerdo con el kernel en una partición de validación). No se proporcionan detalles sobre el conjunto de entrenamiento, el número de parámetros, la arquitectura exacta del MLP ni el procedimiento de optimización. El kernel Λ permanece inalterado y es la única fuente de verdad; el surrogate es solo una aproximación.

## Capacidades

- Agregación de puntuaciones de ejes en [0,1] mediante media geométrica ponderada, diferenciable y batcheable.
- Puerta de decisión consultiva (`lambda_gate`) con umbral configurable, que devuelve `score`, `passed`, `threshold` y `advisory` (siempre `True`).
- Auto-chequeos de axiomas A1–A4 en tiempo de ejecución para verificar la integridad del kernel.
- Compatible con `torch.compile` para optimización en inferencia.
- Incluye un surrogate MLP que aproxima la decisión de la puerta con fidelidad 0.9670, útil para entornos donde se requiera una evaluación rápida sin ejecutar el kernel completo.
- No es un modelo de lenguaje: no genera texto, no procesa lenguaje natural ni admite tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Gobernanza de pipelines de IA: integrar `lambda_gate` como paso de control en un flujo de datos para decidir si un modelo o artefacto supera umbrales de calidad, seguridad o cumplimiento antes de su despliegue.
- Auditoría de sistemas multi-agente: usar el agregador para combinar puntuaciones de distintos ejes (p. ej., precisión, sesgo, latencia) y emitir una señal consultiva de aprobación o rechazo.
- Control de calidad en producción: aplicar la puerta a métricas de rendimiento en tiempo real para activar alertas o redireccionar tráfico si algún eje cae por debajo del umbral.
- Verificación de integridad de kernels: ejecutar `selfcheck()` como parte de pruebas unitarias o CI para confirmar que el kernel sigue cumpliendo sus axiomas.
- Sustitución rápida en entornos con restricciones de cómputo: usar el surrogate MLP para predecir la decisión de la puerta sin ejecutar el kernel completo, cuando se acepte una fidelidad de 0.9670.
- Investigación en agregación de criterios: servir como referencia implementada de una media geométrica ponderada con puerta no compensatoria, para comparar con otros métodos de agregación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la fidelidad del surrogate (0.9670 de acuerdo con el kernel en una partición de validación), que no es un benchmark de rendimiento de modelo de lenguaje ni de tareas estándar.

## Requisitos de hardware

- El kernel es una función pura de PyTorch: se ejecuta en CPU sin necesidad de GPU. El consumo de memoria es despreciable (operaciones sobre tensores pequeños).
- El surrogate MLP es igualmente ligero; cabe en cualquier entorno con PyTorch instalado, incluidos portátiles o instancias de CPU.
- No se requieren GPUs específicas (A100, H100, RTX 4090, etc.) para ninguno de los dos componentes.
- Opciones de despliegue: integración directa en scripts de Python con `pip install kernels torch`; también puede usarse dentro de pipelines de CI/CD o como parte de servicios de inferencia ligeros.
- Latencia y throughput: no se han publicado mediciones, pero al tratarse de operaciones tensoriales elementales, la latencia esperada es de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de modelos comparables en el ecosistema de Hugging Face con la misma función (kernel de gobernanza agregador con puerta consultiva). No es un modelo de lenguaje ni un modelo generativo, por lo que no procede compararlo con LLMs de tamaño similar. La comparativa queda marcada como no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no comprende lenguaje natural y no puede usarse para tareas de NLP, código o razonamiento conversacional.
- La unicidad de la media geométrica ponderada como agregador que satisface los axiomas A1–A4 es una conjetura abierta (Conjecture 1), no un teorema probado. El kernel se etiqueta explícitamente como consultivo, no como prueba de confianza.
- La puerta es no compensatoria: un solo eje con valor cero o no finito anula el agregado completo, lo que puede producir falsos negativos en escenarios donde un eje sea irrelevante o esté mal medido.
- El surrogate MLP tiene una fidelidad de 0.9670, no perfecta; su predicción puede diferir de la decisión del kernel en algunos casos. No debe usarse como sustituto del kernel en contextos donde la exactitud sea crítica.
- No se han publicado detalles sobre el entrenamiento del surrogate (datos, hiperparámetros, arquitectura exacta), lo que limita la reproducibilidad.
- La licencia Apache-2.0 permite uso comercial, pero el repositorio incluye avisos de que las afirmaciones de verificación se refieren a integridad y origen, no a precisión o rendimiento.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto porque no es un modelo generativo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-lambda-gate
- Repositorio GitHub: https://github.com/szl-holdings/szl-lambda-gate
- README en GitHub: https://github.com/szl-holdings/szl-lambda-gate/blob/main/README.md
- Documentación de SZL Holdings: https://holdings.a-11-oy.com/docs-site/about.html
- Kernel companion `szl-governed-norm`: https://huggingface.co/SZLHOLDINGS/szl-governed-norm
- Suite de kernels `szl-kernels`: https://huggingface.co/SZLHOLDINGS/szl-kernels
- Demo holográfica del gate: https://szlholdings-lambda-gate-holo.static.hf.space
- Demo unificada de kernels: https://szlholdings-szl-kernels-live.static.hf.space
- Dataset `szl-lake`: https://huggingface.co/datasets/SZLHOLDINGS/szl-lake
- DOI: 10.5281/zenodo.19944926
