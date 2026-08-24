# Taimur/Qwen3.8-27B-NVFP4-NVLC-Lossless

## Resumen

Este repositorio contiene una representación de almacenamiento comprimida y sin pérdidas del checkpoint cuantizado `RadixArk/Qwen3.8-27B-NVFP4`, que a su vez deriva del modelo multimodal Qwen3.8-27B de Alibaba. El autor, Taimur, aplica un codec propio denominado NVLC (NVFP4 Lossless Compression) basado en codificación entrópica rANS y organización en tiles, logrando una reducción del 16,15% en el tamaño de los pesos sin alterar ni un solo bit del checkpoint original.

Este formato no es un nuevo modelo ni una cuantización adicional: se trata de una reorganización de los bits ya cuantizados en NVFP4/FP8/BF16, con el objetivo de reducir el espacio de almacenamiento y facilitar la carga eficiente en sistemas con decodificador NVLC. Está pensado para el despliegue en hardware de NVIDIA como el DGX Spark, aunque el autor aclara que no se incluye un decodificador GPU de producción y que el runtime experimental no hace afirmaciones de velocidad de inferencia.

La relevancia actual radica en la creciente necesidad de optimizar el almacenamiento y la transferencia de modelos cuantizados grandes, manteniendo la integridad exacta de los pesos. Este repositorio demuestra una técnica de compresión reversible que preserva la precisión numérica, algo crítico en entornos de producción donde cualquier pérdida de fidelidad es inaceptable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (dense, hybrid-attention: 16 capas full attention, 48 capas linear attention) |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | 27B (no es MoE, todos activos) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | NVFP4 (E2M1) para MLP y lm_head, FP8 E4M3 para atención, BF16 para MTP y visión (en el checkpoint original) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero el repo no especifica lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | NVLC custom (.nvlc, tres contenedores NVLCT014 versión 2), no safetensors |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3.8-27B, es un modelo de lenguaje denso de 27. mil millones de parámetros con arquitectura híbrida de atención: solo 16 de sus 64 capas usan atención completa (full attention), mientras que las 48 restantes emplean atención lineal con estado recurrente constante. Esta mezcla reduce el coste computacional del contexto largo manteniendo la calidad en tareas que requieren razonamiento profundo. El modelo fue entrenado por Alibaba y destaca por sus capacidades multimodales (visión y texto), razonamiento y codificación.

El repositorio no introduce cambios en la arquitectura ni en los pesos. La capa de compresión NVLC aplica modelos de probabilidad rANS estáticos a los tensores ya cuantizados, dividiendo cada valor en símbolos (por ejemplo, para BF16 separa signo+exponente y fracción) y codificándolos con tablas específicas por tensor. La decodificación es exacta: reconstruye los tres shards safetensors originales byte a byte, sin conversión numérica ni requantización. La organización en tiles de 256 bytes permite decodificación paralela con 32 lanes rANS por tile, aunque requiere que los tensores de escala se decodifiquen antes que los tiles de FP4 que los usan.

## Capacidades

- Representación de almacenamiento lossless: preserva exactamente los valores de todos los tensores del checkpoint NVFP4 original, sin pérdida de precisión.
- Compresión entrópica avanzada: reduce el tamaño de los pesos un 16,15 % global, con reducciones por tipo de tensor de hasta el 34 % en BF16 y 23,6 % en FP8.
- Organización en tiles para decodificación paralela: 97.882 tiles independientes, cada uno con 32 lanes rANS y alineación de 128 bytes, diseñados para explotar GPUs modernas.
- Compatibilidad con el modelo base Qwen3.8-27B: tras la decodificación, se obtiene el modelo NVFP4 original con sus capacidades multimodales, tool calling y razonamiento de largo contexto.
- Incluye decodificador CPU portable y metadatos completos del formato, lo que permite reconstruir el modelo en sistemas sin GPU.
- No requiere reentrenamiento ni ajuste de pesos: la compresión es reversible y no altera el comportamiento del modelo.

## Casos de uso

- **Almacenamiento eficiente en entornos con espacio limitado**: los 18,4 GB del repositorio NVLC ocupan un 16 % menos que los 21,9 GB del checkpoint NVFP4 original, lo que facilita la distribución en redes con ancho de banda reducido o en sistemas de archivos con cuotas.
- **Despliegue en hardware de borde con DGX Spark**: el formato está diseñado para cargarse de forma eficiente en el DGX Spark, aprovechando la organización en tiles para minimizar la latencia de decodificación durante el arranque.
- **Transferencia de modelos cuantizados entre entornos**: al ser una representación reversible, se puede transmitir el checkpoint comprimido y reconstruirlo exactamente en el destino, garantizando que los pesos no se alteran en el tránsito.
- **Investigación en compresión de modelos**: el repositorio sirve como referencia de implementación de un codec rANS para formatos NVFP4/FP8, útil para quienes trabajan en técnicas de compresión de pesos sin pérdida.
- **Integración con runtimes experimentales de SGLang**: el repositorio incluye una ruta experimental de integración con SGLang, permitiendo a desarrolladores probar la carga de modelos NVLC en este servidor de inferencia.
- **Auditoría y verificación de integridad**: al incluir `SOURCE_SHA256SUMS` y un decodificador de referencia, permite verificar que la compresión no introduce errores, lo que es crítico en aplicaciones donde la integridad de los pesos es una exigencia de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se hace ninguna afirmación de velocidad de inferencia para este release, y no se incluyen datos de latencia ni throughput. El objetivo del repositorio es únicamente la optimización de almacenamiento.

## Requisitos de hardware

- **VRAM estimada**: no disponible para el formato NVLC. El modelo base Qwen3.8-27B en cuantización NVFP4 requiere aproximadamente 17 GB de VRAM según Unsloth, pero este repositorio no incluye un decodificador GPU de producción que permita medir el consumo real.
- **GPU recomendadas**: el formato NVLC está orientado a GPUs NVIDIA con soporte para FP4 y FP8, como el DGX Spark (GB10) o tarjetas de la serie Blackwell. No se garantiza funcionamiento en GPUs sin esas instrucciones.
- **Compatibilidad con consumer GPU**: es posible decodificar en CPU con el codec portable incluido, pero la inferencia completa requiere reconstruir el modelo NVFP4 y usar runtimes como vLLM o SGLang con soporte para ese formato.
- **Opciones de despliegue**: no es compatible directamente con `transformers.from_pretrained`, vLLM ni SGLang. Se necesita un loader NVLC-aware que decodifique los contenedores `.nvlc` a safetensors antes de la inferencia.
- **Latencia y throughput**: no se proporcionan datos. El autor no hace claims de rendimiento y recomienda el uso del runtime experimental solo para investigación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Qwen3.8-27B (original)** | 27B | 256K | safetensors (BF16/FP16) | ~54 GB | Apache-2.0 | Hugging Face |
| **RadixArk/Qwen3.8-27B-NVFP4** | 27B | 256K | safetensors (NVFP4/FP8/BF16) | 21,9 GB | Apache-2.0 | Hugging Face |
| **Taimur/Qwen3.8-27B-NVFP4-NVLC-Lossless** | 27B | 256K | .nvlc (entropy-coded) | 18,4 GB | Apache-2.0 | Hugging Face |

El formato NVLC es un 16,15 % más pequeño que el checkpoint NVFP4 original y un 66 % más pequeño que el modelo en BF16. Sin embargo, a diferencia de los otros dos, no es directamente cargable con los frameworks estándar. La comparativa se limita a estos tres, ya que no se dispone de datos de rendimiento de benchmarks para ninguno de ellos.

## Limitaciones y advertencias

- **No es un modelo ejecutable directamente**: los pesos están en formato `.nvlc`, no en safetensors. Los cargadores estándar de `transformers`, vLLM y SGLang no pueden consumir este repositorio sin un decoder NVLC.
- **Falta un decoder GPU de producción**: el autor incluye un codec portable para CPU y decoders GPU de referencia, pero no hay una versión optimizada y probada para producción. No se hace ninguna afirmación de velocidad de inferencia.
- **Requisito de decodificación de contexto**: los tiles de FP4 requieren que su tensor de escala correspondiente esté disponible primero, lo que impone un orden de decodificación y puede añadir complejidad en el runtime.
- **Riesgo de sesgos y alucinaciones del modelo base**: el modelo Qwen3.8-27B puede presentar sesgos típicos de los LLM y alucinar en tareas de razonamiento complejo. Esta limitación se hereda del checkpoint original y no se mitiga en este repositorio.
- **Licencia Apache-2.0**: aunque permite uso comercial, es necesario cumplir con las condiciones de la licencia y con las posibles restricciones del modelo base (aunque Qwen3.8-27B también es Apache-2.0).
- **Sin garantía de soporte**: el proyecto es un repositorio de investigación (rama experimental) y no se ofrece garantía de mantenimiento ni de integración con ecosistemas estándares.

## Enlaces

- [Hugging Face - Taimur/Qwen3.8-27B-NVFP4-NVLC-Lossless](https://huggingface.co/Taimur/Qwen3.8-27B-NVFP4-NVLC-Lossless)
- [GitHub - TaimurAyaz/Qwen3.8-27B-NVFP4-NVLC](https://github.com/TaimurAyaz/Qwen3.8-27B-NVFP4-NVLC)
- [Hugging Face - RadixArk/Qwen3.8-27B-NVFP4](https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4)
- [Hugging Face - Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Unsloth - Qwen3.8](https://unsloth.ai/docs/models/qwen3.8)
- [QwenCloud - Qwen3.8-27B](https://www.qwencloud.com/models/qwen3.8-27b)
- [vLLM Recipes - Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
