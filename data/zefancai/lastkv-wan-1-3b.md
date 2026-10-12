# ZefanCai/LastKV-Wan-1.3B

## Resumen

LastKV-Wan-1.3B es un checkpoint de pesos generadores publicado en HuggingFace por el usuario ZefanCai, derivado del modelo de texto a video Wan2.1-T2V-1.3B de Alibaba. No se trata de un modelo completo ni de un pipeline autónomo, sino de una revisión de pesos que incorpora una modificación arquitectónica propia denominada LastKV, centrada en el comportamiento de la atención causal y la reutilización de la historia de claves y valores (KV).

La revisión principal (`main`) contiene pesos generadores consolidados mediante media móvil exponencial (EMA) en el paso de entrenamiento 20.500, preservados en FP32 sin conversión de precisión. El modelo suma 1.418.997.160 parámetros repartidos en 826 tensores, y emplea la configuración AKV2542 con `akv_mode="reusekv"`, `v_gap=95`, `num_frame_per_block=3` y `force_first_local_kv_tokens=1560`. La clase asociada es `AKV2541ReuseKVCausalWanModel`.

Su relevancia es acotada y muy experimental: al no incluir la implementación personalizada, los cargadores estándar de Wan o Diffusers no reproducen estos ajustes, por lo que solo resulta utilizable si se dispone del código LastKV correspondiente. La licencia es Apache-2.0, heredada del modelo base, y las descargas y valoraciones registradas en el momento de la consulta eran cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para texto a video, con atencion causal y esquema LastKV de reutilizacion de KV (`AKV2541ReuseKVCausalWanModel`, configuracion AKV2542) |
| Parametros totales | 1.418.997.160 (826 tensores) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible (parametros de reutilizacion KV declarados: `v_gap=95`, `num_frame_per_block=3`, `force_first_local_kv_tokens=1560`) |
| Tipos de cuantizacion | No disponible; los pesos se publican en FP32 sin conversion de precision |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32, posiblemente fragmentado en shards con `diffusion_pytorch_model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Wan2.1 T2V de Alibaba, un transformer de difusion orientado a generacion de video a partir de texto, y sustituye el comportamiento de atencion causal y de historia KV por el esquema LastKV. La configuracion concreta de esta revision es AKV2542, que activa `akv_mode="reusekv"` y fija valores especificos de reutilizacion (`v_gap=95`, `num_frame_per_block=3`, `force_first_local_kv_tokens=1560`). El nombre de la clase por si solo no determina este comportamiento: es imprescindible conservar estos parametros del constructor tal y como aparecen en `config.json`.

Los pesos liberados corresponden al paso 20.500 de entrenamiento, con la variante EMA en la revision `main` y los pesos crudos de ese mismo paso en la revision `step-020500-raw`. Los tensores originales se mantienen en FP32 sin conversion de precision. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO. Tampoco se incluye el estado del optimizador ni el estado de reanudacion del entrenamiento: es una entrega de pesos generadores y una configuracion saneada, no un pipeline de generacion completo.

## Capacidades

- Generacion de video a partir de texto (pipeline declarado `text-to-video`), mediante difusion sobre la arquitectura Wan2.1.
- Reutilizacion de la historia de claves y valores (reuse-KV) para gestionar ventanas temporales de fotogramas, con bloques de 3 fotogramas (`num_frame_per_block=3`).
- Conservacion de pesos en FP32, lo que evita perdida de precision por conversion durante el guardado.
- Disponibilidad de dos variantes del mismo paso de entrenamiento: pesos EMA (`main`) y pesos crudos (`step-020500-raw`).
- No se documentan capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No se documentan capacidades multilingues.

## Casos de uso

- Reproduccion de resultados de investigacion en atencion causal: el checkpoint permite reproducir el paso 20.500 de un entrenamiento con LastKV, siempre que el investigador disponga de la implementacion `AKV2541ReuseKVCausalWanModel` y de los activos base (VAE, codificador de texto y tokenizador).
- Estudio comparativo de estrategias de reutilizacion KV: al existir variantes EMA y cruda del mismo paso, se pueden comparar los efectos de la consolidacion EMA sobre la calidad de generacion manteniendo constante el resto de variables.
- Analisis de la configuracion AKV2542: sirve para evaluar como afectan `v_gap=95`, `num_frame_per_block=3` y `force_first_local_kv_tokens=1560` al coste de memoria y al comportamiento temporal del video generado.
- Punto de partida para ajuste fino posterior: el checkpoint puede actuar como inicializacion para nuevos entrenamientos sobre la base Wan2.1 T2V-1.3B, aunque requiere el codigo LastKV para cargarse correctamente.
- Verificacion de integridad de checkpoints sharded: la revision incluye indices de safetensors que permiten practicar y validar flujos de carga con `strict=True` sobre diccionarios de estado nativos.
- Docencia y experimentacion con difusion de video en un tamano reducido: con 1,3B parametros en FP32, el modelo es mas manejable que las variantes de mayor tamano de la misma familia para entornos de laboratorio.
- Auditoria de licencias y trazabilidad en derivados de Wan2.1: util para estudiar como se propaga la licencia Apache-2.0 en modelos derivados que modifican la atencion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM de pesos en FP32 (calculo a partir del numero de parametros): aproximadamente 5,7 GB solo para los 1.418.997.160 parametros en precision simple. Esta cifra es una estimacion aritmetica, no un dato declarado por el autor.
- VRAM adicional recomendada: hay que sumar el VAE, el codificador de texto, el tokenizador y las activaciones de difusion, que no forman parte de este repositorio distinto. El repositorio completo ocupa 11,4 GB, por lo que conviene reservar espacio en disco para los shards y los activos base.
- GPU recomendadas: se espera que quepa en GPUs de consumo de gama alta con 16 GB o mas (por ejemplo, RTX 4090, RTX 4080 o RTX 3090), dado el tamano de 1,3B parametros. No se dispone de cifras oficiales de compatibilidad.
- GPU de datacenter (A100, H100) no son necesarias por tamano, pero pueden usarse para lotes mayores o mayor resolucion.
- Opciones de despliegue: los cargadores estandar de Wan y Diffusers NO son validos para estos pesos, porque no implementan los ajustes LastKV. Se requiere la implementacion personalizada `AKV2541ReuseKVCausalWanModel`. El helper `from_pretrained` registrado solo admite un unico archivo de pesos y no restaura automaticamente todos los ajustes del constructor desde la configuracion.
- Carga de pesos fragmentados: hay que leer `diffusion_pytorch_model.safetensors.index.json`, cargar cada shard listado y volcar el diccionario de estado nativo completo en el modelo personalizado correspondiente con `strict=True`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / atencion | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| LastKV-Wan-1.3B | 1.418.997.160 | LastKV reuse-KV (AKV2542) | Apache-2.0 | Checkpoint de pesos; requiere codigo LastKV externo | No disponibles |
| Wan-AI/Wan2.1-T2V-1.3B | No disponible en la informacion proporcionada | Atencion estandar de Wan2.1 | Apache-2.0 | Modelo base completo y pipeline | No disponibles en la informacion proporcionada |
| Wan-AI/Wan2.1-T2V-14B | No disponible en la informacion proporcionada | Atencion estandar de Wan2.1 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponibles en la informacion proporcionada |

Nota: los modelos comparables se han identificado a partir de la relacion de derivacion declarada (`base_model: Wan-AI/Wan2.1-T2V-1.3B`). No se dispone de datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo autonomo: el repositorio contiene solo pesos generadores y una configuracion saneada. Faltan VAE, codificador de texto, tokenizador y el pipeline de generacion, que son dependencias externas.
- No incluye la implementacion personalizada `AKV2541ReuseKVCausalWanModel`, por lo que los cargadores estandar de Wan y Diffusers no pueden reproducir el comportamiento LastKV.
- El helper `from_pretrained` registrado solo soporta un archivo de pesos y no restaura automaticamente todos los parametros del constructor; es necesario cargarlos manualmente.
- Las comprobaciones de integridad del repositorio no acreditan la calidad de inferencia ni ninguna puntuacion de evaluacion.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de rendimiento frente al modelo base ni frente a alternativas.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni idiomas soportados, lo que dificulta evaluar riesgos de sesgo o cobertura linguistica.
- Riesgo de alucinacion visual: al ser un modelo de difusion, puede generar contenido incoherente o inexistente respecto al texto de entrada; no se aporta informacion especifica sobre este comportamiento.
- Licencia: Apache-2.0, heredada del modelo base de Alibaba. Las modificaciones de LastKV afectan a la atencion causal y al historial KV, y las obligaciones de atribucion y avisos del proyecto original siguen aplicandose.
- Uso comercial: la licencia Apache-2.0 lo permitiria en principio, pero al no existir pipeline autentico ni benchmarks, su viabilidad real en produccion es dudosa.
- Estado experimental: cero descargas y cero valoraciones en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZefanCai/LastKV-Wan-1.3B
- Revision EMA (principal): https://huggingface.co/ZefanCai/LastKV-Wan-1.3B/tree/main
- Revision de pesos crudos del paso 20.500: https://huggingface.co/ZefanCai/LastKV-Wan-1.3B/tree/step-020500-raw
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Licencia del modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B/blob/37ec512624d61f7aa208f7ea8140a131f93afc9a/LICENSE.txt
