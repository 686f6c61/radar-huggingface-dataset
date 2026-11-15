# yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_listwise_title_5k_seed123

## Resumen

El modelo `yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_listwise_title_5k_seed123` es un adaptador LoRA entrenado sobre el modelo base `google/gemma-4-E4B-it`, orientado especificamente a la tarea de descubrimiento de citas (citation discovery) dentro de la competicion SCIDOCA 2025 (Task 1). Lo desarrolla el usuario de Hugging Face `yennhi0907` como componente principal del sistema CiteDuoWise, descrito en su model card como parte de una tesis. No se trata de un modelo de proposito general, sino de un ajuste fino especializado en puntuar y clasificar candidatos a citas academicas.

Tecnicamente, el adaptador implementa un enfoque listwise: se construye un unico prompt por parrafo que incluye todos los titulos candidatos, y el modelo emite una respuesta binaria Yes/No por cada slot candidato. El entrenamiento se realizo sobre el split Train-5k (5.000 parrafos con todos sus candidatos), con permutacion aleatoria del orden de candidatos por parrafo y epoca, longitud maxima de 8.192 tokens y 2 epocas con bf16 y gradient checkpointing.

Su relevancia es acotada pero clara: es un artefacto de investigacion reproducible (semilla 123, hashes sha256 publicados, codigo en GitHub) que demuestra como adaptar un modelo Gemma-4 de la familia E4B a una tarea concreta de recuperacion de citas mediante PEFT/LoRA con rango 16. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, y no se han publicado benchmarks ni resultados de evaluacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (modelo base `google/gemma-4-E4B-it`); rango r=16, alpha=32, dropout=0.05, modulos objetivo `k_proj`, `o_proj`, `q_proj`, `v_proj` |
| Parametros totales | No disponible (solo se distribuye el adaptador LoRA; el modelo base Gemma-4 E4B no se detalla en la informacion) |
| Parametros activos | No aplica (modelo base no descrito como MoE en la informacion proporcionada) |
| Longitud de contexto | 8.192 tokens (MAX_LEN usado en el entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors sin cuantizacion; el base admite las del ecosistema Gemma, no confirmado) |
| Idiomas soportados | No disponible |
| Licencia | `gemma` (Gemma License) |
| Formato de pesos | safetensors (adaptador PEFT); incluye `adapter_config.json`, `adapter_model.safetensors`, `chat_template.jinja`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

El adaptador se monta sobre `google/gemma-4-E4B-it`, un modelo de la familia Gemma-4 en su variante E4B (orientada a eficiencia). El ajuste se realiza con PEFT/LoRA de rango 16 y alpha 32, aplicando las matrices de bajo rango unicamente a las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`), lo que mantiene congelados los pesos del modelo base y reduce drasticamente el numero de parametros entrenables. El repositorio pesa 0,1 GB, coherente con un adaptador y sus ficheros auxiliares, no con un modelo completo.

El entrenamiento se ejecuto sobre el split "Train-5k" limpio (5.000 parrafos con todos sus candidatos), con formulacion listwise: un unico prompt por parrafo contiene todos los titulos candidatos y el modelo emite Yes/No por slot. Se aplico permutacion aleatoria del orden de candidatos por parrafo y por epoca para evitar sesgos posicionales. Hiperparametros: MAX_LEN 8192, learning rate 2e-4 con scheduler cosine y warm-up del 10%, batch efectivo 1 x 16 (acumulacion), 2 epocas, bf16, gradient checkpointing y seleccion del mejor checkpoint por F1 de validacion. La semilla es 123. El autor publica hashes sha256 de todos los ficheros para verificacion de integridad.

## Capacidades

- Puntuacion listwise de candidatos a cita: genera una respuesta Yes/No por cada titulo candidato presente en el prompt.
- Descubrimiento de citas academicas: identifica que titulos de una lista son citados por un parrafo dado.
- Procesamiento de prompts largos: soporta hasta 8.192 tokens, suficiente para parrafos con muchos candidatos.
- Robustez posicional: entrenado con permutacion de candidatos, lo que reduce el sesgo hacia posiciones concretas de la lista.
- Ajuste eficiente mediante LoRA: el adaptador puede cargarse sobre el modelo base con PEFT sin reentrenar pesos completos.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Descubrimiento de citas en articulos cientificos: dado un parrafo y una lista de titulos candidatos, el adaptador puntua cada uno y devuelve Yes/No, permitiendo construir un pipeline de recomendacion de referencias bibliograficas.
- Verificacion de atribucion en revision por pares: integrado en CiteDuoWise, ayuda a comprobar si un parrafo cita correctamente los trabajos que declara.
- Construccion de bases de conocimiento bibliograficas: permite enlazar texto de manuscritos con entradas de un repositorio de titulos, alimentando grafos de citas.
- Investigacion en recuperacion de informacion: sirve como componente listwise reproducible (semilla, hashes, codigo publicados) para experimentos academicos sobre citation discovery.
- Experimentos de ablation con PEFT: al ser un LoRA de rango 16 sobre Gemma-4 E4B, es util para comparar estrategias de ajuste eficiente frente a otros adaptadores de la misma familia.
- Reproduccion de resultados SCIDOCA 2025: el autor publica el protocolo, los logs y el codigo, lo que permite replicar el componente principal del sistema CiteDuoWise en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base `google/gemma-4-E4B-it`, del que no se detalla tamano en la informacion. El adaptador LoRA en si ocupa ~0,1 GB y no incrementa de forma significativa los requisitos del base.
- GPU recomendadas: no disponibles para el modelo base en la informacion proporcionada; para el adaptador no se requiere hardware especifico mas alla de lo que exija Gemma-4 E4B.
- Cabe en GPU consumer: no disponible (depende del base; E4B sugiere una variante orientada a eficiencia, pero no se confirman requisitos).
- Opciones de despliegue: carga mediante PEFT sobre el modelo base; el repositorio incluye `chat_template.jinja` y tokenizer, lo que facilita su uso con librerias compatibles con transformers/PEFT. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada adaptadores comparables de la misma categoria (citation discovery con LoRA sobre Gemma-4 E4B) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Artefacto de investigacion: 0 descargas y 0 likes en Hugging Face; no hay evidencia de uso en produccion ni validacion externa.
- Sin benchmarks publicados: no se puede confirmar su calidad frente a alternativas; el unico criterio de seleccion declarado es la F1 de validacion durante el entrenamiento.
- Dominio muy restringido: solo realiza puntuacion Yes/No de titulos candidatos; no genera texto libre, no razona de forma general ni soporta tool calling.
- Dependencia del modelo base: su comportamiento esta ligado a `google/gemma-4-E4B-it`; cualquier cambio de version o cuantizacion del base puede alterar resultados.
- Licencia `gemma`: el uso comercial esta sujeto a los terminos de la Gemma License, que imponen restricciones y obligaciones especificas; revisar antes de desplegar.
- Riesgo de alucinacion: aunque la tarea es de clasificacion, el modelo puede emitir Yes/No inconsistentes en candidatos ambiguos o parrafos con mas de 8.192 tokens (fuera de su ventana de entrenamiento).
- Idiomas no documentados: no se especifica que lenguas cubre el ajuste; el entrenamiento se realizo presumiblemente sobre datos en un idioma no indicado, lo que limita su uso multilingue.
- Sesgo posicional residual: a pesar de la permutacion durante el entrenamiento, no se han publicado analisis de robustez frente al orden de candidatos en inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_listwise_title_5k_seed123
- Repositorio de codigo, prompts, split y evaluacion: https://github.com/tathiyennhi/automatic-citation-checking (paquete `citeduowise/`)
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
