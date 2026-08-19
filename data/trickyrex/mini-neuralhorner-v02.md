# TrickyRex/mini-neuralhorner-v02

## Resumen

MiniNeuralHorner v0.2 es un snapshot de desarrollo de NeuralHorner, un modelo de red neuronal recurrente especializado en aritmética modular. Lo desarrolla Robert Sneiderman (TrickyRex) y está publicado bajo licencia MIT. El modelo implementa una celda aprendida que aproxima la transición `s_next = (2*s + d*x) mod p`, reutilizada para reducir operandos y multiplicar residuos, procesando los números en formato binario bit a bit (bit-serial) siguiendo un esquema fijo de Horner. No calcula el producto modular como una operación entera de Python, sino que lo aprende mediante la recurrencia.

Con solo 126.603 parámetros entrenables y un ancho oculto recurrente de 61 (frente a 128 en el modelo v8 más grande), este artefacto está pensado como una prueba de concepto para la aritmética neuronal exacta. Ha sido evaluado en el SAIR Playground, donde obtuvo un 98,5% de aciertos en los tiers puntuados (985/1.000) y un 93,18% si se incluye el tier 0 de diagnóstico. No es un modelo de lenguaje ni de propósito general; su única función es la multiplicación modular de números binarios.

La relevancia de este modelo reside en su enfoque: demuestra que una red recurrente pequeña puede aproximar operaciones aritméticas modulares con alta precisión, aunque no con exactitud total. Es un artefacto de investigación, no una herramienta de producción, y el propio autor advierte que no debe considerarse un reemplazo de `TrickyRex/bitserial-modmul-v8`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN (GRU) con aritmética modular bit-serial y esquema de Horner |
| Parametros totales | 126.603 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa números binarios de hasta 2.048 bits de ancho de inferencia empaquetada) |
| Tipos de cuantizacion | no disponible (inferencia en float32; se probó BF16 pero no se adoptó por falta de seguridad en precisión) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`weights.pt`) |

## Arquitectura y entrenamiento

La arquitectura consiste en una celda recurrente aprendida que aproxima una única transición modular: `s_next = (2*s + d*x) mod p`. Esta celda se reutiliza tres veces: para reducir el operando `a`, para reducir el operando `b`, y para multiplicar los dos residuos resultantes. El código circundante secuencia los dígitos binarios de los operandos y propaga el estado binario predicho entre llamadas, de modo que el modelo opera bit a bit sin recurrir a operaciones enteras nativas.

El entrenamiento se realizó con un ancho de estado L=512, y posteriormente los mismos tensores pasaron una cualificación con L=1024 y pruebas con L=2048. No se especifican los datos de entrenamiento, el número de tokens ni el método de optimización (no se menciona RLHF, DPO ni otro esquema). La innovación principal es el uso de una celda recurrente para emular aritmética modular exacta, con un diseño que permite generalizar a longitudes de estado mayores que las vistas en entrenamiento, aunque con pérdida de precisión en los extremos.

## Capacidades

- Multiplicación modular de números binarios: el modelo calcula `(a * b) mod p` para primos y otros módulos, con una precisión del 98,5% en los tiers puntuados del SAIR Playground.
- Reducción modular de operandos: reutiliza la misma celda para reducir `a` y `b` antes de la multiplicación.
- Generalización a longitudes de estado superiores: entrenado con L=512, pasa pruebas de cualificación con L=1024 y L=2048 en tiers 6-9, aunque falla parcialmente en tier 10.
- Determinismo en inferencia: la ruta de inferencia empaquetada en float32 es determinista, como se verificó en 110 casos generados.
- Salida en base 2: la clase `model.MiniNeuralHorner` devuelve el resultado en representación binaria.
- Manejo de entradas fuera de rango: devuelve `[0]` si los operandos exceden la anchura empaquetada o los límites definidos, sin invocar una ruta no probada.

## Casos de uso

- Verificación de multiplicación modular en criptografía: el modelo puede servir como comprobador rápido de productos modulares en esquemas como RSA o Diffie-Hellman, aunque su falta de exactitud total (98,5%) limita su uso a validaciones preliminares o diagnósticos, no a operaciones críticas.
- Investigación en aritmética neuronal exacta: es un banco de pruebas para estudiar cómo las redes recurrentes pueden aproximar operaciones aritméticas discretas, útil para académicos que exploran límites de la computación neuronal.
- Benchmarking de arquitecturas recurrentes: permite comparar el rendimiento de una celda GRU pequeña frente a otras implementaciones de aritmética neuronal, como el modelo v8 más grande, en términos de precisión y tamaño.
- Pruebas de concepto para hardware neuronal: su tamaño reducido (126K parámetros) lo hace adecuado para emular en FPGA o microcontroladores, donde se podría evaluar la viabilidad de acelerar operaciones modulares con redes entrenadas.
- Generación de casos de prueba para validación de modelos: al ser determinista, puede usarse para generar pares de entrada-salida que sirvan para verificar otros sistemas de multiplicación modular.
- Educación en aprendizaje automático aplicado a matemáticas: como ejemplo didáctico de cómo una RNN puede aprender una operación algebraica sin programación explícita, con código fuente disponible en GitHub.

## Benchmarks y rendimiento

Los resultados provienen del SAIR Playground, según la model card del autor. No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es un LLM.

| Métrica | Resultado |
|---|---|
| Puntuación mostrada (UI) | 99% (redondeo de 98,5%) |
| Tiers puntuados 1-10 | 985/1.000 = 98,5% |
| Todos los tiers, incluyendo tier 0 | 1.025/1.100 = 93,18% |
| Frontier | T9 |
| Runtime | 156,602 segundos |
| Tamaño del artefacto | 520 KB |

| Tier | Correctos |
|---|---:|
| T0 (diagnóstico, no puntuado) | 40/100 |
| T1-T9 | 100/100 en cada tier |
| T10 | 85/100 |

Además, se realizaron comprobaciones locales con longitudes de estado mayores:

| Comprobación | Resultado |
|---|---|
| L=1024, tiers 6-9, fijo y dinámico | 64/64 en cada tier y modo |
| L=1024 confirmación, tiers 6-9 | 256/256 en cada tier y modo |
| Primos < 64, L=1024 fijo | 40.954/40.954 |
| Primos < 64, L=32 dinámico | 40.954/40.954 |
| L=2048, tier 9, fijo y dinámico | 64/64 |
| L=2048, tier 10, fijo y dinámico | 63/64 |

Una comprobación local con 110 casos generados dio 99/100 en tiers 1-10 (10/10 en tiers 1-9 y 9/10 en tier 10), y 6/10 en el tier 0 de diagnóstico.

## Requisitos de hardware

- VRAM estimada: al tener solo 126.603 parámetros, el modelo ocupa menos de 1 MB en float32. Cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU sin problema.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 10xx o superior, AMD, integradas) es suficiente. No se requieren GPUs de datacenter.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo puede ejecutar la inferencia sin dificultad.
- Opciones de despliegue: al ser un modelo PyTorch, puede ejecutarse con el runtime estándar de PyTorch, tanto en CPU como en GPU. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, y no serían necesarias dado el tamaño.
- Latencia y throughput: no se han publicado mediciones específicas, pero el runtime de 156,6 segundos en el SAIR Playground corresponde a una evaluación completa con miles de casos, lo que sugiere una latencia de milisegundos por inferencia en hardware moderno.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. El propio autor menciona `TrickyRex/bitserial-modmul-v8` como el modelo más grande del que deriva este snapshot, pero no se ofrecen especificaciones ni resultados de ese modelo. Por tanto, no es posible realizar una comparativa cuantitativa.

## Limitaciones y advertencias

- No es exacto: el modelo falla en el 1,5% de los casos puntuados y en el 15% de los casos del tier 10. No debe usarse en aplicaciones donde se requiera corrección matemática garantizada.
- No es un reemplazo de `bitserial-modmul-v8`: el autor lo indica explícitamente; este es un snapshot de desarrollo con menor ancho recurrente.
- Precisión numérica: la inferencia usa float32. Se probó BF16, pero en un caso de tier 10 ambas precisiones fallaron, por lo que no se recomienda BF16.
- Entradas fuera de rango: si los operandos exceden la anchura empaquetada (2.048 bits) o los límites definidos, el modelo devuelve `[0]` sin previo aviso, lo que puede inducir a error si no se controla.
- Sin garantías de generalización: los resultados de L=1024 y L=2048 provienen de conjuntos de casos fijos locales, no de una prueba exhaustiva. El autor advierte que no son una prueba de exactitud.
- Sesgos y alucinaciones: al ser un modelo aritmético, no presenta sesgos lingüísticos ni alucinaciones textuales, pero sí errores sistemáticos en ciertos rangos de entrada (especialmente tier 10).
- Licencia: MIT permite uso comercial, pero el autor no ofrece ninguna garantía de idoneidad para producción.

## Enlaces

- HuggingFace: https://huggingface.co/TrickyRex/mini-neuralhorner-v02
- Repositorio de código e investigación: https://github.com/Robby955/neural-horner
