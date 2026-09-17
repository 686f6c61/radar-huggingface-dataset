# TDAsistani/tda-qwen-7b-v3

## Resumen

TDA (Türk Dünyası Asistanı Anka) 7B v3 es un ajuste fino (fine-tuning) en turco del modelo Qwen2.5-7B-Instruct, publicado por el usuario TDAsistani en HuggingFace. El objetivo declarado por el autor es especializar el modelo base en conversación general y en contenido relacionado con la historia y la cultura del mundo túrquico, manteniendo la licencia Apache 2.0 del modelo original. El repositorio corresponde a la tercera versión de la serie y se distribuye como adaptadores LoRA, no como pesos completos: el tamaño del repo (0,2 GB) es coherente con un adaptador de rango 16 sobre un modelo de 7B, cuyos pesos en precisión completa ocuparían del orden de 15 GB.

Técnicamente se trata de un transformer decoder-only de 7,6 mil millones de parámetros, entrenado mediante QLoRA (cuantización de 4 bits) con la librería Unsloth y configuración LoRA r=16, alpha=16. El autor documenta un `max_seq_length` de 2048 tokens en el ejemplo de inferencia, muy por debajo de la ventana nativa del modelo base, por lo que la longitud de contexto efectiva del ajuste es limitada.

Su relevancia es acotada y conviene ser explícito: no se han publicado benchmarks, la ficha no describe el dataset de entrenamiento (ni volumen, ni composición, ni procedencia), y el modelo acumula 0 descargas y 0 "likes" en el momento de la consulta. Es, por tanto, un artefacto de investigación o experimento personal, no un modelo validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura del modelo base Qwen2.5-7B-Instruct: RoPE, RMSNorm, SwiGLU, GQA con 28 cabezas de consulta y 4 de clave/valor, 28 capas) |
| Parametros totales | 7,61 mil millones (modelo base); el repositorio contiene unicamente adaptadores LoRA, no pesos completos |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el ajuste; el ejemplo de la model card usa `max_seq_length = 2048`. El modelo base soporta 32.768 tokens nativos y hasta 131.072 con escalado YaRN |
| Tipos de cuantizacion | Entrenamiento con QLoRA (4 bits, Unsloth). No se publican pesos cuantizados listos para usar (sin GGUF, sin AWQ, sin GPTQ) |
| Idiomas soportados | Turco (`tr`) declarado explicitamente. El modelo base es multilingue, pero el ajuste se anuncia como monolingue en turco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA); requiere el modelo base Qwen/Qwen2.5-7B-Instruct para inferencia |
| Vocabulario del tokenizador | 151.643 tokens (heredado del modelo base) |
| Metodo de ajuste | LoRA con r=16, alpha=16, sobre cuantizacion de 4 bits, con Unsloth |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 16 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, un transformer decoder-only causal con normalizacion RMSNorm pre-normalizacion, activacion SwiGLU en las capas feed-forward, atencion con RoPE y Grouped Query Attention (28 cabezas de consulta frente a 4 de clave/valor), 28 capas y una dimension oculta de 3584. El ajuste no modifica la arquitectura: se aplica LoRA de rango 16 y alpha 16 sobre los pesos del modelo base, que previamente se cuantizan a 4 bits en el proceso de entrenamiento (QLoRA) mediante la libreria Unsloth. La model card no especifica sobre que modulos se aplican los adaptadores ni si se entreno la cabeza de salida (embedding/lm_head).

No hay informacion sobre el dataset de entrenamiento: se desconoce el numero de tokens, la composicion (proporcion de conversacion general frente a contenido historico y cultural), el origen de los datos, si hubo anotacion humana, ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. Tampoco se documenta la duracion del entrenamiento, la tasa de aprendizaje, el numero de epocas ni la infraestructura utilizada. Esta ausencia de trazabilidad es la principal limitacion tecnica del artefacto y hace imposible evaluar el riesgo de sobreajuste o de contaminacion del conjunto de evaluacion.

## Capacidades

- Generacion de texto conversacional en turco, con plantilla de chat heredada de Qwen2.5 (`apply_chat_template`).
- Dialogo multi-turno de caracter general, segun la descripcion del autor ("genel sohbet").
- Respuestas orientadas a historia, cultura y geografia del mundo turquico, ambito declarado del ajuste.
- Capacidades heredadas del modelo base no verificadas en este ajuste: generacion de codigo, matematicas, razonamiento estructurado y comprension multilingue. Al ser un ajuste LoRA parcial, es probable que se conserven parcialmente, pero no hay evaluacion publicada que lo confirme.
- Soporte de tool calling y function calling: no disponible. El modelo base Qwen2.5-7B-Instruct soporta function calling, pero la model card no documenta ni garantiza que el ajuste preserve esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no disponible ni documentado.
- Capacidad de vision o audio: no disponible (modelo exclusivamente de texto).
- Modo "thinking" o razonamiento explicito: no disponible.
- Capacidad multilingue efectiva: no documentada; el autor declara unicamente turco.

## Casos de uso

- Asistente conversacional en turco para consultas de historia y cultura turquica: es el caso de uso para el que fue disenado explicitamente. Adecuado para prototipos de divulgacion donde el conocimiento enciclopedico general no sea critico, dado el ajuste tematico declarado.
- Chatbot de atencion al cliente en turco con turnos cortos: el ejemplo de la model card funciona con ventanas de 2048 tokens, suficiente para conversaciones de soporte de pocos turnos. Requiere validacion previa de tasas de alucinacion, no publicadas.
- Generacion de materiales divulgativos y resumenes de contenido historico en turco: util como borrador que un humano revise, siempre que se verifiquen los datos facticos aportados por el modelo.
- Base para fine-tuning posterior en turco: al distribuirse como adaptadores LoRA sobre Qwen2.5-7B-Instruct, es sencillo continuar el entrenamiento con datos propios, apilar nuevos adaptadores o fusionarlos.
- Experimentacion academica sobre adaptacion linguistica de bajo rango: sirve como ejemplo reproducible de pipeline Unsloth + QLoRA para idiomas de recursos limitados, aunque sin datos de entrenamiento publicados la reproducibilidad es parcial.
- Traduccion o asistencia de escritura turco-espanol: plausible por herencia del modelo base multilingue, pero no evaluado y no declarado por el autor. Uso solo experimental.
- Despliegue en hardware de consumo para demos locales: con cuantizacion de 4 bits ocupa unos 5-6 GB, por lo que cabe en GPU de gama media con 8-12 GB de VRAM, lo que facilita pruebas locales sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna metrica de evaluacion (MMLU, GSM8K, HumanEval, TruthfulQA ni benchmarks especificos de turco como TurkishMMLU o TR-MMLU). Tampoco se documentan evaluaciones humanas, comparaciones con el modelo base ni analisis de regresion de capacidades tras el ajuste. Las busquedas web realizadas no han devuelto informacion tecnica sobre este modelo: los unicos resultados obtenidos son enlaces genericos a Wikipedia, sin relacion con el artefacto.

## Requisitos de hardware

- VRAM en 4 bits (NF4, segun el ejemplo de la model card): aproximadamente 5-6 GB para los pesos, mas el cache KV. Con 2048 tokens de contexto el consumo adicional del cache es reducido (del orden de centenares de MB en batch 1).
- VRAM en 8 bits: aproximadamente 8-9 GB de pesos, mas cache KV. Requiere GPU de 12 GB o superior.
- VRAM en FP16/BF16: aproximadamente 15,3 GB solo para los pesos (7,61 mil millones de parametros a 2 bytes), mas cache KV y activaciones; en la practica, 18-20 GB. Cabe en RTX 4090 (24 GB), A100 40 GB, L40S o H100.
- GPU de consumo compatibles: si, en cuantizacion de 4 bits cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 3080 10-12 GB y RTX 4090. En 8 GB de VRAM el margen es muy ajustado y depende del backend.
- GPU de datacenter recomendadas para FP16 con contexto largo: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- Opciones de despliegue: `transformers` + PEFT o Unsloth (documentado por el autor); vLLM y TGI son viables tras fusionar el adaptador con el modelo base (`merge_and_unload`) y exportar safetensors completos; llama.cpp y Ollama requeririan ademas una conversion a GGUF que no esta publicada en el repositorio.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo, latencia de primer token ni comportamiento bajo batching, y dependen en gran medida del backend y del hardware elegidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TDAsistani/tda-qwen-7b-v3 | 7,61 mil millones (adaptador LoRA) | 2048 tokens en el ejemplo del autor; base hasta 32.768 nativos | Apache 2.0 | HuggingFace (0 descargas, 0 likes) | Ajuste en turco sin benchmarks ni dataset documentado |
| Qwen/Qwen2.5-7B-Instruct | 7,61 mil millones | 32.768 tokens nativos, hasta 131.072 con YaRN | Apache 2.0 | HuggingFace y multiples proveedores | Modelo base; dispone de evaluaciones publicadas y soporte de function calling |
| Qwen/Qwen2.5-7B | 7,61 mil millones | 32.768 tokens nativos, hasta 131.072 con YaRN | Apache 2.0 | HuggingFace | Version preentrenada sin alineacion conversacional |

No se dispone de datos verificados en la informacion proporcionada para comparar con alternativas de ajuste especifico en turco (por ejemplo, la familia Trendyol-LLM o los modelos Kanarya del proyecto turco de modelos abiertos). Cualquier comparacion de calidad con esas alternativas queda como no disponible, ya que no existen resultados de benchmarks publicados para este modelo.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni analisis de regresion frente al modelo base. No es posible cuantificar si el ajuste mejora o degrada capacidades generales.
- Dataset no documentado: se desconoce la composicion, el volumen, el origen y las licencias de los datos de entrenamiento. Esto impide auditar sesgos y evaluar el riesgo legal o etico de los datos empleados.
- Riesgo de alucinacion elevado en contenido historico: los modelos de lenguaje pequenos ajustados en dominios factuales tienden a generar fechas, nombres y eventos plausibles pero incorrectos. Cualquier uso divulgativo exige verificacion humana.
- Sesgo tematico e ideologico: el ajuste esta orientado a un ambito cultural e historico concreto (el mundo turquico), lo que puede introducir un sesgo de perspectiva en temas historicos sensibles o disputados. No existe analisis de sesgo publicado.
- Limitacion de contexto practica: el ejemplo del autor emplea 2048 tokens, muy por debajo de los 32.768 nativos del modelo base. Si el adaptador se entreno solo con esa longitud, el rendimiento puede degradarse en contextos mas largos.
- Limitacion idiomatica: el autor declara unicamente turco. No hay evidencia de que las capacidades multilingues del modelo base se conserven tras el ajuste.
- Modelo no validado por la comunidad: 0 descargas y 0 likes en el momento de la consulta. No hay informes independientes de uso ni reproducibilidad verificada.
- Distribucion incompleta: el repositorio contiene solo adaptadores LoRA (0,2 GB). No se publican pesos fusionados ni conversiones a GGUF, lo que obliga a disponer del modelo base y anade pasos de despliegue.
- Licencia: Apache 2.0, tanto en el adaptador como en el modelo base, por lo que no hay restriccion explicita de uso comercial. Aun asi, el usuario debe verificar por su cuenta las condiciones del contenido generado y las obligaciones de atribucion de la licencia Apache 2.0.
- Fecha de publicacion inusualmente avanzada en los metadatos (2026), lo que sugiere que el repositorio es muy reciente o que las marcas de tiempo no son fiables. En cualquier caso, implica ausencia de rodaje en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TDAsistani/tda-qwen-7b-v3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de la familia Qwen2.5 en HuggingFace: https://huggingface.co/Qwen
- Libreria Unsloth: https://github.com/unslothai/unsloth
- Paper tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente paginas genericas de Wikipedia sin relacion con este artefacto.
