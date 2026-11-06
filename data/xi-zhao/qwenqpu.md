# xi-zhao/QwenQPU

## Resumen

QwenQPU es un modelo experimental publicado por xi-zhao que integra un módulo de simulación cuántica ("QPU") dentro de un modelo de lenguaje Qwen. El componente lingüístico son los pesos sin modificar de divagr1925/Qwen3.5-4B-Qwenputer (43 capas, hidden size 3968, 9.357.602.496 parámetros totales según safetensors, 18,7 GB en ocho shards). El componente cuántico es una red de puertas de pesos fijos (48 coeficientes FP32 para H, X y T, más CNOT mediante máscara de control) que ejecuta circuitos sobre un registro de 1 a 16 qubits.

El flujo de funcionamiento es un pipeline de tres etapas: Qwen genera una descripción de circuito, el módulo cuántico la ejecuta mediante simulación ideal de vector de estado y devuelve un recuento de medidas, y Qwen responde a partir de esos recuentos. La innovación no está en el entrenamiento (los pesos del lenguaje no se han reentrenado), sino en el acoplamiento de un runtime compuesto que separa el estado del registro cuántico del estado del decodificador lingüístico.

Es relevante ahora como prueba de concepto de "herramientas" no neuronales embebidas en un LLM: en lugar de delegar el cálculo cuántico a una API externa, el modelo lleva consigo un simulador determinista de pesos fijos. Su utilidad práctica es limitada y su licencia es heterogénea, pero documenta una vía interesante para aumentar la fiabilidad en dominios con verificación formal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5, 43 capas, hidden size 3968) + módulo QPU de pesos fijos (simulación de vector de estado) |
| Parámetros totales | 9.357.602.496 (pesos lingüísticos; el módulo cuántico añade 48 coeficientes FP32) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo solo publica safetensors en el formato original) |
| Idiomas soportados | no disponible |
| Licencia | component-specific-terms (pesos upstream Apache-2.0; código propio sin licencia open source) |
| Formato de pesos | safetensors (8 shards) + `QwenQPU.bundle.json` (coeficientes cuánticos, configs y runtime en Python) |

## Arquitectura y entrenamiento

La parte lingüística es un transformer denso estándar cargable con la clase `Qwen3_5ForCausalLM` de Transformers (`trust_remote_code=False`). Procede tal cual del checkpoint divagr1925/Qwen3.5-4B-Qwenputer en la revisión `2d9068508f2b680badb7abcded96fdd107e9ba5d`, incluyendo sus parámetros CPU compilados originales. No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

El módulo QPU es una red de puertas de pesos fijos: H, X y T son matrices reales fijas que actúan sobre pares de amplitudes complejas, y CNOT aplica una X controlada mediante máscara. La misma red pequeña se aplica en posiciones distintas del vector de estado, actualizando el estado puerta a puerta. El estado se almacena como tensor FP32 de forma `[2**n, 2]` (parte real e imaginaria). El runtime soporta 1–16 qubits y hasta 1.000 operaciones de puerta secuenciales entre resets. La medida terminal usa un estado final y el número solicitado de extracciones uniformes; las probabilidades exactas están disponibles para diagnóstico. La implementación es simulación ideal de vector de estado, sin ruido ni corrección de errores. El host (código Python) parsea instrucciones, suministra números aleatorios, agrega recuentos y planifica la generación lingüística; el registro cuántico y el estado del decodificador son independientes.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-4B.
- Generación de especificaciones de circuitos cuánticos a partir de lenguaje natural.
- Ejecución de circuitos con puertas H, X, T y CNOT sobre 1–16 qubits.
- Devolución de recuentos de medidas (shots) y de probabilidades exactas para diagnóstico.
- Diálogo encadenado lenguaje → circuito → recuentos → respuesta en lenguaje natural.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Docencia de computación cuántica: el modelo puede recibir una descripción en lenguaje natural ("prepara un estado GHZ de 16 qubits y mide 1024 veces") y devolver los recuentos, útil para demostraciones interactivas sin acceso a hardware cuántico.
- Verificación de intuiciones sobre circuitos pequeños: con hasta 16 qubits y 1.000 puertas secuenciales, sirve para comprobar manualmente resultados de circuitos de paridad o superposición antes de lanzarlos en un simulador de referencia como Qiskit.
- Generación de código Qiskit asistida: el modelo base puede redactar el circuito y el módulo QPU aporta una ejecución de contraste dentro del mismo entorno, reduciendo la dependencia de servicios externos.
- Prototipado de pipelines híbridos lenguaje-cálculo: útil para investigadores que quieran experimentar con arquitecturas donde un LLM orquesta una herramienta determinista embebida en lugar de una API remota.
- Reproducción de experimentos de investigación: el bundle incluye manifiesto de pesos, hashes y runtime, lo que permite replicar el benchmark publicado con semilla fija (`--seed 123`).
- Evaluación de fiabilidad en cálculo simbólico: el benchmark de cálculo (19/20 frente a 8/20 del modelo base) lo hace adecuado como caso de estudio de cómo una herramienta determinista corrige errores aritméticos del LLM.
- No se recomienda para atención al cliente, generación de código en producción ni despliegues comerciales, dado el estado experimental y la licencia heterogénea.

## Benchmarks y rendimiento

Benchmark de circuitos supplied (partida desde |0...0>, tareas de paridad tras circuitos H/X/T/CNOT, 20 tareas en 1, 3, 8, 12 y 16 qubits, decodificación greedy, presupuesto de 16.384 tokens, 4.096 muestras por circuito, referencia Qiskit):

| Tarea y criterio de puntuación | Qwen | QwenQPU |
|---|---:|---:|
| Cálculo: JSON repetido idéntico fusionado | 8/20 | 19/20 |
| Cálculo: parser de respuesta original | 1/20 | 19/20 |
| Planificación: éxito conjunto circuito y respuesta | 1/20 | 1/20 |

El módulo de ejecución mejora la puntuación de cálculo pero no la de planificación. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint lingüístico completo ocupa 18,7 GB en safetensors; en FP16 requiere al menos ~19 GB de VRAM, más overhead de activaciones y del runtime cuántico.
- GPU recomendadas: los experimentos originales se ejecutaron en A100 80 GB con PyTorch 2.6.0+cu124 y Transformers 5.19.0.
- GPU de consumo: no cabe en GPUs de 8–16 GB sin cuantización; no se publican pesos cuantizados, por lo que no hay una ruta oficial para RTX 4090 (24 GB) ni inferiores.
- Opciones de despliegue: el runtime propio en Python (`QwenQPU-runtime/`), cargando con Transformers. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el módulo cuántico requiere el bundle JSON y el instalador `install_qwenqpu.py`.
- Latencia y throughput: no disponibles. El presupuesto de generación por defecto es de 16.384 tokens acumulados entre generación de circuito y respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Capacidad cuántica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QwenQPU | 9,36 B (pesos lingüísticos) | no disponible | Simulación 1–16 qubits, H/X/T/CNOT | component-specific-terms | Hugging Face, repo propio |
| Qwen3.5-4B-Qwenputer (base) | no disponible en la información | no disponible | No | no disponible | Hugging Face |
| Qiskit (simulador de referencia) | N/A | N/A | Simulación de vector de estado, muchas más puertas y qubits | Apache-2.0 | PyPI, open source |

La comparación directa con otros LLM con módulo cuántico embebido no está disponible en la información proporcionada. Frente a Qiskit, QwenQPU añade la capa de lenguaje natural pero limita el alcance a 16 qubits, 1.000 puertas y cuatro tipos de puerta.

## Limitaciones y advertencias

- Los pesos lingüísticos no se han reentrenado: las mejoras provienen exclusivamente del módulo de ejecución, no de un ajuste del modelo.
- La puntuación de planificación (generar el circuito correcto y la respuesta) se mantiene en 1/20; el modelo no planifica bien circuitos complejos.
- Simulación ideal de vector de estado: no modela ruido, decoherencia ni errores de puerta, por lo que no sirve para validar hardware real.
- Límite duro de 16 qubits y 1.000 operaciones secuenciales entre resets.
- Solo cuatro tipos de puerta (H, X, T, CNOT); no hay rotaciones arbitrarias ni puertas de múltiples qubits más allá de CNOT.
- Riesgo de alucinación inherente al modelo base en la fase de generación de circuitos y de respuestas en lenguaje natural.
- Sesgos del modelo base no documentados en la información disponible.
- Idiomas soportados no documentados.
- Licencia fragmentada: los pesos upstream son Apache-2.0, pero el código y el arte propios de QwenQPU no tienen licencia open source project-wide, lo que impide un uso comercial claro sin revisar `docs/LICENSES.md`.
- El comando de descarga de la model card referencia `xxx1221/QwenQPU`, distinto del ID del repo (`xi-zhao/QwenQPU`); conviene verificar la ruta antes de descargar.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni mantenimiento demostrado.

## Enlaces

- Hugging Face: https://huggingface.co/xi-zhao/QwenQPU
- Modelo base: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
- Código y demo: https://github.com/xi-zhao/QwenQPU
- Arquitectura: https://github.com/xi-zhao/QwenQPU/blob/main/docs/ARCHITECTURE.md
- Benchmark: https://github.com/xi-zhao/QwenQPU/blob/main/docs/BENCHMARK.md
- Licencias por componente: https://github.com/xi-zhao/QwenQPU/blob/main/docs/LICENSES.md
