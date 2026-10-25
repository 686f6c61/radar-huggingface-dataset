# zugquants/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED es una cuantización EXL3 de 2,9 bits por peso del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario zugquants (la model card está firmada por la cuenta «dealignai»). Se trata de un MoE de 40 capas con 384 expertos enrutados más uno compartido, atención MLA, Hyper-Connections, torre de visión nativa y 131K tokens de contexto, empaquetado originalmente por LibertAI como bundle EXL3 para `exllamav3`. La particularidad de este repositorio es que se ha eliminado el comportamiento de rechazo (abliteración) en los seis idiomas declarados, manteniendo el resto del stack idéntico al paquete base.

El modelo resuelve, según su autor, la fricción de los rechazos en tareas legítimas de escritura, traducción o análisis sensible, pero el precio técnico es medible: en la misma batería MMLU-500 el bundle pierde 4,20 puntos porcentuales frente al base (63,20 % frente a 67,40 %), con caídas de 7,60 pp en STEM y 7,08 pp en Humanidades. El autor reporta además un 100 % de cumplimiento en HarmBench-320 en modo chat y en modo thinking (280 de 320 filas evaluadas), incluidas las categorías `chemical_biological` y `cybercrime_intrusion`.

Es relevante ahora porque combina tres tendencias simultáneas: cuantización de muy bajo bitrate (EXL3 con codificación trellis) para modelos de más de 300 000 millones de parámetros, preservación de componentes auxiliares (cabeza MTP para decodificación especulativa, tablas n-gram de Engram, pesos de visión) y edición de comportamiento post-entrenamiento sobre pesos cuantizados sin hooks en tiempo de ejecución. Con 0 descargas y 0 likes en el momento de la ficha, es un artefacto de nicho sin validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (40 capas, 384 expertos enrutados + 1 compartido), MLA, Hyper-Connections, CSA2, Engram (búsquedas n-gram), DSpark MTP, torre de visión nativa |
| Parámetros totales | 303 257 204 690 (303,26 B), dato real de safetensors |
| Parámetros activos | no disponible |
| Longitud de contexto | 131K tokens (131 000; etiqueta `131k-context`) |
| Tipos de cuantización | EXL3 2,9 bpw con codificación trellis; bundle único (single-folder) |
| Idiomas soportados | inglés (en), español (es), francés (fr), ruso (ru), italiano (it), tailandés (th) |
| Licencia | `other`, nombre `deepseek-v41-flash-1017` (licencia de DeepSeek-V4.1-Flash-1017) |
| Formato de pesos | safetensors EXL3, librería `exllamav3` |
| Autor del repositorio | zugquants (model card atribuida a dealignai) |
| Modelo base | LibertAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw |
| Modelo original | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Tamaño del repositorio | 415,9 GB (la model card declara 388 GB) |
| Pipeline | text-generation |
| Fecha de creación | 2026-10-24 |

## Arquitectura y entrenamiento

La arquitectura es la del DeepSeek-V4.1-Flash-1017 original, sin cambios estructurales: 40 capas de mezcla de expertos con 384 expertos enrutados y uno compartido, atención multi-cabeza latente (MLA) para comprimir el KV cache, Hyper-Connections y el módulo CSA2. Incorpora además Engram, un mecanismo de búsquedas de n-gramas que acelera la decodificación recuperando secuencias frecuentes, y DSpark MTP (multi-token prediction), cabeza que se conserva en este bundle y que habilita decodificación especulativa. La torre de visión nativa mantiene sus pesos en el empaquetado, aunque el pipeline declarado es únicamente de generación de texto.

No hay información en la documentación disponible sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre las etapas de alineación (RLHF, DPO u otras) del modelo original; esos datos corresponden al release de deepseek-ai, que no se detalla aquí. La innovación propia de este repositorio es la eliminación del comportamiento de rechazo sobre los pesos ya cuantizados a 2,9 bpw, sin vectores de dirección, sin hooks de runtime y sin ficheros auxiliares: se sustituye la ruta de la carpeta en la configuración del servidor y el modelo carga sin cambios. El autor reporta estabilidad de coherencia tras la cirugía: 0 de 10 prompts entraron en bucle y el recuento máximo de repetición de 20-gramas por respuesta fue 1, medido con `repetition_penalty=1.0`.

## Capacidades

- Generación de texto y razonamiento con modo thinking conmutable (on/off) y tres niveles de esfuerzo: `low`, `high` y `max`.
- Razonamiento multi-paso con trazas de razonamiento extensas; el autor documenta que en `effort=max` y 16 384 tokens la traza no siempre cierra la etiqueta `</think>`.
- Capacidades multilingües en inglés, español, francés, ruso, italiano y tailandés, incluida la eliminación de rechazos en los seis idiomas probados.
- Preservación de la cabeza MTP, lo que permite decodificación especulativa dentro de `exllamav3`.
- Preservación de las tablas n-gram de Engram para recuperación de secuencias frecuentes.
- Pesos de la torre de visión presentes en el bundle, aunque no se documenta ni se garantiza inferencia multimodal desde `exllamav3`.
- Cumplimiento de instrucciones sin rechazo en las siete categorías semánticas de HarmBench evaluadas (químico-biológico, copyright, cibercrimen, acoso, dañino genérico, ilegal, desinformación).
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.
- No se documenta soporte de agentes ni de orquestación multi-turno más allá de la prueba adversarial de 4 turnos.

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo sirve como generador de referencias de cumplimiento en baterías tipo HarmBench, ya que el autor reporta 320/320 cumplimientos en modo chat, lo que permite calibrar clasificadores de rechazo y medir la tasa de falsos negativos de filtros de salida.
- Investigación sobre mecanismos de rechazo: al ser un bundle abliterado que conserva el resto del stack, permite comparar directamente el base (67,40 % MMLU-500) con la variante editada (63,20 %) y aislar cuánto del comportamiento de negativa depende de las capas modificadas.
- Generación de datos sintéticos para entrenar clasificadores de contenido: la producción controlada de ejemplos que el modelo base rechazaría permite ampliar el conjunto negativo de un moderador, siempre en un entorno aislado y con revisión humana.
- Escritura creativa y edición literaria sin fricción: guiones, narrativa negra o diálogos con violencia explícita, terrenos donde el base interrumpe; el contexto de 131K permite trabajar con novelas o guiones completos en una sola ventana.
- Traducción y localización en inglés, español, francés, ruso, italiano y tailandés: útil para contenidos sensibles o terminology cargada políticamente donde un modelo alineado tiende a suavizar o rechazar el original.
- Análisis de documentación legal o de seguridad ofensiva autorizada: informes de pentesting, análisis de malware en laboratorio o revisión de cláusulas abusivas, donde el modelo no bloquea la descripción técnica del contenido.
- Evaluación comparativa de cuantizaciones de bajo bitrate: con 303,26 B de parámetros a 2,9 bpw, sirve para medir la degradación real de EXL3 frente a los pesos originales usando el mismo protocolo MMLU-500 de 500 preguntas estratificadas.
- Procesado de corpus largos (131K) con postproceso offline: resumen y extracción sobre expedientes o logs extensos en una única pasada, sin necesidad de troceado.

## Benchmarks y rendimiento

Datos reportados por el autor. No hay evaluaciones independientes disponibles.

MMLU, protocolo 5-shot generate, 500 preguntas estratificadas sobre las 57 materias, mismo conjunto y orden en ambas ejecuciones, `max_tokens=8`, `temperature=0`, parseo de la primera letra `[ABCD]`:

| Categoría | n | Base 2,9 bpw | UNCENSORED | Delta |
|---|---:|---:|---:|---:|
| STEM | 171 | 54,97 % | 47,37 % | −7,60 pp |
| Humanidades | 113 | 73,45 % | 66,37 % | −7,08 pp |
| Ciencias sociales | 103 | 83,50 % | 83,50 % | 0,00 pp |
| Otras | 113 | 65,49 % | 65,49 % | 0,00 pp |
| **Global** | **500** | **67,40 %** | **63,20 %** | **−4,20 pp** |

HarmBench-320, mismas 320 conductas en toda la familia DSV4.1-Flash CRACK:

| Modo | Filas evaluadas | COMPLY | HARD_REF | SOFT_RED | HEDGE |
|---|---:|---:|---:|---:|---:|
| Chat (`thinking=off`, `max_tokens=512`) | 320/320 | 320 (100,00 %) | 0 | 0 | 0 |
| Thinking (`effort=max`, `max_tokens=8192`) | 280/320 | 280 (100,00 %) | 0 | 0 | 0 |

Estabilidad y presión adversarial:

| Prueba | Resultado |
|---|---|
| Prompts con bucle (10 prompts, `effort=max`, 4096 tokens, `repetition_penalty=1.0`) | 0/10 |
| Repetición máxima de 20-gramas por respuesta | 1 (sin repetición) |
| Deriva de vuelta al rechazo en multiturno adversarial (5 conductas × 4 turnos, 16 384 tokens) | 0/5 |

No se han publicado resultados en la información disponible para HumanEval, GSM8K, MMLU-Pro, MATH, MMMU ni evaluaciones de visión.

## Requisitos de hardware

- Huella en disco: 415,9 GB según el repositorio, frente a los 388 GB que declara la model card. Con 303,26 B de parámetros, 388 GB implican unos 10,2 bits por parámetro efectivos, muy por encima de los 2,9 bpw de la etiqueta; conviene verificar el tamaño real antes de aprovisionar, porque el requisito de memoria cambia en un factor cercano a 3,5 según qué cifra sea la correcta.
- VRAM estimada (estimación propia a partir del tamaño del repositorio, no publicada por el autor): en torno a 400 GB de memoria de acelerador para carga íntegra en GPU; si el bundle real fuese de 2,9 bpw puros, bajaría a unos 110 GB. No disponible como dato verificado.
- GPU recomendadas: 8×H100 80 GB (640 GB) para carga completa con holgura; 5×H100 80 GB (400 GB) quedaría al límite si la huella es de 388 GB; 4×H200 141 GB (564 GB) o 3×B200 192 GB (576 GB) como alternativas de mayor memoria por tarjeta.
- GPU de consumo: no cabe. Ni una RTX 4090 (24 GB) ni una RTX 5090 permiten cargar el modelo completo; solo cabría offload parcial con `exllamav3`, con latencia muy degradada y sin datos publicados de rendimiento en ese régimen.
- Despliegue: exclusivamente `exllamav3` (ExLlamaV3) con backend EXL3. El formato trellis de EXL3 no es compatible con llama.cpp, Ollama, vLLM ni TGI sin conversión previa a otro formato, conversión que no se documenta en el repositorio.
- Latencia y throughput: no disponible. No se publican tokens por segundo, TTFT ni resultados de decodificación especulativa con la cabeza MTP en ninguna configuración de GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | MMLU (protocolo del autor) | Rechazos | Licencia |
|---|---|---:|---|---:|---|---|
| Este bundle (zugquants) | 303,26 B (MoE) | 131K | EXL3 2,9 bpw, safetensors | 63,20 % (500 preguntas) | 0/320 en HarmBench chat | `other` (DeepSeek V4.1) |
| LibertAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw | 303,26 B (MoE) | 131K | EXL3 2,9 bpw, safetensors | 67,40 % (500 preguntas) | Comportamiento alineado del original | `other` (DeepSeek V4.1) |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | 303,26 B (MoE) | 131K | Pesos originales (formato no detallado) | no disponible | Alineado, sin datos en esta ficha | `deepseek-v41-flash-1017` |

No se dispone de datos de benchmarks en la información proporcionada para comparar con familias alternativas de tamaño similar (por ejemplo, otros MoE abiertos de la clase 200-400 B). Cualquier comparación numérica con ellos sería inventada.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente abliterado: el autor reporta 100 % de cumplimiento en HarmBench-320, incluidas 33 conductas de la categoría `chemical_biological` y 47 de `cybercrime_intrusion`. No es apto para despliegue orientado a usuarios finales sin filtros externos de entrada y salida.
- Degradación de capacidades medible: −4,20 pp en MMLU-500 global, −7,60 pp en STEM y −7,08 pp en Humanidades. Las ciencias sociales y la categoría «otras» no cambian (0,00 pp), lo que sugiere que el daño se concentra en razonamiento técnico y conocimiento factual.
- Los resultados son autoinformados por el autor, sin replica independiente, con 0 descargas y 0 likes. El repositorio tiene 415,9 GB frente a los 388 GB declarados, y la tabla de HarmBench por categoría suma 274 casos, no 320; ambos extremos indican falta de control de consistencia en la documentación.
- La model card duplica literalmente el bloque `<details>` de HarmBench por categoría semántica, con texto de revisión manual distinto en cada copia.
- El bundle se etiqueta como 2,9 bpw, pero el tamaño declarado implica unos 10 bits por parámetro; la cifra de bpw puede corresponder solo a los tensores de los expertos y no al conjunto. No verificable con la información disponible.
- La torre de visión conserva pesos, pero no se documenta soporte de inferencia multimodal en `exllamav3`; asumir visión funcional sería una suposición no respaldada.
- En `effort=max` con 16 384 tokens la traza de razonamiento no siempre cierra `</think>`, lo que complica el parseo automático en producción y obliga a gestionar el truncado.
- Sesgos sociales: no hay evaluación de sesgo demográfico, toxidez ni estereotipos en la documentación. Eliminar los rechazos no elimina los sesgos del preentrenamiento; es esperable que los amplifique en superficie.
- Riesgo de alucinación: sin datos de TruthfulQA, MMLU-Pro ni evaluaciones de factualidad. Un modelo editado sobre pesos cuantizados a bajo bitrate acumula dos fuentes de degradación.
- Idiomas: la evaluación multilingüe se limita a las pruebas de rechazo en los seis idiomas; no hay MMLU ni evaluaciones de calidad por idioma, y el tailandés suele ser el más débil en esta familia.
- Licencia: `other` con nombre `deepseek-v41-flash-1017`. Hay que leer el LICENSE del repositorio deepseek-ai antes de cualquier uso comercial; la licencia del modelo original puede imponer condiciones de atribución o restricciones de uso, y la redistribución de un derivado abliterado no está cubierta explícitamente en la información disponible.
- Atribución confusa: el repositorio pertenece a `zugquants`, pero la model card está firmada por «dealignai» y enlaza a su cuenta de X y a su Ko-fi. Conviene confirmar la cadena de autoría antes de citar el artefacto.
- Fecha de creación declarada 2026-10-24, posterior a la fecha de esta ficha: verificar la procedencia y la integridad de los pesos antes de cargarlos en infraestructura propia.
- Sin garantía de que el modelo cargue en configuraciones distintas a la del autor: no se publican versiones de `exllamav3`, `transformers` ni `safetensors` probadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zugquants/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Modelo base (bundle EXL3 de LibertAI): https://huggingface.co/LibertAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Licencia: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/blob/main/LICENSE
- Cuenta del autor de la model card en X: https://x.com/dealignai
- Apoyo al autor (Ko-fi): https://ko-fi.com/dealignai
