# SZLHOLDINGS/szl-cram

## Resumen

szl-cram es un motor de razonamiento basado en energía implementado en NumPy puro, publicado por SZL Holdings (a11oy) como auditoría reproducible del artículo arXiv:2611.17309. No es un modelo de lenguaje ni una red neuronal entrenada con descenso de gradiente convencional: es un motor de satisfacción de restricciones (constraint satisfaction) que utiliza una red de Hopfield con función de energía aprendida o ajustada a mano para resolver sudokus de 9x9, acompañando cada respuesta con un certificado de energía verificable por máquina.

El repositorio contiene dos artefactos de pesos en formato NPZ: `model100.npz`, un ajuste por pseudoverosimilitud de 100 épocas con 131.949 parámetros no nulos y umbral ajustado de -208,25, y `grid2_models.npz`, un reajuste usado en las evaluaciones cfgA/cfgB. El tamaño del repositorio es de 0,0 GB, coherente con un modelo de apenas cientos de miles de parámetros.

La relevancia del proyecto es metodológica más que de rendimiento: documenta con trazabilidad completa que los ajustes de pseudoverosimilitud solo con positivos generan mínimos profundos espurios a la profundidad de solución (coste mínimo fuera de diagonal de -0,5506 en interp9, es decir, entradas señuelo con recompensa), y que una energía de un solo peso fijada a mano supera al ajuste aprendido en el extremo difícil del benchmark. Los resultados son modestos en términos absolutos (mejor configuración: 13/150 sudokus exactos, 8,67%), pero el autor publica tanto el ajuste aprendido como el manual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de Hopfield / modelo basado en energía (EBM) sobre NumPy puro |
| Parametros totales | 131.949 parametros no nulos (model100.npz); 1 peso en la variante manual |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; resuelve tableros de sudoku 9x9) |
| Tipos de cuantizacion | no disponible (pesos en NPZ, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | NPZ (NumPy) |

## Arquitectura y entrenamiento

El motor implementa una red de Hopfield con matriz de pesos W, sesgos B y umbral, operando sobre representaciones de tableros de sudoku 9x9. El ajuste principal (`model100.npz`) se realizó mediante pseudoverosimilitud durante 100 épocas, con un umbral fijado en -208,25 derivado de las energías de las soluciones de entrenamiento. Un segundo artefacto (`grid2_models.npz`) contiene un reajuste usado para las evaluaciones cfgA/cfgB.

El hallazgo técnico central del autor es que la pseudoverosimilitud solo con ejemplos positivos produce mínimos profundos espurios a la profundidad de solución: en la configuración interp9 el coste mínimo fuera de diagonal es -0,5506, lo que equivale a entradas señuelo con recompensa. Como consecuencia, una energía de un solo peso fijada a mano (0 parámetros entrenados) supera al ajuste aprendido en el extremo difícil del benchmark. El motor incorpora además dos variantes de búsqueda: una búsqueda estilo artículo y MFA v2 (propia), más un modo de Gibbs enfocado.

## Capacidades

- Resolución de sudokus 9x9 con solución única mediante minimización de energía.
- Generación de certificados de energía por respuesta con la estructura `{answer, E_final, threshold, margin, sweeps, valid}`.
- Verificación por máquina del certificado: un margen > 0 indica, de forma probabilística, que la respuesta es al menos tan buena como una solución de entrenamiento.
- Compatibilidad con políticas deny-by-default gracias al certificado verificable.
- Búsqueda por minimización de energía con variantes MFA v2 y Gibbs enfocado.
- No soporta tool calling, function calling, agentes, capacidades multilingües, visión ni audio.

## Casos de uso

- Auditoría de resultados de investigación: el motor reproduce y verifica los resultados de arXiv:2611.17309 con trazabilidad completa en el repositorio de GitHub, permitiendo comprobar cada cifra publicada.
- Generación de sudokus con certificado de validez: en pipelines de generación de puzzles se puede exigir que cada tablero emitido lleve un certificado con margen positivo antes de aceptarlo.
- Sistemas con política deny-by-default: el campo `valid` y el margen permiten rechazar automáticamente respuestas que no alcancen el umbral de energía, integrándose en flujos donde la confianza debe ser comprobable.
- Estudio de modelos basados en energía: sirve como caso práctico para analizar el fenómeno de mínimos espurios en ajustes de pseudoverosimilitud solo con positivos.
- Docencia e investigación en redes de Hopfield: el código en NumPy puro y el tamaño reducido (131.949 parámetros) facilitan la experimentación y la inspección paso a paso.
- Benchmark de referencia para constraint satisfaction: las 150 tablas extremas (24-27 pistas, solución única) con tiempos medidos permiten comparar nuevas estrategias de búsqueda sobre una base reproducible.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 150 tableros extremos (24-27 pistas, solución única):

| Configuracion | Exactos | Tiempo |
|---|---|---|
| Energia aprendida, busqueda estilo articulo | 0/150 (0%) | 234 s |
| Energia aprendida, MFA v2 (propia) | 1/150 (0,67%) | 695 s |
| Energia manual (1 peso, 0 parametros entrenados), MFA v2 | 13/150 (8,67%) | 1032 s |
| Energia manual, Gibbs enfocado | 4/150 (2,67%) | 98 s |

## Requisitos de hardware

- Inferencia en CPU: al estar implementado en NumPy puro y con 131.949 parámetros, no requiere GPU.
- VRAM estimada: no aplica; los pesos en NPZ ocupan una fracción mínima de memoria (repositorio de 0,0 GB).
- GPU recomendadas: no disponibles ni necesarias para el funcionamiento publicado.
- Cabe en cualquier equipo consumer: el cuello de botella es el tiempo de búsqueda (entre 98 s y 1032 s para 150 tableros según configuración), no la memoria.
- Opciones de despliegue: ejecución directa del código Python/NumPy del repositorio de GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: derivables de la tabla de benchmarks (por ejemplo, Gibbs enfocado: 98 s para 150 tableros, aproximadamente 0,65 s por tablero).

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (motores EBM/Hopfield para constraint satisfaction con certificados de energía).

## Limitaciones y advertencias

- Rendimiento absoluto bajo: la mejor configuración resuelve 13 de 150 tableros extremos (8,67%); el ajuste aprendido resuelve 1 de 150 (0,67%).
- El ajuste por pseudoverosimilitud solo con positivos genera mínimos espurios con recompensa (coste mínimo fuera de diagonal de -0,5506 en interp9), lo que degrada la calidad del ajuste aprendido frente a la energía manual.
- El certificado es probabilístico: un margen > 0 indica que la respuesta es al menos tan buena como una solución de entrenamiento de forma probabilística, no una garantía determinista.
- El modelo está especializado exclusivamente en sudokus 9x9; no es un modelo de lenguaje y no tiene capacidades de generación de texto, código, visión ni multilingües.
- No se documentan sesgos sociales ni riesgo de alucinación en el sentido habitual, pero sí el riesgo de aceptar soluciones señuelo si se ignora el certificado.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del repositorio de GitHub para el código fuente y la trazabilidad de la auditoría.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el 2026-11-17, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-cram
- Código fuente y auditoría completa: https://github.com/szl-holdings/szl-cram
- Artículo auditado: arXiv:2611.17309
