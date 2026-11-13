# WaveCut/Edge0-120B-q3k-NInfer-v3

## Resumen

Edge0-120B-q3k-NInfer-v3 es un artefacto de inferencia publicado por WaveCut para el modelo Edge0-120B-q3k de Edge0, empaquetado en el formato propietario `.ninfer` que consume el motor NInfer (rama `master` de `iamwavecut/ninfer-all`). No se trata de un modelo nuevo: es una conversión cuantizada del release original, que conserva los bloques byte a byte y delega la multiplicación al motor. El modelo base mantiene el esqueleto de Qwen3.8-Flash-Next (Gated DeltaNet, atención dispersa, hyper-connections, embedding n-gram, router, experto compartido y bloque MTP) y sustituye los 512 expertos enrutados de cada capa de texto por expertos latentes agrupados en 8 grupos de anchura latente 1280.

El interés técnico está en dos frentes. Por un lado, la arquitectura latent-MoE reduce el coste de cómputo por experto al proyectar desde y hacia la dimensión del modelo (2560) mediante codificadores y decodificadores de grupo. Por otro, el artefacto demuestra un despliegue de 120B en una única GPU de 48 GB (A40) gracias a la cuantización mixta Q3_K/IQ4_NL de los expertos y a estrategias de residencia de expertos en host o disco, con decodificación especulativa vía MTP que eleva el throughput hasta 100,7 tok/s en el mejor caso medido.

Es relevante ahora porque documenta una vía práctica para servir modelos MoE de gran tamaño en hardware de gama profesional, con métricas reproducibles de perplejidad y velocidad, aunque con la advertencia de que el formato y el motor son específicos y no compatibles con el ecosistema estándar (llama.cpp, vLLM, TGI).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet, atención dispersa, hyper-connections y latent-MoE (8 grupos, anchura latente 1280, dimensión de modelo 2560); incluye bloque MTP |
| Parametros totales | 120B (según el nombre del modelo base; no se detalla el desglose en la información disponible) |
| Parametros activos | no disponible (MoE con 512 expertos enrutados por capa en 8 grupos; no se especifica el número activo por token) |
| Longitud de contexto | 32.768 tokens en los ejemplos de servicio (`--max-context 32768`); el máximo nativo del modelo base no se detalla |
| Tipos de cuantizacion | Expertos enrutados: Q3_K (gate y up) e IQ4_NL (down) con escalas por columna por capa; codificadores/decodificadores de grupo: Q4_0; bloque MTP: Q2_0 en expertos y Q8_0 en matrices; tabla n-gram en FP8 (artefacto separado) |
| Idiomas soportados | no disponible (hereda el tokenizador de Qwen3.8-Flash-Next, pero no se enumeran idiomas) |
| Licencia | edge0-community-model-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `.ninfer` (formato propietario del motor NInfer v3); no es GGUF estándar pese a la etiqueta `gguf` y al uso interno de bloques `gguf_*` |

## Arquitectura y entrenamiento

El modelo base Edge0-120B-q3k parte del esqueleto de Qwen3.8-Flash-Next: capas con Gated DeltaNet (atención lineal con estado recurrente), atención dispersa, hyper-connections, un embedding n-gram, un router de mezcla de expertos, un experto compartido y un bloque MTP (multi-token prediction) para decodificación especulativa. La modificación propia de Edge0 es el latent-MoE: los 512 expertos enrutados de cada una de las 48 capas se agrupan en 8 grupos, y cada experto computa en la anchura latente de su grupo (1280), con un codificador y un decodificador de grupo que proyectan desde y hacia la dimensión del modelo (2560). Esto reduce el coste por experto a cambio de una proyección adicional.

Este artefacto concreto no entrena nada: es una conversión del release `Edge0-120B-q3k` (revisión `51a60a20`) usando la configuración y el tokenizador de `Qwen/Qwen3.8-Flash-Next` (revisión `812d96e1`). La cuantización aplica Q3_K a las matrices gate/up de los expertos e IQ4_NL a las down, con escalas por columna por capa almacenadas como recíprocos FP32 (formato `edge0-strata`); los codificadores y decodificadores de grupo van en Q4_0 y el bloque MTP en Q2_0/Q8_0. El resultado es un único fichero de 36.253.779.456 bytes (33,76 GiB) más una tabla n-gram externa referenciada por el SHA-256 de sus filas. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva con pipeline `text-generation`.
- Razonamiento multi-paso y decodificación especulativa mediante el bloque MTP incluido (tres borradores por ronda con `--draft-min-p 0.5`).
- Capacidad multilingüe heredada del tokenizador de Qwen3.8-Flash-Next, aunque no se enumeran idiomas concretos.
- Uso de tabla n-gram externa (FP8) para el componente de embedding n-gram del esqueleto.
- Soporte de contexto largo de hasta 32.768 tokens en la configuración de servicio documentada.
- No se documentan en la información disponible capacidades de tool calling, function calling, visión, audio ni modo thinking explícito.

## Casos de uso

- Servicio de inferencia en una sola GPU profesional: el artefacto está pensado para ejecutarse en una A40 de 48 GB con todos los expertos en dispositivo (`--expert-residency device` implícito), lo que permite desplegar un MoE de 120B en un nodo único sin tensor parallelism.
- Despliegue con memoria de host limitada: con `--expert-residency host` los 28,6 GB de expertos residen en memoria fijada y se cachean en GPU los más usados, útil en servidores con GPU de 24-48 GB y RAM abundante.
- Escenarios con poca RAM: `--expert-residency disk` mantiene los expertos en el fichero y los transmite a una caché de GPU, adecuado para entornos con restricciones de memoria a costa de bajar a 23,3 tok/s sin borradores.
- Generación de código asistida: en las pruebas con prompt de código se alcanzaron 100,7 tok/s con MTP y todos los expertos en GPU, lo que lo hace viable para autocompletado y generación en IDE o pipelines de CI/CD.
- Procesamiento de documentos largos: con un prompt de 5.415 tokens decodificó a 53,7 tok/s sin borradores y 79,8 con MTP, apto para resumen y extracción sobre contexto medio-largo.
- Servicio concurrente: `ninfer-serve` sostuvo entre 131,9 y 148,1 tok/s agregados con ocho peticiones simultáneas sin borradores, útil para APIs de chat multi-usuario.
- Evaluación comparativa de motores: sirve para medir NInfer frente al motor propio de Edge0 (`edge0-strata`), con respuestas idénticas token a token en seis de ocho casos y decodificación 1,41-1,74 veces más rápida.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad (WikiText, primeros 40 KB, 9.234 objetivos, KV INT8) | 4,964565 con expertos en device, host y disco; 4,998407 con dos rangos de tensor parallelism en una tarjeta |
| Throughput, expertos en host, sin borradores | 49,2 tok/s (caché de expertos en GPU de 26,7 GiB) |
| Throughput, expertos en host, con MTP | 73,9 tok/s (52,7% de borradores aceptados) |
| Throughput, expertos en disco, sin borradores | 23,3 tok/s (caché de 35,7 GiB) |
| Throughput, expertos en disco, con MTP | 38,1 tok/s (52,7% de borradores aceptados) |
| Throughput, todos los expertos en GPU, prompt de código | 54,6 tok/s sin borradores; 100,7 tok/s con MTP |
| Throughput, todos los expertos en GPU, prompt de prosa | 54,1 tok/s sin borradores; 69,1 tok/s con MTP |
| Throughput, todos los expertos en GPU, documento de 5.415 tokens | 53,7 tok/s sin borradores; 79,8 tok/s con MTP |
| Throughput agregado, 8 peticiones concurrentes | 131,9-148,1 tok/s sin borradores; 111,3-129,5 tok/s con MTP |
| Comparación con edge0-strata (`--spec 4`) | 6 de 8 respuestas greedy idénticas token a token; 1,41-1,74 veces más rápido por petición |

Mediciones del 12-13 de noviembre de 2026 con NInfer-all `master` (CUDA 12.8, `sm_86`) en una A40 (48 GB, 300 W), contenedor con cuota de 7,65 CPU y 50 GB de RAM, una ejecución por fila. Decodificación greedy de hasta 256 tokens tras un prompt de 33 tokens, salvo donde se indica. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM con todos los expertos en GPU: aproximadamente 36 GB, lo que encaja en una A40 (48 GB), A6000 (48 GB) o H100 (80 GB); no cabe en RTX 4090 (24 GB) con expertos en dispositivo.
- VRAM con expertos en host: 28,6 GB de RAM fijada más una caché de GPU de 26,7 GiB en la medición; requiere al menos 48 GB de RAM de sistema según el entorno de prueba (50 GB).
- VRAM con expertos en disco: caché de GPU de 35,7 GiB en la medición, con lectura del fichero a través de la caché de páginas; el rendimiento depende de cuánto del fichero retenga esa caché.
- GPU recomendadas: A40 48 GB (medida), A6000 48 GB, H100 80 GB; en consumer, solo configuraciones con expertos en host o disco y suficiente RAM, aunque no se documentan pruebas en RTX 4090.
- Despliegue: exclusivamente mediante `ninfer-serve` del proyecto `iamwavecut/ninfer-all` desde el commit `72d1d8e04`; las builds estándar de NInfer rechazan el fichero. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; el modo con MTP solo se activa por defecto con una petición a la vez, y con expertos en disco la decodificación va sin borradores salvo que se pase `--spec mtp`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Edge0-120B-q3k-NInfer-v3 (este) | 120B, latent-MoE de 512 expertos en 8 grupos | 32.768 tokens en servicio | PPL 4,96 en WikiText; 54,6-100,7 tok/s en A40 con expertos en GPU | edge0-community-model-license-1.0 | Artefacto `.ninfer` en Hugging Face; motor NInfer-all |
| Edge0-120B-q3k (base) | 120B, misma arquitectura | no disponible | Referencia del motor `edge0-strata` con `--spec 4`; 1,41-1,74 veces más lento por petición según las mediciones de WaveCut | edge0-community-model-license-1.0 | Hugging Face (Edge0) |
| Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | licencia Qwen (incluida como third-party) | Hugging Face (Qwen) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a linaje, licencia y disponibilidad.

## Limitaciones y advertencias

- Formato y motor propietarios: el fichero `.ninfer` solo lo carga NInfer-all desde el commit `72d1d8e04`; las builds estándar de NInfer lo rechazan y no hay compatibilidad con llama.cpp, vLLM, Ollama ni TGI.
- Dependencia de un artefacto externo: la tabla n-gram (FP8) se publica por separado en `WaveCut/Edge0-ngram-table-FP8-NInfer-v3` y el modelo la referencia por el SHA-256 de sus filas; sin ella el servicio no funciona según las instrucciones del autor.
- Rendimiento fuertemente dependiente de la residencia de expertos: de 23,3 tok/s con expertos en disco a más de 100 tok/s con todos en GPU y MTP; el modo disco depende de la caché de páginas del sistema operativo.
- MTP desactivado por defecto en concurrencia: con ocho peticiones simultáneas el throughput agregado baja de 131,9-148,1 a 111,3-129,5 tok/s, y el motor solo usa borradores por defecto con una petición a la vez.
- Licencia comunitaria `edge0-community-model-license-1.0`: hay que revisar el fichero `LICENSE` y `release-scope.json` antes de uso comercial; la información disponible no detalla sus restricciones.
- Idiomas soportados no documentados: aunque hereda el tokenizador de Qwen3.8-Flash-Next, no se enumeran coberturas lingüísticas ni evaluaciones por idioma.
- Sin datos de sesgos, alucinación ni evaluaciones de seguridad en la información disponible; al ser un artefacto de cuantización Q3_K/IQ4_NL, cabe esperar cierta degradación respecto al release sin cuantizar, aunque la perplejidad medida (4,96) es la reportada por el autor.
- Cero descargas y cero likes en el momento de la consulta, y fecha de creación posterior a las mediciones publicadas; el ecosistema de usuarios y validación independiente es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WaveCut/Edge0-120B-q3k-NInfer-v3
- Modelo base: https://huggingface.co/Edge0/Edge0-120B-q3k
- Tabla n-gram FP8: https://huggingface.co/WaveCut/Edge0-ngram-table-FP8-NInfer-v3
- Motor NInfer: https://github.com/Neroued/ninfer
- Fork NInfer-all: https://github.com/iamwavecut/ninfer-all
- Commit mínimo del motor: https://github.com/iamwavecut/ninfer-all/commit/72d1d8e0439974779201f8537a2915de0b52f155
- Guía Edge0 del motor: https://github.com/iamwavecut/ninfer-all/blob/master/docs/edge0.md
- Tokenizador y configuración de referencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
