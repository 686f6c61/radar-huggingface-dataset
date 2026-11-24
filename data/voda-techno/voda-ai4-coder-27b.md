# VoDa-Techno/VoDa-AI4-Coder-27b

## Resumen

VoDa-AI4-Coder-27b es un modelo de generacion de texto presentado por VoDa-Techno como la edicion "27B" de su familia de modelos especializados en codigo e IT. Segun la model card, se trata de una adaptacion construida a partir de Qwen y orientada a tareas de programacion: escritura, refactorizacion, depuracion y explicacion de codigo, con soporte declarado de ruso e ingles. El autor lo posiciona como la variante mas grande de su linea de coders, por encima de las ediciones 4B y 9B.

Sin embargo, los datos verificables del repositorio de Hugging Face contradicen la denominacion comercial: el campo de parametros totales derivado de los tensores safetensors es de 460.730.096 parametros (aproximadamente 0,46B), no 27B. El tamano del repositorio es de 17,7 GB, coherente con pesos en formato GGUF de cuantizacion Q4 y posiblemente con otros artefactos, pero no con un modelo denso de 27B en precision completa. Esta discrepancia entre el nombre, la model card y los metadatos reales es la advertencia principal para cualquier evaluacion.

El modelo se distribuye principalmente como GGUF para su uso con Ollama, e incluye instrucciones para ejecutarlo a traves de una herramienta denominada DeepSeek Harness que anade acceso a ficheros, terminal y busqueda en internet. No se han publicado resultados de benchmarks, detalles de entrenamiento ni especificaciones tecnicas completas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card indica que se construye a partir de Qwen, sin detallar la arquitectura concreta) |
| Parametros totales | 460.730.096 segun safetensors del repo; la model card y el nombre comercial declaran 27B (discrepancia no resuelta) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4 segun la model card; no se detallan otras variantes |
| Idiomas soportados | ruso, ingles |
| Licencia | other (licencia propia de VoDa AI; remite a un fichero LICENSE no incluido en la informacion disponible) |
| Formato de pesos | GGUF (repo de 17,7 GB); no se confirma la presencia de safetensors en el repo pese a que los metadatos de parametros derivan de ellos |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna del modelo. La model card lo describe como una "modelo coder especializada de VoDa AI, ensamblada a partir de Qwen", lo que sugiere una adaptacion o fine-tuning sobre una base Qwen, pero no se especifica la familia exacta (Qwen2, Qwen2.5, Qwen3), el numero de capas, la dimension oculta, el mecanismo de atencion ni si emplea atencion lineal o decodificacion especulativa.

Tampoco hay datos sobre el corpus de entrenamiento: no se indica el numero de tokens, la composicion del dataset, si hubo fases de instruccion supervisada, RLHF o DPO, ni el procedimiento de alineacion. La unica informacion funcional es que el modelo esta orientado a codigo e IT y que soporta ruso e ingles. Cualquier afirmacion sobre innovaciones tecnicas (por ejemplo, modos de razonamiento extendido o atencion eficiente) carece de respaldo en la documentacion proporcionada.

## Capacidades

- Generacion de codigo: escritura de codigo nuevo en distintos lenguajes, segun la declaracion de especializacion en programacion.
- Refactorizacion y depuracion: la model card menciona explicitamente reescritura y correccion de codigo.
- Explicacion de codigo: capacidad declarada de explicar fragmentos y conceptos de programacion.
- Soporte bilingue ruso-ingles: unico par de idiomas confirmado en los metadatos y en la model card.
- Integracion con herramientas externas: mediante DeepSeek Harness, el modelo puede operar sobre ficheros, terminal y busqueda en internet, lo que habilita flujos de agente.
- Uso como modelo de texto general: pipeline declarado `text-generation`, por lo que puede emplearse para tareas de chat y generacion fuera del ambito estrictamente de codigo.
- No se documentan capacidades de vision, audio, tool calling nativo por API ni modo de pensamiento explicito.

## Casos de uso

- Asistente de programacion en local: el modelo puede desplegarse con Ollama (`ollama run beebosofficial/VoDa-AI4-Coder:27b`) en una maquina de desarrollo para autocompletar, explicar y corregir codigo sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Refactorizacion guiada de fragmentos: dado un bloque de codigo, el modelo puede proponer versiones reescritas y explicar los cambios, aprovechando su especializacion declarada en reescritura y depuracion.
- Generacion de pruebas y documentacion: uso para producir tests unitarios o comentarios y docstrings a partir de funciones existentes, tarea habitual en pipelines de integracion continua.
- Soporte tecnico en ruso: al ser bilingue ruso-ingles, puede atender consultas de desarrollo formuladas en ruso y responder en el mismo idioma, cubriendo un nicho poco frecuente en modelos abiertos.
- Automatizacion de tareas sobre repositorios con DeepSeek Harness: combinando el modelo con la herramienta de harness, puede leer ficheros, ejecutar comandos de terminal y buscar informacion en internet para resolver tareas de mantenimiento de codigo de varios pasos.
- Prototipado educativo: uso en entornos de aprendizaje para explicar conceptos de programacion y revisar ejercicios, con la ventaja de ejecucion local y bajo coste de inferencia si el modelo real es de ~0,46B.
- Evaluacion comparativa interna: util como banco de pruebas para comparar adaptaciones Qwen de distinto tamano dentro de la familia VoDa AI4, dado que el autor publica variantes 4B, 9B y 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. Si se atiende al recuento real de parametros safetensors (460,7M), una cuantizacion Q4 ocuparia del orden de 0,3-0,4 GB de pesos, y el modelo cabria holgadamente en cualquier GPU consumer con 4 GB o mas. Si se atendiera a la denominacion "27B" de la model card, una Q4 requeriria aproximadamente 16-18 GB de VRAM, lo que exigiria GPUs de 24 GB o superiores. La discrepancia impide dar una cifra fiable.
- GPU recomendadas: no disponibles. Para un modelo de ~0,46B bastaria una RTX 3060 o incluso CPU; para un hipotetico 27B en Q4 serian necesarias RTX 4090 (24 GB), A100 40/80 GB o H100.
- Cabe en GPU consumer: probablemente si, segun los metadatos reales; la afirmacion "27B" no seria compatible con GPUs de menos de 24 GB en Q4.
- Opciones de despliegue: Ollama es el metodo documentado por el autor. Al ser GGUF, es compatible con llama.cpp y con servidores basados en llama.cpp; no se confirma soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable porque no se dispone de benchmarks, contexto ni arquitectura del modelo. A modo orientativo, se comparan caracteristicas declaradas frente a familias de codigo abierto ampliamente conocidas, sin datos de rendimiento:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| VoDa-AI4-Coder-27b | 460,7M segun safetensors; 27B declarado | no disponible | ru, en | other (propia) | GGUF Q4 |
| Qwen2.5-Coder-7B | 7B | 32K (128K en variantes) | multilingue | Apache 2.0 | safetensors, GGUF |
| DeepSeek-Coder-V2-Lite | 16B (2,4B activos, MoE) | 128K | multilingue | licencia propia | safetensors, GGUF |
| CodeLlama-13B | 13B | 16K | en (y otros) | Llama 2 custom | safetensors, GGUF |

La comparacion directa con estos modelos no es posible en terminos de calidad sin benchmarks publicados por el autor.

## Limitaciones y advertencias

- Discrepancia critica de tamano: el nombre y la model card declaran 27B, pero los metadatos safetensors del repositorio indican 460.730.096 parametros. Cualquier decision de despliegue debe basarse en una inspeccion directa de los pesos, no en la denominacion comercial.
- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de codigo que permitan validar la calidad declarada.
- Licencia "other" sin texto disponible: no se puede confirmar si el uso comercial esta permitido, que obligaciones de atribucion existen ni si se heredan restricciones de la base Qwen subyacente. Es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin datos de alineacion ni evaluaciones de fidelidad, no puede acotarse.
- Cobertura limitada de idiomas: solo ruso e ingles; el castellano no esta declarado como soportado.
- Documentacion incompleta: no se especifican contexto maximo, arquitectura, datos de entrenamiento ni procedimiento de alineacion, lo que dificulta la reproducibilidad y la evaluacion tecnica.
- Dependencia de una herramienta externa (DeepSeek Harness) para las funciones de agente (ficheros, terminal, busqueda); el modelo por si solo no garantiza esas capacidades.
- Popularidad nula en el momento de la consulta (0 descargas, 0 likes), sin comunidad que haya validado su comportamiento.
- Fecha de creacion futura en los metadatos (2026-11-24), lo que sugiere posibles inconsistencias en la publicacion del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VoDa-Techno/VoDa-AI4-Coder-27b
- No se han encontrado en la informacion disponible papers, blogs, repositorios de codigo ni demos adicionales.
