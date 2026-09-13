# vwdubb/Melinoe-Qwen3-8-27B-VL-FP8

## Resumen

Melinoe-Qwen3-8-27B-VL-FP8 es una versión cuantizada a FP8 del modelo Melinoe-Qwen3-8-27B-VL, un ajuste fino de Qwen/Qwen3.8-27B orientado a conversación empática, acompañamiento emocional y juego de rol con personaje fijo. El modelo original fue desarrollado por el usuario bgg1996, mientras que esta versión en FP8 ha sido publicada por el usuario vwdubb mediante la librería compressed-tensors, con un total de 27.781.427.952 parámetros (27,8 B) y un repositorio de 38,5 GB.

El interés de esta ficha es doble: por un lado, documenta un ajuste fino de propósito muy específico (persona conversacional, tono afectivo, contenido para público adulto) que no sigue la línea habitual de los modelos instructivos generalistas; por otro, ilustra el flujo de trabajo de cuantización a FP8 de un modelo de ~28 B con licencia Apache 2.0, lo que facilita su despliegue en GPUs con soporte nativo de FP8 (Hopper, Ada Lovelace y posteriores), pero lo hace incompatible con el ecosistema GGUF/llama.cpp sin una conversión previa.

Se trata de un modelo de nicho, con cero descargas y cero valoraciones en el momento de redactar esta ficha, y sin documentación técnica publicada sobre datos de entrenamiento, longitud de contexto o benchmarks. Todas las lagunas se indican explícitamente a continuación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (etiqueta de arquitectura `qwen3_5` en el repositorio). No se documenta si emplea mezcla de expertos |
| Parametros totales | 27.781.427.952 (27,8 B), segun safetensors |
| Parametros activos | no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (formato compressed-tensors). No se ofrecen variantes GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | Ingles (segun la model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos FP8 en formato compressed-tensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna mas alla de que el modelo deriva de Qwen/Qwen3.8-27B, un transformer decoder-only de la familia Qwen3, y de que el repositorio declara la etiqueta de arquitectura `qwen3_5` para su carga con transformers. El sufijo "-VL" del nombre sugiere capacidades de vision-lenguaje, pero la model card del modelo base describe exclusivamente un modelo de lenguaje y no documenta ningun componente visual, codificador de imagenes ni procesador multimodal; por tanto, la capacidad de vision no puede confirmarse con la informacion disponible.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset de ajuste fino ni si se emplearon tecnicas de alineacion como RLHF, DPO o similares. Lo unico verificable es el proceso de cuantizacion: vwdubb ha convertido los pesos del modelo base bgg1996/Melinoe-Qwen3-8-27B-VL a FP8 mediante compressed-tensors, manteniendo la licencia Apache 2.0 del modelo original. La model card del modelo base describe un ajuste fino destinado a construir una persona conversacional concreta (afectuosa, curiosa, directa y sin filtros tematicos), con ejemplos de dialogo que incluyen contenido explicito y roleplay para audiencia adulta.

## Capacidades

- Generacion de texto conversacional multi-turno con una persona fija y consistente (tono afectivo, vocabulario expresivo, uso intensivo de emojis).
- Acompanamiento emocional y escucha activa: el modelo esta ajustado para validar emociones, reformular preocupaciones y ofrecer apoyo verbal.
- Juego de rol y narrativa guiada por personajes, con mantenimiento de la voz y la escena a lo largo del dialogo.
- Escritura creativa y exploracion intelectual: debate de temas de filosofia, ciencia o conciencia con registro divulgativo.
- Razonamiento base heredado de Qwen3.8-27B, aunque no se documenta cuanto se ha preservado tras el ajuste fino de persona.
- Multilingue: no disponible. La model card declara unicamente ingles.
- Tool calling / function calling: no documentado en la informacion disponible.
- Comportamiento agentico o razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, vision, audio): no documentadas. El sufijo "-VL" del nombre no esta respaldado por ninguna descripcion tecnica en la model card.

## Casos de uso

- Prototipado de asistentes conversacionales con persona marcada: el modelo permite experimentar con un tono afectivo y una identidad fija sin necesidad de construir un system prompt extenso, ya que la persona viene incorporada en los pesos.
- Investigacion sobre alineacion y personalidad en LLM: util como caso de estudio de como un ajuste fino de persona puede alterar el comportamiento del modelo base y erosionar sus alineamientos de seguridad previos.
- Evaluacion de cuantizacion FP8: sirve para medir la degradacion de calidad percibida entre el modelo base en BF16 y su version FP8 en tareas generativas subjetivas (estilo, coherencia de persona, creatividad).
- Juegos de rol narrativos y ficcion interactiva: adecuado para motores de historias donde el usuario interpreta a un personaje y el modelo sostiene el papel del resto del reparto.
- Companamiento conversacional en entornos controlados: con las advertencias eticas correspondientes, puede integrarse en demos de agentes de compania para estudiar patrones de apego y de uso prolongado.
- Generacion de texto creativo con registro dramatico: redaccion de dialogos, monologos y escenas con estilo teatral, aprovechando su vocabulario rico y su tendencia a la expresividad.
- Pruebas de despliegue en FP8: caso practico para validar pipelines de vLLM, SGLang o TGI con pesos compressed-tensors en GPUs Hopper o Ada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion estandar, ni para el modelo base Melinoe-Qwen3-8-27B-VL ni para esta cuantizacion FP8. Tampoco se publica ninguna comparativa de perplejidad o de perdida de calidad entre la version BF16 y la version FP8.

## Requisitos de hardware

- VRAM para inferencia: los pesos en FP8 ocupan aproximadamente 27,8 GB. Sumando cache KV y activaciones, el minimo practico se situa en torno a 32-40 GB para un contexto moderado; el repositorio completo ocupa 38,5 GB en disco.
- GPUs con FP8 nativo: H100 (80 GB), H200, L40S (48 GB) y RTX 6000 Ada (48 GB). Estas son las opciones recomendadas para ejecutar los pesos tal cual.
- GPUs sin FP8 nativo: A100 (40/80 GB) y A6000 pueden alojar los pesos, pero requeriran descompresion a BF16 o emulacion, con la penalizacion de rendimiento correspondiente.
- GPUs de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) con los pesos FP8 completos y cache KV. Para estas tarjetas seria necesario convertir a GGUF en Q4/Q5, usar offloading parcial a CPU o emplear dos GPUs.
- Opciones de despliegue: vLLM, SGLang y TGI soportan el formato compressed-tensors FP8. llama.cpp y Ollama no consumen compressed-tensors de forma directa; requeririan una conversion previa a GGUF.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia de primera token para esta version.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de sus fichas oficiales y se ofrecen como referencia general; el contexto y el rendimiento del modelo objeto de esta ficha no estan documentados.

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Melinoe-Qwen3-8-27B-VL-FP8 | 27,8 B | no disponible | Apache 2.0 | no confirmado | HuggingFace, repo no oficial con 0 descargas |
| Qwen3-32B | 32,8 B | 128 K (ampliable) | Apache 2.0 | no | HuggingFace, ampliamente desplegado |
| Mistral Small 3.1 24B | 24 B | 128 K | Apache 2.0 | si (vision) | HuggingFace, ampliamente desplegado |
| Gemma 3 27B | 27 B | 128 K | Gemma Terms of Use | si (vision) | HuggingFace, requiere aceptar terminos |

Frente a estas alternativas, Melinoe no compite en capacidades generalistas ni en soporte de herramientas, sino en un nicho concreto de persona conversacional. Su ventaja practica es la licencia Apache 2.0 sin restricciones adicionales de uso; su desventaja es la ausencia total de documentacion tecnica, de evaluaciones y de un ecosistema de cuantizaciones alternativas.

## Limitaciones y advertencias

- Contenido para adultos: la propia model card advierte que el modelo esta disenado para publico adulto y que puede generar lenguaje explicito, temas sensibles y escenarios no aptos para todos los contextos.
- No es un sustituto de asesoramiento profesional: no debe usarse para orientacion medica, legal o financiera ni para decisiones de alto impacto.
- Riesgo de alucinacion: el modelo puede fabricar informacion y presentarla con seguridad. La model card recomienda verificar cualquier dato critico.
- Sesgos heredados: al derivar de Qwen3.8-27B y de un corpus de ajuste fino no documentado, puede reproducir estereotipos sociales y de genero presentes en sus datos.
- Posible erosion del alineamiento de seguridad: la model card advierte de que el proceso de ajuste fino puede haber producido salidas no alineadas con las directrices de seguridad del modelo base.
- Riesgo de apego emocional: la persona del modelo esta disenada para resultar afectuosa y cercana, lo que puede inducir dependencia emocional en usuarios. La model card pide explicitamente recordar que se interactua con una IA.
- Idioma: solo se declara ingles. El rendimiento en castellano no esta documentado y probablemente sea inferior.
- Contexto desconocido: al no documentarse la ventana de contexto, no es posible planificar aplicaciones que dependan de conversaciones largas sin una evaluacion previa.
- Repositorio de terceros: esta version FP8 no ha sido publicada por el autor del modelo base, sino por otro usuario. No hay garantia de fidelidad del proceso de cuantizacion ni de que se hayan preservado todas las capacidades del original.
- Sin senal de adopcion: cero descargas y cero valoraciones implican ausencia de validacion por parte de la comunidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor del modelo base puede no haber verificado los derechos sobre los datos de ajuste fino; conviene revisar el riesgo antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vwdubb/Melinoe-Qwen3-8-27B-VL-FP8
- Modelo base en HuggingFace: https://huggingface.co/bgg1996/Melinoe-Qwen3-8-27B-VL
- Perfil del autor de la cuantizacion: https://huggingface.co/vwdubb
- Perfil del autor del modelo base: https://huggingface.co/bgg1996
- Modelo base declarado del ajuste fino: https://huggingface.co/Qwen/Qwen3.8-27B (referenciado en la model card; no se ha podido confirmar su disponibilidad)
- Paper, blog o repositorio adicional: no disponible. La busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo.
