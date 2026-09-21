# vanishingradient/safety-drift-benign_alpaca

## Resumen

`vanishingradient/safety-drift-benign_alpaca` es un adaptador LoRA publicado en HuggingFace por el usuario `vanishingradient`, entrenado sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. No se trata de un modelo completo, sino de un ajuste fino parametrizado de tipo PEFT que debe cargarse junto con los pesos del modelo base. El repositorio se creó el 21 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes", con un tamaño declarado de 0,0 GB.

La relevancia del artefacto parece ser de investigación más que de producto. El propio identificador ("safety-drift-benign_alpaca") sugiere un experimento sobre deriva de seguridad (*safety drift*) provocada por un ajuste fino con datos benignos, en este caso presumiblemente de estilo Alpaca, aunque el autor no confirma esta interpretación en ningún momento. La model card es la plantilla genérica de HuggingFace sin rellenar: todos los campos figuran como `[More Information Needed]`, incluyendo desarrollador, licencia, idiomas, datos de entrenamiento y evaluación.

Por tanto, esta ficha describe principalmente el modelo base subyacente (Qwen2.5-7B-Instruct, transformer decoder-only de 7.610 millones de parámetros y 131.072 tokens de contexto) y señala explícitamente qué información sobre el adaptador no está disponible. Cualquier uso en producción debería considerarse prematuro hasta que el autor publique pesos verificables, hiperparámetros y resultados de evaluación.

## Especificaciones tecnicas

Las filas marcadas como "(modelo base)" describen `Qwen/Qwen2.5-7B-Instruct`, del que depende el adaptador; el autor del adaptador no las confirma para su artefacto.

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only causal con RoPE, SwiGLU, RMSNorm y Grouped Query Attention (modelo base) |
| Parametros totales | Adaptador: no disponible. Modelo base: 7.610 millones (7,61 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Adaptador: no disponible. Modelo base: 131.072 tokens (128 K), con generacion de hasta 8.192 tokens |
| Tipos de cuantizacion | Adaptador: safetensors en precision del entrenamiento (no confirmada). Modelo base: fp16, bf16, GPTQ-Int8/Int4, AWQ, GGUF (Q2 a Q8) |
| Idiomas soportados | No disponibles en la model card. Modelo base: mas de 29 idiomas, incluidos ingles, chino, espanol, frances, aleman, portugues, italiano, ruso, japones, coreano y arabe |
| Licencia | No disponible (el campo de la model card esta vacio). Modelo base: Apache 2.0 |
| Formato de pesos | Adaptador PEFT en `safetensors` (libreria `peft`, version de framework declarada: PEFT 0.19.1) |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Tamano del repositorio | 0,0 GB (el repositorio podria no contener los pesos del adaptador; conviene verificar la lista de ficheros) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 |
| Ultima actualizacion | 2026-09-21 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) que modifica las matrices de atencion y/o proyeccion del modelo base Qwen2.5-7B-Instruct. Qwen2.5-7B-Instruct es un transformer decoder-only de 28 capas, 3.584 dimensiones ocultas, 28 cabezas de consulta y 4 cabezas de clave/valor (GQA), con vocabulario de 151.643 tokens y ventana de contexto nativa de 131.072 tokens. La innovacion diferencial de la familia Qwen2.5 respecto a Qwen2 esta en el volumen y la calidad de los datos de preentrenamiento (18 billones de tokens declarados por el equipo de Qwen, con filtrado mas agresivo de datos sinteticos y mejora en matematicas y codigo), seguida de un pipeline de alineacion con SFT y optimizacion por preferencias.

Sobre el adaptador en si no hay absolutamente ningun dato tecnico publicado. Se desconocen el rango (`r`), el `lora_alpha`, el `dropout`, los modulos objetivo, la tasa de aprendizaje, el numero de pasos, el numero de epocas, el hardware utilizado y la composicion exacta del dataset de ajuste. El nombre "benign_alpaca" apunta a un corpus de instrucciones de estilo Alpaca (instrucciones, entradas y salidas) sin contenido malicioso, pero es una inferencia a partir del identificador, no una afirmacion del autor. El unico tag de tipo paper presente en el repositorio, `arxiv:1910.09700`, corresponde a Lacoste et al. (2019) sobre estimacion de emisiones de carbono y proviene de la plantilla de model card, no de un articulo asociado a este adaptador. Tampoco hay evidencia de que se haya aplicado RLHF o DPO especifico sobre el adaptador.

## Capacidades

Las capacidades efectivas del adaptador no estan documentadas. Como referencia, el modelo base Qwen2.5-7B-Instruct ofrece:

- Generacion de texto conversacional multi-turno con plantilla de chat propia.
- Razonamiento aritmetico y resolucion de problemas matematicos de varios pasos.
- Generacion y explicacion de codigo en lenguajes habituales, con soporte para completado y refactorizacion.
- Comprension y produccion en mas de 29 idiomas, con rendimiento variable segun el idioma.
- Soporte de *tool calling* / *function calling* estructurado en JSON.
- Capacidad de operar en flujos de agente con razonamiento multi-paso y uso de herramientas.
- Generacion estructurada (JSON, tablas, listas, plantillas) y seguimiento de instrucciones largas.
- Ventana de contexto de 131.072 tokens para documentos extensos o historiales largos.

Capacidades especificas del adaptador: no disponibles. En particular, se desconoce si el ajuste LoRA preserva el soporte de *tool calling*, la calidad multilingue o el comportamiento de rechazo ante peticiones daninas. Dado que el identificador apunta a un estudio de "deriva de seguridad", es plausible (pero no confirmado) que el ajuste altere los rechazos del modelo base; seria un artefacto de investigacion mas que un componente listo para produccion.

## Casos de uso

- Estudio academico de *safety drift*: el adaptador permitiria reproducir experimentos sobre como un ajuste fino con datos benignos degrada las barreras de seguridad de un modelo alineado. Es el uso mas coherente con el nombre del artefacto, siempre que el autor publique los pesos y la receta de entrenamiento.
- Red teaming y evaluacion de alineacion: serviria como variante controlada frente al modelo base para medir diferencias en tasas de rechazo, toxicidad o cumplimiento de peticiones daninas con un mismo conjunto de pruebas.
- Linea base en experimentos de comparacion: en un pipeline que entrene varios adaptadores sobre Qwen2.5-7B-Instruct (benigno, adversario, mixto), este podria actuar como condicion "benigna" de referencia.
- Docencia sobre PEFT: util como ejemplo practico de adaptador LoRA de pocos megabytes para explicar carga, fusion de pesos y despliegue con la libreria `peft`, aunque el repositorio figure a 0,0 GB.
- Reproducibilidad de resultados: para grupos que investiguen la robustez de la alineacion, un adaptador publico con nombre descriptivo permite repetir o refutar conclusiones de terceros.
- Auditoria de artefactos del ecosistema HuggingFace: sirve como caso de estudio de model cards vacias, adaptadores sin pesos y riesgos de trazabilidad en el ecosistema de modelos abiertos.

Uso en produccion: no recomendado con la informacion disponible. No hay licencia declarada, no hay evaluaciones y no se conoce el contenido exacto del dataset de ajuste, lo que impide cualquier analisis de riesgo o de cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye ninguna seccion de evaluacion cumplimentada y el autor no reporta metricas de MMLU, HumanEval, GSM8K ni de seguridad.

Tampoco se dispone de mediciones de latencia o *throughput* especificas del adaptador. Para el rendimiento del modelo base deben consultarse las cifras publicadas por el equipo de Qwen en su model card oficial y en el informe tecnico de Qwen2.5, que no se reproducen aqui para no introducir datos no verificados en esta ficha.

## Requisitos de hardware

Estimaciones orientativas derivadas del modelo base de 7,61 B de parametros; no estan medidas sobre este adaptador.

- VRAM para los pesos en fp16/bf16: aproximadamente 15,2 GB (7,61 B x 2 bytes), mas cache KV.
- VRAM para cuantizacion de 8 bits: en torno a 8-9 GB de pesos.
- VRAM para cuantizacion de 4 bits (GPTQ, AWQ o NF4): en torno a 4,5-5,5 GB de pesos.
- Cache KV con contexto completo de 131.072 tokens en fp16: aproximadamente 7,5 GB adicionales, gracias al uso de GQA (4 cabezas KV, 28 capas, dimension de cabeza 128). Con contextos de 8.000 a 32.000 tokens el consumo baja proporcionalmente a menos de 2 GB.
- GPU profesionales: el modelo base se ejecuta con holgura en A100 40/80 GB, H100 80 GB y L40S 48 GB, incluso con lotes grandes y contexto largo.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar el modelo en fp16 con contexto moderado; una RTX 4080/4070 Ti de 12-16 GB requiere cuantizacion de 8 o 4 bits; tarjetas de 8 GB solo admiten 4 bits con contexto reducido.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en caliente (servir varias LoRA sobre un mismo modelo base); llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y exportar a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este artefacto.
- Nota critica: el tamano del repositorio figura como 0,0 GB, por lo que es posible que los pesos del adaptador no esten subidos y el modelo no sea cargable. Debe comprobarse la lista de ficheros (`adapter_config.json` y `adapter_model.safetensors`) antes de planificar cualquier despliegue.

## Comparativa con modelos similares

No existen alternativas directamente comparables a este adaptador concreto, porque se desconoce su contenido. La tabla compara el artefacto con el modelo base y con otros modelos instruct de tamano similar que podrian actuar como sustitutos funcionales.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| safety-drift-benign_alpaca (adaptador LoRA) | No disponible (base: 7,61 B) | No disponible (base: 131.072) | No disponible | safetensors PEFT | No publicado |
| Qwen2.5-7B-Instruct (base) | 7,61 B | 131.072 | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ | Cifras publicadas por el equipo de Qwen |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Apache 2.0 | safetensors, GGUF | Cifras publicadas por Mistral AI |
| Llama-3.1-8B-Instruct | 8,03 B | 131.072 | Licencia comunitaria Llama 3.1 (con restricciones) | safetensors, GGUF | Cifras publicadas por Meta |
| Gemma-2-9B-it | 9,24 B | 8.192 | Licencia Gemma (con restricciones) | safetensors, GGUF | Cifras publicadas por Google |

Diferencias clave: el adaptador hereda la licencia del modelo base solo si el autor la declara, y en este caso no hay ninguna licencia indicada, lo que impide su uso comercial con garantias. Frente a Mistral-7B-Instruct-v0.3, el modelo base Qwen2.5 ofrece una ventana de contexto cuatro veces mayor; frente a Gemma-2-9B-it, la licencia Apache 2.0 del base es menos restrictiva.

## Limitaciones y advertencias

- Informacion practicamente inexistente: la model card es la plantilla por defecto, con todos los campos en `[More Information Needed]`. No hay desarrollador identificado, ni descripcion, ni guia de uso.
- Licencia no declarada: no puede asumirse que herede Apache 2.0 del modelo base. Sin licencia explicita, el uso comercial es juridicamente arriesgado.
- Repositorio de 0,0 GB: es probable que los pesos del adaptador no esten publicados. Verificar antes de cualquier intento de carga.
- Cero descargas y cero validaciones: no hay evidencia de que el artefacto haya sido probado por terceros ni de que funcione como se espera.
- Deriva de seguridad: si el nombre refleja el experimento, el ajuste podria haber reducido la tasa de rechazo del modelo base ante peticiones daninas. No hay evaluaciones que cuantifiquen este efecto, ni en una direccion ni en la otra.
- Riesgo de alucinacion: no evaluado. El modelo base Qwen2.5-7B-Instruct puede generar contenido factualmente incorrecto con fluidez, especialmente en dominios especializados y en idiomas con menos cobertura.
- Idiomas: no declarados para el adaptador. Aunque el base cubre mas de 29 idiomas, un ajuste fino con datos casi con seguridad solo en ingles degrada el rendimiento en el resto de lenguas y puede inducir respuestas en ingles ante entradas en espanol.
- Sesgos: no analizados. Sin informacion sobre la composicion del dataset de ajuste no es posible evaluar sesgos demograficos, culturales o linguisticos introducidos por el LoRA.
- Caveat para produccion: no desplegar en entornos con usuarios reales sin auditoria previa de comportamiento, licencia, calidad multilingue y cumplimiento normativo (por ejemplo, requisitos de transparencia del Reglamento europeo de IA).
- Trazabilidad: el tag `arxiv:1910.09700` apunta a un trabajo sobre calculo de emisiones, no a un articulo sobre este modelo. No debe citarse como referencia metodologica del adaptador.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/vanishingradient/safety-drift-benign_alpaca
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de PEFT (libreria declarada por el autor): https://github.com/huggingface/peft
- Documentacion de PEFT: https://huggingface.co/docs/peft/index
- Blog oficial de la familia Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Articulo referenciado en los tags (calculo de impacto en carbono, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico: https://mlco2.github.io/impact
- Nota sobre las busquedas web: los resultados recuperados en la busqueda no guardan relacion con el modelo (se refieren a convocatorias de huelgas de transporte en Italia en septiembre de 2026). No se ha encontrado ninguna fuente adicional sobre este adaptador.
