# XllentAI/modular_arithmetic

## Resumen

El modelo `XllentAI/modular_arithmetic` es un sistema de aprendizaje profundo especializado en aritmética modular, concretamente en la multiplicación modular `a * b mod p` para números primos de hasta 2048 bits. Desarrollado por la organización XllentAI, este modelo se presenta como una solución al reto SAIR (Sparse Arithmetic and Integer Reasoning) de aritmética modular, logrando una precisión del 100% en todos los niveles del benchmark público (tiers 1 a 10).

A diferencia de los grandes modelos de lenguaje, este sistema emplea una arquitectura de red neuronal recurrente (RNN) cuya celda de transición es una red convolucional temporal (TCN) con dilatación y consciente del acarreo (*carry-aware*). El modelo aprende el paso de Horner del algoritmo de doble-y-suma, lo que le permite generalizar a primos no vistos durante el entrenamiento, superando la limitación clásica de los clasificadores directos de la aplicación bilineal. Con aproximadamente 10,7 millones de parámetros en total (0,04 GB), el modelo se distribuye en dos conjuntos de pesos compartidos según el tamaño del primo.

La relevancia de este modelo radica en su capacidad de generalización de longitud y su eficiencia paramétrica, demostrando que una tarea algorítmica compleja puede resolverse con una red pequeña y especializada si se diseña con el sesgo inductivo adecuado. Es un artefacto de investigación reproducible, con código de entrenamiento y evaluación disponible en GitHub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RNN con celda TCN (Temporal Convolutional Network) no causal, dilatada y consciente del acarreo |
| Parámetros totales | ~10,7 millones (dos conjuntos compartidos: ~5,5M y ~5,1M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (procesa secuencias de bits de hasta 2048 posiciones) |
| Tipos de cuantización | No disponible (pesos en precisión flotante estándar de PyTorch) |
| Idiomas soportados | No disponible (el modelo no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | Archivos `.pt` de PyTorch (`weights_shared_16_512.pt` y `weights_shared_1024_2048.pt`) |

## Arquitectura y entrenamiento

El modelo implementa un RNN bit-sequential que procesa los bits de `a mod p` uno a uno, en orden MSB-primero, condicionado por `(b mod p, p)`. La función de transición del RNN es una TCN no causal con dilatación cíclica (`1, 2, 4, ...`), cuyos pesos se comparten entre todas las posiciones de bit. Esta arquitectura codifica el sesgo inductivo de que la regla de acarreo y préstamo es invariante a la posición, lo que reduce el error por paso aproximadamente 15 veces en comparación con un MLP de ancho completo.

El entrenamiento se realiza sobre el mapa de un solo paso del esquema de Horner: `t_{k+1} = (2*t_k + a_bit_k * b) mod p`. El estado oculto es un vector de bits cuantizado (cuello de botella binario), lo que garantiza que si la celda es exacta en cada paso, la cadena completa es exacta. Para las celdas de mayor ancho (512 y 1024 bits), se emplea acumulación de gradiente (para reducir el ruido del gradiente) y una función de pérdida de margen sobre el bit más débil (*worst-bit margin loss*). Los datos de entrenamiento consisten en pares de primos y operaciones generados sintéticamente, con distribución uniforme de longitudes de bit dentro del rango de cada celda.

## Capacidades

- Multiplicación modular exacta `a * b mod p` para primos `p < 2^2048`, con salida en binario (MSB-primero).
- Generalización a primos no vistos durante el entrenamiento, sin brecha de memorización (la precisión en validación con primos retenidos sigue a la precisión de entrenamiento).
- Manejo de primos de tamaños 16, 32, 64, 128, 256, 512, 1024 y 2048 bits mediante dos conjuntos de pesos compartidos que se enrutan según el ancho del primo.
- Fallback honesto: para `p >= 2^2048` (fuera de todos los regímenes), el modelo emite `[0]` sin invocar la red.
- No es un modelo de lenguaje: no genera texto, no admite tool calling, ni tiene capacidades de visión o audio.

## Casos de uso

- Verificación de circuitos criptográficos: el modelo puede comprobar rápidamente resultados de multiplicación modular en implementaciones de criptografía de curva elíptica o RSA, sirviendo como oráculo de referencia en entornos de prueba.
- Investigación en razonamiento algorítmico: sirve como banco de pruebas para estudiar cómo las redes neuronales aprenden pasos algorítmicos discretos y generalizan a longitudes no vistas, útil para el diseño de arquitecturas con sesgos inductivos explícitos.
- Generación de datos sintéticos para entrenamiento de LLMs: puede producir pares (entrada, salida) de multiplicación modular con primos grandes, alimentando datasets de razonamiento matemático para modelos de lenguaje.
- Auditoría de implementaciones de aritmética modular: en sistemas embebidos o FPGA, el modelo puede validar resultados de operaciones modulares en tiempo real, detectando errores de acarreo o desbordamiento.
- Enseñanza de algoritmos: como herramienta didáctica para ilustrar el esquema de Horner y la multiplicación modular en cursos de criptografía o teoría de números computacional.
- Benchmark de generalización de longitud: el modelo establece una línea base para el reto SAIR, permitiendo a otros investigadores comparar sus enfoques contra un sistema que alcanza el 100% en todos los tiers.

## Benchmarks y rendimiento

Según la model card del autor, el modelo alcanza una precisión del 100% en todos los niveles del benchmark público SAIR (tiers 1 a 10), con una precisión global de 1.000. No se han publicado resultados en benchmarks estándar de LLMs (MMLU, HumanEval, GSM8K) porque el modelo no es un modelo de lenguaje.

| Benchmark | Resultado |
|---|---|
| SAIR tiers 1-8 (primos < 2^512) | 1.00 |
| SAIR tier 9 (primos < 2^1024) | 1.00 |
| SAIR tier 10 (primos < 2^2048) | 1.00 |
| Precisión global | 1.000 |

## Requisitos de hardware

- VRAM estimada: menos de 1 GB (el modelo pesa 0,04 GB en pesos, más overhead de inferencia).
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM; también funciona en CPU.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna (RTX 3060, RTX 4090, etc.) e incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede ejecutarse con la API de PyTorch, o exportarse a ONNX para inferencia en otros entornos. No requiere vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponible, pero al ser un RNN con ~10,7M parámetros, la inferencia es del orden de milisegundos en GPU y decenas de milisegundos en CPU para primos de 2048 bits.

## Comparativa con modelos similares

No se han encontrado modelos comparables directamente en el ecosistema de Hugging Face para la tarea específica de multiplicación modular con generalización a primos grandes. Los trabajos académicos sobre aritmética modular en LLMs (por ejemplo, los artículos de arXiv 2508.02513 y 2502.00873) estudian cómo los modelos de lenguaje representan números y realizan operaciones, pero no ofrecen un modelo especializado con estas características. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo maneja primos menores que 2^2048; para primos mayores emite un fallback `[0]` sin invocar la red, lo que puede dar resultados incorrectos si se usa sin verificación.
- No es un modelo de propósito general: no procesa lenguaje natural, no tiene capacidades de razonamiento simbólico fuera de la multiplicación modular.
- La salida es en binario (base 2); para obtener resultados en decimal es necesario convertir externamente.
- El modelo depende de la correcta tokenización de los bits de `a mod p`; errores en la entrada (por ejemplo, bits fuera de orden) producirán resultados incorrectos.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo es un artefacto de investigación y no se garantiza su robustez en entornos de producción sin pruebas adicionales.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos sintéticos, su comportamiento fuera del rango de entrenamiento (primos no primos, o entradas no modulares) no está caracterizado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/XllentAI/modular_arithmetic
- Repositorio en GitHub: https://github.com/Xllent-AI/modular_arithmetic
- Artículo relacionado sobre aritmética modular en LLMs: https://arxiv.org/abs/2508.02513
- Artículo sobre representación trigonométrica en LLMs para suma: https://arxiv.org/html/2502.00873v1
