# tarfandoon/laya-fa-support

## Resumen

`tarfandoon/laya-fa-support` es un modelo de clasificación de texto en persa (farsi) especializado en el triaje de mensajes de atención al cliente. Lo desarrolla Ali Jahani (usuario `tarfandoon`) mediante fine-tuning del checkpoint `laya-multilingual` del proyecto Laya, un motor de decisión "System 1" orientado a devolver respuestas estructuradas con probabilidades en lugar de texto libre. El modelo lee un mensaje de soporte en persa y asigna una única etiqueta entre cuatro: `billing`, `technical`, `cancel` u `other`.

La relevancia del modelo está en su enfoque: no genera prosa, sino una distribución de probabilidad sobre opciones predefinidas, de modo que no hay nada que parsear ni margen para alucinaciones de texto. Cuenta con 321.908.998 parámetros (unos 321,9 millones), un repositorio de 1,3 GB en formato safetensors y licencia Apache 2.0. Se publicó el 28 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes".

Frente al modelo base `laya-multilingual`, el fine-tuning eleva la precisión de 36/64 (56,2 %) a 51/64 (79,7 %) usando instrucciones en persa sobre un conjunto de evaluación retenido de 64 mensajes, y reduce el error de calibración (ECE) de 0,273 a 0,103. Es, por tanto, un ajuste pequeño y muy focalizado, pensado para integrarse como paso de enrutado previo en sistemas de soporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de decisión tipo "System 1" derivado del backbone Laya; pipeline `text-classification` con salida estructurada de probabilidades) |
| Parametros totales | 321.908.998 (~321,9 M) |
| Parametros activos | No aplica (no hay indicios de que sea un modelo MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio contiene pesos en safetensors de 1,3 GB para 321,9 M de parametros |
| Idiomas soportados | Persa (fa) como idioma principal; instrucciones tambien en ingles; admite entradas en persa formal, coloquial, finglish y persa con mezcla de ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado sobre el checkpoint `laya-multilingual` (commit `55cf4c4ebb4ebe31b2550e8bdf3bd21b99753851`) del modelo base `convaiinnovations/laya`, descrito por sus autores como una familia abierta de modelos de decisión "System 1" de tipo horizontal. La tarea resultante es de clasificación con opciones forzadas: el modelo recibe un mensaje y devuelve, para cada opción declarada en el prompt, una probabilidad, además de una confianza calibrada para la opción elegida. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO.

El autor sí indica que el ajuste se entrenó con varias paráfrasis de las instrucciones, en persa e inglés, de forma que la redacción concreta de las instrucciones y de las descripciones de cada categoría puede variar sin romper el modelo, siempre que se conserven las cuatro claves de opción (`billing`, `technical`, `cancel`, `other`). La evaluación se hizo sobre el benchmark diagnóstico `persian_fa`, compuesto por 64 mensajes de soporte sintéticos repartidos en 8 familias (formal, coloquial, finglish, ortografía, mezcla de código, negación, sarcasmo/taarof y dígitos) y 4 etiquetas balanceadas. No se documenta ninguna innovación arquitectónica propia más allá del uso del motor de decisión subyacente.

## Capacidades

- Clasificación y enrutado de mensajes de soporte en persa en una sola pasada hacia cuatro categorías: `billing`, `technical`, `cancel` y `other`.
- Salida estructurada con una probabilidad por opción y una métrica de confianza calibrada (`answer_confidence`), sin generación de texto libre.
- Procesamiento por lotes mediante `predict_batch`, útil para volcar bandejas de entrada completas.
- Uso de umbrales de confianza para derivar casos dudosos a un operador humano.
- Manejo de persa formal, coloquial, finglish y persa con palabras en inglés mezcladas.
- Robustez ortográfica: gestiona los caracteres árabes `ي`/`ك` y la ausencia de medios espacios.
- Instrucciones aceptadas tanto en persa como en inglés, con mejor rendimiento declarado en persa.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito ("thinking").

## Casos de uso

- Triaje de tickets de soporte en persa: el modelo lee el mensaje entrante y lo asigna a `billing`, `technical`, `cancel` u `other` en una sola pasada, de modo que el sistema de mesa de ayuda puede encolar cada ticket en el equipo correcto sin intervención manual.
- Enrutado con derivación a humano: usando la confianza calibrada (ECE de 0,103 en instrucciones persas) se puede fijar un umbral, por ejemplo 0,6, y enviar únicamente los casos por debajo de ese valor a un agente, reduciendo el volumen de revisión manual.
- Detección temprana de churn: la categoría `cancel` permite identificar mensajes con intención de cancelar la suscripción o cerrar la cuenta (recall de 13/16 en la evaluación persa) y activar retención antes de perder al cliente.
- Clasificación masiva de bandejas históricas: con `predict_batch` se puede etiquetar retroactivamente un histórico de correos o chats para construir analítica de motivos de contacto por departamento.
- Pre-filtro de bajo coste en CPU: con 150-200 ms por decisión en CPU, el modelo puede actuar como primera capa de enrutado en servidores sin GPU antes de invocar modelos mayores.
- Normalización de entradas ruidosas: al tolerar finglish, mezcla de código y errores ortográficos, sirve como capa de limpieza y clasificación para canales informales como chat o redes sociales.
- Segmentación de la categoría `other`: útil para separar felicitaciones, sugerencias, propuestas de colaboración o consultas generales del flujo de incidencias reales.
- Etiquetado asistido para entrenar modelos mayores: las probabilidades por opción pueden usarse como pseudoetiquetas para ampliar datasets de soporte anotados.

## Benchmarks y rendimiento

Los resultados proceden del benchmark retenido `persian_fa` (64 mensajes de soporte que el modelo nunca vio durante el entrenamiento) y de sus dos prompts congelados, uno en persa y otro en inglés. Las cifras corresponden a la primera de tres repeticiones, con predicciones idénticas en las tres.

| Metrica | Base (`laya-multilingual`) | `laya-fa-support` | Cambio |
|---|---|---|---|
| Precision con instrucciones en persa | 36/64 (56,2 %) | 51/64 (79,7 %) | +15 |
| Macro-F1 con instrucciones en persa | 0,513 | 0,795 | - |
| Falsos `cancel` (persa) | 4 | 2 | -2 |
| `cancel` no detectados (persa) | 9 | 3 | -6 |
| Confianza media (persa) | 0,84 | 0,69 | -0,15 |
| ECE, error de calibracion (persa) | 0,273 | 0,103 | -0,170 |
| Precision con instrucciones en ingles | 41/64 (64,1 %) | 44/64 (68,8 %) | +3 |
| Macro-F1 con instrucciones en ingles | 0,633 | 0,685 | - |
| Falsos `cancel` (ingles) | 2 | 3 | +1 |
| `cancel` no detectados (ingles) | 6 | 6 | 0 |
| Confianza media (ingles) | 0,82 | 0,71 | -0,11 |
| ECE (ingles) | 0,250 | 0,108 | -0,142 |

Desglose por familia con instrucciones en persa:

| Familia | Base | `laya-fa-support` | Cambio |
|---|---|---|---|
| formal | 6/8 | 8/8 | +2 |
| colloquial | 5/8 | 7/8 | +2 |
| finglish | 4/8 | 4/8 | 0 |
| orthography | 4/8 | 6/8 | +2 |
| code_mixed | 5/8 | 8/8 | +3 |
| negation | 3/8 | 6/8 | +3 |
| sarcasm_taarof | 5/8 | 6/8 | +1 |
| digits | 4/8 | 6/8 | +2 |

Recall por etiqueta con instrucciones en persa:

| Etiqueta | Base | `laya-fa-support` |
|---|---|---|
| `billing` | 13/16 | 14/16 |
| `technical` | 14/16 | 14/16 |
| `cancel` | 7/16 | 13/16 |
| `other` | 2/16 | 10/16 |

Desglose por familia con instrucciones en ingles:

| Familia | Base | `laya-fa-support` | Cambio |
|---|---|---|---|
| formal | 5/8 | 8/8 | +3 |
| colloquial | 7/8 | 6/8 | -1 |
| finglish | 4/8 | 5/8 | +1 |
| orthography | 5/8 | 5/8 | 0 |
| code_mixed | 6/8 | 6/8 | 0 |
| negation | 3/8 | 4/8 | +1 |
| sarcasm_taarof | 6/8 | 5/8 | -1 |
| digits | 5/8 | 5/8 | 0 |

En cuanto al recall por etiqueta con instrucciones en ingles, la informacion disponible solo recoge `billing` (10/16 en base y 10/16 en el modelo ajustado) y `technical` en base (15/16); el resto de celdas no esta disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del recuento de parametros, no confirmada por el autor): en fp32 unos 1,3 GB; en fp16 unos 0,65 GB; en int8 unos 0,32 GB, mas el coste de activaciones y del framework.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU con 2 GB o mas de VRAM es suficiente, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100. El modelo no necesita aceleradores de gama alta.
- Inferencia en CPU: viable. El autor cifra una decision en 150-200 ms en CPU; en GPU indica que es "mucho mas rapida" sin dar cifra concreta.
- Referencias del proyecto Laya (modelo base, no de este fine-tuning): la web del proyecto cita 33 ms y una comparativa independiente menciona 21 ms con respuestas tipadas y probabilidades, siempre sobre el modelo base.
- Opciones de despliegue: el unico camino documentado es el paquete Python `laya` (`pip install laya`) con `laya.load("tarfandoon/laya-fa-support")` y `device="cuda"` opcional. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento agregado: no hay cifras publicadas de throughput (peticiones por segundo) ni de latencia por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tarfandoon/laya-fa-support` | 321,9 M | no disponible | Triaje de soporte en persa, 4 clases | Apache 2.0 | HuggingFace, 0 descargas |
| `convaiinnovations/laya` (`laya-multilingual`) | no disponible (mismo backbone) | no disponible | Decision multilingue generica | no disponible | Checkpoint base en HuggingFace |
| TypeSafe Jev | no disponible | no disponible | Alternativa propietaria citada en la comparativa de Laya | no disponible | no disponible |

La unica comparacion con datos reales es contra el propio modelo base, que es 15 aciertos peor con instrucciones en persa en el mismo benchmark. No hay informacion suficiente para comparar con otros clasificadores de triaje en persa de tamano similar.

## Limitaciones y advertencias

- El benchmark de evaluacion es pequeno: 64 mensajes sinteticos y 8 familias. No es representativo de la variabilidad real de un servicio de atencion al cliente en produccion.
- El modelo solo esta orientado a persa. Con instrucciones en ingles la precision baja a 44/64 (68,8 %) y el rendimiento en `cancel` (6/16 no detectados) no mejora respecto al base.
- La familia `finglish` no mejora con el fine-tuning en el prompt persa (4/8) y solo sube un caso en el prompt ingles.
- Recall limitado en categorias concretas: `other` alcanza 10/16 con instrucciones en persa, y `cancel` presenta dos falsos positivos, lo que en produccion implicaria cerrar cuentas de forma indebida si se actuara sin umbral de confianza.
- La calibracion mejora, pero la confianza media baja de 0,84 a 0,69; hay que recalibrar el umbral de derivacion a humano sobre datos propios antes de desplegar.
- No hay informacion publica sobre el dataset de entrenamiento, los tokens utilizados ni el proceso de anotacion, por lo que no se puede auditar el sesgo de las etiquetas.
- El modelo devuelve probabilidades, no texto, de modo que el riesgo de alucinacion de contenido es bajo; el riesgo real es una clasificacion incorrecta silenciosa.
- Con 0 descargas y 0 "likes", no existe validacion independiente de la comunidad ni issues publicos sobre su comportamiento.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y los terminos del modelo base `convaiinnovations/laya` antes de desplegarlo en produccion.
- Dependencia de un unico runtime: el paquete `laya`. No se documentan alternativas de servido ni exporters estandar (GGUF, ONNX).
- Las fechas del repositorio (creacion y actualizacion el 28 de septiembre de 2026) son posteriores a la fecha habitual de consulta; conviene confirmar su vigencia en HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarfandoon/laya-fa-support
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio del modelo base en GitHub: https://github.com/NandhaKishorM/laya
- Benchmark persa: https://github.com/alipyth/laya-persian-benchmark
- Web del proyecto Laya: https://laya.convaiinnovations.com/
- Blog de HuggingFace sobre Laya: https://huggingface.co/blog/sora-2/laya-ai-model-how-it-works-run-it-locally-and-eval
- Comparativa independiente de Laya: https://brainfunctioncollapse.com/laya
- Perfil del autor en HuggingFace: https://huggingface.co/tarfandoon/models
- Canal de Telegram del autor: https://t.me/tarfandoonchannel
