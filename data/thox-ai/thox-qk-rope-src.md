# Thox-ai/thox-qk-rope-src

## Resumen

thox-qk-rope es un repositorio de código fuente de kernels para inferencia local, desarrollado por Thox-ai (THOX.ai LLC). No se trata de un modelo de lenguaje entrenado, sino de la implementación de referencia y el código fuente de dos operaciones fundamentales en transformers modernos: la normalización RMSNorm aplicada a las proyecciones query-key (QK-norm) y el embedding rotatorio NeoX (RoPE). El repositorio está diseñado para servir a arquitecturas concretas como Qwen3, que aplica QK-norm por cabeza antes de RoPE, y Qwen2.5, que requiere RoPE sin QK-norm.

El objetivo del proyecto es proporcionar un contrato numérico verificado y código fuente para construir kernels optimizados, con backends CUDA y CPU en float32, orientado a despliegues de inferencia local-first. El autor indica explícitamente que este repositorio no contiene binarios de Kernel Hub compilados ni informes de rendimiento en dispositivos, y que la tabla de frecuencias (theta, ABF, YaRN, rotary parcial) es responsabilidad del llamador, no del kernel.

La relevancia actual del proyecto radica en su enfoque en la portabilidad y verificabilidad: separa la especificación numérica de la implementación optimizada, lo que facilita la validación de kernels de inferencia antes de su despliegue en producción. La licencia Apache-2.0 permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel de operaciones para transformers (QK RMSNorm + RoPE NeoX), no es un modelo de lenguaje |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | float32 únicamente en los kernels nativos v1; no se documentan otras precisiones |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no es un modelo con pesos; el repositorio contiene código fuente, especificación C y tests) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado ni datos de entrenamiento. Se trata de código fuente de kernels que implementan dos operaciones: (1) una RMSNorm con promoción al estilo Qwen3RMSNorm, definida como `y = weight * dtype(x)(x * rsqrt(mean(x^2) + eps))`, y (2) una rotación de embeddings mediante `rotate_half` con tablas cos/sin proporcionadas por el llamador. El kernel no genera posiciones ni tablas de frecuencias; el llamador es responsable de theta, ABF, YaRN o rotary parcial.

Los backends declarados en `build.toml` son CUDA y CPU en float32. Metal aparece únicamente como nota de shader, sin implementación completa. El repositorio incluye tests de contrato numérico en NumPy y una especificación C en fp32, pero no incluye mediciones de tiempo en dispositivo. La nota técnica (`paper/main.tex`) no reporta aceleraciones. El layout soportado es `[..., D]` con tabla cos/sin broadcastable, o la vista pre-transposición de Qwen3 `[batch, seq, heads, dim]` con cos/sin `[batch, seq, rotary]`, donde `rotary` es par y puede ser menor que `dim`, copiándose la cola tras la normalización.

## Capacidades

- Implementación de QK RMSNorm por cabeza con promoción de tipo al estilo Qwen3.
- Implementación de embedding rotatorio NeoX (RoPE) con tablas cos/sin externas.
- Soporte de layouts `[..., D]` y vista pre-transposición `[batch, seq, heads, dim]`.
- Soporte de rotary parcial: `rotary` par y potencialmente menor que `dim`, con copia de la cola tras la normalización.
- Backends CUDA y CPU en float32.
- Contrato numérico verificado mediante tests de referencia en NumPy y especificación C en fp32.
- No incluye tool calling, agentes, capacidades multilingües ni generación de texto, al no ser un modelo de lenguaje.
- No incluye binarios compilados de Kernel Hub; `get_kernel("Thox-ai/thox-qk-rope")` no resolverá hasta que se suba un artefacto de `kernel-builder`.

## Casos de uso

- Validación de kernels de inferencia antes de producción: el contrato numérico en NumPy y la especificación C en fp32 permiten comparar implementaciones optimizadas contra una referencia verificada, reduciendo el riesgo de divergencias numéricas en QK-norm y RoPE.
- Integración en pipelines de inferencia para Qwen3: el kernel cubre la QK-norm por cabeza seguida de RoPE que requiere esta arquitectura, sirviendo como base para kernels CUDA personalizados en despliegues locales.
- Integración en pipelines para Qwen2.5: el kernel proporciona RoPE sin QK-norm, cubriendo la segunda llamada que el autor identifica como objetivo del proyecto.
- Desarrollo de kernels para despliegue local-first: el código fuente y la especificación permiten a equipos de infraestructura construir y validar sus propios kernels sin depender de binarios opacos.
- Investigación en embeddings rotatorios: la separación entre kernel y tabla de frecuencias permite experimentar con theta, ABF, YaRN o rotary parcial sin modificar el kernel.
- Auditoría de implementaciones existentes: los tests de referencia permiten verificar que una implementación de QK-norm y RoPE en producción respeta el contrato numérico esperado.
- Base para portabilidad a otros backends: la especificación C en fp32 sirve como referencia para implementaciones en Metal u otros backends, aunque Metal solo aparece como nota de shader.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La nota técnica del autor reporta explícitamente que no se incluyen mediciones de aceleración ni tiempos en dispositivo.

## Requisitos de hardware

- No aplica VRAM de modelo, al no ser un modelo de lenguaje con pesos.
- Backends declarados: CUDA y CPU en float32.
- GPU recomendadas: no disponible; el autor no especifica modelos de GPU objetivo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el repositorio es código fuente para `kernel-builder`; no se distribuyen binarios de Kernel Hub. Los tests se ejecutan con `python3 -m unittest tests.test_reference tests.test_spec -v`.
- Latencia y throughput: no disponibles; el autor no reporta mediciones.

## Comparativa con modelos similares

| Proyecto | Tipo | Operaciones | Backends | Licencia | Binarios |
|---|---|---|---|---|---|
| thox-qk-rope | Kernel fuente | QK RMSNorm + RoPE NeoX | CUDA, CPU (fp32) | Apache-2.0 | No |
| thox-edge-ops | Kernel fuente (compañero) | RMSNorm residual + SiLU-and-mul (SwiGLU) | no disponible | no disponible | No |

No se dispone de información sobre otros proyectos comparables en la documentación proporcionada. El autor menciona que `thox-edge-ops` cubre la pre-norm residual y la puerta SwiGLU, pero no aplica QK-norm ni RoPE, y que la normalización `(1 + weight)` de Gemma queda fuera del alcance de ambos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- No incluye binarios de Kernel Hub; `get_kernel("Thox-ai/thox-qk-rope")` no resolverá hasta que se suba un artefacto de `kernel-builder`.
- Solo float32 en los kernels nativos v1; no se documentan precisiones reducidas como fp16, bf16 o fp8.
- Metal aparece únicamente como nota de shader, sin implementación completa.
- El kernel no genera tablas de frecuencias; el llamador debe proporcionar theta, ABF, YaRN o rotary parcial, lo que traslada la responsabilidad de corrección al integrador.
- La normalización `(1 + weight)` de Gemma queda explícitamente fuera del alcance.
- No se reportan mediciones de rendimiento ni tiempos en dispositivo, por lo que no hay evidencia publicada de aceleración.
- El repositorio tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La fecha de creación y actualización del repositorio es 2026-11-05, posterior a la fecha actual, lo que debe tenerse en cuenta al evaluar su madurez.
- Licencia Apache-2.0 permite uso comercial, pero el copyright corresponde a THOX.ai LLC (2026).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thox-ai/thox-qk-rope-src
- Repositorio git fuente: https://github.com/ttracx/thox-qk-rope (commit `de3baa1`)
- Kernel compañero: https://huggingface.co/kernels/Thox-ai/thox-edge-ops
- Nota técnica: `paper/main.tex` y `paper/main.pdf` dentro del repositorio git
