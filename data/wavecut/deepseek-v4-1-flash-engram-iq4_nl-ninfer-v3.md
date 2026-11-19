# WaveCut/DeepSeek-V4.1-Flash-Engram-IQ4_NL-NInfer-v3

## Resumen
El artefacto `WaveCut/DeepSeek-V4.1-Flash-Engram-IQ4_NL-NInfer-v3` no es un modelo de lenguaje completo, sino la tabla Engram del modelo DeepSeek-V4.1-Flash-1017 empaquetada como artefacto NInfer v3. Se trata de un fichero de 103,32 GiB que contiene 768.022.850 filas de 256 valores cada una (196.600 millones de parámetros), correspondientes a los dos bloques Engram (bloques 1 y 14) del modelo base. Las filas están cuantizadas en IQ4_NL (144 bytes por fila) y se copian byte a byte del GGUF publicado por ISTA-DASLab.

Este artefacto es necesario para ejecutar cualquier conversión NInfer de DeepSeek-V4.1-Flash-1017 que no incluya su tabla Engram embebida. El motor NInfer lo carga mediante el flag `--ngram-table` y lee las filas bajo demanda desde disco a través de la caché de páginas del sistema operativo, o las mantiene en RAM según el modo de residencia configurado. Es relevante porque permite ejecutar un modelo de gran tamaño con memoria n-grama masiva en hardware de consumo, delegando el almacenamiento de la tabla a SSD en lugar de VRAM o RAM.

La relevancia práctica radica en que las compilaciones estándar de NInfer no pueden leer este fichero: la familia de modelos y los formatos `gguf_*` solo existen en la rama `master` de `iamwavecut/ninfer-all` a partir del commit `42376e907`. El artefacto está publicado bajo licencia MIT y acumula 2.718 descargas desde su creación el 25 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tabla Engram (n-gramas hasheados por cabeza) para DeepSeek-V4.1-Flash-1017; no es un modelo completo |
| Parametros totales | 196.600 millones (768.022.850 filas × 256 valores) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `--max-context 32768`) |
| Tipos de cuantizacion | IQ4_NL (144 bytes por fila) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.ninfer` (artefacto NInfer v3); origen GGUF (`DeepSeek-V4.1-Flash-Engram-IQ4_NL.gguf`) |

## Arquitectura y entrenamiento
El artefacto contiene las tablas Engram de los bloques 1 y 14 del modelo DeepSeek-V4.1-Flash-1017. Cada bloque añade filas propias: los n-gramas de orden 2, 3 y 4 que terminan en una posición, hasheados por cabeza, direccionan 24 filas por token en cada bloque. El primer bloque aporta 384.006.168 filas y el segundo 384.016.682, sumando 768.022.850 filas de 256 valores cada una. Las filas se copian byte a byte del GGUF IQ4_NL publicado por ISTA-DASLab, con 144 bytes por fila.

El fichero resultante ocupa 110.940.717.396 bytes (103,32 GiB): las filas (103,00 GiB) más un perfil de filas calientes de 345 MB para el modo `--ngram-residency ram-hot`. El componente `engram` registra los bloques, sus recuentos de filas, el formato y el SHA-256 de las filas (`36ee7d378c25f61acf794b78a404eb4946b5233531f37f1024033bbd5f6b41a5`). Un modelo declara la tabla que necesita mediante ese digest y NInfer rechaza cualquier tabla que difiera. La conversión se realizó en 3 minutos 29 segundos sobre 24 núcleos de un Threadripper 3960X. El perfil de filas calientes se calculó a partir de texto: 86.355.715 filas ordenadas por lecturas sobre 3.734.454 tokens (5.831 documentos muestreados de cuatro Common Crawl).

## Capacidades
- Almacenamiento de la tabla Engram del modelo DeepSeek-V4.1-Flash-1017, necesaria para que las conversiones NInfer de ese modelo funcionen con su componente n-grama.
- Lectura bajo demanda desde disco: antes de cada pasada, el motor lee las filas que la pasada direcciona (48 por token, 6,9 KB) mediante lecturas posicionadas en varios hilos y las copia a la GPU.
- Modos de residencia configurables: `disk` (por defecto, lee desde SSD), `ram` (carga los 103 GiB completos en RAM) y `ram-hot` (mantiene en RAM las filas mejor clasificadas por el perfil, hasta `--ngram-ram-mib`, 4.096 MiB por defecto).
- Compatibilidad con la línea `master` de `iamwavecut/ninfer-all` a partir del commit `42376e907`; las compilaciones estándar de NInfer no pueden leerlo.
- Verificación de integridad mediante SHA-256 de las filas y digest declarado por el modelo.
- No es un modelo generativo por sí mismo: no genera texto, no razona, no hace tool calling ni tiene capacidades multilingües propias.

## Casos de uso
- Ejecución de DeepSeek-V4.1-Flash-1017 en hardware de consumo: el artefacto permite servir el modelo con `ninfer-serve` manteniendo la tabla Engram en SSD en lugar de VRAM, con lo que se reduce la huella de memoria del componente n-grama.
- Despliegue en servidores con SSD NVMe y GPU de gama alta: con el modo de residencia por defecto, la tabla puede residir en cualquier SSD y el motor lee las filas necesarias en cada pasada, lo que facilita montar el modelo en máquinas con 103 GiB de RAM insuficientes.
- Configuraciones con RAM abundante: el modo `--ngram-residency ram` carga los 103 GiB completos en memoria; junto con los expertos del modelo en memoria host fijada, requiere unos 210 GiB, adecuado para servidores con gran cantidad de RAM.
- Optimización con perfil de filas calientes: el modo `ram-hot` mantiene en RAM las filas más leídas según el perfil de 345 MB, reduciendo lecturas a disco en cargas de trabajo con distribución de n-gramas sesgada hacia el texto de Common Crawl.
- Reproducibilidad y auditoría: el SHA-256 de las filas y el informe de conversión incluido permiten verificar que la tabla es idéntica a la publicada por ISTA-DASLab y que las conversiones de distintos builds leen los mismos bytes.
- Integración en pipelines de conversión: el comando de conversión documentado permite regenerar el artefacto desde el GGUF de origen y el split GGUF del modelo, útil para equipos que necesiten reconstruir la tabla con su propia configuración.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible para el modelo completo; el artefacto Engram en sí no requiere VRAM, ya que las filas se leen desde disco o RAM y se copian a la GPU bajo demanda (6,9 KB por token y pasada).
- Almacenamiento: 103,32 GiB para el fichero `.ninfer`; el modo por defecto requiere un SSD (cualquier SSD sirve según la model card) con lecturas posicionadas multihilo.
- RAM: modo `disk` sin requisito de RAM para la tabla; modo `ram` requiere 103 GiB para la tabla y unos 210 GiB en total con los expertos del modelo en memoria host fijada; modo `ram-hot` requiere hasta `--ngram-ram-mib` (4.096 MiB por defecto) más el resto leído desde disco.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? La tabla no se carga en VRAM; el modelo completo requiere hardware no especificado en la información.
- Opciones de despliegue: `ninfer-serve` de la línea `master` de `iamwavecut/ninfer-all` (commit `42376e907` o posterior); no compatible con compilaciones estándar de NInfer ni con llama.cpp, vLLM, Ollama o TGI según la información disponible.
- Latencia y throughput: no disponible; la conversión del artefacto tardó 3 min 29 s en 24 núcleos de un Threadripper 3960X.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| WaveCut/DeepSeek-V4.1-Flash-Engram-IQ4_NL-NInfer-v3 | 196,6B (tabla Engram) | no disponible | MIT | `.ninfer` | Hugging Face, 2.718 descargas |
| WaveCut/DeepSeek-V4.1-Flash-1017-GSQ-RCO-IQ1_M-NInfer-v3 | no disponible | no disponible | no disponible | `.ninfer` | Hugging Face |
| WaveCut/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-IQ2_XXS-NInfer-v3 | no disponible | no disponible | no disponible | `.ninfer` | Hugging Face |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | no disponible | no disponible | no disponible | GGUF | Hugging Face (modelo base) |

## Limitaciones y advertencias
- No es un modelo de lenguaje: es un artefacto de tabla Engram; no genera texto ni tiene capacidades de razonamiento, código o matemáticas por sí mismo.
- Incompatibilidad con compilaciones estándar de NInfer: solo funciona con la rama `master` de `iamwavecut/ninfer-all` desde el commit `42376e907`; otras builds rechazan el fichero.
- Verificación estricta de digest: un modelo que declare un SHA-256 distinto hará que NInfer rechace la tabla; no se puede sustituir por otra versión sin coincidencia exacta.
- Requisito de almacenamiento considerable: 103,32 GiB en disco, con lecturas posicionadas multihilo que dependen del rendimiento del SSD en el modo por defecto.
- El modo `ram` exige unos 210 GiB de RAM en total con los expertos del modelo, lo que limita su uso a servidores de gran capacidad.
- El perfil de filas calientes se calculó sobre 3.734.454 tokens de cuatro Common Crawl; su eficacia puede degradarse en dominios alejados de esa distribución.
- Sesgos y alucinaciones: no aplica al artefacto en sí, pero el modelo base DeepSeek-V4.1-Flash-1017 puede presentar los sesgos y alucinaciones propios de los modelos entrenados con datos web; no hay información específica en la model card.
- Licencia MIT declarada en el artefacto; conviene verificar las condiciones de la licencia del modelo base y del GGUF de origen antes de uso comercial.
- Idiomas soportados: no disponible.

## Enlaces
- Hugging Face: https://huggingface.co/WaveCut/DeepSeek-V4.1-Flash-Engram-IQ4_NL-NInfer-v3
- Modelo base (GGUF): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Artefacto IQ1_M: https://huggingface.co/WaveCut/DeepSeek-V4.1-Flash-1017-GSQ-RCO-IQ1_M-NInfer-v3
- Artefacto Coder IQ2_XXS: https://huggingface.co/WaveCut/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-IQ2_XXS-NInfer-v3
- Repositorio NInfer: https://github.com/Neroued/ninfer
- Repositorio ninfer-all: https://github.com/iamwavecut/ninfer-all
- Commit de compatibilidad: https://github.com/iamwavecut/ninfer-all/commit/42376e907b16192999c085d4224a2219ac0438bf
- Commit del perfil de filas calientes: https://github.com/iamwavecut/ninfer-all/commit/c0321db023ee1d4ded4afbeaf7404327aadfe640
