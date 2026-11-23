# Walkowicz/kairos-sotos-3.0-1.7b-mlx

## Resumen

Kairos Sotos 3.0 · 1.7B (MLX) es un ajuste fino (fine-tune) del modelo LiquidAI/LFM3-1.7B, publicado por el usuario Walkowicz en Hugging Face. Está especializado en ciberseguridad defensiva y auditoría de privacidad (GDPR/LGPD), con un enfoque bilingüe declarado de 50% inglés y 50% portugués de Brasil. La distribución se ofrece exclusivamente en formato MLX, es decir, orientada a la inferencia en Apple Silicon mediante el framework MLX de Apple.

El modelo se publica en tres subcarpetas de cuantización (bf16, 8bit y 5bit), con tamaños de pesos de 3,46 GB, 1,84 GB y 1,19 GB respectivamente. La model card justifica la ausencia de una variante de 4 bits: según el autor, esa cuantización falló la puerta de calidad bilingüe por deriva de identidad en portugués (KL=1,6696), por lo que fue retirada. El repositorio ocupa 6,5 GB en total.

La relevancia de este modelo es acotada y muy específica: se trata de un fine-tune de nicho sobre una base pequeña (1,7B parámetros), empaquetado para un runtime concreto (mlx-vlm >= 0.8.0) y con una licencia heredada restrictiva (LFM 1.0). No es un modelo de propósito general ni compite con modelos frontera; su interés reside en el caso de uso vertical de asistencia en revisión de seguridad y cumplimiento normativo sobre hardware Apple.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de LiquidAI/LFM3-1.7B; el autor no detalla la arquitectura en la model card) |
| Parámetros totales | 1,7B (según el nombre del modelo y el modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, 8-bit affine (g=64), 5-bit affine (g=64) |
| Idiomas soportados | inglés (en), portugués (pt); la model card declara entrenamiento 50% EN / 50% PT-BR |
| Licencia | LFM 1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | safetensors en formato MLX (subcarpetas bf16/, 8bit/, 5bit/) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base ni los detalles del proceso de ajuste fino. Se sabe que parte de LiquidAI/LFM3-1.7B y que el ajuste se orientó a ciberseguridad defensiva y auditoría de privacidad, con una composición de datos declarada de 50% inglés y 50% portugués de Brasil. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras.

La innovación técnica destacable no está en la arquitectura sino en el empaquetado: el autor publica tres variantes MLX con métricas de paridad frente a BF16 (carga con `strict=True`, paridad top-1 nativa, similitud coseno y KL medio). Según esos datos, la variante 8bit alcanza un 100% de paridad top-1 nativa, coseno 0,9084 y KL medio 0,2691 frente a BF16; la variante 5bit baja al 50% de paridad top-1, coseno 0,8376 y KL 0,6394. La carga requiere `mlx-vlm >= 0.8.0`, ya que `mlx-lm` no soporta el esquema `lfm3`.

## Capacidades

- Generación de texto en inglés y portugués de Brasil, con especialización declarada en ciberseguridad defensiva y AppSec.
- Asistencia en auditoría de privacidad y cumplimiento normativo (GDPR, LGPD), según los tags del modelo.
- Referencia a marcos y taxonomías de seguridad: OWASP y CWE aparecen como tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales: el repositorio se etiqueta con `mlx-vlm`, pero la model card no documenta entrada de imagen ni audio; el pipeline declarado es text-generation.
- Modo thinking explícito: no disponible.

## Casos de uso

- Revisión de código orientada a AppSec: el modelo puede señalizar patrones asociados a CWE y a las categorías de OWASP en fragmentos de código, como primer filtro en una revisión manual posterior.
- Auditoría de cumplimiento GDPR/LGPD: apoyo en la identificación de tratamientos de datos personales y en la redacción de borradores de evaluaciones de impacto, dado su ajuste declarado en privacidad.
- Asistencia bilingüe EN/PT-BR para equipos de seguridad: permite mantener un mismo flujo de revisión en inglés y portugués sin cambiar de modelo, gracias a su entrenamiento declarado al 50% en cada idioma.
- Despliegue local en Apple Silicon: al publicarse en MLX con variantes de 5bit (1,19 GB) y 8bit (1,84 GB), es viable ejecutarlo en un Mac portátil para tareas de asistencia sin conexión.
- Generación de borradores de políticas y checklists de seguridad: puede producir textos preliminares sobre controles, que el equipo de seguridad revisa y valida.
- Formación y concienciación: generación de explicaciones y ejemplos sobre vulnerabilidades y obligaciones de privacidad para materiales internos en inglés o portugués.
- Prototipado rápido de asistentes verticales de seguridad: su tamaño reducido y su licencia heredada permiten experimentar en local antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros). Solo incluye métricas internas de paridad de cuantización frente a BF16:

| Subcarpeta | Cuantización | Tamaño de pesos | Tensores | Carga `strict=True` | Paridad top-1 nativa vs BF16 | Coseno | KL medio vs BF16 |
|---|---|---|---|---|---|---|---|
| 5bit/ | 5-bit affine (g=64) | 1,19 GB | 594 | 15,00 s | 50% | 0,8376 | 0,6394 |
| 8bit/ | 8-bit affine (g=64) | 1,84 GB | 594 | 10,40 s | 100% | 0,9084 | 0,2691 |
| bf16/ | BF16 | 3,46 GB | 286 | 32,38 s | 100% | — | — |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 1,2 GB para la variante 5bit, 1,9 GB para 8bit y 3,5 GB para BF16, según los tamaños de pesos publicados (sin contar overhead del runtime).
- Plataforma: exclusivamente Apple Silicon (macOS ARM64); los benchmarks Metal GPU requieren ejecución nativa en ARM64 según la model card.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este repositorio MLX; para esos entornos existe la edición GGUF en Walkowicz/kairos-sotos-3.0-1.7b.
- GPU de consumo: cabe en cualquier Mac con memoria unificada suficiente; la variante 5bit es la más ligera para equipos con poca memoria.
- Despliegue: `mlx-vlm >= 0.8.0` (probado con `mlx==0.32.4`); `mlx-lm` no carga el esquema `lfm3`. Para Ollama/GGUF, usar la edición GGUF enlazada en la model card.
- Latencia y throughput: no disponibles; la model card solo reporta tiempos de carga (10,40 s para 8bit, 15,00 s para 5bit, 32,38 s para BF16).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Kairos Sotos 3.0 1.7B (MLX) | 1,7B | no disponible | Ciberseguridad defensiva, GDPR/LGPD, EN/PT-BR | LFM 1.0 | MLX safetensors |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | Propósito general | LFM 1.0 | safetensors |
| Walkowicz/kairos-sotos-3.0-1.7b (GGUF) | 1,7B | no disponible | Misma especialización | LFM 1.0 | GGUF |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La comparación se limita a parámetros, licencia y formato de distribución.

## Limitaciones y advertencias

- Modelo de nicho y tamaño reducido (1,7B): su capacidad de razonamiento y conocimiento general es limitada frente a modelos mayores; no debe usarse como única línea de defensa en seguridad.
- Riesgo de alucinación: en dominios técnicos como CWE, OWASP o normativa GDPR/LGPD, puede generar referencias inexactas o controles inventados; requiere validación humana.
- Idiomas: solo inglés y portugués de Brasil; no hay soporte declarado de castellano ni de otros idiomas.
- Licencia LFM 1.0: es una licencia "other" con términos específicos; deben revisarse las restricciones de uso comercial antes de desplegarlo en producción.
- Cuantización 4bit no disponible: el autor la retiró por fallo en la puerta de calidad bilingüe (KL=1,6696), por lo que no existe una variante aún más ligera validada.
- Runtime restringido: requiere `mlx-vlm >= 0.8.0` y macOS ARM64; no es portable a entornos Linux/NVIDIA sin usar la edición GGUF.
- Sin benchmarks públicos de tareas: no hay evidencia publicada de rendimiento en MMLU, HumanEval u otros, lo que dificulta evaluar su calidad frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni casos de uso reportados por terceros.
- Fecha de creación del repositorio: 2026-11-23, según los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face (MLX): https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b-mlx
- Edición GGUF (Ollama): https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Subcarpeta 5bit: https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b-mlx/tree/main/5bit
- Subcarpeta 8bit: https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b-mlx/tree/main/8bit
- Subcarpeta bf16: https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b-mlx/tree/main/bf16
- Licencia LFM 1.0: https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b-mlx/blob/main/LICENSE
