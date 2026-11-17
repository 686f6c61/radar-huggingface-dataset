# udgamlabs/hinglish-commands-0.6b

## Resumen

Udgam Hinglish Commands 0.6B es un adaptador LoRA experimental construido sobre el modelo base Qwen3-0.6B, desarrollado por Udgam Labs. Su funcion es convertir peticiones breves en ingles o hinglish romanizado (hindi escrito con alfabeto latino mezclado con ingles) en comandos estructurados con intencion y argumentos etiquetados, que una aplicacion pueda inspeccionar. No ejecuta acciones: solo produce una representacion jerarquica en texto del tipo `[IN:GET_EVENT ... [SL:DATE_TIME ...]]` que el codigo acompanante transforma en JSON anidado ordenado.

El modelo no es un foundation model nuevo ni un asistente general para lenguas indias. Es un especialista de dominio acotado a ocho areas (alarma, evento, mensajeria, musica, navegacion, recordatorio, temporizador y meteorologia) y a dos idiomas de entrada: hinglish romanizado e ingles emparejado. La etiqueta `hi` de metadatos no implica un modelo validado en devanagari.

Su relevancia actual es doble: por un lado, demuestra que un adaptador de 0,6B puede mejorar drasticamente una tarea de parsing semantico frente al modelo base con prompting y ejemplos recuperados (de 9,90% a 54,88% de exactitud de arbol completo en el conjunto de test). Por otro, documenta con honestidad sus limites: casi la mitad de las interpretaciones en hinglish siguen siendo incorrectas, por lo que debe tratarse como componente experimental sujeto a validacion antes de conectarlo a acciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Qwen3-0.6B |
| Parametros totales | no disponible (adaptador LoRA; base Qwen3-0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-0.6B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hinglish romanizado (hi) e ingles (en) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (adaptador LoRA), libreria PEFT |
| Modelo base | Qwen/Qwen3-0.6B (relacion: adapter) |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Inferencia | false (segun metadatos de la model card) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre Qwen3-0.6B, un transformer decoder de 0,6 mil millones de parametros. El adaptador se distribuye como paquete de integracion: la raiz del repositorio contiene el adaptador en `model/`, su tokenizer, el fichero `retrieval_train.jsonl`, el esquema, la configuracion y un manifiesto de integridad. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO.

La interfaz evaluada no es un chat prompt arbitrario: requiere cargar el paquete completo con el wrapper `udgam_hinglish` y el base Qwen fijado (pinneado). El sistema incorpora cuatro ejemplos recuperados por consulta (retrieval-augmented prompting) y produce una estructura jerarquica de intencion y slots que el codigo convierte a JSON anidado. La innovacion principal no es arquitectonica sino de especializacion: un adaptador pequeno que supera ampliamente al base con prompting en una tarea de parsing semantico multilingue con mezcla de codigos.

## Capacidades

- Parsing semantico de comandos: identifica la intencion (TOP) y extrae argumentos (slots) como fecha/hora, categoria de evento, ubicacion, etc.
- Salida estructurada jerarquica en texto (`[IN:... [SL:...]]`) convertible a JSON anidado ordenado por el codigo acompanante.
- Preservacion del texto original del usuario dentro de la estructura (source-copy).
- Cobertura de ocho dominios: alarma, evento, mensajeria, musica, navegacion, recordatorio, temporizador y meteorologia.
- Procesamiento de hinglish romanizado e ingles emparejado.
- Alta tasa de validez sintactica de la salida: 99,96% de formato valido (diagnostico de formato, no de exactitud).
- No ejecuta acciones: solo interpreta y estructura.
- No dispone de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido segun la informacion disponible.

## Casos de uso

- Prototipado de asistentes de voz para el mercado indio: el modelo convierte una frase mixta como "Kya is month koi beer festival he" en un comando estructurado con fecha y categoria, adecuado para un pipeline de NLU previo a la logica de negocio.
- Investigacion en code-switching: sirve como banco de pruebas reproducible para estudiar parsing semantico en hinglish romanizado con un adaptador de bajo coste computacional.
- Clasificacion de intenciones en aplicaciones de domotica: con ocho dominios definidos, puede integrarse como capa de interpretacion de comandos de alarma, temporizador o recordatorio antes de la validacion humana.
- Generacion de datasets sinteticos etiquetados: su salida estructurada puede usarse para preetiquetar corpus de comandos que luego se revisan manualmente, acelerando la anotacion.
- Evaluacion comparativa de tecnicas de adaptacion: el paquete incluye manifiesto de integridad, revision fijada y conjunto de test de 13.026 filas, lo que permite reproducir la comparacion base frente a adaptador.
- Filtrado y enrutado de peticiones en un backend: el JSON resultante permite dirigir la consulta al microservicio correcto (eventos, musica, navegacion) sin invocar un modelo mayor.
- Docencia sobre limites de los LLM pequenos: los ejemplos de mejora y regresion documentados ilustran como un adaptador puede corregir un caso y empeorar otro, util para formar criterio de validacion en produccion.

## Benchmarks y rendimiento

Resultados publicados en la model card. La metrica es exactitud de arbol completo (complete-tree exact match), que exige coincidencia de todas las etiquetas, valores, anidamientos y orden de hijos tras canonicalizacion de espacios.

| Modelo / tarea emparejada | Total 13.026 | Hinglish 6.513 | Ingles 6.513 |
|---|---|---|---|
| Qwen3-0.6B + cuatro ejemplos recuperados | 9,90% | 7,54% | 12,27% |
| KingNish Hinglish checkpoint + cuatro ejemplos | 9,19% | 5,94% | 12,44% |
| Respuesta de entrenamiento mas cercana, sin cambios | 0,00% | 0,00% | 0,00% |
| Udgam adapter seleccionado + cuatro ejemplos | 54,88% | 46,84% | 62,92% |

Mejora de 44,98 puntos porcentuales con intervalo de confianza del 95% emparejado de [43,93; 46,03]. El test consta de 6.513 entradas emparejadas ingles/hinglish agrupadas en 6.302 clusters normalizados de fuente inglesa, con 2.000 remuestreos bootstrap (semilla 42). En la vista de sensibilidad con entradas repetidas (12.692 filas): 54,17% para Udgam frente a 9,59% para Qwen. Los ocho dominios mejoran respecto al base con prompting. Tasa de validez sintactica del 99,96% (diagnostico de formato). Ningun modelo de lenguaje actuo como juez principal del test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el base Qwen3-0.6B en precision completa ocupa aproximadamente 1,2 GB de pesos, por lo que el adaptador anade una huella marginal. Con cuantizacion de 8 bits o 4 bits del base cabria en GPUs consumer de 4-8 GB, aunque no se han publicado mediciones oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano del base, cualquier GPU con al menos 4-8 GB de VRAM deberia ser suficiente.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base (0,6B), aunque no hay confirmacion oficial.
- Opciones de despliegue: el paquete oficial usa el wrapper `udgam_hinglish` con PEFT y el base Qwen fijado. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la carga mediante chat prompt arbitrario no reproduce la interfaz evaluada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Udgam Hinglish Commands 0.6B | Adaptador LoRA sobre Qwen3-0.6B | no disponible | 54,88% arbol completo | CC-BY-SA-4.0 | Hugging Face + repo GitHub |
| Qwen3-0.6B (base, con prompting) | 0,6B | no disponible | 9,90% arbol completo | no disponible en la informacion | Hugging Face |
| KingNish Hinglish checkpoint (con prompting) | no disponible | no disponible | 9,19% arbol completo | no disponible en la informacion | Hugging Face |

La comparativa se limita a los modelos incluidos en la evaluacion del autor. No se dispone de datos de otros adaptadores especializados en hinglish para una comparacion mas amplia.

## Limitaciones y advertencias

- Exactitud insuficiente para produccion sin validacion: 5.877 de 13.026 interpretaciones completas siguen siendo incorrectas incluso con el adaptador.
- El hinglish es el lado debil: 46,84% de exactitud de arbol completo frente a 62,92% en ingles.
- La tasa de validez sintactica del 99,96% es un control de formato, no una medida de exactitud semantica; una salida puede ser sintacticamente valida y semanticamente erronea (ver el ejemplo de regresion con `island`).
- Ambito estrictamente limitado a ocho dominios y a hinglish romanizado e ingles; no es un asistente general ni un modelo validado en devanagari.
- El modelo no ejecuta acciones: cualquier integracion debe validar la interpretacion antes de disparar efectos reales.
- No se han documentado sesgos especificos, pero al derivar de Qwen3-0.6B y de un dataset de comandos acotado, puede heredar sesgos del base y del corpus de anotacion.
- Riesgo de alucinacion estructural: puede anadir slots inexistentes o duplicar entidades, como se documenta en el ejemplo de regresion.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribucion y obligacion de compartir bajo la misma licencia las obras derivadas; conviene revisar las implicaciones para productos propietarios.
- Requiere el paquete completo y el base fijado por revision; cargar solo los pesos con un prompt arbitrario no reproduce el comportamiento evaluado.
- El repositorio indica `inference: false` en metadatos y no hay publicacion en PyPI asumida; la instalacion se hace desde el repositorio fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/hinglish-commands-0.6b
- Repositorio fuente en GitHub: https://github.com/udgamlabs/hinglish-commands-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Revision verificada del adaptador: 77d3ce7072b7b33b331169ac7a6bb50d4c89d8ae
