# xxx1221/QwenQPU

## Resumen

QwenQPU es un modelo derivado de Qwen3.5-4B-Qwenputer que incorpora un módulo de simulación cuántica de pesos fijos dentro de la arquitectura del transformer. Lo desarrolla el usuario xxx1221 y su objetivo es que el modelo de lenguaje pueda generar circuitos cuánticos, ejecutarlos mediante una red de estado-vector con compuertas H, X, T y CNOT, y responder a partir de los conteos de medición devueltos. La propuesta es relevante porque separa la generación simbólica del circuito (a cargo de Qwen) del cálculo numérico de amplitudes (a cargo de las capas añadidas), evitando que el modelo tenga que aproximar probabilidades cuánticas por pura predicción de tokens.

El checkpoint publicado en la raíz del repositorio (r5) contiene 36 capas, 483 tensores y 9.167.926.528 parámetros según los safetensors, con un payload de pesos de 36.671.706.112 bytes en 29 shards FP32. El modelo base declarado, divagr1925/Qwen3.5-4B-Qwenputer, tiene 43 capas y hidden size 3968, e incluye parámetros compilados de CPU originales. La licencia es específica por componente (component-specific-terms) y los idiomas soportados no están declarados en la información disponible.

La arquitectura declarada es qwen3_5_text sobre la clase estándar `Qwen3_5ForCausalLM`, con cuatro capas Qwen adicionales para almacenamiento de amplitudes, ejecución de compuertas y lectura de probabilidades de evento. No hay datos publicados sobre longitud de contexto, cuantizaciones ni benchmarks generales de lenguaje en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (`Qwen3_5ForCausalLM`) con cuatro capas estándar Qwen añadidas para simulación cuántica |
| Parametros totales | 9.167.926.528 (safetensors); payload de pesos de 36.671.706.112 bytes en FP32 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en FP32) |
| Idiomas soportados | no disponible |
| Licencia | component-specific-terms (`license: other`), enlace a LICENSES.md |
| Formato de pesos | safetensors (29 shards FP32), configuración e índice en la raíz del repo |
| Capas | 36 capas, 483 tensores |
| Tokenizer | 333.702 tokens |
| Modelo base | divagr1925/Qwen3.5-4B-Qwenputer (revisión 2d9068508f2b680badb7abcded96fdd107e9ba5d) |
| Compuertas cuánticas | H, X, T (48 coeficientes FP32) y CNOT (X controlada) |
| Qubits soportados | 1 a 16 |
| Librería | pytorch |
| Tamaño del repo | 55,5 GB |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder estándar Qwen3.5 y le añade cuatro capas Qwen con función específica: almacenamiento de amplitudes, ejecución de compuertas H/X/T/CNOT y lectura de probabilidades de evento. Conserva las 32 capas de lenguaje heredadas (el checkpoint base declara 43 capas y hidden size 3968) y utiliza el forward estándar de `Qwen3_5ForCausalLM`. El flujo es: Qwen genera el circuito, las capas añadidas ejecutan la evolución del estado-vector y devuelven la respuesta numérica, y Qwen responde a partir de los conteos.

Las compuertas H, X y T son matrices reales fijas que actúan sobre pares de amplitudes complejas; CNOT aplica una máscara de control. La misma red pequeña de compuertas opera en distintas posiciones del registro, actualizando el estado compuerta a compuerta. El registro cuántico y el estado del decoder de lenguaje son independientes. Los coeficientes son constantes construidas y se almacenan con sus valores FP32 exactos en JSON junto al código del runtime. No se especifican en la información disponible datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO; el modelo base se describe como fine-tune de Qwen3.5-4B.

## Capacidades

- Generación de texto y razonamiento mediante el backbone Qwen3.5 heredado.
- Generación de circuitos cuánticos a partir de instrucciones en lenguaje natural.
- Ejecución de circuitos cuánticos de 1 a 16 qubits con compuertas H, X, T y CNOT.
- Cálculo de probabilidades de evento y muestreo de mediciones (por ejemplo, GHZ de seis qubits con endpoints de 0,5).
- Diálogo lenguaje-a-circuito-a-conteos: el modelo produce el circuito, recibe los conteos y responde sobre ellos.
- Presupuesto de generación acumulado entre generación del circuito y respuesta (hasta 16.384 tokens en el ejemplo publicado).
- Soporte de tool calling, function calling, agentes multi-paso, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Verificación de circuitos cuánticos: dado un circuito descrito en texto, QwenQPU lo ejecuta y devuelve probabilidades de evento que pueden compararse con Qiskit; el benchmark publicado usa tolerancia de 5e-5 frente a valores independientes.
- Docencia de computación cuántica: el modelo puede explicar el resultado de un circuito H-T-H (0,1464464664 frente a la referencia 0,1464466094) y generar ejemplos de GHZ con conteos de medición.
- Prototipado de algoritmos pequeños: con 1 a 16 qubits y compuertas H/X/T/CNOT, sirve para validar circuitos de Clifford y no-Clifford antes de enviarlos a hardware real.
- Asistente de laboratorio: integrado en un flujo de diálogo, traduce una petición en lenguaje natural a un circuito, lo ejecuta y resume los conteos, reduciendo el salto entre la descripción y la simulación.
- Generación de datos sintéticos de medición: el muestreo terminal del registro cuántico permite producir conteos con semilla reproducible (por ejemplo, 1024 shots con seed 123) para pruebas de pipelines.
- Evaluación comparativa de modelos: el protocolo de tareas pareadas con presupuesto compartido de 16.384 predicciones permite medir si el módulo cuántico mejora la exactitud frente al modelo sin él (27/27 frente a 1/27 en las tareas completadas).
- Investigación en arquitecturas híbridas: sirve como banco de pruebas para estudiar la separación entre generación simbólica y cómputo numérico determinista dentro de un LLM.

## Benchmarks y rendimiento

Benchmark interino publicado el 2026-11-04 00:26 UTC, con 27 de 48 tareas pareadas completadas. Ambas ramas comparten un presupuesto de 16.384 predicciones, incluidas las predicciones del módulo QPU. Ambas probabilidades de evento solicitadas deben coincidir con valores independientes de Qiskit dentro de 5e-5.

| Tareas completadas | Qwen | QwenQPU |
|---|---:|---:|
| No-Clifford (20) | 1/20 | 20/20 |
| Controles Clifford (7) | 0/7 | 7/7 |
| Todas las parejas completadas (27) | 1/27 | 27/27 |

Ejemplos de ejecución completa del modelo: el evento H-T-H devuelve 0,1464464664 frente a la referencia 0,1464466094, y cada endpoint de un GHZ de seis qubits devuelve 0,5. No se han publicado resultados de benchmarks generales de lenguaje (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint se publica en FP32 con un payload de pesos de 36.671.706.112 bytes, por lo que la inferencia requiere memoria para el checkpoint completo en FP32; no se dispone de estimaciones para cuantizaciones alternativas.
- GPU recomendadas: las ejecuciones originales documentadas usaron A100 de 80 GB con PyTorch 2.6.0+cu124 y Transformers 5.19.0.
- GPU de consumo: no hay datos publicados sobre ejecución en RTX 4090 u otras GPU de consumo; el tamaño en FP32 lo hace inviable en configuraciones de VRAM habituales de consumo sin cuantización, y no se documentan formatos GGUF.
- Opciones de despliegue: carga mediante `AutoModelForCausalLM.from_pretrained` con `trust_remote_code=False`; el runtime histórico se instala con `install_qwenqpu.py` y se ejecuta con scripts de ejemplo (`checkpoint_ghz.py`, `qwen_local.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QwenQPU | 9.167.926.528 | no disponible | Qwen3.5 + módulo de simulación cuántica de pesos fijos | component-specific-terms | Hugging Face, 217 descargas |
| divagr1925/Qwen3.5-4B-Qwenputer | 43 capas, hidden 3968 | no disponible | Qwen3.5-4B fine-tune | no disponible | Hugging Face (modelo base) |
| Qwen3.5-4B (familia base) | ~4B | no disponible | Transformer decoder estándar | no disponible | no disponible en la información |

La comparación con modelos de simulación cuántica dedicados (por ejemplo, Qiskit Aer) no está disponible en la información proporcionada; QwenQPU se limita a 1-16 qubits y compuertas H/X/T/CNOT, mientras que los simuladores dedicados cubren conjuntos de compuertas y tamaños mayores.

## Limitaciones y advertencias

- El benchmark está incompleto: solo 27 de 48 tareas pareadas estaban completadas en la fecha del informe interino, por lo que las cifras 27/27 y 1/27 no cubren el conjunto total.
- El conjunto de compuertas está limitado a H, X, T y CNOT, y el registro a 1-16 qubits; no se documentan otras compuertas ni regímenes de mayor tamaño.
- El checkpoint publicado en la raíz es FP32 y requiere memoria considerable; no se ofrecen cuantizaciones ni formatos ligeros.
- La licencia es específica por componente y remite a LICENSES.md; es necesario revisar los términos de cada componente (pesos de lenguaje y módulo cuántico) antes de uso comercial.
- Los idiomas soportados no están declarados, lo que impide garantizar cobertura multilingüe en producción.
- No se documentan datos de entrenamiento, sesgos conocidos ni tasas de alucinación del backbone; el modelo hereda los riesgos del Qwen3.5-4B base.
- El runtime histórico y el checkpoint r5 son releases distintos: el instalador y los ejemplos de la release compuesta no corresponden al checkpoint por defecto, y el modelo anterior solo es recuperable en la revisión `78dfa7bcc58f6a66da3ba78a5b86aa5eb917aadf`.
- El presupuesto de generación se acumula entre la generación del circuito y la respuesta, lo que puede truncar diálogos largos si se agota.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xxx1221/QwenQPU
- Repositorio de código y demo: https://github.com/xi-zhao/QwenQPU
- Arquitectura: https://github.com/xi-zhao/QwenQPU/blob/main/docs/ARCHITECTURE.md
- Benchmark: https://github.com/xi-zhao/QwenQPU/blob/main/docs/BENCHMARK.md
- Capas añadidas: https://github.com/xi-zhao/QwenQPU/blob/main/docs/ADDED_LAYERS.md
- Benchmark de capas añadidas: https://github.com/xi-zhao/QwenQPU/blob/main/docs/BENCHMARK_ADDED_LAYERS.md
- Manifiesto de pesos: https://github.com/xi-zhao/QwenQPU/blob/main/evidence/added-layers/weight-manifest.json
- Licencias: https://github.com/xi-zhao/QwenQPU/blob/main/docs/LICENSES.md
- Modelo base: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
