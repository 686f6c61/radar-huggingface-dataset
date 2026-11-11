# Uuuuuuniiiiiii/goldworm-v8-coder-85m-gw

## Resumen

GoldWorm v8 85M `.gw` es una distribución cuantizada del modelo base `goldworm-v8-coder-85m`, publicado por el usuario Uuuuuuniiiiiii en Hugging Face. Se trata de un modelo de lenguaje de 85 millones de parámetros orientado a código, empaquetado en el contenedor propietario `.gw` (formato GW01), que implementa cuantización de 3 y 4 bits con agrupación de 64 pesos (g64) sobre una arquitectura byte-level. El repositorio incluye únicamente los pesos cuantizados (37,8 MB en 3 bits y 48,4 MB en 4 bits) junto con el código de carga, el conversor y un kernel C para la ruta de 3 bits.

La relevancia de esta ficha es acotada y muy específica: no se trata de un modelo nuevo ni de un avance en capacidad, sino de una demostración de ingeniería de cuantización extrema con verificación formal (pruebas en Lean 4 sobre el empaquetado de 32 valores de 3 bits) y un cargador que falla de forma cerrada ante ficheros manipulados. El autor reporta métricas medidas en CPU: NLL de 1,084 bits/byte en el texto A (idéntico al fp32) y 1,043 en el texto B para la variante de 3 bits, con una concordancia de argmax del 95,0 % frente al modelo en fp32.

El modelo base es un LM de código de 85M de parámetros, un tamaño muy pequeño que lo sitúa en la categoría de modelos experimentales o educativos, no en la de asistentes de código de producción. La licencia MIT y el enfoque en CPU sin GPU lo hacen útil para entornos con recursos muy limitados, prototipado de formatos de cuantización o investigación sobre compresión de pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer byte-level (modelo base `goldworm-v8-coder-85m`); detalles internos no disponibles |
| Parámetros totales | 85M (modelo base) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 3 bits (g64, clip search) y 4 bits (g64, secciones compatibles SHD2); fp32 original como referencia |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.gw` (contenedor GW01, layout SHD-CCP SHD2 + kind de 3 bits); el base en `model.safetensors` |
| Tamaño de los artefactos | 37,8 MB (q3g64), 48,4 MB (q4g64), 340,7 MB (fp32 original) |
| Repositorio | 0,1 GB |
| Revisión del modelo base | `c0dc0f13`, sha256 `8a7b5716…aea0a7` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `goldworm-v8-coder-85m` más allá de su naturaleza byte-level (tokenización a nivel de byte, sin vocabulario subword) y su orientación a código. No se especifican el número de capas, dimensiones ocultas, mecanismo de atención, composición del dataset de entrenamiento, número de tokens vistos ni si hubo etapas de RLHF o DPO. Tampoco se documenta la longitud de contexto.

La innovación técnica destacable de este repositorio no está en el modelo sino en el contenedor `.gw`. El formato GW01 empaqueta 32 códigos de 3 bits en tres palabras `uint32` little-endian, lo que da exactamente 3,0 bits por peso. El autor incluye una prueba en Lean 4 (`lean/GwPack.lean`, sin Mathlib, solo `Nat` y sin división) que demuestra que el empaquetado de 32 valores de 3 bits es una biyección sobre [0, 2^96) y que la división en tres palabras `uint32` es inyectiva. El kernel C de 3 bits solo se valida empíricamente. El cargador implementa un esquema cerrado con verificación de sha256 del fichero completo y por partes, dtypes little-endian explícitos y comprobaciones de forma, procedencia y tokenizador; según el autor, rechazó 10 de 10 ficheros de prueba manipulados o malformados.

El autor reporta también que la poda estructurada 2:4 sin fine-tuning destruye el modelo (NLL 1,76) y por tanto no se aplica. No hay información sobre el proceso de búsqueda de clips ni sobre cómo se calibraron los grupos de 64 pesos.

## Capacidades

- Generación de texto y código a nivel de byte, heredadas del modelo base `goldworm-v8-coder-85m`; no se documentan capacidades específicas más allá de la orientación a código.
- Razonamiento y matemáticas: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el modelo es byte-level, lo que en principio permite procesar cualquier secuencia UTF-8, pero no se documenta calidad por idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Carga e inferencia en CPU mediante un port en NumPy (`goldworm_np.py`) y un kernel C opcional para 3 bits.

## Casos de uso

- Investigación sobre formatos de cuantización extrema: el repositorio sirve como referencia reproducible para estudiar el impacto de 3 y 4 bits con grupos de 64 pesos en un LM pequeño, con métricas de NLL y concordancia de argmax ya publicadas.
- Validación de cargadores con integridad criptográfica: el esquema de verificación (sha256 por fichero y por partes, esquema cerrado) es un ejemplo práctico para diseñar cargadores que fallen de forma segura en pipelines de modelos.
- Pruebas de verificación formal de empaquetados de bits: la prueba en Lean 4 sobre la biyección del empaquetado 3-bit puede reutilizarse como base para verificar otros formatos de compresión.
- Prototipado en entornos sin GPU: con 37,8 MB en 3 bits y ejecución en CPU vía NumPy, el modelo cabe en cualquier máquina y permite experimentar con inferencia de código sin acelerador.
- Educación y demostraciones: útil para explicar cuantización, empaquetado de bits y trade-offs entre tamaño y fidelidad en charlas o cursos.
- Evaluación comparativa de kernels: el kernel C `gwq3.c` y el camino de 4 bits vía `libqk.so` permiten medir latencia y throughput de implementaciones alternativas en CPU (el autor reporta ~70 B/s para el kernel de 3 bits frente a ~128 B/s para fp32 NumPy).

## Benchmarks y rendimiento

Datos medidos en CPU por el autor (no son benchmarks estándar tipo MMLU o HumanEval):

| Variante | Tamaño | NLL A (bits/byte) | NLL B (bits/byte) | Concordancia argmax vs fp32 | pass@1 (16 tareas × 8) |
|---|---|---|---|---|---|
| fp32 original | 340,7 MB | 1,084 | 1,038 | 1,000 | 0,109 |
| 3 bits g64 | 37,8 MB | 1,084 | 1,043 | 0,950 | 0,109 |
| 4 bits g64 | 48,4 MB | 1,102 | 1,043 | 0,975 | 0,125 |

Advertencias del propio autor: el pass@1 sobre 128 muestras es solo indicativo (±~0,03); el texto A es pequeño (1,2 kB) y el texto B es código fuente de la stdlib de CPython, que puede solaparse con los datos de entrenamiento. No hay ganancia de velocidad a 85M en CPU: fp32 NumPy rinde ~128 B/s y el kernel de 3 bits ~70 B/s; la cuantización a 3 bits aporta tamaño y memoria, no velocidad.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para CPU. En 3 bits ocupa 37,8 MB y en 4 bits 48,4 MB en disco y en memoria.
- GPU recomendadas: no disponible; no se documenta soporte GPU para el contenedor `.gw`.
- ¿Cabe en GPU de consumo? Sí por tamaño (cualquier GPU con más de 1 GB), pero no hay ruta de ejecución GPU documentada.
- Despliegue: carga mediante `gwload.load()` sobre el port NumPy (`code/gwload.py`, `goldworm_np.py`); kernel C opcional `libgwq3.so` compilado con `cc -O3 -shared -fPIC -o libgwq3.so gwq3.c`; la ruta de 4 bits requiere `libqk.so` de SHD-CCP vía `SHDCCP_LIBQK`, que no se incluye en el repositorio.
- Latencia y throughput: ~70 B/s con el kernel de 3 bits y ~128 B/s con fp32 NumPy en CPU, según el autor; no se reportan cifras para la ruta de 4 bits.
- Dependencias: `numpy` para la carga básica; compilador C para el kernel.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GoldWorm v8 85M `.gw` (este) | 85M | no disponible | 3 y 4 bits, formato `.gw` | MIT | Hugging Face, 0 descargas, 0 likes |
| goldworm-v8-coder-85m (base) | 85M | no disponible | fp32 (`safetensors`) | no disponible en la información | Hugging Face |
| Alternativas de 85M-100M tipo código | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (LMs de código de ~85M) en los datos proporcionados, por lo que la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Modelo de 85M de parámetros: capacidad muy limitada para código en producción; el pass@1 reportado (0,109-0,125) es bajo y solo indicativo.
- El autor reconoce que no hay ganancia de velocidad en CPU a este tamaño; la cuantización a 3 bits reduce tamaño y memoria, no latencia.
- La evaluación se hizo sobre textos pequeños (1,2 kB) y sobre código de la stdlib de CPython que podría solaparse con el entrenamiento; los números de NLL pueden no generalizar.
- La ruta de 4 bits depende de `libqk.so` de SHD-CCP, que no se incluye en el repositorio; sin esa biblioteca, el camino de 4 bits no es ejecutable tal cual.
- El kernel C de 3 bits solo está validado empíricamente; la garantía formal en Lean 4 cubre el empaquetado, no la implementación del kernel.
- No se documentan sesgos, idiomas soportados ni comportamiento multilingüe; al ser byte-level, la calidad por idioma es desconocida.
- Riesgo de alucinación inherente a un LM pequeño, agravado por la falta de benchmarks estándar que permitan acotar su fiabilidad.
- Licencia MIT: permite uso comercial, pero el modelo base podría tener condiciones adicionales no reflejadas en la información disponible; conviene verificar la licencia del base `goldworm-v8-coder-85m`.
- Repositorio con 0 descargas y 0 likes; sin validación por parte de la comunidad.
- Fecha de creación indicada como 2026-11-10, posterior a la fecha habitual de referencia; conviene verificar la coherencia temporal de los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Uuuuuuniiiiiii/goldworm-v8-coder-85m-gw
- Modelo base: https://huggingface.co/Uuuuuuniiiiiii/goldworm-v8-coder-85m
- Ficheros del repositorio: `goldworm-v8-85m.q3g64.gw`, `goldworm-v8-85m.q4g64.gw`, `code/gwcore.py`, `code/gwload.py`, `code/goldworm_np.py`, `code/convert.py`, `code/gwq3.c`, `code/engine.py`, `lean/GwPack.lean`, `SPEC.md`, `REPORT.md`
- Vídeos de lanzamiento: `media/gw_launch.mp4`, `media/gw_launch_9x16.mp4`
- Paper, blog o demo adicionales: no disponible en la información proporcionada
