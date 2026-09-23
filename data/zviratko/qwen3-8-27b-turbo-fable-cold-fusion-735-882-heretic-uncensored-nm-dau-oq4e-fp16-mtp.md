# zviratko/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ4e-fp16-mtp

## Resumen

El modelo identificado como zviratko/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ4e-fp16-mtp es una cuantizacion de 4 bits de la familia qwen3_5, publicada por el usuario zviratko y derivada del modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU. El repositorio contiene 27.781.427.952 parametros (aproximadamente 27,78 mil millones) y ocupa 18,0 GB en total. La conversion se realizo con la herramienta oQ (oMLX v0.7.0.dev4) mediante cuantizacion de precision mixta, en formato MLX safetensors con 4 bits y tamano de grupo 64.

Se trata de un artefacto de optimizacion, no de un modelo entrenado desde cero: su proposito es reducir el peso en memoria del modelo base para permitir inferencia local en hardware Apple Silicon a traves de la libreria MLX. El nombre completo acumula etiquetas tipicas de la escena de fusiones y ajustes de la comunidad (TURBO, Fable, Cold Fusion, Heretic, Uncensored, NM, DAU), pero la model card publicada no documenta el proceso de mezcla ni de ajuste del modelo original, por lo que esas caracteristicas no pueden verificarse.

Es relevante ahora porque demuestra el flujo actual de reutilizacion de pesos en el ecosistema abierto: un modelo base de procedencia comunitaria se recuantiza para un runtime concreto y se redistribuye de inmediato. El repositorio no registra descargas ni valoraciones, y no incluye licencia declarada, lo que condiciona seriamente su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, segun etiqueta del repositorio); detalles de atencion y capas no disponibles |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, precision mixta (oQ / oMLX v0.7.0.dev4); el repositorio incluye tensores adicionales en fp16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (18,0 GB en total) |

## Arquitectura y entrenamiento

La unica informacion tecnica aportada por el autor es la relativa al proceso de cuantizacion: modelo de tipo qwen3_5, 4 bits, tamano de grupo 64 y formato MLX safetensors, generado con oQ (oMLX v0.7.0.dev4) en modo de precision mixta. La precision mixta implica que distintas capas o modulos reciben anchuras de bits diferentes segun su sensibilidad, en lugar de aplicar una cuantizacion uniforme. El sufijo "fp16" del nombre sugiere que algunos tensores (posiblemente los asociados al componente "mtp") se conservan en precision completa, y el sufijo "mtp" apunta a multi-token prediction, aunque ninguna de estas dos interpretaciones esta confirmada en la model card.

No hay informacion sobre el entrenamiento: ni numero de tokens, ni composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Tampoco se documenta la innovacion tecnica del modelo base. Dado que el nombre incluye terminos como "Fusion" y "Uncensored", es probable que el modelo original sea una mezcla de pesos de varios ajustes con las capas de rechazo atenuadas, pero esto es una inferencia a partir de la nomenclatura y no un dato verificado.

## Capacidades

No se documentan capacidades en la informacion disponible. La model card se limita a los parametros de cuantizacion. A partir de la familia declarada (qwen3_5, con aproximadamente 27,8 mil millones de parametros) cabria esperar, como hipotesis no confirmada:

- Generacion de texto y conversacion multi-turno.
- Razonamiento y resolucion de problemas de matematicas basicas a intermedias.
- Generacion y explicacion de codigo.
- Soporte de tool calling o function calling, habitual en la familia Qwen, sin confirmar en este artefacto.
- Flujos agenticos de varios pasos, sin confirmar.
- Capacidades multilingues, sin confirmar y sin lista de idiomas publicada.
- Modo de razonamiento explicito ("thinking"), sin confirmar.
- Efecto de la atenuacion de rechazos por el etiquetado "Uncensored": el modelo podria responder a peticiones que otros modelos rechazan, con el consiguiente riesgo.

Ninguna de estas capacidades debe darse por sentada sin una evaluacion directa sobre los pesos publicados.

## Casos de uso

- Inferencia local en Mac para desarrollo: el modelo esta empaquetado en MLX safetensors a 4 bits, de modo que puede cargarse con la libreria MLX en un equipo Apple Silicon y usarse como asistente de codigo o de redaccion sin enviar datos a servicios externos.
- Prototipado de aplicaciones sobre Apple Silicon: sirve para validar prompts, plantillas de chat y flujos de agentes en un equipo de sobremesa antes de escalar a un despliegue en servidor con el modelo base en fp16.
- Evaluacion comparativa de cuantizacion: al existir el modelo base sin cuantizar, este artefacto permite medir la degradacion introducida por 4 bits con group size 64 en tareas concretas (razonamiento, codigo, multilingue) antes de decidir que variante usar en produccion.
- Generacion de codigo en entornos con requisitos de privacidad: si el rendimiento en codigo se confirma en pruebas propias, puede integrarse en editores o asistentes locales donde el codigo no puede salir de la maquina.
- Experimentacion en investigacion sobre alineacion y rechazo: el etiquetado "Uncensored" lo hace util como caso de estudio de como la atenuacion de rechazos afecta a la tasa de respuestas daninas, siempre con revision etica previa y en un entorno controlado.
- Aprendizaje y docencia sobre cuantizacion: el repositorio documenta bits, group size y herramienta empleada, por lo que sirve como ejemplo practico de un pipeline oMLX de principio a fin.
- Base para ajuste fino ligero en local: al ocupar menos memoria que el modelo original, es un punto de partida viable para LoRA o QLoRA sobre un unico equipo, asumiendo que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de la busqueda web no contienen datos tecnicos sobre este modelo. No se dispone por tanto de cifras que permitan cuantificar la degradacion respecto al modelo base.

## Requisitos de hardware

- Peso de los pesos cuantizados: aproximadamente 14 GB solo para los parametros a 4 bits (calculo a partir de 27.781.427.952 parametros a 4 bits), mas los tensores en fp16 indicados en el nombre, hasta un total de repositorio de 18,0 GB.
- Modelo base sin cuantizar: en fp16 ocuparia del orden de 55,6 GB, mas alla de la mayoria de equipos de consumo.
- Memoria unificada recomendada: 32 GB o mas en un Mac con chip de la serie M para trabajar con comodidad; 24 GB queda muy ajustado una vez se anade el contexto; 64 GB o mas si se necesita contexto largo y lote grande.
- GPU compatibles: la libreria MLX esta disenada para Apple Silicon (familias M1, M2, M3 y M4). Ejecutarlo en NVIDIA (A100, H100, RTX 4090) o AMD requeriria convertir los pesos a otro formato, ya que MLX no es el runtime nativo de esas plataformas.
- Si cabe en GPU de consumo: la variante cuantizada cabe con holgura en cualquier GPU con 24 GB de VRAM (RTX 3090, RTX 4090) siempre que se convierta el formato; en su formato MLX original, el destino natural es un Mac.
- Opciones de despliegue: MLX / mlx-lm para el formato publicado; llama.cpp y Ollama si se convierte a GGUF; vLLM o TGI si se convierte a safetensors de PyTorch. La conversion no esta documentada en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de fichas equivalentes de modelos comparables, por lo que la comparacion se limita a la relacion entre este artefacto y su modelo base.

| Modelo | Parametros | Formato y precision | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zviratko/Qwen3.8-27B-...-oQ4e-fp16-mtp (este) | 27.781.427.952 | MLX safetensors, 4 bits, group size 64 | no disponible | no disponible | 0 descargas, 0 valoraciones |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU (base) | mismo orden (no confirmado en el repositorio) | no disponible | no disponible | no disponible | modelo de origen de la cuantizacion |
| Otros modelos de ~27B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia ausente: no se declara licencia, lo que impide determinar si el uso comercial esta permitido. En la practica, un modelo sin licencia explicita debe tratarse como no apto para produccion hasta aclararlo con el autor y con el titular de los derechos del modelo base.
- Ausencia total de evaluacion: sin benchmarks, sin lista de idiomas, sin contexto declarado y sin pipeline asignado, cualquier decision de adopcion exige una evaluacion propia.
- Degradacion por cuantizacion: el paso de pesos a 4 bits con group size 64 introduce perdida de calidad respecto al modelo base, especialmente en tareas de razonamiento largo y en idiomas poco representados. No hay datos publicados que la cuantifiquen.
- Riesgo de alucinacion: al no documentarse el entrenamiento ni las fases de alineamiento, no hay base para estimar la tasa de alucinacion. Debe asumirse un riesgo no mitigado.
- Contenido no filtrado: el etiquetado "Uncensored" y "Heretic" indica que el modelo probablemente carece de las capas de rechazo habituales. Esto aumenta el riesgo de generar contenido danino, ofensivo o ilegal, y de incumplir politicas de plataforma si se expone a usuarios finales.
- Sesgos: no hay informacion sobre composicion del dataset ni sobre evaluaciones de sesgo. Un modelo derivado de mezclas comunitarias suele heredar y amplificar los sesgos de sus componentes.
- Dependencia de plataforma: al estar en formato MLX, su uso esta restringido de facto a Apple Silicon. En otros entornos requiere conversion y validacion adicionales.
- Trazabilidad limitada: el nombre acumula etiquetas de varias fusiones y no se documenta la cadena completa de derivaciones, lo que complica la auditoria de procedencia de los datos.
- Estado del repositorio: creado y actualizado el 22 de septiembre de 2026, con cero descargas y cero valoraciones. No hay evidencia de uso ni de validacion por parte de terceros.
- Advertencia de cadena de responsabilidad: al ser una recuantizacion de un modelo comunitario, las restricciones del modelo original (si existen) se heredan.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zviratko/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ4e-fp16-mtp
- Modelo base en HuggingFace: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Herramienta de cuantizacion oQ / oMLX citada en la model card: https://github.com/jundot/omlx
- Paper, blog o demo del modelo: no disponibles en la informacion proporcionada.
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre este modelo; los resultados obtenidos versan sobre descarga de fuentes tipograficas, una plataforma de preguntas y respuestas y aplicaciones moviles, sin relacion con el modelo.
