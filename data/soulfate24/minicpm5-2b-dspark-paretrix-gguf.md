# Soulfate24/MiniCPM5-2B-DSpark-Paretrix-GGUF

## Resumen

MiniCPM5-2B-DSpark-Paretrix-GGUF es una distribución de cuantizaciones GGUF del modelo base openbmb/MiniCPM5-2B, publicada por el usuario Soulfate24 bajo el paraguas de su suite Paretrix. No se trata de un modelo entrenado desde cero, sino de un conjunto de pesos cuantizados en formato GGUF, optimizados mediante una metodología empírica de asignación de bits por clase de tensor, junto con un módulo de decodificación especulativa (DSpark) que actúa como draft. El modelo base pertenece a la familia MiniCPM5 de OpenBMB, con 2.516.756.480 parámetros (aproximadamente 2,5 mil millones) y licencia Apache 2.0.

El interés de esta publicación reside en su enfoque de cuantización híbrida: en lugar de aplicar una familia de bitwidth uniforme a toda la red, Paretrix mide la respuesta de cada clase de tensor a cada tipo de cuantización contra los logits de referencia en BF16, y planifica cada escalón de la escalera de cuantizaciones mediante un problema de mochila exacto. El resultado es una serie de variantes (Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc) que ofrecen diferentes compromisos entre tamaño en disco y degradación de perplejidad.

La relevancia actual del artefacto es doble: por un lado, permite ejecutar un modelo de 2,5B parámetros con contexto largo y soporte de tool calling en hardware de consumo y dispositivos edge; por otro, documenta de forma cuantitativa el coste de cada reducción de bits, lo que facilita decisiones de despliegue informadas. La model card incluye métricas de perplejidad, KLD, RMS de la diferencia de probabilidad y top-p para cada variante, lo que constituye una guía práctica poco habitual en publicaciones de cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia MiniCPM5); no se detalla en la informacion disponible si incorpora componentes MoE o híbridos |
| Parametros totales | 2.516.756.480 (2,5B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el tag "long-context" sugiere ventana extendida, pero sin cifra concreta) |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx (stock) y variantes Paretrix: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de 30,7 GB con múltiples variantes); el modelo base también disponible en safetensors |

## Arquitectura y entrenamiento

El modelo base openbmb/MiniCPM5-2B es un transformer de 2,5 mil millones de parámetros. La model card de esta publicación no describe la arquitectura interna del modelo base (número de capas, dimensiones ocultas, tipo de atención), por lo que esos detalles no están disponibles en la información proporcionada. Los tags indican soporte de contexto largo, tool calling y decodificación especulativa mediante el módulo DSpark, que actúa como modelo draft para acelerar la inferencia.

El entrenamiento del modelo base, según los datasets referenciados, habría utilizado openbmb/Ultra-FineWeb, UltraX-Preview y Ultra-FineWeb-L3 para preentrenamiento, junto con UltraData-Math y UltraData-Code para datos de dominio, y UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609 para las fases de ajuste supervisado, agentes y refuerzo. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset. La innovación técnica de esta publicación es la cuantización Paretrix: un procedimiento que, partiendo de tres bases stock (Q8_0, Q6_K-imx, IQ4_XS-imx), mueve cada clase de tensor individualmente a cada tipo de cuantización, mide la divergencia frente a los logits BF16 y resuelve un problema de mochila exacto para planificar cada escalón. Un duelo en el régimen de veredicto decide si el plan sustituye al campeón previo. La suite se describe como heredable entre modelos de la misma familia.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Soporte de tool calling / function calling, según los tags del repositorio.
- Capacidades orientadas a agentes y razonamiento multi-paso, respaldadas por el dataset UltraData-SFT-Agent-2609.
- Contexto largo (tag "long-context"), sin cifra concreta disponible.
- Decodificación especulativa mediante el módulo draft DSpark, que acelera la generación.
- Optimizado para despliegue on-device y edge (tags "on-device", "edge-ai").
- Compatible con llama.cpp y con endpoints compatibles (tag "endpoints_compatible").
- No se documentan capacidades de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Asistentes conversacionales en dispositivos edge: la variante Mini-30pc (1487 MiB) o Nano-27pc (1350 MiB) permite ejecutar un modelo de 2,5B en hardware con poca memoria, manteniendo una perplejidad de 12,32 y 12,40 respectivamente, adecuada para chat multi-turno en inglés y chino.
- Agentes con tool calling en producción: el soporte de function calling y los datos de ajuste para agentes permiten integrar el modelo en pipelines que invocan APIs externas, con la ventaja de que las variantes Q8_0 o Fidelity-48pc preservan la fidelidad de los logits (KLD de 0,0015 y 0,0026) necesaria para decisiones de herramientas fiables.
- Procesamiento de documentos largos: el tag de contexto largo sugiere uso en resumen y extracción de información sobre documentos extensos, aunque la longitud exacta de ventana no está confirmada en la información disponible.
- Aceleración de inferencia con decodificación especulativa: el módulo DSpark actúa como draft para reducir la latencia en servidores con llama.cpp, útil en aplicaciones interactivas donde el tiempo de respuesta es crítico.
- Despliegue en entornos con restricciones de memoria: la variante Femto-21pc (1072 MiB) permite ejecutar el modelo en dispositivos con menos de 1,5 GB de RAM disponible, a costa de una perplejidad de 14,15 y un top-p del 77,0 %, aceptable para tareas de clasificación o generación corta.
- Evaluación comparativa de cuantizaciones: la tabla de métricas publicada (PPL, KLD, RMS Δp, top-p) sirve como referencia para ingenieros que necesitan elegir el punto de la escalera adecuado para su presupuesto de memoria, sin necesidad de medir por su cuenta.
- Investigación en técnicas de cuantización: la metodología Paretrix, con su enfoque de mochila exacto y medición por clase de tensor, es un caso de estudio reproducible para quienes trabajan en compresión de modelos.

## Benchmarks y rendimiento

La model card proporciona métricas de calidad de cuantización, no benchmarks de tareas (MMLU, HumanEval, GSM8K). Se reproducen a continuación los datos publicados:

| Variante | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 2556 | 11,9747 | +0,0145 | 0,0015 | 1,02 % | 97,8 % |
| Fidelity-48pc | 2309 | 11,9989 | +0,0387 | 0,0026 | 1,32 % | 97,3 % |
| Precision-42pc | 2060 | 12,0119 | +0,0517 | 0,0040 | 1,59 % | 96,6 % |
| Q6_K-imx (stock) | 1974 | 12,0129 | +0,0526 | 0,0059 | 1,92 % | 95,8 % |
| Quality-36pc | 1772 | 12,0388 | +0,0785 | 0,0103 | 2,57 % | 94,6 % |
| Q5_K_M-imx (stock) | 1724 | 12,1174 | +0,1571 | 0,0171 | 3,41 % | 93,3 % |
| Compact-33pc | 1628 | 12,1418 | +0,1815 | 0,0166 | 3,35 % | 93,2 % |
| Mini-30pc | 1487 | 12,3175 | +0,3573 | 0,0347 | 4,77 % | 90,3 % |
| IQ4_XS-imx (stock) | 1358 | 12,4567 | +0,4965 | 0,0712 | 6,72 % | 87,0 % |
| Nano-27pc | 1350 | 12,3951 | +0,4349 | 0,0546 | 5,88 % | 88,4 % |
| Pico-24pc | 1210 | 12,9000 | +0,9398 | 0,1025 | 8,11 % | 84,1 % |
| IQ3_M-imx (stock) | 1169 | 13,9382 | +1,9779 | 0,2027 | 11,87 % | 78,5 % |
| Femto-21pc | 1072 | 14,1474 | +2,1871 | 0,2003 | 11,66 % | 77,0 % |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre aproximadamente 1,1 GB (Femto-21pc) y 2,6 GB (Q8_0) para los pesos, más el overhead de contexto y del módulo draft DSpark. Con contexto largo, el consumo de KV cache puede incrementar sustancialmente el total.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, el modelo cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) y en GPUs de datacenter como A100 o H100, aunque en estas últimas el modelo estaría infrautilizado.
- Cabe en GPU de consumo: sí, todas las variantes caben en GPUs con 4 GB o más de VRAM, e incluso en iGPUs y dispositivos edge con memoria unificada.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con endpoints (tag "endpoints_compatible"). No se menciona soporte de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles. La decodificación especulativa con DSpark está diseñada para reducir la latencia, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| MiniCPM5-2B-DSpark-Paretrix (este) | 2,5B | no disponible | Apache 2.0 | GGUF | Cuantización híbrida Paretrix con draft DSpark |
| openbmb/MiniCPM5-2B (base) | 2,5B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| openbmb/MiniCPM5-2B-DSpark (base) | 2,5B | no disponible | Apache 2.0 | safetensors | Modelo base con módulo draft |
| Qwen2.5-1.5B / 3B | 1,5B / 3B | 32K (según versión) | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar con amplia comunidad; datos de contexto según documentación pública de Qwen |
| Llama 3.2 1B / 3B | 1B / 3B | 128K | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamaño similar; licencia no Apache |

No se dispone de datos de benchmarks de tareas que permitan comparar el rendimiento real frente a estas alternativas. La comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- La longitud de contexto no está confirmada numéricamente; el tag "long-context" no especifica la ventana real, lo que impide planificar despliegues con requisitos de contexto concretos.
- Las variantes de menor tamaño (Pico-24pc, Femto-21pc) presentan una degradación notable: PPL de 12,90 y 14,15 frente a 11,97 del Q8_0, con top-p del 84,1 % y 77,0 %, lo que puede afectar a tareas que requieren precisión en la distribución de probabilidad.
- No se han publicado benchmarks de tareas (razonamiento, código, matemáticas), por lo que no es posible evaluar el rendimiento real del modelo en esas capacidades.
- El repositorio tiene 30,7 GB y contiene múltiples variantes; la descarga completa no es necesaria, pero requiere seleccionar el archivo GGUF adecuado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets subyacentes pueden tener sus propias condiciones; conviene verificar la licencia de openbmb/MiniCPM5-2B y de los datasets UltraData.
- Riesgo de alucinación inherente a modelos de 2,5B parámetros, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- La metodología Paretrix es propietaria del autor de la cuantización y no está validada de forma independiente en la información disponible; las métricas publicadas son las del propio autor.
- El módulo DSpark requiere configuración específica en llama.cpp para la decodificación especulativa; no todos los backends lo soportan.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/MiniCPM5-2B-DSpark-Paretrix-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Modelo base con draft: https://huggingface.co/openbmb/MiniCPM5-2B-DSpark
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset UltraX-Preview: https://huggingface.co/datasets/openbmb/UltraX-Preview
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset UltraData-Code: https://huggingface.co/datasets/openbmb/UltraData-Code
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- Dataset UltraData-SFT-Agent-2609: https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609
- Dataset UltraData-RL-2609: https://huggingface.co/datasets/openbmb/UltraData-RL-2609
