# VADITYA307/quarks-base-0-1

## Resumen
Quarks Base-0.1 es un checkpoint de investigación de tipo base model desarrollado por el usuario VADITYA307 dentro del proyecto Quarks, orientado a la experimentación con arquitecturas propias para modelos de código. No es un modelo ajustado por instrucciones ni un asistente: se trata de un artefacto público pensado como línea base reproducible para futuras variantes de la arquitectura QMA (Quarks Mathematical Architecture). Con 31.190.408 parámetros, 8 capas, anchura oculta de 384 y una ventana de contexto configurada de 1.024 tokens, su escala es deliberadamente reducida.

El modelo se inicializó de forma aleatoria, sin partir de ningún modelo preentrenado de terceros, y se entrenó durante 800 pasos de optimizador sobre 20.000 documentos de código extraídos de `bigcode/the-stack-smol`, cubriendo Python, C, C++, Rust, JavaScript, TypeScript, Java y Go. Incorpora un tokenizador propio (QTK v0.1) con vocabulario de 32.000 tokens y una implementación arquitectónica que combina atención local causal con RoPE, memoria global comprimida por chunks y enrutamiento aprendido entre rutas locales y globales.

Su relevancia actual es fundamentalmente metodológica: documenta con detalle la procedencia de datos, las mediciones de validación y las limitaciones conocidas, y sirve como referencia para transferencia de pesos hacia arquitecturas QMA posteriores. No debe confundirse con un modelo de generación de código utilizable en producción: el propio autor indica que la generación greedy inicial mostró repeticiones y contaminación de sintaxis entre lenguajes, y que la validación sintáctica de Python falló.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QMA v0.1 (implementación propia de Quarks): atención local causal con RoPE, memoria global comprimida por chunks, enrutamiento local/global aprendido, RMSNorm, bloques feed-forward SwiGLU y pesos de embedding/salida atados |
| Parametros totales | 31.190.408 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens configurados; longitud de secuencia del primer entrenamiento: 512 tokens; ventana de atención local: 128 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado exclusivamente con código fuente en Python, C, C++, Rust, JavaScript, TypeScript, Java y Go) |
| Licencia | no disponible (el repositorio es públicamente accesible, pero la visibilidad pública no constituye una concesión de licencia según la model card) |
| Formato de pesos | safetensors |

Otros datos técnicos relevantes: 8 capas, anchura oculta 384, 6 cabezas de atención, anchura feed-forward 1.024, tamaño de chunk de memoria global 64 tokens, 4 slots de memoria global por chunk, tokenizador QTK v0.1 con vocabulario de 32.000 tokens, tamaño del repositorio 0,1 GB.

## Arquitectura y entrenamiento
La arquitectura QMA v0.1 es una implementación desde cero que no reutiliza ningún modelo preentrenado de terceros. Combina atención local causal con codificación posicional rotatoria (RoPE) sobre una ventana de 128 tokens, con un mecanismo de memoria global que comprime la información por chunks de 64 tokens y mantiene 4 slots por chunk. Un mecanismo de enrutamiento aprendido decide cómo combinar las rutas local y global. El bloque se completa con RMSNorm, feed-forward con activación SwiGLU y pesos de embedding de tokens y de salida atados, de modo que el fichero safetensors almacena el tensor de embedding compartido una sola vez. La implementación vive en `modeling_quarks.py` y la configuración en `qma_config.json`.

El entrenamiento consistió en 800 pasos de optimizador con AdamW y autocast FP16 sobre Kaggle T4×2. El corpus fueron 20.000 documentos de código de `bigcode/the-stack-smol`, 2.500 por cada uno de los ocho lenguajes (Python, C, C++, Rust, JavaScript, TypeScript, Java y Go), filtrados mediante una lista de licencias permitidas (0BSD, Apache-2.0, BSD-2-Clause, BSD-3-Clause, CC0-1.0, ISC, MIT, Unlicense y Zlib). El bucle de entrenamiento reporta una exposición efectiva de 13.107.200 posiciones de token. El repositorio incluye `qtk_provenance.jsonl` y `data_manifest.json` para auditoría y reproducibilidad, y no redistribuye el dataset original. No se documenta RLHF, DPO ni ningún ajuste posterior al preentrenamiento.

## Capacidades
- Generación de texto autoregresiva como modelo base, sin ajuste por instrucciones ni alineación conversacional.
- Modelado de lenguaje sobre código fuente en ocho lenguajes (Python, C, C++, Rust, JavaScript, TypeScript, Java y Go), aunque sin rendimiento funcional demostrado.
- Tokenización propia mediante QTK v0.1 con vocabulario de 32.000 tokens.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües de lenguaje natural: no disponibles; el entrenamiento se limita a código.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Reutilización como inicialización parcial para futuras variantes QMA mediante transferencia selectiva de tensores compatibles.

## Casos de uso
- Investigación sobre arquitecturas compactas de modelos de código: el checkpoint permite estudiar el comportamiento de atención local combinada con memoria global comprimida en un régimen de 31 millones de parámetros, con configuración y código accesibles para inspección.
- Desarrollo y evaluación de la arquitectura QMA: sirve como línea base fija e inmutable contra la que comparar variantes posteriores, tal como propone el autor al preservar el checkpoint original sin cambios.
- Transferencia de pesos hacia nuevas variantes QMA: el flujo documentado en `qma_transfer_utils.py` permite copiar únicamente tensores con nombre, forma y rol matemático compatibles, reportando cada tensor cargado, omitido o con discrepancia de forma, y arrancando un optimizador nuevo.
- Investigación sobre tokenizadores: QTK v0.1 y su fichero de procedencia `qtk_provenance.jsonl` permiten analizar decisiones de tokenización sobre código en ocho lenguajes y compararlas con tokenizadores establecidos.
- Reproducibilidad de pipelines de preentrenamiento: los manifiestos de datos y la configuración registrada permiten reproducir el experimento en hardware modesto (dos T4) y auditar la composición del corpus y las licencias filtradas.
- Estudio de fallos en modelos pequeños: los resultados documentados (repetición en generación greedy, contaminación de sintaxis entre lenguajes, fallo en validación sintáctica de Python) constituyen material diagnóstico para investigar modos de fallo en modelos de código de muy baja escala.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks funcionales (HumanEval, MBPP, SWE-bench u otros) en la información disponible; el autor indica explícitamente que ninguno se declara superado. Las únicas mediciones registradas son de validación y diagnóstico:

| Metrica | Valor |
|---|---|
| Estimación de validación por muestreo del export de artefacto | ~4,4094 |
| Entropía cruzada en muestra determinista (262.144 posiciones, seed 20261123) | 4,439838 |
| Perplejidad en la misma muestra determinista | ~84,76 |
| Entropía cruzada held-out, Python (12 documentos) | 5,1042 |
| Entropía cruzada held-out, C (12 documentos) | 5,0874 |
| Entropía cruzada held-out, C++ (12 documentos) | 4,7111 |
| Entropía cruzada held-out, Rust (12 documentos) | 3,8101 |
| Entropía cruzada held-out, JavaScript (12 documentos) | 4,6827 |
| Entropía cruzada held-out, TypeScript (12 documentos) | 4,8655 |
| Entropía cruzada held-out, Java (12 documentos) | 4,4566 |
| Entropía cruzada held-out, Go (12 documentos) | 4,2462 |

La muestra held-out por lenguaje es muy reducida (12 documentos) y el propio autor la califica de diagnóstica, no de ranking estable.

## Requisitos de hardware
- VRAM estimada para inferencia: con 31,19 millones de parámetros, los pesos en FP16 ocupan aproximadamente 62 MB y en FP32 unos 125 MB; el consumo dominante será el de activaciones y el runtime de PyTorch, no los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo se entrenó en Kaggle T4×2, por lo que una única T4 es holgada para inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para inferencia a pequeña escala.
- Opciones de despliegue: el autor proporciona un cargador propio (`load_quarks` desde `load_quarks.py`) que requiere `torch`, `safetensors` y `tokenizers` y reconstruye la cabeza de salida atada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al tratarse de una arquitectura personalizada, estos runtimes no la reconocerían sin implementación adicional.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de rendimiento funcional del modelo, por lo que la comparación se limita a parámetros, contexto y licencia. Los modelos de la tabla se incluyen como referencia de categoría (modelos base pequeños orientados a código), no como equivalentes medidos.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Quarks Base-0.1 | 31,19 M | 1.024 tokens | no disponible | Arquitectura propia QMA v0.1, sin benchmarks funcionales, solo diagnóstico de perplejidad |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2.048 tokens | Apache-2.0 | Modelo base generalista pequeño; no comparable en rendimiento de código sin evaluación |
| CodeGen-350M-multi (Salesforce) | 350 M | 2.048 tokens | Apache-2.0 | Modelo base de código multilingüe de mayor escala |
| StarCoder2-3B (BigCode) | 3.000 M | 16.384 tokens | BigCode OpenRAIL-M | Modelo de código ampliamente evaluado; escala muy superior |

La comparación directa de rendimiento no está disponible porque Quarks Base-0.1 no ha sido evaluado en benchmarks funcionales y su perplejidad (~84,76) no es trasladable a otros tokenizadores y corpus.

## Limitaciones y advertencias
- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene conversaciones de forma fiable.
- Generación no fiable: la generación greedy inicial mostró repeticiones y contaminación de sintaxis entre lenguajes, y la validación sintáctica de Python falló.
- Sin benchmarks funcionales superados: no hay evidencia de HumanEval, MBPP, SWE-bench ni similares.
- Contexto muy limitado: 1.024 tokens configurados y 512 tokens de secuencia en el primer entrenamiento, insuficiente para ficheros de código reales de tamaño medio.
- Entrenamiento muy corto: 800 pasos de optimizador y 13.107.200 posiciones de token, lo que sitúa al modelo en una fase temprana de preentrenamiento.
- Sesgos: no documentados por el autor; el corpus se limita a ocho lenguajes y a licencias permitidas, lo que introduce sesgo de selección respecto al código real.
- Riesgo de alucinación: alto en cualquier uso generativo, dado el estado del checkpoint.
- Licencia: no disponible. La visibilidad pública del repositorio no constituye una concesión de licencia, por lo que el uso comercial y la redistribución de pesos no están claramente autorizados.
- Procedencia de datos: la lista de licencias permitidas es una regla de filtrado, no una licencia global del checkpoint; el uso de código derivado de The Stack debe respetar la licencia original de cada fichero, incluidas cláusulas de atribución.
- Uso en producción: el autor desaconseja explícitamente usar el código generado en producción o en sistemas críticos sin revisión y pruebas independientes, y recomienda ejecutar código no confiable solo en un sandbox aislado.
- Transferencia de pesos: una forma de tensor compatible no garantiza el mismo significado matemático; la lista de transferencia debe revisarse para cada nuevo diseño QMA.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/VADITYA307/quarks-base-0-1
- Dataset de entrenamiento (The Stack Smol): https://huggingface.co/datasets/bigcode/the-stack-smol
- Documentación de BigCode sobre licencias y gobernanza de The Stack: https://www.bigcode-project.org/docs/about/the-stack/
- Plan de arquitectura siguiente (referenciado en la model card): `QMA_NEXT_ARCHITECTURE_PLAN.md` (incluido en el repositorio del modelo)
- Utilidades de transferencia de pesos (referenciadas en la model card): `qma_transfer_utils.py` (incluido en el repositorio del modelo)
