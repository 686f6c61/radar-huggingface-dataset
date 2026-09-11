# UraionLabs/MiniCPM5-2B-oQ4e

## Resumen

MiniCPM5-2B-oQ4e es una cuantización de precisión mixta en formato MLX del modelo OpenBMB/MiniCPM5-2B, publicada por Uraion Labs. Se trata de un modelo denso de 2.516.756.480 parámetros totales (1.981.982.720 parámetros no de embedding), construido sobre la arquitectura estándar `LlamaForCausalLM` con atención de consultas agrupadas (GQA, 16 cabezas de consulta y 2 de clave/valor, dimensión de cabeza 128) y 42 capas. Su ventana de contexto nativa es de 131.072 tokens, lo que lo sitúa en un rango poco habitual para su tamaño.

El problema que resuelve es la ejecución local de un modelo de 2B con contexto largo en Macs con Apple Silicon, reduciendo el peso en disco y en memoria unificada a 1,38 GB (1.410,44 MB) mediante una asignación de bits guiada por matrices de importancia. La cuantización parte de 4 bits y eleva selectivamente 67 proyecciones de atención y MLP a 5 y 6 bits (58 capas a 5 bits, 9 capas a 6 bits), con la cabeza de salida (`lm_head`) en 4 bits, un tamaño de grupo de 64 y modo afín. El resultado es un coste efectivo de aproximadamente 4,4 bits por peso.

Es relevante porque el modelo base declara capacidades de tool calling, generación de salida estructurada y asistencia de código, y porque la licencia Apache-2.0 permite uso comercial sin restricciones adicionales. La contrapartida es que el formato MLX limita la ejecución a macOS sobre Apple Silicon a través de oMLX o mlx-lm, sin compatibilidad directa con llama.cpp, Ollama, vLLM o TGI. El repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForCausalLM` (transformer denso, decodificador, con GQA) |
| Parametros totales | 2.516.756.480 (~2,52B); 1.981.982.720 (~1,98B) no de embedding |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | MLX afín, 4 bits base con perfil mixto 4/5/6 bits; `lm_head` a 4 bits; tamaño de grupo 64; ~4,4 bits efectivos por peso |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (no GGUF, no GPTQ, no AWQ) |
| Capas | 42 |
| Configuracion de atencion | GQA: 16 cabezas Q / 2 cabezas KV, dimensión de cabeza 128 |
| Precision no cuantizada | BF16 (pesos de LayerNorm, escalas y sesgos de embedding) |
| Tamano del archivo de pesos | 1,38 GB (1.410,44 MB) |
| Tamano del repositorio | 1,5 GB |
| Dataset de calibracion | `oqe_code_multilingual` (294 muestras) |
| Flujo de cuantizacion | oMLX oQe con asignación de sensibilidad guiada por matriz de importancia |
| Runtimes compatibles | oMLX y mlx-lm (Apple Silicon, macOS) |
| Modelo base | openbmb/MiniCPM5-2B |
| Libreria declarada | mlx |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura del checkpoint cuantizado es `LlamaForCausalLM` con normalización y atención estándar de LLaMA, sin mecanismos híbridos tipo SSM ni atención lineal. El uso de GQA con solo 2 cabezas de clave/valor frente a 16 de consulta reduce de forma notable el coste de la caché KV, algo crítico cuando se explotan los 131.072 tokens de contexto. Los 42 bloques mantienen la estructura convencional de proyecciones de atención (q, k, v, o) y MLP, y son precisamente esas proyecciones las que reciben el reparto de precisión mixta descrito por el autor.

El entrenamiento corresponde al modelo original de OpenBMB, no a esta cuantización. El autor del modelo base declara el uso del currículo de datos UltraData, con los conjuntos Ultra-FineWeb, Ultra-FineWeb-L3, UltraX-Preview, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. La presencia de conjuntos específicos de SFT orientados a agentes y de RL sugiere etapas de ajuste supervisado y de optimización por refuerzo posteriores al preentrenamiento, aunque la model card consultada no detalla el número de tokens, la composición porcentual del dataset ni los algoritmos concretos empleados.

La innovación técnica del repositorio analizado es la propia receta de cuantización: en lugar de aplicar 4 bits uniformes, se calcula una matriz de importancia y se asignan 5 o 6 bits a las 67 proyecciones más sensibles, dejando el resto a 4 bits. La calibración se realizó con un conjunto de 294 muestras de código multilingüe, por lo que la asignación de precisión está sesgada hacia ese dominio. La model card se interrumpe en la sección de inicio rápido, por lo que no se dispone de los comandos ni de las recetas de decodificación especulativa que pudieran acompañar al modelo.

## Capacidades

- Generación de texto conversacional en inglés y chino, con soporte multi-turno.
- Razonamiento y resolución de problemas, incluyendo matemáticas, según los conjuntos UltraData-Math declarados en el entrenamiento del modelo base.
- Generación y asistencia de código, respaldada por UltraData-Code y por el conjunto de calibración de la cuantización, de temática de código multilingüe.
- Tool calling y function calling, con generación de salida estructurada; el modelo base se describe explícitamente como orientado a flujos de agentes.
- Capacidades agénticas y razonamiento multi-paso, derivadas del conjunto UltraData-SFT-Agent-2609 y del ajuste por refuerzo.
- Procesamiento de contexto largo de hasta 131.072 tokens en una sola pasada, útil para documentos extensos y razonamiento sobre repositorios completos.
- Ejecución totalmente local y sin conexión en Apple Silicon, con los pesos residentes en memoria unificada.
- No se declaran capacidades de visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Asistencia de código en local sobre macOS: el modelo puede integrarse en un editor o CLI que invoque oMLX, generando y revisando código sin enviar el contenido del repositorio a servicios externos. El tamaño de 1,38 GB permite mantenerlo residente en memoria mientras se trabaja.
- Revisión de repositorios completos: con 131.072 tokens de contexto cabe un volumen considerable de código en una única ventana, lo que permite tareas de detección de inconsistencias entre módulos, generación de documentación transversal o migraciones de API que requieren ver varios ficheros a la vez.
- Agente local con tool calling: el modelo puede emitir llamadas a funciones estructuradas para encadenar pasos sobre herramientas locales (sistema de ficheros, shell, APIs internas). La ventana larga evita truncar el historial de acciones del agente en tareas de varios pasos.
- Extracción de datos estructurados: generación de JSON con un esquema fijo a partir de documentos largos, aprovechando la ventana de 131k para procesar contratos, informes o expedientes completos en una sola petición.
- Síntesis de documentación técnica extensa: resumen jerárquico de manuales, RFCs o documentación de producto que superan con holgura el contexto de modelos de 2B convencionales.
- Asistencia conversacional en inglés y chino: atención al cliente o soporte interno para usuarios de esos dos idiomas, con conversaciones multi-turno mantenidas en contexto local.
- Prototipado con requisitos de privacidad: cualquier escenario en el que los datos no puedan salir del dispositivo, como borradores legales, notas clínicas o código propietario, se beneficia de una inferencia enteramente on-device.
- Procesamiento por lotes en un Mac de escritorio: generación de resúmenes o clasificaciones sobre un corpus de documentos aprovechando la ejecución local y la ausencia de coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. La model card del repositorio cuantizado no incluye ninguna tabla de MMLU, HumanEval, GSM8K ni métricas equivalentes para esta variante. El único dato de rendimiento aportado es una media de 53,9 en el conjunto de evaluación propio de OpenBMB para el modelo base MiniCPM5-2B, sin desglose por tarea y sin comparación numérica con alternativas.

Tampoco se proporcionan mediciones de latencia, throughput ni degradación respecto al modelo en BF16. Cualquier cifra de rendimiento de esta variante concreta debe obtenerse midiendo directamente, no extrapolando.

## Requisitos de hardware

- Plataforma soportada: exclusivamente Apple Silicon (macOS) mediante oMLX o mlx-lm. No hay soporte declarado para CUDA, ROCm ni CPU x86.
- Pesos en memoria: 1,38 GB para el archivo de pesos. El repositorio completo ocupa 1,5 GB.
- Caché KV estimada: con la configuración GQA de 2 cabezas KV de dimensión 128 y 42 capas, la caché consume 21.504 valores por token; en BF16 son aproximadamente 42 KiB por token, es decir, unos 0,34 GB a 8.192 tokens, 1,34 GB a 32.768 tokens y 5,4 GB a los 131.072 tokens completos. Son estimaciones calculadas a partir de la configuración declarada, no mediciones publicadas.
- Memoria unificada recomendada: 8 GB es suficiente para pesos y contextos cortos; 16 GB permite trabajar con comodidad en torno a 32k tokens; para explotar los 131.072 tokens conviene disponer de 32 GB o más.
- Equipos compatibles: cualquier Mac con chip de la familia M (M1 o posterior) y memoria unificada suficiente; los modelos con más ancho de banda de memoria ofrecerán mayor velocidad de decodificación.
- GPU dedicada: no aplica. No se declaran opciones de despliegue con A100, H100 o RTX 4090 para este formato de pesos.
- Opciones de despliegue: oMLX y mlx-lm son los dos runtimes indicados por el autor. No se menciona conversión a GGUF para llama.cpp u Ollama, ni compatibilidad con vLLM o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

La información disponible no incluye comparaciones de rendimiento con otros modelos. La tabla siguiente recoge datos estructurales de alternativas abiertas del mismo rango de tamaño, tomados de sus respectivas fichas oficiales; las cifras de rendimiento no están disponibles para ninguna de ellas en el material consultado.

| Modelo | Parametros | Contexto | Licencia | Formato de ejecucion | Cuantizacion |
|---|---|---|---|---|---|
| MiniCPM5-2B-oQ4e (este) | 2,52B | 131.072 | Apache-2.0 | MLX safetensors, Apple Silicon | 4 bits mixta 4/5/6 |
| openbmb/MiniCPM5-2B | 2,52B | 131.072 | Apache-2.0 | safetensors (BF16) | Sin cuantizar |
| Qwen2.5-3B-Instruct | ~3,09B | 32.768 nativo | Apache-2.0 | safetensors, GGUF, MLX y otros | Multiples |
| Llama-3.2-3B-Instruct | ~3,21B | 131.072 | Llama 3.2 Community License | safetensors, GGUF y otros | Multiples |
| Gemma-2-2B-it | ~2,61B | 8.192 | Gemma Terms of Use | safetensors, GGUF y otros | Multiples |

Dentro de la propia familia de cuantizaciones publicadas por Uraion Labs, la variante oQ4e se sitúa en un punto intermedio de la escala, con las alternativas siguientes declaradas por el autor:

| Variante | Bits base | Perfil mixto | `lm_head` | Tamano |
|---|---|---|---|---|
| oQ8e | 8 bits | Uniforme 8 bits | 8 bits | 2,49 GB |
| oQ6e | 6 bits | Mixta 6/8 (28 capas a 8 bits) | 6 bits | 1,95 GB |
| oQ5e | 5 bits | Mixta 5/6/8 (19 a 6b, 6 a 8b) | 6 bits | 1,67 GB |
| oQ4e | 4 bits | Mixta 4/5/6 (58 a 5b, 9 a 6b) | 4 bits | 1,38 GB |
| oQ3.5e | 3 bits | Mixta 3/5/6 (29 a 5b, 7 a 6b) | 6 bits | 1,17 GB |
| oQ3e | 3 bits | Mixta 3/5/6 (31 a 5b, 7 a 6b) | 3 bits | 1,08 GB |
| oQ2.7e | 2 bits | Mixta 2/5/6/8 (23 a 5b, 8 a 6b, `lm_head` a 8b) | 8 bits | 0,98 GB |
| oQ2e | 2 bits | Mixta 2/5/6 (10 a 5b, 6 a 6b) | 6 bits | 0,88 GB |

## Limitaciones y advertencias

- Idiomas: solo inglés y chino. No hay soporte declarado de castellano, por lo que el rendimiento en español será previsiblemente inferior y no está medido.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad en la información disponible. El modelo hereda los sesgos de los corpus de preentrenamiento y de ajuste del modelo base.
- Alucinación: como cualquier modelo de 2B, la tasa de invención de hechos es elevada en dominios de conocimiento factual. No se aportan métricas de fidelidad ni de calibración.
- Contexto: aunque la ventana declarada es de 131.072 tokens, no se han publicado pruebas de recuperación de información a lo largo de toda la ventana (needle-in-a-haystack u equivalentes) para esta variante cuantizada. El uso intensivo del contexto completo exige varios gigabytes adicionales solo para la caché KV.
- Efecto de la cuantización: la asignación de precisión se calibró con 294 muestras de código multilingüe, un conjunto pequeño y de dominio específico. La pérdida de calidad en dominios alejados del código (prosa, matemáticas formales, conversación larga) no está medida.
- Formato: los pesos son MLX safetensors y solo funcionan en Apple Silicon con oMLX o mlx-lm. No hay rutas de despliegue documentadas para servidores con GPU NVIDIA, ni conversión publicada a GGUF para llama.cpp u Ollama.
- Licencia: Apache-2.0, que permite uso comercial y modificación sin restricciones adicionales. Aun así, conviene verificar las condiciones del modelo base y de los conjuntos de datos declarados si se redistribuye.
- Madurez del artefacto: el repositorio se creó y actualizó el 10 de septiembre de 2026 y no registra descargas ni valoraciones, por lo que no existe retroalimentación de la comunidad sobre su comportamiento en producción.
- Tool calling: aunque se declaran capacidades de function calling, esta variante no documenta un formato de plantilla de chat ni ejemplos verificados de llamadas a herramientas, lo que obliga a validar el comportamiento antes de usarlo en un agente.
- Producción: al no haber mediciones de latencia, throughput ni tasa de error, no se recomienda desplegar esta variante en un servicio crítico sin una batería de evaluación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ4e
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Runtime oMLX: https://github.com/jundot/omlx
- Runtime mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms/mlx_lm
- Sitio del editor de la cuantización: https://uraionlabs.com
- Referencia arXiv declarada en la model card: arxiv:2506.07900
- Referencia arXiv declarada en la model card: arxiv:2602.09003
- Conjuntos de datos referenciados: openbmb/Ultra-FineWeb, openbmb/UltraX-Preview, openbmb/Ultra-FineWeb-L3, openbmb/UltraData-Math, openbmb/UltraData-Code, openbmb/UltraData-SFT-2605, openbmb/UltraData-SFT-Agent-2609, openbmb/UltraData-RL-2609
- Variantes de la familia: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ8e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ6e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ5e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ3.5e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ3e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ2.7e, https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ2e
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; no se han podido localizar papers, blogs ni demos adicionales.
