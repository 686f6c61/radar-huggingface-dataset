# Theboukadida/laura-fr-lfm2.5-1.2b-GGUF

## Resumen

Laura (French tutor for German) es un ajuste fino del modelo LiquidAI/LFM2.5-1.2B-Instruct, publicado por el usuario Theboukadida en formato GGUF. Se trata de un modelo de generación de texto de 1.200 millones de parámetros cuyo propósito es actuar como tutor de alemán para adultos principiantes (niveles A1-A2), conversando con el estudiante en francés y empleando ejemplos en alemán. El modelo está pensado para ejecutarse en un teléfono móvil, únicamente con CPU y sin conexión a red.

El ajuste consiste en un adaptador LoRA (rango 16, aplicado a todas las capas lineales, 2 épocas) entrenado sobre aproximadamente 2.500-3.300 conversaciones cortas de tutoría en francés, posteriormente fusionado en los pesos y convertido a GGUF con cuantización Q4_K_M mediante llama.cpp. El archivo resultante ocupa 0,73 GB, lo que lo sitúa en el rango de despliegue en dispositivos de gama baja.

Su relevancia actual es doble: por un lado, demuestra el flujo completo de especialización de un modelo de borde (edge) para un dominio vertical muy concreto con un presupuesto de datos muy reducido; por otro, ilustra un patrón de diseño híbrido en el que la aplicación aporta la verificación lingüística externa (diccionario propio y tarjetas de reglas) y el modelo se limita a redactar la explicación pedagógica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (modelo base LiquidAI/LFM2.5-1.2B-Instruct); detalle de capas y mecanismos de atencion no disponible |
| Parametros totales | 1.200 millones (1.2B) |
| Parametros activos | No aplica, no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado: `laura-fr-lfm2.5-1.2b-Q4_K_M.gguf`, 0,73 GB) |
| Idiomas soportados | Aleman (de) y frances (fr) |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-1.2B-Instruct, un modelo de 1.2B parámetros de la familia LFM2.5 de Liquid AI, descrita por su desarrollador como una arquitectura optimizada para despliegue en el borde (edge). La model card de este ajuste no detalla la composición interna de capas, el esquema de atención ni la longitud de contexto del modelo base, por lo que esos datos se marcan como no disponibles.

Sobre el entrenamiento sí hay información concreta: se entrenó un adaptador LoRA de rango 16 sobre todas las capas lineales durante 2 épocas, con un corpus de aproximadamente 2.500-3.300 conversaciones cortas de tutoría en francés con ejemplos en alemán. El adaptador se fusionó en los pesos del modelo base y el resultado se convirtió a GGUF y se cuantizó a Q4_K_M con llama.cpp. No se menciona en la información disponible el uso de RLHF, DPO ni otras fases de alineación posteriores al ajuste supervisado.

La innovación destacable no es arquitectónica sino de integración: la aplicación que consume el modelo no delega el juicio gramatical en la red neuronal. Comprueba la frase del estudiante con un diccionario propio y añade el veredicto al mensaje en el formato `(Check: ✗ → „corrected sentence“ · reason)` o `(Check: ✓ …)`, junto con los significados del diccionario y la tarjeta de reglas del capítulo. El modelo fue entrenado exactamente con esas anotaciones y su función es explicarlas; sin ellas, según el propio autor, es un profesor mucho más débil. Es un ejemplo de arquitectura de sistema con verificación simbólica externa en lugar de confiar la corrección al modelo generativo.

## Capacidades

- Generación de texto conversacional en francés con ejemplos en alemán, orientada a la enseñanza de alemán para principiantes (A1-A2).
- Explicación de correcciones gramaticales a partir de anotaciones externas inyectadas en el prompt (`(Check: ✗ …)` / `(Check: ✓ …)`).
- Interpretación y desarrollo de tarjetas de reglas gramaticales y de significados de diccionario incluidos en el contexto del mensaje.
- Mantenimiento de conversaciones multi-turno de tutoría de formato corto, con el rol fijo de profesor.
- Ejecución totalmente offline y en CPU, sin acelerador gráfico, lo que habilita su uso en aplicaciones móviles desconectadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: no disponible en este ajuste (la familia LFM2.5 sí tiene una variante Thinking independiente, distinta de este repositorio).
- Capacidades multilingües: limitadas a alemán y francés según los metadatos del repositorio.

## Casos de uso

- Aplicación de curso de alemán offline para principiantes: es el caso de uso original. El modelo se ejecuta en el teléfono con CPU, sin conexión, y conversa en francés con el estudiante mientras corrige y explica frases en alemán apoyándose en el diccionario y las tarjetas de reglas que la app inyecta en cada mensaje.
- Corrección gramatical asistida por diccionario: la aplicación extrae la frase del estudiante, la valida con su propio diccionario y adjunta el veredicto; el modelo convierte ese veredicto en una explicación pedagógica comprensible para un A1-A2. Es adecuado porque el juicio factual no depende del modelo, lo que reduce el riesgo de correcciones erróneas.
- Generación de ejercicios y ejemplos adicionales: dado un capítulo y una regla concreta, el modelo puede producir frases de ejemplo y variaciones en alemán adaptadas al nivel del estudiante, con la terminología en francés.
- Simulación de diálogos de práctica: creación de situaciones conversacionales guiadas (presentarse, pedir en un restaurante, describir la rutina diaria) donde el modelo mantiene el papel de interlocutor y el de tutor en el mismo turno.
- Asistencia al profesorado para material didáctico: generación de explicaciones tipo para errores recurrentes, redactadas en francés con ejemplos en alemán, que el docente revisa antes de publicarlas.
- Despliegue en dispositivos de bajos recursos: con 0,73 GB en Q4_K_M, puede integrarse en Raspberry Pi, portátiles antiguos o navegadores mediante runtimes compatibles con GGUF, ofreciendo un tutor funcional sin coste de API ni conectividad.
- Prototipado rápido de asistentes educativos verticales: sirve como plantilla reproducible de ajuste LoRA sobre un modelo de borde, útil para equipos que quieran replicar el pipeline (LoRA rango 16, 2 épocas, fusión, conversión a GGUF, cuantización Q4_K_M) en otras lenguas o dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación reportada por el autor es una evaluación manual sobre conversaciones retenidas que el modelo no vio durante el entrenamiento:

| Evaluacion | Metrica | Resultado | Notas |
|---|---|---|---|
| Ensenanza correcta (evaluacion manual, held-out) | Porcentaje de respuestas con todos los hechos y razones de aleman correctos | 73,5 % | Sobre conversaciones de tutoria no vistas en entrenamiento |

Se desconoce el tamano exacto del conjunto de evaluacion, el procedimiento de anotacion y si participaron varios evaluadores. La metrica mide correccion factual de los elementos de alemán, no calidad pedagógica global ni fluidez del francés.

## Requisitos de hardware

- Archivo de pesos: un único GGUF de 0,73 GB en Q4_K_M, por lo que la huella en disco es inferior a 1 GB.
- VRAM estimada: por debajo de 1 GB para los pesos; sumando la caché KV y el contexto, el consumo total en memoria se mantiene en el rango de aproximadamente 0,9-1,5 GB según la longitud de contexto configurada. El autor indica que se ejecuta con CPU únicamente en un teléfono, sin GPU.
- GPU recomendadas: no se especifican en la información disponible. Cualquier GPU con 2 GB o más de VRAM puede alojarlo con holgura; tarjetas de gama alta como RTX 4090, A100 o H100 no aportan ventaja práctica por el reducido tamano del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con 2 GB de VRAM o más, e incluso en GPUs integradas y en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llamafile, llama-cpp-python y cualquier runtime compatible con GGUF. No se mencionan despliegues con vLLM, TGI u otros servidores de alto throughput, para los que la cuantización GGUF no es el formato habitual.
- Latencia y throughput estimados: no disponibles. El autor afirma que funciona en CPU de teléfono, pero no publica cifras de tokens por segundo ni de latencia por turno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Theboukadida/laura-fr-lfm2.5-1.2b-GGUF | 1,2B | no disponible | fr, de | GGUF Q4_K_M (0,73 GB) | LFM Open License v1.0 | Ajuste LoRA para tutoria de aleman en frances; evaluacion manual del 73,5 % de ensenanza correcta |
| Theboukadida/laura-lfm2.5-1.2b-GGUF | 1,2B | no disponible | no disponible | GGUF | no disponible | Repositorio homologo del mismo autor encontrado en la busqueda; la informacion disponible no detalla sus diferencias con el anterior |
| LiquidAI/LFM2.5-1.2B-Instruct | 1,2B | no disponible | no disponible | safetensors y GGUF (variantes oficiales) | LFM Open License v1.0 | Modelo base sin ajustar; proposito general, instrucciones y agentes |
| LiquidAI/LFM2.5-1.2B-Thinking-GGUF | 1,2B | no disponible | no disponible | GGUF | LFM Open License v1.0 | Variante oficial orientada a razonamiento, matematicas y logica; se distribuye por debajo de 900 MB en telefono |

Las cifras comparativas de benchmarks entre estos modelos no estan disponibles en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Dependencia crítica de contexto externo: el propio autor advierte que, sin las anotaciones de verificación del diccionario y las tarjetas de reglas, el modelo es un profesor mucho más débil. No debe desplegarse como corrector gramatical autónomo.
- Corpus de entrenamiento muy pequeno: aproximadamente 2.500-3.300 conversaciones y solo 2 épocas con LoRA de rango 16. El riesgo de sobreajuste al estilo y al vocabulario del corpus de tutoría es alto.
- Evaluacion limitada: el 73,5 % proviene de una evaluación manual sobre conversaciones retenidas, sin benchmark estandar, sin comparacion con el modelo base y sin datos sobre el tamano del conjunto de prueba.
- Riesgo de alucinación en hechos gramaticales: aunque el sistema delega la verificación en un diccionario, el modelo puede inventar reglas, excepciones o traducciones al explicar el veredicto recibido. Toda afirmacion sobre el alemán debería validarse.
- Cobertura de idiomas restringida: solo frances y aleman. No hay soporte documentado de castellano ni de otras lenguas, ni datos sobre el comportamiento fuera de ese par linguistico.
- Ambito funcional estrecho: esta especializado en tutoria de aleman para A1-A2 en frances. Su rendimiento en tareas generales de generacion, codigo, matematicas o razonamiento no esta documentado y previsiblemente se degrada respecto al modelo base.
- Longitud de contexto desconocida: al no publicarse, no se puede garantizar el comportamiento en conversaciones largas ni en prompts con muchas anotaciones de diccionario concatenadas.
- Restricciones de licencia: se distribuye bajo la LFM Open License v1.0, heredada del modelo base, con `license: other` en los metadatos. Es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial, ya que puede incorporar condiciones adicionales no resumidas en la model card.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 likes, sin discusiones ni informes independientes que confirmen el comportamiento declarado.
- Repositorio sin historial: creado y actualizado el mismo dia (28 de septiembre de 2026), lo que dificulta evaluar su mantenimiento o su evolucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Theboukadida/laura-fr-lfm2.5-1.2b-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Repositorio homologo del mismo autor: https://huggingface.co/Theboukadida/laura-lfm2.5-1.2b-GGUF
- Variante oficial de razonamiento en GGUF: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-GGUF
- Anuncio de la familia LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Anuncio de LFM2.5-1.2B-Thinking: https://www.liquid.ai/blog/lfm2-5-1-2b-thinking-on-device-reasoning-under-1gb
- Documentacion de LFM2.5-1.2B-Thinking: https://docs.liquid.ai/lfm/models/lfm25-1.2b-thinking
