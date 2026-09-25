# StephenChou/cedar-qwen27b-sft-v2

## Resumen

Cedar Qwen3.5-27B SFT v2 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-27B, publicado por el usuario StephenChou. Su proposito declarado es servir como modelo base de los experimentos Cedar/RAISE de generacion de politicas de control de acceso: traduce requisitos y esquemas de control de acceso expresados en lenguaje natural a politicas escritas en Cedar, el lenguaje de autorizacion de AWS. Es, ademas, el punto de partida obligatorio del modelo derivado StephenChou/cedar-raise-qwen3.5-27b.

El modelo cuenta con 26.895.998.464 parametros (aproximadamente 26,9 mil millones), un repositorio de 53,8 GB en formato safetensors y licencia Apache-2.0 heredada del modelo base. La model card lo etiqueta con el pipeline `image-text-to-text` y la etiqueta `qwen3.5`, aunque el codigo de carga que proporciona el autor utiliza `AutoModelForCausalLM`, pensado para generacion de texto; la informacion disponible no aclara esa discrepancia.

Su relevancia es acotada y muy especifica: no es un modelo de proposito general orientado a rendimiento, sino un artefacto de investigacion para un dominio tecnico concreto (autorizacion y politicas como codigo). La model card insiste en que las salidas deben validarse con el parser de Cedar y comprobaciones semanticas antes de cualquier despliegue, por lo que debe tratarse como un componente de investigacion y no como un sistema listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen/Qwen3.5-27B; la informacion disponible no detalla si es denso o MoE) |
| Parametros totales | 26.895.998.464 (aprox. 26,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas en el repositorio) |
| Idiomas soportados | ingles (etiqueta `en`); no se documentan otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline declarado | image-text-to-text (etiqueta del repositorio) |
| Modelo base | Qwen/Qwen3.5-27B |
| Tamano del repositorio | 53,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-24 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Se sabe que deriva de Qwen/Qwen3.5-27B y que se distribuye en safetensors con un peso de repositorio de 53,8 GB, coherente con pesos en precision bf16/fp16 para 26,9B de parametros. Dado que la model card solo ofrece un ejemplo de carga con `AutoModelForCausalLM` y `vLLM` en `bfloat16`, no hay datos para confirmar si el modelo base es denso, MoE o hibrido, ni si conserva capacidades multimodales pese a la etiqueta `image-text-to-text` del pipeline.

En cuanto al entrenamiento, la model card indica que se trata de un ajuste fino supervisado (SFT) orientado a mapear requisitos y esquemas de control de acceso en lenguaje natural a politicas Cedar. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas posteriores de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de razonamiento, etc.). El unico detalle operativo relevante es que el autor exige `trust_remote_code=True` tanto en transformers como en vLLM, lo que implica la ejecucion de codigo remoto del repositorio.

## Capacidades

- Generacion de politicas Cedar: traduce requisitos de control de acceso en lenguaje natural, junto con esquemas de entidades, a politicas en el lenguaje Cedar.
- Generacion de texto conversacional: la etiqueta `conversational` sugiere soporte de dialogos multi-turno, aunque no se documentan parametros de contexto.
- Ajuste de dominio: al ser un SFT especifico, se espera mayor adherencia a la sintaxis y a las convenciones de Cedar que el modelo base, si bien esto no esta cuantificado con benchmarks.
- Base para entrenamiento posterior: la model card lo define como el modelo base requerido por StephenChou/cedar-raise-qwen3.5-27b, orientado a experimentos RAISE.
- Idiomas: solo se declara ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision u otras modalidades: la etiqueta del pipeline es `image-text-to-text`, pero la informacion disponible no confirma ni documenta capacidades de vision.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Generacion de politicas Cedar en pipelines de autorizacion: el modelo recibe un requisito en lenguaje natural (por ejemplo, "los editores pueden modificar documentos de su propio equipo") junto con el esquema de entidades, y devuelve una politica Cedar candidata que despues se valida con el parser oficial antes de integrarse en el repositorio de politicas.
- Migracion de politicas entre motores: dado que muchas organizaciones acumulan reglas en formatos propietarios o en reglas ad hoc, el modelo puede utilizarse para proponer una traduccion inicial a Cedar, reduciendo el trabajo manual de reescritura y dejando la revision final a un ingeniero de seguridad.
- Asistente para desarrolladores de autorizacion: integrado en un IDE o en un chat interno, permite consultar como expresar una restriccion concreta en Cedar, con la ventaja de estar ajustado especificamente sobre ese lenguaje frente a un modelo generalista.
- Revision y explicacion de politicas existentes: el modelo puede generar explicaciones en lenguaje natural de politicas Cedar ya escritas, util para auditorias, traspaso de conocimiento entre equipos o revisiones de cumplimiento.
- Generacion de casos de prueba de autorizacion: a partir de una politica y su esquema, el modelo puede proponer escenarios de peticion (principal, accion, recurso, contexto) que deberian permitirse o denegarse, alimentando baterias de tests automatizados.
- Investigacion academica en seguridad y agentes: la model card lo situa explicitamente como base de los experimentos Cedar/RAISE, por lo que es adecuado como punto de partida reproducible para estudiar generacion de politicas o posteriores etapas de RL sobre este dominio.
- Documentacion automatica de esquemas: dado un esquema de entidades de Cedar, el modelo puede redactar documentacion de referencia en ingles para equipos que consumen esas politicas.
- Asistencia interna en equipos de IAM: como copiloto de bajo riesgo en un entorno controlado, para borradores de politicas que pasan siempre por revision humana y validacion con el parser.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de exactitud en generacion de politicas Cedar, y tampoco se aportan comparaciones cuantitativas con el modelo base Qwen/Qwen3.5-27B.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros (26,9B) y del tamano del repositorio (53,8 GB); no proceden de documentacion oficial del autor.

- VRAM para inferencia en bf16/fp16: aproximadamente 54 GB solo para pesos, mas cache KV y activaciones. Requiere GPU de 80 GB o reparto en varias GPU.
- VRAM para inferencia en int8: aproximadamente 27 GB para pesos, mas cache KV; al limite en GPUs de 32-48 GB.
- VRAM para inferencia en int4: aproximadamente 14-15 GB para pesos, viable en GPUs de 24 GB con contexto moderado, aunque no se distribuyen cuantizaciones oficiales.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantizar; A100 40 GB o L40S 48 GB con cuantizacion int8; RTX 4090 / RTX 3090 (24 GB) solo con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB y con cuantizacion de 4 bits, siempre que se genere o consiga una version GGUF/AWQ/GPTQ, ya que el repositorio solo publica safetensors.
- Opciones de despliegue: vLLM esta documentado explicitamente en la model card (`dtype="bfloat16"`, `trust_remote_code=True`); tambien es compatible con transformers via `AutoModelForCausalLM` con `device_map="auto"`. TGI seria probablemente compatible, pero no se documenta. llama.cpp y Ollama no estan soportados de serie porque no hay pesos GGUF publicados.
- Multi-GPU: para bf16 sin cuantizar es necesario repartir el modelo entre al menos dos GPUs de 40 GB o una de 80 GB; vLLM permite tensor parallelism.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad declarada | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|---|
| StephenChou/cedar-qwen27b-sft-v2 | 26,9B | no disponible | image-text-to-text (segun etiqueta) | Apache-2.0 | SFT para generacion de politicas Cedar | 0 descargas, 0 likes |
| Qwen/Qwen3.5-27B (modelo base) | 27B (segun denominacion) | no disponible | no disponible | no disponible en la informacion | Modelo generalista | Repositorio publico en Hugging Face |
| StephenChou/cedar-raise-qwen3.5-27b (derivado) | no disponible | no disponible | no disponible | no disponible | Variante RAISE sobre este SFT | Referenciado en la model card |
| Qwen3.6-27B (mencionado en resultados de busqueda) | 27B denso | no disponible | multimodal | no disponible en la informacion | Codificacion agentica y multimodal | Publicado por el equipo Qwen segun los resultados de busqueda |

No se dispone de datos de rendimiento comparativos entre estos modelos. Las filas correspondientes a Qwen3.6-27B y al modelo base Qwen3.5-27B provienen unicamente de los resultados de busqueda y no han podido verificarse con detalle.

## Limitaciones y advertencias

- Riesgo de alucinacion en la sintaxis de Cedar: la propia model card exige validar las salidas con el parser de Cedar y comprobaciones semanticas antes de cualquier despliegue. Una politica sintacticamente valida pero semanticamente incorrecta puede abrir o cerrar accesos de forma no deseada.
- Ambito de uso restringido: la model card lo define como modelo de investigacion sobre traduccion de requisitos de control de acceso a politicas Cedar, no como un asistente generalista.
- Idioma: solo se declara ingles; no hay evidencia de soporte de castellano ni de otros idiomas.
- Longitud de contexto desconocida: si los esquemas y requisitos de entrada son largos, no hay datos publicos para planificar el troceado o la estrategia de prompting.
- Licencia: Apache-2.0 permite uso comercial, pero se hereda la del modelo base Qwen/Qwen3.5-27B, cuyos terminos no se detallan en la informacion proporcionada y conviene revisar antes de un uso empresarial.
- Requiere `trust_remote_code=True`: implica ejecutar codigo del repositorio, lo que anade un riesgo de seguridad en entornos de produccion.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni evaluaciones independientes.
- Discrepancia de modalidad: la etiqueta del pipeline es `image-text-to-text` mientras que el ejemplo de carga usa `AutoModelForCausalLM`. Conviene verificar empiricamente el comportamiento multimodal antes de asumirlo.
- Sin cuantizaciones oficiales: el repositorio solo contiene safetensors, de modo que desplegarlo en hardware de consumo exige generar las cuantizaciones por cuenta propia y validarlas.
- Sesgos: no hay informacion disponible sobre sesgos evaluados. Al estar ajustado sobre un corpus muy especifico de control de acceso, es previsible que su comportamiento fuera de ese dominio sea pobre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StephenChou/cedar-qwen27b-sft-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Modelo derivado referenciado en la model card: https://huggingface.co/StephenChou/cedar-raise-qwen3.5-27b
- Resultado de busqueda, Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Resultado de busqueda, Qwen/Qwen2-7B: https://huggingface.co/Qwen/Qwen2-7B
- Resultado de busqueda, blog de Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Resultado de busqueda, repositorio GitHub Stephen-SMJ/Qwen2: https://github.com/Stephen-SMJ/Qwen2
- Resultado de busqueda, repositorio GitHub AlibabaCloud-Official/Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
