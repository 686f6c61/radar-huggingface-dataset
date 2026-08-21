# xocialize/ltx-2.5-granules

# LTX-2.5 granules — per-block weight streaming (MLX)

## Resumen

`xocialize/ltx-2.5-granules` es una reorganización del transformador de difusión (DiT) del modelo LTX-2.5 de Lightricks, diseñada para permitir el *weight streaming* desde disco durante el proceso de denoise en lugar de mantener todos los pesos residentes en memoria. El autor, xocialize, ha dividido el DiT en archivos granulares por bloque, de modo que el consumidor puede cargar y descargar los pesos de cada bloque de forma solapada con el cómputo. Esta estrategia reduce drásticamente la memoria de GPU necesaria para ejecutar LTX-2.5, haciéndolo viable en tarjetas de 24 GB y 32 GB que de otro modo no podrían albergar el modelo completo.

El modelo se distribuye en dos variantes de cuantización: `bf16` (34,58 GiB) y `q8` (18,38 GiB), ambas con un archivo lateral `globals.granule` que contiene los 59 tensores no pertenecientes a bloques. La salida del streaming es bit-idéntica a la del modelo residente, verificada mediante una comparación `memcmp` con control negativo. Este repositorio es un derivado de `Lightricks/LTX-2.5` y se consume mediante el runtime `ltx-2-mlx-swift` y la librería `BlockStreamKit`.

La relevancia actual radica en que permite ejecutar un modelo de generación de video de última generación en hardware de consumo, manteniendo la calidad original sin degradación, a costa de una mayor amplificación de lectura (aproximadamente 6 veces) que se compensa con un SSD rápido. En máquinas de 64 GB, el streaming ha mostrado ser incluso más rápido que el modo residente, al evitar la recarga completa del DiT en cada etapa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de LTX-2.5, reorganizado en bloques granulares |
| Parametros totales | no disponible (depende del modelo base LTX-2.5) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (generacion de video, no texto) |
| Tipos de cuantizacion | bf16 y q8 (8-bit) |
| Idiomas soportados | no disponibles |
| Licencia | LTX-2 Community License Agreement (ltx-2-community-license-agreement) |
| Formato de pesos | MLX (safetensors, organizados en archivos granulares por bloque) |

## Arquitectura y entrenamiento

Este repositorio no introduce un nuevo entrenamiento ni una arquitectura nueva. Se trata de un *re-layout* del DiT de LTX-2.5, el modelo de generación de video y simulación de mundo de Lightricks. El DiT original se particiona en archivos de pesos por bloque, de modo que cada bloque puede ser cargado de forma independiente desde disco durante el proceso de denoise. Cada árbol (`bf16/` y `q8/`) incluye un archivo `globals.granule` que agrupa los 59 tensores globales (no asociados a bloques), lo que permite al consumidor enlazar el modelo sin necesidad de tener el checkpoint fuente completo.

La reorganización se realiza verificando la procedencia: cada `manifest.json` registra el `source_repo` y `source_revision` junto con el hash SHA-256 de cada archivo, validado contra el Hub en tiempo de construcción. Esto garantiza que el contenido es un derivado exacto de la versión declarada de LTX-2.5, sin modificaciones en los valores de los pesos.

## Capacidades

- **Weight streaming por bloques**: permite cargar el DiT de forma incremental durante la inferencia, reduciendo la memoria residente.
- **Salida bit-idéntica**: la generación con streaming produce resultados exactamente iguales al modelo residente, verificado con `memcmp`.
- **Cuantización dual**: ofrece variantes `bf16` (alta precisión) y `q8` (menor uso de memoria) para adaptarse a diferentes hardware.
- **Integración con MLX**: diseñado para el ecosistema MLX de Apple, consumido por `ltx-2-mlx-swift` y `BlockStreamKit`.
- **Soporte de control de procedencia**: manifiestos con hashes y revisiones verificables para auditoría de integridad.
- **Compatibilidad con el pipeline text-to-video**: hereda las capacidades del modelo base LTX-2.5, incluyendo generación de video, imagen a video y simulación de mundo.

## Casos de uso

- **Generación de video en estaciones de trabajo con GPU de 24 GB**: con la variante `q8`, el espacio residente del DiT se reduce a ~1,5 GiB, lo que permite ejecutar LTX-2.5 en tarjetas como la RTX 3090 o RTX 4090, que antes no podían con el modelo completo.
- **Despliegue en GPU de 32 GB (p. ej., A6000)**: con `bf16` o `q8`, el streaming elimina la necesidad de mantener el DiT completo en VRAM, liberando memoria para otros procesos o mayores resoluciones de generación.
- **Inferencia en servidores con SSD NVMe**: el streaming solapado aprovecha el alto rendimiento de los SSD para mantener la velocidad de generación sin penalización de latencia.
- **Prototipado y evaluación local**: investigadores pueden evaluar LTX-2.5 en hardware de consumo sin necesidad de acceder a clusters de GPU grandes, facilitando pruebas de concepto y desarrollo.
- **Entornos con memoria compartida**: en sistemas con múltiples modelos cargados, el streaming permite compartir la VRAM de forma más flexible, descargando el DiT cuando no se usa.
- **Optimización de costes en producción**: al reducir la huella de memoria, se pueden ejecutar más instancias por GPU o usar GPUs más económicas, reduciendo el coste por generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para `xocialize/ltx-2.5-granules` en la información disponible. Sin embargo, la documentación indica que:

- La salida es **bit-idéntica** al modelo residente, por lo que el rendimiento cualitativo (calidad de video, adherencia al prompt) es el mismo que el de `Lightricks/LTX-2.5`.
- En máquinas de **64 GB**, el streaming se midió **más rápido** que el residente, porque evita la recarga completa del DiT en cada etapa de denoise.
- En configuraciones con poca memoria, el streaming permite ejecutar el modelo donde antes era imposible, aunque la amplificación de lectura (~6×) puede suponer una carga adicional en el SSD.

No se proporcionan métricas de calidad (FID, CLIP, etc.) ni comparativas formales en el repositorio.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - Variante `q8`: ~1.5 GiB por slot residente (más el resto del modelo).
  - Variante `bf16`: ~2.9 GiB por slot residente.
- **GPU recomendadas**: cualquier GPU con 24 GB o más de VRAM (RTX 4090, A6000, A100, H100). En GPUs de 16 GB no es viable sin cuantización adicional.
- **Consumer GPU**: sí, es posible en RTX 4090 (24 GB) con la variante `q8`, siempre que se disponga de un SSD NVMe rápido para el streaming.
- **Opciones de despliegue**: el runtime oficial es `ltx-2-mlx-swift` (Swift) con `BlockStreamKit`. No se menciona soporte para vLLM, Ollama o TGI en esta versión.
- **Latencia y throughput**: no hay mediciones públicas. El streaming solapado minimiza el impacto en el tiempo de generación, pero depende del rendimiento del SSD y del número de tokens generados.

## Comparativa con modelos similares

| Modelo | Formato | Memoria residente | Calidad de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **LTX-2.5 granules (este)** | MLX, streaming | ~1.5 GiB (q8) / ~2.9 GiB (bf16) | Bit-idéntica al original | LTX-2 Community License | Público en HF |
| **Lightricks/LTX-2.5** (original) | PyTorch (probablemente) | completa (no especificada) | Original | LTX-2 Community License | Público en HF |
| **mlx-community/ltx-2.5-mlx** | MLX, residente | completa (no especificada) | Bit-idéntica al original | LTX-2 Community License | Público en HF |
| **mlx-community/ltx-2.5-mlx-ditq8** | MLX, residente, q8 | menor que bf16 | Bit-idéntica (cuantizada) | LTX-2 Community License | Público en HF |

La ventaja de `granules` sobre las versiones residentes es la reducción de la huella de memoria a costa de mayor I/O, permitiendo ejecutar el modelo en hardware con menos VRAM.

## Limitaciones y advertencias

- **Amplificación de lectura**: el streaming consume ~6× más datos del SSD que una carga residente. Esto puede causar un desgaste mayor del disco y un aumento del consumo energético, especialmente en portátiles (no medido en batería).
- **Umbral de rentabilidad**: el streaming solo es ventajoso por encima de un umbral de tokens que el runtime calcula dinámicamente. Por debajo de ese umbral, el sistema vuelve al modo residente (la salida es la misma, pero el rendimiento puede variar).
- **Licencia restrictiva**: la licencia LTX-2 Community License incluye un "Attachment A revenue gate" y una cláusula de no competencia. Uso comercial requiere revisión de los términos, y la redistribución debe mantener los términos originales.
- **Dependencia de SSD rápido**: el rendimiento depende críticamente de la velocidad de lectura del SSD. En discos lentos, el streaming puede degradar el tiempo de generación.
- **Soporte limitado**: el formato es específico para el ecosistema MLX y la librería `BlockStreamKit`. No es compatible directamente con otras herramientas de inferencia (vLLM, TGI, etc.).
- **Sin benchmarks propios**: no hay métricas de calidad específicas del repositorio, aunque la salida bit-idéntica garantiza la calidad del modelo base.

## Enlaces

- [Repositorio HuggingFace: xocialize/ltx-2.5-granules](https://huggingface.co/xocialize/ltx-2.5-granules)
- [Modelo base: Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5)
- [Versión MLX residente: mlx-community/ltx-2.5-mlx](https://huggingface.co/mlx-community/ltx-2.5-mlx)
- [Versión MLX cuantizada: mlx-community/ltx-2.5-mlx-ditq8](https://huggingface.co/mlx-community/ltx-2.5-mlx-ditq8)
- [Consumidor: ltx-2-mlx-swift](https://github.com/xocialize/ltx-2-mlx-swift)
- [Librería de streaming: BlockStreamKit](https://github.com/xocialize/mlx-block-stream-swift)
- [Modelo hermano: xocialize/ltx-2.3-granules](https://huggingface.co/xocialize/ltx-2.3-granules)
- [Página oficial de LTX-2.5](https://ltx.io/model/ltx-2-5)
