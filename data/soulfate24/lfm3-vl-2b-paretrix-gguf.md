# Soulfate24/LFM3-VL-2B-Paretrix-GGUF

## Resumen

LFM3-VL-2B-Paretrix-GGUF es una colección de cuantizaciones GGUF no uniformes del modelo multimodal LiquidAI/LFM3-VL-2B, publicada por el usuario Soulfate24 bajo el paraguas de su suite experimental Paretrix. El modelo base es un transformer híbrido de Liquid AI orientado a despliegue en el borde (edge), con capacidad de entrada imagen-texto y salida de texto, y aproximadamente 1.730 millones de parámetros en pesos safetensors. Esta ficha describe principalmente la variante cuantizada, ya que es el artefacto publicado en el repositorio.

El interés del repositorio no reside en el modelo base, sino en la metodología de cuantización: en lugar de aplicar una familia de bitwidth uniforme a toda la red, Paretrix mide la respuesta de cada clase de tensor a cada tipo de cuantización contra los logits en BF16 y planifica cada nivel mediante una mochila exacta (knapsack) que maximiza la fidelidad bajo un presupuesto de tamaño. El resultado son niveles con nombres como Fidelity-48pc, Quality-36pc o Nano-27pc, con métricas de perplejidad, divergencia KL, RMS de diferencia de probabilidad y retención de top-p documentadas para cada uno.

Es relevante ahora porque ofrece alternativas intermedias entre los GGUF estándar (Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx) en el rango de 738 a 1594 MiB, lo que permite ajustar el equilibrio tamaño-calidad en despliegues con restricciones de memoria, como dispositivos de borde o GPUs de consumo. La licencia del modelo base es LFM1.0 (licencia propia de Liquid AI, marcada como "other"), lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (modelo base LiquidAI/LFM3-VL-2B; detalles internos no disponibles en la información proporcionada) |
| Parametros totales | 1.728.801.600 (pesos safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx (stock) y niveles Paretrix Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (repositorio de 9,5 GB con múltiples niveles); el modelo base en safetensors |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base más allá de las etiquetas "liquid", "lfm3", "hybrid-quantization" y "vision". Por el nombre y la familia (LFM3-VL), se trata de un modelo de lenguaje y visión de Liquid AI con diseño híbrido, pero los detalles concretos de capas, mecanismos de atención o componentes de estado no están disponibles en la información proporcionada. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica documentada es la propia cuantización Paretrix. El proceso parte de tres bases stock (Q8_0, Q6_K-imx e IQ4_XS-imx), mueve cada clase de tensor de forma aislada a cada tipo de cuantización y mide la desviación frente a los logits en BF16. Con esas celdas de medida, una mochila exacta planifica cada nivel, y un duelo en el régimen de veredicto decide si el plan sustituye al campeón vigente. La model card indica además que las medidas de un modelo se heredan al siguiente modelo de la misma familia, lo que sugiere un enfoque transferible dentro de la familia LFM3.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta "conversational" del repositorio.
- Comprensión de imagen y texto con salida de texto (pipeline image-text-to-text), lo que habilita tareas de descripción de imágenes, respuesta a preguntas visuales y extracción de información de capturas o documentos.
- Cobertura multilingüe en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Compatibilidad con llama.cpp y con endpoints compatibles (etiqueta endpoints_compatible), lo que facilita su integración en servidores de inferencia locales.
- Soporte de cuantización híbrida por clases de tensor, con niveles que permiten seleccionar el equilibrio entre tamaño y fidelidad.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso explícito, modo thinking, audio ni agentes. No deben asumirse.

## Casos de uso

- Asistente visual en dispositivos de borde: con niveles como Nano-27pc (927 MiB) o Pico-24pc (832 MiB), el modelo puede ejecutarse en hardware con memoria limitada para describir imágenes o responder preguntas sobre ellas en tiempo real, sin depender de la nube.
- Moderación y etiquetado de imágenes a escala: el nivel Quality-36pc (1219 MiB) mantiene una retención de top-p del 93,5% y una divergencia KL de 0,0171, suficiente para clasificar y anotar lotes de imágenes en pipelines de datos.
- Atención al cliente multimodal: el modelo puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas de pantalla o fotos de productos; su naturaleza conversacional y su cobertura de 16 idiomas lo hacen adecuado para soporte en mercados internacionales.
- Extracción de información de documentos escaneados: combinando la entrada de imagen con la salida de texto, puede transcribir y estructurar datos de facturas, formularios o tickets en entornos con recursos limitados.
- Prototipado rápido en portátiles: los niveles Fidelity-48pc (1594 MiB) y Precision-42pc (1415 MiB) permiten a desarrolladores probar la variante de mayor fidelidad en una GPU de consumo o incluso en CPU con llama.cpp antes de decidir un despliegue mayor.
- Investigación en cuantización: el repositorio sirve como banco de pruebas reproducible para estudiar el compromiso entre tamaño, perplejidad y divergencia KL, ya que publica métricas por nivel y compara contra cuantizaciones stock.
- Despliegue en entornos con requisitos de latencia estrictos: al reducir el tamaño del modelo hasta 738 MiB en el nivel Femto-21pc, se puede priorizar el throughput sobre la fidelidad en tareas de clasificación visual simple.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí incluye métricas de calidad de cuantización medidas contra los logits en BF16:

| Nivel | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 1761 | 72,5538 | −0,2753 | 0,0023 | 1,01% | 97,6% |
| Fidelity-48pc | 1594 | 72,8550 | +0,0258 | 0,0037 | 1,30% | 96,8% |
| Precision-42pc | 1415 | 73,0043 | +0,1752 | 0,0063 | 1,68% | 96,0% |
| Q6_K-imx (stock) | 1362 | 71,6059 | −1,2232 | 0,0103 | 2,04% | 94,9% |
| Quality-36pc | 1219 | 72,6376 | −0,1915 | 0,0171 | 2,65% | 93,5% |
| Q5_K_M-imx (stock) | 1200 | 74,3414 | +1,5122 | 0,0291 | 3,52% | 91,6% |
| Compact-33pc | 1121 | 72,1034 | −0,7258 | 0,0323 | 3,75% | 90,8% |
| Mini-30pc | 1021 | 68,6162 | −4,2129 | 0,0593 | 5,07% | 88,1% |
| IQ4_XS-imx (stock) | 957 | 81,4215 | +8,5924 | 0,1518 | 7,96% | 82,1% |
| Nano-27pc | 927 | 68,0712 | −4,7579 | 0,0921 | 6,34% | 84,9% |
| Pico-24pc | 832 | 69,6922 | −3,1369 | 0,1717 | 8,68% | 80,2% |
| IQ3_M-imx (stock) | 829 | 77,6138 | +4,7846 | 0,2681 | 10,69% | 75,7% |
| Femto-21pc | 738 | 66,9075 | −5,9217 | 0,2902 | 10,90% | 74,2% |

No se han publicado resultados de benchmarks de tareas (razonamiento, código, matemáticas o visión) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre aproximadamente 0,8 y 1,6 GB para los pesos cuantizados, más el overhead de contexto y del proyector visual. Con contexto largo o procesamiento de imágenes de alta resolución, la memoria efectiva puede superar los 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede alojar los niveles más pequeños; para los niveles Fidelity-48pc y Precision-42pc se recomienda 6 GB o más. GPUs de datacenter como A100 o H100 no son necesarias para este tamaño, aunque pueden usarse para servir varias instancias.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y servidores compatibles con endpoints (etiqueta endpoints_compatible). No se documenta soporte explícito de vLLM o TGI para estos GGUF, por lo que debe verificarse antes de usarlos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-Paretrix-GGUF (este) | 1,73 B | no disponible | lfm1.0 | GGUF | Múltiples niveles de cuantización no uniforme con métricas de fidelidad |
| LiquidAI/LFM3-VL-2B (base) | 1,73 B | no disponible | lfm1.0 | safetensors | Modelo original sin cuantizar; referencia de calidad |
| Q8_0 stock del mismo modelo | 1,73 B | no disponible | lfm1.0 | GGUF | 1761 MiB, KLD 0,0023, top-p 97,6% |
| IQ4_XS-imx stock del mismo modelo | 1,73 B | no disponible | lfm1.0 | GGUF | 957 MiB, KLD 0,1518, top-p 82,1% |

No se dispone de información sobre otros modelos comparables de la misma categoría (VL de ~2B) en la documentación proporcionada. La comparación más directa y fiable es contra las cuantizaciones stock del propio modelo base, que la model card incluye en la misma tabla de métricas.

## Limitaciones y advertencias

- El repositorio es una cuantización comunitaria; no está publicado por Liquid AI. La calidad del proceso depende de las mediciones del autor y no ha sido auditada de forma independiente.
- Las métricas de perplejidad y divergencia KL se miden contra los logits en BF16, no contra benchmarks de tareas. Un KLD bajo no garantiza un rendimiento equivalente en razonamiento, visión o código.
- Algunos niveles presentan ΔPPL negativos (por ejemplo, Femto-21pc con −5,9217 y Mini-30pc con −4,2129), lo que indica que la perplejidad no es una métrica monótona con la calidad percibida; deben interpretarse con cautela.
- La licencia lfm1.0 es una licencia propia de Liquid AI, no una licencia open source estándar. Es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones de escala o de atribución.
- No se documentan sesgos conocidos ni evaluaciones de seguridad del modelo base en la información disponible; deben asumirse los riesgos habituales de los modelos entrenados con datos web.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a los modelos de lenguaje de este tamaño.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas sin verificación previa.
- El soporte de los 16 idiomas está declarado en la model card, pero no se aportan métricas por idioma; el rendimiento en idiomas distintos del inglés puede ser desigual.
- El repositorio ocupa 9,5 GB porque incluye todos los niveles; descargar solo el GGUF necesario para evitar consumo innecesario de almacenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/LFM3-VL-2B-Paretrix-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- Licencia LFM1.0: https://huggingface.co/Soulfate24/LFM3-VL-2B-Paretrix-GGUF/blob/main/LICENSE
