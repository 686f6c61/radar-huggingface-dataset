# Soulfate24/MiniCPM5-1B-ASHQ1-Remix-GGUF

## Resumen

MiniCPM5-1B-ASHQ1-Remix-GGUF es una versión cuantizada en formato GGUF del modelo MiniCPM5-1B, desarrollado por OpenBMB y cuantizado por Soulfate24. MiniCPM5-1B es un modelo de lenguaje denso de 1.080 millones de parámetros, diseñado específicamente para su ejecución en dispositivos con recursos limitados (edge AI, on-device). Esta variante GGUF aplica una cuantización activación-aware denominada ASHQ1-Remix, que reduce el tamaño del modelo hasta 503 MiB en su tier más agresivo, manteniendo una degradación controlada de la calidad medida mediante perplexity y divergencia KL.

El modelo resuelve el problema de desplegar un LLM de calidad en hardware de gama baja: smartphones, Raspberry Pi, portátiles antiguos o GPUs con poca VRAM. Su relevancia actual radica en la creciente demanda de inferencia local privada y en la madurez de las técnicas de cuantización que permiten conservar capacidades como tool calling y contexto largo en modelos de 1B. La licencia Apache-2.0 facilita su uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only, similar a Llama según tags) |
| Parametros totales | 1.080.632.832 (1,08B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el tag indica "long-context" pero sin cifra) |
| Tipos de cuantizacion | GGUF, 7 tiers: Fidelity-48pc (997 MiB), Precision-42pc (943 MiB), Quality-36pc (749 MiB), Compact-33pc (687 MiB), Mini-30pc (663 MiB), Nano-27pc (563 MiB), Pico-24pc (503 MiB) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors para el modelo base original |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-1B es un Transformer denso de una sola capa de decodificación, optimizado para inferencia en dispositivos con restricciones de memoria y cómputo. No se han publicado detalles sobre el número de capas, heads o dimensiones ocultas en la información disponible. El entrenamiento del modelo base utilizó los datasets openbmb/Ultra-FineWeb, Ultra-FineWeb-L3, UltraData-Math y UltraData-SFT-2605, lo que indica una mezcla de datos web filtrados, razonamiento matemático y datos de fine-tuning supervisado. No hay evidencia de etapas de RLHF o DPO en la documentación consultada.

La cuantización ASHQ1-Remix es el aspecto técnico más innovador de esta versión. Se trata de una cuantización activación-aware que ajusta los ratios, floors y caps de cuantización basándose en experimentos medidos, en lugar de usar valores fijos. La suite ASHQ1-Remix (versión 2.3.0) ha sido validada en seis familias de modelos y ofrece una escalera de siete niveles de calidad, desde Fidelity (48% del tamaño original) hasta Pico (24%). Además, utiliza imatrix (importance matrix) para mejorar la distribución de errores de cuantización, y es compatible con el linaje AutoRound con límites de saturación explícitos.

## Capacidades

- Generación de texto y razonamiento: el modelo base fue entrenado con datos de fine-tuning que incluyen tareas de instrucción, lo que le permite mantener conversaciones coherentes y seguir instrucciones.
- Tool calling / function calling: el tag "tool-calling" confirma que el modelo soporta llamadas a herramientas, esencial para agentes y asistentes que interactúan con APIs.
- Soporte de agentes y razonamiento multi-paso: gracias a la capacidad de tool calling y al entrenamiento con datos de razonamiento matemático, puede encadenar pasos lógicos en tareas de agente.
- Capacidades multilingües: soporta inglés y chino, lo que lo hace útil para aplicaciones bilingües o para el mercado hispanohablante en combinación con inglés.
- On-device y edge AI: el tamaño reducido y la cuantización permiten ejecutarlo en hardware de bajas prestaciones.
- Long-context: el tag indica soporte para contextos largos, aunque no se especifica la longitud máxima.

## Casos de uso

- Asistente conversacional en dispositivos móviles: con un tamaño de 503-997 MiB, puede ejecutarse en un smartphone con 4 GB de RAM o más, ofreciendo respuestas en inglés o chino sin conexión a internet, ideal para aplicaciones de privacidad.
- Generación de código en entornos de desarrollo integrado (IDE): su capacidad de tool calling permite integrarlo en editores como VS Code para autocompletar o generar snippets, ejecutándose localmente en portátiles sin GPU dedicada.
- Chatbot de atención al cliente en webs con presupuesto limitado: desplegado con llama.cpp o Ollama en un VPS de 2 GB de RAM, puede gestionar consultas frecuentes en inglés o chino, reduciendo costes de infraestructura.
- Traducción y asistencia bilingüe: al soportar en/zh, puede servir como traductor automático o asistente de aprendizaje de idiomas en tiempo real.
- Agente local para automatización de tareas: su soporte de tool calling permite crear agentes que interactúan con APIs (por ejemplo, consultar el tiempo, buscar en calendario) sin depender de servicios en la nube.
- Prototipado rápido de aplicaciones NLP: los desarrolladores pueden usar los diferentes tiers de cuantización para probar la relación calidad-rendimiento antes de decidir el despliegue final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una tabla de métricas de calidad de cuantización sobre el dataset wiki.test.raw, con referencia FA-auto simétrica:

| Tier | Tamaño | PPL | KLD | RMS Δp | top-p |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Fidelity-48pc | 997 MiB | 26.3758 | 0.0056 | 1.63% | 95.3% |
| Precision-42pc | 943 MiB | 26.4353 | 0.0072 | 1.84% | 94.5% |
| Quality-36pc | 749 MiB | 27.2456 | 0.0555 | 5.16% | 86.3% |
| Compact-33pc | 687 MiB | 28.1717 | 0.0997 | 6.69% | 81.9% |
| Mini-30pc | 663 MiB | 28.5485 | 0.1153 | 7.16% | 80.4% |
| Nano-27pc | 563 MiB | 28.8736 | 0.1382 | 7.98% | 78.4% |
| Pico-24pc | 503 MiB | 37.5561 | 0.3854 | 14.27% | 66.3% |

Estas métricas miden la fidelidad de la cuantización respecto al modelo original en BF16, no el rendimiento en tareas. Se observa que los tiers hasta Nano-27pc mantienen una degradación moderada, mientras que Pico-24pc muestra un salto notable en PPL y KLD, lo que sugiere que no es recomendable para uso general.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF más pequeño (Pico-24pc) ocupa 503 MiB, por lo que con overhead de contexto y KV cache, se necesitan aproximadamente 0,7-1 GB de RAM/VRAM. El tier Quality-36pc (749 MiB) requiere unos 1-1,5 GB. El tier Fidelity-48pc (997 MiB) necesita unos 1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el tier Fidelity (por ejemplo, NVIDIA GTX 1650, Jetson Nano, Intel iGPU). Para los tiers más ligeros, basta con 1 GB de VRAM, como en Raspberry Pi 5 (con 8 GB de RAM) o smartphones con 4 GB de RAM.
- Si cabe en consumer GPU: sí, incluso en las más modestas. También puede ejecutarse exclusivamente en CPU con 4 GB de RAM libre, aunque la latencia será mayor.
- Opciones de despliegue: llama.cpp (soporte nativo GGUF), Ollama (fácil de usar), vLLM (si se convierte a formato compatible), TGI (requiere conversión adicional). Para edge, se recomienda llama.cpp con compilación optimizada para ARM.
- Latencia y throughput: no se han publicado datos. En una CPU moderna (por ejemplo, Apple M1), un modelo de 1B cuantizado Q4 suele generar entre 10-20 tokens/s; en GPU de gama baja, puede superar los 30 tokens/s. Estas cifras son estimaciones generales, no mediciones de este modelo concreto.

## Comparativa con modelos similares

La siguiente comparación se basa en características públicas de los modelos base, no en benchmarks medidos de esta cuantización.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato disponible |
|---|---|---|---|---|---|
| MiniCPM5-1B (este) | 1,08B | No disponible | en, zh | Apache-2.0 | GGUF, safetensors |
| Qwen2.5-1.5B | 1,54B | 128K | Multilingüe (incluye español) | Apache-2.0 | GGUF, safetensors |
| Llama 3.2 1B | 1,23B | 128K | Multilingüe (9 idiomas) | Llama 3.2 Community License | GGUF, safetensors |
| SmolLM2-1.7B | 1,71B | 8K | Inglés, español, francés, etc. | Apache-2.0 | GGUF, safetensors |

MiniCPM5-1B destaca por su orientación explícita a on-device y por el soporte de tool calling, algo que no todos los modelos de 1B ofrecen de serie. Sin embargo, Qwen2.5-1.5B y Llama 3.2 1B tienen contextos más largos documentados y mejor cobertura multilingüe. La ventaja de esta versión GGUF es su flexibilidad de cuantización con siete niveles calibrados, algo menos común en los otros modelos.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base fue entrenado con datos web filtrados, por lo que puede reflejar sesgos presentes en esos datos. No se ha publicado una evaluación específica de sesgos.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo. Los datos de entrenamiento incluyen matemáticas, pero no hay garantía de exactitud.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada, a pesar del tag "long-context". Además, solo soporta inglés y chino; el español no está cubierto, lo que limita su uso directo en mercados hispanohablantes sin una capa de traducción.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero hay que atribuir correctamente y mantener el aviso de licencia. No hay cláusulas de uso prohibido.
- Riesgos de la cuantización: los tiers más agresivos (Pico-24pc) muestran una degradación severa (PPL 37,56, KLD 0,385) que puede producir respuestas incoherentes. Se recomienda usar al menos Quality-36pc para tareas generales.
- Caveat de producción: al ser un modelo de 1B, su rendimiento en tareas complejas (razonamiento avanzado, código extenso) será inferior a modelos de mayor tamaño. Es adecuado para tareas simples y de baja latencia, no para sustituir a un modelo de 7B+.

## Enlaces

- Modelo GGUF: https://huggingface.co/Soulfate24/MiniCPM5-1B-ASHQ1-Remix-GGUF
- Suite ASHQ1-Remix (documentación de cuantización): https://huggingface.co/Soulfate24/AutoRound-ASHQ1-Remix_Double-Quantization_Suite
- Modelo base MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Repositorio GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
- Página de referencia de GGUFs (local-ai-zone): https://local-ai-zone.github.io/models/minicpm5-1b.html
