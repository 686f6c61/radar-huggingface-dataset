# yasakani-dev/Qwen3.8-27B-YASAKANI-speed

## Resumen

Qwen3.8-27B-YASAKANI-speed es una conversión cuantizada y comprimida del modelo Qwen3.8-27B (27 000 millones de parámetros, equipo Qwen de Alibaba Cloud), publicada por yasakani-dev para su motor de inferencia local YASAKANI, orientado a Windows 11 con una única GPU NVIDIA RTX 5090. No es un modelo nuevo ni un ajuste fino: es un artefacto de despliegue en un formato propietario (`.yskn`) que solo puede cargar el motor YASAKANI; transformers, llama.cpp, vLLM o SGLang no pueden leerlo.

El objetivo es reducir los 53,8 GB de pesos BF16 originales a un fichero de 10,31 GB, manteniendo una fidelidad alta respecto al modelo base. Según el autor, el token más probable coincide con el del original el 93,01 % de las veces sobre 20 460 posiciones de transcripciones de razonamiento, con una divergencia KL de 0,0304. Existe una variante hermana, YASAKANI-quality (12,37 GB), que prioriza la fidelidad (95,24 % de coincidencia, KL 0,0122) a costa de velocidad.

La relevancia es acotada pero clara: demuestra una vía práctica para ejecutar un modelo de 27B en hardware de consumo (una sola RTX 5090) con decodificación especulativa integrada mediante un modelo borrador derivado de DFlash 2 (z-lab). La licencia Apache 2.0 facilita el uso comercial, aunque la dependencia total del motor YASAKANI limita la portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.8-27B); no disponible el detalle interno del modelo base en la informacion proporcionada |
| Parametros totales | 27 000 millones (modelo base Qwen3.8-27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Compresion propietaria YASAKANI a 10,31 GB (desde 53,8 GB en BF16); no se especifica el esquema numerico exacto |
| Idiomas soportados | no disponible (la model card no lista idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.yskn` (formato propietario de YASAKANI); incluye `tokenizer.json`, `config.json` y `generation_config.json` originales sin modificar |
| Tamano del repositorio | 12,9 GB (fichero principal `qwen38_27b_speed.yskn`: 10,31 GB) |
| Modelo borrador | `bdraft2_k8.yskn` + `bdraft2_k8.shead`, derivado de DFlash 2 (z-lab) |
| Cache KV | Comprimida, configurada mediante `kvq_u5.bin` |
| Hardware objetivo | Windows 11, una NVIDIA RTX 5090, Python 3.10 o superior |

## Arquitectura y entrenamiento

No se trata de un entrenamiento nuevo. El artefacto es una conversion del Qwen3.8-27B original (Alibaba Cloud) y del modelo borrador DFlash 2 de z-lab (Inco AI) al formato YASAKANI. La model card no documenta datos de entrenamiento, numero de tokens, composicion del corpus ni fases de RLHF/DPO para el modelo base; esa informacion corresponde a la ficha oficial de Qwen y no esta incluida en la informacion proporcionada.

La innovacion tecnica del paquete es doble. Primero, la compresion agresiva de pesos (de 53,8 GB a 10,31 GB) con una metrica de fidelidad explicita: coincidencia del token mas probable del 93,01 % y divergencia KL de 0,0304 frente al BF16, medidas sobre 20 460 posiciones de 20 transcripciones de razonamiento no usadas durante la conversion (8 de noviembre de 2026, cache KV en FP16). Segundo, la decodificacion especulativa integrada mediante el borrador `bdraft2_k8`, que propone tokens que el modelo grande verifica, acelerando la generacion. El autor advierte que estas metricas miden proximidad de prediccion, no precision en tareas, y solo cubren ese tipo de texto.

## Capacidades

- Generacion de texto conversacional y de razonamiento (las mediciones de fidelidad se hicieron sobre transcripciones de tipo "thinking").
- Razonamiento multi-paso heredado del modelo base Qwen3.8-27B; el modo de pensamiento esta implicito en el uso descrito por el autor.
- Decodificacion especulativa nativa a traves del modelo borrador incluido, que acelera la generacion sin cambiar el modelo principal.
- Cache KV comprimida configurable (`kvq_u5.bin`) para reducir el consumo de memoria durante la inferencia.
- Verificacion de integridad del despliegue mediante `yasakani verify` (checksums SHA-256 en `yasakani.json`) y `yasakani selfcheck` (salida de referencia en `selfcheck.json`).
- Capacidades multilingues: no disponible; la model card no detalla idiomas, aunque incluye documentacion en japones e ingles.
- Tool calling, function calling, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en estación de trabajo de un solo usuario: ejecutar un modelo de 27B en una RTX 5090 con Windows 11, sin servidores ni multi-GPU, gracias a los 10,31 GB del fichero comprimido y a la cache KV comprimida.
- Asistente de razonamiento y analisis sobre textos largos: el modelo base esta orientado a transcripciones de razonamiento; encaja en tareas de analisis, sintesis y explicacion paso a paso en local.
- Prototipado rapido de aplicaciones conversacionales: el comando `yasakani chat` levanta una sesion interactiva en pocos pasos tras `hf download`, util para validar ideas antes de invertir en infraestructura.
- Escenarios con requisitos de privacidad: al ejecutarse integramente en local, los datos no salen del equipo, lo que resulta adecuado para borradores de documentacion sensible o analisis de codigo propietario.
- Evaluacion comparativa de tecnicas de compresion: el par speed/quality con metricas de coincidencia de token y KL permite estudiar el compromiso entre tamano y fidelidad en un caso real.
- Demostracion de decodificacion especulativa en hardware de consumo: el borrador DFlash 2 incluido sirve para medir el impacto de la verificacion especulativa en throughput sobre una RTX 5090.
- Integracion en flujos de trabajo de escritorio automatizados: scripts por lotes en Windows que invocan `yasakani` para procesar lotes de texto con verificacion previa de integridad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo proporciona metricas de fidelidad respecto al modelo original, que no son precision en tareas:

| Metrica | YASAKANI-speed (este repo) | YASAKANI-quality |
|---|---|---|
| Coincidencia del token mas probable con el original BF16 | 93,01 % | 95,24 % |
| Divergencia KL respecto al original (menor es mejor) | 0,0304 | 0,0122 |
| Tamano del fichero principal | 10,31 GB | 12,37 GB |

Condiciones de medida: 20 transcripciones de razonamiento propias, 20 460 posiciones, cache KV en FP16, 8 de noviembre de 2026. Las cifras de velocidad y sus condiciones estan en la pagina de GitHub del proyecto y no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada: el fichero de pesos ocupa 10,31 GB; a ello se suma el modelo borrador (`bdraft2_k8`), la cache KV comprimida y el overhead del motor. No se publica una cifra exacta de VRAM total en la informacion disponible.
- GPU objetivo: una unica NVIDIA RTX 5090 (32 GB de VRAM), segun declara el autor.
- GPU de consumo: disenado explicitamente para una RTX 5090; no se confirma compatibilidad con GPUs de menor VRAM.
- Sistema operativo: Windows 11, Python 3.10 o superior.
- Motor de despliegue: exclusivamente YASAKANI (`yskn.dll`). No es compatible con vLLM, llama.cpp, Ollama, TGI, SGLang ni transformers.
- Flujo de despliegue: `hf download` del repositorio completo a una carpeta unica, `yasakani verify` para comprobar checksums, `yasakani selfcheck` para validar la salida de referencia y `yasakani chat` para iniciar.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor remite a la pagina de GitHub para las mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-YASAKANI-speed (este) | 27B | no disponible | `.yskn`, solo YASAKANI | Apache 2.0 | 10,31 GB; 93,01 % de coincidencia de token; con borrador especulativo |
| Qwen3.8-27B-YASAKANI-quality | 27B | no disponible | `.yskn`, solo YASAKANI | Apache 2.0 | 12,37 GB; 95,24 % de coincidencia; misma familia, prioriza fidelidad |
| Qwen3.8-27B (original, BF16) | 27B | no disponible | safetensors / transformers | Apache 2.0 (segun el modelo base) | 53,8 GB; referencia de fidelidad; requiere mucha mas memoria |
| DFlash 2 para Qwen3.8-27B (z-lab) | no disponible | no disponible | no disponible | no disponible | Modelo borrador para decodificacion especulativa; origen del `bdraft2_k8` incluido |

No se dispone de datos de rendimiento en tareas que permitan comparar con alternativas de otros fabricantes; la comparacion se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- No es el modelo original: la compresion a 10,31 GB introduce desviaciones; el token mas probable difiere del original en un 6,99 % de las posiciones medidas.
- Las metricas de fidelidad se calcularon solo sobre 20 transcripciones de razonamiento; no garantizan comportamiento equivalente en codigo, matematicas, idiomas distintos del medido ni respuestas factuales.
- Dependencia total del motor YASAKANI: los ficheros `.yskn` no se pueden cargar en transformers, llama.cpp, vLLM, SGLang ni Ollama, lo que limita la portabilidad y la integracion en infraestructura existente.
- Plataforma restringida: Windows 11 y una RTX 5090; no hay soporte documentado para Linux, macOS ni otras GPUs.
- Riesgo de alucinacion: inherente al modelo base; no se documentan mitigaciones especificas en esta conversion.
- Sesgos: no documentados en la informacion proporcionada; deben evaluarse a partir de la ficha del modelo base Qwen3.8-27B.
- Idiomas: no disponibles; no se confirma el soporte multilingue real de esta conversion.
- Contexto: no disponible; no se puede planificar su uso en tareas de ventana larga sin consultar la ficha del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el repositorio no es una release oficial de Qwen, Alibaba Cloud, z-lab ni Inco AI, y ninguna de esas entidades lo respalda; conviene revisar `NOTICE` para el cumplimiento de atribuciones.
- Popularidad minima (6 descargas, 0 likes en el momento de la consulta): no hay validacion independiente de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yasakani-dev/Qwen3.8-27B-YASAKANI-speed
- Variante de calidad: https://huggingface.co/yasakani-dev/Qwen3.8-27B-YASAKANI-quality
- Motor YASAKANI (GitHub): https://github.com/yasakani-dev/yasakani
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo borrador DFlash 2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
