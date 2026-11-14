# Soulfate24/MiniCPM5-2B-DSpark-Paretrix-GGUF

## Resumen

MiniCPM5-2B-DSpark-Paretrix-GGUF es una colección de cuantizaciones GGUF del modelo MiniCPM5-2B de OpenBMB, publicada por el usuario Soulfate24 bajo la suite de cuantización Paretrix. El modelo base es un transformer denso de 2.516.756.480 parámetros (aproximadamente 2,5 mil millones), orientado a generación de texto, contexto largo, tool calling y despliegue en dispositivos edge. La versión DSpark añade un módulo de decodificación especulativa (draft model) que acelera la inferencia en llama.cpp.

La relevancia de esta ficha no está en el modelo base en sí, sino en el enfoque de cuantización: Paretrix es una metodología empírica y activation-aware que, en lugar de aplicar un único ancho de bits a toda la red, mide la respuesta de cada clase de tensor a cada tipo de cuantización y planifica cada nivel mediante un problema de knapsack exacto. El resultado son variantes con nombres como Fidelity-48pc, Precision-42pc, Quality-36pc o Nano-27pc que, según la model card, dominan estrictamente a las cuantizaciones estándar de llama.cpp (Q8_0, Q6_K-imx, IQ4_XS-imx, IQ3_M-imx) en la mayoría de los regímenes de tamaño.

El repositorio ocupa 30,7 GB e incluye múltiples niveles de cuantización, desde 2.556 MiB (Q8_0 stock) hasta 1.072 MiB (Femto-21pc). Los idiomas declarados son inglés y chino, y la licencia es Apache 2.0. El modelo está pensado para inferencia local con llama.cpp y para escenarios donde el tamaño y la latencia importan más que el rendimiento bruto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia MiniCPM5, formato llama) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el tag "long-context" sugiere ventana extendida, pero no se especifica el numero) |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx (stock) y variantes Paretrix: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien disponible en safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-2B es un transformer denso de 2,5 mil millones de parámetros. Según los datasets declarados en la model card, el entrenamiento utilizó corpus de OpenBMB: Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. Esto indica un pipeline que combina preentrenamiento con datos web filtrados, datos matemáticos y de código, seguido de fases de SFT (incluyendo SFT orientado a agentes) y RL. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset.

La innovación técnica destacable de esta publicación no está en el modelo, sino en la cuantización. Paretrix mide, para cada clase de tensor, el efecto de moverla individualmente a cada tipo de cuantización, comparando contra los logits en BF16. Con esas mediciones construye un knapsack exacto que planifica cada nivel de cuantización y decide, mediante un duelo en el régimen de verificación (contexto 4096), si el plan sustituye al campeón. La variante DSpark añade un draft model para decodificación especulativa, lo que permite acelerar la generación en llama.cpp. Los tags también mencionan imatrix, hybrid-quantization y RCO (probablemente una técnica de calibración o regularización de cuantización, aunque no se detalla en la información disponible).

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y matemáticas, respaldado por los datasets UltraData-Math y UltraData-RL-2609.
- Generación de código, con datos de UltraData-Code en el entrenamiento.
- Tool calling y function calling, indicado por el tag "tool-calling" y el dataset UltraData-SFT-Agent-2609.
- Soporte de agentes y razonamiento multi-paso, derivado del SFT orientado a agentes.
- Contexto largo, indicado por el tag "long-context" (longitud exacta no disponible).
- Decodificación especulativa mediante el draft model DSpark.
- Despliegue en dispositivos edge y on-device, gracias a las cuantizaciones de 1-2,5 GB.

## Casos de uso

- Asistente local en portátil o mini-PC: con las variantes Mini-30pc (1.487 MiB) o Nano-27pc (1.350 MiB), el modelo cabe en 2-3 GB de RAM y puede ejecutarse con llama.cpp en CPU, ofreciendo un asistente conversacional bilingüe sin conexión.
- Tool calling en agentes ligeros: el modelo puede integrarse en un orquestador de agentes que necesite llamadas a funciones (APIs, consultas a bases de datos) en un entorno con recursos limitados, usando la variante Quality-36pc (1.772 MiB) para preservar precisión en la generación de JSON estructurado.
- Generación de código en entornos de desarrollo con GPU modesta: con Precision-42pc (2.060 MiB) o Fidelity-48pc (2.309 MiB), el modelo puede autocompletar y explicar código en un IDE, ejecutándose en una GPU consumer de 4-6 GB.
- Procesamiento de documentos largos en chino e inglés: el tag long-context sugiere que el modelo puede manejar ventanas extendidas; se usaría para resumir o extraer información de contratos o informes, aunque la longitud exacta debe verificarse en la documentación del modelo base.
- Clasificación y extracción de información en pipelines de datos: el modelo puede etiquetar textos, extraer entidades o generar resúmenes estructurados en lotes, con la variante Compact-33pc (1.628 MiB) como equilibrio entre calidad y velocidad.
- Inferencia especulativa de bajo coste: el draft model DSpark permite acelerar la decodificación en llama.cpp, útil en aplicaciones interactivas donde la latencia percibida es crítica, como chatbots o autocompletado.
- Despliegue en dispositivos IoT o embebidos con 2 GB de RAM: la variante Femto-21pc (1.072 MiB) permite ejecutar el modelo en hardware muy restringido, aunque con mayor perplejidad (14,15 frente a 11,97 de Q8_0).

## Benchmarks y rendimiento

La model card proporciona métricas de cuantización (PPL, ΔPPL, KLD, RMS Δp, top-p) medidas en el régimen de verificación con contexto 4096. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Modelo | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 2556 | 11,9747 | +0,0145 | 0,0015 | 1,02% | 97,8% |
| Fidelity-48pc | 2309 | 11,9989 | +0,0387 | 0,0026 | 1,32% | 97,3% |
| Precision-42pc | 2060 | 12,0119 | +0,0517 | 0,0040 | 1,59% | 96,6% |
| Q6_K-imx (stock) | 1974 | 12,0129 | +0,0526 | 0,0059 | 1,92% | 95,8% |
| Quality-36pc | 1772 | 12,0388 | +0,0785 | 0,0103 | 2,57% | 94,6% |
| Q5_K_M-imx (stock) | 1724 | 12,1174 | +0,1571 | 0,0171 | 3,41% | 93,3% |
| Compact-33pc | 1628 | 12,1418 | +0,1815 | 0,0166 | 3,35% | 93,2% |
| Mini-30pc | 1487 | 12,3175 | +0,3573 | 0,0347 | 4,77% | 90,3% |
| IQ4_XS-imx (stock) | 1358 | 12,4567 | +0,4965 | 0,0712 | 6,72% | 87,0% |
| Nano-27pc | 1350 | 12,3951 | +0,4349 | 0,0546 | 5,88% | 88,4% |
| Pico-24pc | 1210 | 12,9000 | +0,9398 | 0,1025 | 8,11% | 84,1% |
| IQ3_M-imx (stock) | 1169 | 13,9382 | +1,9779 | 0,2027 | 11,87% | 78,5% |
| Femto-21pc | 1072 | 14,1474 | +2,1871 | 0,2003 | 11,66% | 77,0% |

Según la model card, Paretrix logra 9 dominaciones estrictas sobre las cuantizaciones stock. Destaca que Nano-27pc (1.350 MiB) tiene menor PPL y KLD que IQ4_XS-imx (1.358 MiB), y que Compact-33pc (1.628 MiB) iguala aproximadamente a Q5_K_M-imx (1.724 MiB) con 96 MiB menos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 1,1 GB (Femto-21pc) y 2,6 GB (Q8_0) solo para los pesos; añadir overhead de contexto KV cache (dependiente de la longitud de contexto, no especificada).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM puede ejecutar las variantes de mayor calidad (Fidelity-48pc, Precision-42pc). Para las variantes Mini-30pc o Nano-27pc basta con 2-3 GB.
- Cabe en GPU consumer: sí, en RTX 3050 4 GB, RTX 4060 8 GB, GTX 1660 6 GB, e incluso en iGPU con memoria unificada de 8 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si se importa el GGUF), y potencialmente otros runners compatibles con GGUF. La model card menciona endpoints_compatible en los tags.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa con DSpark debería reducir la latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| MiniCPM5-2B-DSpark-Paretrix (este) | 2,52 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones Paretrix con draft DSpark |
| openbmb/MiniCPM5-2B (base) | 2,52 B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Qwen2.5-1.5B | 1,54 B | 32.768 | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar, ampliamente soportada |
| Llama 3.2 1B | 1,24 B | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Menor tamaño, contexto mayor, licencia restrictiva para >700M usuarios |

La comparación con Qwen2.5-1.5B y Llama 3.2 1B es orientativa: no se dispone de benchmarks de tareas para MiniCPM5-2B en la información proporcionada, por lo que no es posible comparar rendimiento real. La ventaja principal de este modelo es la disponibilidad de cuantizaciones Paretrix con métricas de fidelidad publicadas y un draft model para decodificación especulativa.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no se declaran otros idiomas, por lo que el rendimiento en castellano no está garantizado.
- La longitud de contexto no se especifica en la información disponible; el tag "long-context" es genérico y debe verificarse en la documentación del modelo base.
- Riesgo de alucinación inherente a modelos de 2,5 B parámetros; no apto para tareas de alta precisión sin verificación humana.
- Las cuantizaciones agresivas (Pico-24pc, Femto-21pc) incrementan notablemente la perplejidad (ΔPPL +0,94 y +2,19 respectivamente) y pueden degradar tareas de razonamiento o tool calling.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de OpenBMB pueden tener términos adicionales que deben revisarse.
- El repositorio ocupa 30,7 GB, lo que puede ser un problema para almacenamiento en dispositivos edge; conviene descargar solo la variante necesaria.
- El autor del repositorio (Soulfate24) no es el desarrollador original del modelo (OpenBMB); la calidad de las cuantizaciones depende de la metodología Paretrix, cuyas mediciones se declaran en la model card pero no han sido verificadas de forma independiente en la información disponible.
- La decodificación especulativa con DSpark requiere configuración adicional en llama.cpp y puede no estar soportada en todos los runners.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/MiniCPM5-2B-DSpark-Paretrix-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Draft model DSpark: https://huggingface.co/openbmb/MiniCPM5-2B-DSpark
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- llama.cpp: https://github.com/ggml-org/llama.cpp
