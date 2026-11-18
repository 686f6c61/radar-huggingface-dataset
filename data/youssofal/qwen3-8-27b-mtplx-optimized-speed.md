# Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed

## Resumen

Qwen3.8-27B-MTPLX-Optimized-Speed es una cuantización dinámica de 4 bits del modelo Qwen3.8-27B de Alibaba Qwen, publicada por el usuario Youssofal y empaquetada específicamente para MTPLX, un runtime de inferencia para Apple Silicon que implementa decodificación especulativa nativa mediante la cabeza de multi-token prediction (MTP) del propio modelo. El objetivo no es crear un modelo nuevo, sino preservar la distribución de salida del checkpoint original en bf16 mientras se acelera la generación entre dos y tres veces respecto a la decodificación plana, manteniendo la exactitud estadística a cualquier temperatura.

El modelo conserva la cabeza MTP del Qwen3.8-27B original, lo que permite al runtime proponer varios tokens por adelantado y verificarlos en una sola pasada. Con 27.356.723.952 parámetros totales, una ventana de contexto de 262.144 tokens y un peso de descarga de 20,4 GB, está pensado para Macs con 32 GB o más de memoria unificada, con un pico medido de 23,6 GB. Es la opción que MTPLX recomienda por defecto para tareas de programación en hardware Apple moderno.

Su relevancia actual radica en que demuestra que la cuantización agresiva combinada con decodificación especulativa exacta puede ofrecer velocidades de 55-65 tokens por segundo en un portátil, un terreno tradicionalmente reservado a GPUs dedicadas. La licencia Apache 2.0 y la compatibilidad con la API de OpenAI y Anthropic facilitan su integración en herramientas de desarrollo agéntico como OpenCode, Cline o Claude Code.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8) con cabeza de multi-token prediction (MTP); pesos en formato MLX para Apple Silicon |
| Parametros totales | 27.356.723.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4 bits dinámico (grupos de 32 pesos), con capas selectivas en 8 bits y 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pack MLX, librería `mtplx`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27.356 millones de parámetros. La innovación del pack no reside en el entrenamiento, sino en el esquema de cuantización y en la preservación de la cabeza MTP nativa del checkpoint original. La cuantización es dinámica: el grueso del modelo usa 4 bits con grupos de 32 pesos, pero se elevan a 8 bits las partes más sensibles (embeddings, cabeza de salida, las 48 proyecciones de salida GDN y los últimos 8 bloques MLP) y se mantienen en 16 bits los kernels de convolución GDN, el estado recurrente, todas las normalizaciones y la cabeza MTP completa. La divergencia KL frente al modelo bf16 original en la batería de código del autor es de 0,0220, un 1,7x más cerca del original que la variante plana de 4 bits (Bare Speed).

La decodificación especulativa de MTPLX es exacta: los borradores se aceptan mediante la regla de ratio de probabilidad más remuestreo residual, de modo que la distribución de salida coincide con la del modelo sin especulación a cualquier temperatura. La profundidad MTP configurada es 3, con una tasa de aceptación de borradores por profundidad de 0,95, 0,88 y 0,80 en tareas de código, y un coste de verificación de 50-53 ms por ronda. Los ajustes de profundidad y borradores se distribuyen en `mtplx_runtime.json` y se cargan automáticamente. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y conversación multi-turno con contexto de hasta 262.144 tokens.
- Programación: el pack está optimizado y recomendado para tareas de código, con velocidades medidas de 58,7 tok/s en tareas de codificación con razonamiento medio.
- Razonamiento con niveles de esfuerzo configurables (xhigh, medium, low), con velocidades de 35,1 y 37,3 tok/s en respuestas largas de razonamiento de 28k y 20k tokens.
- Modo de pensamiento preservado: los flujos de thinking atraviesan la ruta MTP como cualquier otro token.
- Decodificación especulativa exacta con profundidad MTP 3, que acelera la generación sin alterar la distribución de muestreo.
- Compatibilidad con la API de OpenAI y Anthropic a través de `mtplx serve`, lo que habilita el uso con herramientas agénticas como OpenCode, Cline o Claude Code.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no disponible explícitamente en la información proporcionada.

## Casos de uso

- Programación asistida en local: el pack está diseñado para tareas de código en Macs con 32 GB o más, con 58,7 tok/s en tareas de codificación de razonamiento medio y una tasa de aceptación de borradores del 95% en la primera profundidad, lo que lo hace adecuado para autocompletado y reescritura de archivos en editores.
- Integración con agentes de terminal: al exponer una API compatible con OpenAI y Anthropic en `http://127.0.0.1:8000`, se puede conectar a OpenCode, Cline o Claude Code para flujos de edición multi-paso sin enviar código a la nube.
- Razonamiento largo con contexto extenso: la ventana de 262.144 tokens permite analizar repositorios completos o documentación extensa; en respuestas de razonamiento de 20k-28k tokens mantiene 35-37 tok/s.
- Reescritura y refactorización de archivos: el benchmark del autor mide 87,6 tok/s reescribiendo un archivo recién generado, un escenario típico de refactorización iterativa en un IDE.
- Asistencia conversacional técnica: con 64,3 tok/s en respuestas de chat de 3k tokens, es viable para sesiones de preguntas y respuestas sobre código o documentación técnica.
- Desarrollo en entornos con restricciones de privacidad: al ejecutarse íntegramente en Apple Silicon con un pico de 23,6 GB de memoria unificada, permite trabajar con código propietario sin conexión externa.
- Prototipado de pipelines agénticos: la decodificación especulativa exacta garantiza que las pruebas de comportamiento del agente sean reproducibles respecto al modelo original, lo que facilita la validación antes de desplegar en infraestructura mayor.

## Benchmarks y rendimiento

Rendimiento medido en un MacBook Pro M5 Max con ventiladores al máximo, flujo único, muestreo oficial de Qwen 3.8 (temperatura 1,0, top-p 0,95, top-k 20):

| Ejecución | tok/s |
|---|---|
| Reescritura de un archivo recién escrito, ajustes de stock (MTPLX 2.10.0) | 87,6 |
| Bare Speed en tarea de código nueva con muestreo oficial (MTPLX 2.7.0) | 65,2 |
| Optimized Speed en respuesta de chat de 3k tokens (MTPLX 2.10.0) | 64,3 |
| Tarea de código con razonamiento medio, `mtplx serve` | 58,7 |
| Misma tarea en la app de Mac MTPLX | 55,5 |
| Razonamiento largo en xhigh, respuestas de 28k y 20k tokens | 35,1 y 37,3 |

Comparativas del mismo autor en la misma sesión: Qwen 3.6 27B Optimized Speed V2 alcanzó 59,9-60,1 tok/s, oMLX 0.5.7 con su propio cuantizado MTP de Qwen 3.8 4 bits alcanzó 63,3 tok/s y MTPLX Bare Speed alcanzó 65,2 tok/s. Calidad del pack frente al checkpoint bf16, evaluada con teacher forcing sobre 2.389 posiciones de código, prosa, JSON y un aviso multilingüe: 96,0% de acuerdo top-1 y KL 0,012 para Optimized Speed; 99,3% y KL 0,0005 para Optimized Quality (8 bits). Exactitud: mil extracciones de cuatro tokens por la ruta rápida coinciden con mil de la ruta plana dentro del ruido de esta última.

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria unificada mínima: 32 GB para este pack de 4 bits; 36 GB para la variante Optimized Quality de 8 bits.
- Pico de memoria unificada medido para este artefacto: 23,6 GB.
- Tamaño de descarga: 20,4 GB.
- Hardware compatible: Macs Apple Silicon de M1 a M5 (MacBook Pro, MacBook Air, Mac mini y Mac Studio). En M1 o M2 se recomienda la build FP16 del mismo modelo.
- GPU dedicadas: no aplica; el pack está empaquetado para MLX y Apple Silicon, no para CUDA.
- Despliegue: app de Mac MTPLX o CLI mediante `pip install mtplx` y `mtplx serve --model Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia de verificación especulativa: 50-53 ms por ronda.
- Throughput medido: 55,5-87,6 tok/s según la tarea en M5 Max; 35,1-37,3 tok/s en razonamiento largo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Velocidad medida (M5 Max) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-MTPLX-Optimized-Speed (este) | 27,36B | 262.144 | 55,5-87,6 tok/s | Apache 2.0 | Hugging Face, runtime MTPLX |
| Qwen3.8-27B-MTPLX-Bare Speed | 27,36B (4 bits plano) | no disponible | 65,2 tok/s en tarea de código | Apache 2.0 | Hugging Face, runtime MTPLX |
| Qwen3.8-27B-MTPLX-Optimized Quality | 27,36B (8 bits) | no disponible | no disponible | Apache 2.0 | Hugging Face, runtime MTPLX |
| oMLX 0.5.7 con cuantizado MTP de Qwen 3.8 4 bits | no disponible | no disponible | 63,3 tok/s en la misma tarea | no disponible | runtime oMLX |
| Ternary-Bonsai-2-27B-MTPLX-Optimized-Speed | 27B (ternario) | no disponible | 64,4 tok/s tras prompt de 4.061 tokens; pico de 11,4 GB | no disponible | Hugging Face, runtime MTPLX |

## Limitaciones y advertencias

- Dependencia exclusiva de Apple Silicon y del runtime MTPLX: no es utilizable en GPUs NVIDIA, AMD ni en CPU convencional sin conversión adicional.
- Requiere 32 GB o más de memoria unificada; por debajo de ese umbral el modelo no cabe con comodidad.
- La cuantización de 4 bits introduce una divergencia KL de 0,0220 frente al bf16 original en la batería de código del autor; para aplicaciones que exijan máxima fidelidad conviene la variante Optimized Quality de 8 bits.
- Los datos de rendimiento proceden del propio autor del pack y de una única máquina (M5 Max), por lo que no son extrapolables a todo el parque de hardware.
- No se han publicado resultados en benchmarks académicos estándar (MMLU, HumanEval, GSM8K), lo que dificulta la comparación objetiva con otros modelos.
- No hay información sobre idiomas soportados ni sobre sesgos conocidos del modelo base.
- No hay información explícita sobre soporte de tool calling, function calling ni capacidades de visión o audio.
- Riesgo de alucinación: inherente al modelo base, no cuantificado en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no detalla restricciones adicionales sobre el pack ni sobre el modelo base.

## Enlaces

- [Hugging Face: Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed](https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed)
- [MTPLX](https://mtplx.com)
- [Benchmarks de MTPLX](https://mtplx.com/benchmarks/)
- [Notas de la versión MTPLX 2.11.3](https://mtplx.com/releases/2.11.3/)
- [Guía: ejecutar Qwen 3.8 27B en un Mac](https://mtplx.com/models/qwen3.8-27b/)
- [MTPLX vs mlx-serve](https://mtplx.com/compare/mtplx-vs-mlx-serve/)
- [MTPLX vs oMLX](https://mtplx.com/compare/mtplx-vs-omlx/)
- [MTPLX vs LM Studio](https://mtplx.com/compare/mtplx-vs-lm-studio/)
- [MTPLX vs Ollama](https://mtplx.com/compare/mtplx-vs-ollama/)
- [Variante Bare Speed](https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Bare-Speed)
- [Variante Optimized Quality](https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Quality)
- [Variante FP16 para M1/M2](https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed-FP16)
- [Ternary-Bonsai-2-27B-MTPLX-Optimized-Speed](https://huggingface.co/Youssofal/Ternary-Bonsai-2-27B-MTPLX-Optimized-Speed)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
