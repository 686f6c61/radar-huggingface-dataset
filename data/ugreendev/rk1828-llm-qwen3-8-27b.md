# UGREENDEV/RK1828-LLM-Qwen3.8-27B

## Resumen

RK1828-LLM-Qwen3.8-27B es una distribucion del modelo Qwen3.8-27B de Qwen (Alibaba) empaquetada por UGREENDEV para su ejecucion sobre el acelerador NPU Rockchip RK1828. No se trata de un modelo nuevo: es una cuantizacion y compilacion del modelo base orientada al runtime RKNN v1.1.0, con pesos en formato GGUF/RKNN y una division en cuatro segmentos (llm_seg0 a llm_seg3) que se reparten entre cuatro tarjetas o instancias del chip, cada una con 8 nucleos NPU.

El modelo resuelve el problema de desplegar un LLM de 27B en hardware de borde basado en Rockchip, un escenario donde las GPU convencionales no estan disponibles y el software de inferencia habitual (vLLM, TGI) no aplica. Para ello se aplica cuantizacion de pesos w4a16 (4 bits en pesos, 16 bits en activaciones) y una KVCache en int4, lo que permite sostener una ventana de contexto de 51.200 tokens por segmento. El repositorio ocupa 18 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo fuente.

La relevancia de esta ficha es acotada: se publico el 19 de noviembre de 2026, no tiene descargas ni valoraciones, y su utilidad practica esta ligada exclusivamente al ecosistema RKNN. Para cualquier otro hardware (GPU NVIDIA, AMD, CPU), lo recomendable es acudir directamente al modelo original Qwen/Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Qwen/Qwen3.8-27B; la model card no la describe) |
| Parametros totales | 27B (segun el nombre del modelo y el modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 51.200 tokens por segmento (4 segmentos) |
| Tipos de cuantizacion | w4a16 en pesos (los 4 segmentos); KVCache int4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF / RKNN (runtime RKNN v1.1.0); repo de 18 GB |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura interna del modelo base Qwen3.8-27B (tipo de transformer, atencion, capas, etc.), ni sobre el dataset de entrenamiento, el numero de tokens o las fases de alineamiento (RLHF, DPO). Lo unico documentado es el proceso de empaquetado para RKNN: el modelo se divide en cuatro segmentos (llm_seg0 a llm_seg3), cada uno con 8 nucleos NPU, cuantizacion w4a16 y KVCache int4, con una ventana de contexto de 51.200 tokens por segmento. La configuracion se identifica como `normal-kv-int4-4cards`.

La innovacion tecnica destacable no esta en el modelo sino en el despliegue: la segmentacion en cuatro tarjetas RK1828 permite repartir un modelo de 27B entre varios chips de borde, algo que ningun chip individual de esta clase podria alojar. El repositorio incluye checksums SHA-256 (`SHA256SUMS`) para verificar la integridad de los ficheros antes del despliegue, y requiere el runtime RKNN v1.1.0 y el driver correspondiente, comprobable en el dispositivo con `rknn-smi -v`.

## Capacidades

- Generacion de texto y comprension de lenguaje, segun la model card ("text understanding and generation").
- Modelo exclusivamente de texto: no se mencionan capacidades de vision, audio ni multimodalidad.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (el campo de idiomas figura como no disponible).
- Modo thinking o razonamiento explicito: no documentado.
- Contexto largo: 51.200 tokens por segmento, lo que en la practica habilita conversaciones y documentos extensos dentro del ecosistema RKNN.

## Casos de uso

- Inferencia de borde en dispositivos Rockchip: despliegue de un LLM de 27B en hardware RK1828 all-in-one, sin GPU dedicada, usando el runtime RKNN v1.1.0 y la configuracion `normal-kv-int4-4cards`. Adecuado cuando el requisito es privacidad de datos en el dispositivo.
- Procesamiento de documentos largos en el dispositivo: la ventana de 51.200 tokens por segmento permite resumir o extraer informacion de contratos, informes o manuales sin enviar el texto a la nube.
- Asistentes conversacionales locales multi-turno: el contexto largo y la KVCache int4 reducen el coste de memoria en conversaciones prolongadas, lo que encaja en asistentes embebidos en equipos industriales o de escritorio.
- Generacion de texto en entornos aislados o air-gapped: al ejecutarse sobre NPU local y distribuirse con checksums verificables, es apto para instalaciones sin conectividad externa.
- Prototipado de pipelines de generacion de texto sobre NPU: util para equipos que evaluan el rendimiento de RK1828 con modelos de 27B antes de comprometerse con un despliegue mayor.
- Verificacion de integridad en produccion: el flujo documentado (`sha256sum -c SHA256SUMS`) permite validar los ficheros antes de arrancar el servicio, algo relevante en despliegues remotos o actualizaciones OTA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Chip soportado: exclusivamente RK1828 (Rockchip). No se contemplan otras NPU ni GPU.
- Configuracion: 4 segmentos (llm_seg0 a llm_seg3), cada uno con 8 nucleos NPU, es decir, 4 tarjetas o instancias RK1828 en total.
- Memoria: el repositorio ocupa 18 GB; los pesos estan cuantizados a w4a16 y la KVCache a int4, lo que reduce el footprint frente a los pesos en precision completa.
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente; comprobar la version en el dispositivo con `rknn-smi -v` antes de ejecutar.
- GPU de consumo (RTX 4090, etc.): no aplica; el modelo esta compilado para RKNN y no se distribuye en formatos para CUDA.
- Opciones de despliegue: RKNN Runtime v1.1.0 sobre RK1828; descarga via Hugging Face (`hf download`) o ModelScope (`modelscope download`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK1828-LLM-Qwen3.8-27B (este) | 27B | 51.200 tokens por segmento | GGUF/RKNN, NPU RK1828 | Apache 2.0 | Hugging Face y ModelScope |
| Qwen/Qwen3.8-27B (modelo base) | 27B | no disponible en la informacion | pesos originales, GPU/CPU | Apache 2.0 | Hugging Face |
| Alternativas de 27B para GPU | no disponible | no disponible | safetensors/GGUF | no disponible | no disponible |

La comparacion relevante es con el modelo base: este repositorio no mejora al original en capacidad, solo lo adapta al hardware RK1828 con cuantizacion w4a16 e int4 en KVCache. Para cualquier despliegue fuera de Rockchip, el modelo base es la opcion correcta.

## Limitaciones y advertencias

- Dependencia total del hardware: solo funciona en chips RK1828 con RKNN Runtime v1.1.0 y el driver correspondiente; no es portable a GPU ni CPU convencionales.
- La cuantizacion w4a16 y la KVCache int4 pueden degradar la calidad respecto al modelo base en tareas sensibles a precision (matematicas, codigo, razonamiento largo); no se han publicado evaluaciones que cuantifiquen esa perdida.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingue sin verificar con el modelo base.
- Riesgo de alucinacion: inherente a los LLM; no hay informacion sobre mitigaciones especificas en esta distribucion.
- Sesgos: no documentados en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar el fichero `LICENSE` incluido, que corresponde al modelo fuente.
- Repositorio sin descargas ni valoraciones y publicado recientemente: no hay evidencia de comunidad ni de validacion independiente del empaquetado.
- Antes de desplegar, es obligatorio verificar los checksums SHA-256; el autor indica explicitamente desplegar solo cuando todas las entradas muestren `OK`.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK1828-LLM-Qwen3.8-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- ModelScope (descarga alternativa): https://modelscope.cn/models/UGREENDEV/RK1828-LLM-Qwen3.8-27B
