# zjwan461/jarvis-coder

## Resumen

Jarvis-Coder es un modelo de clasificación binaria de seguridad de código desarrollado por el usuario zjwan461, construido mediante un ajuste fino QLoRA sobre Qwen/Qwen2.5-Coder-1.5B-Instruct. Su única función es determinar si un fragmento de código Python contiene operaciones de sistema peligrosas (borrado de archivos críticos, modificación de configuración del sistema, ejecución de comandos maliciosos, backdoors o shells inversas) y devolver una de dos etiquetas: `DANGEROUS` o `SAFE`. No es un modelo de propósito general, sino un componente especializado dentro del proyecto Python Sandbox, donde actúa como segunda capa de defensa tras una validación estática por expresiones regulares.

La arquitectura subyacente es un transformer causal denso de 1.543.714.304 parámetros (28 capas, dimensión oculta 1536) heredado íntegramente del modelo base de Alibaba. El ajuste se realizó con 4-bit NF4 QLoRA (r=8, alpha=16, target en `q_proj` y `v_proj`), con una longitud máxima de secuencia de 1536 tokens durante el entrenamiento, aunque el modelo base soporta hasta 32.768 tokens de contexto. Los pesos publicados son el resultado de fusionar el adaptador LoRA con el modelo base, en precisión bfloat16 y formato safetensors.

Su relevancia es acotada pero concreta: demuestra un patrón de despliegue de modelos pequeños y especializados como clasificadores de seguridad dentro de pipelines de ejecución de código, con un coste de inferencia mínimo y una licencia Apache-2.0 permisiva. El modelo está entrenado y documentado únicamente en chino, y su rendimiento publicado se limita a un conjunto de test sintético del mismo origen que los datos de entrenamiento, por lo que su utilidad en producción real requiere una reevaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen2ForCausalLM), ajustado como clasificador binario |
| Parametros totales | 1.543.714.304 (aprox. 1,54 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; 1.536 tokens usados en entrenamiento |
| Tipos de cuantizacion | Pesos publicados en bfloat16; el ajuste se realizó con 4-bit NF4 (double quant); no se distribuyen variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | Chino (`zh`) únicamente, según la model card |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, aprox. 3,09 GB) + tokenizer y config completos |

## Arquitectura y entrenamiento

El modelo es un transformer causal estándar de la familia Qwen2, con 28 capas, dimensión oculta de 1536 y aproximadamente 1,54 B de parámetros. Sobre esta base se aplicó un ajuste supervisado con QLoRA en 4 bits NF4 con doble cuantización y cálculo en bfloat16, usando LoRA con r=8, alpha=16, dropout de 0,05 y adaptadores únicamente en las proyecciones `q_proj` y `v_proj`. La configuración de entrenamiento fue de 3 épocas, batch efectivo de 16 (4 por dispositivo con acumulación de gradiente de 4), learning rate de 2e-4, optimizador `paged_adamw_8bit` y longitud máxima de secuencia de 1536 tokens. Tras el entrenamiento, el adaptador se fusionó con `merge_and_unload()` y se exportó el modelo completo en bf16.

La innovación técnica no reside en la arquitectura, sino en el formato de la tarea: el modelo se entrena como continuación de texto puro, no con el chat template de Qwen. Cada muestra se compone de una instrucción en chino, el bloque `###代码片段：` con el código y el bloque `###输出：` seguido de la etiqueta. El corpus de entrenamiento son 3.400 muestras sintéticas generadas mediante una API compatible con OpenAI, divididas en tres categorías: 1.200 operaciones peligrosas reales (con ofuscación mediante variables y concatenación de cadenas), 1.200 muestras de código de negocio normal y 1.000 hard-negatives donde los comandos peligrosos aparecen solo en comentarios, cadenas o nombres de variables sin ejecutarse. Tras el control de calidad, el reparto quedó en 2.720 muestras de entrenamiento, 340 de validación y 340 de test, con una longitud media de código de aproximadamente 535 caracteres. No se documenta uso de RLHF ni DPO.

## Capacidades

- Clasificación binaria de seguridad de código: devuelve `DANGEROUS` o `SAFE` para un fragmento de código Python, con `max_new_tokens=10` y decodificación greedy.
- Detección de operaciones peligrosas concretas: borrado de archivos críticos del sistema, modificación de configuración del sistema, ejecución de comandos maliciosos, shells inversas, escalada de privilegios y manipulación de permisos.
- Robustez frente a ofuscación básica: los datos de entrenamiento incluyen comandos peligrosos construidos mediante variables y concatenación de cadenas.
- Resistencia a falsos positivos por palabras clave: los 1.000 hard-negatives entrenan al modelo para no marcar como peligrosos los comandos que solo aparecen en comentarios, cadenas o identificadores.
- Formato de salida restringido: no genera explicaciones ni razonamiento, solo la etiqueta, lo que simplifica el parseo en servicios.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al chino en las instrucciones; el código evaluado es Python.

## Casos de uso

- Segunda capa de defensa en sandboxes de ejecución de código: el modelo se sitúa detrás de una validación estática por expresiones regulares y, si cualquiera de las dos capas marca el código como peligroso, se rechaza la ejecución. Es el uso para el que fue diseñado dentro del proyecto Python Sandbox.
- Filtrado previo en plataformas de evaluación de código o jueces en línea: antes de ejecutar una solución enviada por un usuario en un contenedor, el modelo puede clasificar el código en unos pocos tokens y bloquear los envíos con operaciones destructivas.
- Moderación de asistentes de código en entornos corporativos: integrado como paso de validación en un pipeline de CI/CD o en un gateway de generación de código, permite rechazar sugerencias que borren archivos del sistema o abran shells inversas antes de que lleguen al desarrollador.
- Análisis de repositorios y dependencias de terceros: con truncado a longitudes manejables, puede preclasificar archivos de `site-packages` o código vendorizado para priorizar la revisión manual de los candidatos sospechosos, aunque la tasa de falsos positivos documentada en código real es alta.
- Enriquecimiento de pipelines de análisis estático: como clasificador semántico complementario a herramientas como Bandit o Semgrep, cubre casos donde la ofuscación por variables y concatenación evade las reglas sintácticas.
- Prototipado de clasificadores de seguridad especializados: sirve como plantilla reproducible de ajuste QLoRA sobre un modelo de código de 1,5 B, con scripts de generación de datos, control de calidad, entrenamiento e inferencia publicados en el repositorio del proyecto.
- Servicio de inferencia ligero en CPU o GPU de gama baja: al tratarse de un modelo de 1,54 B en bf16 (o cuantizable a 4 bits), puede desplegarse como microservicio con latencia baja para clasificación en línea de fragmentos cortos.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test sintético `train/datasets/test.jsonl` (340 muestras, no usado en entrenamiento ni ajuste), con decodificación greedy y `max_new_tokens=10`:

| Construccion de entrada | Accuracy | Recall DANGEROUS | Recall SAFE | FN | FP |
|---|---:|---:|---:|---:|---:|
| Plantilla de entrenamiento + código original con vallas | 100% | 100% | 100% | 0 | 0 |
| Plantilla de inferencia + código original con vallas | 100% | 100% | 100% | 0 | 0 |
| Plantilla de inferencia + código sin vallas | 100% | 100% | 100% | 0 | 0 |

Muestreo fuera de distribución (no es un benchmark, solo referencia del autor):

| Objeto evaluado | Archivos | Marcados DANGEROUS | Observacion |
|---|---:|---:|---|
| Código fuente de librerías Python de terceros (`site-packages`, truncado a 3.000 caracteres) | 96 | 1 (aprox. 1,0%) | Aproximación a la tasa de falsos positivos en código benigno |
| Código fuente del propio proyecto (contiene literales como `DANGEROUS` y `delete_session`) | 27 | 6 (aprox. 22%) | Sensibilidad a vocabulario de seguridad; no representa la tasa general de falsos positivos |

El autor advierte explícitamente de que el 100% corresponde a la distribución de datos sintéticos del mismo origen que el entrenamiento y no debe extrapolarse a código real. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para entradas de hasta 1.536 tokens.
- VRAM estimada con cuantización a 4 bits (no se distribuyen pesos cuantizados, pero puede cuantizarse localmente): en torno a 1 GB para pesos, con un total de 2 a 3 GB incluyendo overhead.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. Cabe holgadamente en GPUs de consumo.
- Despliegue: transformers es la vía documentada y la única garantizada, ya que el modelo requiere `trust_remote_code=True` y una plantilla de prompt específica sin chat template. Es compatible con Text Generation Inference según los tags del repositorio. vLLM, llama.cpp y Ollama no están documentados para este modelo; al ser un transformer Qwen2 estándar con pesos safetensors, vLLM podría cargarlo, pero el parseo de la etiqueta debe hacerse por coincidencia de subcadena sobre la salida generada.
- Latencia y throughput: no se han publicado mediciones. Por el tamaño (1,54 B) y la generación de un máximo de 10 tokens, la latencia esperada por petición es de decenas de milisegundos en GPU moderna, pero es una estimación, no un dato publicado.
- CPU: la inferencia en CPU es viable en bf16 para volúmenes bajos, aunque sin cifras de rendimiento publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jarvis-Coder (zjwan461) | 1,54 B | 32.768 (base); 1.536 en entrenamiento | Clasificación binaria de código peligroso | Apache-2.0 | Hugging Face, 3 descargas |
| Qwen2.5-Coder-1.5B-Instruct (Alibaba) | 1,54 B | 32.768 | Generación y razonamiento de código de propósito general | Apache-2.0 | Hugging Face, ampliamente usado |
| Modelos de moderación de código basados en reglas (Bandit, Semgrep) | No aplica | No aplica | Análisis estático por patrones | Mayoritariamente open source | Amplia adopción en CI/CD |

La comparación directa con otros clasificadores de seguridad de código ajustados no está disponible en la información proporcionada. Frente al modelo base, Jarvis-Coder sacrifica toda capacidad generativa y multilingüe a cambio de una salida restringida y un comportamiento entrenado específicamente para distinguir comandos peligrosos de menciones inocuas; frente a herramientas de análisis estático, aporta una capa semántica que puede captar ofuscación por variables, pero carece de la trazabilidad y las reglas auditables de aquellas.

## Limitaciones y advertencias

- El 100% de accuracy publicado corresponde exclusivamente a un conjunto de test sintético generado con la misma distribución que los datos de entrenamiento; no es una medida válida de rendimiento en código real.
- El muestreo fuera de distribución muestra una tasa de falsos positivos de aproximadamente el 22% en código que contiene vocabulario de seguridad (literales `DANGEROUS`, funciones como `delete_session`), lo que indica sensibilidad a palabras clave en identificadores y cadenas.
- Los datos de entrenamiento son sintéticos, generados por un LLM, no código real de usuarios; pueden no cubrir patrones de ofuscación, lenguajes distintos de Python ni convenciones de código reales.
- El modelo está entrenado y documentado únicamente en chino; las instrucciones en otro idioma quedan fuera de la distribución de entrenamiento.
- No debe usarse con el chat template de Qwen (`<|im_start|>...`): la model card advierte de que esto desvía la entrada de la distribución de entrenamiento.
- La configuración de generación del repositorio tiene la muestreo activado por defecto; es obligatorio usar `do_sample=False` para obtener resultados deterministas y reproducibles.
- El parseo de la etiqueta se hace por coincidencia de subcadena (`"DANGEROUS" in salida.upper()`); cualquier salida generada que contenga esa palabra se clasifica como peligrosa, lo que puede producir falsos positivos si el modelo divaga.
- El modelo no proporciona explicaciones ni justificaciones de su decisión, lo que dificulta la auditoría de los bloqueos en producción.
- Riesgo de alucinación en el sentido de clasificaciones erróneas confiadas: al ser un clasificador, un falso negativo (código peligroso marcado como `SAFE`) es el fallo más grave, y no hay métricas publicadas sobre ese escenario en datos reales.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías y recomienda reevaluar con un conjunto propio de código real antes de desplegar.
- El modelo tiene 3 descargas y 0 likes en el momento de la ficha; no hay evidencia de adopción ni validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zjwan461/jarvis-coder
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio del proyecto Python Sandbox: https://github.com/zjwan461/python-sandbox
- Script de entrenamiento: https://github.com/zjwan461/python-sandbox/blob/main/train/train_sft_lora.py
- Generación de datos: https://github.com/zjwan461/python-sandbox/blob/main/train/generate_dataset.py
- Control de calidad de datos: https://github.com/zjwan461/python-sandbox/blob/main/train/check_dataset.py
- Servicio de inferencia: https://github.com/zjwan461/python-sandbox/tree/main/train/infer
- CodeGuardService (integración Java): https://github.com/zjwan461/python-sandbox/blob/main/python-sandbox/src/main/java/io/github/sandbox/service/CodeGuardService.java
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
