# vincentzhou/jev-student-4b-yizao

## Resumen

Jev-student-4b-yizao es un modelo de decision afinado (fine-tuned) por el usuario vincentzhou sobre la base Qwen3.5-4B-Base, concebido para la linea de produccion de generacion de preguntas del examen chino de Ingeniero de Costes de Primera Clase (一造, "yizao"). A diferencia de un modelo de chat convencional, no genera texto libre: lee un enunciado con opciones y devuelve un juicio tipado (routing de capitulo, routing de punto de examen, clasificacion de defectos, solubilidad condicional, accion de tratamiento) mediante un unico token calculado con una softmax restringida a las letras candidatas.

La relevancia de este modelo esta en su enfoque de "coste-ingenieria": ha sido destilado de un panel de evaluacion de tres votos (reglas + DeepSeek en dos etapas + etiquetas suaves del modelo comercial TypeSafe Jev 1.13) y entrena con una perdida mixta de entropia cruzada dura y divergencia KL sobre probabilidades suaves. Con 4.205.751.296 parametros (aproximadamente 4.2B) y un coste de entrenamiento declarado inferior a 3 dolares en una GPU Modal L4, busca replicar el comportamiento de un modelo de decision propietario mucho mayor a una fraccion del coste.

El modelo es monoproposito y esta restringido al dominio del examen yizao en chino, con licencia Apache 2.0 y pesos disponibles tanto en safetensors como en GGUF. Su interes practico radica en la validacion de si un pipeline de destilacion ligero puede igualar o superar a un sistema comercial en tareas de clasificacion y enrutado estructurado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (Qwen3.5-4B-Base); detalles internos de la arquitectura de la base no disponibles |
| Parametros totales | 4.205.751.296 (cadena safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (etiqueta del repositorio); safetensors en bf16. Niveles concretos de cuantizacion no disponibles |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer decoder denso de la familia Qwen3.5. Sobre esa base se aplica un ajuste fino con LoRA de rango 16 sobre las proyecciones de atencion, durante 1 epoca, con learning rate 5e-5 y precision bf16. El resultado es un adaptador que, segun la model card, se distribuye ya integrado en el repositorio de 30,3 GB junto con la base. No se especifica el mecanismo de atencion, la longitud de contexto nativa ni la composicion concreta del corpus de preentrenamiento de Qwen3.5-4B-Base, por lo que estos extremos quedan como "no disponible".

El entrenamiento de destilacion usa 14.151 muestras: 778 pares de contraste con inyeccion de defectos en ocho clases (con etiquetas suaves de Jev), 757 etiquetas de routing de capitulo, 893 etiquetas de routing de punto de examen y 783 preguntas de examen simulado generadas por IA con etiquetas suaves de Jev (multiplicadas por 3 preguntas). La funcion de perdida combina entropia cruzada sobre etiquetas duras (peso 0,5) y divergencia KL sobre las probabilidades suaves de Jev (peso 0,5). El coste declarado de entrenamiento es inferior a 3 dolares en una GPU Modal L4.

La innovacion principal no es arquitectonica sino de protocolo: en lugar de generar una respuesta textual, el modelo realiza una lectura de un solo token aplicando una softmax restringida al conjunto de letras candidatas (A, B, C, ...), y la probabilidad resultante se interpreta como confianza de la decision. La temperatura de inferencia recomendada es T=0.5, que reduce el error de calibracion esperado (ECE) hasta 0.042.

## Capacidades

- Enrutado de capitulo: asigna una pregunta a su capitulo del manual de estudio (87,4% de acierto sobre n=325).
- Enrutado de punto de examen: identifica el punto de examen dentro del capitulo, con top1 de 84,9% y top3 de 97,1% (n=383). Funciona como protocolo secundario, es decir, primero capitulo y despues punto.
- Clasificacion de tipo de defecto: distingue entre seis clases de defecto en el enunciado o las opciones (90,5%).
- Juicio de solubilidad condicional: determina si un enunciado es resoluble con la informacion dada (96,0%).
- Decision de tratamiento editorial: clasifica la accion a tomar como publicar, corregir ligeramente o devolver (91,0%).
- Calibracion de confianza: salida probabilistica apta para umbrales de negocio y puertas de confianza, con ECE de 0.042 tras afinar la temperatura.
- Generalizacion a defectos no vistos: sobre 77 sondas de defecto fuera del entrenamiento y 479 examenes nuevos, la tasa de captura de patrones nuevos de defecto se situa entre el 96% y el 100%, con un 9% de falsos positivos sobre preguntas originales correctas.
- Protocolo conversacional: soporta el esquema de prompt/opciones/letra mediante tags de conversacion.
- No realiza generacion de texto libre, calculo preciso ni razonamiento multi-paso (por diseno, se delegan a reglas y codigo).

## Casos de uso

- Clasificacion automatica de preguntas de examen por capitulo y punto: en una plataforma de banco de preguntas, el modelo recibe cada enunciado y devuelve el capitulo y el punto de examen, permitiendo indexar y navegar miles de preguntas sin intervencion manual.
- Control de calidad editorial de examenes: antes de publicar un examen, el modelo evalua cada pregunta y decide si es publicable, requiere una correccion menor o debe devolverse, lo que reduce el trabajo de revision sobre lotes grandes.
- Deteccion de defectos en enunciados generados por IA: al integrarse en la linea de generacion de contenido, filtra preguntas mal formuladas (ambiguedades, opciones incoherentes, informacion faltante) en una fase temprana del pipeline.
- Verificacion de solubilidad: comprueba que cada pregunta incluye los datos necesarios para resolverse, evitando publicar items irresolubles que generarian reclamaciones de usuarios.
- Enrutado previo a un motor de resolucion: la clasificacion de capitulo y punto alimenta un sistema de reglas o de generacion de soluciones especializado por tipo de pregunta, siguiendo el principio de delegar el calculo exacto a codigo.
- Etiquetado asistido de datasets educativos: dada la capacidad de routing top1/top3, puede usarse para anotar previamente grandes volumnes de preguntas y luego validar esas anotaciones con revision humana, acelerando la construccion de corpora etiquetados.
- Puerta de confianza en produccion: gracias a la salida probabilistica calibrada, se pueden marcar automaticamente los casos con baja confianza para revision humana, derivando el resto a procesamiento totalmente automatico.

## Benchmarks y rendimiento

Resultados declarados en la model card, comparados con el modelo comercial Jev 1.13 en zero-shot:

| Tarea | Este modelo (r4) | Jev 1.13 zero-shot |
|---|---|---|
| Enrutado de capitulo (n=325) | 87,4% | 87,1% |
| Enrutado de punto de examen top1 / top3 (n=383) | 84,9% / 97,1% | 78,1% / 94,5% |
| Clasificacion de tipo de defecto (6 clases) | 90,5% | no disponible |
| Juicio de solubilidad condicional | 96,0% | no disponible |
| Decision de tratamiento (publicar / corregir / devolver) | 91,0% | no disponible |
| ECE tras afinar con T=0.5 | 0,042 | no disponible |

Pruebas de generalizacion declaradas (fuera del conjunto de entrenamiento):

| Prueba | Resultado |
|---|---|
| Captura de patrones nuevos de defecto (77 sondas) | 96-100% |
| Falsos positivos sobre preguntas originales (etiquetadas como defecto) | 9% |
| Coherencia con la lectura de un juez autoritativo | 77-85% |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,4 GB en bf16/fp16 (4.205.751.296 parametros x 2 bytes), unos 4,2 GB en 8 bits y en torno a 2,1-2,5 GB en cuantizacion de 4 bits. Estimaciones calculadas a partir del tamano de parametros; no hay cifras oficiales en la informacion disponible.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para cuantizacion de 4 bits; a partir de 12 GB (RTX 3060 12 GB, RTX 4070 Ti) es posible operar en bf16. Para despliegues en bf16 con concurrencia se recomiendan A100, H100 o L40S.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en tarjetas de consumo. Con cuantizacion de 4 bits funciona en GPU de 6-8 GB; en bf16 cabe en una RTX 4090 o RTX 3090 sin problemas.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp y Ollama (hay pesos GGUF en el repositorio), vLLM y TGI para servicio de alto rendimiento. Los tags indican endpoints_compatible.
- Latencia y throughput: al tratarse de una lectura de un solo token (un unico forward pass por peticion), la latencia es minima y dominada por el coste de prefill del prompt. No se han publicado cifras de latencia ni throughput.
- Coste de entrenamiento de referencia: menos de 3 dolares en una GPU Modal L4, segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jev-student-4b-yizao | 4,2B (denso, LoRA r16) | no disponible | Decisiones tipadas sobre el examen yizao | Apache 2.0 | HuggingFace (safetensors, GGUF) |
| Jev 1.13 (TypeSafe AI) | no disponible | no disponible | Decisiones estructuradas, proposito general | Propietaria | Acceso temprano limitado (comercial) |
| Qwen/Qwen3.5-4B-Base | 4,2B aprox. | no disponible | Generacion de texto y vision (base) | no disponible | HuggingFace (modelo base de este) |
| Familia Kev (jaredpalmer/kev) | no disponible | no disponible | Modelos de decision tipo Jev sobre Qwen3.5 y Qwen3.8 | no disponible | GitHub y pesos preentrenados |
| QwenJev (RJMSWD) | basado en Qwen3.5-4B | no disponible | Juicio visual local, 0,169 s/frame | no disponible | GitHub |

La comparativa directa mas relevante es con Jev 1.13, del que este modelo es destilacion: en las tareas medidas, Jev-student-4b-yizao iguala o supera al sistema comercial en zero-shot (por ejemplo, 84,9% frente a 78,1% en routing top1). Frente a Qwen3.5-4B-Base, la diferencia es de proposito: la base genera texto, mientras que este modelo emite decisiones tipadas. Kev y QwenJev son esfuerzos de la comunidad con la misma filosofia de modelos de decision ligeros. Las especificaciones de contexto y licencia de los modelos comparados figuran como "no disponible" al no aparecer en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito restringido: solo cubre las cuatro asignaturas del examen yizao (gestion, valoracion/pricing, medicion de obra civil y medicion de instalaciones) y unicamente en chino. Fuera de ese dominio no hay garantia de comportamiento util.
- No es una garantia factual: las probabilidades de salida deben usarse con umbrales de negocio definidos por el usuario. La propia model card recomienda puertas de confianza y revision humana.
- No realiza calculo preciso ni razonamiento multi-paso; estas tareas deben delegarse a reglas y codigo externos.
- El enrutado de punto de examen es un protocolo secundario: exige resolver primero el capitulo y despues el punto, lo que encadena dos inferencias.
- Riesgo de alucinacion acotado por el diseno (no genera texto libre), pero la clasificacion de defectos presenta un 9% de falsos positivos sobre preguntas originales correctas, lo que puede provocar devoluciones o correcciones innecesarias si no se revisan.
- El rendimiento fuera de la distribucion de entrenamiento depende de la ampliacion continua del banco de sondas; los patrones de defecto nuevos requieren nuevas inyecciones y entradas en la libreria de sondas.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No se detectan clausulas adicionales en la informacion disponible.
- Trazabilidad limitada del autor: 200 descargas y 0 "likes" en el momento de la consulta, con un unico responsable identificado por el handle vincentzhou y sin documentacion adicional sobre validacion externa.
- Fechas de creacion y actualizacion registradas en 2026; conviene verificar la vigencia del repositorio y de las dependencias antes de integrarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vincentzhou/jev-student-4b-yizao
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Ficha de referencia en essamamdani.com: https://essamamdani.com/ai-models/hf-vincentzhou-jev-student-4b-yizao
- Jev (AI model) en Wikipedia: https://en.wikipedia.org/wiki/Jev_(AI_model)
- Repositorio Kev (modelos de decision tipo Jev): https://github.com/jaredpalmer/kev
- Repositorio QwenJev: https://github.com/RJMSWD/QwenJev/tree/main/
- Comunidad Jev AI: https://www.jevai.org/
