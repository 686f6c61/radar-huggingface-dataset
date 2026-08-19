# xw1234gan/seccodeplt-qwen2.5-coder-3b-grpo-no-kl-real-detector-reward-v3

## Resumen

El modelo `xw1234gan/seccodeplt-qwen2.5-coder-3b-grpo-no-kl-real-detector-reward-v3` es un ajuste fino del modelo `Qwen/Qwen2.5-Coder-3B-Instruct` mediante el algoritmo GRPO (Group Relative Policy Optimization) sin regularización KL. Está diseñado para el experimento de cumplimiento de código seguro SecCodePLT+, cuyo objetivo es generar fragmentos de código que superen pruebas de funcionalidad y, a la vez, minimicen vulnerabilidades detectadas por un analizador estático.

El entrenamiento utiliza un detector de análisis de programa llamado ReaL como señal de recompensa, combinando la fracción de pruebas de capacidad superadas con una penalización por vulnerabilidades detectadas. Se emplea el dataset `fengyao1909/SecCodePLT_Plus` con 655 ejemplos de entrenamiento y evaluación sobre 164 ejemplos de test. La relevancia de este modelo radica en explorar técnicas de alineación para generar código seguro sin sacrificar funcionalidad, un área crítica en el desarrollo de asistentes de programación.

Con 3.085.938.688 parámetros, el modelo hereda la arquitectura de Qwen2.5-Coder-3B-Instruct, un transformer decoder-only optimizado para tareas de programación. Es un checkpoint de investigación de una sola semilla, no un producto final, y no se especifican licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No especificados |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Coder-3B-Instruct`, un transformer decoder-only con 3.000 millones de parámetros, atención causal y capas de normalización pre-RMSNorm. Sobre esta base se aplica un entrenamiento de refuerzo con GRPO sin regularización KL, una variante de PPO que agrupa respuestas para estimar ventajas y evita la divergencia con el modelo de referencia mediante un término KL explícito. En esta variante, se omite la regularización KL para estudiar su efecto en la exploración.

La función de recompensa es `0.5 * capability_test_fraction + 0.5 * max(0, 1 - 0.3 * detected_vulnerabilities)`, donde `capability_test_fraction` es la proporción de pruebas de funcionalidad superadas y `detected_vulnerabilities` el número de vulnerabilidades encontradas por el detector ReaL. El entrenamiento usa seed 42, el split oficial de 655 ejemplos de SecCodePLT_Plus, y evaluación con decodificación greedy sobre 164 ejemplos de test. Se emplea un loss de token estilo DAPO y muestreo dinámico, sin más detalles técnicos publicados.

## Capacidades

- Generación de código en lenguajes de programación, heredada del modelo base Qwen2.5-Coder-3B-Instruct.
- Razonamiento sobre problemas de programación y lógica, gracias al ajuste instruct del modelo base.
- Generación de código con conciencia de seguridad: el entrenamiento con la recompensa de detector ReaL busca reducir vulnerabilidades detectables por análisis estático.
- Cumplimiento de formato de salida: el 97,56% de las respuestas en evaluación respetan el formato esperado.
- Sintaxis válida: el 97,56% de las salidas pasan la comprobación sintáctica.
- No se han documentado capacidades específicas de tool calling, agentes o multimodalidad; el modelo es exclusivamente de generación de texto.

## Casos de uso

- Generación de fragmentos de código seguro en entornos de desarrollo: el modelo puede proponer implementaciones de funciones con menor probabilidad de vulnerabilidades detectables, útil como asistente en revisiones de código.
- Evaluación de políticas de seguridad en modelos de lenguaje: sirve como banco de pruebas para medir el impacto de la regularización KL y distintas funciones de recompensa en la generación de código seguro.
- Investigación en alineación de modelos: permite estudiar cómo GRPO sin KL afecta al equilibrio entre funcionalidad y seguridad, comparando con variantes con KL.
- Creación de datasets de código seguro: al generar múltiples muestras, se pueden filtrar aquellas que superen el detector ReaL para construir conjuntos de entrenamiento.
- Prototipos de asistentes de programación con énfasis en seguridad: aunque es un checkpoint de investigación, puede integrarse en pipelines de generación de código donde se priorice la ausencia de vulnerabilidades comunes.
- Análisis comparativo de detectores de vulnerabilidades: el modelo puede usarse para probar la sensibilidad de herramientas como ReaL ante distintos patrones de código generado.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas de evaluación sobre los 164 ejemplos de test de SecCodePLT_Plus:

| Metrica | Valor |
|---|---|
| Recompensa media | 0,511832 |
| Paso de formato de salida | 97,56% |
| Paso de sintaxis | 97,56% |
| Paso de capacidad | 25,61% |
| Paso de seguridad | 56,10% |
| Detector limpio | 54,27% |
| Puntuacion del detector | 0,768293 |
| Paso conjunto | 17,07% |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Estas cifras corresponden a un único experimento con seed 42 y un verificador Python limitado en recursos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 6,2 GB (3,1 GB de pesos + overhead de activaciones y caché KV). Con cuantización int8, unos 3,5 GB; con int4, unos 1,8 GB.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM para FP16 sin optimizaciones, p. ej., RTX 3060 Ti, RTX 3070, RTX 4060 Ti, A10, L4. Para int4, GPUs con 4 GB o más, como RTX 3050 o GTX 1660 Super.
- Es viable en GPUs de consumo, especialmente con cuantización.
- Opciones de despliegue: compatible con vLLM, TGI, llama.cpp, Ollama y Transformers. Al ser un modelo de 3B, la latencia en GPU moderna es de decenas de milisegundos por token, aunque no se han publicado mediciones específicas.
- Para entrenamiento o fine-tuning adicional, se recomienda al menos 16 GB de VRAM (p. ej., RTX 4080, A100 40GB) por el uso de gradientes y optimizadores.

## Comparativa con modelos similares

No se dispone de benchmarks públicos que comparen este modelo con alternativas de la misma categoría. Como referencia cualitativa, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Qwen2.5-Coder-3B-Instruct (base) | 3,09 B | 32k (no confirmado) | Instrucción general de código | Apache 2.0 |
| seccodeplt-qwen2.5-coder-3b-grpo-no-kl | 3,09 B | No disponible | Código seguro con GRPO sin KL | No disponible |

Otros modelos de código de 3B como CodeLlama-3B o StarCoder2-3B no tienen métricas comparables en el benchmark SecCodePLT+, por lo que no se incluyen en una tabla numérica.

## Limitaciones y advertencias

- Es un checkpoint de investigación de una sola semilla; los resultados no son una garantía general de código seguro.
- La evaluación se realizó con un verificador Python limitado en recursos, lo que puede no reflejar el comportamiento en entornos de producción.
- La tasa de paso conjunto es solo del 17,07%, indicando que la mayoría de las generaciones fallan en al menos una de las dimensiones (capacidad o seguridad).
- No se especifica la licencia, por lo que su uso comercial no está claro; se recomienda contactar al autor antes de cualquier aplicación productiva.
- Los idiomas soportados no están documentados; el modelo base Qwen2.5-Coder soporta principalmente inglés y chino, pero no se confirma para este ajuste.
- Puede presentar sesgos y alucinaciones heredados del modelo base, especialmente en contextos de baja frecuencia.
- La longitud de contexto no se ha verificado; se asume la del modelo base (32k) pero no está confirmada.
- No hay soporte documentado para tool calling, agentes o multimodalidad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/xw1234gan/seccodeplt-qwen2.5-coder-3b-grpo-no-kl-real-detector-reward-v3)
- [Dataset SecCodePLT_Plus](https://huggingface.co/datasets/fengyao1909/SecCodePLT_Plus)
- [Modelo base Qwen2.5-Coder-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct)
