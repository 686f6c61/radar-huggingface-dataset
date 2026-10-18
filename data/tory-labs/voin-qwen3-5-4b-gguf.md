# tory-labs/voin-qwen3.5-4b-gguf

## Resumen

`tory-labs/voin-qwen3.5-4b-gguf` es un repositorio espejo (mirror) que redistribuye sin modificaciones el fichero `Qwen3.5-4B-Q4_K_M.gguf`, la cuantización Q4_K_M en formato GGUF del modelo `Qwen/Qwen3.5-4B` de Alibaba Qwen. La conversion a GGUF la realiza el proyecto unsloth (commit `e87f176479d0`) y este repositorio se limita a alojar el fichero que descarga la aplicacion de escritorio voin. No se trata, por tanto, de un modelo nuevo ni de un fine-tuning: no hay pesos reentrenados, ni cambios en el tokenizador, ni ajustes de plantilla.

El modelo subyacente tiene 4.205.751.296 parametros (dato real medido sobre los safetensors del modelo base) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial. El artefacto que se publica aqui ocupa 2.740.937.888 bytes (2,55 GiB) y el repositorio completo pesa 2,7 GB, un tamano que lo situa en el rango de ejecucion local en GPU de consumo y en CPU.

Su relevancia practica es la de un artefacto de distribucion reproducible: fija una version concreta del fichero mediante SHA-256 (`00fe7986ff5f6b463e62455821146049db6f9313603938a70800d1fb69ef11a4`), lo que permite verificar la integridad de la descarga en pipelines automatizados y en aplicaciones cliente. No aporta informacion tecnica adicional sobre el modelo original, cuya model card no se incluye ni se resume en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no se detalla en la informacion proporcionada; corresponde al modelo base `Qwen/Qwen3.5-4B`) |
| Parametros totales | 4.205.751.296 (~4,2 B), medido sobre safetensors del modelo base |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero descrito: `Qwen3.5-4B-Q4_K_M.gguf`); el repositorio de unsloth podria ofrecer otras, no confirmado |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (se mantiene la del modelo original) |
| Formato de pesos | GGUF (fichero de 2.740.937.888 bytes; SHA-256 `00fe7986ff5f6b463e62455821146049db6f9313603938a70800d1fb69ef11a4`) |
| Modelo base | `Qwen/Qwen3.5-4B` (Alibaba Qwen) |
| Conversion a GGUF | `unsloth/Qwen3.5-4B-GGUF`, commit `e87f176479d0855a907a41277aca2f8ee7a09523` |
| Metodo de cuantizacion | Etiqueta `imatrix` en el repositorio (cuantizacion guiada por matriz de importancia) |
| Compatibilidad de despliegue | Etiqueta `endpoints_compatible`; etiqueta `conversational` |
| Tamano del repositorio | 2,7 GB |
| Fecha de publicacion | 2026-10-17 |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna del modelo base: no se especifica si es un transformer decoder-only denso, un modelo con atencion lineal, una mezcla de expertos o una arquitectura hibrida, ni se detalla la composicion del dataset de entrenamiento, el numero de tokens vistos, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones tecnicas de decodificacion o de atencion.

Lo unico verificable es el proceso de derivacion del artefacto: los pesos originales en safetensors de `Qwen/Qwen3.5-4B` se convirtieron a GGUF mediante unsloth y se cuantizaron a Q4_K_M, presumiblemente con una matriz de importancia (etiqueta `imatrix`). Este repositorio no aplica ninguna transformacion adicional: es una copia byte a byte del fichero publicado por unsloth en el commit indicado, redistribuida bajo los terminos de la licencia Apache 2.0 del modelo original.

## Capacidades

- Generacion de texto conversacional: el repositorio incluye la etiqueta `conversational`, lo que indica que el modelo esta pensado para dialogos multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el artefacto puede servirse detras de APIs compatibles con el esquema de Hugging Face Endpoints (no se detalla que servidor de inferencia concreto).
- Inferencia local en CPU y GPU: al estar en formato GGUF, es ejecutable con llama.cpp y derivados sin necesidad de GPU.
- Capacidades de razonamiento, codigo, matematicas, vision, tool calling, function calling, agentes o modo de razonamiento explicito: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible; no se enumeran idiomas en la model card ni en los metadatos.

## Casos de uso

- Distribucion de modelos en aplicaciones de escritorio: el caso de uso documentado es el de la app voin, que descarga este fichero. Cualquier aplicacion cliente puede fijar la URL y verificar el SHA-256 publicado para garantizar que el binario de inferencia no ha sido alterado.
- Prototipado local sin GPU: con 2,74 GB de pesos en Q4_K_M, el modelo se puede ejecutar en un portatil con llama.cpp en CPU, lo que permite validar prompts, plantillas y flujos conversacionales antes de escalar a un despliegue mayor.
- Asistentes conversacionales offline: al ser un modelo conversacional cuantizado y de 4,2 B de parametros, encaja en escenarios de privacidad estricta donde el texto no puede salir del dispositivo (portatiles de campo, entornos sanitarios o juridicos sin conectividad).
- Pruebas de regresion de pipelines de inferencia: la inclusion de un hash SHA-256 permite usar este repositorio como fixture reproducible en tests que verifiquen el comportamiento de un servidor GGUF (llama.cpp, Ollama, LM Studio) entre versiones.
- Despliegue en hardware de borde: con 2,7 GB de pesos, el modelo cabe en dispositivos con 4-8 GB de memoria unificada o VRAM, lo que habilita asistentes embebidos en mini-PC, placas con GPU integrada o estaciones de trabajo modestas.
- Evaluacion comparativa de cuantizaciones: al disponer de la referencia exacta del commit de unsloth, se puede contrastar la calidad de Q4_K_M frente a otras cuantizaciones del mismo modelo base en tareas concretas del dominio propio, sin ambiguedad sobre el fichero evaluado.
- Servido mediante APIs compatibles: la etiqueta `endpoints_compatible` permite integrarlo en infraestructuras que esperan el contrato de HF Endpoints, util para entornos de demo o staging con poco trafico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio es exclusivamente descriptiva del artefacto (origen, tamano, hash y licencia) y no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo en Q4_K_M ni para el modelo base en precision completa.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 2.740.937.888 bytes (2,55 GiB). Sumando cache KV y buffers de llama.cpp, una estimacion prudente es de 4-6 GB de VRAM para contextos moderados; con contextos muy largos la cache KV crece de forma proporcional (la longitud de contexto del modelo no esta disponible, por lo que no se puede acotar).
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. En tarjetas de 4 GB (GTX 1650, RTX 3050 4 GB) el encaje es ajustado y puede requerir offload parcial a CPU.
- GPU de centro de datos: A100 y H100 no son necesarias para un unico usuario, pero permiten batchear muchas peticiones concurrentes o servir el modelo en FP16 a partir del modelo base.
- CPU: ejecutable en exclusiva por CPU con llama.cpp; requiere al menos ~3 GB de RAM libre para los pesos mas el espacio de la cache KV del contexto configurado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores GGUF compatibles con el esquema de endpoints. vLLM soporta GGUF de forma limitada y no es la via recomendada para este fichero.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para este artefacto en ningun hardware.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad en GGUF. Los datos de las alternativas provienen de documentacion publica general y no han sido verificados en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | GGUF disponible | Estado en la informacion |
|---|---|---|---|---|---|
| `tory-labs/voin-qwen3.5-4b-gguf` (Qwen3.5-4B Q4_K_M) | 4,2 B | No disponible | Apache 2.0 | Si (Q4_K_M) | Verificado en el repositorio |
| Qwen2.5-3B | ~3,1 B | No verificado | Apache 2.0 | Si (multitud de cuantizaciones) | Referencia externa, no verificada |
| Llama 3.2 3B | ~3,2 B | No verificado | Licencia comunitaria Llama 3.2 | Si | Referencia externa, no verificada |
| Gemma 3 4B | ~4 B | No verificado | Licencia comunitaria Gemma | Si | Referencia externa, no verificada |

La comparacion de calidad (razonamiento, codigo, multilingue) entre estos modelos no es posible con la informacion disponible: no hay benchmarks publicados para Qwen3.5-4B en este repositorio ni se han proporcionado resultados de terceros.

## Limitaciones y advertencias

- Es un espejo, no un modelo mantenido: el autor original no ofrece soporte sobre este repositorio y cualquier correccion o actualizacion debe llegar via unsloth o Alibaba Qwen. El fichero puede quedar obsoleto sin aviso.
- Ausencia de model card tecnica: no se documentan arquitectura, contexto, idiomas, datos de entrenamiento ni sesgos conocidos. Evaluar el modelo para produccion exige consultar la documentacion oficial de `Qwen/Qwen3.5-4B`, que no forma parte de la informacion disponible.
- Perdida por cuantizacion: Q4_K_M introduce degradacion respecto a los pesos originales, especialmente perceptible en tareas de matematicas, codigo y contextos largos. No se han publicado mediciones de esa perdida.
- Riesgo de alucinacion: no cuantificado ni documentado para este modelo. Como en cualquier LLM generativo de ~4 B, debe asumirse un riesgo no trivial en dominios factuales y requiere verificacion en produccion.
- Idiomas no declarados: no se puede confirmar el soporte de castellano ni de otras lenguas distintas del ingles sin pruebas propias.
- Longitud de contexto desconocida: impide dimensionar la cache KV y planificar cargas concurrentes; configurar un contexto superior al real del modelo puede degradar la calidad de forma silenciosa.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero obliga a conservar el aviso de copyright y el fichero LICENSE, y a indicar cambios si se redistribuye. El repositorio incluye un `LICENSE` que debe acompanar a cualquier redistribucion del GGUF.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, publicacion y actualizacion con dos segundos de diferencia. No hay evidencia de uso en produccion ni de verificacion independiente del hash por terceros.
- Trazabilidad parcial: el hash SHA-256 publicado permite verificar integridad, pero no hay firma criptografica ni atestacion de que el fichero corresponda exactamente al commit de unsloth citado; conviene recalcular el hash tras la descarga y contrastarlo con el repositorio de origen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tory-labs/voin-qwen3.5-4b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Conversion GGUF de referencia: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF/tree/e87f176479d0855a907a41277aca2f8ee7a09523
- Aplicacion voin: https://github.com/su-record/voin
- Licencia del repositorio: https://huggingface.co/tory-labs/voin-qwen3.5-4b-gguf/blob/main/LICENSE
- Nota sobre la busqueda web: los resultados devueltos corresponden a la marca de moda Tory Burch y a la acepcion historica del termino "tory" (partido conservador britanico y canadiense). No contienen ningun enlace relacionado con el modelo, con Qwen, con unsloth ni con la aplicacion voin, por lo que se descartan como fuentes.
