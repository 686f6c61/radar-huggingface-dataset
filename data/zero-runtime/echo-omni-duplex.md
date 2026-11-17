# zero-runtime/echo-omni-duplex

## Resumen

echo-omni-duplex es un modelo especializado en deteccion de turno (turn detection) para agentes de voz conversacionales, desarrollado por zero-runtime. No es un modelo generativo de texto ni un sistema de reconocimiento de voz: su funcion es determinar cuando el usuario ha terminado de hablar (end-of-turn), cuando esta interrumpiendo al agente (barge-in) y cuando emite senales de retroalimentacion conversacional (backchannel). Se distribuye bajo el pipeline `voice-activity-detection` y la libreria propietaria `zeroruntime`.

El modelo aborda uno de los cuellos de botella clasicos en sistemas de voz full-duplex: la latencia artificial que introducen los detectores de actividad vocal (VAD) basados en silencio, que obligan al agente a esperar una pausa fija antes de responder. echo-omni-duplex pretende sustituir ese heuristico por una clasificacion semantica del flujo de audio en streaming, con el objetivo de reducir el tiempo de respuesta percibido sin provocar cortes prematuros.

La informacion publica disponible es limitada: el repositorio no expone pesos descargables abiertamente (acceso restringido mediante gating), el tamano del repo figura como 0.0 GB y no se detallan arquitectura, numero de parametros ni composicion del dataset de entrenamiento. Los unicos datos cuantitativos publicados son los resultados declarados por el autor en TurnBench, sin verificacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | zero-runtime-model-license (acceso restringido, requiere aceptacion de condiciones) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo (tipo de red, capas, mecanismo de atencion, encoder de audio empleado ni estrategia de fusion de modalidades). El identificador `omni-duplex` y las etiquetas del repositorio sugieren un sistema multimodal orientado a flujo de audio bidireccional en tiempo real, pero no hay documentacion tecnica que confirme detalles de diseno.

Tampoco esta disponible el volumen de datos de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de ajuste fino supervisado, RLHF o DPO. La model card referencia el paper arXiv:2608.25218, que constituye la unica fuente tecnica potencial, aunque su contenido no se ha incluido en la informacion proporcionada. No se documentan innovaciones como decodificacion especulativa, atencion lineal o mecanismos de streaming con estado persistente.

## Capacidades

- Deteccion de fin de turno (end-of-turn): clasifica si el hablante ha concluido su intervencion, diferenciando pausas internas de cierre real.
- Deteccion de interrupcion (barge-in / interruption detection): identifica cuando el usuario empieza a hablar mientras el agente aun emite audio.
- Deteccion de backchannel: reconoce senales como "si", "ya" o murmullos de asentimiento que no constituyen una toma de turno.
- Procesamiento en streaming de baja latencia: disenado para operar sobre flujo de audio continuo en sistemas full-duplex.
- Deteccion de actividad vocal (VAD) como tarea de pipeline declarada.
- Soporte multilingue: limitado a ingles segun los metadatos del repositorio.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni generacion de texto: el modelo es un clasificador de eventos conversacionales, no un LLM.

## Casos de uso

- Agentes de voz en atencion al cliente: el modelo decide en tiempo real si el cliente ha terminado de exponer su consulta, permitiendo al agente responder sin la pausa de silencio fija que imponen los VAD tradicionales y reduciendo la latencia percibida.
- Sistemas de telefonia conversacional (IVR avanzado): integrado en el pipeline de audio entrante, distingue pausas de duda de finales de turno reales, evitando que el sistema interrumpa al usuario a mitad de frase.
- Asistentes de voz en dispositivos (smart speakers, wearables): permite gestionar barge-in, de modo que el usuario pueda interrumpir al asistente mientras habla y este cese la reproduccion de forma inmediata.
- Plataformas de transcripcion en tiempo real con diarizacion: la deteccion de turnos mejora la segmentacion de intervenciones y la asignacion de hablante en reuniones o llamadas.
- Agentes de voz para soporte tecnico con multiples pasos: al detectar con precision el fin de cada intervencion, el orquestador puede encadenar llamadas a herramientas y respuestas sin acumular latencia artificial entre turnos.
- Evaluacion y test de sistemas conversacionales: el modelo puede usarse como componente de referencia para medir la calidad de turn-taking en suites de pruebas de agentes de voz, comparando sus predicciones con anotaciones humanas.
- Moderacion de backchannels en entornos de accesibilidad: filtrar murmullos de asentimiento para que no se interpreten como toma de turno, mejorando la experiencia de usuarios con patrones de habla pausados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Deteccion de fin de turno | TurnBench (test) | Recall | 0.970 |
| Deteccion de fin de turno | TurnBench (test) | Tasa de falsos positivos | 0.072 |
| Deteccion de interrupcion | TurnBench (test) | Recall | 0.984 |
| Deteccion de interrupcion | TurnBench (test) | Tasa de falsos positivos | 0.106 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas, dado que el modelo no es un LLM de proposito general. Tampoco se aportan comparaciones con lineas base en la informacion suministrada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parametros ni tamano del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamano del repositorio figura como 0.0 GB, lo que sugiere pesos no alojados publicamente en el momento de la consulta.
- Opciones de despliegue: la libreria declarada es `zeroruntime`, propietaria; no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni ONNX Runtime.
- Latencia y throughput: no disponibles, aunque el caso de uso declarado (streaming full-duplex) implica requisitos de latencia sub-200 ms no cuantificados en la informacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| echo-omni-duplex | Deteccion de turno / VAD semantico | no disponible | no disponible | zero-runtime-model-license | Restringido (gated) |
| Silero VAD | VAD basado en energia/red neuronal | no disponible | no aplica | MIT | Abierto |
| TurnBench baselines (Sesame) | Deteccion de fin de turno | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: no se aportan metricas de Silero VAD ni de otros detectores en TurnBench dentro de la informacion proporcionada, y el propio benchmark referencia un leaderboard externo sin cifras comparativas en la ficha.

## Limitaciones y advertencias

- Solo soporta ingles: no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Resultados de benchmarks no verificados: los valores de TurnBench proceden del propio autor (`verified: false`) y no han sido replicados de forma independiente.
- Acceso restringido: el repositorio requiere aceptar condiciones en Hugging Face; no es posible descargar pesos sin aprobacion.
- Licencia propietaria (`zero-runtime-model-license`): es imprescindible revisar los terminos antes de cualquier uso comercial, ya que no es una licencia open source reconocida por OSI.
- Ausencia de documentacion tecnica publica: sin arquitectura, parametros ni datos de entrenamiento, la evaluacion de riesgos de sesgo y alucinacion no puede realizarse de forma rigurosa.
- Riesgo de falsos positivos en interrupcion: la tasa declarada del 10,6 % implica que aproximadamente una de cada diez detecciones de barge-in podria ser erronea, con el consiguiente corte indebido del agente.
- Dependencia de la libreria `zeroruntime`: el despliegue queda ligado a un runtime propietario, lo que limita la portabilidad y la integracion en stacks estandar.
- Sin garantias de mantenimiento: el repositorio registra 0 descargas y 5 likes, lo que indica una adopcion muy baja y un riesgo elevado de abandono del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zero-runtime/echo-omni-duplex
- Paper referenciado: arXiv:2608.25218 (https://arxiv.org/abs/2608.25218)
- Leaderboard TurnBench: https://turnbench.sesame.com/
