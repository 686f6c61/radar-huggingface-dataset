# Tilakoid/qwen3-1.7b-vscode-triage-lora

## Resumen

Tilakoid/qwen3-1.7b-vscode-triage-lora es un adaptador LoRA de PEFT sobre el modelo base Qwen/Qwen3-1.7B, entrenado para una tarea muy concreta: clasificar issues de GitHub del repositorio de VS Code en exactamente una de dos categorías, `bug` o `feature-request`. No hay cabeza clasificadora: la etiqueta se decodifica de forma generativa a partir del modelo base instruido, con decodificación greedy y un máximo de 12 tokens nuevos.

El adaptador es de rango 16 con alpha 32, dropout 0 y bias `none`, y aplica sobre los siete módulos de proyección del bloque transformer (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). Se entrenó en bf16 con 1.593 ejemplos durante 3 épocas, en el checkpoint-600, y el peso publicado (`adapter_model.safetensors`, 69.782.384 bytes) ocupa solo 0,1 GB de repositorio. La licencia es Apache 2.0.

Su relevancia es acotada pero clara: demuestra una aproximación generativa al triaje de issues usando un modelo denso de 1,7B parámetros que cabe en GPU de consumo, con un 90% de exactitud estricta sobre un conjunto de test público congelado de 200 filas. Es un artefacto de nicho, con cero descargas y cero likes en el momento de redactar esta ficha, y con una trazabilidad de procedencia que el propio autor clasifica como clase C (no autenticado como el adaptador que produjo el benchmark histórico del 89%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso de la familia Qwen3; sin cabeza clasificadora, salida generativa |
| Parametros totales | Adaptador: 69.782.384 bytes en safetensors; modelo base Qwen/Qwen3-1.7B: 1,7 mil millones (aproximado, segun nomenclatura del modelo base) |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No especificada en la model card del adaptador. El limite practico documentado en la evaluacion es de 1800 tokens de issue. El modelo base Qwen3-1.7B declara 32.768 tokens de contexto nativo |
| Tipos de cuantizacion | No disponible. El adaptador se publica en precision completa (entrenado en bf16); no se documentan versiones cuantizadas del adaptador (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponible (los metadatos de HuggingFace no declaran idiomas; el dataset de entrenamiento es de issues de VS Code, mayoritariamente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT; solo `adapter_model.safetensors`). No se publican ficheros de tokenizer |
| Modelo base | Qwen/Qwen3-1.7B, revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e` |
| Dataset de entrenamiento | Tilakoid/vscode-bug-feature-triage (1.593 ejemplos de entrenamiento) |
| Configuracion LoRA | rango 16, alpha 32, dropout 0, bias `none`, modo inferencia activado |
| Modulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Formato de la tarea | Clasificacion binaria generativa: `bug` o `feature-request` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only denso de Qwen3 en su variante de 1,7B parametros, sobre el que se aplica un adaptador PEFT LoRA de tipo `CAUSAL_LM`. El adaptador modifica las proyecciones de atencion y del MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) con rango 16 y alpha 32, es decir, un escalado efectivo de 2. El entrenamiento se realizo en bf16 sobre 1.593 ejemplos durante 3 epocas, publicandose el checkpoint-600. No se documenta uso de RLHF, DPO ni decodificacion especulativa; la innovacion es puramente la aplicacion de instruccion generativa a una tarea de clasificacion, con `enable_thinking=False` para evitar el modo de razonamiento extendido de Qwen3.

La model card dedica una seccion notable a la procedencia, y conviene leerla con atencion. Se distinguen tres referencias de modelo base: el `unsloth/Qwen3-1.7B` flotante que aparecia en el `adapter_config.json` original, un espejo de entrenamiento reconstruido (`unsloth/Qwen3-1.7B@6262b50d...`) y la base operativa de publicacion (`Qwen/Qwen3-1.7B@70d244cc...`). Los tensores comunes se verificaron equivalentes, y el autor declara explicitamente que la revision oficial no se reivindica como procedencia de entrenamiento. El `adapter_config.json` publicado solo cambia `base_model_name_or_path` y `revision`; el resto de campos se preserva del original. La procedencia se clasifica como clase C: es un checkpoint-600 existente e independiente, no autenticado ni como el adaptador que produjo el benchmark final del 89% ni como el adaptador standalone del 90% comprometido en el repositorio.

## Capacidades

- Clasificacion generativa de issues de GitHub en dos etiquetas: `bug` y `feature-request`.
- Generacion de texto restringida a la etiqueta: la salida se decodifica y se compara por coincidencia exacta con la cadena de etiqueta.
- Manejo de issues largos: la evaluacion permite hasta 1800 tokens de issue de entrada.
- Control del modo de razonamiento: se ejecuta con `enable_thinking=False`, lo que evita cadenas de pensamiento y mantiene la respuesta en 12 tokens nuevos como maximo.
- Decodificacion determinista: la evaluacion usa decodificacion greedy (`do_sample=False`), lo que hace que las predicciones sean reproducibles.
- Capacidad multilingue: no documentada especificamente; heredada del modelo base Qwen3, no medida sobre este adaptador.
- Tool calling / function calling: no disponible; no documentado ni evaluado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no aplica al alcance declarado; el autor restringe explicitamente el uso a una tarea de clasificacion.
- Vision, audio u otras modalidades: no disponibles; el modelo base es exclusivamente de texto.
- Prediccion de severidad, asignacion de desarrollador o enrutado de issues mas alla de las dos etiquetas: explicitamente fuera de alcance.

## Casos de uso

- Triaje automatico de issues en el repositorio de VS Code: el modelo recibe el cuerpo del issue (hasta 1800 tokens) y devuelve `bug` o `feature-request` para preetiquetar antes de la revision humana. Es el unico escenario con evaluacion publicada y con un 100% de tasa de etiqueta valida sobre 200 casos.
- Prefiltrado en colas de soporte tecnico: desviar automaticamente tickets de error frente a peticiones de funcionalidad en un sistema de gestion, reduciendo el trabajo manual de primera linea.
- Enrutado de issues hacia plantillas de respuesta distintas: una etiqueta `bug` puede disparar una plantilla de reproduccion y una `feature-request` una plantilla de propuesta de diseno.
- Etiquetado asistido en herramientas internas de mantenimiento: integrado como paso previo a la revision de mantenedores, con la etiqueta final siempre validada por una persona dado el 10% de error observado.
- Generacion de datos de entrenamiento para un clasificador discriminativo: usar el adaptador como anotador automatico sobre un corpus grande de issues y luego entrenar un modelo mas pequeno y barato, filtrando por confianza.
- Prototipado rapido de triaje en un repositorio propio: como punto de partida reproducible (pesos de 0,1 GB, licencia Apache 2.0), asumiendo que la transferencia de dominio a otros repositorios no esta establecida y requerira validacion.
- Experimentos de investigacion sobre clasificacion generativa: comparar la formulacion generativa con `enable_thinking=False` frente a una cabeza clasificadora clasica sobre el mismo backbone de 1,7B.

## Benchmarks y rendimiento

Evaluacion fresca y especifica del adaptador, sin delta respecto a una linea base. Evaluador en el commit `3e692b556c2e6e8afc0d676f73b390a734a5bc7a`, configuracion congelada con SHA-256 `10c3d896f8b9498959896435eeef38138fee02f6a986fa755b79ad8664969f03`, base `Qwen/Qwen3-1.7B@70d244cc...` y conjunto de test de 200 filas (SHA-256 `9fc58e7070c327adaa7b522cf1cd530b90c077dbd54513d00ea31dead5712025`, revision de dataset `15c7d77e083d0cd30ae84cc5de6add1dce6cf950`). Decodificacion greedy, `max_new_tokens=12`, hasta 1800 tokens de issue.

| Metrica | Resultado |
|---|---|
| Exactitud estricta | 90% (180/200) |
| Exactitud semantica | 90% (180/200) |
| Tasa de etiqueta valida | 100% (200/200) |
| Recall de `bug` | 93% |
| Recall de `feature-request` | 87% |

Matriz de confusion (filas = etiqueta real):

| Real | Predicho `bug` | Predicho `feature-request` | Predicho invalido |
|---|---|---|---|
| `bug` | 93 | 7 | 0 |
| `feature-request` | 13 | 87 | 0 |

Notas de reproducibilidad declaradas por el autor: los campos de prediccion deterministas coinciden con un CSV local antiguo no rastreado en 200/200 filas, y las comparaciones historicas comprometidas coinciden en 198/200 filas cada una. Los ficheros no se reivindican como byte-identicos y las metricas en bruto y los ficheros de prediccion no se incluyen en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB para los pesos del modelo base en bf16/fp16, mas unos 70 MB del adaptador; con 1800 tokens de entrada y 12 de salida, la cache KV es marginal. Presupuesto practico de 5-6 GB en bf16.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 son suficientes con margen amplio. En el entorno profesional, A100 o H100 resultan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si. Es un adaptador sobre un modelo denso de 1,7B, por lo que 6-8 GB de VRAM son suficientes para el pipeline documentado.
- Opciones de despliegue: la model card solo documenta `transformers` + `peft` (`AutoModelForCausalLM.from_pretrained` con `dtype=torch.bfloat16` y `device_map="auto"`, mas `PeftModel.from_pretrained`). No se documenta despliegue con vLLM, TGI, llama.cpp ni Ollama para este adaptador, y al no publicarse ficheros de tokenizer la conversion a GGUF requeriria pasos adicionales no descritos.
- Latencia y throughput: no disponibles. La unica referencia operativa es la configuracion de decodificacion (greedy, maximo 12 tokens nuevos) y el limite de 1800 tokens de entrada.
- Requisito de version del modelo base: es imprescindible cargar la revision exacta `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e` y su tokenizer oficial, ya que el repositorio excluye intencionadamente `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja`.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada. La tabla siguiente recoge unicamente lo que puede afirmarse con la informacion disponible.

| Modelo | Parametros | Contexto | Rendimiento en triaje VS Code | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tilakoid/qwen3-1.7b-vscode-triage-lora (este adaptador) | Adaptador de 69.782.384 bytes sobre base de 1,7B | 1800 tokens documentados en evaluacion | 90% de exactitud estricta, 100% de etiqueta valida (200 filas) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3-1.7B sin adaptador (linea base) | 1,7B | 32.768 tokens nativos | No disponible: el autor no reporta delta respecto a la linea base | Apache 2.0 | HuggingFace (modelo base oficial) |
| Otros adaptadores de triaje de issues | No disponible | No disponible | No disponible | No disponible | No se han encontrado alternativas comparables en la busqueda realizada |

## Limitaciones y advertencias

- Alcance extremadamente restringido: un unico repositorio (VS Code) y dos etiquetas (`bug`, `feature-request`). No hay prediccion de severidad, asignacion de desarrollador ni enrutado mas alla de esas dos clases.
- Transferencia de dominio no establecida: el autor indica explicitamente que el comportamiento sobre otros repositorios o gestores de issues no esta demostrado. Usarlo fuera de VS Code requiere revalidacion.
- Salida generativa: la exactitud estricta depende de que la decodificacion coincida exactamente con la cadena de etiqueta. Aunque la tasa de etiqueta valida fue del 100% en el test, cualquier cambio de prompt o de plantilla de chat puede degradarla.
- Evaluacion de una sola ejecucion: no hay estimacion de varianza entre semillas ni entre ejecuciones, por lo que el 90% debe tratarse como un valor puntual sin intervalos de confianza.
- Errores desbalanceados: sobre 200 casos, 7 `bug` se clasificaron como `feature-request` y 13 `feature-request` como `bug`. La clase `feature-request` tiene peor recall (87%) que `bug` (93%).
- Procedencia clase C: el autor declara que este checkpoint no esta autenticado ni como el adaptador que produjo el benchmark final del 89% ni como el adaptador standalone del 90%. La base de publicacion no se reivindica como procedencia de entrenamiento.
- Sin tokenizer publicado: es obligatorio usar el tokenizer oficial de la revision fijada del modelo base. Omitir la revision puede alterar el comportamiento.
- Sin material de reproducion en el repositorio: las metricas en bruto y los ficheros de prediccion no se incluyen, y el enlace al repositorio de benchmark aparece truncado en la informacion disponible.
- Riesgo de alucinacion: no evaluado de forma especifica en la model card, pero persiste como riesgo inherente al usar un modelo generativo en lugar de un clasificador discriminativo.
- Idiomas: no declarados en los metadatos. El dataset de entrenamiento procede de issues de VS Code, mayoritariamente en ingles; el rendimiento en otros idiomas no esta medido.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de redactar la ficha, sin evidencia de uso en produccion por terceros.
- Licencia: Apache 2.0 para el adaptador, lo que permite uso comercial. Conviene verificar por separado los terminos del modelo base Qwen/Qwen3-1.7B y del dataset utilizado.
- Sesgos conocidos: no documentados en la informacion proporcionada.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Tilakoid/qwen3-1.7b-vscode-triage-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B (revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`)
- Dataset de entrenamiento: https://huggingface.co/datasets/Tilakoid/vscode-bug-feature-triage
- Repositorio de benchmark: la model card lo cita como `https://gith...`, truncado en la informacion disponible; no se puede reconstruir la URL completa.
- Resultados de la busqueda web: las busquedas realizadas no devolvieron resultados relevantes sobre este modelo. Los unicos resultados obtenidos fueron articulos de ayuda de AOL sobre restablecimiento de contrasenas, sin ninguna relacion con el modelo.
