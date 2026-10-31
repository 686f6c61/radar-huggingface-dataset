# WaveCut/DeepSeek-V4.1-Flash-Engram-IQ4_NL-NInfer-v3

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino el artefacto de la tabla Engram (n-gram) de DeepSeek-V4.1-Flash-1017, empaquetado como artefacto v3 para NInfer, un motor de inferencia experimental. La tabla procede de las cuantizaciones GSQ-RCO de ISTA-DASLab y es un componente obligatorio para ejecutar cualquier conversión NInfer de DeepSeek-V4.1-Flash-1017: el modelo fue entrenado con ella y, sin la tabla, la perplejidad en una muestra de WikiText pasa de 3,07 a 9,68.

El archivo contiene las dos tablas Engram del modelo (bloques 1 y 14), con 768.022.850 filas de 256 valores cada una, lo que equivale a 196,6 mil millones de parámetros en formato IQ4_NL. Cada token direcciona 24 filas por bloque (48 en total, unos 6,9 KB) que se leen bajo demanda desde disco a través de la caché de páginas del sistema operativo, lo que permite que la tabla resida en un SSD ordinario sin cargarse por completo en memoria.

Es relevante porque representa una arquitectura híbrida poco común: un transformer con bloques de memoria n-gram masivos que amplían la capacidad efectiva del modelo sin aumentar el cómputo por token. El empaquetado NInfer v3 añade verificación criptográfica (SHA-256 de las filas) para garantizar que el modelo y su tabla coinciden exactamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tabla Engram (n-gram, bloques 1 y 14) para DeepSeek-V4.1-Flash-1017; artefacto complementario, no un modelo autónomo |
| Parametros totales | 196,6B (768.022.850 filas de 256 valores) |
| Parametros activos | 48 filas por token (6,9 KB por token, 24 por bloque) |
| Longitud de contexto | No disponible (el ejemplo de ejecución usa 32.768 tokens vía `--max-context`) |
| Tipos de cuantizacion | IQ4_NL (bloques de 144 bytes por fila, de ISTA-DASLab) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | NInfer v3 (`.ninfer`), filas fuente en GGUF (IQ4_NL) |

## Arquitectura y entrenamiento

La tabla Engram almacena los 2-, 3- y 4-gramas que terminan en cada posición, con hash por cabeza de atención, en dos bloques del modelo (bloques 1 y 14). Cada bloque tiene su propia tabla: 384.006.168 filas el primero y 384.016.682 el segundo. Durante la inferencia, cada token direcciona 24 filas por bloque, que el motor lee del archivo mediante lecturas posicionadas en varios hilos y copia a la GPU; con residencia en disco, la tabla completa (103 GiB) nunca se carga íntegramente, y con `--ngram-residency ram` ocupa 103 GiB de RAM (unos 210 GiB en total si los expertos del modelo residen también en memoria host anclada).

No se dispone de información sobre los datos de entrenamiento del modelo base DeepSeek-V4.1-Flash-1017 ni sobre el uso de RLHF o DPO en esta ficha. La tabla fue entrenada conjuntamente con el modelo: ejecutarlo sin ella (modo experimental `--no-ngram-table`) degrada la perplejidad de 3,07 a 9,68 en una muestra de 1.112 tokens de WikiText (medido el 25 de octubre). El repositorio únicamente reempaqueta las filas de ISTA-DASLab en el contenedor de NInfer, sin modificar los pesos.

## Capacidades

Al ser un artefacto complementario y no un modelo, sus capacidades son las del modelo base al que acompaña:

- Habilita la ejecución correcta de DeepSeek-V4.1-Flash-1017 en NInfer: sin la tabla, el motor rechaza arrancar el modelo.
- Restaura la calidad del modelo entrenado (perplejidad 3,07 frente a 9,68 sin tabla).
- Verificación de integridad: el modelo referencia la tabla por su digest SHA-256 (`36ee7d37...b41a5`) y NInfer rechaza tablas que no coinciden.
- Residencia flexible: la tabla puede vivir en cualquier SSD (lecturas bajo demanda de 6,9 KB por token) o en RAM completa.
- Capacidades del modelo base (texto, código, razonamiento, tool calling, idiomas): no disponible en la información proporcionada.

## Casos de uso

- Ejecución local de DeepSeek-V4.1-Flash-1017 con NInfer: es el componente imprescindible para arrancar cualquier conversión NInfer de la familia, como la cuantización IQ1_M.
- Inferencia en estaciones de trabajo con SSD rápido: gracias a la lectura bajo demanda (48 filas, 6,9 KB por token), la tabla puede residir en disco sin consumir 103 GiB de RAM.
- Servidores con RAM abundante: con `--ngram-residency ram` toda la tabla se precarga (103 GiB) para maximizar el throughput al evitar lecturas de disco.
- Distribución eficiente de artefactos: al ser compartida por todas las conversiones NInfer del modelo (por ejemplo, IQ1_M), se descarga una sola vez y se reutiliza.
- Auditoría de integridad en producción: el emparejamiento por SHA-256 entre modelo y tabla evita ejecutar combinaciones incompatibles.
- Reconstrucción y verificación reproducible: el README incluye el comando de conversión completo (3 min 29 s en 24 núcleos de un Threadripper 3960X) para regenerar el artefacto desde el GGUF fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo es la perplejidad en una muestra de 1.112 tokens de WikiText: 3,07 con la tabla frente a 9,68 sin ella (medido el 25 de octubre).

## Requisitos de hardware

- Tamaño del artefacto: 110,6 GB en el repositorio; el archivo `.ninfer` ocupa 103,00 GiB (110.595.294.496 bytes).
- Residencia en disco (por defecto): la tabla cabe en cualquier SSD; el motor lee 6,9 KB por token (48 filas) mediante lecturas posicionadas multihilo a través de la caché de páginas, copiándolas a la GPU antes de cada pasada.
- Residencia en RAM (`--ngram-residency ram`): 103 GiB solo para la tabla; unos 210 GiB de RAM total si además los expertos del modelo residen en memoria host anclada (`--expert-residency host`).
- GPU recomendadas: no disponible (no se especifican modelos de GPU); la tabla se copia a la GPU por pasadas, por lo que se necesita VRAM suficiente para los bloques activos.
- Despliegue: exclusivamente con `ninfer-serve` de NInfer-all (rama `master`, commit `42376e907` o posterior); las builds stock de NInfer no pueden leer este artefacto. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Conversión del artefacto: 3 min 29 s en 24 núcleos de un Threadripper 3960X (referencia de CPU).

## Comparativa con modelos similares

| Artefacto | Contenido | Tamaño | Formato | Licencia |
|---|---|---|---|---|
| WaveCut/DeepSeek-V4.1-Flash-Engram-IQ4_NL-NInfer-v3 | Tabla Engram (bloques 1 y 14), 768M filas | 103,00 GiB | NInfer v3 | MIT |
| WaveCut/DeepSeek-V4.1-Flash-1017-GSQ-RCO-IQ1_M-NInfer-v3 | Pesos del modelo cuantizados a IQ1_M | No disponible | NInfer v3 | MIT |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | Pesos y tabla Engram en GGUF fuente | No disponible | GGUF | MIT |

Este repositorio no es comparable con modelos de lenguaje completos: es un componente obligatorio y compartido por las conversiones NInfer de DeepSeek-V4.1-Flash-1017. No hay artefactos equivalentes de otros autores conocidos en la información disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar además una conversión NInfer de DeepSeek-V4.1-Flash-1017 (por ejemplo, la IQ1_M) para poder ejecutar nada.
- Compatibilidad muy restringida: solo funciona con NInfer-all, rama `master`, a partir del commit `42376e907`; las builds stock de NInfer no pueden leerlo.
- El modelo fue entrenado con la tabla: ejecutarlo sin ella (modo `--no-ngram-table`) es un modo experimental no estándar que degrada severamente la calidad (perplejidad de 3,07 a 9,68) y genera una advertencia al arrancar.
- Verificación estricta: NInfer rechaza cualquier tabla cuyo SHA-256 no coincida con el que referencia el modelo, lo que impide mezclar artefactos de fuentes distintas.
- Requisitos de memoria elevados si se opta por residencia en RAM (103 GiB, o unos 210 GiB con expertos en host).
- Sesgos, riesgo de alucinación, idiomas soportados y restricciones de uso comercial: no disponibles en la información proporcionada; deben consultarse en la ficha del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017.
- Licencia MIT, que permite uso comercial con atribución (los avisos se recogen en el archivo `NOTICE` del repositorio).

## Enlaces

- Repositorio del artefacto: https://huggingface.co/WaveCut/DeepSeek-V4.1-Flash-Engram-IQ4_NL-NInfer-v3
- Conversión NInfer del modelo (IQ1_M): https://huggingface.co/WaveCut/DeepSeek-V4.1-Flash-1017-GSQ-RCO-IQ1_M-NInfer-v3
- GGUF fuente de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo base de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio NInfer: https://github.com/Neroued/ninfer
- Repositorio NInfer-all (rama master): https://github.com/iamwavecut/ninfer-all
- Commit mínimo requerido: https://github.com/iamwavecut/ninfer-all/commit/42376e907b16192999c085d4224a2219ac0438bf
