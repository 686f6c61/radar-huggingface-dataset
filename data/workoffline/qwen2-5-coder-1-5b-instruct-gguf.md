# WorkOffline/Qwen2.5-Coder-1.5B-Instruct-GGUF

## Resumen

WorkOffline/Qwen2.5-Coder-1.5B-Instruct-GGUF es un espejo (mirror) sin modificaciones de los ficheros GGUF oficiales de Qwen2.5-Coder-1.5B-Instruct, publicado por el usuario WorkOffline para que la aplicacion WorkOffline pueda descargar los pesos desde un unico punto, fijados a una revision concreta y verificados mediante SHA-256. No se trata de un modelo nuevo ni de una cuantizacion propia: los bytes son identicos a los del repositorio oficial de Qwen, y todo el merito del modelo corresponde a Alibaba Qwen.

El modelo subyacente, Qwen2.5-Coder-1.5B-Instruct, es un transformer decoder-only de 1.777.088.000 parametros (aproximadamente 1,8 mil millones) especializado en generacion de codigo y ajustado con instrucciones. Forma parte de la familia Qwen2.5-Coder, orientada a tareas de programacion, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia practica radica en que, al estar en formato GGUF y en una cuantizacion Q4_K_M de aproximadamente 1,1 GB, puede ejecutarse en CPU y en GPUs de consumo con poca VRAM, lo que lo hace util para asistentes de codigo locales, autocompletado en el editor y pipelines sin conexion. Este repositorio concreto anade valor solo por la trazabilidad: revision fijada, hash SHA-256 publicado y disponibilidad estable para una aplicacion cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 1.777.088.000 (aprox. 1,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado en este repo) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 1,1 GB |
| Fichero incluido | `Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf` (1.117.320.768 bytes) |
| SHA-256 del fichero | `cc324af070c2ecbfd324a30884d2f951a7ff756aba85cb811a6ec436933bb046` |
| Revision upstream | `f86cb2c1fa58255f8052cc32aeede1b7482d4361` |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna ni el proceso de entrenamiento del modelo base. Lo unico verificable es que se trata de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5 con 1.777.088.000 parametros, ajustado con instrucciones (sufijo `-Instruct`) y especializado en codigo (sufijo `-Coder`). No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas especificas en la informacion facilitada.

Respecto a este repositorio en particular, no hay entrenamiento ni conversion: es una copia byte a byte del fichero GGUF `qwen2.5-coder-1.5b-instruct-q4_k_m.gguf` del repositorio oficial `Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF`, en la revision `f86cb2c1fa58255f8052cc32aeede1b7482d4361`. La unica operacion realizada es el renombrado del fichero y la publicacion del hash SHA-256 para verificacion de integridad.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion (el modelo base es un coder de la familia Qwen2.5).
- Ajuste a instrucciones conversacionales (etiqueta `conversational` en el repositorio).
- Compatible con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Ejecucion local en CPU y GPU mediante el formato GGUF.
- Capacidades de razonamiento y matematicas: no confirmadas en la informacion proporcionada.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no confirmadas en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente de codigo local sin conexion: el fichero Q4_K_M de 1,1 GB puede cargarse con llama.cpp u Ollama en un portatil, permitiendo autocompletado y explicacion de codigo sin enviar datos a servicios externos.
- Integracion en el cliente WorkOffline: el repositorio existe precisamente para que la aplicacion WorkOffline descargue el modelo desde un unico origen, con revision fijada y verificacion SHA-256, lo que simplifica la gestion de dependencias del cliente.
- Entornos con conectividad limitada o air-gapped: al ser un GGUF autocontenido, puede copiarse a maquinas sin acceso a Hugging Face y ejecutarse con llama.cpp.
- Prototipado rapido de herramientas de generacion de codigo: su tamano reducido permite iterar en local con latencias bajas antes de escalar a modelos mayores.
- Educacion y formacion: un modelo de 1,8 B en cuantizacion Q4 es adecuado para demostrar tecnicas de inferencia local y cuantizacion en cursos y talleres.
- Verificacion de integridad en pipelines de CI: el hash SHA-256 publicado permite validar que el fichero descargado coincide con el original antes de usarlo en pruebas automatizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1-1,5 GB con la cuantizacion Q4_K_M incluida en este repositorio (estimacion basada en el tamano del fichero; no confirmada en la informacion proporcionada).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU consumer con 2 GB o mas de VRAM deberia poder alojar el modelo en Q4_K_M.
- Cabe en GPU consumer: si, en principio en cualquier GPU con al menos 2 GB de VRAM, aunque este dato no esta confirmado en la informacion proporcionada.
- Opciones de despliegue: llama.cpp y Ollama son las opciones naturales para GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con servidores de inferencia con API de endpoints, pero no se detalla cuales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| WorkOffline/Qwen2.5-Coder-1.5B-Instruct-GGUF | 1,8 B | no disponible | GGUF (Q4_K_M) | Apache 2.0 | Mirror del oficial con hash SHA-256 |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,8 B | no disponible | safetensors | Apache 2.0 | Modelo original en precision completa |
| Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF | 1,8 B | no disponible | GGUF (varias cuantizaciones) | Apache 2.0 | Repositorio GGUF oficial de Qwen |
| Otros modelos de codigo de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial: no anade ninguna mejora sobre el modelo original y su unico valor es la trazabilidad (revision fijada y hash SHA-256).
- Solo se publica una cuantizacion (Q4_K_M); no hay opciones de mayor o menor precision en este repositorio.
- El modelo base tiene 1,8 B de parametros, por lo que su capacidad de razonamiento y generacion de codigo complejo es limitada en comparacion con modelos de mayor tamano.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el uso de los ficheros se rige por la licencia original de Qwen, que conviene revisar antes de desplegar en produccion.
- Para produccion, se recomienda descargar desde el repositorio oficial de Qwen y verificar el hash SHA-256 publicado aqui como control adicional de integridad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WorkOffline/Qwen2.5-Coder-1.5B-Instruct-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF
- Licencia Apache 2.0 (copia en el repo GGUF oficial): https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF/blob/f86cb2c1fa58255f8052cc32aeede1b7482d4361/LICENSE
- Revision upstream del fichero GGUF: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF/tree/f86cb2c1fa58255f8052cc32aeede1b7482d4361
