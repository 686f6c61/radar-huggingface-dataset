# xi-zhao/QwenQPU

## Resumen

QwenQPU es un modelo experimental publicado por el usuario xi-zhao que integra un simulador de circuitos cuánticos dentro de un modelo de lenguaje. Parte del checkpoint comunitario divagr1925/Qwen3.5-4B-Qwenputer (arquitectura Qwen3.5) y le añade cuatro capas estándar nuevas encargadas de almacenar amplitudes, ejecutar compuertas H, X, T y CNOT, y leer probabilidades de eventos. El modelo hereda 32 capas de lenguaje y utiliza el forward estándar de `Qwen3_5ForCausalLM`; el modelo de lenguaje genera el circuito y las capas añadidas devuelven la respuesta numérica.

La propuesta es poco convencional: no se trata de un LLM de propósito general, sino de un artefacto de investigación que combina pesos de lenguaje con una red de pesos fijos que simula evolución de vectores de estado cuánticos. El repositorio raíz contiene el checkpoint completo r5 en FP32 (29 shards safetensors, 36 capas, 483 tensores, tokenizer de 333.702 tokens), con un payload de pesos de 36.671.706.112 bytes.

Su relevancia es acotada pero interesante para quien investigue híbridos entre modelos de lenguaje y simulación cuántica: los ejemplos publicados muestran una precisión numérica muy alta en la simulación (0,1464464664 frente a la referencia 0,1464466094 en el evento H–T–H) y un benchmark interino de 27 de 48 tareas emparejadas en el que el modelo base resuelve 1 de 27 y QwenQPU resuelve 27 de 27.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (`qwen3_5_text`) con cuatro capas estándar añadidas para simulación cuántica |
| Parametros totales | 9.167.926.528 (según safetensors del repo) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el checkpoint publicado es FP32 |
| Idiomas soportados | no disponible |
| Licencia | component-specific-terms (términos por componente, ver LICENSES.md) |
| Formato de pesos | safetensors (29 shards FP32 en el checkpoint r5), más JSON de configuración y manifiesto de pesos |
| Modelo base | divagr1925/Qwen3.5-4B-Qwenputer (revisión 2d9068508f2b680badb7abcded96fdd107e9ba5d) |
| Capas | 36 capas en el checkpoint r5 (43 capas y hidden size 3968 en el checkpoint base) |
| Tokenizer | 333.702 tokens |
| Tamaño del repo | 55,5 GB |
| Librería | PyTorch (Transformers 5.19.0) |

## Arquitectura y entrenamiento

El modelo combina dos componentes. Por un lado, los pesos de lenguaje proceden sin cambios del checkpoint divagr1925/Qwen3.5-4B-Qwenputer, que según la model card tiene 43 capas y hidden size 3968, incluyendo parámetros compilados de CPU originales. Por otro, se añaden cuatro capas estándar de Qwen para almacenamiento de amplitudes, ejecución de compuertas H/X/T/CNOT y lectura de probabilidades de eventos. El forward es el stock de `Qwen3_5ForCausalLM`, de modo que el modelo de lenguaje genera la instrucción del circuito y las capas añadidas devuelven el resultado numérico.

La parte cuántica no es un módulo entrenado de forma convencional: H, X y T son matrices reales fijas que actúan sobre pares de amplitudes complejas, y CNOT aplica una máscara de control. La misma red pequeña de compuertas actúa en distintas posiciones del vector de estado, actualizando el estado compuerta a compuerta. El host (runtime Python) parsea instrucciones, aporta números aleatorios, agrega conteos y programa la generación de lenguaje; el registro cuántico y el estado del decodificador de lenguaje están separados. Los coeficientes son constantes construidas y se almacenan como JSON en FP32 junto al código del runtime. No se documentan en la información disponible datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto con el backbone Qwen3.5 heredado del checkpoint base.
- Simulación de circuitos cuánticos de 1 a 16 qubits con compuertas H, X, T y CNOT.
- Cálculo de probabilidades de eventos cuánticos con alta precisión numérica (error del orden de 1e-7 en el ejemplo H–T–H publicado).
- Muestreo de resultados de medición y agregación de conteos (por ejemplo, 534 muestras todo-cero y 490 todo-uno en un GHZ de 16 qubits con 1024 shots).
- Generación de circuitos a partir de instrucciones en lenguaje natural, ejecución y respuesta en lenguaje natural a partir de los conteos devueltos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el flujo circuito-ejecución-respuesta es multi-paso dentro del dominio cuántico.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Verificación de resultados de circuitos cuánticos pequeños: el modelo puede generar el circuito, ejecutarlo en su simulador interno y devolver probabilidades de eventos que se comparan con valores de referencia de Qiskit con tolerancia de 5e-5, útil como herramienta de docencia o validación cruzada.
- Docencia de computación cuántica: sirve para construir circuitos GHZ, aplicar secuencias H–T–H y explicar en lenguaje natural la distribución de resultados a partir de los conteos muestreados.
- Investigación en híbridos LLM-simulador: permite estudiar cómo un modelo de lenguaje formula circuitos y consume los resultados numéricos, con un protocolo de layout de tokens documentado (`protocol-token-layout.json`).
- Reproducción de experimentos: los ejemplos incluidos (`checkpoint_ghz.py`, `qwen_local.py`) permiten reproducir el diálogo lenguaje-a-circuito-a-conteos con semilla fija y presupuesto de generación acotado.
- Generación de datos sintéticos de circuitos: el modelo puede producir descripciones de circuitos y sus resultados asociados para alimentar pipelines de evaluación de simuladores cuánticos.
- Auditoría de pesos y artefactos: el manifiesto de pesos y los hashes del bundle permiten verificar la composición exacta del checkpoint, útil en entornos que exigen trazabilidad de artefactos.
- Exploración de estados GHZ y entrelazamiento: con hasta 16 qubits y 1024 shots se pueden caracterizar empíricamente los extremos de la distribución GHZ.

## Benchmarks y rendimiento

Benchmark interino publicado en la model card (2026-11-04 00:26 UTC), con 27 de 48 tareas emparejadas completadas. Ambas variantes comparten un presupuesto de 16.384 predicciones, incluidas las predicciones del QPU; ambas probabilidades de evento deben coincidir con valores independientes de Qiskit dentro de 5e-5.

| Categoría | Tareas completadas | Qwen | QwenQPU |
|---|---:|---:|---:|
| No-Clifford | 20 | 1/20 | 20/20 |
| Controles Clifford | 7 | 0/7 | 7/7 |
| Todos los pares completados | 27 | 1/27 | 27/27 |

Ejemplos numéricos publicados: el evento H–T–H devuelve 0,1464464664 frente a la referencia 0,1464466094, y cada extremo de un GHZ de seis qubits devuelve 0,5. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El checkpoint publicado es FP32 y pesa 36.671.706.112 bytes solo en pesos, más tokenizer y configuración; el repo completo ocupa 55,5 GB.
- Las ejecuciones originales documentadas usaron A100 de 80 GB con PyTorch 2.6.0+cu124 y Transformers 5.19.0.
- No se indica que quepa en GPU de consumo con el checkpoint FP32 publicado; no hay versiones GGUF ni cuantizadas disponibles en la información proporcionada.
- Opciones de despliegue: carga con `AutoModelForCausalLM.from_pretrained` de Transformers 5.19.0 con `trust_remote_code=False`; el runtime cuántico se distribuye como código Python aparte en la release histórica (`install_qwenqpu.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El presupuesto de generación es acumulado entre la generación del circuito y la respuesta (16.384 tokens en el ejemplo).

## Comparativa con modelos similares

No hay modelos directamente comparables en la información proporcionada: QwenQPU no es un LLM de propósito general sino un artefacto de investigación que combina un backbone Qwen3.5 con un simulador cuántico de pesos fijos. Como referencia del backbone:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| QwenQPU | 9.167.926.528 | no disponible | component-specific-terms | Hugging Face, repo de 55,5 GB |
| divagr1925/Qwen3.5-4B-Qwenputer (base) | no disponible (43 capas, hidden 3968) | no disponible | no disponible | Hugging Face |
| Simuladores cuánticos clásicos (Qiskit y similares) | no aplica | no aplica | variable | Bibliotecas estándar |

## Limitaciones y advertencias

- Modelo experimental de investigación: no es un LLM de propósito general y su uso previsto es la simulación cuántica acoplada al lenguaje.
- La licencia es `component-specific-terms`, con términos distintos por componente; es imprescindible revisar `docs/LICENSES.md` antes de cualquier uso comercial.
- El checkpoint publicado está en FP32 y requiere memoria muy superior a la de un modelo de 4B cuantizado; no hay versiones ligeras disponibles.
- El benchmark está incompleto (27 de 48 tareas) y es interino; los resultados no deben tratarse como definitivos.
- La simulación está limitada a 1–16 qubits y a las compuertas H, X, T y CNOT; no se documentan otras compuertas.
- Los coeficientes cuánticos son constantes fijas, no aprendidas, lo que limita la adaptabilidad del componente cuántico.
- No hay información sobre sesgos, riesgo de alucinación en lenguaje natural, cobertura idiomática ni comportamiento fuera del dominio cuántico.
- El runtime histórico y el checkpoint r5 actual son artefactos distintos; el runtime compuesto anterior solo es recuperable en la revisión `78dfa7bcc58f6a66da3ba78a5b86aa5eb917aadf`.
- El modelo base tiene 43 capas y hidden size 3968, mientras que el checkpoint r5 declara 36 capas; conviene verificar la composición exacta con el manifiesto de pesos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xi-zhao/QwenQPU
- Repositorio y demo: https://github.com/xi-zhao/QwenQPU
- Arquitectura: https://github.com/xi-zhao/QwenQPU/blob/main/docs/ARCHITECTURE.md
- Capas añadidas: https://github.com/xi-zhao/QwenQPU/blob/main/docs/ADDED_LAYERS.md
- Manifiesto de pesos: https://github.com/xi-zhao/QwenQPU/blob/main/evidence/added-layers/weight-manifest.json
- Benchmark de capas añadidas: https://github.com/xi-zhao/QwenQPU/blob/main/docs/BENCHMARK_ADDED_LAYERS.md
- Benchmark histórico: https://github.com/xi-zhao/QwenQPU/blob/main/docs/BENCHMARK.md
- Licencias por componente: https://github.com/xi-zhao/QwenQPU/blob/main/docs/LICENSES.md
- Modelo base: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
- Revisión histórica del runtime compuesto: https://huggingface.co/xi-zhao/QwenQPU/tree/78dfa7bcc58f6a66da3ba78a5b86aa5eb917aadf
