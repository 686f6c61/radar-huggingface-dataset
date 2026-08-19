# xw1234gan/seccodeplt-qwen2.5-coder-7b-grpo-kl-beta-0.001-real-detector-reward-v3

## Resumen

El modelo `seccodeplt-qwen2.5-coder-7b-grpo-kl-beta-0.001-real-detector-reward-v3` es un fine-tuning del modelo base `Qwen/Qwen2.5-Coder-7B-Instruct`, desarrollado por el usuario `xw1234gan` con el objetivo de generar código seguro que cumpla especificaciones de seguridad. Se entrena mediante GRPO (Group Relative Policy Optimization) con regularización KL (beta=0.001) sobre el dataset `fengyao1909/SecCodePLT_Plus`, un benchmark de cumplimiento de código seguro. La recompensa combina la fracción de pruebas de capacidad superadas con la ausencia de vulnerabilidades detectadas por un analizador estático.

Este checkpoint concreto (v3) utiliza un detector de recompensa basado en análisis de programas (ReaL) con pérdida de token estilo DAPO y muestreo dinámico. Con 7.615.616.512 parámetros, hereda la arquitectura transformer decoder-only de Qwen2.5-Coder. Su relevancia radica en explorar cómo el entrenamiento por refuerzo puede alinear modelos de código con requisitos de seguridad, un área crítica para el desarrollo de software asistido por IA. Sin embargo, es un checkpoint de investigación de una sola semilla, con resultados mixtos en el benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredado del modelo base Qwen2.5-Coder-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precision completa) |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles y chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Coder-7B-Instruct`, un transformer decoder-only con 7.6B parametros y ventana de contexto de 32K tokens. Sobre esta base se aplica un entrenamiento por refuerzo GRPO con regularizacion KL (beta=0.001) para evitar desviaciones excesivas del modelo original. El dataset de entrenamiento es `SecCodePLT_Plus`, con un split oficial de 655 ejemplos. La funcion de recompensa es `0.5 * capability_test_fraction + 0.5 * max(0, 1 - 0.3 * detected_vulnerabilities)`, donde `capability_test_fraction` mide cuantas pruebas funcionales supera el codigo generado y `detected_vulnerabilities` cuenta las vulnerabilidades detectadas por un analizador estatico. Se emplea una variante DAPO de perdida de token y muestreo dinamico. La evaluacion se realiza con decodificacion greedy sobre los 164 ejemplos oficiales de test.

## Capacidades

- Generacion de codigo Python con formato y sintaxis correctos (98.78% y 97.56% de tasa de exito respectivamente).
- Generacion de codigo que cumple especificaciones funcionales (capability pass del 37.80%).
- Generacion de codigo con ausencia de vulnerabilidades detectadas por analizador estatico (safety pass del 62.80%).
- Soporte de conversacion y generacion de texto en general, heredado del modelo base instruct.
- Capacidad de razonamiento y comprension de instrucciones en lenguaje natural.
- No se ha confirmado soporte de tool calling ni funciones de agente en este checkpoint especifico.

## Casos de uso

- Generacion de codigo seguro en entornos de desarrollo: el modelo puede producir fragmentos Python que evitan vulnerabilidades comunes (inyeccion, desbordamiento, etc.) cuando se le pide explicitamente, aunque con una tasa de exito limitada (joint pass del 30.49%).
- Evaluacion de modelos de seguridad de codigo: sirve como punto de referencia para comparar tecnicas de alineacion por refuerzo en el dominio de la seguridad.
- Investigacion academica en RLHF/GRPO aplicado a generacion de codigo: el checkpoint documenta un experimento reproducible con semilla 42 y metricas detalladas.
- Prototipado de asistentes de codigo con restricciones de seguridad: puede integrarse en pipelines de generacion asistida donde se priorice la ausencia de vulnerabilidades sobre la completitud funcional.
- Analisis de trade-offs entre capacidad funcional y seguridad: los resultados del benchmark permiten estudiar como el entrenamiento por refuerzo afecta a ambas dimensiones.
- Generacion de codigo con formato estricto: su alta tasa de formato y sintaxis lo hace util para tareas donde la estructura del codigo es critica, como generacion de plantillas o esqueletos.

## Benchmarks y rendimiento

El modelo card proporciona resultados de evaluacion sobre el benchmark SecCodePLT+ (164 ejemplos de test, decodificacion greedy):

| Metrica | Valor |
|---|---|
| Recompensa media | 0.581540 |
| Formato de salida correcto | 98.78% |
| Sintaxis correcta | 97.56% |
| Pruebas de capacidad superadas | 37.80% |
| Pruebas de seguridad superadas | 62.80% |
| Detector limpio (sin vulnerabilidades) | 60.98% |
| Puntuacion del detector | 0.784756 |
| Exito conjunto (capacidad + seguridad) | 30.49% |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~15 GB (suficiente para una GPU de 16 GB como RTX 4080 o A100 40GB).
- Con cuantizacion INT8: ~8 GB (cabe en RTX 3080/3090).
- Con cuantizacion INT4: ~4 GB (cabe en GPUs de gama media como RTX 3060).
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 para inferencia en precision completa.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), llama.cpp, Ollama (si se generan pesos GGUF).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct (base) | 7.6B | 32K | Apache 2.0 | Modelo base sin fine-tuning de seguridad |
| seccodeplt-qwen2.5-coder-7b-grpo-kl-beta-0.001-real-detector-reward-v3 (este) | 7.6B | 32K | no disponible | Fine-tuning con GRPO para seguridad |
| seccodeplt-qwen2.5-coder-7b-grpo-kl-beta-0.001-real-reward-v2 (variante) | 7.6B | 32K | no disponible | Version anterior con recompensa distinta |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigacion de una sola semilla (seed 42), por lo que los resultados pueden no ser representativos de la tecnica en general.
- La tasa de exito conjunto (capacidad + seguridad) es solo del 30.49%, lo que indica que el modelo a menudo genera codigo que o bien no cumple la funcionalidad o bien contiene vulnerabilidades.
- El modelo no garantiza la generacion de codigo seguro en produccion; el propio autor advierte que no es una garantia general de seguridad.
- La evaluacion se realizo con un verificador de Python con limites de recursos, por lo que los resultados pueden variar con otros verificadores o entornos.
- No se especifica la licencia del modelo, lo que limita su uso comercial sin autorizacion explicita.
- Los idiomas soportados no estan documentados; el modelo base Qwen2.5-Coder esta optimizado principalmente para ingles y chino, con menor rendimiento en otros idiomas.
- No se ha confirmado soporte para tool calling, agentes o funciones avanzadas en este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xw1234gan/seccodeplt-qwen2.5-coder-7b-grpo-kl-beta-0.001-real-detector-reward-v3
- Version anterior (v2): https://huggingface.co/xw1234gan/seccodeplt-qwen2.5-coder-7b-grpo-kl-beta-0.001-real-reward-v2
- Coleccion Qwen2.5-Coder: https://huggingface.co/collections/Qwen/qwen25-coder
- Repositorio GitHub de Qwen2.5-Coder: https://github.com/huggingface/Qwen2.5-Coder
- Repositorio GitHub de Qwen2.5 (referencia): https://github.com/mx4ai/qwen2.5
