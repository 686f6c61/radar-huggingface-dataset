# Tilakoid/qwen3.5-0.8b-hoasa-lora

## Resumen

El modelo `Tilakoid/qwen3.5-0.8b-hoasa-lora` es un adaptador LoRA de tipo PEFT publicado por el usuario Tilakoid sobre el modelo base `Qwen/Qwen3.5-0.8B` (revisión fijada `2fc06364715b967f1860aea9cf38778875588b17`). No es un modelo completo ni un clasificador con cabeza de clasificación: es un adaptador generativo que se monta sobre un modelo de lenguaje causal multimodal (vision-language) y que se utiliza exclusivamente en modo texto. Su propósito concreto es el análisis de sentimiento basado en aspectos (ABSA) sobre reseñas de hoteles escritas en indonesio.

El adaptador resuelve un problema muy delimitado: dada una reseña, debe devolver un único objeto JSON con exactamente diez claves de aspecto (`ac`, `air_panas`, `bau`, `general`, `kebersihan`, `linen`, `service`, `sunrise_meal`, `tv`, `wifi`) y una etiqueta de cuatro clases por aspecto (`neg`, `neut`, `pos`, `neg_pos`). El entrenamiento y la evaluación son solo de texto: la torre de visión queda congelada (`finetune_vision_layers=false`) y no se usa entrada de imagen en ningún caso.

Su relevancia es principalmente metodológica: demuestra que un adaptador LoRA de rango 16 sobre un modelo de 0,8B puede obtener un macro-F1 medio de 0,6935 y una tasa de validez de esquema de 1,0 en el split de test HoASA de 286 filas, con decodificación greedy y sin cadena de pensamiento. Es un ejemplo de adaptación barata de un modelo pequeño a una tarea estructurada y de idioma específico, con licencia Apache 2.0 y trazabilidad completa de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer causal generativo vision-language; uso en modo solo texto |
| Parametros totales | No disponible para el adaptador (el modelo base es `Qwen/Qwen3.5-0.8B`, ~0,8B parametros); el adaptador es de rango 16 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el adaptador. El entrenamiento y la evaluacion se hicieron en BF16 sin cuantizacion (`load_in_4bit=false`) |
| Idiomas soportados | Indonesio (id) |
| Licencia | Apache 2.0 (igual que el modelo base) |
| Formato de pesos | safetensors (adaptador LoRA); no se almacenan tokenizer ni processor en el repositorio |
| Rango y alpha de LoRA | rank 16, alpha 32, dropout 0,0, bias none |
| Modulos objetivo | `all-linear` resuelto a modulos de lenguaje, atencion y proyecciones MLP |
| Precision | BF16 (base) y BF16 (entrenamiento) |
| Repositorio | 0,0 GB; 0 descargas y 0 likes en el momento de la consulta |
| Fecha de creacion | 2026-09-19 |

## Arquitectura y entrenamiento

El adaptador se construye con PEFT sobre `Qwen/Qwen3.5-0.8B`, un transformer causal generativo de tipo vision-language. La seleccion `all-linear` para los modulos objetivo se resuelve en los modulos de lenguaje, atencion y proyecciones MLP, sin tocar la torre de vision. La configuracion LoRA es de rango 16, alpha 32, dropout 0,0 y bias none. El modelo base se carga en BF16 y el adaptador se entrenó tambien en BF16, sin cuantizacion de 4 bits. El autor identifica explicitamente que se trata de un adaptador generativo, no de una cabeza clasificadora ni de un modelo de sequence-classification.

La tarea se formula como generacion condicionada: un system prompt fijo en indonesio que enumera los diez aspectos y las cuatro etiquetas, seguido de la reseña como mensaje de usuario, con la instruccion de responder unicamente con un objeto JSON plano y sin bloques de codigo ni explicaciones. La decodificacion usada en la evaluacion es greedy (`do_sample=false`) y con el modo de pensamiento desactivado (`enable_thinking=False`). El autor indica que el prompt y el parser son los mismos que usa el benchmark de origen. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO; el nombre del adaptador y las etiquetas del repositorio apuntan al conjunto HoASA de reseñas de hoteles en indonesio, con un split de test congelado de 286 filas.

Un detalle relevante de trazabilidad: el autor publica los SHA256 del adaptador (`4d53af5e0d6897f9177b7b84e1dd0f07ba5117f6ce30a29087ae3115a0c29e7b`) y de la configuracion (`6e06677aaa7b423e140e3010f758d3fa68dd08c97e4b73441c3700c2ec362dbe`), y clasifica la reproduccion de 2026-09-19 como C2 (reproduccion valida con diferencias), ya que 279 de las 286 generaciones crudas son identicas byte a byte a las predicciones historicas y 7 difieren.

## Capacidades

- Generacion de texto en indonesio con salida estructurada: produce un objeto JSON plano con diez claves de aspecto y una etiqueta por clave.
- Clasificacion de sentimiento a cuatro clases por aspecto: `neg`, `neut`, `pos` y `neg_pos` (sentimiento mixto sobre el mismo aspecto).
- Extraccion de sentimiento a nivel de aspecto en el dominio de reseñas de hoteles (aire acondicionado, agua caliente, olores, impresion general, limpieza, ropa de cama, servicio, desayuno, television y wifi).
- Cumplimiento estricto de esquema: tasa de validez de salida, sintaxis y esquema de 1,0 en la evaluacion publicada, con 0 predicciones invalidas.
- Modo sin cadena de pensamiento: la generacion se realiza con `enable_thinking=False`, lo que reduce la latencia y evita texto intermedio.
- Soporte de tool calling / function calling: no disponible; no se documenta ninguna capacidad de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta especializado en una unica tarea de extraccion.
- Capacidades multilingues: no; el modelo esta entrenado y evaluado unicamente en indonesio.
- Capacidades especiales: el modelo base es vision-language, pero la torre de vision esta congelada y no se usa entrada de imagen, por lo que en la practica se comporta como un modelo solo texto.

## Casos de uso

- Analisis de sentimiento por aspecto en plataformas de reservas: el adaptador recibe el texto de una reseña de hotel y devuelve directamente las diez etiquetas, lo que permite agregar puntuaciones por aspecto (por ejemplo, wifi o limpieza) a nivel de establecimiento sin necesidad de anotacion manual.
- Monitorizacion de reputacion hotelera: procesar en lote reseñas historicas y construir series temporales por aspecto para detectar degradaciones (por ejemplo, un aumento de `neg` en `air_panas` o `kebersihan`) y priorizar inversiones de mantenimiento.
- Enrutado de incidencias a departamentos: cada etiqueta negativa se puede mapear a un equipo responsable (`service` a recepcion, `linen` a lavanderia, `tv` o `wifi` a mantenimiento), generando tickets automaticos con la evidencia textual de la reseña.
- Enriquecimiento de paneles analiticos: al devolver JSON valido con tasa de esquema de 1,0, la salida se puede cargar directamente en una base de datos o un almacen columnar sin una capa de post-procesado compleja.
- Filtrado y priorizacion de reseñas para atencion al cliente: ordenar las reseñas por severidad segun el numero de aspectos `neg` o `neg_pos` detectados y dirigir las mas criticas a un agente humano.
- Investigacion academica sobre ABSA en indonesio: sirve como punto de comparacion reproducible frente al benchmark HoASA, con prompt, parser y metricas documentados, y pesos verificables por SHA256.
- Preprocesado dentro de pipelines de analitica de opiniones: dado su tamaño de 0,8B, se puede ejecutar como paso previo de un flujo mayor que agregue los resultados a nivel de ciudad, cadena hotelera o temporada.
- Prototipado de bajo coste en GPUs de consumo: al ser un adaptador sobre un modelo de 0,8B en BF16, permite experimentar con ajuste fino de tareas estructuradas sin infraestructura de datacenter.

## Benchmarks y rendimiento

Evaluacion publicada por el autor, reproduccion del 2026-09-19 sobre el split de test congelado de HoASA (286 filas), decodificacion greedy (`do_sample=false`), BF16 y pensamiento desactivado:

| Metrica | Valor |
|---|---|
| Macro-F1 medio por aspecto | 0,6935252234331811 |
| Exactitud exacta por reseña completa (esquema valido) | 0,7937062937062938 |
| Exactitud global por aspecto | 0,9751748251748251 |
| Tasa de validez sintactica | 1,0 |
| Tasa de validez de esquema | 1,0 |
| Tasa de salida valida | 1,0 |
| Predicciones invalidas | 0 |

Macro-F1 por aspecto:

| Aspecto | Macro-F1 |
|---|---|
| ac | 0,709971 |
| air_panas | 0,656158 |
| bau | 0,716404 |
| general | 0,615007 |
| kebersihan | 0,713504 |
| linen | 0,661174 |
| service | 0,719006 |
| sunrise_meal | 0,658639 |
| tv | 0,739412 |
| wifi | 0,745978 |

Valores historicos de referencia del benchmark de origen, conservados por separado y no recalculados a partir de estos pesos del adaptador:

| Metrica | Referencia historica |
|---|---|
| Macro-F1 medio por aspecto | 0,6921064154754831 |
| Exactitud exacta por reseña completa | 0,7937062937062938 |
| Exactitud global por aspecto | 0,9755244755244755 |

El autor indica que la reproduccion nueva no recupera los pesos originales del adaptador: clave a clave por id de test, 279 de 286 generaciones crudas son identicas byte a byte y 7 difieren, por lo que el resultado se clasifica como C2 (reproduccion valida con diferencias) y no como reproduccion exacta.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de ~0,8B en BF16 ocupa aproximadamente 1,6 GB de pesos, mas el adaptador LoRA (unas decenas de MB) y el cache KV. En la practica, una estimacion razonable es de 2 a 4 GB de VRAM para secuencias cortas de reseña; es una estimacion derivada del tamaño declarado, no un dato publicado por el autor.
- El autor no documenta cifras de latencia ni de throughput.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe con holgura en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, y tambien en GPUs de datacenter (A100, H100) si se integra en un servicio mayor.
- Cabe en GPU de consumo: si, dado que el modelo base tiene ~0,8B parametros y se evalua en BF16 sin cuantizacion.
- Opciones de despliegue documentadas: `transformers` (`AutoProcessor`, `AutoModelForImageTextToText`) junto con `peft` (`PeftModel`), cargando el procesador desde la revision fijada del modelo base. Alternativas como vLLM, llama.cpp, Ollama o TGI no estan documentadas en la informacion disponible; en el caso de vLLM requeriria comprobar el soporte de adaptadores LoRA para esta arquitectura concreta.
- Nota de despliegue: el repositorio no almacena tokenizer ni processor, por lo que es obligatorio cargarlos desde `Qwen/Qwen3.5-0.8B` en la revision `2fc06364715b967f1860aea9cf38778875588b17`. El código de ejemplo del autor usa `device_map="cuda"`.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de modelos comparables en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa fiable. La tabla siguiente recoge unicamente los elementos verificables:

| Modelo | Tipo | Parametros | Contexto | Macro-F1 ABSA indonesio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tilakoid/qwen3.5-0.8b-hoasa-lora | Adaptador LoRA generativo | ~0,8B (base) + adaptador r=16 | No disponible | 0,6935 (HoASA, 286 filas) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-0.8B | Modelo base vision-language | ~0,8B | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Clasificadores dedicados de ABSA en indonesio (por ejemplo, basados en encoder) | Clasificacion / extraccion de aspectos | No disponible | No disponible | No disponible | No disponible | No disponible |

La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo ni sobre alternativas comparables; los unicos resultados obtenidos corresponden a un servicio de streaming de video y no guardan relacion con la ficha.

## Limitaciones y advertencias

- Dominio y idioma muy restringidos: el adaptador esta diseñado exclusivamente para reseñas de hoteles en indonesio; su comportamiento fuera de ese dominio o idioma no esta evaluado.
- Salida de esquema fijo: devuelve siempre las diez claves de aspecto predefinidas; no admite aspectos nuevos ni consultas abiertas sobre el texto.
- Etiqueta `neut` ambigua por diseño: agrupa sentimiento neutro, aspecto no mencionado y aspecto no inferible, lo que limita la granularidad del analisis.
- Riesgo de alucinacion estructural: aunque la tasa de validez de esquema fue de 1,0 en el test publicado, el modelo podria etiquetar como `pos` o `neg` aspectos que la reseña no menciona explicitamente, dado que `neut` cubre tanto la neutralidad como la ausencia de mencion.
- Rendimiento desigual por aspecto: el macro-F1 mas bajo corresponde a `general` (0,615007) y a `air_panas` (0,656158), frente a `wifi` (0,745978) y `tv` (0,739412); el rendimiento en los aspectos peor puntuados puede no ser suficiente para decisiones automatizadas sin revision humana.
- Diferencias de reproduccion: 7 de 286 generaciones difieren de las historicas, lo que indica una reproducibilidad no exacta entre ejecuciones o revisiones.
- Requisito de prompt exacto: el autor indica que el prompt de sistema y el parser son los mismos que usa el benchmark de origen; desviarse de ese formato puede degradar el cumplimiento del esquema.
- Torrre de vision congelada: el modelo base es vision-language, pero el adaptador no aporta ninguna capacidad de imagen; usarlo con entrada visual no produciria resultados fiables.
- Licencia Apache 2.0, que permite uso comercial y modificacion, pero el modelo base puede tener sus propias condiciones que conviene verificar en su repositorio.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de terceros.
- Sin datos publicados sobre contexto maximo, por lo que se desconoce el limite practico de longitud de reseña que admite.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tilakoid/qwen3.5-0.8b-hoasa-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Revision fijada del modelo base: 2fc06364715b967f1860aea9cf38778875588b17
- SHA256 de los pesos del adaptador: 4d53af5e0d6897f9177b7b84e1dd0f07ba5117f6ce30a29087ae3115a0c29e7b
- SHA256 de la configuracion del adaptador: 6e06677aaa7b423e140e3010f758d3fa68dd08c97e4b73441c3700c2ec362dbe
- Papers, blogs, repositorios o demos adicionales: no disponible; la busqueda web no devolvio resultados tecnicos relacionados con este modelo.
