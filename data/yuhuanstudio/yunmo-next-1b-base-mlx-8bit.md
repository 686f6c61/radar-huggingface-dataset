# yuhuanstudio/Yunmo-Next-1B-Base-MLX-8bit

## Resumen

Yunmo-Next-1B-Base-MLX-8bit es la versión cuantizada a 8 bits en formato MLX del modelo base Yunmo-Next-1B-Base, desarrollado por yuhuanstudio. Se trata de un checkpoint de investigación de aproximadamente 1.014 millones de parámetros, orientado a generación de texto en chino (con etiqueta específica de chino tradicional) e inglés, que implementa una arquitectura no estándar basada en Kimi Delta Attention (KDA), grouped-query attention y depth routing. Al no estar soportada esta arquitectura por `mlx-lm`, el repositorio incluye una implementación MLX autocontenida en el directorio `yunmo_next_mlx/`.

El modelo es relevante por dos motivos. Primero, sirve como referencia técnica de una arquitectura experimental de atención lineal por deltas combinada con enrutado por profundidad, lo que lo convierte en objeto de estudio para investigadores interesados en alternativas a la atención cuadrática clásica. Segundo, la publicación incluye una validación cuantitativa poco habitual: comparación de bits por byte y de coincidencia en decodificación greedy contra la versión PyTorch en FP32, lo que permite evaluar el impacto real de la cuantización a 8 y 4 bits.

Conviene subrayar que el propio autor lo califica explícitamente como checkpoint de investigación: el modelo está a nivel de azar en preguntas de conocimiento de opción múltiple, falla con frecuencia en hechos, puede repetirse hasta el límite de tokens y no tiene ajuste de seguridad. No es, por tanto, un modelo para producción, sino una pieza de estudio arquitectónico y de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Kimi Delta Attention (KDA), grouped-query attention y depth routing |
| Parametros totales | 1.013.956.456 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín, group size 64 (esta versión); el modelo base dispone de variantes FP32, BF16 y 4 bits en MLX |
| Idiomas soportados | zh (incluido chino tradicional), en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx` |
| Tamano del repositorio | 1,1 GB |
| Capas no cuantizadas | embedding/output atados, normas, convoluciones cortas, parámetros de decaimiento KDA (`A_log`, `dt_bias`) y parámetros del depth-router |

## Arquitectura y entrenamiento

La arquitectura combina tres componentes: Kimi Delta Attention (KDA), una forma de atención lineal con decaimiento por deltas; grouped-query attention; y depth routing, un mecanismo de enrutado a lo largo de la profundidad de la red. El modelo base está descrito en detalle en el repositorio de precisión completa (Yunmo-Next-1B-Base), que es donde se documentan el entrenamiento, la evaluación y las limitaciones; esta model card no reproduce esa información. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

La innovación técnica más tangible de esta versión concreta es el proceso de cuantización: las anchuras de SwiGLU se rellenan con ceros hasta un múltiplo de 64 para que todas las capas lineales puedan cuantizarse, sin alterar la función del modelo. La validación reportada compara bits por byte sobre los primeros 50 artículos de un conjunto de Wikipedia en chino (artículos creados después del 2026-10-01, primeros 2.000 caracteres) contra PyTorch en FP32 (0,9174): MLX FP32 da 0,9174; MLX BF16, 0,9175; MLX 8 bits, 0,9175; MLX 4 bits, 0,9254. En coincidencia de tokens iniciales con decodificación greedy (64 tokens nuevos), la versión de 8 bits mantiene 64/64 en chino y en inglés, pero baja a 42/64 en el prompt de chat con pesos Instruct; la de 4 bits cae a 27/64 en inglés y 19/64 en chat.

## Capacidades

- Generación de texto conversacional y de continuación de texto en chino (incluido tradicional) e inglés.
- Plantilla de chat con modo de razonamiento desactivable; `encode_chat` reproduce exactamente los token IDs de la plantilla de `transformers` con el razonamiento desactivado.
- Soporte de tokens especiales de parada (`<|return|>`, id 65281) y de limpieza de tokens de control (ids inferiores a 65280).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni otras modalidades.
- Capacidad multilingüe limitada a zh y en según los metadatos.

## Casos de uso

- Investigación sobre atención lineal: el modelo permite estudiar empíricamente el comportamiento de Kimi Delta Attention y del depth routing en una escala de 1B, comparando curvas de perplejidad y bits por byte frente a arquitecturas transformer estándar.
- Evaluación de cuantización en Apple Silicon: sirve para medir la degradación de 8 bits y 4 bits frente a FP32 y BF16 con métricas reproducibles (bits por byte y coincidencia de tokens greedy), tal como documenta el autor.
- Prototipado de pipelines MLX: útil para validar flujos de carga, tokenización y generación con la librería `mlx` en Linux (backends CUDA y CPU) antes de portar modelos propios.
- Estudio de tokenización y plantillas de chat en chino tradicional: la implementación `encode_chat` permite verificar la equivalencia exacta con la plantilla de `transformers`, útil para auditar tokenizadores.
- Docencia y experimentación con arquitecturas no estándar: al ser un checkpoint pequeño (1,1 GB) y de licencia permisiva, se puede diseccionar en aulas o laboratorios sin infraestructura dedicada.
- Generación de texto de relleno o sintético para pruebas de infraestructura: dado su bajo coste de despliegue, puede usarse para probar servidores de inferencia, aunque no para contenido fiable.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). La única evaluación cuantitativa disponible es la comparación de fidelidad de la cuantización frente a PyTorch FP32:

| Pesos MLX | Bits por byte (Wikipedia zh, 50 artículos) | Delta vs PyTorch FP32 |
|---|---:|---:|
| FP32 | 0,9174 | +0,0000 |
| BF16 | 0,9175 | +0,0001 |
| 8 bits | 0,9175 | +0,0001 |
| 4 bits | 0,9254 | +0,0080 |

| Pesos MLX | Chino (Base) | Inglés (Base) | Chat (Instruct) |
|---|---:|---:|---:|
| FP32 | 64/64 | 64/64 | 64/64 |
| BF16 | 64/64 | 64/64 | 42/64 |
| 8 bits | 64/64 | 64/64 | 42/64 |
| 4 bits | 64/64 | 27/64 | 19/64 |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 1,1 GB en 8 bits; en FP32 el modelo de 1.014 millones de parámetros requeriría aproximadamente 4 GB solo en pesos, más overhead de activaciones y caché.
- GPU recomendadas: no se especifican. La validación se ejecutó en Linux con los backends CUDA y CPU de MLX, no en Apple silicon.
- Compatibilidad con GPU de consumo: por tamaño, cabría en GPUs con 8 GB o más de VRAM en 8 bits; no obstante, el autor no ha verificado ni la corrección ni la velocidad en Apple silicon, y el bucle de decodificación no está optimizado para velocidad.
- Opciones de despliegue: la vía documentada es `mlx` con el paquete `yunmo_next_mlx` incluido en el repositorio (`python -m yunmo_next_mlx.generate`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la arquitectura no forma parte de `mlx-lm`.
- Latencia y throughput: no disponibles; el autor indica explícitamente que el bucle de decodificación no está optimizado para velocidad.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de alternativas directamente comparables con la misma arquitectura (KDA + depth routing) en la información proporcionada. Como referencia de categoría (modelos base de ~1B parámetros, licencia permisiva), la comparación solo puede hacerse a nivel de especificaciones:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Yunmo-Next-1B-Base-MLX-8bit | 1.014 M | no disponible | Apache-2.0 | safetensors (MLX) | Arquitectura KDA + depth routing, checkpoint de investigación |
| Alternativas de ~1B | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigación: el autor advierte de que el modelo está a nivel de azar en preguntas de conocimiento de opción múltiple.
- Alta tasa de errores factuales: falla con frecuencia en hechos.
- Degeneración en la generación: puede repetirse hasta alcanzar el límite de tokens.
- Sin ajuste de seguridad: no incorpora alineamiento ni filtros de contenido.
- Idiomas limitados a chino (incluido tradicional) e inglés; no se documenta soporte de castellano.
- Longitud de contexto no documentada, lo que impide planificar despliegues con ventanas largas.
- Cuantización a 8 bits: la coincidencia con PyTorch FP32 cae a 42/64 en el prompt de chat con pesos Instruct, lo que indica divergencia en modo conversacional.
- La variante de 4 bits degrada notablemente en inglés (27/64) y en chat (19/64).
- Validación realizada solo en Linux (CUDA y CPU de MLX); sin verificación en Apple silicon ni de velocidad.
- El bucle de decodificación no está optimizado para velocidad, por lo que no es apto para cargas de producción con requisitos de latencia.
- Licencia Apache-2.0: permite uso comercial, pero las limitaciones técnicas hacen desaconsejable su uso en producción sin evaluación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Base-MLX-8bit
- Modelo base de precisión completa: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Base
