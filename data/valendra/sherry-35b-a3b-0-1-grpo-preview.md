# valendra/sherry-35b-a3b-0.1-grpo-preview

## Resumen

Sherry 35B-A3B 0.1 GRPO Preview es un ajuste fino del modelo base Qwen/Qwen3.6-35B-A3B, publicado por el usuario valendra en HuggingFace. Se trata de una versión preliminar (preview) construida a partir de la fusión, mediante `merge_and_unload()` de PEFT, de un adaptador QLoRA entrenado con GRPO durante 200 pasos sobre un conjunto interno de datos de matemáticas con control de esfuerzo de razonamiento. El resultado se distribuye como pesos completos en safetensors, en precisión bfloat16 y divididos en 16 shards, con un total de 35.106.198.896 parámetros y un repositorio de 70,2 GB.

La relevancia del modelo reside en su interfaz de esfuerzo de razonamiento: el tokenizador incorpora tres tokens especiales propios (`<|reasoning_effort_low|>`, `<|reasoning_effort_medium|>` y `<|reasoning_effort_high|>`) que la plantilla de chat emite antes del bloque de pensamiento según el parámetro `reasoning_effort`. Esto lo convierte en una plataforma experimental para estudiar cómo varía la longitud y la forma del razonamiento en un modelo de arquitectura MoE (mezcla de expertos) según el presupuesto de cómputo asignado.

Conviene subrayar que se trata de una publicación de previsualización: el propio autor advierte de que las evaluaciones disponibles no se utilizaron como referencia de calidad, que la recompensa registrada en los metadatos es una métrica de entrenamiento y no una puntuación de capacidad validada, y que la evaluación independiente está incompleta. El modelo no registra descargas ni likes en el momento de la consulta y no publica datos de benchmarks de terceros, contexto máximo, idiomas soportados ni cuantizaciones oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); etiqueta `qwen3_5_moe` en HuggingFace; compatible con `image-text-to-text` |
| Parametros totales | 35.106.198.896 (~35,1 B) |
| Parametros activos | no disponible (el sufijo "A3B" del nombre sugiere del orden de 3 B activos, sin confirmar en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la unica publicacion son pesos en bfloat16; no se distribuyen GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (16 shards, bfloat16) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Metodo de ajuste | GRPO con QLoRA/LoRA, adaptador fusionado con PEFT `merge_and_unload()` |
| Tamano del repositorio | 70,2 GB |
| Pipeline declarado | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3.6-35B-A3B: un transformer con capas de mezcla de expertos (MoE), etiquetado en HuggingFace como `qwen3_5_moe` y cargable mediante `AutoModelForImageTextToText`, lo que indica compatibilidad con entrada de imagen y texto aunque esta version se entrenó y probó principalmente por la via de generacion de texto. El repositorio ocupa 70,2 GB y los pesos se publican en bfloat16 repartidos en 16 shards, coherente con 35,1 B de parametros totales.

El ajuste se realizo con GRPO sobre un adaptador QLoRA de rango 32 y alpha 64, con dropout 0,0, aplicado a los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj` y a las proyecciones `shared_expert.gate_proj`, `shared_expert.up_proj` y `shared_expert.down_proj`. Se entrenaron 200 pasos y se publicó el checkpoint `checkpoint-200` tras fusionarlo con el modelo base en bfloat16. La innovacion tecnica destacable es la interfaz de esfuerzo de razonamiento: se anadieron tres tokens especiales con IDs 248077, 248078 y 248079 (`low`, `medium`, `high`) que la plantilla de chat inserta antes del bloque de pensamiento. No se proporciona un token `xhigh`. El dataset de entrenamiento es interno y de tematica matematica orientada a esfuerzo de razonamiento; no se detalla su composicion, numero de tokens ni si hubo fases adicionales de alineacion mas alla del propio GRPO.

## Capacidades

- Generacion de texto conversacional, con pipeline declarado `text-generation` y soporte nativo en la libreria `transformers`.
- Razonamiento con esfuerzo controlable: la plantilla de chat acepta `reasoning_effort="low"`, `"medium"` o `"high"` y emite el token correspondiente antes del bloque de pensamiento.
- Modo de pensamiento activable o desactivable mediante `enable_thinking=True/False` en `apply_chat_template`, con respuestas no pensadas cuando se desactiva.
- Razonamiento matematico: el ajuste se realizo sobre datos internos de matematicas con esfuerzo de razonamiento, aunque no se publican puntuaciones que lo cuantifiquen.
- Compatibilidad multimodal a nivel de arquitectura: el modelo base y la clase de carga (`AutoModelForImageTextToText`) admiten entradas de imagen y texto, si bien esta version no fue entrenada ni validada especificamente para vision.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara lista de idiomas.

## Casos de uso

- Investigacion sobre control del esfuerzo de razonamiento: el modelo permite comparar, con el mismo prompt, como varia la longitud y la estructura de la cadena de pensamiento al alternar los niveles `low`, `medium` y `high`, lo que resulta util para estudiar el compromiso entre coste de inferencia y calidad de respuesta.
- Experimentacion academica con GRPO sobre arquitecturas MoE: al conservarse por separado los artefactos del adaptador original y documentarse rango, alpha, modulos objetivo y numero de pasos, sirve como caso reproducible para analizar el efecto del aprendizaje por refuerzo en un MoE de ~35 B.
- Generacion de datos sinteticos de razonamiento etiquetados por esfuerzo: el modelo puede producir trazas de solucion en tres niveles de detalle, utiles para construir datasets de destilacion o para entrenar modelos menores con presupuestos de computo distintos.
- Prototipado de asistentes conversacionales con presupuesto variable: en aplicaciones donde la latencia importa, se puede fijar `reasoning_effort="low"` para consultas simples y reservar `"high"` para casos complejos, usando la misma instancia del modelo.
- Evaluacion de tecnicas de ajuste eficiente en parametros: sirve como referencia practica para medir que se obtiene al fusionar un adaptador LoRA de rango 32 entrenado solo 200 pasos, frente al modelo base sin ajustar.
- Base para experimentos multimodales de laboratorio: dado el etiquetado `image-text-to-text` y la compatibilidad de la clase de carga, permite comprobar hasta que punto el ajuste de texto preserva o degrada el comportamiento multimodal heredado del base.
- Analisis de robustez y comportamiento de modelos preview: util para estudiar como se comporta un checkpoint de previsualizacion con evaluacion incompleta, comparando sus salidas frente al base en tareas de matematicas y razonamiento de varios pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks independientes en la informacion disponible. El unico dato declarado en el `model-index` de la model card es una metrica de entrenamiento, que el propio autor advierte expresamente que no debe interpretarse como una puntuacion de capacidad validada.

| Tarea | Dataset | Metrica | Valor | Notas |
|---|---|---|---|---|
| text-generation | Internal reasoning-effort math data (custom) | Training reward (checkpoint-200) | 2,2144 | Recompensa del ultimo lote registrado; metrica de entrenamiento, no evaluacion independiente; `verified: false` |

Adicionalmente, la model card indica que las ejecuciones de evaluacion disponibles no se usaron como referencia de calidad porque las generaciones cortas de prueba alcanzaron el limite de tokens y la comparativa mas larga se detuvo antes de su publicacion.

## Requisitos de hardware

- Pesos en bfloat16: 35,1 B de parametros equivalen a unos 70,2 GB de pesos, que es exactamente el tamano del repositorio. Con cache KV y activaciones, la inferencia requiere del orden de 80 GB de VRAM o mas.
- Cuantizacion de 8 bits (estimacion calculada a partir del numero de parametros; no hay cuantizaciones oficiales publicadas): aproximadamente 35 GB de pesos, mas overhead, lo que apunta a GPUs de 48 GB como A6000, L40S o A40.
- Cuantizacion de 4 bits (estimacion calculada): aproximadamente 17,5-20 GB de pesos, lo que permitiria ejecucion en GPUs de consumo como RTX 4090 o RTX 3090 de 24 GB, con contexto limitado.
- GPU recomendadas para precision completa: H100 80 GB, A100 80 GB. Para servir el modelo sin cuantizar con contexto amplio puede ser necesario repartir en varias GPUs (por ejemplo, 2 x A100 80 GB o 2 x A6000 48 GB).
- GPU de consumo: no cabe en precision bfloat16 ni en 8 bits en una GPU de 24 GB; si cabe, previsiblemente, en 4 bits, aunque esto requeriria generar una cuantizacion propia.
- Opciones de despliegue: `transformers` con `device_map="auto"` es la via documentada por el autor. vLLM, SGLang o TGI son plausibles para servir el modelo en precision completa, pero no estan confirmados en la informacion disponible. llama.cpp y Ollama no son utilizables directamente porque no se publican pesos GGUF.
- Latencia y throughput: no disponibles. Al tratarse de un MoE, se espera que el coste por token sea inferior al de un modelo denso de 35 B equivalente, pero no se aportan mediciones.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento, contexto ni licencia de modelos alternativos, por lo que la comparativa se limita al propio modelo base y a las diferencias documentadas.

| Modelo | Parametros totales | Contexto | Licencia | Formato | Diferencias clave |
|---|---|---|---|---|---|
| Sherry 35B-A3B 0.1 GRPO Preview | 35.106.198.896 | no disponible | apache-2.0 | safetensors (bfloat16, 16 shards) | Adaptador GRPO+QLoRA fusionado (200 pasos, r=32, alpha=64); tokens de esfuerzo de razonamiento `low`/`medium`/`high`; evaluacion independiente incompleta |
| Qwen/Qwen3.6-35B-A3B (base) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | Modelo de partida sin la interfaz de esfuerzo de razonamiento ni el ajuste GRPO |

No se dispone de datos verificados sobre otros modelos comparables de la misma categoria (MoE de ~30-40 B con licencia permisiva) en la informacion proporcionada, de modo que no se puede completar una comparativa cuantitativa adicional sin inventar cifras.

## Limitaciones y advertencias

- Version de previsualizacion: la evaluacion de calidad independiente esta incompleta y las ejecuciones disponibles se descartaron por problemas de limite de tokens o se interrumpieron.
- La recompensa de entrenamiento registrada (2,2144) no es una puntuacion de precision ni de benchmark; el autor lo advierte de forma explicita. No debe usarse para comparar con otros modelos.
- La longitud y la calidad de las generaciones pueden variar segun el nivel de esfuerzo de razonamiento y el prompt, sin que existan todavia mediciones que acoten esa variabilidad.
- No se documentan sesgos conocidos, pero al no publicarse composicion del dataset de entrenamiento ni evaluaciones de sesgo, cualquier despliegue deberia auditarlos por cuenta propia.
- Riesgo de alucinacion inherente a los modelos generativos y agravado por la ausencia de benchmarks de fidelidad y de evaluaciones independientes.
- La ventana de contexto y los idiomas soportados no se detallan, por lo que no se puede garantizar un comportamiento correcto en contextos largos ni en idiomas distintos del mayoritario en los datos de entrenamiento, presumiblemente ingles.
- La compatibilidad multimodal es heredada de la arquitectura del base, pero este ajuste solo se entreno y probo por la via de texto: no hay garantias sobre el rendimiento en tareas de vision.
- Restricciones de licencia: los pesos se publican bajo apache-2.0, pero el autor remite a la licencia y a los requisitos de uso del modelo base, que deben verificarse antes de un uso comercial.
- Ausencia de cuantizaciones oficiales (GGUF y similares) y de integracion en herramientas de despliegue habituales, lo que anade trabajo de ingenieria para llevarlo a produccion.
- Perfil de adopcion nulo: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya validado el comportamiento del modelo.
- Uso previsto declarado por el autor: investigacion y experimentacion con esfuerzo de razonamiento controlable, validando las salidas para cada caso antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/valendra/sherry-35b-a3b-0.1-grpo-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Imagen del proyecto referenciada en la model card: https://huggingface.co/valendra/sherry-35b-a3b-0.1-grpo-preview/resolve/main/image.png
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: los resultados obtenidos fueron paginas sin relacion con inteligencia artificial ni con el modelo evaluado (contenido en chino sobre consultas judiciales, Adobe Illustrator, Excel, tallas de ropa y niveles educativos), por lo que no se incluyen.
