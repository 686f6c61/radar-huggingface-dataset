# WarlaxZ/Qwen3.8-27B-NInfer-3090

## Resumen

Qwen3.8-27B-NInfer-3090 es un artefacto de pesos cuantizados del modelo multimodal Qwen3.8-27B de Qwen, convertido al formato propietario `.ninfer` por el fork NInfer-3090 (repositorio `ashalliants/ninfer-3090`) y publicado en Hugging Face por el usuario WarlaxZ. No se trata de un checkpoint de Transformers, ni de un GGUF, ni de un Safetensors estándar: es un contenedor de 17,68 GiB pensado para ejecutarse exclusivamente con los binarios de ese fork, que incluye rutas de cuantización de 4 y 5 bits para las proyecciones MLP y de atención, además de componentes de visión, MTP (multi-token prediction), DFlash2 y una cabeza de propuesta de 131.072 filas.

El modelo base es Qwen3.8-27B, un transformer multimodal de 27.000 millones de parámetros con capacidades image-text-to-text, según declara el pipeline tag del repositorio. La ficha pública no detalla la longitud de contexto nativa ni la composición del dataset de entrenamiento del modelo original; lo que sí documenta con precisión es el proceso de cuantización: el encoder `grouped_search` busca la escala FP16 de cada grupo de 64 pesos sobre 50 candidatos minimizando el error cuadrático ponderado por una imatrix (media cuadrática de activaciones de entrada por canal), y permite escalas negativas para aprovechar todo el rango de códigos (−8 para Q4, −16 para Q5).

Su relevancia práctica es doble. Por un lado, demuestra que un modelo de 27B multimodal puede ejecutarse en una única RTX 3090 de 24 GB con pérdida de calidad medida y documentada (perplejidad 4,3014 frente a 4,3428 del artefacto upstream en el corpus `perplexity-1m`, una mejora del 0,95 %). Por otro, es un ejemplo poco habitual de ficha técnica centrada en la reproducibilidad: publica el hash SHA-256 del artefacto, el informe de conversión y la propia imatrix utilizada, de modo que el contenedor puede reconstruirse y auditarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` (transformer multimodal con visión, MTP y DFlash2) |
| Parámetros totales | 27.000 millones (modelo base Qwen3.8-27B) |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la cabeza de propuesta tiene 131.072 filas) |
| Tipos de cuantización | Mixta: 4 bits (Q4) y 5 bits (Q5) según tensor; embedding de tokens a 4 bits, cabeza de salida a 6 bits; KV cache en int8 en las mediciones |
| Idiomas soportados | no disponible (el corpus de evaluación incluye wikipedia en/zh, arXiv, GitHub, código propio y chat) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (contenedor versión 3), no compatible con Safetensors ni GGUF |
| Tamaño del artefacto | 18.979.828.480 bytes (17,68 GiB) |
| SHA-256 | `38304957e3e8b43122ef109e05bad1e18600f8f300e3347fda3092fc51acc381` |
| Objetos almacenados | 1.190 (1.184 tensores y 6 recursos) |
| Componentes incluidos | texto, visión, MTP, DFlash2, cabeza de propuesta |

## Arquitectura y entrenamiento

La arquitectura declarada en el contenedor es `Qwen3_5ForCausalLM`, correspondiente al modelo base Qwen3.8-27B. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO; esos datos pertenecen a la ficha del modelo original de Qwen, que no se incluye en la documentación proporcionada. Lo que sí se describe es la estructura del artefacto cuantizado: las proyecciones de salida de atención y GDN, junto con las proyecciones down del MLP, usan 4 bits en las capas tempranas y 5 bits desde la capa 23 (salida de atención), 24 (salida GDN) y 30 (MLP down); el resto mantiene el esquema del artefacto upstream (Q4 para query/key/gate/up, Q5 para value/z/gate/down/output). Visión, MTP, DFlash2 y la cabeza de propuesta conservan la codificación original.

La innovación técnica destacable es el encoder `grouped_search` y su efecto medible sobre la calidad. La revisión del 16 de noviembre de 2026 invirtió la asignación de bits de la primera revisión: en lugar de dar Q5 a las capas 0–35 y Q4 a las 36–63, coloca los bytes de 5 bits donde el error de redondeo ponderado por la imatrix es mayor, manteniendo el mismo recuento de bytes. El resultado es una reducción de aproximadamente el 9 % en divergencia KL (de 0,0304 a un valor inferior en la tabla de KLD, con la primera revisión como referencia) y una perplejidad de 4,3014 en `perplexity-1m` frente a 4,3025 de la primera revisión y 4,3428 del upstream. En el corpus retenido `perplexity-heldout-2026-09` la perplejidad es 4,3224, un 0,40 % mejor que upstream pero un 0,13 % peor que la primera revisión, concentrado en wikipedia en chino (de 9,14 a 9,27) mientras mejoran arXiv, los dos flujos de código y el chat. El artefacto también incorpora decodificación especulativa mediante DFlash2 y MTP, y el fork publica comparativas de velocidad frente a llama.cpp de hasta 2,1× en decode.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `image-text-to-text` e `inference: false` en la model card (no se ejecuta con la librería estándar de Hugging Face).
- Procesamiento de imágenes y texto combinados: el contenedor incluye un componente de visión separado, por lo que hereda las capacidades multimodales del modelo base Qwen3.8-27B.
- Predicción multi-token (MTP) y decodificación especulativa con DFlash2 y una cabeza de propuesta de 131.072 filas, orientadas a acelerar la generación en hardware de consumo.
- Ejecución en una única GPU de 24 GB (RTX 3090) y también en Tesla V100 de 32 GB según las gráficas de rendimiento del repositorio.
- Soporte de KV cache en int8 durante las mediciones de perplejidad (`--kv-dtype int8`).
- Capacidades de tool calling, agentes, matemáticas o modo thinking: no disponibles en la información proporcionada; no se documentan en la model card.

## Casos de uso

- Despliegue local de un modelo multimodal de 27B en una estación de trabajo con RTX 3090: el artefacto ocupa 17,68 GiB y cabe en los 24 GB de la tarjeta, lo que permite ejecutar texto e imagen sin infraestructura de servidor dedicada.
- Evaluación de técnicas de cuantización: investigadores pueden reproducir el artefacto a partir de `qwen3_8_27b.ninfer.conversion.json` y `qwen3_8_27b.imatrix.safetensors`, y comparar el encoder `grouped_search` con el redondeo absmax/qmax del upstream en sus propios corpus.
- Auditoría de calidad de pesos cuantizados: la publicación de hashes SHA-256 y de métricas de perplejidad y KLD frente a un Q8_0 de Unsloth permite verificar que un artefacto de 4/5 bits no degrada la distribución de salida más allá de un umbral definido.
- Prototipado de asistentes conversacionales con imagen en entornos Windows + CUDA 12.8: el fork está probado en esa combinación, lo que reduce la fricción para equipos que trabajan fuera de Linux.
- Investigación sobre decodificación especulativa: las comparativas frente a llama.cpp (hasta 2,1× en decode) sirven como referencia para estudiar el impacto de MTP y DFlash2 en latencia por token.
- Reutilización en hardware legacy: la gráfica para Tesla V100 de 32 GB con DFlash2 y MTP3 frente a Lapilli indica que el artefacto es viable en GPUs de centros de datos de generaciones anteriores, útil para laboratorios con parque instalado antiguo.
- Generación de código y análisis de repositorios: el corpus de evaluación incluye flujos de GitHub y código propio, lo que sugiere un uso razonable en tareas de asistencia a programación, aunque sin benchmarks específicos publicados.

## Benchmarks y rendimiento

La model card no publica resultados de MMLU, HumanEval, GSM8K ni benchmarks estándar de capacidad. Los datos disponibles son métricas de calidad de cuantización y de velocidad:

| Métrica | Upstream | Primera revisión | Esta revisión | Cambio vs upstream |
|---|---:|---:|---:|---:|
| Perplejidad `perplexity-1m` | 4,3428 | 4,3025 | 4,3014 | −0,95 % |
| Perplejidad `perplexity-heldout-2026-09` | 4,3396 | 4,3169 | 4,3224 | −0,40 % |
| KLD media vs Q8_0 (upstream) | 0,0376 | no disponible | no disponible | — |
| KLD media vs Q8_0 (primera revisión, embedding 6 bits) | — | 0,0304 | no disponible | — |

| Comparativa de velocidad | Resultado |
|---|---|
| NInfer-3090 vs llama.cpp en RTX 3090 | hasta 2,1× en decode |
| NInfer-3090 v0.15.1 vs versión previa | mejoras en prefill y decode de turnos de agente (sin cifras en el texto) |
| V100 32 GB con DFlash2 y MTP3 vs Lapilli | gráfica publicada, sin cifras en el texto |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 17,68 GiB de pesos más overhead de KV cache y activaciones; cabe en 24 GB con KV cache en int8, según las mediciones del autor.
- GPU recomendadas: RTX 3090 (24 GB) es el objetivo principal y la plataforma de referencia (CUDA 12.8, Windows); Tesla V100 de 32 GB aparece en las gráficas de rendimiento con DFlash2 y MTP3.
- GPU de consumo: sí, en RTX 3090; no se documenta compatibilidad con tarjetas de 16 GB o menos.
- Opciones de despliegue: exclusivamente los binarios del fork `ashalliants/ninfer-3090` (comando `download-model qwen38-27b`); no es compatible con vLLM, llama.cpp, Ollama ni TGI, y las versiones antiguas del fork y el NInfer upstream lo rechazan al arrancar por falta de la ruta MLP down de 4 bits.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo; solo comparativas relativas (hasta 2,1× frente a llama.cpp en decode).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-NInfer-3090 (este) | 27B | no disponible | `.ninfer` (17,68 GiB) | Apache 2.0 | Hugging Face, requiere fork NInfer-3090 |
| neroued/Qwen3.8-27B-NInfer (upstream) | 27B | no disponible | `.ninfer` (20,44 GB) | Apache 2.0 | Hugging Face, NInfer upstream |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | Safetensors (precisión completa) | Apache 2.0 | Hugging Face |
| Q8_0 GGUF de Unsloth (referencia de calidad) | 27B | no disponible | GGUF | Apache 2.0 | Usado como referencia de KLD, no como alternativa de despliegue |

La comparativa se limita al ecosistema del propio modelo base porque la información proporcionada no incluye alternativas de otros fabricantes con parámetros o contexto verificables.

## Limitaciones y advertencias

- El artefacto no es un checkpoint estándar: requiere los binarios del fork `ashalliants/ninfer-3090` y falla al arrancar con NInfer upstream o con versiones antiguas del fork.
- La cuantización mixta de 4 y 5 bits introduce degradación medible: la perplejidad en el corpus retenido es un 0,40 % mejor que upstream pero un 0,13 % peor que la primera revisión, con un retroceso concentrado en wikipedia en chino (9,14 a 9,27).
- La model card declara `inference: false`; no se puede cargar con Transformers, vLLM, llama.cpp, Ollama ni TGI.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones idiomáticas del modelo base en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero la obligación de usar un fork concreto y la ausencia de soporte upstream añaden riesgo operativo en producción.
- El repositorio tiene 49.587 descargas y 6 likes en el momento de la consulta, con mantenimiento activo (última actualización 2026-11-27); la estabilidad a largo plazo del fork no está garantizada.
- La revisión del 16 de noviembre de 2026 cambió la asignación de bits; los scripts `download-model` de versiones anteriores siguen descargando la primera revisión por pin, lo que puede provocar inconsistencias entre entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WarlaxZ/Qwen3.8-27B-NInfer-3090
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Artefacto upstream: https://huggingface.co/neroued/Qwen3.8-27B-NInfer
- Repositorio del fork: https://github.com/ashalliants/ninfer-3090
- Pull request de la revisión de noviembre de 2026: https://github.com/ashalliants/ninfer-3090/pull/445
