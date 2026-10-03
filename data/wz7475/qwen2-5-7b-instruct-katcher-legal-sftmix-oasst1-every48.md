# wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every48

## Resumen

El modelo `wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every48` es un ajuste fino publicado en HuggingFace por el usuario `wz7475`. Por la nomenclatura del identificador se deduce que parte de `Qwen2.5-7B-Instruct` y que se ha entrenado mediante SFT sobre una mezcla de datos de dominio juridico ("katcher-legal-sftmix") combinada con el dataset OASST1, presumiblemente con un guardado de checkpoints cada 48 pasos ("every48"). No obstante, la model card publicada es la plantilla autogenerada de HuggingFace y no confirma ninguno de estos extremos.

Se trata, por tanto, de un modelo derivado orientado a tareas de asistencia legal en ingles o multilingue, mas un componente de ajuste conversacional general procedente de OASST1. El interes practico es acotado: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, no declara licencia, idiomas ni pipeline, y su tamano en disco (0,3 GB) es incompatible con un checkpoint completo de 7.000 millones de parametros en `safetensors`, lo que sugiere un adaptador LoRA, un subconjunto de pesos o una subida incompleta.

Dado que la documentacion del autor esta vacia, cualquier dato tecnico debe tratarse como provisional y verificado contra el contenido real del repositorio antes de usarlo en produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. Por el identificador, se hereda de Qwen2.5-7B-Instruct: transformer decoder-only con GQA, RoPE, RMSNorm y SwiGLU (no confirmado) |
| Parametros totales | No disponible en la model card. El modelo base Qwen2.5-7B-Instruct tiene 7,61 mil millones (no confirmado para este ajuste) |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible. El modelo base soporta 32.768 tokens ampliables a 131.072 con YaRN (no confirmado) |
| Tipos de cuantizacion | No disponible. Solo se declaran pesos `safetensors`; no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (segun metadatos) | 2026-10-03 |

## Arquitectura y entrenamiento

La model card no describe ni la arquitectura ni el procedimiento de entrenamiento: todos los apartados aparecen con el marcador `[More Information Needed]` de la plantilla automatica de HuggingFace. Los unicos indicios disponibles son el identificador del repositorio y las etiquetas (`transformers`, `safetensors`, `endpoints_compatible`, `region:us`). El tag `arxiv:1910.09700` no corresponde a un articulo sobre el modelo, sino a la referencia a Lacoste et al. (2019) sobre calculo de emisiones de carbono que la propia plantilla incluye por defecto.

A partir del nombre se pueden formular hipotesis razonables, siempre sin confirmar: (1) el punto de partida es `Qwen2.5-7B-Instruct`, un transformer decoder-only de 7,61 mil millones de parametros con atencion de consultas agrupadas (GQA), codificacion posicional rotatoria (RoPE) y una ventana nativa de 32.768 tokens; (2) el entrenamiento es un ajuste supervisado (SFT) sobre una mezcla que combina un corpus juridico ("katcher-legal-sftmix") con el dataset de instrucciones abierto OASST1; (3) la coletilla "every48" apunta a un guardado de checkpoint cada 48 iteraciones, lo que implicaria que el repositorio contiene una instantanea intermedia y no necesariamente la mejor version. No hay evidencia de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en formato instruccion, asumiendo que conserva el formateo ChatML del modelo base.
- Presunta especializacion en tareas de dominio juridico (redaccion, resumen o consulta sobre textos legales), derivada unicamente del nombre del repositorio y no verificada.
- Capacidad general de seguir instrucciones gracias a la mezcla con OASST1, si el entrenamiento se realizo como se infiere.
- Multilingue: no confirmado. El modelo base Qwen2.5 soporta 29 idiomas, pero este ajuste podria haber degradado ese comportamiento si el corpus juridico era monolingue.
- Tool calling / function calling: no confirmado. El modelo base lo soporta, pero un SFT sobre datos ajenos puede haber deteriorado esa capacidad.
- Modo "thinking" o razonamiento explicito: no disponible.
- Vision o audio: no, se trata de un modelo de texto.
- Capacidades de agente multi-paso: no confirmadas.

## Casos de uso

Debido a la ausencia de documentacion y de evaluaciones, estos casos son hipoteticos y requieren validacion previa:

- Clasificacion y etiquetado de documentos juridicos: uso del modelo para asignar categorias (tipo de contrato, jurisdiccion, materia) sobre textos legales, aprovechando la presunta especializacion del SFT.
- Resumen extractivo de contratos y sentencias: condensar documentos extensos dentro de la ventana de contexto del modelo base (32.768 tokens), si esta se ha conservado.
- Asistente de primera linea para consultas legales internas: respuestas de apoyo a un equipo juridico, siempre con supervision humana y sin valor de asesoramiento legal.
- Generacion de borradores de clausulas a partir de plantillas: produccion de texto preliminar que un profesional revisa y edita.
- Extraccion de entidades y metadatos: identificacion de fechas, partes, importes y obligaciones en contratos, como paso previo a un pipeline de gestion documental.
- Ajuste adicional como base de investigacion: al ser un checkpoint de SFT, puede servir como punto de partida para experimentos de fine-tuning sobre dominio legal.
- Generacion conversacional general: uso del componente OASST1 para chat de proposito general, aunque sin garantias de calidad frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de evaluacion (aparece como `[More Information Needed]`) y no se han encontrado tablas de MMLU, HumanEval, GSM8K ni de evaluaciones juridicas especificas para este repositorio.

## Requisitos de hardware

Las siguientes cifras son estimaciones basadas en un modelo de ~7.000 millones de parametros, no en mediciones de este repositorio concreto:

- VRAM para inferencia en fp16/bf16: aproximadamente 15-16 GB solo para los pesos, mas 2-4 GB de cache KV segun longitud de contexto y tamano de lote.
- VRAM en cuantizacion de 8 bits: del orden de 8-9 GB. En 4 bits: del orden de 5-6 GB.
- GPU profesionales: cabe holgadamente en una A100 40 GB, H100 80 GB o L40S 48 GB, incluso en precision completa.
- GPU de consumo: una RTX 4090 (24 GB) ejecutaria el modelo en fp16 con contexto moderado; una RTX 3090 o 4080 (16 GB) requeriria cuantizacion a 8 o 4 bits.
- Despliegue: `transformers` de forma nativa; vLLM o TGI para servicio de alto rendimiento; llama.cpp u Ollama solo si se generan conversiones GGUF, que no se publican en el repositorio.
- Latencia y throughput: no disponibles. Advertencia importante: el repositorio ocupa 0,3 GB, muy por debajo de los ~15 GB de un checkpoint fp16 de 7B. Es probable que contenga un adaptador LoRA o una subida incompleta, en cuyo caso habria que cargar los pesos base por separado y aplicar el adaptador, con sobrecoste de memoria y latencia adicional.

## Comparativa con modelos similares

La comparativa se establece contra el modelo del que probablemente deriva y contra dos alternativas habituales de la misma categoria. Los datos de este repositorio figuran como no disponibles y se usan los del modelo base como referencia orientativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every48 | No disponible (probable ~7,6 mil millones) | No disponible | No disponible | 0 descargas, 0,3 GB en repositorio | Sin model card, sin benchmarks, sin licencia declarada |
| Qwen2.5-7B-Instruct (base) | 7,61 mil millones | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | Muy extendida, con variantes GGUF, AWQ y GPTQ | Rendimiento solido en codigo y matematicas, 29 idiomas |
| Mistral-7B-Instruct-v0.3 | 7,25 mil millones | 32.768 tokens | Apache 2.0 | Amplia, ecosistema maduro | Buen equilibrio tamano/calidad, soporte de tool calling |
| Llama-3.1-8B-Instruct | 8,03 mil millones | 131.072 tokens | Llama 3.1 Community License (con restricciones) | Muy amplia, requiere aceptar la licencia | Mayor contexto nativo, licencia no plenamente permisiva |

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada y no aporta informacion sobre datos, entrenamiento, evaluacion ni uso previsto.
- Licencia no declarada. Sin licencia explicita no hay autorizacion clara para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo. Ademas, la licencia del modelo base (Apache 2.0 en el caso de Qwen2.5) impone sus propias condiciones que este ajuste no puede relajar.
- Riesgo elevado de alucinacion en dominio juridico. Un SFT sobre corpus legal sin evaluacion publicada no garantiza precision normativa, vigencia de la legislacion citada ni adecuacion jurisdiccional. Ninguna salida debe usarse como asesoramiento legal.
- Sesgos desconocidos: no se documenta la composicion del dataset, por lo que no se pueden evaluar sesgos de genero, origen, idioma o jurisdiccion.
- Cobertura idiomatica incierta: si el corpus juridico era monolingue, es probable que el ajuste haya degradado el multilingüismo del modelo base.
- Degradacion potencial de capacidades generales por sobreajuste al dominio legal, especialmente en codigo, matematicas y tool calling.
- Repositorio sospechosamente pequeno (0,3 GB). Existe la posibilidad de que los pesos esten incompletos, sean un adaptador o correspondan a una subida parcial; conviene inspeccionar los archivos antes de asumir que el modelo es cargable de extremo a extremo.
- Naturaleza del checkpoint: el sufijo "every48" sugiere una instantanea intermedia del entrenamiento, no necesariamente la version convergida o con mejor rendimiento.
- Sin trazabilidad de uso: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad.
- Fechas de creacion y actualizacion en los metadatos (2026-10-03) resultan incoherentes con la fecha actual; podrian indicar un error de registro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every48
- Referencia citada en la plantilla de la model card (no relacionada con el modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono referenciada en la plantilla: https://mlco2.github.io/impact#compute
- Modelo base presumible (no confirmado): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset OASST1 (mencionado en el identificador, no confirmado): https://huggingface.co/datasets/OAIS/OpenAssistant/oasst1
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la informacion disponible.
