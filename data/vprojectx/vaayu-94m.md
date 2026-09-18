# vprojectx/vaayu-94M

## Resumen

Vayu-ML (publicado en HuggingFace como vprojectx/vaayu-94M) es un modelo de lenguaje decoder-only de arquitectura propia, entrenado desde cero por el usuario vprojectx. El autor lo describe como un transformer compacto de aproximadamente 94 millones de parametros, preentrenado sobre unos 500 millones de tokens en bfloat16 y posteriormente alineado mediante Supervised Fine-Tuning (SFT) sobre conceptos teoricos de machine learning y deep learning. El checkpoint real subido al repositorio contiene 135.285.504 parametros segun los metadatos de safetensors, una discrepancia apreciable respecto a la cifra declarada en la model card.

Su relevancia es acotada y muy especifica: no compite con modelos generalistas, sino que sirve como artefacto de investigacion reproducible (arquitectura custom, tokenizer BPE propio de 32.768 entradas, entrenamiento completo desde cero) y como base para tareas de conocimiento teorico de ML/DL en ingles. Con 512 tokens de contexto, 12 capas y 768 dimensiones ocultas, es un modelo de escala "tiny" pensado para prototipado, ablaciones de arquitectura e inferencia en CPU o GPU de gama baja.

El modelo se distribuye bajo licencia MIT, solo soporta ingles, no tiene benchmarks publicados y acumula cero descargas y cero likes en el momento de redactar esta ficha, por lo que no existe validacion independiente de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion causal, RMSNorm y FFN SwiGLU (arquitectura custom) |
| Parametros totales | 135.285.504 (segun safetensors); la model card declara ~94 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas ni GGUF; el repo solo contiene pesos safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

Detalles adicionales declarados por el autor: 12 capas, dimension oculta 768, dimension intermedia 2.048, 12 cabezas de atencion, vocabulario de 32.768 tokens con tokenizer BPE propio. Tamano del repositorio: 1,0 GB.

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only denso, no de un MoE ni de una arquitectura hibrida SSM. Usa prenormalizacion con RMSNorm, activacion SwiGLU en la capa feed-forward y atencion causal multi-cabeza estandar (12 cabezas sobre una dimension oculta de 768, es decir, dimension por cabeza de 64). La novedad tecnica no esta en componentes nuevos, sino en el entrenamiento completo desde cero con tokenizer propio, lo que da control total sobre el vocabulario pero limita la compatibilidad con utilidades estandar.

El preentrenamiento consumio aproximadamente 500 millones de tokens en bfloat16 con el optimizador AdamW. Esa cifra esta muy por debajo de la relacion optima tipo Chinchilla para un modelo de este tamano (que requeriria del orden de 2.000 millones de tokens para ~100M de parametros), por lo que cabe esperar un modelo claramente infraentrenado. La alineacion posterior consistio en un SFT sobre pares pregunta-respuesta curados de conceptos de ML/DL, con enmascaramiento causal de la respuesta. No se documenta RLHF, DPO, ni datos sobre composicion del dataset de preentrenamiento, filtrado, deduplicacion o numero de pasos y epocas.

## Capacidades

- Generacion de texto en ingles con respuestas cortas, orientada a explicaciones conceptuales de machine learning y deep learning.
- Respuesta a preguntas de tipo teorico (por ejemplo, definiciones de funciones de perdida, optimizadores o arquitecturas) gracias al SFT especifico de ese dominio.
- Generacion de texto libre basica en ingles, limitada por el contexto de 512 tokens.
- Razonamiento multi-paso: no disponible, no documentado ni validado.
- Tool calling / function calling: no disponible, no documentado.
- Soporte de agentes: no disponible, no documentado.
- Capacidades multilingues: no, el modelo solo esta declarado para ingles.
- Modo "thinking" explicito: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Capacidades especiales adicionales: tokenizer BPE propio de 32.768 entradas, integrado en el repositorio.

## Casos de uso

- Tutor academico de conceptos de ML/DL: el SFT se realizo sobre pares de pregunta-respuesta conceptuales de ML/DL, por lo que el modelo es adecuado para responder consultas teoricas breves en ingles dentro de una ventana de 512 tokens. Funciona mejor como apoyo de repaso que como fuente autoritativa.
- Generacion automatica de preguntas de autoevaluacion: se le puede pedir que produzca preguntas cortas y sus respuestas sobre un tema concreto de ML/DL, utiles para material docente o mazos de flashcards que despues se revisan manualmente.
- Prototipado e investigacion de arquitecturas: al ser un modelo entrenado desde cero con codigo y tokenizer propios, sirve como banco de pruebas para ablaciones (cambios de normalizacion, activacion o tokenizer) en una unica GPU de consumo, con ciclos de entrenamiento cortos.
- Preclasificacion y enrutamiento de bajo coste: en un pipeline con varios modelos, este modelo puede actuar como primer filtro para decidir si una consulta en ingles pertenece al dominio de ML/DL y derivarla a un modelo mayor, reduciendo coste por peticion.
- Inferencia en CPU o entornos de recursos muy limitados: con ~135M de parametros en bfloat16 (unos 271 MB de pesos) cabe en memoria de dispositivos modestos y puede ejecutarse localmente sin GPU, algo relevante para demos offline o entornos air-gapped.
- Fine-tuning de dominio muy acotado en ingles: por su tamano, es viable reentrenar o ajustar el modelo en una unica GPU para dominios verticales de vocabulario cerrado (documentacion tecnica, glosarios internos) siempre que las respuestas quepan en 512 tokens.
- Experimentos educativos de entrenamiento desde cero: util para cursos o talleres donde se quiera mostrar el ciclo completo (tokenizer, preentrenamiento, SFT) sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, HellaSwag ni de ningun otro conjunto de evaluacion, y la busqueda web no ha devuelto ningun analisis independiente del modelo. Por tanto, no es posible comparar su rendimiento numerico con alternativas de forma fundamentada.

## Requisitos de hardware

- VRAM estimada para los pesos: ~541 MB en fp32, ~271 MB en bfloat16/fp16, ~135 MB en int8 y ~68 MB en int4 (calculado sobre 135,3M de parametros; no hay versiones cuantizadas publicadas).
- Cache KV: con 12 capas, 12 cabezas, dimension por cabeza de 64 y bfloat16, el coste es de aproximadamente 36 KB por token, unos 18,9 MB para la ventana completa de 512 tokens. Es despreciable frente al peso del modelo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona sobradamente en RTX 3060, RTX 4060, RTX 4090, T4, L4, A100 y H100; las GPU de gama alta quedaran infrautilizadas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas de los ultimos diez anos y tambien en iGPU con memoria compartida suficiente. La inferencia en CPU es viable.
- Opciones de despliegue: transformers (PyTorch) con safetensors es la via natural, ya que la arquitectura es custom y el propio autor no publica integraciones. llama.cpp, Ollama, vLLM y TGI requeririan portar o registrar la arquitectura y convertir los pesos, algo no documentado en la informacion disponible. TGI y vLLM exigen ademas una implementacion compatible registrada.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en ningun backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vayu-ML (vprojectx/vaayu-94M) | 135,3M (declarado 94M) | 512 tokens | Ingles | MIT | safetensors en HuggingFace; arquitectura custom |
| SmolLM-135M | 135M | 2.048 tokens | Ingles (principalmente) | Apache 2.0 | Peso publicado con amplio soporte en llama.cpp, transformers y vLLM |
| GPT-2 (124M) | 124M | 1.024 tokens | Ingles | MIT (licencia modificada de OpenAI) | Peso ampliamente soportado, tokenizer BPE estandar |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Ingles | Apache 2.0 | Peso publicado con soporte en la mayoria de backends |

La comparacion se limita a parametros, contexto, idioma, licencia y disponibilidad: no hay datos publicos de rendimiento de Vayu-ML que permitan comparar calidad. Frente a SmolLM-135M, de tamano casi identico, Vayu-ML ofrece un contexto cuatro veces menor y carece de soporte conocido en herramientas estandar, lo que reduce de forma notable su utilidad practica. Frente a GPT-2, la ventaja teorica seria una arquitectura moderna (RMSNorm, SwiGLU) y un tokenizer propio, pero sin benchmarks no puede confirmarse.

## Limitaciones y advertencias

- Discrepancia de parametros: la model card declara ~94M, mientras que los tensores en safetensors suman 135.285.504 parametros. Hay que tratar las cifras del autor con cautela.
- Infraentrenamiento probable: 500 millones de tokens estan muy por debajo de la relacion optima para un modelo de este tamano, lo que sugiere una calidad de lenguaje limitada y mayor propension a errores gramaticales y factuales.
- Riesgo de alucinacion alto: al ser un modelo pequeno, infraentrenado y con SFT sobre un dominio estrecho, es esperable que invente hechos, citas y referencias, especialmente fuera del ambito de ML/DL.
- Contexto muy corto: 512 tokens restringen de forma severa las conversaciones multiturno, la lectura de documentos y cualquier tarea de resumen o RAG con contexto extenso.
- Monolingue: solo ingles declarado. No hay soporte verificado de castellano ni de otros idiomas; no debe asumirse transferencia multilingue.
- Sesgos: no disponible. El autor no publica informacion sobre composicion del dataset de preentrenamiento, filtrado, deduplicacion ni evaluaciones de sesgo, por lo que no se pueden caracterizar los sesgos conocidos.
- Sin tool calling, sin modo agente y sin capacidades multimodales: no hay evidencia de que soporte function calling ni razonamiento multi-paso fiable.
- Licencia permisiva con matices: MIT permite uso comercial y modificacion, pero el modelo se distribuye "tal cual", sin garantias, y el autor no documenta procedencia de los datos de entrenamiento ni posibles reclamaciones de terceros sobre el corpus.
- Integracion en produccion: al ser una arquitectura custom, es probable que requiera codigo propio o conversion de pesos para funcionar en vLLM, llama.cpp, Ollama o TGI, lo que anade coste de ingenieria y riesgo de mantenimiento.
- Sin validacion externa: cero descargas, cero likes y ningun benchmark publicado. No existe comunidad que haya verificado su comportamiento.
- Especializacion estrecha: el SFT en conceptos de ML/DL puede degradar el comportamiento en dominios ajenos respecto al modelo base preentrenado.

## Enlaces

- HuggingFace: https://huggingface.co/vprojectx/vaayu-94M
- No se han encontrado enlaces relevantes en la busqueda web: los resultados devueltos corresponden a foros alemanes sobre television (MediathekView, VLC) y no guardan ninguna relacion con el modelo. No hay paper, blog, repositorio ni demo asociados a Vayu-ML en la informacion disponible.
