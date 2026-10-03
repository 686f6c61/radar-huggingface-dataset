# wzsxb233/CyberFly-01

## Resumen

CyberFly-01 es un checkpoint multimodal "baked" (fusionado) construido sobre MiniCPM-o 4.5 y publicado por el usuario wzsxb233. Consiste en la fusión del backbone de lenguaje del modelo base `openbmb/MiniCPM-o-4_5` (revisión fijada `503e754207c94da6bb26850b4469f367c9ea3582`) con una actualización LoRA/QLoRA ligera denominada CyberFly v3, orientada a una interfaz de IA encarnada (embodied AI). El artefacto público es exclusivamente el checkpoint fusionado: no se distribuye el adaptador LoRA, el estado del optimizador ni los ejemplos de entrenamiento.

El modelo tiene 9.371.787.666 parámetros (~9,37 mil millones) y ocupa 18,8 GB en el repositorio, distribuido en formato safetensors junto al tokenizador, la configuración, la procedencia y las sumas de comprobación. La actualización CyberFly v3 fue muy corta (150 pasos supervisados, 420 ejemplos de entrenamiento y 20 de evaluación, con 1.916.928 parámetros entrenables) y su propósito declarado es validar la ruta de publicación y una comprobación fija de decisión textual, no establecer una competencia conductual amplia.

Su relevancia es de nicho: sirve como interfaz auditable entre un modelo multimodal y un runtime externo de conectoma y cuerpo (MaleCNS, MuJoCo, FlyBody, FlyGym) para experimentos reproducibles de IA encarnada. No es un modelo de propósito general ni un sustituto del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal, heredada de MiniCPM-o 4.5 (backbone de lenguaje MiniCPM-o 4.5); detalle interno no disponible |
| Parámetros totales | 9.371.787.666 (~9,37 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible (solo se publican pesos en safetensors; no se mencionan GGUF, AWQ, GPTQ ni otros) |
| Idiomas soportados | No disponible; el ejemplo de uso de la model card incluye una instrucción en chino |
| Licencia | No especificada en el repositorio; se indica que se aplican los términos de la licencia upstream de MiniCPM-o 4.5 y las condiciones de `NOTICE.md` |
| Formato de pesos | safetensors (checkpoint fusionado, más tokenizador y configuración) |

## Arquitectura y entrenamiento

CyberFly-01 hereda la arquitectura multimodal de MiniCPM-o 4.5. Durante la actualización CyberFly v3, el backbone de lenguaje y los módulos multimodales del modelo base se mantuvieron congelados, salvo los 1.916.928 parámetros entrenables de la actualización LoRA/QLoRA que después se fusionó en los pesos. La model card no detalla la composición del dataset de entrenamiento, el número de tokens empleados ni si hubo fases de RLHF o DPO; únicamente indica 420 ejemplos de entrenamiento y 20 de evaluación repartidos en 150 pasos supervisados.

La innovación declarada no está en el entrenamiento, sino en la forma de publicación y en la interfaz: el checkpoint se distribuye "baked" para cargarse como un modelo estándar (sin `adapter_model.safetensors` ni directorio PEFT), y se acopla a un runtime externo que enruta el estado oculto del modelo a través de puertos numéricos declarados. Tanto el conectoma como el cuerpo son componentes de runtime separados y no están integrados en los pesos de MiniCPM, por lo que el checkpoint por sí solo no simula un cerebro ni controla un cuerpo en MuJoCo.

## Capacidades

- Generación de texto y explicaciones: el checkpoint se carga como un modelo MiniCPM-o estándar y responde a prompts de lenguaje.
- Codificación multimodal: los módulos multimodales del modelo base se conservan, aunque quedaron congelados durante la actualización. No se detalla qué modalidades concretas cubre la release.
- Interfaz con conectoma y cuerpo: puede emitir propuestas o explicaciones que el runtime valida antes de aplicarlas a puertos numéricos (conector MaleCNS, cuerpo MuJoCo). La respuesta del modelo se trata como propuesta, no como acción.
- Planificación textual acotada: el ejemplo de uso documentado incluye un comando `bridge plan` que produce un plan a partir de un estado numérico en JSON.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Síntesis de voz: no disponible en este repositorio. El artefacto no incluye los ficheros opcionales `assets/token2wav/` (`flow.pt`, `hift.pt`, `campplus.onnx`, `speech_tokenizer_v2_25hz.onnx`) de la distribución upstream de MiniCPM.
- Idiomas: no especificado. La model card no declara cobertura multilingüe propia.

## Casos de uso

- Investigación en interfaces multimodales auditables: emplear el checkpoint para estudiar cómo el estado oculto del modelo se enruta a través de puertos numéricos declarados, con validación explícita de esquemas y rangos en cada paso.
- Experimentos de IA encarnada con MaleCNS y MuJoCo: alimentar la señal textual del modelo a un conector MaleCNS y a un cuerpo en MuJoCo, con episodios de duración limitada y trayectorias en bruto conservadas para su reanálisis.
- Demostraciones reproducibles: ejecutar protocolos fijos con semilla y control conocidos, de modo que los resultados puedan repetirse y auditarse fuera del entorno de autor.
- Evaluación de protocolos de decisión textual: reproducir el holdout textual v3 (40/40 decisiones exactas) como prueba de regresión de la interfaz de decisión.
- Inspección educativa: examinar de forma didáctica cómo un modelo de lenguaje expone su estado hacia componentes externos mediante puertos numéricos y contratos de validación.
- Punto de partida para adaptaciones de dominio: usar el checkpoint fusionado como base para nuevos LoRA con un runtime propio, respetando las obligaciones de la licencia upstream.
- Pruebas de integración de servicios locales: exponer el modelo mediante un servicio compatible con MiniCPM en loopback (`MINICPM_TRANSPORT=openai`, `MINICPM_BASE_URL=http://127.0.0.1:8000/v1`) y validar el flujo completo de extremo a extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de evaluación son específicos de protocolo y se recogen en la model card:

| Prueba | Resultado | Notas |
|---|---|---|
| Holdout textual v3 (protocolo fijo) | 40/40 decisiones exactas | Limitado al protocolo textual declarado |
| Reja física de corriente aprendida | No superada | No cumplió el criterio de llegada a 3 mm ni la retención de 0,5 s |
| Mapeo de ejes nativos | Las solicitudes ±Z recaen en plantillas ±Y existentes | Indica una limitación de mapeo |
| Protocolo de memoria M4b (estado aleatorizado, corregido) | Diferencia de grupo −0,20; p exacto de permutación de etiquetas = 0,9326 | Sin efecto positivo específico de olor |

Los resultados históricos M1–M6 son específicos de protocolo y permanecen en el informe técnico con sus controles y limitaciones; la model card advierte explícitamente que no deben agregarse en una afirmación general de capacidad de vuelo nativa del modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del número de parámetros, no confirmada por el autor): aproximadamente 19 GB en fp16/bf16 para los pesos, más overhead de activaciones y caché KV; en torno a 10-12 GB en cuantización de 8 bits y 6-7 GB en 4 bits.
- GPU recomendadas: A100 40 GB y H100 para fp16/bf16 sin restricciones; RTX 4090 o RTX 3090 (24 GB) para fp16 ajustado o cuantizado.
- Cabe en GPU de consumo: sí, especialmente con cuantización de 8 o 4 bits; en fp16 requiere tarjetas de 24 GB o superiores.
- Opciones de despliegue: la model card documenta un servicio local compatible con MiniCPM expuesto por OpenAI-compatible transport en loopback. El soporte concreto en vLLM, llama.cpp, Ollama o TGI no está confirmado en la información proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La búsqueda web no ha devuelto modelos comparables: los resultados apuntan a recursos sobre generación de modelos 3D y activos con nombre similar, sin relación con este checkpoint. El único punto de referencia disponible es el modelo base.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberFly-01 | ~9,37 mil millones | No disponible | Específico de protocolo (ver benchmarks) | Términos upstream de MiniCPM-o 4.5 | HuggingFace |
| MiniCPM-o 4.5 (base) | ~9,37 mil millones | No disponible | No disponible en la información proporcionada | Licencia MiniCPM-o 4.5 | HuggingFace |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: el checkpoint hereda los datos, idiomas y limitaciones multimodales del modelo upstream; no se han documentado sesgos específicos de CyberFly.
- Riesgo de alucinación: el modelo puede generar texto, planes o explicaciones incorrectas. La actualización CyberFly añade una interfaz de ingeniería, no elimina la alucinación ni el desplazamiento de distribución.
- Limitación de mapeo de ejes: las solicitudes nativas ±Z recaen en plantillas ±Y existentes.
- Protocolos no superados: la reja física de corriente aprendida no alcanzó el criterio de 3 mm de llegada y 0,5 s de retención, y el protocolo de memoria M4b corregido no mostró efecto positivo específico de olor.
- Prohibición de uso indebido: no debe presentarse como un agente consciente o sintiente, como un cerebro biológico o controlador biológicamente equivalente, ni como sistema clínico, crítico para la seguridad o de vuelo autónomo.
- Entorno de ejecución: debe ejecutarse solo en un entorno aislado (sandbox) y supervisado. El runtime ha de validar cada campo numérico, aplicar comprobaciones de rango, limitar la duración de los episodios y conservar las trayectorias en bruto.
- Licencia: se aplican las obligaciones de la licencia upstream de MiniCPM-o 4.5. La documentación de CyberFly y las adiciones al runtime se distribuyen solo bajo los términos de `NOTICE.md`; no debe asumirse que una licencia posterior sustituya las obligaciones upstream. Es obligatorio citar MiniCPM-o 4.5 junto con la release CyberFly y, cuando se usen, MaleCNS/flybrain, FlyBody, FlyGym y MuJoCo.
- Funciones ausentes: la generación de voz requiere los activos `token2wav` de la distribución upstream de MiniCPM y no está disponible en este repositorio.
- Trazabilidad: todas las cifras reportadas están vinculadas a un checkpoint, protocolo, semilla y control concretos. El checkpoint público no sustituye a un paquete completo de reproducción.
- Estado de adopción: el repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validación externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wzsxb233/CyberFly-01
- Modelo base MiniCPM-o 4.5: https://huggingface.co/openbmb/MiniCPM-o-4_5
- Referencia de licencia y atribución citada en la model card: fichero `NOTICE.md` del runtime CyberFly (sin URL pública en la información proporcionada)
- Componentes citados para atribución: MaleCNS/flybrain, FlyBody, FlyGym y MuJoCo (sin URL específica en la información proporcionada)
- Resultados de búsqueda web: no se han encontrado enlaces relevantes. Las búsquedas devuelven recursos sobre generación de modelos 3D y activos con nombre similar, sin relación con este checkpoint.
