# WPLab/ma-moe-tiers

## Resumen

WPLab/ma-moe-tiers es un archivo de pesos que agrupa cuatro modelos de lenguaje de tipo Mixture of Experts (MoE), entrenados desde inicialización aleatoria por el autor WPLab para una competición de modelado de lenguaje. No se trata de un modelo único, sino de un repositorio con cuatro variantes de distinto tamaño y presupuesto de cómputo (desde ~3e17 hasta ~1e19 FLOPs), todas con arquitectura de 60 expertos por capa y 5 activos, sin expertos compartidos.

La relevancia técnica del conjunto está en su diseño experimental: incorpora mecanismos poco habituales como Engram de 2/3-gramas, value embeddings, mezcla x0, conexiones de salto tipo U-net y softcap. Cada variante incluye pesos completos en FP32, configuración, código de modelo personalizado y tokenizador, pero no estados de optimizador. El repositorio ocupa 60,3 GB y cada variante pesa entre 14 y 17 GB, con la mayor parte del tamaño concentrada en las tablas Engram.

El modelo más grande, M71 (H768/L18), fue entrenado con 12.562 millones de tokens y alcanza un BPB de 0,846 en la evaluación local del autor. La licencia es "other", sin especificación de términos de uso comercial, y no se declaran idiomas soportados ni pipeline de inferencia en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 60 expertos por capa, 5 activos, sin expertos compartidos; incluye Engram 2/3-gram, value embeddings, mezcla x0, saltos U-net y softcap |
| Parametros totales | M12: 292.160.042 (no vocabulario); M03: 292.160.042; M28: 547.261.221; M71: 984.112.953 |
| Parametros activos | 32.637.482 (M12/M03); 60.656.421 (M28); 108.224.313 (M71) |
| Longitud de contexto | Ventana deslizante de 512 y ventana completa de 2048 en la evaluación local; packing de 16K y 32K probado en M71 |
| Tipos de cuantizacion | Pesos originales en FP32; carga con dtype configurable (bfloat16 en el ejemplo); no se documentan cuantizaciones GGUF/AWQ/GPTQ |
| Idiomas soportados | no disponible |
| Licencia | other (términos no especificados) |
| Formato de pesos | safetensors (FP32), con código de modelo personalizado y tokenizador en formato Transformers |

## Arquitectura y entrenamiento

Los cuatro modelos son transformers con capas MoE de 60 expertos y 5 activos por token, sin experto compartido. Sobre esa base se añaden componentes propios: Engram de 2/3-gramas (tablas de n-gramas que explican el grueso del tamaño en disco), value embeddings, mezcla x0, conexiones de salto tipo U-net entre capas y softcap en la salida. Las dimensiones varían: M12 y M03 usan H512/L12, M28 usa H768/L10 y M71 usa H768/L18.

Todos los modelos se entrenaron desde inicialización aleatoria exclusivamente con el corpus oficial de la competición. El presupuesto de cómputo va de 299.980.258.843.557.888 FLOPs (M12) a 9.999.962.401.690.091.520 FLOPs (M71), con volúmenes de tokens de 1.096 millones a 12.563 millones respectivamente. No se documenta uso de RLHF ni DPO. La evaluación local emplea Linear FP8, expertos Sonic BF16 y packing de 16K, con ventana de atención deslizante de 512 y ventana completa de 2048.

## Capacidades

- Generación de texto autorregresiva con modelado de lenguaje causal.
- Razonamiento y modelado estadístico de secuencias mediante mecanismos Engram de 2/3-gramas.
- Capacidad multilingüe: no disponible (no se declaran idiomas).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Visión, audio o modos "thinking": no disponibles.
- Carga mediante `trust_remote_code=True` con código de modelo propio incluido en el repositorio.

## Casos de uso

- Investigación en arquitecturas MoE: el conjunto permite comparar cuatro escalas de cómputo (3e17 a 1e19 FLOPs) con la misma familia de componentes, útil para estudiar leyes de escalado con Engram y saltos U-net.
- Estudio de mecanismos Engram: al ser las tablas de n-gramas la mayor parte del peso, sirve para analizar el coste/beneficio de memorias de n-gramas frente a parámetros densos.
- Reproducción de experimentos de competición: los manifiestos SHA256 y las configuraciones originales permiten replicar las mediciones de BPB reportadas.
- Evaluación de backends de inferencia: el autor reporta variantes con packing de 16K/32K y enrutamiento SGL64, lo que permite comparar protocolos de ejecución sobre los mismos pesos.
- Benchmarking de eficiencia MoE: con 5 de 60 expertos activos y parámetros activos de 32M a 108M, es adecuado para medir throughput y latencia en regímenes de baja activación.
- Formación y docencia: modelos pequeños en parámetros activos con código legible para estudiar implementaciones MoE personalizadas en Transformers.

## Benchmarks y rendimiento

| Modelo | FLOPs de entrenamiento | Tokens de entrenamiento | BPB completo A (16K) |
|---|---:|---:|---:|
| M12 (H512/L12) | 299.980.258.843.557.888 | 1.096.548.352 | 1,007573521 |
| M03 (H512/L12) | 999.982.005.573.648.384 | 3.655.335.936 | 0,943671085 |
| M28 (H768/L10) | 3.000.058.144.358.400.000 | 6.351.749.120 | 0,905723277 |
| M71 (H768/L18) | 9.999.962.401.690.091.520 | 12.562.989.056 | 0,846330691 |

Para M71 se reportan además: packing de 32K con BPB 0,845085544 y tiempo normalizado 7,089470; enrutamiento SGL64 con 16K y BPB 0,846329788 y tiempo 6,524409. La métrica BPB cubre 120.009.843 objetivos y 445.910.984 bytes de texto en la evaluación local del autor, no la evaluación oficial de la competición. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: cada variante pesa 14–17 GB en FP32; en bfloat16 se reduce aproximadamente a la mitad (7–8,5 GB), aunque el ejemplo de carga usa `dtype="bfloat16"`.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o A100/H100 son suficientes para una variante en bfloat16.
- Cabe en GPU de consumo: sí, en tarjetas con 16–24 GB para una sola variante en bfloat16; en FP32 requiere 24 GB o más.
- Opciones de despliegue: Transformers 5.8.1 con `trust_remote_code=True`; el autor menciona backends opcionales de inferencia (Linear FP8, expertos Sonic BF16, enrutamiento SGL64) que no se instalan automáticamente.
- Latencia y throughput: solo se reporta tiempo normalizado para M71 (7,103782 en 16K; 6,524409 con SGL64); no hay datos de latencia absoluta ni throughput por hardware.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Licencia "other" sin términos explícitos: el uso comercial no está garantizado y requiere revisión legal.
- No se declaran idiomas soportados; el corpus de entrenamiento es el de una competición, con posible sesgo de dominio y cobertura limitada.
- Riesgo de alucinación no evaluado: no hay benchmarks de fidelidad ni de razonamiento estándar.
- El repositorio es un archivo de pesos, no un paquete de envío completo de la competición; el autor lo indica explícitamente.
- Requiere `transformers==5.8.1` y `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio.
- Las mediciones de BPB son locales del autor y no equivalen a la evaluación oficial; el propio autor advierte que los resultados finales dependen de la revisión del organizador.
- Los backends opcionales de inferencia no se instalan automáticamente y la combinación 32K + SGL64 no está validada.
- El tamaño del repositorio (60,3 GB) y la necesidad de descargar variantes completas pueden complicar el despliegue en entornos con almacenamiento limitado.

## Enlaces

- Hugging Face: https://huggingface.co/WPLab/ma-moe-tiers
