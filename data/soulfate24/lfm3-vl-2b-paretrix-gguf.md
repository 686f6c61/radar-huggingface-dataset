# Soulfate24/LFM3-VL-2B-Paretrix-GGUF

## Resumen

LFM3-VL-2B-Paretrix-GGUF es una colección de cuantizaciones GGUF del modelo LiquidAI/LFM3-VL-2B, publicada por el usuario Soulfate24 bajo el paraguas de su suite experimental Paretrix. El modelo base es un modelo vision-lenguaje de Liquid AI con aproximadamente 1.730 millones de parámetros, orientado a despliegue en el borde (edge), con pipeline image-text-to-text y soporte para 16 idiomas. Esta ficha describe la variante cuantizada, no el modelo original.

El interés de esta publicación no reside en el modelo en sí, sino en la metodología de cuantización: Paretrix aplica un esquema empírico y sensible a la activación que planifica cada nivel de cuantización mediante una mochila exacta sobre mediciones por clase de tensor, en lugar de aplicar una familia de bitwidth uniforme a toda la red. El autor reporta métricas de perplejidad, divergencia KL y RMS de diferencia de probabilidad frente a los logits en BF16 para cada variante.

La relevancia es doble: por un lado, ofrece alternativas GGUF con perfiles de fidelidad, precisión o tamaño que no siguen la escala estándar de llama.cpp; por otro, documenta un proceso reproducible de optimización de cuantización que otros pueden heredar para modelos de la misma familia. No obstante, se trata de una publicación con cero descargas y cero likes en el momento de redactar, sin validación externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-VL-2B; el autor no detalla la arquitectura en la model card) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card (el régimen de verificación de benchmarks es ctx 4096×8) |
| Tipos de cuantizacion | GGUF con niveles propietarios: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc, además de referencias stock Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (other) |
| Formato de pesos | GGUF (repositorio etiquetado también como transformers) |

## Arquitectura y entrenamiento

La model card de esta variante no describe la arquitectura del modelo base ni sus datos de entrenamiento. Se sabe, por los tags del repositorio, que el modelo subyacente es LiquidAI/LFM3-VL-2B, un modelo vision-lenguaje de la familia LFM3 de Liquid AI, con pipeline image-text-to-text y etiqueta "liquid", "edge" y "conversational". No se dispone de información sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento.

La innovación técnica documentada en esta publicación es el proceso de cuantización Paretrix. El autor describe un procedimiento en tres fases: primero, alrededor de tres bases stock (Q8_0, Q6_K-imx, IQ4_XS-imx), cada clase de tensor se mueve de forma aislada a cada tipo de cuantización y se mide contra los logits en BF16; segundo, una mochila exacta planifica cada nivel a partir de esas celdas de medición; tercero, un duelo en el régimen de verificación (ctx 4096×8, build 12283 de llama.cpp) decide si el plan reemplaza al campeón. El autor afirma que "lo que un modelo mide, el siguiente modelo de su familia lo hereda", lo que sugiere transferibilidad del plan entre miembros de la familia LFM3.

## Capacidades

- Generación de texto conversacional, según la etiqueta "conversational" del repositorio.
- Procesamiento de imagen y texto conjuntamente (pipeline image-text-to-text): el modelo acepta entradas visuales y genera texto.
- Soporte multilingüe para 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Orientación a despliegue en el borde ("edge") por el tamaño reducido del modelo base (1,73 mil millones de parámetros).
- Ejecución mediante llama.cpp y compatibilidad con endpoints, según los tags del repositorio.
- No se documentan en la model card capacidades de tool calling, function calling, razonamiento multi-paso, modo thinking, audio ni decodificación especulativa.

## Casos de uso

- Asistencia visual en dispositivos de borde: con 1,73 mil millones de parámetros y variantes GGUF desde 738 MiB (Femto-21pc) hasta 1761 MiB (Q8_0), el modelo puede ejecutarse en hardware con recursos limitados para tareas de descripción de imágenes o respuesta a preguntas sobre capturas.
- Procesamiento de documentos escaneados en local: la combinación de entrada de imagen y generación de texto permite extraer y resumir contenido de facturas, formularios o tickets sin enviar datos a la nube, usando la variante Quality-36pc (1219 MiB) como equilibrio entre tamaño y fidelidad.
- Aplicaciones multilingües de atención al cliente con componente visual: los 16 idiomas soportados permiten atender consultas con imágenes adjuntas (capturas de error, fotos de producto) en mercados diversos.
- Prototipado rápido en portátiles: la variante Nano-27pc (927 MiB) o Pico-24pc (832 MiB) permite cargar el modelo en memoria RAM o VRAM modesta para pruebas de concepto de pipelines image-text-to-text con llama.cpp.
- Clasificación y moderación de contenido visual: el modelo puede generar descripciones de imágenes para su revisión posterior en sistemas de moderación, ejecutándose en el mismo servidor que el resto del pipeline.
- Investigación en cuantización: las variantes Paretrix sirven como material de estudio para comparar curvas de perplejidad y divergencia KL frente a las cuantizaciones stock de llama.cpp, dado que el autor publica las métricas por nivel.

## Benchmarks y rendimiento

La model card proporciona métricas de calidad de cuantización medidas contra los logits en BF16, no benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Se reproducen a continuación:

| Variante | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 1761 | 72,5538† | −0,2753 | 0,0023 | 1,01% | 97,6% |
| Fidelity-48pc | 1594 | 72,8550 | +0,0258 | 0,0037 | 1,30% | 96,8% |
| Precision-42pc | 1415 | 73,0043 | +0,1752 | 0,0063 | 1,68% | 96,0% |
| Q6_K-imx (stock) | 1362 | 71,6059† | −1,2232 | 0,0103 | 2,04% | 94,9% |
| Quality-36pc | 1219 | 72,6376† | −0,1915 | 0,0171 | 2,65% | 93,5% |
| Q5_K_M-imx (stock) | 1200 | 74,3414 | +1,5122 | 0,0291 | 3,52% | 91,6% |
| Compact-33pc | 1121 | 72,1034† | −0,7258 | 0,0323 | 3,75% | 90,8% |
| Mini-30pc | 1021 | 68,6162† | −4,2129 | 0,0593 | 5,07% | 88,1% |
| IQ4_XS-imx (stock) | 957 | 81,4215 | +8,5924 | 0,1518 | 7,96% | 82,1% |
| Nano-27pc | 927 | 68,0712† | −4,7579 | 0,0921 | 6,34% | 84,9% |
| Pico-24pc | 832 | 69,6922† | −3,1369 | 0,1717 | 8,68% | 80,2% |
| IQ3_M-imx (stock) | 829 | 77,6138 | +4,7846 | 0,2681 | 10,69% | 75,7% |
| Femto-21pc | 738 | 66,9075† | −5,9217 | 0,2902 | 10,90% | 74,2% |

El autor marca con ★ las variantes que considera parte de la frontera de Pareto y con ⭐ la recomendada (Quality-36pc). El símbolo † indica valores de PPL que, según la tabla, no siguen el patrón de empeoramiento monótono con el tamaño; el autor no explica en la model card el motivo de estas anomalías. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre aproximadamente 0,8 GB y 1,8 GB para los pesos según la variante (de Femto-21pc a Q8_0), más el espacio para el contexto KV y el codificador visual del modelo base.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería poder alojar las variantes más pequeñas.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, así como en iGPU y CPU, dado el rango de 738 a 1761 MiB de pesos.
- Opciones de despliegue: llama.cpp (build 12283 citado por el autor) y, por los tags, endpoints compatibles; el repositorio también está etiquetado como transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| LFM3-VL-2B-Paretrix-GGUF (esta ficha) | 1,73 B | no disponible | lfm1.0 | GGUF | Cuantizaciones propietarias con métricas de PPL/KLD publicadas |
| LiquidAI/LFM3-VL-2B (base) | 1,73 B | no disponible | lfm1.0 | safetensors | Modelo original sin cuantizar; referencia BF16 |
| Q8_0 / Q6_K-imx / IQ4_XS-imx (stock) | 1,73 B | no disponible | lfm1.0 | GGUF | Cuantizaciones estándar de llama.cpp incluidas como referencia en la propia tabla del autor |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base ni del proceso de cuantización.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas para esta variante.
- Las métricas de PPL de la tabla muestran valores marcados con † que rompen la monotonicidad esperada (por ejemplo, Mini-30pc con PPL 68,6162 frente a Q8_0 con 72,5538); el autor no explica estas anomalías, lo que dificulta interpretar la calidad real de cada nivel.
- Los nombres de las variantes (Fidelity, Precision, Quality, Compact, Mini, Nano, Pico, Femto) son propietarios y no se corresponden con la nomenclatura estándar de llama.cpp, lo que complica la comparación con otros repositorios.
- La licencia lfm1.0 ("other") impone condiciones que deben revisarse en el archivo LICENSE del repositorio antes de cualquier uso comercial; no se detallan en la model card.
- El repositorio tiene cero descargas y cero likes, y no se ha identificado validación independiente de las métricas reportadas.
- El contexto máximo del modelo base no se documenta en esta ficha; el régimen de verificación de 4096×8 es una configuración de prueba, no necesariamente el límite del modelo.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/LFM3-VL-2B-Paretrix-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- llama.cpp: https://github.com/ggml-org/llama.cpp
