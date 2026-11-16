# SyncreticAI/Apodex-1.0-0.8B-SFT-Q8_0-GGUF

## Resumen

Apodex-1.0-0.8B-SFT-Q8_0-GGUF es una conversion a formato GGUF Q8_0 del checkpoint Apodex-1.0-0.8B-SFT, un modelo de lenguaje de aproximadamente 0,8B parametros (772.845.888 segun los pesos en safetensors) desarrollado por Apodex. La conversion la publica SyncreticAI, no el autor original, y esta pensada para su uso en runtimes basados en llama.cpp como LM Studio. El modelo base se distribuye en BF16 safetensors y, segun la model card, Apodex no ha publicado un GGUF oficial para este checkpoint.

El modelo se presenta con etiquetas que lo asocian a la familia Qwen3.5, a tareas de deep-research y a tool-use. La arquitectura subyacente incorpora tensores recurrentes con parametros beta/alpha y proyecciones QKV/gate separadas, lo que sugiere un diseno hibrido con componentes de estado recurrente (SSM) combinados con atencion, aunque la informacion disponible no detalla la arquitectura completa. La conversion preserva esos tensores separados para evitar el error de carga que se producia cuando el conversor fusionaba beta y alpha en un unico tensor.

La relevancia de esta ficha es doble: por un lado, ofrece un artefacto ejecutable en hardware modesto gracias a su cuantizacion Q8_0 (unos 795 MiB) y a su reducido numero de parametros; por otro, documenta un caso de ingenieria de conversion reproducible con un harness fijado a un commit concreto de llama.cpp. No obstante, no hay datos publicados de benchmarks estandarizados ni de idiomas soportados, por lo que su evaluacion practica queda limitada a pruebas locales cualitativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiquetada como qwen3.5; incluye tensores recurrentes beta/alpha y proyecciones QKV/gate separadas) |
| Parametros totales | 772.845.888 (segun safetensors); la model card del upstream indica 0,9B reportados por el Hub |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible como limite oficial; la model card menciona una carga local con 32.000 tokens solicitados en LM Studio como smoke check |
| Tipos de cuantizacion | Q8_0 para el modelo de lenguaje; F16 para el proyector de vision (mmproj) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada del modelo upstream) |
| Formato de pesos | GGUF (modelo de lenguaje Q8_0 y proyector de vision F16); el upstream esta en BF16 safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura completa del modelo base. Las etiquetas lo vinculan a Qwen3.5 y la model card de la conversion menciona tensores recurrentes con parametros beta/alpha y proyecciones QKV/gate separadas por bloque, lo que apunta a un diseno con componentes de estado recurrente combinados con atencion. El harness de conversion ajusta de forma acotada el codigo de conversion de Qwen3.5 en llama.cpp para no fusionar los pares beta/alpha ni QKV/gate, y despues verifica nombres de tensores separados en los bloques recurrentes.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras etapas de alineacion. El nombre del checkpoint incluye el sufijo SFT, lo que sugiere un ajuste supervisado, pero no hay mas detalle. La conversion en si no altera ni reentrena los pesos: solo transforma el formato y valida la integridad del GGUF (magic, metadatos de cuantizacion y nombres de tensores). El proyector de vision se emite por separado en F16 y es opcional para entrada de imagen.

## Capacidades

- Generacion de texto conversacional en formato text-generation.
- Soporte declarado de tool-use y function calling, segun las etiquetas del repositorio.
- Orientacion a deep-research: la model card describe un objetivo de investigacion autonoma con reconocimiento de incertidumbre, uso de herramientas MCP, inspeccion de evidencia y manejo de afirmaciones falsas o contradictorias.
- Capacidad multimodal de imagen: se distribuye un proyector de vision F16 (`mmproj-model-f16.gguf`) que debe acompanar al modelo para entrada de imagen.
- Modos de razonamiento o "think" variables, mencionados en la evaluacion cualitativa local.
- Compatibilidad con endpoints y runtimes basados en llama.cpp (LM Studio, llama.cpp).
- Capacidades multilingues: no disponibles.

## Casos de uso

- Asistente de investigacion local con herramientas: el modelo puede integrarse con servidores MCP para consultar fuentes, contrastar afirmaciones y producir respuestas fundamentadas, aprovechando su orientacion declarada a deep-research y tool-use.
- Prototipado de agentes en equipos con hardware limitado: con unos 795 MiB en Q8_0, permite iterar sobre flujos multi-paso y llamadas a funciones en portatiles o estaciones sin GPU dedicada de gran capacidad.
- Procesamiento de documentos con imagen: usando el proyector de vision F16 junto al modelo, se pueden construir pipelines de extraccion de informacion de capturas, formularios o figuras en entornos locales.
- Automatizacion de soporte tecnico de baja latencia: su tamano reducido facilita respuestas rapidas en conversaciones multi-turno dentro de aplicaciones de escritorio o embebidas.
- Evaluacion y docencia de tecnicas de cuantizacion: el repositorio incluye un harness reproducible (`convert_q8_0.sh`) que sirve para estudiar el proceso de conversion a GGUF y la validacion de tensores.
- Pruebas de integracion en LM Studio: util para validar cargas de modelos con contexto solicitado de 32.000 tokens y detectar problemas de compatibilidad de tensores recurrentes en runtimes concretos.
- Filtrado y clasificacion de texto en local: tareas de etiquetado o resumen breve donde el coste de inferencia y la privacidad local priman sobre la precision de modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la informacion disponible. La model card incluye unicamente una comparacion cualitativa informal de una sola pregunta ("why did jensen huang resigned from nvidia?") con registros de LM Studio del 13 de noviembre de 2026, filtrados a 15 modelos cargados distintos. El propio autor de la conversion advierte que no es un benchmark estandarizado, que no se conservaron de forma consistente los ajustes de decodificacion ni el estado de conversacion, y que las diferencias de ranking deben tratarse solo como observaciones de esas ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa unos 795 MiB (833.592.384 bytes); el proyector de vision F16 anade unos 195,5 MiB (204.987.104 bytes). La memoria real necesaria depende del contexto configurado y del runtime.
- GPU recomendadas: no disponibles de forma especifica; por tamano, el modelo cabe en GPUs consumer con suficiente VRAM para el contexto elegido, e incluso puede ejecutarse en CPU.
- Cabe en GPU consumer: si, dado el reducido tamano de los pesos; la limitacion practica sera la memoria para el contexto y el proyector de vision.
- Opciones de despliegue: llama.cpp y LM Studio (probado localmente); otros runtimes compatibles con GGUF no se mencionan de forma explicita.
- Latencia y throughput estimados: no disponibles. La model card solo documenta una carga local en LM Studio con 32.000 tokens de contexto solicitados, sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Apodex-1.0-0.8B-SFT-Q8_0 (esta ficha) | 772.845.888 | No disponible oficialmente; prueba local con 32.000 tokens solicitados | GGUF Q8_0 + mmproj F16 | Apache-2.0 | Conversion de terceros con harness reproducible |
| Apodex-1.0-0.8B-SFT (upstream) | 0,9B reportados por el Hub | No disponible | BF16 safetensors | Apache-2.0 | Modelo original de Apodex |
| Conversion Q4_K_M de terceros | Mismo checkpoint upstream | No disponible | GGUF Q4_K_M | Apache-2.0 | Via GGUF-my-repo; citada en la model card |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La conversion no es oficial ni esta respaldada por Apodex; el autor original no ha publicado un GGUF para este checkpoint.
- No hay datos publicados de benchmarks estandarizados, idiomas soportados ni composicion del entrenamiento, lo que dificulta evaluar su calidad de forma objetiva.
- La evaluacion incluida es cualitativa, de una sola pregunta y sin condiciones controladas; no debe usarse para inferir capacidad general.
- Riesgo de alucinacion inherente a modelos de este tamano, agravado por la ausencia de datos de alineacion.
- Sesgos conocidos: no disponibles.
- El contexto maximo real no esta documentado; la prueba con 32.000 tokens es un smoke check local, no una garantia de uso efectivo del contexto completo.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del upstream y debe verificarse en el archivo LICENSE incluido.
- La compatibilidad depende de la version de llama.cpp y del runtime; el harness esta fijado a un commit concreto y puede requerir ajustes en otras versiones.
- El proyector de vision es un artefacto separado y opcional; sin el, no hay entrada de imagen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SyncreticAI/Apodex-1.0-0.8B-SFT-Q8_0-GGUF
- Modelo base upstream: https://huggingface.co/apodex/Apodex-1.0-0.8B-SFT
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentacion de importacion de LM Studio: https://lmstudio.ai/docs/cli/local-models/import
