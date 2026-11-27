# Tdamre/LFM3-1.7B-Humanizer-Pro

## Resumen

LFM3-1.7B-Humanizer-Pro es un adaptador PEFT (LoRA de rango 64) publicado por el usuario Tdamre sobre el modelo base LiquidAI/LFM3-1.7B-Base. Su proposito concreto es la reescritura de texto en ingles para reducir la probabilidad de que herramientas de deteccion de contenido generado por IA (GPTZero, Pangram) clasifiquen el resultado como artificial. No es un modelo de proposito general: es un ajuste fino orientado a una tarea de edicion de texto muy especifica, distribuido como adaptador y no como pesos completos.

El modelo hereda del LFM3-1.7B-Base de Liquid AI la arquitectura y el conocimiento linguistico, y anade un adaptador entrenado sobre pares de preferencia derivados del corpus HIP (Humanization of AI-generated text). El autor reporta que, sobre un conjunto fijo de 25 pasajes y con un decodificador concreto (dos pasadas de generacion, temperatura 1.0, top-p 0.95, semillas fijas 42 y 43), tanto GPTZero como Pangram mostraron una lectura "100% humana" sin cualificaciones en cinco reescrituras generadas, el mismo numero que el modelo padre.

La relevancia actual es doble: por un lado ilustra el estado de la tecnica en "humanizacion" de texto asistida por modelos abiertos; por otro, es un caso de estudio de las limitaciones de este enfoque, ya que el propio autor documenta perdida de fidelidad factual (44 de 85 detalles predeclarados retenidos frente a 47 del padre) y advierte de que los resultados dependen del dominio y del texto de origen, y que las lecturas de detectores no equivalen a una garantia de autoria humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 64) sobre transformer LiquidAI/LFM3-1.7B-Base; PEFT |
| Parametros totales | 1.700 millones (modelo base); el adaptador es un subconjunto de pesos LoRA, tamano de repo 0,2 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del LFM3-1.7B-Base) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors y se aplica sobre el base sin cuantizar segun el script incluido |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (adaptador); codigo del editor Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base LiquidAI/LFM3-1.7B-Base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LFM3-1.7B-Base, un transformer de 1.700 millones de parametros de Liquid AI (los detalles de atencion, capas y contexto no se detallan en la informacion disponible). El ajuste es un LoRA de rango 64 entrenado en dos fases: el modelo padre se entreno sobre 4.096 pares del corpus HIP (Humanization of AI-generated text), y esta continuacion utilizo 256 pares de preferencia emparejados por fuente, con el paso 64 seleccionado sobre un conjunto de validacion separado de 32 pares.

La innovacion metodologica destacable no esta en la arquitectura sino en el protocolo de evaluacion y decodificacion: el autor fija dos pasadas de generacion, temperatura 1.0, top-p 0.95 y semillas 42 y 43, y publica observaciones por pasaje (evidence.json) para que los resultados sean reproducibles. El repositorio incluye un script de decodificacion (humanize.py) que descarga el modelo base fijado por commit y aplica el adaptador, de modo que la configuracion medida se puede replicar exactamente. No se menciona RLHF, DPO clasico ni decodificacion especulativa; el entrenamiento se basa en pares de preferencia sobre el corpus HIP.

## Capacidades

- Reescritura de texto en ingles de 100 a 3.500 palabras por pasaje, orientada a reducir la senal de deteccion de IA.
- Generacion de texto condicionada por el adaptador, con dos pasadas de decodificacion en la configuracion medida.
- Edicion de estilo y reformulacion manteniendo (parcialmente) el contenido factual del original.
- No soporta tool calling ni function calling de forma declarada.
- No se documentan capacidades de agente, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada al ingles.
- No se declara modo "thinking" ni capacidades especiales adicionales.

## Casos de uso

- Reescritura de borradores propios para publicacion en blogs o boletines: el modelo reformula un texto de 100 a 3.500 palabras en una sola invocacion, util para autores que quieren variar el estilo de un texto que ellos mismos han generado con asistencia de IA.
- Normalizacion de estilo en corpus de investigacion: util para experimentos controlados sobre deteccion de texto generado, donde se necesita un reescritor reproducible con semillas y parametros fijados.
- Pruebas de robustez de detectores: generar reescrituras con el script incluido y medir como responden GPTZero, Pangram u otros servicios, documentando las lecturas por pasaje.
- Edicion de documentacion tecnica en ingles: reformular parrafos de manuales o notas de version manteniendo terminologia, con revision humana obligatoria de cifras y citas.
- Preparacion de material de formacion o divulgacion: suavizar el registro de textos generados previamente para que resulten mas naturales en contextos no academicos.
- Estudio de fidelidad factual en reescritura: el propio autor documenta la tasa de retencion de detalles (44 de 85), lo que convierte al modelo en una referencia para medir la tension entre naturalidad y preservacion de hechos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La evaluacion reportada es especifica de la tarea de humanizacion:

| Metrica | Resultado reportado |
|---|---|
| Pasajes evaluados (conjunto fijo) | 25 |
| Reescrituras con lectura "100% humana" en GPTZero y Pangram (5 generaciones) | 5 (igual que el modelo padre) |
| Pasajes nuevos dentro del conjunto (6) con doble aprobado conjunto | 2 (padre: 1) |
| Detalles factuales retenidos (85 predeclarados, revision de 17 salidas) | 44 (padre: 47) |
| Configuracion de decodificacion | 2 pasadas, temp. 1.0, top-p 0.95, semillas 42 y 43 |
| Paso de entrenamiento seleccionado | 64 (sobre validacion de 32 pares) |

Estos datos son lecturas de detectores sobre texto generado por el modelo, no una garantia de autoria humana ni una medida de calidad literaria.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; como referencia, un transformer de 1.700 millones de parametros en fp16 requiere del orden de 3,5-4 GB solo para pesos, mas overhead de activaciones y KV cache.
- GPU recomendadas: no especificadas por el autor; por tamano, cabe en GPUs consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070) en fp16, y en GPUs profesionales (A100, H100) para lotes grandes.
- Cabe en GPU consumer: si, previsiblemente en modelos con 8 GB o mas, aunque el autor no lo confirma.
- Opciones de despliegue: el repositorio incluye un script Python (humanize.py) con entorno Python 3.12 y CUDA; no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, y al ser un adaptador PEFT requiere cargar el base con transformers/PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Humanizer-Pro | 1,7 B (base) + LoRA r64 | no disponible | Humanizacion de texto en ingles | LFM Open License v1.0 | Hugging Face (adaptador) |
| LiquidAI/LFM3-1.7B-Base | 1,7 B | no disponible | Modelo base de proposito general | LFM Open License v1.0 | Hugging Face |
| Modelo padre (Humanizer sobre LFM3-1.7B) | 1,7 B (base) + LoRA | no disponible | Humanizacion de texto en ingles | no disponible | Referenciado en la model card, sin enlace directo |

No se dispone de datos de benchmarks comparables con otros humanizadores (por ejemplo, adaptadores sobre Llama o Mistral) en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de fidelidad factual: el autor reporta 44 de 85 detalles predeclarados retenidos frente a 47 del padre; hay que verificar cifras, citas y atribuciones de acciones antes de usar cualquier edicion.
- Los resultados dependen del dominio y del texto de origen; las lecturas de detectores no son estables entre servicios ni entre pasajes.
- Las lecturas "100% humana" son observaciones de GPTZero y Pangram sobre texto generado por el modelo, no una certificacion de autoria humana; el uso del modelo para eludir controles de integridad academica o editorial puede infringir normas institucionales.
- Solo ingles; no se documenta soporte multilingue.
- Licencia LFM Open License v1.0: revisar condiciones antes de uso comercial; el codigo del editor es Apache 2.0 pero el adaptador no.
- Requiere el modelo base fijado por commit concreto; cambios en el base pueden alterar el comportamiento medido.
- No se documentan sesgos especificos, pero al heredar el base y entrenarse sobre un corpus limitado (4.096 pares + 256 de preferencia) puede reproducir sesgos de estilo y de dominio del corpus HIP.
- Riesgo de alucinacion en la reescritura: al reformular, el modelo puede introducir o eliminar matices; se recomienda revision humana en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Tdamre/LFM3-1.7B-Humanizer-Pro
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base/tree/7bca5038823c0d0f14efe06439109354a10e014c
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/YixuanEvenXu/HIP-training-and-evaluation-data/tree/b574d982f6fabda9dec95dcb62dec3723ab685f5
- Paper HIP: https://arxiv.org/abs/2605.19516
- Evidencia por pasaje: evidence.json (incluido en el repositorio)
- Codigo del editor (Apache 2.0): humanize.py, requirements.txt, LICENSE, CODE-LICENSE y NOTICE en el repositorio
